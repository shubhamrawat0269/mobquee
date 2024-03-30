import React from "react";
import "./DefaultAppBarStyle.css";
import { AppBar, Toolbar } from "@mui/material";
const DefaultAppBar = () => {
  return (
    <div id="defaultAppbar">
      <AppBar position="static" color="default">
        <Toolbar variant="dense">
          <div>
            <img
              className="App-logo"
              src="../../assets/Appexe.png"
              alt="logo"
            ></img>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default DefaultAppBar;
