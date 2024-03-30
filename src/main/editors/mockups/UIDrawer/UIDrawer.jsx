import React from "react";
import "./UIDrawerStyle.css";
import { Box, List, ImageList, ImageListItem } from "@mui/material";

import UIContainer from "../../UIContainer/UIContainer";

export default function UIDrawer(props) {
  const appConfig = props.appconfig;
  const scrIndex = props.currentScreenIndex;
  //const currentScreen = props.screendata[scrIndex];
  const uiData = props.data;
  //console.log(currentScreen, "..UI Drawer >>>", uiData);

  const borderWeight = parseInt(uiData.borderWeight);
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = uiData.cornerRadius ? parseInt(uiData.cornerRadius) : 0;
  const cornerRadius = uiData.style === "plain" ? 0 : 10;

  const paddingTop = uiData.padding ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = uiData.padding ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = uiData.padding ? parseInt(uiData.padding.left) : 0;
  const paddingRight = uiData.padding ? parseInt(uiData.padding.right) : 0;

  const defaultWidth = parseInt(uiData.frame.width); //(currentScreen['width']) ? parseInt(currentScreen['width']) : parseInt(uiData.frame.width);
  const defaultHeight = parseInt(uiData.frame.height); //(currentScreen['height']) ? parseInt(currentScreen['height']/2) : parseInt(uiData.frame.height);
  let containerHeight =
    defaultHeight - (paddingTop + paddingBottom + 2 * borderWeight);
  //let containerWidth = defaultWidth - (paddingLeft+paddingRight + 2*borderWeight);

  const showHeader = uiData.showdragIndicator ? "visible" : "hidden";
  const headerHeight = showHeader === "visible" ? 10 : 0;
  const showClose = uiData.showclose ? "visible" : "hidden";
  const footerHeight = showClose === "visible" ? 24 : 0;
  containerHeight = containerHeight - headerHeight - (footerHeight + 1);

  const dataArray = uiData.dataarray[0];
  const itemColumns = parseInt(dataArray.columns);
  const itemRows = parseInt(dataArray.rows);
  const itemGap = itemRows > 1 ? parseInt(dataArray.gap) : 0;
  let itemHeight =
    dataArray.height === 0
      ? (containerHeight - itemGap) / itemRows
      : dataArray.height;

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
    <Box
      id="drawerui"
      style={{
        width: defaultWidth,
        borderColor: borderColor,
        backgroundColor: getColorValue(uiData.backgroundColor),
        borderRadius: `calc(${borderRadius}px)`,
        borderWidth: `calc(${borderWeight}px)`,
        "border-top-right-radius": cornerRadius,
        "border-top-left-radius": cornerRadius,
      }}
      className="ui-drawer-layout"
    >
      <div
        id="headerDiv"
        style={{
          visibility: showHeader,
          height: headerHeight,
          backgroundColor: getColorValue(uiData.backgroundColor),
        }}
        className="ui-content-header-container"
      >
        <div id="indicatorDiv" className="ui-drawer-indicator"></div>
      </div>
      <List
        component="nav"
        dense={true}
        style={{
          height: `calc(${containerHeight}px)`,
          paddingTop: `calc(${paddingTop}px)`,
          paddingBottom: `calc(${paddingBottom}px)`,
          paddingLeft: `calc(${paddingLeft}px)`,
          paddingRight: `calc(${paddingRight}px)`,
        }}
        className="ui-content-list-layout"
      >
        {contentListData.map((listData, id) => (
          <ImageList
            key={id}
            cellHeight={itemHeight}
            cols={itemColumns}
            style={{ height: `calc(${itemHeight}px)` }}
            className="ui-drawer-content-layout"
          >
            {listData.map((item, index) => (
              <ImageListItem key={index} cols={1} rows={1}>
                <UIContainer
                  appconfig={appConfig}
                  data={item}
                  pagedata={props.pagedata}
                  screenIndex={scrIndex}
                  source="Drawer"
                />
              </ImageListItem>
            ))}
          </ImageList>
        ))}
      </List>
      <div
        id="footerDiv"
        style={{
          visibility: showClose,
          width: `calc(100% - 20px)`,
          marginLeft: 10,
          height: footerHeight,
          backgroundColor: getColorValue(uiData.backgroundColor),
          borderTop: "1px solid",
        }}
      >
        <div id="closeDiv">Close</div>
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
