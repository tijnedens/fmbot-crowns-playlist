import axios from "axios";
import LastfmService from "./LastfmService";

const CLIENT_ID = "db2520a30b4349669473ea28a1b6a6e8";
const REDIRECT_URI = "http://localhost:3000";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SEARCH_ENDPOINT = "https://api.spotify.com/v1/search";
const RESPONSE_TYPE = "token";

function changeArrayLength(arr, newLength) {
  const newArr = [];
  const originalLength = arr.length;

  for (let i = 0; i < newLength; i++) {
    newArr[i] = arr[i % originalLength];
  }

  return newArr;
}

function login() {
  window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=playlist-modify-private`;
}

function logout() {
  localStorage.removeItem("spotifyToken");
}

function isLoggedIn() {
  return !!localStorage.getItem("spotifyToken");
}

function getUserInfo() {
  const authToken = localStorage.getItem("spotifyToken");
  return new Promise((resolve, reject) => {
    axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: "Bearer " + authToken
      }
    }).then((response) => {
      localStorage.setItem("spotifyUserId", response.data.id);
      resolve(response.data);
    }, (error) => {
      logout();
      reject();
    });
  });
}

async function getSpotifyArtistIds(artistNames, updateProgress) {
  const authToken = localStorage.getItem("spotifyToken");
  let artistIds = [];
  updateProgress(20, "Retrieving Spotify artist ids");
  for (const artist of artistNames) {
    let a;
    try {
      a = await axios.get(`${SEARCH_ENDPOINT}?q=artist:${artist.name}&type=artist&limit=1`, {
        headers: {
          Authorization: "Bearer " + authToken
        }
      });
    } catch (error) {
      console.log(error);
      return Promise.reject();
    }
    artistIds.push({ id: a.data.artists.items[0].id, count: artist.count });
    updateProgress(20, `Retrieving Spotify artist ids (${artistIds.length})`);
  }
  return Promise.resolve(artistIds);
}

async function getTopTracks(artistIds, updateProgress) {
  const authToken = localStorage.getItem("spotifyToken");
  let tracks = [];
  updateProgress(40, "Collecting top tracks");
  for (const artist of artistIds) {
    let response;
    try {
      response = await axios.get(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=NL`, {
        headers: {
          Authorization: "Bearer " + authToken
        }
      });
    } catch (error) {
      console.log(error);
      return Promise.reject();
    }
    const ts = response.data.tracks.map(val => val.uri);
    tracks.push(...changeArrayLength(ts, artist.count));
    updateProgress(40, `Collecting top tracks (${tracks.length})`);
  }
  return Promise.resolve(tracks);
}

async function createPlaylist(name, isPublic, minScrobbles = 25, maxScrobbles = 30, updateProgress) {
  if (!name) {
    return;
  }
  let artistNames = await LastfmService.getArtists(minScrobbles, maxScrobbles, updateProgress);
  let artistIds = await getSpotifyArtistIds(artistNames, updateProgress);
  let tracks = await getTopTracks(artistIds, updateProgress);

  const userId = localStorage.getItem("spotifyUserId");
  const authToken = localStorage.getItem("spotifyToken");

  updateProgress(60, "Creating playlist on Spotify");
  const plResponse = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    "name": name,
    "description": `Generated by lastfm-crowns-playlist tool with goal = ${maxScrobbles} and minimum = ${minScrobbles}`,
    "public": isPublic
  },
    {
      headers: {
        Authorization: "Bearer " + authToken
      }
    });

  const playlistId = plResponse.data.id;
  updateProgress(80, "Adding tracks to Spotify");

  for (let i = 0; i < Math.ceil(tracks.length / 100); i++) {
    updateProgress(80, `Adding tracks to Spotify (${Math.min(i * 100, tracks.length)}`);
    try {
      await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        uris: tracks.slice(i * 100, (i + 1) * 100)
      },
        {
          headers: {
            Authorization: "Bearer " + authToken
          }
        });
    } catch (error) {
      console.log(error);
      return Promise.reject("ERROR");
    }
  }
  updateProgress(100, "Playlist created!");
  console.log("DONE");
  return Promise.resolve("DONE");
}

const SpotifyService = {
  login,
  logout,
  isLoggedIn,
  getUserInfo,
  createPlaylist
}

export default SpotifyService;