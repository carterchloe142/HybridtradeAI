'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-black text-white p-4">
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold mb-4">Critical Error</h2>
          <div className="bg-red-900/50 p-4 rounded mb-4 max-w-lg overflow-auto">
            <p className="font-mono text-sm">{error.message}</p>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            onClick={() => reset()}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
