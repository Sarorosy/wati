import React from "react";
import { CheckCheck, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate, formatMessage } from "../../../helpers/CommonHelper";

function ViewFileModal({ selectedMedia, setSelectedMedia }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-4 relative"
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedMedia(null)}
          className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <X size={18} />
        </button>

        {/* Media */}
        <div className="flex justify-center">
          {selectedMedia.type === "image" && (
            <img
              src={selectedMedia.mediaUrl}
              alt="full"
              className="max-h-[400px] rounded-lg"
            />
          )}
          {selectedMedia.type === "video" && (
            <video
              src={selectedMedia.mediaUrl}
              controls
              className="max-h-[400px] rounded-lg"
            />
          )}
          {selectedMedia.type === "audio" && (
            <audio controls className="w-full">
              <source src={selectedMedia.mediaUrl} />
            </audio>
          )}
          {selectedMedia.type === "document" && (
            <p className="text-gray-700 text-sm">
              📄 {selectedMedia.text || "Document"}
            </p>
          )}
        </div>

        {/* Caption + Time */}
        {selectedMedia.text && (
          <p className="mt-2 text-sm text-gray-700">
            {formatMessage(selectedMedia.text)}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Sent at {formatDate(selectedMedia.created)}
        </p>

        {/* Download Button */}
        {selectedMedia.mediaUrl && (
          <a
            href={selectedMedia.mediaUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            <Download size={16} /> Download
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}

export default ViewFileModal;
