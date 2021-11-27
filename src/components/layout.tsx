import { Box } from "@mui/material";
import React from "react";

const CenteredLayout = ({ children }: React.PropsWithChildren<{}>) => (
  <Box
    sx={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      bgcolor: "background.default"
    }}
  >
    {children}
  </Box>
);

const Layout = ({
  children,
  centered,
}: React.PropsWithChildren<{ centered: true }>) => {
  return <CenteredLayout>{children}</CenteredLayout>;
};

export default Layout;
