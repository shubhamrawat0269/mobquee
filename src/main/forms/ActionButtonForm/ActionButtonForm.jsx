import React from "react";
import "./ActionButtonFormStyle.css";
import ActionEditor from "../../editors/ActionEditor/actionEditor";
import { FormGroup } from "@mui/material";

class ActionButtonForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      actions: this.props.value,
      label: "Edit",
      popup: false,
    };

    this.openActionEditor = this.openActionEditor.bind(this);
    this.closeActionEditor = this.closeActionEditor.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.setState({ actions: this.props.value });
    }
  }

  openActionEditor() {
    this.setState({ popup: true });
  }

  updateActionValue(_key, _val) {
    console.log(".... updateActionValue >>>>", _key, _val);
    this.props.onValueChange(_val);
  }

  closeActionEditor(param, actions) {
    let actionData = this.state.actions;
    //console.log(param, this.props.source, this.props.config, "******* close actions *********", actionData, actions);
    if (param && param === "ok") {
      this.props.onActionApply(
        this.props.source,
        this.props.config,
        actionData
      );
    }

    this.setState({ popup: false });
  }

  render() {
    const { actions, label, popup } = this.state;
    const actionLen = actions ? actions.length : 0;
    const widval =
      this.props.btnsize && this.props.btnsize === "small" ? 64 : 143;
    const justify =
      this.props.btnsize && this.props.btnsize === "small"
        ? "space-between"
        : "center";

    return (
      <div id="actioneditor" className="action-editor-section">
        <FormGroup>
          <div className="action-editor-badge" onClick={this.openActionEditor}>
            <h4>{label}</h4>
            <div className="action-editor-chip">{actionLen}</div>
          </div>
        </FormGroup>
        {popup && (
          <ActionEditor
            data={actions}
            show={popup}
            onActionUpdate={this.updateActionValue.bind(this)}
            currentScreenIndex={this.props.currentScreenIndex}
            onCloseEditor={this.closeActionEditor}
          />
        )}
      </div>
    );
  }
}

export default ActionButtonForm;
