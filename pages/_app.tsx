import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SnackbarProvider } from "notistack";
import { CssBaseline } from "@mui/material";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <SnackbarProvider maxSnack={3}>
        <CssBaseline />
        <Component {...pageProps} />
      </SnackbarProvider>
    </LocalizationProvider>
  );
};

export default MyApp;
