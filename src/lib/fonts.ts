export type FontFamilyOption = {
  key: string;
  label: string;
  value: string;
  url?: string;
  stylesheetUrl?: string;
  weight?: string;
  style?: string;
  format?: "woff" | "woff2" | "truetype" | "opentype";
  faces?: readonly FontFaceOption[];
};

export type FontFaceOption = {
  family?: string;
  url: string;
  weight?: string;
  style?: string;
  format?: "woff" | "woff2" | "truetype" | "opentype";
};

export type FontSizeOption = {
  label: string;
  value: string;
};

export const DEFAULT_FONT_SIZES: readonly FontSizeOption[] = [
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "22px", value: "22px" },
  { label: "28px", value: "28px" },
  { label: "36px", value: "36px" }
];

const loadedFontKeys = new Set<string>();

function getPrimaryFontFamily(fontFamily: string): string {
  return fontFamily
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "");
}

export function loadFontFamily(option: FontFamilyOption) {
  if (typeof document === "undefined" || loadedFontKeys.has(option.key)) {
    return;
  }

  const elementId = `shnea-blocknote-font-${option.key}`;
  if (document.getElementById(elementId)) {
    loadedFontKeys.add(option.key);
    return;
  }

  if (option.stylesheetUrl) {
    const linkElement = document.createElement("link");
    linkElement.id = elementId;
    linkElement.rel = "stylesheet";
    linkElement.href = option.stylesheetUrl;
    document.head.appendChild(linkElement);
    loadedFontKeys.add(option.key);
    return;
  }

  const faces = option.faces ?? (
    option.url
      ? [
          {
            family: getPrimaryFontFamily(option.value),
            url: option.url,
            weight: option.weight,
            style: option.style,
            format: option.format
          }
        ]
      : []
  );

  if (faces.length > 0) {
    const styleElement = document.createElement("style");
    styleElement.id = elementId;
    styleElement.textContent = faces
      .map((face) => {
        const family = face.family ?? getPrimaryFontFamily(option.value);
        const weight = face.weight ?? "400";
        const style = face.style ?? "normal";
        const format = face.format ?? "woff2";

        return `
@font-face {
  font-family: '${family}';
  font-style: ${style};
  font-weight: ${weight};
  font-display: swap;
  src: url('${face.url}') format('${format}');
}`.trim();
      })
      .join("\n");
    document.head.appendChild(styleElement);
  }

  loadedFontKeys.add(option.key);
}

export function loadFontFamilies(options: readonly FontFamilyOption[]) {
  options.forEach(loadFontFamily);
}
