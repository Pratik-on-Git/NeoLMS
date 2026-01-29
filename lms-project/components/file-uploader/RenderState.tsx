import { cn } from "@/lib/utils";
import { CloudUploadIcon, Loader2, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

export function RenderEmptyState({ isDragActive }: { isDragActive: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex items-center justify-center size-20 rounded-full bg-muted">
                <CloudUploadIcon
                    className={cn("size-10", isDragActive
                        ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div >
                <h3 className="text-lg font-semibold">
                    {isDragActive ? "Drop the files here..." : "Drag & drop files here"}
                </h3>
                <p className="text-sm text-muted-foreground cursor-pointer">
                    Or click to select files
                </p>
                <Button type="button" className="mt-2">
                    Select File
                </Button>
            </div>
        </div>
    )
}

export function RenderErrorState() {
    return (
        <div className="text-destructive flex flex-col items-center justify-center text-center space-y-4">
            <div className="bg-destructive/20 flex items-center justify-center size-20 rounded-full">
                <CloudUploadIcon className="size-10 text-red-600" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-red-600">
                    Upload Failed
                </h3>
                <p className="text-sm text-muted-foreground">
                    There was an error uploading your files. Please try again.
                </p>
            </div>
            <Button type="button" variant="destructive" className="mt-2">
                Retry Upload
            </Button>
        </div>
    )
}

export function RenderUploadedState({ previewUrl, isDeleting, handleRemoveFile, fileType }
    : {
        previewUrl: string
        isDeleting?: boolean
        handleRemoveFile?: () => void
        fileType?: "image" | "video"
    }) {
    return (
        <div className="relative group w-full h-full flex items-center justify-center">
            {fileType === "image" ? (
                <Image src={previewUrl}
                    alt="Uploaded File"
                    className="object-contain p-2"
                    fill />
            ) : (
                <video src={previewUrl} controls className="rounded-md w-full h-full" />
            )}
            <Button type="button"
                variant="destructive"
                size="icon"
                className={cn(
                    "absolute top-4 right-4"
                )}
                onClick={handleRemoveFile}
                disabled={isDeleting}
            >
                {isDeleting ? <Loader2 className="size-4 animate-spin" /> 
                : <XIcon className="size-4" />}
            </Button>
        </div>
    )
}

export function RenderUploadingState({ progress, file }: { progress: number; file: File }) {
    return (
        <div>
            <div className="text-center flex justify-center items-center flex-col">
                <p className="">{progress}%</p>
                <p className="mt-2 text-sm font-medium text-foreground">Uploading...</p>
                <p className="mt-1 text-xs text-muted-foreground truncate max-w-xs">{file.name}</p>
            </div>
        </div>
    )
}