import {
  SELECTED_PAGES,
  SELECTED_PAGEDATA,
  SELECTED_UIPARTS,
  SELECTED_UIDATA,
  SELECTED_LAYOUT,
  SELECTED_CONTAINER,
  SET_EDITOR_PARENT,
  SET_EDITOR_STATE,
  CHANGE_SCREENINDEX,
  COPIED_ACTION,
  VALIDATION_ERRORS,
  SELECTED_TAB,
  HANDLE_CELL_ID,
} from "../ServiceActions";

const initialState = {
  pages: [],
  pagedata: {},
  paeChildren: [],
  uiparts: [],
  uidata: {},
  editor: "",
  container: "container1",
  editorParent: {},
  editorState: {},
  screenindex: 0,
  copyaction: {},
  validationErrors: [],
  selectedTab: null,
  cellId: 0,
};

export default function selectedDataReducer(state = initialState, action) {
  switch (action.type) {
    case SELECTED_PAGES:
      return {
        ...state,
        pages: action.payload.pages,
        //pagedata: action.payload.pages[action.payload.pages.length-1]
      };

    case CHANGE_SCREENINDEX:
      return {
        ...state,
        screenindex: parseInt(action.payload.screenid),
        //paeChildren: getAllChildrenOnPage(state.pagedata, action.payload.screenid),
      };

    case SELECTED_PAGEDATA:
      return {
        ...state,
        pagedata: action.payload.page,
        //paeChildren: getAllChildrenOnPage(action.payload.page, state.screenindex),
      };

    case SELECTED_UIPARTS:
      return {
        ...state,
        uiparts: action.payload.uiparts,
        //uidata: action.payload.uiparts[action.payload.uiparts.length-1]
      };

    case SELECTED_UIDATA:
      // console.log(action.payload.ui);
      return {
        ...state,
        uidata: action.payload.ui,
      };

    case SELECTED_LAYOUT:
      // console.log(action.payload.editor);
      return {
        ...state,
        editor: action.payload.editor,
      };

    case SELECTED_CONTAINER:
      return {
        ...state,
        container: action.payload.container,
      };

    case SET_EDITOR_PARENT:
      return {
        ...state,
        editorParent: action.payload.editorParent,
      };

    case SET_EDITOR_STATE:
      return {
        ...state,
        editorState: action.payload.editorState,
      };

    case COPIED_ACTION:
      return {
        ...state,
        copyaction: action.payload["copyaction"],
      };

    case VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: action.payload["validationerrors"],
      };
    case SELECTED_TAB:
      // console.log(action.payload.selectedTab);
      return {
        ...state,
        selectedTab: action.payload.selectedTab,
      };
    case HANDLE_CELL_ID:
      return {
        ...state,
        cellId: action.payload.cellId,
      };

    default:
      return state;
  }
}

/* const SCROLL_VIEW = "ScrollView";
const PAGE_SCROLL_VIEW = "PageScrollView";
//const TABLE_VIEW = "TableView";
//const TABLE_VIEW_LIST = "TableViewList";
//const DB_TABLE_VIEW = "DbTableView";
const DB_TABLE_VIEW_LIST = "DbTableViewList";
//const REMOTE_TABLE_VIEW = "RemoteTableView";
const REMOTE_TABLE_VIEW_LIST = "RemoteTableViewList";
//const SPLIT_VIEW = "SplitView";

function getAllChildrenOnPage(_page, scrIndex)
{
  //console.log(_page, "... getAllChildrenOnPage >>>>", scrIndex);
  let arrChildren = [];
  if(_page.viewType.indexOf("TableView") > -1)
  {
    if(_page.viewType === DB_TABLE_VIEW_LIST || _page.viewType === REMOTE_TABLE_VIEW_LIST) {
      let arrFields0 = _page.Children[0].Group[0].RecordCellDef.Fields;
      for (let i0 = 0; i0 < arrFields0.length; i0++) 
      {
        arrChildren.push(arrFields0[i0]);								
      }
    }
    else {
      let arrGroup = _page.Children[0].Group;
      for (let i = 0; i < arrGroup.length; i++) 
      {
        let arrRow = arrGroup[i].rowarray;
        for (let j = 0; j < arrRow.length; j++) 
        {
          if(arrRow[j])
          {
            let arrFields = arrRow[j].Fields;
            for (let k = 0; k < arrFields.length; k++) 
            {
              arrChildren.push(arrFields[k]);								
            }
          }
        }
      }
    }
  }
  else
  {
    let pageChildren;
    if(_page.viewType === SCROLL_VIEW || _page.viewType === PAGE_SCROLL_VIEW)
      pageChildren = _page.Children[0].Children;
    else
      pageChildren = _page.Children;
    
    pageChildren.forEach(uiContainerDic => {
      arrChildren.push(uiContainerDic);
      if(uiContainerDic['viewType'] === "TileList") {
        let arrTileItems = uiContainerDic['uiParts'][scrIndex].dataarray[0]['Fields'];
        for (let u = 0; u < arrTileItems.length; u++) 
        {
          arrChildren.push(arrTileItems[u]);								
        }
      }
    });
  }
    
  // page-bars children 

  let cntTop = -1;
  if(_page._toolBarTop.length > 0) {		
    _page._toolBarTop.forEach(_topToolbar => {
      cntTop++;
      if(cntTop === 0) {
        for (let t = 0; t < _topToolbar.Children.length; t++) 
        {
          let _topToolbarUIContainerDic = _topToolbar.Children[t];
          let _topToolbarChildPartDic = _topToolbarUIContainerDic['uiParts'][scrIndex];
          if(_topToolbarChildPartDic) {
            if(!_topToolbarChildPartDic['_enabledOnScreen'])
              continue;							
          }
          arrChildren.push(_topToolbar.Children[t]);
          if(_topToolbar.Children[t]['viewType'] === "TileList") {
            let arrtTileItems = _topToolbar.Children[t]['uiParts'][scrIndex].dataarray[0]['Fields'];
            for (let t0 = 0; t0 < arrtTileItems.length; t0++) 
            {
              arrChildren.push(arrtTileItems[t0]);								
            }
          }
        }
      }
    });    
  }

  let cntBottom = -1;
  if(_page._toolBarBottom.length > 0) {				
    _page._toolBarBottom.forEach(_bottomToolbar => {
      cntBottom++;
      if(cntBottom === 0) {
        for (let b = 0; b < _bottomToolbar.Children.length; b++) 
        {
          let _bottomToolbarUIContainerDic = _bottomToolbar.Children[b];
          let _bottomToolbarChildPartDic = _bottomToolbarUIContainerDic['uiParts'][scrIndex];
          if(_bottomToolbarChildPartDic) {
            if(!_bottomToolbarChildPartDic['_enabledOnScreen'])
              continue;							
          }
          arrChildren.push(_bottomToolbar.Children[b]);
          if(_bottomToolbar.Children[b]['viewType'] === "TileList") {
            let arrbTileItems = _bottomToolbar.Children[b]['uiParts'][scrIndex].dataarray[0]['Fields'];
            for (let b0 = 0; b0 < arrbTileItems.length; b0++) 
            {
              arrChildren.push(arrbTileItems[b0]);								
            }
          }
        }
      }
    });
  }

  let cntLeft = -1;
  if(_page._toolBarLeft.length > 0)
  {
    _page._toolBarLeft.forEach(_leftToolbar => {
      cntLeft++;
      if(cntLeft === scrIndex) {
        for (let l = 0; l < _leftToolbar.Children.length; l++) 
        {
          let _leftToolbarUIContainerDic = _leftToolbar.Children[l];
          let _leftToolbarChildPartDic = _leftToolbarUIContainerDic['uiParts'][scrIndex];
          if(_leftToolbarChildPartDic) {
            if(!_leftToolbarChildPartDic['_enabledOnScreen'])
              continue;							
          }
          arrChildren.push(_leftToolbar.Children[l]);
          if(_leftToolbar.Children[l]['viewType'] === "TileList") {
            let arrlTileItems = _leftToolbar.Children[l]['uiParts'][scrIndex].dataarray[0]['Fields'];
            for (let l0 = 0; l0 < arrlTileItems.length; l0++) 
            {
              arrChildren.push(arrlTileItems[l0]);								
            }
          }
        }
      }
    });
  }
  let cntRight = -1;
  if(_page._toolBarRight && _page._toolBarRight.length > 0)
  {				
    _page._toolBarRight.forEach(_rightToolbar => {
      cntRight++;
      if(cntRight === scrIndex) {
        for (let r = 0; r < _rightToolbar.Children.length; r++) 
        {
          arrChildren.push(_rightToolbar.Children[r]);
          if(_rightToolbar.Children[r]['viewType'] === "TileList") {
            let arrrTileItems = _rightToolbar.Children[r]['uiParts'][scrIndex].dataarray[0]['Fields'];
            for (let r0 = 0; r0 < arrrTileItems.length; r0++) 
            {
              arrChildren.push(arrrTileItems[r0]);								
            }
          }
        }
      }
    });
  }
  
  if(_page.hasOwnProperty('pageOverlay')) {
    let _objOverlay = _page.pageOverlay;
    let overlayChildren = _objOverlay.Children;
    if(overlayChildren) {
      for (let o = 0; o < overlayChildren.length; o++) 
      {
        arrChildren.push(overlayChildren[o]);
        if(overlayChildren[o]['viewType'] === "Dialog") {
          let arrDialogItems = overlayChildren[o]['uiParts'][scrIndex].dataarray[0]['Fields'];
          for (let o0 = 0; o0 < arrDialogItems.length; o0++) 
          {
            arrChildren.push(arrDialogItems[o0]);								
          }
        }
      }
    }
  }
    
  return arrChildren;
} */
