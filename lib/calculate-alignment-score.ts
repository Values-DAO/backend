import {IUser, SpectrumItem} from "@/types";

export const calculateAverageScore = (scores: (number | undefined)[]): number => {
  // Filter out undefined scores
  const validScores = scores.filter((score): score is number => score !== undefined);

  return validScores.length
    ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
    : 0;
};

// Takes in a user object and returns an array of SpectrumItems.
export const getSpectrumForUser = (user: IUser): SpectrumItem[] => {
  const {warpcast, twitter} = user.spectrum;
  const maxLength = Math.max(warpcast?.length ?? 0, twitter?.length ?? 0);

  return Array.from({length: maxLength}, (_, i) => {
    const warpcastItem = warpcast?.[i];
    const twitterItem = twitter?.[i];
    return {
      name: warpcastItem?.name ?? twitterItem?.name ?? `Item ${i + 1}`,
      score: calculateAverageScore([warpcastItem?.score, twitterItem?.score]),
      description: warpcastItem?.description ?? twitterItem?.description ?? "",
    };
  });
};

// Takes in two user objects and returns a string representing the alignment score.
export const calculateAlignmentScore = (user: IUser, targetUser: IUser) => {
  const userSpectrum = getSpectrumForUser(user);
  const targetSpectrum = getSpectrumForUser(targetUser);

  // Calculate the total difference in scores across all dimensions in the spectra.
  const totalDifference = userSpectrum.reduce((sum, item, i) => {
    const difference = Math.abs(item.score - (targetSpectrum[i]?.score ?? 0));
    return sum + difference;
  }, 0);

  // Calculate the average difference in scores across all dimensions.
  const avgDifference = totalDifference / userSpectrum.length;

  // The alignment score is calculated as 100 minus the average difference.
  // A higher alignment score indicates greater similarity between the users.
  const alignmentScore = 100 - avgDifference;

  return alignmentScore.toFixed(2);
};