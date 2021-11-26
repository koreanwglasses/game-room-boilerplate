import {
  Alert,
  CircularProgress,
  Collapse,
  Fade,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { useRouter } from "next/router";
import React from "react";
import Layout from "../../components/layout";
import { useSubscription } from "../../lib/use-subscription";
import type { Room } from "../../models/room";

const RoomIndex = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data, error } = useSubscription<Room>(id && `/api/game/room/${id}`);

  return (
    <Layout centered>
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 1,
        }}
      >
        <Fade in={!data && !error} unmountOnExit>
          <Box
            sx={{
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
        <Fade in={!!data} unmountOnExit>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography>Success!</Typography>
            <code>{JSON.stringify(data, null, 2)}</code>
          </Box>
        </Fade>
        <Collapse in={!!error}>
          <Alert severity="error">
            {error?.name}: {error?.message}
          </Alert>
        </Collapse>
      </Paper>
    </Layout>
  );
};

export default RoomIndex;
