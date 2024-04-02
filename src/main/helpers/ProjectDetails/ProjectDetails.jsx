import React from "react";
import { connect } from "react-redux";
import "./ProjectDetailsStyle.css";

import {
  setAutoSaving,
  setAllPageChanged,
  setProjectData,
  setEditorState,
  setAppCredentials,
  setDefaultScreenIndex,
} from "../../ServiceActions";
import { getTabModuleAccess, checkProjectRole } from "../Utility";

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
  const projectdata = props.data;

  let savedpagecounter = props.counter;

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

  let savedataOnly = false;

  return (
    <section className="project-credential-sidebar">
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
      </div>
    </section>
  );
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

  return _validationError;
}

function mapStateToProps(state) {
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
