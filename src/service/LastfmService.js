import axios from "axios";

const API_KEY = "8138c0e35c9888e39ff5a62414fbf570";
const USER_ENDPOINT = `http://ws.audioscrobbler.com/2.0/?method=user.getinfo&api_key=${API_KEY}&format=json`;
const LIBRARY_ENDPOINT = `http://ws.audioscrobbler.com/2.0/?method=library.getartists&api_key=${API_KEY}&format=json`;
const TOP_TRACKS_ENDPOINT = `http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&api_key=${API_KEY}&format=json`;

function changeArrayLength(arr, newLength) {
  const newArr = [];
  const originalLength = arr.length;

  for (let i = 0; i < newLength; i++) {
    newArr[i] = arr[i % originalLength];
  }

  return newArr;
}

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

async function getArtists(username = null, minScrobbles = 25, maxScrobbles = 30, updateProgress) {
  const user = username ?? JSON.parse(localStorage.getItem("lastfm")).name;
  var artists = [];
  let page = 1;
  let nextPage = true;
  updateProgress(0, "Retrieving artists");
  while (nextPage) {
    let response = null;
    try {
      response = await axios.get(`${LIBRARY_ENDPOINT}&user=${encodeURIComponent(user)}&page=${page}`);
    } catch (error) {
      console.log(error);
      return Promise.reject();
    }

    const a = response.data.artists;
    nextPage = (a.artist[a.artist.length - 1].playcount >= minScrobbles && page < a["@attr"].totalPages);
    for (const artist of a.artist) {
      if (artist.playcount >= minScrobbles && artist.playcount < maxScrobbles) {
        artists.push({ name: artist.name, id: artist.mbid, count: maxScrobbles - artist.playcount, scrobbles: artist.playcount });
      }
    }

    page += 1;
  }
  return Promise.resolve(artists);
}

async function getTopTracks(artistIds, updateProgress) {
  let tracks = [];
  updateProgress(5, "Collecting top tracks");
  for (let [idx, artist] of artistIds.entries()) {
    let response;
    try {
      response = await axios.get(`${TOP_TRACKS_ENDPOINT}&mbid=${artist.id}&limit=${artist.count}`);
    } catch (error) {
      console.log(error);
      return Promise.reject();
    }
    if (response.data.error && response.data.error === 6) {
      try {
        response = await axios.get(`${TOP_TRACKS_ENDPOINT}&artist=${encodeURIComponent(artist.name)}&limit=${artist.count}&autocorrect=1`);
      } catch (error) {
        console.log(error);
        return Promise.reject();
      }
      if (response.data.error && response.data.error === 6) {
        console.log(artist.id);
      }
    }
    if (response.data.toptracks) {
      const ts = response.data.toptracks.track.map(val => ({ name: val.name, artist: val.artist.name }));
      tracks.push(...changeArrayLength(ts, artist.count));
      updateProgress(5 + Math.floor(30 * idx / artistIds.length), `Collecting top tracks (${tracks.length})`);
    }
  }
  return Promise.resolve(tracks);
}

const LastfmService = {
  login,
  logout,
  isLoggedIn,
  getUserInfo,
  getArtists,
  getTopTracks
}

export default LastfmService;