/* theme follows the OS/system preference — runs in <head> before first paint.
   No manual switch: dark UI on a system in dark mode, light UI in light mode. */
(function () {
  function sysTheme() {
    try {
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    } catch (e) {
      return "dark";
    }
  }

  function apply() {
    document.documentElement.setAttribute("data-theme", sysTheme());
  }
  apply();

  /* live-update if the user changes their system theme while the page is open */
  try {
    var mq = window.matchMedia("(prefers-color-scheme: light)");
    if (mq.addEventListener) mq.addEventListener("change", apply);
    else if (mq.addListener) mq.addListener(apply);
  } catch (e) {}
})();
