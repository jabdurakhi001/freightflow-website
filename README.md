# FreightFlow LLC — Minimalist Website

## Deploy on GitHub Pages
1. Create a new GitHub repository (e.g., `freightflow-website`)
2. Upload these files/folders to the repo root:
   - `index.html`
   - `css/`
   - `js/`
   - `assets/`
3. GitHub → **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: `main` / `(root)`
4. Your site will publish on GitHub Pages.

## Local preview
Open `index.html` in your browser.

## Quote form behavior (no backend)
The form opens a `mailto:` draft. When you have a business email address, set it in `js/main.js`:
```js
const to = "dispatch@yourdomain.com";
```
