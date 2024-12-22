import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    Wrench,
    ImageIcon,
    CloudSun,
    Check,
    type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Tool {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
    darkColor?: string;
}

const tools: Tool[] = [
    {
        id: "imagen",
        name: "Imagen",
        description: "Powerful Image generation with FLUX 1.",
        icon: ImageIcon,
        color: "#FF6B6B",
        darkColor: "#ff8f8f"
    },
    {
        id: "weather",
        name: "Weather",
        description: "Get the weather forecast.",
        icon: CloudSun,
        color: "#4ECDC4",
        darkColor: "#6fe7df"
    },
];

interface ToolsPopoverProps {
    selectedTool: string | null;
    onToolSelect: (toolId: string) => void;
    isLoading: boolean;
}

export function ToolsPopover({ selectedTool, onToolSelect, isLoading }: ToolsPopoverProps) {
    const getSelectedTool = () => tools.find(tool => tool.id === selectedTool);
    const selectedToolData = getSelectedTool();
    const ToolIcon = selectedToolData?.icon || Wrench;

    const handleToolClick = (toolId: string) => {
        if (selectedTool === toolId) {
            onToolSelect('');
        } else {
            onToolSelect(toolId);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    className={cn(
                        "cursor-pointer rounded-full size-8",
                        "transition-all duration-200 ease-in-out",
                        "shadow-sm hover:shadow-md",
                        selectedTool
                            ? "bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white dark:from-blue-600 dark:to-blue-700"
                            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "relative overflow-hidden",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900",
                        "sm:size-11"
                    )}
                    variant="ghost"
                    disabled={isLoading}
                    onClick={(e) => {
                        if (selectedTool && !isLoading) {
                            e.preventDefault();
                            handleToolClick(selectedTool);
                        }
                    }}
                    title={selectedTool ? `Selected: ${getSelectedTool()?.name}` : "Select a tool"}
                >
                    <ToolIcon
                        size={14}
                        className={cn(
                            "transition-all duration-200 ease-in-out",
                            selectedTool ? "text-white" : "text-current",
                            "sm:size-5"
                        )}
                        style={{
                            color: selectedToolData
                                ? `var(--tool-color, ${selectedTool ? '#fff' : selectedToolData.color})`
                                : undefined
                        }}
                    />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className={cn(
                    "w-[280px] sm:w-80 rounded-xl shadow-lg",
                    "border dark:border-zinc-800",
                    "bg-white dark:bg-zinc-900",
                    "p-4",
                    "animate-in fade-in-0 zoom-in-95",
                    "data-[side=bottom]:slide-in-from-top-2",
                    "data-[side=top]:slide-in-from-bottom-2"
                )}
                align="start"
                side="top"
                sideOffset={8}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="grid gap-4">
                    <div className="space-y-1.5">
                        <h4 className="font-semibold text-sm sm:text-base dark:text-zinc-100">
                            Available Tools
                        </h4>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                            Select a tool to help with your task
                        </p>
                    </div>

                    <div className="grid gap-2">
                        {tools.map((tool) => {
                            const Icon = tool.icon;
                            const isSelected = selectedTool === tool.id;

                            return (
                                <div
                                    key={tool.id}
                                    className={cn(
                                        "flex items-center space-x-3 rounded-xl p-2.5 sm:p-3",
                                        "cursor-pointer select-none",
                                        "transition-all duration-200 ease-in-out",
                                        "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                                        "active:scale-[0.98]",
                                        isSelected && "bg-zinc-100 dark:bg-zinc-800",
                                        "group"
                                    )}
                                    onClick={() => handleToolClick(tool.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleToolClick(tool.id);
                                        }
                                    }}
                                >
                                    <div
                                        className={cn(
                                            "p-2 rounded-lg",
                                            "transition-colors duration-200",
                                            isSelected
                                                ? "bg-white dark:bg-zinc-900 shadow-sm"
                                                : "bg-zinc-50 dark:bg-zinc-800"
                                        )}
                                        style={{
                                            backgroundColor: isSelected
                                                ? tool.color + '15'
                                                : undefined
                                        }}
                                    >
                                        <Icon
                                            size={20}
                                            style={{
                                                color: `var(--tool-color, ${window.matchMedia('(prefers-color-scheme: dark)').matches
                                                    ? tool.darkColor || tool.color
                                                    : tool.color
                                                    })`
                                            }}
                                            className="transition-transform duration-200 group-hover:scale-110"
                                        />
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium dark:text-zinc-100">
                                                {tool.name}
                                            </p>
                                            {isSelected && (
                                                <Check
                                                    size={14}
                                                    className="text-blue-500 dark:text-blue-400"
                                                />
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                            {tool.description}
                                        </p>
                                    </div>

                                    {isSelected && (
                                        <span className="absolute inset-0 rounded-xl ring-2 ring-blue-500/50 dark:ring-blue-400/50" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Optional: Add "No tools selected" state */}
                    {selectedTool && (
                        <div className="mt-2 pt-2 border-t dark:border-zinc-800">
                            <button
                                onClick={() => handleToolClick(selectedTool)}
                                className={cn(
                                    "w-full text-xs text-zinc-500 dark:text-zinc-400",
                                    "hover:text-zinc-600 dark:hover:text-zinc-300",
                                    "transition-colors duration-200"
                                )}
                            >
                                Click selected tool to deselect
                            </button>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}