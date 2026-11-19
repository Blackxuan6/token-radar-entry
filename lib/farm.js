// The farm-plan module, shared by main.ts (Node) and the dashboard (browser): one file, plain JS,
// no modules, no dependencies. main.ts imports it to write board.json's farm_steps; the page loads it
// as a classic script and renders the same plans, so the screenshots and board.json cannot disagree.
//
// A plan is six steps for a protocol's family (its category's kind of DeFi), with placeholders filled
// from the snapshot: {name} the protocol, {chain} its main chain, {capital} the suggested dollars,
// {hold} the suggested hold in days, {gas} a typical gas cost. Every step names a cost and a time.
//
// The plans never claim a points program, an airdrop or a token launch exists: where a step depends on
// one, it says "if it runs one" and points at the protocol's own page. Costs are estimates. The drafts
// for eight families (lending, dex, bridge, staking, rwa, derivatives, curators, yield-agg) came from
// the AMD TokenLab API (DeepSeek-V4.1-Flash) and were reviewed, corrected and normalised here; the
// other eight were written for this entry in the same shape.

/* ---- families ---- */

var FAMILIES = {};

/* Lending markets, CDP and collateral markets. */
FAMILIES.lending = [
  { text: "Create a fresh wallet for {name} on {chain}, fund it with {capital} USD of the asset you plan to supply, and keep a little extra for gas so activity is easy to trace.", cost: "${capital} plus bridge or withdrawal fees to fund the wallet", time: "20-40 minutes" },
  { text: "Supply your asset to a {name} lending market on {chain}, confirm the supply transaction, and record the market, amount, and timestamp in your log.", cost: "${capital} supplied plus about {gas} gas", time: "10-15 minutes" },
  { text: "Borrow a small amount against your collateral on {name}, staying well below the liquidation threshold, then repay it in the same session to build a borrow-and-repay record.", cost: "Interest for the borrow period plus about {gas} gas per transaction", time: "15-30 minutes" },
  { text: "Once a week, claim any rewards {name} shows on its own page if it runs one, and adjust your supply or borrow to keep the position healthy.", cost: "About {gas} gas per weekly transaction", time: "10-20 minutes weekly" },
  { text: "Hold your supplied position for {hold} days, checking the health factor and interest rates on {name} every few days so a rate move or price swing does not force a liquidation.", cost: "No fixed fee; supply yield accrues over {hold} days", time: "5-10 minutes every few days" },
  { text: "Repay any outstanding borrow, withdraw your supply from {name}, claim rewards if it runs one, and log each transaction hash, date, and amount for your records.", cost: "About {gas} gas for repay and withdraw", time: "20-30 minutes" }
];

/* Decentralized exchanges, yield farms, leveraged farming, liquidity managers. */
FAMILIES.dex = [
  { text: "Create a fresh wallet for {name} on {chain}, fund it with {capital} USD split between the two assets you will pair, and keep a little extra for gas.", cost: "${capital} plus funding and swap fees", time: "20-40 minutes" },
  { text: "Provide liquidity to a {name} pool on {chain} with your two assets, confirm the LP tokens you receive, and note the pool, amounts, and timestamp in your log.", cost: "${capital} supplied plus about {gas} gas", time: "15-30 minutes" },
  { text: "Stake your LP position on {name} if it runs a farm, checking the protocol's own page for the farm and its terms, and record the staked amount and start date.", cost: "About {gas} gas to stake", time: "10-20 minutes" },
  { text: "Once a week, claim any farm rewards {name} shows on its own page if it runs one, and review the pool's price range and impermanent loss before adding or removing liquidity.", cost: "About {gas} gas per weekly claim", time: "10-20 minutes weekly" },
  { text: "Hold your LP position for {hold} days, checking impermanent loss and pool depth on {name} every few days so a large price move does not leave you in a worse position than holding.", cost: "Impermanent loss exposure, no fixed fee", time: "5-10 minutes every few days" },
  { text: "Unstake and withdraw your liquidity from {name}, claim any rewards if it runs one, swap back to a single asset if you want, and log every transaction hash and amount.", cost: "About {gas} gas for unstake, withdraw, and swap", time: "20-40 minutes" }
];

/* Bridges and canonical bridges. */
FAMILIES.bridge = [
  { text: "Create a fresh wallet for {name} on {chain}, fund it with {capital} USD of the asset you will bridge, and keep enough native gas for both the source and destination chains.", cost: "${capital} plus funding fees and gas on both chains", time: "20-40 minutes" },
  { text: "Bridge your asset through {name} from {chain} to your chosen destination chain, confirm the transfer on both explorers, and record the amount, route, and timestamp.", cost: "Bridge fee plus about {gas} gas on each chain", time: "10-30 minutes plus finality wait" },
  { text: "Use the bridged asset on the destination chain, for example supplying it to a lending market or swapping it in a DEX, so {name} activity continues past the bridge itself.", cost: "About {gas} gas on the destination chain plus any swap fee", time: "15-30 minutes" },
  { text: "Once a week, bridge a small amount through {name} if fees allow, and check the protocol's own page for any rewards program it runs.", cost: "Bridge fee plus about {gas} gas per transfer", time: "10-20 minutes weekly" },
  { text: "Hold your bridged position for {hold} days, checking bridge fees, finality times, and destination-chain balances every few days so funds are not stranded.", cost: "No fixed fee, but bridge and gas costs apply on each move", time: "5-10 minutes every few days" },
  { text: "Bridge remaining assets back to {chain} through {name}, claim any rewards if it runs one, verify balances on both explorers, and log every transaction hash and amount.", cost: "Bridge fee plus about {gas} gas", time: "20-40 minutes" }
];

/* Liquid staking, liquid restaking, restaking, staking pools. */
FAMILIES.staking = [
  { text: "Create a fresh wallet for {name} on {chain}, fund it with {capital} USD of the chain asset you will stake, and keep a small gas reserve for stake and claim transactions.", cost: "${capital} plus funding fees and a gas reserve", time: "20-40 minutes" },
  { text: "Stake your chain asset through {name} on {chain}, confirm the receipt token you receive, and record the staked amount, receipt token, and timestamp in your log.", cost: "${capital} staked plus about {gas} gas", time: "10-20 minutes" },
  { text: "Use your receipt token in a DeFi position on {chain}, such as supplying it to a lending market or providing liquidity, and note the venue and amount in your log.", cost: "About {gas} gas plus any venue deposit fee", time: "15-30 minutes" },
  { text: "Once a week, claim any staking or restaking rewards {name} shows on its own page if it runs one, and check the receipt token's peg and your DeFi position's health.", cost: "About {gas} gas per weekly claim", time: "10-20 minutes weekly" },
  { text: "Hold your staked position for {hold} days, checking validator or operator status and unstaking delays on {name} every few days so an exit does not catch you short.", cost: "No fixed fee, but staking yield varies", time: "5-10 minutes every few days" },
  { text: "Unstake from {name}, withdraw your receipt token from any DeFi venue, claim remaining rewards if it runs one, and log every transaction hash, date, and amount.", cost: "About {gas} gas for unstake and withdrawals", time: "20-40 minutes plus unstaking delay" }
];

/* Real-world-asset protocols. */
FAMILIES.rwa = [
  { text: "Create a fresh wallet for {name} on {chain}, fund it with {capital} USD plus a little native gas, and use a new address so your RWA activity is cleanly attributable to you.", cost: "${capital} plus about {gas} gas", time: "20-40 minutes" },
  { text: "Mint or buy {name}'s yield-bearing asset backed by off-chain holdings with part of your {capital}, confirm the backing and redemption terms on the protocol's own page, and hold the receipt.", cost: "${capital} deployed plus about {gas} gas", time: "15-30 minutes" },
  { text: "Add a second position in {name} by minting or buying more of the same yield-bearing asset, or a related one the protocol offers, so your on-chain record shows repeat participation.", cost: "About {gas} gas", time: "10-20 minutes" },
  { text: "Once a week, check {name}'s redemption window and backing status on its own page, and top up a little or claim rewards if it runs a program and you qualify.", cost: "About {gas} gas per weekly transaction", time: "10-20 minutes weekly" },
  { text: "Hold your {name} position for {hold} days, monitoring redemption windows and backing on the protocol's page; if it runs a rewards program, check it there, never assume one exists.", cost: "No fixed fee; yield accrues over {hold} days", time: "5-10 minutes every few days" },
  { text: "Exit {name} inside a redemption window, claim any rewards if it runs one, revoke approvals, and log dates, amounts, transaction hashes, and the redemption terms you relied on.", cost: "About {gas} gas", time: "20-40 minutes" }
];

/* Derivatives, perpetuals, options, basis trading. */
FAMILIES.derivatives = [
  { text: "Create a fresh wallet for {name} on {chain}, fund it with {capital} USD plus native gas, and keep this address separate so your perps and options activity is cleanly attributable.", cost: "${capital} plus about {gas} gas", time: "20-40 minutes" },
  { text: "Deposit margin into {name} and open a small hedged position, such as a perp offset by an opposite exposure or a defined-risk option, sized well below your margin.", cost: "${capital} margin plus about {gas} gas", time: "15-30 minutes" },
  { text: "Deepen the {name} position with a second leg, like a basis trade or a spread, so your record shows a deliberate hedged structure rather than a single directional bet.", cost: "About {gas} gas", time: "15-30 minutes" },
  { text: "Once a week, check {name}'s funding rates, margin ratio, and liquidation price on its own page, and top up margin or roll the hedge to keep the position safe.", cost: "About {gas} gas per weekly transaction", time: "10-20 minutes weekly" },
  { text: "Hold the hedged {name} position for {hold} days, monitoring funding and liquidation levels; if it runs a rewards program, confirm the terms on the protocol's page, never assume one.", cost: "No fixed fee; funding may apply over {hold} days", time: "5-10 minutes every few days" },
  { text: "Close the {name} position, withdraw margin, claim any rewards if it runs one, revoke approvals, and log entries, funding paid, transaction hashes, and the hedge you used.", cost: "About {gas} gas", time: "20-40 minutes" }
];

/* Risk curators and onchain capital allocators. */
FAMILIES.curators = [
  { text: "Create a fresh wallet for {name} on {chain}, fund it with {capital} USD plus native gas, and use a dedicated address so your curated-vault deposits are cleanly attributable.", cost: "${capital} plus about {gas} gas", time: "20-40 minutes" },
  { text: "Deposit into a curated vault on {name}, reading the curator's strategy description, fees, and withdrawal queue on the protocol's own page before you commit capital.", cost: "${capital} deposited plus about {gas} gas", time: "15-30 minutes" },
  { text: "Deepen the {name} position by adding to the same curated vault or a second vault from the same curator, so your record shows sustained allocation across strategies.", cost: "About {gas} gas", time: "10-20 minutes" },
  { text: "Once a week, check {name}'s vault fees, strategy allocations, and withdrawal queue on its own page, then top up or claim if it runs a rewards program and you qualify.", cost: "About {gas} gas per weekly transaction", time: "10-20 minutes weekly" },
  { text: "Hold your {name} vault position for {hold} days, monitoring curator strategy changes and fees; if it runs a rewards program, verify the terms on the protocol's page, never assume one.", cost: "No fixed fee; vault fees may apply", time: "5-10 minutes every few days" },
  { text: "Exit {name} through the withdrawal queue, claim any rewards if it runs one, revoke approvals, and log deposit dates, fees paid, transaction hashes, and the curator strategies you held.", cost: "About {gas} gas", time: "20-40 minutes" }
];

/* Yield aggregators. */
FAMILIES['yield-agg'] = [
  { text: "Create a fresh wallet for {name} on {chain}, fund it with {capital} USD plus native gas, and use a dedicated address so your aggregator vault activity is cleanly attributable.", cost: "${capital} plus about {gas} gas", time: "20-40 minutes" },
  { text: "Deposit into an auto-compounding vault on {name}, reading the strategy list, withdrawal fees, and any lock terms on the protocol's own page before committing.", cost: "${capital} deposited plus about {gas} gas", time: "15-30 minutes" },
  { text: "Deepen the {name} position by adding to the same vault or a second auto-compounding vault, so your record shows sustained routing across yield sources.", cost: "About {gas} gas", time: "10-20 minutes" },
  { text: "Once a week, check {name}'s vault strategy changes and withdrawal fees on its own page, then top up or claim if it runs a rewards program and you qualify.", cost: "About {gas} gas per weekly transaction", time: "10-20 minutes weekly" },
  { text: "Hold your {name} vault position for {hold} days, monitoring strategy changes and fees; if it runs a rewards program, verify the terms on the protocol's page, never assume one.", cost: "No fixed fee; withdrawal fees may apply on exit", time: "5-10 minutes every few days" },
  { text: "Exit {name}, claim any rewards if it runs one, revoke approvals, and log deposit dates, withdrawal fees, transaction hashes, and the strategies your capital was routed through.", cost: "About {gas} gas", time: "20-40 minutes" }
];

/* A blockchain network itself, pre-token. The protocol is the chain, so these steps never treat
   {chain} as a separate source: the wallet's home chain is where the funds start. */
FAMILIES.chain = [
  { text: "Create a fresh wallet for {name}, fund it with {capital} USD on the chain you already use, and keep a little extra for gas on both sides of the bridge.", cost: "${capital} plus bridge fees and gas on both chains", time: "20-40 minutes" },
  { text: "Bridge funds to {name}, confirm the arrival on its explorer, and record the amount, route, and timestamp in your log.", cost: "Bridge fee plus about {gas} gas", time: "10-30 minutes plus finality wait" },
  { text: "Use a native app on {name}, such as swapping on its DEX or supplying to its lending market, so your record shows activity past the bridge itself.", cost: "About {gas} gas plus any swap fee", time: "15-30 minutes" },
  { text: "Once a week, make one real transaction on {name}, such as a swap or a deposit, and check the chain's own page for any rewards program it runs.", cost: "About {gas} gas per weekly transaction", time: "10-20 minutes weekly" },
  { text: "Hold your position on {name} for {hold} days, checking balances and the apps you used every few days so a failed transaction or a drained pool does not strand funds.", cost: "No fixed fee; gas applies on each move", time: "5-10 minutes every few days" },
  { text: "Withdraw from the apps you used, bridge remaining funds back to your home chain, claim any rewards if it runs one, and log every transaction hash, date, and amount.", cost: "Bridge fee plus about {gas} gas", time: "20-40 minutes" }
];

/* Stablecoin wrappers and dual-token stablecoins. */
FAMILIES.stable = [
  { text: "Create a fresh wallet for {name} on {chain}, fund it with {capital} USD of the asset you will mint with, and keep a little extra for gas.", cost: "${capital} plus about {gas} gas", time: "20-40 minutes" },
  { text: "Mint or buy {name}'s stable asset on {chain}, confirm the peg and redemption terms on the protocol's own page, and record the amount and timestamp in your log.", cost: "${capital} deployed plus about {gas} gas", time: "15-30 minutes" },
  { text: "Put the stable asset to work through {name}'s own savings or liquidity option on {chain}, and note the venue and amount in your log.", cost: "About {gas} gas plus any deposit fee", time: "10-20 minutes" },
  { text: "Once a week, check the stable asset's peg and {name}'s redemption terms on its own page, and claim any rewards if it runs a program and you qualify.", cost: "About {gas} gas per weekly transaction", time: "10-20 minutes weekly" },
  { text: "Hold your {name} position for {hold} days, watching the peg and backing every few days so a depeg or a redemption pause does not leave you unable to exit.", cost: "No fixed fee; yield accrues over {hold} days", time: "5-10 minutes every few days" },
  { text: "Withdraw from the savings or liquidity option, redeem or sell the stable asset, claim any rewards if it runs one, and log every transaction hash, date, and amount.", cost: "About {gas} gas for withdraw and redeem", time: "20-40 minutes" }
];

/* Bitcoin-anchored protocols: BTC staking, wrapped BTC products, BTC DeFi. */
FAMILIES.btc = [
  { text: "Create a fresh wallet for {name} on {chain}, fund it with {capital} USD of BTC or its wrapped form, and keep a little extra for gas.", cost: "${capital} plus funding and wrapping fees", time: "20-40 minutes" },
  { text: "Deposit your BTC through {name} on {chain}, confirm the receipt or staking position you receive, and record the amount and timestamp in your log.", cost: "${capital} deposited plus about {gas} gas", time: "15-30 minutes" },
  { text: "Deepen the position by staking or lending the receipt token through {name} or a venue it supports on {chain}, and note the venue and amount in your log.", cost: "About {gas} gas plus any venue fee", time: "15-30 minutes" },
  { text: "Once a week, check {name}'s custody terms, unbonding delay, and the receipt token's peg on its own page, and claim any rewards if it runs a program.", cost: "About {gas} gas per weekly transaction", time: "10-20 minutes weekly" },
  { text: "Hold your {name} position for {hold} days, checking custody and unbonding terms every few days so an exit delay does not catch you short.", cost: "No fixed fee; yield varies with the venue", time: "5-10 minutes every few days" },
  { text: "Unstake or withdraw through {name}, wait out the unbonding delay, claim any rewards if it runs one, and log every transaction hash, date, and amount.", cost: "About {gas} gas for unstake and withdraw", time: "20-40 minutes plus unbonding delay" }
];

/* Onchain insurance and cover. */
FAMILIES.insurance = [
  { text: "Create a fresh wallet for {name} on {chain}, fund it with {capital} USD plus a little native gas, and keep the address separate so your cover activity is easy to trace.", cost: "${capital} plus about {gas} gas", time: "20-40 minutes" },
  { text: "Buy cover from {name} on {chain} for a position you already hold, reading the exclusions, claim window, and payout terms on the protocol's own page first.", cost: "Cover premium plus about {gas} gas", time: "15-30 minutes" },
  { text: "Add a second cover on {name} for another position, or extend the first policy's term, so your record shows repeat use rather than a single purchase.", cost: "Cover premium plus about {gas} gas", time: "10-20 minutes" },
  { text: "Once a week, check that your cover is still active on {name}'s own page, confirm the position it covers has not changed, and note any policy updates.", cost: "About {gas} gas if you adjust cover", time: "10-20 minutes weekly" },
  { text: "Hold your {name} cover for {hold} days, keeping the covered position in place and watching for claim windows or exclusions that change on the protocol's page.", cost: "Premium already paid; no weekly fee", time: "5-10 minutes every few days" },
  { text: "Let the cover expire or cancel it through {name}, file any claim the policy covers before the window closes, and log premiums, dates, and transaction hashes.", cost: "About {gas} gas for cancel or claim", time: "20-40 minutes" }
];

/* Onchain payment protocols. */
FAMILIES.payments = [
  { text: "Create a fresh wallet for {name} on {chain}, fund it with {capital} USD plus a little native gas, and keep the address separate so your payment activity is easy to trace.", cost: "${capital} plus about {gas} gas", time: "20-40 minutes" },
  { text: "Fund your {name} payment account on {chain} and make a real payment through it, confirming the settlement on the explorer and recording the amount and timestamp.", cost: "${capital} funded plus about {gas} gas", time: "15-30 minutes" },
  { text: "Set up a second payment flow through {name}, such as a recurring payment or a payment to a different recipient, so your record shows more than one use.", cost: "About {gas} gas per payment", time: "10-20 minutes" },
  { text: "Once a week, make a payment through {name} and check settlement times and fees on its own page, keeping a balance ready for recurring use.", cost: "About {gas} gas per weekly payment", time: "10-20 minutes weekly" },
  { text: "Hold a working balance in {name} for {hold} days, using it for real payments every few days so the account shows steady use rather than one deposit.", cost: "No fixed fee; payment fees apply per use", time: "5-10 minutes every few days" },
  { text: "Withdraw any remaining balance from {name}, claim any rewards if it runs one, and log every payment, fee, and transaction hash for your records.", cost: "About {gas} gas for withdraw", time: "20-30 minutes" }
];

/* Governance-incentive protocols. */
FAMILIES.governance = [
  { text: "Create a fresh wallet for {name} on {chain}, fund it with {capital} USD of the asset the protocol takes for governance, and keep a little extra for gas.", cost: "${capital} plus about {gas} gas", time: "20-40 minutes" },
  { text: "Deposit into {name} on {chain} to take part in governance, confirm your voting weight on the protocol's own page, and record the amount and timestamp.", cost: "${capital} deposited plus about {gas} gas", time: "15-30 minutes" },
  { text: "Vote on a live proposal on {name}, or delegate your vote if the protocol supports it, and note the proposal and your vote in your log.", cost: "About {gas} gas per vote", time: "10-20 minutes" },
  { text: "Once a week, check {name}'s own page for new proposals and voting windows, and vote or adjust your delegation while the window is open.", cost: "About {gas} gas per weekly vote", time: "10-20 minutes weekly" },
  { text: "Hold your {name} position for {hold} days, voting on each proposal that opens so your record shows steady participation rather than a single vote.", cost: "No fixed fee; gas applies per vote", time: "5-10 minutes every few days" },
  { text: "Withdraw your deposit from {name} when you are done, claim any rewards if it runs one, and log your votes, deposits, and transaction hashes.", cost: "About {gas} gas for withdraw", time: "20-30 minutes" }
];

/* Centralized-finance-backed DeFi: exchange-linked yield or structured products. */
FAMILIES.cedefi = [
  { text: "Create a fresh wallet for {name} on {chain}, fund it with {capital} USD plus a little native gas, and keep the address separate so your activity is easy to trace.", cost: "${capital} plus about {gas} gas", time: "20-40 minutes" },
  { text: "Deposit into {name}'s product on {chain}, reading the yield terms, counterparty, and withdrawal conditions on the protocol's own page before you commit capital.", cost: "${capital} deposited plus about {gas} gas", time: "15-30 minutes" },
  { text: "Deepen the position by adding to the same product or a second one {name} offers, so your record shows sustained use rather than a single deposit.", cost: "About {gas} gas", time: "10-20 minutes" },
  { text: "Once a week, check {name}'s yield terms and withdrawal conditions on its own page, and top up or claim if it runs a rewards program and you qualify.", cost: "About {gas} gas per weekly transaction", time: "10-20 minutes weekly" },
  { text: "Hold your {name} position for {hold} days, monitoring the product's terms and counterparty status every few days so a change in terms does not catch you off guard.", cost: "No fixed fee; product fees may apply", time: "5-10 minutes every few days" },
  { text: "Withdraw from {name} under its withdrawal terms, claim any rewards if it runs one, revoke approvals, and log deposits, fees, and transaction hashes.", cost: "About {gas} gas for withdraw", time: "20-40 minutes" }
];

/* Any pre-token protocol whose category is unknown or fits no family above. */
FAMILIES.other = [
  { text: "Create a fresh wallet for {name} on {chain}, fund it with {capital} USD plus a little native gas, and keep the address separate so your activity is easy to trace.", cost: "${capital} plus about {gas} gas", time: "20-40 minutes" },
  { text: "Use {name}'s main feature on {chain} with a small deposit, reading its own page first to confirm what the feature does, and record the amount and timestamp.", cost: "${capital} deposited plus about {gas} gas", time: "15-30 minutes" },
  { text: "Use a second feature of {name} on {chain}, or repeat the main one with a small amount, so your record shows more than a single transaction.", cost: "About {gas} gas", time: "10-20 minutes" },
  { text: "Once a week, do one real action on {name} and check its own page for any rewards program it runs, verifying the terms there before you act on them.", cost: "About {gas} gas per weekly transaction", time: "10-20 minutes weekly" },
  { text: "Hold your {name} position for {hold} days, checking the protocol's own page every few days for changes to its features, fees, or terms.", cost: "No fixed fee; fees vary by feature", time: "5-10 minutes every few days" },
  { text: "Withdraw from {name}, claim any rewards if it runs one, revoke approvals, and log every transaction hash, date, and amount for your records.", cost: "About {gas} gas for withdraw", time: "20-30 minutes" }
];

/* ---- choosing a family, a capital, a hold and a gas price ---- */

/** A snapshot category's family; anything unlisted falls to 'other'. */
var FAMILY_OF = {
  'Lending': 'lending', 'CDP': 'lending', 'Collateral Markets': 'lending',
  'Dexs': 'dex', 'Yield': 'dex', 'Farm': 'dex', 'Leveraged Farming': 'dex', 'Liquidity Manager': 'dex',
  'Bridge': 'bridge', 'Canonical Bridge': 'bridge', 'Cross Chain Bridge': 'bridge',
  'Liquid Staking': 'staking', 'Liquid Restaking': 'staking', 'Restaking': 'staking', 'Staking Pool': 'staking',
  'RWA': 'rwa',
  'Derivatives': 'derivatives', 'Basis Trading': 'derivatives',
  'Risk Curators': 'curators', 'Onchain Capital Allocator': 'curators',
  'Yield Aggregator': 'yield-agg',
  'Chain': 'chain',
  'Stablecoin Wrapper': 'stable', 'Dual-Token Stablecoin': 'stable',
  'Anchor BTC': 'btc', 'Decentralized BTC': 'btc', 'Restaked BTC': 'btc',
  'Insurance': 'insurance',
  'Payments': 'payments',
  'Governance Incentives': 'governance',
  'CeDeFi': 'cedefi'
};

function familyFor(p) {
  if (!p || !p.category) return 'other';
  return FAMILY_OF[p.category] || 'other';
}

/** The suggested capital in dollars, by the protocol's TVL: bigger protocols, bigger stakes. */
function capitalFor(p) {
  var tvl = p && typeof p.tvl_usd === 'number' ? p.tvl_usd : 0;
  if (tvl >= 5000000000) return 250;
  if (tvl >= 1000000000) return 150;
  if (tvl >= 100000000) return 100;
  return 50;
}

/** The suggested hold in days, by the protocol's age: younger protocols, longer holds. */
function holdDaysFor(age) {
  if (age === null || age === undefined) return 30;
  if (age < 180) return 60;
  if (age < 365) return 45;
  return 30;
}

/** A typical gas cost per transaction on the main chain, as a rough estimate. */
var GAS = {
  'Ethereum': '$8',
  'Arbitrum': '$0.50', 'Optimism': '$0.50', 'Base': '$0.50', 'Polygon': '$0.50',
  'zkSync Era': '$0.50', 'Linea': '$0.50', 'Scroll': '$0.50', 'Blast': '$0.50',
  'Solana': '$0.05',
  'BSC': '$0.20', 'BNB Chain': '$0.20',
  'Avalanche': '$0.50', 'Fantom': '$0.20', 'Gnosis': '$0.20', 'Celo': '$0.10',
  'Tron': '$1', 'Bitcoin': '$2'
};

function gasFor(p) {
  var chain = p && p.chains && p.chains.length > 0 ? p.chains[0] : null;
  if (!chain) return '$2';
  return GAS[chain] || '$2';
}

function chainFor(p) {
  return p && p.chains && p.chains.length > 0 ? p.chains[0] : 'its main chain';
}

function fill(text, values) {
  return String(text).replace(/\{(name|chain|capital|hold|gas)\}/g, function (m, k) { return values[k]; });
}

/** The six steps, structured, for one protocol and its age in days. */
function farmPlanFor(p, age) {
  var values = { name: p.name, chain: chainFor(p), capital: capitalFor(p), hold: holdDaysFor(age), gas: gasFor(p) };
  return FAMILIES[familyFor(p)].map(function (s) {
    return { text: fill(s.text, values), cost: fill(s.cost, values), time: fill(s.time, values) };
  });
}

/** The six steps as board.json strings: the step, then its cost and time. */
function farmStepsFor(p, age) {
  return farmPlanFor(p, age).map(function (s) {
    return s.text + ' Cost: ' + s.cost + ' Time: ' + s.time;
  });
}

var FARM = { FAMILIES: FAMILIES, familyFor: familyFor, capitalFor: capitalFor, holdDaysFor: holdDaysFor, gasFor: gasFor, farmPlanFor: farmPlanFor, farmStepsFor: farmStepsFor };
if (typeof module !== 'undefined' && module.exports) module.exports = FARM;
if (typeof window !== 'undefined') window.FARM = FARM;
