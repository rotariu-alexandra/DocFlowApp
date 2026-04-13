import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import RequestHistory from "@/models/RequestHistory";
import { auth } from "@clerk/nextjs/server";

export async function GET(
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

        const history = await RequestHistory.find({ requestId: id }).sort({
            createdAt: -1,
        });

        return NextResponse.json({
            success: true,
            data: history,
        });
    } catch (error) {
        console.error("GET request history error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch request history" },
            { status: 500 }
        );
    }
}