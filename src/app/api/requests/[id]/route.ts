import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import RequestModel from "@/models/Request";
import { requestSchema } from "@/utils/requestValidation";

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

    const { id } = await context.params;
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

    if (!updatedRequest) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 }
      );
    }

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

    const { id } = await context.params;
    const body = await req.json();

    const updatedRequest = await RequestModel.findByIdAndUpdate(
      id,
      {
        status: body.status,
      },
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 }
      );
    }

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

    const { id } = await context.params;

    const deletedRequest = await RequestModel.findByIdAndDelete(id);

    if (!deletedRequest) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 }
      );
    }

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