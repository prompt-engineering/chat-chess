"use strict";

import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import createHttpsProxyAgent from "https-proxy-agent";
import fetch from "node-fetch";
import {
  ChatCompletionResponseMessage,
  CreateChatCompletionRequest,
} from "openai";
import { isDM } from "../common/functions.js";
import {
  JoinRoomOptions,
  CreateRoomOptions,
  KV,
  StartGameOptions,
  Message,
  PlayerServer,
  RoomClient,
  RoomServer,
  PlayerClient,
  UserServer,
  ConnectServerOptions,
  ExitRoomOptions,
  CreateChatCompletionStreamResponse,
} from "../common/type.js";
import { RoomStatusEnum, PlayerTypeEnum } from "../common/enum.js";
import {
  CHAT_COMPLETION_CONFIG,
  CHAT_COMPLETION_URL,
  DM_PROMPT,
  DM_SYSTEM_PROMPT,
  PLAYER_SYSTEM_PROMPT,
} from "./constant.js";
import { Chess } from "chess.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV == "production"
        ? process.env.SERVER_URL
        : "http://localhost:3000",
    credentials: true,
  },
});
const rooms: KV<RoomServer> = {};
const users: KV<UserServer> = {};

const isLoggedIn = (socket: Socket): boolean => {
  return socket.id in users && users[socket.id].apiKey ? true : false;
};

const toRoomDto = (room: RoomServer): RoomClient => {
  return {
    id: room.id,
    name: room.name,
    locale: room.locale,
    isPrivate: room.isPrivate,
    status: room.status,
    waitingOn: room.waitingOn,
    fen: room.game.fen(),
    players: room.players.map(
      (it) =>
        ({
          id: it.id,
          type: it.type,
        } as PlayerClient)
    ),
  } as RoomClient;
};

const handleJoinRoom = (options: JoinRoomOptions, socket: Socket) => {
  if (!isLoggedIn(socket)) {
    handleLogout(socket);
    return;
  }
  const isAllowed =
    options &&
    "id" in options &&
    options.id in rooms &&
    (!rooms[options.id].password ||
      options.password == rooms[options.id].password);
  console.log(socket.id, "handleJoinRoom", options, isAllowed);
  if (isAllowed) {
    socket.rooms.clear();
    socket.join("room" + options.id);
    socket.emit("JOIN_ROOM_SUCCESS", toRoomDto(rooms[options.id]));
    console.log(socket.id, "JOIN_ROOM_SUCCESS", options.id);
  } else {
    socket.emit("JOIN_ROOM_ERROR", {});
    console.log(socket.id, "JOIN_ROOM_ERROR", options.id);
  }
};

const handleCreateRoom = (options: CreateRoomOptions, socket: Socket) => {
  if (!isLoggedIn(socket)) {
    handleLogout(socket);
    return;
  }
  let i = 0;
  Object.keys(rooms).forEach((it) => {
    if (i <= parseInt(it)) i = parseInt(it) + 1;
  });
  rooms[i] = {
    id: i,
    name: options.name,
    locale: options.locale,
    isPrivate: options.password ? true : false,
    apiKey: users[socket.id].apiKey,
    status: RoomStatusEnum.WAITING_TO_START,
    game: new Chess(),
    password: options ? options.password : undefined,
    players: [],
  };
  rooms[i].game.reset();
  rooms[i].players.push(initAIPlayer(0, options.playerCount, options.locale));
  for (let idx = 1; idx <= options.aiCount; idx++) {
    rooms[i].players.push(
      initAIPlayer(idx, options.playerCount, options.locale)
    );
  }
  for (let idx = options.aiCount; idx < options.playerCount; idx++) {
    rooms[i].players.push(initHumanPlayer(idx));
  }
  console.log(socket.id, "ROOM_CREATED", i);
  socket.emit("ROOM_CREATED", toRoomDto(rooms[i]));
};

const handleExitRoom = (options: ExitRoomOptions, socket: Socket) => {
  if (!isLoggedIn(socket)) {
    handleLogout(socket);
    return;
  }
  console.log(socket.id, "handleExitRoom", options.id);
  socket.leave("room_" + options.id);
  handleSendRoomList(socket);
};

const handleStart = async (options: StartGameOptions, socket: Socket) => {
  if (!isLoggedIn(socket)) {
    handleLogout(socket);
    return;
  }
  if (
    "roomId" in options &&
    options.roomId in rooms &&
    rooms[options.roomId].apiKey == users[socket.id].apiKey
  ) {
    console.log(socket.id, "handleStart", "Room: " + options.roomId);
    const room = rooms[options.roomId];
    room.status = RoomStatusEnum.STARTED;
    while (room && room.status != RoomStatusEnum.ENDED) {
      for (const idx in room.players) {
        if (isDM(parseInt(idx)) && room.status != RoomStatusEnum.STARTED)
          continue;
        const _player = room.players[idx];
        room.waitingOn = _player.id;
        room.status = RoomStatusEnum.WAITING_PLAYER;
        io.to("room" + room.id).emit("STATUS_UPDATE", toRoomDto(room));
        if (_player.type == PlayerTypeEnum.AI) {
          // await wait(15000);
          await createChatCompletion(room, _player.id);
        }
        if (!isDM(_player.id)) {
          room.waitingOn = 0;
          io.to("room" + room.id).emit("STATUS_UPDATE", toRoomDto(room));
          // await wait(15000);
          await createChatCompletion(room, 0);
        }
        if (room.game.isGameOver()) room.status = RoomStatusEnum.ENDED;
        if (room.status == RoomStatusEnum.ENDED) break;
      }
      room.waitingOn = undefined;
      io.to("room" + room.id).emit("STATUS_UPDATE", toRoomDto(room));
    }
  }
};

const handleSendRoomList = (socket: Socket) => {
  socket.emit(
    "ROOM_LIST",
    Object.keys(rooms).map((it) => {
      const _room = rooms[it];
      return toRoomDto(_room);
    })
  );
};

const handleLogin = (options: ConnectServerOptions, socket: Socket) => {
  console.log(socket.id, "handleLogin", options.apiKey);
  if (options.apiKey) {
    users[socket.id] = {
      socket,
      apiKey: options.apiKey,
    };
    handleSendRoomList(socket);
  } else {
    handleLogout(socket);
  }
};

const handleLogout = (socket: Socket) => {
  socket.disconnect();
  delete users[socket.id];
};

io.on("connection", (socket) => {
  console.log(socket.id, "onConnection");
  socket.on("LOGIN", (options: ConnectServerOptions) =>
    handleLogin(options, socket)
  );
  socket.on("JOIN_ROOM", (options: JoinRoomOptions) =>
    handleJoinRoom(options, socket)
  );
  socket.on("CREATE_ROOM", (options: CreateRoomOptions) =>
    handleCreateRoom(options, socket)
  );
  socket.on("EXIT_ROOM", (options: ExitRoomOptions) =>
    handleExitRoom(options, socket)
  );
  socket.on("START", (options: StartGameOptions) =>
    handleStart(options, socket)
  );
});

io.on("disconnect", (socket) => {
  console.log(socket.id, "onDisconnect");
  delete users[socket.id];
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});

const initAIPlayer = (
  id: number,
  playerCount: number,
  locale: string
): PlayerServer => {
  return {
    id,
    type: PlayerTypeEnum.AI,
    history: [
      {
        role: "system",
        content: isDM(id)
          ? DM_SYSTEM_PROMPT[locale].replace(
              "${player_count}",
              playerCount.toString()
            )
          : PLAYER_SYSTEM_PROMPT.replace("${key}", id.toString()).replace(
              "${player_count}",
              playerCount.toString()
            ),
      },
      ...(isDM(id)
        ? [
            {
              role: "user",
              content: DM_PROMPT[locale],
            },
          ]
        : []),
    ],
    messages: [],
  };
};

const initHumanPlayer = (id: number): PlayerServer => {
  return {
    id,
    type: PlayerTypeEnum.HUMAN,
    history: [],
    messages: [],
  };
};

const createChatCompletion = async (
  room: RoomServer,
  from: number,
  _addOn?: ChatCompletionResponseMessage
) => {
  try {
    console.log("========================");
    console.log(
      "createChatCompletion" + "\nRoom: " + room.id + "\nFrom: " + from
    );
    console.log("------------------------");
    const _player = room.players[from];
    console.log(JSON.stringify(_player.history));
    const response = await fetch(CHAT_COMPLETION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${room.apiKey}`,
      },
      body: JSON.stringify({
        ...CHAT_COMPLETION_CONFIG,
        messages: _addOn ? [..._player.history, _addOn] : _player.history,
        stream: true,
      } as CreateChatCompletionRequest),
      agent:
        process.env.NODE_ENV == "production"
          ? undefined
          : createHttpsProxyAgent("http://127.0.0.1:10809"),
    });
    // const json = (await response.json()) as CreateChatCompletionResponse;
    // if (!response.ok) {
    //   console.error(json);
    // }
    // const message = json.choices[0].message;
    // if (message) {
    //   await handleResponse(room, from, message);
    // }
    if (!response.ok || !response.body) {
      throw new Error(await response.text());
    }
    const message: ChatCompletionResponseMessage = {
      role: "assistant",
      content: "",
    };
    for await (const chunk of response.body) {
      const data = chunk.toString().split("\n");
      for (const lineIndex in data) {
        const jsonStr = data[lineIndex].replace(/^data: /g, "").trim();
        if (!jsonStr) continue;
        if (jsonStr == "[DONE]") break;
        let json: CreateChatCompletionStreamResponse | undefined = undefined;
        try {
          json = JSON.parse(jsonStr) as CreateChatCompletionStreamResponse;
          if (
            json &&
            json.choices &&
            json.choices.length &&
            "delta" in json.choices[0] &&
            json.choices[0].delta
          ) {
            if (json.choices[0].delta.role) {
              message.role = json.choices[0].delta.role;
            }
            if (json.choices[0].delta.content) {
              message.content += json.choices[0].delta.content;
              if (isDM(from)) handleDelta(room.id, from, message.content);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    await handleResponse(room, from, message);
  } catch (e) {
    console.error(e);
    console.log("RETRY in 15000");
    await wait(15000);
    await createChatCompletion(room, from);
    return;
  }
  console.log("========================");
};

const wait = async (milliseconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

const handleDelta = (
  roomId: number,
  from: number,
  content: string,
  to?: number
) => {
  io.to("room" + roomId).emit("MESSAGE", {
    from,
    to,
    content,
    isDelta: true,
  } as Message);
};

const handleHistory = (
  it: PlayerServer,
  _history: ChatCompletionResponseMessage
) => {
  if (it.history[it.history.length - 1].role == "user") {
    it.history[it.history.length - 1].content += "\n" + _history.content;
  } else {
    it.history.push(JSON.parse(JSON.stringify(_history)));
  }
};

const handleMessage = (
  roomId: number,
  from: number,
  content: string,
  to?: number
) => {
  if (!(roomId in rooms)) return;
  if (!isDM(from)) {
    const room = rooms[roomId];
    const _history = {
      role: "user",
      content,
    } as ChatCompletionResponseMessage;
    if (to == undefined) {
      // room.players
      //   .filter((it) => it.id != from)
      //   .forEach((it) => handleHistory(it, _history));
      room.players
        .filter((it) => it.id != from)
        .forEach((it) => {
          if (isDM(it.id)) {
            handleHistory(it, _history);
          } else {
            handleHistory(it, {
              role: "user",
              content: `{${content}}`,
            });
          }
        });
    } else {
      handleHistory(room.players[to], _history);
    }
  }
  io.to("room" + roomId).emit("MESSAGE", {
    from,
    to,
    content,
  } as Message);
};

const handleRetry = async (room: RoomServer, from: number, message: string) => {
  const _addOn = {
    role: "user",
    content: message,
  } as ChatCompletionResponseMessage;
  console.log("RETRY", _addOn);
  await createChatCompletion(room, from, _addOn);
  return;
};

const handleResponse = async (
  room: RoomServer,
  from: number,
  message: ChatCompletionResponseMessage
) => {
  console.log("------------------------");
  console.log("handleResponse: ", message.content);
  console.log("------------------------");
  if (isDM(from)) {
    handleMessage(room.id, from, message.content);
    room.players[from].history.push(JSON.parse(JSON.stringify(message)));
  } else {
    const regex = /\{(?:.|\n)*?\}/g;
    const matches = message.content.match(regex);
    if (matches && matches.length) {
      const move = matches[0]
        .replace("{", "")
        .replace("}", "")
        .replace("\n", "")
        .trim();
      console.log("Move: ", move);
      if (!move || move == "") {
        await handleRetry(
          room,
          from,
          "Please make a move using SAN format wrapped in curly brackets."
        );
        return;
      }
      try {
        room.game.move(move);
      } catch (e) {
        console.error(e);
        await handleRetry(
          room,
          from,
          (e as Error).message +
            "\n" +
            "Current board in FEN format: " +
            room.game.fen()
        );
        return;
      }
      handleMessage(room.id, from, move);
      room.players[from].history.push({
        role: "assistant",
        content: `{${move}}`,
      } as ChatCompletionResponseMessage);
    } else {
      await handleRetry(
        room,
        from,
        "Please make a move using SAN format wrapped in curly brackets."
      );
    }
  }
};
