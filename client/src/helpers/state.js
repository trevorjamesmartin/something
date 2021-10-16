import { promiseGetRecoil, promiseSetRecoil } from "recoil-outside";
// import { loadPortable } from "./ws";
import { chat } from "../atoms";

/**
 * Format text for output & update state
 *
 * @param {URLSearchParams} params include 'name' & 'data'
 * @returns {Promise} Promise to update recoil state
 */
async function updateChat(params) {
  const old = await promiseGetRecoil(chat);
  const output = [
    ...old.output,
    { name: params.get("name"), data: params.get("data") },
  ];
  const update = {
    ...old,
    output,
  };
  return await promiseSetRecoil(chat, update);
}

export async function loadChatHistory({ chatlog, users }) {
  const old = await promiseGetRecoil(chat);
  return await promiseSetRecoil(chat, { ...old, output: chatlog, users });
}

export async function updateChatHistory({ chatlog, users }) {
  if (!chatlog && !users) {
    return;
  }
  // update local chatlog
  const old = await promiseGetRecoil(chat);
  const upd =
    chatlog?.map((s) => {
      const usp = new URLSearchParams(s);
      let name = usp.get("name");
      let data = usp.get("data");
      return { name, data };
    }) || [];
  let update = { ...old, output: [...upd] };
  if (users) {
    update["users"] = users;
  }
  return await promiseSetRecoil(chat, update);
}

export async function addUserNamed({ name, id }) {
  let state = await promiseGetRecoil(chat);
  let updates = false;
  let users = [];
  await state.users.forEach((u) => {
    if (u.id === id) {
      updates = true;
      users.push({ name, id });
    } else {
      users.push(u);
    }
  });
  if (!updates) {
    await users.push({ name, id });
  }
  return await promiseSetRecoil(chat, { ...state, users });
}

export async function removeUser({ id }) {
  const c = await promiseGetRecoil(chat);
  return await promiseSetRecoil(chat, {
    ...c,
    users: c.users.filter((u) => u.id !== id),
  });
}

export async function connectionClosed() {
  const old = await promiseGetRecoil(chat);
  const update = {
    ...old,
    users: [],
    connected: false,
  };
  return await promiseSetRecoil(chat, update);
}

export async function connectionOpened() {
  const old = await promiseGetRecoil(chat);
  const update = {
    ...old,
    connected: true,
  };
  return await promiseSetRecoil(chat, update);
}

export default updateChat;
