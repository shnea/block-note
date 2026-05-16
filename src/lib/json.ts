import type { CustomBlock } from "./schema";

export function parseBlocks(value?: string): CustomBlock[] | undefined {
  if (!value || value.trim() === "") {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as CustomBlock[]) : undefined;
  } catch {
    return undefined;
  }
}

export function stringifyBlocks(blocks: readonly CustomBlock[]): string {
  return JSON.stringify(blocks);
}
