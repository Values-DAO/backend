import {NextResponse} from "next/server";
import connectToDatabase from "@/lib/connect-to-database";
import TrustPools from "@/models/trustPool";
import Users from "@/models/user";

export async function DELETE(req: Request) {
	const {searchParams} = new URL(req.url)
	const trustPoolId = searchParams.get("trustPoolId")
	const userId = searchParams.get("userId")

	if (!trustPoolId) {
		return NextResponse.json({
			error: "Please provide trustpool id",
			message: "Please provide trustpool id",
		})
	}

	try {
		await connectToDatabase()

		const user = await Users.findOne({userId})
		const trustpool = await TrustPools.findByIdAndDelete(trustPoolId)

		if (!trustpool) {
			return NextResponse.json({
				error: "Trustpool not found",
				message: "Trustpool not found",
			})
		}

		if (!trustpool.owners.includes(user._id)) {
			return NextResponse.json({
				error: "You are not authorized to delete this trustpool",
				message: "You are not authorized to delete this trustpool",
			})
		}
		
		// delete trustpool from all the users who have it in their trustpools
		await Users.updateMany(
			{trustPools: trustpool._id},
			{$pull: {trustPools: trustpool._id}}
		)

		await TrustPools.findByIdAndDelete(trustPoolId)

		return NextResponse.json({
			status: 200,
			message: "Trustpool deleted successfully",
		})
	} catch (error) {
		console.error("Error deleting trustpool from database (DELETE /trustpools): ", error)
		return NextResponse.json({
			error: error,
			message: "Internal server error",
		})
	}
}