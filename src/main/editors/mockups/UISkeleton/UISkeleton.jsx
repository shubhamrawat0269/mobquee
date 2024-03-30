import React from "react";
import "./UISkeletonStyle.css";

export default function UISkeleton(props) {
  const uiData = props.data;
  const uiHeight = parseInt(uiData.frame.height);

  let uiMockup;
  if (uiData.variant === "circular") {
    uiMockup = [
      <div
        key={uiData.name}
        style={{
          width: uiHeight,
          height: uiHeight,
          backgroundColor: getColorValue(uiData.backgroundColor),
        }}
        className="ui-skeletorn-circular-layout"
      ></div>,
    ];
  } else if (uiData.variant === "rounded") {
    uiMockup = [
      <div
        key={uiData.name}
        style={{
          height: uiHeight,
          backgroundColor: getColorValue(uiData.backgroundColor),
        }}
        className="ui-skeleton-rounded-layout"
      ></div>,
    ];
  } else {
    uiMockup = [
      <div
        key={uiData.name}
        style={{
          height: uiHeight,
          backgroundColor: getColorValue(uiData.backgroundColor),
        }}
        className="ui-skeleton-rectangle-layout"
      ></div>,
    ];
  }

  return <div id="indicator">{uiMockup}</div>;
}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return (
    "rgba(" + _red + "," + _green + "," + _blue + "," + colorObj.alpha + ")"
  );
}
