import axios from "axios";

const API_KEY = "8138c0e35c9888e39ff5a62414fbf570";
const USER_ENDPOINT = `http://ws.audioscrobbler.com/2.0/?method=user.getinfo&api_key=${API_KEY}&format=json`;
const LIBRARY_ENDPOINT = `http://ws.audioscrobbler.com/2.0/?method=library.getartists&api_key=${API_KEY}&format=json`;

function login(username) {
  return new Promise(async (resolve, reject) => {
    getUserInfo(username).then(user => {
      console.log(user);
      localStorage.setItem("lastfm", JSON.stringify({ name: user.name }));
      resolve();
    }, error => {
      reject("Can't connect");
    });
  });
}

function logout() {
  localStorage.removeItem("lastfm");
}

function isLoggedIn() {
  return !!localStorage.getItem("lastfm");
}

function getUserInfo(username) {
  const user = username || JSON.parse(localStorage.getItem("lastfm")).name;
  return new Promise((resolve, reject) => {
    axios.get(`${USER_ENDPOINT}&user=${user}`).then((response) => {
      resolve(response.data.user);
    }, (error) => {
      logout();
      reject();
    });
  });
}

async function getArtists(minScrobbles = 25, maxScrobbles = 30, updateProgress) {
  const user = JSON.parse(localStorage.getItem("lastfm")).name;
  var artists = [];
  let page = 1;
  let nextPage = true;
  updateProgress(0, "Retrieving artists");
  while (nextPage) {
    let response = null;
    try {
      response = await axios.get(`${LIBRARY_ENDPOINT}&user=${user}&page=${page}`);
    } catch (error) {
      console.log(error);
      return Promise.reject();
    }

    const a = response.data.artists;
    updateProgress(0, `Retrieving artists (${artists.length})`);
    nextPage = (a.artist[a.artist.length - 1].playcount >= minScrobbles && page < a["@attr"].totalPages);
    for (const artist of a.artist) {
      if (artist.playcount >= minScrobbles && artist.playcount < maxScrobbles) {
        artists.push({ name: artist.name, count: maxScrobbles - artist.playcount });
      }
    }

    page += 1;
  }
  return Promise.resolve(artists);
}

const LastfmService = {
  login,
  logout,
  isLoggedIn,
  getUserInfo,
  getArtists
}

export default LastfmService;