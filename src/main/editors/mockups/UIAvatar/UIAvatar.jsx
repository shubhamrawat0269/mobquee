import React from "react";
import "./UIAvatarStyle.css";
import defaultImg from "../../../../assets/uimockup/defaultAvatar.png";
import { Avatar } from "@mui/material";

export default function UIAvatar(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;

  const type = uiData.type;
  let avatarText =
    uiData.avatarTxt && uiData.avatarTxt.length > 0
      ? uiData.avatarTxt.substring(0, 1).toUpperCase()
      : "A";

  let avatarImage = getImagePath(
    uiData.avatarSrc,
    appConfig.apiURL,
    appConfig.projectid
  );
  //console.log(avatarImage, "****************", defaultImg);
  if (avatarImage === "") {
    avatarImage = defaultImg;
  }

  let size = 40;
  if (uiData["size"]) {
    switch (uiData["size"]) {
      case "small":
        size = 32;
        break;
      case "medium":
        size = 40;
        break;
      case "large":
        size = 48;
        break;
      case "xlarge":
        size = 64;
        break;
      default:
        size = 40;
        break;
    }
  }
  // uiData.frame['width'] = uiData.frame['height'] = size;
  const fontSize = size === 32 ? 16 : size - 16;
  const radius = uiData.variant === "rounded" ? "50%" : 0;

  const bgColor = getColorValue(uiData.backgroundColor);

  return (
    <div id="iconbutton">
      {type === "Letter" && (
        <Avatar
          style={{
            width: size,
            height: size,
            backgroundColor: bgColor,
            borderRadius: radius,
            fontSize: fontSize,
          }}
          variant="rounded"
        >
          {avatarText}
        </Avatar>
      )}
      {type === "Image" && (
        <div
          style={{
            width: size,
            height: size,
            backgroundColor: bgColor,
            borderRadius: radius,
            fontSize: fontSize,
          }}
        >
          <img src={avatarImage} alt="img" />
        </div>
      )}
      {type === "Icon" && (
        <div
          style={{
            width: size,
            height: size,
            backgroundColor: bgColor,
            borderRadius: radius,
            fontSize: fontSize,
          }}
        >
          <img src={avatarImage} alt="icon" />
        </div>
      )}
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
