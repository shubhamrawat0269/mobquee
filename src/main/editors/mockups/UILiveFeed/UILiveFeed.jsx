import React from "react";
import "./UILiveFeedStyle.css";
import { Box, Typography } from "@mui/material";

export default function UILiveFeed(props) {
  const uiData = props.data;
  if (uiData["frame"]["x"] < 0) {
    uiData["frame"]["x"] = 0;
  }
  if (!uiData["actions"]) {
    uiData["actions"] = { OnValueChange: [] };
  }

  let ismultiline = uiData["variant"] === "multiline" ? true : false;

  //const uiVisibility = (uiData.hidden) ? 'hidden' : 'visible';
  var uiText = uiData.field ? uiData.field : "";

  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = uiData.cornerRadius ? parseInt(uiData.cornerRadius) : 0;

  const paddingTop = uiData.padding ? uiData.padding.top : 0;
  const paddingBottom = uiData.padding ? uiData.padding.bottom : 0;
  const paddingLeft = uiData.padding ? uiData.padding.left : 0;
  const paddingRight = uiData.padding ? uiData.padding.right : 0;

  //const fontFamily = (uiData.font) ? uiData.font.fontName : 'system';
  const fontSize = uiData.font ? uiData.font.fontSize : 0;
  const fontWeight = uiData.font.fontWeight ? "bold" : "normal";
  const fontStyle = uiData.font.fontStyle ? "italic" : "normal";
  const textColor = uiData.font ? getColorValue(uiData.font.textColor) : 0;
  const textAlign = uiData.font ? uiData.font.textAlignment : "center";
  const textShadow = uiData.textShadow
    ? "rgb(80, 78, 78) 3px 3px 5px"
    : "unset";

  let textDecoration = "none";
  if (uiData["underline"] && uiData["strikeout"])
    textDecoration = "line-through underline";
  else if (uiData["underline"]) textDecoration = "underline";
  else if (uiData["strikeout"]) textDecoration = "line-through";

  let textTransform = "none";
  if (uiData["autocapitalizationType"] === "Words")
    textTransform = "capitalize";
  else if (uiData["autocapitalizationType"] === "AllCharacters")
    textTransform = "uppercase";
  else if (uiData["autocapitalizationType"] === "Sentences") {
    textTransform = "none";
    let _text = "";

    uiText = uiText.toString().toLowerCase();
    let arrSentence = uiText.split(".");
    for (let i = 0; i < arrSentence.length; i++) {
      let sentence = arrSentence[i];
      _text +=
        sentence.charAt(0).toUpperCase() + sentence.substr(1).toLowerCase();
    }
    uiText = _text;
  }

  if (uiData["trim"]) {
    uiText.trim();
  }

  const textWidth =
    parseInt(uiData.frame.width) -
    (paddingLeft + paddingRight + 2 * borderWeight);
  const textHeight =
    parseInt(uiData.frame.height) -
    (paddingTop + paddingBottom + 2 * borderWeight);
  const verticalAlign = uiData.verticalAlignment
    ? uiData.verticalAlignment
    : "middle";
  let marginTop = 0;
  let itemAlign = "start";
  if (verticalAlign === "middle") {
    marginTop =
      (parseInt(uiData.frame.height) -
        (paddingTop + paddingBottom + 2 * borderWeight + fontSize)) /
      2;
    itemAlign = "center";
  } else if (verticalAlign === "bottom") {
    marginTop =
      parseInt(uiData.frame.height) -
      (paddingTop + paddingBottom + 2 * borderWeight + fontSize);
    itemAlign = "end";
  }

  return (
    <Box
      id="labelview"
      style={{
        borderWidth: `calc(${borderWeight}px)`,
        borderColor: borderColor,
        borderRadius: `calc(${borderRadius}px)`,
        paddingTop: `calc(${paddingTop}px)`,
        paddingBottom: `calc(${paddingBottom}px)`,
        paddingLeft: `calc(${paddingLeft}px)`,
        paddingRight: `calc(${paddingRight}px)`,
        backgroundColor: getColorValue(uiData.backgroundColor),
        textAlign: textAlign,
      }}
      className="ui-live-feed-section"
    >
      {!ismultiline && (
        <Typography
          noWrap={true}
          style={{
            minWidth: 2,
            minHeight: 2,
            width: textWidth,
            color: textColor,
            fontSize: `calc(${fontSize}px)`,
            fontWeight: fontWeight,
            fontStyle: fontStyle,
            textDecoration: textDecoration,
            textTransform: textTransform,
            textShadow: textShadow,
            verticalAlign: verticalAlign,
            lineHeight: parseInt(fontSize) + 1 + "px",
            textOverflow: "clip",
            marginTop: marginTop,
          }}
        >
          {uiText}
        </Typography>
      )}
      {ismultiline && (
        <div
          className="ui-live-feed-txt"
          style={{
            width: textWidth,
            height: textHeight,
            color: textColor,
            fontSize: `calc(${fontSize}px)`,
            fontWeight: fontWeight,
            fontStyle: fontStyle,
            textDecoration: textDecoration,
            textTransform: textTransform,
            alignItems: itemAlign,
            whiteSpace: "break-spaces",
          }}
          contentEditable="false"
          suppressContentEditableWarning
        >
          {uiText}
        </div>
      )}
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
