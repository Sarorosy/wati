import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Send } from "lucide-react";
import { fetchMedia, normalizePhoneNumber } from "../../../helpers/CommonHelper";
import toast from "react-hot-toast";

const SendFileModal = ({ isOpen, onClose, setMessages, selectedUser }) => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSendFile = async () => {
    if (!file || !selectedUser?.phone) return;

    try {
      setLoading(true);
      const cleanPhone = normalizePhoneNumber(selectedUser.phone);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `https://app-server.wati.io/api/v1/sendSessionFile/${cleanPhone}?caption=${encodeURIComponent(
          caption
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NDFjNGZmNS1jNGU0LTRjMDQtYWMwNy1lNWQ4ZjhmNTlmMzkiLCJ1bmlxdWVfbmFtZSI6IndlYkB0aGVzaXNpaW5kaWEubmV0IiwibmFtZWlkIjoid2ViQHRoZXNpc2lpbmRpYS5uZXQiLCJlbWFpbCI6IndlYkB0aGVzaXNpaW5kaWEubmV0IiwiYXV0aF90aW1lIjoiMDkvMDIvMjAyNSAwNDo0Njo1NCIsImRiX25hbWUiOiJ3YXRpX2FwcF90cmlhbCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlRSSUFMIiwiZXhwIjoxNzU3MzkzMjEzLCJpc3MiOiJDbGFyZV9BSSIsImF1ZCI6IkNsYXJlX0FJIn0.vycmu2yZIicYjNBeOc0OiBl45EFMvOvG7CcW4GPVc8o`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        console.error("File upload failed:", await res.text());
        return;
      }

      const data = await res.json();
      if(data.result){
        console.log("File sent ✅", data);

      const apiMsg = data.message;

      let formatted = {
        id: apiMsg.localMessageId || Date.now(),
        text: apiMsg.media?.caption || apiMsg.text || "",
        type: apiMsg.media?.mimeType?.startsWith("image")
          ? "image"
          : apiMsg.media?.mimeType?.startsWith("video")
          ? "video"
          : apiMsg.media?.mimeType?.startsWith("audio")
          ? "audio"
          : apiMsg.media?.mimeType?.startsWith("application")
          ? "document"
          : "file",
        statusString: apiMsg.statusString || null,
        data: apiMsg.media || null,
        from: "me",
        created: new Date().toISOString(),
      };

      // 🔑 fetch actual blob URL from your helper
      if (
        ["image", "document", "audio", "video", "sticker"].includes(
          formatted.type
        ) &&
        apiMsg.text
      ) {
        const mediaUrl = await fetchMedia(apiMsg.text);
        formatted = { ...formatted, mediaUrl };
      }

      setMessages((prev) => [...prev, formatted]);
      }else{
        toast.error(data.message || "Error Sending File");
        if(data.message == "Ticket has been expired."){

          toast.error("User needs to reply, please wait until then.");
        }
      }

      // reset & close
      setFile(null);
      setCaption("");
      onClose();
    } catch (error) {
      console.error("Error sending file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-lg w-full max-w-md p-5 relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Send File</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* File input */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border rounded-lg hover:bg-gray-50">
                <Upload size={18} />
                <span>{file ? file.name : "Choose a file"}</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Caption input */}
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring focus:border-blue-300"
              rows={2}
              placeholder="Write a caption (optional)..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />

            {/* Actions */}
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSendFile}
                disabled={!file || loading}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : <><Send size={16}/> Send</>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SendFileModal;
