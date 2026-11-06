/* JCUK smart member search. Works on the member list the page loads after the PIN.
 * Forgiving about: capitals, accents, hyphens ("al-utaibi" = "al utaibi" = "alutaibi"),
 * word order ("salman mahmoud"), partial words ("moh mar"), common spelling variants
 * (Mohammad/Mohammed/Muhammad, Abdallah/Abdullah, Basel/Basil, Sara/Sarah, Ahmad/Ahmed)
 * and small typos (one wrong letter, two in long words). Numbers match member numbers.
 */
(function (root) {
  'use strict';

  function norm(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9؀-ۿ]+/g, ' ').trim();
  }
  function words(s) { var n = norm(s); return n ? n.split(' ') : []; }

  // Sound-alike key: keep the consonant skeleton, so vowel spellings don't matter.
  function skel(w) {
    if (!w) return '';
    w = w.replace(/([aeiou])h$/, '$1')   // sarah -> sara, abdullah -> abdulla
      .replace(/ph/g, 'f').replace(/q/g, 'k').replace(/ou|oo|u/g, 'o');
    var first = /[aeiouy]/.test(w[0]) ? 'a' : w[0];
    var rest = w.slice(1).replace(/[aeiouy]/g, '');
    return (first + rest).replace(/(.)\1+/g, '$1');
  }

  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      var rowMin = i;
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (cur[j] < rowMin) rowMin = cur[j];
      }
      if (rowMin > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }

  // Common spellings of the same name. Names in different groups never count as sound-alikes
  // (e.g. Mohammad vs Mahmoud).
  var GROUPS = [
    'mohammad mohammed muhammad muhammed mohamad mohamed mohammod mohd mhmd',
    'ahmad ahmed', 'mahmoud mahmood mahmud', 'abdallah abdullah abdalla abdulla',
    'yousef yusuf youssef yousif yusef yousuf', 'omar umar', 'othman uthman osman', 'hussein husein hussain husain',
    'hassan hasan', 'ibrahim ebrahim', 'khaled khalid', 'walid waleed', 'majed majid', 'saeed said saied',
    'noor nour nur', 'eman iman', 'basel basil', 'sara sarah', 'reem rim', 'lina leena', 'rania ranya',
    'mustafa mostafa moustafa', 'tareq tariq tarek', 'zaid zayd zeid', 'fadi fadey', 'hamza hamzah', 'aya ayah',
    'abdulrahman abdelrahman abdalrahman', 'abdulkareem abdulkarim abdelkarim', 'abdulaziz abdelaziz'
  ];
  var CANON = {}, KNOWN = [];
  GROUPS.forEach(function (g) { var ws = g.split(' '); ws.forEach(function (w) { CANON[w] = ws[0]; KNOWN.push(w); }); });
  var canonCache = {};
  // Which name group a word belongs to, allowing one typo ("muhamad" -> mohammad), or '' if none.
  function canonOf(w) {
    if (CANON[w]) return CANON[w];
    if (w.length < 5) return '';
    if (w in canonCache) return canonCache[w];
    var best = '', bestD = 2;
    for (var i = 0; i < KNOWN.length; i++) {
      var d = lev(w, KNOWN[i], 1);
      if (d < bestD) { bestD = d; best = CANON[KNOWN[i]]; }
    }
    return (canonCache[w] = best);
  }

  // How well one typed word matches one name word (0 = not at all).
  function wordScore(q, w) {
    if (q === w) return 10;
    if (w.indexOf(q) === 0) return q.length >= 2 ? 8 : 6;
    if (q.length < 3) return 0;
    var cq = canonOf(q), cw = canonOf(w);
    if (cq && cq === cw) return 9;
    var sq = skel(q), sw = skel(w);
    if (!(cq && cw) && sq === sw) return 7;
    if (!(cq && cw) && sq.length >= 2 && sw.indexOf(sq) === 0) return 5;
    if (w.indexOf(q) !== -1) return 4;
    var max = q.length >= 7 ? 2 : (q.length >= 4 ? 1 : 0);
    if (max && lev(q, w.slice(0, q.length + max), max) <= max) return 3;
    return 0;
  }

  function prepare(members) {
    return (members || []).map(function (m) {
      var ws = words(m.name);
      var no = String(m.no || '').toUpperCase();
      return { m: m, words: ws, joined: ws.join(''), letter: (no.match(/^[A-Z]/) || ['F'])[0],
        digits: no.replace(/\D/g, '').replace(/^0+/, '') };
    });
  }

  function search(prepared, query, limit) {
    limit = limit || 8;
    var qws = words(query);
    if (!qws.length) return [];
    var qNum = String(query).trim().toUpperCase().match(/^([A-Z])?\s*-?\s*(\d+)$/);
    var qDigits = qNum ? qNum[2].replace(/^0+/, '') : '';
    var qLetter = qNum ? (qNum[1] || 'F') : '';   // a plain number means an F- number, like at check-in
    var out = [];
    prepared.forEach(function (p) {
      var score = 0;
      if (qDigits) {
        if (p.digits === qDigits) score = p.letter === qLetter ? 100 : 50;
        else if (p.digits.indexOf(qDigits) === 0) score = 20;
        else return;
      } else {
        for (var i = 0; i < qws.length; i++) {
          var q = qws[i], best = 0;
          for (var j = 0; j < p.words.length; j++) {
            var s = wordScore(q, p.words[j]);
            if (s && i === 0 && j === 0) s += 2;           // first name typed first
            if (s > best) best = s;
          }
          if (!best && q.length >= 4 && p.joined.indexOf(q) !== -1) best = 4;  // "alutaibi", "abdulkareem"
          if (!best) return;                                // every typed word must match
          score += best;
        }
      }
      out.push({ score: score, m: p.m });
    });
    out.sort(function (a, b) { return b.score - a.score || a.m.name.localeCompare(b.m.name); });
    return out.slice(0, limit).map(function (r) { return r.m; });
  }

  var api = { prepare: prepare, search: search, _skel: skel, _norm: norm };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JCUKSearch = api;
})(this);
