document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================================
     INTERSECTION OBSERVER FOR SCROLL REVEAL
     ========================================================================== */
  const revealElements = document.querySelectorAll(".reveal");
  
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          // Staggered reveal for child elements if they exist
          const staggerItems = entry.target.querySelectorAll(".skills-card, .project-card, .timeline-item");
          staggerItems.forEach((item, index) => {
            setTimeout(() => {
              item.style.opacity = "1";
              item.style.transform = "translateY(0)";
            }, index * 100);
          });
          // Unobserve after showing
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ==========================================================================
     ACTIVE NAVIGATION LINK HIGHLIGHTING
     ========================================================================== */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const navObserverOptions = {
    root: null,
    rootMargin: "-30% 0px -50% 0px",
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach((section) => navObserver.observe(section));

  /* ==========================================================================
     SCROLL PROGRESS BAR & HEADER STATE
     ========================================================================== */
  const progressBar = document.querySelector(".scroll-progress");
  const header = document.getElementById("siteHeader");

  window.addEventListener("scroll", () => {
    // Scroll progress width
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (docHeight > 0) {
      const scrolled = (window.scrollY / docHeight) * 100;
      if (progressBar) progressBar.style.width = `${scrolled}%`;
    }

    // Shrink header on scroll
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }, { passive: true });

  /* ==========================================================================
     MOBILE NAVIGATION MENU
     ========================================================================== */
  const hamburger = document.getElementById("hamburger");
  const mainNav = document.getElementById("mainNav");
  
  if (hamburger && mainNav) {
    hamburger.addEventListener("click", () => {
      const isOpen = mainNav.classList.contains("open");
      mainNav.classList.toggle("open", !isOpen);
      hamburger.classList.toggle("close", !isOpen);
      hamburger.setAttribute("aria-expanded", !isOpen);
    });

    // Close menu when clicking a link
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        hamburger.classList.remove("close");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        mainNav.classList.contains("open") &&
        !mainNav.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        mainNav.classList.remove("open");
        hamburger.classList.remove("close");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ==========================================================================
     THEME TOGGLER (DARK / LIGHT)
     ========================================================================== */
  const modeToggle = document.getElementById("modeToggle");
  const modeIcon = document.getElementById("modeIcon");
  const modeLabel = document.getElementById("modeLabel");

  function updateThemeUI(isLight) {
    if (isLight) {
      document.documentElement.classList.add("light");
      if (modeIcon) modeIcon.textContent = "🌙";
      // if (modeLabel) modeLabel.textContent = "Dark";
    } else {
      document.documentElement.classList.remove("light");
      if (modeIcon) modeIcon.textContent = "☀️";
      // if (modeLabel) modeLabel.textContent = "Light";
    }
  }

  // Initial Sync from root element state set by head script
  const initialIsLight = document.documentElement.classList.contains("light");
  updateThemeUI(initialIsLight);

  if (modeToggle) {
    modeToggle.addEventListener("click", () => {
      const isLight = document.documentElement.classList.contains("light");
      const nextLight = !isLight;
      
      updateThemeUI(nextLight);
      localStorage.setItem("theme", nextLight ? "light" : "dark");
    });
  }

  // React to system color scheme shifts
  const systemPrefLight = window.matchMedia("(prefers-color-scheme: light)");
  systemPrefLight.addEventListener("change", (e) => {
    // Only update if the user hasn't explicitly set a preference in localStorage
    if (!localStorage.getItem("theme")) {
      updateThemeUI(e.matches);
    }
  });

  /* ==========================================================================
     TOAST NOTIFICATIONS
     ========================================================================== */
  function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", "alert");
    
    // Add visual icon based on type
    const icon = type === "success" ? "✓" : "✗";
    toast.innerHTML = `<span aria-hidden="true">${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Trigger reflow to apply transitions
    toast.offsetHeight;
    toast.classList.add("show");

    // Remove after timeout
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }

  /* ==========================================================================
     CONTACT FORM SUBMISSION (EmailJS)
     ========================================================================== */
  // ---- EmailJS config ---------------------------------------------------
  // Fill these in from your EmailJS dashboard (https://dashboard.emailjs.com):
  //   1. Account > General               -> "Public Key"    -> EMAILJS_PUBLIC_KEY
  //   2. Email Services > your service   -> "Service ID"    -> EMAILJS_SERVICE_ID
  //   3. Email Templates > your template -> "Template ID"   -> EMAILJS_TEMPLATE_ID
  // The public key only authorizes sends through templates you control — it
  // can't read, list, or delete anything in your account — so it's safe to
  // ship in client-side JS. This is different from a provider secret key
  // (SendGrid/Mailgun/Resend), which must never appear in browser-readable code.
  const EMAILJS_PUBLIC_KEY = "OV2gy46U06Qzi2RdL";
  const EMAILJS_SERVICE_ID = "service_8gsk8fb";
  const EMAILJS_TEMPLATE_ID = "template_ddt9vlr";
  const emailjsReady = typeof window.emailjs !== "undefined" && EMAILJS_PUBLIC_KEY.indexOf("YOUR_") !== 0;

  if (emailjsReady) {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }
  // ------------------------------------------------------------------------

  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const submitText = submitBtn.querySelector("span");
      const originalText = submitText ? submitText.textContent : "Send Message";

      if (!emailjsReady) {
        showToast(
          "The contact form isn't configured yet. Please email me directly at yugeshmarahatta@gmail.com.",
          "error"
        );
        return;
      }

      // Update loading state
      submitBtn.disabled = true;
      if (submitText) submitText.textContent = "Sending...";
      submitBtn.style.opacity = "0.7";

      try {
        // sendForm reads each input's "name" attribute (name / email / message)
        // and maps it to the matching {{variable}} in your EmailJS template.
        await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm);
        showToast("Your message was sent successfully! I will get back to you soon.", "success");
        contactForm.reset();
      } catch (err) {
        showToast("Error sending message. Please check your network connection.", "error");
      } finally {
        // Reset button state
        submitBtn.disabled = false;
        if (submitText) submitText.textContent = originalText;
        submitBtn.style.opacity = "1";
      }
    });
  }
});