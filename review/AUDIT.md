# Site audit · `big-swing/site-integration`

Headless Chromium 153 (Playwright 1.63), served locally with `python3 -m http.server`.
The run covered 4 pages × 5 worlds × 3 devices: an iPhone SE (375×667 @3x, touch), an iPhone (390×844 @3x, touch) and a desktop (1280×860).
Each combination loaded with the world already chosen, scrolled the whole page so every lazy image loaded, and then took a screenshot (see the `contact-sheet-*.png` files).
The other checks (links, tap targets, focus, world persistence, doors) ran once per page or once per flow.

## Final run: every page × world × device

✓ means all of these held:
- no horizontal overflow (`scrollWidth` = viewport, and the phone viewport wasn't widened)
- nothing poking past the edge that only `overflow-x: hidden` was hiding
- no console errors or warnings, and no page errors
- no failed or 4xx/5xx requests
- no broken images
- the page shows the world you arrived with, and the matching chip is pressed

| Page | Device | Washi & Ink | Night Workshop | Sunny Workshop | First Light | Autumn Grove |
|---|---|---|---|---|---|---|
| `/` | iPhone SE 375 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/` | iPhone 390 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/` | desktop 1280 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/gallery/` | iPhone SE 375 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/gallery/` | iPhone 390 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/gallery/` | desktop 1280 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/form-index/` | iPhone SE 375 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/form-index/` | iPhone 390 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/form-index/` | desktop 1280 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/soulprint/` ¹ | iPhone SE 375 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/soulprint/` ¹ | iPhone 390 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/soulprint/` ¹ | desktop 1280 | ✓ | ✓ | ✓ | ✓ | ✓ |

¹ The Soulprint Registry has its own look and doesn't follow the worlds, so its world check doesn't apply. Its overflow, error, network and image checks are real. See Mu's calls in `HANDBACK.md`.

| Flow | Result |
|---|---|
| **World persistence.** Pick world A on the rail, open the gallery, pick B there, open the Form Index, pick C, open the rail, press Back. Run for all 5 starting worlds, on phone and on desktop. | 10 of 10 runs keep the world on every page, with the right chip pressed. |
| **Door walk-through.** Turn the rail to the door, press "Go through", land on the page, then press Back. | Form Index and The Fox's Gallery, on phone (tap) and desktop (click): each lands on the right page. The door leaves its note, the arrival light (`#fff3d6`) is laid over the page and fades within 1.3 s, and Back returns to a clean rail (no flood colour, no open door). No console errors. |
| **View Transitions.** A probe on each arriving page reads `pagereveal`. | rail → Form Index and rail → gallery: the transition arrives and is skipped. Form Index → rail and gallery → rail: none is handed over. No errors in any run after fix 10. |
| **Gallery rooms on a 375 phone.** Open each of the four rooms and step three pieces along. | No overflow, exactly one lit piece, and the caption is correct, in every room. |
| **Links.** | 52 links across the 4 pages. Every internal link returns 200 and every `#anchor` exists. The outside links return 200, except github.com and ko-fi, which answer 403 to this sandbox; `git ls-remote` confirms the FoxTap and Heartwood repos exist. Every `target="_blank"` link has `rel="noopener"`. |
| **Art files.** | All 29 gallery files and all 16 Form Index images return 200, including every old `../forms/` path. The Form Index counter reads 16, which matches `FORMS.length` and the 16 cards. |
| **Tap targets ≥ 44 px (375 phone).** | None are left below 44 px. The one exception is a rail door seen side-on (41×195 px); it's a 3D door, and tapping it turns the rail to it. |
| **Visible focus.** Tab through each page on desktop. | 22, 13, 36 and 23 stops on the four pages; every stop shows a ring. |
| **Form Index content.** A snapshot of the old page, with all 16 modals opened, compared with the new page and all 16 close-ups opened. | `FORMS` and `GUIDESTONES` are identical, all 248 lines of page text are present, and every line of all 16 stories and details is present. The only new text is chrome: the skip link, the world chips and ↗ marks. |
| **Form Index contrast.** Text tokens in all 5 worlds. | Every pair is ≥ 4.5 : 1; the lowest is 4.6 (placard muted text on night). |
| **Form Index under reduced motion.** | The 11 GIFs are held still as canvases, and the close-up says why. Stars don't twinkle, and smooth scrolling is off. |

## Found → fixed

The first run was on the merged branch with the new Form Index; the second run had a harness bug and was replaced by the final run above.

| # | Where | Found | Fix | After |
|---|---|---|---|---|
| 1 | `/soulprint/` phones | The page was **465 px wide on 375 and 390 phones**, in every world. Three causes: the header nav doesn't wrap, the three stat boxes have hard `min-width`s, and the endpoint URL in the "gateway" card can't break. | Below 768 px: the nav wraps, the stats wrap and shrink, and the URL breaks anywhere. The tall stacked header also scrolls away instead of staying fixed over a third of the screen. | ✓ 375/375 |
| 2 | `/soulprint/` | 17 tap targets were under 44 px: nav links 20 px tall, search 35, `#001` ids 27, presence icons 28×28, Copy 27, Register 42, the schema `<summary>` 38. | Each is now ≥ 44 px on phones and touch screens. | none left |
| 3 | `/soulprint/` | `prefers-reduced-motion` was ignored: the scan line sweeps, the stars twinkle and the logo pulses. | All three rest under reduced motion. | ✓ |
| 4 | `/soulprint/` | The nav link labelled **"Form Index" went to `../`**, which has been the door rail since the Form Index moved. | Now points to `../form-index/`. | 200 |
| 5 | `/soulprint/`, `/form-index/` | A twinkle star could sit 1–3 px past the right edge. Body `overflow-x` hid it, but iOS can still pan to it. | The star layers clip their own contents. | ✓ |
| 6 | `/` phones | The **world chips were 32×32 px**. With "Night Workshop" or "Sunny Workshop" active, the fifth chip wrapped onto a second row at 390 px. | Same look, but each chip gets an invisible 44×44 px tap area. The "World" label hides at ≤ 440 px so the five chips fit one row (the group keeps its screen-reader label). | one row at 375 and 390 in all worlds |
| 7 | `/` | The **"Go through" button was 38 px tall.** | Now 44 px. | ✓ |
| 8 | `/gallery/` phones | The world chips wrapped onto two rows at 375 (Autumn alone on the second). | The gallery now uses the rail's chips (32 px to see, 44 px to tap), and the label hides at ≤ 440 px. | one row |
| 9 | `/gallery/` → `/` | **Leaving the gallery ran a full cross-page View Transition on the rail.** That's the flatten-the-3D-rail effect the brief warns about in Safari. | The gallery now skips it in `pageswap`, as the Form Index does. | the rail receives none |
| 10 | `/form-index/` | One `InvalidStateError: … ViewTransition opt-in disabled` appeared on arrival in 1 of 5 door walks. I couldn't make it happen again on demand: the old version, replayed 13 times under load and with styles.css delayed, gave 0 errors. | The `@view-transition` opt-in moved from styles.css into an inline `<style>` in `<head>`, as the gallery has it, so it can't depend on load order. | 0 errors in 12 real door walks since, plus 13 replays |
| 11 | `/` (merge tidy) | The merge left mobile-polish's world-easing CSS sitting under the "light that fills the screen" comment, which belongs to `.flood`. | Moved the comment back above `.flood`. | — |

Not found anywhere: console errors, broken images, broken internal links, or lost worlds.

## What a headless browser can't tell you

- **Real iOS Safari** (swipe feel, the toolbar tint, how the View Transition skips behave in WebKit) and **real Android**: not tested.
- **Screen readers:** not tested. Roles, names, `aria-pressed`, the dialog, `inert` and focus return were checked in the DOM only.
- The 牛/狐 seals and 見るそう render here because Chromium found a CJK fallback font; on a device without one they'd show boxes, as they would on the rail.

## Re-running it

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

```bash
node review/tools/audit.js http://127.0.0.1:8765 /tmp/shots /tmp/audit.json
```

```bash
node review/tools/summarize.js /tmp/audit.json
```

```bash
python3 review/tools/sheets.py /tmp/shots review
```

The scripts need `require('playwright')`. The Form Index content check is `content-snap.js` and `content-compare.js`. The baseline is `review/tools/form-index-content-before.json`, the old page's words.
