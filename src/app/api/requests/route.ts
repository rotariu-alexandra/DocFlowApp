import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import RequestModel from "@/models/Request";
import { requestSchema } from "@/utils/requestValidation";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 5;

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const department = searchParams.get("department") || "";

    const skip = (page - 1) * limit;

    const query: any = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    if (department) {
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
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

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
      employee: "507f1f77bcf86cd799439011",
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