import connectToDatabase from "@/lib/connect-to-database";
import {fetchCastsForUser} from "@/lib/fetch-user-casts";
import {fetchUserTweets} from "@/lib/fetch-user-tweets";
import {generateUserValues} from "@/lib/generate-user-values";
import Users from "@/models/user";
import {generateEmailHTML, sendMail} from "@/service/email";
import {NextRequest, NextResponse} from "next/server";

// This route is an API endpoint that processes user data from either Farcaster or Twitter
// to generate a set of values and a "spectrum" representing the user's interests or personality.
// This data is then stored in a database and returned to the client. This route is an API endpoint that
// processes user data from either Farcaster or Twitter to generate a set of values and a "spectrum" representing
// the user's interests or personality. This data is then stored in a database and returned to the client.
// Error Handling: Refactored.
export async function POST(req: NextRequest) {
  const {userId, farcaster, twitter, source} = await req.json();

  const userContentRequirement = 5;

  // Sanity checks
  if (!userId) {
    console.error("Invalid input: 'userId' must be a string. (POST /generate/values)");
    return NextResponse.json({
      status: 400,
      error: "Invalid input: 'userId' must be a string.",
      message: "Invalid input: 'userId' must be a string.",
    });
  }
  if (source !== "twitter" && source !== "farcaster") {
    console.error("Invalid input: 'source' must be either 'twitter' or 'farcaster'. (POST /generate/values)");
    return NextResponse.json({
      status: 400,
      error: "Invalid input: 'source' must be either 'twitter' or 'farcaster'.",
      message: "Invalid input: 'source' must be either 'twitter' or 'farcaster'.",
    });
  }
  if (
    (source === "farcaster" && !farcaster?.fid) ||
    (source === "twitter" && !twitter.id && !twitter.username)
  ) {
    console.error("Invalid input: 'farcaster.fid' or ('twitter.id' and 'twitter.username') must be provided. (POST /generate/values)");
    return NextResponse.json({
      status: 400,
      error: "Invalid input: 'farcaster.fid' or ('twitter.id' and 'twitter.username') must be provided.",
      message: "Invalid input: 'farcaster.fid' or ('twitter.id' and 'twitter.username') must be provided.",
    });
  }

  // Main logic to get user values
  try {
    await connectToDatabase();
    const user = await Users.findOne({userId});

    // Sanity checks
    if (!user) {
      console.error("User not found. (POST /generate/values)");
      return NextResponse.json({
        status: 404,
        error: "User not found.",
        message: "User not found."
      });
    }

    if (
      user.userContentRemarks &&
      user.userContentRemarks[
        source === "farcaster" ? "warpcast" : "twitter"
      ] === `You have less than ${userContentRequirement} tweets/casts.`
    ) {
      return NextResponse.json({
        status: 500,
        error: `You have less than ${userContentRequirement} tweets/casts.`,
        message: `You have less than ${userContentRequirement} tweets/casts.`,
      });
    }


    // If values already exist, return them
    if (
      user.generatedValues &&
      user.generatedValues[source === "farcaster" ? "warpcast" : "twitter"]
        .length > 0
    ) {
      return NextResponse.json({
        status: 200,
        message: "success",
        user: {
          userId: user.userId,
          ...(user.fid && {fid: user.fid}),
          ...(user.twitterUsername && {twitterUsername: user.twitterUsername}),
          ...(user.twitterId && {twitterId: user.twitterId}),
          ...(user.email && {email: user.email}),
          ...(user.wallets && {wallets: user.wallets}),
          wallets: user.wallets,
          profileMinted: user.profileMinted,
          profileNft: user.profileNft,
          balance: user.balance,
          ...(user.mintedValues.length > 0 && {
            mintedValues: (
              await user.populate("mintedValues.value")
            ).mintedValues.map((v: any) => ({
              name: v.value.name,
              weightage: v.weightage,
            })),
          }),
          generatedValues: user.generatedValues,
          generatedValuesWithWeights: user.generatedValuesWithWeights,
          spectrum: user.spectrum,
          socialValuesMinted: user.socialValuesMinted,
          communitiesMinted: user.communitiesMinted,
        },
      });
    }

    // If the values don't exist, generate them

    // Fetch the user content
    let userContent: string[] | any = [];
    if (source === "farcaster" && farcaster?.fid) {
      userContent = await fetchCastsForUser(farcaster?.fid, 100);
    } else {
      userContent = await fetchUserTweets(twitter.id, user.twitterUsername);
    }
    


    if (userContent.error) {
      console.error("Error fetching user content (tweets/casts) (POST /generate/values): ", userContent.error);
      return NextResponse.json({
        status: 500,
        error: userContent.error,
        message: `Error fetching user content (tweets/casts).`,
      });
    }


    if (userContent.length < userContentRequirement) {
      user.userContentRemarks[source === "farcaster" ? "warpcast" : "twitter"] =
        `You have less than ${userContentRequirement} tweets/casts.`;

      await user.save();

      return NextResponse.json({
        status: 500,
        error: `You have less than ${userContentRequirement} tweets/casts.`,
        message: `You have less than ${userContentRequirement} tweets/casts.`,
      });
    }


    // Generate the values and spectrum
    const generatedValues = await generateUserValues(userContent);

    if (generatedValues && generatedValues.error) {
      console.error("Error generating values (POST /generate/values): ", generatedValues.error);
      return NextResponse.json({
        status: 500,
        error: generatedValues.error,
        message: "Error generating values.",
      });
    }

    // Save the values and spectrum to the user

    // Farcaster
    if (source === "farcaster") {
      user.generatedValues.warpcast = generatedValues.topValues.map((value) =>
        value.toLowerCase()
      );
      user.generatedValuesWithWeights.warpcast = generatedValues.userValues;
      user.spectrum.warpcast = generatedValues.userSpectrum;
    }

    // Twitter
    if (source === "twitter") {
      user.generatedValues.twitter = generatedValues.topValues.map((value) =>
        value.toLowerCase()
      );
      user.generatedValuesWithWeights.twitter = generatedValues.userValues;
      user.spectrum.twitter = generatedValues.userSpectrum;
    }

    await user.save();

    // Send email to Pareen and Rayvego
    await sendMail(
      `Values generated via AI`,
      generateEmailHTML({
        action: "USER_VALUES_GENERATED",
        fid: user?.fid,
        email: user.email,
        twitter: user.twitterUsername,
        generatedValues:
          user.generatedValues[source === "farcaster" ? "warpcast" : "twitter"],
        source,
        spectrum:
          user.spectrum[source === "farcaster" ? "warpcast" : "twitter"],
      })
    );


    // Return the user object
    return NextResponse.json({
      status: 200,
      message: "success",
      user: {
        userId: user.userId,
        ...(user.fid && {fid: user.fid}),
        ...(user.twitterUsername && {twitterUsername: user.twitterUsername}),
        ...(user.twitterId && {twitterId: user.twitterId}),
        ...(user.email && {email: user.email}),
        ...(user.wallets && {wallets: user.wallets}),
        wallets: user.wallets,
        profileMinted: user.profileMinted,
        profileNft: user.profileNft,
        balance: user.balance,
        ...(user.mintedValues.length > 0 && {
          mintedValues: (
            await user.populate("mintedValues.value")
          ).mintedValues.map((v: any) => ({
            name: v.value.name,
            weightage: v.weightage,
          })),
        }),
        generatedValues: user.generatedValues,
        generatedValuesWithWeights: user.generatedValuesWithWeights,
        spectrum: user.spectrum,
        socialValuesMinted: user.socialValuesMinted,
        communitiesMinted: user.communitiesMinted,
      },
    });

  } catch (error) {
    console.error("An error occurred (POST /generate/values): ", error);
    return NextResponse.json({
      status: 500,
      error: error,
      message: `Internal server error.`,
    });
  }
}