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

    init: function () {
      console.log("Animevost Plugin инициализирован");
      // Добавляем в меню
      Lampa.Menu.add("animevost_menu", {
        title: plugin.name,
        icon: plugin.icon,
        action: () => {
          Lampa.Activity.push({
            url: "",
            title: "Animevost - Аниме",
            component: "main",
            page: 1,
            source: "animevost",
          });
        },
      });
      // Регистрируем как источник (альтернативный подход)
      Lampa.Storage.set("source_animevost", {
        title: "Animevost",
        id: "animevost",
        action: () => {
          Lampa.Activity.push({
            url: "",
            title: "Animevost - Аниме",
            component: "main",
            page: 1,
            source: "animevost",
          });
        },
      });
    },

    get: function (params, oncomplite, onerror) {
      let url = this.baseUrl;
      Lampa.Network.get(
        url,
        {},
        (data) => {
          oncomplite({
            list: [{ title: "Тест", url: url, img: "" }],
            next: "",
          });
        },
        onerror
      );
    },
  };

  Lampa.Plugin.register("animevost", Animevost);
  Animevost.init();
})();
