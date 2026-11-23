# Статистика за користење и директни подароци (Google Sheets)

Скриптата прави две работи: ја собира статистиката (прв лист) и служи како „поштенско сандаче“ за подароци (лист „Подароци“): кога некој подарува squishy, подарокот се запишува тука, а апликацијата на примачот сама го зема.

Апликацијата нема свој сервер, па статистиката се собира во **твоја Google табела**.
Секој корисник на секои 5 минути (и кога ќе ја затвори апликацијата) праќа:

| Колона | Што е |
|---|---|
| ID | првите 6 знаци од отпечатокот на кодот за влез (ист како „Твој ID“ во Размена) |
| Датум | денот |
| Денес (мин) | колку минути била отворена и видлива апликацијата тој ден |
| Вкупно (мин) | вкупно од почетокот |
| Стисоци | вкупно избројани стисоци |
| Squishies | колку squishies има во колекцијата |
| Отворени кутии | колку Mystery Box отворил |
| Последно | кога последен пат пратил |

Секој корисник има еден ред по ден (редот се ажурира, не се дуплира).

## Поставување (еднаш, ~5 минути)

1. Отвори https://sheets.new и именувај ја табелата, на пр. `Squishy статистика`.
2. Мени **Extensions → Apps Script**.
3. Избриши сè што пишува и залепи го кодот подолу. Кликни 💾 **Save**.
4. Горе десно **Deploy → New deployment**.
   - До „Select type“ кликни ⚙ → **Web app**.
   - **Execute as:** Me
   - **Who has access:** **Anyone**
   - **Deploy** → дозволи пристап (Authorize access → избери сметка → Advanced → Go to … → Allow).
5. Копирај го **Web app URL** (почнува со `https://script.google.com/macros/s/…/exec`) и прати му го на Claude.
   Тој го става во `STATS_URL` во `index.html` и статистиката почнува да пристигнува.

```javascript
// Линкот од твојата табела „Squishy статистика“ (Share ▾ → Copy link)
var SHEET_URL = 'ЗАЛЕПИ_ЛИНК_ОД_ТАБЕЛАТА';

function book() { return SpreadsheetApp.openByUrl(SHEET_URL); }
function sheet() { return book().getSheets()[0]; }
function giftSheet() {   // втор лист „Подароци“ (сандаче)
  var b = book(), sh = b.getSheetByName('Подароци');
  if (!sh) { sh = b.insertSheet('Подароци'); sh.appendRow(['За (ID)', 'Код', 'Од', 'Squishy', 'Испратено', 'Примено']); }
  return sh;
}
function dayText(v) { return v instanceof Date ? Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(v); }

function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  if (d.type === 'gift') { giftSheet().appendRow(["'" + d.to, d.code, d.from, d.item, new Date(), '']); return ContentService.createTextOutput('ok'); }
  var sh = sheet();
  if (sh.getLastRow() === 0) sh.appendRow(['ID', 'Датум', 'Денес (мин)', 'Вкупно (мин)', 'Стисоци', 'Squishies', 'Отворени кутии', 'Последно']);
  var row = ["'" + d.id, "'" + d.day, Math.round(d.today / 6) / 10, Math.round(d.total / 6) / 10, d.squeezes, d.owned, d.opens, new Date()];
  var vals = sh.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][0]) === String(d.id) && dayText(vals[i][1]) === String(d.day)) { sh.getRange(i + 1, 1, 1, row.length).setValues([row]); return ContentService.createTextOutput('ok'); }
  }
  sh.appendRow(row);
  return ContentService.createTextOutput('ok');
}

function doGet(e) {   // апликацијата прашува: „има ли подароци за мене?“
  var id = e && e.parameter && e.parameter.inbox, out = [];
  if (id) {
    var sh = giftSheet(), vals = sh.getDataRange().getValues();
    for (var i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(id) && !vals[i][5]) { out.push({ code: vals[i][1], from: vals[i][2], item: vals[i][3] }); sh.getRange(i + 1, 6).setValue(new Date()); }
    }
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
```

## Кој е кој?

ID-то е првите 6 знаци од отпечатокот на кодот. Секој корисник го гледа својот ID во **Размена** („Твој ID“).
Claude може да пресмета ID за код што го знаеш.
