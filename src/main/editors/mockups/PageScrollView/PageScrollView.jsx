import React from "react";
import "./PageScrollViewStyle.css";
import { Paper, Typography } from "@mui/material";
import PageLayoutEditor from "../../PageLayoutEditor/PageLayoutEditor";

export default function PageScrollView(props) {
  const appConfig = props.appconfig;
  const pagelist = props.pagelist;
  const scrIndex = props.screenIndex ? props.screenIndex : 0;
  const pagedata = props.data;
  let childPagesTop = 0;
  if (!pagedata.StatusBarHidden) childPagesTop += 20;
  if (!pagedata.NavigationBarHidden) childPagesTop += 44;
  if (!pagedata._toolBarTop[scrIndex].hidden)
    childPagesTop += parseInt(pagedata._toolBarTop[scrIndex].frame.height);

  let pagescrollpages = pagedata.Children[0]["pages"];

  return (
    <div id="pagescrollview" className="page-scroll-view">
      {pagescrollpages.map((page, index) => (
        <PageScrollChild
          key={index}
          pos={index}
          data={page}
          pagelist={pagelist}
          appconfig={appConfig}
          screenIndex={scrIndex}
        />
      ))}
    </div>
  );
}

function PageScrollChild(props) {
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

  let childWid = 0;
  let leftShift = 0;
  let pageBGColor = { red: 1, green: 1, blue: 1, alpha: 1, colorName: "" };
  if (childPageDef && childPageDef.length > 0) {
    //console.log(childpageId, ".. PageScrollChild >>>> ", childPageDef[0]);
    childWid = childPageDef[0].frame.width;
    leftShift = childPageDef[0].frame.width * props.pos;
    pageBGColor = childPageDef[0].backgroundColor;
  }

  function doubleClickHandler() {
    console.log("doubleClickHandler >>>", childpageId);
  }

  return (
    <Paper
      className="page-scroll-center-container"
      draggable={false}
      onDoubleClick={doubleClickHandler}
    >
      {!childPageDef && <Typography>{childPage.id}</Typography>}
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
