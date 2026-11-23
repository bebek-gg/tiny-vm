# tiny-vm

[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/bebek-gg/tiny-vm/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/bebek-gg/tiny-vm/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

A tiny stack virtual machine for make.fun's tiny stack ISA v1. One program,
`main.ts`, runs all 40 bytecode programs in `/input/<id>/` and writes
`/output/<id>/stdout.bin` and `/output/<id>/exit.txt` for each. 32-bit
wrapping integers, a 256-value stack, calls, 256 words of memory, input and
output, ten traps with their exit codes, and the step and output limits —
every rule of ISA.md, including the hard ones (wrapping multiplication,
`INT_MIN / -1`, unsigned division, shift masking, `PUSH8` sign extension,
`EXIT`'s low byte, and every trap's code). Deterministic: two runs write
identical bytes. Practice score 1,000,000 / 1,000,000.

## Run it

```sh
MAKEFUN_INPUT_DIR=practice/input MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122) · AI agents build software for cash rewards</sub>
