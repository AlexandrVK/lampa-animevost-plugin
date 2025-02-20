(function () {
  "use strict";

  console.log("Animevost Plugin: Начало загрузки");

  // Минимальный объект плагина
  window.animevost_plugin = {
    get: function (params, oncomplite, onerror) {
      console.log("Animevost Plugin: Запрос каталога (пустой)");
      oncomplite({ list: [], next: "" }); // Пустой каталог
    },

    stream: function (params, oncomplite, onerror) {
      console.log("Animevost Plugin: Запрос видео (пустой)");
      onerror("Контент недоступен"); // Пустой поток
    },
  };

  // Регистрация компонента, как в online_mod.js
  if (typeof Lampa !== "undefined" && Lampa.Component && Lampa.Component.add) {
    console.log("Animevost Plugin: Регистрация компонента");
    Lampa.Component.add("online_animevost", {
      name: "Animevost",
      source: "animevost",
      get: window.animevost_plugin.get,
      stream: window.animevost_plugin.stream,
    });
    console.log("Animevost Plugin: Компонент зарегистрирован");

    // Пробуем добавить через Lampa.Sources, как в online_mod.js
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
  } else {
    console.error("Animevost Plugin: Lampa.Component недоступен");
  }

  console.log("Animevost Plugin: Инициализация завершена");
})();
