export const THE_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/drondin/olympus-graph";
export const EPOCH_INTERVAL = 28800;

// NOTE could get this from an outside source since it changes slightly over time
export const BLOCK_RATE_SECONDS = 2;


export const TOKEN_DECIMALS = 9;

export const POOL_GRAPH_URLS = {
  43114: "https://api.thegraph.com/subgraphs/name/pooltogether/rinkeby-v3_4_3",
  4: "https://api.thegraph.com/subgraphs/name/pooltogether/rinkeby-v3_4_3",
  1: "https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_4_3",
};

interface IAddresses {
  [key: number]: { [key: string]: string };
}

export const addresses: IAddresses = {
  43114: {
    DAI_ADDRESS:                "0x130966628846bfd36ff31a822705796e8cb8c18d", // MIM
    OHM_ADDRESS:                "0x88a425b738682f58C0FF9fcF2CceB47a361ef4cF", // OlympusERC20Token
    STAKING_ADDRESS:            "0x6323C227f71b30babdd6fe84093027079A955662", // OlympusStaking
    STAKING_HELPER_ADDRESS:     "0x51e1ed635733436b02cf3EE5F6099d1dbcf131A5", // StakingHelper
    OLD_STAKING_ADDRESS:        "0x6323C227f71b30babdd6fe84093027079A955662", // OlympusStaking
    SOHM_ADDRESS:               "0x07394401c38b63d216Be5A518E78414701B2Cf0e", // sOlympus
    OLD_SOHM_ADDRESS:           "0x0000000000000000000000000000000000000000", // sOlympus
    MIGRATE_ADDRESS:            "0x0000000000000000000000000000000000000000", // aOHMMigration
    DISTRIBUTOR_ADDRESS:        "0x0000000000000000000000000000000000000000", // OlympusStakingDistributor
    BONDINGCALC_ADDRESS:        "0xAbe89594bCaeDf7AebFbBda63F7AAf5d4f119a69", // OlympusBondingCalculator
    CIRCULATING_SUPPLY_ADDRESS: "0x78504233859fd559b8272A9360c3878B48F895b9", // OHMCirculatingSupplyContract
    TREASURY_ADDRESS:           "0x2af791E7EBa7efF93485CF8516bAf7bdc94d4db7", // OlympusTreasury
    REDEEM_HELPER_ADDRESS:      "0x6B96664e998967124DD69f6a0bA7AD9598daa8c0", // RedeemHelper
    PT_TOKEN_ADDRESS:           "0x0000000000000000000000000000000000000000", // 33T token address, taken from `ticket` function on PRIZE_STRATEGY_ADDRESS
    PT_PRIZE_POOL_ADDRESS:      "0x0000000000000000000000000000000000000000", // NEW
    PT_PRIZE_STRATEGY_ADDRESS:  "0x0000000000000000000000000000000000000000", // NEW
  },

};
