import React, { useEffect, useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from "@mui/material";

import { chat, socket } from "../../atoms";

const ChatForm = () => {
  const [state, setState] = useRecoilState(chat);
  const websocket = useRecoilValue(socket);
  const openForm = useCallback(() => {
    const name = localStorage.getItem("name") || 'anonymous';
    setState((s) => ({ ...s, name, openForm: true }));
  }, [setState]);

  useEffect(() => {
    openForm();
  }, [openForm]);

  const changeName = (e) => {
    e.preventDefault();
    setState((s) => ({ ...s, name: e.target.value }));
  };

  const formSubmission = async (e) => {
    e.preventDefault();
    let params = new URLSearchParams();
    params.set("foo", "register"); // action
    if (state.opt) {
      params.set("opt", state.opt); // optional
    }
    params.set("name", state.name); // detail
    // questionable content will need to be parsed
    let questionable = `?${params.toString()}`;
    // register our name with server.
    await websocket?.send(questionable);
    // wait for a reply ?
    if (!state.name || state.name === "anonymous") {
      console.log("please choose another name.");
    } else {
      console.log(`welcome to the chat, ${state.name}`);
      setState((s) => ({ ...s, openForm: false }));
    }
  };

  return (
    <Dialog open={state.openForm}>
      <form onSubmit={formSubmission}>
        <DialogContent>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <TextField
              name="name"
              required
              helperText="nickname/alias"
              value={state.name}
              onChange={changeName}
              placeholder="hackerman"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button color="primary" variant="contained" type="submit">
            Chat
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChatForm;
