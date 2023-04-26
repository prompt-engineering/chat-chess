"use client";

import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { RoomStatusEnum } from "common/enum";
import { Message, RoomClient, StartGameOptions } from "common/type";
import { isDM, toName } from "common/functions";
import { BeatLoader } from "react-spinners";
import { createRef, useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Socket } from "socket.io-client";

export type RoomCardProps = {
  dict: Record<string, string>;
  socket: Socket;
  room: RoomClient;
  handleExitRoom: () => void;
};
export default function RoomCard(props: RoomCardProps) {
  const [game, setGame] = useState(new Chess(props.room.fen));
  const [comments, setComments] = useState<Message[]>([]);
  const contentRef = createRef<HTMLDivElement>();
  const handleStart = () => {
    props.socket?.emit("START", {
      roomId: props.room.id,
    } as StartGameOptions);
  };
  const [deltaContent, setDeltaContent] = useState<string | undefined>();

  useEffect(() => {
    props.socket.on("MESSAGE", (message: Message) => {
      console.log("MESSAGE", message.content);
      if (isDM(message.from)) {
        if (message.isDelta) {
          setDeltaContent((prev) => message.content);
        } else {
          setDeltaContent((prev) => undefined);
          comments.push(message);
          setComments((prev) => comments);
        }
      } else if (!message.isDelta) {
        comments.push(message);
        setComments((prev) => comments);
        game.move(message.content);
      }
    });
    return () => {
      props.socket.off("MESSAGE");
    };
  }, []);

  useEffect(() => {
    contentRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [comments, deltaContent]);

  return (
    <VStack
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <Box
        flexDirection={{ base: "column", md: "row" }}
        style={{
          display: "flex",
          width: "100%",
          height: "90%",
        }}
      >
        <Card width={{ base: "100%", md: "50%" }} height="min-content">
          <CardBody p={2}>
            <Chessboard arePiecesDraggable={false} position={game.fen()} />
          </CardBody>
        </Card>
        <Card
          width={{ base: "100%", md: "50%" }}
          height={{ base: "45%", md: "100%" }}
          mt={{ base: "0.5rem", md: "0" }}
          ml={{ base: "0", md: "0.5rem" }}
        >
          <CardBody
            style={{
              overflowY: "scroll",
              overflowX: "hidden",
              alignItems: "flex-start",
            }}
            p={2}
          >
            {comments &&
              comments.map((comment, idx) => (
                <Text key={"comment_" + idx} mb={"0.5rem"}>
                  <span
                    style={{
                      color: isDM(comment.from)
                        ? "teal"
                        : comment.from == 1
                        ? "darkorange"
                        : "darkmagenta",
                      fontWeight: "bold",
                    }}
                  >
                    {isDM(comment.from)
                      ? props.dict["commentator"]
                      : props.dict["player"] + comment.from}
                    :{" "}
                  </span>
                  {comment.content}
                </Text>
              ))}
            {deltaContent != undefined && (
              <Text mb={"0.5rem"}>
                <span
                  style={{
                    color: "teal",
                    fontWeight: "bold",
                  }}
                >
                  {props.dict["commentator"]}:{" "}
                </span>
                {deltaContent}
              </Text>
            )}
            <div style={{ textAlign: "center" }} ref={contentRef}>
              {props.room.status == RoomStatusEnum.WAITING_PLAYER &&
              props.room.waitingOn != undefined
                ? `${
                    isDM(props.room.waitingOn)
                      ? props.dict["commentator"]
                      : props.dict["player"] + props.room.waitingOn
                  }`
                : ""}
              {props.room.status == RoomStatusEnum.WAITING_PLAYER && (
                <BeatLoader />
              )}
            </div>
          </CardBody>
        </Card>
        {/* <VStack style={{
          flexGrow: "0.25"
        }}>
          
        </VStack> */}
      </Box>
      <HStack>
        {props.room.status == RoomStatusEnum.WAITING_TO_START && (
          <Button colorScheme="teal" onClick={handleStart}>
            {props.dict["start"]}
          </Button>
        )}
        <Button colorScheme="red" onClick={props.handleExitRoom}>
          {props.dict["exit_room"]}
        </Button>
      </HStack>
    </VStack>
  );
}
