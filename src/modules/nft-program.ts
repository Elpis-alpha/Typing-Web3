import {
  irysStorage,
  keypairIdentity,
  Metaplex,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { readFileSync } from "fs";
import { explorerLinkLog, shortenAddress } from "./helpers";

export const run = async () => {
  // console.clear();
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const u2 = getKeypairFromEnvironment("SECRET_KEY");
  console.log(
    `Loaded keypair u2: ${shortenAddress(u2.publicKey.toBase58(), 3)}`
  );

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(u2))
    .use(
      irysStorage({
        address: "https://devnet.irys.xyz",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );
  console.log("Metaplex initialized");

  // Creates a new NFT collection
  // createNFTCollection(metaplex, u2);

  // Create an NFT in the collection
  // createNFTinCollection(metaplex, u2);

  // Update an NFT in the collection
  // updateNFTinCollection(metaplex, u2);
};

const createNFTCollection = async (metaplex: Metaplex, u2: Keypair) => {
  const collectionNFTData = {
    name: "E_MOON Wings Bag",
    symbol: "EMWC",
    description: "E_MOON Wings Collection",
    sellerFeeBasisPoints: 100,
    imageFile: "./assets/nft.png",
    isCollection: true,
    collectionAuthority: u2,
  };

  const buffer = readFileSync(collectionNFTData.imageFile);
  const file = toMetaplexFile(buffer, collectionNFTData.imageFile);
  const imageUri = await metaplex.storage().upload(file);
  console.log("uri: ", imageUri);

  const uploadedMetadataOutput = await metaplex.nfts().uploadMetadata({
    name: collectionNFTData.name,
    symbol: collectionNFTData.symbol,
    description: collectionNFTData.description,
    image: imageUri,
  });

  const collectionURI = uploadedMetadataOutput.uri;
  console.log("Collection offchain metadata URI:", collectionURI);

  const collectionNFTOutput = await metaplex.nfts().create(
    {
      uri: collectionURI,
      name: collectionNFTData.name,
      sellerFeeBasisPoints: collectionNFTData.sellerFeeBasisPoints,
      symbol: collectionNFTData.symbol,
      isCollection: true,
    },
    { commitment: "finalized" }
  );
  const collectionNFT = collectionNFTOutput.nft;
  console.log(`Collection NFT address is`, collectionNFT.address.toString());
  explorerLinkLog(collectionNFT.address.toString(), "address");
};

const createNFTinCollection = async (metaplex: Metaplex, u2: Keypair) => {
  console.log("Creating NFT in collection");

  const nftData = {
    name: "E_MOON Wings",
    description: "E_MOON Wings NFT",
    symbol: "EMW",
    sellerFeeBasisPoints: 100,
    imageFile: "./assets/nft.png",
    collection: new PublicKey("4csfjkL5JaKjvmK9cCPnSbknY1DcnTnSEMGgQxwg8Yit"),
  };

  const buffer = readFileSync(nftData.imageFile);
  const file = toMetaplexFile(buffer, nftData.imageFile);
  const imageUri = await metaplex.storage().upload(file);
  console.log("\nuri: ", imageUri);

  const uploadedMetadataOutput = await metaplex.nfts().uploadMetadata({
    name: nftData.name,
    symbol: nftData.symbol,
    description: nftData.description,
    image: imageUri,
  });
  const metadataUri = uploadedMetadataOutput.uri;
  console.log("\nMetadata offchain URI:", metadataUri);

  const collection = await metaplex
    .nfts()
    .findByMint({ mintAddress: nftData.collection });
  console.log("\nCollection: ", collection.address.toString());

  const createdNFTOutput = await metaplex.nfts().create(
    {
      uri: metadataUri,
      name: nftData.name,
      sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
      symbol: nftData.symbol,
      collection: collection.address,
    },
    { commitment: "finalized" }
  );
  const nft = createdNFTOutput.nft;
  console.log(`NFT address is`, nft.address.toString());
  explorerLinkLog(nft.address.toString(), "address");

  await metaplex.nfts().verifyCollection({
    mintAddress: nft.mint.address,
    collectionMintAddress: collection.address,
    isSizedCollection: true,
  });
  console.log("\nNFT verified in collection");
};

const updateNFTinCollection = async (metaplex: Metaplex, u2: Keypair) => {
  const updatedNFTData = {
    name: "E_MOON Wings (updated)",
    description: "E_MOON Wings NFT",
    symbol: "EMW",
    sellerFeeBasisPoints: 100,
    imageFile: "./assets/nft.png",
    nftAddress: new PublicKey("AcpREHAJsJbfrd61KyjLJbQQ5A9NVhtCry5H6pirNh4r"),
  };

  const nft = await metaplex
    .nfts()
    .findByMint({ mintAddress: updatedNFTData.nftAddress });

  const buffer = readFileSync(updatedNFTData.imageFile);
  const file = toMetaplexFile(buffer, updatedNFTData.imageFile);
  const imageUri = await metaplex.storage().upload(file);
  console.log("\nuri: ", imageUri);

  const uploadedMetadataOutput = await metaplex.nfts().uploadMetadata({
    name: updatedNFTData.name,
    symbol: updatedNFTData.symbol,
    description: updatedNFTData.description,
    image: imageUri,
  });
  const metadataUri = uploadedMetadataOutput.uri;
  console.log("\nMetadata offchain URI:", metadataUri);

  const { response } = await metaplex.nfts().update(
    {
      nftOrSft: nft,
      uri: metadataUri,
      name: updatedNFTData.name,
    },
    { commitment: "finalized" }
  );
  console.log(`NFT updated with new metadata URI`);
  explorerLinkLog(response.signature, "tx");
};
