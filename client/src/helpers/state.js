import { promiseGetRecoil, promiseSetRecoil } from "recoil-outside";
import { chat } from "../atoms";

/**
 * Format text for output & update state
 *
 * @param {URLSearchParams} params include 'name' & 'data'
 * @returns {Promise} Promise to update recoil state
 */
async function updateChat(params) {
  const old = await promiseGetRecoil(chat);
  // const newLine = `[${params.get("name")}] ${params.get("data")}`;
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

/**
 * Update list of chat users
 * @param {URLSearchParams} params include a list of 'names'
 * @returns {Promise} Promise to update recoil state
 */
export async function updateChatNames(params) {
  const names = params
    .get("names")
    ?.split(",")
    .filter((v) => v.length > 0) || ["empty"];
  const old = await promiseGetRecoil(chat);
  const update = {
    ...old,
    users: names,
  };
  return await promiseSetRecoil(chat, update);
}

export async function connectionClosed() {
  const old = await promiseGetRecoil(chat);
  const update = {
    ...old,
    output: [
      ...old.output,
      { name: "@", data: "***[CONNECTION CLOSED]***" },
    ],
    users: [],
    connected: false,
  };
  return await promiseSetRecoil(chat, update);
}

export async function connectionOpened() {
  const old = await promiseGetRecoil(chat);
  const update = {
    ...old,
    output: [
      ...old.output,
      { name: "@", data: "***[CONNECTED TO CHAT]***" },
    ],
    connected: true,
  };
  return await promiseSetRecoil(chat, update);
}

export default updateChat;
