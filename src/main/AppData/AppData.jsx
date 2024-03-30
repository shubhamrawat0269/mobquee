import React from "react";
import { connect } from "react-redux";
import "./AppDataStyle.css";
import ReactXMLParser from "react-xml-parser";
import { CircularProgress, Snackbar } from "@mui/material";

import AppHeader from "../editors/AppHeader/AppHeader";
import AppEditor from "../editors/AppEditor/AppEditor";
import LoginWindow from "../../components/LoginWindow/LoginWindow";
import {
  setProjectData,
  setAppCredentials,
  setContributorTabs,
} from "../ServiceActions";
import {
  setPageLocale,
  setPageContainer,
  setPageConfig,
  setUILocale,
  setUIList,
  setUIConfig,
  setActionLocale,
  setActionList,
  setActionConfig,
} from "../ServiceActions";
import SaveAppEditor from "../helpers/SaveAppEditor/saveAppEditor";

class AppData extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      themetype: "light",
      projectdetail: false,

      project: [],
      isLoaded: false,
      error: null,
      openalert: false,
      isFreeze: false,
    };

    this.handleProjectDetailsOpened =
      this.handleProjectDetailsOpened.bind(this);
    this.handleThemeChange = this.handleThemeChange.bind(this);
  }

  componentDidMount() {
    this.getProjectData();
  }

  getProjectData() {
    this.fetchProjectDic().then((response) =>
      this.fetchProjectData(response).then((response) =>
        this.getAppConfigFiles(response)
      )
    );
  }

  /* Step 1: THis is the first API call trigger for getting Project Data */
  fetchProjectDic() {
    return fetch("././config/ProjectDic.json")
      .then((res) => res.json())
      .then(
        (result) => {
          return result.Project[0];
        },
        (error) => {
          console.log("fetchProjectDic error: ", error);
          this.setState({
            error,
          });
        }
      );
  }

  fetchProjectData(_projectDic) {
    let api_projectget =
      this.props.appconfig.apiURL +
      "service.json?command=projectget&userid=" +
      this.props.appconfig.userid +
      "&sessionid=" +
      this.props.appconfig.sessionid +
      "&projectid=" +
      this.props.appconfig.projectid;
    //let api_options = {method: 'POST', mode:'cors'};
    return fetch(api_projectget)
      .then((res) => res.json())
      .then(
        (result) => {
          if (result.response === "NACK") {
            const _err = { message: result.error };
            this.setState({
              isLoaded: true,
              error: _err,
            });
          } else {
            var _project = result.project;
            // console.log(_project["owner"], this.props.appconfig.userid);
            if (_project && _project.hasOwnProperty("owner")) {
              if (_project["owner"] !== this.props.appconfig.userid) {
                console.log(
                  "Try loading a project which do not belongs to this user. Refer bug #11407"
                );
                const _err = {
                  message:
                    "Try loading a project which do not belongs to this user",
                };
                this.setState({
                  isLoaded: true,
                  error: _err,
                });
                this.setState({ openalert: false });
                return;
              }
            }

            const _projectData = Object.assign({}, _projectDic, result.project);
            // console.log(_projectData);
            if (
              _projectData["TableDefs"] &&
              _projectData["TableDefs"].length === 0
            ) {
              _projectData["TableDefs"] = _projectDic["TableDefs"];
            }
            manageProjectData(_projectData);
            // console.log("...Project Data >>>", _projectData);
            this.props.dispatch(setProjectData(_projectData));

            if (_projectData["isFreeze"] === "0") {
              this.setState({ isFreeze: true });
            }

            if (_projectData.hasOwnProperty("Contributors")) {
              const contributors = _projectData["Contributors"];
              if (contributors.length > 1) {
                let contributorObj = contributors.filter(function (node) {
                  if (
                    node["contributorName"] === _projectData["owner"] &&
                    node["contributorProjectid"] === _projectData["projectid"]
                  ) {
                    return true;
                  }
                  return false;
                });
                if (contributorObj.length > 0) {
                  const contributorTabs = contributorObj[0]["selectTabPages"];
                  //console.log("...selectTabPages >>>", contributorTabs);
                  const _tabs = [...new Set(contributorTabs)];
                  if (_tabs.length === 0) {
                    this.props.dispatch(setContributorTabs(["none"]));
                  } else {
                    let arrTabs = _tabs.filter(function (node) {
                      if (node !== "none") {
                        return true;
                      }
                      return false;
                    });

                    this.props.dispatch(setContributorTabs(arrTabs));
                    contributorObj[0]["selectTabPages"] = arrTabs;
                  }
                }
              } else {
                if (contributors.length === 0) {
                  contributors.push({
                    contributorName: "",
                    contributorProjectid: "",
                    description: "",
                    mainProjectid: "",
                    owner: "",
                    selectTabPages: [],
                  });
                }
              }
            }

            this.setState({
              isLoaded: true,
              project: _projectData,
            });
          }
          // console.log(result.response);
          return result.response;
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
  }

  handleCloseAlert() {
    this.setState({ openalert: true });
  }

  getAppConfigFiles(resp) {
    if (resp === "ACK") {
      const lang = this.props["apiParam"]["locale"];
      this.fetchPageLocale(lang).then((response) => this.fetchPageContainer());
      this.fetchUILocale(lang).then((response) => this.fetchUIList());
      this.fetchActionLocale(lang).then((response) =>
        this.fetchActionList(response)
      );
    }
  }

  fetchPageLocale(lang) {
    let localefilePath;
    if (lang === "ja" || lang === "jp") {
      localefilePath = "././locale/ja_JP/pageproperties.json";
    } else {
      localefilePath = "././locale/en_US/pageproperties.json";
    }

    return fetch(localefilePath)
      .then((res) => res.json())
      .then(
        (result) => {
          // console.log(result["PageLocale"]);
          let pageLocale = result["PageLocale"];
          this.props.dispatch(setPageLocale(pageLocale));
          return;
        },
        (error) => {
          // console.log("Page-Locale fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  fetchPageContainer() {
    fetch("././config/PageConfig.json")
      .then((res) => res.json())
      .then(
        (result) => {
          let pageContainers = result["container"];
          this.props.dispatch(setPageContainer(pageContainers));

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

  fetchPageConfig(targetClass) {
    let _classpath = "././config/container/" + targetClass + ".xml";
    //console.log("fetchPageConfig >>>", _classpath);
    fetch(_classpath)
      .then((res) => res.text())
      .then(
        (result) => {
          // var XMLParser = require("react-xml-parser");
          var xml = new ReactXMLParser().parseFromString(result);
          var pageitem = xml.getElementsByTagName("item");
          if (pageitem.length > 0) {
            var pageproperties = xml.getElementsByTagName("type");
            this.setItemTemplate(pageitem[0], pageproperties, "page");
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

  fetchUILocale(lang) {
    let localefilePath;
    if (lang === "ja" || lang === "jp") {
      localefilePath = "././locale/ja_JP/uiproperties.json";
    } else {
      localefilePath = "././locale/en_US/uiproperties.json";
    }
    return fetch(localefilePath)
      .then((res) => res.json())
      .then(
        (result) => {
          // console.log(result["UILocale"]);
          let uiLocale = result["UILocale"];
          this.props.dispatch(setUILocale(uiLocale));
          return;
        },
        (error) => {
          console.log("UI-Locale fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  fetchUIList() {
    var self = this;
    fetch("././config/UIConfig.json")
      .then((res) => res.json())
      .then(
        (result) => {
          // Toolbar list item For Eg. ==> Text And Image , Button , Media&Library
          // console.log(result["UIParts"]);
          let uiParts = result["UIParts"];
          uiParts = uiParts.filter(function (category) {
            if (category.include === "true") {
              let uiItems = category["items"];
              uiItems = uiItems.filter(function (item) {
                if (item.visible === "true") {
                  let uiDisplayName = item["type"]
                    ? item["name"] + item["type"]
                    : item["name"];
                  self.fetchUIConfig(uiDisplayName);
                  return item;
                }
                return item.visible === "true";
              });
              category["items"] = uiItems;
            }
            return category.include === "true";
          });

          this.props.dispatch(setUIList(uiParts));

          /* uiParts.forEach(element => {
              let uiItems = element['items'];
              uiItems.forEach(uipart => {
                let uiDisplayName = (uipart['type']) ? uipart['name']+uipart['type'] : uipart['name'];                
                this.fetchUIConfig(uiDisplayName);
              });
            }); */
        },
        (error) => {
          console.log("UI-list fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  fetchUIConfig(uipart) {
    let _classpath = "././config/uipart/" + uipart + ".xml";

    let uiTemplate = [];
    return fetch(_classpath)
      .then((res) => res.text())
      .then(
        (result) => {
          //console.log("config >>>", result);

          // var XMLParser = require("react-xml-parser");
          var xml = new ReactXMLParser().parseFromString(result);
          var uiitem = xml.getElementsByTagName("item");
          if (uiitem.length > 0) {
            var uiproperties = xml.getElementsByTagName("type");
            uiTemplate = this.setItemTemplate(
              uiitem[0],
              uiproperties,
              "uipart"
            );
            return uiTemplate;
          }
        },
        (error) => {
          console.log("UI config error >>>", error);
        }
      );
  }

  setItemTemplate(item, properties, source) {
    let _itemConfig;
    if (source === "page") {
      _itemConfig = this.props.pageConfig;
    } else if (source === "uipart") {
      _itemConfig = this.props.uiConfig;
    } else {
      _itemConfig = this.props.actionConfig;
    }

    let itemAttr = item.attributes;
    let typeConfig = [];
    properties.forEach((element) => {
      let propObj = element.attributes;
      if (source === "action") {
        if (propObj.name === "parameters") {
          typeConfig.push({
            name: propObj.name,
            properties: this.populateItemConfig(element.children, "action"),
          });
          //typeConfig.push({_itemObj:item, _propObj:element});
        }
      } else {
        typeConfig.push({
          name: propObj.name,
          properties: this.populateItemConfig(element.children, source),
        });
      }
    });
    itemAttr.children = typeConfig;

    /* var bars= [];    
      let configChildren = itemAttr.children;
      configChildren.forEach(element => {
        let configname = element.name.toString().toLowerCase();
        if(configname.indexOf('bar') > -1){          
         //bars = bars.concat(element.properties);
          bars.push.apply(bars, element.properties);
        }        
      });    
      console.log("bars >>>>", bars);
      let barsObj = {name:"Page Bars", properties:bars};    
      itemAttr.children.push(barsObj); */

    _itemConfig.push(itemAttr);
    if (source === "page") {
      this.props.dispatch(setPageConfig(_itemConfig));
    } else if (source === "uipart") {
      this.props.dispatch(setUIConfig(_itemConfig));
    } else {
      //this.generateActionConfig(_itemConfig)
      //console.log("setActionConfig >>>>>", _itemConfig);
      this.props.dispatch(setActionConfig(_itemConfig));
    }
  }

  populateItemConfig(properties, source) {
    var _propConfig = [];
    if (properties.length === 0) return _propConfig;

    properties.forEach((element) => {
      let propObj = element.attributes;
      if (element.children !== undefined && element.children.length > 0) {
        let otherObj = this.populatePropertyObjects(element, source);
        for (let index = 0; index < otherObj.length; index++) {
          const item = otherObj[index];
          propObj[item.name] = item.items;
          if (item.name === "dataSource") {
            propObj["labelField"] = item["labelField"]
              ? item["labelField"]
              : "";
            propObj["valueField"] = item["valueField"]
              ? item["valueField"]
              : "";
          }
        }
      }
      _propConfig.push(propObj);
    });

    return _propConfig;
  }

  populatePropertyObjects(propobj, source) {
    let children = propobj.children;
    var _propObj = [];
    children.forEach((element) => {
      let _prop = [];

      if (element.children.length > 0) {
        let isdsObj = false;
        for (let index = 0; index < element.children.length; index++) {
          const item = element.children[index];
          if (element.name === "validations") {
            _prop.push(item.attributes.validator);
          } else if (element.name === "dataSource") {
            //console.log(source, " .... dataSource ....", item.attributes);
            if (
              propobj["attributes"] &&
              propobj["attributes"].hasOwnProperty("labelField") &&
              propobj["attributes"]["labelField"] !== ""
            ) {
              _prop.push(item.attributes);
              isdsObj = true;
            } else {
              _prop.push(item.attributes.name);
            }
          } else if (element.name === "dependentActions") {
            _prop.push(item);
          }
        }

        if (isdsObj) {
          _propObj.push({
            name: element.name,
            items: _prop,
            labelField: propobj["attributes"]["labelField"],
            valueField: propobj["attributes"]["valueField"],
          });
        } else {
          _propObj.push({ name: element.name, items: _prop });
        }
      } else {
        if (element.name === "dataSource") {
          _prop = generateDataSource(
            this.state.project,
            source,
            _prop,
            element.attributes
          );
          //console.log(element, " .... dataSource ....", _prop);
          _propObj.push({
            name: element.name,
            labelField: element.attributes["labelField"],
            valueField: element.attributes["valueField"],
            items: _prop,
          });
        }
      }
    });

    return _propObj;
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
          // console.log(result["ActionLocale"]);
          let actionLocale = result["ActionLocale"];
          //console.log("....Action-Locale fetching success >>>", actionLocale);
          this.props.dispatch(setActionLocale(actionLocale));
          return actionLocale;
        },
        (error) => {
          console.log("Action-Locale fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  fetchActionList(actionLocale) {
    var self = this;
    return fetch("././config/ActionConfig.json")
      .then((res) => res.json())
      .then(
        (result) => {
          let actions = result["Actions"];
          actions = actions.filter(function (category) {
            //return category.include === "true";

            if (category.include === "true") {
              let uiItems = category["items"];
              uiItems = uiItems.filter(function (item) {
                if (item.visible === "true") {
                  self.fetchActionConfig(item["type"], item["name"]);
                  return item;
                }
                return item.visible === "true";
              });
              category["items"] = uiItems;
            }
            return category.include === "true";
          });

          for (let index = 0; index < actions.length; index++) {
            const category = actions[index];
            let actionItems = category["items"];
            category["items"] = this.setActionListLocale(
              actionItems,
              actionLocale
            );
          }
          //console.log("....Action-List config >>>", actions);
          this.props.dispatch(setActionList(actions));
        },
        (error) => {
          console.log("Action-list fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }
  setActionListLocale(actionItems, actionLocale) {
    actionItems.forEach((action) => {
      action = actionLocale.filter(function (item) {
        if (item.method === action.name) {
          action["text"] = item.properties[0]["text"];
          action["toolTip"] = item.properties[0]["toolTip"];
          return true;
        }
        return false;
      });
    });

    return actionItems;
  }

  fetchActionConfig(acttype, actionname) {
    let _name = actionname.charAt(0).toUpperCase() + actionname.substr(1);
    let _classpath =
      "././config/action/" +
      this.getSelectedCategory(acttype) +
      "/" +
      this.getSelectedAction(_name) +
      ".xml";
    //console.log(acttype, actionname, "...fetchActionConfig >>>", _name, _classpath);

    fetch(_classpath)
      .then((res) => res.text())
      .then(
        (result) => {
          //console.log("config >>>", result);

          // var XMLParser = require("react-xml-parser");
          var xml = new ReactXMLParser().parseFromString(result);
          //console.log(actionname, ">>>>>>>>", xml);
          var actionitem = xml.getElementsByTagName("item");
          if (actionitem.length > 0) {
            var actionproperties = xml.getElementsByTagName("type");
            this.setItemTemplate(actionitem[0], actionproperties, "action"); //setActionTemplate(actionitem[0], actionproperties, basedata);
          }
        },
        (error) => {
          console.log(actionname, " action config error >>>", error);
        }
      );
  }
  getSelectedAction(actionName) {
    let action = null;
    switch (actionName) {
      case "CanSendEmail":
        action = "CanSendMail";
        break;
      default:
        action = actionName;
        break;
    }
    return action;
  }
  getSelectedCategory(actionType) {
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
      case "LogsAnalytics":
        category = "LogsAnalyticsControl";
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

  /////////////////////////////////

  handleRelogin(pwd) {
    let encryptPwd = window
      .require("crypto")
      .createHash("md5")
      .update(pwd)
      .digest("hex");

    let api_relogin =
      this.props.appconfig.apiURL +
      "login.json?command=login&username=" +
      this.props.appconfig.userid +
      "&password=" +
      encryptPwd +
      "&oldsession=" +
      this.props.appconfig.sessionid;
    fetch(api_relogin, { method: "POST" })
      .then((res) => res.json())
      .then(
        (result) => {
          if (result.response === "NACK") {
            var _err = { message: result.error };
            this.setState({
              isLoaded: true,
              error: _err,
            });
            this.setState({ openalert: false });
          } else {
            let credentials = {
              userid: result.userid,
              sessionid: result.sessionid,
              projectid: this.props.appconfig.projectid,
              locale: "en",
            };
            //console.log("credentials object >>", credentials);
            this.props.dispatch(setAppCredentials(credentials));

            this.setState({ isLoaded: false });
            this.getProjectData();
            this.setState({ openalert: false });
            this.setState({ error: null });
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

  /////////////////////////////////

  handleCompleteSaveApp(projectData) {
    this.props.dispatch(setProjectData(projectData));
    this.setState({ isFreeze: false });
  }

  handleProjectDetailsOpened(param) {
    if (param === "close") {
      this.setState({ projectdetail: false });
    } else {
      this.setState({ projectdetail: true });
    }
    //console.log("--Project Details closed--", this.state.projectdetail);
  }

  handleThemeChange() {
    if (this.state.themetype === "light") this.setState({ themetype: "dark" });
    else this.setState({ themetype: "light" });
  }

  render() {
    const { show, error, isLoaded, project, isFreeze } = this.state;
    const apiParam = {
      apiURL: this.props.appconfig.apiURL,
      userid: this.props.appconfig.userid,
      sessionid: this.props.appconfig.sessionid,
      projectid: this.props.appconfig.projectid,
    };

    if (!show) {
      return null;
    }

    if (error) {
      const errmsg = <h4 className="error-notify">{error.message}</h4>;
      return (
        <div className="backdropStyle">
          {this.state.openalert && (
            <LoginWindow
              loginid={apiParam.userid}
              onRelogin={this.handleRelogin.bind(this)}
            />
          )}
          {!this.state.openalert && (
            <Snackbar
              open={!this.state.openalert}
              autoHideDuration={5000}
              onClose={this.handleCloseAlert.bind(this)}
              message={errmsg}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              action={
                <React.Fragment>
                  <button
                    className="error-notify-btn"
                    onClick={this.handleCloseAlert.bind(this)}
                  >
                    OK
                  </button>
                </React.Fragment>
              }
            />
          )}
        </div>
      );
    } else if (!isLoaded) {
      return (
        <div className="backdropStyle">
          <CircularProgress style={{ marginRight: 8 }} /> <h4>Loading...</h4>
        </div>
      );
    } else if (isFreeze) {
      return (
        <SaveAppEditor
          appconfig={apiParam}
          data={project}
          onSaveAppComplete={this.handleCompleteSaveApp.bind(this)}
        />
      );
    } else {
      return (
        <section id="appexe-main-section">
          <AppHeader
            appconfig={apiParam}
            data={project}
            openProjectDetails={this.handleProjectDetailsOpened}
            onThemeChange={this.handleThemeChange}
          />
          <AppEditor
            appconfig={apiParam}
            data={project}
            isProjectDetail={this.state.projectdetail}
          />
        </section>
      );
    }
  }
}

function generateDataSource(baseData, source, resultArr, attributes) {
  let attrSource = attributes["source"].replace("{", "").replace("}", "");
  let methodName = attrSource.split(":")[1].split("(")[0];
  //console.log(attributes, " .... dataSource ....", methodName);

  let _data = [];
  switch (methodName) {
    case "getServices":
      _data = getServices(baseData);
      break;
    /* case "getDbTableDicsByServiceName":
        _data = getDbTableDicsByServiceName(baseData);
        break; */
    case "getFontNames":
      _data = getFontNames();
      break;

    default:
      _data = [];
  }

  if (_data.length > 0) {
    for (let i = 0; i < _data.length; i++) {
      const element = _data[i];
      resultArr.push(element);
    }
  } else {
    resultArr = [];
    resultArr.push("func_" + attrSource.slice(attrSource.indexOf(":") + 1));
    //console.log(resultArr, " .... dataSource ....", methodName);
  }

  return resultArr;
}

function getServices(baseData, dbType = "") {
  let TableDefs = baseData["TableDefs"];
  let RemoteTableDefs = baseData["RemoteTableDefs"];

  var services = [];
  var uniqServices = [];

  if (dbType !== "remote") {
    if (TableDefs.length > 0) services.push({ label: "LocalDB", value: "" });

    if (dbType.length > 0) return services;
  }

  for (var j = 0; j < RemoteTableDefs.length; j++) {
    var dbTableDic = RemoteTableDefs[j];
    var key = dbTableDic.servicename;
    if (uniqServices.indexOf(dbTableDic.servicename) < 0) {
      uniqServices.push(dbTableDic.servicename);
      var service = { label: key, value: key };
      services.push(service);
    }
  }
  return services;
}

function getFontNames() {
  let preDefined_Fonts = ["Amazon Ember"]; //["Helvetica Neue","Arial","Courier","Courier New","Helvetica","Helvetica Neue","Georgia","Palatino","Times New Roman","Trebuchet MS","Verdana"];
  preDefined_Fonts.unshift("system");

  return preDefined_Fonts;
}

function manageProjectData(projectDic) {
  if (projectDic.hasOwnProperty("availableScreens")) {
    manageAvailableScreens(projectDic["availableScreens"]);
  }
  if (projectDic.hasOwnProperty("TableDefs")) {
    manageLocalTableDefs(projectDic["TableDefs"]);
  }
  if (projectDic.hasOwnProperty("RemoteTableDefs")) {
    manageRemoteTableDefs(projectDic["RemoteTableDefs"]);
  }
  if (projectDic.hasOwnProperty("customActions")) {
    const _customActions = projectDic["customActions"];
    if (!_customActions.hasOwnProperty("helper")) {
      projectDic["customActions"] = { helper: [] };
    }
  }
  if (
    projectDic.hasOwnProperty("PageStyle") &&
    projectDic.hasOwnProperty("UIpartStyle")
  ) {
    projectDic["AppStyle"] = {
      PageStyle: projectDic["PageStyle"],
      UIpartStyle: projectDic["UIpartStyle"],
      rememberMe: false,
    };
    delete projectDic["PageStyle"];
    delete projectDic["UIpartStyle"];
  }

  return projectDic;
}
function manageAvailableScreens(screenDefs) {
  screenDefs.forEach((screenDef, i) => {
    if (
      screenDef["orientation"] === "Landscape" &&
      parseInt(screenDef["width"]) < parseInt(screenDef["height"])
    ) {
      const screenClone = JSON.parse(JSON.stringify(screenDef));
      screenDef["width"] = parseInt(screenClone["height"]);
      screenDef["height"] = parseInt(screenClone["width"]);
      //console.log(i, "...Project Available ScreenDefs >>>", screenDef);
    }
  });
}
function manageLocalTableDefs(localTableDefs) {
  //console.log("...Project Data TableDefs >>>", localTableDefs);
  if (!localTableDefs) {
    localTableDefs = [];
  }

  let isspotdetail = false;
  localTableDefs.forEach((tableDef) => {
    if (tableDef["tablename"] === "spotdetail") {
      isspotdetail = true;
    }

    tableDef["servicename"] = "";
    if (!tableDef.hasOwnProperty("host")) tableDef["host"] = "";
    if (!tableDef.hasOwnProperty("dbname")) tableDef["dbname"] = "";
    if (!tableDef.hasOwnProperty("tableid")) tableDef["tableid"] = "";
    if (!tableDef.hasOwnProperty("csvfilename")) tableDef["csvfilename"] = "";
    if (!tableDef.hasOwnProperty("view")) tableDef["view"] = false;
    if (!tableDef.hasOwnProperty("script")) tableDef["script"] = "";
    if (!tableDef.hasOwnProperty("trigger")) tableDef["trigger"] = false;
    if (!tableDef.hasOwnProperty("triggername")) tableDef["triggername"] = "";
    if (!tableDef.hasOwnProperty("procedure")) tableDef["procedure"] = false;
    if (!tableDef.hasOwnProperty("procedurename"))
      tableDef["procedurename"] = "";
    if (!tableDef.hasOwnProperty("watch_table")) tableDef["watch_table"] = "";
    if (!tableDef.hasOwnProperty("watch_trigger"))
      tableDef["watch_trigger"] = "";
    if (!tableDef.hasOwnProperty("watch_procedure"))
      tableDef["watch_procedure"] = "";

    let arrFields = tableDef["fields"];
    if (arrFields) {
      for (let i = 0; i < arrFields.length; i++) {
        const fieldObj = arrFields[i];
        if (fieldObj.hasOwnProperty("primary")) {
          if (fieldObj["primary"] === "true") {
            fieldObj["primary"] = true;
          } else if (fieldObj["primary"] === "false") {
            fieldObj["primary"] = false;
          }
        }
        /* else {
            fieldObj['primary'] = false;
          } */

        if (!fieldObj.hasOwnProperty("primary")) fieldObj["primary"] = false;
        if (!fieldObj.hasOwnProperty("autoinc")) fieldObj["autoinc"] = false;
        if (!fieldObj.hasOwnProperty("notNull")) fieldObj["notNull"] = true;
        //if(!fieldObj.hasOwnProperty("index"))         fieldObj['index'] = false;
        if (!fieldObj.hasOwnProperty("fieldname")) fieldObj["fieldname"] = "";
        if (!fieldObj.hasOwnProperty("dbType")) fieldObj["dbType"] = "TEXT";
        if (!fieldObj.hasOwnProperty("description"))
          fieldObj["description"] = "";
        if (!fieldObj.hasOwnProperty("defaultValue"))
          fieldObj["defaultValue"] = "";
      }

      if (!tableDef.hasOwnProperty("fieldsWithBlank")) {
        let _fieldsWithBlank = JSON.parse(JSON.stringify(arrFields));
        const blankObj = {
          autoinc: false,
          primary: false,
          index: false,
          dbType: "TEXT",
          fieldname: "",
          defaultValue: "",
          description: "",
          createddatetime: "",
          updateddatetime: "",
        };
        _fieldsWithBlank.unshift(blankObj);

        tableDef["fieldsWithBlank"] = _fieldsWithBlank;
      }
      if (!tableDef.hasOwnProperty("fieldswithBracket")) {
        const _fields = JSON.parse(JSON.stringify(arrFields));
        let _fieldswithBracket = [];
        _fieldswithBracket.push("[]");
        for (let j = 0; j < _fields.length; j++) {
          const _fieldname = "[" + _fields[j]["fieldname"] + "]";
          _fieldswithBracket.push(_fieldname);
        }

        tableDef["fieldswithBracket"] = _fieldswithBracket;
      }
    } else {
      tableDef["fields"] = [];
      tableDef["fieldsWithBlank"] = [];
      tableDef["fieldswithBracket"] = [];
    }
  });

  //console.log(isspotdetail, "...Project Data TableDefs >>>", localTableDefs);
  if (!isspotdetail) {
    const _spotdetailObj = {
      _uid: "",
      description: "",
      tablename: "spotdetail",
      servicename: "",
      dbname: "",
      csvfilename: "",
      host: "",
      tableid: "",
      triggername: "",
      watch_table: "",
      script: "",
      createddatetime: "",
      watch_trigger: "",
      procedurename: "",
      watch_procedure: "",
      procedure: false,
      updateddatetime: "",
      view: false,
      trigger: false,
      fields: [
        {
          description: "internal id",
          fieldname: "id",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "INTEGER",
          index: false,
          primary: true,
          autoinc: true,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "marker unique id",
          fieldname: "markerid",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "marker group name",
          fieldname: "locname",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "title of annotation",
          fieldname: "title",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "subtitle of annotation",
          fieldname: "subtitle",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "image file selected from bundle for left view",
          fieldname: "leftview",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "action when leftview clicked",
          fieldname: "leftaction",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "system button name or blank",
          fieldname: "rightview",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "action when rightview clicked",
          fieldname: "rightaction",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "latitude of marker",
          fieldname: "latitude",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "REAL",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "longitude of marker",
          fieldname: "longitude",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "REAL",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "zoom limit to be displayed",
          fieldname: "limitzoom",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "INTEGER",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "On: callout, Off: nothing popup",
          fieldname: "callout",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "BOOLEAN",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "visible flag for internal",
          fieldname: "visible",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "BOOLEAN",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "marker-type e.g. Custom",
          fieldname: "markertype",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "image file selected from bundle",
          fieldname: "markerfile",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "X-axis distance from top-left corner of marker-file",
          fieldname: "anchorx",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "INTEGER",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "Y-axis distance from top-left corner of marker-file",
          fieldname: "anchory",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "INTEGER",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "",
          fieldname: "leftviewimage",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "image file selected from bundle for right view",
          fieldname: "rightviewimage",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
      ],
      fieldsWithBlank: [
        {
          description: "",
          fieldname: "",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "C8EDB6B9-93CC-B757-2ABF-944EF15F8105",
        },
        {
          description: "internal id",
          fieldname: "id",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "INTEGER",
          index: false,
          primary: true,
          autoinc: true,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "marker unique id",
          fieldname: "markerid",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "marker group name",
          fieldname: "locname",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "title of annotation",
          fieldname: "title",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "subtitle of annotation",
          fieldname: "subtitle",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "image file selected from bundle for left view",
          fieldname: "leftview",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "action when leftview clicked",
          fieldname: "leftaction",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "system button name or blank",
          fieldname: "rightview",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "action when rightview clicked",
          fieldname: "rightaction",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "latitude of marker",
          fieldname: "latitude",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "REAL",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "longitude of marker",
          fieldname: "longitude",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "REAL",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "zoom limit to be displayed",
          fieldname: "limitzoom",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "INTEGER",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "On: callout, Off: nothing popup",
          fieldname: "callout",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "BOOLEAN",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "visible flag for internal",
          fieldname: "visible",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "BOOLEAN",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "marker-type e.g. Custom",
          fieldname: "markertype",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "image file selected from bundle",
          fieldname: "markerfile",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "X-axis distance from top-left corner of marker-file",
          fieldname: "anchorx",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "INTEGER",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "Y-axis distance from top-left corner of marker-file",
          fieldname: "anchory",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "INTEGER",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "",
          fieldname: "leftviewimage",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
        {
          description: "image file selected from bundle for right view",
          fieldname: "rightviewimage",
          createddatetime: "",
          updateddatetime: "",
          notNull: true,
          dbType: "TEXT",
          index: false,
          primary: false,
          autoinc: false,
          defaultValue: "",
          _uid: "",
        },
      ],
      fieldswithBracket: [
        "[]",
        "[id]",
        "[markerid]",
        "[locname]",
        "[title]",
        "[subtitle]",
        "[leftview]",
        "[leftaction]",
        "[rightview]",
        "[rightaction]",
        "[latitude]",
        "[longitude]",
        "[limitzoom]",
        "[callout]",
        "[visible]",
        "[markertype]",
        "[markerfile]",
        "[anchorx]",
        "[anchory]",
        "[leftviewimage]",
        "[rightviewimage]",
      ],
    };

    localTableDefs.unshift(_spotdetailObj);
  }
  return localTableDefs;
}
function manageRemoteTableDefs(remoteTableDefs) {
  if (!remoteTableDefs) {
    remoteTableDefs = [];
  }

  remoteTableDefs.forEach((tableDef) => {
    if (!tableDef.hasOwnProperty("host")) tableDef["host"] = "";
    if (!tableDef.hasOwnProperty("dbname")) tableDef["dbname"] = "";
    if (!tableDef.hasOwnProperty("tableid")) tableDef["tableid"] = "";
    if (!tableDef.hasOwnProperty("csvfilename")) tableDef["csvfilename"] = "";
    if (!tableDef.hasOwnProperty("view")) tableDef["view"] = false;
    if (!tableDef.hasOwnProperty("script")) tableDef["script"] = "";
    if (!tableDef.hasOwnProperty("trigger")) tableDef["trigger"] = false;
    if (!tableDef.hasOwnProperty("triggername")) tableDef["triggername"] = "";
    if (!tableDef.hasOwnProperty("procedure")) tableDef["procedure"] = false;
    if (!tableDef.hasOwnProperty("procedurename"))
      tableDef["procedurename"] = "";
    if (!tableDef.hasOwnProperty("watch_table")) tableDef["watch_table"] = "";
    if (!tableDef.hasOwnProperty("watch_trigger"))
      tableDef["watch_trigger"] = "";
    if (!tableDef.hasOwnProperty("watch_procedure"))
      tableDef["watch_procedure"] = "";

    let arrFields = tableDef["fields"];
    if (arrFields) {
      for (let i = 0; i < arrFields.length; i++) {
        const fieldObj = arrFields[i];
        /* if(fieldObj.hasOwnProperty('primary')) {
            if(fieldObj['primary'] === "true") {
              fieldObj['primary'] = true;
            }else if(fieldObj['primary'] === "false") {
              fieldObj['primary'] = false;
            }
          } */

        if (!fieldObj.hasOwnProperty("primary")) fieldObj["primary"] = false;
        if (!fieldObj.hasOwnProperty("autoinc")) fieldObj["autoinc"] = false;
        if (!fieldObj.hasOwnProperty("notNull")) fieldObj["notNull"] = true;
        //if(!fieldObj.hasOwnProperty("index"))         fieldObj['index'] = false;
        if (!fieldObj.hasOwnProperty("fieldname")) fieldObj["fieldname"] = "";
        if (!fieldObj.hasOwnProperty("dbType")) fieldObj["dbType"] = "TEXT";
        if (!fieldObj.hasOwnProperty("description"))
          fieldObj["description"] = "";
        if (!fieldObj.hasOwnProperty("defaultValue"))
          fieldObj["defaultValue"] = "";
      }

      if (!tableDef.hasOwnProperty("fieldsWithBlank")) {
        let _fieldsWithBlank = JSON.parse(JSON.stringify(arrFields));
        const blankObj = {
          autoinc: false,
          primary: false,
          index: false,
          dbType: "TEXT",
          fieldname: "",
          defaultValue: "",
          description: "",
          createddatetime: "",
          updateddatetime: "",
        };
        _fieldsWithBlank.unshift(blankObj);

        tableDef["fieldsWithBlank"] = _fieldsWithBlank;
      }
      if (!tableDef.hasOwnProperty("fieldswithBracket")) {
        const _fields = JSON.parse(JSON.stringify(arrFields));
        let _fieldswithBracket = [];
        _fieldswithBracket.push("[]");
        for (let j = 0; j < _fields.length; j++) {
          const _fieldname = "[" + _fields[j]["fieldname"] + "]";
          _fieldswithBracket.push(_fieldname);
        }

        tableDef["fieldswithBracket"] = _fieldswithBracket;
      }
    }
  });

  return remoteTableDefs;
}

//////////////

function mapStateToProps(state) {
  //console.log("AppData mapStateToProps >>>>>", state);
  return {
    apiParam: state.appParam.params,
    pageConfig: state.appParam.pageconfig,
    uiConfig: state.appParam.uiconfig,
    actionConfig: state.appParam.actionconfig,
  };
}
export default connect(mapStateToProps)(AppData);
