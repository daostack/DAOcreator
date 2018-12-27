import { FounderConfig, SchemeConfig, DAO as ArcDAO } from "@daostack/arc.js"
import { BigNumber } from "bignumber.js"
import * as R from "ramda"
import {
  Founder,
  VotingMachine,
  Scheme,
  VotingMachineConfiguration,
} from "./types"

const toFounderConfigs = (founders: Founder[]): FounderConfig[] =>
  R.map(
    ({ address, tokens, reputation }) => ({
      address,
      tokens: new BigNumber(tokens),
      reputation: new BigNumber(reputation),
    }),
    founders
  )

const toSchemeConfigs = (schemes: Scheme[]): SchemeConfig[] =>
  R.map(scheme => ({ name: scheme.typeName }), schemes)

const toVotingMachineParams = (
  votingMachineConfiguration: VotingMachineConfiguration
) => ({
  votingMachineParams: {
    votingMachineName: votingMachineConfiguration.typeName,
    ...votingMachineConfiguration.params,
  },
})

export const toNewDaoConfig = (
  naming: any,
  founders: Founder[],
  schemes: Scheme[],
  votingMachineConfiguration: VotingMachineConfiguration
) => {
  const { daoName, tokenName, tokenSymbol } = naming
  return {
    name: daoName,
    // tokenCap?: BigNumber | string,
    tokenName,
    tokenSymbol,
    founders: toFounderConfigs(founders),
    // daoCreatorAddress?: Address,
    // universalController?: boolean,
    votingMachineParams: toVotingMachineParams(votingMachineConfiguration),
    schemes: toSchemeConfigs(schemes),
  }
}

export const fromDao = async (arkDao: ArcDAO) => ({
  avatarAddress: arkDao.avatar.address,
  controllerAddress: arkDao.controller.address,
  tokenName: arkDao.token.name,
  tokenSymbol: await arkDao.token.getTokenSymbol(),
  name: arkDao.name,
})
