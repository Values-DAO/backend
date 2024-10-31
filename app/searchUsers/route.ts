import {NextResponse} from "next/server";
import connectToDatabase from "@/lib/connect-to-database";
import Users from "@/models/user";

export async function GET(req: Request) {
	const {searchParams} = new URL(req.url)
	const username = searchParams.get("username")

	if (!username) {
		return NextResponse.json({
			error: "Please provide username",
			message: "Please provide username",
		})
	}

	try {
		await connectToDatabase()

		const users = await Users.find({
			$or: [
				{farcasterUsername: {$regex: username, $options: "i"}}, // case-insensitive and partial match
				{twitterUsername: {$regex: username, $options: "i"}},
			]
		})
			.select("farcasterUsername twitterUsername fid")
			.limit(7)

		const response = users.map(user => ({
			username: user.farcasterUsername || user.twitterUsername,
			fid: user.fid,
		}))

		return NextResponse.json(response)
	} catch (error) {
		console.error("Error fetching user from database (GET /searchUsers): ", error)
		return NextResponse.json({
			error: error,
			message: "Internal server error",
		})
	}
}