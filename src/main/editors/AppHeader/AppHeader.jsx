import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import "./AppHeaderStyle.css";
import logo from "../../../assets/logo.png";
import ProjectDetails from "../../helpers/ProjectDetails/ProjectDetails";
import { Close, ChangeHistory } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { THEME_TYPE } from "../../../utils/THEME_TYPE";

function AppHeader(props) {
  // const [theme, setTheme] = useState("light-theme");
  const apiParam = {
    apiURL: props.appconfig.apiURL,
    userid: props.appconfig.userid,
    sessionid: props.appconfig.sessionid,
    projectid: props.appconfig.projectid,
  };
  const project = props.data;

  const [prjdetailsopen, setPrjDetailsOpen] = useState(false);

  // function handleThemeClick(event) {
  //   props.onThemeChange();
  // }

  /*  below fn toggle theme b/w dark and light  */
  // function toggleTheme() {
  //   if (theme === THEME_TYPE.DARK_THEME) setTheme(THEME_TYPE.LIGHT_THEME);
  //   else setTheme(THEME_TYPE.DARK_THEME);
  // }

  // useEffect(() => {
  //   const themeType = JSON.parse(localStorage.getItem("theme"));
  //   if (theme === THEME_TYPE.LIGHT_THEME) setTheme(themeType);
  // }, []);

  // useEffect(() => {
  //   document.body.className = theme;
  //   localStorage.setItem("theme", JSON.stringify(theme));
  // }, [theme]);

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
          <img className="logo-img" src={logo} alt="logo-img" />
        </div>
        <div className="header-icons">
          {/* {theme === THEME_TYPE.LIGHT_THEME && (
            <Tooltip title={<h6>Toggle dark theme</h6>}>
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="theme-icon icon"
                onClick={toggleTheme}
              >
                <path
                  fill="currentColor"
                  d="M12,9c1.65,0,3,1.35,3,3s-1.35,3-3,3s-3-1.35-3-3S10.35,9,12,9 M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5 S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1 s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0 c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95 c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41 L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41 s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06 c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z"
                ></path>
              </svg>
            </Tooltip>
          )} */}
          {/* {theme === THEME_TYPE.DARK_THEME && (
            <Tooltip title={<h6>Toggle light theme</h6>}>
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="theme-icon icon"
                onClick={toggleTheme}
              >
                <path
                  fill="currentColor"
                  d="M9.37,5.51C9.19,6.15,9.1,6.82,9.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C17.45,17.19,14.93,19,12,19 c-3.86,0-7-3.14-7-7C5,9.07,6.81,6.55,9.37,5.51z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z"
                ></path>
              </svg>
            </Tooltip>
          )} */}
          {/* {!prjdetailsopen && (
            <Tooltip title={<h6>Project Details</h6>}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="theme-icon icon"
                onClick={() => handleSidebar("triangle-icon")}
              >
                <path
                  fill="currentColor"
                  d="M3 4l9 16 9-16H3zm3.38 2h11.25L12 16 6.38 6z"
                ></path>
              </svg>
            </Tooltip>
          )} */}
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
