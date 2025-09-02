import { Loader2Icon } from "lucide-react";

interface LoginLoadingOverlayProps {
  message?: string;
}

export function LoginLoadingOverlay({
  message = "Logging you into the system, please wait...",
}: LoginLoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 sm:p-8 shadow-xl max-w-md w-full mx-auto text-center">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Loader2Icon className="h-8 w-8 text-primary animate-spin" />
          </div>

          <h3 className="text-xl font-semibold mb-2">
            Authentication in Progress
          </h3>

          <p className="text-muted-foreground mb-4">{message}</p>

          <div className="flex items-center justify-center space-x-2">
            <span className="inline-block h-2 w-2 bg-primary rounded-full animate-pulse"></span>
            <span className="inline-block h-2 w-2 bg-primary rounded-full animate-pulse delay-150"></span>
            <span className="inline-block h-2 w-2 bg-primary rounded-full animate-pulse delay-300"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
