"use client";
import ChatComponent from "@/Components/Chatbot/ChatComponent";

export default function EmbedPage() {
  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <ChatComponent isWidgetOpen={true} closeBtn={true} />
    </div>
  );
}
