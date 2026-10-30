// door-arrival.js: the far side of a door on miruandmu.github.io.
// If you walked here through a door on the rail, the door page left a note in this tab,
// so this page starts inside the same light and fades in out of it.
// Opened directly (no note), the page just loads as usual.
(function () {
  var note;
  try { note = sessionStorage.getItem("mm-door"); if (note) sessionStorage.removeItem("mm-door"); } catch (err) { return; }
  if (!note) return;
  var light = "#fff6e0";
  try { light = JSON.parse(note).light || light; } catch (err) {}
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  var el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;opacity:1;transition:opacity .9s ease;background:" + light;
  document.documentElement.appendChild(el);
  function fade() { requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.opacity = "0"; setTimeout(function () { el.remove(); }, 1000); }); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fade); else fade();
})();
