"use client";

import { useChatMessages } from "@/app/hooks/chat";
import Client, { newChat, StreamInOut } from "@/lib/chatClient";
import { StartChatData, Message } from "@/lib/types";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuthStore } from "../stores/auth-store";

const chatClient = new Client(process.env.NEXT_PUBLIC_CHAT_URL!);

const ActiveChatWindow = ({ chat }: { chat: StartChatData }) => {
    const [newMessage, setNewMessage] = useState("");
    const [liveMessages, setLiveMessages] = useState<Message[]>([]);
    const { user } = useAuthStore();
    const {
        data,

        status,
    } = useChatMessages(chat.chat_id);

    const allMessages = useMemo(() => {
        const dbMessages = data?.pages.flat() ?? [];
        console.log(dbMessages);
        return [...dbMessages, ...liveMessages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        // console.log(data);

    }, [data, liveMessages]);

    const setupDMClient = useCallback(async () => {
        console.log(chat);

        const dm = await chatClient.newChat.privateChat({ chatID: chat.chat_id, userID: user!.id });

        const handleMessage = (data: { data: string }) => {
            const parsedData = JSON.parse(data.data) as Message;
            console.log(parsedData);

            console.log("Incoming:", parsedData.content);

            setLiveMessages((prev) => [...prev, parsedData]);
        };

        dm.socket.on("message", handleMessage);

        return dm;
    }, [chat, user]);

    const [dmClient, setDmClient] = useState<StreamInOut<newChat.ReceiveMessage, newChat.SendMessage> | null>(null);

    useEffect(() => {
        setupDMClient().then(setDmClient);
    }, [setupDMClient]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        if (!(dmClient)) return;

        const messageObj: Message = {
            id: crypto.randomUUID(), // temporary ID (or handled on server later)
            senderId: "me", // or from auth
            content: newMessage,
            timestamp: new Date(),
        };

        // Optimistically add to liveMessages
        setLiveMessages((prev) => [...prev, messageObj]);

        await dmClient.send({ message: newMessage });

        setNewMessage("");
    };

    return (
        <div className="flex flex-col h-full ">
            <div className="flex-1 overflow-y-auto mb-4">
                {status === "pending" && <p>Loading messages...</p>}
                {status === "error" && <p>Failed to load messages.</p>}

                <ul>
                    {allMessages.map((msg) => (
                        <li key={msg.id}>
                            {/* {JSON.stringify(msg)} */}

                            <strong>{msg.senderId == chat.receiverId ? chat.receiverName : "me"}</strong>: {msg.content}
                            <br />
                            <small>{new Date(msg.timestamp).toLocaleString()}</small>
                        </li>
                    ))}
                </ul>


            </div>

            <div className="flex">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="border p-2 flex-1 rounded-l"
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white p-2 rounded-r"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ActiveChatWindow;
