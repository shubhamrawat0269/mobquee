import React, { useState } from "react";
import { connect, useDispatch } from "react-redux";
import "./PopupPageListStyle.css";
import {
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Paper,
  TextField,
  Typography,
  Tooltip,
  Popover,
  CircularProgress,
  IconButton,
} from "@mui/material";

import PageListView from "../../helpers/PageListView/PageListView";

import imgBaseViewSource from "../../../assets/pagetype/iconBaseView.png";
import imgScrollViewSource from "../../../assets/pagetype/iconScrollView.png";
import imgDbTableViewSource from "../../../assets/pagetype/iconDbTableView.png";
import imgDbTableViewListSource from "../../../assets/pagetype/iconDbTableViewList.png";
import imgRemoteTableViewSource from "../../../assets/pagetype/iconRemoteTableView.png";
import imgPageScrollViewSource from "../../../assets/pagetype/iconPageScrollView.png";
import AlertWindow from "../../../components/AlertWindow";

import {
  setPageList,
  setContributorTabs,
  setProjectData,
  setModuleName,
} from "../../ServiceActions";
import { getTabModuleAccess } from "../../helpers/Utility";
import { Cancel, Close, Help } from "@mui/icons-material";
import { capitalizeFirstLetter } from "../../../utils/utilsFunctions";

class PopupPageList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      isLoaded: false,

      pageDic: [],
      pages: [],
      pageCaches: [],
      pagelist: [],
      selectedPage: {},
      openpage: false,

      showmessage: false,
    };

    this.handlePopupClose = this.handlePopupClose.bind(this);
    //this.handlePageSelect = this.handlePageSelect.bind(this);
    this.handleOpenPage = this.handleOpenPage.bind(this);
    this.handleUpdatePagelist = this.handleUpdatePagelist.bind(this);
  }

  componentDidMount() {
    //this.setState({ open: this.props.open });
    this.fetchPageDic();
    //this.fetchPageData();
    this.setPageList(this.props.pageList);
  }

  fetchPageDic() {
    fetch("././config/PageViewDic.json")
      .then((res) => res.json())
      .then(
        (result) => {
          //console.log("Page View dic fetching result >>>", result);
          let pageView = result["PageView"];
          this.setState({ pageDic: pageView });
        },
        (error) => {
          console.log("Page View dic fetching error >>>", error);
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
          // { pages: [...], response: "ACK", count: 1, command: "pagelist" }
          if (result.response === "NACK") {
            var _err = { message: result.error };
            this.setState({
              isLoaded: true,
              error: _err,
            });
          } else {
            let _pages = result.pages;
            //_pages.sort(function(a, b){return a.pageid - b.pageid});
            //console.log("pages length :--", _pages.length);
            this.setPageList(_pages);
          }
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
  }

  setPageList(_pages) {
    let _pageCacheList = makePageCacheList(_pages);
    //console.log("_pageCacheList ::--", _pageCacheList);

    var arrPageData = [];
    let projectNode = {
      level: 0,
      title: this.props.projectdata.ProjectName,
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
    //console.log(_pageCacheList, "***** pageHeirarchy >>>>>>>>>>>>>>>>>>>>>>>>>>>>>. ", pageHeirarchy);

    this.setState({
      isLoaded: true,
      pages: _pages,
      pageCaches: _pageCacheList,
      pagelist: pageHeirarchy,
    });
  }

  //////////////////////////
  // Event Handlers
  /////////////////////////

  handlePopupClose = () => {
    this.setState({ isLoaded: false });

    // below is a callback function of parent component which passed as properties
    // please note it must be passed, otherwise issues.
    this.props.oncloseWindow({
      pagedata: this.state.pages,
      list: this.state.pagelist,
    });
  };

  handlePageSelect = (_page) => {
    //console.log("handlePageSelect >>", _page);
    this.setState({ selectedPage: _page });
  };

  handleOpenPage = () => {
    let _selectedPage = this.state.selectedPage;
    if (_selectedPage && _selectedPage.id) {
      //let pageid = _selectedPage.id;
      //console.log(_selectedPage, "open Page >>", this.state.pageCaches[pageid]);

      this.setState({ openpage: true });

      this.props.onOpenSelectedPage(_selectedPage);
      this.handlePopupClose();
    }
  };

  handleUpdatePagelist = (_data) => {
    /* if(_data['list'])
    {
      let _projectnode = _data['list'][0];
      if(_projectnode && _projectnode['id'] === "-1") {
        _data['list'].shift();
      }
    } */

    this.setState({ selectedPage: {} });
    this.setState({ pages: _data["pagedata"] });
    let _pageCacheList = makePageCacheList(_data["pagedata"]);
    this.setState({ pageCaches: _pageCacheList });
    this.setState({ pagelist: _data["list"] });
    //console.log(_data, "<<<<<< handleUpdatePagelist >>", _pageCacheList);

    this.props.dispatch(setPageList(_data["pagedata"]));
    this.props.onUpdatePagelist(_data);

    /*let _projectData = this.props.projectdata;
    _projectData['isPreview'] = "0";
    this.props.dispatch(setProjectData(_projectData));
    updateProjectData(this.props, _projectData, 'isPreview');*/
  };

  handleUpdateOwnerTabs(page, update) {
    let _projectData = this.props.projectdata;
    if (_projectData.hasOwnProperty("Contributors")) {
      const contributors = _projectData["Contributors"];
      if (contributors && contributors.length > 1) {
        // means 'contributor added, then only consider project as "multi-dev"
        for (let i = 0; i < contributors.length; i++) {
          const node = contributors[i];
          if (
            node["contributorName"] === _projectData["owner"] &&
            node["contributorProjectid"] === _projectData["projectid"]
          ) {
            // means owner - project

            let _selectedtabs = this.props["contributorTabs"];
            if (update === "add") {
              if (page && page["parentid"] === "App") {
                if (_selectedtabs) {
                  _selectedtabs.push(page["pageid"]);
                }
              }
            } else if (update === "delete") {
              //const index = _selectedtabs.indexOf(page);
              const index = _selectedtabs.indexOf(page["pageid"]);
              if (index > -1) {
                _selectedtabs.splice(index, 1);
              }
            }

            if (
              _selectedtabs.length > 1 &&
              _selectedtabs.indexOf("none") > -1
            ) {
              const noneindex = _selectedtabs.indexOf("none");
              if (noneindex > -1) {
                _selectedtabs.splice(noneindex, 1);
              }
            } else {
              _selectedtabs.push("none");
            }
            this.props.dispatch(setContributorTabs(_selectedtabs));

            node["selectTabPages"] = _selectedtabs;

            // update 'TabsOrder'
            updateTabsOrder(this.props, _projectData, page, update);

            /*_projectData['isPreview'] = "0";
            this.props.dispatch(setProjectData(_projectData));            
            saveAppData(this.props, _projectData);*/

            console.log("Project 'preview' is must");
            this.setState({ showmessage: true });
          }
        }

        _projectData["isPreview"] = "0";
        updateCreateDeletePageData(page, _projectData, update);
        this.props.dispatch(setProjectData(_projectData));
        saveAppData(this.props, _projectData);
      } else {
        // update 'TabsOrder' whether it is multi-dev or not
        this.handleEditPageHeirarchy(page, update);
      }
    }
  }

  handleEditPageHeirarchy(page, update) {
    let _projectData = this.props.projectdata;
    updateTabsOrder(this.props, _projectData, page, update);
    _projectData["isPreview"] = "0";
    this.props.dispatch(setProjectData(_projectData));
    updateProjectData(this.props, _projectData, "TabsOrder,isPreview");
  }

  messageCloseHandler() {
    this.setState({ showmessage: false });
  }

  ///////////////////////////////////////////////////////////////////////////

  render() {
    const { error, isLoaded } = this.state;
    // console.log("Module Name", this.props.moduleName);
    const paramPage = { pagedata: this.state.pages, list: this.state.pagelist };
    const appConfig = this.props.appconfig;
    const projectdata = this.props.projectdata;
    const disableOK = this.state.selectedPage["id"] ? false : true;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return (
        <div>
          <Dialog
            aria-labelledby="customized-dialog-title"
            open={!isLoaded}
            fullWidth={true}
            maxWidth="xs"
          >
            <DialogContent>
              <h4>Loading...</h4>
            </DialogContent>
          </Dialog>
        </div>
      );
    } else {
      return (
        <div>
          {this.props.popupstate === "pagelist-new" ? (
            <Dialog
              draggable="false"
              open={isLoaded}
              scroll="paper"
              fullWidth={true}
              maxWidth="lg"
            >
              <DialogTitle id="customized-dialog-title">
                <h4>{this.props.title}</h4>
                <IconButton
                  className="content-close-icon"
                  aria-label="Close"
                  onClick={this.handlePopupClose}
                >
                  <Close />
                </IconButton>
              </DialogTitle>

              <DialogContent dividers>
                <ManagePageList
                  moduleName={this.props.moduleName}
                  globalData={this.props}
                  paramPage={paramPage}
                  pageDic={this.state.pageDic}
                  pageCaches={this.state.pageCaches}
                  appConfig={appConfig}
                  projectdata={projectdata}
                  onPageSelection={this.handlePageSelect}
                  onListUpdate={this.handleUpdatePagelist}
                  onUpdateOwnerTabs={this.handleUpdateOwnerTabs.bind(this)}
                  onEditPageHeirarchy={this.handleEditPageHeirarchy.bind(this)}
                />
              </DialogContent>
              <DialogActions>
                {this.state.showmessage && (
                  <div
                    style={{
                      position: "absolute",
                      left: 40,
                      width: 420,
                      display: "flex",
                      justifyContent: "space-around",
                      borderWidth: 8,
                      backgroundColor: "black",
                    }}
                  >
                    <Typography
                      className="helptext"
                      variant="body2"
                      style={{
                        borderWidth: 0,
                        backgroundColor: "rgba(0,0,0,0)",
                      }}
                    >
                      Project 'preview' is must to save module access
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label="close"
                      style={{ color: "white" }}
                      onClick={this.messageCloseHandler.bind(this)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </div>
                )}
                <button
                  className="popup-page-list-btn"
                  disabled={disableOK}
                  onClick={this.handleOpenPage}
                >
                  OK
                </button>
                <button
                  className="popup-page-list-btn"
                  onClick={this.handlePopupClose}
                >
                  Close
                </button>
              </DialogActions>
            </Dialog>
          ) : (
            <Dialog
              className="page-popup-container"
              open={isLoaded}
              scroll="paper"
            >
              <DialogTitle id="customized-dialog-title">
                <IconButton aria-label="Close" onClick={this.handlePopupClose}>
                  <Close />
                </IconButton>
                <h4>{this.props.title}</h4>
              </DialogTitle>

              <DialogContent dividers>
                <div>
                  <Paper className="popup-page-action-container" elevation={9}>
                    <PageListView
                      listdata={paramPage}
                      onNodeSelection={this.handlePageSelect}
                    />
                  </Paper>
                </div>
              </DialogContent>
              <DialogActions>
                <button onClick={this.handleOpenPage}>OK</button>
                <button onClick={this.handlePopupClose}>Close</button>
              </DialogActions>
            </Dialog>
          )}
        </div>
      );
    }
  }
}

function ManagePageList(props) {
  const dispatch = useDispatch();
  const appConfig = props.appConfig;
  const projectdata = props.projectdata;
  const modleName = props.moduleName;
  //const pagelist = props.paramPage;
  const pageCaches = props.pageCaches;
  const pageDic = props.pageDic;

  const pageTypes = [
    {
      viewType: "BaseView",
      Title: "Free Layout Page",
      image: imgBaseViewSource,
    },
    {
      viewType: "ScrollView",
      Title: "Free Scroll Page",
      image: imgScrollViewSource,
    },
    /*{ viewType : "TableView", Title : "Fixed data-set Record View Page", image : imgTableViewSource },
				{ viewType : "TableViewList", Title : "Fixed data-set List View Page", image : imgTableViewListSource },*/
    // {
    //   viewType: "DbTableView",
    //   Title: "DB Record View Page",
    //   image: imgDbTableViewSource,
    // },
    {
      viewType: "DbTableViewList",
      Title: "DB List View Page",
      image: imgDbTableViewListSource,
    },
    {
      viewType: "DbTableViewNestedList",
      Title: "DB Nested List View Page",
      image: imgRemoteTableViewSource,
    },
    /*{ viewType : "SplitView", Title : "SplitView Container Page", image : imgSplitViewSource },*/
    {
      viewType: "PageScrollView",
      Title: "PageScroll Container Page",
      image: imgPageScrollViewSource,
    },
  ];

  const [openAlert, setOpenAlert] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");
  const [openConfirm, setOpenConfirm] = React.useState(false);

  const [pagelist, setPageList] = React.useState(props.paramPage);
  const [selectedPage, setSelectedPage] = React.useState({});
  const [selectedpagetitle, setSelectedPageTitle] = React.useState("");

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [pagetitle, setPageTitle] = React.useState("");
  // const [moduleName, setModuleName] = React.useState("");
  const [showError, setShowError] = React.useState(false);
  const [moduleError, setModuleError] = React.useState(false);

  const [cutcopyPage, setCutcopyPage] = React.useState({});
  const [action, setAction] = React.useState("");

  const [selectedPages, setSelectedPages] = React.useState([]);

  const disabledDelete =
    selectedPage["id"] === undefined || cutcopyPage["pageid"] !== undefined
      ? true
      : false;
  const disabledCutCopy =
    selectedPage["id"] === undefined || cutcopyPage["pageid"] !== undefined
      ? true
      : false;
  const disabledCancel = cutcopyPage["pageid"] === undefined ? true : false;
  const [disabledPaste, setPasteButtonDisable] = React.useState(true);

  const selectedtabs = props.globalData["contributorTabs"];
  const [displayUpdate, setDisplayUpdate] = React.useState(false);

  const openedPages = props.globalData["openedPages"];
  const [openedPagesRestriction, setOpenedPagesRestriction] =
    React.useState(false);

  function handlePageSelect(_page) {
    setSelectedPages([]);
    setDisplayUpdate(false);

    if (openedPages && openedPages.length > 0) {
      setOpenedPagesRestriction(true);
      //return;
    }

    let pageid = _page.id;
    if (pageid > -1) {
      let isAccess = checkModuleAccess(pageid);
      if (!isAccess && action.length > 0) {
        setDisplayUpdate(true);
        return;
      }
    } else {
      if (projectdata["ProjectRole"] === "contributor") {
        setDisplayUpdate(true);
        return;
      }
    }

    if (cutcopyPage && cutcopyPage["pageid"]) {
      // if 'cut & paste' operation, then this page should not be child of "cutting" page
      const isValidNode = checkValidNodeforPaste(pageid);
      //console.log(pageid, "... isValidNode ...", isValidNode);
      setPasteButtonDisable(!isValidNode);
    }

    if (pageid > -1) {
      setSelectedPage(_page);
      props.onPageSelection(_page);

      let pageobj = pageCaches[pageid];
      console.log("Selected Page Title: ", pageobj["Title"]);
      setSelectedPageTitle(pageobj["Title"]);
      if (cutcopyPage && cutcopyPage["pageid"]) {
        setSelectedPageTitle(cutcopyPage["Title"]);
      }
    } else {
      setSelectedPage({});
      setSelectedPageTitle("");
    }
  }

  function checkModuleAccess(pageid) {
    let isAccess = true;
    if (pageid > -1) {
      if (selectedtabs && selectedtabs.length > 0) {
        const _pageobj = pageCaches[pageid];
        isAccess = getTabModuleAccess(
          _pageobj,
          selectedtabs,
          props.globalData["pageList"]
        );
        //console.log(props.globalData['pageList'], _pageobj, selectedtabs, "****pPL.. getTabModuleAccess**", isAccess);
      }
    }
    return isAccess;
  }

  function checkValidNodeforPaste(_pageid) {
    //console.log(action, "checkValidNodeforPaste >>>>>>>>", _pageid, cutcopyPage['pageid']);
    if (parseInt(_pageid) === -1) {
      return true;
    }

    if (action === "cut" && cutcopyPage["pageid"] === _pageid) {
      return false;
    }
    if (action === "cut") {
      if (cutcopyPage["parentid"] === _pageid) {
        return false;
      }

      const cutPageId = cutcopyPage["pageid"];
      let targetPage = pageCaches[_pageid];
      let _parentId = targetPage["parentid"];
      if (_parentId === cutPageId) {
        // means targetpage is direct child of cut-page, then no pasting
        return false;
      } else {
        // check if target page is not grandchild of cutpage, then true else false
        while (_parentId !== "App") {
          let _parentpage = getParantPage(_parentId, pageCaches);
          if (_parentpage) {
            _parentId = _parentpage.parentid;
          }
          if (cutPageId === _parentId) {
            return false;
          }
        }
        return true;
      }
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

  ///////////// Add Page ////////////////

  function handlePageAdd(_page) {
    props.onUpdateOwnerTabs(_page, "add");

    relaodPageList("-999", _page);
  }

  /////////// Delete Page //////////////

  function handleDeletePage() {
    let _selectedPage = selectedPage;
    if (_selectedPage) {
      let pageid = _selectedPage.id;
      let pageobj = pageCaches[pageid];

      let isAccess = checkModuleAccess(pageid);
      if (!isAccess) {
        setDisplayUpdate(true);
        return;
      }
      if (
        props.projectdata.hasOwnProperty("ProjectRole") &&
        props.projectdata["ProjectRole"] === "contributor"
      ) {
        console.log(props, "........... isAccess ...........", pageobj);
        if (pageobj["parentid"] === "App") {
          setAlertTitle("");
          setAlertMessage("Not allowed to delete 'Tab' pages");
          setOpenAlert(true);
          return;
        }
      }

      //console.log("delete Page >>", pageobj);
      const validationDelete = validateDeletePage(pageobj);
      if (validationDelete.length === 0) {
        setAction("delete");
        setAlertTitle("");
        setAlertMessage(
          "Are you sure to delete page '" +
            pageobj["Title"] +
            "' ? \nPlease review all actions where this page referenced."
        );
        setOpenConfirm(true);
      } else {
        let alertmsg = validationDelete;
        setAlertTitle("");
        setAlertMessage(alertmsg);
        setOpenAlert(true);
      }
    }
  }

  function validateDeletePage(deletedPage) {
    //console.log(deletedPage, "deletedPage >>>>>", deletedPage['pageid'], deletedPage['parentid'], deletedPage['viewType']);

    /* if(deletedPage['viewType'] === "SplitView" || deletedPage['viewType'] === "PageScrollView"){
      return "There should not be any child page. Please move or remove all child pages.";
    } */

    let _parentId = deletedPage["parentid"];

    if (_parentId === "App") {
      let deletedPageHierarchy = pagelist["list"];
      deletedPageHierarchy = deletedPageHierarchy.filter(function (page) {
        return page.id === deletedPage["pageid"];
      });
      //console.log(pagelist['list'], "deletedPageHierarchy >>>>>", deletedPageHierarchy);

      if (deletedPageHierarchy[0].children.length > 0) {
        return "There should not be any child page. Please move or remove all child pages.";
      }
    } else {
      // need to implement nested filter on hierarchy
      let _childpage = findChildPage(deletedPage["pageid"], pageCaches);
      //console.log(deletedPage['pageid'], "delete any child Page >>>>>", _childpage);
      if (_childpage && _childpage["parentid"] === deletedPage["pageid"]) {
        return "There should not be any child page. Please move or remove all child pages.";
      }
    }

    return "";
  }
  function findChildPage(_parentId, pagelist) {
    let parentObjArr = pagelist.filter(function (_page) {
      return _page["parentid"] === _parentId;
    });
    let _parentpage = parentObjArr[0];
    return _parentpage;
  }

  function handleMultiPageSelection(page) {
    setSelectedPage([]);

    let arrSelectedPages = selectedPages;
    arrSelectedPages.push(page.id);
    setSelectedPages(arrSelectedPages);
    //console.log(page.id, "...selectedPages >>", arrSelectedPages);
  }

  function handleDeleteMultiPage() {
    let validPagesforDelete = [];
    const uniquePageIdlist = [...new Set(selectedPages)];
    console.log(
      selectedPages.length,
      "....DeleteMultiPage >>>",
      uniquePageIdlist
    );
    for (var p = 0; p < uniquePageIdlist.length; p++) {
      let pageid = uniquePageIdlist[p];
      let pageobj = pageCaches[pageid];
      let validationDelete = validateDeletePage(pageobj);
      if (validationDelete.length > 0) {
        let alertmsg = validationDelete;
        setAlertTitle("");
        setAlertMessage(alertmsg);
        setOpenAlert(true);
        validPagesforDelete = [];
        break;
      } else {
        validPagesforDelete.push(pageobj);
      }
    }

    for (var i = 0; i < validPagesforDelete.length; i++) {
      let validpage = validPagesforDelete[i];
      deletePageHandler(validpage);
    }
    setSelectedPages([]);
  }

  /////////// Cut Page //////////////

  function handleCutPage() {
    let _selectedPage = selectedPage;
    if (_selectedPage) {
      let pageid = _selectedPage.id;
      let pageobj = pageCaches[pageid];

      let isAccess = checkModuleAccess(pageid);
      if (!isAccess) {
        setDisplayUpdate(true);
        return;
      }

      if (
        props.projectdata.hasOwnProperty("ProjectRole") &&
        props.projectdata["ProjectRole"] === "contributor"
      ) {
        if (pageobj["parentid"] === "App") {
          setAlertTitle("");
          setAlertMessage("Not allowed to cut-paste 'Tab' pages");
          setOpenAlert(true);
          return;
        }
      }

      /* setAlertTitle('');
      setAlertMessage("After 'paste', need to review those actions which has reference of this page.");
      setOpenAlert(true); */

      let fields = pagetitle;
      fields = pageobj["Title"];
      setPageTitle(fields);

      setCutcopyPage(pageobj);
      setAction("cut");
    }
  }

  /////////// Copy Page //////////////

  function handleCopyPage() {
    let _selectedPage = selectedPage;
    if (_selectedPage) {
      let pageid = _selectedPage.id;
      let pageobj = pageCaches[pageid];
      //console.log("copy Page >>", pageobj);

      let fields = pagetitle;
      fields = pageobj["Title"] + "_Copy";
      setPageTitle(fields);

      setCutcopyPage(pageobj);
      setAction("copy");
    }
  }

  /////////// Paste Page //////////////

  const [showWait, setWaiting] = React.useState(false);

  function handlePastePage() {
    let _selectedPage = selectedPage;

    let _cutcopyPage = cutcopyPage;
    if (_cutcopyPage) {
      //console.log("paste Page >>", _cutcopyPage);
      if (action === "cut" && _cutcopyPage.pageid === _selectedPage.id) {
        setAlertTitle("");
        setAlertMessage("Please choose a different page to paste");
        setOpenAlert(true);
        return;
      }

      //console.log(pagetitle, "<< paste Page >>", _selectedPage);
      if (action === "copy") {
        //console.log("<< copy paste Page >>", _cutcopyPage);
        let copypastedPage = JSON.parse(JSON.stringify(_cutcopyPage)); //Object.assign({}, _cutcopyPage);
        copypastedPage.pageid = "";
        copypastedPage.Title = pagetitle;
        copypastedPage.parentid = _selectedPage["id"]
          ? _selectedPage["id"]
          : "App";
        copypastedPage["Document"] = setPageDocument();
        pastePageHandler(copypastedPage).then((result) => {
          if (result["response"] !== "NACK") {
            setAction("");
            setSelectedPage({});
            setCutcopyPage({});
          }
        });
      } else if (action === "cut") {
        //console.log("<< cut paste Page >>", _cutcopyPage);
        /* const _parentid = (_selectedPage['id']) ? _selectedPage['id'] : "App";
        if(_parentid === "App")  {
          setAlertTitle('');
          setAlertMessage("Cut-paste not allowed on application root.");
          setOpenAlert(true);
          return;
        } */

        let isnamechanged = false;
        if (_cutcopyPage["Title"] !== pagetitle) {
          isnamechanged = true;
        }

        const _cutpastedPage = Object.assign({}, _cutcopyPage);

        let cutpastedPage = _cutcopyPage;
        cutpastedPage.Title = pagetitle;
        cutpastedPage.parentid = _selectedPage["id"]
          ? _selectedPage["id"]
          : "App";
        //console.log(_cutpastedPage.parentid, "<< paste Page >>", _cutcopyPage.parentid);

        pastePageHandler(cutpastedPage, _cutpastedPage.parentid).then(
          (result) => {
            if (result["response"] !== "NACK") {
              setAction("");
              setSelectedPage({});
              setCutcopyPage({});

              if (isnamechanged) {
                props.onUpdateOwnerTabs(result.page, "cutrename");
              } else {
                props.onUpdateOwnerTabs(result.page, "add");
                //props.onEditPageHeirarchy(result.page, "add");
              }
            }
          }
        );
      }
      //setAction('paste');
    }

    //setSelectedPage({});
    //setCutcopyPage({});
  }

  function setPageDocument() {
    let strDate = getCurrentDateTime();

    let _document = [];
    let createdObj = { key: "createddatetime", value: strDate };
    _document.push(createdObj);
    let lastupdateObj = { key: "lastupdatedatetime", value: strDate };
    _document.push(lastupdateObj);

    return _document;
  }

  function setChildPageProp(pageContainerDic) {
    let screensArr = projectdata["availableScreens"];
    for (let i = 0; i < screensArr.length; i++) {
      //pageContainerDic.NavigationBarHidden = false;

      let navigationBarDic = pageContainerDic._navigationBars[i];
      navigationBarDic.title = pageContainerDic["Title"];
      if (navigationBarDic.prompt === undefined) {
        navigationBarDic.prompt = "";
      }
      if (navigationBarDic.leftBarButton.type === undefined) {
        navigationBarDic.leftBarButton.type = "";
      }
      if (navigationBarDic.leftBarButton.systemItem === undefined) {
        navigationBarDic.leftBarButton.systemItem = "";
      }
      if (navigationBarDic.rightBarButton.type === undefined) {
        navigationBarDic.rightBarButton.type = "";
      }
      if (navigationBarDic.rightBarButton.systemItem === undefined) {
        navigationBarDic.rightBarButton.systemItem = "";
      }

      if (navigationBarDic.leftBarButton.type.length === 0)
        navigationBarDic.leftBarButton.type = "SystemItem";
      if (navigationBarDic.leftBarButton.systemItem.length === 0)
        navigationBarDic.leftBarButton.systemItem = "back";
      if (navigationBarDic.leftBarButton.actions.clicked.length === 0) {
        let actionDic = {
          category: "ViewAction",
          method: "popViewController",
          type: "Page",
        };
        actionDic["params"] = {
          animationType: "none",
          condition: { groupcases: [] },
          pageTitle: pageContainerDic["Title"],
        };
        actionDic["actions"] = {
          success: [],
          error: [],
          onElse: [],
          notAvailable: [],
        };
        //actionDic['Document'] = setDocument_forPage();

        navigationBarDic.leftBarButton.actions.clicked.push(actionDic);
      }
    }
  }
  function resetChildPageProp(pageContainerDic) {
    let screensArr = projectdata["availableScreens"];
    for (let i = 0; i < screensArr.length; i++) {
      //pageContainerDic.NavigationBarHidden = true;

      let navigationBarDic = pageContainerDic._navigationBars[i];
      navigationBarDic.title = pageContainerDic["Title"];
      if (navigationBarDic.prompt === undefined) {
        navigationBarDic.prompt = "";
      }

      /* navigationBarDic.leftBarButton.type = '';
      navigationBarDic.leftBarButton.systemItem = '';
      navigationBarDic.leftBarButton.actions = []; */
    }
  }

  function pastePageHandler(pastedpagedata, cutcopyParentId) {
    setWaiting(true);
    //console.log(action, cutcopyParentId, "<<<<<--- pastePageHandler -->>>>>", pastedpagedata.parentid, pastedpagedata);

    if (pastedpagedata.parentid === "App") {
      resetChildPageProp(pastedpagedata);
    } else {
      setChildPageProp(pastedpagedata);
    }
    if (pastedpagedata.hasOwnProperty("TabBase")) {
      pastedpagedata["IconTitle"] = pastedpagedata["TabBase"]["icontitle"];
      pastedpagedata["Icon"] = pastedpagedata["TabBase"]["icon"];
    }

    var formData = new FormData();
    if (action === "copy") {
      formData.append("command", "pagenew");
    } else if (action === "cut") {
      formData.append("command", "pageupdate");
      formData.append("pageid", pastedpagedata.pageid);
    }
    formData.append("userid", appConfig.userid);
    formData.append("sessionid", appConfig.sessionid);
    formData.append("projectid", appConfig.projectid);

    var pageData = encodeURIComponent(JSON.stringify(pastedpagedata));
    let text = new File([pageData], "pastepage.txt", { type: "text/plain" });
    formData.append("file", text);

    return fetch(appConfig.apiURL + "multipartservice.json", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        //result = {"response":"ACK","count":1,"page":{....},"command":"pagenew"}
        //console.log('pastepage result:', result);
        if (result.response === "NACK") {
          //var _err = {message: result.error};
          //console.log("pastepage : Error >>", _err);
          setAlertTitle("");
          setAlertMessage(result.error);
          setOpenAlert(true);
          setWaiting(false);
        } else {
          //console.log(action, "....pastepage : Success >> ", result.page);
          setAlertTitle("");
          if (action === "copy") {
            setAlertMessage(
              "Page copied successfully. \n\nTo avoid any inconsistency, project 'preview' \nis recommended before closing PE."
            );
            setOpenAlert(true);
            props.onUpdateOwnerTabs(result.page, "add");
            relaodPageList("-999", result.page);
          } else if (action === "cut") {
            if (pastedpagedata.parentid === "App_1234567890") {
              // There are 2 cases -->
              // 1. pasted page was already a tab-page
              // 2. pasted page was a child page, now pasted as tab-page
              // Now, that pasted page should remain in the end-of-hierarchy
              // so we need to 'swap' later tab-pages

              let swappedPages;
              const tabPageList = getTabPagesList();

              if (cutcopyParentId === "App") {
                // pasted-page is already a tab-page
                let pastedPageIndex = -1;
                for (let i = 0; i < tabPageList.length; i++) {
                  if (tabPageList[i]["pageid"] === pastedpagedata.pageid) {
                    pastedPageIndex = i;
                    break;
                  }
                }
                if (pastedPageIndex > -1) {
                  swappedPages = tabPageList.slice(pastedPageIndex);
                }

                const lastIndex = tabPageList.length - 1;
                const lastTabBasedPageid =
                  lastIndex > 0 ? tabPageList[lastIndex]["pageid"] : -1;
                if (
                  lastTabBasedPageid > -1 &&
                  swappedPages &&
                  swappedPages.length > 0
                ) {
                  swapPagesOrder(
                    lastTabBasedPageid,
                    pastedpagedata.pageid,
                    swappedPages,
                    0
                  );
                } else {
                  relaodPageList(pastedpagedata.pageid, result.page);
                }
              } else {
                refetchPageData().then((response) => {
                  const pageH = reloadPageTree(response.pages);
                  setChildpage_asEoHTabpage(pastedpagedata, pageH);
                });
              }

              /* const lastIndex = tabPageList.length -1;           
              const lastTabBasedPageid = (lastIndex > 0) ? tabPageList[lastIndex]['pageid'] : -1;
              if(lastTabBasedPageid > -1 && pastedpagedata.parentid === "App") {
                
                let pastedPageIndex = -1;
                for (let i = 0; i < tabPageList.length; i++) {
                  if(tabPageList[i]['pageid'] === pastedpagedata.pageid) {
                    pastedPageIndex = i;
                    break;
                  }                
                }
                if(pastedPageIndex === -999999999) {    //if(pastedPageIndex > -1) {
                  const swappedPages = tabPageList.slice(pastedPageIndex);
                  console.log(cutcopyPage['parentid'], "** swappedPages **", swappedPages);
                  swapPagesOrder(lastTabBasedPageid, pastedpagedata.pageid, swappedPages, 0);
                }else {
                  relaodPageList(pastedpagedata.pageid, result.page);
                }
              } */
            } else {
              setAlertMessage("Cut page pasted successfully.");
              setOpenAlert(true);
              //props.onUpdateOwnerTabs(pastedpagedata, "add");
              relaodPageList(pastedpagedata.pageid, result.page);
            }
          }

          const pageData = result.page;
          if (pageData["parentid"] !== "App") {
            let parent = getparentData(
              pageData["parentid"],
              props.paramPage.pagedata
            );
            updateParentPage(parent, pageData, "add");
          }
        }
        return result;
      })
      .catch((error) => {
        console.error("Error:", error);
        setAlertMessage("Something Went wrong. Please try later.");
        setOpenAlert(true);
        setWaiting(false);
      });
  }

  function setChildpage_asEoHTabpage(pastedpagedata, pagelist) {
    let swappedPages;
    const tabPageList = getTabPagesList(pagelist);

    let _pastedPageIndex = -1;
    for (let i = 0; i < tabPageList.length; i++) {
      if (tabPageList[i]["pageid"] === pastedpagedata.pageid) {
        _pastedPageIndex = i;
        break;
      }
    }
    //console.log(pastedpagedata, pagelist, "...... akshay >>>", tabPageList, _pastedPageIndex);
    if (_pastedPageIndex > -1) {
      swappedPages = tabPageList.slice(_pastedPageIndex);
      const lastIndex = tabPageList.length - 1;
      const lastTabBasedPageid =
        lastIndex > 0 ? tabPageList[lastIndex]["pageid"] : -1;
      if (lastTabBasedPageid > -1 && swappedPages && swappedPages.length > 0) {
        swapPagesOrder(
          lastTabBasedPageid,
          swappedPages[0].pageid,
          swappedPages,
          0
        );
      }
    }
  }

  function getTabPagesList(updatedlist) {
    const _pageList = updatedlist ? updatedlist : pagelist["list"];
    let tabPageList = [];
    _pageList.forEach((page) => {
      if (page["level"] === 1) {
        tabPageList.push({ Title: page.title, pageid: page.id });
      }
    });
    return tabPageList;
  }

  function swapPagesOrder(lastTabPageid, pastedPageid, swappedPages, counter) {
    //console.log(swappedPages, "... swapPagesOrder ****", lastTabPageid, pastedPageid);
    if (lastTabPageid === pastedPageid) {
      setAlertMessage("Cut page pasted successfully.");
      setOpenAlert(true);
      setWaiting(false);
      return;
    }
    setWaiting(true);

    let _fetchUrl =
      appConfig.apiURL +
      "service.json?command=swappagesorder&userid=" +
      appConfig.userid +
      "&sessionid=" +
      appConfig.sessionid +
      "&projectid=" +
      appConfig.projectid +
      "&sourcepageid=" +
      lastTabPageid +
      "&targetpageid=" +
      pastedPageid;
    fetch(_fetchUrl, { method: "POST" })
      .then((res) => res.json())
      .then(
        (result) => {
          //{response: "ACK", count: 1, command: "swappagesorder", pages: [] }
          if (result.response === "ACK") {
            counter = counter + 1;
            if (
              counter > swappedPages.length ||
              counter === swappedPages.length - 1
            ) {
              setAlertMessage("Cut page pasted successfully.");
              setOpenAlert(true);

              reloadPageTree(result.pages);
            } else {
              if (swappedPages[counter]) {
                let nextPageid = swappedPages[counter]["pageid"];
                swapPagesOrder(
                  lastTabPageid,
                  nextPageid,
                  swappedPages,
                  counter
                );
              } else {
                setAlertMessage("Cut page pasted successfully.");
                setOpenAlert(true);

                reloadPageTree(result.pages);
              }
            }
          } else {
            setAlertMessage(
              "Something un-expected happened. Inconvenience caused is regretted."
            );
            setOpenAlert(true);

            console.log("NACK.... swapPagesOrder >>>", result);
            setWaiting(false);
          }
        },
        (error) => {
          console.log(error);
          setWaiting(false);
        }
      );
  }

  function refetchPageData() {
    let _fetchUrl =
      appConfig.apiURL +
      "service.json?command=pagelist&userid=" +
      appConfig.userid +
      "&sessionid=" +
      appConfig.sessionid +
      "&projectid=" +
      appConfig.projectid;
    return fetch(_fetchUrl)
      .then((res) => res.json())
      .then(
        (result) => {
          // { pages: [...], response: "ACK", count: 1, command: "pagelist" }
          if (result.response === "NACK") {
            var _err = { message: result.error };
            setAlertTitle("");
            setAlertMessage(_err);
            setOpenAlert(true);
          } else {
            //let _pages = result.pages;
            //reloadPageTree(_pages);
          }
          setWaiting(false);
          return result;
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
  }

  function handleCancelPaste() {
    setAction("");
    setCutcopyPage({});

    setSelectedPageTitle("");
    setPageTitle("");
    dispatch(setModuleName(""));
    setSelectedPage({});
  }

  //////////////////////////////////////

  function alertCloseHandler() {
    setOpenAlert(false);
    setAction("");
  }
  function alertOKHandler() {
    setOpenAlert(false);
    //setAction('');
  }

  function confirmCloseHandler() {
    setOpenConfirm(false);
    setAction("");
  }
  function confirmOKHandler() {
    if (action === "delete") {
      deletePageHandler();
    }
    setOpenConfirm(false);
    setAction("");
  }

  function deletePageHandler(copydeletepage) {
    //console.log(copydeletepage, "<<<--- deletePageHandler >>>>>", selectedPage, selectedPages);
    const deletepageId = copydeletepage
      ? copydeletepage["pageid"]
      : selectedPage["id"];
    //console.log(cutcopyPage, "<<<--- deletePageHandler >>>>>", deletepageId);
    setWaiting(true);
    //relaodPageList(selectedPage.id);

    let fetch_pageremove_URL =
      appConfig.apiURL +
      "service.json?command=pageremove&userid=" +
      appConfig.userid +
      "&sessionid=" +
      appConfig.sessionid +
      "&projectid=" +
      appConfig.projectid +
      "&pageid=" +
      deletepageId;
    fetch(fetch_pageremove_URL, { method: "POST" })
      .then((res) => res.json())
      .then(
        (result) => {
          // { response: "ACK", count: 1, command: "pageremove" }
          if (result.response === "NACK") {
            setAlertTitle("");
            setAlertMessage(result.error);
            setOpenAlert(true);
          } else {
            if (!copydeletepage) {
              setAlertTitle("");
              setAlertMessage(
                "Page removed successfully. \n\nTo avoid any inconsistency, project 'preview' \nis recommended before closing PE."
              );
              setOpenAlert(true);
            }

            let _cutcopyPage = getpageData(
              deletepageId,
              props.paramPage.pagedata
            );
            if (_cutcopyPage && _cutcopyPage["parentid"] !== "App") {
              let _cutcopyParent = getparentData(
                _cutcopyPage["parentid"],
                props.paramPage.pagedata
              );
              console.log(
                deletepageId,
                props,
                "<<<--- deletePageHandler >>>>>",
                _cutcopyPage,
                _cutcopyParent
              );
              updateParentPage(_cutcopyParent, _cutcopyPage, "delete");
            }

            //props.onUpdateOwnerTabs(deletepageId, "delete");
            let strDate = getCurrentDateTime();
            let deletePageObj = {
              pageid: deletepageId,
              pagename: _cutcopyPage["Title"],
              timestamp: strDate,
            };
            props.onUpdateOwnerTabs(deletePageObj, "delete");

            relaodPageList(deletepageId);
          }
          setWaiting(false);
        },
        (error) => {
          setAlertTitle("");
          setAlertMessage("fault: " + error);
          setOpenAlert(true);
          setWaiting(false);
        }
      );
  }

  function getpageData(pageid, pagelist) {
    let pageDef = pagelist.filter(function (_page) {
      return _page["pageid"] === pageid;
    });
    return pageDef[0];
  }
  function getparentData(parentid, pagelist) {
    let pageDef = pagelist.filter(function (_page) {
      return _page["pageid"] === parentid;
    });
    return pageDef[0];
  }
  function updateParentPage(parentPage, pageData, mode) {
    if (parentPage["viewType"] === "PageScrollView") {
      let parentPages = parentPage.Children[0]["pages"];

      if (mode === "delete") {
        let pageId = pageData["pageid"];
        let isfound = false;
        for (let i = 0; i < parentPages.length; i++) {
          if (parentPages[i]["pagedef"]["filename"] === "page_" + pageId) {
            parentPages.splice(i, 1);
            i--;
            isfound = true;
          } else {
            if (isfound) {
              parentPages[i]["id"] = parseInt(parentPages[i]["id"]) - 1;
            }
          }
        }
      } else {
        const idVal = parentPages.length;
        const childpagedef = {
          id: idVal,
          pagedef: {
            srcLocation: "bundle",
            filename: "page_" + pageData["pageid"],
            fileext: "plist",
            url: "",
          },
          frame: {
            x: 0,
            y: 0,
            z: 0,
            width: pageData["frame"]["width"],
            height: pageData["frame"]["height"],
            depth: 0,
            rotation: 0,
            minWidth: 0,
            maxWidth: 0,
            minHeight: 0,
            maxHeight: 0,
            isLocked: false,
            relative: false,
          },
        };
        parentPages.push(childpagedef);
      }

      console.log(parentPages, ">>>>>>>>>>>", parentPage);
      fetchUpdatePage(parentPage["pageid"], parentPage);
    }
  }
  function fetchUpdatePage(pageid, pageforSave) {
    var formData = new FormData();
    formData.append("command", "pageupdate");
    formData.append("userid", appConfig.userid);
    formData.append("sessionid", appConfig.sessionid);
    formData.append("projectid", appConfig.projectid);
    formData.append("pageid", pageid);

    let _jsonforsave = JSON.stringify(pageforSave);
    var pageData = encodeURIComponent(_jsonforsave);

    let text = new File([pageData], "updatePage.txt", { type: "text/plain" });
    formData.append("file", text);

    fetch(appConfig.apiURL + "multipartservice.json", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.response === "NACK") {
          const errormsg = result.error;
          if (
            typeof errormsg === "string" &&
            errormsg.indexOf("Invalid sessionid") > -1
          ) {
            //setSessionError(true);
          }
          setAlertTitle("");
          setAlertMessage(result.error);
          setOpenAlert(true);
        }
        /*else{
        setAlertTitle('');
        setAlertMessage("Page '"+ result.page['Title'] +"' saved successfully.");
        setOpenAlert(true);
      }*/
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
        setAlertTitle("");
        setAlertMessage(
          "Something went wrong. Please check Server/Internet connection."
        );
        setOpenAlert(true);
      });
  }

  function relaodPageList(_selectedpageid, addpagedata) {
    let _pages = pagelist["pagedata"];

    if (_selectedpageid !== "-999") {
      _pages = _pages.filter(function (page) {
        return page.pageid !== _selectedpageid;
      });
    }

    if (addpagedata) {
      _pages.push(addpagedata);
      //console.log(_selectedpageid, "<<<<<<<<<<<<<<<<<< relaodPageList addpagedata >>>>>>>>>>>>>>>>>>>", _pages);
    }

    reloadPageTree(_pages);
  }
  function reloadPageTree(_pages) {
    var arrPageData = [];
    let projectNode = pagelist["list"][0];
    arrPageData.push(projectNode);

    //manipulatePageData(_pages, 0, arrPageData);

    //let projectNode = {level:0, title:this.props.projectdata.ProjectName, id:"-1", parent:"App", type:"", children:[]};
    //arrPageData.push(projectNode);

    manipulatePageData(_pages, 1, arrPageData);

    var pageHeirarchy = setPageHeirarchy(arrPageData);
    pageHeirarchy = pageHeirarchy.filter(function (page) {
      return page.parent === "App";
    });

    setPageList({ pagedata: _pages, list: pageHeirarchy });
    //console.log(props.globalData, "<<<<<<<<<<<<<<<<<< relaodPageList >>>>>>>>>>>>>>>>>>>", _pages, pageHeirarchy);

    props.onListUpdate({ pagedata: _pages, list: pageHeirarchy });

    setPageTitle("");
    dispatch(setModuleName(""));
    setSelectedPageTitle("");
    setSelectedPage({});
    setPasteButtonDisable(true);
    setWaiting(false);

    return pageHeirarchy;
  }

  /////////// Add New Page //////////////

  const openHelp = Boolean(anchorEl);
  function handleHelpClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleHelpClose() {
    setAnchorEl(null);
  }

  function handleSetTitle(e) {
    // let fields = pagetitle;
    let fields = e.target.value;
    // console.log(fields);
    if (fields.length > 0) {
      const allowedChars = /\w/g;
      let allowedTitle = fields.match(allowedChars);
      if (!allowedTitle) {
        setShowError(true);
        return;
      }
      if (allowedTitle && fields.length !== allowedTitle.length) {
        setShowError(true);
        return;
      }
      setShowError(false);
    }
    setPageTitle(fields);
  }

  function handleModuleTitle(e) {
    let moduleContent = e.target.value;
    const capitalizeModuleContent = capitalizeFirstLetter(moduleContent);

    if (capitalizeModuleContent.length > 0) {
      const allowedChars = /[a-zA-Z0-9 ]/g;
      let allowedTitle = capitalizeModuleContent.match(allowedChars);
      if (!allowedTitle) {
        setModuleError(true);
        return;
      }
      if (
        allowedTitle &&
        capitalizeModuleContent.length !== allowedTitle.length
      ) {
        setModuleError(true);
        return;
      }
      setModuleError(false);
    }
    dispatch(setModuleName(capitalizeModuleContent));
  }

  function handleTitleFocus(e) {
    setShowError(false);
  }

  function handleModuleFocus(e) {
    setModuleError(false);
  }

  function validatePageTitle() {
    let fields = pagetitle;
    let titleIsValid = true;

    if (!fields) {
      titleIsValid = false;
    }

    if (typeof fields !== "undefined") {
      const allowedChars = /\w/g;
      let allowedTitle = fields.match(allowedChars);
      if (!allowedTitle) {
        titleIsValid = false;
      }
    }

    setShowError(!titleIsValid);
    return titleIsValid;
  }

  function dropNotAllowed(ev) {
    ev.dataTransfer.dropEffect = "none";
    //ev.stopPropagation();
    ev.preventDefault();
  }

  function handlePagetypeDragstart(ev) {
    if (validatePageTitle()) {
      // Add the target element's id to the data transfer object
      //console.log(pagetitle, "<<<<<--- handlePagetypeDragstart -->>>>>", ev.target.dataset['pagetype']);
      let draggedPageDic = getPageDic_byPageType(
        ev.target.dataset["pagetype"],
        pageDic
      );
      //console.log(ev.target.dataset['pagetype'], " ---- handlePagetypeDragstart -->>>>>", draggedPageDic);
      ev.dataTransfer.setData(
        "text/plain",
        pagetitle +
          ";" +
          modleName +
          ";" +
          ev.target.dataset["pagetype"] +
          ";" +
          JSON.stringify(draggedPageDic)
      );

      // console.log(ev.target.dataset["pagetype"]);
    } else {
      ev.preventDefault();
    }
  }

  function getPageDic_byPageType(pagetype, pageDicArray) {
    if (pageDicArray.length > 0) {
      let basePagedic = pageDicArray[0].dic;
      basePagedic.Children = [];

      if (pagetype.indexOf("Scroll") > -1) {
        let scrollBasedic = pageDicArray.filter(function (pagedic) {
          return pagedic.name === "ScrollBaseView";
        });
        //basePagedic = Object.assign({}, basePagedic, scrollBasedic[0].dic);
        basePagedic.Children.push(scrollBasedic[0].dic);
      } else if (pagetype.indexOf("Table") > -1) {
        let tableBasedic = pageDicArray.filter(function (pagedic) {
          return pagedic.name === "TableBaseView";
        });
        let tableTypedic = pageDicArray.filter(function (pagedic) {
          return pagedic.name === pagetype;
        });
        /* tableBasedic[0].dic = Object.assign({}, tableBasedic[0].dic, tableTypedic[0].dic);
        //console.log(pagetype, ">>>>", pageDicArray, tableBasedic);
        basePagedic.Children.push(tableBasedic[0].dic); */

        const tableChildObj = Object.assign(
          {},
          tableBasedic[0].dic,
          tableTypedic[0].dic
        );
        if (pagetype === "DbTableViewNestedList") {
          setNestedListPageData(tableChildObj, tableBasedic[0].dic);
          basePagedic["NavigationBarHidden"] = true;
        }
        basePagedic.Children.push(tableChildObj);
      }

      let draggedPagedic = pageDicArray.filter(function (pagedic) {
        return pagedic.name === pagetype;
      });

      if (draggedPagedic.length === 0) {
        return Object.assign({}, basePagedic);
      }

      if (pagetype === "PageScrollView") {
        Object.assign(basePagedic.Children[0], draggedPagedic[0].dic);
        basePagedic["viewType"] = pagetype;
        return basePagedic;
      }

      let objPageDic = Object.assign({}, basePagedic, draggedPagedic[0].dic);
      return objPageDic;
    }
  }

  function setNestedListPageData(pageObj, baseDic) {
    let subrecordDef = JSON.parse(
      JSON.stringify(baseDic.Group[0]["RecordCellDef"])
    );
    subrecordDef["ServiceName"] = "";
    subrecordDef["tablename"] = "";
    subrecordDef["where"] = "";
    subrecordDef["sort"] = "";
    subrecordDef["Groupby"] = "";
    subrecordDef["CellStyle"] = "custom";
    subrecordDef["accessoryType"] = "none";
    subrecordDef["editingAccessoryType"] = "none";

    pageObj.Group[0]["SubRecordCellDef"] = subrecordDef;
    return pageObj;
  }

  return (
    <div id="newpagelist" style={{ height: "76vh" }}>
      <div className="customized-dialog-info">
        <Paper style={{ padding: "1rem" }} elevation={9}>
          <div id="pagetree" style={{ height: "calc(100% - 33px)" }}>
            <PageListView
              appConfig={appConfig}
              projectdata={projectdata}
              listdata={pagelist}
              selectedtabs={selectedtabs}
              onNodeSelection={handlePageSelect}
              updatePageList={handlePageAdd}
              source="manage"
              resetmultiselection={selectedPages.length === 0}
              onMultiPageSelection={handleMultiPageSelection}
            />
            <div className="selected-page-label">
              <h4>Selected Page Title:</h4>
              <h4 className="selected-page-label-title">{selectedpagetitle}</h4>
            </div>
          </div>
          <div className="popup-page-action-box">
            {selectedPages.length === 0 && (
              <button
                className="popup-page-action-btn"
                disabled={disabledDelete}
                onClick={handleDeletePage}
              >
                Delete
              </button>
            )}
            {selectedPages.length > 0 && (
              <button
                className="popup-page-action-btn"
                onClick={handleDeleteMultiPage}
              >
                Delete
              </button>
            )}
            <button
              className="popup-page-action-btn"
              disabled={disabledCutCopy}
              onClick={handleCutPage}
            >
              Cut
            </button>
            <button
              className="popup-page-action-btn"
              disabled={disabledCutCopy}
              onClick={handleCopyPage}
            >
              Copy
            </button>
            <button
              className="popup-page-action-btn"
              disabled={disabledPaste}
              onClick={handlePastePage}
            >
              Paste
            </button>
            <button
              className="popup-page-action-btn"
              disabled={disabledCancel}
              onClick={handleCancelPaste}
            >
              Cancel
            </button>
            {displayUpdate && (
              <Typography
                className="helptext"
                variant="body2"
                style={{
                  position: "absolute",
                  left: 4,
                  right: 4,
                  backgroundColor: "black",
                }}
              >
                Not allowed to update selected page
              </Typography>
            )}
            {openedPagesRestriction && (
              <div
                style={{
                  position: "absolute",
                  left: 4,
                  right: 4,
                  backgroundColor: "white",
                  height: 26,
                  display: "flex",
                  justifyContent: "end",
                }}
              >
                <button
                  className="popup-page-action-btn"
                  disabled={disabledCutCopy}
                  onClick={handleCopyPage}
                >
                  Copy
                </button>
                <button
                  className="popup-page-action-btn"
                  disabled={disabledPaste}
                  onClick={handlePastePage}
                >
                  Paste
                </button>
                <button
                  className="popup-page-action-btn"
                  disabled={disabledCancel}
                  onClick={handleCancelPaste}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </Paper>
        <Paper style={{ padding: "1rem" }} elevation={9}>
          <div className="vertical-align" draggable="false">
            <div className="new-page-title">
              <h4>Add New Page</h4>
              <Tooltip title="Help">
                <IconButton
                  edge="end"
                  color="inherit"
                  aria-label="Help"
                  onClick={handleHelpClick}
                >
                  {!openHelp && <Help />}
                  {openHelp && <Cancel />}
                </IconButton>
              </Tooltip>
              <Popover
                id="prjsettings-popover"
                open={openHelp}
                anchorEl={anchorEl}
                onClose={handleHelpClose}
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <div>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    1. Select a item on page list.
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    2. Set page title.
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    3. Drag 'page type' and drop on selected item at page list.
                  </Typography>
                </div>
              </Popover>
            </div>
            <TextField
              id="newpagetitle"
              name="pagetitle"
              style={{ width: "33vw" }}
              className="user-title-box"
              required
              autoFocus
              fullWidth
              label={<h4 style={{ color: "grey" }}>Set Page Title</h4>}
              value={pagetitle}
              helperText="Only alphabets, numbers & underscore allowed."
              error={showError}
              margin="normal"
              variant="outlined"
              onChange={handleSetTitle}
              onFocus={handleTitleFocus}
              onDragOver={dropNotAllowed}
            />
            <TextField
              id="newmoduletitle"
              name="moduletitle"
              style={{ width: "33vw" }}
              className="user-module-box"
              required
              autoFocus
              fullWidth
              label={<h4 style={{ color: "grey" }}>Set Module Name</h4>}
              value={modleName}
              helperText="Only alphabets, numbers & space allowed."
              error={moduleError}
              margin="normal"
              variant="outlined"
              onChange={handleModuleTitle}
              onFocus={handleModuleFocus}
              onDragOver={dropNotAllowed}
            />
            <div className="new-page-layout-option">
              <h4>Drag page type and drop on page list.</h4>
              <List component="nav" dense={true} draggable="false">
                {pageTypes.map((item, index) => (
                  <ListItem
                    key={index}
                    className="new-page-layout-item popup-page-list-item"
                    data-pagetype={item.viewType}
                    draggable="true"
                    onDragStart={handlePagetypeDragstart}
                  >
                    <img src={item.image} alt={item.viewType}></img>
                    <ListItemText primary={<h6>{item.Title}</h6>} />
                  </ListItem>
                ))}
              </List>
            </div>
          </div>
        </Paper>
      </div>
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
      {showWait && (
        <div className="backdropStyle" style={{ zIndex: 999 }}>
          <Typography variant="h5" color="textSecondary" className="waitlabel">
            <CircularProgress style={{ marginRight: 12 }} />
            <h4>Please Wait ....</h4>
          </Typography>
        </div>
      )}
    </div>
  );
}

function makePageCacheList(pageList) {
  let _pageCacheList = [];
  pageList.forEach((pageObj) => {
    _pageCacheList[pageObj.pageid] = pageObj;
  });
  return _pageCacheList;
}

function manipulatePageData(pages, level, arrPageData, parentPageids, flag) {
  let appendPages = [];
  let pendingNodes = [];
  let nextParentNodePageids = [];

  for (let i = 0; i < pages.length; i++) {
    const pageContainerDic = pages[i];
    if (!pageContainerDic.hasOwnProperty("parentid")) {
      console.log("manage page without parent ?? ", pageContainerDic);
      pageContainerDic["parentid"] = "App";
    }

    if (!parentPageids && pageContainerDic.parentid === "App") {
      appendPages.push(pageContainerDic);
      nextParentNodePageids.push(pageContainerDic.pageid);
      //console.log("lastTabBasedPageid =>>>",  pageContainerDic.pageid, pageContainerDic.Title);
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
    manipulatePageData(
      pendingNodes,
      level,
      arrPageData,
      nextParentNodePageids,
      true
    );
    return;
  } else if (pendingNodes.length > 0) {
    console.log("zoombie nodes:", pendingNodes);
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
      if (item.id === node.parent) {
        item.children.push(node);
        item.childcount = item.children.length;
      }
    });
  });

  return _arrpage;
}

/* ********************************
 * setting TabsOrder key value whenever a page heirarchy changed
 * then update that in project data.
 ******************************** */

function updateTabsOrder(propsObj, projectData, pageObj, update) {
  let pagelist = propsObj["pageList"];
  if (pagelist && pagelist.length > 0) {
    let tabPages = [];
    for (let i = 0; i < pagelist.length; i++) {
      if (pagelist[i]["parentid"] === "App") {
        //console.log(i, ">>>", pagelist[i]['pageid'], "....", pagelist[i]['Title']);
        tabPages.push(Number(pagelist[i]["pageid"]));
      }
    }
    if (update === "add") {
      /*if(pageObj && pageObj['parentid'] === "App"){
            tabPages.push(Number(pageObj['pageid']));
          }*/
    } else {
      const index1 = tabPages.indexOf(Number(pageObj));
      if (index1 > -1) {
        tabPages.splice(index1, 1);
      }
    }
    projectData["TabsOrder"] = tabPages;
  }
}

function updateProjectData(propsObj, projectData, keytoupdate) {
  /*const updatedval = projectData[keytoupdate];

  var formData = new FormData();
  formData.append("command", "projectkeyupdate");
  formData.append("projectid", propsObj.appconfig['projectid']);
  formData.append("userid", propsObj.appconfig['userid']);
  formData.append("sessionid", propsObj.appconfig['sessionid']);
  formData.append("key", keytoupdate);
  formData.append("value", updatedval);  

  fetch(propsObj.appconfig.apiURL+"service.json", {
      method: 'POST',
      body: formData
  })
  .then((response) => response.json())
  .then(
    (result) => {
      if(result.response === "NACK"){
        var _err = {message: result.error};
        console.log("projectkeyupdate NACK >>>", _err.message);
      }
      else{
        console.log("projectkeyupdate ACK >>> Success");
      }
    },
    (error) => {
      console.log("projectkeyupdate Error >>> Fail");
    }
  )*/

  var formData = new FormData();
  formData.append("command", "projectupdate");
  formData.append("userid", propsObj.appconfig.userid);
  formData.append("sessionid", propsObj.appconfig.sessionid);
  formData.append("projectid", propsObj.appconfig.projectid);

  var keyObj = {};
  var arrKeys = keytoupdate.split(",");
  for (let index = 0; index < arrKeys.length; index++) {
    const elemKey = arrKeys[index];
    keyObj[elemKey] = projectData[elemKey];
  }
  let text = new File([JSON.stringify(keyObj)], "updateProject.txt", {
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

/* ********************************
 * setting CreatedPageData, DeletedPageData keys value
 * and then project data in case of multi-dev.
 ******************************** */

function updateCreateDeletePageData(pageobj, projectdata, acttype) {
  if (acttype === "delete") {
    if (!projectdata.hasOwnProperty("DeletedPageData")) {
      projectdata["DeletedPageData"] = [];
    }
    projectdata["DeletedPageData"].push(pageobj);

    const pagename = pageobj["pagename"];
    if (projectdata.hasOwnProperty("CreatedPageData")) {
      let cpd = projectdata["CreatedPageData"];
      for (let i = 0; i < cpd.length; i++) {
        const cpage = cpd[i];
        if (cpage["pagename"] === pagename) {
          cpd.splice(i, 1);
        }
      }
    }
  } else {
    if (!projectdata.hasOwnProperty("CreatedPageData")) {
      projectdata["CreatedPageData"] = [];
    }
    if (acttype === "cutrename") {
      const pageid = pageobj["pageid"];
      if (projectdata.hasOwnProperty("CreatedPageData")) {
        let cupd = projectdata["CreatedPageData"];
        for (let k = 0; k < cupd.length; k++) {
          const cupage = cupd[k];
          if (cupage["pageid"] === pageid) {
            let prObj = cupd.splice(k, 1);
            prObj[0]["timestamp"] = getCurrentDateTime();
            projectdata["DeletedPageData"].push(prObj[0]);
          }
        }
      }
    }
    const ts =
      pageobj["Document"][0]["key"] === "createddatetime"
        ? pageobj["Document"][0]["value"]
        : "";
    let cpageObj = {
      pageid: pageobj.pageid,
      pagename: pageobj["Title"],
      timestamp: ts,
    };
    if (acttype === "cutrename") {
      cpageObj["timestamp"] = getCurrentDateTime();
    }
    projectdata["CreatedPageData"].push(cpageObj);

    const pageTitle = pageobj["Title"];
    if (projectdata.hasOwnProperty("DeletedPageData")) {
      let dpd = projectdata["DeletedPageData"];
      for (let j = 0; j < dpd.length; j++) {
        const dpage = dpd[j];
        if (dpage["pagename"] === pageTitle) {
          dpd.splice(j, 1);
        }
      }
    }
  }
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
        let ownerObj = _contributors.filter(function (node) {
          if (node.contributorName === _ownerName) {
            return node;
          }
          return node.contributorName === _ownerName;
        });
        if (ownerObj.length > 0) {
          const contributorPages = ownerObj[0]["selectTabPages"];
          if (contributorPages.length === 0) {
            const selectedTabModule = propsObj["contributorTabs"]
              ? propsObj["contributorTabs"]
              : ["none"];
            if (selectedTabModule && selectedTabModule.length > 0) {
              if (selectedTabModule[0] !== "none") {
                //setErrorMessage("Contributor's selected pages already released. Thereafter changes will be discarded during merge.");
                //setErrorDisplay(true);
                //projectdata['Contributors'] = result['Contributors'];
                updateContributorsData(result["Contributors"], projectdata);
              } else {
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
  let text = new File([prjctData], "updateProject.txt", { type: "text/plain" });
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

function getCurrentDateTime() {
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

  return strDate;
}

function mapStateToProps(state) {
  console.log("STATE:", state);
  return {
    apiParam: state.appParam.params,
    moduleName: state.appParam.moduleName,
    appData: state.appData.data,
    pageList: state.appData.pagelist,
    contributorTabs: state.appData.contributortabs,
    openedPages: state.selectedData.pages,
    currentPage: state.selectedData.pagedata,
    pageChildren: state.selectedData.paeChildren,
    currentUI: state.selectedData.uidata,
    targetEditor: state.selectedData.editor,
    editorState: state.selectedData.editorState,
    contentEditorParent: state.selectedData.editorParent,
  };
}
export default connect(mapStateToProps)(PopupPageList);
