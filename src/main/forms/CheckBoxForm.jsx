import React from "react";
import { Checkbox } from "@mui/material";

class CheckBoxForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      //checked: this.props.value,
      value: this.props.value,
      label: this.props.label,

      actions: this.props.dependentActions,
    };

    this.handleChangeValue = this.handleChangeValue.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    //console.log(this.props.path, ".. CheckBoxForm ...", prevProps.label, this.props.label, "&&", prevProps.value, this.props.value) ;
    if (prevProps.label !== this.props.label) {
      //this.setState({ checked: this.props.value });
      this.setState({ value: this.props.value });
      this.setState({ label: this.props.label });
    }
  }

  handleChangeValue = (event) => {
    let updatedValue = Boolean(event.currentTarget.checked);
    this.setState({ value: updatedValue });

    // below is a callback function of parent component which passed as properties
    // please note it must be passed, otherwise issues.
    if (this.props.source && this.props.source === "enableui") {
      this.props.onValueChange(updatedValue, this.props.dependentActions);
    } else {
      this.props.onValueChange(updatedValue, this.state.actions);
    }
  };

  render() {
    const selected = Boolean(this.props.value);

    return (
      <Checkbox
        disableRipple
        color="default"
        checked={selected}
        onChange={this.handleChangeValue}
      />
    );
  }
}

export default CheckBoxForm;
