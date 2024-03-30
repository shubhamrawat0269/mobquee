import React from "react";
import "./UIContainerStyle.css";
import { connect } from "react-redux";
import { ResizableBox } from "react-resizable";
import { useGlobalEvent } from "beautiful-react-hooks";
import UISwipeableView from "../UISwipeableView/UISwipeableView";
import clsx from "clsx";
import {
  IconButton,
  Typography,
  Box,
  Paper,
  Backdrop,
  Snackbar,
  Slide,
  Popover,
  Tooltip,
} from "@mui/material";
import { Close, Delete } from "@mui/icons-material";

import camera from "../../../assets/uimockup/camera.png";
import soundBlack from "../../../assets/uimockup/soundbox_Black.png";
import soundSilver from "../../../assets/uimockup/soundbox_Silver.png";
import videobox from "../../../assets/uimockup/videobox.png";
import ButtonView from "../mockups/ButtonView/ButtonView";
import UILabel from "../mockups/UILabel/UILabel";
import UITextField from "../mockups/UITextField/UITextField";
import UINumField from "../mockups/UINumField/UINumField";
import UITextView from "../mockups/UITextView/UITextView";
import UIImage from "../mockups/UIImage/UIImage";
import UIWebView from "../mockups/UIWebView/UIWebView";
import UILinkLabel from "../mockups/UILinkLabel/UILinkLabel";
import UISwitch from "../mockups/UISwitch/UISwitch";
import UISlider from "../mockups/UISlider/UISlider";
import UIDatePicker from "../mockups/UIDatePicker/UIDatePicker";
import UICalendar from "../mockups/UICalendar/UICalendar";
import UIPicker from "../mockups/UIPicker/UIPicker";
import UIComboBox from "../mockups/UIComboBox/UIComboBox";
import UIProgress from "../mockups/UIProgress/UIProgress";
import UIMapView from "../mockups/UIMapView/UIMapView";
import UITileList from "../mockups/UITileList/UITileList";
import UISearchBar from "../mockups/UISearchBar/UISearchBar";
import UISegment from "../mockups/UISegment/UISegment";
import UICheckBox from "../mockups/UICheckBox/UICheckBox";
import UIDialog from "../mockups/UIDialog/UIDialog";
import UIDrawer from "../mockups/UIDrawer/UIDrawer";
import UIIndicator from "../mockups/UIIndicator/UIIndicator";
import UITabs from "../mockups/UITabs/UITabs";

import UIPropertyEditor from "../UIPropertyEditor/UIPropertyEditor";
import PropertyValueEditor from "../PropertyValueEditor/PropertyValueEditor";
import {
  setSelectedLayout,
  setSelectedUI,
  setSelectedUIparts,
  setSelectedPageData,
} from "../../ServiceActions";
import { setCutCopyUIObj, handleUIPaste } from "../../helpers/Utility";
import UISkeleton from "../mockups/UISkeleton/UISkeleton";
import UIAvatar from "../mockups/UIAvatar/UIAvatar";
import UILiveFeed from "../mockups/UILiveFeed/UILiveFeed";
import UIFormView from "../mockups/UIFormView/UIFormView";
import UIChartView from "../mockups/UIChartView/UIChartView";
import UIHeatMap from "../mockups/UIHeatMap/UIHeatMap";
import UIGrid from "../mockups/UIGrid/UIGrid";
import UIExpansionPanel from "../mockups/UIExpansionPanel/UIExpansionPanel";

function PaperComponent(props) {
  return <Paper {...props} className="paper-container" />;
}

class UIContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      uichildren: this.props.data,
      type: this.props.viewtype,
      screenId: this.props.screenIndex,
      uiparts: this.props.uipartdic,
      uiLocale: [],
      error: null,
      handleListUI: this.props.handleListUI,
      moveObj: {},
      isCtrl: false,
      uiObjtoPaste: [],

      openalert: false,
      alertmsg: "",
      akshay: 0,
      isDrawing: false,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
    };
  }

  abortController = new AbortController();

  componentDidMount() {
    // this.fetchUIPartsDic();
    //this.fetchUILocale('en');
  }
  componentWillUnmount() {
    this.abortController.abort();
  }

  fetchUIPartsDic() {
    fetch("././config/UIPartDic.json", { signal: this.abortController.signal })
      .then((res) => res.json())
      .then(
        (result) => {
          let uiParts = result["UIParts"];
          this.setState({ uiparts: uiParts });
        },
        (error) => {
          console.log("UI-parts fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  fetchUILocale(lang) {
    let localefilePath;
    if (lang === "ja" || lang === "jp") {
      localefilePath = "././locale/ja_JP/uiparts.properties";
    } else {
      localefilePath = "././locale/en_US/uiproperties.json";
    }
    fetch(localefilePath)
      .then((res) => res.json())
      .then(
        (result) => {
          let uiLocale = result["UILocale"];
          this.setState({ uiLocale: uiLocale });
        },
        (error) => {
          console.log("UI-Locale fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.currentUI !== this.props.currentUI) {
      if (
        this.props.currentUI &&
        !this.props.currentUI.hasOwnProperty("viewType")
      ) {
        this.resetUISelection();
        this.setState({ uichildren: this.props.data });
      }
    } else if (
      prevProps.data !== this.props.data ||
      prevProps.screenIndex !== this.props.screenIndex
    ) {
      //console.log(this.state.uichildren, ".... UIContainer componentDidUpdate ....", this.props.data);
      this.setState({ uichildren: this.props.data });
    }
  }

  //////////////////////////////////////////////////////

  getDraggedUI = (uiname, uitype) => {
    const scrIndex = this.props.screenIndex ? this.props.screenIndex : 0;
    let uiContainers = this.props.data.filter(function (uicontainer) {
      return uicontainer["viewType"] === uitype;
    });
    for (let i = 0; i < uiContainers.length; i++) {
      const uiparts = uiContainers[i]["uiParts"];
      if (uiparts[scrIndex]["name"] === uiname) {
        return uiparts[scrIndex];
      }
    }
  };

  handleUIlayoutDragStart = (ev, uiname, uitype, dx, dy) => {
    const uidata = uiname + "#" + uitype + "#" + dx + "#" + dy;
    ev.dataTransfer.setData("text/plain", "move_" + uidata);
  };

  handleDragStart = (ev) => {
    //console.log(ev.currentTarget, " ... handleDragStart >>>>>>", ev.clientX, ev.clientY);
  };

  handleDropAllow = (ev) => {
    let _moveObj = this.state.moveObj;
    if (!_moveObj.hasOwnProperty("x")) {
      let mObj = { x: ev.clientX, y: ev.clientY };
      this.setState({ moveObj: mObj });
    }

    //ev.currentTarget.style.background = "lightyellow";
    ev.preventDefault();
  };

  handleUIDrop = (ev) => {
    ev.currentTarget.style.background = "";
    ev.preventDefault();

    let rect = ev.currentTarget.getBoundingClientRect();
    let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    let posX = ev.clientX - (rect.left + scrollLeft);
    if (posX < 0) posX = 0;
    let posY = ev.clientY - (rect.top + scrollTop);
    if (posY < 0) posY = 0;

    let _snapGrid = false;
    let _gridGap = 10;
    const pageid = this.props.currentPage["pageid"];
    let layoutParams = getLayoutParams(
      this.props.editorState["_pagestates"],
      pageid
    );
    if (layoutParams) {
      _snapGrid = layoutParams["snapgrid"] === "on" ? true : false;
      _gridGap = layoutParams["gridgap"];
    }

    let droppedNodeData = ev.dataTransfer.getData("text/plain");
    if (droppedNodeData === "" || droppedNodeData.indexOf("move_") === 0) {
      let _draggedUI = this.props.currentUI;
      let _dx = 0;
      let _dy = 0;
      if (droppedNodeData.indexOf("move_") > -1) {
        droppedNodeData = droppedNodeData.replace("move_", "");
        const droppedDataArr = droppedNodeData.split("#");
        const draggedUIDef = this.getDraggedUI(
          droppedDataArr[0],
          droppedDataArr[1]
        );
        if (draggedUIDef) {
          _draggedUI = draggedUIDef;
        }
        _dx = droppedDataArr[2];
        _dy = droppedDataArr[3];
      }

      const newX = parseInt(posX) - parseInt(_dx);
      const newY = parseInt(posY) - parseInt(_dy);

      const oldX = _draggedUI["frame"]["x"];
      const oldY = _draggedUI["frame"]["y"];

      const shiftX = newX - oldX;
      const shiftY = newY - oldY;

      _draggedUI["frame"]["x"] = newX;
      _draggedUI["frame"]["y"] = newY;

      let _moveObj = this.state.moveObj;
      let deltaX = parseInt(ev.clientX - _moveObj.x);
      let deltaY = parseInt(ev.clientY - _moveObj.y);

      this.setState({ moveObj: {} });
      //this.resetUISelection();
      //this.props.dispatch(setSelectedUI({}));

      if (this.props.selectedUIs && this.props.selectedUIs.length > 0) {
        //deltaX = posX-parseInt(_dx);
        //deltaY = posY-parseInt(_dy);

        for (let i = 0; i < this.props.selectedUIs.length; i++) {
          const UIelement = this.props.selectedUIs[i];
          const uipart = UIelement["UI"];
          if (uipart === _draggedUI) {
            deltaX = deltaY = 0;
          } else {
            deltaX = shiftX;
            deltaY = shiftY;
          }

          this.handleUIMove(uipart, deltaX, deltaY, rect, _snapGrid, _gridGap);
        }
      } else {
        /* this.props.currentUI['frame']['x'] = posX;
        this.props.currentUI['frame']['y'] = posY; */
        deltaX = deltaY = 0;
        this.handleUIMove(
          this.props.currentUI,
          deltaX,
          deltaY,
          rect,
          _snapGrid,
          _gridGap
        );

        let _uichildren = this.state.uichildren;
        _uichildren.forEach((element) => {
          let _uipart = element["uiParts"][0];
          if (
            _uipart["name"] === this.props.currentUI["name"] &&
            _uipart["viewType"] === this.props.currentUI["viewType"]
          ) {
            element["selected"] = true;
            this.props.dispatch(setSelectedUI(this.props.currentUI));
          }
        });
        this.setState({ uichildren: _uichildren });
      }
      this.updateCurrentUI_inMultiScreen();
      this.updatePageState(false);
      setDocument_forUIpart(this.props.currentUI, false);
    } else {
      let dx = 0;
      let dy = 0;
      let _viewType = droppedNodeData;
      if (droppedNodeData.indexOf("_") > -1) {
        const droppedDataArr = droppedNodeData.split("_");
        _viewType = droppedDataArr[0];
        dx = droppedDataArr[1];
        dy = droppedDataArr[2];
      }

      if (this.props.source === "tablecell") {
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
          "GoogleMap",
          "ComboBox",
          "Chart",
          "Slider",
          "ProgressBar",
        ];
        const findUI = allowedUIparts.find((element) => element === _viewType);
        const isAllowedUI = findUI ? true : false;
        if (!isAllowedUI) {
          this.setState({ openalert: true });
          this.setState({ alertmsg: _viewType + " UI part not allowed here." });
          return false;
        }
      } else if (
        this.props.source === "Dialog" ||
        this.props.source === "Drawer"
      ) {
        const notallowedUIparts = [
          "Dialog",
          "Drawer",
          "SoundBox",
          "VideoBox",
          "ExpansionPanel",
          "SwipeableView",
        ];
        const findUI = notallowedUIparts.find(
          (element) => element === _viewType
        );
        const isNotAllowedUI = findUI ? true : false;
        if (isNotAllowedUI) {
          this.setState({ openalert: true });
          this.setState({ alertmsg: _viewType + " UI part not allowed here." });
          return false;
        }
      } else {
        if (_viewType === "TileList") {
          /*if (
            this.props.source === "page" ||
            this.props.source === "topToolbar" ||
            this.props.source === "Dialog" ||
            this.props.source === "Drawer" ||
            this.props.source === "ExpansionPanel"
          ) {
            //console.log("TileList dropped on :", this.props.source);
          } else {
            this.setState({ openalert: true });
            this.setState({ alertmsg: "TileList UI part not allowed here." });
            return false;
          }*/

          const allowedContainers = [
            "page",
            "topToolbar",
            "Dialog",
            "Drawer",
            "ExpansionPanel",
            "SwipeableView",
          ];
          const findContainer = allowedContainers.find(
            (element) => element === this.props.source
          );
          const isAllowedContainer = findContainer ? true : false;
          if (!isAllowedContainer) {
            this.setState({ openalert: true });
            this.setState({ alertmsg: "TileList UI part not allowed here." });
            return false;
          } else {
            console.log("findContainer >>>>", findContainer);
            if (findContainer === "SwipeableView") {
              this.setState({ openalert: true });
              this.setState({
                alertmsg: "'Horizontal' TileList will be not supported on RTs.",
              });
            }
          }
        } else if (_viewType === "Chart") {
          if (
            this.props.source === "tablecell" ||
            this.props.source === "TileList"
          ) {
            this.setState({ openalert: true });
            this.setState({ alertmsg: "Chart UI part not allowed here." });
            return false;
          }
        } else if (
          _viewType === "ExpansionPanel" ||
          _viewType === "SwipeableView"
        ) {
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
            (element) => element === this.props.source
          );
          const isNotAllowedContainer = findContainer ? true : false;
          if (isNotAllowedContainer) {
            this.setState({ openalert: true });
            const uiName =
              _viewType === "ExpansionPanel"
                ? "Expansion Panel"
                : "Swipeable View";
            this.setState({ alertmsg: uiName + " not allowed here." });
            return false;
          }
        } else if (_viewType === "Form" || _viewType === "FormView") {
          if (this.props.source === "page" || this.props.source === "Dialog") {
            //console.log("Form View dropped on :", this.props.source);
          } else {
            this.setState({ openalert: true });
            this.setState({ alertmsg: "FormView UI not allowed here." });
            return false;
          }
        }
      }
      if (
        this.props.contentEditorParent &&
        this.props.contentEditorParent.hasOwnProperty("source")
      ) {
        if (this.props.contentEditorParent["source"] === "overlay") {
          const allowedUI =
            _viewType === "Dialog" || _viewType === "Drawer" ? true : false;
          if (!allowedUI) {
            this.setState({ openalert: true });
            this.setState({
              alertmsg: "Only 'Dialog' or 'Drawer' UI allowed on Page Overlay.",
            });
            return false;
          }
        } else if (this.props.contentEditorParent["source"] === "Form") {
          if (_viewType === "Dialog" || _viewType === "Drawer") {
            this.setState({ openalert: true });
            this.setState({
              alertmsg: "'" + _viewType + "' UI not allowed here.",
            });
            return false;
          } else {
            const formUI = this.props.contentEditorParent["ui"];
            let index = this.props.contentEditorParent["index"]
              ? this.props.contentEditorParent["index"]
              : 0;
            let formItems = formUI["formItems"];
            if (formItems[index]["Fields"].length === 1) {
              this.setState({ openalert: true });
              this.setState({
                alertmsg: "Only one UI part allowed in one form item.",
              });
              return false;
            }
          }
        } else if (this.props.contentEditorParent["source"] === "Grid") {
          if (_viewType === "Dialog" || _viewType === "Drawer") {
            this.setState({ openalert: true });
            this.setState({
              alertmsg: "'" + _viewType + "' UI not allowed here.",
            });
            return false;
          } else {
            const gridUI = this.props.contentEditorParent["ui"];
            let index = this.props.contentEditorParent["index"]
              ? this.props.contentEditorParent["index"]
              : 0;
            let gridItems = gridUI["gridItems"];
            // the value after columnList must be dynamic in nature..
            if (gridItems[index]["columnList"][0]["Fields"].length === 1) {
              this.setState({ openalert: true });
              this.setState({
                alertmsg: "Only one UI part allowed in one form item.",
              });
              return false;
            }
          }
        } else if (
          this.props.contentEditorParent["source"] === "ExpansionPanel" ||
          this.props.contentEditorParent["source"] === "SwipeableView"
        ) {
          if (_viewType === "Dialog" || _viewType === "Drawer") {
            this.setState({ openalert: true });
            this.setState({
              alertmsg: "'" + _viewType + "' UI not allowed here.",
            });
            return false;
          }
        }
      } else {
        /* if(_viewType === "Dialog"){
          this.setState({openalert: true});
          this.setState({alertmsg: "Dialog UI allowed on 'Page Overlay' only"});
          return false;
        } */

        if (this.props.source === "pageOverlay") {
          //this.setState({openalert: true});
          //this.setState({alertmsg: "Click on 'Page Setting > Page Overlay > UI Items' to drop any UI."});
          return false;
        } else {
          if (_viewType === "Dialog" || _viewType === "Drawer") {
            this.setState({ openalert: true });
            this.setState({
              alertmsg: _viewType + " UI allowed on 'Page Overlay' only",
            });
            return false;
          }
        }
      }

      posX = parseInt(posX) - parseInt(dx);
      posY = parseInt(posY) - parseInt(dy);
      this.createUIData(
        _viewType,
        parseInt(posX),
        parseInt(posY),
        parseInt(rect.width),
        parseInt(rect.height),
        _snapGrid,
        _gridGap
      );
    }

    return false;
  };

  handleUIMove(uiDic, deltaX, deltaY, rect, isSnap, gridGap) {
    if (!uiDic) return;
    if (!uiDic["frame"]) return;

    let frameX = parseInt(uiDic["frame"]["x"]);
    let frameY = parseInt(uiDic["frame"]["y"]);
    let frameW = parseInt(uiDic["frame"]["width"]);
    let frameH = parseInt(uiDic["frame"]["height"]);

    uiDic["frame"]["width"] = parseInt(frameW);
    uiDic["frame"]["height"] = parseInt(frameH);

    frameX = parseInt(frameX) + deltaX;
    frameY = parseInt(frameY) + deltaY;

    if (isSnap) {
      const frameObj = { x: frameX, y: frameY, width: frameW, height: frameH };
      let _snapFrame = setUIObjectInGrid(frameObj, gridGap);

      frameX = _snapFrame["x"];
      frameY = _snapFrame["y"];
    }

    const rectWid =
      rect["width"] === 0
        ? this.props["containerFrame"]["width"]
        : rect["width"];
    if (frameX + frameW > rectWid) frameX = rectWid - (frameW + 1);
    uiDic["frame"]["x"] = frameX < 0 ? 0 : parseInt(frameX);

    if (frameY + frameH > rect["height"])
      frameY = rect["height"] - (frameH + 1);
    uiDic["frame"]["y"] = frameY < 0 ? 0 : parseInt(frameY);
  }

  createUIData(droppedUIData, X, Y, containerW, containerH, isSnap, gridGap) {
    let uiContainer = { _uid: "", viewType: droppedUIData, uiParts: [] };

    const validUIMsg = validateDroppedUI(droppedUIData, this.props);
    if (validUIMsg["message"].length > 0) {
      //console.log(this.props, " <<< createUIData >>>", droppedUIData, validUIMsg);
      this.setState({ openalert: true });
      this.setState({ alertmsg: validUIMsg["message"] });
      if (validUIMsg["restrict"]) return;
    }

    const isMasterSlave = this.props.appData["isMasterScreenSet"];
    const currentScreenIndex = this.props.screenIndex;
    let masterScreenIndex = 0;
    let screens = this.props.appData["availableScreens"];
    screens.forEach((element, i) => {
      if (element["embed"]) {
        masterScreenIndex = i;
      }
    });

    let enableforAllScreen = false;
    if (isMasterSlave && currentScreenIndex === masterScreenIndex) {
      enableforAllScreen = true;
    }

    let droppedUIName = this.getUIName(droppedUIData);

    let _uichildren = this.state.uichildren;
    const uiParts = this.state.uiparts;
    if (uiParts.length > 0) {
      const baseUIdic = uiParts[0].dic;
      let droppedUIdic = uiParts.filter(function (uidic) {
        return uidic.name === droppedUIData;
      });
      if (droppedUIdic.length === 0) return;

      let uipartDic = Object.assign({}, baseUIdic, droppedUIdic[0].dic);
      //uipartDic = this.updateUIpartDicwithStyle(uipartDic);
      uipartDic.name = droppedUIName;

      const orderId = getUIpart_orderIndex(_uichildren, 0);
      uipartDic.displayOrderOnScreen = parseInt(orderId) + 1;
      if (uipartDic["taborder"]) {
        uipartDic.taborder = orderId;
      }

      let scaleW = 1,
        scaleH = 1;
      let _uipart;
      for (let index = 0; index < screens.length; index++) {
        const uipart = JSON.parse(JSON.stringify(uipartDic));

        if (index !== masterScreenIndex) {
          scaleW = screens[index].width / screens[masterScreenIndex].width;
          scaleH = screens[index].height / screens[masterScreenIndex].height;
        }

        containerW = this.getContainerDimensions(
          screens[index],
          index,
          "width"
        );
        containerH = this.getContainerDimensions(
          screens[index],
          index,
          "height"
        );

        if (
          uipart.hasOwnProperty("font") ||
          uipart.hasOwnProperty("normalFont")
        ) {
          let _fontObj = uipart.font ? uipart.font : uipart.normalFont;
          _fontObj.fontSize = Math.floor(_fontObj.fontSize * scaleH);
        }

        if (isSnap) {
          const frameObj = {
            x: X,
            y: Y,
            width: parseInt(uipart.frame.width),
            height: parseInt(uipart.frame.height),
          };
          let _snapFrame = setUIObjectInGrid(frameObj, gridGap);

          X = _snapFrame["x"];
          Y = _snapFrame["y"];
        }

        uipart.frame.x =
          X + uipart.frame.width > containerW
            ? containerW - uipart.frame.width - 1
            : X;
        uipart.frame.y =
          Y + uipart.frame.height > containerH
            ? containerH - uipart.frame.height - 1
            : Y;

        uipart.frame.x = uipart.frame.x > -1 ? Math.floor(uipart.frame.x) : 0;
        uipart.frame.y = uipart.frame.y > -1 ? Math.floor(uipart.frame.y) : 0;
        uipart.frame.width = Math.floor(uipart.frame.width * scaleW);
        if (uipart.frame.width > containerW) {
          uipart.frame.width = containerW;
        }
        uipart.frame.height = Math.floor(uipart.frame.height * scaleH);
        if (uipart.frame.height > containerH) {
          uipart.frame.height = containerH;
        }

        if (droppedUIData === "Dialog") {
          uipart.frame.x = 0;
          uipart.frame.y = 0;
          uipart.frame.width = screens[index]["width"];
          uipart.frame.height = screens[index]["height"];
          uipart["headerheight"] = Math.floor(uipart["headerheight"] * scaleH);
          uipart["footerheight"] = Math.floor(uipart["footerheight"] * scaleH);

          uipart.dataarray[0].width =
            uipart.frame.width -
            uipart["padding"]["left"] -
            uipart["padding"]["right"];
          let contentHeight =
            uipart.frame.height -
            uipart["padding"]["top"] -
            uipart["padding"]["bottom"];
          if (uipart["showheader"]) {
            contentHeight = contentHeight - uipart["headerheight"];
          }
          if (uipart["showfooter"]) {
            contentHeight = contentHeight - uipart["footerheight"];
          }
          uipart.dataarray[0].height = contentHeight;
        } else if (droppedUIData === "Drawer") {
          const currentScreen = screens[index];
          const defaultWidth = currentScreen["width"]
            ? parseInt(currentScreen["width"])
            : parseInt(uipart.frame.width);
          const defaultHeight = currentScreen["height"]
            ? parseInt(currentScreen["height"] / 2)
            : parseInt(uipart.frame.height);
          uipart.frame.x = 0;
          uipart.frame.y = defaultHeight;
          uipart.frame.width = defaultWidth;
          uipart.frame.height = parseInt(defaultHeight);
        }

        setDocument_forUIpart(uipart, true);

        _uipart = JSON.parse(JSON.stringify(uipart));
        if (!enableforAllScreen) {
          if (index === currentScreenIndex) {
            _uipart["_enabledOnScreen"] = true;
          } else {
            _uipart["_enabledOnScreen"] = false;
          }
        }
        uiContainer.uiParts.push(_uipart);
      }

      const currUIDef = uiContainer.uiParts[currentScreenIndex]
        ? uiContainer.uiParts[currentScreenIndex]
        : _uipart;
      // console.log(currUIDef);
      this.handleUISelection(currUIDef);
      uiContainer["selected"] = true;

      _uichildren.push(uiContainer);
      this.setState({ uichildren: _uichildren });

      if (screens.length > 1) {
        if (this.props.source.toLowerCase().indexOf("toolbar") > -1) {
          let barType;
          if (this.props.source === "topToolbar") barType = "_toolBarTop";
          else if (this.props.source === "bottomToolbar")
            barType = "_toolBarBottom";
          else if (this.props.source === "leftToolbar")
            barType = "_toolBarLeft";
          else if (this.props.source === "rightToolbar")
            barType = "_toolBarRight";

          const toolbarChildren = JSON.parse(JSON.stringify(uiContainer));
          for (let i = 0; i < screens.length; i++) {
            if (i === currentScreenIndex) continue;

            /*for(let aa=0; aa< toolbarChildren['uiParts'].length; aa++){
              if(aa !== i){
                toolbarChildren['uiParts'][aa] = {};
              }else{
                delete uiContainer['selected'];
                uiContainer['uiParts'][aa] = {};
              }
            }*/
            this.props["pagedata"][barType][i]["Children"].push(
              toolbarChildren
            );
          }
        } else if (this.props.source === "TileList") {
          let tilelistUI;
          const pageChildren = getAllChildrenOnPage(
            this.props["pagedata"],
            currentScreenIndex
          ); //getChildrenArray("page", this.props['pagedata']);
          if (pageChildren.length > 1) {
            const sourceUI = this.props["contentEditorParent"]["ui"];
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
            const tilelistChildren = JSON.parse(JSON.stringify(uiContainer));
            for (let i = 0; i < screens.length; i++) {
              if (i === currentScreenIndex) continue;

              tilelistUI["uiParts"][i]["dataarray"][0]["Fields"].push(
                tilelistChildren
              );
            }

            if (tilelistUI["parent"] === "Dialog") {
              const _dialogUI =
                this.props["pagedata"]["pageOverlay"]["Children"][0];
              for (let l = 0; l < screens.length; l++) {
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
              for (let t = 0; t < screens.length; t++) {
                if (t === currentScreenIndex) continue;
                let _slaveScreen_topBarChildren =
                  this.props["pagedata"]["_toolBarTop"][t]["Children"];
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
        } else if (
          this.props.source === "Dialog" ||
          this.props.source === "Drawer"
        ) {
          let sourceViewtype = this.props.source;
          let dialogUI;
          const overlayChildren =
            this.props["pagedata"]["pageOverlay"]["Children"];
          if (overlayChildren.length > 1) {
            const sourceUI = this.props["contentEditorParent"]["ui"];
            let overlayUI = overlayChildren.filter(function (uipart) {
              if (
                uipart["viewType"] === sourceViewtype &&
                uipart["uiParts"][0]["name"] === sourceUI["name"]
              ) {
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
          //console.log(this.props, ".... dialog uipart >>>> ", dialogUI, "&&&&", uiContainer);
          if (dialogUI) {
            const dialogChildren = JSON.parse(JSON.stringify(uiContainer));
            for (let i = 0; i < screens.length; i++) {
              if (i === currentScreenIndex) continue;

              dialogUI["uiParts"][i]["dataarray"][0]["Fields"].push(
                dialogChildren
              );
              /*let _slaveScreen_dialogChildren = dialogUI['uiParts'][i]['dataarray'][0]['Fields'];
              _slaveScreen_dialogChildren.forEach(element => {
                delete element['selected'];
              });

              for(let aa=0; aa< dialogChildren['uiParts'].length; aa++){
                if(aa !== i){
                  dialogChildren['uiParts'][aa] = {};
                }else{
                  delete uiContainer['selected'];
                  uiContainer['uiParts'][aa] = {};
                }
              }
              _slaveScreen_dialogChildren.push(dialogChildren);*/
            }
          }
        } else if (this.props.source === "ExpansionPanel") {
          let expnPanelUI;
          const pageChildren = getAllChildrenOnPage(
            this.props["pagedata"],
            currentScreenIndex
          );
          if (pageChildren.length > 1) {
            const sourceUI = this.props["contentEditorParent"]["ui"];
            pageChildren.forEach((uipart) => {
              if (
                uipart["viewType"] === "ExpansionPanel" &&
                uipart["uiParts"][0]["name"] === sourceUI["name"]
              ) {
                expnPanelUI = uipart;
              }
            });
          } else {
            expnPanelUI = pageChildren[0];
          }

          if (expnPanelUI) {
            const expnPanelChildren = JSON.parse(JSON.stringify(uiContainer));
            for (let i = 0; i < screens.length; i++) {
              if (i === currentScreenIndex) continue;
              const panelIndex = this.props["contentEditorParent"]["index"];
              expnPanelUI["uiParts"][i]["panelItems"][panelIndex][
                "Fields"
              ].push(expnPanelChildren);
            }
            if (
              expnPanelUI["parent"] === "leftToolbar" ||
              expnPanelUI["parent"] === "rightToolbar"
            ) {
              const toolBarType =
                expnPanelUI["parent"] === "leftToolbar"
                  ? "_toolBarLeft"
                  : "_toolBarRight";
              for (let t = 0; t < screens.length; t++) {
                if (t === currentScreenIndex) continue;
                let _slaveScreen_toolBarChildren =
                  this.props["pagedata"][toolBarType][t]["Children"];
                for (
                  let index = 0;
                  index < _slaveScreen_toolBarChildren.length;
                  index++
                ) {
                  const uidef = _slaveScreen_toolBarChildren[index];
                  let uidefparts = uidef["uiParts"];
                  if (
                    uidef["viewType"] === "ExpansionPanel" &&
                    uidefparts[t]["name"] === expnPanelUI["uiParts"][t]["name"]
                  ) {
                    uidef["uiParts"] = JSON.parse(
                      JSON.stringify(expnPanelUI["uiParts"])
                    );
                    break;
                  }
                }
              }
            }
          }
        } else if (this.props.source === "SwipeableView") {
          let swipeViewUI;
          const pageChildren = getAllChildrenOnPage(
            this.props["pagedata"],
            currentScreenIndex
          );
          if (pageChildren.length > 1) {
            const sourceUI = this.props["contentEditorParent"]["ui"];
            pageChildren.forEach((uipart) => {
              if (
                uipart["viewType"] === "SwipeableView" &&
                uipart["uiParts"][0]["name"] === sourceUI["name"]
              ) {
                swipeViewUI = uipart;
              }
            });
          } else {
            swipeViewUI = pageChildren[0];
          }

          if (swipeViewUI) {
            const swipeViewChildren = JSON.parse(JSON.stringify(uiContainer));
            for (let i = 0; i < screens.length; i++) {
              if (i === currentScreenIndex) continue;
              const panelIndex = this.props["contentEditorParent"]["index"];
              swipeViewUI["uiParts"][i]["swipeableItems"][panelIndex][
                "Fields"
              ].push(swipeViewChildren);
            }

            if (
              swipeViewUI["parent"] === "leftToolbar" ||
              swipeViewUI["parent"] === "rightToolbar"
            ) {
              const toolBarType =
                swipeViewUI["parent"] === "leftToolbar"
                  ? "_toolBarLeft"
                  : "_toolBarRight";
              for (let t = 0; t < screens.length; t++) {
                if (t === currentScreenIndex) continue;
                let _slaveScreen_toolBarChildren =
                  this.props["pagedata"][toolBarType][t]["Children"];
                for (
                  let index = 0;
                  index < _slaveScreen_toolBarChildren.length;
                  index++
                ) {
                  const uidef = _slaveScreen_toolBarChildren[index];
                  let uidefparts = uidef["uiParts"];
                  if (
                    uidef["viewType"] === "SwipeableView" &&
                    uidefparts[t]["name"] === swipeViewUI["uiParts"][t]["name"]
                  ) {
                    uidef["uiParts"] = JSON.parse(
                      JSON.stringify(swipeViewUI["uiParts"])
                    );
                    break;
                  }
                }
              }
            }
          }
        }

        //let _page = JSON.parse(JSON.stringify(this.props['currentPage']));
        //this.props.dispatch(setSelectedPageData(_page));
      }
      this.updatePageState(true);
    }
  }

  updateUIpartDicwithStyle(uipartDic) {
    const appUIStyle = this.props.appData["AppStyle"]["UIpartStyle"];
    if (appUIStyle && appUIStyle.length > 0) {
      console.log(
        uipartDic["viewType"],
        "...... updateUIDic ----->>>>>",
        uipartDic
      );
      let uitype = uipartDic["viewType"];
      if (uitype === "Button") {
        if (uipartDic.type === "CheckBox") {
          uitype = "CheckBox";
        } else if (uipartDic.type === "System") {
          uitype = "SystemButton";
        } else {
          const _btnType = uipartDic.buttonType;
          uitype =
            _btnType.charAt(0).toUpperCase() +
            _btnType.substr(1).toLowerCase() +
            uitype;
        }
      }

      const uipartStyle = appUIStyle.find((x) => x["name"] === uitype);
      const styleObj = uipartStyle["style"].find(
        (x) => x["name"] === "default"
      );
      const styleChildren = styleObj["children"];
      //console.log(appUIStyle, "...... UIStyle ----->>>>>", styleChildren);

      uipartDic["stylename"] = "default";
      if (uipartDic.hasOwnProperty("backgroundColor")) {
        uipartDic["backgroundColor"] = this.getStylePropValue(
          styleChildren,
          "background",
          "color"
        );
        uipartDic["backgroundColor"]["alpha"] = this.getStylePropValue(
          styleChildren,
          "background",
          "alpha"
        );
      }
      if (uipartDic.hasOwnProperty("borderColor")) {
        uipartDic["borderColor"] = this.getStylePropValue(
          styleChildren,
          "border",
          "color"
        );
        uipartDic["borderColor"]["alpha"] = this.getStylePropValue(
          styleChildren,
          "border",
          "alpha"
        );
      }
      if (uipartDic.hasOwnProperty("borderWeight")) {
        uipartDic["borderWeight"] = this.getStylePropValue(
          styleChildren,
          "border",
          "width"
        );
      }
      if (uipartDic.hasOwnProperty("cornerRadius")) {
        uipartDic["cornerRadius"] = this.getStylePropValue(
          styleChildren,
          "border",
          "radius"
        );
      }
      /*if(uipartDic.hasOwnProperty("textColor")) {
        uipartDic['textColor'] = this.getStylePropValue(styleChildren, 'text', 'color');
      }*/
      if (
        uipartDic.hasOwnProperty("font") ||
        uipartDic.hasOwnProperty("normalFont")
      ) {
        const uiFont = uipartDic.hasOwnProperty("font")
          ? uipartDic["font"]
          : uipartDic["normalFont"];
        uiFont["fontName"] = this.getStylePropValue(
          styleChildren,
          "font",
          "family"
        );
        uiFont["fontSize"] = parseInt(
          this.getStylePropValue(styleChildren, "font", "size")
        );
        uiFont["fontStyle"] = this.getStylePropValue(
          styleChildren,
          "font",
          "style"
        );
        uiFont["fontWeight"] = this.getStylePropValue(
          styleChildren,
          "font",
          "weight"
        );
        uiFont["textAlignment"] = this.getStylePropValue(
          styleChildren,
          "text",
          "align"
        );
        uiFont["textColor"] = this.getStylePropValue(
          styleChildren,
          "text",
          "color"
        );
      }
      if (uipartDic.hasOwnProperty("verticalAlignment")) {
        uipartDic["verticalAlignment"] = this.getStylePropValue(
          styleChildren,
          "text",
          "valign"
        );
      }
      if (uipartDic.hasOwnProperty("underline")) {
        uipartDic["underline"] = this.getStylePropValue(
          styleChildren,
          "text",
          "underline"
        );
      }
      if (uipartDic.hasOwnProperty("strikeout")) {
        uipartDic["strikeout"] = this.getStylePropValue(
          styleChildren,
          "text",
          "line-through"
        );
      }
      if (uipartDic.hasOwnProperty("textShadow")) {
        uipartDic["textShadow"] = this.getStylePropValue(
          styleChildren,
          "text",
          "shadow"
        );
      }
    }

    return uipartDic;
  }
  getStylePropValue(styleChildren, stylename, propname) {
    let propval = "";
    let styleObj = styleChildren.find((x) => x["name"] === stylename);
    if (styleObj) {
      styleObj["children"].forEach((element) => {
        if (element["name"] === propname) {
          if (propname === "style") {
            propval = element["value"] === "normal" ? 0 : 1;
          } else if (propname === "weight") {
            propval = element["value"] === "normal" ? 0 : 1;
          } else {
            if (element["type"] === "color") {
              propval = this.hextoRGB(element["value"]);
            } else {
              propval = element["value"];
            }
          }
        }
      });
    }
    return propval;
  }
  hextoRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          red: parseInt(result[1], 16) / 255,
          green: parseInt(result[2], 16) / 255,
          blue: parseInt(result[3], 16) / 255,
          alpha: 1,
          colorName: "",
        }
      : null;
  }

  getUIName(uiType) {
    let _prefix = "";
    if (this.props.source === "topToolbar") _prefix = "ttb_";
    else if (this.props.source === "bottomToolbar") _prefix = "btb_";
    else if (this.props.source === "leftToolbar") _prefix = "ltb_";
    else if (this.props.source === "rightToolbar") _prefix = "rtb_";

    const scrIndex = this.props.screenIndex;
    let cnt = 0;
    let _uichildren = getAllChildrenOnPage(this.props.currentPage, scrIndex);
    /* for (let i = 0; i < _uichildren.length; i++) {
      const element = _uichildren[i];
      if(element['viewType'] === uiType) {
        cnt++;
      }      
      const uipart = element.uiParts[0];
      if(uipart['name'] === uiType+'_'+cnt) {
        cnt++;
      }      
    } */

    let uichildren_byUItype = [];
    for (let index = 0; index < _uichildren.length; index++) {
      const elem = _uichildren[index];
      if (elem["viewType"] === uiType) {
        uichildren_byUItype.push(elem);
      }
    }
    if (uichildren_byUItype.length > 0) {
      cnt = uichildren_byUItype.length;
      for (let i = 0; i < uichildren_byUItype.length; i++) {
        const element = uichildren_byUItype[i];
        const uipart = element.uiParts[scrIndex];
        if (uipart["name"] === _prefix + uiType + "_" + cnt) {
          cnt++;
        }
      }
    }

    let uiname = _prefix + uiType + "_" + cnt;
    return uiname;
  }

  getContainerDimensions(screenObj, screenIndex, part) {
    const pageData = this.props.currentPage;
    if (part === "width") {
      let layoutWidth = screenObj["width"];
      if (this.props.source === "leftToolbar") {
        layoutWidth = pageData._toolBarLeft[screenIndex].frame.width;
      } else if (this.props.source === "rightToolbar") {
        layoutWidth = pageData._toolBarRight[screenIndex].frame.width;
      } else {
        if (pageData.viewType === "ScrollView") {
          layoutWidth = pageData.Children[0]._frames[screenIndex].width;
        }
      }
      return layoutWidth;
    } else if (part === "height") {
      let layoutHeight = screenObj["height"];
      if (pageData.viewType === "ScrollView") {
        layoutHeight = pageData.Children[0]._frames[screenIndex].height;
      } else {
        const statusbarheight = pageData.StatusBarHidden ? 0 : 20;
        const navbarheight = pageData.NavigationBarHidden ? 0 : 44;
        //const navbarpromptheight = (pageData._navigationBars[0].barHidden) ? 0 : 74;
        const tabbarheight = pageData._tabBarHiddens[screenIndex] ? 0 : 49;
        const toolbartopheight = pageData._toolBarTop[screenIndex].hidden
          ? 0
          : pageData._toolBarTop[screenIndex].frame.height;
        const toolbarbottomheight = pageData._toolBarBottom[screenIndex].hidden
          ? 0
          : pageData._toolBarBottom[screenIndex].frame.height;

        const pagebarsheight =
          statusbarheight +
          navbarheight +
          tabbarheight +
          toolbartopheight +
          toolbarbottomheight;
        layoutHeight = layoutHeight - pagebarsheight;
      }

      return layoutHeight;
    }
  }

  handleKeyDown = (event) => {
    //let _key =  event.which || event.keyCode;
    //if(_key === 17)                  //event['key'] === "Control"
    if (event["key"] === "Control" || event["key"] === "Meta") {
      this.setState({ isCtrl: true });
    } else {
      //if(_key === 46 || _key === 8)   //event['key'] === "Delete"
      if (event["key"] === "Delete" || event["key"] === "Backspace") {
        if (this.props.selectedUIs.length > 0) {
          this.props.selectedUIs.forEach((selectedUI) => {
            this.handleUIDelete();
          });
        } else {
          this.handleUIDelete();
        }
        this.props.dispatch(setSelectedUI({}));
      } else {
        const ishotkey = event.ctrlKey || event.metaKey;
        //console.log(event.ctrlKey, event.metaKey, "handleKeyDown >>>>>>>>>", event.key);
        if (ishotkey && (event["key"] === "c" || event["key"] === "C")) {
          let copiedUIObj = {
            mode: "copy",
            sourceEditor: {
              page: this.props.currentPage,
              editor: this.props.targetEditor,
            },
          };
          if (this.props.selectedUIs && this.props.selectedUIs.length > 0) {
            copiedUIObj["cutcopyMultiUI"] = this.props.selectedUIs;
          } else {
            copiedUIObj["cutcopyUI"] = this.props.currentUI;
          }
          //console.log(event.key, ".... activate Copy UI >>>>>>>>>", copiedUIObj);
          const _uiObj = [copiedUIObj];
          this.setState({ uiObjtoPaste: _uiObj });
          setCutCopyUIObj(_uiObj);

          navigator.clipboard.writeText("").then(
            function () {
              console.log("clipboard successfully set to empty");
            },
            function () {
              console.log("clipboard write failed");
            }
          );
        } else if (ishotkey && (event["key"] === "x" || event["key"] === "X")) {
          let cutUIObj = {
            mode: "cut",
            sourceEditor: {
              page: this.props.currentPage,
              editor: this.props.targetEditor,
            },
          };
          if (this.props.selectedUIs && this.props.selectedUIs.length > 0) {
            cutUIObj["cutcopyMultiUI"] = this.props.selectedUIs;
          } else {
            cutUIObj["cutcopyUI"] = this.props.currentUI;
          }
          //console.log(event.key, ".... activate Cut UI >>>>>>>>>", cutUIObj);
          const _uiObj = [cutUIObj];
          this.setState({ uiObjtoPaste: _uiObj });
          setCutCopyUIObj(_uiObj);

          navigator.clipboard.writeText("");
        } else if (ishotkey && (event["key"] === "v" || event["key"] === "V")) {
          navigator.clipboard.readText().then((text) => {
            if (text.length > 0) {
              //console.log(text, "Clipboard content cannot be paste here");
              this.setState({ openalert: true });
              this.setState({ alertmsg: "Content cannot be paste here" });
            } else {
              const pasteStatus = handleUIPaste(
                this.props,
                this.state.uiObjtoPaste,
                0
              );
              //console.log(this.state.uiObjtoPaste, ".... do Paste UI >>>>>>>>>", this.props, pasteStatus);
              if (pasteStatus) {
                if (pasteStatus["result"] === "error") {
                  const errorMsg = pasteStatus["message"];
                  this.setState({ openalert: true });
                  this.setState({ alertmsg: errorMsg });
                } else if (pasteStatus["result"] === "success") {
                  const selectObj = pasteStatus["data"];
                  this.props.dispatch(setSelectedUI(selectObj));
                  this.updatePageState(true);
                }
              }
            }
          });

          if (this.props.selectedUIs.length > 0) {
            this.props.dispatch(setSelectedUIparts([]));
          }
          this.setState({ isCtrl: false });
        } else {
          event.stopPropagation();
        }
      }
      /* else {
        event.stopPropagation();
      } */
    }
  };
  handleKeyUp = (event) => {
    if (event["key"] === "Control" || event["key"] === "Meta") {
      this.setState({ isCtrl: false });
    } else {
      event.stopPropagation();
    }
  };

  //////////////////////

  resetUISelection(editor) {
    let _uichildren;
    if (editor) {
      _uichildren = getChildrenArray(editor, this.props.currentPage);
    } else {
      _uichildren = this.state.uichildren;
    }
    _uichildren.forEach((element) => {
      if (element["selected"]) {
        this.validateUIdata(element);
      }
      delete element["selected"];
    });

    this.setState({ akshay: 0 });
    this.props.dispatch(setSelectedUIparts([]));
  }

  validateUIdata(uiobj) {
    //console.log(this.props, "---- validate UI ----", uiobj);
    const scrId = this.props.screenIndex;
    if (uiobj["viewType"] === "RadioButton") {
      const radioui = uiobj["uiParts"][scrId];
      if (radioui) {
        if (radioui["groupname"] === "" || radioui["fieldname"] === "") {
          this.setState({ openalert: true });
          this.setState({
            alertmsg: "Group name & Value must be set for each Radio Button",
          });
        }
      }
    } else if (uiobj["viewType"] === "Chart") {
      const chartui = uiobj["uiParts"][scrId];
      if (chartui) {
        if (
          chartui["tablename"] === "" ||
          chartui["itemField"] === "" ||
          chartui["valueField"].length === 0
        ) {
          this.setState({ openalert: true });
          this.setState({
            alertmsg:
              "Table name, Item Field & Value Field(s) must be set for Chart UI : " +
              chartui["name"],
          });
        } else {
          //console.log("---- chartui ----", chartui['valueField'], chartui['itemField']);
          const valueFields = chartui["valueField"];
          let commonVal = valueFields.filter(function (valField) {
            if (valField["fieldname"] === chartui["itemField"]) {
              return true;
            }
            return false;
          });
          if (commonVal.length > 0) {
            this.setState({ openalert: true });
            this.setState({
              alertmsg: "Value Field(s) should not include Item Field",
            });
          }
        }
      }
    }
  }

  handleUISelection = (data) => {
    // console.log(data["gridItems"]);
    //console.log("---- UI Selection ---- source: ", this.props.source);

    // console.log(this.props.selectedUIs);
    if (this.props.selectedUIs.length > 0) {
      // when selecting multiple UIs from different source
      // console.log(
      //   this.state.isCtrl,
      //   "---- multi UI Selection ----",
      //   this.props.selectedUIs.length
      // );
      let lastSelectedObj =
        this.props.selectedUIs[this.props.selectedUIs.length - 1];
      if (lastSelectedObj["editor"] !== this.props.source) {
        this.resetUISelection(lastSelectedObj["editor"]);
      }
    } else {
      if (!this.state.isCtrl) {
        this.resetUISelection();
      }
    }

    let _snapGrid = false;
    let _gridGap = 10;
    const pageid = this.props.currentPage["pageid"];
    let layoutParams = getLayoutParams(
      this.props.editorState["_pagestates"],
      pageid
    );
    if (layoutParams) {
      _snapGrid = layoutParams["snapgrid"] === "on" ? true : false;
      _gridGap = layoutParams["gridgap"];
    }
    if (_snapGrid && data.hasOwnProperty("frame")) {
      let model = data["frame"];
      model.x = this.snappedFrame(model.x, false, _gridGap);
      model.y = this.snappedFrame(model.y, false, _gridGap);
      model.width = this.snappedFrame(model.width, true, _gridGap);
      model.height = this.snappedFrame(model.height, true, _gridGap);
    }

    data["frame"]["x"] =
      data["frame"]["x"] < 0 ? 0 : parseInt(data["frame"]["x"]);
    data["frame"]["y"] =
      data["frame"]["y"] < 0 ? 0 : parseInt(data["frame"]["y"]);

    this.props.dispatch(setSelectedLayout(this.props.source));
    //if(this.props.selectedUIs.length === 0) {
    // console.log(data["gridItems"]);
    this.props.dispatch(setSelectedUI(data));
    //}

    if (!this.state.isCtrl) {
      this.resetUISelection();
    } else {
      let selectedUIArr = this.props.selectedUIs;
      // below console display list of UI selected
      if (selectedUIArr.length === 0) {
        const alreadySelectedUI = this.props.currentUI;
        if (alreadySelectedUI && alreadySelectedUI.hasOwnProperty("viewType")) {
          let currentUIObj = {
            editor: this.props.source,
            UI: alreadySelectedUI,
          };
          selectedUIArr.push(currentUIObj);
        }
      }
      const selectedUIObj = { editor: this.props.source, UI: data };

      selectedUIArr.push(selectedUIObj);
      ``;
      // this.setState({ akshay: selectedUIArr.length });
      // this.props.dispatch(setSelectedUIparts(selectedUIArr));
    }
    //let _uichildren = this.state.uichildren;
    //this.setState({uichildren : _uichildren});

    if (this.props.selectedUIs.length === 0) {
      this.setMultiScreenUIselection(data);
    }
  };

  snappedFrame(pos, isWH, gridgap) {
    let _gap = gridgap ? gridgap : 10;
    let newPos = pos;
    const delta = Math.floor(pos) % _gap;
    if (!isWH) {
      if (delta < 5) newPos = Math.floor(pos) - delta;
      else newPos = Math.floor(pos) + (_gap - delta);
    } else {
      if (delta <= 5) newPos = Math.floor(pos) - delta;
      else newPos = Math.floor(pos) + (_gap - delta);
    }

    return newPos;
  }

  setMultiScreenUIselection(dataObj) {
    // console.log(dataObj);
    let isChangeNeeded = false;
    let screens = this.props.appData["availableScreens"];
    if (screens.length > 1) {
      const currentScreenIndex = this.props.screenIndex;
      let masterScreenIndex = 0;
      screens.forEach((element, i) => {
        if (element["embed"]) {
          masterScreenIndex = i;
        }
      });

      if (this.props.source.indexOf("Toolbar") > -1) {
        //isChangeNeeded = true;
        let barType;
        if (this.props.source === "topToolbar") barType = "_toolBarTop";
        else if (this.props.source === "bottomToolbar")
          barType = "_toolBarBottom";
        else if (this.props.source === "leftToolbar") barType = "_toolBarLeft";
        else if (this.props.source === "rightToolbar")
          barType = "_toolBarRight";

        for (let i = 0; i < screens.length; i++) {
          //if(i === currentScreenIndex)  continue;

          let isSelected = false;

          let _toolbarChildren_perScreen =
            this.props["pagedata"][barType][i]["Children"];
          for (
            let index = 0;
            index < _toolbarChildren_perScreen.length;
            index++
          ) {
            const uidef = _toolbarChildren_perScreen[index];
            let uidefparts = uidef["uiParts"];
            if (
              !isSelected &&
              uidefparts &&
              uidefparts[i] &&
              uidefparts[i]["name"] === dataObj["name"]
            ) {
              uidef["selected"] = true;
              isSelected = true;
              if (i !== masterScreenIndex) {
                const masterToolbarChildren =
                  this.props["pagedata"][barType][masterScreenIndex][
                    "Children"
                  ];
                const masterToolbarUIdef = masterToolbarChildren[index];
                if (masterToolbarUIdef)
                  masterToolbarUIdef["uiParts"][i]["frame"] =
                    uidefparts[i]["frame"];
              }
            } else {
              delete uidef["selected"];
            }
          }
        }
      } else if (this.props.source === "TileList") {
        const sourceUI = this.props["contentEditorParent"]["ui"];
        let tilelistUI;
        let _pageUIs = getAllChildrenOnPage(
          this.props["pagedata"],
          currentScreenIndex
        );
        _pageUIs.forEach((uipart) => {
          if (
            uipart["viewType"] === "TileList" &&
            uipart["uiParts"][currentScreenIndex]["name"] === sourceUI["name"]
          ) {
            tilelistUI = uipart;
          }
        });
        //console.log(this.props, dataObj, "setMultiScreenUIselection.... TileList >>>> ", _pageUIs, tilelistUI);
        let uiSelect = false;
        for (let k = 0; k < screens.length; k++) {
          if (k === masterScreenIndex) continue;
          let _slaveScreen_tilelistChildren =
            tilelistUI["uiParts"][k]["dataarray"][0]["Fields"];
          for (
            let index = 0;
            index < _slaveScreen_tilelistChildren.length;
            index++
          ) {
            const uidef = _slaveScreen_tilelistChildren[index];
            let uidefparts = uidef["uiParts"];
            if (uidefparts && uidefparts[k]["name"] === dataObj["name"]) {
              uidef["selected"] = true;
              uiSelect = true;
            } else {
              delete uidef["selected"];
            }
          }
        }
        if (uiSelect) {
          delete tilelistUI["selected"];
        }
      } else if (this.props.source === "Dialog") {
        //isChangeNeeded = true;
        let dialogUI;
        const overlayChildren =
          this.props["pagedata"]["pageOverlay"]["Children"];
        if (overlayChildren.length > 1) {
          const sourceUI = this.props["contentEditorParent"]["ui"];
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

        //const dialogChildren = JSON.parse(JSON.stringify(_uichildren));
        for (let l = 0; l < screens.length; l++) {
          let _slaveScreen_dialogChildren =
            dialogUI["uiParts"][l]["dataarray"][0]["Fields"];
          for (
            let index = 0;
            index < _slaveScreen_dialogChildren.length;
            index++
          ) {
            const uidef = _slaveScreen_dialogChildren[index];
            let uidefparts = uidef["uiParts"];
            if (uidefparts && uidefparts.length > 0) {
              if (uidefparts[l]["name"] === dataObj["name"]) {
                uidef["selected"] = true;
              } else {
                delete uidef["selected"];
              }
            } else {
              delete uidef["selected"];
            }
          }
        }
      }

      if (isChangeNeeded) {
        let _page = JSON.parse(JSON.stringify(this.props["pagedata"]));
        console.log(
          this.props["currentPage"],
          "...isChangeNeeded setMultiScreenUIselection >>>",
          _page
        );
        this.props.dispatch(setSelectedPageData(_page));
      }
    }
  }

  handleUIDelete = (data) => {
    //console.log(data, ".....handleUIDelete.....", this.props.source, this.state.uichildren);
    let _uichildren = this.state.uichildren;

    let screens = this.props.appData["availableScreens"];
    if (screens.length > 1) {
      let currentScreenIndex = this.props.screenIndex;
      let masterScreenIndex = 0;
      screens.forEach((element, i) => {
        if (element["embed"]) {
          masterScreenIndex = i;
        }
      });

      let deleteUIdef;
      _uichildren.forEach((element, index) => {
        if (element["selected"] === true) {
          if (currentScreenIndex === masterScreenIndex) {
            deleteUIdef = _uichildren.splice(index, 1);
          } else {
            _uichildren[index].uiParts[currentScreenIndex][
              "_enabledOnScreen"
            ] = false;
          }
        }
      });

      const isMasterSlave = this.props.appData["isMasterScreenSet"];
      let changeforAllScreen = false;
      if (isMasterSlave && currentScreenIndex === masterScreenIndex) {
        changeforAllScreen = true;
      }

      if (changeforAllScreen) {
        if (this.props.source.toLowerCase().indexOf("toolbar") > -1) {
          let barType;
          if (this.props.source === "topToolbar") barType = "_toolBarTop";
          else if (this.props.source === "bottomToolbar")
            barType = "_toolBarBottom";
          else if (this.props.source === "leftToolbar")
            barType = "_toolBarLeft";
          else if (this.props.source === "rightToolbar")
            barType = "_toolBarRight";

          const toolbarChildren = JSON.parse(JSON.stringify(_uichildren));
          let _unexpectedUIfound = true;
          for (let j = 0; j < screens.length; j++) {
            if (j === currentScreenIndex) continue;

            if (deleteUIdef) {
              let _slaveScreen_toolbarChildren =
                this.props["pagedata"][barType][j]["Children"];
              for (
                let index = 0;
                index < _slaveScreen_toolbarChildren.length;
                index++
              ) {
                const uidef = _slaveScreen_toolbarChildren[index];
                let uidefparts = uidef["uiParts"];
                if (
                  uidefparts &&
                  uidefparts[j] &&
                  uidefparts[j]["name"] === deleteUIdef[0]["uiParts"][j]["name"]
                ) {
                  _unexpectedUIfound = false;
                  _slaveScreen_toolbarChildren.splice(index, 1);
                  break;
                }
              }
            } else {
              _unexpectedUIfound = false;
              this.props["pagedata"][barType][j]["Children"] = toolbarChildren;
            }
          }
          if (_unexpectedUIfound) {
            console.log(
              _uichildren,
              ".....handle _unexpectedUIfound Delete.....",
              deleteUIdef
            );
            const unexpectedUI = deleteUIdef[0];
            unexpectedUI["selected"] = false;
            unexpectedUI["uiParts"].forEach((_uipart) => {
              _uipart["_enabledOnScreen"] = false;
            });
            _uichildren.push(unexpectedUI);
          }
        } else if (this.props["targetEditor"] === "TileList") {
          const sourceUI = this.props["contentEditorParent"]["ui"];
          let tilelistUI;
          let _pageUIs = getAllChildrenOnPage(
            this.props["currentPage"],
            currentScreenIndex
          );
          _pageUIs.forEach((uipart) => {
            if (
              uipart["viewType"] === "TileList" &&
              uipart["uiParts"][0]["name"] === sourceUI["name"]
            ) {
              tilelistUI = uipart;
            }
          });

          for (let k = 0; k < screens.length; k++) {
            if (k === currentScreenIndex) continue;

            let _slaveScreen_tilelistChildren =
              tilelistUI["uiParts"][k]["dataarray"][0]["Fields"];
            for (
              let index = 0;
              index < _slaveScreen_tilelistChildren.length;
              index++
            ) {
              const uidef = _slaveScreen_tilelistChildren[index];
              let uidefparts = uidef["uiParts"];
              if (
                uidefparts &&
                uidefparts[k]["name"] === deleteUIdef[0]["uiParts"][k]["name"]
              ) {
                _slaveScreen_tilelistChildren.splice(index, 1);
                break;
              }
            }
          }
        } else if (this.props.source === "Dialog") {
          let dialogUI;
          const overlayChildren =
            this.props["pagedata"]["pageOverlay"]["Children"];
          if (overlayChildren.length > 1) {
            const sourceUI = this.props["contentEditorParent"]["ui"];
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

          //const dialogChildren = JSON.parse(JSON.stringify(_uichildren));
          for (let l = 0; l < screens.length; l++) {
            if (l === currentScreenIndex) continue;
            //dialogUI['uiParts'][i]['dataarray'][0]['Fields'] = dialogChildren;

            let _slaveScreen_dialogChildren =
              dialogUI["uiParts"][l]["dataarray"][0]["Fields"];
            for (
              let index = 0;
              index < _slaveScreen_dialogChildren.length;
              index++
            ) {
              const uidef = _slaveScreen_dialogChildren[index];
              let uidefparts = uidef["uiParts"];
              if (
                uidefparts &&
                uidefparts[l]["name"] === deleteUIdef[0]["uiParts"][l]["name"]
              ) {
                _slaveScreen_dialogChildren.splice(index, 1);
                break;
              }
            }
          }
        }
      }
    } else {
      _uichildren.forEach((element, index) => {
        if (element["selected"] === true) {
          _uichildren.splice(index, 1);
        }
      });
    }

    this.setState({ uichildren: _uichildren });
    this.updatePageState(true);
  };

  handleProertyWindow = () => {
    this.updateCurrentUI_inMultiScreen();
    this.props.dispatch(setSelectedUI({}));
    this.props.dispatch(setSelectedUI(this.props["currentUI"]));

    this.updatePageState(true);
  };

  updateCurrentUI_inMultiScreen() {
    let screens = this.props.appData["availableScreens"];
    if (screens.length > 1) {
      let masterScreenIndex = 0;
      screens.forEach((element, i) => {
        if (element["embed"]) {
          masterScreenIndex = i;
        }
      });
      const currentScreenIndex = this.props.screenIndex;
      if (currentScreenIndex !== masterScreenIndex) {
        let sourceChildrenArr = getChildrenArray(
          this.props["source"],
          this.props["pagedata"],
          masterScreenIndex
        );
        if (
          this.props.source.indexOf("Toolbar") > -1 ||
          this.props["source"] === "Dialog" ||
          this.props["source"] === "TileList"
        ) {
          sourceChildrenArr.forEach((uiContainerDef) => {
            let _uiParts = uiContainerDef.uiParts;
            if (
              _uiParts &&
              _uiParts[currentScreenIndex]["name"] ===
                this.props["currentUI"]["name"]
            ) {
              _uiParts[currentScreenIndex] = JSON.parse(
                JSON.stringify(this.props["currentUI"])
              );
            }
          });
        }
      }
    }
  }

  updatePageState = (setpage) => {
    let _page = this.props["pagedata"]; //JSON.parse(JSON.stringify(this.props['pagedata']));
    if (setpage) {
      this.props.dispatch(setSelectedPageData(_page));
    }

    const layoutState = filterState_byPageid(
      _page["pageid"],
      this.props.editorState
    );
    if (layoutState) {
      let undoState = layoutState["undo"];
      if (undoState) {
        if (undoState.length > 10) {
          undoState.shift();
        }
        undoState.push(_page);
      }
    }
  };

  handleCloseAlert = () => {
    this.setState({ openalert: false });
    this.setState({ alertmsg: "" });
  };

  handleContainerClick() {
    if (this.props.source.indexOf("tablecell") > -1) {
      this.props.dispatch(setSelectedLayout(this.props.source));
    }
  }

  //////////////////////

  render() {
    const { uiLocale, openalert, alertmsg } = this.state;
    const pagedata = this.props["pagedata"]
      ? this.props["pagedata"]
      : this.props.currentPage;
    const scrIndex = this.props.screenIndex;
    //const appConfig = {apiURL: this.props.appconfig.apiURL, userid: this.props.appconfig.userid, sessionid: this.props.appconfig.sessionid, projectid: this.props.appconfig.projectid};

    const { apiParam } = this.props;
    const appConfig = {
      apiURL: apiParam.apiURL,
      userid: apiParam.userid,
      sessionid: apiParam.sessionid,
      projectid: apiParam.projectid,
    };

    let isDragUI =
      this.props.currentUI && this.props.currentUI.hasOwnProperty("viewType")
        ? true
        : false;

    const aks = false;
    const _layoutState = filterState_byPageid(
      this.props.currentPage.pageid,
      this.props.editorState
    );
    let _stateParams = _layoutState ? _layoutState["params"] : _layoutState;

    return (
      <Box
        id="uicontainer"
        tabIndex="-1"
        style={{
          position: "relative",
          height: "100%",
          width: "inherit",
          display: "grid",
          gridAutoColumns: "1fr",
        }}
        onDragStart={this.handleDragStart.bind(this)}
        onDragOver={this.handleDropAllow.bind(this)}
        onDrop={this.handleUIDrop.bind(this)}
        onKeyDown={this.handleKeyDown.bind(this)}
        onKeyUp={this.handleKeyUp.bind(this)}
        onClick={this.handleContainerClick.bind(this)}
      >
        {aks && (
          <GridCanvas
            screenIndex={scrIndex}
            data={this.props.currentPage}
            stateParams={_stateParams}
            frame={this.props.containerFrame}
          />
        )}
        {uiLocale.length === 0 &&
          sortUI_byDisplayOrder(this.props.data, scrIndex).map(
            (uichild, index) => (
              <UILayout
                key={index}
                draggableUI={isDragUI}
                appData={this.props.appData}
                pagedata={pagedata}
                appconfig={appConfig}
                screenIndex={scrIndex}
                addedRowsList={this.props.addedRowsList}
                inputRowVal={this.props.inputRowVal}
                data={uichild}
                uilocale={filterLocale_byUIType(uichild, uiLocale)}
                onSelect={this.handleUISelection.bind(this)}
                onDelete={this.handleUIDelete.bind(this)}
                onUpdateProperty={this.handleProertyWindow.bind(this)}
                onUIDragStart={this.handleUIlayoutDragStart.bind(this)}
              />
            )
          )}

        <Backdrop
          open={openalert}
          style={{ zIndex: 1111 }}
          onClick={this.handleCloseAlert.bind(this)}
        />
        <Snackbar
          open={openalert}
          message={alertmsg}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={SlideTransition}
          autoHideDuration={5000}
          onClose={this.handleCloseAlert.bind(this)}
          action={
            <React.Fragment>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={this.handleCloseAlert.bind(this)}
              >
                <Close fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </Box>
    );
  }
}
function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

function validateDroppedUI(_viewtype, _props) {
  let validationMsg = "";
  let _restrict = true;

  if (_viewtype === "Dialog" || _viewtype === "Drawer") {
    /*if(_props.targetEditor && _props.targetEditor.toLowerCase() !== "page") {
      validationMsg = "Dialog UI allowed on 'Page Overlay' only.";
      return {message:validationMsg, restrict:_restrict};
    }*/

    if (_props.targetEditor) {
      if (_props.targetEditor.toLowerCase() !== "page") {
        let overlayChildren = _props.currentPage["pageOverlay"]["Children"];
        if (overlayChildren && overlayChildren.length > 0) {
          const findOverlayUI = overlayChildren.find(
            (element) => element["viewType"] === _viewtype
          );
          if (findOverlayUI) {
            validationMsg = "Only one " + _viewtype + " UI allowed";
            return { message: validationMsg, restrict: _restrict };
          }
        }
      } else {
        validationMsg = _viewtype + " UI allowed on 'Page Overlay' only.";
        return { message: validationMsg, restrict: _restrict };
      }
    }
  }

  const mediaUIparts = ["Camera", "GoogleMap", "SoundBox", "VideoBox"];
  const findMediaUI = mediaUIparts.find((element) => element === _viewtype);
  const isMediaUI = findMediaUI ? true : false;

  let pgChildren = getAllChildrenOnPage(_props.currentPage, _props.screenIndex);
  pgChildren.forEach((uipart) => {
    if (isMediaUI && uipart["viewType"] === _viewtype) {
      validationMsg = "Only one same type of media UI supported on a page.";
      _restrict = true;
    } else {
      if (_viewtype === "RadioButton" && uipart["viewType"] === _viewtype) {
        if (
          uipart["uiParts"][0]["groupname"] === "" ||
          uipart["uiParts"][0]["fieldname"] === ""
        ) {
          validationMsg =
            "For all radio-buttons, set required fields : 'Group Name' & 'Value'";
          _restrict = false;
        }
      }
    }
  });

  return { message: validationMsg, restrict: _restrict };
}

function getUIpart_orderIndex(uichildren, scrId) {
  const lastUIchildren = uichildren[uichildren.length - 1];
  if (lastUIchildren) {
    return lastUIchildren.uiParts[scrId].displayOrderOnScreen;
  }

  return uichildren.length;
}

function setDocument_forUIpart(uiObj, isNew) {
  const nowDate = new Date();
  let strDate =
    nowDate.getFullYear() +
    "-" +
    parseInt(nowDate.getMonth() + 1) +
    "-" +
    nowDate.getDate() +
    " " +
    nowDate.getHours() +
    ":" +
    nowDate.getMinutes() +
    ":" +
    nowDate.getSeconds();
  const i = nowDate.toString().indexOf("GMT");
  strDate = strDate + " GMT" + nowDate.toString().substr(i + 3, 5);

  if (isNew) {
    let _document = [];
    const createdObj = { key: "createddatetime", value: strDate };
    _document.push(createdObj);
    const lastupdateObj = { key: "lastupdatedatetime", value: strDate };
    _document.push(lastupdateObj);

    uiObj["Document"] = _document;
  } else {
    /* if(uiObj['Document'].hasOwnProperty("lastupdatedatetime")) {
      uiObj['Document']['lastupdatedatetime'] = strDate;
    }else {
      const _lastupdateObj = {"key": "lastupdatedatetime", "value": strDate};
      uiObj['Document'].push(_lastupdateObj);
    } */

    let uipartDoc = [];
    const createdDoc = uiObj["Document"].find(
      ({ key }) => key === "createddatetime"
    );
    if (createdDoc) {
      uipartDoc.push(createdDoc);
    } else {
      const _createdObj = { key: "createddatetime", value: "" };
      uipartDoc.push(_createdObj);
    }
    const _lastupdateObj = { key: "lastupdatedatetime", value: strDate };
    uipartDoc.push(_lastupdateObj);

    uiObj["Document"] = uipartDoc;
  }
}

function sortUI_byDisplayOrder(uichildren, scrIndex) {
  if (!scrIndex) scrIndex = 0;
  if (!uichildren) return [];

  if (uichildren.length > 0) {
    uichildren.sort(function (a, b) {
      if (a.uiParts[scrIndex] && b.uiParts[scrIndex]) {
        return (
          a.uiParts[scrIndex].displayOrderOnScreen -
          b.uiParts[scrIndex].displayOrderOnScreen
        );
      }
      return 0;
    });
  }
  return uichildren;
}

function filterLocale_byUIType(uichild, uilocale) {
  let uiproperties = uilocale.filter(function (uipart) {
    return uipart["viewType"] === uichild["viewType"];
  });
  if (uiproperties.length > 0) {
    return uiproperties[0]["properties"];
  }

  return null;
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

function getLayoutParams(_pagestates, _pageid) {
  let paramObj;
  if (_pagestates && _pagestates.length > 0) {
    _pagestates.forEach((element) => {
      for (const key in element) {
        if (key === _pageid) {
          paramObj = element[key];
        }
      }
    });
  }
  if (paramObj) {
    return paramObj["params"];
  }
  return paramObj;
}

function setUIObjectInGrid(_model, gridGap) {
  let nearestLeftline = nearestGrid(
    "leftAndUp",
    _model.x,
    _model.width,
    gridGap
  );
  let nearestRightline = nearestGrid(
    "rightAndDown",
    _model.x,
    _model.width,
    gridGap
  );
  let nearestUpline = nearestGrid(
    "leftAndUp",
    _model.y,
    _model.height,
    gridGap
  );
  let nearestDownline = nearestGrid(
    "rightAndDown",
    _model.y,
    _model.height,
    gridGap
  );

  let nearestHorizantalLine;
  /* if (nearestLeftline < nearestRightline) {
    nearestHorizantalLine = nearestLeftline;
  }else {
    nearestHorizantalLine = nearestRightline;
  }
  nearestHorizantalLine = (Math.floor(_model.x) + nearestHorizantalLine); */

  const horizontalLeft = Math.floor(_model.x) + nearestLeftline;
  const hLeftModulus = horizontalLeft % parseInt(gridGap);
  const horizontalRight = Math.floor(_model.x) + nearestRightline;
  const hRightModulus = horizontalRight % parseInt(gridGap);
  //if(hLeftModulus === hRightModulus === 0) {
  if (hLeftModulus === 0 && hRightModulus === 0) {
    if (nearestLeftline < nearestRightline) {
      nearestHorizantalLine = horizontalLeft;
    } else {
      nearestHorizantalLine = horizontalRight;
    }
  } else if (hLeftModulus === 0) {
    nearestHorizantalLine = horizontalLeft;
  } else {
    nearestHorizantalLine = horizontalRight;
  }

  let nearestVerticalLine;
  /* if (nearestUpline < nearestDownline) {
    nearestVerticalLine = nearestUpline;
  }else {
    nearestVerticalLine = nearestDownline;
  }  
  nearestVerticalLine = (Math.floor(_model.y) + nearestVerticalLine); */

  const verticalUp = Math.floor(_model.y) + nearestUpline;
  const vUpModulus = verticalUp % parseInt(gridGap);
  const verticalDown = Math.floor(_model.y) + nearestDownline;
  const vDownModulus = verticalDown % parseInt(gridGap);
  //if(vUpModulus === vDownModulus === 0) {
  if (vUpModulus === 0 && vDownModulus === 0) {
    if (nearestLeftline < nearestRightline) {
      nearestVerticalLine = verticalUp;
    } else {
      nearestVerticalLine = verticalDown;
    }
  } else if (vUpModulus === 0) {
    nearestVerticalLine = verticalUp;
  } else {
    nearestVerticalLine = verticalDown;
  }

  /* if (Math.abs(Math.round(_model.x) - Math.round(nearestHorizantalLine)) === 0 || x === 0) {
    x = nearestHorizantalLine;	
    _model.x = x;
  }else {
    _model.x = x;
  }
  
  if (Math.abs(Math.round(_model.y) - Math.round(nearestVerticalLine)) === 0 || y === 0) {
    y = nearestVerticalLine;	
    _model.y = y;
  }else {
    _model.y = y;
  } */

  _model.x = nearestHorizantalLine;
  _model.y = nearestVerticalLine;
  //console.log(nearestLeftline, nearestRightline, nearestHorizantalLine, "... nearestGrid Lines >>>> ....", nearestUpline, nearestDownline, nearestVerticalLine);

  return _model;
}

function nearestGrid(dir, position, heightAndWidth, gapValue) {
  let val = 0;
  let posX;
  let endX;
  let gap = gapValue;
  if (dir === "leftAndUp") {
    posX = Math.floor(position);
    endX = Number(posX + heightAndWidth);
    posX = Math.floor(posX / gap) * gap - posX;
    endX = Math.floor(endX / gap) * gap - endX;
  }

  if (dir === "rightAndDown") {
    posX = Math.floor(position);
    endX = Number(posX + heightAndWidth);
    posX = Math.ceil(posX / gap) * gap - posX;
    endX = Math.ceil(endX / gap) * gap - endX;
  }
  //console.log(dir, position, heightAndWidth, "... nearestGrid ##### ....", posX, endX);

  if (Math.abs(endX) <= Math.abs(posX)) val = endX;
  if (Math.abs(endX) >= Math.abs(posX)) val = posX;

  return val;
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
  /* const statusbarheight = (pageData.StatusBarHidden) ? 0 : 20;
  const navbarheight = (pageData.NavigationBarHidden) ? 0 : 44;
  //const navbarpromptheight = (pageData._navigationBars[0].barHidden) ? 0 : 74;
  const tabbarheight = (pageData._tabBarHiddens[screenIndex]) ? 0 : 49;
  const toolbartopheight = (pageData._toolBarTop[screenIndex].hidden) ? 0 : pageData._toolBarTop[screenIndex].frame.height;
  const toolbarbottomheight = (pageData._toolBarBottom[screenIndex].hidden) ? 0 : pageData._toolBarBottom[screenIndex].frame.height;

  let contentheight = statusbarheight + navbarheight + tabbarheight + toolbartopheight + toolbarbottomheight;
  if(pageData.viewType === "ScrollView") contentheight = 0;
  console.log("Layout _GridCanvas >> ", layoutHeight, contentheight); */

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
      className="ui-container-grid-canvas"
      style={{ width: layoutWidth }}
    >
      <table
        id="grid"
        className="ui-container-grid-canvas"
        style={{ width: layoutWidth }}
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
                  className="ui-container-grid-cell"
                ></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UILayout(props) {
  const appConfig = props.appconfig;
  let scrId = props.screenIndex;
  if (!scrId) scrId = 0;
  // console.log(props.data.uiParts[scrId]);
  let uiData = props.data.uiParts[scrId];
  if (!uiData) {
    uiData = props.data.uiParts[0];
  }
  if (!uiData.hasOwnProperty("stylename")) {
    uiData["stylename"] = "custom";
  }
  const uiLocale = props.uilocale; //[0];

  const containerX = uiData.frame.x;
  const containerY = uiData.frame.y;
  const containerWidth = uiData.frame.width;
  const containerHeight = uiData.frame.height;

  let uiViewType = uiData.viewType;
  if (uiData.buttonType === "CheckBox") {
    uiViewType = "CheckBox";
  }
  //console.log(uiViewType, "::", uiData.name, ">>>>>>>", uiData);

  const [uiDisplayname, setUIDisplayName] = React.useState(uiViewType);
  const [selectedUI, setSelectedUI] = React.useState([]);
  const [showProperty, setPropertyWindow] = React.useState(false);

  const [resizehandle, setResizeHandle] = React.useState("123");
  const [originaldimension, setOriginalDimension] = React.useState({});

  const [menuX, setMenuX] = React.useState(200);
  const [menuY, setMenuY] = React.useState(200);
  const [uiMenu, setUIContextMenu] = React.useState(null);
  const viewmenu = Boolean(uiMenu);

  function handleContextMenu(event) {
    //event.preventDefault();

    setMenuX(event.clientX);
    setMenuY(event.clientY);
    //setUIContextMenu(event.currentTarget);
  }
  function handleDeleteUI(event) {
    props.data["selected"] = true;

    let dataset = event.currentTarget.dataset;
    props.onDelete(dataset);

    handleUIMenuClose();
  }
  function handleUIMenuClose() {
    setUIContextMenu(null);
  }

  function handleKeyboardEvent(event) {
    event.preventDefault();

    let _key = event.which || event.keyCode;
    if (event["type"] === "keyup" && (_key === 46 || _key === 8)) {
      const dataset = event.currentTarget.dataset;
      props.onDelete(dataset);
    }
  }

  function handleUIpartSelection(event) {
    event.stopPropagation();
    // console.log("When Select");
    // console.log(uiData.viewType);

    if (uiData.viewType === "Picker") return;
    if (uiData.viewType === "GadgetUI") return;
    props.onSelect(uiData);
    props.data["selected"] = true;

    if (showProperty) {
      let dataset = event.currentTarget.dataset;
      let uitype = dataset.viewtype;
      if (uitype === "Button") {
        if (dataset.type === "CheckBox") {
          uitype = "CheckBox";
        } else {
          uitype = getButtontype(dataset.buttontype) + uitype;
        }
      }
      setUIDisplayName(uitype);

      fetchUIConfig(uitype).then((response) => populateUIProperties(response));
    }
  }

  function getButtontype(btnType) {
    return btnType.charAt(0).toUpperCase() + btnType.substr(1).toLowerCase();
  }

  function fetchUIConfig(uipart) {
    let uiTemplate = [];

    let _classpath = "././config/uipart/" + uipart + ".xml";
    return fetch(_classpath)
      .then((res) => res.text())
      .then(
        (result) => {
          var XMLParser = require("react-xml-parser");
          var xml = new XMLParser().parseFromString(result);
          var uiitem = xml.getElementsByTagName("item");
          if (uiitem.length > 0) {
            var uiproperties = xml.getElementsByTagName("type");
            uiTemplate = setUITemplate(uiitem[0], uiproperties);
            return uiTemplate;
          }
        },
        (error) => {
          console.log("UI config error >>>", error);
        }
      );
  }

  function populateUIProperties(_uiconfig) {
    if (selectedUI.length === 0 && _uiconfig) {
      /* let uiConfig = _uiconfig;
      uiConfig.splice(0, 1, _uiconfig[0]);
      setSelectedUI(uiConfig[0].children); */
      setSelectedUI(_uiconfig);
      setPropertyWindow(true);
    } else {
      setSelectedUI([]);
      setPropertyWindow(false);
    }
  }

  function handlePropertyWindowBackdropClick() {
    setSelectedUI([]);
    setPropertyWindow(false);
  }
  function handlePropertyWindowClose() {
    setSelectedUI([]);
    setPropertyWindow(false);
  }

  function handlePropertyUpdate(property, value) {
    console.log(
      "UI handlePropertyUpdate_________________",
      property,
      "-->>",
      value
    );
    //props.onUpdateValue(property, value);
  }

  function handleUIpartResize(ev) {
    const element = document.getElementById(uiData.name);

    let original_width = parseFloat(
      getComputedStyle(element, null)
        .getPropertyValue("width")
        .replace("px", "")
    );
    let original_height = parseFloat(
      getComputedStyle(element, null)
        .getPropertyValue("height")
        .replace("px", "")
    );
    let original_x = element.getBoundingClientRect().left;
    let original_y = element.getBoundingClientRect().top;
    let original_mouse_x = ev.pageX;
    let original_mouse_y = ev.pageY;
    let original = {
      x: original_x,
      y: original_y,
      width: original_width,
      height: original_height,
      mousex: original_mouse_x,
      mousey: original_mouse_y,
    };
    setOriginalDimension(original);

    let dataset = ev.currentTarget.dataset;
    let resizeHandle = dataset["resizehandle"];
    setResizeHandle(resizeHandle);

    //console.log("UI handleUIpartResize _________________",resizeHandle, "-->>", resizehandle);

    //window.addEventListener('mousemove', startResize);
    //window.addEventListener('mouseup', stopResize);
  }

  function startResize(e) {
    if (resizehandle === "123") return;
    console.log(
      "UI startResize _________________-->>",
      resizehandle,
      originaldimension
    );

    /* if (resizehandle === "bottomright") {
      const width = original_width + (e.pageX - original_mouse_x);
      const height = original_height + (e.pageY - original_mouse_y)
      if (width > minimum_size) {
        element.style.width = width + 'px'
      }
      if (height > minimum_size) {
        element.style.height = height + 'px'
      }
    }
    else if (resizehandle === "bottomleft") {
      const height = original_height + (e.pageY - original_mouse_y)
      const width = original_width - (e.pageX - original_mouse_x)
      if (height > minimum_size) {
        element.style.height = height + 'px'
      }
      if (width > minimum_size) {
        element.style.width = width + 'px'
        element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
      }
    }
    else if (resizehandle === "topright") {
      const width = original_width + (e.pageX - original_mouse_x)
      const height = original_height - (e.pageY - original_mouse_y)
      if (width > minimum_size) {
        element.style.width = width + 'px'
      }
      if (height > minimum_size) {
        element.style.height = height + 'px'
        element.style.top = original_y + (e.pageY - original_mouse_y) + 'px'
      }
    }
    else {
      const width = original_width - (e.pageX - original_mouse_x)
      const height = original_height - (e.pageY - original_mouse_y)
      if (width > minimum_size) {
        element.style.width = width + 'px'
        element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
      }
      if (height > minimum_size) {
        element.style.height = height + 'px'
        element.style.top = original_y + (e.pageY - original_mouse_y) + 'px'
      }
    } */
  }

  function stopResize(e) {
    //console.log("UI stopResize ----------------->>", resizehandle, originaldimension);
    //window.removeEventListener('mousemove', startResize);
    //window.removeEventListener('mouseup', stopResize);
    setResizeHandle("123");
  }

  function onResizeStop(e) {
    uiData.frame.width = e.currentTarget["offsetWidth"];
    uiData.frame.height = e.currentTarget["offsetHeight"];

    //updatePropertyWindow
    props.onUpdateProperty();
  }

  function handleUIDragStart(ev) {
    let dataset = ev.currentTarget.dataset;
    const uiname = dataset["name"];
    let uitype = dataset.viewtype;
    if (uitype === "Button") {
      if (dataset.type === "CheckBox") {
        uitype = "CheckBox";
      } else if (dataset.type === "System") {
        uitype = "SystemButton";
      } else {
        uitype = getButtontype(dataset.buttontype) + uitype;
      }
    }

    const rect = ev.currentTarget.getBoundingClientRect();
    const dx = ev.clientX - rect["x"];
    const dy = ev.clientY - rect["y"];
    //console.log(dataset, "****", rect, "--- exist UI Dragstart---", ev.clientX, ev.clientY, "==>>", dx, dy);

    props.onUIDragStart(ev, uiname, uitype, dx, dy);
  }

  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const onWindowResize = useGlobalEvent("resize");
  onWindowResize((event) => {
    setWindowWidth(window.innerWidth);

    // console.log("onWindowResize >>>> ", windowWidth);
  });

  if (uiData["font"]) {
    if (uiData["font"]["fontName"] === "Helvetica Neue") {
      uiData["font"]["fontName"] = "Amazon Ember";
    }
  } else if (uiData["normalFont"]) {
    if (uiData["normalFont"]["fontName"] === "Helvetica Neue") {
      uiData["normalFont"]["fontName"] = "Amazon Ember";
    }
  }

  let uiMockup;
  if (uiViewType === "Label") {
    uiMockup = <UILabel data={uiData} />;
  } else if (uiViewType === "TextField") {
    //putting below check for Sampoorna project for now, that need to be remove later
    if (appConfig.apiURL.indexOf("tslsampoorna") > -1) {
      uiData["onfocusBorderColor"] = {
        alpha: 1,
        red: 0.23921568628,
        green: 0.49411764706,
        blue: 0.84705882353,
        colorName: "",
      };
    }
    uiMockup = <UITextField data={uiData} appconfig={appConfig} />;
  } else if (uiViewType === "NumericField") {
    //putting below check for Sampoorna project for now, that need to be remove later
    if (appConfig.apiURL.indexOf("tslsampoorna") > -1) {
      uiData["onfocusBorderColor"] = {
        alpha: 1,
        red: 0.23921568628,
        green: 0.49411764706,
        blue: 0.84705882353,
        colorName: "",
      };
    }
    uiMockup = <UINumField data={uiData} appconfig={appConfig} />;
  } else if (uiViewType === "TextView") {
    //putting below check for Sampoorna project for now, that need to be remove later
    if (appConfig.apiURL.indexOf("tslsampoorna") > -1) {
      uiData["onfocusBorderColor"] = {
        alpha: 1,
        red: 0.23921568628,
        green: 0.49411764706,
        blue: 0.84705882353,
        colorName: "",
      };
    }
    uiMockup = <UITextField data={uiData} appconfig={appConfig} />;
  } else if (uiViewType === "NumericField") {
    uiMockup = <UINumField data={uiData} appconfig={appConfig} />;
  } else if (uiViewType === "TextView") {
    uiMockup = <UITextView data={uiData} />;
  } else if (uiViewType === "Image") {
    uiMockup = <UIImage data={uiData} appconfig={appConfig} />;
  } else if (uiViewType === "Avatar") {
    uiMockup = <UIAvatar data={uiData} appconfig={appConfig} />;
  } else if (uiViewType === "WebView") {
    uiMockup = <UIWebView data={uiData} />;
  } else if (uiViewType === "LinkLabel") {
    uiMockup = <UILinkLabel data={uiData} />;
  } else if (uiViewType === "SearchBar") {
    uiMockup = <UISearchBar data={uiData} />;
  } else if (uiViewType === "LiveFeed") {
    uiMockup = <UILiveFeed data={uiData} />;
  } else if (uiViewType === "Button") {
    uiMockup = (
      <ButtonView
        data={uiData}
        appconfig={appConfig}
        containerWidth={containerWidth}
      />
    );
  } else if (uiViewType === "CheckBox") {
    uiMockup = <UICheckBox data={uiData} appconfig={appConfig} />;
  } else if (uiViewType === "Segment") {
    uiMockup = <UISegment data={uiData} appconfig={appConfig} />;
  } else if (uiViewType === "Grid") {
    // console.log(uiData);
    uiMockup = (
      <UIGrid
        data={uiData}
        appconfig={appConfig}
        pagedata={props.pagedata}
        addedRowsList={props.addedRowsList}
        inputRowVal={props.inputRowVal}
        currentScreenIndex={scrId}
      />
    );
  } else if (uiViewType === "Switch") {
    uiMockup = <UISwitch data={uiData} />;
  } else if (uiViewType === "Camera") {
    uiMockup = [
      <div key={uiData.name} className="media-layout">
        <img src={camera} alt="camera" className="full-layout" />
      </div>,
    ];
  } else if (uiViewType === "SoundBox") {
    if (uiData.style === "Silver") {
      uiMockup = [
        <div key={uiData.name} className="media-layout">
          <img src={soundSilver} alt="sound" className="img-layout" />
        </div>,
      ];
    } else {
      uiMockup = [
        <div key={uiData.name} className="media-layout">
          <img src={soundBlack} alt="sound" className="img-layout" />
        </div>,
      ];
    }
  } else if (uiViewType === "VideoBox") {
    uiMockup = [
      <div key={uiData.name} className="media-layout">
        <img src={videobox} alt="video" className="full-layout" />
      </div>,
    ];
  } else if (uiViewType === "GoogleMap") {
    const mapKey = props.appData.isGoogleMapKeySet
      ? props.appData.googleMapKeyDevelopment
      : "";
    uiMockup = <UIMapView data={uiData} mapKey={mapKey} />;
  } else if (uiViewType === "DatePicker") {
    uiMockup = <UIDatePicker data={uiData} />;
  } else if (uiViewType === "Calendar") {
    uiMockup = <UICalendar data={uiData} />;
  } else if (uiViewType === "Picker") {
    uiMockup = <UIPicker data={uiData} />;
  } else if (uiViewType === "ComboBox") {
    uiMockup = <UIComboBox data={uiData} appconfig={appConfig} />;
  } else if (uiViewType === "TileList") {
    uiMockup = (
      <UITileList
        data={uiData}
        appconfig={appConfig}
        pagedata={props.pagedata}
        currentScreenIndex={scrId}
      />
    );
  } else if (uiViewType === "Tabs") {
    uiMockup = <UITabs data={uiData} appconfig={appConfig} />;
  } else if (uiViewType === "Slider") {
    uiMockup = <UISlider data={uiData} />;
  } else if (uiViewType === "HeatMap") {
    const mapKey = props.appData.isGoogleMapKeySet
      ? props.appData.googleMapKeyDevelopment
      : "";
    uiMockup = <UIHeatMap data={uiData} mapKey={mapKey} />;
  } else if (uiViewType === "Dialog") {
    uiMockup = (
      <UIDialog
        data={uiData}
        appconfig={appConfig}
        pagedata={props.pagedata}
        currentScreenIndex={scrId}
      />
    );
  } else if (uiViewType === "Drawer") {
    const verticalPadH =
      parseInt(uiData["padding"]["top"]) +
      parseInt(uiData["padding"]["bottom"]);
    let contentHeight = uiData.dataarray[0]["height"] + verticalPadH;
    contentHeight = uiData.showdragIndicator
      ? contentHeight + 10
      : contentHeight;
    contentHeight = uiData.showclose ? contentHeight + 25 : contentHeight;
    const currScreen = props.appData["availableScreens"][scrId];
    if (currScreen && currScreen["height"]) {
      if (parseInt(currScreen["height"]) > contentHeight) {
        uiData.frame.y = parseInt(currScreen["height"]) - contentHeight;
        uiData.frame.height = contentHeight;
      } else {
        let extraVal = verticalPadH;
        extraVal = uiData.showdragIndicator ? extraVal + 10 : extraVal;
        extraVal = uiData.showclose ? extraVal + 25 : extraVal;
        uiData.frame.y = extraVal;
        uiData.frame.height = parseInt(currScreen["height"]) - extraVal;
      }
    }
    uiData.backgroundColor.alpha = uiData.borderColor.alpha = 1;
    uiMockup = (
      <UIDrawer
        data={uiData}
        appconfig={appConfig}
        pagedata={props.pagedata}
        currentScreenIndex={scrId}
        screendata={props.appData["availableScreens"]}
      />
    );
  } else if (uiViewType === "Skeleton") {
    uiMockup = <UISkeleton data={uiData} />;
  } else if (uiViewType === "ProgressBar") {
    if (uiData.style === "Circle") {
      uiData.frame.width = 2 * parseInt(uiData["arcRadius"]);
      uiData.frame.height = 2 * parseInt(uiData["arcRadius"]);
    }
    uiMockup = <UIProgress data={uiData} />;
  } else if (uiViewType === "Indicator") {
    uiMockup = <UIIndicator data={uiData} />;
  } else if (uiViewType === "ExpansionPanel") {
    const panelCount = uiData.panelItems.length;
    let uiHeight =
      parseInt(uiData.gap) * (panelCount - 1) +
      2 * parseInt(uiData.borderWeight) +
      parseInt(uiData.padding.top) +
      parseInt(uiData.padding.bottom);
    for (let index = 0; index < panelCount; index++) {
      const element = uiData.panelItems[index];
      uiHeight = uiHeight + element["height"];
      if (element["showheader"]) {
        uiHeight = uiHeight + parseInt(uiData.headerheight);
      }
    }
    uiData.frame.height = uiHeight;

    uiMockup = (
      <UIExpansionPanel
        data={uiData}
        appconfig={appConfig}
        pagedata={props.pagedata}
        currentScreenIndex={scrId}
      />
    );
  } else if (uiViewType === "SwipeableView") {
    const currScreen = props.appData["availableScreens"][scrId];
    if (currScreen && currScreen["width"]) {
      uiData.frame.x = 0;
      uiData.frame.width = parseInt(currScreen["width"]);
    }
    uiMockup = (
      <UISwipeableView
        data={uiData}
        appconfig={appConfig}
        pagedata={props.pagedata}
        currentScreenIndex={scrId}
      />
    );
  } else if (uiViewType === "Form") {
    uiMockup = (
      <UIFormView
        data={uiData}
        appconfig={appConfig}
        pagedata={props.pagedata}
        currentScreenIndex={scrId}
      />
    );
  } else if (uiViewType === "Chart") {
    uiMockup = <UIChartView data={uiData} />;
  } else if (uiViewType === "GadgetUI") {
    uiMockup = [
      <Paper key={uiData.name} className="gadget-layout" elevation={2}>
        <Typography>{uiViewType} not supported</Typography>
      </Paper>,
    ];
  } else {
    uiMockup = (
      <Typography>
        {uiViewType} : {uiData.name}
      </Typography>
    );
  }

  let visibilityResize = props.data.selected ? "visible" : "hidden";
  let boxname = uiData["viewType"] === "Dialog" ? "dialogbox" : "uilayoutbox";

  let displayUI = "block";
  //let displayUI = (props.parentcontainer && props.parentcontainer !== props.data['parent']) ? 'none' : 'block';
  //console.log(props.parentcontainer, "......", props.data['parent'], " >>>>>", displayUI);
  displayUI = getDisplayUI(props.pagedata, uiData["parent"], uiData);

  return (
    <>
      {!uiData._enabledOnScreen && <div></div>}

      {uiData._enabledOnScreen && (
        <>
          <Box
            name={boxname}
            id={uiData.name}
            className={`ui-layout-box ${uiData.viewType} ui-element`}
            style={{
              display: displayUI,
              left: `calc(${containerX}px)`,
              top: `calc(${containerY}px)`,
              width: `calc(${containerWidth}px)`,
              // height: `calc(${containerHeight}px)`,
              left: uiData.frame.x,
              top: uiData.frame.y,
              width: uiData.frame.width,
              height: uiData.frame.height,
            }}
            draggable={props.draggableUI}
            data-name={uiData.name}
            data-viewtype={uiData.viewType}
            data-type={uiData.type}
            data-buttontype={uiData.buttonType}
            onClick={handleUIpartSelection}
            onContextMenu={handleContextMenu}
            onDragStart={handleUIDragStart}
            onKeyUp={handleKeyboardEvent}
            onKeyDown={handleKeyboardEvent}
            onKeyPress={handleKeyboardEvent}
          >
            {uiMockup}
            {uiData.hidden && (
              <Box id="uihidden" className="ui-layout-hidden" />
            )}

            <ResizableBox
              width={parseInt(uiData.frame.width)}
              height={parseInt(uiData.frame.height)}
              axis="both"
              resizeHandles={["sw", "se", "nw", "ne"]}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                visibility: visibilityResize,
              }}
            >
              {props.data.selected && (
                <div
                  className="ui-resizers"
                  style={{ resize: "both", overflow: "auto" }}
                  onMouseUp={onResizeStop}
                >
                  <div
                    className={clsx("ui-resizer", "ui-resizer-topleft")}
                    data-resizehandle="topleft"
                    onMouseDown={handleUIpartResize}
                    onMouseMove={startResize}
                    onMouseUp={stopResize}
                  ></div>
                  <div
                    className={clsx("ui-resizer", "ui-resizer-topright")}
                    data-resizehandle="topright"
                    onMouseDown={handleUIpartResize}
                    onMouseMove={startResize}
                    onMouseUp={stopResize}
                  ></div>
                  <div
                    className={clsx("ui-resizer", "ui-resizer-bottomleft")}
                    data-resizehandle="bottomleft"
                    onMouseDown={handleUIpartResize}
                    onMouseMove={startResize}
                    onMouseUp={stopResize}
                  ></div>
                  <div
                    className={clsx("ui-resizer", "ui-resizer-bottomright")}
                    data-resizehandle="bottomright"
                    onMouseDown={handleUIpartResize}
                    onMouseMove={startResize}
                    onMouseUp={stopResize}
                  ></div>
                </div>
              )}
            </ResizableBox>
          </Box>
          <Popover
            id="view-popover"
            className="ui-popover"
            open={viewmenu}
            anchorEl={uiMenu}
            onClose={handleUIMenuClose}
            anchorReference="anchorPosition"
            anchorPosition={{ top: menuY, left: menuX }}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <div className="horizontal-align">
              <Tooltip title="Delete UI">
                <IconButton style={{ padding: 2 }} onClick={handleDeleteUI}>
                  <Delete />
                </IconButton>
              </Tooltip>
            </div>
          </Popover>
          {showProperty && (
            <Dialog
              PaperComponent={PaperComponent}
              scroll="paper"
              open={true}
              fullWidth={false}
              onBackdropClick={handlePropertyWindowBackdropClick}
            >
              <DialogTitle>
                <IconButton
                  aria-label="Close"
                  onClick={handlePropertyWindowClose}
                >
                  <Close />
                </IconButton>
                <h4>{getPropertyWindowTitle(uiDisplayname, uiLocale)}</h4>
              </DialogTitle>

              <DialogContent className="ui-container-dialog-content">
                <UIPropertyEditor
                  show={false}
                  uipart={uiData}
                  viewType={uiDisplayname}
                  config={selectedUI}
                  locale={uiLocale}
                  onPropertyEdit={handlePropertyUpdate}
                />
                <PropertyValueEditor
                  show={false}
                  editor="uipart"
                  data={uiData}
                  viewType={uiDisplayname}
                  config={selectedUI}
                  locale={uiLocale}
                  onPropertyEdit={handlePropertyUpdate}
                />
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </>
  );
}

function getPropertyWindowTitle(uiTitle, uilocale) {
  if (uilocale.length > 0) {
    uiTitle = uilocale[0]["setting"];
  }
  return uiTitle;
}

function getDisplayUI(pagedata, uiParent, uiData) {
  if (!uiData["_enabledOnScreen"]) {
    uiParent = uiData["parent"] = "container1";
    //return 'block';
  }
  const containerData = pagedata["Containers"];
  //console.log(containerData, "......", uiParent, uiData);
  /* for (let i = 0; i < containerData.length; i++) {
    const element = containerData[i];
    if(!element['selected']){
      if(uiParent === element['name']) {
        return 'none';
      }
    }    
  } */

  let uncheckedContainers = [];
  for (let i = 0; i < containerData.length; i++) {
    const element = containerData[i];
    if (!element["selected"]) {
      uncheckedContainers.push(element["name"]);
    }
  }

  if (uncheckedContainers.length > 0) {
    const uiGroups = uiParent.split(",");
    //console.log(uncheckedContainers, ".....", uiGroups);
    if (uiGroups.length > 1) {
      let aks = false;
      for (let j = 0; j < uiGroups.length; j++) {
        if (uncheckedContainers.indexOf(uiGroups[j]) === -1) {
          aks = true;
        }
      }
      if (!aks) return "none";
    } else {
      if (uncheckedContainers.indexOf(uiParent) > -1) {
        return "none";
      }
    }
  }

  return "block";
}

function setUITemplate(item, properties) {
  let _uiConfig = []; //this.state.uiConfig;

  let uiObj = item.attributes;
  let typeConfig = [];
  properties.forEach((element) => {
    let propObj = element.attributes;
    typeConfig.push({
      name: propObj.name,
      properties: populateUIConfig(element.children),
    });
  });
  uiObj.children = typeConfig;

  _uiConfig.push(uiObj);
  return _uiConfig;
}
function populateUIConfig(properties) {
  var _propConfig = [];
  if (properties.length === 0) return _propConfig;

  properties.forEach((element) => {
    let propObj = element.attributes;
    if (element.children !== undefined && element.children.length > 0) {
      let otherObj = populatePropertyObjects(element.children);
      for (let index = 0; index < otherObj.length; index++) {
        const item = otherObj[index];
        propObj[item.name] = item.items;
      }
    }

    _propConfig.push(propObj);
  });

  return _propConfig;
}

function populatePropertyObjects(children) {
  var _propObj = [];
  children.forEach((element) => {
    let _prop = [];
    for (let index = 0; index < element.children.length; index++) {
      const item = element.children[index];
      if (element.name === "validations") {
        _prop.push(item.attributes.validator);
      } else if (element.name === "dataSource") {
        _prop.push(item.attributes.name);
      } else if (element.name === "dependentActions") {
        _prop.push(item);
      }
    }

    _propObj.push({ name: element.name, items: _prop });
  });

  return _propObj;
}

function getChildrenArray(targetEditor, pagedata, scrIndex) {
  const scrId = scrIndex ? scrIndex : 0;

  let _data = pagedata;
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
      break;
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

    case "overlay":
    case "pageOverlay":
      if (_data["pageOverlay"]) {
        return _data["pageOverlay"].Children;
      }
      return _data.Children;

    case "Dialog":
      if (_data["pageOverlay"] && _data["pageOverlay"].Children[0]) {
        if (_data["pageOverlay"].Children[0].uiParts[scrId]) {
          return _data["pageOverlay"].Children[0].uiParts[scrId].dataarray[0]
            .Fields;
        }
      }
      return _data["pageOverlay"].Children;

    /*case "Form":
    case "FormView":
      const formUI = props.editorParent['ui'];
      let index = (props.editorParent["index"]) ? props.editorParent["index"] : 0;
      let formItems = formUI['formItems'];
      return formItems[index]['Fields'];*/

    default:
      return getChildrenArray("page", _data, scrId);
  }
}

function getAllChildrenOnPage(_page, scrIndex) {
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
          /* let _topToolbarUIContainerDic = _topToolbar.Children[t];
          let _topToolbarChildPartDic = _topToolbarUIContainerDic['uiParts'][scrIndex];
          if(_topToolbarChildPartDic) {
            if(!_topToolbarChildPartDic['_enabledOnScreen'])
              continue;							
          } */
          arrChildren.push(_topToolbar.Children[t]);
          if (_topToolbar.Children[t]["viewType"] === "TileList") {
            _topToolbar.Children[t]["parent"] = "topToolbar";
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
          /* let _bottomToolbarUIContainerDic = _bottomToolbar.Children[b];
          let _bottomToolbarChildPartDic = _bottomToolbarUIContainerDic['uiParts'][scrIndex];
          if(_bottomToolbarChildPartDic) {
            if(!_bottomToolbarChildPartDic['_enabledOnScreen'])
              continue;							
          } */
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

//export default UIContainer;
function mapStateToProps(state) {
  return {
    apiParam: state.appParam.params,
    appData: state.appData.data,
    pageList: state.appData.pagelist,
    currentPage: state.selectedData.pagedata,
    uipartdic: state.appParam.uipartdic,
    addedRowsList: state.appParam.addedRowsList,
    addedColumnsList: state.appParam.addedColumnsList,
    currentUI: state.selectedData.uidata,
    selectedUIs: state.selectedData.uiparts,
    targetEditor: state.selectedData.editor,
    editorState: state.selectedData.editorState,
    contentEditorParent: state.selectedData.editorParent,
  };
}
export default connect(mapStateToProps)(UIContainer);
