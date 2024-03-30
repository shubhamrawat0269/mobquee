import React from "react";
import "./DisplayFormatFormStyle.css";
import { Tooltip, FormGroup, NativeSelect, InputBase } from "@mui/material";
class DisplayFormatForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
      format: this.props.config["displayFormat"],

      actions: this.props.dependentActions,
      validation: this.getValidations(this.props.config),
      showError: false,
      errorString: "",
      errorBoundary: "",
    };

    this.handleChangeValue = this.handleChangeValue.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  getValidations(configObj) {
    let _validations = [];
    if (configObj["validations"]) {
      _validations = configObj["validations"];
    } else {
      if (configObj["validator"]) {
        _validations.push(configObj["validator"]);
      }
    }

    return _validations;
  }

  handleChangeValue = (event) => {
    let _val = event.currentTarget.value;
    this.setState({ value: _val });

    if (this.state.format === "NumberFormat") {
      const _nval = this.getNumberformatValue(_val);
      this.props.onValueChange(_nval, this.state.actions);
      console.log(
        event.currentTarget.value,
        "handleChangeValue >>",
        _val,
        _nval
      );
    } else {
      //this.validateInputValue(_val);

      this.props.onValueChange(_val, this.state.actions);
    }
  };

  getNumberformatValue(value) {
    let arrOptions = [
      { label: "1 or 0", value: "d" },
      { label: "true or false", value: "t" },
      { label: "yes or no", value: "y" },
      { label: "integer", value: "d" },
      { label: "binary", value: "b" },
      { label: "octal", value: "o" },
      { label: "hexadecimal", value: "x" },
      { label: "float", value: "f" },
      { label: "exponential", value: "e" },
    ];

    let formatValue = arrOptions.filter(function (option) {
      if (option["label"] === value) {
        return true;
      }
      return false;
    });
    if (formatValue.length > 0) {
      return formatValue[0]["value"];
    }

    return value;
  }

  validateInputValue(value) {
    let validationArr = this.state.validation;

    let _errorStr = "";
    if (value.length === 0) {
      if (validationArr.indexOf("RequiredValueValidator") > -1) {
        _errorStr = "Field is required";
      }
    } else {
      for (let i = 0; i < validationArr.length; i++) {
        const validator = validationArr[i];
        _errorStr = this.getValidationError(validator, value);
      }
    }

    if (_errorStr.length > 0) {
      this.setState({ showError: true });
      this.setState({ errorString: _errorStr });
      this.setState({ errorBoundary: "1px solid red" });
    } else {
      this.setState({ showError: false });
      this.setState({ errorString: "" });
      this.setState({ errorBoundary: "" });
    }
  }

  getValidationError(validator, value) {
    let _validationError = "";

    switch (validator.toLowerCase()) {
      case "uniqpagetitlevalidator": {
        _validationError = "";
        break;
      }
      case "uniquimamevalidator": {
        _validationError = "";
        break;
      }
      case "emptydisplaytext": {
        if (value.length === 0) {
          _validationError = "Set the 'fieldname' value";
        }
        break;
      }
      case "whereclausevalidator": {
        let where_RegExp = /"([^"]*)/; // checks for double quotes
        let obj_exec = where_RegExp.exec(value);
        let bln_test = where_RegExp.test(value);
        if (!obj_exec || !bln_test) {
          _validationError = "Double quotes not allowed";
        }
        break;
      }
      case "urlvalidator": {
        let validURL_RegExp =
          /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
        let obj_exec = validURL_RegExp.exec(value);
        let bln_test = validURL_RegExp.test(value);
        if (!obj_exec || !bln_test) {
          _validationError = "Invalid URL format";
        }
        break;
      }
      case "addressvalidator": {
        _validationError = addressValidation(value);
        break;
      }
      case "numfieldvalidator": {
        var validInput_RegExp = /^[^a-zBD-TV-Z#]+$/;
        if (!validInput_RegExp.test(value)) {
          _validationError = "Not allowed characters found";
        }
        break;
      }
      case "datetimeformatvalidator": {
        _validationError = datetimeformatValidation(value);
        break;
      }
      default:
        _validationError = "";
        break;
    }

    return _validationError;
  }

  render() {
    const { format, errorString, showError } = this.state;
    const optionList =
      this.props.options && this.props.options.length > 0
        ? this.props.options
        : setOptions(format);
    const _value =
      this.state.value === null
        ? ""
        : setNumberformatValue(this.state.value, optionList);
    //console.log(optionList, "... InputFormatForm ...", _value, this.state.value);

    return (
      <Tooltip
        className="displapy-fromat-tooltip"
        title={errorString}
        open={showError}
        placement="left-start"
      >
        <FormGroup style={{ height: 32, marginTop: 4 }}>
          <NativeSelect
            value={_value}
            input={<InputBase className="display-format-dropdwn-input" />}
            onChange={this.handleChangeValue}
          >
            {optionList.map((option, id) => (
              <option key={id} value={option}>
                {option}
              </option>
            ))}
          </NativeSelect>
        </FormGroup>
      </Tooltip>
    );
  }
}

function setNumberformatValue(value, optionList) {
  let arrOptions = [
    { label: "1 or 0", value: "d" },
    { label: "true or false", value: "t" },
    { label: "yes or no", value: "y" },
    { label: "integer", value: "d" },
    { label: "binary", value: "b" },
    { label: "octal", value: "o" },
    { label: "hexadecimal", value: "x" },
    { label: "float", value: "f" },
    { label: "exponential", value: "e" },
  ];

  let formatValue = arrOptions.filter(function (option) {
    if (option["value"] === value) {
      return true;
    }
    return false;
  });
  if (formatValue.length > 0) {
    const _val = formatValue[0]["label"];

    /* if(optionList.length > 0) {
      const index = optionList.findIndex(element => element === _val);
      if(index === -1) {
        return optionList[0];
      }
    } */

    return _val;
  }

  return value;
}

function setOptions(field) {
  if (field === undefined || field === "") {
    return [];
  }

  let arrOptions = [];
  switch (field) {
    case "DateTimeFormat": {
      arrOptions = [
        "FullDayTime",
        "LongDayTime",
        "MiddleDayTime",
        "ShortDayTime",
        "FullDay",
        "LongDay",
        "MiddleDay",
        "ShortDay",
        "FullTime",
        "LongTime",
        "MiddleTime",
        "ShortTime",
        "Custom",
      ];
      break;
    }
    case "NumberFormat": {
      arrOptions = [
        "1 or 0",
        "true or false",
        "yes or no",
        "integer",
        "binary",
        "octal",
        "hexadecimal",
        "float",
        "exponential",
      ];
      break;
    }
    case "TextFormat": {
      arrOptions = ["#", "9", "Z", ",", ".", "-", ""];
      break;
    }
    default:
      arrOptions = [];
      break;
  }
  return arrOptions;
}

function addressValidation(addressString) {
  const invalidChars_forAddress = [
    "`",
    "~",
    "!",
    "$",
    "%",
    "^",
    "*",
    "(",
    ")",
    "+",
    "=",
    "{",
    "}",
    ";",
    "?",
  ];

  if (addressString.length > 0) {
    let arrAddress = addressString.split("");
    for (var i = 0; i < arrAddress.length; i++) {
      var charAddress = arrAddress[i];
      if (invalidChars_forAddress.indexOf(charAddress) > -1) {
        return charAddress + " not allowed";
      }
    }

    const validAddress_RegExp = /[\w @#&:"',<>./-]/g;
    let obj_exec = validAddress_RegExp.exec(addressString);
    let bln_test = validAddress_RegExp.test(addressString);
    if (!obj_exec || !bln_test) {
      return "Invalid character found";
    }
  }
}

function datetimeformatValidation(datetimeString) {
  if (datetimeString === "[" || datetimeString === "]") {
    return "Invalid value";
  }

  if (datetimeString.indexOf("[") > -1 && datetimeString.indexOf("]") > -1) {
    if (datetimeString.indexOf("]") !== datetimeString.length - 1) {
      return "Invalid reference";
    }

    let reference = datetimeString.substring(
      datetimeString.indexOf("[") + 1,
      datetimeString.indexOf("]")
    );
    if (reference.length === 0) {
      return "Invalid reference";
    }
  }
}

export default DisplayFormatForm;
