import { CultureBotMessage } from "@/models/cultureBotMessage";
import { CultureBotCommunity, type Message, type PopulatedCommunity } from "@/models/cultureBotCommunity";
import TrustPools from "@/models/trustPool";
import connectToDatabase from "@/lib/connect-to-database";
import { NextResponse } from "next/server";
import { generateCommunityValues } from "@/lib/generate-community-values";
import { updateCommunityValues } from "@/lib/update-community-values";
import { v4 } from "uuid";

// * This route will generate the community values for a given community.
// * If it is for the first time then it will generate the values and save them to the trustpool.
// * If not then it will run the update prompt and update the content.

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const trustPoolId = searchParams.get("trustPoolId");

	if (!trustPoolId) {
		return NextResponse.json({
			status: 400,
			error: "Invalid input: 'trustPoolId' must be a string.",
			message: "Invalid input: 'trustPoolId' must be a string.",
		});
	}
	
	try {
    await connectToDatabase();
    const trustpool = await TrustPools.findById(trustPoolId);

    if (!trustpool) {
      return NextResponse.json({
        status: 404,
        error: "Trustpool not found",
        message: "Trustpool not found",
      });
    }

    const mess = await CultureBotMessage.find({ trustPoolId });

    const community = await CultureBotCommunity.findOne({ trustPoolId }).populate("messages");

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
    
    const slicedMessages = messages.slice(0, 20)
    
    if (trustpool.core_values && trustpool.core_values.size > 0) {
      // Update the values
      const { core_values, spectrum, value_aligned_posts, top_posters, description } = await updateCommunityValues({
        messages: slicedMessages,
        core_values: trustpool.core_values,
        spectrum: trustpool.spectrum,
      });

      trustpool.core_values = core_values;
      trustpool.spectrum = spectrum;
      // value_aligned_posts.forEach((post) => {
      //   post.id = v4();
      // });
      trustpool.value_aligned_posts.push(...value_aligned_posts);
      trustpool.top_posters.push(...top_posters);
      trustpool.updateDescription = { content: description };
      
      await trustpool.save();
      
      return NextResponse.json({
        status: 200,
        message: "Community values updated successfully",
        data: {
          core_values,
          spectrum,
          value_aligned_posts,
          top_posters,
          description
        }
      })
    }

    // Generate the values
    const { core_values, spectrum, value_aligned_posts, top_posters, description } = await generateCommunityValues(
      slicedMessages
    );

    trustpool.core_values = core_values;
    trustpool.spectrum = spectrum;
    // want to give each post a unique id using uuid
    // value_aligned_posts.forEach((post) => {
    //   post.id = v4();
    // });
    trustpool.value_aligned_posts.push(...value_aligned_posts);
    trustpool.top_posters.push(...top_posters);
    trustpool.updateDescription = {content: description};
    
    await trustpool.save();
    
    return NextResponse.json({
      status: 200,
      message: "Community values generated successfully",
      data: {
        core_values,
        spectrum,
        value_aligned_posts,
        top_posters,
        description,
      }
    })
  } catch (error) {
		console.error("Error generating community values (GET /cultureCommunity): ", error);
		return NextResponse.json({
			status: 500,
			error: "Error generating community values",
			message: "Error generating community values",
		});
	}
}