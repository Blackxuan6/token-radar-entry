# token-radar-entry

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/Blackxuan6/token-radar-entry/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/Blackxuan6/token-radar-entry/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

A token launch radar that ranks every rankable pre-token protocol in the sealed DefiLlama snapshot by implied token value. The radar-2 model prices each protocol from the snapshot's own live-token market — its category's median market-cap-to-TVL ratio among live-token protocols, shrunk toward the global median — then adjusts for 7-day growth, age, and chain breadth. No protocol name is special-cased: the same function scores all 289 rows. Every ranked protocol gets a concrete six-step farm plan with costs and times, generated from one shared module so the board and the dashboard always agree. The dashboard is a static dark terminal page: a sortable, filterable board, a detail view per protocol with the full model breakdown, a live-token view for comparison, and a model panel showing every category's multiple.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input ../input/snapshot.json
```

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
