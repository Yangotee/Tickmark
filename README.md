# Tickmark

**Check any product before you buy it. Send the code on the pack by SMS, USSD, or the app, and get a tick if it is genuine, with Stellar-anchored batch records, AI packaging checks, and a radar that catches cloned codes.**

Manufacturers register product batches on Stellar. Every pack carries a one-time code. Buyers verify it in seconds from any phone. When something looks fake, Tickmark's Clone Radar spots the pattern, and reporters earn a USDC bounty for evidence packs that regulators can act on.

![License: MIT](https://img.shields.io/badge/License-MIT-green) ![Network: Stellar](https://img.shields.io/badge/Network-Stellar-blue) ![Contracts: Soroban](https://img.shields.io/badge/Contracts-Soroban-purple) ![Monorepo: pnpm](https://img.shields.io/badge/Monorepo-pnpm-orange) ![Build: Turborepo](https://img.shields.io/badge/Build-Turborepo-red)

> **Status:** early design and Testnet development. The function tables, invariants, and error codes below describe the target interface. Items marked _planned_ are not yet implemented.

---

## The Problem

Counterfeit goods are a daily risk, and the people who most need protection have the fewest ways to check.

- Fake medicines, cosmetics, baby products, spare parts, and electronics sit on shelves next to the real thing, often in near-perfect packaging.
- A buyer cannot tell the difference by looking. Many existing checks need a smartphone, data, or an app that few people have installed.
- Manufacturers lose sales and reputation to fakes, but have no real-time view of where fakes appear.
- Reporting a suspected fake is slow and unrewarded, and the evidence is rarely good enough for a regulator to act on.
- Centralised verification databases can be edited, hacked, or shut down, and buyers have no way to check that a "genuine" answer is honest.

## The Solution

Tickmark turns a printed code into a public, tamper-evident trust check.

1. **Register.** A verified manufacturer anchors a batch on Stellar: a fingerprint of every one-time code printed for that batch, plus the product, dates, and a reference image set.
2. **Print.** Each pack gets a unique code under a scratch layer or tamper-evident label.
3. **Check.** The buyer sends the code by SMS, USSD, or the app. Tickmark answers: genuine, already used, not found, recalled, or expired.
4. **Detect.** Clone Radar watches scan patterns for duplicated codes, impossible journeys, and clusters of failed checks.
5. **Report and reward.** Suspected fakes become evidence packs. Confirmed reports pay the reporter a bounty and give regulators a tamper-proof file.

---

## Core Features

### For Buyers

- Verify by SMS, USSD (`*384*5#`, example code), a PWA, or by photographing the code
- Plain-language answer in English, Pidgin, Hausa, Yoruba, or Igbo
- See the product name, batch, expiry date, and whether the code was already used (with the first-check region and date)
- Report a suspected fake in one step, with photos

### For Manufacturers

- Register batches and generate codes and label files with the Tickmark CLI
- Dashboard showing checks per batch, regions, and suspected clone activity
- Recall a batch instantly: every later check shows the recall notice
- Pay per batch in USDC, with no per-scan fees for buyers

### For Regulators and Reviewers

- Review queue of evidence packs, with scan logs and AI summaries
- Export a signed evidence bundle for enforcement
- Public watch list of flagged batches and shops

### AI Features (Tickmark Lens)

| Feature               | What it does                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Packaging Check**   | Compares a photo of a pack against the manufacturer's reference images and flags differences in print quality, fonts, colours, hologram placement, and batch-code format |
| **Code Reader**       | Reads a batch code or serial from a photo when the user cannot type it                                                                                                   |
| **Report Triage**     | Groups incoming reports by product, shop, and area, and ranks them by how likely they are to be real fakes                                                               |
| **Seller Risk Score** | Combines scan patterns and reports into a risk indicator for a shop or market stall (shown to reviewers, never as a public accusation)                                   |
| **Evidence Summary**  | Drafts a plain-language summary of an evidence pack for reviewers and regulators                                                                                         |
| **Buyer Explainer**   | Explains results in the buyer's language, including what to do next                                                                                                      |

AI output is advisory. A packaging check can raise a warning, but it never marks a code genuine or fake. Only the on-chain batch record and the scan rules do that.

### Unique Feature 1: Clone Radar

Counterfeiters copy real codes. Clone Radar catches it from the pattern of checks.

- **Impossible travel:** the same code checked in two places too far apart for the time between them
- **Too many first scans:** one code shown as "first check" more than once, or checked from many different devices
- **Overshoot:** more checks for a batch than the number of codes registered
- **Failure clusters:** a spike of "not found" results from buyers around one shop or market
- **Batch drift:** codes for one product turning up in regions the manufacturer does not distribute to

Flagged batches and areas appear on a public watch list, with the rule that triggered and a hash of the evidence anchored on-chain.

### Unique Feature 2: Evidence Packs and Bounties

When a buyer reports a suspected fake, Tickmark assembles an **evidence pack**: photos, the code, the scan history for that code, the coarse location, a timeline, and an AI summary. The pack's hash is anchored on Stellar so it cannot be altered afterwards.

- A panel of approved reviewers confirms or rejects the report
- Confirmed reports pay the reporter a USDC bounty from a pool funded by manufacturers and sponsors
- Reporters can stay pseudonymous, because the reward goes to a wallet and not to a name
- Regulators receive a signed bundle that includes the on-chain proof of when the evidence existed

---

## Monorepo Structure

```
tickmark/
├── packages/
│   ├── contracts/      # @tickmark/contracts - Soroban smart contracts (Rust)
│   ├── labelkit/       # @tickmark/labelkit  - Manufacturer CLI: code generation, Merkle trees, label files
│   ├── gateway/        # @tickmark/gateway   - SMS, USSD, and API verification gateway (TypeScript)
│   ├── radar/          # @tickmark/radar     - Clone Radar rules engine (TypeScript)
│   ├── lens/           # @tickmark/lens      - AI packaging check, code reader, triage, summaries
│   ├── api/            # @tickmark/api       - Public REST API (Node.js)
│   ├── sdk/            # @tickmark/sdk       - TypeScript SDK for contracts and API
│   └── app/            # @tickmark/app       - Buyer PWA, manufacturer dashboard, reviewer portal (Next.js)
├── docs/               # Architecture, threat model, code format spec, SECURITY_MODEL.md
├── simulator/          # Local SMS/USSD simulator, no telecom account needed
├── scripts/            # Testnet bootstrap, seed data, deploy helpers
├── audits/             # Smart contract audit reports
├── pnpm-workspace.yaml
├── turbo.json
└── README.md           <- you are here
```

---

## How It Works

```
Manufacturer            Stellar Ledger                 Gateway                 Buyer
     │                        │                           │                      │
     ├─ generate codes ───────┤                           │                      │
     │  (labelkit: Merkle     │                           │                      │
     │   tree of code hashes) │                           │                      │
     ├─ register batch ──────▶ BatchRegistry.register()   │                      │
     │  (root, count, dates)  │                           │                      │
     ├─ upload code hashes ───────────────────────────────▶ stored (hashes only)  │
     │                        │                           │                      │
     │                        │                           │◀──── SMS: VERIFY code ┤
     │                        │ ◀── read batch root ──────┤                      │
     │                        │                           ├─ hash code, build proof
     │                        │                           ├─ verify proof vs root
     │                        │                           ├─ check first-scan state
     │                        │                           ├─ AI packaging check (optional photo)
     │                        │                           ├────── tick / warning ▶│
     │                        │                           │                      │
Clone Radar                   │                           │                      │
     ├─ read scan log ────────────────────────────────────┤                      │
     ├─ rule triggered ──────▶ ScanLedger.flag(batch, evidence_hash)              │
                              │                           │                      │
Reporter                      │                           │                      │
     ├─ submit evidence pack ▶ BountyVault.submit(pack_hash)                      │
     │                        ├─ reviewer panel confirms                          │
     │◀─ USDC bounty ─────────┤ BountyVault.payout()                              │
```

### Example answers

Replies are short because SMS and USSD screens are small.

```
VERIFY K7M2-9QXA-4TD8

GENUINE  First check
Paracetamol 500mg
Batch B2210 · Exp 03/2028
Tickmark

ALREADY CHECKED  Be careful
First checked 12 Oct in Lagos.
If you did not check it before, this may be a copy. Reply REPORT.

NOT FOUND
This code is not in our records. Do not use this product. Reply REPORT.

RECALLED
This batch was recalled on 03 Oct. Do not use. Return it to the shop.
```

---

## Packages

### @tickmark/contracts

Soroban smart contracts in Rust, deployable to Stellar Testnet and Mainnet.

| Contract               | Purpose                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ManufacturerRegistry` | Verified manufacturers, their stake, and product catalogue                                                  |
| `BatchRegistry`        | Immutable batch records: Merkle root of code hashes, counts, dates, reference-image hash, and recall status |
| `ScanLedger`           | Anchored scan summaries, first-scan commitments, Clone Radar flags, and the public watch list               |
| `BountyVault`          | Bounty pool, evidence pack submissions, reviewer confirmation, and payouts                                  |

```
packages/contracts/
├── contracts/
│   ├── manufacturer-registry/
│   ├── batch-registry/
│   ├── scan-ledger/
│   ├── bounty-vault/
│   └── common/              # Shared error enum
├── tests/
├── Cargo.toml
└── README.md
```

**Stack:** Rust, Soroban SDK, Stellar CLI

**How the codes stay secret.** Only a Merkle root of code hashes goes on-chain. The gateway holds the hashed leaves, never the plain codes. A buyer's code is hashed, matched to a leaf, and verified against the on-chain root with a Merkle proof. Codes must have at least 60 bits of randomness and the gateway rate-limits attempts, so guessing a valid code is impractical. Proofs use sorted-pair SHA-256, so they carry no left or right position flags.

**How scanning scales.** Writing every check to the ledger would be wasteful. The gateway records checks off-chain and anchors batched scan summaries (a root of the scan log for each period) to `ScanLedger`. Anyone can later prove that a particular scan was or was not in the anchored log.

#### ManufacturerRegistry

| Function                                                                   | Purpose                                                                                               |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `initialize(admin, attesters, min_stake)`                                  | Sets the admin, the approved attesters (for example a regulator or trade body), and the minimum stake |
| `apply(manufacturer, profile_hash, stake)`                                 | A manufacturer applies and stakes USDC. Manufacturer auth required                                    |
| `verify(manufacturer, attestation_hash)`                                   | An approved attester confirms the manufacturer. Attester auth required                                |
| `suspend(manufacturer, reason_hash)`                                       | Attester or admin suspends a manufacturer. A suspended manufacturer cannot register batches           |
| `reinstate(manufacturer)`                                                  | Attester reinstates a suspended manufacturer                                                          |
| `add_product(manufacturer, product_id, product_hash)`                      | Adds a product to the catalogue                                                                       |
| `add_stake(manufacturer, amount)` / `withdraw_stake(manufacturer, amount)` | Manages stake. Withdrawal is blocked while the manufacturer is suspended or has open slashing cases   |
| `slash(manufacturer, amount, reason_hash)`                                 | Slashes stake for confirmed misconduct (for example, issuing duplicate code lists). Admin multisig    |
| `get_manufacturer(manufacturer) -> ManufacturerInfo`                       | Read-only                                                                                             |

#### BatchRegistry

| Function                                                                                                   | Purpose                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `register(manufacturer, product_id, batch_ref, root, count, mfg_date, expiry_date, reference_hash) -> u64` | Anchors a batch and returns `batch_id`. Manufacturer auth required and the manufacturer must be verified and not suspended. `count` must be at most `MAX_BATCH_CODES` |
| `recall(batch_id, reason_hash)`                                                                            | The manufacturer or an attester recalls a batch. A recall cannot be undone                                                                                            |
| `supersede_reference(batch_id, new_reference_hash)`                                                        | Adds a newer reference image set. The previous one stays visible in history                                                                                           |
| `get_batch(batch_id) -> BatchRecord`                                                                       | Read-only                                                                                                                                                             |
| `get_batch_by_ref(manufacturer, batch_ref) -> Option<u64>`                                                 | Read-only                                                                                                                                                             |
| `verify_code(batch_id, leaf, proof) -> bool`                                                               | Verifies a code hash against the batch root. Read-only and free to call. Returns `ProofTooLong` if the proof exceeds `MAX_PROOF_LEN`                                  |
| `get_max_batch_codes() -> u64`                                                                             | Read-only. Clients should discover limits through getters                                                                                                             |
| `extend_batch_ttl(batch_id)`                                                                               | Extends TTL to prevent archival. Publicly callable                                                                                                                    |

#### ScanLedger

| Function                                                                                    | Purpose                                                                                                                                                      |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `initialize(admin, gateway_signers, radar_signer)`                                          | Sets the admin, the gateway keys allowed to anchor scan summaries, and the Clone Radar key                                                                   |
| `anchor_scans(batch_id, period_start, period_end, scan_root, scan_count, first_scan_count)` | A gateway signer anchors a period's scan summary. Append-only                                                                                                |
| `commit_first_scan(batch_id, leaf_hash)`                                                    | Marks a code as consumed for batches that require on-chain first-scan state (high-risk categories such as medicine). Gateway signer only. Cannot be reversed |
| `is_consumed(batch_id, leaf_hash) -> bool`                                                  | Read-only                                                                                                                                                    |
| `flag(batch_id, rule_id, evidence_hash, severity)`                                          | The radar signer flags a batch or code range. An evidence hash is required                                                                                   |
| `flag_area(cell, rule_id, evidence_hash, severity)`                                         | The radar signer flags a coarse area (a geohash cell of about 1 km)                                                                                          |
| `resolve_flag(flag_id, outcome, note_hash)`                                                 | Reviewers close a flag as confirmed or dismissed                                                                                                             |
| `get_flag(flag_id) -> Flag`                                                                 | Read-only                                                                                                                                                    |
| `get_watchlist(offset, limit) -> Vec<u64>`                                                  | Read-only list of open flags                                                                                                                                 |
| `rotate_signer(kind, new_signer)`                                                           | Admin multisig rotates a gateway or radar key                                                                                                                |

#### BountyVault

| Function                                                   | Purpose                                                                                                                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `__constructor(VaultConfig)`                               | Sets admin, token, reviewer set, reviewer threshold, reward caps, and expiry in one call                                                                     |
| `fund(from, amount)`                                       | A manufacturer or sponsor tops up the pool                                                                                                                   |
| `submit(reporter, batch_id, pack_hash, claim_hash) -> u64` | Submits an evidence pack and returns `report_id`. `claim_hash` is the hash of a secret the reporter uses to claim the reward later, so no identity is stored |
| `review(report_id, reviewer, confirm, note_hash)`          | A reviewer confirms or rejects. Reviewer auth required, and each reviewer votes once                                                                         |
| `finalize(report_id)`                                      | Tallies the reviewer votes once the threshold is met or the review window ends                                                                               |
| `claim_reward(report_id, claim_secret, to)`                | The reporter claims a confirmed reward by revealing the secret                                                                                               |
| `expire_unclaimed(report_id)`                              | Returns an unclaimed reward to the pool after the claim window                                                                                               |
| `set_reward_cap(severity, cap)`                            | Admin sets the maximum reward per severity level                                                                                                             |
| `get_report(report_id) -> Report`                          | Read-only                                                                                                                                                    |
| `get_pool_balance() -> i128`                               | Read-only                                                                                                                                                    |
| `get_user_nonce(caller) -> u64`                            | Read-only replay-protection nonce                                                                                                                            |
| `pause()` / `unpause()`                                    | Emergency stop. Admin auth required                                                                                                                          |

#### Enforced Invariants and Test Mapping

Each invariant below is a design target and will be covered by the named tests.

**ManufacturerRegistry**

- **Attester-only verification**: only an approved attester can verify a manufacturer (`Unauthorized`). Test: `contracts/manufacturer-registry/src/test.rs -> test_verify_requires_attester`
- **Stake minimum**: a manufacturer cannot be verified without the minimum stake (`InsufficientStake`). Test: `test_verify_below_min_stake_fails`
- **Suspension blocks registration**: a suspended manufacturer cannot register batches (`ManufacturerSuspended`). Test: `test_suspended_cannot_register_batch`
- **Stake locked during cases**: stake cannot be withdrawn while suspended or under a slashing case (`StakeLocked`). Test: `test_withdraw_while_suspended_fails`

**BatchRegistry**

- **Immutable root**: a batch's root, count, and dates can never be changed after registration. Test: `contracts/batch-registry/src/test.rs -> test_batch_fields_immutable`
- **No duplicate batch**: the same manufacturer and `batch_ref`, or the same root, cannot be registered twice (`BatchAlreadyExists`, `DuplicateRoot`). Test: `test_duplicate_batch_ref_fails`, `test_duplicate_root_fails`
- **Verified manufacturers only**: registration requires a verified, active manufacturer (`ManufacturerNotVerified`). Test: `test_register_requires_verified_manufacturer`
- **Size limit**: `count` cannot exceed `MAX_BATCH_CODES` (`BatchTooLarge`). Test: `test_register_above_max_codes_fails`, `test_register_at_max_codes_succeeds`
- **Recall is permanent**: a recalled batch cannot be un-recalled (`AlreadyRecalled`). Test: `test_recall_is_permanent`, `test_recall_requires_authority`
- **Proof length limit**: proofs longer than `MAX_PROOF_LEN` are rejected (`ProofTooLong`). Test: `test_verify_code_proof_too_long_fails`
- **Forged codes fail**: a code that is not in the batch never verifies. Test: `test_forged_leaf_fails_verification`

**ScanLedger**

- **Append-only anchors**: a period's scan summary cannot be overwritten, and periods cannot overlap (`PeriodOverlap`). Test: `contracts/scan-ledger/src/test.rs -> test_anchor_overlapping_period_fails`
- **First scan is permanent**: once a code is consumed it cannot be unconsumed, and a second commit is rejected (`AlreadyConsumed`). Test: `test_double_first_scan_fails`, `test_consumed_state_is_permanent`
- **Radar-only flags**: only the radar signer can flag, and a flag needs an evidence hash (`Unauthorized`, `MissingEvidence`). Test: `test_flag_requires_radar_signer`, `test_flag_without_evidence_fails`
- **Reviewer-only resolution**: only approved reviewers can resolve a flag (`Unauthorized`). Test: `test_resolve_flag_requires_reviewer`
- **Signer rotation by multisig**: signer keys change only through admin multisig. Test: `test_rotate_signer_requires_admin`

**BountyVault**

- **One reward per pack**: a pack hash can be submitted and rewarded only once (`DuplicatePack`, `AlreadyClaimed`). Test: `contracts/bounty-vault/src/test.rs -> test_duplicate_pack_fails`, `test_double_claim_fails`
- **Reviewer threshold**: a report is confirmed only when the configured number of distinct reviewers agree (`ThresholdNotMet`). Test: `test_confirm_below_threshold_fails`, `test_confirm_at_threshold_succeeds`
- **One vote per reviewer**: (`AlreadyVoted`). Test: `test_reviewer_double_vote_fails`
- **Claim needs the secret**: only the holder of the claim secret can collect the reward (`InvalidClaimSecret`). Test: `test_claim_with_wrong_secret_fails`
- **Reward cap and pool bound**: a payout cannot exceed the severity cap or the pool balance (`ExceedsRewardCap`, `InsufficientPool`). Test: `test_reward_above_cap_fails`, `test_reward_above_pool_fails`
- **Expiry returns funds**: an unclaimed reward returns to the pool after the claim window (`ClaimWindowOpen` before it). Test: `test_expire_before_window_fails`, `test_expire_after_window_returns_funds`
- **Replay protection**: state-changing calls require the current nonce (`InvalidNonce`). Test: `test_replay_with_old_nonce_fails`
- **Pausable**: operations halt when paused (`Paused`). Test: `test_submit_when_paused_fails`, `test_claim_when_paused_fails`

### Events

| Event                        | Topics                                           | Data                                                                        |
| ---------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| `ManufacturerVerifiedEvent`  | `("manufacturer_verified_event", manufacturer)`  | `attester`, `ledger`                                                        |
| `ManufacturerSuspendedEvent` | `("manufacturer_suspended_event", manufacturer)` | `reason_hash`, `ledger`                                                     |
| `BatchRegisteredEvent`       | `("batch_registered_event", batch_id)`           | `manufacturer`, `product_id`, `root`, `count`, `expiry_date`                |
| `BatchRecalledEvent`         | `("batch_recalled_event", batch_id)`             | `reason_hash`, `ledger`                                                     |
| `ScansAnchoredEvent`         | `("scans_anchored_event", batch_id)`             | `period_start`, `period_end`, `scan_root`, `scan_count`, `first_scan_count` |
| `FirstScanEvent`             | `("first_scan_event", batch_id)`                 | `leaf_hash`, `ledger`                                                       |
| `FlagEvent`                  | `("flag_event", flag_id)`                        | `batch_id`, `rule_id`, `severity`, `evidence_hash`                          |
| `FlagResolvedEvent`          | `("flag_resolved_event", flag_id)`               | `outcome`, `ledger`                                                         |
| `ReportSubmittedEvent`       | `("report_submitted_event", report_id)`          | `batch_id`, `pack_hash`, `ledger`                                           |
| `ReportFinalizedEvent`       | `("report_finalized_event", report_id)`          | `outcome`, `confirmations`, `rejections`                                    |
| `RewardClaimedEvent`         | `("reward_claimed_event", report_id)`            | `amount`, `ledger`                                                          |

Indexers should key batch events on `batch_id` and report events on `report_id`. Because scan summaries are periodic, they must key them on `(batch_id, period_start)`.

### Error Codes

Every contract returns errors from a single shared enum in `contracts/common`. Codes are stable: new variants are appended with fresh values and never renumbered.

| Code | Variant                   | Meaning                                        |
| ---- | ------------------------- | ---------------------------------------------- |
| 1    | `AlreadyInitialized`      | Initialisation attempted twice                 |
| 2    | `NotInitialized`          | Call made before initialisation                |
| 3    | `Unauthorized`            | Caller lacks the required authority            |
| 4    | `Paused`                  | Contract is paused                             |
| 5    | `InvalidAmount`           | Amount was not strictly positive               |
| 6    | `InvalidNonce`            | Replay-protection nonce did not match          |
| 100  | `ManufacturerNotVerified` | Manufacturer has not been verified             |
| 101  | `ManufacturerSuspended`   | Manufacturer is suspended                      |
| 102  | `InsufficientStake`       | Stake below the required minimum               |
| 103  | `StakeLocked`             | Stake tied to a suspension or open case        |
| 200  | `BatchNotFound`           | No such batch                                  |
| 201  | `BatchAlreadyExists`      | Batch reference already registered             |
| 202  | `DuplicateRoot`           | Merkle root already registered                 |
| 203  | `BatchTooLarge`           | More codes than `MAX_BATCH_CODES`              |
| 204  | `AlreadyRecalled`         | Batch is already recalled                      |
| 205  | `ProofTooLong`            | Merkle proof exceeds `MAX_PROOF_LEN`           |
| 300  | `PeriodOverlap`           | Scan period overlaps an anchored period        |
| 301  | `AlreadyConsumed`         | Code already marked as first-scanned           |
| 302  | `MissingEvidence`         | Flag submitted without an evidence hash        |
| 303  | `FlagNotFound`            | No such flag                                   |
| 400  | `DuplicatePack`           | Evidence pack already submitted                |
| 401  | `AlreadyVoted`            | Reviewer already voted on this report          |
| 402  | `ThresholdNotMet`         | Not enough reviewer confirmations              |
| 403  | `InvalidClaimSecret`      | Claim secret did not match                     |
| 404  | `AlreadyClaimed`          | Reward already claimed                         |
| 405  | `ExceedsRewardCap`        | Reward above the cap for this severity         |
| 406  | `InsufficientPool`        | Bounty pool too small                          |
| 407  | `ClaimWindowOpen`         | Expiry attempted before the claim window ended |

### Storage and TTL

Soroban archives entries that are not kept alive. Batch records need to outlive a product's shelf life, often years, so they are treated as long-lived. The active TTL strategy keeps records in persistent storage for about 30 days (~518,400 ledgers) at a time. The manufacturer dashboard and a keeper service extend TTL for every unexpired batch, and anyone can call `extend_batch_ttl`. If a record is archived, it can be restored with a restore transaction before it is read again.

### Amount Semantics

All amounts are integer token base units (`i128`). No floating-point arithmetic is used.

| Unit                  | Base units |
| --------------------- | ---------- |
| 1 stroop (smallest)   | 1          |
| 1 token (USDC or XLM) | 10_000_000 |
| 5 USDC                | 50_000_000 |

Dates are stored as Unix timestamps. Windows (review period, claim window) are in Stellar ledgers, about 5 seconds each. For example, a 7-day claim window is roughly 120,960 ledgers.

---

### @tickmark/labelkit

The manufacturer's toolkit. Runs offline, so code lists never leave the factory unhashed.

```bash
tickmark codes generate --count 100000 --length 12 --out ./batch-B2210
tickmark batch build ./batch-B2210           # Builds the Merkle tree of code hashes
tickmark batch register ./batch-B2210 --product para-500 --expiry 2028-03-01
tickmark labels export ./batch-B2210 --format csv --template scratch-label
tickmark batch recall B2210 --reason "Packaging fault"
```

```
packages/labelkit/
├── src/
│   ├── codes.ts          # Secure random generation, checksum, formatting
│   ├── merkle.ts         # Sorted-pair SHA-256 tree and proofs
│   ├── register.ts       # Build and submit BatchRegistry transactions
│   ├── labels.ts         # CSV and print-ready label exports
│   └── verify.ts         # Local self-check of a batch
├── package.json
└── README.md
```

**Stack:** TypeScript, @stellar/stellar-sdk, Node crypto

### @tickmark/gateway

The verification gateway. Handles SMS, USSD, and API checks.

```
packages/gateway/
├── src/
│   ├── sms/               # Inbound command parsing, outbound replies
│   ├── ussd/              # Session handling and menus (short screens)
│   ├── verify.ts          # Hash code, build proof, verify against on-chain root
│   ├── scanlog.ts         # Append-only scan log and periodic anchoring
│   ├── ratelimit.ts       # Per-number and per-IP guessing limits
│   ├── providers/         # Telecom aggregator adapters (swappable)
│   ├── i18n/              # English, Pidgin, Hausa, Yoruba, Igbo replies
│   └── metrics.ts         # Prometheus exporter
├── Dockerfile
└── package.json
```

**Stack:** TypeScript, @stellar/stellar-sdk, Redis, PostgreSQL, Docker, Prometheus. Consumer phone numbers are stored only as keyed hashes.

### @tickmark/radar

The Clone Radar rules engine. Rules are data, so new patterns can be added without changing the engine.

```yaml
id: CR-TRAVEL-001
title: Impossible travel between checks
severity: high
window_minutes: 180
condition:
  same_code: true
  min_distance_km: 300
output:
  flag: batch
  evidence: [scan_ids, locations, timestamps]
```

```
packages/radar/
├── src/
│   ├── engine.ts          # Rule evaluation over the scan log
│   ├── rules/             # One YAML per rule
│   ├── geo.ts             # Coarse cell maths, distance, travel-time checks
│   ├── evidence.ts        # Builds and hashes evidence for flags
│   └── publish.ts         # Signs and submits ScanLedger flags
├── fixtures/              # Synthetic scan logs that should and should not trigger
└── package.json
```

### @tickmark/lens

The AI layer. Takes photos and structured scan data. Faces and personal details are blurred before any image reaches a model.

```
packages/lens/
├── src/
│   ├── packaging.ts       # Pack photo vs reference images
│   ├── code_reader.ts     # Reads codes from photos
│   ├── triage.ts          # Cluster and rank reports
│   ├── seller_risk.ts     # Shop-level risk indicator (reviewers only)
│   ├── summary.ts         # Evidence pack summaries
│   ├── explain.ts         # Buyer explanations in local languages
│   └── redact.ts          # Face and personal-detail blurring
├── evals/                 # Labelled genuine and fake pack photos
├── prompts/
└── package.json
```

**Stack:** TypeScript, Python image workers, vision model API, perceptual hashing.

### @tickmark/api

```
GET   /v1/verify/:code                         Check a code (rate-limited)
GET   /v1/batches/:id                          Public batch record and status
GET   /v1/batches/:id/stats                    Checks, first-scan share, flags (manufacturer view)
GET   /v1/watchlist                            Open Clone Radar flags
GET   /v1/manufacturers/:address               Manufacturer profile and verification status
POST  /v1/reports                              Submit a suspected fake with photos
POST  /v1/lens/packaging                       Run an AI packaging check (authenticated)
GET   /v1/reports/:id/bundle                   Signed evidence bundle (reviewers and regulators)
```

**Stack:** Node.js, Fastify, PostgreSQL, Redis, S3-compatible storage, @stellar/stellar-sdk

### @tickmark/sdk

```ts
import { Tickmark } from '@tickmark/sdk';

const tm = new Tickmark({ network: 'testnet' });
const result = await tm.verify('K7M2-9QXA-4TD8');
// { status: "genuine_first_check", product: "Paracetamol 500mg", batch: "B2210", expiry: "2028-03" }
```

### @tickmark/app

| Route                       | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| `/`                         | Check a code: type it, scan it, or photograph it      |
| `/result/:id`               | Result with product details and next steps            |
| `/report`                   | Report a suspected fake with photos                   |
| `/watchlist`                | Public list of flagged batches and areas              |
| `/manufacturer`             | Dashboard: batches, checks, regions, recalls, billing |
| `/manufacturer/batches/new` | Register a batch from a labelkit export               |
| `/review`                   | Reviewer queue and evidence packs                     |
| `/bounties`                 | Bounty pool, payouts, and claim page                  |

**Stack:** Next.js 14, TailwindCSS, MapLibre, @stellar/stellar-sdk, Freighter / LOBSTR / xBull wallet support

---

## Why Stellar?

- **Cheap anchoring.** Registering batches and anchoring scan summaries costs fractions of a cent, so a small manufacturer can afford it.
- **Tamper-evident records.** A batch root, a recall, and a flag are public and cannot be quietly edited, unlike a private database.
- **Stablecoin bounties.** Reporters are paid in USDC, a stable asset anywhere in the world.
- **Pseudonymous rewards.** A reporter can claim a bounty without revealing an identity.
- **Soroban logic.** Recalls, reviewer thresholds, and payouts are enforced by open, auditable contracts.

---

## Threat Model and Honest Limits

Tickmark proves that a code is real and unused. It does not prove that a product is genuine by itself.

| Risk                                     | Mitigation                                                                                                                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Genuine code copied onto a fake pack** | First-scan state and Clone Radar flag the second use. Scratch or tamper-evident labels make copying harder. The AI packaging check looks for visual differences              |
| **Fake code that is not in the batch**   | It fails Merkle verification and returns "not found"                                                                                                                         |
| **Leaked code list (insider)**           | Only hashes are shared with the gateway. A leak at the factory is still possible, so duplicated lists are slashable and Clone Radar watches for abnormal first-scan patterns |
| **Guessing codes**                       | At least 60 bits of randomness plus per-number and per-IP rate limits                                                                                                        |
| **Fake reports to hurt a competitor**    | Reviewer panel, evidence requirements, and reporter reputation. Seller risk scores are shown only to reviewers                                                               |
| **Bounty farming**                       | One reward per pack, reviewer threshold, reward caps, and duplicate detection                                                                                                |
| **Compromised gateway or radar key**     | Keys are rotated by admin multisig. Scan anchors are append-only, and batch records do not depend on the gateway                                                             |
| **Privacy**                              | Phone numbers stored only as keyed hashes, only coarse location cells are kept, and faces are blurred in photos                                                              |

Known limits:

- A tick means "this code is real and has not been used before". It cannot tell you what is inside the pack.
- Honest buyers sometimes scan a code twice. The reply explains this calmly instead of accusing the shop.
- The AI packaging check can be wrong, especially with poor photos. It raises warnings and never decides.
- Tickmark is not a regulator. Manufacturer verification depends on approved attesters, and legal enforcement stays with the relevant authorities.
- Coverage depends on manufacturers adopting codes. Early on, the product works best for brands that have already felt the damage from fakes.

Full details are in `docs/SECURITY_MODEL.md`.

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- pnpm 9 or later
- Rust stable and the Stellar CLI
- A funded Stellar Testnet account (`stellar keys generate --fund`)
- Optional: vision model API key for `@tickmark/lens`
- Optional: a telecom aggregator sandbox (not needed for the local simulator)

```bash
rustup target add wasm32v1-none
cargo install --locked stellar-cli
```

### Install

```bash
git clone https://github.com/your-org/tickmark.git
cd tickmark
pnpm install
cp .env.example .env     # add Stellar keys, phone-hash pepper, storage config
```

### Try a full flow locally

```bash
# 1. Generate and register a sample batch (Testnet)
pnpm --filter @tickmark/labelkit build
node packages/labelkit/dist/cli.js codes generate --count 1000 --out ./demo-batch
node packages/labelkit/dist/cli.js batch register ./demo-batch --product demo --expiry 2028-01-01

# 2. Start the gateway and simulator
pnpm --filter @tickmark/gateway dev
pnpm --filter @tickmark/app dev          # open the simulator at /simulator
```

### Run in development

```bash
pnpm dev                                   # everything via Turborepo
pnpm --filter @tickmark/radar dev          # Clone Radar against a synthetic scan log
pnpm --filter @tickmark/api dev            # API only
```

### Test

```bash
cd packages/contracts && cargo test
pnpm turbo test
pnpm turbo lint
```

### Deploy contracts to Testnet

```bash
cd packages/contracts
stellar contract build
bash ../../scripts/deploy_testnet.sh
```

---

## Live on Testnet

| Contract             | ID               |
| -------------------- | ---------------- |
| ManufacturerRegistry | _to be deployed_ |
| BatchRegistry        | _to be deployed_ |
| ScanLedger           | _to be deployed_ |
| BountyVault          | _to be deployed_ |

---

## Roadmap

| Phase | Milestone                                                                                                         |
| ----- | ----------------------------------------------------------------------------------------------------------------- |
| 1     | `ManufacturerRegistry` and `BatchRegistry` on Testnet, `labelkit` CLI, and local verification with the simulator  |
| 2     | Gateway with SMS and USSD, scan log, and `ScanLedger` anchoring                                                   |
| 3     | Clone Radar rules engine, public watch list, and manufacturer dashboard                                           |
| 4     | `BountyVault`, evidence packs, reviewer portal, and regulator bundles                                             |
| 5     | Tickmark Lens (AI packaging check, code reader, triage), first manufacturer pilot, security audit, Mainnet launch |

---

## Planned Issues for Contributors

Tickmark is built to give contributors scoped, well-defined work every sprint.

| Type                  | Examples                                                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Smart contracts**   | Tests for each invariant above, Merkle verification edge cases, flag lifecycle, reviewer threshold logic, storage and fee optimisation |
| **Clone Radar rules** | New detection rules with synthetic fixtures, false-positive tuning, distance and travel-time maths                                     |
| **Bug fixes**         | SMS parsing edge cases, USSD session resume, duplicate scan handling, timezone bugs in expiry dates                                    |
| **New features**      | New telecom provider adapters, label template exports, manufacturer billing view, bulk batch import                                    |
| **AI and vision**     | Add labelled genuine and fake pack photos to the evaluation set, improve code reading from photos, new language replies                |
| **Testing**           | End-to-end verification test on Testnet, load tests for the gateway, fuzzing the Merkle proof verifier                                 |
| **Documentation**     | Code format spec, manufacturer onboarding guide, reviewer handbook, API reference                                                      |
| **Good first issues** | Typos, reply wording that fits SMS limits, README examples, empty-state screens, new simulator scenarios                               |

Every issue has a description, acceptance criteria, and a pointer to the relevant files.

---

## Security

- Contract audit: pending, with reports to be published in `audits/`
- Plain verification codes are never stored by the gateway, only hashes
- Fixtures and evaluation images are synthetic or licensed, and never contain real consumer data
- AI never holds keys, never signs, and never decides a result
- Responsible disclosure: `security@your-domain.example`

---

## Contributing

```bash
git checkout -b feat/your-feature
pnpm turbo test
pnpm turbo lint
# open a PR against main
```

See `CONTRIBUTING.md`, `docs/architecture.md`, and `docs/SECURITY_MODEL.md`.

---

## License

MIT, 2026 Tickmark Contributors

---
