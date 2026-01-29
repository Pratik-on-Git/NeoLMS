import { env } from "@/lib/env";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@/lib/S3Client";
import { NextResponse } from "next/server";
import arcjet, { fixedWindow } from "@arcjet/next";
import { requireAdmin } from "@/app/data/admin/require-admin";

const aj = arcjet({
  key: env.ARCJET_KEY || "",
  characteristics: ["fingerprint"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 10,
    }),
  ],
});


export async function DELETE(request: Request) {
  await requireAdmin();
  try {
    const decision = await aj.protect(request, {
      fingerprint: "admin-delete",
    });

    if (decision.isDenied()) {
      return NextResponse.json({ error: "Request blocked" }, { status: 429 });
    }

    const body = await request.json();

    const key = body.key;

    if (!key) {
      return NextResponse.json(
        { error: "Missing or Invalid Object Key" },
        { status: 400 },
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: key,
    });

    await S3.send(command);
    return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
