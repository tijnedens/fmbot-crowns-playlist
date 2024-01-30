import { Avatar, Box, Chip, Link, Stack, Typography, styled } from "@mui/material";
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import SpotifyLogin from "./SpotifyLogin";
import { useEffect, useState } from "react";
import { CheckCircle, ExpandMore } from "@mui/icons-material";
import SpotifyService from "../service/SpotifyService";
import LastfmService from "../service/LastfmService";
import LastfmLogin from "./LastfmLogin";
import CreateMinMaxPlaylist from "./CreateMinMaxPlaylist";
import CreateMaxDistancePlaylist from "./CreateMaxDistancePlaylist";

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={1} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ExpandMore />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(180deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

export default function Steps() {
  const [completed, setCompleted] = useState([false, false, false]);

  const [spotifyUser, setSpotifyUser] = useState(null);
  const [lastfmUser, setLastfmUser] = useState(null);

  const handleComplete = (idx) => {
    setCompleted(c => c.map((v, i) => (i === idx) ? true : v));
    if (idx === 1) {
      updateLastfmUserInfo();
    }
  };

  const handleSpotifyLogout = () => {
    SpotifyService.logout();
    updateSpotifyUserInfo();
    setCompleted(c => c.map((v, i) => (i === 0) ? false : v));
  };

  const handleLastfmLogout = () => {
    LastfmService.logout();
    updateLastfmUserInfo();
    setCompleted(c => c.map((v, i) => (i === 1) ? false : v));
  };

  const updateSpotifyUserInfo = () => {
    if (SpotifyService.isLoggedIn()) {
      SpotifyService.getUserInfo().then(response => {
        setSpotifyUser(response);
      });
    } else {
      setSpotifyUser(null);
    }
  }

  const updateLastfmUserInfo = () => {
    if (LastfmService.isLoggedIn()) {
      LastfmService.getUserInfo().then(response => {
        setLastfmUser(response);
      });
    } else {
      setLastfmUser(null);
    }
  }

  useEffect(() => {
    updateSpotifyUserInfo();
    updateLastfmUserInfo();
  }, []);

  useEffect(() => {
    if (lastfmUser) {
      setCompleted(c => c.map((v, i) => (i === 1) ? true : v));
    }
  }, [lastfmUser]);

  useEffect(() => {
    if (spotifyUser) {
      setCompleted(c => c.map((v, i) => (i === 0) ? true : v));
    }
  }, [spotifyUser]);

  return (
    <Box>
      <Accordion expanded={!completed[0]}>
        <AccordionSummary expandIcon={completed[0] ? <CheckCircle /> : <ExpandMore />}>
          {(!spotifyUser &&
            <Typography>Log in with Spotify</Typography>) ||
            <Stack direction="row" alignItems="center" useFlexGap sx={{ width: "100%" }} gap={2}>
              <Typography>Logged in with Spotify as</Typography>
              <Chip label={spotifyUser.display_name} avatar={<Avatar src={spotifyUser.images[0].url} />} />
              <Link onClick={handleSpotifyLogout} sx={{ marginLeft: "auto", marginRight: "10px" }}>Log out</Link>
            </Stack>
          }
        </AccordionSummary>
        <AccordionDetails>
          <SpotifyLogin setCompleted={() => { handleComplete(0); }} />
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={!completed[1]}>
        <AccordionSummary expandIcon={completed[1] ? <CheckCircle /> : <ExpandMore />}>
          {(!lastfmUser &&
            <Typography>Log in with Last.fm</Typography>) ||
            <Stack direction="row" alignItems="center" useFlexGap sx={{ width: "100%" }} gap={2}>
              <Typography>Logged in with last.fm as</Typography>
              <Chip label={lastfmUser.name} avatar={<Avatar src={lastfmUser.image[0]["#text"]} />} />
              <Link onClick={handleLastfmLogout} sx={{ marginLeft: "auto", marginRight: "10px" }}>Log out</Link>
            </Stack>
          }
        </AccordionSummary>
        <AccordionDetails>
          <LastfmLogin setCompleted={() => { handleComplete(1); }} />
        </AccordionDetails>
      </Accordion>

      <Accordion disabled={!(completed[0] && completed[1])} expanded={completed[0] && completed[1]}>
        <AccordionSummary>
          <Typography>Create min-max playlist</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <CreateMinMaxPlaylist />
        </AccordionDetails>
      </Accordion>

      <Accordion disabled={!(completed[0] && completed[1])} expanded={completed[0] && completed[1]}>
        <AccordionSummary>
          <Typography>Create scrobble difference playlist</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <CreateMaxDistancePlaylist />
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}