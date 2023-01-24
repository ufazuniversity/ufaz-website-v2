const navigation = document.querySelector("#navigation");
const navToggle = document.querySelector(".mobile-nav-toggle");
const header = document.querySelector("header.site-header");

const DATA_VISIBLE = "data-visible";

function initMenuToggle() {
  // Toggle navbar on mobile view
  navToggle.addEventListener("click", () => {
    const visible = navigation.getAttribute("data-visible");
    if (visible == "false") {
      navigation.setAttribute(DATA_VISIBLE, true);
      navToggle.setAttribute("aria-expanded", true);
    } else if (visible == "true") {
      navigation.setAttribute(DATA_VISIBLE, false);
      navToggle.setAttribute("aria-expanded", false);
    }
  });
}

function setBodyTopPadding() {
  // Set padding on top of body based on header height
  const headerHeight = header.clientHeight;
  document.body.style.paddingTop = `${headerHeight}px`;
}

function initScrollActivatedStickyNav() {
  // Scroll-activated sticky header
  const body = document.body;
  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
      body.classList.remove("scroll-up");
    }
    if (currentScroll > lastScroll && !body.classList.contains("scroll-down")) {
      body.classList.remove("scroll-up");
      body.classList.add("scroll-down");
    }

    if (currentScroll < lastScroll && body.classList.contains("scroll-down")) {
      body.classList.remove("scroll-down");
      body.classList.add("scroll-up");
    }
    lastScroll = currentScroll;
  });
}

initMenuToggle();
setBodyTopPadding();
initScrollActivatedStickyNav();

export default {};
