import connectToDatabase from "@/lib/connect-to-database";
import {getRandomValues, valuesForSeeding } from "@/constants/values";
import Users from "@/models/user";

const seedUsers = async () => {
	console.log("Seeding users");
	try {
		await connectToDatabase()

		const usersData = Array.from({ length: 10 }, (_, index) => ({
			userId: `user${index + 11}`,
			profileMinted: Math.random() > 0.5,
			profileNft: Math.floor(Math.random() * 100),
			email: `user${index + 1}@example.com`,
			fid: Math.floor(Math.random() * 1000),
			// farcasterUsername: `farcaster_user${index + 1}`,
			twitterUsername: `twitter_user${index + 1}`,
			twitterId: `twitterId${index + 1}`,
			wallets: [`wallet${index + 1}`, `wallet${index + 2}`],
			generatedValues: {
				twitter: getRandomValues(valuesForSeeding, 5),
				warpcast: getRandomValues(valuesForSeeding, 5),
			},
			generatedValuesWithWeights: {
				twitter: new Map(
					getRandomValues(valuesForSeeding, 5).map(value => [value, Math.floor(Math.random() * 100)])
				),
				warpcast: new Map(
					getRandomValues(valuesForSeeding, 5).map(value => [value, Math.floor(Math.random() * 100)])
				),
			},
			spectrum: {
				warpcast: getRandomValues(valuesForSeeding, 3).map(value => ({
					name: value,
					description: `Description for ${value}`,
					score: Math.floor(Math.random() * 100),
				})),
				twitter: getRandomValues(valuesForSeeding, 3).map(value => ({
					name: value,
					description: `Description for ${value}`,
					score: Math.floor(Math.random() * 100),
				})),
			},
			userContentRemarks: {
				warpcast: `Remark for user ${index + 1} warpcast`,
				twitter: `Remark for user ${index + 1} twitter`,
			},
			// mintedValues: getRandomValues(valuesForSeeding, 3).map(value => ({
			// 	value: value,
			// 	weightage: Math.floor(Math.random() * 10),
			// })),
			balance: Math.floor(Math.random() * 10),
			userTxHashes: [
				{
					txHash: `txHash${index + 1}`,
					createdAt: new Date(),
				},
			],
			communitiesMinted: [],
			attestations: getRandomValues(valuesForSeeding, 3),
			referrer: `referrer${index + 1}`,
			socialValuesMinted: getRandomValues(valuesForSeeding, 3),
		}));

		await Users.insertMany(usersData)
		console.log("Users seeded successfully");
	} catch (error) {
		console.error("Error seeding users", error);
	}
}

export default seedUsers;