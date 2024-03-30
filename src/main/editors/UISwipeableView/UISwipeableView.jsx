import React from "react";
import { makeStyles } from "@mui/styles";
import { Box, Button, ButtonGroup } from "@mui/material";
import UIContainer from "../UIContainer/UIContainer";

export default function UISwipeableView(props) {
  const appConfig = props.appconfig;
  const scrIndex = props.currentScreenIndex;
  const uiData = props.data;

  const paddingTop = uiData.padding ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = uiData.padding ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = uiData.padding ? parseInt(uiData.padding.left) : 0;
  const paddingRight = uiData.padding ? parseInt(uiData.padding.right) : 0;

  const borderWeight = parseInt(uiData.borderWeight);
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = uiData.cornerRadius ? parseInt(uiData.cornerRadius) : 0;

  const boxShadowWidth = parseInt(uiData["boxShadowWidth"]);
  const boxShadowColor = getColorValue(uiData["boxShadowColor"]);
  const boxShadow = uiData["boxShadow"]
    ? "0px " + boxShadowWidth + "px " + boxShadowColor
    : "0px 0px 0";

  const showPaging = uiData.paging ? "visible" : "hidden";
  const pagingHeight = uiData.paging ? 18 : 0;

  const containerWidth = parseInt(uiData.frame.width) - 2 * borderWeight;
  let containerHeight = parseInt(uiData.frame.height) - 2 * borderWeight;
  if (uiData["boxShadow"]) {
    containerHeight = containerHeight - boxShadowWidth;
  }

  if (uiData["paging"]) {
    containerHeight = containerHeight - pagingHeight;
  }
  //const itemWidth = containerWidth;
  const itemHeight = containerHeight - (paddingTop + paddingBottom);

  //console.log("SV>>>", uiData['swipeableItems']);

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {
      display: "inline-flex",
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      borderWidth: `calc(${borderWeight}px)`,
      borderStyle: "solid",
      borderColor: borderColor,
      borderRadius: borderRadius,
      boxShadow: boxShadow,
    },
    viewlayout: {
      overflow: "auto hidden",
      backgroundColor: getColorValue(uiData.backgroundColor),
    },
    itemlayout: {
      minWidth: containerWidth,
      minHeight: containerHeight,
      backgroundColor: getColorValue(uiData.backgroundColor),
      boxSizing: "border-box",
      paddingTop: `calc(${paddingTop}px)`,
      paddingBottom: `calc(${paddingBottom}px)`,
      paddingLeft: `calc(${paddingLeft}px)`,
      paddingRight: `calc(${paddingRight}px)`,
      pointerEvents: "none",
    },
    contentlistlayout: {
      width: "100%",
      height: containerHeight,
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-around",
      overflow: "hidden",
      backgroundColor: "lightgray",
    },
    contentlayout: {
      width: "100%",
      height: `calc(${itemHeight}px)`,
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-around",
      overflow: "hidden",
    },
    pagingDiv: {
      visibility: showPaging,
      width: "100%",
      height: pagingHeight,
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      //border: '1px solid',
    },
  }));

  const classes = useStyles();

  return (
    <Box className={classes.uilayout}>
      <ButtonGroup
        id="header"
        variant="contained"
        color="primary"
        className={classes.viewlayout}
      >
        {uiData["swipeableItems"].map((item, index) => (
          <Button key={index} className={classes.itemlayout}>
            <Box className={classes.contentlayout}>
              <UIContainer
                appconfig={appConfig}
                data={item["Fields"]}
                pagedata={props.pagedata}
                screenIndex={scrIndex}
                source={"SwipeableView-" + index}
              />
            </Box>
          </Button>
        ))}
      </ButtonGroup>
      <div id="pagingDiv" className={classes.pagingDiv}>
        <svg height="18" width={20 * uiData["swipeableItems"].length}>
          {uiData["swipeableItems"].map((item, index) => (
            <circle
              key={index}
              cx={index * 20 + 10}
              cy="9"
              r="8"
              stroke="black"
              strokeWidth="1"
              fill="grey"
            />
          ))}
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
