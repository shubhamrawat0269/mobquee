import React from "react";
import "./UIFormViewStyle.css";
import { Box, List, ImageList, ImageListItem, Typography } from "@mui/material";

import UIContainer from "../../UIContainer/UIContainer";

export default function UIFormView(props) {
  const appConfig = props.appconfig;
  const scrIndex = props.currentScreenIndex;
  //const pageData = props.pagedata;

  const uiData = props.data;
  //const uiVisibility = (uiData.hidden) ? 'hidden' : 'visible';
  let uiWidth = parseInt(uiData.frame.width);
  let uiHeight = parseInt(uiData.frame.height);

  const borderWeight = parseInt(uiData.borderWeight);
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = uiData.cornerRadius ? parseInt(uiData.cornerRadius) : 0;

  const paddingTop = uiData.padding ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = uiData.padding ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = uiData.padding ? parseInt(uiData.padding.left) : 0;
  const paddingRight = uiData.padding ? parseInt(uiData.padding.right) : 0;

  const heading = uiData.title;
  const fontSize = uiData.headerfont ? uiData.headerfont.fontSize : 14;
  const textColor = uiData.headerfont
    ? getColorValue(uiData.headerfont.textColor)
    : "rgb(0,0,0)";
  const headerHeight = heading.length > 0 ? 30 : 0;

  const containerWidth =
    uiWidth - (paddingLeft + paddingRight + 2 * borderWeight);
  let containerHeight =
    uiHeight - (paddingTop + paddingBottom + 2 * borderWeight);
  containerHeight = containerHeight - headerHeight;

  const formItems = uiData.formItems[0];
  const formItemMinHeight = formItems.height;
  const formItemBackground = getColorValue(formItems.backgroundColor);
  const formborderWeight = parseInt(formItems.borderWeight);
  const formborderColor = getColorValue(formItems.borderColor);
  const formborderRadius = formItems.cornerRadius
    ? parseInt(formItems.cornerRadius)
    : 0;
  const formLabelSize = formItems.font ? formItems.font.fontSize : 14;
  const formLabelColor = formItems.font
    ? getColorValue(formItems.font.textColor)
    : "rgb(0,0,0)";
  const formLabelWeight = formItems.font.fontWeight ? "bold" : "normal";
  const formLabelStyle = formItems.font.fontStyle ? "italic" : "normal";
  const textAlign = formItems.font ? formItems.font.textAlignment : "center";
  const itemAlign = formItems.itemAlignment
    ? formItems.itemAlignment
    : "middle";

  const itemRows = uiData.formItems.length;
  const formItemHeight = 100 / itemRows;
  //const itemGap = 10;

  let formItemsData = uiData.formItems;
  for (let index = 0; index < formItemsData.length; index++) {
    const element = formItemsData[index];
    element["id"] = index;
  }

  return (
    <Box
      id="formui"
      style={{
        width: uiWidth,
        height: uiHeight,
        backgroundColor: getColorValue(uiData.backgroundColor),
        borderWidth: `calc(${borderWeight}px)`,
        borderStyle: "solid",
        borderColor: borderColor,
        borderRadius: `calc(${borderRadius}px)`,
      }}
      className="frm-section"
    >
      <div
        id="headerDiv"
        style={{
          height: headerHeight,
          backgroundColor: getColorValue(uiData.backgroundColor),
        }}
        className="frm-header-section"
      >
        <Typography
          style={{
            color: textColor,
            fontSize: `calc(${fontSize}px)`,
          }}
          className="frm-header-txt"
        >
          {heading}
        </Typography>
      </div>
      <List
        component="nav"
        dense={true}
        style={{
          width: containerWidth,
          height: containerHeight,
          paddingTop: `calc(${paddingTop}px)`,
          paddingBottom: `calc(${paddingBottom}px)`,
          paddingLeft: `calc(${paddingLeft}px)`,
          paddingRight: `calc(${paddingRight}px)`,
        }}
        className="frm-item-layout"
      >
        {formItemsData.map((items, id) => (
          <ImageList
            key={id}
            cellHeight={formItemHeight}
            rows={itemRows}
            cols={1}
            style={{
              width: "100%",
              minHeight: `calc(${formItemMinHeight}px)`,
              height: `calc(${formItemHeight}% - 10px)`,
              backgroundColor: formItemBackground,
              boxSizing: "border-box",
              borderWidth: `calc(${formborderWeight}px)`,
              borderStyle: "solid",
              borderColor: formborderColor,
              borderRadius: `calc(${formborderRadius}px)`,
              display: "table",
              textAlign: textAlign,
              overflow: "hidden",
              pointerEvents: "none",
              margin: "5px 0px",
            }}
          >
          {/* {console.log(items)} */}
            <div
              className="horizontal-align"
              style={{
                height: 28,
                display:
                  items.required || items.label.length > 0 ? "flex" : "none",
              }}
            >
              <Typography
                className="frm-item-required"
                style={{ display: items.required ? "flex" : "none" }}
              >
                *
              </Typography>
              <Typography
                className="frm-item-label"
                style={{
                  height: items.label.length > 0 ? 32 : 0,
                  color: formLabelColor,
                  fontSize: `calc(${formLabelSize}px)`,
                  fontWeight: formLabelWeight,
                  verticalAlign: itemAlign,
                  fontStyle: formLabelStyle,
                }}
              >
                {items.label}
              </Typography>
            </div>
            {items["Fields"].map((item, index) => (
              <ImageListItem
                key={index}
                cols={1}
                rows={1}
                style={{
                  height: items.label.length > 0 ? `calc(100% - 32px)` : "100%",
                  width: "100%",
                  padding: 0,
                }}
              >
                <UIContainer
                  appconfig={appConfig}
                  data={items["Fields"]}
                  pagedata={props.pagedata}
                  screenIndex={scrIndex}
                />
              </ImageListItem>
            ))}
          </ImageList>
        ))}
      </List>
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
