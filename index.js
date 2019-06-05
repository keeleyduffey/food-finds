'use strict';

const recipeSearchURL = 'https://api.edamam.com/search';
const recipeApiKey = 'a5bc8f457f16ab2945d26ed93a00be93';
const recipeAppId = '2ae6d843';
const articleSearchURL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';
const articleApiKey = '2sPn8MHXGMHtWsLCmSNlWVnTnnXIGTPO';
const videoSearchURL = 'https://www.googleapis.com/youtube/v3/search';
const videoApiKey = 'AIzaSyBOyBKYZHI6Bebu0jdI2RCcNR0Hf5TaRLY';

function formatQueryParams (params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  
  return queryItems.join('&');
}

function fetchRequest (params, searchURL, displayResults) {
  const queryString = formatQueryParams(params);
  const url = searchURL + '?' + queryString;

  fetch(url)
  .then(response => response.json())
  .then(responseJSON => displayResults(responseJSON))
  .catch(error => console.log(error));
}

function formatRecipeRequest (foodToFind, maxResults) {
  const params = {
    q: foodToFind,
    app_id: recipeAppId,
    app_key: recipeApiKey,
    to: maxResults,
  };
  fetchRequest(params, recipeSearchURL, displayRecipes);
}

function formatArticleRequest (foodToFind) {
  const params = {
    q: foodToFind,
    section_name: 'Food',
    news_desk: 'Food',
    'api-key': articleApiKey,
  };
  
  fetchRequest(params, articleSearchURL, displayArticles);
}

function formatVideoRequest (foodToFind) {
  const params = {
    key: videoApiKey,
    q: 'cooking '+foodToFind,
    part: 'snippet',
    order: 'rating',
    type: 'video',
    videoDefinition: 'high',
    videoEmbeddable: true,
    maxResults: 1,
    type: 'video',
  };
  
  fetchRequest(params, videoSearchURL, displayVideo);
}

function scrollTo (top) {
  $("html, body").animate({ scrollTop: top }, "slow");
}

function getResults (foodToFind, maxResults) {
  if (maxResults > 50) maxResults = 50;
  const recipes = formatRecipeRequest(foodToFind, maxResults);
  const articles = formatArticleRequest(foodToFind);
  const video = formatVideoRequest(foodToFind);
  
  scrollTo(900);
}

function createRecipeList (responses) {
  return responses.map(response => `
    <li>
      <a href="${response.recipe.url}" target="_blank">
        <h4>${response.recipe.label}</h4>
        <img src="${response.recipe.image}"  alt="${response.recipe.label} image" />
      </a>
    </li>`
  );
}

function displayRecipes (responseJSON) {
  $('#recipe-list').empty();
  const { hits } = responseJSON;
 
  if (hits.length === 0) {
    $('#recipe-list').html(`<li>No results found</li>`);
    $('.results').css('display','block');
  } else {
    const resultsList = createRecipeList(hits).join('');
    $('#recipe-list').html(`${resultsList}`);
    $('.results').css('display','block');
  }
}

function createArticleList (responses) {
  return responses.map(response => `
    <li>
      <a href="${response.web_url}" target="_blank">${response.headline.main}</a>
      <p class="kicker">${response.headline.kicker || ''}</p>
      <p class="byline">${response.byline.original || ''}</p>
      <p>${response.abstract || ''}</p>
    </li>`
  );
}

function displayArticles (responseJSON) {
  $('#article-list').empty();
  const { docs } = responseJSON.response;
  
  if (docs.length === 0) {
    $('#article-list').html(`<li>No results found</li>`);
    $('.results').css('display','block');
  } else {
    const resultsList = createArticleList(docs).join('');
    $('#article-list').html(`${resultsList}`);
    $('.results').css('display','block');
  }
}

function createVideoElement (videoId) {
 return ` 
  <iframe id="video-iframe"
    title="Food Video"
    src="https://www.youtube.com/embed/${videoId}"
    frameborder="0"></iframe>
  `;
}

function displayVideo (responseJSON) {
  $('#video-container').empty();
  const { items } = responseJSON;
  
  if (items.length === 0) {
    $('#video-container').html(`<p>No video found</p>`);
    $('.results').css('display','block');
  } else {
    const videoElement = createVideoElement(items[0].id.videoId);
    $('#video-container').html(`<div class="item">${videoElement}</div>`);
    $('.results').css('display','block');
  }
}

function submitForm() {
  $('form').submit(event => {
    event.preventDefault();
    const $foodToFind = $('#js-food-input').val();
    const $maxResults = $('#js-max-results').val();
    getResults($foodToFind, $maxResults);
  });
}

function resetForm () {
  $('.scroll-button').on('click', (event) => {
    event.preventDefault();
    scrollTo(0);
    $('#js-food-input').val('');
    $('#js-max-results').val(3);
  })
}

$(function() {
  submitForm();
  resetForm();
});
