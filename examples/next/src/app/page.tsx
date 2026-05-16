"use client";

import dynamic from "next/dynamic";

const EditorDemo = dynamic(() => import("./EditorDemo"), {
  ssr: false,
  loading: () => (
    <main className="page">
      <div className="workspace">
        <section className="panel">
          <div className="panel__header">
            <h2>에디터를 불러오는 중</h2>
          </div>
          <div className="viewer-shell" />
        </section>
      </div>
    </main>
  )
});

export default function Home() {
  return <EditorDemo />;
}
