import React from "react";
import { Box, Typography, Paper } from "@mui/material";

export default function UIDatePicker(props) {
  const uiData = props.data;
  const containerWidth = uiData.frame.width;
  const containerHeight = uiData.frame.height;

  let dataArray = uiData.dataarray;

  return (
    <div>
      <Paper
        className="ui-picker-not-supported"
        style={{ height: `calc(${containerHeight}px)`, width: containerWidth }}
        elevation={2}
      >
        <Typography>Picker UI not supported</Typography>
      </Paper>
      <Box
        id="picker"
        className="ui-picker-layout"
        style={{
          height: `calc(${containerHeight}px)`,
          width: containerWidth,
        }}
      >
        {dataArray.map((columndata, column) => (
          <Box key={column} className="ui-picker-column">
            {columndata.itemarray.map((itemdata, index) => (
              <Typography key={index} className="ui-label">
                {itemdata["text"]}
              </Typography>
            ))}
          </Box>
        ))}
      </Box>
    </div>
  );
}
