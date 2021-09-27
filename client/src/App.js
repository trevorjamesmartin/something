import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  Link,
} from "react-router-dom";
import { Button, Box, Menu, MenuItem, Divider } from "@mui/material";
import YardIcon from "@mui/icons-material/Yard";
import SmokeFreeIcon from "@mui/icons-material/SmokeFree";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from "material-ui-popup-state/hooks";
// local
import { ProductList, NewProduct } from "./components";
import { submitNewProduct } from "./helpers/api";
import "./App.css";

// const = Product;
const productSchema = {
  name: "",
  description: "",
  image_url: "",
  type: "type",
  tags: "",
  format: "format",
};

function App() {
  const history = useHistory();
  const [state, setState] = useState({
    products: [],
    calls: 0, // the number of calls made to the API
    refresh: false, // when true, call the API
    format: "", // product.format
    newProduct: productSchema,
    title: "Welcome",
  });
  const [openForm, setOpenForm] = useState(false);
  const popupState = usePopupState({ variant: "popover", popupId: "Menu" });
  const defaultProps = {
    state,
    setState,
    loadingProducts: state.refresh || !state.calls,
  };

  const handleSubmit = async () => {
    if (
      state.newProduct.type === "type" ||
      state.newProduct.format === "format"
    ) {
      return;
    }
    const result = await submitNewProduct(state.newProduct);
    console.log(result);
    setState({ ...state, refresh: true, newProduct: productSchema });
  };

  const newProductProps = {
    openForm,
    setOpenForm,
    newProduct: state.newProduct,
    handleSubmit,
    handleChange: (e) =>
      setState({
        ...state,
        newProduct: { ...state.newProduct, [e.target.name]: e.target.value },
      }),
  };

  const menuClicked = (e) => {
    setState({ ...state, format: e.target.id });
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
            <YardIcon sx={{marginRight: "1rem"}}/>
              Flower
            </MenuItem>
            <MenuItem
              id="oil"
              component={Link}
              to="/products/oil"
              onClick={menuClicked}
            >
            <SmokeFreeIcon sx={{marginRight: "1rem"}}/>
              Oil
            </MenuItem>
            <Divider variant="middle" />
            <MenuItem
              id=""
              component={Link}
              to="/products/admin"
              onClick={menuClicked}
            >
              <AdminPanelSettingsIcon sx={{marginRight: "1rem"}} />
              Admin Panel
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
              <NewProduct {...newProductProps} />
            </div>
            <ProductList
              {...defaultProps}
              format={state.format}
              title="Browse"
            />
          </Route>
          <Route path="/products/flower">
            <Divider variant="fullWidth" />
            <ProductList {...defaultProps} format="flower" title="Flower" />
          </Route>
          <Route path="/products/oil">
            <Divider variant="fullWidth" />
            <ProductList {...defaultProps} format="oil" title="Oil" />
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
