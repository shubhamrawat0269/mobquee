import React, { useState } from "react";
import { List, ListItem, ListItemText } from "@mui/material";
import PopupPageList from "../../main/editors/PopupPageList/popupPageList";

export default function ListMenu(props) {
  const apiParam = {
    apiURL: props.appconfig.apiURL,
    userid: props.appconfig.userid,
    sessionid: props.appconfig.sessionid,
    projectid: props.appconfig.projectid,
  };
  const title = props.menutitle;
  const options = props.menuoptions;

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState("menu");

  function handleClickListItem(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleMenuItemClick(event, index) {
    setSelectedIndex(index);
    setAnchorEl(null);

    var menuVal = options[index].value;
    if (menuVal === "new") setSelectedItem("pagelist-new");
  }

  function handleWindowState() {
    setSelectedItem("menu");
  }

  return (
    <section id="list-menu-section">
      <List component="nav" aria-label="Device settings">
        <ListItem
          button
          aria-haspopup="true"
          aria-controls="app-menu"
          aria-label="App Menu"
          onClick={handleClickListItem}
        >
          <ListItemText primary={title} />
        </ListItem>
      </List>
      <div
        id="app-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {options.map((option, index) => (
          <div
            key={option.text}
            disabled={index === -1}
            selected={index === -1}
            onClick={(event) => handleMenuItemClick(event, index)}
          >
            <ListItemText primary={option.text} />
          </div>
        ))}
      </div>
      {selectedItem.indexOf("pagelist") > -1 && (
        <PopupPageList
          appconfig={apiParam}
          title={options[selectedIndex].text}
          popupstate={selectedItem}
          oncloseWindow={handleWindowState}
        />
      )}
    </section>
  );
}
