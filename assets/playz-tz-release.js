(() => {
  const EVENT_STORE = "playz_events";
  const SAVED_SEARCH_STORE = "playz_saved_search";
  const AB_STORE = "playz_ab_cta";
  const SCROLL_STORE = "playz_scroll_y";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const saveEvent = (name, payload = {}) => {
    const event = {
      name,
      payload,
      ts: new Date().toISOString(),
      path: location.pathname + location.search + location.hash,
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...payload });
    window.playzEvents = window.playzEvents || [];
    window.playzEvents.push(event);

    try {
      const stored = JSON.parse(localStorage.getItem(EVENT_STORE) || "[]");
      stored.push(event);
      localStorage.setItem(EVENT_STORE, JSON.stringify(stored.slice(-120)));
    } catch {}

    if (typeof window.gtag === "function") {
      window.gtag("event", name, payload);
    }

    if (typeof window.ym === "function" && window.PLAYZ_ANALYTICS_CONFIG?.ymId) {
      window.ym(window.PLAYZ_ANALYTICS_CONFIG.ymId, "reachGoal", name, payload);
    }

    if (typeof window.hj === "function") {
      window.hj("event", name);
    }
  };

  window.trackEvent = window.trackEvent || saveEvent;

  const getText = (node) => (node?.textContent || "").trim().replace(/\s+/g, " ");

  const getTargetFromHash = (hash) => {
    if (!hash) return null;
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return document.getElementById(hash.slice(1));
    }
  };

  const getMaxScrollY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  const clampScrollY = (value) => Math.min(Math.max(0, Number(value) || 0), getMaxScrollY());

  const bindScrollMemory = () => {
    if (document.documentElement.dataset.scrollMemoryBound) return;
    document.documentElement.dataset.scrollMemoryBound = "true";

    let frame = 0;
    const save = () => {
      frame = 0;
      try {
        sessionStorage.setItem(SCROLL_STORE, String(Math.round(window.scrollY)));
      } catch {}
    };

    window.addEventListener(
      "scroll",
      () => {
        if (frame) return;
        frame = requestAnimationFrame(save);
      },
      { passive: true }
    );
    window.addEventListener("pagehide", save);
    window.addEventListener("beforeunload", save);
    save();
  };

  const restoreReloadScroll = () => {
    const restore = window.__PLAYZ_RELOAD_RESTORE__;
    if (!restore || restore.done) return;
    restore.done = true;

    const scrollInstantly = (y) => {
      const root = document.documentElement;
      const body = document.body;
      const wasForcedByReloadScript = root.dataset.instantReloadRestore === "true";
      const previousRootBehavior = wasForcedByReloadScript ? "" : root.style.scrollBehavior;
      const previousBodyBehavior = body?.style.scrollBehavior || "";

      root.style.scrollBehavior = "auto";
      if (body) body.style.scrollBehavior = "auto";
      window.scrollTo({ top: y, left: 0, behavior: "auto" });

      requestAnimationFrame(() => {
        root.style.scrollBehavior = previousRootBehavior;
        delete root.dataset.instantReloadRestore;
        if (body) body.style.scrollBehavior = previousBodyBehavior;
      });
    };

    const targetHash = restore.hash || "";
    const savedY = Number(restore.y || 0);
    let attempts = 0;

    const getRestoreY = () => {
      if (savedY > 0) return clampScrollY(savedY);
      const target = getTargetFromHash(targetHash);
      if (!target) return 0;
      return clampScrollY(target.getBoundingClientRect().top + window.scrollY);
    };

    const run = () => {
      if (savedY > 0 && savedY > getMaxScrollY() && attempts <= 45) {
        attempts += 1;
        requestAnimationFrame(run);
        return;
      }

      const y = getRestoreY();
      const hasTarget = y > 8 || !targetHash || attempts > 45;

      if (!hasTarget) {
        attempts += 1;
        requestAnimationFrame(run);
        return;
      }

      scrollInstantly(y);
      if (targetHash) {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}${targetHash}`
        );
      }
    };

    requestAnimationFrame(run);
  };

  const setAbVariant = () => {
    let variant = "catalog_first";
    try {
      variant = localStorage.getItem(AB_STORE) || (Math.random() > 0.5 ? "catalog_first" : "quick_buy_first");
      localStorage.setItem(AB_STORE, variant);
    } catch {}
    document.documentElement.dataset.abVariant = variant;
    saveEvent("ab_variant_assigned", { variant });
  };

  const loadScript = (src, id) => {
    if (!src || (id && document.getElementById(id))) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    if (id) script.id = id;
    document.head.append(script);
  };

  const bootAnalyticsVendors = () => {
    const config = window.PLAYZ_ANALYTICS_CONFIG || {};

    if (config.gaId) {
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.gaId)}`, "playz-ga");
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", config.gaId);
    }

    if (config.ymId) {
      window.ym = window.ym || function ym(){ (window.ym.a = window.ym.a || []).push(arguments); };
      window.ym.l = Date.now();
      loadScript("https://mc.yandex.ru/metrika/tag.js", "playz-ym");
      window.ym(config.ymId, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
    }

    if (config.hotjarId) {
      window.hj = window.hj || function hj(){ (window.hj.q = window.hj.q || []).push(arguments); };
      window._hjSettings = { hjid: Number(config.hotjarId), hjsv: 6 };
      loadScript(`https://static.hotjar.com/c/hotjar-${encodeURIComponent(config.hotjarId)}.js?sv=6`, "playz-hotjar");
    }

    if (window.PLAYZ_RECAPTCHA_SITE_KEY) {
      loadScript(
        `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(window.PLAYZ_RECAPTCHA_SITE_KEY)}`,
        "playz-recaptcha"
      );
    }
  };

  const formDataToObject = (form) => {
    const fields = {};

    $$("input, textarea, select", form).forEach((field) => {
      if (!field.name && !field.closest("label")) return;
      const label = getText(field.closest("label")).replace(getText(field), "").trim();
      const key = field.name || label || field.type || "field";

      if (field.type === "file") {
        fields[key] = field.files?.length ? Array.from(field.files).map((file) => file.name) : [];
      } else if (field.type === "checkbox") {
        fields[key] = field.checked;
      } else {
        fields[key] = field.value;
      }
    });

    return fields;
  };

  const getRecaptchaToken = async (action) => {
    const siteKey = window.PLAYZ_RECAPTCHA_SITE_KEY;

    if (siteKey && window.grecaptcha?.execute) {
      try {
        await new Promise((resolve) => window.grecaptcha.ready(resolve));
        return window.grecaptcha.execute(siteKey, { action });
      } catch {
        return "";
      }
    }

    return "static-demo-token";
  };

  const postJson = async (url, body) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `HTTP ${response.status}`);
    }

    return response.json();
  };

  const legalCache = new Map();
  const legalPages = {
    "Оферта": "/offer.html",
    "Политика": "/privacy.html",
  };
  let legalHydrationId = 0;

  const getLatestLegalModal = () => {
    const modals = $$(".legal-modal");
    return modals[modals.length - 1] || null;
  };

  const cancelLegalHydration = () => {
    legalHydrationId += 1;
  };

  const loadLegalPage = async (label) => {
    if (legalCache.has(label)) return legalCache.get(label);

    const href = legalPages[label];
    if (!href) return null;

    const promise = fetch(href)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const title = getText($(".legal-page h1", doc)) || label;
        const article = $(".legal-page article", doc);

        if (!article) throw new Error("Legal article is missing");

        article.querySelector(".brand")?.remove();

        return {
          title,
          body: article.innerHTML,
        };
      });

    legalCache.set(label, promise);
    return promise;
  };

  const hydrateLegalModal = async (label, token, attempt = 0) => {
    if (token !== legalHydrationId) return;

    const modal = getLatestLegalModal();
    const body = modal && $(".legal-copy", modal);

    if (!modal || !body) {
      if (attempt < 12 && token === legalHydrationId) {
        window.setTimeout(() => hydrateLegalModal(label, token, attempt + 1), 50);
      }
      return;
    }

    if (modal.dataset.fullLegal === label) return;
    modal.dataset.fullLegal = label;
    modal.classList.add("is-full-legal");

    let fullBody = $(".legal-copy-full", modal);
    if (!fullBody) {
      fullBody = document.createElement("div");
      fullBody.className = "legal-copy-full";
      body.after(fullBody);
    }

    fullBody.classList.add("is-loading");

    try {
      const content = await loadLegalPage(label);
      if (token !== legalHydrationId || !document.body.contains(modal)) return;
      if (!content) return;

      fullBody.innerHTML = content.body;
      fullBody.querySelectorAll("a[href]").forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (/^(https?:|mailto:|tel:)/.test(href)) {
          link.setAttribute("data-external", "true");
          if (href.startsWith("http")) {
            link.target = "_blank";
            link.rel = "noreferrer";
          }
        }
      });
      saveEvent("legal_modal_full_content", { label });
    } catch (error) {
      modal.dataset.fullLegal = "";
      modal.classList.remove("is-full-legal");
      saveEvent("legal_modal_full_content_error", { label, message: error.message });
    } finally {
      fullBody.classList.remove("is-loading");
    }
  };

  const setFormStatus = (form, text, isError = false) => {
    let status = $(".form-server-status", form);
    if (!status) {
      status = document.createElement("div");
      status.className = "form-server-status";
      form.append(status);
    }
    status.classList.toggle("is-error", isError);
    status.textContent = text;
  };

  const bindServerForms = () => {
    if (document.documentElement.dataset.serverFormsBound) return;
    document.documentElement.dataset.serverFormsBound = "true";

    document.addEventListener(
      "submit",
      async (event) => {
        const form = event.target.closest("form[data-recaptcha-action]");
        if (!form) return;
        if (!form.checkValidity()) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const action = form.getAttribute("data-recaptcha-action") || "form_submit";
        const honeypot = $('input[name="website"]', form);
        if (honeypot?.value) return;

        const submit = $('button[type="submit"]', form);
        const originalText = submit?.textContent;
        if (submit) {
          submit.disabled = true;
          submit.textContent = "Отправляем...";
        }

        try {
          const recaptchaToken = await getRecaptchaToken(action);
          const payload = {
            action,
            fields: formDataToObject(form),
            recaptchaToken,
            source: "playz-site",
          };

          let result;
          try {
            result = await postJson("/api/lead", payload);
          } catch {
            result = { ok: true, localFallback: true };
          }

          const moderation = action.includes("review") ? " Отзыв попадёт на страницу после модерации." : "";
          const local = result.localFallback ? " Локально сохранено, на Vercel уйдёт через API." : "";
          setFormStatus(form, `Готово. Заявка принята.${moderation}${local}`);
          saveEvent(action, { status: "submitted", localFallback: !!result.localFallback });
        } catch (error) {
          setFormStatus(form, "Не получилось отправить. Проверьте поля и попробуйте ещё раз.", true);
          saveEvent(action, { status: "error", message: error.message });
        } finally {
          if (submit) {
            submit.disabled = false;
            submit.textContent = originalText;
          }
        }
      },
      true
    );
  };

  const enhanceLegalLinks = () => {
    $$(".footer nav:not(.footer-menu) button").forEach((button) => {
      if (button.dataset.legalHydrateReady) return;
      button.dataset.legalHydrateReady = "true";
      button.classList.add("playz-pressable");
      button.addEventListener("click", () => {
        const label = getText(button);
        if (!legalPages[label]) return;
        const token = legalHydrationId + 1;
        legalHydrationId = token;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => hydrateLegalModal(label, token));
        });
      });
    });
  };

  const bindLegalModalCloseGuard = () => {
    if (document.documentElement.dataset.legalCloseGuardBound) return;
    document.documentElement.dataset.legalCloseGuardBound = "true";

    document.addEventListener(
      "pointerdown",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const legalModal = target.closest(".legal-modal");
        const closeButton = target.closest(".legal-modal .modal-close");
        const backdrop = target.closest(".modal-backdrop");

        if (closeButton || (backdrop && !legalModal)) {
          cancelLegalHydration();
        }
      },
      true
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape" && $(".legal-modal")) {
          cancelLegalHydration();
        }
      },
      true
    );
  };

  const enhanceProductCarousel = () => {
    const media = $(".detail-media");
    if (!media || media.dataset.carouselReady) return;

    media.dataset.carouselReady = "true";

    const label = document.createElement("span");
    label.className = "detail-carousel-label";
    label.textContent = "Карусель скриншотов";
    media.append(label);

    const makeButton = (direction, text) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `detail-carousel-nav detail-carousel-nav--${direction}`;
      button.textContent = text;
      button.addEventListener("click", () => {
        const thumbs = $$(".gallery-thumbs button", media);
        if (!thumbs.length) return;
        const activeIndex = Math.max(0, thumbs.findIndex((thumb) => thumb.classList.contains("is-active")));
        const nextIndex = direction === "next"
          ? (activeIndex + 1) % thumbs.length
          : (activeIndex - 1 + thumbs.length) % thumbs.length;
        thumbs[nextIndex].click();
        saveEvent("product_gallery_switch", { direction, index: nextIndex });
      });
      media.append(button);
    };

    makeButton("prev", "‹");
    makeButton("next", "›");
  };

  const enhancePreorder = () => {
    const preorder = $("#preorders .preorder-banner > div");
    if (!preorder || $(".preorder-terms", preorder)) return;

    const terms = document.createElement("div");
    terms.className = "preorder-terms";
    terms.innerHTML = `
      <button class="preorder-term is-selected" type="button" data-preorder-mode="reserve">
        <strong>Бронь без оплаты</strong>
        <span>Фиксируем бонус и связываемся перед релизом.</span>
      </button>
      <button class="preorder-term" type="button" data-preorder-mode="partial">
        <strong>Частичная оплата 30%</strong>
        <span>Остаток после подтверждения даты выдачи.</span>
      </button>
    `;

    preorder.insertBefore(terms, preorder.querySelector(".timer")?.nextSibling || preorder.firstChild);

    $$(".preorder-term", terms).forEach((button) => {
      button.addEventListener("click", () => {
        $$(".preorder-term", terms).forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");
        saveEvent("preorder_mode_select", { mode: button.dataset.preorderMode });
      });
    });
  };

  const getCurrentFilterSummary = () => {
    const values = $$("select").map((select) => select.value).filter(Boolean);
    const price = $('input[type="range"]')?.value;
    return [...new Set([...values, price ? `до ${price} ₽` : ""])].filter(Boolean).join(" · ") || "Поиск без фильтров";
  };

  const bindSavedSearch = () => {
    if (document.documentElement.dataset.savedSearchBound) return;
    document.documentElement.dataset.savedSearchBound = "true";

    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, a");
      if (!target) return;

      if (/Сохранить поиск/i.test(getText(target))) {
        const saved = {
          summary: getCurrentFilterSummary(),
          savedAt: new Date().toLocaleString("ru-RU"),
        };
        localStorage.setItem(SAVED_SEARCH_STORE, JSON.stringify(saved));
        saveEvent("save_search_to_account", saved);
      }
    });
  };

  const bindAdaptiveCursorOverride = () => {
    if (document.documentElement.dataset.adaptiveCursorBound) return;
    document.documentElement.dataset.adaptiveCursorBound = "true";

    const cyan = { red: 116, green: 244, blue: 223, alpha: 1 };
    const ink = { red: 7, green: 16, blue: 14, alpha: 1 };
    const fallbackSurface = { red: 12, green: 13, blue: 10, alpha: 1 };
    const editableSelector = [
      "textarea",
      "input:not([type])",
      "input[type='text']",
      "input[type='search']",
      "input[type='email']",
      "input[type='tel']",
      "input[type='url']",
      "input[type='password']",
      "input[type='number']",
      "[contenteditable='true']"
    ].join(",");
    const selectableSelector = [
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "li",
      "dt",
      "dd",
      "label",
      "small",
      "strong",
      "em",
      "b",
      "span:not(.target-cursor__dot):not(.target-cursor__external-icon)"
    ].join(",");

    let lastPoint = { x: 0, y: 0 };
    let pointerDown = false;
    let dragMaySelectText = false;
    let textSelecting = false;
    let downPoint = { x: 0, y: 0 };
    let frame = 0;

    const parseColor = (value) => {
      if (!value || value === "transparent") return null;
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;

      const parts = match[1]
        .split(",")
        .map((part) => part.trim())
        .map((part) => part.endsWith("%") ? (Number(part.slice(0, -1)) / 100) * 255 : Number(part));

      if (parts.length < 3 || parts.some((part) => Number.isNaN(part))) return null;

      return {
        red: parts[0],
        green: parts[1],
        blue: parts[2],
        alpha: parts[3] === undefined ? 1 : Math.max(0, Math.min(1, parts[3])),
      };
    };

    const blend = (foreground, background) => {
      const alpha = foreground.alpha + background.alpha * (1 - foreground.alpha);
      if (!alpha) return { ...background };

      return {
        red: (foreground.red * foreground.alpha + background.red * background.alpha * (1 - foreground.alpha)) / alpha,
        green: (foreground.green * foreground.alpha + background.green * background.alpha * (1 - foreground.alpha)) / alpha,
        blue: (foreground.blue * foreground.alpha + background.blue * background.alpha * (1 - foreground.alpha)) / alpha,
        alpha,
      };
    };

    const luminance = (color) => {
      const channel = (value) => {
        const normalized = value / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      };

      return 0.2126 * channel(color.red) + 0.7152 * channel(color.green) + 0.0722 * channel(color.blue);
    };

    const readSurfaceColor = (target) => {
      let surface = fallbackSurface;
      let node = target instanceof Element ? target : null;

      while (node && node !== document.documentElement) {
        const styles = getComputedStyle(node);
        const background = parseColor(styles.backgroundColor);

        if (background && background.alpha > 0) {
          surface = blend(background, surface);
          if (background.alpha > 0.96) break;
        }

        node = node.parentElement;
      }

      return surface;
    };

    const colorForSurface = (surface) => {
      const brightSurface = luminance(surface) > 0.48;
      const color = brightSurface ? ink : cyan;
      const shadow = brightSurface
        ? "rgba(7, 16, 14, 0.34)"
        : "rgba(116, 244, 223, 0.44)";

      return {
        color: `rgb(${Math.round(color.red)} ${Math.round(color.green)} ${Math.round(color.blue)})`,
        shadow,
      };
    };

    const isEditable = (target) => target instanceof Element && !!target.closest(editableSelector);

    const canDragSelectText = (target) => {
      if (!(target instanceof Element)) return false;
      if (target.closest("button, a[href], input, textarea, select, [contenteditable='true']")) return false;
      return !!target.closest(selectableSelector);
    };

    const hasLiveSelection = () => {
      const selection = window.getSelection?.();
      return !!selection && !selection.isCollapsed && String(selection).trim().length > 0;
    };

    const apply = () => {
      frame = 0;

      const cursor = $(".target-cursor");
      if (!cursor) return;

      const target = document.elementFromPoint(lastPoint.x, lastPoint.y);
      const surface = readSurfaceColor(target);
      const { color, shadow } = colorForSurface(surface);
      const shouldUseTextMode = isEditable(target) || (pointerDown && textSelecting) || (pointerDown && hasLiveSelection());

      cursor.style.setProperty("--cursor-color", color);
      cursor.style.setProperty("--cursor-shadow", shadow);
      cursor.style.setProperty("--playz-cursor-color", color);
      cursor.style.setProperty("--playz-cursor-shadow", shadow);
      cursor.classList.toggle("is-text", shouldUseTextMode);
      cursor.classList.toggle("playz-text-mode", shouldUseTextMode);
      cursor.classList.toggle("playz-dot-mode", !shouldUseTextMode);
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    document.addEventListener(
      "pointerdown",
      (event) => {
        if (event.button && event.button !== 0) return;
        pointerDown = true;
        textSelecting = false;
        downPoint = { x: event.clientX, y: event.clientY };
        dragMaySelectText = canDragSelectText(event.target);
        lastPoint = { x: event.clientX, y: event.clientY };
        schedule();
      },
      true
    );

    document.addEventListener(
      "pointermove",
      (event) => {
        lastPoint = { x: event.clientX, y: event.clientY };

        if (pointerDown && dragMaySelectText) {
          const distance = Math.hypot(event.clientX - downPoint.x, event.clientY - downPoint.y);
          textSelecting = distance > 4;
        }

        schedule();
      },
      true
    );

    const endPointerSelection = (event) => {
      pointerDown = false;
      dragMaySelectText = false;
      textSelecting = false;

      if (event?.clientX !== undefined) {
        lastPoint = { x: event.clientX, y: event.clientY };
      }

      schedule();
    };

    document.addEventListener("pointerup", endPointerSelection, true);
    document.addEventListener("pointercancel", endPointerSelection, true);
    document.addEventListener("selectstart", () => {
      if (pointerDown) {
        textSelecting = true;
        schedule();
      }
    }, true);
    document.addEventListener("selectionchange", () => {
      if (!pointerDown && textSelecting) {
        textSelecting = false;
        schedule();
      }
    });
  };

  const bindGlobalPressFeedback = () => {
    if (document.documentElement.dataset.pressFeedbackBound) return;
    document.documentElement.dataset.pressFeedbackBound = "true";

    const selector = [
      "button",
      "a.button",
      "a.icon-button",
      ".footer a",
      ".community-links a",
      ".event-row a",
      ".map-block a",
      ".trailer-preview",
      ".faq-link",
      ".brand",
      ".genre-scroll",
      ".preorder-term"
    ].join(",");

    const getPressable = (target) => {
      if (!(target instanceof Element)) return null;
      const pressable = target.closest(selector);
      if (!pressable) return null;
      if (pressable.matches(":disabled,[aria-disabled='true']")) return null;
      return pressable;
    };

    const activePressables = new Set();

    const release = (element) => {
      if (!element) return;
      element.classList.remove("is-pressing");
      activePressables.delete(element);
    };

    const releaseAll = () => {
      activePressables.forEach((element) => element.classList.remove("is-pressing"));
      activePressables.clear();
    };

    const markClicked = (element) => {
      if (!element) return;
      element.classList.remove("is-clicked");
      void element.offsetWidth;
      element.classList.add("is-clicked");
      window.setTimeout(() => element.classList.remove("is-clicked"), 320);
    };

    document.addEventListener("pointerdown", (event) => {
      if (event.button && event.button !== 0) return;
      const pressable = getPressable(event.target);
      if (!pressable) return;
      pressable.classList.add("playz-pressable", "is-pressing");
      pressable.dataset.pointerId = String(event.pointerId);
      activePressables.add(pressable);
    }, true);

    document.addEventListener("pointerup", (event) => {
      const pressable = getPressable(event.target);
      releaseAll();
      if (pressable) markClicked(pressable);
    }, true);

    document.addEventListener("pointercancel", (event) => {
      releaseAll();
    }, true);

    document.addEventListener("pointerleave", (event) => {
      release(getPressable(event.target));
    }, true);

    window.addEventListener("blur", releaseAll);

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const pressable = getPressable(event.target);
      if (!pressable) return;
      pressable.classList.add("playz-pressable", "is-pressing");
      activePressables.add(pressable);
    }, true);

    document.addEventListener("keyup", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const pressable = getPressable(event.target);
      if (!pressable) return;
      release(pressable);
      markClicked(pressable);
    }, true);

    const markExisting = () => {
      $$(selector).forEach((element) => element.classList.add("playz-pressable"));
    };

    markExisting();
    return markExisting;
  };

  const enhanceAccount = () => {
    const profile = $('button[aria-label="Профиль"]');
    if (!profile || profile.dataset.accountReady) return;
    profile.dataset.accountReady = "true";

    profile.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      $(".account-panel")?.remove();

      let saved = null;
      try {
        saved = JSON.parse(localStorage.getItem(SAVED_SEARCH_STORE) || "null");
      } catch {}

      const panel = document.createElement("aside");
      panel.className = "account-panel";
      panel.innerHTML = `
        <button class="icon-button account-panel__close" type="button" aria-label="Закрыть">×</button>
        <h3>Личный кабинет</h3>
        <p><strong>Сохранённый поиск</strong><br>${saved ? saved.summary : "Пока ничего не сохранено."}</p>
        <p>${saved ? `Сохранено: ${saved.savedAt}` : "Нажмите «Сохранить поиск» в фильтрах."}</p>
      `;

      $(".account-panel__close", panel).addEventListener("click", () => panel.remove());
      document.body.append(panel);
      saveEvent("account_panel_open");
    }, true);
  };

  const enhanceCheckout = () => {
    if (document.documentElement.dataset.checkoutBound) return;
    document.documentElement.dataset.checkoutBound = "true";

    document.addEventListener(
      "click",
      async (event) => {
        const button = event.target.closest("button");
        if (!button || !button.closest(".cart-drawer")) return;
        if (!/Заказ|Оформ|Оплат/i.test(getText(button))) return;

        const items = $$(".cart-item").map((item) => getText(item)).filter(Boolean);
        try {
          await postJson("/api/order", {
            items,
            source: "playz-cart",
            paymentCheck: "manual_review",
            createdAt: new Date().toISOString(),
          });
          saveEvent("checkout_order_server", { status: "submitted", items: items.length });
        } catch {
          saveEvent("checkout_order_server", { status: "local_fallback", items: items.length });
        }
      },
      true
    );
  };

  const enhanceMapLink = () => {
    const link = $(".map-block a");
    if (!link || link.dataset.mapLinkReady) return;
    link.dataset.mapLinkReady = "true";
    link.remove();
  };

  const enhancePaymentLabels = () => {
    const icons = {
      visa: `
        <svg class="payment-service__mark" viewBox="0 0 88 36" aria-hidden="true" focusable="false">
          <text x="4" y="25" fill="#1f2b5d" font-family="Arial Black, Arial, sans-serif" font-size="25" font-style="italic" font-weight="900" letter-spacing="-1.6">VISA</text>
        </svg>
      `,
      mir: `
        <svg class="payment-service__mark" viewBox="0 0 88 36" aria-hidden="true" focusable="false">
          <text x="2" y="25" fill="#24464d" font-family="Arial Black, Arial, sans-serif" font-size="25" font-weight="900" letter-spacing="-1.4">МИР</text>
          <path d="M71 8h11l-6.7 8.3H64.4L71 8Z" fill="#8ebf6b"/>
          <path d="M74.8 16.3h8.4l-5 6.2h-8.3l4.9-6.2Z" fill="#b96cae"/>
        </svg>
      `,
      sbp: `
        <svg class="payment-service__mark" viewBox="0 0 44 44" aria-hidden="true" focusable="false">
          <path fill="#4f978c" d="M9 7l13 7.5L9 22V7Z"/>
          <path fill="#8ebf6b" d="M9 22l13 7.5L9 37V22Z"/>
          <path fill="#6a8dbd" d="M22 14.5 35 22l-13 7.5v-15Z"/>
          <path fill="#b96cae" d="M22 7l13 7.5-13 7.5V7Z"/>
        </svg>
      `
    };

    $$(".payment-icons span").forEach((item) => {
      const rawLabel = getText(item);
      const key = item.dataset.paymentIcon || (rawLabel.toLowerCase().includes("visa")
        ? "visa"
        : rawLabel.toLowerCase().includes("мир")
          ? "mir"
          : rawLabel.toLowerCase().includes("сбп")
            ? "sbp"
            : "");
      const label = key === "visa" ? "Visa" : key === "mir" ? "МИР" : key === "sbp" ? "СБП" : rawLabel;
      item.title = `Оплата: ${label}`;
      item.setAttribute("aria-label", `Оплата: ${label}`);
      if (key && item.dataset.paymentIcon !== key) {
        item.dataset.paymentIcon = key;
        item.classList.add("payment-service", `payment-service--${key}`);
        item.innerHTML = icons[key];
      }
    });
  };

  const enhanceFeaturedTrailers = () => {
    $$(".product-card .trailer-preview").forEach((link) => {
      link.setAttribute("data-external", "true");
      link.addEventListener("click", () => saveEvent("trailer_link_click", { href: link.href }));
    });
  };

  const runEnhancements = () => {
    enhanceLegalLinks();
    enhanceProductCarousel();
    enhancePreorder();
    enhanceAccount();
    enhanceMapLink();
    enhancePaymentLabels();
    enhanceFeaturedTrailers();
  };

  const boot = () => {
    bootAnalyticsVendors();
    setAbVariant();
    bindScrollMemory();
    bindGlobalPressFeedback();
    bindServerForms();
    bindSavedSearch();
    bindLegalModalCloseGuard();
    bindAdaptiveCursorOverride();
    enhanceCheckout();
    runEnhancements();
    restoreReloadScroll();

    const observer = new MutationObserver(() => {
      if (observer.scheduled) return;
      observer.scheduled = true;
      requestAnimationFrame(() => {
        observer.scheduled = false;
        runEnhancements();
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
