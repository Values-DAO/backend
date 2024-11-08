import {NextResponse} from "next/server";
import connectToDatabase from "@/lib/connect-to-database";
import Users from "@/models/user"; // Ensure this path is correct
import TrustPools from "@/models/trustPool";

export async function GET(req: Request) {
	const {searchParams} = new URL(req.url)
	const trustPoolId = searchParams.get("trustPoolId")

	if (!trustPoolId) {
		return NextResponse.json({
			status: 400,
			body: {
				error: "Please provide trustpool id",
				message: "Please provide trustpool id",
			}
		})
	}

	try {
		await connectToDatabase()

		const trustpool = await TrustPools.findById(trustPoolId)
      .populate("owners", "farcasterUsername twitterUsername userId")
      .populate({
        path: "members",
        select: "farcasterUsername twitterUsername userId",
        options: { sort: { joinDate: -1 } },
      });

		if (!trustpool) {
			return {
				status: 404,
				body: {
					error: "Trustpool not found",
					message: "Trustpool not found",
				}
			}
		}

		return NextResponse.json({
			status: 200,
			message: "Trustpool found",
			data: trustpool
		})
	} catch (error) {
		console.error("Error fetching trustpool (GET /trustpools/find): ", error)
		return NextResponse.json({
			error: error,
			message: "Internal server error",
		})
	}
}