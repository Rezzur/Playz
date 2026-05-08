import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  CreditCard,
  Filter,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Search,
  Send,
  ShoppingCart,
  Star,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';

const navItems = [
  ['Каталог', '#catalog'],
  ['Хиты', '#hits'],
  ['Предзаказы', '#preorders'],
  ['Поддержка', '#support'],
];

const products = [
  {
    id: 'among-us',
    title: 'Among Us',
    image: '/images/among-us.jpeg',
    genre: 'Indie',
    platform: 'Steam',
    language: 'RU/EN',
    rating: 4.8,
    price: 249,
    oldPrice: 499,
    discount: '-50%',
    localization: true,
    exclusive: false,
    stock: 'В наличии',
    delivery: '2 минуты',
    region: 'РФ/СНГ',
    description: 'Ключ Steam для быстрых партий с друзьями. Подходит для слабых ПК и вечеринок.',
    features: ['Steam-ключ', 'Онлайн до 15 игроков', 'Низкие требования'],
    activation: 'Steam, регион РФ/СНГ',
    min: 'Windows 10, 4 GB RAM, Intel HD',
    rec: 'Windows 11, 8 GB RAM, дискретная графика',
  },
  {
    id: 'apex',
    title: 'Apex Legends',
    image: '/images/apex-legends.jpeg',
    genre: 'Action',
    platform: 'EA App',
    language: 'RU/EN',
    rating: 4.7,
    price: 690,
    oldPrice: 1190,
    discount: '-42%',
    localization: true,
    exclusive: false,
    stock: 'DLC и монеты',
    delivery: '5 минут',
    region: 'РФ/СНГ',
    description: 'Код EA App для сезонных наборов и быстрого старта в королевской битве.',
    features: ['EA App', 'Сезонные наборы', 'Поддержка активации'],
    activation: 'EA App код, без VPN',
    min: 'Windows 10, 6 GB RAM, GTX 640',
    rec: 'Windows 11, 8 GB RAM, GTX 970',
  },
  {
    id: 'hitman',
    title: 'Hitman Definitive Edition',
    image: '/images/hitman.jpeg',
    genre: 'Action',
    platform: 'Steam',
    language: 'EN',
    rating: 4.6,
    price: 1290,
    oldPrice: 2490,
    discount: '-48%',
    localization: false,
    exclusive: true,
    stock: 'Осталось 8',
    delivery: '2 минуты',
    region: 'Global',
    description: 'Стелс-песочница с набором миссий и испытаний. Редкая поставка по сниженной цене.',
    features: ['Steam-ключ', 'Глобальная версия', 'Редкая поставка'],
    activation: 'Steam ключ, глобальная версия',
    min: 'Windows 10, 8 GB RAM, GTX 660',
    rec: 'Windows 11, 16 GB RAM, GTX 1070',
  },
  {
    id: 'dota',
    title: 'Dota 2 Bundle',
    image: '/images/dota-2.jpeg?v=2',
    genre: 'Strategy',
    platform: 'Steam',
    language: 'RU/EN',
    rating: 4.9,
    price: 390,
    oldPrice: 790,
    discount: '-51%',
    localization: true,
    exclusive: false,
    stock: 'Боевой набор',
    delivery: '1 минута',
    region: 'РФ/СНГ',
    description: 'Подарочный код с внутриигровым контентом для турниров и вечерних матчей.',
    features: ['Steam-подарок', 'Внутриигровой контент', 'Моментальная выдача'],
    activation: 'Steam подарок или код',
    min: 'Windows 10, 4 GB RAM, DX11',
    rec: 'Windows 11, 8 GB RAM, SSD',
  },
  {
    id: 'gta',
    title: 'Grand Theft Auto V',
    image: '/images/gta-v.jpeg',
    genre: 'Action',
    platform: 'Rockstar',
    language: 'RU/EN',
    rating: 4.9,
    price: 1490,
    oldPrice: 2990,
    discount: '-50%',
    localization: true,
    exclusive: false,
    stock: 'В наличии',
    delivery: '3 минуты',
    region: 'РФ/СНГ',
    description: 'Код Rockstar для сюжетной кампании и GTA Online. Русские субтитры включены.',
    features: ['Rockstar Social Club', 'Сюжет + Online', 'Русские субтитры'],
    activation: 'Rockstar Social Club, регион РФ/СНГ',
    min: 'Windows 10, 8 GB RAM, GTX 660',
    rec: 'Windows 11, 16 GB RAM, RTX 2060',
  },
  {
    id: 'cs2',
    title: 'Counter-Strike 2 Prime',
    image: '/images/counter-strike-2.jpeg',
    genre: 'Action',
    platform: 'Steam',
    language: 'RU/EN',
    rating: 4.7,
    price: 1190,
    oldPrice: 1690,
    discount: '-30%',
    localization: true,
    exclusive: false,
    stock: 'Prime статус',
    delivery: '2 минуты',
    region: 'РФ/СНГ',
    description: 'Prime-статус для соревновательных матчей, инвентаря и стабильного матчмейкинга.',
    features: ['Steam', 'Prime-матчи', 'Поддержка установки'],
    activation: 'Steam, регион РФ/СНГ',
    min: 'Windows 10, 8 GB RAM, GTX 750 Ti',
    rec: 'Windows 11, 16 GB RAM, GTX 1060',
  },
  {
    id: 'portal',
    title: 'Portal 2',
    image: '/images/portal-2.jpeg',
    genre: 'Puzzle',
    platform: 'Steam',
    language: 'RU/EN',
    rating: 4.9,
    price: 199,
    oldPrice: 599,
    discount: '-67%',
    localization: true,
    exclusive: false,
    stock: 'В наличии',
    delivery: '1 минута',
    region: 'Global',
    description: 'Легендарные головоломки, кооператив и русская озвучка в одном Steam-ключе.',
    features: ['Steam-ключ', 'Кооп-кампания', 'Русская озвучка'],
    activation: 'Steam ключ, глобальная версия',
    min: 'Windows 10, 4 GB RAM, Intel HD',
    rec: 'Windows 11, 8 GB RAM, GTX 750',
  },
  {
    id: 'forza',
    title: 'Forza Horizon',
    image: '/images/forza-horizon.jpeg',
    genre: 'Sports',
    platform: 'Xbox PC',
    language: 'RU/EN',
    rating: 4.8,
    price: 2390,
    oldPrice: 3990,
    discount: '-40%',
    localization: true,
    exclusive: true,
    stock: 'Цифровой код',
    delivery: '5 минут',
    region: 'РФ/СНГ',
    description: 'Цифровой код Microsoft Store для гонок, сезонов и игры с геймпадом.',
    features: ['Xbox PC', 'Открытый мир', 'Поддержка геймпада'],
    activation: 'Microsoft Store / Xbox PC',
    min: 'Windows 10, 8 GB RAM, GTX 970',
    rec: 'Windows 11, 16 GB RAM, RTX 2060',
  },
  {
    id: 'war-thunder',
    title: 'War Thunder Pack',
    image: '/images/war-thunder.jpeg',
    genre: 'Sim',
    platform: 'Gaijin',
    language: 'RU/EN',
    rating: 4.5,
    price: 990,
    oldPrice: 1690,
    discount: '-41%',
    localization: true,
    exclusive: false,
    stock: 'Премиум набор',
    delivery: '3 минуты',
    region: 'РФ/СНГ',
    description: 'Премиум техника, валюта и дни аккаунта для воздушных и наземных боёв.',
    features: ['Gaijin-код', 'Премиум-дни', 'Техника и валюта'],
    activation: 'Gaijin код, регион РФ/СНГ',
    min: 'Windows 10, 4 GB RAM, GTX 660',
    rec: 'Windows 11, 16 GB RAM, GTX 1060',
  },
  {
    id: 'pubg',
    title: 'PUBG Pack',
    image: '/images/pubg.jpeg',
    genre: 'Action',
    platform: 'Steam',
    language: 'RU/EN',
    rating: 4.6,
    price: 790,
    oldPrice: 1290,
    discount: '-39%',
    localization: true,
    exclusive: false,
    stock: 'Набор выжившего',
    delivery: '4 минуты',
    region: 'РФ/СНГ',
    description: 'Код со скинами и валютой для королевской битвы. Подходит для подарка команде.',
    features: ['Steam-код', 'Скины и валюта', 'Боевой набор'],
    activation: 'Steam код, регион РФ/СНГ',
    min: 'Windows 10, 8 GB RAM, GTX 960',
    rec: 'Windows 11, 16 GB RAM, GTX 1660',
  },
];

const genres = [
  { name: 'Action', copy: 'Шутеры, открытые миры, Prime и боевые наборы.', picks: ['GTA V', 'CS2', 'Apex'] },
  { name: 'Indie', copy: 'Короткие сессии, кооп и игры для компании.', picks: ['Among Us', 'Portal 2'] },
  { name: 'Strategy', copy: 'MOBA, турниры и внутриигровые наборы.', picks: ['Dota 2', 'War Thunder'] },
  { name: 'Sim', copy: 'Техника, авиация и премиум-аккаунты.', picks: ['War Thunder', 'Forza'] },
  { name: 'Sports', copy: 'Гонки, сезоны и геймпадные вечера.', picks: ['Forza Horizon'] },
  { name: 'Puzzle', copy: 'Кооп-головоломки и спокойный вечер.', picks: ['Portal 2'] },
];

const events = [
  { date: '18 мая', title: 'CS2 вечер', text: 'Prime-розыгрыш, быстрые команды и голосовой чат Playz.' },
  { date: '24 мая', title: 'Forza заезд', text: 'Онлайн-гонка, таблица результатов и промокоды победителям.' },
  { date: '31 мая', title: 'Мини-турнир', text: 'Регистрация в Telegram, финалы у нас в Воронеже.' },
];

const reviews = [
  { name: 'Артём', rating: 5, text: 'Ключ пришёл сразу. Поддержка помогла активировать Steam без лишней переписки.' },
  { name: 'Марина', rating: 5, text: 'Взяла Forza со скидкой, код получила на почту за пару минут.' },
  { name: 'Данил', rating: 4, text: 'Нравится, что сразу видно регион, платформу и срок выдачи.' },
];

const faqItems = [
  ['Когда приходит ключ?', 'Большинство цифровых кодов выдаём за 1-5 минут после оплаты. Если нужен ручной выпуск, предупреждаем до покупки.'],
  ['Где активировать игру?', 'В карточке указана площадка: Steam, EA App, Rockstar, Microsoft Store или Gaijin.'],
  ['Что с регионом?', 'Регион указан рядом с ценой. Если ключ не подходит по региону и не был активирован, поддержка проверит замену.'],
  ['Можно вернуть ключ?', 'Неактивированный ключ можно заменить или вернуть после проверки обращения. Активированные ключи площадки обычно не принимают назад.'],
  ['Какие способы оплаты?', 'Для прототипа платежей нет. В рабочей версии нужны карты, СБП и проверка платежа перед выдачей ключа.'],
  ['Есть офлайн-точка?', 'Да, контакты и адрес указаны ниже: Воронеж, ул. Челюскинцев 101б.'],
];

const platforms = ['Все', ...Array.from(new Set(products.map((product) => product.platform)))];
const genreOptions = ['Все', ...Array.from(new Set(products.map((product) => product.genre)))];
const heroProduct = products.find((product) => product.id === 'gta');
const preorderProduct = products.find((product) => product.id === 'forza');

function trackEvent(name, payload = {}) {
  window.__playzEvents = window.__playzEvents || [];
  window.__playzEvents.push({ name, payload, at: new Date().toISOString() });
}

function formatPrice(value) {
  return `${value.toLocaleString('ru-RU')} ₽`;
}

function useCountdown(targetDate) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const distance = Math.max(0, targetDate - now);
  return {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance % 86400000) / 3600000),
    minutes: Math.floor((distance % 3600000) / 60000),
  };
}

function MotionSection({ id, className = '', children }) {
  return (
    <section
      id={id}
      className={`section ${className}`}
    >
      {children}
    </section>
  );
}

function TargetCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: -80, y: -80 });
  const [cursorStyle, setCursorStyle] = useState({
    color: '#74f4df',
    shadow: 'rgba(116, 244, 223, 0.44)',
    onControl: false,
  });

  useEffect(() => {
    const canUseCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      && !window.matchMedia('(pointer: coarse)').matches
      && navigator.maxTouchPoints === 0;
    if (!canUseCursor) return undefined;

    const controlSelector = [
      'a',
      'button',
      'input',
      'select',
      'textarea',
      'summary',
      '[role="button"]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const parseRgb = (value) => {
      const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!match || Number(match[4] ?? 1) < 0.08) return null;
      return [Number(match[1]), Number(match[2]), Number(match[3])];
    };

    const getSurfaceColor = (element) => {
      let node = element;
      while (node && node !== document.documentElement) {
        const color = parseRgb(window.getComputedStyle(node).backgroundColor);
        if (color) return color;
        node = node.parentElement;
      }
      return [12, 13, 10];
    };

    const getAdaptiveStyle = (target) => {
      if (!target) {
        return { color: '#74f4df', shadow: 'rgba(116, 244, 223, 0.44)', onControl: false };
      }

      const [red, green, blue] = getSurfaceColor(target);
      const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
      return luminance > 0.52
        ? { color: '#0c0d0a', shadow: 'rgba(12, 13, 10, 0.32)', onControl: true }
        : { color: '#f5f4ec', shadow: 'rgba(245, 244, 236, 0.34)', onControl: true };
    };

    const handlePointerMove = (event) => {
      setVisible(true);
      setPosition({ x: event.clientX, y: event.clientY });
      const target = event.target instanceof Element ? event.target.closest(controlSelector) : null;
      const nextStyle = getAdaptiveStyle(target);
      setCursorStyle((current) => (
        current.color === nextStyle.color && current.onControl === nextStyle.onControl ? current : nextStyle
      ));
    };

    const handleMouseLeave = () => {
      setVisible(false);
      setCursorStyle({ color: '#74f4df', shadow: 'rgba(116, 244, 223, 0.44)', onControl: false });
    };

    document.documentElement.classList.add('has-target-cursor');
    setEnabled(true);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.documentElement.classList.remove('has-target-cursor');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className={`target-cursor ${visible ? 'is-visible' : ''} ${cursorStyle.onControl ? 'is-on-control' : ''}`}
      style={{ '--cursor-color': cursorStyle.color, '--cursor-shadow': cursorStyle.shadow }}
      aria-hidden="true"
    >
      <span
        className="target-cursor__dot"
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
      />
    </div>
  );
}

function Header({ cartCount, onCartOpen, onSubscribe, filters, setFilters, filteredCount, onSaveSearch, savedSearch }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const headerSearchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    window.requestAnimationFrame(() => headerSearchRef.current?.focus());
  }, [searchOpen]);

  const closeMenu = () => setMenuOpen(false);
  const closeSearch = () => setSearchOpen(false);
  const submitHeaderSearch = (event) => {
    event.preventDefault();
    trackEvent('header_search_submit', { query: filters.query });
    document.querySelector('#catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${searchOpen ? 'has-open-search' : ''}`}>
      <a className="brand" href="#home" aria-label="Playz, наверх" onClick={closeMenu}>
        <img src="/images/logo-playz.jpeg" alt="Playz" width="48" height="48" />
        <span>Playz</span>
      </a>
      <button className="icon-button mobile-menu" type="button" aria-label="Открыть меню" onClick={() => setMenuOpen(true)}>
        <Menu size={24} />
      </button>
      <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Основная навигация">
        <button className="icon-button nav-close" type="button" aria-label="Закрыть меню" onClick={closeMenu}>
          <X size={24} />
        </button>
        {navItems.map(([label, href]) => (
          <a key={href} href={href} onClick={closeMenu}>
            {label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <button
          className={`icon-button search-trigger ${searchOpen ? 'is-active' : ''}`}
          type="button"
          aria-label={searchOpen ? 'Закрыть поиск' : 'Открыть поиск'}
          aria-expanded={searchOpen}
          onClick={() => setSearchOpen((current) => !current)}
        >
          <Search size={21} />
        </button>
        <button className="icon-button cart-button" type="button" aria-label={`Корзина, товаров: ${cartCount}`} onClick={onCartOpen}>
          <ShoppingCart size={21} />
          <span>{cartCount}</span>
        </button>
        <button className="icon-button profile-button" type="button" aria-label="Профиль" onClick={onSubscribe}>
          <UserRound size={21} />
        </button>
      </div>
      <AnimatePresence>
        {searchOpen ? (
          <motion.form
            className="header-search"
            onSubmit={submitHeaderSearch}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="header-search__top">
              <Search size={21} />
              <input
                ref={headerSearchRef}
                type="search"
                value={filters.query}
                onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') closeSearch();
                }}
                placeholder="Поиск по играм, платформам и жанрам"
                aria-label="Поиск по каталогу"
              />
              <button className="header-search__submit" type="submit">Найти</button>
              <button className="icon-button header-search__close" type="button" aria-label="Закрыть поиск" onClick={closeSearch}>
                <X size={20} />
              </button>
            </div>
            <div className="header-filter-row">
              <label>
                Платформа
                <select value={filters.platform} onChange={(event) => setFilters((current) => ({ ...current, platform: event.target.value }))}>
                  {platforms.map((platform) => <option key={platform}>{platform}</option>)}
                </select>
              </label>
              <label>
                Жанр
                <select value={filters.genre} onChange={(event) => setFilters((current) => ({ ...current, genre: event.target.value }))}>
                  {genreOptions.map((genre) => <option key={genre}>{genre}</option>)}
                </select>
              </label>
              <label>
                До {formatPrice(filters.maxPrice)}
                <input
                  type="range"
                  min="200"
                  max="4200"
                  step="100"
                  value={filters.maxPrice}
                  onChange={(event) => setFilters((current) => ({ ...current, maxPrice: Number(event.target.value) }))}
                />
              </label>
            </div>
            <div className="header-filter-row header-filter-row--meta">
              <label className="switch-row">
                <input
                  type="checkbox"
                  checked={filters.localized}
                  onChange={(event) => setFilters((current) => ({ ...current, localized: event.target.checked }))}
                />
                Русская локализация
              </label>
              <label className="switch-row">
                <input
                  type="checkbox"
                  checked={filters.exclusive}
                  onChange={(event) => setFilters((current) => ({ ...current, exclusive: event.target.checked }))}
                />
                Редкие ключи
              </label>
              <button className="text-button" type="button" onClick={onSaveSearch}>
                {savedSearch ? 'Поиск сохранён' : 'Сохранить поиск'}
              </button>
              <span className="result-count">
                <Filter size={18} /> {filteredCount} позиций
              </span>
            </div>
          </motion.form>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function Hero({ onAdd, onSubscribe }) {
  const quickItems = products.filter((product) => ['cs2', 'portal', 'forza'].includes(product.id));

  return (
    <section id="home" className="hero">
      <div className="hero-layout">
        <div className="hero-copy">
          <p className="site-label">Цифровые ключи / Воронеж</p>
          <h1>Коды для игр. Быстро, честно, без ожидания.</h1>
          <p className="hero-lead">Playz продаёт лицензионные ключи с понятным регионом, сроком выдачи и поддержкой в Telegram.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#catalog" onClick={() => trackEvent('hero_catalog_click')}>
              Смотреть каталог
            </a>
            <button className="button button-plain" type="button" onClick={onSubscribe}>
              Получить -10%
            </button>
          </div>
        </div>

        <article className="hero-offer">
          <img src={heroProduct.image} alt={`Обложка ${heroProduct.title}`} width="819" height="1004" fetchpriority="high" />
          <div className="hero-offer-info">
            <div>
              <span className="label">{heroProduct.platform} / {heroProduct.region}</span>
              <h2>{heroProduct.title}</h2>
            </div>
            <div className="offer-price">
              <span>{heroProduct.discount}</span>
              <strong>{formatPrice(heroProduct.price)}</strong>
              <small>{formatPrice(heroProduct.oldPrice)}</small>
            </div>
            <button className="button button-dark" type="button" onClick={() => onAdd(heroProduct)}>
              В корзину
            </button>
          </div>
        </article>

        <div className="quick-strip" aria-label="Быстрые предложения">
          {quickItems.map((product) => (
            <article key={product.id}>
              <img src={product.image} alt="" loading="lazy" width="120" height="160" />
              <div>
                <strong>{product.title}</strong>
                <span>{product.platform} · {product.delivery}</span>
              </div>
              <b>{formatPrice(product.price)}</b>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CartDrawer({ open, items, status, onClose, onIncrease, onDecrease, onRemove, onClear, onCheckout }) {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const oldSubtotal = items.reduce((total, item) => total + item.product.oldPrice * item.quantity, 0);
  const savings = Math.max(0, oldSubtotal - subtotal);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="cart-drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={onClose}
        >
          <motion.aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            initial={{ x: '104%' }}
            animate={{ x: 0 }}
            exit={{ x: '104%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="cart-drawer__head">
              <div>
                <span className="section-index">Корзина</span>
                <h2 id="cart-drawer-title">Ваш заказ</h2>
              </div>
              <button className="icon-button" type="button" aria-label="Закрыть корзину" onClick={onClose}>
                <X size={22} />
              </button>
            </header>

            {items.length ? (
              <div className="cart-drawer__body">
                <div className="cart-list" aria-label="Товары в корзине">
                  {items.map(({ product, quantity }) => (
                    <article className="cart-item" key={product.id}>
                      <img src={product.image} alt={`Обложка ${product.title}`} loading="lazy" width="96" height="120" />
                      <div className="cart-item__main">
                        <span>{product.platform} · {product.region} · выдача {product.delivery}</span>
                        <h3>{product.title}</h3>
                        <p>{product.activation}</p>
                      </div>
                      <div className="quantity-control" aria-label={`Количество ${product.title}`}>
                        <button type="button" aria-label={`Уменьшить ${product.title}`} onClick={() => onDecrease(product.id)}>
                          <Minus size={16} />
                        </button>
                        <strong>{quantity}</strong>
                        <button type="button" aria-label={`Увеличить ${product.title}`} onClick={() => onIncrease(product)}>
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="cart-item__price">
                        <strong>{formatPrice(product.price * quantity)}</strong>
                        <small>{formatPrice(product.oldPrice * quantity)}</small>
                      </div>
                      <button className="cart-remove" type="button" aria-label={`Удалить ${product.title}`} onClick={() => onRemove(product.id)}>
                        <Trash2 size={18} />
                      </button>
                    </article>
                  ))}
                </div>

                <aside className="cart-summary" aria-label="Итого по корзине">
                  <div className="summary-row">
                    <span>Товаров</span>
                    <strong>{itemCount}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Скидка</span>
                    <strong>{formatPrice(savings)}</strong>
                  </div>
                  <div className="summary-total">
                    <span>Итого</span>
                    <strong>{formatPrice(subtotal)}</strong>
                  </div>
                  <button className="button button-primary checkout-button" type="button" onClick={onCheckout}>
                    Оформить демо-заказ
                  </button>
                  <button className="text-button cart-clear" type="button" onClick={onClear}>
                    Очистить корзину
                  </button>
                  <p className={`cart-note ${status ? 'is-success' : ''}`}>
                    {status || 'Оплата не подключена. В рабочей версии здесь будет выбор способа оплаты и выдача ключа на email.'}
                  </p>
                </aside>
              </div>
            ) : (
              <div className="cart-empty">
                <ShoppingCart size={38} />
                <h3>Корзина пустая</h3>
                <p>Добавьте игру из хитов или каталога. Счётчик в шапке обновится сразу.</p>
                <a className="button button-primary" href="#catalog" onClick={onClose}>Перейти в каталог</a>
              </div>
            )}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ProductCard({ product, onAdd, onSelect, featured = false }) {
  return (
    <article className={`product-card ${featured ? 'is-featured' : ''}`}>
      <button className="cover-button" type="button" onClick={() => onSelect(product)} aria-label={`Открыть ${product.title}`}>
        <img src={product.image} alt={`Обложка ${product.title}`} loading="lazy" decoding="async" />
        <span className="discount">{product.discount}</span>
      </button>
      <div className="product-content">
        <div className="product-topline">
          <span>{product.platform}</span>
          <span>{product.region}</span>
        </div>
        <h3>{product.title}</h3>
        <p>{product.description}</p>
        <div className="product-facts">
          <span><Star size={15} fill="currentColor" /> {product.rating}</span>
          <span>{product.delivery}</span>
          <span>{product.language}</span>
        </div>
        <div className="price-row">
          <div>
            <strong>{formatPrice(product.price)}</strong>
            <small>{formatPrice(product.oldPrice)}</small>
          </div>
          <button type="button" className="buy-button" onClick={() => onAdd(product)}>
            Купить код
          </button>
        </div>
      </div>
    </article>
  );
}

function DealRow({ product, onAdd, onSelect }) {
  return (
    <article className="deal-row">
      <button type="button" onClick={() => onSelect(product)} aria-label={`Открыть ${product.title}`}>
        <img src={product.image} alt="" loading="lazy" />
      </button>
      <div>
        <strong>{product.title}</strong>
        <span>{product.platform} · {product.region} · выдача {product.delivery}</span>
      </div>
      <b>{product.discount}</b>
      <em>{formatPrice(product.price)}</em>
      <button type="button" onClick={() => onAdd(product)}>В корзину</button>
    </article>
  );
}

function FeaturedDeals({ products, onAdd, onSelect }) {
  return (
    <MotionSection id="hits" className="hits-section">
      <div className="section-head two-column">
        <div>
          <span className="section-index">01</span>
          <h2>Хиты недели</h2>
        </div>
        <p>Товары, которые чаще всего берут для быстрых матчей, подарков и пополнения аккаунта.</p>
      </div>
      <div className="market-layout">
        <ProductCard product={products.find((product) => product.id === 'cs2')} onAdd={onAdd} onSelect={onSelect} featured />
        <div className="deal-list">
          {products.filter((product) => ['portal', 'dota', 'apex', 'among-us'].includes(product.id)).map((product) => (
            <DealRow key={product.id} product={product} onAdd={onAdd} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </MotionSection>
  );
}

function Catalog({ products, onAdd, onSelect }) {
  return (
    <MotionSection id="catalog" className="catalog-section">
      <div className="section-head">
        <span className="section-index">02</span>
        <h2>Каталог</h2>
        <p>Ключи, пополнения и наборы. В карточке сразу видны регион, платформа и срок выдачи.</p>
      </div>
      <div className="genre-rail" aria-label="Жанры">
        {genres.map((genre) => (
          <a key={genre.name} className="genre-tile" href="#catalog">
            <strong>{genre.name}</strong>
            <span>{genre.copy}</span>
            <small>{genre.picks.join(' / ')}</small>
          </a>
        ))}
      </div>
      <div className="catalog-grid">
        {products.length ? (
          products.map((product, index) => (
            <ProductCard key={product.id} product={product} onAdd={onAdd} onSelect={onSelect} featured={index === 0} />
          ))
        ) : (
          <div className="empty-state">
            <Search size={34} />
            <h3>Ничего не нашли</h3>
            <p>Снимите часть фильтров или увеличьте бюджет.</p>
          </div>
        )}
      </div>
    </MotionSection>
  );
}

function ProductDetail({ product, onAdd }) {
  return (
    <MotionSection id="product" className="product-detail-section">
      <div className="detail-layout">
        <div className="detail-media" style={{ '--media-image': `url(${product.image})` }}>
          <img src={product.image} alt={`Изображение ${product.title}`} loading="lazy" decoding="async" />
        </div>
        <div className="detail-copy">
          <span className="section-index">03</span>
          <h2>{product.title}</h2>
          <p>{product.description}</p>
          <div className="detail-price">
            <strong>{formatPrice(product.price)}</strong>
            <span>{product.platform} · {product.region} · {product.delivery}</span>
          </div>
          <ul className="feature-list">
            {product.features.map((feature) => (
              <li key={feature}><Check size={18} /> {feature}</li>
            ))}
          </ul>
          <div className="detail-actions">
            <button type="button" className="button button-primary" onClick={() => onAdd(product)}>
              Купить ключ
            </button>
            <a className="button button-plain" href="mailto:playz021@gmail.com">
              Купить через email
            </a>
          </div>
          <div className="details-stack">
            <details open>
              <summary>Системные требования <ChevronDown size={18} /></summary>
              <div className="requirements">
                <span>Минимальные</span>
                <p>{product.min}</p>
                <span>Рекомендуемые</span>
                <p>{product.rec}</p>
              </div>
            </details>
            <details>
              <summary>Активация и регион <ChevronDown size={18} /></summary>
              <p>{product.activation}. Если ключ не активируется, поддержка проверит заказ и предложит замену.</p>
            </details>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}

function ServiceBand() {
  const items = [
    ['Выдача 1-5 минут', 'Код приходит на email после оплаты.'],
    ['Регион до покупки', 'Не прячем ограничения в мелком тексте.'],
    ['Поддержка рядом', 'Telegram, почта и локальная точка в Воронеже.'],
    ['Замена ключа', 'Проверяем проблему и не бросаем после оплаты.'],
  ];

  return (
    <MotionSection id="support" className="service-section">
      <div className="section-head two-column">
        <div>
          <span className="section-index">04</span>
          <h2>Сервис</h2>
        </div>
        <p>Ключи - это не только цена. Важны регион, срок выдачи и нормальная помощь при активации.</p>
      </div>
      <div className="service-grid">
        {items.map(([title, text]) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </MotionSection>
  );
}

function Preorders({ countdown, onAdd }) {
  return (
    <MotionSection id="preorders" className="preorder-section">
      <div className="preorder-banner">
        <div>
          <span className="section-index">05</span>
          <h2>Предзаказ Forza Horizon</h2>
          <p>Бронь цифрового кода, уведомление о выдаче и бонус -10% на следующий заказ.</p>
          <div className="timer" aria-label="Таймер предзаказа">
            <span><strong>{String(countdown.days).padStart(2, '0')}</strong><small>дней</small></span>
            <span><strong>{String(countdown.hours).padStart(2, '0')}</strong><small>часов</small></span>
            <span><strong>{String(countdown.minutes).padStart(2, '0')}</strong><small>минут</small></span>
          </div>
          <button className="button button-primary" type="button" onClick={() => onAdd(preorderProduct)}>
            Забронировать
          </button>
        </div>
        <img src={preorderProduct.image} alt="Предзаказ Forza Horizon" loading="lazy" decoding="async" />
      </div>
    </MotionSection>
  );
}

function Events() {
  return (
    <MotionSection id="events" className="events-section">
      <div className="section-head two-column">
        <div>
          <span className="section-index">06</span>
          <h2>Комьюнити</h2>
        </div>
        <p>Локальные активности, где магазин становится точкой входа в игровое сообщество.</p>
      </div>
      <div className="event-list">
        {events.map((event) => (
          <article key={event.title} className="event-row">
            <span><CalendarDays size={18} /> {event.date}</span>
            <div>
              <h3>{event.title}</h3>
              <p>{event.text}</p>
            </div>
            <a href="https://t.me/playz" target="_blank" rel="noreferrer">Регистрация</a>
          </article>
        ))}
      </div>
    </MotionSection>
  );
}

function Reviews() {
  return (
    <MotionSection id="reviews" className="reviews-section">
      <div className="section-head">
        <span className="section-index">07</span>
        <h2>Отзывы</h2>
      </div>
      <div className="reviews-grid">
        {reviews.map((review) => (
          <article key={review.name}>
            <div className="stars" aria-label={`${review.rating} из 5`}>
              {Array.from({ length: review.rating }).map((_, index) => (
                <Star key={index} size={16} fill="currentColor" />
              ))}
            </div>
            <p>{review.text}</p>
            <strong>{review.name}</strong>
          </article>
        ))}
      </div>
    </MotionSection>
  );
}

function FAQ({ openIndex, setOpenIndex }) {
  return (
    <MotionSection id="faq" className="faq-section">
      <div className="section-head two-column">
        <div>
          <span className="section-index">08</span>
          <h2>Вопросы</h2>
        </div>
        <p>Коротко о том, что важно проверить перед покупкой цифрового ключа.</p>
      </div>
      <div className="faq-list">
        {faqItems.map(([question, answer], index) => (
          <button
            key={question}
            className={`faq-item ${openIndex === index ? 'is-open' : ''}`}
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            aria-expanded={openIndex === index}
          >
            <span><strong>{question}</strong><ChevronDown size={20} /></span>
            <p>{answer}</p>
          </button>
        ))}
      </div>
    </MotionSection>
  );
}

function SubscribeCTA({ onSubmit, email, setEmail, consent, setConsent, sent }) {
  return (
    <MotionSection id="subscribe" className="subscribe-section">
      <div className="subscribe-box">
        <div>
          <h2>Скидки по wishlist</h2>
          <p>Оставьте email. Пришлём промокод -10% и уведомления по нужным платформам.</p>
        </div>
        <form onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="text"
              inputMode="email"
              pattern=".+@.+[.].+"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="switch-row">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
            Согласен на рассылку
          </label>
          <button className="button button-dark" type="submit">
            {sent ? 'Промокод отправлен' : 'Получить -10%'}
          </button>
        </form>
      </div>
    </MotionSection>
  );
}

function Contacts() {
  return (
    <MotionSection id="contacts" className="contacts-section">
      <div className="section-head">
        <span className="section-index">09</span>
        <h2>Контакты</h2>
      </div>
      <div className="contacts-grid">
        <div className="contact-card">
          <a href="tel:+79950368295"><Phone size={20} /> +7 995 036-82-95</a>
          <a href="mailto:playz021@gmail.com"><Mail size={20} /> playz021@gmail.com</a>
          <a href="https://t.me/playz" target="_blank" rel="noreferrer"><MessageCircle size={20} /> @playz</a>
          <p><MapPin size={20} /> г. Воронеж, ул. Челюскинцев 101б</p>
          <p className="worktime">Ежедневно: 10:00-22:00</p>
        </div>
        <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            Имя
            <input type="text" placeholder="Как к вам обращаться" />
          </label>
          <label>
            Вопрос
            <textarea placeholder="Какая игра, платформа или проблема с активацией?" />
          </label>
          <button className="button button-plain" type="submit">
            <Send size={18} /> Отправить
          </button>
        </form>
        <a
          className="map-block"
          href="https://yandex.ru/maps/?text=%D0%92%D0%BE%D1%80%D0%BE%D0%BD%D0%B5%D0%B6%2C%20%D0%A7%D0%B5%D0%BB%D1%8E%D1%81%D0%BA%D0%B8%D0%BD%D1%86%D0%B5%D0%B2%20101%D0%B1"
          target="_blank"
          rel="noreferrer"
        >
          <MapPin size={32} />
          <span>Открыть адрес</span>
          <small>Воронеж, Челюскинцев 101б</small>
        </a>
      </div>
    </MotionSection>
  );
}

function SubscribeModal({ open, onClose, email, setEmail, consent, setConsent, onSubmit, sent }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="modal-backdrop" role="presentation" onMouseDown={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscribe-title"
            onMouseDown={(event) => event.stopPropagation()}
            initial={{ y: 18, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 18, scale: 0.98 }}
          >
            <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Закрыть">
              <X size={22} />
            </button>
            <h2 id="subscribe-title">Промокод для первого заказа</h2>
            <p>Оставьте email, и интерфейс покажет успешную подписку. Реальная отправка подключается на backend.</p>
            <form onSubmit={onSubmit}>
              <label>
                Email
                <input
                  type="text"
                  inputMode="email"
                  pattern=".+@.+[.].+"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label className="switch-row">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
                Даю согласие на рассылку
              </label>
              <button className="button button-primary" type="submit">
                {sent ? 'Готово' : 'Получить -10%'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div>
        <a className="brand footer-brand" href="#home">
          <img src="/images/logo-playz.jpeg" alt="" width="42" height="42" />
          <span>Playz</span>
        </a>
        <p>Цифровые ключи, понятный регион и поддержка рядом.</p>
      </div>
      <nav aria-label="Юридические ссылки">
        <a href="#faq">Оферта</a>
        <a href="#faq">Политика</a>
        <a href="#contacts">Контакты</a>
      </nav>
      <div className="payment-icons" aria-label="Платёжные системы">
        <span><CreditCard size={18} /> Visa</span>
        <span>МИР</span>
        <span>СБП</span>
      </div>
      <p className="copyright">© 2026 Playz. Прототип без реальных платежей.</p>
    </footer>
  );
}

function App() {
  const [filters, setFilters] = useState({ query: '', platform: 'Все', genre: 'Все', maxPrice: 4200, localized: false, exclusive: false });
  const [savedSearch, setSavedSearch] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(heroProduct);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [faqOpen, setFaqOpen] = useState(0);
  const countdownTarget = useMemo(() => Date.now() + 5 * 86400000 + 7 * 3600000 + 26 * 60000, []);
  const countdown = useCountdown(countdownTarget);
  const cartCount = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems]);

  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      if (id === 'cart-preview') {
        setCartOpen(true);
        return;
      }
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' });
      });
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  const filteredProducts = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery = !query || [product.title, product.genre, product.platform, product.language, product.region].join(' ').toLowerCase().includes(query);
      const matchesPlatform = filters.platform === 'Все' || product.platform === filters.platform;
      const matchesGenre = filters.genre === 'Все' || product.genre === filters.genre;
      const matchesPrice = product.price <= filters.maxPrice;
      const matchesLocalized = !filters.localized || product.localization;
      const matchesExclusive = !filters.exclusive || product.exclusive;
      return matchesQuery && matchesPlatform && matchesGenre && matchesPrice && matchesLocalized && matchesExclusive;
    });
  }, [filters]);

  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Каталог Playz',
    itemListElement: products.slice(0, 8).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        image: product.image,
        description: product.description,
        aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: 24 + index * 7 },
        offers: { '@type': 'Offer', priceCurrency: 'RUB', price: product.price, availability: 'https://schema.org/InStock' },
      },
    })),
  }), []);

  const handleAdd = (product) => {
    setCheckoutStatus('');
    setCartOpen(true);
    setCartItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) => (
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
      return [...current, { product, quantity: 1 }];
    });
    setSelectedProduct(product);
    trackEvent('add_to_cart', { product: product.id, price: product.price });
  };

  const handleOpenCart = () => {
    setCartOpen(true);
    trackEvent('cart_open', { items: cartCount });
  };

  const handleCloseCart = () => {
    setCartOpen(false);
    if (window.location.hash === '#cart-preview') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  };

  const handleDecreaseCartItem = (productId) => {
    setCheckoutStatus('');
    setCartItems((current) => current
      .map((item) => (
        item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      ))
      .filter((item) => item.quantity > 0));
    trackEvent('cart_decrease', { product: productId });
  };

  const handleRemoveCartItem = (productId) => {
    setCheckoutStatus('');
    setCartItems((current) => current.filter((item) => item.product.id !== productId));
    trackEvent('cart_remove', { product: productId });
  };

  const handleClearCart = () => {
    setCheckoutStatus('');
    setCartItems([]);
    trackEvent('cart_clear');
  };

  const handleCheckout = () => {
    if (!cartItems.length) return;
    setCheckoutStatus('Демо-заказ собран. Для реальной оплаты нужен backend и платёжный провайдер.');
    trackEvent('checkout_demo', {
      items: cartItems.map((item) => ({ product: item.product.id, quantity: item.quantity })),
    });
  };

  const handleSelect = (product) => {
    setSelectedProduct(product);
    trackEvent('product_view', { product: product.id });
    document.querySelector('#product')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveSearch = () => {
    setSavedSearch(true);
    trackEvent('save_search', filters);
  };

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !consent) return;
    setSubscribed(true);
    trackEvent('subscribe', { emailDomain: email.split('@')[1] || 'unknown' });
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <TargetCursor />
      <Header
        cartCount={cartCount}
        onCartOpen={handleOpenCart}
        onSubscribe={() => setModalOpen(true)}
        filters={filters}
        setFilters={setFilters}
        filteredCount={filteredProducts.length}
        onSaveSearch={handleSaveSearch}
        savedSearch={savedSearch}
      />
      <main>
        <Hero onAdd={handleAdd} onSubscribe={() => setModalOpen(true)} />
        <FeaturedDeals products={products} onAdd={handleAdd} onSelect={handleSelect} />
        <Catalog products={filteredProducts} onAdd={handleAdd} onSelect={handleSelect} />
        <ProductDetail product={selectedProduct} onAdd={handleAdd} />
        <ServiceBand />
        <Preorders countdown={countdown} onAdd={handleAdd} />
        <Events />
        <Reviews />
        <FAQ openIndex={faqOpen} setOpenIndex={setFaqOpen} />
        <SubscribeCTA email={email} setEmail={setEmail} consent={consent} setConsent={setConsent} sent={subscribed} onSubmit={handleSubscribe} />
        <Contacts />
      </main>
      <Footer />
      <SubscribeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        email={email}
        setEmail={setEmail}
        consent={consent}
        setConsent={setConsent}
        sent={subscribed}
        onSubmit={handleSubscribe}
      />
      <CartDrawer
        open={cartOpen}
        items={cartItems}
        status={checkoutStatus}
        onClose={handleCloseCart}
        onIncrease={handleAdd}
        onDecrease={handleDecreaseCartItem}
        onRemove={handleRemoveCartItem}
        onClear={handleClearCart}
        onCheckout={handleCheckout}
      />
    </>
  );
}

export default App;
