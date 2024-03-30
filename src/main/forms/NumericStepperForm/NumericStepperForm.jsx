import React from "react";
import { connect } from "react-redux";
import "./NumericStepperFormStyle.css";
import { FormGroup, Tooltip } from "@mui/material";

class NumericStepperForm extends React.Component {
  constructor(props) {
    super(props);
    // console.log("Numeric Stepper", props);
    this.state = {
      value: this.props.value,
      //min: this.props.min,
      //max: this.props.max,
      //step: this.props.step,

      showError: false,
      errorString: "",
      errorBoundary: "",
      isfocused: false,
    };

    this.handleChangeValue = this.handleChangeValue.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  // handleArrowKeyPress = (e) => {
  //   let _val = parseFloat(e.currentTarget.value);

  //   if (this.props.path === "dataarray[0].columns") {
  //     if (e.keyCode == "38") {
  //       this.props.dispatch(setColList({ id: _val, value: 50 }));
  //     }
  //     if (e.keyCode == "40") {
  //       if (_val !== 1) this.props.dispatch(resetColList({ id: _val - 1 }));
  //     }
  //   }
  // };

  handleChangeValue = (event) => {
    this.setState({ showError: false });
    this.setState({ errorString: "" });
    this.setState({ errorBoundary: "" });

    let _val = parseFloat(event.currentTarget.value);

    if (this.props.path === "gridItems[*].columns") {
    }

    const rangeObj = {
      min: parseFloat(this.props.min),
      max: parseFloat(this.props.max),
    }; //getFormRange(this.props);
    //console.log(this.props, "..handleChangeValue >>>>", rangeObj, _val);

    if (isNaN(_val)) {
      _val = parseFloat(this.props.min);
    }
    //console.log(this.props.value, "..handleChangeValue >>>>", _val);

    if (this.props.path === "Children[0].Group.length") {
      const _currentPage = this.props.currentPage;
      if (_currentPage) {
        let currGroup = _currentPage.Children[0].Group;
        let groupLen = currGroup.length;
        if (groupLen < _val) {
          const groupObj = {
            _uid: "",
            grouptype: "default",
            recordListFormat: "",
            editable: false,
            flexibleHeight: false,
            caching: false,
            cachingmode: "",
            Title: "",
            Footer: "",
            ServiceName: "",
            tablename: "",
            where: "",
            sort: "",
            Groupby: "",
            idFieldName: "group 0",
            dataFieldName: "",
            RecordCells: [],
            rowarray: [
              {
                name: "",
                Title: "",
                CellStyle: "default",
                accessoryType: "indicator",
                editingAccessoryType: "indicator",
                selectionStyle: "blue",
                editable: true,
                movable: true,
                height: 50,
                backgroundColor: {
                  alpha: 1,
                  red: 1,
                  green: 1,
                  blue: 1,
                  colorName: "",
                },
                wireframeUnvisible: false,
                wireframe: {
                  srcLocation: "bundle",
                  filename: "",
                  fileext: "",
                  url: "",
                  imageName: "",
                  author: "",
                  copyright: "",
                },
                rowBGImageRepeat: false,
                alternatingRowStyle: false,
                alternatingRowColors1: {
                  alpha: 1,
                  red: 1,
                  green: 1,
                  blue: 1,
                  colorName: "",
                },
                alternatingRowColors2: {
                  alpha: 1,
                  red: 1,
                  green: 1,
                  blue: 1,
                  colorName: "",
                },
                alternatingRowImages1: {
                  srcLocation: "bundle",
                  filename: "",
                  fileext: "",
                  url: "",
                  imageName: "",
                  author: "",
                  copyright: "",
                },
                alternatingRowImages2: {
                  srcLocation: "bundle",
                  filename: "",
                  fileext: "",
                  url: "",
                  imageName: "",
                  author: "",
                  copyright: "",
                },
                fieldname: "",
                mainText: "",
                detailText: "",
                mainImage: {
                  srcLocation: "bundle",
                  filename: "",
                  fileext: "",
                  url: "",
                  imageName: "",
                  author: "",
                  copyright: "",
                },
                Fields: [],
                gridFields: [],
                tabularGridFields: [],
                actions: {
                  didUpdateValue: [],
                  accessoryButtonTappedForRowWithIndexPath: [],
                  didSelectRowAtIndexPath: [],
                  flickRL: [],
                  flickLR: [],
                },
              },
            ],
            RecordCellDef: {
              name: "",
              Title: "",
              CellStyle: "default",
              accessoryType: "indicator",
              editingAccessoryType: "indicator",
              selectionStyle: "blue",
              editable: true,
              movable: true,
              height: 50,
              backgroundColor: {
                alpha: 1,
                red: 1,
                green: 1,
                blue: 1,
                colorName: "",
              },
              wireframeUnvisible: false,
              wireframe: {
                srcLocation: "bundle",
                filename: "",
                fileext: "",
                url: "",
                imageName: "",
                author: "",
                copyright: "",
              },
              rowBGImageRepeat: false,
              alternatingRowStyle: false,
              alternatingRowColors1: {
                alpha: 1,
                red: 1,
                green: 1,
                blue: 1,
                colorName: "",
              },
              alternatingRowColors2: {
                alpha: 1,
                red: 1,
                green: 1,
                blue: 1,
                colorName: "",
              },
              alternatingRowImages1: {
                srcLocation: "bundle",
                filename: "",
                fileext: "",
                url: "",
                imageName: "",
                author: "",
                copyright: "",
              },
              alternatingRowImages2: {
                srcLocation: "bundle",
                filename: "",
                fileext: "",
                url: "",
                imageName: "",
                author: "",
                copyright: "",
              },
              fieldname: "",
              mainText: "",
              detailText: "",
              mainImage: {
                srcLocation: "bundle",
                filename: "",
                fileext: "",
                url: "",
                imageName: "",
                author: "",
                copyright: "",
              },
              Fields: [],
              gridFields: [],
              tabularGridFields: [],
              actions: {
                didUpdateValue: [],
                accessoryButtonTappedForRowWithIndexPath: [],
                didSelectRowAtIndexPath: [],
                flickRL: [],
                flickLR: [],
              },
            },
          };
          currGroup.push(groupObj);
        } else {
          currGroup.splice(0, 1);
        }
      }
    } else if (this.props.path === "panelItems[*].id") {
      const _currentUI = this.props.currentUI;
      if (_currentUI && _currentUI.hasOwnProperty("panelItems")) {
        let arrPanels = JSON.parse(JSON.stringify(_currentUI["panelItems"]));
        if (arrPanels.length > _val) {
          let oldPanelObj = arrPanels[this.props.value];
          let newPanelObj = arrPanels[_val];

          //console.log(oldPanelObj, "**********", newPanelObj);
          if (oldPanelObj && newPanelObj) {
            oldPanelObj["id"] = _val;
            newPanelObj["id"] = this.props.value;

            arrPanels[_val] = oldPanelObj;
            arrPanels[this.props.value] = newPanelObj;
          }
        }
        //console.log("**********", _currentUI['panelItems']);
        _currentUI["panelItems"] = arrPanels;
      }
    }

    if (_val > parseFloat(rangeObj.max)) {
      _val = parseFloat(rangeObj.max);
    } else if (_val < parseFloat(this.props.min)) {
      //_val = parseFloat(this.props.min);
      this.setState({ showError: true });
      this.setState({
        errorString: "Input is less than allowed minimum value.",
      });
      this.setState({ errorBoundary: "1px solid red" });
    } else {
      _val = parseFloat(_val);
    }

    if (_val.length === 0) {
      this.setState({ showError: true });
      this.setState({ errorString: "Invalid input" });
      this.setState({ errorBoundary: "1px solid red" });
    }
    /* else {
     this.setState({ showError: false });
      this.setState({ errorString: "" });
      this.setState({ errorBoundary: "" });
    } */

    this.setState({ value: _val });
    if (this.props["propkey"]) {
      this.props.onValueChange(_val, this.props["propkey"]);
    } else {
      // console.log("Val:", _val);
      this.props.onValueChange(_val);
    }
  };

  handleFocusOut = (event) => {
    if (this.state.showError) {
      this.setState({ showError: false });
      this.setState({ errorString: "" });
      this.setState({ errorBoundary: "" });
    }

    //const rangeObj = getFormRange(this.props);
    //console.log(this.state.value, "..handleFocusOut >>>>", rangeObj);

    let wasInvalid = false;
    let _val = this.state.value;
    if (_val === "") {
      _val = this.props.min;
      wasInvalid = true;
    } else {
      if (_val > parseFloat(this.props.max)) {
        _val = this.props.max;
        wasInvalid = true;
      } else if (_val < parseFloat(this.props.min)) {
        _val = this.props.min;
        wasInvalid = true;
      }
    }

    if (wasInvalid) {
      this.setState({ value: _val });
      if (_val.toString().indexOf("-") > -1) {
        _val = _val.replace("-", "");
        this.setState({ value: _val });
      }

      if (this.props["propkey"]) {
        this.props.onValueChange(_val, this.props["propkey"]);
      } else {
        this.props.onValueChange(_val);
      }
    }
  };

  render() {
    const { min, max, step, path, source, addedRowsList, data } = this.props;
    const { errorString, showError, errorBoundary } = this.state;
    let value = this.state.value ? parseFloat(this.state.value) : 0;
    value = isNaN(value) ? 0 : value;
    let fixIndex = 0;
    let fixIndexList = addedRowsList.filter((cur) => {
      if (cur.heading === data) return cur;
    });
    if (fixIndexList.length > 0) {
      fixIndex = fixIndexList[0]["columns"];
      // console.log(fixIndex);
    }
    return (
      <>
        <Tooltip
          className="numeric-stepper-frm"
          title={errorString}
          open={showError}
          placement="left-start"
        >
          <FormGroup>
            <input
              id="numinput"
              style={{
                width: source === "nestedColumn" ? 50 : 120,
                minHeight: 22,
                border: errorBoundary,
              }}
              type="number"
              value={value}
              min={min}
              // max={max}
              max={path === "gridItems[*].indexOfColumn" ? fixIndex : max}
              step={step}
              // onKeyDown={this.handleArrowKeyPress}
              onChange={this.handleChangeValue}
              onBlur={this.handleFocusOut.bind(this)}
            />
          </FormGroup>
        </Tooltip>
      </>
    );
  }
}

/* function getFormRange(formProps) {
  const formPage = formProps.currentPage;
  if(formProps.source === "page") {
    if(formProps.path.indexOf('toolBar') > -1 && formProps.path.indexOf('frame.height') > -1) {
      const pageFrame = formPage['frame'];
      let pageHeight = parseInt(pageFrame['height']);
      if(!formPage.StatusBarHidden){
        pageHeight = pageHeight - 20;
      }
      if(!formPage.NavigationBarHidden){
        pageHeight = pageHeight - 44;
      }
      if(!formPage._tabBarHiddens[0]){
        pageHeight = pageHeight - 49;
      }
      if(formProps.path.indexOf('toolBarBottom') > -1) {
        if(!formPage._toolBarTop[0].hidden){
          pageHeight = pageHeight - parseInt(formPage._toolBarTop[0].frame.height);
        }
      }
      if(formProps.path.indexOf('toolBarTop') > -1) {
        if(!formPage._toolBarBottom[0].hidden){
          pageHeight = pageHeight - parseInt(formPage._toolBarBottom[0].frame.height);
        }
      }

      return {"min": parseFloat(formProps.min), "max": pageHeight};
    }


  }else if(formProps.source === "uipart") {

    //console.log("uipart >>>> ", formProps.currentUI);

    let _max = parseFloat(formProps.max);
    if(formProps.path.indexOf('frame.x') > -1){
      _max = _max - parseInt(formProps.currentUI.frame.width);
    }else if(formProps.path.indexOf('frame.y') > -1){
      _max = _max - parseInt(formProps.currentUI.frame.height);
    }

    return {"min": parseFloat(formProps.min), "max": _max};
  }
  
  return {"min": parseFloat(formProps.min), "max": parseFloat(formProps.max)};
  
} */

function mapStateToProps(state) {
  // console.log(state);
  return {
    currentPage: state.selectedData.pagedata,
    currentUI: state.selectedData.uidata,
    targetEditor: state.selectedData.editor,
    addedRowsList: state.appParam.addedRowsList,
  };
}
export default connect(mapStateToProps)(NumericStepperForm);
