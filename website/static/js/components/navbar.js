const navigation = document.querySelector("#navigation");
const navToggle = document.querySelector(".mobile-nav-toggle");

const DATA_VISIBLE = "data-visible";

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

export default {};
