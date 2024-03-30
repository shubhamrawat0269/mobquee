import React from "react";
import "./UIActionButtonStyle.css";
import addButton from "../../../../assets/navigationbar/add.png";
import actionButton from "../../../../assets/navigationbar/action.png";
import bookmarkButton from "../../../../assets/navigationbar/bookmark.png";
import cameraButton from "../../../../assets/navigationbar/camera.png";
import composeButton from "../../../../assets/navigationbar/compose.png";
import forwardButton from "../../../../assets/navigationbar/fast-forward.png";
import organizeButton from "../../../../assets/navigationbar/organize.png";
import pauseButton from "../../../../assets/navigationbar/pause.png";
import playButton from "../../../../assets/navigationbar/play.png";
import refreshButton from "../../../../assets/navigationbar/refresh.png";
import replyButton from "../../../../assets/navigationbar/reply.png";
import rewindButton from "../../../../assets/navigationbar/rewind.png";
import searchButton from "../../../../assets/navigationbar/search.png";
import settingsButton from "../../../../assets/navigationbar/settings.png";
import stopButton from "../../../../assets/navigationbar/stop.png";
import trashButton from "../../../../assets/navigationbar/trash.png";
import { Button, Typography, SvgIcon } from "@mui/material";

export default function UIActionButton(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;

  const showElevation = uiData.showElevation ? true : false;
  let elevationVal = "0px 0px 0";
  if (showElevation) {
    elevationVal =
      "0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)";
  }



  if (!uiData.hasOwnProperty("floating")) {
    uiData["floating"] = false;
  }

  if (!uiData.hasOwnProperty("variant")) {
    uiData["variant"] = "";
    uiData["title"] = "";
    uiData["iconPosition"] = "start";
  }
  if (!uiData.hasOwnProperty("normalFont")) {
    uiData["normalFont"] = {
      fontName: "system",
      fontSize: 14,
      fontWeight: false,
      fontStyle: false,
      textAlignment: "center",
      textColor: { red: 0, blue: 0, green: 0, alpha: 1, colorName: "" },
      lineBreakMode: "TailTruncation",
    };
    uiData["verticalAlignment"] = "middle";
  }

  const fontWeight = uiData.normalFont.fontWeight ? "bold" : "normal";
  const fontStyle = uiData.normalFont.fontStyle ? "italic" : "normal";

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

  uiData.frame.height = size;
  let uiwidth = size;
  if (uiData.variant === "extended") {
    uiwidth = "100%";
  } else {
    uiData.frame.width = size;
  }

  const bgColor = getColorValue(uiData.backgroundColor);

  const actType = uiData.iconType;
  let actBtnMockup = getActionBtnImage(actType, size); 
  if(actType === "custom"){
    const customImage = (uiData.customImage !== "") ? getImagePath(uiData.customImage, appConfig.apiURL, appConfig.projectid) : "";
    actBtnMockup = <img className={classes.imgicon} src={customImage} alt="custom"></img>;
  }

  return (
    <div
      id="actionbutton"
      style={{
        width: uiwidth,
        height: size,
      }}
    >
      {uiData.variant === "" && (
        <div
          style={{
            minWidth: 5,
            minHeight: 5,
            width: size,
            height: size,
            backgroundColor: bgColor,
            color: "white",
            borderRadius: "50%",
            padding: 0,
            display: "flex",
            overflow: "auto",
            boxShadow: elevationVal,
          }}
        >
          {actBtnMockup}
        </div>
      )}
      {uiData.variant !== "" && (
        <div
          style={{
            minWidth: 5,
            minHeight: 5,
            width: "100%",
            height: size,
            borderRadius: 16,
            padding: 0,
            display: "flex",
            overflow: "hidden",
            backgroundColor: bgColor,
            boxShadow: elevationVal,
          }}
        >
          {actBtnMockup}
          <Typography
            style={{
              color: getColorValue(uiData["normalFont"]["textColor"]),
              fontSize: uiData["normalFont"]["fontSize"],
              fontWeight: fontWeight,
              fontStyle: fontStyle,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {uiData.title}
          </Typography>
        </div>
      )}
    </div>
  );
}

function getActionBtnImage(buttonType, size) {
  let actbtnMockup;

  switch (buttonType) {
    case "add":
      actbtnMockup = (
        <img className="App-logo" src={addButton} alt={buttonType}></img>
      );
      break;
    case "action":
      actbtnMockup = (
        <img className="App-logo" src={actionButton} alt={buttonType}></img>
      );
      break;
    case "back":
      actbtnMockup = (
        <SvgIcon
          style={{ fontSize: size, transform: "scale(0.5)" }}
          viewBox="-5 5 40 40"
        >
          <path
            d="M21.2 45.2 0 24 21.2 2.8l4 4.05L8.05 24 25.2 41.15Z"
            style={{ fill: "white" }}
          />
        </SvgIcon>
      );
      break;
    case "bookmark":
      actbtnMockup = (
        <img className="App-logo" src={bookmarkButton} alt={buttonType}></img>
      );
      break;
    case "camera":
      actbtnMockup = (
        <img className="App-logo" src={cameraButton} alt={buttonType}></img>
      );
      break;
    case "compose":
      actbtnMockup = (
        <img className="App-logo" src={composeButton} alt={buttonType}></img>
      );
      break;
    case "fast-forward":
      actbtnMockup = (
        <img className="App-logo" src={forwardButton} alt={buttonType}></img>
      );
      break;
    case "organize":
      actbtnMockup = (
        <img className="App-logo" src={organizeButton} alt={buttonType}></img>
      );
      break;
    case "pause":
      actbtnMockup = (
        <img className="App-logo" src={pauseButton} alt={buttonType}></img>
      );
      break;
    case "play":
      actbtnMockup = (
        <img className="App-logo" src={playButton} alt={buttonType}></img>
      );
      break;
    case "refresh":
      actbtnMockup = (
        <img className="App-logo" src={refreshButton} alt={buttonType}></img>
      );
      break;
    case "reply":
      actbtnMockup = (
        <img className="App-logo" src={replyButton} alt={buttonType}></img>
      );
      break;
    case "rewind":
      actbtnMockup = (
        <img className="App-logo" src={rewindButton} alt={buttonType}></img>
      );
      break;
    case "search":
      actbtnMockup = (
        <img className="App-logo" src={searchButton} alt={buttonType}></img>
      );
      break;
    case "settings":
      actbtnMockup = (
        <img className="App-logo" src={settingsButton} alt={buttonType}></img>
      );
      break;
    case "stop":
      actbtnMockup = (
        <img className="App-logo" src={stopButton} alt={buttonType}></img>
      );
      break;
    case "trash":
      actbtnMockup = (
        <img className="App-logo" src={trashButton} alt={buttonType}></img>
      );
      break;
    //
    default:
      actbtnMockup = (
        <button disableRipple style={{ minHeight: 32, textTransform: "none" }}>
          {buttonType}
        </button>
      );
      break;
  }

  return actbtnMockup;
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

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return (
    "rgba(" + _red + "," + _green + "," + _blue + "," + colorObj.alpha + ")"
  );
}
