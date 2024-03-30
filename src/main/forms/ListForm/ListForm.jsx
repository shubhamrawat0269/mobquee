import React from "react";
import "./ListFormStyle.css";
import {
  List,
  ListItem,
  FormGroup,
  IconButton,
  Fab,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { setRowList, setSelectedTab } from "../../ServiceActions";
import { connect } from "react-redux";

class ListForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
      addedRowsList: this.props.value,
      key: this.props.text,
      field: this.props.field,

      selectedIndex: 0,
    };

    // console.log("ListForm >>>>>", this.props.value, this.props.text);
    // console.log("PATH:", this.props.path);
    this.handleChangeValue = this.handleChangeValue.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      // console.log(prevProps);
      this.setState({ value: this.props.value });
    }
  }

  componentDidMount() {
    this.props.dispatch(setRowList(this.props.value));
    this.props.dispatch(setSelectedTab(this.props.value[0]["heading"]));
  }

  handleChangeValue = (event) => {
    this.setState({ value: event.currentTarget.value });
  };

  handleDeleteValue = (event) => {
    let resetData = false;
    let arrData = this.state.value;
    // console.log(this.props.path);
    //console.log(event.currentTarget.dataset, "*** handleDeleteValue ***", arrData);
    if (arrData.length > 1) {
      let selectedIndex = event.currentTarget.dataset["index"];
      arrData.splice(selectedIndex, 1);
      this.props.dispatch(
        setSelectedTab(arrData[arrData.length - 1]["heading"])
      );
      if (
        this.props.path === "panelItems" ||
        this.props.path === "swipeableItems"
      ) {
        for (let i = 0; i < arrData.length; i++) {
          const element = arrData[i];
          element["id"] = i;
        }
      }
    } else {
      resetData = true;
      if (this.props.path === "params.otherBtnTitles") {
        arrData = [];
        const btnObj = {
          id: "ButtonName-0",
          title: "",
          actions: { clicked: [] },
        };
        arrData.push(btnObj);
      } else if (this.props.path === "segmentItems") {
        arrData = [];
        const segmentObj = {
          type: "TextItem",
          text: "",
          imageDic: {
            srcLocation: "bundle",
            filename: "",
            fileext: "",
            url: "",
          },
          font: {
            fontName: "system",
            fontSize: 14,
            fontWeight: false,
            fontStyle: false,
            textAlignment: "left",
            textColor: { red: 0, blue: 0, green: 0, alpha: 1, colorName: "" },
            lineBreakMode: "TailTruncation",
          },
          actions: { clicked: [] },
          onTapTintColor: {
            alpha: 1,
            red: 1,
            green: 1,
            blue: 1,
            colorName: "",
          },
          onTapTextColor: {
            alpha: 1,
            red: 1,
            green: 1,
            blue: 1,
            colorName: "",
          },
        };
        arrData.push(segmentObj);
      } else if (this.props.path === "actionButtons") {
        arrData = [];
        const actionButtonObj = { title: "", actions: { clicked: [] } };
        arrData.push(actionButtonObj);
      } else if (this.props.path === "tabItems") {
        arrData = [];
        const tabObj = {
          type: "TextItem",
          text: "",
          imageDic: {
            srcLocation: "bundle",
            filename: "",
            fileext: "",
            url: "",
          },
          font: {
            fontName: "system",
            fontSize: 14,
            fontWeight: false,
            fontStyle: false,
            textAlignment: "left",
            textColor: { red: 0, blue: 0, green: 0, alpha: 1, colorName: "" },
            lineBreakMode: "TailTruncation",
          },
          actions: { clicked: [] },
          onTapTintColor: {
            alpha: 1,
            red: 1,
            green: 1,
            blue: 1,
            colorName: "",
          },
          onTapTextColor: {
            alpha: 1,
            red: 1,
            green: 1,
            blue: 1,
            colorName: "",
          },
        };
        arrData.push(tabObj);
      } else if (this.props.path === "gridItems") {
        arrData = [];
        const griditemObj = {
          id: 0,
          heading: "row_1",
          height: 50,
          indexColumn: 1,
          columns: 1,
          columnList: [{ id: 0, width: 100, Fields: [] }],
        };
        arrData.push(griditemObj);
      } else if (this.props.path === "formItems") {
        arrData = [];
        const formitemObj = {
          label: "",
          font: {
            fontName: "system",
            fontSize: 14,
            fontWeight: false,
            fontStyle: false,
            textAlignment: "left",
            textColor: { red: 0, blue: 0, green: 0, alpha: 1, colorName: "" },
            lineBreakMode: "TailTruncation",
          },
          Fields: [],
          width: 300,
          height: 80,
          gap: 5,
          backgroundColor: {
            alpha: 1,
            red: 0.9215,
            green: 0.9215,
            blue: 0.9215,
            colorName: "",
          },
          borderColor: { alpha: 1, red: 0, green: 0, blue: 0, colorName: "" },
          borderWeight: 1,
          cornerRadius: 0,
          itemAlignment: "middle",
          required: false,
        };
        arrData.push(formitemObj);
      } else if (this.props.path === "panelItems") {
        arrData = [];
        const panelitemObj = {
          id: 0,
          expanded: true,
          showheader: true,
          heading: "Heading",
          subheading: "",
          Fields: [],
          height: 160,
        };
        arrData.push(panelitemObj);
      } else if (this.props.path === "swipeableItems") {
        arrData = [];
        const swipeableObj = { id: 0, Fields: [] };
        arrData.push(swipeableObj);
      } else if (this.props.path === "Containers") {
        arrData = [];
        const containerObj = { name: "container1", title: "container1" };
        arrData.push(containerObj);
      } else if (this.props.path === "params.uipartList") {
        arrData = [];
        const uipartObj = { name: "", frameX: "", frameY: "" };
        arrData.push(uipartObj);
      } else {
        let objData = Object.assign({}, arrData[0]);
        for (const key in objData) {
          if (objData.hasOwnProperty(key)) {
            objData[key] = "";
          }
        }
        arrData = [];
        arrData.push(objData);
      }
    }

    this.setState({ value: arrData });
    this.props.dispatch(setRowList(arrData));
    let _selIndex = arrData.length - 1;
    _selIndex = _selIndex < 0 ? 0 : _selIndex;
    this.setState({ selectedIndex: _selIndex });
    //console.log(resetData, _selIndex, "... Delete >>>", arrData);
    if (resetData) {
      this.props.onValueChange(arrData, this.props.dependentActions);
    }
    this.props.onItemChange(arrData[_selIndex]);
  };

  handleAddValue = (event) => {
    // console.log(event.currentTarget.value);
    let arrData = this.state.value;
    let objData = Object.assign({}, arrData[0]);
    // console.log(this.props.path);
    if (this.props.path === "params.otherBtnTitles") {
      const _lastObj = arrData[arrData.length - 1];
      let _lastBtnIndex = _lastObj
        ? parseInt(_lastObj["id"].replace("ButtonName-", "")) + 1
        : arrData.length;
      objData = {
        id: "ButtonName-" + _lastBtnIndex,
        title: "",
        actions: { clicked: [] },
      };
      arrData.push(objData);
    } else if (this.props.path === "segmentItems") {
      const segmentObj = {
        type: "TextItem",
        text: "",
        imageDic: { srcLocation: "bundle", filename: "", fileext: "", url: "" },
        font: {
          fontName: "system",
          fontSize: 14,
          fontWeight: false,
          fontStyle: false,
          textAlignment: "left",
          textColor: { red: 0, blue: 0, green: 0, alpha: 1, colorName: "" },
          lineBreakMode: "TailTruncation",
        },
        actions: { clicked: [] },
        onTapTintColor: { alpha: 1, red: 1, green: 1, blue: 1, colorName: "" },
        onTapTextColor: { alpha: 1, red: 1, green: 1, blue: 1, colorName: "" },
      };
      arrData.push(segmentObj);
    } else if (this.props.path === "actionButtons") {
      const actionButtonObj = { title: "", actions: { clicked: [] } };
      arrData.push(actionButtonObj);
    } else if (this.props.path === "tabItems") {
      const tabObj = {
        type: "TextItem",
        text: "",
        imageDic: { srcLocation: "bundle", filename: "", fileext: "", url: "" },
        font: {
          fontName: "system",
          fontSize: 14,
          fontWeight: false,
          fontStyle: false,
          textAlignment: "left",
          textColor: { red: 0, blue: 0, green: 0, alpha: 1, colorName: "" },
          lineBreakMode: "TailTruncation",
        },
        actions: { clicked: [] },
        onTapTintColor: { alpha: 1, red: 1, green: 1, blue: 1, colorName: "" },
        onTapTextColor: { alpha: 1, red: 0, green: 0, blue: 0, colorName: "" },
      };
      arrData.push(tabObj);
    } else if (this.props.path === "formItems") {
      const formitemObj = {
        label: "",
        font: {
          fontName: "system",
          fontSize: 14,
          fontWeight: false,
          fontStyle: false,
          textAlignment: "left",
          textColor: { red: 0, blue: 0, green: 0, alpha: 1, colorName: "" },
          lineBreakMode: "TailTruncation",
        },
        Fields: [],
        width: 300,
        height: 80,
        gap: 5,
        backgroundColor: {
          alpha: 1,
          red: 0.9215,
          green: 0.9215,
          blue: 0.9215,
          colorName: "",
        },
        borderColor: { alpha: 1, red: 0, green: 0, blue: 0, colorName: "" },
        borderWeight: 1,
        cornerRadius: 0,
        itemAlignment: "middle",
        required: false,
      };
      arrData.push(formitemObj);
    } else if (this.props.path === "panelItems") {
      const _limit = parseInt(this.props.limit);
      if (_limit > -1 && _limit === arrData.length) {
        return;
      }
      for (let i = 0; i < arrData.length; i++) {
        const element = arrData[i];
        element["id"] = i;
      }
      const panelitemObj = {
        id: arrData.length,
        expanded: true,
        showheader: true,
        heading: "Heading",
        subheading: "",
        Fields: [],
        height: 160,
      };
      arrData.push(panelitemObj);
    } else if (this.props.path === "gridItems") {
      for (let i = 0; i < arrData.length; i++) {
        const element = arrData[i];
        element["id"] = i;
      }
      const griditemObj = {
        id: arrData.length,
        heading: "row_" + arrData.length,
        indexColumn: 1,
        height: 50,
        columns: 1,
        columnList: [{ id: 0, width: 100, Fields: [] }],
      };
      this.props.dispatch(setSelectedTab(griditemObj.heading));
      arrData.push(griditemObj);
    } else if (this.props.path === "swipeableItems") {
      const _limit = parseInt(this.props.limit);
      if (_limit > -1 && _limit === arrData.length) {
        return;
      }
      for (let j = 0; j < arrData.length; j++) {
        const element = arrData[j];
        element["id"] = j;
      }
      const swipeableObj = { id: arrData.length, Fields: [] };
      arrData.push(swipeableObj);
    } else if (this.props.path === "Containers") {
      const _name = "container" + (arrData.length + 1);
      const containerObj = { name: _name, title: "" };
      arrData.push(containerObj);
    } else if (this.props.path === "params.uipartList") {
      const uipartObj = { name: "", frameX: "", frameY: "" };
      arrData.push(uipartObj);
    } else {
      // console.log("Else part Run");
      for (const key in objData) {
        if (objData.hasOwnProperty(key)) {
          if (Array.isArray(objData[key])) {
            objData[key] = [];
          } else {
            objData[key] = "";
          }
        }
      }
      arrData.push(objData);
    }
    this.setState({ value: arrData });
    // console.log(arrData);
    this.props.dispatch(setRowList(arrData));
    const _selIndex = arrData.length - 1;
    this.setState({ selectedIndex: _selIndex });
    this.props.onItemChange(this.state.value[_selIndex]);
  };

  handleListItemClick = (event) => {
    let selectedIndex = event.currentTarget.dataset["index"];
    selectedIndex = selectedIndex === -1 ? 0 : selectedIndex;
    this.setState({ selectedIndex: parseInt(selectedIndex) });
    // console.log(this.state.value[selectedIndex]["heading"]);
    this.props.dispatch(
      setSelectedTab(this.state.value[selectedIndex]["heading"])
    );
    this.props.onItemChange(this.state.value[selectedIndex]);
  };

  render() {
    let value = this.state.value ? this.state.value : [];
    // console.log("----ListForm RowList >>>", this.state.addedRowsList);
    // console.log("----ListForm PROPS RowList >>>", this.props.addedRowsList);

    value = filterNullKeys(value);
    const key = this.state.key;

    return (
      <FormGroup
        style={{
          width: "100%",
          height: 125,
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-around",
          border: "1px solid #ced4da",
          borderRadius: 4,
        }}
      >
        <List className="list-frm-form-list" component="nav">
          <div>
            {this.props.addedRowsList.map((item, index) => (
              <ListItem
                className="lst-frm-item"
                key={index}
                button
                selected={index === this.state.selectedIndex}
                data-index={index}
                onClick={this.handleListItemClick.bind(this)}
              >
                <ListItemText primary={item[key]} />
                <ListItemSecondaryAction>
                  <IconButton
                    style={{ padding: 0 }}
                    data-index={index}
                    onClick={this.handleDeleteValue.bind(this)}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </div>
        </List>
        <Fab
          value={this.state.selectedIndex}
          color="default"
          style={{
            width: 32,
            height: 32,
            minHeight: 32,
            padding: 0,
            marginRight: 4,
            marginBottom: 6,
          }}
          onClick={this.handleAddValue.bind(this)}
        >
          <Add />
        </Fab>
      </FormGroup>
    );
  }
}

function filterNullKeys(values) {
  const filterArr = [];

  for (let index = 0; index < values.length; index++) {
    const element = values[index];
    if (element) {
      filterArr.push(element);
    }
  }

  return filterArr;
}

function mapStateToProps(state) {
  return {
    apiParam: state.appParam.params,
    addedRowsList: state.appParam.addedRowsList,
  };
}

export default connect(mapStateToProps)(ListForm);
