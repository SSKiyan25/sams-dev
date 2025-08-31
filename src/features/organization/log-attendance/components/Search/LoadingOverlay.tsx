export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
          <p className="mt-4 font-medium">Processing...</p>
        </div>
      </div>
    </div>
  );
}
