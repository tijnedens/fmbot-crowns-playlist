import { Login } from "@mui/icons-material";
import { Button, Typography, Stack, CircularProgress, TextField } from "@mui/material";
import LastfmService from "../service/LastfmService";
import { useRef } from "react";

export default function LastfmLogin({ setCompleted }) {
  const nameInput = useRef();

  const handleLogin = () => {
    if (nameInput.current && nameInput.current.value !== "") {
      console.log(nameInput.current);
      LastfmService.login(nameInput.current.value).then(succes => {
        setCompleted();
      }, error => {
        return;
      });
    }
  };

  return (
    <Stack direction="row" alignItems="center" gap={4}>
      <TextField label="Last.fm username" size="small" inputRef={nameInput} />
      <Button variant="contained" color="lastfm" endIcon={<Login />} onClick={handleLogin}>
        Connect
      </Button>
      {(LastfmService.isLoggedIn() &&
        <Typography><CircularProgress size={20} />Logging in</Typography>) ||
        <Typography>
          Currently not logged in
        </Typography>
      }
    </Stack>
  )
}