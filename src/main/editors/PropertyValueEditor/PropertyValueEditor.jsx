import React from "react";
import PropTypes from "prop-types";
import "./PropertyValueEditorStyle.css";
import { List, ListItem, ListItemText, Collapse } from "@mui/material";

import PropertyValueForm from "../../forms/PropertyValueForm/PropertyValueForm";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

class PropertyValueEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      type: this.props.editor,

      baseData: this.props.data,
      viewType: this.props.viewType,
      config: this.props.config,
      locale: this.props.locale,

      dependentActions: [],
      collapseProps: "",
      selectedIndex: 0,
      displayProps: [],
    };

    this.handleExpandCollapse = this.handleExpandCollapse.bind(this);
    this.handleUpdateValue = this.handleUpdateValue.bind(this);
  }

  componentDidMount() {
    //console.log("............. PropertyValueEditor componentDidMount ............");
  }

  componentDidUpdate(prevProps, prevState) {
    //console.log("............. PropertyValueEditor componentDidUpdate ............");
    if (prevProps.data !== this.props.data) {
      this.setState({ baseData: this.props.data });
    }
  }

  handleExpandCollapse(event) {
    let _name = event.currentTarget.dataset.name;

    let strOpen = this.state.collapseProps;
    strOpen = setCollapseCategory(strOpen, _name);
    this.setState({ collapseProps: strOpen });
  }

  //////////////////////

  handleUpdateValue = (key, value) => {
    // console.log(key, "..... handleUpdateValue >>>> ", value);
    //console.log("..... baseData >>>> ", this.state.baseData[key]);
    this.props.onPropertyEdit(key, value);
  };

  handleSelectedValue = (key, value) => {
    this.setState({ selectedIndex: value });
  };

  handleDependentActions(property, propval, actions, actionType) {
    const baseData = this.state.baseData;

    /* let _display = [];
      this.setState({displayProps: _display}); */

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const attribute = action["attributes"];

      if (
        attribute.condition === "compare" &&
        attribute.at.indexOf(actionType) > -1
      ) {
        //const source = attribute['compareTarget'];
        const compareBy = attribute["compareBy"];
        const compareWith = attribute["compareWith"];
        let condResult = getConditionResult(propval, compareBy, compareWith);

        //console.log(property, condResult, "..... handleDependentActions >>>> ", this.state.displayProps);
        const actionItems = action["children"];
        for (let j = 0; j < actionItems.length; j++) {
          const actionItem = actionItems[j]["attributes"];
          const itemChildren = actionItems[j]["children"];
          const caseof = actionItem["caseOf"] === "true" ? true : false;
          if (condResult === caseof) {
            this.parseDependentAction(baseData, actionItem, itemChildren);
            if (itemChildren.length > 0) {
              //console.log(property, propval, actions, "..... handleDependentActions >>>> ", itemChildren);
              this.handleDependentActions(
                property,
                propval,
                itemChildren,
                actionType
              );
            }
          }
        }
      }
    }
  }

  parseDependentAction(data, action, actionChild) {
    const method = action["method"];
    const target = action["target"];
    const value = action["value"];
    //console.log(this.state.displayProps, " ....doDependentAction >>>> ", target, method, value);

    let property = action.hasOwnProperty("property")
      ? String(action.property)
      : null;
    //let stopCommit = (String(action.stopCommit) === "true") ? true : false;
    //let chainedEvent = (action.hasOwnProperty("chainedEvent")) ? String(action.chainedEvent) : null;

    switch (method) {
      case "folded": {
        if (target) {
          let foldedVal = value === "true" ? "false" : "true";
          let showArr = getTargetDisplay(
            data,
            target,
            foldedVal,
            this.state.displayProps
          );
          //console.log(target, foldedVal, " ....do folded Action >>>> ", showArr);
          this.setState({ displayProps: showArr });
        }
        break;
      }
      case "hide": {
        if (target) {
          let showArr = getTargetDisplay(
            data,
            target,
            value,
            this.state.displayProps
          );
          this.setState({ displayProps: showArr });
        }
        break;
      }
      case "setValue": {
        if (target) target.value = value;
        break;
      }
      case "setPath": {
        if (target) target.path = value.toString();
        break;
      }
      case "setProperty": {
        if (target) target[property] = value;
        break;
      }
      case "setOptions": {
        console.log(target, value, " ....setOptions >>>> ", action);
        /* if(target)
          {
            if(value is Array && value.length > 0)
              value.sort();	
            target.setOptions(value, String(action.@labelField), String(action.@valueField));
          } */
        break;
      }
      case "setConfig": {
        /* if(target)
          {
            var _blnValue:Boolean = (value == "true") ? true : false;
            target.setConfigValue(_blnValue, String(action.@config));
          } */
        break;
      }
      case "init": {
        /* if(target)
              NumericStepperForm(target).value = value; */
        break;
      }
      case "setMax": {
        /*  if(target)
            NumericStepperForm(target).maximum = value; */
        break;
      }
      case "setMin": {
        /* if(target)
            NumericStepperForm(target).maximum = value; */
        break;
      }
      case "stopCommit": {
        //stopCommit = true;
        break;
      }
      case "keyValuePair": {
        /*  var str:String = String(action.@target);
          var targetPath:String = str.substring(str.indexOf("@")+1,str.indexOf(":"));
          var str1:String = str.substring(str.indexOf(":")+1,str.indexOf("."));
          var str2:String = str.substring(str.indexOf(".")+1,str.i//setValue_forProperty(this.props.data, _key, _value);ndexOf("}"));
          base[targetPath][str1][str2] = convertToKeyValue(value as Array); */

        break;
      }
      case "keyValueList": {
        /* var temp_str:String = String(action.@target);
          var temp_targetPath:String = temp_str.substring(temp_str.indexOf("@")+1,temp_str.indexOf(":"));
          var temp_str1:String = temp_str.substring(temp_str.indexOf(":")+1,temp_str.indexOf("."));
          var temp_str2:String = temp_str.substring(temp_str.indexOf(".")+1,temp_str.indexOf("}"));
          base[temp_targetPath][temp_str1][temp_str2] = convertToArray(value as Array); */

        break;
      }
      case "dependentConditions": {
        /* var xListDependentWhen:XMLList = action.descendants( "when" );
          var xmlDependentActions:XML = xListDependentWhen[0];
          if (xmlDependentActions)
          {
            dispatchActionsToGo(inputForm, xmlDependentActions);
          } */
        break;
      }
      default: {
        if (action.hasOwnProperty("args"))
          doMethodByPath(method, action["args"]);
        else doMethodByPath(method);
      }
    } //setValue_forProperty(this.props.data, _key, _value);
  }

  manageDependentActions(key, actions) {
    let _dependentActions = this.state.dependentActions;
    _dependentActions.push({ key: key, actions: actions });
    this.setState({ dependentActions: _dependentActions });
  }

  ////////////////////////setValue_forProperty(this.props.data, _key, _value);

  render() {
    const { show, type, collapseProps, displayProps } = this.state;
    const baseData = this.props.data;
    const viewType = this.props.viewType;
    const config = this.props.config;
    const locale = this.props.locale;
    //const displayProps = [];
    const options = [];
    //console.log(this.props, viewType, " << PropertyValueEditor >> ", baseData);

    let editorId =
      this.props.editor === "page" ? baseData["pageid"] : baseData["name"];
    const selectedItem = {
      editor: this.props.editor,
      id: editorId,
      index: this.state.selectedIndex,
    };
    //console.log(baseData, " << PropertyValueEditor >> ", selectedItem);

    if (!show) {
      return null;
    }

    return (
      <div
        id="propertyvalueeditor"
        className="vertical-align"
        style={{ overflow: "auto" }}
      >
        <List
          component="nav"
          dense={true}
          className="property-value-editor"
          style={{ width: "100%", padding: 0, marginBottom: 2 }}
          aria-labelledby="nested-list-subheader"
        >
          {getConfigByViewType(config, viewType).map((category, index) => (
            <div key={index} id={category.name}>
              <ListItem
                button
                className="property-list-header"
                data-name={category.name}
                onClick={this.handleExpandCollapse}
              >
                {isCategoryCollapse(collapseProps, category.name) ? (
                  <ExpandLess />
                ) : (
                  <ExpandMore />
                )}
                <ListItemText
                  style={{ padding: "0.5rem" }}
                  primary={getPropertyCategoryTitle(category.name, locale)}
                ></ListItemText>
              </ListItem>
              <Collapse
                className="editor-collapse-section"
                in={isCategoryCollapse(collapseProps, category.name)}
                timeout="auto"
                unmountOnExit
              >
                {category.properties.map((property, indexprop) => (
                  <section key={indexprop}>
                    <PropertyValueForm
                      formtype={type}
                      data={baseData}
                      property={property}
                      locale={locale}
                      selectedItem={selectedItem}
                      screenIndex={this.props.screenIndex}
                      onUpdateValue={this.handleUpdateValue}
                      onUpdateIndex={this.handleSelectedValue.bind(this)}
                      setDependentActions={this.manageDependentActions.bind(
                        this
                      )}
                      dependentActions={this.state.dependentActions}
                      show={displayProps}
                      options={options}
                    />
                  </section>
                ))}
              </Collapse>
            </div>
          ))}
        </List>
      </div>
    );
  }
}

function getConfigByViewType(config, type) {
  // console.log("Hii", config);
  let _nodes = config.filter(function (node) {
    return node.targetClass === type;
  });

  if (_nodes.length === 0) {
    return [];
  }
  return _nodes[0].children;
}

function getPropertyCategoryTitle(categoryName, locale) {
  let categoryTitle;
  if (locale.length > 0) {
    categoryTitle = locale[0][categoryName];
  }
  if (categoryTitle === undefined) return <h4>{categoryName}</h4>;

  return <h4>{categoryTitle}</h4>;
}

function isCategoryCollapse(strCategory, name) {
  if (strCategory.toString().indexOf(name) > -1) {
    return false;
  } else {
    return true;
  }
}

//////////////////

function setCollapseCategory(strCategory, name) {
  let _name = name + ",";
  if (strCategory.indexOf(name) > -1) {
    strCategory = strCategory.replace(_name, "");
  } else {
    strCategory += _name;
  }

  return strCategory;
}

function getConditionResult(target, operator, val) {
  let condparse = parseCondition(operator, target, val);
  let caseResult = condparse;

  return caseResult;
}

function parseCondition(operator, compareTarget, compareValue) {
  let val = false;
  //console.log(compareTarget, compareValue, "parseCondition >>>>", operator);
  switch (operator) {
    case "EQ":
      if (
        Number(compareTarget) === parseInt(compareValue) ||
        compareTarget === compareValue
      ) {
        val = true;
      }
      break;
    case "NE":
      if (
        Number(compareTarget) !== parseInt(compareValue) ||
        compareTarget !== compareValue
      ) {
        val = true;
      }
      break;
    case "GT":
      if (Number(compareTarget) > Number(compareValue)) {
        val = true;
      }
      break;
    case "GE":
      if (Number(compareTarget) >= Number(compareValue)) {
        val = true;
      }
      break;
    case "LT":
      if (Number(compareTarget) < Number(compareValue)) {
        val = true;
      }
      break;
    case "LE":
      if (Number(compareTarget) <= Number(compareValue)) {
        val = true;
      }
      break;
    case "IS_NULL_OR_EMPTY":
      val = !compareTarget ? true : false;
      break;
    default:
      val = false;
  }
  return val;
}

function getValueByPath(path, base) {
  if (path) {
    path = path.substring(path.indexOf("[") + 1, path.lastIndexOf("]"));
  }
  return path;
}

function getTargetDisplay(data, target, displayVal, displayArr) {
  const targetObj = getValueByPath(target, data);
  //console.log(target, displayVal, "..... getTargetDisplay >>>> ", targetObj);
  let _displayArr = displayArr.filter(function (node) {
    if (node[targetObj]) {
      node[targetObj] = displayVal;
      return true;
    }
    return false;
  });

  let showObj = {};
  showObj[targetObj] = displayVal;
  if (_displayArr.length === 0) {
    displayArr.push(showObj);
  }

  return displayArr;
}

function doMethodByPath(path, args) {
  if (path.search("showAlert") === 0) {
    //Alert.show(args);
    return;
  }
  return;
  /* var matches:Array = parseBindings(path);
        var actualPath:String = matches[1].replace("()", "");
        
        if (actualPath.indexOf("@base:") == 0)
        {
          var methodPath:String = actualPath.replace("@base:", "");
          BaseDic(value).doMethod(methodPath, currentSettings.screenIndex);
        } */
}

PropertyValueEditor.propTypes = {
  //onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  children: PropTypes.node,
};

export default PropertyValueEditor;
