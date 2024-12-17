import { CultureBotCommunity, type Message, type PopulatedCommunity } from "@/models/cultureBotCommunity";
import TrustPools from "@/models/trustPool";
import connectToDatabase from "@/lib/connect-to-database";
import { NextResponse } from "next/server";
import { generateCommunityValues } from "@/lib/generate-community-values";
import { updateCommunityValues } from "@/lib/update-community-values";

// * This route will generate the community values for a given community for the first time 
// * it is called for a community. It will also extract the value-aligned posts from the chat history.
// * For subsequent calls, it will only extract the value-aligned posts from the chat history.

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
    console.log("Trust Pool Name: ", trustpool.name)

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
    
    // // TODO: Remove this after testing!!
    // const slicedMessages = messages.slice(-100)
    
    // Get current time
    const now = new Date();
    
    // Calculate last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const filteredMessages = community.messages.filter((message: Message) => {
      const messageDate = new Date(message.createdAt);
      return messageDate >= oneWeekAgo;
    });
    
    const messages = filteredMessages.map((message: Message) => ({
      text: message.text,
      senderUsername: message.senderUsername,
      createdAt: message.createdAt,
    }));

    const slicedMessages = messages
    
    console.log(messages.length, " messages found in the last week for trustpool ", trustpool.name);
    
    // Check if the community values have already been generated
    if (trustpool.cultureBook.core_values && trustpool.cultureBook.core_values.size > 0) {
      // Update the values
      const { value_aligned_posts } = await updateCommunityValues({
        messages: slicedMessages,
        core_values: trustpool.cultureBook.core_values,
        spectrum: trustpool.cultureBook.spectrum,
      });
      
      // Update the CultureBook fields
      trustpool.cultureBook.value_aligned_posts.push(...value_aligned_posts);
      
      console.log("Value aligned posts for trustpool ", trustpool.name, " are: ", value_aligned_posts);
      
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
      
      console.log("Core values for trustpool ", trustpool.name, " are: ", core_values)
      console.log("Spectrum for trustpool ", trustpool.name, " is: ", spectrum)

      // Update the values
      const { value_aligned_posts } = await updateCommunityValues({
        messages: slicedMessages,
        core_values: trustpool.cultureBook.core_values,
        spectrum: trustpool.cultureBook.spectrum,
      });
      
      // Update the CultureBook fields
      trustpool.cultureBook.value_aligned_posts.push(...value_aligned_posts);
      
      console.log("Value aligned posts for trustpool ", trustpool.name, " are: ",  value_aligned_posts)
      
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
    // return NextResponse.json({
    //   status: 200,
    //   message: "test worked",
    //   data: {
    //     value_aligned_posts: [],
    //   },
    // });
  } catch (error) {
		console.error("Error generating community values (GET /cultureCommunity): ", error);
		return NextResponse.json({
			status: 500,
			error: "Error generating community values",
			message: "Error generating community values",
		});
	}
}