import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum TenderStatus { draft = 0,
                           biddingOpen = 1,
                           revealPhase = 2,
                           settled = 3,
                           cancelled = 4
}

export type Witnesses<PS> = {
  local_secret_key(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  store_bid_amount(context: __compactRuntime.WitnessContext<Ledger, PS>,
                   amount_0: bigint): [PS, []];
  store_salt(context: __compactRuntime.WitnessContext<Ledger, PS>,
             salt_0: Uint8Array): [PS, []];
}

export type ImpureCircuits<PS> = {
  openBidding(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  submitBidCommitment(context: __compactRuntime.CircuitContext<PS>,
                      bidAmount_0: bigint,
                      salt_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  transitionToReveal(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  revealBid(context: __compactRuntime.CircuitContext<PS>,
            bidAmount_0: bigint,
            salt_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  settleTender(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  cancelTender(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type ProvableCircuits<PS> = {
  openBidding(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  submitBidCommitment(context: __compactRuntime.CircuitContext<PS>,
                      bidAmount_0: bigint,
                      salt_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  transitionToReveal(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  revealBid(context: __compactRuntime.CircuitContext<PS>,
            bidAmount_0: bigint,
            salt_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  settleTender(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  cancelTender(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  openBidding(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  submitBidCommitment(context: __compactRuntime.CircuitContext<PS>,
                      bidAmount_0: bigint,
                      salt_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  transitionToReveal(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  revealBid(context: __compactRuntime.CircuitContext<PS>,
            bidAmount_0: bigint,
            salt_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  settleTender(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  cancelTender(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type Ledger = {
  readonly tenderId: Uint8Array;
  readonly shipperPk: Uint8Array;
  readonly loadHash: Uint8Array;
  readonly reservePriceCommitment: Uint8Array;
  readonly biddingDeadline: bigint;
  readonly revealDeadline: bigint;
  readonly tenderStatus: TenderStatus;
  readonly lowestDisclosedBid: bigint;
  readonly awardedCarrier: Uint8Array;
  carrierCommitments: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               _tenderId_0: Uint8Array,
               _loadHash_0: Uint8Array,
               _reservePriceCommitment_0: Uint8Array,
               _biddingDeadline_0: bigint,
               _revealDeadline_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
export declare const expectedVk: Record<string, string>;
