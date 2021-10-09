import React, { useEffect, useState, useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import {
  TextField,
  MenuItem,
  Select,
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import useStyles from "../../hooks/useStyles";

import { appState, productDefault } from "../../atoms";
import { ProductListItem } from "./Product";
import { submitNewProduct, uploadFile } from "../../helpers/api";

const NewProduct = () => {
  const [state, setState] = useRecoilState(appState);
  const [image, setImage] = useState(null);
  const [lastUpload, setLastUpload] = useState(null);
  const defaultProduct = useRecoilValue(productDefault);
  const classes = useStyles();
  const handleChange = (e) =>
    setState({
      ...state,
      newProduct: { ...state.newProduct, [e.target.name]: e.target.value },
    });

  const cbImageUpload = useCallback(
    async function () {
      if (lastUpload?.image === image) return;
      const filedata = await uploadFile(image);
      setLastUpload({ filedata, image });
      setState((s) => ({
        ...s,
        newProduct: { ...s.newProduct, image_url: filedata.url },
      }));
      console.log(filedata?.url);
    },
    [image, setState, lastUpload]
  );

  useEffect(() => {
    if (!image) return;
    cbImageUpload();
  }, [image, cbImageUpload]);

  const formSubmission = async (e) => {
    e.preventDefault();
    console.log("create", state);
    if (
      state.newProduct.type === "type" ||
      state.newProduct.format === "format"
    ) {
      alert("Product type & format required"); // todo
      return;
    }
    const product = { ...state.newProduct };
    const result = await submitNewProduct(product);
    if (result.status === 201) {
      console.log("STATUS ", result.status);
      product["id"] = result?.data?.pop() || 0;
      console.log(product);
      setState({
        ...state,
        openForm: false,
        products: [...state.products, product],
        newProduct: defaultProduct,
      });
    }
  };
  return (
    <Dialog
      open={state.openForm}
      onClose={() => setState({ ...state, openForm: false })}
    >
      <DialogTitle>New Product</DialogTitle>
      <div className="centered-product">
        <ProductListItem
          id={0}
          name={state.newProduct.name}
          description={state.newProduct.description}
          image_url={state.newProduct.image_url || "/mj.jpg"}
          type={state.newProduct.type}
          tags={state.newProduct.tags}
          selected={false}
          selectProduct={() => false}
          unSelectProduct={() => false}
        />
      </div>
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
              helperText="Name"
              value={state.newProduct.name}
              onChange={handleChange}
              placeholder="My Great Product"
            />
            <TextField
              name="description"
              required
              helperText="Description"
              value={state.newProduct.description}
              onChange={handleChange}
              placeholder="The abosoute best..."
              multiline={true}
              minRows={3}
            />
            <Button variant="contained" component="label">
              Upload Picture
              <input
                name="data"
                type="file"
                hidden
                onChange={({ target }) => setImage(() => target.files[0])}
              />
            </Button>
          </div>
          <div
            className="type-tags-format"
            style={{
              display: "flex",
            }}
          >
            <TextField
              required
              helperText='Tags "comma,separated,values"'
              type="string"
              name="tags"
              value={state.newProduct.tags}
              onChange={handleChange}
              placeholder="calm,indica-dominant"
              sx={{ marginTop: "1rem", width: "100vw", maxWidth: 340 }}
            />
            <Select
              className={classes.select}
              required
              name="type"
              value={state.newProduct.type}
              onChange={handleChange}
              sx={{ textAlign: "left", height: 57 }}
            >
              <MenuItem value="type" disabled>
                Type
              </MenuItem>
              <MenuItem value="indica">Indica</MenuItem>
              <MenuItem value="sativa">Sativa</MenuItem>
              <MenuItem value="hybrid">Hybrid</MenuItem>
            </Select>

            <Select
              className={classes.select}
              name="format"
              value={state.newProduct.format}
              onChange={handleChange}
              sx={{ textAlign: "left", height: 57 }}
            >
              <MenuItem value="format" disabled>
                Format
              </MenuItem>
              <MenuItem value="flower">Flower</MenuItem>
              <MenuItem value="oil">Oil</MenuItem>
              <MenuItem value="concentrate" disabled>
                Concentrate
              </MenuItem>
            </Select>
          </div>
          <Divider variant="middle" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState({ ...state, openForm: false })}>
            Cancel
          </Button>
          <Button color="primary" variant="contained" type="submit">
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewProduct;
