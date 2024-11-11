import {NextResponse} from "next/server";
import connectToDatabase from "@/lib/connect-to-database";
import TrustPools from "@/models/trustPool";

export async function GET(req: Request) {
	const {searchParams} = new URL(req.url)
	const trustPoolId = searchParams.get("trustPoolId")
	const username = searchParams.get("username")

	if (!trustPoolId || !username) {
		return {
			status: 400,
			body: {
				error: "Please provide trustpool ID and username",
				message: "Please provide trustpool ID and username",
			}
		}
	}

	try {
		await connectToDatabase()

		const trustpool = await TrustPools.findById(trustPoolId)
			.populate({
				path: "members",
				match: {
					$or: [
						{ farcasterUsername: { $regex: username, $options: "i" } },
						{ twitterUsername: { $regex: username, $options: "i" } },
						{ email: { $regex: username, $options: "i" } },
					],
				},
				select: "username farcasterUsername twitterUsername _id email",
			})

		if (trustpool.members.length === 0) {
			return NextResponse.json({
				error: "Trustpool user not found",
				message: "Trustpool user not found",
			})
		}

		return NextResponse.json({
			status: 200,
			message: "Users found successfully",
			data: trustpool.members,
		});
	} catch (error) {
		console.error("Error fetching user from trustpool (GET /trustpools/userSearch): ", error)
		return NextResponse.json({
			error: error,
			message: "Internal server error",
		})
	}
}