// "use client"

// import { ChatData } from "@/lib/types";
// import { useCurrentChatStore } from "../stores/chat-store";
// import { startChat } from "@/app/actions/chat-actions";
// import Image from "next/image";
// import { useFindChatUser } from "@/app/hooks/chat";
// import { format, isToday, isYesterday, isThisWeek } from "date-fns";

// const ConversationCard = ({ chat }: { chat: ChatData }) => {
//     const { chat: activeChat, setCurrentChat: setActiveChat } = useCurrentChatStore();

//     const {
//         data: userData,
//         // isLoading: isUserLoading,
//         // error: userError,
//     } = useFindChatUser(chat.receiverId);
//     console.log(userData?.user?.profileImgUrl);

//     return (
//         <div
//             onClick={async () => {
//                 if (activeChat?.chat_id !== chat.chat_id) {
//                     const { status } = await startChat(chat.receiverId);
//                     if (status) {
//                         setActiveChat(chat);
//                     }
//                 }
//             }}
//             className={`flex items-start py-4 px-3 justify-between cursor-pointer rounded-lg transition-colors ${activeChat?.chat_id === chat.chat_id
//                 ? 'bg-[#092458] text-white'
//                 : 'hover:bg-[#1f2736]'
//                 }`}
//             key={chat.chat_id}
//         >
//             <div className="flex items-center gap-3 w-full">
//                 <div>
//                     <Image
//                         src={userData?.user?.profileImgUrl || `https://avatar.iran.liara.run/username?username=${encodeURIComponent(userData?.user?.name || chat.receiverName)}`}
//                         alt="Profile Picture"
//                         width={64}
//                         height={64}
//                         className="rounded-full object-cover"
//                     />
//                 </div>
//                 <div className="flex flex-col gap-1 justify-between w-full">
//                     <div className="w-full flex justify-between items-center">
//                         <p className="text-base font-medium truncate">
//                             {chat.receiverName}
//                         </p>
//                         {chat.latestMessageTime && (
//                             <p className="text-xs opacity-70">
//                                 {(() => {
//                                     const date = new Date(chat.latestMessageTime);
//                                     if (isToday(date)) {
//                                         return format(date, "hh:mm a");
//                                     } else if (isYesterday(date)) {
//                                         return "yesterday";
//                                     } else if (isThisWeek(date)) {
//                                         return format(date, "EEEE"); // full weekday name
//                                     } else {
//                                         return format(date, "dd/MM/yyyy"); // optional fallback
//                                     }
//                                 })()}
//                             </p>
//                         )}
//                     </div>
//                     {chat.latestMessage && (
//                         <p className="text-sm opacity-80 truncate">
//                             {chat.latestMessage}
//                         </p>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default ConversationCard;

"use client"

import { ChatData } from "@/lib/types";
import { useChatUserStore, useCurrentChatStore } from "../stores/chat-store";
import { startChat } from "@/app/actions/chat-actions";
import Image from "next/image";
import { useFindChatUser } from "@/app/hooks/chat";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { useEffect } from "react";

const ConversationCard = ({ chat }: { chat: ChatData }) => {
    const { chat: activeChat, setCurrentChat: setActiveChat } = useCurrentChatStore();

    const { data: userData } = useFindChatUser(chat.receiverId);

    const { addOrUpdateUser } = useChatUserStore();
    // store the user when available
    useEffect(() => {
        if (userData?.user) {
            addOrUpdateUser(userData.user);
        }
    }, [userData?.user, addOrUpdateUser]);

    return (
        <div
            onClick={async () => {
                if (activeChat?.chat_id !== chat.chat_id) {
                    const { status } = await startChat(chat.receiverId);
                    if (status) {
                        setActiveChat(chat);
                    }
                }
            }}
            className={`flex items-start py-4 px-3 justify-between cursor-pointer rounded-lg transition-colors ${activeChat?.chat_id === chat.chat_id
                ? 'bg-[#092458] text-white'
                : 'hover:bg-secondary'
                }`}
            key={chat.chat_id}
        >
            <div className="flex items-center gap-3 w-full">
                <div>
                    <Image
                        src={userData?.user?.profileImgUrl || `https://avatar.iran.liara.run/username?username=${encodeURIComponent(userData?.user?.name || chat.receiverName)}`}
                        alt="Profile Picture"
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                    />
                </div>
                <div className="flex flex-col gap-1 justify-between w-full">
                    <div className="w-full flex justify-between items-center">
                        <p className="text-base font-medium truncate" title={chat.receiverName}>
                            {chat.receiverName}
                        </p>
                        {chat.latestMessageTime && (
                            <p className="text-xs opacity-70">
                                {(() => {
                                    const date = new Date(chat.latestMessageTime);
                                    if (isToday(date)) {
                                        return format(date, "hh:mm a");
                                    } else if (isYesterday(date)) {
                                        return "yesterday";
                                    } else if (isThisWeek(date)) {
                                        return format(date, "EEEE");
                                    } else {
                                        return format(date, "dd/MM/yyyy");
                                    }
                                })()}
                            </p>
                        )}
                    </div>
                    {chat.latestMessage && (
                        <p className="text-sm opacity-80 truncate" title={chat.latestMessage}>
                            {chat.latestMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ConversationCard;
