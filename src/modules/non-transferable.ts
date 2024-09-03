import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";
import { mainPublicKey } from "./helpers";
import {
  createAccount,
  createInitializeMintInstruction,
  createInitializeNonTransferableMintInstruction,
  ExtensionType,
  getMintLen,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
export const run = async () => {
  console.log("Running non-transferable module");

  const decimals = 9;
  const connection = new Connection(clusterApiUrl("devnet"));
  const u2 = getKeypairFromEnvironment("SECRET_KEY");
  const u3 = getKeypairFromEnvironment("SECRET_KEY_2");

  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  console.log(
    "\nmint public key: " + mintKeypair.publicKey.toBase58() + "\n\n"
  );

  await createNonTransferableMint(connection, u2, mintKeypair, decimals);

  await mintMan(connection, u2, mint, decimals, mainPublicKey);

  const destinationAccount = await createAccount(
    connection,
    u2,
    mintKeypair.publicKey,
    u3.publicKey,
    undefined,
    { commitment: "finalized" },
    TOKEN_2022_PROGRAM_ID,
  );
};

export async function createNonTransferableMint(
  connection: Connection,
  payer: Keypair,
  mintKeypair: Keypair,
  decimals: number
): Promise<TransactionSignature> {
  const extensions = [ExtensionType.NonTransferable];
  const mintLength = getMintLen(extensions);

  const mintLamports =
    await connection.getMinimumBalanceForRentExemption(mintLength);

  console.log("Creating a transaction with non-transferable instruction...");
  const mintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLength,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeNonTransferableMintInstruction(
      mintKeypair.publicKey,
      TOKEN_2022_PROGRAM_ID
    ),
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      decimals,
      payer.publicKey,
      null,
      TOKEN_2022_PROGRAM_ID
    )
  );

  const signature = await sendAndConfirmTransaction(
    connection,
    mintTransaction,
    [payer, mintKeypair],
    { commitment: "finalized" }
  );

  return signature;
}

export const mintMan = async (
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  decimals: number,
  recipient: PublicKey
) => {
  console.log("Creating an Associated Token Account...");
  const ata = (
    await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      recipient,
      undefined,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )
  ).address;

  console.log("Minting 1 token...");

  const amount = 1 * 10 ** decimals;
  await mintTo(
    connection,
    payer,
    mint,
    ata,
    payer,
    amount,
    [payer],
    { commitment: "finalized" },
    TOKEN_2022_PROGRAM_ID
  );
  const tokenBalance = await connection.getTokenAccountBalance(
    ata,
    "finalized"
  );

  console.log(
    `Account ${ata.toBase58()} now has ${tokenBalance.value.uiAmount} token.`
  );
};
