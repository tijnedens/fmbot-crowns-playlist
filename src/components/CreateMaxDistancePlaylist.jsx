import { Box, Button, LinearProgress, MenuItem, TextField, Typography } from "@mui/material"
import { useRef, useState } from "react";
import SpotifyService from "../service/SpotifyService";

export default function CreateMaxDistancePlaylist() {
  const otherUserInput = useRef();
  const maxInput = useRef();
  const publicInput = useRef();
  const nameInput = useRef();
  const [errorBounds, setErrorBounds] = useState(null);
  const [progress, setProgress] = useState(null);
  const [progressMsg, setProgressMsg] = useState("Starting playlist creation...");
  const [resultState, setResultState] = useState(0);

  const handleProgress = (percentage, message) => {
    setProgress(percentage);
    setProgressMsg(message);
  }

  const handleGenerate = (e) => {
    e.preventDefault();
    const max = parseInt(maxInput.current.value);
    setResultState(0);
    SpotifyService.createMaxDistanceScrobblesPlaylist(nameInput.current.value, otherUserInput.current.value, (publicInput.current.value === "public"), max, handleProgress).catch((error) => {
      switch (error) {
        case "NO_RESULTS":
          setResultState(-1);
          return Promise.resolve();
        default:
          setResultState(0);
          return Promise.resolve();
      }
    });
    return false;
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
          I want to have gotten more scrobbles than user
        </Typography>
        <TextField required size="small" variant="standard" sx={{ marginLeft: "5px", marginRight: "5px", display: "inline-block" }} inputProps={{ sx: { textAlign: "center", display: "inline-grid" }, min: 1 }} InputProps={{ sx: { width: "300px", } }} inputRef={otherUserInput} />
        <Typography sx={{ display: "inline-block" }}>for artists that I had previously scrobbled at least</Typography>
        <TextField required size="small" type="number" variant="standard" sx={{ width: "80px", marginLeft: "5px", marginRight: "5px", display: "inline-block" }} inputProps={{ sx: { textAlign: "center", min: 1 } }} inputRef={maxInput} error={!!errorBounds} helperText={errorBounds} />
        <Typography sx={{ display: "inline-block" }}>times fewer.</Typography>
        <Button type="submit">Generate playlist</Button>
      </form>
      {progress !== null &&
        <Box>
          <Typography>{progressMsg}</Typography>
          <LinearProgress variant={progress > 0 ? "determinate" : "indeterminate"} value={progress} sx={{ ".MuiLinearProgress-barColorPrimary": {backgroundColor: (resultState === -1) ? '#ff4444' : 'primary.main'  }}} />
        </Box>
      }
    </Box >
  )
}