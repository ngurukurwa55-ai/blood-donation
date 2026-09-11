/**
 * SACOHAS College - Gallery Module
 * Handles image gallery with lightbox functionality
 */

(function () {
  "use strict";

  // Gallery data
  const galleryImages = [
    {
      id: 0,
      icon: "🏛️",
      caption: "Main Campus Building",
      alt: "Main campus building of SACOHAS College",
    },
    {
      id: 1,
      icon: "🏫",
      caption: "Modern Lecture Hall",
      alt: "Modern lecture hall at SACOHAS College",
    },
    {
      id: 2,
      icon: "🔬",
      caption: "Practical Laboratory",
      alt: "Practical laboratory at SACOHAS College",
    },
    {
      id: 3,
      icon: "🛋️",
      caption: "Student Common Area",
      alt: "Student common area at SACOHAS College",
    },
    {
      id: 4,
      icon: "📚",
      caption: "Campus Library",
      alt: "Campus library at SACOHAS College",
    },
    {
      id: 5,
      icon: "🎓",
      caption: "Student Life Activities",
      alt: "Student life activities at SACOHAS College",
    },
  ];

  // DOM Elements
  let galleryItems;
  let lightbox;
  let lightboxOverlay;
  let lightboxClose;
  let lightboxPrev;
  let lightboxNext;
  let lightboxIcon;
  let lightboxCaption;
  let lightboxCounter;

  let currentIndex = 0;
  let isOpen = false;

  /**
   * Open lightbox
   */
  function openLightbox(index) {
    if (!lightbox) return;

    currentIndex = index;
    updateLightbox();
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    isOpen = true;
    lightbox.setAttribute("aria-hidden", "false");

    // Focus trap
    setTimeout(() => {
      lightboxClose.focus();
    }, 100);
  }

  /**
   * Close lightbox
   */
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    isOpen = false;
    lightbox.setAttribute("aria-hidden", "true");
  }

  /**
   * Update lightbox content
   */
  function updateLightbox() {
    if (!lightboxIcon || !lightboxCaption || !lightboxCounter) return;

    const image = galleryImages[currentIndex];
    if (!image) return;

    lightboxIcon.textContent = image.icon;
    lightboxCaption.textContent = image.caption;
    lightboxCounter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
  }

  /**
   * Navigate to previous image
   */
  function prevImage() {
    currentIndex =
      (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightbox();
  }

  /**
   * Navigate to next image
   */
  function nextImage() {
    currentIndex = (currentIndex + 1) % galleryImages.length;
    updateLightbox();
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeyboard(e) {
    if (!isOpen) return;

    switch (e.key) {
      case "Escape":
        closeLightbox();
        break;
      case "ArrowLeft":
        e.preventDefault();
        prevImage();
        break;
      case "ArrowRight":
        e.preventDefault();
        nextImage();
        break;
    }
  }

  /**
   * Initialize gallery
   */
  function init() {
    if (lightbox?.dataset.initialized === "true") return;
    // Get DOM elements
    galleryItems = document.querySelectorAll(".gallery-item");
    lightbox = document.getElementById("lightbox");
    lightboxOverlay = document.getElementById("lightboxOverlay");
    lightboxClose = document.getElementById("lightboxClose");
    lightboxPrev = document.getElementById("lightboxPrev");
    lightboxNext = document.getElementById("lightboxNext");
    lightboxIcon = document.getElementById("lightboxIcon");
    lightboxCaption = document.getElementById("lightboxCaption");
    lightboxCounter = document.getElementById("lightboxCounter");

    if (!galleryItems.length || !lightbox) {
      return;
    }

    lightbox.dataset.initialized = "true";

    // Gallery item click handlers
    galleryItems.forEach((item) => {
      item.addEventListener("click", function () {
        const index = parseInt(this.getAttribute("data-index"));
        if (!isNaN(index)) {
          openLightbox(index);
        }
      });

      // Keyboard support for gallery items
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });

    // Lightbox controls
    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    if (lightboxOverlay) {
      lightboxOverlay.addEventListener("click", closeLightbox);
    }

    if (lightboxPrev) {
      lightboxPrev.addEventListener("click", prevImage);
    }

    if (lightboxNext) {
      lightboxNext.addEventListener("click", nextImage);
    }

    // Keyboard navigation
    document.addEventListener("keydown", handleKeyboard);

    // Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    if (lightbox) {
      lightbox.addEventListener(
        "touchstart",
        function (e) {
          touchStartX = e.changedTouches[0].screenX;
        },
        { passive: true },
      );

      lightbox.addEventListener(
        "touchend",
        function (e) {
          touchEndX = e.changedTouches[0].screenX;
          const diff = touchStartX - touchEndX;
          if (Math.abs(diff) > 50) {
            if (diff > 0) {
              nextImage();
            } else {
              prevImage();
            }
          }
        },
        { passive: true },
      );
    }

  }

  // Export for use in main.js
  window.SACOHAS = window.SACOHAS || {};
  window.SACOHAS.gallery = {
    init,
    openLightbox,
    closeLightbox,
    nextImage,
    prevImage,
  };

})();
