import { CircleMinus } from "lucide-react";
import React from "react";

const ChatHeader = ({ user, onClose }) => {
  return (
    <div className="flex items-center justify-between  p-3 border-b bg-white shadow-sm">
     <div className="flex items-center gap-3">
         <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
        {user?.name?.charAt(0).toUpperCase() || "U"}
      </div>
      <div className="flex flex-col">
        <p className="text-sm font-semibold text-gray-900">
          {user?.name || "Unknown User"}
        </p>
        <p className="text-xs text-gray-500">{user?.email || user?.phone}</p>
      </div>
     </div>
      <button
      onClick={onClose}
      className="text-red-500 bg-red-100 p-1 rounded-full">
        <CircleMinus size={20} />
      </button>
    </div>
  );
};

export default ChatHeader;
