# Momidev Coffee House — Starter Website

A lightweight, SEO-friendly static site you can deploy on **Vercel**.

## Structure
```
momidev-coffee-house-site/
  |- index.html
  |- about.html
  |- products.html
  |- contact.html
  |- 404.html
  |- vercel.json
  |- robots.txt
  |- sitemap.xml
  |- css/styles.css
  |- js/main.js
  |- js/products.js
  |- data/products.json
  |- images/
      |- hero.png
      |- favicon.png
      |- products/
          |- espresso_placeholder.png
          |- coldbrew_placeholder.png
          |- filter_placeholder.png
```

## Quick Start
1. **Edit content** in the `.html` files (text, headings, etc.).
2. **Replace placeholders** in `/data/products.json` and add your actual images in `/images/products`.
3. Push this folder to a GitHub repository.
4. On **Vercel** → *Add New* → *Project* → Import your repo → **Deploy**.

## Clean URLs on Vercel
`vercel.json` is configured with `cleanUrls: true`, so your pages work without `.html`:
- `/about` instead of `/about.html`

## SEO
- Proper `<title>`, `<meta name="description">`, Open Graph tags
- `sitemap.xml` + `robots.txt`
- JSON-LD schema for LocalBusiness on the home page

## Customize
- Update brand colors in `/css/styles.css`
- Update contact info in `contact.html` and the footer
- Replace the Google Maps embed with your exact location

---
Made with ♥ for Momidev Coffee House.
