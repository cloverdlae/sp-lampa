[README.md](https://github.com/user-attachments/files/31605218/README.md)
# South Park Lampa plugin v1

Новая архитектура:

1. `killkenny.js` — компактный клиентский плагин для Lampa 3.x.
2. `catalog.json` — готовые метаданные сезонов и серий.
3. GitHub Action `Update catalog` обновляет `catalog.json` с публичных страниц сайта.
4. Lampa читает JSON с GitHub Pages / raw GitHub и использует штатный `Lampa.Maker`.

## Установка в существующий репозиторий cloverdlae/sp-lampa

Загрузите в корень репозитория:

- `killkenny.js`
- `catalog.json`
- папку `scripts`
- папку `.github`

После Commit:

1. Откройте вкладку **Actions**.
2. Выберите **Update catalog**.
3. Нажмите **Run workflow**.
4. Подождите окончания workflow и нового commit `Update catalog`.
5. GitHub Pages автоматически опубликует обновлённый `catalog.json`.

URL плагина:

`https://cloverdlae.github.io/sp-lampa/killkenny.js?v=100`

## Что изменилось относительно старой версии

- собственный `Lampa.Scroll` удалён;
- собственные обработчики wheel/trackpad удалены;
- UI строится через `Lampa.Maker.make('Main')`;
- сезоны и серии разбиты на нативные ряды Lampa;
- browser CORS к kill-kenny отсутствует — браузер читает только `catalog.json`;
- описание и обложка серии хранятся в JSON;
- при OK на серии открывается нативное окно с описанием;
- для известных HLS-правил появляется кнопка **Смотреть**;
- Lampa получает playlist сезона для перехода на следующую/предыдущую серию.

## Потоки

В `killkenny.js` сейчас сохранены только уже известные правила:

- сезон 10 — `s10-mtv`
- сезон 16 — `s16-paramount`

Новые подтверждённые правила добавляются в `STREAM_RULES`.

## Обновление каталога

Action также запускается автоматически один раз в сутки.

Скрипт `scripts/update_catalog.py` собирает только публичные метаданные: список серий, название, описание, poster/og:image и URL страницы. Встроенные media URL и токены плееров он не извлекает.
