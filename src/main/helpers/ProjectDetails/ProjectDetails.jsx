import React, { useState } from "react";
import { connect } from "react-redux";
import "./ProjectDetailsStyle.css";
import PropTypes from "prop-types";
import {
  Devices,
  ExpandMore,
  SettingsSuggest,
  Close,
} from "@mui/icons-material";
import {
  AppBar,
  Tab,
  Tabs,
  Snackbar,
  Tooltip,
  Popover,
  Select,
  Checkbox,
  FormControlLabel,
  IconButton,
  LinearProgress,
  CircularProgress,
  TextField,
  Accordion,
  AccordionDetails,
  Typography,
  AccordionSummary,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  SvgIcon,
  Box,
} from "@mui/material";

import ProjectValidation from "../ProjectValidation/ProjectValidation";
import ResourceEditor from "../../editors/ResourceEditor/ResourceEditor";

import {
  setAutoSaving,
  setAllPageChanged,
  setProjectData,
  setEditorState,
  setAppCredentials,
  setDefaultScreenIndex,
} from "../../ServiceActions";
import LoginWindow from "../../../components/LoginWindow/LoginWindow";
import { getTabModuleAccess, checkProjectRole } from "../Utility";
import AlertStyleEditor from "../../editors/AlertStyleEditor/AlertStyleEditor";
import DatabaseDetail from "../../editors/DatabaseDetail/DatabaseDetail";
import ScreenEditor from "../../editors/ScreenEditor/screenEditor";
import AppVariableEditor from "../../editors/AppVariableEditor/appVariableEditor";

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

class ProjectDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoaded: false,
      isSessionError: false,

      projectData: this.props.data,
      isContributorWorking: false,
      isProjectRoleOwner: true,
    };
  }

  componentDidMount() {
    //console.log("............. ProjectDetails componentDidMount ............");
    const _projectData = this.state.projectData;
    if (_projectData.hasOwnProperty("Contributors")) {
      const contributors = _projectData["Contributors"];
      let contributorObj = contributors.filter(function (node) {
        if (
          node["contributorName"] !== _projectData["owner"] &&
          node["contributorProjectid"] !== _projectData["projectid"]
        ) {
          const contributorModules = node["selectTabPages"];
          if (contributorModules && contributorModules.length > 0) {
            return true;
          }
          return false;
        }
        return false;
      });
      if (contributorObj.length > 0) {
        this.setState({ isContributorWorking: true });
      }

      const _projectRole = checkProjectRole(_projectData);
      if (_projectRole === "contributor") {
        this.setState({ isProjectRoleOwner: false });
      } else {
        this.setState({ isProjectRoleOwner: true });
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {}

  componentWillUnmount() {
    clearTimeout(this.intervalID);
  }

  handleAutoSaving(autosave) {
    //console.log(autosave, "Enable Auto Saving", this.props.currentPage);
    this.props.dispatch(setAutoSaving(autosave));

    if (autosave) {
      var self = this;
      this.intervalID = setInterval(() => {
        let currentpage = self.props.currentPage;
        this.fetchUpdatePage(currentpage, self.props.appconfig);
      }, 60000);
    } else {
      //console.log("clearInterval......", this.intervalID);
      clearInterval(this.intervalID);
    }
  }

  fetchUpdatePage(page, appConfig) {
    //console.log("fetchUpdatePage......", this.props);
    this.props.dispatch(setAllPageChanged(false));
    if (page && page["pageid"]) {
      this.updateDocument_forPage(page);
      page["IconTitle"] = page["TabBase"]["icontitle"];

      var formData = new FormData();
      formData.append("command", "pageupdate");
      formData.append("userid", appConfig.userid);
      formData.append("sessionid", appConfig.sessionid);
      formData.append("projectid", appConfig.projectid);
      formData.append("pageid", page.pageid);

      let _jsonforsave = JSON.stringify(page);
      var pageData = encodeURIComponent(_jsonforsave);
      let text = new File([pageData], "updatePage.txt", { type: "text/plain" });
      formData.append("file", text);

      return fetch(appConfig.apiURL + "multipartservice.json", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((result) => {
          //result = {"response":"ACK","count":1,"page":{....},"command":"pageupdate"}
          //console.log('pageupdate result:', result);
          if (result.response === "NACK") {
            console.log("pageupdate : Error >>", result.error);
          } else {
            console.log("pageupdate : Success >> ", result.page);
          }
          return result;
        })
        .catch((error) => {
          console.error("pageupdate : catch >>", error);
        });
    }
  }
  updateDocument_forPage(pageObj) {
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
    }

    let _pageUpdateDT = docObj.filter(function (node) {
      return node.key === "lastupdatedatetime";
    });
    if (_pageUpdateDT.length === 0) {
      let createdObj = { key: "lastupdatedatetime", value: strDate };
      docObj.push(createdObj);
    } else {
      _pageUpdateDT[0]["value"] = strDate;
    }
  }

  handleProjectUpdate(projectData) {
    if (projectData) {
      const screenDefs = projectData["availableScreens"];
      if (screenDefs) {
        screenDefs.forEach((screenDef) => {
          if (
            screenDef["orientation"] === "Landscape" &&
            parseInt(screenDef["width"]) < parseInt(screenDef["height"])
          ) {
            const screenClone = JSON.parse(JSON.stringify(screenDef));
            screenDef["width"] = parseInt(screenClone["height"]);
            screenDef["height"] = parseInt(screenClone["width"]);
          }
        });
      }
      this.props.dispatch(setProjectData(projectData));
      this.setState({ projectData: projectData });
    }
  }

  handlePageStates(_pagestates) {
    //console.log(".... handlePageStates >>>", _pagestates);
    this.props.dispatch(setEditorState({ _pagestates }));
  }

  handleAppCredentials(credentials) {
    this.props.dispatch(setAppCredentials(credentials));
  }

  handleDefaultScreen(screenId) {
    this.props.dispatch(setDefaultScreenIndex(screenId));
  }

  handleSetSSOEnable(ssocheck) {
    const projectData = this.state.projectData;
    if (projectData) {
      projectData["ssoEnable"] = ssocheck;
      this.props.dispatch(setProjectData(projectData));
      this.setState({ projectData: projectData });
    }
  }

  handleSetAppLaunchLog(logcheck, logtime) {
    const projectData = this.state.projectData;
    if (projectData) {
      projectData["logAppLaunch"] = logcheck;
      projectData["logAppLaunchTime"] = logtime;
      this.props.dispatch(setProjectData(projectData));
      this.setState({ projectData: projectData });
    }
  }

  render() {
    const appConfig = {
      apiURL: this.props.appconfig.apiURL,
      userid: this.props.appconfig.userid,
      sessionid: this.props.appconfig.sessionid,
      projectid: this.props.appconfig.projectid,
    };
    const selectedData = {
      pageList: this.props.pageList,
      openedPages: this.props.openedPages,
      pagesState: this.props["openedPagesState"],
      allpagesUpdated: this.props["allpagesUpdated"],
      changedPagesId: this.props["changedPagesId"],
      selectedTabs: this.props["contributorTabs"],
    };
    const { isContributorWorking, isProjectRoleOwner } = this.state;
    const defaultScrId = this.props.defaultScreenId
      ? parseInt(this.props.defaultScreenId)
      : 0;
    const counter = -1;

    return (
      <ProjectDetail
        appconfig={appConfig}
        data={this.state.projectData}
        updatedData={this.props.appData}
        selectedData={selectedData}
        defaultScreenId={defaultScrId}
        counter={counter}
        isContributorWorking={isContributorWorking}
        isProjectRoleOwner={isProjectRoleOwner}
        onSetAutoSaving={this.handleAutoSaving.bind(this)}
        onSavePageData={this.fetchUpdatePage.bind(this)}
        onProjectUpdateSuccess={this.handleProjectUpdate.bind(this)}
        onResetPageStates={this.handlePageStates.bind(this)}
        onRelogin={this.handleAppCredentials.bind(this)}
        onSetDefaultScreen={this.handleDefaultScreen.bind(this)}
        onEnableSSO={this.handleSetSSOEnable.bind(this)}
        onAppLaunchLog={this.handleSetAppLaunchLog.bind(this)}
      />
    );
  }
}

function ProjectDetail(props) {
  const apiParam = {
    apiURL: props.appconfig.apiURL,
    userid: props.appconfig.userid,
    sessionid: props.appconfig.sessionid,
    projectid: props.appconfig.projectid,
  };
  const projectdata = props.data;

  let savedpagecounter = props.counter;
  const [showWait, setWaiting] = React.useState(false);
  const [errordisplay, setErrorDisplay] = React.useState(false);
  const [errormessage, setErrorMessage] = React.useState("");

  function handleErrorDisplayClose(event) {
    setErrorDisplay(false);
  }

  /////////////////////////////////////////////
  // Functionalities on Project Preview
  ////////////////////////////////////////////

  const [anchorPreview, setAnchorPreview] = React.useState(null);
  const openPreview = Boolean(anchorPreview);

  const [screens, setScreens] = React.useState([]);
  const [selectedScreen, setSelectedScreen] = React.useState(
    props.defaultScreenId
  );

  const [isSessionError, setSessionError] = React.useState(false);

  function handlePreviewOpen(event) {
    setAnchorPreview(event.currentTarget);
    setScreens(projectdata["availableScreens"]);
  }
  function handlePreviewClose() {
    setAnchorPreview(null);
  }
  function handleChangeScreen(event) {
    let scrId = event.currentTarget.value;
    setSelectedScreen(scrId);
  }

  function filter_changedPagelist(allPages, pagesId) {
    let changedPagelist = [];
    for (let i = 0; i < allPages.length; i++) {
      if (pagesId.length > 0) {
        const isPageIdSelected =
          pagesId.indexOf(allPages[i]["pageid"]) > -1 ? true : false;
        if (isPageIdSelected) {
          changedPagelist.push(allPages[i]);
        }
      }
    }
    return changedPagelist;
  }

  function handleMobilePreview() {
    handlePreviewClick("mobile");
  }
  function handleDesktopPreview() {
    handlePreviewClick("desktop");
  }
  function handlePreviewClick(type) {
    let previewType = type ? type : "mobile";
    let pagelist = props["selectedData"]["pageList"];
    if (pagelist.length === 0) {
      setErrorMessage("App don't have any page data to preview.");
      setErrorDisplay(true);
    } else {
      fetchContributorsData().then((result) => {
        if (result.response !== "ACK") {
          var _err = { message: result.error };
          console.log("project_contributors NotACK >>", _err);
          setPreviewCall();
        } else {
          //console.log(projectdata, ".... project_contributors >>", result);
          //{"response":"ACK", "Contributors":[{}, ...], "count":..}
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
                const selectedTabModule = props.selectedData["selectedTabs"];
                if (selectedTabModule && selectedTabModule.length > 0) {
                  if (selectedTabModule[0] !== "none") {
                    setErrorMessage(
                      "Contributor's selected pages already released. Thereafter changes will be discarded during merge."
                    );
                    setErrorDisplay(true);
                    projectdata["Contributors"] = result["Contributors"];
                  }
                }
              } else {
                updateContributorsData(result["Contributors"]);
              }
            }
            //projectdata['Contributors'] = result['Contributors'];
            setPreviewCall(previewType);
          }
        }
      });
    }
  }

  function updateContributorsData(resultData) {
    //console.log(projectdata['owner'], "***************", projectdata['Contributors'], "======", resultData);
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

  function setPreviewCall(previewType) {
    handlePreviewClose();
    setWaiting(true);
    //console.log(savedataOnly, "...... setPreviewCall ........", props.selectedData['allpagesUpdated']);
    const _selectedData = props.selectedData;

    let _openedPages;
    if (savedataOnly || _selectedData["allpagesUpdated"]) {
      _openedPages = _selectedData["pageList"];
    } else if (
      _selectedData.hasOwnProperty("changedPagesId") &&
      _selectedData["changedPagesId"].length > 0
    ) {
      _openedPages = filter_changedPagelist(
        _selectedData["pageList"],
        _selectedData["changedPagesId"]
      );
      //console.log(_selectedData.changedPagesId, "......_selectedData >>>>", _openedPages);
    } else {
      _openedPages = _selectedData["openedPages"];
      /*if(_selectedData['selectedTabs']) {
                if(_selectedData['selectedTabs'].length === 1 && _selectedData['selectedTabs'][0] === 'none') {
                    _openedPages = []; 
                }
            }*/
    }

    if (_openedPages.length > 0) {
      savedpagecounter = _openedPages.length;
      savePages(_openedPages, previewType);
    } else {
      saveProjectData(previewType);
    }
  }

  function savePages(_openedPages, previewType) {
    const pagecounter = savedpagecounter - 1;
    const page = _openedPages[pagecounter];
    if (page) {
      const _validateData = validatePageData(
        page,
        props.selectedData["pageList"],
        0
      );
      if (_validateData.length > 0) {
        setErrorMessage(
          "There are errors in page: " +
            page["Title"] +
            ". Please validate page/project."
        );
        setErrorDisplay(true);
        setWaiting(false);
        return;
      }

      let isAccess =
        projectdata["Contributors"] && projectdata["Contributors"].length > 1
          ? false
          : true;
      const saveAllPages = props.selectedData["allpagesUpdated"];
      if (saveAllPages && projectdata["ProjectRole"] === "owner") {
        isAccess = true;
      } else {
        const selectedTabModule = props.selectedData["selectedTabs"];
        if (selectedTabModule && selectedTabModule.length > 0) {
          if (selectedTabModule[0] !== "none") {
            isAccess = getTabModuleAccess(
              page,
              selectedTabModule,
              props.selectedData["pageList"]
            );
          }
        }
      }
      if (!isAccess) {
        //console.log(page, "****fetchUpdatePage.. getTabModuleAccess**", isAccess);
        savedpagecounter = savedpagecounter - 1;
        if (savedpagecounter > 0) {
          savePages(_openedPages);
        } else if (savedpagecounter === 0) {
          saveProjectData(previewType);
        }
      } else {
        props
          .onSavePageData(page, props.appconfig)
          .then((response) =>
            setPageSaveResponseHandler(response, _openedPages, previewType)
          )
          .catch((error) => {
            setWaiting(false);
            setErrorMessage(
              "Something went wrong. Please check Server/Internet connection."
            );
            setErrorDisplay(true);
          });
      }
      console.log(
        pagecounter,
        savedpagecounter,
        "page for save >>>>",
        page["pageid"],
        page["Title"]
      );
    } else {
      saveProjectData(previewType);
    }
  }
  function setPageSaveResponseHandler(response, _openedPages, previewType) {
    if (response["response"] === "ACK") {
      savedpagecounter = savedpagecounter - 1;

      resetPageState(response["page"], props.selectedData["pagesState"]);
    } else {
      const errormsg = response.error;
      if (
        typeof errormsg === "string" &&
        errormsg.indexOf("Invalid sessionid") > -1
      ) {
        savedpagecounter = -1;
        setSessionError(true);
      }
      setErrorMessage(response.error);
      setErrorDisplay(true);
      setWaiting(false);
    }
    //console.log(_openedPages,"...pages remained to save....", savedpagecounter);
    if (savedpagecounter > 0) {
      savePages(_openedPages);
    } else if (savedpagecounter === 0) {
      saveProjectData(previewType);
    }
  }

  function saveProjectData(previewType) {
    projectdata.isPreview = "1";
    projectdata.isPublish = "0";

    const screenDefs = projectdata["availableScreens"];
    setLandscapeScreen(screenDefs);

    if (props.isProjectRoleOwner) {
      let pagelist = props["selectedData"]["pageList"];
      if (pagelist.length > 0) {
        let tabPages = [];
        for (let i = 0; i < pagelist.length; i++) {
          if (pagelist[i]["parentid"] === "App") {
            //console.log(i, ">>>", pagelist[i]['pageid'], "....", pagelist[i]['Title']);
            tabPages.push(Number(pagelist[i]["pageid"]));
          }
        }
        projectdata["TabsOrder"] = tabPages;
      }
    } else {
      if (projectdata.hasOwnProperty("TabsOrder")) {
        delete projectdata["TabsOrder"];
      }
    }

    let isMultidev =
      projectdata["Contributors"] && projectdata["Contributors"].length > 1
        ? true
        : false;
    if (!isMultidev) {
      fetchUpdateProject(previewType);
    } else {
      updateProjectKeys("isPreview", true);
      updateProjectKeys("isPublish", true);
      if (projectdata["TabsOrder"]) {
        updateProjectKeys("TabsOrder", false);
      }
      if (projectdata["availableScreens"]) {
        updateProjectKeys("availableScreens", false);
      }

      props.onProjectUpdateSuccess(projectdata);

      fetchPreviewCall(previewType);
    }
  }
  function setLandscapeScreen(screenDefs) {
    screenDefs.forEach((screenDef) => {
      if (
        screenDef["orientation"] === "Landscape" &&
        parseInt(screenDef["width"]) > parseInt(screenDef["height"])
      ) {
        const screenClone = JSON.parse(JSON.stringify(screenDef));
        screenDef["width"] = parseInt(screenClone["height"]);
        screenDef["height"] = parseInt(screenClone["width"]);
      }
    });
  }
  function resetLandscapeScreen(screenDefs) {
    screenDefs.forEach((screenDef) => {
      if (
        screenDef["orientation"] === "Landscape" &&
        parseInt(screenDef["width"]) < parseInt(screenDef["height"])
      ) {
        const screenClone = JSON.parse(JSON.stringify(screenDef));
        screenDef["width"] = parseInt(screenClone["height"]);
        screenDef["height"] = parseInt(screenClone["width"]);
      }
    });
  }

  function resetPageState(pagedata, pagesState) {
    const updatepageid = pagedata["pageid"];
    let pageStatesArr = pagesState.hasOwnProperty("_pagestates")
      ? pagesState._pagestates
      : [];
    for (let index = 0; index < pageStatesArr.length; index++) {
      const _page = pageStatesArr[index];
      if (_page[updatepageid]) {
        //console.log(updatepageid, "relaodPageList >>>>>>>>>>>>>>>>>", _page[updatepageid]);
        let __pageState = _page[updatepageid];
        __pageState["init"][0] = JSON.parse(JSON.stringify(pagedata));
        __pageState["undo"] = __pageState["redo"] = [];
        //console.log("Means page opened, need to update state >>>>>>>>", __pageState);
      }
    }
    props.onResetPageStates(pageStatesArr);
  }

  function fetchUpdateProject(previewType) {
    var formData = new FormData();
    formData.append("command", "projectupdate");
    formData.append("userid", props.appconfig.userid);
    formData.append("sessionid", props.appconfig.sessionid);
    formData.append("projectid", props.appconfig.projectid);

    var prjctData = encodeURIComponent(JSON.stringify(projectdata));
    let text = new File([prjctData], "updateProject.txt", {
      type: "text/plain",
    });
    formData.append("file", text);

    fetch(props.appconfig.apiURL + "multipartservice.json", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        //result = {"response":"ACK","count":1,"command":"projectupdate","project":{....}}
        if (result.response === "NACK") {
          const errormsg = result.error;
          if (
            typeof errormsg === "string" &&
            errormsg.indexOf("Invalid sessionid") > -1
          ) {
            setSessionError(true);
          }

          var _err = { message: result.error };
          console.log("projectupdate : Error >>", _err);
          setErrorMessage(result.error);
          setErrorDisplay(true);
          setWaiting(false);
        } else {
          props.onProjectUpdateSuccess(result.project);

          if (!savedataOnly) {
            //set genappdb.db through 'createschemalocaldb'
            fetchCreateldbSchema();

            //call preview
            fetchPreviewCall(previewType);
          } else {
            setWaiting(false);
            //setSavedataOnly(false);
            savedataOnly = false;
          }
        }
      })
      .catch((error) => {
        console.error("projectupdate : catch >>", error);
        setWaiting(false);
        setErrorMessage(
          "Something went wrong. Please check Server/Internet connection."
        );
        setErrorDisplay(true);
      });
  }

  function fetchCreateldbSchema() {
    let _fetchLocalSchemaUrl =
      props.appconfig.apiURL +
      "service.json?command=createschemalocaldb&userid=" +
      props.appconfig.userid +
      "&sessionid=" +
      props.appconfig.sessionid +
      "&projectid=" +
      props.appconfig.projectid +
      "&tablename=spotdetail";
    fetch(_fetchLocalSchemaUrl, { method: "POST" })
      .then((res) => res.json())
      .then(
        (result) => {
          // {
          //    response: "ACK", count: 1, command: "createschemalocaldb",
          //    results:[{"tablename":"spotdetail","createschemalocaldb":"NACK"}] / [{"createschemalocaldb":"ACK"}]
          // }
          if (result.response !== "ACK") {
            var _err = { message: result.error };
            console.log(_err);
          } else {
            //console.log("createschemalocaldb >>", result['results']);
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  function fetchPreviewCall(previewType) {
    const screenDef = projectdata["availableScreens"];
    resetLandscapeScreen(screenDef);
    //console.log("fetchPreviewCall screenDef >>>>", screenDef);
    const _scrIndex = selectedScreen ? selectedScreen : 0;

    let _fetchPreviewUrl =
      props.appconfig.apiURL +
      "service.json?command=temppublish&userid=" +
      props.appconfig.userid +
      "&sessionid=" +
      props.appconfig.sessionid +
      "&projectid=" +
      props.appconfig.projectid +
      "&screenId=" +
      _scrIndex +
      "&language=en&version=4.0";
    fetch(_fetchPreviewUrl, { method: "POST" })
      .then((res) => res.json())
      .then(
        (result) => {
          // {response: "ACK", count: 1, command: "temppublish", previewURL: "...." }
          if (result.response === "ACK") {
            let _previewSecureURL = result["previewURL"];
            if (_previewSecureURL && _previewSecureURL.indexOf("https") > -1) {
              const screenDic = screenDef[_scrIndex];
              let path = window.location.href.split("/index.html")[0];
              let _previewUrl =
                path +
                "/assets/preview.html?iurl=" +
                _previewSecureURL +
                "?height=" +
                screenDic["height"] +
                "&width=" +
                screenDic["width"];
              if (path.indexOf("localhost") > -1) {
                _previewUrl = _previewSecureURL;
              }
              console.log("Preview URL ********************", _previewUrl);
              openPreviewWindow(_previewUrl, screenDic, previewType);
            } else {
              const _msg = "Preview generation failed. Please validate project";
              setErrorMessage(_msg);
              setErrorDisplay(true);
            }
          } else {
            var _err = { message: result.error };
            console.log(_err);
            setErrorMessage(result.error);
            setErrorDisplay(true);
          }
          setWaiting(false);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  function openPreviewWindow(_url, _screen, previewType) {
    console.log("open...previewType >>>", previewType);

    const _hei =
      previewType === "mobile" ? _screen["height"] + 4 : window.innerHeight;
    const _wid =
      previewType === "mobile" ? _screen["width"] + 4 : window.innerWidth;
    var _args =
      "height=" +
      _hei +
      ",width=" +
      _wid +
      ",left=300,top=150,menubar=no,statusbar=no,toolbar=no,scrollbars=no,location=no,modal=yes";
    window.open(_url, "Application Preview", _args);
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
            setErrorMessage(result.error);
            setErrorDisplay(true);
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
        }
      );
  }

  function fetchContributorsData() {
    //const _url = "https://stagedevsrinivas.mobilous.com:8181/appexe/api/project_contributors.json?project_id=984";
    let _fetchContributorsData =
      props.appconfig.apiURL +
      "project_contributors.json?project_id=" +
      props.appconfig.projectid;
    return fetch(_fetchContributorsData)
      .then((res) => res.json())
      .then(
        (result) => {
          return result;
        },
        (error) => {
          //console.log("project_contributors Error >>", error);
          return { response: "ERROR", error: error["message"] };
        }
      );
  }

  function updateProjectKeys(keytoupdate, isStringType) {
    const updatedval = projectdata[keytoupdate];

    let apiurl = props.appconfig.apiURL;
    var formData = new FormData();
    if (isStringType) {
      apiurl = apiurl + "service.json";

      formData.append("command", "projectkeyupdate");
      formData.append("projectid", props.appconfig["projectid"]);
      formData.append("userid", props.appconfig["userid"]);
      formData.append("sessionid", props.appconfig["sessionid"]);
      formData.append("key", keytoupdate);
      formData.append("value", updatedval);
    } else {
      apiurl = apiurl + "multipartservice.json";
      formData.append("command", "projectupdate");
      formData.append("projectid", props.appconfig["projectid"]);
      formData.append("userid", props.appconfig["userid"]);
      formData.append("sessionid", props.appconfig["sessionid"]);
      var keyObj = {};
      var arrKeys = keytoupdate.split(",");
      for (let index = 0; index < arrKeys.length; index++) {
        const elemKey = arrKeys[index];
        keyObj[elemKey] = projectdata[elemKey];
      }
      let text = new File([JSON.stringify(keyObj)], "updateProject.txt", {
        type: "text/plain",
      });
      formData.append("file", text);
    }

    fetch(apiurl, {
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

  function handleSaveAllPages() {
    const arrPages = props.selectedData["pageList"];
    if (arrPages.length === 0) {
      setErrorMessage("No pages are there to save. Please verify.");
      setErrorDisplay(true);
      return;
    }

    setWaiting(true);

    var formData = new FormData();
    formData.append("command", "updateallpages");
    formData.append("userid", props.appconfig.userid);
    formData.append("sessionid", props.appconfig.sessionid);
    formData.append("projectid", props.appconfig.projectid);

    let objPages = { pages: arrPages };
    //console.log(objPages,"...SaveAllPages *************", JSON.stringify(objPages));
    //var pagesdata = encodeURIComponent(JSON.stringify(objPages));
    //let text = new File([pagesdata], "updateallpages.txt", {type: "text/plain"});
    let text = new File([JSON.stringify(objPages)], "updateallpages.txt", {
      type: "text/plain",
    });
    formData.append("file", text);

    fetch(props.appconfig.apiURL + "multipartservice.json", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("** updateallpages **", result);
        //result = {"response":"ACK","count":1,"command":"projectupdate","project":{....}}
        if (result.response === "NACK") {
          const errormsg = result.error;
          if (
            typeof errormsg === "string" &&
            errormsg.indexOf("Invalid sessionid") > -1
          ) {
            setSessionError(true);
          }

          var _err = { message: result.error };
          console.log("updateallpages : Error >>", _err);
          setErrorMessage(result.error);
          setErrorDisplay(true);
          setWaiting(false);
        } else {
          setErrorMessage("Success : pages data saved");
          setErrorDisplay(true);
          setWaiting(false);
        }
      })
      .catch((error) => {
        console.error("updateallpages : catch >>", error);
        setWaiting(false);
        setErrorMessage(
          "Something went wrong. Please check Server/Internet connection."
        );
        setErrorDisplay(true);
      });
  }

  /////////////////////////////////////////////
  // Functionalities on Project Setting
  ////////////////////////////////////////////

  const [anchorSetting, setAnchorSetting] = React.useState(null);
  const openSetting = Boolean(anchorSetting);

  function handleSettingClick(event) {
    setAnchorSetting(event.currentTarget);
  }
  function handleSettingClose() {
    setAnchorSetting(null);
  }

  const [enableAutoSave, setAutoSave] = React.useState(false);
  function handleAutoSavingClick(event) {
    setAutoSave(event.target.checked);
    props.onSetAutoSaving(event.target.checked);

    handleSettingClose();
  }

  const [enableSSO, setSSOEnable] = React.useState(props.data["ssoEnable"]);
  function handleSSOEnableClick(event) {
    setSSOEnable(event.target.checked);
    props.onEnableSSO(event.target.checked);

    //handleSettingClose();
    const _msg = "Preview is must to save this change.";
    setErrorMessage(_msg);
    setErrorDisplay(true);
  }

  const [islogAppLaunch, setLogAppLaunch] = React.useState(
    props.data["logAppLaunch"]
  );
  const [thresholdTime, setThresholdTime] = React.useState(
    props.data["logAppLaunchTime"]
  );
  function handleAppLaunchLog(event) {
    setLogAppLaunch(event.target.checked);
    props.onAppLaunchLog(event.target.checked, thresholdTime);
    const _msg = "Preview is must to save changes.";
    setErrorMessage(_msg);
    setErrorDisplay(true);
  }
  function handleThresholdTime(event) {
    const _time = parseInt(event.currentTarget.value);
    setThresholdTime(_time);
    props.onAppLaunchLog(islogAppLaunch, _time);
  }

  const [opensetscreen, showDefaultScreenPopup] = useState(false);
  function handleDefaultScreenClick(event) {
    const _openedPages = props.selectedData["openedPages"];
    if (_openedPages && _openedPages.length > 0) {
      setErrorMessage("Please close all opened pages.");
      setErrorDisplay(true);
    } else {
      showDefaultScreenPopup(true);
      handleSettingClose();
    }
  }
  function handleCloseDefaultScreen() {
    showDefaultScreenPopup(false);
  }
  function handleSetDefaultScreen(scrId) {
    props.onSetDefaultScreen(scrId);
    showDefaultScreenPopup(false);
  }

  function handleEventsClick(event) {
    console.log(
      "Project Events Handler",
      projectdata["appEvents"],
      projectdata["pnEvents"]
    );
    //applicationDidEnterBackground
    //applicationIdleTimeout
    handleSettingClose();
  }

  const [openvalidation, setOpenValidationView] = React.useState(false);
  function handleValidationClick(event) {
    setOpenValidationView(true);
  }
  function handleCloseValidations() {
    setOpenValidationView(false);
    handleSettingClose();
  }

  const [opencloudconfig, setOpenCloudConfigView] = React.useState(false);
  function handleCloudConfigClick(event) {
    setOpenCloudConfigView(true);
  }
  function handleCloseCloudConfig() {
    setOpenCloudConfigView(false);
    handleSettingClose();
  }

  ///////////////////// Style Editor ///////////////////////

  const [openstyleeditor, setStyleEditor] = React.useState(false);
  //const [savedataOnly, setSavedataOnly] = React.useState(false);

  function handleStyleEditorClick(event) {
    const _openedPages = props.selectedData["openedPages"];
    if (_openedPages.length === 0) {
      setStyleEditor(true);
    } else {
      setErrorMessage("Please close all opened pages.");
      setErrorDisplay(true);
    }
  }

  let savedataOnly = false;
  function handleCloseStyleEditor(param) {
    setStyleEditor(false);

    if (param !== "") {
      //setSavedataOnly(true);
      savedataOnly = true;
      if (param === "apply") {
        setWaiting(true);
        fetchUpdateProject();
      } else if (param === "applysave") {
        console.log(
          props["selectedData"],
          projectdata["AppStyle"]["PageStyle"],
          "... applysave >>>",
          props["selectedData"]["pageList"]
        );
        const allPages = props["selectedData"]["pageList"];
        for (let i = 0; i < allPages.length; i++) {
          let pageObj = allPages[i];
          updatePageDicwithStyle(pageObj);
        }
        handlePreviewClick();
      }
    }
  }
  function updatePageDicwithStyle(pageDic) {
    const appPageStyle = projectdata["AppStyle"]["PageStyle"];
    if (appPageStyle && appPageStyle.length > 0) {
      //console.log(pageDic, "...... updatePageDic ----->>>>>", appPageStyle);
      const pageBGcolor = getStylePropValue(
        appPageStyle,
        "body",
        "background-color"
      );
      if (pageDic["viewType"] === "ScrollView") {
        pageDic.Children[0]["backgroundColor"] = pageBGcolor;
      } else {
        pageDic["backgroundColor"] = pageBGcolor;
      }

      if (pageDic["viewType"].indexOf("TableView") > -1) {
        const cellBGcolor = getStylePropValue(
          appPageStyle,
          "table",
          "cell-color"
        );
        pageDic.Children[0].Group[0]["RecordCellDef"]["backgroundColor"] =
          cellBGcolor;
        pageDic.Children[0].Group[0]["RecordCellDef"]["alternatingRowColors1"] =
          cellBGcolor;
        const cellAlternatecolor = getStylePropValue(
          appPageStyle,
          "table",
          "alternate-cell-color"
        );
        pageDic.Children[0].Group[0]["RecordCellDef"]["alternatingRowColors2"] =
          cellAlternatecolor;
      }

      pageDic["_navigationBars"][0]["tintColor"] = getStylePropValue(
        appPageStyle,
        "navbar",
        "background-color"
      );
      //pageDic['_navigationBars'][0]['barHidden'] = !(getStylePropValue(appPageStyle, 'navbar', 'visible'));
      //pageDic['NavigationBarHidden'] = pageDic['_navigationBars'][0]['barHidden'];

      pageDic["TabTintColor"] = getStylePropValue(
        appPageStyle,
        "tabbar",
        "background-color"
      );
      //pageDic['_tabBarHiddens'][0] = !(getStylePropValue(appPageStyle, 'tabbar', 'visible'));

      pageDic["_toolBarTop"][0]["backgroundColor"] = getStylePropValue(
        appPageStyle,
        "topnav",
        "background-color"
      );
      //pageDic['_toolBarTop'][0]['hidden'] = !(getStylePropValue(appPageStyle, 'topnav', 'visible'));

      pageDic["_toolBarBottom"][0]["backgroundColor"] = getStylePropValue(
        appPageStyle,
        "bottomnav",
        "background-color"
      );
      //pageDic['_toolBarBottom'][0]['hidden'] = !(getStylePropValue(appPageStyle, 'bottomnav', 'visible'));

      pageDic["_toolBarLeft"][0]["backgroundColor"] = getStylePropValue(
        appPageStyle,
        "leftnav",
        "background-color"
      );
      //pageDic['_toolBarLeft'][0]['hidden'] = !(getStylePropValue(appPageStyle, 'leftnav', 'visible'));

      pageDic["_toolBarRight"][0]["backgroundColor"] = getStylePropValue(
        appPageStyle,
        "rightnav",
        "background-color"
      );
      //pageDic['_toolBarRight'][0]['hidden'] = !(getStylePropValue(appPageStyle, 'rightnav', 'visible'));
    }

    return pageDic;
  }
  function getStylePropValue(pageStyleData, stylename, propname) {
    let propval = "#ffffff";
    let styleObj = getStyleObject(pageStyleData, stylename);
    if (styleObj.length > 0) {
      const styleData = styleObj[0];
      styleData["children"].forEach((element) => {
        if (element["name"] === propname) {
          if (element["type"] === "color") {
            propval = hextoRGB(element["value"]);
          } else {
            propval = element["value"];
          }
        }
      });
    }
    return propval;
  }
  function getStyleObject(pageStyleData, stylename) {
    let styleObj = pageStyleData.filter(function (node) {
      if (node["name"] === stylename) {
        return true;
      }
      return false;
    });

    return styleObj;
  }
  function hextoRGB(hex) {
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

  ///////////////////// Alert Style ///////////////////////

  const [openalertstyle, setAlertStyle] = React.useState(false);

  function handleAlertStyleWindow(event) {
    const _openedPages = props.selectedData["openedPages"];
    if (_openedPages.length === 0) {
      setAlertStyle(true);
    } else {
      setErrorMessage("Please close all opened pages.");
      setAlertStyle(true);
    }
  }

  function handleCloseAlertStyleEditor() {
    setAlertStyle(false);
  }

  function handleSubmitAlertStyle(styleObj) {
    projectdata["setAlertStyle"] = true;
    projectdata["alertStyleDic"] = styleObj;
    //console.log(styleObj, ".... handleSubmitAlertStyle >>>>>>>>>", projectdata);
    setAlertStyle(false);

    updateProjectKeys("setAlertStyle", false);
    updateProjectKeys("alertStyleDic", false);
  }

  ///////////////////// Resource Manager ///////////////////////

  function handleResourceUpdate(_func, _type, _resourceObj, _resourceData) {
    //console.log(_func, _type, _resourceObj, ".... updateResourceData >>>>>>>>>", _resourceData);
    if (_func === "add") {
      if (_type === "image") {
        projectdata.images.push(_resourceObj);
      } else if (_type === "video") {
        projectdata.videos.push(_resourceObj);
      } else if (_type === "bgm") {
        projectdata.bgms.push(_resourceObj);
      } else if (_type === "soundeffect") {
        projectdata.soundeffects.push(_resourceObj);
      } else {
        projectdata.others.push(_resourceObj);
      }
    } else if (_func === "remove") {
      const _resourcename = _resourceObj["filename"];
      if (_type === "image") {
        projectdata.images.forEach((image, index) => {
          if (image.filename === _resourcename) {
            projectdata.images.splice(index, 1);
          }
        });
      } else if (_type === "video") {
        projectdata.videos.forEach((video, index) => {
          if (video.filename === _resourcename) {
            projectdata.videos.splice(index, 1);
          }
        });
      } else if (_type === "bgm") {
        projectdata.bgms.forEach((bgm, index) => {
          if (bgm.filename === _resourcename) {
            projectdata.bgms.splice(index, 1);
          }
        });
      } else if (_type === "soundeffect") {
        projectdata.soundeffects.forEach((soundeffect, index) => {
          if (soundeffect.filename === _resourcename) {
            projectdata.soundeffects.splice(index, 1);
          }
        });
      } else {
        projectdata.others.forEach((other, index) => {
          if (other.filename === _resourcename) {
            projectdata.others.splice(index, 1);
          }
        });
      }
    }
  }

  /////////////////////// Screen Manager /////////////////////////

  function handleSaveAllPagesData() {
    console.log("handleSaveAllPagesData >>>>>", props.selectedData);
    handlePreviewClick();
    (result) => {
      if (result.response !== "ACK") {
        var _err = { message: result.error };
        console.log("project_contributors NotACK >>", _err);
        updateProjectData();
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
              const selectedTabModule = props.selectedData["selectedTabs"];
              if (selectedTabModule && selectedTabModule.length > 0) {
                if (selectedTabModule[0] !== "none") {
                  setErrorMessage(
                    "Contributor's selected pages already released. Thereafter changes will be discarded during merge."
                  );
                  setErrorDisplay(true);
                  projectdata["Contributors"] = result["Contributors"];
                }
              }
            } else {
              updateContributorsData(result["Contributors"]);
            }
          }
          //projectdata['Contributors'] = result['Contributors'];
          updateProjectData();
        }
      }
    };
  }

  /*function updateProjectData() {
        var formData = new FormData();
        formData.append("command", "projectupdate");
        formData.append("userid", props.appconfig.userid);
        formData.append("sessionid", props.appconfig.sessionid);
        formData.append("projectid", props.appconfig.projectid);

        var prjctData = encodeURIComponent(JSON.stringify(projectdata));
        let text = new File([prjctData], "updateProject.txt", {type: "text/plain"});
        formData.append("file", text);

        fetch(props.appconfig.apiURL+"multipartservice.json", {
            method: 'POST',
            body: formData
        })
        .then((response) => response.json())
        .then((result) => {
            //result = {"response":"ACK","count":1,"command":"projectupdate","project":{....}}
            if(result.response === "NACK"){
                const errormsg = result.error;
                if(typeof(errormsg) === "string" && errormsg.indexOf('Invalid sessionid') > -1) {
                    setSessionError(true);
                }

                var _err = {message: result.error};
                console.log("projectupdate : Error >>", _err);
                setErrorMessage(result.error);
                setErrorDisplay(true);
                setWaiting(false);
            }
            else{  
                props.onProjectUpdateSuccess(result.project);
                        
                handleSaveAllPages();
            }
        })
        .catch((error) => {
            console.error('projectupdate : catch >>', error);
            setWaiting(false);
            setErrorMessage("Something went wrong. Please check Server/Internet connection.");
            setErrorDisplay(true);
        });
    }*/

  /////////////////////////////////////////////////////////////

  const [value, setTabValue] = React.useState(0);
  const [expanded, setExpanded] = React.useState(false);
  const [snackbaropen, setSnackbarOpen] = React.useState(true);
  const [isallowtoUpdate, setAllowtoUpdate] = React.useState(true);
  function handleTabChange(event, newValue) {
    setTabValue(newValue);

    if (newValue === 2) {
      // screen settings
      const _projectData = props.data;
      if (_projectData && _projectData.hasOwnProperty("Contributors")) {
        const contributors = _projectData["Contributors"];
        if (contributors.length > 1) {
          // means contributors assigned
          let canOwnerAccess = true;

          for (let index = 0; index < contributors.length; index++) {
            const node = contributors[index];
            if (
              node["contributorName"] === _projectData["owner"] &&
              node["contributorProjectid"] === _projectData["projectid"]
            ) {
              //means owner project
              const ownerModules = node["selectTabPages"];
              if (ownerModules) {
                // && ownerModules.length > 0){
                console.log(props.selectedData["pageList"], ownerModules);
                const _pageList = props.selectedData["pageList"];
                let tabPageIDs = [];
                _pageList.forEach((page) => {
                  if (page["parentid"] === "App") {
                    tabPageIDs.push(page.pageid);
                  }
                });

                if (tabPageIDs.length !== ownerModules.length) {
                  //console.log("tabPageIDs >>>", tabPageIDs);
                  canOwnerAccess = false;
                }
              }
            } else {
              const contributorModules = node["selectTabPages"];
              if (contributorModules && contributorModules.length > 0) {
                canOwnerAccess = false;
              }
            }
          }

          if (!canOwnerAccess) {
            // commented below lines for 19801
            //setErrorMessage("Owner must have select all modules before making any change in screen setting.");
            //setErrorDisplay(true);
            setAllowtoUpdate(false);
          }
        }
      }
    }
  }

  const handleExpansion = (panel) => (event, isExpanded) => {
    //console.log(panel, "<< akshay >>", isExpanded);
    setExpanded(isExpanded ? panel : false);
  };

  function handleSnackbarClose(event, reason) {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  }

  return (
    <section className="project-credential-sidebar">
      {showWait && (
        <div className="backdropStyle" style={{ zIndex: 9999 }}>
          <Typography variant="h5" color="textSecondary" className="waitlabel">
            <CircularProgress style={{ marginRight: 12 }} />
            Please Wait ....
          </Typography>
        </div>
      )}
      <div>
        <Box
          sx={{
            marginRight: "1rem",
          }}
          display="flex"
          alignItems="center"
          justifyContent="end"
          gap={1}
        >
          <Tooltip title={<h6>Preview</h6>}>
            <Fab size="small" aria-label="setting" onClick={handlePreviewOpen}>
              <Devices size="large" />
            </Fab>
          </Tooltip>
          <Tooltip title={<h6>Settings</h6>}>
            <Fab
              size="small"
              aria-label="setting"
              className="credential-setting-icon"
              onClick={handleSettingClick}
            >
              <SettingsSuggest size="large" />
            </Fab>
          </Tooltip>
          <Tooltip title={<h6>Alert Style</h6>}>
            <Fab
              size="small"
              aria-label="setting"
              className="credential-alert-icon"
              onClick={handleAlertStyleWindow}
            >
              <SvgIcon>
                <path d="M16.24,11.51l1.57-1.57l-3.75-3.75l-1.57,1.57L8.35,3.63c-0.78-0.78-2.05-0.78-2.83,0l-1.9,1.9 c-0.78,0.78-0.78,2.05,0,2.83l4.13,4.13L3.15,17.1C3.05,17.2,3,17.32,3,17.46v3.04C3,20.78,3.22,21,3.5,21h3.04 c0.13,0,0.26-0.05,0.35-0.15l4.62-4.62l4.13,4.13c1.32,1.32,2.76,0.07,2.83,0l1.9-1.9c0.78-0.78,0.78-2.05,0-2.83L16.24,11.51z M9.18,11.07L5.04,6.94l1.89-1.9c0,0,0,0,0,0l1.27,1.27L7.73,6.8c-0.39,0.39-0.39,1.02,0,1.41c0.39,0.39,1.02,0.39,1.41,0 l0.48-0.48l1.45,1.45L9.18,11.07z M17.06,18.96l-4.13-4.13l1.9-1.9l1.45,1.45l-0.48,0.48c-0.39,0.39-0.39,1.02,0,1.41 c0.39,0.39,1.02,0.39,1.41,0l0.48-0.48l1.27,1.27L17.06,18.96z" />
                <path d="M20.71,7.04c0.39-0.39,0.39-1.02,0-1.41l-2.34-2.34c-0.47-0.47-1.12-0.29-1.41,0l-1.83,1.83l3.75,3.75L20.71,7.04z" />
              </SvgIcon>
            </Fab>
          </Tooltip>
        </Box>
      </div>
      <div>
        <ul
          className="project-credential-info-container"
          key={projectdata.projectid}
        >
          <li className="project-credential-list">
            <h4>Project Id: </h4>
            <h6>{projectdata.projectid}</h6>
          </li>
          <li className="project-credential-list">
            <h4>Project Name: </h4>
            <h6>{projectdata.ProjectName}</h6>
          </li>
          <li className="project-credential-list">
            <h4>Owner: </h4>
            <h6>{projectdata.owner}</h6>
          </li>
          <li className="project-credential-list">
            <h4>Version: </h4>
            <h6>{projectdata.version}</h6>
          </li>
          <li className="project-credential-list">
            <h4>Created at: </h4>
            <h6>{projectdata.createddatetime}</h6>
          </li>
        </ul>

        <Popover
          id="prjpreview-popover"
          className="project-popup-modal"
          open={openPreview}
          anchorEl={anchorPreview}
          onClose={handlePreviewClose}
          anchorOrigin={{ vertical: "center", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <div className="project-detail-credential-sidebar">
            <div className="project-credential-screen-resolution">
              <h4>Screen :</h4>
              <select
                className="resolution-option"
                value={selectedScreen}
                onChange={handleChangeScreen}
              >
                {screens.map((screen, id) => (
                  <option key={id} value={id}>
                    {screen.width} x {screen.height}
                  </option>
                ))}
                {/* </Select> */}
              </select>
            </div>
            <div className="preview-btn-container">
              <button
                className="preview-btn"
                onClick={() => handlePreviewClick("mobile")}
              >
                Preview
              </button>
            </div>
            {/* <div
              className="horizontal-align"
              style={{ height: 44, display: "none" }}
            >
              <Typography
                variant="subtitle2"
                style={{ width: 60, padding: "0px 4px" }}
              >
                Preview :
              </Typography>
              <IconButton
                color="inherit"
                style={{ padding: 8 }}
                aria-label="desktop-preview"
                onClick={handleMobilePreview}
              >
                <SmartphoneIcon />
              </IconButton>
              <IconButton
                color="inherit"
                style={{ padding: 8 }}
                aria-label="desktop-preview"
                onClick={handleDesktopPreview}
              >
                <DesktopIcon />
              </IconButton>
            </div> */}
          </div>
        </Popover>

        <Popover
          id="prjsettings-popover"
          className="project-popup-modal"
          open={openSetting}
          anchorEl={anchorSetting}
          onClose={handleSettingClose}
          anchorOrigin={{ vertical: "center", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <div className="project-poput-setting-modal">
            <button onClick={handleValidationClick}>Project Validation</button>
            <button
              style={{ display: "none" }}
              onClick={handleDefaultScreenClick}
            >
              Set Default Screen
            </button>

            <button style={{ display: "block" }} onClick={handleSaveAllPages}>
              Save All Pages
            </button>
            <Box
              className="label-box"
              display="flex"
              flexDirection={"column"}
              alignItems="center"
              justifyContent="end"
            >
              <FormControlLabel
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "end",
                }}
                value="start"
                labelPlacement="start"
                label={<h4>Auto Saving</h4>}
                control={
                  <Checkbox
                    color="default"
                    checked={enableAutoSave}
                    onChange={handleAutoSavingClick}
                  />
                }
              />
              <FormControlLabel
                style={{ display: "none" }}
                value="start"
                labelPlacement="start"
                label={
                  <Typography style={{ fontSize: "0.875rem" }}>
                    GA Enabled
                  </Typography>
                }
                control={
                  <Checkbox
                    color="default"
                    // checked={enableGA}
                    // onChange={handleGAEnabledClick}
                  />
                }
              />

              <FormControlLabel
                // style={{ marginLeft: 0 }}
                value="start"
                labelPlacement="start"
                label={<h4>SSO Enabled</h4>}
                control={
                  <Checkbox
                    color="default"
                    checked={enableSSO}
                    onChange={handleSSOEnableClick}
                  />
                }
              />
              <FormControlLabel
                // style={{ marginLeft: 0 }}
                value="start"
                labelPlacement="start"
                label={<h4>App Launch</h4>}
                control={
                  <Checkbox
                    color="default"
                    checked={islogAppLaunch}
                    onChange={handleAppLaunchLog}
                  />
                }
              />
            </Box>
            <button style={{ display: "none" }} onClick={handleEventsClick}>
              App Events
            </button>
            <button
              style={{ display: "none" }}
              color="default"
              onClick={handleCloudConfigClick}
            >
              Cloud Configuration
            </button>
            {openvalidation && (
              <ProjectValidation
                show={openvalidation}
                target="project"
                onCloseWindow={handleCloseValidations}
              />
            )}
            {opensetscreen && (
              <DefaultScreenPopup
                screens={projectdata["availableScreens"]}
                defaultScreenId={props.defaultScreenId}
                onSetDefaultScreen={handleSetDefaultScreen}
                onCloseWindow={handleCloseDefaultScreen}
              />
            )}
            {opencloudconfig && (
              <CloudConfigurationPopup
                data={projectdata}
                onCloseWindow={handleCloseCloudConfig}
              />
            )}
            {islogAppLaunch && (
              <div className="project-log-div">
                <Typography
                  variant="body2"
                  gutterBottom
                  style={{ marginRight: 0 }}
                >
                  Time threshold
                </Typography>
                <input
                  id="numinput"
                  className="project-numeric-input"
                  style={{ border: "1px solid #676767", paddingLeft: 2 }}
                  type="number"
                  value={thresholdTime}
                  min="2"
                  max="3600"
                  step="1"
                  onChange={handleThresholdTime}
                />
              </div>
            )}
          </div>
        </Popover>
        {openstyleeditor && (
          <StyleEditor
            show={true}
            appconfig={apiParam}
            pagelist={props.selectedData["pageList"]}
            isProjectRoleOwner={props.isProjectRoleOwner}
            isContributorWorking={props.isContributorWorking}
            onCloseEditor={handleCloseStyleEditor}
          />
        )}

        {openalertstyle && (
          <AlertStyleEditor
            show={true}
            appdata={projectdata}
            isProjectRoleOwner={props.isProjectRoleOwner}
            isContributorWorking={props.isContributorWorking}
            onCloseEditor={handleCloseAlertStyleEditor}
            onSubmitAlertStyle={handleSubmitAlertStyle}
          />
        )}
      </div>
      {errordisplay && <LinearProgress />}
      {isSessionError && (
        <LoginWindow
          loginid={props.appconfig.userid}
          onRelogin={handleRelogin}
        />
      )}
      <div>
        <AppBar position="static" color="default">
          <Tabs
            value={value}
            onChange={handleTabChange}
            indicatorColor="primary"
          >
            <Tab
              label={<h4 className="heading">Resources</h4>}
              wrapped
              className="project-credential-tab"
            />
            <Tab
              label={<h4 className="heading">Database</h4>}
              wrapped
              className="project-credential-tab"
            />
            <Tab
              label={<h4 className="heading">Screens</h4>}
              wrapped
              className="project-credential-tab"
            />
            <Tab
              label={<h4 className="heading">Variables</h4>}
              wrapped
              className="project-credential-tab"
            />
          </Tabs>
        </AppBar>
        {value === 0 && (
          <TabContainer>
            {!props.isProjectRoleOwner && (
              <h4>A contributor can manage "Image" only</h4>
            )}
            {resourceData(projectdata, props.appconfig.apiURL).map(
              (item, index) => (
                <Accordion
                  key={"rpanel" + index}
                  className="project-detail-panel"
                  expanded={expanded === "rpanel" + index}
                  onChange={handleExpansion("rpanel" + index)}
                >
                  <AccordionSummary
                    className="project-accordion-summary"
                    expandIcon={<ExpandMore />}
                    aria-controls="panela-content"
                    id="panela-header"
                  >
                    <Typography>
                      <h4>{item.title}</h4>
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className="project-detail-panel-detail">
                    <ResourceEditor
                      style={{ margin: 8 }}
                      appconfig={apiParam}
                      type={item.title}
                      data={item.data}
                      isProjectRoleOwner={props.isProjectRoleOwner}
                      updateResourceData={handleResourceUpdate}
                    />
                  </AccordionDetails>
                </Accordion>
              )
            )}
          </TabContainer>
        )}
        {value === 1 && (
          <TabContainer>
            {dbData(projectdata).map((item, index) => (
              <Accordion
                key={"dbpanel" + index}
                className="project-panel"
                expanded={expanded === "dbpanel" + index}
                onChange={handleExpansion("dbpanel" + index)}
              >
                <AccordionSummary
                  className="project-accordion-summary"
                  expandIcon={<ExpandMore />}
                  aria-controls="panelb-content"
                  id="panelb-header"
                >
                  <Typography>
                    <h4>{item.title}</h4>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className="project-detail-panel-detail">
                  <DatabaseDetail data={item} />
                </AccordionDetails>
              </Accordion>
            ))}
            <Snackbar
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              open={snackbaropen}
              onClose={handleSnackbarClose}
              autoHideDuration={10000}
              ContentProps={{
                "aria-describedby": "message-id",
              }}
              message={
                <span id="message-id">
                  <h6>Database can be edited via Console only.</h6>
                </span>
              }
            />
          </TabContainer>
        )}
        {value === 2 && (
          <TabContainer>
            {!props.isProjectRoleOwner && (
              <Typography
                variant="body2"
                gutterBottom
                className="project-detail-panel-helpdetail"
                style={{ marginRight: 0 }}
              >
                <h6>A contributor is not allowed to update</h6>
              </Typography>
            )}
            <div className="vertical-align" style={{ alignitems: "start" }}>
              {props.isContributorWorking && props.isProjectRoleOwner && (
                <Typography
                  variant="body2"
                  gutterBottom
                  className="project-detail-panel-helpdetail"
                  style={{ marginRight: 0 }}
                >
                  <h6>
                    Since contributor(s) is/are working on project. So any
                    update not allowed.
                  </h6>
                </Typography>
              )}
              {!props.isContributorWorking && props.isProjectRoleOwner && (
                <Typography
                  variant="body2"
                  gutterBottom
                  className="project-detail-panel-helpdetail"
                >
                  <h6>
                    Project 'preview' is must after any screen modification
                    (add/ delete/ edit).
                  </h6>
                </Typography>
              )}
              <Typography variant="caption"></Typography>
              <ScreenEditor
                show={true}
                appconfig={apiParam}
                pagelist={props.selectedData["pageList"]}
                screens={projectdata.availableScreens}
                isMasterScreenSet={projectdata.isMasterScreenSet}
                isProjectRoleOwner={props.isProjectRoleOwner}
                isContributorWorking={props.isContributorWorking}
                isallowtoUpdate={isallowtoUpdate}
                onSaveAllPagesData={handleSaveAllPagesData}
              />
            </div>
          </TabContainer>
        )}
        {value === 3 && (
          <TabContainer>
            {!props.isProjectRoleOwner && (
              <Typography
                variant="body2"
                gutterBottom
                className="project-detail-panel-helpdetail"
                style={{ marginRight: 0, display: "none" }}
              >
                A contributor is not allowed to update
              </Typography>
            )}
            {props.isContributorWorking && props.isProjectRoleOwner && (
              <Typography
                variant="body2"
                gutterBottom
                className="project-detail-panel-helpdetail"
                style={{ marginRight: 0, display: "none" }}
              >
                Since contributor(s) is/are working on project. So any update
                not allowed.
              </Typography>
            )}
            <AppVariableEditor
              show={true}
              appconfig={apiParam}
              data={projectdata}
              isProjectRoleOwner={props.isProjectRoleOwner}
              isContributorWorking={false}
            />
          </TabContainer>
        )}
      </div>
      <Snackbar
        open={errordisplay}
        message={errormessage}
        autoHideDuration={8000}
        onClose={handleErrorDisplayClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        action={
          <React.Fragment>
            <IconButton color="inherit" onClick={handleErrorDisplayClose}>
              <Close />
            </IconButton>
          </React.Fragment>
        }
      />
    </section>
  );
}

function DefaultScreenPopup(props) {
  const screens = props.screens;

  function handlePopupClose(event) {
    props.onCloseWindow();
  }

  const [selectedScreen, setSelectedScreen] = React.useState(
    props.defaultScreenId
  );
  function handleChangeScreen(event) {
    let scrId = event.currentTarget.value;
    setSelectedScreen(scrId);
  }

  function handleSetDefaultScreen() {
    //console.log(screens, "... DefaultScreenPopup >>>> ", selectedScreen);
    props.onSetDefaultScreen(selectedScreen);
  }

  return (
    <Dialog
      id="defaultscreendialog"
      open={true}
      scroll="paper"
      fullWidth={true}
      maxWidth="sm"
    >
      <DialogTitle onClose={handlePopupClose} className="project-popup-modal">
        Set Default Screen
      </DialogTitle>
      <DialogContent dividers>
        <div className="vertical-align">
          <Typography variant="subtitle1">
            For current session, all pages will be opened in selected screen
            dimension.
          </Typography>
          <div
            className="horizontal-align"
            style={{ paddingLeft: 24, paddingTop: 16 }}
          >
            <Typography variant="subtitle1">Screen :</Typography>
            <Select
              native
              value={selectedScreen}
              className="selected-screen"
              onChange={handleChangeScreen}
            >
              {screens.map((screen, id) => (
                <option key={id} value={id}>
                  {screen.width} x {screen.height}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <button
          color="default"
          variant="outlined"
          className="selected-screen-btn"
          onClick={handlePopupClose}
        >
          Cancel
        </button>
        <button
          className="selected-screen-btn"
          onClick={handleSetDefaultScreen}
        >
          Set
        </button>
      </DialogActions>
    </Dialog>
  );
}

function CloudConfigurationPopup(props) {
  const projectdata = props.data;

  const [configname, setConfigName] = React.useState("");
  const [showError, setShowError] = React.useState(false);

  function handleSetName(e) {
    let fields = configname;
    fields = e.target.value;
    if (fields.length > 2) {
      const allowedChars = /^[A-Za-z]{3,10}$/;
      let allowedTitle = fields.match(allowedChars);
      if (!allowedTitle) {
        setShowError(true);
        return;
      }

      setShowError(false);
    } else {
      setShowError(true);
    }
    setConfigName(fields);
  }

  function validateConfigName() {
    let fields = configname;
    let titleIsValid = true;

    if (!fields) {
      titleIsValid = false;
    }

    if (typeof fields !== "undefined") {
      const allowedChars = /^[A-Za-z]{3,10}$/;
      let allowedTitle = fields.match(allowedChars);
      if (!allowedTitle) {
        titleIsValid = false;
      }
      if (allowedTitle && fields.length > 10) {
        titleIsValid = false;
      }
    }

    setShowError(!titleIsValid);
    return titleIsValid;
  }

  function handleTitleFocus(e) {
    setShowError(false);
  }

  function handlePopupClose(event) {
    props.onCloseWindow();
  }

  function handleSetConfigName() {
    projectdata["clientCloud"] = configname;
    props.onCloseWindow();
  }

  return (
    <Dialog
      id="cloudconfigpopup"
      open={true}
      scroll="paper"
      fullWidth={true}
      maxWidth="sm"
    >
      <DialogTitle onClose={handlePopupClose} className="selected-screen-title">
        Set Cloud Configuration
      </DialogTitle>
      <DialogContent dividers>
        <div className="vertical-align">
          <TextField
            id="cconfigname"
            name="configname"
            required
            autoFocus
            fullWidth
            label="Set Config Name"
            value={configname}
            helperText="Only alphabets allowed, 3-10 characters only."
            error={showError}
            className="selected-screen-config-name"
            margin="normal"
            variant="outlined"
            onChange={handleSetName}
            onFocus={handleTitleFocus}
            onBlur={validateConfigName}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <button className="selected-screen-btn" onClick={handlePopupClose}>
          Cancel
        </button>
        <button className="selected-screen-btn" onClick={handleSetConfigName}>
          Set
        </button>
      </DialogActions>
    </Dialog>
  );
}

function resourceData(_projectdata, _apiURL) {
  let _resources = [];

  let _images = [];
  _projectdata.images.forEach((image) => {
    let _imgsrc =
      _apiURL +
      "download/image/" +
      _projectdata.projectid +
      "/" +
      image.filename;
    if (image.resourceid > 0) {
      let imgObj = {
        id: image.resourceid,
        name: image.filename,
        source: _imgsrc,
      };
      _images.push(imgObj);
    }
  });
  _resources.push({ title: "Image", data: _images });

  let _videos = [];
  _projectdata.videos.forEach((video) => {
    let _vidsrc =
      _apiURL +
      "download/video/" +
      _projectdata.projectid +
      "/" +
      video.filename;
    if (video.resourceid > 0) {
      let vidObj = {
        id: video.resourceid,
        name: video.filename,
        source: _vidsrc,
      };
      _videos.push(vidObj);
    }
  });
  _resources.push({ title: "Video", data: _videos });

  let _audios = [];
  _projectdata.bgms.forEach((audio) => {
    let _bgmsrc =
      _apiURL + "download/bgm/" + _projectdata.projectid + "/" + audio.filename;
    let bgmsObj = {
      id: audio.resourceid,
      name: audio.filename,
      source: _bgmsrc,
    };
    _audios.push(bgmsObj);
  });
  _resources.push({ title: "Audio", data: _audios });

  let _sounds = [];
  _projectdata.soundeffects.forEach((sound) => {
    let _sesrc =
      _apiURL +
      "download/soundeffect/" +
      _projectdata.projectid +
      "/" +
      sound.filename;
    let imgObj = { id: sound.resourceid, name: sound.filename, source: _sesrc };
    _sounds.push(imgObj);
  });
  _resources.push({ title: "Audio Recording", data: _sounds });

  /* let _gadgets = [];
    _projectdata.gadgets.forEach(gadget => {
        let gdtObj = {id:gadget.resourceid, name:gadget.filename};       
        _gadgets.push(gdtObj);
    });    
    _resources.push({title:"Gadget", data:_gadgets}); */

  return _resources;
}

function dbData(_projectdata) {
  let _dbs = [];

  let _ldbs = [];
  _projectdata.TableDefs.forEach((ldb) => {
    let ldbObj = {};
    if (ldb.view) {
      const _viewFields = ldb.fields ? ldb.fields : [];
      ldbObj = { name: ldb.tablename, type: "view", fields: _viewFields };
    } else if (ldb.trigger) {
      ldbObj = { name: ldb.triggername, type: "trigger", fields: [] };
    } else if (ldb.procedure) {
      ldbObj = { name: ldb.procedurename, type: "procedure", fields: [] };
    } else {
      ldbObj = { name: ldb.tablename, type: "table", fields: ldb.fields };
    }
    _ldbs.push(ldbObj);
  });
  _dbs.push({ title: "Local Database", data: _ldbs });

  let _rdbs = [];
  _projectdata.RemoteTableDefs.forEach((rdb) => {
    let rdbObj = { name: rdb.tablename, fields: rdb.fields };
    if (rdb.servicename !== "Mobilous") {
      rdbObj = { name: rdb.tablename, type: "plugin", fields: rdb.fields };
    } else {
      if (rdb.view) {
        const _viewFields = rdb.fields ? rdb.fields : [];
        rdbObj = { name: rdb.tablename, type: "view", fields: _viewFields };
      } else if (rdb.trigger) {
        rdbObj = { name: rdb.triggername, type: "trigger", fields: [] };
      } else if (rdb.procedure) {
        rdbObj = { name: rdb.procedurename, type: "procedure", fields: [] };
      } else {
        rdbObj = { name: rdb.tablename, type: "table", fields: rdb.fields };
      }
    }
    _rdbs.push(rdbObj);
  });
  _dbs.push({ title: "Remote Database", data: _rdbs });

  return _dbs;
}

function validatePageData(_page, pagelist, screenIndex) {
  let _validationError = [];

  const pagetitle = _page["Title"];
  const allowedChars = /\w/g;
  let allowedName = pagetitle.match(allowedChars);
  if (pagetitle.length !== allowedName.length) {
    const _title = "'" + pagetitle + "'";
    _validationError.push({
      type: _title,
      message: "Page Title: Only alphabets, numbers & underscore allowed.",
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
    });
  }

  /* let arrUIpartName = [];
    let _pageUIs = getAllChildrenOnPage(_page, screenIndex);
    _pageUIs.forEach(uipart => {
      arrUIpartName.push(uipart.uiParts[screenIndex]['name']);
    });
  
    const uiPartsNoDuplicates = [...new Set(arrUIpartName)];
    if(uiPartsNoDuplicates.length !== arrUIpartName.length) {
      let duplicates = [...arrUIpartName];
      uiPartsNoDuplicates.forEach((item) => {
        const i = duplicates.indexOf(item)
        duplicates = duplicates
        .slice(0, i)
        .concat(duplicates.slice(i + 1, duplicates.length));
      });
  
      let duplicateStr = duplicates.join(", ");
      _validationError.push({type:duplicateStr, message:"UI(s) has duplicate name"});
    } */

  return _validationError;
}

//export default ProjectDetails;
function mapStateToProps(state) {
  //console.log("ProjectDetails mapStateToProps >>>>>", state);
  return {
    apiParam: state.appParam.params,
    pageLocale: state.appParam.pagelocale,
    pageContainer: state.appParam.pagecontainer,
    pageConfig: state.appParam.pageconfig,
    appData: state.appData.data,
    pageList: state.appData.pagelist,
    allpagesUpdated: state.appData.allpageschanged,
    changedPagesId: state.appData.changedpages,
    contributorTabs: state.appData.contributortabs,
    openedPages: state.selectedData.pages,
    openedPagesState: state.selectedData.editorState,
    currentPage: state.selectedData.pagedata,
    pageChildren: state.selectedData.paeChildren,
    currentUI: state.selectedData.uidata,
    selectedUIs: state.selectedData.uiparts,
    targetEditor: state.selectedData.editor,
    contentEditorParent: state.selectedData.editorParent,
    defaultScreenId: state.appParam.screenId,
  };
}
export default connect(mapStateToProps)(ProjectDetails);
