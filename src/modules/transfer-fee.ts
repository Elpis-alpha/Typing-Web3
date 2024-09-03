import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";
import chalk from "chalk";
import {
  createAndAirdropKeypair,
  getBalanceInSOL,
  localConnectionURL,
  sendSol,
} from "./helpers";
import {
  calculateFee,
  createAccount,
  createAssociatedTokenAccount,
  createInitializeMintInstruction,
  createInitializeTransferFeeConfigInstruction,
  ExtensionType,
  getAccount,
  getMint,
  getMintLen,
  getTransferFeeAmount,
  getTransferFeeConfig,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
  transferCheckedWithFee,
} from "@solana/spl-token";

export const run = async () => {
  console.log("\nRunning transfer-fee module");

  const connection = new Connection(localConnectionURL, "confirmed");
  console.log("\nConnection to localnet cluster established");

  const u2 = getKeypairFromEnvironment("SECRET_KEY");
  console.log("\nu2:", chalk.yellow(u2.publicKey.toBase58()));

  const balance = await getBalanceInSOL(connection, u2.publicKey, false);
  console.log("bal:", chalk.yellow(balance));

  const u3 = getKeypairFromEnvironment("SECRET_KEY_2");
  console.log("\nu3:", chalk.yellow(u3.publicKey.toBase58()));

  const balance2 = await getBalanceInSOL(connection, u3.publicKey, false);
  console.log("bal:", chalk.yellow(balance2));

  const u4 = getKeypairFromEnvironment("SECRET_KEY_3");
  console.log("\nu4:", chalk.yellow(u4.publicKey.toBase58()));

  const balance3 = await getBalanceInSOL(connection, u4.publicKey, false);
  console.log("bal:", chalk.yellow(balance3));

  const mintKeyPair = Keypair.generate();
  const { publicKey: mint } = mintKeyPair;
  console.log("\nMint:", chalk.yellow(mint.toBase58()));

  // CREATE MINT WITH TRANSFER FEE
  const decimals = 9;
  const feeBasisPoints = 1000;
  const maxFee = BigInt(5000);

  await createMintWithTransferFee(
    connection,
    u2,
    mintKeyPair,
    decimals,
    feeBasisPoints,
    maxFee
  );

  // CREATE FEE VAULT ACCOUNT
  console.log("\nCreating a fee vault account...");
  const feeVaultAccount = await createAssociatedTokenAccount(
    connection,
    u2,
    mintKeyPair.publicKey,
    u2.publicKey,
    { commitment: "finalized" },
    TOKEN_2022_PROGRAM_ID
  );
  const initialBalance = (
    await connection.getTokenAccountBalance(feeVaultAccount, "finalized")
  ).value.amount;
  console.log("Current fee vault balance: ", chalk.yellow(initialBalance));

  // CREATE A SOURCE AND DESTINATION ACCOUNT AND MINT TOKEN
  console.log("\nCreating source account...");
  const sourceAccount = await createAccount(
    connection,
    u3,
    mint,
    u3.publicKey,
    undefined,
    { commitment: "finalized" },
    TOKEN_2022_PROGRAM_ID
  );

  console.log("Creating destination account...");
  const destinationAccount = await createAccount(
    connection,
    u4,
    mint,
    u4.publicKey,
    undefined,
    { commitment: "finalized" },
    TOKEN_2022_PROGRAM_ID
  );

  console.log("Minting 10 tokens to source...");
  const amountToMint = 10 * 10 ** decimals;
  await mintTo(
    connection,
    u3,
    mint,
    sourceAccount,
    u2,
    amountToMint,
    [u2],
    { commitment: "finalized" },
    TOKEN_2022_PROGRAM_ID
  );
  console.log(chalk.green("Minted 10 tokens to source"));

  // TRANSFER TOKENS
  console.log("\nTransferring with fee transaction...");
  const transferAmount = BigInt(1 * 10 ** decimals);
  const mintAccount = await getMint(
    connection,
    mint,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );
  const transferFeeAmount = getTransferFeeConfig(mintAccount);
  const fee = calculateFee(
    transferFeeAmount?.newerTransferFee!,
    transferAmount
  );

  const transferSignature = await transferCheckedWithFee(
    connection,
    u2,
    sourceAccount,
    mint,
    destinationAccount,
    u3.publicKey,
    transferAmount,
    decimals,
    fee,
    [u3],
    { commitment: "finalized" },
    TOKEN_2022_PROGRAM_ID
  );

  const sourceAccountAfterTransfer = await getAccount(
    connection,
    sourceAccount,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  const destinationAccountAfterTransfer = await getAccount(
    connection,
    destinationAccount,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  const withheldAmountAfterTransfer = getTransferFeeAmount(
    destinationAccountAfterTransfer
  );

  console.log(
    `Source Token Balance:`,
    chalk.yellow(sourceAccountAfterTransfer.amount)
  );
  console.log(
    `Destination Token Balance:`,
    chalk.yellow(destinationAccountAfterTransfer.amount)
  );
  console.log(
    `Withheld Transfer Fees:`,
    chalk.yellow(withheldAmountAfterTransfer?.withheldAmount)
  );

  // // FETCH ACCOUNTS WITH WITHHELD TOKENS

  // // WITHDRAW WITHHELD TOKENS

  // // VERIFY UPDATED FEE VAULT BALANCE

  // // HARVEST WITHHELD TOKENS TO MINT

  // // WITHDRAW HARVESTED TOKENS

  // // VERIFY UPDATED FEE VAULT BALANCE
};

export async function createMintWithTransferFee(
  connection: Connection,
  payer: Keypair,
  mintKeypair: Keypair,
  decimals: number,
  feeBasisPoints: number,
  maxFee: bigint
): Promise<TransactionSignature> {
  const extensions = [ExtensionType.TransferFeeConfig];
  const mintLength = getMintLen(extensions);

  const mintLamports =
    await connection.getMinimumBalanceForRentExemption(mintLength);

  console.log("\nCreating a transaction with transfer fee instruction...");
  const mintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLength,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeTransferFeeConfigInstruction(
      mintKeypair.publicKey,
      payer.publicKey,
      payer.publicKey,
      feeBasisPoints,
      maxFee,
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
