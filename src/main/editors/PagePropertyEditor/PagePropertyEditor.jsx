import React from "react";
import PropTypes from "prop-types";
import "./PagePropertyEditorStyle.css";

import { Collapse, List, ListItem, ListItemText } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import PropertyValueForm from "../../forms/PropertyValueForm/PropertyValueForm";

class PagePropertyEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      pageData: this.props.page,
      pageType: this.props.viewType,
      pageConfig: this.props.config,
      pageLocale: this.props.locale,

      //openProps: true,
      collapseProps: "",
    };

    this.handleExpandCollapse = this.handleExpandCollapse.bind(this);
    this.handleUpdateValue = this.handleUpdateValue.bind(this);
  }

  componentDidMount() {
    //console.log("............. componentDidMount ............");
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.page !== this.props.page) {
      //console.log("............. componentDidUpdate ............");
      this.setState({ pageData: this.props.page });
    }
  }

  /* handleExpandCollapse(event) {
      this.setState({openProps: !(this.state.collapseProps)});
    } */

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
    //console.log("..... pagedata >>>> ", this.state.pageData[key]);
    this.props.onPropertyEdit(key, value);
  };

  //////////////////////

  render() {
    const { show, pageData, collapseProps, pageConfig, pageLocale } =
      this.state;

    if (!show) {
      return null;
    }

    return (
      <div
        id="pagepropertyeditor"
        className="vertical-align"
        style={{ overflow: "auto" }}
      >
        <List
          component="nav"
          dense={true}
          style={{ width: "100%", padding: 0, marginBottom: 2 }}
          aria-labelledby="nested-list-subheader"
        >
          {getPageconfigByPageType(pageConfig, pageData.viewType).map(
            (category, index) => (
              <div
                key={index}
                id={category.name}
                style={{ border: "1px solid", marginBottom: 4 }}
              >
                <ListItem
                  button
                  className="list-item-container"
                  data-name={category.name}
                  onClick={this.handleExpandCollapse}
                >
                  {isCategoryCollapse(collapseProps, category.name) ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                  <ListItemText
                    className="list-item-txt"
                    primary={getPropertyCategoryTitle(
                      category.name,
                      pageLocale
                    )}
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
                      <ListItem className="dense-list-item" key={indexprop}>
                        <PropertyValueForm
                          data={pageData}
                          property={property}
                          locale={pageLocale}
                          onUpdateValue={this.handleUpdateValue}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </div>
            )
          )}
        </List>
      </div>
    );
  }
}

function getPropertyCategoryTitle(categoryName, pagelocale) {
  let categoryTitle;
  if (pagelocale.length > 0) {
    categoryTitle = pagelocale[0][categoryName];
  }
  if (categoryTitle === undefined) return categoryName;

  return categoryName;
}

PagePropertyEditor.propTypes = {
  //onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  children: PropTypes.node,
};

function getPageconfigByPageType(config, type) {
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

export default PagePropertyEditor;
