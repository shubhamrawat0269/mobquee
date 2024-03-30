import React, { useState } from "react";
import "./SaveAppEditorStyle.css";
import { Paper, Dialog, DialogContent } from "@mui/material";

export default function SaveAppEditor(props) {
  const [open, setOpen] = useState(true);
  const [issaveComplete, saveComplete] = useState(false);
  const [message, setMessage] = useState("");

  function handleSaveApp() {
    fetchContributorsData().then((result) => {
      if (result.response !== "ACK") {
        var _err = { message: result.error };
        console.log("project_contributors NotACK >>", _err);
      } else {
        const _contributors = result["Contributors"];
        if (_contributors) {
          /*const _ownerName = projectdata['owner'];
                 let contributorObj =  _contributors.filter(function(node) {
                      if(node.contributorName === _ownerName){
                          return node;
                      }
                      return node.contributorName === _ownerName;
                  });
                  if(contributorObj.length > 0) {
                      const contributorPages = contributorObj[0]['selectTabPages'];
                      if(contributorPages.length === 0){
                          const selectedTabModule = props.selectedData['selectedTabs'];
                          if(selectedTabModule && selectedTabModule.length > 0) {
                              if(selectedTabModule[0] !== 'none') {
                                  //setErrorMessage("Contributor's selected pages already released. Thereafter changes will be discarded during merge.");
                                  //setErrorDisplay(true);
                                  projectdata['Contributors'] = result['Contributors'];
                              }
                          }
                      }else{
                          updateContributorsData(result['Contributors']);
                      }
                  }*/
          updateContributorsData(result["Contributors"]);
          saveAppData();
        }
      }
    });
  }

  function fetchContributorsData() {
    let _fetchContributorsData =
      props.appconfig.apiURL +
      "project_contributors.json?project_id=" +
      props.appconfig.projectid;
    return fetch(_fetchContributorsData)
      .then((res) => res.json())
      .then(
        (result) => {
          return result;
        },
        (error) => {
          return { response: "ERROR", error: error["message"] };
        }
      );
  }
  function updateContributorsData(resultData) {
    const projectdata = props.data;
    let prjContributors = projectdata["Contributors"];
    for (let i = 0; i < prjContributors.length; i++) {
      if (prjContributors[i]["contributorName"] === projectdata["owner"]) {
        continue;
      }
      const resultObj = resultData.find(
        ({ contributorName }) =>
          contributorName === prjContributors[i]["contributorName"]
      );
      if (resultObj) {
        prjContributors[i] = resultObj;
      }
    }
  }

  function saveAppData() {
    const projectdata = props.data;
    projectdata.isPreview = "1";
    projectdata.isPublish = "0";
    projectdata["isFreeze"] = "1";

    var formData = new FormData();
    formData.append("command", "projectupdate");
    formData.append("userid", props.appconfig.userid);
    formData.append("sessionid", props.appconfig.sessionid);
    formData.append("projectid", props.appconfig.projectid);

    var prjctData = encodeURIComponent(JSON.stringify(projectdata));
    let text = new File([prjctData], "updateProject.txt", {
      type: "text/plain",
    });
    formData.append("file", text);

    fetch(props.appconfig.apiURL + "multipartservice.json", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.response === "NACK") {
          const errormsg = result.error;
          if (
            typeof errormsg === "string" &&
            errormsg.indexOf("Invalid sessionid") > -1
          ) {
            saveComplete(true);
            setMessage(
              errormsg +
                "\n\nPlease close this browser tab & re-open it from console again."
            );
          }
        } else {
          saveComplete(true);
          setMessage(
            "Please close this browser tab & re-open it from console again."
          );
        }
      })
      .catch((error) => {
        saveComplete(true);
        setMessage(
          "Something went wrong. Please check Server/Internet connection. \n\nPlease close this browser tab & re-open it from console again."
        );
      });
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      disableBackdropClick
      disableEscapeKeyDown
    >
      <DialogContent>
        {issaveComplete && <h4 className="save-app-editor-msg">{message}</h4>}
        {!issaveComplete && (
          <Paper elevation={3} className="save-app-editor-section">
            <h2 className="save-app-editor-title">
              It is recommended to save the app-data further to avoid any
              un-expected scenarios.
            </h2>
            <div className="notify-btn-section">
              <button className="notify-btn" onClick={handleSaveApp}>
                OK, Do it
              </button>
            </div>
          </Paper>
        )}
      </DialogContent>
    </Dialog>
  );
}
