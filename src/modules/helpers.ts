// @ts-ignore
import { createMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import chalk from "chalk";
import Irys from "@irys/sdk";
import fs from "fs";
import {
  getKeypairFromEnvironment,
  requestAndConfirmAirdrop,
} from "@solana-developers/helpers";

export const mainPublicKey = new PublicKey(
  "47iCpoU7bscsdHJ26ZHtTFDvRD1JWHZAr7u1n4ALD4Eu"
);

export const ELPIS_TEST_MINT_PUBLIC_KEY = new PublicKey(
  "pqsVvug9nLqPDsA4GLgnfUYuGoLQEfb76s4hAynWBYH"
);

export const PING_COUNTER_PUBLIC_KEY = new PublicKey(
  "ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa"
);

export const PING_DATA_PUBLIC_KEY = new PublicKey(
  "Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod"
);

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const localConnectionURL = "http://127.0.0.1:8899";

const imageURL =
  "https://arweave.net/o2HYz76cY8rdGyj-N09ogXioRCe74yMBZZ8nO4fsRzc";

type explorerLinkType = "tx" | "address" | "token" | "block";
export const explorerLinkLog = (
  signature: string,
  type: explorerLinkType = "tx",
  network = "devnet"
) => {
  console.log(
    chalk
      .hex("#478be6")
      .underline(
        `https://explorer.solana.com/${type}/${signature}?cluster=${network}`
      ) + ";"
  );
};

export const shortenAddress = (address: string, chars = 4) => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const createAndAirdropKeypair = async (
  connection: Connection
): Promise<Keypair> => {
  const keypair = Keypair.generate();
  console.log("\nPublic key:", chalk.yellow(keypair.publicKey.toBase58()));
  console.log("Secret key:", chalk.yellow(keypair.secretKey.toString()));

  await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL * 10);
  return keypair;
};

type cType = "local" | "dev" | "main" | "test";
export const initializeModule = async (connectionType: cType) => {
  let connectionURL = "";

  switch (connectionType) {
    case "local":
      connectionURL = localConnectionURL;
    case "dev":
      connectionURL = clusterApiUrl("devnet");
    case "main":
      connectionURL = clusterApiUrl("mainnet-beta");
    case "test":
      connectionURL = clusterApiUrl("testnet");
    default:
      connectionURL = localConnectionURL;
  }

  const connection = new Connection(connectionURL, "confirmed");
  console.log(`\nConnection to ${connectionType}net cluster established`);

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

  return { connection, u2, u3, u4 };
};

export const getBalanceInSOL = async (
  connection: Connection,
  publicKey: PublicKey,
  log = true
) => {
  const balance = await connection.getBalance(publicKey);
  const balanceInSol = balance / LAMPORTS_PER_SOL;

  if (log)
    console.log(
      `The balance of the account at ${publicKey.toBase58()} is ${balanceInSol} SOL`
    );
  return balanceInSol;
};

export const sendSol = async (
  connection: Connection,
  from: Keypair,
  to: PublicKey,
  amountInSol: number
) => {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to,
      lamports: LAMPORTS_PER_SOL * amountInSol,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [
    from,
  ]);

  return signature;
};

interface tokenMetadataType {
  name: string;
  symbol: string;
  uri?: string;
}
export const createTokenMetaData = async (
  connection: Connection,
  tokenMintAccount: PublicKey,
  tokenMetaData: tokenMetadataType,
  owner: Keypair
) => {
  const metadataData = {
    ...tokenMetaData,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
    uri: imageURL,
  };

  const metadataPDAAndBump = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      tokenMintAccount.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const metadataPDA = metadataPDAAndBump[0];

  const transaction = new Transaction();

  const createMetadataAccountInstruction = createMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: tokenMintAccount,
      mintAuthority: owner.publicKey,
      payer: owner.publicKey,
      updateAuthority: owner.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        collectionDetails: null,
        data: metadataData,
        isMutable: true,
      },
    }
  );

  transaction.add(createMetadataAccountInstruction);

  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [owner]
  );

  return transactionSignature;
};

//  metadata-extension helper functions
export interface CreateNFTInputs {
  payer: Keypair;
  connection: Connection;
  tokenName: string;
  tokenSymbol: string;
  tokenUri: string;
  tokenAdditionalMetadata?: Record<string, string>;
}

export interface UploadOffChainMetadataInputs {
  tokenName: string;
  tokenSymbol: string;
  tokenDescription: string;
  tokenExternalUrl: string;
  tokenAdditionalMetadata?: Record<string, string>;
  imagePath: string;
  metadataPath: string;
}

function formatIrysUrl(id: string) {
  return `https://gateway.irys.xyz/${id}`;
}

const getIrysArweave = async (secretKey: Uint8Array) => {
  const irys = new Irys({
    network: "devnet",
    token: "solana",
    key: secretKey,
    config: {
      providerUrl: clusterApiUrl("devnet"),
    },
  });
  return irys;
};

export async function uploadOffChainMetadata(
  inputs: UploadOffChainMetadataInputs,
  payer: Keypair
) {
  const {
    tokenName,
    tokenSymbol,
    tokenDescription,
    tokenExternalUrl,
    imagePath,
    tokenAdditionalMetadata,
    metadataPath,
  } = inputs;

  const irys = await getIrysArweave(payer.secretKey);

  const imageUploadReceipt = await irys.uploadFile(imagePath);

  const metadata = {
    name: tokenName,
    symbol: tokenSymbol,
    description: tokenDescription,
    external_url: tokenExternalUrl,
    image: formatIrysUrl(imageUploadReceipt.id),
    attributes: Object.entries(tokenAdditionalMetadata || []).map(
      ([trait_type, value]) => ({ trait_type, value })
    ),
  };

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 4), {
    flag: "w",
  });

  const metadataUploadReceipt = await irys.uploadFile(metadataPath);

  return formatIrysUrl(metadataUploadReceipt.id);
}
