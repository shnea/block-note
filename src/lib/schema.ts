import { BlockNoteSchema, createStyleSpec } from "@blocknote/core";

const fontFamilyStyle = createStyleSpec(
  {
    type: "fontFamily",
    propSchema: "string"
  },
  {
    render: (value) => {
      const span = document.createElement("span");
      span.dataset.shneaFontFamily = value;
      span.style.fontFamily = value;

      return {
        dom: span,
        contentDOM: span
      };
    },
    toExternalHTML: (value) => {
      const span = document.createElement("span");
      span.style.fontFamily = value;

      return {
        dom: span,
        contentDOM: span
      };
    },
    parse: (element) => {
      return element.dataset.shneaFontFamily || element.style.fontFamily || undefined;
    }
  }
);

const fontSizeStyle = createStyleSpec(
  {
    type: "fontSize",
    propSchema: "string"
  },
  {
    render: (value) => {
      const span = document.createElement("span");
      span.dataset.shneaFontSize = value;
      span.style.fontSize = value;

      return {
        dom: span,
        contentDOM: span
      };
    },
    toExternalHTML: (value) => {
      const span = document.createElement("span");
      span.style.fontSize = value;

      return {
        dom: span,
        contentDOM: span
      };
    },
    parse: (element) => {
      return element.dataset.shneaFontSize || element.style.fontSize || undefined;
    }
  }
);

export const schema = BlockNoteSchema.create().extend({
  styleSpecs: {
    fontFamily: fontFamilyStyle,
    fontSize: fontSizeStyle
  }
});

export type CustomBlock = typeof schema.Block;
export type CustomBlockNoteEditor = typeof schema.BlockNoteEditor;
