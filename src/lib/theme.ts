import type { Theme } from "@blocknote/mantine";

export type BlockNoteTheme =
  | "light"
  | "dark"
  | Theme
  | {
      light: Theme;
      dark: Theme;
    };
