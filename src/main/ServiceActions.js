/////////////////////// Project parameters ///////////////////////

export const FETCH_APPCONFIG_SUCCESS = "FETCH_APPCONFIG_SUCCESS";
export const FETCH_APPCONFIG_FAILURE = "FETCH_APPCONFIG_FAILURE";
export const SET_APPCONFIG = "SET_APPCONFIG";
export const SET_APPCREDENTIAL = "SET_APPCREDENTIAL";
export const SET_DEFAULTSCREEN = "SET_DEFAULTSCREEN";
export const LOADAPP = "LOADAPP";
export const SHOW_CONTAINER = "SHOW_CONTAINER";
export const SET_MODULE_NAME = "SET_MODULE_NAME";
export const ADDED_ROW_LIST = "ADDED_ROW_LIST";
export const ADDED_COLUMN_LIST = "ADDED_COLUMN_LIST";
export const RESET_ROW_LIST = "RESET_ROW_LIST";
export const RESET_COLUMN_LIST = "RESET_COLUMN_LIST";
export const SET_ROW_VAL = "SET_ROW_VAL";
export const SET_ROW = "SET_ROW";
export const SET_STEPPER_VAL = "SET_STEPPER_VAL";

export const fetchAppConfigSuccess = (config) => ({
  type: FETCH_APPCONFIG_SUCCESS,
  payload: { config },
});

export const fetchAppConfigFailure = (error) => ({
  type: FETCH_APPCONFIG_FAILURE,
  payload: { error },
});

export function fetchAppConfig() {
  return (dispatch) => {
    return fetch("././config/builder.xml")
      .then((res) => res.text())
      .then(
        (result) => {
          console.log("config >>>", result);

          var parser = new DOMParser();
          var xmlDoc = parser.parseFromString(result, "text/xml");
          const servername =
            xmlDoc.getElementsByTagName("server")[0].childNodes[0].nodeValue;
          const port =
            xmlDoc.getElementsByTagName("port")[0].childNodes[0].nodeValue;
          console.log("servername >>", servername, port);

          let configresult = { hostname: servername, port: port };
          dispatch(fetchAppConfigSuccess(configresult));
          return configresult;
        },
        (error) => {
          console.log("config error >>>", error);
          dispatch(fetchAppConfigFailure(error));
        }
      );
  };
}

export const setAppConfig = (config) => ({
  type: FETCH_APPCONFIG_SUCCESS,
  payload: { config },
});
export const setRowVal = (rowVal) => ({
  type: SET_ROW_VAL,
  payload: { rowVal },
});
export const setRowInputVal = (inputRowVal) => ({
  type: SET_ROW,
  payload: { inputRowVal },
});

export const setAppCredentials = (credential) => ({
  type: SET_APPCREDENTIAL,
  payload: { credential },
});

export const setDefaultScreenIndex = (screenId) => ({
  type: SET_DEFAULTSCREEN,
  payload: { screenId },
});

export const setApploadingStatus = () => ({
  type: LOADAPP,
});

export const setShowContainer = (showContainer) => ({
  type: SHOW_CONTAINER,
  payload: { showContainer },
});

export const setModuleName = (moduleName) => ({
  type: SET_MODULE_NAME,
  payload: { moduleName },
});

export const setRowList = (addedRowsList) => ({
  type: ADDED_ROW_LIST,
  payload: addedRowsList,
});
export const setColList = (addedColumnsList) => ({
  type: ADDED_COLUMN_LIST,
  payload: addedColumnsList,
});
export const resetColList = ({ id }) => ({
  type: RESET_COLUMN_LIST,
  payload: { id },
});
export const resetRowList = (addedRowsList) => ({
  type: RESET_ROW_LIST,
  payload: addedRowsList,
});
export const setStepperValue = (stepperVal) => ({
  type: SET_STEPPER_VAL,
  payload: stepperVal,
});

/////////////////////// Project list ///////////////////////

export const FETCH_PROJECTLIST_BEGIN = "FETCH_PROJECTLIST_BEGIN";
export const FETCH_PROJECTLIST_SUCCESS = "FETCH_PROJECTLIST_SUCCESS";
export const FETCH_PROJECTLIST_FAILURE = "FETCH_PROJECTLIST_FAILURE";

export const fetchProjectListBegin = () => ({
  type: FETCH_PROJECTLIST_BEGIN,
});

export const fetchProjectListSuccess = (projects) => ({
  type: FETCH_PROJECTLIST_SUCCESS,
  payload: { projects },
});

export const fetchProjectListFailure = (error) => ({
  type: FETCH_PROJECTLIST_FAILURE,
  payload: { error },
});

export function fetchProjectList() {
  return (dispatch) => {
    dispatch(fetchProjectListBegin());
    return fetch("/projects")
      .then((res) => res.json())
      .then((json) => {
        dispatch(fetchProjectListSuccess(json.projects));
        return json.projects;
      })
      .catch((error) => dispatch(fetchProjectListFailure(error)));
  };
}

/////////////////////// Project data ///////////////////////

export const FETCH_PROJECTDATA_BEGIN = "FETCH_PROJECTDATA_BEGIN";
export const FETCH_PROJECTDATA_SUCCESS = "FETCH_PROJECTDATA_SUCCESS";
export const FETCH_PROJECTDATA_FAILURE = "FETCH_PROJECTDATA_FAILURE";
export const SET_PROJECTDATA = "SET_PROJECTDATA";
export const SET_PAGELIST = "SET_PAGELIST";
export const UPDATE_SCREENDATA = "UPDATE_SCREENDATA";
export const REMOVE_SCREENDATA = "REMOVE_SCREENDATA";
export const ENABLE_AUTOSAVE = "ENABLE_AUTOSAVE";
export const ALL_PAGEDATA_UPDATE = "ALL_PAGEDATA_UPDATE";
export const CHANGED_PAGES_ID = "CHANGED_PAGES_ID";
export const SET_CONTRIBUTOR_TABS = "SET_CONTRIBUTOR_TABS";

export const fetchProjectDataBegin = () => ({
  type: FETCH_PROJECTDATA_BEGIN,
});

export const fetchProjectDataSuccess = (project) => ({
  type: FETCH_PROJECTDATA_SUCCESS,
  payload: { project },
});

export const fetchProjectDataFailure = (error) => ({
  type: FETCH_PROJECTDATA_FAILURE,
  payload: { error },
});

export function fetchProjectData() {
  return (dispatch) => {
    dispatch(fetchProjectDataBegin());
    return fetch("/projects")
      .then((res) => res.json())
      .then((json) => {
        dispatch(fetchProjectDataSuccess(json.project));
        return json.projects;
      })
      .catch((error) => dispatch(fetchProjectDataFailure(error)));
  };
}

export const setProjectData = (project) => ({
  type: SET_PROJECTDATA,
  payload: { project },
});

export const setPageList = (pages) => ({
  type: SET_PAGELIST,
  payload: { pages },
});

export const updateScreenData = (screens) => ({
  type: UPDATE_SCREENDATA,
  payload: { screens },
});

export const removeScreenData = (screenid) => ({
  type: REMOVE_SCREENDATA,
  payload: { screenid },
});

export const setAutoSaving = (autosave) => ({
  type: ENABLE_AUTOSAVE,
  payload: { autosave },
});

export const setAllPageChanged = (allpageschanged) => ({
  type: ALL_PAGEDATA_UPDATE,
  payload: { allpageschanged },
});

export const setChangedPageIds = (changedpages) => ({
  type: CHANGED_PAGES_ID,
  payload: { changedpages },
});

export const setContributorTabs = (contributorTabs) => ({
  type: SET_CONTRIBUTOR_TABS,
  payload: { contributorTabs },
});

////////////////// Locale & Configurations //////////////////

export const PAGE_LOCALE = "PAGE_LOCALE";
export const PAGE_CONTAINER = "PAGE_CONTAINER";
export const PAGE_CONFIG = "PAGE_CONFIG";
export const UIPART_LOCALE = "UIPART_LOCALE";
export const UIPART_LIST = "UIPART_LIST";
export const UIPART_DIC = "UIPART_DIC";
export const UIPART_CONFIG = "UIPART_CONFIG";
export const ACTION_LOCALE = "ACTION_LOCALE";
export const ACTION_LIST = "ACTION_LIST";
export const ACTION_CONFIG = "ACTION_CONFIG";
export const SWITCH_PALLETE = "SWITCH_PALLETE";
export const SHRINK_PALLETE = "SHRINK_PALLETE";

export const setPageLocale = (pagelocale) => ({
  type: PAGE_LOCALE,
  payload: { pagelocale },
});
export const setPageContainer = (pagecontainer) => ({
  type: PAGE_CONTAINER,
  payload: { pagecontainer },
});

export const setSwitchPallete = (pallete) => ({
  type: SWITCH_PALLETE,
  payload: { pallete },
});

export const setUIPartDic = (uipartdic) => ({
  type: UIPART_DIC,
  payload: { uipartdic },
});

export const setShrinkPallete = (bool) => ({
  type: SHRINK_PALLETE,
  payload: { bool },
});

export const setPageConfig = (pageconfig) => ({
  type: PAGE_CONFIG,
  payload: { pageconfig },
});

export const setUILocale = (uilocale) => ({
  type: UIPART_LOCALE,
  payload: { uilocale },
});
export const setUIList = (uilist) => ({
  type: UIPART_LIST,
  payload: { uilist },
});
export const setUIConfig = (uiconfig) => ({
  type: UIPART_CONFIG,
  payload: { uiconfig },
});

export const setActionLocale = (actionlocale) => ({
  type: ACTION_LOCALE,
  payload: { actionlocale },
});
export const setActionList = (actionlist) => ({
  type: ACTION_LIST,
  payload: { actionlist },
});
export const setActionConfig = (actionconfig) => ({
  type: ACTION_CONFIG,
  payload: { actionconfig },
});

/////////////////////// Selected data ///////////////////////

export const SELECTED_PAGES = "SELECTED_PAGES";
export const SELECTED_PAGEDATA = "SELECTED_PAGEDATA";
export const SELECTED_UIPARTS = "SELECTED_UIPARTS";
export const SELECTED_UIDATA = "SELECTED_UIDATA";
export const SELECTED_LAYOUT = "SELECTED_LAYOUT";
export const SELECTED_CONTAINER = "SELECTED_CONTAINER";
export const SET_EDITOR_PARENT = "SET_EDITOR_PARENT";
export const SET_EDITOR_STATE = "SET_EDITOR_STATE";
export const CHANGE_SCREENINDEX = "CHANGE_SCREENINDEX";
export const COPIED_ACTION = "COPIED_ACTION";
export const VALIDATION_ERRORS = "VALIDATION_ERRORS";
export const SELECTED_TAB = "SELECTED_TAB";
export const HANDLE_CELL_ID = "HANDLE_CELL_ID";

export const setSelectedPages = (pages) => ({
  type: SELECTED_PAGES,
  payload: { pages },
});

export const setSelectedPageData = (page) => ({
  type: SELECTED_PAGEDATA,
  payload: { page },
});

export const setSelectedUIparts = (uiparts) => ({
  type: SELECTED_UIPARTS,
  payload: { uiparts },
});

export const setSelectedUI = (ui) => ({
  type: SELECTED_UIDATA,
  payload: { ui },
});

export const setSelectedLayout = (editor) => ({
  type: SELECTED_LAYOUT,
  payload: { editor },
});

export const setSelectedContainer = (container) => ({
  type: SELECTED_CONTAINER,
  payload: { container },
});

export const setEditorParent = (editorParent) => ({
  type: SET_EDITOR_PARENT,
  payload: { editorParent },
});

export const setEditorState = (editorState) => ({
  type: SET_EDITOR_STATE,
  payload: { editorState },
});

export const changeScreenIndex = (screenid) => ({
  type: CHANGE_SCREENINDEX,
  payload: { screenid },
});

export const setCopiedAction = (copyaction) => ({
  type: COPIED_ACTION,
  payload: { copyaction },
});

export const setValidationErrors = (validationerrors) => ({
  type: VALIDATION_ERRORS,
  payload: { validationerrors },
});

export const setSelectedTab = (selectedTab) => ({
  type: SELECTED_TAB,
  payload: { selectedTab },
});

export const setCellId = (cellId) => ({
  type: HANDLE_CELL_ID,
  payload: { cellId },
});
