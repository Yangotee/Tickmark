# @tickmark/contracts

Soroban Rust workspace for Tickmark's manufacturer registry, batch registry,
scan ledger, bounty vault, and shared contract errors. Contract crates are
scaffolds; business logic and invariant tests are not implemented yet.

## Build and test

```bash
rustup target add wasm32v1-none
cargo test
stellar contract build
```