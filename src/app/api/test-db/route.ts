import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectToDatabase();

    return NextResponse.json({
      success: true,
      message: "Conexiune MongoDB realizată cu succes!",
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Eroare la conectarea cu MongoDB",
      },
      { status: 500 }
    );
  }
}