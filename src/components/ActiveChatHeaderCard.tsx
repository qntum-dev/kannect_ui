"use client"

import Image from "next/image";
import { useChatUserStore, useCurrentChatStore } from "./stores/chat-store";

const ActiveChatHeaderCard = () => {
    const { chat: activeChat } = useCurrentChatStore();
    const { userList } = useChatUserStore();
    const user = userList.find(u => u.id === activeChat?.receiverId);


    return (
        <div>
            {activeChat ? (
                <div className="flex items-center gap-3 p-2  shadow-md bg-card border-b">
                    <Image
                        src={user?.profileImgUrl || `https://avatar.iran.liara.run/username?username=${encodeURIComponent(activeChat.receiverName)}`}
                        alt="Profile"
                        width={56}
                        height={56}
                        className="rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                        <p className="text-lg font-semibold">{activeChat.receiverName}</p>
                        {/* <p className="text-sm text-gray-500">Active Chat</p> */}
                    </div>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                    Select a chat to start messaging
                </div>
            )}
        </div>
    );
}

export default ActiveChatHeaderCard;