import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import chalk from "chalk";

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
}

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

  const createMetadataAccountInstruction =
    createCreateMetadataAccountV3Instruction(
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
