/**
 * SACOHAS College - Main JavaScript
 * Global functionality including back-to-top button and utilities
 */

(function () {
  "use strict";

  /**
   * Back to top button functionality
   */
  function initBackToTop() {
    const backToTopBtn = document.querySelector(".back-to-top");
    if (!backToTopBtn) return;

    let isVisible = false;

    function toggleVisibility() {
      const scrollY = window.scrollY || window.pageYOffset;
      const shouldBeVisible = scrollY > 300;

      if (shouldBeVisible && !isVisible) {
        backToTopBtn.classList.add("visible");
        isVisible = true;
      } else if (!shouldBeVisible && isVisible) {
        backToTopBtn.classList.remove("visible");
        isVisible = false;
      }
    }

    function scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    // Event listeners
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    backToTopBtn.addEventListener("click", scrollToTop);

    // Initial check
    toggleVisibility();
  }

  /**
   * Smooth scroll for anchor links
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href === "#") return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      });
    });
  }

  /**
   * Initialize FAQ accordion
   */
  function initFAQ() {
    const faqItems = document.querySelectorAll(".faq-item");
    if (faqItems.length === 0) return;

    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question");
      if (!question) return;

      question.addEventListener("click", function () {
        const isActive = item.classList.contains("active");

        // Close all other FAQ items
        faqItems.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove("active");
            const otherBtn = otherItem.querySelector(".faq-question");
            if (otherBtn) {
              otherBtn.setAttribute("aria-expanded", "false");
            }
          }
        });

        // Toggle current item
        item.classList.toggle("active");
        const isNowActive = item.classList.contains("active");
        question.setAttribute("aria-expanded", isNowActive);
      });

      // Keyboard support
      question.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  /**
   * Initialize program search and filter (delegated to programs.js)
   */
  function initPrograms() {
    // Check if programs.js has loaded
    if (typeof window.SACOHAS !== "undefined" && window.SACOHAS.programs) {
      window.SACOHAS.programs.init();
    }
  }

  /**
   * Initialize gallery (delegated to gallery.js)
   */
  function initGallery() {
    // Check if gallery.js has loaded
    if (typeof window.SACOHAS !== "undefined" && window.SACOHAS.gallery) {
      window.SACOHAS.gallery.init();
    }
  }

  /**
   * Initialize contact form validation
   */
  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const fields = {
      name: {
        element: document.getElementById("contactName"),
        error: document.getElementById("nameError"),
        validate: (value) => value.trim().length > 0,
      },
      email: {
        element: document.getElementById("contactEmail"),
        error: document.getElementById("emailError"),
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      },
      subject: {
        element: document.getElementById("contactSubject"),
        error: document.getElementById("subjectError"),
        validate: (value) => value.trim().length > 0,
      },
      message: {
        element: document.getElementById("contactMessage"),
        error: document.getElementById("messageError"),
        validate: (value) => value.trim().length > 0,
      },
      phone: {
        element: document.getElementById("contactPhone"),
        error: document.getElementById("phoneError"),
        validate: (value) =>
          value.trim() === "" || /^[\d\s\-+()]{10,}$/.test(value.trim()),
      },
    };

    function validateField(field) {
      const value = field.element.value;
      const isValid = field.validate(value);

      if (!isValid && value.trim() !== "") {
        field.element.classList.add("error");
        field.error.textContent = getErrorMessage(field);
        field.error.style.display = "block";
      } else if (!isValid && value.trim() === "") {
        field.element.classList.add("error");
        field.error.textContent = "This field is required.";
        field.error.style.display = "block";
      } else {
        field.element.classList.remove("error");
        field.error.textContent = "";
        field.error.style.display = "none";
      }

      return isValid;
    }

    function getErrorMessage(field) {
      const id = field.element.id;
      const messages = {
        contactName: "Please enter your full name.",
        contactEmail: "Please enter a valid email address.",
        contactSubject: "Please enter a subject.",
        contactMessage: "Please enter your message.",
        contactPhone: "Please enter a valid phone number.",
      };
      return messages[id] || "Please check this field.";
    }

    // Real-time validation on blur
    Object.values(fields).forEach((field) => {
      field.element.addEventListener("blur", function () {
        validateField(field);
      });

      field.element.addEventListener("input", function () {
        if (this.classList.contains("error")) {
          validateField(field);
        }
      });
    });

    // Form submission
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      let isValid = true;
      Object.values(fields).forEach((field) => {
        if (!validateField(field)) {
          isValid = false;
        }
      });

      if (isValid) {
        const successMsg = document.getElementById("formSuccess");
        if (successMsg) {
          successMsg.textContent =
            "Your message has passed validation. This demo form does not transmit messages.";
          successMsg.style.display = "block";
          form.reset();
          Object.values(fields).forEach((field) => {
            field.element.classList.remove("error");
            field.error.textContent = "";
            field.error.style.display = "none";
          });
          setTimeout(() => {
            successMsg.style.display = "none";
          }, 5000);
        }
      } else {
        // Focus first error field
        const firstError = document.querySelector(".form-group .error");
        if (firstError) {
          firstError.focus();
        }
      }
    });
  }

  /**
   * Initialize all features
   */
  function init() {
    // Back to top
    initBackToTop();

    // Smooth scroll
    initSmoothScroll();

    // FAQ accordion
    initFAQ();

    // Programs
    initPrograms();

    // Gallery
    initGallery();

    // Contact form
    initContactForm();

  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
