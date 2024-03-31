import React, { useEffect, useState } from "react";
import "./AppEditorStyle.css";
import { connect, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import {
  Abc,
  Close,
  ReadMore,
  MenuOpen,
  PermMedia,
  SmartButton,
  LayersRounded,
  DomainVerificationRounded,
  CheckBoxOutlineBlank,
} from "@mui/icons-material";
import {
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Snackbar,
  CircularProgress,
  ListItem,
  ListItemText,
  Collapse,
  Grid,
  DialogContent,
  SvgIcon,
  Typography,
  Dialog,
  DialogActions,
  DialogTitle,
  Paper,
  Tabs,
  Tab,
  List,
  TextField,
} from "@mui/material";

import { makeStyles, withStyles } from "@mui/styles";

import PageListView from "../../helpers/PageListView/PageListView";
import AlertWindow from "../../../components/AlertWindow";
import SettingWindow from "../SettingWindow/SettingWindow";
import {
  setPageList,
  setSelectedPages,
  setSelectedPageData,
  setSelectedUI,
  setEditorState,
  setAllPageChanged,
  setAppCredentials,
  removeScreenData,
  setShrinkPallete,
  setUIPartDic,
} from "../../ServiceActions";
import LoginWindow from "../../../components/LoginWindow/LoginWindow";
import { getTabModuleAccess } from "../../helpers/Utility";
//import AppTemplateEditor from './appTemplateEditor';
import PageEditor from "../PageEditor/PageEditor";
import { PALLETE_SIDE } from "../../../utils/namespaces/PALLETE_SIDE";
import PopupPageList from "../PopupPageList/popupPageList";
// import { THEME_TYPE } from "../../../utils/THEME_TYPE";

function TabContainer(props) {
  return (
    <Typography component="div" className="tab-container">
      {props.children}
    </Typography>
  );
}
TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

class AppEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,

      uilist: [],

      pages: [],
      pageCaches: [],
      pagetree: [],
      selectedPage: {},

      openpage: false,
      openproject: this.props.isProjectDetail,
      openedPages: [],
      saveWaitList: -1,
      pagelistError: "",
      pagedataError: false,

      showTemplateWindow: false,
    };
  }

  componentDidMount() {
    this.fetchUIList();
    this.fetchUIPartsDic();
    this.fetchPageData();
  }

  componentDidUpdate(prevProps, prevState) {
    //console.log(".............AppEditor componentDidUpdate ............");
    if (prevProps.isProjectDetail !== this.props.isProjectDetail) {
      //console.log("....... Project Details Opened .......", this.props.isProjectDetail);
      this.setState({ openproject: this.props.isProjectDetail });
      if (this.props.isProjectDetail) {
        this.updatepageList();
      }
    }
    if (prevProps.saveWaitList !== this.props.saveWaitList) {
      console.log(" <<<<<<<<<< saveWaitList AppEditor >>>>>>>>>>>> ");
      //this.setState({ saveWaitList: this.props.saveWaitList });
    }
  }

  updatepageList() {
    //console.log(this.state['openedPages'], " .updatepageList ....", this.props['pageList']);
  }

  fetchUIList() {
    fetch("././config/UIConfig.json")
      .then((res) => res.json())
      .then(
        (result) => {
          let uiParts = result["UIParts"];
          uiParts = uiParts.filter(function (category) {
            let uiItems = category["items"];
            uiItems = uiItems.filter(function (item) {
              return item.visible === "true";
            });
            category["items"] = uiItems;
            return category.include === "true";
          });
          this.setState({ uilist: uiParts });
        },
        (error) => {
          console.log("UI-list fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  fetchUIPartsDic() {
    fetch("././config/UIPartDic.json")
      .then((res) => res.json())
      .then(
        (result) => {
          let uiParts = result["UIParts"];
          this.props.dispatch(setUIPartDic(uiParts));
        },
        (error) => {
          console.log("UI-parts fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  fetchPageData() {
    let _fetchUrl =
      this.props.appconfig.apiURL +
      "service.json?command=pagelist&userid=" +
      this.props.appconfig.userid +
      "&sessionid=" +
      this.props.appconfig.sessionid +
      "&projectid=" +
      this.props.appconfig.projectid;
    fetch(_fetchUrl)
      .then((res) => res.json())
      .then(
        (result) => {
          // { pages: [...], response: "ACK", count: 1, command: "pagelist"  }
          if (result.response === "NACK") {
            var _err = { message: result.error };
            this.setState({
              isLoaded: true,
              error: _err,
            });
          } else {
            let _pages = result.pages;

            /*if(_pages.length === 0){
              this.setState({ isLoaded: true });              
              this.setState({ showTemplateWindow: true }); 
              return;
            }*/

            //_pages.sort(function(a, b){return a.pageid - b.pageid});
            // console.log(_pages.length, "data :--", this.props.data);

            //manageMultiScreenDefs(this.props.data, _pages);
            this.props.dispatch(setAllPageChanged(false));
            let cacheList = makePageCacheList(_pages, this.props.data); //{cachelist: _pageCacheList, idlist: pageIdList, error:pageError}
            const _pageError = cacheList["error"];
            if (_pageError) {
              const _pagelistError =
                "Something went wrong. Page-list data is not correct.";
              this.setState({ pagelistError: _pagelistError });
              return;
            }
            const _pageIdList = cacheList["idlist"];
            const _duplicatePageTitle = validatePageIds(_pageIdList, _pages);
            if (_duplicatePageTitle && _duplicatePageTitle.length > 0) {
              const _pagelistError =
                'Pages: "' +
                _duplicatePageTitle +
                '" have same id, which may cause un-expected results.';
              this.setState({ pagelistError: _pagelistError });
            }

            const isValidScreendata = validateScreenData(
              this.props.data,
              _pages
            );
            if (!isValidScreendata) {
              const _pagelistError =
                "Pages don't have correct data. Click OK to continue, then do 'preview'.";
              this.setState({ pagelistError: _pagelistError });
              this.setState({ pagedataError: true });

              var returnVal = manageMultiScreenDefs(this.props.data, _pages);
              if (returnVal && returnVal === "remove") {
                // in reference of bug #20289
                this.props.dispatch(setPageList(_pages));
                this.props.dispatch(removeScreenData(1));
              }
              this.props.dispatch(setAllPageChanged(true));
            }

            const _pageCacheList = cacheList["cacheList"];
            this.props.dispatch(setPageList(_pages));

            var arrPageData = [];
            let projectNode = {
              level: 0,
              title: this.props.data.ProjectName,
              id: "-1",
              parent: "App",
              type: "",
              children: [],
            };
            arrPageData.push(projectNode);

            manipulatePageData(_pages, 1, arrPageData);

            //console.log("arrPageData >>>", arrPageData);
            var pageHeirarchy = setPageHeirarchy(arrPageData);
            pageHeirarchy = pageHeirarchy.filter(function (page) {
              return page.parent === "App";
            });

            //console.log(this.props.contributorTabs, "...pageHeirarchy >>>>>>>>>>>>>>>>>>>>>>>>>>>>>. ", pageHeirarchy);
            //this.manageOwnerTabs(this.props.data, pageHeirarchy);

            this.setState({
              isLoaded: true,
              pages: _pages,
              pageCaches: _pageCacheList,
              pagetree: pageHeirarchy,
            });
          }
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.error("Page list Fetch Error:", error);
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
  }

  handleSelectPage(_page) {
    //this.setState({selectedpage: _page});
    //console.log(this.props.currentPage, " %%%%%%% handleSelectPage ............", _page);
    this.props.dispatch(setSelectedPageData(_page));
    this.props.dispatch(setSelectedUI({}));

    this.resetPageList(_page);
  }

  handleOpenedPages(pages, param) {
    this.props.dispatch(setSelectedPages(pages));
    this.setState({ openedPages: pages });

    //console.log(param, " %%%%%%% handleOpenedPages ............", pages);
    if (pages.length > 0 && param !== "close") {
      const lastOpenedPage = pages[pages.length - 1];
      this.resetPageList(lastOpenedPage);
    }
  }
  resetPageList(pagedata) {
    // console.log("PAGE DATA: ", pagedata["pageid"]);
    // console.log("PAGE LIST: ", this.props["pageList"]);
    let _pageIndex = -1;
    let _pagelist = this.props["pageList"];
    if (pagedata) {
      for (let index = 0; index < _pagelist.length; index++) {
        const pagedic = _pagelist[index];
        if (pagedic["pageid"] === pagedata["pageid"]) {
          _pageIndex = index;
          break;
        }
      }
      // console.log("PAGE INDEX: ", _pageIndex);
      if (_pageIndex !== -1) {
        _pagelist.splice(_pageIndex, 1, pagedata);
      }
      // console.log(_pageIndex, pagedata, "+++akshay+++", _pagelist);
      this.props.dispatch(setPageList(_pagelist));
    }
  }

  handlePageChange(pagedata) {
    // console.log(this.props["pageList"], "+++ handlePageChange +++", pagedata);
    this.resetPageList(pagedata);
  }

  handlePageStates(_pagestates) {
    this.props.dispatch(setEditorState({ _pagestates }));
  }

  handleAppCredentials(credentials) {
    //console.log("credentials object >>", credentials);
    this.props.dispatch(setAppCredentials(credentials));
  }

  handleSaveWaitList(pagelist) {
    this.setState({ saveWaitList: pagelist });
    console.log("handleSaveWaitList >>>>>", pagelist, this.state.saveWaitList);
  }

  pageErrorAlertHandler() {
    //this.setState({pagelistError: ""});
    this.setState({ isLoaded: true });
  }

  pageDataErrorAlertHandler() {
    this.setState({ pagelistError: "" });
    this.setState({ isLoaded: true });
    this.setState({ pagedataError: false });
  }

  handleSaveAllPages(pagelistdata) {
    var formData = new FormData();
    formData.append("command", "updateallpages");
    formData.append("userid", this.props.appconfig.userid);
    formData.append("sessionid", this.props.appconfig.sessionid);
    formData.append("projectid", this.props.appconfig.projectid);

    let arrPages = pagelistdata;
    let objPages = { pages: arrPages };
    //var pagesdata = encodeURIComponent(JSON.stringify(objPages));
    //let text = new File([pagesdata], "updateallpages.txt", {type: "text/plain"});
    let text = new File([JSON.stringify(objPages)], "updateallpages.txt", {
      type: "text/plain",
    });
    formData.append("file", text);

    fetch(this.props.appconfig.apiURL + "multipartservice.json", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("** updateallpages **", result);
        //result = {"response":"ACK","count":1,"command":"projectupdate","project":{....}}
        if (result.response === "NACK") {
          var _err = { message: result.error };
          console.log("updateallpages : Error >>", _err);

          this.props.dispatch(setAllPageChanged(true));
          const _pagelistError = "To save changes, please do Preview.";
          this.setState({ pagelistError: _pagelistError });
          this.setState({ pagedataError: true });
        } else {
          const _pagelistSuccess = "Update in all pages successfull.";
          this.setState({ pagelistError: _pagelistSuccess });
          this.setState({ pagedataError: true });
        }
      })
      .catch((error) => {
        console.error("updateallpages : catch >>", error);

        this.props.dispatch(setAllPageChanged(true));
        const _pagelistError = "To save changes, please do Preview.";
        this.setState({ pagelistError: _pagelistError });
        this.setState({ pagedataError: true });
      });
  }

  handleTemplateSelection(type) {
    console.log("template >>", type);
    this.setState({ showTemplateWindow: false });
  }

  render() {
    // console.log(this.state, "AppEditor mapStateToProps >>>>>", this.props);
    const appConfig = {
      apiURL: this.props.appconfig.apiURL,
      userid: this.props.appconfig.userid,
      sessionid: this.props.appconfig.sessionid,
      projectid: this.props.appconfig.projectid,
    };
    const parameters = {
      uilist: this.state.uilist,
      pagedata: this.state.pages,
      list: this.state.pagetree,
      ctabs: this.props.contributorTabs,
    };

    const validationError = filterValidationError_byPage(
      this.props.currentPage,
      this.props.validationErrors
    );

    return (
      <section id="appeditor">
        {!this.state.isLoaded && (
          <div className="backdropStyle">
            <CircularProgress style={{ marginRight: 8 }} /> <h4>Loading...</h4>
          </div>
        )}
        {this.state.isLoaded &&
          this.state.pagelistError.length === 0 &&
          !this.state.showTemplateWindow && (
            <AppContainer
              appconfig={appConfig}
              pallete={this.props.pallete}
              projectdata={this.props.data}
              pagedata={parameters}
              pagelistArr={this.props.pageList}
              isShrinkable={this.props.isShrinkable}
              isProjectDrawer={this.state.openproject}
              selectedpage={this.props.currentPage}
              selectedui={this.props.currentUI}
              validation={validationError}
              onSelectPage={this.handleSelectPage.bind(this)}
              onOpenedPages={this.handleOpenedPages.bind(this)}
              onPageChange={this.handlePageChange.bind(this)}
              setPageStates={this.handlePageStates.bind(this)}
              onRelogin={this.handleAppCredentials.bind(this)}
              savewait={this.state.saveWaitList}
              onUpdateSaveWaitList={this.handleSaveWaitList.bind(this)}
              onSaveAllPages={this.handleSaveAllPages.bind(this)}
            />
          )}
        {this.state.pagelistError.length > 0 && (
          <AlertWindow
            open={true}
            title=""
            message={this.state.pagelistError}
            ok="OK"
            okclick={this.pageErrorAlertHandler.bind(this)}
            cancel=""
            cancelclick={this.pageErrorAlertHandler.bind(this)}
          />
        )}
        {this.state.pagelistError.length > 0 && this.state.pagedataError && (
          <AlertWindow
            open={true}
            title=""
            message={this.state.pagelistError}
            ok="OK"
            okclick={this.pageDataErrorAlertHandler.bind(this)}
            cancel=""
            cancelclick={this.pageDataErrorAlertHandler.bind(this)}
          />
        )}
      </section>
    );
  }
}

function filterValidationError_byPage(pagedata, validationArr) {
  let errorArr = validationArr.filter(function (vobj) {
    return vobj["pageid"] === pagedata["pageid"];
  });

  return errorArr;
}

function AppContainer(props) {
  const appConfig = props.appconfig;
  const dispatch = useDispatch();
  //const parameters = props.pagedata;
  //const [parameters, setPageParameters] = React.useState(props.pagedata);
  const [pagelistHeirarchy, setPageListHeirarchy] = React.useState(
    props.pagedata.list
  );
  const [pagelistPageData, setPageListPageData] = React.useState(
    props.pagedata.pagedata
  );
  const parameters = {
    uilist: props.pagedata.uilist,
    pagedata: pagelistPageData,
    list: pagelistHeirarchy,
  };

  const listwidth = 220;
  const [openPageList, setOpenPageList] = React.useState(true);
  const [openedPages, setOpenedPages] = React.useState([]);
  const [selectedPage, setSelectedPage] = React.useState(props.selectedpage);
  // console.log(selectedPage);
  const [pageStateData, setPageStateData] = React.useState([]);
  const [showPage, setShowPage] = React.useState(false);
  const [pageindex, setPageIndex] = React.useState(0);
  const [uilistDisplay, setUIlistDisplay] = React.useState("block");

  const [openAlert, setOpenAlert] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");
  const [openConfirm, setOpenConfirm] = React.useState(false);

  const [screenIndex, setScreenIndex] = React.useState(0);

  const validationError = props.validation;
  const [pageValidationError, setPageValidationError] = React.useState([]);
  const [showValidationAlert, setValidationAlert] = React.useState(false);
  const [showValidationDismiss, setValidationDismiss] = React.useState(false);
  const [showDismiss, setDismissAllow] = React.useState(true);

  const [isSessionError, setSessionError] = React.useState(false);
  const [showWait, setWaiting] = React.useState({
    pageid: -1,
    showwait: false,
  });

  function handleListOpen() {
    setOpenPageList(true);
  }

  function handleListClose() {
    setOpenPageList(false);
  }

  function handleUIlistDisplay() {
    let listState = uilistDisplay === "block" ? "none" : "block";
    setUIlistDisplay(listState);
  }

  ////////////////// Page-Explorer list functionalities //////////////////

  function handlePageSelect(_selectedpage, isMulti) {
    // console.log("Selected Page is : ", _selectedpage); //Page count or id is recieved ...
    if (_selectedpage["id"] !== "-1") {
      let _pagelist = parameters.pagedata;
      // console.log("ALL PAGES LIST: ", _pagelist);
      let _page = _pagelist.filter(function (node) {
        if (node.pageid === _selectedpage.id) {
          // console.log("Node is ", node);
          //setOpenedPageList(node);
          return node;
        }
        return node.pageid === _selectedpage.id;
      });

      //manageMultiScreenDefs(props.projectdata, _page);
      if (_page && _page.length > 0) {
        _page = managePageDefinition(_page, props.projectdata, screenIndex);
        // console.log("_page >>", _page, JSON.parse(JSON.stringify(_page[0])));
        setOpenedPageList(_page[0], isMulti); // isMulti ==> undefined
      } else {
        setOpenPageList(false);
        setShowPage(true);
      }
    }
  }

  function setOpenedPageList(_page, isMulti) {
    updateOpenpages(selectedPage); // after pagelist drawer open again, selectedPage hold previous val
    props.onPageChange(selectedPage);

    if (selectedPage.hasOwnProperty("viewType")) {
      if (selectedPage.pageid === _page.pageid) {
        _page = selectedPage;
      }
    }

    if (!checkPageOpenedAlready(_page.pageid)) {
      setScreenIndex(0);
      // openedPages.push(_page);
      // setOpenedPages(openedPages);
      // props.onOpenedPages(openedPages, "open");

      let openedPagesArr = openedPages;
      openedPagesArr.push(_page);
      setOpenedPages(openedPagesArr);
      props.onOpenedPages(openedPagesArr, "open");

      setSelectedPage(_page);
      props.onSelectPage(_page);

      let __page = JSON.parse(JSON.stringify(_page));
      let pageObj = {};
      pageObj[_page.pageid] = {
        init: [__page],
        undo: [],
        redo: [],
        params: {},
      };

      let pageStates = pageStateData;
      checkPageStateExist(pageStates, _page.pageid);
      pageStates.push(pageObj);
      setPageStateData(pageStates);
      props.setPageStates(pageStates);
    } else {
      setAlertTitle("");
      setAlertMessage("Page '" + _page.Title + "' already opened.");
      setOpenAlert(true);
    }

    if (!isMulti) {
      setOpenPageList(false);
    }
    setShowPage(true);
    setPageIndex(openedPages.length - 1);
  }

  function checkPageOpenedAlready(_pageid) {
    let _page = openedPages.filter(function (page) {
      return page.pageid === _pageid;
    });

    if (_page.length > 0) {
      return true;
    }
    return false;
  }
  function checkPageStateExist(_pageState, _pageid) {
    for (let i = 0; i < _pageState.length; i++) {
      const pageObj = _pageState[i];
      for (const key in pageObj) {
        if (key === _pageid) {
          _pageState.splice(i, 1);
        }
      }
    }
  }

  function handlePagelistUpdate(pagelistdata) {
    //console.log("handlePagelistUpdate >>>-----", pagelistdata);
    setPageListPageData(pagelistdata.pagedata);
    setPageListHeirarchy(pagelistdata.list);
  }

  function handleSaveAllPages(pagelistdata) {
    console.log("handleSaveAllPages >>>-----", pagelistdata);
    props.onSaveAllPages(pagelistdata);
  }

  ////////////////// Page-Editor functionalities //////////////////

  function getPageforSave(pageid) {
    let _pageforSave;
    if (selectedPage["pageid"] === pageid) {
      _pageforSave = selectedPage;
    } else {
      let _closedpage = openedPages.filter(function (node) {
        if (node.pageid === pageid) {
          return node;
        }
        return node.pageid === pageid;
      });
      //console.log(pagetabid, pageid, "onSave Page >>>>>>>>>>>>>>>>>", _closedpage, pageStateData);
      _pageforSave = _closedpage[0];
    }

    return _pageforSave;
  }

  function onClosePageEditor(_pageid, _param) {
    //console.log(_param, _pageid, "onClosePageEditor >>>>>>>>>>>>>>>>>", openedPages.length, pageStateData);
    if (openedPages.length === 0) {
      setShowPage(false);
      props.onSelectPage({});
    }

    if (_param.indexOf("save") === 0) {
      //setWaiting({pageid:_pageid, showwait:true});
      /* let waitpageObj = showWait;
      if(waitpageObj === -1){
        waitpageObj = _pageid;
      }else {
        waitpageObj = waitpageObj + "," + _pageid;
      }      
      props.onUpdateSaveWaitList(waitpageObj);
      setWaiting(waitpageObj); */

      let _pageforSave = getPageforSave(_pageid);
      /* if(selectedPage['pageid'] === _pageid) {
        _pageforSave = selectedPage;
      }else {
        let _closedpage =  openedPages.filter(function(node) {
          if(node.pageid === _pageid){
            return node;
          }
          return node.pageid === _pageid;
        })
        console.log(pagetabid, _pageid, "onSave Page >>>>>>>>>>>>>>>>>", _closedpage, pageStateData);
        _pageforSave = _closedpage[0];
      } */

      if (_pageforSave) {
        /* setTimeout(() => {
          console.log(showWait, "fetchUpdatePage >>>>>>>>>>>>>>>>>", _pageid, _param, _pageforSave);            
          fetchUpdatePage(_pageid, _param, _pageforSave);
        }, 1000); */

        fetchUpdatePage(_pageid, _param, _pageforSave);

        let _projectData = props.projectdata;
        _projectData["isPreview"] = "0";
        let isneedtoUpdate = updateCreateDeletePageData(
          _pageforSave,
          _projectData
        );
        if (isneedtoUpdate) {
          //this.props.dispatch(setProjectData(_projectData));
          saveAppData(props, _projectData);
        } else {
          updateProjectData(props, _projectData, "isPreview");
        }
      }
    }
  }

  function getPageValidation(pageData) {
    // console.log(pageData); // {}
    if (showValidationDismiss) {
      return true;
    }
    if (validationError.length > 0) {
      setValidationAlert(true);
      return false;
    }
    const _validateData = validatePageData(
      pageData,
      props.pagedata.pagedata,
      screenIndex
    );
    // console.log(_validateData);  // not yet interpreted
    if (_validateData.length > 0) {
      setDismissAllow(true);
      let pageError = _validateData.filter(function (node) {
        return node["dismissAllow"] === false;
      });
      //console.log(_validateData, "dismissAllow>>>>", pageError);
      if (pageError.length > 0) {
        setDismissAllow(false);
      }
      setPageValidationError(_validateData);
      setValidationAlert(true);
      return false;
    }
    return true;
  }

  function updateDocument_forPage(pageObj) {
    const nowDate = new Date();
    let df = new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      literal: "-",
    });
    const formattedDate = df.format(nowDate);
    let dateVal =
      nowDate.getFullYear() +
      "-" +
      formattedDate.split("/")[1] +
      "-" +
      formattedDate.split("/")[0];

    let tf = new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    const timeVal = tf.format(nowDate);

    let strDate = dateVal + " " + timeVal;
    const i = nowDate.toString().indexOf("GMT");
    strDate = strDate + " GMT" + nowDate.toString().substr(i + 3, 5);

    let docObj = pageObj["Document"];

    let _pageCreatedDT = docObj.filter(function (node) {
      return node.key === "createddatetime";
    });
    if (_pageCreatedDT.length === 0) {
      let createdObj = { key: "createddatetime", value: "" };
      docObj.push(createdObj);
    } else if (_pageCreatedDT.length > 1) {
      /* const filteredArr = _pageCreatedDT.reduce((acc, current) => {
        const x = acc.find(item => item.key === current.key);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      console.log(_pageCreatedDT, "--- _pageCreatedDT ---", filteredArr); */

      const _objCreatedDT = _pageCreatedDT[_pageCreatedDT.length - 1];
      _pageCreatedDT = [_objCreatedDT];
    }

    let _pageUpdateDT = docObj.filter(function (node) {
      return node.key === "lastupdatedatetime";
    });

    if (_pageUpdateDT.length === 0) {
      let updatedObj = { key: "lastupdatedatetime", value: strDate };
      docObj.push(updatedObj);
    } else {
      /* if(_pageUpdateDT.length > 1){
        const jsonObject = _pageUpdateDT.map(JSON.stringify);
        const uniqueSet = new Set(jsonObject);
        const uniqueArray = Array.from(uniqueSet).map(JSON.parse);

        console.log(_pageUpdateDT, "--- _pageUpdateDT ---", uniqueArray);
        //_pageUpdateDT = uniqueArray;
      } */

      _pageUpdateDT[0]["value"] = strDate;
    }
  }

  function resetPageSaveWaiting(pageid) {
    setWaiting({ pageid: -1, showwait: false });
  }

  function fetchUpdatePage(pageid, savetype, pageforSave) {
    console.log(pageforSave);
    if (!getPageValidation(pageforSave)) {
      return;
    }
    setWaiting({ pageid: pageid, showwait: true });
    updateDocument_forPage(pageforSave);

    var formData = new FormData();
    formData.append("command", "pageupdate");
    formData.append("userid", appConfig.userid);
    formData.append("sessionid", appConfig.sessionid);
    formData.append("projectid", appConfig.projectid);
    formData.append("pageid", pageid);
    //formData.append("file", file);
    let _jsonforsave = JSON.stringify(pageforSave); //_pageforsave[0]);
    var pageData = encodeURIComponent(_jsonforsave);
    //let text = new Blob([pageData], {type: "text/plain"});

    let text = new File([pageData], "updatePage.txt", { type: "text/plain" });
    formData.append("file", text);

    fetch(appConfig.apiURL + "multipartservice.json", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        //result = {"response":"ACK","count":1,"page":{....},"command":"pageupdate"}
        //console.log('pageupdate result:', result);
        if (result.response === "NACK") {
          const errormsg = result.error;
          if (
            typeof errormsg === "string" &&
            errormsg.indexOf("Invalid sessionid") > -1
          ) {
            setSessionError(true);
          }
          setAlertTitle("");
          setAlertMessage(result.error);
          setOpenAlert(true);
          resetPageSaveWaiting(pageid);
        } else {
          //console.log("pageupdate : Success >> ", result.page);
          setAlertTitle("");
          setAlertMessage(
            "Page '" + result.page["Title"] + "' saved successfully."
          );
          setOpenAlert(true);
          //console.log(pageid, ".. relaodPageList >>>>>>>>>>>>>>>>>", pageindex, openedPages);
          reloadPageList(pageid, result.page, savetype);
        }
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
        setAlertTitle("");
        setAlertMessage(
          "Something went wrong. Please check Server/Internet connection."
        );
        setOpenAlert(true);
        resetPageSaveWaiting(pageid);
      });
  }

  function updateCreateDeletePageData(pageobj, projectdata) {
    let isneedtoUpdate = false;

    if (!projectdata.hasOwnProperty("CreatedPageData")) {
      projectdata["CreatedPageData"] = [];
    }

    return isneedtoUpdate;
  }

  function saveAppData(propsObj, projectdata) {
    fetchContributorsData(propsObj).then((result) => {
      if (result.response !== "ACK") {
        var _err = { message: result.error };
        console.log("project_contributors NotACK >>", _err);
      } else {
        const _ownerName = projectdata["owner"];
        const _contributors = result["Contributors"];
        if (_contributors) {
          let contributorObj = _contributors.filter(function (node) {
            if (node.contributorName === _ownerName) {
              return node;
            }
            return node.contributorName === _ownerName;
          });
          if (contributorObj.length > 0) {
            const contributorPages = contributorObj[0]["selectTabPages"];
            if (contributorPages.length === 0) {
              const selectedTabModule = propsObj.selectedData["selectedTabs"];
              if (selectedTabModule && selectedTabModule.length > 0) {
                if (selectedTabModule[0] !== "none") {
                  //setErrorMessage("Contributor's selected pages already released. Thereafter changes will be discarded during merge.");
                  //setErrorDisplay(true);
                  projectdata["Contributors"] = result["Contributors"];
                }
              }
            } else {
              updateContributorsData(result["Contributors"], projectdata);
            }
          }
        }

        fetchUpdateProject(propsObj, projectdata);
      }
    });
  }

  function updateContributorsData(resultData, projectdata) {
    let prjContributors = projectdata["Contributors"];
    for (let i = 0; i < prjContributors.length; i++) {
      if (prjContributors[i]["contributorName"] === projectdata["owner"]) {
        continue;
      }
      const resultObj = resultData.find(
        ({ contributorName }) =>
          contributorName === prjContributors[i]["contributorName"]
      );
      if (resultObj) {
        prjContributors[i] = resultObj;
      }
    }
  }

  function fetchContributorsData(propsObj) {
    let _fetchContributorsData =
      propsObj.appconfig.apiURL +
      "project_contributors.json?project_id=" +
      propsObj.appconfig.projectid;
    return fetch(_fetchContributorsData)
      .then((res) => res.json())
      .then(
        (result) => {
          return result;
        },
        (error) => {
          return { response: "ERROR", error: error["message"] };
        }
      );
  }

  function fetchUpdateProject(propsObj, projectdata) {
    var formData = new FormData();
    formData.append("command", "projectupdate");
    formData.append("userid", propsObj.appconfig.userid);
    formData.append("sessionid", propsObj.appconfig.sessionid);
    formData.append("projectid", propsObj.appconfig.projectid);

    var prjctData = encodeURIComponent(JSON.stringify(projectdata));
    let text = new File([prjctData], "updateProject.txt", {
      type: "text/plain",
    });
    formData.append("file", text);

    fetch(propsObj.appconfig.apiURL + "multipartservice.json", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.response === "NACK") {
          var _err = { message: result.error };
          console.log("projectupdate NACK >>>", _err.message);
        } else {
          console.log("projectupdate ACK >>> Success");
        }
      })
      .catch((error) => {
        console.log("projectupdate Error >>> Fail");
      });
  }

  function updateProjectData(propsObj, projectData, keytoupdate) {
    const updatedval = projectData[keytoupdate];

    var formData = new FormData();
    formData.append("command", "projectkeyupdate");
    formData.append("projectid", propsObj.appconfig["projectid"]);
    formData.append("userid", propsObj.appconfig["userid"]);
    formData.append("sessionid", propsObj.appconfig["sessionid"]);
    formData.append("key", keytoupdate);
    formData.append("value", updatedval);

    fetch(propsObj.appconfig.apiURL + "service.json", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then(
        (result) => {
          if (result.response === "NACK") {
            var _err = { message: result.error };
            console.log("projectkeyupdate NACK >>>", _err.message);
          } else {
            console.log("projectkeyupdate ACK >>> Success");
          }
        },
        (error) => {
          console.log("projectkeyupdate Error >>> Fail");
        }
      );
  }

  function reloadPageList(updatepageid, updatepagedata, savetype) {
    let _pages = parameters["pagedata"];
    for (let i = 0; i < _pages.length; i++) {
      if (_pages[i]["pageid"] === updatepageid) {
        //console.log(savetype, "relaodPageList >>>>>>>>>>>>>>>>>", updatepagedata);
        _pages.splice(i, 1, updatepagedata);
        if (savetype === "save") {
          setSelectedPage(updatepagedata);
          updateOpenpages(updatepagedata);
          props.onSelectPage(updatepagedata);
        }
      }
    }
    setPageListPageData(_pages);

    var arrPageData = [];

    let projectNode = {
      level: 0,
      title: props.projectdata.ProjectName,
      id: "-1",
      parent: "App",
      type: "",
      children: [],
    };
    arrPageData.push(projectNode);
    manipulatePageData(_pages, 1, arrPageData);

    var pageHeirarchy = setPageHeirarchy(arrPageData);
    pageHeirarchy = pageHeirarchy.filter(function (page) {
      return page.parent === "App";
    });
    setPageListHeirarchy(pageHeirarchy);

    //console.log(pageHeirarchy, "relaodPageList >>>>>>>>>>>>>>>>>", pagelistHeirarchy);
    let pageStatesArr = pageStateData;
    for (let index = 0; index < pageStatesArr.length; index++) {
      const _page = pageStatesArr[index];
      if (_page[updatepageid]) {
        //console.log(updatepageid, "relaodPageList >>>>>>>>>>>>>>>>>", _page[updatepageid]);
        if (!checkPageOpenedAlready(updatepageid)) {
          pageStatesArr.splice(index, 1);
          break;
        } else {
          let __pageState = _page[updatepageid];
          //console.log(updatepagedata, "Means page opened, need to update state >>>>>>>>", __pageState);
          __pageState["init"][0] = JSON.parse(JSON.stringify(updatepagedata));
          __pageState["undo"] = __pageState["redo"] = [];
        }
      }
    }
    setPageStateData(pageStatesArr);
    props.setPageStates(pageStatesArr);
    resetPageSaveWaiting(updatepageid);
  }

  function alertCloseHandler() {
    setOpenAlert(false);
  }
  function alertOKHandler() {
    setOpenAlert(false);
  }

  const handlePageChange = (e, newValue) => {
    if (!getPageValidation(selectedPage)) {
      return;
    }
    updateOpenpages(selectedPage);
    props.onPageChange(selectedPage);
    setPageIndex(newValue);
    let changedPage = openedPages[newValue];
    setSelectedPage(changedPage);
    props.onSelectPage(changedPage);
  };

  const [pagetabid, setPagetabid] = React.useState(0);
  function onClosePageTab(ev) {
    let _pageid = ev.currentTarget.dataset["id"];
    setPagetabid(_pageid);

    let pageStatesArr = pageStateData;
    let pageObj = pageStatesArr.filter((node) => {
      if (node[_pageid]) {
        return true;
      }
      return false;
    });

    if (pageObj.length === 0) {
      closePageEditorHandler(_pageid);
    } else {
      let selectedTabModule = props.pagedata.ctabs;
      //console.log(props.pagedata.pagedata, selectedTabModule, "****AE123.. getTabModuleAccess**", props);
      let isAccess = true;
      if (selectedTabModule && selectedTabModule.length > 0) {
        isAccess = getTabModuleAccess(
          pageObj[0][_pageid]["init"][0],
          selectedTabModule,
          props.pagedata.pagedata
        );
      }
      if (!isAccess) {
        //console.log(_pageid, pagetabid,"*****", props.pagedata.pagedata, selectedTabModule, "****AE.. getTabModuleAccess**", isAccess);
        confirmCloseHandler(_pageid);
        return;
      }

      let undoArr = pageObj[0][_pageid]["undo"];
      let redoArr = pageObj[0][_pageid]["redo"];
      //console.log(pageStatesArr, _pageid, pageObj[0], "....onClosePageTab >>>>", undoArr.length, redoArr.length);
      if (undoArr.length === 0 && redoArr.length === 0) {
        closePageEditorHandler(_pageid);

        for (let index = 0; index < pageStatesArr.length; index++) {
          const _page = pageStatesArr[index];
          if (_page[_pageid]) {
            pageStatesArr.splice(index, 1);
            break;
          }
        }
        setPageStateData(pageStatesArr);
        props.setPageStates(pageStatesArr);
      } else {
        let _pageforSave = getPageforSave(_pageid);
        if (!getPageValidation(_pageforSave)) {
          return;
        }

        let alertmsg = "Do you want to save this page ?";
        setAlertTitle("");
        setAlertMessage(alertmsg);
        setOpenConfirm(true);
      }
    }
  }

  function closePageEditorHandler(_pageid) {
    //console.log(_pageid, "close page editor >>", selectedPage);
    let openedPagesArr = openedPages;
    for (let index = 0; index < openedPagesArr.length; index++) {
      const _page = openedPagesArr[index];
      if (_page.pageid === _pageid) {
        openedPagesArr.splice(index, 1);
        //console.log(pageStateData, ".... closePageEditorHandler ...", openedPagesArr);
        break;
      }
    }

    if (openedPagesArr.length > 0) {
      let newVal = openedPagesArr.length - 1;
      setPageIndex(newVal);
      let changedPage = openedPagesArr[newVal];
      setSelectedPage(changedPage);
      props.onSelectPage(changedPage);
    } else {
      setShowPage(false);
      setSelectedPage({});
    }

    setOpenedPages(openedPagesArr);
    props.onOpenedPages(openedPages, "close");
  }

  function confirmCloseHandler(pageid) {
    let _pagetabid = pageid ? pageid : pagetabid;

    let pageObj = pageStateData.filter(function (node) {
      if (node[_pagetabid]) {
        return true;
      }
      return false;
    });

    let initArr = pageObj[0][_pagetabid]["init"];
    setSelectedPage(initArr[0]);

    let _pages = parameters["pagedata"];
    for (let i = 0; i < _pages.length; i++) {
      if (_pages[i]["pageid"] === initArr[0]["pageid"]) {
        _pages.splice(i, 1, initArr[0]);
      }
    }
    setPageListPageData(_pages);

    let pageStatesArr = pageStateData;
    for (let index = 0; index < pageStatesArr.length; index++) {
      const _page = pageStatesArr[index];
      if (_page[_pagetabid]) {
        pageStatesArr.splice(index, 1);
        break;
      }
    }
    setPageStateData(pageStatesArr);
    props.setPageStates(pageStatesArr);

    //onClosePageEditor(selectedPage.pageid, "nosave");
    closePageEditorHandler(_pagetabid);

    setOpenConfirm(false);
    //setAction('');
  }
  function confirmOKHandler() {
    onClosePageEditor(pagetabid, "saveclose");
    closePageEditorHandler(pagetabid);

    setOpenConfirm(false);
    //setAction('');
  }

  function dropNotAllowed(ev) {
    ev.dataTransfer.dropEffect = "none";
    //ev.stopPropagation();
    ev.preventDefault();
  }

  function onPageUndoRedo(updatedPage) {
    updateOpenpages(updatedPage);

    setSelectedPage(updatedPage);
    props.onSelectPage(updatedPage);
  }

  function onPageScreenChange(currentIndex) {
    setScreenIndex(parseInt(currentIndex));

    let updatedPagedef = getupdatedPagedef();
    //console.log(selectedPage, props.selectedpage, ".... onPageScreenChange >>>>", updatedPagedef);
    let _pageUIs = getAllChildrenOnPage(updatedPagedef, currentIndex);
    _pageUIs.forEach((uipart) => {
      if (uipart.hasOwnProperty("selected")) {
        //console.log(currentIndex, ">>>>>>>>", uipart);
        delete uipart["selected"];
      }
    });

    setSelectedPage(updatedPagedef);
    props.onSelectPage(updatedPagedef);
  }

  function onClickPageEditor(_page) {
    //console.log(screenIndex, selectedPage, ".... onClickPageEditor .....", props.selectedpage);
    let pagedef = selectedPage; //getupdatedPagedef();
    updateOpenpages(pagedef);

    setSelectedPage(pagedef);
    props.onSelectPage(pagedef);
  }

  function updateOpenpages(updatedPage, param) {
    // console.log(openedPages, ".... updateOpenpages ....", updatedPage, param);
    let openedPagesArr = openedPages;
    for (let index = 0; index < openedPagesArr.length; index++) {
      const _page = openedPagesArr[index];
      if (_page.pageid === updatedPage.pageid) {
        openedPagesArr.splice(index, 1, updatedPage);
        break;
      }
    }
    setOpenedPages(openedPagesArr);
    if (param === "update") {
      props.onOpenedPages(openedPagesArr, param);
    }
  }

  function handleUIDrag() {
    /* const screens = props.projectdata['availableScreens'];
    if(screens.length > 1) {
      onClickPageEditor();
    } */
  }

  ////////////////// Setting-Window functionalities //////////////////

  function getupdatedPagedef() {
    //console.log(screenIndex, selectedPage, ".... getupdatedPagedef .....", props.selectedpage);
    let pagedef = selectedPage;

    const screens = props.projectdata["availableScreens"];
    if (screens.length > 1) {
      const isMasterSlave = props.projectdata["isMasterScreenSet"];
      let masterScreenIndex = 0;
      screens.forEach((element, i) => {
        if (element["embed"]) {
          masterScreenIndex = i;
        }
      });

      if (isMasterSlave && screenIndex === masterScreenIndex) {
        pagedef = props.selectedpage;
      }
    }

    return pagedef;
  }

  function managePageState(updatedPage, source) {
    let updatedPagedef = getupdatedPagedef(); //updatedPage;

    let pageStates = pageStateData;
    let pageObj = pageStates.filter(function (node) {
      if (node[updatedPagedef.pageid]) {
        return true;
      }
      return false;
    });

    if (pageObj.length > 0) {
      let undoArr = pageObj[0][updatedPagedef.pageid]["undo"];
      let __page = JSON.parse(JSON.stringify(updatedPagedef));
      if (undoArr.length > 10) {
        undoArr.shift();
      }
      undoArr.push(__page);

      setPageStateData(pageStates);
      props.setPageStates(pageStates);
    }

    if (source) {
      if (source === "page") {
        props.onSelectPage(updatedPagedef);
      }
    }
    setSelectedPage(updatedPagedef);
    updateOpenpages(updatedPagedef, "update");
  }

  ///////////////////////////////////////////////

  function handleCloseValidationAlert() {
    setValidationAlert(false);
  }
  function handleDismissValidationAlert() {
    setValidationAlert(false);
    setValidationDismiss(true);
  }

  function handleRelogin(pwd) {
    let encryptPwd = window
      .require("crypto")
      .createHash("md5")
      .update(pwd)
      .digest("hex");
    let api_relogin =
      props.appconfig.apiURL +
      "login.json?command=login&username=" +
      props.appconfig.userid +
      "&password=" +
      encryptPwd +
      "&oldsession=" +
      props.appconfig.sessionid;
    fetch(api_relogin, { method: "POST" })
      .then((res) => res.json())
      .then(
        (result) => {
          if (result.response === "NACK") {
            setAlertTitle("");
            setAlertMessage(result.error);
            setOpenAlert(true);
          } else {
            let credentials = {
              userid: result.userid,
              sessionid: result.sessionid,
              projectid: props.appconfig.projectid,
              locale: "en",
            };
            props.onRelogin(credentials);

            setSessionError(false);
          }
        },
        (error) => {
          console.error("Re-login Error:", error);
          setAlertTitle("");
          setAlertMessage(
            "Something went wrong. Please check Server/Internet connection."
          );
          setOpenAlert(true);
        }
      );
  }

  function shrinkToolbar() {
    const wrkspaceSection = document.getElementById("app-edit-section");
    const toolTitles = document.getElementById("app-editor-toollist");
    if (!wrkspaceSection.classList.contains("shrink-wrkspace")) {
      wrkspaceSection.classList.add("shrink-wrkspace");
      toolTitles.style.display = "none";
      dispatch(setShrinkPallete(true));
    } else {
      wrkspaceSection.classList.remove("shrink-wrkspace");
      dispatch(setShrinkPallete(false));
      setTimeout(() => {
        toolTitles.style.display = "block";
      }, 100);
    }
  }

  return (
    <>
      {/* ++++ This is the tab section which needs to be placed inside Editor Section  */}

      <section className="page-explorer-menu">
        {/* Page List Drawer Icon below to toggle  */}
        <div
          className={
            props.isShrinkable
              ? "page-list-collapse-menu"
              : "page-list-drawer-menu"
          }
        >
          {!openPageList && (
            <Tooltip
              title={<h6>Open Page List</h6>}
              className="open-pagelist-icon"
            >
              <IconButton onClick={handleListOpen}>
                <ReadMore className="drawer-icn" />
              </IconButton>
            </Tooltip>
          )}
          <li className="app-editor-menu-open" onClick={shrinkToolbar}>
            <MenuOpen className="drawer-icn" style={{ fontSize: "1.75rem" }} />
          </li>
        </div>
        {showPage && (
          <StyledTabs
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            style={{ width: "88vw" }}
            indicatorColor="primary"
            value={pageindex}
            onChange={handlePageChange}
          >
            {openedPages.map((page) => (
              <StyledTab
                wrapped
                key={page.pageid}
                label={page.Title}
                tabid={page.pageid}
                onClose={onClosePageTab}
              />
            ))}
          </StyledTabs>
        )}
      </section>

      {openPageList && (
        <section id="page-list-section">
          <div
            className="page-list-section-overlay"
            onClick={() => setOpenPageList(false)}
          ></div>
          <div className="page-list-container">
            <div className="page-list-header">
              <div className="page-list-info">
                <h4>Page List</h4>
                {/* <Avatar
                  className="page-list-num"
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 100,
                    width: 28,
                    height: 28,
                    fontSize: 12,
                    backgroundColor: "rgba(0, 0, 0, 0.667)",
                  }}
                >
                  {pagelistPageData.length}
                </Avatar> */}
              </div>
              <div className="menu-open-btn">
                <MenuOpen className="icon" onClick={handleListClose} />
              </div>
            </div>

            <div className="page-list-file-structure">
              <PageExplorer
                appconfig={appConfig}
                projectdata={props.projectdata}
                pagedata={parameters}
                openedPages={openedPages}
                selectedtabs={props.pagedata.ctabs}
                onPageSelect={handlePageSelect}
                onPagelistUpdate={handlePagelistUpdate}
                onSaveAllPages={handleSaveAllPages}
              />
            </div>
          </div>
        </section>
      )}
      <section id="app-edit-section">
        {/* below section cover toolbar section here  */}
        {showPage && (
          <section id="uilistbox" className="app-editor-toolbar">
            <UIExplorer
              uilist={parameters.uilist}
              onUIDragStart={handleUIDrag}
            />
          </section>
        )}
        <div
          id={
            props.pallete === PALLETE_SIDE.EDITOR_SETTING
              ? "app-editor-middle-section"
              : "app-editor-swap-section"
          }
        >
          {props.pallete === PALLETE_SIDE.EDITOR_SETTING ? (
            <>
              <PageEditor
                pageindex={pageindex}
                appconfig={appConfig}
                show={showPage}
                uilist={uilistDisplay}
                heirarchy={props.pagedata.list}
                selectedPage={selectedPage}
                openedPageList={openedPages}
                pageState={pageStateData}
                onDragOver={dropNotAllowed}
                currentScreenIndex={screenIndex}
                onUndoRedo={onPageUndoRedo}
                onScreenChange={onPageScreenChange}
                onClickEditor={onClickPageEditor}
                onEditorClose={onClosePageEditor}
                showWait={showWait}
                onSaveWaitClose={resetPageSaveWaiting}
                handlePageChange={handlePageChange}
                onClosePageTab={onClosePageTab}
              />
              {showPage && (
                <section id="setting-window-pallete">
                  <SettingWindow
                    show={showPage}
                    type="page"
                    currentScreenIndex={screenIndex}
                    onPropertyValueChange={managePageState}
                  />
                </section>
              )}
            </>
          ) : (
            <>
              {showPage && (
                <section id="setting-window-pallete">
                  <SettingWindow
                    show={showPage}
                    type="page"
                    currentScreenIndex={screenIndex}
                    onPropertyValueChange={managePageState}
                  />
                </section>
              )}
              <PageEditor
                pageindex={pageindex}
                appconfig={appConfig}
                show={showPage}
                uilist={uilistDisplay}
                heirarchy={props.pagedata.list}
                selectedPage={selectedPage}
                openedPageList={openedPages}
                pageState={pageStateData}
                onDragOver={dropNotAllowed}
                currentScreenIndex={screenIndex}
                onUndoRedo={onPageUndoRedo}
                onScreenChange={onPageScreenChange}
                onClickEditor={onClickPageEditor}
                onEditorClose={onClosePageEditor}
                showWait={showWait}
                onSaveWaitClose={resetPageSaveWaiting}
                handlePageChange={handlePageChange}
                onClosePageTab={onClosePageTab}
              />
            </>
          )}
        </div>
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
        {pageValidationError.length > 0 && (
          <Dialog open={showValidationAlert}>
            <DialogTitle>
              <h4>Please correct below error(s)</h4>
              <IconButton size="small" aria-label="save">
                <SvgIcon>
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M3 18h13v-2H3v2zm0-5h10v-2H3v2zm0-7v2h13V6H3zm18 9.59L17.42 12 21 8.41 19.59 7l-5 5 5 5L21 15.59z" />
                </SvgIcon>
              </IconButton>
            </DialogTitle>
            <DialogContent className="app-edtor-dialog-content app-editor-validation-alert">
              <table className="tg">
                <tbody>
                  {pageValidationError.map((vobj, index) => (
                    <tr key={index}>
                      <td style={{ minWidth: 120 }}> {vobj.message} </td>
                      <td> {vobj.type} </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DialogContent>
            <DialogActions style={{ justifyContent: "flex-end" }}>
              <h4 className="app-editor-validation-note">
                For further detail, check "Page Setting - Page Validation"
              </h4>
              <Tooltip
                className="app-edtor-custom-tooltip"
                title="For further detail, check 'Page Setting - Page Validation'"
                placement="top"
              >
                <button
                  className="app-editor-validation-btn"
                  onClick={handleCloseValidationAlert}
                >
                  OK
                </button>
              </Tooltip>
              {showDismiss && (
                <Tooltip
                  className="app-edtor-custom-tooltip"
                  title="Ignoring such validations may cause unexpected scenario"
                  placement="top"
                >
                  <button
                    className="app-editor-validation-btn"
                    onClick={handleDismissValidationAlert}
                  >
                    Dismiss
                  </button>
                </Tooltip>
              )}
            </DialogActions>
          </Dialog>
        )}
        {isSessionError && (
          <LoginWindow loginid={appConfig.userid} onRelogin={handleRelogin} />
        )}
      </section>
    </>
  );
}

function PageExplorer(props) {
  const appConfig = props.appconfig;

  const [pagelistdata, setPagelistData] = useState({
    pagedata: props.pagedata.pagedata,
    list: props.pagedata.list,
  });

  const [action, setAction] = useState("");
  const [openalert, setOpenalert] = useState(false);
  const [alertmsg, setAlertMsg] = useState("");
  const [pagemapping, setPageMapping] = useState(false);

  function handleManagePagelist() {
    if (props.openedPages.length === 0) {
      setAction("add");
    } else {
      setOpenalert(true);
      setAlertMsg("Please close all opened pages.");
    }
  }

  function handleClosePageManager(pagelistdata) {
    setPagelistData(pagelistdata);
    props.onPagelistUpdate(pagelistdata);

    setAction("");
  }

  function handlePageSelection(_page) {
    //console.log("handlePageSelection >>", _page);
    props.onPageSelect(_page);
  }

  function handleUpdatePagelist(pagelistdata) {
    setPagelistData(pagelistdata);
    props.onPagelistUpdate(pagelistdata);
  }

  function handleClosePageModule() {
    setPageMapping(false);
  }

  function handleUpdatePageModule(pagelist) {
    //console.log(">>>>>>>>>>", pagelist);
    props.onSaveAllPages(pagelist);
  }

  const handleCloseAlert = () => {
    setOpenalert(false);
    setAlertMsg("");
  };

  function handleMultiPageSelection(page) {
    props.onPageSelect(page, true);
  }

  return (
    <section id="page-explorer-section">
      <div className="page-explorer-tree">
        <PageListView
          listdata={pagelistdata}
          selectedtabs={props.selectedtabs}
          onNodeSelection={handlePageSelection}
          onMultiPageSelection={handleMultiPageSelection}
        />
      </div>
      <AppBar position="relative" className="manage-btn-container">
        <Toolbar variant="dense">
          <Grid className="manage-btn-context" container>
            <button className="manage-page-btn" onClick={handleManagePagelist}>
              <h4>Manage Page List</h4>
            </button>

            {/* <Tooltip title={<h6>Set Module-Name to Pages</h6>}>
              <Fab
                edge="end"
                size="small"
                aria-label="modulemap"
                onClick={handleOpenPageModule}
              >
                <SvgIcon>
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  <path d="M0 0h24v24H0z" fill="none" />
                </SvgIcon>
              </Fab>
            </Tooltip> */}
          </Grid>
        </Toolbar>
      </AppBar>
      {action === "add" && (
        <PopupPageList
          draggable="false"
          title={<h4>Manage Page List</h4>}
          popupstate="pagelist-new"
          appconfig={appConfig}
          projectdata={props.projectdata}
          pagedata={pagelistdata}
          oncloseWindow={handleClosePageManager}
          onOpenSelectedPage={handlePageSelection}
          onUpdatePagelist={handleUpdatePagelist}
        />
      )}

      {pagemapping && (
        <PageModuleMapping
          draggable="false"
          appconfig={appConfig}
          propsObj={props}
          pagedata={pagelistdata}
          oncloseWindow={handleClosePageModule}
          onUpdatePagelist={handleUpdatePageModule}
        />
      )}
      <Snackbar
        open={openalert}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        message={<h4>{alertmsg}</h4>}
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
    </section>
  );
}

function UIExplorer(props) {
  const [expanded, setExpanded] = React.useState("Container");
  const dispatch = useDispatch();
  const handleExpandCollapse = (name, id) => (event) => {
    setExpanded(name);
    openSubToolbar(id);
    // console.log({ id, name });
  };

  const uiparts = props.uilist;

  function handleUItypeDragstart(ev) {
    props.onUIDragStart();

    let uitype = ev.target.dataset["uiname"];
    // console.log(
    //   uitype,
    //   "...handleUItypeDragstart >>>>>>>..",
    //   ev.target.dataset["uitype"]
    // );
    if (ev.target.dataset["uitype"]) {
      uitype = uitype + ev.target.dataset["uitype"];
    }

    const rect = ev.currentTarget.getBoundingClientRect();
    const dx = ev.clientX - rect["x"];
    const dy = ev.clientY - rect["y"];
    //console.log(uitype, "****", rect, "--- new UI Dragstart---", ev.clientX, ev.clientY, "==>>", dx, dy);
    uitype = uitype + "_" + dx + "_" + dy;
    // console.log("UI TYPE", uitype);
    ev.dataTransfer.setData("text/plain", uitype);
  }

  function openSubToolbar(id) {
    let firstChar = id.split(" ")[0];
    const toolElements = document.querySelectorAll(".app-editor-container");
    const toolMenuIcons = document.querySelectorAll(".tool-menus-icon");
    const toolElementHeader = document.querySelectorAll(
      ".app-editor-heading h4"
    );
    toolElements.forEach((tab) => {
      tab.addEventListener("click", () => {
        toolElements.forEach((ele) => ele.classList.remove("active-tool"));
      });
      // toolMenuIcons.forEach((icon) => icon.classList.remove("active-tool"));
    });
    toolMenuIcons.forEach((icon) => {
      icon.classList.remove("active-tool");
      icon.addEventListener("click", () => {
        toolElements.forEach((ele) => ele.classList.remove("active-tool"));
      });
    });
    toolElementHeader.forEach((label) =>
      label.classList.remove("color-appearance")
    );
    document.getElementById(id).classList.add("active-tool");
    document.getElementsByClassName(firstChar)[0].classList.add("active-tool");
    document
      .getElementsByClassName(firstChar)[1]
      .classList.add("color-appearance");
  }

  function openDrawer() {
    const wrkspaceSection = document.getElementById("app-edit-section");
    const toolTitles = document.getElementById("app-editor-toollist");
    wrkspaceSection.classList.remove("shrink-wrkspace");
    dispatch(setShrinkPallete(false));
    setTimeout(() => {
      toolTitles.style.display = "block";
    }, 500);
  }

  function openToolMenuBar(tool, id) {
    setExpanded(tool);
    openSubToolbar(id);
  }

  useEffect(() => {
    if (expanded === "Container") {
      document.getElementById("Container").classList.add("active-tool");
      document
        .getElementsByClassName("Container")[0]
        .classList.add("active-tool");
      document
        .getElementsByClassName("Container")[1]
        .classList.add("color-appearance");
    } else {
      document.getElementById("Container").classList.remove("active-tool");
      document
        .getElementsByClassName("Container")[0]
        .classList.remove("active-tool");
      document
        .getElementsByClassName("Container")[1]
        .classList.remove("color-appearance");
    }
  }, [expanded]);

  return (
    <div id="uiexplorer" className="app-editor-toolbar-list">
      <ol className="toolbar-menu-icons">
        <div className="menus">
          <li
            className="grid grid-center tool-menus-icon Container"
            onClick={() => openToolMenuBar("Container", "Container")}
          >
            <CheckBoxOutlineBlank
              style={{ fontSize: "2rem" }}
              onMouseEnter={openDrawer}
            />
          </li>
          <li
            className="grid grid-center tool-menus-icon Text"
            onClick={() => openToolMenuBar("TextAndImage", "Text and Image")}
          >
            <Abc style={{ fontSize: "2.35rem" }} onMouseEnter={openDrawer} />
          </li>
          <li
            className="grid grid-center tool-menus-icon Button"
            onClick={() => openToolMenuBar("Button", "Button")}
          >
            <SmartButton
              style={{ fontSize: "2rem" }}
              onMouseEnter={openDrawer}
            />
          </li>
          <li
            className="grid grid-center tool-menus-icon Media"
            onClick={() =>
              openToolMenuBar("MediaAndLibrary", "Media and Library")
            }
          >
            <PermMedia style={{ fontSize: "2rem" }} onMouseEnter={openDrawer} />
          </li>
          <li
            className="grid grid-center tool-menus-icon Selector"
            onClick={() => openToolMenuBar("Selector", "Selector")}
          >
            <DomainVerificationRounded
              style={{ fontSize: "2rem" }}
              onMouseEnter={openDrawer}
            />
          </li>
          <li
            className="grid grid-center tool-menus-icon Overlay"
            onClick={() => openToolMenuBar("Indicator", "Overlay")}
          >
            <LayersRounded
              style={{ fontSize: "2rem" }}
              onMouseEnter={openDrawer}
            />
          </li>
        </div>
      </ol>
      <section id="app-editor-toollist">
        {uiparts.map((category, index) => (
          <div key={index}>
            <ListItem
              button
              id={category.text}
              className="app-editor-container"
              onClick={handleExpandCollapse(category.name, category.text)}
            >
              <ListItemText
                className="app-editor-heading"
                primary={
                  <h4 className={category.text.split(" ")[0]}>
                    {category.text}
                  </h4>
                }
              ></ListItemText>
            </ListItem>
            <Collapse
              in={expanded === category.name}
              timeout="auto"
              unmountOnExit
            >
              <div>
                {category.items.map((item, indexui) => (
                  <Tooltip
                    key={indexui}
                    title={<h6>{item.description}</h6>}
                    placement="right-end"
                  >
                    <div
                      className="app-editor-item"
                      draggable="true"
                      data-uitype={item.type}
                      data-uiname={item.name}
                      onDragStart={handleUItypeDragstart}
                    >
                      <img
                        src={item.imagePath}
                        alt={item.name}
                        className="tool-img"
                      />
                      <h4>{item.text}</h4>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </Collapse>
          </div>
        ))}
      </section>
    </div>
  );
}

/* Akshay Sir Latest Component Added below: == PageModuleMapping */
function PageModuleMapping(props) {
  const useStyles = makeStyles((theme) => ({
    pmexplorer: {
      width: "inherit",
      height: "100%",
      display: "inline-block",
      flexDirection: "row",
      flexGrow: 1,
      backgroundColor: "rgba(244, 244, 244, 1)",
      overflow: "hidden auto",
    },
    pageidlist: {
      height: "86%",
      overflow: "auto",
      borderBottom: "1px solid",
    },
    pageidlistitem: {
      maxHeight: 48,
      paddingLeft: 16,
      paddingRight: 16,
    },
    note: {
      fontSize: "1.2rem",
      textAlign: "start",
      marginLeft: 16,
      marginTop: 8,
      color: "blue",
    },
    btnPMM: {
      width: 60,
      height: 22,
      margin: "8px 32px",
      textTransform: "none",
      fontSize: "1.25rem",
    },
  }));
  const classes = useStyles();

  const allPages = props.pagedata.pagedata;
  const pageHeirarchy = props.pagedata.list;
  const [pagelist, setUpdatedPageList] = React.useState(
    setpagelist(allPages, pageHeirarchy)
  );

  function handleSetModuleName(event, valObj) {
    const val = event.target.value;

    if (val.length > 0) {
      const allowedChars = /[a-zA-Z0-9 ]/g;
      let allowedTitle = val.match(allowedChars);
      if (!allowedTitle) {
        return;
      }
      if (allowedTitle && val.length !== allowedTitle.length) {
        return;
      }
    }
    const newList = pagelist.map((item) => {
      if (item.id === valObj["id"]) {
        item["module"] = val.charAt(0).toUpperCase() + val.slice(1);
        const updatedItem = {
          ...item,
        };
        return updatedItem;
      }
      return item;
    });
    setUpdatedPageList(newList);

    setPageModuleName(valObj["id"], val);
  }

  function setPageModuleName(pageid, name) {
    allPages.filter(function (node) {
      if (node["pageid"] === pageid) {
        node["moduleName"] = name;
        return true;
      }
      return false;
    });
  }

  function handleCloseModuleMapping() {
    props.oncloseWindow();
  }

  function handleSaveModuleMapping() {
    //console.log(props, ">>>>>>>>>>", pageHeirarchy, allPages);
    props.onUpdatePagelist(allPages);
    props.oncloseWindow();
  }

  return (
    <div id="pagemodulemapper" className={classes.pmexplorer}>
      <Dialog id="pagemoduledialog" open={true} scroll="paper" fullWidth>
        <div className="page-module-wrapper">
          <h4>Set Module-Name to Pages</h4>
        </div>
        <DialogContent dividers>
          <Paper elevation={9} style={{ width: "100%", height: "80vh" }}>
            <List dense disablePadding className={classes.pageidlist}>
              {pagelist.map((value, index) => (
                <ListItem
                  key={index}
                  dense
                  className={classes.pageidlistitem}
                  data-id={value["id"]}
                >
                  {value["parentid"] === "App" && (
                    <ListItemText primary={<h4>{value["title"]}</h4>} />
                  )}
                  {value["parentid"] !== "App" && (
                    <ListItemText
                      primary={<h4>{value["title"]}</h4>}
                      style={{ marginLeft: 24 }}
                    />
                  )}
                  <div style={{ minWidth: 240, height: 24 }}>
                    <TextField
                      margin="dense"
                      variant="standard"
                      autoComplete="off"
                      style={{
                        width: 240,
                        height: 24,
                        margin: 0,
                        fontSize: 18,
                      }}
                      value={value["module"]}
                      onChange={(event) => handleSetModuleName(event, value)}
                    />
                  </div>
                </ListItem>
              ))}
            </List>
            <h6 style={{ color: "blue" }}>
              Note: It is recommended to provide name for each page.
            </h6>
            <div className="pagemodule-btn">
              <button
                disableRipple
                disableFocusRipple
                className={classes.btnPMM}
                onClick={handleCloseModuleMapping}
              >
                Cancel
              </button>
              <button
                disableRipple
                disableFocusRipple
                className={classes.btnPMM}
                onClick={handleSaveModuleMapping}
              >
                Save
              </button>
            </div>
          </Paper>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function setpagelist(pages, pageH) {
  let pagelist = [];

  for (let i = 0; i < pageH.length; i++) {
    const pageObj = pageH[i];
    if (pageObj && pageObj["level"] > 0) {
      let _module =
        pageObj["page"] && pageObj["page"]["moduleName"]
          ? pageObj["page"]["moduleName"]
          : "";
      pagelist.push({
        id: pageObj["id"],
        title: pageObj["title"],
        parentid: pageObj["parent"],
        module: _module,
      });

      let pchildren = pageObj["children"];
      let childlist = setpagelist(pages, pchildren);
      for (let j = 0; j < childlist.length; j++) {
        const element = childlist[j];
        let _elmodule = element["module"]
          ? element["module"]
          : element["page"] && element["page"]["moduleName"]
          ? element["page"]["moduleName"]
          : "";
        pagelist.push({
          id: element["id"],
          title: element["title"],
          parentid: element["parent"],
          module: _elmodule,
        });
      }
    }
  }

  return pagelist;
}

function populateActionData(currPage, pagelist, projData) {
  const screens = projData["availableScreens"];
  for (let index = 0; index < screens.length; index++) {
    const screenIndex = index;
    let pageUIs = getAllChildrenOnPage(currPage, screenIndex);
    pageUIs.forEach((uiContainer) => {
      if (
        uiContainer["viewType"] === "Gadget" ||
        uiContainer["viewType"] === "GadgetUI" ||
        uiContainer["viewType"] === "Picker"
      ) {
        //continue;
      } else {
        //uiContainer['parent'] = "container1";
        if (uiContainer.hasOwnProperty("parent")) {
          delete uiContainer["parent"];
        }
        let childPartDic = uiContainer.uiParts[screenIndex];
        if (childPartDic) {
          if (!childPartDic.hasOwnProperty("parent")) {
            childPartDic["parent"] = "container1";
          }
          if (childPartDic && childPartDic.hasOwnProperty("actions")) {
            var objChildActions = childPartDic["actions"]; //JSON.parse(JSON.stringify(childPartDic['actions']));
            manageActionsDef(objChildActions, currPage, pagelist);
          }
        }
        /* else {
          console.log("'"+ currPage.Title +"' don't have second screen definition");
        } */
      }
    });
    if (currPage.hasOwnProperty("actions")) {
      var objPageActions = currPage["actions"];
      manageActionsDef(objPageActions, currPage, pagelist);
    }
  }
}
function manageActionsDef(objActions, objPageDic, pagelist) {
  for (const functions in objActions) {
    var strFunction = functions.toString();
    var item = objActions[strFunction];
    for (var i = 0; i < item.length; i++) {
      let objAction = item[i];
      manageActionsDef(objAction["actions"], objPageDic, pagelist);
      const paramDic = objAction["params"];
      if (
        objAction["category"] === "ViewAction" &&
        objAction["type"] === "Page"
      ) {
        if (objAction["method"] === "SelectTab") {
          if (!paramDic.hasOwnProperty("tabPageid")) {
            const tabId = parseInt(paramDic["tab"]);
            let tabList = getTabPageList(pagelist);
            paramDic["tabPageid"] = tabList[tabId]
              ? tabList[tabId]["pageid"]
              : "";
          }
        }
      }
      if (objAction["method"] === "CallExternalApp") {
        //console.log(objPageDic['Title'], "..CallExternalApp >>", paramDic);
        if (
          paramDic["command"].indexOf("https://[") === 0 &&
          paramDic["command"].indexOf("?") > -1
        ) {
          paramDic["encryptparam"] = true;
        } else {
          paramDic["encryptparam"] = false;
        }
      }
    }
  }
}
function getTabPageList(pagelist) {
  let tablist = [];
  pagelist.forEach((page) => {
    if (page && page["parentid"] === "App") {
      tablist.push({ Title: page.Title, pageid: page.pageid });
    }
  });
  return tablist;
}

function makePageCacheList(pageList, projData) {
  let setCPD = false;
  if (!projData.hasOwnProperty("CreatedPageData")) {
    projData["CreatedPageData"] = [];
    setCPD = true;
  }

  // console.log("Bool Value ", setCPD);

  let pageError = false;
  let pageIdList = [];
  let pageCacheList = [];
  pageList.forEach((pageObj, index) => {
    if (pageObj) {
      //console.log("index: ",index, "*****", pageObj.pageid, pageObj['Title']);
      if (!pageObj.actions.hasOwnProperty("becameAwake")) {
        pageObj.actions["becameAwake"] = [];
      }
      if (!pageObj.actions.hasOwnProperty("swipeLR")) {
        pageObj.actions["swipeLR"] = [];
      }
      if (!pageObj.actions.hasOwnProperty("swipeRL")) {
        pageObj.actions["swipeRL"] = [];
      }
      if (!pageObj.hasOwnProperty("moduleName")) {
        pageObj["moduleName"] = "";
      }
      pageCacheList[pageObj.pageid] = pageObj;
      pageIdList.push(pageObj.pageid);
      populateActionData(pageObj, pageList, projData);

      if (setCPD) {
        const ts =
          pageObj["Document"][0]["key"] === "createddatetime"
            ? pageObj["Document"][0]["value"]
            : "";

        // console.log("This is TS");
        let cpageObj = {
          pageid: pageObj.pageid,
          pagename: pageObj["Title"],
          timestamp: ts,
        };
        projData["CreatedPageData"].push(cpageObj);
      }
    } else {
      console.log("Page-list index: ", index, "*****", pageObj);
      pageError = true;
    }
  });

  return { cachelist: pageCacheList, idlist: pageIdList, error: pageError };
}

function validatePageIds(pageIdList, pageList) {
  let duplicatePageTitle = "";

  const uniquePageIdlist = [...new Set(pageIdList)];
  if (uniquePageIdlist.length !== pageIdList.length) {
    let duplicatesPageIdlist = [...pageIdList];
    uniquePageIdlist.forEach((item) => {
      const i = duplicatesPageIdlist.indexOf(item);
      duplicatesPageIdlist = duplicatesPageIdlist
        .slice(0, i)
        .concat(duplicatesPageIdlist.slice(i + 1, duplicatesPageIdlist.length));
    });

    pageList.filter(function (node, index) {
      if (duplicatesPageIdlist.indexOf(node["pageid"]) > -1) {
        duplicatePageTitle =
          duplicatePageTitle.length === 0
            ? node["Title"]
            : duplicatePageTitle + ", " + node["Title"];
        return true;
      }
      return false;
    });
  }
  return duplicatePageTitle;
}

function validateScreenData(appData, pageList) {
  const screenCount = appData["availableScreens"]
    ? appData["availableScreens"].length
    : 1;
  for (let i = 0; i < pageList.length; i++) {
    let pagedata = pageList[i];
    if (pagedata["_navigationBars"].length !== screenCount) {
      return false;
    }
  }
  return true;
}

function manipulatePageData(pages, level, arrPageData, parentPageids) {
  let appendPages = [];
  let pendingNodes = [];
  let nextParentNodePageids = [];

  for (let i = 0; i < pages.length; i++) {
    const pageContainerDic = pages[i];
    if (pageContainerDic) {
      if (!pageContainerDic.hasOwnProperty("parentid")) {
        pageContainerDic["parentid"] = "App";
      }

      if (!parentPageids && pageContainerDic.parentid === "App") {
        appendPages.push(pageContainerDic);
        nextParentNodePageids.push(pageContainerDic.pageid);
        //lastTabBasedPageid = pageContainerDic.pageid;
      } else if (
        parentPageids &&
        parentPageids.indexOf(pageContainerDic.parentid) >= 0
      ) {
        appendPages.push(pageContainerDic);
        nextParentNodePageids.push(pageContainerDic.pageid);
      } else {
        pendingNodes.push(pageContainerDic);
      }
    }
  }

  if (appendPages.length > 0) {
    if (appendPages[0].parentid !== "App")
      appendPages.sort(function (a, b) {
        return a.pageid - b.pageid;
      });

    for (let j = 0; j < appendPages.length; j++) {
      arrPageData = setPageLevel(appendPages[j], level, arrPageData);
    }
  }

  level = level + 1;
  if (pendingNodes.length > 0 && nextParentNodePageids.length > 0) {
    manipulatePageData(pendingNodes, level, arrPageData, nextParentNodePageids);
    return;
  } else if (pendingNodes.length > 0) {
    console.log("... zombie nodes:", pendingNodes);
    getZombiesParent(pendingNodes, appendPages);
    return;
  }
}
function setPageLevel(_page, _level, arrLevel) {
  arrLevel.push({
    level: _level,
    id: _page.pageid,
    title: _page.Title,
    parent: _page.parentid,
    type: _page.viewType,
    children: [],
    childcount: 0,
    page: _page,
  });
  return arrLevel;
}

function getZombiesParent(zombienodes, pages) {
  console.log("... zombie parents:", pages);
}

function setPageHeirarchy(arrPageLevel) {
  let _pageHeirarchy = [];

  var _lastNodelevel = arrPageLevel[arrPageLevel.length - 1].level;
  do {
    _pageHeirarchy = setPageData(arrPageLevel, _lastNodelevel);
    _lastNodelevel = _lastNodelevel - 1;
  } while (_lastNodelevel > 0);

  return _pageHeirarchy;
}
function setPageData(_arrpage, _level) {
  let _nodePages = _arrpage.filter(function (node) {
    return node.level === _level;
  });

  let _branchPages = _arrpage.filter(function (branch) {
    return branch.level === _level - 1;
  });

  _nodePages.forEach((node) => {
    _branchPages.forEach((item) => {
      if (node.type === "SplitView") {
        node.childcount = node.page.pages.length;
      }
      if (item.id === node.parent) {
        item.children.push(node);
        item.childcount = item.children.length;
      }
    });
  });

  return _arrpage;
}

function manageMultiScreen_pageBarsDefs(pageDef, screens) {
  let _navbars =
    !pageDef.hasOwnProperty("_navigationBars") ||
    pageDef["_navigationBars"]["length"] === 0
      ? false
      : true;
  if (!_navbars) {
    pageDef["_navigationBars"] = [];
    pageDef["_navigationBars"].push({
      barHidden: false,
      barStyle: "Default",
      translucent: false,
      tintColor: { alpha: 1, red: 0, green: 0, blue: 0, colorName: "" },
      title: pageDef["Title"],
      titleView: { srcLocation: "bundle", filename: "", fileext: "", url: "" },
      prompt: "",
      promptFontSize: 16,
      leftBarButton: {
        chosenOption: "Default",
        type: "",
        text: "",
        style: "Plain",
        systemItem: "",
        flex: false,
        imagefile: {
          srcLocation: "bundle",
          filename: "",
          fileext: "",
          url: "",
          imageName: "",
          author: "",
          copyright: "",
        },
        actions: { clicked: [], flickLR: [], flickRL: [] },
      },
      backBarButton: {
        chosenOption: "Default",
        type: "",
        text: "",
        style: "Plain",
        systemItem: "",
        flex: false,
        imagefile: {
          srcLocation: "bundle",
          filename: "",
          fileext: "",
          url: "",
          imageName: "",
          author: "",
          copyright: "",
        },
        actions: { clicked: [], flickLR: [], flickRL: [] },
      },
      rightBarButton: {
        chosenOption: "Default",
        type: "",
        text: "",
        style: "Plain",
        systemItem: "",
        flex: false,
        imagefile: {
          srcLocation: "bundle",
          filename: "",
          fileext: "",
          url: "",
          imageName: "",
          author: "",
          copyright: "",
        },
        actions: { clicked: [], flickLR: [], flickRL: [] },
      },
    });
  } else {
    const navbars = pageDef["_navigationBars"];
    if (navbars.length > screens.length) {
      //navbars.splice(1, 1);
      pageDef["_navigationBars"] = navbars.slice(0, screens.length);
    }
  }

  let _tabbars =
    !pageDef.hasOwnProperty("_tabBarHiddens") ||
    pageDef["_tabBarHiddens"]["length"] === 0
      ? false
      : true;
  if (!_tabbars) {
    pageDef["_tabBarHiddens"] = [true];
  } else {
    const tabbars = pageDef["_tabBarHiddens"];
    if (tabbars && tabbars.length > screens.length) {
      //tabbars.splice(1, 1);
      pageDef["_tabBarHiddens"] = tabbars.slice(0, screens.length);
    }
  }

  const screenObj = screens[0];
  const lastscrIndex = screens.length - 1;

  let _tbTop =
    !pageDef.hasOwnProperty("_toolBarTop") ||
    pageDef["_toolBarTop"]["length"] === 0
      ? false
      : true;
  if (!_tbTop) {
    console.log("Page don't have '_toolBarTop' def...........");
    const toptoolbarObj = {
      viewType: "toolbar",
      name: "",
      value: "",
      view: "",
      barPosition: "top",
      tableData: [],
      hidden: true,
      fixed: false,
      backgroundColor: {
        alpha: 1,
        red: 0.5568627450980392,
        green: 0.6509803921568628,
        blue: 0.7803921568627451,
        colorName: "",
      },
      Children: [],
      Document: [],
      frame: {
        x: 0,
        y: 0,
        z: 0,
        width: parseInt(screenObj["width"]),
        height: 40,
        depth: 0,
        rotation: 0,
        minWidth: 0,
        maxWidth: 0,
        minHeight: 0,
        maxHeight: 0,
        isLocked: false,
        relative: false,
      },
      _enabledOnScreen: true,
    };
    pageDef["_toolBarTop"] = [];
    pageDef["_toolBarTop"].push(toptoolbarObj);
  } else {
    const toptoolbars = pageDef["_toolBarTop"];
    if (toptoolbars && toptoolbars.length > screens.length) {
      pageDef["_toolBarTop"] = toptoolbars.slice(0, screens.length);

      toptoolbars[lastscrIndex]["frame"]["width"] =
        screens[lastscrIndex]["width"];
    }
  }

  let _tbBottom =
    !pageDef.hasOwnProperty("_toolBarBottom") ||
    pageDef["_toolBarBottom"]["length"] === 0
      ? false
      : true;
  if (!_tbBottom) {
    console.log("Page don't have '_toolBarBottom' def...........");
    const bottomtoolbarObj = {
      viewType: "toolbar",
      name: "",
      value: "",
      view: "",
      barPosition: "bottom",
      tableData: [],
      hidden: true,
      fixed: false,
      backgroundColor: {
        alpha: 1,
        red: 0.5568627450980392,
        green: 0.6509803921568628,
        blue: 0.7803921568627451,
        colorName: "",
      },
      Children: [],
      Document: [],
      frame: {
        x: 0,
        y: 0,
        z: 0,
        width: parseInt(screenObj["width"]),
        height: 40,
        depth: 0,
        rotation: 0,
        minWidth: 0,
        maxWidth: 0,
        minHeight: 0,
        maxHeight: 0,
        isLocked: false,
        relative: false,
      },
      _enabledOnScreen: true,
    };
    pageDef["_toolBarBottom"] = [];
    pageDef["_toolBarBottom"].push(bottomtoolbarObj);
  } else {
    const btmtoolbars = pageDef["_toolBarBottom"];
    if (btmtoolbars && btmtoolbars.length > screens.length) {
      pageDef["_toolBarBottom"] = btmtoolbars.slice(0, screens.length);

      btmtoolbars[lastscrIndex]["frame"]["width"] =
        screens[lastscrIndex]["width"];
    }
  }

  let _tbLeft =
    !pageDef.hasOwnProperty("_toolBarLeft") ||
    pageDef["_toolBarLeft"]["length"] === 0
      ? false
      : true;
  if (!_tbLeft) {
    console.log("Page don't have '_toolBarLeft' def...........");
    const lefttoolbarObj = {
      viewType: "toolbar",
      name: "",
      value: "",
      view: "FreeLayout",
      barPosition: "left",
      tableData: [],
      hidden: true,
      fixed: false,
      backgroundColor: {
        alpha: 1,
        red: 0.5568627450980392,
        green: 0.6509803921568628,
        blue: 0.7803921568627451,
        colorName: "",
      },
      Children: [],
      Document: [],
      frame: {
        x: 0,
        y: 0,
        z: 0,
        width: parseInt(screenObj["width"] * 0.75),
        height: screenObj["height"],
        depth: 0,
        rotation: 0,
        minWidth: 0,
        maxWidth: 0,
        minHeight: 0,
        maxHeight: 0,
        isLocked: false,
        relative: false,
      },
      _enabledOnScreen: true,
    };
    pageDef["_toolBarLeft"] = [];
    pageDef["_toolBarLeft"].push(lefttoolbarObj);
  } else {
    const lfttoolbars = pageDef["_toolBarLeft"];
    if (lfttoolbars && lfttoolbars.length > screens.length) {
      pageDef["_toolBarLeft"] = lfttoolbars.slice(0, screens.length);
    }
  }

  let _tbRight =
    !pageDef.hasOwnProperty("_toolBarRight") ||
    pageDef["_toolBarRight"]["length"] === 0
      ? false
      : true;
  if (!_tbRight) {
    console.log("Page don't have '_toolBarRight' def...........");
    const righttoolbarObj = {
      viewType: "toolbar",
      name: "",
      value: "",
      view: "FreeLayout",
      barPosition: "right",
      tableData: [],
      hidden: true,
      fixed: false,
      backgroundColor: {
        alpha: 1,
        red: 0.5568627450980392,
        green: 0.6509803921568628,
        blue: 0.7803921568627451,
        colorName: "",
      },
      Children: [],
      Document: [],
      frame: {
        x: 0,
        y: 0,
        z: 0,
        width: parseInt(screenObj["width"] * 0.75),
        height: screenObj["height"],
        depth: 0,
        rotation: 0,
        minWidth: 0,
        maxWidth: 0,
        minHeight: 0,
        maxHeight: 0,
        isLocked: false,
        relative: false,
      },
      _enabledOnScreen: true,
    };
    pageDef["_toolBarRight"] = [];
    pageDef["_toolBarRight"].push(righttoolbarObj);
  } else {
    const rgttoolbars = pageDef["_toolBarRight"];
    if (rgttoolbars && rgttoolbars.length > screens.length) {
      pageDef["_toolBarRight"] = rgttoolbars.slice(0, screens.length);
    }
  }
}

function managePageDefinition(pageDef, projectData, screenIndex) {
  let pageObj = JSON.parse(JSON.stringify(pageDef[0])); //pageDef[0];
  if (!pageObj) {
    return pageDef[0];
  }
  /* else if(pageObj['pageid'] === "29") {
    let pageStr = JSON.stringify(pageObj);
    let re = /page_711/gi;
    pageStr = pageStr.replace(re, "page_29");
    pageObj = JSON.parse(pageStr);
    console.log(pageObj, "**************************************", pageStr);
    pageDef = [];
    pageDef.push(pageObj);
    return pageDef;
  } */
  if (!pageObj.hasOwnProperty("Containers")) {
    pageObj["Containers"] = [
      { name: "container1", title: "container1", selected: true },
    ];
  } else if (pageObj["Containers"]) {
    pageObj["Containers"][0]["selected"] = true;
  }

  const screensData = projectData["availableScreens"];
  const screenObj = screensData[screenIndex];
  manageMultiScreen_pageBarsDefs(pageObj, screensData);
  if (pageObj._navigationBars) {
    for (let i = 0; i < screensData.length; i++) {
      if (
        pageObj._navigationBars[i] &&
        pageObj._navigationBars[i].prompt === undefined
      ) {
        pageObj._navigationBars[i].prompt = "";
      }
    }
  }

  if (pageObj["viewType"] === "ScrollView") {
    if (pageObj.Children.length > 1) {
      pageObj.Children.splice(1, 1);
    }
    pageObj.Children[0]["viewType"] = "ScrollView";
    if (pageObj.Children[0]["_frames"]) {
      if (pageObj.Children[0]["_frames"].length > screensData.length) {
        pageObj.Children[0]["_frames"].splice(1, 1);
      } else {
        const _frameLen = pageObj.Children[0]["_frames"].length;
        const _scrDiff =
          screensData.length - pageObj.Children[0]["_frames"].length;
        for (let f = 0; f < _scrDiff; f++) {
          let frameId = _frameLen + f;
          pageObj.Children[0]["_frames"][frameId] = JSON.parse(
            JSON.stringify(pageObj.Children[0]["_frames"][0])
          );
          pageObj.Children[0]["_frames"][frameId]["width"] =
            screensData[frameId]["width"];
          pageObj.Children[0]["_frames"][frameId]["height"] =
            screensData[frameId]["height"];
        }
      }
      if (pageObj.Children[0]["_frames"][screenIndex]["width"] === 0) {
        pageObj.Children[0]["frame"]["width"] = screenObj["width"];
        pageObj.Children[0]["frame"]["height"] = screenObj["height"];
        pageObj.Children[0]["_frames"][screenIndex]["width"] =
          screenObj["width"];
        pageObj.Children[0]["_frames"][screenIndex]["height"] =
          screenObj["height"];
      }
    } else {
      pageObj.Children[0]["_frames"] = [];
      pageObj.Children[0]["_frames"].push(pageObj.Children[0]["frame"]);
    }
  } else {
    if (pageObj["viewType"] === "DbTableViewNestedList") {
      pageObj["NavigationBarHidden"] = true;
    } else if (pageObj["viewType"].indexOf("TableView") > -1) {
      if (pageObj.Children.length > 1) {
        pageObj.Children.splice(1, 1);
      }
      pageObj.Children[0]["Children"] = [];
      if (
        pageObj.Children[0] &&
        !pageObj.Children[0].hasOwnProperty("accRecordsCount")
      ) {
        pageObj.Children[0]["accRecordsCount"] = true;
      }
      if (!pageObj.Children[0]["accHeaderBorderWeight"]) {
        pageObj.Children[0]["accHeaderBorderWeight"] = 1;
      }
      pageObj.Children[0]["tmpCellStyle"] =
        pageObj.Children[0]["_tmpCellStyle"];
      pageObj.Children[0].Group[0]["RecordCellDef"]["CellStyle"] =
        pageObj.Children[0]["_tmpCellStyle"];
      if (pageObj.Children[0].Group[0]["rowarray"].length === 0) {
        pageObj.Children[0].Group[0]["rowarray"].push(
          pageObj.Children[0].Group[0]["RecordCellDef"]
        );
      } else {
        if (pageObj["viewType"].indexOf("TableViewList") > -1) {
          /* if(pageObj.Children[0].Group[0]['RecordCells'] && pageObj.Children[0].Group[0]['RecordCells'].length === 0) {
            pageObj.Children[0].Group[0]['RecordCells'].push(pageObj.Children[0].Group[0]['RecordCellDef']);
          } */
          if (
            pageObj.Children[0].Group[0]["RecordCells"] &&
            pageObj.Children[0].Group[0]["RecordCells"].length > 0
          ) {
            pageObj.Children[0].Group[0]["RecordCells"] = [];
          }

          pageObj.Children[0].Group[0]["RecordCellDef"]["accessoryType"] =
            pageObj.Children[0].Group[0]["RecordCellDef"][
              "editingAccessoryType"
            ];
          pageObj.Children[0].Group[0]["rowarray"][0]["editingAccessoryType"] =
            pageObj.Children[0].Group[0]["RecordCellDef"][
              "editingAccessoryType"
            ];
          pageObj.Children[0].Group[0]["rowarray"][0]["accessoryType"] =
            pageObj.Children[0].Group[0]["RecordCellDef"]["accessoryType"];
          pageObj.Children[0].Group[0]["rowarray"][0]["actions"] =
            pageObj.Children[0].Group[0]["RecordCellDef"]["actions"];
          pageObj.Children[0].Group[0]["rowarray"][0]["CellStyle"] =
            pageObj.Children[0].Group[0]["RecordCellDef"]["CellStyle"];
          if (
            pageObj.Children[0].Group[0]["RecordCellDef"]["CellStyle"] ===
            "custom"
          ) {
            pageObj.Children[0].Group[0]["rowarray"][0]["Fields"] =
              pageObj.Children[0].Group[0]["RecordCellDef"]["Fields"];
          }
        }
      }

      if (!pageObj.Children[0].hasOwnProperty("showDivider")) {
        pageObj.Children[0]["showDivider"] = true;
      }
    }
  }

  if (pageObj.hasOwnProperty("_toolBarTop")) {
    for (let index = 0; index < screensData.length; index++) {
      let toolbarTopObj = pageObj["_toolBarTop"][index];
      if (toolbarTopObj) {
        for (let x = 0; x < toolbarTopObj["Children"].length; x++) {
          let ttopUIparts = toolbarTopObj["Children"][x]["uiParts"];
          if (ttopUIparts && ttopUIparts.length > 0) {
            if (ttopUIparts.length > screensData.length) {
              ttopUIparts.splice(screensData.length);
            }

            if (ttopUIparts[index]) {
              if (!ttopUIparts[index].hasOwnProperty("viewType")) {
                ttopUIparts[index] = ttopUIparts[0];
              }
            }
          }
        }
      }
    }
  }

  if (pageObj.hasOwnProperty("_toolBarLeft")) {
    for (let index = 0; index < screensData.length; index++) {
      let _scrObj = screensData[index];
      let toolbarLeftObj = pageObj["_toolBarLeft"][index];
      if (toolbarLeftObj) {
        if (toolbarLeftObj.hasOwnProperty("frame")) {
          if (toolbarLeftObj["view"] === "FreeLayout") {
            toolbarLeftObj["frame"]["height"] = _scrObj.height;
          }
        }
        if (!toolbarLeftObj.hasOwnProperty("tableData")) {
          toolbarLeftObj["tableData"] = [];
        }
        if (!toolbarLeftObj.hasOwnProperty("fixed")) {
          toolbarLeftObj["fixed"] = false;
        }
      }
    }
  }

  if (pageObj.hasOwnProperty("_toolBarRight")) {
    //console.log(screensData, "'_toolBarRight' def......>>> ", pageObj['_toolBarRight']);
    for (let index = 0; index < screensData.length; index++) {
      let _scrObj = screensData[index];
      let toolbarRightObj = pageObj["_toolBarRight"][index];
      if (toolbarRightObj) {
        if (toolbarRightObj.hasOwnProperty("frame")) {
          if (!toolbarRightObj["frame"]) {
            console.log("'_toolBarRight' frame is null");
            toolbarRightObj["frame"] = {
              x: 0,
              y: 0,
              z: 0,
              width: parseInt(screenObj["width"] * 0.75),
              height: screenObj["height"],
              depth: 0,
              rotation: 0,
              minWidth: 0,
              maxWidth: 0,
              minHeight: 0,
              maxHeight: 0,
              isLocked: false,
              relative: false,
            };
          }
          if (toolbarRightObj["frame"]["width"] === 0) {
            toolbarRightObj["frame"]["width"] = Math.ceil(_scrObj.width * 0.75);
          }
          if (toolbarRightObj["frame"]["height"] === 0) {
            toolbarRightObj["frame"]["height"] = _scrObj.height;
          }
        }

        if (!toolbarRightObj.hasOwnProperty("tableData")) {
          toolbarRightObj["tableData"] = [];
        }
        if (!toolbarRightObj.hasOwnProperty("fixed")) {
          toolbarRightObj["fixed"] = false;
        }
      }
    }
  }

  if (pageObj.hasOwnProperty("pageOverlay")) {
    let fieldscount = [];
    const overlayChildren = pageObj.pageOverlay.Children;
    for (let index = 0; index < screensData.length; index++) {
      let _scrObj = screensData[index];
      if (overlayChildren && overlayChildren.length > 0) {
        overlayChildren.forEach((dialogDef) => {
          if (
            dialogDef["uiParts"] &&
            dialogDef["uiParts"].length > screensData.length
          ) {
            const _sid = getIndex_unwantedData(
              dialogDef["uiParts"],
              screensData.length
            );
            dialogDef["uiParts"].splice(_sid, 1);

            console.log(
              pageObj["Title"],
              ": Page-overlay > extra definitions there."
            );
          }
          if (dialogDef["viewType"] === "Dialog") {
            delete dialogDef["selected"];
            let dialogParts = dialogDef["uiParts"][index];

            dialogParts["frame"]["maxHeight"] = _scrObj["height"];
            dialogParts["frame"]["height"] = _scrObj["height"];
            dialogParts["frame"]["maxWidth"] = _scrObj["width"];
            dialogParts["frame"]["width"] = _scrObj["width"];
            dialogParts["dataarray"][0]["width"] = _scrObj["width"];

            let uipartshaveissue = false;
            let _fields = [];
            let dialogUIChildren = dialogParts["dataarray"][0]["Fields"];
            for (let dc = 0; dc < dialogUIChildren.length; dc++) {
              const uiChild = dialogUIChildren[dc];
              delete uiChild["selected"];
              if (
                uiChild["uiParts"] &&
                uiChild["uiParts"].length > screensData.length
              ) {
                uiChild["uiParts"].splice(screensData.length);
              } else if (uiChild["uiParts"].length === 0) {
                console.log(
                  "Screen:",
                  index,
                  "Dialog UI > 'uiParts' is empty.",
                  dc
                );
                if (index === 0) {
                  dialogUIChildren.splice(dc, 1);
                } else {
                  uipartshaveissue = true;
                }
              }
              _fields.push({
                index: dc,
                name: uiChild["uiParts"][index]["name"],
                child: uiChild,
              });
            }
            fieldscount.push({
              index: index,
              count: dialogUIChildren.length,
              fields: _fields,
            });

            if (uipartshaveissue && screensData.length > 1) {
              let masterdialogParts = dialogDef["uiParts"][0];
              let masterdialogUIChildren =
                masterdialogParts["dataarray"][0]["Fields"];

              let slavedialogParts = dialogDef["uiParts"][1];
              slavedialogParts["dataarray"][0]["Fields"] = JSON.parse(
                JSON.stringify(masterdialogUIChildren)
              );
            }
          }
        });
      }
    }
    // HOTFIX, need to remove it later
    if (fieldscount.length > 1) {
      console.log(screensData.length, "...fieldscount:", fieldscount);
      if (fieldscount[0]["count"] > fieldscount[1]["count"]) {
        const arrayOne = fieldscount[0]["fields"];
        const arrayTwo = fieldscount[1]["fields"];
        const results = arrayOne.filter(
          ({ name: id1 }) => !arrayTwo.some(({ name: id2 }) => id2 === id1)
        );
        //console.log(arrayOne, arrayTwo, "...fieldscount:", results);
        if (results.length > 0) {
          let _nFields = [];
          //const abc = [...new Set(arrayTwo)];
          const abc = uniqArraybykey(arrayTwo, (item) => item.name);
          abc.forEach((element) => {
            _nFields.push(element["child"]);
          });
          results.forEach((element) => {
            _nFields.push(element["child"]);
          });
          console.log(arrayTwo, "****", abc, results, "...fields:", _nFields);
          overlayChildren[0].uiParts[1]["dataarray"][0]["Fields"] = _nFields;
        }
      }
    }
  }

  if (pageObj.hasOwnProperty("TabBase")) {
    pageObj["IconTitle"] = pageObj["TabBase"]["icontitle"];
    pageObj["Icon"] = pageObj["TabBase"]["icon"];
  }

  // console.log(pageDef, "**************************************", pageObj);
  return [pageObj];
}
function getIndex_unwantedData(uiPartsArr, count) {
  for (let i = 0; i < uiPartsArr.length; i++) {
    let dialogParts = uiPartsArr[i];
    let dialogUIChildren = dialogParts["dataarray"][0]["Fields"];
    for (let d = 0; d < dialogUIChildren.length; d++) {
      const uiChild = dialogUIChildren[d];
      if (uiChild["uiParts"] && uiChild["uiParts"].length < count) {
        return i;
      }
    }
  }

  const diff = uiPartsArr.length - count;
  return diff > 0 ? diff : 0;
}

function uniqArraybykey(arr, key) {
  return [...new Map(arr.map((x) => [key(x), x])).values()];
}

function manageMultiScreenDefs(projectData, pageArray) {
  //const isMasterScreenSet = projectData['isMasterScreenSet'];
  let masterScrIndex = 0;
  const screensData = projectData["availableScreens"];
  const screenCount = screensData.length;
  if (screenCount > 1) {
    for (let i = 0; i < screenCount; i++) {
      const screenObj = screensData[i];
      if (screenObj["embed"]) {
        masterScrIndex = i;
        break;
      }
    }
  } else {
    return "remove";
  }
  //console.log(pageArray, ".... manageMultiScreenDefs >>>>", masterScrIndex, screensData);

  let newScrIndex = screenCount - 1;
  let newScreen = screensData[newScrIndex];
  if (masterScrIndex === newScrIndex) masterScrIndex = 0;
  let masterScreen = screensData[masterScrIndex];

  let scaleW = newScreen.width / masterScreen.width;
  let scaleH = newScreen.height / masterScreen.height;

  for (let j = 0; j < pageArray.length; j++) {
    let pageObj = pageArray[j];
    //console.log(pageObj['Title'], ">>>>>>>>", pageObj);

    if (pageObj.viewType === "ScrollView") {
      let scrollFrames = pageObj.Children[0]["_frames"];
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

    if (pageObj._navigationBars) {
      if (pageObj._navigationBars.length > screenCount) {
        pageObj._navigationBars.splice(screenCount);
      } else {
        const navbarObj = pageObj._navigationBars[0];
        const navbarDiff = screenCount - pageObj._navigationBars.length;
        for (let nb = 0; nb < navbarDiff; nb++) {
          pageObj._navigationBars.push(navbarObj);
        }
      }
    }

    if (pageObj._tabBarHiddens) {
      if (pageObj._tabBarHiddens.length > screenCount) {
        pageObj._tabBarHiddens.splice(screenCount);
      } else {
        const tabbarObj = pageObj._tabBarHiddens[0];
        const tabbarDiff = screenCount - pageObj._tabBarHiddens.length;
        for (let tb = 0; tb < tabbarDiff; tb++) {
          pageObj._tabBarHiddens.push(tabbarObj);
        }
      }
    }

    if (pageObj._toolBarTop.length > screenCount) {
      pageObj._toolBarTop.splice(screenCount);
    } else {
      const toptbarObj = pageObj._toolBarTop[0];
      const toptbarDiff = screenCount - pageObj._toolBarTop.length;
      for (let ttb = 0; ttb < toptbarDiff; ttb++) {
        pageObj._toolBarTop.push(toptbarObj);
      }
    }

    if (pageObj._toolBarBottom.length > screenCount) {
      pageObj._toolBarBottom.splice(screenCount);
    } else {
      const bottomtbarObj = pageObj._toolBarBottom[0];
      const bottomtbarDiff = screenCount - pageObj._toolBarBottom.length;
      for (let btb = 0; btb < bottomtbarDiff; btb++) {
        pageObj._toolBarBottom.push(bottomtbarObj);
      }
    }

    if (pageObj._toolBarLeft.length > screenCount) {
      pageObj._toolBarLeft.splice(screenCount);
    } else {
      const lefttbarObj = pageObj._toolBarLeft[0];
      const lefttbarDiff = screenCount - pageObj._toolBarLeft.length;
      for (let ltb = 0; ltb < lefttbarDiff; ltb++) {
        pageObj._toolBarLeft.push(lefttbarObj);
      }
    }

    if (pageObj._toolBarRight) {
      if (pageObj._toolBarRight.length > screenCount) {
        pageObj._toolBarRight.splice(screenCount);
      } else {
        const righttbarObj = pageObj._toolBarRight[0];
        const righttbarDiff = screenCount - pageObj._toolBarRight.length;
        for (let rtb = 0; rtb < righttbarDiff; rtb++) {
          pageObj._toolBarRight.push(righttbarObj);
        }
      }
    } else {
      const righttoolbarObj = {
        viewType: "toolbar",
        name: "",
        value: "",
        view: "FreeLayout",
        barPosition: "right",
        tableData: [],
        hidden: true,
        backgroundColor: {
          alpha: 1,
          red: 0.5568627450980392,
          green: 0.6509803921568628,
          blue: 0.7803921568627451,
          colorName: "",
        },
        Children: [],
        Document: [],
        frame: {
          x: 0,
          y: 0,
          z: 0,
          width: parseInt(pageObj["frame"]["width"] * 0.75),
          height: pageObj["frame"]["height"],
          depth: 0,
          rotation: 0,
          minWidth: 0,
          maxWidth: 0,
          minHeight: 0,
          maxHeight: 0,
          isLocked: false,
          relative: false,
        },
        _enabledOnScreen: true,
      };

      pageObj["_toolBarRight"] = [];
      for (let i = 0; i < screenCount; i++) {
        pageObj._toolBarRight.push(righttoolbarObj);
      }
    }

    if (pageObj.pageOverlay) {
      const overlayChildren = pageObj.pageOverlay.Children;
      if (overlayChildren.length > 0) {
        overlayChildren.forEach((ochild) => {
          if (ochild["viewType"] === "Dialog") {
            let _dialogUIparts = ochild["uiParts"];

            const dialogDiff = screenCount - _dialogUIparts.length;
            for (let d = 0; d < dialogDiff; d++) {
              const dialogObj = JSON.parse(JSON.stringify(_dialogUIparts[0]));
              dialogObj["frame"]["width"] = screensData[d + 1]["width"];
              dialogObj["frame"]["height"] = screensData[d + 1]["height"];
              _dialogUIparts.push(dialogObj);
            }
          }
        });
      }
    }

    pageObj = addScreenData_inUIparts(pageObj, masterScrIndex, scaleW, scaleH);
  }
}
function addScreenData_inUIparts(pagedata, masterScrIndex, scaleW, scaleH) {
  const scrIndex = 1;

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
      newPaddingObj["top"] = Math.ceil(newPaddingObj["top"] * scaleH);
      newPaddingObj["right"] = Math.ceil(newPaddingObj["right"] * scaleW);
      newPaddingObj["left"] = Math.ceil(newPaddingObj["left"] * scaleW);
      newPaddingObj["bottom"] = Math.ceil(newPaddingObj["bottom"] * scaleH);
      newUIObj["padding"] = newPaddingObj;
    }

    childrenUIparts.push(newUIObj);
  }
}

function validatePageData(_page, pagelist, screenIndex) {
  let _validationError = [];

  // console.log("Page data empty ", _page, pagelist, screenIndex);
  const pagetitle = _page["Title"];
  const allowedChars = /\w/g;
  let allowedName = pagetitle.match(allowedChars);
  if (pagetitle.length !== allowedName.length) {
    const _title = "'" + pagetitle + "'";
    _validationError.push({
      type: _title,
      message: "Page Title: Only alphabets, numbers & underscore allowed.",
      dismissAllow: false,
    });
  }

  let _pageTitleValidate = pagelist.filter(function (node) {
    if (node.Title === pagetitle) {
      return node;
    }
    return node.Title === pagetitle;
  });
  if (_pageTitleValidate.length > 1) {
    _validationError.push({
      type: pagetitle,
      message: "Same page 'Title' exist",
      dismissAllow: false,
    });
  }

  let arrUIpartName = [];
  let _pageUIs = getAllChildrenOnPage(_page, screenIndex);
  _pageUIs.forEach((uipart) => {
    arrUIpartName.push(uipart.uiParts[screenIndex]["name"]);
  });

  const uiPartsNoDuplicates = [...new Set(arrUIpartName)];
  if (uiPartsNoDuplicates.length !== arrUIpartName.length) {
    let duplicates = [...arrUIpartName];
    uiPartsNoDuplicates.forEach((item) => {
      const i = duplicates.indexOf(item);
      duplicates = duplicates
        .slice(0, i)
        .concat(duplicates.slice(i + 1, duplicates.length));
    });

    let duplicateStr = duplicates.join(", "); /* duplicates.toString();
    duplicateStr = duplicateStr.replaceAll(",", ", "); */

    //console.log(arrUIpartName, " validatePageData >>>>>>>>>>>>>>>>>", uiPartsNoDuplicates, duplicateStr);
    _validationError.push({
      type: duplicateStr,
      message: "UI(s) has duplicate name",
      dismissAllow: true,
    });
  }

  return _validationError;
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
      if (
        uiContainerDic["viewType"] === "TileList" &&
        uiContainerDic["uiParts"][scrIndex]
      ) {
        let arrTileItems =
          uiContainerDic["uiParts"][scrIndex].dataarray[0]["Fields"];
        for (let u = 0; u < arrTileItems.length; u++) {
          arrChildren.push(arrTileItems[u]);
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
          let _topToolbarUIContainerDic = _topToolbar.Children[t];
          let _topToolbarChildPartDic =
            _topToolbarUIContainerDic["uiParts"][scrIndex];
          if (_topToolbarChildPartDic) {
            if (!_topToolbarChildPartDic["_enabledOnScreen"]) continue;
          }
          arrChildren.push(_topToolbar.Children[t]);
          if (
            _topToolbar.Children[t]["viewType"] === "TileList" &&
            _topToolbar.Children[t]["uiParts"][scrIndex]
          ) {
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
      if (cntBottom === scrIndex) {
        for (let b = 0; b < _bottomToolbar.Children.length; b++) {
          let _bottomToolbarUIContainerDic = _bottomToolbar.Children[b];
          let _bottomToolbarChildPartDic =
            _bottomToolbarUIContainerDic["uiParts"][scrIndex];
          if (_bottomToolbarChildPartDic) {
            if (!_bottomToolbarChildPartDic["_enabledOnScreen"]) continue;
          }
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

  let cntRight = -1;
  if (_page._toolBarRight && _page._toolBarRight.length > 0) {
    _page._toolBarRight.forEach((_rightToolbar) => {
      cntRight++;
      if (cntRight === scrIndex) {
        for (let r = 0; r < _rightToolbar.Children.length; r++) {
          arrChildren.push(_rightToolbar.Children[r]);
          if (_rightToolbar.Children[r]["viewType"] === "TileList") {
            let arrrTileItems =
              _rightToolbar.Children[r]["uiParts"][scrIndex].dataarray[0][
                "Fields"
              ];
            for (let r0 = 0; r0 < arrrTileItems.length; r0++) {
              arrChildren.push(arrrTileItems[r0]);
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
        if (
          overlayChildren[o]["viewType"] === "Dialog" &&
          overlayChildren[o]["uiParts"][scrIndex]
        ) {
          let arrDialogItems =
            overlayChildren[o]["uiParts"][scrIndex].dataarray[0]["Fields"];
          for (let o0 = 0; o0 < arrDialogItems.length; o0++) {
            arrChildren.push(arrDialogItems[o0]);
          }
        }
      }
    }
  }

  return arrChildren;
}

const StyledTabs = withStyles({
  root: {
    minHeight: 32,
  },
  indicator: {
    display: "flex",
    height: "0.45rem",
    justifyContent: "center",
    backgroundColor: "#1faaa8",
  },
})((props) => <Tabs {...props} TabIndicatorProps={{ children: <div /> }} />);

const StyledTab = withStyles((theme) => ({
  root: {
    padding: 4,
    textTransform: "none",
    letterSpacing: 0,
    fontSize: "1.15rem",
    fontWeight: "600",
    minHeight: "2rem",
    "&:hover": {
      opacity: 1,
    },
    "&$selected": {
      color: "#1faaa8",
    },
    "&:focus": {
      opacity: 1,
    },
  },
  selected: {},
}))((props) => {
  const { onClose, tabid } = props;
  return (
    <div id="header" className="page-explorer-tab">
      <Tab disableRipple {...props} />
      <IconButton style={{ padding: 4 }} data-id={tabid} onClick={onClose}>
        <Close />
      </IconButton>
    </div>
  );
});

function mapStateToProps(state) {
  return {
    apiParam: state.appParam.params,
    pallete: state.appParam.pallete,
    isShrinkable: state.appParam.isShrinkable,
    appData: state.appData.data,
    contributorTabs: state.appData.contributortabs,
    pageList: state.appData.pagelist,
    currentPage: state.selectedData.pagedata,
    currentUI: state.selectedData.uidata,
    validationErrors: state.selectedData.validationErrors,
  };
}
export default connect(mapStateToProps)(AppEditor);
