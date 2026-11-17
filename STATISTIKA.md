# Статистика за користење (Google Sheets)

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
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(['ID', 'Датум', 'Денес (мин)', 'Вкупно (мин)', 'Стисоци', 'Squishies', 'Отворени кутии', 'Последно']);
  var row = [String(d.id), String(d.day), Math.round(d.today / 6) / 10, Math.round(d.total / 6) / 10, d.squeezes, d.owned, d.opens, new Date()];
  var vals = sh.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][0]) === row[0] && String(vals[i][1]) === row[1]) { sh.getRange(i + 1, 1, 1, row.length).setValues([row]); return ContentService.createTextOutput('ok'); }
  }
  sh.appendRow(row);
  return ContentService.createTextOutput('ok');
}
```

## Кој е кој?

ID-то е првите 6 знаци од отпечатокот на кодот. Секој корисник го гледа својот ID во **Размена** („Твој ID“).
Claude може да пресмета ID за код што го знаеш.
