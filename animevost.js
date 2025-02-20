(function () {
  "use strict";

  console.log("Animevost Plugin: Начало загрузки");

  // Определяем объект плагина
  window.animevost_plugin = {
    baseUrl: "https://animevost.org",

    get: function (params, oncomplite, onerror) {
      console.log("Animevost Plugin: Запрос каталога, страница:", params.page);
      var page = params.page || 1;
      var url = this.baseUrl + "/?page=" + page;

      Lampa.Network.get(
        url,
        { headers: { "User-Agent": "Mozilla/5.0" } },
        function (data) {
          var videos = window.animevost_plugin.parseCatalog(data);
          oncomplite(videos);
        },
        function (error) {
          console.error("Animevost Plugin: Ошибка сети:", error);
          onerror(error || "Ошибка загрузки каталога");
        }
      );
    },

    parseCatalog: function (html) {
      console.log("Animevost Plugin: Парсинг каталога");
      var result = { list: [], next: "" };
      var parser = new DOMParser();
      var doc = parser.parseFromString(html || "", "text/html");
      var items = doc.querySelectorAll(".shortstory") || [];

      items.forEach(function (item) {
        var titleElement = item.querySelector("h2 a");
        var title = titleElement
          ? titleElement.textContent.trim()
          : "Без названия";
        var link = titleElement ? titleElement.href : "";
        var poster = item.querySelector(".short_img img")
          ? item.querySelector(".short_img img").src
          : "";

        result.list.push({
          title: title,
          url: link,
          img: poster,
          source: "animevost",
        });
      });

      result.next = doc.querySelector(".page_nav .next a")
        ? doc.querySelector(".page_nav .next a").href
        : "";
      console.log(
        "Animevost Plugin: Каталог спарсен, элементов:",
        result.list.length
      );
      return result;
    },

    stream: function (params, oncomplite, onerror) {
      console.log("Animevost Plugin: Запрос видео для:", params.url);
      var url = params.url || "";

      Lampa.Network.get(
        url,
        { headers: { "User-Agent": "Mozilla/5.0" } },
        function (data) {
          var streams = window.animevost_plugin.extractVideoLinks(data);
          if (streams.length > 0) {
            var quality = {};
            streams.forEach(function (stream, index) {
              quality["Серия " + (index + 1)] = stream;
            });
            oncomplite({ url: streams[0], quality: quality });
          } else {
            onerror("Видео не найдено");
          }
        },
        function (error) {
          console.error("Animevost Plugin: Ошибка сети в stream:", error);
          onerror(error || "Ошибка загрузки видео");
        }
      );
    },

    extractVideoLinks: function (html) {
      var streams = [];
      var parser = new DOMParser();
      var doc = parser.parseFromString(html || "", "text/html");
      var scripts = doc.querySelectorAll("script") || [];

      scripts.forEach(function (script) {
        var content = script.textContent || "";
        var match = content.match(/file:\s*["'](.+?\.(mp4|m3u8))["']/i);
        if (match) streams.push(match[1]);

        var playlistMatch = content.match(/file:\s*\[(.+?)\]/i);
        if (playlistMatch) {
          var files = playlistMatch[1].split(",");
          files.forEach(function (file) {
            var cleanFile = file.replace(/["']/g, "").trim();
            if (cleanFile.match(/\.(mp4|m3u8)$/)) streams.push(cleanFile);
          });
        }
      });
      console.log("Animevost Plugin: Найдено потоков:", streams.length);
      return streams;
    },
  };

  // Функция для регистрации источника
  function registerAnimevost() {
    console.log("Animevost Plugin: Регистрация компонента");
    if (
      typeof Lampa !== "undefined" &&
      Lampa.Component &&
      Lampa.Component.add
    ) {
      Lampa.Component.add("online_animevost", {
        name: "Animevost",
        source: "animevost",
        get: window.animevost_plugin.get,
        stream: window.animevost_plugin.stream,
      });
      console.log("Animevost Plugin: Компонент зарегистрирован");

      // Проверяем и добавляем в список источников
      if (Lampa.Online && Lampa.Online.add) {
        Lampa.Online.add({
          id: "animevost",
          title: "Animevost",
          icon: "https://animevost.org/favicon.ico",
        });
        console.log("Animevost Plugin: Источник добавлен через Lampa.Online");
      } else {
        console.log(
          "Animevost Plugin: Lampa.Online недоступен, источник добавлен только как компонент"
        );
      }
    } else {
      console.error("Animevost Plugin: Lampa.Component недоступен");
    }
  }

  // Выполняем регистрацию с задержкой, чтобы дождаться инициализации Lampa
  setTimeout(function () {
    registerAnimevost();
    console.log("Animevost Plugin: Инициализация завершена с задержкой");
  }, 1000); // Задержка 1 секунда
})();
