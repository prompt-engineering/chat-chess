import { KV } from "../common/type.js";

export const CHAT_COMPLETION_URL = "https://api.openai.com/v1/chat/completions";
export const CHAT_COMPLETION_CONFIG = {
  model: "gpt-3.5-turbo",
};
export const DM_SYSTEM_PROMPT: KV<string> = {
  "en-US": "You are a chess commentator, please provide commentary after I tell you about a move.",
  "zh-CN": "请扮演一名国际象棋解说，请在我告诉你一步棋之后解说这步棋。"
};
export const DM_PROMPT: KV<string> = {
  "en-US": "Please welcome the audience first",
  "zh-CN": "首先请致欢迎词。"
};
export const PLAYER_SYSTEM_PROMPT = "Let's play chess. Please let me know your move using SAN format and wrap it in curly brackets. Perform your next move only after my move. Make sure you have a clear visualization of board and your move is valid based on our previous moves.";