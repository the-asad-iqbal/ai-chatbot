'use client'

import { Button } from "@/components/ui/button"
import { BotIcon } from "@/components/icons"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Component() {

  const router = useRouter()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-primary p-2 text-secondary-foreground bg-zinc-900">
          <BotIcon />
        </div>
      </div>
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="text-lg text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-2">
        <Button className="bg-zinc-900 hover:bg-zinc-950" onClick={() => router.refresh()} variant="outline">
          Try again
        </Button>
        <Button asChild className="">
          <Link href="/" className="text-slate-500 hover:text-slate-600">Return home</Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Error 404
      </p>
    </div>
  )
}
