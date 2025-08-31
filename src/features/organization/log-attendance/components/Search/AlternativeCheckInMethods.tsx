import { Button } from "@/components/ui/button";
import { QrCodeIcon, UserIcon } from "lucide-react";

export function AlternativeCheckInMethods() {
  return (
    <div className="bg-muted/30 px-4 py-5 sm:px-6">
      {/* Desktop layout - full row */}
      <div className="hidden sm:flex sm:justify-between sm:items-center">
        <div className="text-sm font-medium text-muted-foreground">
          Alternative check-in methods
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9" disabled>
            <QrCodeIcon className="h-4 w-4 mr-2" />
            Scan QR
            <span className="text-xs ml-1 text-muted-foreground">(Soon)</span>
          </Button>
          <Button variant="outline" size="sm" className="h-9" disabled>
            <UserIcon className="h-4 w-4 mr-2" />
            Self Check-in
            <span className="text-xs ml-1 text-muted-foreground">(Soon)</span>
          </Button>
        </div>
      </div>

      {/* Mobile layout - stacked */}
      <div className="sm:hidden space-y-3">
        <div className="text-sm font-medium text-muted-foreground">
          Alternative check-in methods
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="h-10 w-full" disabled>
            <QrCodeIcon className="h-4 w-4 mr-2" />
            Scan QR
          </Button>
          <Button variant="outline" size="sm" className="h-10 w-full" disabled>
            <UserIcon className="h-4 w-4 mr-2" />
            Self Check-in
          </Button>
        </div>
        <div className="text-xs text-center text-muted-foreground">
          (Coming soon)
        </div>
      </div>
    </div>
  );
}
