# New Leaf Software: website

A static, single-page site in plain HTML, CSS and JS. There's no build step.

## Preview locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Things to fill in before launch

| What | Where |
|---|---|
| About text (founder name, background, years) | `index.html`, `#about` section, the `[bracketed]` text |
| Founder photo | `index.html`, swap `.photo-placeholder` for an `<img>` (see the comment) |
| Testimonials | `index.html`, `#testimonials` section, the `[bracketed]` text and initials |
| Contact form | Create a free form at https://formspree.io and replace `YOUR_FORM_ID` in `index.html`. Until then, the form opens the visitor's email app instead |
| Email address | Search for `hello@newleafsoftware.com` in `index.html` and `script.js` |
| Domain | Uncomment and set `og:url` in the `<head>` once you have a domain |
| Prices | `#founding` and `#pricing` sections |

## Hosting (free options)

- **Cloudflare Pages / Netlify:** connect this repo, with no build command and `/` as the output directory.
- **GitHub Pages:** go to repo Settings, then Pages, and deploy from the `main` branch root.

Then point your domain at the host. HTTPS is set up automatically on all three.

## Re-theming

All colours are CSS variables at the top of `styles.css`.
