import React from "react";
import "./UILinkLabelStyle.css";
import { Box, Typography } from "@mui/material";

export default function UILinkLabel(props) {
  const uiData = props.data;

  const uiText = uiData.text ? uiData.text : "";
  //const uiVisibility = (uiData.hidden) ? 'hidden' : 'visible';
  //console.log(uiVisibility, ">>> LinkLabel >>>>", uiData);

  /* const containerX = uiData.frame.x;
  const containerY = uiData.frame.y;
  const containerWidth = uiData.frame.width;
  const containerHeight = uiData.frame.height; */

  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);

  const paddingTop = uiData.padding ? uiData.padding.top : 0;
  const paddingBottom = uiData.padding ? uiData.padding.bottom : 0;
  const paddingLeft = uiData.padding ? uiData.padding.left : 0;
  const paddingRight = uiData.padding ? uiData.padding.right : 0;

  const fontSize = uiData.font ? uiData.font.fontSize : 0;
  const textColor = uiData.font ? getColorValue(uiData.font.textColor) : 0;
  const textAlign = uiData.font ? uiData.font.textAlignment : "left";

  let textDecoration = "none";
  if (uiData["underline"] && uiData["strikeout"])
    textDecoration = "line-through underline";
  else if (uiData["underline"]) textDecoration = "underline";
  else if (uiData["strikeout"]) textDecoration = "line-through";

  const textWidth =
    parseInt(uiData.frame.width) -
    (paddingLeft + paddingRight + 2 * borderWeight);

  const verticalAlign = uiData.verticalAlignment
    ? uiData.verticalAlignment
    : "middle";
  let marginTop = 0;
  if (verticalAlign === "middle") {
    marginTop =
      (parseInt(uiData.frame.height) -
        (paddingTop + paddingBottom + 2 * borderWeight + fontSize)) /
      2;
  } else if (verticalAlign === "bottom") {
    marginTop =
      parseInt(uiData.frame.height) -
      (paddingTop + paddingBottom + 2 * borderWeight + fontSize);
  }

  return (
    <Box
      id="linklabel"
      style={{
        textAlign: textAlign,
        borderColor: borderColor,
        paddingTop: `calc(${paddingTop}px)`,
        borderWidth: `calc(${borderWeight}px)`,
        paddingLeft: `calc(${paddingLeft}px)`,
        paddingRight: `calc(${paddingRight}px)`,
        paddingBottom: `calc(${paddingBottom}px)`,
        backgroundColor: getColorValue(uiData.backgroundColor),
      }}
      className="ui-link-layout"
    >
      <Typography
        noWrap={true}
        style={{
          minWidth: 5,
          minHeight: 5,
          width: textWidth,
          color: textColor,
          fontSize: `calc(${fontSize}px)`,
          textDecoration: textDecoration,
          textTransform: "none",
          // display: "table-cell",
          verticalAlign: verticalAlign,
          lineHeight: parseInt(fontSize) + 1 + "px",
          textOverflow: "clip",
          marginTop: marginTop,
        }}
      >
        {uiText}
      </Typography>
    </Box>
  );
}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return (
    "rgba(" + _red + "," + _green + "," + _blue + "," + colorObj.alpha + ")"
  );
}
