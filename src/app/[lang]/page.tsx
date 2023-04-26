import React from "react";
import { getAppData } from "@/i18n";
import ChatChess from "@/app/[lang]/chat-chess/page.client";

async function Page() {
  const { locale, pathname, i18n } = await getAppData();
  const i18nProps: GeneralI18nProps = {
    locale,
    pathname,
    i18n: {
      dict: i18n.dict,
    },
  };

  return <ChatChess {...i18nProps} />;
}

export default Page;
