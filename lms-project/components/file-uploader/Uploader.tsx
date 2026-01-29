"use client"

import { useCallback, useEffect, useState } from "react"
import { FileRejection, useDropzone } from "react-dropzone"

import { cn } from "@/lib/utils"

import { Card, CardContent } from "../ui/card"
import { RenderEmptyState, RenderErrorState, RenderUploadedState, RenderUploadingState } from "./RenderState"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { useConstructUrl } from "@/hooks/use-construct"
type UploaderProps = {
    className?: string
    onDrop?: (files: File[]) => void
    value?: string
    onChange?: (value: string) => void
    fileType?: "image" | "video" | "both"
}

interface UploaderState {
    id: string | null
    file: File | null
    uploading: boolean
    progress: number
    key?: string
    isDeleting: boolean
    error: boolean
    objectUrl?: string
    fileType: "image" | "video" | "both"
}

export function Uploader({ className, onDrop: onDropProp, value, onChange, fileType }: UploaderProps) {
    const fileUrl = useConstructUrl(value || "")
    
    const [fileState, setFileState] = useState<UploaderState>({
        error: false,
        id: null,
        file: null,
        uploading: false,
        progress: 0,
        isDeleting: false,
        fileType: fileType || "image",
        key: value,
        objectUrl: value ? fileUrl : undefined,
    })

    const uploadFile = useCallback(async (file: File) => {
        setFileState((prev) => ({
            ...prev,
            uploading: true,
            progress: 0,
        }))

        try {
            const isImage = file.type.startsWith("image")

            const predesignedResponse = await fetch("/api/s3/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type,
                    size: file.size,
                    isImage: isImage,
                }),
            })

            if (!predesignedResponse.ok) {
                toast.error("Failed to get presigned URL")
                setFileState((prev) => ({
                    ...prev,
                    uploading: false,
                    progress: 0,
                    error: true,
                }))
                return
            }
            const { url: presignedUrl, key } = await predesignedResponse.json()

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentageCompleted = (event.loaded / event.total) * 100
                        setFileState((prev) => ({
                            ...prev,
                            progress: Math.round(percentageCompleted),
                        }))
                    }
                }
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        setFileState((prev) => ({
                            ...prev,
                            uploading: false,
                            progress: 100,
                            key: key,
                        }))
                        onChange?.(key)
                        toast.success("File uploaded successfully")
                        resolve()
                    } else {
                        reject(new Error("Upload failed"))
                    }
                }

                xhr.onerror = () => {
                    reject(new Error("Upload failed"))
                }

                xhr.open("PUT", presignedUrl)
                xhr.setRequestHeader("Content-Type", file.type)
                xhr.send(file)

            }).catch(() => {
                toast.error("Something went wrong during the upload.")
                setFileState((prev) => ({
                    ...prev,
                    uploading: false,
                    error: true,
                }))
            })
        } catch {
            toast.error("Something went wrong during the upload.")
            setFileState((prev) => ({
                ...prev,
                uploading: false,
                error: true,
            }))
        }
    }, [onChange])

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return

            const file = acceptedFiles[0]

            if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
                URL.revokeObjectURL(fileState.objectUrl)
            }
            setFileState({
                file,
                uploading: false,
                progress: 0,
                objectUrl: URL.createObjectURL(file),
                error: false,
                id: uuidv4(),
                isDeleting: false,
                fileType: file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : (fileType || "image"),
                key: undefined,
            })

            onDropProp?.(acceptedFiles)
            uploadFile(file)
        },
        [onDropProp, uploadFile, fileState.objectUrl, fileType],
    )

    async function handleRemoveFile() {
        if (fileState.isDeleting || !fileState.objectUrl)
            return
        try {
            setFileState((prev) => ({
                ...prev,
                isDeleting: true,
            }))

            const response = await fetch("/api/s3/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key: fileState.key,
                }),
            })

            if (!response.ok) {
                toast.error("Failed to remove file from storage.")
                setFileState((prev) => ({
                    ...prev,
                    isDeleting: false,
                    error: true,
                }))
                return
            }

            if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
                URL.revokeObjectURL(fileState.objectUrl)
            }

            onChange?.("")
            setFileState(() => ({
                file: null,
                uploading: false,
                progress: 0,
                objectUrl: undefined,
                error: false,
                fileType: fileType || "image",
                id: null,
                isDeleting: false,
            }))

            toast.success("File removed successfully.")

        } catch {
            toast.error("Failed to remove file from storage. Please try again.")

            setFileState((prev) => ({
                ...prev,
                isDeleting: false,
                error: true,
            }))
        }
    }

    function rejectedFiles(fileRejection: FileRejection[]) {
        if (fileRejection.length) {
            const tooManyFiles = fileRejection.find((rejection) => rejection.errors[0].code === "too-many-files")

            const fileSizeToBig = fileRejection.find((rejection) => rejection.errors[0].code === "file-too-large")

            if (fileSizeToBig) {
                toast.error("File size exceeds the 5MB limit.")
            }

            if (tooManyFiles) {
                toast.error("You can only upload up to 1 file at a time.")
            }
        }
    }

    function renderContent() {
        if (fileState.uploading) {
            return (
                <RenderUploadingState progress={fileState.progress} file={fileState.file as File} />
            )
        }

        if (fileState.error) {
            return (
                <RenderErrorState />
            )
        }

        if (fileState.objectUrl) {
            return (<RenderUploadedState
                handleRemoveFile={handleRemoveFile}
                isDeleting={fileState.isDeleting}
                previewUrl={fileState.objectUrl}
                fileType={fileState.fileType === "both" ? undefined : fileState.fileType}
            />)
        }

        return <RenderEmptyState isDragActive={isDragActive} />
    }

    useEffect(() => {
        return () => {
            if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
                URL.revokeObjectURL(fileState.objectUrl)
            }
        }
    }, [fileState.objectUrl])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: (
            fileType === "video" ? { "video/*": [] } : fileType === "both" ? { "image/*": [], "video/*": [] } : { "image/*": [] }
        ),
        maxFiles: 1,
        multiple: false,
        maxSize: fileType === "video" ? 50 * 1024 * 1024 : 5 * 1024 * 1024, // 50 MB for video, 5 MB for image
        onDropRejected: rejectedFiles,
        disabled: fileState.uploading || !!fileState.objectUrl,
    })

    return (
        <Card
            {...getRootProps()}
            className={cn(
                "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-72",
                isDragActive ? "border-primary bg-primary/10 border-solid" : "border-border hover:border-primary",
                className,
            )}
        >
            <CardContent className="flex items-center justify-center h-full w-full p-4">
                <input {...getInputProps()} />
                {renderContent()}
            </CardContent>
        </Card>
    )
}