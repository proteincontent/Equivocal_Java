import { LegalChatPage } from "@/components/legal-chat-page";

export default function Home() {
  // 根路径只显示介绍页 (Intro)
  return <LegalChatPage initialShowChat={false} />;
}
