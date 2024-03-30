import React from "react";
import "./UISliderStyle.css";
import { withStyles } from "@mui/styles";
import { Box, Slider, styled } from "@mui/material";

export default function UISlider(props) {
  const uiData = props.data;
  const pad = 4;
  const containerHeight = uiData.frame.height - 2 * pad;
  const trackHeight = parseInt(containerHeight) * 0.8;
  const trackTop = parseInt(containerHeight) * 0.1;

  const thumbSize = parseInt(containerHeight);
  const thumbLeft = thumbSize * -0.5;

  const bgColor = getColorValue(uiData.backgroundColor);
  const filledtrackColor = getColorValue(uiData.trackGradientColor1);
  const trackColor = getColorValue(uiData.trackGradientColor2);
  const thumbColor = getColorValue(uiData.thumbGradientColor1);
  const thumbBorder = getColorValue(uiData.thumbGradientColor2);

  // const CustomSlider = styled(Slider)({
  //   root: {
  //     color: "rgba(82,175,119,0)",
  //     height: `calc(${containerHeight}px)`,
  //     padding: 0,
  //   },
  //   track: {
  //     position: "absolute",
  //     top: `calc(${trackTop}px)`,
  //     height: `calc(${trackHeight}px)`,
  //     backgroundColor: filledtrackColor,
  //     borderRadius: 8,
  //   },
  //   rail: {
  //     position: "absolute",
  //     top: `calc(${trackTop}px)`,
  //     height: `calc(${trackHeight}px)`,
  //     backgroundColor: trackColor,
  //     opacity: 1,
  //     borderRadius: 8,
  //   },
  //   thumb: {
  //     height: `calc(${thumbSize}px)`,
  //     width: `calc(${thumbSize}px)`,
  //     marginTop: 0,
  //     marginLeft: `calc(${thumbLeft}px)`,
  //     backgroundColor: thumbColor,
  //     border: "0px solid",
  //     borderColor: thumbBorder,
  //     "&:focus,&:hover,&$active": {
  //       boxShadow: "inherit",
  //     },
  //   },
  //   active: {},
  //   valueLabel: {
  //     left: "calc(-50% + 4px)",
  //   },
  // });

  const CustomSlider = withStyles({
    root: {
      color: "rgba(82,175,119,0)",
      height: `calc(${containerHeight}px)`,
      padding: 0,
    },
    track: {
      position: "absolute",
      // top: `calc(${trackTop}px)`,
      height: `calc(${trackHeight}px)`,
      backgroundColor: filledtrackColor,
      borderRadius: 8,
    },
    rail: {
      position: "absolute",
      // top: `calc(${trackTop}px)`,
      height: `calc(${trackHeight}px)`,
      backgroundColor: trackColor,
      opacity: 1,
      borderRadius: 8,
    },
    thumb: {
      height: `calc(${thumbSize}px)`,
      width: `calc(${thumbSize}px)`,
      marginTop: 0,
      marginLeft: `calc(${thumbLeft}px)`,
      backgroundColor: thumbColor,
      border: "0px solid",
      borderColor: thumbBorder,
      "&:focus,&:hover,&$active": {
        boxShadow: "inherit",
      },
    },
    active: {},
    valueLabel: {
      left: "calc(-50% + 4px)",
    },
  })(Slider);

  const minVal = uiData.minimumValue;
  const maxVal = uiData.maximumValue;
  const sliderVal = uiData.currentValue;
  return (
    <Box
      id="slider"
      style={{
        height: containerHeight,
        backgroundColor: bgColor,
        padding: pad,
        borderColor: bgColor,
      }}
      className="slider-layout"
    >
      <CustomSlider
        valueLabelDisplay="off"
        min={minVal}
        max={maxVal}
        value={sliderVal}
      />
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
