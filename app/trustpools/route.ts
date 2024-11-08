import {NextResponse} from "next/server";
import connectToDatabase from "@/lib/connect-to-database";
import TrustPools from "@/models/trustPool";

export async function GET(req: Request) {
	try {
		await connectToDatabase()

		// find most recent 40 trustpools
		const trustpools = await TrustPools.aggregate([
			{ $sort: { createdAt: -1 } },
			{ $limit: 40 }
		])

		if (trustpools.length === 0) {
			return NextResponse.json({
				error: "Trustpools not found",
				message: "Trustpools not found",
			})
		}

		return NextResponse.json({
			status: 200,
			message: "Trustpools found successfully",
			data: trustpools
		})
	} catch (error) {
		return NextResponse.json({
			error: error,
			message: "Internal server error",
		})
	}
}