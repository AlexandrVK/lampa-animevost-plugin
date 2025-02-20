(function () {
  "use strict";

  if (typeof Lampa !== "undefined") {
    console.log("Animevost Plugin: Начало загрузки");

    window.animevost_plugin = {
      get: function (params, oncomplite, onerror) {
        console.log(
          "Animevost Plugin: Запрос каталога (оригинальный online_mod)"
        );
        Lampa.Network.http(
          "https://nb557.github.io/plugins/online_mod.json",
          function (result) {
            var items = result.data || [];
            oncomplite({
              list: items.map(function (item) {
                return {
                  title: item.title || "Нет названия",
                  url: item.url || "",
                  img: item.img || "",
                  source: "animevost",
                };
              }),
              next: "",
            });
          },
          onerror
        );
      },

      stream: function (params, oncomplite, onerror) {
        console.log("Animevost Plugin: Запрос видео (оригинальный online_mod)");
        Lampa.Network.http(
          params.url,
          function (result) {
            var streams = (result.data && result.data.streams) || [];
            if (streams.length > 0) {
              var quality = {};
              streams.forEach(function (stream, index) {
                quality["Качество " + (index + 1)] = stream.url;
              });
              oncomplite({
                url: streams[0].url,
                quality: quality,
              });
            } else {
              onerror("Видео не найдено");
            }
          },
          onerror
        );
      },
    };

    // Регистрация компонента
    if (Lampa.Component && Lampa.Component.add) {
      console.log("Animevost Plugin: Регистрация компонента");
      Lampa.Component.add("online_animevost", {
        name: "Animevost",
        source: "animevost",
        get: window.animevost_plugin.get,
        stream: window.animevost_plugin.stream,
      });
      console.log("Animevost Plugin: Компонент зарегистрирован");
    } else {
      console.error("Animevost Plugin: Lampa.Component недоступен");
    }

    // Добавление источника через Lampa.Sources
    if (Lampa.Sources && Lampa.Sources.add) {
      console.log("Animevost Plugin: Добавление источника через Lampa.Sources");
      Lampa.Sources.add({
        id: "animevost",
        title: "Animevost",
        icon: "https://animevost.org/favicon.ico",
        action: function () {
          console.log("Animevost Plugin: Открытие каталога");
          Lampa.Activity.push({
            url: "",
            title: "Animevost - Аниме",
            component: "online_animevost",
            source: "animevost",
          });
        },
      });
      console.log("Animevost Plugin: Источник добавлен через Lampa.Sources");
    } else {
      console.log(
        "Animevost Plugin: Lampa.Sources недоступен, пробуем StorageWorker"
      );

      // Альтернатива через StorageWorker, как в логах
      if (Lampa.Storage && Lampa.Storage.set) {
        console.log(
          "Animevost Plugin: Добавление источника через StorageWorker"
        );
        Lampa.Storage.set("online_choice_animevost", {
          id: "animevost",
          title: "Animevost",
          icon: "https://animevost.org/favicon.ico",
          action: function () {
            console.log("Animevost Plugin: Открытие каталога");
            Lampa.Activity.push({
              url: "",
              title: "Animevost - Аниме",
              component: "online_animevost",
              source: "animevost",
            });
          },
        });

        // Обновляем список источников
        if (Lampa.Listener && Lampa.Listener.send) {
          Lampa.Listener.send("sources_update");
          console.log("Animevost Plugin: Отправлено событие sources_update");
        }
        if (Lampa.Sources && Lampa.Sources.update) {
          Lampa.Sources.update();
          console.log(
            "Animevost Plugin: Список источников обновлен через Lampa.Sources.update"
          );
        }
      } else {
        console.log("Animevost Plugin: Lampa.Storage недоступен");
      }
    }

    console.log("Animevost Plugin: Инициализация завершена");
  }
})();
