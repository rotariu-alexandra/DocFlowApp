import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { auth } from "@clerk/nextjs/server";

export async function PATCH() {
    try {
        await connectToDatabase();

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("PATCH all notifications error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to update notifications" },
            { status: 500 }
        );
    }
}