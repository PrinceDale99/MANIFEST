// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Domain Entity Types
// ═══════════════════════════════════════════════════════════════════════════════

/** Tender lifecycle states */
export enum TenderStatus {
  DRAFT = 0,
  BIDDING_OPEN = 1,
  REVEAL_PHASE = 2,
  SETTLED = 3,
  CANCELLED = 4,
}

/** Human-readable status labels and colors */
export const TENDER_STATUS_CONFIG: Record<
  TenderStatus,
  { label: string; color: string; bgColor: string }
> = {
  [TenderStatus.DRAFT]: {
    label: 'DRAFT',
    color: 'text-slate-400',
    bgColor: 'bg-slate-800',
  },
  [TenderStatus.BIDDING_OPEN]: {
    label: 'COLLECTING BIDS',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/50',
  },
  [TenderStatus.REVEAL_PHASE]: {
    label: 'REVEALING',
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/50',
  },
  [TenderStatus.SETTLED]: {
    label: 'COMPLETED',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-900/50',
  },
  [TenderStatus.CANCELLED]: {
    label: 'CANCELLED',
    color: 'text-red-400',
    bgColor: 'bg-red-900/50',
  },
}

/** Cargo/equipment type classification */
export enum EquipmentType {
  DRY_VAN = 'DRY_VAN',
  REEFER = 'REEFER',
  FLATBED = 'FLATBED',
  TANKER = 'TANKER',
  OPEN_TOP = 'OPEN_TOP',
  LOWBOY = 'LOWBOY',
  STEP_DECK = 'STEP_DECK',
  LIVESTOCK = 'LIVESTOCK',
}

/** Load specification — what the shipper is tendering */
export interface LoadSpec {
  origin: string
  destination: string
  equipmentType: EquipmentType
  weightLbs: number
  temperatureRange?: { min: number; max: number } // For reefer loads
  hazmatClass?: string
  description: string
}

/** A freight tender (RFP) issued by a shipper */
export interface Tender {
  tenderId: string // Hex-encoded 32-byte ID
  shipper: string // Public key
  loadHash: string // SHA-256 of LoadSpec
  loadSpec?: LoadSpec // Decoded load info (off-chain only)
  reservePriceCommitment?: string
  biddingDeadline: number // Block height
  revealDeadline: number // Block height
  status: TenderStatus
  lowestDisclosedBid?: number // In cents per mile
  awardedCarrier?: string // Public key
  carrierCount: number // Number of carriers who committed
  createdAt: Date
}

/** A sealed bid commitment submitted by a carrier */
export interface BidCommitment {
  tenderId: string
  carrierPk: string
  commitmentHash: string
  submittedAt: Date
}

/** A revealed bid with its proof */
export interface RevealedBid {
  tenderId: string
  carrierPk: string
  bidAmount: number // Cents per mile
  proofHash: string
  revealedAt: Date
  isWinner: boolean
}

/** A carrier participating in the protocol */
export interface Carrier {
  publicKey: string
  name: string
  mcNumber?: string // Motor carrier number
  dotNumber?: string // DOT registration
  activeTenders: number
  totalBids: number
  wonAuctions: number
}

/** Shipper identity */
export interface Shipper {
  publicKey: string
  name: string
  scacCode?: string // Standard Carrier Alpha Code
  activeTenders: number
  totalTenders: number
}

/** Proof generation telemetry stages */
export enum ProofStage {
  IDLE = 0,
  WITNESS_EVALUATION = 1,
  CIRCUIT_COMPILATION = 2,
  PROOF_GENERATION = 3,
  LEDGER_SUBMISSION = 4,
  COMPLETE = 5,
  FAILED = -1,
}

export const PROOF_STAGE_CONFIG: Record<
  ProofStage,
  { label: string; description: string }
> = {
  [ProofStage.IDLE]: { label: 'Ready', description: 'Waiting to start' },
  [ProofStage.WITNESS_EVALUATION]: {
    label: 'Reading Your Data',
    description: 'Processing your private information...',
  },
  [ProofStage.CIRCUIT_COMPILATION]: {
    label: 'Building Proof',
    description: 'Creating mathematical proof...',
  },
  [ProofStage.PROOF_GENERATION]: {
    label: 'Generating Proof',
    description: 'Generating proof of your bid...',
  },
  [ProofStage.LEDGER_SUBMISSION]: {
    label: 'Sending to Blockchain',
    description: 'Submitting proof to the network...',
  },
  [ProofStage.COMPLETE]: {
    label: 'Done',
    description: 'Proof verified and recorded',
  },
  [ProofStage.FAILED]: {
    label: 'Error',
    description: 'Something went wrong',
  },
}

/** Proof server health status */
export interface ProofServerStatus {
  connected: boolean
  latencyMs: number
  lastHeartbeat: Date | null
  version?: string
}

/** Midnight wallet state */
export interface WalletState {
  connected: boolean
  address?: string
  balance?: bigint
  network: 'preview' | 'preprod' | 'mainnet'
}
