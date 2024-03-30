import React from "react";
import "./ButtonViewStyle.css";
import UITextButton from "../UITextButton/UITextButton";
import UIRoundButton from "../UIRoundButton/UIRoundButton";
import UIImageButton from "../UIImageButton/UIImageButton";
import UIRadioButton from "../UIRadioButton/UIRadioButton";
import UISystemButton from "../UISystemButton/UISystemButton";
import UIToggleButton from "../UIToggleButton/UIToggleButton";
import UIIConButton from "../UIIconButton/UIIconButton";
import UIActionButton from "../UIActionButton/UIActionButton";

export default function ButtonView(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;

  const uititle = uiData.title ? uiData.title : "";

  /* const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);  
  let borderRadius = 0;
  if(uiData.buttonType === 'Round'){
    borderRadius = 12;
  }else if(uiData.buttonType === 'Text'){ 
    borderRadius = (uiData.cornerRadius) ? uiData.cornerRadius : 0;
  } */

  if (!uiData.hasOwnProperty("enableRipple")) uiData["enableRipple"] = false;
  if (!uiData.hasOwnProperty("showElevation")) uiData["showElevation"] = false;
  const showElevation = uiData.showElevation ? true : false;
  let elevationVal = "0px 0px 0";
  if (showElevation) {
    elevationVal =
      "0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)";
  }
  if(uiData.buttonType === "Action"){
    elevationVal = "0px 0px 0";
  }

  const paddingTop = uiData.padding ? uiData.padding.top : 0;
  const paddingBottom = uiData.padding ? uiData.padding.bottom : 0;
  const paddingLeft = uiData.padding ? uiData.padding.left : 0;
  const paddingRight = uiData.padding ? uiData.padding.right : 0;

  const fontSize = uiData.normalFont ? uiData.normalFont.fontSize : 0;
  const textColor = uiData.normalFont
    ? getColorValue(uiData.normalFont.textColor)
    : 0;
  //const textAlign = (uiData.normalFont) ? uiData.normalFont.textAlignment : 'center';

  let btnMockup;
  const buttonType = uiData.buttonType;
  switch (buttonType) {
    case "Round":
      btnMockup = (
        <UIRoundButton data={uiData} containerWidth={props.containerWidth} />
      );
      break;
    case "Text":
      btnMockup = (
        <UITextButton
          data={uiData}
          appconfig={appConfig}
          containerWidth={props.containerWidth}
        />
      );
      break;
    case "Image":
      btnMockup = (
        <UIImageButton
          data={uiData}
          appconfig={appConfig}
          containerWidth={props.containerWidth}
        />
      );
      break;
    case "Icon":
      btnMockup = (
        <UIIConButton
          data={uiData}
          appconfig={appConfig}
          containerWidth={props.containerWidth}
        />
      );
      break;
    /* case "CheckBox":
      btnMockup = <UICheckBox data={uiData} appconfig={appConfig}/>;
      break; */
    /* case "Segment":
      btnMockup = <UISegment data={uiData} appconfig={appConfig}/>;
      break; */
    case "Radio":
      btnMockup = (
        <UIRadioButton
          data={uiData}
          appconfig={appConfig}
          containerWidth={props.containerWidth}
        />
      );
      break;
    case "Toggle":
      btnMockup = (
        <UIToggleButton
          data={uiData}
          appconfig={appConfig}
          containerWidth={props.containerWidth}
        />
      );
      break;
    /* case "Switch":
      btnMockup = <UISwitch data={uiData}/>;
      break; */
    case "Action":
      btnMockup = (
        <UIActionButton
          data={uiData}
          appconfig={appConfig}
          containerWidth={props.containerWidth}
        />
      );
      break;
    case "add":
    case "Detail":
    case "InfoDark":
    case "InfoLight":
    case "System":
      btnMockup = (
        <UISystemButton data={uiData} containerWidth={props.containerWidth} />
      );
      break;

    default:
      btnMockup = (
        <button
          disableRipple
          component="span"
          fullWidth={true}
        >
          {uititle}
        </button>
      );
      break;
  }

  return <div id="buttonview">{btnMockup}</div>;
}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return (
    "rgba(" + _red + "," + _green + "," + _blue + "," + colorObj.alpha + ")"
  );
}
