(function () {
  "use strict";

  if (typeof Lampa !== "undefined") {
    console.log("Animevost Plugin: Скрипт запущен");

    window.animevost_plugin = {
      apiUrl: "https://api.animetop.info/v1/",

      get: function (params, oncomplite, onerror) {
        console.log("Animevost Plugin: Запрос каталога через API AnimeVost");
        // Запрос API Animevost и обработка данных
      },

      stream: function (params, oncomplite, onerror) {
        console.log("Animevost Plugin: Запрос видео для:", params.url);
        // Запрос плейлиста и обработка потока
      },
    };

    // Регистрация компонента
    if (Lampa.Component && Lampa.Component.add) {
      console.log("Animevost Plugin: Регистрация компонента");
      Lampa.Component.add("online_animevost", {
        name: "Animevost",
        source: "animevost_final_win",
        get: window.animevost_plugin.get,
        stream: window.animevost_plugin.stream,
      });
    }

    // Надежное добавление источника через Lampa.Listener
    Lampa.Listener.follow("sources", function (e) {
      if (e.type === "start" && e.object && e.object.sources) {
        console.log(
          "Animevost Plugin: Добавление источника через Lampa.Listener"
        );
        e.object.sources.push({
          id: "animevost_final_win",
          title: "Animevost",
          icon: "https://animevost.org/favicon.ico",
          action: function () {
            console.log("Animevost Plugin: Открытие каталога Animevost");
            Lampa.Activity.push({
              url: "",
              title: "Animevost - Аниме",
              component: "online_animevost",
              source: "animevost_final_win",
            });
          },
        });
      } else {
        console.error(
          "Animevost Plugin: Ошибка добавления источника, объект источников не найден."
        );
      }
    });

    console.log("Animevost Plugin: Инициализация завершена");
  }
})();
