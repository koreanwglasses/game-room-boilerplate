import { Alert, CircularProgress, Collapse, Paper, Typography } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import React from "react";
import Layout from "../../components/layout";
import { useSubscription } from "../../lib/use-subscription";
import type { Room } from "../../models/room";

const RoomIndex = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data, error } = useSubscription<Room>(`/api/game/room/${id}`)

  return <Layout centered>
    <Paper>
      <Typography>Loading room...</Typography>
      {!data && <CircularProgress />}
      <Collapse in={!!error}>
        <Alert severity="error">{error?.name}: {error?.message}</Alert>
      </Collapse>
    </Paper>
  </Layout>
};

export default RoomIndex;
