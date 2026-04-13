import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import RequestModel from "@/models/Request";
import { requestSchema } from "@/utils/requestValidation";
import { auth, clerkClient } from "@clerk/nextjs/server";

async function getCurrentUserRoleAndDepartment() {
  const { userId } = await auth();

  if (!userId) return null;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  return {
    userId,
    role: user.publicMetadata?.role as string | undefined,
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

    const query: Record<string, any> = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

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
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
      },
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

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const validation = requestSchema.safeParse(body);

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

    const newRequest = await RequestModel.create({
      ...validation.data,
      status: "new",
      createdBy: userId,
    });

    return NextResponse.json({
      success: true,
      data: newRequest,
    });
  } catch (error) {
    console.error("POST request error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create request" },
      { status: 500 }
    );
  }
}