'use client';

import type {
  Attachment,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from 'ai';
import type React from 'react';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import { toast } from 'sonner';
import { useWindowSize } from 'usehooks-ts';
import { sanitizeUIMessages } from '@/lib/utils';
import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { SuggestedActions } from './suggested-actions';
import { ToolsPopover } from './tools-popover';
import equal from 'fast-deep-equal';

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
}: {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const [localInput, setLocalInput] = useState(input);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  useEffect(() => {
    setLocalInput(input);
  }, [input]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.rows = 2;
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  }, [width]);

  useEffect(() => {
    if (selectedTool === null) {
      return;
    }

    const newInput = selectedTool + ' ' + localInput;
    setLocalInput(newInput);
    setInput(newInput);
  }, [selectedTool]);

  // Add these helper functions at the beginning of PureMultimodalInput
  const isToolCommand = (text: string, position: number): { start: number; end: number } | null => {
    const tools = ['imagen', 'weather']; // Make sure this matches your tools array
    for (const tool of tools) {
      const startPos = text.toLowerCase().indexOf(tool.toLowerCase());
      if (startPos !== -1 && position >= startPos && position < startPos + tool.length) {
        return { start: startPos, end: startPos + tool.length };
      }
    }
    return null;
  };

  const removeToolFromInput = (text: string, toolId: string): string => {
    const toolIndex = text.toLowerCase().indexOf(toolId.toLowerCase());
    if (toolIndex === -1) return text;
    return text.slice(0, toolIndex) + text.slice(toolIndex + toolId.length);
  };
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.rows = 2;
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    const prevValue = localInput;
    const selectionStart = event.target.selectionStart;

    // Check if user is trying to modify a tool command
    const toolCommand = isToolCommand(prevValue, selectionStart - 1);

    if (toolCommand && prevValue.length > newValue.length) {
      // If user is trying to delete part of a tool command, remove the entire command
      const toolText = prevValue.slice(toolCommand.start, toolCommand.end);
      setSelectedTool(null);
      setLocalInput(removeToolFromInput(prevValue, toolText));
      setInput(removeToolFromInput(prevValue, toolText));
    } else {
      setLocalInput(newValue);
      setInput(newValue);
    }
    adjustHeight();
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(async () => {
    if (localInput.trim() === '') return;

    await handleSubmit(undefined, { experimental_attachments: attachments });
    window.history.replaceState({}, '', `/chat/${chatId}`);
    setAttachments([]);
    setLocalInput('');
    setInput('');
    setSelectedTool(null);
  }, [localInput, attachments, chatId, handleSubmit, setAttachments, setInput]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const renderHighlightedInput = () => {
    let displayText = localInput;
    const tools = ['imagen', 'weather'];

    for (const tool of tools) {
      const regex = new RegExp(tool, 'gi');
      displayText = displayText.replace(regex, `<span class="highlightedTool">${tool}</span>`);
    }

    return displayText;
  };

  return (
    <div className="relative w-full flex flex-col gap-4">
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <SuggestedActions append={append} chatId={chatId} />
        )}

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row gap-2 overflow-x-scroll items-end">
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <div
        className="dark:bg-[#161616] bg-[#494949] gap-4 p-4 w-full max-w-5xl sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto flex flex-col items-end rounded-xl cursor-text"
        onClick={() => textareaRef.current?.focus()}
      >
        <textarea
          ref={textareaRef}
          spellCheck={false}
          className="dark:bg-[#161616] bg-[#494949] text-white w-full resize-none outline-none transition-all duration-200 ease-in-out overflow-auto p-3 max-h-[200px] h-auto min-h-[50px] border-none no-scrollbar text-sm sm:text-base"
          placeholder="Ask me anything!"
          value={localInput}
          onChange={handleInput}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();

              if (isLoading) {
                toast.error('Please wait for the model to finish its response!');
              } else {
                submitForm();
              }
            }

            if (event.key === 'Backspace') {
              const toolCommand = isToolCommand(localInput, event.currentTarget.selectionStart);
              if (toolCommand) {
                event.preventDefault();
                const toolText = localInput.slice(toolCommand.start, toolCommand.end);
                setSelectedTool(null);
                setLocalInput(removeToolFromInput(localInput, toolText));
                setInput(removeToolFromInput(localInput, toolText));
              }
            }
          }}
        />
        <div
          className="absolute top-0 left-0 p-3 pointer-events-none text-sm sm:text-base"
          dangerouslySetInnerHTML={{ __html: renderHighlightedInput() }}
          style={{
            color: 'transparent',
            userSelect: 'none',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
        />
        <div className="flex flex-row justify-between items-center w-full gap-4 max-w-5xl sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
          <div className="flex gap-2">
            <AttachmentsButton fileInputRef={fileInputRef} isLoading={isLoading} />
            <ToolsPopover
              selectedTool={selectedTool}
              onToolSelect={handleToolSelect}
              isLoading={isLoading}
            />
          </div>

          {isLoading ? (
            <StopButton stop={stop} setMessages={setMessages} />
          ) : (
            <SendButton
              input={localInput}
              submitForm={submitForm}
              uploadQueue={uploadQueue}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;
    return true;
  },
);

function PureAttachmentsButton({
  fileInputRef,
  isLoading,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  isLoading: boolean;
}) {
  return (
    <Button
      className="cursor-pointer rounded-full size-10 border dark:border-zinc-600 bg-white text-black hover:bg-white/75 hover:text-black disabled:cursor-not-allowed"
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      variant="outline"
      disabled={isLoading}
    >
      <PaperclipIcon size={14} />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
  return (
    <Button
      className="cursor-pointer rounded-full size-10 border dark:border-zinc-600 bg-white text-black hover:bg-white/75 hover:text-black"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => sanitizeUIMessages(messages));
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      className="cursor-pointer rounded-full size-10 border dark:border-zinc-600 bg-white text-black hover:bg-white/75 hover:text-black"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.trim().length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
