'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage(storyList.stories, $allStoriesList);
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
      <hr />
    `);
}

// Reusable function to put stories on page ( allStories, favorites and ownStories)
function putStoriesOnPage(storyList, $domStoryList) {
  console.debug('putStoriesOnPage');
  $domStoryList.empty();
  if (storyList.length > 0) {
    // loop through storyList and generate HTML for them
    for (let story of storyList) {
      const $story = generateStoryMarkup(story);
      $domStoryList.append($story);
    }
  } else $domStoryList.text('There are no stories here yet!');
  $domStoryList.show();
  if (currentUser) addFavoriteStar();
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
  putStoriesOnPage(storyList.stories, $allStoriesList);
  $storyForm.trigger('reset');
}

$storyForm.on('submit', submitNewStory);

/** add favorite star to stories list */
function addFavoriteStar() {
  $('li').each(function () {
    if (currentUser.favorites.some(story => story.storyId === this.id)) {
      $(this).prepend(
        `<span class="star"><i class="fa-star fa-solid"></i></span>`
      );
    } else $(this).prepend(`<span class="star"><i class="fa-star fa-regular"></i></span>`);
  });
}

/** handle click to add/remove favorite */
async function handleFavoriteClick(evt) {
  const $favoriteStar = $(evt.target);
  // get id to pass into add/remove favorite function
  const storyId = $favoriteStar.closest('li').attr('id');

  // determine favorite status by star class, add/remove via API, update star class

  // TODO: add method to USER class - add isFavorite(storyId) instead of using user interface
  if ($favoriteStar.hasClass('fa-star fa-solid')) {
    await currentUser.removeFavorite(storyId);
    $favoriteStar.removeClass('fa-solid');
    $favoriteStar.addClass('fa-regular');
  } else if ($favoriteStar.hasClass('fa-star fa-regular')) {
    await currentUser.addFavorite(storyId);
    $favoriteStar.removeClass('fa-regular');
    $favoriteStar.addClass('fa-solid');
  }
}
// event listener for add/remove favorite
$('.stories-list').on('click', handleFavoriteClick);

/** add trash can to my stories list */
function addDeleteIcon() {
  $myStoriesList.children('li').each(function () {
    $(this).prepend(
      '<span class="trash"><i class="fa-solid fa-trash-can"></i></span>'
    );
  });
}

/** handle click to delete ownStory */
async function handleDeleteClick(evt) {
  const $trashCan = $(evt.target);
  if ($trashCan.hasClass('fa-solid fa-trash-can')) {
    const storyId = $trashCan.closest('li').attr('id');
    await currentUser.deleteOwnStory(storyId);
    $trashCan.closest('li').remove();
  }
}

$myStoriesList.on('click', handleDeleteClick);
