import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { AppBar, List, ListItem, ListItemText, ListItemSecondaryAction, Toolbar, Drawer, Divider, IconButton, Fab, Tooltip, Tab, Tabs, Collapse, Grid, GridList, FormControl, NativeSelect, Snackbar } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';
import Checkbox from '@material-ui/core/Checkbox';
import MenuIcon from '@material-ui/icons/ListAlt';
import CloseIcon from '@material-ui/icons/Close';
import SvgIcon from '@material-ui/core/SvgIcon';

import PageEditor from './pageEditor';
import PopupPageList from './popupPageList';
import PageListView from '../helpers/PageListView';
import AlertWindow from '../../components/AlertWindow';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ width: '100%', padding: 8 * 0, position: 'absolute', top:50, bottom:0 }}>
      {props.children}
    </Typography>
  );
}
TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const PaperContainer = withStyles(theme => ({
  root: {
    position: 'relative',
    height: '100%',   
    padding: theme.spacing(0, 0.25),
    textAlign: 'center',
    color: theme.palette.text.default, 
    border: "1px solid rgb(212, 212, 212)",
    backgroundColor: theme.palette.grey[50],
  },
}))(Paper);


class AppEditor extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
        error: null,
        isLoaded: false,

        uilist: [],
        actionlist: [],
        pagelist: [],

        pages: [],
        pageCaches: [],
        pagetree: [],
        selectedPage: {},

        openpage: false,
        openproject: this.props.isProjectDetail,
      };

    /* this.handlePopupClose = this.handlePopupClose.bind(this);
    this.handlePageSelect = this.handlePageSelect.bind(this);
    this.handleOpenPage = this.handleOpenPage.bind(this); */
  }

  componentDidMount() {
    this.fetchUIList();

    //this.fetchActionList();

    this.fetchPageList();
     
    this.fetchPageData();
  }

  componentDidUpdate(prevProps,prevState) {    
    if(prevProps.isProjectDetail !== this.props.isProjectDetail)
    {     
      console.log(".............AppEditor componentDidUpdate ............");
      this.setState({ openproject: this.props.isProjectDetail });
    }   
  }

  fetchUIList(){
    fetch("././config/UIConfig.json")
      .then(res => res.json())
      .then(
        (result) => {          
          let uiParts = result['UIParts'];
          uiParts =  uiParts.filter(function(category) {
            let uiItems = category['items'];
            uiItems =  uiItems.filter(function(item) {
              return item.visible === "true";
            });
            category['items'] = uiItems;
            return category.include === "true";
          });
          this.setState({ uilist : uiParts});         
        },        
        (error) => {
          console.log("UI-list fetching error >>>", error);
          this.setState({
            error
          });
        }
      )
  }

  fetchActionList(){
    fetch("././config/ActionConfig.json")
      .then(res => res.json())
      .then(
        (result) => {          
          let actions = result['Actions'];
          actions =  actions.filter(function(category) {
            return category.include === "true";
          });
          console.log("actions.............", actions);
          this.setState({ actionlist : actions});          
        },        
        (error) => {
          console.log("Action-list fetching error >>>", error);
          this.setState({
            error
          });
        }
      )
  }

  fetchPageList(){
    //this.setState({ pagelist : pagelist});
  }

  fetchPageData(){
    let _fetchUrl = this.props.appconfig.apiURL+"service.json?command=pagelist&userid="+this.props.appconfig.userid+"&sessionid="+this.props.appconfig.sessionid+"&projectid="+this.props.appconfig.projectid;
    fetch(_fetchUrl)
      .then(res => res.json())
      .then(
        (result) => {
          // {
          //   pages: [...],
          //   response: "ACK",
          //   count: 1,
          //   command: "pagelist"
          //   }
          if(result.response === "NACK"){
            var _err = {message: result.error};
            this.setState({
              isLoaded: true,
              error:_err                   
            });
          }
          else{
            let _pages = result.pages;
            //console.log("pages length :--", _pages.length);
            _pages.sort(function(a, b){return a.pageid - b.pageid});

            let _pageCacheList = makePageCacheList(_pages);
            //console.log("_pageCacheList ::--", _pageCacheList);
            
            var arrPageData = [];
            //manipulatePageData(_pages, 0, arrPageData);

            let projectNode = {level:0, title:this.props.data.ProjectName, id:"-1", parent:"App", type:"", children:[]};
            arrPageData.push(projectNode);

            manipulatePageData(_pages, 1, arrPageData); 

            //console.log("arrPageData >>>", arrPageData); 
            var pageHeirarchy = setPageHeirarchy(arrPageData);
            pageHeirarchy =  pageHeirarchy.filter(function(page) {
              return page.parent === "App";
            });
            console.log("pageHeirarchy >>>>>>>>>>>>>>>>>>>>>>>>>>>>>. ", pageHeirarchy);            

            this.setState({
              isLoaded: true,           
              pages: _pages,
              pageCaches: _pageCacheList,
              pagetree: pageHeirarchy
            });
          }
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render() {
    
    const appConfig = {apiURL: this.props.appconfig.apiURL, userid: this.props.appconfig.userid, sessionid: this.props.appconfig.sessionid, projectid: this.props.appconfig.projectid};
    const parameters = {uilist: this.state.uilist, pagedata : this.state.pages, list : this.state.pagetree};    
    
    return (
      <div id="appeditor" style={{padding: '2px 4px', flexGrow: 1}}>
        {!this.state.isLoaded && <div className="backdropStyle">Loading...</div>}
        {this.state.isLoaded && <AppContainer appconfig={appConfig} projectdata={this.props.data} pagedata={parameters} isProjectDrawer={this.state.openproject}/> }
      </div>     
    );
  }
}

const StyledTabs = withStyles({
  root: {
    minHeight : 32,
    borderLeft: '2px solid #3e3e3e',
  },
  indicator: {
    display: 'flex',
    justifyContent: 'center',
    //backgroundColor: 'transparent',
  },
})(props => <Tabs {...props} TabIndicatorProps={{ children: <div /> }} />);

const StyledTab = withStyles(theme => ({
  root: {
    minHeight: 32,
    minWidth: 120,
    maxWidth: 160,
    padding: 6,
    textTransform: 'none',
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.pxToRem(15),
    //borderRight: '2px solid #3e3e3e',  
    '&:hover': {
      opacity: 1,
    },
    '&$selected': {
      color: theme.palette.common.black,
      backgroundColor: theme.palette.grey[400],
      fontWeight: theme.typography.fontWeightBold,
    },
    '&:focus': {
      opacity: 1,
    },    
  },
  selected: {},
}))(props => <div id="header" style={{borderRight: '2px solid #3e3e3e'}}>
                <Tab disableRipple {...props} />
                <IconButton style={{padding:'4px'}}>
                  <CloseIcon />
                </IconButton>
              </div>
);

function AppContainer(props) {
  //console.log("AppContainer ............", props);
  const appConfig = props.appconfig;
  //const parameters = props.pagedata;
  //const [parameters, setPageParameters] = React.useState(props.pagedata);
  const [pagelistHeirarchy, setPageListHeirarchy] = React.useState(props.pagedata.list);
  const parameters = {uilist: props.pagedata.uilist, pagedata : props.pagedata.pagedata, list : pagelistHeirarchy};

  //const drawerWidth = 320;
  const [drawerWidth, setDrawerWidth] = React.useState(320);

  const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
    },
    densemenubar: {
      //height: 40,
      //minHeight: 40,
      paddingLeft: theme.spacing(0.25),
    },
    appBar: {
      height: '100%',
      backgroundColor: theme.palette.grey[400],
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: theme.spacing(0.5),
    },
    hide: {
      display: 'none',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      zIndex: 1199,
      top: 42,
      width: drawerWidth,
      height: `calc(100vh - 45px)`,
      overflow: 'hidden',
      backgroundColor: theme.palette.grey[400],
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: theme.palette.grey[400],
      padding: '0 4px',
      ...theme.mixins.toolbar,
    },
    content: {
      flexGrow: 1,
      padding: '1px 0px',
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: -drawerWidth,
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
    heading: {
      minWidth: 130,
      padding: 6,
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightBold,
      backgroundColor: theme.palette.grey[400],
    },
    toolbox: {
      width: 48,
      position: 'absolute',
      top: 0, bottom: 0, left: 0,
      backgroundColor: theme.palette.grey[400],
    },
    pagetabs: {
      display: 'none',
    },
    griddiv: {
      margin: theme.spacing(0, 0.25),
      borderRight : '0px solid',
      borderRightColor: theme.palette.grey[500],
    },

  }));

  const classes = useStyles();
  const [openList, setOpenList] = React.useState(true);
  const [tabvalue, setTabValue] = React.useState(0);
  const [selectedPage, setSelectedPage] = React.useState('null');
  const [openedPages, setOpenedPage] = React.useState([]);
  const [showPage, setShowPage] = React.useState(false);
  const [pageindex, setPageIndex] = React.useState(0);

  const [openAlert, setOpenAlert] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState('');
  const [alertMessage, setAlertMessage] = React.useState('');

  function handleListOpen() {
    setOpenList(true);
  }

  function handleListClose() {
    setOpenList(false);
  }

  function handleExplorerChange(event, newValue) {
    setTabValue(newValue); 
    
    setDrawerWidth(320); 
    //if(newValue === 1)    setDrawerWidth(240); 
  }

  function handlePageSelect (_selectedpage){
    //console.log("handlePageSelect >>", _selectedpage);
    
    let _pagelist = props.pagedata.pagedata;
    let _page =  _pagelist.filter(function(node) {
      if(node.pageid === _selectedpage.id){
        setOpenedPageList(node);
        return node;
      }
      return node.pageid === _selectedpage.id;
    });
    
    console.log("_page >>", _page);
  }

  function setOpenedPageList(_page) {
    if(!checkPageOpenedAlready(_page.pageid)){
      openedPages.push(_page);
      setOpenedPage(openedPages);
      setSelectedPage(_page);

      let __page = JSON.parse(JSON.stringify(_page));
      let pageObj = {};
      pageObj[_page.pageid] = {'init': [__page], 'undo': [], 'redo': [], 'params':{}};
      
      let pageStates = pageStateData;
      pageStates.push(pageObj);
      setPageStateData(pageStates);
      
    }else{
      setAlertTitle('');
      setAlertMessage("Page '"+_page.Title + "' already opened.");
      setOpenAlert(true);      
    }

    setShowPage(true);
    setPageIndex(openedPages.length-1);
  }

  function checkPageOpenedAlready(_pageid) {
    let _page =  openedPages.filter(function(page) {
      return page.pageid === _pageid;
    });

    if(_page.length > 0){
      return true;
    }
    return false;
  }


  function onClosePageEditor(_pageid, _param) {
    //console.log(_pageid, "onClosePageEditor >>>>>>>>>>>>>>>>>", openedPages.length);
    if(openedPages.length === 0){
      setShowPage(false);      
    }

    if(_param === "save")
    {
      fetchUpdatePage(_pageid);

      /* let _pagelist = props.pagedata.pagedata;
      let _pageforsave =  _pagelist.filter(function(node) {
        if(node.pageid === _pageid){
          return node;
        }
        return node.pageid === _pageid;
      });

      var formData = new FormData();
      formData.append("command", "pageupdate");
      formData.append("userid", appConfig.userid);
      formData.append("sessionid", appConfig.sessionid);
      formData.append("projectid", appConfig.projectid);
      formData.append("pageid", _pageid);
      //formData.append("file", file);

      var pageData = encodeURIComponent(JSON.stringify(_pageforsave));
      let text = new File([pageData], "updatePage.txt", {type: "text/plain"});
      formData.append("file", text);

      var request = new XMLHttpRequest();
      request.onreadystatechange = function() {//Call a function when the state changes.
        if(request.readyState === 4 && request.status === 200) {
          //request.responseText = {"response":"ACK","count":1,"page":{....},"command":"pageupdate"}        
          let result = JSON.parse(request.responseText);
          console.log("<< pageupdate result >> ", result);

          if(result.response === "NACK"){
            var _err = {message: result.error};
            console.log("pageupdate : Error >>", _err);
          }
          else{
            console.log("pageupdate : Success >> ", result.page);
          }
        }
      }
      request.open("POST", appConfig.apiURL+"multipartservice.json");
      request.send(formData); */
    }
    
  }

  function fetchUpdatePage(pageid) {
    let _pagelist = props.pagedata.pagedata;
    let _pageforsave =  _pagelist.filter(function(node) {
      if(node.pageid === pageid){
        return node;
      }
      return node.pageid === pageid;
    });
    //console.log(" _pageforsave >>>>>>>>>>>>>>>>>", _pageforsave);

    var formData = new FormData();
    formData.append("command", "pageupdate");
    formData.append("userid", appConfig.userid);
    formData.append("sessionid", appConfig.sessionid);
    formData.append("projectid", appConfig.projectid);
    formData.append("pageid", pageid);
    //formData.append("file", file);

    var pageData = encodeURIComponent(JSON.stringify(_pageforsave));
    //let text = new Blob([pageData], {type: "text/plain"});
    let text = new File([pageData], "updatePage.txt", {type: "text/plain"});
    formData.append("file", text);

    fetch(appConfig.apiURL+"multipartservice.json", {
      method: 'POST',
      body: formData
    })
    .then((response) => response.json())
    .then((result) => {
      //result = {"response":"ACK","count":1,"page":{....},"command":"pageupdate"} 
      console.log('pageupdate result:', result);
      if(result.response === "NACK"){
        //var _err = {message: result.error};
        //console.log("pageupdate : Error >>", _err);
        setAlertTitle('');
        setAlertMessage(result.error);
        setOpenAlert(true);
      }
      else{
        //console.log("pageupdate : Success >> ", result.page);
        setAlertTitle('');
        setAlertMessage("Page saved successfully.");
        setOpenAlert(true);

        relaodPageList(pageid);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  function relaodPageList(updatepageid) {    
    let _pages = parameters['pagedata'];
    
    var arrPageData = [];
    manipulatePageData(_pages, 0, arrPageData);
    var pageHeirarchy = setPageHeirarchy(arrPageData);
    pageHeirarchy =  pageHeirarchy.filter(function(page) {
      return page.parent === "App";
    });

    //setPageParameters({uilist: parameters.uilist, pagedata : _pages, list : pageHeirarchy});
    setPageListHeirarchy(pageHeirarchy);

    //console.log(pageHeirarchy, "relaodPageList >>>>>>>>>>>>>>>>>", pagelistHeirarchy);
    let pageStatesArr = pageStateData;
    for (let index = 0; index < pageStatesArr.length; index++) {
      const _page = pageStatesArr[index];
      if(_page[updatepageid]){
        pageStatesArr.splice(index, 1);
        break;
      }      
    }
    setPageStateData(pageStatesArr);
  }


  function alertCloseHandler() {
    setOpenAlert(false);
  }
  function alertOKHandler() {
    setOpenAlert(false);
  }

  const handlePageChange = (event, newValue) => {
    setPageIndex(newValue);
  };

  function dropNotAllowed(ev) {    
    ev.dataTransfer.dropEffect='none';
    //ev.stopPropagation(); 
    ev.preventDefault();    
  }

  const [pageStateData , setPageStateData] = React.useState([]);
  function managePageState(updatedPage) {
    let pageStates = pageStateData;
    let pageObj =  pageStates.filter(function(node) {
      if(node[updatedPage.pageid]){
        return true;
      }
      return false;
    });

    let undoArr = pageObj[0][updatedPage.pageid]['undo'];
    let __page = JSON.parse(JSON.stringify(updatedPage));
    if(undoArr.length > 10) {
      undoArr.shift();
    }
    undoArr.push(__page);

    setPageStateData(pageStates);
  }

  function onPageUndoRedo(updatedPage) {
    //console.log(updatedPage.pageid, ".... onPageUndoRedo ....", openedPages);
    let openedPagesArr = openedPages;
    for (let index = 0; index < openedPagesArr.length; index++) {
      const _page = openedPagesArr[index];
      if(_page.pageid === updatedPage.pageid){
        openedPagesArr.splice(index, 1, updatedPage);
        break;
      }      
    }
    setOpenedPage(openedPagesArr);
    setSelectedPage(updatedPage);
  }

  return (
    <div id="appcontainer" >
      <AppBar
        position="relative"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: openList,
        })}
      >
        <Toolbar variant="dense" className={classes.densemenubar}>
          <div className={classes.griddiv} >
            <Fab size="small" edge="start" aria-label="open drawer"
                 className={clsx(classes.menuButton, openList && classes.hide)}
                 onClick={handleListOpen} >
              <MenuIcon />
            </Fab>
          </div>
          {showPage && 
            <div style={{width:'100%'}}>
              <PageMenubar openedPages={openedPages} selectedPage={selectedPage} pageStates={pageStateData}
                           onClickSave={onClosePageEditor} onUndoRedo={onPageUndoRedo}/>
            </div>
          }          
          {showPage &&
            <StyledTabs value={pageindex} onChange={handlePageChange}       
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              className={classes.pagetabs}
            >
              {openedPages.map(page => (
                <StyledTab wrapped key={page.pageid} label={page.Title} />          
              ))}
            </StyledTabs>
          }

        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={openList}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader} style={{height: 48, minHeight: 48}}>
          <IconButton onClick={handleListClose}>
            <CloseIcon/>
          </IconButton>          
          <Tabs id="listTabs"
                variant="fullWidth" scrollButtons="off" indicatorColor="primary"
                value={tabvalue} onChange={handleExplorerChange}>
            <Tab label="Page list" wrapped className={classes.heading}/>
            <Tab label="UI list" wrapped className={classes.heading}/>
          </Tabs>
        </div>       
        <Divider />
        <div id="explorercontainer" style={{height: '100%'}}>            
          {tabvalue === 0 && 
            <TabContainer>
              <PaperContainer elevation={9}>
                <PageExplorer appconfig={appConfig} projectdata={props.projectdata} pagedata={parameters} openedPages={openedPages} onPageSelect={handlePageSelect}/>
              </PaperContainer>
              {openAlert === true && 
                <AlertWindow open={true} 
                           title={alertTitle} message={alertMessage}
                           ok="OK" okclick={alertOKHandler}
                           cancel="" cancelclick={alertCloseHandler}
                />
              }
            </TabContainer>
          }
          {tabvalue === 1 && 
            <TabContainer>
              <PaperContainer elevation={9}>              
                <UIExplorer uilist={parameters.uilist}/>
              </PaperContainer>
            </TabContainer>                
          }
        </div>
      </Drawer> 
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: openList,
        })}
      >
        <PaperContainer elevation={9} style={{marginLeft: drawerWidth, height: `calc(100vh - 96px)`}}>
          <div id="toolbox" className={classes.toolbox}>
            <Paper square elevation={9} style={{height:'100%', backgroundColor:'rgba(0,0,0,0)'}}>
              {showPage && <PageToolbar/>}
            </Paper>
          </div>
          {/* {showPage && 
            <div style={{width:'100%', backgroundColor: 'rgba(184,184,184,1)'}}>
              <PageMenubar/>
            </div>
          } */}
          <PageEditor appconfig={appConfig} onDragOver={dropNotAllowed}
                      show={showPage} style={{marginLeft: drawerWidth+60}}
                      selectedPage={selectedPage} openedPageList={openedPages} pageState={pageStateData}
                      onEditorClose={onClosePageEditor} onUpdatePage={managePageState}/>
        </PaperContainer>
      </main>     
    </div>
  );
}

function PageMenubar(props) {

  const useStyles = makeStyles(theme => ({
                      vdivider: {
                        width: 2,
                        minHeight: 36,
                        margin: theme.spacing(0, 0.5),
                      },
                      avatar: {
                        maxHeight: 32,
                        maxWidth: 32,
                        margin: theme.spacing(0, 0.25),
                        color: theme.palette.common.black,
                        backgroundColor: theme.palette.grey[300],
                      },                     
                      fab: {
                        maxHeight: 32,
                        maxWidth: 36,
                        margin: theme.spacing(0, 0.25),
                        backgroundColor: theme.palette.grey[300],
                      },
                      aspect: {
                        height: 24,
                        objectFit:'scale-down',
                      },
                      formControl: {
                        margin: theme.spacing(0.5),
                        minWidth: 80,
                      },
                      view: {
                        backgroundColor: theme.palette.grey[300],
                      },
                      zoomselect: {
                        minWidth: 128,
                        paddingLeft: 8,
                        backgroundColor: theme.palette.grey[300],
                      },
                      griditem: {
                        display: 'flex',
                      },
                      griddiv: {
                        margin: theme.spacing(0, 0.25),
                        borderRight : '2px solid',
                        borderRightColor: theme.palette.grey[500],                        
                        paddingRight: theme.spacing(1),
                      },
                      popover: {
                        marginLeft: theme.spacing(1),
                      },
                      paper: {
                        padding: theme.spacing(0.5),
                        backgroundColor: theme.palette.grey[300],
                      },
                      menulist: {
                        maxHeight: 32,
                        paddingLeft: 8,
                        paddingRight: 56,
                      },
                      gridgap: {
                        width: 40, 
                        height: 22,
                        backgroundColor: theme.palette.grey[300],
                      }
                    }));
  const classes = useStyles();

  //console.log(props.openedPages.length, "....PageMenubar.....", props.selectedPage)

  ////// Save functionality //////
  
  function handlePageSave() {
    let pageData = props.selectedPage;
    //console.log("....handlePageSave.....", pageData);
    props.onClickSave(pageData.pageid, "save");
  }

  ////// Undo, Redo functionality //////

  //console.log("....PageMenubar selectedPage.....", props.selectedPage);

  function handlePageUndo() {
    let updatedPage = props.selectedPage;    
    const pageStates = props.pageStates;
    let pageObj =  pageStates.filter(function(node) {
      if(node[updatedPage.pageid]){
        return true;
      }
      return false;
    });
    
    let undoArr = pageObj[0][updatedPage.pageid]['undo'];
    let redoArr = pageObj[0][updatedPage.pageid]['redo'];
    if(undoArr.length > 0) {
      let __page = undoArr.pop();
      redoArr.push(__page);
    }else {
      // show alert
      return;
    }

    let undoPageData;
    if(undoArr.length > 0) {
      undoPageData = undoArr[undoArr.length - 1];
    }else {
      undoPageData = pageObj[0][updatedPage.pageid]['init'][0];
    }
    props.onUndoRedo(undoPageData);    
    //console.log(updatedPage.pageid, "....PageMenubar handlePageUndo.....", props.pageStates);
  }

  function handlePageRedo() {
    let updatedPage = props.selectedPage;    
    const pageStates = props.pageStates;
    let pageObj =  pageStates.filter(function(node) {
      if(node[updatedPage.pageid]){
        return true;
      }
      return false;
    });
    
    let redoArr = pageObj[0][updatedPage.pageid]['redo'];
    let undoArr = pageObj[0][updatedPage.pageid]['undo'];
    if(redoArr.length > 0) {
      let __page = redoArr.pop();
      undoArr.push(__page);      
    }else {
      // show alert
      return;
    }

    let undoPageData;
    if(undoArr.length > 0) {
      undoPageData = undoArr[undoArr.length - 1];
    }else {
      undoPageData = pageObj[0][updatedPage.pageid]['init'][0];
    }
    props.onUndoRedo(undoPageData);
    //console.log(undoPageData, "....PageMenubar Redo.....", props.pageStates);
  }


  ////// Zoom functionality //////

  const zoomItem =[50, 75, 100, 150, 200];
  const [zoomvalue, setZoom] = React.useState(100);  

  function handlePageZoomin() {

    let updatedPage = props.selectedPage;    
    const pageStates = props.pageStates;
    let pageObj =  pageStates.filter(function(node) {
      if(node[updatedPage.pageid]){
        return true;
      }
      return false;
    });    
    
    let zoomIndex = zoomItem.indexOf(zoomvalue);
    let zoomVal = zoomItem[zoomIndex+1];
    
    if(zoomVal) {
      setZoom(zoomVal); 

      let pageParams = pageObj[0][updatedPage.pageid]['params'];
      pageParams['zoom'] = zoomVal;
    }
  }

  function handlePageZoomout() {
    let zoomIndex = zoomItem.indexOf(zoomvalue);
    let zoomVal = zoomItem[zoomIndex-1];
    
    if(zoomVal) {
      setZoom(zoomVal);      
    }
  }

  function handlePageZoom(event) {
    let zoomVal = parseInt(event.currentTarget.value);
    let zoomIndex = zoomItem.indexOf(zoomVal);

    setZoom(zoomItem[zoomIndex]);
  }


  ////// View-menu functionality //////

  const [anchorEl, setAnchorEl] = React.useState(null);
  const viewopen = Boolean(anchorEl);

  function handleViewOpen(event) {    
    setAnchorEl(event.currentTarget);
  }

  function handleViewClose() {
    setAnchorEl(null);
  }
  
  const viewItem =['Show All', 'Show Ruler', 'Show Grid', 'Show Guide'];
  const [checked, setChecked] = React.useState([1]);

  const handleToggle = value => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      if(value === "Show All") {
        newChecked.push('Show All', 'Show Ruler', 'Show Grid', 'Show Guide');
      }else {
        newChecked.push(value);
        if(newChecked.indexOf('Show Ruler') > -1 && newChecked.indexOf('Show Grid') > -1 && newChecked.indexOf('Show Guide') > -1){
          newChecked.push('Show All');
        }
      }

    }else {
      if(value === "Show All") {
        newChecked.splice(0);
      }else {
        newChecked.splice(currentIndex, 1);        
        const showallIndex = newChecked.indexOf('Show All');
        if(showallIndex > -1){
          newChecked.splice(showallIndex, 1);
        }
      }           
    }

    //console.log(value, "******** handleToggle ***********", newChecked);
    setChecked(newChecked);
  };

  const [gridgap, setGridGap] = React.useState(10);
  const handleGridGapValue = (event) => {
    setGridGap(event.currentTarget.value);
    
  };


  return (
    <div id="pagemenubar" className="horizontal-align">
      <Grid container spacing={1} direction="row" justify="flex-start" alignItems="center">
        <Grid item xs={12} sm={12} className={classes.griditem}>
          <div className={classes.griddiv} >
            <Tooltip title="Save">        
              <Fab size="small" aria-label="save" className={classes.fab}>              
                <SvgIcon onClick={handlePageSave}>
                  <path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                </SvgIcon>
              </Fab> 
            </Tooltip>
            <Tooltip title="Save as" style={{display:'none'}}>
              <Fab size="small" aria-label="save as" className={classes.fab}>              
                <SvgIcon>
                  <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/><path fill="none" d="M0 0h24v24H0z"/>
                </SvgIcon>
              </Fab>
            </Tooltip>
            <Tooltip title="Undo : only last 10 changes can be undo">
              <Fab size="small" aria-label="undo" className={classes.fab}>              
                <SvgIcon onClick={handlePageUndo}>
                  <path d="M0 0h24v24H0z" fill="none"/><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
                </SvgIcon>
              </Fab>
            </Tooltip>
            <Tooltip title="Redo : only last 10 changes can be redo">
              <Fab size="small" aria-label="redo" className={classes.fab}>              
                <SvgIcon onClick={handlePageRedo}>
                  <path d="M0 0h24v24H0z" fill="none"/><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
                </SvgIcon>
              </Fab>
            </Tooltip>
          </div>          
          <div className={classes.griddiv} >
            <Tooltip title="Zoom In">
              <Fab size="small" aria-label="zoom in" className={classes.fab}>              
                <SvgIcon onClick={handlePageZoomin}>
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
                </SvgIcon>
              </Fab>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <Fab size="small" aria-label="zoom out" className={classes.fab}>              
                <SvgIcon onClick={handlePageZoomout}>
                  <path fill="none" d="M0 0h24v24H0V0z"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/>
                </SvgIcon>
              </Fab>
            </Tooltip>
            <FormControl variant="outlined" className={classes.formControl}>
              <NativeSelect className={classes.zoomselect}
                            value={zoomvalue} onChange={handlePageZoom}
              >
                <option value={50}>Zoom 50%</option>
                <option value={75}>Zoom 75%</option>
                <option value={100}>Zoom 100%</option>
                <option value={150}>Zoom 150%</option>
                <option value={200}>Zoom 200%</option>
              </NativeSelect>
            </FormControl>
          </div>          
          <div className="horizontal-align" style={{width:"inherit", 'marginLeft':2}} >
            <Tooltip title="View Menu">
              <Fab size="small" aria-label="view" className={classes.fab} onClick={handleViewOpen}>              
                <img src="assets/view-off.png" alt="view" className={classes.aspect} style={{height:20}}/>
              </Fab>
            </Tooltip>
            <Popover id="view-popover" className={classes.popover} classes={{paper: classes.paper,}}
                    open={viewopen} anchorEl={anchorEl} onClose={handleViewClose}
                    anchorOrigin={{vertical: 'bottom', horizontal: 'left',}}
                    transformOrigin={{vertical: 'top', horizontal: 'left',}}
            >              
              <List dense disablePadding>
                {viewItem.map((value, index) => {
                  const labelId = `checkbox-list-secondary-label-${index}`;
                  return (
                    <ListItem key={index} className={classes.menulist}>                      
                      <ListItemText id={labelId} primary={value} />
                      <ListItemSecondaryAction>
                        <Checkbox color="default" edge="end"
                                  onChange={handleToggle(value)}
                                  checked={checked.indexOf(value) !== -1}
                                  inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
                <ListItem className={classes.menulist}>
                  <ListItemText primary="Set Grid Gap" />
                  <ListItemSecondaryAction style={{right:2}}>
                    <input id="numinput" className={classes.gridgap} style={{'border': '2px solid #676767', 'padding':0}}
                          type="number" value={gridgap} min="5" max="100" step="5"
                          onChange={handleGridGapValue}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem button className={classes.menulist}>
                  <ListItemText primary="Snap on Grid" />
                </ListItem>
                <ListItem button className={classes.menulist}>
                  <ListItemText primary="Snap on Guide" />
                </ListItem>
              </List>
            </Popover>
            <span className="spacer"></span>
          </div>
          <div style={{paddingLeft:4, display:'none'}} >
            <Tooltip title="Settings Menu">
              <Fab size="small" aria-label="setting" className={classes.fab}>
                <SvgIcon>
                  <path transform="scale(1.2, 1.2)" fill="none" d="M0 0h20v20H0V0z"></path><path transform="scale(1.2, 1.2)" d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"></path>
                </SvgIcon>
              </Fab>
            </Tooltip>
          </div>
        </Grid>
      </Grid>        
      
    </div>
  );
}

function PageToolbar(props) {

  const useStyles = makeStyles(theme => ({
                      avatar: {
                        maxHeight: 32,
                        maxWidth: 32,
                        color: '#000',
                      },                    
                      fab: {
                        maxHeight: 32,
                        maxWidth: 36,
                        margin: theme.spacing(0.25, 0),
                        backgroundColor: theme.palette.grey[300],
                        textTransform: 'none'
                      },
                      hdivider: {
                        height: 2,
                        width: '100%',
                        minWidth: 36,
                        margin: theme.spacing(1, 0),
                        backgroundColor: theme.palette.grey[500],
                      }, 
                      aspect: {
                        height: 24,
                        objectFit:'scale-down',
                      },
                      formControl: {
                        margin: theme.spacing(0.5),
                        minWidth: 80,
                      },
                      button: {
                        backgroundColor: theme.palette.grey[300],
                        width: 40,
                        minWidth:36,
                        height: 36,
                      },

                    }));
  const classes = useStyles();   

  return (
    <div id="pagetoolbar" className="vertical-align" style={{paddingTop:16}}>
      <Tooltip title="Cut">
        <Fab size="small" aria-label="cut" className={classes.fab}>
          <img src="assets/pagetoolbar/cut.png" alt="center align" className={classes.aspect}/>
        </Fab>
      </Tooltip>
      <Tooltip title="Copy">
        <Fab size="small" aria-label="copy" className={classes.fab}> 
          <img src="assets/pagetoolbar/copy.png" alt="center align" className={classes.aspect}/>
        </Fab>
      </Tooltip>
      <Tooltip title="Paste">
        <Fab size="small" aria-label="Paste" className={classes.fab}>
          <img src="assets/pagetoolbar/paste.png" alt="center align" className={classes.aspect}/>
        </Fab>
      </Tooltip>
      <Tooltip title="Send Forward">
        <Fab size="small" aria-label="forward" className={classes.fab}>
          <img src="assets/pagetoolbar/send_forward.png" alt="center align" className={classes.aspect}/>
        </Fab>
      </Tooltip>
      <Tooltip title="Send Front">
        <Fab size="small" aria-label="front" className={classes.fab}>              
          <SvgIcon >
            <path d="M0 0h24v24H0z" fill="none"/><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm2 4v-2H3c0 1.1.89 2 2 2zM3 9h2V7H3v2zm12 12h2v-2h-2v2zm4-18H9c-1.11 0-2 .9-2 2v10c0 1.1.89 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H9V5h10v10zm-8 6h2v-2h-2v2zm-4 0h2v-2H7v2z"/>
          </SvgIcon>
        </Fab>
      </Tooltip>
      <Tooltip title="Send Backward">
        <Fab size="small" aria-label="backward" className={classes.fab}>
          <img src="assets/pagetoolbar/send_backward.png" alt="center align" className={classes.aspect}/>
        </Fab>
      </Tooltip>
      <Tooltip title="Send Back">
        <Fab size="small" aria-label="back" className={classes.fab}>
          <SvgIcon >
            <path d="M0 0h24v24H0z" fill="none"/><path d="M9 7H7v2h2V7zm0 4H7v2h2v-2zm0-8c-1.11 0-2 .9-2 2h2V3zm4 12h-2v2h2v-2zm6-12v2h2c0-1.1-.9-2-2-2zm-6 0h-2v2h2V3zM9 17v-2H7c0 1.1.89 2 2 2zm10-4h2v-2h-2v2zm0-4h2V7h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zM5 7H3v12c0 1.1.89 2 2 2h12v-2H5V7zm10-2h2V3h-2v2zm0 12h2v-2h-2v2z"/>
          </SvgIcon>
        </Fab>
      </Tooltip>
      <div className={classes.hdivider}/>
      <Tooltip title="Left Align">
        <Fab size="small" aria-label="left align" className={classes.fab}>              
          <img src="assets/pagetoolbar/align-left.png" alt="left align" className={classes.aspect}/>
        </Fab>
      </Tooltip>
      <Tooltip title="Center Align">
        <Fab size="small" aria-label="center align" className={classes.fab}>              
          <img src="assets/pagetoolbar/align-center.png" alt="center align" className={classes.aspect}/>
        </Fab>
      </Tooltip>
      <Tooltip title="Right Align">
        <Fab size="small" aria-label="right align" className={classes.fab}>              
          <img src="assets/pagetoolbar/align-right.png" alt="right align" className={classes.aspect}/>
        </Fab>
      </Tooltip>
      <Tooltip title="Equal Horizontal Spacing">
        <Fab size="small" aria-label="equal horizontal spacing" className={classes.fab}>              
          <img src="assets/pagetoolbar/align-horizontal-equal-spacing.png" alt="horizontal align" className={classes.aspect}/>
        </Fab>
      </Tooltip>
      <Tooltip title="Top Align">
        <Fab size="small" aria-label="top align" className={classes.fab}>              
          <img src="assets/pagetoolbar/align-top.png" alt="top align" className={classes.aspect}/>
        </Fab>
      </Tooltip>
      <Tooltip title="Middle Align">
        <Fab size="small" aria-label="middle align" className={classes.fab}>              
          <img src="assets/pagetoolbar/align-middle.png" alt="middle align" className={classes.aspect}/>
        </Fab>
      </Tooltip>
      <Tooltip title="Bottom Align">
        <Fab size="small" aria-label="bottom align" className={classes.fab}>              
          <img src="assets/pagetoolbar/align-bottom.png" alt="bottom align" className={classes.aspect}/>
        </Fab>
      </Tooltip>
      <Tooltip title="Equal Vertical Spacing">
        <Fab size="small" aria-label="equal vertical spacing" className={classes.fab}>              
          <img src="assets/pagetoolbar/align-vertical-equal-spacing.png" alt="vertical align" className={classes.aspect}/>
        </Fab>
      </Tooltip>      
    </div>
  );
}


function PageExplorer(props) {

  const appConfig = props.appconfig;
  //const parameters = {pagedata: props.pagedata.pagedata, list: props.pagedata.list};

  const useStyles = makeStyles(theme => ({
                      pageexplorer: {
                        width: '100%',
                        height: '100%',
                        display: 'inline-block',
                        flexDirection: 'row',
                        flexGrow: 1,
                        backgroundColor: theme.palette.grey[100],
                      },
                      densetoolbar: {
                        height: 40,
                        minHeight: 40,
                      },
                      appBar: {
                        top: 'auto',
                        bottom: 50,
                        backgroundColor: theme.palette.grey[400],
                      },
                      fab: {
                        width: 36, height: 36,
                        margin: 0,
                        color: '#000',
                        backgroundColor: '#ccc',
                      },
                    }));
  const classes = useStyles(); 

  const [pagelistdata, setPagelistData] = React.useState({pagedata: props.pagedata.pagedata, list: props.pagedata.list});
  //console.log("pagelistdata >>>>>>>>>>>>", pagelistdata);

  const [action, setAction] = React.useState('');
  const [openalert, setOpenalert] = React.useState(false);
  const [alertmsg, setAlertMsg] = React.useState('');

  function handlePageSelect (_page){
    //console.log("handlePageSelect >>", _page);
    props.onPageSelect(_page);
  }

  function handleAddPage (){
    alert("Add new page");
    //setAction('add');    
  }

  function handleOpenPage (){
    alert("Open page");
    //setAction('open');
  }

  function handleDeletePage (){
    alert("Delete page");
  }

  function handleManagePagelist (){
    if(props.openedPages.length === 0) {
      setAction('add');
    }else{
      setOpenalert(true);
      setAlertMsg('Please close all opened pages.');
    }    
  }

  function handleClosePageManager(pagelistdata) {
    //console.log("handleClosePageManager >>>-----", pagelistdata);
    setPagelistData(pagelistdata);

    setAction('');
  }

  const handleCloseAlert = () => {
    setOpenalert(false);
    setAlertMsg('');
  };
  

  return (
    <div id="pageexplorer" className={classes.pageexplorer}>
      <div id="pagetree" style={{height: 'calc(100% - 45px)', paddingBottom: 50}}>
        <PageListView listdata={pagelistdata} onNodeSelection={handlePageSelect}/>
      </div>
      <AppBar position="relative" color="default" className={classes.appBar}>
        <Toolbar variant="dense" className={classes.densetoolbar}>
          <Grid container justify="space-around" alignItems="center">
            <Tooltip title="Add New Page" style={{display:'none'}}>
              <Fab edge="start" size="small" aria-label="add" className={classes.fab}>
                <SvgIcon onClick={handleAddPage} >
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/><path d="M0 0h24v24H0z" fill="none"/>
                </SvgIcon>
              </Fab>
            </Tooltip>
            <Tooltip title="Manage Page List">
              <Fab size="small" aria-label="open" className={classes.fab}>              
                <SvgIcon onClick={handleManagePagelist} >
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/><path d="M0 0h24v24H0z" fill="none"/>
                </SvgIcon>
              </Fab> 
            </Tooltip>
            <Tooltip title="Open Selected Page" style={{display:'none'}}>
              <Fab size="small" aria-label="open" className={classes.fab}>              
                <SvgIcon onClick={handleOpenPage} >
                  <path d="M11.5 9C10.12 9 9 10.12 9 11.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5S12.88 9 11.5 9zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-3.21 14.21l-2.91-2.91c-.69.44-1.51.7-2.39.7C9.01 16 7 13.99 7 11.5S9.01 7 11.5 7 16 9.01 16 11.5c0 .88-.26 1.69-.7 2.39l2.91 2.9-1.42 1.42z"/>
                </SvgIcon>
              </Fab> 
            </Tooltip>
            <Tooltip title="Delete Seleted Page" style={{display:'none'}}>
              <Fab edge="end" size="small" aria-label="delete" className={classes.fab}>
                <SvgIcon onClick={handleDeletePage} >
                  <path fill="none" d="M0 0h24v24H0V0z"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zM9 9h6c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1v-8c0-.55.45-1 1-1zm6.5-5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1h-2.5z"/>
                </SvgIcon>
              </Fab>            
            </Tooltip>           
          </Grid>                            
        </Toolbar>
      </AppBar>
      {action === 'add' && 
        <PopupPageList appconfig={appConfig} projectdata={props.projectdata} pagedata={pagelistdata}
                      title="Manage Page List" popupstate="pagelist-new"
                      oncloseWindow={handleClosePageManager}
                      draggable="false"/>
      }
      <Snackbar
          open={openalert} onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom',  horizontal: 'left', }}
          message={<h4>{alertmsg}</h4>}
          action={
          <React.Fragment>
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseAlert}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />

    </div>
  );
}

const UIListHeading = withStyles(theme => ({
  root: {},
  primary: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightBold,
  }, 
}))(ListItemText);
const UIListItem = withStyles(theme => ({
  root: {
      //maxHeight: 56,
      marginBottom: theme.spacing(0.25),
      paddingLeft: theme.spacing(0.5),
      border: '1px solid rgba(192,192,192,1)',
      borderRadius: theme.spacing(1),
      '&:focus': {
          //backgroundColor: "#65bc45",
          '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
              color: theme.palette.common.white,
          },
      },
      '&:hover': {
          backgroundColor: "#65de45",
          '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
            color: theme.palette.common.white,
          },
      },        
  },
  selected: {}
}))(ListItem);

function UIExplorer(props) {

  const useStyles = makeStyles(theme => ({
                      uiexplorer: {
                        width: '100%',
                        height: '100%',
                        display: 'inline-block',
                        flexDirection: 'row',
                        flexGrow: 1,
                        backgroundColor: 'rgba(244, 244, 244, 1)',
                      },
                      uilist:{
                        width:'100%', 
                        padding:0, 
                        marginBottom:2, 
                        overflow:'auto',
                        backgroundColor: theme.palette.common.white,
                      },
                      category: {
                        border: '1px solid', 
                        marginBottom: 4,
                      },
                      header: {
                        maxHeight: 32,
                        borderBottom: '1px solid',
                        backgroundColor: 'rgba(224, 224, 224, 1)',
                      },
                      complist: {
                        width:'100%',
                        height: '100%',
                        minHeight:'32vh',
                        overflow:'hidden auto',
                        //padding: 0,
                      },
                      listitem: {
                        padding: '4px 8px',
                      },                        
                      avatar: {
                        width: 48,
                        height: 48,
                        margin: 8,
                      },
                      inline: {
                        display: 'inline',
                      },
                      listcategory: {
                        maxHeight: 400,              
                        overflow:'hidden auto',
                      },
                      aspect: {
                        height:'100%', 
                        maxWidth: 64,
                        objectFit:'scale-down',
                      },
                      titlebar: {
                        height:18,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                      },
                      titletext: {
                        width:'100%',
                        fontSize: '14px',
                      },
                      uitextbox: {
                        width: '100%', height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        marginLeft: theme.spacing(1),
                        //background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                      },
                      uitext: {
                        width:'100%',
                        fontSize: '1rem',
                        fontWeight: theme.typography.fontWeightMedium,
                        lineHeight: 1,
                      },
                      uidescription: {
                        width:'100%',
                        fontSize: '11px',
                      },
                    }));
  const classes = useStyles(); 

  const [expanded, setExpanded] = React.useState('TextAndImage');
  const handleExpandCollapse = name => event => {
    setExpanded(name);
  }

  const uiparts = props.uilist;
  console.log("uiParts >>", uiparts);

  function handleUItypeDragstart(ev) {
    let uitype = ev.target.dataset['uiname'];

    //console.log(uitype, "...handleUItypeDragstart >>>>>>>..", ev.target.dataset['uitype']);
    if(ev.target.dataset['uitype']){
      uitype = uitype + ev.target.dataset['uitype'];
    }

    ev.dataTransfer.setData("text/plain", uitype);
  }

  return (
    <div id="uiexplorer" className={classes.uiexplorer}>
      <List component="nav" dense={true} 
            className={classes.uilist}    
            aria-labelledby="nested-list-subheader"                
      >
        {uiparts.map((category, index) => (
          <div key={index} className={classes.category}>
            <ListItem button className={classes.header}       
                      onClick={handleExpandCollapse(category.name)}>
              <UIListHeading primary={category.text}></UIListHeading>
            </ListItem>
            <Collapse in={(expanded === category.name)} timeout="auto" unmountOnExit>
              <GridList cellHeight={72} cols={1} className={classes.listcategory} style={{margin: 2}}>
                {category.items.map((item, indexui) => (                  
                  <Tooltip key={indexui} title={item.text}>
                    <UIListItem draggable="false">
                      <img src={item.imagePath} alt={item.name} className={classes.aspect} draggable="true"
                           data-uitype={item.type} data-uiname={item.name} onDragStart={handleUItypeDragstart} />
                      <Box className={classes.uitextbox}>
                        <Typography variant="h6" className={classes.uitext} >{item.text}</Typography>
                        <Typography variant="caption" className={classes.uidescription} >{item.description}</Typography>
                      </Box>                                        
                    </UIListItem>
                  </Tooltip>
                ))}           
                                         
              </GridList> 

            </Collapse>
          </div>
        ))}
      </List>

    </div>
  );
}

function makePageCacheList(pageList){
  let _pageCacheList = [];
  pageList.forEach(pageObj => {
    _pageCacheList[pageObj.pageid] = pageObj;
  });
  return _pageCacheList;
}

function manipulatePageData(pages, level, arrPageData, parentPageids){
  let appendPages = [];
  let pendingNodes = [];
  let nextParentNodePageids = [];
  
  for (let i = 0; i < pages.length; i++) {
    const pageContainerDic = pages[i];
      
    if (!parentPageids && pageContainerDic.parentid === "App") {
      appendPages.push(pageContainerDic);
      nextParentNodePageids.push(pageContainerDic.pageid);
      //lastTabBasedPageid = pageContainerDic.pageid;
    }
    else if (parentPageids && parentPageids.indexOf(pageContainerDic.parentid) >= 0) {
      appendPages.push(pageContainerDic);
      nextParentNodePageids.push(pageContainerDic.pageid);						
    }
    else {
      pendingNodes.push(pageContainerDic);
    }
  }
  
  if (appendPages.length > 0){
    if (appendPages[0].parentid !== "App")
      appendPages.sort(function(a, b){return a.pageid - b.pageid});
    
    for (let j = 0; j < appendPages.length; j++) {
      arrPageData = setPageLevel(appendPages[j], level, arrPageData);
    }      
  }

  level = level+1;
  if (pendingNodes.length > 0 && nextParentNodePageids.length > 0) {
    manipulatePageData(pendingNodes, level, arrPageData, nextParentNodePageids);
    return;
  }
  else if (pendingNodes.length > 0) {
    console.log("zoombie nodes:", pendingNodes.pageid);
    return;				
  }
}
function setPageLevel(_page, _level, arrLevel){
  arrLevel.push({level:_level, id:_page.pageid, title:_page.Title, parent:_page.parentid, type:_page.viewType, children:[], childcount:0, page:_page});
  return arrLevel;
}

function setPageHeirarchy(arrPageLevel){
  let _pageHeirarchy = [];

  var _lastNodelevel = arrPageLevel[arrPageLevel.length -1].level;
  do {      
    _pageHeirarchy = setPageData(arrPageLevel, _lastNodelevel);      
    _lastNodelevel = _lastNodelevel-1;
  }
  while (_lastNodelevel > 0);

  return _pageHeirarchy;
}
function setPageData(_arrpage, _level){  

  let _nodePages =  _arrpage.filter(function(node) {
    return node.level === _level;
  });
  
  let _branchPages = _arrpage.filter(function(branch) {
    return branch.level === (_level-1);
  });
  
  _nodePages.forEach(node => {
    _branchPages.forEach(item => {
      if(node.type === 'SplitView'){
        node.childcount = node.page.pages.length;
      }
      if(item.id === node.parent){
        item.children.push(node);
        item.childcount = item.children.length;
      }
    }); 
  });

  return _arrpage;
}


export default AppEditor;
