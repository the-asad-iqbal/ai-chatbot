import { ChatRequestOptions, Message } from 'ai';
import { PreviewMessage, ThinkingMessage } from './message';
import { Overview } from './overview';
import { Dispatch, memo, SetStateAction, useEffect, useRef, useState } from 'react';
import { Vote } from '@/lib/db/schema';
import equal from 'fast-deep-equal';

export interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  votes?: Array<Vote>;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  isReadonly: boolean;
}

function PureMessages({
  chatId,
  isLoading,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
}: MessagesProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (!isScrolledUp) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isLoading, isScrolledUp]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom && isScrolledUp) {
      setIsScrolledUp(false);
    } else if (!isNearBottom && !isScrolledUp) {
      setIsScrolledUp(true);
    }
  };

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex flex-col min-w-0 gap-4 sm:gap-6 flex-1 overflow-y-scroll px-2 sm:px-4 pt-4 dark-rounded-scrollbar relative"
    >
      {messages.length === 0 && <Overview />}

      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={isLoading && messages.length - 1 === index}
          vote={votes?.find((vote) => vote.messageId === message.id)}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          messages={messages}
        />
      ))}

      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />
      }

      {isScrolledUp && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 
          bg-gray-800/70 hover:bg-gray-700/80 text-white 
          rounded-full p-2 sm:p-3 shadow-lg transition-all duration-300 
          flex items-center justify-center z-50 
          hover:scale-110 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-5 sm:size-6 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}

      <div className="shrink-0 min-w-[16px] sm:min-w-[24px] min-h-[16px] sm:min-h-[24px]" />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.isLoading && nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});
