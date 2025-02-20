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

  // Регистрация компонента
  if (typeof Lampa !== "undefined" && Lampa.Component && Lampa.Component.add) {
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

  console.log("Animevost Plugin: Инициализация завершена");
})();
