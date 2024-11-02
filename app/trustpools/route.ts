import {NextResponse} from "next/server";
import connectToDatabase from "@/lib/connect-to-database";
import TrustPools from "@/models/trustPool";

export async function GET(req: Request) {
	try {
		await connectToDatabase()

		// find random 3 trust pools
		const trustpools = await TrustPools.aggregate([
			{ $sample: { size: 3 } }
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