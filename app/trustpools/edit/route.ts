import {NextResponse} from "next/server";
import connectToDatabase from "@/lib/connect-to-database";
import Users from "@/models/user";
import TrustPools from "@/models/trustPool";

export async function PUT(req: Request) {
	const data = await req.json()
	const valuesToChange = data.valuesToChange
	const trustPoolId = data.trustPoolId
	const userId = data.userId

	if (!valuesToChange || !trustPoolId) {
		return NextResponse.json({
			status: 400,
			body: {
				error: "Please provide trustpool id and values to change",
				message: "Please provide trustpool id and values to change",
			}
		})
	}

	try {
		await connectToDatabase()

		const user = await Users.findOne({userId})
		const trustpool = await TrustPools.findById(trustPoolId)

		if (!trustpool) {
			return NextResponse.json({
				error: "Trustpool not found",
				message: "Trustpool not found",
			})
		}

		if (!trustpool.owners.includes(user._id)) {
			return NextResponse.json({
				error: "You are not authorized to edit this trustpool",
				message: "You are not authorized to edit this trustpool",
			})
		}

		const updatedTrustpool = await TrustPools.findByIdAndUpdate(
			trustPoolId,
			{ $set: valuesToChange },
			{ new: true } // Return the updated document
		);

		return NextResponse.json({
			status: 200,
			message: "Trustpool updated successfully",
			data: updatedTrustpool
		})
	} catch (error) {
		console.error("Error updating trustpool (PUT /trustpools/edit): ", error)
		return NextResponse.json({
			error: error,
			message: "Internal server error",
		})
	}
}