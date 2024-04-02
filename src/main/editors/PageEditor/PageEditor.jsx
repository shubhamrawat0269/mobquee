import React from "react";
import { connect } from "react-redux";
import "./PageEditorStyle.css";
import classNames from "classnames/bind";
import ReactXMLParser from "react-xml-parser";

import {
  Box,
  Paper,
  IconButton,
  Snackbar,
  Slide,
  CircularProgress,
  Typography,
} from "@mui/material";

import toprulerImage from "../../../assets/hScale.png";
import leftrulerImage from "../../../assets/vScale.png";

import AlertWindow from "../../../components/AlertWindow";
import UIContainer from "../UIContainer/UIContainer";
import { getTabModuleAccess } from "../../helpers/Utility";

import {
  setEditorParent,
  setSelectedLayout,
  setEditorState,
  setSelectedPageData,
  setSelectedUI,
  setAllPageChanged,
  setChangedPageIds,
  changeScreenIndex,
} from "../../ServiceActions";
import Draggable from "react-draggable";
import { Close } from "@mui/icons-material";
import PageLayoutEditor from "../PageLayoutEditor/pageLayoutEditor";
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
      currentScreenIndex: 0,
    };

    this.handleSelectEditor = this.handleSelectEditor.bind(this);
    this.handleCloseEditor = this.handleCloseEditor.bind(this);
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

  handleSelectEditor(_pageid) {
    let _openedPages = this.state.pagelist;
    let _selectedPage = _openedPages.filter(function (node, index) {
      if (node.pageid === _pageid) {
        return node;
      }
      return node.pageid === _pageid;
    });
    if (_selectedPage.length > 0) {
      this.setState({ selectedPage: _selectedPage[0] });

      this.props.onClickEditor(_selectedPage[0]);
    }
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

    const page = this.props.selectedPage;
    const waitPageid = this.props.showWait["pageid"];
    const showwait =
      waitPageid === page.pageid ? this.props.showWait["showwait"] : false;

    const defaultScrId = this.props.defaultScreenId
      ? parseInt(this.props.defaultScreenId)
      : 0;

    return (
      <section
        id={
          this.props.isShrinkable
            ? "app-page-editor-wide-section"
            : "app-page-editor-section"
        }
        className="draggable-bound"
      >
        <div id="pageeditor">
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

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
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
            height: `630px`,
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
                height: "580px",
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
                  height: `540px`,
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
