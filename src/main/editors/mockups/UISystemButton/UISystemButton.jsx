import React from "react";
import "./UISystemButtonStyle.css";
import { Fab, SvgIcon } from "@mui/material";
import { Add, AddCircle } from "@mui/icons-material";
import infolightIcon from "../../../../assets/uimockup/system-infolight.png";
import infodarkIcon from "../../../../assets/uimockup/system-infodark.png";

export default function UISystemButton(props) {
  const uiData = props.data;
  const rotation = uiData.frame["rotation"]
    ? parseInt(uiData.frame.rotation)
    : 0;

  let btnMockup;

  const buttonType = uiData.buttonType;
  switch (buttonType) {
    case "add":
      btnMockup = [
        <Fab
          key="sysAdd"
          className="system-layout-icon"
          aria-label={buttonType}
        >
          <Add fontSize="large" />
        </Fab>,
      ];
      break;
    case "Detail":
      btnMockup = [
        <Fab
          key="sysDetail"
          className="system-layout-icon"
          aria-label={buttonType}
        >
          <SvgIcon>
            <path opacity=".87" fill="none" d="M24 24H0V0h24v24z" />
            <path d="M7.38 21.01c.49.49 1.28.49 1.77 0l8.31-8.31c.39-.39.39-1.02 0-1.41L9.15 2.98c-.49-.49-1.28-.49-1.77 0s-.49 1.28 0 1.77L14.62 12l-7.25 7.25c-.48.48-.48 1.28.01 1.76z" />
          </SvgIcon>
        </Fab>,
      ];
      break;
    case "InfoLight":
      btnMockup = [
        <img
          key="sysInfolight"
          src={infolightIcon}
          alt="img"
          className="system-layout-image-fit"
        />,
      ];
      break;
    case "InfoDark":
      btnMockup = [
        <img
          key="sysInfodark"
          src={infodarkIcon}
          alt="img"
          className="system-layout-image-fit"
        />,
      ];
      break;
    default:
      btnMockup = [
        <Fab
          key="sysDefault"
          className="system-layout-icon"
          aria-label={buttonType}
        >
          <AddCircle fontSize="large" />
        </Fab>,
      ];
      break;
  }

  return (
    <div
      id="system"
      style={{ transform: `rotate(${rotation}deg)` }}
      className="system-btn"
    >
      {btnMockup}
    </div>
  );
}
