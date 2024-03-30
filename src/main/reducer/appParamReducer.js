import {
  FETCH_APPCONFIG_SUCCESS,
  FETCH_APPCONFIG_FAILURE,
  SET_APPCONFIG,
  SET_APPCREDENTIAL,
  SET_DEFAULTSCREEN,
  SWITCH_PALLETE,
  LOADAPP,
  PAGE_LOCALE,
  PAGE_CONTAINER,
  PAGE_CONFIG,
  UIPART_LOCALE,
  UIPART_LIST,
  UIPART_CONFIG,
  ACTION_LOCALE,
  ACTION_LIST,
  ACTION_CONFIG,
  UIPART_DIC,
  SHRINK_PALLETE,
  SHOW_CONTAINER,
  SET_MODULE_NAME,
  ADDED_ROW_LIST,
  ADDED_COLUMN_LIST,
  RESET_ROW_LIST,
  RESET_COLUMN_LIST,
  SET_STEPPER_VAL,
  SET_ROW,
} from "../ServiceActions";

const initialState = {
  params: {},
  loadapp: false,
  screenId: 0,
  pallete: "editorToSetting",
  showContainer: false,
  moduleName: "",
  addedRowsList: [],
  stepperVal: 100,
  isShrinkable: false,
  pagelocale: [],
  pagecontainer: [],
  uipartdic: [],
  pageconfig: [],
  uilocale: [],
  uilist: [],
  uiconfig: [],
  actionlocale: [],
  actionlist: [],

  actionconfig: [],
  error: null,
};

export default function appParamReducer(state = initialState, action) {
  //console.log(action, ' ....reducer.... ', state);
  switch (action.type) {
    case FETCH_APPCONFIG_SUCCESS:
    case SET_APPCONFIG:
      return {
        ...state,
        params: { ...state.params, ...action.payload.config },
      };
    case FETCH_APPCONFIG_FAILURE:
      return {
        ...state,
        error: action.payload.error,
        loadapp: false,
        params: [],
      };
    case SET_APPCREDENTIAL:
      return {
        ...state,
        params: { ...state.params, ...action.payload.credential },
      };
    case SET_DEFAULTSCREEN:
      return {
        ...state,
        screenId: action.payload.screenId,
      };
    case LOADAPP:
      return {
        ...state,
        loadapp: true,
      };
    case PAGE_LOCALE:
      return {
        ...state,
        pagelocale: action.payload.pagelocale,
      };
    case PAGE_CONTAINER:
      return {
        ...state,
        pagecontainer: action.payload.pagecontainer,
      };
    case PAGE_CONFIG:
      return {
        ...state,
        pageconfig: action.payload.pageconfig,
      };
    case UIPART_LOCALE:
      return {
        ...state,
        uilocale: action.payload.uilocale,
      };
    case ADDED_ROW_LIST:
      // console.log(action.payload);
      return {
        ...state,
        addedRowsList: action.payload,
      };
    case ADDED_COLUMN_LIST:
      return {
        ...state,
        addedColumnsList: [...state.addedColumnsList, action.payload],
      };
    case RESET_ROW_LIST:
      return {
        ...state,
        addedRowsList: action.payload,
      };
    case RESET_COLUMN_LIST:
      return {
        ...state,
        addedColumnsList: state.addedColumnsList.filter(
          (list) => list.id !== action.payload.id
        ),
      };
    case SET_ROW:
      return {
        ...state,
        inputRowVal: action.payload,
      };
    case UIPART_LIST:
      return {
        ...state,
        uilist: action.payload.uilist,
      };
    case UIPART_CONFIG:
      return {
        ...state,
        uiconfig: action.payload.uiconfig,
      };
    case UIPART_DIC:
      return {
        ...state,
        uipartdic: action.payload.uipartdic,
      };
    case ACTION_LOCALE:
      return {
        ...state,
        actionlocale: action.payload.actionlocale,
      };
    case ACTION_LIST:
      return {
        ...state,
        actionlist: action.payload.actionlist,
      };
    case ACTION_CONFIG:
      return {
        ...state,
        actionconfig: action.payload.actionconfig,
      };
    case SWITCH_PALLETE:
      return {
        ...state,
        pallete: action.payload.pallete,
      };
    case SHRINK_PALLETE:
      return {
        ...state,
        isShrinkable: action.payload.bool,
      };
    case SHOW_CONTAINER:
      return {
        ...state,
        showContainer: action.payload.showContainer,
      };

    case SET_MODULE_NAME:
      return {
        ...state,
        moduleName: action.payload.moduleName,
      };

    case SET_STEPPER_VAL:
      return {
        ...state,
        stepperVal: action.payload.stepperVal,
      };
    default:
      return state;
  }
}
