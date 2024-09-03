import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { getBalanceInSOL, mainPublicKey } from "./helpers";

export const run = async () => {
  console.log("Running transfer-fee module");

  const connection = new Connection(clusterApiUrl("devnet"));
  const u2 = getKeypairFromEnvironment("SECRET_KEY");

  const balance = await getBalanceInSOL(connection, mainPublicKey);
  console.log("Balance: " + balance);
};
