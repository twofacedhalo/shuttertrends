# Wider desktop reel validation

Tested at the requested browser widths under /shuttertrends/.

| Viewport | Reel width | Right margin | Hero/reel top | Page overflow |
| --- | --- | --- | --- | --- |
| 1920px | 720px | 38.4px | 117px / 117px | None |
| 1440px | 662.4px | 28.8px | 117px / 117px | None |
| 1024px | 471px | 24px | 117px / 117px | None |
| 390px | 331px compact viewport | 22px | Existing stacked mobile layout | None |

The previous desktop reel was approximately 533px wide at 1440px and 1920px. The new widths are approximately 24% and 35% wider respectively. Headline font sizes remain 76px at 1920/1440, 54.272px at 1024, and 46.8px at 390. The wide-screen text column remains 714px; smaller desktop text has room for the existing headline, description, and buttons.

Photographs retain object-fit:contain and their natural ratios (subpixel rounding only). Sprockets, markings, vintage/color reveal, sticky placement, and clipped scrollbar-free viewport are preserved. Desktop autoplay starts after load using the unchanged vertical oscillator; mobile retains manual compact browsing. Responsive srcset sizes now reflect the wider desktop reel.

Reusable controller/data checks: node tools/validate_homepage.cjs. JavaScript syntax and git diff whitespace checks pass. No original image files changed.
