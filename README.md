# FreightFlow - Trucking & Logistics Website

![FreightFlow Banner](https://img.shields.io/badge/FreightFlow-Logistics%20That%20Move%20Mountains-ff4d00?style=for-the-badge&logo=truck&logoColor=white)

A bold, industrial-aesthetic website for FreightFlow, a nationwide trucking and logistics company. Built with pure HTML, CSS, and JavaScript—no frameworks required.

## 🚚 Live Demo

[View Live Site](#) *(Add your deployment URL here)*

## ✨ Features

- **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- **Modern Industrial Design** - Bold typography, dark theme, and striking orange accents
- **Smooth Animations** - CSS animations and JavaScript-powered interactions
- **Interactive Elements** - Animated counters, scroll reveals, and form validation
- **Performance Optimized** - No framework dependencies, minimal HTTP requests
- **Accessible** - Semantic HTML and keyboard navigation support

## 🎨 Design Philosophy

The design follows an **industrial/utilitarian aesthetic** that reflects the power and reliability of the trucking industry:

- **Color Palette**: Deep blacks (#0a0a0a) with vibrant safety orange (#ff4d00)
- **Typography**: Bebas Neue for display, Barlow for body text
- **Visual Elements**: Subtle grain texture, geometric truck illustrations, animated route maps
- **Interaction**: Hover effects, scroll-triggered animations, smooth transitions

## 📁 Project Structure

```
freightflow-website/
├── index.html      # Main HTML structure
├── styles.css      # Complete styling with CSS variables
├── script.js       # Interactivity and animations
└── README.md       # Project documentation
```

## 🚀 Getting Started

### Option 1: Direct Use
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/freightflow-website.git
   ```
2. Open `index.html` in your browser

### Option 2: Local Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve
```

## 🛠️ Customization

### Changing Colors
Edit the CSS variables in `styles.css`:

```css
:root {
    --color-accent: #ff4d00;        /* Primary accent */
    --color-accent-dark: #cc3d00;   /* Darker accent */
    --color-accent-light: #ff6a2b;  /* Lighter accent */
}
```

### Updating Content
All content is in `index.html`. Key sections:
- **Hero**: Company tagline and stats
- **Services**: Six service cards
- **Fleet**: Vehicle information
- **Tracking**: Shipment tracking form
- **About**: Company history and values
- **Contact**: Contact form and information

### Adding Images
Replace the SVG placeholders with real images:
```html
<img src="path/to/your-image.jpg" alt="Fleet">
```

## 📱 Responsive Breakpoints

| Breakpoint | Description |
|------------|-------------|
| `> 1200px` | Full desktop layout |
| `992px`    | Stacked sections |
| `768px`    | Mobile navigation |
| `480px`    | Compact mobile |

## ⚡ Performance

- **No JavaScript Frameworks** - Vanilla JS only
- **Minimal Dependencies** - Only Google Fonts
- **CSS-First Animations** - Hardware-accelerated
- **Lazy Loading Ready** - Add `loading="lazy"` to images

## 🔧 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

For questions or customization requests, reach out through:
- GitHub Issues
- Email: your-email@example.com

---

**Built with ❤️ for the trucking industry**

*Note: This is a template website. Replace placeholder content with your actual company information before deployment.*
