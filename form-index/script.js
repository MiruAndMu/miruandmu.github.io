// Miru Sou — Form Index
// Interactive logic for the form gallery, now in the same house as the door rail and The Fox's Gallery:
// the five worlds, a brass picture light over every form, and a frame for each form made from its own colors.
// Every word on the cards, in the close-ups, the guidestones and the timeline comes from forms-data.js and
// guidestones-data.js, unchanged.

(function () {
    "use strict";

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var root = document.documentElement;
    function $(id) { return document.getElementById(id); }

    // Size of each image and the size of one art pixel in it, measured once from the files, so frames can be laid
    // out before the art loads and half-block forms land on whole device pixels. A form missing from this list still
    // works: its size is read from the image when it loads.
    var DIMS = {
        "../forms/v5.png": [480, 180, 3], "../forms/v6.gif": [480, 240, 4], "../forms/v7.png": [340, 312, 1],
        "../forms/v8.png": [340, 328, 1], "../forms/v9.gif": [460, 264, 1], "../forms/v10.gif": [660, 482, 1],
        "../forms/chef-ba.gif": [400, 420, 1], "../forms/form-8.gif": [576, 192, 4], "../forms/lawyer-ba.gif": [400, 480, 8],
        "../forms/crime-boss-ba.gif": [400, 480, 8], "../forms/kitsune-miku.gif": [400, 480, 8], "../forms/miru-world-fox.gif": [640, 480, 8],
        "../forms/pink-ba.gif": [400, 512, 8], "../forms/first-form.gif": [480, 640, 8],
        "../forms/autumn-form.png": [409, 1100, 1], "../forms/autumn-kitsune.png": [800, 1200, 1]
    };
    var NAT = {};     // sizes read from images that weren't in DIMS
    var PAL = {};     // palette per form, sampled once from its art
    var STILL = {};   // the loaded image per form (a GIF's first frame is drawn from it when motion is reduced)

    // ---------- small helpers ----------
    function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    function pad2(n) { return String(n).padStart(2, "0"); }
    function isGif(f) { return /\.gif$/i.test(f.image); }
    // every form drawn in pixels or text cells is shown hard-edged; only the painted and watercolor forms are smoothed
    function isPixel(f) { var t = f.tags || []; return t.indexOf("painted") < 0 && t.indexOf("watercolor") < 0; }
    function frameKind(f) {          // which kind of frame a form gets
        if (f.failed) return "slim";   // the failures stay too, in a plain dark frame
        return isPixel(f) ? "pixel" : "wood";
    }
    function fmtDate(s, month) { return new Date(s + "T12:00:00").toLocaleDateString("en-US", { month: month, day: "numeric", year: "numeric" }); }
    function badgeOf(f) {
        var cls = f.failed ? "badge-failed" : f.category === "commission" ? "badge-commission" : f.category === "experiment" ? "badge-experiment" : "badge-self";
        var text = f.failed ? "Failed" : f.category === "commission" ? "Commission" : f.category === "experiment" ? "Experiment" : "Self";
        return { cls: cls, text: text };
    }
    function pending(box, text) {
        box.innerHTML = "";
        box.classList.remove("px");
        box.appendChild(el("pre", "pending", text));
    }

    // ---------- color: sampled from each form, then tuned against the wall (borrowed from The Fox's Gallery) ----------
    function toHsl(c) {
        var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), h = 0, s = 0, l = (mx + mn) / 2;
        if (mx !== mn) {
            var d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
            h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
        }
        return [h, s, l];
    }
    function hsl(h, s, l, a) { h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l)); return "hsl(" + h.toFixed(0) + " " + (s * 100).toFixed(0) + "% " + (l * 100).toFixed(0) + "%" + (a != null ? " / " + a : "") + ")"; }
    function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
    function mixHue(a, b, t) { var d = ((b - a + 540) % 360) - 180; return a + d * t; }

    function samplePalette(src) {
        var c = document.createElement("canvas"); c.width = c.height = 40;
        var g = c.getContext("2d", { willReadFrequently: true });
        g.drawImage(src, 0, 0, 40, 40);
        var d; try { d = g.getImageData(0, 0, 40, 40).data; } catch (err) { return null; }
        var buckets = {}, px = [];
        for (var i = 0; i < d.length; i += 4) {
            if (d[i + 3] < 128) continue;
            var r = d[i], gg = d[i + 1], b = d[i + 2];
            var k = (r >> 5) * 64 + (gg >> 5) * 8 + (b >> 5);
            var bk = buckets[k] || (buckets[k] = { n: 0, r: 0, g: 0, b: 0 });
            bk.n++; bk.r += r; bk.g += gg; bk.b += b;
            px.push([r, gg, b, .2126 * r + .7152 * gg + .0722 * b]);
        }
        if (!px.length) return null;
        var list = Object.keys(buckets).map(function (k) { var x = buckets[k]; return { n: x.n, c: [x.r / x.n, x.g / x.n, x.b / x.n] }; }).sort(function (a, b) { return b.n - a.n; });
        var dom = list[0].c;
        for (var j = 0; j < Math.min(6, list.length); j++) {    // prefer the main color that has some color in it
            if (list[j].n >= px.length * .06 && toHsl(list[j].c)[1] > .18) { dom = list[j].c; break; }
        }
        px.sort(function (a, b) { return a[3] - b[3]; });
        function avg(from, to) { var s = [0, 0, 0], n = 0; for (var q = from; q < to; q++) { s[0] += px[q][0]; s[1] += px[q][1]; s[2] += px[q][2]; n++; } return [s[0] / n, s[1] / n, s[2] / n]; }
        var n = px.length;
        return { dom: toHsl(dom), shadow: toHsl(avg(0, Math.max(1, Math.round(n * .2)))), light: toHsl(avg(Math.round(n * .85), n)) };
    }

    function wallIsLight() { var w = root.getAttribute("data-world"); return ["day", "dawn", "washi"].indexOf(w) >= 0; }

    // Turn a palette into a frame. v (0..2) is the form's place in the index, so neighbors never match.
    // compact = on a card, where the gallery's wide mats would leave little room for the art; the close-up gets them in full.
    function frameLook(f, pal, v, compact) {
        var light = wallIsLight();
        var dom = pal ? pal.dom : [30, .3, .45], sh = pal ? pal.shadow : [260, .2, .15], li = pal ? pal.light : [40, .3, .85];
        var kind = frameKind(f), L = {};
        if (kind === "pixel") {
            var base = v === 1 ? sh : dom;                       // alternate between the art's main color and its shadow
            var s = clamp(base[1], .22, .62), l = light ? clamp(base[2], .2, .4) : clamp(base[2], .3, .5);
            if (v === 1) l = light ? .2 : .3;
            L.step = [6, 8, 5][v]; L.width = L.step * [2, 2, 3][v];
            L.main = hsl(base[0], s, l);
            L.hi = hsl(base[0], s, l + .14);
            L.lo = hsl(base[0], s, l - .12);
            L.mat = v === 2 ? hsl(li[0], clamp(li[1], .1, .4), clamp(li[2], .8, .92)) : hsl(sh[0], clamp(sh[1], .1, .5), clamp(sh[2], .06, .14));
            L.matW = v === 2 ? L.step * 2 : L.step;
        } else if (kind === "wood") {
            var hue = mixHue(28, dom[0], .3);
            var wl = [light ? .34 : .44, light ? .5 : .58, light ? .26 : .38][v];
            L.main = hsl(hue, [.45, .4, .38][v], wl);
            L.hi = hsl(hue, .4, wl + .12); L.lo = hsl(hue, .4, wl - .1);
            L.width = [9, 7, 11][v];
            L.mat = hsl(mixHue(42, dom[0], .25), .32 + .1 * (v === 1), [.93, .9, .95][v]);
            L.bevel = hsl(sh[0], clamp(sh[1], .1, .4), .3, .45);
            L.matW = compact ? [14, 12, 16][v] : [34, 28, 40][v];
        } else {
            var dl = light ? .09 : .14;
            L.main = hsl(sh[0], clamp(sh[1], .05, .2), dl + .03 * v);
            L.hi = hsl(sh[0], .12, dl + .2); L.lo = "#000";
            L.width = [6, 5, 7][v];
            L.mat = v === 1 ? hsl(sh[0], .1, .06) : null;
            L.matW = v === 1 ? 10 : 0;
        }
        L.kind = kind; L.v = v;
        return L;
    }

    function stepClip(s) {   // corners cut away in two hard steps
        var a = s + "px", b = (2 * s) + "px", ra = "calc(100% - " + a + ")", rb = "calc(100% - " + b + ")";
        return "polygon(0 " + b + "," + a + " " + b + "," + a + " " + a + "," + b + " " + a + "," + b + " 0," + rb + " 0," + rb + " " + a + "," + ra + " " + a + "," + ra + " " + b + ",100% " + b +
            ",100% " + rb + "," + ra + " " + rb + "," + ra + " " + ra + "," + rb + " " + ra + "," + rb + " 100%," + b + " 100%," + b + " " + ra + "," + a + " " + ra + "," + a + " " + rb + ",0 " + rb + ")";
    }

    function paintFrame(frEl, matEl, L) {
        var f = frEl.style, m = matEl.style;
        f.padding = L.width + "px"; f.clipPath = ""; f.webkitClipPath = "";
        m.padding = (L.matW || 0) + "px"; m.background = L.mat || "transparent"; m.boxShadow = "";
        if (L.kind === "pixel") {
            var q = Math.max(2, Math.round(L.step / 2));
            f.background = L.main;
            f.boxShadow = "inset " + q + "px " + q + "px 0 " + L.hi + ", inset -" + q + "px -" + q + "px 0 " + L.lo;
            f.clipPath = f.webkitClipPath = stepClip(L.step);
            m.boxShadow = "inset 0 0 0 " + Math.max(2, q - 1) + "px " + L.lo;
        } else if (L.kind === "wood") {
            f.background = "repeating-linear-gradient(90deg, rgba(0,0,0,.07) 0 2px, transparent 2px 7px, rgba(255,255,255,.05) 7px 9px, transparent 9px 13px), " + L.main;
            f.boxShadow = "inset 1px 1px 0 " + L.hi + ", inset -1px -1px 0 " + L.lo;
            m.boxShadow = "inset 0 0 0 1px rgba(0,0,0,.08), inset 2px 2px 4px " + L.bevel;
        } else {
            f.background = L.main;
            f.boxShadow = "inset 0 0 0 1px " + L.hi + ", 0 0 0 1px rgba(0,0,0,.4)";
            if (L.mat) m.boxShadow = "inset 0 0 0 1px rgba(255,255,255,.06)";
        }
    }
    function framePad(L) { return L.width + (L.matW || 0); }

    // ---------- sizing ----------
    // Half-block forms are drawn at a whole number of device pixels per art pixel whenever that still fills most of the
    // space; otherwise they stay hard-edged while growing, and only shrinking ever lets the browser average pixels.
    function artSize(f, boxW, boxH) {
        boxW = Math.max(40, boxW); boxH = Math.max(40, boxH);
        var dm = DIMS[f.image] || NAT[f.id];
        if (!dm) { var s0 = Math.min(boxW, boxH); return { w: Math.round(s0), h: Math.round(s0 * .75), px: false }; }
        var w = dm[0], h = dm[1], b = dm[2] || 1, dpr = window.devicePixelRatio || 1;
        var fit = Math.min(boxW / w, boxH / h);
        if (isPixel(f)) {
            var aw = w / b, ah = h / b;
            var devPerArt = Math.min(boxW * dpr / aw, boxH * dpr / ah), k = Math.floor(devPerArt);
            if (k >= 1 && k / devPerArt >= .72) return { w: aw * k / dpr, h: ah * k / dpr, px: true };
            return { w: Math.floor(w * fit), h: Math.floor(h * fit), px: devPerArt >= 1 };   // growing: still hard pixels, just not all one width; shrinking: let the browser average
        }
        var s = Math.min(fit, 1);
        return { w: Math.round(w * s), h: Math.round(h * s), px: false };
    }

    // one framed form (on a card and in the close-up)
    function buildFrame(f, v, compact) {
        var hard = el("div", "hard"), fr = el("div", "fr"), mat = el("div", "mat"), box = el("div", "canvas-box");
        box.appendChild(el("div", "ph"));
        mat.appendChild(box); fr.appendChild(mat); hard.appendChild(fr);
        var L = frameLook(f, PAL[f.id], v, compact);
        paintFrame(fr, mat, L);
        return { hard: hard, fr: fr, mat: mat, box: box, L: L };
    }
    function sizeBox(box, size) {
        box.style.width = size.w + "px"; box.style.height = size.h + "px";
        box.classList.toggle("px", size.px);
    }
    // a GIF's first frame, held still on a canvas at one canvas pixel per image pixel
    function stillCanvas(img) {
        var c = document.createElement("canvas");
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        var g = c.getContext("2d"); g.imageSmoothingEnabled = false;
        g.drawImage(img, 0, 0);
        c.setAttribute("aria-hidden", "true");
        return c;
    }

    // ---------- the forms ----------
    var cards = [];
    function renderForms(forms) {
        var grid = $("forms-grid");
        grid.innerHTML = "";
        cards = forms.map(function (form, i) {
            var kind = frameKind(form), v = i % 3, b = badgeOf(form);
            var card = el("article", "form-card f-" + kind + (form.failed ? " failed" : "") + (form.featured ? " form-card--featured" : ""));
            card.dataset.category = form.category;
            card.dataset.formId = form.id;

            var hang = el("div", "hang"), hung = el("div", "hung");
            var F = buildFrame(form, v, true);
            hung.appendChild(el("div", "lamp"));
            hung.appendChild(F.hard);
            hung.appendChild(el("div", "spill"));
            hang.appendChild(hung);
            hang.appendChild(el("span", "card-badge " + b.cls, b.text));

            var info = el("div", "card-info");
            var num = el("div", "card-form-number", "FORM " + pad2(form.number));
            var h3 = el("h3", "card-title"), open = el("button", "card-open", form.title);
            open.type = "button";
            open.setAttribute("aria-haspopup", "dialog");
            var descId = "desc-" + form.id;
            open.setAttribute("aria-describedby", descId);
            h3.appendChild(open);
            var desc = el("p", "card-desc", form.description); desc.id = descId;
            var meta = el("div", "card-meta");
            var shown = [form.animated ? "animated" : "static", form.canvas].concat(form.tags.slice(0, 2));
            shown.filter(function (t, k) { return shown.indexOf(t) === k; })   // "static" or "animated" is often one of the tags too: show it once
                .forEach(function (t) { meta.appendChild(el("span", "meta-tag", t)); });
            info.appendChild(num); info.appendChild(h3); info.appendChild(desc); info.appendChild(meta);

            card.appendChild(hang); card.appendChild(info);
            grid.appendChild(card);
            var c = { f: form, i: i, v: v, el: card, hang: hang, F: F, open: open, loading: false };
            open.addEventListener("click", function () { openCloseup(c); });
            return c;
        });
        layoutAll();
        watchCards();
    }

    function layoutCard(c) {
        var hw = c.hang.clientWidth, hh = c.hang.clientHeight;
        if (!hw || !hh) return;
        var cs = getComputedStyle(c.hang);
        var innerW = hw - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        var innerH = hh - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        var pad = framePad(frameLook(c.f, null, c.v, true));
        sizeBox(c.F.box, artSize(c.f, innerW - 2 * pad, innerH - 2 * pad));
    }
    function layoutAll() { cards.forEach(layoutCard); }

    function retune(c) { c.F.L = frameLook(c.f, PAL[c.f.id], c.v, true); paintFrame(c.F.fr, c.F.mat, c.F.L); }

    function loadCard(c) {
        if (c.loading) return; c.loading = true;
        var f = c.f, img = new Image();
        img.decoding = "async"; img.alt = "";
        img.onload = function () {
            if (!DIMS[f.image] && !NAT[f.id]) { NAT[f.id] = [img.naturalWidth, img.naturalHeight, 1]; layoutCard(c); }
            STILL[f.id] = img;
            var ph = c.F.box.querySelector(".ph"); if (ph) ph.remove();
            if (isGif(f) && reduce) c.F.box.insertBefore(stillCanvas(img), c.F.box.firstChild);   // asked for less motion: the first frame, held still
            else { img.setAttribute("aria-hidden", "true"); c.F.box.insertBefore(img, c.F.box.firstChild); }
            if (!PAL[f.id]) PAL[f.id] = samplePalette(img);
            retune(c);
        };
        img.onerror = function () { pending(c.F.box, "art render\npending"); };
        img.src = f.image;
    }

    // art loads as it comes near; the picture light is on over the forms in the middle of the screen
    function watchCards() {
        if (!("IntersectionObserver" in window)) { cards.forEach(function (c) { loadCard(c); c.el.classList.add("lit"); }); return; }
        var near = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { if (e.isIntersecting) { var c = cards[+e.target.dataset.i]; loadCard(c); near.unobserve(e.target); } });
        }, { rootMargin: "700px 0px" });
        var middle = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { e.target.classList.toggle("lit", e.isIntersecting); });
        }, { rootMargin: "-40% 0px -40% 0px" });
        cards.forEach(function (c, i) { c.el.dataset.i = i; near.observe(c.el); middle.observe(c.el); });
    }

    // ---------- guidestones ----------
    function renderGuidestones(stones) {
        var grid = $("guidestones-grid");
        if (!grid) return;
        grid.innerHTML = "";
        stones.forEach(function (stone) {
            var g = el("div", "guidestone " + (stone.earned ? "earned" : "undiscovered"));
            g.appendChild(el("div", "stone-number", stone.numeral));
            stone.cracks.forEach(function (n) { g.appendChild(el("div", "stone-crack stone-crack-" + n)); });
            g.appendChild(el("h3", "stone-text", stone.title));
            g.appendChild(el("p", "stone-meaning", stone.meaning));
            grid.appendChild(g);
        });
    }

    // ---------- timeline ----------
    function renderTimeline(forms) {
        var list = $("timeline-container");
        list.innerHTML = "";
        // Sort by date then number
        var sorted = forms.slice().sort(function (a, b) {
            if (a.date === b.date) return a.number - b.number;
            return a.date.localeCompare(b.date);
        });
        sorted.forEach(function (form) {
            var li = el("li", "timeline-entry" + (form.failed ? " failed" : ""));
            li.appendChild(el("div", "timeline-date", fmtDate(form.date, "short") + " — Form " + pad2(form.number)));
            li.appendChild(el("h3", "timeline-title", form.title));
            li.appendChild(el("p", "timeline-desc", form.description));
            list.appendChild(li);
        });
    }

    // ---------- filters ----------
    function setupFilters() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
        var count = { all: FORMS.length };
        FORMS.forEach(function (f) { count[f.category] = (count[f.category] || 0) + 1; });
        buttons.forEach(function (btn) {
            var n = count[btn.dataset.filter] || 0;
            btn.appendChild(el("small", null, String(n)));
            btn.setAttribute("aria-label", btn.firstChild.textContent + ", " + n + (n === 1 ? " form" : " forms"));
            btn.addEventListener("click", function () {
                var filter = btn.dataset.filter;
                buttons.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
                var shown = 0;
                cards.forEach(function (c) {
                    var show = filter === "all" || c.f.category === filter, was = !c.el.hidden;
                    c.el.hidden = !show;
                    if (show) {
                        shown++;
                        if (!was && !reduce) { c.el.classList.remove("fade-in"); void c.el.offsetWidth; c.el.classList.add("fade-in"); }
                    }
                });
                layoutAll();
                $("filter-status").textContent = filter === "all" ? "Showing all " + FORMS.length + " forms." : "Showing " + shown + " of " + FORMS.length + " forms.";
            });
        });
        cards.forEach(function (c) { c.el.addEventListener("animationend", function () { c.el.classList.remove("fade-in"); }); });
    }

    // ---------- close-up ----------
    var closeup = $("closeup"), cuIn = $("cu-in"), mainEl = $("main");
    var cuList = [], cuIdx = -1, cuPushed = false, cuParts = null;
    function visibleCards() { return cards.filter(function (c) { return !c.el.hidden; }); }

    function cuBuild() {   // the parts that stay while you step from form to form
        if (cuParts) return cuParts;
        var art = el("div", "cu-art-slot"), nav = el("div", "cu-nav"), hint = el("p", "cu-hint"), plac = el("div", "placard");
        var prev = el("button", "cu-step"), next = el("button", "cu-step"), where = el("div", "cu-where");
        prev.type = next.type = "button"; prev.innerHTML = "&#8592;"; next.innerHTML = "&#8594;";
        where.setAttribute("aria-live", "polite");
        nav.appendChild(prev); nav.appendChild(where); nav.appendChild(next);
        prev.addEventListener("click", function () { cuStep(-1); });
        next.addEventListener("click", function () { cuStep(1); });
        cuIn.appendChild(art); cuIn.appendChild(hint); cuIn.appendChild(nav); cuIn.appendChild(plac);
        cuParts = { art: art, nav: nav, hint: hint, plac: plac, prev: prev, next: next, where: where };
        return cuParts;
    }

    function renderCloseup() {
        var P = cuBuild(), c = cuList[cuIdx], form = c.f;
        // the art, bigger, in the same frame
        P.art.innerHTML = "";
        var vw = Math.min(window.innerWidth - 32, 900), vh = Math.round(window.innerHeight * .56);
        var L0 = frameLook(form, PAL[form.id], c.v), pad = framePad(L0);
        var size = artSize(form, vw - 2 * pad, Math.max(180, vh - 2 * pad));
        var wrap = el("div", "cu-art f-" + frameKind(form)), hung = el("div", "hung");
        var F = buildFrame(form, c.v);
        sizeBox(F.box, size);
        hung.appendChild(el("div", "lamp")); hung.appendChild(F.hard); hung.appendChild(el("div", "spill"));
        wrap.appendChild(hung);
        P.art.appendChild(wrap);
        P.F = F; P.c = c;
        var holdStill = isGif(form) && reduce && STILL[form.id];
        if (holdStill) {
            var cv = stillCanvas(STILL[form.id]);
            cv.setAttribute("role", "img"); cv.removeAttribute("aria-hidden"); cv.setAttribute("aria-label", form.title);
            F.box.innerHTML = ""; F.box.appendChild(cv);
        } else {
            var img = new Image(); img.alt = form.title; img.decoding = "async";
            img.onload = function () {
                var ph = F.box.querySelector(".ph"); if (ph) ph.remove();
                if (!PAL[form.id]) { PAL[form.id] = samplePalette(img); paintFrame(F.fr, F.mat, frameLook(form, PAL[form.id], c.v)); }
            };
            img.onerror = function () { pending(F.box, "full render pending"); };
            img.src = form.image;
            F.box.appendChild(img);
        }
        P.hint.textContent = holdStill ? "Held still because your device asks for reduced motion." : "";
        P.hint.hidden = !holdStill;

        // stepping through the forms that are showing
        P.where.textContent = (cuIdx + 1) + " of " + cuList.length;
        P.prev.disabled = cuIdx === 0; P.next.disabled = cuIdx === cuList.length - 1;
        P.prev.setAttribute("aria-label", cuIdx > 0 ? "Previous form: " + cuList[cuIdx - 1].f.title : "Previous form");
        P.next.setAttribute("aria-label", cuIdx < cuList.length - 1 ? "Next form: " + cuList[cuIdx + 1].f.title : "Next form");

        // the whole story
        P.plac.innerHTML = "";
        P.plac.appendChild(el("div", "modal-form-number", "FORM " + pad2(form.number) + " — " + form.subtitle));
        var t = el("h2", "modal-title", form.title); t.id = "cu-title"; P.plac.appendChild(t);
        P.plac.appendChild(el("p", "modal-story", form.story));
        var details = el("div", "modal-details");
        [["Debut", fmtDate(form.date, "long")], ["Canvas", form.canvas], ["Type", form.animated ? "Animated" : "Static"], ["Technique", form.technique]].forEach(function (d) {
            var item = el("div", "detail-item");
            item.appendChild(el("span", "detail-label", d[0]));
            item.appendChild(el("span", "detail-value", d[1]));
            details.appendChild(item);
        });
        P.plac.appendChild(details);
    }

    function openCloseup(c) {
        cuList = visibleCards(); cuIdx = cuList.indexOf(c);
        if (cuIdx < 0) { cuList = cards.slice(); cuIdx = cuList.indexOf(c); }
        renderCloseup();
        closeup.hidden = false;
        closeup.scrollTop = 0;
        root.classList.add("locked");
        mainEl.inert = true; mainEl.setAttribute("aria-hidden", "true");
        try { history.pushState({ closeup: c.f.id }, ""); cuPushed = true; } catch (err) { cuPushed = false; }
        $("cu-close").focus();
    }
    function cuStep(d) {
        var i = cuIdx + d;
        if (i < 0 || i >= cuList.length) return;
        cuIdx = i; renderCloseup(); closeup.scrollTop = 0;
        var P = cuParts; if (document.activeElement && document.activeElement.disabled) (d < 0 ? P.next : P.prev).focus();
    }
    function finishClose() {
        if (closeup.hidden) return;
        closeup.hidden = true;
        if (cuParts) { cuParts.art.innerHTML = ""; cuParts.F = null; }
        root.classList.remove("locked");
        mainEl.inert = false; mainEl.removeAttribute("aria-hidden");
        var c = cuList[cuIdx]; if (c) c.open.focus();
    }
    function closeCloseup() {   // close through history, so the back gesture and the close button agree
        if (closeup.hidden) return;
        if (cuPushed) { cuPushed = false; history.back(); } else finishClose();
    }
    window.addEventListener("popstate", function () { cuPushed = false; finishClose(); });
    $("cu-close").addEventListener("click", closeCloseup);
    closeup.addEventListener("click", function (e) {   // a tap outside the art and the label closes it
        if (e.target === closeup || e.target === cuIn || (cuParts && e.target === cuParts.art)) closeCloseup();
    });
    document.addEventListener("keydown", function (e) {
        if (closeup.hidden) return;
        if (e.key === "Escape") { e.preventDefault(); closeCloseup(); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); cuStep(-1); }
        else if (e.key === "ArrowRight") { e.preventDefault(); cuStep(1); }
        else if (e.key === "Tab") {   // keep focus inside the close-up
            var f = Array.prototype.filter.call(closeup.querySelectorAll("button:not([disabled]), a[href]"), function (x) { return x.offsetParent !== null || x === $("cu-close"); });
            if (!f.length) return;
            var first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
            else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
        }
    });

    // ---------- the painted sky in the hero, one painter per world (after the rail's) ----------
    var sky = $("sky"), hero = $("top");
    function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
    var PAINT = {
        night: function (g, w, h) {
            var r = rng(11);
            for (var i = 0; i < 90; i++) {
                var x = r() * w, y = r() * h * .9, s = r() < .1 ? 1.4 : .7;
                g.fillStyle = "rgba(236,229,243," + (.15 + r() * .35) + ")";
                g.beginPath(); g.arc(x, y, s, 0, 6.283); g.fill();
            }
            // the small fox-shaped asterism from the rail, faint, in the upper right
            var ox = w * .76, oy = h * .1, k = Math.max(.6, Math.min(1.1, w / 1000));
            var pts = [[0, 30], [26, 18], [52, 22], [78, 8], [96, 16], [64, 40]].map(function (p) { return [ox + p[0] * k, oy + p[1] * k]; });
            g.strokeStyle = "rgba(255,196,107,.22)"; g.lineWidth = 1;
            g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
            [1, 2, 3, 4].forEach(function (j) { g.lineTo(pts[j][0], pts[j][1]); });
            g.moveTo(pts[2][0], pts[2][1]); g.lineTo(pts[5][0], pts[5][1]); g.stroke();
            pts.forEach(function (p, j) { g.fillStyle = "rgba(255,226,170," + (j === 3 ? .9 : .6) + ")"; g.beginPath(); g.arc(p[0], p[1], j === 3 ? 2 : 1.4, 0, 6.283); g.fill(); });
        },
        day: function (g, w, h) {
            for (var b = 0; b < 3; b++) {   // window light falling in from the upper left
                var x0 = w * (.05 + b * .12);
                var grad = g.createLinearGradient(x0, 0, x0 + w * .35, h);
                grad.addColorStop(0, "rgba(255,236,190,.55)"); grad.addColorStop(1, "rgba(255,236,190,0)");
                g.fillStyle = grad; g.beginPath();
                g.moveTo(x0, 0); g.lineTo(x0 + w * .07, 0); g.lineTo(x0 + w * .42, h); g.lineTo(x0 + w * .3, h); g.closePath(); g.fill();
            }
            var r = rng(5);
            for (var d = 0; d < 30; d++) { g.fillStyle = "rgba(255,250,235," + (.3 + r() * .5) + ")"; g.beginPath(); g.arc(r() * w * .7, r() * h, .8 + r(), 0, 6.283); g.fill(); }
            g.fillStyle = "rgba(201,158,108,.28)"; g.fillRect(0, h - 10, w, 10);   // the edge of the honey-wood floor
        },
        dawn: function (g, w, h) {
            var sx = w * .84, sy = h * .78, sr = Math.max(34, w * .05);
            var halo = g.createRadialGradient(sx, sy, sr * .4, sx, sy, sr * 3.4);
            halo.addColorStop(0, "rgba(255,240,200,.8)"); halo.addColorStop(1, "rgba(255,240,200,0)");
            g.fillStyle = halo; g.fillRect(0, 0, w, h);
            g.fillStyle = "rgba(255,244,220,.9)"; g.beginPath(); g.arc(sx, sy, sr, 0, 6.283); g.fill();
            var r = rng(9);
            for (var c = 0; c < 6; c++) {
                var cx = r() * w, cy = h * (.08 + r() * .3), cw = 50 + r() * 110;
                g.fillStyle = "rgba(255,250,244,.45)"; g.beginPath(); g.ellipse(cx, cy, cw, cw * .12, 0, 0, 6.283); g.fill();
            }
            [["rgba(233,176,160,.55)", .9], ["rgba(221,156,144,.6)", .95]].forEach(function (layer, li) {
                g.fillStyle = layer[0]; g.beginPath(); g.moveTo(0, h);
                for (var x = 0; x <= w; x += 8) g.lineTo(x, h * layer[1] - 12 * Math.sin(x / (90 + li * 40) + li) - 6 * Math.sin(x / 37));
                g.lineTo(w, h); g.closePath(); g.fill();
            });
            g.fillStyle = "rgba(255,255,255,.7)";   // the last two stars of the night, fading
            [[w * .1, h * .1], [w * .16, h * .16]].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 1.4, 0, 6.283); g.fill(); });
        },
        washi: function (g, w, h) {
            var r = rng(13);
            g.strokeStyle = "rgba(120,105,80,.12)"; g.lineWidth = 1;
            for (var f = 0; f < 240; f++) { var fx = r() * w, fy = r() * h, a = r() * 6.283, l = 4 + r() * 14; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + Math.cos(a) * l, fy + Math.sin(a) * l); g.stroke(); }
            [["rgba(60,58,55,.08)", .7, 60], ["rgba(40,38,36,.12)", .8, 44], ["rgba(25,24,22,.18)", .9, 30]].forEach(function (layer, li) {
                var grad = g.createLinearGradient(0, h * layer[1] - layer[2], 0, h);
                grad.addColorStop(0, layer[0]); grad.addColorStop(1, "rgba(0,0,0,0)");
                g.fillStyle = grad; g.beginPath(); g.moveTo(0, h);
                for (var x = 0; x <= w; x += 6) g.lineTo(x, h * layer[1] - layer[2] * Math.abs(Math.sin(x / (140 - li * 30) + li * 2)) - 8 * Math.sin(x / 23));
                g.lineTo(w, h); g.closePath(); g.fill();
            });
            var s = Math.max(26, Math.min(40, w * .04)), y0 = 18;   // the rail's two seals, read left to right: cow and fox
            [["牛", 18], ["狐", w - s - 18]].forEach(function (seal) {
                var x0 = seal[1];
                g.fillStyle = "rgba(184,53,42,.88)"; g.beginPath();
                if (g.roundRect) g.roundRect(x0, y0, s, s, 5); else g.rect(x0, y0, s, s);
                g.fill();
                g.fillStyle = "#f6efe2"; g.font = "600 " + Math.round(s * .62) + "px 'Hiragino Mincho ProN', 'Yu Mincho', serif"; g.textAlign = "center"; g.textBaseline = "middle";
                g.fillText(seal[0], x0 + s / 2, y0 + s / 2 + 1);
            });
            g.textAlign = "start"; g.textBaseline = "alphabetic";
        },
        autumn: function (g, w, h) {
            var r = rng(21);
            g.fillStyle = "rgba(10,6,4,.35)";   // trunks at the edges of the grove
            [[.02, 22], [.08, 12], [.92, 16], [.97, 26]].forEach(function (t) { g.fillRect(w * t[0], 0, t[1], h); });
            var ground = g.createLinearGradient(0, h * .84, 0, h);
            ground.addColorStop(0, "rgba(140,60,24,0)"); ground.addColorStop(1, "rgba(140,60,24,.5)");
            g.fillStyle = ground; g.fillRect(0, h * .84, w, h * .16);
            var cols = ["#c4622d", "#d98a3d", "#a8401f", "#e0b04a", "#8c2f1a"];
            for (var i = 0; i < 40; i++) {
                var lx = r() * w, ly = r() * h, s = 5 + r() * 8, rot = r() * 6.283;
                g.save(); g.translate(lx, ly); g.rotate(rot);
                g.fillStyle = cols[Math.floor(r() * cols.length)]; g.globalAlpha = .22 + r() * .3;
                g.beginPath();   // a little five-point maple leaf
                for (var k = 0; k < 10; k++) { var rad = k % 2 ? s * .45 : s; var ang = k * Math.PI / 5 - Math.PI / 2; g.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad); }
                g.closePath(); g.fill(); g.restore();
            }
            g.globalAlpha = 1;
        }
    };
    function world() { return root.getAttribute("data-world") || "night"; }
    function drawSky() {
        var dpr = Math.min(2, window.devicePixelRatio || 1);
        var w = hero.clientWidth, h = hero.clientHeight;
        sky.width = Math.round(w * dpr); sky.height = Math.round(h * dpr);
        var g = sky.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
        (PAINT[world()] || PAINT.night)(g, w, h);
    }

    // ---------- worlds (shared with the door rail and the gallery) ----------
    var WORLDS = ["washi", "night", "day", "dawn", "autumn"];
    function setWorld(name) {
        if (WORLDS.indexOf(name) < 0) name = "washi";
        if (name === "night") root.removeAttribute("data-world"); else root.setAttribute("data-world", name);
        document.querySelectorAll(".world-btn").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.world === name ? "true" : "false"); });
        try { localStorage.setItem("doorrail-world", name); } catch (err) {}
        drawSky();
        cards.forEach(retune);   // frames re-tune against the new wall
        if (cuParts && cuParts.F && !closeup.hidden) { var c = cuParts.c; paintFrame(cuParts.F.fr, cuParts.F.mat, frameLook(c.f, PAL[c.f.id], c.v)); }
    }
    // changing worlds dissolves by hand, as on the rail: the old sky fades out over the new one and the colors ease across
    function chooseWorld(name) {
        if (name === world()) return;
        if (reduce) { setWorld(name); return; }
        var old = document.createElement("canvas");
        old.className = "sky"; old.setAttribute("aria-hidden", "true");
        old.width = sky.width; old.height = sky.height;
        old.getContext("2d").drawImage(sky, 0, 0);
        old.style.transition = "opacity .5s ease";
        sky.parentNode.insertBefore(old, sky.nextSibling);
        root.classList.add("world-easing");
        setWorld(name);
        requestAnimationFrame(function () { requestAnimationFrame(function () { old.style.opacity = "0"; }); });
        setTimeout(function () { old.remove(); root.classList.remove("world-easing"); }, 600);
    }
    document.querySelectorAll(".world-btn").forEach(function (b) { b.addEventListener("click", function () { chooseWorld(b.dataset.world); }); });

    // ---------- ambient stars (the Form Index's own, on the dark worlds) ----------
    function createStars() {
        var container = $("stars");
        var count = 60;
        for (var i = 0; i < count; i++) {
            var star = document.createElement("div");
            star.className = "star";
            var size = Math.random() * 2 + 1;
            star.style.cssText = "width:" + size + "px;height:" + size + "px;left:" + (Math.random() * 100) + "%;top:" + (Math.random() * 100) + "%;" +
                "--duration:" + (Math.random() * 4 + 3) + "s;--max-opacity:" + (Math.random() * .4 + .1) + ";animation-delay:" + (Math.random() * 5) + "s;";
            container.appendChild(star);
        }
    }

    // ---------- section nav: the section you're reading is marked ----------
    function setupNavHighlight() {
        var links = Array.prototype.slice.call(document.querySelectorAll(".sections .nav-link"));
        var secs = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
        var queued = false;
        function update() {
            queued = false;
            var line = Math.min(140, window.innerHeight * .3), cur = -1;
            secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) cur = i; });
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = secs.length - 1;
            links.forEach(function (a, i) { if (i === cur) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
        }
        window.addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
        update();
    }

    // ---------- start ----------
    $("form-count").textContent = String(FORMS.length);   // the true count, straight from the data
    createStars();
    renderForms(FORMS);
    renderGuidestones(GUIDESTONES);
    renderTimeline(FORMS);
    setupFilters();
    setupNavHighlight();
    setWorld(world());

    // the hero and the cards change size with the window (and when the fonts arrive)
    var lastW = window.innerWidth, resizeT = 0;
    window.addEventListener("resize", function () {
        clearTimeout(resizeT);
        resizeT = setTimeout(function () {
            if (Math.abs(window.innerWidth - lastW) < 2) return;   // phones fire resize as the toolbar hides; only width matters
            lastW = window.innerWidth;
            layoutAll();
            if (!closeup.hidden) renderCloseup();
        }, 150);
    });
    if (window.ResizeObserver) {
        var hw = 0, hh = 0, q = false;
        new ResizeObserver(function () {
            if (hero.clientWidth === hw && hero.clientHeight === hh) return;
            hw = hero.clientWidth; hh = hero.clientHeight;
            if (q) return; q = true;
            requestAnimationFrame(function () { q = false; drawSky(); });
        }).observe(hero);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutAll);
})();
