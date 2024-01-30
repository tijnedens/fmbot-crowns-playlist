import { Login } from "@mui/icons-material";
import { Button, Typography, Stack, CircularProgress } from "@mui/material";
import SpotifyService from "../service/SpotifyService";
import { useEffect } from "react";

export default function SpotifyLogin({ setCompleted }) {
  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("spotifyToken");

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("spotifyToken", token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack direction="row" alignItems="center" gap={4}>
      <Button variant="contained" color="spotify" endIcon={<Login />} onClick={SpotifyService.login}>
        Connect to Spotify
      </Button>
      {(SpotifyService.isLoggedIn() &&
        <Typography><CircularProgress size={20} />Logging in</Typography>) ||
        <Typography>
          Currently not logged in
        </Typography>
      }
    </Stack>
  )
}