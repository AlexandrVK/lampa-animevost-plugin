// Lampa Plugin: AnimeVost Source
(function () {
  const PLUGIN_ID = "animevost_source";
  const PLUGIN_NAME = "AnimeVost";

  function init() {
    Lampa.Source.add({
      id: PLUGIN_ID,
      name: PLUGIN_NAME,
      type: "online",
      version: "1.0.0",
      description: "Источник AnimeVost для Lampa",
      onSearch: search,
      onFetch: fetch,
    });
  }

  function search(query, callback) {
    console.log(`Идет поиск на AnimeVost: ${query}`);

    fetch(`https://api.animevost.org/v1/search?q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        const results = data.map((item) => ({
          title: item.title,
          url: item.link,
          poster: item.image,
          quality: "HD",
        }));
        callback(results);
      })
      .catch((error) => console.error("Ошибка поиска:", error));
  }

  function fetch(url, callback) {
    console.log(`Получение потока с AnimeVost: ${url}`);

    fetch(`https://api.animevost.org/v1/stream?url=${encodeURIComponent(url)}`)
      .then((response) => response.json())
      .then((data) => callback(data.streams))
      .catch((error) => console.error("Ошибка получения потока:", error));
  }

  Lampa.Plugin.register(PLUGIN_ID, init);
})();
