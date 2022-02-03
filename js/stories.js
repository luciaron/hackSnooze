"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const userFavoritesString = JSON.stringify(currentUser.favorites);
  const userOwnStoriesString = JSON.stringify(currentUser.ownStories);
  
  if (userFavoritesString.indexOf(story.storyId) > -1) {
    return $(`
      <li id="${story.storyId}">
        <span class="star fav" >&starf; </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
  } else {
    return $(`
    <li id="${story.storyId}">
      <span class="star" >&starf; </span>
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `);
  }
}


function generateOwnStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  return $(`
    <li id="${story.storyId}">
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <span class="delete">remove story</span>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function putFavsOnPage() {
  console.debug("putFavsOnPage");

  $allStoriesList.empty();

  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
}

function putOwnStoriesOnPage() {
  console.debug("putOwnStoriesOnPage");

  $allStoriesList.empty();

  for (let story of currentUser.ownStories) {
    const $story = generateOwnStoryMarkup(story);
    $allStoriesList.append($story);
    $story.on("click", removeOwnStory)
  }
}

$submitForm.on("submit", sendSubmitForm);

async function sendSubmitForm(e) {
  e.preventDefault();
  const title = $("#submit-title").val();
  const author = $("#submit-author").val();
  const url = $("#submit-url").val();
  let res = await storyList.addStory(currentUser, {title, author, url});
  console.log('clicked');
  storyList = await StoryList.getStories();
  currentUser.ownStories.push(res);
  $submitForm[0].reset();
}

$allStoriesList.on("click", addStoryToFavorites);

//add stories to favorites
async function addStoryToFavorites(e) {

  e.preventDefault();

  const tag = e.target.tagName;
  const id = e.target.parentElement.getAttribute('id');
  const token = currentUser.loginToken;
  const username = currentUser.username;

  if (tag === "SPAN"){
    if (e.target.classList.contains('fav') !== true) {
      const res = await axios({
        method: "POST",
        url: `${BASE_URL}/users/${username}/favorites/${id}`,
        data: { token: token}
      });
      console.log(res);
      e.target.classList.toggle('fav');
      for (let story of storyList.stories) {
        if (story.storyId === id) {
          currentUser.favorites.push(story);
        }
      }
      console.debug(id, 'added to favorites');
    } else {
      const res = await axios({
        method: "DELETE",
        url: `${BASE_URL}/users/${username}/favorites/${id}`,
        data: { token: token }
      })
      console.debug(id, 'removed from favorites');
      //remove story from live favorites
      e.target.classList.toggle('fav');
      for (let story of storyList.stories) {
        if (story.storyId === id) {
          const idx = currentUser.favorites.indexOf(story);
          currentUser.favorites.splice(idx, 1);
        }
      }
    }
  }
}

async function removeOwnStory (e) {
  const ownStoryId = e.target.parentElement.getAttribute('id');
  const token = currentUser.loginToken;
  console.log('clicked to remove', ownStoryId);
  const res = await axios({
    method: "DELETE",
    url: `${BASE_URL}/stories/${ownStoryId}`,
    data: { token : token }
  })
  //removes story from currentUser obj
  for (let story of currentUser.ownStories) {
    if (story.storyId === ownStoryId) {
      const idx = currentUser.ownStories.indexOf(story);
      currentUser.ownStories.splice(idx, 1);
    }
  }
  //removes story from storyList obj
  for (let story of storyList.stories) {
    if (story.storyId === ownStoryId) {
      const idx = storyList.stories.indexOf(story);
      storyList.stories.splice(idx, 1)
    }
  }
  putOwnStoriesOnPage();
}