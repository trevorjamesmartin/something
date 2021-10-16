import { atom, selector } from "recoil";

// defaults
const defaultProduct = {
  image_url: "",
  name: "",
  description: "",
  type: "type",
  tags: "",
  format: "format",
};

const defaultChat = {
  name: "anonymous",
  output: [],
  input: "",
  openForm: false,
  users: [],
  opt: null,
  connected: false
};

// Atom
const appState = atom({
  key: "appState",
  default: {
    title: "Welcome",
    openForm: false,
    calls: 0, // the number of calls made to the API
    products: [],
    reloadProducts: false, // when true, call the API
    format: "", // product.format
    newProduct: defaultProduct,
    socket: null,
    chat: defaultChat,
  },
});

// selectors
const productlist = selector({
  key: "products",
  get: ({ get }) => get(appState).products,
  set: ({ set, get }, newValue) =>
    set(appState, { ...get(appState), products: newValue }),
});

const openForm = selector({
  key: "openForm",
  get: ({ get }) => get(appState).openForm,
  set: ({ set, get }, newValue) =>
    set(appState, { ...get(appState), openForm: newValue }),
});

const reloadProducts = selector({
  key: "reloadProducts",
  get: ({ get }) => get(appState).reloadProducts,
  set: ({ set, get }, newValue) =>
    set(appState, { ...get(appState), reloadProducts: newValue }),
});

const requestCount = selector({
  key: "requestCount",
  get: ({ get }) => get(appState).calls,
  set: ({ set, get }) => {
    const s = get(appState);
    set(appState, { ...s, calls: s.calls + 1 });
  },
});

const appTitle = selector({
  key: "appTitle",
  get: ({ get }) => get(appState).title,
  set: ({ set, get }, newValue) =>
    set(appState, { ...get(appState), title: newValue }),
});

const productFormat = selector({
  key: "productFormat",
  get: ({ get }) => get(appState).format,
  set: ({ set, get }, newValue) =>
    set(appState, { ...get(appState), format: newValue }),
});

const productSelector = selector({
  key: "productSelector",
  get: ({ get }) => get(appState),
  set: ({ set, get }, id) => {
    const s = get(appState);
    const products = s.products.map((item) =>
      item.id === id
        ? { ...item, selected: true }
        : { ...item, selected: false }
    );
    set(appState, { ...s, products });
  },
});

const productUnselector = selector({
  key: "productUnselector",
  get: ({ get }) => get(appState),
  set: ({ set, get }, id) => {
    const s = get(appState);
    const products = s.products.map((item) =>
      item.id === id ? { ...item, selected: false } : item
    );
    set(appState, { ...s, products });
  },
});

const productDefault = selector({
  key: "newProductDefault",
  get: () => defaultProduct,
  set: ({ set, get }) =>
    set(appState, {
      ...get(appState),
      newProduct: defaultProduct,
    }),
});

const socket = selector({
  key: "socket",
  get: ({ get }) => get(appState).socket,
  set: ({ set, get }, socket) =>
    set(appState, {
      ...get(appState),
      socket,
    }),
});

const chat = selector({
  key: "chat",
  get: ({ get }) => get(appState).chat,
  set: ({ set, get }, update) => {
    const old = get(appState);
    set(appState, {
      ...old,
      chat: { ...old.chat, ...update },
    });
  },
});

/**
 * map of recoil state selectors
 */
const mapped = {
  title: appTitle,
  products: {
    calls: requestCount,
    format: productFormat,
    openForm,
    reload: reloadProducts,
    select: productSelector,
    unselect: productUnselector,
    new: defaultProduct,
  },
  socket,
  chat,
};

export {
  appState,
  productlist,
  openForm,  
  requestCount,
  reloadProducts,
  appTitle,
  productFormat,
  productSelector,
  productUnselector,
  productDefault,
  socket,
  chat,
};

export default mapped; // this may be more legible

