import {NextResponse} from "next/server";
import connectToDatabase from "@/lib/connect-to-database";
import TrustPools from "@/models/trustPool";
import Users from "@/models/user";

export async function POST(req: Request) {
	const {name, description, logo, telegramLink, twitterHandle, organizerTwitterHandle, userId} = await req.json()

	if (!name || !userId) {
		return NextResponse.json({
			status: 400,
			error: "Please provide all required fields",
			message: "Please provide all required fields",
		})
	}

	try {
		await connectToDatabase()
		const user = await Users.findOne({userId})

		const trustpool = await TrustPools.create({
			name,
			description,
			logo,
			telegramLink,
			twitterHandle,
			organizerTwitterHandle,
			owners: [user._id],
		})


		if (!user.trustPools) {
			user.trustPools = []; // Initialize if the field doesn't exist
		}

		// Add the trust pool ID to the user's trustPools array if it doesn't already exist
		if (!user.trustPools.includes(trustpool._id)) {
			user.trustPools.push(trustpool._id);
		}

		// Save the user with the updated trustPools
		await user.save();

		return NextResponse.json({
			status: 201,
			message: "Trustpool created successfully",
			data: trustpool
		})
	} catch (error) {
		console.error("Error creating trustpool (POST /trustpools/new): ", error)
		return NextResponse.json({
			error: error,
			message: "Internal server error",
		})
	}
}