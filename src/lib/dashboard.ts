import { connectToDatabase } from "@/lib/mongodb";
import RequestModel from "@/models/Request";

export type DashboardRequestItem = {
    _id: string;
    title: string;
    department: string;
    status: string;
    priority: string;
};

export type DashboardData = {
    totalRequests: number;
    newRequests: number;
    inProgressRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    recentRequests: DashboardRequestItem[];
    departmentStats: { department: string; count: number }[];
    statusStats: { status: string; count: number }[];
    dailyStats: { date: string; count: number }[];
};

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

export async function getDashboardData(): Promise<DashboardData> {
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

    const recentRequestsDocs = await RequestModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    const recentRequests: DashboardRequestItem[] = recentRequestsDocs.map((r: any) => ({
        _id: r._id.toString(),
        title: r.title,
        department: r.department,
        status: r.status,
        priority: r.priority,
    }));

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

    return {
        totalRequests,
        newRequests,
        inProgressRequests,
        approvedRequests,
        rejectedRequests,
        recentRequests,
        departmentStats: departmentAggregation,
        statusStats: statusAggregation,
        dailyStats,
    };
}
