import React, { useEffect, useState, useCallback } from "react";
import { CircularProgress, Select, MenuItem } from "@mui/material";

// local
import Products from "./components/Product.js";
import { getProductsInFormat } from "./helpers/api";
import useStyles from "./hooks/useStyles";
import "./App.css";

function App() {
  const [state, setState] = useState({
    products: [],
    calls: 0, // the number of calls made to the API
    refresh: false, // when true, call the API
    format: "flower", // product.format
  });
  const title = state.format.slice(0, 1).toUpperCase() + state.format.slice(1);
  const classes = useStyles();
  /**
   * call the API and update our list of products
   */
  const cbGetProducts = useCallback(async () => {
    setState((s) => ({ ...s, products: [] }));
    const { products } = await getProductsInFormat(state.format);
    // if we're developing, simulate traffic
    process.env.NODE_ENV === 'development' &&
            await new Promise((resolve) => setTimeout(resolve, 500)); // sleep for half a second
    setState(({ calls, ...s }) => ({
      ...s,
      calls: calls + 1,
      products,
      refresh: false,
    }));
  }, [state.format]);

  useEffect(() => {
    if (state.calls > 0 && !state.refresh) {
      return;
    }
    // console.log("GET Products");
    cbGetProducts(state.format);
  }, [state.calls, cbGetProducts, state.refresh, state.format]);
  return (
    <div className="App">
      {state?.products?.length > 0 ? (
        <Products
          products={state.products}
          productFormat={state.format}
          selectProduct={(id) => {
            const products = state.products.map((item) =>
              item.id === id
                ? { ...item, selected: true }
                : { ...item, selected: false }
            );
            setState({ ...state, products });
          }}
          unSelectProduct={(id) => {
            const products = state.products.map((item) =>
              item.id === id ? { ...item, selected: false } : item
            );
            setState({ ...state, products });
          }}
          selectFormat={(format) =>
            setState({ ...state, format, refresh: true })
          }
        />
      ) : (
        <div className="spinner-div">
        <Select className={classes.select} value={title} >
          <MenuItem value={title}>
            {title}
          </MenuItem>
        </Select>
        <br />
        <CircularProgress />
        </div>
      )}
    </div>
  );
}

export default App;
