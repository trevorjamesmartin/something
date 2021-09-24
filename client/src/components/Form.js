import React from "react";

import {
  TextField,
  MenuItem,
  Select,
  Button,
  Card,
  CardHeader,
  Divider
} from "@mui/material";
import useStyles from "../hooks/useStyles";

const NewProduct = ({ handleChange, newProduct: state, handleSubmit }) => {
  const classes = useStyles();
  const formSubmission = (e) => {
    e.preventDefault();
    if (state.type === "type" || state.format === "format") {
      return;
    }
    handleSubmit();
  };
  return (
    <Card>
      <CardHeader
        title="New Product"
        subheader="enter product information and press 'create' to update the database"
      />
      <form onSubmit={formSubmission} style={{maxWidth: 575}}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 570,
            width: "100vw",
          }}
        >
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
        </div>
        {/* replace with image uploader ? */}
        <div
          className="type-tags-format"
          style={{
            display: "flex",
            // flexDirection: "column",
            maxWidth: 540,
            width: "100vw",
            marginLeft: "1rem"
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
        <br />
        <Divider variant="middle" />
        <br />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            margin: "1rem",
            width: "100vw",
          }}
        >
          <Button color="primary" variant="contained" type="submit">
            Create
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default NewProduct;
