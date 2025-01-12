import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { encodeAbiParameters, keccak256, parseAbiParameters } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// @ts-ignore
export function calculateCommunityId(sender, name, symbol, blockNumber) {
  return keccak256(
    encodeAbiParameters(parseAbiParameters("address, string, string, uint256"), [sender, name, symbol, blockNumber])
  );
}


// // GraphQL Query
// export const GET_INITIALISED_EVENTS = gql`
//   query GetInitialisedEvents(
//     $first: Int = 10
//     $skip: Int = 0
//     $orderBy: Initialised_orderBy = blockTimestamp
//     $orderDirection: OrderDirection = desc
//   ) {
//     initialiseds(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
//       id
//       creator
//       name
//       symbol
//       createdTokenAddy
//       communityId
//       blockNumber
//       blockTimestamp
//       transactionHash
//     }
//   }
// `;

// // Hook or Function to use the query
// export function useInitialisedEvents() {
//   const { loading, error, data } = useQuery(GET_INITIALISED_EVENTS, {
//     variables: {
//       first: 10, // Adjust as needed
//       skip: 0,
//     },
//   });

//   return {
//     initialisedEvents: data?.initialiseds || [],
//     loading,
//     error,
//   };
// }

// // If you want to get a specific communityId
// export const GET_INITIALISED_EVENT_BY_COMMUNITY_ID = gql`
//   query GetInitialisedEventByCommunityId($communityId: Bytes!) {
//     initialiseds(where: { communityId: $communityId }, first: 1) {
//       id
//       creator
//       name
//       symbol
//       createdTokenAddy
//       communityId
//       blockNumber
//       blockTimestamp
//       transactionHash
//     }
//   }
// `;

// // Function to fetch a specific communityId
// export function useInitialisedEventByCommunityId(communityId: string) {
//   const { loading, error, data } = useQuery(GET_INITIALISED_EVENT_BY_COMMUNITY_ID, {
//     variables: { communityId },
//   });

//   return {
//     initialisedEvent: data?.initialiseds[0] || null,
//     loading,
//     error,
//   };
// }


