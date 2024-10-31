import connectToDatabase from "@/lib/connect-to-database";
import Users from "@/models/user";
import {getFarcasterUsernameFromFID} from "@/lib/get-farcaster-user";

export const insertFarcasterUsername = async () => {
	try {
		await connectToDatabase()

		let skip = 0
		const BATCH_SIZE = 100
		let users;

		do {
			users = await Users.find({farcasterUsername: {$exists: false}})
				.skip(skip)
				.limit(100)

			for (const user of users) {
				const {fid} = user

				const farcasterUsername = await getFarcasterUsernameFromFID(fid)

				if (!farcasterUsername) {
					console.log(`No farcaster username found for user ${fid}`)
					continue
				}

				if (farcasterUsername) {
					await Users.updateOne({fid}, {$set: {farcasterUsername}})
					console.log(`Updated user ${fid} with farcaster username ${farcasterUsername}`)
				} else {
					console.log(`No farcaster username found for user ${fid}`)
				}

				skip += BATCH_SIZE
			}
		} while (users.length > 0)

		console.log("Finished inserting farcaster usernames")
	} catch (error) {
		console.error("Error inserting farcaster usernames", error)
	}
}