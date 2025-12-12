export default function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gray-300/20 dark:bg-gray-700/20 rounded ${className}`} />
  );
}
