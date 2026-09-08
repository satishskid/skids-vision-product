# SKIDS Vision

A parent-facing children's eyewear storefront and clinic-planning experience. The redesign starts with personality, frame discovery and clear next steps after a school screening.

**Live:** [vision.skids.clinic](https://vision.skids.clinic) · [Cloudflare Pages](https://skids-vision.pages.dev)

**Repository:** [satishskid/skids-vision-product](https://github.com/satishskid/skids-vision-product) · branch `main`

## Phase status — 8 September 2026

The design and working sample experience are complete and deployed for this phase. The core message is **“Big dreams. In clear sight.”** and the belief that **every kid is already smart and super**. The experience connects children’s personalities and parents’ hopes with frame discovery, lens understanding, precise fitting and continuing care.

**Oculfit integration is deliberately deferred**, as agreed with the user. Its measurement and QR workflows inform the concept; connecting a partner account is future work, not a blocker to this design phase. Checkout and appointment tools remain clearly labelled local planning flows until real services are connected.

The most recent application deployment is commit `fe270a0`, published to [this deployment](https://9acf07f2.skids-vision.pages.dev) and the live domains above. Subsequent documentation-only commits do not require redeploying `public/`.

## Research and plan

[Research, references, audience assumptions and implementation plan](docs/design-research.md). References reviewed: Jaiswal Opticals, Lenskart kids, Specsmakers kids, HOYA, Essilor, ZEISS and Oculfit. The other optical brands are design/research references, not claimed SKIDS suppliers.

## What works

| Route | Behaviour |
|---|---|
| `/` | Campaign, five-personality carousel (scientist, little doctor, sport star, creator, adventurer), three parent entry routes, age discovery, featured frames, interactive eyes–lenses–fit–life breakdown, three-person care model and native FAQs |
| `/frames` | Search, age-range overlap, style filters, price/name sorting and saved-only filter; clear empty state |
| `/frames/:id` | Frame illustration, keyboard-accessible colours/lenses, price calculation, quantity and add to bag |
| `/try-on?frame=id` | Mobile-style sample showroom: five campaign looks, illustrative clear/tint comparison, selected-frame favourites and product handoff; own-photo connection still pending |
| `/prescription` | Validated prescription notes, held in memory only; clear action; no upload or clinic-record claims |
| `/cart` | Quantity changes, removal, correct totals and review |
| `/checkout` | Review and save a local shopping list; no payment, personal-address collection or order submission |
| `/orders` | Saved shopping lists; explicitly not placed orders; clinic contact for real orders |
| `/appointment` | Save a preferred date/reason locally; explicitly not a booking; clinic contact handoff |
| `/account` | Actual device favourites, lists and visit plans; no invented children, membership or clinical history |

Preferences and shopping/visit lists use `skids_vision_v2` in localStorage. Prescription values are excluded from storage and reset on reload. No child photo or clinical record is sent anywhere. The old v1 demo state is not loaded or modified.

This is a static front end, not a connected commerce/clinical backend. Users can discover and save selections and contact the clinic. Do not present shopping lists as orders or preferred dates as appointments.

## Development and checks

No framework or production build step. HTML, CSS, vanilla JavaScript; Google Fonts (DM Sans and Lora), with local/system fallbacks.

```sh
npm ci
npm test
npm run dev
# http://127.0.0.1:8080, including direct SPA routes
```

The dev-only jsdom suite contains 26 checks covering route rendering, combined filters, saved-only empty state, persistence, cart quantity/price calculations, draft saving, prescription validation and non-persistence, appointment-plan semantics, try-on privacy and mobile menu behaviour. It also covers carousel wrapping, keyboard/swipe controls, all five persona-to-frame/colour handoffs, vision-system tabs, sample-look saving and clear/tint selection.

Browser review covered desktop and narrow mobile layouts, the product-to-list flow, the new care diagrams and the mobile showroom. Production verification confirmed the updated hero, all five personality controls, the doctor photograph, four vision tabs and showroom controls. Tests exercise the static application; they do not certify clinical measurements, partner services or a commerce backend.

## Oculfit white-label integration

The user confirmed that SKIDS has **signed up with Oculfit**. Public-facing copy uses **SKIDS Virtual Try-on**. The old manual overlay and simulated PD measurement have been removed.

The supplied QR integration diagram and measurement video were reviewed; see [Oculfit concept and integration notes](docs/oculfit-integration.md). They demonstrate an operator-assisted fitting workflow with frame data, front/side captures and measurement review. They do not specify a working consumer try-on launch flow or QR payload contract. Integration is deferred by agreement.

No public SDK contract or authenticated partner tenant was supplied. The current route provides an interactive sample showroom and makes no camera request. A paid/signed-up account alone does not establish a working site integration. To activate the real service, obtain:

- Approved partner tenant and SDK/hosted-session documentation.
- Frame SKU mapping and real digital frame assets.
- Server-side session/authentication contract; never put secrets in `public/`.
- Approved domain/camera delegation configuration and callback/result schema.
- Parent consent, child-image retention/deletion terms and clinical measurement verification workflow.

Keep the camera-denying Permissions-Policy until a reviewed partner integration defines the exact required origins. Do not guess SDK methods or build an iframe pointing to the vendor homepage.

## Content and launch dependencies

- `public/assets/campaign.webp` and `public/assets/persona-*.webp` are AI-generated concept campaign photographs, depicting no actual patient or testimonial. They depict imagined frame/lens looks, not exact stocked products or measured lens behaviour. Replace them with consented/licensed brand photography when available.
- Frames are code-drawn **illustrative samples**, labelled as such. Prices are indicative; dimensions, stock, coatings, materials and warranties need verified supplier data.
- Confirm real lens brands, lens pricing and clinical guidance before taking orders. No invented performance statistics, delivery promises, testimonials or partner logos are used.
- Production checkout, payment, order tracking, appointment scheduling, authenticated records and secure upload require backend integrations. Current UI gives useful local planning and clinic-contact alternatives.

## Deploy

```sh
npm run prepare:assets
CLOUDFLARE_ACCOUNT_ID=27f2f514327f6ec9f477357f545b58af \
  npx wrangler pages deploy public --project-name skids-vision --branch main
```

Before deploying changed CSS or JavaScript, run `npm run prepare:assets` to refresh the `?v=` values in `public/index.html` from each asset’s SHA-256 hash. This prevents returning browsers from combining a new page shell with stale scripts or styles.

Cloudflare `_redirects` provides SPA fallback. `_headers` retains the existing security controls.

## Personality-led discovery

The homepage starts with parental hopes and the belief that every kid is already smart and super. Eyewear discovery follows five interests: scientist, doctor, sport star, creator and adventurer. Each story has a separate campaign image, frame/colour direction and lens conversation. Children can explore every identity; the text does not assign careers or treatment based on appearance. Manual previous/next, horizontal image swipe, keyboard arrow/Home/End controls and an announced slide count support accessible browsing. The separate vision-system tabs are independently keyboard accessible. No autoplay.

“Explore this look” carries the frame and selected colour to the PDP. The matching context follows the parent, but no specialist lens is preselected by persona. Sports copy explicitly distinguishes ordinary glasses from protective sports eyewear.

## Why SKIDS Vision

An interactive, dark-green product-explainer section moves from the eye’s light path, through lens-design considerations and fitting positions, to everyday life. Original SVG diagrams are educational simplifications, not measurements or diagnostic tools. Lens plates are expressly separate design considerations rather than literal physical layers. The care section explains pediatrician, optometrist and pediatric ophthalmology partner roles and continuing reviews. Primary references are recorded in `docs/design-research.md`.


## Project map

| File or directory | Purpose |
|---|---|
| `public/index.html` | SPA shell, fonts and versioned asset references |
| `public/js/app.js` | Routing, page templates, interactions and local state |
| `public/js/data.js` | Sample frames, colours, lenses and five personality stories |
| `public/css/app.css` | Editorial visual system, responsive layouts and interactive section styling |
| `public/assets/` | Hero and five personality campaign images |
| `public/_redirects` | Cloudflare SPA route fallback |
| `public/_headers` | Browser security headers and disabled camera/microphone/geolocation permissions |
| `scripts/serve.py` | Local Python server with SPA fallback |
| `scripts/version-assets.py` | Refreshes CSS/JS content hashes in the shell |
| `tests/app.test.cjs` | Application behaviour checks using jsdom |
| `docs/design-research.md` | Audience, references, rationale and research limitations |
| `docs/oculfit-integration.md` | Supplied partner concepts, observed workflow and future handoff requirements |

## Maintaining and publishing changes

Requires Node.js/npm for tests and Wrangler, Python 3 for the local server and asset versioning, and an authenticated Cloudflare account with access to the Pages project. There are no application secrets required to run this static version.

1. Edit the relevant data, templates, styles or assets. Preserve the distinction between illustrative products and verified stock.
2. Run `npm test`. Review affected screens in the browser, including a narrow mobile viewport.
3. Run `npm run prepare:assets` after the final CSS/JS changes, then `git diff --check`.
4. Review `git diff`, commit the intended files and run `git push origin main`.
5. For application changes, run the Cloudflare deploy command above. A Git push alone is not proof of deployment; verify the live site after Wrangler completes.

`node_modules/`, `.wrangler/` and `.DS_Store` are excluded from Git. Keep credentials, patient data and partner account exports out of the repository. The partner references are documented as evidence; the supplied PDF and video are not republished as site assets.

## Next phase, when ready

- Replace sample catalogue information with verified frame SKUs, dimensions, imagery, availability and lens pricing.
- Connect the agreed Oculfit module using its actual tenant documentation and confirmed frame mapping.
- Add real appointment availability/confirmation, commerce and payments only with their backend services.
- Add authenticated clinical records and any consented image handling as a separately scoped integration.

Until then, the published experience remains useful for discovering styles, understanding care, saving a shortlist and preparing a clinic visit.
