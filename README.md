# Vocal Guide

A complete vocal technique reference covering 19 techniques across five categories: registers, styles, effects, embellishments, and dynamics.

**Live Demo:** https://jesperordrup.github.io/vocal-guide/

## Features

- **19 Vocal Techniques** — Comprehensive coverage from chest voice to messa di voce
- **5 Categories** — Registers, Styles, Effects, Embellishments, Dynamics
- **Bilingual** — English and Danish language support
- **Dark/Light Mode** — Theme toggle for comfortable reading
- **App Bar + Burger Menu** — Fixed top bar with hamburger menu for all controls
- **Share** — Copy URL, share via Email, Facebook, or Bluesky
- **Installable PWA** — Add to home screen for offline access
- **Mobile Accordion** — Responsive design with expandable technique cards
- **Prerequisite Links** — Navigate between related techniques
- **YouTube Integration** — Links to educational tutorials
- **Structured Data** — JSON-LD schema for SEO
- **Analytics** — Plausible privacy-friendly analytics

## Categories

| Category | Description | Techniques |
|----------|-------------|------------|
| Registers | Foundation voice modes | Chest Voice, Head Voice, Mixed Voice, Falsetto, Vocal Fry, Whistle |
| Styles | Characteristic vocal approaches | Belting, Twang, Breathy, Vowel Modification |
| Effects | Extended techniques | Grit/Rasp, Distortion, Growl, Cry/Sob |
| Embellishments | Melodic embellishments | Vibrato, Riffs & Runs, Trills, Bends |
| Dynamics | Volume control & expression | Breath Support, Messa di Voce, Straight Tone, Dynamic Contrast |

## Tech Stack

- Pure HTML, CSS, JavaScript (no frameworks)
- CSS Custom Properties for theming
- Responsive design with mobile-first accordion
- PWA with service worker for offline caching
- JSON-LD structured data for SEO

## Usage

Simply open `index.html` in a browser, or host on any static file server.

```bash
# Local development
python -m http.server 8000
# Then open http://localhost:8000
```

## Files

- `index.html` — Main application (single page)
- `styles.css` — All styles
- `manifest.json` — PWA manifest
- `sw.js` — Service worker for offline caching
- `icons/` — App icons (192px, 512px PNG + SVG)
- `sitemap.txt` — Sitemap for search engines
- `robots.txt` — Crawler instructions

## Author

**Jesper Ordrup**
Email: jesper@jesper.com

## License

MIT License
