'use client';

import type { ChatRequestOptions, Message } from 'ai';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { memo, useState, type Dispatch, type SetStateAction } from 'react';
import ReactMarkdown from 'react-markdown';

import type { Vote } from '@/lib/db/schema';

import type { UIBlock } from './block';
import { DocumentToolCall, DocumentToolResult } from './document';
import { PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import equal from 'fast-deep-equal';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { ImageToolCallSkeleton, ImageToolResponse } from './ImageTool';

const PurePreviewMessage = ({
  chatId,
  message,
  block,
  setBlock,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
  messages
}: {
  chatId: string;
  message: Message;
  block: UIBlock;
  setBlock: Dispatch<SetStateAction<UIBlock>>;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  messages: Array<Message>;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const currentIndex = messages.findIndex((m) => m.id === message.id);
  const previousMessage = currentIndex > 0 ? messages[currentIndex - 1] : null;

  const hasPreviousToolInvocation =
    previousMessage?.toolInvocations &&
    previousMessage.toolInvocations.length > 0;

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cn(
          'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
          {
            'w-full': mode === 'edit',
            'group-data-[role=user]/message:w-fit': mode !== 'edit',
          },
        )}
      >
        {message.role === 'assistant' && !hasPreviousToolInvocation && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border dark:text-white text-purple-500">
            <motion.div
              animate={isLoading ? {
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              } : {}}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <SparklesIcon size={14} />
            </motion.div>
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          {message.experimental_attachments && (
            <div className="flex flex-row justify-end gap-2">
              {message.experimental_attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url}
                  attachment={attachment}
                />
              ))}
            </div>
          )}

          {message.content && mode === 'view' && (
            <div className="flex flex-row gap-2 items-start">
              {message.role === 'user' && !isReadonly && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                      onClick={() => {
                        setMode('edit');
                      }}
                    >
                      <PencilEditIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit message</TooltipContent>
                </Tooltip>
              )}

              <div
                className={cn('flex flex-col gap-4 max-w-2xl w-auto text-gray-900 dark:text-gray-50', {
                  'bg-[#303030] text-gray-50 px-3 py-2 rounded-xl rounded-tr-none': message.role === 'user',
                })}
                style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
              >
                {message.role !== 'user' ? (<Markdown>{message.content as string}</Markdown>) : (<ReactMarkdown>{message.content as string}</ReactMarkdown>)}
              </div>
            </div>
          )}

          {message.content && mode === 'edit' && (
            <div className="flex flex-row gap-2 items-start">
              <div className="size-8" />

              <MessageEditor
                key={message.id}
                message={message}
                setMode={setMode}
                setMessages={setMessages}
                reload={reload}
              />
            </div>
          )}

          {message.toolInvocations && message.toolInvocations.length > 0 && (
            <div className="flex flex-col gap-4">
              {message.toolInvocations.map((toolInvocation) => {
                const { toolName, toolCallId, state, args } = toolInvocation;

                if (state === 'result') {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === 'getWeather' ? (
                        <Weather weatherAtLocation={result} />
                      ) : toolName === 'createDocument' ? (
                        <DocumentToolResult
                          type="create"
                          result={result}
                          block={block}
                          setBlock={setBlock}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'updateDocument' ? (
                        <DocumentToolResult
                          type="update"
                          result={result}
                          block={block}
                          setBlock={setBlock}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'requestSuggestions' ? (
                        <DocumentToolResult
                          type="request-suggestions"
                          result={result}
                          block={block}
                          setBlock={setBlock}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'generateImage' ? (
                        <ImageToolResponse result={result} />
                      ) : (
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                      )}
                    </div>
                  );
                }
                return (
                  <div
                    key={toolCallId}
                    className={cx({
                      skeleton: ['getWeather'].includes(toolName),
                    })}
                  >
                    {toolName === 'getWeather' ? (
                      <Weather />
                    ) : toolName === 'createDocument' ? (
                      <DocumentToolCall
                        type="create"
                        args={args}
                        setBlock={setBlock}
                        isReadonly={isReadonly}
                      />
                    ) : toolName === 'updateDocument' ? (
                      <DocumentToolCall
                        type="update"
                        args={args}
                        setBlock={setBlock}
                        isReadonly={isReadonly}
                      />
                    ) : toolName === 'requestSuggestions' ? (
                      <DocumentToolCall
                        type="request-suggestions"
                        args={args}
                        setBlock={setBlock}
                        isReadonly={isReadonly}
                      />
                    ) : toolName === 'generateImage' ? (
                      <ImageToolCallSkeleton key={toolCallId + state} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {!isReadonly && (
            <MessageActions
              key={`action-${message.id}`}
              chatId={chatId}
              message={message}
              vote={vote}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations,
      )
    )
      return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="size-4 rounded-full dark:bg-white bg-slate-700 animate-pulse"></div>
        </div>
      </div>
    </motion.div>
  );
};

