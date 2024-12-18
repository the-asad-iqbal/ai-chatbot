import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { ImageIcon, DownloadIcon } from 'lucide-react'
import Image from 'next/image'

export const ImageToolCallSkeleton: React.FC = () => (
    <div className="w-full p-4 bg-background border rounded-lg">
        <div className='flex gap-3'>
            <Skeleton className="h-10 w-10 rounded-full mb-2" />
            <Skeleton className="h-10 w-52 mb-2" />
        </div>
        <Skeleton className="h-96 w-[550px]" />
        <Skeleton className="h-50 w-[200px]" />
    </div>
)

export const ImageToolResponse: React.FC<{
    result: {
        url: string;
        prompt?: string;
    };
}> = ({ result }) => {
    return (
        <div className="w-full h-auto p-4 bg-background border rounded-lg space-y-4">
            <div className="flex items-center space-x-4">
                <div className="bg-green-500/10 p-2 rounded-full">
                    <ImageIcon className="text-green-500 size-6" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-sm">Image Generated</h3>
                    {result.prompt && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {result.prompt}
                        </p>
                    )}
                </div>
            </div>

            <div className="size-full relative">
                <Image
                    src={result.url}
                    alt={result.prompt || "Generated Image"}
                    width={654}
                    height={490}
                    className="rounded-lg object-cover"
                    sizes="h-96 (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <a
                    href={result.url}
                    download={result.prompt || "image.png"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 bg-white text-xs text-black p-1 rounded shadow-lg flex items-center space-x-1"
                >
                    <DownloadIcon className="size-4 text-black" />
                    <span>Download</span>
                </a>
            </div>
        </div>
    );
};
