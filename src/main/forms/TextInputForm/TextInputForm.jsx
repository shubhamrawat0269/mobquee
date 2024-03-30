import React from "react";
import { connect } from "react-redux";
import "./TextInputFormStyle.css";
import { Tooltip } from "@mui/material";
import { setSelectedTab } from "../../ServiceActions";

class TextInputForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      input: this.props.value,

      validation: this.getValidations(this.props.config),
      showError: false,
      errorString: "",
      errorBoundary: "",

      isfocused: false,
      timeout: null,
    };

    this.handleChangeValue = this.handleChangeValue.bind(this);
    this.handleFocusOut = this.handleFocusOut.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.setState({ input: this.props.value });
      if (
        this.props.config["path"] === "Title" ||
        this.props.config["path"] === "name"
      ) {
        //console.log(this.props.config, ".. TextInputForm >>>", this.props.value);
        //this.validateInputValue(this.props.value);
      } else {
        this.validateInputValue(this.props.value);
      }
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
    clearTimeout(this.state.timeout);

    setTimeout(() => {
      this.props.dispatch(setSelectedTab(_val));
    }, 1000);

    let doValidation = false;
    let allowedChars;
    // if (
    //   this.props.config["path"] === "Title" ||
    //   this.props.config["path"] === "name"
    // ) {
    //   doValidation = true;
    //   allowedChars = /\w/g;
    // } else if (this.props.config["path"] === "moduleName") {
    //   doValidation = true;
    //   allowedChars = /[a-zA-Z0-9 ]/g;
    //   _val = _val.charAt(0).toUpperCase() + _val.slice(1);
    // }

    if (doValidation && _val.length > 0) {
      let allowedText = _val.match(allowedChars);
      if (!allowedText) {
        return;
      }
      if (allowedTitle && _val.length !== allowedTitle.length) {
        //_val = allowedTitle.join("");
        return;
      }
    }

    this.validateInputValue(_val);

    if (this.props.appData.hasOwnProperty("ProjectRole")) {
      const _projectRole = this.props.appData["ProjectRole"];
      const isTabPage =
        this.props.currentPage["parentid"] === "App" ? true : false;
      if (
        isTabPage &&
        _projectRole === "contributor" &&
        this.props.config["path"] === "Title"
      ) {
        return;
      }
    }

    this.setState({ input: _val });
    //this.props.onValueChange(_val);

    /* var self = this;
    const timeout1 = setTimeout(function () {
      console.log('Input Value:', _val);
      self.props.onValueChange(_val);
    }, 400); */
    //const timeout1 = setTimeout(this.doneTyping.bind(null, _val, this.props), 400);
    const timeout1 = setTimeout(this.doneTyping, 400, _val, this.props);
    this.setState({ timeout: timeout1 });
  };
  doneTyping(val, props) {
    //console.log(props, "....doneTyping >>>>", val);
    props.onValueChange(val);
  }

  handleFocusOut = (event) => {
    let _val = this.state.input;
    //console.log(_val, event.currentTarget.value, ".. handleFocusOut >>", this.props.config['path']);
    if (
      this.props.config["path"] === "Title" ||
      this.props.config["path"] === "name"
    ) {
      this.validateInputValue(_val);
    }
  };

  validateInputValue(value) {
    let validationArr = this.state.validation;
    //console.log(validationArr, ".. TextInputForm validateInputValue >>", value);

    let _errorStr = "";
    if (value) {
      if (value.length === 0) {
        if (validationArr.indexOf("RequiredValueValidator") > -1) {
          _errorStr = "Field is required";
        }
      } else {
        for (let i = 0; i < validationArr.length; i++) {
          const validator = validationArr[i];
          _errorStr = this.getValidationError(validator, value);
        }

        if (_errorStr.length === 0) {
          _errorStr = this.validateReservedValue(value);
        }
      }
    }
    if (_errorStr && _errorStr.length > 0) {
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

    //console.log(validator, " *** getValidationError *** ", value);
    switch (validator.toLowerCase()) {
      case "uniqpagetitlevalidator": {
        _validationError = "";

        let arrPageName = [];
        this.props.pageList.forEach((page) => {
          arrPageName.push(page["Title"]);
          /* let displayName = page['Title'];
          if(displayName === value) {
            _validationError = "Page name should be unique";
            this.props.onValidationError('uniqpagetitlevalidator', _validationError);
            return;
          } */
        });

        const pagesNoDuplicates = [...new Set(arrPageName)];
        if (pagesNoDuplicates.length !== arrPageName.length) {
          _validationError = "Page name should be unique";
          this.props.onValidationError(
            "uniqpagetitlevalidator",
            _validationError
          );
          return _validationError;
        }

        let titleError = false;
        const allowedChars = /\w/g;
        let allowedTitle = value.match(allowedChars);
        if (!allowedTitle) {
          titleError = true;
        }
        if (allowedTitle && value.length !== allowedTitle.length) {
          titleError = true;
        }

        if (titleError)
          _validationError = "Only alphabets, numbers & underscore allowed.";
        break;
      }
      case "uniquinamevalidator": {
        let _errorFound = false;
        _validationError = "";

        /* console.log(this.props.pageChildren, value, ".....uniquinamevalidator....", value);
        this.props.pageChildren.forEach(element => { 
          let uipart = element['uiParts'][0];
          let displayName = uipart.name;
          //console.log(this.props, value, ".....uniquinamevalidator....", displayName);
          if(displayName === value) {
            _errorFound = true;
            _validationError = "UIpart name should be unique";
            this.props.onValidationError('uniquinamevalidator', _validationError);
            return;
          }
        }); */

        let arrUIpartName = [];
        this.props.pageChildren.forEach((element) => {
          let uipart = element["uiParts"][0];
          arrUIpartName.push(uipart.name);
        });
        const uisNoDuplicates = [...new Set(arrUIpartName)];
        if (uisNoDuplicates.length !== arrUIpartName.length) {
          let _nameArr = arrUIpartName.filter(function (name) {
            return name === value;
          });
          if (_nameArr.length > 1) {
            _errorFound = true;
            _validationError = "UIpart name should be unique";
            this.props.onValidationError(
              "uniquinamevalidator",
              _validationError
            );
            return _validationError;
          }
        }
        if (_errorFound) {
          this.props.onValidationError("uniquinamevalidator", "");
        }

        const allowedChars = /\w/g;
        let allowedName = value.match(allowedChars);
        if (value.length !== allowedName.length)
          _validationError = "Only alphabets, numbers & underscore allowed.";
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
        //console.log(value.match(where_RegExp), "*** whereclausevalidator ***", where_RegExp.test(value));
        if (where_RegExp.test(value)) {
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
        //console.log(validInput_RegExp.test(value), "*** numfieldvalidator ***", value.match(validInput_RegExp))
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

  validateReservedValue(inputVal) {
    if (
      this.props.config["path"] === "Title" ||
      this.props.config["path"] === "name"
    ) {
      const reservedValues = ["Title", "name", "page", "id", "field", "value"];
      let index = reservedValues.indexOf(inputVal);
      if (index > -1) {
        return "This value not allowed to set.";
      }
    }
    return "";
  }

  render() {
    const { input, errorString, showError, errorBoundary, maxlength } =
      this.state;
    const textVal = input === undefined || input === null ? "" : input;

    return (
      <Tooltip title={errorString} open={showError} placement="left-start">
        <div>
          <input
            type="text"
            value={textVal}
            maxlength={maxlength}
            style={{ border: errorBoundary }}
            className="text-input-frm"
            onChange={this.handleChangeValue}
            onBlur={this.handleFocusOut}
          />
          {/* <TextField
            value={textVal}
            margin="dense"
            variant="outlined"
            className="text-input-frm"
            style={{ border: errorBoundary, borderRadius: 4 }}
            onChange={this.handleChangeValue}
            onBlur={this.handleFocusOut}
          /> */}
        </div>
      </Tooltip>
    );
  }
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
  return "Invalid Value";
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
  return "";
}

//export default TextInputForm;
function mapStateToProps(state) {
  return {
    apiParam: state.appParam.params,
    appData: state.appData.data,
    pageList: state.appData.pagelist,
    currentPage: state.selectedData.pagedata,
    currentUI: state.selectedData.uidata,
    targetEditor: state.selectedData.editor,
  };
}
export default connect(mapStateToProps)(TextInputForm);
