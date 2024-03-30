import React from "react";
import "./UITabStyle.css";
import { ButtonGroup, Button, Typography } from "@mui/material";

export default function UITabs(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;

  if (uiData.hasOwnProperty("tabItems")) {
    uiData["tabItems"].forEach((itemobj) => {
      if (!itemobj.hasOwnProperty("onTapFontWeight")) {
        itemobj["onTapFontWeight"] = true;
      }
      if (itemobj["font"]) {
        if (itemobj["font"]["fontName"] === "Helvetica Neue") {
          itemobj["font"]["fontName"] = "Amazon Ember";
        }
      }
    });
  }
  if (!uiData.hasOwnProperty("showsSelectionIndicator")) {
    uiData["showsSelectionIndicator"] = false;
    uiData["indicatorColor"] = {
      red: 0,
      blue: 0,
      green: 0,
      alpha: 1,
      colorName: "",
    };
  }

  if (!uiData.hasOwnProperty("showElevation")) uiData["showElevation"] = false;
  const _variant = uiData["showElevation"] ? "contained" : "outlined";
  if (!uiData.hasOwnProperty("enableRipple")) uiData["enableRipple"] = false;
  if (!uiData.hasOwnProperty("itemGap")) uiData["itemGap"] = 0;

  const borderWeight =
    uiData.borderWeight && uiData["showElevation"]
      ? parseInt(uiData.borderWeight)
      : 0;
  const borderColor = uiData.borderColor
    ? getColorValue(uiData.borderColor)
    : "rgba(0,0,0,1)";
  const cornerRadius = uiData.cornerRadius ? parseInt(uiData.cornerRadius) : 0;
  const bgroundColor = getColorValue(uiData.tintColor);
  const headerItemWidth = uiData["itemWidth"]
    ? parseInt(uiData["itemWidth"])
    : 80;

  const tabItems = uiData.tabItems;
  const totalGap = parseInt(uiData["itemGap"]) * (tabItems.length - 1);
  const itemWidth =
    (parseInt(uiData.frame.width) - totalGap) / tabItems.length -
    (2 * borderWeight + 4);
  const itemHeight = parseInt(uiData.frame.height) - (2 * borderWeight + 4);

  const itemTextColor = getColorValue(tabItems[0].font.textColor);
  const fontFamily =
    tabItems[0].font && tabItems[0].font.fontName !== "system"
      ? tabItems[0].font.fontName
      : "Arial";
  let selectedItemIndex = tabItems.length === 1 ? -1 : 0;
  for (let index = 0; index < tabItems.length; index++) {
    const itemElem = tabItems[index];
    itemElem["font"]["textColor"] = tabItems[0].font.textColor;
    itemElem["onTapTextColor"]["alpha"] = 1;

    if (itemElem["type"] === "TextItem" && itemElem["text"] !== "") {
      if (itemElem["text"] === uiData["initialValue"]) {
        selectedItemIndex = index;
      }
    }
  }
  const selectedItemTintColor =
    selectedItemIndex > -1
      ? getColorValue(tabItems[selectedItemIndex].onTapTintColor)
      : bgroundColor;
  const selectedItemTextColor =
    selectedItemIndex > -1
      ? getColorValue(tabItems[selectedItemIndex].onTapTextColor)
      : itemTextColor;
  const selectedItemFontWeight =
    selectedItemIndex > -1
      ? tabItems[selectedItemIndex].onTapFontWeight
        ? "bold"
        : "normal"
      : "normal";

  const itemMargin = parseInt(uiData["itemGap"] / 2);
  const firstItemMargin = "0px " + itemMargin + "px 0px 0px";
  const otherItemMargin = "0px " + itemMargin + "px";
  const lastItemMargin = "0px 0px 0px " + itemMargin + "px";

  return (
    <ButtonGroup
      id="header"
      variant="contained"
      color="primary"
      className="ui-tab-layout"
    >
      {tabItems.map((item, index) => (
        <Button
          key={index}
          className="ui-tab"
          variant={_variant}
          style={{
            borderColor: borderColor,
            backgroundColor:
              index === selectedItemIndex
                ? selectedItemTintColor
                : bgroundColor,
            minWidth: headerItemWidth,
            margin:
              index === 0
                ? firstItemMargin
                : index === tabItems.length - 1
                ? lastItemMargin
                : otherItemMargin,
            borderRadius: itemMargin > 0 ? cornerRadius : "",
          }}
        >
          {item.type === "TextItem" && (
            <Typography
              className="ui-tab-text-layout"
              style={{
                color:
                  index === selectedItemIndex
                    ? selectedItemTextColor
                    : itemTextColor,
                fontWeight:
                  index === selectedItemIndex
                    ? selectedItemFontWeight
                    : item.font.fontWeight
                    ? "bold"
                    : "normal",
                fontSize: parseInt(item.font.fontSize),
                fontFamily: fontFamily,
              }}
            >
              {item.text}
            </Typography>
          )}
          {item.type === "ImageItem" && (
            <img
              className="tab-img-layout"
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
        </Button>
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
