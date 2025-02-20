(function () {
  "use strict";

  // Описание плагина
  let plugin = {
    name: "Animevost Plugin",
    version: "1.0.2",
    description: "Плагин для Animevost.org",
    icon: "https://animevost.org/favicon.ico",
  };

  let Animevost = {
    baseUrl: "https://animevost.org",

    // Инициализация плагина
    init: function () {
      console.log("Animevost Plugin: Инициализация");
      // Регистрация как источник в разделе "Смотреть" → "Источники"
      if (typeof Lampa.Sources !== "undefined" && Lampa.Sources.add) {
        Lampa.Sources.add({
          id: "animevost",
          title: "Animevost",
          icon: plugin.icon,
          action: function () {
            console.log("Animevost Plugin: Открытие каталога");
            Lampa.Activity.push({
              url: "",
              title: "Animevost - Аниме",
              component: "main",
              page: 1,
              source: "animevost",
            });
          },
        });
        console.log("Animevost Plugin: Источник зарегистрирован");
      } else {
        console.error("Animevost Plugin: Lampa.Sources.add недоступен");
      }
    },

    // Метод получения каталога
    get: function (params, oncomplite, onerror) {
      console.log("Animevost Plugin: Запрос каталога, страница:", params.page);
      let page = params.page || 1;
      let url = this.baseUrl + "/?page=" + page;

      if (!Lampa.Network || !Lampa.Network.get) {
        console.error("Animevost Plugin: Lampa.Network.get недоступен");
        onerror("Сетевой API недоступен");
        return;
      }

      Lampa.Network.get(
        url,
        { headers: { "User-Agent": "Mozilla/5.0" } },
        (data) => {
          if (typeof data !== "string") {
            console.error("Animevost Plugin: Неверный формат данных:", data);
            onerror("Неверный ответ от сервера");
            return;
          }

          let videos = this.parseCatalog(data);
          if (videos && videos.list) {
            console.log(
              "Animevost Plugin: Каталог получен, элементов:",
              videos.list.length
            );
            oncomplite(videos);
          } else {
            console.error("Animevost Plugin: Ошибка парсинга каталога");
            onerror("Ошибка парсинга");
          }
        },
        (error) => {
          console.error("Animevost Plugin: Ошибка сети:", error);
          onerror(error || "Не удалось загрузить каталог");
        }
      );
    },

    // Парсинг каталога
    parseCatalog: function (html) {
      let result = { list: [], next: "" };
      try {
        let parser = new DOMParser();
        let doc = parser.parseFromString(html || "", "text/html");
        if (!doc) {
          console.error("Animevost Plugin: Не удалось создать DOM");
          return result;
        }

        let items = doc.querySelectorAll(".shortstory") || [];
        items.forEach((item) => {
          let titleElement = item.querySelector("h2 a");
          let title = titleElement
            ? titleElement.textContent.trim()
            : "Без названия";
          let link = titleElement ? titleElement.href : "";
          let poster = item.querySelector(".short_img img")
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
      } catch (e) {
        console.error("Animevost Plugin: Ошибка в parseCatalog:", e.message);
      }
      return result;
    },

    // Получение потоков (для воспроизведения)
    stream: function (params, oncomplite, onerror) {
      console.log("Animevost Plugin: Запрос видео для:", params.url);
      let url = params.url || "";

      if (!url) {
        console.error("Animevost Plugin: URL не указан");
        onerror("URL не предоставлен");
        return;
      }

      Lampa.Network.get(
        url,
        { headers: { "User-Agent": "Mozilla/5.0" } },
        (data) => {
          let streams = this.extractVideoLinks(data);
          if (streams && streams.length > 0) {
            let quality = {};
            streams.forEach((stream, index) => {
              quality[`Серия ${index + 1}`] = stream;
            });
            console.log("Animevost Plugin: Потоки найдены:", streams);
            oncomplite({ url: streams[0], quality: quality });
          } else {
            console.error("Animevost Plugin: Потоки не найдены");
            onerror("Видео не найдено");
          }
        },
        (error) => {
          console.error("Animevost Plugin: Ошибка сети в stream:", error);
          onerror(error || "Ошибка загрузки видео");
        }
      );
    },

    // Извлечение ссылок на видео
    extractVideoLinks: function (html) {
      let streams = [];
      try {
        let parser = new DOMParser();
        let doc = parser.parseFromString(html || "", "text/html");
        if (!doc) {
          console.error("Animevost Plugin: Не удалось создать DOM для видео");
          return streams;
        }

        let scripts = doc.querySelectorAll("script") || [];
        scripts.forEach((script) => {
          let content = script.textContent || "";
          let match = content.match(/file:\s*["'](.+?\.(mp4|m3u8))["']/i);
          if (match) streams.push(match[1]);

          let playlistMatch = content.match(/file:\s*\[(.+?)\]/i);
          if (playlistMatch) {
            let files = playlistMatch[1].split(",");
            files.forEach((file) => {
              let cleanFile = file.replace(/["']/g, "").trim();
              if (cleanFile.match(/\.(mp4|m3u8)$/)) streams.push(cleanFile);
            });
          }
        });
      } catch (e) {
        console.error(
          "Animevost Plugin: Ошибка в extractVideoLinks:",
          e.message
        );
      }
      return streams;
    },
  };

  // Регистрация плагина
  try {
    console.log("Animevost Plugin: Регистрация плагина");
    Lampa.Plugin.register("animevost", Animevost);
    Animevost.init();
  } catch (e) {
    console.error("Animevost Plugin: Ошибка при регистрации:", e.message);
  }
})();
