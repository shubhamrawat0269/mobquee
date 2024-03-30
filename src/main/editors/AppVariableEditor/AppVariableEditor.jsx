import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import "./AppVariableEditorStyle.css";

import { Add, Close, Delete, Edit, Help } from "@mui/icons-material";

import AlertWindow from "../../../components/AlertWindow";
import { setProjectData } from "../../ServiceActions";
import {
  Box,
  Fab,
  List,
  ListItem,
  Typography,
  IconButton,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Popover,
  Snackbar,
} from "@mui/material";

class AppVariableEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: this.props.show,
      appVariables: [],
      key: "",
      value: "",

      addvariable: false,
      editvariable: false,
      isKeyUpdate: false,
      variableData_toUpdate: [],
      variableId_toUpdate: -1,
      deletevariable: false,
      deletevariableId: "",
      confirmalert: "",
      alertmessage: "",
      openAlert: false,

      disableUpdate: this.props.isContributorWorking,
      globalKeys: [
        "__NOW__",
        "__NUMREC__",
        "__INSTANCENAME__",
        "__PATH__",
        "__BASEURL__",
        "__PROJECTID__",
        "__PROJECTSTATE__",
        "__ERR_CODE__",
        "__ERR_MSG__",
        "__OS__",
        "__OSVER__",
        "__APPVER__",
        "__RANDOM__",
        "__BLANK__",
        "__IMEI__",
        "__LAT__",
        "__LONG__",
        "__ADDRESS__",
        "__ALT__",
        "__MAPZOOM__",
        "__GPSDATE__",
        "__COURSE__",
        "__ROUTEDISTANCE__",
        "__ROUTETIME__",
        "__CENTERLAT__",
        "__CENTERLONG__",
      ],
      showGlobalKeys: false,
      popupGlobalKeys: null,
    };

    this.handleAddVariable = this.handleAddVariable.bind(this);
    this.handleEditVariable = this.handleEditVariable.bind(this);
    this.handleDeleteVariable = this.handleDeleteVariable.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleAddVariableSave = this.handleAddVariableSave.bind(this);
    this.handleAddVariableCancel = this.handleAddVariableCancel.bind(this);
    this.handleEditVariableUpdate = this.handleEditVariableUpdate.bind(this);
    this.handleDeleteVariableOk = this.handleDeleteVariableOk.bind(this);
    this.handleDeleteVariableCancel =
      this.handleDeleteVariableCancel.bind(this);
  }

  componentDidMount() {
    this.setAppVariables();
  }

  setAppVariables() {
    const projectData = this.props.data;
    if (projectData && projectData.hasOwnProperty("appVariables")) {
      this.setState({ appVariables: projectData["appVariables"] });
    }
  }

  //////////////////////

  handleChange = (name) => (event) => {
    if (name === "key") {
      const val = event.target.value;
      if (val.length > 0) {
        const allowedChars = /[a-zA-Z0-9]/g;
        let allowedTitle = val.match(allowedChars);
        if (!allowedTitle) {
          this.setState({ alertmessage: "Only alphabets & numbers allowed." });
          this.setState({ openAlert: true });
          return;
        }
        if (allowedTitle && val.length !== allowedTitle.length) {
          this.setState({ alertmessage: "Only alphabets & numbers allowed." });
          this.setState({ openAlert: true });
          return;
        }
      }
      if (this.state.editvariable) {
        this.setState({ isKeyUpdate: true });
      }

      this.setState({ key: val.toString().toUpperCase() });
    } else {
      this.setState({ [name]: event.target.value });
    }
  };

  //////////////////////
  // Add Variable
  //////////////////////

  handleAddVariable(event) {
    this.setState({ key: "" });
    this.setState({ value: "" });
    this.setState({ addvariable: true });
  }

  handleAddVariableSave(event) {
    let validationMesage = this.validateVariableDataObj();
    if (validationMesage && validationMesage.length > 0) {
      this.setState({ alertmessage: validationMesage });
      this.setState({ openAlert: true });
      return;
    }
    //console.log(">>>>", this.state.key);
    const _strkey = "__" + this.state.key + "__";
    const _variableObj = {
      key: _strkey,
      value: this.state.value,
    };
    let variableData = this.state.appVariables;
    variableData.push(_variableObj);

    //console.log("handleAddVariable", _variableData);

    this.setState({ addvariable: false });
    this.setState({ appVariables: variableData });

    this.props.appData["appVariables"] = variableData;
    this.updateAddRemoveVariables(_strkey, "add");
    this.updateProjectData();
  }

  handleAddVariableCancel(event) {
    this.setState({ addvariable: false });
    this.setState({ editvariable: false });
  }

  validateVariableDataObj() {
    let _valid = "";
    if (this.state.key === "") {
      _valid = "Required fields cannot be empty.";
    } else {
      const keyText = "__" + this.state.key + "__"; //this.state.key;

      const globalKeys = this.state.globalKeys;
      const index = globalKeys.indexOf(keyText);
      if (index > -1) {
        _valid = "It is reserved Key.";
      }

      let _varData = this.state.appVariables;
      let _variableObj = _varData.filter(function (variable) {
        return variable.key === keyText;
      });
      if (_variableObj.length > 0) {
        _valid = "Key already exist.";
      }

      if (this.state.editvariable && !this.state.isKeyUpdate) {
        _valid = "";
      }
    }
    return _valid;
  }

  handleGlobalKeyListOpen(event) {
    this.setState({ showGlobalKeys: !this.state.showGlobalKeys });
    this.setState({ popupGlobalKeys: event.currentTarget });
  }
  handleGlobalKeyListClose() {
    this.setState({ popupGlobalKeys: null });
    this.setState({ showGlobalKeys: false });
  }

  //////////////////////
  // Edit Variable
  //////////////////////

  handleEditVariable(event) {
    let _varData = this.state.appVariables;

    let _index = event.currentTarget.dataset["index"];
    let _key = event.currentTarget.dataset["key"];

    let _variableObj = _varData.filter(function (variable) {
      return variable.key === _key;
    });
    console.log(_index, _key, " >> handleEditVariable >>", _variableObj);

    this.setState({ variableId_toUpdate: _index });
    this.setState({ variableData_toUpdate: _variableObj[0] });

    this.setState({ key: _variableObj[0].key.replace(/__/g, "") });
    this.setState({ value: _variableObj[0].value });
    this.setState({ addvariable: true });
    this.setState({ editvariable: true });
  }

  handleEditVariableUpdate(event) {
    let validationMesage = this.validateVariableDataObj();
    if (validationMesage && validationMesage.length > 0) {
      this.setState({ alertmessage: validationMesage });
      this.setState({ openAlert: true });
      return;
    }
    this.setState({ addvariable: false });
    this.setState({ editvariable: false });

    const _strkey = "__" + this.state.key + "__";
    let _variableData = this.state.appVariables;
    let _variableObj = { key: _strkey, value: this.state.value };
    _variableData.splice(this.state.variableId_toUpdate, 1, _variableObj);
    this.setState({ appVariables: _variableData });

    this.props.appData["appVariables"] = _variableData;
    //console.log(_strkey, " .... ", this.state.variableData_toUpdate['key']);
    if (_strkey !== this.state.variableData_toUpdate["key"]) {
      this.updateAddRemoveVariables(_strkey, "edit");
    }
    this.updateProjectData();
  }

  //////////////////////
  // Delete Variable
  //////////////////////

  handleDeleteVariable(event) {
    let _index = event.currentTarget.dataset["index"];
    this.setState({ deletevariableId: _index });

    this.setState({ confirmalert: "Are you sure to delete this ?" });
    this.setState({ deletevariable: true });
  }

  handleDeleteVariableOk() {
    this.setState({ confirmalert: "" });
    this.setState({ deletevariable: false });

    let _variableData = this.state.appVariables;

    let _variableId = this.state.deletevariableId;
    const deleteObj = _variableData.splice(_variableId, 1);
    const _strkey = deleteObj[0]["key"];
    console.log(_strkey, " >> handleDeleteVariable >>", _variableData);
    this.setState({ appVariables: _variableData });

    this.props.appData["appVariables"] = _variableData;
    this.updateAddRemoveVariables(_strkey, "remove");
    this.updateProjectData();
  }

  handleDeleteVariableCancel() {
    this.setState({ confirmalert: "" });
    this.setState({ deletevariable: false });
  }

  //////////////////////

  handleCloseAlert() {
    this.setState({ openAlert: false });
  }

  //////////////////////

  updateAddRemoveVariables(strkey, operation) {
    let arrAddedVariables = this.props.appData["addedAppVariables"];
    let arrRemovedVariables = this.props.appData["removedAppVariables"];
    //console.log(operation, ".....", strkey);
    if (operation === "add") {
      if (arrAddedVariables.indexOf(strkey) === -1) {
        arrAddedVariables.push(strkey);
      } else {
        console.log("already added");
      }

      const removedIndex = arrRemovedVariables.indexOf(strkey);
      if (removedIndex > -1) {
        arrRemovedVariables.splice(removedIndex, 1);
      }
    } else if (operation === "remove") {
      if (arrRemovedVariables.indexOf(strkey) === -1) {
        arrRemovedVariables.push(strkey);
      } else {
        console.log("already there in removed");
      }

      const addIndex = arrAddedVariables.indexOf(strkey);
      if (addIndex > -1) {
        arrAddedVariables.splice(addIndex, 1);
      }
    } else if (operation === "edit") {
      if (arrAddedVariables.indexOf(strkey) === -1) {
        arrAddedVariables.push(strkey);
      } else {
        console.log("edit, already added");
      }

      const editKey = this.state.variableData_toUpdate["key"];
      if (arrRemovedVariables.indexOf(editKey) === -1) {
        arrRemovedVariables.push(editKey);
      } else {
        console.log("edit, already there in removed");
      }
    }
  }

  /////////////////////////////////////////

  updateProjectData() {
    const projectdata = this.props.appData;
    this.fetchContributorsData().then((result) => {
      //console.log("handlePreviewClick >>>>>", result);
      if (result.response !== "ACK") {
        var _err = { message: result.error };
        console.log("project_contributors NotACK >>", _err);
      } else {
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
              const selectedTabModule = this.props["contributorTabs"];
              if (selectedTabModule && selectedTabModule.length > 0) {
                if (selectedTabModule[0] !== "none") {
                  const _msg =
                    "Contributor's selected pages already released. Thereafter changes will be discarded during merge.";
                  this.setState({ alertmessage: _msg });
                  this.setState({ openAlert: true });
                }
              }
            }
          }
          projectdata["Contributors"] = result["Contributors"];
          this.saveProjectData();
        }
      }
    });
  }

  saveProjectData() {
    const projectdata = this.props.appData;
    //this.props.dispatch(setProjectData(this.props.appData));
    projectdata.isPreview = "1";
    projectdata.isPublish = "0";

    var formData = new FormData();
    formData.append("command", "projectupdate");
    formData.append("userid", this.props.appconfig.userid);
    formData.append("sessionid", this.props.appconfig.sessionid);
    formData.append("projectid", this.props.appconfig.projectid);

    var prjctData = encodeURIComponent(JSON.stringify(projectdata));
    let text = new File([prjctData], "updateProject.txt", {
      type: "text/plain",
    });
    formData.append("file", text);

    fetch(this.props.appconfig.apiURL + "multipartservice.json", {
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
            //setSessionError(true);
          }

          var _err = { message: result.error };
          this.setState({ alertmessage: _err["message"] });
          this.setState({ openAlert: true });
        } else {
          //props.onProjectUpdateSuccess(result.project);
          let _projectData = result.project;
          _projectData["isPreview"] = "0";
          this.props.dispatch(setProjectData(_projectData));
        }
      })
      .catch((error) => {
        this.setState({
          alertmessage:
            "Something went wrong. Please check Server/Internet connection.",
        });
        this.setState({ openAlert: true });
      });
  }

  fetchContributorsData() {
    let _fetchContributorsData =
      this.props.appconfig.apiURL +
      "project_contributors.json?project_id=" +
      this.props.appconfig.projectid;
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

  render() {
    const { show, appVariables, confirmalert, alertmessage } = this.state;
    const displayUpdate = !this.state.disableUpdate ? "" : "none";

    if (!show) {
      return null;
    }

    return (
      <div className="vertical-align">
        {!this.state.addvariable && (
          <div
            className="horizontal-align"
            style={{ alignItems: "flex-start", background: "white" }}
          >
            <Box
              id="variableList"
              className="box"
              style={{
                minHeight: 50,
                maxHeight: 500,
                overflow: "hidden",
                justifyContent: "center",
              }}
            >
              {appVariables.length > 0 && (
                <List
                  component="nav"
                  dense={true}
                  style={{ overflow: "auto", width: "100%" }}
                >
                  {appVariables.map((item, index) => (
                    <ListItem button key={index}>
                      <ListItemText primary={item.key + " : " + item.value} />
                      <ListItemSecondaryAction
                        style={{ display: displayUpdate }}
                      >
                        <IconButton
                          edge="end"
                          aria-label="Edit"
                          data-index={index}
                          data-key={item.key}
                          onClick={this.handleEditVariable}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="Delete"
                          data-index={index}
                          data-key={item.key}
                          onClick={this.handleDeleteVariable}
                        >
                          <Delete />
                        </IconButton>
                        {this.state.deletevariable && (
                          <AlertWindow
                            open={true}
                            title=""
                            message={confirmalert}
                            ok="Yes"
                            okclick={this.handleDeleteVariableOk}
                            cancel="No"
                            cancelclick={this.handleDeleteVariableCancel}
                          />
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
              {appVariables.length === 0 && <h6>No variables yet.</h6>}
            </Box>
            <Fab
              color="default"
              size="small"
              aria-label="Add"
              style={{ display: displayUpdate }}
            >
              <Add onClick={this.handleAddVariable} />
            </Fab>
          </div>
        )}
        {this.state.addvariable && (
          <Box className="box" style={{ overflow: "hidden", height: 320 }}>
            <h4 className="app-variable-help-txt">
              1. 'Key' should be unique across all variables.
              <br />
              2. For 'Key' text, only alphabets and numbers allowed
              <br />
              3. Reserved 'Key' should not be mentioned.
              <IconButton
                edge="end"
                color="inherit"
                style={{ padding: 2, marginLeft: 20 }}
                onClick={this.handleGlobalKeyListOpen.bind(this)}
              >
                <Help />
              </IconButton>
            </h4>
            {this.state.showGlobalKeys && (
              <Popover
                id="view-popover"
                style={{ overflow: "hidden" }}
                open={true}
                anchorEl={this.state.popupGlobalKeys}
                onClose={this.handleGlobalKeyListClose.bind(this)}
                anchorOrigin={{ vertical: "center", horizontal: "right" }}
                transformOrigin={{ vertical: "center", horizontal: "left" }}
              >
                {this.state.globalKeys.map((value, index) => (
                  <h4
                    key={index}
                    style={{
                      fontSize: "0.75rem",
                      borderBottom: "1px solid",
                      padding: "2px 8px",
                    }}
                  >
                    {value}
                  </h4>
                ))}
              </Popover>
            )}
            <div
              className="vertical-align"
              style={{ justifyContent: "space-around", background: "white" }}
            >
              <TextField
                id="var-key"
                label="Key"
                value={this.state.key}
                autoComplete="off"
                required
                autoFocus
                variant="outlined"
                margin="normal"
                InputLabelProps={{ shrink: true }}
                onChange={this.handleChange("key")}
              />
              <TextField
                id="var-value"
                label="Value"
                value={this.state.value}
                autoComplete="off"
                variant="outlined"
                margin="normal"
                InputLabelProps={{ shrink: true }}
                onChange={this.handleChange("value")}
              />
              <div className="hrline" style={{ width: "100%" }} />
              <div
                style={{
                  width: "100%",
                  height: 48,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {this.state.editvariable && (
                  <button
                    className="app-variable-btn"
                    onClick={this.handleEditVariableUpdate}
                  >
                    Update
                  </button>
                )}
                {!this.state.editvariable && (
                  <button
                    className="app-variable-btn"
                    onClick={this.handleAddVariableSave}
                  >
                    Save
                  </button>
                )}
                <button
                  className="app-variable-btn"
                  onClick={this.handleAddVariableCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Box>
        )}
        <Snackbar
          open={this.state.openAlert}
          message={alertmessage}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          autoHideDuration={4000}
          onClose={this.handleCloseAlert.bind(this)}
          action={
            <React.Fragment>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={this.handleCloseAlert.bind(this)}
              >
                <Close fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </div>
    );
  }
}

AppVariableEditor.propTypes = {
  show: PropTypes.bool,
  children: PropTypes.node,
};

function mapStateToProps(state) {
  return {
    apiParam: state.appParam.params,
    appData: state.appData.data,
    openedPages: state.selectedData.pages,
    currentPage: state.selectedData.pagedata,
    currentUI: state.selectedData.uidata,
    contributorTabs: state.appData.contributortabs,
  };
}
export default connect(mapStateToProps)(AppVariableEditor);
