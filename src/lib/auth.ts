import { auth, clerkClient } from "@clerk/nextjs/server";

export type CurrentUserInfo = {
    userId: string;
    role?: string;
    department?: string;
};

export async function getCurrentUserRoleAndDepartment(): Promise<CurrentUserInfo | null> {
    const { userId } = await auth();
    if (!userId) return null;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    return {
        userId,
        role:
            typeof user.publicMetadata?.role === "string"
                ? user.publicMetadata.role.toLowerCase()
                : undefined,
        department: user.publicMetadata?.department as string | undefined,
    };
}
