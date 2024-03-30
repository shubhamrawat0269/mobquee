import React from "react";
import "./UIComboBoxStyle.css";
import { Button, SvgIcon, Typography } from "@mui/material";

export default function UIComboBox(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;
  uiData["SelectedIndex"] = 0;

  if (!uiData.hasOwnProperty("placeholder")) {
    uiData["placeholder"] = "";
  }
  if (!uiData.hasOwnProperty("setInputlabel")) {
    uiData["setInputlabel"] = uiData.placeholder.length > 0 ? true : false;
  }
  if (!uiData.hasOwnProperty("onfocusBackgroundColor")) {
    uiData["onfocusBackgroundColor"] = uiData.backgroundColor;
  }
  if (!uiData.hasOwnProperty("onfocusBorderColor")) {
    uiData["onfocusBorderColor"] = uiData.borderColor;
  }
  if (!uiData.hasOwnProperty("selectedOptionBGColor")) {
    uiData["selectedOptionBGColor"] = {
      alpha: 1,
      red: 0.23921568628,
      green: 0.49411764706,
      blue: 0.84705882353,
      colorName: "",
    };
  }

  if (!uiData.hasOwnProperty("showElevation")) {
    uiData["showElevation"] = false;
  }
  const _variant = uiData["showElevation"] ? "contained" : "outlined";

  if (!uiData.hasOwnProperty("customIcon")) {
    uiData["customIcon"] = {
      srcLocation: "bundle",
      filename: "",
      fileext: "",
      url: "",
    };
  }
  const isCustomIcon =
    uiData["customIcon"] && uiData["customIcon"]["filename"] !== ""
      ? true
      : false;

  const containerWidth = parseInt(uiData.frame.width);
  const containerHeight = parseInt(uiData.frame.height);

  const borderWeight = parseInt(uiData.borderWeight);
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = uiData.cornerRadius ? parseInt(uiData.cornerRadius) : 0;

  const paddingTop = uiData.padding ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = uiData.padding ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = uiData.padding ? parseInt(uiData.padding.left) : 0;
  const paddingRight = uiData.padding ? parseInt(uiData.padding.right) : 0;

  const textHeight =
    containerHeight - (paddingTop + paddingBottom) - 2 * borderWeight;
  let textWidth =
    containerWidth - (paddingLeft + paddingRight) - 2 * borderWeight - 40;
  if (textWidth < 5) textWidth = 5;

  const fontFamily = uiData.font ? uiData.font.fontName : "system";
  const fontSize = uiData.font ? uiData.font.fontSize : 0;
  let textColor = uiData.font ? getColorValue(uiData.font.textColor) : 0;
  const textAlign = uiData.font ? uiData.font.textAlignment : "left";
  const verticalAlign = uiData.verticalAlignment
    ? uiData.verticalAlignment
    : "middle";

  //console.log(uiData['name'], ".. combo box.. >>", uiData);
  if (!uiData.hasOwnProperty("ServiceName")) {
    uiData["ServiceName"] = "";
  }
  let uiText;
  if (uiData.type === "DB") {
    uiText = uiData.displayText;
  } else {
    if (!uiData.dataarray) {
      uiData["dataarray"] = [{ text: "", fieldvalue: "" }];
    }

    let filteredArray = uiData["dataarray"].filter(function (node) {
      if (node !== null) return true;
      return false;
    });
    uiData.dataarray = filteredArray;

    uiText = uiData.dataarray[0]["text"];
  }

  if (!uiData.hasOwnProperty("placeholderColor")) {
    uiData["placeholderColor"] = {
      alpha: 1,
      red: 0.6,
      green: 0.6,
      blue: 0.6,
      colorName: "",
    };
  }

  const placeholder = uiData["placeholder"] ? uiData["placeholder"] : "";
  if (placeholder.length > 0) {
    uiText = placeholder;
    textColor = getColorValue(uiData["placeholderColor"]);
  }

  return (
    <Button
      id="combobox"
      style={{
        backgroundColor: getColorValue(uiData.backgroundColor),
        borderWidth: `calc(${borderWeight}px)`,
        borderColor: borderColor,
        borderRadius: borderRadius,
        textAlign: textAlign,
      }}
      className="ui-combo-box"
      variant={_variant}
      color="default"
      disableRipple
      fullWidth={true}
    >
      <Typography
        style={{
          paddingTop: `calc(${paddingTop}px)`,
          paddingBottom: `calc(${paddingBottom}px)`,
          paddingLeft: `calc(${paddingLeft}px)`,
          paddingRight: `calc(${paddingRight}px)`,
          height: textHeight,
          width: textWidth,
          color: textColor,
          fontSize: `calc(${fontSize}px)`,
          verticalAlign: verticalAlign,
          fontFamily: fontFamily,
        }}
        className="ui-combo-text"
      >
        {uiText}
      </Typography>
      {!isCustomIcon && (
        <SvgIcon className={classes.uiicon}>
          <path opacity=".87" fill="none" d="M24 24H0V0h24v24z" />
          <path d="M7 10l5 5 5-5z"></path>
        </SvgIcon>
      )}
      {isCustomIcon && (
        <img
          className="custom-icon"
          alt="custom"
          src={getImagePath(
            uiData.customIcon,
            appConfig.apiURL,
            appConfig.projectid
          )}
        ></img>
      )}
    </Button>
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
        imageObj["fileext"]
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
