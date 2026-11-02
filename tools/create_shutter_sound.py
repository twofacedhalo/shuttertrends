"""Create the project's original two-stage mechanical shutter sound (no samples)."""
import math
import random
import struct
import wave
from pathlib import Path

rate, duration = 44100, 0.27
rng = random.Random(35)
samples, previous, low = [], 0.0, 0.0
for i in range(round(rate * duration)):
    t = i / rate
    noise = rng.uniform(-1, 1)
    low = .72 * low + .28 * noise
    high = noise - previous
    previous = noise
    value = 0.0
    for start, strength, decay in [(0.006, .62, .021), (.079, 1.0, .027), (.137, .28, .015)]:
        u = t - start
        if u >= 0:
            env = (1 - math.exp(-u / .0008)) * math.exp(-u / decay)
            metal = .14 * math.sin(2 * math.pi * 2370 * u) + .08 * math.sin(2 * math.pi * 3260 * u)
            value += strength * env * (.42 * high + .44 * low + metal)
    if t >= .012:
        u = t - .012
        value += .19 * math.sin(2 * math.pi * 170 * u) * math.exp(-u / .035)
    value *= min(1, max(0, (duration - t) / .025))
    samples.append(value)
peak = max(abs(v) for v in samples)
output = Path(__file__).resolve().parents[1] / 'assets/audio/camera-shutter.wav'
with wave.open(str(output), 'wb') as audio:
    audio.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
    audio.writeframes(b''.join(struct.pack('<h', round(v / peak * .82 * 32767)) for v in samples))
print(f'{output.name}: {duration}s, mono 44.1kHz PCM16, {output.stat().st_size} bytes')
