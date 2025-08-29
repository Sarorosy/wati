import React, { useEffect, useRef, useState } from "react";
import { formatDate, formatMessage } from "../../../helpers/CommonHelper";
import { CheckCheck, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ViewFileModal from "./ViewFileModal";

const ChatMessages = ({ messages, loading }) => {
  const bottomRef = useRef(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="space-y-4">
      {messages.map((msg) => {
        const isMe = msg.from === "me";
        const tickColor =
          msg.statusString === "READ" ? "text-green-700" : "text-gray-600";

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
          >
            {/* Bubble */}
            <div
              className={`max-w-xs px-3 py-2 rounded-2xl text-sm overflow-hidden ${
                isMe
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none"
              }`}
            >
              {(msg.type === "image" || msg.type == "sticker") &&
              msg.mediaUrl ? (
                <div>
                  <img
                    src={msg.mediaUrl}
                    onClick={() => setSelectedMedia(msg)}
                    alt="attachment"
                    className="rounded-lg max-w-[200px] max-h-[200px] object-cover bg-white cursor-pointer" 
                  />
                  {formatMessage(msg.text) && (
                    <p className="mt-1">{formatMessage(msg.text)}</p>
                  )}
                </div>
              ) : msg.type === "document" && msg.mediaUrl ? (
                <div>
                  <a
                    href={msg.mediaUrl}
                    onClick={() => setSelectedMedia(msg)}
                    target="_blank"
                    download={true}
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm"
                  >
                    📄 Download
                  </a>
                  {formatMessage(msg.text) && (
                    <p className="mt-1">{formatMessage(msg.text)}</p>
                  )}
                </div>
              ) : msg.type === "audio" && msg.mediaUrl ? (
                <div>
                  <audio controls className="max-w-[250px]">
                    <source src={msg.mediaUrl} />
                    Your browser does not support audio.
                  </audio>
                  {formatMessage(msg.text) && (
                    <p className="mt-1">{formatMessage(msg.text)}</p>
                  )}
                </div>
              ) : msg.type === "video" && msg.mediaUrl ? (
                <div>
                  <video
                    src={msg.mediaUrl}
                    onClick={() => setSelectedMedia(msg)}
                    controls
                    className="rounded-lg max-w-[250px] max-h-[200px] object-cover cursor-pointer"
                  />
                  {formatMessage(msg.text) && (
                    <p className="mt-1">{formatMessage(msg.text)}</p>
                  )}
                </div>
              ) : (
                <p>{formatMessage(msg.text)}</p>
              )}
            </div>

            {/* Timestamp + ticks below */}
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1 px-1">
              <span>{formatDate(msg.created)}</span>
              {isMe && msg.statusString && (
                <span
                  className={tickColor}
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content={msg.statusString}
                >
                  <CheckCheck size={18} />
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Loading / Typing indicator */}
      {loading && (
        <div className="flex justify-start">
          <div className="bg-gray-200 text-gray-700 px-3 py-2 rounded-2xl rounded-bl-none text-sm flex items-center space-x-1">
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
          </div>
        </div>
      )}

      <div ref={bottomRef}></div>

      {/* Media Preview Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <ViewFileModal
            selectedMedia={selectedMedia}
            setSelectedMedia={setSelectedMedia}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatMessages;
