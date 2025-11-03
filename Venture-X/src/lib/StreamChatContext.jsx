/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useAuth } from "./AuthContext";
import { getChatToken } from "./api";

const StreamChatContext = createContext({
  chatClient: null,
  isLoadingChat: true,
});

export function StreamChatProvider({ children }) {
  const { user } = useAuth();
  const [chatClient, setChatClient] = useState(null);
  const [isLoadingChat, setIsLoadingChat] = useState(true);

  useEffect(() => {
    let client = null;
    let mounted = true;

    async function initChat() {
      if (!user?.id) {
        // If there's an existing client, disconnect it
        if (chatClient) {
          await chatClient.disconnectUser().catch(console.error);
        }
        setChatClient(null);
        setIsLoadingChat(false);
        return;
      }

      try {
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        if (!apiKey) {
          console.error("VITE_STREAM_API_KEY not found in environment");
          setIsLoadingChat(false);
          return;
        }

        // Initialize Stream Chat client
        client = StreamChat.getInstance(apiKey);

        // Check if already connected to avoid duplicate connections
        if (client.userID === user.id) {
          if (mounted) {
            setChatClient(client);
            setIsLoadingChat(false);
          }
          return;
        }

        // Disconnect if connected as a different user
        if (client.userID && client.userID !== user.id) {
          await client.disconnectUser().catch(console.error);
        }

        // Get token from backend
        const { token } = await getChatToken({
          userId: user.id,
          userName: user.user_metadata?.full_name || user.email,
          userEmail: user.email,
        });

        // Connect user to Stream
        await client.connectUser(
          {
            id: user.id,
            name: user.user_metadata?.full_name || user.email,
            email: user.email,
          },
          token
        );

        if (mounted) {
          setChatClient(client);
          setIsLoadingChat(false);
        }
      } catch (error) {
        console.error("Error initializing Stream Chat:", error);
        if (mounted) {
          setIsLoadingChat(false);
        }
      }
    }

    initChat();

    return () => {
      mounted = false;
      // Don't disconnect here - let the next effect handle it
      // This prevents issues during hot reloading
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only depend on user.id to avoid unnecessary reconnections

  return (
    <StreamChatContext.Provider value={{ chatClient, isLoadingChat }}>
      {children}
    </StreamChatContext.Provider>
  );
}

export function useStreamChat() {
  return useContext(StreamChatContext);
}
