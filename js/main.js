/**
 * BLOODCONNECT - MASTER JAVASCRIPT
 * All JavaScript consolidated into one file
 */

(function () {
  "use strict";

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const Utils = {
    debounce: function (func, wait = 300) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },

    throttle: function (func, limit = 300) {
      let inThrottle;
      return function (...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    },

    formatDate: function (date, format = "short") {
      const d = new Date(date);
      const options = {
        short: { year: "numeric", month: "short", day: "numeric" },
        long: { year: "numeric", month: "long", day: "numeric" },
        full: {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      };
      return d.toLocaleDateString("en-US", options[format] || options.short);
    },

    timeAgo: function (date) {
      const now = new Date();
      const past = new Date(date);
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60)
        return diffMins + " minute" + (diffMins > 1 ? "s" : "") + " ago";
      if (diffHours < 24)
        return diffHours + " hour" + (diffHours > 1 ? "s" : "") + " ago";
      if (diffDays < 7)
        return diffDays + " day" + (diffDays > 1 ? "s" : "") + " ago";
      return this.formatDate(date);
    },

    truncate: function (text, maxLength = 100) {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "…";
    },

    isValidEmail: function (email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
    },

    isValidPhone: function (phone) {
      return /^[+]?[\d\s\-()]{7,20}$/.test(String(phone));
    },

    sanitize: function (input) {
      if (typeof input !== "string") return input;
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
      };
      return input.replace(/[&<>"'/]/g, function (char) {
        return map[char];
      });
    },

    getUrlParam: function (param) {
      return new URLSearchParams(window.location.search).get(param);
    },

    scrollTo: function (element, offset = 0) {
      if (typeof element === "string")
        element = document.querySelector(element);
      if (element) {
        const top =
          element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    },

    copyToClipboard: async function (text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error("Failed to copy:", err);
        return false;
      }
    },

    isMobile: function () {
      return (
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ) || window.innerWidth < 768
      );
    },

    generateId: function () {
      return (
        Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
      );
    },

    getBloodGroupLabel: function (type) {
      const labels = {
        "A+": "🅰️ A Positive",
        "A-": "🅰️ A Negative",
        "B+": "🅱️ B Positive",
        "B-": "🅱️ B Negative",
        "AB+": "🆎 AB Positive",
        "AB-": "🆎 AB Negative",
        "O+": "🅾️ O Positive",
        "O-": "🅾️ O Negative",
      };
      return labels[type] || type;
    },

    getBloodGroupCompatibility: function (type) {
      const compatibility = {
        "A+": {
          canReceive: ["A+", "A-", "O+", "O-"],
          canDonateTo: ["A+", "AB+"],
        },
        "A-": {
          canReceive: ["A-", "O-"],
          canDonateTo: ["A+", "A-", "AB+", "AB-"],
        },
        "B+": {
          canReceive: ["B+", "B-", "O+", "O-"],
          canDonateTo: ["B+", "AB+"],
        },
        "B-": {
          canReceive: ["B-", "O-"],
          canDonateTo: ["B+", "B-", "AB+", "AB-"],
        },
        "AB+": {
          canReceive: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
          canDonateTo: ["AB+"],
        },
        "AB-": {
          canReceive: ["A-", "B-", "AB-", "O-"],
          canDonateTo: ["AB+", "AB-"],
        },
        "O+": {
          canReceive: ["O+", "O-"],
          canDonateTo: ["A+", "B+", "AB+", "O+"],
        },
        "O-": {
          canReceive: ["O-"],
          canDonateTo: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
      };
      return compatibility[type] || { canReceive: [], canDonateTo: [] };
    },
  };

  // ========================================
  // TOAST NOTIFICATION SYSTEM
  // ========================================

  const Toast = {
    container: null,

    init: function () {
      this.container = document.createElement("div");
      this.container.className = "toast-container";
      this.container.setAttribute("role", "status");
      this.container.setAttribute("aria-live", "polite");
      document.body.appendChild(this.container);
    },

    show: function (message, type = "info", duration = 5000) {
      if (!this.container) this.init();

      const colors = {
        success: "#2E7D32",
        error: "#C62828",
        warning: "#F57C00",
        info: "#8B1A1A",
      };
      const icons = {
        success: "✓",
        error: "✕",
        warning: "⚠",
        info: "ℹ",
      };

      const toast = document.createElement("div");
      toast.style.cssText = `
                background: white;
                padding: 16px 20px;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                border-left: 4px solid ${colors[type] || colors.info};
                font-size: 14px;
                color: #1A1A1A;
                display: flex;
                align-items: center;
                gap: 12px;
            `;

      const icon = document.createElement("span");
      icon.textContent = icons[type] || icons.info;
      icon.style.cssText = `font-weight: 700; color: ${colors[type] || colors.info}; font-size: 18px;`;

      const text = document.createElement("span");
      text.textContent = message;

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "×";
      closeBtn.style.cssText = `
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #8A8A8A;
                margin-left: auto;
                padding: 0 4px;
            `;
      closeBtn.setAttribute("aria-label", "Close notification");

      closeBtn.addEventListener("click", function () {
        toast.classList.add("slide-out");
        setTimeout(() => toast.remove(), 300);
      });

      toast.appendChild(icon);
      toast.appendChild(text);
      toast.appendChild(closeBtn);
      this.container.appendChild(toast);

      if (duration > 0) {
        setTimeout(function () {
          if (toast.parentNode) {
            toast.classList.add("slide-out");
            setTimeout(() => toast.remove(), 300);
          }
        }, duration);
      }
    },

    success: function (message, duration) {
      this.show(message, "success", duration);
    },
    error: function (message, duration) {
      this.show(message, "error", duration);
    },
    warning: function (message, duration) {
      this.show(message, "warning", duration);
    },
    info: function (message, duration) {
      this.show(message, "info", duration);
    },
  };

  // ========================================
  // MODAL SYSTEM
  // ========================================

  const Modal = {
    _overlay: null,

    open: function (content, title = "") {
      this.close();

      const overlay = document.createElement("div");
      overlay.className = "modal-overlay";

      const modal = document.createElement("div");
      modal.className = "modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("aria-labelledby", "modal-title");

      const header = document.createElement("div");
      header.className = "modal-header";

      const titleEl = document.createElement("h2");
      titleEl.id = "modal-title";
      titleEl.className = "modal-title";
      titleEl.textContent = title;

      const closeBtn = document.createElement("button");
      closeBtn.className = "modal-close";
      closeBtn.textContent = "×";
      closeBtn.setAttribute("aria-label", "Close modal");
      closeBtn.addEventListener("click", () => this.close());

      header.appendChild(titleEl);
      header.appendChild(closeBtn);

      const body = document.createElement("div");
      if (typeof content === "string") {
        body.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        body.appendChild(content);
      }

      modal.appendChild(header);
      modal.appendChild(body);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];
      if (firstFocusable) firstFocusable.focus();

      overlay.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          Modal.close();
        }
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
              e.preventDefault();
              lastFocusable.focus();
            }
          } else {
            if (document.activeElement === lastFocusable) {
              e.preventDefault();
              firstFocusable.focus();
            }
          }
        }
      });

      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) {
          Modal.close();
        }
      });

      this._overlay = overlay;
    },

    close: function () {
      if (this._overlay) {
        this._overlay.remove();
        this._overlay = null;
      }
    },
  };

  // ========================================
  // LOADING SPINNER
  // ========================================

  const Loading = {
    _container: null,
    _spinner: null,

    show: function (container, message = "Loading...") {
      if (!container) return;
      this.hide();

      const spinner = document.createElement("div");
      spinner.className = "loading-spinner";

      const ring = document.createElement("div");
      ring.className = "loading-ring";

      const text = document.createElement("p");
      text.className = "loading-text";
      text.textContent = message;

      spinner.appendChild(ring);
      spinner.appendChild(text);
      container.appendChild(spinner);

      this._container = container;
      this._spinner = spinner;
    },

    hide: function () {
      if (this._spinner && this._container) {
        this._spinner.remove();
        this._spinner = null;
        this._container = null;
      }
    },
  };

  // ========================================
  // NAVIGATION
  // ========================================

  function initNavigation() {
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", function () {
        const isOpen = navMenu.classList.toggle("open");
        this.setAttribute("aria-expanded", isOpen);
        this.setAttribute(
          "aria-label",
          isOpen ? "Close navigation menu" : "Open navigation menu",
        );
      });

      document.addEventListener("click", function (event) {
        const isClickInside =
          navToggle.contains(event.target) || navMenu.contains(event.target);
        if (!isClickInside && navMenu.classList.contains("open")) {
          navMenu.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
          navToggle.setAttribute("aria-label", "Open navigation menu");
        }
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && navMenu.classList.contains("open")) {
          navMenu.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
          navToggle.setAttribute("aria-label", "Open navigation menu");
          navToggle.focus();
        }
      });

      const navLinks = navMenu.querySelectorAll("a");
      navLinks.forEach(function (link, index) {
        link.addEventListener("keydown", function (event) {
          if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            event.preventDefault();
            const nextLink = navLinks[index + 1] || navLinks[0];
            nextLink.focus();
          } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            event.preventDefault();
            const prevLink =
              navLinks[index - 1] || navLinks[navLinks.length - 1];
            prevLink.focus();
          }
        });
      });
    }

    // Set active nav link
    const currentPath = window.location.pathname;
    document.querySelectorAll(".nav-link").forEach(function (link) {
      const href = link.getAttribute("href");
      if (href) {
        link.classList.remove("active");
        if (
          currentPath === href ||
          (currentPath === "/" && href === "index.html") ||
          (currentPath.endsWith("/") && href === "index.html") ||
          (href !== "index.html" &&
            currentPath.includes(href.replace(".html", "")))
        ) {
          link.classList.add("active");
        }
      }
    });
  }

  // ========================================
  // ANIMATIONS
  // ========================================

  function initAnimations() {
    const animatedElements = document.querySelectorAll(
      ".animate-fade-in, .animate-slide-up",
    );

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry, index) {
            if (entry.isIntersecting) {
              setTimeout(function () {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
              }, index * 100);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
      );

      animatedElements.forEach(function (el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(el);
      });
    } else {
      animatedElements.forEach(function (el) {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
    }
  }

  // ========================================
  // IMPACT COUNTERS
  // ========================================

  function initImpactCounters() {
    const counters = document.querySelectorAll(".impact-number");

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              const target =
                parseInt(entry.target.getAttribute("data-count")) || 0;
              animateCounter(entry.target, target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 },
      );

      counters.forEach(function (counter) {
        observer.observe(counter);
      });
    } else {
      counters.forEach(function (counter) {
        counter.textContent = parseInt(counter.getAttribute("data-count")) || 0;
      });
    }
  }

  function animateCounter(element, target) {
    let current = 0;
    const increment = Math.ceil(target / 40);
    const stepTime = 1500 / 40;

    const timer = setInterval(function () {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = current.toLocaleString();
    }, stepTime);

    setTimeout(function () {
      element.textContent = target.toLocaleString();
    }, 1600);
  }

  // ========================================
  // FORM VALIDATION
  // ========================================

  function initFormValidation() {
    document.querySelectorAll("form[data-validate]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        if (!validateForm(this)) e.preventDefault();
      });

      form
        .querySelectorAll("input, select, textarea")
        .forEach(function (input) {
          input.addEventListener("blur", function () {
            validateField(this);
          });
          input.addEventListener("input", function () {
            const error = this.parentElement.querySelector(".field-error");
            if (error) error.remove();
            this.classList.remove("field-invalid");
          });
        });
    });
  }

  function validateForm(form) {
    let isValid = true;
    form
      .querySelectorAll("input[required], select[required], textarea[required]")
      .forEach(function (input) {
        if (!validateField(input)) isValid = false;
      });
    return isValid;
  }

  function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const name = field.getAttribute("name") || "Field";
    let isValid = true;
    let errorMessage = "";

    const existingError = field.parentElement.querySelector(".field-error");
    if (existingError) existingError.remove();
    field.classList.remove("field-invalid");

    if (field.hasAttribute("required") && !value) {
      isValid = false;
      errorMessage = name + " is required.";
    }

    if (
      isValid &&
      type === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      isValid = false;
      errorMessage = "Please enter a valid email address.";
    }

    if (
      isValid &&
      type === "password" &&
      value &&
      field.hasAttribute("minlength")
    ) {
      const minLength = parseInt(field.getAttribute("minlength"));
      if (value.length < minLength) {
        isValid = false;
        errorMessage =
          "Password must be at least " + minLength + " characters.";
      }
    }

    if (
      isValid &&
      type === "tel" &&
      value &&
      !/^[+]?[\d\s\-()]{7,20}$/.test(value)
    ) {
      isValid = false;
      errorMessage = "Please enter a valid phone number.";
    }

    if (!isValid) {
      field.classList.add("field-invalid");
      const error = document.createElement("span");
      error.className = "field-error";
      error.textContent = errorMessage;
      field.parentElement.appendChild(error);
    }

    return isValid;
  }

  // ========================================
  // INTERACTIVE ELEMENTS
  // ========================================

  function initInteractiveElements() {
    // FAQ Accordion
    document.querySelectorAll(".faq-item").forEach(function (item) {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");

      if (question && answer) {
        question.addEventListener("click", function () {
          const isOpen = answer.classList.contains("open");

          document.querySelectorAll(".faq-item").forEach(function (otherItem) {
            if (otherItem !== item) {
              const otherAnswer = otherItem.querySelector(".faq-answer");
              const otherQuestion = otherItem.querySelector(".faq-question");
              if (otherAnswer) {
                otherAnswer.classList.remove("open");
                otherAnswer.style.maxHeight = "0";
              }
              if (otherQuestion)
                otherQuestion.setAttribute("aria-expanded", "false");
            }
          });

          if (isOpen) {
            answer.classList.remove("open");
            answer.style.maxHeight = "0";
            question.setAttribute("aria-expanded", "false");
          } else {
            answer.classList.add("open");
            answer.style.maxHeight = answer.scrollHeight + "px";
            question.setAttribute("aria-expanded", "true");
          }
        });

        question.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.click();
          }
        });

        question.setAttribute("aria-expanded", "false");
      }
    });

    // Learn Nav Scroll
    const learnNavLinks = document.querySelectorAll(".learn-nav-link");
    learnNavLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId && targetId.startsWith("#")) {
          e.preventDefault();
          const target = document.querySelector(targetId);
          if (target) {
            const navHeight =
              document.querySelector(".navbar")?.offsetHeight || 0;
            window.scrollTo({
              top:
                target.getBoundingClientRect().top +
                window.pageYOffset -
                navHeight -
                80,
              behavior: "smooth",
            });
            learnNavLinks.forEach(function (l) {
              l.classList.remove("active");
            });
            this.classList.add("active");
          }
        }
      });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const navHeight =
            document.querySelector(".navbar")?.offsetHeight || 0;
          window.scrollTo({
            top:
              target.getBoundingClientRect().top +
              window.pageYOffset -
              navHeight -
              16,
            behavior: "smooth",
          });
        }
      });
    });

    // Tabs
    document.querySelectorAll(".tab-group").forEach(function (group) {
      const tabs = group.querySelectorAll(".tab");
      const panels = group.querySelectorAll(".tab-panel");
      tabs.forEach(function (tab, index) {
        tab.addEventListener("click", function () {
          tabs.forEach(function (t) {
            t.classList.remove("active");
          });
          panels.forEach(function (p) {
            p.classList.remove("active");
          });
          this.classList.add("active");
          if (panels[index]) panels[index].classList.add("active");
        });
      });
    });
  }

  // ========================================
  // DONATE PAGE - SEARCH & CENTERS
  // ========================================

  // Sample donation center data
  const sampleCenters = [
    {
      id: 1,
      name: "City General Hospital Blood Bank",
      address: "123 Medical Drive, City Center",
      city: "Metropolis",
      distance: 2.5,
      phone: "+1 (555) 123-4567",
      hours: "Mon-Fri: 8:00 AM - 8:00 PM, Sat: 9:00 AM - 5:00 PM",
      bloodTypes: ["A+", "A-", "B+", "O+", "O-"],
      verified: true,
      services: ["Whole Blood", "Platelets", "Plasma"],
    },
    {
      id: 2,
      name: "Regional Blood Center",
      address: "456 Health Avenue, North District",
      city: "Metropolis",
      distance: 5.8,
      phone: "+1 (555) 234-5678",
      hours: "Mon-Sun: 7:00 AM - 9:00 PM",
      bloodTypes: ["A+", "B+", "AB+", "O+"],
      verified: true,
      services: ["Whole Blood", "Plasma"],
    },
    {
      id: 3,
      name: "University Medical Center",
      address: "789 Campus Road, University District",
      city: "Metropolis",
      distance: 8.2,
      phone: "+1 (555) 345-6789",
      hours: "Mon-Fri: 9:00 AM - 6:00 PM",
      bloodTypes: ["A-", "B-", "AB-", "O-"],
      verified: true,
      services: ["Whole Blood", "Platelets", "Plasma", "Double Red"],
    },
    {
      id: 4,
      name: "Community Health Center",
      address: "321 Wellness Street, East Side",
      city: "Metropolis",
      distance: 12.3,
      phone: "+1 (555) 456-7890",
      hours: "Mon-Sat: 8:30 AM - 6:30 PM",
      bloodTypes: ["A+", "B+", "O+", "O-"],
      verified: false,
      services: ["Whole Blood"],
    },
  ];

  let currentCenters = [...sampleCenters];
  let userLocation = null;

  function initDonatePage() {
    if (!document.getElementById("centersList")) return;

    renderCenters(currentCenters);
    setupDonateEvents();
  }

  function setupDonateEvents() {
    const searchForm = document.getElementById("centerSearch");
    if (searchForm) {
      searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        performSearch();
      });
    }

    const searchInput = document.getElementById("searchQuery");
    if (searchInput) {
      searchInput.addEventListener("input", Utils.debounce(performSearch, 300));
    }

    const bloodTypeFilter = document.getElementById("filterBloodType");
    const distanceFilter = document.getElementById("filterDistance");
    if (bloodTypeFilter)
      bloodTypeFilter.addEventListener("change", performSearch);
    if (distanceFilter)
      distanceFilter.addEventListener("change", performSearch);

    const locationBtn = document.getElementById("useLocationBtn");
    if (locationBtn) {
      locationBtn.addEventListener("click", getUserLocation);
    }

    document.querySelectorAll(".view-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".view-btn").forEach(function (b) {
          b.classList.remove("active");
        });
        this.classList.add("active");
        if (this.getAttribute("data-view") === "map") {
          Toast.info("Map view coming soon!");
        }
      });
    });

    const clearBtn = document.getElementById("clearFilters");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        const searchInput = document.getElementById("searchQuery");
        const bloodTypeFilter = document.getElementById("filterBloodType");
        const distanceFilter = document.getElementById("filterDistance");
        if (searchInput) searchInput.value = "";
        if (bloodTypeFilter) bloodTypeFilter.value = "";
        if (distanceFilter) distanceFilter.value = "25";
        performSearch();
      });
    }
  }

  function performSearch() {
    const query =
      document.getElementById("searchQuery")?.value.toLowerCase().trim() || "";
    const bloodType = document.getElementById("filterBloodType")?.value || "";
    const maxDistance =
      parseInt(document.getElementById("filterDistance")?.value) || 25;

    let filtered = [...sampleCenters];

    if (query) {
      filtered = filtered.filter(function (center) {
        return (
          center.name.toLowerCase().includes(query) ||
          center.city.toLowerCase().includes(query) ||
          center.address.toLowerCase().includes(query)
        );
      });
    }

    if (bloodType) {
      filtered = filtered.filter(function (center) {
        return center.bloodTypes.includes(bloodType);
      });
    }

    if (userLocation) {
      filtered = filtered.filter(function (center) {
        return center.distance <= maxDistance;
      });
      filtered.sort(function (a, b) {
        return a.distance - b.distance;
      });
    }

    currentCenters = filtered;
    renderCenters(filtered);
  }

  function renderCenters(centers) {
    const container = document.getElementById("centersList");
    const emptyState = document.getElementById("emptyState");
    const resultsCount = document.getElementById("resultsCount");

    if (!container) return;

    if (resultsCount) {
      resultsCount.textContent =
        "Showing " +
        centers.length +
        " center" +
        (centers.length !== 1 ? "s" : "");
    }

    if (centers.length === 0) {
      container.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    container.innerHTML = centers
      .map(function (center) {
        return `
                <div class="center-card" data-id="${center.id}">
                    <div class="center-card-header">
                        <div class="center-card-title">
                            <h3>${center.name}</h3>
                            ${center.verified ? '<span class="badge badge-success">Verified</span>' : '<span class="badge badge-muted">Pending Verification</span>'}
                        </div>
                        <span class="center-distance">${center.distance} km</span>
                    </div>
                    <div class="center-card-body">
                        <p class="center-address">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            ${center.address}, ${center.city}
                        </p>
                        <p class="center-phone">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            ${center.phone}
                        </p>
                        <p class="center-hours">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            ${center.hours}
                        </p>
                        <div class="center-services">
                            <span class="services-label">Services:</span>
                            ${center.services
                              .map(function (service) {
                                return (
                                  '<span class="service-tag">' +
                                  service +
                                  "</span>"
                                );
                              })
                              .join("")}
                        </div>
                        <div class="center-blood-types">
                            <span class="blood-types-label">Blood Types Accepted:</span>
                            ${center.bloodTypes
                              .map(function (type) {
                                return (
                                  '<span class="blood-type-tag">' +
                                  type +
                                  "</span>"
                                );
                              })
                              .join("")}
                        </div>
                    </div>
                    <div class="center-card-footer">
                        <button class="btn btn-primary btn-sm" onclick="window.location.href='#'">Schedule Appointment</button>
                        <button class="btn btn-outline btn-sm">Get Directions</button>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  function getUserLocation() {
    if (!navigator.geolocation) {
      Toast.error("Geolocation is not supported by your browser.");
      return;
    }

    const btn = document.getElementById("useLocationBtn");
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loading-dots">Getting location</span>';
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      function (position) {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        btn.innerHTML = "📍 Location Detected";
        btn.disabled = false;
        Toast.success("Location detected! Updating results...");
        performSearch();
      },
      function (error) {
        btn.innerHTML = originalText;
        btn.disabled = false;
        let message =
          "Unable to get your location. Please enter your location manually.";
        if (error.code === 1) {
          message =
            "Location access denied. Please enter your location manually.";
        }
        Toast.error(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  // ========================================
  // SCROLL SPY FOR LEARN NAV
  // ========================================

  function initLearnNavScrollSpy() {
    const sections = document.querySelectorAll(".learn-section");
    const navLinks = document.querySelectorAll(".learn-nav-link");

    if (sections.length > 0 && navLinks.length > 0) {
      const handleScroll = Utils.throttle(function () {
        const scrollPosition = window.pageYOffset + 150;

        sections.forEach(function (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;

          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            const id = section.id;
            navLinks.forEach(function (link) {
              link.classList.remove("active");
              if (link.getAttribute("href") === "#" + id) {
                link.classList.add("active");
              }
            });
          }
        });
      }, 200);

      window.addEventListener("scroll", handleScroll);
    }
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  function init() {
    // Navigation
    initNavigation();

    // Animations
    initAnimations();

    // Impact Counters
    initImpactCounters();

    // Form Validation
    initFormValidation();

    // Interactive Elements
    initInteractiveElements();

    // Donate Page
    initDonatePage();

    // Learn Nav Scroll Spy
    initLearnNavScrollSpy();

    console.log("BloodConnect initialized successfully.");
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose public API
  window.BloodConnect = {
    Utils: Utils,
    Toast: Toast,
    Modal: Modal,
    Loading: Loading,
  };
})();
s;
