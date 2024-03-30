import React from "react";
import { connect } from "react-redux";
import "./ProjectValidationStyle.css";
import {
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import warningimg from "../../../assets/warningimage.png";
import AlertWindow from "../../../components/AlertWindow";

import { setAllPageChanged } from "../../ServiceActions";
import {
  CheckCircle,
  Close,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Warning,
} from "@mui/icons-material";

class ProjectValidation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,

      actionLocale: [],
      actionList: [],

      projectError: "",
    };

    this.handleCloseWindow = this.handleCloseWindow.bind(this);
  }

  componentDidMount() {
    //console.log("ProjectValidation componentDidMount", this.props.show);

    this.fetchActionLocale("en").then((response) => this.fetchActionList());

    if (this.props.target !== "page") {
      this.validateProject(this.props.appData);
    }
  }

  fetchActionLocale(lang) {
    let localefilePath;
    if (lang === "ja" || lang === "jp") {
      localefilePath = "././locale/ja_JP/actionsproperties.json";
    } else {
      localefilePath = "././locale/en_US/actionsproperties.json";
    }

    return fetch(localefilePath)
      .then((res) => res.json())
      .then(
        (result) => {
          let actionLocale = result["ActionLocale"];
          this.setState({ actionLocale: actionLocale });
          return result;
        },
        (error) => {
          console.log("Page-Locale fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  fetchActionList() {
    return fetch("././config/ActionConfig.json")
      .then((res) => res.json())
      .then(
        (result) => {
          let actions = result["Actions"];
          actions = actions.filter(function (category) {
            return category.include === "true";
          });

          for (let index = 0; index < actions.length; index++) {
            const category = actions[index];
            let actionItems = category["items"];
            category["items"] = this.setActionListLocale(actionItems);
          }
          //console.log(this.state.actionLocale, "....Action-List with locale >>>", actions);
          this.setState({ actionList: actions });
        },
        (error) => {
          console.log("Action-list fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  setActionListLocale(actionItems) {
    actionItems.forEach((action, i) => {
      //console.log(i, this.state.actionLocale, "... setActionListLocale >>>", action);
      action = this.state.actionLocale.filter(function (item) {
        if (item.method === action.name) {
          action["text"] = item.properties[0]["text"];
          action["toolTip"] = item.properties[0]["toolTip"];
          action["locale"] = item.properties[0];
          return true;
        }
        return false;
      });
    });

    return actionItems;
  }

  validateProject(prjDic) {
    const propArray = [
      "Title",
      "ProjectName",
      "projectid",
      "RemoteTableDefs",
      "TableDefs",
      "availableScreens",
      "apptitledic",
    ];
    const strPropertyNotOwned = this.isOwnProperty(prjDic, propArray);
    if (strPropertyNotOwned.length > 0) {
      this.setState({ projectError: strPropertyNotOwned });
      return false;
    }

    let strErrorProject = this.state.projectError;
    if (prjDic.Title === null || prjDic.Title.length === 0) {
      strErrorProject += "Project Title, ";
    }
    if (prjDic.ProjectName === null || prjDic.ProjectName.length === 0) {
      strErrorProject += "Project Name, ";
    }
    if (prjDic.projectid === null || prjDic.projectid.length === 0) {
      strErrorProject += "Project id, ";
    }
    if (prjDic.RemoteTableDefs === null) {
      strErrorProject += "RemoteTable Definitions, ";
    }
    if (prjDic.TableDefs === null) {
      strErrorProject += "LocalTable Definitions, ";
    }
    if (
      prjDic.availableScreens === null ||
      prjDic.availableScreens.length === 0
    ) {
      strErrorProject += "Project Screens, ";
    }
    if (prjDic.apptitledic === null) {
      strErrorProject += "Project App-Titles, ";
    }

    if (strErrorProject.indexOf(", ") > -1) {
      strErrorProject =
        "Invalid value(s) of " +
        strErrorProject.slice(0, strErrorProject.lastIndexOf(", "));
    }
    this.setState({ projectError: strErrorProject });
  }

  isOwnProperty(dic, prop) {
    let notOwnedProperty = "";
    for (let i = 0; i < prop.length; i++) {
      if (!dic.hasOwnProperty(prop[i])) notOwnedProperty += prop[i] + ", ";
    }
    if (notOwnedProperty.indexOf(", ") > -1)
      notOwnedProperty = notOwnedProperty.slice(
        0,
        notOwnedProperty.lastIndexOf(", ")
      );

    return notOwnedProperty;
  }

  handleCloseWindow(e) {
    this.props.onCloseWindow();
  }

  handleabc() {
    this.props.dispatch(setAllPageChanged(true));
  }

  render() {
    const { show, projectError } = this.state;
    //console.log("ProjectValidation >>>", this.props);

    const target = this.props.target === "page" ? "Page" : "Project";
    const pages =
      this.props.target === "page"
        ? [this.props.currentPage]
        : this.props.pageList;
    const pageconfig = {
      config: this.props.pageConfig,
      locale: this.props.pageLocale,
    };
    const uiconfig = {
      config: this.props.uiConfig,
      locale: this.props.uiLocale,
    };
    //console.log(this.props.actionConfig, this.props.actionLocale, "....Action-List with locale >>>", this.state.actionList);

    return (
      <Dialog
        id="validationsdialog"
        open={show}
        scroll="paper"
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle className="project-validate-title">
          <h4>{target} Validation</h4>
          <IconButton aria-label="Close" onClick={this.handleCloseWindow}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          style={{ minHeight: "50vh", maxHeight: "75vh" }}
        >
          {this.state.actionList.length > 0 && (
            <ValidationView
              source={target}
              projectError={projectError}
              project={this.props.appData}
              pages={pages}
              pagelist={this.props.pageList}
              pageconfig={pageconfig}
              uiconfig={uiconfig}
              actionlist={this.state.actionList}
              onexecuteabc={this.handleabc.bind(this)}
            />
          )}
        </DialogContent>
        <DialogActions />
      </Dialog>
    );
  }
}

function ValidationView(props) {
  //console.log(props.source, "handle PageValidation >>>", props.actionlist);
  const displayTitle = props.source === "Project" ? true : false;
  const projectData = props.project;

  const projectError = props.projectError;
  const [showProjectWarning, setShowProjectWarning] = React.useState(false);
  function onClickProjectWarning() {
    setShowProjectWarning(!showProjectWarning);
  }

  const [openAlert, setOpenAlert] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");

  function alertCloseHandler() {
    setOpenAlert(false);
  }
  function alertOKHandler() {
    setOpenAlert(false);
  }

  const screens = projectData["availableScreens"];
  const [selectedScreen, setSelectedScreen] = React.useState(0);
  function handleChangeScreen(event) {
    let scrId = event.currentTarget.value;
    setSelectedScreen(scrId);
  }

  function onClickPageWarning(event) {
    const _dataobj = event.currentTarget.dataset;
    //console.log("PageWarning >>>", _dataobj);

    setAlertTitle("");
    let alertmsg = _dataobj["reason"];
    setAlertMessage(alertmsg);
    setOpenAlert(true);
  }

  function onClickUIpartWarning(event) {
    const _dataobj = event.currentTarget.dataset;
    //console.log("UIpartWarning >>>", _dataobj);

    setAlertTitle(""); //_dataobj['name']);
    let alertmsg = _dataobj["reason"]; //.replace("/n","");
    setAlertMessage(alertmsg);
    setOpenAlert(true);
  }

  ///////////////////////////////////////////////////////////////////////////////

  const [collapseProps, setCollapsePageUIs] = React.useState("");
  function handleExpandCollapse(event) {
    let _name = event.currentTarget.dataset.name;

    let strOpen = collapseProps;
    strOpen = setCollapseCategory(strOpen, _name);
    setCollapsePageUIs(strOpen);
  }

  ///////////////////////////////////////////////////////////////////////////////

  function handleSetActionDefs() {
    setAlertTitle("");
    let alertmsg = "Project 'preview' is must.";
    setAlertMessage(alertmsg);
    setOpenAlert(true);

    const _pageList = props.pagelist;
    _pageList.forEach((pageObj) => {
      populateActionData(pageObj, _pageList, props.project);
    });

    props.onexecuteabc();
  }
  function populateActionData(currPage, pagelist, projData) {
    const screens = projData["availableScreens"];
    for (let index = 0; index < screens.length; index++) {
      const screenIndex = index;
      let pageUIs = getAllChildrenOnPage(currPage, screenIndex, true);
      pageUIs.forEach((uiContainer) => {
        if (
          uiContainer["viewType"] === "Gadget" ||
          uiContainer["viewType"] === "GadgetUI" ||
          uiContainer["viewType"] === "Picker"
        ) {
          //continue;
        } else {
          uiContainer["parent"] = "container1";
          let childPartDic = uiContainer.uiParts[screenIndex];
          if (childPartDic.hasOwnProperty("Document")) {
            setObjDocument(childPartDic);
          }
          if (childPartDic.hasOwnProperty("actions")) {
            var objChildActions = childPartDic["actions"]; //JSON.parse(JSON.stringify(childPartDic['actions']));
            manageActionsDef(objChildActions, currPage, pagelist);
          }
        }
      });
      if (currPage.hasOwnProperty("actions")) {
        var objPageActions = currPage["actions"];
        manageActionsDef(objPageActions, currPage, pagelist);
      }
      if (currPage.viewType.indexOf("TableViewList") > -1) {
        if (currPage.Children[0].Group[0].RecordCellDef) {
          let objRowActions =
            currPage.Children[0].Group[0].RecordCellDef["actions"];
          manageActionsDef(objRowActions, currPage, pagelist);
        }
      }
    }
  }
  function manageActionsDef(objActions, objPageDic, pagelist) {
    for (const functions in objActions) {
      var strFunction = functions.toString();
      var item = objActions[strFunction];
      for (var i = 0; i < item.length; i++) {
        let objAction = item[i];
        const paramDic = objAction["params"];
        if (
          objAction["category"] === "ViewAction" &&
          objAction["type"] === "Page"
        ) {
          if (objAction["method"] === "SelectTab") {
            if (!paramDic.hasOwnProperty("tabPageid")) {
              const tabId = parseInt(paramDic["tab"]);
              //console.log(objPageDic.Title, ".............", tabId);
              let tabList = getTabPageList1(pagelist);
              paramDic["tabPageid"] = tabList[tabId]
                ? tabList[tabId]["pageid"]
                : "";
            }
          }
        }
        if (objAction.hasOwnProperty("Document")) {
          setObjDocument(objAction);
        }
        manageActionsDef(objAction["actions"], objPageDic, pagelist);
      }
    }
  }
  function getTabPageList1(pagelist) {
    let tablist = [];
    pagelist.forEach((page) => {
      if (page["parentid"] === "App") {
        tablist.push({ Title: page.Title, pageid: page.pageid });
      }
    });
    return tablist;
  }

  function setObjDocument(actionObj) {
    if (!actionObj["Document"]) {
      return;
    }
    if (actionObj["Document"] && actionObj["Document"].length === 2) {
      return;
    }
    console.log(".... Document items count ::", actionObj["Document"].length);

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

    let actionDoc = [];
    const createdDoc = actionObj["Document"].find(
      ({ key }) => key === "createddatetime"
    );
    if (createdDoc) {
      actionDoc.push(createdDoc);
    } else {
      const _createdObj = { key: "createddatetime", value: "" };
      actionDoc.push(_createdObj);
    }

    let updatedDoc = actionObj["Document"].filter(function (item) {
      return item.key === "lastupdatedatetime";
    });
    if (updatedDoc.length > 0) {
      const latestObj = updatedDoc[updatedDoc.length - 1];
      actionDoc.push(latestObj);
    } else {
      const _lastupdateObj = { key: "lastupdatedatetime", value: strDate };
      actionDoc.push(_lastupdateObj);
    }

    actionObj["Document"] = actionDoc;
  }

  return (
    <div className="vertical-align" style={{ height: "100%" }}>
      {displayTitle && (
        <button
          className="project-validation-btn"
          onClick={handleSetActionDefs}
        >
          Set data (either missing or extra)
        </button>
      )}
      {displayTitle && (
        <div
          className="horizontal-align"
          style={{ height: 24, justifyContent: "space-between" }}
        >
          <Typography className="project-validation-title">
            Project Title: {projectData.Title}
          </Typography>
          {showProjectWarning && (
            <Typography variant="body2" className="project-validation-warning">
              {projectError}
            </Typography>
          )}
          {projectError.length > 0 && (
            <IconButton
              className="project-validation-warning-icon"
              onClick={onClickProjectWarning}
            >
              <Warning />
            </IconButton>
          )}
        </div>
      )}
      <Box className="project-validation-gridbox">
        {screens.length > 1 && (
          <div
            className="horizontal-align"
            style={{ padding: "4px 0px", justifyContent: "center" }}
          >
            <Typography variant="subtitle2">Select Screen :</Typography>
            <Select
              native
              value={selectedScreen}
              className="project-screen-select"
              onChange={handleChangeScreen}
            >
              {screens.map((screen, id) => (
                <option key={id} value={id}>
                  {screen.width} x {screen.height}
                </option>
              ))}
            </Select>
          </div>
        )}
        <TableContainer>
          <Table
            stickyHeader
            className="project-validation-table"
            size="small"
            aria-label="a dense table"
          >
            <TableHead>
              <TableRow>
                <TableCell
                  className="project-validation-style-table-cell"
                  width="25px"
                ></TableCell>
                <TableCell>
                  <h4>Page Title</h4>
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {populateValidationData(
                projectData,
                props.pages,
                props.pagelist,
                props.pageconfig,
                props.uiconfig,
                props.actionlist,
                selectedScreen
              ).map((page, id) => (
                <React.Fragment key={id}>
                  <TableRow className="project-valid-table-row">
                    <TableCell>
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        data-name={page.pageid}
                        onClick={handleExpandCollapse}
                      >
                        {isCategoryCollapse(
                          collapseProps,
                          page.pageid,
                          props.source
                        ) ? (
                          <KeyboardArrowUp />
                        ) : (
                          <KeyboardArrowDown />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <h4>{page.Title}</h4>
                    </TableCell>
                    <TableCell
                      style={{ display: "none" }}
                      className="project-validtion-table-cell"
                      align="right"
                    >
                      {page.isValid.toString()}
                    </TableCell>
                    <TableCell
                      align="right"
                      className="project-validation-isvalid"
                    >
                      {!page.isValid && (
                        <IconButton
                          className="project-validation-warning-icon"
                          data-name={page.Title}
                          data-reason={page.reason}
                          onClick={onClickPageWarning}
                        >
                          <img
                            src={warningimg}
                            alt="logo"
                            width="20px"
                            height="20px"
                          ></img>
                        </IconButton>
                      )}
                      {page.isValid && (
                        <IconButton className="project-validation-warning-icon">
                          <CheckCircle />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={3}
                    >
                      <Collapse
                        in={isCategoryCollapse(
                          collapseProps,
                          page.pageid,
                          props.source
                        )}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box margin={1}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>
                                  <h4>UI-part Name</h4>
                                </TableCell>
                                <TableCell align="center"></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {page.children.map((child, index) => (
                                <TableRow key={index}>
                                  <TableCell
                                    className="project-validtion-table-cell"
                                    component="th"
                                    scope="row"
                                  >
                                    <h6>{child.Name}</h6>
                                  </TableCell>
                                  <TableCell
                                    style={{ display: "none" }}
                                    align="right"
                                  >
                                    {child.isValid.toString()}
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    className="project-validation-isvalid"
                                  >
                                    {!child.isValid && (
                                      <IconButton
                                        className="project-validation-warning-icon"
                                        data-name={child.Name}
                                        data-reason={child.reason}
                                        onClick={onClickUIpartWarning}
                                      >
                                        <img
                                          src={warningimg}
                                          alt="logo"
                                          width="20px"
                                          height="20px"
                                        ></img>
                                      </IconButton>
                                    )}
                                    {child.isValid && (
                                      <IconButton className="project-validation-warning-icon">
                                        <CheckCircle />
                                      </IconButton>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
      </Box>
    </div>
  );
}

function setCollapseCategory(strCategory, name) {
  let _name = name + ",";
  if (strCategory.indexOf(name) > -1) {
    strCategory = strCategory.replace(_name, "");
  } else {
    strCategory += _name;
  }

  return strCategory;
}

function isCategoryCollapse(strCategory, name, source) {
  if (strCategory.toString().indexOf(name) > -1) {
    return source === "Page" ? false : true;
  } else {
    return source === "Page" ? true : false;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////

function populateValidationData(
  projectData,
  pages,
  pagelist,
  pageconfig,
  uiconfig,
  actionlist,
  selectedScreen
) {
  const screenIndex = parseInt(selectedScreen);
  let _arrPages = [];

  if (pages && pages.length > 0) {
    for (let i = 0; i < pages.length; i++) {
      let currPage = pages[i];
      let pageProperties = getConfigProperties(
        pageconfig["config"],
        currPage["viewType"]
      );
      let pageLocale = getConfigLocale(
        pageconfig["locale"],
        currPage["viewType"]
      );
      //_pageContainerDic = currPage;

      let objPage = {};
      objPage["pageid"] = currPage.pageid;
      objPage["Title"] = currPage.Title;
      objPage["viewType"] = currPage.viewType;
      let _pageValidation = checkPageValidation(
        projectData,
        screenIndex,
        currPage,
        pageProperties,
        pageLocale,
        pagelist,
        actionlist
      );
      if (_pageValidation.length > 0) {
        objPage["isValid"] = false;
        let strPageError = "";
        for (let i = 0; i < _pageValidation.length; i++) {
          const element = _pageValidation[i];
          const _elemMsg =
            element["label"] && element["label"].length > 0
              ? element["label"] + " : " + element["message"]
              : element["message"];
          const _error = i + 1 + ". " + _elemMsg;
          strPageError =
            strPageError.length > 0 ? strPageError + "\n\n" + _error : _error;
        }
        objPage["reason"] = strPageError;
      } else {
        objPage["isValid"] = true;
        objPage["reason"] = "";
      }

      let _pageChilds = [];
      let children = getAllChildrenOnPage(currPage, screenIndex);
      children.forEach((uiContainer) => {
        if (
          uiContainer["viewType"] === "Gadget" ||
          uiContainer["viewType"] === "GadgetUI" ||
          uiContainer["viewType"] === "Picker"
        ) {
          //continue;
        } else {
          let childPartDic = uiContainer.uiParts[screenIndex];
          let uiProperties = getConfigProperties(
            uiconfig["config"],
            getUIViewtype(childPartDic)
          );
          let uiLocale = getConfigLocale(
            uiconfig["locale"],
            getUIViewtype(childPartDic)
          );

          let objUIpart = {};
          objUIpart["Name"] = childPartDic.name;
          let _uiValidation = checkUIPartValidation(
            projectData,
            screenIndex,
            currPage,
            childPartDic,
            uiProperties,
            uiLocale,
            children,
            pagelist,
            actionlist
          );
          if (_uiValidation.length > 0) {
            objUIpart["isValid"] = false;
            let strUIError = "";
            for (let j = 0; j < _uiValidation.length; j++) {
              const element = _uiValidation[j];
              const _elemMsg =
                element["label"] && element["label"].length > 0
                  ? element["label"] + " : " + element["message"]
                  : element["message"];
              strUIError = strUIError + _elemMsg + "\n";
            }
            objUIpart["reason"] = strUIError;
          } else {
            objUIpart["isValid"] = true;
            objUIpart["reason"] = "";
          }

          _pageChilds.push(objUIpart);
        }
      });
      objPage["children"] = _pageChilds;

      _arrPages.push(objPage);
    }
  }

  //console.log("*** populateValidationData ***", _arrPages);
  return _arrPages;
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

function getConfigProperties(configlist, viewtype) {
  let arrProperties = [];

  let _config = configlist.filter(function (configItem) {
    return configItem.targetClass === viewtype;
  });

  if (_config && _config.length > 0) {
    let configChildren = _config[0].children;
    configChildren.forEach((element) => {
      let childProperties = element["properties"];
      for (let i = 0; i < childProperties.length; i++) {
        arrProperties.push(childProperties[i]);
      }
    });
  }

  return arrProperties;
}

function getConfigLocale(localelist, viewtype) {
  let arrLocale = [];

  let _config = localelist.filter(function (localeItem) {
    return localeItem.viewType === viewtype;
  });

  let localeChildren = _config;
  localeChildren.forEach((element) => {
    let childProperties = element["properties"];
    for (let i = 0; i < childProperties.length; i++) {
      arrLocale.push(childProperties[i]);
    }
  });

  return arrLocale;
}

////////////////// Page Properties Validation ///////////////////////

function getNestedObjectValues(o, s) {
  s = s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
  s = s.replace(/^\./, ""); // strip a leading dot
  var a = s.split(".");
  for (var i = 0; i < a.length; ++i) {
    var k = a[i];
    if (k in o) {
      o = o[k];
    } else {
      return o;
    }
  }
  return o;
}

function checkPageValidation(
  _project,
  _scrIndex,
  _page,
  _pageProperties,
  _pageLocales,
  pagelist,
  actionlist
) {
  const screenIndex = parseInt(_scrIndex);
  let arrPropertyError = [];

  /* if(_page.viewType.toLowerCase() === "splitview")
    {
      var _validSplitChildDefs = validate_SplitViewChildExist(_page);
      if(_validSplitChildDefs.length > 0)
      {
        arrPropertyError.push(_validSplitChildDefs);
      }
    } */

  var arrPagePropActions = [];
  var arrValidators = [];

  _pageProperties.forEach((property) => {
    var strPropertyPath = property.hasOwnProperty("path")
      ? property["path"]
      : property["formKey"];

    if (strPropertyPath === "wireframe") {
      var _validWireframeError = validate_ResourceFiles(
        _project,
        _page,
        "wireframe"
      );
      if (_validWireframeError.length > 0) {
        arrPropertyError.push({
          label: _pageLocales[0][strPropertyPath],
          message: _validWireframeError,
        });
      }
    }
    if (strPropertyPath.indexOf("actions") > -1) {
      var actionKey =
        strPropertyPath.split("actions.").length > 1
          ? strPropertyPath.split("actions.")[1]
          : "";
      var actionValue;
      if (strPropertyPath.indexOf("navigationBar") > -1) {
        var strNavigationPath =
          "_navigationBars[" +
          screenIndex.toString() +
          "]" +
          strPropertyPath.replace("navigationBar", "");
        actionValue = getNestedObjectValues(_page, strNavigationPath);
      } else {
        actionValue = getNestedObjectValues(_page, strPropertyPath);
      }
      //console.log(_page['pageid'], "*** _page property ***", strPropertyPath, actionValue);

      arrPagePropActions.push({
        path: strPropertyPath,
        key: actionKey,
        value: actionValue,
      });
    }

    var validations = property.validations;
    if (validations && validations.length > 0) {
      validations.forEach((validation) => {
        /* var inputType = property['input'];
          var inputClassRef:Class = getDefinitionByName(inputType) as Class;
          var source = new inputClassRef();
          
          var type = validation['validator'];          
          var validator:AppExeValidatorBase = getValidatorClass(type);
          var _property = validator.getSourceProperty(getQualifiedClassName(source));
          
          source[_property] = _page[strPropertyPath];
          
          validator.property = _property; 
					validator.source = source;
          if(validator)
          {
            var labelPropertyPath = "com.mobilous.builder.client.lib.adf.uiparts." + _page.getDisplayName() + "Dic._" + strPropertyPath;
            validator['sourceLabel'] = ResourceManager.getInstance().getString('uiparts', labelPropertyPath);
          } */

        let validator = {
          type: validation,
          value: _page[strPropertyPath],
          label: _pageLocales[0][strPropertyPath],
        };
        arrValidators.push(validator);
      });
    }
  });

  //var arrError = Validator.validateAll(arrValidators);

  for (let index = 0; index < arrValidators.length; index++) {
    const element = arrValidators[index];
    const message = getValidationError(
      element["type"],
      element["value"],
      _page,
      pagelist
    );
    if (message.length > 0) {
      arrPropertyError.push({ label: element["label"], message: message });
    }
  }
  //console.log(arrValidators, "*** checkPageValidation ***", arrPropertyError);

  let uiPartError = check_pageUIpart_Constraints(_page, screenIndex);
  if (uiPartError.length > 0) {
    /* let _message = "";
      for (let k = 0; k < uiPartError.length; k++) {
        const _error = (k+1) +". "+ uiPartError[k];
        _message = (_message.length > 0) ? _message +"\n\n"+ _error : _error; 
        arrPropertyError.push({label: "", message: uiPartError[k]});       
      }
      arrPropertyError.push({label: "", message: _message}); */
    for (let k = 0; k < uiPartError.length; k++) {
      arrPropertyError.push({ label: "", message: uiPartError[k] });
    }
  }

  if (_page.hasOwnProperty("actions")) {
    let objPageActions = JSON.parse(JSON.stringify(_page["actions"])); //ObjectUtil.clone(_page['actions']);
    if (arrPagePropActions.length > 0) {
      for (let i = 0; i < arrPagePropActions.length; i++) {
        objPageActions[arrPagePropActions[i].key] = arrPagePropActions[i].value;
      }
    }

    let pageActionsError = actionsValidation(
      _project,
      screenIndex,
      objPageActions,
      _page,
      pagelist,
      actionlist
    );
    //console.log("page ActionsError >>>", pageActionsError);
    for (let i = 0; i < pageActionsError.length; i++) {
      arrPropertyError.push({ label: "Action", message: pageActionsError[i] });
    }
  }
  if (_page.viewType.indexOf("TableViewList") > -1) {
    if (_page.Children[0].Group[0].RecordCellDef) {
      let objRowActions = JSON.parse(
        JSON.stringify(_page.Children[0].Group[0].RecordCellDef["actions"])
      );
      if (arrPagePropActions.length > 0) {
        for (let i = 0; i < arrPagePropActions.length; i++) {
          objRowActions[arrPagePropActions[i].key] =
            arrPagePropActions[i].value;
        }
      }
      let rowActionsError = actionsValidation(
        _project,
        screenIndex,
        objRowActions,
        _page,
        pagelist,
        actionlist
      );
      for (let i = 0; i < rowActionsError.length; i++) {
        arrPropertyError.push({ label: "Action", message: rowActionsError[i] });
      }
    }
  }

  return arrPropertyError;
}

function check_pageUIpart_Constraints(pageDic, screenIndex) {
  let arrUIpartsError = [];

  let isRadioButtonExist = false;
  let arrRadioButtons = [];
  let arrUIpartName = [];

  let _pageChild = getAllChildrenOnPage(pageDic, screenIndex);
  _pageChild.forEach((uiConatiner) => {
    let _uiDic = uiConatiner.uiParts[screenIndex];
    arrUIpartName.push(_uiDic["name"]);

    if (getUIViewtype(_uiDic) === "RadioButton") {
      isRadioButtonExist = true;
      // ---- validate Radio Buttons mandatory fields ---- //
      if (_uiDic["fieldname"] === "" || _uiDic["groupname"] === "") {
        const strFieldName = "Value";
        const strGroupName = "Group Name";
        const _alertMsg =
          "For all radio-buttons, please set required fields : '" +
          strFieldName +
          "' & '" +
          strGroupName +
          "'";
        arrUIpartsError.push(_alertMsg);
      }

      arrRadioButtons.push({ group: _uiDic["groupname"], state: _uiDic["on"] });
    }
  });

  // ---- validate Radio Buttons ON state ---- //
  if (isRadioButtonExist) {
    if (arrRadioButtons.length > 0) {
      //arrRadioButtons.sortOn(["group","state"], [Array.DESCENDING, Array.DESCENDING]);

      var _groupname = "";
      var _blnState = true;
      for (var i = 0; i < arrRadioButtons.length; i++) {
        if (_groupname !== arrRadioButtons[i]["group"]) {
          if (!_blnState) break;
          _groupname = arrRadioButtons[i]["group"];
          _blnState = arrRadioButtons[i]["state"]; //false;
        }
        if (_blnState && _groupname === arrRadioButtons[i]["group"]) continue;
        else _blnState = arrRadioButtons[i]["state"];
      }
      if (!_blnState) {
        arrUIpartsError.push(
          "For Radio-button UIs, there should be atleast one radio-button has ON state within a group"
        );
      }
    }
  }

  // ---- validate all UI-parts unique name ---- //
  const uiPartsNoDuplicates = [...new Set(arrUIpartName)]; //Set is a new object type with ES6 that allow creating collections of unique values
  if (uiPartsNoDuplicates.length !== arrUIpartName.length) {
    let duplicates = [...arrUIpartName];
    uiPartsNoDuplicates.forEach((item) => {
      const i = duplicates.indexOf(item);
      duplicates = duplicates
        .slice(0, i)
        .concat(duplicates.slice(i + 1, duplicates.length));
    });

    let duplicateStr = duplicates.join(", ");
    arrUIpartsError.push("UI(s) has duplicate name : " + duplicateStr);
  }

  return arrUIpartsError;
}

////////////////// UI-part Properties Validation ///////////////////////

function checkUIPartValidation(
  _project,
  screenIndex,
  _currPage,
  _uipart,
  _uiProperties,
  _uiLocale,
  uilist,
  pagelist,
  actionlist
) {
  //console.log(_uiProperties, _uiLocale, "*** checkUIPartValidation ***", _uipart);

  const uiDisplayName = getUIViewtype(_uipart);

  let arrPropertyError = [];
  var arrValidators = [];

  _uiProperties.forEach((property) => {
    var strPropertyPath = property.hasOwnProperty("path")
      ? property["path"]
      : property["formKey"];

    if (property.hasOwnProperty("validator")) {
      if (property["validator"].toLowerCase() === "whereclausevalidator") {
        if (!validate_WhereClause(_uipart[strPropertyPath])) {
          arrPropertyError.push({
            label: _uiLocale[0][strPropertyPath],
            message: "Double quotes not allowed",
          });
        }
      }
    }

    var inputType = property["input"];
    if (inputType.toLowerCase() === "inputformatform") {
      if (!validate_DisplayFormat(_uipart, strPropertyPath)) {
        arrPropertyError.push({
          label: _uiLocale[0][strPropertyPath],
          message: "Display Format or related values are not valid",
        });
      }
    } else if (inputType === "TextInputWithButton") {
      if (uiDisplayName.indexOf("Segment") > -1) {
        if (strPropertyPath === "segmentItems[*].imageDic") {
          var _arrSegmentItems = _uipart["segmentItems"];
          for (let i = 0; i < _arrSegmentItems.length; i++) {
            var _validError_segmentItemImage = validate_ResourceFiles(
              _project,
              _arrSegmentItems[i],
              "imageDic"
            );
            if (_validError_segmentItemImage.length > 0)
              arrPropertyError.push({
                label: _uiLocale[0][strPropertyPath],
                message: _validError_segmentItemImage,
              });
          }
        }
      } else {
        var _validResourceError = validate_ResourceFiles(
          _project,
          _uipart,
          strPropertyPath
        );
        if (_validResourceError.length > 0) {
          arrPropertyError.push({
            label: _uiLocale[0][strPropertyPath],
            message: _validResourceError,
          });
        }
      }
    }

    var validations = property.validations;
    if (validations && validations.length > 0) {
      validations.forEach((validation) => {
        let validator = {
          type: validation,
          value: _uipart[strPropertyPath],
          label: _uiLocale[0][strPropertyPath],
        };
        arrValidators.push(validator);
      });
    }
  });

  for (let index = 0; index < arrValidators.length; index++) {
    const element = arrValidators[index];
    const message = getValidationError(
      element["type"],
      element["value"],
      _uipart,
      uilist
    );
    if (message.length > 0) {
      arrPropertyError.push({ label: element["label"], message: message });
    }
  }

  if (_uipart.hasOwnProperty("actions")) {
    var objChildActions = JSON.parse(JSON.stringify(_uipart["actions"]));

    /* if(arrPagePropActions.length > 0) {
        for (var i = 0; i < arrPagePropActions.length; i++) 
        {
          objChildActions[arrPagePropActions[i].key] = arrPagePropActions[i].value;
        }
      } */

    let uiActionsError = actionsValidation(
      _project,
      screenIndex,
      objChildActions,
      _currPage,
      pagelist,
      uilist,
      actionlist
    );
    //console.log("ui ActionsError >>>", uiActionsError);
    for (let i = 0; i < uiActionsError.length; i++) {
      arrPropertyError.push({ label: "Action", message: uiActionsError[i] });
    }
  }

  return arrPropertyError;
}

//////////////////////////// Actions Validation /////////////////////////////////

function actionsValidation(
  objProject,
  screenIndex,
  objActions,
  objDic,
  pagelist,
  uilist,
  actionlist
) {
  //console.log("*** actionsValidation ***", objActions, _actProperties, objDic, list);

  let arrActionError = [];
  //if(arrActionError.length === 0)   return true;

  for (const functions in objActions) {
    var strFunction = functions.toString();
    var item = objActions[strFunction];
    //console.log(objActions, "*** actionsValidation ***", strFunction, item);
    for (var i = 0; i < item.length; i++) {
      let action = item[i];

      //var objSubActions = JSON.parse(JSON.stringify(action['actions']));
      //actionsValidation(objSubActions);

      /* let arrValidators = [];
        _actProperties.forEach(property => {

          const strPropertyPath = (property.hasOwnProperty("path")) ? property['path'] : property['formKey']; 

          let validations = property.validations;
          if(validations && validations.length > 0) 
          {        
            validations.forEach(validation => {          
              let validator = {type: validation, value: action[strPropertyPath]};
              arrValidators.push(validator);
            });
          }
        });

        for (let index = 0; index < arrValidators.length; index++) {
          const element = arrValidators[index];
          const message = getValidationError(element['type'], element['value'], objDic, list);
          if(message.length > 0) {
            arrActionError.push({label: element['label'], message: message});
          }      
        }
        
        var arrError = Validator.validateAll(arrValidators);
        if(arrError.length > 0)
        {
          var methodString = ResourceManager.getInstance().getString('actions', "com.mobilous.builder.client.lib.adf.actions.action."+action.method);
          arrActionError.push(ResourceManager.getInstance().getString('uiparts', 'msg_Action')+" :- '"+ methodString +"'"+"\n"+ arrError[0]['message']);
        } */

      //Valid value validaion
      var _validValueError = validate_ValueExistence(
        screenIndex,
        action,
        objDic,
        pagelist,
        uilist,
        actionlist
      );
      if (_validValueError.length > 0) {
        //console.log(pagelist, action, objDic, "*** validate_ValueExistence ***", _validValueError);
        arrActionError.push(_validValueError);
      }

      //DB actions validaion
      if (
        action["category"] === "DbAction" ||
        action["category"] === "ComAction"
      ) {
        if (action["method"] === "SynchronizeDB") {
          //SynchronizeDB Action
          var objParams = action["params"];

          objParams["table"] = objParams["toTable"];
          objParams["servicename"] = objParams["toService"];
          var _dbError_toSync = validate_DBactions(objProject, action);
          if (_dbError_toSync.length > 0) arrActionError.push(_dbError_toSync);

          objParams["table"] = objParams["fromTable"];
          objParams["servicename"] = objParams["fromService"];
          var _dbError_fromSync = validate_DBactions(objProject, action);
          if (_dbError_fromSync.length > 0)
            arrActionError.push(_dbError_fromSync);
        } else {
          var _dbActionsError = validate_DBactions(objProject, action);
          if (_dbActionsError.length > 0) {
            arrActionError.push(_dbActionsError);
          }
        }
      }

      //condition cases validaion
      if (action.params.condition.groupcases.length > 0) {
        var _conditionError = validate_ConditionCases(
          action.method,
          action.params.condition.groupcases,
          arrActionError
        );
        if (_conditionError.length > 0) {
          arrActionError.push(_conditionError);
        }
      }
    }
  }

  if (arrActionError.length > 0) return arrActionError;
  return [];
}

function validate_ValueExistence(
  screenIndex,
  _objAction,
  _objDic,
  _pagelist,
  _uilist,
  _actionlist
) {
  let _actionLocale = getActionLocale(_objAction, _actionlist);
  if (_actionLocale.hasOwnProperty("locale")) {
    _actionLocale = _actionLocale["locale"];
  }
  //console.log(_objAction, "*** validate_ValueExistence ***", _actionLocale);

  var valueExistError = "";

  if (_objAction["category"] === "ViewAction") {
    //Page Transition
    if (_objAction["type"] === "Page") {
      var _pageTransitionError = validatePageTransition(
        _objAction,
        _objDic,
        _pagelist,
        _actionLocale
      );
      if (_pageTransitionError.length > 0) {
        valueExistError = _pageTransitionError;
        return valueExistError;
      }
    } else if (_objAction["type"] === "MainValue") {
      if (_objAction["method"] === "setParentData") {
        var parentID = _objDic.parentid;
        if (parentID.toLowerCase() !== "app") {
          _objAction["params"]["targetPage"] = parentID;
        }
      }
    }
  }

  const methodName = _actionLocale["text"]; //_objAction.method;
  const paramDic = _objAction["params"];

  //Target Page
  var _pageExistenceError = validatePageExist(paramDic, _pagelist);
  if (_pageExistenceError.length > 0) {
    valueExistError = methodName + " \n" + _pageExistenceError; //ResourceManager.getInstance().getString('uiparts', 'msg_Action')+" :- '"+ methodName +"'"+"\n"+_pageExistenceError;
    return valueExistError;
  }

  //Target UIpart
  var _uipartExistenceError = validateUIpartExist(
    screenIndex,
    paramDic,
    _objDic,
    _pagelist,
    _uilist
  );
  if (_uipartExistenceError.length > 0) {
    if (
      _objAction["method"] === "startTimer" ||
      _objAction["method"] === "stopTimer"
    )
      return "";
    if (
      _objAction["method"] === "ChangeCondition" ||
      _objAction["method"] === "ChangeRemoteCondition"
    )
      return "";
    if (_objAction["method"] === "CallExternalApp") return "";
    if (_objAction["category"] === "IoTAction") return "";

    valueExistError = methodName + "\n" + _uipartExistenceError; //ResourceManager.getInstance().getString('uiparts', 'msg_Action')+" :- '"+ methodName +"'"+"\n"+_uipartExistenceError;
    return valueExistError;
  }

  //Table Defs

  return valueExistError;
}

function validatePageTransition(
  objAction,
  _pageContainerDic,
  _pagelist,
  _actionlocale
) {
  var pageTransitionError = "";

  let methodName = _actionlocale["text"]; //objAction['method'];
  let keyName = "";

  var paramDic = objAction["params"];
  if (objAction["method"] === "View") {
    var _childPageid = getTargetPageId(paramDic);
    if (_childPageid.length > 0) {
      var _childpage = getTargetPage(_childPageid, _pagelist); //User.currentProjectDic.getPageCache(_childPageid);
      if (_childpage && _childpage.parentid !== _pageContainerDic.pageid) {
        keyName = _actionlocale.hasOwnProperty("pageName")
          ? _actionlocale["pageName"]
          : "pageName";
        pageTransitionError = methodName + "\n'" + keyName + "' is Invalid"; //ResourceManager.getInstance().getString('uiparts', 'msg_Action')+" :- '"+ methodName +"'"+"\n"+ keyName+ " "+ResourceManager.getInstance().getString('uiparts', 'msg_isInvalid');
        return pageTransitionError;
      }
    }
  } else if (objAction["method"] === "ReturnToParentView") {
    var _parentPageid = getTargetPageId(paramDic);
    if (_parentPageid > 0) {
      var parentExist = false;
      var parentsList = getParentPageList(_pageContainerDic, _pagelist);
      for (var p = 0; p < parentsList.length; p++) {
        if (_parentPageid === parentsList[p]["pageid"]) {
          parentExist = true;
          break;
        }
      }
      if (!parentExist) {
        keyName = _actionlocale.hasOwnProperty("pageName")
          ? _actionlocale["pageName"]
          : "pageName";
        pageTransitionError = methodName + "\n'" + keyName + "' is Invalid"; //ResourceManager.getInstance().getString('uiparts', 'msg_Action')+" :- '"+ methodName +"'"+"\n"+ keyName+ " "+ResourceManager.getInstance().getString('uiparts', 'msg_isInvalid');
        return pageTransitionError;
      }
    }
  } else if (objAction["method"] === "popViewController") {
    if (_pageContainerDic.parentid.toUpperCase() === "APP") {
      pageTransitionError =
        methodName + "\n Invlaid : No 'previous' page is there"; //ResourceManager.getInstance().getString('uiparts', 'msg_Action')+ " :- '"+ methodName +"' "+ResourceManager.getInstance().getString('uiparts', 'msg_notValid')+"\n"+ResourceManager.getInstance().getString('uiparts', 'alert_NoPrevpage');
      return pageTransitionError;
    }
  } else if (objAction["method"] === "popToRootViewController") {
    if (_pageContainerDic.parentid.toUpperCase() === "APP") {
      pageTransitionError =
        methodName + "\n Invlaid : No 'First' page is there"; //ResourceManager.getInstance().getString('uiparts', 'msg_Action')+" :- '"+ methodName +"' "+ResourceManager.getInstance().getString('uiparts', 'msg_notValid')+"\n"+ResourceManager.getInstance().getString('uiparts', 'alert_NoFirstPage');
      return pageTransitionError;
    }
  } else if (objAction["method"] === "TransitSidebar") {
    if (_pageContainerDic._toolBarLeft[0]["hidden"]) {
      pageTransitionError = methodName + "\n Invlaid : No 'sidebar' is there"; //ResourceManager.getInstance().getString('uiparts', 'msg_Action')+" :- '"+ methodName +"' "+ResourceManager.getInstance().getString('uiparts', 'msg_notValid')+"\n"+ResourceManager.getInstance().getString('uiparts', 'alert_SidebarHidden');
      return pageTransitionError;
    }
  } else if (objAction["method"] === "SelectTab") {
    let _tabExistenceError = "";
    if (!paramDic.hasOwnProperty("tabPageid")) {
      _tabExistenceError = "Tab page-id not exist";
    }

    let tabList = getTabPageList(_pagelist);
    const tabIndex = paramDic["tab"];
    if (tabIndex >= tabList.length) {
      _tabExistenceError = "Tab page not exist"; //ResourceManager.getInstance().getString('uiparts', 'alert_PageNotExist');
    } else {
      const _targetTabPage = paramDic["pageTitle"];
      if (_targetTabPage.length > 0) {
        var tabexist = false;
        for (var i = 0; i < tabList.length; i++) {
          if (_targetTabPage === tabList[i]["Title"]) {
            tabexist = true;
            break;
          }
        }
        if (!tabexist) {
          _tabExistenceError = "Tab page not exist"; //ResourceManager.getInstance().getString('uiparts', 'alert_PageNotExist');
        }
      }
    }

    if (_tabExistenceError.length > 0) {
      pageTransitionError = methodName + "\n" + _tabExistenceError; //ResourceManager.getInstance().getString('uiparts', 'msg_Action')+" :- '"+ methodName +"'"+"\n"+_tabExistenceError;
      return pageTransitionError;
    }
  }

  return pageTransitionError;
}
function validatePageExist(objParam, pageList) {
  var pageExistError = "";

  /*var strPageTitle = "";
    var pageList:Array = User.currentProjectDic.getPageCacheList();
    for (var i = 0; i < pageList.length; i++) 
    {
      strPageTitle += pageList[i]['Title'] + ",";
    }*/

  if (
    objParam.hasOwnProperty("targetPage") ||
    objParam.hasOwnProperty("pageName")
  ) {
    var _targetPageid = getTargetPageId(objParam);
    if (_targetPageid.length > 0) {
      var _pageDic = getTargetPage(_targetPageid, pageList); //User.currentProjectDic.getPageCache(_targetPageid);
      if (!_pageDic)
        pageExistError = "Page not exist with page id :" + _targetPageid; //ResourceManager.getInstance().getString('uiparts', 'alert_PageNotExist');	//
    } else pageExistError = "Page not set."; //ResourceManager.getInstance().getString('uiparts', 'alert_PageNotSet');
  } else if (objParam.hasOwnProperty("pageTitle")) {
    var _targetPage = objParam["pageTitle"];
    /*if(_targetPage.length > 0 && strPageTitle.indexOf(_targetPage) == -1)
        pageExistError = ResourceManager.getInstance().getString('uiparts', 'alert_PageNotExist');		//"Page not exist :" +  _targetPage;
      */
    if (_targetPage.length > 0) {
      var pageexist = false;
      for (var i = 0; i < pageList.length; i++) {
        if (_targetPage === pageList[i]["Title"]) {
          pageexist = true;
          break;
        }
      }
      if (!pageexist) pageExistError = "Page not exist."; //ResourceManager.getInstance().getString('uiparts', 'alert_PageNotExist');
    }
  }

  return pageExistError;
}
function getTargetPageId(objParam) {
  var _pageid = "";
  var _strPageValue = "";

  if (objParam.hasOwnProperty("targetPage"))
    _strPageValue = objParam["targetPage"];
  else if (objParam.hasOwnProperty("pageName"))
    _strPageValue = objParam["pageName"];

  if (_strPageValue.length === 0) return _pageid;
  else {
    if (_strPageValue.indexOf("page") > -1) {
      var _arrPage = _strPageValue.split("page_");
      _pageid = _arrPage[1];
    } else _pageid = _strPageValue;

    return _pageid;
  }
}
function getTargetPage(_pageId, pagelist) {
  let pageArr = pagelist.filter(function (_page) {
    return _page["pageid"] === _pageId;
  });
  return pageArr[0];
}

function validateUIpartExist(
  screenIndex,
  objParam,
  _pageContainerDic,
  _pagelist,
  _uilist
) {
  var uipartExistError = "";

  if (
    objParam.hasOwnProperty("name") ||
    objParam.hasOwnProperty("targetUIPart") ||
    objParam.hasOwnProperty("objectname") ||
    objParam.hasOwnProperty("variablename")
  ) {
    var _strUIpartValue = "";
    if (objParam.hasOwnProperty("name")) _strUIpartValue = objParam["name"];
    else if (objParam.hasOwnProperty("targetUIPart"))
      _strUIpartValue = objParam["targetUIPart"];
    else if (objParam.hasOwnProperty("objectname"))
      _strUIpartValue = objParam["objectname"];
    else if (objParam.hasOwnProperty("variablename"))
      // --> in case of 'QRScanner' action
      _strUIpartValue = objParam["variablename"];

    if (_strUIpartValue.length === 0) {
      uipartExistError = "UI-part not found";
    } else {
      var currPage;
      if (
        objParam.hasOwnProperty("targetPage") ||
        objParam.hasOwnProperty("pageName")
      ) {
        var _targetPageid = getTargetPageId(objParam);
        let _targetPage = _pagelist.filter(function (node, index) {
          if (node.pageid === _targetPageid) {
            return node;
          }
          return node.pageid === _targetPageid;
        });
        currPage = _targetPage[0];
      } else {
        currPage = _pageContainerDic;
      }

      var children = getAllChildrenOnPage(currPage, screenIndex);
      var uiexist = false;
      children.forEach((uiContainerDic) => {
        var childPartDic = uiContainerDic.uiParts[screenIndex];
        if (_strUIpartValue === childPartDic.name) {
          uiexist = true;
          //break;
        }
      });
      if (!uiexist) {
        uipartExistError = "UI-part not exist in the selected page";
      }
    }
  }

  return uipartExistError;
}
function validateTableDefsExist(objProject, objParam) {
  var tableDefsExistError = "";

  var _servicename = "";
  if (objParam.hasOwnProperty("servicename")) {
    _servicename = objParam["servicename"];
    //console.log(_servicename);
  }

  if (
    objParam.hasOwnProperty("table") ||
    objParam.hasOwnProperty("tablename")
  ) {
    var _tablename;
    if (objParam.hasOwnProperty("table")) _tablename = objParam["table"];
    else if (objParam.hasOwnProperty("tablename"))
      _tablename = objParam["tablename"];

    if (_tablename.length === 0) tableDefsExistError = "Table is not set";
    else {
      var tableList = getDbTableDicsByServiceName(objProject, _servicename);
      /*var strTableName = "";
        for (var i = 0; i < tableList.length; i++) 
        {
          strTableName += tableList[i]['tablename'] + ",";
        }
        
        if(strTableName.indexOf(_tablename) == -1)
          tableDefsExistError = ResourceManager.getInstance().getString('uiparts', 'alert_TableNotExist')+" :" +  _tablename;	
        */
      var tableexist = false;
      for (var i = 0; i < tableList.length; i++) {
        if (_tablename === tableList[i]["tablename"]) {
          tableexist = true;
          break;
        }
      }
      if (!tableexist) tableDefsExistError = "Table not exist :" + _tablename;
    }
  }

  return tableDefsExistError;
}
function getDbTableDicsByServiceName(appData, serviceName) {
  let TableDefs = appData["TableDefs"];
  let RemoteTableDefs = appData["RemoteTableDefs"];
  //console.log(appData, ".... getDbTableDicsByServiceName >>>", serviceName);
  let services = [];
  let dbTableDic;
  if (!serviceName || serviceName === "LocalDB") {
    for (let i = 0; i < TableDefs.length; i++) {
      dbTableDic = TableDefs[i];
      if (dbTableDic.hasOwnProperty("trigger")) {
        if (dbTableDic.trigger) continue;
      }
      if (dbTableDic.hasOwnProperty("procedure")) {
        if (dbTableDic.procedure) continue;
      }
      services.push(dbTableDic);
    }
  } else {
    for (let j = 0; j < RemoteTableDefs.length; j++) {
      dbTableDic = RemoteTableDefs[j];
      if (dbTableDic.servicename === serviceName) {
        if (dbTableDic.hasOwnProperty("trigger")) {
          if (dbTableDic.trigger) continue;
        }
        if (dbTableDic.hasOwnProperty("procedure")) {
          if (dbTableDic.procedure) continue;
        }
        services.push(dbTableDic);
      }
    }
  }
  return services;
}

function validate_DBactions(objProject, _objAction) {
  var dbError = "";
  var tableFields = [];

  var dbMethod = _objAction.method;
  if (dbMethod === "ChangeCondition" || dbMethod === "ChangeRemoteCondition")
    return dbError;

  var methodString = dbMethod; //ResourceManager.getInstance().getString('actions', "com.mobilous.builder.client.lib.adf.actions.action."+dbMethod);
  var paramDic = _objAction["params"];

  var tablename;
  if (paramDic.hasOwnProperty("table")) tablename = paramDic["table"];
  else if (paramDic.hasOwnProperty("tablename"))
    tablename = paramDic["tablename"];

  if (tablename) {
    if (tablename.length === 0) {
      dbError = methodString + ": Table not set"; //ResourceManager.getInstance().getString('uiparts', 'msg_Action')+" :- '"+ methodString +"'"+"\n"+ResourceManager.getInstance().getString('uiparts', 'alert_TableNotSet');
      return dbError;
    } else {
      var checkTableDefsExist = validateTableDefsExist(objProject, paramDic);
      if (checkTableDefsExist.length > 0) {
        dbError = methodString + "\n" + checkTableDefsExist; //ResourceManager.getInstance().getString('uiparts', 'msg_Action')+" :- '"+ methodString +"'"+"\n"+ResourceManager.getInstance().getString('uiparts', 'alert_TableNotExist');
        return dbError;
      }
    }

    if (paramDic.hasOwnProperty("servicename"))
      tableFields = getDbFields(objProject, paramDic["servicename"], tablename);
    else tableFields = getDbFields(objProject, "", tablename);
    if (tableFields.length > 0) {
      if (
        dbMethod.toLowerCase().indexOf("insert") > -1 ||
        dbMethod.toLowerCase().indexOf("update") > -1
      ) {
        var recordsKey = "";
        var _recordList = paramDic.recordList;
        for (var i = 0; i < _recordList.length; i++) {
          recordsKey = _recordList[i].key;
          var blnKeyExist = tableFields.some(isKeyExist_inTableFields);
          if (!blnKeyExist) {
            dbError =
              methodString +
              ": record key-value not set. " +
              recordsKey +
              " is invalid."; //ResourceManager.getInstance().getString('uiparts', 'msg_Action')+" :- '"+ methodString +"'"+"\n"+ResourceManager.getInstance().getString('uiparts', 'msg_RecordsKey')+" " +recordsKey+ " "+ResourceManager.getInstance().getString('uiparts', 'msg_isInvalid');
            return dbError;
          }
        }
      }
    }
  } else {
    dbError = methodString + "\n Table not exist"; //ResourceManager.getInstance().getString('uiparts', 'msg_Action')+" :- '"+ methodString +"'"+"\n"+ResourceManager.getInstance().getString('uiparts', 'alert_TableNotExist');
    return dbError;
  }

  return dbError;
}
function getDbFields(appData, servicename, tablename) {
  let dbTableDic = getDbTableDicByName(appData, servicename, tablename);
  let _dataOptions = dbTableDic ? dbTableDic.fields : [];
  return _dataOptions;
}
function getDbTableDicByName(appData, servicename, tablename) {
  let TableDefs = appData["TableDefs"];
  let RemoteTableDefs = appData["RemoteTableDefs"];

  let dbTableDic;
  if (!servicename || servicename === "LocalDB") {
    for (let i = 0; i < TableDefs.length; i++) {
      dbTableDic = TableDefs[i];
      if (dbTableDic.tablename === tablename) return dbTableDic;
    }
  } else {
    for (let j = 0; j < RemoteTableDefs.length; j++) {
      dbTableDic = RemoteTableDefs[j];
      if (
        dbTableDic.servicename === servicename &&
        dbTableDic.tablename === tablename
      )
        return dbTableDic;
    }
  }
  return null;
}
function isKeyExist_inTableFields(element, index, arr, recordsKey) {
  //trace(element['fieldname'], element['primary']);
  if (element["fieldname"] === recordsKey) {
    return true;
  }
  return false;
}

function validate_ConditionCases(_methodName, arrGroupCases, arrActionError) {
  var caseError = "";
  for (var i = 0; i < arrGroupCases.length; i++) {
    var _arrCases = arrGroupCases[i].cases;
    for (var j = 0; j < _arrCases.length; j++) {
      var arrORcase = _arrCases[j]["ORGroupCase"];
      if (arrORcase.length > 0) {
        caseError = validate_ConditionCases(
          _methodName,
          arrORcase,
          arrActionError
        );
      } else {
        var caseTarget = _arrCases[j]["target"];
        var caseOperator = _arrCases[j]["operator"];
        var caseValue = _arrCases[j]["value"];

        //trace(i, "::", j, "cases -->", caseTarget, caseValue, caseOperator);

        if (caseTarget.length === 0) caseError += "\nTarget connot be empty."; //ResourceManager.getInstance().getString('uiparts', 'msg_ConditionCase')+" : "+ResourceManager.getInstance().getString('uiparts', 'alert_ConditionTargetEmpty');
        if (caseOperator.length === 0)
          caseError += "\nOperator connot be empty."; //ResourceManager.getInstance().getString('uiparts', 'msg_ConditionCase')+" : "+ResourceManager.getInstance().getString('uiparts', 'alert_ConditionOperatorEmpty');
        if (caseValue.length > 0) {
          if (caseValue.indexOf("'") > -1) caseError += "\nValue not supported"; //ResourceManager.getInstance().getString('uiparts', 'msg_ConditionCase')+" : "+ResourceManager.getInstance().getString('uiparts', 'alert_ConditionValueSupport');
        }
      }

      if (caseError.length > _methodName.length) {
        //actionError = caseError;
        arrActionError.push(caseError);
      }
    }
  }

  var conditionError = "";
  if (caseError.length > 0) {
    //var _method = ResourceManager.getInstance().getString('actions', "com.mobilous.builder.client.lib.adf.actions.action."+_methodName);
    conditionError = _methodName + caseError; //ResourceManager.getInstance().getString('uiparts', 'msg_Action')+" :- '"+ _method +"'"+ caseError;
  }

  return conditionError;
}

function getActionLocale(actiondic, actionlist) {
  let _actionDetail = [{ text: actiondic.method }];

  if (actionlist) {
    let _actionsbyCategory = actionlist.filter(function (category) {
      return category.name === getSelectedCategory(actiondic.type);
    });

    if (_actionsbyCategory.length > 0) {
      let _actionItems = _actionsbyCategory[0]["items"];
      _actionDetail = _actionItems.filter(function (item) {
        return item.name.toLowerCase() === actiondic.method.toLowerCase();
      });
    }
  }
  return _actionDetail[0];
}
function getSelectedCategory(actionType) {
  var category = null;
  switch (actionType) {
    case "Page":
      category = "PageTransitions";
      break;
    case "MainValue":
    case "CSV":
      category = "MainValue";
      break;
    case "Property":
      category = "PropertyControl";
      break;
    case "DataBase":
      category = "DbAction";
      break;
    case "Media":
    case "Library":
      category = "MediaControl";
      break;
    case "Warning":
      category = "WarningControl";
      break;
    case "Comm":
      category = "RemoteDBControl";
      break;
    case "Contact":
      category = "ContactControl";
      break;
    case "Calendar":
      category = "CalendarEventControl";
      break;
    case "GoogleMap":
      category = "MapControl";
      break;
    case "MapMarker":
      category = "MapMarkerControl";
      break;
    case "MapRoute":
      category = "MapRouteControl";
      break;
    case "Motion":
      category = "GPSControl";
      break;
    case "Sensor":
      category = "TimerControl";
      break;
    case "Email":
      category = "EmailControl";
      break;
    case "SystemControl":
      category = "SystemControl";
      break;
    case "SendPushNotification":
      category = "SendPushNotificationControl";
      break;
    case "IoT":
      category = "IoTControl";
      break;
    case "Gadget":
      category = "GadgetControl";
      break;
    default:
      category = "";
      break;
  }
  return category;
}

function getParentPageList(page, pagelist) {
  let arr = [];
  let pageid = page["pageid"];
  if (pageid.length === 0) return arr;

  let _parentId = page["parentid"];
  _parentId = _parentId.replace("page_", "");
  while (_parentId !== "App") {
    let _parentpage = getParantPage(_parentId, pagelist);
    if (_parentpage) {
      arr.push(_parentpage);
      _parentId = _parentpage.parentid;
    }
  }

  if (arr.length > 0) {
    let arrParent = [];
    arr.forEach((parent) => {
      arrParent.push(parent);
    });
    return arrParent;
  }

  return arr;
}
function getParantPage(_parentId, pagelist) {
  let parentObjArr = pagelist.filter(function (_page) {
    return _page["pageid"] === _parentId;
  });
  let _parentpage = parentObjArr[0];
  return _parentpage;
}

function getTabPageList(pagelist) {
  let tablist = [];
  pagelist.forEach((page) => {
    if (page["parentid"] === "App") {
      tablist.push({ Title: page.Title, pageid: page.pageid });
    }
  });

  return tablist;
}

////////////////////////////////////////////////////////////////////////////////////////////////

function validate_ResourceFiles(projectDic, objDic, propertyKey, dicType) {
  var arrFile;
  if (propertyKey.indexOf("audio") > -1 || propertyKey === "filename")
    arrFile = projectDic.bgms;
  else if (propertyKey.indexOf("filename") > -1)
    arrFile = projectDic.soundeffects;
  else if (propertyKey.indexOf("video") > -1) arrFile = projectDic.videos;
  else if (propertyKey.indexOf("markerfile") > -1) arrFile = projectDic.images;
  else arrFile = projectDic.images;

  var strFilename = "";
  for (var i = 0; i < arrFile.length; i++) {
    strFilename += arrFile[i]["filename"] + ", ";
  }

  let resourceObj;
  if (propertyKey.indexOf(".") > 0) {
    resourceObj = getNestedObjectValues(objDic, propertyKey);
  } else {
    resourceObj = objDic[propertyKey];
  }

  if (!resourceObj) {
    const _rerror = "Resource unfined error : " + propertyKey;
    return _rerror;
  }
  if (resourceObj["srcLocation"] === "bundle") {
    var resourceFile = "";
    if (String(resourceObj["filename"]).length > 0) {
      resourceFile = resourceObj["filename"] + "." + resourceObj["fileext"];
    }

    /* if(resourceFile === "defaultImage.png"){
        return "";
      } */

    if (resourceFile.length > 0) {
      if (strFilename.indexOf(resourceFile) === -1) {
        var resourceError = "";
        if (dicType === "action") {
          resourceError =
            "Action :- '" +
            objDic["method"] +
            "'\nResource file missing : " +
            resourceFile;
        } else resourceError = "Resource file not found : " + resourceFile;
        return resourceError;
      }
    }
  }
  return "";
}

function validate_WhereClause(whereString) {
  if (whereString && whereString.length > 0) {
    const whereExp = /"([^"]*)/; // checks for double quotes
    let bln_test = whereExp.test(whereString);
    if (bln_test) {
      return false;
    }
  }
  return true;
}

function validate_DisplayFormat(part, formatString) {
  // inputFormat, displayFormat, dateFormat, dateDataType, customDateFormat, numberDataType, numberFormat, numDisplayFormat, dateDisplay
  //trace(part.viewType, formatString, "==>>", part['displayFormat'], part[formatString]);

  if (part.hasOwnProperty("displayFormat") && part["displayFormat"] !== "") {
    var _displayFormat = part["displayFormat"];
    if (_displayFormat === "DateTime") {
      if (part.hasOwnProperty("dateFormat")) {
        if (part["dateFormat"] === "") return false;
        else if (part["dateFormat"] === "Custom") {
          if (
            part.hasOwnProperty("customDateFormat") &&
            part["customDateFormat"] === ""
          )
            return false;
        }
      }
    } else if (_displayFormat === "Number") {
      if (part.hasOwnProperty("numberFormat")) {
        if (part["numberFormat"] === "") return false;
        else if (
          part["_numberFormat"]["label"] === "integer" ||
          part["_numberFormat"]["label"] === "float"
        ) {
          if (
            part.hasOwnProperty("numDisplayFormat") &&
            part["numDisplayFormat"] === ""
          )
            return false;
        }
      }
    } else if (_displayFormat === "DateNumber") {
      if (part.hasOwnProperty("dateDisplay") && part["dateDisplay"] === "")
        return false;
    }
  }

  return true;
}

function getValidationError(validator, value, objDic, list) {
  let _validationError = "";
  //console.log(validator, " *** getValidationError *** ", value);

  switch (validator.toLowerCase()) {
    case "requiredvaluevalidator": {
      _validationError = "";
      if (value.length === 0) {
        _validationError = "Value is required";
      }
      break;
    }
    case "uniqpagetitlevalidator": {
      _validationError = "";
      list.forEach((page) => {
        if (page["pageid"] !== objDic["pageid"]) {
          let displayName = page["Title"];
          if (displayName === value) {
            _validationError = "Page name should be unique.";
          }
        }
      });

      const allowedChars = /\w/g;
      let allowedTitle = value.match(allowedChars);
      if (value.length !== allowedTitle.length)
        _validationError =
          _validationError + " Only alphabets, numbers & underscore allowed.";
      break;
    }
    case "uniquinamevalidator": {
      _validationError = "";
      list.forEach((element) => {
        let uipart = element["uiParts"][0];
        let displayName = uipart.name;
        if (displayName !== objDic["name"]) {
          if (displayName === value) {
            _validationError = "UIpart name should be unique.";
          }
        }
      });

      const allowedChars = /\w/g;
      let allowedName = value.match(allowedChars);
      if (value.length !== allowedName.length)
        _validationError =
          _validationError + " Only alphabets, numbers & underscore allowed.";
      break;
    }
    case "emptydisplaytext": {
      if (value.length === 0) {
        _validationError = "Set the 'fieldname' value";
      }
      break;
    }
    case "whereclausevalidator": {
      let where_RegExp = /"([^"]*)/; // checks for double quotes
      let obj_exec = where_RegExp.exec(value);
      let bln_test = where_RegExp.test(value);
      if (!obj_exec || !bln_test) {
        _validationError = "Double quotes not allowed";
      }
      break;
    }
    case "urlvalidator": {
      let validURL_RegExp =
        /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
      let obj_exec = validURL_RegExp.exec(value);
      let bln_test = validURL_RegExp.test(value);
      if (!obj_exec || !bln_test) {
        _validationError = "Invalid URL format";
      }
      break;
    }
    case "addressvalidator": {
      _validationError = ""; //addressValidation(value);
      break;
    }
    case "numfieldvalidator": {
      var validInput_RegExp = /^[^a-zBD-TV-Z#]+$/;
      if (!validInput_RegExp.test(value)) {
        _validationError = "Not allowed characters found";
      }
      break;
    }
    case "datetimeformatvalidator": {
      _validationError = ""; //datetimeformatValidation(value);
      break;
    }
    default:
      _validationError = "";
      break;
  }

  return _validationError;
}

const SCROLL_VIEW = "ScrollView";
const PAGE_SCROLL_VIEW = "PageScrollView";
const DB_TABLE_VIEW_LIST = "DbTableViewList";
const REMOTE_TABLE_VIEW_LIST = "RemoteTableViewList";
function getAllChildrenOnPage(_page, scrIndex, includeDisableUI) {
  let arrChildren = [];
  if (!_page) {
    return arrChildren;
  }
  if (_page.viewType.indexOf("TableView") > -1) {
    if (
      _page.viewType === DB_TABLE_VIEW_LIST ||
      _page.viewType === REMOTE_TABLE_VIEW_LIST
    ) {
      let arrFields0 = _page.Children[0].Group[0].RecordCellDef.Fields;
      for (let i0 = 0; i0 < arrFields0.length; i0++) {
        arrChildren.push(arrFields0[i0]);
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
    if (_page.viewType === SCROLL_VIEW || _page.viewType === PAGE_SCROLL_VIEW)
      pageChildren = _page.Children[0].Children;
    else pageChildren = _page.Children;

    pageChildren.forEach((uiContainerDic) => {
      arrChildren.push(uiContainerDic);
      if (uiContainerDic["viewType"] === "TileList") {
        let arrTileItems = uiContainerDic["uiParts"][0].dataarray[0]["Fields"];
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
            if (
              !_topToolbarChildPartDic["_enabledOnScreen"] &&
              !includeDisableUI
            )
              continue;
          }
          arrChildren.push(_topToolbar.Children[t]);
          if (_topToolbar.Children[t]["viewType"] === "TileList") {
            let arrtTileItems =
              _topToolbar.Children[t]["uiParts"][0].dataarray[0]["Fields"];
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
            if (
              !_bottomToolbarChildPartDic["_enabledOnScreen"] &&
              !includeDisableUI
            )
              continue;
          }
          arrChildren.push(_bottomToolbar.Children[b]);
          if (_bottomToolbar.Children[b]["viewType"] === "TileList") {
            let arrbTileItems =
              _bottomToolbar.Children[b]["uiParts"][0].dataarray[0]["Fields"];
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
      /* if(includeDisableUI)
          console.log(scrIndex, "::", cntLeft, "_____________", _page.Title, ">>>", _page._toolBarLeft); */
      if (cntLeft === scrIndex) {
        for (let l = 0; l < _leftToolbar.Children.length; l++) {
          let _leftToolbarUIContainerDic = _leftToolbar.Children[l];
          let _leftToolbarChildPartDic =
            _leftToolbarUIContainerDic["uiParts"][scrIndex];
          if (_leftToolbarChildPartDic) {
            if (
              !_leftToolbarChildPartDic["_enabledOnScreen"] &&
              !includeDisableUI
            ) {
              continue;
            }
          }
          arrChildren.push(_leftToolbar.Children[l]);
          if (_leftToolbar.Children[l]["viewType"] === "TileList") {
            let arrlTileItems =
              _leftToolbar.Children[l]["uiParts"][0].dataarray[0]["Fields"];
            for (let l0 = 0; l0 < arrlTileItems.length; l0++) {
              arrChildren.push(arrlTileItems[l0]);
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
          let _rightToolbarUIContainerDic = _rightToolbar.Children[r];
          let _rightToolbarChildPartDic =
            _rightToolbarUIContainerDic["uiParts"][scrIndex];
          if (_rightToolbarChildPartDic) {
            if (
              !_rightToolbarChildPartDic["_enabledOnScreen"] &&
              !includeDisableUI
            )
              continue;
          }
          arrChildren.push(_rightToolbar.Children[r]);
          if (_rightToolbar.Children[r]["viewType"] === "TileList") {
            let arrrTileItems =
              _rightToolbar.Children[r]["uiParts"][0].dataarray[0]["Fields"];
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
        if (overlayChildren[o]["viewType"] === "Dialog") {
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

function mapStateToProps(state) {
  return {
    apiParam: state.appParam.params,
    appData: state.appData.data,
    pageList: state.appData.pagelist,
    pageConfig: state.appParam.pageconfig,
    pageLocale: state.appParam.pagelocale,
    uiConfig: state.appParam.uiconfig,
    uiLocale: state.appParam.uilocale,
    actionConfig: state.appParam.actionconfig,
    actionLocale: state.appParam.actionlocale,
    currentPage: state.selectedData.pagedata,
  };
}
export default connect(mapStateToProps)(ProjectValidation);
