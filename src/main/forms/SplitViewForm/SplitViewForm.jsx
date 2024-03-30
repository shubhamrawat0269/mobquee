import React from "react";
import "./SplitViewFormStyle.css";
import {
  Chip,
  List,
  ListItem,
  FormGroup,
  IconButton,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import { Delete } from "@mui/icons-material";

class SplitViewForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
      key: this.props.text,
      field: this.props.field,

      selectedIndex: this.props.selectedIndex,
    };

    //console.log("ListForm >>>>>", this.props.value, this.props.text, this.props.field);
    this.handleChangeValue = this.handleChangeValue.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  handleChangeValue = (event) => {
    this.setState({ value: event.currentTarget.value });
  };

  handleListItemClick = (event) => {
    let selectedIndex = event.currentTarget.dataset["index"];
    this.setState({ selectedIndex: parseInt(selectedIndex) });
    this.props.onItemChange(this.state.value[selectedIndex]);
  };

  ///////////// Delete Split Frame /////////////

  handleDeleteValue = (event) => {
    let arrData = this.state.value;

    const deleteIndex = event.currentTarget.dataset["index"];
    let deltedChild = arrData[deleteIndex];
    if (deltedChild.pagedef) {
      if (deltedChild.pagedef.filename.length > 0) {
        console.log("Associated page will be deleted.");
        //remove_FramePage();
      }
    }

    arrData.splice(deleteIndex, 1);

    if (arrData.length === 1) {
      arrData[0][this.state.key] = 0;
      let soFrame = arrData[0]._screenFrames[0];
      soFrame["x"] = soFrame["y"] = 0;
      soFrame["width"] = this.props.data["frame"]["width"];
      soFrame["height"] =
        this.props.data["frame"]["height"] - arrData[0]["diffHeight"];
      arrData[0]["frame"] = soFrame;
    } else {
      this.set_deletedChildPartners(deltedChild, arrData);
    }

    this.setState({ value: arrData });
    //this.setState({ selectedIndex: arrData.length-1 });
    this.props.onValueChange(arrData);
  };
  set_deletedChildPartners = (_delChild, arrData) => {
    let partnerObj = this.get_deletedChildPartners(_delChild, arrData);

    if (partnerObj.left.length > 0) {
      var _lpartnerHeight = 0;
      for (var l = 0; l < partnerObj.left.length; l++)
        _lpartnerHeight += partnerObj.left[l].frame.height;

      if (_lpartnerHeight === _delChild.frame.height) {
        this.merge_deletedChildPartners(_delChild, partnerObj.left, "left");
        return;
      }
    }
    if (partnerObj.right.length > 0) {
      var _rpartnerHeight = 0;
      for (var r = 0; r < partnerObj.right.length; r++)
        _rpartnerHeight += partnerObj.right[r].frame.height;

      if (_rpartnerHeight === _delChild.frame.height) {
        this.merge_deletedChildPartners(_delChild, partnerObj.right, "right");
        return;
      }
    }
    if (partnerObj.top.length > 0) {
      var _tpartnerWidth = 0;
      for (var t = 0; t < partnerObj.top.length; t++)
        _tpartnerWidth += partnerObj.top[t].frame.width;

      if (_tpartnerWidth === _delChild.frame.width) {
        this.merge_deletedChildPartners(_delChild, partnerObj.top, "top");
        return;
      }
    }
    if (partnerObj.bottom.length > 0) {
      var _bpartnerWidth = 0;
      for (var b = 0; b < partnerObj.bottom.length; b++)
        _bpartnerWidth += partnerObj.bottom[b].frame.width;

      if (_bpartnerWidth === _delChild.frame.width) {
        this.merge_deletedChildPartners(_delChild, partnerObj.bottom, "bottom");
        return;
      }
    }
  };

  get_deletedChildPartners = (splitViewChildDic, pages) => {
    var numX = splitViewChildDic.frame.x;
    var numY = splitViewChildDic.frame.y;
    var numW = splitViewChildDic.frame.width;
    var numH = splitViewChildDic.frame.height;

    var searchObj = {};
    searchObj.left = [];
    searchObj.right = [];
    searchObj.top = [];
    searchObj.bottom = [];

    for (var i = 0; i < pages.length; i++) {
      if (
        pages[i].frame.y >= numY &&
        pages[i].frame.y + pages[i].frame.height <= numY + numH
      ) {
        if (pages[i].frame.x === numX + numW)
          searchObj.right.push(pages[i]); //right
        else if (pages[i].frame.x + pages[i].frame.width === numX)
          searchObj.left.push(pages[i]); //left
      }
      if (
        pages[i].frame.x >= numX &&
        pages[i].frame.x + pages[i].frame.width <= numX + numW
      ) {
        if (pages[i].frame.y === numY + numH)
          searchObj.bottom.push(pages[i]); //bottom
        else if (pages[i].frame.y + pages[i].frame.height === numY)
          searchObj.top.push(pages[i]); //top
      }
    }

    return searchObj;
  };

  merge_deletedChildPartners = (deleteChild, partners, side) => {
    for (var i = 0; i < partners.length; i++) {
      var partnerChild = partners[i];
      switch (side.toLowerCase()) {
        case "left": {
          partnerChild.frame.width += deleteChild.frame.width;
          break;
        }
        case "right": {
          partnerChild.frame.x = deleteChild.frame.x;
          partnerChild.frame.width += deleteChild.frame.width;
          break;
        }
        case "top": {
          partnerChild.frame.height += deleteChild.frame.height;
          break;
        }
        case "bottom": {
          partnerChild.frame.y = deleteChild.frame.y;
          partnerChild.frame.height += deleteChild.frame.height;
          break;
        }
        default:
          break;
      }

      //var _screenIndex:int = Refs.getInstance().currentLayoutEditorHelper.currentSettings.screenIndex;
      //partnerChild.updateSplitFrames(partnerChild.frame, _screenIndex);

      partnerChild._screenFrames[0] = partnerChild.frame;
    }
  };

  /////////////////////////////////////////

  ///////////// Verical Split /////////////

  handleVerticalSplit = (event) => {
    let arrData = this.state.value;

    //console.log(this.state.key, this.state.selectedIndex, "... handleVerticalSplit ....", arrData);
    const splittedObject = arrData[this.state.selectedIndex];
    let soFrame = splittedObject._screenFrames[0];
    const splitW = parseInt(soFrame.width / 2);
    soFrame.width = splitW;
    splittedObject["frame"] = soFrame;

    const newFrameObj = {
      x: splitW,
      y: soFrame.y,
      width: splitW,
      height: soFrame.height,
    };
    let newId = arrData.length;
    const newSplitData = {
      id: newId,
      pagedef: { srcLocation: "bundle", filename: "", fileext: "", url: "" },
      frame: {
        x: 0,
        y: 0,
        z: 0,
        width: 0,
        height: 0,
        depth: 0,
        rotation: 0,
        minWidth: 0,
        maxWidth: 0,
        minHeight: 0,
        maxHeight: 0,
        isLocked: false,
        relative: false,
      },
      _screenFrames: [
        {
          x: 0,
          y: 0,
          z: 0,
          width: 0,
          height: 0,
          depth: 0,
          rotation: 0,
          minWidth: 0,
          maxWidth: 0,
          minHeight: 0,
          maxHeight: 0,
          isLocked: false,
          relative: false,
        },
      ],
      splitDivision: "VERTICAL",
      diffHeight: 0,
    };

    const frameObj = Object.assign(newSplitData.frame, newFrameObj);
    newSplitData["frame"] = frameObj;
    newSplitData._screenFrames[0] = frameObj;

    arrData.push(newSplitData);

    this.setState({ value: arrData });
    this.props.onValueChange(arrData);
  };

  ////////////////////////////////////////////

  ///////////// Horizontal Split /////////////

  handleHorizontalSplit = (event) => {
    let arrData = this.state.value;

    const splittedObject = arrData[this.state.selectedIndex];
    let soFrame = splittedObject._screenFrames[0];
    const splitH = parseInt(soFrame.height / 2);
    soFrame.height = splitH;
    splittedObject["frame"] = soFrame;

    const newFrameObj = {
      x: soFrame.x,
      y: parseInt(soFrame.y + splitH),
      width: soFrame.width,
      height: splitH,
    };
    let newId = arrData.length;
    const newSplitData = {
      id: newId,
      pagedef: { srcLocation: "bundle", filename: "", fileext: "", url: "" },
      frame: {
        x: 0,
        y: 0,
        z: 0,
        width: 0,
        height: 0,
        depth: 0,
        rotation: 0,
        minWidth: 0,
        maxWidth: 0,
        minHeight: 0,
        maxHeight: 0,
        isLocked: false,
        relative: false,
      },
      _screenFrames: [
        {
          x: 0,
          y: 0,
          z: 0,
          width: 0,
          height: 0,
          depth: 0,
          rotation: 0,
          minWidth: 0,
          maxWidth: 0,
          minHeight: 0,
          maxHeight: 0,
          isLocked: false,
          relative: false,
        },
      ],
      splitDivision: "HORIZONTAL",
      diffHeight: 0,
    };

    const frameObj = Object.assign(newSplitData.frame, newFrameObj);
    newSplitData["frame"] = frameObj;
    newSplitData._screenFrames[0] = frameObj;

    arrData.push(newSplitData);

    //console.log(this.state.selectedIndex, newSplitData, "... handleVerticalSplit ....", arrData);
    this.setState({ value: arrData });
    this.props.onValueChange(arrData);
  };

  render() {
    const { value, key } = this.state;
    let visibleDelete = value.length > 1 ? "visible" : "hidden";

    return (
      <FormGroup
        style={{
          width: "100%",
          height: 150,
          display: "block",
          border: "1px solid #ced4da",
          borderRadius: 4,
        }}
      >
        <List className="split-view-frm" component="nav">
          {value.map((item, index) => (
            <ListItem
              className="split-view-frm-item"
              key={index}
              button
              selected={index === this.state.selectedIndex}
              data-index={index}
              onClick={this.handleListItemClick.bind(this)}
            >
              <ListItemText primary={item[key]} />
              <ListItemSecondaryAction style={{ right: 0 }}>
                <IconButton
                  style={{ padding: 0, visibility: visibleDelete }}
                  data-index={index}
                  onClick={this.handleDeleteValue.bind(this)}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-around",
          }}
        >
          <Chip
            label="Vertical Split"
            color="default"
            size="small"
            style={{ width: 125 }}
            clickable
            onClick={this.handleVerticalSplit.bind(this)}
          />
          <Chip
            label="Horizontal Split"
            color="default"
            size="small"
            style={{ width: 125 }}
            clickable
            onClick={this.handleHorizontalSplit.bind(this)}
          />
        </div>
      </FormGroup>
    );
  }
}

export default SplitViewForm;
