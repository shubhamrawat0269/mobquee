import React from "react";
import clsx from "clsx";
import "./UICheckBoxStyle.css";
import { Checkbox, FormGroup, Typography } from "@mui/material";

export default function UICheckBox(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;

  let uiTitle = uiData.title ? uiData.title : "";
  //let uiVisibility = (uiData.hidden) ? 'hidden' : 'visible';

  if (!uiData.hasOwnProperty("enableRipple")) uiData["enableRipple"] = false;
  if (!uiData.hasOwnProperty("showElevation")) uiData["showElevation"] = false;
  const showElevation = uiData.showElevation ? true : false;
  let elevationVal = "none";
  if (showElevation) {
    elevationVal =
      "0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)";
  }

  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);

  const paddingTop = uiData.padding ? uiData.padding.top : 0;
  const paddingBottom = uiData.padding ? uiData.padding.bottom : 0;
  const paddingLeft = uiData.padding ? uiData.padding.left : 0;
  const paddingRight = uiData.padding ? uiData.padding.right : 0;
  const textHeight =
    uiData.frame.height - (paddingTop + paddingBottom) - 2 * borderWeight;
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

  const chkVal = uiData.on === true ? "on" : "off";
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
  //console.log(uiData.name, uiData.on, "UI checkbox >>>", imageOff, imageOn);
  let customImg = uiData.on === true ? imageOn : imageOff;

  const check_icon = {
    width: 20,
    height: 20,
    margin: 2,
    backgroundImage: `url(${imageOff})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    "$root.Mui-focusVisible &": {
      outline: "2px auto rgba(19,124,189,.6)",
      outlineOffset: 2,
    },
    "input:hover ~ &": {
      backgroundColor: "#ebf1f5",
    },
    "input:disabled ~ &": {
      boxShadow: "none",
      background: "rgba(206,217,224,.5)",
    },
  };

  const icon = {
    width: 20,
    height: 20,
    margin: 2,
    backgroundImage: `url(${imageOff})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    "$root.Mui-focusVisible &": {
      outline: "2px auto rgba(19,124,189,.6)",
      outlineOffset: 2,
    },
    "input:hover ~ &": {
      backgroundColor: "#ebf1f5",
    },
    "input:disabled ~ &": {
      boxShadow: "none",
      background: "rgba(206,217,224,.5)",
    },
  };

  var checkTag = [
    <FormGroup key="chkgroup" className="checkbox-btn-group">
      <Checkbox
        disableRipple
        color="default"
        className="checkbox-section"
        checked={uiData.on}
        value={chkVal}
      />
      <Typography
        style={{
          width: `calc(${textWidth - 30}px)`,
          height: `calc(${textHeight}px)`,
          color: textColor,
          fontSize: `calc(${fontSize}px)`,
          fontWeight: fontWeight,
          fontStyle: fontStyle,
          textDecoration: textDecoration,
          textTransform: textTransform,
          verticalAlign: verticalAlign,
        }}
        className="checkbox-label"
      >
        {uiTitle}
      </Typography>
    </FormGroup>,
  ];

  if (imageOff.length > 0 && imageOn.length > 0) {
    checkTag = [
      <FormGroup key="chkgroup" className="checkbox-btn-group">
        <Checkbox
          disableRipple
          color="default"
          className="checkbox-section"
          checked={uiData.on}
          icon={
            <span
              style={{
                backgroundImage: `url(${imageOff})`,
                "$root.Mui-focusVisible &": {
                  outline: "2px auto rgba(19,124,189,.6)",
                  outlineOffset: 2,
                },
                "input:hover ~ &": {
                  backgroundColor: "#ebf1f5",
                },
                "input:disabled ~ &": {
                  boxShadow: "none",
                  background: "rgba(206,217,224,.5)",
                },
              }}
              className="checkbox-icon"
            />
          }
          checkedIcon={<span className={clsx(icon, check_icon)} />}
          value={chkVal}
        />
        <Typography className="checkbox-label">{uiTitle}</Typography>
      </FormGroup>,
    ];
  } else {
    if (imageOff.length > 0) {
      checkTag = [
        <FormGroup key="chkgroup" className="checkbox-btn-group">
          <Checkbox
            disableRipple
            color="default"
            className="checkbox-section"
            checked={uiData.on}
            icon={<span className={icon} />}
            value={chkVal}
          />
          <Typography
            style={{
              paddingLeft: 30,
              width: `calc(${textWidth - 30}px)`,
              height: `calc(${textHeight}px)`,
              lineHeight: "1rem",
              color: textColor,
              fontSize: `calc(${fontSize}px)`,
              fontWeight: fontWeight,
              fontStyle: fontStyle,
              textDecoration: textDecoration,
              textTransform: textTransform,
              display: "table-cell",
              verticalAlign: verticalAlign,
              textOverflow: "clip",
              overflow: "hidden",
              whiteSpace: "pre",
            }}
          >
            {uiTitle}
          </Typography>
        </FormGroup>,
      ];
    }
    if (imageOn.length > 0) {
      checkTag = [
        <FormGroup key="chkgroup" className="checkbox-btn-group">
          <Checkbox
            disableRipple
            color="default"
            className="checkbox-section"
            checked={uiData.on}
            checkedIcon={<span className={clsx(icon, check_icon)} />}
            value={chkVal}
          />
          <Typography
            style={{
              paddingLeft: 30,
              width: `calc(${textWidth - 30}px)`,
              height: `calc(${textHeight}px)`,
              lineHeight: "1rem",
              color: textColor,
              fontSize: `calc(${fontSize}px)`,
              fontWeight: fontWeight,
              fontStyle: fontStyle,
              textDecoration: textDecoration,
              textTransform: textTransform,
              display: "table-cell",
              verticalAlign: verticalAlign,
              textOverflow: "clip",
              overflow: "hidden",
              whiteSpace: "pre",
            }}
          >
            {uiTitle}
          </Typography>
        </FormGroup>,
      ];
    }
  }

  return (
    <div
      id="checkview"
      style={{
        height: textHeight,
        borderWidth: `calc(${borderWeight}px)`,
        borderColor: borderColor,
        paddingTop: `calc(${paddingTop}px)`,
        paddingBottom: `calc(${paddingBottom}px)`,
        paddingLeft: `calc(${paddingLeft}px)`,
        paddingRight: `calc(${paddingRight}px)`,
        backgroundColor: getColorValue(uiData.backgroundColor),
        textAlign: textAlign,
        boxShadow: elevationVal,
      }}
      className="checkbox-layout"
    >
      {checkTag}
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
