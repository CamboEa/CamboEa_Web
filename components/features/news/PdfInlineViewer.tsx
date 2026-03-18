'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

interface PdfInlineViewerProps {
  url: string;
}

export default function PdfInlineViewer({ url }: PdfInlineViewerProps) {
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  const renderPdf = useCallback(async () => {
    if (renderedRef.current) return;
    renderedRef.current = true;

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();

      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);

      const container = containerRef.current;
      if (!container) return;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const containerWidth = container.clientWidth || 800;

        const unscaledViewport = page.getViewport({ scale: 1 });
        // Render slightly larger than the container width so,
        // after scaling down to 100% width in CSS, the page appears taller.
        const scale = (containerWidth * 1.2) / unscaledViewport.width;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width * window.devicePixelRatio;
        canvas.height = viewport.height * window.devicePixelRatio;
        canvas.style.width = '100%';
        canvas.style.height = `${viewport.height}px`;
        canvas.className = 'mx-auto';

        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        container.appendChild(canvas);

        await page.render({ canvasContext: ctx, canvas, viewport }).promise;
      }

      setLoading(false);
    } catch (err) {
      console.error('PDF render error:', err);
      const message = 'មិនអាចបង្ហាញឯកសារ PDF បានទេ។';
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    renderPdf();
  }, [renderPdf]);

  if (error) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">កំពុងផ្ទុកឯកសារ PDF...</p>
        </div>
      )}
      <div
        ref={containerRef}
        className="flex flex-col gap-4 w-full"
      />
      {!loading && totalPages > 0 && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          ទំព័រសរុប: {totalPages}
        </p>
      )}
    </div>
  );
}
