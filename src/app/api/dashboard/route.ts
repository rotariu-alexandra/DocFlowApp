import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import RequestModel from "@/models/Request";

export async function GET() {
  try {
    await connectToDatabase();

    const totalRequests = await RequestModel.countDocuments();
    const newRequests = await RequestModel.countDocuments({ status: "new" });
    const approvedRequests = await RequestModel.countDocuments({ status: "approved" });
    const rejectedRequests = await RequestModel.countDocuments({ status: "rejected" });

    const recentRequests = await RequestModel.find()
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        totalRequests,
        newRequests,
        approvedRequests,
        rejectedRequests,
        recentRequests,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}