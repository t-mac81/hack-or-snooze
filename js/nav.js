'use strict';

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug('navAllStories', evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on('click', '#nav-all', navAllStories);

/** Show new story form when click on "submit" */
function storyFormClick(evt) {
  console.debug('storyFormClick', evt);
  $storyForm.show();
  $favoriteStoriesList.hide();
}

$navStoryForm.on('click', storyFormClick);

/** Show login/signup on click on "login" */
function navLoginClick(evt) {
  console.debug('navLoginClick', evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on('click', navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug('updateNavOnLogin');
  $('.main-nav-links').show();
  $navLogin.hide();
  $navLogOut.show();
  $navLeft.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** show favorites when favorites is clicked on navbar */
function navFavoritesClick() {
  console.debug('navFavoritesClick');
  hidePageComponents();
  putFavoritesOnPage();
}

$navFavorites.on('click', navFavoritesClick);

/** show my stories when my stories is clicked on navbar*/
function navMyStoriesClick() {
  console.debug('navMyStoriesClick');
  hidePageComponents();
}

$navMyStories.on('click', navMyStoriesClick);
