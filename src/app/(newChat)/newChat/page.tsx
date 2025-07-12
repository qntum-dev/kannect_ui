"use client"
import { ChatSidebar } from "@/components/chatSideBar/chat-sidebar";
import CurrentChatNew from "@/components/newChatUi/CurrentChatNew";
import { ChatClientProvider } from "@/components/providers/ChatContextProvider";
import { useCurrentChatStore } from "@/components/stores/chat-store";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Page = () => {
    const { chat: activeChat } = useCurrentChatStore();
    console.log("active chat:", activeChat);


    return (
        <ChatClientProvider url="https://kannect-10.onrender.com">

            <div>
                <SidebarProvider>
                    <ChatSidebar />
                    <div className="md:hidden">
                        <SidebarTrigger />
                    </div>
                    <div className="w-full">
                        {activeChat ? (
                            <CurrentChatNew key={activeChat.chat_id} chat={activeChat} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                Select a chat to start messaging
                            </div>
                        )}
                    </div>
                </SidebarProvider>
            </div>
        </ChatClientProvider>
    );
}

export default Page;