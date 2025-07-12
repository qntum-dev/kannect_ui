// "use client"
// import {
//     Sidebar,
//     SidebarContent,
//     SidebarFooter,
//     SidebarGroup,
//     SidebarHeader,
// } from "@/components/ui/sidebar"
// import { useAuthStore } from "../stores/auth-store"
// import Image from "next/image";
// import { LogOut, MessageSquareDiff, Sun } from "lucide-react";
// import { NewChatDialog } from "./new-chat-dialog";
// // import { useUserStore } from "./stores/user-store"
// // import { apiHandler } from "@/lib/api-handler"

// const conversations = [
//     {
//         id: 1,
//         name: "John Doe",
//         lastMessage: "Hey, how are you?",
//         time: "10:30 AM",
//     },
//     {
//         id: 2,
//         name: "Jane Smith",
//         lastMessage: "Let's catch up later.",
//         time: "9:15 AM",
//     },
//     {
//         id: 3,
//         name: "Alice Johnson",
//         lastMessage: "Did you finish the project?",
//         time: "Yesterday",
//     },
//     {
//         id: 4,
//         name: "Bob Brown",
//         lastMessage: "See you at the meeting.",
//         time: "Last week",
//     },

// ]

// export function ChatSidebar() {
//     const user = useAuthStore((state) => state.user);


//     return (
//         <Sidebar className="">
//             <SidebarHeader>
//                 <div className="flex justify-between items-center">
//                     <h1 className="text-2xl">Kannect</h1>
//                     <NewChatDialog />
//                     {/* <div className="bg-white p-2 rounded-md cursor-pointer">
//                         <MessageSquareDiff className="text-blue-600" size={20} />


//                     </div> */}
//                 </div>
//             </SidebarHeader>
//             <SidebarContent>
//                 <SidebarGroup />
//                 <div className="flex flex-col gap-3 w-full">

//                     {conversations.map((conversation) => (
//                         <div className="flex items-start py-2 px-3 justify-between cursor-pointer" key={conversation.id}>


//                             <div className="flex items-center gap-3 w-full">

//                                 <div className="">
//                                     <Image
//                                         src={user?.profileImgUrl || `https://avatar.iran.liara.run/username?username=[${conversation?.name}]`}
//                                         alt="Profile Picture"
//                                         width={72}
//                                         height={72}
//                                         className="rounded-full object-cover "
//                                     />
//                                 </div>

//                                 <div className="flex flex-col gap-1 justify-between w-full">
//                                     <div className="w-full flex justify-between">
//                                         <p className="text-lg">{conversation?.name}</p>
//                                         <div className="">
//                                             <p className="text-sm">{conversation.time}</p>
//                                         </div>
//                                     </div>

//                                     <p className="text-sm">{conversation?.lastMessage}</p>
//                                 </div>
//                             </div>



//                         </div>
//                     ))}
//                 </div>
//                 <SidebarGroup />
//             </SidebarContent>
//             <SidebarFooter>
//                 <div className="bg-white flex items-center py-2 px-3 rounded-full justify-between mx-10">


//                     <div className="flex items-center gap-3">

//                         <div className="">
//                             <Image
//                                 src={user?.profileImgUrl || `https://avatar.iran.liara.run/username?username=[${user?.name}]`}
//                                 alt="Profile Picture"
//                                 width={64}
//                                 height={64}
//                                 className="rounded-full object-cover "
//                             />
//                         </div>

//                         <div className="flex flex-col items-center">
//                             <div className="w-full">
//                                 <p className="text-black text-lg">{user?.name}</p>
//                             </div>

//                             <p className="text-blue-600 text-sm cursor-pointer">change your profile photo</p>
//                         </div>
//                     </div>

//                     <div className="flex items-center gap-1">

//                         <LogOut className="text-red-600" size={28} />
//                         <Sun className="text-blue-600" size={28} />
//                     </div>
//                 </div>
//             </SidebarFooter>
//         </Sidebar>
//     )
// }

"use client"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader
} from "@/components/ui/sidebar"
import { useAuthStore } from "../stores/auth-store"
import Image from "next/image";
import { LogOut, Moon, Sun } from "lucide-react";
import { NewChatDialog } from "./new-chat-dialog";
import ChatList from "../chat/ChatList";
import { useTheme } from "next-themes";

export function ChatSidebar() {
    const user = useAuthStore((state) => state.user);
    const { setTheme, theme } = useTheme()
    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });

        useAuthStore.getState().logout();

        window.location.href = '/';
    }
    return (
        <Sidebar>

            <SidebarHeader>
                <div className="flex justify-between items-center w-full mt-8">
                    <h1 className="text-2xl">Kannect</h1>
                    <NewChatDialog />
                </div>
            </SidebarHeader>
            <SidebarContent className="mx-4 lg:mx-7 mt-3">
                <ChatList />

            </SidebarContent>

            <SidebarFooter>
                <div className="bg-primary flex items-center py-2 px-3 rounded-full justify-between mx-2 lg:mx-8 mb-9">
                    <div className="flex items-center gap-3">
                        <div>
                            <Image
                                src={user?.profileImgUrl || `https://avatar.iran.liara.run/username?username=[${user?.name}]`}
                                alt="Profile Picture"
                                width={64}
                                height={64}
                                className="rounded-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-primary-foreground text-lg">{user?.name}</p>
                            <p className="text-secondary text-sm cursor-pointer">change profile photo</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="cursor-pointer" title="Logout" onClick={handleLogout}>

                            <LogOut className="text-red-600 " size={24} />
                        </div>
                        <div className="cursor-pointer" title={theme === 'dark' ? "Light Mode" : "Dark Mode"} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                            {
                                theme === 'dark' ? (
                                    <Sun className="text-blue-600" size={24} />
                                ) : (
                                    <Moon className="text-yellow-500" size={24} />
                                )
                            }
                        </div>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
