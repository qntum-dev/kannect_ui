import { useChatListInfiniteQuery } from "@/app/hooks/chat";
import { useChatClient } from "@/components/providers/ChatContextProvider";
import { ChatData, ChatListStreamRes } from "@/lib/types";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import ConversationCard from "../chatSideBar/conversation-card";

const ChatList = () => {
    const { ref, inView } = useInView();
    // const chatListClientRef = useRef<StreamInOut<newChat.ChatListStreamReq, newChat.ChatListStreamRes> | null>(null)

    // const [chatListClient, setChatListClient] = useState<StreamInOut<newChat.ChatListStreamReq, newChat.ChatListStreamRes> | null>(null)

    const queryClient = useQueryClient();
    const { chatListClient } = useChatClient();

    // Using react-intersection-observer for infinite scroll
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = useChatListInfiniteQuery();

    // Load more chats when the load more element comes into view
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

    // Extract all chats from all pages
    const allChats = data?.pages.flatMap(page =>
        page.success && page.chatList ? page.chatList : []
    ) || [];

    console.log(allChats);


    // Sort chats by latest message time (most recent first)
    const sortedChats = [...allChats].sort((a, b) => {
        if (!a.latestMessageTime) return 1;
        if (!b.latestMessageTime) return -1;
        return new Date(b.latestMessageTime).getTime() - new Date(a.latestMessageTime).getTime();
    });

    console.log(sortedChats);

    const handleIncomingChatListUpdate = useCallback((event: { data: string }) => {
        // console.log(event);

        try {
            const msg = JSON.parse(event.data) as ChatListStreamRes;
            console.log("Received msg", msg);

            // Check if this is a chat update
            if (msg) {
                queryClient.setQueryData(['chats', 'list'], (oldData: InfiniteData<{
                    success: boolean;
                    chatList?: ChatData[];
                }, unknown>) => {
                    if (!oldData) return oldData;

                    const pages = [...oldData.pages];
                    const updatedChatData = msg.data;

                    // Find if this chat already exists in any page
                    let chatExists = false;

                    const updatedPages = pages.map(page => {
                        if (!page.success || !page.chatList) return page;

                        const updatedChatList = page.chatList.map(chat => {
                            // console.log("old chat", chat);
                            // console.log("new chat", updatedChatData);
                            if (chat.chat_id === updatedChatData.chat_id) {
                                chatExists = true;
                                // console.log("old chat", chat);
                                // console.log("new chat", updatedChatData);


                                // Update existing chat with new data
                                // console.log({ ...chat, ...updatedChatData });

                                return { ...chat, ...updatedChatData };
                            }
                            return chat;
                        });

                        return { ...page, chatList: updatedChatList };
                    });
                    // console.log(chatExists);


                    // If chat doesn't exist, add it to the first page
                    if (!chatExists && updatedPages.length > 0 && updatedPages[0].success) {
                        updatedPages[0] = {
                            ...updatedPages[0],
                            chatList: [updatedChatData, ...(updatedPages[0].chatList || [])]
                        };
                    }

                    return {
                        ...oldData,
                        pages: updatedPages
                    };
                });
            }
        } catch (error) {
            console.error("Error handling chat list update:", error);
        }
    }, [queryClient]);

    // Listen to and handle incoming chat list updates
    useEffect(() => {
        if (!chatListClient) return;

        // console.log("initialized socket listrener");
        // console.log(chatListClient);

        if (chatListClient) {

            chatListClient.socket.on("message", handleIncomingChatListUpdate);

            // Cleanup listener on unmount
            return () => {
                chatListClient.socket.off("message", handleIncomingChatListUpdate);
            };
        }
    }, [chatListClient, handleIncomingChatListUpdate]);

    // useEffect(() => {
    //     console.log("Initializing chatlist for current user");
    //     console.log(chatClient);

    //     if (!chatClient) return;

    //     const initializeChatListCLient = async () => {
    //         try {
    //             console.log("Initializing chatlist for current user");
    //             const chatListClient = await chatClient.newChat.chatListStream()
    //             chatListClientRef.current = chatListClient;


    //             setChatListClient(chatListClient);
    //             chatListClientRef.current = chatListClient;

    //             chatListClient.socket.on("message", handleIncomingChatListUpdate);
    //         } catch (error) {
    //             console.error("Failed to initialize ChatListCLient:", error);
    //         }
    //     };

    //     initializeChatListCLient();

    //     return () => {
    //         const chatListClientInstance = chatListClientRef.current;
    //         console.log("Cleaning up chatlist instance for current user");

    //         if (chatListClientInstance?.socket) {
    //             chatListClientInstance.socket.off("message", handleIncomingChatListUpdate);
    //             chatListClientInstance.socket.close();
    //         }
    //     };
    // }, [chatClient, handleIncomingChatListUpdate]);

    return (
        <div className="flex flex-col overflow-y-auto gap-2">
            {isLoading ? (
                <div className="p-4 text-gray-500">Loading chats...</div>
            ) : error ? (
                <div className="p-4 text-red-500">Error loading chats</div>
            ) : sortedChats.length === 0 ? (
                <div className="p-4 text-gray-500">No chats found</div>
            ) : (
                <>
                    {/* {sortedChats.map((chat) => (
                        <div
                            onClick={async () => {
                                if (activeChat?.chat_id !== chat.chat_id) {
                                    const { status } = await startChat(chat.receiverId);
                                    if (status) {
                                        setActiveChat(chat);
                                    }
                                }
                            }}
                            className={`mb-2 p-4 rounded-lg cursor-pointer transition-colors ${activeChat?.chat_id === chat.chat_id
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                                }`}
                            key={chat.chat_id}
                        >
                            <div className="font-medium">{chat.receiverName}</div>
                            {chat.latestMessage && (
                                <div className="text-sm truncate opacity-80">
                                    {chat.latestMessage}
                                </div>
                            )}
                        </div>
                    ))} */}

                    {sortedChats.map((chat) => (
                        // <div
                        //     onClick={async () => {
                        //         if (activeChat?.chat_id !== chat.chat_id) {
                        //             const { status } = await startChat(chat.receiverId);
                        //             if (status) {
                        //                 setActiveChat(chat);
                        //             }
                        //         }
                        //     }}
                        //     className={`flex items-start py-2 px-3 justify-between cursor-pointer rounded-lg transition-colors ${activeChat?.chat_id === chat.chat_id
                        //         ? 'bg-blue-600 text-white'
                        //         : 'hover:bg-blue-100'
                        //         }`}
                        //     key={chat.chat_id}
                        // >
                        //     <div className="flex items-center gap-3 w-full">
                        //         <div>
                        //             <Image
                        //                 src={`https://avatar.iran.liara.run/username?username=${encodeURIComponent(chat.receiverName)}`}
                        //                 alt="Profile Picture"
                        //                 width={48}
                        //                 height={48}
                        //                 className="rounded-full object-cover"
                        //             />
                        //         </div>
                        //         <div className="flex flex-col gap-1 justify-between w-full">
                        //             <div className="w-full flex justify-between items-center">
                        //                 <p className="text-base font-medium truncate">
                        //                     {chat.receiverName}
                        //                 </p>
                        //                 {chat.latestMessageTime && (
                        //                     <p className="text-xs opacity-70">
                        //                         {new Date(chat.latestMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        //                     </p>
                        //                 )}
                        //             </div>
                        //             {chat.latestMessage && (
                        //                 <p className="text-sm opacity-80 truncate">
                        //                     {chat.latestMessage}
                        //                 </p>
                        //             )}
                        //         </div>
                        //     </div>
                        // </div>
                        <ConversationCard chat={chat} key={chat.chat_id} />
                    ))}


                    {/* Load more trigger element */}
                    <div
                        ref={ref}
                        className="py-4 text-center"
                    >
                        {isFetchingNextPage ? (
                            <span className="text-sm text-gray-500">Loading more...</span>
                        ) : hasNextPage ? (
                            <span className="text-sm text-gray-500">Scroll for more</span>
                        ) : sortedChats.length > 0 ? (
                            <span className="text-sm text-gray-500">No more chats</span>
                        ) : null}
                    </div>
                </>
            )}
        </div>
    );
}

export default ChatList;