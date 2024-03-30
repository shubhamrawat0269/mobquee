import React from "react";
import "./UIWebViewStyle.css";
import { Typography } from "@mui/material";

export default function UIWebView(props) {
  const uiData = props.data;
  const webtext = uiData.filename.url ? uiData.filename.url : "Web Page URL";

  let _scalestoFit = uiData["scalesPageToFit"];
  if (typeof _scalestoFit === "string") {
    _scalestoFit = _scalestoFit.replace("page_", "");
    uiData["scalesPageToFit"] = _scalestoFit === "true";
  }

  const align = uiData.filename.url ? "start" : "center";
  //console.log(align, ">>> WebView >>>>", uiData);
  const margin = 5;
  const borderWeight = uiData.borderWeight;

  const containerX = uiData.frame.x;
  const containerY = uiData.frame.y;
  const containerWidth =
    parseInt(uiData.frame.width) - 2 * (borderWeight + margin);
  const containerHeight =
    parseInt(uiData.frame.height) - 2 * (borderWeight + margin);

  return (
    <div
      id="webview"
      className="ui-webview"
      style={{
        left: `calc(${containerX}px)`,
        top: `calc(${containerY}px)`,
        borderWidth: `calc(${borderWeight}px)`,
        borderColor: getColorValue(uiData.borderColor),
      }}
    >
      <Typography className="ui-web">{webtext}</Typography>
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
