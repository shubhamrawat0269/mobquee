import React from "react";
import "./UIIconButtonStyle.css";
import { Box, Typography } from "@mui/material";

export default function UIIConButton(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;

  let uiTitle = uiData.title ? uiData.title : "";

  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = uiData.cornerRadius ? uiData.cornerRadius : 0;

  const paddingTop = uiData.padding ? uiData.padding.top : 0;
  const paddingBottom = uiData.padding ? uiData.padding.bottom : 0;
  const paddingLeft = uiData.padding ? uiData.padding.left : 0;
  const paddingRight = uiData.padding ? uiData.padding.right : 0;

  const textHeight =
    uiData.frame.height - (paddingTop + paddingBottom + 2 * borderWeight);

  //const fontFamily = (uiData.normalFont) ? uiData.normalFont.fontName : 'system';
  const fontSize = uiData.normalFont ? uiData.normalFont.fontSize : 0;
  const fontWeight = uiData.normalFont.fontWeight ? "bold" : "normal";
  const fontStyle = uiData.normalFont.fontStyle ? "italic" : "normal";
  const textColor = uiData.normalFont
    ? getColorValue(uiData.normalFont.textColor)
    : 0;
  const textAlign = uiData.normalFont
    ? uiData.normalFont.textAlignment
    : "left";
  const textTransform = "none";

  let wordWrap = "normal";
  let whiteSpace = "pre";
  if (uiData["normalFont"]["lineBreakMode"] === "WordWrap") {
    wordWrap = "break-word";
    whiteSpace = "pre-wrap";
  }

  let textDecoration = "none";
  if (uiData["underline"] && uiData["strikeout"])
    textDecoration = "line-through underline";
  else if (uiData["underline"]) textDecoration = "underline";
  else if (uiData["strikeout"]) textDecoration = "line-through";

  const verticalAlign = uiData.verticalAlignment
    ? uiData.verticalAlignment
    : "middle";

  const iconImage = getImagePath(
    uiData.iconImage,
    appConfig.apiURL,
    appConfig.projectid
  );
  const iconSelected = getImagePath(
    uiData.iconSelectedImage,
    appConfig.apiURL,
    appConfig.projectid
  );
  let bgImg = "";
  if (iconImage !== "") {
    bgImg = iconImage;
  } else {
    if (iconSelected !== "") {
      bgImg = iconSelected;
    }
  }

  let iconPosition = uiData["iconPosition"];
  let iconDisplay =
    iconPosition === "start" || iconPosition === "end" ? "side" : "bar";
  let iconSize = 32;
  if (uiData["iconSize"]) {
    switch (uiData["iconSize"]) {
      case "small":
        iconSize = 24;
        break;
      case "medium":
        iconSize = 32;
        break;
      case "large":
        iconSize = 48;
        break;
      case "xlarge":
        iconSize = 64;
        break;
      default:
        iconSize = 32;
        break;
    }
  }
  const iconPadtop = parseInt((textHeight - iconSize) / 2);
  const barTextheight = uiData.frame.height - (iconSize + 4);

  return (
    <div id="iconbutton" className="ui-iconbtn">
      {iconDisplay === "side" && (
        <Box
          className="ui-icon-btn-layout"
          style={{
            textAlign: textAlign,
            borderColor: borderColor,
            borderWidth: `calc(${borderWeight}px)`,
            borderRadius: `calc(${borderRadius}px)`,
            paddingBottom: `calc(${paddingBottom}px)`,
            paddingRight: `calc(${paddingRight}px)`,
            paddingTop: `calc(${paddingTop}px)`,
            paddingLeft: `calc(${paddingLeft}px)`,
            backgroundColor: getColorValue(uiData.backgroundColor),
          }}
        >
          {iconPosition === "start" && (
            <img
              src={bgImg}
              alt="icon"
              style={{
                height: `calc(${iconSize}px)`,
                maxWidth: `calc(${iconSize}px)`,
                maxHeight: `calc(${iconSize}px)`,
                paddingTop: iconPadtop,
                paddingLeft: `calc(${paddingLeft}px)`,
                paddingRight: `calc(${paddingRight}px)`,
              }}
            />
          )}
          <Typography
            noWrap={true}
            style={{
              width: "100%",
              height: `calc(${textHeight}px)`,
              color: textColor,
              fontSize: `calc(${fontSize}px)`,
              fontWeight: fontWeight,
              fontStyle: fontStyle,
              textDecoration: textDecoration,
              textTransform: textTransform,
              wordWrap: wordWrap,
              whiteSpace: whiteSpace,
              display: "table-cell",
              verticalAlign: verticalAlign,
            }}
          >
            {uiTitle}
          </Typography>
          {iconPosition === "end" && (
            <img
              src={bgImg}
              alt="icon"
              style={{
                width: "100%",
                height: `calc(${textHeight}px)`,
                color: textColor,
                fontSize: `calc(${fontSize}px)`,
                fontWeight: fontWeight,
                fontStyle: fontStyle,
                textDecoration: textDecoration,
                textTransform: textTransform,
                wordWrap: wordWrap,
                whiteSpace: whiteSpace,
                display: "table-cell",
                verticalAlign: verticalAlign,
              }}
            />
          )}
        </Box>
      )}
      {iconDisplay !== "side" && (
        <Box className="ui-icon-btn-layout">
          {iconPosition === "top" && (
            <img
              src={bgImg}
              alt="icon"
              style={{
                height: `calc(${iconSize}px)`,
                maxWidth: `calc(${iconSize}px)`,
                maxHeight: `calc(${iconSize}px)`,
              }}
              className="bar-btn-icon"
            />
          )}
          <Typography
            noWrap={true}
            style={{
              width: "100%",
              height: `calc(${barTextheight}px)`,
              lineHeight: `calc(${barTextheight}px)`,
              color: textColor,
              fontSize: `calc(${fontSize}px)`,
              fontWeight: fontWeight,
              fontStyle: fontStyle,
              textDecoration: textDecoration,
              textTransform: textTransform,
              wordWrap: wordWrap,
              whiteSpace: whiteSpace,
            }}
          >
            {uiTitle}
          </Typography>
          {iconPosition === "bottom" && (
            <img
              src={bgImg}
              alt="icon"
              style={{
                height: `calc(${iconSize}px)`,
                maxWidth: `calc(${iconSize}px)`,
                maxHeight: `calc(${iconSize}px)`,
              }}
              className="bar-btn-icon"
            />
          )}
        </Box>
      )}
    </div>
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

function getImagePath(imageObj, _url, _pid) {
  //console.log(imageObj, ".. getImagePath ..", _url);

  if (imageObj["srcLocation"] === "bundle") {
    if (imageObj["filename"] !== "" && imageObj["fileext"] !== "")
      return (
        _url +
        "download/image/" +
        _pid +
        "/" +
        imageObj["filename"] +
        "." +
        imageObj["fileext"]
      );
    // + '?ts=' + new Date().getTime();
    else {
      if (imageObj["filename"] !== "" && imageObj["fileext"] !== "")
        return _url + "download/image/" + _pid + "/" + imageObj["filename"];
    }
  } else if (imageObj["srcLocation"] === "url") return imageObj["url"];
  else if (imageObj["srcLocation"] === "remoteFile")
    return imageObj["url"] + imageObj["filename"];

  return "";
}
