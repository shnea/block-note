# @shnea/blocknote

BlockNote 기반 React 에디터와 JSON 뷰어를 재사용하기 위한 패키지입니다.

저장 형식은 BlockNote 문서 JSON 문자열만 사용합니다. Markdown 저장 기능은 제공하지 않지만, 에디터에 Markdown 텍스트를 붙여 넣으면 BlockNote 기본 paste 동작으로 블록 변환됩니다.

## 설치

```bash
npm install @shnea/blocknote
```

`@blocknote/*`, `@mantine/*` 의존성은 패키지에 포함되어 함께 설치됩니다. React 앱이 아니라면 `react`, `react-dom`은 별도로 필요하지만, Next.js나 Vite React 프로젝트라면 보통 이미 설치되어 있습니다.

CSS도 함께 import해야 합니다.

```tsx
import "@shnea/blocknote/style.css";
```

## 기본 사용법

```tsx
import { useState } from "react";
import { BlockNoteEditor, BlockNoteViewer } from "@shnea/blocknote";
import "@shnea/blocknote/style.css";

export function Example() {
  const [json, setJson] = useState("");

  return (
    <>
      <BlockNoteEditor value={json} onChange={setJson} />
      <BlockNoteViewer value={json} />
    </>
  );
}
```

`BlockNoteEditor`는 `value`로 JSON 문자열을 받고, 변경 시 `onChange`로 JSON 문자열을 반환합니다. `BlockNoteViewer`도 같은 JSON 문자열을 읽기 전용으로 렌더링합니다.

## 폰트 사용법

폰트는 패키지 안에 고정하지 않고, 사용하는 애플리케이션에서 목록만 넘깁니다. 사용자는 텍스트를 선택한 뒤 포맷 툴바의 `폰트` 메뉴에서 적용합니다. 이미 적용된 폰트를 다시 누르면 해당 폰트가 해제됩니다.

가장 단순한 형태는 `key`, `label`, `value`, `url`을 가진 배열입니다.

```tsx
import { BlockNoteEditor, BlockNoteViewer, type FontFamilyOption } from "@shnea/blocknote";

const fonts: FontFamilyOption[] = [
  {
    key: "pretendard",
    label: "Pretendard",
    value: "\"Pretendard\", sans-serif",
    url: "https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.2.1/static/woff2/Pretendard-Regular.woff2"
  },
  {
    key: "neo-dunggeunmo",
    label: "Neo둥근모",
    value: "\"NeoDunggeunmo\", monospace",
    url: "https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.3/NeoDunggeunmo.woff",
    format: "woff"
  }
];

export function Example() {
  const [json, setJson] = useState("");

  return (
    <>
      <BlockNoteEditor
        value={json}
        onChange={setJson}
        fontFamilies={fonts}
      />
      <BlockNoteViewer value={json} fontFamilies={fonts} />
    </>
  );
}
```

Google Fonts처럼 CSS 파일을 불러와야 하는 폰트는 `stylesheetUrl`을 사용합니다.

```ts
const fonts: FontFamilyOption[] = [
  {
    key: "noto-sans-kr",
    label: "Noto Sans KR",
    value: "\"Noto Sans KR\", sans-serif",
    stylesheetUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600&display=swap"
  }
];
```

한 폰트에 여러 굵기를 넣고 싶으면 `faces`를 사용합니다.

```ts
const fonts: FontFamilyOption[] = [
    {
        key: "pretendard",
        label: "Pretendard",
        value: "\"Pretendard\", sans-serif",
        faces: [
            {
                url: "https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.2.1/static/woff2/Pretendard-Regular.woff2",
                weight: "400"
            },
            {
                url: "https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.2.1/static/woff2/Pretendard-SemiBold.woff2",
                weight: "600"
            }
        ]
    },
    {
        key: "noto-sans-kr",
        label: "Noto Sans KR",
        value: "\"Noto Sans KR\", sans-serif",
        stylesheetUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600&display=swap"
    }
];
```

폰트 크기는 기본 목록이 내장되어 있어 별도 설정 없이 포맷 툴바에 표시됩니다. 기본값 대신 직접 지정하고 싶으면 `fontSizes`를 넘기면 됩니다. 크기도 이미 적용된 값을 다시 누르면 해제됩니다.

```tsx
<BlockNoteEditor
  value={json}
  onChange={setJson}
  fontFamilies={fonts}
  fontSizes={[
    { label: "14px", value: "14px" },
    { label: "18px", value: "18px" },
    { label: "24px", value: "24px" }
  ]}
/>
```

에디터에서 선택한 폰트와 크기는 문서 JSON 안에 inline style로 저장됩니다. 읽기 전용 화면에서도 같은 폰트를 보이게 하려면 `BlockNoteViewer`에도 같은 `fontFamilies` 배열을 넘기세요.

## Editor Props

```ts
export type BlockNoteEditorProps = {
  value?: string;
  className?: string;
  editable?: boolean;
  fontFamilies?: readonly FontFamilyOption[];
  fontSizes?: readonly FontSizeOption[];
  onChange?: (json: string) => void;
  uploadFile?: (file: File) => Promise<string>;
};
```

- `value`: BlockNote 문서 JSON 문자열입니다. 비어 있으면 빈 에디터로 시작합니다.
- `onChange`: 에디터 문서가 바뀔 때 `JSON.stringify(editor.document)` 결과를 받습니다.
- `editable`: `false`면 편집을 막습니다.
- `fontFamilies`: 선택 툴바에 표시할 폰트 목록입니다. 선택 시 필요한 폰트 CSS를 자동으로 로드합니다.
- `fontSizes`: 선택 툴바에 표시할 폰트 크기 목록입니다. 넘기지 않으면 기본 크기 목록을 사용합니다.
- `uploadFile`: 이미지/파일 업로드 처리를 애플리케이션에서 주입합니다. 반환값은 에디터에 삽입할 URL입니다.

## Viewer Props

```ts
export type BlockNoteViewerProps = {
  value?: string;
  className?: string;
  fontFamilies?: readonly FontFamilyOption[];
  enableImageModal?: boolean;
};
```

- `fontFamilies`: 문서 JSON에 저장된 폰트를 뷰어에서도 렌더링할 수 있도록 같은 폰트 목록을 넘깁니다.
- `enableImageModal`: 기본값은 `true`입니다. 이미지 클릭 시 확대 모달을 엽니다.

## 파일 업로드 원칙

이 패키지는 특정 파일 서비스에 결합하지 않습니다. `file-service`도 패키지 내부에서 자동으로 호출하지 않습니다.

각 애플리케이션은 자기 환경에 맞게 업로드 API를 개별적으로 만들고, 그 API를 호출하는 `uploadFile` 함수만 `BlockNoteEditor`에 넘겨야 합니다.

권장 구조:

```txt
브라우저
  -> 애플리케이션 API route 또는 백엔드
    -> 각 프로젝트에서 선택한 파일 저장소
```

이 구조를 쓰는 이유:

- 브라우저에 업로드 토큰이나 내부 파일 서비스 주소를 노출하지 않습니다.
- 프로젝트마다 인증, 저장 위치, 보관 정책, 에러 처리를 다르게 가져갈 수 있습니다.
- `@shnea/blocknote` 패키지는 에디터/뷰어 역할만 유지합니다.

예시:

```tsx
<BlockNoteEditor
  value={json}
  onChange={setJson}
  uploadFile={async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok || !data.previewUrl) {
      throw new Error(data.error ?? "Upload failed");
    }

    return data.previewUrl;
  }}
/>
```

## file-service를 사용하는 경우

`file-service` 연동은 선택 사항입니다. 사용하는 프로젝트마다 별도의 API route나 백엔드 엔드포인트를 만들어 개별적으로 연결하세요.

`examples/next`에는 참고용 file-service 프록시가 들어 있습니다. 이 예제는 패키지의 기본 동작이 아니라, 특정 프로젝트에서 file-service를 붙이는 방법을 보여주는 샘플입니다.

예제 환경변수:

```env
FILE_SERVICE_BASE_URL=http://localhost:30700
FILE_SERVICE_BEARER_TOKEN=
FILE_SERVICE_RETENTION_CATEGORY=blog
```

- `FILE_SERVICE_BASE_URL`: 해당 프로젝트가 사용할 file-service 주소입니다.
- `FILE_SERVICE_BEARER_TOKEN`: 서버 전용 Bearer 토큰입니다. `NEXT_PUBLIC_`을 붙이면 안 됩니다.
- `FILE_SERVICE_RETENTION_CATEGORY`: file-service multipart 업로드의 `retentionCategory` 필드로 전달됩니다. 예: `default`, `tmp`, `blog`, `image`

다른 프로젝트에서 file-service를 쓰려면 해당 프로젝트의 `.env`, 인증 방식, 업로드 라우트에 맞게 별도로 설정하세요. 이 패키지에 file-service 주소나 토큰을 넣지 않습니다.

## Next 예제

예제 앱은 `examples/next`에 있습니다. 에디터, 뷰어, JSON 미리보기, 선택적 file-service 업로드 프록시 예제를 포함합니다.

실행:

```bash
npm install
npm run dev
```

빌드 확인:

```bash
npm run typecheck
npm run build
npm run example:build
```

## 내보내는 항목

```ts
export { BlockNoteEditor, BlockNoteViewer };
export type {
  BlockNoteEditorHandle,
  BlockNoteEditorProps,
  BlockNoteViewerProps,
  FontFaceOption,
  FontFamilyOption,
  FontSizeOption
};
export { schema };
export type { CustomBlock, CustomBlockNoteEditor };
```
