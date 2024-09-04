import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";
import { initializeModule } from "./helpers";
import {
  burn,
  closeAccount,
  createAccount,
  createInitializeMintCloseAuthorityInstruction,
  createInitializeMintInstruction,
  ExtensionType,
  getAccount,
  getMint,
  getMintLen,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import chalk from "chalk";

export const run = async () => {
  console.log("\nRunning close-mint module");

  const { connection, u2, u3 } = await initializeModule("local");

  const mintKeyPair = Keypair.generate();
  const { publicKey: mint } = mintKeyPair;
  console.log("\nMint:", chalk.yellow(mint.toBase58()));

  const decimals = 5;
  await createClosableMint(connection, u2, mintKeyPair, decimals);

  console.log("\nCreating sourceAccount...");
  const sourceAccount = await createAccount(
    connection,
    u3,
    mint,
    u3.publicKey,
    undefined,
    { commitment: "finalized" },
    TOKEN_2022_PROGRAM_ID
  );

  console.log("Minting 1 token to sourceAccount...");
  const amount = 1 * LAMPORTS_PER_SOL;
  await mintTo(
    connection,
    u2,
    mint,
    sourceAccount,
    u2,
    amount,
    [u2],
    { commitment: "finalized" },
    TOKEN_2022_PROGRAM_ID
  );
  console.log(chalk.green("Minted 1 token to sourceAccount"));

  const mintInfo = await getMint(
    connection,
    mintKeyPair.publicKey,
    "finalized",
    TOKEN_2022_PROGRAM_ID
  );
  console.log("\nInitial supply: ", mintInfo.supply);

  try {
    await closeAccount(
      connection,
      u2,
      mintKeyPair.publicKey,
      u2.publicKey,
      u2,
      [],
      { commitment: "finalized" },
      TOKEN_2022_PROGRAM_ID
    );
    console.log(chalk.green("\nClose account successful"));
  } catch (e) {
    console.log(
      "\nClose account fails here because the supply is not zero. Check the program logs:",
      (e as any).logs
    );
    console.log(chalk.red("\nClose account failed"));
  }

  const sourceAccountInfo = await getAccount(
    connection,
    sourceAccount,
    "finalized",
    TOKEN_2022_PROGRAM_ID
  );

  console.log("\nBurning the supply...");
  const burnSignature = await burn(
    connection,
    u3,
    sourceAccount,
    mintKeyPair.publicKey,
    u3,
    sourceAccountInfo.amount,
    [],
    { commitment: "finalized" },
    TOKEN_2022_PROGRAM_ID
  );
  console.log(chalk.green("Burn successful"));

  const mintInfo1 = await getMint(
    connection,
    mintKeyPair.publicKey,
    "finalized",
    TOKEN_2022_PROGRAM_ID
  );

  console.log("\nAfter burn supply: ", mintInfo1.supply);

  const accountInfoBeforeClose = await connection.getAccountInfo(
    mintKeyPair.publicKey,
    "finalized"
  );

  console.log("\nAccount closed? ", accountInfoBeforeClose === null);

  console.log("\nClosing account after burning the supply...");
  const closeSignature = await closeAccount(
    connection,
    u2,
    mintKeyPair.publicKey,
    u2.publicKey,
    u2,
    [],
    { commitment: "finalized" },
    TOKEN_2022_PROGRAM_ID
  );
  console.log(chalk.green("Close account successful"));

  const accountInfoAfterClose = await connection.getAccountInfo(
    mintKeyPair.publicKey,
    "finalized"
  );

  console.log("\nAccount closed? ", accountInfoAfterClose === null);
};

export async function createClosableMint(
  connection: Connection,
  payer: Keypair,
  mintKeypair: Keypair,
  decimals: number
): Promise<TransactionSignature> {
  const extensions = [ExtensionType.MintCloseAuthority];
  const mintLength = getMintLen(extensions);

  const mintLamports =
    await connection.getMinimumBalanceForRentExemption(mintLength);

  console.log("\nCreating a transaction with close mint instruction...");
  const mintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLength,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeMintCloseAuthorityInstruction(
      mintKeypair.publicKey,
      payer.publicKey,
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

  console.log("Sending transaction...");
  const signature = await sendAndConfirmTransaction(
    connection,
    mintTransaction,
    [payer, mintKeypair],
    { commitment: "finalized" }
  );
  console.log(chalk.green("Transaction confirmed"));

  return signature;
}
