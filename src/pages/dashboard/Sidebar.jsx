import React, { useEffect, useState } from "react";
import { useSelectedUser } from "../../utils/SelectedUserContext";
import { useAuth } from "../../utils/idb";
import { ListFilter, RefreshCcw, X } from "lucide-react";
import { getStatus, statusOptions } from "../../helpers/CommonHelper";

const SideBar = () => {
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { selectedUser, setSelectedUser } = useSelectedUser();

  // New states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async (nopayload = false) => {
    try {
      let payload = "";
      if (!nopayload) {
        payload = {
          search_keywords: "",
          update_status: "",
          user_id: user?.id,
          user_name: user?.name,
          user_type: user?.user_type,
        };
      } else {
        payload = {
          search_keywords: searchTerm,
          update_status: statusFilter,
          user_id: user?.id,
          user_name: user?.name,
          user_type: user?.user_type,
        };
      }
      setLoading(true);
      const response = await fetch(
        "https://instacrm.rapidcollaborate.com/test/api/watiqueries",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (result.status && result.data) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full h-full bg-white border-r overflow-y-auto">
      <div className="p-3 border-b bg-gray-50 sticky top-0 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chats</h2>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("")
                fetchData(true);
              }}
              className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100"
            >
              <RefreshCcw
                size={14}
                className={` ${loading ? "animate-spin" : ""}`}
              />
            </button>
            {/* Toggle Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100"
            >
              {showFilters ? <X size={14} /> : <ListFilter size={14} />}
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="space-y-2">
            {/* Search Box */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 f-11 border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring focus:border-blue-300"
              />
              <button
                onClick={fetchData}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring focus:border-blue-300"
            >
              {statusOptions.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <ul className="divide-y divide-gray-200 overflow-x-hidden">
        {loading ? (
          <li className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-10 transition">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
              L
            </div>

            {/* User Name */}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                Loading...
              </p>

              <p className="text-xs bg-gray-300 w-52 mt-1 truncate h-2 animate-pulse"></p>
            </div>
          </li>
        ) : (
          users.map((user) => (
            <li
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center gap-3 px-4 py-3 ${(selectedUser?.id == user?.id) ? "bg-gray-200 hover:bg-gray-200" : ""} cursor-pointer hover:bg-gray-100 transition`}
            >
              {/* Profile Circle with first letter */}
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              {/* User Name */}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 truncate flex items-center ">
                  <span className="mr-2">
                    {user.name?.split("\n")[0]?.slice(0, 20)}
                    {user.name?.length > 20 ? "..." : ""}
                  </span>

                  {getStatus(user?.update_status)}
                </p>
                {/* optional: add email or phone */}
                <p className="text-xs text-gray-500 truncate">
                  {user.phone || user.email}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default SideBar;
