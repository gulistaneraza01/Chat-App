import { useState } from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

function ChatSideBar({
  sideBarOpen,
  setSideBarOpen,
  showAllUsers,
  setShowAllUsers,
  users,
  loginUser,
  chats,
  selectedUser,
  setSelectedUser,
  handleLogoutUser,
  createChat,
  onChatSelect,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <aside
      className={`fixed z-20 sm:static top-0 left-0 h-screen w-80 bg-gray-900 border-r border-gray-700 transform ${
        sideBarOpen ? "translate-x-0" : "-translate-x-full"
      } sm:translate-x-0 transition-transform duration-300 flex flex-col`}
    >
      {/* header */}
      <div className="p-6 border-b border-gray-700">
        <div className="sm:hidden flex justify-end mb-0">
          <button
            className="p-2 rounded-lg"
            onClick={() => {
              setSideBarOpen(false);
            }}
          >
            <img src={assets.crossIcon} alt="cross Icon" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 justify-between rounded-sm">
              <img src={assets.messageCircle} alt="messgae circle" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {showAllUsers ? "New Chats" : "Messages"}
            </h2>
          </div>

          <button
            className={`p-2 rounded-lg transition-colors ${
              showAllUsers
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
            onClick={() => {
              setShowAllUsers((prev) => !prev);
            }}
          >
            {showAllUsers ? (
              <img src={assets.crossIcon} alt="cross Icon" />
            ) : (
              <img src={assets.plusIcon} alt="cross Icon" />
            )}
          </button>
        </div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-hidden px-4 py-2">
        {showAllUsers ? (
          <div className="space-y-4 h-full">
            <div className="relative">
              <img
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                src={assets.searchIcon}
                alt="search Icon"
              />
              <input
                type="text"
                placeholder="Search User..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 outline-none"
              />
            </div>

            {/* userList */}
            <div className="space-y-2 overflow-y-auto h-full pb-4">
              {users
                ?.filter(
                  (user) =>
                    user._id !== loginUser?._id &&
                    user.name
                      .toLowerCase()
                      .includes(searchQuery.toLocaleLowerCase())
                )
                .map((user) => {
                  return (
                    <button
                      key={user._id}
                      className="w-full text-left p-4 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        createChat(user);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={assets.circleIcon} alt="user Icon" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-white">
                            {user.name}
                          </span>
                          <div className="text-xs text-gray-400 mt-0.5">
                            Click to start chat
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        ) : chats && chats.length > 0 ? (
          <div className="space-y-2 overflow-y-auto h-full pb-4">
            {chats.map((chat, index) => {
              const latestMessage = chat.chat?.latestMsg;
              // Convert both IDs to strings for comparison
              const selectedUserId = selectedUser?._id?.toString();
              const chatUserId = chat.user?._id?.toString();
              const isSelected = selectedUserId === chatUserId;
              const isSentByMe =
                latestMessage?.sender?.toString() ===
                loginUser?._id?.toString();
              const unseenCount = chat.chat?.unseenCount || 0;

              return (
                <button
                  key={chat.chat._id || index}
                  onClick={() => {
                    onChatSelect(chat.chat._id, chat.user);
                  }}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-blue-600 border border-blue-500"
                      : "border border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gray-700  flex items-center justify-center">
                        <img src={assets.circleIcon} alt="user Icon" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-semibold truncate ${
                            isSelected ? "text-white" : "text-gray-200"
                          }`}
                        >
                          {chat.user?.name || "Unknown User"}
                        </span>
                        {unseenCount > 0 && (
                          <div className="bg-red-600 text-white text-xs font-bold rounded-full min-w-[22px] h-5.5 flex items-center justify-center px-2">
                            {unseenCount > 99 ? "99+" : unseenCount}
                          </div>
                        )}
                      </div>
                      {latestMessage && (
                        <div className="flex items-center gap-2">
                          {isSentByMe ? (
                            <span className="text-sm text-gray-400">You: </span>
                          ) : (
                            <span className="text-sm text-gray-400">
                              {chat.user?.name || "User"}:{" "}
                            </span>
                          )}
                          <span className="text-sm text-gray-400 truncate flex-1">
                            {latestMessage.text}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 bg-gray-800 rounded-full mb-4">
              <img src={assets.messageCircle} alt="Message icon" className="" />
            </div>
            <p className="text-gray-400 font-medium ">No Conversation Yet</p>
            <p className="text-sm text-gray-500 mt-1 ">
              Start A New Chat To Begin Messages
            </p>
          </div>
        )}
      </div>

      <footer className="p-4 border-t border-gray-700 space-y-2">
        <Link
          to={"/profile"}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <div className="pb-1.5 bg-gray-700 rounded-lg">
            <img src={assets.profileIcon} alt="profile logo" />
          </div>
          <span className="font-medium text-gray-300">Profile</span>
        </Link>
        <button
          onClick={handleLogoutUser}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors text-red-500 hover:text-white"
        >
          <div className="pb-1.5 bg-red-600 rounded-lg">
            <img src={assets.logoutIcon} alt="logout" />
          </div>
          <span className="text-medium">Logout</span>
        </button>
      </footer>
    </aside>
  );
}

export default ChatSideBar;
