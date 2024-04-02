import React from "react";
import { connect, useDispatch } from "react-redux";
import "./SettingWindowStyle.css";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  AppBar,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Popover,
  Tooltip,
  Snackbar,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Select,
  Fab,
  List,
  ListSubheader,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  AccordionDetails,
  Accordion,
  AccordionSummary,
} from "@mui/material";

import PropertyValueEditor from "../PropertyValueEditor/PropertyValueEditor";
import CheckBoxForm from "../../forms/CheckBoxForm";
import ColorPickerForm from "../../forms/ColorPickerForm/ColorPickerForm";
import NumericStepperForm from "../../forms/NumericStepperForm/NumericStepperForm";

import {
  setSelectedUI,
  setSelectedPageData,
  setSwitchPallete,
} from "../../ServiceActions";
import {
  Close,
  Delete,
  Done,
  Edit,
  ExitToApp,
  ExpandMore,
  Help,
} from "@mui/icons-material";
import { PALLETE_SIDE } from "../../../utils/namespaces/PALLETE_SIDE";

class SettingWindow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      openProps: true,
    };

    this.handleUpdatePropertyValue = this.handleUpdatePropertyValue.bind(this);
  }

  componentDidMount() {
    //console.log("............. SettingWindow componentDidMount ............", this.props);
  }

  componentDidUpdate(prevProps, prevState) {
    //console.log("............. SettingWindow componentDidUpdate ............", this.props);
  }

  //////////////////////

  //////////////////////

  handleUpdatePropertyValue = (key, value, source) => {
    // console.log(key, "..... handleUpdatePropertyValue >>>> ", value, source);
    if (source === "uipart") {
      //this.props.dispatch(setSelectedUI({}));
      // logic add here ....
      this.props.dispatch(setSelectedUI(this.props["currentUI"]));
    } else {
      this.props.dispatch(setSelectedPageData(this.props["currentPage"]));
    }
    console.log(
      key,
      value,
      "..... handleUpdatePropertyValue >>>> ",
      this.props["currentUI"],
      this.props["currentPage"]
    );
    this.props.onPropertyValueChange(this.props["currentPage"], source);
  };

  //////////////////////

  render() {
    const {
      apiParam,
      pageConfig,
      pallete,
      pageLocale,
      currentPage,
      uiConfig,
      uiLocale,
      currentUI,
      targetEditor,
      contentEditorParent,
    } = this.props;
    const appConfig = {
      apiURL: apiParam.apiURL,
      userid: apiParam.userid,
      sessionid: apiParam.sessionid,
      projectid: apiParam.projectid,
    };
    const currentScrIndex = this.props.currentScreenIndex
      ? this.props.currentScreenIndex
      : 0;

    const type =
      currentUI && currentUI.hasOwnProperty("viewType") ? "uipart" : "page";
    //console.log(type, "............. SettingWindow ............", currentScrIndex);
    const _pagetype = currentPage["viewType"];
    const _pagelocale = filterLocale_byPageType(_pagetype, pageLocale);
    const _uitype = getUIViewtype(currentUI);
    const _uilocale = filterLocale_byUIType(_uitype, uiLocale);
    const akshay = "kumar";

    if (!this.state.show) {
      return null;
    }
    if (akshay === "" && this.props["selectedUIs"]["length"] > 1) {
      return (
        <div
          id="multiuisetting"
          className="vertical-align"
          style={{ minWidth: 368, height: "100%" }}
        >
          <MultiUISetting
            appdata={this.props["appData"]}
            pagedata={currentPage}
            currentScreenIndex={currentScrIndex}
            selectedUIparts={this.props["selectedUIs"]}
            editorContainer={targetEditor}
            editorParent={contentEditorParent}
            onSetPropertyValue={this.handleUpdatePropertyValue}
          />
        </div>
      );
    }

    return (
      <section id="settingwindow">
        <SettingPallete
          source={type}
          palleteInfo={pallete}
          appconfig={appConfig}
          appdata={this.props["appData"]}
          currentScreenIndex={currentScrIndex}
          editorContainer={targetEditor}
          pageconfig={pageConfig}
          pagelocale={_pagelocale}
          pagedata={currentPage}
          pagetype={_pagetype}
          uiconfig={uiConfig}
          uilocale={_uilocale}
          uidata={currentUI}
          uitype={_uitype}
          editorParent={contentEditorParent}
          onUpdatePropertyValue={this.handleUpdatePropertyValue}
        />
      </section>
    );
  }
}

function filterLocale_byPageType(pagetype, pagelocale) {
  let pageproperties = pagelocale.filter(function (page) {
    return page["viewType"] === pagetype;
  });
  if (pageproperties.length > 0) {
    //console.log(openedpage['viewType'], "....Page-Locale >>>", pageproperties[0]);
    return pageproperties[0]["properties"];
  }
  return null;
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

function filterLocale_byUIType(uitype, uilocale) {
  const uicategoryLocale = [uilocale[0]];
  let uiproperties = uilocale.filter(function (uipart) {
    return uipart["viewType"] === uitype;
  });
  if (uiproperties.length > 0) {
    const uipropertiesLocale = uiproperties[0]["properties"];
    let _uiLocale = mergeUILocale(uicategoryLocale, uipropertiesLocale);
    return _uiLocale;
  } else {
    return uicategoryLocale;
  }
}
function mergeUILocale(uicategory, uiproperties) {
  if (!uiproperties) return [];
  const _locale = Object.assign({}, uiproperties[0], uicategory[0]);
  return [_locale];
}

function SettingPallete(props) {
  const dispatch = useDispatch();
  const { palleteInfo } = props;
  const data = props.source === "page" ? props.pagedata : props.uidata;
  const currentScreenIndex = props.currentScreenIndex;
  if (data.viewType === "ScrollView") {
    data.Children[0].frame = data.Children[0]._frames[props.currentScreenIndex];
  }
  const config = props.source === "page" ? props.pageconfig : props.uiconfig;
  // console.log(props.uiconfig);
  const locale = props.source === "page" ? props.pagelocale : props.uilocale;

  const disableTab = props.source === "page" ? false : true;

  function getSettingWindowTitle(pageType, pagelocale) {
    // console.log({ pageType, pagelocale });
    let pageTitle;
    if (pagelocale.length > 0) {
      pageTitle = pagelocale[0]["setting"];
      return pageTitle;
    }

    return pageType + "Setting";
  }

  const [anchorDocument, setAnchorDocument] = React.useState(null);
  const openDocument = Boolean(anchorDocument);

  function handleDocumentClose() {
    setAnchorDocument(null);
  }

  const [value, setTabValue] = React.useState(0);
  function handleTabChange(event, newValue) {
    setTabValue(newValue);
  }

  const [expanded, setExpanded] = React.useState("uipanel0");
  const handleExpansion = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  function handlePropertyUpdate(property, value) {
    // console.log({ property, value });
    props.onUpdatePropertyValue(property, value, props.source);
  }

  function handleEnableUIs(value, dataset) {
    let _container = dataset["container"];
    let _uiname = dataset["name"];

    let uiChildren = [];
    //console.log(currentScreenIndex, "******", data, "...handle EnableUIs >>> ", _container, _uiname, value);
    if (_container === "toolBarTop") {
      uiChildren = data._toolBarTop[currentScreenIndex].Children;
    } else if (_container === "toolBarBottom") {
      uiChildren = data._toolBarBottom[currentScreenIndex].Children;
    } else if (_container === "toolBarLeft") {
      uiChildren = data._toolBarLeft[currentScreenIndex].Children;
    } else if (_container === "toolBarRight") {
      uiChildren = data._toolBarRight[currentScreenIndex].Children;
    } else if (_container === "pageOverlay") {
      uiChildren = data.pageOverlay.Children;
    } else {
      if (data.viewType === "BaseView") {
        uiChildren = data.Children;
      } else if (data.viewType === "ScrollView") {
        uiChildren = data.Children[0].Children;
      } else if (data.viewType.indexOf("TableViewList") > -1) {
        if (data.Children[0]["_tmpCellStyle"] === "custom") {
          uiChildren = data.Children[0].Group[0]["RecordCellDef"]["Fields"];
        }
      }
    }

    if (uiChildren) {
      uiChildren.forEach((uichild) => {
        let uipart = uichild.uiParts[currentScreenIndex];
        if (uipart["name"] === _uiname) {
          uipart["_enabledOnScreen"] = value;
        }
      });
    }

    props.onUpdatePropertyValue("_enabledOnScreen", value, "uipart");
  }

  function handlePageContainerData(containerData) {
    data["Containers"] = containerData;
  }

  function handleUpdatePageContainerState(containerData) {
    props.onUpdatePropertyValue("Containers", containerData, props.source);
  }

  function handleUIGrouping(groupData) {
    data["parent"] = groupData;

    let changeforAllScreen = false;
    let screens = props.appdata["availableScreens"];
    if (screens.length > 1) {
      const isMasterScreenSet = props.appdata["isMasterScreenSet"];
      let masterScreenIndex = 0;
      screens.forEach((element, i) => {
        if (element["embed"]) {
          masterScreenIndex = i;
        }
      });

      if (isMasterScreenSet && currentScreenIndex === masterScreenIndex) {
        changeforAllScreen = true;
      }

      if (changeforAllScreen) {
        for (let index = 0; index < screens.length; index++) {
          let editorChildrenArr = getChildrenArray(
            props.editorContainer,
            props.editorParent,
            props.pagedata,
            index
          );
          editorChildrenArr.forEach((uichild) => {
            let uipart = uichild.uiParts[index];
            if (uipart["name"] === data["name"]) {
              for (let j = 0; j < uichild.uiParts.length; j++) {
                uichild.uiParts[j]["parent"] = groupData;
              }
            }
          });
        }
      }
    }
    props.onUpdatePropertyValue("parent", groupData, "uipart");
  }

  function switchContainer() {
    if (palleteInfo === PALLETE_SIDE.EDITOR_SETTING) {
      console.log("Editor To Setting", palleteInfo);
      dispatch(setSwitchPallete("settingToEditor"));
    } else {
      console.log("Setting To Editor", palleteInfo);
      dispatch(setSwitchPallete("editorToSetting"));
    }
  }

  return (
    <Box id="settingpallete" className="setting-pallete-section">
      <div className="setting-pallete-heading">
        <h4>{getSettingWindowTitle(data.viewType, locale)}</h4>
        <div className="setting-pallete-inner-icons">
          <Tooltip className="icon" title={<h6>Switch Pallete</h6>}>
            <ExitToApp onClick={switchContainer} />
          </Tooltip>
        </div>
        <Popover
          id="document-popover"
          open={openDocument}
          anchorEl={anchorDocument}
          onClose={handleDocumentClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Paper
            id="pagedocs"
            className="setting-pallete-context"
            elevation={0}
          >
            <table className="tg">
              <thead>
                <tr>
                  <th width="120px">Key</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {data.Document.map((docs, index) => (
                  <tr key={index}>
                    <td> {docs.key} </td>
                    <td> {docs.value} </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        </Popover>
      </div>
      <div className="setting-pallete-info-bar">
        {value === 0 && (
          <TabContainer>
            <div id="pageproperties">
              {/* {console.log(props.uidata)} */}
              {props.source === "page" && (
                <PropertyValueEditor
                  show={true}
                  editor={props.source}
                  data={data}
                  viewType={data.viewType}
                  config={config}
                  locale={locale}
                  screenIndex={currentScreenIndex}
                  onPropertyEdit={handlePropertyUpdate}
                />
              )}
              {props.source === "uipart" && (
                <PropertyValueEditor
                  show={true}
                  editor={props.source}
                  data={props.uidata}
                  viewType={props.uitype}
                  config={config}
                  locale={locale}
                  screenIndex={currentScreenIndex}
                  onPropertyEdit={handlePropertyUpdate}
                />
              )}
            </div>
          </TabContainer>
        )}
        {value === 1 && props.source === "page" && (
          <TabContainer style={{ height: `calc(100% - 90px)` }}>
            <Paper id="pageuis" className="setting-pallete-context">
              {getUIEnabledState(data, currentScreenIndex).map(
                (item, index) => (
                  <Accordion
                    style={{ width: "100%", margin: 0 }}
                    key={"uipanel" + index}
                    expanded={expanded === "uipanel" + index}
                    onChange={handleExpansion("uipanel" + index)}
                  >
                    <AccordionSummary
                      id="panela-header"
                      aria-controls="panela-content"
                      expandIcon={<ExpandMore />}
                    >
                      <div className="setting-badge">
                        <h6 className="action-editor-chip">
                          {item.data.length}
                        </h6>
                      </div>
                      <div className="setting-pallete-badge setting-window-badge">
                        <h4>{item.title}</h4>
                      </div>
                    </AccordionSummary>
                    <AccordionDetails
                      style={{ height: "27.5rem" }}
                      className="setting-window-accord-details"
                    >
                      {item.data.map((uis, _index) => (
                        <div key={_index} className="vertical-align">
                          <div
                            className="horizontal-align"
                            style={{ maxHeight: 32 }}
                          >
                            <CheckBoxForm
                              value={uis.enabled}
                              label={uis.name + " (" + uis.type + ")"}
                              source="enableui"
                              dependentActions={uis}
                              onValueChange={handleEnableUIs}
                            />
                            <h6>{uis.name + " (" + uis.type + ")"}</h6>
                          </div>
                          {uis.children.length > 0 && (
                            <table
                              className="tg"
                              style={{ width: 280, tableLayout: "fixed" }}
                            >
                              <thead>
                                <tr>
                                  <th width="16px">#</th>
                                  <th>UI Name (Type)</th>
                                  <th width="60px">Enabled</th>
                                </tr>
                              </thead>
                              <tbody>
                                {uis.children.map((vobj, index) => (
                                  <tr key={index}>
                                    <td> {index + 1} </td>
                                    <td
                                      style={{
                                        textAlign: "start",
                                        wordBreak: "break-all",
                                      }}
                                    >
                                      {vobj.name + " (" + vobj.type + ")"}
                                    </td>
                                    <td> {vobj.enabled.toString()} </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                )
              )}
            </Paper>
          </TabContainer>
        )}
        {value === 2 && (
          <TabContainer>
            <Paper id="pagecontainers" className="setting-pallete-context">
              {props.source === "page" && (
                <PageGroupSetting
                  pagedata={data}
                  data={data.Containers}
                  onUpdateContainers={handlePageContainerData}
                  onUpdatePageContainerState={handleUpdatePageContainerState}
                />
              )}
              {props.source === "uipart" && (
                <UIGroupSetting
                  pagedata={props.pagedata}
                  data={data}
                  onUpdateUIGrouping={handleUIGrouping}
                />
              )}
            </Paper>
          </TabContainer>
        )}
      </div>
    </Box>
  );
}

function PageGroupSetting(props) {
  const [containerData, setPageContainerData] = React.useState(props.data);
  React.useEffect(() => {
    setPageContainerData(props.data);
  }, [props.data]);
  const [checked, setChecked] = React.useState(
    getPageContainerState(containerData)
  );
  //console.log(props.pagedata['Title'], "containerData >>>>", props.data, containerData);

  const [showHelp, setShowHelp] = React.useState(false);
  function handleHelpText(event) {
    setShowHelp(!showHelp);
  }

  const [isPageContainerTitle, showPageContainerTitle] = React.useState(false);
  const [containerItemTitle, setPageContainerTitle] = React.useState("");
  const [customTitleError, setContainerTitleError] = React.useState("");
  const [pageTitle, setpageTitle] = React.useState("");
  React.useEffect(() => {
    //console.log(props.pagedata['Title'], "...pageTitle >>>", pageTitle);
    if (pageTitle !== props.pagedata["Title"]) {
      showPageContainerTitle(false);
      setPageContainerTitle("");
    }
  }, [pageTitle, props.pagedata]);

  function handleAddPageContainerObject() {
    setpageTitle(props.pagedata["Title"]);
    showPageContainerTitle(true);
  }

  function handlePageContainerTitle(event) {
    const val = event.target.value;

    const isValid = validatePageContainerTitle(val);
    if (isValid) {
      setPageContainerTitle(val);
      setContainerTitleError("");
    }
  }
  function validatePageContainerTitle(title) {
    if (title.length > 0) {
      const allowedChars = /\w/g;
      let allowedTitle = title.match(allowedChars);
      if (!allowedTitle) {
        setContainerTitleError("Only alphabets, numbers & underscore allowed.");
        return false;
      }
      if (allowedTitle && title.length !== allowedTitle.length) {
        setContainerTitleError("Only alphabets, numbers & underscore allowed.");
        return false;
      }
    }
    return true;
  }

  function handleSetPageContainerObject() {
    if (containerItemTitle.length === 0) {
      setContainerTitleError("Title is required");
      return;
    }
    let containerItems = JSON.parse(JSON.stringify(containerData));
    if (containerItems && containerItems.length > 0) {
      for (let i = 0; i < containerItems.length; i++) {
        const itemObj = containerItems[i];
        if (itemObj["title"] === containerItemTitle) {
          setContainerTitleError("Title already exist");
          return;
        }
      }
    }

    if (!editTitle) {
      const lastIndex = containerItems.length - 1;
      const lastObjName = containerItems[lastIndex]["name"];
      const lastObjIndex = parseInt(lastObjName.replace("container", ""));
      const itemName = "container" + (lastObjIndex + 1);
      const containerItem = {
        name: itemName,
        title: containerItemTitle,
        selected: true,
      };
      containerItems.push(containerItem);

      let checkedArr = [];
      for (let i = 0; i < containerItems.length; i++) {
        checkedArr.push(containerItems[i]["selected"]);
      }
      setChecked(checkedArr);
    } else {
      //console.log(editItemIndex, "..editTitle..", containerData[editItemIndex]['title'], "*****", containerItemTitle);
      if (containerData[editItemIndex]) {
        const editItem = {
          name: containerData[editItemIndex]["name"],
          title: containerItemTitle,
          selected: containerData[editItemIndex]["selected"],
        };
        containerItems.splice(editItemIndex, 1, editItem);
      }

      setEditItemIndex(-1);
      setEditTitle(false);
    }
    setPageContainerData(containerItems);
    props.onUpdateContainers(containerItems);

    setContainerTitleError("");
    showPageContainerTitle(false);
    setPageContainerTitle("");
  }

  function handleCancelPageContainerObject() {
    showPageContainerTitle(false);
    setPageContainerTitle("");
    setContainerTitleError("");
    if (editTitle) {
      setEditItemIndex(-1);
      setEditTitle(false);
    }
  }

  function handleCloseContainerTitleError() {
    setContainerTitleError("");
  }

  const handleToggle = (value, index) => () => {
    const newChecked = [...checked];
    let currentval = newChecked[index];
    newChecked[index] = !currentval;
    containerData[index]["selected"] = !currentval;

    console.log(index, value, "handleToggle>>>", newChecked);
    setChecked(newChecked);
    props.onUpdatePageContainerState(containerData);
  };

  const [editItemIndex, setEditItemIndex] = React.useState(-1);
  const [editTitle, setEditTitle] = React.useState(false);
  function handleEditContainerItem(event) {
    const _dataset = event.currentTarget.dataset;

    const _editIndex = parseInt(_dataset["index"]);
    setEditItemIndex(_editIndex);

    const _editTitle = containerData[_editIndex]["title"];
    setPageContainerTitle(_editTitle);

    showPageContainerTitle(true);
    setEditTitle(true);
  }

  function handleDeleteContainerItem(event) {
    const _dataset = event.currentTarget.dataset;
    //console.log(containerData, "... Delete ContainerItem ...", _dataset);
    const _delIndex = parseInt(_dataset["index"]);

    let containerItems = JSON.parse(JSON.stringify(containerData));
    if (containerItems && containerItems.length > 0) {
      for (let i = 0; i < containerItems.length; i++) {
        let itemObj = containerItems[i];
        if (i === _delIndex && itemObj["name"] === _dataset["name"]) {
          containerItems.splice(i, 1);
        }
      }
    }
    let checkedArr = [];
    for (let j = 0; j < containerItems.length; j++) {
      checkedArr.push(containerItems[j]["selected"]);
    }
    setChecked(checkedArr);

    setPageContainerData(containerItems);
    props.onUpdateContainers(containerItems);
  }

  return (
    <div className="page-grup-setting">
      <FormGroup className="page-grup-frm">
        <List
          component="nav"
          dense={true}
          className="page-grup-frm-list"
          subheader={
            <ListSubheader
              component="div"
              className="page-grup-frm-list-header"
            >
              <h4>Group Items</h4>

              <IconButton
                edge="end"
                color="inherit"
                className="page-grup-icon"
                onClick={handleHelpText}
              >
                <Help />
              </IconButton>
            </ListSubheader>
          }
        >
          {containerData.map((item, index) => (
            <ListItem
              className="container-lst-item"
              key={index}
              button
              dense
              style={{ height: 32 }}
            >
              <ListItemIcon style={{ minWidth: 30 }}>
                <Checkbox
                  edge="start"
                  disableRipple
                  tabIndex={-1}
                  color="default"
                  style={{ padding: 4 }}
                  checked={item["selected"]}
                  onChange={handleToggle(item["selected"], index)}
                />
              </ListItemIcon>
              <ListItemText
                primary={<h6>{item["title"]}</h6>}
                className="page-grup-title-txt"
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  style={{ padding: 4 }}
                  aria-label="Edit"
                  data-index={index}
                  data-name={item["name"]}
                  onClick={handleEditContainerItem}
                >
                  <Edit />
                </IconButton>
                {index > 0 && (
                  <IconButton
                    edge="end"
                    style={{ padding: 4, marginLeft: 6 }}
                    data-index={index}
                    data-name={item["name"]}
                    onClick={handleDeleteContainerItem}
                  >
                    <Delete />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        {showHelp && (
          <h6 variant="caption" className="page-grup-help-txt">
            Un-check any item will hide ui-part(s) within that group
          </h6>
        )}
        {/* <IconButton
          edge="end"
          color="inherit"
          className="page-grup-icon"
          onClick={handleHelpText}
        >
          <Help />
        </IconButton> */}
        {!isPageContainerTitle && (
          <button
            className="page-grup-add-btn"
            onClick={handleAddPageContainerObject}
          >
            Add Page Group Item
          </button>
        )}
        {isPageContainerTitle && (
          <div className="page-grup-custom-section">
            <Typography
              variant="subtitle1"
              style={{ color: "white", fontWeight: "bold" }}
            >
              Title*:
            </Typography>
            <input
              name="custom-title"
              autoFocus
              type="text"
              required
              style={{ width: "100%", height: 24 }}
              value={containerItemTitle}
              onChange={handlePageContainerTitle}
            />
            <Fab
              color="default"
              size="small"
              aria-label="Delete Container"
              className="page-grup-fab-btn"
            >
              <Done onClick={handleSetPageContainerObject} />
            </Fab>
            <Fab
              color="default"
              size="small"
              aria-label="Delete Container"
              className="page-grup-fab-btn"
            >
              <Close onClick={handleCancelPageContainerObject} />
            </Fab>
          </div>
        )}
        {customTitleError.length > 0 && (
          <Snackbar
            open={true}
            onClose={handleCloseContainerTitleError}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            message={customTitleError}
            action={
              <React.Fragment>
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={handleCloseContainerTitleError}
                >
                  <Close fontSize="small" />
                </IconButton>
              </React.Fragment>
            }
          />
        )}
      </FormGroup>
    </div>
  );
}
function getPageContainerState(containerData) {
  let state = [];
  for (let i = 0; i < containerData.length; i++) {
    const element = containerData[i];
    state.push(element["selected"]);
  }
  return state;
}

function UIGroupSetting(props) {
  const pageConatiners = props.pagedata["Containers"];
  const [containerData, setPageContainerData] = React.useState(pageConatiners);
  React.useEffect(() => {
    setPageContainerData(pageConatiners);
  }, [pageConatiners]);

  const uiParent = props.data["parent"];
  const _uiParent = ["container1"];
  const [checked, setChecked] = React.useState(_uiParent);

  const handleChangeValue = (value) => () => {
    const _checked = uiParent.split(",");
    const newChecked = [..._checked];
    const currentIndex = _checked.indexOf(value);
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    if (newChecked.length === 0) {
      newChecked.push(value);
    }
    const sortchecked = newChecked.sort(function (a, b) {
      return (
        parseInt(a.replace("container", "")) -
        parseInt(b.replace("container", ""))
      );
    });
    console.log(checked, "handleToggle>>>", newChecked, sortchecked);
    setChecked(sortchecked);

    props.onUpdateUIGrouping(sortchecked.join());
  };

  const [showHelp, setShowHelp] = React.useState(false);
  function handleHelpText(event) {
    setShowHelp(!showHelp);
  }

  return (
    <Box className="group-setting-section">
      <h4 className="group-setting-header">Set Group :</h4>
      {showHelp && (
        <Typography variant="caption" className="group-setting-help-txt">
          One group need to be remain selected
        </Typography>
      )}
      <IconButton
        edge="end"
        color="inherit"
        className="group-setting-icon"
        onClick={handleHelpText}
      >
        <Help />
      </IconButton>
      <FormGroup className="group-setting-frm-grp">
        {uiParent &&
          containerData.map((option, id) => (
            <FormControlLabel
              key={id}
              className="group-setting-item"
              label={<h6>{option["title"]}</h6>}
              control={
                <Checkbox
                  disableRipple
                  color="default"
                  checked={uiParent.split(",").indexOf(option["name"]) !== -1}
                  onChange={handleChangeValue(option["name"])}
                />
              }
            />
          ))}
      </FormGroup>
    </Box>
  );
}

function MultiUISetting(props) {
  const selectedUIparts = props["selectedUIparts"];
  const currentScreenIndex = props["currentScreenIndex"];

  const [tabvalue, setTabValue] = React.useState(0);
  function handleTabChange(event, newValue) {
    setTabValue(newValue);
  }

  const predefinedFonts = ["Amazon Ember", "system"];
  const [fontname, setFontName] = React.useState("system");
  const [textalign, setTextAlign] = React.useState("");
  const [verticalalign, setVerticalAlign] = React.useState("");

  function handleChangePropertyValue(event, propkey) {
    let updatedValue = event.currentTarget.value;

    const elemType = event.currentTarget["type"];
    if (elemType && elemType === "checkbox") {
      updatedValue = Boolean(event.currentTarget.checked);
    } else if (elemType && elemType === "radio") {
      const elemName = event.currentTarget["name"];
      if (elemName === "textalign") {
        setTextAlign(updatedValue);
      } else if (elemName === "verticalalign") {
        setVerticalAlign(updatedValue);
      }
    } else if (elemType && elemType.indexOf("select") > -1) {
      setFontName(updatedValue);
    }

    updateSelectedUIProperties(propkey, updatedValue);
  }
  function handleChangeColorValue(newvalue, propkey) {
    updateSelectedUIProperties(propkey, newvalue);
  }
  function handleChangeNumValue(newvalue, propkey) {
    updateSelectedUIProperties(propkey, newvalue);
  }

  function updateSelectedUIProperties(propkey, propVal) {
    let editorChildrenArr = [];
    let changeforAllScreen = false;
    let screens = props.appdata["availableScreens"];
    if (screens.length > 1) {
      const isMasterScreenSet = props.appdata["isMasterScreenSet"];
      let masterScreenIndex = 0;
      screens.forEach((element, i) => {
        if (element["embed"]) {
          masterScreenIndex = i;
        }
      });

      if (isMasterScreenSet && currentScreenIndex === masterScreenIndex) {
        changeforAllScreen = true;
      }
      editorChildrenArr = getChildrenArray(
        props.editorContainer,
        props.editorParent,
        props.pagedata,
        currentScreenIndex
      );
    }

    selectedUIparts.forEach((element) => {
      const uipart = element["UI"];
      let slaveuipartArr;
      let slaveuipart;
      if (changeforAllScreen && editorChildrenArr.length > 0) {
        slaveuipartArr = getSlaveUIpart(editorChildrenArr, uipart, 1);
        slaveuipart = slaveuipartArr[1];
      }

      if (propkey.indexOf("-") > -1) {
        let propdic = propkey.split("-")[0];
        let property = propkey.split("-")[1];
        if (propdic === "font") {
          if (uipart.hasOwnProperty("normalFont")) {
            uipart["normalFont"][property] = propVal;
            if (slaveuipart) slaveuipart["normalFont"][property] = propVal;
          } else if (uipart.hasOwnProperty("font")) {
            uipart["font"][property] = propVal;
            if (slaveuipart) slaveuipart["font"][property] = propVal;
          }
        } else {
          uipart[propdic][property] = propVal;
          if (slaveuipart) slaveuipart[propdic][property] = propVal;
        }
      } else {
        if (uipart.hasOwnProperty(propkey)) {
          if (propkey.indexOf("Color") > -1) {
            uipart[propkey] = setColorDic(propVal);
            if (slaveuipart) slaveuipart[propkey] = setColorDic(propVal);
          } else {
            uipart[propkey] = propVal;
            if (slaveuipart) slaveuipart[propkey] = propVal;
          }
        }
      }

      //console.log(props.editorContainer, editorChildrenArr, ".. handleChangePropertyValue >>", slaveuipart);
      if (slaveuipart) {
        updateSlaveScreenDef(
          props.editorContainer,
          props.pagedata,
          1,
          props.editorParent,
          slaveuipartArr,
          slaveuipart
        );
      }
    });

    //console.log(props, selectedUIparts, ".. handleChangePropertyValue >>", propkey, propVal);
    props.onSetPropertyValue(propkey, propVal, "uipart");
  }

  function updateSlaveScreenDef(
    targetEditor,
    currentPage,
    scrIndex,
    editorParent,
    updatedUIDef,
    dataObj
  ) {
    if (targetEditor) {
      if (targetEditor === "tablecell") {
        const _pageObj = currentPage;
        if (
          _pageObj.Children[0].Group[0]["RecordCellDef"]["CellStyle"] ===
          "custom"
        ) {
          _pageObj.Children[0].Group[0]["rowarray"][0]["Fields"] =
            _pageObj.Children[0].Group[0]["RecordCellDef"]["Fields"];
        }
      } else if (targetEditor.indexOf("Toolbar") > -1) {
        let barType;
        if (targetEditor === "topToolbar") barType = "_toolBarTop";
        else if (targetEditor === "bottomToolbar") barType = "_toolBarBottom";
        else if (targetEditor === "leftToolbar") barType = "_toolBarLeft";
        else if (targetEditor === "rightToolbar") barType = "_toolBarRight";

        const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
        //const toolbarChildren = JSON.parse(JSON.stringify(sourceChildrenArr));

        const i = scrIndex;
        let _slaveScreen_toolbarChildren = currentPage[barType][i]["Children"];
        for (
          let index = 0;
          index < _slaveScreen_toolbarChildren.length;
          index++
        ) {
          const uidef = _slaveScreen_toolbarChildren[index];
          let uidefparts = uidef["uiParts"];
          //if(uidefparts && (uidefparts[i]['name'] === dataObj['name'])) {
          if (
            uidefparts[i]["name"] === dataObj["name"] &&
            uidefparts[i]["viewType"] === dataObj["viewType"]
          ) {
            //console.log(_updatedUIDef, index, uidef, "........ _slaveScreen_toolbarChildren >>>>", uidefparts, _slaveScreen_toolbarChildren);
            uidef["uiParts"] = _updatedUIDef;
            if (uidef["uiParts"][i] && uidef["uiParts"][i]["frame"]) {
              uidef["uiParts"][i]["frame"] = uidefparts[i]["frame"];
            }
            break;
          }
        }
        console.log(
          currentPage,
          barType,
          "........ updateAllScreensData >>>>",
          _updatedUIDef,
          _slaveScreen_toolbarChildren
        );
      } else if (targetEditor === "TileList") {
        const sourceUI = editorParent["ui"];
        let tilelistUI;
        let _pageUIs = getAllChildrenOnPage(currentPage, currentScreenIndex);
        _pageUIs.forEach((uipart) => {
          if (
            uipart["viewType"] === "TileList" &&
            uipart["uiParts"][0]["name"] === sourceUI["name"]
          ) {
            tilelistUI = uipart;
          }
        });

        const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
        if (_updatedUIDef && _updatedUIDef.length > 0) {
          const k = scrIndex;
          let _slaveScreen_tilelistChildren =
            tilelistUI["uiParts"][k]["dataarray"][0]["Fields"];
          for (
            let index = 0;
            index < _slaveScreen_tilelistChildren.length;
            index++
          ) {
            const uidef = _slaveScreen_tilelistChildren[index];
            let uidefparts = uidef["uiParts"];

            //if(uidefparts && (uidefparts[k]['name'] === dataObj['name'])) {
            if (
              uidefparts[k]["name"] === dataObj["name"] &&
              uidefparts[k]["viewType"] === dataObj["viewType"]
            ) {
              uidef["uiParts"] = _updatedUIDef;
              break;
            }
          }
        }

        if (tilelistUI["parent"] === "Dialog") {
          const _dialogUI = currentPage["pageOverlay"]["Children"][0];
          const l = scrIndex;
          let _slaveScreen_dialogChildren =
            _dialogUI["uiParts"][l]["dataarray"][0]["Fields"];
          for (
            let index = 0;
            index < _slaveScreen_dialogChildren.length;
            index++
          ) {
            const uidef = _slaveScreen_dialogChildren[index];
            let uidefparts = uidef["uiParts"];
            if (uidefparts[l]["name"] === tilelistUI["uiParts"][l]["name"]) {
              //console.log(propsData, dataObj, tilelistUI, "....TileList.... in Dialog >>>>", l, uidef);
              uidef["uiParts"] = JSON.parse(
                JSON.stringify(tilelistUI["uiParts"])
              );
              break;
            }
          }
        } else if (tilelistUI["parent"] === "topToolbar") {
          const t = scrIndex;
          let _slaveScreen_topBarChildren =
            currentPage["_toolBarTop"][t]["Children"];
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
      } else if (targetEditor === "Dialog") {
        let dialogUI;
        const overlayChildren = currentPage["pageOverlay"]["Children"];
        if (overlayChildren.length > 1) {
          const sourceUI = editorParent["ui"];
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

        const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
        let isfound = false;

        const l = scrIndex;
        let _slaveScreen_dialogChildren =
          dialogUI["uiParts"][l]["dataarray"][0]["Fields"];
        for (
          let index = 0;
          index < _slaveScreen_dialogChildren.length;
          index++
        ) {
          const uidef = _slaveScreen_dialogChildren[index];
          let uidefparts = uidef["uiParts"];
          //if(uidefparts && (uidefparts[l]['name'] === dataObj['name'])) {
          if (
            uidefparts[l]["name"] === dataObj["name"] &&
            uidefparts[l]["viewType"] === dataObj["viewType"]
          ) {
            if (uidefparts[l]["name"] !== dataObj["name"]) {
              isfound = false;
              delete uidef["selected"];
            } else {
              uidef["uiParts"] = _updatedUIDef;
              isfound = true;
              if (uidef["uiParts"][l] && uidef["uiParts"][l]["frame"]) {
                uidef["uiParts"][l]["frame"] = uidefparts[l]["frame"];
              }
              break;
            }
          }
        }

        if (!isfound) {
          let missingChild = {
            _uid: "",
            viewType: dataObj["viewType"],
            uiParts: _updatedUIDef,
            selected: true,
          };
          _slaveScreen_dialogChildren.push(missingChild);
        }
      }
      //console.log(currentPage, "......uipart.. updateAllScreensData >>>>", dataObj, updatedUIDef);
    }
  }

  return (
    <Box id="multiuipallete" className="multi-setting-section">
      <div className="multi-setting-header">
        <strong className="multi-setting-heading"></strong>
      </div>
      <div className="multi-setting-msg-container">
        <Typography variant="subtitle2" className="multi-setting-msg">
          For selected UI-parts, below property - values will be set as per
          support.
        </Typography>
      </div>
      <div className="multi-setting-box">
        <AppBar
          position="static"
          color="default"
          className="multi-setting-appbar"
        >
          <Tabs
            value={tabvalue}
            onChange={handleTabChange}
            indicatorColor="primary"
          >
            <Tab wrapped label="Properties" className="multi-setting-tabs" />
            <Tab wrapped label="Selected UIs" className="multi-setting-tabs" />
          </Tabs>
        </AppBar>
        {tabvalue === 0 && (
          <TabContainer1>
            <Paper id="multiuiproperties" className="multi-setting-paper">
              <fieldset className="multi-setting-prop-set">
                <FormGroup className="multi-setting-prop-frm">
                  <Typography
                    variant="body2"
                    className="multi-setting-prop-key"
                  >
                    Hidden :
                  </Typography>
                  <Checkbox
                    disableRipple
                    color="default"
                    data-key="hidden"
                    onChange={(e) => handleChangePropertyValue(e, "hidden")}
                  />
                </FormGroup>
              </fieldset>
              <fieldset className="multi-setting-prop-set">
                <legend>UI Style</legend>
                <FormGroup className="multi-setting-prop-frm">
                  <Typography
                    variant="body2"
                    className="multi-setting-prop-key"
                  >
                    Background Color :
                  </Typography>
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <ColorPickerForm
                      propkey="backgroundColor"
                      value={{
                        alpha: 1,
                        colorName: "",
                        red: 1,
                        blue: 1,
                        green: 1,
                      }}
                      onValueChange={handleChangeColorValue}
                    />
                  </div>
                </FormGroup>
                <FormGroup className="multi-setting-prop-frm">
                  <Typography
                    variant="body2"
                    className="multi-setting-prop-key"
                  >
                    Transparency :
                  </Typography>
                  <NumericStepperForm
                    propkey="backgroundColor-alpha"
                    path="backgroundColor-alpha"
                    source="uipart"
                    min="0.0"
                    max="1.0"
                    step="0.1"
                    value="1.0"
                    onValueChange={handleChangeNumValue}
                  />
                </FormGroup>
                <FormGroup className="multi-setting-prop-frm">
                  <Typography
                    variant="body2"
                    className="multi-setting-prop-key"
                  >
                    Border Width :
                  </Typography>
                  <NumericStepperForm
                    propkey="borderWeight"
                    path="borderWeight"
                    source="uipart"
                    min="0"
                    max="10"
                    step="1"
                    value="0"
                    onValueChange={handleChangeNumValue}
                  />
                </FormGroup>
                <FormGroup className="multi-setting-prop-frm">
                  <Typography
                    variant="body2"
                    className="multi-setting-prop-key"
                  >
                    Border Radius :
                  </Typography>
                  <NumericStepperForm
                    propkey="cornerRadius"
                    path="cornerRadius"
                    source="uipart"
                    min="0"
                    max="25"
                    step="1"
                    value="0"
                    onValueChange={handleChangeNumValue}
                  />
                </FormGroup>
                <FormGroup className="multi-setting-prop-frm">
                  <Typography
                    variant="body2"
                    className="multi-setting-prop-key"
                  >
                    Border Color :
                  </Typography>
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <ColorPickerForm
                      propkey="borderColor"
                      value={{
                        alpha: 1,
                        colorName: "",
                        red: 1,
                        blue: 1,
                        green: 1,
                      }}
                      onValueChange={handleChangeColorValue}
                    />
                  </div>
                </FormGroup>
                <FormGroup className="multi-setting-prop-frm">
                  <Typography
                    variant="body2"
                    className="multi-setting-prop-key"
                  >
                    Border Transparency :
                  </Typography>
                  <NumericStepperForm
                    propkey="borderColor-alpha"
                    path="borderColor-alpha"
                    source="uipart"
                    min="0.0"
                    max="1.0"
                    step="0.1"
                    value="1.0"
                    onValueChange={handleChangeNumValue}
                  />
                </FormGroup>
              </fieldset>
              <fieldset className="multi-setting-prop-set">
                <legend>Text Font</legend>
                <FormGroup className="multi-setting-prop-frm">
                  <Typography
                    variant="body2"
                    className="multi-setting-prop-key"
                  >
                    Font Name :
                  </Typography>
                  <Select
                    native
                    className="group-setting-slect"
                    value={fontname}
                    onChange={(e) =>
                      handleChangePropertyValue(e, "font-fontName")
                    }
                  >
                    {predefinedFonts.map((option, id) => (
                      <option key={id} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                <FormGroup className="multi-setting-prop-frm">
                  <Typography
                    variant="body2"
                    className="multi-setting-prop-key"
                  >
                    Font Size :
                  </Typography>
                  <NumericStepperForm
                    propkey="font-fontSize"
                    path="font-fontsize"
                    source="uipart"
                    min="6"
                    max="50"
                    step="1"
                    value="14"
                    onValueChange={handleChangeNumValue}
                  />
                </FormGroup>
                <FormGroup className="multi-setting-prop-frm">
                  <Typography
                    variant="body2"
                    className="multi-setting-prop-key"
                  >
                    Bold :
                  </Typography>
                  <Checkbox
                    disableRipple
                    color="default"
                    data-key="fontWeight"
                    onChange={(e) =>
                      handleChangePropertyValue(e, "font-fontWeight")
                    }
                  />
                </FormGroup>
                <FormGroup className="multi-setting-prop-frm">
                  <Typography
                    variant="body2"
                    className="multi-setting-prop-key"
                  >
                    Italic :
                  </Typography>
                  <Checkbox
                    disableRipple
                    color="default"
                    data-key="fontStyle"
                    onChange={(e) =>
                      handleChangePropertyValue(e, "font-fontStyle")
                    }
                  />
                </FormGroup>
                <FormGroup className="multi-setting-prop-frm">
                  <Typography
                    variant="body2"
                    className="multi-setting-prop-key"
                  >
                    Underline :
                  </Typography>
                  <Checkbox
                    disableRipple
                    color="default"
                    data-key="underline"
                    onChange={(e) => handleChangePropertyValue(e, "underline")}
                  />
                </FormGroup>
                <FormGroup className="multi-setting-prop-frm">
                  <Typography
                    variant="body2"
                    className="multi-setting-prop-key"
                  >
                    Text Color :
                  </Typography>
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <ColorPickerForm
                      propkey="font-textColor"
                      value={{
                        alpha: 1,
                        colorName: "",
                        red: 1,
                        blue: 1,
                        green: 1,
                      }}
                      onValueChange={handleChangeColorValue}
                    />
                  </div>
                </FormGroup>
                <FormGroup
                  className="multi-setting-prop-frm"
                  style={{ height: 100 }}
                >
                  <Typography
                    variant="body2"
                    className="multi-setting-prop-key"
                  >
                    Text Alignment :
                  </Typography>
                  <RadioGroup
                    className="multi-setting-rb-grp"
                    aria-label="textalign"
                    name="textalign"
                    value={textalign}
                    data-key="textAlignment"
                    onChange={(e) =>
                      handleChangePropertyValue(e, "font-textAlignment")
                    }
                  >
                    <FormControlLabel
                      className="group-setting-rb-label"
                      value="left"
                      control={<Radio disableRipple color="default" />}
                      label="left"
                    />
                    <FormControlLabel
                      className="group-setting-rb-label"
                      value="center"
                      control={<Radio disableRipple color="default" />}
                      label="center"
                    />
                    <FormControlLabel
                      className="group-setting-rb-label"
                      value="right"
                      control={<Radio disableRipple color="default" />}
                      label="right"
                    />
                  </RadioGroup>
                </FormGroup>
                <FormGroup
                  className="multi-setting-prop-frm"
                  style={{ height: 100 }}
                >
                  <Typography
                    variant="body2"
                    className="multi-setting-prop-key"
                  >
                    Vertical Alignment :
                  </Typography>
                  <RadioGroup
                    className="multi-setting-rb-grp"
                    aria-label="verticalalign"
                    name="verticalalign"
                    value={verticalalign}
                    data-key="verticalAlignment"
                    onChange={(e) =>
                      handleChangePropertyValue(e, "verticalAlignment")
                    }
                  >
                    <FormControlLabel
                      className="group-setting-rb-label"
                      value="top"
                      control={<Radio disableRipple color="default" />}
                      label="top"
                    />
                    <FormControlLabel
                      className="group-setting-rb-label"
                      value="middle"
                      control={<Radio disableRipple color="default" />}
                      label="middle"
                    />
                    <FormControlLabel
                      className="group-setting-rb-label"
                      value="bottom"
                      control={<Radio disableRipple color="default" />}
                      label="bottom"
                    />
                  </RadioGroup>
                </FormGroup>
              </fieldset>
            </Paper>
          </TabContainer1>
        )}
        {tabvalue === 1 && (
          <TabContainer1>
            <Paper id="selecteduis" className="multi-setting-paper">
              {selectedUIparts.length > 0 && (
                <table
                  className="tg"
                  style={{ width: 320, tableLayout: "fixed", marginTop: 8 }}
                >
                  <thead>
                    <tr>
                      <th width="30px"></th>
                      <th>Name</th>
                      <th width="80px">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSelecteUIData(selectedUIparts, currentScreenIndex).map(
                      (vobj, index) => (
                        <tr key={index}>
                          <td> {index + 1} </td>
                          <td
                            style={{
                              textAlign: "start",
                              wordBreak: "break-all",
                            }}
                          >
                            {vobj.name}
                          </td>
                          <td style={{ textAlign: "start" }}> {vobj.type} </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </Paper>
          </TabContainer1>
        )}
      </div>
      <div className="multi-setting-btn-box">
        <button className="multi-setting-btn">Set Setting</button>
      </div>
    </Box>
  );
}

////////////////////// customized componenets //////////////////////

function TabContainer(props) {
  return (
    <Typography
      component="div"
      className="setting-tab-content"
      // style={{
      //   backgroundColor: "rgba(244, 244, 244, 1)",
      //   overflowX: "scroll",
      //   height: "59rem",
      // }}
    >
      {props.children}
    </Typography>
  );
}
TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};
function TabContainer1(props) {
  return (
    <Typography
      component="div"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(244, 244, 244, 1)",
      }}
    >
      {props.children}
    </Typography>
  );
}
TabContainer1.propTypes = {
  children: PropTypes.node.isRequired,
};

////////////////////// helper functions //////////////////////

function getUIEnabledState(_pagedata, currentScrIndex) {
  if (currentScrIndex === undefined) currentScrIndex = 0;

  let _UIs = [];

  let _uiChilds = [];
  let pageChildren = [];
  if (_pagedata.viewType === "BaseView") {
    pageChildren = _pagedata.Children;
  } else if (_pagedata.viewType === "ScrollView") {
    pageChildren = _pagedata.Children[0].Children;
  } else if (_pagedata.viewType.indexOf("TableViewList") > -1) {
    if (_pagedata.Children[0]["_tmpCellStyle"] === "custom") {
      pageChildren = _pagedata.Children[0].Group[0]["RecordCellDef"]["Fields"];
    }
  }

  pageChildren.forEach((child) => {
    let pageuiObj = child.uiParts[currentScrIndex];
    let pageUIs = {
      container: "page",
      name: pageuiObj.name,
      type: getUIViewtype(pageuiObj),
      enabled: pageuiObj._enabledOnScreen,
      children: [],
    };
    if (pageuiObj.viewType === "TileList") {
      let tileItems = pageUIs["children"];
      let tileChildren = pageuiObj.dataarray[0]["Fields"];
      tileChildren.forEach((fieldui) => {
        let tileObj = fieldui.uiParts[currentScrIndex];
        let tileUIs = {
          container: "TileList",
          name: tileObj.name,
          type: getUIViewtype(tileObj),
          enabled: tileObj._enabledOnScreen,
          children: [],
        };
        tileItems.push(tileUIs);
      });
    }
    if (pageuiObj.viewType === "ExpansionPanel") {
      let panelItems = pageUIs["children"];
      for (let index = 0; index < pageuiObj.panelItems.length; index++) {
        let panelChildren = pageuiObj.panelItems[index]["Fields"];
        panelChildren.forEach((fieldui) => {
          let uiObj = fieldui.uiParts[currentScrIndex];
          let panelUIs = {
            container: "ExpansionPanel",
            name: uiObj.name,
            type: getUIViewtype(uiObj),
            enabled: uiObj._enabledOnScreen,
            children: [],
          };
          panelItems.push(panelUIs);
        });
      }
    }
    if (pageuiObj.viewType === "SwipeableView") {
      let swipeItems = pageUIs["children"];
      for (let index = 0; index < pageuiObj.swipeableItems.length; index++) {
        let panelChildren = pageuiObj.swipeableItems[index]["Fields"];
        panelChildren.forEach((fieldui) => {
          let uiObj = fieldui.uiParts[currentScrIndex];
          let panelUIs = {
            container: "SwipeableView",
            name: uiObj.name,
            type: getUIViewtype(uiObj),
            enabled: uiObj._enabledOnScreen,
            children: [],
          };
          swipeItems.push(panelUIs);
        });
      }
    }

    _uiChilds.push(pageUIs);
  });
  _UIs.push({ title: "Page Container", data: _uiChilds });

  let _ttopChilds = [];
  if (!_pagedata._toolBarTop[currentScrIndex].hidden) {
    _pagedata._toolBarTop[currentScrIndex].Children.forEach((child) => {
      let ttopObj = child.uiParts[currentScrIndex];
      let ttopUIs = {
        container: "toolBarTop",
        name: ttopObj.name,
        type: getUIViewtype(ttopObj),
        enabled: ttopObj._enabledOnScreen,
        children: [],
      };
      _ttopChilds.push(ttopUIs);
    });
  }
  _UIs.push({ title: "Toolbar [Top]", data: _ttopChilds });

  let _tbotChilds = [];
  if (!_pagedata._toolBarBottom[currentScrIndex].hidden) {
    _pagedata._toolBarBottom[currentScrIndex].Children.forEach((child) => {
      let tbotObj = child.uiParts[currentScrIndex];
      let tbotUIs = {
        container: "toolBarBottom",
        name: tbotObj.name,
        type: getUIViewtype(tbotObj),
        enabled: tbotObj._enabledOnScreen,
        children: [],
      };
      _tbotChilds.push(tbotUIs);
    });
  }
  _UIs.push({ title: "Toolbar [Bottom]", data: _tbotChilds });

  let _tleftChilds = [];
  if (!_pagedata._toolBarLeft[currentScrIndex].hidden) {
    _pagedata._toolBarLeft[currentScrIndex].Children.forEach((child) => {
      let tleftObj = child.uiParts[currentScrIndex];
      let tleftUIs = {
        container: "toolBarLeft",
        name: tleftObj.name,
        type: getUIViewtype(tleftObj),
        enabled: tleftObj._enabledOnScreen,
        children: [],
      };
      _tleftChilds.push(tleftUIs);
    });
  }
  /* if(_pagedata.viewType.indexOf("TableView") === -1){
    _UIs.push({title:"Sidebar", data:_tleftChilds});
  }else {
    if(_pagedata.viewType.indexOf("TableViewList") > -1){
      _UIs.push({title:"Sidebar [Left]", data:_tleftChilds});

      let _tRightChilds = [];
      if(!_pagedata._toolBarRight[currentScrIndex].hidden){
        _pagedata._toolBarRight[currentScrIndex].Children.forEach(child => {
          let trightObj = child.uiParts[currentScrIndex];
          let trightUIs = {container: "toolBarRight", name: trightObj.name, type: getUIViewtype(trightObj), enabled: trightObj._enabledOnScreen, children:[]};        
          _tRightChilds.push(trightUIs);
        });   
      }
      _UIs.push({title:"Sidebar [Right]", data:_tRightChilds});
    }
  } */

  if (_pagedata.viewType === "TableView") {
    _UIs.push({ title: "Sidebar", data: _tleftChilds });
  } else {
    _UIs.push({ title: "Sidebar [Left]", data: _tleftChilds });

    let _tRightChilds = [];
    if (!_pagedata._toolBarRight[currentScrIndex].hidden) {
      _pagedata._toolBarRight[currentScrIndex].Children.forEach((child) => {
        let trightObj = child.uiParts[currentScrIndex];
        let trightUIs = {
          container: "toolBarRight",
          name: trightObj.name,
          type: getUIViewtype(trightObj),
          enabled: trightObj._enabledOnScreen,
          children: [],
        };
        _tRightChilds.push(trightUIs);
      });
    }
    _UIs.push({ title: "Sidebar [Right]", data: _tRightChilds });
  }

  let _overlayChilds = [];
  if (_pagedata.pageOverlay && _pagedata.pageOverlay.Children) {
    _pagedata.pageOverlay.Children.forEach((child) => {
      let overlayObj = child.uiParts[currentScrIndex];
      let overlayUIs = {
        container: "pageOverlay",
        name: overlayObj.name,
        type: getUIViewtype(overlayObj),
        enabled: overlayObj._enabledOnScreen,
        children: [],
      };
      if (
        overlayObj.viewType === "Dialog" ||
        overlayObj.viewType === "Drawer"
      ) {
        let dialogItems = overlayUIs["children"];
        let dialogChildren = overlayObj.dataarray[0]["Fields"];
        dialogChildren.forEach((fieldui) => {
          let dialogObj = fieldui.uiParts[currentScrIndex];
          let overlayUIs = {
            container: overlayObj.viewType,
            name: dialogObj.name,
            type: getUIViewtype(dialogObj),
            enabled: dialogObj._enabledOnScreen,
            children: [],
          };
          dialogItems.push(overlayUIs);
        });
      }
      _overlayChilds.push(overlayUIs);
    });
  }
  _UIs.push({ title: "Page Overlay", data: _overlayChilds });

  //console.log("Enabled UI list >>>>", _UIs);
  return _UIs;
}

function getChildrenArray(targetEditor, editorParent, targetData, scrIndex) {
  const scrId = scrIndex ? scrIndex : 0;

  switch (targetEditor) {
    case "page":
      if (targetData.viewType === "BaseView") {
        return targetData.Children;
      } else if (targetData.viewType === "ScrollView") {
        return targetData.Children[0].Children;
      } else if (targetData["viewType"].indexOf("TableViewList") > -1) {
        if (targetData.Children[0]["_tmpCellStyle"] === "custom") {
          const tableGroup = targetData.Children[0].Group;
          return tableGroup[0].RecordCellDef.Fields;
        }
      }
      return targetData.Children;

    case "topToolbar":
      return targetData._toolBarTop[scrId].Children;

    case "bottomToolbar":
      return targetData._toolBarBottom[scrId].Children;

    case "leftToolbar":
      return targetData._toolBarLeft[scrId].Children;

    case "rightToolbar":
      return targetData._toolBarRight[scrId].Children;

    case "tablecell":
      if (targetData["viewType"].indexOf("TableViewList") > -1) {
        if (targetData.Children[0]["_tmpCellStyle"] === "custom") {
          const tableGroup = targetData.Children[0].Group;
          return tableGroup[0].RecordCellDef.Fields;
        }
      }
      return targetData.Children;

    case "overlay":
      if (targetData["pageOverlay"]) {
        return targetData["pageOverlay"].Children;
      }
      return targetData.Children;

    case "pageOverlay":
    case "Dialog":
      if (targetData["pageOverlay"] && targetData["pageOverlay"].Children[0]) {
        if (targetData["pageOverlay"].Children[0].uiParts[scrId]) {
          return targetData["pageOverlay"].Children[0].uiParts[scrId]
            .dataarray[0].Fields;
        }
      }
      return targetData["pageOverlay"].Children;

    case "TileList":
      const _uidata = editorParent ? editorParent["ui"] : "";
      if (_uidata !== "" && _uidata["viewType"] === "TileList") {
        return _uidata.dataarray[0].Fields;
      }
      return targetData.Children;

    default:
      return targetData.Children;
  }
}

function getSelecteUIData(selectedUIs, currentScrIndex) {
  if (!currentScrIndex) currentScrIndex = 0;

  let _selectedUIs = [];
  selectedUIs.forEach((item) => {
    let selectedObj = item["UI"];
    let pageUIs = {
      container: item["editor"],
      name: selectedObj.name,
      type: getUIViewtype(selectedObj),
    };
    _selectedUIs.push(pageUIs);
  });

  return _selectedUIs;
}

function setColorDic(colorValue) {
  let hex = parseInt(colorValue.substring(1), 16);
  let numRed = (hex & 0xff0000) >> 16;
  let numGreen = (hex & 0x00ff00) >> 8;
  let numBlue = hex & 0x0000ff;

  let objColor = {
    alpha: 1,
    red: numRed / 255,
    green: numGreen / 255,
    blue: numBlue / 255,
    colorName: "",
  };

  return objColor;
}

function getSlaveUIpart(uiArr, uiObj, screenindex) {
  const _uitype = getUIViewtype(uiObj);
  const _uiname = uiObj["name"];

  for (let index = 0; index < uiArr.length; index++) {
    const element = uiArr[index];
    if (element["viewType"] === _uitype) {
      if (element["uiParts"][screenindex]["name"] === _uiname) {
        return element["uiParts"];
      }
    }
  }
}

function getAllChildrenOnPage(_page, scrIndex, includeDisableUI) {
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
      }
    });
  }

  let cntTop = -1;
  if (_page._toolBarTop.length > 0) {
    _page._toolBarTop.forEach((_topToolbar) => {
      cntTop++;
      if (cntTop === 0) {
        if (!_topToolbar["hidden"]) {
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
      }
    });
  }

  let cntBottom = -1;
  if (_page._toolBarBottom.length > 0) {
    _page._toolBarBottom.forEach((_bottomToolbar) => {
      cntBottom++;
      if (cntBottom === 0) {
        if (!_bottomToolbar["hidden"]) {
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
                _bottomToolbar.Children[b]["uiParts"][scrIndex].dataarray[0][
                  "Fields"
                ];
              for (let b0 = 0; b0 < arrbTileItems.length; b0++) {
                arrChildren.push(arrbTileItems[b0]);
              }
            }
          }
        }
      }
    });
  }

  let cntLeft = -1;
  if (_page.hasOwnProperty("_toolBarLeft") && _page._toolBarLeft.length > 0) {
    _page._toolBarLeft.forEach((_leftToolbar) => {
      cntLeft++;
      if (cntLeft === scrIndex) {
        if (!_leftToolbar["hidden"]) {
          for (let l = 0; l < _leftToolbar.Children.length; l++) {
            let _leftToolbarUIContainerDic = _leftToolbar.Children[l];
            let _leftToolbarChildPartDic =
              _leftToolbarUIContainerDic["uiParts"][scrIndex];
            if (_leftToolbarChildPartDic) {
              if (
                !_leftToolbarChildPartDic["_enabledOnScreen"] &&
                !includeDisableUI
              )
                continue;
            }
            arrChildren.push(_leftToolbar.Children[l]);
            if (_leftToolbar.Children[l]["viewType"] === "TileList") {
              let arrlTileItems =
                _leftToolbar.Children[l]["uiParts"][scrIndex].dataarray[0][
                  "Fields"
                ];
              for (let l0 = 0; l0 < arrlTileItems.length; l0++) {
                arrChildren.push(arrlTileItems[l0]);
              }
            }
          }
        }
      }
    });
  }

  let cntRight = -1;
  if (_page.hasOwnProperty("_toolBarRight") && _page._toolBarRight.length > 0) {
    _page._toolBarRight.forEach((_rightToolbar) => {
      cntRight++;
      if (cntRight === scrIndex) {
        if (!_rightToolbar["hidden"]) {
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
                _rightToolbar.Children[r]["uiParts"][scrIndex].dataarray[0][
                  "Fields"
                ];
              for (let r0 = 0; r0 < arrrTileItems.length; r0++) {
                arrChildren.push(arrrTileItems[r0]);
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
    pageLocale: state.appParam.pagelocale,
    pallete: state.appParam.pallete,
    pageContainer: state.appParam.pagecontainer,
    pageConfig: state.appParam.pageconfig,
    uiLocale: state.appParam.uilocale,
    uiList: state.appParam.uilist,
    uiConfig: state.appParam.uiconfig,
    currentPage: state.selectedData.pagedata,
    currentUI: state.selectedData.uidata,
    selectedUIs: state.selectedData.uiparts,
    targetEditor: state.selectedData.editor,
    contentEditorParent: state.selectedData.editorParent,
  };
}
export default connect(mapStateToProps)(SettingWindow);
