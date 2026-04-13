import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import RequestModel from "@/models/Request";
import { requestSchema } from "@/utils/requestValidation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  canStartProcessing,
  canApproveReject,
  canEditOwnRequest,
  canDeleteOwnRequest,
} from "@/utils/permissions";
import { createHistoryEntry } from "@/lib/history";

async function getCurrentUserRoleAndDepartment() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const role =
    typeof user.publicMetadata?.role === "string"
      ? user.publicMetadata.role.toLowerCase()
      : undefined;

  const department = user.publicMetadata?.department as string | undefined;

  return {
    userId,
    role,
    department,
  };
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    const request = await RequestModel.findById(id);

    if (!request) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("GET request by id error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch request" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const currentUser = await getCurrentUserRoleAndDepartment();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const existingRequest = await RequestModel.findById(id);

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 }
      );
    }

    if (
      !canEditOwnRequest(
        currentUser.role,
        existingRequest.createdBy,
        currentUser.userId,
        existingRequest.status
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
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

    const updatedRequest = await RequestModel.findByIdAndUpdate(
      id,
      validation.data,
      { new: true }
    );

    await createHistoryEntry({
      requestId: id,
      action: "updated",
      performedBy: currentUser.userId,
      performedByRole: currentUser.role,
      details: {
        message: "Request details updated",
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    console.error("PUT request error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update request" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const currentUser = await getCurrentUserRoleAndDepartment();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();

    const existingRequest = await RequestModel.findById(id);

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 }
      );
    }

    if (body.status === "in_progress" && !canStartProcessing(currentUser.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    if (
      (body.status === "approved" || body.status === "rejected") &&
      !canApproveReject(
        currentUser.role,
        existingRequest.department,
        currentUser.department
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    if (
      currentUser.role === "manager" &&
      currentUser.department &&
      existingRequest.department !== currentUser.department
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden for this department" },
        { status: 403 }
      );
    }

    const oldStatus = existingRequest.status;

    const updatedRequest = await RequestModel.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    );

    await createHistoryEntry({
      requestId: id,
      action: "status_changed",
      performedBy: currentUser.userId,
      performedByRole: currentUser.role,
      details: {
        message: "Request status changed",
        from: oldStatus,
        to: body.status,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    console.error("PATCH request error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update request" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const currentUser = await getCurrentUserRoleAndDepartment();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const existingRequest = await RequestModel.findById(id);

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 }
      );
    }

    if (
      !canDeleteOwnRequest(
        currentUser.role,
        existingRequest.createdBy,
        currentUser.userId,
        existingRequest.status
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    await createHistoryEntry({
      requestId: id,
      action: "deleted",
      performedBy: currentUser.userId,
      performedByRole: currentUser.role,
      details: {
        message: "Request deleted",
        title: existingRequest.title,
      },
    });

    await RequestModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    console.error("DELETE request error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete request" },
      { status: 500 }
    );
  }
}