import React from "react";
import "./UITileListStyle.css";
import { ImageList, ImageListItem } from "@mui/material";

import UIContainer from "../../UIContainer/UIContainer";
import accHeaderIcon from "../../../../assets/accheader.png";
import { Box, List, Typography } from "@mui/material";

export default function UITileList(props) {
  const appConfig = props.appconfig;
  const scrIndex = props.currentScreenIndex;
  const uiData = props.data;
  if (!uiData.hasOwnProperty("ServiceName")) {
    uiData["ServiceName"] = "";
  }
  if (!uiData.hasOwnProperty("limit")) {
    uiData["limit"] = 25;
  }

  const paddingTop = uiData.padding ? uiData.padding.top : 0;
  const paddingBottom = uiData.padding ? uiData.padding.bottom : 0;
  const paddingLeft = uiData.padding ? uiData.padding.left : 0;
  const paddingRight = uiData.padding ? uiData.padding.right : 0;

  const dataArray = uiData.dataarray[0];
  const itemColumns = parseInt(dataArray.columns);
  const itemRows = parseInt(dataArray.rows);
  const itemGap = itemRows > 1 || itemColumns > 1 ? parseInt(dataArray.gap) : 0;

  if (!uiData.hasOwnProperty("showarrow")) {
    uiData["showarrow"] = false;
  }
  if (!uiData.hasOwnProperty("shownext")) {
    uiData["shownext"] = false;
  }
  let displayHnext =
    uiData.shownext && uiData.direction === "Horizontal" ? true : false;
  let nextItemWid = displayHnext ? 10 + itemGap : 0;
  let displayVnext =
    uiData.shownext && uiData.direction === "Vertical" ? true : false;
  let nextItemHie = displayVnext ? 10 + itemGap : 0;

  const containerWidth = uiData.frame.width - (paddingLeft + paddingRight) + 1;
  const containerHeight =
    uiData.frame.height - (paddingTop + paddingBottom) + 1;
  //const uiVisibility = (uiData.hidden) ? 'hidden' : 'visible';
  const showPaging = uiData.paging ? "visible" : "hidden";
  let pagingHeight = uiData.paging ? 18 : 0;
  if (uiData.direction === "Vertical") {
    pagingHeight = 0;
  }

  const itemHeight =
    (containerHeight - nextItemHie - pagingHeight - (itemRows - 1) * itemGap) /
    itemRows;
  const itemWidth =
    (containerWidth - nextItemWid - (itemColumns - 1) * itemGap) / itemColumns;

  dataArray["height"] = itemHeight;
  dataArray["width"] = itemWidth;
  //console.log(scrIndex, uiData, ".... UITileList ....", dataArray);

  let tileListData = [];
  const itemArray = dataArray.Fields;
  if (itemArray.length > 0) {
    let tileData = new Array(itemColumns).fill(itemArray);
    for (let i = 0; i < itemRows; i++) {
      tileListData.push(tileData);
    }
    // console.log(itemArray, tileData, ".... UITileList ....", tileListData);
  }

  if (!uiData.hasOwnProperty("isAccordian")) {
    uiData["isAccordian"] = false;
    uiData["accHeaderHeight"] = 32;
    uiData["accHeaderBGColor"] = {
      alpha: 1,
      red: 1,
      green: 1,
      blue: 1,
      colorName: "",
    };
    uiData["accHeaderTextColor"] = {
      alpha: 1,
      red: 0,
      green: 0,
      blue: 0,
      colorName: "",
    };
    uiData["accHeaderIconOpen"] = {
      srcLocation: "bundle",
      filename: "",
      fileext: "",
      url: "",
    };
    uiData["accHeaderIconClose"] = {
      srcLocation: "bundle",
      filename: "",
      fileext: "",
      url: "",
    };
    uiData["accHeaderIconPosition"] = "left";
    uiData["accRecordsCount"] = true;
    uiData["accHeaderBorderWeight"] = 1;
    uiData["Groupby"] = "";
  }
  const isAccordion =
    uiData.direction === "Vertical" && uiData.isAccordian
      ? uiData.isAccordian
      : false;
  const accHeaderHeight =
    isAccordion && uiData.hasOwnProperty("accHeaderHeight")
      ? uiData.accHeaderHeight
        ? uiData.accHeaderHeight
        : 32
      : 0;
  const accHeaderBGColor = uiData.accHeaderBGColor
    ? uiData.accHeaderBGColor
    : { alpha: 1, red: 1, green: 1, blue: 1, colorName: "" };
  const accHeaderTextColor = uiData.accHeaderTextColor
    ? uiData.accHeaderTextColor
    : { alpha: 1, red: 1, green: 1, blue: 1, colorName: "" };
  const accHeaderIconPosition = uiData.accHeaderIconPosition
    ? uiData.accHeaderIconPosition
    : "left";
  const accHeaderIconClose = getIconPath(
    uiData.accHeaderIconClose,
    appConfig.apiURL,
    appConfig.projectid
  );
  let isAccHeaderIcon = false;
  if (isAccordion && uiData.accHeaderIconClose.filename.length > 0) {
    isAccHeaderIcon = true;
  }
  const accHeaderBorderWeight = uiData.hasOwnProperty("accHeaderBorderWeight")
    ? uiData.accHeaderBorderWeight
    : 1;

  return (
    <Box
      id="tilelist"
      className="tile-list-layout"
      style={{
        backgroundColor: getColorValue(uiData.backgroundColor),
        paddingTop: `calc(${paddingTop}px)`,
        paddingBottom: `calc(${paddingBottom}px)`,
        paddingLeft: `calc(${paddingLeft}px)`,
        paddingRight: `calc(${paddingRight}px)`,
      }}
    >
      {isAccordion && accHeaderIconPosition === "left" && (
        <Box
          className="tile-list-header"
          style={{
            height: accHeaderHeight + "px",
            backgroundColor: getColorValue(accHeaderBGColor),
          }}
        >
          {!isAccHeaderIcon && (
            <img
              src={accHeaderIcon}
              alt="accheaderright"
              className="tile-list-icon"
              style={{ width: accHeaderHeight - 8 + "px" }}
            />
          )}
          {isAccHeaderIcon && (
            <img
              src={accHeaderIconClose}
              alt="accheaderright"
              className="tile-list-icon"
              style={{ width: accHeaderHeight - 8 + "px" }}
            />
          )}
          <Typography
            variant="subtitle2"
            style={{ color: getColorValue(accHeaderTextColor) }}
            className="tile-list-header-left"
          >
            {uiData.Groupby}
          </Typography>
        </Box>
      )}
      {isAccordion && accHeaderIconPosition === "right" && (
        <Box
          className="tile-list-header"
          style={{
            height: accHeaderHeight + "px",
            backgroundColor: getColorValue(accHeaderBGColor),
          }}
        >
          <Typography
            variant="subtitle2"
            style={{ color: getColorValue(accHeaderTextColor) }}
            className="tile-list-header-right"
          >
            {uiData.Groupby}
          </Typography>
          {!isAccHeaderIcon && (
            <img
              src={accHeaderIcon}
              alt="accheaderright"
              className="tile-list-icon"
              style={{ width: accHeaderHeight - 8 + "px" }}
            />
          )}
          {isAccHeaderIcon && (
            <img
              src={accHeaderIconClose}
              alt="accheaderright"
              className="tile-list-icon"
              style={{ width: accHeaderHeight - 8 + "px" }}
            />
          )}
        </Box>
      )}
      <List
        component="nav"
        dense={true}
        className="tile-list-container"
        style={{
          width: containerWidth,
          height: `calc(${containerHeight - pagingHeight - accHeaderHeight}px)`,
        }}
      >
        {tileListData.map((listData, id) => (
          <ImageList
            key={id}
            cellHeight={itemHeight}
            cols={itemColumns}
            className="tile-item-layout"
            style={{ margin: 0, height: `calc(${itemHeight}px)` }}
          >
            {listData.map((item, index) => (
              <ImageListItem
                key={index}
                cols={1}
                rows={1}
                style={{ height: "100%", width: itemWidth, padding: 0 }}
              >
                <UIContainer
                  appconfig={appConfig}
                  data={item}
                  pagedata={props.pagedata}
                  screenIndex={scrIndex}
                  source="TileList"
                />
              </ImageListItem>
            ))}
            {displayHnext && (
              <ImageListItem
                id="horizontalnext"
                style={{
                  width: 10,
                  height: 117,
                  padding: 0,
                  margin: 0,
                  marginLeft: itemGap,
                }}
              >
                <Box
                  style={{
                    height: "100%",
                    width: "100%",
                    padding: 0,
                    backgroundColor: "darkgrey",
                  }}
                ></Box>
              </ImageListItem>
            )}
          </ImageList>
        ))}
        {displayVnext && (
          <ImageList
            id="verticalnext"
            className="vertical-next"
            style={{ margin: 0, marginTop: itemGap }}
          >
            <Box
              style={{
                height: "100%",
                width: "100%",
                padding: 0,
                backgroundColor: "darkgrey",
              }}
            ></Box>
          </ImageList>
        )}
      </List>
      <div
        id="pagingDiv"
        className="tile-list-page"
        style={{ visibility: showPaging, width: "100%", height: pagingHeight }}
      >
        <svg height="18" width={containerWidth}>
          <circle
            cx={containerWidth / 2}
            cy="9"
            r="8"
            stroke="black"
            strokeWidth="1"
            fill="grey"
          />
          Sorry, your browser does not support inline SVG.
        </svg>
      </div>
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

function getIconPath(imageObj, _url, _pid) {
  let imagepath = "";

  if (imageObj) {
    if (imageObj["srcLocation"] === "bundle")
      imagepath =
        _url +
        "download/image/" +
        _pid +
        "/" +
        imageObj["filename"] +
        "." +
        imageObj["fileext"];
    else if (imageObj["srcLocation"] === "url") imagepath = imageObj["url"];
    else if (imageObj["srcLocation"] === "remoteFile")
      imagepath = imageObj["url"] + imageObj["filename"];
    else imagepath = imageObj["filename"];
  }

  return imagepath;
}
