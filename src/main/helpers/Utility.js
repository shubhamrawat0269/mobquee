export function plus(a, b) {
  return a + b;
}

let globalCutCopyUIObj;
export function setCutCopyUIObj(cutcopyUIObj) {
  globalCutCopyUIObj = cutcopyUIObj;
}

let props;
export function handleUIPaste(propObj, cutcopyUIObj, selectedScreen) {
  const _cutcopyUIObj = globalCutCopyUIObj ? globalCutCopyUIObj : cutcopyUIObj;
  if (!_cutcopyUIObj) return;
  if (_cutcopyUIObj.length === 0) {
    const _nopasteObj = "No object found to paste.";
    return { result: "error", message: _nopasteObj };
  }

  props = propObj;
  //let cutcopyUIObj = {mode: 'cut', sourceEditor:{page:this.props.currentPage, editor: this.props.targetEditor}};
  const cutcopyMode = _cutcopyUIObj[0]["mode"];
  const cutcopySourceObj = _cutcopyUIObj[0]["sourceEditor"];
  const cutcopyMultiUI = _cutcopyUIObj[0]["cutcopyMultiUI"];
  const cutcopyUI = _cutcopyUIObj[0]["cutcopyUI"];

  if (cutcopyMultiUI && cutcopyMultiUI.length > 0) {
    //console.log("....handle Multi UI Paste >>>", cutcopyMultiUI);
    let _pasteStatusMulti;
    let multiFlag = true;
    for (let i = 0; i < cutcopyMultiUI.length; i++) {
      const cutcopyElem = cutcopyMultiUI[i]["UI"];
      if (i === cutcopyMultiUI.length - 1) {
        multiFlag = false;
      }
      _pasteStatusMulti = pasteUIHandler(
        props.screenIndex,
        cutcopyElem,
        multiFlag,
        cutcopyMode,
        cutcopySourceObj
      );
      if (_pasteStatusMulti["result"] === "error") {
        return _pasteStatusMulti;
      }
    }
    return _pasteStatusMulti;
    //setCutCopyMultiUI([]);
  } else {
    const _pasteStatus = pasteUIHandler(
      props.screenIndex,
      cutcopyUI,
      false,
      cutcopyMode,
      cutcopySourceObj
    );
    return _pasteStatus;
  }
}

function getUIViewtype(uichild) {
  let uitype = uichild["viewType"];
  if (uitype === "Button") {
    if (uichild.type === "System") {
      uitype = "SystemButton";
    } else if (uichild.type === "CheckBox") {
      uitype = "CheckBox";
    } else {
      uitype = getButtontype(uichild.buttonType) + "Button";
    }
  }
  return uitype;
}
function getButtontype(btnType) {
  return btnType.charAt(0).toUpperCase() + btnType.substr(1).toLowerCase();
}

function pasteUIHandler(
  selectedScreen,
  cutcopyUIObj,
  isMulti,
  mode,
  sourceEditor
) {
  let pasteStatus = "";
  //console.log(props, ".... pasteUIHandler >>>>>>>>>", selectedScreen, cutcopyUIObj, isMulti, mode, sourceEditor);
  const _scrIndex = selectedScreen
    ? parseInt(selectedScreen)
    : parseInt(props.screenIndex);
  if (cutcopyUIObj && cutcopyUIObj.hasOwnProperty("viewType")) {
    //console.log(sourceEditor, mode, props.targetEditor, "....handleUIPaste >>>", cutcopyUIObj);

    let uiViewType = getUIViewtype(cutcopyUIObj);
    const validUIMsg = validateDroppedUI(uiViewType, props, selectedScreen);
    if (validUIMsg.length > 0) {
      return { result: "error", message: validUIMsg };
    }

    let enableforAllScreen = false;
    let masterScreenIndex = 0;
    const screens = props.appData["availableScreens"];
    if (screens.length > 1) {
      screens.forEach((element, i) => {
        if (element["embed"]) {
          masterScreenIndex = i;
        }
      });

      const isMasterSlave = props.appData["isMasterScreenSet"];
      if (isMasterSlave && _scrIndex === masterScreenIndex) {
        enableforAllScreen = true;
      }
    }

    if (mode === "cut") {
      if (
        sourceEditor["page"]["pageid"] === props.currentPage["pageid"] &&
        sourceEditor["editor"] === props.targetEditor
      ) {
        pasteStatus = "What is the need of cut & paste here?";
        return { result: "error", message: pasteStatus };
      }
      let sourceChildrenArr = getChildrenArray(
        sourceEditor["editor"],
        _scrIndex,
        sourceEditor["page"]
      );
      if (screens.length > 1) {
        let cutUIdef;
        sourceChildrenArr.forEach((child, i) => {
          const _childPart = child["uiParts"][_scrIndex];
          let _childViewType = getUIViewtype(_childPart);
          if (enableforAllScreen) {
            //console.log(_childViewType, _scrIndex, "....cutcopyUIObj #### >>>", i, uiViewType);
            //if(child['uiParts'][_scrIndex] === cutcopyUIObj) {
            if (
              _childViewType === uiViewType &&
              _childPart["name"] === cutcopyUIObj["name"]
            ) {
              cutUIdef = sourceChildrenArr.splice(i, 1);
            }
          } else {
            if (_childPart["name"] === cutcopyUIObj["name"]) {
              child["uiParts"][_scrIndex]["_enabledOnScreen"] = false;
            }
          }
        });
        setMultiToolbarsChildren(
          props,
          sourceEditor["editor"],
          screens,
          selectedScreen,
          "delete",
          cutUIdef,
          sourceChildrenArr
        );
      } else {
        sourceChildrenArr.forEach((child, i) => {
          if (child["uiParts"][0] === cutcopyUIObj) {
            sourceChildrenArr.splice(i, 1);
          }
        });
      }
    }

    const _targetEditor =
      uiViewType === "Dialog" ? "overlay" : props.targetEditor;
    if (_targetEditor === "Form" || _targetEditor === "FormView") {
      if (uiViewType === "Dialog") {
        pasteStatus = "'Dialog' UI not allowed here.";
        return { result: "error", message: pasteStatus };
      } else {
        const formUI = props.contentEditorParent["ui"];
        let index = props.contentEditorParent["index"]
          ? props.contentEditorParent["index"]
          : 0;
        let formItems = formUI["formItems"];
        if (formItems[index]["Fields"].length === 1) {
          pasteStatus = "Only one UI part allowed in one form item.";
          return { result: "error", message: pasteStatus };
        }
      }
    }

    let editorChildrenArr = getChildrenArray(_targetEditor, _scrIndex);
    let uiContainer = { _uid: "", uiParts: [], viewType: uiViewType };

    let _uipart = JSON.parse(JSON.stringify(cutcopyUIObj));
    _uipart["name"] = setUIpartName(_uipart["name"], _scrIndex);
    if (mode === "copy") {
      const orderId = getUIpart_orderIndex(editorChildrenArr, _scrIndex);
      _uipart["displayOrderOnScreen"] = parseInt(orderId) + 1;
      if (sourceEditor["editor"] === props.targetEditor) {
        _uipart["frame"]["x"] = parseInt(_uipart["frame"]["x"]) + 5;
        _uipart["frame"]["y"] = parseInt(_uipart["frame"]["y"]) + 5;
      }

      if (_uipart["viewType"] === "TileList") {
        const tileItems = _uipart.dataarray[0].Fields;
        for (let t = 0; t < tileItems.length; t++) {
          const tileElem = tileItems[t]["uiParts"][_scrIndex];
          if (tileElem) {
            const elemName = setUIpartName(tileElem["name"], _scrIndex);
            tileElem["name"] = elemName;
          }
        }
        //console.log(_scrIndex, "....copy Tilelist #### >>>", tileItems);
      } else if (_uipart["viewType"] === "Dialog") {
        const dialogItems = _uipart.dataarray[0].Fields;
        for (let t = 0; t < dialogItems.length; t++) {
          const dialogElem = dialogItems[t]["uiParts"][_scrIndex];
          if (dialogElem) {
            const elemName = setUIpartName(dialogElem["name"], _scrIndex);
            dialogElem["name"] = elemName;
          }
        }
      } else if (_uipart["viewType"] === "ExpansionPanel") {
        const panelItems = _uipart.panelItems;
        for (let e = 0; e < panelItems.length; e++) {
          const panelObjFields = panelItems[e].Fields;
          for (let p = 0; p < panelObjFields.length; p++) {
            const panelElem = panelObjFields[p]["uiParts"][_scrIndex];
            if (panelElem) {
              const elemName = setUIpartName(panelElem["name"], _scrIndex);
              panelElem["name"] = elemName;
            }
          }
        }
      } else if (_uipart["viewType"] === "SwipeableView") {
        const swipeableItems = _uipart.swipeableItems;
        for (let s = 0; s < swipeableItems.length; s++) {
          const swipeObjFields = swipeableItems[s].Fields;
          for (let v = 0; v < swipeObjFields.length; v++) {
            const swipeElem = swipeObjFields[v]["uiParts"][_scrIndex];
            if (swipeElem) {
              const elemName = setUIpartName(swipeElem["name"], _scrIndex);
              swipeElem["name"] = elemName;
            }
          }
        }
      }
    }
    _uipart["frame"] = setUIpartFrame(
      _uipart["frame"],
      props.targetEditor,
      _scrIndex
    );
    if (_uipart["taborder"]) {
      _uipart.taborder = _uipart["displayOrderOnScreen"];
    }

    if (screens.length > 1) {
      let scaleW = 1,
        scaleH = 1;
      for (let i = 0; i < screens.length; i++) {
        //if(i === _scrIndex) continue;
        if (i !== _scrIndex) {
          let _suipart = JSON.parse(JSON.stringify(_uipart));
          _suipart["name"] = setUIpartName(_suipart["name"], i);
          scaleW = screens[i].width / screens[_scrIndex].width;
          scaleH = screens[i].height / screens[_scrIndex].height;
          _suipart.frame.x = _uipart.frame.x; //.floor(_uipart.frame.x * scaleW);
          _suipart.frame.y = _uipart.frame.y; //Math.floor(_uipart.frame.y * scaleH);
          _suipart.frame.width = Math.floor(_uipart.frame.width * scaleW);
          _suipart.frame.height = Math.floor(_uipart.frame.height * scaleH);

          if (!enableforAllScreen) {
            _suipart["_enabledOnScreen"] = false;
          }

          uiContainer.uiParts.push(_suipart);
        } else {
          if (!enableforAllScreen) {
            _uipart["_enabledOnScreen"] = true;
          }
          uiContainer.uiParts.push(_uipart);
        }
      }
    } else {
      uiContainer.uiParts.push(_uipart);
    }
    //props.onSelectUI(_uipart);
    pasteStatus = { result: "success", data: _uipart };
    //console.log(sourceEditor, mode, props.targetEditor, "....handleUIPaste >>>", cutcopyUIObj, "******", uiContainer, editorChildrenArr);

    resetSelection_UIContainers(editorChildrenArr);
    uiContainer["selected"] = true;
    editorChildrenArr.push(uiContainer);

    if (screens.length > 1) {
      //console.log(props.data, "....handleUIPaste >>>", sourceEditor, mode, props.targetEditor, " >>>>>", cutcopyUIObj, "******", uiContainer, editorChildrenArr);
      setMultiToolbarsChildren(
        props,
        props.targetEditor,
        screens,
        selectedScreen,
        "add",
        uiContainer
      );
    }

    if (!isMulti) {
      //props.onUpdatePage(props.data);

      let _page = JSON.parse(JSON.stringify(props.data));
      const layoutState = props.pagestate;
      if (layoutState) {
        let undoState = layoutState["undo"];
        if (undoState) {
          if (undoState.length > 10) {
            undoState.shift();
          }
          undoState.push(_page);
        }
      }
    }
  } else {
    pasteStatus = "Select at-least one UI to cut/copy & paste.";
    return { result: "error", message: pasteStatus };
  }

  return pasteStatus;
}

function validateDroppedUI(_viewType, _props, selectedScreen) {
  let validationMsg = "";
  //console.log(_props.targetEditor, "... validateDroppedUI ....", _viewType, _props);

  if (
    _props.contentEditorParent &&
    (_props.contentEditorParent.source === "Dialog" ||
      _props.contentEditorParent.source === "Drawer")
  ) {
    const notallowedUIparts = [
      "Dialog",
      "Drawer",
      "SoundBox",
      "VideoBox",
      "ExpansionPanel",
      "SwipeableView",
    ];
    const findUI = notallowedUIparts.find((element) => element === _viewType);
    const isNotAllowedUI = findUI ? true : false;
    if (isNotAllowedUI) {
      validationMsg = _viewType + " UI part not allowed here.";
      return validationMsg;
    }
  }

  if (_props.source === "tablecell") {
    const allowedUIparts = [
      "Label",
      "TextField",
      "NumericField",
      "TextView",
      "Image",
      "Avatar",
      "LinkLabel",
      "RoundButton",
      "TextButton",
      "ImageButton",
      "IconButton",
      "Switch",
      "ToggleButton",
      "CheckBox",
      "RadioButton",
      "ActionButton",
      "ComboBox",
      "Slider",
      "ProgressBar",
    ];
    const findUI = allowedUIparts.find((element) => element === _viewType);
    const isAllowedUI = findUI ? true : false;
    if (!isAllowedUI) {
      validationMsg = _viewType + " UI part not allowed here.";
      return validationMsg;
    }
  }

  if (_viewType === "Dialog" || _viewType === "Drawer") {
    if (_props.targetEditor) {
      if (_props.targetEditor.toLowerCase().indexOf("overlay") === -1) {
        validationMsg = _viewType + " UI allowed on 'Page Overlay' only.";
        return validationMsg;
      } else {
        let overlayChildren = _props.currentPage["pageOverlay"]["Children"];
        if (overlayChildren && overlayChildren.length > 0) {
          const findDialogUI = overlayChildren.find(
            (element) => element["viewType"] === _viewType
          );
          if (findDialogUI) {
            validationMsg = "Only one " + _viewType + " UI allowed";
            return validationMsg;
          }
        }
      }
    }
  } else if (_viewType === "TileList") {
    const allowedContainers = [
      "page",
      "topToolbar",
      "Dialog",
      "Drawer",
      "ExpansionPanel",
      "SwipeableView",
    ];
    const findContainer = allowedContainers.find(
      (element) => element === props.targetEditor
    );
    const isAllowedContainer = findContainer ? true : false;
    if (!isAllowedContainer) {
      validationMsg = "TileList UI part not allowed here.";
      return validationMsg;
    }
  } else if (_viewType === "Chart") {
    if (
      props.targetEditor === "tablecell" ||
      props.targetEditor === "TileList"
    ) {
      validationMsg = "Chart UI part not allowed here.";
      return validationMsg;
    }
  } else if (_viewType === "ExpansionPanel" || _viewType === "SwipeableView") {
    const notAllowedContainers = [
      "tablecell",
      "topToolbar",
      "bottomToolbar",
      "TileList",
      "Dialog",
      "Drawer",
      "ExpansionPanel",
      "SwipeableView",
    ];
    const findContainer = notAllowedContainers.find(
      (element) => element === props.targetEditor
    );
    const isNotAllowedContainer = findContainer ? true : false;
    if (isNotAllowedContainer) {
      const uiName =
        _viewType === "ExpansionPanel" ? "Expansion Panel" : "Swipeable View";
      validationMsg = uiName + " not allowed here.";
      return validationMsg;
    }
  } else if (_viewType === "Form" || _viewType === "FormView") {
    const allowedContainers = ["page", "Dialog", "Drawer", "SwipeableView"];
    const findContainer = allowedContainers.find(
      (element) => element === props.targetEditor
    );
    const isAllowedContainer = findContainer ? true : false;
    if (!isAllowedContainer) {
      validationMsg = "FormView UI part not allowed here.";
      return validationMsg;
    }
  }
  if (
    _props.targetEditor &&
    _props.targetEditor.toLowerCase().indexOf("overlay") > -1
  ) {
    const allowedUI =
      _viewType === "Dialog" || _viewType === "Drawer" ? true : false;
    if (!allowedUI) {
      validationMsg = "Only 'Dialog' or 'Drawer' UI allowed on Page Overlay.";
      return validationMsg;
    }
  }

  const mediaUIparts = ["Camera", "GoogleMap", "SoundBox", "VideoBox"];
  const findMediaUI = mediaUIparts.find((element) => element === _viewType);
  const isMediaUI = findMediaUI ? true : false;

  const _scrIndex = parseInt(selectedScreen);
  const pgChildren = getAllChildrenOnPage(props.currentPage, _scrIndex); //_props['allChildren'];
  pgChildren.forEach((uipart) => {
    if (isMediaUI && uipart["viewType"] === _viewType) {
      validationMsg = "Only one same type of media UI supported on a page.";
    }
  });

  return validationMsg;
}

function getChildrenArray(targetEditor, scrIndex, pagedata) {
  //console.log(targetEditor, pagedata, "...getChildrenArray >>>>", props);
  const scrId = scrIndex ? scrIndex : 0;

  let _data = pagedata ? pagedata : props.currentPage;
  switch (targetEditor) {
    case "page":
      if (_data.viewType === "BaseView") {
        return _data.Children;
      } else if (_data.viewType === "ScrollView") {
        return _data.Children[0].Children;
      } else if (_data["viewType"].indexOf("TableView") > -1) {
        if (_data.Children[0]["_tmpCellStyle"] === "custom") {
          const tableGroup = _data.Children[0].Group;
          return tableGroup[0].RecordCellDef.Fields;
        }
      }
      return _data.Children;

    case "topToolbar":
      return _data._toolBarTop[scrId].Children;

    case "bottomToolbar":
      return _data._toolBarBottom[scrId].Children;

    case "leftToolbar":
      return _data._toolBarLeft[scrId].Children;

    case "rightToolbar":
      return _data._toolBarRight[scrId].Children;

    case "tablecell":
      if (_data["viewType"].indexOf("TableView") > -1) {
        if (_data.Children[0]["_tmpCellStyle"] === "custom") {
          const tableGroup = _data.Children[0].Group;
          return tableGroup[0].RecordCellDef.Fields;
        }
      }
      return _data.Children;
    case "subtablecell":
      if (_data["viewType"].indexOf("NestedList") > -1) {
        if (_data.Children[0]["_tmpCellStyle"] === "custom") {
          const tableGroup = _data.Children[0].Group;
          return tableGroup[0].SubRecordCellDef.Fields;
        }
      }
      return _data.Children;

    case "overlay":
      if (_data["pageOverlay"]) {
        return _data["pageOverlay"].Children;
      }
      return _data.Children;

    case "pageOverlay":
    case "Dialog":
    case "Drawer":
      if (_data["pageOverlay"] && _data["pageOverlay"].Children[0]) {
        /*if (_data["pageOverlay"].Children[0].uiParts[scrId]) {
          return _data["pageOverlay"].Children[0].uiParts[scrId].dataarray[0]
            .Fields;
        }*/
        let dialogUI;
        const overlayChildren = _data["pageOverlay"]["Children"];
        if (overlayChildren.length > 1) {
          let overlayUI = overlayChildren.filter(function (uipart) {
            if (uipart["viewType"] === targetEditor) {
              return true;
            }
            return false;
          });
          if (overlayUI.length > 0) {
            dialogUI = overlayUI[0];
          }
        } else {
          dialogUI = overlayChildren[0];
        }

        if (dialogUI) {
          return dialogUI.uiParts[scrId].dataarray[0].Fields;
        }
      }
      return _data["pageOverlay"].Children;

    case "TileList":
      const _uidata = props.contentEditorParent
        ? props.contentEditorParent["ui"]
        : "";
      if (_uidata !== "" && _uidata["viewType"] === "TileList") {
        return _uidata.dataarray[0].Fields;
      }
      return _data.Children;

    case "ExpansionPanel":
      const expnPanelUI = props.contentEditorParent["ui"];
      let indx = props.contentEditorParent["index"]
        ? props.contentEditorParent["index"]
        : 0;
      let panelItems = expnPanelUI["panelItems"];
      return panelItems[indx]["Fields"];

    case "SwipeableView":
      const swipeViewUI = props.contentEditorParent["ui"];
      let idx = props.contentEditorParent["index"]
        ? props.contentEditorParent["index"]
        : 0;
      let swipeableItems = swipeViewUI["swipeableItems"];
      return swipeableItems[idx]["Fields"];

    case "Form":
    case "FormView":
      const formUI = props.contentEditorParent["ui"];
      let index = props.contentEditorParent["index"]
        ? props.contentEditorParent["index"]
        : 0;
      let formItems = formUI["formItems"];
      return formItems[index]["Fields"];

    default:
      return getChildrenArray("page", scrIndex, pagedata);
  }
}

function setUIpartName(uiname, scrIndex) {
  //console.log(mode, "setUIpartName >>>", uiname);
  let pastedUIname = uiname;
  pastedUIname = validateUIname(pastedUIname, scrIndex);

  return pastedUIname;
}
function validateUIname(uiname, scrIndex) {
  let uiPartsName = [];

  const _allChildren = getAllChildrenOnPage(props.currentPage, scrIndex); //props['allChildren'];
  _allChildren.forEach((element) => {
    let uipart = element["uiParts"][scrIndex];
    let displayName = uipart.name;
    uiPartsName.push(displayName);
  });
  uiPartsName.sort();
  //console.log(uiname, "...validateUIname >>>", _allChildren.length, uiPartsName);

  let cnt = 0;
  let validname = uiname; // +"_"+ cnt;
  for (let i = 0; i < uiPartsName.length; i++) {
    if (validname === uiPartsName[i]) {
      cnt += 1;
      validname = uiname + "_" + cnt;
    }
  }

  return validname;
}

function getUIpart_orderIndex(uichildren, scrId) {
  const lastUIchildren = uichildren[uichildren.length - 1];
  if (lastUIchildren) {
    return lastUIchildren.uiParts[scrId].displayOrderOnScreen;
  }

  return uichildren.length;
}

function setUIpartFrame(uiframe, targetEditor, scrIndex) {
  let _data = props.currentPage;
  let pastedUIframe = uiframe;
  //console.log(targetEditor, props, "... setUIpartFrame ....", _data, pastedUIframe);

  let targetFrame = {};
  switch (targetEditor) {
    case "page":
      if (_data.viewType === "BaseView") {
        if (scrIndex > 0) {
          const scrFrame = props.appData["availableScreens"][scrIndex];
          if (scrFrame) {
            targetFrame = {
              x: 0,
              y: 0,
              width: scrFrame["width"],
              height: scrFrame["height"],
            };
          } else {
            targetFrame = _data.frame;
          }
        } else {
          targetFrame = _data.frame;
        }
      } else if (_data.viewType === "ScrollView") {
        targetFrame = _data.Children[0]._frames[scrIndex];
      } else if (_data.viewType.indexOf("TableViewList") > -1) {
        const _cellheight = _data.Children[0].Group[0].RecordCellDef
          ? _data.Children[0].Group[0].RecordCellDef["height"]
          : 50;
        targetFrame = {
          x: 0,
          y: 0,
          width: _data.frame["width"],
          height: _cellheight,
        };
      }
      break;
    case "tablecell":
      const _cellheight = _data.Children[0].Group[0].RecordCellDef
        ? _data.Children[0].Group[0].RecordCellDef["height"]
        : 50;
      targetFrame = {
        x: 0,
        y: 0,
        width: _data.frame["width"],
        height: _cellheight,
      };
      break;
    case "topToolbar":
      targetFrame = _data._toolBarTop[scrIndex].frame;
      targetFrame["width"] = _data.frame["width"];
      break;
    case "bottomToolbar":
      targetFrame = _data._toolBarBottom[scrIndex].frame;
      targetFrame["width"] = _data.frame["width"];
      break;
    case "leftToolbar":
      targetFrame = _data._toolBarLeft[scrIndex].frame;
      break;
    case "rightToolbar":
      targetFrame = _data._toolBarRight[scrIndex].frame;
      break;
    case "pageOverlay":
      targetFrame = _data.frame;
      break;
    case "TileList":
      if (props.contentEditorParent && props.contentEditorParent["ui"]) {
        const tileUI = props.contentEditorParent["ui"];
        targetFrame["width"] = parseInt(tileUI.dataarray[0]["width"]);
        targetFrame["height"] = parseInt(tileUI.dataarray[0]["height"]);
      }
      break;
    case "Dialog":
      if (props.contentEditorParent && props.contentEditorParent["ui"]) {
        const dialogUI = props.contentEditorParent["ui"];
        const editorwidth =
          parseInt(dialogUI.dataarray[0].width) -
          parseInt(dialogUI.padding.left + dialogUI.padding.right);
        targetFrame["width"] = editorwidth;
        targetFrame["height"] = parseInt(dialogUI.dataarray[0]["height"]);
      }
      break;
    case "Drawer":
      if (props.contentEditorParent && props.contentEditorParent["ui"]) {
        const drawerUI = props.contentEditorParent["ui"];
        const scrFrame = props.appData["availableScreens"][scrIndex];
        const editorwidth =
          parseInt(scrFrame.width) -
          parseInt(drawerUI.padding.left + drawerUI.padding.right);
        targetFrame["width"] = editorwidth;
        targetFrame["height"] = parseInt(drawerUI.dataarray[0]["height"]);
      }
      break;
    case "ExpansionPanel":
      if (props.contentEditorParent && props.contentEditorParent["ui"]) {
        const expnPanelUI = props.contentEditorParent["ui"];
        let indx = props.contentEditorParent["index"]
          ? props.contentEditorParent["index"]
          : 0;
        let panelItems = expnPanelUI["panelItems"];
        //targetFrame['width'] = parseInt(panelItems[indx]['width']);
        targetFrame["height"] = parseInt(panelItems[indx]["height"]);
      }
      break;
    default:
      targetFrame = _data.frame;
      break;
  }

  //console.log(pastedUIframe, "***** setUIpartFrame *****", targetFrame);
  if (parseInt(pastedUIframe["x"]) > parseInt(targetFrame["width"])) {
    pastedUIframe["x"] =
      parseInt(targetFrame["width"]) - parseInt(pastedUIframe["width"]);
  } else if (
    parseInt(pastedUIframe["x"]) + parseInt(pastedUIframe["width"]) >
    parseInt(targetFrame["width"])
  ) {
    pastedUIframe["x"] =
      parseInt(targetFrame["width"]) - parseInt(pastedUIframe["width"]);
  }

  if (parseInt(pastedUIframe["y"]) > parseInt(targetFrame["height"])) {
    pastedUIframe["y"] =
      parseInt(targetFrame["height"]) - parseInt(pastedUIframe["height"]);
  } else if (
    parseInt(pastedUIframe["y"]) + parseInt(pastedUIframe["height"]) >
    parseInt(targetFrame["height"])
  ) {
    pastedUIframe["y"] =
      parseInt(targetFrame["height"]) - parseInt(pastedUIframe["height"]);
  }

  if (parseInt(pastedUIframe["x"]) < 0) {
    pastedUIframe["x"] = 0;
  }
  if (parseInt(pastedUIframe["y"]) < 0) {
    pastedUIframe["y"] = 0;
  }
  if (parseInt(pastedUIframe["width"]) > parseInt(targetFrame["width"])) {
    pastedUIframe["width"] = parseInt(targetFrame["width"]);
  }
  if (parseInt(pastedUIframe["height"]) > parseInt(targetFrame["height"])) {
    pastedUIframe["height"] = parseInt(targetFrame["height"]);
  }

  if (targetEditor && targetEditor.toLowerCase().indexOf("overlay") > -1) {
    pastedUIframe["x"] = pastedUIframe["y"] = 0;
  }

  return pastedUIframe;
}

function resetSelection_UIContainers(editorChildren) {
  editorChildren.forEach((container) => {
    delete container["selected"];
  });
}

function setMultiToolbarsChildren(
  _props,
  targetEditor,
  screensArr,
  currentScreenIndex,
  type,
  cutUIdef,
  childrenArr
) {
  const pageData = _props.currentPage;
  currentScreenIndex = currentScreenIndex ? parseInt(currentScreenIndex) : 0;
  //console.log(currentScreenIndex, type, cutUIdef, ".... paste uipart in toolbar >>>> ", targetEditor, pageData);
  if (targetEditor.toLowerCase().indexOf("toolbar") > -1) {
    let barType;
    if (targetEditor === "topToolbar") barType = "_toolBarTop";
    else if (targetEditor === "bottomToolbar") barType = "_toolBarBottom";
    else if (targetEditor === "leftToolbar") barType = "_toolBarLeft";
    else if (targetEditor === "rightToolbar") barType = "_toolBarRight";

    //console.log(_props, currentScreenIndex, targetEditor, pageData, ".... paste uipart in toolbar >>>> ", barType);
    const toolbarChildren = JSON.parse(
      JSON.stringify(pageData[barType][currentScreenIndex]["Children"])
    );
    for (let i = 0; i < screensArr.length; i++) {
      if (i !== currentScreenIndex) {
        if (cutUIdef) {
          let _slaveScreen_toolbarChildren = pageData[barType][i]["Children"];
          if (type === "delete") {
            for (
              let index = 0;
              index < _slaveScreen_toolbarChildren.length;
              index++
            ) {
              const uidef = _slaveScreen_toolbarChildren[index];
              let uidefparts = uidef["uiParts"];
              if (
                uidefparts &&
                uidefparts[i]["name"] === cutUIdef[0]["uiParts"][i]["name"]
              ) {
                _slaveScreen_toolbarChildren.splice(index, 1);
                break;
              }
            }
          } else {
            //console.log(barType, type, cutUIdef, i, ".... paste uipart in toolbar >>>> ", _slaveScreen_toolbarChildren);
            const pastedUI = JSON.parse(JSON.stringify(cutUIdef));
            pastedUI["selected"] = false;
            _slaveScreen_toolbarChildren.push(pastedUI);
          }
        } else {
          pageData[barType][i]["Children"] = toolbarChildren;
        }
      }
    }
  } else if (targetEditor === "TileList") {
    let tilelistUI;
    const pageChildren = getAllChildrenOnPage(pageData, currentScreenIndex);
    if (pageChildren.length > 1) {
      const sourceUI = _props["contentEditorParent"]["ui"];
      pageChildren.forEach((uipart) => {
        if (
          uipart["viewType"] === "TileList" &&
          uipart["uiParts"][0]["name"] === sourceUI["name"]
        ) {
          tilelistUI = uipart;
        }
      });
    } else {
      tilelistUI = pageChildren[0];
    }

    if (tilelistUI) {
      const tilelistChildren = JSON.parse(
        JSON.stringify(
          tilelistUI["uiParts"][currentScreenIndex]["dataarray"][0]["Fields"]
        )
      );
      for (let i = 0; i < screensArr.length; i++) {
        if (i === currentScreenIndex) continue;

        tilelistUI["uiParts"][i]["dataarray"][0]["Fields"].push(
          tilelistChildren[tilelistChildren.length - 1]
        );
      }

      if (tilelistUI["parent"] === "Dialog") {
        const _dialogUI = pageData["pageOverlay"]["Children"][0];
        for (let l = 0; l < screensArr.length; l++) {
          if (l === currentScreenIndex) continue;

          let _slaveScreen_dialogChildren =
            _dialogUI["uiParts"][l]["dataarray"][0]["Fields"];
          for (
            let index = 0;
            index < _slaveScreen_dialogChildren.length;
            index++
          ) {
            const uidef = _slaveScreen_dialogChildren[index];
            let uidefparts = uidef["uiParts"];
            if (
              uidef["viewType"] === "TileList" &&
              uidefparts[l]["name"] === tilelistUI["uiParts"][l]["name"]
            ) {
              uidef["uiParts"] = JSON.parse(
                JSON.stringify(tilelistUI["uiParts"])
              );
              break;
            }
          }
        }
      } else if (tilelistUI["parent"] === "topToolbar") {
        for (let t = 0; t < screensArr.length; t++) {
          if (t === currentScreenIndex) continue;
          let _slaveScreen_topBarChildren =
            pageData["_toolBarTop"][t]["Children"];
          for (
            let index = 0;
            index < _slaveScreen_topBarChildren.length;
            index++
          ) {
            const uidef = _slaveScreen_topBarChildren[index];
            let uidefparts = uidef["uiParts"];
            if (
              uidef["viewType"] === "TileList" &&
              uidefparts[t]["name"] === tilelistUI["uiParts"][t]["name"]
            ) {
              uidef["uiParts"] = JSON.parse(
                JSON.stringify(tilelistUI["uiParts"])
              );
              break;
            }
          }
        }
      }
    }
  } else if (targetEditor === "Dialog") {
    //console.log(currentScreenIndex, type, cutUIdef, ".... paste uipart in Dialog >>>> ", pageData, _props);

    let dialogUI;
    const overlayChildren = pageData["pageOverlay"]["Children"];
    if (overlayChildren.length > 1) {
      const sourceUI = _props["contentEditorParent"]["ui"];
      let overlayUI = overlayChildren.filter(function (uipart) {
        if (
          uipart["viewType"] === "Dialog" &&
          uipart["uiParts"][0]["name"] === sourceUI["name"]
        ) {
          return uipart;
        }
        return uipart;
      });
      if (overlayUI.length > 0) {
        dialogUI = overlayUI[0];
      }
    } else {
      dialogUI = overlayChildren[0];
    }

    for (let j = 0; j < screensArr.length; j++) {
      if (j === currentScreenIndex) continue;

      let _slaveScreen_dialogChildren =
        dialogUI["uiParts"][j]["dataarray"][0]["Fields"];
      _slaveScreen_dialogChildren.forEach((element) => {
        delete element["selected"];
      });

      const pastedUI = JSON.parse(JSON.stringify(cutUIdef));
      /*for(let aa=0; aa< pastedUI['uiParts'].length; aa++){
          if(aa !== j){
            pastedUI['uiParts'][aa] = {};
          }else{
            delete cutUIdef['selected'];
            cutUIdef['uiParts'][aa] = {};
          }
        }*/
      _slaveScreen_dialogChildren.push(pastedUI);
    }
  }
}

export function getAllChildrenOnPage(_page, scrIndex) {
  //console.log(_page, "... getAllChildrenOnPage >>>>", scrIndex);
  let arrChildren = [];
  if (_page.viewType.indexOf("TableView") > -1) {
    if (
      _page.viewType === "DbTableViewList" ||
      _page.viewType === "RemoteTableViewList" ||
      _page.viewType === "DbTableViewNestedList"
    ) {
      let arrFields0 = _page.Children[0].Group[0].RecordCellDef.Fields;
      for (let i0 = 0; i0 < arrFields0.length; i0++) {
        arrChildren.push(arrFields0[i0]);
      }
      if (_page.viewType === "DbTableViewNestedList") {
        let arrSubFields0 = _page.Children[0].Group[0].SubRecordCellDef.Fields;
        for (let i1 = 0; i1 < arrSubFields0.length; i1++) {
          arrChildren.push(arrSubFields0[i1]);
        }
      }
    } else {
      let arrGroup = _page.Children[0].Group;
      for (let i = 0; i < arrGroup.length; i++) {
        let arrRow = arrGroup[i].rowarray;
        for (let j = 0; j < arrRow.length; j++) {
          if (arrRow[j]) {
            let arrFields = arrRow[j].Fields;
            for (let k = 0; k < arrFields.length; k++) {
              arrChildren.push(arrFields[k]);
            }
          }
        }
      }
    }
  } else {
    let pageChildren;
    if (_page.viewType === "ScrollView" || _page.viewType === "PageScrollView")
      pageChildren = _page.Children[0].Children;
    else pageChildren = _page.Children;

    pageChildren.forEach((uiContainerDic) => {
      arrChildren.push(uiContainerDic);
      if (uiContainerDic["viewType"] === "TileList") {
        let arrTileItems =
          uiContainerDic["uiParts"][scrIndex].dataarray[0]["Fields"];
        for (let u = 0; u < arrTileItems.length; u++) {
          arrChildren.push(arrTileItems[u]);
        }
      } else if (
        uiContainerDic["viewType"] === "ExpansionPanel" ||
        uiContainerDic["viewType"] === "SwipeableView"
      ) {
        const itemFieldName =
          uiContainerDic["viewType"] === "ExpansionPanel"
            ? "panelItems"
            : "swipeableItems";
        let arrrPanelItems = uiContainerDic["uiParts"][scrIndex][itemFieldName];
        for (let p = 0; p < arrrPanelItems.length; p++) {
          let panerItemsField = arrrPanelItems[p]["Fields"];
          for (let pi = 0; pi < panerItemsField.length; pi++) {
            arrChildren.push(panerItemsField[pi]);
          }
        }
      } else if (
        uiContainerDic["viewType"] === "Form" ||
        uiContainerDic["viewType"] === "FormView"
      ) {
        let arrFormItems =
          uiContainerDic["uiParts"][scrIndex].formItems[0]["Fields"];
        for (let f = 0; f < arrFormItems.length; f++) {
          arrChildren.push(arrFormItems[f]);
        }
      }
    });
  }

  // page-bars children

  let cntTop = -1;
  if (_page._toolBarTop.length > 0) {
    _page._toolBarTop.forEach((_topToolbar) => {
      cntTop++;
      if (cntTop === 0) {
        for (let t = 0; t < _topToolbar.Children.length; t++) {
          arrChildren.push(_topToolbar.Children[t]);
          if (_topToolbar.Children[t]["viewType"] === "TileList") {
            let arrtTileItems =
              _topToolbar.Children[t]["uiParts"][scrIndex].dataarray[0][
                "Fields"
              ];
            for (let t0 = 0; t0 < arrtTileItems.length; t0++) {
              arrChildren.push(arrtTileItems[t0]);
            }
          }
        }
      }
    });
  }

  let cntBottom = -1;
  if (_page._toolBarBottom.length > 0) {
    _page._toolBarBottom.forEach((_bottomToolbar) => {
      cntBottom++;
      if (cntBottom === 0) {
        for (let b = 0; b < _bottomToolbar.Children.length; b++) {
          arrChildren.push(_bottomToolbar.Children[b]);
          if (_bottomToolbar.Children[b]["viewType"] === "TileList") {
            let arrbTileItems =
              _bottomToolbar.Children[b]["uiParts"][scrIndex].dataarray[0][
                "Fields"
              ];
            for (let b0 = 0; b0 < arrbTileItems.length; b0++) {
              arrChildren.push(arrbTileItems[b0]);
            }
          }
        }
      }
    });
  }

  let cntLeft = -1;
  if (_page._toolBarLeft.length > 0) {
    _page._toolBarLeft.forEach((_leftToolbar) => {
      cntLeft++;
      if (cntLeft === scrIndex) {
        for (let l = 0; l < _leftToolbar.Children.length; l++) {
          let leftToolbarUI = _leftToolbar.Children[l];
          arrChildren.push(leftToolbarUI);
          if (leftToolbarUI["viewType"] === "TileList") {
            let arrlTileItems =
              leftToolbarUI["uiParts"][scrIndex].dataarray[0]["Fields"];
            for (let l0 = 0; l0 < arrlTileItems.length; l0++) {
              arrChildren.push(arrlTileItems[l0]);
            }
          } else if (
            leftToolbarUI["viewType"] === "ExpansionPanel" ||
            leftToolbarUI["viewType"] === "SwipeableView"
          ) {
            const itemFieldName =
              leftToolbarUI["viewType"] === "ExpansionPanel"
                ? "panelItems"
                : "swipeableItems";
            let arrlPanelItems =
              leftToolbarUI["uiParts"][scrIndex][itemFieldName];
            for (let l1 = 0; l1 < arrlPanelItems.length; l1++) {
              let panelItemsField = arrlPanelItems[l1]["Fields"];
              for (let l10 = 0; l10 < panelItemsField.length; l10++) {
                arrChildren.push(panelItemsField[l10]);
              }
            }
          }
        }
      }
    });
  }
  let cntRight = -1;
  if (_page._toolBarRight && _page._toolBarRight.length > 0) {
    _page._toolBarRight.forEach((_rightToolbar) => {
      cntRight++;
      if (cntRight === scrIndex) {
        for (let r = 0; r < _rightToolbar.Children.length; r++) {
          let rightToolbarUI = _rightToolbar.Children[r];
          arrChildren.push(rightToolbarUI);
          if (rightToolbarUI["viewType"] === "TileList") {
            let arrrTileItems =
              rightToolbarUI["uiParts"][scrIndex].dataarray[0]["Fields"];
            for (let r0 = 0; r0 < arrrTileItems.length; r0++) {
              arrChildren.push(arrrTileItems[r0]);
            }
          } else if (
            rightToolbarUI["viewType"] === "ExpansionPanel" ||
            rightToolbarUI["viewType"] === "SwipeableView"
          ) {
            const itemFieldName =
              rightToolbarUI["viewType"] === "ExpansionPanel"
                ? "panelItems"
                : "swipeableItems";
            let arrrPanelItems =
              rightToolbarUI["uiParts"][scrIndex][itemFieldName];
            for (let r1 = 0; r1 < arrrPanelItems.length; r1++) {
              let panerItemsField = arrrPanelItems[r1]["Fields"];
              for (let r10 = 0; r10 < panerItemsField.length; r10++) {
                arrChildren.push(panerItemsField[r10]);
              }
            }
          }
        }
      }
    });
  }

  if (_page.hasOwnProperty("pageOverlay")) {
    let _objOverlay = _page.pageOverlay;
    let overlayChildren = _objOverlay.Children;
    if (overlayChildren) {
      for (let o = 0; o < overlayChildren.length; o++) {
        arrChildren.push(overlayChildren[o]);
        if (overlayChildren[o]["viewType"] === "Dialog") {
          let arrDialogItems =
            overlayChildren[o]["uiParts"][scrIndex].dataarray[0]["Fields"];
          for (let o0 = 0; o0 < arrDialogItems.length; o0++) {
            if (arrDialogItems[o0]["viewType"] === "TileList") {
              arrDialogItems[o0]["parent"] = "Dialog";
              let arrTileItems =
                arrDialogItems[o0]["uiParts"][scrIndex].dataarray[0]["Fields"];
              for (let u = 0; u < arrTileItems.length; u++) {
                arrChildren.push(arrTileItems[u]);
              }
            }
            arrChildren.push(arrDialogItems[o0]);
          }
        } else if (overlayChildren[o]["viewType"] === "Drawer") {
          let arrDrawerItems =
            overlayChildren[o]["uiParts"][scrIndex].dataarray[0]["Fields"];
          for (let w0 = 0; w0 < arrDrawerItems.length; w0++) {
            if (arrDrawerItems[w0]["viewType"] === "TileList") {
              arrDrawerItems[w0]["parent"] = "Drawer";
              let arrTileItems =
                arrDrawerItems[w0]["uiParts"][scrIndex].dataarray[0]["Fields"];
              for (let u = 0; u < arrTileItems.length; u++) {
                arrChildren.push(arrTileItems[u]);
              }
            }
            arrChildren.push(arrDrawerItems[w0]);
          }
        }
      }
    }
  }

  return arrChildren;
}

////////////////////////////////////////////////////////////////////////

export function getTabModuleAccess(openedpage, selectedtabs, pagelist) {
  let _parentpage;
  let _parentId = openedpage["parentid"];
  if (_parentId !== "App") {
    while (_parentId !== "App") {
      _parentpage = getParantPage(_parentId, pagelist);
      if (_parentpage) {
        _parentId = _parentpage.parentid;
      }
    }
  } else {
    _parentpage = openedpage;
  }

  let openedpageid = _parentpage["pageid"];
  if (selectedtabs && selectedtabs.length > 0) {
    //console.log(pagelist, selectedtabs, "********", _parentpage, openedpageid);
    if (selectedtabs.indexOf(openedpageid) > -1) {
      return true;
    }
    return false;
  }
  return true;
}
function getParantPage(_parentId, pagelist) {
  let parentObjArr = pagelist.filter(function (_page) {
    return _page["pageid"] === _parentId;
  });
  let _parentpage = parentObjArr[0];
  return _parentpage;
}

export function checkProjectRole(projectdata) {
  const username = projectdata["owner"];
  const contributors = projectdata["Contributors"];
  if (contributors) {
    for (let i = 0; i < contributors.length; i++) {
      const contributorObj = contributors[i];
      if (contributorObj["owner"] === "") {
        return "norole";
      }
      if (contributorObj["owner"] === username) {
        return "owner";
      }
    }
    return "contributor";
  }
  return "norole";
}
