import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { getBalanceInSOL, mainPublicKey, sendSol } from "./helpers";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

export const run = async () => {
  const connection = new Connection(clusterApiUrl("devnet"));

  const keypair = getKeypairFromEnvironment("SECRET_KEY");
  const keypair2 = getKeypairFromEnvironment("SECRET_KEY_2");

  const address = new PublicKey(mainPublicKey);
  const address1 = keypair.publicKey;
  const address2 = keypair2.publicKey;

  console.table([
    {
      address: address.toBase58().slice(0, 3),
      balance: await getBalanceInSOL(connection, address, false),
    },
    {
      address: address1.toBase58().slice(0, 3),
      balance: await getBalanceInSOL(connection, address1, false),
    },
    {
      address: address2.toBase58().slice(0, 3),
      balance: await getBalanceInSOL(connection, address2, false),
    },
  ]);

  const signature = await sendSol(connection, keypair2, address1, 0.5);

  console.table([
    {
      address: address.toBase58().slice(0, 3),
      balance: await getBalanceInSOL(connection, address, false),
    },
    {
      address: address1.toBase58().slice(0, 3),
      balance: await getBalanceInSOL(connection, address1, false),
    },
    {
      address: address2.toBase58().slice(0, 3),
      balance: await getBalanceInSOL(connection, address2, false),
    },
  ]);

  console.log(`Transaction signature is ${signature}!`);
};
