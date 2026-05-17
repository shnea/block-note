import {
  AddBlockButton,
  BlockColorsItem,
  DragHandleButton,
  RemoveBlockItem,
  SideMenu,
  SideMenuController,
  TableColumnHeaderItem,
  TableRowHeaderItem,
  FormattingToolbar,
  FormattingToolbarController,
  getFormattingToolbarItems,
  useActiveStyles,
  useBlockNoteEditor,
  useComponentsContext,
  useCreateBlockNote,
  useSelectedBlocks,
  useExtensionState,
  type FormattingToolbarProps
} from "@blocknote/react";
import { SideMenuExtension } from "@blocknote/core/extensions";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import type {
  FormEvent as ReactFormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent
} from "react";
import { parseBlocks, stringifyBlocks } from "../lib/json";
import { patchProseMirrorRenderSpec } from "../lib/patchProseMirrorRenderSpec";
import { schema, type CustomBlockNoteEditor } from "../lib/schema";
import {
  DEFAULT_FONT_SIZES,
  loadFontFamily,
  type FontFamilyOption,
  type FontSizeOption
} from "../lib/fonts";

patchProseMirrorRenderSpec();

const IMAGE_WIDTH_PRESET_50 = 1;
const IMAGE_WIDTH_PRESET_33 = 2;
const IMAGE_WIDTH_PRESET_100 = 3;
const MOVE_BLOCK_EVENT = "shnea-blocknote:move-block";

export type BlockNoteEditorProps = {
  value?: string;
  className?: string;
  editable?: boolean;
  fontFamilies?: readonly FontFamilyOption[];
  fontSizes?: readonly FontSizeOption[];
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

type FileLikeBlock = {
  id: string;
  type: string;
  props?: {
    url?: string;
    previewWidth?: number;
    textAlignment?: string;
  };
};

type ImageLikeBlock = FileLikeBlock & {
  type: "image";
};

function isTextInputBeforeInput(event: InputEvent): boolean {
  return (
    event.inputType === "insertText" ||
    event.inputType === "insertCompositionText" ||
    event.inputType === "insertFromComposition" ||
    event.inputType === "insertParagraph" ||
    event.inputType === "insertLineBreak"
  );
}

function isPrintableKey(event: ReactKeyboardEvent): boolean {
  return (
    event.key.length === 1 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey
  );
}

function getSelectedFileBlockId(root: HTMLElement): string | undefined {
  const selectedNode = root.querySelector(".ProseMirror-selectednode");
  const blockElement = selectedNode?.closest<HTMLElement>(".bn-block-outer[data-id]");

  if (!blockElement?.querySelector("[data-file-block]")) {
    return undefined;
  }

  return blockElement.dataset.id;
}

function getClickedFileBlockId(target: EventTarget | null): string | undefined {
  if (!(target instanceof HTMLElement)) {
    return undefined;
  }

  const fileElement = target.closest<HTMLElement>("[data-file-block]");
  const blockElement = fileElement?.closest<HTMLElement>(".bn-block-outer[data-id]");

  return blockElement?.dataset.id;
}

function getBlockIdFromTarget(target: EventTarget | null): string | undefined {
  if (!(target instanceof HTMLElement)) {
    return undefined;
  }

  const blockElement = target.closest<HTMLElement>(
    ".bn-block-outer[data-id], .bn-block[data-id]"
  );

  return blockElement?.dataset.id;
}

function getBlockElement(blockId: string): HTMLElement | undefined {
  return document.querySelector<HTMLElement>(
    `.bn-block-outer[data-id="${CSS.escape(blockId)}"]`
  ) ?? undefined;
}

function isInsideImageMenu(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest(".shnea-blocknote-image-menu"))
  );
}

function isImageBlock(block: FileLikeBlock | undefined): block is ImageLikeBlock {
  return block?.type === "image";
}

function getMovePlacement(
  blockId: string,
  clientY: number
): "before" | "after" {
  const blockElement = getBlockElement(blockId);
  if (!blockElement) {
    return "after";
  }

  const rect = blockElement.getBoundingClientRect();
  return clientY < rect.top + rect.height / 2 ? "before" : "after";
}

function isFileLikeBlockType(type: string): boolean {
  return type === "image" || type === "file" || type === "audio" || type === "video";
}

function FontFamilySelect({
  options
}: {
  options: readonly FontFamilyOption[];
}) {
  const Components = useComponentsContext()!;
  const editor = useBlockNoteEditor(schema);
  const activeStyles = useActiveStyles(editor);
  const selectedFont = options.find(
    (option) => option.value === activeStyles.fontFamily
  );

  if (!options.length) {
    return null;
  }

  return (
    <Components.Generic.Menu.Root position="bottom-start">
      <Components.Generic.Menu.Trigger>
        <Components.FormattingToolbar.Button
          className="bn-button"
          label={selectedFont?.label ?? "폰트"}
          mainTooltip="폰트"
          icon={<span className="shnea-toolbar-icon">F</span>}
        />
      </Components.Generic.Menu.Trigger>
      <Components.Generic.Menu.Dropdown>
        {options.map((option) => (
          <Components.Generic.Menu.Item
            key={option.key}
            checked={activeStyles.fontFamily === option.value}
            onClick={() => {
              if (activeStyles.fontFamily === option.value) {
                editor.removeStyles({ fontFamily: option.value });
                return;
              }

              loadFontFamily(option);
              editor.addStyles({ fontFamily: option.value });
            }}
          >
            {option.label}
          </Components.Generic.Menu.Item>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
}

function FontSizeSelect({ options }: { options: readonly FontSizeOption[] }) {
  const Components = useComponentsContext()!;
  const editor = useBlockNoteEditor(schema);
  const activeStyles = useActiveStyles(editor);
  const selectedSize = options.find((option) => option.value === activeStyles.fontSize);

  if (!options.length) {
    return null;
  }

  return (
    <Components.Generic.Menu.Root position="bottom-start">
      <Components.Generic.Menu.Trigger>
        <Components.FormattingToolbar.Button
          className="bn-button"
          label={selectedSize?.label ?? "크기"}
          mainTooltip="폰트 크기"
          icon={<span className="shnea-toolbar-icon">T</span>}
        />
      </Components.Generic.Menu.Trigger>
      <Components.Generic.Menu.Dropdown>
        {options.map((option) => (
          <Components.Generic.Menu.Item
            key={option.value}
            checked={activeStyles.fontSize === option.value}
            onClick={() => {
              if (activeStyles.fontSize === option.value) {
                editor.removeStyles({ fontSize: option.value });
                return;
              }

              editor.addStyles({ fontSize: option.value });
            }}
          >
            {option.label}
          </Components.Generic.Menu.Item>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
}

function CustomFormattingToolbar({
  fontFamilies,
  fontSizes,
  blockTypeSelectItems
}: FormattingToolbarProps & {
  fontFamilies: readonly FontFamilyOption[];
  fontSizes: readonly FontSizeOption[];
}) {
  const editor = useBlockNoteEditor(schema);
  const selectedBlocks = useSelectedBlocks(editor);
  const showTextStyleControls = selectedBlocks.some(
    (block) => !isFileLikeBlockType(block.type)
  );
  const defaultItems = getFormattingToolbarItems(blockTypeSelectItems);
  const colorButtonIndex = defaultItems.findIndex(
    (item) => item.key === "colorStyleButton"
  );
  const insertIndex = colorButtonIndex === -1 ? defaultItems.length : colorButtonIndex;

  return (
    <FormattingToolbar blockTypeSelectItems={blockTypeSelectItems}>
      {defaultItems.slice(0, insertIndex)}
      {showTextStyleControls ? (
        <>
          <FontFamilySelect options={fontFamilies} />
          <FontSizeSelect options={fontSizes} />
        </>
      ) : null}
      {defaultItems.slice(insertIndex)}
    </FormattingToolbar>
  );
}

function MoveBlockItem() {
  const Components = useComponentsContext()!;
  const block = useExtensionState(SideMenuExtension, {
    selector: (state) => state?.block
  });

  if (!block) {
    return null;
  }

  return (
    <Components.Generic.Menu.Item
      className="bn-menu-item"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent(MOVE_BLOCK_EVENT, {
            detail: { blockId: block.id }
          })
        );
      }}
    >
      Move
    </Components.Generic.Menu.Item>
  );
}

function CustomDragHandleMenu() {
  const Components = useComponentsContext()!;

  return (
    <Components.Generic.Menu.Dropdown
      className="bn-menu-dropdown bn-drag-handle-menu"
    >
      <RemoveBlockItem>Delete</RemoveBlockItem>
      <BlockColorsItem>Colors</BlockColorsItem>
      <MoveBlockItem />
      <TableRowHeaderItem>Header row</TableRowHeaderItem>
      <TableColumnHeaderItem>Header column</TableColumnHeaderItem>
    </Components.Generic.Menu.Dropdown>
  );
}

function CustomSideMenu() {
  return (
    <SideMenu>
      <AddBlockButton />
      <DragHandleButton dragHandleMenu={CustomDragHandleMenu} />
    </SideMenu>
  );
}

export const BlockNoteEditor = forwardRef<
  BlockNoteEditorHandle,
  BlockNoteEditorProps
>(function BlockNoteEditor(
  {
    value,
    className,
    editable = true,
    fontFamilies = [],
    fontSizes = DEFAULT_FONT_SIZES,
    onChange,
    uploadFile
  },
  ref
) {
  const initialContent = useMemo(() => parseBlocks(value), []);
  const onChangeRef = useRef(onChange);
  const lastAppliedValueRef = useRef(value);
  const [imageMenu, setImageMenu] = useState<{
    blockId: string;
    x: number;
    y: number;
  }>();
  const [moveBlockId, setMoveBlockId] = useState<string>();

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useCreateBlockNote({
    schema,
    initialContent,
    uploadFile: uploadFile ?? readFileAsDataUrl
  });

  const moveInputAfterSelectedFile = useCallback(
    (text?: string) => {
      const root = editor.domElement;
      if (!root) {
        return false;
      }

      const blockId = getSelectedFileBlockId(root);
      if (!blockId) {
        return false;
      }

      const selectedBlock = editor.getBlock(blockId);
      if (!selectedBlock) {
        return false;
      }

      const [paragraph] = editor.insertBlocks(
        [{ type: "paragraph", content: "" }],
        selectedBlock,
        "after"
      );
      editor.setTextCursorPosition(paragraph, "start");
      editor.focus();

      if (text) {
        editor.insertInlineContent(text);
      }

      return true;
    },
    [editor]
  );

  const handleBeforeInputCapture = useCallback(
    (event: ReactFormEvent<HTMLDivElement>) => {
      const nativeEvent = event.nativeEvent;
      if (!(nativeEvent instanceof InputEvent) || !isTextInputBeforeInput(nativeEvent)) {
        return;
      }

      if (moveInputAfterSelectedFile(nativeEvent.data ?? undefined)) {
        event.preventDefault();
      }
    },
    [moveInputAfterSelectedFile]
  );

  const handleKeyDownCapture = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.nativeEvent.isComposing) {
        return;
      }

      if (event.key !== "Enter" && !isPrintableKey(event)) {
        return;
      }

      if (moveInputAfterSelectedFile(event.key === "Enter" ? undefined : event.key)) {
        event.preventDefault();
      }
    },
    [moveInputAfterSelectedFile]
  );

  const handleClickCapture = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (isInsideImageMenu(event.target)) {
        return;
      }

      if (moveBlockId) {
        const targetBlockId = getBlockIdFromTarget(event.target);
        if (!targetBlockId || targetBlockId === moveBlockId) {
          setMoveBlockId(undefined);
          return;
        }

        const movingBlock = editor.getBlock(moveBlockId);
        const targetBlock = editor.getBlock(targetBlockId);
        if (!movingBlock || !targetBlock) {
          setMoveBlockId(undefined);
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const placement = getMovePlacement(targetBlockId, event.clientY);
        editor.transact(() => {
          const [removedBlock] = editor.removeBlocks([movingBlock]);
          if (removedBlock) {
            editor.insertBlocks([removedBlock as never], targetBlock, placement);
          }
        });
        setMoveBlockId(undefined);
        setImageMenu(undefined);
        return;
      }

      const blockId = getClickedFileBlockId(event.target);
      if (!blockId) {
        setImageMenu(undefined);
        return;
      }

      const block = editor.getBlock(blockId) as FileLikeBlock | undefined;
      if (isImageBlock(block)) {
        setImageMenu({
          blockId,
          x: event.clientX,
          y: event.clientY
        });
        return;
      }

      setImageMenu(undefined);

      return;
    },
    [editor, moveBlockId]
  );

  useEffect(() => {
    const handleMoveBlock = (event: Event) => {
      const blockId = (event as CustomEvent<{ blockId?: string }>).detail?.blockId;
      if (blockId) {
        setMoveBlockId(blockId);
        setImageMenu(undefined);
      }
    };

    window.addEventListener(MOVE_BLOCK_EVENT, handleMoveBlock);

    return () => {
      window.removeEventListener(MOVE_BLOCK_EVENT, handleMoveBlock);
    };
  }, []);

  const updateSelectedImageWidth = useCallback(
    (previewWidth: number | undefined) => {
      if (!imageMenu) {
        return;
      }

      const block = editor.getBlock(imageMenu.blockId) as FileLikeBlock | undefined;
      if (!isImageBlock(block)) {
        setImageMenu(undefined);
        return;
      }

      editor.updateBlock(block, {
        props: {
          previewWidth,
          textAlignment: "left"
        }
      } as never);
      setImageMenu(undefined);
    },
    [editor, imageMenu]
  );

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
    <div
      className="shnea-blocknote-editor-shell"
      onBeforeInputCapture={handleBeforeInputCapture}
      onKeyDownCapture={handleKeyDownCapture}
      onClickCapture={handleClickCapture}
    >
      <BlockNoteView
        editor={editor}
        className={mergeClassNames("shnea-blocknote-editor", className)}
        editable={editable}
        portalElements={{ default: null }}
        formattingToolbar={fontFamilies.length > 0 || fontSizes.length > 0 ? false : true}
        sideMenu={false}
      >
        <SideMenuController sideMenu={CustomSideMenu} />
        {fontFamilies.length > 0 || fontSizes.length > 0 ? (
          <FormattingToolbarController
            formattingToolbar={(props) => (
              <CustomFormattingToolbar
                {...props}
                fontFamilies={fontFamilies}
                fontSizes={fontSizes}
              />
            )}
          />
        ) : null}
      </BlockNoteView>
      {imageMenu ? (
        <div
          className="shnea-blocknote-image-menu"
          style={{ left: imageMenu.x, top: imageMenu.y }}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <button
              type="button"
              onClick={() => updateSelectedImageWidth(IMAGE_WIDTH_PRESET_33)}
          >
              33%
          </button>
          <button
            type="button"
            onClick={() => updateSelectedImageWidth(IMAGE_WIDTH_PRESET_50)}
          >
            50%
          </button>
          <button
            type="button"
            onClick={() => updateSelectedImageWidth(IMAGE_WIDTH_PRESET_100)}
          >
            100%
          </button>
          <button type="button" onClick={() => updateSelectedImageWidth(undefined)}>
            원본
          </button>
        </div>
      ) : null}
      {moveBlockId ? (
        <div className="shnea-blocknote-move-banner">
          Move: tap a destination block
          <button type="button" onClick={() => setMoveBlockId(undefined)}>
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  );
});
