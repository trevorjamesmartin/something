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
  const [preview, setPreview] = useState(null);
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
      // read image
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = function (event) {
        // create image element
        const imgElement = document.createElement("img");
        imgElement.src = event.target.result;
        imgElement.onload = function (e) {
          // create canvas element to resize the image
          const canvas = document.createElement("canvas");
          const max_width = process.env.MAX_IMAGE_WIDTH || 420;
          // keep aspect ration when scaling
          const scaler = max_width / e.target.width;
          canvas.width = max_width;
          canvas.height = e.target.height * scaler;
          // redraw at scale & capture as jpeg
          const ctx = canvas.getContext("2d");
          ctx.drawImage(e.target, 0, 0, canvas.width, canvas.height);
          const srcEncoded = ctx.canvas.toDataURL("image/jpeg");
          // store result in preview space
          setPreview(srcEncoded);
          console.log(srcEncoded);
        };
      };
    },
    [image, lastUpload]
  );

  useEffect(() => {
    if (!image) return;
    cbImageUpload(); // ready image for upload
  }, [image, cbImageUpload]);

  const formSubmission = async (e) => {
    e.preventDefault();
    if (
      state.newProduct.type === "type" ||
      state.newProduct.format === "format"
    ) {
      alert("Product type & format required"); // todo
      return;
    }
    // convert resized image to blob
    const splitDataURI = preview.split(",");
    const byteString =
      splitDataURI[0].indexOf("base64") >= 0
        ? window.atob(splitDataURI[1])
        : decodeURI(splitDataURI[1]);
    // image/jpeg
    const mimeString = splitDataURI[0].split(":")[1].split(";")[0];
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const jpeg = new Blob([ia], { type: mimeString });
    // upload the resized product image
    const filedata = await uploadFile(jpeg);
    console.log(filedata);
    const newProduct = await new Promise((resolve, reject) => {
      let newProduct = { ...state.newProduct, image_url: filedata.url, id: 0 };
      setLastUpload({ filedata, image });
      setState((s) => ({ ...s, newProduct }));
      console.log("product image uploaded to ", newProduct.image_url);
      resolve(newProduct);
    });
    if (!newProduct || newProduct?.error) {
      return "ERROR";
    }
    console.log("NEW ", newProduct);
    const result = await submitNewProduct({ ...newProduct });
    const id = result?.data?.pop() || 0;
    if (result.status === 201) {
      setState({
        ...state,
        openForm: false,
        products: [...state.products, { ...newProduct, id }],
        newProduct: defaultProduct,
      });
      console.log("a new product was submitted");
    } else {
      console.log(result);
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
          preview_image={preview}
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
