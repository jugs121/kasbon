"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-sm flex-col items-center gap-3 py-16 text-center">
      <p className="font-semibold">Yah, ada yang error</p>
      <p className="text-sm text-zinc-500">{error.message}</p>
      <button onClick={reset} className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white">
        Coba lagi
      </button>
    </main>
  );
}
