import React from "react";
import { makeStyles } from "@mui/styles";
import { Box, Typography, IconButton, Paper } from "@mui/material";

import { ExpandMore } from "@mui/icons-material";
import UIContainer from "../../UIContainer/UIContainer";

export default function UIExpansionPanel(props) {
  const appConfig = props.appconfig;
  const scrIndex = props.currentScreenIndex;
  const uiData = props.data;
  const paddingTop = uiData.padding ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = uiData.padding ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = uiData.padding ? parseInt(uiData.padding.left) : 0;
  const paddingRight = uiData.padding ? parseInt(uiData.padding.right) : 0;

  const containerWidth =
    parseInt(uiData.frame.width) - (paddingLeft + paddingRight);
  const containerHeight =
    parseInt(uiData.frame.height) - (paddingTop + paddingBottom);
  const borderRadius = uiData.cornerRadius ? parseInt(uiData.cornerRadius) : 0;
  const borderWeight = parseInt(uiData.borderWeight);
  const borderColor = getColorValue(uiData.borderColor);

  const headerHeight = parseInt(uiData.headerheight);
  const fontSize = uiData.headerfont ? uiData.headerfont.fontSize : 8;
  const fontWeight = uiData.headerfont.fontWeight ? "bold" : "normal";
  const textColor = uiData.headerfont
    ? getColorValue(uiData.headerfont.textColor)
    : { alpha: 1, red: 0, green: 0, blue: 0, colorName: "" };
  const headerIconPosition = uiData.headerIconPosition
    ? uiData.headerIconPosition
    : "right";
  const headerIconClose = getImagePath(
    uiData.headerIconClose,
    appConfig.apiURL,
    appConfig.projectid
  );
  let customIcon = false;
  if (uiData.headerIconClose.filename.length > 0) {
    customIcon = true;
  }

  const itemGap = uiData.gap;
  let itemHeight = containerHeight - headerHeight - itemGap;

  /*const panelCount = uiData.panelItems.length;
  for (let index = 0; index < panelCount; index++) {
    const element = uiData.panelItems[index];
      if(!element.hasOwnProperty('headerimage')) {
       element['headerimage'] = {"srcLocation": "bundle", "filename": "", "fileext": "", "url": ""};
    }
  }*/
  //console.log("** EXpn Panel **", uiData.panelItems);

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {
      //boxSizing: 'border-box',
      position: "absolute",
      backgroundColor: "rgba(255,255,255,0)",
      paddingTop: `calc(${paddingTop}px)`,
      paddingBottom: `calc(${paddingBottom}px)`,
      paddingLeft: `calc(${paddingLeft}px)`,
      paddingRight: `calc(${paddingRight}px)`,
      pointerEvents: "none",
    },
    headerDiv: {
      width: containerWidth,
      height: `calc(${headerHeight}px)`,
      backgroundColor: getColorValue(uiData.backgroundColor, true),
      borderWidth: `calc(${borderWeight}px)`,
      borderStyle: "solid",
      borderColor: borderColor,
      borderTopLeftRadius: `calc(${borderRadius}px)`,
      borderTopRightRadius: `calc(${borderRadius}px)`,
      borderBottom: 0,
      boxSizing: "border-box",
      display: "flex",
    },
    headerBox: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      padding: "0px 4px",
    },
    headerleft: {
      textAlign: "left",
      width: "100%",
      fontSize: `calc(${fontSize}px)`,
      fontWeight: fontWeight,
      color: textColor,
      overflow: "hidden",
      textOverflow: "ellipsis",
      lineHeight: 1,
    },
    headerright: {
      textAlign: "left",
      width: "100%",
      //height: '100%',
      fontSize: `calc(${fontSize}px)`,
      fontWeight: fontWeight,
      color: textColor,
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      textOverflow: "ellipsis",
      lineHeight: 1,
    },
    headericon: {
      padding: 4,
      width: headerHeight / 2 + "px",
      height: headerHeight / 2 + "px",
      maxHeight: 32,
      maxWidth: 32,
    },
    contentlistlayout: {
      width: containerWidth,
      //height: `calc(${containerHeight - headerHeight}px)`,
      backgroundColor: getColorValue(uiData.backgroundColor),
      borderWidth: `calc(${borderWeight}px)`,
      borderStyle: "solid",
      borderColor: borderColor,
      borderBottomLeftRadius: `calc(${borderRadius}px)`,
      borderBottomRightRadius: `calc(${borderRadius}px)`,
      boxSizing: "border-box",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-around",
      overflow: "hidden",
    },
    contentlayout: {
      width: "100%",
      height: `calc(${itemHeight}px)`,
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-around",
      overflow: "hidden",
    },
  }));
  const classes = useStyles();
  return (
    <Box id="expnpanelui" className={classes.uilayout}>
      {uiData["panelItems"].map((item, index) => (
        <Paper
          elevation={0}
          key={"uipanel" + index}
          style={{ marginBottom: uiData.gap, background: "transparent" }}
        >
          {item.showheader && (
            <Box
              id="panela-header"
              aria-controls="panela-content"
              className={classes.headerDiv}
            >
              {headerIconPosition === "left" && (
                <Box id="lefticon" className={classes.headerBox}>
                  {!customIcon && (
                    <IconButton
                      aria-label="Close"
                      className={classes.headericon}
                    >
                      <ExpandMore />
                    </IconButton>
                  )}
                  {customIcon && (
                    <img
                      src={headerIconClose}
                      alt="close"
                      className={classes.headericon}
                    />
                  )}
                  <Typography className={classes.headerleft}>
                    {item.heading}
                  </Typography>
                </Box>
              )}
              {headerIconPosition === "right" && (
                <Box id="righticon" className={classes.headerBox}>
                  {isImageSet(item.headerimage) && (
                    <img
                      src={getImagePath(
                        item.headerimage,
                        appConfig.apiURL,
                        appConfig.projectid
                      )}
                      alt="close"
                      className={classes.headericon}
                    />
                  )}
                  <Typography className={classes.headerright}>
                    {item.heading}
                  </Typography>
                  {!customIcon && (
                    <IconButton
                      aria-label="Close"
                      className={classes.headericon}
                    >
                      <ExpandMore />
                    </IconButton>
                  )}
                  {customIcon && (
                    <img
                      src={headerIconClose}
                      alt="close"
                      className={classes.headericon}
                    />
                  )}
                </Box>
              )}
            </Box>
          )}
          <Box
            className={classes.contentlistlayout}
            style={{ height: item.height }}
          >
            <UIContainer
              appconfig={appConfig}
              data={item["Fields"]}
              pagedata={props.pagedata}
              screenIndex={scrIndex}
              source={"ExpansionPanel-" + index}
            />
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
function getColorValue(colorObj, opaque) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  if (opaque) {
    return "rgba(" + _red + "," + _green + "," + _blue + ",1)";
  } else {
    return (
      "rgba(" + _red + "," + _green + "," + _blue + "," + colorObj.alpha + ")"
    );
  }
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

function isImageSet(imageObj) {
  if (imageObj && imageObj["srcLocation"] === "bundle") {
    if (imageObj["filename"] !== "" && imageObj["fileext"] !== "") {
      return true;
    }
  }
  return false;
}
