'use strict';

const BASE_URL = 'https://hack-or-snooze-v3.herokuapp.com';

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    const newURL = new URL(this.url);

    return newURL.host;
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: 'GET',
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory({ loginToken }, { title, author, url }) {
    const {
      data: { story },
    } = await axios.post(`${BASE_URL}/stories`, {
      token: loginToken,
      story: { author, title, url },
    });
    const newStory = new Story(story);
    this.stories.unshift(newStory);
    currentUser.ownStories.unshift(newStory);
    return newStory;
  }
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    // this.favorites = favorites.map(s => new Story(s));
    this.updateFavorites(favorites);
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  updateFavorites(favorites) {
    this.favorites = favorites.map(s => new Story(s));
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: 'POST',
      data: { user: { username, password, name } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: 'POST',
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: 'GET',
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error('loginViaStoredCredentials failed', err);
      return null;
    }
  }

  // method to add favorite story
  async addFavorite(storyId) {
    console.debug('add favorite');
    const {
      data: {
        user: { favorites },
      },
    } = await axios.post(
      `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
      { token: this.loginToken }
    );
    // update local favorites array with new favorite
    this.favorites.push(new Story(favorites[favorites.length - 1])); //search by ID instead of favorites -1
  }

  // method to remove favorite story
  async removeFavorite(removeId) {
    console.debug('remove favorite');
    const {
      data: {
        user: { favorites },
      },
    } = await axios.delete(
      `${BASE_URL}/users/${this.username}/favorites/${removeId}`,
      { data: { token: this.loginToken } }
    );
    this.updateFavorites(favorites);
  }

  // method to delete ownStory
  async deleteOwnStory(deleteId) {
    console.debug('delete ownStory');
    // delete from API
    const {
      data: { story },
    } = await axios.delete(`${BASE_URL}/stories/${deleteId}`, {
      data: { token: this.loginToken },
    });
    // remove from this.ownStories
    const removeIndexOwn = this.ownStories.findIndex(
      ({ storyId }) => storyId === deleteId
    );
    this.ownStories.splice(removeIndexOwn, 1);
    //remove from this.favorites (if its a favorite)
    const removeIndexFavorites = this.favorites.findIndex(
      ({ storyId }) => storyId === deleteId
    );
    if (removeIndexFavorites) this.favorites.splice(removeIndexFavorites, 1);
    // remove from main storyList
    const removeIndexAll = storyList.stories.findIndex(
      ({ storyId }) => storyId === deleteId
    );
    storyList.stories.splice(removeIndexAll, 1);
  }
}
