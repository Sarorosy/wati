import React from "react";
import SideBar from "./Sidebar";
import { useSelectedUser } from "../../utils/SelectedUserContext";
import ChatPage from "./right/ChatPage";


function Dashboard() {
  const { selectedUser, setSelectedUser } = useSelectedUser();

  return (
    <div className="flex h-full">
      {/* Left Sidebar - 1/4 */}
      <div className="w-1/4 border-r">
        <SideBar />
      </div>

      {/* Right Content - 3/4 */}
      <div className="w-3/4 flex items-center justify-center bg-gray-50">
        {selectedUser ? (
          <ChatPage />
        ) : (
          <div className="text-center text-gray-500">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
              💬
            </div>
            <h2 className="text-lg font-semibold text-gray-700">
              Select a conversation
            </h2>
            <p className="text-sm text-gray-400">
              Choose a chat from the sidebar to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


export default Dashboard;
