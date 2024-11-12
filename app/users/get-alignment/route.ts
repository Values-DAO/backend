import {NextRequest, NextResponse} from "next/server";
import connectToDatabase from "@/lib/connect-to-database";
import Users from "@/models/user";
import {calculateAlignmentScore, getSpectrumForUser} from "@/lib/calculate-alignment-score";

export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams;
	let viewer = searchParams.get("viewer"); // farcaster or twitter username
	let target = searchParams.get("target");
	
	if (!viewer || !target) {
		return NextResponse.json({
			error: "Please provide viewer and target usernames."
		})
	}
	
	// if viewer or target end with ".eth", remove it
	if (viewer.endsWith(".eth")) {
		viewer = viewer.slice(0, -4)
	}
	
	if (target.endsWith(".eth")) {
		target = target.slice(0, -4)
	}

	// get viewer and target user info
	// calculate alignment score
	try {
		await connectToDatabase()

		const viewerUser = await Users.findOne({
			$text: {$search: viewer}
		})
		const targetUser = await Users.findOne({
			$text: {$search: target}
		})

		if (!viewerUser || !targetUser) {
			throw new Error("Viewer or target user not found.")
		}

		if (
			(viewerUser?.spectrum?.warpcast?.length == 0 &&
				viewerUser?.spectrum?.twitter?.length == 0) ||
			(targetUser?.spectrum?.warpcast?.length == 0 &&
				targetUser?.spectrum?.twitter?.length == 0)
		) {
			throw new Error("Viewer or target user has no twitter or warpcast spectrum.")
		}

		// calculate alignment score
		const alignmentScore = calculateAlignmentScore(viewerUser, targetUser)

		const viewerUserSpectrum = getSpectrumForUser(viewerUser)
		const targetUserSpectrum = getSpectrumForUser(targetUser)

		const viewerUserValues = Array.from(
			new Set([
				...(viewerUser.generatedValues.warpcast || []),
				...(viewerUser.generatedValues.twitter || []),
			])
		);

		const targetUserValues = Array.from(
			new Set([
				...(targetUser.generatedValues.warpcast || []),
				...(targetUser.generatedValues.twitter || []),
			])
		);

		const viewerInfo = {
			username: viewerUser.farcasterUsername || viewerUser.twitterUsername,
			spectrum: viewerUserSpectrum,
			values: viewerUserValues
		}

		const targetInfo = {
			username: targetUser.farcasterUsername || targetUser.twitterUsername,
			spectrum: targetUserSpectrum,
			values: targetUserValues
		}

		return NextResponse.json({
			alignment: {
				alignmentScore,
				viewerInfo,
				targetInfo,
			}
		})
	} catch (error) {
		console.error("Error getting alignment (GET /get-alignment): ", error)
		return NextResponse.json({
			status: 500,
			error: error,
			message: "Error getting alignment"
		})
	}
}