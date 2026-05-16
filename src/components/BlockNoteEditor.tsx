import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from "react";
import { parseBlocks, stringifyBlocks } from "../lib/json";
import { patchProseMirrorRenderSpec } from "../lib/patchProseMirrorRenderSpec";
import type { CustomBlockNoteEditor } from "../lib/schema";

patchProseMirrorRenderSpec();

export type BlockNoteEditorProps = {
  value?: string;
  className?: string;
  editable?: boolean;
  onChange?: (json: string) => void;
  uploadFile?: (file: File) => Promise<string>;
};

export type BlockNoteEditorHandle = {
  getEditor: () => CustomBlockNoteEditor;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

function mergeClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export const BlockNoteEditor = forwardRef<
  BlockNoteEditorHandle,
  BlockNoteEditorProps
>(function BlockNoteEditor(
  { value, className, editable = true, onChange, uploadFile },
  ref
) {
  const initialContent = useMemo(() => parseBlocks(value), []);
  const onChangeRef = useRef(onChange);
  const lastAppliedValueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useCreateBlockNote({
    initialContent,
    uploadFile: uploadFile ?? readFileAsDataUrl
  });

  useEffect(() => {
    if (value === undefined || value === lastAppliedValueRef.current) {
      return;
    }

    const blocks = parseBlocks(value);
    if (!blocks) {
      return;
    }

    const current = stringifyBlocks(editor.document);
    if (current !== value) {
      editor.replaceBlocks(editor.document, blocks);
    }

    lastAppliedValueRef.current = value;
  }, [editor, value]);

  useEffect(() => {
    const unsubscribe = editor.onChange(() => {
      const json = stringifyBlocks(editor.document);
      lastAppliedValueRef.current = json;
      onChangeRef.current?.(json);
    });

    return () => {
      unsubscribe?.();
    };
  }, [editor]);

  useImperativeHandle(
    ref,
    () => ({
      getEditor: () => editor
    }),
    [editor]
  );

  return (
    <BlockNoteView
      editor={editor}
      className={mergeClassNames("shnea-blocknote-editor", className)}
      editable={editable}
      portalElements={{ default: null }}
    />
  );
});
