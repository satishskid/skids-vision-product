# SKIDS Vision: research and design direction

Research date: 8 September 2026. Audience assumptions come from the existing product brief, not user interviews. Primary audience: Indian parents arriving after a school screening or looking for a first/replacement pair. Children influence colour and style; parents need reassurance about prescription, fit, price and ongoing care.

## Reference observations

| Publisher / title | Source | Evidence and design implication | Publication date |
|---|---|---|---|
| Jaiswal Opticals / Products | https://jaiswalopticals.com/collections/all | Visible availability, price filters and sorting. Make selection concrete and prices scannable. | not stated |
| Lenskart / Kids glasses | https://www.lenskart.com/kids-glasses | Child-specific shapes, flexible-frame positioning and parent FAQs. Let children choose a look without burying parent guidance. | not stated |
| Specsmakers / Kids Homepage | https://www.specsmakers.in/pages/kids-homepage | Dedicated kids entry point. Support a distinct child-focused shopping journey. Search evidence was sparse; no detailed interaction claims made. | not stated |
| HOYA / MiYOSMART | https://www.hoyavision.com/vision-products/myopia-management/miyosmart/ | Explains myopia management as a distinct lens category with evidence. Separate prescription correction from myopia management. | not stated |
| Essilor / Stellest lenses | https://ecp.essilor-pro.com/gb/essilor-lenses/myopia-management/essilor-stellest-lenses2 | Discusses clinical evidence and wearing time. Avoid implying all lenses offer identical outcomes. | not stated |
| ZEISS / SmartLife Young | https://www.zeiss.com/vision-care/us/eye-care-professionals/lenses/lenses-for-every-need/smartlife-lens-portfolio/smartlife-young-lenses.html | Explicitly considers age, anatomy and lifestyle. Use age only as browsing guidance; clinician confirms actual fit. | not stated |
| Oculfit / homepage | https://www.oculfit.com/ | Describes virtual try-on, optical measurement and custom branding. Supports intended white-label partnership; does not establish a public SDK or our integration readiness. | not stated |

Firecrawl search returned HTTP 402 for all four searches. ScrapeGraphAI was not importable in the default Python 3.14 interpreter. An existing Python 3.14 environment was subsequently found and SmartScraperGraph was run against Oculfit with the specified Omniroute settings; the model endpoint failed with HTTP 503 (maximum combo retry limit). No structured extraction result was produced. Used web search primary-source content as fallback. The direct Oculfit fetch was a targeted follow-up for SDK/white-label documentation, not a repeat broad crawl. Vendor statements are not independently verified clinical claims. No supplier relationship with HOYA, Essilor or ZEISS is implied by their use as references.

## Diagnosis of the existing site

Abstract animated eye and floating cards displaced products and people. Long clinical copy, invented statistics and 48-hour promises increased cognitive load. Tiny disconnected SVG frame outlines did not communicate style. Mobile navigation disappeared. The site seeded a fictional family, prescription and order, and simulated appointment confirmation, AI measurement and fulfilment without backend services.

## Implementation plan and acceptance criteria

1. Replace homepage with an editorial campaign, three parent entry routes, age-based discovery, a compact collection, fit guidance, lens education and FAQs. Verify every primary action has a useful destination.
2. Rebuild visual hierarchy around pine green, warm paper, ochre and terracotta; consistent typography and quiet borders. Verify desktop and narrow/mobile layouts without clipped controls.
3. Improve catalog with age, style, search, sort and saved filters; keep PDP colour, lens and cart interactions. Verify combined filters, empty states, keyboard access and persistence.
4. Replace fabricated records and confirmations with empty states and local shopping drafts. Keep prescription entry in memory only, not localStorage. Route real care enquiries to clinic contact. Verify no checkout claims a payment or booking occurred.
5. Prepare a SKIDS-branded try-on entry with explicit unavailable state and documented Oculfit handoff requirements. Do not invent vendor API methods, request a child photo or simulate clinical measurements.
6. Validate routes, draft flow, mobile menu and browser rendering. Document launch dependencies, then publish the reviewed implementation to the existing site.

## Art direction

A small optical boutique with the warmth of a children's editorial: expressive but restrained headlines, comfortable spacing, product-led imagery and clear language. Campaign image is AI-generated concept photography, not a real patient, testimonial or product photograph. Frame drawings remain clearly labelled illustrative samples until licensed supplier photography, actual dimensions, inventory and verified prices are supplied.

## Oculfit contract still required

Partner tenant/approved launch URL or SDK docs, authentication/session issuance, SKIDS frame-to-vendor SKU mapping, domain allowlist, camera delegation policy, consent and child-data retention requirements, results callback contract and clinician verification workflow. No vendor secret belongs in public JS. See README for current integration boundaries.

## Verification

19 jsdom regression tests passed. Browser checks at 320, 390, 768 and 1440 pixels covered navigation, catalog filters, page layout and the product-to-shopping-list flow. The 320px homepage headline overflow was corrected and rechecked; mobile and tablet document width matched the viewport. No JavaScript errors were captured in the browser. The real Oculfit SDK, payment, booking and records integrations remain outside the verified front-end scope.

## Persona carousel extension

User direction: move beyond a conventional frame-and-lens store to children wearing different looks as scientists, sports lovers, creators and adventurers, preserving “let kids be kids.”

Implemented four editorial stories, distinct child campaign portraits, frame/colour links into the PDP and context-specific lens questions. These are interests to explore freely, not rigid types, gender assignments or diagnoses. No automatic rotation; keyboard tabs/arrows, previous/next controls and horizontal swipe. Actual lenses remain subject to prescription and optician review.

Additional primary references, reviewed 8 September 2026:

- American Academy of Pediatrics, “Does my child need eye protection for sports?” https://www.healthychildren.org/English/tips-tools/ask-the-pediatrician/Pages/does-my-child-need-eye-protection-for-sports.aspx — ordinary spectacles do not provide sports protection. Accordingly, the football portrait shows a child resting off the field, and its lens guidance directs parents to ask about protective eyewear. Publication date: not stated in the reviewed excerpt.
- ZEISS, “PhotoFusion X Lenses” https://www.zeiss.com/vision-care/us/need-new-eyeglasses/photofusion-x.html — tint depends on temperature and UV conditions. Accordingly, the outdoor portrait is illustrative only, with no performance simulation or promised tint level. Publication date: not stated.

Added regression coverage for carousel wraparound/keyboard focus, all four frame-and-colour handoffs, invalid colour fallback and horizontal versus vertical gestures.

Final persona verification: 23 tests passed. Browser checks confirmed tab/arrow selection, next-slide control, loaded campaign imagery, creator-to-plum-PDP handoff, and no page overflow at 320px or 390px. All four generated assets were visually inspected and encoded as WebP; together they are about 552 KB, with carousel images requested lazily.
