import "../styles/globals.css";
import type { AppProps } from "next/app";
import { io, Socket } from "socket.io-client";
import { useEffect, useState, createContext } from "react";
import { post } from "../lib/fetchers";
import { createTheme, ThemeProvider } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0097a7",
    },
    secondary: {
      main: "#e91e63",
    },
  },
});

export const SocketIOContext = createContext<{
  socket?: Socket;
  socketIndex?: number;
}>({});

function MyApp({ Component, pageProps }: AppProps) {
  // We only want one socket per client instance, so we
  // provide it at the root component level.

  const [context, setContext] = useState<{
    socket?: Socket;
    socketIndex?: number;
  }>({});

  useEffect(() => {
    const socket = io({ path: "/api/socket/io" });
    setContext({ socket });

    socket.on("connect", async () => {
      const { socketIndex } = await post("/api/socket/session/link", {
        socketId: socket.id,
      });
      setContext({ socket, socketIndex });
    });

    socket.on("disconnect", () => {
      setContext({});
    });

    return () => {
      setContext({});
      socket.disconnect();
    };
  }, []);

  return (
    <SocketIOContext.Provider value={context}>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </SocketIOContext.Provider>
  );
}

export default MyApp;
