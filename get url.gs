
var tv = []
var tt = []
function recursiveProcessUrl(url, collectedLinks) {
  // Если массив collectedLinks не передан, создаем его
  if (!collectedLinks) {
    collectedLinks = [];
  }

  try {
    // Обрабатываем текущий URL (например, получаем HTML-контент и парсим ссылки)
    Logger.log("Обрабатываем URL: " + url);
    
    // Предположим, функция processUrl возвращает массив новых ссылок для обработки
    var newLinks = processUrl(url);

    if (newLinks.length==0){
      
      Logger.log('GG: '+url)
    }

    // Добавляем текущий URL в массив собранных ссылок
    collectedLinks.push(url);

    // Проходим по каждой новой ссылке и вызываем рекурсию
    for (var i = 0; i < newLinks.length; i++) {
      recursiveProcessUrl(newLinks[i], collectedLinks);
    }
    
  } catch (e) {
    Logger.log("Ошибка при обработке URL: " + url + " - " + e.message);
  }

  return collectedLinks;
}


function startURL(){
//  recursiveProcessUrl('https://trade59.ru/catalog.html?cid=13&roistat_visit=340046')

 var spreadsheet = SpreadsheetApp.openById("1febD_TZAtDTLs2fij96GE1SC3UmeDpRbAkVCUSkJ4JA"); // Замените на ID вашей таблицы
  var sheet = spreadsheet.getSheetByName("url"); // Замените на имя вашего листа


   var links = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).getValues();
  Logger.log(links)  
  // Проходим по массиву ссылок и выводим каждую из них
  for (var i = 0; i < links.length; i++) {
    Logger.log(links[i][0]);
    Logger.log('Выводим: ' + links[i][0])
    recursiveProcessUrl(links[i][0])

  }




Logger.log(tt)


   var spreadsheet = SpreadsheetApp.openById("1febD_TZAtDTLs2fij96GE1SC3UmeDpRbAkVCUSkJ4JA"); // Замените на ID вашей таблицы
  var sheet = spreadsheet.getSheetByName("url"); // Замените на имя вашего листа


 var data =tt;

  // Получаем все значения из столбца A
  var existingData = sheet.getRange("A:A").getValues().flat(); // Извлекаем значения в плоский массив

  // Проходим по массиву данных для вставки
  for (var i = 0; i < data.length; i++) {
    var value = data[i];

    // Проверяем, содержится ли значение в столбце A
    if (existingData.indexOf(value) === -1) { // Если значение не найдено
      // Находим первую свободную строку
      var emptyRow = existingData.indexOf("") + 1;
      if (emptyRow === 0) { // Если нет пустой строки
        emptyRow = existingData.length + 1;
      }
      
      // Вставляем значение в свободную строку
      sheet.getRange(emptyRow, 1).setValue(value);

      // Добавляем значение в existingData, чтобы не было дублирования
      existingData[emptyRow - 1] = value;
    }
  }




}


function processUrl(url) {

  

//var url = "https://trade59.ru/catalog.html?cid=7";

  var headers = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "ru,en;q=0.9,cy;q=0.8",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "priority": "u=0, i",
    "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"YaBrowser\";v=\"24.7\", \"Yowser\";v=\"2.5\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1"
  };

  var options = {
    "method" : "get",
    "headers" : headers,
    "muteHttpExceptions": true
  };

  //var referrer = "https://trade59.ru/catalog.html?cid=7";
  
  // Выполнение GET-запроса
  var response = UrlFetchApp.fetch(url, options);
 var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

 htmlContent = response.getContentText();
 var htmlContent = response.getContentText();

   var htmlContent = response.getContentText();
 // Logger.log(htmlContent)


var matches = getHTML(htmlContent, '')

//Logger.log(matches[matches.length])

  for (var i = 0; i < matches.length; i++) {
    Logger.log(matches[i])

  }

  if (htmlContent.includes('<div class="price">')){
    tt.push(url)
  }

  return(matches)


}




function getHTML(htmlContent, div){


  var matches = [];
  
  // Регулярное выражение для поиска каждого <div class="items-list">
  var regex = /<a class="cat_item_color"/gi;
  var match;
  var startIndex;


  // Ищем все вхождения <div class="items-list">
  while ((match = regex.exec(htmlContent)) !== null) {
    startIndex = match.index;
    var openDivs = 1;
    var closeIndex = startIndex + match[0].length;

    // Проходим по тексту и ищем соответствующий закрывающий тег </div>
    while (openDivs > 0 && closeIndex < htmlContent.length) {
      if (htmlContent.substring(closeIndex, closeIndex + 3) === "<a ") {
        openDivs++;
      } else if (htmlContent.substring(closeIndex, closeIndex + 4) === "</a>") {
        openDivs--;
      }
      closeIndex++;
    }

    // Добавляем найденный блок в массив

      

      var url_get = ('https://trade59.ru/'+parseText(htmlContent.substring(startIndex, closeIndex),'href="','"'));

      if (url_get.includes('cid')){

      matches.push('https://trade59.ru/'+parseText(htmlContent.substring(startIndex, closeIndex),'href="','"'));

      } else {
        tv.push(url_get)
        Logger.log('Final'+url)
      }
}
return matches
}
