import { ChatCompletionResponseMessage } from "openai";
import { Socket } from "socket.io";
import { PlayerTypeEnum, RoomStateEnum } from "./enum";
import { Chess } from "chess.js";

export type KV<T> = {
  [key: string]: T;
}

export type ConnectServerOptions = {
  apiKey: string;
}

export type CreateRoomOptions = {
  name: string;
  locale: string;
  password?: string;
  playerCount: number;
  aiCount: number;
};

export type JoinRoomOptions = {
  id: number;
  password?: string;
};

export type ExitRoomOptions = {
  id: number;
};

export type StartGameOptions = {
  roomId: number
};

export type Message = {
  from: number;
  content: string;
  isDelta?: boolean;
};

export type RoomClient = {
  id: number;
  name: string;
  locale: string;
  isPrivate: boolean;
  status: RoomStatusEnum;
  waitingOn?: number;
  fen: string;
  players: PlayerClient[];
};

export type RoomServer = Omit<RoomClient, "players" | "fen"> & {
  apiKey: string;
  password?: string;
  game: Chess;
  players: PlayerServer[];
};

export type PlayerClient = {
  id: number;
  type: PlayerTypeEnum;
};

export type PlayerServer = PlayerClient & {
  history: ChatCompletionRequestMessage[];
  messages: Message[];
};

export type UserServer = {
  socket: Socket;
  apiKey: string;
};

/**
 *
 * @export
 * @interface CreateChatCompletionStreamResponse
 */
export interface CreateChatCompletionStreamResponse {
  /**
   *
   * @type {string}
   * @memberof CreateChatCompletionStreamResponse
   */
  id: string;
  /**
   *
   * @type {string}
   * @memberof CreateChatCompletionStreamResponse
   */
  object: string;
  /**
   *
   * @type {number}
   * @memberof CreateChatCompletionStreamResponse
   */
  created: number;
  /**
   *
   * @type {string}
   * @memberof CreateChatCompletionStreamResponse
   */
  model: string;
  /**
   *
   * @type {Array<CreateChatCompletionStreamResponseChoicesInner>}
   * @memberof CreateChatCompletionStreamResponse
   */
  choices: Array<CreateChatCompletionStreamResponseChoicesInner>;
  /**
   *
   * @type {CreateCompletionStreamResponseUsage}
   * @memberof CreateChatCompletionStreamResponse
   */
  usage?: CreateCompletionStreamResponseUsage;
}
/**
 *
 * @export
 * @interface CreateChatCompletionStreamResponseChoicesInner
 */
export interface CreateChatCompletionStreamResponseChoicesInner {
  /**
   *
   * @type {number}
   * @memberof CreateChatCompletionStreamResponseChoicesInner
   */
  index?: number;
  /**
   *
   * @type {ChatCompletionStreamResponseMessage}
   * @memberof CreateChatCompletionStreamResponseChoicesInner
   */
  delta?: ChatCompletionStreamResponseMessage;
  /**
   *
   * @type {string}
   * @memberof CreateChatCompletionStreamResponseChoicesInner
   */
  finish_reason?: string | null;
}

/**
 *
 * @export
 * @interface ChatCompletionStreamResponseMessage
 */
export interface ChatCompletionStreamResponseMessage {
  /**
   * @type {ChatCompletionResponseMessageRoleEnum}
   * @memberof ChatCompletionStreamResponseMessage
   */
  role?: ChatCompletionResponseMessageRoleEnum;
  /**
   * @type {string}
   * @memberof ChatCompletionStreamResponseMessage
   */
  content?: string;
}
