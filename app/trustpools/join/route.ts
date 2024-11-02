import {NextResponse} from "next/server";
import connectToDatabase from "@/lib/connect-to-database";
import Users from "@/models/user";
import TrustPools from "@/models/trustPool";

export async function PUT(req: Request) {
	const {userId, trustPoolId, action} = await req.json()

	if (!userId || !trustPoolId) {
		return NextResponse.json({
			status: 400,
			error: "Please provide all required fields",
			message: "Please provide all required fields",
		})
	}

	try {
		await connectToDatabase()

		const user = await Users.findOne({userId})
		const trustpool = await TrustPools.findById(trustPoolId)

		if (!user) {
			return NextResponse.json({
				error: "User not found",
				message: "User not found",
			})
		}

		if (!trustpool) {
			return NextResponse.json({
				error: "Trustpool not found",
				message: "Trustpool not found",
			})
		}

		if (action === "join") {
			// add user to trustpool
			if (!trustpool.members.includes(user._id)) {
				trustpool.members.push(user._id)
				// add the pool to the user's trustpools
				user.trustPools.push(trustPoolId)
			}
		} else if (action === "leave") {
			// remove user from trustpool
			// members won't be populated
			// @ts-ignore will fix later
			const userIndex = trustpool.members.findIndex(m => m === user._id)
			trustpool.members.splice(userIndex, 1)
			// remove the pool from the user's trustpools
			// @ts-ignore will fix later
			const poolIndex = user.trustPools.findIndex(p => p === trustPoolId)
			user.trustPools.splice(poolIndex, 1)
		} else {
			return NextResponse.json({
				status: 400,
				error: "Invalid action",
				message: "Invalid action",
			})
		}

		await user.save()
		await trustpool.save()

		return NextResponse.json({
			status: 200,
			message: "Trustpool updated successfully",
			data: trustpool
		})
	} catch (error) {
		console.error("Error updating trustpool (PUT /trustpools/join): ", error)
		return NextResponse.json({
			error: error,
			message: "Internal server error",
		})
	}
}