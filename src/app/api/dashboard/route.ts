import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import RequestModel from "@/models/Request";

function getLast7DaysRange() {
  const today = new Date();
  const dates: Date[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - i);
    dates.push(date);
  }

  return dates;
}

export async function GET() {
  try {
    await connectToDatabase();

    const totalRequests = await RequestModel.countDocuments();
    const newRequests = await RequestModel.countDocuments({ status: "new" });
    const inProgressRequests = await RequestModel.countDocuments({
      status: "in_progress",
    });
    const approvedRequests = await RequestModel.countDocuments({
      status: "approved",
    });
    const rejectedRequests = await RequestModel.countDocuments({
      status: "rejected",
    });

    const recentRequests = await RequestModel.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const departmentAggregation = await RequestModel.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          count: 1,
        },
      },
      {
        $sort: { department: 1 },
      },
    ]);

    const statusAggregation = await RequestModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);

    const sevenDays = getLast7DaysRange();
    const startDate = new Date(sevenDays[0]);
    const endDate = new Date(sevenDays[6]);
    endDate.setHours(23, 59, 59, 999);

    const dailyAggregation = await RequestModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%d.%m",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
    ]);

    const dailyStats = sevenDays.map((date) => {
      const formattedDate = date.toLocaleDateString("ro-RO", {
        day: "2-digit",
        month: "2-digit",
      });

      const foundDay = dailyAggregation.find(
        (item) => item.date === formattedDate
      );

      return {
        date: formattedDate,
        count: foundDay ? foundDay.count : 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        totalRequests,
        newRequests,
        inProgressRequests,
        approvedRequests,
        rejectedRequests,
        recentRequests,
        departmentStats: departmentAggregation,
        statusStats: statusAggregation,
        dailyStats,
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