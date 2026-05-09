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

      requestAnimationFrame(() => {
        window.scrollTo({ top: y, left: 0, behavior: "smooth" });
        if (targetHash) {
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${window.location.search}${targetHash}`
          );
        }
      });
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
    const map = {
      "Оферта": "/offer.html",
      "Политика": "/privacy.html",
    };

    $$(".footer nav:not(.footer-menu) button").forEach((button) => {
      const label = getText(button);
      const href = map[label];
      if (!href) return;

      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      link.className = button.className;
      button.replaceWith(link);
    });
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

  const enhancePaymentLabels = () => {
    const icons = {
      visa: `
        <svg class="payment-service__mark" viewBox="0 0 84 44" aria-hidden="true" focusable="false">
          <rect x="1" y="1" width="82" height="42" rx="9" fill="#f6f7ff"/>
          <path fill="#19244f" d="M23.9 29.3h-5.1l3.2-14.6h5.1l-3.2 14.6Zm18.5-14.2c-1-.4-2.5-.8-4.3-.8-4.7 0-8 2.3-8 5.6 0 2.5 2.4 3.8 4.2 4.6 1.9.9 2.5 1.4 2.5 2.2 0 1.2-1.5 1.7-3 1.7-2 0-3.1-.3-4.7-1l-.7-.3-.7 4.1c1.1.5 3.2.9 5.3 1 5 0 8.2-2.3 8.3-5.9 0-1.9-1.2-3.4-4-4.6-1.7-.8-2.7-1.3-2.7-2.1 0-.7.9-1.5 2.8-1.5 1.6 0 2.8.3 3.7.7l.4.2.9-3.9Zm13.1-.4h-4c-1.2 0-2.2.3-2.7 1.5L41 29.3h5.3l1.1-2.8h6.5l.6 2.8h4.7l-3.7-14.6Zm-6.6 8 2.7-6.6 1.5 6.6h-4.2Zm-34.4-8-5 10-2.1-9.7c-.2-1.1-1.1-1.4-2.1-1.4H1.2l-.1.4c1 .2 2.1.6 2.8 1 1.7.9 2.1 1.7 2.4 3l3.9 11.3h5.4l8-14.6h-5.1Z"/>
        </svg>
      `,
      mir: `
        <svg class="payment-service__mark" viewBox="0 0 76 44" aria-hidden="true" focusable="false">
          <rect x="1" y="1" width="74" height="42" rx="9" fill="#f6f7ff"/>
          <path fill="#74f4df" d="M13 14h8.7c1.4 0 2.7.9 3.1 2.2l2 6.2 4-8.4h6.5v16h-4.5v-9.2l-4.6 9.2h-3.5l-3-9.2V30H17V18.2h-4V14Z"/>
          <path fill="#e9ff68" d="M41 14h9.7c4.6 0 8.3 3.5 8.3 8s-3.7 8-8.3 8H41V14Zm4.8 4.2v7.6h4.6c2.2 0 3.8-1.6 3.8-3.8s-1.6-3.8-3.8-3.8h-4.6Z"/>
          <path fill="#ff4ec7" d="M58 14h7l-4.1 5.7H55L58 14Z"/>
        </svg>
      `,
      sbp: `
        <svg class="payment-service__mark" viewBox="0 0 44 44" aria-hidden="true" focusable="false">
          <rect x="1" y="1" width="42" height="42" rx="9" fill="#f6f7ff"/>
          <path fill="#74f4df" d="M13 8l12 7-12 7V8Z"/>
          <path fill="#e9ff68" d="M13 22l12 7-12 7V22Z"/>
          <path fill="#ff4ec7" d="M25 15l8 5-8 5V15Z"/>
          <path fill="#f5f4ec" d="M25 25l8 5-8 5V25Z"/>
        </svg>
      `
    };

    $$(".payment-icons span").forEach((item) => {
      const label = getText(item);
      const key = label.toLowerCase().includes("visa")
        ? "visa"
        : label.toLowerCase().includes("мир")
          ? "mir"
          : label.toLowerCase().includes("сбп")
            ? "sbp"
            : "";
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
