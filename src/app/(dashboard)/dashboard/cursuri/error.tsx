"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-lg font-semibold mb-2">A apărut o eroare</h2>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      <button onClick={reset} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90">
        Încearcă din nou
      </button>
    </div>
  );
}
