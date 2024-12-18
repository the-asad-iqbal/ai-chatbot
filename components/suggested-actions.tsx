'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { memo } from 'react';
import {
  CloudSunIcon,
  ImageIcon,
  BookOpenIcon,
  FileTextIcon,
  CodeXml
} from 'lucide-react';

interface SuggestedAction {
  title: string;
  label: string;
  action: string;
  icon: React.ElementType;
}

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const suggestedActions: SuggestedAction[] = [
    {
      title: 'Check Weather',
      label: 'in Arifwala',
      action: 'What is the weather in Arifwala today?',
      icon: CloudSunIcon,
    },
    {
      title: 'Generate Image',
      label: 'Creative AI Art',
      action: 'Generate an image of a futuristic cityscape at sunset.',
      icon: ImageIcon,
    },
    {
      title: 'Essay',
      label: 'About Allama Iqbal',
      action: 'Help me draft a shortest essay about Allama Muhammad Iqbal.',
      icon: BookOpenIcon,
    },
    {
      title: 'Programming',
      label: 'Code Snippet',
      action: 'Write a JavaScript function to reverse a string?',
      icon: CodeXml,
    },
    {
      title: 'Creative Writing',
      label: 'Short Story Prompt',
      action: 'Help me create a short story about unexpected friendship.',
      icon: FileTextIcon,
    },
  ];

  const getRandomSuggestions = () => {
    const shuffled = [...suggestedActions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  };

  const randomSuggestions = getRandomSuggestions();

  return (
    <div className="grid sm:grid-cols-2 gap-2 w-full">
      {randomSuggestions.map((suggestedAction, index) => {
        const Icon = suggestedAction.icon;
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 * index }}
            key={`suggested-action-${suggestedAction.title}-${index}`}
          >
            <Button
              variant="ghost"
              onClick={async () => {
                window.history.replaceState({}, '', `/chat/${chatId}`);

                append({
                  role: 'user',
                  content: suggestedAction.action,
                });
              }}
              className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-2 sm:flex-col w-full h-auto justify-start items-start"
            >
              <Icon className="size-5 text-primary" />
              <div className="flex flex-col">
                <span className="font-medium">{suggestedAction.title}</span>
                <span className="text-muted-foreground text-xs">
                  {suggestedAction.label}
                </span>
              </div>
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);