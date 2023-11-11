'use strict';

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
  return $(`
      <li id="${story.storyId}">
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
  console.debug('putStoriesOnPage');
  $allStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
  if (currentUser) addFavoriteStar();
}

/** gets list of favorites, generates HTML, puts on page */
function putFavoritesOnPage() {
  console.debug('putFavoritesOnPage');
  $favoriteStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favoriteStoriesList.append($story);
  }
  $favoriteStoriesList.show();
  addFavoriteStar();
}

/** handle the submit of the new story form */
async function submitNewStory(evt) {
  evt.preventDefault();
  console.debug('submitNewStory');
  const author = $('#story-author').val();
  const title = $('#story-title').val();
  const url = $('#story-url').val();
  // await until the response can be received
  await storyList.addStory(currentUser, { title, author, url });
  putStoriesOnPage();
  $storyForm.trigger('reset');
}

$storyForm.on('submit', submitNewStory);

/** add favorite star to stories list */
function addFavoriteStar() {
  $('li').each(function () {
    if (currentUser.favorites.some(story => story.storyId === this.id)) {
      $(this).prepend(
        `<span class="star"><i class="fa-solid fa-star"></i></span>`
      );
    } else $(this).prepend(`<span class="star"><i class="fa-regular fa-star"></i></span>`);
  });
}

/** add trash can to my stories list */
function addDeleteIcon() {
  // add trash can when my stories list is built.
}
