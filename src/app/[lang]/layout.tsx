import "@/app/globals.css";
import React from "react";
import Image from "next/image";
import NavBar from "@/layout/NavBar";
import { Container } from "@/components/ChakraUI";
import { Provider } from "@/components/ChakraUI/Provider";

type RootLayoutProps = {
  params: {
    lang: string;
  };
  children: React.ReactNode;
};
export default function RootLayout({ params, children }: RootLayoutProps) {
  const { lang } = params;

  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <title>ChatChess</title>
        <meta name="description" content="ChatChess" />
        <meta
          name="keywords"
          content="GitHub Copilot, Prompt Programming, Prompt, Stable Diffusion"
        />
      </head>
      <body>
        <Provider>
          {/* https://github.com/vercel/next.js/issues/42292 */}
          <div className="fixed left-0 right-0 top-0 z-50 text-white">
            {/* @ts-expect-error Async Server Component */}
            <NavBar locale={lang} />
          </div>
          <Container
            position="fixed"
            left="0"
            top="0"
            maxW="full"
            maxH="full"
            h="full"
            w="full"
            pt={{ base: "70px", md: "60px" }}
            overflow="hidden"
          >
            {children}
          </Container>
        </Provider>
      </body>
    </html>
  );
}
