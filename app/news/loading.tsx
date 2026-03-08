// CamboEA - News Loading State

export default function NewsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">កំពុងផ្ទុកព័ត៌មាន...</p>
      </div>
    </div>
  );
}
