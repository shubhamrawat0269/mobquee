import React from "react";
import "./UITextButtonStyle.css";
import { Box, Typography } from "@mui/material";

export default function UITextButton(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;

  let uiTitle = uiData.title ? uiData.title : "";
  //console.log(uiTitle, ">>> TextButton >>>>", uiData);

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

  const imageNormal = getImagePath(
    uiData.normalBackgroundImage,
    appConfig.apiURL,
    appConfig.projectid
  );
  const imageSelected = getImagePath(
    uiData.selectedBackgroundImage,
    appConfig.apiURL,
    appConfig.projectid
  );

  //console.log(uiData, ".. TextButton ..", imageNormal, imageSelected);

  let bgImg = "";
  if (imageNormal !== "") {
    bgImg = imageNormal;
  } else {
    if (imageSelected !== "") {
      bgImg = imageSelected;
    }
  }
  if (!uiData.hasOwnProperty("backgroundGradient")) {
    uiData["backgroundGradient"] = "";
  }

  return (
    <div id="textbutton">
      {bgImg.length === 0 && (
        <button
          id="textbtn"
          style={{
            width: `calc(${props.containerWidth}px)`,
            borderWidth: `calc(${borderWeight}px)`,
            borderColor: borderColor,
            borderRadius: `calc(${borderRadius}px)`,
            paddingTop: `calc(${paddingTop}px)`,
            paddingBottom: `calc(${paddingBottom}px)`,
            paddingLeft: `calc(${paddingLeft}px)`,
            paddingRight: `calc(${paddingRight}px)`,
            textAlign: textAlign,
            background:
              uiData["backgroundGradient"].length > 0
                ? uiData["backgroundGradient"]
                : `grey`,
          }}
          className="ui-text-btn"
          variant="contained"
          color="default"
          disableRipple
          disableElevation
          fullWidth={true}
        >
          <Typography
            style={{
              width: `calc(${props.containerWidth}px)`,
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
        </button>
      )}
      {bgImg.length > 0 && (
        <Box
          className="ui-text-btn-layout"
          style={{
            borderWidth: `calc(${borderWeight}px)`,
            borderColor: borderColor,
            borderRadius: `calc(${borderRadius}px)`,
            backgroundImage: `url(${bgImg})`,
            backgroundSize: `${uiData.frame.width}px ${uiData.frame.height}px`,
          }}
        >
          <span
            style={{
              width: `calc(100% - ${
                paddingRight + paddingLeft + 2 * borderWeight
              }px)`,
              height: `calc(100% - ${
                paddingTop + paddingBottom + 2 * borderWeight
              }px)`,
              display: "table",
              textAlign: textAlign,
              paddingTop: `calc(${paddingTop}px)`,
              paddingBottom: `calc(${paddingBottom}px)`,
              paddingLeft: `calc(${paddingLeft}px)`,
              paddingRight: `calc(${paddingRight}px)`,
            }}
          >
            <Typography
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
          </span>
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
  //https://tslsampoorna.mobilous.com/appexe/stagetslsampoorna2/157/bin/mobileweb2/resources/image/customer_visit.svg
  //https://tslsampoorna.mobilous.com:8181/appexe/api/download/image/157/customer_visit.svg

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
