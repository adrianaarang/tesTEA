/* theme-toggle.js — Alternar modo claro/oscuro, con preferencia guardada */

function getPreferredTheme() {
  const saved = localStorage.getItem("testtea-theme");
  if (saved === "light" || saved === "dark") return saved;

  // Si no hay preferencia guardada, respetamos la del sistema operativo
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
    );
  }
}

function initThemeToggle() {
  const theme = getPreferredTheme();
  applyTheme(theme);

  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("testtea-theme", next);
    applyTheme(next);
  });
}

export { initThemeToggle };
