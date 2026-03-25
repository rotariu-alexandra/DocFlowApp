import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import RequestModel from "@/models/Request";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { userId } = await auth();

    if (!userId) {
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

    const skip = (page - 1) * limit;

    const query: Record<string, any> = {
      createdBy: userId,
    };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (status) {
      query.status = status;
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
    console.error("GET my requests error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch my requests" },
      { status: 500 }
    );
  }
}