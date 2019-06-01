'use strict';

const recipeSearchURL = 'https://api.edamam.com/search',
  recipeApiKey = 'a5bc8f457f16ab2945d26ed93a00be93',
  recipeAppId = '2ae6d843',
  articleSearchURL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json',
  articleApiKey = '2sPn8MHXGMHtWsLCmSNlWVnTnnXIGTPO',
  videoSearchURL = 'https://www.googleapis.com/youtube/v3/search',
  videoApiKey = 'AIzaSyBOyBKYZHI6Bebu0jdI2RCcNR0Hf5TaRLY';

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function fetchRequest (params, searchURL, displayResults) {
  const queryString = formatQueryParams(params),
    url = searchURL + '?' + queryString;

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
    to: maxResults
  };
  fetchRequest(params, recipeSearchURL, displayRecipes);
}

function formatArticleRequest (foodToFind) {
  const params = {
    q: foodToFind,
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

function getResults (foodToFind, maxResults) {
  const recipes = formatRecipeRequest(foodToFind, maxResults),
    articles = formatArticleRequest(foodToFind),
    video = formatVideoRequest(foodToFind);
}


function createRecipeList (responses) {
  return responses.map(response => `
    <li>
      <a href="${response.recipe.url}">${response.recipe.label}</a>
      <img src="${response.recipe.image}" />
    </li>`
  );
}

function displayRecipes (responseJSON) {
  $('#recipe-list').empty();
  if (responseJSON.hits.length === 0) {
    $('#recipe-list').html(`<ul><li>No results found</li></ul>`);
    $('.results').css('display','block');
  } else {
    const resultsList = createRecipeList(responseJSON.hits).join('<br>');
    $('#recipe-list').html(`<ul>${resultsList}</ul>`);
    $('.results').css('display','block');

  }
}

function createArticleList (responses) {
   return responses.map(response => `
    <li>
      <a href="${response.web_url}">${response.headline.main}</a>
      <p>${response.headline.kicker ? response.headline.kicker : ''}</p>
      <p>${response.abstract}</p>
    </li>`
  );
}

function displayArticles (responseJSON) {
  $('#article-list').empty();
  if (responseJSON.response.docs.length === 0) {

    $('#article-list').html(`<ul><li>No results found</li></ul>`);
    $('.results').css('display','block');
  } else {
    const resultsList = createArticleList(responseJSON.response.docs).join('<br>');
    $('#article-list').html(`<ul>${resultsList}</ul>`);
    $('.results').css('display','block');

  }
}

function createVideoElement (videoId) {
 return ` 
  <iframe id="existing-iframe-example"
    width="640" height="360"
    src="https://www.youtube.com/embed/${videoId}"
    frameborder="0"></iframe>
  `;
}

let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('existing-iframe-example', {
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function displayVideo (responseJSON) {
  $('#video-container').empty();
  const {items} = responseJSON;
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
    const foodToFind = $('#js-food-input').val(),
      maxResults = $('#js-max-results').val();
    getResults(foodToFind, maxResults);
  });
}

$(function() {
  submitForm();
});