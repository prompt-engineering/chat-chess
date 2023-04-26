"use client";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Text,
  Input,
  useToast,
} from "@chakra-ui/react";
import { ConnectServerOptions } from "common/type";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export type LoginCardProps = {
  dict: Record<string, string>;
  socket: Socket;
  apiKey: string;
  setApiKey: Dispatch<SetStateAction<string>>;
};
export default function LoginCard(props: LoginCardProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();

  if (typeof window !== "undefined" && "sessionStorage" in window) {
    useEffect(() => {
      if (!props.apiKey) {
        const _apiKey = window.sessionStorage.getItem("cc:a");
        if (_apiKey) {
          console.log("setApiKey", _apiKey);
          props.setApiKey(_apiKey);
          if (!props.socket.connected) handleConnect(_apiKey);
        }
      }
    }, [window.sessionStorage.getItem("cc:a")]);
  }

  const handleConnect = (_apiKey?: string) => {
    if (!_apiKey && props.apiKey != "") _apiKey = props.apiKey;
    if (!_apiKey) return;
    console.log("handleConnect");
    setIsLoading(true);
    window.sessionStorage.setItem("cm:a", _apiKey);
    props.socket.connect();
    props.socket.emit("LOGIN", {
      apiKey: _apiKey,
    } as ConnectServerOptions);
  };

  return (
    <Card
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <CardHeader
        style={{
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {props.dict["login"]}
      </CardHeader>
      <CardBody>
        <Text>OpenAI API Key</Text>
        <Text
          style={{
            fontSize: "0.8rem",
            color: "#666",
            margin: "0.5rem 0",
          }}
        >
          {props.dict["apikey_note"]}
        </Text>
        <Input
          type="password"
          value={props.apiKey}
          onChange={(e) => props.setApiKey(e.target.value)}
        ></Input>
      </CardBody>
      <CardFooter
        style={{
          flexDirection: "column",
        }}
      >
        <Button
          isDisabled={props.apiKey ? false : true}
          isLoading={isLoading}
          colorScheme="teal"
          onClick={() => handleConnect()}
        >
          {props.dict["login"]}
        </Button>
      </CardFooter>
    </Card>
  );
}
