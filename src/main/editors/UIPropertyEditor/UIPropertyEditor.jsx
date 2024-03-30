import React from "react";
import PropTypes from "prop-types";
import "./UIPropertyEditorStyle.css";
import { List, ListItem, ListItemText, Collapse } from "@mui/material";

import PropertyValueForm from "../../forms/PropertyValueForm/PropertyValueForm";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

class UIPropertyEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      uiData: this.props.uipart,
      uiType: this.props.viewType,
      uiConfig: this.props.config,
      uiLocale: this.props.locale,

      //openProps: true,
      collapseProps: "",
    };

    this.handleExpandCollapse = this.handleExpandCollapse.bind(this);
    this.handleUpdateValue = this.handleUpdateValue.bind(this);
  }

  componentDidMount() {
    //this.fetchUILocale('en');
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.uipart !== this.props.uipart) {
      //console.log("............. componentDidUpdate ............");
      this.setState({ uiData: this.props.uipart });
    }
  }

  handleExpandCollapse(event) {
    let _name = event.currentTarget.dataset.name;

    let strOpen = this.state.collapseProps;
    strOpen = setCollapseCategory(strOpen, _name);
    //console.log(_name, "............. handleExpandCollapse ............", strOpen);
    this.setState({ collapseProps: strOpen });
  }

  //////////////////////

  handleUpdateValue = (key, value) => {
    console.log(key, "..... handleUpdateValue >>>> ", value);
    console.log("..... uidata >>>> ", this.state.uiData[key]);
    this.props.onPropertyEdit(key, value);
  };

  //////////////////////

  render() {
    const { show, uiData, uiType, collapseProps, uiConfig, uiLocale } =
      this.state;
    console.log(uiType, "..... uidata >>>> ", uiData);

    if (!show) {
      return null;
    }

    return (
      <div
        id="uipropertyeditor"
        className="vertical-align"
        style={{ overflow: "auto" }}
      >
        <List
          component="nav"
          dense={true}
          style={{ width: "100%", padding: 0, marginBottom: 2 }}
          aria-labelledby="nested-list-subheader"
        >
          {getUIconfigByUIType(uiConfig, uiType).map((category, index) => (
            <div
              key={index}
              id={category.name}
              style={{ border: "1px solid", marginBottom: 4 }}
            >
              <ListItem
                button
                className="property-editor-list-item"
                data-name={category.name}
                onClick={this.handleExpandCollapse}
              >
                {isCategoryCollapse(collapseProps, category.name) ? (
                  <ExpandLess />
                ) : (
                  <ExpandMore />
                )}
                <ListItemText
                  className="property-editor-list-heading"
                  primary={getPropertyCategoryTitle(category.name, uiLocale)}
                ></ListItemText>
              </ListItem>
              <Collapse
                in={isCategoryCollapse(collapseProps, category.name)}
                timeout="auto"
                unmountOnExit
                style={{ paddingBottom: 4, backgroundColor: "#fff" }}
              >
                <List component="div" dense={true} disablePadding>
                  {category.properties.map((property, indexprop) => (
                    <ListItem
                      className="property-editor-dense-list-item"
                      key={indexprop}
                    >
                      <PropertyValueForm
                        data={uiData}
                        property={property}
                        locale={uiLocale}
                        onUpdateValue={this.handleUpdateValue}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </div>
          ))}
        </List>
      </div>
    );
  }
}

function getPropertyCategoryTitle(categoryName, uilocale) {
  let categoryTitle;
  if (uilocale.length > 0) {
    categoryTitle = uilocale[0][categoryName];
  }
  if (categoryTitle === undefined) return categoryName;

  return categoryName;
}

function getUIconfigByUIType(config, type) {
  let _nodePages = config.filter(function (node) {
    return node.targetClass === type;
  });

  if (_nodePages.length === 0) {
    return [];
  }
  return _nodePages[0].children;
}

function setCollapseCategory(strCategory, name) {
  let _name = name + ",";
  if (strCategory.indexOf(name) > -1) {
    strCategory = strCategory.replace(_name, "");
  } else {
    strCategory += _name;
  }

  return strCategory;
}

function isCategoryCollapse(strCategory, name) {
  if (strCategory.toString().indexOf(name) > -1) {
    return false;
  } else {
    return true;
  }
}

UIPropertyEditor.propTypes = {
  //onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  children: PropTypes.node,
};

export default UIPropertyEditor;
