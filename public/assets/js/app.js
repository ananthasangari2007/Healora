const currentPage = document.body.dataset.page || "home";
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");
const root = document.body;

const savedTheme = localStorage.getItem("healora-theme");
const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const activeTheme = savedTheme || (preferredDark ? "dark" : "light");

const applyTheme = (theme) => {
  root.dataset.theme = theme;
  if (themeLabel) {
    themeLabel.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  }
  if (themeToggle) {
    const icon = themeToggle.querySelector("i");
    if (icon) {
      icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
  }
};

applyTheme(activeTheme);

document.querySelectorAll("[data-nav-link]").forEach((link) => {
  if (link.dataset.navLink === currentPage) {
    link.classList.add("is-active");
  }
});

if (nav && navToggle) {
  const syncNavState = () => {
    const expanded = nav.classList.contains("is-open");
    navToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  };

  navToggle.setAttribute("aria-expanded", "false");

  navToggle.addEventListener("click", () => {
    nav.classList.toggle("is-open");
    syncNavState();
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      syncNavState();
    });
  });
}

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("healora-theme", nextTheme);
  applyTheme(nextTheme);
});
