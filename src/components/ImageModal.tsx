import type { KeyboardEvent, MouseEvent } from "react";
import { useEffect, useState } from "react";

type ImageModalProps = {
  src: string;
  alt?: string;
  onClose: () => void;
};

export function ImageModal({ src, alt = "", onClose }: ImageModalProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  const zoomOut = () => {
    setScale((currentScale) => Math.max(0.25, currentScale - 0.25));
  };

  const zoomIn = () => {
    setScale((currentScale) => Math.min(4, currentScale + 0.25));
  };

  const resetZoom = () => {
    setScale(1);
  };

  return (
    <div
      className="shnea-blocknote-modal"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <button
        className="shnea-blocknote-modal__close"
        type="button"
        aria-label="Close image preview"
        onClick={onClose}
      >
        x
      </button>
      <div className="shnea-blocknote-modal__toolbar">
        <button type="button" onClick={zoomOut} aria-label="Zoom out">
          -
        </button>
        <button type="button" onClick={resetZoom} aria-label="Reset zoom">
          {Math.round(scale * 100)}%
        </button>
        <button type="button" onClick={zoomIn} aria-label="Zoom in">
          +
        </button>
      </div>
      <div className="shnea-blocknote-modal__stage">
        <img
          className="shnea-blocknote-modal__image"
          src={src}
          alt={alt}
          style={{ transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );
}
