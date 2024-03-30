import React from "react";
import "./SplitViewStyle.css";
import { Paper, Typography } from "@mui/material";
import PageLayoutEditor from "../../PageLayoutEditor/pageLayoutEditor";

export default function SplitView(props) {
  const appConfig = props.appconfig;
  const pagelist = props.pagelist;
  const scrIndex = props.screenIndex ? props.screenIndex : 0;
  const pagedata = props.data;

  let childPagesTop = 0;
  if (!pagedata.StatusBarHidden) childPagesTop += 20;
  if (!pagedata.NavigationBarHidden) childPagesTop += 44;
  if (!pagedata._toolBarTop[scrIndex].hidden)
    childPagesTop += parseInt(pagedata._toolBarTop[scrIndex].frame.height);

  let splitpages = pagedata["pages"];

  return (
    <div
      id="splitview"
      style={{
        backgroundColor: getColorValue(pagedata.backgroundColor),
        top: childPagesTop,
      }}
      className="split-view"
    >
      {splitpages.map((page) => (
        <SplitChild
          key={page.id}
          data={page}
          pagelist={pagelist}
          appconfig={appConfig}
          screenIndex={scrIndex}
        />
      ))}
    </div>
  );
}

function SplitChild(props) {
  const appConfig = props.appconfig;
  const pageList = props.pagelist;
  const childPage = props.data;
  const scrIndex = props.screenIndex;

  const childDef = childPage["pagedef"];
  let childpageId =
    childDef.filename.length > 0 ? childDef.filename.replace("page_", "") : "";
  let childPageDef;
  if (childpageId.length > 0) {
    childPageDef = pageList.filter(function (_page) {
      return _page["pageid"] === childpageId;
    });
  }

  let pageBGColor = { red: 1, green: 1, blue: 1, alpha: 1, colorName: "" };
  if (childPageDef && childPageDef.length > 0) {
    pageBGColor = childPageDef[0].backgroundColor;
  }

  let pageframe = childPage._screenFrames[scrIndex]
    ? childPage._screenFrames[scrIndex]
    : childPage.frame;

  function doubleClickHandler() {
    console.log("doubleClickHandler >>>", childpageId);
  }

  return (
    <Paper
      className="split-inner-container"
      style={{
        top: pageframe.y,
        left: pageframe.x,
        width: pageframe.width,
        height: pageframe.height,
        backgroundColor: getColorValue(pageBGColor),
      }}
      draggable={false}
      onDoubleClick={doubleClickHandler}
    >
      {!childPageDef && (
        <Typography className="splt-inner-frame">id: {childPage.id}</Typography>
      )}
      {childPageDef && (
        <PageLayoutEditor
          show={true}
          data={childPageDef[0]}
          appconfig={appConfig}
          screenIndex={scrIndex}
          haveContainerView={true}
        />
      )}
    </Paper>
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
