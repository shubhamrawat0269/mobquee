import React from "react";
import "./UIToggleButtonStyle.css";
import { Box, Button, Typography } from "@mui/material";

export default function UIToggleButton(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;

  const containerWidth = uiData.frame.width;
  const containerHeight = uiData.frame.height;

  const titleOFF = uiData.normalTitle;
  const titleON = uiData.selectedTitle;

  const imageOFF = getImagePath(
    uiData.normalImage,
    appConfig.apiURL,
    appConfig.projectid
  );
  const imageON = getImagePath(
    uiData.selectedImage,
    appConfig.apiURL,
    appConfig.projectid
  );

  let uiTitle;
  let uiImage;
  let onoffcolor;

  const value = uiData.on;
  if (value) {
    uiTitle = titleON;
    uiImage = imageON;
    onoffcolor = "rgba(0,0,255,1)";
  } else {
    uiTitle = titleOFF;
    uiImage = imageOFF;
    onoffcolor = "rgba(99,99,99,1)";
  }
  //console.log(imageOFF, imageON, "**** ToggleButton ****", uiImage);

  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);

  const paddingTop = uiData.padding ? uiData.padding.top : 0;
  const paddingBottom = uiData.padding ? uiData.padding.bottom : 0;
  const paddingLeft = uiData.padding ? uiData.padding.left : 0;
  const paddingRight = uiData.padding ? uiData.padding.right : 0;

  const textWidth =
    containerWidth - (paddingLeft + paddingRight + 2 * borderWeight);
  const textHeight =
    containerHeight - (paddingTop + paddingBottom + 2 * borderWeight);

  //const fontFamily = (uiData.normalFont) ? uiData.normalFont.fontName : 'system';
  const fontSize = uiData.normalFont ? uiData.normalFont.fontSize : 0;
  const textColor = uiData.normalFont
    ? getColorValue(uiData.normalFont.textColor)
    : 0;
  const textAlign = uiData.normalFont
    ? uiData.normalFont.textAlignment
    : "left";
  const textTransform = "none";

  let textDecoration = "none";
  if (uiData["underline"] && uiData["strikeout"])
    textDecoration = "line-through underline";
  else if (uiData["underline"]) textDecoration = "underline";
  else if (uiData["strikeout"]) textDecoration = "line-through";

  const verticalAlign = uiData.verticalAlignment
    ? uiData.verticalAlignment
    : "middle";

  return (
    <div id="togglebutton" className="ui-toggle-btn-section">
      {uiImage.length === 0 && (
        <button
          id="toggle"
          style={{
            paddingTop: `calc(${paddingTop}px)`,
            paddingBottom: `calc(${paddingBottom}px)`,
            paddingLeft: `calc(${paddingLeft}px)`,
            paddingRight: `calc(${paddingRight}px)`,
            borderWidth: `calc(${borderWeight}px)`,
            borderColor: borderColor,
            textAlign: textAlign,
            width: `calc(${props.containerWidth}px)`,
          }}
          className="toggle-btn-layout"
          disableRipple
          variant="contained"
          color="default"
          component="span"
        >
          <Box
            style={{ backgroundColor: onoffcolor }}
            className="toggle-btn-box-on-off"
          ></Box>
          <Typography
            style={{
              width: `calc(${props.containerWidth}px)`,
              // width: `calc(${textWidth}px)`,
              height: `calc(${textHeight}px)`,
              lineHeight: "1rem",
              color: textColor,
              fontSize: `calc(${fontSize}px)`,
              textTransform: textTransform,
              textDecoration: textDecoration,
              display: "table-cell",
              verticalAlign: verticalAlign,
            }}
          >
            {uiTitle}
          </Typography>
        </button>
      )}
      {uiImage && (
        <Box className="toggle-btn-bg">
          <span
            style={{
              width: `calc(100% - ${paddingTop + paddingBottom}px)`,
              height: `calc(100% - ${paddingRight + paddingLeft}px)`,
              overflow: "hidden",
              display: "table",
              textAlign: textAlign,
            }}
          >
            <Typography
              style={{
                width: `calc(${textWidth}px)`,
                height: `calc(${textHeight}px)`,
                lineHeight: "1rem",
                color: textColor,
                fontSize: `calc(${fontSize}px)`,
                textTransform: textTransform,
                textDecoration: textDecoration,
                display: "table-cell",
                verticalAlign: verticalAlign,
              }}
            >
              {uiTitle}
            </Typography>
          </span>
        </Box>
      )}
    </div>
  );
}

function getImagePath(imageObj, _url, _pid) {
  if (imageObj["srcLocation"] === "bundle") {
    if (imageObj["filename"] !== "")
      return (
        _url +
        "download/image/" +
        _pid +
        "/" +
        imageObj["filename"] +
        "." +
        imageObj["fileext"] +
        "?ts=" +
        new Date().getTime()
      );
    else return "";
  } else if (imageObj["srcLocation"] === "url") {
    if (imageObj["url"] !== "") return imageObj["url"];
    else return "";
  } else if (imageObj["srcLocation"] === "remoteFile") {
    if (imageObj["filename"] !== "")
      return imageObj["url"] + imageObj["filename"];
    else return "";
  }

  return "";
}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return (
    "rgba(" + _red + "," + _green + "," + _blue + "," + colorObj.alpha + ")"
  );
}
