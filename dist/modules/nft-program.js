"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const js_1 = require("@metaplex-foundation/js");
const helpers_1 = require("@solana-developers/helpers");
const web3_js_1 = require("@solana/web3.js");
const fs_1 = require("fs");
const helpers_2 = require("./helpers");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    // console.clear();
    const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"), "confirmed");
    const u2 = (0, helpers_1.getKeypairFromEnvironment)("SECRET_KEY");
    console.log(`Loaded keypair u2: ${(0, helpers_2.shortenAddress)(u2.publicKey.toBase58(), 3)}`);
    const metaplex = js_1.Metaplex.make(connection)
        .use((0, js_1.keypairIdentity)(u2))
        .use((0, js_1.irysStorage)({
        address: "https://devnet.irys.xyz",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
    }));
    console.log("Metaplex initialized");
    // Creates a new NFT collection
    // createNFTCollection(metaplex, u2);
    // Create an NFT in the collection
    // createNFTinCollection(metaplex, u2);
    // Update an NFT in the collection
    // updateNFTinCollection(metaplex, u2);
});
exports.run = run;
const createNFTCollection = (metaplex, u2) => __awaiter(void 0, void 0, void 0, function* () {
    const collectionNFTData = {
        name: "E_MOON Wings Bag",
        symbol: "EMWC",
        description: "E_MOON Wings Collection",
        sellerFeeBasisPoints: 100,
        imageFile: "./assets/nft.png",
        isCollection: true,
        collectionAuthority: u2,
    };
    const buffer = (0, fs_1.readFileSync)(collectionNFTData.imageFile);
    const file = (0, js_1.toMetaplexFile)(buffer, collectionNFTData.imageFile);
    const imageUri = yield metaplex.storage().upload(file);
    console.log("uri: ", imageUri);
    const uploadedMetadataOutput = yield metaplex.nfts().uploadMetadata({
        name: collectionNFTData.name,
        symbol: collectionNFTData.symbol,
        description: collectionNFTData.description,
        image: imageUri,
    });
    const collectionURI = uploadedMetadataOutput.uri;
    console.log("Collection offchain metadata URI:", collectionURI);
    const collectionNFTOutput = yield metaplex.nfts().create({
        uri: collectionURI,
        name: collectionNFTData.name,
        sellerFeeBasisPoints: collectionNFTData.sellerFeeBasisPoints,
        symbol: collectionNFTData.symbol,
        isCollection: true,
    }, { commitment: "finalized" });
    const collectionNFT = collectionNFTOutput.nft;
    console.log(`Collection NFT address is`, collectionNFT.address.toString());
    (0, helpers_2.explorerLinkLog)(collectionNFT.address.toString(), "address");
});
const createNFTinCollection = (metaplex, u2) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Creating NFT in collection");
    const nftData = {
        name: "E_MOON Wings",
        description: "E_MOON Wings NFT",
        symbol: "EMW",
        sellerFeeBasisPoints: 100,
        imageFile: "./assets/nft.png",
        collection: new web3_js_1.PublicKey("4csfjkL5JaKjvmK9cCPnSbknY1DcnTnSEMGgQxwg8Yit"),
    };
    const buffer = (0, fs_1.readFileSync)(nftData.imageFile);
    const file = (0, js_1.toMetaplexFile)(buffer, nftData.imageFile);
    const imageUri = yield metaplex.storage().upload(file);
    console.log("\nuri: ", imageUri);
    const uploadedMetadataOutput = yield metaplex.nfts().uploadMetadata({
        name: nftData.name,
        symbol: nftData.symbol,
        description: nftData.description,
        image: imageUri,
    });
    const metadataUri = uploadedMetadataOutput.uri;
    console.log("\nMetadata offchain URI:", metadataUri);
    const collection = yield metaplex
        .nfts()
        .findByMint({ mintAddress: nftData.collection });
    console.log("\nCollection: ", collection.address.toString());
    const createdNFTOutput = yield metaplex.nfts().create({
        uri: metadataUri,
        name: nftData.name,
        sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
        symbol: nftData.symbol,
        collection: collection.address,
    }, { commitment: "finalized" });
    const nft = createdNFTOutput.nft;
    console.log(`NFT address is`, nft.address.toString());
    (0, helpers_2.explorerLinkLog)(nft.address.toString(), "address");
    yield metaplex.nfts().verifyCollection({
        mintAddress: nft.mint.address,
        collectionMintAddress: collection.address,
        isSizedCollection: true,
    });
    console.log("\nNFT verified in collection");
});
const updateNFTinCollection = (metaplex, u2) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedNFTData = {
        name: "E_MOON Wings (updated)",
        description: "E_MOON Wings NFT",
        symbol: "EMW",
        sellerFeeBasisPoints: 100,
        imageFile: "./assets/nft.png",
        nftAddress: new web3_js_1.PublicKey("AcpREHAJsJbfrd61KyjLJbQQ5A9NVhtCry5H6pirNh4r"),
    };
    const nft = yield metaplex
        .nfts()
        .findByMint({ mintAddress: updatedNFTData.nftAddress });
    const buffer = (0, fs_1.readFileSync)(updatedNFTData.imageFile);
    const file = (0, js_1.toMetaplexFile)(buffer, updatedNFTData.imageFile);
    const imageUri = yield metaplex.storage().upload(file);
    console.log("\nuri: ", imageUri);
    const uploadedMetadataOutput = yield metaplex.nfts().uploadMetadata({
        name: updatedNFTData.name,
        symbol: updatedNFTData.symbol,
        description: updatedNFTData.description,
        image: imageUri,
    });
    const metadataUri = uploadedMetadataOutput.uri;
    console.log("\nMetadata offchain URI:", metadataUri);
    const { response } = yield metaplex.nfts().update({
        nftOrSft: nft,
        uri: metadataUri,
        name: updatedNFTData.name,
    }, { commitment: "finalized" });
    console.log(`NFT updated with new metadata URI`);
    (0, helpers_2.explorerLinkLog)(response.signature, "tx");
});
