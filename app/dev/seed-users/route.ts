import seedUsers from "@/lib/seed-users";
import {NextResponse} from "next/server";


export async function GET(req: Request) {
	if (process.env.NODE_ENV !== "development") {
		return NextResponse.json({error: "Not allowed in production"})
	}

	try {
		await seedUsers()
		return NextResponse.json({message: "Users seeded successfully"})
	} catch (error) {
		console.error("Error seeding users", error);
		return NextResponse.json({error: "Error seeding users"})
	}
}