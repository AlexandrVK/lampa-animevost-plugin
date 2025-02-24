(function () {
  "use strict";

  if (typeof Lampa !== "undefined") {
    console.log("Animevost Plugin: Скрипт запущен");

    window.animevost_plugin = {
      apiUrl: "https://api.animetop.info/v1/",

      get: function (params, oncomplite, onerror) {
        console.log("Animevost Plugin: Запрос каталога через API AnimeVost");
        // Здесь должна быть логика запроса и обработки данных каталога
      },

      stream: function (params, oncomplite, onerror) {
        console.log("Animevost Plugin: Запрос видео для:", params.url);
        // Здесь должна быть логика запроса плейлиста и получения потока
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
    } else {
      console.error("Animevost Plugin: Lampa.Component недоступен");
    }

    // Добавление источника через Lampa.Listener (аналог prestige.js)
    if (Lampa.Listener && Lampa.Listener.send) {
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
          // После добавления источника отправляем событие обновления
          Lampa.Listener.send("sources_update");
        } else {
          console.error(
            "Animevost Plugin: Ошибка добавления источника, объект источников не найден."
          );
        }
      });
    } else {
      console.error("Animevost Plugin: Lampa.Listener недоступен");
    }

    console.log("Animevost Plugin: Инициализация завершена");
  }
})();
