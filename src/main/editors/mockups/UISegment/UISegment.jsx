import React from "react";
import "./UISegmentStyle.css";
import { ButtonGroup, Button, Typography } from "@mui/material";

export default function UISegment(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;

  const borderWeight = uiData.borderWeight ? parseInt(uiData.borderWeight) : 1;
  const borderColor = uiData.borderColor
    ? getColorValue(uiData.borderColor)
    : "rgba(0,0,0,1)";
  const bgroundColor = getColorValue(uiData.tintColor);

  const segmentItems = uiData.segmentItems;
  const itemHeight = parseInt(uiData.frame.height) - (2 * borderWeight + 4);
  const itemWidth =
    parseInt(uiData.frame.width) / segmentItems.length - (2 * borderWeight + 4);
  const itemTextColor = getColorValue(segmentItems[0].font.textColor);

  let selectedSegmentIndex = -1;
  for (let index = 0; index < segmentItems.length; index++) {
    const segmentElem = segmentItems[index];
    segmentElem["font"]["textColor"] = segmentItems[0].font.textColor;

    segmentElem["onTapTextColor"]["alpha"] = 1;

    if (segmentElem["type"] === "TextItem" && segmentElem["text"] !== "") {
      if (segmentElem["text"] === uiData["segmentInitialValue"]) {
        selectedSegmentIndex = index;
      }
    }
  }
  const selectedItemTintColor =
    selectedSegmentIndex > -1
      ? getColorValue(segmentItems[selectedSegmentIndex].onTapTintColor)
      : bgroundColor;
  const selectedItemTextColor =
    selectedSegmentIndex > -1
      ? getColorValue(segmentItems[selectedSegmentIndex].onTapTextColor)
      : itemTextColor;

  return (
    <ButtonGroup
      id="segment"
      variant="contained"
      color="primary"
      className="ui-segment"
      style={{
        borderWidth: `calc(${borderWeight}px)`,
        borderColor: borderColor,
      }}
    >
      {segmentItems.map((item, index) => (
        <button
          key={index}
          className="ui-segment-item-layout"
          style={{
            borderColor: borderColor,
            backgroundColor:
              index === selectedSegmentIndex
                ? selectedItemTintColor
                : bgroundColor,
          }}
        >
          {item.type === "TextItem" && (
            <Typography
              style={{
                fontSize: parseInt(item.font.fontSize),
                color:
                  index === selectedSegmentIndex
                    ? selectedItemTextColor
                    : itemTextColor,
                width: "100%",
                height: "100%",
              }}
            >
              {item.text}
            </Typography>
          )}
          {item.type === "ImageItem" && (
            <img
              className="ui-img-item"
              style={{
                width: itemWidth,
                height: itemHeight,
              }}
              alt="item"
              src={getImagePath(
                item.imageDic,
                appConfig.apiURL,
                appConfig.projectid
              )}
            ></img>
          )}
        </button>
      ))}
    </ButtonGroup>
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
