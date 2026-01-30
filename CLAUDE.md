# CLAUDE.md - AI Assistant Guide for FreightFlow Website

## Project Overview

**FreightFlow** is a static marketing website for a trucking and logistics company. Built with pure HTML, CSS, and JavaScript (no frameworks), it features responsive design, scroll animations, and an integrated shipment tracking system backed by Google Sheets.

**Live Site**: Deployed via GitHub Pages

## Tech Stack

- **HTML5** - Semantic markup with accessibility features
- **CSS3** - Custom properties, Grid, Flexbox, animations
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
├── script.js                # Interactive features
├── styles.css               # Global styling
├── google-apps-script.js    # Google Apps Script backend code
├── README.md                # Project documentation
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
--color-accent: #f97316;       /* Primary orange */
--color-dark: #1a202c;         /* Dark backgrounds */
--color-text: #2d3748;         /* Body text */
--color-text-muted: #64748b;   /* Secondary text */
--color-bg-light: #f5f7fa;     /* Light sections */
```

### Typography
- **Display**: Bebas Neue (bold, uppercase headings)
- **Headings**: Barlow Condensed (section titles)
- **Body**: Barlow (regular text)

### Spacing Scale
```css
xs: 0.5rem, sm: 1rem, md: 2rem, lg: 4rem, xl: 6rem, 2xl: 8rem
```

### Responsive Breakpoints
| Breakpoint | Target |
|------------|--------|
| 1200px | Large desktops |
| 992px | Desktops/tablets |
| 768px | Tablets |
| 480px | Mobile devices |

## Code Conventions

### JavaScript Patterns
- **Intersection Observer** for scroll-triggered animations
- **requestAnimationFrame** for smooth animations
- **Modular init functions**: `initNavigation()`, `initMobileMenu()`, `initCounterAnimation()`, etc.
- **Utility functions**: `showNotification()`, `animateCounter()`

### CSS Architecture
- CSS variables for theming at `:root` level
- Mobile-first responsive design
- BEM-like naming: `.service-card`, `.stat-number`, `.fleet-feature`
- Hardware-accelerated animations using `transform` and `opacity`

### HTML Standards
- Semantic HTML5 elements (`nav`, `header`, `section`, `article`)
- Proper heading hierarchy (h1 > h2 > h3)
- Accessibility: `aria-label`, `alt` text, keyboard navigation
- Inline SVG for graphics

## Key Implementation Details

### Animated Counters
- Triggered by Intersection Observer on scroll
- Uses `easeOutQuart` easing function
- 2-second animation duration

### Mobile Menu
- Hamburger toggle for screens < 768px
- Closes on link click or Escape key
- Sets `body.overflow-hidden` when open

### Tracking System Integration
- Queries Google Apps Script API endpoint
- Requires `GOOGLE_SHEETS_API` URL in tracking.html
- Displays: status, origin, destination, dates, driver info

### Parallax Effect
- Hero visual moves at 30% scroll speed
- Disabled on screens < 992px for performance

## Important Files to Know

### index.html
Main landing page with sections: Hero, Services (6 cards), Fleet, Tracking, About, Contact, Footer

### tracking.html
Standalone tracking page with search form, results display, and status indicators. Contains inline CSS/JS.

### script.js (~314 lines)
All interactive features: navigation, mobile menu, counters, scroll animations, smooth scroll, parallax, notifications

### styles.css (~1,331 lines)
Complete styling with CSS variables, responsive breakpoints, and animations

### google-apps-script.js
Backend code to deploy in Google Apps Script. Contains `doGet(e)` REST endpoint for shipment lookup.

## Making Changes

### When Modifying Colors
Update CSS variables in `:root` section of styles.css - changes propagate automatically

### When Adding New Sections
1. Follow existing semantic HTML structure
2. Add corresponding styles in styles.css
3. Add `.scroll-animate` class for scroll-triggered animations
4. Test all responsive breakpoints

### When Modifying Animations
- Use `transform` and `opacity` for performance
- Maintain 60fps by using `requestAnimationFrame`
- Test with Intersection Observer thresholds

### When Updating Tracking
1. Modify Google Apps Script if schema changes
2. Redeploy web app and get new URL
3. Update `GOOGLE_SHEETS_API` in tracking.html

## Pre-Commit Checklist

- [ ] Test all responsive breakpoints (1200px, 992px, 768px, 480px)
- [ ] Verify mobile menu keyboard navigation works
- [ ] Check color contrast meets WCAG AA standards
- [ ] Ensure all images have alt text
- [ ] Validate scroll animations trigger correctly
- [ ] Test tracking system with sample data
- [ ] No API secrets or sensitive data committed

## Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |

Required APIs: IntersectionObserver, requestAnimationFrame, Fetch, CSS Grid

## External Dependencies

- **Google Fonts**: Bebas Neue, Barlow, Barlow Condensed (loaded via CDN)
- **Google Sheets API**: For shipment tracking data
- No npm packages or build dependencies

## Testing

No automated testing framework. Manual testing:
1. Test all pages in supported browsers
2. Test responsive design at all breakpoints
3. Use `testLookup()` function in google-apps-script.js for tracking
4. Check accessibility with browser dev tools

## Common Tasks

### Add a New Service Card
1. Copy existing `.service-card` markup in index.html
2. Update icon, title, and description
3. Styles already exist - no CSS changes needed

### Change Primary Accent Color
```css
/* In styles.css :root */
--color-accent: #your-new-color;
```

### Add New Counter Stat
1. Add markup with `.stat-number` class
2. Include `data-target="value"` attribute
3. Counter animation hooks automatically

### Update Company Contact Info
Edit the contact section in index.html and footer links

## Notes for AI Assistants

1. **No build step** - Changes are immediate, just refresh browser
2. **CSS variables** - Always use existing variables for colors/spacing
3. **Mobile-first** - Write base styles for mobile, then add breakpoint overrides
4. **Performance** - Use `transform`/`opacity` for animations, avoid layout thrashing
5. **Accessibility** - Maintain semantic HTML and ARIA attributes
6. **Keep it simple** - This is intentionally a vanilla project, avoid adding frameworks
