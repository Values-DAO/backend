import { ethers } from "ethers";

export const storeMessageOnChain = async (ipfsHash: string): Promise<string> => {
    const wallet = new ethers.Wallet(
      process.env.WALLET_PRIVATE_KEY_FOR_IPFS!,
      new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL)
    );
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();

    // Encode message data with IPFS hash
    const messageData = abiCoder.encode(["string"], [ipfsHash]);

    const tx = await wallet.sendTransaction({
      to: wallet.address,
      data: messageData,
      value: 0,
      gasLimit: 150000,
    });

    const receipt = await tx.wait();
    if (!receipt?.hash) throw new Error("Transaction failed");
    
    console.log("Stored message on chain with transaction hash:", receipt.hash);
    
    return receipt.hash;
  }