import { Button } from "@/components/ui/button";

interface MembersPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function MembersPagination({
  currentPage,
  totalPages,
  onPageChange,
}: MembersPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-4">
      <nav className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          &lt;
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;

            // Logic for showing relevant page numbers
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
              if (i === 4) pageNum = totalPages;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
              if (i === 0) pageNum = 1;
            } else {
              pageNum = currentPage - 2 + i;
              if (i === 0) pageNum = 1;
              if (i === 4) pageNum = totalPages;
            }

            // Add ellipsis indicator
            if (
              (i === 1 && pageNum > 2) ||
              (i === 3 && pageNum < totalPages - 1)
            ) {
              return (
                <span key={`ellipsis-${i}`} className="px-2">
                  ...
                </span>
              );
            }

            return (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="h-8 w-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          &gt;
        </Button>
      </nav>
    </div>
  );
}
