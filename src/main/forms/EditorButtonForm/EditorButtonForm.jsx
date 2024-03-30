import React from "react";
import "./EditorButtonFormStyle.css";
import { connect } from "react-redux";

import { setEditorParent } from "../../ServiceActions";
import UIContainer from "../../editors/UIContainer/UIContainer";
import { FormGroup } from "@mui/material";

class EditorButtonForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      uichildren: getUIChildren(
        this.props.value,
        this.props.config["popup"],
        this.props.currentScreenIndex
      ),
      label: "Count",
      popup: false,
    };

    this.openUIContainer = this.openUIContainer.bind(this);
    this.closeUIContainer = this.closeUIContainer.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.setState({ uichildren: this.props.value });
    }
  }

  openUIContainer() {
    let source;
    if (this.props.config.hasOwnProperty("source")) {
      source = this.props.config["source"];
    }

    if (source) {
      let _editorObj = { page: this.props.currentPage, ui: {}, source: source };
      if (
        source === "TileList" ||
        source === "overlay" ||
        source === "Dialog" ||
        source === "Drawer" ||
        source === "Form" ||
        source === "ExpansionPanel" ||
        source === "Grid" ||
        source === "SwipeableView"
      ) {
        _editorObj["ui"] = this.props.currentUI;
        // console.log(_editorObj["ui"]);
        if (
          source === "ExpansionPanel" ||
          source === "Form" ||
          source === "Grid" ||
          source === "SwipeableView"
        ) {
          _editorObj["index"] = this.props.value["id"]
            ? parseInt(this.props.value["id"])
            : 0;
        }
        this.props.dispatch(setEditorParent(_editorObj));
      }
      //console.log(this.props.config, ".... EditorButtonForm ....", _editorObj);
    }
    // console.log(this.props.config);
  }

  closeUIContainer() {
    this.setState({ popup: false });
  }

  render() {
    const { label, popup } = this.state;
    // console.log(this.props.config["source"]);
    let uichildren = this.state.uichildren ? this.state.uichildren : [];
    // console.log(uichildren);
    if (!Array.isArray(uichildren)) {
      if (this.props.config["fieldname"]) {
        const _fieldaname = this.props.config["fieldname"];

        if (this.props.config["popup"] === "gridCellEditor") {
          console.log("UI Children NOT filled", uichildren);
          uichildren = uichildren["columnList"][0][_fieldaname];
          console.log("UI Children filled", uichildren);
        } else {
          uichildren = uichildren[_fieldaname];
        }
      }
    }
    // console.log(label, "<<<< EditorButtonForm >>>>", uichildren);

    return (
      <section id="uieditor" className="editor-btn-section">
        <FormGroup className="editor-btn-context">
          <div
            className="editor-badge"
            style={{ width: "7rem" }}
            onClick={this.openUIContainer}
          >
            <h4>{label}</h4>
            <div className="editor-chip">{uichildren.length}</div>
          </div>
        </FormGroup>
        {popup && (
          <UIContainer
            data={uichildren}
            show={popup}
            onCloseEditor={this.closeUIContainer}
          />
        )}
      </section>
    );
  }
}

function getUIChildren(uiData, popup, scrIndex) {
  // console.log({ uiData, popup, scrIndex });
  let uiChildren = [];
  if (!uiData || uiData.length === 0) {
    return uiChildren;
  }

  switch (popup) {
    case "ToolBarEditor":
      uiChildren = uiData;
      break;
    case "CellEditor":
      uiChildren = uiData["Fields"];
      break;
    case "TableViewEditor":
      uiChildren = uiData[0].Group[0].rowarray[0]["Fields"];
      break;
    case "gridCellEditor":
      uiChildren = uiData["columnList"][0]["Fields"];
      break;
    default:
      uiChildren = uiData;
      break;
  }

  let _uiChildren = uiChildren.filter(function (uichilds) {
    let scrid = 0;
    if (popup === "CellEditor" || popup === "gridCellEditor") {
      scrid = scrIndex ? scrIndex : 0;
    }
    if (uichilds.uiParts[scrid]["_enabledOnScreen"]) {
      return true;
    }
    return false;
  });

  return _uiChildren;
}

function mapStateToProps(state) {
  return {
    apiParam: state.appParam.params,
    appData: state.appData.data,
    currentPage: state.selectedData.pagedata,
    currentUI: state.selectedData.uidata,
  };
}
export default connect(mapStateToProps)(EditorButtonForm);
