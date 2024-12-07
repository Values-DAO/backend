import { PinataSDK } from "pinata-web3";

export const storeMessageOnIpfs = async (message: string) => {
  try {
    const pinata = new PinataSDK({
      pinataJwt: process.env.PINATA_JWT,
      pinataGateway: process.env.PINATA_GATEWAY,
    });

    const file = new File([message], "message.txt", { type: "text/plain" });
    const upload = await pinata.upload.file(file);
    console.log("Uploaded message to IPFS:");
    console.log(upload);
    return upload;
  } catch (error) {
    console.error("Error storing message on IPFS:", error);
    return;
  }
};
