(function () {
  function track(ev) { try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: ev, title: ev, event: true }); } catch (e) {} }
  var $ = function (s) { return document.querySelector(s); };
  var MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  var MESI_B = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  var GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var GIORNI_B = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  var BASE = 'https://strumentigratisitalia.github.io/ferie-furbe/';

  var el = {
    anno: $('#anno'), ferie: $('#ferie'), settimana: $('#settimana'), citta: $('#citta'),
    patronoData: $('#patronoData'), strategia: $('#strategia'), pentecoste: $('#pentecoste'),
    chiusure: $('#chiusure'), out: $('#risultato'), frase: $('#frase'), cal: $('#calendario'),
    pause: $('#pause'), gratis: $('#gratis'), fest: $('#festivi'), err: $('#err'),
  };
  var ultimo = null;

  // Città nel menu
  FF_FEST.PATRONI.forEach(function (p) {
    var o = document.createElement('option');
    o.value = p.id; o.textContent = p.citta + ' (' + p.nome + ', ' + p.giorno + ' ' + MESI_B[p.mese - 1] + ')';
    el.citta.appendChild(o);
  });
  var altro = document.createElement('option');
  altro.value = 'altro'; altro.textContent = 'Altra città: scrivo io la data del patrono';
  el.citta.appendChild(altro);

  function fmt(d) { return d.getDate() + ' ' + MESI[d.getMonth()]; }
  function fmtG(d) { return GIORNI_B[d.getDay()] + ' ' + d.getDate() + ' ' + MESI_B[d.getMonth()]; }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function isoCompact(d) { return iso(d).replace(/-/g, ''); }

  function parseChiusure(txt, y) {
    // Accetta "24/12, 31/12, 2027-08-16", una per riga o separate da virgola
    var out = [];
    (txt || '').split(/[\n,;]+/).forEach(function (s) {
      s = s.trim(); if (!s) return;
      var m = s.match(/^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{4}))?$/);
      var m2 = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      var d = null;
      if (m) d = new Date(m[3] ? +m[3] : y, +m[2] - 1, +m[1]);
      else if (m2) d = new Date(+m2[1], +m2[2] - 1, +m2[3]);
      if (d && !isNaN(d) && d.getFullYear() === y) out.push(d);
    });
    return out;
  }

  function leggi() {
    var y = +el.anno.value;
    var ferie = Math.max(0, Math.min(60, parseInt(el.ferie.value, 10) || 0));
    var liberi = el.settimana.value === '6' ? new Set([0]) : new Set([0, 6]);
    var fest = FF_FEST.nazionali(y, { pentecoste: el.pentecoste.checked });
    var patrono = null;
    if (el.citta.value && el.citta.value !== 'altro' && el.citta.value !== '') patrono = FF_FEST.patrono(el.citta.value, y);
    if (el.citta.value === 'altro' && el.patronoData.value) {
      var pd = parseChiusure(el.patronoData.value, y)[0];
      if (pd) patrono = { d: pd, nome: 'Santo patrono' };
    }
    if (patrono) fest.push(patrono);
    var strat = el.strategia.value;
    var minLen = strat === 'brevi' ? 3 : strat === 'lunghe' ? 9 : 4;
    var maxLen = strat === 'brevi' ? 5 : strat === 'lunghe' ? 24 : 16;
    return { anno: y, ferie: ferie, liberi: liberi, festivi: fest, chiusure: parseChiusure(el.chiusure.value, y), minLen: minLen, maxLen: maxLen, patrono: patrono };
  }

  function salvaHash() {
    var p = new URLSearchParams();
    p.set('a', el.anno.value); p.set('f', el.ferie.value); p.set('s', el.settimana.value);
    if (el.citta.value) p.set('c', el.citta.value);
    if (el.citta.value === 'altro' && el.patronoData.value) p.set('p', el.patronoData.value);
    if (el.strategia.value !== 'mix') p.set('t', el.strategia.value);
    if (el.pentecoste.checked) p.set('pe', '1');
    if (el.chiusure.value.trim()) p.set('x', el.chiusure.value.trim());
    history.replaceState(null, '', '#' + p.toString());
  }
  function leggiHash() {
    if (!location.hash || location.hash.length < 2) return;
    var p = new URLSearchParams(location.hash.slice(1));
    if (p.get('a')) el.anno.value = p.get('a');
    if (p.get('f')) el.ferie.value = p.get('f');
    if (p.get('s')) el.settimana.value = p.get('s');
    if (p.get('c')) el.citta.value = p.get('c');
    if (p.get('p')) el.patronoData.value = p.get('p');
    if (p.get('t')) el.strategia.value = p.get('t');
    el.pentecoste.checked = p.get('pe') === '1';
    if (p.get('x')) el.chiusure.value = p.get('x');
  }

  function calcola() {
    var cfg = leggi();
    el.patronoData.parentElement.hidden = el.citta.value !== 'altro';
    el.err.hidden = true;
    if (!cfg.ferie) {
      el.err.textContent = 'Scrivi quanti giorni di ferie hai: anche solo 2 o 3 bastano per un ponte.';
      el.err.hidden = false;
    }
    var r = FF_OTT.pianifica(cfg);
    ultimo = { cfg: cfg, r: r };
    renderFrase(cfg, r);
    renderCalendario(cfg, r);
    renderPause(cfg, r);
    renderFestivi(cfg);
    salvaHash();
  }

  function renderFrase(cfg, r) {
    var n = r.blocchi.length;
    var html;
    if (!r.blocchi.length) {
      html = 'Con questi dati non esce nessuna pausa. Prova ad aumentare i giorni di ferie o a scegliere "Tanti ponti brevi".';
    } else {
      var rapporto = (r.vacanza / r.ferieUsate).toFixed(1).replace('.', ',');
      html = 'Con <b>' + r.ferieUsate + ' giorn' + (r.ferieUsate === 1 ? 'o' : 'i') + ' di ferie</b> ti escono <b>' + r.vacanza + ' giorni di vacanza</b> in ' + n + ' paus' + (n === 1 ? 'a' : 'e') + '. Ogni giorno di ferie ne vale ' + rapporto + '.';
      if (r.ferieUsate < cfg.ferie) html += ' Ti restano ' + (cfg.ferie - r.ferieUsate) + ' giorni liberi da usare come vuoi.';
    }
    el.frase.innerHTML = html;
  }

  function renderCalendario(cfg, r) {
    var y = cfg.anno;
    var inBlock = new Uint8Array(r.dates.length); // 1 = ferie, 2 = libero dentro una pausa
    r.blocchi.forEach(function (b) { for (var i = b.inizio; i <= b.fine; i++) inBlock[i] = r.free[i] ? 2 : 1; });
    var frag = document.createDocumentFragment();
    var idx = 0;
    for (var m = 0; m < 12; m++) {
      var sec = document.createElement('section');
      sec.className = 'mese';
      var h = document.createElement('h3'); h.textContent = MESI[m]; sec.appendChild(h);
      var grid = document.createElement('div'); grid.className = 'griglia'; grid.setAttribute('role', 'img');
      var first = new Date(y, m, 1);
      var offset = (first.getDay() + 6) % 7; // lunedì = 0
      for (var k = 0; k < offset; k++) { var v = document.createElement('span'); v.className = 'vuoto'; grid.appendChild(v); }
      var dim = new Date(y, m + 1, 0).getDate();
      var descr = [];
      for (var d = 1; d <= dim; d++, idx++) {
        var s = document.createElement('span');
        var cls = 'g';
        var titolo = fmtG(r.dates[idx]);
        if (r.why[idx]) { cls += ' festivo'; titolo += ': ' + r.why[idx]; }
        else if (r.free[idx]) cls += ' libero';
        if (inBlock[idx] === 1) { cls += ' ferie'; titolo += ': giorno di ferie'; descr.push(d); }
        else if (inBlock[idx] === 2) cls += ' pausa';
        s.className = cls; s.textContent = d; s.title = titolo;
        grid.appendChild(s);
      }
      grid.setAttribute('aria-label', MESI[m] + (descr.length ? ', ferie il ' + descr.join(', ') : ', nessun giorno di ferie'));
      sec.appendChild(grid);
      frag.appendChild(sec);
    }
    el.cal.innerHTML = '';
    el.cal.appendChild(frag);
  }

  function renderPause(cfg, r) {
    el.pause.innerHTML = '';
    r.blocchi.forEach(function (b, i) {
      var li = document.createElement('li');
      var eff = (b.giorni / b.ferie.length).toFixed(1).replace('.', ',');
      var festNomi = b.festivi.filter(function (f) { return f.nome; }).map(function (f) { return f.nome; });
      festNomi = festNomi.filter(function (n, k) { return festNomi.indexOf(n) === k; });
      li.innerHTML =
        '<div class="p-date">' + fmtG(b.da) + ' <span class="freccia">a</span> ' + fmtG(b.a) + '</div>' +
        '<div class="p-tot"><b>' + b.giorni + '</b> giorni liberi</div>' +
        '<div class="p-ferie">Chiedi ' + (b.ferie.length === 1 ? '1 giorno' : b.ferie.length + ' giorni') + ' di ferie: ' + b.ferie.map(fmtG).join(', ') + '.' +
        (festNomi.length ? ' Dentro: ' + festNomi.join(', ') + '.' : '') + '</div>';
      el.pause.appendChild(li);
    });
    el.gratis.innerHTML = '';
    r.gratis.forEach(function (b) {
      var li = document.createElement('li');
      var nomi = b.festivi.map(function (f) { return f.nome; }).filter(function (n, k, a) { return a.indexOf(n) === k; });
      li.textContent = fmtG(b.da) + ' a ' + fmtG(b.a) + ' (' + b.giorni + ' giorni, ' + nomi.join(' e ') + ')';
      el.gratis.appendChild(li);
    });
    $('#gratis-box').hidden = !r.gratis.length;
    $('#azioni').hidden = !r.blocchi.length;
  }

  function renderFestivi(cfg) {
    el.fest.innerHTML = '';
    var list = cfg.festivi.slice().sort(function (a, b) { return a.d - b.d; });
    list.forEach(function (f) {
      var li = document.createElement('li');
      var wk = f.d.getDay() === 0 || f.d.getDay() === 6;
      li.innerHTML = '<span>' + GIORNI[f.d.getDay()] + ' ' + fmt(f.d) + '</span><span>' + f.nome + (wk ? ' <small>(cade nel weekend)</small>' : '') + '</span>';
      el.fest.appendChild(li);
    });
    $('#festivi-h').textContent = 'Festività ' + cfg.anno + (cfg.patrono ? ', con il patrono' : '');
  }

  // Azioni
  function testoRichiesta() {
    var r = ultimo.r;
    var righe = r.blocchi.map(function (b) {
      return '- ' + b.ferie.map(function (d) { return GIORNI[d.getDay()] + ' ' + fmt(d); }).join(', ') + ' (pausa dal ' + fmt(b.da) + ' al ' + fmt(b.a) + ')';
    });
    return 'Buongiorno,\n\nvi chiedo di poter usufruire delle ferie nei seguenti giorni del ' + r.anno + ':\n' + righe.join('\n') +
      '\n\nIn totale ' + r.ferieUsate + ' giorni di ferie. Resto a disposizione per eventuali cambi.\n\nGrazie';
  }

  function ics() {
    var r = ultimo.r;
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ferie Furbe//IT', 'CALSCALE:GREGORIAN'];
    var stamp = isoCompact(new Date()) + 'T000000Z';
    r.blocchi.forEach(function (b, i) {
      var fine = new Date(b.a); fine.setDate(fine.getDate() + 1);
      L.push('BEGIN:VEVENT', 'UID:ff-' + r.anno + '-' + i + '@feriefurbe', 'DTSTAMP:' + stamp,
        'DTSTART;VALUE=DATE:' + isoCompact(b.da), 'DTEND;VALUE=DATE:' + isoCompact(fine),
        'SUMMARY:Vacanza (' + b.giorni + ' giorni, ' + b.ferie.length + ' di ferie)',
        'DESCRIPTION:Giorni di ferie da chiedere: ' + b.ferie.map(fmt).join('\\, ') + '. Pianificato con Ferie Furbe.',
        'END:VEVENT');
      b.ferie.forEach(function (d, j) {
        var f2 = new Date(d); f2.setDate(f2.getDate() + 1);
        L.push('BEGIN:VEVENT', 'UID:ff-' + r.anno + '-' + i + '-' + j + '@feriefurbe', 'DTSTAMP:' + stamp,
          'DTSTART;VALUE=DATE:' + isoCompact(d), 'DTEND;VALUE=DATE:' + isoCompact(f2), 'SUMMARY:Ferie', 'END:VEVENT');
      });
    });
    L.push('END:VCALENDAR');
    var blob = new Blob([L.join('\r\n')], { type: 'text/calendar' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'ferie-' + r.anno + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  function card() {
    var r = ultimo.r, cfg = ultimo.cfg;
    var W = 1080, H = 1350;
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#16233a';
    x.font = '700 44px "Bricolage Grotesque", system-ui, sans-serif';
    x.fillText('Il mio piano ferie ' + r.anno, 72, 120);
    x.font = '800 96px "Bricolage Grotesque", system-ui, sans-serif';
    wrap(x, 'Con ' + r.ferieUsate + ' giorni di ferie faccio ' + r.vacanza + ' giorni di vacanza.', 72, 250, W - 144, 104);
    // Mini calendario a strisce: 12 righe (mesi), 31 colonne
    var top = 620, left = 72, cw = (W - 144) / 31, ch = 34;
    for (var m = 0; m < 12; m++) {
      x.fillStyle = '#5b6678'; x.font = '600 22px system-ui, sans-serif';
      x.fillText(MESI_B[m], left - 2, top + m * (ch + 8) + 24);
    }
    var inB = new Uint8Array(r.dates.length);
    r.blocchi.forEach(function (b) { for (var i = b.inizio; i <= b.fine; i++) inB[i] = r.free[i] ? 2 : 1; });
    r.dates.forEach(function (d, i) {
      var m = d.getMonth(), dd = d.getDate() - 1;
      var px = left + 50 + dd * ((W - 144 - 50) / 31), py = top + m * (ch + 8);
      var col = '#eef1f5';
      if (r.free[i]) col = r.why[i] ? '#d8322e' : '#c9d1dc';
      if (inB[i] === 1) col = '#0f9ba3';
      else if (inB[i] === 2) col = r.why[i] ? '#d8322e' : '#9fdcdf';
      x.fillStyle = col;
      roundRect(x, px, py, ((W - 144 - 50) / 31) - 3, ch, 5);
    });
    // Legenda
    var ly = top + 12 * (ch + 8) + 30;
    legenda(x, 72, ly, '#0f9ba3', 'ferie'); legenda(x, 262, ly, '#d8322e', 'festivi'); legenda(x, 472, ly, '#9fdcdf', 'vacanza');
    x.fillStyle = '#16233a'; x.font = '600 30px system-ui, sans-serif';
    var righe = r.blocchi.slice(0, 7).map(function (b) { return fmtG(b.da) + ' – ' + fmtG(b.a) + '  (' + b.giorni + ' gg, ' + b.ferie.length + ' ferie)'; });
    righe.forEach(function (t, i) { x.fillText(t, 72, ly + 80 + i * 44); });
    x.fillStyle = '#5b6678'; x.font = '600 30px system-ui, sans-serif';
    x.fillText('Calcola il tuo su ' + BASE.replace('https://', ''), 72, H - 60);
    return new Promise(function (res) { c.toBlob(res, 'image/png'); });
  }
  function roundRect(x, px, py, w, h, r) { x.beginPath(); x.roundRect(px, py, w, h, r); x.fill(); }
  function legenda(x, px, py, col, t) { x.fillStyle = col; roundRect(x, px, py - 20, 26, 26, 6); x.fillStyle = '#16233a'; x.font = '600 26px system-ui, sans-serif'; x.fillText(t, px + 36, py); }
  function wrap(x, text, px, py, maxW, lh) {
    var words = text.split(' '), line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (x.measureText(t).width > maxW && line) { x.fillText(line, px, py); py += lh; line = w; }
      else line = t;
    });
    x.fillText(line, px, py);
  }

  $('#copiaRichiesta').addEventListener('click', function () {
    navigator.clipboard.writeText(testoRichiesta()).then(function () { flash('Testo copiato. Incollalo nella mail per il tuo responsabile.'); track('ff-copia-richiesta'); });
  });
  $('#scaricaIcs').addEventListener('click', function () { ics(); track('ff-ics'); });
  $('#condividi').addEventListener('click', function () {
    card().then(function (blob) {
      var file = new File([blob], 'ferie-' + ultimo.r.anno + '.png', { type: 'image/png' });
      var testo = 'Nel ' + ultimo.r.anno + ' con ' + ultimo.r.ferieUsate + ' giorni di ferie faccio ' + ultimo.r.vacanza + ' giorni di vacanza. Calcola il tuo: ' + BASE + location.hash;
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], text: testo }).then(function () { track('ff-share'); }).catch(function () {});
      } else {
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
        navigator.clipboard && navigator.clipboard.writeText(testo);
        flash('Immagine scaricata e testo copiato: incollali dove vuoi.');
        track('ff-download-card');
      }
    });
  });
  $('#copiaLink').addEventListener('click', function () {
    navigator.clipboard.writeText(BASE + location.hash).then(function () { flash('Link copiato. Chi lo apre vede il tuo stesso piano.'); track('ff-copia-link'); });
  });

  var toastT;
  function flash(t) {
    var n = $('#toast'); n.textContent = t; n.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { n.hidden = true; }, 3500);
  }

  ['input', 'change'].forEach(function (evn) {
    document.getElementById('form').addEventListener(evn, function () { calcola(); });
  });
  document.getElementById('form').addEventListener('submit', function (e) { e.preventDefault(); calcola(); el.out.scrollIntoView({ behavior: 'smooth' }); track('ff-calcola'); });

  leggiHash();
  calcola();
})();
