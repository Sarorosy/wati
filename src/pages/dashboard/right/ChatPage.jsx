import React, { useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatSend from "./ChatSend";
import { useSelectedUser } from "../../../utils/SelectedUserContext";
import {
  fetchMedia,
  normalizePhoneNumber,
} from "../../../helpers/CommonHelper";

const ChatPage = () => {
  const { selectedUser, setSelectedUser } = useSelectedUser();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(selectedUser);
    if (!selectedUser?.phone) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        setMessages([]);

        const cleanPhone = normalizePhoneNumber(selectedUser.phone);
        const res = await fetch(
          `https://app-server.wati.io/api/v1/getMessages/${cleanPhone}?pageSize=100&pageNumber=1`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NDFjNGZmNS1jNGU0LTRjMDQtYWMwNy1lNWQ4ZjhmNTlmMzkiLCJ1bmlxdWVfbmFtZSI6IndlYkB0aGVzaXNpaW5kaWEubmV0IiwibmFtZWlkIjoid2ViQHRoZXNpc2lpbmRpYS5uZXQiLCJlbWFpbCI6IndlYkB0aGVzaXNpaW5kaWEubmV0IiwiYXV0aF90aW1lIjoiMDkvMDIvMjAyNSAwNDo0Njo1NCIsImRiX25hbWUiOiJ3YXRpX2FwcF90cmlhbCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlRSSUFMIiwiZXhwIjoxNzU3MzkzMjEzLCJpc3MiOiJDbGFyZV9BSSIsImF1ZCI6IkNsYXJlX0FJIn0.vycmu2yZIicYjNBeOc0OiBl45EFMvOvG7CcW4GPVc8o`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();

        if (data?.result === "success") {
          let formatted = data.messages.items
            .filter(
              (msg) =>
                msg.eventType === "message" ||
                msg.eventType === "broadcastMessage"
            )
            .map((msg) => ({
              id: msg.id,
              text: msg.text || msg.finalText || msg.eventDescription,
              type: msg.type,
              statusString : msg.statusString || null,
              data: msg.data || null,
              from: msg.owner == false ? "user" : "me",
              created: msg.created,
            }));

          // Fetch blobs for media (image, document, audio, video, etc.)
          const withMedia = await Promise.all(
            formatted.map(async (m) => {
              if (
                ["image", "document", "audio", "video","sticker"].includes(m.type) &&
                m.data
              ) {
                const mediaUrl = await fetchMedia(m.data);
                return { ...m, mediaUrl };
              }
              return m;
            })
          );

          setMessages(withMedia.reverse());
        }
      } catch (err) {
        console.error("Error fetching messages", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  const handleSend = (text) => {
    if (!text.trim()) return;
    const newMsg = { id: Date.now(), from: "me", text };
    setMessages([...messages, newMsg]);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      {/* Header */}
      <ChatHeader
        user={selectedUser}
        onClose={() => {
          setSelectedUser(null);
        }}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <ChatMessages messages={messages} loading={loading}/>
      </div>

      {/* Input */}
      <div className="border-t p-3 bg-white">
        <ChatSend setMessages={setMessages} selectedUser={selectedUser} />
      </div>
    </div>
  );
};

export default ChatPage;
