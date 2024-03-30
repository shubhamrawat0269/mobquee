import React from "react";
import "./UIProgressStyle.css";
import { CircularProgress, styled } from "@mui/material";

export default function UIProgress(props) {
  const uiData = props.data;
  //uiData['arcRadius'] = 28;

  //const containerWidth = uiData.frame.width;
  const containerHeight = parseInt(uiData.frame.height);

  if (!uiData.hasOwnProperty("arcRadius")) uiData["arcRadius"] = 28;
  const diameter = 2 * parseInt(uiData["arcRadius"]);

  const bgColor = getColorValue(uiData.backgroundColor);
  const fillColor = getColorValue(uiData.fillColor);

  const progressVal = uiData.progress * 100;
  const thumbSize = uiData.frame.height;
  const thumbLeft = progressVal === 0 ? 0 : thumbSize * -0.5;

  const ProgressBar = styled("div")({
    root: {
      color: "#52af77",
      height: containerHeight,
      padding: 0,
    },
    track: {
      height: containerHeight,
      backgroundColor: fillColor,
      borderRadius: 8,
    },
    rail: {
      height: containerHeight,
      backgroundColor: bgColor,
      borderRadius: 8,
      opacity: 1,
    },
    thumb: {
      visibility: "hidden",
      height: thumbSize,
      width: thumbSize,
      marginTop: 0,
      marginLeft: `calc(${thumbLeft}px)`,
      backgroundColor: fillColor,
      border: "2px solid",
      borderColor: fillColor,
      "&:focus,&:hover,&$active": {
        boxShadow: "inherit",
      },
    },
    valueLabel: {
      left: "calc(-50% + 4px)",
    },
  });

  let progressMockup;
  if (uiData.style === "Circle") {
    progressMockup = [
      <section key={uiData.name} className="progress-bar">
        <CircularProgress
          variant="determinate"
          value={100}
          style={{
            position: "absolute",
            color: bgColor,
          }}
          size={diameter}
          thickness={8}
          {...props}
        />
        <CircularProgress
          variant="determinate"
          value={progressVal}
          style={{
            color: fillColor,
          }}
          size={diameter}
          thickness={8}
          {...props}
        />
      </section>,
    ];
  } else {
    progressMockup = (
      <ProgressBar
        valueLabelDisplay="off"
        defaultValue={0}
        value={progressVal}
      />
    );
  }

  return (
    <div id="progress" className="circular-btn">
      {progressMockup}
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
