# Ali Umirov — Portfolio

Personal portfolio of **Ali Umirov**, Product Designer (Fintech & E-commerce).

🔗 **Live:** https://aliumirovux.github.io

---

## About

A single-page, responsive portfolio built as a self-contained static site and
hosted on **GitHub Pages**. It presents work, impact metrics, experience, and
recommendations, with a trilingual interface (**English · Русский · Oʻzbek**)
and a dark theme.

## Features

- **Trilingual UI** — instant EN / RU / UZ switching, no reload
- **Auto-updating experience** — job durations and total years of experience are
  calculated live from start dates (no manual editing needed)
- **Case studies** — expandable project modals with process and outcomes
- **Recommendations** — real recommendations from colleagues
- **Responsive** — desktop, tablet and mobile
- **Accessible** — semantic HTML, ARIA labels, keyboard-friendly navigation
- **SEO & social ready** — Open Graph / Twitter cards and JSON-LD structured data

## Tech

- Plain **HTML, CSS, JavaScript** — no framework, no build step
- Google-quality typography via self-hosted **Geist** font
- Deployed on **GitHub Pages**

## Project structure

```
.
├── index.html              # markup + styles + script
├── og-image.png            # social share preview card (1200×630)
├── assets/
│   ├── fonts/              # Geist font (400/500/600/700)
│   └── img/
│       ├── ali.webp        # profile photo
│       ├── favicon.png
│       ├── logo-dark.webp / logo-light.webp
│       ├── team/          # recommendation avatars
│       ├── tools/         # skill / tool icons
│       └── work/          # case-study cover shots
├── README.md
├── LICENSE
└── .gitignore
```

> Assets were extracted from inline base64 into `assets/` so the HTML stays
> readable and the browser can cache images and fonts separately.
> A future step may also split CSS into `css/` and JS into `js/`.

## Local preview

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Pushing to the `main` branch of `aliumirovux/aliumirovux.github.io`
automatically publishes to https://aliumirovux.github.io via GitHub Pages.

## Contact

- LinkedIn — https://www.linkedin.com/in/aliumirov/
- Telegram — https://t.me/aliumirov
- Dribbble — https://dribbble.com/aliumirov
- Email — aliumirov.me@gmail.com

## License

Code is released under the [MIT License](LICENSE).
Personal content, copy, images and brand assets are © Ali Umirov and are not
covered by the MIT license.
