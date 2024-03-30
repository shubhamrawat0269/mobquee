import React from "react";
import "./UIIndicatorStyle.css";
import indicatorWhite from "../../../../assets/uimockup/indicator_White.png";
import indicatorGray from "../../../../assets/uimockup/indicator_Gray.png";

export default function UIIndicator(props) {
  const uiData = props.data;

  // set values of 'StartIndicator' & 'StopIndicator' on the base of 'InitialState', needed for RTs.
  if (uiData.hasOwnProperty("InitialState")) {
    uiData["StartIndicator"] =
      uiData["InitialState"] === "start" ? true : false;
    uiData["StopIndicator"] = uiData["InitialState"] === "stop" ? true : false;
  }

  let uiMockup;
  if (uiData.Style === "Gray") {
    uiMockup = [
      <div key={uiData.name} className="media-layout">
        <img
          src={indicatorGray}
          alt="sound"
          className="ui-indicator-img-layout"
        />
      </div>,
    ];
  } else {
    uiMockup = [
      <div key={uiData.name} className="media-layout">
        <img
          src={indicatorWhite}
          alt="sound"
          className="ui-indicator-img-layout"
        />
      </div>,
    ];
  }

  return <div id="indicator">{uiMockup}</div>;
}
