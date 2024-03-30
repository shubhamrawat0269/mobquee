import React from "react";
import "./UISwitchStyle.css";
import { Box, Switch } from "@mui/material";
import { withStyles } from "@mui/styles";

export default function UISwitch(props) {
  const uiData = props.data;

  const containerWidth = parseInt(uiData.frame.width);
  const containerHeight = parseInt(uiData.frame.height);

  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);

  let thumbTranslate = containerWidth - containerHeight;

  let thumbSize = containerHeight - 2;
  if (borderWeight && borderWeight > 0) {
    thumbSize = containerHeight - 2 * borderWeight;
  }

  // const rootStyle = {
  //   width: containerWidth,
  //   height: containerHeight,
  //   padding: 0,
  //   margin: 0,
  // };

  // const switchBaseStyle = {
  //   padding: 0,
  //   top: `calc(${borderWeight}px)`,
  //   left: `calc(${borderWeight}px)`,
  //   "&$checked": {
  //     transform: `translateX(${thumbTranslate}px)`,
  //     // color: theme.palette.grey[600],
  //     "& + $track": {
  //       backgroundColor: "#cccccf",
  //       opacity: 1,
  //       borderWidth: `calc(${borderWeight}px)`,
  //       borderStyle: "solid",
  //       borderColor: borderColor,
  //     },
  //   },
  //   "&$focusVisible $thumb": {
  //     color: "#cccccf",
  //     border: "6px solid #fff",
  //   },
  // };

  // const thumbStyle = {
  //   width: thumbSize,
  //   height: thumbSize,
  // };

  // const trackStyle = {
  //   height: `calc(${thumbSize}px)`,
  //   borderRadius: containerHeight / 2,
  //   borderWidth: `calc(${borderWeight}px)`,
  //   borderStyle: "solid",
  //   borderColor: borderColor,
  //   // backgroundColor: theme.palette.grey[300],
  //   opacity: 1,
  //   // transition: theme.transitions.create(["background-color", "border"]),
  // };

  const BTNSwitch = withStyles((theme) => ({
    root: {
      width: containerWidth,
      height: containerHeight,
      padding: 0,
      margin: 0,
    },
    switchBase: {
      padding: 0,
      top: `calc(${borderWeight}px)`,
      left: `calc(${borderWeight}px)`,
      "&$checked": {
        transform: `translateX(${thumbTranslate}px)`,
        "& + $track": {
          backgroundColor: "#cccccf",
          opacity: 1,
          borderWidth: `calc(${borderWeight}px)`,
          borderStyle: "solid",
          borderColor: borderColor,
        },
      },
      "&$focusVisible $thumb": {
        color: "#cccccf",
        border: "6px solid #fff",
      },
    },
    thumb: {
      width: thumbSize,
      height: thumbSize,
    },
    track: {
      height: `calc(${thumbSize}px)`,
      borderRadius: containerHeight / 2,
      borderWidth: `calc(${borderWeight}px)`,
      borderStyle: "solid",
      borderColor: borderColor,
      backgroundColor: "lightgrey",
      opacity: 1,
    },
  }))(({ classes, ...props }) => {
    return (
      <Switch
        focusVisibleClassName={classes.focusVisible}
        disableRipple
        classes={{
          root: classes.root,
          switchBase: classes.switchBase,
          thumb: classes.thumb,
          track: classes.track,
          checked: classes.checked,
        }}
        {...props}
      />
    );
  });

  const switchVal = uiData.on ? "on" : "off";

  return (
    <Box id="switch" className="switch-layout">
      <BTNSwitch checked={uiData.on} value={switchVal} />

      {/* <Switch
        disableRipple
        classes={{
          root: rootStyle,
          switchBase: switchBaseStyle,
          thumb: thumbStyle,
          track: trackStyle,
        }}
        checked={uiData.on}
        value={switchVal}
      /> */}
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
