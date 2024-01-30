import { createTheme } from "@mui/material";

const theme = createTheme({
  status: {
    danger: '#e53e3e',
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#09f17d',
      darker: '#097d05',
    },
    neutral: {
      main: '#64748B',
      contrastText: '#fff',
    },
    spotify: {
      main: '#1DB954'
    },
    lastfm: {
      main: '#d51007'
    }
  },
  spacing: 4
});

export default theme;