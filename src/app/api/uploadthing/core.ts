import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
    requestAttachment: f({
        pdf: { maxFileSize: "8MB", maxFileCount: 5 },
        image: { maxFileSize: "8MB", maxFileCount: 5 },
        "application/msword": { maxFileSize: "8MB", maxFileCount: 5 },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
            maxFileSize: "8MB",
            maxFileCount: 5,
        },
        blob: { maxFileSize: "8MB", maxFileCount: 5 },
    })
        .middleware(async () => {
            const { userId } = await auth();

            if (!userId) {
                throw new UploadThingError("Unauthorized");
            }

            return { uploadedBy: userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return {
                uploadedBy: metadata.uploadedBy,
                fileName: file.name,
                fileUrl: file.ufsUrl,
                fileKey: file.key,
                fileSize: file.size,
                fileType: file.type ?? "unknown",
            };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;