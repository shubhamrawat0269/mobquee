import React from "react";
import "./TableViewStyle.css";
import { Box, Typography, Paper, IconButton, Fab } from "@mui/material";
import AccessoryButton from "../../../../assets/pagetype/button.png";
import accHeaderIcon from "../../../../assets/accheader.png";
import UIContainer from "../../UIContainer/UIContainer";
import { ExpandMore, NavigateNext } from "@mui/icons-material";

export default function TableView(props) {
  const appConfig = props.appconfig;
  const pagedata = props.data;

  const tablestyle = pagedata.TableStyle;
  const cellstyle = pagedata._tmpCellStyle;

  const isAccordion = pagedata.isAccordian ? pagedata.isAccordian : false;
  const accHeaderHeight = pagedata.accHeaderHeight
    ? pagedata.accHeaderHeight
    : 32;
  const accHeaderBGColor = pagedata.accHeaderBGColor
    ? pagedata.accHeaderBGColor
    : { alpha: 1, red: 1, green: 1, blue: 1, colorName: "" };
  const accHeaderTextColor = pagedata.accHeaderTextColor
    ? pagedata.accHeaderTextColor
    : { alpha: 1, red: 1, green: 1, blue: 1, colorName: "" };
  const accHeaderIconPosition = pagedata.accHeaderIconPosition
    ? pagedata.accHeaderIconPosition
    : "left";
  if (!pagedata.hasOwnProperty("accHeaderIconOpen")) {
    pagedata["accHeaderIconOpen"] = {
      srcLocation: "bundle",
      filename: "",
      fileext: "",
      url: "",
    };
  }
  //const accHeaderIconOpen = getIconPath(pagedata.accHeaderIconOpen, appConfig.apiURL, appConfig.projectid);
  if (!pagedata.hasOwnProperty("accHeaderIconClose")) {
    pagedata["accHeaderIconClose"] = {
      srcLocation: "bundle",
      filename: "",
      fileext: "",
      url: "",
    };
  }
  const accHeaderIconClose = getIconPath(
    pagedata.accHeaderIconClose,
    appConfig.apiURL,
    appConfig.projectid
  );
  let isAccHeaderIcon = false;
  if (isAccordion && pagedata.accHeaderIconClose.filename.length > 0) {
    //console.log(isAccordion, "TableView accordion >>>> ", accHeaderIconClose);
    isAccHeaderIcon = true;
  }
  const accHeaderBorderWeight = pagedata.accHeaderBorderWeight
    ? pagedata.accHeaderBorderWeight
    : 1;

  const groupdata = pagedata.Group;
  if (pagedata["viewType"].indexOf("TableViewList") > 0) {
    const groupObj = groupdata[0];
    if (!groupObj.hasOwnProperty("ServiceName")) {
      groupObj["ServiceName"] = "";
    }
  }
  if (!pagedata.hasOwnProperty("showDivider")) pagedata["showDivider"] = true;

  //putting below check for Sampoorna project for now, that need to be remove later
  if (appConfig.apiURL.indexOf("tslsampoorna") > -1) {
    pagedata["showDivider"] = false;
    pagedata.Group[0].RecordCellDef.backgroundColor["alpha"] = 0;
    pagedata.Group[0].rowarray[0].backgroundColor["alpha"] = 0;
  }

  const cellBorderWeight = pagedata["showDivider"] ? 1 : 0;

  const isScrollButtons = pagedata["showScrollButtons"];

  let setMultiColumn = false;
  const screenObj = props["screenObj"];
  if (screenObj["width"] > 999 && screenObj["height"] >= 768) {
    //console.log(".. seems desktop screen ..");
    setMultiColumn = pagedata["showMultiColumn"];
  } else {
    if (pagedata["showMultiColumn"]) {
      console.log(
        ".. Multiple columns not supported for non desktop screen .."
      );
    }
  }
  const columnGap = parseInt(pagedata.columnGap);

  return (
    <Box id="tableview">
      {groupdata.map((group, index) => (
        <div id="tablegroup" key={index}>
          {isAccordion && accHeaderIconPosition === "left" && (
            <Box
              className="table-view-header"
              style={{
                backgroundColor: getColorValue(accHeaderBGColor),
                borderWidth: `calc(${accHeaderBorderWeight}px)`,
              }}
            >
              {!isAccHeaderIcon && (
                <img
                  src={accHeaderIcon}
                  alt="accheaderright"
                  style={{
                    padding: 4,
                    width: accHeaderHeight - 8 + "px",
                  }}
                />
              )}
              {isAccHeaderIcon && (
                <img
                  src={accHeaderIconClose}
                  alt="accheaderright"
                  style={{
                    padding: 4,
                    width: accHeaderHeight - 8 + "px",
                  }}
                />
              )}
              <Typography
                variant="subtitle2"
                style={{
                  color: getColorValue(accHeaderTextColor),
                  fontWeight: theme.typography.fontWeightBold,
                }}
                className="table-view-header-left"
              >
                {group.Groupby}
              </Typography>
            </Box>
          )}
          {isAccordion && accHeaderIconPosition === "right" && (
            <Box
              className="table-view-header"
              style={{
                backgroundColor: getColorValue(accHeaderBGColor),
                borderWidth: `calc(${accHeaderBorderWeight}px)`,
              }}
            >
              <Typography
                variant="subtitle2"
                className="table-view-header-right"
              >
                {group.Groupby}
              </Typography>
              {!isAccHeaderIcon && (
                <img
                  src={accHeaderIcon}
                  alt="accheaderright"
                  style={{
                    padding: 4,
                    width: accHeaderHeight - 8 + "px",
                  }}
                />
              )}
              {isAccHeaderIcon && (
                <img
                  src={accHeaderIconClose}
                  alt="accheaderright"
                  style={{
                    padding: 4,
                    width: accHeaderHeight - 8 + "px",
                  }}
                />
              )}
            </Box>
          )}
          {!isAccordion && (
            <Typography variant="subtitle2" className="table-view-heading">
              {group.Title}
            </Typography>
          )}
          {tablestyle === "Plain" && (
            <div>
              {setMultiColumn && (
                <div className="flex-div">
                  {getColumnData(pagedata.columnCount).map((column, colId) => (
                    <Paper
                      key={colId}
                      id="plain"
                      square={true}
                      elevation={0}
                      className="plain-multi-col"
                      style={{
                        marginLeft: colId === 0 ? 0 : columnGap,
                        border: `calc(${cellBorderWeight}px) solid`,
                      }}
                    >
                      {groupRowsData(group, props.screenIndex).map(
                        (cell, cellid) => (
                          <TableCell
                            key={cellid}
                            stylename={cellstyle}
                            appconfig={appConfig}
                            pagedata={props.pagedata}
                            data={cell}
                            groupdata={group}
                            screenIndex={props.screenIndex}
                            screenData={props.screenObj}
                            editorState={props.editorState}
                          />
                        )
                      )}
                    </Paper>
                  ))}
                </div>
              )}
              {!setMultiColumn && (
                <Paper
                  id="plain"
                  square={true}
                  elevation={0}
                  style={{
                    borderTop: `calc(${cellBorderWeight}px) solid`,
                    borderBottom: `calc(${cellBorderWeight}px) solid`,
                    boxSizing: "border-box",
                    backgroundColor: "rgba(1,1,1,0)",
                  }}
                >
                  {groupRowsData(group, props.screenIndex).map(
                    (cell, cellid) => (
                      <TableCell
                        key={cellid}
                        stylename={cellstyle}
                        appconfig={appConfig}
                        pagedata={props.pagedata}
                        data={cell}
                        groupdata={group}
                        screenIndex={props.screenIndex}
                        screenData={props.screenObj}
                        editorState={props.editorState}
                      />
                    )
                  )}
                </Paper>
              )}
            </div>
          )}
          {tablestyle !== "Plain" && (
            <div>
              {setMultiColumn && (
                <div className="flex-div">
                  {getColumnData(pagedata.columnCount).map((column, colId) => (
                    <Paper
                      key={colId}
                      id="grouped"
                      elevation={3}
                      className="grouped-multi-col"
                      style={{
                        marginLeft: colId === 0 ? 0 : columnGap,
                        border: `calc(${cellBorderWeight}px) solid`,
                      }}
                    >
                      {groupRowsData(group, props.screenIndex).map(
                        (cell, cellid) => (
                          <TableCell
                            key={cellid}
                            stylename={cellstyle}
                            appconfig={appConfig}
                            pagedata={props.pagedata}
                            data={cell}
                            groupdata={group}
                            screenIndex={props.screenIndex}
                            screenData={props.screenObj}
                            editorState={props.editorState}
                          />
                        )
                      )}
                    </Paper>
                  ))}
                </div>
              )}
              {!setMultiColumn && (
                <Paper
                  id="grouped"
                  elevation={3}
                  style={{
                    border: `calc(${cellBorderWeight}px) solid`,
                    borderRadius: 4,
                    boxSizing: "border-box",
                    backgroundColor: "rgba(1,1,1,0)",
                  }}
                >
                  {groupRowsData(group, props.screenIndex).map(
                    (cell, cellid) => (
                      <TableCell
                        key={cellid}
                        stylename={cellstyle}
                        appconfig={appConfig}
                        pagedata={props.pagedata}
                        data={cell}
                        groupdata={group}
                        screenIndex={props.screenIndex}
                        screenData={props.screenObj}
                        editorState={props.editorState}
                      />
                    )
                  )}
                </Paper>
              )}
            </div>
          )}
          <Typography variant="body2" className="table-view-footer">
            {group.Footer}
          </Typography>
          {isScrollButtons && (
            <div className="scrol-btn-content">
              <Fab
                color="default"
                size="small"
                variant="extended"
                style={{
                  backgroundColor: getColorValue(
                    pagedata["scrollButtonsBGColor"]
                  ),
                  color: getColorValue(pagedata["scrollButtonsTextColor"]),
                  textTransform: "none",
                }}
              >
                Scroll Buttons
              </Fab>
            </div>
          )}
        </div>
      ))}
    </Box>
  );
}

function groupRowsData(group, scrIndex) {
  let recordArr = [];
  recordArr.push(group.RecordCellDef);
  return recordArr;
}

function getColumnData(columnCount) {
  let colArr = Array.from("C".repeat(parseInt(columnCount)));
  return colArr;
}

function TableCell(props) {
  const appConfig = props.appconfig;
  const celldata = props.data;
  const cellstyle = props.stylename;
  //console.log(cellstyle, "TableView cell >>>> ", celldata);

  let cellbgColor = celldata.alternatingRowStyle
    ? celldata.alternatingRowColors1
    : celldata.backgroundColor;

  const accessoryType = celldata["editingAccessoryType"];
  let showAccessory = accessoryType === "none" ? false : true;

  let showCollapsible = false;
  let collapsibleHeight = 0;
  if (props.pagedata["viewType"] === "DbTableViewNestedList") {
    const subCellDef = props.groupdata["SubRecordCellDef"];
    if (subCellDef) {
      showCollapsible = true;
      showAccessory = false;
      collapsibleHeight = subCellDef.height ? subCellDef.height : 50;
    }
  }

  let cellMockup;
  switch (cellstyle) {
    case "contact-form":
      cellMockup = (
        <ContactformCell data={celldata} groupdata={props.groupdata} />
      );
      break;
    case "default":
      cellMockup = <DefaultCell data={celldata} groupdata={props.groupdata} />;
      break;
    case "right-aligned":
      cellMockup = (
        <RightalignedCell data={celldata} groupdata={props.groupdata} />
      );
      break;
    case "subtitle":
      cellMockup = <SubtitleCell data={celldata} groupdata={props.groupdata} />;
      break;
    case "simple-grid":
      cellMockup = <SimpleGridCell data={celldata} />;
      break;
    case "tabular-grid":
      cellMockup = <TabularGridCell data={celldata} />;
      break;
    case "custom":
      cellMockup = (
        <CustomCell
          appconfig={appConfig}
          pagedata={props.pagedata}
          data={celldata}
          groupdata={props.groupdata}
          screenIndex={props.screenIndex}
          screenObj={props.screenData}
          editorState={props.editorState}
        />
      );
      break;

    default:
      cellMockup = [
        <div key={cellstyle}>
          <Typography>{celldata.mainText}</Typography>
          <Typography>{celldata.detailText}</Typography>
        </div>,
      ];
      break;
  }

  return (
    <Box
      id="tablecell"
      style={{
        height: celldata.height + collapsibleHeight + "px",
        backgroundColor: getColorValue(cellbgColor),
        background: celldata.backgroundGradient,
      }}
      className="table-view-cell"
    >
      {cellMockup}
      {showCollapsible && (
        <IconButton
          disabled
          className="table-view-cell-collapse"
          style={{ color: "black" }}
        >
          <ExpandMore />
        </IconButton>
      )}
      {showAccessory && (
        <IconButton disabled className="table-view-cell-section">
          {accessoryType === "indicator" && <NavigateNext />}
          {accessoryType === "button" && (
            <img src={AccessoryButton} alt="button" />
          )}
        </IconButton>
      )}
    </Box>
  );
}

function ContactformCell(props) {
  const celldata = props.data;
  const recordCellDef = props.groupdata["RecordCellDef"];
  if (recordCellDef) {
    if (recordCellDef.hasOwnProperty("mainText")) {
      celldata["mainText"] = recordCellDef["mainText"];
    }
    if (recordCellDef.hasOwnProperty("detailText")) {
      celldata["detailText"] = recordCellDef["detailText"];
    }
  }

  return (
    <Box id="contactform" className="contact-frm-layout">
      <Typography className="contact-frm-main-txt">
        {celldata.mainText}
      </Typography>
      <Typography className="contact-frm-detail-txt">
        {celldata.detailText}
      </Typography>
    </Box>
  );
}

function DefaultCell(props) {
  const celldata = props.data;
  const mainimg = celldata["mainImage"]["filename"];
  const isMainimgSet = mainimg.length === 0 ? false : true;

  const recordCellDef = props.groupdata["RecordCellDef"];
  if (recordCellDef) {
    if (recordCellDef.hasOwnProperty("mainText")) {
      celldata["mainText"] = recordCellDef["mainText"];
    }
  }

  return (
    <Box id="default" className="default-cell-layout">
      {isMainimgSet && (
        <img
          src={mainimage}
          alt="mainimage"
          className="default-cell-main-img"
        />
      )}
      <Typography className="default-cell-main-txt">
        {celldata.mainText}
      </Typography>
    </Box>
  );
}

function SubtitleCell(props) {
  const celldata = props.data;
  //console.log("SubtitleCell >>>", celldata);
  const mainimg = celldata["mainImage"]["filename"];
  const isMainimgSet = mainimg && mainimg.length === 0 ? false : true;

  const recordCellDef = props.groupdata["RecordCellDef"];
  if (recordCellDef) {
    if (recordCellDef.hasOwnProperty("mainText")) {
      celldata["mainText"] = recordCellDef["mainText"];
    }
    if (recordCellDef.hasOwnProperty("detailText")) {
      celldata["detailText"] = recordCellDef["detailText"];
    }
  }

  return (
    <Box id="subtitle" className="subtitle-layout">
      {isMainimgSet && (
        <img src={mainimage} alt="mainimage" className="subtitle-main-img" />
      )}
      <Typography className="subtitle-main-txt">{celldata.mainText}</Typography>
      <Typography className="subtitle-detail-txt">
        {celldata.detailText}
      </Typography>
    </Box>
  );
}

function RightalignedCell(props) {
  const celldata = props.data;
  const recordCellDef = props.groupdata["RecordCellDef"];
  if (recordCellDef) {
    if (recordCellDef.hasOwnProperty("mainText")) {
      celldata["mainText"] = recordCellDef["mainText"];
    }
    if (recordCellDef.hasOwnProperty("detailText")) {
      celldata["detailText"] = recordCellDef["detailText"];
    }
  }

  return (
    <Box id="rightaligned" className="right-align-section">
      <Typography className="right-align-main-txt">
        {celldata.mainText}
      </Typography>
      <Typography className="right-align-detail-txt">
        {celldata.detailText}
      </Typography>
    </Box>
  );
}

function SimpleGridCell(props) {
  const celldata = props.data;
  const gridFields = celldata.gridFields;

  return (
    <Box id="simplegrid" className="simple-grid-cell-layout">
      {gridFields.map((field) => (
        <GridCell key={field.id} data={field} />
      ))}
    </Box>
  );
}

function TabularGridCell(props) {
  const celldata = props.data;
  const gridFields = celldata.tabularGridFields;

  return (
    <Box id="tabulargrid" className="simple-grid-cell-layout">
      {gridFields.map((field) => (
        <GridCell key={field.id} data={field} />
      ))}
    </Box>
  );
}

function GridCell(props) {
  const fielddata = props.data;

  return (
    <Box className="simple-grid-container">
      <Typography
        style={{
          height: "100%",
          width: fielddata.width + "px",
        }}
      >
        [{fielddata.fieldname}]
      </Typography>
    </Box>
  );
}

function CustomCell(props) {
  const appConfig = props.appconfig;
  const celldata = props.data;
  const fields = celldata.Fields;

  const recordCellDef = props.groupdata["RecordCellDef"];
  if (recordCellDef && recordCellDef.hasOwnProperty("Fields")) {
    if (recordCellDef["Fields"] !== fields) {
      console.log(
        recordCellDef["Fields"],
        "****** NOT EQUAL TO ******",
        fields
      );
      recordCellDef["Fields"] = fields;
    }
  }
  const frame = {
    x: 0,
    y: 0,
    width: getCellWidth(
      props.pagedata,
      props.screenObj["width"],
      props.screenIndex
    ),
    height: recordCellDef["height"],
  };
  //console.log(frame, "****** CustomCell ******", props.groupdata, recordCellDef, fields);

  let showCollapsible = false;
  let collapsibleHeight = 0;
  let subfields = [];
  let subframe = {
    x: 0,
    y: recordCellDef["height"],
    width: getCellWidth(
      props.pagedata,
      props.screenObj["width"],
      props.screenIndex
    ),
    height: 0,
  };
  let subcellBGColor = { alpha: 1, red: 1, green: 1, blue: 1, colorName: "" };
  if (props.pagedata["viewType"] === "DbTableViewNestedList") {
    const subCellDef = props.groupdata["SubRecordCellDef"];
    if (subCellDef) {
      showCollapsible = true;
      collapsibleHeight = subCellDef.height ? subCellDef.height : 50;
      subfields = subCellDef["Fields"];
      subframe["height"] = collapsibleHeight;
      subcellBGColor = subCellDef["backgroundColor"];
    }
  }

  const _layoutState = filterState_byPageid(
    props.pagedata.pageid,
    props.editorState
  );
  let _stateParams = _layoutState ? _layoutState["params"] : _layoutState;

  return (
    <Box id="custom" className="custom-layout-container">
      <GridCanvas
        screenIndex={props.screenIndex}
        data={props.pagedata}
        stateParams={_stateParams}
        frame={frame}
      />
      <UIContainer
        appconfig={appConfig}
        pagedata={props.pagedata}
        data={fields}
        source="tablecell"
        screenIndex={props.screenIndex}
        containerFrame={frame}
      />
      {showCollapsible && (
        <div
          id="aks"
          style={{
            height: collapsibleHeight + "px",
            top: celldata.height + "px",
            backgroundColor: getColorValue(subcellBGColor),
          }}
          className="custom-layout-collapse"
        >
          <UIContainer
            appconfig={appConfig}
            pagedata={props.pagedata}
            data={subfields}
            source="subtablecell"
            screenIndex={props.screenIndex}
            containerFrame={subframe}
          />
        </div>
      )}
    </Box>
  );
}

function getCellWidth(pagedata, scrwidth, scrIndex) {
  //console.log(pagedata, ".... getCellWidth >>", scrwidth);
  if (pagedata["_toolBarLeft"][scrIndex]) {
    if (
      !pagedata["_toolBarLeft"][scrIndex]["hidden"] &&
      pagedata["_toolBarLeft"][scrIndex]["fixed"]
    ) {
      scrwidth =
        scrwidth - pagedata["_toolBarLeft"][scrIndex]["frame"]["width"];
    }
  }
  if (pagedata["_toolBarRight"][scrIndex]) {
    if (
      !pagedata["_toolBarRight"][scrIndex]["hidden"] &&
      pagedata["_toolBarRight"][scrIndex]["fixed"]
    ) {
      scrwidth =
        scrwidth - pagedata["_toolBarRight"][scrIndex]["frame"]["width"];
    }
  }
  return scrwidth;
}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return (
    "rgba(" + _red + "," + _green + "," + _blue + "," + colorObj.alpha + ")"
  );
}

function getIconPath(imageObj, _url, _pid) {
  let imagepath = "";

  if (imageObj) {
    if (imageObj["srcLocation"] === "bundle")
      imagepath =
        _url +
        "download/image/" +
        _pid +
        "/" +
        imageObj["filename"] +
        "." +
        imageObj["fileext"];
    else if (imageObj["srcLocation"] === "url") imagepath = imageObj["url"];
    else if (imageObj["srcLocation"] === "remoteFile")
      imagepath = imageObj["url"] + imageObj["filename"];
    else imagepath = imageObj["filename"];
  }

  return imagepath;
}

function filterState_byPageid(openedpageid, editorstates) {
  let pagestates = editorstates.hasOwnProperty("_pagestates")
    ? editorstates._pagestates
    : [];
  let pagestate = pagestates.filter(function (node) {
    if (node[openedpageid]) {
      return true;
    }
    return false;
  });
  if (pagestate.length > 0) {
    return pagestate[0][openedpageid];
  }

  return null;
}
function GridCanvas(props) {
  //console.log(" ## GridCanvas >> ", props.frame);
  let screenIndex = props.screenIndex;
  if (!screenIndex) screenIndex = 0;

  const pageData = props.data;
  const layoutWidth = props.frame
    ? props.frame["width"]
    : pageData.viewType === "ScrollView"
    ? pageData.Children[0]._frames[screenIndex].width
    : pageData.frame.width;
  const layoutHeight = props.frame
    ? props.frame["height"]
    : pageData.viewType === "ScrollView"
    ? pageData.Children[0]._frames[screenIndex].height
    : pageData.frame.height;

  let showgrid = false;
  let gridgap = 10;
  if (props.stateParams) {
    let _params = props.stateParams;
    if (_params) {
      if (_params["showall"] && _params["showall"] === "on") {
        showgrid = true;
      } else {
        showgrid =
          _params["showgrid"] && _params["showgrid"] === "on" ? true : false;
      }
      gridgap = _params["gridgap"] ? _params["gridgap"] : 10;
    }
  }

  const gridRows = Math.floor(layoutHeight / gridgap);
  const gridColumns = Math.floor(layoutWidth / gridgap);
  let gridRC = [];
  if (showgrid) {
    for (let i = 0; i < gridRows; i++) {
      let _gridCol = [];
      for (let j = 0; j < gridColumns; j++) {
        _gridCol.push(j);
      }
      gridRC.push(_gridCol);
    }
  }

  return (
    <div
      id="gridcanvas"
      style={{ width: layoutWidth }}
      className="grid-canvas-section"
    >
      <table
        id="grid"
        style={{ width: layoutWidth }}
        className="grid-canvas-section"
      >
        <tbody>
          {gridRC.map((item, index) => (
            <tr key={index}>
              {item.map((item1, index1) => (
                <td
                  key={index1}
                  style={{
                    width: `calc(${gridgap}px)`,
                    height: `calc(${gridgap}px)`,
                  }}
                  className="grid-canvas-layout"
                ></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
