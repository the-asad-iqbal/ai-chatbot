'use client';

import { updateChatVisibility } from '@/app/(chat)/actions';
import { VisibilityType } from '@/components/visibility-selector';
import { Chat } from '@/lib/db/schema';
import { useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';

type Chats = {
  chats: Chat[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalChats: number;
    totalPages: number;
    isLastPage: boolean;
  };
}

export function useChatVisibility({
  chatId,
  initialVisibility,
}: {
  chatId: string;
  initialVisibility: VisibilityType;
}) {
  const { mutate, cache } = useSWRConfig();
  const history: Chats = cache.get('/api/history')?.data;

  const { data: localVisibility, mutate: setLocalVisibility } = useSWR(
    `${chatId}-visibility`,
    null,
    {
      fallbackData: initialVisibility,
    },
  );

  const visibilityType = useMemo(() => {
    if (!history) return localVisibility;
    const chat = history?.chats?.find((chat) => chat.id === chatId);
    if (!chat) return 'private';
    return chat.visibility;
  }, [history, chatId, localVisibility]);

  const setVisibilityType = (updatedVisibilityType: VisibilityType) => {
    setLocalVisibility(updatedVisibilityType);

    mutate<Chats>(
      '/api/history',
      (history) => {
        return history
          ? {
            ...history,
            chats: history.chats.map((chat) => {
              if (chat.id === chatId) {
                return {
                  ...chat,
                  visibility: updatedVisibilityType,
                };
              }
              return chat;
            })
          }
          : <Chats>{};
      },
      { revalidate: false }
    );

    updateChatVisibility({
      chatId: chatId,
      visibility: updatedVisibilityType,
    });
  };

  return { visibilityType, setVisibilityType };
}
