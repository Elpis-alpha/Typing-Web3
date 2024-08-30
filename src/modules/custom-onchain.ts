import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import {
  clusterApiUrl,
  Connection,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { PING_COUNTER_PUBLIC_KEY, PING_DATA_PUBLIC_KEY, explorerLinkLog } from "./helpers";

export const run = async () => {
  const connection = new Connection(clusterApiUrl("devnet"));

  const keypair = getKeypairFromEnvironment("SECRET_KEY");
  const keypair2 = getKeypairFromEnvironment("SECRET_KEY_2");

  const programId = PING_COUNTER_PUBLIC_KEY;
  const programDataId = PING_DATA_PUBLIC_KEY;

  const transaction = new Transaction().add(
    new TransactionInstruction({
      keys: [{ pubkey: programDataId, isSigner: false, isWritable: true }],
      programId,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [keypair])

  explorerLinkLog(signature);
  // console.log(`✅ Transaction completed! Signature is ${signature}`);
};
