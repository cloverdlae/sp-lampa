/*
 * Kill Kenny Catalog for Lampa
 * v0.5.0
 *
 * Назначение:
 *  - читает каталог kill-kenny.com
 *  - строит навигацию Сезоны -> Серии
 *  - при выборе серии открывает ОРИГИНАЛЬНУЮ страницу серии на kill-kenny.com
 *    в WebView/браузере ТВ, где работает собственный плеер сайта
 *
 * Внутренние media URL / iframe token / m3u8 этот плагин не извлекает.
 */
(function () {
    'use strict';

    var PLUGIN_ID = 'kill_kenny_catalog';
    var COMPONENT = 'kill_kenny_catalog_component';
    var BASE = 'https://kill-kenny.com';
    var HOME = BASE + '/';
    var TITLE = 'Южный Парк — Kill Kenny';

    // Прямые HLS-шаблоны. Добавляйте сюда только известные вам разрешённые потоки.
    // Пример, который был предоставлен пользователем:
    // https://cdn.videozcdn.uk/video/killkenny/s16-paramount/01.mp4/index.m3u8
    var STREAM_RULES = {
        10: {
            base: 'https://cdn.videozcdn.uk/video/killkenny/s10-mtv/',
            suffix: '.mp4/index.m3u8'
        },
        16: {
            base: 'https://cdn.videozcdn.uk/video/killkenny/s16-paramount/',
            suffix: '.mp4/index.m3u8'
        }
    };

    var DESCRIPTION_CACHE = {};
    var DESCRIPTION_REQUESTS = {};

    var ICON =
        '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2">' +
            '<rect x="3" y="4" width="18" height="16" rx="2"></rect>' +
            '<path d="M7 8h10M7 12h10M7 16h6"></path>' +
        '</svg>';

    var CSS = [
        '.kk-root{padding:1.4em 2em 4em}',
        '.kk-title{font-size:2em;font-weight:700;margin-bottom:.8em}',
        '.kk-subtitle{opacity:.6;margin:-.4em 0 1.1em}',
        '.kk-details{display:none;max-width:78em;margin:0 0 1.1em;padding:1em 1.15em;border-radius:.8em;background:rgba(255,255,255,.055)}',
        '.kk-details.active{display:block}',
        '.kk-details__title{font-size:1.12em;font-weight:650;margin-bottom:.45em}',
        '.kk-details__text{font-size:1em;line-height:1.42;opacity:.78;white-space:normal}',
        '.kk-list{display:flex;flex-direction:column;gap:.6em;max-width:78em}',
        '.kk-card{display:flex;align-items:center;gap:1em;padding:1em 1.15em;border-radius:.8em;background:rgba(255,255,255,.07)}',
        '.kk-card.focus{background:rgba(255,255,255,.18);transform:scale(1.008)}',
        '.kk-badge{display:flex;align-items:center;justify-content:center;flex:0 0 4.5em;height:3.1em;border-radius:.65em;background:rgba(255,255,255,.11);font-weight:700}',
        '.kk-body{min-width:0}',
        '.kk-name{font-size:1.16em;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
        '.kk-meta{opacity:.55;margin-top:.22em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
        '.kk-message{padding:1.2em;border-radius:.8em;background:rgba(255,255,255,.06);opacity:.78}',
        '.kk-hint{margin-top:1em;opacity:.45;font-size:.9em}'
    ].join('');

    function injectStyle() {
        if ($('#kk-style').length) return;
        $('body').append('<style id="kk-style">' + CSS + '</style>');
    }

    function abs(href) {
        if (!href) return '';
        if (/^https?:\/\//i.test(href)) return href;
        return BASE.replace(/\/+$/, '') + '/' + href.replace(/^\/+/, '');
    }

    function normalizeText(text) {
        return String(text || '').replace(/\s+/g, ' ').trim();
    }

    function parseHTML(html) {
        return new DOMParser().parseFromString(String(html || ''), 'text/html');
    }

    function uniq(items, keyFn) {
        var map = {};
        var out = [];
        items.forEach(function (item) {
            var key = keyFn(item);
            if (!key || map[key]) return;
            map[key] = true;
            out.push(item);
        });
        return out;
    }

    function requestHTML(url, done, fail) {
        var net = new Lampa.Reguest();
        var finished = false;

        function ok(data) {
            if (finished) return;
            finished = true;
            done(String(data || ''));
        }

        function bad(err) {
            if (finished) return;
            finished = true;
            fail(err || 'network error');
        }

        try {
            if (net.timeout) net.timeout(18000);

            // На Android TV / части сборок Lampa native-запрос умеет обходить browser CORS.
            if (typeof net.native === 'function') {
                net.native(url, ok, function () {
                    // fallback на silent
                    try {
                        net.silent(
                            url,
                            ok,
                            bad,
                            false,
                            {
                                dataType: 'text',
                                headers: {
                                    'Accept': 'text/html,application/xhtml+xml',
                                    'Cache-Control': 'no-cache'
                                }
                            }
                        );
                    } catch (e2) {
                        bad(e2);
                    }
                });
            } else {
                net.silent(
                    url,
                    ok,
                    bad,
                    false,
                    {
                        dataType: 'text',
                        headers: {
                            'Accept': 'text/html,application/xhtml+xml',
                            'Cache-Control': 'no-cache'
                        }
                    }
                );
            }
        } catch (e) {
            bad(e);
        }

        return net;
    }

    function parseSeasons(html) {
        var doc = parseHTML(html);
        var result = [];

        Array.prototype.forEach.call(doc.querySelectorAll('a[href]'), function (a) {
            var href = a.getAttribute('href') || '';
            var match = href.match(/(?:^|\/)season-(\d+)\/?(?:$|[?#])/i);
            if (!match) return;

            var n = parseInt(match[1], 10);
            if (!n) return;

            result.push({
                kind: 'season',
                season: n,
                title: n + ' сезон',
                url: abs(href)
            });
        });

        result = uniq(result, function (x) { return String(x.season); });

        result.sort(function (a, b) {
            return a.season - b.season;
        });

        return result;
    }

    function parseEpisodeLink(a, expectedSeason) {
        var href = a.getAttribute('href') || '';
        if (!/sezon/i.test(href) || !/ser(?:ija|iya)/i.test(href)) return null;

        var text = normalizeText(
            a.getAttribute('title') ||
            a.textContent ||
            ''
        );

        // 16 сезон 1 серия: Перевёрнутая наездница
        var byText = text.match(/(\d+)\s*сезон\s*(\d+)\s*сер(?:ия|ии)\s*[:\-–—]?\s*(.*)$/i);

        // 188-16-sezon-1-serija-perevernutaja-naezdnica.html
        var byUrl = href.match(/(?:^|\/)(?:\d+-)?(\d+)-sezon-(\d+)-ser(?:ija|iya)(?:-|\.|\/)/i);

        var season = byText ? parseInt(byText[1], 10) : (byUrl ? parseInt(byUrl[1], 10) : 0);
        var episode = byText ? parseInt(byText[2], 10) : (byUrl ? parseInt(byUrl[2], 10) : 0);

        if (!episode) return null;
        if (expectedSeason && season && season !== expectedSeason) return null;

        if (!season) season = expectedSeason || 0;

        var name = '';

        if (byText && byText[3]) {
            name = normalizeText(byText[3]);
        } else {
            name = text;
        }

        // Если текст ссылки содержит целиком "16 сезон 1 серия: ..."
        // оставляем только название.
        name = name.replace(/^\d+\s*сезон\s*\d+\s*сер(?:ия|ии)\s*[:\-–—]?\s*/i, '').trim();

        return {
            kind: 'episode',
            season: season,
            episode: episode,
            name: name || (episode + ' серия'),
            title: episode + ' серия' + (name ? ': ' + name : ''),
            url: abs(href)
        };
    }

    function parseEpisodes(html, expectedSeason) {
        var doc = parseHTML(html);
        var result = [];

        Array.prototype.forEach.call(doc.querySelectorAll('a[href]'), function (a) {
            var item = parseEpisodeLink(a, expectedSeason);
            if (item) result.push(item);
        });

        // Убираем дубли из навигации / комментариев.
        result = uniq(result, function (x) {
            return x.season + ':' + x.episode;
        });

        result.sort(function (a, b) {
            return a.episode - b.episode;
        });

        return result;
    }


    function cleanDescriptionNode(node) {
        if (!node) return '';

        var clone = node.cloneNode(true);

        Array.prototype.forEach.call(
            clone.querySelectorAll('script,style,iframe,form,button,input,textarea,nav,.comments,.comment,.rating,.share,.social'),
            function (n) {
                if (n && n.parentNode) n.parentNode.removeChild(n);
            }
        );

        var parts = [];

        Array.prototype.forEach.call(
            clone.querySelectorAll('p,li,div'),
            function (n) {
                var text = normalizeText(n.textContent || '');

                if (text.length < 35) return;
                if (/^(смотреть онлайн|описание серии|комментарии|оцени серию|поделись|добавить в закладки|кадры из серии)/i.test(text)) return;

                if (parts.indexOf(text) === -1) parts.push(text);
            }
        );

        if (!parts.length) {
            var whole = normalizeText(clone.textContent || '');
            if (whole.length >= 60) parts.push(whole);
        }

        return parts.slice(0, 4).join(' ');
    }

    function parseEpisodeDescription(html) {
        var doc = parseHTML(html);
        var selectors = [
            '[itemprop="description"]',
            '.episode-description',
            '.full-text',
            '.fullstory',
            '.full-story',
            '.story-text',
            '.story',
            '.article-text',
            '.post-text'
        ];

        for (var i = 0; i < selectors.length; i++) {
            var node = doc.querySelector(selectors[i]);
            var text = cleanDescriptionNode(node);
            if (text && text.length >= 60 && text.length <= 2500) return text;
        }

        // Fallback для страниц, где сюжет размечен обычными абзацами.
        // Берём содержательные абзацы верхней части статьи и останавливаемся
        // до блоков рейтинга/плеера/комментариев.
        var candidates = [];
        var all = doc.querySelectorAll('p');

        for (var p = 0; p < all.length && p < 24; p++) {
            var value = normalizeText(all[p].textContent || '');

            if (/^(смотреть онлайн|оцени серию|поделись с друзьями|добавить в закладки|комментарии)/i.test(value)) {
                break;
            }

            if (value.length >= 45) candidates.push(value);
            if (candidates.length >= 4) break;
        }

        if (candidates.length) return candidates.join(' ');

        // SEO description — последний резервный вариант.
        var meta =
            doc.querySelector('meta[property="og:description"]') ||
            doc.querySelector('meta[name="description"]');

        if (meta) {
            var metaText = normalizeText(meta.getAttribute('content') || '');
            if (metaText.length >= 30) return metaText;
        }

        // JSON-LD fallback.
        var jsonld = doc.querySelectorAll('script[type="application/ld+json"]');

        for (var j = 0; j < jsonld.length; j++) {
            try {
                var data = JSON.parse(jsonld[j].textContent || '{}');
                var arr = Array.isArray(data) ? data : [data];

                for (var k = 0; k < arr.length; k++) {
                    if (arr[k] && arr[k].description) {
                        var jsonText = normalizeText(arr[k].description);
                        if (jsonText.length >= 30) return jsonText;
                    }
                }
            } catch (e) {}
        }

        return '';
    }

    function loadEpisodeDescription(episode, done) {
        if (!episode || !episode.url) {
            done('');
            return;
        }

        if (DESCRIPTION_CACHE[episode.url] !== undefined) {
            done(DESCRIPTION_CACHE[episode.url]);
            return;
        }

        if (DESCRIPTION_REQUESTS[episode.url]) {
            DESCRIPTION_REQUESTS[episode.url].push(done);
            return;
        }

        DESCRIPTION_REQUESTS[episode.url] = [done];

        requestHTML(
            episode.url,
            function (html) {
                var description = parseEpisodeDescription(html);
                DESCRIPTION_CACHE[episode.url] = description;

                var queue = DESCRIPTION_REQUESTS[episode.url] || [];
                delete DESCRIPTION_REQUESTS[episode.url];

                queue.forEach(function (callback) {
                    callback(description);
                });
            },
            function () {
                DESCRIPTION_CACHE[episode.url] = '';

                var queue = DESCRIPTION_REQUESTS[episode.url] || [];
                delete DESCRIPTION_REQUESTS[episode.url];

                queue.forEach(function (callback) {
                    callback('');
                });
            }
        );
    }

    function fallbackSeasons() {
        // На момент сборки сайт показывает сезоны 1–28.
        var list = [];
        for (var i = 1; i <= 28; i++) {
            list.push({
                kind: 'season',
                season: i,
                title: i + ' сезон',
                url: BASE + '/season-' + i + '/'
            });
        }
        return list;
    }

    function pad2(number) {
        number = parseInt(number, 10) || 0;
        return number < 10 ? ('0' + number) : String(number);
    }

    function buildStreamUrl(episode) {
        if (!episode) return '';

        var rule = STREAM_RULES[parseInt(episode.season, 10)];
        if (!rule) return '';

        return rule.base + pad2(episode.episode) + rule.suffix;
    }

    function playDirectStream(episode) {
        var stream = buildStreamUrl(episode);

        if (!stream) {
            Lampa.Noty.show(
                'Для ' + episode.season +
                ' сезона пока нет правила прямого потока в STREAM_RULES.'
            );
            return;
        }

        try {
            Lampa.Storage.set('kk_last_episode_url', episode.url || '');
            Lampa.Storage.set('kk_last_episode_title', episode.title);
            Lampa.Storage.set('kk_last_stream_url', stream);
        } catch (e) {}

        var item = {
            title: episode.title,
            url: stream,
            season: episode.season,
            episode: episode.episode
        };

        try {
            Lampa.Player.play(item);
            Lampa.Player.playlist([item]);
        } catch (e) {
            Lampa.Noty.show('Lampa Player не смог запустить HLS-поток');
        }
    }

    function CatalogComponent(object) {
        var self = this;
        var network = null;

        var scroll = new Lampa.Scroll({
            mask: true,
            over: true,
            step: 240
        });

        var root = $('<div class="kk-root"></div>');
        var title = $('<div class="kk-title"></div>');
        var subtitle = $('<div class="kk-subtitle"></div>');
        var details = $(
            '<div class="kk-details">' +
                '<div class="kk-details__title"></div>' +
                '<div class="kk-details__text"></div>' +
            '</div>'
        );
        var list = $('<div class="kk-list"></div>');
        var hint = $('<div class="kk-hint">Enter/OK — открыть • Назад — предыдущий экран</div>');

        root.append(title);
        root.append(subtitle);
        root.append(details);
        root.append(list);
        root.append(hint);
        scroll.append(root);

        function message(text) {
            list.empty().append(
                $('<div class="kk-message"></div>').text(text)
            );
        }

        var descriptionTimer = null;
        var focusedEpisodeUrl = '';

        function hideDetails() {
            focusedEpisodeUrl = '';
            details.removeClass('active');
            details.find('.kk-details__title').text('');
            details.find('.kk-details__text').text('');
        }

        function showEpisodeDetails(item) {
            if (!item || item.kind !== 'episode') {
                hideDetails();
                return;
            }

            focusedEpisodeUrl = item.url;

            details.addClass('active');
            details.find('.kk-details__title').text(item.title);

            var cached = DESCRIPTION_CACHE[item.url];

            if (cached !== undefined) {
                details.find('.kk-details__text').text(
                    cached || 'Описание серии на странице отсутствует.'
                );
                return;
            }

            details.find('.kk-details__text').text('Загрузка описания серии…');

            if (descriptionTimer) clearTimeout(descriptionTimer);

            // Небольшая задержка предотвращает пачку запросов при быстром
            // пролистывании списка пультом.
            descriptionTimer = setTimeout(function () {
                loadEpisodeDescription(item, function (description) {
                    if (focusedEpisodeUrl !== item.url) return;

                    details.find('.kk-details__text').text(
                        description || 'Описание серии получить не удалось.'
                    );
                });
            }, 280);
        }

        function card(item) {
            var el = $(
                '<div class="kk-card selector">' +
                    '<div class="kk-badge"></div>' +
                    '<div class="kk-body">' +
                        '<div class="kk-name"></div>' +
                        '<div class="kk-meta"></div>' +
                    '</div>' +
                '</div>'
            );

            el.find('.kk-badge').text(
                item.kind === 'season'
                    ? 'S' + item.season
                    : 'E' + item.episode
            );

            el.find('.kk-name').text(item.title);

            el.find('.kk-meta').text(
                item.kind === 'season'
                    ? 'Открыть серии сезона'
                    : ('Сезон ' + item.season + ' • прямой HLS → Lampa Player')
            );

            el.on('hover:focus', function () {
                if (item.kind === 'episode') showEpisodeDetails(item);
                else hideDetails();
            });

            el.on('mouseenter', function () {
                if (item.kind === 'episode') showEpisodeDetails(item);
            });

            el.on('hover:enter', function () {
                if (item.kind === 'season') {
                    Lampa.Activity.push({
                        component: COMPONENT,
                        title: item.title,
                        season: item.season,
                        seasonUrl: item.url,
                        page: 1
                    });
                } else {
                    playDirectStream(item);
                }
            });

            return el;
        }

        function draw(items) {
            list.empty();

            if (!items || !items.length) {
                message('Элементы каталога не найдены.');
                return;
            }

            items.forEach(function (item) {
                list.append(card(item));
            });

            setTimeout(function () {
                self.start();
            }, 50);
        }

        function loadSeasons() {
            title.text('Южный Парк');
            subtitle.text('Сезоны с kill-kenny.com');
            hideDetails();
            message('Загрузка сезонов…');

            network = requestHTML(
                HOME,
                function (html) {
                    var seasons = parseSeasons(html);

                    if (!seasons.length) {
                        draw(fallbackSeasons());
                        Lampa.Noty.show('Использован резервный список сезонов 1–28');
                        return;
                    }

                    draw(seasons);
                },
                function () {
                    // Даже при проблемах с CORS пользователь всё равно увидит сезоны.
                    draw(fallbackSeasons());
                    Lampa.Noty.show('HTML главной не загрузился — показан резервный список 1–28');
                }
            );
        }

        function loadEpisodes() {
            var season = parseInt(object.season, 10);
            var url = object.seasonUrl || (BASE + '/season-' + season + '/');

            title.text(season + ' сезон');
            subtitle.text('Серии с kill-kenny.com • описание загружается при выборе');
            message('Загрузка серий…');

            network = requestHTML(
                url,
                function (html) {
                    var episodes = parseEpisodes(html, season);

                    if (!episodes.length) {
                        message(
                            'Список серий получить не удалось. ' +
                            'Нажмите Назад и попробуйте снова. ' +
                            'На некоторых ТВ cross-origin HTML требует Android-клиент Lampa с native HTTP.'
                        );
                        return;
                    }

                    draw(episodes);
                },
                function () {
                    message(
                        'Ошибка загрузки HTML сезона. ' +
                        'На Android TV рекомендуется официальный Lampa Android-клиент: ' +
                        'его native HTTP обычно работает стабильнее browser CORS.'
                    );
                }
            );
        }

        this.create = function () {
            if (object && object.season) loadEpisodes();
            else loadSeasons();

            return this.render();
        };

        this.render = function () {
            return scroll.render();
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render(), list);
                    Lampa.Controller.collectionFocus(false, scroll.render());
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    Navigator.move('down');
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    Navigator.move('right');
                },
                back: function () {
                    self.back();
                }
            });

            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};

        this.back = function () {
            Lampa.Activity.backward();
        };

        this.destroy = function () {
            if (descriptionTimer) clearTimeout(descriptionTimer);

            try {
                if (network && network.clear) network.clear();
            } catch (e) {}

            try {
                scroll.destroy();
            } catch (e2) {}

            root.remove();
        };
    }

    function openCatalog() {
        Lampa.Activity.push({
            component: COMPONENT,
            title: TITLE,
            page: 1
        });
    }

    function init() {
        if (typeof Lampa === 'undefined' || !Lampa.Component || !Lampa.Activity) {
            setTimeout(init, 300);
            return;
        }

        if (window[PLUGIN_ID + '_ready']) return;
        window[PLUGIN_ID + '_ready'] = true;

        injectStyle();
        Lampa.Component.add(COMPONENT, CatalogComponent);

        if (Lampa.Menu && Lampa.Menu.addButton) {
            Lampa.Menu.addButton(
                ICON,
                'Южный Парк',
                openCatalog
            );
        }

        try {
            if (Lampa.Manifest && Lampa.Manifest.plugins) {
                Lampa.Manifest.plugins[PLUGIN_ID] = {
                    type: 'other',
                    version: '0.5.0',
                    name: TITLE,
                    description: 'kill-kenny.com: сезоны → серии → описания → прямой HLS в Lampa Player'
                };
            }
        } catch (e) {}
    }

    if (window.appready) {
        init();
    } else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    } else {
        setTimeout(init, 500);
    }
})();
