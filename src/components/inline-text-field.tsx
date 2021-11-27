import { Box, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";


export const InlineTextField = ({
  value, onChange,
}: {
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => unknown;
}) => {
  const [width, setWidth] = useState(0);

  const textField = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (textField.current && textField.current.clientWidth !== width)
      setWidth(textField.current.clientWidth);
  });

  return (
    <Box
      sx={{
        display: "inline",
        position: "relative",
        top: 1,
      }}
      style={{ width: width + 10 }}
    >
      <Box
        ref={textField}
        sx={{
          position: "absolute",
          width: "fit-content",
          whiteSpace: "nowrap",
          opacity: 0,
          pointerEvents: "none",
          fontSize: "inherit",
        }}
      >
        {value}
      </Box>
      <TextField
        variant="standard"
        value={value}
        onChange={onChange}
        sx={{
          "& .MuiInputBase-input": {
            fontSize: "inherit",
            ml: 0.5,
          },
        }}
        fullWidth />
    </Box>
  );
};
