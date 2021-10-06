import { ProductList } from "./Products/Product";
import NewProduct from "./Products/Form";
import ChatWindow from "./Chat/ChatWindow";
import ChatForm from "./Chat/ChatForm";

// const Product = { Products, NewProduct, ProductList };
const Product = { NewProduct, ProductList };

export default Product; // bundled

// individual
export { NewProduct, ProductList, ChatWindow, ChatForm };
