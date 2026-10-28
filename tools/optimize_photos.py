"""Generate only portfolio image variants consumed by the static website.

Usage: python tools/optimize_photos.py [--originals-dir PATH] [--report-dir PATH]
Requires Pillow and Node.js. Never modifies or deletes a source photograph.
"""
import argparse
import hashlib
import io
import json
import re
import subprocess
from pathlib import Path
from PIL import Image, ImageCms, ImageOps, IptcImagePlugin, features

ROOT = Path(__file__).resolve().parents[1]
VERSION = 'srgb-v1-q85'


def collections():
    # Read the same JavaScript manifest used by the browser; no regex parsing of JS.
    script = """const fs=require('fs'),vm=require('vm');const box={window:{}};
    vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),box,{timeout:1000});
    process.stdout.write(JSON.stringify(box.window.shutterTrendsCollections));"""
    result = subprocess.run(['node', '-e', script, str(ROOT / 'assets/photography/photos.js')],
                            check=True, capture_output=True, text=True, encoding='utf-8')
    data = json.loads(result.stdout)
    if not isinstance(data, list):
        raise ValueError('Photo manifest must contain a collection list')
    return data


def rights_metadata(image):
    """Copy only copyright and creator, never GPS, timestamps or camera metadata."""
    original = image.getexif()
    result = Image.Exif()
    for tag in (33432, 315):  # Copyright, Artist
        if original.get(tag):
            result[tag] = original[tag]
    iptc = IptcImagePlugin.getiptcinfo(image) or {}
    for tag, key in ((33432, (2, 116)), (315, (2, 80))):
        value = iptc.get(key)
        if isinstance(value, list):
            value = value[0] if value else None
        if value and tag not in result:
            result[tag] = value.decode('utf-8', errors='replace') if isinstance(value, bytes) else str(value)
    # Preserve standard XMP rights/creator when these are absent from EXIF/IPTC.
    xmp = image.info.get('xmp')
    if xmp:
        import xml.etree.ElementTree as ET
        try:
            xml = ET.fromstring(xmp)
            for tag, field in ((33432, 'rights'), (315, 'creator')):
                values = [''.join(item.itertext()).strip() for item in xml.findall(
                    './/{http://purl.org/dc/elements/1.1/}' + field)]
                if tag not in result and any(values):
                    result[tag] = '; '.join(filter(None, values))
        except ET.ParseError:
            raise ValueError('Invalid XMP; repair metadata before optimizing to preserve rights safely')
    return result


def srgb(image, profile):
    destination = ImageCms.createProfile('sRGB')
    icc = ImageCms.ImageCmsProfile(destination).tobytes()
    alpha = image.getchannel('A') if 'A' in image.getbands() else None
    if profile:
        source = ImageCms.ImageCmsProfile(io.BytesIO(profile))
        converted = ImageCms.profileToProfile(image.convert('RGB') if alpha else image,
                                             source, destination, outputMode='RGB')
        note = 'Embedded ICC converted to sRGB'
    else:
        if image.mode not in ('RGB', 'RGBA', 'L', 'LA', 'P'):
            raise ValueError('Non-RGB source needs an embedded ICC profile for reliable sRGB conversion')
        converted = image.convert('RGB')
        note = 'Untagged RGB/grayscale assumed sRGB'
    if alpha is not None:
        converted.putalpha(alpha)
    return converted, icc, note


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    local_config = ROOT / 'tools/photo-sources.local.json'
    local = json.loads(local_config.read_text(encoding='utf-8')) if local_config.exists() else {}
    parser.add_argument('--originals-dir', type=Path, default=ROOT / 'assets/images')
    parser.add_argument('--imports-dir', type=Path, default=local.get('imports_dir'),
                        help='Read missing collection originals by filename from a flat, private import folder')
    parser.add_argument('--report-dir', type=Path, default=ROOT / 'reports')
    args = parser.parse_args()
    original_root = args.originals_dir.resolve()
    import_root = args.imports_dir.resolve() if args.imports_dir else None
    output = ROOT / 'assets/images/optimized'
    output.mkdir(parents=True, exist_ok=True)
    jobs = {}
    for collection in collections():
        if collection.get('published') is False:
            continue
        folder = collection.get('folder', '')
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', folder):
            raise ValueError(f'Unsafe collection folder: {folder}')
        for photo in collection.get('photos', []):
            if photo.get('published') is False:
                continue
            name = photo.get('file', '')
            if not re.fullmatch(r'[a-zA-Z0-9][a-zA-Z0-9._-]*', name):
                raise ValueError(f'Unsafe filename: {name}')
            key = folder + '/' + name
            job = jobs.setdefault(key, {'showcase': False})
            job['showcase'] |= photo.get('showcase') is not False
    manifest, rows = {}, []
    webp = features.check('webp')
    for key, job in jobs.items():
        source = original_root / key
        if not source.is_file() and import_root:
            source = import_root / Path(key).name
        source_bytes = source.read_bytes()  # Missing sources fail before publishing a manifest.
        digest = hashlib.sha256(source_bytes).hexdigest()
        with Image.open(io.BytesIO(source_bytes)) as original:
            dimensions = original.size
            rights = rights_metadata(original)
            profile = original.info.get('icc_profile')
            oriented = ImageOps.exif_transpose(original)
            image, icc, color_note = srgb(oriented, profile)
        # Full collection links use a large view capped at 2400; no separate lightbox UI.
        limits = {'thumbnail': 600, 'gallery': 1600, 'viewer': 2400}
        if job['showcase']:
            limits['showcase'] = 2000
        variants, reused, written = {}, {}, []
        for role, limit in limits.items():
            resized = image.copy()
            resized.thumbnail((limit, limit), Image.Resampling.LANCZOS)
            size = resized.size
            if size not in reused:
                suffix = 'webp' if webp else 'jpg'
                filename = f'{digest[:20]}-{VERSION}-{size[0]}x{size[1]}.{suffix}'
                target = output / filename
                if not target.exists():
                    # Clear inherited metadata; explicitly add only sRGB and copyright/creator.
                    resized.info.clear()
                    options = {'quality': 85, 'icc_profile': icc}
                    if rights:
                        options['exif'] = rights.tobytes()
                    if webp:
                        options['method'] = 6
                    else:
                        if resized.mode == 'RGBA':
                            background = Image.new('RGB', resized.size, (9, 10, 13))
                            background.paste(resized, mask=resized.getchannel('A'))
                            resized = background
                        options.update(optimize=True, progressive=True)
                    # Atomic writes prevent an interrupted run from leaving a partial image.
                    temporary = target.with_suffix(target.suffix + '.tmp')
                    resized.save(temporary, format='WEBP' if webp else 'JPEG', **options)
                    temporary.replace(target)
                reused[size] = {'file': filename, 'width': size[0], 'height': size[1], 'bytes': target.stat().st_size}
                written.append(reused[size])
            variants[role] = reused[size]
        manifest[key] = variants
        for variant in written:
            roles = [role for role, item in variants.items() if item['file'] == variant['file']]
            rows.append({'source': key, 'sha256': digest, 'original_width': dimensions[0],
                         'original_height': dimensions[1], 'oriented_width': image.width,
                         'oriented_height': image.height, 'original_bytes': len(source_bytes),
                         'roles': roles, **variant, 'savings_percent': round(100 * (1 - variant['bytes'] / len(source_bytes)), 2),
                         'color': color_note, 'copyright_retained': bool(rights.get(33432)),
                         'creator_retained': bool(rights.get(315))})
        if hashlib.sha256(source.read_bytes()).hexdigest() != digest:
            raise RuntimeError('Source changed during optimization: ' + key)
    generated = ROOT / 'assets/photography/optimized.js'
    temporary = generated.with_suffix('.tmp')
    temporary.write_text('// Generated by tools/optimize_photos.py. Do not edit.\nwindow.shutterTrendsOptimized = '
                         + json.dumps(manifest, indent=2) + ';\n', encoding='utf-8')
    temporary.replace(generated)
    args.report_dir.mkdir(parents=True, exist_ok=True)
    (args.report_dir / 'photo-optimization.json').write_text(json.dumps(rows, indent=2), encoding='utf-8')
    lines = ['# Photography optimization report', '',
             'WebP quality 85 (method 6); JPEG fallback quality 85, optimize/progressive enabled. No upscaling or sharpening.',
             'EXIF orientation applied; embedded profiles converted to sRGB. Only copyright/creator metadata retained.',
             'Savings compare each derivative with its source, not the total repository size. Originals are retained.', '',
             '| Source | Original dimensions | Original bytes | Role(s) | Optimized dimensions | Optimized bytes | Savings |',
             '| --- | --- | ---: | --- | --- | ---: | ---: |']
    for row in rows:
        lines.append(f"| {row['source']} | {row['original_width']} × {row['original_height']} | {row['original_bytes']:,} | {', '.join(row['roles'])} | {row['width']} × {row['height']} | {row['bytes']:,} | {row['savings_percent']}% |")
    lines.extend(['', '## Source verification and color handling', ''])
    for key in jobs:
        matching = [r for r in rows if r['source'] == key]
        if matching:
            row = matching[0]
            lines.append(f"- `{key}`: {row['color']}. SHA-256 unchanged: `{row['sha256']}`. Copyright present/retained: {row['copyright_retained']}; creator present/retained: {row['creator_retained']}.")
    lines.extend(['', 'Equal-size roles share a file. No originals were moved or deleted. Old generated outputs are never automatically deleted.'])
    (args.report_dir / 'photo-optimization.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'Optimized {len(jobs)} source photo(s); {len({r["file"] for r in rows})} unique outputs. Report: {args.report_dir}')


if __name__ == '__main__':
    main()
