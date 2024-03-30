import React, { useState } from "react";
import "./LoginWindowStyle.css";
import { Dialog, DialogContent, Paper, TextField } from "@mui/material";

export default function LoginWindow(props) {
  const [open, setOpen] = useState(true);
  const [passwordVal, setPasswordValue] = useState("");

  function handleSetPassword(e) {
    let fields = passwordVal;
    fields = e.target.value;
    setPasswordValue(fields);
  }

  function handleLoginSubmit() {
    if (passwordVal.toString().trim().length > 0) {
      props.onRelogin(passwordVal);
    }

    //setOpen(false);
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
        <Paper id="login-modal">
          <h3 className="login-title">Login</h3>
          <form className="login-frm" noValidate autoComplete="off">
            <TextField
              label="User Name"
              className="user-name"
              variant="outlined"
              defaultValue={props.loginid}
              InputProps={{ readOnly: true }}
            />
            <TextField
              id="pwdtext"
              className="pwd"
              required
              type="password"
              autoFocus
              label="Password"
              variant="outlined"
              value={passwordVal}
              onChange={handleSetPassword}
            />
          </form>
          <div className="login-btn-section">
            <button className="login-btn" onClick={handleLoginSubmit}>
              Submit
            </button>
          </div>
        </Paper>
      </DialogContent>
    </Dialog>
  );
}
