# CLAUDE.md - AI Assistant Guide for FreightFlow Website

## Project Overview

**FreightFlow** is a static marketing website for a trucking and logistics company. Built with pure HTML, CSS, and JavaScript (no frameworks), it features responsive design, scroll animations, dark/light theme toggle, and an integrated shipment tracking system backed by Google Sheets.

**Live Site**: Deployed via GitHub Pages

## Tech Stack

- **HTML5** - Semantic markup with accessibility features
- **CSS3** - Custom properties, Grid, Flexbox, animations, dark mode
- **Vanilla JavaScript (ES6+)** - No frameworks
- **Google Apps Script** - Backend API for shipment tracking
- **Google Sheets** - Database for shipment data
- **GitHub Pages** - Static hosting with automated deployment

## Directory Structure

```
freightflow-website/
├── .github/workflows/
│   └── static.yml           # GitHub Pages deployment workflow
├── index.html               # Main landing page
├── tracking.html            # Shipment tracking page
├── script.js                # Interactive features (theme, animations, nav)
├── styles.css               # Global styling with CSS variables
├── google-apps-script.js    # Google Apps Script backend code
├── README.md                # Project documentation
├── CLAUDE.md                # This file
└── TRACKING-SETUP-GUIDE.md  # Tracking system setup instructions
```

## Development Commands

```bash
# Start local development server (choose one)
python -m http.server 8000
npx serve
# Or open index.html directly in browser

# No build step required - direct file serving
```

## Deployment

- **Automatic**: Push to `main` branch triggers GitHub Actions workflow
- **Manual**: Run workflow from GitHub Actions tab
- No build/transpilation step - files deployed as-is

## Design System

### Colors (CSS Variables)
```css
--color-primary: #0A1128;         /* Dark navy */
--color-secondary: #FF5A1F;       /* Vibrant orange */
--color-tertiary: #0EA5E9;        /* Sky blue */
--color-surface: #FFFFFF;          /* Light backgrounds */
--color-on-surface: #0F172A;       /* Text on light */
--color-on-surface-variant: #475569; /* Secondary text */
```

### Dark Mode
Toggle via `.dark` class on `<html>`. Overrides surface colors:
```css
.dark --color-surface: #020617;
.dark --color-on-surface: #F8FAFC;
```

### Typography
- **Font Family**: Inter (weights: 300, 400, 600, 700, 800, 900)
- Loaded from Google Fonts CDN

### Responsive Breakpoints
| Breakpoint | Target |
|------------|--------|
| 1200px | Large desktops |
| 1024px | Desktop |
| 768px | Tablets |
| < 768px | Mobile devices |

## Page Sections (index.html)

1. **Navigation** - Fixed top bar with theme toggle, mobile hamburger
2. **Hero** - Full-viewport with background image, CTAs
3. **Trust Strip** - 4 key stats (48 States, Midwest Hub, Fleet, ISO)
4. **Compliance** - USDOT/MC credentials, insurance, safety
5. **Solutions** - 4 service cards (FTL, Dedicated, Regional, Logistics)
6. **AI Systems** - Technology differentiators, feature list
7. **How It Works** - 4-step process flow
8. **Comparison** - FreightFlow vs Other Carriers
9. **Fleet** - Equipment showcase with stats
10. **Recruitment** - Driver recruitment CTA
11. **Lead Gen CTA** - Final conversion section
12. **Footer** - Links, contact info, USDOT/MC, social

## Code Conventions

### JavaScript Patterns
- **Theme Toggle**: localStorage persistence, system preference detection
- **Intersection Observer** for scroll-triggered animations
- **Modular init functions**: `initThemeToggle()`, `initMobileMenu()`, etc.
- **Smooth scroll** with header offset compensation

### CSS Architecture
- CSS custom properties for theming at `:root` level
- Dark mode via `.dark` class overrides
- Mobile-first responsive design
- BEM-like naming: `.service-card`, `.fleet-stat`, `.comparison-item`
- Hardware-accelerated animations using `transform` and `opacity`
- `kinetic-strip` utility for orange left-border accent

### HTML Standards
- Semantic HTML5 elements (`nav`, `header`, `section`, `footer`)
- Inline SVGs for all icons (Lucide icon paths)
- Accessibility: `aria-label`, `alt` text, keyboard navigation
- `loading="lazy"` on non-critical images

## Making Changes

### When Modifying Colors
Update CSS variables in `:root` and `.dark` sections of styles.css

### When Adding New Sections
1. Follow existing semantic HTML structure
2. Add corresponding styles in styles.css
3. Elements with matching class names auto-animate via IntersectionObserver
4. Test all responsive breakpoints

### When Updating Tracking
1. Modify Google Apps Script if schema changes
2. Redeploy web app and get new URL
3. Update `GOOGLE_SHEETS_API` in tracking.html

## Pre-Commit Checklist

- [ ] Test all responsive breakpoints (1200px, 1024px, 768px, mobile)
- [ ] Verify dark/light theme toggle works
- [ ] Check mobile menu opens/closes correctly
- [ ] Verify scroll animations trigger correctly
- [ ] Test tracking system with sample data
- [ ] Ensure all images have alt text
- [ ] No API secrets or sensitive data committed

## External Dependencies

- **Google Fonts**: Inter (loaded via CDN)
- **Google Sheets API**: For shipment tracking data
- No npm packages or build dependencies
