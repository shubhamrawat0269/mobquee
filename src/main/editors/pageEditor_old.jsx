import React from "react";
import PropTypes from "prop-types";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import {
  Box,
  Paper,
  IconButton,
  AppBar,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Fab,
  SvgIcon,
} from "@material-ui/core";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Draggable from "react-draggable";
import CheckBoxForm from "../forms/CheckBoxForm";
import PagePropertyEditor from "./PagePropertyEditor/PagePropertyEditor";
import PageLayoutEditor from "./pageLayoutEditor";
import AlertWindow from "../../components/AlertWindow";

import toprulerImage from "../../assets/hScale.GIF";
import leftrulerImage from "../../assets/vScale.GIF";

class PageEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      isLoaded: false,

      pageConfig: [],
      pages: [],
      pageCaches: [],
      pagelist: this.props.openedPageList,
      selectedPage: this.props.selectedPage,

      pageLocale: [],
    };

    this.handleSelectEditor = this.handleSelectEditor.bind(this);
    this.handleCloseEditor = this.handleCloseEditor.bind(this);

    this.handleUpdateValue = this.handleUpdateValue.bind(this);
  }

  componentDidMount() {
    this.fetchPageLocale("en");

    fetch("././config/PageConfig.json")
      .then((res) => res.json())
      .then(
        (result) => {
          let pageContainers = result["container"];
          pageContainers.forEach((element) => {
            if (element.include === "true") {
              this.fetchPageConfig(element["targetClass"]);
            }
          });
        },
        (error) => {
          console.log("config error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  fetchPageLocale(lang) {
    let localefilePath;
    if (lang === "ja" || lang === "jp") {
      localefilePath = "././locale/ja_JP/pageproperties.json";
    } else {
      localefilePath = "././locale/en_US/pageproperties.json";
    }
    fetch(localefilePath)
      .then((res) => res.json())
      .then(
        (result) => {
          //console.log("....Page-Locale fetching success >>>", result);
          let pageLocale = result["PageLocale"];
          this.setState({ pageLocale: pageLocale });
        },
        (error) => {
          console.log("Page-Locale fetching error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  fetchPageConfig(targetClass) {
    let _classpath = "././config/container/" + targetClass + ".xml";
    //console.log("fetchPageConfig >>>", _classpath);
    fetch(_classpath)
      .then((res) => res.text())
      .then(
        (result) => {
          //console.log("config >>>", result);

          var XMLParser = window.require("react-xml-parser");
          var xml = new XMLParser().parseFromString(result);
          //console.log(xml);
          var pageitem = xml.getElementsByTagName("item");
          if (pageitem.length > 0) {
            var pageproperties = xml.getElementsByTagName("type");
            this.setPageTemplate(pageitem[0], pageproperties);
          }
        },
        (error) => {
          console.log("Page config error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  setPageTemplate(item, properties) {
    let _pageConfig = this.state.pageConfig;

    let pageObj = item.attributes;
    let typeConfig = [];
    properties.forEach((element) => {
      let propObj = element.attributes;
      typeConfig.push({
        name: propObj.name,
        properties: this.populatePageConfig(element.children),
      });
    });
    pageObj.children = typeConfig;

    /* var bars= [];    
    let configChildren = pageObj.children;
    configChildren.forEach(element => {
      let configname = element.name.toString().toLowerCase();
      if(configname.indexOf('bar') > -1){          
       //bars = bars.concat(element.properties);
        bars.push.apply(bars, element.properties);
      }        
    });    
    console.log("bars >>>>", bars);
    let barsObj = {name:"Page Bars", properties:bars};    
    pageObj.children.push(barsObj); */

    _pageConfig.push(pageObj);
    this.setState({ pageConfig: _pageConfig });

    //console.log("_pageConfig >>>>", this.state.pageConfig);
  }
  populatePageConfig(properties) {
    var _propConfig = [];
    if (properties.length === 0) return _propConfig;

    //console.log("properties >>>", properties);
    properties.forEach((element) => {
      let propObj = element.attributes;
      if (element.children !== undefined && element.children.length > 0) {
        let otherObj = this.populatePropertyObjects(element.children);
        for (let index = 0; index < otherObj.length; index++) {
          const item = otherObj[index];
          propObj[item.name] = item.items;
        }
      }

      _propConfig.push(propObj);
    });

    return _propConfig;
  }

  populatePropertyObjects(children) {
    var _propObj = [];
    children.forEach((element) => {
      let _prop = [];
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
    });

    return _propObj;
  }

  componentDidUpdate(prevProps, prevState) {
    /* console.log(prevProps.openedPageList.length + ' << prevProps >> ' + this.props.openedPageList.length);
    console.log(prevState.pagelist.length, "<< prevState >>", this.state.pagelist.length);
    if(this.state.pagelist.length > 0){
      let openedpageCount = this.state.pagelist.length;
      let _openedpage = this.state.pagelist[openedpageCount-1];
      this.setState({openedPage: _openedpage});
    } */
  }

  handleSelectEditor(_pageid) {
    //console.log("handleSelectEditor >>>>>>>>>>>>>>>>>",_pageid);

    let _openedPages = this.state.pagelist;

    let _selectedPage = _openedPages.filter(function (node, index) {
      if (node.pageid === _pageid) {
        _openedPages.splice(index, 1);
        _openedPages.splice(_openedPages.length, 0, node);
        return node;
      }
      return node.pageid === _pageid;
    });
    this.setState({ selectedPage: _selectedPage });
    //console.log("_openedPages >>>>>>>>>>>>>>>>>", _openedPages);
    this.setState({ pagelist: _openedPages });
  }

  handleCloseEditor(_pageid, _param) {
    let _openedPages = this.state.pagelist;

    let _closedpage = _openedPages.filter(function (node, index) {
      if (node.pageid === _pageid) {
        _openedPages.splice(index, 1);
        return node;
      }
      return node.pageid === _pageid;
    });
    console.log(
      this.state.selectedPage,
      "_closedpage >>>>>>>>>>>>>>>>>",
      _closedpage
    );

    this.setState({ pagelist: _openedPages });
    this.props.onEditorClose(_pageid, _param);
  }

  handleUpdateValue(property, value) {
    //console.log(property, "..... handleUpdateValue >>>> ", value);

    let _openedPages = this.state.pagelist;
    let _selectedPage = _openedPages[_openedPages.length - 1];

    //console.log(property, " <<<< UpdatedValue >>>> ", _selectedPage[property]);
    this.setState({ selectedPage: _selectedPage });

    //console.log("onUpdatePage #########", _selectedPage);
    this.props.onUpdatePage(_selectedPage);
  }

  render() {
    const showpage = this.props.show;
    if (!showpage) {
      return null;
    }

    const appConfig = {
      apiURL: this.props.appconfig.apiURL,
      userid: this.props.appconfig.userid,
      sessionid: this.props.appconfig.sessionid,
      projectid: this.props.appconfig.projectid,
    };

    const { pagelist, pageConfig, pageLocale } = this.state;
    const openedpageCount = pagelist.length;
    const openedPage = pagelist[openedpageCount - 1];
    //const selectedPage = this.props.selectedPage;

    console.log(openedPage.pageid, "********", this.props.pageState);

    return (
      <>
        <h1>Tab Section</h1>
        <div
          id="pageeditor"
          style={{
            height: "100%",
            display: "flex",
            padding: "4px 8px 0px",
            flexGrow: 1,
            marginLeft: 50,
          }}
        >
          <SettingWindow
            data={openedPage}
            config={pageConfig}
            pagelocale={filterLocale_byPageType(openedPage, pageLocale)}
            onUpdateValue={this.handleUpdateValue}
          />
          {pagelist.map((page, index) => (
            <LayoutWindow
              key={page.pageid}
              count={index}
              data={page}
              appconfig={appConfig}
              onWindowSelect={this.handleSelectEditor}
              onWindowClose={this.handleCloseEditor}
            />
          ))}
        </div>
      </>
    );
  }
}

function filterLocale_byPageType(openedpage, pagelocale) {
  let pageproperties = pagelocale.filter(function (page) {
    return page["viewType"] === openedpage["viewType"];
  });
  if (pageproperties.length > 0) {
    //console.log(openedpage['viewType'], "....Page-Locale >>>", pageproperties[0]);
    return pageproperties[0]["properties"];
  }

  return null;
}

function LayoutWindow(props) {
  const appConfig = props.appconfig;
  const index = props.count;
  const pageData = props.data;
  const layoutWidth = pageData.frame.width;
  const layoutHeight = pageData.frame.height;
  const bgColor = getColorValue(pageData.backgroundColor);

  const headerheight = 40;
  const rulersize = 16;

  const gridRows = Math.ceil(layoutHeight / 10);
  const gridColumns = Math.ceil(layoutWidth / 10);
  let gridRC = [];
  for (let i = 0; i < gridRows; i++) {
    let _gridCol = [];
    for (let j = 0; j < gridColumns; j++) {
      _gridCol.push(j);
    }
    gridRC.push(_gridCol);
  }

  const useStyles = makeStyles((theme) => ({
    root: {
      position: "absolute",
      top: `calc(${20 * (index + 1)}px)`,
      left: `calc(${20 * index + 320}px)`,
    },
    layoutbox: {
      width: `calc(${layoutWidth + rulersize}px)`,
      height: `calc(${layoutHeight + rulersize + headerheight + 2}px)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      backgroundColor: theme.palette.common.black, //'rgba(189, 189, 189, 0)',
      borderStyle: "solid",
      borderColor: theme.palette.common.black,
      borderWidth: "12px 4px", //'12px 6px 12px 18px',
      borderRadius: 8, //16,
    },
    header: {
      display: "flex",
      width: "100%",
      height: headerheight,
      lineHeight: headerheight,
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.palette.common.black,
      color: theme.palette.getContrastText("#000"),
      //border: '1px solid',
      //borderColor : theme.palette.common.black,
      //borderBottom : 0,
    },
    headerclose: {
      color: theme.palette.background.paper,
    },
    heading: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: theme.typography.pxToRem(14),
      fontWeight: theme.typography.fontWeightRegular,
      paddingRight: theme.spacing(6),
      //paddingTop: theme.spacing(2.5),
    },
    topruler: {
      width: layoutWidth,
      height: rulersize,
      marginLeft: rulersize,
      borderTop: 0,
      backgroundColor: theme.palette.common.black,
      backgroundImage: `url(${toprulerImage})`,
      backgroundRepeat: "repeat-x",
      //backgroundPosition: 'center',
    },
    leftruler: {
      width: rulersize,
      height: "100%",
      backgroundColor: theme.palette.common.black,
      backgroundImage: `url(${leftrulerImage})`,
      backgroundRepeat: "repeat-y",
    },
    layouteditor: {
      display: "flex",
    },
    pagelayout: {
      width: layoutWidth,
      height: layoutHeight,
      backgroundColor: bgColor,
      borderRadius: 0,
      border: "1px solid",
      borderColor: theme.palette.common.black,
    },
    gridcanvas: {
      position: "absolute",
      top: `calc(${headerheight + rulersize}px)`,
      left: rulersize,
      width: layoutWidth,
      height: layoutHeight,
      //backgroundColor: 'rgba(219,119,19,0.19)'
      borderCollapse: "collapse",
      borderSpacing: 0,
    },
    gridcell: {
      padding: 0,
      border: "1px solid red",
    },
    footer: {
      width: "100%",
      height: 12,
      lineHeight: "12px",
      backgroundColor: theme.palette.common.black,
      border: "1px solid",
      borderColor: theme.palette.common.black,
      borderTop: 0,
      display: "none",
    },
  }));

  const classes = useStyles();

  function handlePageClose() {
    setAction("pagesave");
    let alertmsg = "Do you want to save this page ?";
    setAlertTitle("");
    setAlertMessage(alertmsg);
    //setOpenAlert(true);
    setAlertMessage(alertmsg);
    setOpenConfirm(true);

    //props.onWindowClose(pageData.pageid);
  }

  function handlePageClick() {
    props.onWindowSelect(pageData.pageid);
  }

  const [action, setAction] = React.useState("");
  const [openAlert, setOpenAlert] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");
  const [openConfirm, setOpenConfirm] = React.useState(false);

  function alertCloseHandler() {
    setOpenAlert(false);
  }
  function alertOKHandler() {
    setOpenAlert(false);
  }

  function confirmCloseHandler() {
    if (action === "pagesave") {
      props.onWindowClose(pageData.pageid, "nosave");
    }
    setOpenConfirm(false);
    setAction("");
  }
  function confirmOKHandler() {
    if (action === "pagesave") {
      props.onWindowClose(pageData.pageid, "save");
    }
    setOpenConfirm(false);
    setAction("");
  }

  return (
    <div id="layoutwindow" className="">
      <Box component={DragComponent} className={classes.layoutbox}>
        <div id="header" className={classes.header} onClick={handlePageClick}>
          <IconButton className={classes.headerclose} onClick={handlePageClose}>
            <CloseIcon />
          </IconButton>
          <Typography className={classes.heading}>{pageData.Title}</Typography>
        </div>
        <span className={classes.topruler}></span>
        <div id="layouteditor" className={classes.layouteditor}>
          <span className={classes.leftruler}></span>
          <Paper className={classes.pagelayout}>
            <table id="list" className={classes.gridcanvas}>
              <tbody>
                {gridRC.map((item, index) => (
                  <tr key={index}>
                    {item.map((item1, index1) => (
                      <td key={index1} className={classes.gridcell}></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <PageLayoutEditor
              show={true}
              data={pageData}
              appconfig={appConfig}
            />
          </Paper>
        </div>
        <span className={classes.footer}></span>
      </Box>
      {openAlert === true && (
        <AlertWindow
          open={true}
          title={alertTitle}
          message={alertMessage}
          ok="OK"
          okclick={alertOKHandler}
          cancel=""
          cancelclick={alertCloseHandler}
        />
      )}
      {openConfirm === true && (
        <AlertWindow
          open={true}
          title={alertTitle}
          message={alertMessage}
          ok="Yes"
          okclick={confirmOKHandler}
          cancel="No"
          cancelclick={confirmCloseHandler}
        />
      )}
    </div>
  );
}

function SettingWindow(props) {
  const pageData = props.data;
  const config = props.config;
  const pageLocale = props.pagelocale;
  console.log(
    pageData["viewType"],
    " SettingWindow >>>> ",
    props.data,
    pageLocale
  );

  const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
    },
    pagepallete: {
      position: "absolute",
      top: 5,
      right: 10,
      width: 360,
      height: `calc(100vh - 106px)`,
      //maxHeight:800,
      display: "flex",
      flexDirection: "column",
      border: "2px solid rgba(189, 189, 189, 1)",
      borderRadius: 8,
      backgroundColor: theme.palette.grey[100],
    },
    header: {
      display: "flex",
      height: 32,
      backgroundColor: "rgba(189, 189, 189, 1)",
      textAlign: "left",
    },
    heading: {
      width: "100%",
      height: "100%",
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
      paddingTop: theme.spacing(0),
      paddingLeft: theme.spacing(2),
      display: "flex",
      alignItems: "center",
      borderRight: "1px solid",
      borderRightColor: theme.palette.grey[500],
    },
    headericon: {
      padding: theme.spacing(0, 0.5),
    },
    popover: {
      height: "100%",
      marginLeft: theme.spacing(0),
    },
    popaper: {
      //height: 600,
      padding: theme.spacing(0.5),
      backgroundColor: theme.palette.grey[300],
    },

    appbar: {
      position: "absolute",
      bottom: 1,
      height: 48,
      zIndex: 0,
    },
    tab: {
      textTransform: "none",
      minWidth: 44,
      width: 120,
      backgroundColor: theme.palette.grey[400],
      fontWeight: theme.typography.fontWeightMedium,
      fontSize: theme.typography.pxToRem(15),
    },
    paper: {
      height: "100%", //680,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      backgroundColor: "rgba(244,244,244,0)",
    },
    badge: {
      display: "flex",
      justifyContent: "space-between",
      position: "inherit",
    },
    enableuititle: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightBold,
    },
    fab: {
      maxHeight: 32,
      maxWidth: 36,
      margin: theme.spacing(0, 0.25),
      backgroundColor: theme.palette.grey[300],
    },
  }));

  const classes = useStyles();

  function getSettingWindowTitle(pageType, pagelocale) {
    let pageTitle;
    if (pagelocale.length > 0) {
      pageTitle = pagelocale[0]["setting"];
      return pageTitle;
    }

    return pageType + "Setting";
  }

  //const [anchorEl, setAnchorEl] = React.useState(null);
  //const viewopen = Boolean(anchorEl);

  const [value, setTabValue] = React.useState(0);
  function handleTabChange(event, newValue) {
    setTabValue(newValue);
  }

  const [expanded, setExpanded] = React.useState("uipanel0");
  const handleExpansion = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  function handlePropertyUpdate(property, value) {
    props.onUpdateValue(property, value);
  }

  function handleEnableUIs(event) {
    console.log("handleEnableUIs >>> ", event);
  }

  return (
    <div>
      {/* <Box id="pagepallete" component={DragComponent} */}
      <Box id="pagepallete" className={classes.pagepallete}>
        <div className={classes.header}>
          <strong className={classes.heading}>
            {getSettingWindowTitle(pageData.viewType, pageLocale)}
          </strong>
        </div>
        <div className={classes.root}>
          <AppBar position="static" color="default" className={classes.appbar}>
            <Tabs
              value={value}
              onChange={handleTabChange}
              indicatorColor="primary"
            >
              <Tab wrapped label="Properties" className={classes.tab} />
              <Tab wrapped label="Enabled UIs" className={classes.tab} />
              <Tab wrapped label="Document" className={classes.tab} />
            </Tabs>
          </AppBar>
          {value === 0 && (
            <TabContainer>
              <Paper id="pageproperties" className={classes.paper}>
                <PagePropertyEditor
                  show={true}
                  page={pageData}
                  viewType={pageData.viewType}
                  config={config}
                  locale={pageLocale}
                  onPropertyEdit={handlePropertyUpdate}
                />
              </Paper>
            </TabContainer>
          )}
          {value === 1 && (
            <TabContainer style={{ height: `calc(100% - 90px)` }}>
              <Paper id="pageuis" className={classes.paper}>
                {uiData(pageData).map((item, index) => (
                  <ExpansionPanel
                    key={"uipanel" + index}
                    expanded={expanded === "uipanel" + index}
                    onChange={handleExpansion("uipanel" + index)}
                  >
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panela-content"
                      id="panela-header"
                    >
                      <StyledBadge
                        color="primary"
                        invisible={false}
                        badgeContent={item.data.length}
                        className={classes.badge}
                      >
                        <Typography className={classes.enableuititle}>
                          {item.title}
                        </Typography>
                      </StyledBadge>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      {item.data.map((uis, _index) => (
                        <div
                          key={_index}
                          className="horizontal-align"
                          style={{ maxHeight: 32 }}
                        >
                          <CheckBoxForm
                            value={uis.enabled}
                            label={uis.name + " (" + uis.type + ")"}
                            onValueChange={handleEnableUIs}
                          />
                          <Typography variant="body2" gutterBottom>
                            {uis.name + " (" + uis.type + ")"}
                          </Typography>
                        </div>
                      ))}
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                ))}
              </Paper>
            </TabContainer>
          )}
          {value === 2 && (
            <TabContainer>
              <Paper
                id="pagedocs"
                className={classes.paper}
                style={{ display: "inherit" }}
              >
                <table className="tg">
                  <thead>
                    <tr>
                      <th width="120px">Key</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.Document.map((docs, index) => (
                      <tr key={index}>
                        <td> {docs.key} </td>
                        <td> {docs.value} </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Paper>
            </TabContainer>
          )}
        </div>
      </Box>
    </div>
  );
}

function TabContainer(props) {
  /* return (
    <Typography component="div" style={{ padding: 4, width: '100%', height: 700, backgroundColor: 'rgba(244, 244, 244, 1)'}}>
      {props.children}
    </Typography>
  ); */
  return (
    <Typography
      component="div"
      style={{
        width: "100%",
        position: "absolute",
        top: 36,
        bottom: 56,
        backgroundColor: "rgba(244, 244, 244, 1)",
      }}
    >
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

function DragComponent(props) {
  return (
    <Draggable bounds="body" handle="strong">
      <Paper {...props} />
    </Draggable>
  );
}

const ExpansionPanel = withStyles({
  root: {
    width: "100%",
    border: "1px solid",
    marginBottom: 4,
    boxShadow: "none",
    /* '&:not(:last-child)': {
      borderBottom: 0,
    }, */
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      height: "100%",
      margin: 0,
      marginBottom: 4,
    },
  },
  expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles((theme) => ({
  root: {
    height: 32,
    minHeight: 32,
    padding: "0 4px",
    borderBottom: "1px solid",
    backgroundColor: theme.palette.grey[300],
    "&$expanded": {
      minHeight: 32,
    },
  },
  content: {
    alignItems: "center",
    marginLeft: 24,
    "&$expanded": {
      margin: "4px 0px 4px 24px",
    },
  },
  expandIcon: {
    position: "absolute",
    left: 2,
    padding: 1,
    color: "inherit",
  },
  expanded: {},
}))(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles((theme) => ({
  root: {
    //display: 'inline-grid',
    //height: 580,
    padding: theme.spacing(1),
    flexDirection: "column",
    overflow: "hidden auto",
    backgroundColor: theme.palette.common.white,
  },
}))(MuiExpansionPanelDetails);

const StyledBadge = withStyles((theme) => ({
  badge: {
    top: "50%",
    height: 24,
    minWidth: 24,
    borderRadius: 12,
    right: 16,
  },
}))(Badge);

function uiData(_pagedata) {
  let _UIs = [];

  let _uiChilds = [];
  let pageChildren = [];
  if (_pagedata.viewType === "BaseView") {
    pageChildren = _pagedata.Children;
  } else if (_pagedata.viewType === "ScrollView") {
    pageChildren = _pagedata.Children[0].Children;
  }
  pageChildren.forEach((child) => {
    let pageuiObj = child.uiParts[0];
    let _pageuiType = pageuiObj.viewType;
    if (pageuiObj.viewType === "Button") {
      _pageuiType = pageuiObj.buttonType + _pageuiType;
    }
    let pageUIs = {
      name: pageuiObj.name,
      type: _pageuiType,
      enabled: pageuiObj._enabledOnScreen,
    };
    _uiChilds.push(pageUIs);
  });
  _UIs.push({ title: "Page Container", data: _uiChilds });

  let _ttopChilds = [];
  if (!_pagedata._toolBarTop[0].hidden) {
    _pagedata._toolBarTop[0].Children.forEach((child) => {
      let ttopObj = child.uiParts[0];
      let _ttopuiType = ttopObj.viewType;
      if (ttopObj.viewType === "Button") {
        _ttopuiType = ttopObj.buttonType + _ttopuiType;
      }
      let ttopUIs = {
        name: ttopObj.name,
        type: _ttopuiType,
        enabled: ttopObj._enabledOnScreen,
      };
      _ttopChilds.push(ttopUIs);
    });
  }
  _UIs.push({ title: "Toolbar [Top]", data: _ttopChilds });

  let _tbotChilds = [];
  if (!_pagedata._toolBarBottom[0].hidden) {
    _pagedata._toolBarBottom[0].Children.forEach((child) => {
      let tbotObj = child.uiParts[0];
      let _tbotuiType = tbotObj.viewType;
      if (tbotObj.viewType === "Button") {
        _tbotuiType = tbotObj.buttonType + _tbotuiType;
      }
      let tbotUIs = {
        name: tbotObj.name,
        type: _tbotuiType,
        enabled: tbotObj._enabledOnScreen,
      };
      _tbotChilds.push(tbotUIs);
    });
  }
  _UIs.push({ title: "Toolbar [Bottom]", data: _tbotChilds });

  return _UIs;
}

function getColorValue(colorObj) {
  let _red = Math.ceil(colorObj.red * 255);
  let _green = Math.ceil(colorObj.green * 255);
  let _blue = Math.ceil(colorObj.blue * 255);
  //console.log("color code >>", "rgb(" + _red +','+ _green +','+ _blue + ")");

  return fullColorHex(_red, _green, _blue);
}
function fullColorHex(r, g, b) {
  var red = rgbToHex(r);
  var green = rgbToHex(g);
  var blue = rgbToHex(b);
  return "#" + red + green + blue;
}
var rgbToHex = function (rgb) {
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
};

export default PageEditor;
