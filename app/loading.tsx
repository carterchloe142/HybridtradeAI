import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground z-50">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primary/10 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground animate-pulse font-medium tracking-widest">INITIALIZING...</p>
    </div>
  )
}
