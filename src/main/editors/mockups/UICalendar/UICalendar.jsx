import React from "react";
import "./UICalendarStyle.css";
import iconCalendar from "../../../../assets/uimockup/calendar-icon.png";
import { Button, Typography } from "@mui/material";

export default function UICalendar(props) {
  const uiData = props.data;
  uiData["userInteractionEnabled"] = true;
  if (!uiData.hasOwnProperty("cornerRadius")) {
    uiData["cornerRadius"] = 0;
  }
  if (!uiData.hasOwnProperty("padding")) {
    uiData["padding"] = { top: 2, right: 2, bottom: 2, left: 2 };
  }
  if (!uiData.hasOwnProperty("font")) {
    uiData["font"] = {
      fontName: "system",
      fontSize: 14,
      fontWeight: false,
      fontStyle: false,
      textAlignment: "left",
      textColor: { red: 0, blue: 0, green: 0, alpha: 1, colorName: "" },
      lineBreakMode: "WordWrap",
    };
  }
  if (!uiData.hasOwnProperty("verticalAlignment")) {
    uiData["verticalAlignment"] = "middle";
  }

  const today = new Date();
  if (uiData["minRange"] === "" || uiData["minRange"] === "0") {
    uiData["minRange"] = today.getFullYear() - 100 + "";
  }
  if (uiData["maxRange"] === "" || uiData["maxRange"] === "0") {
    uiData["maxRange"] = today.getFullYear() + 100 + "";
  }
  if (uiData.hasOwnProperty("type") && uiData["type"] === "Japanese") {
    uiData["minRange"] = setMinYear(uiData["jpYears"], uiData["minRange"]);
    uiData["maxRange"] = setMaxYear(uiData["jpYears"], uiData["maxRange"]);
  }
  //console.log("CALENDAR >>>> ", uiData);

  const containerWidth = parseInt(uiData.frame.width);
  const containerHeight = parseInt(uiData.frame.height);

  const borderWeight = parseInt(uiData.borderWeight);
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = uiData.cornerRadius ? parseInt(uiData.cornerRadius) : 0;

  const paddingTop = uiData.padding ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = uiData.padding ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = uiData.padding ? parseInt(uiData.padding.left) : 0;
  const paddingRight = uiData.padding ? parseInt(uiData.padding.right) : 0;
  const textHeight =
    containerHeight - (paddingTop + paddingBottom + 2 * borderWeight);
  let textWidth =
    containerWidth - (paddingLeft + paddingRight + 2 * borderWeight);

  const fontFamily = uiData.font ? uiData.font.fontName : "system";
  const fontSize = uiData.font ? parseInt(uiData.font.fontSize) : 0;
  let textColor = uiData.font ? getColorValue(uiData.font.textColor) : 0;
  const textAlign = uiData.font ? uiData.font.textAlignment : "left";
  const verticalAlign = uiData.verticalAlignment
    ? uiData.verticalAlignment
    : "middle";

  if (!uiData.hasOwnProperty("selectedDate")) {
    uiData["selectedDate"] = "";
  }
  let uiText = uiData.selectedDate;

  if (!uiData.hasOwnProperty("placeholder")) {
    uiData["placeholder"] = "";
  }
  if (!uiData.hasOwnProperty("placeholderColor")) {
    uiData["placeholderColor"] = {
      alpha: 1,
      red: 0.6,
      green: 0.6,
      blue: 0.6,
      colorName: "",
    };
  }
  const placeHolder = uiData.placeholder;
  if (placeHolder.length > 0 && uiText.length === 0) {
    uiText = placeHolder;
    textColor = getColorValue(uiData["placeholderColor"]);
  }

  if (!uiData.hasOwnProperty("setInputlabel")) {
    uiData["setInputlabel"] = uiData.placeholder.length > 0 ? true : false;
  }

  if (!uiData.hasOwnProperty("showElevation")) {
    uiData["showElevation"] = false;
  }
  const _variant = uiData["showElevation"] ? "contained" : "outlined";

  const uiIcon = uiData.showIcon ? "visible" : "hidden";
  const iconDisplay = uiData.showIcon ? "inline-block" : "none";
  if (uiData.showIcon) {
    textWidth = textWidth - 41;
  }

  return (
    <Button
      id="calendar"
      disableRipple
      variant={_variant}
      color="default"
      component="span"
      fullWidth={true}
      className="calendar-layout"
      style={{
        backgroundColor: getColorValue(uiData.backgroundColor),
        borderWidth: `calc(${borderWeight}px)`,
        borderColor: borderColor,
        borderRadius: borderRadius,
        textAlign: textAlign,
      }}
    >
      <Typography
        noWrap={true}
        style={{
          minWidth: 5,
          minHeight: 5,
          width: "100%",
          maxWidth: textWidth,
          height: textHeight,
          color: textColor,
          fontSize: `calc(${fontSize}px)`,
          paddingTop: `calc(${paddingTop}px)`,
          paddingBottom: `calc(${paddingBottom}px)`,
          paddingLeft: `calc(${paddingLeft}px)`,
          paddingRight: `calc(${paddingRight}px)`,
          display: "table-cell",
          verticalAlign: verticalAlign,
          textOverflow: "clip",
          fontFamily: fontFamily,
        }}
      >
        {uiText}
      </Typography>
      <img
        src={iconCalendar}
        alt="img"
        style={{
          visibility: uiIcon,
          display: iconDisplay,
          minWidth: 20,
          minHeight: 20,
          maxWidth: 32,
          maxHeight: "100%",
          padding: 4,
          //width: 40,
          height: `calc(${containerHeight - 8}px)`,
          verticalAlign: "middle",
          borderLeft: "1px solid rgb(222,222,222)",
        }}
      />
    </Button>
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

const jpYearRange = [
  { jp: "明治", en: "Meiji", min: "1900", max: "1912" },
  { jp: "大正", en: "Taisho", min: "1912", max: "1926" },
  { jp: "昭和", en: "Showa", min: "1926", max: "1989" },
  { jp: "平成", en: "Heisei", min: "1989", max: "2019" },
  { jp: "令和", en: "Reiwa", min: "2019", max: "__NOW__" },
  { jp: "西暦", en: "Custom", min: "", max: "" },
];

function setMinYear(jpYear, minRange) {
  jpYear = !jpYear ? "" : jpYear;

  var todate = new Date();
  var currentYear = todate.getFullYear();
  var minyear = (currentYear - 100).toString();

  if (jpYear !== "Custom") {
    var jpera = getJPEra(jpYear);
    if (jpera.length > 0) {
      var eraObject = jpera[0];
      if (eraObject["min"] !== "") {
        minRange = eraObject["min"];
        return eraObject["min"];
      }
    }
  } else {
    if (jpYear === "Gregorian" || jpYear === "Custom") {
      minRange = minyear;
    }
  }
  //console.log("setMinYear >> "+ jpYear +" .... "+ minRange);
  var _min = parseInt(minRange);
  if (isNaN(_min)) {
    return minRange;
  } else {
    if (_min.toString().length !== minRange.length) return minRange;
  }

  if (jpYear === "Gregorian" || jpYear === "Custom") return minyear;
  else {
    if (jpYear !== "") {
      for (var i = 0; i < jpYearRange.length; i++) {
        if (jpYearRange[i]["en"] === jpYear) {
          minRange = jpYearRange[i]["min"];
          return jpYearRange[i]["min"];
        }
      }
    }
  }

  return minyear;
}
function setMaxYear(jpYear, maxRange) {
  jpYear = !jpYear ? "" : jpYear;

  var todate = new Date();
  var currentYear = todate.getFullYear();
  var maxyear = (currentYear + 100).toString();

  if (jpYear !== "Custom") {
    var jpera = getJPEra(jpYear);
    if (jpera.length > 0) {
      var eraObject = jpera[0];
      if (eraObject["max"] === "") eraObject["max"] = maxyear;

      maxRange = eraObject["max"];
      return eraObject["max"];
    }
  } else {
    if (jpYear === "Gregorian" || jpYear === "Custom") {
      maxRange = maxyear;
    }
  }
  //console.log("setMaxYear >> "+ jpYear +" .... "+ maxRange);
  var _max = parseInt(maxRange);
  if (isNaN(_max)) {
    return maxRange;
  } else {
    if (_max.toString().length !== maxRange.length) return maxRange;
  }
  if (jpYear === "Gregorian" || jpYear === "Custom") return maxRange;
  else {
    if (jpYear !== "") {
      for (var i = 0; i < jpYearRange.length; i++) {
        if (jpYearRange[i]["en"] === jpYear) {
          if (jpYearRange[i]["max"] === "") break;

          maxRange = jpYearRange[i]["max"];
          return jpYearRange[i]["max"];
        }
      }
    }
  }

  return maxyear;
}
function getJPEra(eraname) {
  var jpEra = jpYearRange.filter(filterJPEras);
  function filterJPEras(era, index, arr) {
    if (era["en"] === eraname) {
      return true;
    } else return false;
  }
  return jpEra;
}
