// FreightFlow LLC — minimal JS: mobile nav, counters, form behavior

(function () {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Mobile nav
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close on link click
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Animated KPI counters (once)
  const counters = Array.from(document.querySelectorAll("[data-counter]"));
  let hasRun = false;

  const runCounters = () => {
    if (hasRun) return;
    hasRun = true;

    counters.forEach((el) => {
      const target = Number(el.getAttribute("data-counter")) || 0;
      const start = 0;
      const duration = 900;
      const t0 = performance.now();

      const step = (t) => {
        const p = Math.min(1, (t - t0) / duration);
        const val = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
        el.textContent = String(val);
        if (p < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    });
  };

  const hero = document.querySelector(".hero");
  if ("IntersectionObserver" in window && hero) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            runCounters();
            io.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(hero);
  } else {
    runCounters();
  }

  // Quote form: static demo behavior (no backend)
  const form = document.getElementById("quoteForm");
  const status = document.getElementById("formStatus");

  if (form && status) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Basic validation
      const required = Array.from(form.querySelectorAll("[required]"));
      const missing = required.some((i) => !String(i.value || "").trim());

      if (missing) {
        status.textContent = "Please complete the required fields (name, email, pickup, delivery).";
        return;
      }

      // Build a mailto as a simple "no-backend" workflow
      const data = new FormData(form);
      const subject = encodeURIComponent("FreightFlow Quote Request");
      const lines = [];
      for (const [k, v] of data.entries()) {
        lines.push(`${k}: ${String(v).trim()}`);
      }
      const body = encodeURIComponent(lines.join("\n"));

      status.textContent = "Opening your email client with the request details…";

      // Replace with your business email when ready:
      const to = ""; // e.g., "dispatch@yourdomain.com"
      const href = `mailto:${to}?subject=${subject}&body=${body}`;

      window.location.href = href;

      // Optional: reset
      setTimeout(() => form.reset(), 250);
    });
  }
})();
