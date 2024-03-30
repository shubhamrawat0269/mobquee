import React, { useEffect, useState } from "react";
import "./UIGridStyle.css";
import { getColorValue } from "../../../../utils/utilsFunctions";
import { ImageList, ImageListItem, List } from "@mui/material";
import UIContainer from "../../UIContainer/UIContainer";
import { connect } from "react-redux";
// import UIContainer from "../../UIContainer/UIContainer";

const UIGrid = (props) => {
  const appConfig = props.appconfig;
  const scrIndex = props.currentScreenIndex;
  const uiData = props.data;
  const gridItems = uiData.gridItems[0];
  // new Properties addded by shubham Dev =====
  const flowDirection = uiData.direction;
  const rowSpacing = uiData.rowSpacing;
  const colSpacing = uiData.columnSpacing;

  // new Properties addded by shubham Dev =====

  const paddingTop = uiData.padding ? uiData.padding.top : 0;
  const paddingBottom = uiData.padding ? uiData.padding.bottom : 0;
  const paddingLeft = uiData.padding ? uiData.padding.left : 0;
  const paddingRight = uiData.padding ? uiData.padding.right : 0;

  const itemColumns = parseInt(gridItems.columns);
  // const itemRows = parseInt(dataArray.rows);
  // const itemGap = itemRows > 1 || itemColumns > 1 ? parseInt(dataArray.gap) : 0;
  // let displayHnext =
  //   uiData.shownext && uiData.direction === "Horizontal" ? true : false;
  // let nextItemWid = displayHnext ? 10 + itemGap : 0;
  // let displayVnext =
  //   uiData.shownext && uiData.direction === "Vertical" ? true : false;
  // let nextItemHie = displayVnext ? 10 + itemGap : 0;

  // const containerWidth = uiData.frame.width - (paddingLeft + paddingRight) + 1;
  // const containerHeight =
  //   uiData.frame.height - (paddingTop + paddingBottom) + 1;

  // let pagingHeight = uiData.paging ? 10 : 0;
  // if (uiData.direction === "Vertical") {
  //   pagingHeight = 0;
  // }

  // const itemHeight =
  //   (containerHeight - nextItemHie - pagingHeight - (itemRows - 1) * itemGap) /
  //   itemRows;
  // const itemWidth =
  //   (containerWidth - nextItemWid - (itemColumns - 1) * itemGap) / itemColumns;

  // dataArray["height"] = itemHeight;
  // dataArray["width"] = itemWidth;

  let tileListData = [];
  const itemArray = gridItems["columnList"][0]["Fields"]
    ? gridItems["columnList"][0]["Fields"]
    : [];
  if (itemArray.length > 0) {
    let tileData = new Array(itemColumns).fill(itemArray);
    for (let i = 0; i < uiData.gridItems.length; i++) {
      tileListData.push(tileData);
    }
  }

  return (
    // <div
    //   className="ui-grid-container"
    //   style={{
    //     backgroundColor: getColorValue(uiData.backgroundColor),
    //     // paddingTop: `calc(${paddingTop}px)`,
    //     // paddingBottom: `calc(${paddingBottom}px)`,
    //     // paddingLeft: `calc(${paddingLeft}px)`,
    //     // paddingRight: `calc(${paddingRight}px)`,
    //   }}
    // >
    <List
      component="nav"
      dense={true}
      // className="tile-list-container"
      style={{
        // width: containerWidth,
        // height: `calc(${containerHeight - pagingHeight}px)`,
        padding: 0,
        // backgroundColor: getColorValue(uiData.backgroundColor),
        border: "1.5px solid",
        height: "100%",
        overflow: "auto",
      }}
    >
      {/* {console.log(props.addedRowsList)} */}
      {props.addedRowsList.map((cell) => {
        return (
          <div
            style={{
              display: "flex",
              width: "100%",
              height: cell.height,
              border: "1.5px dotted red",
              borderTop: "none",
            }}
            key={cell.id}
          >
            {tileListData.map((listData, id) => (
              <div
                key={id}
                // cellHeight={itemHeight}
                // cols={itemColumns}
                // className="tile-item-layout"
                style={{
                  margin: 0,
                  postion: "absolute",
                  // height: `calc(${itemHeight}px)`,
                }}
              >
                {/* {console.log(listData)} */}
                {cell["Fields"].map((item, index) => (
                  <div
                    key={index}
                    // cols={1}
                    // rows={1}
                    // style={{ height: "100%", width: itemWidth }}
                    style={{ height: "100%" }}
                  >
                    {/* {console.log(item)} */}
                    <UIContainer
                      appconfig={appConfig}
                      data={cell["Fields"]}
                      pagedata={props.pagedata}
                      screenIndex={scrIndex}
                    />
                  </div>
                ))}
              </div>
            ))}
            {/* {cell.columnList.map((cur) => {
              return (
                <div
                  key={cur.id}
                  style={{
                    width: `${cur.width}%`,
                    height: cell.height,
                    borderTop: "none",
                    borderLeft: "none",
                    borderBottom: "none",
                    borderRight: "1.5px solid orange",
                  }}
                ></div>
              );
            })} */}
          </div>
        );
      })}
    </List>
  );
};

function mapStateToProps(state) {
  // console.log(state.appParam.addedRowsList);
  return {
    // addedRowsList: state.appParam.addedRowsList,
    selectedTab: state.selectedData.selectedTab,
  };
}

export default connect(mapStateToProps)(UIGrid);
