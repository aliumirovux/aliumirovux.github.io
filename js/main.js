/*! Ali Umirov — Portfolio | main.js
 *  i18n (EN/RU/UZ), pill nav & scroll-spy, auto experience durations,
 *  case-study modals, recommendations, and small UI enhancements. */

(function() {
  var docEl = document.documentElement;

  /* ---- i18n (UZ default in DOM, swap to EN) ---- */
  var lang = "uz";
  var nodes = document.querySelectorAll("[data-en]");
  nodes.forEach(function(el) {
    el.setAttribute("data-uz", el.textContent);
  });
  var langBtns = document.querySelectorAll(".langseg-btn");
  /* ---- total experience (auto): from earliest job start to now ---- */
  function totalExpYears() {
    var starts = [];
    document.querySelectorAll(".rdate[data-s]").forEach(function(el) {
      starts.push(el.getAttribute("data-s"));
    });
    if (!starts.length) return "3.5";
    starts.sort();
    var sp = starts[0].split("-"),
      sy = +sp[0],
      sm = +sp[1];
    var d = new Date(),
      months = (d.getFullYear() - sy) * 12 + (d.getMonth() + 1 - sm);
    if (months < 0) months = 0;
    var yrs = Math.round((months / 12) * 2) / 2; /* nearest 0.5 */
    return String(yrs);
  }

  function fillYears() {
    var num = totalExpYears();
    var loc = (docEl.lang === "en") ? num : num.replace(".", ","); /* ru/uz use comma */
    document.querySelectorAll(".yexp").forEach(function(el) {
      el.textContent = el.textContent.replace(/\{Y\}/g, loc);
    });
  }

  function setLang(l) {
    lang = l;
    docEl.lang = l;
    nodes.forEach(function(el) {
      var t = el.getAttribute("data-" + l);
      if (t !== null) el.textContent = t;
    });
    fillYears();
    langBtns.forEach(function(b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === l);
    });
  }
  langBtns.forEach(function(b) {
    b.addEventListener("click", function(e) {
      setLang(b.getAttribute("data-lang"));
      segSlide();
      if (e.detail) b.blur();
    });
  });
  setLang("en");

  /* ---- lang switcher: sliding selection chip ---- */
  var seg = document.getElementById("lang"),
    segInd = null,
    segRaf = 0,
    segUntil = 0,
    segSlideUntil = 0;

  function segPlace(slide) {
    if (!seg || !segInd) return;
    var a = seg.querySelector(".langseg-btn.active");
    if (!a) return;
    var sr = seg.getBoundingClientRect(),
      r = a.getBoundingClientRect();
    if (sr.width === 0) return;
    if (!slide) {
      segInd.style.transition = "none";
    }
    segInd.style.top = (r.top - sr.top) + "px";
    segInd.style.height = r.height + "px";
    segInd.style.width = r.width + "px";
    segInd.style.transform = "translateX(" + (r.left - sr.left) + "px)";
    if (!slide) {
      void segInd.offsetWidth;
      segInd.style.transition = "";
    }
  }

  function segFollow(ms) {
    segUntil = performance.now() + ms;
    if (segRaf) return;
    (function loop() {
      if (performance.now() >= segSlideUntil) segPlace(false);
      if (performance.now() < segUntil) {
        segRaf = requestAnimationFrame(loop);
      } else {
        segRaf = 0;
      }
    })();
  }

  function segSlide() {
    segSlideUntil = performance.now() + 460;
    segPlace(true);
  }
  if (seg) {
    segInd = document.createElement("span");
    segInd.className = "langseg-ind";
    segInd.setAttribute("aria-hidden", "true");
    seg.insertBefore(segInd, seg.firstChild);
    seg.addEventListener("mouseenter", function() {
      segFollow(800);
    });
    seg.addEventListener("mouseleave", function() {
      segFollow(1000);
    });
    seg.addEventListener("focusin", function() {
      segFollow(800);
    });
    seg.addEventListener("focusout", function() {
      segFollow(1000);
    });
    window.addEventListener("resize", function() {
      segPlace(false);
    }, {
      passive: true
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function() {
        segPlace(false);
      });
    }
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        segPlace(false);
      });
    });
  }

  /* ---- job duration (auto) ---- */
  function renderDur() {
    var l = docEl.lang || "en";
    var U = {
      uz: ["yil", "oy"],
      ru: ["г", "мес"],
      en: ["yr", "mo"]
    } [l] || ["yr", "mo"];
    document.querySelectorAll(".rdate[data-s]").forEach(function(el) {
      var sp = el.getAttribute("data-s").split("-"),
        sy = +sp[0],
        sm = +sp[1];
      var e = el.getAttribute("data-e"),
        ey, em;
      if (e === "present") {
        var d = new Date();
        ey = d.getFullYear();
        em = d.getMonth() + 1;
      } else {
        var ep = e.split("-");
        ey = +ep[0];
        em = +ep[1];
      }
      var months = (ey - sy) * 12 + (em - sm);
      if (months < 1) months = 1;
      var y = Math.floor(months / 12),
        m = months % 12,
        parts = [];
      if (y > 0) parts.push(y + " " + U[0]);
      if (m > 0) parts.push(m + " " + U[1]);
      if (!parts.length) parts.push("1 " + U[1]);
      var old = el.querySelector(".rdur");
      if (old) old.remove();
      var span = document.createElement("span");
      span.className = "rdur";
      span.textContent = "· " + parts.join(" ");
      el.appendChild(span);
    });
  }
  renderDur();
  langBtns.forEach(function(b) {
    b.addEventListener("click", renderDur);
  });

  /* ---- theme (locked dark) ---- */
  docEl.setAttribute("data-theme", "dark");

  /* ---- mobile menu ---- */
  var burger = document.getElementById("burger"),
    overlay = document.getElementById("overlay");
  var menuScrollY = 0;

  function openMenu() {
    menuScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.classList.add("menu-open");
    document.body.style.top = (-menuScrollY) + "px";
    document.body.classList.add("scroll-lock");
  }

  function closeMenu() {
    if (!document.body.classList.contains("menu-open")) return;
    document.body.classList.remove("menu-open");
    document.body.classList.remove("scroll-lock");
    document.body.style.top = "";
    var pb = docEl.style.scrollBehavior;
    docEl.style.scrollBehavior = "auto";
    window.scrollTo(0, menuScrollY);
    docEl.style.scrollBehavior = pb;
  }
  burger.addEventListener("click", function() {
    if (document.body.classList.contains("menu-open")) closeMenu();
    else openMenu();
  });
  overlay.querySelectorAll("a").forEach(function(a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---- pill nav: active pill + hover pill + scroll-spy ---- */
  (function() {
    var navEl = document.getElementById("pillnav");
    if (!navEl) return;
    var indA = navEl.querySelector(".pill-ind-active");
    var indH = navEl.querySelector(".pill-ind-hover");
    var items = Array.prototype.slice.call(navEl.querySelectorAll(".pill-item"));
    if (!indA || !indH || !items.length) return;
    var activeItem = items[0],
      hoverItem = null,
      raf = 0;
    var spyLocked = false,
      spySettle = 0,
      spySafety = 0;

    function lockSpy() {
      spyLocked = true;
      clearTimeout(spySettle);
      clearTimeout(spySafety);
      spySafety = setTimeout(unlockSpy, 1800);
    }

    function unlockSpy() {
      spyLocked = false;
      clearTimeout(spySettle);
      clearTimeout(spySafety);
    }

    function visible() {
      return navEl.offsetParent !== null && navEl.getClientRects().length > 0;
    }

    function place(ind, item, slide) {
      if (!item || !visible()) return;
      var nr = navEl.getBoundingClientRect(),
        r = item.getBoundingClientRect();
      if (!slide) {
        ind.style.transition = "none";
      }
      ind.style.width = r.width + "px";
      ind.style.transform = "translateX(" + (r.left - nr.left) + "px)";
      if (!slide) {
        void ind.offsetWidth;
        ind.style.transition = "";
      }
    }

    items.forEach(function(it) {
      it.addEventListener("mouseenter", function() {
        hoverItem = it;
        if (it === activeItem) {
          indH.classList.remove("on");
          return;
        }
        place(indH, it, indH.classList.contains("on"));
        indH.classList.add("on");
      });
      it.addEventListener("click", function() {
        setActive(it);
        lockSpy();
      });
    });
    navEl.addEventListener("mouseleave", function() {
      hoverItem = null;
      indH.classList.remove("on");
    });

    function setActive(item) {
      if (!item || item === activeItem) return;
      activeItem.classList.remove("active");
      activeItem = item;
      item.classList.add("active");
      place(indA, item, indA.classList.contains("on"));
      indA.classList.add("on");
      if (hoverItem === item) indH.classList.remove("on");
    }

    var map = {};
    items.forEach(function(it) {
      var id = (it.getAttribute("href") || "").replace("#", "");
      if (id) map[id] = it;
    });
    if (map["top"] && !map["about"]) map["about"] = map["top"];
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function(entries) {
        if (spyLocked) return;
        entries.forEach(function(e) {
          if (e.isIntersecting && map[e.target.id]) setActive(map[e.target.id]);
        });
      }, {
        rootMargin: "-50% 0px -45% 0px",
        threshold: 0
      });
      Object.keys(map).forEach(function(id) {
        var s = document.getElementById(id);
        if (s) io.observe(s);
      });
    }

    window.addEventListener("scroll", function() {
      if (spyLocked) {
        clearTimeout(spySettle);
        spySettle = setTimeout(unlockSpy, 140);
        return;
      }
      var sh = document.documentElement.scrollHeight,
        y = window.scrollY || window.pageYOffset || 0;
      if (y < 8) {
        setActive(items[0]);
      } else if (y + window.innerHeight >= sh - 8) {
        setActive(items[items.length - 1]);
      }
    }, {
      passive: true
    });

    document.querySelectorAll(".overlay a, .brand").forEach(function(a) {
      a.addEventListener("click", function() {
        var id = (a.getAttribute("href") || "").replace("#", "");
        if (map[id]) {
          setActive(map[id]);
          lockSpy();
        }
      });
    });

    function schedule() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function() {
        place(indA, activeItem, false);
        indH.classList.remove("on");
      });
    }
    window.addEventListener("resize", schedule, {
      passive: true
    });
    window.addEventListener("load", schedule);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedule);
    }
    langBtns.forEach(function(b) {
      b.addEventListener("click", function() {
        requestAnimationFrame(schedule);
      });
    });

    activeItem.classList.add("active");
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        place(indA, activeItem, false);
        indA.classList.add("on");
      });
    });
  })();

  /* ---- marquee ---- */
  var skills = ["UI/UX Design", "Prototyping", "Design Systems", "User Flow & Journey Mapping", "User Research", "A/B Testing", "Product Design", "Usability Testing", "Product Thinking", "Design QA"];
  var mq = document.getElementById("mq");
  var html = "";
  for (var r = 0; r < 2; r++) {
    skills.forEach(function(s) {
      html += '<span class="it">' + s + '</span>';
    });
  }
  if (mq) {
    mq.innerHTML = html;
  }

  /* ---- tools ---- */
  var tools = [
    ["Figma", "assets/img/tools/figma.png"],
    ["FigJam", "assets/img/tools/figjam.png"],
    ["Miro", "assets/img/tools/miro.png"],
    ["Notion", "assets/img/tools/notion.png"],
    ["Trello", "assets/img/tools/trello.png"],
    ["Asana", "assets/img/tools/asana.png"],
    ["Photoshop", "assets/img/tools/photoshop.png"],
    ["Sketch", "assets/img/tools/sketch.png"],
    ["Hotjar", "assets/img/tools/hotjar.png"],
    ["VS Code", "assets/img/tools/vs-code.png"]
  ];
  var tg = document.getElementById("tools"),
    th = "";
  tools.forEach(function(t) {
    th += '<span class="tool"><img class="ic" src="' + t[1] + '" alt="" loading="lazy" decoding="async">' + t[0] + '</span>';
  });
  tg.innerHTML = th;

  /* ---- reveal on scroll ---- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add("vis");
          io.unobserve(e.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px -12% 0px"
    });
    document.querySelectorAll(".reveal").forEach(function(el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function(el) {
      el.classList.add("vis");
    });
  }

  /* ---- impact sparklines ---- */
  (function() {
    var stats = document.querySelectorAll(".impact .stat");
    if (!stats.length) return;
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function(es) {
        es.forEach(function(e) {
          if (e.isIntersecting) {
            e.target.classList.add("spark-play");
            io.unobserve(e.target);
          }
        });
      }, {
        threshold: .4
      });
      stats.forEach(function(s) {
        io.observe(s);
      });
    } else {
      stats.forEach(function(s) {
        s.classList.add("spark-play");
      });
    }
  })();

  /* ---- impact count-up ---- */
  (function() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var nums = document.querySelectorAll(".impact .stat .n[data-num]");
    if (!nums.length) return;

    function prep(el) {
      var s = el.getAttribute("data-sign") || "",
        f = el.getAttribute("data-suf") || "";
      el.textContent = "";
      if (s) el.appendChild(document.createTextNode(s));
      var t = document.createTextNode("0");
      el.appendChild(t);
      var em = document.createElement("em");
      em.textContent = f;
      el.appendChild(em);
      el.__cnt = t;
      return t;
    }

    function render(el, val) {
      (el.__cnt || prep(el)).data = String(val);
    }

    function run(el) {
      var target = parseInt(el.getAttribute("data-num"), 10) || 0;
      if (reduce) {
        render(el, target);
        return;
      }
      var dur = 1150,
        start = null;

      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        render(el, Math.round(target * e));
        if (p < 1) requestAnimationFrame(step);
        else render(el, target);
      }
      requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window) {
      var io2 = new IntersectionObserver(function(es) {
        es.forEach(function(e) {
          if (e.isIntersecting) {
            run(e.target);
            io2.unobserve(e.target);
          }
        });
      }, {
        threshold: .45
      });
      nums.forEach(function(n) {
        render(n, 0);
        io2.observe(n);
      });
    } else {
      nums.forEach(run);
    }
  })();

  /* ---- case study modals ---- */
  /* ---- back to top ---- */
  (function() {
    var bt = document.querySelector(".to-top");
    if (!bt) return;
    var shown = false,
      raf = 0;

    function check() {
      raf = 0;
      var need = (window.scrollY || window.pageYOffset || 0) > 700;
      if (need !== shown) {
        shown = need;
        bt.classList.toggle("show", need);
      }
    }
    window.addEventListener("scroll", function() {
      if (!raf) raf = requestAnimationFrame(check);
    }, {
      passive: true
    });
    check();
    bt.addEventListener("click", function() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  })();

  /* ---- scroll lock (works on iOS too: position:fixed body) ---- */
  var scrollLockY = 0,
    scrollLocked = false;

  function lockScroll() {
    if (scrollLocked) return;
    scrollLocked = true;
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    var b = document.body.style;
    b.position = "fixed";
    b.top = (-scrollLockY) + "px";
    b.left = "0";
    b.right = "0";
    b.width = "100%";
    b.overflow = "hidden";
  }

  function unlockScroll() {
    if (!scrollLocked) return;
    scrollLocked = false;
    var b = document.body.style;
    b.position = "";
    b.top = "";
    b.left = "";
    b.right = "";
    b.width = "";
    b.overflow = "";
    var html = document.documentElement,
      prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, scrollLockY);
    html.style.scrollBehavior = prev;
  }

  function closeCases() {
    document.querySelectorAll(".case-modal.open").forEach(function(m) {
      m.classList.remove("open");
    });
    unlockScroll();
  }
  document.querySelectorAll("[data-case]").forEach(function(btn) {
    btn.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
    btn.addEventListener("click", function() {
      var m = document.getElementById(btn.getAttribute("data-case"));
      if (m) {
        m.classList.add("open");
        m.scrollTop = 0;
        lockScroll();
      }
    });
  });
  document.querySelectorAll(".case-close,.js-close").forEach(function(b) {
    b.addEventListener("click", closeCases);
  });
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") closeCases();
  });

  /* ---- coverflow modal (skills + tools) ---- */
  function initCoverflow(modalId, anchorList) {
    var modal = document.getElementById(modalId);
    if (!modal || !anchorList || !anchorList.length) return;
    var stage = modal.querySelector(".skill-stage");
    var closeBtn = modal.querySelector(".skill-close");
    var prevBtn = modal.querySelector(".skill-arrow-prev");
    var nextBtn = modal.querySelector(".skill-arrow-next");
    var cards = Array.prototype.slice.call(stage.querySelectorAll(".skill-card"));
    var keys = cards.map(function(c) {
      return c.getAttribute("data-skill");
    });
    var pillByKey = {},
      lastAnchor = null,
      cur = 0,
      zoomTimer = 0;
    var goo = modal.querySelector(".skill-goo"),
      gMain = goo ? goo.querySelector(".goo-main") : null,
      gDrops = goo ? Array.prototype.slice.call(goo.querySelectorAll(".goo-drop")) : [],
      gooTimer = 0,
      meltTimer = 0;
    var canAnim = typeof Element !== "undefined" && Element.prototype.animate;
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var COARSE = window.matchMedia && window.matchMedia("(hover:none)").matches;
    var contentFills = [],
      closeAnims = [],
      isClosing = false;

    function cancelCloseAnims() {
      closeAnims.forEach(function(a) {
        try {
          a.cancel();
        } catch (e) {}
      });
      closeAnims = [];
    }

    function gooT(x, y, s) {
      return "translate(-50%,-50%) translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scale(" + s + ")";
    }

    function setGooBox(L, T, W, H) {
      /* shrink the filtered layer to just the action area (cheap to rasterize) */
      goo.style.inset = "auto";
      goo.style.left = Math.round(L) + "px";
      goo.style.top = Math.round(T) + "px";
      goo.style.width = Math.round(W) + "px";
      goo.style.height = Math.round(H) + "px";
      return {
        x: L + W / 2,
        y: T + H / 2
      };
    }

    function cancelContentFills() {
      contentFills.forEach(function(a) {
        try {
          a.cancel();
        } catch (e) {}
      });
      contentFills = [];
    }

    function gooSplash() {
      /* open: taffy splash as the card lands */
      if (!goo || !canAnim || reducedMotion) return;
      var card = cards[cur],
        cr = card.getBoundingClientRect(),
        sr = stage.getBoundingClientRect();
      var gc = setGooBox(cr.left - sr.left - 170, cr.top - sr.top - 170, cr.width + 340, cr.height + 340);
      var cx = (cr.left - sr.left + cr.width / 2) - gc.x,
        cy = (cr.top - sr.top + cr.height / 2) - gc.y;
      var halfW = cr.width / 2,
        halfH = cr.height / 2;
      gMain.style.width = Math.round(cr.width - 24) + "px";
      gMain.style.height = Math.round(cr.height - 24) + "px";
      gMain.style.borderRadius = "34px";
      clearTimeout(gooTimer);
      goo.style.transition = "none";
      goo.style.opacity = "1";
      /* only the soft squish behind the card — no droplets popping out around it */
      gDrops.forEach(function(d) {
        d.getAnimations().forEach(function(a) {
          try {
            a.cancel();
          } catch (e) {}
        });
        d.style.transform = "";
      });
      gMain.animate([{
        transform: gooT(cx, cy, .72)
      }, {
        transform: gooT(cx, cy, 1.06),
        offset: .55
      }, {
        transform: gooT(cx, cy, 1)
      }], {
        duration: 560,
        easing: "cubic-bezier(.34,1.56,.64,1)",
        fill: "forwards"
      });
      gooTimer = setTimeout(function() {
        goo.style.opacity = "0";
      }, 600);
    }

    function gooMelt(tgt) {
      /* close: empty card melts into its chip as a taffy strand.
            All animations are created up-front (delays included) — creating them mid-close stalls. */
      var card = cards[cur],
        cr = card.getBoundingClientRect(),
        sr = stage.getBoundingClientRect();
      var pr = lastAnchor.getBoundingClientRect();
      var L = Math.min(cr.left, pr.left) - sr.left - 150,
        T = Math.min(cr.top, pr.top) - sr.top - 150;
      var R = Math.max(cr.right, pr.right) - sr.left + 150,
        B = Math.max(cr.bottom, pr.bottom) - sr.top + 150;
      var gc = setGooBox(L, T, R - L, B - T);
      var cx = (cr.left - sr.left + cr.width / 2) - gc.x,
        cy = (cr.top - sr.top + cr.height / 2) - gc.y;
      gMain.style.width = Math.round(cr.width - 10) + "px";
      gMain.style.height = Math.round(cr.height - 10) + "px";
      gMain.style.borderRadius = "36px";
      clearTimeout(gooTimer);
      goo.style.transition = "none";
      goo.style.opacity = "1";
      var tx = (pr.left - sr.left + pr.width / 2) - gc.x,
        ty = (pr.top - sr.top + pr.height / 2) - gc.y;
      var accel = "cubic-bezier(.6,.05,.75,.35)";
      var chain = [gMain].concat(gDrops);
      var sizes = [0, cr.width * .4, cr.width * .26, cr.width * .16];
      chain.forEach(function(el, i) {
        el.getAnimations().forEach(function(a) {
          try {
            a.cancel();
          } catch (e) {}
        });
        if (i > 0) {
          el.style.width = Math.round(sizes[i]) + "px";
          el.style.height = Math.round(sizes[i]) + "px";
        }
        el.style.transition = "none";
        el.style.transform = "";
        var s0 = i === 0 ? 1 : (i === 1 ? .95 : .85);
        closeAnims.push(el.animate(
          [{
            transform: gooT(cx, cy, s0)
          }, {
            transform: gooT(tx, ty, i === 0 ? .08 : 0)
          }], {
            duration: 360,
            delay: 150 + i * 40,
            easing: accel,
            fill: "both"
          }));
      });
      closeAnims.push(goo.animate([{
        opacity: 1
      }, {
        opacity: 0
      }], {
        duration: 140,
        delay: 610,
        easing: "ease-out",
        fill: "forwards"
      }));
    }

    function fadeContentOut(card) {
      /* close prelude: content dissolves so the card empties first */
      if (!canAnim) return;
      var parts = card.querySelectorAll(".skill-quote,.skill-eyebrow,.skill-item");
      Array.prototype.forEach.call(parts, function(el, i) {
        contentFills.push(el.animate([{
          opacity: 1,
          transform: "translateY(0)"
        }, {
          opacity: 0,
          transform: "translateY(8px)"
        }], {
          duration: 130,
          delay: i * 28,
          easing: "ease-out",
          fill: "forwards"
        }));
      });
    }

    function popContent() {
      /* open: content pours in staggered */
      if (!canAnim) return;
      cancelContentFills();
      var card = cards[cur];
      var parts = card.querySelectorAll(".skill-quote,.skill-eyebrow,.skill-ava,.skill-item > h3,.skill-item > .skill-role,.skill-item > p,.skill-item > .hwm-item,.skill-item > ul > li");
      Array.prototype.forEach.call(parts, function(el, i) {
        el.animate([{
          opacity: 0,
          transform: "translateY(12px)"
        }, {
          opacity: 1,
          transform: "translateY(0)"
        }], {
          duration: 380,
          delay: 130 + i * 34,
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "backwards"
        });
      });
    }

    function keyFor(t) {
      return (t || "").trim().toLowerCase().replace(/[^a-z]/g, "");
    }

    function anchorFor(k) {
      return pillByKey[k];
    }

    function slotTransform(off) {
      var a = Math.abs(off),
        sign = off < 0 ? -1 : 1;
      var t = "translate(-50%,-50%)";
      if (off !== 0) {
        var d = a === 1 ? "min(440px,34vw)" : a === 2 ? "min(660px,50vw)" : "min(820px,62vw)";
        t += " translateX(calc(" + d + " * " + sign + "))";
        t += " rotateY(" + ((-sign) * (a === 1 ? 52 : 58)) + "deg)";
        t += " scale(" + (a === 1 ? .86 : a === 2 ? .74 : .66) + ")";
      }
      return t;
    }
    /* entrance start for side cards: pushed further out to the two sides + faded */
    function farStart(off) {
      var a = Math.abs(off),
        sign = off < 0 ? -1 : 1;
      var d = a === 1 ? "min(780px,62vw)" : a === 2 ? "min(1040px,84vw)" : "min(1280px,98vw)";
      return "translate(-50%,-50%) translateX(calc(" + d + " * " + sign + ")) rotateY(" + ((-sign) * (a === 1 ? 62 : 68)) + "deg) scale(" + (a === 1 ? .68 : a === 2 ? .58 : .5) + ")";
    }

    function layout(instant) {
      cards.forEach(function(c, i) {
        var off = i - cur,
          a = Math.abs(off);
        if (instant) {
          c.style.transition = "none";
        }
        c.style.transform = slotTransform(off);
        c.style.opacity = a >= 3 ? 0 : 1;
        c.style.filter = off === 0 ? "none" : "brightness(" + (a === 1 ? .72 : .5) + ")";
        c.style.zIndex = Math.max(0, 30 - a * 10);
        c.style.pointerEvents = a >= 3 ? "none" : "auto";
        c.classList.toggle("cur", off === 0);
        if (instant) {
          void c.offsetWidth;
          c.style.transition = "";
        }
      });
      if (prevBtn) prevBtn.disabled = cur === 0;
      if (nextBtn) nextBtn.disabled = cur === cards.length - 1;
    }

    function goTo(i) {
      if (isClosing || i < 0 || i >= cards.length || i === cur) return;
      cur = i;
      cards.forEach(function(c) {
        c.style.transition = "";
      }); /* default coverflow easing */
      layout(false);
      var a = anchorFor(keys[cur]);
      if (a) lastAnchor = a;
      cards[cur].scrollTop = 0;
    }

    function fromTransform(el) {
      var pr = el.getBoundingClientRect(),
        cr = stage.getBoundingClientRect();
      if (!pr.width || !cr.width) return null;
      var dx = (pr.left + pr.width / 2) - (cr.left + cr.width / 2);
      var dy = (pr.top + pr.height / 2) - (cr.top + cr.height / 2);
      var s = Math.max(.08, Math.min(.3, pr.width / cr.width));
      return "translate(" + dx + "px," + dy + "px) scale(" + s + ")";
    }

    function openModal(k, src) {
      var i = keys.indexOf(k);
      if (i < 0) return;
      cur = i;
      clearTimeout(zoomTimer);
      clearTimeout(meltTimer);
      isClosing = false;
      cancelCloseAnims();
      if (goo) goo.style.opacity = "0";
      lastAnchor = src || anchorFor(k) || null;
      stage.style.transition = "none";
      stage.style.transform = "";
      layout(true); /* establish slots + cur class instantly */
      /* set each card to its ENTRANCE START: the clicked one at the pill, the rest far out to the sides */
      var from = lastAnchor ? fromTransform(lastAnchor) : null;
      cards.forEach(function(c, idx) {
        var off = idx - cur;
        c.style.transition = "none";
        if (off === 0) {
          c.style.transform = "translate(-50%,-50%) " + (from || "scale(.18)");
          c.style.opacity = "1";
          c.style.filter = "none";
        } else {
          c.style.transform = farStart(off);
          c.style.opacity = "0";
        }
        void c.offsetWidth;
      });
      modal.classList.remove("closing");
      modal.classList.add("open");
      cards[cur].scrollTop = 0;
      lockScroll();
      requestAnimationFrame(function() {
        cards.forEach(function(c, idx) {
          var off = idx - cur,
            a = Math.abs(off);
          if (off === 0) {
            c.style.transition = "transform .6s var(--spring)";
          } else {
            var delay = (0.16 + (a - 1) * 0.08).toFixed(2);
            c.style.transition = "transform .58s var(--ease-soft) " + delay + "s, opacity .5s var(--ease) " + delay + "s, filter .58s var(--ease-soft) " + delay + "s";
          }
        });
        layout(false); /* animate every card to its slot */
        popContent();
      });
      zoomTimer = setTimeout(function() {
        if (modal.classList.contains("open")) cards.forEach(function(c) {
          c.style.transition = "";
        });
      }, 900);
      closeBtn.focus({
        preventScroll: true
      });
    }

    function closeModal() {
      if (!modal.classList.contains("open") || isClosing) return;
      var card = cards[cur];
      /* close target = the CURRENT card's own chip (updated by goTo on arrow nav) */
      var a0 = anchorFor(keys[cur]);
      if (a0) lastAnchor = a0;
      var tgt = null;
      if (lastAnchor) {
        var pr = lastAnchor.getBoundingClientRect(),
          sr = stage.getBoundingClientRect();
        if (pr.width && sr.width) tgt = {
          dx: (pr.left + pr.width / 2) - (sr.left + sr.width / 2),
          dy: (pr.top + pr.height / 2) - (sr.top + sr.height / 2)
        };
      }
      var ez = "cubic-bezier(.22,.68,0,1)";
      if (canAnim && !reducedMotion && tgt && goo) {
        isClosing = true;
        cancelCloseAnims();
        /* the whole sequence is built NOW; .open is only removed at the very end */
        var maxA = 0;
        cards.forEach(function(c, idx) {
          var a = Math.abs(idx - cur);
          if (a < 3 && a > maxA) maxA = a;
        });
        cards.forEach(function(c, idx) {
          var off = idx - cur,
            a = Math.abs(off);
          if (off === 0 || a >= 3) return;
          closeAnims.push(c.animate(
            [{
              transform: slotTransform(off),
              opacity: 1
            }, {
              transform: farStart(off),
              opacity: 0
            }], {
              duration: 380,
              delay: (maxA - a) * 50,
              easing: ez,
              fill: "both"
            }));
        });
        fadeContentOut(card); /* 1) content dissolves      */
        closeAnims.push(card.animate([{
          opacity: 1
        }, {
          opacity: 0
        }], {
          duration: 60,
          delay: 150,
          easing: "linear",
          fill: "forwards"
        })); /* 2) card -> blob swap */
        gooMelt(tgt); /* 3) taffy strand into chip */
        closeAnims.push(closeBtn.animate([{
          opacity: 1
        }, {
          opacity: 0
        }], {
          duration: 160,
          easing: "ease-out",
          fill: "forwards"
        }));
        var arrowsWrap = modal.querySelector(".skill-arrows");
        if (arrowsWrap) closeAnims.push(arrowsWrap.animate([{
          opacity: 1
        }, {
          opacity: 0
        }], {
          duration: 160,
          easing: "ease-out",
          fill: "forwards"
        }));
        var bd = modal.querySelector(".skill-backdrop");
        var bdKf = COARSE ? [{
          opacity: 1
        }, {
          opacity: 0
        }] : [{
            opacity: 1,
            backdropFilter: "blur(16px)",
            webkitBackdropFilter: "blur(16px)"
          },
          {
            opacity: 0,
            backdropFilter: "blur(0px)",
            webkitBackdropFilter: "blur(0px)"
          }
        ];
        closeAnims.push(bd.animate(bdKf, {
          duration: 500,
          delay: 120,
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "forwards"
        }));
        unlockScroll();
        clearTimeout(zoomTimer);
        zoomTimer = setTimeout(function() {
          /* 4) real teardown at the end */
          modal.classList.remove("open");
          isClosing = false;
          cancelCloseAnims();
          cancelContentFills();
          cards.forEach(function(c) {
            c.style.transition = "";
          });
          layout(true);
          goo.style.opacity = "0";
        }, 780);
      } else {
        /* fallback: simple shrink back to the chip */
        var from = lastAnchor ? fromTransform(lastAnchor) : null;
        var maxA2 = 0;
        cards.forEach(function(c, idx) {
          var a = Math.abs(idx - cur);
          if (c.style.opacity !== "0" && a > maxA2) maxA2 = a;
        });
        cards.forEach(function(c, idx) {
          var off = idx - cur,
            a = Math.abs(off);
          if (off === 0) {
            c.style.transition = "transform .42s var(--ease-soft), opacity .3s var(--ease) .18s";
            c.style.transform = "translate(-50%,-50%) " + (from || "scale(.18)");
            c.style.opacity = "0";
          } else {
            var delay = ((maxA2 - a) * 0.05).toFixed(2);
            c.style.transition = "transform .4s var(--ease) " + delay + "s, opacity .32s var(--ease) " + delay + "s";
            c.style.transform = farStart(off);
            c.style.opacity = "0";
          }
        });
        modal.classList.remove("open");
        unlockScroll();
        clearTimeout(zoomTimer);
        zoomTimer = setTimeout(function() {
          cards.forEach(function(c) {
            c.style.transition = "";
          });
          layout(true);
        }, 560);
      }
      if (lastAnchor) {
        lastAnchor.focus({
          preventScroll: true
        });
      }
    }
    anchorList.forEach(function(a) {
      var el = a.el;
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      pillByKey[a.key] = el;
      el.addEventListener("click", function() {
        openModal(a.key, el);
      });
      el.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(a.key, el);
        }
      });
    });
    cards.forEach(function(c, i) {
      c.addEventListener("click", function() {
        if (dragMoved) {
          dragMoved = false;
          return;
        }
        if (i !== cur) goTo(i);
      });
    });
    if (prevBtn) prevBtn.addEventListener("click", function() {
      goTo(cur - 1);
    });
    if (nextBtn) nextBtn.addEventListener("click", function() {
      goTo(cur + 1);
    });
    /* mouse drag (desktop) */
    var dragX = null,
      dragMoved = false;
    stage.addEventListener("pointerdown", function(e) {
      if (isClosing || (e.pointerType !== "mouse" && e.pointerType !== "pen")) return;
      dragX = e.clientX;
      dragMoved = false;
      stage.classList.add("dragging");
      e.preventDefault();
    });
    window.addEventListener("pointermove", function(e) {
      if (dragX === null) return;
      var dx = e.clientX - dragX;
      if (Math.abs(dx) > 6) dragMoved = true;
      stage.style.transform = "translateX(" + (dx * 0.22) + "px)";
    });
    window.addEventListener("pointerup", function(e) {
      if (dragX === null) return;
      var dx = e.clientX - dragX;
      dragX = null;
      stage.classList.remove("dragging");
      stage.style.transition = "transform .35s var(--ease)";
      stage.style.transform = "";
      setTimeout(function() {
        if (modal.classList.contains("open")) stage.style.transition = "";
      }, 380);
      if (Math.abs(dx) > 70) goTo(cur + (dx < 0 ? 1 : -1));
    });
    var tx0 = null;
    stage.addEventListener("touchstart", function(e) {
      tx0 = e.touches[0].clientX;
    }, {
      passive: true
    });
    stage.addEventListener("touchend", function(e) {
      if (tx0 === null) return;
      var dx = e.changedTouches[0].clientX - tx0;
      tx0 = null;
      if (Math.abs(dx) > 48) {
        goTo(cur + (dx < 0 ? 1 : -1));
      }
    }, {
      passive: true
    });
    modal.querySelector(".skill-backdrop").addEventListener("click", closeModal);
    closeBtn.addEventListener("click", closeModal);
    document.addEventListener("keydown", function(e) {
      if (!modal.classList.contains("open") || isClosing) return;
      if (e.key === "Escape") closeModal();
      else if (e.key === "ArrowRight") goTo(cur + 1);
      else if (e.key === "ArrowLeft") goTo(cur - 1);
    });
    layout(true);
  }
  (function() {
    function kf(t) {
      return (t || "").trim().toLowerCase().replace(/[^a-z]/g, "");
    }
    var sa = [];
    document.querySelectorAll(".orbit .opill").forEach(function(pl) {
      sa.push({
        el: pl,
        key: kf(pl.textContent)
      });
    });
    var core = document.querySelector(".orbit .orbit-core");
    if (core) {
      core.setAttribute("aria-label", "About Ali Umirov");
      sa.push({
        el: core,
        key: "aboutme"
      });
    }
    initCoverflow("skillModal", sa);
    var ta = [];
    document.querySelectorAll("#tools .tool").forEach(function(t) {
      ta.push({
        el: t,
        key: kf(t.textContent)
      });
    });
    initCoverflow("toolModal", ta);
    var aboutCard = document.querySelector(".about-card");
    if (aboutCard) initCoverflow("howModal", [{
      el: aboutCard,
      key: "howiwork"
    }]);
  })();


  /* ---- experience: preview + view more ---- */
  var COLLAPSED = 76;
  document.querySelectorAll(".role").forEach(function(d) {
    var body = d.querySelector(".rbody"),
      btn = d.querySelector(".vmore"),
      sum = d.querySelector("summary");
    if (!body || !btn) return;
    d.open = true;
    body.style.maxHeight = COLLAPSED + "px";

    function toggle() {
      if (d.classList.contains("expanded")) {
        body.style.maxHeight = body.scrollHeight + "px";
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            body.style.maxHeight = COLLAPSED + "px";
          });
        });
        d.classList.remove("expanded");
      } else {
        d.classList.add("expanded");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    }
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      toggle();
    });
    if (sum) {
      sum.addEventListener("click", function(e) {
        e.preventDefault();
      });
    }
  });

  /* ---- recommendations: preview + view more + open LinkedIn ---- */
  var QCOL = 132;

  function collapseQuotes() {
    document.querySelectorAll(".quote").forEach(function(q) {
      var body = q.querySelector(".qbody");
      if (body && !q.classList.contains("expanded")) body.style.height = QCOL + "px";
    });
  }
  document.querySelectorAll(".quote").forEach(function(q) {
    var body = q.querySelector(".qbody"),
      btn = q.querySelector(".vmore");
    if (body && btn) {
      body.style.height = QCOL + "px";
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (q.classList.contains("expanded")) {
          body.style.height = body.scrollHeight + "px";
          requestAnimationFrame(function() {
            requestAnimationFrame(function() {
              body.style.height = QCOL + "px";
            });
          });
          q.classList.remove("expanded");
        } else {
          q.classList.add("expanded");
          body.style.height = body.scrollHeight + "px";
        }
      });
    }
    q.addEventListener("click", function(e) {
      if (e.target.closest(".vmore")) return;
      var u = q.getAttribute("data-url");
      if (u) window.open(u, "_blank", "noopener");
    });
  });
  window.addEventListener("load", collapseQuotes);


})();

(function() {
  if (window.matchMedia('(hover:none)').matches || window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  function tilt(card, max, persp, glow) {
    var raf = null,
      tx = 0,
      ty = 0,
      mx = '50%',
      my = '50%';
    if (glow) {
      var g = document.createElement('i');
      g.className = 'tilt-glow';
      card.insertBefore(g, card.firstChild);
    }

    function apply() {
      card.style.transform = 'perspective(' + persp + 'px) rotateY(' + tx + 'deg) rotateX(' + ty + 'deg)';
      if (glow) {
        card.style.setProperty('--mx', mx);
        card.style.setProperty('--my', my);
      }
      raf = null;
    }
    card.addEventListener('mouseenter', function() {
      card.classList.add('tilt');
    });
    card.addEventListener('mousemove', function(e) {
      var r = card.getBoundingClientRect();
      var fx = (e.clientX - r.left) / r.width,
        fy = (e.clientY - r.top) / r.height;
      tx = (fx - .5) * max * 2;
      ty = -(fy - .5) * max * 2;
      mx = (fx * 100) + '%';
      my = (fy * 100) + '%';
      if (!raf) raf = requestAnimationFrame(apply);
    });
    card.addEventListener('mouseleave', function() {
      card.classList.remove('tilt');
      card.style.transform = '';
    });
  }

  var about = document.querySelector('.about-card');
  if (about) tilt(about, 7, 1100, true);
  document.querySelectorAll('.impact .stat').forEach(function(s) {
    tilt(s, 6, 900, true);
  });
  var orbit = document.querySelector('.orbit');
  if (orbit) tilt(orbit, 9, 1200, false);
  var contact = document.querySelector('.contact-card');
  if (contact) tilt(contact, 6, 1100, true);
})();

(function() {
  return; /* cursor-trail disabled (kept for reference, does not run) */
  try {
    if (matchMedia('(hover:none)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  } catch (e) {}
  var canvas = document.querySelector('.cursor-trail');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.running = true;
  var pos = {
      x: 0,
      y: 0
    },
    lines = [],
    f;
  var E = {
    friction: 0.5,
    trails: 20,
    size: 50,
    dampening: 0.25,
    tension: 0.98
  };

  function Node() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
  }

  function Line(o) {
    this.spring = o.spring + 0.1 * Math.random() - 0.05;
    this.friction = E.friction + 0.01 * Math.random() - 0.005;
    this.nodes = [];
    for (var n = 0; n < E.size; n++) {
      var t = new Node();
      t.x = pos.x;
      t.y = pos.y;
      this.nodes.push(t);
    }
  }
  Line.prototype.update = function() {
    var e = this.spring,
      t = this.nodes[0];
    t.vx += (pos.x - t.x) * e;
    t.vy += (pos.y - t.y) * e;
    for (var i = 0, a = this.nodes.length; i < a; i++) {
      t = this.nodes[i];
      if (i > 0) {
        var n = this.nodes[i - 1];
        t.vx += (n.x - t.x) * e;
        t.vy += (n.y - t.y) * e;
        t.vx += n.vx * E.dampening;
        t.vy += n.vy * E.dampening;
      }
      t.vx *= this.friction;
      t.vy *= this.friction;
      t.x += t.vx;
      t.y += t.vy;
      e *= E.tension;
    }
  };
  Line.prototype.draw = function() {
    var e, t, n = this.nodes[0].x,
      i = this.nodes[0].y;
    ctx.beginPath();
    ctx.moveTo(n, i);
    for (var a = 1, o = this.nodes.length - 2; a < o; a++) {
      e = this.nodes[a];
      t = this.nodes[a + 1];
      n = 0.5 * (e.x + t.x);
      i = 0.5 * (e.y + t.y);
      ctx.quadraticCurveTo(e.x, e.y, n, i);
    }
    e = this.nodes[this.nodes.length - 2];
    t = this.nodes[this.nodes.length - 1];
    ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
    ctx.stroke();
    ctx.closePath();
  };

  function Osc(o) {
    this.phase = o.phase || 0;
    this.offset = o.offset || 0;
    this.frequency = o.frequency || 0.001;
    this.amplitude = o.amplitude || 1;
    this.value = 0;
  }
  Osc.prototype.update = function() {
    this.phase += this.frequency;
    this.value = this.offset + Math.sin(this.phase) * this.amplitude;
    return this.value;
  };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initLines() {
    lines = [];
    for (var i = 0; i < E.trails; i++) lines.push(new Line({
      spring: 0.4 + (i / E.trails) * 0.025
    }));
  }

  function setPos(e) {
    if (e.touches) {
      pos.x = e.touches[0].clientX;
      pos.y = e.touches[0].clientY;
    } else {
      pos.x = e.clientX;
      pos.y = e.clientY;
    }
  }

  function render() {
    if (!ctx.running) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'hsla(' + Math.round(f.update()) + ',100%,66%,0.03)';
    ctx.lineWidth = 1;
    for (var t = 0; t < E.trails; t++) {
      lines[t].update();
      lines[t].draw();
    }
    window.requestAnimationFrame(render);
  }

  function onFirst(e) {
    setPos(e);
    initLines();
    render();
    document.removeEventListener('mousemove', onFirst);
    document.removeEventListener('touchstart', onFirst);
    document.addEventListener('mousemove', setPos);
    document.addEventListener('touchmove', setPos);
  }
  f = new Osc({
    phase: Math.random() * 2 * Math.PI,
    amplitude: 14,
    frequency: 0.0016,
    offset: 219
  });
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', onFirst);
  document.addEventListener('touchstart', onFirst);
  window.addEventListener('focus', function() {
    if (!ctx.running) {
      ctx.running = true;
      render();
    }
  });
})();

/* perf: pause infinite animations while their section is off screen (no visual change) */
(function() {
  if (!("IntersectionObserver" in window)) return;
  var targets = document.querySelectorAll(".about-card,.contact-card,.marquee,.orbit,.impact .stat");
  if (!targets.length) return;
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(en) {
      en.target.classList.toggle("offview", !en.isIntersecting);
    });
  }, {
    rootMargin: "120px 0px"
  });
  targets.forEach(function(t) {
    io.observe(t);
  });
})();

/* copy protection: block copy/cut, right-click menu, selection & drag (allows form fields) */
(function() {
  function inField(t) {
    return t && (t.closest && t.closest('input,textarea,[contenteditable="true"]'));
  }
  ['copy', 'cut'].forEach(function(ev) {
    document.addEventListener(ev, function(e) {
      if (!inField(e.target)) {
        e.preventDefault();
      }
    }, true);
  });
  document.addEventListener('contextmenu', function(e) {
    if (!inField(e.target)) {
      e.preventDefault();
    }
  });
  document.addEventListener('selectstart', function(e) {
    if (!inField(e.target)) {
      e.preventDefault();
    }
  });
  document.addEventListener('dragstart', function(e) {
    if (!inField(e.target)) {
      e.preventDefault();
    }
  });
})();
