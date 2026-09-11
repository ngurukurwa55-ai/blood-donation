/**
 * SACOHAS College - Programs Module
 * Handles program search, filtering, and details modal
 */

(function () {
  "use strict";

  // Program data
  const programs = [
    {
      id: 1,
      name: "Clinical Medicine",
      category: "clinical",
      categoryLabel: "Clinical Programs",
      duration: "3 Years",
      level: "Diploma",
      description:
        "Comprehensive training in clinical diagnosis, treatment, and patient care. Prepares students for careers in clinical medicine.",
      fullDescription:
        "The Clinical Medicine program provides comprehensive training in clinical diagnosis, treatment, and patient care. Students gain practical experience through clinical rotations and hands-on training in healthcare settings.",
      requirements:
        "Secondary education with passing grades in Biology, Chemistry, and Mathematics. English proficiency required.",
      career:
        "Graduates can pursue careers as Clinical Officers, Medical Assistants, and healthcare professionals in various healthcare settings.",
    },
    {
      id: 2,
      name: "Nursing and Midwifery",
      category: "nursing",
      categoryLabel: "Nursing Programs",
      duration: "3 Years",
      level: "Diploma",
      description:
        "Professional nursing education with focus on patient care, midwifery, and community health.",
      fullDescription:
        "The Nursing and Midwifery program prepares students for professional nursing practice with emphasis on patient care, midwifery, and community health. Students develop clinical skills through practical experience.",
      requirements:
        "Secondary education with passing grades in Biology, Chemistry, and Mathematics. English proficiency required.",
      career:
        "Graduates can pursue careers as Registered Nurses, Midwives, Community Health Nurses, and healthcare professionals.",
    },
    {
      id: 3,
      name: "Public Health",
      category: "public-health",
      categoryLabel: "Public Health",
      duration: "3 Years",
      level: "Diploma",
      description:
        "Community health, disease prevention, and health promotion training for public health professionals.",
      fullDescription:
        "The Public Health program focuses on community health, disease prevention, and health promotion. Students learn to address public health challenges and promote health in communities.",
      requirements:
        "Secondary education with passing grades in Biology, Chemistry, and Mathematics. English proficiency required.",
      career:
        "Graduates can pursue careers as Public Health Officers, Health Educators, Community Health Workers, and health program coordinators.",
    },
    {
      id: 4,
      name: "Pharmacy",
      category: "pharmacy",
      categoryLabel: "Pharmacy",
      duration: "3 Years",
      level: "Diploma",
      description:
        "Training in pharmaceutical sciences, medication management, and pharmacy practice.",
      fullDescription:
        "The Pharmacy program provides training in pharmaceutical sciences, medication management, and pharmacy practice. Students learn about drug development, dispensing, and patient care.",
      requirements:
        "Secondary education with passing grades in Biology, Chemistry, and Mathematics. English proficiency required.",
      career:
        "Graduates can pursue careers as Pharmacists, Pharmacy Technicians, and pharmaceutical professionals in various settings.",
    },
    {
      id: 5,
      name: "Medical Laboratory Sciences",
      category: "laboratory",
      categoryLabel: "Laboratory Sciences",
      duration: "3 Years",
      level: "Diploma",
      description:
        "Training in medical laboratory techniques, diagnostics, and clinical laboratory practice.",
      fullDescription:
        "The Medical Laboratory Sciences program provides training in medical laboratory techniques, diagnostics, and clinical laboratory practice. Students gain practical skills in laboratory procedures.",
      requirements:
        "Secondary education with passing grades in Biology, Chemistry, and Mathematics. English proficiency required.",
      career:
        "Graduates can pursue careers as Medical Laboratory Technologists, Laboratory Scientists, and diagnostic professionals.",
    },
    {
      id: 6,
      name: "Health Informatics",
      category: "informatics",
      categoryLabel: "Health Informatics",
      duration: "3 Years",
      level: "Diploma",
      description:
        "Training in health information systems, data management, and healthcare technology.",
      fullDescription:
        "The Health Informatics program provides training in health information systems, data management, and healthcare technology. Students learn to manage health information and use technology in healthcare.",
      requirements:
        "Secondary education with passing grades in Biology, Chemistry, and Mathematics. English proficiency required.",
      career:
        "Graduates can pursue careers as Health Informatics Officers, Health Data Managers, and healthcare technology professionals.",
    },
  ];

  // DOM Elements
  let searchInput;
  let filterButtons;
  let programsGrid;
  let programCount;

  // Modal elements
  let modal;
  let modalOverlay;
  let modalClose;
  let modalBody;

  /**
   * Get category color
   */
  function getCategoryColor(category) {
    const colors = {
      clinical: "#0B1F3A",
      nursing: "#0F766E",
      "public-health": "#D4AF37",
      pharmacy: "#1F2937",
      laboratory: "#6B7280",
      informatics: "#0B1F3A",
    };
    return colors[category] || "#0B1F3A";
  }

  /**
   * Render program cards
   */
  function renderPrograms(filteredPrograms) {
    if (!programsGrid) return;

    if (filteredPrograms.length === 0) {
      programsGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <p style="font-size: 1.2rem; color: var(--medium-gray);">
                        No programs found matching your criteria.
                    </p>
                </div>
            `;
      return;
    }

    programsGrid.innerHTML = filteredPrograms
      .map(
        (program) => `
            <div class="card program-card" data-id="${program.id}">
                <div class="card-content">
                    <span class="program-category" style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; background: ${getCategoryColor(program.category)}; color: white; margin-bottom: 0.5rem;">
                        ${program.categoryLabel}
                    </span>
                    <h3>${program.name}</h3>
                    <p>${program.description}</p>
                    <span class="program-duration" style="display: inline-block; margin-top: 0.5rem; font-size: 0.875rem; color: var(--medium-gray);">
                        ⏱️ ${program.duration}
                    </span>
                    <div style="margin-top: 1rem;">
                        <button class="btn btn-outline btn-sm view-details" data-id="${program.id}">View Details</button>
                    </div>
                </div>
            </div>
        `,
      )
      .join("");

    // Update count
    if (programCount) {
      programCount.textContent = filteredPrograms.length;
    }

    // Add event listeners to view details buttons
    document.querySelectorAll(".view-details").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = parseInt(this.getAttribute("data-id"));
        const program = programs.find((p) => p.id === id);
        if (program) {
          openModal(program);
        }
      });
    });
  }

  /**
   * Filter programs
   */
  function filterPrograms() {
    const searchTerm = searchInput
      ? searchInput.value.toLowerCase().trim()
      : "";
    const activeCategory = document.querySelector(".filter-btn.active");
    const category = activeCategory
      ? activeCategory.getAttribute("data-category")
      : "all";

    const filtered = programs.filter((program) => {
      // Search filter
      const matchesSearch =
        program.name.toLowerCase().includes(searchTerm) ||
        program.description.toLowerCase().includes(searchTerm) ||
        program.categoryLabel.toLowerCase().includes(searchTerm);

      // Category filter
      const matchesCategory =
        category === "all" || program.category === category;

      return matchesSearch && matchesCategory;
    });

    renderPrograms(filtered);
  }

  /**
   * Open program details modal
   */
  function openModal(program) {
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
            <div style="padding: 1rem 0;">
                <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; background: ${getCategoryColor(program.category)}; color: white; margin-bottom: 1rem;">
                    ${program.categoryLabel}
                </span>
                <h2 id="modalTitle" style="font-size: 1.75rem; margin-bottom: 0.5rem;">${program.name}</h2>
                <p style="color: var(--medium-gray); margin-bottom: 1rem;">
                    ⏱️ ${program.duration} · ${program.level}
                </p>
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="font-weight: 600; margin-bottom: 0.25rem;">Description</h4>
                    <p>${program.fullDescription}</p>
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="font-weight: 600; margin-bottom: 0.25rem;">Entry Requirements</h4>
                    <p>${program.requirements}</p>
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="font-weight: 600; margin-bottom: 0.25rem;">Career Opportunities</h4>
                    <p>${program.career}</p>
                </div>
                <a href="admissions.html#apply" class="btn btn-primary">Apply Now</a>
            </div>
        `;

    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    modal.setAttribute("aria-hidden", "false");

    // Focus trap
    setTimeout(() => {
      if (modalClose) modalClose.focus();
    }, 100);
  }

  /**
   * Close modal
   */
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
    modal.setAttribute("aria-hidden", "true");
  }

  /**
   * Initialize programs module
   */
  function init() {
    if (programsGrid?.dataset.initialized === "true") return;

    // Get DOM elements
    searchInput = document.getElementById("programSearch");
    filterButtons = document.querySelectorAll(".filter-btn");
    programsGrid = document.getElementById("programsGrid");
    programCount = document.getElementById("programCount");

    // Modal elements
    modal = document.getElementById("programModal");
    modalOverlay = document.getElementById("modalOverlay");
    modalClose = document.getElementById("modalClose");
    modalBody = document.getElementById("modalBody");

    // Render initial programs
    if (programsGrid) {
      programsGrid.dataset.initialized = "true";
      renderPrograms(programs);
    }

    // Search event listener
    if (searchInput) {
      searchInput.addEventListener("input", filterPrograms);
    }

    // Filter button event listeners
    if (filterButtons) {
      filterButtons.forEach((btn) => {
        btn.addEventListener("click", function () {
          filterButtons.forEach((b) => {
            b.classList.remove("active");
            b.setAttribute("aria-pressed", "false");
          });
          this.classList.add("active");
          this.setAttribute("aria-pressed", "true");
          filterPrograms();
        });
      });
    }

    // Modal event listeners
    if (modalClose) {
      modalClose.addEventListener("click", closeModal);
    }

    if (modalOverlay) {
      modalOverlay.addEventListener("click", closeModal);
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal && modal.classList.contains("open")) {
        closeModal();
      }
    });

  }

  // Export for use in main.js
  window.SACOHAS = window.SACOHAS || {};
  window.SACOHAS.programs = {
    init: init,
    filterPrograms: filterPrograms,
    renderPrograms: renderPrograms,
    openModal: openModal,
    closeModal: closeModal,
  };

})();
