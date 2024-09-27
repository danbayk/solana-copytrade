const { PublicKey } = require("@solana/web3.js");
const { utils } = require("@project-serum/anchor");
const { struct, u16, u8 } = require("@solana/buffer-layout");
const { u64, publicKey } = require("@solana/buffer-layout-utils");
const { deserialize } = require("borsh");

const RaydiumInitializeArgsLayout = struct([u8("nonce"), u64("openTime")]);
const RaydiumInitialize2ArgsLayout = struct([
  u8("nonce"),
  u64("openTime"),
  u64("initPcAmount"),
  u64("initCoinAmount")
])

const MonitorStepArgsLayout = struct([
  u16("planOrderLimit"),
  u16("placeOrderLimit"),
  u16("cancelOrderLimit")
])

const DepositArgsLayout = struct([
  u64("maxCoinAmount"),
  u64("maxPcAmount"),
  u64("baseSide")
])

const WithdrawArgsLayout = struct([u64("amount")])

class Fees {}
class LastOrderDistance {}
class NeedTakeAmounts {}
class SetParamsArgs {}
const SetParamsSchema = new Map([
  [
    SetParamsArgs,
    {
      kind: "struct",
      fields: [
        ["param", "u8"],
        ["value", { kind: "option", type: "u8" }],
        ["newPubkey", { kind: "option", type: [32] }],
        ["fees", { kind: "option", type: Fees }],
        ["lastOrderDistance", { kind: "option", type: LastOrderDistance }],
        ["needTakeAmounts", { kind: "option", type: NeedTakeAmounts }]
      ]
    }
  ],
  [
    Fees,
    {
      kind: "struct",
      fields: [
        ["minSeparateNumerator", "u64"],
        ["minSeparateDenominator", "u64"],
        ["tradeFeeNumerator", "u64"],
        ["tradeFeeDenominator", "u64"],
        ["pnlNumerator", "u64"],
        ["pnlDenominator", "u64"],
        ["swapFeeNumerator", "u64"],
        ["swapFeeDenominator", "u64"]
      ]
    }
  ],
  [
    LastOrderDistance,
    {
      kind: "struct",
      fields: [
        ["lastOrderNumerator", "u64"],
        ["lastOrderDenominator", "u64"]
      ]
    }
  ],
  [
    NeedTakeAmounts,
    {
      kind: "struct",
      fields: [
        ["needTakePc", "u64"],
        ["needTakeCoin", "u64"]
      ]
    }
  ]
])

const SwapBaseInArgsLayout = struct([u64("amountIn"), u64("minimumAmountOut")])

const PreInitializeArgsLayout = struct([u8("nonce")])

const SwapBaseOutArgsLayout = struct([u64("maxAmountIn"), u64("amountOut")])

class SwapInstructionBaseIn {}
class SwapInstructionBaseOut {}
class SimulateInfoArgs {}
const SimulateInfoSchema = new Map([
  [
    SimulateInfoArgs,
    {
      kind: "struct",
      fields: [
        ["param", "u8"],
        ["swapBaseInValue", { kind: "option", type: SwapInstructionBaseIn }],
        ["swapBaseOutValue", { kind: "option", type: SwapInstructionBaseOut }]
      ]
    }
  ],
  [
    SwapInstructionBaseIn,
    {
      kind: "struct",
      fields: [
        ["amountIn", "u64"],
        ["minimumAmountOut", "u64"]
      ]
    }
  ],
  [
    SwapInstructionBaseOut,
    {
      kind: "struct",
      fields: [
        ["maxAmountIn", "u64"],
        ["amountOut", "u64"]
      ]
    }
  ]
])

const AdminCancelOrdersArgsLayout = struct([u16("limit")])

const UpdateConfigAccountArgsLayout = struct([u8("param"), publicKey("owner")])

class RaydiumAmmParser {
  static PROGRAM_ID = new PublicKey(
    "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
  )

  parseInstruction(instruction) {
    const instructionData = instruction.data
    const instructionType = u8().decode(instructionData)

    switch (instructionType) {
      case 0: {
        return this.parseRaydiumInitializeIx(instruction)
      }
      case 1: {
        return this.parseRaydiumInitialize2Ix(instruction)
      }
      case 2: {
        return this.parseMonitorStepIx(instruction)
      }
      case 3: {
        return this.parseDepositIx(instruction)
      }
      case 4: {
        return this.parseWithdrawIx(instruction)
      }
      case 5: {
        return this.parseMigrateToOpenBookIx(instruction)
      }
      case 6: {
        return this.parseSetParamsIx(instruction)
      }
      case 7: {
        return this.parseWithdrawPnlIx(instruction)
      }
      case 8: {
        return this.parseWithdrawSrmIx(instruction)
      }
      case 9: {
        return this.parseSwapBaseInIx(instruction)
      }
      case 10: {
        return this.parsePreInitializeIx(instruction)
      }
      case 11: {
        return this.parseSwapBaseOutIx(instruction)
      }
      case 12: {
        return this.parseSimulateInfoIx(instruction)
      }
      case 13: {
        return this.parseAdminCancelOrdersIx(instruction)
      }
      case 14: {
        return this.parseCreateConfigAccountIx(instruction)
      }
      case 15: {
        return this.parseUpdateConfigAccountIx(instruction)
      }
      default:
        return this.parseUnknownInstruction(instruction)
    }
  }

  parseRaydiumInitializeIx(instruction) {
    const accounts = instruction.keys
    const instructionData = instruction.data
    const args = RaydiumInitializeArgsLayout.decode(instructionData)
    return {
      name: "initialize",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 3:
            return { ...account, name: "amm" }
          case 4:
            return { ...account, name: "ammAuthority" }
          case 5:
            return { ...account, name: "ammOpenOrders" }
          case 6:
            return { ...account, name: "lpMintAddress" }
          case 7:
            return { ...account, name: "coinMintAddress" }
          case 8:
            return { ...account, name: "pcMintAddress" }
          case 9:
            return { ...account, name: "poolCoinTokenAccount" }
          case 10:
            return { ...account, name: "poolPcTokenAccount" }
          case 11:
            return { ...account, name: "poolWithdrawQueue" }
          case 12:
            return { ...account, name: "poolTargetOrdersAccount" }
          case 13:
            return { ...account, name: "userLpTokenAccount" }
          case 14:
            return { ...account, name: "poolTempLpTokenAccount" }
          case 16:
            return { ...account, name: "serumMarket" }
          case 17:
            return { ...account, name: "userWallet" }

          default:
            return account
        }
      }),
      args: { nonce: args.nonce, openTime: Number(args.openTime) },
      programId: instruction.programId
    }
  }

  parseRaydiumInitialize2Ix(instruction) {
    const accounts = instruction.keys
    const instructionData = instruction.data
    const args = RaydiumInitialize2ArgsLayout.decode(instructionData)
    return {
      name: "initialize2",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 4:
            return { ...account, name: "amm" }
          case 5:
            return { ...account, name: "ammAuthority" }
          case 6:
            return { ...account, name: "ammOpenOrders" }
          case 7:
            return { ...account, name: "lpMintAddress" }
          case 8:
            return { ...account, name: "coinMintAddress" }
          case 9:
            return { ...account, name: "pcMintAddress" }
          case 10:
            return { ...account, name: "poolCoinTokenAccount" }
          case 11:
            return { ...account, name: "poolPcTokenAccount" }
          case 12:
            return { ...account, name: "poolWithdrawQueue" }
          case 13:
            return { ...account, name: "ammTargetOrders" }
          case 14:
            return { ...account, name: "poolTempLpTokenAccount" }
          case 16:
            return { ...account, name: "serumMarket" }
          case 17:
            return { ...account, name: "userWallet" }
          case 18:
            return { ...account, name: "userTokenCoin" }
          case 19:
            return { ...account, name: "userTokenPc" }
          case 20:
            return { ...account, name: "userLpTokenAccount" }

          default:
            return account
        }
      }),
      args: {
        nonce: args.nonce,
        openTime: Number(args.openTime),
        initPcAmount: Number(args.initPcAmount),
        initCoinAmount: Number(args.initCoinAmount)
      },
      programId: instruction.programId
    }
  }

  parseMonitorStepIx(instruction) {
    const accounts = instruction.keys
    const instructionData = instruction.data
    const args = MonitorStepArgsLayout.decode(instructionData)
    return {
      name: "monitorStep",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 3:
            return { ...account, name: "amm" }
          case 4:
            return { ...account, name: "ammAuthority" }
          case 5:
            return { ...account, name: "ammOpenOrders" }
          case 6:
            return { ...account, name: "ammTargetOrders" }
          case 7:
            return { ...account, name: "poolCoinTokenAccount" }
          case 8:
            return { ...account, name: "poolPcTokenAccount" }
          case 9:
            return { ...account, name: "poolWithdrawQueue" }
          case 11:
            return { ...account, name: "serumMarket" }
          case 12:
            return { ...account, name: "serumCoinVaultAccount" }
          case 13:
            return { ...account, name: "serumPcVaultAccount" }
          case 14:
            return { ...account, name: "serumVaultSigner" }
          case 15:
            return { ...account, name: "serumReqQueue" }
          case 16:
            return { ...account, name: "serumEventQueue" }
          case 17:
            return { ...account, name: "serumBids" }
          case 18:
            return { ...account, name: "serumAsks" }
          default:
            return account
        }
      }),
      args: {
        planOrderLimit: args.planOrderLimit,
        placeOrderLimit: args.placeOrderLimit,
        cancelOrderLimit: args.cancelOrderLimit
      },
      programId: instruction.programId
    }
  }

  parseDepositIx(instruction) {
    const accounts = instruction.keys
    const instructionData = instruction.data
    const args = DepositArgsLayout.decode(instructionData)
    return {
      name: "deposit",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 1:
            return { ...account, name: "amm" }
          case 2:
            return { ...account, name: "ammAuthority" }
          case 3:
            return { ...account, name: "ammOpenOrders" }
          case 4:
            return { ...account, name: "ammTargetOrders" }
          case 5:
            return { ...account, name: "lpMintAddress" }
          case 6:
            return { ...account, name: "poolCoinTokenAccount" }
          case 7:
            return { ...account, name: "poolPcTokenAccount" }
          case 8:
            return { ...account, name: "serumMarket" }
          case 9:
            return { ...account, name: "userCoinTokenAccount" }
          case 10:
            return { ...account, name: "userPcTokenAccount" }
          case 11:
            return { ...account, name: "userLpTokenAccount" }
          case 12:
            return { ...account, name: "userWallet" }
          case 13:
            return { ...account, name: "serumEventQueue" }
          default:
            return account
        }
      }),
      args: {
        maxCoinAmount: Number(args.maxCoinAmount),
        maxPcAmount: Number(args.maxPcAmount),
        baseSide: Number(args.baseSide)
      },
      programId: instruction.programId
    }
  }

  parseWithdrawIx(instruction) {
    const accounts = instruction.keys
    const instructionData = instruction.data
    const args = WithdrawArgsLayout.decode(instructionData)
    return {
      name: "withdraw",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 1:
            return { ...account, name: "amm" }
          case 2:
            return { ...account, name: "ammAuthority" }
          case 3:
            return { ...account, name: "ammOpenOrders" }
          case 4:
            return { ...account, name: "ammTargetOrders" }
          case 5:
            return { ...account, name: "lpMintAddress" }
          case 6:
            return { ...account, name: "poolCoinTokenAccount" }
          case 7:
            return { ...account, name: "poolPcTokenAccount" }
          case 8:
            return { ...account, name: "poolWithdrawQueue" }
          case 9:
            return { ...account, name: "poolTempLpTokenAccount" }
          case 11:
            return { ...account, name: "serumMarket" }
          case 12:
            return { ...account, name: "serumCoinVaultAccount" }
          case 13:
            return { ...account, name: "serumPcVaultAccount" }
          case 14:
            return { ...account, name: "serumVaultSigner" }
          case 15:
            return { ...account, name: "userLpTokenAccount" }
          case 16:
            return { ...account, name: "uerCoinTokenAccount" }
          case 17:
            return { ...account, name: "uerPcTokenAccount" }
          case 18:
            return { ...account, name: "userWallet" }
          case 19:
            return { ...account, name: "serumEventQueue" }
          case 20:
            return { ...account, name: "serumBids" }
          case 21:
            return { ...account, name: "serumAsks" }
          default:
            return account
        }
      }),
      args: { amount: Number(args.amount) },
      programId: instruction.programId
    }
  }

  parseMigrateToOpenBookIx(instruction) {
    const accounts = instruction.keys
    return {
      name: "migrateToOpenBook",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 3:
            return { ...account, name: "amm" }
          case 4:
            return { ...account, name: "ammAuthority" }
          case 5:
            return { ...account, name: "ammOpenOrders" }
          case 6:
            return { ...account, name: "ammTokenCoin" }
          case 7:
            return { ...account, name: "ammTokenPc" }
          case 8:
            return { ...account, name: "ammTargetOrders" }
          case 10:
            return { ...account, name: "serumMarket" }
          case 11:
            return { ...account, name: "serumBids" }
          case 12:
            return { ...account, name: "serumAsks" }
          case 13:
            return { ...account, name: "serumEventQueue" }
          case 14:
            return { ...account, name: "serumCoinVault" }
          case 15:
            return { ...account, name: "serumPcVault" }
          case 16:
            return { ...account, name: "serumVaultSigner" }
          case 17:
            return { ...account, name: "newAmmOpenOrders" }
          case 19:
            return { ...account, name: "newSerumMarket" }
          case 20:
            return { ...account, name: "admin" }
          default:
            return account
        }
      }),
      args: { unknown: utils.bytes.bs58.encode(instruction.data) },
      programId: instruction.programId
    }
  }

  parseSetParamsIx(instruction) {
    const accounts = instruction.keys
    const instructionData = instruction.data
    const args = deserialize(SetParamsSchema, SetParamsArgs, instructionData)
    return {
      name: "setParams",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 1:
            return { ...account, name: "amm" }
          case 2:
            return { ...account, name: "ammAuthority" }
          case 3:
            return { ...account, name: "ammOpenOrders" }
          case 4:
            return { ...account, name: "ammTargetOrders" }
          case 5:
            return { ...account, name: "ammCoinVault" }
          case 6:
            return { ...account, name: "ammPcVault" }
          case 8:
            return { ...account, name: "serumMarket" }
          case 9:
            return { ...account, name: "serumCoinVaultAccount" }
          case 10:
            return { ...account, name: "serumPcVaultAccount" }
          case 11:
            return { ...account, name: "serumVaultSigner" }
          case 12:
            return { ...account, name: "serumEventQueue" }
          case 13:
            return { ...account, name: "serumBids" }
          case 14:
            return { ...account, name: "serumAsks" }
          case 15:
            return { ...account, name: "ammAdmin" }
          default:
            return account
        }
      }),
      args: {
        param: args.param,
        value: args?.value ?? null,
        newPubkey: args?.newPubkey
          ? utils.bytes.bs58.encode(args.newPubkey)
          : "",
        fees: args?.fees
          ? {
              minSeparateNumerator: Number(args.fees.minSeparateNumerator),
              minSeparateDenominator: Number(args.fees.minSeparateDenominator),
              tradeFeeNumerator: Number(args.fees.tradeFeeNumerator),
              tradeFeeDenominator: Number(args.fees.tradeFeeDenominator),
              pnlNumerator: Number(args.fees.pnlNumerator),
              pnlDenominator: Number(args.fees.pnlDenominator),
              swapFeeNumerator: Number(args.fees.swapFeeNumerator),
              swapFeeDenominator: Number(args.fees.swapFeeDenominator)
            }
          : {},
        lastOrderDistance: args?.lastOrderDistance
          ? {
              lastOrderNumerator: Number(
                args.lastOrderDistance.lastOrderNumerator
              ),
              lastOrderDenominator: Number(
                args.lastOrderDistance.lastOrderDenominator
              )
            }
          : {},
        needTakeAmounts: args?.needTakeAmounts
          ? {
              needTakePc: Number(args.needTakeAmounts.needTakePc),
              needTakeCoin: Number(args.needTakeAmounts.needTakeCoin)
            }
          : {}
      },
      programId: instruction.programId
    }
  }

  parseWithdrawPnlIx(instruction) {
    const accounts = instruction.keys
    return {
      name: "withdrawPnl",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 1:
            return { ...account, name: "amm" }
          case 2:
            return { ...account, name: "ammConfig" }
          case 3:
            return { ...account, name: "ammAuthority" }
          case 4:
            return { ...account, name: "ammOpenOrders" }
          case 5:
            return { ...account, name: "poolCoinTokenAccount" }
          case 6:
            return { ...account, name: "poolPcTokenAccount" }
          case 7:
            return { ...account, name: "coinPnlTokenAccount" }
          case 8:
            return { ...account, name: "pcPnlTokenAccount" }
          case 9:
            return { ...account, name: "pnlOwnerAccount" }
          case 10:
            return { ...account, name: "ammTargetOrders" }
          case 12:
            return { ...account, name: "serumMarket" }
          case 13:
            return { ...account, name: "serumEventQueue" }
          case 14:
            return { ...account, name: "serumCoinVaultAccount" }
          case 15:
            return { ...account, name: "serumPcVaultAccount" }
          case 16:
            return { ...account, name: "serumVaultSigner" }
          default:
            return account
        }
      }),
      args: { unknown: utils.bytes.bs58.encode(instruction.data) },
      programId: instruction.programId
    }
  }

  parseWithdrawSrmIx(instruction) {
    const accounts = instruction.keys
    const instructionData = instruction.data
    const args = WithdrawArgsLayout.decode(instructionData)
    return {
      name: "withdrawSrm",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 1:
            return { ...account, name: "amm" }
          case 2:
            return { ...account, name: "ammOwnerAccount" }
          case 3:
            return { ...account, name: "ammAuthority" }
          case 4:
            return { ...account, name: "srmToken" }
          case 5:
            return { ...account, name: "destSrmToken" }
          default:
            return account
        }
      }),
      args: { amount: Number(args.amount) },
      programId: instruction.programId
    }
  }

  parseSwapBaseInIx(instruction) {
    const accounts = instruction.keys
    const instructionData = instruction.data
    const args = SwapBaseInArgsLayout.decode(instructionData)
    return {
      name: "swapBaseIn",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 1:
            return { ...account, name: "amm" }
          case 2:
            return { ...account, name: "ammAuthority" }
          case 3:
            return { ...account, name: "ammOpenOrders" }
          case 4:
            return { ...account, name: "ammTargetOrders" }
          case 5:
            return { ...account, name: "poolCoinTokenAccount" }
          case 6:
            return { ...account, name: "poolPcTokenAccount" }
          case 8:
            return { ...account, name: "serumMarket" }
          case 9:
            return { ...account, name: "serumBids" }
          case 10:
            return { ...account, name: "serumAsks" }
          case 11:
            return { ...account, name: "serumEventQueue" }
          case 12:
            return { ...account, name: "serumCoinVaultAccount" }
          case 13:
            return { ...account, name: "serumPcVaultAccount" }
          case 14:
            return { ...account, name: "serumVaultSigner" }
          case 15:
            return { ...account, name: "uerSourceTokenAccount" }
          case 16:
            return { ...account, name: "uerDestinationTokenAccount" }
          case 17:
            return { ...account, name: "userSourceOwner" }
          default:
            return account
        }
      }),
      args: {
        amountIn: Number(args.amountIn),
        minimumAmountOut: Number(args.minimumAmountOut)
      },
      programId: instruction.programId
    }
  }

  parsePreInitializeIx(instruction) {
    const accounts = instruction.keys
    const instructionData = instruction.data
    const args = PreInitializeArgsLayout.decode(instructionData)
    return {
      name: "preInitialize",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 3:
            return { ...account, name: "ammTargetOrders" }
          case 4:
            return { ...account, name: "poolWithdrawQueue" }
          case 5:
            return { ...account, name: "ammAuthority" }
          case 6:
            return { ...account, name: "lpMintAddress" }
          case 7:
            return { ...account, name: "coinMintAddress" }
          case 8:
            return { ...account, name: "pcMintAddress" }
          case 9:
            return { ...account, name: "poolCoinTokenAccount" }
          case 10:
            return { ...account, name: "poolPcTokenAccount" }
          case 11:
            return { ...account, name: "poolTempLpTokenAccount" }
          case 12:
            return { ...account, name: "serumMarket" }
          case 13:
            return { ...account, name: "userWallet" }
          default:
            return account
        }
      }),
      args: { nonce: args.nonce },
      programId: instruction.programId
    }
  }

  parseSwapBaseOutIx(instruction) {
    const accounts = instruction.keys
    const instructionData = instruction.data
    const args = SwapBaseOutArgsLayout.decode(instructionData)
    return {
      name: "swapBaseOut",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 1:
            return { ...account, name: "amm" }
          case 2:
            return { ...account, name: "ammAuthority" }
          case 3:
            return { ...account, name: "ammOpenOrders" }
          case 4:
            return { ...account, name: "ammTargetOrders" }
          case 5:
            return { ...account, name: "poolCoinTokenAccount" }
          case 6:
            return { ...account, name: "poolPcTokenAccount" }
          case 8:
            return { ...account, name: "serumMarket" }
          case 9:
            return { ...account, name: "serumBids" }
          case 10:
            return { ...account, name: "serumAsks" }
          case 11:
            return { ...account, name: "serumEventQueue" }
          case 12:
            return { ...account, name: "serumCoinVaultAccount" }
          case 13:
            return { ...account, name: "serumPcVaultAccount" }
          case 14:
            return { ...account, name: "serumVaultSigner" }
          case 15:
            return { ...account, name: "uerSourceTokenAccount" }
          case 16:
            return { ...account, name: "uerDestinationTokenAccount" }
          case 17:
            return { ...account, name: "userSourceOwner" }
          default:
            return account
        }
      }),
      args: {
        maxAmountIn: Number(args.maxAmountIn),
        amountOut: Number(args.amountOut)
      },
      programId: instruction.programId
    }
  }

  parseSimulateInfoIx(instruction) {
    const accounts = instruction.keys
    const instructionData = instruction.data
    const args = deserialize(
      SimulateInfoSchema,
      SimulateInfoArgs,
      instructionData
    )
    return {
      name: "simulateInfo",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 0:
            return { ...account, name: "amm" }
          case 1:
            return { ...account, name: "ammAuthority" }
          case 2:
            return { ...account, name: "ammOpenOrders" }
          case 3:
            return { ...account, name: "poolCoinTokenAccount" }
          case 4:
            return { ...account, name: "poolPcTokenAccount" }
          case 5:
            return { ...account, name: "lpMintAddress" }
          case 6:
            return { ...account, name: "serumMarket" }
          case 7:
            return { ...account, name: "serumEventQueue" }
          default:
            return account
        }
      }),
      args: {
        param: args.param,
        swapBaseInValue: args.swapBaseInValue
          ? {
              amountIn: Number(args.swapBaseInValue.amountIn),
              minimumAmountOut: Number(args.swapBaseInValue.minimumAmountOut)
            }
          : {},
        swapBaseOutValue: args.swapBaseOutValue
          ? {
              maxAmountIn: Number(args.swapBaseOutValue.maxAmountIn),
              amountOut: Number(args.swapBaseOutValue.amountOut)
            }
          : {}
      },
      programId: instruction.programId
    }
  }

  parseAdminCancelOrdersIx(instruction) {
    const accounts = instruction.keys
    const instructionData = instruction.data
    const args = AdminCancelOrdersArgsLayout.decode(instructionData)
    return {
      name: "adminCancelOrders",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 1:
            return { ...account, name: "amm" }
          case 2:
            return { ...account, name: "ammAuthority" }
          case 3:
            return { ...account, name: "ammOpenOrders" }
          case 4:
            return { ...account, name: "ammTargetOrders" }
          case 5:
            return { ...account, name: "poolCoinTokenAccount" }
          case 6:
            return { ...account, name: "poolPcTokenAccount" }
          case 7:
            return { ...account, name: "ammOwnerAccount" }
          case 8:
            return { ...account, name: "ammConfig" }
          case 10:
            return { ...account, name: "serumMarket" }
          case 11:
            return { ...account, name: "serumCoinVaultAccount" }
          case 12:
            return { ...account, name: "serumPcVaultAccount" }
          case 13:
            return { ...account, name: "serumVaultSigner" }
          case 14:
            return { ...account, name: "serumEventQueue" }
          case 15:
            return { ...account, name: "serumBids" }
          case 16:
            return { ...account, name: "serumAsks" }
          default:
            return account
        }
      }),
      args: { limit: args.limit },
      programId: instruction.programId
    }
  }

  parseCreateConfigAccountIx(instruction) {
    const accounts = instruction.keys
    return {
      name: "createConfigAccount",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 0:
            return { ...account, name: "admin" }
          case 1:
            return { ...account, name: "ammConfig" }
          case 2:
            return { ...account, name: "owner" }
          default:
            return account
        }
      }),
      args: { unknown: utils.bytes.bs58.encode(instruction.data) },
      programId: instruction.programId
    }
  }

  parseUpdateConfigAccountIx(instruction) {
    const accounts = instruction.keys
    const instructionData = instruction.data
    const args = UpdateConfigAccountArgsLayout.decode(instructionData)
    return {
      name: "updateConfigAccount",
      accounts: accounts.map((account, index) => {
        switch (index) {
          case 0:
            return { ...account, name: "admin" }
          case 1:
            return { ...account, name: "ammConfig" }
          default:
            return account
        }
      }),
      args: { param: args.param, owner: args.owner.toBase58() },
      programId: instruction.programId
    }
  }

  parseUnknownInstruction(instruction) {
    const accounts = instruction.keys
    return {
      name: "Unknown",
      accounts,
      args: { unknown: utils.bytes.bs58.encode(instruction.data) },
      programId: instruction.programId
    }
  }
}

module.exports = RaydiumAmmParser;