const url = new URL(location.href); 
const movieId = url.searchParams.get("id");
const movieTitle = url.searchParams.get("title");

const APILINK = 'http://localhost:8000/api/v1/reviews/';

const main = document.getElementById("section");
const title = document.getElementById("title");

title.innerText = movieTitle;

main.innerHTML = ''; 

// Creăm secțiunea pentru adăugarea unui review nou
const reviewFormContainer = document.createElement('div');
reviewFormContainer.innerHTML = `
  <div class="row new-review">
    <div class="column">
      <div class="card new-review-card">
          New Review
          <p><strong>Review: </strong>
            <input type="text" id="new_review" value="">
          </p>
          <p><strong>User: </strong>
            <input type="text" id="new_user" value="">
          </p>
          <p><a href="#" onclick="saveReview('new_review', 'new_user')">💾</a>
          </p>
      </div>
    </div>
  </div>
`;
main.appendChild(reviewFormContainer);

// Functie pentru a afisa recenziile
function returnReviews(url) {
  fetch(url + "movie/" + movieId)
      .then(res => res.json())
      .then(function(data) {
          const generalSentiment = data.generalSentiment;

          // Salvăm sentimentul general în localStorage pentru a-l folosi în alte pagini
          localStorage.setItem(`movie-${movieId}-sentiment`, generalSentiment);

          // Curățăm secțiunea principală, dar păstrăm formularul de adăugare a recenziilor
          main.innerHTML = '';
          main.appendChild(reviewFormContainer);  // Asigură că formularul de recenzie rămâne vizibil

          // Adăugăm recenziile în secțiunea principală
          data.reviews.forEach(review => {
              const div_card = document.createElement('div');
              div_card.classList.add('row');
              div_card.innerHTML = `
                  <div class="column">
                      <div class="card" id="${review._id}">
                          <p><strong>Review: </strong>${review.review}</p>
                          <p><strong>User: </strong>${review.user}</p>
                          <p><strong>Sentiment: </strong>${review.sentiment || 'Not available'}</p>
                          <p>
                              <a href="#" onclick="editReview('${review._id}', '${review.review}', '${review.user}', '${review.sentiment}')">✏️</a>
                              <a href="#" onclick="deleteReview('${review._id}')">🗑️</a>
                          </p>
                      </div>
                  </div>
              `;

              // Adăugăm clasa corespunzătoare sentimentului pentru card
              const cardElement = div_card.querySelector('.card');
              if (review.sentiment === 'POSITIVE') {
                  cardElement.classList.add('positive');
              } else if (review.sentiment === 'NEGATIVE') {
                  cardElement.classList.add('negative');
              } else {
                  cardElement.classList.add('neutral');
              }

              main.appendChild(div_card);
          });
      })
      .catch(function(error) {
          console.error("Error fetching reviews:", error);
      });
}

// Functie pentru a afisa detalii despre film
function showMovieDetails(movieId) {
    fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=18f3def148a582518cba2197e8aad8e2`)
        .then(res => res.json())
        .then(movie => {
            // Afișează detaliile filmului
            const movieDetailsSection = document.getElementById("movie-details");
            movieDetailsSection.innerHTML = `
                <h2>${movie.title}</h2>
                <p>${movie.overview}</p>
                <p><strong>Release Date:</strong> ${movie.release_date}</p>
                <p><strong>Rating:</strong> ${movie.vote_average}</p>
            `;
            movieDetailsSection.style.display = "block";
        })
        .catch(error => {
            console.error('Error fetching movie details:', error);
        });
}

// Asigură-te că detaliile filmului sunt afișate când pagina se încarcă
showMovieDetails(movieId);

// Apoi continuă cu restul codului
returnReviews(APILINK);

// Functii pentru editare, salvare si stergere reviewuri (raman neschimbate)
function editReview(id, review, user, sentiment) {
  const element = document.getElementById(id);
  const reviewInputId = "review" + id;
  const userInputId = "user" + id;
  
  element.innerHTML = `
    <p><strong>Review: </strong>
      <input type="text" id="${reviewInputId}" value="${review}">
    </p>
    <p><strong>User: </strong>
      <input type="text" id="${userInputId}" value="${user}">
    </p>
    <p><strong>Sentiment: </strong>${sentiment}</p>
    <p><a href="#" onclick="saveReview('${reviewInputId}', '${userInputId}', '${id}')">💾</a></p>
  `;
}

function saveReview(reviewInputId, userInputId, id="") {
  const review = document.getElementById(reviewInputId).value;
  const user = document.getElementById(userInputId).value;

  if (id) {
      fetch(APILINK + id, {
          method: 'PUT',
          headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({"user": user, "review": review})
      })
      .then(res => res.json())
      .then(res => {
          returnReviews(APILINK); 
      })
      .catch(error => {
          console.error("Error updating review:", error);
      });
  } else {
      fetch(APILINK + "new", {
          method: 'POST',
          headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({"user": user, "review": review, "movieId": movieId})
      })
      .then(res => res.json())
      .then(res => {
          returnReviews(APILINK); 
      })
      .catch(error => {
          console.error("Error saving review:", error);
      });
  }
}

function deleteReview(id) {
  fetch(APILINK + id, {
    method: 'DELETE'
  })
  .then(res => res.json())
  .then(res => {
      console.log(res);

      // Șterge cardul din DOM imediat
      const reviewElement = document.getElementById(id);
      if (reviewElement) {
          reviewElement.remove();
      }

      // Reîncărcăm recenziile și actualizăm culoarea cardului după ștergere
      returnReviews(APILINK);
  })
  .catch(error => {
      console.error("Error deleting review:", error);
  });
}
