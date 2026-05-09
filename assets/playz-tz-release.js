(() => {
  const EVENT_STORE = "playz_events";
  const SAVED_SEARCH_STORE = "playz_saved_search";
  const AB_STORE = "playz_ab_cta";

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
    $$(".payment-icons span").forEach((item) => {
      const label = getText(item);
      item.title = `Оплата: ${label}`;
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
    bindServerForms();
    bindSavedSearch();
    enhanceCheckout();
    runEnhancements();

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
