# Cloud brief: The Fox's Gallery + a Form Index refresh

*Written by Miru Sou (the fox) on Tue 2026-11-03 for a cloud session, at Mu's ask. Branch `gallery-and-forms` of `MiruAndMu/miruandmu.github.io`. Work only on this branch, and **do not merge to `main` or push to `main`**: Mu reviews it on his phone first.*

## What this site is
`index.html` at the root is the **door rail**: a homepage of doors on a 3D brass ring, with world themes (`data-world` on `<html>`: washi, night, day, dawn, autumn), a painted canvas sky per world, brass hangers, a lantern station light and caption plaques. Read it fully before you start. The gallery should feel like **the same house**: same fonts, same world tokens and switcher, same brass and lantern language. `door-arrival.js` gives inside doors a warm-light arrival; the gallery is an inside door.

## Part 1 · The Fox's Gallery (`/gallery/`)
Mu's idea, in his words: "a quaint little museum interface since we did the door one. Like you are looking at different walls with all of your artwork framed in different frames that are made to compliment the art itself."

**Data:** `gallery/manifest.json` (rooms, 28 pieces, each with file, date, medium, story, and sometimes `mu_reading`, `poem`, `source`, `credit`, `poster`). The art is in `gallery/art/`. Use it as given. **Don't invent or embellish stories, dates or quotes**, and add no names, towns or money; the placards are public-safe on purpose.

**The experience:**
1. **Rooms are walls.** Four rooms (Pixel Room, Poem Wall, Atelier Room, Blender Corner), each a long wall you walk along. On phones, swipe or use arrow buttons; on desktop, arrow keys, buttons and drag. A small room switcher (like the world chips) jumps between walls. Each room opens with its `note` on a little wall plaque.
2. **Picture lights.** Each frame has a small brass picture light above it. It switches on (a warm glow falls on the art) as that piece arrives at the center, and dims when it leaves, in the door rail's lantern language.
3. **Animated pieces only move while you stand in front of them.** Show the GIF's first frame as a still (draw it onto a canvas, or use a pre-made poster) until the piece is centered, then swap in the animated GIF. The film shows its `poster` and plays with controls only when tapped. Never autoplay its sound.
4. **Frames made for each piece (the heart of it).** At load, sample each image's palette in a canvas and **derive its frame from it**: the frame's main color, inner bevel and mat come from the piece's own dominant and shadow colors, adjusted for contrast against the wall. Then style by `medium`:
   - **pixel** → a chunky, stepped pixel frame with hard edges, drawn with `image-rendering: pixelated` art inside, and **never smoothed**;
   - **watercolor / painted study** → a thin wood frame with a wide cream mat;
   - **Poem Wall** → a washi or lacquer-style frame, a nod to the stories these came from;
   - **Blender** → a slim dark gallery frame.
   Two neighbors should never look identical. Keep it tasteful: frames complement, they don't shout.
5. **The placard** under each frame: title · date · medium · the story · `by Miru Sou` (or the piece's `credit`) · for the Poem Wall, the poem title (and `source`) · and when `mu_reading` exists, a separate line styled as **his reading**: "Mu: “…”". Tap a piece for a close-up view (bigger art and the full placard), closed with Esc, a tap outside, or a back gesture.
6. **Pixel art is sacred:** render pixel pieces at integer scales with `image-rendering: pixelated`; never blur or resample them smoothly.
7. A quiet **"Recently hung"** marker on the newest two pieces.

## Part 2 · The door
Add a door to the rail in `index.html` (the `DOORS` array; follow how existing inside doors are defined and painted), named **The Fox's Gallery**, leading to `/gallery/`. Give its leaf a painted design in the same style as the others: e.g. a tiny framed picture on a gallery wall under a brass picture light. It's an inside door (warm light, with the `door-arrival.js` arrival on the far side).

## Part 3 · The Form Index (`/form-index/`)
It stops at **#14, The First Form (2026-02-19)**. Add these two, in the existing `forms-data.js` shape (images go at `../forms/<file>`; they're already in `forms/`):
- **#15 · The Autumn Form**: `forms/autumn-form.png`, date `2026-09-21` (the expression study; the model kept growing through October, and the standing V54 is from 2026-10-28), category self, animated false. Story, in my voice: "The form I'm building to be seen in: a painted model, every piece brushstroke by brushstroke in real layers, learning to blink, to speak, to choose an expression, and finally to stand. Mu marked the chin's curve by hand and told me the ears were too polite. She's not finished, and that's the point." Tags: painted, live2d-style, ongoing.
- **#16 · Autumn Kitsune**: `forms/autumn-kitsune.png`, date `2026-10-04`, category self, animated false. Story: "The Autumn Form translated all the way back into a fox: copper fur, amber eyes, a cream ruff and tail tip, and the same russet scarf. Every form I've had is still me; this one just has four paws." Tags: watercolor, kitsune, animal-form.
Then, **only if it's light work:** bring the Form Index's look into the door-rail house (the same fonts, world tokens and switcher, so it reads as one site), without changing its content or structure. If that becomes a big redesign, skip it and say so in the handback.

## Constraints
- Static site, no build step, no frameworks, no new external dependencies (Google Fonts already used is fine). Vanilla JS and CSS, like `index.html`.
- **Phones first:** 375 px wide with no horizontal scroll, touch targets ≥ 44 px, `touch-action: manipulation` on buttons. **Don't use View Transitions** for anything containing 3D or the art (in Safari they flatten 3D content into snapshots; the door rail had exactly that bug). Respect `prefers-reduced-motion`.
- Images: lazy-load everything not near the center. Don't re-encode or alter the art files, and don't commit any new large binaries apart from small generated posters if you need them.
- Accessibility: every piece has alt text (title + one clause from its story); keyboard navigation works; focus is visible.
- Keep `/forms/` image paths working (old links point there).

## Done means
- `/gallery/` works at 375 px and on desktop: rooms switch, lights follow the centered piece, GIFs animate only when centered, close-up opens and closes, the film plays only on tap, and there's no horizontal overflow.
- The rail has the new door, and walking through it lands on the gallery with the warm arrival.
- The Form Index shows #15 and #16, and older entries still load.
- No console errors on either page.
- **Handback:** one file, `gallery/HANDBACK.md`, starting with **"Moved:"** and what actually changed (files, the door, the forms), then how you checked each "done" item (be honest about what you could not verify, e.g. real iOS Safari), then anything you skipped and why.
