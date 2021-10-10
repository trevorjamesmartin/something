// React
import React, { useState, useEffect, useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  appState,
  productlist,
  reloadProducts,
  requestCount,
  appTitle,
  productFormat,
  productSelector,
  productUnselector,
  productDefault
} from "../../atoms";
import PropTypes from "prop-types";

// MUI
import { styled } from "@mui/material/styles";
import {
  IconButton,
  Typography,
  Card,
  CardHeader,
  CardActions,
  CardContent,
  CardMedia,
  Collapse,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
} from "@mui/icons-material";

import { getProductsInFormat } from "../../helpers/api";

/**
 * from MUI documentation, to expand the dropdown menu
 */
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

/**
 * given a comma separated list of tags, extract those delineated-dominant
 *
 * (maybe add other-weights to this function)
 *
 * @param {string} tags
 * @returns {object} { weights: [], newTags: []}
 */
const sortProductTags = (tags) => {
  let weights = [];
  let newTags = [];
  // sort the tags and note any stylistic weight (sativa=red, indica=blue)
  tags.split(",").forEach((t) => {
    const [a, b] = t.split("-");
    b && b === "dominant" ? weights.push(a) : newTags.push(t);
  });
  return { weights, newTags };
};

/**
 * will someone with better color vision expand upon this ?
 * @param {array} weights
 * @param {string} type
 * @returns {string} hex-color
 */
const determineColor = (weights, type) => {
  const score = { sativa: 0, hybrid: 0, indica: 0 };
  if (type === "hybrid") {
    score.hybrid = 1;
    score.indica += 50;
    score.sativa += 50;
  } else {
    score[type] += 200;
  }
  weights.forEach((lb) => (score[lb] += 125));
  return (
    "#" +
    [score.sativa, score.hybrid, score.indica]
      .map((c) => {
        const hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

/**
 *
 * @param {*} props
 * @returns
 */
export const ProductListItem = ({
  id,
  name,
  description,
  image_url,
  type,
  tags,
  selected,
  preview_image
}) => {
  // mui toggler
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(!expanded);
  // recoil state
  const [, selectProduct] = useRecoilState(productSelector);
  const [, unSelectProduct] = useRecoilState(productUnselector);
  // transformers
  const { weights, newTags } = sortProductTags(tags);
  const bgcolor = determineColor(weights, type);
  // render
  return (
    <Card
      className="product-list-item"
      key={id}
      id={id}
      sx={{ width: 345 }}
      raised={selected}
      zdepth={1}
      onMouseOver={() => selectProduct(id)}
      onMouseOut={() => unSelectProduct(id)}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor }} aria-label="recipe">
            M
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={name}
        subheader={type}
      />
      <CardMedia
        component="img"
        height="194"
        src={preview_image}
        image={preview_image ? undefined : image_url}
        alt={"image of " + name + " medicinal plant"}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {newTags.join(", ")}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
        <ExpandMore
          expand={expanded}
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>about {name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};
ProductListItem.propTypes = {
  id: PropTypes.number,
  name: PropTypes.string,
  description: PropTypes.string,
  image_url: PropTypes.string,
  type: PropTypes.string,
  selected: PropTypes.bool,
};

export const ProductList = ({ format, title }) => {
  // recoil state
  const state = useRecoilValue(appState);
  const [getProducts, setProducts] = useRecoilState(productlist);
  const [reqCount, incReqCount] = useRecoilState(requestCount);
  const [reload, setReload] = useRecoilState(reloadProducts);
  const [, setFormat] = useRecoilState(productFormat);
  const [, setTitle] = useRecoilState(appTitle);
  const [, resetForm] = useRecoilState(productDefault);
  // local state  
  const [loadingState, setLoadingState] = useState(false);
  const loadingProducts = reload || reqCount === 0;

  const cbGetProducts = useCallback(async () => {
    await setProducts([]); // empty products
    (await title.length) > 0 && setTitle(title); // set title when applicable
    (await format.length) > 0 && setFormat(format); // set format when applicable
    const { products } = await getProductsInFormat(format); // GET
    // if we're developing, simulate traffic (spinner optics)
    process.env.NODE_ENV === "development" &&
      (await new Promise((resolve) => setTimeout(resolve, 500))); // sleep for half a second
      await incReqCount(); // increase the request count and return our list of products
    return products;
  }, [format, incReqCount, setFormat, setProducts, setTitle, title]);

  useEffect(() => {
    if (loadingState) {
      // console.log('still waiting for page to load...')
      return;
    }
    if (state.title === title && state.format === format) {
      // console.log('no change in format or title')
      return;
    };
    setLoadingState(true) // "don't come around here no more"
    setReload(true); // spin it
    async function loadInventory() {
      await (setTitle(title) && setFormat(format));
      const result = await cbGetProducts();
      await setProducts(result)
      await setReload(false)
      await setLoadingState(false);
    }
    loadInventory();
  }, [cbGetProducts, format, loadingState, reload, resetForm, setFormat, setProducts, setReload, setTitle, state.format, state.title, title]);

  return loadingProducts ? (
    <div className="spinner-div">
      <br />
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        fetching {state.format}
      </Typography>
    </div>
  ) : (
    // map it here
    <div className="div-products">
      {getProducts &&
        getProducts.map((p) => (
          <ProductListItem
            key={p.id}
            id={p.id}
            name={p.name}
            description={p.description}
            image_url={p.image_url}
            type={p.type}
            tags={p.tags}
            selected={p.selected}
          />
        ))}
    </div>
  );
};
