export default function Loading() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}
      </div>
      <div className="h-64 bg-muted rounded-lg animate-pulse" />
    </div>
  );
}
