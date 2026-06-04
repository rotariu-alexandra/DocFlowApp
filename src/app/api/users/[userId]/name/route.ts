import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(
    req: Request,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId: currentUserId } = await auth();

        if (!currentUserId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { userId } = await context.params;

        const client = await clerkClient();
        const user = await client.users.getUser(userId);

        // Preferăm fullName, altfel email-ul, altfel un fallback
        const name =
            user.fullName ||
            user.primaryEmailAddress?.emailAddress ||
            "Utilizator necunoscut";

        return NextResponse.json({ success: true, name });
    } catch (error) {
        console.error("GET user name error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch user" },
            { status: 500 }
        );
    }
}