import React from "react";
import "./UIImageButtonStyle.css";
import defaultImg from "../../../../assets/uimockup/defaultImage.png";

export default function UIImageButton(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;

  const borderWeight = parseInt(uiData.borderWeight);
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = uiData.cornerRadius ? uiData.cornerRadius : 0;

  const containerWidth = uiData.frame.width - 2 * borderWeight;
  const containerHeight = uiData.frame.height - 2 * borderWeight;

  const imageForeground = getImagePath(
    uiData.normalImage,
    appConfig.apiURL,
    appConfig.projectid
  );
  const imageBackgound = getImagePath(
    uiData.normalBackgroundImage,
    appConfig.apiURL,
    appConfig.projectid
  );

  let imgBtn = (
    <img
      src={defaultImg}
      alt="img"
      style={{
        width: containerWidth,
        height: containerHeight,
        display: "inline-block",
      }}
    />
  );
  if (imageForeground !== "") {
    imgBtn = (
      <img
        src={imageForeground}
        alt="img"
        style={{
          width: containerWidth,
          height: containerHeight,
          display: "inline-block",
        }}
      />
    );
  } else {
    if (
      imageBackgound !== "" &&
      imageBackgound.indexOf("defaultImage.png") === -1
    ) {
      imgBtn = (
        <img
          src={imageBackgound}
          alt="img"
          style={{
            width: containerWidth,
            height: containerHeight,
            display: "inline-block",
          }}
        />
      );
    }
  }

  return (
    <button
      id="imgbutton"
      disableRipple
      component="span"
      fullWidth={true}
      className="ui-image-btn"
      style={{
        borderWidth: `calc(${borderWeight}px)`,
        borderColor: borderColor,
        borderRadius: `calc(${borderRadius}px)`,
      }}
    >
      {imgBtn}
    </button>
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
        imageObj["fileext"] +
        "?ts=" +
        new Date().getTime()
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
