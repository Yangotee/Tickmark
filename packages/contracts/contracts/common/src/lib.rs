#![no_std]

use soroban_sdk::contracterror;

#[contracterror]
#[repr(u32)]
pub enum ContractError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    Paused = 4,
    InvalidAmount = 5,
    InvalidNonce = 6,
    ManufacturerNotVerified = 100,
    ManufacturerSuspended = 101,
    InsufficientStake = 102,
    StakeLocked = 103,
    BatchNotFound = 200,
    BatchAlreadyExists = 201,
    DuplicateRoot = 202,
    BatchTooLarge = 203,
    AlreadyRecalled = 204,
    ProofTooLong = 205,
    PeriodOverlap = 300,
    AlreadyConsumed = 301,
    MissingEvidence = 302,
    FlagNotFound = 303,
    DuplicatePack = 400,
    AlreadyVoted = 401,
    ThresholdNotMet = 402,
    InvalidClaimSecret = 403,
    AlreadyClaimed = 404,
    ExceedsRewardCap = 405,
    InsufficientPool = 406,
    ClaimWindowOpen = 407,
}