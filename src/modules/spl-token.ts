import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { mainPublicKey } from "./helpers";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import {
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export const run = async () => {
  const connection = new Connection(clusterApiUrl("devnet"));
  const u2 = getKeypairFromEnvironment("SECRET_KEY");
  const u3 = getKeypairFromEnvironment("SECRET_KEY_2");

  const u1Address = mainPublicKey;
  const { publicKey: u2Address } = u2;
  const { publicKey: u3Address } = u3;

  console.table([
    { name: "user-1", address: u1Address.toBase58().slice(0, 4) },
    { name: "user-2", address: u2Address.toBase58().slice(0, 4) },
    { name: "user-3", address: u3Address.toBase58().slice(0, 4) },
  ]);
  console.log("\n");

  const sss = await connection.getTokenAccountsByOwner(u1Address, {
    programId: TOKEN_PROGRAM_ID,
  });
  const jjj = await connection.getTokenAccountsByOwner(u1Address, {
    programId: TOKEN_2022_PROGRAM_ID,
  });
  console.log({ sss, jjj });             
};
