/*
 * Serials Hub for Lampa 3.x
 * v0.5.0
 *
 * Shows:
 *   - South Park: stable v1.4 logic + catalog.json + direct HLS rules
 *   - Family Guy: direct authorized HLS catalog
 *
 * Architecture:
 *   Lampa.Maker native UI -> library -> show -> season -> episode
 */
(function () {
    'use strict';

    var PLUGIN_ID = 'serials_hub_v1';
    var COMPONENT = 'serials_hub_native';
    var VERSION = '0.5.7';
    var TITLE = 'Cloverdale';

    var CLOVERDALE_BG = '#292929';
    var SP_TMDB_ID = 2190;
    var FG_TMDB_ID = 1434;
    var SP_LIBRARY_IMAGE = 'https://image.tmdb.org/t/p/w500/69lJGPmFoUplHWoVnCbCcXKRqOl.jpg';
    var FG_LIBRARY_IMAGE = 'https://image.tmdb.org/t/p/w500/9zdZeAxt7Xxu5omPufFu1TMl8BP.jpg';
    var SP_HERO_IMAGE = 'https://avatars.mds.yandex.net/get-ott/18164279/2a0000019b6ed8b28b20b9273176de58eca9/2016x1134';
    var FG_HERO_IMAGE = 'https://i3.wp.com/wallpapercg.com/download/family-guy--22249.jpg';
    var SP_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/b/bc/South_Park_Logo.svg';
    var FG_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Family_Guy_Logo.svg';
    var SP_DESCRIPTION = 'Четверо школьников из маленького городка сталкиваются с абсурдом, сатирой и самыми безумными событиями современной Америки.';
    var FG_DESCRIPTION = 'Сатирическая анимационная комедия о семье из Куахога, где бытовые проблемы регулярно превращаются в полный хаос.';
    var TMDB_SHOW_CACHE = {};
    var TMDB_SEASON_CACHE = {};

    var SP_TITLE = 'Южный Парк';
    var PROGRESS_PREFIX = 'kkv1_progress_';

    var FG_TITLE = 'Гриффины';
    var FG_PROGRESS_PREFIX = 'fgv1_progress_';
    var FG_LAST_KEY = 'fgv1_last';
    var FG_POSTER = 'https://image.tmdb.org/t/p/w500/xtIFsv0Wpy29Bw7i8gUm1L9x6x8.jpg';
    var FG_CATALOG = {"1":{"1":["Филиза","Ren-TV"],"2":["Филиза","Ren-TV"],"3":["Филиза"],"4":["Филиза","Ren-TV"],"5":["Филиза","Ren-TV"],"6":["Филиза","Ren-TV"],"7":["Филиза","Ren-TV"]},"2":{"1":["Ren-TV"],"2":["Ren-TV"],"3":["Ren-TV"],"4":["Ren-TV"],"5":["Ren-TV"],"6":["Ren-TV"],"7":["Ren-TV"],"8":["Ren-TV"],"9":["Ren-TV"],"10":["Ren-TV"],"11":["Ren-TV"],"12":["Ren-TV"],"13":["Ren-TV"],"14":["Ren-TV"],"15":["Ren-TV"],"16":["Ren-TV"],"17":["Ren-TV"],"18":["Ren-TV"],"19":["Ren-TV"],"20":["Ren-TV"],"21":["Ren-TV"]},"3":{"1":["Ren-TV"],"2":["Ren-TV"],"3":["Ren-TV"],"4":["Филиза"],"5":["Ren-TV"],"6":["Ren-TV"],"7":["Ren-TV"],"8":["Ren-TV"],"9":["Ren-TV"],"10":["Ren-TV"],"11":["Ren-TV"],"12":["Ren-TV"],"13":["Ren-TV"],"14":["Ren-TV"],"15":["Ren-TV"],"16":["Ren-TV"],"17":["Ren-TV"],"18":["Ren-TV"],"19":["Ren-TV"],"20":["Ren-TV"],"21":["Ren-TV"],"22":["Ren-TV"]},"4":{"1":["Филиза","2x2"],"2":["Филиза","2x2"],"3":["Филиза","2x2"],"4":["Филиза","2x2"],"5":["Филиза","2x2"],"6":["Филиза","2x2"],"7":["Филиза","2x2"],"8":["Филиза","2x2"],"9":["Филиза","2x2"],"10":["Филиза","2x2"],"11":["Филиза","2x2"],"12":["Филиза","2x2"],"13":["Филиза","2x2"],"14":["Филиза","2x2"],"15":["Филиза","2x2"],"16":["Филиза","2x2"],"17":["Филиза","2x2"],"18":["Филиза","2x2"],"19":["Филиза","2x2"],"20":["Филиза","2x2"],"21":["Филиза","2x2"],"22":["Филиза","2x2"],"23":["Филиза","2x2"],"24":["Филиза","2x2"],"26":["Филиза","2x2"],"27":["Филиза","2x2"]},"5":{"1":["Филиза","2x2"],"2":["Филиза","2x2"],"3":["Филиза","2x2"],"4":["Филиза","2x2"],"5":["Филиза","2x2"],"6":["Филиза","2x2"],"7":["Филиза","2x2"],"8":["Филиза","2x2"],"9":["Филиза","2x2"],"10":["Филиза","2x2"],"11":["Филиза","2x2"],"12":["Филиза","2x2"],"13":["Филиза","2x2"],"14":["Филиза","2x2"],"15":["Филиза","2x2"],"16":["Филиза","2x2"],"17":["Филиза","2x2"],"18":["Филиза","2x2"]},"6":{"1":["Филиза","2x2"],"2":["Филиза","2x2"],"3":["Филиза","2x2"],"4":["Филиза","2x2"],"5":["Филиза","2x2"],"6":["Филиза","2x2"],"7":["Филиза","2x2"],"8":["Филиза","2x2"],"9":["Филиза","2x2"],"10":["Филиза","2x2"],"11":["Филиза","2x2"],"12":["Филиза","2x2"]},"7":{"1":["Филиза","2x2"],"2":["Филиза","2x2"],"3":["Филиза","2x2"],"4":["Филиза","2x2"],"5":["Филиза","2x2"],"6":["Филиза","2x2"],"7":["Филиза","2x2"],"9":["Филиза","2x2"],"10":["Филиза","2x2"],"11":["Филиза","2x2"],"12":["Филиза","2x2"],"13":["Филиза","2x2"],"14":["Филиза","2x2"],"15":["Филиза","2x2"],"16":["Филиза","2x2"]},"8":{"1":["Филиза","2x2"],"2":["Филиза","2x2"],"3":["Филиза","2x2"],"4":["Филиза","2x2"],"5":["Филиза","2x2"],"6":["Филиза","2x2"],"7":["Филиза","2x2"],"8":["Филиза","2x2"],"9":["Филиза","2x2"],"10":["Филиза","2x2"],"11":["Филиза","2x2"],"12":["Филиза","2x2"],"13":["Филиза","2x2"],"14":["Филиза","2x2"],"15":["Филиза","2x2"],"16":["Филиза","2x2"],"17":["Филиза","2x2"],"18":["Филиза","2x2"],"19":["Филиза","2x2"],"20":["Филиза","2x2"],"21":["Филиза","2x2"]},"9":{"1":["Филиза","2x2"],"2":["Филиза","2x2"],"3":["Филиза","2x2"],"4":["Филиза","2x2"],"5":["Филиза","2x2"],"6":["Филиза","2x2"],"7":["Филиза","2x2"],"8":["Филиза","2x2"],"9":["Филиза","2x2"],"10":["Филиза","2x2"],"11":["Филиза","2x2"],"12":["Филиза","2x2"],"13":["Филиза","2x2"],"14":["Филиза","2x2"],"15":["Филиза","2x2"],"16":["Филиза","2x2"],"17":["Филиза","2x2"],"18":["Филиза","2x2"]},"10":{"1":["Филиза","2x2"],"2":["Филиза","2x2"],"3":["Филиза","2x2"],"4":["Филиза","2x2"],"5":["Филиза","2x2"],"6":["Филиза","2x2"],"7":["Филиза","2x2"],"8":["Филиза","2x2"],"9":["Филиза","2x2"],"10":["Филиза","2x2"],"11":["Филиза","2x2"],"12":["Филиза","2x2"],"13":["Филиза","2x2"],"14":["Филиза","2x2"],"15":["Филиза","2x2"],"16":["Филиза","2x2"],"17":["Филиза","2x2"],"18":["Филиза","2x2"],"19":["Филиза","2x2"],"20":["Филиза","2x2"],"21":["Филиза","2x2"],"22":["Филиза","2x2"],"23":["Филиза","2x2"]},"11":{"1":["Филиза","2x2"],"2":["Филиза","2x2"],"3":["Филиза","2x2"],"4":["Филиза","2x2"],"5":["Филиза","2x2"],"6":["Филиза","2x2"],"7":["Филиза","2x2"],"8":["Филиза","2x2"],"9":["Филиза","2x2"],"10":["Филиза","2x2"],"11":["Филиза","2x2"],"12":["Филиза","2x2"],"13":["Филиза","2x2"],"14":["Филиза","2x2"],"15":["Филиза","2x2"],"16":["Филиза","2x2"],"17":["Филиза","2x2"],"18":["Филиза","2x2"],"19":["Филиза","2x2"],"20":["Филиза","2x2"],"21":["Филиза","2x2"],"22":["Филиза","2x2"]},"12":{"1":["Филиза","2x2"],"2":["Филиза","2x2"],"3":["Филиза","2x2"],"4":["Филиза","2x2"],"5":["Филиза","2x2"],"6":["Филиза","2x2"],"7":["2x2"],"8":["Филиза","2x2"],"9":["Филиза","2x2"],"10":["Филиза","2x2"],"11":["Филиза","2x2"],"12":["Филиза","2x2"],"13":["Филиза","2x2"],"14":["Филиза","2x2"],"15":["Филиза","2x2"],"16":["Филиза","2x2"],"17":["Филиза","2x2"],"18":["Филиза","2x2"],"19":["Филиза","2x2"],"20":["Филиза","2x2"],"21":["Филиза","2x2"]},"13":{"1":["Филиза","2x2"],"2":["Филиза","2x2"],"3":["Филиза","2x2"],"4":["Филиза","2x2"],"5":["Филиза","2x2"],"6":["Филиза","2x2"],"7":["Филиза","2x2"],"8":["Филиза","2x2"],"9":["Филиза","2x2"],"10":["Филиза","2x2"],"11":["Филиза","2x2"],"12":["Филиза","2x2"],"13":["Филиза","2x2"],"14":["Филиза","2x2"],"15":["Филиза","2x2"],"16":["Филиза","2x2"],"17":["Филиза","2x2"],"18":["Филиза","2x2"]},"14":{"1":["Филиза"],"2":["Филиза"],"3":["Филиза"],"4":["Филиза"],"5":["Филиза"],"6":["Филиза"],"7":["Филиза"],"8":["Филиза"],"9":["Филиза"],"10":["Филиза"],"11":["Филиза"],"12":["Филиза"],"13":["Филиза"],"14":["Филиза"],"15":["Филиза","Omskbird"],"16":["Филиза","Omskbird"],"17":["Филиза","Omskbird"],"18":["Филиза","Omskbird"],"19":["Филиза","Omskbird"],"20":["Филиза","Omskbird"]},"15":{"1":["Филиза","Omskbird"],"2":["Филиза","Omskbird"],"3":["Филиза","Omskbird"],"4":["Филиза","Omskbird"],"5":["Филиза","Omskbird"],"6":["Филиза","Omskbird"],"7":["Филиза","Omskbird"],"8":["Филиза","Omskbird"],"9":["Филиза","Omskbird"],"10":["Филиза","Omskbird"],"11":["Филиза","Omskbird"],"12":["Филиза","Omskbird"],"13":["Филиза","Omskbird"],"14":["Omskbird"],"15":["Филиза","Omskbird"],"16":["Филиза","Omskbird"],"17":["Филиза","Omskbird"],"18":["Omskbird"],"19":["Omskbird"],"20":["Omskbird"]},"16":{"1":["Omskbird"],"2":["Omskbird"],"3":["Omskbird"],"4":["Omskbird"],"5":["Omskbird"],"6":["Omskbird"],"7":["Omskbird"],"8":["Omskbird"],"9":["Omskbird"],"10":["Omskbird"],"11":["Omskbird"],"12":["Omskbird"],"13":["Omskbird"],"14":["Omskbird"],"15":["Omskbird"],"16":["Omskbird"],"17":["Omskbird"],"18":["Omskbird"],"19":["Omskbird"],"20":["Omskbird"]},"17":{"1":["Филиза","Omskbird"],"2":["Филиза","Omskbird"],"3":["Филиза","Omskbird"],"4":["Филиза","Omskbird"],"5":["Филиза","Omskbird"],"6":["Филиза","Omskbird"],"7":["Филиза","Omskbird"],"8":["Филиза","Omskbird"],"9":["Филиза","Omskbird"],"10":["Филиза","Omskbird"],"11":["Филиза","Omskbird"],"12":["Omskbird"],"14":["Omskbird"],"15":["Omskbird"],"16":["Omskbird"],"17":["Omskbird"],"18":["Omskbird"],"19":["Omskbird"],"20":["Omskbird"]},"18":{"1":["Omskbird"],"2":["Omskbird"],"3":["Omskbird"],"4":["Omskbird"],"5":["Omskbird"],"6":["Omskbird"],"7":["Omskbird"],"8":["Omskbird"],"9":["Omskbird"],"10":["Omskbird"],"11":["Omskbird"],"12":["Omskbird"],"13":["Omskbird"],"14":["Omskbird"],"15":["Omskbird"],"16":["Omskbird"],"17":["Omskbird"],"18":["Omskbird"],"19":["Omskbird"],"20":["Omskbird"]},"19":{"1":["2x2","Omskbird"],"2":["2x2","Omskbird"],"3":["2x2","Omskbird"],"4":["2x2","Omskbird"],"5":["2x2","Omskbird"],"6":["2x2","Omskbird"],"7":["2x2","Omskbird"],"8":["2x2","Omskbird"],"9":["2x2","Omskbird"],"10":["2x2","Omskbird"],"11":["2x2","Omskbird"],"12":["2x2","Omskbird"],"13":["2x2","Omskbird"],"14":["2x2","Omskbird"],"15":["2x2","Omskbird"],"16":["2x2","Omskbird"],"17":["2x2","Omskbird"],"18":["2x2","Omskbird"],"19":["2x2","Omskbird"],"20":["2x2","Omskbird"]},"20":{"1":["Omskbird"],"2":["Omskbird"],"3":["Omskbird"],"4":["Omskbird"],"5":["Omskbird"],"6":["Omskbird"],"7":["Omskbird"],"8":["Omskbird"],"9":["Omskbird"],"10":["Omskbird"],"11":["Omskbird"],"12":["Omskbird"],"13":["Omskbird"],"14":["Omskbird"],"15":["Omskbird"],"16":["Omskbird"],"17":["Omskbird"],"18":["Omskbird"],"19":["Omskbird"],"20":["Omskbird"]},"21":{"1":["Omskbird"],"2":["Omskbird"],"3":["Omskbird"],"4":["Omskbird"],"5":["Omskbird"],"6":["Omskbird"],"7":["Omskbird"],"8":["Omskbird"],"9":["Omskbird"],"10":["Omskbird"],"11":["Omskbird"],"12":["Omskbird"],"13":["Omskbird"],"14":["Omskbird"],"15":["Omskbird"],"16":["Omskbird"],"17":["Omskbird"],"18":["Omskbird"],"19":["Omskbird"],"20":["Omskbird"]},"22":{"2":["Omskbird"],"3":["Omskbird"],"4":["Omskbird"],"5":["Omskbird"],"6":["Omskbird"],"7":["Omskbird"],"8":["Omskbird"],"9":["Omskbird"],"10":["Omskbird"],"11":["Omskbird"],"12":["Omskbird"],"13":["Omskbird"],"14":["Omskbird"],"15":["Omskbird"]},"23":{"1":["Omskbird"],"2":["Omskbird"],"3":["Omskbird"],"4":["Omskbird"],"5":["Omskbird"],"6":["Omskbird"],"7":["Omskbird"],"8":["Omskbird"],"9":["Omskbird"],"10":["Omskbird"],"11":["Omskbird"],"12":["Omskbird"],"13":["Omskbird"],"14":["Omskbird"],"15":["Omskbird"],"16":["Omskbird"],"17":["Omskbird"],"18":["Omskbird"],"19":["Omskbird"],"20":["Omskbird"]},"24":{"1":["Omskbird"],"2":["Omskbird"],"4":["Omskbird"],"5":["Omskbird"],"6":["Omskbird"],"7":["Omskbird"],"8":["Omskbird"],"9":["Omskbird"],"10":["Omskbird"],"11":["Omskbird"],"12":["Omskbird"],"13":["Omskbird"],"14":["Omskbird"],"15":["Omskbird"]}};
    var FG_VOICE_RULES = {
        'Филиза': { id: 'filiza', label: 'Филиза', slug: 'filiza' },
        'Ren-TV': { id: 'rentv', label: 'Ren-TV', slug: 'rentv' },
        '2x2': { id: '2x2', label: '2x2', slug: '2x2' },
        'Omskbird': { id: 'omskbird', label: 'Omskbird', slug: 'omskbird' }
    };


    function tmdbImage(path, size) {
        if (!path) return '';
        if (/^https?:/i.test(path)) return path;
        try {
            if (Lampa.Api && Lampa.Api.img) return Lampa.Api.img(path, size || 'w780');
        } catch (e) {}
        return 'https://image.tmdb.org/t/p/' + (size || 'w780') + path;
    }

    function loadTmdbShow(id, done) {
        if (TMDB_SHOW_CACHE[id]) return done(TMDB_SHOW_CACHE[id], false);
        try {
            Lampa.Api.full({id:id, source:'tmdb', method:'tv'}, function (data) {
                var movie = data && data.movie ? data.movie : {};
                TMDB_SHOW_CACHE[id] = movie;
                done(movie, false);
            }, function () { done({}, true); });
        } catch (e) { done({}, true); }
    }

    function loadTmdbSeason(id, season, done) {
        var key = id + ':' + season;
        if (TMDB_SEASON_CACHE[key]) return done(TMDB_SEASON_CACHE[key], false);
        try {
            Lampa.Api.seasons({id:id, source:'tmdb'}, [season], function (data) {
                var item = data && (data[String(season)] || data[season]) || {};
                TMDB_SEASON_CACHE[key] = item;
                done(item, false);
            });
        } catch (e) { done({}, true); }
    }

    function injectCloverdaleStyle() {
        if (document.getElementById('cloverdale-style-v057')) return;
        var oldStyle = document.getElementById('cloverdale-style-v056') || document.getElementById('cloverdale-style-v055') || document.getElementById('cloverdale-style-v054') || document.getElementById('cloverdale-style-v053') || document.getElementById('cloverdale-style-v052') || document.getElementById('cloverdale-style-v051') || document.getElementById('cloverdale-style-v050');
        if (oldStyle && oldStyle.parentNode) oldStyle.parentNode.removeChild(oldStyle);
        var css = '' +
        '.cloverdale-screen{background:' + CLOVERDALE_BG + ' !important;}' +
        '.cloverdale-screen .activity__body,.cloverdale-screen .main,.cloverdale-screen .scroll__body{background:' + CLOVERDALE_BG + ';}' +
        '.cloverdale-screen .card__view{border-radius:1.05em;overflow:hidden;background:#353535;}' +
        '.cloverdale-screen .card__img{object-fit:cover;}' +
        '.cloverdale-screen .card__title{font-weight:600;}' +
        '.cloverdale-library .card{max-width:16em;margin-right:1.25em;}' +
        '.cloverdale-library .card__view{aspect-ratio:3/4;height:auto !important;}' +
        '.cloverdale-grid .card{box-sizing:border-box;margin-right:1.15em;margin-bottom:1.1em;}' +'.cloverdale-grid .card__view{aspect-ratio:3/4;height:auto !important;}' +
        
        '.cloverdale-bottom-space{height:8em;min-height:8em;pointer-events:none;}' +
        '@media(max-width:900px){.cloverdale-bottom-space{height:11em;min-height:11em}}';
        var style = document.createElement('style');
        style.id = 'cloverdale-style-v057';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function decorateScreen(activity, mode) {
        injectCloverdaleStyle();
        try {
            var render = activity.render();
            render.addClass('cloverdale-screen');
            if (mode === 'library') render.addClass('cloverdale-library');
            else {
                render.addClass('cloverdale-grid');
                if (mode === 'sp_episodes' || mode === 'fg_episodes') render.addClass('cloverdale-episodes');
            }
            var scrollTarget = render.find('.scroll__body').first();
            if (!scrollTarget.length) scrollTarget = render.find('.activity__body').first();
            if (scrollTarget.length && !scrollTarget.children('.cloverdale-bottom-space').length) {
                scrollTarget.append($('<div class="cloverdale-bottom-space"></div>'));
            }
        } catch (e) {}
    }

    var SCRIPT_URL = (document.currentScript && document.currentScript.src) || '';
    var ASSET_BASE = SCRIPT_URL
        ? SCRIPT_URL.split('?')[0].replace(/[^/]+$/, '')
        : 'https://cloverdlae.github.io/sp-lampa/';

    var CATALOG_URLS = [
        ASSET_BASE + 'catalog.json?v=' + encodeURIComponent(VERSION),
        'https://raw.githubusercontent.com/cloverdlae/sp-lampa/main/catalog.json'
    ];

    /*
     * Known direct HLS rules supplied separately by the user.
     * Add only verified season rules here.
     */
    var STREAM_RULES = {
        1:  [{ id: 'mtv',       label: 'MTV',       base: 'https://cdn.videozcdn.uk/video/killkenny/s1-mtv/',        suffix: '.mp4/index.m3u8' }],
        2:  [{ id: 'mtv',       label: 'MTV',       base: 'https://cdn.videozcdn.uk/video/killkenny/s2-mtv/',        suffix: '.mp4/index.m3u8' }],
        3:  [{ id: 'mtv',       label: 'MTV',       base: 'https://cdn.videozcdn.uk/video/killkenny/s3-mtv/',        suffix: '.mp4/index.m3u8' }],
        4:  [{ id: 'mtv',       label: 'MTV',       base: 'https://cdn.videozcdn.uk/video/killkenny/s4-mtv/',        suffix: '.mp4/index.m3u8' }],
        5:  [{ id: 'mtv',       label: 'MTV',       base: 'https://cdn.videozcdn.uk/video/killkenny/s5-mtv/',        suffix: '.mp4/index.m3u8' }],
        6:  [{ id: 'mtv',       label: 'MTV',       base: 'https://cdn.videozcdn.uk/video/killkenny/s6-mtv/',        suffix: '.mp4/index.m3u8' }],
        7:  [{ id: 'mtv',       label: 'MTV',       base: 'https://cdn.videozcdn.uk/video/killkenny/s7-mtv/',        suffix: '.mp4/index.m3u8' }],
        8:  [{ id: 'mtv',       label: 'MTV',       base: 'https://cdn.videozcdn.uk/video/killkenny/s8-mtv/',        suffix: '.mp4/index.m3u8' }],
        9:  [{ id: 'mtv',       label: 'MTV',       base: 'https://cdn.videozcdn.uk/video/killkenny/s9-mtv/',        suffix: '.mp4/index.m3u8' }],
        10: [{ id: 'mtv',       label: 'MTV',       base: 'https://cdn.videozcdn.uk/video/killkenny/s10-mtv/',       suffix: '.mp4/index.m3u8' }],
        11: [{ id: 'mtv',       label: 'MTV',       base: 'https://cdn.videozcdn.uk/video/killkenny/s11-mtv/',       suffix: '.mp4/index.m3u8' }],
        12: [{ id: 'mtv',       label: 'MTV',       base: 'https://cdn.videozcdn.uk/video/killkenny/s12-mtv/',       suffix: '.mp4/index.m3u8' }],
        13: [{ id: 'mtv',       label: 'MTV',       base: 'https://cdn.videozcdn.uk/video/killkenny/s13-mtv/',       suffix: '.mp4/index.m3u8' }],

        14: [
            { id: 'mtv',       label: 'MTV',       base: 'https://cdn.videozcdn.uk/video/killkenny/s14-mtv/',       suffix: '.mp4/index.m3u8' },
            { id: 'paramount', label: 'Paramount', base: 'https://cdn.videozcdn.uk/video/killkenny/s14-paramount/', suffix: '.mp4/index.m3u8' }
        ],

        15: [{ id: 'paramount', label: 'Paramount', base: 'https://cdn.videozcdn.uk/video/killkenny/s15-paramount/', suffix: '.mp4/index.m3u8' }],
        16: [{ id: 'paramount', label: 'Paramount', base: 'https://cdn.videozcdn.uk/video/killkenny/s16-paramount/', suffix: '.mp4/index.m3u8' }],
        17: [{ id: 'paramount', label: 'Paramount', base: 'https://cdn.videozcdn.uk/video/killkenny/s17-paramount/', suffix: '.mp4/index.m3u8' }],
        18: [{ id: 'paramount', label: 'Paramount', base: 'https://cdn.videozcdn.uk/video/killkenny/s18-paramount/', suffix: '.mp4/index.m3u8' }],
        19: [{ id: 'paramount', label: 'Paramount', base: 'https://cdn.videozcdn.uk/video/killkenny/s19-paramount/', suffix: '.mp4/index.m3u8' }],
        20: [{ id: 'paramount', label: 'Paramount', base: 'https://cdn.videozcdn.uk/video/killkenny/s20-paramount/', suffix: '.mp4/index.m3u8' }],
        21: [{ id: 'paramount', label: 'Paramount', base: 'https://cdn.videozcdn.uk/video/killkenny/s21-paramount/', suffix: '.mp4/index.m3u8' }],
        22: [{ id: 'paramount', label: 'Paramount', base: 'https://cdn.videozcdn.uk/video/killkenny/s22-paramount/', suffix: '.mp4/index.m3u8' }],
        23: [{ id: 'paramount', label: 'Paramount', base: 'https://cdn.videozcdn.uk/video/killkenny/s23-paramount/', suffix: '.mp4/index.m3u8' }],
        24: [{ id: 'paramount', label: 'Paramount', base: 'https://cdn.videozcdn.uk/video/killkenny/s24-paramount/', suffix: '.mp4/index.m3u8' }],

        25: [{ id: 'paramount', label: 'Paramount', base: 'https://cdn.videozcdn.uk/video/spark/s25-paramount/', suffix: '.mp4/index.m3u8' }],
        26: [{ id: 'paramount', label: 'Paramount', base: 'https://cdn.videozcdn.uk/video/spark/s26-paramount/', suffix: '.mp4/index.m3u8' }],
        27: [{ id: 'paramount', label: 'Paramount', base: 'https://cdn.videozcdn.uk/video/spark/s27-paramount/', suffix: '.mp4/index.m3u8' }],
        28: [{ id: 'paramount', label: 'Paramount', base: 'https://cdn.videozcdn.uk/video/spark/s28-paramount/', suffix: '.mp4/index.m3u8' }]
    };

    var catalogCache = null;

    var ICON =
        '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2">' +
            '<rect x="3" y="4" width="18" height="16" rx="2"></rect>' +
            '<path d="M7 8h10M7 12h10M7 16h6"></path>' +
        '</svg>';

    function appDigital() {
        try {
            return Number(Lampa.Manifest.app_digital || 0);
        } catch (e) {
            return 0;
        }
    }

    function pad2(value) {
        value = parseInt(value, 10) || 0;
        return value < 10 ? ('0' + value) : String(value);
    }

    function streamSources(season) {
        return STREAM_RULES[parseInt(season, 10)] || [];
    }

    function streamRule(season, sourceId) {
        var sources = streamSources(season);

        if (!sources.length) return null;

        if (sourceId) {
            for (var i = 0; i < sources.length; i++) {
                if (sources[i].id === sourceId) return sources[i];
            }
        }

        return sources[0];
    }

    function streamUrl(season, episode, sourceId) {
        var rule = streamRule(season, sourceId);

        if (!rule) return '';

        return rule.base + pad2(episode) + rule.suffix;
    }



    function tmdbSeasonRecord(showId, season) {
        var show = TMDB_SHOW_CACHE[showId] || {};
        var seasons = show.seasons || [];
        for (var i=0;i<seasons.length;i++) if (parseInt(seasons[i].season_number,10) === parseInt(season,10)) return seasons[i];
        return null;
    }

    function tmdbEpisodeRecord(showId, season, episode) {
        var data = TMDB_SEASON_CACHE[showId + ':' + season] || {};
        var eps = data.episodes || [];
        for (var i=0;i<eps.length;i++) if (parseInt(eps[i].episode_number,10) === parseInt(episode,10)) return eps[i];
        return null;
    }

    function progressKey(episode) {
        return PROGRESS_PREFIX + 's' + pad2(episode.season) + 'e' + pad2(episode.episode);
    }

    function normalizeProgress(value) {
        value = value && typeof value === 'object' ? value : {};

        var time = parseFloat(value.time || 0);
        var duration = parseFloat(value.duration || 0);
        var percent = parseFloat(value.percent || 0);

        if (!isFinite(time) || time < 0) time = 0;
        if (!isFinite(duration) || duration < 0) duration = 0;

        if ((!isFinite(percent) || percent < 0) && duration > 0) {
            percent = Math.round(time / duration * 100);
        }

        if (!isFinite(percent) || percent < 0) percent = 0;
        if (percent > 100) percent = 100;

        return {
            time: time,
            duration: duration,
            percent: percent,
            updated_at: value.updated_at || 0
        };
    }

    function readProgress(episode) {
        try {
            return normalizeProgress(Lampa.Storage.get(progressKey(episode), {}));
        } catch (e) {
            return normalizeProgress({});
        }
    }

    function saveProgress(episode, percent, time, duration) {
        var data = normalizeProgress({
            percent: percent,
            time: time,
            duration: duration,
            updated_at: Date.now()
        });

        try {
            Lampa.Storage.set(progressKey(episode), data);
        } catch (e) {}

        return data;
    }

    function clearProgress(episode) {
        try {
            Lampa.Storage.set(progressKey(episode), {
                percent: 0,
                time: 0,
                duration: 0,
                updated_at: Date.now()
            });
        } catch (e) {}
    }

    function timelineForEpisode(episode, restart) {
        var saved = restart ? normalizeProgress({}) : readProgress(episode);

        return {
            percent: saved.percent,
            time: saved.time,
            duration: saved.duration,
            handler: function (percent, time, duration) {
                saveProgress(episode, percent, time, duration);
            }
        };
    }

    function formatTime(seconds) {
        seconds = Math.max(0, Math.floor(parseFloat(seconds || 0)));

        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = seconds % 60;

        function two(value) {
            return value < 10 ? ('0' + value) : String(value);
        }

        return hours
            ? (hours + ':' + two(minutes) + ':' + two(secs))
            : (minutes + ':' + two(secs));
    }

    function progressLabel(episode) {
        var progress = readProgress(episode);

        if (progress.percent >= 90) {
            return {
                type: 'watched',
                text: '✓ просмотрено',
                progress: progress
            };
        }

        if (progress.time > 10) {
            return {
                type: 'continue',
                text: '▶ продолжить с ' + formatTime(progress.time),
                progress: progress
            };
        }

        return {
            type: 'new',
            text: '▶ OK — смотреть',
            progress: progress
        };
    }

    function fallbackCatalog() {
        var seasons = {};

        for (var i = 1; i <= 28; i++) {
            seasons[String(i)] = {
                season: i,
                title: i + ' сезон',
                episodes: []
            };
        }

        return {
            version: 1,
            source: 'kill-kenny.com',
            updated_at: null,
            seasons: seasons
        };
    }

    function parseCatalog(text) {
        var data = typeof text === 'string' ? JSON.parse(text) : text;

        if (!data || typeof data !== 'object') throw new Error('bad catalog');
        if (!data.seasons || typeof data.seasons !== 'object') throw new Error('no seasons');

        return data;
    }

    function loadText(url, success, fail) {
        if (typeof fetch === 'function') {
            fetch(url, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-store'
            })
            .then(function (response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.text();
            })
            .then(success)
            .catch(function () {
                requestFallback(url, success, fail);
            });

            return;
        }

        requestFallback(url, success, fail);
    }

    function requestFallback(url, success, fail) {
        try {
            var NetworkClass = Lampa.Request || Lampa.Reguest;

            if (!NetworkClass) {
                fail(new Error('Lampa Request API unavailable'));
                return;
            }

            var network = new NetworkClass();

            network.silent(
                url,
                function (data) {
                    success(typeof data === 'string' ? data : String(data || ''));
                },
                fail,
                false,
                {
                    dataType: 'text',
                    cache: {
                        life: 5
                    }
                }
            );
        } catch (e) {
            fail(e);
        }
    }

    function loadCatalog(done) {
        if (catalogCache) {
            done(catalogCache, false);
            return;
        }

        var index = 0;

        function next() {
            if (index >= CATALOG_URLS.length) {
                catalogCache = fallbackCatalog();
                done(catalogCache, true);
                return;
            }

            var url = CATALOG_URLS[index++];

            loadText(
                url,
                function (text) {
                    try {
                        catalogCache = parseCatalog(text);
                        done(catalogCache, false);
                    } catch (e) {
                        next();
                    }
                },
                next
            );
        }

        next();
    }

    function seasonRecord(catalog, season) {
        return catalog &&
            catalog.seasons &&
            (catalog.seasons[String(season)] || catalog.seasons[season]);
    }

    function firstPoster(seasonData) {
        if (!seasonData || !seasonData.episodes) return '';

        for (var i = 0; i < seasonData.episodes.length; i++) {
            if (seasonData.episodes[i].poster) return seasonData.episodes[i].poster;
        }

        return '';
    }

    function chunks(items, size) {
        var out = [];

        for (var i = 0; i < items.length; i += size) {
            out.push(items.slice(i, i + size));
        }

        return out;
    }

    function seasonCard(seasonData) {
        var season = parseInt(seasonData.season, 10);
        var count = (seasonData.episodes || []).length;
        var tmSeason = tmdbSeasonRecord(SP_TMDB_ID, season);
        var tmSeasonPoster = tmSeason && tmSeason.poster_path ? tmdbImage(tmSeason.poster_path, 'w500') : '';
        var cardData = {
            title: 'Сезон ' + season,
            name: 'Сезон ' + season,
            original_name: count ? (count + ' серий • OK — открыть') : 'OK — открыть сезон',
            overview: count
                ? ('Сезон ' + season + ' • ' + count + ' серий')
                : ('Сезон ' + season),
            img: tmSeasonPoster || firstPoster(seasonData),
            kk_type: 'season',
            kk_season: season
        };

        cardData.params = {
            style: {
                name: 'small'
            },
            emit: {
                onFocus: function () {
                    updateBackground(cardData);
                },
                onlyEnter: function () {
                    pushSeason(season);
                }
            }
        };

        return cardData;
    }

    function episodeDisplayTitle(title, episodeNumber, showTitle) {
        var raw = String(title || '').replace(/\s+/g, ' ').trim();
        var names = [showTitle, SP_TITLE, FG_TITLE, 'South Park', 'Family Guy'];

        names.forEach(function (name) {
            if (!name) return;
            var escaped = String(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            raw = raw.replace(new RegExp('^' + escaped + '\\s*[:\\-–—|•]?\\s*', 'i'), '');
        });

        raw = raw.replace(/^Серия\s*\d+\s*[:\-–—|•]?\s*/i, '');
        raw = raw.replace(/^\d+\s*серия\s*[:\-–—|•]?\s*/i, '');
        raw = raw.replace(/^Episode\s*\d+\s*[:\-–—|•]?\s*/i, '');

        return String(episodeNumber) + '. ' + (raw || 'Без названия');
    }

    function episodeCard(episode) {
        var playable = streamSources(episode.season).length > 0;
        var watchState = progressLabel(episode);
        var tm = tmdbEpisodeRecord(SP_TMDB_ID, episode.season, episode.episode);

        var cardData = {
            title: episodeDisplayTitle((tm && tm.name) || episode.title, episode.episode, SP_TITLE),
            name: episodeDisplayTitle((tm && tm.name) || episode.title, episode.episode, SP_TITLE),
            original_name:
                'Сезон ' + episode.season +
                ' • Серия ' + episode.episode +
                (playable ? ' • ' + watchState.text : ' • OK — действия'),
            overview: (tm && tm.overview) || episode.description || '',
            img: (tm && tm.still_path) ? tmdbImage(tm.still_path, 'w780') : episode.poster || '',
            kk_type: 'episode',
            kk_episode: episode,
            kk_progress: watchState.progress
        };

        cardData.params = {
            style: {
                name: 'small'
            },
            emit: {
                onFocus: function () {
                    updateBackground(cardData);
                },
                onlyEnter: function () {
                    openEpisodeActions(episode);
                }
            }
        };

        return cardData;
    }

    function escapeHtml(value) {
        if (Lampa.Utils && Lampa.Utils.escape) {
            return Lampa.Utils.escape(String(value || ''));
        }

        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function modalHtml(episode, stream) {
        var description = episode.description || 'Описание для этой серии пока отсутствует в catalog.json.';
        var poster = episode.poster || '';
        var progress = readProgress(episode);
        var progressText = '';

        if (progress.percent >= 90) {
            progressText = ' • просмотрено';
        } else if (progress.time > 10) {
            progressText = ' • сохранено ' + formatTime(progress.time);
        }

        var html =
            '<div class="kkv1-info" style="padding:.4em .2em 1em;line-height:1.45">' +
                (poster
                    ? '<div style="margin-bottom:1em"><img src="' + escapeHtml(poster) + '" style="max-width:26em;max-height:14em;border-radius:.6em;object-fit:cover"></div>'
                    : '') +
                '<div style="font-size:1.1em;opacity:.86">' + escapeHtml(description) + '</div>' +
                '<div style="margin-top:1em;opacity:.55;font-size:.86em">' +
                    'Сезон ' + episode.season + ' • Серия ' + episode.episode +
                    progressText +
                    (stream ? ' • HLS доступен' : ' • поток пока не настроен') +
                '</div>' +
            '</div>';

        return $(html);
    }

    function playEpisode(episode, sourceId, restart) {
        var rule = streamRule(episode.season, sourceId);
        var url = streamUrl(episode.season, episode.episode, sourceId);

        if (!rule || !url) {
            Lampa.Noty.show(
                'Для ' + episode.season + ' сезона поток пока не настроен'
            );
            return;
        }

        if (restart) {
            clearProgress(episode);
        }

        var all = [];
        var season = seasonRecord(catalogCache, episode.season);

        if (season && season.episodes) {
            season.episodes.forEach(function (item) {
                var itemUrl = streamUrl(item.season, item.episode, rule.id);

                if (itemUrl) {
                    var itemTm = tmdbEpisodeRecord(SP_TMDB_ID, item.season, item.episode);
                    all.push({
                        title: episodeDisplayTitle((itemTm && itemTm.name) || item.title, item.episode, SP_TITLE),
                        url: itemUrl,
                        season: item.season,
                        episode: item.episode,
                        img: (itemTm && itemTm.still_path) ? tmdbImage(itemTm.still_path, 'w780') : item.poster || '',
                        timeline: timelineForEpisode(item, false)
                    });
                }
            });
        }

        var currentTm = tmdbEpisodeRecord(SP_TMDB_ID, episode.season, episode.episode);
        var current = {
            title: episodeDisplayTitle((currentTm && currentTm.name) || episode.title, episode.episode, SP_TITLE),
            url: url,
            season: episode.season,
            episode: episode.episode,
            img: (currentTm && currentTm.still_path) ? tmdbImage(currentTm.still_path, 'w780') : episode.poster || '',
            timeline: timelineForEpisode(episode, !!restart)
        };

        try {
            Lampa.Storage.set('kkv1_last', {
                season: episode.season,
                episode: episode.episode,
                title: current.title,
                source: rule.id
            });
        } catch (e) {}

        Lampa.Player.play(current);
        Lampa.Player.playlist(all.length ? all : [current]);
    }

    function showEpisodeInfo(episode, controller) {
        var stream = streamSources(episode.season).length ? streamUrl(episode.season, episode.episode) : '';

        Lampa.Modal.open({
            title: episode.title || (episode.episode + ' серия'),
            html: modalHtml(episode, stream),
            size: 'medium',
            onBack: function () {
                if (controller) {
                    setTimeout(function () {
                        Lampa.Controller.toggle(controller);
                    }, 0);
                }
            }
        });
    }

    function openEpisodeActions(episode) {
        var controller = '';
        var sources = streamSources(episode.season);
        var progress = readProgress(episode);
        var canContinue = progress.time > 10 && progress.percent < 90;
        var items = [];

        try {
            controller = Lampa.Controller.enabled().name;
        } catch (e) {
            controller = 'content';
        }

        function addPlayAction(source, restart) {
            var sourceText = source.label ? (' • ' + source.label) : '';

            items.push({
                title:
                    (restart
                        ? '↺ Смотреть сначала'
                        : (canContinue
                            ? ('▶ Продолжить с ' + formatTime(progress.time))
                            : '▶ Смотреть')) +
                    sourceText,
                action: 'play',
                source: source.id,
                restart: !!restart
            });
        }

        if (sources.length) {
            sources.forEach(function (source) {
                addPlayAction(source, false);
            });

            if (canContinue) {
                sources.forEach(function (source) {
                    addPlayAction(source, true);
                });
            }
        } else {
            items.push({
                title: 'Поток для ' + episode.season + ' сезона пока не настроен',
                action: 'missing'
            });
        }

        items.push({
            title: 'О серии',
            action: 'info'
        });

        Lampa.Select.show({
            title: episode.title || (episode.episode + ' серия'),
            items: items,

            onSelect: function (item) {
                if (!item) return;

                if (item.action === 'play') {
                    Lampa.Select.close();

                    setTimeout(function () {
                        playEpisode(
                            episode,
                            item.source,
                            item.restart
                        );
                    }, 120);

                    return;
                }

                if (item.action === 'info') {
                    Lampa.Select.close();

                    setTimeout(function () {
                        showEpisodeInfo(episode, controller);
                    }, 120);

                    return;
                }

                if (item.action === 'missing') {
                    Lampa.Noty.show(
                        'Для ' + episode.season + ' сезона HLS пока не добавлен'
                    );
                }
            },

            onBack: function () {
                if (controller) {
                    setTimeout(function () {
                        Lampa.Controller.toggle(controller);
                    }, 0);
                }
            }
        });
    }

    function pushSeason(season) {
        Lampa.Activity.push({
            component: COMPONENT,
            title: SP_TITLE + ' • ' + season + ' сезон',
            hub_mode: 'sp_episodes',
            kk_season: season,
            page: 1
        });
    }

    function updateBackground(data) {
        if (!data || !data.img) return;

        try {
            Lampa.Background.change(data.img);
        } catch (e) {}
    }


    function buildSeasonLines(catalog) {
        var items = [];

        Object.keys(catalog.seasons || {})
            .map(function (key) {
                return seasonRecord(catalog, parseInt(key, 10));
            })
            .filter(Boolean)
            .sort(function (a, b) {
                return parseInt(a.season, 10) - parseInt(b.season, 10);
            })
            .forEach(function (seasonData) {
                items.push(seasonCard(seasonData));
            });

        return chunks(items, 4).map(function (group, index) {
            return {
                title: index === 0 ? 'Сезоны' : '',
                results: group,
                params: { items: { align_left: true, view: 4 } }
            };
        });
    }

    function buildEpisodeLines(catalog, seasonNumber) {
        var season = seasonRecord(catalog, seasonNumber);

        if (!season || !season.episodes || !season.episodes.length) {
            return [{
                title: seasonNumber + ' сезон',
                results: [{
                    title: 'Каталог серий ещё не обновлён',
                    name: 'Каталог серий ещё не обновлён',
                    original_name: 'Запусти GitHub Action Update catalog',
                    overview: '',
                    kk_type: 'info',
                    params: {
                        style: {
                            name: 'wide'
                        }
                    }
                }]
            }];
        }

        var episodes = season.episodes
            .slice()
            .sort(function (a, b) {
                return parseInt(a.episode, 10) - parseInt(b.episode, 10);
            })
            .map(episodeCard);

        return chunks(episodes, 4).map(function (group, index) {
            return {
                title: index === 0 ? 'Серии' : '',
                results: group,
                params: { items: { align_left: true, view: 4 } }
            };
        });
    }


    function libraryCard(options) {
        var cardData = {
            title: options.title,
            name: options.title,
            original_name: options.subtitle || 'OK — открыть',
            overview: options.overview || '',
            img: options.img || '',
            poster: options.img || '',
            backdrop: options.img || '',
            hub_show: options.id
        };

        cardData.params = {
            style: {
                name: 'small'
            },
            emit: {
                onFocus: function () {
                    updateBackground(cardData);
                },
                onlyEnter: function () {
                    openShow(options.id);
                }
            }
        };

        return cardData;
    }

    function buildLibraryLines(catalog) {
        var southParkImage = SP_LIBRARY_IMAGE;

        return [{
            title: 'Выберите сериал',
            results: [
                libraryCard({
                    id: 'southpark',
                    title: SP_TITLE,
                    subtitle: '28 сезонов • открыть',
                    overview: 'Южный Парк',
                    img: southParkImage
                }),
                libraryCard({
                    id: 'familyguy',
                    title: FG_TITLE,
                    subtitle: '24 сезона • 4 озвучки',
                    overview: FG_TITLE,
                    img: FG_LIBRARY_IMAGE
                })
            ],
            params: {
                items: {
                    align_left: true,
                    view: 4
                }
            }
        }];
    }

    function openShow(showId) {
        if (showId === 'southpark') {
            Lampa.Activity.push({
                component: COMPONENT,
                title: SP_TITLE,
                hub_mode: 'sp_seasons',
                page: 1
            });
            return;
        }

        if (showId === 'familyguy') {
            Lampa.Activity.push({
                component: COMPONENT,
                title: FG_TITLE,
                hub_mode: 'fg_seasons',
                page: 1
            });
        }
    }


    function loadFamilyGuyMeta(done) {
        loadTmdbShow(FG_TMDB_ID, function (show, fallback) { done(show, fallback); });
    }

    function fgMeta(season, episode) {
        var item = tmdbEpisodeRecord(FG_TMDB_ID, season, episode);
        if (!item) return null;
        return {
            title: item.name || (episode + ' серия'),
            description: item.overview || '',
            image: item.still_path ? tmdbImage(item.still_path, 'w780') : '',
            rating: Number(item.vote_average || 0)
        };
    }

    function fgSeasonHero(season) {
        var item = tmdbSeasonRecord(FG_TMDB_ID, season);
        return item ? {image: item.poster_path ? tmdbImage(item.poster_path, 'w780') : '', rating: Number(item.vote_average || 0), episode: 0, title: item.name || ''} : null;
    }

    function fgProgressKey(episode) {
        return FG_PROGRESS_PREFIX + 's' + pad2(episode.season) + 'e' + pad2(episode.episode);
    }

    function fgReadProgress(episode) {
        try { return normalizeProgress(Lampa.Storage.get(fgProgressKey(episode), {})); }
        catch (e) { return normalizeProgress({}); }
    }

    function fgSaveProgress(episode, percent, time, duration) {
        var data = normalizeProgress({ percent: percent, time: time, duration: duration, updated_at: Date.now() });
        try { Lampa.Storage.set(fgProgressKey(episode), data); } catch (e) {}
        return data;
    }

    function fgClearProgress(episode) {
        try { Lampa.Storage.set(fgProgressKey(episode), { percent: 0, time: 0, duration: 0, updated_at: Date.now() }); } catch (e) {}
    }

    function fgTimelineForEpisode(episode, restart) {
        var saved = restart ? normalizeProgress({}) : fgReadProgress(episode);
        return {
            percent: saved.percent,
            time: saved.time,
            duration: saved.duration,
            handler: function (percent, time, duration) { fgSaveProgress(episode, percent, time, duration); }
        };
    }

    function fgProgressLabel(episode) {
        var progress = fgReadProgress(episode);
        if (progress.percent >= 90) return { type: 'watched', text: '✓ просмотрено', progress: progress };
        if (progress.time > 10) return { type: 'continue', text: '▶ продолжить с ' + formatTime(progress.time), progress: progress };
        return { type: 'new', text: '▶ OK — смотреть', progress: progress };
    }

    function fgVoices(season, episode) {
        var s = FG_CATALOG[String(season)] || {};
        return s[String(episode)] || [];
    }

    function fgStreamUrl(season, episode, voice) {
        var rule = FG_VOICE_RULES[voice];
        if (!rule) return '';
        return 'https://cdn.videozcdn.uk/video/griffinyru/s' + pad2(season) + '-' + rule.slug + '/' + pad2(episode) + '.mp4/index.m3u8';
    }

    function fgEpisodeData(season, episode) {
        var seasonNumber = parseInt(season, 10) || 0;
        var episodeNumber = parseInt(episode, 10) || 0;
        var meta = fgMeta(seasonNumber, episodeNumber);
        return {
            show: 'familyguy', season: seasonNumber, episode: episodeNumber,
            title: (meta && meta.title) ? meta.title : '',
            description: meta ? meta.description : '',
            poster: (meta && meta.image) ? meta.image : FG_POSTER,
            voices: fgVoices(seasonNumber, episodeNumber)
        };
    }

    function fgSeasonCard(season) {
        var eps = Object.keys(FG_CATALOG[String(season)] || {}).map(function (x) { return parseInt(x,10); }).sort(function(a,b){return a-b;});
        var hero = fgSeasonHero(season);
        var seasonImage = hero && hero.image ? hero.image : FG_POSTER;
        var seasonSubtitle = eps.length + ' серий';
        if (hero && hero.rating > 0) seasonSubtitle += ' • ★ ' + hero.rating.toFixed(1);
        var cardData = {
            title: 'Сезон ' + season, name: 'Сезон ' + season,
            original_name: seasonSubtitle, overview: FG_TITLE + ' • ' + season + ' сезон', img: seasonImage,
            fg_type: 'season', fg_season: season
        };
        cardData.params = { style: { name: 'small' }, emit: {
            onFocus: function () { updateBackground(cardData); },
            onlyEnter: function () { pushFamilyGuySeason(season); }
        }};
        return cardData;
    }

    function fgEpisodeCard(episode) {
        var watchState = fgProgressLabel(episode);
        var cardData = {
            title: episodeDisplayTitle(episode.title, episode.episode, FG_TITLE), name: episodeDisplayTitle(episode.title, episode.episode, FG_TITLE),
            original_name: 'Сезон ' + episode.season + ' • Серия ' + episode.episode + ' • ' + watchState.text,
            overview: episode.voices.join(' • '), img: episode.poster || FG_POSTER,
            fg_type: 'episode', fg_episode: episode, fg_progress: watchState.progress
        };
        cardData.params = { style: { name: 'small' }, emit: {
            onFocus: function () { updateBackground(cardData); },
            onlyEnter: function () { openFamilyGuyEpisodeActions(episode); }
        }};
        return cardData;
    }

    function buildFamilyGuySeasonLines() {
        var seasons = Object.keys(FG_CATALOG).map(function(x){return parseInt(x,10);}).sort(function(a,b){return a-b;});
        var items = seasons.map(fgSeasonCard);
        return chunks(items, 4).map(function (group, index) {
            return { title: index === 0 ? 'Сезоны' : '', results: group, params: { items: { align_left: true, view: 4 } } };
        });
    }

    function buildFamilyGuyEpisodeLines(seasonNumber) {
        var eps = Object.keys(FG_CATALOG[String(seasonNumber)] || {}).map(function(x){return parseInt(x,10);}).sort(function(a,b){return a-b;});
        var episodes = eps.map(function(e){ return fgEpisodeCard(fgEpisodeData(seasonNumber,e)); });
        return chunks(episodes, 4).map(function (group, index) {
            return { title: index === 0 ? 'Серии' : '', results: group, params: { items: { align_left: true, view: 4 } } };
        });
    }

    function pushFamilyGuySeason(season) {
        Lampa.Activity.push({ component: COMPONENT, title: FG_TITLE + ' • ' + season + ' сезон', hub_mode: 'fg_episodes', kk_season: season, page: 1 });
    }

    function playFamilyGuyEpisode(episode, voice, restart) {
        if (restart) fgClearProgress(episode);
        var url = fgStreamUrl(episode.season, episode.episode, voice);
        if (!url) { Lampa.Noty.show('Гриффины: поток не найден'); return; }

        var current = {
            title: FG_TITLE + ' • ' + episode.season + 'x' + pad2(episode.episode) + ' • ' + voice,
            url: url, season: episode.season, episode: episode.episode, img: episode.poster || FG_POSTER,
            timeline: fgTimelineForEpisode(episode, !!restart)
        };
        try { Lampa.Storage.set(FG_LAST_KEY, { season: episode.season, episode: episode.episode, title: current.title, voice: voice }); } catch (e) {}
        Lampa.Player.play(current);

        var seasonEpisodes = Object.keys(FG_CATALOG[String(episode.season)] || {}).map(function(x){return parseInt(x,10);}).sort(function(a,b){return a-b;});
        var playlist = seasonEpisodes.filter(function(ep){ return fgVoices(episode.season, ep).indexOf(voice)>=0; }).map(function(ep){
            var item=fgEpisodeData(episode.season, ep);
            return { title: FG_TITLE + ' • ' + item.season + 'x' + pad2(item.episode) + ' • ' + voice, url: fgStreamUrl(item.season,item.episode,voice), season:item.season, episode:item.episode, img:item.poster, timeline:fgTimelineForEpisode(item,false) };
        });
        Lampa.Player.playlist(playlist.length ? playlist : [current]);
    }

    function openFamilyGuyEpisodeActions(episode) {
        var progress = fgReadProgress(episode);
        var canContinue = progress.time > 10 && progress.percent < 90;
        var items = [];
        (episode.voices || []).forEach(function(voice){
            items.push({ title: canContinue ? ('▶ Продолжить с ' + formatTime(progress.time) + ' • ' + voice) : ('▶ Смотреть • ' + voice), action:'play', voice:voice, restart:false });
            if (canContinue) items.push({ title:'↺ Сначала • ' + voice, action:'play', voice:voice, restart:true });
        });
        items.push({title:'О серии',action:'info'});

        var controller='content';
        try { controller=Lampa.Controller.enabled().name; } catch(e) {}
        Lampa.Select.show({
            title: FG_TITLE + ' • ' + episode.season + 'x' + pad2(episode.episode), items:items,
            onSelect:function(item){
                if(!item)return;
                if(item.action==='play'){
                    Lampa.Select.close();
                    setTimeout(function(){playFamilyGuyEpisode(episode,item.voice,item.restart);},120);
                } else if(item.action==='info'){
                    Lampa.Select.close();
                    setTimeout(function(){
                        var html='<div style="padding:.5em;line-height:1.5"><div>'+escapeHtml(FG_TITLE+' • '+episode.voices.join(' / '))+'</div><div style="opacity:.6;margin-top:.7em">Сезон '+episode.season+' • Серия '+episode.episode+'</div></div>';
                        Lampa.Modal.open({title:episode.title,html:$(html),size:'medium',onBack:function(){setTimeout(function(){Lampa.Controller.toggle(controller);},0);}});
                    },120);
                }
            },
            onBack:function(){ if(controller)setTimeout(function(){Lampa.Controller.toggle(controller);},0); }
        });
    }

    function NativeComponent(object) {
        var comp = Lampa.Maker.make('Main', object || {});
        var mode = (object && object.hub_mode) || 'library';
        var seasonNumber = parseInt(object && object.kk_season, 10) || 0;

        comp.use({
            onCreate: function () {
                var self = this;

                self.activity.loader(true);

                function finish(lines) {
                    self.activity.loader(false);
                    self.build(lines);
                    setTimeout(function(){ decorateScreen(self.activity, mode); }, 0);
                }

                if (mode === 'fg_seasons') {
                    loadFamilyGuyMeta(function (meta, fallback) {
                        finish(buildFamilyGuySeasonLines());
                        if (fallback) Lampa.Noty.show('Кадры Гриффинов пока недоступны');
                    });
                    return;
                }

                if (mode === 'fg_episodes') {
                    loadFamilyGuyMeta(function (meta, fallback) {
                        loadTmdbSeason(FG_TMDB_ID, seasonNumber, function () {
                            finish(buildFamilyGuyEpisodeLines(seasonNumber));
                            if (fallback) Lampa.Noty.show('TMDB-метаданные Гриффинов пока недоступны');
                        });
                    });
                    return;
                }

                loadCatalog(function (catalog, fallback) {
                    function buildNow() {
                        var lines;
                        if (mode === 'sp_episodes') lines = buildEpisodeLines(catalog, seasonNumber);
                        else if (mode === 'sp_seasons') lines = buildSeasonLines(catalog);
                        else lines = buildLibraryLines(catalog);
                        finish(lines);
                        if (fallback && mode === 'sp_episodes') Lampa.Noty.show('catalog.json пока недоступен');
                    }

                    if (mode === 'sp_seasons') {
                        loadTmdbShow(SP_TMDB_ID, function () { buildNow(); });
                    } else if (mode === 'sp_episodes') {
                        loadTmdbShow(SP_TMDB_ID, function () {
                            loadTmdbSeason(SP_TMDB_ID, seasonNumber, function () { buildNow(); });
                        });
                    } else buildNow();
                });
            }
        });

        return comp;
    }

    function openCatalog() {
        Lampa.Activity.push({
            component: COMPONENT,
            title: TITLE,
            hub_mode: 'library',
            page: 1
        });
    }

    function init() {
        if (typeof Lampa === 'undefined') {
            setTimeout(init, 300);
            return;
        }

        if (window[PLUGIN_ID + '_ready']) return;

        if (appDigital() < 300 || !Lampa.Maker) {
            Lampa.Noty.show('Плагину нужна Lampa 3.x');
            return;
        }

        window[PLUGIN_ID + '_ready'] = true;

        Lampa.Component.add(COMPONENT, NativeComponent);

        if (Lampa.Menu && Lampa.Menu.addButton) {
            Lampa.Menu.addButton(
                ICON,
                TITLE,
                openCatalog
            );
        }

        try {
            if (Lampa.Manifest && Lampa.Manifest.plugins) {
                Lampa.Manifest.plugins[PLUGIN_ID] = {
                    type: 'other',
                    version: VERSION,
                    name: TITLE,
                    description: 'South Park + Гриффины • Cloverdale • v0.5.7'
                };
            }
        } catch (e) {}
    }

    if (window.appready) {
        init();
    } else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') init();
        });
    } else {
        setTimeout(init, 500);
    }
})();
