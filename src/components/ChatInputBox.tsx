import React, { useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { SendHorizonal } from 'lucide-react';

const ChatInputBox = ({ newMessage, setNewMessage, handleSendMessage }: {
    newMessage: string,
    setNewMessage: Dispatch<SetStateAction<string>>,
    handleSendMessage: () => void
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);


    // Extract auto-resize logic to a separate function
    const resizeTextarea = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = '40px'; // Reset to minimum height
            const scrollHeight = textarea.scrollHeight;
            const maxHeight = 200; // 8 lines approximately

            if (scrollHeight <= maxHeight) {
                textarea.style.height = `${scrollHeight}px`;
                textarea.style.overflowY = 'hidden';
            } else {
                textarea.style.height = `${maxHeight}px`;
                textarea.style.overflowY = 'auto';
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNewMessage(value);
        resizeTextarea();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Resize on mount and when newMessage changes externally
    useEffect(() => {
        resizeTextarea();
    }, [newMessage]);

    return (
        <div className="w-full mx-auto relative">
            {/* Message Input Container - Fixed at bottom */}
            <div className="absolute bottom-0 left-0 right-0 border-t bg-secondary">
                <div className=" mx-auto p-4">
                    <div className="flex items-end bg-white rounded-md px-4 py-2 shadow-md mx-12">
                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                className="w-full border-none focus:ring-0 focus:outline-none text-base bg-transparent text-black placeholder-transparent caret-accent resize-none leading-6"
                                placeholder="Type a message"
                                value={newMessage}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                style={{
                                    minHeight: '40px',
                                    height: '40px',
                                    lineHeight: '20px',
                                    padding: '10px 0',
                                    fontSize: '16px',
                                }}
                            />
                            {!newMessage && (
                                <div
                                    className="absolute top-0 left-0 pointer-events-none select-none text-[#8696A0]"
                                    style={{
                                        fontSize: '16px',
                                        // lineHeight: '40px', // Match the textarea's initial height
                                        color: '#8696A0',
                                        padding: '10px 0',
                                    }}
                                >
                                    Type a message
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleSendMessage}
                            className="ml-2 bg-[#0a2259] hover:bg-[#0a1e4d] text-white p-2 rounded-full transition-colors cursor-pointer flex-shrink-0"
                            title="Send Message"
                        >
                            <SendHorizonal size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Spacer to prevent content from being hidden behind fixed input */}
            <div className="h-20"></div>
        </div>
    );
};

export default ChatInputBox;