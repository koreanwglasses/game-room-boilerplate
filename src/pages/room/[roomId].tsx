import { useRouter } from "next/dist/client/router";
import React from "react";

const Room = () => {
  const router = useRouter();
  const { roomId } = router.query;
};

export default Room;
