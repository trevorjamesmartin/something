import React from "react";

import {
  TextField,
  FormControl,
  MenuItem,
  Select,
  Button,
} from "@mui/material";
import useStyles from "../hooks/useStyles";

const NewProduct = ({ handleChange, newProduct: state, handleSubmit }) => {
  const classes = useStyles();
  const formSubmission = (e) => {
    e.preventDefault();
    if (state.type === "type" || state.format === "format") {
      return
    }
    handleSubmit()
  }
  return (
    <form onSubmit={formSubmission}>
      <div style={{ display: "flex", maxWidth: 570, width: "100vw" }}>
        <FormControl fullWidth>
          <TextField
            name="name"
            required
            helperText="Name"  
            value={state.name}
            onChange={handleChange}
            placeholder="My Great Product"
            sx={{ maxWidth: 540, marginTop: "1rem", marginLeft: "1rem" }}
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
            sx={{ maxWidth: 540, marginTop: "1rem", marginLeft: "1rem" }}
          />
          <TextField
            name="image_url"
            helperText="Image URL"  
            value={state.image_url}
            onChange={handleChange}
            placeholder="https://something/my-great-product.png"
            sx={{ maxWidth: 540, marginTop: "1rem", marginLeft: "1rem" }}
          />
        </FormControl>
      </div>
      {/* replace with image uploader ? */}
      <div className="type-tags-format">
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
        <FormControl>
          <Select
            className={classes.select}
            required
            name="type"
            value={state.type}
            onChange={handleChange}
            sx={{ textAlign: "left" }}
          >
            <MenuItem value="type" disabled>
              Type
            </MenuItem>
            <MenuItem value="indica">Indica</MenuItem>
            <MenuItem value="sativa">Sativa</MenuItem>
            <MenuItem value="hybrid">Hybrid</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <Select
            className={classes.select}
            name="format"
            value={state.format}
            onChange={handleChange}
            sx={{ textAlign: "left" }}
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
        </FormControl>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", margin: "1rem", maxWidth: 540, width: "100vw" }}>
        <Button color="primary" variant="contained" type="submit">
          Create
        </Button>
      </div>
    </form>
  );
};

export default NewProduct;
