import React, { useEffect, useState } from "react";
import { useSelectedUser } from "../../utils/SelectedUserContext";
import { useAuth } from "../../utils/idb";
import { ListFilter, MessageSquareDot, RefreshCcw, X } from "lucide-react";
import {
  getStatus,
  markMessagesRead,
  statusOptions,
} from "../../helpers/CommonHelper";
import Select from "react-select";

const SideBar = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { selectedUser, setSelectedUser } = useSelectedUser();

  // New states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedCrmUser, setSelectedCrmUser] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);

  const fetchData = async (nopayload = false, OnlyUnread = false) => {
    try {
      let payload = "";
      if (!nopayload) {
        payload = {
          search_keywords: "",
          update_status: "",
          selected_user_id: selectedCrmUser,
          filterUnread: OnlyUnread,
          user_id: user?.id,
          user_name: user?.name,
          user_type: user?.user_type,
        };
      } else {
        payload = {
          search_keywords: searchTerm,
          update_status: statusFilter,
          selected_user_id: selectedCrmUser,
          filterUnread: OnlyUnread,
          user_id: user?.id,
          user_name: user?.name,
          user_type: user?.user_type,
        };
      }
      setLoading(true);

      const apiUrl = "https://loopback-skci.onrender.com/api/wati/queries";
      //const apiUrl = "https://instacrm.rapidcollaborate.com/test/api/watiqueries"
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

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

  const fetchUsers = async () => {
    try {
      // const apiUrl = "https://instacrm.rapidcollaborate.com/test/api/getusersforwati";
      const apiUrl = "https://loopback-skci.onrender.com/api/wati/allusers";
      const res = await fetch(apiUrl, {
        method: "GET",
      });
      const data = await res.json();
      if (data.status) {
        setAllUsers(data.data);
      } else {
        console.log(data.message || "Error fetching users");
      }
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser?.id) {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === selectedUser.id ? { ...u, wati_unread_count: 0 } : u
        )
      );
      if (
        selectedUser?.wati_unread_count &&
        selectedUser?.wati_unread_count > 0
      ) {
        markMessagesRead(selectedUser.id).then((res) => {});
      }
    }
  }, [selectedUser]);

  const options = allUsers.map((user) => ({
    value: user.id,
    label: user.name,
  }));

  const stOptions = statusOptions.map((status) => ({
    value: status.id,
    label: status.name,
  }));

  return (
    <div className="w-full h-full bg-white border-r overflow-y-auto">
      <div className="p-3 border-b bg-gray-50 sticky top-0 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chats</h2>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                const newValue = !filterUnread;
                setFilterUnread(newValue);
                fetchData(true, newValue);
              }}
              className={`px-3 py-1 text-sm border rounded-lg  ${
                filterUnread ? "bg-green-900 text-white" : "hover:bg-green-100"
              }`}
              data-tooltip-id="my-tooltip"
              data-tooltip-content={
                filterUnread ? "Show all queries" : "Show only unread queries"
              }
            >
              <MessageSquareDot size={14} className={``} />
            </button>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setSelectedCrmUser(null);
                fetchData(false);
              }}
              className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100"
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Refresh"
            >
              <RefreshCcw
                size={14}
                className={` ${loading ? "animate-spin" : ""}`}
              />
            </button>
            {/* Toggle Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              data-tooltip-id="my-tooltip"
              data-tooltip-content={
                showFilters ? "Hide filters" : "Show filters"
              }
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
                className="flex-1 f-11 border border-gray-300 rounded px-3 py-1 text-sm focus:ring-none focus:outline-none "
              />
              <button
                onClick={fetchData}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </div>

            <div className="flex items-center">
              {/* Status Filter */}
              <Select
                className="w-full text-sm"
                value={
                  stOptions.find((opt) => opt.value === statusFilter) || null
                }
                onChange={(option) =>
                  setStatusFilter(option ? option.value : "")
                }
                options={stOptions}
                placeholder="Select Status"
                isClearable
              />
              {(user?.user_type == "admin" ||
                user?.user_type == "sub-admin") && (
                <Select
                  className="w-full text-sm"
                  value={
                    options.find((opt) => opt.value === selectedCrmUser) || null
                  }
                  onChange={(option) =>
                    setSelectedCrmUser(option ? option.value : "")
                  }
                  options={options}
                  placeholder="Select User"
                  isClearable
                />
              )}
            </div>
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
        ) : users.length > 0 ? (
          users.map((user) => (
            <li
              key={user.id}
              onClick={() => {
                setSelectedUser(user);
              }}
              className={`flex items-center gap-3 px-4 py-3 ${
                selectedUser?.id == user?.id
                  ? "bg-gray-200 hover:bg-gray-200"
                  : ""
              } cursor-pointer hover:bg-gray-100 transition`}
            >
              {/* Profile Circle with first letter */}
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              {/* User Name + phone/email */}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 truncate flex items-center">
                  <span className="mr-2">
                    {user.name?.split("\n")[0]?.slice(0, 20)}
                    {user.name?.length > 20 ? "..." : ""}
                  </span>
                  {getStatus(user?.update_status)}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.phone || user.email}
                </p>
              </div>

              {/* Unread Count Badge */}
              {user.wati_unread_count > 0 && (
                <span className="ml-auto px-2 py-1 text-xs font-bold rounded-full bg-[#588157] text-white">
                  {user.wati_unread_count}
                </span>
              )}
            </li>
          ))
        ) : (
          <li className="px-4 py-3 text-sm text-gray-500 italic">
            No queries found
          </li>
        )}
      </ul>
    </div>
  );
};

export default SideBar;
