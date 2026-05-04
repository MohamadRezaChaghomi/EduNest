// components/ui/Pagination.jsx
'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    let page;
    if (totalPages <= 5) page = i + 1;
    else if (currentPage <= 3) page = i + 1;
    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
    else page = currentPage - 2 + i;
    return page;
  });

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) onPageChange(page);
  };

  return (
    <div className="flex justify-center gap-2 mt-8" dir="ltr">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="صفحه قبل"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {currentPage > 3 && totalPages > 5 && (
        <>
          <Button variant="outline" size="sm" onClick={() => goToPage(1)}>1</Button>
          <span className="px-2">...</span>
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => goToPage(page)}
        >
          {page}
        </Button>
      ))}

      {currentPage < totalPages - 2 && totalPages > 5 && (
        <>
          <span className="px-2">...</span>
          <Button variant="outline" size="sm" onClick={() => goToPage(totalPages)}>
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="صفحه بعد"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
    </div>
  );
}