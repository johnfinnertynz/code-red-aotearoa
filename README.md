# Code Red Aotearoa

A static campaign website about pressure and failure points in New Zealand healthcare, with a focus on mental health access, nurse staffing, aged care, clinical workforce pressure, justice-system overflow, and private-contracting risks.

## Open Locally

Open `index.html` in a browser, or serve the folder with:

```powershell
python -m http.server 4180 -b 127.0.0.1
```

Then visit `http://127.0.0.1:4180/`.

## Live Site

GitHub Pages serves the site from the `gh-pages` branch:

https://johnfinnertynz.github.io/code-red-aotearoa/

After committing changes on `main`, publish them with:

```powershell
git push origin main:gh-pages
```

## Campaign Toolkit

The CTA links to:

- `toolkit/evidence-pack.html`
- `toolkit/mp-email-template.html`
- `toolkit/local-action-alerts.html`

## Search And Entity Notes

- `index.html` includes canonical, Open Graph, Twitter Card, and JSON-LD WebSite/WebPage/Person metadata.
- Toolkit pages include canonical URLs, descriptions, author metadata, and creator footer links.
- `robots.txt` points crawlers to `sitemap.xml`.
- Creator links point to `https://www.johnfinnerty.co.nz/` and `https://finnerty.me/`.

## Notes

The address-to-MP lookup geocodes a New Zealand street address, checks it against a public general-electorate boundary service, and includes a Vote NZ verification link for edge cases.
