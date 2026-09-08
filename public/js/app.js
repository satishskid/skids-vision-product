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
        ["/#care", "Why SKIDS"],
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
    app.innerHTML = `<header class="editorial-hero"><div class="hero-copy"><p class="eyebrow">EVERY KID IS SMART. EVERY KID IS SUPER.</p><h1>Big dreams.<br><em>In clear sight.</em></h1><p>A scientist. A doctor. A goal-scorer. Whoever they dream of becoming, we’re here for the eyes that help them discover the way.</p><div class="hero-actions"><a class="btn solid" href="#personalities">Find their kind of frame <span>↓</span></a><a class="text-link" href="#care">Why SKIDS Vision →</a></div><div class="hero-foot"><span class="tiny-glasses">${frameSvg(FRAMES[2], "#294c3c", 65)}</span><span>Their potential is already there.<br><b>Let’s care for what comes next.</b></span></div></div><figure class="hero-photo"><img src="/assets/campaign.webp" alt="Campaign portrait of a smiling child wearing round orange glasses" fetchpriority="high" width="1536" height="1024"><figcaption>A little colour. A lot of personality.</figcaption><span class="photo-stamp">LET<br>KIDS<br>BE KIDS.</span></figure></header>
 <section class="entry-strip wrap" aria-label="Where would you like to start?"><a data-route href="/appointment?reason=screening"><span>01</span><div><b>A note came home from school?</b><small>Let’s make sense of the screening.</small></div><i>↗</i></a><a data-route href="/frames"><span>02</span><div><b>Ready for a new pair?</b><small>Find a look that feels like them.</small></div><i>↗</i></a><a data-route href="/appointment"><span>03</span><div><b>Just want their eyes checked?</b><small>A good place to start.</small></div><i>↗</i></a></section>
 <section class="belief-strip wrap"><p class="eyebrow">THE SKIDS BELIEF</p><h2>Smart. Super.<br><em>Already.</em></h2><p>They bring the imagination. The courage. The thousand questions. We bring children’s eye care, thoughtfully chosen lenses and a pair that feels like them. So they can get on with being themselves.</p></section>
 ${personaCarouselHTML()}
 <section class="collection-section wrap"><div class="section-heading"><div><p class="eyebrow">KEEP EXPLORING</p><h2>Different days. Different sides of them.</h2></div><a class="text-link" data-route href="/frames">Explore all frames ↗</a></div><div class="age-links"><span>Find their starting size</span><a data-route href="/frames?age=4-7">Little ones <b>4–7</b> ↗</a><a data-route href="/frames?age=8-11">Growing explorers <b>8–11</b> ↗</a><a data-route href="/frames?age=12-14">Finding their own <b>12–14</b> ↗</a></div><div class="home-products">${[FRAMES[2], FRAMES[0], FRAMES[1], FRAMES[7]].map(productCard).join("")}</div><p class="catalog-note">A first look at our collection. Illustrative frames and indicative prices; final fit, availability and lens cost are confirmed with the clinic.</p></section>
 <section class="try-banner mobile-try-banner wrap"><div class="mobile-preview">${phonePreviewHTML(PERSONAS[0])}<span class="preview-caption">A little “that’s me!” moment.</span></div><div class="try-copy"><p class="eyebrow">THEIR STYLE. YOUR PHONE.</p><h2>Let them see<br>themselves in it.</h2><p>Explore the frame. Compare a lens finish. Find a favourite together. Then let your optician check the fit behind the look.</p><a class="btn solid" data-route href="/try-on">Explore the try-on experience ↗</a><small>Sample looks available now. Personal photo try-on is being connected.</small></div></section>
 ${visionStoryHTML()}
 ${careTeamHTML()}
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
     "Explore sample looks and lens finishes in SKIDS Virtual Try-on. Personal photo try-on is being connected with our partner. An optician still needs to confirm the final fit.",
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
   )}</div></section><section class="closing-note"><p>For the child they are. And everyone they might become.</p><h2>Their future deserves a clear start.</h2><a class="btn solid" data-route href="/frames">Find their pair ↗</a></section>`;
    wireProductCards(app);
    wirePersonaCarousel();
    wireVisionStory();
  }
  function personaCarouselHTML() {
    return (
      '<section class="persona-section wrap" id="personalities" aria-roledescription="carousel" aria-label="Eyewear for their kind of curious"><div class="section-heading"><div><p class="eyebrow">LET KIDS BE ALL KINDS OF KIDS.</p><h2>Who will they be today?</h2></div><p>You see who they are. And who they could become.<br>Let their personality lead the way.</p></div><div class="persona-tabs" role="tablist" aria-label="Explore their interests">' +
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
      $("#persona-count").textContent =
        String(index + 1).padStart(2, "0") +
        " / " +
        String(PERSONAS.length).padStart(2, "0");
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

  var VISION_STEPS = [
    {
      id: "eyes",
      label: "The eyes",
      kicker: "01 / THE REMARKABLE STARTING POINT",
      title: "A little light.\nAn extraordinary journey.",
      body: "Light passes through the cornea and pupil. The eye’s own lens helps focus it on the retina. The retina turns light into signals; the optic nerve carries them to the brain.",
      detail:
        "Seeing is a whole system working together. A vision examination helps understand how your child’s system is doing.",
      foot: "Simplified anatomy. Illustration only.",
      link: "https://www.nei.nih.gov/learn-about-eye-health/healthy-vision/how-eyes-work",
      linkLabel: "How eyes work · National Eye Institute ↗",
    },
    {
      id: "lenses",
      label: "The lenses",
      kicker: "02 / DESIGNED AROUND THEIR PRESCRIPTION",
      title: "Small details.\nA very personal lens.",
      body: "The prescription shapes how a lens bends light. Material affects its weight and thickness. Surface coatings and optional tints add other practical choices.",
      detail:
        "Clear, photochromic and myopia-management lenses do different jobs. The right discussion starts with an examination, not a personality type.",
      foot: "Design considerations shown separately; not a literal stack of lens layers.",
      link: "/appointment?reason=lenses",
      linkLabel: "Talk through the lens options →",
    },
    {
      id: "fit",
      label: "The fit",
      kicker: "03 / WHERE OPTICS MEETS A GROWING FACE",
      title: "A great look.\nThe right place to look through.",
      body: "The bridge, temples and frame size affect how a pair sits. Pupillary distance and fitting height help place the lenses in relation to the eyes.",
      detail:
        "Virtual try-on helps explore a look. Optical measurements and an optician’s check help turn that choice into a properly fitted pair.",
      foot: "Illustrated fitting positions. No measurement is taken from this diagram.",
      link: "/try-on",
      linkLabel: "Explore the mobile experience →",
    },
    {
      id: "life",
      label: "Their world",
      kicker: "04 / BACK TO THE IMPORTANT STUFF",
      title: "The board. The book.\nThe next big idea.",
      body: "The point of all those little details is everyday life: spotting a detail, following a lesson, finding a new interest. Their ambitions belong to them.",
      detail:
        "SKIDS brings the eye examination, lens discussion and continuing care into the same conversation—so parents have a clearer next step as children grow.",
      foot: "Care is individual. Glasses are one part of supporting a child’s vision.",
      link: "/appointment",
      linkLabel: "Start their vision-care journey →",
    },
  ];
  function visionArtwork(id) {
    if (id === "life")
      return '<div class="vision-life-grid"><figure><img src="/assets/persona-scientist.webp" alt="A child investigating a leaf" loading="lazy"><figcaption>The next discovery.</figcaption></figure><figure><img src="/assets/persona-doctor.webp" alt="A child playing doctor with a teddy" loading="lazy"><figcaption>The person they might become.</figcaption></figure></div>';
    var start =
      '<svg class="vision-diagram" viewBox="0 0 620 420" role="img" aria-label="' +
      {
        eyes: "Simplified light path through the cornea and lens to the retina and optic nerve",
        lenses:
          "Lens shape, material and surface coating shown as three separate design considerations",
        fit: "Illustrative glasses with pupillary distance and fitting-height guides",
      }[id] +
      '">';
    if (id === "eyes")
      return (
        start +
        '<defs><radialGradient id="eye-fill"><stop stop-color="#9ebd9c" stop-opacity=".15"/><stop offset="1" stop-color="#9ebd9c" stop-opacity=".025"/></radialGradient></defs><ellipse cx="370" cy="211" rx="150" ry="119" fill="url(#eye-fill)" stroke="#7c9986" stroke-width="2"/><path d="M240 144 Q185 211 240 278" fill="#93c4b7" fill-opacity=".09" stroke="#b8d5c4" stroke-width="2"/><path d="M493 142 Q545 211 493 280" fill="none" stroke="#e5b762" stroke-width="5"/><path d="M243 155v25 M243 242v25" stroke="#9fcbb4" stroke-width="7"/><ellipse cx="274" cy="211" rx="17" ry="48" fill="#cfe1ce" fill-opacity=".16" stroke="#cfe1ce" stroke-width="2"/><g fill="none" stroke="#e5b762" stroke-width="1.6"><path d="M32 115 L215 174 L274 188 L509 211"/><path d="M32 211 H509"/><path d="M32 307 L215 249 L274 234 L509 211"/></g><circle cx="509" cy="211" r="5" fill="#f5ca77"/><path d="M521 201 Q557 203 577 178 M521 219 Q557 227 588 200" fill="none" stroke="#a3bfa5" stroke-width="5"/><g fill="#dce7d8" font-family="Arial,sans-serif" font-size="12"><text x="35" y="89">LIGHT</text><text x="140" y="122">Cornea</text><text x="190" y="321">Pupil</text><text x="276" y="304">Eye’s lens</text><text x="452" y="89">Retina</text><text x="491" y="319">Optic nerve</text><text x="440" y="357" fill="#8da493">Signals travel to the brain →</text></g><g stroke="#6b8574" fill="none"><path d="M181 126l33 32 M218 305l25-66 M292 286l-9-35 M478 97l23 47 M527 302l34-87"/></g></svg>'
      );
    if (id === "lenses")
      return (
        start +
        '<g transform="translate(0 0)"><ellipse cx="214" cy="140" rx="108" ry="66" transform="rotate(-27 214 140)" fill="#a9c8b0" fill-opacity=".17" stroke="#bad3bd" stroke-width="2"/><ellipse cx="306" cy="215" rx="108" ry="66" transform="rotate(-27 306 215)" fill="#d4e4ce" fill-opacity=".12" stroke="#a7c5b7" stroke-width="2"/><ellipse cx="398" cy="290" rx="108" ry="66" transform="rotate(-27 398 290)" fill="#b3a060" fill-opacity=".13" stroke="#ddbb76" stroke-width="2"/><path d="M137 113Q202 61 265 93 M230 187Q295 135 358 167 M322 263Q387 211 450 243" fill="none" stroke="#ecf2df" stroke-opacity=".5"/><g stroke="#719080" stroke-dasharray="3 5"><path d="M118 187l181 152 M312 83l181 150"/></g><g fill="#e4eddf" font-family="Arial,sans-serif" font-size="13"><text x="327" y="82">01  Prescription &amp; shape</text><text x="415" y="187">02  Lens material</text><text x="111" y="357">03  Surface coating &amp; finish</text></g><g stroke="#719080" fill="none"><path d="M326 86l-28 20 M417 192l-27 17 M289 351l45-29"/></g></g></svg>'
      );
    return (
      start +
      '<g transform="translate(115 118) scale(1.3)">' +
      frameSvg(FRAMES[1], "#c1d2bc", 300)
        .replace(/<svg[^>]*>/, "<g>")
        .replace("</svg>", "</g>") +
      '</g><g fill="#efcb80"><circle cx="230" cy="217" r="4"/><circle cx="391" cy="217" r="4"/></g><g stroke="#8cac99" stroke-dasharray="4 5"><path d="M230 123v137 M391 123v137"/></g><g stroke="#efcb80" fill="none"><path d="M230 126h161 M230 119v14 M391 119v14 M426 217v50 M419 217h14 M419 267h14"/></g><g fill="#dce7d8" font-family="Arial,sans-serif" font-size="13"><text x="241" y="102">Pupillary distance</text><text x="446" y="241">Fitting height</text><text x="215" y="325">A frame that sits where it should.</text><text x="205" y="352" font-size="11" fill="#8da493">Bridge · temples · size · lens position</text></g></svg>'
    );
  }
  function visionStoryHTML() {
    return (
      '<section class="vision-story" id="care"><div class="wrap"><div class="vision-story-heading"><p class="eyebrow">WHY SKIDS VISION IS SPECIAL</p><h2>Behind one clear moment.<br><em>A whole world of care.</em></h2><p>Vision is intricate. Caring for it should feel connected.<br> Take a closer look, from the first ray of light to their everyday world.</p></div><div class="vision-step-tabs" role="tablist" aria-label="Explore the vision system">' +
      VISION_STEPS.map(function (v, i) {
        return (
          '<button type="button" role="tab" id="vision-tab-' +
          v.id +
          '" aria-controls="vision-panel" aria-selected="' +
          (i === 0) +
          '" tabindex="' +
          (i === 0 ? 0 : -1) +
          '" data-vision-step="' +
          i +
          '"><small>0' +
          (i + 1) +
          "</small>" +
          v.label +
          "</button>"
        );
      }).join("") +
      '</div><div id="vision-panel" role="tabpanel" aria-labelledby="vision-tab-eyes" tabindex="0"></div></div></section>'
    );
  }
  function wireVisionStory() {
    var tabs = $$("[data-vision-step]", app),
      panel = $("#vision-panel"),
      index = 0;
    function show(i, focus) {
      index = (i + VISION_STEPS.length) % VISION_STEPS.length;
      var v = VISION_STEPS[index];
      tabs.forEach(function (t, j) {
        t.setAttribute("aria-selected", String(j === index));
        t.tabIndex = j === index ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", "vision-tab-" + v.id);
      panel.innerHTML =
        '<div class="vision-step"><div class="vision-artwork">' +
        visionArtwork(v.id) +
        "<p>" +
        v.foot +
        '</p></div><div class="vision-explanation"><p class="eyebrow">' +
        v.kicker +
        "</p><h3>" +
        v.title.split("\n").map(esc).join("<br>") +
        "</h3><p>" +
        v.body +
        '</p><p class="vision-takeaway">' +
        v.detail +
        '</p><a class="text-link" ' +
        (v.link.startsWith("/")
          ? "data-route"
          : 'target="_blank" rel="noopener"') +
        ' href="' +
        v.link +
        '">' +
        v.linkLabel +
        '</a><button class="vision-next" id="vision-next" type="button">' +
        (index === 3
          ? "Back to the eyes ↺"
          : "Next: " + VISION_STEPS[index + 1].label + " →") +
        "</button></div></div>";
      $("#vision-next").onclick = function () {
        show(index + 1, false);
      };
      if (focus) tabs[index].focus({ preventScroll: true });
    }
    tabs.forEach(function (t, i) {
      t.onclick = function () {
        show(i, false);
      };
      t.onkeydown = function (e) {
        var n;
        if (e.key === "ArrowRight") n = index + 1;
        else if (e.key === "ArrowLeft") n = index - 1;
        else if (e.key === "Home") n = 0;
        else if (e.key === "End") n = 3;
        else return;
        e.preventDefault();
        show(n, true);
      };
    });
    show(0, false);
  }
  function careTeamHTML() {
    return '<section class="whole-child-care wrap"><div class="section-heading"><div><p class="eyebrow">THE TEAM BEHIND THEIR TOMORROW</p><h2>Three kinds of expertise.<br>One child at the centre.</h2></div><p>A growing child deserves a care plan<br>that can grow with them.</p></div><div class="care-team-orbit" aria-hidden="true"><span>PEDIATRICIAN</span><i></i><b>YOUR<br>CHILD</b><i></i><span>EYE CARE TEAM</span></div><div class="care-team-grid"><article><span class="care-role-number">01</span><h3>The pediatrician.</h3><h4>Sees the whole child.</h4><p>Brings the child’s growth, everyday routines and parent observations into the care plan, and coordinates the next steps.</p></article><article><span class="care-role-number">02</span><h3>The optometrist.</h3><h4>Gets into the optical detail.</h4><p>Checks refraction, discusses lenses and helps with dispensing and fit. The practical detail behind a comfortable pair.</p></article><article><span class="care-role-number">03</span><h3>The ophthalmologist.</h3><h4>Brings specialist eye care.</h4><p>Our pediatric ophthalmology partner is involved when findings need specialist assessment or treatment, with the child’s history in context.</p></article></div><div class="care-continuity"><div><p class="eyebrow">AND THE PART THAT KEEPS GOING</p><h3>Care doesn’t finish at “nice glasses.”</h3><p>Review the vision. Recheck the fit. Revisit the plan as they grow. The SKIDS clinic coordinates the follow-up your child needs.</p></div><a class="btn solid" data-route href="/appointment">Start with the care team ↗</a></div><a class="care-source" href="https://www.skids.clinic/clinics/vision/" target="_blank" rel="noopener">Explore the SKIDS Vision Clinic care model ↗</a></section>';
  }
  function phonePreviewHTML(p) {
    return (
      '<div class="try-phone"><div class="phone-top"><b>skids. <span>vision</span></b><small>STYLE PREVIEW</small></div><div class="phone-photo"><img src="' +
      p.image +
      '" alt="' +
      p.alt +
      '" loading="lazy"><span class="phone-sample-label">Sample look</span></div><div class="phone-caption"><b>' +
      frameById(p.frame).name +
      "</b><span>" +
      colorById(p.colour).name +
      '</span></div><div class="phone-home-bar"></div></div>'
    );
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
    var selected =
      frameById(new URLSearchParams(location.search).get("frame")) || FRAMES[2];
    var persona =
      PERSONAS.find(function (p) {
        return p.frame === selected.id;
      }) || null;
    app.innerHTML =
      '<section class="page wrap mobile-showroom"><p class="crumb"><a data-route href="/frames">Frames</a> / SKIDS Virtual Try-on</p><div class="showroom-heading"><p class="eyebrow">A LITTLE “THAT’S ME!” MOMENT</p><h1>Their next pair.<br>In their own style.</h1><p>Explore a look together. Get to know the lenses. Then let an optician help with the fit behind the favourite.</p></div><div class="showroom-grid"><div class="showroom-device"><div id="samplePhone"></div><p>Campaign portrait · style inspiration</p></div><div class="showroom-options"><p class="eyebrow">01 / CHOOSE A SAMPLE LOOK</p><h2>Which one feels like them?</h2><div class="sample-looks">' +
      PERSONAS.map(function (p) {
        return (
          '<button type="button" data-sample="' +
          p.id +
          '" aria-pressed="false" aria-label="Preview ' +
          p.label.toLowerCase() +
          ' look"><img src="' +
          p.image +
          '" alt="" loading="lazy"><span>' +
          p.label.replace("The ", "") +
          "</span></button>"
        );
      }).join("") +
      '</div><div class="lens-explorer"><p class="eyebrow">02 / LOOK AT THE LENS FINISH</p><div class="lens-explorer-body"><div class="lens-swatch-demo" id="lensSwatch" data-finish="clear" role="img" aria-label="Illustrative clear lens finish"><svg viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="65" fill="#d8e6e3"/><path d="M0 105L48 45l33 40 25-22 40 45v38H0Z" fill="#94b7a2"/><path d="M0 115l43-37 44 41 22-24 31 31v14H0Z" fill="#476955"/><circle cx="105" cy="35" r="12" fill="#f6da9d"/></svg><i></i></div><div><div class="finish-buttons" aria-label="Illustrative lens finish"><button id="finishClear" type="button" aria-pressed="true">Clear</button><button id="finishTint" type="button" aria-pressed="false">Outdoor tint</button></div><h3 id="finishTitle">Everyday, clear.</h3><p id="finishDescription">Start with the prescription. Discuss the lens material and coatings with your optician.</p></div></div><small>Illustrative tint only. Not a simulation of vision, UV protection or photochromic performance.</small></div><div class="showroom-next"><p class="eyebrow">03 / KEEP A FAVOURITE. CHECK THE FIT.</p><button class="btn solid" id="saveTry">Save this look</button><a class="text-link" data-route id="sampleProduct" href="/frames/' +
      selected.id +
      '">Explore this frame →</a><p id="sampleSaved" role="status"></p></div><div class="showroom-status"><b>Personal photo try-on is being connected.</b><p>Our mobile experience is in setup. These sample looks are available now; your own-photo try-on and optical measurements will follow through the clinic.</p><a class="text-link" data-route href="/appointment">Arrange a fitting with SKIDS →</a></div></div></div></section>';
    function refresh() {
      $("#samplePhone").innerHTML = persona
        ? phonePreviewHTML(persona)
        : '<div class="try-phone"><div class="phone-top"><b>skids. <span>vision</span></b><small>FRAME ILLUSTRATION</small></div><div class="phone-frame-only">' +
          frameSvg(selected, colorById(selected.colors[0]).hex, 240) +
          '<p>No sample portrait for this frame yet.</p></div><div class="phone-caption"><b>' +
          selected.name +
          "</b><span>" +
          selected.age +
          "</span></div></div>";
      $$("[data-sample]", app).forEach(function (b) {
        b.setAttribute(
          "aria-pressed",
          String(persona && b.dataset.sample === persona.id),
        );
      });
      $("#sampleProduct").href =
        "/frames/" +
        selected.id +
        (persona ? "?colour=" + persona.colour + "&persona=" + persona.id : "");
      $("#saveTry").textContent = "Save " + selected.name + " to favourites";
      $("#sampleSaved").textContent = "";
    }
    $$("[data-sample]", app).forEach(function (b) {
      b.onclick = function () {
        persona = PERSONAS.find(function (p) {
          return p.id === b.dataset.sample;
        });
        selected = frameById(persona.frame);
        refresh();
      };
    });
    function finish(tinted) {
      $("#finishClear").setAttribute("aria-pressed", String(!tinted));
      $("#finishTint").setAttribute("aria-pressed", String(tinted));
      $("#lensSwatch").dataset.finish = tinted ? "tint" : "clear";
      $("#lensSwatch").setAttribute(
        "aria-label",
        tinted
          ? "Illustrative outdoor lens tint"
          : "Illustrative clear lens finish",
      );
      $("#finishTitle").textContent = tinted
        ? "For the changing light."
        : "Everyday, clear.";
      $("#finishDescription").textContent = tinted
        ? "Ask about photochromic or sun-lens options. The actual tint and how it changes depend on the chosen lens and conditions."
        : "Start with the prescription. Discuss the lens material and coatings with your optician.";
    }
    $("#finishClear").onclick = function () {
      finish(false);
    };
    $("#finishTint").onclick = function () {
      finish(true);
    };
    $("#saveTry").onclick = function () {
      if (!S.wishlist.includes(selected.id)) {
        S.wishlist.push(selected.id);
        save();
      }
      $("#sampleSaved").textContent =
        selected.name + " saved to your favourites.";
      toast(selected.name + " saved to favourites");
    };
    refresh();
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
