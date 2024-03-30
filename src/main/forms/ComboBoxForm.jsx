import React from "react";
import { FormGroup } from "@mui/material";

class ComboBoxForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
      options: this.props.options,
      placeholder: "",
      showOptions: true,

      actions: this.props.dependentActions,
    };

    this.handleChangeValue = this.handleChangeValue.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    } else if (prevProps.options !== this.props.options) {
      //console.log(prevProps.options, "!!!!!!!!!!!!===============", this.props.options);
      this.setState({ options: this.props.options });
    }
  }

  handleChangeValue = (event) => {
    if (event.target && event.target.tagName === "INPUT") {
      // need to give this event at input tag, since it is required. But we are handling onInput event for that.
      return;
    }
    //console.log("--handleChangeValue--", event.currentTarget.value);
    this.setState({ value: event.currentTarget.value });
    this.setState({ showOptions: false });

    // below is a callback function of parent component which passed as properties
    // please note it must be passed, otherwise issues.
    this.props.onValueChange(event.currentTarget.value, this.state.actions);
  };

  handleInputValue = (event) => {
    //console.log(this.state.value, "--handleInputValue--", event.currentTarget.value);

    this.setState({ value: event.currentTarget.value });
    this.props.onValueChange(event.currentTarget.value, this.state.actions);
  };

  handleMouseDown = (event) => {
    if (this.state.options && this.state.options.length > 0) {
      this.setState({ showOptions: true });
      this.setState({ placeholder: this.state.value });
      this.setState({ value: "" });
    }
  };
  handleFocus = (event) => {
    //this.setState({ showOptions: false});
    /* if(this.state.value === "" && this.state.placeholder !== "") {
      this.setState({ value: this.state.placeholder });
    } */

    //console.log("--handleFocus--", this.state.value);
    if (this.state.options && this.state.options.length > 0) {
      let optionList =
        this.props.text && this.props.field
          ? setOptions(this.state.options, this.props.text, this.props.field)
          : this.state.options
          ? this.state.options
          : [];
      const value = validateValue(this.state.value, optionList);
      this.props.onValueChange(value, this.state.actions);
    }
  };

  render() {
    //const { value, options } = this.state;
    //const showOptions = this.state.showOptions;
    const { text, field } = this.props;
    const options = this.state.options;
    let optionList =
      text && field
        ? setOptions(options, text, field)
        : options
        ? options.sort()
        : [];
    optionList = optionList.sort();
    let value = this.state.value ? this.state.value : "";

    //console.log(value, "********", text, field, options, "...cmb....", optionList);

    return (
      <FormGroup style={{ height: 32, marginTop: 4 }}>
        {/* {!showOptions &&
            <input name="editable" list="combobox" autoComplete="off"
                  style={{width:133, minHeight:22}} className="ComboBox"
                  value={value} onChange={this.handleChangeValue} 
                  onMouseDown={this.handleMouseDown.bind(this)} onBlur={this.handleFocus.bind(this)}/> 
          }
            <datalist id="combobox" style={{visibilty:'visible'}}>
              {optionList.map((option,id) =>
                <option key={id} value={option}>{option}</option>
              )}
            </datalist>
          {showOptions && 
            <Select open={true} variant="outlined" style={{position:'absolute', height:24, width:143, fontSize:14 }}
                    value={value} onChange={this.handleChangeValue} >
              {optionList.map((option,id) =>
                <option key={id} value={option}>{option}</option>
              )}
            </Select>
          } */}

        <div
          id="ComboBox"
          className="select-editable"
          style={{ width: 143, minHeight: 22 }}
        >
          <select value={value} onChange={this.handleChangeValue}>
            <option value=""></option>
            {optionList.map((option, id) => (
              <option key={id} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            name="editable"
            type="text"
            value={value}
            autoComplete="off"
            onChange={this.handleChangeValue}
            onInput={this.handleInputValue.bind(this)}
            onBlur={this.handleFocus.bind(this)}
          />
        </div>
      </FormGroup>
    );
  }
}

function setOptions(options, text, field) {
  if (options === undefined) {
    return [];
  }

  if (text === "" && field === "") {
    return options.sort();
  } else {
    let arrOptions = [];
    for (let i = 0; i < options.length; i++) {
      const element = options[i];
      arrOptions.push(element[text]);
    }
    return arrOptions;
  }
}

function validateValue(val, options) {
  if (val.indexOf("[") < 0 && val.indexOf("]") < 0) {
    let optionStr = options.join(",");
    if (optionStr.indexOf(val) < 0) {
      return "";
    }
  }
  return val;
}

export default ComboBoxForm;
