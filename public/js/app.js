/* SKIDS Vision — SPA */
(function () {
  "use strict";
  var app = document.getElementById("app");

  /* ---------- utils ---------- */
  function $(s, c) {
    return (c || document).querySelector(s);
  }
  function $$(s, c) {
    return Array.prototype.slice.call((c || document).querySelectorAll(s));
  }
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function rupee(n) {
    return "₹" + n.toLocaleString("en-IN");
  }
  function frameById(id) {
    for (var i = 0; i < FRAMES.length; i++)
      if (FRAMES[i].id === id) return FRAMES[i];
  }
  function colorById(id) {
    for (var i = 0; i < FRAME_COLORS.length; i++)
      if (FRAME_COLORS[i].id === id) return FRAME_COLORS[i];
  }
  function lensById(id) {
    for (var i = 0; i < LENS_OPTIONS.length; i++)
      if (LENS_OPTIONS[i].id === id) return LENS_OPTIONS[i];
  }
  function frameSvg(f, hex, w) {
    var round = f.shape === "round" || f.shape === "wire";
    var left = round
      ? '<ellipse cx="88" cy="76" rx="49" ry="43"/>'
      : '<rect x="35" y="37" width="108" height="77" rx="' +
        (f.cat === "sporty" ? 24 : 16) +
        '"/>';
    var right = round
      ? '<ellipse cx="212" cy="76" rx="49" ry="43"/>'
      : '<rect x="157" y="37" width="108" height="77" rx="' +
        (f.cat === "sporty" ? 24 : 16) +
        '"/>';
    if (f.shape === "cat-eye") {
      left =
        '<path d="M34 36 Q86 44 141 53 L132 91 Q121 121 69 111 Q42 106 34 36Z"/>';
      right =
        '<path d="M266 36 Q214 44 159 53 L168 91 Q179 121 231 111 Q258 106 266 36Z"/>';
    }
    if (f.shape === "square") {
      left = '<rect x="35" y="29" width="108" height="91" rx="12"/>';
      right = '<rect x="157" y="29" width="108" height="91" rx="12"/>';
    }
    if (f.shape === "wrap") {
      left = '<path d="M30 48 Q78 34 141 46 L133 95 Q89 119 43 98Z"/>';
      right = '<path d="M270 48 Q222 34 159 46 L167 95 Q211 119 257 98Z"/>';
    }
    return (
      '<svg class="frame-art" width="' +
      (w || 240) +
      '" height="' +
      Math.round((w || 240) * 0.5) +
      '" viewBox="0 0 300 150" aria-hidden="true"><g fill="none" stroke="' +
      hex +
      '" stroke-width="' +
      (f.shape === "wire" ? 3 : 7) +
      '" stroke-linecap="round"><path d="M37 48 L17 29 Q10 23 9 36 M263 48 L283 29 Q290 23 291 36" opacity=".6"/><path d="M137 64 Q150 55 163 64"/><g fill="white" fill-opacity=".4">' +
      left +
      right +
      '</g></g><g fill="none" stroke="white" stroke-opacity=".55" stroke-width="2"><path d="M51 51 Q78 39 115 49 M177 49 Q211 39 245 51"/></g><g fill="#b8aa88"><circle cx="35" cy="63" r="2"/><circle cx="265" cy="63" r="2"/></g></svg>'
    );
  }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove("show");
    }, 2600);
  }
  /* ---------- state (localStorage) ---------- */
  var DEFAULT_STATE = {
    cart: [],
    wishlist: [],
    prescription: null,
    kids: [],
    appointments: [],
    orders: [],
  };

  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem("skids_vision_v2"));
      if (!s) throw 0;
      return Object.assign({}, DEFAULT_STATE, s);
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }
  function save() {
    localStorage.setItem(
      "skids_vision_v2",
      JSON.stringify(Object.assign({}, S, { prescription: null })),
    );
  }
  var S = loadState();

  /* ---------- router ---------- */
  function go(path) {
    if (location.pathname + location.search !== path)
      history.pushState({}, "", path);
    render();
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-route]");
    if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      go(a.getAttribute("href"));
    }
  });
  window.addEventListener("popstate", render);

  function render() {
    renderNav();
    var path = location.pathname.replace(/\/+$/, "") || "/";
    var m;
    if (path === "/") homePage();
    else if (path === "/frames") framesPage();
    else if ((m = path.match(/^\/frames\/([\w-]+)$/))) {
      var f = frameById(m[1]);
      f ? pdpPage(f) : notFound();
    } else if (path === "/try-on") tryonPage();
    else if (path === "/prescription") rxPage();
    else if (path === "/cart") cartPage();
    else if (path === "/checkout") checkoutPage();
    else if (path === "/orders") ordersPage();
    else if (path === "/appointment") apptPage();
    else if (path === "/account") accountPage();
    else notFound();
    $$("label", app).forEach(function (label) {
      var field = label.parentElement.querySelector("input,select,textarea");
      if (field && field.id) label.htmlFor = field.id;
    });
    document.title =
      (app.querySelector("h1")
        ? app
            .querySelector("h1")
            .innerHTML.replace(/<br\s*\/?>/gi, " ")
            .replace(/<[^>]*>/g, "")
        : "Eyewear & eye care for children") + " | SKIDS Vision";
  }

  /* ---------- nav + footer ---------- */
  function cartCount() {
    return S.cart.reduce(function (a, c) {
      return a + c.qty;
    }, 0);
  }
  function renderNav() {
    var path = location.pathname;
    document.getElementById("nav").innerHTML =
      '<div class="service-strip">Little eyes. A whole world to see. <a href="https://skids.clinic/contact">Talk to the clinic ↗</a></div><div class="wrap"><a class="brand" data-route href="/" aria-label="SKIDS Vision home"><span class="wordmark">skids<span class="brand-dot">.</span></span><span class="brand-divider"></span><span class="vision-word">vision<small>EYE CARE FOR GROWING UP</small></span></a><div class="links" id="mainLinks">' +
      [
        ["/frames", "Shop frames"],
        ["/try-on", "Virtual try-on"],
        ["/#care", "Eye care"],
        ["/appointment", "Visit the clinic"],
      ]
        .map(function (l) {
          return (
            "<a " +
            (l[0].includes("#") ? "" : "data-route") +
            ' href="' +
            l[0] +
            '" ' +
            (path === l[0] ? 'aria-current="page"' : "") +
            ">" +
            l[1] +
            "</a>"
          );
        })
        .join("") +
      '</div><div class="nav-cta"><a class="saved-link" data-route href="/frames?saved=1" aria-label="Saved frames">♡</a><a class="cart-link" data-route href="/cart" aria-label="Shopping bag, ' +
      cartCount() +
      ' items"><svg width="22" height="24" viewBox="0 0 24 26" fill="none" aria-hidden="true"><path d="M4 8h16l1 15H3L4 8Z M8 9V6a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.5"/></svg><span class="cart-badge">' +
      cartCount() +
      '</span></a><button class="menu-toggle" aria-expanded="false" aria-controls="mainLinks" aria-label="Open navigation">☰</button></div></div>';
    $(".menu-toggle").onclick = function () {
      var open = this.getAttribute("aria-expanded") !== "true";
      this.setAttribute("aria-expanded", String(open));
      this.setAttribute(
        "aria-label",
        open ? "Close navigation" : "Open navigation",
      );
      $("#mainLinks").classList.toggle("open", open);
    };
  }

  function footerHTML() {
    return (
      '<div class="wrap"><div class="footer-top"><div><a data-route href="/" class="footer-logo">skids. <span>vision</span></a><p>For little eyes.<br>And everything ahead.</p></div><div><h4>Find their pair</h4><a data-route href="/frames">Explore frames</a><a data-route href="/frames?saved=1">Saved favourites</a><a data-route href="/try-on">Virtual try-on</a></div><div><h4>Here to help</h4><a data-route href="/appointment">Visit the clinic</a><a data-route href="/prescription">Prescription notes</a><a data-route href="/account">My shortlist & plans</a><a href="https://skids.clinic/contact">Contact SKIDS ↗</a></div><div><h4>A little care goes a long way.</h4><p>Questions about a first pair or a school screening report? Start with a conversation.</p><a class="footer-contact" href="https://skids.clinic/contact">Let’s talk ↗</a></div></div><div class="base"><span>© ' +
      new Date().getFullYear() +
      ' SKIDS Health Technologies Pvt. Ltd.</span><span><a href="https://skids.clinic/legal/privacy">Privacy</a> · <a href="https://skids.clinic/legal/terms">Terms</a> · <a href="https://skids.clinic">Part of SKIDS ↗</a></span></div></div>'
    );
  }

  function notFound() {
    document.getElementById("footer").innerHTML = footerHTML();
    app.innerHTML =
      '<div class="page"><div class="wrap" style="text-align:center;padding:80px 0">' +
      '<p class="eyebrow">404</p><h1 style="font-size:40px;margin:12px 0">This page is out of focus.</h1>' +
      '<p style="color:var(--muted);margin-bottom:28px">The page you are looking for does not exist.</p>' +
      '<a class="btn solid" data-route href="/">Back to home</a></div></div>';
  }

  /* ---------- cart logic ---------- */
  function cartTotal() {
    return S.cart.reduce(function (a, c) {
      var f = frameById(c.frameId);
      var l = lensById(c.lensId);
      return a + (f.price + l.price) * c.qty;
    }, 0);
  }
  function addToCart(frameId, colorId, lensId) {
    var key = frameId + "|" + colorId + "|" + lensId;
    for (var i = 0; i < S.cart.length; i++) {
      var c = S.cart[i];
      if (c.frameId + "|" + c.colorId + "|" + c.lensId === key) {
        c.qty++;
        save();
        return false;
      }
    }
    S.cart.push({ frameId: frameId, colorId: colorId, lensId: lensId, qty: 1 });
    save();
    return true;
  }
  function toggleWish(id) {
    var i = S.wishlist.indexOf(id);
    if (i >= 0) {
      S.wishlist.splice(i, 1);
      save();
      return false;
    }
    S.wishlist.push(id);
    save();
    return true;
  }

  /* ---------- HOME ---------- */
  function homePage() {
    document.getElementById("footer").innerHTML = footerHTML();
    app.innerHTML = `<header class="editorial-hero"><div class="hero-copy"><p class="eyebrow">SMALL FRAMES. BIG POSSIBILITIES.</p><h1>A world to see.<br>A pair to <em>love.</em></h1><p>Glasses they feel good in. Eye care you feel good about. Find a little more confidence in every pair.</p><div class="hero-actions"><a class="btn solid" href="#personalities">Find their kind of frame <span>↓</span></a><a class="text-link" data-route href="/appointment">First pair? Start here →</a></div><div class="hero-foot"><span class="tiny-glasses">${frameSvg(FRAMES[2], "#294c3c", 65)}</span><span>Made for growing faces.<br><b>Chosen together, with care.</b></span></div></div><figure class="hero-photo"><img src="/assets/campaign.webp" alt="Campaign portrait of a smiling child wearing round orange glasses" fetchpriority="high" width="1536" height="1024"><figcaption>A little colour. A lot of personality.</figcaption><span class="photo-stamp">LET<br>KIDS<br>BE KIDS.</span></figure></header>
 <section class="entry-strip wrap" aria-label="Where would you like to start?"><a data-route href="/appointment?reason=screening"><span>01</span><div><b>A note came home from school?</b><small>Let’s make sense of the screening.</small></div><i>↗</i></a><a data-route href="/frames"><span>02</span><div><b>Ready for a new pair?</b><small>Find a look that feels like them.</small></div><i>↗</i></a><a data-route href="/appointment"><span>03</span><div><b>Just want their eyes checked?</b><small>A good place to start.</small></div><i>↗</i></a></section>
 ${personaCarouselHTML()}
 <section class="collection-section wrap"><div class="section-heading"><div><p class="eyebrow">KEEP EXPLORING</p><h2>Different days. Different sides of them.</h2></div><a class="text-link" data-route href="/frames">Explore all frames ↗</a></div><div class="age-links"><span>Find their starting size</span><a data-route href="/frames?age=4-7">Little ones <b>4–7</b> ↗</a><a data-route href="/frames?age=8-11">Growing explorers <b>8–11</b> ↗</a><a data-route href="/frames?age=12-14">Finding their own <b>12–14</b> ↗</a></div><div class="home-products">${[FRAMES[2], FRAMES[0], FRAMES[1], FRAMES[7]].map(productCard).join("")}</div><p class="catalog-note">A first look at our collection. Illustrative frames and indicative prices; final fit, availability and lens cost are confirmed with the clinic.</p></section>
 <section class="try-banner wrap"><div class="try-art">${frameSvg(FRAMES[2], "#b1643b", 300)}<span>That’s so <em>you.</em></span><div class="try-colours"><i></i><i></i><i></i><i></i></div></div><div class="try-copy"><p class="eyebrow">A LITTLE DRESS-UP. A BIG DECISION.</p><h2>Let them have<br>the first look.</h2><p>Round and colourful? Quietly classic? Make a shortlist together, then let an optician help with the fit.</p><a class="btn solid" data-route href="/try-on">Explore virtual try-on ↗</a><small>At-home try-on is coming to SKIDS Vision.</small></div></section>
 <section class="care-section" id="care"><div class="wrap care-grid"><div><p class="eyebrow">THE CARE BEHIND THE PAIR</p><h2>You don’t need to<br>know all the answers.<br><em>That’s why we’re here.</em></h2><p>A school report. A first prescription. A pair that keeps slipping. Tell us where you are, and we’ll help with the next step.</p><a class="btn solid" data-route href="/appointment">Plan a clinic visit ↗</a></div><div class="care-steps"><article><span>01 / CHECK</span><h3>Start with their eyes.</h3><p>Bring their screening report or prescription. The clinic can help you understand what it means.</p></article><article><span>02 / CHOOSE</span><h3>Find their kind of comfortable.</h3><p>Choose a shape and colour together. Have the bridge, temples and lens position checked by an optician.</p></article><article><span>03 / KEEP IN TOUCH</span><h3>Make room for growing up.</h3><p>Ask when to return for a vision review, and who to contact if their glasses need adjusting.</p></article></div></div></section>
 <section class="lens-section wrap"><div class="section-heading"><div><p class="eyebrow">LET’S TALK LENSES</p><h2>The part you look through matters, too.</h2></div><p>Start with the prescription.<br>Choose the extras with an optician.</p></div><div class="lens-columns"><article><span class="lens-disc clear-lens"></span><h3>Everyday clarity</h3><p>Prescription lenses for their everyday pair. Ask about material, coating and total cost.</p></article><article><span class="lens-disc sun-lens"></span><h3>Inside. Outside.</h3><p>Photochromic lenses change tint with light conditions. Your optician can explain the options.</p></article><article><span class="lens-disc care-lens"></span><h3>When myopia needs a plan</h3><p>Myopia-management lenses are a separate clinical decision. Discuss suitability and follow-up at a vision appointment.</p></article></div><a class="text-link" data-route href="/appointment?reason=lenses">Get help choosing lenses →</a></section>
 <section class="faq-section wrap"><div><p class="eyebrow">PARENT TO PARENT</p><h2>A few things<br>you might be wondering.</h2></div><div class="faq-list">${[
   [
     "The school sent a screening report. What next?",
     "A screening report is a starting point, not a prescription. Bring it to a vision appointment so the clinician can explain the finding and next steps.",
   ],
   [
     "How do I choose the right frame size?",
     "Age ranges help narrow the collection, but faces grow differently. An optician should check the bridge, temple length and lens position before dispensing.",
   ],
   [
     "Can we try the frames on at home?",
     "SKIDS virtual try-on is being prepared with our technology partner. For now, save a shortlist together and contact the clinic for a fitting.",
   ],
   [
     "Are the prices final?",
     "The collection currently uses sample designs and indicative prices. The clinic will confirm the actual frame, lenses, availability and complete price before you order.",
   ],
 ]
   .map(function (q) {
     return (
       "<details><summary>" +
       q[0] +
       "<span>+</span></summary><p>" +
       q[1] +
       "</p></details>"
     );
   })
   .join(
     "",
   )}</div></section><section class="closing-note"><p>More playground. More page-turning. More possibility.</p><h2>Here’s to seeing it all.</h2><a class="btn solid" data-route href="/frames">Find their pair ↗</a></section>`;
    wireProductCards(app);
    wirePersonaCarousel();
  }
  function personaCarouselHTML() {
    return (
      '<section class="persona-section wrap" id="personalities" aria-roledescription="carousel" aria-label="Eyewear for their kind of curious"><div class="section-heading"><div><p class="eyebrow">LET KIDS BE ALL KINDS OF KIDS.</p><h2>Who will they be today?</h2></div><p>A scientist before lunch. An adventurer after.<br>Find a look for every side of them.</p></div><div class="persona-tabs" role="tablist" aria-label="Explore their interests">' +
      PERSONAS.map(function (p, i) {
        return (
          '<button id="persona-tab-' +
          p.id +
          '" type="button" role="tab" aria-selected="' +
          (i === 0) +
          '" aria-controls="persona-panel" tabindex="' +
          (i === 0 ? "0" : "-1") +
          '" data-persona="' +
          i +
          '"><span class="persona-tab-number">0' +
          (i + 1) +
          "</span>" +
          p.label +
          "</button>"
        );
      }).join("") +
      '</div><div id="persona-panel" role="tabpanel" aria-labelledby="persona-tab-scientist" tabindex="0"></div><div class="persona-bottom"><p>Interests are for inspiration. Prescription and fit are personal.</p><div class="persona-controls"><button type="button" id="persona-prev" aria-label="Previous personality">←</button><span id="persona-count" role="status" aria-live="polite" aria-atomic="true"></span><button type="button" id="persona-next" aria-label="Next personality">→</button></div></div><p class="persona-footnote">Campaign imagery shows imagined looks, not exact stocked products or lens performance. Your optician confirms the frame, prescription and lens choice.</p></section>'
    );
  }
  function wirePersonaCarousel() {
    var index = 0,
      tabs = $$("[data-persona]", app),
      panel = $("#persona-panel", app);
    function show(next, focusTab) {
      index = (next + PERSONAS.length) % PERSONAS.length;
      var p = PERSONAS[index],
        f = frameById(p.frame),
        c = colorById(p.colour);
      tabs.forEach(function (tab, i) {
        tab.setAttribute("aria-selected", String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", "persona-tab-" + p.id);
      panel.innerHTML =
        '<article class="persona-slide palette-' +
        p.palette +
        '"><figure class="persona-image" id="persona-swipe"><img src="' +
        p.image +
        '" alt="' +
        p.alt +
        '" width="1536" height="1024" loading="lazy"><figcaption>' +
        p.caption +
        '</figcaption><span class="persona-image-label">LET THEM<br>BE THEM.</span></figure><div class="persona-story"><p class="eyebrow">' +
        p.name +
        "</p><h3>" +
        p.headline.split("\n").map(esc).join("<br>") +
        '</h3><p class="persona-intro">' +
        p.story +
        '</p><div class="persona-frame"><div>' +
        frameSvg(f, c.hex, 112) +
        '</div><div><span class="persona-spec-label">THE FRAME MOOD</span><h4>' +
        f.name +
        " · " +
        c.name +
        "</h4><p>" +
        p.frameNote +
        '</p></div></div><div class="persona-lens"><span class="persona-spec-label">THE LENS CONVERSATION</span><h4>' +
        p.lensTitle +
        "</h4><p>" +
        p.lensNote +
        '</p></div><div class="persona-actions"><a class="btn solid" data-route href="/frames/' +
        f.id +
        "?colour=" +
        p.colour +
        "&persona=" +
        p.id +
        '">Explore this look ↗</a><a class="text-link" data-route href="/appointment?reason=lenses">' +
        p.lensLink +
        " →</a></div></div></article>";
      $("#persona-count").textContent = "0" + (index + 1) + " / 04";
      if (focusTab) tabs[index].focus({ preventScroll: true });
      var start = null,
        swipe = $("#persona-swipe");
      swipe.addEventListener("pointerdown", function (e) {
        start = { x: e.clientX, y: e.clientY };
      });
      swipe.addEventListener("pointerup", function (e) {
        if (!start) return;
        var dx = e.clientX - start.x,
          dy = e.clientY - start.y;
        start = null;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 2)
          show(index + (dx < 0 ? 1 : -1), false);
      });
      swipe.addEventListener("pointercancel", function () {
        start = null;
      });
    }
    tabs.forEach(function (tab, i) {
      tab.onclick = function () {
        show(i, false);
      };
      tab.onkeydown = function (e) {
        var next;
        if (e.key === "ArrowRight") next = index + 1;
        else if (e.key === "ArrowLeft") next = index - 1;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = PERSONAS.length - 1;
        else return;
        e.preventDefault();
        show(next, true);
      };
    });
    $("#persona-prev").onclick = function () {
      show(index - 1, false);
    };
    $("#persona-next").onclick = function () {
      show(index + 1, false);
    };
    show(0, false);
  }

  function productCard(f) {
    var saved = S.wishlist.indexOf(f.id) >= 0;
    return (
      '<article class="shop-card"><div class="product-picture tone-' +
      f.cat +
      '"><a data-route href="/frames/' +
      f.id +
      '" aria-label="View ' +
      f.name +
      '">' +
      frameSvg(f, colorById(f.colors[0]).hex, 270) +
      '</a><button class="wish-button" data-wish="' +
      f.id +
      '" aria-label="Save ' +
      f.name +
      '" aria-pressed="' +
      saved +
      '">' +
      (saved ? "♥" : "♡") +
      '</button><span class="product-fit">' +
      f.age +
      '</span></div><div class="product-caption"><a data-route href="/frames/' +
      f.id +
      '"><h3>' +
      f.name +
      "</h3><p>" +
      f.cat +
      " · " +
      f.shape +
      "</p></a><span>" +
      rupee(f.price) +
      '<small>indicative</small></span></div><div class="product-swatches">' +
      f.colors
        .map(function (c) {
          return (
            '<i title="' +
            colorById(c).name +
            '" style="background:' +
            colorById(c).hex +
            '"></i>'
          );
        })
        .join("") +
      "</div></article>"
    );
  }
  function wireProductCards(root) {
    $$("[data-wish]", root).forEach(function (b) {
      b.onclick = function () {
        var on = toggleWish(b.dataset.wish);
        b.textContent = on ? "♥" : "♡";
        b.setAttribute("aria-pressed", String(on));
        toast(on ? "Saved to your favourites" : "Removed from favourites");
        if (location.search.includes("saved=1")) renderGrid();
      };
    });
  }

  /* ---------- CATALOG ---------- */
  var catFilter = "all",
    catSort = "featured";
  function framesPage() {
    document.getElementById("footer").innerHTML = footerHTML();
    var params = new URLSearchParams(location.search);
    catFilter = "all";
    catSort = "featured";
    app.innerHTML =
      '<div class="page-hero"><div class="wrap"><p class="crumb"><a data-route href="/">Home</a> / Frames</p><p class="eyebrow">THE EVERYDAY COLLECTION</p><h1>A little more them.</h1><p>Let them pick the personality. We’ll help you think about the fit.</p></div></div><section class="wrap catalog-body"><div class="catalog-toolbar"><div class="field"><label for="searchFrames">Find a frame</label><input class="in" id="searchFrames" type="search" placeholder="Try round, Explorer, sporty…"></div><div class="field"><label for="ageFilter">Age guide</label><select class="sel" id="ageFilter"><option value="all">All ages</option><option value="4-7">4–7 years</option><option value="8-11">8–11 years</option><option value="12-14">12–14 years</option></select></div><div class="field"><label for="sort">Sort by</label><select class="sel" id="sort"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="az">Name A–Z</option></select></div><label class="saved-filter"><input id="onlySaved" type="checkbox"> Saved favourites</label></div><div class="cat-bar"><div class="filters">' +
      CATS.map(function (c) {
        return (
          '<button class="fchip' +
          (c.id === "all" ? " on" : "") +
          '" aria-pressed="' +
          (c.id === "all") +
          '" data-cat="' +
          c.id +
          '">' +
          c.name +
          "</button>"
        );
      }).join("") +
      '</div><span id="resultCount" role="status"></span></div><div class="fgrid" id="fgrid"></div><p class="catalog-note">Illustrative sample collection. Prices are indicative. Age is a starting guide; an optician confirms the actual fit and final price.</p><div class="catalog-help"><h2>A good fit is more than an age.</h2><p>Ask an optician to check the bridge, temple length and lens position.</p><a class="text-link" data-route href="/appointment">Get a little help →</a></div></section>';
    $("#ageFilter").value = ["4-7", "8-11", "12-14"].includes(params.get("age"))
      ? params.get("age")
      : "all";
    $("#onlySaved").checked = params.get("saved") === "1";
    $$(".fchip", app).forEach(function (b) {
      b.onclick = function () {
        catFilter = b.dataset.cat;
        $$(".fchip", app).forEach(function (x) {
          x.classList.toggle("on", x === b);
          x.setAttribute("aria-pressed", String(x === b));
        });
        renderGrid();
      };
    });
    $("#searchFrames").oninput = renderGrid;
    $("#ageFilter").onchange = renderGrid;
    $("#onlySaved").onchange = renderGrid;
    $("#sort").onchange = function () {
      catSort = this.value;
      renderGrid();
    };
    renderGrid();
  }
  function renderGrid() {
    var q = $("#searchFrames").value.trim().toLowerCase(),
      age = $("#ageFilter").value,
      saved = $("#onlySaved").checked;
    var list = FRAMES.filter(function (f) {
      var ages = f.age.match(/\d+/g).map(Number),
        range = age.split("-").map(Number);
      return (
        (catFilter === "all" || f.cat === catFilter) &&
        (!q ||
          (f.name + " " + f.cat + " " + f.shape).toLowerCase().includes(q)) &&
        (!saved || S.wishlist.includes(f.id)) &&
        (age === "all" || (ages[0] <= range[1] && ages[1] >= range[0]))
      );
    });
    if (catSort === "low")
      list.sort(function (a, b) {
        return a.price - b.price;
      });
    if (catSort === "high")
      list.sort(function (a, b) {
        return b.price - a.price;
      });
    if (catSort === "az")
      list.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    $("#resultCount").textContent = list.length + " frames";
    $("#fgrid").innerHTML =
      list.map(productCard).join("") ||
      '<div class="empty"><h2>No frames found.</h2><p>Try another age or style, or clear your filters.</p><button class="btn ghost" id="resetFilters">Clear filters</button></div>';
    wireProductCards($("#fgrid"));
    if ($("#resetFilters"))
      $("#resetFilters").onclick = function () {
        history.replaceState({}, "", "/frames");
        framesPage();
      };
  }

  /* ---------- PDP ---------- */
  function pdpPage(f) {
    document.getElementById("footer").innerHTML = footerHTML();
    var requestedColour = new URLSearchParams(location.search).get("colour");
    var color = colorById(
      f.colors.includes(requestedColour) ? requestedColour : f.colors[0],
    );
    var sel = { colorId: color.id, lensId: "standard", qty: 1 };
    app.innerHTML =
      '<div class="page"><div class="wrap">' +
      '<p class="crumb"><a data-route href="/">Home</a> / <a data-route href="/frames">Frames</a> / ' +
      f.name +
      "</p>" +
      '<div class="pdp">' +
      '<div><div class="visual" id="pdpVisual">' +
      frameSvg(f, color.hex, 320, 6) +
      "</div>" +
      '<div class="includes"><b>Illustrative frame</b> · Confirm measurements, lens options, warranty and availability with the clinic before ordering.</div>' +
      "</div>" +
      "<div>" +
      '<p class="eyebrow">' +
      f.cat +
      " · " +
      f.shape +
      " · ages " +
      f.age +
      "</p>" +
      "<h1>" +
      f.name +
      "</h1>" +
      '<p style="color:var(--muted)">' +
      f.blurb +
      "</p>" +
      '<div class="price">' +
      rupee(f.price) +
      '<span style="font-size:14px;color:var(--muted);font-weight:500"> / indicative base price</span></div>' +
      '<span class="save">Sample pricing. Your optician will confirm the complete quote.</span>' +
      '<div class="opts">' +
      '<div class="opt-group"><h4>Colour</h4><div class="swatches">' +
      f.colors
        .map(function (c, ci) {
          return (
            '<button type="button" class="sw' +
            (c === color.id ? " on" : "") +
            '" data-color="' +
            c +
            '" style="background:' +
            colorById(c).hex +
            '" title="' +
            colorById(c).name +
            '" aria-label="' +
            colorById(c).name +
            '" aria-pressed="' +
            (c === color.id) +
            '"></button>'
          );
        })
        .join("") +
      "</div></div>" +
      '<div class="opt-group"><h4>Lenses</h4>' +
      LENS_OPTIONS.map(function (l, li) {
        return (
          '<button type="button" class="opt' +
          (li === 0 ? " on" : "") +
          '" data-lens="' +
          l.id +
          '" aria-pressed="' +
          (li === 0) +
          '"><span><b>' +
          l.name +
          "</b><small>" +
          l.desc +
          '</small></span><span class="op">' +
          (l.price ? "+ " + rupee(l.price) : "Base option") +
          "</span></button>"
        );
      }).join("") +
      "</div>" +
      '<div class="opt-group"><h4>Quantity</h4><div class="qty"><button id="qm" aria-label="Decrease quantity">−</button><span id="qv">1</span><button id="qp" aria-label="Increase quantity">+</button></div></div>' +
      "</div>" +
      '<div class="ctas">' +
      '<button class="btn solid wide" id="addBtn">Add to bag · <span id="lineTotal">' +
      rupee(f.price) +
      "</span></button>" +
      '<a class="btn ghost" data-route href="/try-on?frame=' +
      f.id +
      '">Try on</a>' +
      "</div>" +
      '<div class="rx-box"><b>Have a prescription?</b> <a data-route href="/prescription">Keep a note of it here</a>, or bring it to the clinic. Final lens choice and fit need an optician’s review.</div>' +
      '<div class="includes" style="margin-top:0"><b>' +
      f.tags.join(" · ") +
      "</b></div>" +
      "</div>" +
      "</div></div></div>";
    var fromPersona = PERSONAS.find(function (p) {
      return (
        p.id === new URLSearchParams(location.search).get("persona") &&
        p.frame === f.id
      );
    });
    if (fromPersona) {
      var note = document.createElement("p");
      note.className = "persona-pdp-note";
      note.textContent = fromPersona.lensTitle + ". " + fromPersona.lensNote;
      $(".opts", app).before(note);
    }
    function lineTotal() {
      return (f.price + lensById(sel.lensId).price) * sel.qty;
    }
    function refresh() {
      $("#lineTotal", app).textContent = rupee(lineTotal());
      $("#qv", app).textContent = sel.qty;
    }
    $$(".sw", app).forEach(function (s) {
      s.onclick = function () {
        $$(".sw", app).forEach(function (x) {
          x.classList.remove("on");
        });
        $$(".sw", app).forEach(function (x) {
          x.setAttribute("aria-pressed", String(x === s));
        });
        s.classList.add("on");
        sel.colorId = s.dataset.color;
        $("#pdpVisual", app).innerHTML = frameSvg(
          f,
          colorById(sel.colorId).hex,
          320,
          6,
        );
      };
    });
    $$(".opt", app).forEach(function (o) {
      o.onclick = function () {
        $$(".opt", app).forEach(function (x) {
          x.classList.remove("on");
        });
        $$(".opt", app).forEach(function (x) {
          x.setAttribute("aria-pressed", String(x === o));
        });
        o.classList.add("on");
        sel.lensId = o.dataset.lens;
        refresh();
      };
    });
    $("#qm", app).onclick = function () {
      if (sel.qty > 1) {
        sel.qty--;
        refresh();
      }
    };
    $("#qp", app).onclick = function () {
      sel.qty++;
      refresh();
    };
    $("#addBtn", app).onclick = function () {
      addToCart(f.id, sel.colorId, sel.lensId);
      for (var i = 0; i < S.cart.length; i++) {
        var c = S.cart[i];
        if (
          c.frameId === f.id &&
          c.colorId === sel.colorId &&
          c.lensId === sel.lensId
        )
          c.qty += sel.qty - 1;
      }
      save();
      renderNav();
      toast(
        f.name + " — " + colorById(sel.colorId).name + " added to your bag",
      );
    };
  }

  /* ---------- TRY-ON ---------- */
  function tryonPage() {
    document.getElementById("footer").innerHTML = footerHTML();
    var f =
      frameById(new URLSearchParams(location.search).get("frame")) || FRAMES[2];
    app.innerHTML =
      '<section class="wrap page"><p class="crumb"><a data-route href="/frames">Frames</a> / Virtual try-on</p><div class="try-page"><div class="try-art">' +
      frameSvg(f, colorById(f.colors[0]).hex, 400) +
      '<span>Your next <em>favourite?</em></span></div><div><p class="eyebrow">SKIDS VIRTUAL TRY-ON</p><h1>See the look.<br>Then check the fit.</h1><p>Our at-home try-on experience is on its way. You’ll be able to explore a frame’s look before speaking with an optician about the fit.</p><div class="availability-note"><b>Online try-on isn’t available yet.</b><p>For now, save frames you both like and ask the clinic about trying them on. No camera or child’s photo is needed here.</p></div><button class="btn solid" id="saveTry">Save ' +
      f.name +
      ' to favourites</button><a class="text-link" data-route href="/appointment">Arrange a fitting →</a><a class="text-link" data-route href="/frames">Keep exploring frames →</a></div></div></section>';
    $("#saveTry").onclick = function () {
      if (!S.wishlist.includes(f.id)) {
        S.wishlist.push(f.id);
        save();
      }
      toast(f.name + " saved to favourites");
      this.textContent = "Saved to favourites";
    };
  }
  function rxPage() {
    document.getElementById("footer").innerHTML = footerHTML();
    var p = S.prescription || {};
    app.innerHTML =
      '<section class="page wrap"><p class="crumb"><a data-route href="/">Home</a> / Prescription</p><p class="eyebrow">A NOTE FOR YOUR VISIT</p><h1>Your prescription, in plain sight.</h1><p class="page-intro">Copy the values exactly as written by your clinician. These notes stay in this page session and are cleared when you reload; they are not sent to the clinic.</p><div class="grid2"><form class="card" id="rxForm"><h3>Prescription details</h3><div class="form-grid">' +
      [
        ["odS", "Right eye · sphere", -30, 30, 0.25],
        ["osS", "Left eye · sphere", -30, 30, 0.25],
        ["odC", "Right eye · cylinder", -10, 10, 0.25],
        ["osC", "Left eye · cylinder", -10, 10, 0.25],
        ["odA", "Right eye · axis", 0, 180, 1],
        ["osA", "Left eye · axis", 0, 180, 1],
        ["pd", "PD · millimetres", 30, 80, 0.5],
      ]
        .map(function (x) {
          return (
            '<div class="field"><label for="' +
            x[0] +
            '">' +
            x[1] +
            '</label><input class="in" type="number" id="' +
            x[0] +
            '" min="' +
            x[2] +
            '" max="' +
            x[3] +
            '" step="' +
            x[4] +
            '" ' +
            (x[0] === "odS" || x[0] === "osS" ? "required" : "") +
            ' value="' +
            esc(p[x[0]] || "") +
            '"></div>'
          );
        })
        .join("") +
      '</div><p class="catalog-note">Leave unknown optional values blank. An optician should measure PD if it is missing.</p><button class="btn solid" type="submit">Keep notes for this session</button><button class="btn ghost" type="button" id="clearRx">Clear notes</button><p id="rxStatus" role="status"></p></form><aside class="card"><h3>Prefer to bring the paper?</h3><p>That’s fine. Bring the original prescription or screening report to your appointment. Secure document upload and clinic-record connection are not available here yet.</p><a class="text-link" data-route href="/appointment">Plan a visit →</a></aside></div></section>';
    $("#rxForm").onsubmit = function (e) {
      e.preventDefault();
      S.prescription = {};
      $$("input", this).forEach(function (i) {
        S.prescription[i.id] = i.value;
      });
      $("#rxStatus").textContent =
        "Notes kept for this session. Bring your original prescription for verification.";
    };
    $("#clearRx").onclick = function () {
      S.prescription = null;
      rxPage();
    };
  }

  /* ---------- CART ---------- */
  function cartPage() {
    document.getElementById("footer").innerHTML = footerHTML();
    if (!S.cart.length) {
      app.innerHTML =
        '<div class="page"><div class="empty"><h1 style="font-size:34px;margin-bottom:10px">Your bag is empty.</h1>' +
        '<p style="margin-bottom:26px">Frames tried on and loved belong here.</p>' +
        '<a class="btn solid" data-route href="/frames">Browse frames</a> &nbsp; <a class="btn ghost" data-route href="/try-on">Virtual try-on</a></div></div>';
      return;
    }
    var lines = S.cart
      .map(function (c, i) {
        var f = frameById(c.frameId),
          col = colorById(c.colorId),
          l = lensById(c.lensId);
        return (
          '<div class="cline">' +
          '<div class="fgfx">' +
          frameSvg(f, col.hex, 78) +
          "</div>" +
          "<div><h4>" +
          f.name +
          " — " +
          col.name +
          "</h4>" +
          '<p class="meta">' +
          l.name +
          (l.price ? " · + " + rupee(l.price) : "") +
          " · Prescription to be checked</p>" +
          '<div class="qty" style="margin-top:8px"><button data-qm="' +
          i +
          '" aria-label="Decrease ' +
          f.name +
          ' quantity">−</button><span>' +
          c.qty +
          '</span><button data-qp="' +
          i +
          '" aria-label="Increase ' +
          f.name +
          ' quantity">+</button></div></div>' +
          '<div style="text-align:right"><div class="price">' +
          rupee((f.price + l.price) * c.qty) +
          "</div>" +
          '<button class="x" data-x="' +
          i +
          '" style="margin-top:8px">Remove</button></div>' +
          "</div>"
        );
      })
      .join("");
    app.innerHTML =
      '<div class="page-hero"><div class="wrap"><p class="crumb"><a data-route href="/">Home</a> / Your bag</p>' +
      '<p class="eyebrow">Your bag</p><h1>Review and confirm.</h1></div></div>' +
      '<div class="sec" style="padding-top:0"><div class="wrap"><div class="cart-layout">' +
      "<div>" +
      lines +
      '<div class="rx-box"><b>Before you order</b><br>An optician will need to check the prescription and fit. Save your choices here, then arrange a clinic visit.</div>' +
      "</div>" +
      '<div class="summary"><h3>Your selection</h3>' +
      '<div class="srow"><span>' +
      cartCount() +
      " frame(s)</span><span>" +
      rupee(cartTotal()) +
      "</span></div>" +
      '<div class="srow"><span>Delivery</span><span>Confirm with clinic</span></div>' +
      '<div class="srow total"><span>Indicative total</span><span>' +
      rupee(cartTotal()) +
      "</span></div>" +
      '<button class="btn solid wide" id="checkout">Review shopping list</button>' +
      '<p style="font-size:12px;color:var(--muted);margin-top:12px;text-align:center">Save your selection. Confirm the prescription, fit and final price with the clinic.</p>' +
      "</div>" +
      "</div></div></div>";
    $$("[data-qm]", app).forEach(function (b) {
      b.onclick = function () {
        var c = S.cart[+b.dataset.qm];
        if (c.qty > 1) c.qty--;
        save();
        render();
      };
    });
    $$("[data-qp]", app).forEach(function (b) {
      b.onclick = function () {
        S.cart[+b.dataset.qp].qty++;
        save();
        render();
      };
    });
    $$("[data-x]", app).forEach(function (b) {
      b.onclick = function () {
        S.cart.splice(+b.dataset.x, 1);
        save();
        renderNav();
        render();
      };
    });
    $("#checkout", app).onclick = function () {
      go("/checkout");
    };
  }

  function checkoutPage() {
    document.getElementById("footer").innerHTML = footerHTML();
    if (!S.cart.length) {
      go("/cart");
      return;
    }
    app.innerHTML =
      '<section class="page wrap"><p class="crumb"><a data-route href="/cart">Your bag</a> / Review</p><p class="eyebrow">BRING YOUR SHORTLIST</p><h1>A good place to start.</h1><p class="page-intro">Save this selection and take it to the clinic. An optician will confirm the frames, prescription, fit and complete price before you place an order.</p><div class="grid2"><div class="card">' +
      S.cart
        .map(function (c) {
          var f = frameById(c.frameId);
          return (
            '<div class="srow"><span>' +
            f.name +
            " · " +
            colorById(c.colorId).name +
            "<br><small>" +
            lensById(c.lensId).name +
            " · quantity " +
            c.qty +
            "</small></span><b>" +
            rupee((f.price + lensById(c.lensId).price) * c.qty) +
            "</b></div>"
          );
        })
        .join("") +
      '<div class="srow total"><span>Indicative total</span><b>' +
      rupee(cartTotal()) +
      '</b></div><button class="btn solid wide" id="saveDraft">Save my shopping list</button><p class="catalog-note">Saved only on this device. No payment is taken and no order is sent.</p></div><aside class="card"><h3>The next step is a conversation.</h3><p>Contact SKIDS to arrange your visit and confirm current availability.</p><a class="btn ghost" href="https://skids.clinic/contact">Contact the clinic ↗</a></aside></div></section>';
    $("#saveDraft").onclick = function () {
      S.orders.unshift({
        id: "LIST-" + Date.now().toString(36).toUpperCase(),
        items: JSON.parse(JSON.stringify(S.cart)),
        placed: new Date().toISOString().slice(0, 10),
        total: cartTotal(),
      });
      save();
      go("/orders");
    };
  }
  function ordersPage() {
    document.getElementById("footer").innerHTML = footerHTML();
    app.innerHTML =
      '<section class="page wrap"><p class="eyebrow">SAVED ON THIS DEVICE</p><h1>Your shopping lists.</h1><p class="page-intro">These are saved selections, not placed orders. Contact the clinic to check availability, final prices or an existing order.</p>' +
      S.orders
        .map(function (o) {
          return (
            '<article class="card shopping-list"><div class="section-heading"><h3>' +
            esc(o.id) +
            "</h3><span>" +
            esc(o.placed) +
            "</span></div>" +
            o.items
              .map(function (c) {
                return (
                  "<p>" +
                  esc(frameById(c.frameId).name) +
                  " · " +
                  esc(colorById(c.colorId).name) +
                  " · " +
                  esc(lensById(c.lensId).name) +
                  " × " +
                  c.qty +
                  "</p>"
                );
              })
              .join("") +
            "<b>Indicative total " +
            rupee(o.total) +
            "</b></article>"
          );
        })
        .join("") +
      (!S.orders.length
        ? '<div class="empty">No lists saved yet. Choose a few frames to get started.</div>'
        : "") +
      '<a class="btn solid" data-route href="/frames">Explore frames</a> <a class="text-link" href="https://skids.clinic/contact">Ask about an order ↗</a></section>';
  }
  function apptPage() {
    document.getElementById("footer").innerHTML = footerHTML();
    var reason = new URLSearchParams(location.search).get("reason");
    app.innerHTML =
      '<section class="page wrap"><p class="crumb"><a data-route href="/">Home</a> / Visit the clinic</p><p class="eyebrow">WE’LL START WHERE YOU ARE</p><h1>Let’s take the next step together.</h1><p class="page-intro">A first pair, a school report, or time for a review. Make a note of what you’d like help with, then contact SKIDS to arrange a visit.</p><div class="grid2"><form class="card" id="visitForm"><h3>Plan your visit</h3><div class="field"><label for="visitReason">What brings you here?</label><select class="in" id="visitReason"><option value="screening">Understanding a school screening report</option><option value="first">A first vision check</option><option value="fitting">Frame fitting or adjustments</option><option value="lenses">Choosing lenses or reviewing myopia</option></select></div><div class="field"><label for="visitDate">Preferred day</label><input type="date" class="in" id="visitDate" required min="' +
      new Date().toLocaleDateString("en-CA") +
      '"></div><button class="btn solid" type="submit">Save my visit plan</button><p class="catalog-note">This saves a reminder on your device. It doesn’t reserve an appointment.</p><p id="visitStatus" role="status"></p></form><aside class="card"><p class="eyebrow">SKIDS VISION CLINIC</p><h3>A real person for your questions.</h3><p>Contact the clinic to confirm the location, available times and consultation fee.</p><a class="btn solid" href="https://skids.clinic/contact">Contact SKIDS ↗</a><h3 class="bring-heading">A few things to bring</h3><ul class="bring-list"><li>The school screening report, if you have one.</li><li>The latest prescription and current glasses.</li><li>Your frame shortlist and any questions.</li></ul></aside></div></section>';
    if (reason === "screening" || reason === "lenses")
      $("#visitReason").value = reason;
    else $("#visitReason").value = "first";
    $("#visitForm").onsubmit = function (e) {
      e.preventDefault();
      var date = $("#visitDate").value;
      if (date < new Date().toLocaleDateString("en-CA")) {
        toast("Choose today or a future date.");
        return;
      }
      S.appointments.push({
        date: date,
        reason: $("#visitReason option:checked").textContent,
      });
      save();
      $("#visitStatus").textContent =
        "Plan saved. Contact SKIDS to confirm an appointment; this date is not reserved.";
    };
  }
  function accountPage() {
    document.getElementById("footer").innerHTML = footerHTML();
    app.innerHTML =
      '<section class="page wrap"><p class="eyebrow">YOUR LITTLE CORNER</p><h1>A few things worth keeping.</h1><p class="page-intro">Your saved frames, shopping lists and visit plans, on this device. Clinical records and online accounts are not connected yet.</p><div class="grid2"><article class="card"><h3>' +
      S.wishlist.length +
      ' saved favourites</h3><p>Keep the ones you both like in one place.</p><a class="text-link" data-route href="/frames?saved=1">See saved frames →</a></article><article class="card"><h3>' +
      S.orders.length +
      ' shopping lists</h3><p>Selections to discuss with your optician.</p><a class="text-link" data-route href="/orders">See shopping lists →</a></article></div><h2 class="plans-heading">Your visit plans</h2>' +
      S.appointments
        .map(function (a) {
          return (
            '<article class="card shopping-list"><h3>' +
            esc(a.date) +
            "</h3><p>" +
            esc(a.reason) +
            "</p><small>Not booked. Contact the clinic to arrange your appointment.</small></article>"
          );
        })
        .join("") +
      (!S.appointments.length ? "<p>No visit plans saved yet.</p>" : "") +
      '<a class="text-link" data-route href="/appointment">Plan a visit →</a></section>';
  }

  /* ---------- BOOT ---------- */
  render();
})();
