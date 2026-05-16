import { BlockNoteSchema } from "@blocknote/core";

export const schema = BlockNoteSchema.create();

export type CustomBlock = typeof schema.Block;
export type CustomBlockNoteEditor = typeof schema.BlockNoteEditor;
