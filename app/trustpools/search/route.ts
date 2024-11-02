import {NextResponse} from "next/server";
import connectToDatabase from "@/lib/connect-to-database";
import TrustPools from "@/models/trustPool";

export async function GET(req: Request) {
	const {searchParams} = new URL(req.url)
	const name = searchParams.get("name")

	if (!name) {
		return NextResponse.json({
			error: "Please provide trustpool name",
			message: "Please provide trustpool name",
		})
	}

	try {
		await connectToDatabase()

		const trustpool = await TrustPools.find(
			{name: {$regex: name, $options: "i"}}
		)
			.select("name description logo _id")
			.limit(3)

		if (!trustpool) {
			return NextResponse.json({
				error: "Trustpool not found",
				message: "Trustpool not found",
			})
		}

		const response = trustpool.map(pool => ({
			_id: pool._id,
			name: pool.name,
			description: pool.description,
			logo: pool.logo,
		}))

		return NextResponse.json(response)
	} catch (error) {
		console.error("Error fetching trustpool from database (GET /trustpools/search): ", error)
		return NextResponse.json({
			error: error,
			message: "Internal server error",
		})
	}
}