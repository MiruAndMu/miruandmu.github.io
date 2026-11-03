Moved: The Fox's Gallery is built at `/gallery/`, its door is on the rail, and the Form Index now has #15 and #16. Everything is on `gallery-and-forms` only. Nothing was merged or pushed to `main`.

## What changed

**New: `gallery/index.html`** (one static page, vanilla JS and CSS, no new dependencies)
- It reads `gallery/manifest.json` as given. Placards show title · date · medium · story · `by Miru Sou` (or the piece's `credit`), and Poem Wall pieces add "Poem: … · from …". When a piece has `mu_reading`, it gets its own blue-ruled line, "Mu: “…”". The source line also appears on the one Blender piece that has a `source`. I didn't add or rewrite any story, date or quote.
- **Rooms are walls.** It has four rooms (Pixel 16, Poem 4, Atelier 5, Blender 3). Each opens with its `note` on a brass plaque. A room switcher sits under the world chips, and the room is kept in the URL hash (`#poem` and so on) via replaceState, so the back gesture doesn't step through rooms. The wall is a native horizontal scroll-snap strip: swipe on phones, mouse-drag on desktop, the ← → buttons, and arrow keys. Enter opens the close-up.
- **Picture lights.** Each frame has a brass picture light. The centered piece's bulb lights and a warm spill falls over the art, using the rail's `--lantern` colour. Pieces that aren't centered dim slightly.
- **Animation only in front of you.** A GIF's first frame is drawn onto a canvas, one canvas pixel per art pixel. The animated GIF is swapped in only after the wall settles on that piece and is removed as soon as it moves on. The film shows its `poster` with a ▶ badge. Tapping it opens the close-up with a `<video controls preload="none" playsinline>`, which never autoplays. It starts only when the viewer presses play, and it pauses and unloads when the close-up closes.
- **Frames made from the art.** When a piece loads, it is drawn into a 40×40 canvas and sampled for a dominant colour, a shadow (darkest 20%) and a light (brightest 15%). The frame, its bevel and its mat come from those colours, with lightness clamped against the current world's wall. Frames re-tune when you switch worlds. Styles by room or medium:
  - **pixel:** a chunky frame with hard stepped corners (clip-path), hard bevels and a hard offset shadow.
  - **Atelier (watercolor and painted studies):** a thin wood frame tinted toward the art's hue, with a wide cream mat.
  - **Poem Wall:** a lacquer frame (black, vermilion-leaning or indigo) with a gold inner line and a washi-textured mat.
  - **Blender:** a slim dark frame.
  Each piece also gets a variant from its position (0/1/2: profile width, step size, mat), so two neighbours never match even when their palettes are close.
- **Pixel art is never smoothed.** Pixel and Poem Wall pieces render with `image-rendering: pixelated`. I measured each file's art-pixel size once (most are 7 or 8 px blocks) and stored it with the dimensions in a small `DIMS` table in the page. The art is then drawn at a whole number of device pixels per art pixel. The table also lets frames be laid out before the lazy images load.
- **Close-up:** bigger art in the same frame, plus the full placard (the wall placard clamps long text). It closes with Esc, the ✕ button, a tap outside the art and placard, or the back gesture: opening pushes a history entry, and closing goes through `history.back()`. The page behind is `inert`, Tab stays inside the dialog, and focus returns to the piece afterwards.
- **"Recently hung"** is a small brass tag on the two newest pieces by date: Two Doors and The Machine I Let Go (both 2026-11-02).
- **Same house:** the same fonts, world tokens and world switcher. The world is shared with the rail through the same `doorrail-world` key. It also has the brass plaque, the lantern colour, `door-arrival.js` and a "← All doors" link.
- **Loading:** only pieces within two of the centre load, in the current room. The art files were not touched or re-encoded, and no new binaries were added.
- **Accessibility:** each piece is a button labelled with its title plus the first clause of its story. Focus rings are visible. Every button is at least 44 px with `touch-action: manipulation`. Under `prefers-reduced-motion`, transitions are off, the arrows jump instead of gliding, and GIFs stay still on the wall and in the close-up, with a note saying why.

**`index.html` (door rail):** I added only three things: the `DOORS` entry, `{ id: "gallery", name: "The Fox's Gallery", since: "11·03·26", href: "gallery/", blurb: … }` (placed second, after Form Index), its `FACES.gallery` painter, and a `.d-gallery` CSS block. The leaf is a plaster wall with a small framed pixel landscape under a brass picture light, plus a placard and a knob. Nothing else in the file changed, so it should merge cleanly with `mobile-polish`.
- I picked two things myself: "est. 11·03·26" is the date of this brief, and the one-line blurb ("My art, framed and hung: pixel scenes, paintings beside poems, studies for my painted model, and a short film.") is a plain description of the rooms. Change either if you like.
- The old, unopened `atelier` door ("Miru's Atelier … My gallery: …") is still in `DOORS` and still filtered off the rail. I left it alone; you may want to retire it now that the gallery is real.

**Form Index**
- `form-index/forms-data.js` has two new entries in the existing shape:
  - **#15 The Autumn Form:** `../forms/autumn-form.png`, 2026-09-21, self, static. The story is word for word from the brief, and the tags are painted, live2d-style, ongoing.
  - **#16 Autumn Kitsune:** `../forms/autumn-kitsune.png`, 2026-10-04, self, static. Story and tags are from the brief.
  - The shape needs a few fields the brief didn't give, so I filled them only from facts in the brief or the files:
    - `subtitle`: #15 "Expression study 2026-09-21 · standing V54 2026-10-28"; #16 "The Autumn Form, as a fox".
    - `canvas`: each image's pixel size.
    - `technique`: "Painted model, brushstroke by brushstroke in real layers" and "Watercolor".
    - `description`: a sentence taken from each story.
- `form-index/index.html`: the hero's "Forms" counter now reads 16. It was hard-coded at 14.

## How I checked each "done" item
I served the repo locally and drove it with headless Chromium (Playwright): an iPhone-sized 375×667 viewport at 3× with touch, and a 1280×860 desktop.
- **No horizontal overflow at 375 px or desktop:** `scrollWidth` equalled the viewport width on the gallery in every room and on the rail.
- **Rooms switch:** all four rooms render with the right counts. I checked screenshots of each.
- **Lights follow the centred piece:** exactly one `.lit` piece after each move, and it matches the caption ("4 of 16" and so on). Three quick taps on → land on piece 4. That was a bug in my first pass, and I fixed it.
- **GIFs animate only when centred:** at most one animated `<img>` exists at a time, and it's always the centred piece's GIF. The others show canvas stills with `image-rendering: pixelated`.
- **Close-up opens and closes** with Esc, a tap outside, and browser Back (the page stays on `/gallery/`).
- **Film plays only on tap:** in the close-up the `<video>` has `controls`, no `autoplay`, and is paused on open.
- **New door, and walking through it:** the rail shows "The Fox's Gallery" second. "Go through" opens the door and lands on `/gallery/`, where `door-arrival.js`'s warm overlay is present.
- **Form Index:** 16 cards. With every image forced to load, none were broken, including all the older `../forms/` paths. The counter shows 16.
- **No console errors on either page** in the final run.
  - On the way there, one error came up. The rail opts into cross-page View Transitions, and Chromium logged an `InvalidStateError` on the gallery because the gallery refused the transition. Catching it and `navigation: none` both left the error in place.
  - What stopped it: the gallery now has `@view-transition { navigation: auto; }` and calls `skipTransition()` on the incoming transition in a `pagereveal` handler, before anything on the gallery is captured. I checked that the transition resolves as skipped and that no view-transition animation runs on the gallery.

**What I could not verify:**
- **Real iOS Safari or a real iPhone.** In particular:
  - Swipe and scroll-snap feel.
  - That Safari draws a GIF's first frame when it's drawn to a canvas off-DOM.
  - The back gesture closing the close-up.
- **The View Transition skip in Safari.** If a Safari version supports cross-page View Transitions but not the `pagereveal` event, the arrival could run as a View Transition. That's worth a look when you check it in Safari.
- I didn't test with a screen reader.

## Skipped, and why
- **Bringing the Form Index into the door-rail look.** Its stylesheet is 888 lines built for one dark starfield palette, with hard-coded colours. Supporting the rail's five worlds, three of them light, would mean a real restyle of most of it plus a new switcher. The brief said to skip it if it got big, so I did. Its content and structure are unchanged apart from the two entries and the counter.
