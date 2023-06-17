import { Box, Button, LinearProgress, MenuItem, TextField, Typography } from "@mui/material"
import { useRef, useState } from "react";
import SpotifyService from "../service/SpotifyService";

export default function CreatePlaylist() {
  const minInput = useRef();
  const maxInput = useRef();
  const publicInput = useRef();
  const nameInput = useRef();
  const [errorBounds, setErrorBounds] = useState(null);
  const [progress, setProgress] = useState(null);
  const [progressMsg, setProgressMsg] = useState(null);

  const handleProgress = (percentage, message) => {
    setProgress(percentage);
    setProgressMsg(message);
  }

  const handleGenerate = (e) => {
    // e.preventDefault();
    const min = parseInt(minInput.current.value)
    const max = parseInt(maxInput.current.value);
    if (!min || !max) {
      return;
    }
    if (min < 2 || max < 1) {
      return;
    }
    if (min && max <= min) {
      setErrorBounds(`>= ${maxInput.current.value}`);
      return;
    }
    SpotifyService.createPlaylist(nameInput.current.value, (publicInput.current.value === "public"), min, max, handleProgress);
  }

  return (
    <Box sx={{ width: 300, display: "inline" }}>
      <form onSubmit={handleGenerate}>
        <Box>
          <Typography sx={{ display: "inline-block" }}>After listening to the generated</Typography>
          <TextField required size="small" select variant="standard" sx={{ marginLeft: "10px", marginRight: "10px", display: "inline-block" }} inputProps={{ sx: { textAlign: "center" }, min: 1 }} InputProps={{ sx: { width: "80px" } }} defaultValue="private" inputRef={publicInput}>
            <MenuItem key="public" value="public">public</MenuItem>
            <MenuItem key="private" value="private">private</MenuItem>
          </TextField>
          <Typography sx={{ display: "inline-block" }}>playlist called</Typography>
          <TextField required size="small" variant="standard" sx={{ marginLeft: "5px", marginRight: "5px", display: "inline-block" }} inputProps={{ sx: { textAlign: "center", display: "inline-grid" }, min: 1 }} InputProps={{ sx: { width: "300px", } }} inputRef={nameInput} />
          <Typography sx={{ display: "inline-block" }}>,</Typography>
        </Box>

        <Typography sx={{ display: "inline-block" }}>
          I want to have reached
        </Typography>
        <TextField required size="small" type="number" variant="standard" sx={{ width: "80px", marginLeft: "5px", marginRight: "5px", display: "inline-block" }} inputProps={{ sx: { textAlign: "center" }, min: 1 }} inputRef={maxInput} />
        <Typography sx={{ display: "inline-block" }}>scrobbles for artists that I had scrobbled at least</Typography>
        <TextField required size="small" type="number" variant="standard" sx={{ width: "80px", marginLeft: "5px", marginRight: "5px", display: "inline-block" }} inputProps={{ sx: { textAlign: "center", min: 1 } }} inputRef={minInput} error={!!errorBounds} helperText={errorBounds} />
        <Typography sx={{ display: "inline-block" }}>times before.</Typography>
        <Button type="submit">Generate playlist</Button>
      </form>
      {progress &&
        <Box>
          <Typography>{progressMsg}</Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      }
    </Box >
  )
}