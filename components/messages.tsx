import { ChatRequestOptions, Message } from 'ai';
import { PreviewMessage, ThinkingMessage } from './message';
import { Overview } from './overview';
import { UIBlock } from './block';
import { Dispatch, memo, SetStateAction, useEffect, useRef, useState } from 'react';
import { Vote } from '@/lib/db/schema';
import equal from 'fast-deep-equal';

interface MessagesProps {
  chatId: string;
  block: UIBlock;
  setBlock: Dispatch<SetStateAction<UIBlock>>;
  isLoading: boolean;
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}

function PureMessages({
  chatId,
  block,
  setBlock,
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

    // Always scroll to bottom when new messages are added or loading changes
    container.scrollTop = container.scrollHeight;
  }, [messages, isLoading]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setIsScrolledUp(!isNearBottom);
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
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 dark-rounded-scrollbar relative"
    >
      {messages.length === 0 && <Overview />}

      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          block={block}
          setBlock={setBlock}
          isLoading={isLoading && messages.length - 1 === index}
          vote={
            votes
              ? votes.find((vote) => vote.messageId === message.id)
              : undefined
          }
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
        />
      ))}

      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />
      }

      {isScrolledUp && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 
          bg-gray-800/70 hover:bg-gray-700/80 text-white 
          rounded-full p-2 shadow-lg transition-all duration-300 
          flex items-center justify-center z-50 
          hover:scale-110 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 animate-bounce"
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

      <div className="shrink-0 min-w-[24px] min-h-[24px]" />
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
