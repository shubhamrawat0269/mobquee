import React from "react";
import "./ProgressWindowStyle.css";
import { Dialog, DialogContent,DialogContentText,CircularProgress } from "@mui/material";

export default function ProgressWindow(props) {
  const message = props.message;
  const [open, setOpen] = React.useState(props.open);

  function handleClose() {
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="progress-dialog-title"
      fullWidth={false}
      maxWidth="xs"
    >
      <DialogContent>
        <div id="progress" className="progress-modal">
          <CircularProgress color="primary" />
          <DialogContentText id="alert-dialog-description">
            {message}
          </DialogContentText>
        </div>
      </DialogContent>
    </Dialog>
  );
}
