import { Connection } from "@solana/web3.js";
import { localConnectionURL } from "./helpers";

export const run = async () => {
  console.log("\nRunning close-mint module");

  const connection = new Connection(localConnectionURL, "confirmed");
  console.log("\nConnection to localnet cluster established");
};
