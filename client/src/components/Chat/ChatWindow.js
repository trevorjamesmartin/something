import React, { useCallback, useEffect, useRef } from "react";

import QRCode from "react-qr-code";

import { useRecoilValue, useRecoilState } from "recoil";
import { socket as socketState, chat as chatState } from "../../atoms";
import ws from "../../helpers/ws";

// style
import {
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Button,
  Divider,
} from "@mui/material";

const ChatWindow = () => {
  const inputText = useRef(null);
  const pageBottom = useRef(null);
  const chat = useRecoilValue(chatState);
  const [, setChat] = useRecoilState(chatState);
  const [, setSocket] = useRecoilState(socketState);
  const websocket = useRecoilValue(socketState);

  const cbSetSocket = useCallback(
    function (value) {
      setSocket(value);
    },
    [setSocket]
  );

  function scrollToBottom() {
    pageBottom.current.scrollIntoView({ behavior: "smooth" }); // scroll to bottom
    inputText.current.focus(); // focus text input
  }
  useEffect(() => {
    if (pageBottom.current) {
      // console.log(chat.output)
      scrollToBottom();
    }
    if (!websocket) {
      // connect to websocket
      cbSetSocket(ws);
      console.log("connected to websocket");
    }
  }, [websocket, cbSetSocket, chat.output]);

  function say(e) {
    e.preventDefault();
    setTimeout(() => inputText.current.focus(), 300);

    // prepare data to be sent
    const params = new URLSearchParams();
    params.set("foo", "chat");
    params.set("name", chat.name);
    params.set("data", chat.input);

    // clear input
    setChat((old) => ({ ...old, input: "" }));
    scrollToBottom();
    // send data
    websocket?.send(params);
  }

  function changeNickname() {
    setChat((s) => ({ ...s, openForm: true, opt: "changed-name" }));
  }

  return (
    <>
      <Divider variant="middle" sx={{ margin: "1rem" }} />
      <form onSubmit={say}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            marginLeft: "8vw",
          }}
        >
          <List
            style={{
              display: "flex",
              flexDirection: "row",
              padding: 0,
            }}
          >
            {chat?.users && [
              ...chat?.users?.map((n) => (
                <React.Fragment key={n.id}>
                  {n.name === chat.name ? (
                  <ListItem onClick={changeNickname}>
                    <Button>({chat.name})</Button>
                  </ListItem>
                  ) : (
                  <>
                    <ListItem>
                      <ListItemText>{n.name}</ListItemText>
                    </ListItem>
                  </>
                  )}
                </React.Fragment>
              )),
            ]}
          </List>
        </div>
        <br />
        <Box>
          <List sx={{ width: "80vw", bgcolor: "background.paper" }}>
            {[
              ...chat.output.map((m, i) => (
                <React.Fragment key={i}>
                  <ListItem key={i + 1} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar alt={m?.name || "*"} src="/static/images/avatar/1.jpg" />
                    </ListItemAvatar>
                    <ListItemText
                      // primary=""
                      primary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: "inline" }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {m?.name} {" - "}
                          </Typography>
                          {m?.data}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              )),
            ]}
          </List>
          <Divider variant="middle" sx={{ margin: "1rem" }} />
          <Box
            className="chat-input"
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <TextField
              ref={inputText}
              onFocus={(e) => e.currentTarget.select()}
              value={chat.input}
              style={{ width: "77vw" }}
              placeholder="type something & press enter to send"
              onChange={(e) => {
                e.preventDefault();
                inputText.current.focus();
                setChat((old) => ({ ...old, input: e.target.value }));
              }}
            />
            <Button type="submit">enter</Button>
          </Box>
        </Box>
      </form>
      <br />
      <p ref={pageBottom} style={{ opacity: "0%" }}>
        test
      </p>
      <Box className="qr-code-box" style={{ padding: "1rem" }}>
        {window.location.href.startsWith("https") ? (
          <QRCode value={window.location.href} />
        ) : (
          ""
        )}
      </Box>
    </>
  );
};

export default ChatWindow;
