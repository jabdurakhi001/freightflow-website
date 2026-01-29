// Minimal JS: year + mailto quote form
(() => {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  const form = document.getElementById("quoteForm");
  const status = document.getElementById("status");
  if (!form || !status) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const required = Array.from(form.querySelectorAll("[required]"));
    const missing = required.some((i) => !String(i.value || "").trim());
    if (missing) {
      status.textContent = "Please complete the required fields.";
      return;
    }

    const data = new FormData(form);
    const subject = encodeURIComponent("FreightFlow Quote Request");
    const body = encodeURIComponent(
      [
        `Name: ${data.get("name") || ""}`,
        `Email: ${data.get("email") || ""}`,
        `Pickup: ${data.get("pickup") || ""}`,
        `Delivery: ${data.get("delivery") || ""}`,
        `Details: ${data.get("details") || ""}`
      ].join("\n")
    );

    // Put your business email here when ready:
    const to = ""; // e.g., "dispatch@freightflow.com"

    status.textContent = "Opening your email client…";
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  });
})();
