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
