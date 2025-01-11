import {NextResponse} from "next/server";
import connectToDatabase from "@/lib/connect-to-database";
import TrustPools from "@/models/trustPool";
import Users from "@/models/user";
import CultureBook from "@/models/cultureBook";
import CultureToken from "@/models/cultureToken";
import { getEthPriceInUsdc } from "@/lib/services/blockchain";

export async function POST(req: Request) {
	const {
    name,
    description,
    logo,
    communityLink,
    twitterHandle,
    farcasterHandle,
    organizerTwitterHandle,
    userId,
    tokenName,
    tokenSymbol,
    curatorTreasuryAllocation,
    tokenAddress,
    bondingCurveAddress,
  } = await req.json();
	
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
			communityLink,
			twitterHandle,
			farcasterHandle,
			organizerTwitterHandle,
			owners: [user._id],
		})
		
		const cultureBook = await CultureBook.create({
			value_aligned_posts: [],
			top_posters: [],
			core_values: {},
			spectrum: [],
			updateDescription: {
				content: "Initial culture book creation",
			},
		})
		
		const cultureToken = await CultureToken.create({
      name: tokenName,
      symbol: tokenSymbol,
      tokenAddress,
      bondingCurveAddress,
      allocationAddress: {
        curatorTreasuryAllocation,
      },
    });
    
    const initialPrice = 0.000000000024269; // Initial price of the token in ether
    const initialMarketCap = initialPrice * 100000000000 // Initial price * 100 bn ether = 2.4269 ETH
    
    cultureToken.prices.push({price: initialPrice});
    cultureToken.marketCaps.push({marketCap: initialMarketCap});
    cultureToken.chartPrices.push({price: initialPrice, timestamp: new Date().setHours(0, 0, 0, 0)});
    cultureToken.chartMarketCaps.push({ marketCap: initialMarketCap, timestamp: new Date().setHours(0, 0, 0, 0) });
    
		// Link the trust pool, culture book, and culture token together
		cultureBook.cultureToken = cultureToken._id
		cultureBook.trustPool = trustpool._id
		cultureToken.trustPool = trustpool._id
		cultureToken.cultureBook = cultureBook._id
		trustpool.cultureToken = cultureToken._id
		trustpool.cultureBook = cultureBook._id
		
		// Save the trust pool, culture book, and culture token
		await trustpool.save()
		await cultureBook.save()
		await cultureToken.save()
		
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
			message: "Trustpool, Culture Book and Culture Token created successfully",
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