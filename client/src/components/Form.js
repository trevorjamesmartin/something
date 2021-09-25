import React from "react";

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
import useStyles from "../hooks/useStyles";

import { ProductListItem } from "./Product";

const NewProduct = ({
  handleChange,
  newProduct: state,
  handleSubmit,
  openForm,
  setOpenForm,
}) => {
  const classes = useStyles();
  const formSubmission = (e) => {
    e.preventDefault();
    if (state.type === "type" || state.format === "format") {
      return;
    }
    handleSubmit();
  };
  return (
    <Dialog open={openForm} onClose={() => setOpenForm(false)}>
      <div className="centered-product">
        <ProductListItem
          id={0}
          name={state.name}
          description={state.description}
          image_url={state.image_url || '/mj.jpg'}
          type={state.type}
          tags={state.tags}
          selected={false}
          selectProduct={() => false}
          unSelectProduct={() => false}
        />
      </div>
      <form onSubmit={formSubmission}>
        <DialogTitle>New Product</DialogTitle>
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
              value={state.name}
              onChange={handleChange}
              placeholder="My Great Product"
            />
            <TextField
              name="description"
              required
              helperText="Description"
              value={state.description}
              onChange={handleChange}
              placeholder="The abosoute best..."
              multiline={true}
              minRows={3}
            />
            <TextField
              name="image_url"
              helperText="Image URL"
              value={state.image_url}
              onChange={handleChange}
              placeholder="https://something/my-great-product.png"
            />
          </div>
          {/* replace with image uploader ? */}
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
              value={state.tags}
              onChange={handleChange}
              placeholder="calm,indica-dominant"
              sx={{ marginTop: "1rem", width: "100vw", maxWidth: 340 }}
            />
            <Select
              className={classes.select}
              required
              name="type"
              value={state.type}
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
              value={state.format}
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
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button color="primary" variant="contained" type="submit">
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewProduct;
