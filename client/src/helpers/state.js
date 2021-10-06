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
  const newLine = `[${params.get("name")}] ${params.get("data")}`;
  const output = [...old.output, newLine];
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
  const names = params.get("names")?.split(",").filter((v) => v.length > 0) || ["empty"];
  const old = await promiseGetRecoil(chat);
  const update = {
    ...old,
    users: names,
  };
  return await promiseSetRecoil(chat, update);
}

export default updateChat;
