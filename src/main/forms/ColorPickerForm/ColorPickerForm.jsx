import React from "react";
import "./ColorPickerFormStyle.css";
import { FormGroup, Tooltip } from "@mui/material";

class ColorPickerForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: getColorValue(this.props.value),

      showError: false,
      errorString: "",
      errorBoundary: "",
    };

    this.handleChangeValue = this.handleChangeValue.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: getColorValue(this.props.value) });
    }
  }

  handleChangeValue = (event) => {
    //this.setState({ value: event.currentTarget.value });
    // below is a callback function of parent component which passed as properties
    // please note it must be passed, otherwise issues.
    //this.props.onValueChange(event.currentTarget.value);
  };

  handleUpdateValue = (event) => {
    this.setState({ value: event.currentTarget.value });
    if (this.props["propkey"]) {
      this.props.onValueChange(
        event.currentTarget.value,
        this.props["propkey"]
      );
    } else {
      this.props.onValueChange(event.currentTarget.value);
    }
  };

  handleInputValue = (event) => {
    let _val = event.currentTarget.value;
    const regextest = /^[0-9A-F]{6}$/i.test(_val);
    if (_val.length > 6) {
      _val = _val.substr(0, 6);
    }
    //console.log(_val, "... ColorInput ....handleInputValue", regextest);
    const colorval = "#" + _val;
    this.setState({ value: colorval });

    this.setState({ showError: false });
    this.setState({ errorString: "" });
    this.setState({ errorBoundary: "" });

    if (regextest && _val.length === 6) {
      if (this.props["propkey"]) {
        this.props.onValueChange(colorval, this.props["propkey"]);
      } else {
        this.props.onValueChange(colorval);
      }
    } else {
      //console.log("Invalid color code.............");
      this.setState({ showError: true });
      this.setState({ errorString: "Invalid color code" });
      this.setState({ errorBoundary: "1px solid red" });
    }
  };

  render() {
    const { value, errorString, showError, errorBoundary } = this.state;
    const hexval = value.replace("#", "").toUpperCase();

    return (
      <FormGroup
        style={{ flexDirection: "row", position: "relative", width: "10rem" }}
        spellCheck="false"
      >
        <input
          type="color"
          className="color-input"
          value={value}
          onChange={this.handleChangeValue}
          onInput={this.handleUpdateValue.bind(this)}
        />
        <div className="color-bg"></div>
        <Tooltip
          title={<h6 className="red">{errorString}</h6>}
          open={showError}
          placement="left-start"
        >
          <input
            className="color-hex-value"
            required
            type="text"
            value={hexval}
            inputProps={{ maxLength: 6 }}
            style={{ border: errorBoundary }}
            onChange={this.handleInputValue.bind(this)}
          />

          {/* </input> */}
        </Tooltip>
      </FormGroup>
    );
  }
}

function getColorValue(colorObj) {
  if (colorObj) {
    let _red = parseInt(colorObj.red * 255); //Math.ceil(colorObj.red * 255);
    let _green = parseInt(colorObj.green * 255); //Math.ceil(colorObj.green * 255);
    let _blue = parseInt(colorObj.blue * 255); //Math.ceil(colorObj.blue * 255);
    //console.log("color code >>", "rgb(" + _red +','+ _green +','+ _blue + ")");

    return fullColorHex(_red, _green, _blue);
  } else {
    return fullColorHex(0, 0, 0);
  }
}
function fullColorHex(r, g, b) {
  var red = rgbToHex(r);
  var green = rgbToHex(g);
  var blue = rgbToHex(b);
  return "#" + red + green + blue;
}
var rgbToHex = function (rgb) {
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
};

export default ColorPickerForm;
