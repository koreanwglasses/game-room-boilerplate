import React, { useState } from "react";
import { Alert, Box, Button, Collapse, Paper, TextField } from "@mui/material";
import { post } from "../lib/fetchers";
import Layout from "../components/layout";
import { useSocketIndex } from "../lib/use-socket";

const Index = () => {
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const socketIndex = useSocketIndex();

  return (
    <Layout centered>
      <Paper>
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
          <Button
            disabled={waiting}
            onClick={async () => {
              setWaiting(true);
              try {
                const room = await post("/api/game/room/new", { socketIndex });
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
            <Button disabled={waiting}>Join</Button>
          </Box>
        </Box>
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
