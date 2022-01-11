import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SnackbarProvider } from "notistack";
import { CssBaseline } from "@mui/material";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <SnackbarProvider maxSnack={3}>
      <CssBaseline />
      <Component {...pageProps} />
    </SnackbarProvider>
  );
};

export default MyApp;
