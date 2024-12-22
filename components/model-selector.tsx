'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';

import { saveModelId } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { models } from '@/lib/ai/models';
import { cn } from '@/lib/utils';

import { CheckCircleFillIcon, ChevronDownIcon } from './icons';

const groupModelsByProvider = () => {
  return models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, typeof models>);
};

export function ModelSelector({
  selectedModelId,
  className,
}: {
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] = useOptimistic(selectedModelId);

  const selectedModel = useMemo(
    () => models.find((model) => model.id === optimisticModelId),
    [optimisticModelId],
  );

  const groupedModels = useMemo(() => groupModelsByProvider(), []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button variant="outline" className="md:px-2 md:h-[34px]">
          {selectedModel?.label}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {Object.entries(groupedModels).map(([provider, providerModels]) => (
          <div key={provider}>
            <DropdownMenuLabel className="font-bold text-sm text-muted-foreground">
              {provider}
            </DropdownMenuLabel>
            {providerModels.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onSelect={() => {
                  setOpen(false);
                  startTransition(() => {
                    setOptimisticModelId(model.id);
                    saveModelId(model.id);
                  });
                }}
                className="gap-4 group/item flex flex-row justify-between items-center pl-6"
                data-active={model.id === optimisticModelId}
              >
                <div className="flex flex-col gap-1 items-start">
                  <div className="flex items-center gap-2">
                    {model.label}
                    {model.isBeta && (
                      <span className="px-2 text-[10px] font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        BETA
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-primary dark:text-secondary-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                  <CheckCircleFillIcon />
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
