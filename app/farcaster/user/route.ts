import { NextResponse} from "next/server";
import {getFarcasterUser} from "@/lib/get-farcaster-user";

export async function GET(req: Request) {
		const { searchParams } = new URL(req.url);
	const fid = searchParams.get("fid");

	if (!fid || isNaN(Number(fid))) {
		return NextResponse.json({
			error: "Please provide fid, and fid should be a valid number",
			message: "Please provide fid, and fid should be a valid number",
		});
	}

	try {
		const data = await getFarcasterUser(parseInt(fid as string));

		return NextResponse.json(data)
	} catch (error) {
		console.error("Error fetching farcaster user (GET /farcaster/user)");
		NextResponse.json({
			error: error,
			message: "Internal server error",
		})
	}
}