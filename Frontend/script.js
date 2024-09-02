const APILINK = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=18f3def148a582518cba2197e8aad8e2&page=1';
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?&api_key=18f3def148a582518cba2197e8aad8e2&query=";

const main = document.getElementById("section");
const form = document.getElementById("form");
const search = document.getElementById("query");
const homeButton = document.getElementById("homeButton");

returnMovies(APILINK);

function returnMovies(url) {
  fetch(url).then(res => res.json())
  .then(function(data) {
      console.log(data.results);
      main.innerHTML = '';

      data.results.forEach(element => {
          const div_card = document.createElement('div');
          div_card.setAttribute('class', 'card');
          div_card.setAttribute('id', `card-${element.id}`); // Asociază un ID unic cardului

          const div_row = document.createElement('div');
          div_row.setAttribute('class', 'row');

          const div_column = document.createElement('div');
          div_column.setAttribute('class', 'column');

          const image = document.createElement('img');
          image.setAttribute('class', 'thumbnail');
          image.setAttribute('id', 'image');

          const title = document.createElement('h3');
          title.setAttribute('id', 'title');

          const center = document.createElement('center');

          title.innerHTML = `${element.title}<br><a href="movie.html?id=${element.id}&title=${element.title}">Reviews</a>`;
          image.src = IMG_PATH + element.poster_path;

          center.appendChild(image);
          div_card.appendChild(center);
          div_card.appendChild(title);
          div_column.appendChild(div_card);
          div_row.appendChild(div_column);

          main.appendChild(div_row);

          // Apelăm API-ul pentru a obține sentimentul general
          fetch(`http://localhost:8000/api/v1/reviews/movie/${element.id}`)
          .then(response => response.json())
          .then(sentimentData => {
              const generalSentiment = sentimentData.generalSentiment;

              // Adăugăm clasa corespunzătoare sentimentului
              if (generalSentiment === 'POSITIVE') {
                  div_card.classList.add('positive');
              } else if (generalSentiment === 'NEGATIVE') {
                  div_card.classList.add('negative');
              } else {
                  div_card.classList.add('neutral');
              }
          })
          .catch(error => {
              console.error('Error fetching sentiment data:', error);
          });
      });
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  main.innerHTML = '';

  const searchItem = search.value;

  if (searchItem) {
    returnMovies(SEARCHAPI + searchItem);
    search.value = "";
  }
});

homeButton.addEventListener("click", () => {
  returnMovies(APILINK); 
});
