import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
        await connectToDatabase();

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const notifications = await Notification.find({ userId }).sort({
            createdAt: -1,
        });

        return NextResponse.json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error("GET notifications error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}