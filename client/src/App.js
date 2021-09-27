import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  Link,
} from "react-router-dom";
import { Button, Box, Menu, MenuItem } from "@mui/material";
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
          <Menu {...bindMenu(popupState)}>
            <MenuItem
              id="flower"
              component={Link}
              to={"/products/flower"}
              onClick={menuClicked}
            >
              Flower
            </MenuItem>
            <MenuItem
              id="oil"
              component={Link}
              to="/products/oil"
              onClick={menuClicked}
            >
              Oil
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
            <div className="product-form-containter">
              <NewProduct
                openForm={openForm}
                setOpenForm={setOpenForm}
                newProduct={state.newProduct}
                handleSubmit={handleSubmit}
                handleChange={(e) =>
                  setState({
                    ...state,
                    newProduct: {
                      ...state.newProduct,
                      [e.target.name]: e.target.value,
                    },
                  })
                }
              />
            </div>
            <ProductList
              {...defaultProps}
              format={state.format}
              title="Browse"
            />
          </Route>
          <Route path="/products/flower">
            <ProductList {...defaultProps} format="flower" title="Flower" />
          </Route>
          <Route path="/products/oil">
            <ProductList {...defaultProps} format="oil" title="Oil" />
          </Route>
          <Route path="/">
            <h1>Home</h1>
            <img src="/mj.jpg" alt="marijuana leaf" />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
