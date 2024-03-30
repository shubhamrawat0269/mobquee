import React from "react";
import "./ScreenEditorStyle.css";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  IconButton,
  Fab,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  ListSubheader,
  Radio,
  Switch,
  FormControl,
  FormControlLabel,
  Select,
  InputLabel,
  Button,
  TextField,
  Tooltip,
  SvgIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Slide,
  Avatar,
  Typography,
  ImageList,
  ImageListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
} from "@mui/material";

import AlertWindow from "../../../components/AlertWindow";

import {
  setProjectData,
  updateScreenData,
  removeScreenData,
  setAllPageChanged,
  setContributorTabs,
} from "../../ServiceActions";
import ProjectMergeView from "../../helpers/ProjectMergeView/ProjectMergeView";
import {
  Add,
  Delete,
  DesktopMac,
  Edit,
  Help,
  Smartphone,
  Tablet,
} from "@mui/icons-material";

class ScreenEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: this.props.show,
      isMasterScreenSet: this.props.isMasterScreenSet,
      screenData: this.props.screens,
      platform: "",
      screenname: "",
      orientation: "Portrait",
      width: 375,
      height: 667,

      screenSizes: [],
      openSetting: false,
      alertMessage: "",
      showAlert: false,
      screenData_toUpdate: [],
      screenId_toUpdate: -1,
      addscreen: false,
      editscreen: false,
      deletescreen: false,
      deletescreenId: "",
      openConfirm: false,
      openAppMerge: false,

      disableUpdate:
        this.props.isContributorWorking ||
        !this.props.isProjectRoleOwner ||
        !this.props.isallowtoUpdate,
    };

    this.handleSettingOpen = this.handleSettingOpen.bind(this);
    this.handleSettingClose = this.handleSettingClose.bind(this);

    this.handleEditScreen = this.handleEditScreen.bind(this);
    this.handleDeleteScreen = this.handleDeleteScreen.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleAddScreenSave = this.handleAddScreenSave.bind(this);
    this.handleAddScreenCancel = this.handleAddScreenCancel.bind(this);
    this.handleEditScreenUpdate = this.handleEditScreenUpdate.bind(this);
    this.handleDeleteScreenOk = this.handleDeleteScreenOk.bind(this);
    this.handleDeleteScreenCancel = this.handleDeleteScreenCancel.bind(this);
  }

  componentDidMount() {
    this.fetchScreenSizes();
  }

  fetchScreenSizes() {
    fetch("././config/ScreenSizes.json")
      .then((res) => res.json())
      .then(
        (result) => {
          let screenSizes = result["ScreenSizes"];
          this.setState({ screenSizes: screenSizes });
        },
        (error) => {
          console.log("config error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  //////////////////////

  handleSetMasterScreen(event) {
    //console.log(event.target.checked, "***SetMasterScreen ***", this.props.appData);

    const _availableScreens = this.props.appData["availableScreens"];
    if (_availableScreens && _availableScreens.length > 1) {
      this.setState({ isMasterScreenSet: event.target.checked });
      this.props.appData["isMasterScreenSet"] = event.target.checked;
      this.props.dispatch(setProjectData(this.props.appData));

      updateProjectData(
        this.props,
        this.props.appData,
        "isMasterScreenSet",
        true
      );
      this.setState({ alertMessage: "Project 'preview' is must to set this." });
      this.setState({ showAlert: true });
    } else {
      event.preventDefault();
      this.setState({
        alertMessage: "There should be atleast 2 screens to apply this.",
      });
      this.setState({ showAlert: true });
    }
  }

  handleMasterScreenChange(event) {
    const selectedIndex = parseInt(event.target.value);

    let _screenData = this.props.screens;
    for (let index = 0; index < _screenData.length; index++) {
      if (index === selectedIndex) {
        _screenData[index]["embed"] = true;
      } else {
        _screenData[index]["embed"] = false;
      }
    }

    this.setState({ screenData: _screenData });
    //this.props.dispatch(setProjectData(this.props.appData));
    //this.props.dispatch(updateScreenData(this.props.appData.availableScreens));
  }

  handleSettingOpen(event) {
    let _openedPages = this.props.openedPages;
    if (_openedPages.length === 0) {
      this.setState({ openSetting: true });
    } else {
      this.setState({ alertMessage: "Please close all opened pages." });
      this.setState({ showAlert: true });
    }
  }

  handleSettingClose() {
    this.setState({ openSetting: false });
  }

  handleCloseAlert() {
    //this.setState({alertMessage:""});
    this.setState({ showAlert: false });
  }

  //////////////////////

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  //////////////////////
  // Add Screen
  //////////////////////

  handleAddScreenSave(event) {
    let _isValid = this.validateScreenDataObj();
    if (!_isValid) {
      console.log("Required fields cannot be empty.");
      return;
    }

    let _screenData = this.props.screens;

    let _screenObj = {
      AppIcon: "",
      SplashIcon: [],
      embed: false,
      Platform: this.state.platform,
      screenName: this.state.screenname,
      orientation: this.state.orientation,
      width: Number(this.state.width),
      height: Number(this.state.height),
    };
    _screenData.push(_screenObj);

    console.log("handleAddScreen", _screenData);

    this.setState({ addscreen: false });
    this.setState({ screenData: _screenData });
  }

  handleAddScreenCancel(event) {
    this.setState({ addscreen: false });
    this.setState({ editscreen: false });
  }

  validateScreenDataObj() {
    let _valid = true;
    if (
      this.state.platform === "" ||
      this.state.screenname === "" ||
      this.state.orientation === ""
    ) {
      _valid = false;
    }
    return _valid;
  }

  handleAddScreenApply(screenObj) {
    this.setState({ openSetting: false });

    let _screenData = this.props.screens;
    if (!this.state.editscreen) {
      screenObj["AppIcon"] = "";
      screenObj["SplashIcon"] = [];
      screenObj["embed"] = false;
      _screenData.push(screenObj);
      console.log("onApplySetting >>>", screenObj);
    } else {
      this.handleEditScreenApply(screenObj);
    }

    this.updateMultiuserContributorData();

    this.props.dispatch(setProjectData(this.props.appData));
    this.props.dispatch(updateScreenData(this.props.appData.availableScreens));
    this.props.dispatch(setAllPageChanged(true));

    this.setState({ openConfirm: true });

    /* const isMultiuser = (this.props.appData.hasOwnProperty('Contributors') && this.props.appData['Contributors'].length > 1) ? true : false;
      if(isMultiuser && this.props.isProjectRoleOwner && !this.props.isContributorWorking) {
        let tabpageIds = this.getTabPageList(this.props.pagelist);
        console.log(this.props, "... tabpages >>>", tabpageIds);
        this.props.dispatch(setContributorTabs(tabpageIds));        
      } */
  }

  handleEditScreenApply(screenObj) {
    let scrId = parseInt(this.state.screenId_toUpdate);
    let _screenData = this.props.screens;
    let screenRecord = _screenData[scrId];

    screenRecord["Platform"] = screenObj["Platform"];
    screenRecord["screenName"] = screenObj["screenName"];
    screenRecord["orientation"] = screenObj["orientation"];
    screenRecord["width"] = parseInt(screenObj["width"]);
    screenRecord["height"] = parseInt(screenObj["height"]);

    //console.log(_screenData, scrId, "...Apply Edit Screen........", screenRecord);
  }

  //////////////////////
  // Edit Screen
  //////////////////////

  handleEditScreen(event) {
    let _screenData = this.props.screens;

    let _screenIndex = event.currentTarget.dataset.screenindex;
    let _screenId = event.currentTarget.dataset.screenid;
    let _platform = _screenId.split("-")[0];
    let _screenname = _screenId.split("-")[1];

    let _screenObj = _screenData.filter(function (screen) {
      return screen.Platform === _platform && screen.screenName === _screenname;
    });
    console.log(_screenIndex, _screenId, " >> handleEditScreen >>", _screenObj);

    this.setState({ openSetting: true });
    this.setState({ screenId_toUpdate: _screenIndex });
    this.setState({ screenData_toUpdate: _screenObj });

    this.setState({ platform: _screenObj.platform });
    this.setState({ screenname: _screenObj.screenname });
    this.setState({ orientation: _screenObj.orientation });
    this.setState({ width: _screenObj.width });
    this.setState({ height: _screenObj.height });
    this.setState({ addscreen: false });
    this.setState({ editscreen: true });
  }

  handleEditScreenUpdate(event) {
    this.setState({ addscreen: false });
    this.setState({ editscreen: false });
    //this.setState({screens: _screenData});
  }

  //////////////////////
  // Delete Screen
  //////////////////////

  handleDeleteScreen(event) {
    let _screenId = event.currentTarget.dataset.screenid;
    this.setState({ deletescreenId: _screenId });
    this.setState({ deletescreen: true });
  }

  handleDeleteScreenOk() {
    this.setState({ deletescreen: false });

    let _screenData = this.props.screens;

    let _screenId = this.state.deletescreenId;
    let _platform = _screenId.split("-")[0];
    let _screenname = _screenId.split("-")[1];

    let _delScrIndex;
    _screenData.forEach((screen, index) => {
      if (screen.Platform === _platform && screen.screenName === _screenname) {
        _delScrIndex = index;
        _screenData.splice(index, 1);
      }
    });

    console.log(_delScrIndex, " >> handleDeleteScreen >>", _screenData);
    this.setState({ screenData: _screenData });

    this.updateMultiuserContributorData();

    this.props.dispatch(setProjectData(this.props.appData));
    this.props.dispatch(removeScreenData(_delScrIndex));
    this.props.dispatch(setAllPageChanged(true));

    this.setState({ openConfirm: true });
  }

  handleDeleteScreenCancel() {
    this.setState({ deletescreen: false });
  }

  //////////////////////

  updateMultiuserContributorData() {
    const _projectData = this.props.appData;
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

            let tabpageIds = this.getTabPageList(this.props.pagelist);
            console.log(this.props, "... tabpages >>>", tabpageIds);
            this.props.dispatch(setContributorTabs(tabpageIds));
            node["selectTabPages"] = tabpageIds;
          }
        }
      }
    }
  }

  getTabPageList(pageList) {
    let _tabPageIDs = [];
    pageList.forEach((page) => {
      if (page["parentid"] === "App") {
        _tabPageIDs.push(page.pageid);
      }
    });

    return _tabPageIDs;
  }

  ////////////////////////////////////////////

  confirmCloseHandler() {
    this.setState({ openConfirm: false });
  }
  confirmOKHandler() {
    this.setState({ openConfirm: false });
    this.props.onSaveAllPagesData();
  }

  //////////////////////////////////////////////

  handleAppMergeClick(event) {
    this.setState({ openAppMerge: true });
  }
  handleAppMergeClose() {
    this.setState({ openAppMerge: false });
  }

  ////////////////////////////////////////////////////////////////////////////////////////

  render() {
    const { show, isMasterScreenSet, openSetting, disableUpdate } = this.state;
    const displayEmbed = !disableUpdate
      ? isMasterScreenSet
        ? "block"
        : "none"
      : "none";
    const displayUpdate = !disableUpdate ? "" : "none";
    const screenData = this.props.appData["availableScreens"];

    if (!show) {
      return null;
    }

    return (
      <div className="vertical-align">
        {!this.state.addscreen && (
          <div
            className="horizontal-align"
            style={{ alignItems: "flex-start", background: "white" }}
          >
            <Box
              id="screenList"
              className="box"
              style={{ maxHeight: 500, overflow: "hidden" }}
            >
              <FormControlLabel
                style={{ margin: 0, display: displayUpdate }}
                label={<h4>Enable Master-Slave</h4>}
                control={
                  <Switch
                    color="primary"
                    checked={isMasterScreenSet}
                    onChange={this.handleSetMasterScreen.bind(this)}
                  />
                }
              />
              {disableUpdate && (
                <FormControlLabel
                  style={{ margin: 0 }}
                  label="Master-Slave enabled"
                  disabled={true}
                  control={
                    <Radio color="primary" checked={isMasterScreenSet} />
                  }
                />
              )}
              <List
                component="nav"
                dense={true}
                aria-labelledby="nested-list-subheader"
                style={{ overflow: "auto", width: "100%" }}
                subheader={
                  <ListSubheader
                    component="div"
                    className="screen-list-subheader"
                    id="nested-list-subheader"
                    style={{
                      color: "white",
                      padding: "0.35rem",
                      fontWeight: "bold",
                    }}
                  >
                    <h6>Available Screens (w x h - orientation)</h6>
                  </ListSubheader>
                }
              >
                {screenData.map((item, index) => (
                  <ListItem button key={item.screenName + "_" + index}>
                    <ListItemIcon
                      style={{ display: displayEmbed, minWidth: 40 }}
                    >
                      <Radio
                        edge="start"
                        color="default"
                        disableRipple
                        tabIndex={-1}
                        value={index}
                        checked={item.embed}
                        onChange={this.handleMasterScreenChange.bind(this)}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.Platform + " - " + item.screenName}
                      secondary={
                        <h4>
                          {item.width +
                            " x " +
                            item.height +
                            " - " +
                            item.orientation}
                        </h4>
                      }
                    />
                    {!item.embed && (
                      <ListItemSecondaryAction
                        style={{ display: displayUpdate }}
                      >
                        <IconButton
                          edge="end"
                          aria-label="Edit"
                          data-screenindex={index}
                          data-screenid={item.Platform + "-" + item.screenName}
                          onClick={this.handleEditScreen}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="Delete"
                          data-screenid={item.Platform + "-" + item.screenName}
                          onClick={this.handleDeleteScreen}
                        >
                          <Delete />
                        </IconButton>
                        {this.state.deletescreen && (
                          <AlertWindow
                            open={true}
                            title="Are you sure to delete screen ?"
                            message="All data for this screen will be deleted."
                            ok="Yes"
                            okclick={this.handleDeleteScreenOk}
                            cancel="No"
                            cancelclick={this.handleDeleteScreenCancel}
                          />
                        )}
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box className="vertical-align" style={{ width: 56 }}>
              <Tooltip title="Add Screen">
                <Fab
                  color="default"
                  size="small"
                  aria-label="AddScreen"
                  style={{ margin: 8, marginRight: 0, display: displayUpdate }}
                >
                  <Add onClick={this.handleSettingOpen} />
                </Fab>
              </Tooltip>
              <Tooltip title="App Merge">
                <Fab
                  color="default"
                  size="small"
                  aria-label="AppMerge"
                  style={{ margin: 8, marginRight: 0, display: "none" }}
                >
                  <SvgIcon onClick={this.handleAppMergeClick.bind(this)}>
                    <path d="M6.41,21L5,19.59l4.83-4.83c0.75-0.75,1.17-1.77,1.17-2.83v-5.1L9.41,8.41L8,7l4-4l4,4l-1.41,1.41L13,6.83v5.1 c0,1.06,0.42,2.08,1.17,2.83L19,19.59L17.59,21L12,15.41L6.41,21z"></path>
                  </SvgIcon>
                </Fab>
              </Tooltip>
            </Box>
          </div>
        )}
        {this.state.openAppMerge && (
          <ProjectMergeView
            projectdata={this.props.appData}
            oncloseWindow={this.handleAppMergeClose.bind(this)}
          />
        )}
        {this.state.addscreen && (
          <Box
            className="box"
            style={{ overflow: "hidden", height: 400, marginTop: 8 }}
          >
            <div className="vertical-align">
              <FormControl required style={{ minWidth: 200, margin: 8 }}>
                <InputLabel shrink htmlFor="platform-native">
                  Platform
                </InputLabel>
                <Select
                  native
                  value={this.state.platform}
                  onChange={this.handleChange("platform")}
                  inputProps={{
                    name: "platform",
                    id: "platform-native",
                  }}
                >
                  <option value="" />
                  <option value="iOS">iOS</option>
                  <option value="Android">Android</option>
                  <option value="Windows">Windows</option>
                  <option value="MobileWeb">MobileWeb</option>
                </Select>
              </FormControl>
              <FormControl required style={{ minWidth: 200, margin: 8 }}>
                <InputLabel shrink htmlFor="screenname-native">
                  Screen Name
                </InputLabel>
                <Select
                  native
                  value={this.state.screenname}
                  onChange={this.handleChange("screenname")}
                  inputProps={{
                    name: "screenname",
                    id: "screenname-native",
                  }}
                >
                  <option value="" />
                  <option value="iPhone">iPhone</option>
                  <option value="Custom">Custom</option>
                </Select>
              </FormControl>
              <FormControl style={{ minWidth: 200, margin: 8 }}>
                <InputLabel shrink htmlFor="orientation-native">
                  Screen Orientation
                </InputLabel>
                <Select
                  native
                  value={this.state.orientation}
                  onChange={this.handleChange("orientation")}
                  inputProps={{
                    name: "orientation",
                    id: "orientation-native",
                  }}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </Select>
              </FormControl>
              <TextField
                type="number"
                id="width-number"
                label="Width"
                margin="normal"
                value={this.state.width}
                onChange={this.handleChange("width")}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                type="number"
                id="height-number"
                label="Height"
                margin="normal"
                value={this.state.height}
                onChange={this.handleChange("height")}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <div className="hrline" style={{ width: "100%" }} />
              <div
                style={{
                  height: "100%",
                  width: 200,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-around",
                  alignItems: "flex-end",
                  marginBottom: 8,
                }}
              >
                {this.state.editscreen && (
                  <button
                    variant="contained"
                    color="default"
                    onClick={this.handleEditScreenUpdate}
                  >
                    {" "}
                    Update{" "}
                  </button>
                )}
                {!this.state.editscreen && (
                  <button
                    variant="contained"
                    color="default"
                    onClick={this.handleAddScreenSave}
                  >
                    {" "}
                    Save{" "}
                  </button>
                )}
                <button
                  variant="contained"
                  color="default"
                  onClick={this.handleAddScreenCancel}
                >
                  {" "}
                  Cancel{" "}
                </button>
              </div>
            </div>
          </Box>
        )}
        {openSetting && (
          <ScreenSetting
            sizedata={this.state.screenSizes}
            availableScreens={this.state.screenData}
            screenData={this.state.screenData_toUpdate}
            isEditScreen={this.state.editscreen}
            onCloseSetting={this.handleSettingClose}
            onApplySetting={this.handleAddScreenApply.bind(this)}
          />
        )}
        {this.state.openConfirm && (
          <AlertWindow
            open={true}
            title=""
            message="Need to save all pages data. Click OK to continue."
            cancel=""
            cancelclick={this.confirmCloseHandler.bind(this)}
            ok="OK"
            okclick={this.confirmOKHandler.bind(this)}
          />
        )}
        <Snackbar
          open={this.state.showAlert}
          message={<h4>{this.state.alertMessage}</h4>}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          autoHideDuration={4000}
          onClose={this.handleCloseAlert.bind(this)}
        />
      </div>
    );
  }
}

////////////////////

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

function ScreenSetting(props) {
  const sizesData = props.sizedata;
  const availableScreens = props.availableScreens;
  //console.log(props.screenData, availableScreens, "...... ScreenSetting Sizes .....", sizesData);

  const action = props.isEditScreen === true ? "edit" : "add";
  const defaultSetting = [
    { category: "Phones", aspect: "9:16" },
    { category: "Tablets", aspect: "3:4" },
    { category: "Desktop", aspect: "16:9" },
  ];
  const defaultScreen =
    action === "add"
      ? defaultSetting[0]
      : setSelectedScreenData(props.screenData[0]);
  const [screenCategory, setScreenCategory] = React.useState(
    defaultScreen["category"]
  );
  const defaultAspect =
    action === "add"
      ? defaultAspectPerCategory(defaultSetting, screenCategory)
      : defaultScreen["aspect"];
  const [selectedAspect, setSelectedAspect] = React.useState(defaultAspect);
  //console.log(defaultScreen, defaultAspect, "<<.... ScreenSetting ...>>", screenCategory, selectedAspect);

  const [selectedScreen, setSelectedScreen] = React.useState({});

  /////////////////////////////////

  function handleChangePlatform(event) {
    let _platform = event.currentTarget.value;
    setScreenCategory(_platform);
    const _aspect = defaultAspectPerCategory(defaultSetting, _platform);
    setSelectedAspect(_aspect);

    setSelectedScreen("");
  }

  function filter_sizesData() {
    if (!screenCategory) {
      return [];
    }

    let _sizeObj = sizesData.filter(function (sizeObj) {
      return sizeObj.category === screenCategory;
    });
    if (_sizeObj.length > 0) {
      //console.log(".... filter_sizesData >>>>>>>>", _sizeObj, selectedAspect);
      return _sizeObj;
    } else {
      return [];
    }
  }

  function handleChangeAspect(event) {
    setSelectedAspect(event.currentTarget.value);
    setSelectedScreen("");
  }

  function filter_deviceData(category, aspect) {
    //console.log(".... filter_deviceData >>>>>>>>", category, aspect);
    if (!aspect) {
      return [];
    }

    let _sizeObj = sizesData.filter(function (sizeObj) {
      return sizeObj.category === category;
    });

    if (_sizeObj.length > 0) {
      let itemsData = _sizeObj[0].items;
      let _itemObj = itemsData.filter(function (itemObj) {
        return itemObj.aspect === aspect;
      });
      if (_itemObj.length > 0) {
        let _devicedata = _itemObj[0].devices;
        _devicedata.sort(function (a, b) {
          return a.sizeW - b.sizeW;
        });
        //console.log(".... filter_deviceData >>>>>>>>", _devicedata);
        return _devicedata;
      } else {
        let elseItems = _sizeObj[0].items;
        if (elseItems.length > 0) {
          return elseItems[0].devices;
        }
        return [];
      }
    }
    return [];
  }

  const [showHelp, setShowHelp] = React.useState(true);
  function handleHelpText(event) {
    setShowHelp(!showHelp);
  }

  function handleClickRecord(ev, data) {
    setSelectedScreen(data);
  }

  const isSelected = (name) => selectedScreen["name"] === name;

  ////////////////////////////

  function handlePopupClose() {
    props.onCloseSetting();
  }

  function handleApplySetting() {
    let screenRecord = {};
    screenRecord["Platform"] = screenCategory;
    screenRecord["screenName"] = selectedAspect;
    screenRecord["orientation"] =
      screenCategory === "Desktop" ? "Landscape" : "Portrait";
    screenRecord["width"] = parseInt(selectedScreen["sizeW"]);
    screenRecord["height"] = parseInt(selectedScreen["sizeH"]);

    let isScreenExist = validateScreenExistence(screenRecord);
    if (isScreenExist) {
      console.log("Screen with same aspect already available");
      setOpenalert(true);
    } else {
      props.onApplySetting(screenRecord);
    }
  }

  function validateScreenExistence(screenRecord) {
    //console.log(availableScreens, ".... validateScreenExistence ...", screenRecord);
    for (let index = 0; index < availableScreens.length; index++) {
      const element = setSelectedScreenData(availableScreens[index]);
      if (
        element["category"] === screenRecord["Platform"] &&
        element["aspect"] === screenRecord["screenName"]
      ) {
        return true;
      }
    }
    return false;
  }

  const [openalert, setOpenalert] = React.useState(false);
  const handleCloseAlert = () => {
    setOpenalert(false);
  };

  ////////////////////////////

  return (
    <Dialog
      id="screensetting"
      TransitionComponent={Transition}
      scroll="paper"
      open={true}
      fullWidth={true}
      maxWidth="lg"
    >
      <DialogTitle className="screen-editor-title">Screen Setting</DialogTitle>
      <DialogContent dividers>
        <FormControl required className="screen-editor-frm-ctrl">
          <InputLabel shrink htmlFor="platform-native">
            Platform
          </InputLabel>
          <Select native value={screenCategory} onChange={handleChangePlatform}>
            {sizesData.map((sizes, id) => (
              <option key={id} value={sizes.category}>
                {sizes.category}
              </option>
            ))}
          </Select>
        </FormControl>
        <Paper className="paper-container-section" elevation={9}>
          <ImageList className="grid-container" cellHeight={220}>
            {filter_sizesData().map((sizes) => (
              <ImageListItem
                key={sizes.category}
                cols={1}
                style={{ width: "100%", height: "auto", minHeight: 400 }}
              >
                <Box className="grid-box1">
                  <Avatar color="default" className="grid-box-avatar">
                    {screenCategory === "Phones" && (
                      <Smartphone className="platform-icon" />
                    )}
                    {screenCategory === "Tablets" && (
                      <Tablet className="platform-icon" />
                    )}
                    {screenCategory === "Desktop" && (
                      <DesktopMac className="platform-icon" />
                    )}
                  </Avatar>
                  <FormControl className="screen-editor-frm-ctrl">
                    <InputLabel shrink htmlFor="orientation-native">
                      Screen Aspect
                    </InputLabel>
                    <Select
                      native
                      defaultValue={selectedAspect}
                      onChange={handleChangeAspect}
                    >
                      {sizes.items.map((item, id) => (
                        <option key={id} value={item.aspect}>
                          {item.aspect}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  {showHelp && (
                    <Typography
                      variant="body2"
                      gutterBottom
                      className="helptext"
                    >
                      Please select a record fom below table & click on 'Apply'
                      button. A new screen definition will be added. For design
                      perspective, page size will be as 'Viewport Size'.
                      <br />
                      <br />
                      It is recommended to select one record per aspect per
                      platform.
                    </Typography>
                  )}
                  <IconButton
                    edge="end"
                    color="inherit"
                    className="iconbtn"
                    onClick={handleHelpText}
                  >
                    <Help />
                  </IconButton>
                </Box>
                <Box className="grid-box">
                  <Typography className="tablelabel">
                    Popular devices for selected aspect
                  </Typography>
                  {selectedAspect !== "" && (
                    <TableContainer>
                      <Table
                        stickyHeader
                        className="table-layout"
                        size="small"
                        aria-label="a dense table"
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell className="screen-editor-table-cell">
                              Viewport Size (w x h)
                            </TableCell>
                            <TableCell className="screen-editor-table-cell">
                              Device Name
                            </TableCell>
                            <TableCell
                              className="screen-editor-table-cell"
                              align="right"
                            >
                              Device Resolution
                            </TableCell>
                            <TableCell
                              className="screen-editor-table-cell"
                              align="right"
                            >
                              Physical Size (inches)
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filter_deviceData(
                            screenCategory,
                            selectedAspect
                          ).map((row) => (
                            <TableRow
                              key={row.name}
                              selected={isSelected(row.name)}
                              className="tableRow screen-editor-table-row"
                              onClick={(event) => handleClickRecord(event, row)}
                            >
                              {row.sizeW === "" ? (
                                <TableCell className="screen-editor-table-cell"></TableCell>
                              ) : (
                                <TableCell className="screen-editor-table-cell tableCell">
                                  {row.sizeW} x {row.sizeH}
                                </TableCell>
                              )}
                              <TableCell
                                className="screen-editor-table-cell tableCell"
                                component="th"
                                scope="row"
                              >
                                {row.name}
                              </TableCell>
                              <TableCell
                                className="screen-editor-table-cell tableCell"
                                align="right"
                              >
                                {row.resolution}
                              </TableCell>
                              <TableCell
                                className="screen-editor-table-cell tableCell"
                                align="right"
                              >
                                {row.physical}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </ImageListItem>
            ))}
          </ImageList>
          <Snackbar
            open={openalert}
            message="Screen with same aspect already available"
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            autoHideDuration={4000}
            onClose={handleCloseAlert}
          />
        </Paper>
      </DialogContent>
      <DialogActions>
        <button
          variant="outlined"
          color="default"
          disabled={!selectedScreen["name"]}
          className="screen-btn"
          onClick={handleApplySetting}
        >
          Apply
        </button>
        <button
          variant="outlined"
          color="default"
          autoFocus
          className="screen-btn"
          onClick={handlePopupClose}
        >
          Cancel
        </button>
      </DialogActions>
    </Dialog>
  );
}

function setSelectedScreenData(screenObj) {
  let _platform = migratePlatform(screenObj["Platform"]);
  //let _screenName = screenObj['screenName'];  //PHONE [iphone, ipod, ... ], TABLET[ipad, Tab, Nexus-7, Nexus-10], Desktop[]

  let _orientation = screenObj["orientation"];
  let _width = screenObj["width"];
  let _height = screenObj["height"];

  let _aspect = migrateAspect(_orientation, _width, _height);

  return { category: _platform, aspect: _aspect };
}

function migratePlatform(_platform) {
  //['iOS', 'iOS Tablet', 'Android Phone', 'Android Tab', 'Windows Phone', 'Mobile Web']
  switch (_platform.toLowerCase()) {
    case "ios":
    case "android phone":
    case "windows phone":
      return "Phones";

    case "ios tablet":
    case "android tab":
      return "Tablets";

    case "Mobile Web":
      return "Desktop";

    default:
      return _platform;
  }
}
function migrateAspect(orientation, wid, hei) {
  let ratio = parseInt(wid) / parseInt(hei);
  ratio = parseFloat(ratio.toFixed(3));

  //console.log(wid, hei, ".... migrateAspect >>>>>>>>", ratio);

  switch (ratio) {
    case 0.556:
      return "5:9";
    case 0.562:
    case 0.563:
      return "9:16";
    case 0.6:
      return "3:5";
    case 0.625:
      return "5:8";
    case 0.667:
      return "2:3";
    case 0.75:
      return "3:4";
    case 1.5:
      return "3:2";
    case 1.6:
      return "8:5";
    case 1.778:
      return "16:9";

    default:
      return "Others";
  }
}

function defaultAspectPerCategory(defaultData, selectedCategory) {
  //console.log(defaultData, "...... defaultAspectPerCategory .....", selectedCategory);

  let _screenObj = defaultData.filter(function (item) {
    return item.category === selectedCategory;
  });

  return _screenObj[0].aspect;
}

function updateProjectData(propsObj, projectData, keytoupdate, isStringType) {
  const updatedval = projectData[keytoupdate];

  let apiurl = propsObj.appconfig.apiURL;
  var formData = new FormData();
  if (isStringType) {
    apiurl = apiurl + "service.json";

    formData.append("command", "projectkeyupdate");
    formData.append("projectid", propsObj.appconfig["projectid"]);
    formData.append("userid", propsObj.appconfig["userid"]);
    formData.append("sessionid", propsObj.appconfig["sessionid"]);
    formData.append("key", keytoupdate);
    formData.append("value", updatedval);
  } else {
    apiurl = apiurl + "multipartservice.json";
    formData.append("command", "projectupdate");
    formData.append("projectid", propsObj.appconfig["projectid"]);
    formData.append("userid", propsObj.appconfig["userid"]);
    formData.append("sessionid", propsObj.appconfig["sessionid"]);

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
          console.log("updateProjectData NACK >>>", _err.message);
        } else {
          console.log("updateProjectData ACK >>> Success");
        }
      },
      (error) => {
        console.log("updateProjectData Error >>> Fail");
      }
    );
}

ScreenEditor.propTypes = {
  //onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  children: PropTypes.node,
};

//export default ScreenEditor;
function mapStateToProps(state) {
  return {
    apiParam: state.appParam.params,
    appData: state.appData.data,
    openedPages: state.selectedData.pages,
    currentPage: state.selectedData.pagedata,
    currentUI: state.selectedData.uidata,
  };
}
export default connect(mapStateToProps)(ScreenEditor);
