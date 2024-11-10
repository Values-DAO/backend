import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/connect-to-database";
import TrustPools from "@/models/trustPool";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    // Find the most recent 40 trustpools
    const trustpools = await TrustPools.find({}).sort({ createdAt: -1 }).limit(40);

    if (trustpools.length === 0) {
      return NextResponse.json(
        {
          error: "Trustpools not found",
          message: "Trustpools not found",
        },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    return NextResponse.json(
      {
        status: 200,
        message: "Trustpools found successfully",
        data: trustpools,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error,
        message: "Internal server error",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}
