"use client";

import { socket } from "@/components/socket.client";
import { Box, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import LobbyCard from "@/components/LobbyCard";
import LoginCard from "@/components/LoginCard";
import RoomCard from "@/components/RoomCard";
import {
  ExitRoomOptions,
  JoinRoomOptions,
  Message,
  RoomClient,
} from "common/type";
import Background from "@/assets/images/00234-2169176559.png";
import Image from "next/image";

function ChatChess({ i18n, locale }: GeneralI18nProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [rooms, setRooms] = useState<RoomClient[]>([]);
  const [currentRoom, setCurrentRoom] = useState<RoomClient>();
  const toast = useToast();

  useEffect(() => {
    socket.on("ROOM_LIST", (_rooms: RoomClient[]) => {
      console.log("ROOM_LIST", _rooms);
      setRooms(_rooms);
      setCurrentRoom(undefined);
      // setMessages([]);
      setIsLoggedIn(true);
    });
    socket.on("JOIN_ROOM_SUCCESS", (_room: RoomClient) => {
      setCurrentRoom(_room);
      toast({
        status: "success",
        title: i18n.dict["join_room_success"] + ": " + _room.id,
        isClosable: true,
        position: "top",
      });
    });
    socket.on("JOIN_ROOM_ERROR", () => {
      setCurrentRoom(undefined);
      toast({
        status: "error",
        title: i18n.dict["join_room_error"],
        isClosable: true,
        position: "top",
      });
    });
    socket.on("STATUS_UPDATE", (_room: RoomClient) => {
      console.log("STATUS_UPDATE", _room);
      setCurrentRoom((prev) => _room);
    });
    // socket.on("disconnect", () => {
    //   setIsLoggedIn((prev) => false);
    // });

    return () => {
      socket.off("ROOM_LIST");
      socket.off("JOIN_ROOM_SUCCESS");
      socket.off("JOIN_ROOM_ERROR");
      socket.off("STATUS_UPDATE");
    };
  }, []);

  // useEffect(() => {
  //   socket.on("MESSAGE", handleOnMessage);
  //   return () => {
  //     socket.off("MESSAGE");
  //   };
  // }, [currentRoom]);

  // function handleOnMessage(message: Message) {
  //   console.log("MESSAGE", message.content);
  //   setMessages((prev) => [...prev, message]);
  // }

  function handleJoinRoom(options: JoinRoomOptions) {
    console.log("handleJoinRoom", options, socket);
    socket.emit("JOIN_ROOM", options);
  }

  function handleExitRoom() {
    socket.emit("EXIT_ROOM", {
      id: currentRoom?.id,
    } as ExitRoomOptions);
    setCurrentRoom(undefined);
  }

  return (
    <Box
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <Image
        src={Background}
        style={{
          position: "absolute",
          left: "0",
          top: "0",
          width: "100vw",
          height: "100vh",
          zIndex: "-1",
          objectFit: "cover",
        }}
        alt="background"
      />
      {isLoggedIn ? (
        !currentRoom ? (
          <LobbyCard
            dict={i18n.dict}
            locale={locale}
            socket={socket}
            rooms={rooms}
            handleJoinRoom={handleJoinRoom}
          />
        ) : (
          <RoomCard
            dict={i18n.dict}
            socket={socket}
            room={currentRoom}
            handleExitRoom={handleExitRoom}
          />
        )
      ) : (
        <LoginCard
          dict={i18n.dict}
          socket={socket}
          apiKey={apiKey}
          setApiKey={setApiKey}
        />
      )}
    </Box>
  );
}

export default ChatChess;
