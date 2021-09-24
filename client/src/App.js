import React, { useEffect, useState, useCallback } from "react";
import { CircularProgress, Typography, Button, Box } from "@mui/material";

// local
import Products from "./components/Product.js";
import NewProduct from "./components/Form.js";
import { getProductsInFormat, submitNewProduct } from "./helpers/api";
import "./App.css";

const productSchema = {
  name: "",
  description: "",
  image_url: "",
  type: "type",
  tags: "",
  format: "format",
};

function App() {
  const [state, setState] = useState({
    products: [],
    calls: 0, // the number of calls made to the API
    refresh: false, // when true, call the API
    format: "flower", // product.format
    newProduct: productSchema,
  });
  const [openForm, setOpenForm] = useState(false);
  /**
   * call the API and update our list of products
   */
  const cbGetProducts = useCallback(async () => {
    setState((s) => ({ ...s, products: [] }));
    const { products } = await getProductsInFormat(state.format);
    // if we're developing, simulate traffic
    process.env.NODE_ENV === "development" &&
      (await new Promise((resolve) => setTimeout(resolve, 500))); // sleep for half a second
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
    cbGetProducts(state.format);
  }, [state.calls, cbGetProducts, state.refresh, state.format]);

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

  return (
    <div className="App">
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
            e.target.name === "format"
              ? setState({
                  ...state,
                  format: e.target.value,
                  refresh: true,
                  newProduct: {
                    ...state.newProduct,
                    [e.target.name]: e.target.value,
                  },
                })
              : setState({
                  ...state,
                  newProduct: {
                    ...state.newProduct,
                    [e.target.name]: e.target.value,
                  },
                })
          }
        />
      </div>
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
        />
      ) : (
        <div className="spinner-div">
          <br />
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            fetching {state.format}
          </Typography>
        </div>
      )}
    </div>
  );
}

export default App;
