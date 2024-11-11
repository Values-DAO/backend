// Given a trustpool and a user, this route will return the top 3 most aligned and top 3 most diverse set of people along with their twitter and farcaster handles

import {NextResponse} from "next/server";
import connectToDatabase from "@/lib/connect-to-database";
import Users from "@/models/user";
import TrustPools from "@/models/trustPool";
import {calculateAverageScore} from "@/lib/calculate-alignment-score";
import {SpectrumItem, IUser} from "@/types";

const getSpectrum = (spectrum: IUser["spectrum"]): SpectrumItem[] => {
	const {warpcast, twitter} = spectrum;
	const maxLength = Math.max(warpcast?.length ?? 0, twitter?.length ?? 0);

	return Array.from({length: maxLength}, (_, i) => {
		const warpcastItem = warpcast?.[i];
		const twitterItem = twitter?.[i];
		return {
			name: warpcastItem?.name ?? twitterItem?.name ?? `Item ${i + 1}`,
			score: calculateAverageScore([warpcastItem?.score, twitterItem?.score]),
			description: warpcastItem?.description ?? twitterItem?.description ?? "",
		};
	});
}

const getAlignment = (userSpectrum: SpectrumItem[], targetSpectrum: SpectrumItem[]) => {
	// Calculate the total difference in scores across all dimensions in the spectra.
	const totalDifference = userSpectrum.reduce((sum, item, i) => {
		const difference = Math.abs(item.score - (targetSpectrum[i]?.score ?? 0));
		return sum + difference;
	}, 0);

	// Calculate the average difference in scores across all dimensions.
	const avgDifference = totalDifference / userSpectrum.length;

	// The alignment score is calculated as 100 minus the average difference.
	// A higher alignment score indicates greater similarity between the users.
	const alignmentScore = 100 - avgDifference;

	return alignmentScore.toFixed(2);
}

export async function GET(req: Request) {
	const {searchParams} = new URL(req.url)
	const trustPoolId = searchParams.get("trustPoolId")
	const userId = searchParams.get("userId")

	if (!trustPoolId || !userId) {
		return {
			status: 400,
			body: {
				error: "Please provide trustpool ID and user ID",
				message: "Please provide trustpool ID and user ID",
			}
		}
	}

	try {
		await connectToDatabase()

		const user = await Users.findOne({userId})
		const trustpool = await TrustPools.findById(trustPoolId)
			.populate("owners", "farcasterUsername twitterUsername spectrum userId")
			.populate("members", "farcasterUsername twitterUsername spectrum userId");

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
		
		// combine all members and owners and store in an array
		let allUsers = [...trustpool.owners, ...trustpool.members];
		// console.log("allUsers: ", allUsers)
		
		// remove all the users who don't have farcaster or twitter usernames
		// allUsers is an array of objects
		
		allUsers = allUsers.filter(u => u.farcasterUsername || u.twitterUsername);
		// console.log(allUsers)
		
		// remove the user from the array if they are in the trustpool
		if (allUsers.some(u => u.userId === user.userId)) {
			allUsers.splice(allUsers.findIndex(u => u.userId === user.userId), 1);
		}
		
		// console.log("allUsers after removing user: ", allUsers)

		// calculate alignment between user and all other users
		const userSpectrum = getSpectrum(user.spectrum);
		let alignmentScores = allUsers.map(u => {
			const targetSpectrum = getSpectrum(u.spectrum);
			return {
				userId: u.userId,
				alignmentScore: getAlignment(userSpectrum, targetSpectrum),
				farcasterUsername: u.farcasterUsername,
				twitterUsername: u.twitterUsername,
			}
		})
		
		// console.log(alignmentScores)
		
		// remove NaN alignment scores
		alignmentScores = alignmentScores.filter(a => !isNaN(parseFloat(a.alignmentScore)));
		
		// sort alignmentScores based on alignmentScore in descending order
		alignmentScores.sort((a, b) => parseFloat(b.alignmentScore) - parseFloat(a.alignmentScore));

		// get top 3 most aligned users
		const topAlignedUsers = alignmentScores.slice(0, 3);

		// get top 3 most diverse users
		const topDiverseUsers = alignmentScores.slice(-3);
		
		// reverse the topDiverseUsers array to get the most diverse users first
		topDiverseUsers.reverse();
		
		return NextResponse.json({
			status: 200,
			message: "Alignment found successfully",
			data: {
				topAlignedUsers,
				topDiverseUsers,
			}
		})

	} catch (error) {
		console.error("Error fetching alignment between trustpool and user (GET /trustpools/alignment): ", error)
		return NextResponse.json({
			error: error,
			message: "Internal server error",
		})
	}
}