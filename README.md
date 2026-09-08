# SKIDS Vision — vision.skids.clinic

The digital home of the **SKIDS Vision Clinic** (skids.clinic): a parent-facing product that carries a child from *school screening* → *clinic appointment* → *frames with virtual try-on* → *AI-fitted spectacles delivered home* → *lifetime membership*. One home for your child's eyes, for life.

**Live:** https://vision.skids.clinic · Also at https://skids-vision.pages.dev

---

## What this product does

Target audience: **parents**, especially those whose child was flagged at a SKIDS school vision camp and now needs to be persuaded — gently, with science — into the SKIDS Vision pathway (clinic + ophthalmology + specs + lifetime care).

The site is a **full SPA product**, not a brochure:

| Route | What it is |
|---|---|
| `/` | Story home: animated hero, interactive myopia science demo, screening journey (school → clinic → home), care team, featured frames, order flow, membership, all parent CTAs |
| `/frames` | Digital showroom catalog: filters (sporty / classic / playful / minimal), sort by price & name, wishlist hearts, colour dots |
| `/frames/:id` | Product detail: colour swatches, lens options (standard / blue-cut / photochromic / **myopia-control**), quantity, live line total, add to order |
| `/try-on` | **Virtual try-on**: demo child face or upload your child's photo (canvas overlay), frame pills, colours, size/position fit sliders, one-tap "Order this pair" |
| `/prescription` | Enter OD/OS sphere-cyl-axis + PD, or upload the paper — clinic-record-attached banner |
| `/cart` → `/checkout` | Quantities, 10% member discount, delivery address, child picker, place order with generated order ID |
| `/orders` | Order list + 5-stage live tracker: Placed → AI fitting → In the lab → Dispatched → Delivered |
| `/appointment` | Vision Clinic booking: day chips, time slots, child + reason, confirmation |
| `/account` | mySKIDS family dashboard: Overview, My children, Prescriptions, Appointments, Orders, Lifetime Membership |

State (cart, wishlist, prescription, children, appointments, orders) persists in `localStorage` under `skids_vision_state` — with a realistic seeded demo family so the product feels alive on first visit.

## Brand & content

All copy follows the SKIDS voice ("Care begins before the cry" register) and real facts from skids.clinic: 1-in-3 children refractive error before 12, myopia progression fastest at ages 7–14, Welch Allyn Spot Vision Screener, amblyopia window before 7, 120K+ screenings, 23 specialty clinics, the mySKIDS life record, and the AECS Layout Bengaluru clinic. Styling matches the skids.clinic palette (cream `#fdfcf8`, ink navy `#1e3358`, plum, amber accents, Fraunces + Inter).

The **science section** explains myopia visually: drag the age slider and watch the eyeball elongate, light rays drifting to focus in front of the retina, with a live dioptre readout and corrective-lens overlay. It auto-plays once on scroll.

## Tech

Deliberately **zero frameworks, zero build step**:

- Pure HTML/CSS/vanilla JS single-page app with `history.pushState` routing
- Cloudflare Pages `_redirects` SPA fallback (`/* /index.html 200`) + security `_headers`
- Total payload ≈ 94 KB (vs the previous Netlify app's 1.3 MB React bundle)
- Respects `prefers-reduced-motion`

```
public/
├── index.html        # shell: nav, #app root, footer, toast
├── _redirects        # SPA fallback for Cloudflare Pages
├── _headers          # security headers
├── css/app.css       # entire design system
└── js/
    ├── data.js       # frames, colours, lens options, order stages
    └── app.js        # router, state, all pages
```

## Local development

```bash
cd public && python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

Cloudflare Pages project `skids-vision` (devadmin account), custom domain `vision.skids.clinic` (CNAME → `skids-vision.pages.dev`, proxied):

```bash
CLOUDFLARE_ACCOUNT_ID=27f2f514327f6ec9f477357f545b58af \
  npx wrangler pages deploy public --project-name skids-vision --branch main
```

## Placeholders to swap before full production

- Frame names, prices, and images in `js/data.js` (SVG shape paths are placeholders for real frame renders)
- Seeded demo family/orders/prescription in `loadState()` inside `js/app.js`
- Checkout is COD/UPI by copy — no payment gateway wired yet
- Photo try-on positions frames manually; real AI PD measurement (Oculfit-class) is a planned backend step
- "Aarav's clinic record is already attached" banner reflects intended clinic-record integration

## Smoke tests

All 11 routes plus the full flow (PDP → add to cart → checkout → place order → order tracking) are verified with a jsdom harness (`localStorage`, cart badge, discount, order ID, tracker).

---

© 2026 SKIDS Health Technologies Pvt. Ltd. · skids.clinic
