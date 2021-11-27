import {
  Alert,
  CircularProgress,
  Collapse,
  Fade,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
} from "@mui/material";
import { Error } from "mongoose";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Layout from "../../components/layout";
import { get, post } from "../../lib/fetchers";
import { useSocketIndex } from "../../lib/use-socket";
import { useSubscription } from "../../lib/use-subscription";
import type { Room } from "../../models/room";
import { useAsync } from "react-use";

const RoomIndex = (props: {
  room?: Room;
  id: string;
  me?: { name: string };
  setError: (error: Error) => void;
}) => {
  const [waiting, setWaiting] = useState(false);
  const [playerName, setPlayerName] = useState("");

  const socketIndex = useSocketIndex();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography>Success!</Typography>
      <pre>{JSON.stringify(props.room, null, 2)}</pre>
      {props.me?.name && <Typography>Welcome, {props.me.name}.</Typography>}
      {!props.me?.name && (
        <>
          <TextField
            label="Your Name"
            size="small"
            value={playerName}
            onChange={(e) => setPlayerName(e.currentTarget.value)}
          />
          <Button
            disabled={waiting || !socketIndex}
            onClick={async () => {
              setWaiting(true);
              try {
                const response = await post(`/api/game/room/${props.id}/join`, {
                  socketIndex,
                  playerName,
                });
                if (response.status === "success") {
                  /* rejoice */
                  console.log(response);
                }
                if (response.status === "rejected") {
                  /* sulk */
                  console.log(response);
                }
              } catch (e) {
                props.setError(e as Error);
              }
              setWaiting(false);
            }}
          >
            Join
          </Button>
        </>
      )}
    </Box>
  );
};

const RoomIndexLoader = () => {
  const router = useRouter();
  const { id } = router.query;

  const room = useSubscription<Room>(id ? `/api/game/room/${id}` : null);

  const me = useSubscription(id ? `/api/game/room/${id}/me` : null);

  const [error, setError] = useState<Error | null>(null);

  return (
    <Layout centered>
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 1,
          minHeight: 200,
          minWidth: 300,
        }}
      >
        <Fade in={!room.data && !room.error} unmountOnExit appear={false}>
          <Box
            sx={{
              position: "absolute",
              width: 1,
              height: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography>Loading room...</Typography>
            <CircularProgress />
          </Box>
        </Fade>
        <Fade in={!!room.data && !!me.data}>
          <Box>
            <RoomIndex
              id={id as string}
              room={room.data}
              setError={setError}
              me={me.data?.me}
            />
          </Box>
        </Fade>
        <Collapse in={!!(error || room.error)}>
          <Alert severity="error">
            {(error ?? room.error)?.name}: {(error ?? room.error)?.message}
          </Alert>
        </Collapse>
      </Paper>
    </Layout>
  );
};

export default RoomIndexLoader;
