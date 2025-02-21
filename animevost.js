(function () {
  "use strict";

  if (typeof Lampa !== "undefined") {
    console.log("Animevost Plugin: Начало загрузки");

    window.animevost_plugin = {
      // URL API AnimeVost из api.js
      apiUrl: "https://api.animetop.info/v1/",

      // Адаптированная функция AnimevostApiMethod для Lampa
      AnimevostApiMethod: function (
        method,
        onload,
        type,
        args = "",
        onerror = null
      ) {
        return new Promise((resolve, reject) => {
          Lampa.Network.http(
            this.apiUrl + method,
            {
              method: type,
              data: type === "POST" ? args : "",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0",
              },
              dataType: "json",
            },
            function (data) {
              if (data && data.state && data.state.status === "ok") {
                resolve(data);
              } else {
                reject(new Error("Ошибка API AnimeVost"));
              }
            },
            function (error) {
              console.error(
                `Animevost Plugin: Ошибка ${type} запроса к ${method}:`,
                error
              );
              reject(error || "Ошибка сети");
              if (onerror) onerror(error);
            }
          );
        });
      },

      // Вспомогательная функция для получения списка аниме с пагинацией
      sliceArray: function (array, size) {
        let subarray = [];
        for (let i = 0; i < Math.ceil(array.length / size); i++) {
          subarray[i] = array.slice(i * size, i * size + size);
        }
        return subarray;
      },

      // Метод получения каталога
      get: function (params, oncomplite, onerror) {
        console.log("Animevost Plugin: Запрос каталога через API AnimeVost");
        this.AnimevostApiMethod(
          "last?page=1&quantity=20",
          function (data) {
            var videos = data.data.map((item) => ({
              title: item.title || "Без названия",
              url: item.id ? `?id=${item.id}` : "", // URL для запроса деталей
              img: item.urlImagePreview || "",
              source: "animevost_final_win", // Уникальный ID для Windows
            }));
            oncomplite({ list: videos, next: "" });
          },
          "GET",
          "",
          function (error) {
            console.error("Animevost Plugin: Ошибка загрузки каталога:", error);
            // Fallback: парсинг animevost.org
            Lampa.Network.get(
              "https://animevost.org",
              { headers: { "User-Agent": "Mozilla/5.0" } },
              function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, "text/html");
                var items = doc.querySelectorAll(".shortstory") || [];
                var videos = [];
                items.forEach(function (item) {
                  var titleElement = item.querySelector("h2 a");
                  var title = titleElement
                    ? titleElement.textContent.trim()
                    : "Без названия";
                  var link = titleElement ? titleElement.href : "";
                  var poster = item.querySelector(".short_img img")
                    ? item.querySelector(".short_img img").src
                    : "";
                  videos.push({
                    title: title,
                    url: link,
                    img: poster,
                    source: "animevost_final_win", // Уникальный ID для Windows
                  });
                });
                oncomplite({ list: videos, next: "" });
              },
              onerror
            );
          }
        ).catch(onerror);
      },

      // Метод получения видеопотока
      stream: function (params, oncomplite, onerror) {
        console.log("Animevost Plugin: Запрос видео для:", params.url);
        var id = params.url.split("id=")[1] || "";
        if (!id) {
          onerror("ID аниме не найден");
          return;
        }

        this.AnimevostApiMethod(
          "playlist",
          function (data) {
            if (data.data && data.data.length > 0) {
              var playlist = data.data.sort(
                (a, b) =>
                  parseInt(a.name.match(/\d+/)) - parseInt(b.name.match(/\d+/))
              );
              var stream = playlist[0]; // Берем первую серию (можно добавить выбор качества)
              var quality = {
                SD: stream.std,
                HD: stream.hd,
              };
              oncomplite({
                url: stream.hd || stream.std, // Приоритет HD, если доступен
                quality: quality,
              });
            } else {
              onerror("Видео не найдено");
            }
          },
          "POST",
          "id=" + encodeURIComponent(id),
          function (error) {
            console.error(
              "Animevost Plugin: Ошибка получения плейлиста:",
              error
            );
            // Fallback: парсинг animevost.org
            Lampa.Network.get(
              "https://animevost.org" + params.url,
              { headers: { "User-Agent": "Mozilla/5.0" } },
              function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, "text/html");
                var scripts = doc.querySelectorAll("script") || [];
                var streams = [];
                scripts.forEach(function (script) {
                  var content = script.textContent || "";
                  var match = content.match(
                    /file:\s*["'](.+?\.(mp4|m3u8))["']/i
                  );
                  if (match) streams.push(match[1]);
                  var playlistMatch = content.match(/file:\s*\[(.+?)\]/i);
                  if (playlistMatch) {
                    var files = playlistMatch[1].split(",");
                    files.forEach(function (file) {
                      var cleanFile = file.replace(/["']/g, "").trim();
                      if (cleanFile.match(/\.(mp4|m3u8)$/))
                        streams.push(cleanFile);
                    });
                  }
                });
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
              onerror
            );
          }
        ).catch(onerror);
      },
    };

    // Регистрация компонента, как в online_mod.js (без StorageWorker)
    if (Lampa.Component && Lampa.Component.add) {
      console.log("Animevost Plugin: Регистрация компонента");
      Lampa.Component.add("online_animevost", {
        name: "Animevost",
        source: "animevost_final_win", // Уникальный ID для Windows
        get: window.animevost_plugin.get,
        stream: window.animevost_plugin.stream,
      });
      console.log("Animevost Plugin: Компонент зарегистрирован");
    } else {
      console.error("Animevost Plugin: Lampa.Component недоступен");
    }

    // Добавление источника через Lampa.Sources (проверка на случай доступности)
    if (Lampa.Sources && Lampa.Sources.add) {
      console.log("Animevost Plugin: Добавление источника через Lampa.Sources");
      Lampa.Sources.add({
        id: "animevost_final_win", // Уникальный ID для Windows
        title: "Animevost",
        icon: "https://animevost.org/favicon.ico",
        action: function () {
          console.log("Animevost Plugin: Открытие каталога");
          Lampa.Activity.push({
            url: "",
            title: "Animevost - Аниме",
            component: "online_animevost",
            source: "animevost_final_win", // Уникальный ID для Windows
          });
        },
      });
      console.log("Animevost Plugin: Источник добавлен через Lampa.Sources");
    } else {
      console.log("Animevost Plugin: Lampa.Sources недоступен");

      // Дополнительное обновление интерфейса без StorageWorker
      if (Lampa.Listener && Lampa.Listener.send) {
        Lampa.Listener.send("sources_update");
        console.log("Animevost Plugin: Отправлено событие sources_update (1)");
        setTimeout(() => {
          Lampa.Listener.send("sources_update");
          console.log(
            "Animevost Plugin: Отправлено событие sources_update (2)"
          );
        }, 1000);
        setTimeout(() => {
          Lampa.Listener.send("sources_update");
          console.log(
            "Animevost Plugin: Отправлено событие sources_update (3)"
          );
        }, 2000);
      }
      if (Lampa.Sources && Lampa.Sources.update) {
        Lampa.Sources.update();
        console.log(
          "Animevost Plugin: Список источников обновлен через Lampa.Sources.update"
        );
      }
    }

    console.log("Animevost Plugin: Инициализация завершена");
  }
})();
