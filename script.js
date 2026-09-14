/* ALWAYS OPEN AT THE TOP */

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.scrollTo(0, 0);


/* NAVIGATION */

const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");


/* MOBILE MENU */

if (hamburger && navLinks) {

  hamburger.addEventListener("click", () => {

    navLinks.classList.toggle("show");

  });


  // Close menu after clicking a navigation link

  document
    .querySelectorAll(".nav-links a")
    .forEach((link) => {

      link.addEventListener("click", () => {

        navLinks.classList.remove("show");

      });

    });

}


/* SMOOTH SCROLL */

document
  .querySelectorAll('a[href^="#"]')
  .forEach((anchor) => {

    anchor.addEventListener("click", function (event) {

      const targetId =
        this.getAttribute("href");

      const target =
        document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      const navbar =
        document.querySelector(".navbar");

      const offset =
        navbar
          ? navbar.offsetHeight + 15
          : 15;

      const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        offset;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });

    });

  });


/* =========================================================
   STATS COUNTER (count up once when the stats bar scrolls
   into view for the first time)
========================================================= */

function initStatsCounter() {

  const statNumbers =
    document.querySelectorAll(".stat-number");

  if (!statNumbers.length) {
    return;
  }

  const animateNumber = (el) => {

    const target =
      parseInt(el.getAttribute("data-target"), 10) || 0;

    const duration = 1400;

    const startTime = performance.now();

    const step = (now) => {

      const progress =
        Math.min((now - startTime) / duration, 1);

      const eased =
        1 - Math.pow(1 - progress, 3);

      const value =
        Math.floor(eased * target);

      el.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }

    };

    requestAnimationFrame(step);

  };

  const observer = new IntersectionObserver(
    (entries, obs) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          animateNumber(entry.target);

          obs.unobserve(entry.target);

        }

      });

    },
    { threshold: 0.6 }
  );

  statNumbers.forEach((el) => observer.observe(el));

}

initStatsCounter();


/* =========================================================
   SCROLL "MAGIC TEXT" REVEAL
   Splits a paragraph into per-word spans and lights each
   word up progressively as the section scrolls through the
   viewport - the text appears to "write itself" on scroll.
========================================================= */

function initScrollReveal() {

  const revealEls =
    document.querySelectorAll("[data-reveal]");

  if (!revealEls.length) {
    return;
  }

  const sections = [];

  revealEls.forEach((el) => {

    const text = el.textContent.trim();

    const words = text.split(/\s+/);

    el.innerHTML = words
      .map((word) => `<span class="reveal-word">${word}</span>`)
      .join(" ");

    sections.push({
      el,
      words: el.querySelectorAll(".reveal-word")
    });

  });

  const updateReveal = () => {

    const windowHeight = window.innerHeight;

    sections.forEach(({ el, words }) => {

      const rect = el.getBoundingClientRect();

      const start = windowHeight * 0.9;
      const end = windowHeight * 0.35;
      const total = start - end;

      const progress =
        Math.min(
          Math.max((start - rect.top) / total, 0),
          1
        );

      const activeCount =
        Math.round(progress * words.length);

      words.forEach((word, i) => {

        if (i < activeCount) {
          word.classList.add("is-active");
        } else {
          word.classList.remove("is-active");
        }

      });

    });

  };

  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {

      if (!ticking) {

        requestAnimationFrame(() => {
          updateReveal();
          ticking = false;
        });

        ticking = true;

      }

    },
    { passive: true }
  );

  window.addEventListener("resize", updateReveal);

  updateReveal();

}

initScrollReveal();


/* =========================================================
   FULL-WIDTH IMAGE SLIDER (gallery)
   Amazon-style: one photo at a time, arrows + dots,
   swipe support, autoplay, loops both ways.
========================================================= */

function initGallerySlider() {

  const track = document.getElementById("sliderTrack");
  const prevBtn = document.getElementById("sliderPrev");
  const nextBtn = document.getElementById("sliderNext");
  const dotsWrap = document.getElementById("sliderDots");
  const sliderEl = document.getElementById("gallerySlider");

  if (!track || !prevBtn || !nextBtn || !dotsWrap || !sliderEl) {
    return;
  }

  const slides = track.querySelectorAll(".slide");
  const total = slides.length;

  if (!total) {
    return;
  }

  let current = 0;
  let autoplay = null;


  /* Build dots */

  slides.forEach((_, i) => {

    const dot = document.createElement("button");

    dot.classList.add("slider-dot");

    if (i === 0) {
      dot.classList.add("active");
    }

    dot.setAttribute("aria-label", `Go to photo ${i + 1}`);
    dot.setAttribute("type", "button");

    dot.addEventListener("click", () => {
      goTo(i);
    });

    dotsWrap.appendChild(dot);

  });

  const dots = dotsWrap.querySelectorAll(".slider-dot");


  function update() {

    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
    });

  }

  function goTo(index) {

    current = (index + total) % total;

    update();

  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }


  /* Arrow clicks */

  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);


  /* Keyboard arrows when slider is hovered */

  let hovering = false;

  sliderEl.addEventListener("mouseenter", () => {
    hovering = true;
  });

  sliderEl.addEventListener("mouseleave", () => {
    hovering = false;
  });

  document.addEventListener("keydown", (e) => {

    if (!hovering) {
      return;
    }

    if (e.key === "ArrowRight") {
      next();
    }

    if (e.key === "ArrowLeft") {
      prev();
    }

  });


  /* Swipe support (touch) */

  let startX = 0;
  let isDragging = false;

  track.addEventListener("touchstart", (e) => {

    startX = e.touches[0].clientX;
    isDragging = true;

  }, { passive: true });

  track.addEventListener("touchend", (e) => {

    if (!isDragging) {
      return;
    }

    isDragging = false;

    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 40) {

      if (diff > 0) {
        next();
      } else {
        prev();
      }

    }

  }, { passive: true });


  /* Autoplay, pauses on hover */

  function startAutoplay() {

    autoplay = setInterval(next, 5000);

  }

  function stopAutoplay() {

    clearInterval(autoplay);

  }

  sliderEl.addEventListener("mouseenter", stopAutoplay);
  sliderEl.addEventListener("mouseleave", startAutoplay);

  startAutoplay();


  update();

}

initGallerySlider();


/* EVENT DATA */

const events = {

  orientation: {

    date: "26 Jan 2026",

    title:
      "Introduction & Orientation of Central University Jammu Cloud Club",

    description:
      "Kickstart your cloud journey and explore opportunities within the AWS Student Builder Group at Central University Of Jammu.",

    category:
      "Community Orientation"

  },


  ama: {

    date: "01 Mar 2026",

    title:
      "Interactive Ask Me Anything Session (AMA)",

    description:
      "An interactive AMA session to discuss AWS Cloud insights, practices, applications and opportunities for students.",

    category:
      "AWS Community Session"

  },


  techxplore: {

    date: "10 Apr 2026",

    title:
      "AWS TechXplore",

    description:
      "A technical session covering cloud deployment, IAM fundamentals and practical AWS concepts.",

    category:
      "Technical Session"

  },


  kiro: {

    date: "27 Jun 2026",

    title:
      "From Idea to App: Building with IDE & Kiro CLI",

    description:
      "A practical session with Jasdeep Singh Bhalla focused on transforming ideas into applications using modern development tools.",

    category:
      "Technical Workshop"

  },


  "agentic-ai": {

    date: "01 Jul 2026",

    title:
      "Agentic AI on AWS",

    description:
      "AI Tech Talk Series hosted by AWS Skills Centers exploring agentic AI and its relationship with AWS technologies.",

    category:
      "AI Tech Talk"

  },


  "welcome-2026": {

    date: "14 Sep 2026",

    title:
      "Welcome 2026",

    description:
      "Our Welcome 2026 event featured a talk by Dr. Suresh Limkar on cloud computing and becoming a builder, followed by a fun quiz with shout-outs and prizes for the top scorers.",

    category:
      "• Lecture & Quiz"

  },


  "community-day": {

    date: "November 2026",

    title:
      "AWS Student Community Day",

    description:
      "A full day of community-led cloud learning inspired by AWS's own Community Day events across India — technical talks on AWS, generative AI and DevOps, hands-on demo stations, and open conversations with the community.",

    category:
      "Upcoming • Community Conference"

  },


  "cloud-tournament": {

    date: "Coming Soon",

    title:
      "Cloud Tournament",

    description:
      "A gamified, team-based cloud competition inspired by AWS GameDay and AWS Cloud Quest tournaments, where teams race through live AWS labs and scenario challenges on a shared leaderboard.",

    category:
      "Upcoming • Online Labs & Tournament"

  }

};


/* EVENT DETAIL PAGE */

function loadEventDetails() {

  const eventPage =
    document.querySelector(".event-detail-page");

  if (!eventPage) {
    return;
  }

  const params =
    new URLSearchParams(
      window.location.search
    );

  const eventId =
    params.get("event");

  const event =
    events[eventId] ||
    events.orientation;


  const eventDate =
    document.getElementById("eventDate");

  const eventCategory =
    document.getElementById("eventCategory");

  const eventTitle =
    document.getElementById("eventTitle");

  const eventDescription =
    document.getElementById("eventDescription");


  if (eventDate) {
    eventDate.textContent =
      event.date;
  }

  if (eventCategory) {
    eventCategory.textContent =
      event.category;
  }

  if (eventTitle) {
    eventTitle.textContent =
      event.title;
  }

  if (eventDescription) {
    eventDescription.textContent =
      event.description;
  }

}


/* RUN EVENT PAGE */

loadEventDetails();


/* CLOSE MOBILE MENU ON RESIZE */

window.addEventListener("resize", () => {

  if (
    window.innerWidth > 850 &&
    navLinks
  ) {

    navLinks.classList.remove("show");

  }

});