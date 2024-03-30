import React, { useEffect } from "react";
import { getData } from "../utils/helpers";
// import { connect } from "react-redux";
import "./module.css";
// import AppData from "./AppData/AppData";
// import ProjectsList from "./helpers/projectsList";
// import ErrorBoundary from "../components/ErrorBoundary";

const NewAppBuilder = () => {
  function fetchAppConfig() {
    let data = getData("../../public/config/builderdata.json");
    console.log(data);
  }

  useEffect(() => {
    sessionStorage.clear();
    fetchAppConfig();
  }, []);

  return <></>;
};

export default NewAppBuilder;
