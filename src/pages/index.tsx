import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Collapse,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { post } from "../lib/fetchers";
import SwipeableViews from "react-swipeable-views";
import Layout from "../components/layout";

const Index = () => {
  const [playerName, setPlayerName] = useState<string>("");
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [index, setIndex] = useState(1);

  return (
    <Layout centered>
      <Paper>
        <SwipeableViews disabled animateHeight index={index}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 1,
              p: 1,
            }}
          >
            <TextField
              label="Player Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.currentTarget.value)}
              size="small"
            />
            <Button
              disabled={waiting}
              onClick={async () => {
                setIndex(1);
              }}
            >
              Next
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 1,
              p: 1,
            }}
          >
            <Typography>Hello, {playerName}</Typography>
            <Button
              onClick={async () => {
                setWaiting(true);
                try {
                  const room = await post("/api/game/room/new", { playerName });
                  window.location.href = `/room/${room._id}`;
                } catch (e) {
                  setError(e as Error);
                  setWaiting(false);
                }
              }}
            >
              Create a Room
            </Button>
            <Box sx={{ display: "flex" }}>
              <TextField label="Room ID" size="small" />
              <Button>Join</Button>
            </Box>
            <Button
              disabled={waiting}
              onClick={async () => {
                setIndex(0);
              }}
            >
              Back
            </Button>
          </Box>
        </SwipeableViews>
        <Collapse in={!!error}>
          <Alert severity="error" sx={{ m: 1 }}>
            {error?.name}: {error?.message};
          </Alert>
        </Collapse>
      </Paper>
    </Layout>
  );
};

export default Index;
