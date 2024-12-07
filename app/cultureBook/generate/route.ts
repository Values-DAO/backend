import { CultureBotCommunity, type Message, type PopulatedCommunity } from "@/models/cultureBotCommunity";
import TrustPools from "@/models/trustPool";
import connectToDatabase from "@/lib/connect-to-database";
import { NextResponse } from "next/server";
import { generateCommunityValues } from "@/lib/generate-community-values";
import { updateCommunityValues } from "@/lib/update-community-values";

// * This route will generate the community values for a given community.
// * If it is for the first time then it will generate the values and save them to the trustpool.
// * If not then it will run the update prompt and update the content.

export async function POST(req: Request) {
	// get trustpoolId from the request body
  const { trustPoolId } = await req.json();

	if (!trustPoolId) {
		return NextResponse.json({
			status: 400,
			error: "Invalid input: 'trustPoolId' must be a string.",
			message: "Invalid input: 'trustPoolId' must be a string.",
		});
	}
	
	try {
    await connectToDatabase();
    const trustpool = await TrustPools.findById(trustPoolId).populate("cultureBook")
    console.log(trustpool)

    if (!trustpool) {
      return NextResponse.json({
        status: 404,
        error: "Trustpool not found",
        message: "Trustpool not found",
      });
    }

    const community = await CultureBotCommunity.findOne({ trustPool: trustPoolId }).populate("messages");

    if (!community) {
      return NextResponse.json({
        status: 404,
        error: "Community not found",
        message: "Community not found",
      });
    }

    const messages = community.messages.map((message: Message) => ({
      text: message.text,
      senderUsername: message.senderUsername,
      createdAt: message.createdAt,
    }));
    
    // TODO: Remove this after testing!!
    const slicedMessages = messages.slice(-100)
    
    if (trustpool.cultureBook.core_values && trustpool.cultureBook.core_values.size > 0) {
      // Update the values
      const { value_aligned_posts } = await updateCommunityValues({
        messages: slicedMessages,
        core_values: trustpool.cultureBook.core_values,
        spectrum: trustpool.cultureBook.spectrum,
      });
      
      // value_aligned_posts.forEach((post) => {
      //   post.onchain = false;
      //   post.votes.count = 0;
      // })
      
      // Update the CultureBook fields
      trustpool.cultureBook.value_aligned_posts.push(...value_aligned_posts);

      // Save the updated CultureBook
      await trustpool.cultureBook.save();

      return NextResponse.json({
        status: 200,
        message: "Value aligned posts extracted successfully",
        data: {
          value_aligned_posts,
        },
      });
    } else {
      // Generate the values
      const { core_values, spectrum } = await generateCommunityValues(slicedMessages);

      trustpool.cultureBook.core_values = core_values;
      trustpool.cultureBook.spectrum = spectrum;

      // await trustpool.cultureBook.save();

      // Update the values
      const { value_aligned_posts } = await updateCommunityValues({
        messages: slicedMessages,
        core_values: trustpool.cultureBook.core_values,
        spectrum: trustpool.cultureBook.spectrum,
      });
      
      // value_aligned_posts.forEach((post) => {
      //   post.onchain = false;
      //   post.votes.count = 0;
      // })

      // Update the CultureBook fields
      trustpool.cultureBook.value_aligned_posts.push(...value_aligned_posts);

      // Save the updated CultureBook
      await trustpool.cultureBook.save();

      return NextResponse.json({
        status: 200,
        message: "Community values generated and posts extracted successfully",
        data: {
          core_values,
          spectrum,
        },
      });
    }
  } catch (error) {
		console.error("Error generating community values (GET /cultureCommunity): ", error);
		return NextResponse.json({
			status: 500,
			error: "Error generating community values",
			message: "Error generating community values",
		});
	}
}