import React from "react";
import { connect } from "react-redux";
import "./ActionEditorStyle.css";

import ActionListView from "../../helpers/ActionListView/ActionListView";

import PropertyValueForm from "../../forms/PropertyValueForm/PropertyValueForm";
import ActionButtonForm from "../../forms/ActionButtonForm/ActionButtonForm";
import ReactXMLParser from "react-xml-parser";
import { setCopiedAction } from "../../ServiceActions";
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Close,
  Delete,
  Done,
  Help,
} from "@mui/icons-material";
import {
  IconButton,
  Box,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Tooltip,
  Snackbar,
  SvgIcon,
  Input,
  Checkbox,
  ListItemSecondaryAction,
  Fab,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";

class ActionEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      actionData: this.props.data,
      show: this.props.show,

      prevActionData: [],
      actionDic: [],
      actionLocale: [],
      actionList: [],
      error: null,
    };

    this.handleCloseActionEditor = this.handleCloseActionEditor.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.data !== this.props.data) {
      this.setState({ actionData: this.props.data });
    }
  }

  componentDidMount() {
    //this.setState({ prevActionData : [].concat(this.state.actionData) });
    this.setState({
      prevActionData: JSON.parse(JSON.stringify(this.state.actionData)),
    });

    this.fetchActionsDic().then((response) =>
      this.fetchActionLocale("en").then((response) => this.fetchActionList())
    );
  }

  fetchActionsDic() {
    return fetch("././config/ActionDic.json")
      .then((res) => res.json())
      .then(
        (result) => {
          let actions = result["Actions"];
          this.setState({ actionDic: actions });
        },
        (error) => {
          console.log("Actions fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  fetchActionLocale(lang) {
    let localefilePath;
    if (lang === "ja" || lang === "jp") {
      localefilePath = "././locale/ja_JP/actionsproperties.json";
    } else {
      localefilePath = "././locale/en_US/actionsproperties.json";
    }

    return fetch(localefilePath)
      .then((res) => res.json())
      .then(
        (result) => {
          //console.log("....Action-Locale fetching success >>>", result);
          let actionLocale = result["ActionLocale"];
          this.setState({ actionLocale: actionLocale });
        },
        (error) => {
          console.log("Action-Locale fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  fetchActionList() {
    return fetch("././config/ActionConfig.json")
      .then((res) => res.json())
      .then(
        (result) => {
          let actions = result["Actions"];
          actions = actions.filter(function (category) {
            return category.include === "true";
          });

          for (let index = 0; index < actions.length; index++) {
            const category = actions[index];
            let actionItems = category["items"];
            category["items"] = this.setActionListLocale(actionItems);
          }
          //console.log("....Action-List with locale >>>", actions);
          this.setState({ actionList: actions });
        },
        (error) => {
          console.log("Action-list fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  setActionListLocale(actionItems) {
    actionItems.forEach((action) => {
      action = this.state.actionLocale.filter(function (item) {
        if (item.method === action.name) {
          action["text"] = item.properties[0]["text"];
          action["toolTip"] = item.properties[0]["toolTip"];
          return true;
        }
        return false;
      });

      //console.log("....forEach >>>", action);
    });

    return actionItems;
  }

  handleActionUpdateData() {
    //console.log(this.props.data, "%%% handleActionUpdateData %%%", this.state.actionData);

    let _actionData = this.state.actionData;
    this.setState({ actionData: _actionData });
  }

  handleActionUpdateValue = (key, val) => {
    this.props.onActionUpdate(key, val);
  };

  handleCloseActionEditor = (param, actions) => {
    const isChange =
      this.state.prevActionData !== this.state.actionData ? true : false;
    if (param === "ok" && isChange) {
      /* console.log(this.props, " ** CloseActionEditor **", this.state.prevActionData, " :: ", this.state.actionData);
        if(actions) {
          let _actiondata = [];
          actions['list'].forEach(element => {
            _actiondata.push(element['action']);
          });
          //console.log(this.state.actionData, " ** CloseActionEditor **", actions, " :: >>>", _actiondata);
          this.setState({ actionData : _actiondata});
        } */
      this.updatePageState();

      this.props.onCloseEditor(param, actions);
      return;
    }
    this.props.onCloseEditor();
  };

  updatePageState = () => {
    let _page = JSON.parse(JSON.stringify(this.props["currentPage"]));
    //this.props.dispatch(setSelectedPageData(_page));

    const layoutState = filterState_byPageid(
      _page["pageid"],
      this.props.editorState
    );
    if (layoutState) {
      let undoState = layoutState["undo"];
      if (undoState) {
        if (undoState.length > 10) {
          undoState.shift();
        }
        undoState.push(_page);
      }
    }
  };

  handleCutCopyAction = (action, mode) => {
    //console.log(mode, "...handleCutCopyAction >>>>", action);
    let actionObj = {};
    if (mode !== "") {
      actionObj = { mode: mode, action: action };
    }
    this.props.dispatch(setCopiedAction(actionObj));
  };

  render() {
    //console.log("this.props actionhelper *******", this.props.actionLocale, "*********", this.props.actionList);
    const currentScrIndex = this.props.currentScreenIndex
      ? this.props.currentScreenIndex
      : 0;
    const pageallChildren = getAllChildrenOnPage(
      this.props.currentPage,
      currentScrIndex
    );

    const baseData = {
      apiconfig: this.props.apiParam,
      project: this.props.appData,
      pagelist: this.props.pageList,
      page: this.props.currentPage,
      children: pageallChildren,
    };
    const { actionLocale, actionList, actionConfig } = this.props; //this.state;
    const { actionDic, actionData, show, prevActionData } = this.state;
    //console.log("this.state actionhelper *******", actionDic, "******", actionLocale, "*********", actionList, "*********", actionConfig);
    const copiedaction = this.props["copiedAction"];

    const manipulateData = manipulateActionsData(
      this.props.data,
      actionList,
      [],
      0,
      ""
    );

    if (!show) {
      return null;
    }

    return (
      <div
        id="dbdetails"
        className="horizontal-align"
        style={{ alignItems: "inherit" }}
      >
        {actionList.length > 0 && actionDic.length > 0 && (
          <ActionViewer
            basedata={baseData}
            dic={actionDic}
            locale={actionLocale}
            list={actionList}
            config123={actionConfig}
            manipulateData={manipulateData}
            actualdata={prevActionData}
            data={actionData}
            copiedData={copiedaction}
            screenIndex={currentScrIndex}
            onUpdateActionData={this.handleActionUpdateData.bind(this)}
            onUpdateActionValue={this.handleActionUpdateValue.bind(this)}
            onCutCopyAction={this.handleCutCopyAction.bind(this)}
            onCloseActionEditor={this.handleCloseActionEditor}
          />
        )}
      </div>
    );
  }
}

function filterState_byPageid(openedpageid, editorstates) {
  let pagestates = editorstates.hasOwnProperty("_pagestates")
    ? editorstates._pagestates
    : [];
  let pagestate = pagestates.filter(function (node) {
    if (node[openedpageid]) {
      return true;
    }
    return false;
  });
  if (pagestate.length > 0) {
    return pagestate[0][openedpageid];
  }

  return null;
}

function ActionViewer(props) {
  const currentScreenIndex = props.screenIndex ? props.screenIndex : 0;

  const widthMenu = ["md", "md", "lg"];
  const [maxWidth, setEditorWidth] = React.useState(widthMenu[0]);

  const [expandcollapseText, setExpandCollapseText] =
    React.useState("Expand All");
  const [expandState, setExpandState] = React.useState(false);

  const [enableActionButtons, setEnableActionButtons] = React.useState(false);
  const [enablePasteButton, setEnablePasteButton] = React.useState(
    getPasteButton(props.copiedData)
  );
  const [enableAddButton, setEnableAddButton] = React.useState(false);
  const [showCategory, setShowCategory] = React.useState(false);
  const [showList, setShowList] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [displayForm, setDisplayForm] = React.useState(false);
  const [editAction, setEditAction] = React.useState(false);
  const [selectedCategory, setCategory] = React.useState("");
  //const [appliedContainerWidth, setAppliedContainerWidth] = React.useState('');
  const [selectedActionLocale, setSelectedActionLocale] = React.useState([]);
  const [selectedActionConfig, setSelectedActionConfig] = React.useState([]);
  const [selectedConfigList, setSelectedConfigList] = React.useState([]);
  const [selectedActionData, setSelectedActionData] = React.useState({});
  const [selectedActionDic, setSelectedActionDic] = React.useState({});
  const [selectedActionId, setSelectedActionId] = React.useState("0");
  const [selectedEvent, setSelectedEvent] = React.useState("");

  const [cutcopyType, setCutCopyType] = React.useState(
    getCutCopyType(props.copiedData)
  );
  const [cutcopyAction, setCutCopyAction] = React.useState(
    getCutCopyActions(props.copiedData)
  );

  const [validationerror, setValidationError] = React.useState("");

  let actionDic = props.dic;
  let actionLocale = props.locale;
  let actionList = props.list;

  const [actionData, setActionData] = React.useState(props.manipulateData); //(manipulateActionsData(props.data, actionList, [], 0, ""));
  //console.log(props.data, "***** actionData ****", actionData);
  //console.log("***** ActionViewer copied Data****", props.copiedData);

  function closeEditor(event) {
    if (event.currentTarget.dataset["type"] !== "ok") {
      props.data.splice(0);
      for (let index = 0; index < props.actualdata.length; index++) {
        const element = props.actualdata[index];
        props.data.push(element);
      }
    }
    //console.log("closeEditor actionData *********", actionData);
    props.onCloseActionEditor(event.currentTarget.dataset["type"], actionData);
  }

  function expandcollapseActions() {
    if (expandcollapseText === "Expand All") {
      setExpandCollapseText("Collapse All");
      setExpandState(true);
    } else {
      setExpandCollapseText("Expand All");
      setExpandState(false);
    }
  }

  function filterLocale_byActionMethod(selectedaction, actionlocale) {
    /* let actionproperties = actionlocale.filter(function(action) {
        return action['method'].toLowerCase() === selectedaction['name'].toLowerCase();
      });  
      if(actionproperties.length > 0) {
        //console.log(selectedaction['name'], "..Selected Action-Locale >>>", actionproperties[0]);
        return actionproperties[0]['properties'];
      } */

    for (let i = 0; i < actionlocale.length; i++) {
      if (
        actionlocale[i]["method"].toLowerCase() ===
        selectedaction["name"].toLowerCase()
      ) {
        return actionlocale[i]["properties"];
      }
    }

    return [];
  }

  ///////////////////////////////////////////

  const [selectallchecked, setSelectallChecked] = React.useState(false);
  const [checkedIds, setCheckedIds] = React.useState([]);

  function handleSelectAllActions(event) {
    let updatedValue = Boolean(event.currentTarget.checked);
    console.log(props, "..handleSelectAllActions >>>>>", updatedValue);
    setSelectallChecked(updatedValue);
    setEnableActionButtons(updatedValue);
    setEnableAddButton(updatedValue);

    if (updatedValue) {
      const arrIds = [];
      const len = props["data"].length;
      for (var i = 0; i < len; i++) {
        arrIds.push(i);
      }
      setCheckedIds(arrIds);
    } else {
      setCheckedIds([]);
    }
  }

  function handleActionCheck(checkIds) {
    if (checkIds) {
      setCheckedIds(checkIds);

      if (checkIds.length === 0) {
        setEnableActionButtons(false);
        setEnableAddButton(false);
      } else {
        setEnableActionButtons(true);
        setEnableAddButton(true);
      }

      if (checkIds.length !== props["data"].length) {
        setSelectallChecked(false);
      } else {
        setSelectallChecked(true);
      }
    }
  }

  /////// Applied Actions implementation //////

  function handleActionSelect(actionParams, actionSet) {
    setSelectedActionId(actionSet["id"]);
    setSelectedAppliedAction(actionData, actionParams, actionSet);
  }

  function setSelectedAppliedAction(actionData, actionParam, actionSet) {
    //console.log(actionSet, "selectedActionData >>>>", actionData['list']);
    setSelectedActionLocale(
      filterLocale_byActionMethod(actionSet, actionLocale)
    );

    let _selctedAction = actionData["list"].filter(function (_action) {
      return (
        _action.method === actionSet["name"] &&
        _action.id.toString() === actionSet["id"]
      );
    });
    //console.log(actionLocale, "******", actionSet, actionData['list'], "selectedActionData >>>>", _selctedAction);

    let _selectedActionDef;
    if (_selctedAction.length > 0) {
      //main branch
      //setSelectedActionDic(_selctedAction[0]['action']);
      //manageAppliedActions(props.basedata, _selctedAction[0]['action']);
      _selectedActionDef = _selctedAction[0]["action"];
    } else {
      //child branch
      _selctedAction = getSelectedActiondic(actionData["list"], actionSet);
      if (_selctedAction) {
        //setSelectedActionDic(_selctedAction['action']);
        //manageAppliedActions(props.basedata, _selctedAction['action']);
        _selectedActionDef = _selctedAction["action"];
      }
    }

    if (actionDic) {
      let _dataset = { name: actionSet["name"] };
      let _actionData = getActionDic_byActionMethod(_dataset, actionDic);
      if (_actionData && _actionData.hasOwnProperty("params")) {
        const objParams = Object.assign({}, _actionData["params"], actionParam);
        actionParam = Object.assign(actionParam, objParams); //objParams;
      }
    }

    if (_selectedActionDef) {
      if (_selectedActionDef.hasOwnProperty("params")) {
        _selectedActionDef["params"] = Object.assign(
          _selectedActionDef["params"],
          actionParam
        );
      }
      setSelectedActionDic(_selectedActionDef);
      manageAppliedActions(props.basedata, _selectedActionDef, props);
    } else {
      console.log(
        actionSet["id"],
        "<<< selectedActionDef >>>",
        _selectedActionDef
      );
    }

    if (props.config) {
      const actConfig = filterActionConfig(
        props.config,
        actionSet["type"],
        actionSet["name"],
        props.basedata
      );
      populateActionForm(actConfig);
    } else {
      /* const actionConfig = getConfiglist(actionSet['name']);
        if(actionConfig.length > 0){
          console.log(actionSet['name'], "..Selected Applied Action", actionConfig);
          populateActionForm(actionConfig);
        }else { */
      fetchActionConfig(
        actionSet["type"],
        actionSet["name"],
        props.basedata
      ).then((response) => populateActionForm(response));
      //}
    }
    //console.log(selectedActionData, ".. selectedActionData >>>>", actionParam);
    let actData = selectedActionData;
    actData = actionParam;
    setSelectedActionData(actData);
    setEnableActionButtons(true);
    setEnableAddButton(true);
    //setAppliedContainerWidth('');
  }

  function getSelectedActiondic(appliedActionList, selectedActionSet) {
    let appliedAction;

    let _selectedActionId = selectedActionSet["id"];
    let arrSelectedId = _selectedActionId.split(".");

    if (arrSelectedId.length === 1) {
      const mianelementId = arrSelectedId[0];
      if (mianelementId.indexOf("onelse") > -1) {
        const _id = parseInt(mianelementId);
        appliedAction = appliedActionList[_id]["actions"]["onElse"][0];
      } else {
        appliedAction = appliedActionList[arrSelectedId[0]];
      }
    } else {
      //console.log(_selectedActionId, "get >> Selected Action *********", appliedActionList);
      let strId = "";
      for (let index = 0; index < arrSelectedId.length; index++) {
        const elementId = arrSelectedId[index];
        //console.log(index, arrSelectedId, " --------- ", strId, elementId, isNaN(parseInt(elementId)), " ********* ", appliedAction);
        if (strId.length === 0) {
          strId = elementId;

          let mainIndex = parseInt(elementId);
          //const mainAction = appliedActionList[mainIndex];
          let _branchAction = appliedActionList.filter(function (actionObj) {
            return actionObj.id === mainIndex;
          });
          const mainAction = _branchAction[0];
          //console.log("mainAction >>>", mainAction);
          if (
            mainAction &&
            mainAction["id"].toString().indexOf("onelse") > -1
          ) {
            mainIndex = mainIndex + 1;
            appliedAction = appliedActionList[mainIndex];
          } else {
            appliedAction = mainAction;
          }

          if (elementId.indexOf("onelse") > -1) {
            appliedAction = appliedAction["onelsedata"][0];
          }
        } else {
          if (appliedAction) {
            strId = strId + "." + elementId;

            let actionEventName = elementId.split("_")[0];
            let actionEventIndex = elementId.split("_")[1];
            let onelseEvent = elementId.split("_")[2]
              ? elementId.split("_")[2]
              : "";
            if (onelseEvent === "onelse") {
              actionEventIndex = parseInt(actionEventIndex) + 1;
            }
            const _subactionsData = appliedAction["subactionsdata"][0];
            let actionEvent = _subactionsData[actionEventName];
            /* const _actionObj = actionEvent[parseInt(actionEventIndex)];
              if(_actionObj && _actionObj['id'].toString().indexOf('onelse') > -1) {
                actionEventIndex = parseInt(actionEventIndex) + 1;
                appliedAction = actionEvent[actionEventIndex];
                //console.log(elementId, actionEventName, actionEventIndex, "... _actionObj ********* ", _actionObj, "&&&&", appliedAction);
                if(!appliedAction || appliedAction === undefined) {
                  appliedAction = _actionObj;
                }
              }else {
                appliedAction = actionEvent[parseInt(actionEventIndex)];
                if(elementId.indexOf('onelse') > -1) {              
                  appliedAction = appliedAction['onelsedata'][0];
                }
              } */

            const subactions = appliedAction.action["actions"]
              ? appliedAction.action["actions"][actionEventName]
              : [];
            //console.log(strId, _subactionsData, actionEvent, "... appliedAction ********* ", appliedAction, subactions);
            if (
              subactions.length > 0 &&
              subactions.length < actionEvent.length
            ) {
              const _strId = strId;
              let filterActionData = actionEvent.filter(function (actionObj) {
                return actionObj.id === _strId;
              });
              appliedAction = filterActionData[0];
            } else {
              appliedAction = actionEvent[parseInt(actionEventIndex)];
              if (elementId.indexOf("onelse") > -1) {
                if (appliedAction["onelsedata"].length > 0) {
                  appliedAction = appliedAction["onelsedata"][0];
                }
              }
            }

            //console.log(index, elementId, actionEventName, actionEventIndex, "... appliedAction ********* ", appliedAction);
          } else {
            //console.log(strId, " ######## ", elementId, " ********* ", appliedActionList);
            if (strId.indexOf("onelse") > -1) {
              let _index = parseInt(strId.split("_")[0]);
              const _mainAction = appliedActionList[_index];
              //console.log(appliedActionList, strId, " ######## ", _index, " ********* ", _mainAction);
              if (
                _mainAction &&
                _mainAction["id"].toString().indexOf("onelse") > -1
              ) {
                _index = _index + 1;
                appliedAction = appliedActionList[_index];
              } else {
                appliedAction = _mainAction;
              }
              appliedAction = appliedAction["onelsedata"][0];
            }
          }
        }

        /* if(elementId.indexOf('onelse') > -1 && (elementId.indexOf('success') === -1)) {
            appliedAction = appliedActionList[appliedActionList.length - 1];
            //console.log(elementId, "get >> onelse Action *********", appliedAction);
          }else if(!isNaN(parseInt(elementId))) {
            appliedAction = appliedActionList[elementId];
          }else {
            let actionEventName = elementId.split('_')[0];
            let actionEventIndex = elementId.split('_')[1];
            let actionEvent = appliedAction['subactionsdata'][0][actionEventName];
            
            console.log(actionEventIndex, actionEventName, " ::::: *********", actionEvent);
            const eventActionId = actionEvent[actionEventIndex]['id'];
            if(eventActionId.indexOf('_onelse') > -1){
              //console.log(actionEventIndex, " ****&&&&&&&&****", actionEvent);
              appliedAction = actionEvent[parseInt(actionEventIndex)];
              continue;
            }
            appliedAction = actionEvent[actionEventIndex];
          }  */
      }
    }

    return appliedAction;
  }

  /* function getConfiglist(methodname){
      let configList = selectedConfigList;
      let _configList = configList.filter(function(category) {
        return category.method === methodname;
      });
      
      if(_configList.length > 0){
        return _configList[0]['config'];
      }
      else {
        return [];
      }
    } */
  function populateConfiglist(methodname) {
    let configList = selectedConfigList;
    let _configList = configList.filter(function (category) {
      return category.method === methodname;
    });

    if (_configList.length === 0) {
      let configObj = { method: methodname, config: selectedActionConfig };
      configList.push(configObj);
      setSelectedConfigList(configList);
    }
    //console.log(methodname, "..... populateConfiglist >>>>", configList);
  }

  function populateActionForm(_actionconfig) {
    //console.log("..... populateActionForm >>>>", _actionconfig);
    if (_actionconfig) {
      let actConfig = selectedActionConfig;
      actConfig.splice(0, 1, _actionconfig[0]);
      //console.log(_actionconfig, selectedActionConfig, "..... populateActionForm >>>>", actConfig);
      setSelectedActionConfig(actConfig[0].children); //[{category, type, targetClass, children[{name, properties[{path,input,init,datasource....}]}]}]

      const methodname = _actionconfig[0]["method"];
      populateConfiglist(methodname);

      setShowForm(false);
      showAppliedAction();
    } else {
      console.log("populateActionForm : _actionconfig .... ShowCategory ");
      /* setShowCategory(true);
        setEditorWidth(widthMenu[1]); */
    }
  }

  function showAppliedAction() {
    setShowCategory(false);

    setEditorWidth(widthMenu[2]);
    setShowForm(true);
    setEditAction(true);
    setValidationError("");
  }

  function handleEventSelect(_event) {
    setSelectedEvent(_event);
    //console.log("------------ getSelectedEvent ---------", _event);
    setShowForm(false);
    setEnableActionButtons(false);
    setEnableAddButton(true);
    setEditAction(false);
    setShowCategory(true);
    setEditorWidth(widthMenu[2]);
    //setAppliedContainerWidth('');

    if (getPasteButton(props.copiedData)) {
      setEnablePasteButton(true);
    }
  }

  /////// Cut, Copy & Paste applied action implementation //////

  const [operationMessage, setOperationalMessage] = React.useState("");
  function handleCloseOperationMessage() {
    setOperationalMessage("");
  }

  function cutAppliedAction() {
    setEnableActionButtons(false);
    setEnablePasteButton(true);

    setCutCopyType("cut");

    const _cutAction = getAction_forCutCopy("cut");

    /* if(!selectallchecked && _cutAction) {
        setCutCopyAction(_cutAction);
      }else {
        if(selectallchecked) {
          props.onCutCopyAction(props.data, 'copy');          
        }
      } */

    if (selectallchecked) {
      //props.onCutCopyAction(props.data, 'copy');
      setOperationalMessage("Select All > cut-paste not supported.");
      setEnablePasteButton(false);
    } else {
      if (checkedIds && checkedIds.length > 0) {
        let copiedActions = [];
        for (var j = 0; j < checkedIds.length; j++) {
          const cid = parseInt(checkedIds[j]);
          copiedActions.push(props.data[cid]);
        }
        props.onCutCopyAction(copiedActions, "copy");
      } else {
        if (_cutAction) {
          setCutCopyAction(_cutAction);
        }
      }
    }
  }

  function copyAppliedAction() {
    setEnableActionButtons(false);
    setEnablePasteButton(true);

    setCutCopyType("copy");

    const _copyAction = getAction_forCutCopy("copy");
    //console.log(selectallchecked, "handleAction Copy >>>>", checkedIds, _copyAction);

    if (selectallchecked) {
      props.onCutCopyAction(props.data, "copy");
    } else {
      if (checkedIds && checkedIds.length > 0) {
        let copiedActions = [];
        for (var j = 0; j < checkedIds.length; j++) {
          const cid = parseInt(checkedIds[j]);
          copiedActions.push(props.data[cid]);
        }
        props.onCutCopyAction(copiedActions, "copy");
      } else {
        if (_copyAction) {
          setCutCopyAction(_copyAction);
          const action_forPaste = JSON.parse(JSON.stringify(_copyAction));
          props.onCutCopyAction(action_forPaste, "copy");
        }
      }
    }
  }

  function getAction_forCutCopy(type) {
    let appliedActionList = props.data;

    let _cutcopyAction;
    let arrSelectedId = selectedActionId.split(".");
    if (arrSelectedId.length === 1) {
      //means one of the 'main' action selected
      const mainelementId = arrSelectedId[0];
      if (mainelementId.indexOf("onelse") > -1) {
        const _id = parseInt(mainelementId);
        _cutcopyAction = appliedActionList[_id]["actions"]["onElse"][0];
        if (type === "cut") {
          //appliedActionList[_id]['actions']['onElse'] = [];
        }
      } else {
        _cutcopyAction = appliedActionList[arrSelectedId[0]];
        if (type === "cut") {
          //appliedActionList.splice(arrSelectedId[0], 1);
        }
      }
    } else {
      //means one of the 'child' action selected
      for (let index = 0; index < arrSelectedId.length; index++) {
        const elementId = arrSelectedId[index];
        if (!isNaN(parseInt(elementId))) {
          if (elementId.indexOf("onelse") > -1) {
            const _id = parseInt(elementId);
            //console.log(_id, "appliedActionList >>>", appliedActionList);
            _cutcopyAction = appliedActionList[_id]["actions"]["onElse"][0];
          } else {
            _cutcopyAction = appliedActionList[elementId];
          }
        } else {
          let actionEventName = elementId.split("_")[0];
          let actionEventIndex = elementId.split("_")[1];
          //console.log(_cutcopyAction, "***********", arrSelectedId, "####", index, actionEventName, actionEventIndex);
          if (_cutcopyAction) {
            let actionEvent = _cutcopyAction["actions"][actionEventName];
            _cutcopyAction = actionEvent[actionEventIndex];
            if (elementId.indexOf("onelse") > -1) {
              _cutcopyAction = _cutcopyAction["actions"]["onElse"][0];
            }

            if (type === "cut" && index === arrSelectedId.length - 1) {
              //actionEvent.splice(actionEventIndex, 1);
            }
          }
        }
      }
    }

    return _cutcopyAction;
  }

  function pasteAction() {
    let appliedActionList = props.data;

    //console.log(cutcopyType, '....pasteAction....', selectedActionId, selectedEvent);
    if (cutcopyType === "cut") {
      // validate about where to paste
    }

    //get reference of selected action
    /* let cutcopyAction;

      let arrSelectedId = selectedActionId.split('.');
      if(arrSelectedId.length === 1) {
        //means one of the 'main' action selected

        const mianelementId = arrSelectedId[0];
        if(mianelementId.indexOf('onelse') > -1) {  
          const _id = parseInt(mianelementId);  
          cutcopyAction = appliedActionList[_id]['actions']['onElse'][0];
          if(cutcopyType === 'cut') {
            appliedActionList[_id]['actions']['onElse'] = [];
          }
        }else {
          cutcopyAction = appliedActionList[arrSelectedId[0]];
          if(cutcopyType === 'cut') {
            appliedActionList.splice(arrSelectedId[0], 1);
          }
        }
        
      }else {
        //means one of the 'child' action selected
        for (let index = 0; index < arrSelectedId.length; index++) {
          const elementId = arrSelectedId[index];
          if(!isNaN(parseInt(elementId))) {
            if(elementId.indexOf('onelse') > -1) {  
              const _id = parseInt(elementId);            
              console.log(_id, "appliedActionList >>>", appliedActionList);
              cutcopyAction = appliedActionList[_id]['actions']['onElse'][0];
            }else {
              cutcopyAction = appliedActionList[elementId];
            }
          }else {
            let actionEventName = elementId.split('_')[0];
            let actionEventIndex = elementId.split('_')[1];
            console.log(cutcopyAction, "***********", arrSelectedId, "####", index, actionEventName, actionEventIndex);
            if(cutcopyAction) {
              let actionEvent = cutcopyAction['actions'][actionEventName];
              //if(index === arrSelectedId.length-1) {
              //  actionEvent.splice(actionEventIndex);
              //}else {
                cutcopyAction = actionEvent[actionEventIndex];
              //} 
              if(elementId.indexOf('onelse') > -1) {               
                cutcopyAction = cutcopyAction['actions']['onElse'][0];
              } 
              
              if(cutcopyType === 'cut' && index === arrSelectedId.length-1) {
                actionEvent.splice(actionEventIndex, 1);
              }
            }           
          }          
        }

      } */

    //console.log(cutcopyType, selectedEvent, '....cutcopyAction >>>>', cutcopyAction);
    /* if(cutcopyAction) {
        const action_forPaste = JSON.parse(JSON.stringify(cutcopyAction));
  
        if(selectedEvent.length === 0) {
          // add action at the end of actionlist
          appliedActionList.push(action_forPaste);        
        }else {
          // add action at the selected event index
          let eventPath = selectedEvent.substring(0, selectedEvent.lastIndexOf('.'));
          let eventName = selectedEvent.substring(selectedEvent.lastIndexOf('.')+1);
          eventName = eventName.split('_')[0];
          if(eventName === "else") {
            eventName = 'onElse';
            //console.log(eventPath, eventName, '....action_forPaste >>>>', action_forPaste);
            action_forPaste['params']['condition']['groupcases'] = [];
            action_forPaste['actions']['onElse'] = [];
          }
          let selectedEventAction = getAction_forSelectedEvent(eventPath);
          //console.log(eventPath, eventName, '....cutcopyAction >>>>', selectedEventAction);

          let selectedEventArr = selectedEventAction['actions'][eventName];
          selectedEventArr.push(action_forPaste);
        }
      }

      if(cutcopyType === 'cut') {
        deleteSelectedAction();

        if(showCategory) {
          setEditorWidth(widthMenu[1]);
        }
      }

      let newActionData = manipulateActionsData(props.data, actionList, [], 0, "");
      setActionData(newActionData);

      setEnableActionButtons(true);
      setEnablePasteButton(false);
      setSelectedEvent('');
      //props.onCutCopyAction({}, ''); */

    if (selectallchecked) {
      let sourceArr = props.data;
      const _targetArr = sourceArr.map((x) => x);
      for (var i = 0; i < _targetArr.length; i++) {
        if (cutcopyType === "copy") {
          pasteActionItem(appliedActionList, _targetArr[i], "copy");
        }
        /* else {
            //props.data.splice(0);
            pasteActionItem([], _targetArr[i], "cut1");
          } */
      }
      if (checkedIds) setCheckedIds([]);
      setSelectallChecked(false);
    } else {
      const _cutcopyAction = getCutCopyActions(props.copiedData);
      const allActions_onOtherWindow = Array.isArray(_cutcopyAction)
        ? true
        : false;
      if (allActions_onOtherWindow) {
        //console.log(cutcopyType, "**** paste ***", _cutcopyAction, checkedIds);
        if (checkedIds && checkedIds.length > 0) {
          for (var j = 0; j < checkedIds.length; j++) {
            const cid = parseInt(checkedIds[j]);
            if (cutcopyType === "copy") {
              pasteActionItem(appliedActionList, props.data[cid], "copy");
            } else {
              pasteActionItem(appliedActionList, props.data[cid], "multicut");
            }
          }
          if (cutcopyType !== "copy") {
            deleteSelectedAction();
          }
          setCheckedIds([]);
          setSelectallChecked(false);
        } else {
          let sourceArr1 = _cutcopyAction;
          const _targetArr1 = sourceArr1.map((x) => x);
          for (var k = 0; k < _targetArr1.length; k++) {
            if (cutcopyType === "copy") {
              pasteActionItem(appliedActionList, _targetArr1[k], "copy");
            }
          }
        }
      } else {
        //console.log(cutcopyAction, "%%%%%%%%%%%", _cutcopyAction);
        pasteActionItem(appliedActionList, cutcopyAction, cutcopyType);
      }
    }

    /* const _cutcopyAction = getCutCopyActions(props.copiedData);
      const allActions_onOtherWindow = Array.isArray(_cutcopyAction) ? true : false;
      //console.log(props.copiedData, cutcopyAction, cutcopyType, "**** paste ***", selectallchecked, allActions_onOtherWindow, checkedIds);
      if(selectallchecked || allActions_onOtherWindow) {
        let sourceArr = (allActions_onOtherWindow && _cutcopyAction.length > 0) ? _cutcopyAction : props.data;        
        //console.log(appliedActionList, "**** paste123 ***", sourceArr);
        const _targetArr = sourceArr.map(x => x);
        for(var i=0; i < _targetArr.length; i++) {
          if(cutcopyType === "copy") {
            pasteActionItem(appliedActionList, _targetArr[i], "copy");
          }
        }
        if(checkedIds)  setCheckedIds([]);
        setSelectallChecked(false);
      }else {
        if(checkedIds && checkedIds.length > 0){
          for(var j=0; j < checkedIds.length; j++) {
            const cid = parseInt(checkedIds[j]);
            if(cutcopyType === "copy") {
              pasteActionItem(appliedActionList, props.data[cid], "copy");
            }else {
              pasteActionItem(appliedActionList, props.data[cid], "multicut");
            }
          }
          if(cutcopyType !== "copy") {
            deleteSelectedAction();
          }
          setCheckedIds([]);
          setSelectallChecked(false);
        }else {
          pasteActionItem(appliedActionList, cutcopyAction, cutcopyType);
        }
      } */
  }

  function pasteActionItem(appliedActionList, _cutcopyAction, _cutcopyType) {
    if (_cutcopyAction) {
      const action_forPaste = JSON.parse(JSON.stringify(_cutcopyAction));
      console.log(props.data, "**** pasteActionItem ***", action_forPaste);
      if (selectedEvent.length === 0) {
        // add action at the end of actionlist
        appliedActionList.push(action_forPaste);
      } else {
        // add action at the selected event index
        let eventPath = selectedEvent.substring(
          0,
          selectedEvent.lastIndexOf(".")
        );
        let eventName = selectedEvent.substring(
          selectedEvent.lastIndexOf(".") + 1
        );
        eventName = eventName.split("_")[0];
        if (eventName === "else") {
          eventName = "onElse";
          //console.log(eventPath, eventName, '....action_forPaste >>>>', action_forPaste);
          action_forPaste["params"]["condition"]["groupcases"] = [];
          action_forPaste["actions"]["onElse"] = [];
        }
        let selectedEventAction = getAction_forSelectedEvent(eventPath);
        //console.log(eventPath, eventName, '....cutcopyAction >>>>', selectedEventAction);

        let selectedEventArr = selectedEventAction["actions"][eventName];
        selectedEventArr.push(action_forPaste);
      }
      //console.log(action_forPaste['method'], ">>>>>", appliedActionList.length)
    }

    if (_cutcopyType === "cut") {
      deleteSelectedAction();

      if (showCategory) {
        setEditorWidth(widthMenu[1]);
      }
    }

    let newActionData = manipulateActionsData(
      props.data,
      actionList,
      [],
      0,
      ""
    );
    setActionData(newActionData);

    setEnableActionButtons(true);
    setEnablePasteButton(false);
    setSelectedEvent("");
    //props.onCutCopyAction({}, '');
  }

  /////// Delete applied action implementation //////

  function deleteSelectedAction() {
    //console.log(props.data, "... delete >>>>>", selectallchecked, checkedIds);
    if (selectallchecked) {
      props.data.splice(0);

      const _actionData = { list: [] };
      setActionData(_actionData);
    } else {
      let appliedActionList = props.data;

      if (checkedIds && checkedIds.length > 0) {
        /* const indexSet = new Set(checkedIds);
          const arrayWithValuesRemoved = appliedActionList.filter((value, i) => !indexSet.has(i));
          console.log(appliedActionList, "...>>>>>", indexSet, arrayWithValuesRemoved);

          let _newActionData = manipulateActionsData(arrayWithValuesRemoved, actionList, [], 0, "");
          setActionData(_newActionData); */

        checkedIds.sort(function (a, b) {
          return b - a;
        });
        for (var i = 0; i < checkedIds.length; i++) {
          appliedActionList.splice(checkedIds[i], 1);
        }
        //console.log(checkedIds, "...>>>>>", appliedActionList);
        setCheckedIds([]);
      } else {
        let arrSelectedId = selectedActionId.split(".");
        //console.log(selectedActionId, "... delete >> Selected Action *********", arrSelectedId);
        if (arrSelectedId.length === 1) {
          const mianelementId = arrSelectedId[0];
          if (mianelementId.indexOf("onelse") > -1) {
            const _id = parseInt(mianelementId);
            appliedActionList[_id]["actions"]["onElse"] = [];
          } else {
            const _selIndex = parseInt(arrSelectedId[0]);
            appliedActionList.splice(_selIndex, 1);
          }
        } else {
          let appliedAction;

          for (let index = 0; index < arrSelectedId.length; index++) {
            const elementId = arrSelectedId[index];
            if (!isNaN(parseInt(elementId))) {
              if (elementId.indexOf("onelse") > -1) {
                const _id = parseInt(elementId);
                //console.log(_id, "... delete >> appliedActionList >>>", props.data);
                appliedAction = props.data[_id]["actions"]["onElse"][0];
              } else {
                appliedAction = props.data[elementId];
              }
            } else {
              let actionEventName = elementId.split("_")[0];
              let actionEventIndex = elementId.split("_")[1];
              //console.log(appliedAction, "***********", arrSelectedId, "####", index, actionEventName, actionEventIndex);
              let actionEvent = appliedAction["actions"][actionEventName];
              if (index === arrSelectedId.length - 1) {
                if (elementId.indexOf("onelse") > -1) {
                  //console.log(index, "... delete >> onElse Action *********", actionEvent, appliedAction);
                  if (
                    actionEvent[actionEventIndex] &&
                    actionEvent[actionEventIndex]["actions"]
                  ) {
                    actionEvent[actionEventIndex]["actions"]["onElse"] = [];
                  }
                } else {
                  actionEvent.splice(actionEventIndex, 1);
                }
              } else {
                appliedAction = actionEvent[actionEventIndex];
                if (elementId.indexOf("onelse") > -1) {
                  appliedAction = appliedAction["actions"]["onElse"][0];
                }
              }
            }
          }
        }
      }

      let newActionData = manipulateActionsData(
        props.data,
        actionList,
        [],
        0,
        ""
      );
      setActionData(newActionData);
    }

    setShowForm(false);
    setEditAction(false);
    setEditorWidth(widthMenu[0]);
    setEnableActionButtons(false);
    setEnableAddButton(false);
  }

  //////////////////////////////////////////////////////////////////////////

  function showActionCategory() {
    //console.log("1 *****selectedEvent*******", selectedEvent);
    setShowForm(false);

    setEditorWidth(widthMenu[2]);
    setShowCategory(true);
    setEnableAddButton(true);
  }

  /////// Action Category implementation //////

  function backCategoryList() {
    setShowCategory(false);
    setShowList(false);
    setShowForm(false);
    setEditorWidth(widthMenu[0]);
    //setAppliedContainerWidth('');

    setEnableActionButtons(false);
    setEnableAddButton(false);
  }

  function showActionList() {
    /* if(selectedActionConfig.length > 0) {
        setEditorWidth(widthMenu[2]);
      }else {
        setEditorWidth(widthMenu[1]);
      }  
      setShowList(false); */
    setEditorWidth(widthMenu[2]);
  }

  //////////////// Custom Action ////////////////

  const [isCustomActionTitle, showCustomActionTitle] = React.useState(false);
  const [customActionTitle, setCustomActionTitle] = React.useState("");
  const [customTitleError, setCustomTitleError] = React.useState("");
  const [customActions, setCustomActionData] = React.useState(
    props.basedata["project"]["customActions"]
  );

  function setCustomActions() {
    const projectdata = props.basedata["project"];
    const _customActions = projectdata["customActions"];
    if (!_customActions.hasOwnProperty("helper")) {
      projectdata["customActions"] = { helper: [] };
    }

    setCategory("custom");
  }

  function handleAddCustomActionObject() {
    const projectdata = props.basedata["project"];
    const customActions = projectdata["customActions"];
    if (!customActions.hasOwnProperty("helper")) {
      projectdata["customActions"] = { helper: [] };
    }

    showCustomActionTitle(true);
  }

  function handleCloseCustomTitleError() {
    setCustomTitleError("");
  }

  function handleCustomActionTitle(event) {
    const val = event.target.value;

    const isValid = validateCustomActionTitle(val);
    if (isValid) {
      setCustomActionTitle(val);
      setCustomTitleError("");
    }
  }
  function validateCustomActionTitle(title) {
    if (title.length > 0) {
      const allowedChars = /\w/g;
      let allowedTitle = title.match(allowedChars);
      if (!allowedTitle) {
        setCustomTitleError("Only alphabets, numbers & underscore allowed.");
        return false;
      }
      if (allowedTitle && title.length !== allowedTitle.length) {
        setCustomTitleError("Only alphabets, numbers & underscore allowed.");
        return false;
      }
    }

    return true;
  }

  function handleSetCustomActionObject() {
    if (customActionTitle.length === 0) {
      setCustomTitleError("Title is required");
      return;
    }
    let customActionHelper = customActions["helper"];
    if (customActionHelper && customActionHelper.length > 0) {
      for (let i = 0; i < customActionHelper.length; i++) {
        const helperObj = customActionHelper[i];
        if (helperObj["title"] === customActionTitle) {
          setCustomTitleError("Title already exist");
          return;
        }
      }
    }
    console.log(customActionTitle, "... SetCustomAction ...", customTitleError);
    setCustomTitleError("");

    //const _index = customActionHelper.length + 1;
    //const _objCustomAction = {title: "custom_"+_index, actions:[]};
    const _objCustomAction = { title: customActionTitle, actions: [] };
    customActionHelper.unshift(_objCustomAction);

    props.basedata["project"]["customActions"] = { helper: customActionHelper };
    setCustomActionData(props.basedata["project"]["customActions"]);

    showCustomActionTitle(false);
    setCustomActionTitle("");
    setCategory("custom");
  }
  function handleCancelCustomActionObject() {
    showCustomActionTitle(false);
    setCustomActionTitle("");
    setCustomTitleError("");
  }

  function closeCustomActionEditor() {
    console.log(
      props.basedata["project"]["customActions"],
      "apply CustomActions >>",
      customActions
    );
    setCustomActionData(customActions);
  }

  function handleDeleteCustomActionObject(event) {
    const _dataset = event.currentTarget.dataset;

    let customActionHelper = customActions["helper"];
    const _index = parseInt(_dataset["index"]);
    customActionHelper.splice(_index, 1);

    props.basedata["project"]["customActions"] = { helper: customActionHelper };
    setCustomActionData(props.basedata["project"]["customActions"]);
  }

  function handleApplyCustomActionObject(event) {
    const _dataset = event.currentTarget.dataset;
    const _index = parseInt(_dataset["index"]);

    let customActionHelper = customActions["helper"];
    const _actions = customActionHelper[_index]["actions"];
    console.log(
      selectedActionDic,
      selectedEvent,
      "***** ApplyCustomAction >>",
      _actions
    );

    for (let i = 0; i < _actions.length; i++) {
      const actionElem = _actions[i];

      if (selectedEvent.length === 0) {
        props["data"].push(actionElem);
      } else {
        let eventPath = selectedEvent.substring(
          0,
          selectedEvent.lastIndexOf(".")
        );
        let eventName = selectedEvent.substring(
          selectedEvent.lastIndexOf(".") + 1
        );
        eventName = eventName.split("_")[0];
        let selectedEventAction = getAction_forSelectedEvent(eventPath);
        let selectedEventArr =
          eventName.toLowerCase() === "else"
            ? selectedEventAction["actions"]["onElse"]
            : selectedEventAction["actions"][eventName];

        // HOTFIX ---
        let subactionArr = getSubactionsDetail(actionElem.method);
        for (let j = 0; j < subactionArr.length; j++) {
          const element = subactionArr[j];
          actionElem.actions[element] = [];
        }
        actionElem.actions[eventName] = [];

        if (actionElem.params["condition"]) {
          if (actionElem.params["condition"].hasOwnProperty("groupcases")) {
            if (actionElem.params["condition"]["groupcases"].length > 0) {
              const mainCondition = JSON.parse(
                JSON.stringify(selectedEventAction.params["condition"])
              );
              //console.log("selectedActionDic cond >>>", mainCondition);
              actionElem.params["condition"]["groupcases"] = [];
              selectedEventAction.params["condition"] = mainCondition;
            }
          }
        }
        // --

        //console.log(selectedActionDic, "%%%%", eventPath, eventName, "******$ applyNewAction $******", selectedEventAction, selectedEventArr);
        const _childAction = JSON.parse(JSON.stringify(actionElem));
        selectedEventArr.push(_childAction);
      }

      let newActionData = manipulateActionsData(
        props.data,
        actionList,
        [],
        0,
        ""
      );
      setActionData(newActionData);
    }
  }

  /////////////////////////////////////////////

  function setSelectedCategory(event) {
    let _selectedCategory = event.currentTarget.dataset.category;
    setCategory(_selectedCategory);
  }

  function generateActionsList(_category) {
    if (_category === "custom") return [];

    let _actions = [];

    let _actionList = actionList.filter(function (category) {
      return category.name === _category;
    });

    if (_actionList.length > 0) {
      let _actionItems = _actionList[0]["items"];
      _actions = _actionItems.filter(function (action) {
        return action.visible === "true";
      });
    }

    return _actions;
  }

  /////// Action List implementation //////

  function backActionList() {
    setShowList(false);
    setShowForm(false);
    setEditorWidth(widthMenu[1]);
    //setAppliedContainerWidth('');
  }

  function setSelectedAction(event) {
    let _dataset = event.currentTarget.dataset;
    //console.log(_dataset, "*** setSelectedAction >>", actionDic);
    //setShowForm(false);

    setSelectedActionLocale(
      filterLocale_byActionMethod(_dataset, actionLocale)
    );
    setSelectedActionDic(getActionDic_byActionMethod(_dataset, actionDic));
    setDisplayForm(true);

    if (props.config) {
      const actConfig = filterActionConfig(
        props.config,
        _dataset.type,
        _dataset.name,
        props.basedata
      );
      generateActionForm(actConfig);
    } else {
      fetchActionConfig(_dataset.type, _dataset.name, props.basedata).then(
        (response) => generateActionForm(response)
      );
    }
  }

  function getActionDic_byActionMethod(selectedaction, actionDicArray) {
    if (actionDicArray.length > 0) {
      let baseDic = actionDicArray[0];
      let baseParams = actionDicArray[0].params;
      let baseActions = actionDicArray[0].actions;

      let newActiondic = actionDicArray.filter(function (actiondic) {
        return actiondic.method === selectedaction.name;
      });

      if (newActiondic.length === 0) {
        return Object.assign({}, baseDic);
      }

      let objActionDic = Object.assign({}, baseDic, newActiondic[0]);
      objActionDic.params = Object.assign({}, baseParams, objActionDic.params);
      objActionDic.actions = Object.assign(
        {},
        baseActions,
        objActionDic.actions
      );
      return objActionDic;
    }

    return null;
  }

  function generateActionForm(_actionconfig) {
    let actConfig = selectedActionConfig;
    actConfig.splice(0, 1, _actionconfig[0]);
    setSelectedActionConfig(actConfig[0].children);

    const methodname = _actionconfig[0]["method"];
    populateConfiglist(methodname);

    let _dataset = { name: actConfig[0].method };
    let _actionData = getActionDic_byActionMethod(_dataset, actionDic);
    //console.log(_actionconfig, "...selectedAction >>>>", _actionData);
    setSelectedActionData(_actionData["params"]);

    showActionForm();
  }

  /////// Action Form implementation //////

  const displayProps = [];
  const options = [];

  function showActionForm() {
    //console.log(selectedActionLocale, " **** showActionForm >>>>>>>", selectedActionConfig);

    setDisplayForm(false);
    setEditorWidth(widthMenu[2]);
    setShowForm(true);
    setValidationError("");

    //setAppliedContainerWidth('440px');
  }

  function backActionForm() {
    if (!isNaN(selectedActionId)) {
      const _id = parseInt(selectedActionId);
      const selectedActionActualDic = props.actualdata[_id];
      console.log(
        selectedActionId,
        " **** backActionForm >>>>>>>",
        selectedActionActualDic,
        selectedActionDic
      );
      props.data.splice(_id, 1, selectedActionActualDic);
      let newActionData = manipulateActionsData(
        props.data,
        actionList,
        [],
        0,
        ""
      );
      setActionData(newActionData);
    }

    setShowForm(false);
    setEditAction(false);
    setEditorWidth(widthMenu[0]);
    //setAppliedContainerWidth('');
    setEnableActionButtons(false);
    setEnableAddButton(false);
  }

  function handleDependentActions(property, propval, actions, actionType) {
    props.onUpdateActionData();
  }

  const [dependentActions, setDependentActions] = React.useState([]);
  function manageDependentActions(key, actions) {
    let _dependentActions = dependentActions;
    _dependentActions.push({ key: key, actions: actions });
    setDependentActions(_dependentActions);
  }

  const [changedAction, setChangedAction] = React.useState({});
  function handleUpdateValue(key, value) {
    setValidationError("");

    if (key !== "pageTitle") {
      if (key.toString().toLowerCase().indexOf("page") > -1) {
        if (value !== "" && value.indexOf("page_") < 0) value = "page_" + value;
      }
    }
    console.log(
      selectedActionId,
      selectedActionDic,
      "..... handleUpdateValue >>>> ",
      key,
      value
    );
    //console.log("..... pagedata >>>> ", this.state.pageData[key]);
    let selectedActionParams = selectedActionDic["params"];
    if (selectedActionParams && selectedActionParams.hasOwnProperty(key)) {
      selectedActionParams[key] = value;
    }
    const _changedAction = manageActionParamters(
      props.basedata,
      selectedActionDic,
      key,
      value,
      props
    );
    if (_changedAction) {
      console.log(
        props.data,
        "...actConfig. >>>",
        selectedActionDic,
        _changedAction
      );
      setSelectedActionConfig(_changedAction[0].children);
      setChangedAction(selectedActionDic);
    }

    //props.onUpdateActionValue(key, value);
  }

  const [selectedItem, setSelectedItem] = React.useState({
    editor: "action",
    id: "",
    index: 0,
  });
  function handleSelectedValue(key, value) {
    //console.log(key, "..... handleSelectedValue >>>> ", value);
    value = value === -1 ? 0 : value;
    const _selectedItem = { editor: "action", id: "", index: value };
    setSelectedItem(_selectedItem);
  }

  function updateAppliedAction() {
    //console.log(".. updateAppliedAction >>>>", selectedActionDic);
    const validationResult = isValidationSucceed(
      selectedActionDic,
      selectedActionConfig
    );
    if (validationResult.length > 0) {
      const localeObj = selectedActionLocale[0];
      const validationErrorObj = validationResult[0];

      const fieldText = localeObj[validationErrorObj.parameter];
      const errorMsg = fieldText + " : " + validationErrorObj.error;
      //console.log("****** isValidationSucceed ******", errorMsg);
      setValidationError(errorMsg);
      return;
    }

    if (changedAction && changedAction.hasOwnProperty("category")) {
      let newActionData = manipulateActionsData(
        props.data,
        actionList,
        [],
        0,
        ""
      );
      setActionData(newActionData);
    }

    setDocument_forSelectedAction(selectedActionDic, false);

    setValidationError("");
    setShowForm(false);
    setEditAction(false);
    setEditorWidth(widthMenu[0]);
    //setAppliedContainerWidth('');
    setEnableActionButtons(false);
    setEnableAddButton(false);
  }

  function applyNewAction() {
    const validationResult = isValidationSucceed(
      selectedActionDic,
      selectedActionConfig
    );
    if (validationResult.length > 0) {
      const localeObj = selectedActionLocale[0];
      const validationErrorObj = validationResult[0];

      const fieldText = localeObj[validationErrorObj.parameter];
      const errorMsg = fieldText + " : " + validationErrorObj.error;
      //console.log("****** isValidationSucceed ******", errorMsg);
      setValidationError(errorMsg);
      return;
    }

    setValidationError("");
    setSelectedActionConfig([]);
    //setSelectedActionData({});

    let currentActions = props.data;
    //console.log(props.data, actionData, "******applyNewAction******", selectedEvent, selectedActionDic);
    setDocument_forSelectedAction(selectedActionDic, true);

    if (selectedEvent.length === 0) {
      //currentActions.push(selectedActionDic);
      const _newAction = JSON.parse(JSON.stringify(selectedActionDic));
      if (_newAction.params["condition"]) {
        if (_newAction.params["condition"].hasOwnProperty("groupcases")) {
          _newAction.params["condition"]["groupcases"] = [];
        }
      }
      currentActions.push(_newAction);
    } else {
      let eventPath = selectedEvent.substring(
        0,
        selectedEvent.lastIndexOf(".")
      );
      let eventName = selectedEvent.substring(
        selectedEvent.lastIndexOf(".") + 1
      );
      eventName = eventName.split("_")[0];
      let selectedEventAction = getAction_forSelectedEvent(eventPath);
      let selectedEventArr =
        eventName.toLowerCase() === "else"
          ? selectedEventAction["actions"]["onElse"]
          : selectedEventAction["actions"][eventName];

      // HOTFIX ---
      let subactionArr = getSubactionsDetail(selectedActionDic.method);
      for (let i = 0; i < subactionArr.length; i++) {
        const element = subactionArr[i];
        selectedActionDic.actions[element] = [];
      }
      selectedActionDic.actions[eventName] = [];

      if (selectedActionDic.params["condition"]) {
        if (
          selectedActionDic.params["condition"].hasOwnProperty("groupcases")
        ) {
          if (selectedActionDic.params["condition"]["groupcases"].length > 0) {
            const mainCondition = JSON.parse(
              JSON.stringify(selectedEventAction.params["condition"])
            );
            //console.log("selectedActionDic cond >>>", mainCondition);
            selectedActionDic.params["condition"]["groupcases"] = [];
            selectedEventAction.params["condition"] = mainCondition;
          }
        }
      }
      // --

      //console.log(selectedActionDic, "%%%%", eventPath, eventName, "******$ applyNewAction $******", selectedEventAction, selectedEventArr);
      const _childAction = JSON.parse(JSON.stringify(selectedActionDic));
      selectedEventArr.push(_childAction);
    }

    let newActionData = manipulateActionsData(
      props.data,
      actionList,
      [],
      0,
      ""
    );
    //console.log(newActionData, "****** manipulateActionsData ******", props.data);
    setActionData(newActionData);
    //setActionData(JSON.parse(JSON.stringify(newActionData)));

    setShowForm(false);
    setEditorWidth(widthMenu[2]);
    //setAppliedContainerWidth('');
  }

  function setDocument_forSelectedAction(actionObj, isNew) {
    const nowDate = new Date();
    const monthVal =
      parseInt(nowDate.getMonth() + 1) < 10
        ? "0" + parseInt(nowDate.getMonth() + 1)
        : parseInt(nowDate.getMonth() + 1);
    const dateVal =
      nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();
    let strDate =
      nowDate.getFullYear() +
      "-" +
      monthVal +
      "-" +
      dateVal +
      " " +
      nowDate.getHours() +
      ":" +
      nowDate.getMinutes() +
      ":" +
      nowDate.getSeconds();
    const i = nowDate.toString().indexOf("GMT");
    strDate = strDate + " GMT" + nowDate.toString().substr(i + 3, 5);

    if (isNew) {
      let _document = [];
      const createdObj = { key: "createddatetime", value: strDate };
      _document.push(createdObj);
      const lastupdateObj = { key: "lastupdatedatetime", value: strDate };
      _document.push(lastupdateObj);

      actionObj["Document"] = _document;
    } else {
      /* if(actionObj['Document'].hasOwnProperty("lastupdatedatetime")) {
          actionObj['Document']['lastupdatedatetime'] = strDate;
        }else {
          const _lastupdateObj = {"key": "lastupdatedatetime", "value": strDate};
          actionObj['Document'].push(_lastupdateObj);
        } */

      let actionDoc = [];
      const createdDoc = actionObj["Document"].find(
        ({ key }) => key === "createddatetime"
      );
      if (createdDoc) {
        actionDoc.push(createdDoc);
      } else {
        const _createdObj = { key: "createddatetime", value: "" };
        actionDoc.push(_createdObj);
      }
      const _lastupdateObj = { key: "lastupdatedatetime", value: strDate };
      actionDoc.push(_lastupdateObj);

      actionObj["Document"] = actionDoc;
    }
    //console.log(actionObj, "...Document >>>", actionObj['Document']);
  }

  function getAction_forSelectedEvent(evHierarchy) {
    let currentActions = props.data;

    let arrSelectedId = evHierarchy.split(".");
    if (arrSelectedId.length === 1) {
      const mainelementId = arrSelectedId[0];
      if (mainelementId.indexOf("onelse") > -1) {
        const _id = parseInt(mainelementId);
        return currentActions[_id]["actions"]["onElse"][0];
      } else {
        let actIndex = parseInt(arrSelectedId[0]);
        if (!isNaN(actIndex)) {
          return currentActions[actIndex];
        } else {
          return currentActions[0];
        }
      }
    } else {
      let appliedAction;

      for (let index = 0; index < arrSelectedId.length; index++) {
        const elementId = arrSelectedId[index];
        if (!isNaN(parseInt(elementId))) {
          if (elementId.indexOf("onelse") > -1) {
            const _id = parseInt(elementId);
            appliedAction = currentActions[_id]["actions"]["onElse"][0];
          } else {
            appliedAction = currentActions[elementId];
          }
        } else {
          let actionEventName = elementId.split("_")[0];
          let actionEventIndex = elementId.split("_")[1];
          //console.log(appliedAction, "***********", arrSelectedId, "####", index, actionEventName, actionEventIndex);
          let actionEvent = appliedAction["actions"][actionEventName];
          //if(index === arrSelectedId.length-1) {
          //actionEvent.splice(actionEventIndex);
          // }else {
          appliedAction = actionEvent[actionEventIndex];
          //}

          if (elementId.indexOf("onelse") > -1) {
            appliedAction = appliedAction["actions"]["onElse"][0];
          }
        }
      }
      return appliedAction;
    }
  }

  function handleConditionData(conditionData, actualActions) {
    //console.log(props.data, "------- handleConditionData ---->>>>>", actionData);
    setCondition_forAction(actualActions, conditionData[0]);
  }
  function setCondition_forAction(actualActions, conditionObj) {
    let selectedAction;

    let appliedActionList = actualActions;
    const conditions = conditionObj["conditions"];
    const selectedActionId = conditionObj["id"];

    let arrSelectedId = selectedActionId.split(".");
    //console.log(selectedActionId, "... condition >> Selected Action *********", arrSelectedId);
    if (arrSelectedId.length === 1) {
      const _selIndex = parseInt(arrSelectedId[0]);
      selectedAction = appliedActionList[_selIndex]["action"];
    } else {
      let appliedAction;

      for (let index = 0; index < arrSelectedId.length; index++) {
        const elementId = arrSelectedId[index];
        if (!isNaN(parseInt(elementId))) {
          if (elementId.indexOf("onelse") > -1) {
            const _id = parseInt(elementId);
            //console.log(_id, "... >> appliedActionList >>>", appliedActionList);
            appliedAction =
              appliedActionList[_id]["actions"]["onElse"][0]["action"];
          } else {
            appliedAction = appliedActionList[elementId]["action"];
          }
        } else {
          let actionEventName = elementId.split("_")[0];
          let actionEventIndex = elementId.split("_")[1];
          //console.log(appliedAction, "***********", arrSelectedId, "####", index, actionEventName, actionEventIndex);
          let actionEvent = appliedAction["actions"][actionEventName];
          if (index === arrSelectedId.length - 1) {
            if (elementId.indexOf("onelse") > -1) {
              if (
                actionEvent[actionEventIndex] &&
                actionEvent[actionEventIndex]["actions"]
              ) {
                selectedAction =
                  actionEvent[actionEventIndex]["actions"]["onElse"];
              }
            } else {
              selectedAction = actionEvent[actionEventIndex];
            }
          } else {
            appliedAction = actionEvent[actionEventIndex];
            if (elementId.indexOf("onelse") > -1) {
              appliedAction = appliedAction["actions"]["onElse"][0];
            }
          }
        }
      }
    }

    if (selectedAction) {
      selectedAction["params"]["condition"]["groupcases"] = conditions;
    }

    const _newActions = [appliedActionList[0]["action"]];
    let _newActionData = manipulateActionsData(
      _newActions,
      actionList,
      [],
      0,
      ""
    );
    //console.log( actualActions, appliedActionList, "------- setCondition_forAction ---->>>>>", _newActionData);
    setActionData(_newActionData);
  }

  //////// Find Actions //////////

  const [listheight, setListHeight] = React.useState("");

  const [showActionFinder, setActionFinder] = React.useState(false);
  const [searchvalue, setSearchValue] = React.useState("");
  const [searcherror, setSearchError] = React.useState(false);
  const [searchcounter, setSearchCounter] = React.useState("0 of 0");
  const [matchedActionList, setMatchedActionList] = React.useState([]);
  const [moveNumber, setMoveNumber] = React.useState(0);
  const [isActionFind, setActionFind] = React.useState(false);

  function handleOpenActionFinder() {
    setActionFinder(!showActionFinder);
    if (showActionFinder) {
      setListHeight("");
    } else {
      setListHeight(`calc(55vh - 38px)`);
    }
    setSearchError(false);
  }
  function handleCloseActionFinder() {
    setListHeight("");
    setActionFinder(false);
    setSearchError(false);
    if (searchvalue.length > 0 && matchedActionList.length > 0) {
      setSearchCounter(moveNumber + " of " + matchedActionList.length);
      setActionFind(true);
    } else {
      setSearchCounter("0 of 0");
    }
  }

  function resetFinding() {
    setMoveNumber(0);
    setSearchCounter("0 of 0");
    setMatchedActionList([]);
    setActionFind(false);
  }

  function handleSearchInput(event) {
    const val = event.target.value;
    if (val.length > 0) {
      const allowedChars = /[a-zA-Z ]/g;
      let allowedTitle = val.match(allowedChars);
      if (!allowedTitle) {
        return;
      }
      if (allowedTitle && val.length !== allowedTitle.length) {
        return;
      }
    }
    setSearchValue(val);
    setSearchError(false);

    resetFinding();
  }

  function handleFindAction() {
    //console.log(props, "... handleFindAction >>>", searchvalue);
    setSearchError(false);
    if (searchvalue.length === 0) {
      setSearchCounter("0 of 0");
      setSearchError(true);
    } else {
      let actionList = props.locale.filter(function (item) {
        const actionText = item.properties[0]["text"].toLowerCase();
        return actionText.indexOf(searchvalue.toLowerCase()) > -1;
      });

      if (actionList.length === 0) {
        setSearchCounter("0 of 0");
        setSearchError(true);
      } else {
        //console.log(searchvalue, "---->", actionList, "******", props['data'], actionData);

        let arrmathedActionMethods = [];
        let matchedActions = [];
        const appliedActions = actionData["list"];
        for (let index = 0; index < actionList.length; index++) {
          arrmathedActionMethods.push(actionList[index]["method"]);
          //matchedActions = getMatchedActions(actionList[index]['method'], appliedActions, matchedActions);
        }
        matchedActions = getMatchedActions(
          arrmathedActionMethods,
          appliedActions,
          matchedActions
        );
        sortMatchedActions(matchedActions);
        //console.log(searchvalue, actionList, arrmathedActionMethods, "******", matchedActions);
        if (matchedActions.length > 0) {
          setExpandCollapseText("Collapse All");
          setExpandState(true);
          setMoveNumber(1);
          setSearchCounter("1 of " + matchedActions.length);
          setMatchedActionList(matchedActions);

          const _actionSet = matchedActions[0];
          const _actionParams = matchedActions[0]["action"]["params"];
          moveToAction(_actionSet, _actionParams);
        } else {
          //setExpandCollapseText('Expand All');
          //setExpandState(false);
          resetFinding();
        }
      }
    }
  }

  function getMatchedActions(methodName, appliedActions, matchedActions) {
    /* for (let i = 0; i < appliedActions.length; i++) {
        if(appliedActions[i]['method'] === methodName) {
          matchedActions.push({id:appliedActions[i]['id']+'', level:appliedActions[i]['level'], name:appliedActions[i]['method'], type:appliedActions[i]['type'], action:appliedActions[i]['action']});
        }

        let subActions = appliedActions[i]['subactions'];
        for(let j = 0; j < subActions.length; j++) {
          const subactionItem = subActions[j];
          let subactionsdata = appliedActions[i]['subactionsdata'][0][subactionItem];
          //console.log(methodName, "---->", subactionItem, "******", appliedActions[j]);
          if(subactionsdata) {
            matchedActions = getMatchedActions(methodName, subactionsdata, matchedActions);
          }
        }
      } */

    for (let i = 0; i < appliedActions.length; i++) {
      const _method = appliedActions[i]["method"];
      if (methodName.indexOf(_method) > -1) {
        matchedActions.push({
          id: appliedActions[i]["id"] + "",
          level: appliedActions[i]["level"],
          name: _method,
          type: appliedActions[i]["type"],
          action: appliedActions[i]["action"],
        });
      }

      let subActions = appliedActions[i]["subactions"];
      for (let j = 0; j < subActions.length; j++) {
        const subactionItem = subActions[j];
        let subactionsdata =
          appliedActions[i]["subactionsdata"][0][subactionItem];
        if (subactionsdata) {
          //console.log(subactionsdata, "******", matchedActions);
          matchedActions = getMatchedActions(
            methodName,
            subactionsdata,
            matchedActions
          );
        }
      }
    }

    //console.log(methodName, "---->", appliedActions, "******", matchedActions);
    return matchedActions;
  }
  function sortMatchedActions(matchedActions) {
    //matchedActions.sort((a, b) => a.level - b.level);

    /* let sortActions = [];
      for(let i = 0; i < matchedActions.length; i++) {
        if(i === 0) {
          sortActions.push(matchedActions[0]);
        }else {

        }
      } */

    return matchedActions;
  }

  function handleMovePreviousMatch() {
    //console.log(matchedActionList, "-- prev -->", moveNumber);

    if (moveNumber > 1) {
      let prevNum = moveNumber - 1;
      setMoveNumber(prevNum);
      setSearchCounter(prevNum + " of " + matchedActionList.length);

      const _index = prevNum - 1;
      const _actionSet = matchedActionList[_index];
      const _actionParams = matchedActionList[_index]["action"]["params"];
      moveToAction(_actionSet, _actionParams);
    }
  }
  function handleMoveNextMatch() {
    //console.log(searchvalue, matchedActionList, "*** next ***", moveNumber);

    if (moveNumber < matchedActionList.length) {
      let nextNum = moveNumber + 1;
      setMoveNumber(nextNum);
      setSearchCounter(nextNum + " of " + matchedActionList.length);

      const _index = nextNum - 1;
      const _actionSet = matchedActionList[_index];
      const _actionParams = matchedActionList[_index]["action"]["params"];
      moveToAction(_actionSet, _actionParams);
    }
  }

  function moveToAction(actionSet, actionParams) {
    setSelectedActionId(actionSet["id"]);
    setSelectedAppliedAction(actionData, actionParams, actionSet);

    setActionFind(true);
  }

  return (
    <Dialog
      scroll="paper"
      className="customized-dilog-section"
      open={true}
      fullWidth={true}
      maxWidth={maxWidth}
    >
      <div id="customized-dialog-title">
        <h4>Action Editor</h4>
        <IconButton aria-label="Close" onClick={closeEditor}>
          <Close className="content-close-icon" />
        </IconButton>
      </div>
      <DialogContent className="action-editor-dialog-content" dividers>
        <Box id="action-editor">
          <div className="action-editor-title">
            <h4>Currently Applied Actions</h4>
            <div className="action-editor-btns">
              <button
                className="action-collapse-btn"
                onClick={expandcollapseActions}
              >
                {expandcollapseText}
              </button>
              <button
                variant="outlined"
                color="default"
                className="action-collapse-btn"
                style={{ width: 72 }}
                onClick={handleOpenActionFinder}
              >
                <SvgIcon style={{ marginRight: 4, width: 20, height: 20 }}>
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </SvgIcon>
                Find
              </button>
            </div>
          </div>
          {showActionFinder && (
            <div className="action-editor-container">
              <Input
                aria-label="Search Input"
                className="action-editor-input"
                autoFocus
                type="text"
                required
                placeholder="Find Action in Currently Applied Actions"
                value={searchvalue}
                onChange={handleSearchInput}
                error={searcherror}
              />
              <Fab
                aria-label="Find Action"
                color="default"
                size="small"
                className="find-btn"
              >
                <SvgIcon onClick={handleFindAction}>
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </SvgIcon>
              </Fab>
              <div className="action-editor-search-counter">
                <h4>{searchcounter}</h4>
                <IconButton
                  color="inherit"
                  aria-label="Previous Match"
                  className="action-editor-search-list"
                  onClick={handleMovePreviousMatch}
                >
                  <Tooltip title={<h6>Previous Match</h6>}>
                    <ArrowUpward className="srch-icon" />
                  </Tooltip>
                </IconButton>
                <IconButton
                  color="inherit"
                  aria-label="Next Match"
                  className="action-editor-search-list"
                  onClick={handleMoveNextMatch}
                >
                  <Tooltip title={<h6>Next Match</h6>}>
                    <ArrowDownward className="srch-icon" />
                  </Tooltip>
                </IconButton>
                <IconButton
                  color="inherit"
                  aria-label="Close Finder"
                  className="action-editor-search-list"
                  onClick={handleCloseActionFinder}
                >
                  <Tooltip title={<h6>Close</h6>}>
                    <Close className="srch-icon" />
                  </Tooltip>
                </IconButton>
              </div>
            </div>
          )}
          <Paper
            elevation={6}
            className="action-editor-selected-container"
            style={{ overflow: "auto hidden", height: listheight }}
          >
            {actionData["list"]["length"] > 0 && (
              <div className="multi-select-container">
                <Checkbox
                  color="default"
                  checked={selectallchecked}
                  onChange={handleSelectAllActions}
                ></Checkbox>
                <h4>Select All</h4>
              </div>
            )}
            <ActionListView
              listdata={actionData}
              expandstate={expandState}
              selectedActionId={selectedActionId}
              selectedActionDic={selectedActionDic}
              isActionFind={isActionFind}
              allCheckedIds={checkedIds}
              onNodeSelection={handleActionSelect}
              onActionEventSelection={handleEventSelect}
              onApplyCondition={handleConditionData}
              onCheckAction={handleActionCheck}
            />
          </Paper>
          <div id="actionButtons">
            <button
              className="action-collapse-btn"
              disabled={!enableActionButtons}
              onClick={cutAppliedAction}
            >
              Cut
            </button>
            <button
              className="action-collapse-btn"
              disabled={!enableActionButtons}
              onClick={copyAppliedAction}
            >
              Copy
            </button>
            <button
              className="action-collapse-btn"
              disabled={!enablePasteButton}
              onClick={pasteAction}
            >
              Paste
            </button>
            <button
              className="action-collapse-btn"
              disabled={!enableActionButtons}
              onClick={deleteSelectedAction}
            >
              Delete
            </button>
            <button
              className="action-collapse-btn"
              disabled={enableAddButton}
              onClick={showActionCategory}
            >
              Add
            </button>
          </div>
          {operationMessage.length > 0 && (
            <Snackbar
              open={true}
              onClose={handleCloseOperationMessage}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              message={operationMessage}
              action={
                <React.Fragment>
                  <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={handleCloseOperationMessage}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </React.Fragment>
              }
            />
          )}
        </Box>
        {showCategory && (
          <div
            className="action-catgry-container"
            style={{ margin: "1.35rem 0" }}
          >
            <h4 className="action-category-title">Select Actions Category</h4>
            <Paper elevation={6} className="select-action-container">
              <List
                className="select-action-list"
                dense={true}
                onClick={showActionList}
              >
                <ListItem
                  id="customcategory"
                  onClick={setCustomActions}
                  className="action-editor-dialog-list-item"
                  style={{ maxHeight: 28 }}
                >
                  <Tooltip
                    title={
                      <h6>'Preview' is must on any changes in Custom action</h6>
                    }
                  >
                    <ListItemText primary={<h4>Custom Action</h4>} />
                  </Tooltip>
                  <ListItemSecondaryAction>
                    {!isCustomActionTitle && (
                      <Fab
                        color="default"
                        size="small"
                        aria-label="Add Custom"
                        className="add-icon"
                      >
                        <Add onClick={handleAddCustomActionObject} />
                      </Fab>
                    )}
                    {isCustomActionTitle && (
                      <div>
                        <h4 style={{ color: "white", fontWeight: "bold" }}>
                          Title*:
                        </h4>
                        <input
                          name="custom-title"
                          type="text"
                          required
                          value={customActionTitle}
                          onChange={handleCustomActionTitle}
                        />
                        <Fab
                          color="default"
                          size="small"
                          aria-label="Delete Custom"
                          className="add-icon"
                          style={{ padding: 2 }}
                        >
                          <Done onClick={handleSetCustomActionObject} />
                        </Fab>
                        <Fab
                          color="default"
                          size="small"
                          aria-label="Delete Custom"
                          className="add-icon"
                          style={{ padding: 2 }}
                        >
                          <Close onClick={handleCancelCustomActionObject} />
                        </Fab>
                      </div>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                <Collapse
                  in={selectedCategory === "custom"}
                  className="custom-action-sub-list"
                  timeout="auto"
                  unmountOnExit
                  style={{ backgroundColor: "white" }}
                >
                  <List
                    dense={true}
                    style={{ width: "100%", margin: 0, padding: 0 }}
                  >
                    {customActions.helper.map((custom, index0) => (
                      <ListItem
                        className="action-editor-dialog-list-item"
                        key={index0}
                        data-name={custom.title}
                        style={{ padding: "0px 8px", maxHeight: 48 }}
                      >
                        <ListItemText primary={<h6>{custom.title}</h6>} />
                        <ListItemSecondaryAction
                          style={{ top: "36%", right: 6, height: 28 }}
                        >
                          <div className="custom-action-container">
                            <ActionButtonForm
                              source="custom"
                              value={custom.actions}
                              btnsize="small"
                              config={{
                                path: "actions.custom",
                                input: "LabelWithButton",
                              }}
                              currentScreenIndex={props.currentScreenIndex}
                              onActionApply={closeCustomActionEditor}
                            />
                            <button
                              data-name={custom.title}
                              data-index={index0}
                              onClick={handleApplyCustomActionObject}
                            >
                              Set
                            </button>
                            <IconButton
                              edge="end"
                              color="inherit"
                              aria-label="Delete Custom"
                              data-name={custom.title}
                              data-index={index0}
                              onClick={handleDeleteCustomActionObject}
                            >
                              <Delete />
                            </IconButton>
                          </div>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
                {actionList.map((category, index) => (
                  <div key={index}>
                    <ListItem
                      className="action-editor-dialog-list-item  action-editor-header"
                      data-category={category.name}
                      onClick={setSelectedCategory}
                    >
                      <ListItemText primary={<h6>{category.text}</h6>} />
                    </ListItem>
                    <Collapse
                      in={selectedCategory === category.name}
                      className="custom-action-sub-list"
                      timeout="auto"
                      unmountOnExit
                    >
                      <List dense={true} className="action-list">
                        {generateActionsList(selectedCategory).map(
                          (action, index1) => (
                            <ListItem
                              key={index1}
                              data-type={action.type}
                              data-name={action.name}
                              className="action-editor-dialog-list-item"
                              onClick={setSelectedAction}
                              style={{ padding: "0px 8px", maxHeight: 48 }}
                            >
                              <Tooltip title={<h6>{action.toolTip}</h6>}>
                                <ListItemText
                                  primary={<h6>{action.text}</h6>}
                                  style={{ margin: "2px 0px" }}
                                />
                              </Tooltip>
                            </ListItem>
                          )
                        )}
                      </List>
                    </Collapse>
                  </div>
                ))}
              </List>
            </Paper>
            <div className="back-btn">
              <button
                className="dialogue-btn action-collapse-btn"
                onClick={backCategoryList}
              >
                Back
              </button>
            </div>
            {customTitleError.length > 0 && (
              <Snackbar
                open={true}
                onClose={handleCloseCustomTitleError}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                message={customTitleError}
                action={
                  <React.Fragment>
                    <IconButton
                      size="small"
                      aria-label="close"
                      color="inherit"
                      onClick={handleCloseCustomTitleError}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </React.Fragment>
                }
              />
            )}
          </div>
        )}
        {showList && (
          <Box>
            <h4 variant="subtitle2" gutterBottom>
              Select Action
            </h4>
            <Paper elevation={6} className="select-action-container">
              <List dense={true} className="action-list">
                {generateActionsList(selectedCategory).map((action, index) => (
                  <ListItem
                    key={index}
                    data-type={action.type}
                    data-action={action.name}
                    className="action-editor-dialog-list-item"
                    onClick={setSelectedAction}
                  >
                    <ListItemText primary={action.text} />
                  </ListItem>
                ))}
              </List>
            </Paper>
            <Grid container justify="flex-end" alignItems="center">
              <button className="" onClick={backActionList}>
                Back
              </button>
            </Grid>
          </Box>
        )}
        {showForm && (
          <div className="edit-action-params">
            <h4>Edit Action Parameters</h4>
            <Paper className="edit-action-paper" elevation={6}>
              {selectedActionLocale.length > 0 && (
                <div className="selected-action-local">
                  <h4>{selectedActionLocale[0].text}</h4>
                  <Tooltip title={selectedActionLocale[0].toolTip}>
                    <IconButton edge="end" color="inherit" aria-label="Help">
                      <Help />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
              {!displayForm && (
                <Box
                  component="nav"
                  style={{
                    width: "100%",
                    height: "100%",
                    padding: 0,
                    marginBottom: 2,
                    overflow: "auto",
                  }}
                  aria-labelledby="nested-list-subheader"
                >
                  {validationerror.length > 0 && <h4>{validationerror}</h4>}
                  {selectedActionConfig.length === 0 && (
                    <h4>No parameter found.</h4>
                  )}
                  {selectedActionConfig.map((category, index) => (
                    <div
                      key={index}
                      id={category.name}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Collapse
                        in={true}
                        timeout="auto"
                        unmountOnExit
                        style={{ paddingBottom: 4, backgroundColor: "#fff" }}
                      >
                        <List component="div" dense={true} disablePadding>
                          {category.properties.map((property, indexprop) => (
                            <ListItem key={indexprop}>
                              <PropertyValueForm
                                formtype="action"
                                dicObj={selectedActionDic}
                                data={selectedActionData}
                                property={property}
                                locale={selectedActionLocale}
                                screenIndex={currentScreenIndex}
                                selectedItem={selectedItem}
                                onUpdateIndex={handleSelectedValue}
                                onUpdateValue={handleUpdateValue}
                                setDependentActions={manageDependentActions}
                                dependentActions={dependentActions}
                                doDependentActions={handleDependentActions}
                                show={displayProps}
                                options={options}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </div>
                  ))}
                </Box>
              )}
            </Paper>
            <Grid
              className="update-action-frm-btns"
              container
              justify="flex-end"
              alignItems="center"
            >
              {editAction && (
                <button
                  className="action-collapse-btn"
                  onClick={backActionForm}
                >
                  Back
                </button>
              )}
              {editAction && (
                <button
                  className="action-collapse-btn"
                  onClick={updateAppliedAction}
                >
                  Update
                </button>
              )}
              {!editAction && (
                <button
                  className="action-collapse-btn"
                  onClick={applyNewAction}
                >
                  Apply
                </button>
              )}
            </Grid>
          </div>
        )}
      </DialogContent>
      <DialogActions className="dialog-collapse-btns">
        <button
          style={{ width: "7rem" }}
          className="action-collapse-btn"
          data-type="cancel"
          onClick={closeEditor}
        >
          Cancel
        </button>
        <button
          style={{ width: "7rem" }}
          className="action-collapse-btn"
          data-type="ok"
          onClick={closeEditor}
        >
          OK
        </button>
      </DialogActions>
    </Dialog>
  );
}

function getPasteButton(copiedActionData) {
  //console.log("getPasteButton >>", copiedActionData);
  if (copiedActionData) {
    if (copiedActionData.hasOwnProperty("mode")) {
      return true;
    }
    return false;
  }
  return false;
}
function getCutCopyType(copiedActionData) {
  if (copiedActionData) {
    if (copiedActionData.hasOwnProperty("mode")) {
      return copiedActionData["mode"];
    }
    return "";
  }
  return "";
}
function getCutCopyActions(copiedActionData) {
  if (copiedActionData) {
    if (copiedActionData.hasOwnProperty("mode")) {
      return copiedActionData["action"];
    }
    return {};
  }
  return {};
}

function manipulateActionsData(
  actions,
  actionlist,
  arrAction,
  _level,
  _event,
  _id
) {
  //let arrAction = [];
  let eventid = _id;
  for (let i = 0; i < actions.length; i++) {
    const actionDic = actions[i];
    let _actionConfig = [{ text: actionDic.method }];
    let _actDetail = getSelectedActionDetail(actionDic, actionlist);
    if (_actDetail && _actDetail.length > 0) {
      _actionConfig = _actDetail;
    } else {
      console.log(
        actionlist,
        i,
        _actionConfig,
        "...........manipulateActionsData............",
        actionDic
      );
    }

    if (_event.length > 0) {
      _id = eventid + "." + _event + "_" + i;
    } else {
      _id = i;
    }
    //arrAction.push({id:_id, level:_level, title:_actionConfig[0].text, method:actionDic.method, category:actionDic.category, type:actionDic.type, subactions:subactionsList, action:actionDic});

    let subActionsData = [];
    const subActions = actionDic["actions"];
    const onElseAction = subActions["onElse"];
    //console.log(_level, _event, "...........manipuonsData............", actionDic, ".....>>>>", subActions, onElseAction.length);

    const subactionsList = getSubactionsDetail(actionDic.method);
    let subActionsObj = getSubActionsData(
      subActions,
      subactionsList,
      actionlist,
      _id,
      _level
    );
    subActionsData.push(subActionsObj);
    arrAction.push({
      action: actionDic,
      id: _id,
      level: _level,
      title: _actionConfig[0].text,
      method: actionDic.method,
      category: actionDic.category,
      type: actionDic.type,
      subactions: subactionsList,
      subactionsdata: subActionsData,
      onelsedata: [],
    });

    if (onElseAction.length > 0) {
      if (
        actionDic.hasOwnProperty("params") &&
        actionDic["params"]["condition"]
      ) {
        const conditionObj = actionDic["params"]["condition"];
        if (
          conditionObj.hasOwnProperty("groupcases") &&
          conditionObj["groupcases"].length === 0
        ) {
          continue;
        }
      }

      const onelseDic = onElseAction[0];
      let onelseSubactions = getSubactionsDetail(onelseDic.method);
      let onelseData = [];
      //onelseData.push({onElse: onelseDic});
      let onelseSubActionData = getSubActionsData(
        onelseDic["actions"],
        onelseSubactions,
        actionlist,
        _id + "_onelse",
        _level
      );
      onelseData.push(onelseSubActionData);
      //console.log(_level, onElseAction, "onElseAction............", onelseSubactions, onelseData);

      let _onelseActionDetail = [{ text: onelseDic.method }];
      _onelseActionDetail = getSelectedActionDetail(onelseDic, actionlist);

      let len = arrAction.length - 1;
      const onelseArr = arrAction[len]
        ? arrAction[len].onelsedata
        : arrAction[0].onelsedata;
      onelseArr.push({
        action: onelseDic,
        id: _id + "_onelse",
        level: _level,
        title: _onelseActionDetail[0].text,
        method: onelseDic.method,
        category: onelseDic.category,
        type: onelseDic.type,
        subactions: onelseSubactions,
        subactionsdata: onelseData,
        onelsedata: [],
      });
      arrAction.push({
        action: onelseDic,
        id: _id + "_onelse",
        level: _level,
        title: _onelseActionDetail[0].text,
        method: onelseDic.method,
        category: onelseDic.category,
        type: onelseDic.type,
        subactions: onelseSubactions,
        subactionsdata: onelseData,
        onelsedata: [],
      });
    } else {
      const actionCondition = actionDic["params"]["condition"];
      let conditionGroupCase = actionCondition["groupcases"];
      if (conditionGroupCase && conditionGroupCase.length > 0) {
        const conditionCase = conditionGroupCase[0]["cases"];
        //console.log(arrAction, "conditionsssssssss>>>>>>>>>>>>", conditionGroupCase);
        if (conditionCase && conditionCase.length > 0) {
          let len = arrAction.length - 1;
          const onelseArr = arrAction[len]
            ? arrAction[len].onelsedata
            : arrAction[0].onelsedata;
          onelseArr.push({
            action: {},
            id: _id + "_onelse",
            level: _level,
            title: "",
            method: "",
            category: "",
            type: "",
            subactions: [],
            subactionsdata: [],
            onelsedata: [],
          });
          //arrAction.push({id:i+'_onelse', level:_level, title:'', method:'', category:'', type:'', subactions:[], subactionsdata:[], action:{} });
        }
      }
    }
  }
  //console.log("actionData list............", arrAction);
  let actionData = { list: arrAction };
  return actionData;
}

function getSelectedActionDetail(actionDic, actionlist) {
  if (actionDic["method"] === "DownloadFile" && actionDic["type"] === "Comm") {
    actionDic["type"] = "Media";
  }

  //console.log("getSelectedActionDetail list............", actionDic, actionlist);
  let _actionList = actionlist.filter(function (category) {
    return category.name === getSelectedCategory(actionDic.type);
  });

  const _method = actionDic["method"];
  if (
    _method.toLowerCase().indexOf("insert") > -1 ||
    _method.toLowerCase().indexOf("update") > -1
  ) {
    updateRecordList(actionDic);
  }

  let _actionDetail = [{ text: actionDic.method }];
  if (_actionList.length > 0) {
    let _actionItems = _actionList[0]["items"];
    _actionDetail = _actionItems.filter(function (item) {
      return item.name.toLowerCase() === actionDic.method.toLowerCase();
    });
  }
  return _actionDetail;
}

function getSelectedAction(actionName) {
  let action = null;
  switch (actionName) {
    case "CanSendEmail":
      action = "CanSendMail";
      break;
    default:
      action = actionName;
      break;
  }
  return action;
}

function getSelectedCategory(actionType) {
  var category = null;
  switch (actionType) {
    case "Page":
      category = "PageTransitions";
      break;
    case "MainValue":
    case "CSV":
      category = "MainValue";
      break;
    case "Property":
      category = "PropertyControl";
      break;
    case "DataBase":
      category = "DbAction";
      break;
    case "Media":
    case "Library":
      category = "MediaControl";
      break;
    case "Warning":
      category = "WarningControl";
      break;
    case "Comm":
      category = "RemoteDBControl";
      break;
    case "Contact":
      category = "ContactControl";
      break;
    case "Calendar":
      category = "CalendarEventControl";
      break;
    case "GoogleMap":
      category = "MapControl";
      break;
    case "MapMarker":
      category = "MapMarkerControl";
      break;
    case "MapRoute":
      category = "MapRouteControl";
      break;
    case "Motion":
      category = "GPSControl";
      break;
    case "Sensor":
      category = "TimerControl";
      break;
    case "Email":
      category = "EmailControl";
      break;
    case "SystemControl":
      category = "SystemControl";
      break;
    case "SendPushNotification":
      category = "SendPushNotificationControl";
      break;
    case "LogsAnalytics":
      category = "LogsAnalyticsControl";
      break;
    case "IoT":
      category = "IoTControl";
      break;
    case "Gadget":
      category = "GadgetControl";
      break;
    default:
      category = "";
      break;
  }
  return category;
}

function getSubactionsDetail(actionname) {
  let subactions = ["success", "error"];
  switch (actionname) {
    case "Alert":
      subactions = ["onTapOk", "onTapCancel"];
      break;
    case "Select":
    case "RemoteSelect":
    case "GetAnalyticsReport":
      subactions = ["detectRecords", "success", "error"];
      break;
    /*  case "NetworkAvailable":
            subactions = ['available', 'notAvailable'];
          break; */
    case "StartGeoFencing":
      subactions = ["success", "error", "EnterFencing", "ExitFencing"];
      break;
    default:
      subactions = ["success", "error"];
      break;
  }
  return subactions;
}

function getSubActionsData(
  subActions,
  subactionsList,
  actionlist,
  _id,
  _level
) {
  let subActionsObj = {};

  for (let index = 0; index < subactionsList.length; index++) {
    const event = subactionsList[index];
    //console.log(_level, _id, "...subActions............", event, subActions[event]);
    const subAction = subActions[event];
    if (subAction && subAction.length > 0) {
      let lvl = parseInt(_level) + 1;
      let subactionData = manipulateActionsData(
        subAction,
        actionlist,
        [],
        lvl,
        event,
        _id
      );
      subActionsObj[event] = subactionData["list"];
    } else {
      subActionsObj[event] = [];
    }
  }

  return subActionsObj;
}

function filterActionConfig(allconfig, acttype, actionname, basedata) {
  let actconfig = allconfig.filter(function (config) {
    return config["method"] === actionname;
  });

  const elemChildren = actconfig[0].children;
  //console.log(acttype, actionname, "...filterActionConfig >>>", actconfig[0], "***", elemChildren);
  let actTemplate = setActionTemplate(
    elemChildren[0]["_itemObj"],
    [elemChildren[0]["_propObj"]],
    basedata
  );
  return actTemplate; //actconfig;
}

function fetchActionConfig(acttype, actionname, basedata) {
  let _name = actionname.charAt(0).toUpperCase() + actionname.substr(1);
  let _classpath =
    "././config/action/" +
    getSelectedCategory(acttype) +
    "/" +
    getSelectedAction(_name) +
    ".xml";
  //console.log(acttype, actionname, "...fetchActionConfig >>>", _name, _classpath);

  let actionTemplate = [];

  return fetch(_classpath)
    .then((res) => res.text())
    .then(
      (result) => {
        //console.log("config >>>", result);

        var xml = new ReactXMLParser().parseFromString(result);
        // var xml = new XMLParser().parseFromString(result);
        //console.log(xml);
        var actionitem = xml.getElementsByTagName("item");
        if (actionitem.length > 0) {
          var actionproperties = xml.getElementsByTagName("type");
          actionTemplate = setActionTemplate(
            actionitem[0],
            actionproperties,
            basedata
          );
          //console.log(xml, actionitem[0], actionproperties, "<<< properties.. config ..template >>>", actionTemplate);
          return actionTemplate;
        }
      },
      (error) => {
        console.log("config error >>>", error);
      }
    );
}

function setActionTemplate(item, properties, basedata) {
  let _actionConfig = [];

  let actionObj = item.attributes;
  let typeConfig = [];
  properties.forEach((element) => {
    let propObj = element.attributes;
    if (propObj.name === "parameters") {
      typeConfig.push({
        name: propObj.name,
        properties: populateActionConfig(element.children, basedata),
      });
    }
  });
  actionObj.children = typeConfig;

  _actionConfig.push(actionObj);
  //console.log("_actionConfig >>>>", _actionConfig);
  return _actionConfig;
}
function populateActionConfig(properties, basedata) {
  var _propConfig = [];
  if (properties.length === 0) return _propConfig;

  //console.log("properties >>>", properties);
  properties.forEach((element) => {
    let propObj = element.attributes;
    if (element.children !== undefined && element.children.length > 0) {
      let otherObj = populatePropertyObjects(element.children, basedata);
      for (let index = 0; index < otherObj.length; index++) {
        const item = otherObj[index];
        propObj[item.name] = item.items;
        if (item.name === "dataSource") {
          propObj["labelField"] = item["labelField"] ? item["labelField"] : "";
          propObj["valueField"] = item["valueField"] ? item["valueField"] : "";
        }
      }
    }

    _propConfig.push(propObj);
  });

  return _propConfig;
}
function populatePropertyObjects(children, basedata) {
  var _propObj = [];
  children.forEach((element) => {
    let _prop = [];

    if (element.children.length > 0) {
      for (let index = 0; index < element.children.length; index++) {
        const item = element.children[index];
        if (element.name === "validations") {
          _prop.push(item.attributes.validator);
        } else if (element.name === "dataSource") {
          _prop.push(item.attributes.name);
        } else if (element.name === "dependentActions") {
          _prop.push(item);
        }
      }
      _propObj.push({ name: element.name, items: _prop });
    } else {
      if (element.name === "dataSource") {
        //console.log("populate dataSource >>>", element.attributes);
        _prop = generateDataSource(basedata, _prop, element.attributes);
        _propObj.push({
          name: element.name,
          labelField: element.attributes["labelField"],
          valueField: element.attributes["valueField"],
          items: _prop,
        });
      }
    }
  });

  return _propObj;
}

function generateDataSource(baseData, resultArr, attributes) {
  let attrSource = attributes["source"].replace("{", "").replace("}", "");
  const sourceVal = attrSource.split(":")[1];
  let methodName = sourceVal.split("(")[0];
  let args = sourceVal.split("(")[1].split(")")[0];
  //console.log(baseData, " .... dataSource ....", methodName, args);

  let _data = [];
  switch (methodName) {
    case "getPageCacheList":
      let pagetypes = args;
      _data = getPageCacheList(baseData["pagelist"], pagetypes);
      break;
    /* case "getSpecificTargetUIParts":
        
        break; */
    /*case "getTargetCameraUIParts":
        _data = getTargetCameraUIParts(baseData['page'], baseData['children']);
        break; */

    default:
      _data = [];
  }

  if (_data.length > 0) {
    for (let i = 0; i < _data.length; i++) {
      const element = _data[i];
      resultArr.push(element);
    }
  } else {
    resultArr = [];
    resultArr.push("func_" + attrSource.slice(attrSource.indexOf(":") + 1));
  }

  //console.log(methodName, " .... dataSource ....", resultArr);
  return resultArr;
}

function getPageCacheList(pagelist, pagetypes) {
  if (pagetypes && pagetypes.length > 0) {
    let arrTypes = pagetypes.split(",");
    let filterlist = pagelist.filter((item) =>
      arrTypes.includes(item["viewType"])
    );
    return filterlist;
  }
  return pagelist;
}

/*function getTargetCameraUIParts(pageData, pageChildren)
  {
    let targetUIParts = [];
    for (let index = 0; index < pageChildren.length; index++) {
      const pagechild = pageChildren[index];
      if(pagechild.viewType.indexOf("Camera") > -1) {
        targetUIParts.push( {page:pageData, uiname:pagechild.uiParts[0].name} );
      }      
    }
		return targetUIParts;
  }*/

function manageAppliedActions(basedata, actionDic, allprops) {
  if (actionDic && actionDic.hasOwnProperty("params")) {
    const fileURL =
      "https://" +
      basedata["apiconfig"]["hostname"] +
      "/appexe/" +
      basedata["apiconfig"]["userid"] +
      "/" +
      basedata["apiconfig"]["projectid"] +
      "/resources/";
    const objParam = actionDic.params;
    if (actionDic["method"] === "View") {
      if (objParam.hasOwnProperty("file")) {
        objParam.file["filename"] = objParam["pageName"];
        objParam.file["url"] = fileURL + "plist/";
      }
    } else if (actionDic["method"] === "ReturnToParentView") {
      if (objParam.hasOwnProperty("file")) {
        objParam.file["filename"] = objParam["pageName"];
        objParam.file["url"] = fileURL + "plist/";
      }
    } else if (actionDic["method"] === "SelectTab") {
      if (objParam.hasOwnProperty("pageTitle")) {
        const tabPageValue = getTabPageIndex(
          objParam["pageTitle"],
          basedata["pagelist"]
        );
        if (objParam.hasOwnProperty("tabPageid")) {
          objParam["tabPageid"] = tabPageValue["pageid"];
        }
      }
    } else if (actionDic["method"] === "setVisible") {
      if (
        objParam.hasOwnProperty("uiparts") &&
        objParam["uiparts"].length > 0
      ) {
        const scrId =
          allprops && allprops["screenIndex"] ? allprops["screenIndex"] : 0;
        const _pageId = objParam["targetPage"].replace("page_", "");
        objParam["uiparts"] = manageSetVisible_UIparts(
          objParam["uiparts"],
          _pageId,
          scrId,
          basedata
        );
      } else {
        objParam["uiparts"] = [];
      }
    } else {
      const _actParams = actionDic["params"];
      if (_actParams.hasOwnProperty("recordList")) {
        //console.log(actionDic, "..... manage Applied recordList >>>> ", _actParams['recordList']);
        updateRecordList(actionDic);
      } else {
        if (_actParams.hasOwnProperty("GroupList")) {
          actionDic["params"]["GroupList"] = "";
        }
        if (_actParams.hasOwnProperty("CellList")) {
          actionDic["params"]["CellList"] = "";
        }
      }
    }
  }
}

function manageActionParamters(basedata, actionData, key, value, allprops) {
  //console.log(key, value, "..... manageActionParamters >>>> ", actionData, basedata);

  const fileURL =
    "https://" +
    basedata["apiconfig"]["hostname"] +
    "/appexe/" +
    basedata["apiconfig"]["userid"] +
    "/" +
    basedata["apiconfig"]["projectid"] +
    "/resources/";
  const objParam = actionData.params;
  if (actionData["method"] === "View" && key === "pageName") {
    if (objParam.hasOwnProperty("file")) {
      objParam.file["filename"] = objParam["pageName"];
      objParam.file["url"] = fileURL + "plist/";
    }
  } else if (
    actionData["method"] === "ReturnToParentView" &&
    key === "pageName"
  ) {
    if (objParam.hasOwnProperty("file")) {
      objParam.file["filename"] = objParam["pageName"];
      objParam.file["url"] = fileURL + "plist/";
    }
  } else if (actionData["method"] === "SelectTab" && key === "pageTitle") {
    const tabPageValue = getTabPageIndex(value, basedata["pagelist"]);
    objParam["tab"] = tabPageValue["index"];
    if (objParam.hasOwnProperty("tabPageid")) {
      objParam["tabPageid"] = tabPageValue["pageid"];
    }
  } else if (actionData["method"] === "setVisible" && key === "targetPage") {
    //console.log(actionData, "..... setVisible manageActionParamters >>>> ", objParam['uiparts']);
    //objParam['uiparts'] = [];

    if (objParam.hasOwnProperty("uiparts") && objParam["uiparts"].length > 0) {
      const scrId = allprops["screenIndex"] ? allprops["screenIndex"] : 0;
      const _pageId = value.replace("page_", "");
      objParam["uiparts"] = manageSetVisible_UIparts(
        objParam["uiparts"],
        _pageId,
        scrId,
        basedata
      );
    } else {
      objParam["uiparts"] = [];
    }
  } else if (
    actionData["category"] === "DbAction" ||
    actionData["category"] === "ComAction"
  ) {
    const _origdata = JSON.parse(JSON.stringify(actionData));
    updateDBActions(actionData);

    //console.log(key, value, ".... update DBActions >>>", _origdata, actionData);
    if (_origdata["category"] !== actionData["category"]) {
      const actConfig = filterActionConfig(
        allprops["config123"],
        actionData.type,
        actionData.method,
        basedata
      );
      return actConfig;
    }
  } else {
    if (key.indexOf("recordList") > -1) {
      if (actionData["params"].hasOwnProperty("recordList")) {
        const _records = {};
        const _recordList = actionData["params"]["recordList"];
        if (_recordList && _recordList.length > 0) {
          for (let i = 0; i < _recordList.length; i++) {
            const element = _recordList[i];
            if (element) {
              _records[element["key"]] = element["value"];
            }
          }
          if (actionData["params"].hasOwnProperty("rec")) {
            actionData["params"]["rec"] = _records;
          } else if (actionData["params"].hasOwnProperty("record")) {
            actionData["params"]["record"] = _records;
          }
        }
      }
    } else if (key === "targetPage") {
      const _actParams = actionData["params"];
      if (_actParams.hasOwnProperty("GroupList")) {
        _actParams["GroupList"] = "";
      }
      if (_actParams.hasOwnProperty("CellList")) {
        _actParams["CellList"] = "";
      }
    } else if (key === "GroupList") {
      const _actParams = actionData["params"];
      if (_actParams.hasOwnProperty("CellList")) {
        _actParams["CellList"] = "";
      }
    }
  }
}
function updateRecordList(actionDic) {
  if (actionDic["params"].hasOwnProperty("recordList")) {
    let _reclist = [];
    const _records = {};
    const _recordList = actionDic["params"]["recordList"];

    let aks = false;
    let aksobj = {};
    for (let i = 0; i < _recordList.length; i++) {
      const element = _recordList[i];
      if (element) {
        if (
          i !== _recordList.length - 1 &&
          (!element.hasOwnProperty("value") || element["value"] === "[]")
        ) {
          aks = true;
          aksobj["key"] = element["key"];
          continue;
        }
        if (aks && !element.hasOwnProperty("key")) {
          aks = true;
          aksobj["value"] = element["value"];
          _reclist.push(aksobj);
          _records[aksobj["key"]] = aksobj["value"];
          continue;
        }

        if (element["key"] !== "") {
          _reclist.push(element);
          _records[element["key"]] = element["value"];
        }
      } else {
        console.log(
          actionDic["method"],
          "########",
          _recordList,
          "..........",
          i
        );
      }
    }

    if (aks && _recordList.length > 1) {
      console.log(
        "remoteupdate.......1",
        actionDic["params"]["table"],
        "***",
        _recordList
      );
    }

    actionDic["params"]["recordList"] =
      _reclist.length === 0 ? [{ key: "", value: "" }] : _reclist;
    if (actionDic["params"].hasOwnProperty("rec")) {
      actionDic["params"]["rec"] = _records;
    } else if (actionDic["params"].hasOwnProperty("record")) {
      actionDic["params"]["record"] = _records;
    }
  }
  console.log(actionDic["method"], "########", actionDic["params"]);
}

/* function getTabPageIndex(value, pagelist) {
    let tablist =  pagelist.filter(function(page) {
      return (page['parentid'] === "App");
    });

    let tabIndex = 0;
    for (let i = 0; i < tablist.length; i++) {
      const element = tablist[i];
      if(element['Title'] === value) {
        tabIndex = i;
      }      
    }
    return tabIndex;
  } */
function getTabPageIndex(value, pagelist) {
  let tablist = pagelist.filter(function (page) {
    return page["parentid"] === "App";
  });

  let tabData = { index: 0, pageid: "" };
  for (let i = 0; i < tablist.length; i++) {
    const element = tablist[i];
    if (element["Title"] === value) {
      tabData = { index: i, pageid: element["pageid"] };
    }
  }
  return tabData;
}

function manageSetVisible_UIparts(objUIparts, pageId, scrId, basedata) {
  let pageChildren;
  if (basedata["page"]["pageid"] === pageId) {
    pageChildren = basedata["children"];
  } else {
    let pageObj = basedata["pagelist"].filter(function (page) {
      return page["pageid"] === pageId;
    });
    if (pageObj.length > 0) {
      pageChildren = getAllChildrenOnPage(pageObj[0], scrId);
    }
  }

  if (pageChildren && pageChildren.length > 0) {
    const _uiList = objUIparts;
    let existUIparts = [];
    for (let i = 0; i < _uiList.length; i++) {
      let uiname = _uiList[i];
      let isexist = isUIpartExist_onPage(uiname, pageChildren, scrId);
      //console.log(uiname, "... uilist >>>>>", isexist);
      if (isexist) {
        existUIparts.push(uiname);
      }
    }
    objUIparts = existUIparts;
  } else {
    objUIparts = [];
  }
  return objUIparts;
}
function isUIpartExist_onPage(uiName, uiChildren, scrId) {
  let uilist = uiChildren.filter(function (uipart) {
    return uipart["uiParts"][scrId]["name"] === uiName;
  });

  return uilist.length === 0 ? false : true;
}

function updateDBActions(objAction) {
  if (!checkMethodtoUpdate(objAction.method)) return;

  var objParams = objAction["params"];
  if (objParams.hasOwnProperty("servicename")) {
    var _serviceName = objParams.servicename;
    if (_serviceName !== "" && _serviceName !== "LocalDB") {
      objAction.category = "ComAction";
      objAction.type = "Comm";
      if (objAction.method.indexOf("Remote") === -1) {
        if (objAction.method.toLowerCase() === "changecondition")
          objAction.method = "ChangeRemoteCondition";
        else
          objAction.method =
            "Remote" +
            objAction.method.slice(0, 1).toUpperCase() +
            objAction.method.slice(1);
      }

      objAction["params"] = updateDBActionParams(objAction, objParams);
    } else {
      objAction.category = "DbAction";
      objAction.type = "DataBase";
      if (objAction.method.toLowerCase().indexOf("remote") > -1) {
        if (objAction.method.toLowerCase() === "changeremotecondition")
          objAction.method = "ChangeCondition";
        else if (
          objAction.method.toLowerCase() === "remoteselect" ||
          objAction.method.toLowerCase() === "remotenumrecords"
        )
          objAction.method = objAction.method.replace("Remote", "");
        else
          objAction.method = objAction.method
            .replace("Remote", "")
            .toLowerCase();
      }

      objAction["params"] = updateDBActionParams(objAction, objParams);
    }
  }
}
function checkMethodtoUpdate(_method) {
  var _arrmethods = [
    "insert",
    "update",
    "delete",
    "select",
    "numrecords",
    "changecondition",
    "changeremotecondition",
  ];
  for (var i = 0; i < _arrmethods.length; i++) {
    if (_method.toLowerCase().indexOf(_arrmethods[i]) > -1) return true;
  }
  return false;
}
/**
 * When user change DB-type from 'Local' to 'Remote' or viceversa;
 * then there is a need to update other parameters also
 * dependent to action-method.
 * Akshay Kumar Agarwal
 **/
function updateDBActionParams(dbAction, dbParams) {
  var _paramDic = dbAction["params"];

  var dbMethod = dbAction.method;
  switch (dbMethod.toLowerCase()) {
    case "insert":
    case "update": {
      _paramDic.table = dbParams.table;
      _paramDic.recordList = dbParams.recordList;
      if (dbParams.hasOwnProperty("rec")) _paramDic.record = dbParams.rec;

      /* _paramDic.table	= "";//dbParams.table;
        _paramDic.recordList = [{"key":"", "value":""}];//dbParams.recordList;
        if(dbParams.hasOwnProperty("rec")) {
          _paramDic.record = dbParams.rec;
          delete dbParams.rec;
        }
        _paramDic.record = {}; */
      break;
    }
    case "delete": {
      _paramDic.table = dbParams.table;
      _paramDic.where = dbParams.where;
      break;
    }
    case "select": {
      _paramDic.servicename = dbParams.servicename;
      _paramDic.tablename = dbParams.tablename;
      if (dbParams.hasOwnProperty("where")) {
        _paramDic.localwhere = dbParams.where;
        //delete dbParams.where;
      }
      _paramDic.order = dbParams.order;
      break;
    }
    case "numrecords": {
      _paramDic.servicename = dbParams.servicename;
      _paramDic.tablename = dbParams.tablename;
      if (dbParams.hasOwnProperty("remotewhere"))
        _paramDic.localwhere = dbParams.remotewhere;
      break;
    }
    case "changecondition": {
      _paramDic.servicename = dbParams.servicename;
      if (dbParams.hasOwnProperty("remotewhere"))
        _paramDic.localwhere = dbParams.remotewhere;
      break;
    }
    case "remoteinsert":
    case "remoteupdate":
    case "remotedelete": {
      break;
    }
    case "remoteselect": {
      _paramDic.servicename = dbParams.servicename;
      _paramDic.tablename = dbParams.tablename;
      if (dbParams.hasOwnProperty("localwhere"))
        _paramDic.where = dbParams.localwhere;
      _paramDic.order = dbParams.order;
      break;
    }
    case "remotenumrecords": {
      _paramDic.servicename = dbParams.servicename;
      _paramDic.tablename = dbParams.tablename;
      if (dbParams.hasOwnProperty("localwhere"))
        _paramDic.remotewhere = dbParams.localwhere;
      break;
    }
    case "changeremotecondition": {
      _paramDic.servicename = dbParams.servicename;
      if (dbParams.hasOwnProperty("localwhere"))
        _paramDic.remotewhere = dbParams.localwhere;
      break;
    }
    default:
      break;
  }

  return _paramDic;
}

function isValidationSucceed(actionData, actionConfig) {
  let validationArr = [];
  //console.log("****** isValidationSucceed ******", actionData, actionConfig);
  const dataParams = actionData["params"];
  const configProps =
    actionConfig.length > 0 ? actionConfig[0]["properties"] : [];
  if (configProps) {
    for (let index = 0; index < configProps.length; index++) {
      const configObj = configProps[index];
      if (!configObj.hasOwnProperty("formKey")) {
        let validation = getValidations(configObj);

        const parameter = configObj["path"].replace("params.", "");
        const paramValue = dataParams[parameter];

        var x = document.getElementsByName(configObj["path"]);
        if (x.length > 0) {
          const _display = x[0].style.display;
          //console.log(parameter, paramValue, "****** isValidationSucceed ******", x, _display);
          if (_display === "none") {
            continue;
          }
        }
        //console.log(actionData, "****** isValidationSucceed ******", paramValue, validation);
        let errorString = validateInputValue(paramValue, validation);
        if (errorString.length > 0) {
          validationArr.push({ parameter: parameter, error: errorString });
        }
      }
    }
  }

  if (validationArr.length === 0) {
    if (dataParams && dataParams.hasOwnProperty("recordList")) {
      const errorRecordStr = validateRecordList(dataParams);
      if (errorRecordStr.length > 0) {
        validationArr.push({ parameter: "recordList", error: errorRecordStr });
      }
      //console.log(dataParams, "****** is Valid ******", errorRecordStr);
    }
  }

  return validationArr;
}
function getValidations(configObj) {
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
function validateInputValue(value, validationArr) {
  let _errorStr = "";

  if (typeof value === "string" && value.length === 0) {
    if (validationArr.indexOf("RequiredValueValidator") > -1) {
      _errorStr = "Field is required";
    }
  } else {
    for (let i = 0; i < validationArr.length; i++) {
      const validator = validationArr[i];
      _errorStr = getValidationError(validator, value);
    }
  }

  return _errorStr;
}
function getValidationError(validator, value) {
  let _validationError = "";

  //console.log(validator, " *** getValidationError *** ", value);
  switch (validator.toLowerCase()) {
    case "uniqpagetitlevalidator": {
      _validationError = "";
      this.props.pageList.forEach((page) => {
        let displayName = page["Title"];
        if (displayName === value) {
          _validationError = "Page name should be unique";
          return;
        }
      });

      const allowedChars = /\w/g;
      let allowedTitle = value.match(allowedChars);
      if (value.length !== allowedTitle.length)
        _validationError = "Only alphabets, numbers & underscore allowed.";
      break;
    }
    case "uniquinamevalidator": {
      _validationError = "";
      this.props.pageChildren.forEach((element) => {
        let uipart = element["uiParts"][0];
        let displayName = uipart.name;
        if (displayName === value) {
          _validationError = "UIpart name should be unique";
          return;
        }
      });

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
    case "numfieldvalidator": {
      var validInput_RegExp = /^[^a-zBD-TV-Z#]+$/;
      if (!validInput_RegExp.test(value)) {
        _validationError = "Not allowed characters found";
      }
      break;
    }
    default:
      _validationError = "";
      break;
  }

  return _validationError;
}
function validateRecordList(recordParam) {
  const _recordList = recordParam["recordList"];
  //console.log("validateRecordList >>>", _recordList);
  if (_recordList.length === 1) {
    if (_recordList[0]["key"] === "") {
      return "Atleast one key-value must be there";
    }
  }
  return "";
}

function getAllChildrenOnPage(_page, scrIndex) {
  let arrChildren = [];
  if (_page.viewType.indexOf("TableView") > -1) {
    if (
      _page.viewType === "DbTableViewList" ||
      _page.viewType === "RemoteTableViewList" ||
      _page.viewType === "DbTableViewNestedList"
    ) {
      let arrFields0 = _page.Children[0].Group[0].RecordCellDef.Fields;
      for (let i0 = 0; i0 < arrFields0.length; i0++) {
        arrChildren.push(arrFields0[i0]);
      }
      if (_page.viewType === "DbTableViewNestedList") {
        let arrSubFields0 = _page.Children[0].Group[0].SubRecordCellDef.Fields;
        for (let i1 = 0; i1 < arrSubFields0.length; i1++) {
          arrChildren.push(arrSubFields0[i1]);
        }
      }
    } else {
      let arrGroup = _page.Children[0].Group;
      for (let i = 0; i < arrGroup.length; i++) {
        let arrRow = arrGroup[i].rowarray;
        for (let j = 0; j < arrRow.length; j++) {
          if (arrRow[j]) {
            let arrFields = arrRow[j].Fields;
            for (let k = 0; k < arrFields.length; k++) {
              arrChildren.push(arrFields[k]);
            }
          }
        }
      }
    }
  } else {
    let pageChildren;
    if (_page.viewType === "ScrollView" || _page.viewType === "PageScrollView")
      pageChildren = _page.Children[0].Children;
    else pageChildren = _page.Children;

    pageChildren.forEach((uiContainerDic) => {
      arrChildren.push(uiContainerDic);
      if (uiContainerDic["viewType"] === "TileList") {
        let arrTileItems =
          uiContainerDic["uiParts"][scrIndex].dataarray[0]["Fields"];
        for (let u = 0; u < arrTileItems.length; u++) {
          arrChildren.push(arrTileItems[u]);
        }
      } else if (uiContainerDic["viewType"] === "ExpansionPanel") {
        let arrrPanelItems = uiContainerDic["uiParts"][scrIndex].panelItems;
        for (let p = 0; p < arrrPanelItems.length; p++) {
          let panerItemsField = arrrPanelItems[p]["Fields"];
          for (let pi = 0; pi < panerItemsField.length; pi++) {
            arrChildren.push(panerItemsField[pi]);
          }
        }
      } else if (
        uiContainerDic["viewType"] === "Form" ||
        uiContainerDic["viewType"] === "FormView"
      ) {
        let arrFormItems =
          uiContainerDic["uiParts"][scrIndex].formItems[0]["Fields"];
        for (let f = 0; f < arrFormItems.length; f++) {
          arrChildren.push(arrFormItems[f]);
        }
      }
    });
  }

  // page-bars children
  let cntTop = -1;
  if (_page._toolBarTop.length > 0) {
    _page._toolBarTop.forEach((_topToolbar) => {
      cntTop++;
      if (cntTop === 0) {
        for (let t = 0; t < _topToolbar.Children.length; t++) {
          arrChildren.push(_topToolbar.Children[t]);
          if (_topToolbar.Children[t]["viewType"] === "TileList") {
            let arrtTileItems =
              _topToolbar.Children[t]["uiParts"][scrIndex].dataarray[0][
                "Fields"
              ];
            for (let t0 = 0; t0 < arrtTileItems.length; t0++) {
              arrChildren.push(arrtTileItems[t0]);
            }
          }
        }
      }
    });
  }

  let cntBottom = -1;
  if (_page._toolBarBottom.length > 0) {
    _page._toolBarBottom.forEach((_bottomToolbar) => {
      cntBottom++;
      if (cntBottom === 0) {
        for (let b = 0; b < _bottomToolbar.Children.length; b++) {
          arrChildren.push(_bottomToolbar.Children[b]);
          if (_bottomToolbar.Children[b]["viewType"] === "TileList") {
            let arrbTileItems =
              _bottomToolbar.Children[b]["uiParts"][scrIndex].dataarray[0][
                "Fields"
              ];
            for (let b0 = 0; b0 < arrbTileItems.length; b0++) {
              arrChildren.push(arrbTileItems[b0]);
            }
          }
        }
      }
    });
  }

  let cntLeft = -1;
  if (_page._toolBarLeft.length > 0) {
    _page._toolBarLeft.forEach((_leftToolbar) => {
      cntLeft++;
      if (cntLeft === scrIndex) {
        for (let l = 0; l < _leftToolbar.Children.length; l++) {
          let leftToolbarUI = _leftToolbar.Children[l];
          arrChildren.push(leftToolbarUI);
          if (leftToolbarUI["viewType"] === "TileList") {
            let arrlTileItems =
              leftToolbarUI["uiParts"][scrIndex].dataarray[0]["Fields"];
            for (let l0 = 0; l0 < arrlTileItems.length; l0++) {
              arrChildren.push(arrlTileItems[l0]);
            }
          } else if (leftToolbarUI["viewType"] === "ExpansionPanel") {
            let arrlPanelItems = leftToolbarUI["uiParts"][scrIndex].panelItems; //[0]
            for (let l1 = 0; l1 < arrlPanelItems.length; l1++) {
              let panelItemsField = arrlPanelItems[l1]["Fields"];
              for (let l10 = 0; l10 < panelItemsField.length; l10++) {
                arrChildren.push(panelItemsField[l10]);
              }
            }
          }
        }
      }
    });
  }
  let cntRight = -1;
  if (_page._toolBarRight && _page._toolBarRight.length > 0) {
    _page._toolBarRight.forEach((_rightToolbar) => {
      cntRight++;
      if (cntRight === scrIndex) {
        for (let r = 0; r < _rightToolbar.Children.length; r++) {
          let rightToolbarUI = _rightToolbar.Children[r];
          arrChildren.push(rightToolbarUI);
          if (rightToolbarUI["viewType"] === "TileList") {
            let arrrTileItems =
              rightToolbarUI["uiParts"][scrIndex].dataarray[0]["Fields"];
            for (let r0 = 0; r0 < arrrTileItems.length; r0++) {
              arrChildren.push(arrrTileItems[r0]);
            }
          } else if (rightToolbarUI["viewType"] === "ExpansionPanel") {
            let arrrPanelItems = rightToolbarUI["uiParts"][scrIndex].panelItems; //[0]
            for (let r1 = 0; r1 < arrrPanelItems.length; r1++) {
              let panerItemsField = arrrPanelItems[r1]["Fields"];
              for (let r10 = 0; r10 < panerItemsField.length; r10++) {
                arrChildren.push(panerItemsField[r10]);
              }
            }
          }
        }
      }
    });
  }

  if (_page.hasOwnProperty("pageOverlay")) {
    let _objOverlay = _page.pageOverlay;
    let overlayChildren = _objOverlay.Children;
    if (overlayChildren) {
      for (let o = 0; o < overlayChildren.length; o++) {
        arrChildren.push(overlayChildren[o]);
        if (overlayChildren[o]["viewType"] === "Dialog") {
          let arrDialogItems =
            overlayChildren[o]["uiParts"][scrIndex].dataarray[0]["Fields"];
          for (let o0 = 0; o0 < arrDialogItems.length; o0++) {
            if (arrDialogItems[o0]["viewType"] === "TileList") {
              arrDialogItems[o0]["parent"] = "Dialog";
              let arrTileItems =
                arrDialogItems[o0]["uiParts"][scrIndex].dataarray[0]["Fields"];
              for (let u = 0; u < arrTileItems.length; u++) {
                arrChildren.push(arrTileItems[u]);
              }
            }
            arrChildren.push(arrDialogItems[o0]);
          }
        }
      }
    }
  }

  return arrChildren;
}

function mapStateToProps(state) {
  return {
    apiParam: state.appParam.params,
    actionLocale: state.appParam.actionlocale,
    actionList: state.appParam.actionlist,
    actionConfig: state.appParam.actionconfig,
    appData: state.appData.data,
    pageList: state.appData.pagelist,
    currentPage: state.selectedData.pagedata,
    pageChildren: state.selectedData.paeChildren,
    currentUI: state.selectedData.uidata,
    copiedAction: state.selectedData.copyaction,
    targetEditor: state.selectedData.editor,
    editorState: state.selectedData.editorState,
    contentEditorParent: state.selectedData.editorParent,
  };
}
export default connect(mapStateToProps)(ActionEditor);
