import type { KeyboardEvent, MouseEvent } from "react";

type ImageModalProps = {
  src: string;
  alt?: string;
  onClose: () => void;
};

export function ImageModal({ src, alt = "", onClose }: ImageModalProps) {
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
      <img className="shnea-blocknote-modal__image" src={src} alt={alt} />
    </div>
  );
}
