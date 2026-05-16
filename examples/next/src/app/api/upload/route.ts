import { NextRequest, NextResponse } from "next/server";

type FileServiceUpload = {
  fileId: string;
  originalname?: string;
  previewUrl: string;
  downloadUrl: string;
};

type FileServiceUploadResponse = {
  files?: FileServiceUpload[];
  fileId?: string;
  previewUrl?: string;
  downloadUrl?: string;
  message?: string;
};

export async function POST(req: NextRequest) {
  const baseUrl = process.env.FILE_SERVICE_BASE_URL;
  const bearerToken = process.env.FILE_SERVICE_BEARER_TOKEN;
  const retentionCategory = process.env.FILE_SERVICE_RETENTION_CATEGORY?.trim();

  if (!baseUrl || !bearerToken) {
    return NextResponse.json(
      { error: "FILE_SERVICE_BASE_URL and FILE_SERVICE_BEARER_TOKEN are required." },
      { status: 500 }
    );
  }

  const incoming = await req.formData();
  const file = incoming.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Field 'file' is required." }, { status: 400 });
  }

  const outgoing = new FormData();
  outgoing.append("file", file, file.name);
  if (retentionCategory) {
    outgoing.append("retentionCategory", retentionCategory);
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`
      },
      body: outgoing
    });

    const data = (await response.json()) as FileServiceUploadResponse;

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message ?? "File service upload failed." },
        { status: response.status }
      );
    }

    const uploaded = data.files?.[0] ?? data;

    if (!uploaded.previewUrl) {
      return NextResponse.json(
        { error: "File service did not return previewUrl." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      fileId: uploaded.fileId,
      previewUrl: uploaded.previewUrl,
      downloadUrl: uploaded.downloadUrl
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload proxy failed." },
      { status: 500 }
    );
  }
}
