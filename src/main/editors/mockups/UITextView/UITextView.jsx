import React from "react";
import "./UITextViewStyle.css";

export default function UITextView(props) {
  const uiData = props.data;
  var uiText = uiData.text ? uiData.text : "";

  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = uiData.cornerRadius ? parseInt(uiData.cornerRadius) : 0;

  const paddingTop = uiData.padding ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = uiData.padding ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = uiData.padding ? parseInt(uiData.padding.left) : 0;
  const paddingRight = uiData.padding ? parseInt(uiData.padding.right) : 0;
  const textWidth =
    uiData.frame.width - (paddingLeft + paddingRight + 2 * borderWeight);
  const textHeight =
    uiData.frame.height - (paddingTop + paddingBottom + 2 * borderWeight);

  //const fontFamily = (uiData.font) ? uiData.font.fontName : 'system';
  const fontSize = uiData.font ? uiData.font.fontSize : 0;
  const fontWeight = uiData.font.fontWeight ? "bold" : "normal";
  const fontStyle = uiData.font.fontStyle ? "italic" : "normal";
  let textColor = uiData.font ? getColorValue(uiData.font.textColor) : 0;
  const textAlign = uiData.font ? uiData.font.textAlignment : "left";
  const verticalAlign = uiData.verticalAlignment
    ? uiData.verticalAlignment
    : "top";
  let itemAlign = "start";
  if (verticalAlign === "top") itemAlign = "start";
  else if (verticalAlign === "middle") itemAlign = "center";
  else if (verticalAlign === "bottom") itemAlign = "end";

  let textDecoration = "none";
  if (uiData["underline"] && uiData["strikeout"])
    textDecoration = "line-through underline";
  else if (uiData["underline"]) textDecoration = "underline";
  else if (uiData["strikeout"]) textDecoration = "line-through";

  let textTransform = "none";
  if (uiData["autocapitalizationType"] === "Words")
    textTransform = "capitalize";
  else if (uiData["autocapitalizationType"] === "AllCharacters")
    textTransform = "uppercase";
  else if (uiData["autocapitalizationType"] === "Sentences") {
    textTransform = "none";
    let _text = "";

    uiText = uiText.toString().toLowerCase();
    let arrSentence = uiText.split(".");
    for (let i = 0; i < arrSentence.length; i++) {
      let sentence = arrSentence[i];
      _text +=
        sentence.charAt(0).toUpperCase() + sentence.substr(1).toLowerCase();
    }
    uiText = _text;
  }

  if (uiData["trim"]) {
    uiText.trim();
  }

  const placeHolder = uiData.placeholder;
  if (!placeHolder) {
    uiData.placeholder = "";
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
  if (placeHolder && placeHolder.length > 0 && uiText.length === 0) {
    uiText = placeHolder;
    textColor = getColorValue(uiData["placeholderColor"]);
  }
  if (!uiData.hasOwnProperty("setInputlabel")) {
    uiData["setInputlabel"] = uiData.placeholder.length > 0 ? true : false;
  }
  if (!uiData.hasOwnProperty("onfocusBackgroundColor")) {
    uiData["onfocusBackgroundColor"] = uiData.backgroundColor;
  }
  if (!uiData.hasOwnProperty("onfocusBorderColor")) {
    uiData["onfocusBorderColor"] = uiData.borderColor;
  }
  if (!uiData.hasOwnProperty("boxShadow")) {
    uiData["boxShadow"] = false;
    uiData["boxShadowWidth"] = 4;
    uiData["boxShadowColor"] = {
      alpha: 1,
      red: 0.870588,
      green: 0.870588,
      blue: 0.870588,
      colorName: "",
    };
  }
  const boxShadowWidth = parseInt(uiData["boxShadowWidth"]);
  const boxShadowColor = getColorValue(uiData["boxShadowColor"]);
  const boxShadow = uiData["boxShadow"]
    ? "0px " + boxShadowWidth + "px " + boxShadowColor
    : 0;

  return (
    <div
      id="textview"
      style={{
        backgroundColor: getColorValue(uiData.backgroundColor),
        borderWidth: `calc(${borderWeight}px)`,
        borderColor: borderColor,
        borderRadius: `calc(${borderRadius}px)`,
        paddingTop: `calc(${paddingTop}px)`,
        paddingBottom: `calc(${paddingBottom}px)`,
        paddingLeft: `calc(${paddingLeft}px)`,
        paddingRight: `calc(${paddingRight}px)`,
        textAlign: textAlign,
        boxShadow: boxShadow,
      }}
      className="ui-text-view-layout"
    >
      {/* <TextView
        value={uiText}
        style={{ display: "none", caretColor: "transparent" }}
        multiline
        rows={1}
        className={classes.uitext}
      /> */}
      <div
        id="contentedit"
        className="ui-text-view"
        // style={{ whiteSpace: "break-spaces", display: "grid" }}
        style={{
          width: `calc(${textWidth}px)`,
          height: `calc(${textHeight}px)`,
          color: textColor,
          fontSize: `calc(${fontSize}px)`,
          fontWeight: fontWeight,
          fontStyle: fontStyle,
          textDecoration: textDecoration,
          textTransform: textTransform,
          display: "flex",
          alignItems: itemAlign,
          overflow: "hidden",
        }}
        contentEditable="false"
        suppressContentEditableWarning
      >
        {uiText}
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
