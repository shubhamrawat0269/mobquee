import React from "react";
import { connect } from "react-redux";
import "./FileSelectorFormStyle.css";
import {
  Dialog,
  IconButton,
  Typography,
  DialogContent,
  DialogActions,
  Box,
  List,
  InputBase,
  DialogTitle,
  FormGroup,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Close, Info } from "@mui/icons-material";
class FileSelectorForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: getFileValue(this.props.value, this.props.init),

      showlist: false,
      resourcedata: getFileList(
        this.props.type,
        this.props.appData,
        this.props.apiParam["apiURL"]
      ),
      selectedFile: -1,

      isfocused: false,
    };

    this.handleChangeValue = this.handleChangeValue.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: getFileValue(this.props.value, this.props.init) });
    }
  }

  handleClick = (event) => {
    if (this.props.source === "uipart") {
      this.setState({ isfocused: false });
    }
  };
  handleKeypress = (event) => {
    if (this.props.source === "uipart" && !this.state.isfocused) {
      let _val = "!" + this.state.input;
      this.setState({ value: _val });
      this.setState({ isfocused: true });
    }
  };

  handleChangeValue = (event) => {
    let _val = event.currentTarget.value;
    _val = _val.replace("!", "");

    this.setState({ value: _val });
    console.log(this.props.value, "ApplyFile >>>>", this.state.value, _val);
    let changedValue = setUpdatedPropValue(this.props.value, _val);
    this.props.onValueChange(changedValue);
  };

  //// file-list ////

  handleFilelist = (event) => {
    let _resourcedata = getFileList(
      this.props.type,
      this.props.appData,
      this.props.apiParam["apiURL"]
    ); //this.state.resourcedata
    //console.log(this.props.appData, "**** handleFilelist ****",  _resourcedata);
    if (_resourcedata.length > 0) {
      const filename = this.state.value;
      const fileArr = _resourcedata[0].data;
      let _file = fileArr.filter(function (file) {
        return file.name === filename;
      });

      if (_file.length > 0) {
        this.setState({ selectedFile: _file[0] });
      } else {
        this.setState({ selectedFile: {} });
      }
    }

    this.setState({ showlist: true });
  };

  handleCloseFilelist() {
    this.setState({ selectedFile: {} });
    this.setState({ showlist: false });
  }

  handleFileSelect(fileObj) {
    this.setState({ selectedFile: fileObj });
  }

  handleApplyFile() {
    this.setState({ showlist: false });
    //if(this.state.selectedFile && this.state.selectedFile['name']) {
    if (
      this.state.selectedFile &&
      this.state.selectedFile.hasOwnProperty("name")
    ) {
      this.setState({ value: this.state.selectedFile["name"] });

      //console.log(this.state.selectedFile, "ApplyFile >>>>", this.state.value, this.props.value);
      let updatedValue = setUpdatedPropValue(
        this.props.value,
        this.state.selectedFile["name"]
      );
      this.props.onValueChange(updatedValue);
    }
  }

  render() {
    const { value, showlist } = this.state;
    let resourcedata = getFileList(
      this.props.type,
      this.props.appData,
      this.props.apiParam["apiURL"]
    );
    //console.log(this.props.init, this.props.source, this.props.type, ".. FileSelectorForm images >>>>>", resourcedata);

    return (
      <div>
        <FormGroup
          style={{ height: 32, flexDirection: "row", alignItems: "center" }}
        >
          <InputBase
            className="file-selector-txt-input"
            value={value}
            margin="dense"
            variant="outlined"
            onChange={this.handleChangeValue}
          />
          <button
            style={{ minWidth: 24, height: 22, padding: 0 }}
            onClick={this.handleFilelist.bind(this)}
          >
            +
          </button>
        </FormGroup>
        {showlist && (
          <Dialog open={showlist} style={{ overflow: "hidden" }} maxWidth="lg">
            <DialogTitle id="customized-dialog-title">
              <IconButton
                aria-label="Close"
                onClick={this.handleCloseFilelist.bind(this)}
              >
                <Close />
              </IconButton>
              Apply {resourcedata[0]["title"]}
            </DialogTitle>

            <DialogContent dividers>
              <div
                className="horizontal-align"
                style={{ alignItems: "flex-start", justifyContent: "flex-end" }}
              >
                {resourcedata.length > 0 && (
                  <FileList
                    file={this.state.selectedFile}
                    filetype={resourcedata[0]["title"]}
                    filedata={resourcedata[0]["data"]}
                    onFileSelect={this.handleFileSelect.bind(this)}
                  />
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <button
                style={{ height: 22, padding: 0, textTransform: "none" }}
                onClick={this.handleApplyFile.bind(this)}
              >
                Apply
              </button>
              <button
                style={{ height: 22, padding: 0, textTransform: "none" }}
                onClick={this.handleCloseFilelist.bind(this)}
              >
                Close
              </button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    );
  }
}

function getFileValue(fileObj, initVal) {
  let _fileval = "";
  if (fileObj) {
    if (fileObj.srcLocation === "bundle") {
      if (fileObj.fileext !== "")
        _fileval = fileObj.filename + "." + fileObj.fileext;
      else _fileval = fileObj.filename;
    }
  }
  if (initVal) {
    if (_fileval === "") return initVal;
  }
  return _fileval;
}

function getFileList(filetype, appData, apiURL) {
  let files = [];
  let type = "Image";
  let path = "image";

  if (!filetype) {
    files = appData["images"];
    type = "Image";
    path = "image";
  } else {
    if (filetype.indexOf("Sound") > -1 || filetype === "bgm") {
      files = appData["bgms"];
      type = "Audio";
      path = "bgm";
    } else if (filetype.indexOf("Video") > -1 || filetype === "video") {
      files = appData["videos"];
      type = "Video";
      path = "video";
    } else {
      files = appData["images"];
      type = "Image";
      path = "image";
    }
  }

  let _resources = [];

  let _arrFiles = [];
  files.forEach((file) => {
    let _filesrc =
      apiURL +
      "download/" +
      path +
      "/" +
      appData.projectid +
      "/" +
      file.filename;
    let fileObj = {
      id: file.resourceid,
      name: file.filename,
      source: _filesrc,
    };
    _arrFiles.push(fileObj);
  });
  _resources.push({ title: type, data: _arrFiles });

  return _resources;
}

function setUpdatedPropValue(prevValue, fileName) {
  if (prevValue["srcLocation"] === "bundle") {
    prevValue["filename"] = fileName.split(".")[0];
    prevValue["fileext"] = fileName.split(".")[1] ? fileName.split(".")[1] : "";
  }

  return prevValue;
}

function FileList(props) {
  const filetype = props.filetype;

  const [selectedIndex, setSelectedIndex] = React.useState(props.file["id"]);
  const [selectedFile, setSelectedFile] = React.useState(props.file);

  function handleFileClear(event) {
    setSelectedIndex(0);
    let clearObj = { id: 0, name: "", source: "" };
    setSelectedFile(clearObj);

    props.onFileSelect(clearObj);
  }

  function handleFileSelect(event) {
    let filedata = event.currentTarget.dataset;
    setSelectedIndex(filedata.id);
    let fileObj = {
      id: filedata.id,
      name: filedata.name,
      source: filedata.source,
    };
    setSelectedFile(fileObj);

    props.onFileSelect(fileObj);
    setShowInfo(false);
  }

  const [showInfo, setShowInfo] = React.useState(false);
  const [filedimensions, setFileDimensions] = React.useState("");
  const [filesize, setFileSize] = React.useState("");
  function handleInfoText() {
    if (props.filetype === "Image") {
      const imgV = document.getElementById("imageviewer");
      //console.log("imageviewer>>>", imgV);
      const wid = imgV ? imgV.naturalWidth : 0;
      const hei = imgV ? imgV.naturalHeight : 0;
      setFileDimensions("Image dimensions: " + wid + " x " + hei + " px");
      setFileSize("");

      setShowInfo(!showInfo);
    }
  }

  return (
    <div className="vertical-align">
      <Box className="file-selector-box">
        <List
          id="resourceList"
          component="nav"
          dense={true}
          className="file-selector-file-list"
        >
          <ListItem
            button
            className="file-selector-clear-item"
            onClick={handleFileClear}
          >
            <ListItemText primary="Clear" />
          </ListItem>
          {props.filedata.map((item) => (
            <ListItem
              button
              key={item.id}
              className="file-selector-file-item"
              selected={selectedIndex === item.id}
              data-id={item.id}
              data-name={item.name}
              data-source={item.source}
              onClick={handleFileSelect}
            >
              <ListItemText primary={item.name} />
            </ListItem>
          ))}
        </List>
        <div id="fileViewer" className="file-selector-viewer">
          {filetype === "Image" && (
            <div className="file-selector-section">
              <img
                id="imageviewer"
                src={selectedFile.source}
                alt={selectedFile.name}
                className="file-selector-aspect"
              />
              <Box className="file-selector-infobox">
                {showInfo && (
                  <Typography
                    variant="body2"
                    gutterBottom
                    className="file-selector-info-txt"
                  >
                    {filedimensions}
                    <br />
                    {filesize}
                  </Typography>
                )}
                <IconButton
                  edge="end"
                  color="inherit"
                  className="file-selector-icon-btn"
                  onClick={handleInfoText}
                >
                  <Info />
                </IconButton>
              </Box>
            </div>
          )}
          {filetype === "Audio" && (
            <audio id="audioviewer" controls autoPlay>
              <source src={selectedFile.source} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          )}
          {filetype === "Video" && (
            <video id="videoviewer" width="400" height="400" controls>
              <source src={selectedFile.source} type="video/mp4" />
              Your browser does not support HTML5 video.
            </video>
          )}
        </div>
      </Box>
    </div>
  );
}

//export default FileSelectorForm;

function mapStateToProps(state) {
  return {
    apiParam: state.appParam.params,
    appData: state.appData.data,
  };
}
export default connect(mapStateToProps)(FileSelectorForm);
