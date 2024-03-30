import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function AlertWindow(props) {
  const title = props.title;
  const description = props.message;
  const ok = props.ok;
  const cancel = props.cancel;

  const [open, setOpen] = React.useState(props.open);

  function handleCancel() {
    props.cancelclick();

    handleClose();
  }
  function handleOK() {
    props.okclick();

    handleClose();
  }
  function handleClose() {
    setOpen(false);
  }

  return (
    <div>
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            style={{ whiteSpace: "pre-wrap" }}
          >
            <h4>{description}</h4>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {cancel.length > 0 && (
            <button className="commmon-butn" onClick={handleCancel}>
              {cancel}
            </button>
          )}
          <button className="commmon-butn" onClick={handleOK}>
            {ok}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
