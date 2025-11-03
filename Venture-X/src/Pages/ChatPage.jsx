import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window } from "stream-chat-react";
import { useStreamChat } from "../lib/StreamChatContext";
import { useAuth } from "../lib/AuthContext";
import "stream-chat-react/dist/css/v2/index.css";

export default function ChatPage() {
  const { chatClient, isLoadingChat } = useStreamChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [channel, setChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(true);

  const channelId = searchParams.get("channelId");
  const channelType = searchParams.get("channelType") || "messaging";

  // Load user's channels
  useEffect(() => {
    if (!chatClient || !user) {
      setLoadingChannels(false);
      return;
    }

    // Check if client is connected
    if (!chatClient.userID) {
      console.error("Chat client not connected");
      setLoadingChannels(false);
      return;
    }

    let cancelled = false;

    async function loadChannels() {
      try {
        const filter = { members: { $in: [user.id] } };
        const sort = [{ last_message_at: -1 }];
        const channelList = await chatClient.queryChannels(filter, sort, {
          watch: true,
          state: true,
        });
        if (!cancelled) {
          setChannels(channelList);
        }
      } catch (error) {
        console.error("Error loading channels:", error);
        if (!cancelled) {
          setChannels([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingChannels(false);
        }
      }
    }

    loadChannels();

    return () => {
      cancelled = true;
    };
  }, [chatClient, user]);

  // Set active channel
  useEffect(() => {
    if (!chatClient || !channelId) {
      setChannel(null);
      return;
    }

    // Check if client is connected
    if (!chatClient.userID) {
      console.error("Chat client not connected");
      setChannel(null);
      return;
    }

    let cancelled = false;

    async function loadChannel() {
      try {
        const ch = chatClient.channel(channelType, channelId);
        await ch.watch();
        if (!cancelled) {
          setChannel(ch);
        }
      } catch (error) {
        console.error("Error loading channel:", error);
        if (!cancelled) {
          setChannel(null);
        }
      }
    }

    loadChannel();

    return () => {
      cancelled = true;
    };
  }, [chatClient, channelId, channelType]);

  if (isLoadingChat || loadingChannels) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-gray-600">
        Loading chat...
      </div>
    );
  }

  if (!chatClient) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-gray-600">
        <div className="text-center">
          <p className="text-xl mb-2">Chat unavailable</p>
          <p className="text-sm">Please sign in to access chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gray-50">
      {/* Sidebar - Channel List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {channels.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No conversations yet
            </div>
          ) : (
            channels.map((ch) => {
              const otherMembers = Object.values(ch.state.members).filter(
                (m) => m.user?.id !== user.id
              );
              const otherUser = otherMembers[0]?.user;
              const isActive = ch.id === channelId;
              const unreadCount = ch.countUnread();

              return (
                <button
                  key={ch.id}
                  onClick={() => navigate(`/chat?channelId=${ch.id}&channelType=${ch.type}`)}
                  className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left transition-colors ${
                    isActive ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-gray-900 truncate">
                      {ch.data?.name || otherUser?.name || "Unknown"}
                    </div>
                    {unreadCount > 0 && (
                      <div className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                  {ch.state.messages.length > 0 && (
                    <div className="text-sm text-gray-500 truncate">
                      {ch.state.messages[ch.state.messages.length - 1].text || "No messages"}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {channel && chatClient && chatClient.userID ? (
          <Chat client={chatClient} theme="str-chat__theme-light">
            <Channel channel={channel}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        ) : (
          <div className="flex-1 grid place-items-center text-gray-400">
            <div className="text-center">
              <svg
                className="w-20 h-20 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-lg">Select a conversation</p>
              <p className="text-sm mt-1">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
