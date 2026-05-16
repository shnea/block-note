"use client";

import { useCallback, useMemo, useState } from "react";
import { BlockNoteEditor, BlockNoteViewer } from "@shnea/blocknote";
import { exampleFontOptions } from "./fonts";

export default function EditorDemo() {
  const [json, setJson] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const prettyJson = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  }, [json]);

  const uploadFile = useCallback(async (file: File) => {
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const data = (await response.json()) as {
      previewUrl?: string;
      error?: string;
    };

    if (!response.ok || !data.previewUrl) {
      const message = data.error ?? "Upload failed";
      setUploadError(message);
      throw new Error(message);
    }

    return data.previewUrl;
  }, []);

  return (
    <main className="page">
      <div className="workspace">
        <header className="header">
          <div>
            <h1>@shnea/blocknote</h1>
            <p>BlockNote 에디터와 JSON 뷰어를 한 화면에서 확인하는 예제입니다.</p>
          </div>
          <div className="header__tools">
            <span className={uploadError ? "status status--error" : "status"}>
              {uploadError ? `업로드 오류: ${uploadError}` : "JSON 문자열 저장"}
            </span>
          </div>
        </header>

        <section className="panel panel--editor">
          <div className="panel__header">
            <div>
              <h2>에디터</h2>
              <p>블록 추가, 슬래시 메뉴, 드래그 이동, Markdown 붙여넣기를 확인할 수 있습니다.</p>
            </div>
            <span className="status">편집 가능</span>
          </div>
          <BlockNoteEditor
            className="editor-shell"
            value={json}
            onChange={setJson}
            fontFamilies={exampleFontOptions}
            uploadFile={uploadFile}
          />
        </section>

        <div className="preview-grid">
          <section className="panel">
            <div className="panel__header">
              <div>
                <h2>미리보기</h2>
                <p>에디터와 같은 JSON 상태를 읽기 전용으로 렌더링합니다.</p>
              </div>
            </div>
            <div className="viewer-shell">
              <BlockNoteViewer value={json} fontFamilies={exampleFontOptions} />
            </div>
          </section>

          <section className="panel">
            <div className="panel__header">
              <div>
                <h2>JSON</h2>
                <p>저장하거나 서버로 보낼 수 있는 원본 문자열입니다.</p>
              </div>
            </div>
            <pre className="json-output">{prettyJson || "[] 또는 빈 문자열 상태"}</pre>
          </section>
        </div>
      </div>
    </main>
  );
}
