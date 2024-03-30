import React from "react";
import "./DropDownFormStyle.css";
import { connect } from "react-redux";
import { FormGroup, NativeSelect, InputBase } from "@mui/material";

class DropDownForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
      options: this.props.options,

      actions: this.props.dependentActions,
    };

    this.handleChangeValue = this.handleChangeValue.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    } else if (prevProps.options !== this.props.options) {
      this.setState({ options: this.props.options });
    }
  }

  handleChangeValue = (event) => {
    console.log(event.currentTarget.value);
    this.setState({ value: event.currentTarget.value });

    // below is a callback function of parent component which passed as properties
    // please note it must be passed, otherwise issues.
    this.props.onValueChange(event.currentTarget.value, this.state.actions);
  };

  render() {
    const options = this.props.options ? this.props.options : [];
    let value = this.state.value;
    const { text, field, sortable } = this.props;
    let optionList = [];
    if (text && field) {
      optionList = setOptions(options, text, field, sortable);
    } else {
      if (options) {
        optionList = sortable === "true" ? options.sort() : options;
      }
    }
    //console.log(value, text, field, options, "...ddl....", optionList);

    if (
      options.length === 1 &&
      typeof options[0] === "string" &&
      options[0].includes("func_")
    ) {
      //console.log(value, options, "...ddl >>>> ", optionList);
      optionList = [];
    } else {
      if (value === "") {
        if (text && field) {
          let index = options.findIndex((img) => img[field] === "");
          if (index === -1) {
            optionList.unshift({ text: "", field: "" });
          } else if (options[index][text] === "") {
            optionList.unshift({ text: "", field: "" });
          }
        } else {
          if (optionList.indexOf("") === -1) {
            optionList.unshift("");
          }
        }
      } else {
        //console.log(value, "...ddl....", optionList);
        if (text && field) {
          let index = optionList.findIndex((img) => img["field"] === value);
          if (index === -1) {
            value = "";
          } else if (optionList[index]["text"] === "") {
            value = "";
          }
          // if (value === "") {
          optionList.unshift({ text: "", field: "" });
          // }
        } else {
          if (optionList.indexOf(value) === -1) {
            value = "";
          }
          if (value === "" && optionList.indexOf("") === -1) {
            optionList.unshift("");
          }
        }
      }
    }

    return (
      <FormGroup>
        <NativeSelect
          value={value}
          // defaultValue={<h4>{value}</h4>}
          input={<InputBase className="drop-down-input" />}
          onChange={this.handleChangeValue}
        >
          {optionList.map((option, id) =>
            text && field ? (
              <option key={id} value={option.field}>
                {option.text}
              </option>
            ) : (
              <option key={id} value={option}>
                {option}
              </option>
            )
          )}
        </NativeSelect>
      </FormGroup>
    );
  }
}

function setOptions(options, text, field, sortable) {
  if (options === undefined) {
    return [];
  }

  if (text === "" && field === "") {
    if (options.length > 0) {
      if (sortable) {
        return options.sort();
      } else {
        return options;
      }
    }
    return options;
  } else {
    let arrOptions = [];
    for (let i = 0; i < options.length; i++) {
      const element = options[i];
      arrOptions.push({ text: element[text], field: element[field] });
    }
    return sortOptions_byText(arrOptions);
  }
}
function sortOptions_byText(options) {
  //console.log("sortOptions_byText....", options);
  if (!options) return [];

  options.sort(function (a, b) {
    return a.text > b.text ? 1 : -1;
  });
  return options;
}

//export default DropDownForm;
function mapStateToProps(state) {
  return {
    apiParam: state.appParam.params,
    appData: state.appData.data,
  };
}
export default connect(mapStateToProps)(DropDownForm);
