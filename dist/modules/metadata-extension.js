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
const helpers_1 = require("@solana-developers/helpers");
const web3_js_1 = require("@solana/web3.js");
const spl_token_metadata_1 = require("@solana/spl-token-metadata");
const spl_token_1 = require("@solana/spl-token");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Running metadata-extension module");
    const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"));
    // const connection = new Connection(localConnectionURL);
    const u2 = (0, helpers_1.getKeypairFromEnvironment)("SECRET_KEY");
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
    const tokenUri = "https://devnet.irys.xyz/y-qA5J6oCRhfyA6Myd4THpHqIPT64mAqZRnzbxHiT80";
    // You can log the URI here and run the code to test it
    console.log("Token URI:", tokenUri);
    yield createNFTWithEmbeddedMetadata({
        payer: u2,
        connection,
        tokenName,
        tokenSymbol,
        tokenUri,
    });
});
exports.run = run;
const createNFTWithEmbeddedMetadata = (inputs) => __awaiter(void 0, void 0, void 0, function* () {
    const { connection, payer, tokenName, tokenSymbol, tokenUri, tokenAdditionalMetadata, } = inputs;
    const mint = web3_js_1.Keypair.generate();
    const decimals = 0;
    const supply = 1;
    // create the metadata object
    const metadata = {
        mint: mint.publicKey,
        name: tokenName,
        symbol: tokenSymbol,
        uri: tokenUri,
        additionalMetadata: Object.entries(tokenAdditionalMetadata || []).map(([key, value]) => [key, value]),
    };
    // Allocating mint
    const mintLen = (0, spl_token_1.getMintLen)([spl_token_1.ExtensionType.MetadataPointer]);
    const metadataLen = spl_token_1.TYPE_SIZE + spl_token_1.LENGTH_SIZE + (0, spl_token_metadata_1.pack)(metadata).length;
    const lamports = yield connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
    const createMintAccountInstruction = web3_js_1.SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        lamports,
        newAccountPubkey: mint.publicKey,
        programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
        space: mintLen,
    });
    const initMetadataPointerInstruction = (0, spl_token_1.createInitializeMetadataPointerInstruction)(mint.publicKey, payer.publicKey, mint.publicKey, // important
    spl_token_1.TOKEN_2022_PROGRAM_ID);
    const initMintInstruction = (0, spl_token_1.createInitializeMintInstruction)(mint.publicKey, decimals, payer.publicKey, payer.publicKey, spl_token_1.TOKEN_2022_PROGRAM_ID);
    const initMetadataInstruction = (0, spl_token_metadata_1.createInitializeInstruction)({
        programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
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
        setExtraMetadataInstructions.push((0, spl_token_metadata_1.createUpdateFieldInstruction)({
            updateAuthority: payer.publicKey,
            metadata: mint.publicKey,
            field: attributes[0],
            value: attributes[1],
            programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
        }));
    }
    const astacc = yield (0, spl_token_1.getAssociatedTokenAddress)(mint.publicKey, payer.publicKey, false, spl_token_1.TOKEN_2022_PROGRAM_ID);
    const createATAInstruction = (0, spl_token_1.createAssociatedTokenAccountInstruction)(payer.publicKey, astacc, payer.publicKey, mint.publicKey, spl_token_1.TOKEN_2022_PROGRAM_ID);
    const mintInstruction = (0, spl_token_1.createMintToCheckedInstruction)(mint.publicKey, astacc, payer.publicKey, supply, // NFTs should have a supply of one
    decimals, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
    // NFTs should have no mint authority so no one can mint any more of the same NFT
    const setMintTokenAuthorityInstruction = (0, spl_token_1.createSetAuthorityInstruction)(mint.publicKey, payer.publicKey, spl_token_1.AuthorityType.MintTokens, null, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
    const transaction = new web3_js_1.Transaction().add(createMintAccountInstruction, initMetadataPointerInstruction, initMintInstruction, initMetadataInstruction, ...setExtraMetadataInstructions, createATAInstruction, mintInstruction, setMintTokenAuthorityInstruction);
    const transactionSignature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [payer, mint]);
    const accountDetails = yield (0, spl_token_1.getAccount)(connection, astacc, "finalized", spl_token_1.TOKEN_2022_PROGRAM_ID);
    console.log("Associate Token Account =====>", accountDetails);
    const mintDetails = yield (0, spl_token_1.getMint)(connection, mint.publicKey, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
    console.log("Mint =====>", mintDetails);
    const onChainMetadata = yield (0, spl_token_1.getTokenMetadata)(connection, mint.publicKey);
    console.log("onchain metadata =====>", onChainMetadata);
    if (onChainMetadata && onChainMetadata.uri) {
        const offChainMetadata = yield fetch(onChainMetadata.uri).then((res) => res.json());
        console.log("Mint off-chain metadata =====>", offChainMetadata);
    }
});
