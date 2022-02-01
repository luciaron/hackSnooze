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

  const hostName = story.getHostName(); // ask Ryan about the css issue; used inline styling in the interim
  return $(`
      <li id="${story.storyId}">
        <span class="star" style="color:#ff6600">&star; </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
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
  // console.log(res);
  // return res;
}

$favStar.on("submit", addStoryToFavorites); // selector didn't work. select $allStoriesList then note target?

//add stories to favorites
async function addStoryToFavorites(e) {
  e.preventDefault();
  console.log(e.target);
}