(function () {
  "use strict";

  console.log("Animevost Plugin: Начало загрузки");

  let plugin = {
    name: "Animevost Plugin",
    version: "1.0.0",
    description: "Тестовый плагин для Animevost",
    icon: "https://animevost.org/favicon.ico",
  };

  let Animevost = {
    init: function () {
      console.log("Animevost Plugin: Инициализация");
      try {
        if (typeof Lampa === "undefined") {
          console.error("Animevost Plugin: Lampa API недоступен");
          return;
        }
        if (typeof Lampa.Sources === "undefined" || !Lampa.Sources.add) {
          console.error("Animevost Plugin: Lampa.Sources.add недоступен");
          return;
        }

        Lampa.Sources.add({
          id: "animevost",
          title: "Animevost",
          icon: plugin.icon,
          action: function () {
            console.log("Animevost Plugin: Открытие тестового каталога");
            Lampa.Activity.push({
              url: "",
              title: "Animevost - Тест",
              component: "main",
              page: 1,
              source: "animevost",
            });
          },
        });
        console.log("Animevost Plugin: Источник успешно добавлен");
      } catch (e) {
        console.error("Animevost Plugin: Ошибка в init:", e.message);
      }
    },

    get: function (params, oncomplite, onerror) {
      console.log("Animevost Plugin: Вызов get");
      try {
        oncomplite({
          list: [
            { title: "Тестовое аниме", url: "https://animevost.org", img: "" },
          ],
          next: "",
        });
      } catch (e) {
        console.error("Animevost Plugin: Ошибка в get:", e.message);
        onerror("Ошибка тестового каталога");
      }
    },
  };

  try {
    console.log("Animevost Plugin: Регистрация плагина");
    Lampa.Plugin.register("animevost", Animevost);
    Animevost.init();
  } catch (e) {
    console.error("Animevost Plugin: Ошибка при регистрации:", e.message);
  }
})();
