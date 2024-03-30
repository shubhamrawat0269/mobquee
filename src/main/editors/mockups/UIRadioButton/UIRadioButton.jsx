import React from "react";
import "./UIRadioButtonStyle.css";
import { Radio, Box, FormGroup, Typography } from "@mui/material";

export default function UIRadioButton(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;

  let uiTitle = uiData.title ? uiData.title : "";
  //let uiVisibility = (uiData.hidden) ? 'hidden' : 'visible';

  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);

  const paddingTop = uiData.padding ? uiData.padding.top : 0;
  const paddingBottom = uiData.padding ? uiData.padding.bottom : 0;
  const paddingLeft = uiData.padding ? uiData.padding.left : 0;
  const paddingRight = uiData.padding ? uiData.padding.right : 0;
  const textHeight =
    uiData.frame.height - (paddingTop + paddingBottom) * borderWeight;
  const textWidth =
    uiData.frame.width - (paddingLeft + paddingRight) - 2 * borderWeight;

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

  let textDecoration = "none";
  if (uiData["underline"] && uiData["strikeout"])
    textDecoration = "line-through underline";
  else if (uiData["underline"]) textDecoration = "underline";
  else if (uiData["strikeout"]) textDecoration = "line-through";

  const verticalAlign = uiData.verticalAlignment
    ? uiData.verticalAlignment
    : "middle";

  const radVal = uiData.on ? "on" : "off";
  const imageOff = getImagePath(
    uiData.normalImage,
    appConfig.apiURL,
    appConfig.projectid
  );
  const imageOn = getImagePath(
    uiData.selectedImage,
    appConfig.apiURL,
    appConfig.projectid
  );
  let customImg = uiData.on ? imageOn : imageOff;

  var radioTag = [
    <FormGroup key="radgroup" className="ui-radio-btn-group">
      {/* <RadioUI checked={uiData.on} value={radVal} /> */}
      <Radio
        className="ui-radio-btn"
        color="default"
        checked={uiData.on}
        value={radVal}
      />
      <Typography className="ui-radio-btn-label">{uiTitle}</Typography>
    </FormGroup>,
  ];

  if (imageOff.length > 0 && imageOn.length > 0) {
    radioTag = [
      <FormGroup key="radgroup" className="ui-radio-btn-group">
        {/* <RadioUI checked={uiData.on} value={radVal} /> */}
        <Radio
          className="ui-radio-btn"
          color="default"
          checked={uiData.on}
          value={radVal}
        />
        <div className="ui-radio-btn-img" />
        <Typography className="ui-radio-btn-label">{uiTitle}</Typography>
      </FormGroup>,
    ];
  } else {
    if (imageOff.length > 0) {
      radioTag = [
        <FormGroup key="radgroup" className="ui-radio-btn-group">
          {/* <RadioUI checked={uiData.on} value={radVal} /> */}
          <Radio
            className="ui-radio-btn"
            color="default"
            checked={uiData.on}
            value={radVal}
          />
          <div className="ui-radio-btn-img" />
          <Typography className="ui-radio-btn-label">{uiTitle}</Typography>
        </FormGroup>,
      ];
    }
    if (imageOn.length > 0) {
      radioTag = [
        <FormGroup key="radgroup" className="ui-radio-btn-group">
          {/* <RadioUI checked={uiData.on} value={radVal} /> */}
          <Radio
            className="ui-radio-btn"
            color="default"
            checked={uiData.on}
            value={radVal}
          />
          <div className="ui-radio-btn-img" />
          <Typography className="ui-radio-btn-label">{uiTitle}</Typography>
        </FormGroup>,
      ];
    }
  }

  return (
    <Box
      id="radioview"
      style={{
        pointerEvents: "none",
        minWidth: 24,
        minHeight: 24,
        height: textHeight,
        borderWidth: `calc(${borderWeight}px)`,
        borderStyle: "solid",
        borderColor: borderColor,
        paddingTop: `calc(${paddingTop}px)`,
        paddingBottom: `calc(${paddingBottom}px)`,
        paddingLeft: `calc(${paddingLeft}px)`,
        paddingRight: `calc(${paddingRight}px)`,
        backgroundColor: getColorValue(uiData.backgroundColor),
        textAlign: textAlign,
        overflow: "hidden",
      }}
    >
      {radioTag}
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
