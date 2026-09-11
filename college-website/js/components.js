function getSiteBasePath() {
  return window.location.pathname.includes("/pages/") ? "../" : "";
}

function getNavigationItems(basePath) {
  return [
    { label: "Home", href: `${basePath}index.html` },
    { label: "About", href: `${basePath}pages/about.html` },
    { label: "Academics", href: `${basePath}pages/academics.html` },
    { label: "Admissions", href: `${basePath}pages/admissions.html` },
    { label: "Student Life", href: `${basePath}pages/student-life.html` },
    { label: "News & Events", href: `${basePath}pages/news.html` },
    { label: "Campus", href: `${basePath}pages/campus.html` },
    { label: "Contact", href: `${basePath}pages/contact.html` }
  ];
}

function createNavigationLinks(basePath, currentPage) {
  return getNavigationItems(basePath)
    .map((item) => {
      const itemPage = item.href.split("/").pop();
      const isCurrentPage = itemPage === currentPage;
      const activeClass = isCurrentPage ? " active" : "";
      const currentPageAttribute = isCurrentPage ? ' aria-current="page"' : "";
      return `<li><a class="${activeClass.trim()}" href="${item.href}" data-page="${itemPage.replace(".html", "")}"${currentPageAttribute}>${item.label}</a></li>`;
    })
    .join("");
}

function getLogoMarkup(size = 50) {
  return `
    <div class="logo-icon" aria-hidden="true">
      <svg width="${size}" height="${size}" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="46" height="46" rx="14" fill="#0B1F3A" />
        <path d="M25 7L39 14V25C39 33.5 33.2 40.2 25 43C16.8 40.2 11 33.5 11 25V14L25 7Z" fill="#D4AF37" />
        <path d="M25 11L35 16V24.5C35 30.8 31 35.9 25 38.4C19 35.9 15 30.8 15 24.5V16L25 11Z" fill="#0B1F3A" />
        <path d="M25 16V33" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
        <path d="M17.5 24.5H32.5" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
        <path d="M16 39C21.4 36 28.6 36 34 39" stroke="#D4AF37" stroke-width="3" stroke-linecap="round" />
        <circle cx="38" cy="12" r="4" fill="#D4AF37" />
      </svg>
    </div>`;
}

function renderSiteHeader() {
  const header = document.querySelector("[data-site-header]");
  if (!header) return;

  const basePath = getSiteBasePath();
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const collegeName = collegeData?.name || "SACOHAS";
  const fullName = collegeData?.fullName || "SACOHAS College of Health and Allied Sciences";

  header.innerHTML = `
    <div class="container">
      <div class="header-inner">
        <div class="logo">
          <a href="${basePath}index.html" aria-label="${fullName} home">
            ${getLogoMarkup(50)}
            <div class="logo-text">
              <span class="logo-name">${collegeName}</span>
              <span class="logo-sub">College of Health and Allied Sciences</span>
            </div>
          </a>
        </div>
        <nav class="nav" aria-label="Main navigation">
          <button class="hamburger" type="button" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="primary-nav">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
          <ul id="primary-nav" class="nav-links">
          ${createNavigationLinks(basePath, currentPage)}
          <li class="nav-cta"><a href="${basePath}pages/admissions.html#apply" class="btn btn-primary">Apply Now</a></li>
          </ul>
        </nav>
      </div>
    </div>`;
}

function renderSiteFooter() {
  const footer = document.querySelector("[data-site-footer]");
  if (!footer) return;

  const basePath = getSiteBasePath();
  const collegeName = collegeData?.fullName || "SACOHAS College of Health and Allied Sciences";
  const quickLinks = getNavigationItems(basePath).slice(0, 5)
    .map((item) => `<li><a href="${item.href}">${item.label}</a></li>`)
    .join("");
  const resourceLinks = getNavigationItems(basePath).slice(5)
    .map((item) => `<li><a href="${item.href}">${item.label}</a></li>`)
    .join("");
  const socialLinks = (collegeData?.socialLinks || [])
    .map((item) => `<li><a href="${item.href}">${item.label}</a></li>`)
    .join("");

  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo">
            ${getLogoMarkup(40)}
            <div class="logo-text">
              <span class="logo-name">SACOHAS</span>
              <span class="logo-sub">College of Health and Allied Sciences</span>
            </div>
          </div>
          <p>${collegeData?.description || "Quality health and allied sciences education in Tanzania."}</p>
        </div>
        <div class="footer-links">
          <h4>Quick Links</h4>
          <ul>${quickLinks}</ul>
        </div>
        <div class="footer-links">
          <h4>Resources</h4>
          <ul>${resourceLinks}</ul>
        </div>
        <div class="footer-contact">
          <h4>Get in Touch</h4>
          <ul>
            <li>${collegeData?.address || "SACOHAS Main Campus, Tanzania"}</li>
            <li>${collegeData?.phone || "Admissions and enquiries through the contact office"}</li>
            <li><a href="mailto:${collegeData?.email || "info@sacohas.ac.tz"}">${collegeData?.email || "info@sacohas.ac.tz"}</a></li>
            <li>${collegeData?.officeHours || "Monday to Friday, 8:00 AM - 5:00 PM"}</li>
            ${socialLinks}
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; <span data-current-year></span> ${collegeName}. All rights reserved.</p>
        <button class="back-to-top" aria-label="Back to top">&uarr;</button>
      </div>
    </div>`;
}

function renderSiteCta() {
  const cta = document.querySelector("[data-site-cta]");
  if (!cta) return;

  const basePath = getSiteBasePath();
  const title = cta.dataset.title || "Start Your Health Education Journey";
  const text =
    cta.dataset.text ||
    "Take the next step toward a career in health and allied sciences at SACOHAS.";
  const secondaryHref = cta.dataset.secondaryHref || `${basePath}pages/academics.html`;
  const secondaryLabel = cta.dataset.secondaryLabel || "Explore Programs";

  cta.innerHTML = `
    <div class="container">
      <div class="cta-content">
        <h2>${title}</h2>
        <p>${text}</p>
        <div class="cta-buttons">
          <a href="${basePath}pages/admissions.html#apply" class="btn btn-primary btn-lg btn-gold">Apply Now</a>
          <a href="${secondaryHref}" class="btn btn-outline btn-lg btn-white-outline">${secondaryLabel}</a>
        </div>
      </div>
    </div>`;
}

function renderGlobalComponents() {
  renderSiteHeader();
  renderSiteFooter();
  renderSiteCta();
  initializeNavigation();
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

function initializeNavigation() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  if (!hamburger || !navLinks || hamburger.dataset.ready === "true") return;

  function closeMenu() {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  hamburger.dataset.ready = "true";
  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!navLinks.classList.contains("open")) return;
    if (navLinks.contains(event.target) || hamburger.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !navLinks.classList.contains("open")) return;
    closeMenu();
    hamburger.focus();
  });

  // Avoid leaving the page scroll-locked when a device rotates or is resized
  // from the compact menu layout back to the desktop navigation.
  window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });
}

function initializeFaqs() {
  document.querySelectorAll("[data-faq-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const answer = document.getElementById(trigger.getAttribute("aria-controls"));
      if (!answer) return;
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!isExpanded));
      answer.hidden = isExpanded;
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderGlobalComponents);
} else {
  renderGlobalComponents();
}
