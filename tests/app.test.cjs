const { test } = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const fs = require("node:fs");
const html = fs.readFileSync("public/index.html", "utf8");
function boot(path = "/", state) {
  const dom = new JSDOM(html, {
    url: "http://localhost" + path,
    runScripts: "outside-only",
  });
  const w = dom.window;
  w.scrollTo = () => {};
  if (state) w.localStorage.setItem("skids_vision_v2", JSON.stringify(state));
  w.eval(fs.readFileSync("public/js/data.js", "utf8"));
  w.eval(fs.readFileSync("public/js/app.js", "utf8"));
  return { w, d: w.document, close: () => w.close() };
}
const saved = (w) => JSON.parse(w.localStorage.getItem("skids_vision_v2"));
const event = (w, type) =>
  new w.Event(type, { bubbles: true, cancelable: true });
for (const route of [
  "/",
  "/frames",
  "/frames/explorer",
  "/try-on",
  "/prescription",
  "/cart",
  "/checkout",
  "/orders",
  "/appointment",
  "/account",
  "/missing",
]) {
  test("renders " + route, () => {
    const { w, d, close } = boot(route);
    assert.ok(d.querySelector("#app h1"));
    assert.ok(d.querySelector("#footer a"));
    assert.doesNotMatch(
      d.querySelector("#app").textContent,
      /Aarav|Sharma|48-hour|AI fitting|120K/,
    );
    close();
  });
}
test("age, category, search, sort and empty-state reset work together", () => {
  const { w, d, close } = boot("/frames?age=4-7");
  assert.equal(d.querySelector("#resultCount").textContent, "5 frames");
  d.querySelector('[data-cat="playful"]').click();
  assert.equal(d.querySelectorAll(".shop-card").length, 2);
  const search = d.querySelector("#searchFrames");
  search.value = "sunbeam";
  search.dispatchEvent(event(w, "input"));
  assert.equal(d.querySelectorAll(".shop-card").length, 1);
  search.value = "no-such-frame";
  search.dispatchEvent(event(w, "input"));
  assert.ok(d.querySelector("#resetFilters"));
  d.querySelector("#resetFilters").click();
  assert.equal(d.querySelectorAll(".shop-card").length, 8);
  d.querySelector("#sort").value = "low";
  d.querySelector("#sort").dispatchEvent(event(w, "change"));
  assert.equal(d.querySelector(".shop-card h3").textContent, "Pebble");
  close();
});
test("favourites persist and unsaving removes them from saved-only view", () => {
  const a = boot("/frames");
  a.d.querySelector('[data-wish="explorer"]').click();
  const state = saved(a.w);
  assert.deepEqual(state.wishlist, ["explorer"]);
  a.close();
  const b = boot("/frames?saved=1", state);
  assert.equal(b.d.querySelectorAll(".shop-card").length, 1);
  b.d.querySelector('[data-wish="explorer"]').click();
  assert.equal(b.d.querySelectorAll(".shop-card").length, 0);
  assert.equal(saved(b.w).wishlist.length, 0);
  b.close();
});
test("PDP colour/lens/quantity selection accumulates in bag and saves a truthful draft", () => {
  const { w, d, close } = boot("/frames/explorer");
  d.querySelector('[data-color="amber"]').click();
  d.querySelector('[data-lens="photo"]').click();
  d.querySelector("#qp").click();
  d.querySelector("#addBtn").click();
  d.querySelector("#addBtn").click();
  const cart = saved(w).cart;
  assert.equal(cart[0].qty, 4);
  assert.equal(cart[0].colorId, "amber");
  assert.equal(cart[0].lensId, "photo");
  d.querySelector(".cart-link").click();
  assert.match(d.querySelector("#app").textContent, /₹9,596/);
  assert.doesNotMatch(
    d.querySelector("#app").textContent,
    /AI fitting|Free|Member discount/,
  );
  d.querySelector("#checkout").click();
  assert.ok(d.querySelector("#saveDraft"));
  d.querySelector("#saveDraft").click();
  assert.equal(saved(w).orders[0].total, 9596);
  assert.match(d.querySelector("h1").textContent, /shopping lists/);
  assert.match(d.querySelector("#app").textContent, /not placed orders/);
  close();
});
test("prescription notes stay in memory, including after a cart save", () => {
  const { w, d, close } = boot("/prescription");
  d.querySelector("#odS").value = "-1.25";
  d.querySelector("#osS").value = "-1";
  assert.equal(d.querySelector("#rxForm").checkValidity(), true);
  d.querySelector("#rxForm").dispatchEvent(event(w, "submit"));
  d.querySelector(".brand").click();
  d.querySelector('[data-wish="sunbeam"]').click();
  assert.equal(saved(w).prescription, null);
  d.querySelector('a[href="/prescription"]').click();
  assert.equal(d.querySelector("#odS").value, "-1.25");
  d.querySelector("#clearRx").click();
  assert.equal(d.querySelector("#odS").value, "");
  close();
});
test("prescription fields reject invalid axis and require spheres", () => {
  const { d, close } = boot("/prescription");
  assert.equal(d.querySelector("#rxForm").checkValidity(), false);
  d.querySelector("#odS").value = "0";
  d.querySelector("#osS").value = "0";
  d.querySelector("#odA").value = "181";
  assert.equal(d.querySelector("#rxForm").checkValidity(), false);
  d.querySelector("#odA").value = "180";
  assert.equal(d.querySelector("#rxForm").checkValidity(), true);
  close();
});
test("visit plans save without asserting an appointment was booked", () => {
  const { w, d, close } = boot("/appointment?reason=screening");
  assert.equal(d.querySelector("#visitReason").value, "screening");
  d.querySelector("#visitDate").value = "2099-01-20";
  d.querySelector("#visitForm").dispatchEvent(event(w, "submit"));
  assert.equal(saved(w).appointments[0].date, "2099-01-20");
  assert.match(d.querySelector("#visitStatus").textContent, /not reserved/);
  close();
});
test("try-on keeps the selected frame and never requests a child photo", () => {
  const { w, d, close } = boot("/try-on?frame=explorer");
  assert.match(d.querySelector("#saveTry").textContent, /Explorer/);
  assert.equal(d.querySelectorAll('video,input[type="file"],iframe').length, 0);
  d.querySelector("#saveTry").click();
  assert.deepEqual(saved(w).wishlist, ["explorer"]);
  close();
});
test("mobile menu toggles and closes after route navigation", () => {
  const { d, close } = boot();
  d.querySelector(".menu-toggle").click();
  assert.equal(
    d.querySelector(".menu-toggle").getAttribute("aria-expanded"),
    "true",
  );
  d.querySelector("#mainLinks a").click();
  assert.equal(
    d.querySelector(".menu-toggle").getAttribute("aria-expanded"),
    "false",
  );
  assert.equal(d.querySelector("#app").getAttribute("tabindex"), "-1");
  close();
});

test("personality carousel changes stories, wraps and supports keyboard navigation", () => {
  const { w, d, close } = boot("/");
  assert.match(d.querySelector("#persona-panel").textContent, /Big questions/);
  d.querySelector("#persona-next").click();
  assert.equal(
    d.querySelector("#persona-tab-doctor").getAttribute("aria-selected"),
    "true",
  );
  d.querySelector("#persona-next").click();
  assert.equal(
    d.querySelector("#persona-tab-sports").getAttribute("aria-selected"),
    "true",
  );
  assert.match(
    d.querySelector("#persona-panel").textContent,
    /sports protection/,
  );
  d.querySelector("#persona-tab-sports").dispatchEvent(
    new w.KeyboardEvent("keydown", { key: "End", bubbles: true }),
  );
  assert.equal(d.activeElement.id, "persona-tab-adventurer");
  assert.match(d.querySelector("#persona-panel").textContent, /photochromic/);
  d.querySelector("#persona-next").click();
  assert.equal(
    d.querySelector("#persona-tab-scientist").getAttribute("aria-selected"),
    "true",
  );
  d.querySelector("#persona-prev").click();
  assert.equal(d.querySelector("#persona-count").textContent, "05 / 05");
  assert.equal(
    d.querySelectorAll('.persona-tabs [role="tab"][tabindex="0"]').length,
    1,
  );
  close();
});

test("each personality carries its exact frame and colour into the product flow", () => {
  for (const [id, frame, colour] of [
    ["scientist", "scholar", "midnight"],
    ["doctor", "sunbeam", "rose"],
    ["sports", "explorer", "crystal-blue"],
    ["creator", "stargazer", "plum"],
    ["adventurer", "striker", "meadow"],
  ]) {
    const { w, d, close } = boot("/");
    d.querySelector("#persona-tab-" + id).click();
    d.querySelector(".persona-actions .btn").click();
    assert.equal(w.location.pathname, "/frames/" + frame);
    assert.equal(
      d.querySelector('.sw[aria-pressed="true"]').dataset.color,
      colour,
    );
    assert.match(
      d.querySelector(".persona-pdp-note").textContent,
      /lens|eyewear/i,
    );
    d.querySelector("#addBtn").click();
    assert.equal(saved(w).cart[0].colorId, colour);
    assert.equal(saved(w).cart[0].lensId, "standard");
    close();
  }
});

test("invalid colour links fall back to a colour stocked in the sample frame", () => {
  const { w, d, close } = boot("/frames/scholar?colour=not-a-colour");
  d.querySelector("#addBtn").click();
  assert.equal(saved(w).cart[0].colorId, "midnight");
  close();
});

test("horizontal carousel gesture changes slide and vertical gesture does not", () => {
  const { w, d, close } = boot("/");
  const gesture = (x, y) => {
    const media = d.querySelector("#persona-swipe");
    media.dispatchEvent(
      new w.MouseEvent("pointerdown", { clientX: 200, clientY: 200 }),
    );
    media.dispatchEvent(
      new w.MouseEvent("pointerup", { clientX: x, clientY: y }),
    );
  };
  gesture(190, 100);
  assert.equal(d.querySelector("#persona-count").textContent, "01 / 05");
  gesture(100, 190);
  assert.equal(d.querySelector("#persona-count").textContent, "02 / 05");
  close();
});

test("vision breakdown traverses eyes, lenses, fit and life with correct accessible state", () => {
  const { w, d, close } = boot("/");
  assert.match(d.querySelector("#vision-panel").textContent, /retina/);
  d.querySelector("#vision-next").click();
  assert.equal(
    d.querySelector("#vision-tab-lenses").getAttribute("aria-selected"),
    "true",
  );
  assert.match(
    d.querySelector("#vision-panel").textContent,
    /not a literal stack/,
  );
  d.querySelector("#vision-next").click();
  assert.match(
    d.querySelector("#vision-panel").textContent,
    /Pupillary distance/,
  );
  d.querySelector("#vision-tab-fit").dispatchEvent(
    new w.KeyboardEvent("keydown", { key: "End", bubbles: true }),
  );
  assert.equal(d.activeElement.id, "vision-tab-life");
  assert.equal(
    d.querySelectorAll("#vision-panel .vision-life-grid img").length,
    2,
  );
  d.querySelector("#vision-next").click();
  assert.equal(
    d.querySelector("#vision-panel").getAttribute("aria-labelledby"),
    "vision-tab-eyes",
  );
  assert.equal(
    d.querySelectorAll('.vision-step-tabs [tabindex="0"]').length,
    1,
  );
  close();
});

test("mobile sample looks and tint demo work without prescribing or collecting a photo", () => {
  const { w, d, close } = boot("/try-on?frame=explorer");
  d.querySelector('[data-sample="doctor"]').click();
  assert.match(d.querySelector("#samplePhone img").src, /persona-doctor/);
  d.querySelector("#finishTint").click();
  assert.equal(d.querySelector("#lensSwatch").dataset.finish, "tint");
  assert.equal(
    d.querySelector("#finishTint").getAttribute("aria-pressed"),
    "true",
  );
  d.querySelector("#finishClear").click();
  assert.equal(d.querySelector("#lensSwatch").dataset.finish, "clear");
  d.querySelector("#saveTry").click();
  assert.deepEqual(saved(w).wishlist, ["sunbeam"]);
  assert.equal(d.querySelectorAll('input[type="file"],video,iframe').length, 0);
  d.querySelector("#sampleProduct").click();
  assert.equal(
    d.querySelector('.sw[aria-pressed="true"]').dataset.color,
    "rose",
  );
  assert.equal(
    d.querySelector('.opt[aria-pressed="true"]').dataset.lens,
    "standard",
  );
  close();
});

test("a frame without a campaign portrait retains its identity in the sample showroom", () => {
  const { w, d, close } = boot("/try-on?frame=feather");
  assert.match(d.querySelector("#samplePhone").textContent, /Feather/);
  assert.match(
    d.querySelector("#samplePhone").textContent,
    /No sample portrait/,
  );
  d.querySelector("#saveTry").click();
  assert.deepEqual(saved(w).wishlist, ["feather"]);
  close();
});
