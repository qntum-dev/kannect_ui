'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, ChatData } from '@/lib/types';
import { useChatMessages } from '@/app/hooks/chat';
import { useVirtualizer } from '@tanstack/react-virtual';
import { newChat, StreamInOut } from '@/lib/chatClient';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import { useChatClient } from '../providers/ChatContextProvider';
import ActiveChatHeaderCard from '../ActiveChatHeaderCard';
import ChatInputBox from '../ChatInputBox';

const CurrentChat = ({ chat }: { chat: ChatData }) => {
    const [newMessage, setNewMessage] = useState('');
    const [dmClient, setDmClient] = useState<StreamInOut<newChat.ReceiveMessage, newChat.SendMessage> | null>(null);
    const dmClientRef = useRef<StreamInOut<newChat.ReceiveMessage, newChat.SendMessage> | null>(null);


    const scrollMetaRef = useRef<{
        prevScrollHeight: number;
        prevScrollTop: number;
    } | null>(null);

    const parentRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const isInitialLoadRef = useRef(true);
    const shouldScrollToBottomRef = useRef(true);
    const chatIdRef = useRef(chat.chat_id);
    const { chatClient, chatListClient } = useChatClient();

    // Reset refs when chat changes
    useEffect(() => {
        if (chatIdRef.current !== chat.chat_id) {
            isInitialLoadRef.current = true;
            shouldScrollToBottomRef.current = true;
            chatIdRef.current = chat.chat_id;
        }
    }, [chat.chat_id]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isSuccess,
    } = useChatMessages(chat.chat_id);

    // Process messages
    const allMessages = data?.pages.flatMap(page => page) || [];
    // The reversal ensures oldest messages at beginning and newest at end
    const messages = [...allMessages].reverse();

    const rowVirtualizer = useVirtualizer({
        count: messages.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 60,
        overscan: 5, // Increase overscan for smoother scrolling
    });

    useEffect(() => {
        console.log("mounted current chat for:", chat.chat_id);

        return () => {
            console.log("unmounted current chat for:", chat.chat_id);
        };
    }, [chat.chat_id]);

    const loadMore = useCallback(async () => {
        if (isFetchingNextPage || !hasNextPage || !parentRef.current) return;

        const el = parentRef.current;
        shouldScrollToBottomRef.current = false;

        // Save current scroll position before fetching
        scrollMetaRef.current = {
            prevScrollHeight: el.scrollHeight,
            prevScrollTop: el.scrollTop,
        };

        await fetchNextPage();
    }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

    // Handle scroll positioning after data changes
    useEffect(() => {
        const el = parentRef.current;
        if (!el) return;

        // Initial load - scroll to bottom
        if (isInitialLoadRef.current && isSuccess && messages.length > 0) {
            console.log("Initial load - scrolling to bottom");
            el.scrollTop = el.scrollHeight;
            isInitialLoadRef.current = false;
            return;
        }

        // After fetching more data - maintain position
        const meta = scrollMetaRef.current;
        if (meta && !shouldScrollToBottomRef.current) {
            // Calculate how much new content was added at the top
            const heightDiff = el.scrollHeight - meta.prevScrollHeight;
            // Adjust scroll position to account for new content
            el.scrollTop = meta.prevScrollTop + heightDiff;
            scrollMetaRef.current = null;
        } else if (shouldScrollToBottomRef.current) {
            // New message was added - scroll to bottom
            console.log("New message - scrolling to bottom");
            el.scrollTop = el.scrollHeight;
            shouldScrollToBottomRef.current = false;
        }
    }, [messages.length, isSuccess]);

    // Listen for scroll near top to load older messages
    useEffect(() => {
        const el = parentRef.current;
        if (!el) return;

        const onScroll = () => {
            if (el.scrollTop <= 30 && !isFetchingNextPage && hasNextPage) {
                loadMore();
            }
        };

        el.addEventListener("scroll", onScroll);
        return () => el.removeEventListener("scroll", onScroll);
    }, [loadMore, isFetchingNextPage, hasNextPage]);

    const handleIncomingMessage = useCallback((event: { data: string }) => {
        try {
            const incoming: Message = JSON.parse(event.data);
            console.log("Received message:", incoming);

            queryClient.setQueryData(['chatMessages', chat.chat_id], (oldData: InfiniteData<Message[], unknown> | undefined) => {
                if (!oldData) {
                    // If no data exists, create initial structure
                    return {
                        pages: [[incoming]],
                        pageParams: [Date.now()]
                    } as InfiniteData<Message[], unknown>;
                }

                const newPages = [...oldData.pages];
                const firstPageIndex = 0; // Messages come in newest first, so add to first page

                // Remove optimistic temp messages with the same content
                const cleanedMessages = newPages[firstPageIndex].filter(
                    (msg: Message) => !(msg.id?.startsWith('temp-'))
                );

                // Add new message at beginning of first page (newest first order)
                newPages[firstPageIndex] = [incoming, ...cleanedMessages];

                return { ...oldData, pages: newPages };
            });



            // Always scroll to bottom for new messages
            shouldScrollToBottomRef.current = true;

        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    }, [chat.chat_id, queryClient]);

    useEffect(() => {
        if (!chatClient || !chat?.chat_id) return;

        const initializeDM = async () => {
            try {
                console.log("Initializing DM for chat:", chat.chat_id);
                const dmClient = await chatClient.newChat.privateChat({ chatID: chat.chat_id });

                setDmClient(dmClient);
                dmClientRef.current = dmClient;

                dmClient.socket.on("message", handleIncomingMessage);
            } catch (error) {
                console.error("Failed to initialize DM:", error);
            }
        };

        initializeDM();

        return () => {
            const dmClientInstance = dmClientRef.current;
            console.log("Cleaning up DM instance for chat:", chat.chat_id);

            if (dmClientInstance?.socket) {
                dmClientInstance.socket.off("message", handleIncomingMessage);
                dmClientInstance.socket.close();
            }
        };
    }, [chatClient, chat.chat_id, handleIncomingMessage]);



    const handleSendMessage = async () => {
        if (!newMessage.trim() || !dmClient) return;

        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`, // Temporary ID
            content: newMessage,
            senderId: 'me', // Or your user ID
            timestamp: new Date(),
        };


        // Optimistically update the cache
        queryClient.setQueryData(['chatMessages', chat.chat_id], (oldData: InfiniteData<Message[], unknown> | undefined) => {
            if (!oldData) {
                return {
                    pages: [[optimisticMessage]],
                    pageParams: [Date.now()]
                } as InfiniteData<Message[], unknown>;
            }

            const newPages = [...oldData.pages];
            // Add to first page as our API returns newest first
            newPages[0] = [optimisticMessage, ...newPages[0]];

            return { ...oldData, pages: newPages };
        });

        try {
            await dmClient.send({ message: newMessage });
            chatListClient?.send({
                chat_id: chat.chat_id,
                latestMessage: newMessage,
                latestMessageTime: Date.now(),
                receiverId: chat.receiverId,
                receiverName: chat.receiverName
            })
            console.log("Message sent:", newMessage);
        } catch (error) {
            console.error("Failed to send message:", error);
            // You could add error handling here to remove the optimistic message
        }

        setNewMessage('');

        // Set flag to scroll to bottom after render
        shouldScrollToBottomRef.current = true;
    };

    return (
        <div className="">
            <div className="">
                <ActiveChatHeaderCard />
            </div>
            <div
                ref={parentRef}
                className="h-[70dvh] w-full overflow-auto rounded mb-4 flex-1"
                style={{ position: "relative" }}
            >
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: "100%",
                        position: "relative",
                    }}
                >
                    {messages.length === 0 && (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            No messages yet. Start a conversation!
                        </div>
                    )}

                    {/* {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const message = messages[virtualRow.index];
                        const isCurrentUser = message.senderId !== chat.receiverId;

                        return (
                            <div
                                key={message.id || virtualRow.index}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                    padding: "4px 8px",
                                    boxSizing: "border-box",
                                }}
                                className="py-0.5" // add vertical breathing room
                            >
                                <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} w-full px-2`}>
                                    <div className={`p-2 rounded-md  ${isCurrentUser
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-black'
                                        }`}>
                                        <p className="text-w">

                                            {message?.content || ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })} */}
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const message = messages[virtualRow.index];
                        const isCurrentUser = message.senderId !== chat.receiverId;

                        return (
                            <div
                                key={message.id || virtualRow.index}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                    padding: "4px 8px",
                                    boxSizing: "border-box",
                                }}
                                className="py-0.5"
                            >
                                <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} w-full px-2`}>
                                    <div className={`px-4 py-2 rounded-2xl max-w-[70%] break-words ${isCurrentUser
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-black'
                                        }`}>
                                        <p className="text-sm">
                                            {message?.content || ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>

            {/* <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md mx-12">
                <div className="flex-1 relative">
                    <input
                        className="w-full border-none focus:ring-0 focus:outline-none text-base bg-transparent text-black placeholder-transparent caret-accent"
                        placeholder="Type a message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                    />
                    {!newMessage && (
                        <div
                            className="absolute top-0 left-[-1] pointer-events-none select-none text-[#8696A0]"
                        // style={{
                        //     fontSize: '16px',
                        //     lineHeight: '28px', // Match the input's line-height
                        //     color: '#8696A0',
                        //     mixBlendMode: 'multiply', // This creates the overlapping effect
                        //     opacity: '0.8',
                        // }}
                        >
                            Type a message
                        </div>
                    )}
                </div>
                <button
                    onClick={handleSendMessage}
                    className="ml-2 bg-[#0a2259] hover:bg-[#0a1e4d] text-white p-2 rounded-full transition-colors cursor-pointer" title='Send Message'
                >
                    <SendHorizonal size={24} />
                </button>
            </div> */}
            <div className="">

                <ChatInputBox newMessage={newMessage} setNewMessage={setNewMessage} handleSendMessage={handleSendMessage} />
            </div>



        </div>
    );
};

export default CurrentChat;