import React from "react";
import "./RadioFormStyle.css";
import { FormControlLabel, FormGroup, Radio, RadioGroup } from "@mui/material";

class RadioForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      groupname: this.props.groupname,
      value: this.props.value,
      options: this.props.options,
      direction: this.props.direction,
      propPath: this.props.propPath,
    };

    this.handleChangeValue = this.handleChangeValue.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  handleChangeValue = (event) => {
    // console.log(event.currentTarget.value);
    this.setState({ value: event.currentTarget.value });

    // below is a callback function of parent component which passed as properties
    // please note it must be passed, otherwise issues.
    this.props.onValueChange(event.currentTarget.value);
  };

  render() {
    const { groupname, value, direction, propPath } = this.state;
    const options = this.props.options;

    return (
      <FormGroup className="radio-frm-section">
        <RadioGroup
          name={groupname}
          value={value}
          onChange={this.handleChangeValue}
          className={
            direction.includes(propPath)
              ? "radio-btn direction-flex-prop"
              : "radio-btn"
          }
        >
          {setOptions(options).map((option, id) => (
            <FormControlLabel
              key={id}
              value={option}
              label={<h6>{option}</h6>}
              control={<StyledRadio />}
            />
          ))}
        </RadioGroup>
      </FormGroup>
    );
  }
}

function StyledRadio(props) {
  return <Radio disableRipple className="" color="default" {...props} />;
}

function setOptions(options) {
  if (options === undefined) {
    return [];
  }
  return options;
}

export default RadioForm;
