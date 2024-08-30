import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { createTokenMetaData, mainPublicKey, explorerLinkLog } from "./helpers";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
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

  console.log("\nCreating mint...");
  // const mint = await createMint(connection, u2, u2Address, u2Address, 5);
  const mint = new PublicKey("GydgWTemzimjQgKpiBzn9ATEuXxQNMJnzzyp9fe316hj");
  console.log("Mint created!", mint.toBase58());
  explorerLinkLog(mint.toBase58(), "address");

  // console.log("\nStoring token metadata...");
  // const metaDataTransactionSignature = await createTokenMetaData(
  //   connection,
  //   mint,
  //   { name: "Elpis Moon", symbol: "E_MOON" },
  //   u2
  // );
  // console.log("Token metadata stored!");
  // explorerLinkLog(metaDataTransactionSignature);

  console.log("\nGetting or creating associated token account for u1...");
  const u1AssociatedTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    u2,
    mint,
    u1Address
  );
  console.log(
    "Associated token account created!",
    u1AssociatedTokenAccount.address.toBase58()
  );
  explorerLinkLog(u1AssociatedTokenAccount.address.toBase58(), "address");

  console.log("\nGetting or creating associated token account for u2...");
  const u2AssociatedTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    u2,
    mint,
    u2Address
  );
  console.log(
    "Associated token account created!",
    u2AssociatedTokenAccount.address.toBase58()
  );
  explorerLinkLog(u2AssociatedTokenAccount.address.toBase58(), "address");

  console.log("\nGetting or creating associated token account for u3...");
  const u3AssociatedTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    u3,
    mint,
    u3Address
  );
  console.log(
    "Associated token account created!",
    u3AssociatedTokenAccount.address.toBase58()
  );
  explorerLinkLog(u3AssociatedTokenAccount.address.toBase58(), "address");

  console.log("\n");
  console.table([
    {
      name: "user-1",
      address: u1Address.toBase58().slice(0, 4),
      associated: u1AssociatedTokenAccount.address.toBase58().slice(0, 4),
      amount: u1AssociatedTokenAccount.amount / BigInt(100000),
    },
    {
      name: "user-2",
      address: u2Address.toBase58().slice(0, 4),
      associated: u2AssociatedTokenAccount.address.toBase58().slice(0, 4),
      amount: u2AssociatedTokenAccount.amount / BigInt(100000),
    },
    {
      name: "user-3",
      address: u3Address.toBase58().slice(0, 4),
      associated: u3AssociatedTokenAccount.address.toBase58().slice(0, 4),
      amount: u3AssociatedTokenAccount.amount / BigInt(100000),
    },
  ]);

  console.log("\nMinting tokens to u2...");
  const mintTransactionSignature = await mintTo(
    connection,
    u2,
    mint,
    u2AssociatedTokenAccount.address,
    u2Address,
    620 * 100000
  );
  console.log("Tokens minted!");
  explorerLinkLog(mintTransactionSignature);

  console.log("\nMinting tokens to u1...");
  const mintTransactionSignature3 = await mintTo(
    connection,
    u2,
    mint,
    u1AssociatedTokenAccount.address,
    u2Address,
    500 * 100000
  );
  console.log("Tokens minted!");
  explorerLinkLog(mintTransactionSignature3);

  console.log("\nTransferring tokens from u2 to u3...");
  const transferTransactionSignature = await transfer(
    connection,
    u2,
    u2AssociatedTokenAccount.address,
    u3AssociatedTokenAccount.address,
    u2Address,
    20 * 100000
  );
  console.log("Tokens transferred!");
  explorerLinkLog(transferTransactionSignature);

  let u1TokenBalance = await connection.getTokenAccountBalance(
    u1AssociatedTokenAccount.address
  );
  let u2TokenBalance = await connection.getTokenAccountBalance(
    u2AssociatedTokenAccount.address
  );
  let u3TokenBalance = await connection.getTokenAccountBalance(
    u3AssociatedTokenAccount.address
  );

  console.log("\n");
  console.table([
    {
      name: "user-1",
      address: u1Address.toBase58().slice(0, 4),
      associated: u1AssociatedTokenAccount.address.toBase58().slice(0, 4),
      amount: u1TokenBalance.value.uiAmount,
    },
    {
      name: "user-2",
      address: u2Address.toBase58().slice(0, 4),
      associated: u2AssociatedTokenAccount.address.toBase58().slice(0, 4),
      amount: u2TokenBalance.value.uiAmount,
    },
    {
      name: "user-3",
      address: u3Address.toBase58().slice(0, 4),
      associated: u3AssociatedTokenAccount.address.toBase58().slice(0, 4),
      amount: u3TokenBalance.value.uiAmount,
    },
  ]);
};
