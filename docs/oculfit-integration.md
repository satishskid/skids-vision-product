# Oculfit integration evidence and next steps

Reviewed 8 September 2026. The user confirms SKIDS has signed up with Oculfit. These supplied materials describe a workflow; they do not authorize data transmission or establish a working website integration.

## Supplied sources

- `QRCode Integration.pdf`, supplied locally by the user. Publisher and publication date: not stated. One-page diagram inspected visually.
- [Measurement Video QM.mp4](https://drive.google.com/file/d/1KIPdIVJOc3Rvfh_eoYb5rySHH78ljqNR/view), supplied by the user. Publisher and publication date: not stated. Approximately 1:48; inspected key workflow screens in Drive playback.

## What the materials show

The PDF depicts client data moving from a legacy ERP into a tablet measurement application, measurement data returning to the ERP, and frame data entering the application from a QR code printed on a frame price tag. It provides no payload examples, field schema, endpoints or authentication specification.

The video demonstrates an operator using a tablet with a person wearing an actual frame:

1. Enter a client code, lens width, bridge width and frame type (around 0:24).
2. Capture a front view with the tablet (around 0:44).
3. Adjust front-view guides; the screen shows pupillary distance and fitting height (around 1:02).
4. Capture a side view (around 1:22).
5. Adjust vertex distance; the screen also labels pantoscopic tilt (around 1:27).

This is evidence for assisted optical fitting. It does not establish that this account includes a consumer virtual frame overlay, a mobile self-service launch flow or a lens simulation SDK. No measurement accuracy or pediatric suitability claim is established by the demo.

## Proposed SKIDS flow

Keep personality discovery and sample looks on the parent-facing site. Carry the selected real catalogue frame into a clinic fitting session once partner integration is available. Let the operator capture and review the measurements, then associate the reviewed result with the appropriate clinic record. Keep technical QR exchange out of the parent shopping journey.

Do not invent QR contents from the diagram or use demo frame dimensions as clinical inputs. The current site's frame catalogue is illustrative and its saved lists are browser-local; an ERP and patient-record integration is a separate implementation dependency.

## Agreed scope

After this review, the user explicitly directed that the concept is sufficient for now and integration will happen later. The design phase is complete without partner connectivity. The following handoff is a future-phase checklist, not a current request for credentials or a blocker.

## Future partner handoff

- SKIDS tenant launch URL and integration documentation for the licensed measurement and/or virtual try-on modules.
- QR payload specification with non-patient sample input/output for client, frame and measurement data.
- Supported frame identifiers, dimensions, units and catalogue requirements.
- Authentication/session mechanism, result return mechanism and test environment.
- White-label configuration, supported devices and pediatric workflow requirements.
- Photo/measurement storage, retention and deletion behavior to implement the appropriate parent consent and clinic handling.

Never put private partner credentials in the public SPA. No photos or clinical records were uploaded during this review, and no live integration was enabled.
