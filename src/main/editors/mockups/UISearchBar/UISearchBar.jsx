import React from "react";
import "./UISearchBarStyle.css";
import { Fab, SvgIcon, Typography } from "@mui/material";

export default function UISearchBar(props) {
  const uiData = props.data;

  let uiText = uiData.text ? uiData.text : "";

  const showClearIcon = uiText.length === 0 ? false : true;

  const uiHeight = parseInt(uiData.frame.height);
  const iconHeight = 30;//uiData.frame.height;

  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);

  const paddingTop = uiData.padding ? uiData.padding.top : 0;
  const paddingBottom = uiData.padding ? uiData.padding.bottom : 0;
  const paddingLeft = uiData.padding ? uiData.padding.left : 0;
  let paddingRight = uiData.padding ? uiData.padding.right : 0;
  if (showClearIcon) paddingRight = paddingRight + 30;

  const containerHeight = uiHeight - (paddingTop+paddingBottom);

  //const fontFamily = (uiData.font) ? uiData.font.fontName : 'system';
  const fontSize = uiData.font ? uiData.font.fontSize : 0;
  const fontWeight = uiData.font.fontWeight ? "bold" : "normal";
  const fontStyle = uiData.font.fontStyle ? "italic" : "normal";
  let textColor = uiData.font ? getColorValue(uiData.font.textColor) : 0;
  const textAlign = uiData.font ? uiData.font.textAlignment : "left";

  const verticalAlign = uiData.verticalAlignment
    ? uiData.verticalAlignment
    : "middle";

  if (!uiData.hasOwnProperty("placeholder")) {
    uiData["placeholder"] = "";
  }
  const placeHolder = uiData.placeholder ? uiData.placeholder : "";
  if (placeHolder.length > 0 && uiText.length === 0) {
    uiText = placeHolder;
    textColor = "rgba(0,0,0,0.4)";
  }

  let barColor;
  const barStyle = uiData.barStyle;
  switch (barStyle) {
    case "blue":
      barColor = "#5A7AAF";
      break;
    case "black":
      barColor = "#3C3C3C";
      break;
    case "silver":
      barColor = "#D8D8D8";
      break;
    case "white":
      barColor = "#FCFCFC";
      break;
    default:
      barColor = "#5A7AAF";
      break;
  }

  let searchMockUp = (
    <SvgIcon>
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      <path d="M0 0h24v24H0z" fill="none" />
    </SvgIcon>
  );
  let cancelMockUp = (
    <SvgIcon>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      <path d="M0 0h24v24H0z" fill="none" />
    </SvgIcon>
  );

  return (
    <div id="searchbar" className="ui-searchbar">
      <div
        className="ui-searchbar-layout"
        style={{
          borderWidth: `calc(${borderWeight}px)`,
          borderColor: borderColor,
          backgroundColor: getColorValue(uiData.backgroundColor),
          height: uiHeight,// '100%',
        }}
      >
        <Fab
          id="searchicon"
          style={{
            minWidth: 30,
            minHeight: 30,
            width: `calc(${iconHeight}px)`,
            height: `calc(${iconHeight}px)`,
            backgroundColor: barColor,
          }}
          aria-label={barStyle}
        >
          {searchMockUp}
        </Fab>
        {/* <SearchInput
          margin="dense"
          variant="outlined"
          className={classes.searchlabel}
          style={{ display: "none" }}
          value={uiText}
        /> */}
        <Typography
          id="searchinput"
          style={{
            width: "100%",
            height: containerHeight,  //'100%',
            paddingTop: `calc(${paddingTop}px)`,
            paddingBottom: `calc(${paddingBottom}px)`,
            paddingLeft: `calc(${paddingLeft}px)`,
            paddingRight: `calc(${paddingRight}px)`,
            color: textColor,
            fontSize: `calc(${fontSize}px)`,
            fontWeight: fontWeight,
            fontStyle: fontStyle,
            textAlign: textAlign,
            display: "table-cell",
            verticalAlign: verticalAlign,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {uiText}
        </Typography>
        {showClearIcon && (
          <Fab
            id="cancelicon"
            style={{
              minWidth: 30,
              minHeight: 30,
              width: `calc(${iconHeight}px)`,
              height: `calc(${iconHeight}px)`,
              position: "absolute",
              right: 0,
              backgroundColor: barColor,
            }}
            aria-label={barStyle}
          >
            {cancelMockUp}
          </Fab>
        )}
      </div>
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
