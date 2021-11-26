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

const Index = () => {
  const [displayName, setDisplayName] = useState<string>("");
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [index, setIndex] = useState(0);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Paper>
        <SwipeableViews disabled animateHeight index={index}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 1,
              p: 1
            }}
          >
            <TextField
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.currentTarget.value)}
            />
            <Button
              disabled={waiting}
              onClick={async () => {
                setWaiting(true);
                try {
                  await post("/api/game/player/new", { displayName });
                  setError(null);
                  setIndex(1);
                } catch (e) {
                  setError(e as Error);
                }
                setWaiting(false);
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
              p: 1
            }}
          >
            <Typography>Hello, {displayName}</Typography>
          </Box>
        </SwipeableViews>
        <Collapse in={!!error}>
          <Alert severity="error">
            {error?.name}: {error?.message};
          </Alert>
        </Collapse>
      </Paper>
    </Box>
  );
};

export default Index;
