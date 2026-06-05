import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import RequestModel from "@/models/Request";
import { createNotification } from "@/lib/notifications";
import { notifyUser } from "@/app/api/notifications/stream/route";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const comments = await Comment.find({ requestId: id }).sort({ createdAt: 1 });

        return NextResponse.json({ success: true, data: comments });
    } catch (error) {
        console.error("GET comments error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch comments" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await req.json();
        const content = body.content?.trim();

        if (!content || content.length < 1) {
            return NextResponse.json({ success: false, message: "Comentariul nu poate fi gol." }, { status: 400 });
        }
        if (content.length > 2000) {
            return NextResponse.json({ success: false, message: "Max 2000 caractere." }, { status: 400 });
        }

        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);

        const authorName = clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress || "Utilizator";
        const authorRole = typeof clerkUser.publicMetadata?.role === "string"
            ? clerkUser.publicMetadata.role
            : "employee";

        const comment = await Comment.create({ requestId: id, authorId: userId, authorName, authorRole, content });

        // Notifică proprietarul cererii dacă altcineva comentează
        const request = await RequestModel.findById(id);
        if (request && request.createdBy !== userId) {
            await createNotification({
                userId: request.createdBy,
                title: "Comentariu nou pe cererea ta",
                message: `${authorName}: "${content.slice(0, 80)}${content.length > 80 ? "…" : ""}"`,
                type: "info",
                link: `/requests/${id}`,
            });
            notifyUser(request.createdBy);
        }

        return NextResponse.json({ success: true, data: comment });
    } catch (error) {
        console.error("POST comment error:", error);
        return NextResponse.json({ success: false, message: "Failed to post comment" }, { status: 500 });
    }
}