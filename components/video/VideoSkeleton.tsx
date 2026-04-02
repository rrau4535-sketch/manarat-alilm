// components/video/VideoSkeleton.tsx

export default function VideoSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      {/* Thumbnail skeleton */}
      <div className="w-full shimmer" style={{ paddingTop: '56.25%', position: 'relative' }}>
        <div className="absolute inset-0 shimmer" />
      </div>
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-3 w-20 shimmer rounded-full" />
        <div className="h-4 w-full shimmer rounded-lg" />
        <div className="h-4 w-3/4 shimmer rounded-lg" />
        <div className="h-3 w-24 shimmer rounded-full" />
      </div>
    </div>
  );
}

export function VideoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <VideoSkeleton key={i} />
      ))}
    </div>
  );
}
