import React from "react";
import "./ListCheckBoxFormStyle.css";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormGroup,
  Checkbox,
} from "@mui/material";

class ListCheckBoxForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: isEmptyObject(this.props.value)
        ? []
        : filterValueList(
            this.props.value,
            this.props.options,
            this.props.text
          ),
      datasource: this.props.options,
      text: this.props.text,
      field: this.props.field,
      mandatorycount: parseInt(this.props.count),
    };
  }

  componentDidUpdate(prevProps, prevState) {}

  handleListItemClick = (event) => {
    let selectedIndex = parseInt(event.currentTarget.dataset["index"]);
    let item = this.props.options[selectedIndex]; //this.state.datasource[selectedIndex];

    let checked = this.state.value;
    const newChecked = [...checked];
    let currentIndex = -1;
    if (this.props.text) {
      const _text = this.props.text;
      currentIndex = checked.findIndex((x) => x[_text] === item[_text]);
    } else {
      currentIndex = checked ? checked.indexOf(item) : -1;
    }

    if (currentIndex === -1) {
      newChecked.push(item);
      if (typeof item === "object") item["selected"] = true;
    } else {
      newChecked.splice(currentIndex, 1);
      if (typeof item === "object") item["selected"] = false;
    }

    if (newChecked.length === 0) {
      const _mcount = parseInt(this.props.count);
      const _selectall = this.props.selectAll;
      if (_mcount > 0 || _selectall) {
        newChecked.push(checked[0]);
      }
    }
    if (this.props.text) {
      let orginalArr = updateOptionsData(
        this.props.options,
        this.state.value,
        this.props.text
      );
      let newArr = [];
      for (let index = 0; index < orginalArr.length; index++) {
        const element = orginalArr[index];
        if (element.hasOwnProperty("selected") && element["selected"]) {
          const newObj = { fieldname: element[this.props.text] };
          const newIndex = newArr.findIndex(
            (x) => x[this.props.text] === newObj[this.props.text]
          );
          if (newIndex === -1) newArr.push(newObj);
        }
      }
      //console.log(newChecked, "*************", newArr);
      this.setState({ value: newArr });
      this.props.onValueChange(newArr);
    } else {
      this.setState({ value: newChecked });
      this.props.onValueChange(newChecked);
    }
  };

  render() {
    const { mandatorycount } = this.state;
    let formheight = this.props.formheight ? this.props.formheight - 20 : 100;
    let _datasource = this.props.options;
    //let value = this.state.value;
    let value = this.props.value || [];
    const { text, field } = this.props;
    let dataList =
      text && field
        ? setDataSource(_datasource, text, field)
        : _datasource
        ? _datasource.sort()
        : [];

    if (value.length === 0) {
      if (_datasource && this.props.selectAll) {
        for (let i = 0; i < _datasource.length; i++) {
          value.push(_datasource[i]);
        }
      } else {
        for (let index = 0; index < mandatorycount; index++) {
          value.push(_datasource[index]);
        }
      }
    }

    let valueList =
      text && field
        ? setDataSource(value, text, field)
        : value
        ? value.sort()
        : [];

    return (
      <FormGroup
        style={{
          width: "100%",
          height: formheight,
          padding: "0px 8px",
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-around",
          border: "1px solid #ced4da",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <List className="list-chkbx-frm" component="nav">
          {dataList.map((item, index) => (
            <ListItem
              className="list-chkbx-frm-item"
              key={index}
              data-index={index}
              button
              dense
              onClick={this.handleListItemClick.bind(this)}
            >
              <ListItemIcon style={{ minWidth: 36 }}>
                <Checkbox
                  edge="start"
                  color="default"
                  disableRipple
                  tabIndex={-1}
                  checked={valueList.indexOf(item) !== -1}
                />
              </ListItemIcon>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      </FormGroup>
    );
  }
}

function setDataSource(options, text, field) {
  if (options === undefined) {
    return [];
  }

  if (text === "" && field === "") {
    return options.sort();
  } else {
    let arrOptions = [];
    for (let i = 0; i < options.length; i++) {
      const element = options[i];
      //arrOptions.push({ text: element[text], field: element[field] });
      arrOptions.push(element[text]);
    }
    return arrOptions;
  }
}

function isEmptyObject(valObj) {
  if (valObj) {
    return Object.keys(valObj).length === 0 && valObj.constructor === Object;
  }
  return true;
}

function filterValueList(_list, _options, _field) {
  let flist = [];
  if (_options) {
    _list.forEach((element, i) => {
      if (typeof element === "string") {
        if (_options.indexOf(element) > -1) {
          flist.push(element);
        }
      } else {
        const newIndex = _list.findIndex((x) => x[_field] === element[_field]);
        if (newIndex > -1) {
          flist.push(element);
        }
      }
    });
  }
  return flist;
}

function updateOptionsData(_options, _list, _field) {
  for (let index = 0; index < _list.length; index++) {
    const element = _list[index];
    const newIndex = _options.findIndex((x) => x[_field] === element[_field]);
    if (newIndex > -1) {
      let item = _options[newIndex];
      if (!item.hasOwnProperty("selected")) {
        item["selected"] = true;
      }
    }
  }
  return _options;
}

export default ListCheckBoxForm;
