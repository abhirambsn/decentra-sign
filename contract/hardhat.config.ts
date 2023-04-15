import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    alchemy_testnet: {
      url: process.env.API_URL as string,
      accounts: [process.env.PRIVATE_KEY as string]
    }
  }
};

export default config;
