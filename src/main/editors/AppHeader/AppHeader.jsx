import React from "react";
import { connect } from "react-redux";
import "./AppHeaderStyle.css";
import ProjectDetails from "../../helpers/ProjectDetails/ProjectDetails";
import { Close, Menu } from "@mui/icons-material";

import { IconButton, Tooltip } from "@mui/material";
import { THEME_TYPE } from "../../../utils/THEME_TYPE";
import LightThemeIcon from "../../../assets/icons/LightThemeIcon";
import DarkThemeIcon from "../../../assets/icons/DarkThemeIcon";
import useToSetTheme from "../../../hooks/useToSetTheme";
import { toggleTheme } from "../../../utils/functions/helper";

function AppHeader(props) {
  const { theme, setTheme } = useToSetTheme();
  const apiParam = {
    apiURL: props.appconfig.apiURL,
    userid: props.appconfig.userid,
    sessionid: props.appconfig.sessionid,
    projectid: props.appconfig.projectid,
  };

  const project = props.data;

  const projectSideBar = (side) => (
    <div role="presentation" className="project-info-sidebar-content">
      <div className="project-detail-header">
        <h4 className="project-detail-title">Project Details</h4>
        <IconButton onClick={() => handleSidebar("close-icon")}>
          <Close />
        </IconButton>
      </div>
      <div id="projectdata">
        <ProjectDetails appconfig={apiParam} data={project} />
      </div>
    </div>
  );

  function handleSidebar(icon) {
    const headerSection = document.getElementById("header-section");
    console.log(headerSection);
    if (icon === "triangle-icon") {
      headerSection.classList.add("active-project-info");
      headerSection.classList.add("overlay-project-info");
    } else {
      headerSection.classList.remove("active-project-info");
      headerSection.classList.remove("overlay-project-info");
    }
  }

  return (
    <section id="header-section">
      <nav className="navigation-bar">
        <div className="horizontal-align">
          <h3 className="icon">MobQuee</h3>
        </div>
        <div className="header-icons">
          {theme === THEME_TYPE.LIGHT_THEME && (
            <Tooltip title={<h6>Toggle dark theme</h6>}>
              <LightThemeIcon
                dispatchToggleTheme={() => toggleTheme(theme, setTheme)}
              />
            </Tooltip>
          )}
          {theme === THEME_TYPE.DARK_THEME && (
            <Tooltip title={<h6>Toggle light theme</h6>}>
              <DarkThemeIcon
                dispatchToggleTheme={() => toggleTheme(theme, setTheme)}
              />
            </Tooltip>
          )}
          <Tooltip title={<h6>Project Details</h6>}>
            <Menu
              className="theme-icon icon"
              onClick={() => handleSidebar("triangle-icon")}
            />
          </Tooltip>
        </div>
      </nav>
      <section id="project-info-sidebar">{projectSideBar("right")}</section>
    </section>
  );
}

function mapStateToProps(state) {
  //console.log("AppEditor mapStateToProps >>>>>", state);
  return {
    apiParam: state.appParam.params,
    appData: state.appData.data,
    currentPage: state.selectedData.pagedata,
    currentUI: state.selectedData.uidata,
  };
}
export default connect(mapStateToProps)(AppHeader);
