import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import RequestModel from "@/models/Request";
import { requestSchema } from "@/utils/requestValidation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createHistoryEntry } from "@/lib/history";
import { z } from "zod";

const attachmentSchema = z.object({
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  fileKey: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().positive(),
  uploadedBy: z.string(),          // ← FIX: permite și string gol
  uploadedAt: z.string().optional(),
});

const createRequestSchema = requestSchema.extend({
  attachments: z.array(attachmentSchema).optional(),
});

async function getCurrentUserRoleAndDepartment() {
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

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const currentUser = await getCurrentUserRoleAndDepartment();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 5;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const department = searchParams.get("department") || "";
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (search) query.title = { $regex: search, $options: "i" };
    if (status) query.status = status;

    if (currentUser.role === "employee") {
      query._id = null;
    } else if (currentUser.role === "manager") {
      query.department = currentUser.department;
    } else if (department) {
      query.department = department;
    }

    const totalItems = await RequestModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const requests = await RequestModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: requests,
      pagination: { currentPage: page, totalPages, totalItems, limit },
    });
  } catch (error) {
    console.error("GET requests error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const currentUser = await getCurrentUserRoleAndDepartment();
    if (!currentUser?.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = createRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    // FIX: dacă uploadedBy e gol, punem userId-ul curent
    const attachments = (validation.data.attachments || []).map((file) => ({
      ...file,
      uploadedBy: file.uploadedBy || currentUser.userId,
      uploadedAt: file.uploadedAt ? new Date(file.uploadedAt) : new Date(),
    }));

    const newRequest = await RequestModel.create({
      title: validation.data.title,
      description: validation.data.description,
      requestType: validation.data.requestType,
      department: validation.data.department,
      priority: validation.data.priority,
      status: "new",
      createdBy: currentUser.userId,
      attachments,
    });

    await createHistoryEntry({
      requestId: newRequest._id.toString(),
      action: "created",
      performedBy: currentUser.userId,
      performedByRole: currentUser.role,
      details: {
        message:
          attachments.length > 0
            ? `Request created with ${attachments.length} attachment(s)`
            : "Request created",
        title: newRequest.title,
        status: newRequest.status,
      },
    });

    return NextResponse.json({ success: true, data: newRequest });
  } catch (error) {
    console.error("POST request error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create request" },
      { status: 500 }
    );
  }
}