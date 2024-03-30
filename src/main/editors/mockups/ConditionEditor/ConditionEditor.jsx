import React from "react";
import "./ConditionEditorStyle.css";

import {
  IconButton,
  Typography,
  Box,
  Paper,
  Grid,
  Snackbar,
  SnackbarContent,
  Slide,
  List,
  ListItem,
  ListItemText,
  Collapse,
  InputBase,
  NativeSelect,
  DialogContent,
  DialogTitle,
  Dialog,
} from "@mui/material";
import { Close } from "@mui/icons-material";

class ConditionEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      conditionData: this.props.data,
      show: this.props.show,

      prevConditionData: [],
      actionList: [],
    };

    this.handleCloseConditionEditor =
      this.handleCloseConditionEditor.bind(this);
  }

  componentDidMount() {
    this.setState({
      prevConditionData: JSON.parse(JSON.stringify(this.state.conditionData)),
    });
  }

  handleCloseConditionEditor(param, data) {
    /* console.log(param, ". handleCloseConditionEditor >>>>>>>>", this.state.prevConditionData, this.state.conditionData);
      if(param !== "ok"){
        this.setState({ conditionData : JSON.parse(JSON.stringify(this.state.prevConditionData)) });
      } */

    if (param === "ok") {
      this.setState({ conditionData: data });
      this.props.onCloseConditionEditor(data);
    } else {
      this.props.onCloseConditionEditor();
    }
  }

  render() {
    const { prevConditionData, conditionData, show } = this.state;

    if (!show) {
      return null;
    }

    return (
      <Dialog
        id="conditiondetails"
        scroll="paper"
        open={true}
        fullWidth={true}
        maxWidth="sm"
      >
        <div className="condition-editor-title">
          <h4>Condition Editor</h4>
        </div>
        <DialogContent className="condition-dialog-content" dividers>
          <ConditionViewer
            actualdata={prevConditionData}
            data={conditionData}
            isElseExist={this.props.elseExist}
            onCloseConditionEditor={this.handleCloseConditionEditor}
          />
        </DialogContent>
      </Dialog>
    );
  }
}

function ConditionViewer(props) {
  const [conditionData, setConditionData] = React.useState(props.data);
  const [conditionStr, setConditionString] = React.useState(
    manipulateConditionsString(props.data)
  );
  const [disableConditionButtons, setDisableConditionButtons] =
    React.useState(true);
  const [selectedConditionId, setSelectedConditionId] = React.useState("");

  const [openalert, setOpenalert] = React.useState(false);
  const [alertmsg, setAlertMsg] = React.useState("");

  function handleConditionSelect(condId) {
    //console.log(conditionData, " **** handleConditionSelect >> ::::: ", condId);
    setDisableConditionButtons(false);
    setSelectedConditionId(condId);
  }

  function handleConditionUpdate(condition) {
    //console.log(selectedConditionId, " >> ", props.data, conditionData, " >> handleConditionUpdate ::::: ", condition);

    let currentConditions = conditionData;
    if (currentConditions.length === 0) {
      currentConditions.push({
        cases: [
          {
            target: condition["target"],
            operator: condition["operator"],
            value: condition["value"],
            ORGroupCase: [],
            condtemp: "",
          },
        ],
      });
    } else {
      let _conditionId =
        selectedConditionId === "" ? condition["id"] : selectedConditionId;
      let _groupIndex = _conditionId.split("-")[0].replace("group", "");
      let _caseIndex = _conditionId.split("-")[1].replace("case", "");
      let _selectedGroup = currentConditions[_groupIndex];
      let _selectedGroupCases = _selectedGroup["cases"];
      let _selectedCase = _selectedGroupCases[_caseIndex];

      //console.log(_selectedGroupCases, " :: _selected >> ", _selectedCase);
      if (_selectedCase) {
        if (_conditionId.indexOf("-or") > -1) {
          let _orgroupcaseId = _conditionId
            .substring(_conditionId.lastIndexOf("case"))
            .replace("case", "");
          let _orgroupCase =
            _selectedCase["ORGroupCase"][0]["cases"][_orgroupcaseId];
          _orgroupCase["target"] = condition["target"];
          _orgroupCase["operator"] = condition["operator"];
          _orgroupCase["value"] = condition["value"];
        } else {
          _selectedCase["target"] = condition["target"];
          _selectedCase["operator"] = condition["operator"];
          _selectedCase["value"] = condition["value"];
        }
      }
    }

    setConditionData(currentConditions);
    let newConditionStr = manipulateConditionsString(conditionData);
    setConditionString(newConditionStr);
  }

  // Add 'OR' condition with either a Groupcase or a case
  function addGroupCase() {
    let currentConditions = conditionData;
    currentConditions.push({
      cases: [
        { target: "", operator: "", value: "", ORGroupCase: [], condtemp: "" },
      ],
    });
    //console.log(" addGroupCase >> ::::: ", conditionData);

    setConditionData(currentConditions);
    let newConditionStr = manipulateConditionsString(props.data);
    setConditionString(newConditionStr);
  }

  // Add 'AND' condition with a case
  function addCase() {
    let currentConditions = conditionData;
    let _groupIndex = selectedConditionId.split("-")[0].replace("group", "");

    let _selectedGroup = currentConditions[_groupIndex];
    let _selectedGroupCases = _selectedGroup["cases"];
    if (selectedConditionId.indexOf("-or") > -1) {
      let _caseIndex = parseInt(
        selectedConditionId.split("-")[1].replace("case", "")
      );
      let _selectedCase = _selectedGroupCases[_caseIndex];
      _selectedCase["ORGroupCase"][0]["cases"].push({
        target: "",
        operator: "",
        value: "",
        ORGroupCase: [],
        condtemp: "",
      });
    } else {
      _selectedGroupCases.push({
        target: "",
        operator: "",
        value: "",
        ORGroupCase: [],
        condtemp: "",
      });
    }
    //console.log(selectedConditionId, "... addCase >> ::::: ", conditionData);

    setDisableConditionButtons(true);
  }

  // Add 'OR group case' condition with a case
  function addORGroupCase() {
    if (selectedConditionId.indexOf("-or") > -1) {
      // show alert
      return;
    }
    let _groupIndex = selectedConditionId.split("-")[0].replace("group", "");
    let _caseIndex = selectedConditionId.split("-")[1].replace("case", "");

    let currentConditions = conditionData;
    if (currentConditions.length > 0) {
      let _selectedGroup = currentConditions[_groupIndex];
      let _selectedGroupCases = _selectedGroup["cases"];
      let _selectedCase = _selectedGroupCases[_caseIndex];
      let _selectedORGroup = _selectedCase["ORGroupCase"];
      if (_selectedORGroup.length > 0) {
        _selectedORGroup[0]["cases"].push({
          target: "",
          operator: "",
          value: "",
          ORGroupCase: [],
          condtemp: "",
        });
      } else {
        _selectedORGroup.push({
          cases: [
            {
              target: "",
              operator: "",
              value: "",
              ORGroupCase: [],
              condtemp: "",
            },
          ],
        });
      }
    }
    //console.log(selectedConditionId, "... addORGroupCase >> ::::: ", conditionData);

    setDisableConditionButtons(true);
  }

  // Delete selected condition case
  function deleteCase() {
    let currentConditions = conditionData;

    let _groupIndex = selectedConditionId.split("-")[0].replace("group", "");
    let _caseIndex = selectedConditionId.split("-")[1].replace("case", "");

    let _selectedGroup = currentConditions[_groupIndex];
    if (_selectedGroup) {
      let _selectedGroupCases = _selectedGroup["cases"];
      if (selectedConditionId.indexOf("-or") > -1) {
        let _caseIndex = parseInt(
          selectedConditionId.split("-")[1].replace("case", "")
        );
        let _selectedCase = _selectedGroupCases[_caseIndex];
        let _orgroupcaseId = selectedConditionId
          .substring(selectedConditionId.lastIndexOf("case"))
          .replace("case", "");
        _selectedCase["ORGroupCase"][0]["cases"].splice(_orgroupcaseId, 1);
      } else {
        _selectedGroupCases.splice(_caseIndex, 1);
      }

      /* if(_selectedGroup['cases'].length === 0) {
          currentConditions.splice(_groupIndex,1);
        } */
      //console.log(selectedConditionId, _selectedGroup, _selectedGroupCases, "... Delete ## Conditions >> ::::: ", currentConditions);
    }
    //console.log(props.data, "... Delete ## Conditions >> ::::: ", currentConditions);
    if (
      currentConditions.length === 1 &&
      currentConditions[0]["cases"].length === 0
    ) {
      currentConditions = [];
      setConditionData([]);
      setConditionString(manipulateConditionsString([]));
    } else {
      setConditionData(currentConditions);
      let newConditionStr = manipulateConditionsString(props.data);
      setConditionString(newConditionStr);
    }

    setDisableConditionButtons(true);
  }

  function deleteAllCondition() {
    if (props.isElseExist) {
      console.log("isElseExist");
      setAlertMsg(
        "There is action(s) applied in 'Else' case. Either remove those or apply new condition(s) to avoid any unexpected behaviour."
      );
      setOpenalert(true);
      //return;
    }

    let currentConditions = [];
    setConditionData(currentConditions);
    //let newConditionStr = manipulateConditionsString(props.data);
    setConditionString("");
  }

  ////////////////////// Cancel and Apply conditions //////////////////////

  function closeEditor() {
    props.data.splice(0);
    for (let index = 0; index < props.actualdata.length; index++) {
      const element = props.actualdata[index];
      props.data.push(element);
    }

    props.onCloseConditionEditor("cancel");
  }

  function applyCondition() {
    const isValidData = validateConditionData(conditionData);
    if (!isValidData) {
      setAlertMsg("Any condition target or operator cannot be empty");
      setOpenalert(true);
      return;
    }

    props.onCloseConditionEditor("ok", conditionData);
  }

  function validateConditionData(conditionArr) {
    let _flag = true;
    conditionArr.forEach((element) => {
      let _cases = element["cases"];
      _cases.forEach((cond) => {
        //console.log(cond);
        if (cond["target"] === "" || cond["operator"] === "") {
          //console.log(cond['target'], "....", cond['operator'], "....", cond['value'], "*****", cond['ORGroupCase'].length);
          _flag = false;
        } else {
          if (!validateConditionData(cond["ORGroupCase"])) _flag = false;
        }
      });
    });

    return _flag;
  }

  ////////////////////////////////

  const handleCloseAlert = () => {
    setOpenalert(false);
    setAlertMsg("");
  };

  return (
    <Box className="condition-viewer-section">
      <Paper elevation={0} className="condtion-viewer-paper">
        <Typography
          variant="subtitle2"
          className="condtion-viewer-paper-header"
        >
          {conditionStr}
        </Typography>
      </Paper>
      <Paper elevation={6} className="condtion-viewer-paper-list">
        <ConditionList
          data={conditionData}
          onSelectItem={handleConditionSelect}
          onUpdateItem={handleConditionUpdate}
        />
      </Paper>
      <Grid
        container
        justify="flex-start"
        alignItems="center"
        className="condtion-viewer-paper-dialog"
      >
        <button
          className="condition-viewer-paper-dialog-btn"
          onClick={addGroupCase}
        >
          + OR
        </button>
        <button
          disabled={disableConditionButtons}
          className="condition-viewer-paper-dialog-btn"
          onClick={addCase}
        >
          + AND
        </button>
        <abbr title="Add OR Group case">
          <button
            disabled={disableConditionButtons}
            className="condition-paper-full-btn"
            onClick={addORGroupCase}
          >
            + ORGroup
          </button>
        </abbr>
        <span className="condition-paper-grid-spacer"></span>
        <button
          disabled={disableConditionButtons}
          className="condition-viewer-paper-dialog-btn"
          onClick={deleteCase}
        >
          Delete
        </button>
        <button
          className="condition-viewer-paper-dialog-btn"
          style={{ minWidth: 72 }}
          onClick={deleteAllCondition}
        >
          Delete All
        </button>
      </Grid>
      <Grid
        container
        justify="flex-start"
        alignItems="center"
        className="condition-paper-footer"
      >
        <span className="condition-paper-grid-spacer"></span>
        <button
          className="condition-viewer-paper-dialog-btn"
          onClick={closeEditor}
        >
          Cancel
        </button>
        <button
          className="condition-viewer-paper-dialog-btn"
          onClick={applyCondition}
        >
          Apply
        </button>
      </Grid>
      <Snackbar
        open={openalert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={SlideTransition}
        bodystyle={{ backgroundColor: "teal", color: "coral" }}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <SnackbarContent
          style={{ backgroundColor: "#d3d3d3", color: "red" }}
          message={<span id="client-snackbar">{alertmsg}</span>}
          action={
            <React.Fragment>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleCloseAlert}
              >
                <Close fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </Snackbar>
    </Box>
  );
}
function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

function ConditionList(props) {
  const condData = props.data;
  let conditionData = manipulateConditionsData(
    condData,
    props.orgroup,
    props.parentcaseid
  );

  function handleCase(ev) {
    let conditionId = ev.currentTarget.dataset["id"];
    props.onSelectItem(conditionId);
  }

  function handleUpdateCondition(_case) {
    props.onUpdateItem(_case);
  }

  return (
    <div className="condition-list">
      {conditionData.map((item, index) => (
        <Box id="groupcases" key={index} className="vertical-align">
          {item.showor && (
            <ListItem className="condition-editor-list-header">
              <ListItemText primary="OR" className="condition-text" />
            </ListItem>
          )}
          <Collapse
            in={true}
            timeout="auto"
            unmountOnExit
            className="condition-list-collapse"
          >
            <List dense={true} disablePadding>
              <Box className="condition-list-item-condition">
                {item.cases.map((cases, caseindex) => (
                  <div
                    id="cases"
                    key={caseindex}
                    className="condition-list-item-cases"
                  >
                    {cases.showand && (
                      <ListItemText
                        primary="AND"
                        className="condition-list-item-txt"
                      />
                    )}
                    <button
                      disableRipple
                      className="condition-list-item-txt-btn"
                      data-id={cases.id}
                      onClick={handleCase}
                    >
                      <ConditionCase
                        data={cases}
                        onUpdateValue={handleUpdateCondition}
                        onClickTarget={handleCase}
                      />
                    </button>
                    {cases.hasOwnProperty("orgroup") &&
                      cases.orgroup.length > 0 &&
                      cases.orgroup[0].cases.length > 0 && (
                        <Box className="condition-list-box-grup">
                          <ConditionList
                            data={cases.orgroup}
                            orgroup={true}
                            parentcaseid={cases.id}
                            onSelectItem={props.onSelectItem}
                            onUpdateItem={props.onUpdateItem}
                          />
                        </Box>
                      )}
                  </div>
                ))}
              </Box>
            </List>
          </Collapse>
        </Box>
      ))}
    </div>
  );
}

function ConditionCase(props) {
  const cases = props.data;
  const [caseTarget, setCaseTarget] = React.useState(cases["target"]);
  React.useEffect(() => {
    setCaseTarget(cases["target"]);
  }, [cases]);
  const [caseOperator, setCaseOperator] = React.useState(cases["operator"]);
  React.useEffect(() => {
    setCaseOperator(cases["operator"]);
  }, [cases]);
  const [caseValue, setCaseValue] = React.useState(cases["value"]);
  React.useEffect(() => {
    setCaseValue(cases["value"]);
  }, [cases]);

  function handleCaseTarget(ev) {
    setCaseTarget(ev.target.value);

    cases["target"] = ev.target.value;
    props.onUpdateValue(cases);
  }

  function handleOperatorSelect() {
    let ev = { currentTarget: {} };
    ev.currentTarget.dataset = cases;
    props.onClickTarget(ev);
  }

  function handleCaseOperator(ev) {
    setCaseOperator(ev.target.value);

    cases["operator"] = ev.target.value;
    props.onUpdateValue(cases);
  }

  function handleCaseValue(ev) {
    setCaseValue(ev.target.value);

    cases["value"] = ev.target.value;
    props.onUpdateValue(cases);
  }

  return (
    <div className="condition-case">
      <InputBase
        className="condition-editor-txtinput"
        margin="dense"
        variant="outlined"
        value={caseTarget}
        onChange={handleCaseTarget}
      />
      <input pattern="[^\\[\\] ~`!@#$%&*()+=]" style={{ display: "none" }} />
      <NativeSelect
        value={caseOperator}
        onChange={handleCaseOperator}
        onMouseDown={handleOperatorSelect}
        input={<InputBase className="condition-editor-drpdwn-input" />}
      >
        {setOptions().map((option, id) => (
          <option key={id} value={option.val}>
            {option.text}
          </option>
        ))}
      </NativeSelect>
      <InputBase
        className="condition-editor-txtinput"
        margin="dense"
        variant="outlined"
        value={caseValue}
        onChange={handleCaseValue}
      />
    </div>
  );
}

function manipulateConditionsString(arrCondition) {
  if (arrCondition.length === 0) {
    return "";
  }

  let strCondition = "";
  for (let i = 0; i < arrCondition.length; i++) {
    const groupcase = arrCondition[i];
    if (groupcase["cases"].length === 0) {
      arrCondition.splice(i, 1);
      continue;
    }
    const groupStr = parseGroupCase(groupcase);
    if (groupStr.length !== 0) {
      strCondition += "(" + parseGroupCase(groupcase) + ")";
      if (i !== arrCondition.length - 1) {
        strCondition += " OR ";
      }
    }
  }
  return strCondition;
}
function parseGroupCase(groupcase) {
  const casesGroupcase = groupcase["cases"];

  let strCase = "";
  for (let j = 0; j < casesGroupcase.length; j++) {
    const casecondition = casesGroupcase[j];
    let ORgroupcase = manipulateConditionsString(casecondition["ORGroupCase"]);
    ORgroupcase = ORgroupcase.length > 0 ? " OR " + ORgroupcase : "";

    if (casecondition["value"] === "__BLANK__") {
      strCase +=
        "(" +
        casecondition["target"] +
        " " +
        getConditionOperator(casecondition["operator"]) +
        " ''" +
        ORgroupcase +
        ")";
    } else {
      strCase +=
        "(" +
        casecondition["target"] +
        " " +
        getConditionOperator(casecondition["operator"]) +
        " " +
        casecondition["value"] +
        ORgroupcase +
        ")";
    }

    if (j !== casesGroupcase.length - 1) {
      strCase += " AND ";
    }
  }
  return strCase;
}
/* function parseGroupCase(groupcase){
    const casesGroupcase = groupcase['cases'];

    let strCase = "";
    for (let i = 0; i < casesGroupcase.length; i++) {
      const casecondition = casesGroupcase[i];
      strCase += parseCase(casecondition);
      if(i > 0){
        strCase += "AND";
      }
      
    }
  } */

function getConditionOperator(operator) {
  let val = "";
  switch (operator) {
    case "E":
      val = "=";
      break;
    case "NE":
      val = "!=";
      break;
    case "G":
      val = ">";
      break;
    case "GE":
      val = ">=";
      break;
    case "L":
      val = "<";
      break;
    case "LE":
      val = "<=";
      break;
    default:
      val = operator;
  }
  return val;
}
function setOptions() {
  return [
    { val: "", text: "" },
    { val: "E", text: getConditionOperator("E") },
    { val: "NE", text: getConditionOperator("NE") },
    { val: "G", text: getConditionOperator("G") },
    { val: "GE", text: getConditionOperator("GE") },
    { val: "L", text: getConditionOperator("L") },
    { val: "LE", text: getConditionOperator("LE") },
  ];
}

function manipulateConditionsData(arrCondition, orgroup, parentid) {
  if (arrCondition.length === 0 && !orgroup) {
    return [
      {
        id: "groupcase-0",
        showor: false,
        cases: [
          {
            id: "group0-case0",
            showand: false,
            target: "",
            operator: "",
            value: "",
          },
        ],
      },
    ];
  } else if (
    arrCondition.length === 1 &&
    arrCondition[0]["cases"].length === 0
  ) {
    return [
      {
        id: "groupcase-0",
        showor: false,
        cases: [
          {
            id: "group0-case0",
            showand: false,
            target: "",
            operator: "",
            value: "",
            orgroup: [],
          },
        ],
      },
    ];
  }

  let arrCondObj = [];
  for (let i = 0; i < arrCondition.length; i++) {
    const groupcase = arrCondition[i];
    const casesGroupcase = groupcase["cases"];

    let arrCondCases = [];
    for (let j = 0; j < casesGroupcase.length; j++) {
      const casecondition = casesGroupcase[j];

      //let ORgroupcase = manipulateConditionsData(casecondition['ORGroupCase'], 'ORGroup');
      //console.log(j, "##### ORgroupcase ####", ORgroupcase);

      let condVal = casecondition["value"];
      /* if(condVal === '__BLANK__'){
          condVal = "";
        } */

      let caseid = "group" + i + "-case" + j;
      let _showand = j === 0 ? false : true;
      let _orgroup =
        casecondition["ORGroupCase"].length > 0
          ? casecondition["ORGroupCase"]
          : [];
      if (orgroup) caseid = parentid + "-or" + caseid;

      arrCondCases.push({
        id: caseid,
        showand: _showand,
        target: casecondition["target"],
        operator: casecondition["operator"],
        value: condVal,
        orgroup: _orgroup,
      });
    }

    let _showor = true;
    if (i === 0 && !orgroup) {
      _showor = false;
    }
    arrCondObj.push({
      id: "groupcase-" + i,
      showor: _showor,
      cases: arrCondCases,
    });
  }

  return arrCondObj;
}

export default ConditionEditor;
