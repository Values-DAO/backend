import connectToDatabase from "@/lib/connect-to-database";
import Values from "@/models/values";
import {NextRequest, NextResponse} from "next/server";
import {v4 as uuidv4} from "uuid";

// The purpose of these handlers is to allow users to create new "value" entries and to fetch a list of existing entries.

export async function POST(req: NextRequest) {
  const {name} = await req.json();

  if (!name) {
    console.error("Name is required (POST /values)");
    return NextResponse.json({
      error: "Name is required",
      message: "Name is required"
    });
  }
  try {
    await connectToDatabase();
    const Value = await Values.create({name, valueId: `value_${uuidv4()}`});
    return NextResponse.json(Value);
  } catch (error: any) {
    if (error.code === 11000) {
      console.error("Duplicate key error (POST /values)");
      return NextResponse.json({
        error: "Duplicate key error",
        message: "Value already exists",
      });
    } else {
      console.error("Error creating value (POST /values)", error);
      return NextResponse.json({
        error: error,
        message: "Internal Server Error",
      });
    }
  }
}

// Fetches all Values from the database and returns an array of objects containing name, valueId and mintersCount.
export async function GET() {
  try {
    await connectToDatabase();
    const values = await Values.find(
      {},
      {name: 1, valueId: 1, _id: 0, minters: 1}
    );
    const updatedValues = values.map((value: any) => ({
      name: value.name,
      valueId: value.valueId,
      mintersCount: value.minters.length,
    }));

    return NextResponse.json(updatedValues);
  } catch (error) {
    console.error("Error fetching values (POST /values)", error);
    return NextResponse.json({
      error: error,
      message: "Internal Server Error",
    });
  }
}