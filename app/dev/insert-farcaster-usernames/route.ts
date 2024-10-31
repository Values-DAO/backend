import {NextResponse} from "next/server";
import {insertFarcasterUsername} from "@/lib/insert-farcaster-username";


export async function GET(req: Request) {
	if (process.env.NODE_ENV !== "development") {
		return NextResponse.json({error: "Not allowed in production"})
	}

	try {
		await insertFarcasterUsername()
		return NextResponse.json({message: "Inserted farcaster usernames successfully"})
	} catch (error) {
		console.error("Error inserting farcaster usernames: ", error);
		return NextResponse.json({error: "Error inserting farcaster usernames"})
	}
}