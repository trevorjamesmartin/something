// rendering
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useRecoilState, useRecoilValue } from "recoil";
// routing
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  Link,
} from "react-router-dom";
// components
import { Button, Box, Menu, MenuItem, Divider } from "@mui/material";
import YardIcon from "@mui/icons-material/Yard";
import SmokeFreeIcon from "@mui/icons-material/SmokeFree";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ChatBubble from "@mui/icons-material/ChatBubble";
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from "material-ui-popup-state/hooks";
// local components
import { appState, productFormat, openForm, chat } from "./atoms";
import { ProductList, NewProduct, ChatWindow, ChatForm } from "./components";
// local styling
import "./App.css";

/**
 * (catch unbound errors before they break the App)
 * @example
 * import { ErrorBoundary } from "react-error-boundary";
 * ...
 *
 *  return (<ErrorBoundary FallbackComponent={ErrorFallback}>
 *            <MyComponent />
 *          </ErrorBoundary>)
 *
 *
 */
function ErrorFallback({ error }) {
  return (
    <div>
      <div>Oh no, there was an error. Check the console for details.</div>
      <div>
        <pre>{error.message}</pre>
      </div>
    </div>
  );
}

/**
 * Main
 * @returns App
 */
function App() {
  const history = useHistory();
  const state = useRecoilValue(appState);
  const [, setFormat] = useRecoilState(productFormat);
  const [, setOpenForm] = useRecoilState(openForm);
  const [, setChatName] = useRecoilState(chat);
  const popupState = usePopupState({ variant: "popover", popupId: "Menu" });
  const menuClicked = (e) => {
    switch (e.target.id) {
      case "chat":
        setChatName((s) => ({ ...s, openForm: true }));
        break;
    
      default:
        setFormat(e.target.id);
        break;
    }
    popupState.close();
  };

  return (
    <Router history={history}>
      <div className="App">
        <br />
        <Box
          sx={{
            mx: "auto",
            p: 2,
            m: 1,
            borderRadius: 1,
            textAlign: "center",
          }}
        >
          <Button variant="outlined" {...bindTrigger(popupState)}>
            {state.title}
          </Button>
          <Menu
            {...bindMenu(popupState)}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem
              id="flower"
              component={Link}
              to={"/products/flower"}
              onClick={menuClicked}
            >
              <YardIcon sx={{ marginRight: "1rem" }} />
              Flower
            </MenuItem>
            <MenuItem
              id="oil"
              component={Link}
              to="/products/oil"
              onClick={menuClicked}
            >
              <SmokeFreeIcon sx={{ marginRight: "1rem" }} />
              Oil
            </MenuItem>
            <Divider variant="middle" />
            <MenuItem
              id=""
              component={Link}
              to="/products/admin"
              onClick={menuClicked}
            >
              <AdminPanelSettingsIcon sx={{ marginRight: "1rem" }} />
              Admin Panel
            </MenuItem>
            <Divider variant="middle" />
            <MenuItem
              id="chat"
              component={Link}
              to="/chat"
              onClick={menuClicked}
            >
              <ChatBubble sx={{ marginRight: "1rem" }} />
              Chat
            </MenuItem>
          </Menu>
        </Box>
        <Switch>
          <Route path="/products/admin">
            <Box
              sx={{
                mx: "auto",
                p: 2,
                m: 1,
                borderRadius: 1,
                textAlign: "center",
              }}
            >
              <Button variant="outlined" onClick={() => setOpenForm(true)}>
                New Product
              </Button>
            </Box>
            <Divider variant="fullWidth" />
            <div className="product-form-containter">
              <NewProduct />
            </div>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <ProductList format="/" title="Menu" />
            </ErrorBoundary>
          </Route>
          <Route path="/products/flower">
            <Divider variant="fullWidth" />
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <ProductList format="flower" title="Flower" />
            </ErrorBoundary>
          </Route>
          <Route path="/products/oil">
            <Divider variant="fullWidth" />
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <ProductList format="oil" title="Oil" />
            </ErrorBoundary>
          </Route>
          <Route path="/chat">
            <div className="product-form-containter">
              <ChatForm />
            </div>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <ChatWindow />
            </ErrorBoundary>
          </Route>
          <Route path="/">
            <Box
              component="img"
              src="/mj.jpg"
              alt="marijuana leaf"
              sx={{
                borderRadius: 1,
                mx: "auto",
                p: 2,
                m: 1,
                width: "80vw",
                maxWidth: "42rem",
                textAlign: "center",
              }}
            />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
