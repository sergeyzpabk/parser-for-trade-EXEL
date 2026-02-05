
function Start() {
  var spreadsheet = SpreadsheetApp.openById(""); // Замените на ID вашей таблицы
  var sheet = spreadsheet.getSheetByName("url"); // Замените на имя вашего листа
  var send = false
  // Получаем массив данных из столбцов A (URL) и B (Дата проверки), начиная со строки 2
  var lastRow = sheet.getLastRow();
  var urlData = sheet.getRange("A2:A" + lastRow).getValues().flat(); // Преобразуем в одномерный массив
  var dateData = sheet.getRange("B2:B" + lastRow).getValues().flat(); // Даты из колонки B
  
  var today = new Date(); // Текущая дата

  // Проходим по массиву данных
  for (var i = 0; i < urlData.length; i++) {
    var url = urlData[i];
    var lastCheckDate = dateData[i]; // Соответствующая дата проверки

    // Проверяем, что URL не пустой и дата проверки пуста или меньше текущей даты
    if (url && (!lastCheckDate || new Date(lastCheckDate).setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0))) {
  try {
    // Выполняем другую функцию, передавая ей строку (URL)
    Logger.log(url);
    send = true
    btn(url);
    
    // Обновляем дату проверки в колонке B на текущую дату
    sheet.getRange(i + 2, 2).setValue(new Date());
  } catch (e) {
    Logger.log("Ошибка при обработке URL на строке " + (i + 2) + ": " + e.message);
  }
}
  }

  // Отправляем сообщение после обработки всех URL
  Logger.log(send)
  if (send) {
    sendTelegramMessage();}
}





function btn(url) {
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
    "method": "get",
    "headers": headers,
    "muteHttpExceptions": true
  };

  try {
    // Выполнение GET-запроса
    var response = UrlFetchApp.fetch(url, options);
    var htmlContent = response.getContentText();
    
    // Получаем лист "price"
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("price");
    if (!sheet) {
      Logger.log("Лист 'price' не найден");
      return;
    }
    
    // Находим строку, где URL находится в колонке A
    var data = sheet.getRange("A2:A" + sheet.getLastRow()).getValues().flat();
    var rowIndex = data.indexOf(url) + 2; // +2 из-за смещения на заголовок и нулевой индекс

    if (rowIndex > 1) {
      // Обновляем дату в колонке B на текущую дату
      sheet.getRange(rowIndex, 2).setValue(new Date());
    }

    // Массив для хранения всех найденных блоков
    var matches = [];
    
    // Регулярное выражение для поиска каждого <div class="items-list">
    var regex = /<div class="items-list">/gi;
    var match;
    var startIndex;

    // Ищем все вхождения <div class="items-list">
    while ((match = regex.exec(htmlContent)) !== null) {
      startIndex = match.index;
      var openDivs = 1;
      var closeIndex = startIndex + match[0].length;

      // Проходим по тексту и ищем соответствующий закрывающий тег </div>
      while (openDivs > 0 && closeIndex < htmlContent.length) {
        if (htmlContent.substring(closeIndex, closeIndex + 5) === "<div ") {
          openDivs++;
        } else if (htmlContent.substring(closeIndex, closeIndex + 6) === "</div>") {
          openDivs--;
        }
        closeIndex++;
      }

      // Добавляем найденный блок в массив
      matches.push(htmlContent.substring(startIndex, closeIndex));
    }

    // Обработка найденных блоков
    for (var i = 0; i < matches.length; i++) {
      var urlAdd = "https://trade59.ru/" + parseText(matches[i], '<a href="', '"');
      var name = parseText(matches[i], 'title="', '">');
      var price = extractNumbersFromString(parseText(matches[i], '"price">', '<'));

      if (price === '') {
        continue;
      }

      checkAndProcessUrl(urlAdd, name, price);
    }

  } catch (e) {
    Logger.log("Ошибка при выполнении запроса для URL: " + url + ". Сообщение: " + e.message);
    return;
  }
}

// Пример функции parseText (выделите и адаптируйте в зависимости от вашего контекста)
function parseText(source, startDelimiter, endDelimiter) {
  var start = source.indexOf(startDelimiter);
  if (start === -1) {
    return '';
  }
  start += startDelimiter.length;
  var end = source.indexOf(endDelimiter, start);
  if (end === -1) {
    return '';
  }
  return source.substring(start, end);
}

// Пример функции extractNumbersFromString
function extractNumbersFromString(str) {
  var match = str.match(/\d+/g);
  return match ? match.join('') : '';
}

// Пример функции checkAndProcessUrl (замените на вашу логику)
function checkAndProcessUrl(url, name, price) {
  // Ваша логика обработки URL, имени и цены
  Logger.log("URL: " + url + ", Name: " + name + ", Price: " + price);
}



function checkAndProcessUrl(url, name, price) {
  var spreadsheet = SpreadsheetApp.openById(""); // Замените на ID вашей таблицы
  var sheet = spreadsheet.getSheetByName("price"); // Замените на имя вашего листа

  // Получаем все значения из столбца A
  var data = sheet.getRange("A:A").getValues();
  
  var foundRow = -1;
  
  // Ищем URL в столбце A
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === url) {
      foundRow = i + 1; // Сохраняем номер строки (нумерация начинается с 1)
      break;
    }
  }

  if (foundRow === -1) {
    // Если URL не найден, добавляем его в следующую пустую строку
    foundRow = data.filter(String).length + 1;
    sheet.getRange(foundRow, 1).setValue(url);
    Logger.log("URL добавлен в строку " + foundRow);
  } else {
    Logger.log("URL найден в строке " + foundRow);
  }

  // Вставляем значения переменных name и price в соответствующие столбцы B и C
  sheet.getRange(foundRow, 2).setValue(name); // Записываем name в столбец B
  sheet.getRange(foundRow, 3).setValue(price); // Записываем price в столбец C
  var currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  sheet.getRange(foundRow, 4).setValue(currentDate); // Записываем текущую дату в столбец D


}






function parseText(content, startMarker, endMarker) {
  // Найти индекс начала
  var startIndex = content.indexOf(startMarker);
  if (startIndex === -1) {
    return "Start marker not found";
  }
  
  // Найти индекс конца, начиная с конца начального маркера
  var endIndex = content.indexOf(endMarker, startIndex + startMarker.length);
  if (endIndex === -1) {
    return "End marker not found";
  }
  
  // Извлечь текст между маркерами
  var extractedText = content.substring(startIndex + startMarker.length, endIndex);
  
  return extractedText;
}

function extractNumbersFromString(inputString) {
  // Используем регулярное выражение для замены всех символов, кроме цифр
  var onlyNumbers = inputString.replace(/\D/g, '');
  return onlyNumbers;
}


var token = "TOKEN";
 var chatId = "CHATID"; // Идентификатор чата или канала




function sendMessageToTelegram(text) {
  Logger.log('777')
  //var text = groupedText["group"]; // Получаем текст
  var url = "https://api.telegram.org/bot" + token + "/sendMessage";
  var maxLength = 4000; // Максимальное количество символов в одном сообщении
  var messageId = null; // ID предыдущего сообщения для создания ответов

  // Функция отправки сообщения в Telegram
  function sendTelegramMessage(chunk, replyToMessageId) {
    var payload = {
      "chat_id": chatId,
      "text": chunk,
      "parse_mode": "Markdown"
    };

    if (replyToMessageId) {
      payload.reply_to_message_id = replyToMessageId; // Отправляем как ответ
    }

    var options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload)
    };

    var response = UrlFetchApp.fetch(url, options);
    var responseData = JSON.parse(response.getContentText());
    
    return responseData.result.message_id; // Возвращаем ID отправленного сообщения
  }

  // Разбиваем текст на строки
  var lines = text.split('\n');
  var currentMessage = ""; // Текущее сообщение для отправки
  var currentLength = 0;   // Текущая длина сообщения

  // Проходим по каждой строке текста
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i] + "\n"; // Добавляем перенос строки к каждой линии

    // Проверяем, влезет ли текущая строка в сообщение
    if (currentLength + line.length <= maxLength) {
      currentMessage += line;
      currentLength += line.length;
    } else {
      // Отправляем текущее сообщение, если лимит превышен
      if (messageId === null) {
        messageId = sendTelegramMessage(currentMessage); // Первое сообщение
      } else {
        messageId = sendTelegramMessage(currentMessage, messageId); // Последующие сообщения как ответы
      }

      // Очищаем текущее сообщение и начинаем новое с текущей строки
      currentMessage = line;
      currentLength = line.length;
    }
  }

  // Отправляем последнее сообщение, если что-то осталось
  if (currentMessage.length > 0) {
    if (messageId === null) {
      sendTelegramMessage(currentMessage); // Если это первое и единственное сообщение
    } else {
      sendTelegramMessage(currentMessage, messageId); // Ответ на предыдущее сообщение
    }
  }
}



function sendTelegramMessage() {
   var spreadsheet = SpreadsheetApp.openById(""); // Замените на ID вашей таблицы
  var sheet = spreadsheet.getSheetByName("price"); // Замените на имя вашего листа

  var lastRow = sheet.getLastRow();
   var groupedText = {};

  // Проходим по каждой строке
  for (var i = 2; i <= lastRow; i++) { // Начинаем со второй строки, чтобы пропустить заголовок
      var valueF = sheet.getRange(i, 6).getValue(); // Столбец F
      if (!valueF) { // Если F пустая, пропускаем код
        continue;
        Logger.log('CONTINUE')
      }
      var valueD = sheet.getRange(i, 4).getValue(); // Столбец D
      Logger.log(valueD)
      if (valueD) { // Если D не пустая
        var valueB = sheet.getRange(i, 2).getValue(); // Столбец B
        var valueC = sheet.getRange(i, 3).getValue(); // Столбец C

        // Складываем значения C и F как числа
        var sumCF = parseInt(valueC, 10) + parseInt(valueF, 10);

        // Формируем текст, объединяя значение B и сумму C+F
        var combinedText = valueB + " " + sumCF;
        
        // Группируем значения по значению из столбца D
        if (groupedText[valueD]) {
          groupedText[valueD] += combinedText + "\n";
        } else {
          groupedText[valueD] = combinedText + "\n";
        }
      }
    }
    
    Logger.log(groupedText)
    

  // Отправляем сгруппированные сообщения
  for (var group in groupedText) {
    var text = groupedText[group];
    Logger.log(text)
    // Формируем URL для отправки сообщения
    Logger.log('send mmessage...')
    sendMessageToTelegram(text)
    }  
}
  
