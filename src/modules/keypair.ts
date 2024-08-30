import { addKeypairToEnvFile, getKeypairFromEnvironment } from "@solana-developers/helpers";
import { Keypair } from "@solana/web3.js";

export const run = async () => {
  // const keypair = Keypair.generate();

  console.log(process.env.SECRET_KEY);
  const keypair = getKeypairFromEnvironment("SECRET_KEY");

  console.log(`The public key is ${keypair.publicKey.toString()}`);
  console.log(`The secret key is ${keypair.secretKey}`);
};
 