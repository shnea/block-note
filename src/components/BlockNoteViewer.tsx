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

type FileLikeBlock = {
  id: string;
  type: string;
  props?: {
    url?: string;
  };
};

function mergeClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function getClickedFileBlockId(target: EventTarget | null): string | undefined {
  if (!(target instanceof HTMLElement)) {
    return undefined;
  }

  const fileElement = target.closest<HTMLElement>("[data-file-block]");
  const blockElement = fileElement?.closest<HTMLElement>(".bn-block-outer[data-id]");

  return blockElement?.dataset.id;
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
        const target = event.target;
        if (enableImageModal && target instanceof HTMLImageElement && target.currentSrc) {
          setSelectedImage(target.currentSrc);
          return;
        }

        const blockId = getClickedFileBlockId(target);
        if (!blockId) {
          return;
        }

        const block = editor.getBlock(blockId) as FileLikeBlock | undefined;
        const url = block?.props?.url;
        if (url && block.type === "file") {
          window.open(url, "_blank", "noopener,noreferrer");
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
