import {NextResponse} from "next/server";
import searchFarcasterUser from "@/lib/search-farcaster-user";

export async function GET(req: Request)  {
	const {searchParams} = new URL(req.url);
	const username = searchParams.get("username");

	if (!username) {
		return NextResponse.json({
			error: "Please provide username",
			message: "Please provide username",
		});
	}

	try {
		const data = await searchFarcasterUser({username});

		return NextResponse.json(data)
	} catch (error) {
		console.error("Error fetching farcaster user wallet (GET /farcaster/wallet)");
		NextResponse.json({
			error: error,
			message: "Internal server error",
		})
	}
}