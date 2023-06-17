import { Paper, ThemeProvider } from '@mui/material';
import './App.css';
import Container from '@mui/material/Container';
import theme from './config/theme';
import Steps from './components/Steps';

export default function App() {
  return (
    // <Container maxWidth="sm">
    //   <Stepper></Stepper>
    // </Container>
    <ThemeProvider theme={theme}>
      <Paper square sx={{ height: "100vh" }}>
        <Container maxWidth="md">
          <Paper elevation={2} sx={{ p: 4 }}>
            <Steps />
          </Paper>
        </Container>
      </Paper>
    </ThemeProvider>

  );
}
