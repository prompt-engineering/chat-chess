export const isDM = (id: number) => {
  return id == 0;
};

// export const toName = (id: number) => {
//   return isDM(id) ? "法官" : "玩家" + id;
// };

// export const toTarget = (from: number, to?: number) => {
//   return "[" + (to == undefined && isDM(from) ? "公告" : to == undefined ? "公聊" : ("私聊：" + toName(to))) + "]";
// };

// export const toMessageType = (from: number, to?: number) => {
//   return to == undefined && isDM(from) ? "公告" : to == undefined ? "公聊" : "私聊";
// };