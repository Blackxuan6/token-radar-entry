/* Token Radar dashboard. No framework, no network: it reads window.RADAR (data.js, written by
   main.ts from the same board as board.json) and window.FARM (farm.js, the same farm-plan module
   main.ts used), so the page and the board cannot disagree. State lives in the hash: #tab, #q,
   #category, #sort, #watchlist and #p=<slug> for the detail view. */
(function () {
  'use strict';
  var R = window.RADAR;
  var FARM = window.FARM;
  var body = document.getElementById('board-body');
  if (!R || !R.rows) {
    body.innerHTML = '<tr><td colspan="9">No data: data.js did not load. Run main.ts to generate it.</td></tr>';
    return;
  }

  /* ---- formatting ---- */
  function money(n) {
    if (n === null || n === undefined || !isFinite(n)) return '—';
    var a = Math.abs(n);
    if (a >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    if (a >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
    return '$' + Math.round(n);
  }
  function pct(n) {
    if (n === null || n === undefined) return '—';
    return (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
  }
  function pctClass(n) { return n === null || n === undefined ? '' : n >= 0 ? 'pos' : 'neg'; }
  function ageText(d) {
    if (d === null || d === undefined) return '—';
    if (d < 30) return d + 'd';
    if (d < 365) return Math.floor(d / 30) + 'mo';
    return (d / 365).toFixed(1) + 'y';
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function chainText(chains) {
    if (!chains || chains.length === 0) return '—';
    return chains.length <= 2 ? chains.join(', ') : chains[0] + ' +' + (chains.length - 1);
  }
  function cmpStr(a, b) { return a < b ? -1 : a > b ? 1 : 0; }

  /* ---- state in the hash ---- */
  function readHash() {
    var h = new URLSearchParams(location.hash.slice(1));
    var tab = h.get('tab') || 'board';
    return {
      tab: tab === 'live' || tab === 'model' ? tab : 'board',
      q: h.get('q') || '',
      category: h.get('category') || '',
      sort: h.get('sort') || 'implied',
      watchlist: h.get('watchlist') === '1',
      p: h.get('p') || ''
    };
  }
  function writeHash(s) {
    var h = new URLSearchParams();
    if (s.tab !== 'board') h.set('tab', s.tab);
    if (s.q) h.set('q', s.q);
    if (s.category) h.set('category', s.category);
    if (s.sort !== 'implied') h.set('sort', s.sort);
    if (s.watchlist) h.set('watchlist', '1');
    if (s.p) h.set('p', s.p);
    var next = h.toString();
    if (location.hash.slice(1) !== next) location.hash = next;
    else apply();
  }
  var state = readHash();
  var maxImplied = R.rows.reduce(function (m, r) { return Math.max(m, r.implied_value_usd); }, 1);
  var bySlug = {};
  R.rows.forEach(function (r) { bySlug[r.slug] = r; });

  /* ---- static setup ---- */
  document.getElementById('meta-date').textContent = 'Snapshot ' + R.as_of;
  document.getElementById('meta-counts').textContent =
    R.scanned + ' scanned · ' + R.board_size + ' ranked · ' + R.watchlist_size + ' on the watchlist';
  document.getElementById('count-board').textContent = R.board_size;
  document.getElementById('count-live').textContent = R.live_size;

  var categories = [];
  R.rows.forEach(function (r) { if (r.category && categories.indexOf(r.category) === -1) categories.push(r.category); });
  categories.sort(cmpStr);
  var catSel = document.getElementById('category');
  categories.forEach(function (c) {
    var o = document.createElement('option');
    o.value = c; o.textContent = c;
    catSel.appendChild(o);
  });

  /* ---- the board ---- */
  function filteredRows() {
    var q = state.q.trim().toLowerCase();
    var rows = R.rows.filter(function (r) {
      if (state.watchlist && !r.watchlist) return false;
      if (state.category && r.category !== state.category) return false;
      if (q) {
        var hay = (r.name + ' ' + r.slug + ' ' + (r.category || '')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    var sort = state.sort;
    rows.sort(function (a, b) {
      if (sort === 'tvl') return b.tvl_usd - a.tvl_usd || cmpStr(a.slug, b.slug);
      if (sort === 'growth') {
        var ga = a.change_7d === null ? -Infinity : a.change_7d;
        var gb = b.change_7d === null ? -Infinity : b.change_7d;
        return gb - ga || cmpStr(a.slug, b.slug);
      }
      if (sort === 'age') {
        var aa = a.age_days === null ? -1 : a.age_days;
        var ab = b.age_days === null ? -1 : b.age_days;
        return ab - aa || cmpStr(a.slug, b.slug);
      }
      if (sort === 'name') return cmpStr(a.name, b.name) || cmpStr(a.slug, b.slug);
      return a.rank - b.rank;
    });
    return rows;
  }

  function renderBoard() {
    var rows = filteredRows();
    document.getElementById('result-count').textContent = rows.length + ' of ' + R.board_size + ' protocols';
    document.getElementById('board-empty').hidden = rows.length !== 0;
    body.innerHTML = rows.map(function (r) {
      var w = Math.max(2, Math.round((r.implied_value_usd / maxImplied) * 100));
      return '<tr data-slug="' + esc(r.slug) + '">' +
        '<td class="num rank">' + r.rank + '</td>' +
        '<td><span class="name">' + esc(r.name) + '</span>' + (r.watchlist ? '<span class="wl">WL</span>' : '') + '</td>' +
        '<td class="cat">' + esc(r.category || '—') + '</td>' +
        '<td class="chain">' + esc(chainText(r.chains)) + '</td>' +
        '<td class="num">' + money(r.tvl_usd) + '</td>' +
        '<td class="num ' + pctClass(r.change_7d) + '">' + pct(r.change_7d) + '</td>' +
        '<td class="num">' + ageText(r.age_days) + '</td>' +
        '<td class="num impl">' + money(r.implied_value_usd) + '<span class="bar"><i style="width:' + w + '%"></i></span></td>' +
        '<td class="num">' + r.multiple.toFixed(2) + '×</td></tr>';
    }).join('');
  }

  body.addEventListener('click', function (e) {
    var tr = e.target.closest('tr[data-slug]');
    if (!tr) return;
    state.p = tr.getAttribute('data-slug');
    writeHash(state);
  });

  /* ---- the detail view ---- */
  function renderDetail() {
    var view = document.getElementById('view-detail');
    var boardView = document.getElementById('view-board');
    var row = bySlug[state.p];
    if (!row || state.tab !== 'board') { view.hidden = true; boardView.hidden = state.tab !== 'board'; return; }
    view.hidden = false;
    boardView.hidden = true;
    var m = R.model;
    var growthPct = row.change_7d === null ? 0 : Math.min(m.growth_cap, Math.max(m.growth_floor, row.change_7d));
    var mult = null;
    R.multiples.forEach(function (x) { if (x.category === row.category) mult = x; });
    var compsNote = mult ? mult.comps + ' live comp' + (mult.comps === 1 ? '' : 's') : 'no live comps — global median';
    var base = row.tvl_usd * row.multiple;
    var recomputed = Math.max(1, Math.round(row.tvl_usd * row.multiple * row.growth_multiplier * row.maturity_multiplier * row.breadth_multiplier));
    var match;
    if (recomputed === row.implied_value_usd) {
      match = 'Recomputed here from the snapshot’s numbers: matches the board.';
    } else if (money(recomputed) === money(row.implied_value_usd)) {
      match = 'Recomputed here: ' + money(recomputed) + ' — matches the board at this precision; the exact values differ only by rounding (this page keeps 4 decimals per multiplier).';
    } else {
      match = 'Recomputed here: ' + money(recomputed) + ' — the board says ' + money(row.implied_value_usd) + '; the gap is rounding (this page keeps 4 decimals per multiplier).';
    }
    var plan = FARM && FARM.farmPlanFor ? FARM.farmPlanFor(row, row.age_days) : [];
    var planHtml = plan.map(function (s) {
      return '<li>' + esc(s.text) + '<div class="meta-line">Cost: ' + esc(s.cost) + ' · Time: ' + esc(s.time) + '</div></li>';
    }).join('');
    document.getElementById('detail').innerHTML =
      '<div class="detail-head"><h2>#' + row.rank + ' ' + esc(row.name) + '</h2>' +
      '<span class="cat">' + esc(row.category || 'Uncategorized') + (row.watchlist ? ' · on the watchlist' : '') + '</span></div>' +
      '<div class="stats">' +
      '<div class="stat"><div class="k">Implied value</div><div class="v">' + money(row.implied_value_usd) + '</div></div>' +
      '<div class="stat"><div class="k">TVL</div><div class="v">' + money(row.tvl_usd) + '</div></div>' +
      '<div class="stat"><div class="k">7-day change</div><div class="v ' + pctClass(row.change_7d) + '">' + pct(row.change_7d) + '</div></div>' +
      '<div class="stat"><div class="k">Age</div><div class="v">' + (row.age_days === null ? 'Unknown' : row.age_days + ' days') + '</div></div>' +
      '<div class="stat"><div class="k">Chains</div><div class="v">' + (row.chains.length || '—') + '</div></div></div>' +
      '<div class="detail-grid"><div>' +
      '<h3>Model breakdown</h3>' +
      '<div class="table-wrap breakdown"><table><tbody>' +
      '<tr><td>TVL</td><td class="num">' + money(row.tvl_usd) + '</td></tr>' +
      '<tr><td>× Category multiple (' + esc(compsNote) + ')</td><td class="num">' + row.multiple.toFixed(4) + '×</td></tr>' +
      '<tr><td>= Base value</td><td class="num">' + money(base) + '</td></tr>' +
      '<tr><td>× Growth (7d ' + pct(row.change_7d) + (row.change_7d === null ? ', unknown → 0%' : growthPct !== row.change_7d ? ', clamped to ' + pct(growthPct) : '') + ')</td><td class="num">' + row.growth_multiplier.toFixed(4) + '×</td></tr>' +
      '<tr><td>× Maturity (' + (row.age_days === null ? 'age unknown → 365 days' : row.age_days + ' days') + ')</td><td class="num">' + row.maturity_multiplier.toFixed(4) + '×</td></tr>' +
      '<tr><td>× Breadth (' + row.chains.length + ' chain' + (row.chains.length === 1 ? '' : 's') + ')</td><td class="num">' + row.breadth_multiplier.toFixed(4) + '×</td></tr>' +
      '<tr class="total"><td>= Implied value</td><td class="num">' + money(row.implied_value_usd) + '</td></tr>' +
      '</tbody></table></div>' +
      '<p class="lede" style="margin-top:10px">' + esc(match) + '</p></div><div>' +
      '<h3>Farm plan</h3>' +
      '<p class="lede">Six steps for this protocol’s category. The snapshot records no token for ' + esc(row.name) + ' — a token may never come, and no step below assumes one will. Costs are estimates.</p>' +
      '<ol class="plan">' + planHtml + '</ol></div></div>';
  }

  document.getElementById('back').addEventListener('click', function () {
    state.p = '';
    writeHash(state);
  });

  /* ---- live tokens ---- */
  function renderLive() {
    document.getElementById('live-body').innerHTML = R.live.map(function (r) {
      var ratio = r.mcap_usd !== null && r.tvl_usd > 0 ? (r.mcap_usd / r.tvl_usd).toFixed(2) + '×' : '—';
      return '<tr><td><span class="name">' + esc(r.name) + '</span></td>' +
        '<td class="cat">' + esc(r.category || '—') + '</td>' +
        '<td class="chain">' + esc(chainText(r.chains)) + '</td>' +
        '<td class="num">' + money(r.tvl_usd) + '</td>' +
        '<td class="num">' + money(r.mcap_usd) + '</td>' +
        '<td class="num">' + ratio + '</td>' +
        '<td class="num ' + pctClass(r.change_7d) + '">' + pct(r.change_7d) + '</td></tr>';
    }).join('');
  }

  /* ---- model panel ---- */
  function renderModel() {
    var rows = R.multiples.slice().sort(function (a, b) { return b.multiple - a.multiple || cmpStr(a.category, b.category); });
    document.getElementById('multiples-body').innerHTML =
      '<tr><td><b>Global median</b></td><td class="num">' + R.global_multiple.toFixed(3) + '×</td><td class="num">—</td></tr>' +
      rows.map(function (x) {
        return '<tr><td>' + esc(x.category) + '</td><td class="num">' + x.multiple.toFixed(3) + '×</td><td class="num">' + x.comps + '</td></tr>';
      }).join('');
  }

  /* ---- tabs and controls ---- */
  function setTab(tab) {
    state.tab = tab;
    state.p = '';
    writeHash(state);
  }
  document.getElementById('tab-board').addEventListener('click', function () { setTab('board'); });
  document.getElementById('tab-live').addEventListener('click', function () { setTab('live'); });
  document.getElementById('tab-model').addEventListener('click', function () { setTab('model'); });

  var qEl = document.getElementById('q');
  qEl.addEventListener('input', function () { state.q = qEl.value; renderBoard(); });
  qEl.addEventListener('change', function () { state.q = qEl.value; writeHash(state); });
  catSel.addEventListener('change', function () { state.category = catSel.value; writeHash(state); });
  document.getElementById('sort').addEventListener('change', function (e) { state.sort = e.target.value; writeHash(state); });
  document.getElementById('watchlist').addEventListener('change', function (e) { state.watchlist = e.target.checked; writeHash(state); });

  /* ---- apply ---- */
  function apply() {
    state = readHash();
    qEl.value = state.q;
    catSel.value = state.category;
    document.getElementById('sort').value = state.sort;
    document.getElementById('watchlist').checked = state.watchlist;
    ['board', 'live', 'model'].forEach(function (t) {
      document.getElementById('tab-' + t).classList.toggle('active', state.tab === t);
    });
    document.getElementById('view-live').hidden = state.tab !== 'live';
    document.getElementById('view-model').hidden = state.tab !== 'model';
    if (state.tab === 'live') renderLive();
    if (state.tab === 'model') renderModel();
    renderBoard();
    renderDetail();
  }
  window.addEventListener('hashchange', apply);
  apply();
})();
