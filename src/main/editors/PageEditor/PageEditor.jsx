import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import "./PageEditorStyle.css";
import classNames from "classnames/bind";
import ReactXMLParser from "react-xml-parser";

import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Fab,
  SvgIcon,
  Button,
  Select,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  Checkbox,
  Backdrop,
  Snackbar,
  Slide,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";

import toprulerImage from "../../../assets/hScale.png";
import leftrulerImage from "../../../assets/vScale.png";

import AlertWindow from "../../../components/AlertWindow";
import UIContainer from "../UIContainer/UIContainer";
import { setCutCopyUIObj, getTabModuleAccess } from "../../helpers/Utility";

import {
  setEditorParent,
  setSelectedLayout,
  setEditorState,
  setSelectedPageData,
  setSelectedUI,
  setAllPageChanged,
  setChangedPageIds,
  changeScreenIndex,
  setSelectedUIparts,
} from "../../ServiceActions";
import Draggable from "react-draggable";
import { Close } from "@mui/icons-material";
// import { getElementsInRectangle } from "../../../utils/getElementsInRectangle";
import PageLayoutEditor from "../PageLayoutEditor/pageLayoutEditor";
import ProjectValidation from "../../helpers/ProjectValidation/ProjectValidation";
import { makeStyles } from "@mui/styles";

class PageEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      isLoaded: false,

      pageConfig: [],
      pageLocale: [],
      pages: [],
      pageCaches: [],

      pagelist: this.props.openedPageList,
      pageStates: this.props.pageState,
      selectedPage: this.props.selectedPage,
      pageindex: this.props.pageindex,
      handlePageChange: this.props.handlePageChange,
      onClosePageList: this.props.onClosePageList,
      onClosePageTab: this.props.onClosePageTab,
      //showEditor: this.props.showContenteditor,
      currentScreenIndex: 0,
    };

    this.handleSelectEditor = this.handleSelectEditor.bind(this);
    this.handleCloseEditor = this.handleCloseEditor.bind(this);

    //this.handleUpdateValue = this.handleUpdateValue.bind(this);
  }

  componentDidMount() {
    this.fetchPageLocale("en");

    fetch("././config/PageConfig.json")
      .then((res) => res.json())
      .then(
        (result) => {
          let pageContainers = result["container"];
          pageContainers.forEach((element) => {
            if (element.include === "true") {
              this.fetchPageConfig(element["targetClass"]);
            }
          });
        },
        (error) => {
          console.log("config error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  fetchPageLocale(lang) {
    let localefilePath;
    if (lang === "ja" || lang === "jp") {
      localefilePath = "././locale/ja_JP/pageproperties.json";
    } else {
      localefilePath = "././locale/en_US/pageproperties.json";
    }
    fetch(localefilePath)
      .then((res) => res.json())
      .then(
        (result) => {
          //console.log("....Page-Locale fetching success >>>", result);
          let pageLocale = result["PageLocale"];
          this.setState({ pageLocale: pageLocale });
        },
        (error) => {
          console.log("Page-Locale fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  fetchPageConfig(targetClass) {
    let _classpath = "././config/container/" + targetClass + ".xml";
    //console.log("fetchPageConfig >>>", _classpath);
    fetch(_classpath)
      .then((res) => res.text())
      .then(
        (result) => {
          // console.log("config >>>", result);
          // var XMLParser = require("react-xml-parser");
          // console.log(XMLParser);
          var xml = new ReactXMLParser().parseFromString(result);
          // console.log(xml);
          var pageitem = xml.getElementsByTagName("item");
          if (pageitem.length > 0) {
            var pageproperties = xml.getElementsByTagName("type");
            // console.log("PAGE ITEM : ",pageitem)
            this.setPageTemplate(pageitem[0], pageproperties);
          }
        },
        (error) => {
          console.log("Page config error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  setPageTemplate(item, properties) {
    let _pageConfig = this.state.pageConfig;

    let pageObj = item.attributes;
    let typeConfig = [];
    properties.forEach((element) => {
      let propObj = element.attributes;
      typeConfig.push({
        name: propObj.name,
        properties: this.populatePageConfig(element.children),
      });
    });
    pageObj.children = typeConfig;

    /* var bars= [];    
    let configChildren = pageObj.children;
    configChildren.forEach(element => {
      let configname = element.name.toString().toLowerCase();
      if(configname.indexOf('bar') > -1){          
       //bars = bars.concat(element.properties);
        bars.push.apply(bars, element.properties);
      }        
    });    
    console.log("bars >>>>", bars);
    let barsObj = {name:"Page Bars", properties:bars};    
    pageObj.children.push(barsObj); */

    _pageConfig.push(pageObj);
    this.setState({ pageConfig: _pageConfig });

    //console.log("_pageConfig >>>>", this.state.pageConfig);
  }
  populatePageConfig(properties) {
    var _propConfig = [];
    if (properties.length === 0) return _propConfig;

    //console.log("properties >>>", properties);
    properties.forEach((element) => {
      let propObj = element.attributes;
      if (element.children !== undefined && element.children.length > 0) {
        let otherObj = this.populatePropertyObjects(element.children);
        for (let index = 0; index < otherObj.length; index++) {
          const item = otherObj[index];
          propObj[item.name] = item.items;
        }
      }

      _propConfig.push(propObj);
    });

    return _propConfig;
  }

  populatePropertyObjects(children) {
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

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.openedPageList !== this.props.openedPageList) {
      this.setState({ pagelist: this.props.openedPageList });
    }
    /* if(prevProps.showContenteditor !== this.props.showContenteditor) {
      this.setState({ showEditor: this.props.showContenteditor });
    } */
  }

  ////////////////// Tool-box functionality ////////////////////////

  handlePageSave(pageid) {
    let isAccess = true;
    if (this.props.contributorTabs && this.props.contributorTabs.length > 0) {
      isAccess = getTabModuleAccess(
        this.props.selectedPage,
        this.props.contributorTabs,
        this.props.pageList
      );
    }
    //console.log(this.props.selectedPage, isAccess, "....handlePageSave.....", pageid);
    if (isAccess) {
      this.props.onEditorClose(pageid, "save");
    } else {
      console.log("Not allowed to save changes");
    }
  }

  handlePageUndoRedo(updatedPage) {
    this.setState({ selectedPage: updatedPage });
    this.props.onUndoRedo(updatedPage);
  }

  handlePageState(pageid, pstate, parameter) {
    let _pagestates = this.state.pageStates;
    let updatePageState = filterState_byPageid(pageid, _pagestates);
    //console.log(pageid, pstate, parameter, "..... handlePageState >>>> ", _pagestates, updatePageState);

    updatePageState["params"] = pstate["params"];
    if (parameter === "screenIndex") {
      const _newIndex = parseInt(updatePageState["params"]["screenIndex"]);
      this.props.onScreenChange(_newIndex);
      this.setState({ currentScreenIndex: _newIndex });
      this.props.dispatch(changeScreenIndex(_newIndex));
      //console.log(this.props.selectedPage, "....screenIndex handlePageState >>>>", this.props.currentPage);

      this.props.dispatch(setEditorParent({}));
    }

    this.setState({ pageStates: _pagestates });
    //console.log("....setOpenedPageList >>>>", _pagestates);
    this.props.dispatch(setEditorState({ _pagestates }));
  }

  handleUpdatePage(pagedata) {
    //console.log("..... handleUpdatePage >>>> ", pagedata);
    this.setState({ selectedPage: pagedata });
    this.props.dispatch(setSelectedPageData(pagedata));
  }

  handleSelectUI(uidata) {
    console.log("..... handleSelectUI >>>> ", uidata);
    this.props.dispatch(setSelectedUI(uidata));
  }

  handleUpdateUI(property, value) {
    console.log(property, "..... handleUpdateUI >>>> ", value);
  }

  handleAllPagesChanges(flag, changedpages) {
    this.props.dispatch(setAllPageChanged(flag));
    if (!flag) {
      console.log(flag, "...OK...", changedpages);
      this.props.dispatch(setChangedPageIds(changedpages));
    }
  }

  ////////////////// Setting-Window functionality -- not needed//////////////////

  /* handleUpdateValue(property, value){
    let _openedPages = this.state.pagelist;
    let _selectedPage = _openedPages[_openedPages.length-1];

    //console.log(property, " <<<< handleUpdateValue >>>> ", _selectedPage);
    this.setState({selectedPage: _selectedPage});

    this.props.onUpdatePage(_selectedPage);
  } */

  ////////////////// Layout-Window functionality ///////////////////

  handleSelectEditor(_pageid) {
    //console.log(_pageid, "handleSelectEditor >>>>>>>>>>>>>>>>>", this.props, this.state.pagelist);
    /* if(this.props.currentPage.hasOwnProperty('viewType')) {
      this.setState({selectedPage: this.props.currentPage});  
      this.props.onClickEditor(this.props.currentPage);

    }else { */
    let _openedPages = this.state.pagelist;
    let _selectedPage = _openedPages.filter(function (node, index) {
      if (node.pageid === _pageid) {
        //_openedPages.splice(index,1);
        //_openedPages.splice(_openedPages.length,0,node);
        return node;
      }
      return node.pageid === _pageid;
    });
    if (_selectedPage.length > 0) {
      this.setState({ selectedPage: _selectedPage[0] });

      this.props.onClickEditor(_selectedPage[0]);
    }
    //}

    //console.log("_openedPages >>>>>>>>>>>>>>>>>", _openedPages);
    //this.setState({pagelist: _openedPages});
  }

  handleCloseEditor(_pageid, _param) {
    let _openedPages = this.state.pagelist;

    let _closedpage = _openedPages.filter(function (node, index) {
      if (node.pageid === _pageid) {
        _openedPages.splice(index, 1);
        return node;
      }
      return node.pageid === _pageid;
    });
    console.log(
      this.state.selectedPage,
      "_closedpage >>>>>>>>>>>>>>>>>",
      _closedpage
    );

    this.setState({ pagelist: _openedPages });
    this.props.onEditorClose(_pageid, _param);
  }

  ////////////////// Content-Window functionality ///////////////////

  handleCloseContentEditor() {
    this.props.dispatch(setSelectedLayout("page"));
    this.props.dispatch(setEditorParent({}));

    this.handleResetContentUI();
  }
  handleSelectContentEditor(target) {
    this.props.dispatch(setSelectedLayout(target));

    this.handleResetContentUI();
  }
  handleResetContentUI() {
    //console.log(this.props, ".... handleRestContentUI >>>>>>>>>", this.props.contentEditorParent);
    const contentEditorUIpart = this.props.contentEditorParent["ui"];
    this.props.dispatch(setSelectedUI(contentEditorUIpart));
    if (contentEditorUIpart.hasOwnProperty("viewType")) {
      const _viewType = contentEditorUIpart["viewType"];
      let contentUIfields;
      if (_viewType === "Form" || _viewType === "FormView") {
        let index = this.props.contentEditorParent["index"]
          ? this.props.contentEditorParent["index"]
          : 0;
        contentUIfields = contentEditorUIpart.formItems[index].Fields;
      } else if (_viewType === "ExpansionPanel") {
        let indx = this.props.contentEditorParent["index"]
          ? this.props.contentEditorParent["index"]
          : 0;
        contentUIfields = contentEditorUIpart.panelItems[indx].Fields;
      } else if (_viewType === "Grid") {
        let indx = this.props.contentEditorParent["index"]
          ? this.props.contentEditorParent["index"]
          : 0;
        // console.log(indx);
        // console.log(contentEditorUIpart.gridItems);
        contentUIfields =
          contentEditorUIpart.gridItems[indx]["columnList"][0]["Fields"];
        console.log(contentUIfields);
      } else {
        contentUIfields = contentEditorUIpart.dataarray[0].Fields;
      }
      for (let i = 0; i < contentUIfields.length; i++) {
        const element = contentUIfields[i];
        delete element["selected"];
      }
    }
  }

  ///////////////////////////////////////////////////////////

  handleSaveWaitClose() {
    const _pageid = this.props.selectedPage["pageid"];
    this.props.onSaveWaitClose(_pageid);
  }

  handleCloseAler = () => {
    //this.setState({openCAlert: false});
  };

  render() {
    const showpage = this.props.show;
    if (!showpage) {
      return null;
    }

    const appConfig = {
      apiURL: this.props.appconfig.apiURL,
      userid: this.props.appconfig.userid,
      sessionid: this.props.appconfig.sessionid,
      projectid: this.props.appconfig.projectid,
    };
    const { pageStates } = this.state;

    /* const openedpageCount = pagelist.length;
    const openedPage = pagelist[openedpageCount-1];    
    if(openedpageCount > 0)  console.log(openedPage.pageid, "***** page layout *****", pagelist); */

    //let shift = (this.props.uilist === 'none') ? 225 : 0;
    // let shiftW = this.props.uilist === "none" ? "68vw" : "50vw";
    const page = this.props.selectedPage;
    const waitPageid = this.props.showWait["pageid"];
    const showwait =
      waitPageid === page.pageid ? this.props.showWait["showwait"] : false;
    //const showwait = filterSaveWait_byPageid(page.pageid, this.props.showWait);
    //console.log(page.pageid, this.props.showWait, ".......... showWait .............", showwait);

    const defaultScrId = this.props.defaultScreenId
      ? parseInt(this.props.defaultScreenId)
      : 0;

    return (
      <section
        // id="app-page-editor-section"
        id={
          this.props.isShrinkable
            ? "app-page-editor-wide-section"
            : "app-page-editor-section"
        }
        className="draggable-bound"
      >
        <div id="pageeditor">
          <ToolWindow
            className="page-editor-section"
            appData={this.props.appData}
            data={page}
            pagestate={filterState_byPageid(page.pageid, pageStates)}
            allPages={this.props.pageList}
            pageHeirarchy={this.props.heirarchy}
            currentPage={this.props.currentPage}
            allChildren={this.props.pageChildren}
            targetEditor={this.props.targetEditor}
            layoutContainer={this.props.layoutContainer}
            editorParent={this.props.contentEditorParent}
            selectedUI={this.props.currentUI}
            selectedUIparts={this.props.selectedUIs}
            defaultScreenId={defaultScrId}
            onPageSave={this.handlePageSave.bind(this)}
            onUpdatePage={this.handleUpdatePage.bind(this)}
            onAllPagesChanged={this.handleAllPagesChanges.bind(this)}
            onUndoRedo={this.handlePageUndoRedo.bind(this)}
            onUpdatePageState={this.handlePageState.bind(this)}
            onSelectUI={this.handleSelectUI.bind(this)}
            onUpdateUI={this.handleUpdateUI.bind(this)}
          />
          <div id="layoutbox">
            <LayoutWindow
              appData={this.props.appData}
              data={page}
              currentUI={this.props.currentUI}
              selectedUIs={this.props.selectedUIs}
              targetEditor={this.props.targetEditor}
              appconfig={appConfig}
              pagestate={filterState_byPageid(page.pageid, pageStates)}
              defaultScreenId={defaultScrId}
              onWindowSelect={this.handleSelectEditor}
              onWindowClose={this.handleCloseEditor}
            />
            <ContentWindow
              appconfig={appConfig}
              appdata={this.props.appData}
              data={page}
              shiftlist={this.props.uilist}
              targetEditor={this.props.targetEditor}
              editorParent={this.props.contentEditorParent}
              currentPage={this.props.currentPage}
              currentUI={this.props.currentUI}
              screenIndex={this.props.currentScreenIndex}
              onWindowClose={this.handleCloseContentEditor.bind(this)}
              onWindowSelect={this.handleSelectContentEditor.bind(this)}
            />
            {showwait && (
              <div className="backdropStyle" style={{ zIndex: 9 }}>
                <Typography
                  variant="h6"
                  color="textSecondary"
                  className="waitlabel"
                >
                  <CircularProgress style={{ marginRight: 12 }} />
                  <h4>Saving in progress ...</h4>
                </Typography>
                <IconButton
                  size="small"
                  style={{ top: -18, left: -28, color: "white" }}
                  onClick={this.handleSaveWaitClose.bind(this)}
                >
                  <Close fontSize="small" />
                </IconButton>
              </div>
            )}
            {!getTabModuleAccess(
              page,
              this.props.contributorTabs,
              this.props.pageList
            ) && (
              <Snackbar
                open={true}
                message="Not allowed to save any changes on this page"
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                TransitionComponent={SlideTransition}
                autoHideDuration={8000}
                onClose={this.handleCloseAler.bind(this)}
              />
            )}
          </div>
        </div>
      </section>
    );
  }
}

function filterState_byPageid(openedpageid, pagestates) {
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

function ToolWindow(props) {
  const pagedata = props.data;
  const pagestate = props.pagestate;
  //console.log(pagedata.pageid, "** ToolWindow **", pagestate);

  ////// Setting-menu functionality //////

  const [anchorSetting, setAnchorSetting] = React.useState(null);
  const settingopen = Boolean(anchorSetting);

  const [screens, setScreens] = React.useState([]);
  const [selectedScreen, setSelectedScreen] = React.useState(0); //React.useState(props.defaultScreenId);

  function handleSettingOpen(event) {
    //console.log(props.pagestate, "** ToolWindow Setting Open**", props.appData);
    setAnchorSetting(event.currentTarget);
    initLayoutState();

    setScreens(props.appData.availableScreens);
    //setSelectedScreen(0);
    const screenParams = props.pagestate["params"];
    if (screenParams.hasOwnProperty("screenIndex")) {
      const scrIndex = parseInt(screenParams["screenIndex"]);
      setSelectedScreen(scrIndex);
    } else {
      /* const _scrId = (props.defaultScreenId) ? props.defaultScreenId : 0;
      setSelectedScreen(_scrId); */
      setSelectedScreen(0);
    }
  }

  function handleSettingClose() {
    setAnchorSetting(null);
  }

  function handleChangeScreen(event) {
    let scrId = event.currentTarget.value;
    //console.log("handleChangeScreen >>>>>>>>>>>>", scrId);
    updatePagestateParam("screenIndex", scrId);
    updatePagestateParam("screen", props.appData.availableScreens[scrId]);

    setSelectedScreen(scrId);
    setAnchorSetting(null);
  }

  const [opencopybars, setOpenPagebarsDialog] = React.useState(false);
  const handleOpenCopyPagebars = () => {
    setOpenPagebarsDialog(true);
    setAnchorSetting(null);
  };

  const handleClearPageUIData = () => {
    setConfirmAction("clearpage");
    setPagebarsConfirm(true);
    setConfirmMessage("Are you sure to clear all UI-parts on the page ?");
  };

  const [openvalidation, setOpenValidationView] = React.useState(false);
  const handlePageValidation = () => {
    setOpenValidationView(true);
    setAnchorSetting(null);
  };

  function handleCloseValidations() {
    setOpenValidationView(false);
  }

  ///////////////////////////////

  function handlePageSave() {
    props.onPageSave(pagedata.pageid);
  }

  ////// Undo, Redo functionality //////

  //console.log("....PageMenubar selectedPage.....", props.selectedPage);

  function handlePageUndo() {
    //console.log(pagestate, "....PageMenubar handlePageUndo.....", props);
    let undoArr = pagestate["undo"];
    let redoArr = pagestate["redo"];
    if (undoArr.length > 0) {
      let __page = undoArr.pop();
      redoArr.push(__page);
    } else {
      // show alert
      setOpenalert(true);
      setAlertMsg("Nothing to do more 'undo'");
      return;
    }

    let undoPageData;
    if (undoArr.length > 0) {
      undoPageData = undoArr[undoArr.length - 1];
    } else {
      undoPageData = pagestate["init"][0];
    }
    //console.log(undoPageData.pageid, "....PageMenubar handlePageUndo.....", pagestate);
    props.onUndoRedo(undoPageData);
  }

  function handlePageRedo() {
    let redoArr = pagestate["redo"];
    let undoArr = pagestate["undo"];
    if (redoArr.length > 0) {
      let __page = redoArr.pop();
      undoArr.push(__page);
    } else {
      // show alert
      setOpenalert(true);
      setAlertMsg("Nothing to do more 'redo'");
      return;
    }

    let undoPageData;
    if (undoArr.length > 0) {
      undoPageData = undoArr[undoArr.length - 1];
    } else {
      undoPageData = pagestate["init"][0];
    }
    //console.log(undoPageData.pageid, "....PageMenubar handlePageRedo.....", pagestate);
    props.onUndoRedo(undoPageData);
  }

  ////// Zoom functionality //////

  const zoomItem = [50, 75, 100, 150, 200];
  //const [zoomvalue, setZoom] = React.useState(100);

  function handlePageZoomin() {
    let _params = pagestate["params"];
    let _zoomval = _params["zoom"] ? _params["zoom"] : 100;
    // console.log({_params,_zoomval});

    let zoomIndex = zoomItem.indexOf(_zoomval);
    let zoomVal = zoomItem[zoomIndex + 1];
    console.log({ zoomVal });
    if (zoomVal) {
      //setZoom(zoomVal);
      updatePagestateParam("zoom", zoomVal);
    }
  }

  function handlePageZoomout() {
    let _params = pagestate["params"];
    let _zoomval = _params["zoom"] ? _params["zoom"] : 100;

    let zoomIndex = zoomItem.indexOf(_zoomval);
    let zoomVal = zoomItem[zoomIndex - 1];
    if (zoomVal) {
      //setZoom(zoomVal);
      updatePagestateParam("zoom", zoomVal);
    }
  }

  ////// View-menu functionality //////

  const viewItem = ["Show All", "Show Ruler", "Show Guide", "Show Grid"];
  const [checked, setChecked] = React.useState([1]);
  const [snapguide, setSnapGuide] = React.useState(false);
  const [snapgrid, setSnapGrid] = React.useState(false);
  const [gridgap, setGridGap] = React.useState(10);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const viewopen = Boolean(anchorEl);

  function handleViewOpen(event) {
    initLayoutState();
    setAnchorEl(event.currentTarget);
  }

  function initLayoutState() {
    let _viewChecked = [1];
    let _gridgap = 10;
    let _snapguide = false;
    let _snapgrid = false;

    if (pagestate) {
      let _params = pagestate["params"];
      if (_params) {
        if (_params["showall"] && _params["showall"] === "on") {
          _viewChecked = viewItem;
        } else {
          _viewChecked = [];
          if (_params["showruler"] && _params["showruler"] === "on")
            _viewChecked.push("Show Ruler");
          if (_params["showguide"] && _params["showguide"] === "on")
            _viewChecked.push("Show Guide");
          if (_params["showgrid"] && _params["showgrid"] === "on")
            _viewChecked.push("Show Grid");
        }
        setChecked(_viewChecked);

        _snapguide =
          _params["snapguide"] && _params["snapguide"] === "on" ? true : false;
        setSnapGuide(_snapguide);

        _snapgrid =
          _params["snapgrid"] && _params["snapgrid"] === "on" ? true : false;
        setSnapGrid(_snapgrid);

        _gridgap = _params["gridgap"] ? _params["gridgap"] : 10;
        setGridGap(_gridgap);
      }
    } else {
      setChecked([1]);
      setSnapGuide(false);
      setSnapGrid(false);
      setGridGap(10);
    }
  }

  function handleViewClose() {
    setAnchorEl(null);
  }

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      if (value === "Show All") {
        newChecked.push("Show All", "Show Ruler", "Show Guide", "Show Grid");
      } else {
        newChecked.push(value);
        if (
          newChecked.indexOf("Show Ruler") > -1 &&
          newChecked.indexOf("Show Guide") > -1 &&
          newChecked.indexOf("Show Grid") > -1
        ) {
          newChecked.push("Show All");
        }
      }
    } else {
      if (value === "Show All") {
        newChecked.splice(0);
      } else {
        newChecked.splice(currentIndex, 1);
        const showallIndex = newChecked.indexOf("Show All");
        if (showallIndex > -1) {
          newChecked.splice(showallIndex, 1);
        }
      }
    }

    setChecked(newChecked);

    let _param;
    if (value === "Show All") _param = "showall";
    else if (value === "Show Ruler") _param = "showruler";
    else if (value === "Show Guide") _param = "showguide";
    else if (value === "Show Grid") _param = "showgrid";

    let _val = currentIndex > -1 ? "off" : "on";
    updatePagestateParam(_param, _val);
  };

  const handleSnapGuide = (event) => {
    setSnapGuide(event.target.checked);

    let _sguide = event.target.checked ? "on" : "off";
    updatePagestateParam("snapguide", _sguide);
  };

  const handleSnapGrid = (event) => {
    setSnapGrid(event.target.checked);

    let _sgrid = event.target.checked ? "on" : "off";
    updatePagestateParam("snapgrid", _sgrid);
    updatePagestateParam("gridgap", gridgap);
  };

  const handleGridGapValue = (event) => {
    setGridGap(event.currentTarget.value);

    updatePagestateParam("gridgap", event.currentTarget.value);
  };

  function updatePagestateParam(parameter, value) {
    let stateparams = pagestate["params"];
    stateparams[parameter] = value;

    //updatePageState(pagestate);
    props.onUpdatePageState(pagedata.pageid, pagestate, parameter);
  }

  //////////////////////////

  const [cutcopyUI, setCutCopyUI] = React.useState({});
  const [cutcopyMultiUI, setCutCopyMultiUI] = React.useState([]);
  const [mode, setMode] = React.useState("");
  const [sourceEditor, setSourceEditor] = React.useState("");

  function handleUICut() {
    let _cutUIArr = [];
    let cutUIObj = {
      mode: "cut",
      sourceEditor: { page: props.currentPage, editor: props.targetEditor },
    };

    if (props.selectedUIparts.length > 0) {
      //console.log("....handle Multi-UI Cut >>>", props.selectedUIparts);
      //setOpenalert(true);
      //setAlertMsg("Cut-paste operation is not supported for multiple UIs yet.");
      //return;
      setCutCopyMultiUI(props.selectedUIparts);
      setMode("cut");
      setSourceEditor({ page: props.data, editor: props.targetEditor });

      cutUIObj["cutcopyMultiUI"] = props.selectedUIparts;
      _cutUIArr.push(cutUIObj);
    } else {
      if (props.selectedUI && props.selectedUI.hasOwnProperty("viewType")) {
        //console.log(props.data, props.targetEditor, "..handleUICut >>>", props.selectedUI);
        setCutCopyUI(props.selectedUI);
        setMode("cut");
        setSourceEditor({ page: props.data, editor: props.targetEditor });

        cutUIObj["cutcopyMultiUI"] = props.selectedUI;
        _cutUIArr.push(cutUIObj);
      } else {
        setOpenalert(true);
        setAlertMsg("Select at-least one UI to cut.");
      }
    }

    if (_cutUIArr.length > 0) {
      setCutCopyUIObj(_cutUIArr);
      navigator.clipboard.writeText("");
    }
  }

  function handleUICopy() {
    let _copiedUIArr = [];
    let copiedUIObj = {
      mode: "copy",
      sourceEditor: { page: props.currentPage, editor: props.targetEditor },
    };

    if (props.selectedUIparts.length > 0) {
      //console.log("....handle Multi-UI Copy >>>", props.selectedUIparts);
      //setOpenalert(true);
      //setAlertMsg("Copy-paste operation is not supported for multiple UIs yet.");
      //return;
      setCutCopyMultiUI(props.selectedUIparts);
      setMode("copy");
      setSourceEditor(props.targetEditor);

      copiedUIObj["cutcopyMultiUI"] = props.selectedUIparts;
      _copiedUIArr.push(copiedUIObj);
    } else {
      if (props.selectedUI && props.selectedUI.hasOwnProperty("viewType")) {
        //console.log("handleUICopy >>>", props.selectedUI);
        setCutCopyUI(props.selectedUI);
        setMode("copy");
        setSourceEditor(props.targetEditor);

        copiedUIObj["cutcopyUI"] = props.selectedUI;
        _copiedUIArr.push(copiedUIObj);
      } else {
        setOpenalert(true);
        setAlertMsg("Select at-least one UI to copy.");
      }
    }

    if (_copiedUIArr.length > 0) {
      setCutCopyUIObj(_copiedUIArr);
      navigator.clipboard.writeText("");
    }
  }

  function handleUIPaste() {
    if (cutcopyMultiUI && cutcopyMultiUI.length > 0) {
      //console.log("....handle Multi UI Paste >>>", cutcopyMultiUI);
      let multiFlag = true;
      for (let i = 0; i < cutcopyMultiUI.length; i++) {
        const cutcopyElem = cutcopyMultiUI[i]["UI"];
        if (i === cutcopyMultiUI.length - 1) {
          multiFlag = false;
        }
        pasteUIHandler(cutcopyElem, multiFlag);
      }
      setCutCopyMultiUI([]);
    } else {
      pasteUIHandler(cutcopyUI, false);
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
  function pasteUIHandler(cutcopyUIObj, isMulti) {
    const _scrIndex = parseInt(selectedScreen);
    if (cutcopyUIObj && cutcopyUIObj.hasOwnProperty("viewType")) {
      //console.log(sourceEditor, mode, props.targetEditor, "....handleUIPaste >>>", cutcopyUIObj);

      let uiViewType = getUIViewtype(cutcopyUIObj);
      const validUIMsg = validateDroppedUI(uiViewType, props);
      if (validUIMsg.length > 0) {
        setOpenalert(true);
        setAlertMsg(validUIMsg);
        return;
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
          sourceEditor["page"]["pageid"] === props.data["pageid"] &&
          sourceEditor["editor"] === props.targetEditor
        ) {
          setOpenalert(true);
          setAlertMsg("What is the need of cut & paste here ?");
          return;
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
          setOpenalert(true);
          setAlertMsg("'Dialog' UI not allowed here.");
          return false;
        } else {
          const formUI = props.editorParent["ui"];
          let index = props.editorParent["index"]
            ? props.editorParent["index"]
            : 0;
          let formItems = formUI["formItems"];
          if (formItems[index]["Fields"].length === 1) {
            setOpenalert(true);
            setAlertMsg("Only one UI part allowed in one form item.");
            return false;
          }
        }
      }

      let editorChildrenArr = getChildrenArray(_targetEditor, _scrIndex);
      let uiContainer = { _uid: "", uiParts: [], viewType: uiViewType }; //, parent:props.layoutContainer};
      //console.log(props['targetEditor'], "*******************",props)

      let _uipart = JSON.parse(JSON.stringify(cutcopyUIObj));
      _uipart["name"] = setUIpartName(_uipart["name"], _scrIndex);
      if (mode === "copy") {
        const orderId = getUIpart_orderIndex(editorChildrenArr, _scrIndex);
        _uipart["displayOrderOnScreen"] = parseInt(orderId) + 1;
        if (sourceEditor === props.targetEditor) {
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
          //console.log(_scrIndex, "....copy Dialog #### >>>", dialogItems);
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
      //uiContainer.uiParts.push(_uipart);
      //props.onSelectUI(_uipart);

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
            _suipart.frame.x = _uipart.frame.x; //Math.floor(_uipart.frame.x * scaleW);
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
      props.onSelectUI(_uipart);
      //console.log(props, sourceEditor, mode, props.targetEditor, "....handleUIPaste >>>", cutcopyUIObj, "******", uiContainer, editorChildrenArr);

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
        props.onUpdatePage(props.data);

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
      setOpenalert(true);
      setAlertMsg("Select at-least one UI to cut/copy & paste.");
    }
  }

  function validateDroppedUI(_viewtype, _props) {
    let validationMsg = "";
    //console.log(_props.targetEditor, "... validateDroppedUI ....", _viewtype, _props);

    if (
      _props.editorParent &&
      (_props.editorParent.source === "Dialog" ||
        _props.editorParent.source === "Drawer")
    ) {
      const notallowedUIparts = [
        "Dialog",
        "Drawer",
        "SoundBox",
        "VideoBox",
        "ExpansionPanel",
        "SwipeableView",
      ];
      const findUI = notallowedUIparts.find((element) => element === _viewtype);
      const isNotAllowedUI = findUI ? true : false;
      if (isNotAllowedUI) {
        validationMsg = _viewtype + " UI part not allowed here.";
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
      const findUI = allowedUIparts.find((element) => element === _viewtype);
      const isAllowedUI = findUI ? true : false;
      if (!isAllowedUI) {
        validationMsg = _viewtype + " UI part not allowed here.";
        return validationMsg;
      }
    }

    if (_viewtype === "Dialog") {
      if (_props.targetEditor) {
        if (_props.targetEditor.toLowerCase().indexOf("overlay") === -1) {
          validationMsg = "Dialog UI allowed on 'Page Overlay' only.";
          return validationMsg;
        } else {
          let overlayChildren = _props.currentPage["pageOverlay"]["Children"];
          if (overlayChildren && overlayChildren.length > 0) {
            const findDialogUI = overlayChildren.find(
              (element) => element["viewType"] === _viewtype
            );
            if (findDialogUI) {
              validationMsg = "Only one Dialog UI allowed.";
              return validationMsg;
            }
          }
        }
      }
    } else if (_viewtype === "Drawer") {
      if (_props.targetEditor) {
        if (_props.targetEditor.toLowerCase().indexOf("overlay") > -1) {
          validationMsg = "Drawer UI allowed on 'Page Overlay' only.";
          return validationMsg;
        }
      }
    } else if (_viewtype === "TileList") {
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
    } else if (_viewtype === "Chart") {
      if (
        props.targetEditor === "tablecell" ||
        props.targetEditor === "TileList"
      ) {
        validationMsg = "Chart UI part not allowed here.";
        return validationMsg;
      }
    } else if (
      _viewtype === "ExpansionPanel" ||
      _viewtype === "SwipeableView"
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
        (element) => element === props.targetEditor
      );
      const isNotAllowedContainer = findContainer ? true : false;
      if (isNotAllowedContainer) {
        const uiName =
          _viewtype === "ExpansionPanel" ? "Expansion Panel" : "Swipeable View";
        validationMsg = uiName + " not allowed here.";
        return validationMsg;
      }
    } else if (_viewtype === "Form" || _viewtype === "FormView") {
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
        _viewtype === "Dialog" || _viewtype === "Drawer" ? true : false;
      if (!allowedUI) {
        validationMsg = "Only 'Dialog' or 'Drawer' UI allowed on Page Overlay.";
        return validationMsg;
      }
    }

    const mediaUIparts = ["Camera", "GoogleMap", "SoundBox", "VideoBox"];
    const findMediaUI = mediaUIparts.find((element) => element === _viewtype);
    const isMediaUI = findMediaUI ? true : false;

    const _scrIndex = parseInt(selectedScreen);
    const pgChildren = getAllChildrenOnPage(props.data, _scrIndex); //_props['allChildren'];
    pgChildren.forEach((uipart) => {
      if (isMediaUI && uipart["viewType"] === _viewtype) {
        validationMsg = "Only one same type of media UI supported on a page.";
      }
    });

    return validationMsg;
  }

  function getChildrenArray(targetEditor, scrIndex, pagedata) {
    //console.log(targetEditor, "...getChildrenArray >>>>", props);
    const scrId = scrIndex ? scrIndex : 0;

    let _data = pagedata ? pagedata : props.data;
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
        const _uidata = props.editorParent ? props.editorParent["ui"] : "";
        if (_uidata !== "" && _uidata["viewType"] === "TileList") {
          return _uidata.dataarray[0].Fields;
        }
        return _data.Children;

      case "ExpansionPanel":
        const expnPanelUI = props.editorParent["ui"];
        let indx = props.editorParent["index"]
          ? props.editorParent["index"]
          : 0;
        let panelItems = expnPanelUI["panelItems"];
        return panelItems[indx]["Fields"];

      case "SwipeableView":
        const swipeViewUI = props.editorParent["ui"];
        let idx = props.editorParent["index"] ? props.editorParent["index"] : 0;
        let swipeableItems = swipeViewUI["swipeableItems"];
        return swipeableItems[idx]["Fields"];

      case "Form":
      case "FormView":
        const formUI = props.editorParent["ui"];
        let index = props.editorParent["index"]
          ? props.editorParent["index"]
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
    //if(mode === "copy"){
    pastedUIname = validateUIname(pastedUIname, scrIndex);
    //}

    return pastedUIname;
  }
  function validateUIname(uiname, scrIndex) {
    let uiPartsName = [];

    const _allChildren = getAllChildrenOnPage(props.data, scrIndex); //props['allChildren'];
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
    let _data = props.data;
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
        if (props.editorParent && props.editorParent["ui"]) {
          const tileUI = props.editorParent["ui"];
          targetFrame["width"] = parseInt(tileUI.dataarray[0]["width"]);
          targetFrame["height"] = parseInt(tileUI.dataarray[0]["height"]);
        }
        break;
      case "Dialog":
        if (props.editorParent && props.editorParent["ui"]) {
          const dialogUI = props.editorParent["ui"];
          const editorwidth =
            parseInt(dialogUI.dataarray[0].width) -
            parseInt(dialogUI.padding.left + dialogUI.padding.right);
          targetFrame["width"] = editorwidth;
          targetFrame["height"] = parseInt(dialogUI.dataarray[0]["height"]);
        }
        break;
      case "Drawer":
        if (props.editorParent && props.editorParent["ui"]) {
          const drawerUI = props.editorParent["ui"];
          const scrFrame = props.appData["availableScreens"][scrIndex];
          const editorwidth =
            parseInt(scrFrame.width) -
            parseInt(drawerUI.padding.left + drawerUI.padding.right);
          targetFrame["width"] = editorwidth;
          targetFrame["height"] = parseInt(drawerUI.dataarray[0]["height"]);
        }
        break;

      case "ExpansionPanel":
        if (props.editorParent && props.editorParent["ui"]) {
          const expnPanelUI = props.editorParent["ui"];
          let indx = props.editorParent["index"]
            ? props.editorParent["index"]
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
    const pageData = _props.data;
    currentScreenIndex = currentScreenIndex ? parseInt(currentScreenIndex) : 0;
    //console.log(currentScreenIndex, type, cutUIdef, ".... paste uipart in toolbar >>>> ", targetEditor, pageData);
    if (targetEditor.toLowerCase().indexOf("toolbar") > -1) {
      let barType;
      if (targetEditor === "topToolbar") barType = "_toolBarTop";
      else if (targetEditor === "bottomToolbar") barType = "_toolBarBottom";
      else if (targetEditor === "leftToolbar") barType = "_toolBarLeft";
      else if (targetEditor === "rightToolbar") barType = "_toolBarRight";

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
              /*for(let aa=0; aa< pastedUI['uiParts'].length; aa++){
                if(aa !== i){
                  pastedUI['uiParts'][aa] = {};
                }else{
                  delete cutUIdef['selected'];
                  cutUIdef['uiParts'][aa] = {};
                }
              }*/
              _slaveScreen_toolbarChildren.push(pastedUI);
            }
          } else {
            pageData[barType][i]["Children"] = toolbarChildren;
          }
        }

        /* if(i === currentScreenIndex)  continue;

        if(type === "delete") {
          if(cutUIdef) {
            let _slaveScreen_toolbarChildren = pageData[barType][i]['Children'];
            for (let index = 0; index < _slaveScreen_toolbarChildren.length; index++) {
              const uidef = _slaveScreen_toolbarChildren[index];
              let uidefparts = uidef['uiParts'];
              if(uidefparts && (uidefparts[i]['name'] === cutUIdef[0]['uiParts'][i]['name'])) {
                _slaveScreen_toolbarChildren.splice(index, 1);
                break;
              }                
            }
          }else {
            pageData[barType][i]['Children'] = toolbarChildren;
          }
        }else {
          pageData[barType][i]['Children'] = toolbarChildren;          
        } */
      }
    } else if (targetEditor === "TileList") {
      let tilelistUI;
      const pageChildren = getAllChildrenOnPage(pageData, currentScreenIndex); //getChildrenArray("page", this.props['pagedata']);
      if (pageChildren.length > 1) {
        const sourceUI = _props["editorParent"]["ui"];
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
      let dialogUI;
      const overlayChildren = pageData["pageOverlay"]["Children"];
      if (overlayChildren.length > 1) {
        const sourceUI = _props["editorParent"]["ui"];
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

      const dialogChildren = JSON.parse(
        JSON.stringify(
          dialogUI["uiParts"][currentScreenIndex]["dataarray"][0]["Fields"]
        )
      );
      for (let j = 0; j < screensArr.length; j++) {
        if (j === currentScreenIndex) continue;
        dialogUI["uiParts"][j]["dataarray"][0]["Fields"] = dialogChildren;

        /*let _slaveScreen_dialogChildren = dialogUI['uiParts'][j]['dataarray'][0]['Fields'];
        _slaveScreen_dialogChildren.forEach(element => {
          delete element['selected'];
        });

        const pastedUI = JSON.parse(JSON.stringify(cutUIdef));        
        for(let aa=0; aa< pastedUI['uiParts'].length; aa++){
          if(aa !== j){
            pastedUI['uiParts'][aa] = {};
          }else{
            delete cutUIdef['selected'];
            cutUIdef['uiParts'][aa] = {};
          }
        }
        _slaveScreen_dialogChildren.push(pastedUI);*/
      }
      //console.log(dialogUI, ".... paste uipart in dialog >>>> ", dialogChildren);
    }
  }

  function handleUIForward() {
    if (props.selectedUIparts.length > 0) {
      setOpenalert(true);
      setAlertMsg("This operation is not supported for multiple UIs.");
      return;
    }

    if (props.selectedUI && props.selectedUI.hasOwnProperty("viewType")) {
      let pageChildren = getUIData_byContainer(
        props,
        props["targetEditor"],
        selectedScreen
      ); //props.data['Children'];
      if (pageChildren.length === 0) {
        return;
      }
      const lastUIElement = pageChildren[pageChildren.length - 1];
      let lastUI_displayOrder = lastUIElement["uiParts"][selectedScreen]
        ? parseInt(
            lastUIElement["uiParts"][selectedScreen]["displayOrderOnScreen"]
          )
        : pageChildren.length - 1;
      if (props.selectedUI["displayOrderOnScreen"] === lastUI_displayOrder) {
        setOpenalert(true);
        setAlertMsg("This can't be forward more.");
        return;
      }

      let _index = -1;
      for (let i = 0; i < pageChildren.length; i++) {
        const child = pageChildren[i];
        let uipart = child["uiParts"][selectedScreen]
          ? child["uiParts"][selectedScreen]
          : child["uiParts"][0];
        if (
          uipart.name === props.selectedUI["name"] &&
          uipart.viewType === props.selectedUI["viewType"]
        ) {
          uipart["displayOrderOnScreen"] =
            parseInt(uipart["displayOrderOnScreen"]) + 1;
          _index = i + 1;
        } else {
          if (i === _index) {
            uipart["displayOrderOnScreen"] =
              parseInt(uipart["displayOrderOnScreen"]) - 1;
          }
        }
      }

      props.onUpdatePage(props.data);
    } else {
      setOpenalert(true);
      setAlertMsg("Select a UI to send forward.");
    }
  }

  function handleUIFront() {
    if (props.selectedUIparts.length > 0) {
      setOpenalert(true);
      setAlertMsg("This operation is not supported for multiple UIs.");
      return;
    }

    if (props.selectedUI && props.selectedUI.hasOwnProperty("viewType")) {
      let pageChildren = getUIData_byContainer(
        props,
        props["targetEditor"],
        selectedScreen
      ); //props.data['Children'];
      if (pageChildren.length === 0) {
        return;
      }
      const lastUIElement = pageChildren[pageChildren.length - 1];
      let lastUI_displayOrder = lastUIElement["uiParts"][selectedScreen]
        ? parseInt(
            lastUIElement["uiParts"][selectedScreen]["displayOrderOnScreen"]
          )
        : pageChildren.length - 1;
      if (props.selectedUI["displayOrderOnScreen"] === lastUI_displayOrder) {
        setOpenalert(true);
        setAlertMsg("This is already foremost.");
        return;
      }

      let _index = -1;
      for (let i = 0; i < pageChildren.length; i++) {
        const child = pageChildren[i];
        let uipart = child["uiParts"][selectedScreen]
          ? child["uiParts"][selectedScreen]
          : child["uiParts"][0];
        if (
          uipart.name === props.selectedUI["name"] &&
          uipart.viewType === props.selectedUI["viewType"]
        ) {
          uipart["displayOrderOnScreen"] = lastUI_displayOrder;
          _index = i;
        } else {
          if (i > _index) {
            uipart["displayOrderOnScreen"] =
              uipart["displayOrderOnScreen"] > 0
                ? parseInt(uipart["displayOrderOnScreen"]) - 1
                : 0;
          }
        }
      }

      props.onUpdatePage(props.data);
    } else {
      setOpenalert(true);
      setAlertMsg("Select a UI to send front.");
    }
  }

  function handleUIBackward() {
    if (props.selectedUIparts.length > 0) {
      setOpenalert(true);
      setAlertMsg("This operation is not supported for multiple UIs.");
      return;
    }

    if (props.selectedUI && props.selectedUI.hasOwnProperty("viewType")) {
      if (props.selectedUI["displayOrderOnScreen"] === 0) {
        setOpenalert(true);
        setAlertMsg("This can't be back further");
        return;
      }

      let pageChildren = getUIData_byContainer(
        props,
        props["targetEditor"],
        selectedScreen
      ); //props.data['Children'];
      let _index = -1;
      for (let i = pageChildren.length - 1; i >= 0; i--) {
        const child = pageChildren[i];
        let uipart = child["uiParts"][selectedScreen]
          ? child["uiParts"][selectedScreen]
          : child["uiParts"][0];
        if (
          uipart.name === props.selectedUI["name"] &&
          uipart.viewType === props.selectedUI["viewType"]
        ) {
          uipart["displayOrderOnScreen"] =
            parseInt(uipart["displayOrderOnScreen"]) - 1;
          _index = i - 1;
        } else {
          if (i === _index) {
            uipart["displayOrderOnScreen"] =
              parseInt(uipart["displayOrderOnScreen"]) + 1;
          }
        }
        //console.log(i, "...handleUIBackward >>>", uipart.name, uipart['displayOrderOnScreen']);
      }

      props.onUpdatePage(props.data);
    } else {
      setOpenalert(true);
      setAlertMsg("Select a UI to send backward.");
    }
  }

  function handleUIBack() {
    if (props.selectedUIparts.length > 0) {
      setOpenalert(true);
      setAlertMsg("This operation is not supported for multiple UIs.");
      return;
    }

    if (props.selectedUI && props.selectedUI.hasOwnProperty("viewType")) {
      if (props.selectedUI["displayOrderOnScreen"] === 0) {
        setOpenalert(true);
        setAlertMsg("This can't be back further");
        return;
      }

      let pageChildren = getUIData_byContainer(
        props,
        props["targetEditor"],
        selectedScreen
      ); //props.data['Children'];
      let _index = -1;
      for (let i = pageChildren.length - 1; i >= 0; i--) {
        const child = pageChildren[i];
        let uipart = child["uiParts"][selectedScreen]
          ? child["uiParts"][selectedScreen]
          : child["uiParts"][0];
        if (
          uipart.name === props.selectedUI["name"] &&
          uipart.viewType === props.selectedUI["viewType"]
        ) {
          uipart["displayOrderOnScreen"] = 0;
          _index = i;
        } else {
          if (i < _index) {
            uipart["displayOrderOnScreen"] =
              parseInt(uipart["displayOrderOnScreen"]) + 1;
          }
        }
        //console.log(i, "...handleUIBack >>>", uipart.name, uipart['displayOrderOnScreen']);
      }

      props.onUpdatePage(props.data);
    } else {
      setOpenalert(true);
      setAlertMsg("Select a UI to send back");
    }
  }

  ////////////////////////////////

  function handleAlignLeft() {
    let selectedItems = props.selectedUIparts;
    console.log("Selected Items are: ", selectedItems);
    if (selectedItems.length < 2) {
      setOpenalert(true);
      setAlertMsg("Select at-least 2 UIs for this operation.");
      return;
    }

    let minX = Number.MAX_VALUE;
    let dataModel;

    for (let i = 0; i < selectedItems.length; i++) {
      dataModel = selectedItems[i]["UI"];
      if (dataModel.frame.x < minX) minX = dataModel.frame.x;
    }

    for (let j = 0; j < selectedItems.length; j++) {
      dataModel = selectedItems[j]["UI"];
      dataModel["frame"]["x"] = minX;
    }

    props.onUpdatePage(props.data);
  }

  function handleAlignCenter() {
    let selectedItems = props.selectedUIparts;
    if (selectedItems.length < 2) {
      setOpenalert(true);
      setAlertMsg("Select at-least 2 UIs for this operation.");
      return;
    }

    let minX = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;

    let dataModel;
    for (let i = 0; i < selectedItems.length; i++) {
      dataModel = selectedItems[i]["UI"];
      if (dataModel.frame.x < minX) minX = parseInt(dataModel.frame.x);
      if (parseInt(dataModel.frame.x) + parseInt(dataModel.frame.width) > maxX)
        maxX = parseInt(dataModel.frame.x) + parseInt(dataModel.frame.width);
    }
    let centerX = parseInt((minX + maxX) / 2);

    for (let j = 0; j < selectedItems.length; j++) {
      dataModel = selectedItems[j]["UI"];
      dataModel["frame"]["x"] = parseInt(
        centerX - parseInt(dataModel.frame.width) / 2
      );
    }

    props.onUpdatePage(props.data);
  }

  function handleAlignRight() {
    let selectedItems = props.selectedUIparts;
    if (selectedItems.length < 2) {
      setOpenalert(true);
      setAlertMsg("Select at-least 2 UIs for this operation.");
      return;
    }

    let maxX = Number.MIN_VALUE;

    let dataModel;
    for (let i = 0; i < selectedItems.length; i++) {
      dataModel = selectedItems[i]["UI"];
      if (parseInt(dataModel.frame.x) + parseInt(dataModel.frame.width) > maxX)
        maxX = parseInt(dataModel.frame.x) + parseInt(dataModel.frame.width);
    }

    for (var j = 0; j < selectedItems.length; j++) {
      dataModel = selectedItems[j]["UI"];
      dataModel["frame"]["x"] = maxX - parseInt(dataModel.frame.width);
    }

    props.onUpdatePage(props.data);
  }

  function handleSpacingHorizontal() {
    let selectedItems = props.selectedUIparts;
    if (selectedItems.length < 3) {
      setOpenalert(true);
      setAlertMsg("Select at-least 3 UIs for this operation.");
      return;
    }

    let minX = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;

    let dataModel;
    let firstObject;
    let lastObject;

    for (let i = 0; i < selectedItems.length; i++) {
      dataModel = selectedItems[i]["UI"];
      if (dataModel.frame.x < minX) {
        firstObject = dataModel;
        minX = dataModel.frame.x;
      }
      if (
        parseInt(dataModel.frame.x) + parseInt(dataModel.frame.width) >
        maxX
      ) {
        maxX = parseInt(dataModel.frame.x) + parseInt(dataModel.frame.width);
        lastObject = dataModel;
      }
    }

    let arrMiddleObjs = [];
    let totalWidthOfMiddleObjs = 0;
    selectedItems.forEach((modelItem) => {
      let modelObj = modelItem["UI"];
      if (modelObj !== firstObject && modelObj !== lastObject) {
        let obj = {};
        obj.model = modelObj;
        obj.X = parseInt(modelObj.frame.x);
        arrMiddleObjs.push(obj);
        totalWidthOfMiddleObjs += parseInt(modelObj.frame.width);
      }
    });

    arrMiddleObjs.sort(function (a, b) {
      return a.X - b.X;
    });
    let gap_Between_First_N_Last_Objs =
      parseInt(lastObject.frame.x) -
      (parseInt(firstObject.frame.x) + parseInt(firstObject.frame.width));
    let equalSpace =
      (gap_Between_First_N_Last_Objs - totalWidthOfMiddleObjs) /
      (arrMiddleObjs.length + 1);
    let prevModel;
    for (let j = 0; j < arrMiddleObjs.length; j++) {
      dataModel = arrMiddleObjs[j].model;
      prevModel = j === 0 ? firstObject : arrMiddleObjs[j - 1].model;
      let newX =
        parseInt(prevModel.frame.x) +
        parseInt(prevModel.frame.width) +
        equalSpace;
      dataModel["frame"]["x"] = isNaN(newX) ? 0 : parseInt(newX);
    }

    props.onUpdatePage(props.data);
  }

  function handleAlignTop() {
    let selectedItems = props.selectedUIparts;
    if (selectedItems.length < 2) {
      setOpenalert(true);
      setAlertMsg("Select at-least 2 UIs for this operation.");
      return;
    }

    let minY = Number.MAX_VALUE;
    let dataModel;

    for (let i = 0; i < selectedItems.length; i++) {
      dataModel = selectedItems[i]["UI"];
      if (dataModel.frame.y < minY) minY = dataModel.frame.y;
    }

    for (let j = 0; j < selectedItems.length; j++) {
      dataModel = selectedItems[j]["UI"];
      dataModel["frame"]["y"] = minY;
    }

    props.onUpdatePage(props.data);
  }

  function handleAlignMiddle() {
    let selectedItems = props.selectedUIparts;
    if (selectedItems.length < 2) {
      setOpenalert(true);
      setAlertMsg("Select at-least 2 UIs for this operation.");
      return;
    }

    let minY = Number.MAX_VALUE;
    let maxY = Number.MIN_VALUE;

    let dataModel;
    for (let i = 0; i < selectedItems.length; i++) {
      dataModel = selectedItems[i]["UI"];
      if (dataModel.frame.y < minY) minY = parseInt(dataModel.frame.y);
      if (parseInt(dataModel.frame.y) + parseInt(dataModel.frame.height) > maxY)
        maxY = parseInt(dataModel.frame.y) + parseInt(dataModel.frame.height);
    }

    let centerY = parseInt((minY + maxY) / 2);
    for (let j = 0; j < selectedItems.length; j++) {
      dataModel = selectedItems[j]["UI"];
      dataModel["frame"]["y"] = parseInt(
        centerY - parseInt(dataModel.frame.height) / 2
      );
    }

    props.onUpdatePage(props.data);
  }

  function handleAlignBottom() {
    let selectedItems = props.selectedUIparts;
    if (selectedItems.length < 2) {
      setOpenalert(true);
      setAlertMsg("Select at-least 2 UIs for this operation.");
      return;
    }

    let maxY = Number.MIN_VALUE;

    let dataModel;
    for (let i = 0; i < selectedItems.length; i++) {
      dataModel = selectedItems[i]["UI"];
      if (parseInt(dataModel.frame.y) + parseInt(dataModel.frame.height) > maxY)
        maxY = parseInt(dataModel.frame.y) + parseInt(dataModel.frame.height);
    }

    for (let j = 0; j < selectedItems.length; j++) {
      dataModel = selectedItems[j]["UI"];
      dataModel["frame"]["y"] = maxY - parseInt(dataModel.frame.height);
    }

    props.onUpdatePage(props.data);
  }

  function handleSpacingVertical() {
    let selectedItems = props.selectedUIparts;
    if (selectedItems.length < 3) {
      setOpenalert(true);
      setAlertMsg("Select at-least 3 UIs for this operation.");
      return;
    }

    let minY = Number.MAX_VALUE;
    let maxY = Number.MIN_VALUE;

    let dataModel;
    let firstObject;
    let lastObject;

    for (let i = 0; i < selectedItems.length; i++) {
      dataModel = selectedItems[i]["UI"];
      if (dataModel.frame.y < minY) {
        firstObject = dataModel;
        minY = dataModel.frame.y;
      }
      if (
        parseInt(dataModel.frame.y) + parseInt(dataModel.frame.height) >
        maxY
      ) {
        maxY = parseInt(dataModel.frame.y) + parseInt(dataModel.frame.height);
        lastObject = dataModel;
      }
    }

    let arrMiddleObjs = [];
    let totalHeightOfMiddleObjs = 0;
    selectedItems.forEach((modelItem) => {
      let modelObj = modelItem["UI"];
      if (modelObj !== firstObject && modelObj !== lastObject) {
        let obj = {};
        obj.model = modelObj;
        obj.Y = parseInt(modelObj.frame.y);
        arrMiddleObjs.push(obj);
        totalHeightOfMiddleObjs += parseInt(modelObj.frame.height);
      }
    });

    arrMiddleObjs.sort(function (a, b) {
      return a.Y - b.Y;
    });
    let gap_Between_First_N_Last_Objs =
      parseInt(lastObject.frame.y) -
      (parseInt(firstObject.frame.y) + parseInt(firstObject.frame.height));
    let equalSpace =
      (gap_Between_First_N_Last_Objs - totalHeightOfMiddleObjs) /
      (arrMiddleObjs.length + 1);
    let prevModel;
    for (let j = 0; j < arrMiddleObjs.length; j++) {
      dataModel = arrMiddleObjs[j].model;
      prevModel = j === 0 ? firstObject : arrMiddleObjs[j - 1].model;
      let newY =
        parseInt(prevModel.frame.y) +
        parseInt(prevModel.frame.height) +
        equalSpace;
      dataModel["frame"]["y"] = isNaN(newY) ? 0 : parseInt(newY);
    }

    props.onUpdatePage(props.data);
  }

  ////////////////////////////////

  const [openalert, setOpenalert] = React.useState(false);
  const [alertmsg, setAlertMsg] = React.useState("");

  const handleCloseAlert = () => {
    setOpenalert(false);
    setAlertMsg("");
  };

  ///////// Copy Page-bars functionality /////////

  const displayCopyBars =
    props.appData.hasOwnProperty("ProjectRole") &&
    props.appData["ProjectRole"] === "contributor"
      ? "none"
      : "inline-flex";
  const [pagebarsvalue, setCopyPagebarsValue] = React.useState("");
  const [pagebardef, setPagebarDefs] = React.useState({});
  const [openconfirm, setPagebarsConfirm] = React.useState(false);
  const [setconfirmmsg, setConfirmMessage] = React.useState("");
  const [confirmaction, setConfirmAction] = React.useState("");

  const handleCloseCopyPagebars = () => {
    setOpenPagebarsDialog(false);
    setCopyPagebarsValue("");

    resetPageList();
  };

  const handlePagebarsValueChange = (event) => {
    setCopyPagebarsValue(event.target.value);
  };

  const handleApplyCopyPagebars = () => {
    if (pagebarsvalue === "") {
      setOpenalert(true);
      setAlertMsg("Select any one part to set");
      return;
    } else {
      const _scrIndex = parseInt(selectedScreen);
      let pageBarDefs;
      let pageBarName = "";
      let eventError = "";

      switch (pagebarsvalue) {
        case "toptoolbar":
          pageBarDefs = pagedata._toolBarTop[_scrIndex];
          pageBarName = "Top Toolbar";
          break;
        case "bottomtoolbar":
          pageBarDefs = pagedata._toolBarBottom[_scrIndex];
          pageBarName = "Bottom Toolbar";
          break;
        case "lefttoolbar":
          pageBarDefs = pagedata._toolBarLeft[_scrIndex];
          pageBarName = "Left Sidebar";
          break;
        case "righttoolbar":
          pageBarDefs = pagedata._toolBarRight[_scrIndex];
          pageBarName = "Right Sidebar";
          break;
        case "pageoverlay":
          pageBarDefs = pagedata.pageOverlay;
          pageBarName = "Page Overlay";
          break;
        case "pageevents":
          if (checkedPageEvents.length > 0) {
            let eventObj = {};
            const beforeObj = checkedPageEvents.find((x) => x === "before");
            if (beforeObj) {
              const beforeViewEvents = pagedata.actions["beforeViewPage"];
              if (beforeViewEvents.length === 0) {
                eventError = "'Before View Page'";
              } else {
                eventObj["beforeViewPage"] = beforeViewEvents;
              }
            }
            const afterObj = checkedPageEvents.find((x) => x === "after");
            if (afterObj) {
              const afterViewEvents = pagedata.actions["afterViewPage"];
              if (afterViewEvents.length === 0) {
                eventError =
                  eventError.length > 0
                    ? eventError + " and 'After View Page'"
                    : "'After View Page'";
              } else {
                eventObj["afterViewPage"] = afterViewEvents;
              }
            }
            pageBarDefs = { viewType: "pageevents", events: eventObj };
          } else {
            pageBarDefs = {};
          }
          pageBarName = "Page Actions";
          break;
        default:
          pageBarDefs = {};
          break;
      }

      if (pageBarDefs) {
        if (pageBarDefs.hasOwnProperty("hidden") && pageBarDefs["hidden"]) {
          setOpenalert(true);
          setAlertMsg(pageBarName + " is not set for this page.");
          return;
        } else if (
          pagebarsvalue === "pageoverlay" &&
          pageBarDefs["Children"].length === 0
        ) {
          setOpenalert(true);
          setAlertMsg("No ui-part set on " + pageBarName + " for this page.");
          return;
        } else if (pagebarsvalue === "pageevents" && eventError.length > 0) {
          setOpenalert(true);
          setAlertMsg(
            "Current page don't have actions in " +
              eventError +
              " for this page."
          );
          return;
        } else {
          setPagebarDefs(pageBarDefs);
          setPagebarsConfirm(true);
          setConfirmMessage(
            pageBarName +
              " definition of current page will be override to all/selected pages.\n\nDo you want to continue?"
          );
        }
      }
    }

    setOpenalert(false);
    setAlertMsg("");
  };

  const [checkedPageEvents, setCheckedPageEvents] = React.useState([
    "before",
    "after",
  ]);

  function handleSelectPageEvents(event) {
    const strname = event.currentTarget.name;
    //console.log(".....handleSelectPageEvents >>>>>>", strname);
    const currentIndex = checkedPageEvents.indexOf(strname);
    const selectEvent = [...checkedPageEvents];

    if (currentIndex === -1) {
      selectEvent.push(strname);
    } else {
      selectEvent.splice(currentIndex, 1);
    }

    if (selectEvent.length === 0) {
      setOpenalert(true);
      setAlertMsg("Any one of the options must be selected");
      return;
    }
    setCheckedPageEvents(selectEvent);
  }

  // ---- Page Selection implementation ---- //

  const [anchorPagelist, setAnchorPagelist] = React.useState(null);
  const openPagelist = Boolean(anchorPagelist);

  const [checkedAllPageIds, setCheckedAllPageIds] = React.useState(true);
  const [checkedPageIds, setCheckedPageIds] = React.useState([]);

  function resetPageList() {
    setCheckedAllPageIds(true);
    const _pageids = setAllPageIds();
    setCheckedPageIds(_pageids);
  }
  function setAllPageIds() {
    let pageids = [];
    for (let i = 0; i < props.allPages.length; i++) {
      const _page = props.allPages[i];
      pageids.push(_page.pageid);
    }
    return pageids;
  }

  function handlePageListOpen(event) {
    //console.log(props, ".. handlePageListOpen >>>", props.allPages);
    setAnchorPagelist(event.currentTarget);

    //console.log(checkedAllPageIds, "SelectPageIds>>>>", checkedPageIds);
    //setCheckedAllPageIds(true);
    let _pageids;
    if (checkedAllPageIds) {
      _pageids = setAllPageIds();
    } else {
      _pageids = checkedPageIds;
    }
    setCheckedPageIds(_pageids);
  }
  function handlePageListClose() {
    setAnchorPagelist(null);
    resetPageList();
  }
  function handlePageListCancel() {
    setAnchorPagelist(null);
  }
  function handlePageListSet() {
    //console.log(checkedAllPageIds, ".. handlePageListSet >>>", checkedPageIds);
    if (!checkedAllPageIds) {
      let noselect = false;
      if (checkedPageIds.length === 0) {
        noselect = true;
      } else if (checkedPageIds.length === 1) {
        if (
          parseInt(checkedPageIds[0]) === parseInt(props.currentPage["pageid"])
        ) {
          noselect = true;
        }
      }
      if (noselect) {
        setOpenalert(true);
        setAlertMsg("Need to select atleast one page");
        return;
      }
    }
    setAnchorPagelist(null);
  }
  function handleSelectAllPageIds(event) {
    let updatedValue = Boolean(event.currentTarget.checked);
    setCheckedAllPageIds(updatedValue);
    if (updatedValue) {
      const _pageids = setAllPageIds();
      setCheckedPageIds(_pageids);
    } else {
      const _currentpageid = [props.currentPage["pageid"]];
      setCheckedPageIds(_currentpageid);
    }
  }
  function handleSelectPageIds(event) {
    const value = event.currentTarget["dataset"]["id"];
    const currentIndex = checkedPageIds.indexOf(value);
    const newChecked = [...checkedPageIds];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    //console.log(value, currentIndex, "handleSelectPageIds>>>>", newChecked);
    setCheckedPageIds(newChecked);
    if (newChecked.length !== props.allPages.length) {
      setCheckedAllPageIds(false);
    }
  }

  // ---- ---- //

  function ConfirmAlertCloseHandler() {
    setPagebarsConfirm(false);
    setConfirmMessage("");
  }
  function ConfirmAlertOKHandler() {
    if (confirmaction === "clearpage") {
      const _pagedata = props.data;
      //console.log(props, "...handleClearPageData >>>>", _pagedata);
      if (_pagedata.viewType === "BaseView") {
        _pagedata.Children = [];
      } else if (_pagedata.viewType === "ScrollView") {
        _pagedata.Children[0].Children = [];
      } else if (_pagedata.viewType.indexOf("TableViewList") > -1) {
        if (_pagedata.Children[0]["_tmpCellStyle"] === "custom") {
          _pagedata.Children[0].Group[0]["RecordCellDef"]["Fields"] = [];
          _pagedata.Children[0].Group[0]["rowarray"][0]["Fields"] = [];
        }
      }
      let scrLen = props.appData.availableScreens.length;
      for (let i = 0; i < scrLen; i++) {
        _pagedata._toolBarTop[i].Children = [];
        _pagedata._toolBarBottom[i].Children = [];
        _pagedata._toolBarLeft[i].Children = [];
        _pagedata._toolBarRight[i].Children = [];
      }
      _pagedata.pageOverlay.Children = [];
      props.onUpdatePage(_pagedata);

 let _page = JSON.parse(JSON.stringify(_pagedata));
 if (pagestate) {
   let undoState = pagestate["undo"];
   if (undoState) {
     if (undoState.length > 10) {
       undoState.shift();
     }
     undoState.push(_page);
   }
 }

      setConfirmAction("");
      setConfirmMessage("");
      setPagebarsConfirm(false);
      setAnchorSetting(null);
      return;
    } else if (confirmaction === "") {
      setOpenPagebarsDialog(false);
      setCopyPagebarsValue("");
      setConfirmMessage("");
      setPagebarsConfirm(false);

      const _scrIndex = parseInt(selectedScreen);
      let isSlaveScreen = false;
      let masterScreenIndex = 0;
      const screens = props.appData["availableScreens"];
      if (screens.length > 1) {
        screens.forEach((element, i) => {
          if (element["embed"]) {
            masterScreenIndex = i;
          }
        });
        const isMasterSlave = props.appData["isMasterScreenSet"];
        if (isMasterSlave && _scrIndex !== masterScreenIndex) {
          isSlaveScreen = true;
        }
      }
      const _pageprops = {
        pageList: props.allPages,
        currentPage: props.data,
        selectAll: checkedAllPageIds,
        selectedPages: checkedPageIds,
      };
      let _response = copypagebarResponse(
        pagebardef,
        _scrIndex,
        _pageprops,
        isSlaveScreen,
        masterScreenIndex
      );
      if (_response.length > 0) {
        /* setConfirmAction('preview');
        setPagebarsConfirm(true);
        setConfirmMessage(_response); */

        setOpenalert(true);
        setAlertMsg(_response);
        if (checkedAllPageIds) {
          props.onAllPagesChanged(true);
        } else {
          props.onAllPagesChanged(false, checkedPageIds);
        }
      }
    } else {
      setConfirmAction("");
      setConfirmMessage("");
      setPagebarsConfirm(false);
      //var _allpages:Array = [];
      //refs.pageEditorHelper.preview(_allpages);
    }

    resetPageList();
  }

  return (
    <Paper id="toolbox" className="toolbox" elevation={6} square>
      <Box className="page-list-paper-box">
        <div className="page-list-grid-container">
          <Tooltip title={<h6>Page Settings</h6>} placement="right-start">
            <Fab size="small" aria-label="setting" className="page-list-fab">
              <SvgIcon onClick={handleSettingOpen}>
                <path
                  transform="scale(1.2, 1.2)"
                  fill="none"
                  d="M0 0h20v20H0V0z"
                ></path>
                <path
                  transform="scale(1.2, 1.2)"
                  d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"
                ></path>
              </SvgIcon>
            </Fab>
          </Tooltip>
          <Popover
            id="setting-popover"
            classes={{ paper: "page-list-paper-context" }}
            style={{ marginLeft: 32, marginTop: -8 }}
            open={settingopen}
            anchorEl={anchorSetting}
            onClose={handleSettingClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <div className="vertical-align" style={{ alignItems: "start" }}>
              <div className="horizontal-align" style={{ height: 36 }}>
                <h4>Set Screen :</h4>
                <Select
                  native
                  value={selectedScreen}
                  style={{
                    margin: "0px 8px",
                    fontSize: "0.875em",
                    height: "2.75rem",
                  }}
                  onChange={handleChangeScreen}
                >
                  {screens.map((screen, id) => (
                    <option key={id} value={id}>
                      {screen.width} x {screen.height}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="page-list-vertical-divider" />
              <button
                color="default"
                className="page-editor-popup-frm"
                // style={{ display: displayCopyBars }}
                onClick={handleOpenCopyPagebars}
              >
                Copy Page-Parts
              </button>
              <button
                color="default"
                className="page-editor-popup-frm"
                onClick={handleClearPageUIData}
              >
                Clear Page UI-Data
              </button>
              <button
                color="default"
                className="page-editor-popup-frm"
                onClick={handlePageValidation}
              >
                Page Validation
              </button>
            </div>
          </Popover>
        </div>
      </Box>
      <Box className="page-list-paper-box">
        <div className="page-list-grid-container">
          <Tooltip title={<h6>Save</h6>} placement="right-start">
            <Fab size="small" aria-label="save" className="page-list-fab">
              <SvgIcon onClick={handlePageSave}>
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
              </SvgIcon>
            </Fab>
          </Tooltip>
          <Tooltip title={<h6>View Menu</h6>} placement="right-start">
            <Fab
              size="small"
              aria-label="view"
              className="page-list-fab"
              onClick={handleViewOpen}
            >
              <img
                src="assets/view-off.png"
                alt="view"
                className="page-list-aspect"
                style={{ height: 16 }}
              />
            </Fab>
          </Tooltip>
          <Popover
            id="view-popover"
            className="page-list-popover "
            classes={{ paper: "page-list-paper-context" }}
            open={viewopen}
            anchorEl={anchorEl}
            onClose={handleViewClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <List dense disablePadding>
              {viewItem.map((value, index) => {
                const labelId = `checkbox-list-secondary-label-${index}`;
                return (
                  <ListItem key={index} className="page-list-menu-list">
                    <ListItemText id={labelId} primary={<h4>{value}</h4>} />
                    <ListItemSecondaryAction>
                      <Checkbox
                        color="default"
                        edge="end"
                        onChange={handleToggle(value)}
                        checked={checked.indexOf(value) !== -1}
                        inputProps={{ "aria-labelledby": labelId }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
              <ListItem
                className="page-list-menu-list"
                style={{ display: "none" }}
              >
                <ListItemText primary="Snap Guide" />
                <ListItemSecondaryAction>
                  <Checkbox
                    color="default"
                    edge="end"
                    checked={snapguide}
                    onChange={handleSnapGuide}
                    style={{ display: "none" }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem className="page-list-menu-list">
                <ListItemText primary={<h4>Snap Grid</h4>} />
                <ListItemSecondaryAction>
                  <Checkbox
                    color="default"
                    edge="end"
                    checked={snapgrid}
                    onChange={handleSnapGrid}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem
                className="page-list-menu-list"
                style={{ borderWidth: 0 }}
              >
                <ListItemText primary={<h4>Set Grid Gap</h4>} />
                <ListItemSecondaryAction style={{ right: 2 }}>
                  <input
                    id="numinput"
                    className="page-editor-grid-gap"
                    style={{ padding: 0 }}
                    type="number"
                    value={gridgap}
                    min="5"
                    max="100"
                    step="5"
                    onChange={handleGridGapValue}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Popover>
        </div>
        <div className="page-list-grid-container">
          <Tooltip
            title={<h6>Undo : only last 10 changes can be undo</h6>}
            placement="right-start"
          >
            <Fab size="small" aria-label="undo" className="page-list-fab">
              <SvgIcon onClick={handlePageUndo}>
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
              </SvgIcon>
            </Fab>
          </Tooltip>
          <Tooltip
            title={<h6>Redo : only last 10 changes can be redo</h6>}
            placement="right-start"
          >
            <Fab size="small" aria-label="redo" className="page-list-fab">
              <SvgIcon onClick={handlePageRedo}>
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
              </SvgIcon>
            </Fab>
          </Tooltip>
        </div>
        <div className="page-list-grid-container">
          <Tooltip title={<h6>Zoom In</h6>} placement="right-start">
            <Fab size="small" aria-label="zoom in" className="page-list-fab">
              <SvgIcon onClick={handlePageZoomin}>
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                <path fill="none" d="M0 0h24v24H0V0z" />
                <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z" />
              </SvgIcon>
            </Fab>
          </Tooltip>
          <Tooltip title={<h6>Zoom Out</h6>} placement="right-start">
            <Fab size="small" aria-label="zoom out" className="page-list-fab">
              <SvgIcon onClick={handlePageZoomout}>
                <path fill="none" d="M0 0h24v24H0V0z" />
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z" />
              </SvgIcon>
            </Fab>
          </Tooltip>
        </div>
      </Box>
      <div className="page-list-horizontal-divider" />
      <Box className="page-list-paper-box">
        <div className="page-list-grid-container">
          <Tooltip title={<h6>Cut</h6>} placement="right-start">
            <Fab
              size="small"
              aria-label="cut"
              className="page-list-fab"
              onClick={handleUICut}
            >
              <img
                src="assets/pagetoolbar/cut.png"
                alt="center align"
                className="page-list-aspect"
              />
            </Fab>
          </Tooltip>
          <Tooltip title={<h6>Copy</h6>} placement="right-start">
            <Fab
              size="small"
              aria-label="copy"
              className="page-list-fab"
              onClick={handleUICopy}
            >
              <img
                src="assets/pagetoolbar/copy.png"
                alt="center align"
                className="page-list-aspect"
              />
            </Fab>
          </Tooltip>
          <Tooltip title={<h6>Paste</h6>} placement="right-start">
            <Fab
              size="small"
              aria-label="Paste"
              className="page-list-fab"
              onClick={handleUIPaste}
            >
              <img
                src="assets/pagetoolbar/paste.png"
                alt="center align"
                className="page-list-aspect"
              />
            </Fab>
          </Tooltip>
        </div>
        <div className="page-list-grid-container">
          <Tooltip title={<h6>Send Forward</h6>} placement="right-start">
            <Fab
              size="small"
              aria-label="forward"
              className="page-list-fab"
              onClick={handleUIForward}
            >
              <img
                src="assets/pagetoolbar/send_forward.png"
                alt="center align"
                className="page-list-aspect"
              />
            </Fab>
          </Tooltip>
          <Tooltip title={<h6>Send Front</h6>} placement="right-start">
            <Fab
              size="small"
              aria-label="front"
              className="page-list-fab"
              onClick={handleUIFront}
            >
              <SvgIcon>
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm2 4v-2H3c0 1.1.89 2 2 2zM3 9h2V7H3v2zm12 12h2v-2h-2v2zm4-18H9c-1.11 0-2 .9-2 2v10c0 1.1.89 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H9V5h10v10zm-8 6h2v-2h-2v2zm-4 0h2v-2H7v2z" />
              </SvgIcon>
            </Fab>
          </Tooltip>
          <Tooltip title={<h6>Send Backward</h6>} placement="right-start">
            <Fab
              size="small"
              aria-label="backward"
              className="page-list-fab"
              onClick={handleUIBackward}
            >
              <img
                src="assets/pagetoolbar/send_backward.png"
                alt="center align"
                className="page-list-aspect"
              />
            </Fab>
          </Tooltip>
          <Tooltip title={<h6>Send Back</h6>} placement="right-start">
            <Fab
              size="small"
              aria-label="back"
              className="page-list-fab"
              onClick={handleUIBack}
            >
              <SvgIcon>
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M9 7H7v2h2V7zm0 4H7v2h2v-2zm0-8c-1.11 0-2 .9-2 2h2V3zm4 12h-2v2h2v-2zm6-12v2h2c0-1.1-.9-2-2-2zm-6 0h-2v2h2V3zM9 17v-2H7c0 1.1.89 2 2 2zm10-4h2v-2h-2v2zm0-4h2V7h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zM5 7H3v12c0 1.1.89 2 2 2h12v-2H5V7zm10-2h2V3h-2v2zm0 12h2v-2h-2v2z" />
              </SvgIcon>
            </Fab>
          </Tooltip>
        </div>
      </Box>
      <div className="page-list-horizontal-divider" />
      <Box className="page-list-paper-box">
        <div className="page-list-grid-container">
          <Tooltip title={<h6>Left Align</h6>} placement="right-start">
            <Fab
              size="small"
              aria-label="left align"
              className="page-list-fab"
              onClick={handleAlignLeft}
            >
              <img
                src="assets/pagetoolbar/align-left.png"
                alt="left align"
                className="page-list-aspect"
              />
            </Fab>
          </Tooltip>
          <Tooltip title={<h6>Center Align</h6>} placement="right-start">
            <Fab
              size="small"
              aria-label="center align"
              className="page-list-fab"
              onClick={handleAlignCenter}
            >
              <img
                src="assets/pagetoolbar/align-center.png"
                alt="center align"
                className="page-list-aspect"
              />
            </Fab>
          </Tooltip>
          <Tooltip title={<h6>Right Align</h6>} placement="right-start">
            <Fab
              size="small"
              aria-label="right align"
              className="page-list-fab"
              onClick={handleAlignRight}
            >
              <img
                src="assets/pagetoolbar/align-right.png"
                alt="right align"
                className="page-list-aspect"
              />
            </Fab>
          </Tooltip>
          <Tooltip
            title={<h6>Equal Horizontal Spacing</h6>}
            placement="right-start"
          >
            <Fab
              size="small"
              aria-label="equal horizontal spacing"
              className="page-list-fab"
              onClick={handleSpacingHorizontal}
            >
              <img
                src="assets/pagetoolbar/align-horizontal-equal-spacing.png"
                alt="horizontal align"
                className="page-list-aspect"
              />
            </Fab>
          </Tooltip>
        </div>
        <div className="page-list-grid-container">
          <Tooltip title={<h6>Top Align</h6>} placement="right-start">
            <Fab
              size="small"
              aria-label="top align"
              className="page-list-fab"
              onClick={handleAlignTop}
            >
              <img
                src="assets/pagetoolbar/align-top.png"
                alt="top align"
                className="page-list-aspect"
              />
            </Fab>
          </Tooltip>
          <Tooltip title={<h6>Middle Align</h6>} placement="right-start">
            <Fab
              size="small"
              aria-label="middle align"
              className="page-list-fab"
              onClick={handleAlignMiddle}
            >
              <img
                src="assets/pagetoolbar/align-middle.png"
                alt="middle align"
                className="page-list-aspect"
              />
            </Fab>
          </Tooltip>
          <Tooltip title={<h6>Bottom Align</h6>} placement="right-start">
            <Fab
              size="small"
              aria-label="bottom align"
              className="page-list-fab"
              onClick={handleAlignBottom}
            >
              <img
                src="assets/pagetoolbar/align-bottom.png"
                alt="bottom align"
                className="page-list-aspect"
              />
            </Fab>
          </Tooltip>
          <Tooltip
            title={<h6>Equal Vertical Spacing</h6>}
            placement="right-start"
          >
            <Fab
              size="small"
              aria-label="equal vertical spacing"
              className="page-list-fab"
              onClick={handleSpacingVertical}
            >
              <img
                src="assets/pagetoolbar/align-vertical-equal-spacing.png"
                alt="vertical align"
                className="page-list-aspect"
              />
            </Fab>
          </Tooltip>
        </div>
      </Box>
      <div className="page-list-horizontal-divider" />
      <Box className="page-editor-frm">
        <div className="page-list-grid-container">
          <Tooltip title="Settings Menu">
            <Fab size="small" aria-label="setting" className="page-list-fab">
              <SvgIcon>
                <path
                  transform="scale(1.2, 1.2)"
                  fill="none"
                  d="M0 0h20v20H0V0z"
                ></path>
                <path
                  transform="scale(1.2, 1.2)"
                  d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"
                ></path>
              </SvgIcon>
            </Fab>
          </Tooltip>
        </div>
      </Box>
      <Backdrop
        style={{
          // zIndex: theme.zIndex.drawer + 1,
          color: "#ff0000",
        }}
        open={openalert}
        onClick={handleCloseAlert}
      />
      <Snackbar
        open={openalert}
        message={<h4 className="error-notify">{alertmsg}</h4>}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={SlideTransition}
        autoHideDuration={8000}
        onClose={handleCloseAlert}
        action={
          <React.Fragment>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseAlert}
            >
              <Close fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
      <Dialog
        id="copypagebarsdialog"
        scroll="paper"
        open={opencopybars}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogContent dividers>
          <FormControl component="fieldset">
            <FormLabel style={{ lineHeight: "1.4" }} component="article">
              Please make sure selected page-parts is already set on current
              page.
            </FormLabel>
            <RadioGroup
              style={{ marginTop: 12 }}
              aria-label="page-parts"
              name="pagebars"
              value={pagebarsvalue}
              onChange={handlePagebarsValueChange}
            >
              <FormControlLabel
                style={{ maxHeight: 36 }}
                value="toptoolbar"
                control={<Radio color="default" />}
                label="ToolBar [Top]"
              />
              <FormControlLabel
                style={{ maxHeight: 36 }}
                value="bottomtoolbar"
                control={<Radio color="default" />}
                label="ToolBar [Bottom]"
              />
              <FormControlLabel
                style={{ maxHeight: 36 }}
                value="lefttoolbar"
                control={<Radio color="default" />}
                label="SideBar [Left]"
              />
              <FormControlLabel
                style={{ maxHeight: 36 }}
                value="righttoolbar"
                control={<Radio color="default" />}
                label="SideBar [Right]"
              />
              <FormControlLabel
                style={{ maxHeight: 36 }}
                value="pageoverlay"
                control={<Radio color="default" />}
                label="Page Overlay"
              />
              <FormControlLabel
                style={{ maxHeight: 36 }}
                value="pageevents"
                control={<Radio color="default" />}
                label="Page Actions"
              />
            </RadioGroup>
          </FormControl>
          {pagebarsvalue === "pageevents" && (
            <FormControl component="dialog" className="form-page-events">
              {[
                { text: "Before", val: "before" },
                { text: "After", val: "after" },
              ].map((item, id) => (
                <div key={id} className="page-events">
                  <Checkbox
                    color="default"
                    edge="start"
                    disableRipple
                    size="small"
                    checked={checkedPageEvents.indexOf(item["val"]) > -1}
                    name={item["val"]}
                    onChange={handleSelectPageEvents}
                  />
                  <Typography variant="caption">
                    {item["text"]} View Page
                  </Typography>
                </div>
              ))}
            </FormControl>
          )}
          {pagebarsvalue !== "" && (
            <FormControl component="dialog" className="copy-page-bar-pages">
              <FormLabel component="article">
                If needed, you can select page(s) :
              </FormLabel>
              <button
                variant="contained"
                color="default"
                onClick={handlePageListOpen}
              >
                Select Page(s)
              </button>
              <Popover
                id="view-popover"
                className="page-list-popover "
                classes={{ paper: "page-list-paper-context" }}
                style={{ overflow: "hidden" }}
                open={openPagelist}
                anchorEl={anchorPagelist}
                onClose={handlePageListClose}
                anchorOrigin={{ vertical: "center", horizontal: "right" }}
                transformOrigin={{ vertical: "center", horizontal: "left" }}
              >
                <FormControlLabel
                  label="Select All"
                  className="page-editor-all"
                  style={{ color: "blue" }}
                  control={
                    <Checkbox
                      color="default"
                      edge="start"
                      disableRipple
                      checked={checkedAllPageIds}
                      onChange={handleSelectAllPageIds}
                    />
                  }
                />
                <List
                  dense
                  disablePadding
                  style={{ maxHeight: 480, overflow: "auto" }}
                >
                  {setpagelist(
                    props.allPages,
                    props.currentPage,
                    props.pageHeirarchy
                  ).map((value, index) => (
                    <ListItem
                      key={index}
                      button
                      dense
                      className="page-id-list"
                      data-id={value["id"]}
                      data-status={value["checked"]}
                      onClick={handleSelectPageIds}
                    >
                      <ListItemIcon style={{ minWidth: 32, height: 32 }}>
                        <Checkbox
                          color="default"
                          edge="start"
                          disableRipple
                          tabIndex={-1}
                          checked={checkedPageIds.indexOf(value["id"]) !== -1}
                        />
                      </ListItemIcon>
                      <ListItemText primary={value["title"]} />
                    </ListItem>
                  ))}
                </List>
                <div
                  className="horizontal-align"
                  style={{ justifyContent: "space-around" }}
                >
                  <button
                    variant="contained"
                    color="default"
                    className="page-editor-btn"
                    onClick={handlePageListSet}
                  >
                    Set
                  </button>
                  <button
                    variant="contained"
                    color="default"
                    className="page-editor-btn"
                    style={{ display: "none" }}
                    onClick={handlePageListCancel}
                  >
                    Cancel
                  </button>
                </div>
              </Popover>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <button
            variant="contained"
            color="default"
            onClick={handleCloseCopyPagebars}
          >
            Cancel
          </button>
          <button
            variant="contained"
            color="default"
            onClick={handleApplyCopyPagebars}
          >
            Apply
          </button>
        </DialogActions>
      </Dialog>
      {openconfirm === true && (
        <AlertWindow
          open={true}
          title=""
          message={setconfirmmsg}
          ok="Yes"
          okclick={ConfirmAlertOKHandler}
          cancel="No"
          cancelclick={ConfirmAlertCloseHandler}
        />
      )}
      {openvalidation && (
        <ProjectValidation
          show={openvalidation}
          target="page"
          onCloseWindow={handleCloseValidations}
        />
      )}
    </Paper>
  );
}
function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}
function setpagelist(pages, currentpage, pageH) {
  let pagelist = [];

  for (let i = 0; i < pageH.length; i++) {
    const pageObj = pageH[i];
    if (pageObj && pageObj["level"] > 0) {
      if (pageObj["id"] === currentpage["pageid"]) {
        //continue;
      } else {
        pagelist.push({
          id: pageObj["id"],
          title: pageObj["title"],
          checked: true,
        });
      }

      let pchildren = pageObj["children"];
      let childlist = setpagelist(pages, currentpage, pchildren);
      for (let j = 0; j < childlist.length; j++) {
        const element = childlist[j];
        pagelist.push({
          id: element["id"],
          title: element["title"],
          checked: element["checked"],
        });
      }
    }
  }

  return pagelist;
}

function LayoutWindow(props) {
  const appConfig = props.appconfig;
  const pageData = props.data;
  const currUI = props.currentUI;
  // const bgGradient =
  //   pageData.viewType === "ScrollView"
  //     ? pageData.Children[0].backgroundGradient
  //     : pageData.backgroundGradient;
  const bgColor =
    pageData.viewType === "ScrollView"
      ? getColorValue(pageData.Children[0].backgroundColor)
      : getColorValue(pageData.backgroundColor);
  //console.log(pageData, ">>>>>>>>>>>>>>>", bgColor);

  let screenIndex = 0; //(props.defaultScreenId) ? props.defaultScreenId : 0;
  let screenObj;

  let showruler = "hidden";
  //let showguide = 'hidden';
  let showgrid = false;
  //let snapguide = false;
  //let snapgrid = false;
  let gridgap = 10;

  let zoom = 1;

  if (props.pagestate) {
    let _params = props.pagestate["params"];
    if (_params) {
      if (_params["showall"] && _params["showall"] === "on") {
        showruler = "visible";
        //showguide = 'visible';
        showgrid = true;
      } else {
        showruler =
          _params["showruler"] && _params["showruler"] === "on"
            ? "visible"
            : "hidden";
        //showguide = (_params['showguide'] && _params['showguide'] === 'on') ? 'visible' : 'hidden';
        showgrid =
          _params["showgrid"] && _params["showgrid"] === "on" ? true : false;
      }
      //snapguide = (_params['snapguide'] && _params['snapguide'] === 'on') ? true : false;
      //snapgrid = (_params['snapgrid'] && _params['snapgrid'] === 'on') ? true : false;
      gridgap = _params["gridgap"] ? _params["gridgap"] : 10;

      zoom = _params["zoom"] ? parseInt(_params["zoom"]) / 100 : 1;

      screenIndex = _params["screenIndex"]
        ? parseInt(_params["screenIndex"])
        : 0; //props.defaultScreenId;
      screenObj = _params["screen"];
    }

    //console.log(pageData, "LayoutWindow param >>>>", _params);
  }

  if (!screenObj) {
    /* const scrIndex = (props.defaultScreenId) ? props.defaultScreenId : 0;
    screenObj = props.appData['availableScreens'][scrIndex]; */
    screenObj = props.appData["availableScreens"][0];
  } else {
    screenObj = props.appData["availableScreens"][screenIndex];
  }

  const layoutWidth = screenObj ? screenObj["width"] : pageData.frame.width;
  const layoutHeight = screenObj ? screenObj["height"] : pageData.frame.height;
  const statusbarheight = pageData.StatusBarHidden ? 0 : 20;
  const navbarheight = pageData.NavigationBarHidden ? 0 : 44;
  //const navbarpromptheight = (pageData._navigationBars[0].barHidden) ? 0 : 74;
  const tabbarheight = pageData._tabBarHiddens[screenIndex] ? 0 : 49;
  const topToolbar = pageData._toolBarTop[screenIndex]
    ? pageData._toolBarTop[screenIndex]
    : pageData._toolBarTop[0];
  const toolbartopheight = topToolbar
    ? topToolbar.hidden
      ? 0
      : topToolbar.frame.height
    : 0;
  const bottomToolbar = pageData._toolBarBottom[screenIndex]
    ? pageData._toolBarBottom[screenIndex]
    : pageData._toolBarBottom[0];
  const toolbarbottomheight = bottomToolbar
    ? bottomToolbar.hidden
      ? 0
      : bottomToolbar.frame.height
    : 0;

  let contentheight =
    statusbarheight +
    navbarheight +
    tabbarheight +
    toolbartopheight +
    toolbarbottomheight;
  let contentmargin = statusbarheight + navbarheight + toolbartopheight;

  const gridRows = Math.ceil(layoutHeight / gridgap);
  const gridColumns = Math.ceil(layoutWidth / gridgap);
  let gridRC = [];
  if (pageData.viewType.indexOf("TableView") > -1) showgrid = false;
  if (showgrid) {
    for (let i = 0; i < gridRows; i++) {
      let _gridCol = [];
      for (let j = 0; j < gridColumns; j++) {
        _gridCol.push(j);
      }
      gridRC.push(_gridCol);
    }
  }

  const scale = "scale(" + zoom + ")";

  const headerheight = 2;
  const rulersize = 16;

  const useStyles = makeStyles(() => ({
    root: {
      width: "100%",
      // postion: "relative",
      height: "calc(100% - 55px)",
      display: "flex",
      justifyContent: "start",
    },
    zoom150: {
      justifyContent: "center",
      paddingTop: 218,
    },
    zoom200: {
      justifyContent: "center",
      paddingTop: 430,
    },
  }));

  const classes = useStyles();

  // How to find the alternate code for below session by Shubham Rawat

  let cx = classNames.bind(classes);
  let windowStyle = cx("root");
  if (zoom === 1.5) windowStyle = cx(["root", "zoom150"]);
  if (zoom === 2.0) windowStyle = cx(["root", "zoom200"]);

  function handlePageClose() {
    setAction("pagesave");
    let alertmsg = "Do you want to save this page ?";
    setAlertTitle("");
    setAlertMessage(alertmsg);
    //setOpenAlert(true);
    setOpenConfirm(true);

    //props.onWindowClose(pageData.pageid);
  }

  function handleLayoutClick() {
    props.onWindowSelect(pageData.pageid);
  }

  const [action, setAction] = React.useState("");
  const [openAlert, setOpenAlert] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");
  const [openConfirm, setOpenConfirm] = React.useState(false);

  // const [isDrawing, setIsDrawing] = React.useState(false);
  // const [startX, setStartX] = React.useState(0);
  // const [startY, setStartY] = React.useState(0);
  // const [endX, setEndX] = React.useState(0);
  // const [endY, setEndY] = React.useState(0);
  // const [displayUIList, setDisplayUIList] = React.useState([]);
  // const [isMultiSelective, setIsMultiSelective] = useState(false);

  function alertCloseHandler() {
    setOpenAlert(false);
  }
  function alertOKHandler() {
    setOpenAlert(false);
  }

  function confirmCloseHandler() {
    if (action === "pagesave") {
      props.onWindowClose(pageData.pageid, "nosave");
    }
    setOpenConfirm(false);
    setAction("");
  }
  function confirmOKHandler() {
    if (action === "pagesave") {
      props.onWindowClose(pageData.pageid, "save");
    }
    setOpenConfirm(false);
    setAction("");
  }

  // const handleMouseDown = (e) => {
  //   // console.log(e.clientX + " " + e.clientY);
  //   setIsDrawing(true);
  //   setStartX(e.clientX);
  //   setStartY(e.clientY);
  // };

  // const handleMouseMove = (e) => {
  //   if (!isDrawing) return;
  //   // console.log(e.clientX + " " + e.clientY);

  //   setEndX(e.clientX);
  //   setEndY(e.clientY);
  // };

  // function handleMouseUp() {
  //   setIsDrawing(false);
  //   let idList = [];
  //   let selectedDisplayUIList = [];
  //   let newDisplayUIList = [...displayUIList];
  //   let updatedDisplayList = [];
  //   const rect = {
  //     left: Math.min(startX, endX),
  //     top: Math.min(startY, endY),
  //     width: Math.abs(endX - startX),
  //     height: Math.abs(endY - startY),
  //   };
  //   const selectedElements = getElementsInRectangle(rect);

  //   selectedElements.map((cur) => {
  //     idList.push(cur.id);
  //   });

  //   for (let i = 0; i < newDisplayUIList.length; i++) {
  //     if (idList.includes(newDisplayUIList[i].name)) {
  //       selectedDisplayUIList.push(newDisplayUIList[i]);
  //     }
  //   }

  //   for (let i = 0; i < selectedDisplayUIList.length; i++) {
  //     let curSelectedObj = selectedDisplayUIList[i];
  //     let selectedUIObj = { editor: targetEditor, UI: curSelectedObj };
  //     updatedDisplayList.push(selectedUIObj);
  //   }

  //   console.log(updatedDisplayList);

  //   setStartX(0);
  //   setStartY(0);
  //   setEndX(0);
  //   setEndY(0);
  //   setIsMultiSelective(false);
  // }

  // function handleMultipleSelection() {
  //   setIsMultiSelective(true);
  // }

  // useEffect(() => {
  //   if (currUI) {
  //     setDisplayUIList((preVal) => [...preVal, currUI]);
  //   }
  // }, [currUI]);

  return (
    <Draggable // 600
      handle=".page-explorer-drag"
      bounds={{ top: 0, left: 0, right: 740, bottom: 230 }}
    >
      <div
        id="layoutwindow"
        className={windowStyle}
        onClick={handleLayoutClick}
      >
        <Box
          className="page-explorer-window"
          style={{
            transform: scale,
            width: `calc(${layoutWidth + rulersize}px)`,
            height: `calc(${layoutHeight + rulersize + headerheight + 25}px)`,
          }}
        >
          <div className="page-explorer-drag"></div>
          <div
            id="header"
            className="page-editor-header"
            style={{
              height: headerheight,
              lineHeight: headerheight,
            }}
          >
            <IconButton className="header-close-icon" onClick={handlePageClose}>
              <Close />
            </IconButton>
            <Typography className="page-editor-heading">
              {pageData.Title}
            </Typography>
          </div>
          <span
            className="page-editor-top-ruler"
            style={{
              width: layoutWidth,
              height: rulersize,
              marginLeft: rulersize,
              visibility: showruler,
              backgroundImage: `url(${toprulerImage})`,
            }}
          ></span>
          <div id="layouteditor" className="page-editor-layout-editor">
            <span
              className="page-editor-left-ruler"
              style={{
                width: rulersize,
                height: `calc(100% - ${contentheight}px)`,
                marginTop: contentmargin,
                visibility: showruler,
                backgroundImage: `url(${leftrulerImage})`,
              }}
            ></span>
            <Paper
              className="page-editor-page-layout"
              style={{
                width: layoutWidth,
                height: layoutHeight,
                backgroundColor: bgColor,
                borderRadius: 0,
                border: "1px solid",
                borderColor: "#000",
                // background: bgGradient,
              }}
            >
              <table
                id="grid"
                className="page-editor-grid-canvas"
                style={{
                  width: layoutWidth,
                  height: `calc(${layoutHeight - contentheight}px)`,
                  marginTop: contentmargin,
                }}
              >
                <tbody>
                  {gridRC.map((item, index) => (
                    <tr key={index}>
                      {item.map((item1, index1) => (
                        <td key={index1} className="page-editor-grid-cell"></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <PageLayoutEditor
                show={true}
                data={pageData}
                appconfig={appConfig}
                screenIndex={screenIndex}
              />
            </Paper>
          </div>
          <span className="page-editor-footer"></span>
        </Box>
        {openAlert === true && (
          <AlertWindow
            open={true}
            title={alertTitle}
            message={alertMessage}
            ok="OK"
            okclick={alertOKHandler}
            cancel=""
            cancelclick={alertCloseHandler}
          />
        )}
        {openConfirm === true && (
          <AlertWindow
            open={true}
            title={alertTitle}
            message={alertMessage}
            ok="Yes"
            okclick={confirmOKHandler}
            cancel="No"
            cancelclick={confirmCloseHandler}
          />
        )}
        {/* {isDrawing && (
          <div
            className="selection-rectangle"
            style={{
              left: startX,
              top: startY,
              position: "absolute",
              width: endX - startX,
              height: endY - startY,
              border: "0.2rem solid blue",
            }}
          />
        )} */}
      </div>
    </Draggable>
  );
}

function ContentWindow(props) {
  const pagedata = props.data;
  //const pageconfig = props.pageconfig;
  const appconfig = props.appconfig;
  const scrIndex = props.screenIndex ? props.screenIndex : 0;
  // console.log({ pagedata, scrIndex });

  let source = "";
  const scrObj = props.appdata["availableScreens"][scrIndex];
  let show = false;
  let contentChildren = [];
  let editorwidth = 0;
  let editorheight = 0;
  let editorFrame = { x: 0, y: 0, width: 0, height: 0 };

  const editorParentPage = props.editorParent["page"];
  if (editorParentPage && editorParentPage["pageid"] === pagedata["pageid"]) {
    const editorParentUI = props.editorParent["ui"];
    if (editorParentUI["viewType"]) {
      if (
        editorParentUI["viewType"] === "TileList" ||
        editorParentUI["viewType"] === "Dialog" ||
        editorParentUI["viewType"] === "Drawer" ||
        editorParentUI["viewType"] === "ExpansionPanel" ||
        editorParentUI["viewType"] === "Form" ||
        editorParentUI["viewType"] === "Grid" ||
        editorParentUI["viewType"] === "SwipeableView"
      ) {
        show = true;
        if (editorParentUI["viewType"] === "TileList") {
          let pageChildren = getAllChildrenOnPage(pagedata, scrIndex);
          /* if(pagedata.viewType === "BaseView") {
            pageChildren = pagedata.Children;
          }else if(pagedata.viewType === "ScrollView") {
            pageChildren = pagedata.Children[0].Children;
          } */

          let tilelistUI;
          if (pageChildren.length > 1) {
            pageChildren.forEach((uipart) => {
              if (
                uipart["viewType"] === "TileList" &&
                uipart["uiParts"][scrIndex]["name"] === editorParentUI["name"]
              ) {
                tilelistUI = uipart;
              }
            });
          } else {
            tilelistUI = pageChildren[0];
          }
          if (!tilelistUI) {
            // case of when TileList is children of Dialog UI
            let _pageChildren = getUIData_byContainer(
              props,
              "Dialog",
              scrIndex
            );
            tilelistUI = _pageChildren[0];
            //console.log(props['targetEditor'], _pageChildren, "... ContentWindow TileList >>>> ", tilelistUI);
          }
          contentChildren = tilelistUI["uiParts"][scrIndex].dataarray[0].Fields;

          source = "TileList";
          //console.log(editorParentUI, "... ContentWindow TileList >>>> ", editorParentUI.dataarray);
          editorwidth = Math.floor(
            editorParentUI.frame.width /
              parseInt(editorParentUI.dataarray[0].columns)
          ); //parseInt(editorParentUI.dataarray[0].width);
          editorheight = Math.floor(
            editorParentUI.frame.height /
              parseInt(editorParentUI.dataarray[0].rows)
          ); //parseInt(editorParentUI.dataarray[0].height);
        } else if (editorParentUI["viewType"] === "Dialog") {
          let overlayChildren = pagedata["pageOverlay"]["Children"];
          let dialogUI;
          if (overlayChildren.length > 1) {
            let overlayUI = overlayChildren.filter(function (uipart) {
              if (
                uipart["viewType"] === "Dialog" &&
                uipart["uiParts"][0]["name"] === editorParentUI["name"]
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
          contentChildren = dialogUI["uiParts"][scrIndex].dataarray[0].Fields;
          //console.log(dialogUI, "... ContentWindow Dialog >>>> ", dialogUI['uiParts'][scrIndex]);

          source = "Dialog";

          const _width = scrObj
            ? parseInt(scrObj["width"])
            : parseInt(editorParentUI.dataarray[0].width);
          const isLeftbarVisible = !pagedata._toolBarLeft[scrIndex].hidden;
          const isLeftbarFixed = isLeftbarVisible
            ? pagedata._toolBarLeft[scrIndex].fixed
            : false;
          const leftbarWidth = parseInt(
            pagedata._toolBarLeft[scrIndex].frame["width"]
          );
          let _containerWidth = _width; //parseInt(editorParentUI.frame.width);
          if (isLeftbarVisible && isLeftbarFixed) {
            _containerWidth = _containerWidth - parseInt(leftbarWidth);
          }

          editorwidth =
            _containerWidth -
            parseInt(
              editorParentUI.padding.left + editorParentUI.padding.right
            );
          editorheight = parseInt(editorParentUI.dataarray[0].height); // - (editorParentUI.padding.top + editorParentUI.padding.bottom);
        } else if (editorParentUI["viewType"] === "Drawer") {
          let overlayChildren = pagedata["pageOverlay"]["Children"];
          let drawerUI;
          if (overlayChildren.length > 1) {
            let overlayUI = overlayChildren.filter(function (uipart) {
              if (
                uipart["viewType"] === "Drawer" &&
                uipart["uiParts"][0]["name"] === editorParentUI["name"]
              ) {
                return true;
              }
              return false;
            });
            if (overlayUI.length > 0) {
              drawerUI = overlayUI[0];
            }
          } else {
            drawerUI = overlayChildren[0];
          }
          contentChildren = drawerUI["uiParts"][scrIndex].dataarray[0].Fields;

          source = "Drawer";

          const _width = scrObj
            ? parseInt(scrObj["width"])
            : parseInt(editorParentUI.dataarray[0].width);
          let _containerWidth = _width; //parseInt(editorParentUI.frame.width);
          editorwidth =
            _containerWidth -
            parseInt(
              editorParentUI.padding.left + editorParentUI.padding.right
            );
          editorheight = parseInt(editorParentUI.dataarray[0].height); // - (editorParentUI.padding.top + editorParentUI.padding.bottom);
        } else if (editorParentUI["viewType"] === "ExpansionPanel") {
          source = "ExpansionPanel";
          let panelIndex = props.editorParent["index"]
            ? props.editorParent["index"]
            : 0;
          let pageChildren = getAllChildrenOnPage(pagedata, scrIndex);
          let expansionUI;
          if (pageChildren.length > 1) {
            pageChildren.forEach((uipart) => {
              if (
                uipart["viewType"] === "ExpansionPanel" &&
                uipart["uiParts"][scrIndex]["name"] === editorParentUI["name"]
              ) {
                expansionUI = uipart;
              }
            });
          } else {
            expansionUI = pageChildren[0];
          }
          if (!expansionUI) {
            // case of when Expansion-panel is children of Dialog UI
            let _pageChildren = getUIData_byContainer(
              props,
              "Dialog",
              scrIndex
            );
            expansionUI = _pageChildren[0];
            //console.log(props['targetEditor'], _pageChildren, "... ContentWindow TileList >>>> ", tilelistUI);
          }
          contentChildren =
            expansionUI["uiParts"][scrIndex].panelItems[panelIndex].Fields;

          editorwidth =
            parseInt(editorParentUI.frame.width) -
            parseInt(
              editorParentUI.padding.left +
                editorParentUI.padding.right +
                2 * editorParentUI.borderWeight
            );
          editorheight = parseInt(editorParentUI.panelItems[panelIndex].height); //parseInt(editorParentUI.frame.height) - parseInt(editorParentUI.headerheight + editorParentUI.padding.top + editorParentUI.padding.bottom  + 2*editorParentUI.borderWeight);
        } else if (editorParentUI["viewType"] === "Form") {
          let pageChildren = getAllChildrenOnPage(pagedata, scrIndex);
          // console.log(pageChildren);
          let formitemUI;
          if (pageChildren.length > 1) {
            pageChildren.forEach((uipart) => {
              if (
                (uipart["viewType"] === "Form" ||
                  uipart["viewType"] === "FormView") &&
                uipart["uiParts"][scrIndex]["name"] === editorParentUI["name"]
              ) {
                formitemUI = uipart;
                console.log(formitemUI);
              }
            });
          } else {
            formitemUI = pageChildren[0];
            console.log(formitemUI);
          }
          if (!formitemUI) {
            // case of when FormItem is children of Dialog UI
            let _pageChildren = getUIData_byContainer(
              props,
              "Dialog",
              scrIndex
            );
            formitemUI = _pageChildren[0];
          }

          let index = props.editorParent["index"]
            ? props.editorParent["index"]
            : 0;
          contentChildren =
            formitemUI["uiParts"][scrIndex].formItems[index].Fields;
          source = "Form";
          editorwidth = Math.floor(editorParentUI.frame.width);
          editorheight = Math.floor(
            editorParentUI.frame.height /
              parseInt(editorParentUI.formItems.length)
          );
        } else if (editorParentUI["viewType"] === "SwipeableView") {
          source = "SwipeableView";

          let pageChildren = getAllChildrenOnPage(pagedata, scrIndex);
          let swipeableView;
          if (pageChildren.length > 1) {
            pageChildren.forEach((uipart) => {
              if (
                uipart["viewType"] === "SwipeableView" &&
                uipart["uiParts"][scrIndex]["name"] === editorParentUI["name"]
              ) {
                swipeableView = uipart;
              }
            });
          } else {
            swipeableView = pageChildren[0];
          }

          let viewIndex = props.editorParent["index"]
            ? props.editorParent["index"]
            : 0;
          contentChildren =
            swipeableView["uiParts"][scrIndex].swipeableItems[viewIndex].Fields;

          editorwidth =
            parseInt(editorParentUI.frame.width) -
            parseInt(
              editorParentUI.padding.left +
                editorParentUI.padding.right +
                2 * editorParentUI.borderWeight
            );
          editorheight =
            parseInt(editorParentUI.frame.height) -
            parseInt(
              editorParentUI.padding.top +
                editorParentUI.padding.bottom +
                2 * editorParentUI.borderWeight
            );
        } else if (editorParentUI["viewType"] === "Grid") {
          let pageChildren = getAllChildrenOnPage(pagedata, scrIndex);
          // console.log({ pagedata, scrIndex });
          // console.log(pageChildren);
          let griditemUI;
          if (pageChildren.length > 1) {
            pageChildren.forEach((uipart) => {
              if (
                uipart["viewType"] === "Grid" &&
                uipart["uiParts"][scrIndex]["name"] === editorParentUI["name"]
              ) {
                griditemUI = uipart;
                // console.log(griditemUI);
              }
            });
          } else {
            griditemUI = pageChildren[0];
            // console.log(griditemUI);   // value not added here ...
          }
          if (!griditemUI) {
            // case of when FormItem is children of Dialog UI
            let _pageChildren = getUIData_byContainer(
              props,
              "Dialog",
              scrIndex
            );
            griditemUI = _pageChildren[0];
          }

          let index = props.editorParent["index"]
            ? props.editorParent["index"]
            : 0;
          // console.log(props.editorParent["index"]);
          // console.log(index);

          // console.log(
          //   griditemUI["uiParts"][scrIndex].gridItems[index]["columnList"]
          // );

          contentChildren =
            griditemUI["uiParts"][scrIndex].gridItems[index]["columnList"][0][
              "Fields"
            ];

          console.log(contentChildren);
          source = "Grid";
          editorwidth = Math.floor(
            editorParentUI.frame.width /
              parseInt(editorParentUI.gridItems[0].columns)
          );
          editorheight = parseInt(editorParentUI.gridItems[0].height);
        }
      }
    } else {
      const editorParentSource = props.editorParent["source"];
      if (editorParentSource && editorParentSource === "overlay") {
        //console.log(pagedata, ".... ContentWindow Editor ....", editorParentPage, editorParentSource);
        if (editorParentPage.hasOwnProperty("pageOverlay")) {
          show = true;

          source = "pageOverlay";
          contentChildren = editorParentPage.pageOverlay.Children;
          editorwidth = scrObj
            ? parseInt(scrObj["width"])
            : parseInt(pagedata.frame["width"]);
          editorheight = scrObj
            ? parseInt(scrObj["height"])
            : parseInt(pagedata.frame["height"]);
          editorFrame.width = editorwidth;
          editorFrame.height = editorheight;
        }
      }
    }
  }

  let lwid = 0;
  let lhei = 0;
  const lbox = document.getElementById("layoutbox");
  if (lbox) {
    const lboxstyle = window.getComputedStyle(lbox);
    lwid = lboxstyle.getPropertyValue("width");
    if (lwid) lwid = parseInt(lwid);
    lhei = lboxstyle.getPropertyValue("height");
    if (lhei) lhei = parseInt(lhei);
  }

  let isStyle = false;
  if (lwid !== 0 && lwid < editorwidth) {
    isStyle = true;
  }
  const justify = isStyle ? "" : "center";

  let twid = 0;
  const tbox = document.getElementById("toolbox");
  if (tbox) {
    const tboxstyle = window.getComputedStyle(tbox);
    twid = tboxstyle.getPropertyValue("width");
    if (twid) twid = parseInt(twid);
  }
  let shiftleft = props.shiftlist === "none" ? 24 : 210;
  shiftleft = shiftleft + twid;

  function handleCloseWindow(ev) {
    ev.preventDefault();

    props.onWindowClose();
  }
  function handleContentWindowClick() {
    const _source = props["editorParent"]["source"];
    console.log(
      _source,
      "... ContentWindow CLICK >>>> ",
      props["editorParent"]
    );
    if (_source === "TileList") {
      props.onWindowSelect("TileList");
    } else if (_source === "Dialog") {
      props.onWindowSelect("Dialog");
    } else if (_source === "overlay") {
      props.onWindowSelect("overlay");
    } else if (_source === "Drawer") {
      props.onWindowSelect("Drawer");
    } else if (_source === "ExpansionPanel") {
      props.onWindowSelect("ExpansionPanel");
    } else if (_source === "SwipeableView") {
      props.onWindowSelect("SwipeableView");
    } else if (_source === "Form") {
      props.onWindowSelect("Form");
    } else if (_source === "Grid") {
      props.onWindowSelect("Grid");
    }
  }
  return (
    <div id="contentwindow">
      {show && (
        <div className="page-editor-content-window" style={{ left: shiftleft }}>
          <div className="page-editor-content-header">
            <IconButton
              aria-label="Close"
              className="content-close-icon"
              onClick={handleCloseWindow}
            >
              <Close />
            </IconButton>
          </div>
          <div
            id="contentarea"
            className="page-editor-content-area"
            style={{ justifyItems: justify }}
            onClick={handleContentWindowClick}
          >
            <Box
              id="contenteditor"
              style={{ width: editorwidth, height: editorheight }}
              className="page-editor-content-editor"
            >
              <UIContainer
                show={true}
                style={{ width: "inherit" }}
                appconfig={appconfig}
                pagedata={pagedata}
                data={contentChildren}
                source={source}
                screenIndex={scrIndex}
                containerFrame={editorFrame}
                // handleListUI={handleListOfUI}
              />
            </Box>
          </div>
        </div>
      )}
    </div>
  );
}

function TabContainer(props) {
  /* return (
    <Typography component="div" style={{ padding: 4, width: '100%', height: 700, backgroundColor: 'rgba(244, 244, 244, 1)'}}>
      {props.children}
    </Typography>
  ); */
  return (
    <Typography
      component="div"
      style={{
        width: "100%",
        position: "absolute",
        top: 36,
        bottom: 56,
        backgroundColor: "rgba(244, 244, 244, 1)",
      }}
    >
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

function getUIData_byContainer(_props, _editorContainer, _scrIndex) {
  const _pagedata = _props["data"];
  //const _editorContainer = _props['targetEditor'];
  if (!_scrIndex) _scrIndex = 0;

  if (_editorContainer === "page") {
    let pageChildren = [];
    if (_pagedata.viewType === "BaseView") {
      pageChildren = _pagedata.Children;
    } else if (_pagedata.viewType === "ScrollView") {
      pageChildren = _pagedata.Children[0].Children;
    } else if (_pagedata["viewType"].indexOf("TableViewList") > -1) {
      if (_pagedata.Children[0]["_tmpCellStyle"] === "custom") {
        const tableGroup = _pagedata.Children[0].Group;
        return tableGroup[0].RecordCellDef.Fields;
      }
    }

    return sortUI_byDisplayOrder(pageChildren, _scrIndex);
  } else if (_editorContainer === "topToolbar") {
    if (!_pagedata._toolBarTop[_scrIndex].hidden) {
      return sortUI_byDisplayOrder(
        _pagedata._toolBarTop[_scrIndex].Children,
        _scrIndex
      );
    } else return [];
  } else if (_editorContainer === "bottomToolbar") {
    if (!_pagedata._toolBarBottom[_scrIndex].hidden) {
      return sortUI_byDisplayOrder(
        _pagedata._toolBarBottom[_scrIndex].Children,
        _scrIndex
      );
    } else return [];
  } else if (_editorContainer === "leftToolbar") {
    if (!_pagedata._toolBarLeft[_scrIndex].hidden) {
      return sortUI_byDisplayOrder(
        _pagedata._toolBarLeft[_scrIndex].Children,
        _scrIndex
      );
    } else return [];
  } else if (_editorContainer === "rightToolbar") {
    if (!_pagedata._toolBarRight[_scrIndex].hidden) {
      return sortUI_byDisplayOrder(
        _pagedata._toolBarRight[_scrIndex].Children,
        _scrIndex
      );
    } else return [];
  } else if (_editorContainer === "TileList") {
    const _uidata = _props.editorParent ? _props.editorParent["ui"] : "";
    const _uichildren = getUIData_byContainer(_props, "page", _scrIndex);
    //console.log(_uidata, _pagedata, "*** getUIData_TileList **", _uichildren);
    for (let index = 0; index < _uichildren.length; index++) {
      const uidef = _uichildren[index];
      let uidefparts = uidef["uiParts"];
      if (uidefparts && uidefparts[_scrIndex]["name"] === _uidata["name"]) {
        return sortUI_byDisplayOrder(
          uidefparts[_scrIndex].dataarray[0].Fields,
          _scrIndex
        );
      }
    }
    return [];
  } else if (_editorContainer === "Dialog") {
    if (_pagedata.pageOverlay.Children.length > 0) {
      const dialogUI = _pagedata.pageOverlay.Children[0].uiParts[_scrIndex];
      return sortUI_byDisplayOrder(dialogUI.dataarray[0].Fields, _scrIndex);
    } else return [];
  } else {
    //return sortUI_byDisplayOrder(_props['allChildren'], _scrIndex);
    const pageallChildren = getAllChildrenOnPage(_props.data, _scrIndex);
    return sortUI_byDisplayOrder(pageallChildren, _scrIndex);
  }
}

function sortUI_byDisplayOrder(uichildren, scrIndex) {
  if (!scrIndex) scrIndex = 0;
  //console.log(".... sortUI_byDisplayOrder uichildren >>>>", uichildren);
  if (!uichildren) return [];

  uichildren.sort(function (a, b) {
    return (
      a.uiParts[scrIndex].displayOrderOnScreen -
      b.uiParts[scrIndex].displayOrderOnScreen
    );
  });
  return uichildren;
}

function copyPageOverlay(pageOverlayDef, _scrIndex, _props) {
  let overlayData = pageOverlayDef["Children"];

  if (overlayData.length > 0) {
    let selectedPageIds = [];
    if (_props.hasOwnProperty("selectAll")) {
      if (!_props["selectAll"] && _props["selectedPages"].length > 0) {
        selectedPageIds = _props["selectedPages"];
      }
    }

    const arrPages = _props["pageList"];
    for (let i = 0; i < arrPages.length; i++) {
      if (arrPages[i] === _props["currentPage"]) {
        continue;
      }
      if (selectedPageIds.length > 0) {
        const isPageIdSelected =
          selectedPageIds.indexOf(arrPages[i]["pageid"]) > -1 ? true : false;
        //console.log(selectedPageIds, "-->>>>>>", arrPages[i]['pageid'], isPageIdSelected);
        if (!isPageIdSelected) {
          continue;
        }
      }

      if (!arrPages[i].hasOwnProperty("pageOverlay")) {
        arrPages[i]["pageOverlay"] = pageOverlayDef;
      } else {
        let otherPageOverlay = arrPages[i]["pageOverlay"];
        otherPageOverlay["Children"] = overlayData;
      }
    }

    const _msgDone =
      "Page Overlay children successfully copied. \n\n Please preview the app before exiting the Page Editor, else the related changes will be lost.";
    return _msgDone;
  }
  return "";
}

function copyPageEvents(pageEventsDef, _scrIndex, _props) {
  let pageEventsData = pageEventsDef;
  if (pageEventsData) {
    let selectedPageIds = [];
    if (_props.hasOwnProperty("selectAll")) {
      if (!_props["selectAll"] && _props["selectedPages"].length > 0) {
        selectedPageIds = _props["selectedPages"];
      }
    }

    const arrPages = _props["pageList"];
    for (let i = 0; i < arrPages.length; i++) {
      if (arrPages[i] === _props["currentPage"]) {
        continue;
      }
      if (selectedPageIds.length > 0) {
        const isPageIdSelected =
          selectedPageIds.indexOf(arrPages[i]["pageid"]) > -1 ? true : false;
        if (!isPageIdSelected) {
          continue;
        }
      }

      if (pageEventsDef.hasOwnProperty("beforeViewPage")) {
        arrPages[i]["actions"]["beforeViewPage"] =
          pageEventsDef["beforeViewPage"];
      }
      if (pageEventsDef.hasOwnProperty("afterViewPage")) {
        arrPages[i]["actions"]["afterViewPage"] =
          pageEventsDef["afterViewPage"];
      }
    }

    const _msgDone =
      "Page Actions successfully copied. \n\n Please preview the app before exiting the Page Editor, else the related changes will be lost.";
    return _msgDone;
  }
  return "";
}

function copypagebarResponse(
  pageBarDefs,
  _scrIndex,
  _props,
  isSlaveScreen,
  masterScreenId
) {
  if (pageBarDefs["viewType"] === "pageevents") {
    const _pageEventsDef = JSON.parse(JSON.stringify(pageBarDefs["events"]));
    let msgCopyEvents = copyPageEvents(_pageEventsDef, _scrIndex, _props);
    return msgCopyEvents;
  }

  const _pageBarDefs = JSON.parse(JSON.stringify(pageBarDefs));

  if (_pageBarDefs["viewType"] === "overlay") {
    let msgCopyOverlay = copyPageOverlay(_pageBarDefs, _scrIndex, _props);
    return msgCopyOverlay;
  }

  const _barPosition = _pageBarDefs.barPosition.toUpperCase();
  var pageBarData = [];
  if (_barPosition === "TOP" || _barPosition === "BOTTOM") {
    if (_pageBarDefs.hasOwnProperty("Children")) {
      pageBarData = _pageBarDefs["Children"];
    }
  } else {
    if (_pageBarDefs.hasOwnProperty("view")) {
      if (_pageBarDefs["view"] === "TableView") {
        if (_pageBarDefs.hasOwnProperty("tableData")) {
          pageBarData = _pageBarDefs["tableData"];
        }
      } else {
        if (_pageBarDefs.hasOwnProperty("Children")) {
          pageBarData = _pageBarDefs["Children"];
        }
      }
    }
  }

  //console.log(_scrIndex, pageBarDefs, "-->>>>>>", pageBarData);
  if (pageBarData.length > 0) {
    let selectedPageIds = [];
    if (_props.hasOwnProperty("selectAll")) {
      if (!_props["selectAll"] && _props["selectedPages"].length > 0) {
        selectedPageIds = _props["selectedPages"];
      }
    }
    const arrPages = _props["pageList"];

    for (let i = 0; i < arrPages.length; i++) {
      if (arrPages[i] === _props["currentPage"]) {
        continue;
      }
      if (selectedPageIds.length > 0) {
        const isPageIdSelected =
          selectedPageIds.indexOf(arrPages[i]["pageid"]) > -1 ? true : false;
        //console.log(selectedPageIds, "-->>>>>>", arrPages[i]['pageid'], isPageIdSelected);
        if (!isPageIdSelected) {
          continue;
        }
      }
      if (_barPosition === "TOP" || _barPosition === "BOTTOM") {
        var toolBar;
        if (_barPosition === "TOP") toolBar = arrPages[i]["_toolBarTop"];
        else toolBar = arrPages[i]["_toolBarBottom"];

        if (toolBar) {
          /* if(toolBar.length > _scrIndex) {
             var _pageToolbar = toolBar[_scrIndex];
             _pageToolbar['view'] = _pageBarDefs.view;
             _pageToolbar['frame'] = _pageBarDefs.frame;
             _pageToolbar['backgroundColor'] = _pageBarDefs.backgroundColor;
             _pageToolbar['Children'] = _pageBarDefs['Children'];
          } */
          if (toolBar.length > 0) {
            for (let tb = 0; tb < toolBar.length; tb++) {
              var _pageToolbar = toolBar[tb];
              _pageToolbar["view"] = _pageBarDefs.view;
              //_pageToolbar['frame'] = _pageBarDefs.frame;
              _pageToolbar["backgroundColor"] = _pageBarDefs.backgroundColor;
              _pageToolbar["Children"] = JSON.parse(
                JSON.stringify(_pageBarDefs["Children"])
              ); //_pageBarDefs['Children'];
              if (isSlaveScreen && tb === masterScreenId) {
                masterScreenPageBarChildren(
                  _pageToolbar["Children"],
                  masterScreenId,
                  _barPosition
                );
              }
            }
          } else toolBar.push(_pageBarDefs);
        }
      } else {
        var sideBar;
        if (_barPosition === "LEFT") sideBar = arrPages[i]["_toolBarLeft"];
        else sideBar = arrPages[i]["_toolBarRight"];
        if (sideBar) {
          /* if(sideBar.length > _scrIndex) {
            var _pageSidebar = sideBar[_scrIndex];
            _pageSidebar['view'] = _pageBarDefs['view'];
            _pageSidebar['fixed'] = _pageBarDefs['fixed'];
            _pageSidebar['frame'] = _pageBarDefs.frame;	//new PointDic(_pageBarDefs['frame']);
            _pageSidebar['backgroundColor'] = _pageBarDefs.backgroundColor;	//new ColorDic(_pageBarDefs['backgroundColor']);
            if(_pageBarDefs['view'] === "TableView")
            {
              _pageSidebar['Children'] = [];
              _pageSidebar['tableData'] = _pageBarDefs['tableData'];
            }
            else
            {
              _pageSidebar['Children'] = _pageBarDefs['Children'];
              _pageSidebar['tableData'] = [];
            }
          } */
          if (sideBar.length > 0) {
            for (let sb = 0; sb < sideBar.length; sb++) {
              var _pageSidebar = sideBar[sb];
              _pageSidebar["view"] = _pageBarDefs["view"];
              if (sb === _scrIndex) {
                _pageSidebar["fixed"] = _pageBarDefs["fixed"];
                _pageSidebar["frame"] = _pageBarDefs.frame;
              }
              _pageSidebar["backgroundColor"] = _pageBarDefs.backgroundColor;
              if (_pageBarDefs["view"] === "TableView") {
                _pageSidebar["Children"] = [];
                _pageSidebar["tableData"] = _pageBarDefs["tableData"];
              } else {
                _pageSidebar["tableData"] = [];
                _pageSidebar["Children"] = JSON.parse(
                  JSON.stringify(_pageBarDefs["Children"])
                );
                // no need to override master screen UI with slvae screen. Date : 20-04-2023
                /*if(isSlaveScreen && sb === masterScreenId){
                  masterScreenPageBarChildren(_pageSidebar['Children'], masterScreenId, _barPosition);
                }*/
              }
            }
          } else sideBar.push(_pageBarDefs);
        }
      }
    }

    const _msgDone =
      "PageBar definitions successfully copied. \n\n Please preview the app before exiting the Page Editor, else the changes related 'Copy Page bars' will be lost."; // Do you want to do it now?";
    return _msgDone;
  }
  return "";
}
function masterScreenPageBarChildren(
  pageBarChildren,
  masterScreenId,
  barPosition
) {
  //console.log(masterScreenId, barPosition+"-ToolBar >>", pageBarChildren);
  for (let index = 0; index < pageBarChildren.length; index++) {
    const _uiparts = pageBarChildren[index]["uiParts"];
    if (_uiparts && _uiparts[masterScreenId]) {
      const uiDef = _uiparts[masterScreenId];
      uiDef["_enabledOnScreen"] = false;
    }
  }
}

function getAllChildrenOnPage(_page, scrIndex) {
  // console.log(_page, "... getAllChildrenOnPage >>>>", scrIndex);
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
      if (cntTop === scrIndex) {
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
            /*else if(leftToolbarUI['viewType'] === "ExpansionPanel") {
            let arrlPanelItems = leftToolbarUI["uiParts"][scrIndex].panelItems; //[0]
            for (let l1 = 0; l1 < arrlPanelItems.length; l1++) {
              let panelItemsField = arrlPanelItems[l1]["Fields"];
              for (let l10 = 0; l10 < panelItemsField.length; l10++) {
                arrChildren.push(panelItemsField[l10]);
              }
            }
          }*/
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
            /*else if(rightToolbarUI['viewType'] === "ExpansionPanel") {
            let arrrPanelItems = rightToolbarUI["uiParts"][scrIndex].panelItems; //[0]
            for (let r1 = 0; r1 < arrrPanelItems.length; r1++) {
              let panerItemsField = arrrPanelItems[r1]["Fields"];
              for (let r10 = 0; r10 < panerItemsField.length; r10++) {
                arrChildren.push(panerItemsField[r10]);
              }
            }
            }*/
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

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return (
    "rgba(" + _red + "," + _green + "," + _blue + "," + colorObj.alpha + ")"
  );
}

function mapStateToProps(state) {
  return {
    apiParam: state.appParam.params,
    pallete: state.appParam.pallete,
    rightBoundPos: state.appParam.rightBoundPos,
    isShrinkable: state.appParam.isShrinkable,
    appData: state.appData.data,
    pageList: state.appData.pagelist,
    contributorTabs: state.appData.contributortabs,
    pageLocale: state.appParam.pagelocale,
    pageContainer: state.appParam.pagecontainer,
    pageConfig: state.appParam.pageconfig,
    currentPage: state.selectedData.pagedata,
    pageChildren: state.selectedData.paeChildren,
    currentUI: state.selectedData.uidata,
    selectedUIs: state.selectedData.uiparts,
    targetEditor: state.selectedData.editor,
    layoutContainer: state.selectedData.container,
    contentEditorParent: state.selectedData.editorParent,
    defaultScreenId: state.appParam.screenId,
  };
}
export default connect(mapStateToProps)(PageEditor);
