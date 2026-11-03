# Handback · `big-swing/site-integration`

Merged: the gallery and the phone fixes are on one branch, and both survived the merge. The Form Index now lives in the house, in all five worlds, with frames made from each form's own art. The whole site was audited across 60 page × world × device combinations, and every problem the audit found was fixed. The branch is `big-swing/site-integration`, cut from `origin/main` at `7a02419`. **Nothing was pushed to or merged into `main`.** It's yours to look at first.

Start with the pictures:
- `review/form-index-before-after.png`
- `review/contact-sheet-form-index-cards.png`
- `review/contact-sheet-rail.png`

The numbers are in `review/AUDIT.md`.

## 1. What merged, and how the conflicts went

| Commit | What |
|---|---|
| `abf1ec0` | Merged `origin/gallery-and-forms` (`c757f9b`, 2 commits): the gallery, its door, and Form Index #15/#16. |
| `55e564b` | Merged `origin/mobile-polish` (`09e13bf`, 4 commits): the rail's phone fixes. |

**There were no conflicts.** I didn't take that on trust; I checked it twice:
- **Before merging:** `git merge-tree --write-tree origin/gallery-and-forms origin/mobile-polish` came back clean. The real merge produced the same tree, `954f45e`.
- **After merging:** I compared `index.html` with all context lines stripped (`git diff -U0`, only the `+`/`-` lines):
  - Merging mobile-polish on top of the gallery changed exactly the lines mobile-polish changes against `main`, no more and no fewer.
  - Merging the gallery on top of mobile-polish changed exactly the gallery's three additions: the `DOORS` entry, the `FACES.gallery` painter and the `.d-gallery` CSS.
  - Both comparisons came back identical, so neither branch lost or bent a line.

The two branches touched neighbouring lines in one place. The gallery's CSS block ends just above the `/* the light that fills the screen as you step through a door */` comment, and mobile-polish inserted its world-easing CSS just below that same comment. Git merged it cleanly. Afterwards, though, the comment sat over the world-easing rules instead of `.flood`, so I moved it back above `.flood`. That's the only edit I made to merged code, and it's in `7e344f9`.

## 2. The Form Index, in the house

Files: `form-index/index.html`, `styles.css` and `script.js`, all rewritten. **`forms-data.js` and `guidestones-data.js` are untouched**: `git diff` against the merge is empty.

**Before**
- One dark starfield palette, with JetBrains Mono and Inter instead of the house fonts.
- It ignored the world you'd picked. Walking from a washi rail, you arrived in the dark.
- A fixed header ate about a quarter of a phone screen. Its nav spilled sideways, so the page was 381 px wide on a 375 phone, and the 340 px card grid could overflow too.
- Cards were `<div>`s with click handlers, so a keyboard couldn't open a form.
- The modal had no dialog role, no focus handling and no Back-gesture close.
- GIFs animated even under reduced motion.
- On phones the "Forms" nav item could never light up: the section is taller than the screen, so an intersection threshold of 0.3 was never reached.
- The counter was hard-coded.

**After**
- **The same house.**
  - It uses the gallery's fonts and world tokens for all five worlds.
  - It reads and writes `doorrail-world` before first paint.
  - The world switcher has the same chips as the rail and the gallery, and the colours ease across when you switch worlds, as on the rail.
  - There's an "← All doors" link at the top and at the bottom.
  - `../door-arrival.js` gives you the warm arrival when you walk in through the door.
- **The hero is a painted vault, as on the rail**, with one painter per world:
  - Night: stars and the little *vulpecula* fox constellation.
  - Day: window light.
  - Dawn: sun, clouds and hills.
  - Washi: paper fibre, ink mountains and the 牛/狐 seals.
  - Autumn: trunks and leaves.

  The counters (16 · 1 · ∞) sit on a **brass plaque** with two screws. The 16 now comes from `FORMS.length`.
- **Every form hangs on its own stretch of wall** (the gallery's wall, wainscot and floor tokens) **under a brass picture light.**
  - The light is on over the forms in the middle of the screen, and over any card you hover or focus.
  - It's the `--lantern` colour, with the gallery's spill.
- **Frames made from the art.**
  - I borrowed the gallery's palette sampler and frame builder: dominant colour, darkest 20% and brightest 15%, clamped against the wall, with the frame re-tuned whenever the world changes.
  - Half-block and terminal forms get the stepped pixel frame.
  - The two painted forms (#15 painted, #16 watercolour) get the wood frame and cream mat.
  - Neighbours never match: each form's position picks one of three variants.
- **Pixel art is never smeared.** Half-block forms are drawn at whole device pixels per art pixel whenever that still fills most of the space; otherwise they stay hard-edged as they grow. Only shrinking ever averages pixels. A small table holds each image's size and art-pixel size (measured once from the files), so frames lay out before the art loads. A future form missing from that table still works.
- **The close-up** (the old modal):
  - It shows the form bigger, in the same frame, with its whole story and the Debut, Canvas, Type and Technique details.
  - ← → buttons and the arrow keys step through the forms showing under the current filter.
  - Esc, ✕, a tap outside it, or the Back gesture closes it, and focus returns to that form's card.
  - It's a real dialog: the page behind is inert and focus stays inside.
- **Guidestones** are stone tablets cut from each world's own stone: slate at night, sandstone by day, pale stone in washi, and so on. The cracks are kept. The unearned XII is a dashed outline instead of a faded block, so its text stays readable.
- **Timeline** has a brass line with lantern beads. Failures are hollow rings, so they read by shape and not only by colour.
- **Accessibility**
  - Every card is a real `<button>` inside its heading, and the whole card is its click area.
  - Filters are `aria-pressed` buttons with counts, and a screen-reader-only line says "Showing 4 of 16 forms."
  - Every target is ≥ 44 px, and focus rings are visible.
  - There's a skip link.
  - Every text colour pair is ≥ 4.5:1 in every world.
- **Reduced motion:** GIFs are held on their first frame (with a note in the close-up), the stars don't twinkle, there's no smooth scroll and no card lift.
- **View Transitions:** I followed the gallery's precedent. `@view-transition { navigation: auto; }` is inline in `<head>`, and `skipTransition()` runs in `pagereveal`. Leaving the page, `pageswap` skips it too, so the rail never gets a flattened 3D arrival.
- **Content is sacred.**
  - I snapshotted the old page's text with all 16 modals opened, then the new page's with all 16 close-ups opened.
  - `FORMS` and `GUIDESTONES` are identical, every one of the 248 page lines is present, and every line of every story and detail block is present (`review/tools/content-*.js`).
  - All old `../forms/` image paths load.
  - Size: the old page was 147 + 888 + 255 lines (HTML, CSS, JS); the new one is 177 + 453 + 656.

## 3. Audit: what I found and fixed

The full table and method are in `review/AUDIT.md`, and the contact sheets are `review/contact-sheet-{rail,gallery,form-index,form-index-cards,soulprint}.png` (worlds × devices).

**What's clean in the final run:**
- All 60 page × world × device combinations: no overflow, console errors, failed requests or broken images.
- World persistence: 10 of 10 runs.
- Both doors walk through, with the arrival light and a clean Back.
- No tap target under 44 px; the one exception is a rail door seen side-on.
- Every focus stop shows a ring.

**What I fixed:**
1. **The Soulprint Registry was 465 px wide on phones** (375 and 390), in every world. The nav didn't wrap, the stat boxes had hard minimum widths, and the endpoint URL couldn't break. It fits now, and on phones its tall header scrolls away instead of staying fixed.
2. **Soulprint tap targets:** 17 were under 44 px (nav, search, ids, presence icons, Copy, Register, the schema toggle). All are now 44 px on phones and touch screens.
3. **Soulprint ignored reduced motion.** The scan line, twinkle and logo pulse now rest.
4. **Soulprint's "Form Index" link went to `../`**, which has been the rail since the move. It now goes to `../form-index/`.
5. **Rail world chips were 32 px** on phones, and the row wrapped at 390 px with "Night Workshop" or "Sunny Workshop" active. They look the same but now have a 44 px tap area, and the "World" label hides at ≤ 440 px so the chips stay on one row.
6. **The rail's "Go through" button** was 38 px tall. It's now 44 px.
7. **The gallery's chips wrapped to two rows at 375.** It now has the rail's chips.
8. **Leaving the gallery ran a cross-page View Transition on the rail.** That's the flattened-3D-rail effect the gallery brief warns about in Safari. The gallery now skips it in `pageswap`, as the Form Index does.
9. **One `InvalidStateError` on arriving at the Form Index** (1 of 5 door walks). I couldn't reproduce it on demand. I moved the opt-in from styles.css into an inline `<style>` in `<head>`, where the gallery keeps it, and there were 0 errors in 12 real door walks after that.
10. **Stray stars:** one could sit 1–3 px past the edge on the Form Index and on Soulprint. Each star layer now clips its own contents.

## 4. Things I chose myself

**Copy**
- The meta and OG description is the door's own blurb: "Every shape I've ever been, drawn in half-block pixels. Our very first room."
- New labels:
  - Visible: "Skip to the forms" (only on keyboard focus), "World", "4 of 16" in the close-up.
  - Screen readers only: "Showing N of 16 forms.", "Previous form: …" and "Next form: …".
- I reused the gallery's "Held still because your device asks for reduced motion." and "Close the close-up".
- A small ↗ follows each outside link in About. It's hidden from screen readers, and the links gained `rel="noopener"`.
- I added a second "← All doors" link under the footer.

**Order and layout**
- Forms keep the data order.
- Short rows are centred like pictures on a wall, so the full-width featured forms (The Den Fox, The First Form) don't leave holes. Before, the row ahead of each featured form had an empty slot.
- The failed form (#03) hangs in a plain dark frame.
- Cards use a slimmer cream mat on the painted forms so they aren't tiny; the close-up gets the gallery's full mat.

**One rendering change**
- The tag chips used to show "static" or "animated" twice whenever it was also one of the form's first two tags. Now it shows once. The data is unchanged; only the duplicate chip is gone.

**Fonts and stars**
- JetBrains Mono and Inter are gone from the Form Index in favour of the house fonts.
- The Form Index's own twinkling stars stay, but only in the two dark worlds (amber at night, embers in autumn).

**On all three house pages**, the "World" label hides on narrow phones.

## 5. Mu's call

- **The `atelier` door.** "Miru's Atelier … My gallery: …" is still in `DOORS` and still filtered off the rail, since `href: null` and it isn't a teaser. I left it alone. Now that The Fox's Gallery is real, you may want to retire it or point it at `gallery/`.
- **The Soulprint Registry isn't in the house.**
  - It has no worlds, its own fonts and cyan palette, and no door on the rail. It's only reachable by URL.
  - I fixed it so it works, but didn't restyle it.
  - Should it get a door, and the house look?
- **`forms/html/`** holds 8 standalone pages (`form-v5.html` … `form-chef-ba-animated.html`) that nothing links to. Keep, link or retire?
- **The rail still opts into cross-page View Transitions** (`@view-transition { navigation: auto; }`). Since mobile-polish, world changes no longer use them, and both inside doors now skip them in both directions, so the rule does nothing on any page we have. Removing it would also retire the `::view-transition-*` rules. I left the rail's choice alone.
- **The frame code is duplicated** between `gallery/index.html` and `form-index/script.js`, about 100 lines borrowed as-is. A shared `/frames.js` would keep them in step, but it means touching the finished gallery, so it's your call.
- **`review/` would be public** at `/review/` once merged to `main`, because GitHub Pages serves the whole repo. Delete it before publishing if you'd rather it weren't.

## 6. What I couldn't verify

- **Real iOS Safari and Android.** Untested:
  - Swipe feel.
  - The toolbar tint.
  - The 3D rail during navigation.
  - Whether WebKit's handling of `pagereveal` and `pageswap` matches Chromium's.
- **Screen readers.** Roles, names, `aria-pressed`, the dialog, `inert` and focus return were checked in the DOM only.
- **github.com and ko-fi links.** Both answer 403 to this sandbox. `git ls-remote` confirmed the FoxTap and Heartwood repos exist; the ko-fi page I couldn't see.

## Commits on this branch (on top of `main` @ `7a02419`)

| Commit | What |
|---|---|
| `abf1ec0` | Merge `gallery-and-forms` |
| `55e564b` | Merge `mobile-polish` |
| `a75c354` | The Form Index moves into the house |
| `7e344f9` | Site audit fixes |
| (last) | `review/` (contact sheets, AUDIT.md, tools) and this handback |
