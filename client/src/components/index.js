import { ProductList } from "./Products/Product";
import NewProduct from "./Products/Form";
import ChatWindow from "./Chat/ChatWindow";

// const Product = { Products, NewProduct, ProductList };
const Product = { NewProduct, ProductList };

export default Product; // bundled

// individual
export { NewProduct, ProductList, ChatWindow };
