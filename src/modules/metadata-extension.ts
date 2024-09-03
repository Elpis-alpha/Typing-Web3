import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { CreateNFTInputs, uploadOffChainMetadata } from "./helpers";
import {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";
import {
  AuthorityType,
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToCheckedInstruction,
  createSetAuthorityInstruction,
  ExtensionType,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  getMintLen,
  getTokenMetadata,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";

export const run = async () => {
  console.log("Running metadata-extension module");

  const connection = new Connection(clusterApiUrl("devnet"));
  // const connection = new Connection(localConnectionURL);

  const u2 = getKeypairFromEnvironment("SECRET_KEY");

  // cat nft data
  const imagePath = "assets/cat.png";
  const metadataPath = "assets/temp.json";
  const tokenName = "Cat NFT";
  const tokenDescription = "This is a cat";
  const tokenSymbol = "EMB";
  const tokenExternalUrl = "https://solana.com/";
  const tokenAdditionalMetadata = {
    species: "Cat",
    breed: "Cool",
  };

  // const tokenUri = await uploadOffChainMetadata(
  //   {
  //     tokenName,
  //     tokenDescription,
  //     tokenSymbol,
  //     imagePath,
  //     metadataPath,
  //     tokenExternalUrl,
  //     tokenAdditionalMetadata,
  //   },
  //   u2
  // );
  const tokenUri =
    "https://devnet.irys.xyz/y-qA5J6oCRhfyA6Myd4THpHqIPT64mAqZRnzbxHiT80";

  // You can log the URI here and run the code to test it
  console.log("Token URI:", tokenUri);

  await createNFTWithEmbeddedMetadata({
    payer: u2,
    connection,
    tokenName,
    tokenSymbol,
    tokenUri,
  });
};

const createNFTWithEmbeddedMetadata = async (inputs: CreateNFTInputs) => {
  const {
    connection,
    payer,
    tokenName,
    tokenSymbol,
    tokenUri,
    tokenAdditionalMetadata,
  } = inputs;

  const mint = Keypair.generate();
  const decimals = 0;
  const supply = 1;

  // create the metadata object
  const metadata: TokenMetadata = {
    mint: mint.publicKey,
    name: tokenName,
    symbol: tokenSymbol,
    uri: tokenUri,
    additionalMetadata: Object.entries(tokenAdditionalMetadata || []).map(
      ([key, value]) => [key, value]
    ),
  };

  // Allocating mint
  const mintLen = getMintLen([ExtensionType.MetadataPointer]);
  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
  const lamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen
  );

  const createMintAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    lamports,
    newAccountPubkey: mint.publicKey,
    programId: TOKEN_2022_PROGRAM_ID,
    space: mintLen,
  });

  const initMetadataPointerInstruction =
    createInitializeMetadataPointerInstruction(
      mint.publicKey,
      payer.publicKey,
      mint.publicKey, // important
      TOKEN_2022_PROGRAM_ID
    );

  const initMintInstruction = createInitializeMintInstruction(
    mint.publicKey,
    decimals,
    payer.publicKey,
    payer.publicKey,
    TOKEN_2022_PROGRAM_ID
  );

  const initMetadataInstruction = createInitializeInstruction({
    programId: TOKEN_2022_PROGRAM_ID,
    mint: mint.publicKey,
    metadata: mint.publicKey,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    mintAuthority: payer.publicKey,
    updateAuthority: payer.publicKey,
  });

  const setExtraMetadataInstructions = [];
  for (const attributes of Object.entries(tokenAdditionalMetadata || [])) {
    setExtraMetadataInstructions.push(
      createUpdateFieldInstruction({
        updateAuthority: payer.publicKey,
        metadata: mint.publicKey,
        field: attributes[0],
        value: attributes[1],
        programId: TOKEN_2022_PROGRAM_ID,
      })
    );
  }

  const astacc = await getAssociatedTokenAddress(
    mint.publicKey,
    payer.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID
  );
  const createATAInstruction = createAssociatedTokenAccountInstruction(
    payer.publicKey,
    astacc,
    payer.publicKey,
    mint.publicKey,
    TOKEN_2022_PROGRAM_ID
  );

  const mintInstruction = createMintToCheckedInstruction(
    mint.publicKey,
    astacc,
    payer.publicKey,
    supply, // NFTs should have a supply of one
    decimals,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  // NFTs should have no mint authority so no one can mint any more of the same NFT
  const setMintTokenAuthorityInstruction = createSetAuthorityInstruction(
    mint.publicKey,
    payer.publicKey,
    AuthorityType.MintTokens,
    null,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  const transaction = new Transaction().add(
    createMintAccountInstruction,
    initMetadataPointerInstruction,
    initMintInstruction,
    initMetadataInstruction,
    ...setExtraMetadataInstructions,
    createATAInstruction,
    mintInstruction,
    setMintTokenAuthorityInstruction
  );
  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, mint]
  );

  const accountDetails = await getAccount(
    connection,
    astacc,
    "finalized",
    TOKEN_2022_PROGRAM_ID
  );
  console.log("Associate Token Account =====>", accountDetails);

  const mintDetails = await getMint(
    connection,
    mint.publicKey,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );
  console.log("Mint =====>", mintDetails);

  const onChainMetadata = await getTokenMetadata(connection, mint.publicKey);
  console.log("onchain metadata =====>", onChainMetadata);

  if (onChainMetadata && onChainMetadata.uri) {
    const offChainMetadata = await fetch(onChainMetadata.uri).then((res) =>
      res.json()
    );
    console.log("Mint off-chain metadata =====>", offChainMetadata);
  }
};
