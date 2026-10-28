# Ferie Furbe

Ponti 2027 e piano ferie ottimale: scrivi quanti giorni di ferie hai, la tua città e come lavori, e ti dice quali date chiedere per avere il massimo di giorni di vacanza. Con calendario annuale, file .ics per il telefono, testo pronto per la richiesta ferie e immagine da condividere.

Sito: https://strumentigratisitalia.github.io/ferie-furbe/

## Come funziona

- `festivita.js`: festività nazionali (legge 260/1949 e legge 151/2025 per il 4 ottobre), calcolo della Pasqua, santi patroni dei capoluoghi.
- `ottimizza.js`: programmazione dinamica esatta sugli intervalli di giorni: tra tutte le combinazioni di pause non sovrapposte sceglie quella con più giorni di vacanza entro il budget di ferie. Non è un'euristica.
- `app.js`: interfaccia, calendario, card condivisibile, export .ics, testo della richiesta.

Tutto gira nel browser: nessun dato viene inviato o salvato. HTML, CSS e JavaScript puri, nessun build.

Segnalazioni di date dei patroni sbagliate o mancanti sono benvenute nelle issue.
