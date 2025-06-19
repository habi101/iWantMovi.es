const API_KEY = '9b53fd6f29ee601ac4a3d721b3d7ffe5';
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMG_URL = 'https://image.tmdb.org/t/p/original';
    let currentItem;

    async function fetchTrending(type) {
      const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
      const data = await res.json();
      return data.results;
    }

    async function fetchTrendingAnime() {
  let allResults = [];

  // Fetch from multiple pages to get more anime (max 3 pages for demo)
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    const filtered = data.results.filter(item =>
      item.original_language === 'ja' && item.genre_ids.includes(16)
    );
    allResults = allResults.concat(filtered);
  }

  return allResults;
}

function displayBanner(item) {
  document.getElementById('banner').style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
  document.getElementById('banner-rating').textContent = `★ ${item.vote_average.toFixed(1)}`;
  document.getElementById('banner-plot').textContent = item.overview || 'No description available';
  document.getElementById('banner-genre').textContent = 'Loading genres...';

  // Fetch genres
  fetch(`${BASE_URL}/${item.media_type}/${item.id}?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const genres = data.genres?.map(g => g.name).join(', ') || 'N/A';
      document.getElementById('banner-genre').textContent = genres;
    })
    .catch(() => {
      document.getElementById('banner-genre').textContent = 'N/A';
    });

  // Enable Watch Now button
  currentItem = item; // Save current item globally
  document.getElementById('watch-now-btn').onclick = () => showDetails(item);
}
    

    function displayList(items, containerId) {
      const container = document.getElementById(containerId);
      container.innerHTML = '';
      items.forEach(item => {
        const img = document.createElement('img');
        img.src = `${IMG_URL}${item.poster_path}`;
        img.alt = item.title || item.name;
        img.onclick = () => showDetails(item);
        container.appendChild(img);
      });
    }

    function showDetails(item) {
      currentItem = item;
      document.getElementById('modal-title').textContent = item.title || item.name;
      document.getElementById('modal-description').textContent = item.overview;
      document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
      document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
      changeServer();
      document.getElementById('modal').style.display = 'flex';
    }

    function changeServer() {
      const server = document.getElementById('server').value;
      const type = currentItem.media_type === "movie" ? "movie" : "tv";
      let embedURL = "";

      if (server === "vidsrc.cc") {
        embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
      } else if (server === "vidsrc.me") {
        embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
      } else if (server === "player.videasy.net") {
        embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
      }

      document.getElementById('modal-video').src = embedURL;
    }

    function closeModal() {
      document.getElementById('modal').style.display = 'none';
      document.getElementById('modal-video').src = '';
    }

    function openSearchModal() {
      document.getElementById('search-modal').style.display = 'flex';
      document.getElementById('search-input').focus();
    }

    function closeSearchModal() {
      document.getElementById('search-modal').style.display = 'none';
      document.getElementById('search-results').innerHTML = '';
    }

    async function searchTMDB() {
      const query = document.getElementById('search-input').value;
      if (!query.trim()) {
        document.getElementById('search-results').innerHTML = '';
        return;
      }

      const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
      const data = await res.json();

      const container = document.getElementById('search-results');
      container.innerHTML = '';
      data.results.forEach(item => {
        if (!item.poster_path) return;
        const img = document.createElement('img');
        img.src = `${IMG_URL}${item.poster_path}`;
        img.alt = item.title || item.name;
        img.onclick = () => {
          closeSearchModal();
          showDetails(item);
        };
        container.appendChild(img);
      });
    }

    async function init() {
  const movies = await fetchTrending('movie');
  const tvShows = await fetchTrending('tv');
  const anime = await fetchTrendingAnime();

  const selectedBannerMovie = movies[Math.floor(Math.random() * movies.length)];
  displayBanner(selectedBannerMovie);
  fetchMovieExtraDetails(selectedBannerMovie.id);

  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');
}

    init();
    
    async function fetchMovieExtraDetails(movieId) {
  const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
  const data = await res.json();

  document.getElementById('banner-genre').textContent = 'Genre: ' + data.genres.map(g => g.name).join(', ');
  document.getElementById('banner-rating').textContent = 'IMDb Rating: ⭐ ' + (data.vote_average || 'N/A');
  document.getElementById('banner-plot').textContent = data.overview || 'No plot summary available.';
}