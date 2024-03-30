import {
  FETCH_PROJECTDATA_BEGIN,
  FETCH_PROJECTDATA_SUCCESS,
  FETCH_PROJECTDATA_FAILURE,
  SET_PROJECTDATA,
  SET_PAGELIST,
  UPDATE_SCREENDATA,
  REMOVE_SCREENDATA,
  ENABLE_AUTOSAVE,
  ALL_PAGEDATA_UPDATE,
  CHANGED_PAGES_ID,
  SET_CONTRIBUTOR_TABS,
} from "../ServiceActions";

const initialState = {
  error: null,
  data: [],
  pagelist: [],
  loaddata: false,
  autosave: false,
  allpageschanged: false,
  changedpages: [],
  contributortabs: [],
};

export default function projectDataReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_PROJECTDATA_BEGIN:
      // Mark the state as "loaddata" so we can show a spinner or something
      // Also, reset any errors. We're starting fresh.
      return {
        ...state,
        loaddata: true,
        error: null,
      };

    case FETCH_PROJECTDATA_SUCCESS:
    case SET_PROJECTDATA:
      // All done: set loaddata "false".
      // Also, replace the data with the ones from the server
      return {
        ...state,
        loaddata: false,
        data: action.payload.project,
      };

    case FETCH_PROJECTDATA_FAILURE:
      // The request failed. It's done. So set loaddata to "false".
      // Save the error, so we can display it somewhere.
      // Since it failed, we don't have data to display anymore, so set `data` empty.
      //
      // This is all up to you and your app though:
      // maybe you want to keep the data around!
      // Do whatever seems right for your use case.
      return {
        ...state,
        loaddata: false,
        error: action.payload.error,
        data: [],
      };

    case SET_PAGELIST:
      // console.log(action.payload.pages);
      return {
        ...state,
        pagelist: action.payload.pages,
      };

    case UPDATE_SCREENDATA:
      return {
        ...state,
        pagelist: updatePages_asScreenData(
          state.pagelist,
          action.payload.screens
        ),
      };

    case REMOVE_SCREENDATA:
      return {
        ...state,
        pagelist: removePageScreenData(state.pagelist, action.payload.screenid),
      };

    case ENABLE_AUTOSAVE:
      return {
        ...state,
        autosave: action.payload.autosave,
      };

    case ALL_PAGEDATA_UPDATE:
      return {
        ...state,
        allpageschanged: action.payload.allpageschanged,
      };

    case CHANGED_PAGES_ID:
      return {
        ...state,
        changedpages: action.payload.changedpages,
      };

    case SET_CONTRIBUTOR_TABS:
      return {
        ...state,
        contributortabs: action.payload.contributorTabs,
      };

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}

function updatePages_asScreenData(pages, screens) {
  let masterScrIndex = 0;
  screens.forEach((screen, id) => {
    if (screen["embed"]) {
      masterScrIndex = id;
      return;
    }
  });

  let newScrIndex = screens.length - 1;
  let newScreen = screens[newScrIndex];
  if (masterScrIndex === newScrIndex) masterScrIndex = 0;
  let masterScreen = screens[masterScrIndex];

  let scalew = newScreen.width / masterScreen.width;
  let scaleh = newScreen.height / masterScreen.height;
  //console.log("scale >>>", scalew, scaleh);

  pages.forEach((page) => {
    page = addScreenData_inPage(
      page,
      masterScrIndex,
      scalew,
      scaleh,
      masterScreen,
      screens
    );
    page = addScreenData_inUIparts(
      page,
      masterScrIndex,
      newScrIndex,
      scalew,
      scaleh
    );
  });

  console.log(screens, "<<<<<< UPDATE_SCREENDATA >>>>>>>>", pages);
  return pages;
}

function addScreenData_inPage(
  pagedata,
  masterScrIndex,
  scaleW,
  scaleH,
  masterScreen,
  screens
) {
  let navigationBars = pagedata["_navigationBars"];
  if (navigationBars.length >= screens.length) {
    //console.log(screens, "****", pagedata);
    const scrId = navigationBars.length - 1;
    pagedata = removeScreenData_inPage(pagedata, scrId);
  }
  let navObj = navigationBars[masterScrIndex];
  if (navObj === undefined) {
    navObj = navigationBars[0];
  }
  navigationBars.push(JSON.parse(JSON.stringify(navObj)));

  let tabHiddens = pagedata["_tabBarHiddens"];
  let tabObj = tabHiddens[masterScrIndex];
  if (tabObj === undefined) {
    tabObj = tabHiddens[0];
  }
  tabHiddens.push(JSON.parse(JSON.stringify(tabObj)));

  let topToolBar = pagedata["_toolBarTop"];
  let topToolObj = topToolBar[masterScrIndex];
  if (topToolObj === undefined) {
    topToolObj = topToolBar[0];
  }
  let newtToolObj = JSON.parse(JSON.stringify(topToolObj));
  newtToolObj["frame"]["width"] = Math.ceil(
    newtToolObj["frame"]["width"] * scaleW
  );
  newtToolObj["frame"]["height"] = Math.ceil(
    newtToolObj["frame"]["height"] * scaleH
  );
  topToolBar.push(newtToolObj);

  let bottomToolBar = pagedata["_toolBarBottom"];
  let bottomToolObj = bottomToolBar[masterScrIndex];
  if (bottomToolObj === undefined) {
    bottomToolObj = bottomToolBar[0];
  }
  let newbToolObj = JSON.parse(JSON.stringify(bottomToolObj));
  newbToolObj["frame"]["width"] = Math.ceil(
    newbToolObj["frame"]["width"] * scaleW
  );
  newbToolObj["frame"]["height"] = Math.ceil(
    newbToolObj["frame"]["height"] * scaleH
  );
  bottomToolBar.push(newbToolObj);

  let leftToolBar = pagedata["_toolBarLeft"];
  let leftToolObj = leftToolBar[masterScrIndex];
  if (leftToolObj === undefined) {
    leftToolObj = leftToolBar[0];
  }
  let newlToolObj = JSON.parse(JSON.stringify(leftToolObj));
  newlToolObj["frame"]["width"] = Math.ceil(
    newlToolObj["frame"]["width"] * scaleW
  );
  newlToolObj["frame"]["height"] = Math.ceil(
    newlToolObj["frame"]["height"] * scaleH
  );
  leftToolBar.push(newlToolObj);

  let rightToolBar = pagedata["_toolBarRight"];
  if (rightToolBar) {
    let rightToolObj = rightToolBar[masterScrIndex];
    if (rightToolObj === undefined) {
      rightToolObj = rightToolBar[0];
    }
    if (rightToolObj["frame"]["width"] === 0) {
      rightToolObj["frame"]["width"] = Math.ceil(masterScreen.width * 0.75);
    }
    if (rightToolObj["frame"]["height"] === 0) {
      rightToolObj["frame"]["height"] = masterScreen.height;
    }
    let newrToolObj = JSON.parse(JSON.stringify(rightToolObj));
    newrToolObj["frame"]["width"] = Math.ceil(
      newrToolObj["frame"]["width"] * scaleW
    );
    newrToolObj["frame"]["height"] = Math.ceil(
      newrToolObj["frame"]["height"] * scaleH
    );
    rightToolBar.push(newrToolObj);
  }

  if (pagedata.viewType === "ScrollView") {
    let scrollFrames = pagedata.Children[0]["_frames"];
    let _frameObj = scrollFrames[masterScrIndex];
    if (_frameObj === undefined) {
      _frameObj = scrollFrames[0];
    }
    let newFrameObj = JSON.parse(JSON.stringify(_frameObj));
    newFrameObj["x"] = Math.ceil(newFrameObj["x"] * scaleW);
    newFrameObj["y"] = Math.ceil(newFrameObj["y"] * scaleH);
    newFrameObj["width"] = Math.ceil(newFrameObj["width"] * scaleW);
    newFrameObj["height"] = Math.ceil(newFrameObj["height"] * scaleH);
    scrollFrames.push(newFrameObj);
  }

  if (
    pagedata.viewType === "DbTableViewList" ||
    pagedata.viewType === "RemoteTableViewList"
  ) {
    let recordcellObj = pagedata.Children[0].Group[0]["RecordCellDef"];

    let recordCells = pagedata.Children[0].Group[0]["RecordCells"];
    if (recordCells.length === 0) {
      for (let i = 0; i <= masterScrIndex; i++) {
        recordCells.push(recordcellObj);
      }
    }

    let newRecordObj = JSON.parse(JSON.stringify(recordcellObj));
    newRecordObj["height"] = Math.ceil(newRecordObj["height"] * scaleH);
    recordCells.push(newRecordObj);
  }

  if (pagedata.viewType === "SplitView") {
    let splitPages = pagedata.pages;
    for (let i = 0; i < splitPages.length; i++) {
      const _spage = splitPages[i];
      let screenFrames = _spage["_screenFrames"];
      let _frameObj = screenFrames[masterScrIndex];
      if (_frameObj === undefined) {
        _frameObj = screenFrames[0];
      }
      let newFrameObj = JSON.parse(JSON.stringify(_frameObj));
      newFrameObj["x"] = Math.ceil(newFrameObj["x"] * scaleW);
      newFrameObj["y"] = Math.ceil(newFrameObj["y"] * scaleH);
      newFrameObj["width"] = Math.ceil(newFrameObj["width"] * scaleW);
      newFrameObj["height"] = Math.ceil(newFrameObj["height"] * scaleH);
      screenFrames.push(newFrameObj);
    }
  }

  return pagedata;
}

function addScreenData_inUIparts(
  pagedata,
  masterScrIndex,
  scrIndex,
  scaleW,
  scaleH
) {
  addScreenData_inPageParts(
    pagedata["_toolBarTop"][masterScrIndex]["Children"],
    masterScrIndex,
    scaleW,
    scaleH
  );
  pagedata["_toolBarTop"][scrIndex]["Children"] =
    pagedata["_toolBarTop"][masterScrIndex]["Children"];
  addScreenData_inPageParts(
    pagedata["_toolBarBottom"][masterScrIndex]["Children"],
    masterScrIndex,
    scaleW,
    scaleH
  );
  pagedata["_toolBarBottom"][scrIndex]["Children"] =
    pagedata["_toolBarBottom"][masterScrIndex]["Children"];
  addScreenData_inPageParts(
    pagedata["_toolBarLeft"][masterScrIndex]["Children"],
    masterScrIndex,
    scaleW,
    scaleH
  );
  pagedata["_toolBarLeft"][scrIndex]["Children"] =
    pagedata["_toolBarLeft"][masterScrIndex]["Children"];
  if (pagedata["_toolBarRight"]) {
    addScreenData_inPageParts(
      pagedata["_toolBarRight"][masterScrIndex]["Children"],
      masterScrIndex,
      scaleW,
      scaleH
    );
    pagedata["_toolBarRight"][scrIndex]["Children"] =
      pagedata["_toolBarRight"][masterScrIndex]["Children"];
  }
  if (pagedata["pageOverlay"]) {
    addScreenData_inPageParts(
      pagedata["pageOverlay"]["Children"],
      masterScrIndex,
      scaleW,
      scaleH
    );
  }

  if (pagedata.viewType.indexOf("TableView") > -1) {
    if (
      pagedata.viewType === "DbTableViewList" ||
      pagedata.viewType === "RemoteTableViewList" ||
      pagedata.viewType === "DbTableViewNestedList"
    ) {
      let arrFields0 = pagedata.Children[0].Group[0].RecordCellDef.Fields;
      addScreenData_inPageParts(arrFields0, masterScrIndex, scaleW, scaleH);
      if (pagedata.viewType === "DbTableViewNestedList") {
        let arrSubFields0 =
          pagedata.Children[0].Group[0].SubRecordCellDef.Fields;
        addScreenData_inPageParts(
          arrSubFields0,
          masterScrIndex,
          scaleW,
          scaleH
        );
      }
    } else {
      let arrGroup = pagedata.Children[0].Group;
      for (let i = 0; i < arrGroup.length; i++) {
        let arrRow = arrGroup[i].rowarray;
        for (let j = 0; j < arrRow.length; j++) {
          if (arrRow[j]) {
            let arrFields = arrRow[j].Fields;
            addScreenData_inPageParts(
              arrFields,
              masterScrIndex,
              scaleW,
              scaleH
            );
          }
        }
      }
    }
  } else {
    let pageChildren;
    if (
      pagedata.viewType === "ScrollView" ||
      pagedata.viewType === "PageScrollView"
    )
      pageChildren = pagedata.Children[0].Children;
    else pageChildren = pagedata.Children;

    addScreenData_inPageParts(pageChildren, masterScrIndex, scaleW, scaleH);
  }

  /*let topToolChildren = topToolBar[scrIndex].Children;
    for (let i = 0; i < topToolChildren.length; i++) {
      let topToolUIparts = topToolChildren[i].uiParts;
      let topUIObj = topToolUIparts[masterScrIndex];

      let newUIObj = JSON.parse(JSON.stringify(topUIObj));
      let _frameObj = newUIObj['frame'];
      let newFrameObj = JSON.parse(JSON.stringify(_frameObj));
      newFrameObj['x'] = Math.ceil(newFrameObj['x'] * scaleW);
      newFrameObj['y'] = Math.ceil(newFrameObj['y'] * scaleH);
      newFrameObj['width'] = Math.ceil(newFrameObj['width'] * scaleW);
      newFrameObj['height'] = Math.ceil(newFrameObj['height'] * scaleH);
      newUIObj['frame'] = newFrameObj;
      //console.log(masterScrIndex, scrIndex, scaleW, scaleH, "_toolBarTop >>>", newFrameObj, newUIObj);

      topToolUIparts.push(newUIObj);      
    }*/

  return pagedata;
}

function addScreenData_inPageParts(
  pagepartChildren,
  masterScrIndex,
  scaleW,
  scaleH
) {
  for (let i = 0; i < pagepartChildren.length; i++) {
    let childrenUIparts = pagepartChildren[i].uiParts;
    let childUIObj = childrenUIparts[masterScrIndex];
    let newUIObj = JSON.parse(JSON.stringify(childUIObj));
    if (newUIObj["viewType"] === "TileList") {
      const tileChildren = newUIObj["dataarray"][0]["Fields"];
      addScreenData_inPageParts(tileChildren, masterScrIndex, scaleW, scaleH);
      //console.log(masterScrIndex, pagepartChildren, "... addScreenData_in  TileList ..", childUIObj, tileChildren);
      childUIObj["dataarray"][0]["Fields"] = tileChildren;
    }
    if (newUIObj["viewType"] === "Dialog") {
      const dialogChildren = newUIObj["dataarray"][0]["Fields"];
      addScreenData_inPageParts(dialogChildren, masterScrIndex, scaleW, scaleH);
      childUIObj["dataarray"][0]["Fields"] = dialogChildren;
    }

    let _fontObj = newUIObj.hasOwnProperty("font")
      ? newUIObj["font"]
      : newUIObj["normalFont"];
    if (_fontObj) {
      let newFontObj = JSON.parse(JSON.stringify(_fontObj));
      newFontObj["fontSize"] = Math.ceil(newFontObj["fontSize"] * scaleH);
      if (newUIObj.hasOwnProperty("font")) {
        newUIObj["font"] = newFontObj;
      } else {
        newUIObj["normalFont"] = newFontObj;
      }
    }

    let _frameObj = newUIObj["frame"];
    let newFrameObj = JSON.parse(JSON.stringify(_frameObj));
    newFrameObj["x"] = Math.ceil(newFrameObj["x"] * scaleW);
    newFrameObj["y"] = Math.ceil(newFrameObj["y"] * scaleH);
    newFrameObj["width"] = Math.ceil(newFrameObj["width"] * scaleW);
    newFrameObj["height"] = Math.ceil(newFrameObj["height"] * scaleH);
    newUIObj["frame"] = newFrameObj;

    if (newUIObj.hasOwnProperty("padding")) {
      let _padObj = newUIObj["padding"];
      let newPaddingObj = JSON.parse(JSON.stringify(_padObj));
      newPaddingObj["top"] = Math.ceil(newPaddingObj["top"]);
      newPaddingObj["right"] = Math.ceil(newPaddingObj["right"]);
      newPaddingObj["left"] = Math.ceil(newPaddingObj["left"]);
      newPaddingObj["bottom"] = Math.ceil(newPaddingObj["bottom"]);
      newUIObj["padding"] = newPaddingObj;
    }

    childrenUIparts.push(newUIObj);
  }
}

function removePageScreenData(pages, scrId) {
  pages.forEach((page) => {
    page = removeScreenData_inPage(page, scrId);
    //page = addScreenData_inUIparts(page, masterScrIndex, newScrIndex, scalew, scaleh);
  });
  console.log(scrId, "<<<<<< REMOVE_SCREENDATA >>>>>>>>", pages);

  return pages;
}

function removeScreenData_inPage(pagedata, scrIndex) {
  let navigationBars = pagedata["_navigationBars"];
  navigationBars.splice(scrIndex, 1);

  let tabHiddens = pagedata["_tabBarHiddens"];
  tabHiddens.splice(scrIndex, 1);

  let topToolBar = pagedata["_toolBarTop"];
  topToolBar.splice(scrIndex, 1);
  removeScreenData_inToolBars(topToolBar, scrIndex);

  let bottomToolBar = pagedata["_toolBarBottom"];
  bottomToolBar.splice(scrIndex, 1);
  removeScreenData_inToolBars(bottomToolBar, scrIndex);

  let leftToolBar = pagedata["_toolBarLeft"];
  leftToolBar.splice(scrIndex, 1);
  removeScreenData_inToolBars(leftToolBar, scrIndex);

  let rightToolBar = pagedata["_toolBarRight"];
  if (rightToolBar) {
    rightToolBar.splice(scrIndex, 1);
    removeScreenData_inToolBars(rightToolBar, scrIndex);
  }

  if (pagedata["pageOverlay"]) {
    removeScreenData_inUIparts(pagedata["pageOverlay"]["Children"], scrIndex);
  }

  if (pagedata.viewType.indexOf("TableView") > -1) {
    if (
      pagedata.viewType === "DbTableViewList" ||
      pagedata.viewType === "RemoteTableViewList" ||
      pagedata.viewType === "DbTableViewNestedList"
    ) {
      let arrFields0 = pagedata.Children[0].Group[0].RecordCellDef.Fields;
      removeScreenData_inUIparts(arrFields0, scrIndex);
      let recordCells = pagedata.Children[0].Group[0]["RecordCells"];
      recordCells.splice(scrIndex, 1);
      if (pagedata.viewType === "DbTableViewNestedList") {
        let arrSubFields0 =
          pagedata.Children[0].Group[0].SubRecordCellDef.Fields;
        removeScreenData_inUIparts(arrSubFields0, scrIndex);
      }
    } else {
      let arrGroup = pagedata.Children[0].Group;
      for (let i = 0; i < arrGroup.length; i++) {
        let arrRow = arrGroup[i].rowarray;
        for (let j = 0; j < arrRow.length; j++) {
          if (arrRow[j]) {
            let arrFields = arrRow[j].Fields;
            removeScreenData_inUIparts(arrFields, scrIndex);
          }
        }
      }
    }
  } else if (pagedata.viewType === "SplitView") {
    let splitPages = pagedata.pages;
    for (let i = 0; i < splitPages.length; i++) {
      const _spage = splitPages[i];
      let screenFrames = _spage["_screenFrames"];
      screenFrames.splice(scrIndex, 1);
    }
  } else {
    let pageChildren;
    if (pagedata.viewType === "ScrollView") {
      let scrollFrames = pagedata.Children[0]["_frames"];
      scrollFrames.splice(scrIndex, 1);
      pageChildren = pagedata.Children[0].Children;
    } else if (pagedata.viewType === "PageScrollView") {
      pageChildren = pagedata.Children[0].Children;
    } else {
      pageChildren = pagedata.Children;
    }

    removeScreenData_inUIparts(pageChildren, scrIndex);
  }

  return pagedata;
}

function removeScreenData_inToolBars(toolbarArr, scrIndex) {
  toolbarArr.forEach((toolbarObj) => {
    removeScreenData_inUIparts(toolbarObj["Children"], scrIndex);
  });
}

function removeScreenData_inUIparts(pagepartChildren, scrIndex) {
  for (let i = 0; i < pagepartChildren.length; i++) {
    let childrenUIparts = pagepartChildren[i].uiParts;
    let removedUIparts = childrenUIparts.splice(scrIndex, 1);
    //console.log("removedUIparts >>>>", removedUIparts);

    if (removedUIparts.length > 0) {
      const removedUIObj = removedUIparts[0];
      if (removedUIObj["viewType"] === "TileList") {
        childrenUIparts.forEach((tileChildren) => {
          removeScreenData_inUIparts(
            tileChildren["dataarray"][0]["Fields"],
            scrIndex
          );
        });
      }
      if (removedUIObj["viewType"] === "Dialog") {
        childrenUIparts.forEach((dialogChildren) => {
          removeScreenData_inUIparts(
            dialogChildren["dataarray"][0]["Fields"],
            scrIndex
          );
        });
      }
    }
  }
}
