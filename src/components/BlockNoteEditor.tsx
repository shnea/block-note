import {
  FormattingToolbar,
  FormattingToolbarController,
  getFormattingToolbarItems,
  useActiveStyles,
  useBlockNoteEditor,
  useComponentsContext,
  useCreateBlockNote,
  type FormattingToolbarProps
} from "@blocknote/react";
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
import { schema, type CustomBlockNoteEditor } from "../lib/schema";
import {
  DEFAULT_FONT_SIZES,
  loadFontFamily,
  type FontFamilyOption,
  type FontSizeOption
} from "../lib/fonts";

patchProseMirrorRenderSpec();

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
  const defaultItems = getFormattingToolbarItems(blockTypeSelectItems);
  const colorButtonIndex = defaultItems.findIndex(
    (item) => item.key === "colorStyleButton"
  );
  const insertIndex = colorButtonIndex === -1 ? defaultItems.length : colorButtonIndex;

  return (
    <FormattingToolbar blockTypeSelectItems={blockTypeSelectItems}>
      {defaultItems.slice(0, insertIndex)}
      <FontFamilySelect options={fontFamilies} />
      <FontSizeSelect options={fontSizes} />
      {defaultItems.slice(insertIndex)}
    </FormattingToolbar>
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

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useCreateBlockNote({
    schema,
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
      formattingToolbar={fontFamilies.length > 0 || fontSizes.length > 0 ? false : true}
    >
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
  );
});
