import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await context.params;

        await Notification.findByIdAndUpdate(id, {
            isRead: true,
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("PATCH notification error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to update notification" },
            { status: 500 }
        );
    }
}