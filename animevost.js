(function () {
  "use strict";

  let plugin = {
    name: "Animevost Plugin",
    version: "1.0.0",
    description: "Плагин для Animevost.org",
    icon: "https://animevost.org/favicon.ico",
  };

  let Animevost = {
    baseUrl: "https://animevost.org",

    // Инициализация плагина как источника
    init: function () {
      console.log("Animevost Plugin инициализирован как источник");

      // Регистрация источника в списке "Источники"
      Lampa.Sources.add({
        id: "animevost", // Уникальный идентификатор источника
        title: "Animevost", // Название, которое будет отображаться в списке
        icon: plugin.icon, // Иконка источника
        action: function () {
          Lampa.Activity.push({
            url: "",
            title: "Animevost - Аниме",
            component: "main",
            page: 1,
            source: "animevost", // Связываем с этим источником
          });
        },
      });
    },

    // Метод для получения данных каталога
    get: function (params, oncomplite, onerror) {
      let page = params.page || 1;
      let url = this.baseUrl + "/?page=" + page;

      Lampa.Network.get(
        url,
        { headers: { "User-Agent": "Mozilla/5.0" } },
        (data) => {
          let videos = this.parseCatalog(data);
          oncomplite(videos);
        },
        (error) => {
          onerror(error);
        }
      );
    },

    // Парсинг каталога
    parseCatalog: function (html) {
      let result = { list: [], next: "" };
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, "text/html");
      let items = doc.querySelectorAll(".shortstory");

      items.forEach((item) => {
        let titleElement = item.querySelector("h2 a");
        let title = titleElement?.textContent.trim() || "Без названия";
        let link = titleElement?.href || "";
        let poster = item.querySelector(".short_img img")?.src || "";

        result.list.push({
          title: title,
          url: link,
          img: poster,
          source: "animevost",
        });
      });

      result.next = doc.querySelector(".page_nav .next a")?.href || "";
      return result;
    },

    // Получение видеопотоков
    stream: function (params, oncomplite, onerror) {
      let url = params.url;

      Lampa.Network.get(
        url,
        { headers: { "User-Agent": "Mozilla/5.0" } },
        (data) => {
          let streams = this.extractVideoLinks(data);
          if (streams.length > 0) {
            let quality = {};
            streams.forEach((stream, index) => {
              quality[`Серия ${index + 1}`] = stream;
            });
            oncomplite({ url: streams[0], quality });
          } else {
            onerror("Видео не найдено");
          }
        },
        onerror
      );
    },

    extractVideoLinks: function (html) {
      let streams = [];
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, "text/html");

      let scripts = doc.querySelectorAll("script");
      scripts.forEach((script) => {
        let content = script.textContent;
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

      return streams;
    },
  };

  // Регистрация плагина
  Lampa.Plugin.register("animevost", Animevost);
  Animevost.init();
})();
