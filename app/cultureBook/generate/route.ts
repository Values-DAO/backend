import { CultureBotCommunity, type Message, type PopulatedCommunity } from "@/models/cultureBotCommunity";
import TrustPools from "@/models/trustPool";
import connectToDatabase from "@/lib/connect-to-database";
import { NextResponse } from "next/server";
import { generateCommunityValues } from "@/lib/generate-community-values";
import { extractValueAlignedPosts } from "@/lib/extract-value-aligned-posts";

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
    console.log("AI extracting for Trust Pool: ", trustpool.name)

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
    
    // All messages
    // const messages = community.messages.map((message: Message) => ({
    //   text: message.text,
    //   senderUsername: message.senderUsername,
    //   createdAt: message.createdAt,
    // }));

    // const slicedMessages = messages
    
    
    // Time limit message screening
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
      messageTgId: message?.messageTgId,
      posterTgId: message.senderTgId,
    }));

    let slicedMessages = messages
    
    // return if no messages found
    if (slicedMessages.length === 0) {
      return NextResponse.json({
        status: 404,
        error: "No messages found in the last week",
        message: "No messages found in the last week",
      });
    }
    
    // remove messages that don't have text
    // @ts-ignore
    slicedMessages = slicedMessages.filter((message) => message.text);
    
    console.log("Messages: ", slicedMessages);
    
    console.log(slicedMessages.length, "messages found in the last week for trustpool", trustpool.name);
    
    // Check if the community values have already been generated
    if (trustpool.cultureBook.core_values && trustpool.cultureBook.core_values.size > 0) {
      // Update the values
      console.log(`Community values already generated. Updating the posts for ${trustpool.name}...`);
      let { value_aligned_posts } = await extractValueAlignedPosts({
        messages: slicedMessages,
        spectrum: trustpool.cultureBook.spectrum,
      });
      
      if (value_aligned_posts.length === 0) {
        return NextResponse.json({
          status: 200,
          message: "No new value aligned posts found",
          data: {
            value_aligned_posts,
          },
        });
      } else {
        console.log(`${value_aligned_posts.length} Value Aligned Posts extracted successfully.`);
      }
      
      // remove duplicates from the value_aligned_posts array
      value_aligned_posts = Array.from(new Set(value_aligned_posts.map((post) => JSON.stringify(post)))).map((post) =>
        JSON.parse(post)
      );
      
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
      
      if (core_values.size === 0 || spectrum.length === 0 || !core_values || !spectrum) {
        return NextResponse.json({
          status: 404,
          error: "No community values generated",
          message: "No community values generated",
        });
      } else {
        console.log("Generated Core Values and Spectrum successfully.");
      }

      trustpool.cultureBook.core_values = core_values;
      trustpool.cultureBook.spectrum = spectrum;
      
      // Update the values
      let { value_aligned_posts } = await extractValueAlignedPosts({
        messages: slicedMessages,
        spectrum,
      });
      
      if (value_aligned_posts.length === 0) {
        return NextResponse.json({
          status: 200,
          message: "No new value aligned posts found",
          data: {
            value_aligned_posts,
          },
        });
      } else {
        console.log(`${value_aligned_posts.length} Value Aligned Posts extracted successfully.`);
      }

      // remove duplicates from the value_aligned_posts array
      value_aligned_posts = Array.from(new Set(value_aligned_posts.map((post) => JSON.stringify(post)))).map((post) =>
        JSON.parse(post)
      );
      
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
          value_aligned_posts,
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