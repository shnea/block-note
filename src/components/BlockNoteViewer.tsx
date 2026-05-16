import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect, useMemo, useState } from "react";
import { ImageModal } from "./ImageModal";
import { parseBlocks } from "../lib/json";
import { patchProseMirrorRenderSpec } from "../lib/patchProseMirrorRenderSpec";
import { schema } from "../lib/schema";
import { loadFontFamilies, type FontFamilyOption } from "../lib/fonts";

patchProseMirrorRenderSpec();

export type BlockNoteViewerProps = {
  value?: string;
  className?: string;
  fontFamilies?: readonly FontFamilyOption[];
  enableImageModal?: boolean;
};

function mergeClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export function BlockNoteViewer({
  value,
  className,
  fontFamilies = [],
  enableImageModal = true
}: BlockNoteViewerProps) {
  const initialContent = useMemo(() => parseBlocks(value), [value]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const editor = useCreateBlockNote({
    schema,
    initialContent
  });

  useEffect(() => {
    loadFontFamilies(fontFamilies);
  }, [fontFamilies]);

  useEffect(() => {
    const blocks = parseBlocks(value);

    if (!blocks) {
      return;
    }

    const current = JSON.stringify(editor.document);
    if (current !== value) {
      editor.replaceBlocks(editor.document, blocks);
    }
  }, [editor, value]);

  return (
    <div
      className="shnea-blocknote-viewer"
      onClick={(event) => {
        if (!enableImageModal) {
          return;
        }

        const target = event.target;
        if (target instanceof HTMLImageElement && target.currentSrc) {
          setSelectedImage(target.currentSrc);
        }
      }}
    >
      <BlockNoteView
        editor={editor}
        className={mergeClassNames("shnea-blocknote-viewer", className)}
        editable={false}
        theme="light"
        portalElements={{ default: null }}
        formattingToolbar={false}
        linkToolbar={false}
        slashMenu={false}
        emojiPicker={false}
        sideMenu={false}
        filePanel={false}
        tableHandles={false}
        comments={false}
      />
      {enableImageModal && selectedImage ? (
        <ImageModal
          src={selectedImage}
          alt="Expanded image"
          onClose={() => setSelectedImage(null)}
        />
      ) : null}
    </div>
  );
}
