import { promiseGetRecoil, promiseSetRecoil } from "recoil-outside";
import { chat } from "../atoms";

async function updateChat(data) {
  const old = await promiseGetRecoil(chat);
  const output = [...old.output, data];
  const update = {
      ...old,
      output
  }
  return await promiseSetRecoil(chat, update);
}

export default updateChat;
