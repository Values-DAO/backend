import connectToDatabase from "@/lib/connect-to-database";
import Users from "@/models/user";
import {getFarcasterUsernameFromFID} from "@/lib/get-farcaster-user";
import { resolve } from "path";

export const insertFarcasterUsername = async () => {
	try {
		await connectToDatabase()

		let skip = 0
		const BATCH_SIZE = 10
		let users;

		do {
			users = await Users.find({ farcasterUsername: { $exists: false } })
        .skip(skip)
        .limit(BATCH_SIZE);

			for (const user of users) {
				const {fid, farcasterUsername} = user
				
				if (!fid) {
					console.log(`No fid found for user ${fid}`)
					continue
				}
				
				if (farcasterUsername) {
					console.log(`User ${fid} already has farcaster username ${farcasterUsername}`)
					continue
				}

				const fetchedFarcasterUsername = await getFarcasterUsernameFromFID(fid)

				if (fetchedFarcasterUsername) {
					const res = await Users.updateOne({fid}, {$set: {farcasterUsername: fetchedFarcasterUsername}})
					console.log(`Updated user ${fid} with farcaster username ${fetchedFarcasterUsername}`)
				} else {
					console.log(`No farcaster username found for user ${fid}`)
				}

			}
			skip += BATCH_SIZE
		} while (users.length > 0)

		console.log("Finished inserting farcaster usernames")
	} catch (error) {
		console.error("Error inserting farcaster usernames", error)
	}
}