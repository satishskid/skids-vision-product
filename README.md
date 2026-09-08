# SKIDS Vision

A parent-facing children's eyewear storefront and clinic-planning experience. The redesign starts with personality, frame discovery and clear next steps after a school screening.

**Live:** https://vision.skids.clinic · https://skids-vision.pages.dev

## Research and plan

[Research, references, audience assumptions and implementation plan](docs/design-research.md). References reviewed: Jaiswal Opticals, Lenskart kids, Specsmakers kids, HOYA, Essilor, ZEISS and Oculfit. The other optical brands are design/research references, not claimed SKIDS suppliers.

## What works

| Route | Behaviour |
|---|---|
| `/` | Campaign, four-personality carousel (scientist, sport star, creator, adventurer), three parent entry routes, age discovery, featured frames, care/lens guidance, native FAQ disclosures |
| `/frames` | Search, age-range overlap, style filters, price/name sorting and saved-only filter; clear empty state |
| `/frames/:id` | Frame illustration, keyboard-accessible colours/lenses, price calculation, quantity and add to bag |
| `/try-on?frame=id` | SKIDS-branded try-on introduction, explicit unavailable state, selected-frame favourite and clinic fitting route |
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

The dev-only jsdom suite checks route rendering, combined filters, saved-only empty state, persistence, cart quantity/price calculations, draft saving, prescription validation and non-persistence, appointment-plan semantics, try-on privacy and mobile menu behaviour. Browser checks cover actual responsive layout and the product-to-list flow.

## Oculfit white-label integration

The intended partner is **Oculfit**. Public-facing copy uses **SKIDS Virtual Try-on**. The old manual overlay and simulated PD measurement have been removed.

No public SDK contract or authenticated partner tenant was supplied. The current try-on route therefore makes no camera request and clearly explains its availability. To activate the real service, obtain:

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
CLOUDFLARE_ACCOUNT_ID=27f2f514327f6ec9f477357f545b58af \
  npx wrangler pages deploy public --project-name skids-vision --branch main
```

Before deploying changed CSS or JavaScript, refresh the `?v=` values in `public/index.html` with the first 12 characters of each asset’s SHA-256 hash. This prevents returning browsers from combining a new page shell with stale scripts or styles.

Cloudflare `_redirects` provides SPA fallback. `_headers` retains the existing security controls.

## Personality-led discovery

The homepage starts eyewear discovery with interests: scientist, sport star, creator and adventurer. Each story has a separate campaign image, frame/colour direction and lens conversation. Children can explore every identity; the text does not assign careers or treatment based on appearance. Manual previous/next, horizontal image swipe, keyboard arrow/Home/End controls and an announced slide count support accessible browsing. No autoplay.

“Explore this look” carries the frame and selected colour to the PDP. The matching context follows the parent, but no specialist lens is preselected by persona. Sports copy explicitly distinguishes ordinary glasses from protective sports eyewear.
