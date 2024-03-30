import { combineReducers } from "redux";
import appParam from "./appParamReducer";
//import projectList from "./projectListReducer";
import appData from "./projectDataReducer";
import selectedData from "./selectedDataReducer";

export default combineReducers({
    appParam,
    //projectList,
    appData,
    selectedData
});