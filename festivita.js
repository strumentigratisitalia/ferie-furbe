// Festività nazionali italiane, Pasqua e santi patroni dei capoluoghi.
// Fonti: legge 27 maggio 1949 n. 260 e successive; legge 8 ottobre 2025 n. 151
// (San Francesco, 4 ottobre, festivo dal 2026). Le date dei patroni sono quelle
// delle feste cittadine più note: alcune città ne hanno più di uno.
(function (global) {
  // Algoritmo di Meeus/Jones/Butcher per la Pasqua gregoriana.
  function pasqua(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var mese = Math.floor((h + l - 7 * m + 114) / 31), giorno = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, mese - 1, giorno);
  }

  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }

  // Restituisce [{d: Date, nome: string}] per l'anno. opts.pentecoste aggiunge
  // il lunedì di Pentecoste (Alto Adige).
  function nazionali(y, opts) {
    opts = opts || {};
    var p = pasqua(y);
    var list = [
      [0, 1, 'Capodanno'],
      [0, 6, 'Epifania'],
      [3, 25, 'Festa della Liberazione'],
      [4, 1, 'Festa del Lavoro'],
      [5, 2, 'Festa della Repubblica'],
      [7, 15, 'Ferragosto'],
      [10, 1, 'Ognissanti'],
      [11, 8, 'Immacolata'],
      [11, 25, 'Natale'],
      [11, 26, 'Santo Stefano'],
    ].map(function (x) { return { d: new Date(y, x[0], x[1]), nome: x[2] }; });
    list.push({ d: p, nome: 'Pasqua' });
    list.push({ d: addDays(p, 1), nome: 'Lunedì dell\'Angelo' });
    if (y >= 2026) list.push({ d: new Date(y, 9, 4), nome: 'San Francesco d\'Assisi' });
    if (opts.pentecoste) list.push({ d: addDays(p, 50), nome: 'Lunedì di Pentecoste' });
    list.sort(function (a, b) { return a.d - b.d; });
    return list;
  }

  // Patroni: [id, città, mese(1-12), giorno, nome]
  var PATRONI = [
    ['alessandria', 'Alessandria', 11, 10, 'San Baudolino'],
    ['ancona', 'Ancona', 5, 4, 'San Ciriaco'],
    ['aosta', 'Aosta', 9, 7, 'San Grato'],
    ['arezzo', 'Arezzo', 8, 7, 'San Donato'],
    ['ascoli', 'Ascoli Piceno', 8, 5, 'Sant\'Emidio'],
    ['avellino', 'Avellino', 2, 14, 'San Modestino'],
    ['bari', 'Bari', 12, 6, 'San Nicola'],
    ['belluno', 'Belluno', 11, 11, 'San Martino'],
    ['benevento', 'Benevento', 8, 24, 'San Bartolomeo'],
    ['bergamo', 'Bergamo', 8, 26, 'Sant\'Alessandro'],
    ['biella', 'Biella', 12, 26, 'Santo Stefano'],
    ['bologna', 'Bologna', 10, 4, 'San Petronio'],
    ['bolzano', 'Bolzano', 8, 15, 'Maria Assunta'],
    ['brescia', 'Brescia', 2, 15, 'Santi Faustino e Giovita'],
    ['cagliari', 'Cagliari', 10, 30, 'San Saturnino'],
    ['caltanissetta', 'Caltanissetta', 9, 29, 'San Michele Arcangelo'],
    ['campobasso', 'Campobasso', 4, 23, 'San Giorgio'],
    ['caserta', 'Caserta', 1, 20, 'San Sebastiano'],
    ['catania', 'Catania', 2, 5, 'Sant\'Agata'],
    ['catanzaro', 'Catanzaro', 7, 16, 'San Vitaliano'],
    ['cesena', 'Cesena', 6, 24, 'San Giovanni Battista'],
    ['chieti', 'Chieti', 5, 11, 'San Giustino'],
    ['como', 'Como', 8, 31, 'Sant\'Abbondio'],
    ['cosenza', 'Cosenza', 2, 12, 'Madonna del Pilerio'],
    ['cremona', 'Cremona', 11, 13, 'Sant\'Omobono'],
    ['cuneo', 'Cuneo', 9, 29, 'San Michele Arcangelo'],
    ['enna', 'Enna', 7, 2, 'Madonna della Visitazione'],
    ['ferrara', 'Ferrara', 4, 23, 'San Giorgio'],
    ['firenze', 'Firenze', 6, 24, 'San Giovanni Battista'],
    ['foggia', 'Foggia', 3, 22, 'Madonna dei Sette Veli'],
    ['forli', 'Forlì', 2, 4, 'Madonna del Fuoco'],
    ['frosinone', 'Frosinone', 6, 20, 'San Silverio'],
    ['genova', 'Genova', 6, 24, 'San Giovanni Battista'],
    ['gorizia', 'Gorizia', 3, 16, 'Santi Ilario e Taziano'],
    ['grosseto', 'Grosseto', 8, 10, 'San Lorenzo'],
    ['imperia', 'Imperia', 11, 26, 'San Leonardo'],
    ['isernia', 'Isernia', 5, 19, 'San Pietro Celestino'],
    ['laspezia', 'La Spezia', 3, 19, 'San Giuseppe'],
    ['latina', 'Latina', 7, 6, 'Santa Maria Goretti'],
    ['lecce', 'Lecce', 8, 26, 'Sant\'Oronzo'],
    ['lecco', 'Lecco', 12, 6, 'San Nicola'],
    ['livorno', 'Livorno', 5, 22, 'Santa Giulia'],
    ['lodi', 'Lodi', 1, 19, 'San Bassiano'],
    ['lucca', 'Lucca', 7, 12, 'San Paolino'],
    ['macerata', 'Macerata', 8, 31, 'San Giuliano'],
    ['mantova', 'Mantova', 3, 18, 'Sant\'Anselmo'],
    ['matera', 'Matera', 7, 2, 'Madonna della Bruna'],
    ['messina', 'Messina', 6, 3, 'Madonna della Lettera'],
    ['milano', 'Milano', 12, 7, 'Sant\'Ambrogio'],
    ['modena', 'Modena', 1, 31, 'San Geminiano'],
    ['monza', 'Monza', 6, 24, 'San Giovanni Battista'],
    ['napoli', 'Napoli', 9, 19, 'San Gennaro'],
    ['novara', 'Novara', 1, 22, 'San Gaudenzio'],
    ['padova', 'Padova', 6, 13, 'Sant\'Antonio'],
    ['palermo', 'Palermo', 7, 15, 'Santa Rosalia'],
    ['parma', 'Parma', 1, 13, 'Sant\'Ilario'],
    ['pavia', 'Pavia', 12, 9, 'San Siro'],
    ['perugia', 'Perugia', 1, 29, 'San Costanzo'],
    ['pesaro', 'Pesaro', 9, 24, 'San Terenzio'],
    ['pescara', 'Pescara', 10, 10, 'San Cetteo'],
    ['piacenza', 'Piacenza', 7, 4, 'Sant\'Antonino'],
    ['pisa', 'Pisa', 6, 17, 'San Ranieri'],
    ['pistoia', 'Pistoia', 7, 25, 'San Jacopo'],
    ['potenza', 'Potenza', 5, 30, 'San Gerardo'],
    ['ragusa', 'Ragusa', 8, 29, 'San Giovanni Battista'],
    ['ravenna', 'Ravenna', 7, 23, 'Sant\'Apollinare'],
    ['reggiocalabria', 'Reggio Calabria', 4, 23, 'San Giorgio'],
    ['reggioemilia', 'Reggio Emilia', 11, 24, 'San Prospero'],
    ['rieti', 'Rieti', 12, 4, 'Santa Barbara'],
    ['rimini', 'Rimini', 10, 14, 'San Gaudenzo'],
    ['roma', 'Roma', 6, 29, 'Santi Pietro e Paolo'],
    ['salerno', 'Salerno', 9, 21, 'San Matteo'],
    ['savona', 'Savona', 3, 18, 'Nostra Signora della Misericordia'],
    ['siena', 'Siena', 12, 1, 'Sant\'Ansano'],
    ['siracusa', 'Siracusa', 12, 13, 'Santa Lucia'],
    ['taranto', 'Taranto', 5, 10, 'San Cataldo'],
    ['teramo', 'Teramo', 12, 19, 'San Berardo'],
    ['terni', 'Terni', 2, 14, 'San Valentino'],
    ['torino', 'Torino', 6, 24, 'San Giovanni Battista'],
    ['trapani', 'Trapani', 8, 7, 'Sant\'Alberto'],
    ['trento', 'Trento', 6, 26, 'San Vigilio'],
    ['treviso', 'Treviso', 4, 27, 'San Liberale'],
    ['trieste', 'Trieste', 11, 3, 'San Giusto'],
    ['udine', 'Udine', 7, 12, 'Santi Ermacora e Fortunato'],
    ['varese', 'Varese', 5, 8, 'San Vittore'],
    ['venezia', 'Venezia', 4, 25, 'San Marco'],
    ['vercelli', 'Vercelli', 8, 1, 'Sant\'Eusebio'],
    ['verona', 'Verona', 5, 21, 'San Zeno'],
    ['viterbo', 'Viterbo', 9, 4, 'Santa Rosa'],
  ].map(function (p) { return { id: p[0], citta: p[1], mese: p[2], giorno: p[3], nome: p[4] }; });

  function patrono(id, y) {
    for (var i = 0; i < PATRONI.length; i++) {
      if (PATRONI[i].id === id) return { d: new Date(y, PATRONI[i].mese - 1, PATRONI[i].giorno), nome: PATRONI[i].nome + ' (' + PATRONI[i].citta + ')' };
    }
    return null;
  }

  global.FF_FEST = { pasqua: pasqua, nazionali: nazionali, PATRONI: PATRONI, patrono: patrono };
})(window);
