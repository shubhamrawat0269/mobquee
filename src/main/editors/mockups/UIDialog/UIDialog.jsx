import React from "react";
import "./UIDialogStyle.css";
import { ImageList, ImageListItem } from "@mui/material";

import UIContainer from "../../UIContainer/UIContainer";
import { Close } from "@mui/icons-material";
import { Button, IconButton, List, Typography } from "@mui/material";

export default function UIDialog(props) {
  const appConfig = props.appconfig;
  const scrIndex = props.currentScreenIndex;
  const uiData = props.data;
  //console.log("..UI Dialog >>>", uiData);

  const pageData = props.pagedata;
  const isLeftbarVisible = !pageData._toolBarLeft[scrIndex].hidden;
  const isLeftbarFixed = isLeftbarVisible
    ? pageData._toolBarLeft[scrIndex].fixed
    : false;
  const leftbarWidth = parseInt(pageData._toolBarLeft[scrIndex].frame["width"]);
  const isRightbarVisible = pageData._toolBarRight
    ? !pageData._toolBarRight[scrIndex].hidden
    : false;
  const isRightbarFixed =
    pageData._toolBarRight && isRightbarVisible
      ? pageData._toolBarRight[scrIndex].fixed
      : false;
  const rightbarWidth = pageData._toolBarRight
    ? parseInt(pageData._toolBarRight[scrIndex].frame["width"])
    : 0;
  let _containerWidth = parseInt(uiData.frame.width);
  if (isLeftbarVisible && isLeftbarFixed) {
    _containerWidth = _containerWidth - parseInt(leftbarWidth);
  }
  if (isRightbarVisible && isRightbarFixed) {
    _containerWidth = _containerWidth - parseInt(rightbarWidth);
  }
  //console.log(pageData, "..UI Dialog >>>", _containerWidth);

  const borderWeight = parseInt(uiData.borderWeight);
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = uiData.cornerRadius ? parseInt(uiData.cornerRadius) : 0;

  const paddingTop = uiData.padding ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = uiData.padding ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = uiData.padding ? parseInt(uiData.padding.left) : 0;
  const paddingRight = uiData.padding ? parseInt(uiData.padding.right) : 0;

  const containerWidth =
    _containerWidth - (paddingLeft + paddingRight + 2 * borderWeight); //parseInt(uiData.frame.width) - (paddingLeft+paddingRight + 2*borderWeight);
  const containerHeight =
    parseInt(uiData.frame.height) -
    (paddingTop + paddingBottom + 2 * borderWeight);
  //const uiVisibility = (uiData.hidden) ? 'hidden' : 'visible';

  const showHeader = uiData.showheader ? "visible" : "hidden";
  const headerHeight = uiData.showheader ? parseInt(uiData.headerheight) : 0;
  const heading = uiData.heading;
  const fontSize = uiData.headerfont ? uiData.headerfont.fontSize : 0;
  const textColor = uiData.headerfont
    ? getColorValue(uiData.headerfont.textColor)
    : 0;
  const showCloseIcon = uiData.showclose ? "visible" : "hidden";
  //closeIcon
  const imageCloseHeader = getImagePath(
    uiData.closeIcon,
    appConfig.apiURL,
    appConfig.projectid
  );
  const showCloseImage =
    uiData.showclose && imageCloseHeader.length > 0 ? "visible" : "hidden";

  const showFooter = uiData.showfooter ? "visible" : "hidden";
  const footerHeight = uiData.showfooter ? parseInt(uiData.footerheight) : 0;
  //actionButtons actionbuttonheight actionbuttonwidth actionButtonsColor actionButtonsTintColor
  const actionbuttonheight = uiData.actionbuttonheight
    ? parseInt(uiData.actionbuttonheight)
    : 24;
  const actionbuttonwidth = uiData.actionbuttonwidth
    ? parseInt(uiData.actionbuttonwidth)
    : 64;
  const actionButtonsColor = uiData.actionButtonsColor
    ? getColorValue(uiData.actionButtonsColor)
    : 0;
  const actionButtonsTintColor = uiData.actionButtonsTintColor
    ? getColorValue(uiData.actionButtonsTintColor)
    : 0;
  const actionButtonsArray = uiData.actionButtons;
  //console.log(uiData, ".. Dialog >>", actionButtonsArray, actionbuttonheight, actionbuttonwidth, actionButtonsColor, actionButtonsTintColor);

  const dataArray = uiData.dataarray[0];
  const itemColumns = parseInt(dataArray.columns);
  const itemRows = parseInt(dataArray.rows);
  const itemGap = itemRows > 1 ? parseInt(dataArray.gap) : 0;
  let itemHeight =
    dataArray.height === 0
      ? (containerHeight - itemGap) / itemRows
      : dataArray.height; //(containerHeight - itemGap)/itemRows;

  let contentListData = [];
  const itemArray = dataArray.Fields;
  if (itemArray.length > 0) {
    let contentData = new Array(itemColumns).fill(itemArray);
    for (let i = 0; i < itemRows; i++) {
      contentListData.push(contentData);
    }
    //console.log(itemArray, contentData, ".... UIDialog ....", contentListData);
  }

  return (
    <section
      id="dialogui"
      className="dialog-section"
      style={{
        width: containerWidth,
        height: containerHeight,
        backgroundColor: getColorValue(uiData.backgroundColor),
        borderWidth: `calc(${borderWeight}px)`,
        borderColor: borderColor,
        borderRadius: `calc(${borderRadius}px)`,
        marginTop: `calc(${paddingTop}px)`,
        marginBottom: `calc(${paddingBottom}px)`,
        marginLeft: `calc(${paddingLeft}px)`,
        marginRight: `calc(${paddingRight}px)`,
      }}
    >
      <div
        id="headerDiv"
        className="diaglog-header-container"
        style={{
          visibility: showHeader,
          height: `calc(${headerHeight - 1}px)`,
        }}
      >
        <Typography
          style={{ color: textColor, fontSize: `calc(${fontSize}px)` }}
          className="dialog-title"
        >
          {heading}
        </Typography>
        {showCloseImage === "hidden" && (
          <IconButton
            aria-label="Close"
            style={{ visibility: showCloseIcon }}
            className="diaglog-header-close"
          >
            <Close />
          </IconButton>
        )}
        {showCloseImage === "visible" && (
          <img src={imageCloseHeader} alt="close" className="close-icn" />
        )}
      </div>
      <List
        component="nav"
        dense={true}
        className="content-list-layout"
        style={{
          height: `calc(${containerHeight - headerHeight - footerHeight}px)`,
        }}
      >
        {contentListData.map((listData, id) => (
          <ImageList
            key={id}
            cellHeight={itemHeight}
            cols={itemColumns}
            className="dialog-content"
            style={{ margin: 0, height: `calc(${itemHeight}px)` }}
          >
            {listData.map((item, index) => (
              <ImageListItem key={index} cols={1} rows={1}>
                <UIContainer
                  appconfig={appConfig}
                  data={item}
                  pagedata={props.pagedata}
                  screenIndex={scrIndex}
                />
              </ImageListItem>
            ))}
          </ImageList>
        ))}
      </List>
      <div
        id="footerDiv"
        style={{
          height: `calc(${footerHeight - 1}px)`,
          visibility: showFooter,
        }}
        className="dialog-footer"
      >
        <ImageList
          cols={actionButtonsArray.length}
          className="dialog-action-btn"
          style={{ margin: 0 }}
        >
          {actionButtonsArray.map((item, index) => (
            <ImageListItem
              key={index}
              cols={1}
              rows={1}
              className="dialog-action-btn-tile"
              style={{
                padding: 0,
                width: actionbuttonwidth,
                height: actionbuttonheight,
              }}
            >
              <button
                style={{
                  width: actionbuttonwidth,
                  height: actionbuttonheight,
                  backgroundColor: actionButtonsTintColor,
                  textTransform: "none",
                  color: actionButtonsColor,
                }}
              >
                {item.title}
              </button>
            </ImageListItem>
          ))}
        </ImageList>
      </div>
    </section>
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
    else {
      if (imageObj["filename"] !== "" && imageObj["fileext"] !== "")
        return _url + "download/image/" + _pid + "/" + imageObj["filename"];
    }
  } else if (imageObj["srcLocation"] === "url") return imageObj["url"];
  else if (imageObj["srcLocation"] === "remoteFile")
    return imageObj["url"] + imageObj["filename"];

  return "";
}
