import React from "react";
import { makeStyles } from "@mui/styles";
import { Button, Paper, Box, Dialog, DialogContent } from "@mui/material";

import AlertWindow from "../../../components/AlertWindow";
const useStyles = makeStyles((theme) => ({
  root: {
    //flexGrow: 1,
  },
  editorheading: {
    backgroundColor: "#b2b2b2",
    fontSize: "1rem",
    fontWeight: "bold",
    // color: theme.palette.common.black,
    padding: "0.75rem",
  },
  editorform: {
    minHeight: 320,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: "0.75rem",
  },
  editorpaper: {
    width: "100%",
    minHeight: 280,
    maxWidth: 600,
    padding: "0.75rem",
    borderRadius: 8,
  },
  editorbtn: {
    textTransform: "none",
    padding: "0.75rem",
    fontSize: "1rem",
  },
  propdiv: {
    display: "flex",
    justifyContent: "space-between",
  },
  proptext: {
    fontWeight: "bold",
  },
  propsubtext: {
    width: 120,
  },
  numinput: {
    width: 50,
  },
  previewdiv: {
    minHeight: 200,
    margin: "8px 0px",
    padding: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  msgbox: {
    height: 88,
    padding: "0px 8px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
  },
  alertbtn: {
    width: 80,
    height: 32,
    margin: "0px 8px",
    textTransform: "none",
    fontSize: "1rem",
  },
}));
export default function AlertStyleEditor(props) {
  const [open, setOpen] = React.useState(true);
  const alertStyleDic = props.appdata["setAlertStyle"]
    ? props.appdata["alertStyleDic"]
    : {
        backgroundColor: "#FFFFFF",
        headerTextColor: "#000000",
        headerFontSize: 16,
        messageTextColor: "#000000",
        messageFontSize: 14,
        okbtnTextColor: "#FFFFFF",
        okbtnBGColor: "#0000FF",
        cancelTextColor: "#000000",
        cancelBGColor: "#DDDDDD",
      };
  const [alertStyle, setAlertStyle] = React.useState(alertStyleDic);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  function handleClose() {
    setOpen(false);
    props.onCloseEditor();
  }
  function handleCancelUpdate() {
    setOpen(false);
    props.onCloseEditor();
  }

  function handlePropValueChange(event, property) {
    const _alertStyle = JSON.parse(JSON.stringify(alertStyle));
    _alertStyle[property] =
      property.indexOf("FontSize") > -1
        ? parseInt(event.currentTarget["value"])
        : event.currentTarget["value"];

    setAlertStyle(_alertStyle);
  }
  function handleOkUpdate() {
    //console.log(props, "*****", alertStyle);
    setOpenConfirm(true);
  }
  function confirmOKHandler() {
    setOpen(false);
    props.onSubmitAlertStyle(alertStyle);
  }
  function confirmCloseHandler() {
    setOpenConfirm(false);
  }
  const classes = useStyles();
  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth="lg"
      disableBackdropClick
      onClose={handleClose}
    >
      <DialogContent style={{ padding: 10 }}>
        <h4>Alert Style Editor</h4>
        <form className={classes.editorform} noValidate autoComplete="off">
          <Paper elevation={3} className={classes.editorpaper}>
            <div className={classes.propdiv}>
              <h4>BackGround Color</h4>
              <input
                type="color"
                value={alertStyle.backgroundColor}
                onChange={(event) =>
                  handlePropValueChange(event, "backgroundColor")
                }
              />
            </div>
            <h4>Header</h4>
            <div className={classes.propdiv}>
              <h6>Font Color</h6>
              <input
                type="color"
                value={alertStyle.headerTextColor}
                onChange={(event) =>
                  handlePropValueChange(event, "headerTextColor")
                }
              />
              <h6>Font Size</h6>
              <input
                type="number"
                className={classes.numinput}
                value={alertStyle.headerFontSize}
                min="10"
                max="20"
                onChange={(event) =>
                  handlePropValueChange(event, "headerFontSize")
                }
              />
            </div>
            <h4>Message</h4>
            <div className={classes.propdiv}>
              <h6>Font Color</h6>
              <input
                type="color"
                value={alertStyle.messageTextColor}
                onChange={(event) =>
                  handlePropValueChange(event, "messageTextColor")
                }
              />
              <h6>Font Size</h6>
              <input
                type="number"
                className={classes.numinput}
                value={alertStyle.messageFontSize}
                min="8"
                max="18"
                onChange={(event) =>
                  handlePropValueChange(event, "messageFontSize")
                }
              />
            </div>
            <h4>OK Button</h4>
            <div className={classes.propdiv}>
              <h6>Font Color</h6>
              <input
                type="color"
                value={alertStyle.okbtnTextColor}
                onChange={(event) =>
                  handlePropValueChange(event, "okbtnTextColor")
                }
              />
              <h6>BackGround Color</h6>
              <input
                type="color"
                value={alertStyle.okbtnBGColor}
                onChange={(event) =>
                  handlePropValueChange(event, "okbtnBGColor")
                }
              />
            </div>
            <h4>Cancel Button</h4>
            <div className={classes.propdiv}>
              <h6>Font Color</h6>
              <input
                type="color"
                value={alertStyle.cancelTextColor}
                onChange={(event) =>
                  handlePropValueChange(event, "cancelTextColor")
                }
              />
              <h6>BackGround Color</h6>
              <input
                type="color"
                value={alertStyle.cancelBGColor}
                onChange={(event) =>
                  handlePropValueChange(event, "cancelBGColor")
                }
              />
            </div>
          </Paper>
          <div className={classes.previewdiv}>
            <Paper
              elevation={3}
              style={{
                height: 160,
                width: 320,
                backgroundColor: alertStyle.backgroundColor,
              }}
            >
              <Box style={{ height: 32, padding: "0px 8px" }}>
                <h4
                  variant="subtitle2"
                  style={{
                    height: 32,
                    color: alertStyle.headerTextColor,
                    fontSize: alertStyle.headerFontSize,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Heading Text
                </h4>
              </Box>
              <Box className={classes.msgbox}>
                <h6
                  style={{
                    height: 40,
                    color: alertStyle.messageTextColor,
                    fontSize: alertStyle.messageFontSize,
                  }}
                >
                  This is sample text for alert message. Supporting multiline.
                </h6>
              </Box>
              <Box style={{ height: 40, padding: "0px 60px" }}>
                <Button
                  variant="contained"
                  className={classes.alertbtn}
                  style={{
                    color: alertStyle.okbtnTextColor,
                    backgroundColor: alertStyle.okbtnBGColor,
                  }}
                >
                  OK
                </Button>
                <Button
                  variant="contained"
                  className={classes.alertbtn}
                  style={{
                    color: alertStyle.cancelTextColor,
                    backgroundColor: alertStyle.cancelBGColor,
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Paper>
          </div>
        </form>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <Button
            variant="contained"
            className={classes.editorbtn}
            onClick={handleCancelUpdate}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            className={classes.editorbtn}
            onClick={handleOkUpdate}
          >
            Submit
          </Button>
        </div>
        {openConfirm === true && (
          <AlertWindow
            open={true}
            title=""
            message="This style will applicable on all Alerts in the app."
            ok="OK"
            okclick={confirmOKHandler}
            cancel="Cancel"
            cancelclick={confirmCloseHandler}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
