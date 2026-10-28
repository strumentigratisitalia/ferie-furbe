// Ottimizzatore delle ferie: programmazione dinamica esatta sugli intervalli.
// Dato un anno e un budget di giorni di ferie, trova l'insieme di pause
// (intervalli di giorni consecutivi liberi) che massimizza i giorni di vacanza
// totali, spendendo al massimo il budget. Non è un'euristica: tra tutte le
// combinazioni di pause non sovrapposte sceglie la migliore.
(function (global) {
  var MS = 86400000;

  function key(d) { return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }

  // cfg: { anno, ferie, liberi: Set di giorni della settimana liberi (0=dom..6=sab),
  //        festivi: [{d, nome}], chiusure: [Date], minLen, maxLen }
  function pianifica(cfg) {
    var y = cfg.anno;
    var start = new Date(y, 0, 1);
    var N = Math.round((new Date(y + 1, 0, 1) - start) / MS);
    var free = new Array(N), why = new Array(N), dates = new Array(N);
    var festByKey = {};
    (cfg.festivi || []).forEach(function (f) { festByKey[key(f.d)] = f.nome; });
    (cfg.chiusure || []).forEach(function (d) { festByKey[key(d)] = festByKey[key(d)] || 'Chiusura'; });

    for (var i = 0; i < N; i++) {
      var d = new Date(y, 0, 1 + i);
      dates[i] = d;
      var k = key(d);
      if (festByKey[k]) { free[i] = true; why[i] = festByKey[k]; }
      else if (cfg.liberi.has(d.getDay())) { free[i] = true; why[i] = ''; }
      else { free[i] = false; why[i] = ''; }
    }

    var B = cfg.ferie, L = Math.max(2, cfg.minLen || 2), M = Math.min(N, cfg.maxLen || 16);
    // dp[i][b]: massimo di giorni di vacanza considerando i giorni < i con b ferie usate.
    var W = B + 1;
    var dp = new Int16Array((N + 1) * W).fill(-1);
    var choice = new Int16Array((N + 1) * W).fill(0); // 0 = salta, altrimenti lunghezza dell'intervallo che finisce in i
    var chCost = new Int8Array((N + 1) * W);
    dp[0] = 0;
    for (var i2 = 0; i2 < N; i2++) {
      for (var b = 0; b < W; b++) {
        var cur = dp[i2 * W + b];
        if (cur < 0) continue;
        // salta il giorno
        if (cur > dp[(i2 + 1) * W + b]) { dp[(i2 + 1) * W + b] = cur; choice[(i2 + 1) * W + b] = 0; }
        // intervallo che inizia in i2 (gli estremi liberi adiacenti vengono inclusi da soli,
        // perché allungano la pausa senza costare ferie)
        var cost = 0;
        for (var len = 1; len <= M && i2 + len <= N; len++) {
          if (!free[i2 + len - 1]) cost++;
          if (cost > B - b) break;
          if (len < L || cost === 0) continue;
          var val = cur + len;
          var idx = (i2 + len) * W + b + cost;
          if (val > dp[idx]) { dp[idx] = val; choice[idx] = len; chCost[idx] = cost; }
        }
      }
    }
    // Miglior risultato: massimo valore, a parità meno ferie usate.
    var best = -1, bestB = 0;
    for (var bb = 0; bb < W; bb++) {
      if (dp[N * W + bb] > best) { best = dp[N * W + bb]; bestB = bb; }
    }
    // Ricostruzione
    var blocchi = [];
    var pos = N, bud = bestB;
    while (pos > 0) {
      var len2 = choice[pos * W + bud];
      if (len2 === 0) { pos--; continue; }
      var c = chCost[pos * W + bud];
      blocchi.unshift(makeBlock(pos - len2, pos - 1));
      pos -= len2; bud -= c;
    }
    // Unisce blocchi adiacenti
    for (var j = blocchi.length - 2; j >= 0; j--) {
      if (blocchi[j].fine + 1 === blocchi[j + 1].inizio) {
        blocchi[j] = makeBlock(blocchi[j].inizio, blocchi[j + 1].fine);
        blocchi.splice(j + 1, 1);
      }
    }

    function makeBlock(a, z) {
      var ferie = [], fest = [];
      for (var q = a; q <= z; q++) {
        if (!free[q]) ferie.push(dates[q]);
        else if (why[q]) fest.push({ d: dates[q], nome: why[q] });
      }
      return { inizio: a, fine: z, da: dates[a], a: dates[z], giorni: z - a + 1, ferie: ferie, festivi: fest };
    }

    // Weekend lunghi gratis: sequenze di almeno 3 giorni liberi consecutivi con almeno un festivo
    var gratis = [];
    for (var s = 0; s < N;) {
      if (!free[s]) { s++; continue; }
      var e = s;
      while (e + 1 < N && free[e + 1]) e++;
      var hasFest = false;
      for (var t = s; t <= e; t++) if (why[t]) hasFest = true;
      if (e - s + 1 >= 3 && hasFest) gratis.push(makeBlock(s, e));
      s = e + 1;
    }

    return {
      anno: y, blocchi: blocchi, ferieUsate: bestB, vacanza: Math.max(0, best), gratis: gratis,
      free: free, why: why, dates: dates,
    };
  }

  global.FF_OTT = { pianifica: pianifica };
})(window);
