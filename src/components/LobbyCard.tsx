"use client";

import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Box,
  VStack,
  HStack,
  Heading,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Input,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  CreateRoomOptions,
  JoinRoomOptions,
  KV,
  RoomClient,
} from "common/type";
import { PlayerTypeEnum, RoomStatusEnum } from "common/enum";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { isDM } from "common/functions";

export type LobbyCardProps = {
  dict: Record<string, string>;
  locale: string;
  socket: Socket;
  rooms: RoomClient[];
  handleJoinRoom: (options: JoinRoomOptions) => void;
};
export default function LobbyCard(props: LobbyCardProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isPasswordOpen,
    onOpen: onPasswordOpen,
    onClose: onPasswordClose,
  } = useDisclosure();
  const cancelRef = useRef(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>();
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [aiCount, setAiCount] = useState<number>(2);
  // const [dmType, setDmType] = useState<PlayerTypeEnum>(PlayerTypeEnum.AI);

  useEffect(() => {
    props.socket?.on("ROOM_CREATED", (_room: RoomClient) => {
      props.handleJoinRoom({
        id: _room.id,
        password: password && password != "" ? password : undefined,
      });
    });

    return () => {
      props.socket?.off("ROOM_CREATED");
    };
  }, [props.socket, password]);

  const handleCreateRoom = () => {
    const options: CreateRoomOptions = {
      name,
      locale: props.locale,
      password: password && password != "" ? password : undefined,
      playerCount,
      aiCount,
    };
    console.log("handleCreateRoom", options);
    props.socket?.emit("CREATE_ROOM", options);
  };

  return (
    <Box
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <VStack
        style={{
          position: "relative",
          width: "100%",
          height: "90%",
          overflowY: "scroll",
        }}
      >
        {props.rooms &&
          props.rooms.map((room) => {
            return (
              <Card
                key={"room_" + room.id}
                w="100%"
                direction={{ base: "column", md: "row" }}
              >
                <CardHeader>
                  <Heading size="sm">
                    {props.dict["room"]}: {room.name}
                    {room.isPrivate && (
                      <span
                        style={{
                          borderRadius: "0.5rem",
                          padding: "0.5rem",
                          marginLeft: "0.5rem",
                          backgroundColor: "teal",
                          color: "white",
                        }}
                      >
                        {props.dict["password_protected"]}
                      </span>
                    )}
                    <span
                      style={{
                        borderRadius: "0.5rem",
                        padding: "0.5rem",
                        marginLeft: "0.5rem",
                        backgroundColor:
                          room.status == RoomStatusEnum.WAITING_TO_START
                            ? "darkorange"
                            : room.status == RoomStatusEnum.ENDED
                            ? "darkblue"
                            : "teal",
                      }}
                    >
                      {room.status == RoomStatusEnum.WAITING_TO_START
                        ? props.dict["waiting_to_start"]
                        : room.status == RoomStatusEnum.ENDED
                        ? props.dict["ended"]
                        : props.dict["started"]}
                    </span>
                  </Heading>
                </CardHeader>
                <CardBody>
                  <span>
                    {props.dict["player_count"]}:{" "}
                    {room.players.filter((it) => !isDM(it.id)).length}(AI:{" "}
                    {
                      room.players.filter(
                        (it) => !isDM(it.id) && it.type == PlayerTypeEnum.AI
                      ).length
                    }
                    )
                  </span>
                  <span
                    style={{
                      marginLeft: "0.5rem",
                    }}
                  >
                    {props.dict["commentator"]}:{" "}
                    {room.players[0].type == PlayerTypeEnum.AI
                      ? "AI"
                      : props.dict["player"]}
                  </span>
                </CardBody>
                <Button
                  borderRadius={{ base: "0 0 6px 6px", md: "0 6px 6px 0" }}
                  style={{
                    height: "100%",
                    minHeight: "2.5rem",
                  }}
                  colorScheme="teal"
                  onClick={() => {
                    if (room.isPrivate) {
                      setSelectedRoomId(room.id);
                      setPassword("");
                      onPasswordOpen();
                    } else {
                      props.handleJoinRoom({
                        id: room.id,
                        password:
                          password && password != "" ? password : undefined,
                      });
                    }
                  }}
                >
                  {props.dict["join"]}
                </Button>
              </Card>
            );
          })}
      </VStack>
      <HStack
        style={{
          position: "relative",
          width: "100%",
          height: "10%",
          flexDirection: "row-reverse",
          padding: "1rem",
        }}
        gap={2}
      >
        {/* <Button onClick={() => {
          setPassword("");
          onOpen();
        }}>{props.dict["logout"]}</Button> */}
        <Button
          onClick={() => {
            setPassword("");
            onOpen();
          }}
          colorScheme="teal"
        >
          {props.dict["create_room"]}
        </Button>
      </HStack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{props.dict["create_room"]}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text
              style={{
                margin: "0.5rem 0",
              }}
            >
              {props.dict["room_name"]}
            </Text>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></Input>
            {/* <Text style={{
              margin: "0.5rem 0"
            }}>密码（可选）（公开请留空）：</Text>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password"></Input> */}
            {/* <Text style={{
              margin: "0.5rem 0"
            }}>法官类型：</Text>
            <Select value={dmType} onChange={(e) => setDmType(parseInt(e.target.value))}>
              <option value={PlayerTypeEnum.AI}>AI</option>
              <option value={PlayerTypeEnum.HUMAN}>玩家</option>
            </Select> */}
            {/* <Text style={{
              margin: "0.5rem 0"
            }}>玩家数量：{playerCount}</Text>
            <Slider aria-label='slider-ex-1' value={playerCount} max={2} min={5} onChange={(e) => {
              setPlayerCount(e);
              if (aiCount > e)
                setAiCount(e);
            }}>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider> */}
            <Text
              style={{
                margin: "0.5rem 0",
              }}
            >
              AI: {aiCount}
            </Text>
            <Slider
              aria-label="slider-ex-1"
              value={aiCount}
              max={playerCount}
              min={0}
              onChange={(e) => setAiCount(e)}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              {props.dict["cancel"]}
            </Button>
            <Button
              isDisabled={!name}
              colorScheme="teal"
              onClick={handleCreateRoom}
            >
              {props.dict["confirm"]}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <AlertDialog
        isOpen={isPasswordOpen}
        leastDestructiveRef={cancelRef}
        onClose={onPasswordClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {props.dict["input_password"]}
            </AlertDialogHeader>
            <AlertDialogBody>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              ></Input>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  setSelectedRoomId(undefined);
                  setPassword("");
                  onPasswordClose();
                }}
              >
                {props.dict["cancel"]}
              </Button>
              <Button
                isDisabled={selectedRoomId == undefined || !password}
                colorScheme="teal"
                onClick={() => {
                  if (selectedRoomId == undefined || !password) return;
                  props.handleJoinRoom({
                    id: selectedRoomId,
                    password: password && password != "" ? password : undefined,
                  });
                  setSelectedRoomId(undefined);
                  setPassword("");
                  onPasswordClose();
                }}
                ml={3}
              >
                {props.dict["confirm"]}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
