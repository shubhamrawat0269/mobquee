import React from "react";
import "./UIChartViewStyle.css";
import lineChart from "../../../../assets/uimockup/charts/line.png";
import curveChart from "../../../../assets/uimockup/charts/curve.png";
import barChart from "../../../../assets/uimockup/charts/bar.png";
import columnChart from "../../../../assets/uimockup/charts/column.png";
import areaChart from "../../../../assets/uimockup/charts/area.png";
import stackedbarChart from "../../../../assets/uimockup/charts/stacked_bar.png";
import stackedcolumnChart from "../../../../assets/uimockup/charts/stacked_column.png";
import stackedareaChart from "../../../../assets/uimockup/charts/stacked_area.png";
import bubbleChart from "../../../../assets/uimockup/charts/bubble.png";
import scatterChart from "../../../../assets/uimockup/charts/scatter.png";
import pieChart from "../../../../assets/uimockup/charts/pie.png";
import pie3dChart from "../../../../assets/uimockup/charts/pie3d.png";
import donutChart from "../../../../assets/uimockup/charts/donut.png";
import candlestickChart from "../../../../assets/uimockup/charts/candlestick.png";
import waterfallChart from "../../../../assets/uimockup/charts/waterfall.png";
import comboChart from "../../../../assets/uimockup/charts/combo.png";

import { Box, IconButton, Typography } from "@mui/material";
import { Fullscreen } from "@mui/icons-material";

export default function UIChartView(props) {
  const uiData = props.data;
  const titletext = uiData.chartTitle ? uiData.chartTitle : "";
  const displaytitle = titletext.length > 0 ? "flex" : "none";
  const subtitletext = uiData.subTitle ? uiData.subTitle : "";
  const displaySubtitle = subtitletext.length > 0 ? "flex" : "none";

  const containerX = uiData.frame.x;
  const containerY = uiData.frame.y;
  const containerWidth = parseInt(uiData.frame.width);
  const containerHeight = parseInt(uiData.frame.height);

  const paddingTop = uiData.padding ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = uiData.padding ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = uiData.padding ? parseInt(uiData.padding.left) : 0;
  const paddingRight = uiData.padding ? parseInt(uiData.padding.right) : 0;

  let chartW = containerWidth - (paddingLeft + paddingRight);
  let chartH = containerHeight - (paddingTop + paddingBottom);
  if (titletext.length > 0) chartH = chartH - 18;
  if (titletext.length > 0) chartH = chartH - 16;

  if (!uiData.hasOwnProperty("isStacked")) {
    uiData["isStacked"] = false;
  }
  if (!uiData.hasOwnProperty("isWaterfall")) {
    uiData["isWaterfall"] = false;
  }
  if (!uiData.hasOwnProperty("style")) {
    uiData["style"] = false;
  }
  if (!uiData.hasOwnProperty("annotation")) {
    uiData["annotation"] = false;
  }

  if (!uiData.hasOwnProperty("seriesType")) {
    uiData["seriesType"] = "bars";
  }
  if (!uiData.hasOwnProperty("seriesField")) {
    uiData["seriesField"] = "";
  }

  if (!uiData.hasOwnProperty("styleField")) {
    uiData["styleField"] = "";
  }
  if (!uiData.hasOwnProperty("annotationField")) {
    uiData["annotationField"] = "";
  }
  if (!uiData.hasOwnProperty("toggleFullScreen")) {
    uiData["toggleFullScreen"] = false;
  }

  let chartsrc = lineChart;
  switch (uiData.chartType) {
    case "Line":
      if (uiData.showCurve) chartsrc = curveChart;
      else chartsrc = lineChart;
      break;
    case "Bar":
      if (uiData.isStacked) chartsrc = stackedbarChart;
      else chartsrc = barChart;
      break;
    case "Column":
      if (uiData.isStacked) chartsrc = stackedcolumnChart;
      else chartsrc = columnChart;
      break;
    case "Area":
      if (uiData.isStacked) chartsrc = stackedareaChart;
      else chartsrc = areaChart;
      break;
    case "Bubble":
      chartsrc = bubbleChart;
      break;
    case "Scatter":
      chartsrc = scatterChart;
      break;
    case "Pie":
      if (uiData.is3D) chartsrc = pie3dChart;
      else chartsrc = pieChart;
      break;
    case "Donut":
      chartsrc = donutChart;
      break;
    case "CandleStick":
      if (uiData.isWaterfall) chartsrc = waterfallChart;
      else chartsrc = candlestickChart;
      break;
    case "Combo":
      chartsrc = comboChart;
      break;
    default:
      chartsrc = lineChart;
  }

  let legendW; // = containerWidth - (paddingLeft + paddingRight);
  let legendH; // = containerHeight - (paddingTop + paddingBottom);
  let displayLegends = "none";
  let areaDirection = "row";
  let legendDirection = "row";
  let legendGap = 0;
  if (uiData.showLegends) {
    displayLegends = "block";
    const legendPosition = uiData.showLegends ? uiData.legendPosition : "";
    if (legendPosition === "top" || legendPosition === "bottom") {
      legendH = 40;
      chartH = chartH - 40;
      areaDirection = legendPosition === "bottom" ? "column" : "column-reverse";
      legendGap = 32;
    } else {
      legendW = 80;
      chartW = chartW - 80;
      areaDirection = legendPosition === "right" ? "row" : "row-reverse";
      legendDirection = "column";
    }
  }

  const dummyLegends = [1, 2, 3];

  return (
    <Box
      id="chartview"
      style={{
        left: `calc(${containerX}px)`,
        top: `calc(${containerY}px)`,
        width: `calc(${containerWidth}px)`,
        height: `calc(${containerHeight}px)`,
        backgroundColor: getColorValue(uiData.backgroundColor),
        borderWidth: `calc(${uiData.borderWeight}px)`,
        borderStyle: "solid",
        borderColor: getColorValue(uiData.borderColor),
        paddingTop: `calc(${paddingTop}px)`,
        paddingBottom: `calc(${paddingBottom}px)`,
        paddingLeft: `calc(${paddingLeft}px)`,
        paddingRight: `calc(${paddingRight}px)`,
        boxSizing: "border-box",
      }}
    >
      {uiData["toggleFullScreen"] && (
        <IconButton
          edge="end"
          color="inherit"
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            padding: 0,
            margin: 0,
            //visibility: uiData["toggleFullScreen"] ? "visible" : "hidden",
          }}
        >
          <Fullscreen />
        </IconButton>
      )}
      <Typography
        style={{ display: displaytitle }}
        className="chart-view-heading"
      >
        {titletext}
      </Typography>
      <Typography
        style={{ display: displaySubtitle }}
        className="chart-view-subheading"
      >
        {subtitletext}
      </Typography>
      <div
        id="chartarea"
        style={{ flexDirection: areaDirection }}
        className="chart-area"
      >
        <div
          id="chartdiv"
          style={{
            width: chartW,
            height: chartH,
            padding: 5,
            boxSizing: "border-box",
          }}
        >
          <img
            src={chartsrc}
            alt={uiData.chartType}
            className="ui-chart-fill"
          />
        </div>
        <div
          id="legenddiv"
          style={{
            display: displayLegends,
            width: legendW,
            height: legendH,
          }}
        >
          <ul
            id="legendlist"
            style={{
              "padding-inline-start": 24,
              "list-style-type": "square",
              display: "flex",
              flexDirection: legendDirection,
            }}
          >
            {dummyLegends.map((legend, index) => (
              <li key={index} style={{ fontSize: 12, marginRight: legendGap }}>
                Legend {legend}
              </li>
            ))}
          </ul>
        </div>
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
