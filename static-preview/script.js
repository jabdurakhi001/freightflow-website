// ===================================
// FREIGHTFLOW - Interactive Scripts
// Theme Toggle, Scroll Animations, Navigation
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initNavigation();
    initActiveNavLinks();
    initMobileMenu();
    initScrollAnimations();
    initSmoothScroll();

    // Check for form submission success
    if (window.location.search.includes('submitted=true')) {
        showNotification('Thank you! Your message has been sent. We\'ll contact you within 24 hours.', 'success');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// ---- Dark/Light Theme Toggle ----
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    // Restore saved preference or respect system preference
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

    toggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// ---- Navigation scroll effect ----
function initNavigation() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.pageYOffset > 50);
    });
}

// ---- Active nav link highlighting ----
function initActiveNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    // Switch active class on click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Update active link on scroll based on which section is in view
    const sections = [];
    navLinks.forEach(link => {
        const id = link.getAttribute('href');
        if (id && id !== '#') {
            const section = document.querySelector(id);
            if (section) sections.push({ el: section, link });
        }
    });

    if (sections.length === 0) return;

    window.addEventListener('scroll', () => {
        const scrollPos = window.pageYOffset + 120; // offset for fixed nav

        let current = null;
        for (const { el, link } of sections) {
            if (el.offsetTop <= scrollPos) {
                current = link;
            }
        }

        if (current) {
            navLinks.forEach(l => l.classList.remove('active'));
            current.classList.add('active');
        }
    });
}

// ---- Mobile menu toggle ----
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            menuBtn.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ---- Scroll-triggered animations ----
function initScrollAnimations() {
    const targets = document.querySelectorAll(
        '.service-card, .info-card, .step, .compliance-item, .fleet-stat, .perk, .comparison-item, .trust-item'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    targets.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Section headers
    const headers = document.querySelectorAll('.section-header, .section-title');
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                headerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    headers.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        headerObserver.observe(el);
    });
}

// ---- Smooth scroll for anchor links ----
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });
}

// ---- Notification system ----
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

    const colors = {
        success: { bg: '#1a472a', border: '#2d7a4a' },
        error: { bg: '#4a1a1a', border: '#7a2d2d' },
        info: { bg: '#1a1a4a', border: '#2d2d7a' }
    };
    const c = colors[type] || colors.info;

    Object.assign(notification.style, {
        position: 'fixed', bottom: '20px', right: '20px',
        padding: '1rem 1.5rem',
        background: c.bg, border: `1px solid ${c.border}`,
        color: '#fff', fontFamily: "'Inter', sans-serif",
        fontSize: '0.9rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        zIndex: '10000', borderRadius: '0.5rem',
        animation: 'slideIn 0.3s ease', maxWidth: '400px'
    });

    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
            .notification-close { background: none; border: none; color: inherit; font-size: 1.5rem; cursor: pointer; opacity: 0.7; transition: opacity 0.2s; }
            .notification-close:hover { opacity: 1; }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    const dismiss = () => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    };

    notification.querySelector('.notification-close').addEventListener('click', dismiss);
    setTimeout(() => { if (notification.parentNode) dismiss(); }, 5000);
}
