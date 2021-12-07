import { selector } from "recoil";
// import { connectKeplr } from 'services/keplr'
// import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'

export const daoProposalsQuery = selector({
  key: 'daoProposals',
  get: async ({get}) => {
    // const response = await myDBQuery({
    //   userID: get(currentUserIDState),
    // });
    // return response.name;
  },
});
