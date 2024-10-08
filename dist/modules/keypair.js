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
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    // const keypair = Keypair.generate();
    console.log(process.env.SECRET_KEY);
    const keypair = (0, helpers_1.getKeypairFromEnvironment)("SECRET_KEY");
    console.log(`The public key is ${keypair.publicKey.toString()}`);
    console.log(`The secret key is ${keypair.secretKey}`);
});
exports.run = run;
