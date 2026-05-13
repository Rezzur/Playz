<p align="center">
  <a href="https://playz.vercel.app">
    <img src="images/logo-playz.jpeg" alt="Playz logo" width="128" height="128">
  </a>
</p>

<h1 align="center">Playz</h1>

<p align="center">
  Тёмная неоновая витрина интернет-магазина компьютерных игр, ключей и игрового мерча.
</p>

<p align="center">
  <a href="https://playz.vercel.app"><strong>Открыть сайт</strong></a>
  ·
  <a href="https://github.com/Rezzur/Playz">GitHub</a>
  ·
  <a href="mailto:playz021@gmail.com">Поддержка</a>
</p>

<p align="center">
  <img alt="Static site" src="https://img.shields.io/badge/site-static-74f4df?style=for-the-badge&labelColor=0c0d0a">
  <img alt="Vercel" src="https://img.shields.io/badge/deploy-vercel-f5f4ec?style=for-the-badge&labelColor=0c0d0a">
  <img alt="No build" src="https://img.shields.io/badge/build-not_required-e9ff68?style=for-the-badge&labelColor=0c0d0a">
</p>

## О проекте

Playz - одностраничный сайт для магазина цифровых игр. Он выглядит как рабочая витрина: каталог, хиты недели, предзаказы, карточка товара, корзина, мерч, отзывы, FAQ, формы связи и контакты.

Сайт сделан как лёгкий статический проект без тяжёлого build-пайплайна. Основная логика живёт в обычных JS/CSS-файлах, а формы и заказ подготовлены под Vercel Serverless Functions.

## Что внутри

- **Главный экран** с логотипом Playz, УТП и быстрыми CTA.
- **Каталог игр** с фильтрами, жанрами, карточками и ценами.
- **Хиты недели** со скидками и быстрым добавлением в корзину.
- **Карточка товара** с галереей, системными требованиями, активацией и отзывами.
- **Корзина и заказ** с локальным состоянием и серверной точкой `/api/order`.
- **Мерч Playz x Logitech** с клавиатурой, мышью и ковриком.
- **FAQ, отзывы, подписка и контакты** с формами и защитой от спама.
- **Адаптивная вёрстка** для десктопа и смартфонов.
- **Кастомный курсор** с адаптацией цвета под фон.
- **SEO-основа**: meta-теги, Open Graph и JSON-LD для товаров.

## Ссылки

| Назначение | Ссылка |
| --- | --- |
| Сайт | <https://playz.vercel.app> |
| Репозиторий | <https://github.com/Rezzur/Playz> |
| Почта | <playz021@gmail.com> |
| Telegram | `@playz` |
| Адрес | г. Воронеж, ул. Челюскинцев 101б |
| Телефон | +7 995 036-82-95 |

## Технологии

| Слой | Используется |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| UI | статическая Vite-сборка, локальные override-слои |
| Анимации | CSS transitions, lightweight JS enhancements |
| Данные | локальные массивы и состояние в браузере |
| Формы | Vercel Serverless Functions |
| Деплой | Vercel |

## Структура

```text
.
├── index.html              # главная страница
├── offer.html              # публичная оферта
├── privacy.html            # политика конфиденциальности
├── vercel.json             # правила деплоя и rewrites
├── api/
│   ├── lead.js             # заявки, подписка, отзывы
│   └── order.js            # оформление заказа
├── assets/
│   ├── index-*.js          # основная сборка сайта
│   ├── index-*.css         # базовые стили
│   ├── playz-overrides.css # финальная полировка интерфейса
│   └── playz-tz-release.js # интерактив и доработки ТЗ
└── images/                 # логотип, обложки игр, мерч
```

## Локальный запуск

Проект не требует установки зависимостей.

```bash
python3 -m http.server 5180 --bind 127.0.0.1
```

После запуска:

```text
http://127.0.0.1:5180/
```

## Деплой

Проект настроен под Vercel как статический сайт:

- `outputDirectory`: `.`
- `buildCommand`: не требуется
- `installCommand`: не требуется
- все маршруты, кроме `/api/*`, `/assets/*`, `/images/*`, `offer.html` и `privacy.html`, переписываются на `index.html`.

Для reCAPTCHA можно добавить переменную окружения:

```text
RECAPTCHA_SECRET_KEY=...
```

## Статус

Сайт работает как демо-витрина с интерактивной корзиной и формами. Реальные платежи, CRM, склад и автоматическая выдача ключей не подключены.

## Контакты Playz

- Телефон: `+7 995 036-82-95`
- Адрес: `г. Воронеж, ул. Челюскинцев 101б`
- Почта: `playz021@gmail.com`
- Telegram: `@playz`
