import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import RequestModel from "@/models/Request";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
    new: "Nou",
    in_progress: "In lucru",
    approved: "Aprobat",
    rejected: "Respins",
};

function getMonthRange(year: number, month: number) {
    return {
        start: new Date(year, month - 1, 1),
        end: new Date(year, month, 0, 23, 59, 59, 999),
    };
}

export async function GET(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const now = new Date();

        const year = Number(searchParams.get("year")) || now.getFullYear();
        const month = Number(searchParams.get("month")) || now.getMonth() + 1;

        const { start, end } = getMonthRange(year, month);

        const requests = await RequestModel.find({
            createdAt: { $gte: start, $lte: end },
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        const total = requests.length;
        const approved = requests.filter((r) => r.status === "approved").length;
        const rejected = requests.filter((r) => r.status === "rejected").length;
        const inProgress = requests.filter((r) => r.status === "in_progress").length;
        const newRequests = requests.filter((r) => r.status === "new").length;

        const doc = new jsPDF();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Raport lunar cereri", 14, 18);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`Perioada: ${month}/${year}`, 14, 28);
        doc.text(`Generat la: ${new Date().toLocaleString("ro-RO")}`, 14, 35);

        autoTable(doc, {
            startY: 45,
            head: [["Indicator", "Valoare"]],
            body: [
                ["Total cereri", String(total)],
                ["Cereri noi", String(newRequests)],
                ["Cereri in lucru", String(inProgress)],
                ["Cereri aprobate", String(approved)],
                ["Cereri respinse", String(rejected)],
            ],
        });

        autoTable(doc, {
            startY: 90,
            head: [["Titlu", "Departament", "Status", "Prioritate", "Data"]],
            body: requests.map((request) => [
                String(request.title),
                String(request.department),
                STATUS_LABELS[String(request.status)] ?? String(request.status),
                String(request.priority),
                new Date(request.createdAt as Date).toLocaleDateString("ro-RO"),
            ]),
        });

        const pdfArrayBuffer = doc.output("arraybuffer");

        return new Response(Buffer.from(pdfArrayBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="raport-${year}-${String(
                    month
                ).padStart(2, "0")}.pdf"`,
            },
        });
    } catch (error) {
        console.error("PDF export error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to generate PDF" },
            { status: 500 }
        );
    }
}