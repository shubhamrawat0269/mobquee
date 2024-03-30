import React from "react";
import "./ActionListViewStyle.css";
import {
  IconButton,
  SvgIcon,
  Typography,
  Badge,
  Checkbox,
  Collapse,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

import ConditionEditor from "../../editors/mockups/ConditionEditor/conditionEditor";
import {
  AddCircleOutlineOutlined,
  AddCircleOutlined,
  RemoveCircleOutlineRounded,
  RemoveCircleRounded,
} from "@mui/icons-material";

export default function ActionListView(props) {
  const resizeval = "horizontal"; //(props.resizeview && props.resizeview !== "") ? 'horizontal' : 'none';
  const displayval = "block"; //(props.resizeview && props.resizeview !== "") ? 'block' : 'none';
  const data = props.listdata;
  const actionlist = data.list;
  //console.log(data, "------------ ActionList ---------", actionlist);
  const appliedListH = actionlist.length > 0 ? `calc(100% - 28px)` : "100%";

  const expandActions = props.expandstate;

  const isActionFind = props.isActionFind;
  const selectedActionId = props.isActionFind
    ? props.selectedActionId
      ? props.selectedActionId
      : ""
    : "";
  const [selectedAction, setSelectedAction] = React.useState(selectedActionId);
  React.useEffect(() => {
    setSelectedAction(selectedActionId);

    const el = document.getElementById("appliedactionlist");
    if (el && isActionFind) {
      const node = document.getElementById(selectedActionId);
      if (node) {
        //console.log(node, "node.scrollTop >>>>>", node.offsetTop, document.body.scrollTop);
        node.scrollIntoView(false);
      }
    }
  }, [selectedActionId, isActionFind]);

  function getSelectedAction(_params, _set) {
    //console.log(_params, _set, "------------ getSelectedAction ---------", data);
    props.onNodeSelection(_params, _set);
    setSelectedEvent("");

    setSelectedAction(_set["id"]);
  }

  const [selectedEvent, setSelectedEvent] = React.useState("");
  function getSelectedEvent(_level) {
    //console.log(selectedEvent, "------------ getSelectedEvent ---------", _level);
    setSelectedAction("");
    let _elselevel = false;
    if (_level.indexOf(".else") > -1) {
      const elseLI = _level.lastIndexOf(".else");
      //console.log(_level, "------------ getSelectedEvent ---------", elseLI, _level.length);
      if (elseLI === _level.length - 5) {
        _elselevel = true;
      }
    }
    if (!_elselevel) {
      let n = _level.lastIndexOf("_");
      setSelectedEvent(_level.substr(0, n));
    } else {
      setSelectedEvent(_level);
    }

    props.onActionEventSelection(_level);
  }

  function closeConditionEditor(condition, actionData) {
    //console.log(actionlist, "------------ closeConditionEditor ---------", condition, actionData);
    //props.onApplyCondition(condition, actionData);
  }

  const [checkedActionIds, setCheckedActionIds] = React.useState(
    props.allCheckedIds
  );
  React.useEffect(() => {
    setCheckedActionIds(props.allCheckedIds);
  }, [props.allCheckedIds]);
  function handleCheckedAction(checkedAction) {
    const value = checkedAction["id"];
    //console.log(props.allCheckedIds, checkedActionIds, "------------ handleCheckedAction ---------", value);

    const newChecked = [...checkedActionIds];
    const currentIndex = checkedActionIds.indexOf(value);
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setCheckedActionIds(newChecked);

    props.onCheckAction(newChecked);
  }

  return (
    <div
      className="action-list-container"
      style={{ resize: resizeval, height: appliedListH }}
    >
      <List
        id="appliedactionlist"
        component="nav"
        dense={true}
        aria-labelledby="nested-list-subheader"
        className="action-list"
      >
        {actionlist.map((item) => (
          <ListBranch
            key={item.id}
            node={item}
            expandstate={expandActions}
            actions={actionlist}
            selectedAction={selectedAction}
            selectedEvent={selectedEvent}
            checkedActionIds={checkedActionIds}
            onSelection={getSelectedAction}
            onEventSelect={getSelectedEvent}
            closeConditionEditor={closeConditionEditor}
            onCheckMainAction={handleCheckedAction}
          ></ListBranch>
        ))}
      </List>
      <div className="action-resize-section" style={{ display: displayval }} />
    </div>
  );
}

function ListBranch(props) {
  const _level = props.node.level;
  const _arrlevel = [];
  for (let i = 0; i < _level; i++) {
    _arrlevel.push(i);
  }

  var onElseExist = false;
  var conditionExist = false;
  var onElseActionExist = false;
  const elseText = "<else>";

  const _text = props.node.title;
  const _id = props.node.id;

  if (_id && _id.toString().indexOf("onelse") > -1) {
    //onElseExist = true;
    let n = _id.toString().lastIndexOf(".");
    let res = _id.toString().substring(n);
    if (res.indexOf("onelse") > -1) {
      onElseExist = true;
    }
  }

  if (!onElseExist) {
    const _actionparam = props.node.action["params"];
    if (_actionparam.hasOwnProperty("condition")) {
      const _actioncond = _actionparam["condition"];
      let conditionGroupCase = _actioncond["groupcases"];
      if (conditionGroupCase && conditionGroupCase.length > 0) {
        const conditionCase = conditionGroupCase[0]["cases"];
        if (conditionCase && conditionCase.length > 0) {
          conditionExist = true;
        }
      }
    }
    const _actionActions = props.node.action["actions"];
    const onElseActions = _actionActions["onElse"];
    if (onElseActions.length > 0) onElseActionExist = true;
  }

  const _subactions = props.node.subactions;
  const actionDetail = props.node.action;
  const subActions = actionDetail["actions"];
  var subactionsDetail = [];
  if (subActions) {
    var subactionsExist = false;
    for (let i = 0; i < _subactions.length; i++) {
      const element = _subactions[i];
      const subactionData = subActions[element];
      if (subactionData.length > 0) {
        subactionsExist = true;
      }
      subactionsDetail = setSubactionsDetail2(
        element,
        subactionData,
        subactionsDetail
      );
    }
    subactionsDetail = [];
    if (props.node.subactionsdata.length > 0) {
      subactionsDetail = setSubactionsDetail(
        props.node.subactionsdata[0],
        subactionsDetail
      );
    }
  }

  let conditionData = {};
  let condText = "+";
  const actionParam = actionDetail["params"];
  if (actionParam) {
    //console.log(actionDetail, "....actionParam...", actionParam);
    conditionData = actionParam["condition"]["groupcases"];
    //condText = (conditionData.length === 0) ? '+' : 'c';
    condText = conditionExist ? "c" : "+";
  }

  const [elseId, setElseId] = React.useState("");
  function elseEventClick() {
    let elseEventlevel = props.node["id"] + ".else";
    //console.log("..... elseEventlevel ......", elseEventlevel);
    props.onEventSelect(elseEventlevel);

    setElseId(elseEventlevel);
  }

  function handleEventClick(actionEventlevel) {
    //console.log("..... actionEventlevel ......", actionEventlevel);
    props.onEventSelect(actionEventlevel);
  }

  function handleSelection(e) {
    let _dataset = e.currentTarget.dataset;
    //console.log(actionParam, _dataset.id + " >> action level is: " + _dataset.level);
    //console.log(_dataset, props.selectedAction," ... handle Action Selection >>  ", props.node.id);

    props.onSelection(actionParam, _dataset);
  }

  const expandActions = props.expandstate;
  const [expand, setActionExpand] = React.useState(props.expandstate);
  React.useEffect(() => {
    setActionExpand(props.expandstate);
  }, [props.expandstate]);

  function handleActionExpand(e) {
    setActionExpand(!expand);
  }

  //////////////////////////////////////////////
  const [showCond, setShowCondition] = React.useState(false);
  const [conditionId, setConditionId] = React.useState("0");
  const [conditionArr, setConditionArr] = React.useState([]);
  const [actionData, setActionData] = React.useState([]);

  function handleConditionEditorOpen(e) {
    //const prevActionData = JSON.parse(JSON.stringify(props.actions));
    const prevActionData = []; //Object.assign({}, props.actions);
    setActionData(prevActionData);

    let _dataset = e.currentTarget.dataset;
    //console.log(props.actions, props.node.action, conditionArr, " ...", _dataset.id + " >> condition Id is: " + conditionId);
    setConditionId(_dataset.id);

    //console.log(" ...open ## handleConditionEditor... ", props.node.action, conditionData);
    setShowCondition(true);
  }
  function handleConditionEditorClose(_data) {
    setShowCondition(false);

    if (_data) {
      conditionData = _data;

      if (_data.length > 0) {
        if (props.node.action["params"]["condition"]["groupcases"]) {
          const _groupCases =
            props.node.action["params"]["condition"]["groupcases"];
          if (_groupCases[0]["cases"] && _groupCases[0]["cases"].length === 0) {
            _groupCases[0]["cases"] = _data[0]["cases"];
          }
        }
      } else {
        if (props.node.action["params"]["condition"]["groupcases"]) {
          props.node.action["params"]["condition"]["groupcases"] = [];
        }
      }

      setConditionArrData(conditionArr, conditionId, _data, actionData);
    }
  }
  function setConditionArrData(
    conditionArr,
    conditionId,
    condData,
    actiondata
  ) {
    let condexist = false;
    const condArr = conditionArr;
    condArr.forEach((condition) => {
      if (condition["id"] === conditionId) {
        condexist = true;
        condition["conditions"] = condData;
      }
    });
    if (!condexist) {
      const condObj = { id: conditionId, conditions: condData };
      condArr.push(condObj);
    }
    setConditionArr(condArr);

    props.closeConditionEditor(condArr, actiondata);
  }

  function handleCheckMainAction() {
    //console.log("kMainAction >>>>>", props.node);
    const actionSet = {
      id: props.node["id"],
      level: "0",
      name: props.node["name"],
      type: props.node["type"],
    };
    props.onCheckMainAction(actionSet);
  }

  return (
    <div className="">
      <div className="main-action-section" id={props.node.id}>
        {_level !== undefined && _level > -1 && (
          <div className="">
            {!isNaN(props.node.id) && (
              <Checkbox
                color="default"
                style={{ padding: 0 }}
                disableRipple
                checked={
                  props.checkedActionIds.indexOf(props.node["id"]) !== -1
                }
                onChange={handleCheckMainAction}
              ></Checkbox>
            )}
            {_arrlevel.map((index) => (
              <div key={index} />
            ))}
          </div>
        )}
        {onElseExist && _text.length > 0 && (
          <ListItemText className="" primary={"<else>"} />
        )}
        {!onElseExist && (
          <div>
            <Typography className="action-plus-icon">{condText}</Typography>
            <IconButton
              className=""
              data-id={props.node.id}
              onClick={handleConditionEditorOpen}
            >
              <SvgIcon>
                <path d="M0 0h24v24H0z" fill="none" />
                <polygon
                  points="0 12 12 0 24 12 12 24 0 12"
                  stroke="black"
                  strokeWidth="1"
                />
              </SvgIcon>
            </IconButton>
          </div>
        )}
        {_text.length > 0 && (
          <ListItem
            button
            className="action-view-item"
            data-id={props.node.id}
            data-level={props.node.level}
            data-name={props.node.method}
            data-type={props.node.type}
            onClick={handleSelection}
          >
            <ListItemText
              className=""
              primary={<h6>{_text}</h6>}
              style={
                props.selectedAction === props.node.id + ""
                  ? { backgroundColor: "#65de45" }
                  : { backgroundColor: "" }
              }
            />
          </ListItem>
        )}
        {_text.length > 0 && subactionsExist && (
          <IconButton className="" onClick={handleActionExpand}>
            {expand ? <RemoveCircleRounded /> : <AddCircleOutlined />}
          </IconButton>
        )}
        {_text.length > 0 && !subactionsExist && (
          <IconButton className="" onClick={handleActionExpand}>
            {expand ? (
              <RemoveCircleOutlineRounded />
            ) : (
              <AddCircleOutlineOutlined />
            )}
          </IconButton>
        )}
      </div>
      {_level !== undefined && _level > -1 && (
        <Collapse in={expand} timeout="auto" unmountOnExit>
          <List dense={true} component="div" disablePadding className="">
            {subactionsDetail.map((subaction, index) => (
              <div id="subactionitem" className="" key={index}>
                <SubactionList
                  subactionsExist={subactionsExist}
                  expandstate={expandActions}
                  nodeid={props.node.id}
                  selectedAction={props.selectedAction}
                  selectedEvent={props.selectedEvent}
                  detail={subaction}
                  conditionData={conditionData}
                  actions={props.actions}
                  onEventClick={handleEventClick}
                  onSelection={props.onSelection}
                  closeConditionEditor={props.closeConditionEditor}
                />
              </div>
            ))}
          </List>
        </Collapse>
      )}
      {conditionExist && !onElseActionExist && (
        <button
          className=""
          onClick={elseEventClick}
          style={
            elseId !== "" && props.selectedEvent === elseId
              ? { backgroundColor: "#65de45" }
              : { backgroundColor: "" }
          }
        >
          {elseText}
        </button>
      )}
      {showCond && (
        <ConditionEditor
          show={showCond}
          data={conditionData}
          elseExist={onElseActionExist}
          onCloseConditionEditor={handleConditionEditorClose}
        />
      )}
    </div>
  );
}

function SubactionList(props) {
  const expandSubActions = props.expandstate;
  const subaction = props.detail;
  const actiondata = subaction["data"]; //(subaction.name === "onElse") ? [subaction.data] : subaction['data'];
  //console.log(props.nodeid, ".....", subaction, " >>>>>SubactionList>>>>>>", actiondata);

  let nonelseActions = actiondata.filter(function (item) {
    /* if(item.id.indexOf('onelse') === -1) {
            return true;
        }
        return false; */
    return true;
  });
  const subactionsCount = nonelseActions.length;
  //const subactionsExist = props.subactionsExist;

  const selectedEvent = props.selectedEvent;
  function onActionEventClick(e) {
    if (typeof e === "string") {
      props.onEventClick(e); //<<-- some kind of HOTFIX, need to debug
    } else {
      let actionEventlevel =
        props.nodeid + "." + subaction.name + "_" + subactionsCount;
      //console.log(e, typeof e, ".....SubactionList actionEventlevel ......", actionEventlevel);
      props.onEventClick(actionEventlevel);
    }
  }

  function onSubactionSelect(actionParams, actionset) {
    //console.log(actionParams, " >>>>>>>>>SubactionList>>>>>onSubactionSelect>>>>", actionset);
    props.onSelection(actionParams, actionset);
  }

  function closeConditionEditor(actionParams, actionData) {
    //console.log(actiondata, "..... >SubactionList >>>>> closeConditionEditor ..........", props.conditionData);
    props.closeConditionEditor(actionParams, actionData);
  }

  const [open, setOpen] = React.useState(expandSubActions);
  function onExpandCollapseActions(e) {
    setOpen(!open);
  }

  return (
    <div>
      <div className="" style={{ width: "100%" }}>
        <ListItem
          className="action-subtraction-list"
          button
          onClick={onActionEventClick}
        >
          <ListItemText
            name={props.nodeid + "." + subaction.name}
            className=""
            primary={
              <h6 style={{ padding: "0.35rem" }}>
                {"<" + getSubActionText(subaction.name) + ">"}
              </h6>
            }
            style={
              selectedEvent === props.nodeid + "." + subaction.name
                ? { backgroundColor: "#65de45", margin: "1rem" }
                : { backgroundColor: "", margin: "1rem" }
            }
          />
          <div className="action-list-badge">
            <div className="action-list-chip">{subactionsCount}</div>
          </div>
        </ListItem>
        {/* <Badge
          color="primary"
          invisible={false}
          badgeContent={subactionsCount}
          className="action-list-size-badge"
        >
          <Typography></Typography>
        </Badge> */}

        {subactionsCount === 0 && <IconButton className="" />}
        {subactionsCount > 0 && (
          <IconButton className="" onClick={onExpandCollapseActions}>
            {open ? <AddCircleOutlineOutlined /> : <AddCircleOutlined />}
          </IconButton>
        )}
      </div>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List dense={true} component="div" disablePadding>
          {actiondata.map((child) => (
            <ListBranch
              id="childitem"
              key={child.id}
              node={child}
              data-item={child}
              expandstate={expandSubActions}
              actions={props.actions}
              selectedAction={props.selectedAction}
              selectedEvent={props.selectedEvent}
              onSelection={onSubactionSelect}
              onEventSelect={onActionEventClick}
              closeConditionEditor={closeConditionEditor}
            />
          ))}
        </List>
      </Collapse>
    </div>
  );
}

function setSubactionsDetail2(subaction, actiondata, subactionArray) {
  let actionObj = { name: subaction, data: actiondata };
  subactionArray.push(actionObj);

  return subactionArray;
}

function setSubactionsDetail(subactionData, subactionArray) {
  for (const key in subactionData) {
    if (subactionData.hasOwnProperty(key)) {
      let actionObj = { name: key, data: subactionData[key] };
      subactionArray.push(actionObj);
    }
  }

  return subactionArray;
}

function getSubActionText(eventName) {
  let eventtext = ["success", "error"];
  switch (eventName) {
    case "success":
      eventtext = "Success";
      break;
    case "error":
      eventtext = "Error";
      break;
    case "detectRecords":
      eventtext = "Detect Records";
      break;
    case "onTapOk":
      eventtext = "On Tap OK";
      break;
    case "onTapCancel":
      eventtext = "On Tap Cancel";
      break;
    default:
      eventtext = eventName;
      break;
  }
  return eventtext;
}
