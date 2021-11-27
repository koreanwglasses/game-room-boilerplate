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
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Layout from "../../components/layout";
import { post } from "../../lib/fetchers";
import { useSocketIndex } from "../../lib/use-socket";
import { useSubscription } from "../../lib/use-subscription";
import type { Room } from "../../models/room";
import SwipeableViews from "react-swipeable-views";
import { InlineTextField } from "../../components/inline-text-field";

const RoomIndex = (props: {
  room?: Room;
  id: string;
  me?: { name: string };
  setError: (error: Error) => void;
}) => {
  const [waiting, setWaiting] = useState(false);
  const [playerName, setPlayerName] = useState(props.me?.name ?? "");
  const [rejection, setRejection] = useState<string>();

  useEffect(() => {
    if (!playerName && props.me?.name) setPlayerName(props.me?.name);
  }, [playerName, props.me?.name]);

  const socketIndex = useSocketIndex();

  const isEditing = !props.me?.name;
  const viewIndex = isEditing ? 0 : 1;

  const host = props.room?.players.find((player) => player.isHost);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
      }}
    >
      <TextField
        variant="standard"
        value={
          props.room?.name || (host?.name ? `${host.name}'s Room` : "New Room")
        }
        sx={{
          "& .MuiInputBase-input": {
            fontSize: 20,
            textAlign: "center",
          },
        }}
      />
      <pre>{JSON.stringify(props.room, null, 2)}</pre>
      <SwipeableViews disabled index={viewIndex} animateHeight>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            padding: 1,
          }}
        >
          <TextField
            disabled={waiting || !!rejection}
            label="Your Name"
            size="small"
            value={playerName}
            onChange={(e) => setPlayerName(e.currentTarget.value)}
          />
          <Button
            disabled={waiting || !socketIndex || !!rejection}
            onClick={async () => {
              setWaiting(true);
              try {
                // Update details if player is already in room.
                // Otherwise, join
                const route = props.me ? "me" : "join";

                const response = await post(
                  `/api/game/room/${props.id}/${route}`,
                  props.me
                    ? { socketIndex, me: { name: playerName } }
                    : {
                        socketIndex,
                        playerName,
                      }
                );
                if (response.status === "rejected") {
                  setRejection(response.reason);
                }
              } catch (e) {
                props.setError(e as Error);
              }
              setWaiting(false);
            }}
          >
            {props.me ? "Save" : "Join"}
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 1,
          }}
        >
          <Typography sx={{ display: "inline" }}>Welcome,</Typography>
          <InlineTextField
            value={playerName}
            disabled={waiting}
            onChange={(e) => setPlayerName(e.currentTarget.value)}
            inputProps={{
              async onBlur() {
                setWaiting(true);
                try {
                  await post(`/api/game/room/${props.id}/me`, {
                    socketIndex,
                    me: { name: playerName },
                  });
                } catch (e) {
                  props.setError(e as Error);
                }
                setWaiting(false);
              },
            }}
          />
        </Box>
      </SwipeableViews>
      <Collapse in={!!rejection}>
        <Alert severity="error">{rejection}</Alert>
      </Collapse>
    </Box>
  );
};

const RoomIndexLoader = () => {
  const router = useRouter();
  const { id } = router.query;

  const room = useSubscription<{ room: Room }>(
    id ? `/api/game/room/${id}` : null
  );

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
              gap: 1,
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
              room={room.data?.room}
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
