import { env } from "@/lib/env"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { S3 } from "@/lib/S3Client"
import arcjet, { fixedWindow } from "@arcjet/next"
import { requireAdmin } from "@/app/data/admin/require-admin"


const fileUploadSchema = z.object({
    fileName: z.string().min(1, { message: "File name is required" }),
    contentType: z.string().min(1, { message: "Content type is required" }),
    size: z.number().min(1, { message: "Size is required" }),
    isImage: z.boolean(),
})

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
})

export async function POST(request: Request) {
    await requireAdmin()
    try {
        const decision = await aj.protect(request, {
            fingerprint: "admin-upload",
        })

        if (decision.isDenied()) {
            return NextResponse.json({ error: "Request blocked" }, { status: 429 })
        }

        const body = await request.json()

        const validation = fileUploadSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({error: "Invalid request body"}, { status: 400 })
        }

        const { fileName, contentType } = validation.data

        const uniqueKey = `${uuidv4()}-${fileName}`

        const command = new PutObjectCommand({
            Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
            ContentType: contentType,
            Key: uniqueKey,
            ChecksumAlgorithm: undefined, // 👈 IMPORTANT
        })
        const presignedUrl = await getSignedUrl(S3, command, { expiresIn: 3600, 
            signableHeaders: new Set(["host", "content-type"]), })

        const response = {
            url: presignedUrl,
            key: uniqueKey,
        };

        return NextResponse.json(response)
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}