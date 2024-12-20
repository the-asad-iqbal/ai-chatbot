import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info, Loader2 } from "lucide-react"

interface UpdateMemoryToolResultProps {
    savedMemory: {
        text: string;
    }
}

export function UpdateMemoryToolSkeleton() {
    return (
        <div className="flex items-center gap-2 p-3 rounded-md bg-muted/5">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground animate-pulse">
                Updating memory...
            </span>
        </div>
    )
}

export function UpdateMemoryToolResult({
    savedMemory,
}: UpdateMemoryToolResultProps) {
    return (
        <div className="group flex items-center gap-3 py-2 px-1 rounded-md bg-muted/55 hover:bg-muted/70 transition-colors">
            <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-help group-hover:text-primary">
                            <Info className="h-4 w-4 text-opacity-15 group-hover:text-primary" />
                            <span className="text-sm text-muted-foreground">
                                Memory Updated
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[300px]">
                        <div className="text-sm">
                            <span className="font-medium">Saved in memory:</span>
                            <p className="mt-1 text-muted-foreground">
                                {savedMemory.text}
                            </p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
