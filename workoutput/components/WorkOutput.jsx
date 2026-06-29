"use client";

// ============================================================================
// ============================================================================
// WorkOutput build v127.0
// Guest tier removed. Account creation is now required before any use. Supersedes v126.10.
// Previously the app booted into an anonymous "guest" tier with a one-session preview,
// then surfaced AuthGate at the cap. v127 makes account creation a hard precondition:
// - Boot tier is null (unauthenticated). The root render returns a mandatory, non-
//   dismissable AuthGate while tier is null, so no app surface and no null-tier code
//   path runs until setTier("free") moves the user to the lowest real tier.
// - AuthGate gains a `mandatory` mode: onboarding copy, no backdrop/Esc dismissal.
// - Guest removed from TIER_POLICY, INTELLIGENCE_CREDIT_POLICY, TIERS, OUTPUT_PLAN_
//   CEILING, and METRIC_LOOPS; policyFor and the credit fallback repoint to free.
// - Removed the guest cap branches in guardedSend and startSeededDecision, the
//   guestUsed/bumpGuestUsed state and its wo:guest:used store seam, the expandDocument
//   guest branch, and guest UI in TopBar and HomeV72. cap_block / insight_locked_view
//   now tag the real tier.
// SCOPE: client-side gating only. The TODO(server) markers still stand — account-bound,
// server-side enforcement (counters + IP/device throttling) remains required before
// this is real auth rather than an affordance.
// ============================================================================
// ============================================================================
// WorkOutput build v126.10
// View-level error boundary so a render fault is recoverable, not a frozen panel.
// Supersedes v126.9.
// Reported symptom: committing a decision and opening the decision card could lock the
// panel. A static trace of the card path (CardView, buildScorecard, buildDecisionCard,
// the SVG/PNG raster pipeline, the card/scorecard memos, the view-change scroll effect)
// found no deterministic loop or blocking call: every path is bounded or async with a
// timeout, and the memos do not recompute on a Document->Card navigation. That leaves a
// React update-depth error or a thrown render error as the cause, and until now there was
// NO error boundary anywhere, so any such throw unmounted the whole panel with no recovery
// and read as a freeze. This adds ViewErrorBoundary around the view switcher: it catches
// the error, logs it with its component stack (console: "[WorkOutput] view render error")
// for root-cause diagnosis, and renders a recoverable fallback (Back to your decision /
// Reload). It resets on viewKey (view) change so navigating away clears the fallback.
// This is resilience plus instrumentation. It makes the failure non-fatal and surfaces the
// exact error; it is not yet the confirmed root-cause fix, which the captured stack informs.
// ============================================================================
// ============================================================================
// WorkOutput build v126.9
// Opening a category scrolls to its header, not the old offset. Supersedes v126.8.
// preserveScroll previously pinned the scroll container to its prior absolute offset on
// every toggle. With single-open accordions, opening category B collapses the open
// category A, removing height above B; holding the old offset dropped the user toward the
// bottom of the list instead of the top. preserveScroll now takes an `opening` flag,
// passed as !isOpen from all four accordions (Home packs, Home documents, Templates
// Decide, Templates Document). On open it brings the clicked header to the top of the
// scroll viewport, measured after the expanded panel commits via a double rAF. On close
// it preserves position as before. Handles document-level and inner overflow containers.
// ============================================================================
// ============================================================================
// WorkOutput build v126.8
// Home accordions closed on first view. Supersedes v126.7.
// v126.7 closed the Templates view accordions but missed the Home view, which holds its
// own accordion state. A single `open` cell drives both Home accordions (role packs via
// open===id, documents via open==="draft-"+id) and defaulted to "consultant", so the
// Consultant role pack rendered expanded on first load. Default is now null, which closes
// both Home accordions on first view. Verified no handler or effect re-opens a hardcoded
// category on mount or tab switch.
// ============================================================================
// ============================================================================
// WorkOutput build v126.7
// Catalog floor for Negotiate/Communicate + accordions closed by default. Supersedes v126.6.
// Two changes:
// - Negotiate and Communicate each carried a single non-personal decide structure, under
//   the 3-per-category floor held elsewhere in the catalog (the personal-flagged
//   negotiation prep routes to the Personal accordion, not Negotiate). Added two
//   non-personal structures to each: Counteroffer Decision and Discount / Concession
//   Decision (Negotiate); Crisis Communication Plan and Organizational Change Announcement
//   (Communicate). Each is a paired STRUCTURES + TEMPLATES entry (ids 54-57; template ids
//   counteroffer-decision, discount-concession, crisis-comms, org-change-comms), so the
//   description renders in the accordion and Use seeds the composer. No id collision with
//   the Draft catalog.
// - Templates view accordions (decideCatOpen, draftCatOpen) default closed instead of
//   leading with a wedge category, and the draft tab no longer force-opens a category on
//   entry. New users land on a collapsed catalog.
// ============================================================================
// ============================================================================
// WorkOutput build v126.6
// Commit reliably produces a document. Supersedes v126.5.
// Fixes the case where a Commit (decide workflow) returned long-form prose with no
// parseable document block, which held the stage at Explore and showed the document-
// type picker ("What format should the document take?") instead of a finished
// deliverable. Root cause: the decide-path document instruction was conditional
// ("when the user requests a document output"), while the draft path mandated the
// block — so an off-template deliverable (e.g. an onboarding brief routed through the
// default decide workflow) could commit as prose with no machine-parseable artifact.
//
// Two changes:
// - Prompt (DOCUMENT GENERATION SIGNAL): a Commit output is a locked artifact and now
//   MUST end with the JSON block. Explore stays conditional (it is the exploration
//   loop and should not always emit a document). Scopes the mandate to Commit only.
// - Salvage (sendMessage commit handler): proseToDocData now runs on the NATURAL
//   commit as well as the forceDoc retry (was forceDoc-only). A Commit that returns
//   long-form prose with no block is converted into a structured document client-side,
//   so the commit completes with a real artifact and the type picker is not shown. The
//   picker remains only as a last resort when salvage cannot produce any section (empty
//   prose), and never on a short clarifying-question reply.
//
// Not changed here (deferred, own version): detecting document-style requests in the
// composer and routing them to the draft workflow at the source. That touches
// classification and warrants separate testing.
// ============================================================================
// ============================================================================
// WorkOutput build v126.5
// Dead-code removal and first root-state extraction. Supersedes v126.4.
// No routing, schema, or output-behavior change. One intentional UX change: the
// five overlays are now mutually exclusive (only one open at a time).
//
// Removed (dead):
// - ExportConfirmModal, its `exportConfirm` state, and its render block. The state
//   was only ever initialized and reset to null, so the guard could never fire. The
//   modal was unreachable under the v126.4 export-picker path.
// - BeforeAfterCard, AssumptionMapCard, TemplatePathCard. These were live-DOM share
//   cards superseded by the SVG poster pipeline (ShareArtifact -> PosterPreview ->
//   socialPosterSvg(posterContentForShare(...))), which is the only path that can
//   rasterize to PNG for download and native share. before_after and assumption_map
//   are reproduced in posterContentForShare; template_path was retired as a card type
//   (it is absent from SHARE_CARD_TYPES and has no poster branch). CardBrandFooter is
//   retained — still used by HistoryCard and StyleCard.
// - The assumption-map privacy invariant (structure is shown; literal assumption text
//   only when the per-card toggle authorizes it) was relocated from the deleted
//   AssumptionMapCard onto the assumption_map branch of posterContentForShare, so the
//   rule now lives where it is enforced.
//
// Refactor (behavior-preserving unless noted):
// - useEntitlements(): tier and the four client-side metering counters (guest usage,
//   monthly decisions, intelligence credits, daily sessions) plus their load effects
//   and refreshers are lifted out of the root component into one hook. Returned names
//   are unchanged, so every call site (refreshCredits, bumpGuestUsed, setMonthUsed,
//   setTier, refreshDailyUsed, ...) is untouched. This is the seam where server-side
//   enforcement (the TODO(server) markers) will later land. Pure relocation.
// - useModalStack(): the five independent overlay flags (shareOpen, exportPicker,
//   toolsSheet, authGate, firstCommitShareOpen) are consolidated into one activeModal
//   cell. Only one overlay can be open at a time, which removes the prior "two overlays
//   stacked" class. Legacy setX(true|false) bindings are kept as a thin adoption layer
//   (closeIf only closes when that overlay is active), so call sites are unchanged; the
//   per-call-site rename is deferred to the module split. overageBanner is a notice-bar
//   banner meant to coexist and is intentionally left out of the stack.
// ============================================================================
// ============================================================================
// WorkOutput build v126.4
// Export asks for a format, with print-to-chat. Supersedes v126.3.
// Change: the document Export action no longer downloads straight away. It opens an
// export format picker (new ExportFormatModal) that asks how to output the document.
// - "Print to chat" renders the document into the conversation as a message and
//   creates no file. Available to every tier (it is the no-file path, outside the
//   file-type gate). Uses docToChatText() — clean plain text (uppercase headings,
//   bullets), since the chat renders message text as pre-wrapped plain text.
// - File formats (Markdown, HTML, Plain text, PDF) download a copy and are gated by
//   subscription tier: Markdown on Free, HTML/TXT/PDF on Starter and up, no file
//   export for Guest. Locked formats show the required plan ("HTML · Starter") and
//   route to the upgrade path. minTierName() derives the label from the same
//   FEATURE_MIN/TIERS maps has() uses, so the picker cannot drift from entitlements.
// - DocumentView's two buttons (Export HTML / Export Markdown) are replaced by one
//   "Export" button in both the owned and shared-doc layouts. The per-button tier
//   handlers are unified into runExport(fmt).
// - ShareModal export row gains a Print-to-chat chip and its file-type lock labels are
//   corrected from "· Pro" to "· Starter" (HTML/TXT/PDF entitle at Starter, rank 2).
// ExportConfirmModal is retained (unused by the new path) for any future direct caller.
// No routing or schema change.
// ============================================================================
// ============================================================================
// WorkOutput build v126.3
// Decision-commit document loop fixed. Supersedes v126.2.
// Bug: committing a decision could loop. The format picker (shown when a commit
// returned prose with no document block) re-ran the commit with forceDoc. When that
// retry ALSO returned prose, the app set needsDocRetry again and the picker reshowed:
// it asked for a type, printed the prose, then asked for a type again, with no
// deliverable. This is the deferred model/prompt gap noted in v103.4 — a format-named
// commit still returning prose — surfacing as an infinite UI loop.
// Fix (two coordinated changes in the send handler):
// 1. Loop breaker: the format picker never reshows on a forceDoc turn. needsDocRetry
//    is now gated on !_wasForceDoc. A forceDoc retry is exactly what the picker
//    triggers, so reshowing it was the loop.
// 2. Deliverable salvage: new proseToDocData() rebuilds the docData shape from the
//    prose (markdown headings -> sections) when a forceDoc retry has no document block.
//    The normal commit path then runs unchanged — parseDocumentClientSide, activeDoc,
//    Document view, first-commit share, outcome seam, save — so the user gets a real
//    document. Chat shows a short confirmation; the artifact opens in the Document tab.
//    The picker now passes forceDocFormat so the salvaged doc is titled to the choice.
// A forceDoc retry that returns only a short question (content the model still needs,
// not a format) skips the salvage and shows the existing one-time notice. Still no loop.
// Copy/logic only; no routing or schema change. Open item from v103.4 (strengthen the
// commit prompt's document-block directive so forceDoc reliably emits JSON) remains a
// separate model/prompt change; this makes the UI correct regardless of that.
// ============================================================================
// ============================================================================
// WorkOutput build v126.2
// Hero subhead restores the document path. Supersedes v126.1.
// Point release. Copy only, no structural or routing change. Reverses the v126.1
// demotion of Documents in the subhead while keeping the provable-judgment wedge.
// - Rationale: the document path is an acquisition trigger (someone arrives to
//   produce a proposal, memo, or brief today). The seal-and-grade record is the
//   moat. The hero must serve both. v126.1 optimized only the moat and risked
//   under-serving cold visitors who came to draft. Pre-launch this is curation,
//   not data, so hedge toward comprehension.
// - Home hero subhead now names both paths up front and still closes on the wedge:
//   "WorkOutput structures the decision and drafts the document from one workspace.
//   It seals each decision as a prediction with a review date, and when the date
//   arrives, you grade whether it held. What builds is a verifiable record of your
//   judgment."
// - The seal still applies specifically to decisions, so naming Documents does not
//   dilute the differentiation. H1 ("Prove the calls you make.") and kicker
//   ("A track record of judgment, not just opinions") unchanged from v126.
// NOTE: the v125 catalog telemetry seam settles path emphasis on real per-path
// demand after launch. If decision drafts and document drafts diverge in pull,
// re-weight the subhead and PACKS / DOC ordering to the data.
// ============================================================================
// ============================================================================
// WorkOutput build v126.1
// Hero subhead tightening. Supersedes v126.
// Point release on the v126 provable-judgment hero (Segment A wedge). Copy only,
// no structural or routing change.
// - Home hero subhead tightened from four sentences to three. Now: "WorkOutput
//   structures the decision, seals it as a prediction, and sets a review date.
//   When the date arrives, you grade whether it held. What builds is a verifiable
//   record of your judgment."
// - Drops the trailing "Decide and Document share one workspace; the record is
//   what compounds." sentence to hold the five-second read on the seal-and-grade
//   loop. The Decide / Document split stays discoverable via the tab switcher
//   directly below the hero, so no claim is lost from the surface.
// - Kicker ("A track record of judgment, not just opinions") and H1 ("Prove the
//   calls you make.") unchanged from v126.
// NOTE: still pre-launch curation. The v125 catalog telemetry seam re-sorts on
// real per-segment demand after launch. If the segment test names a different
// wedge, re-sequence the hero, PACKS, and default-open pack to it.
// ============================================================================
// ============================================================================
// WorkOutput build v126
// Home page wedge alignment. Supersedes v125.
// Extends the v125 catalog sequencing to the landing surface.
// - Hero copy rewritten to lead with the provable-judgment wedge (Segment A):
//   kicker "A track record of judgment, not just opinions", H1 "Prove the calls
//   you make.", and a subhead built on the seal-and-grade loop and the record.
// - Home decide categories (PACKS) reordered: Consultant Client (A) leads, then
//   Product Manager (B), Founder (C), Operator, Personal. Lead, do not exclude.
// - Default-open home pack changed from "personal" to "consultant", so the first
//   examples a visitor sees are the consultant set.
// - Home document categories already wedge-ordered via DOC_CATEGORIES (v125).
// NOTE: copy and order are still pre-launch curation. The v125 catalog telemetry
// is what re-sorts after real usage. If the segment test names a different wedge,
// re-sequence the hero, PACKS, and default-open pack to it.
// ============================================================================
// ============================================================================
// WorkOutput build v125
// Catalog wedge sequencing. Supersedes v124.
// Leads the template catalog with the consultant / fractional-exec wedge (Segment A)
// and demotes the Product (Segment B) and Founder (Segment C) sets to lower, still
// reachable positions. Four levers changed, plus catalog telemetry.
// - PRODUCT_DEMAND resequenced A then B then C. "Most used" decide row now surfaces
//   A signatures (Go / No-Go, Competitive Response, GTM Motion Choice, Pricing Model
//   Decision, Vendor Selection Matrix) instead of the prior Product-led top five.
// - DOC_DEMAND resequenced A first. featured flags moved off prd / okr-design /
//   job-description / grant-proposal and onto strategy-memo / proposal / qbr /
//   positioning-statement (gtm-strategy retained), so the document "Most used" row is
//   all Segment A.
// - DOC_CATEGORIES reordered: Strategy, Sales, Marketing, Customer Success (A) on top;
//   Product, Operations (B) mid; Fundraising (C) below; Finance, Hiring, Career last.
//   draftCatOpen defaults to "Strategy", decideCatOpen to "Compare Options".
// - DECIDE_CATEGORIES reordered to A-heavy decision types first; Personal demoted last.
// - CATALOG TELEMETRY SEAM added: per-category open and per-template use/draft events,
//   segment-tagged, buffered locally with one swappable backend binding. This is what
//   replaces the cold-start curation with real per-segment demand after launch.
// NOTE: pre-launch these orderings are curation, not usage. The telemetry seam exists
// so real counts re-sort the rows post-launch. If the segment test names a different
// wedge, re-sequence to it.
// ============================================================================
// ============================================================================
// WorkOutput build v124
// Tier-aware main-turn model routing. Supersedes v123.
// - Two routing profiles for the main reasoning turn. Paid (starter, pro, team,
//   enterprise): Sonnet (PRIMARY) on every turn. Free profile (guest, free): Haiku
//   (FAST) for the working loop (Clarify, Explore), Sonnet for the committed artifact
//   (Commit). The kept deliverable stays on the strongest model for every tier.
// - New modelForTurn(tier, inferredMode, workflowType) beside the MODELS config, plus
//   PAID_TIERS / isPaidTier. The single main-turn call site now reads its model from
//   this function instead of a fixed MODELS.PRIMARY. Advanced intelligence tools and
//   overlays are unchanged (Pro-credit gated, so always paid, always Sonnet).
// - SERVER-AUTHORITATIVE SEAM: routing runs client-side today, mirroring the metering
//   seams. When the model call moves behind the Vercel Function, modelForTurn moves
//   with it and the server selects the model from the server-read tier. The client
//   must never name a model.
// - Draft workflow: free/guest Draft routes to Sonnet throughout, because the produce
//   turn is detected from the lagging session mode and the first produced document is
//   the kept artifact. The forgone Haiku saving on draft-clarify is negligible (free
//   Draft is capped at the Brief ceiling). Open item, not a regression: gate a Haiku
//   draft-clarify loop on a reliable produce-turn signal if wanted later.
// - Fail-safe preserved: if FAST does not resolve, modelPreflight sets FAST = PRIMARY,
//   so free turns degrade UP to Sonnet rather than breaking.
// ============================================================================
// ============================================================================
// WorkOutput build v123
// Pricing pass. Supersedes v122.
// - Starter: $20/mo, $17/mo annual. 10 decisions/month, 10 turns each. 0 credits.
// - Pro: $50/mo, $40/mo annual. 30 decisions/month, 15 turns each. 40 credits/month.
//   (was Starter $27/$23, 20/12; Pro $40/$35, 30/16, 60 credits.)
// - All user-facing counts and prices flow from TIER_POLICY, INTELLIGENCE_CREDIT_POLICY,
//   and the pricing objects. Copy is templated, so it inherits these values.
// - Per-day caps unchanged (Starter 3, Pro 5); the monthly cap binds first.
// ============================================================================
// ============================================================================
// WorkOutput build v122
// Moat pass (deepen the sealed bet). Supersedes v121.
// - Prediction sealed at commit: { trigger, resolveBy } on the decision state. The
//   commit classifier now suggests an observable "trigger" that settles the call;
//   it fills an empty trigger only, never overwrites a user edit, and never moves the
//   resolve date. The bet rides into the index meta so the review queue can show it.
// - The reckoning: the outcome-grading card now shows "What you said would settle it"
//   so the user grades against the observable they committed to. The Called It poster
//   (sealed + revealed) carries the bet line.
// - Calibration credential: deriveCredential() -> { gradedN, heldRate, window,
//   firstSealed, attestation }, gated at the 3-outcome floor. New "credential" poster
//   card, a profile credential block, and a credential-floor upgrade prompt at the 3rd
//   reviewed outcome. Client attestation is a fingerprint; SERVER-SIDE ATTESTATION SEAM.
// - Open-loops debt: ungraded calls past their review date are surfaced on the profile
//   and limit profile authority (Decision Style desaturated) until closed.
// - Public calibration profile at ?u=<handle> (route-guarded, read-only). PUBLIC
//   PROFILE DATA SEAM + REFERRAL ATTRIBUTION SEAM (&via= on every share URL).
// ============================================================================
// ============================================================================
// WorkOutput build v121
// Virality additions: the "Called It" card and a hero stat on Decision Style.
// - New shareable card "Called It": at commit it shows a sealed outcome (open loop,
//   "revealed in N days, was I right?"); after review it shows the recorded verdict as
//   a HELD / PARTIAL / BROKE stamp with an honest caption. New socialPosterSvg blocks:
//   verdict (sealed seal + revealed stamp) and herostat (a large headline number).
// - Decision Style now leads with a hero stat (share of confident calls that held) and
//   a factual "1 of 11 decision styles" rarity line; the held-dots block is folded into
//   the hero stat. Claims that need a population baseline (a percentile badge, the
//   "uncommon" tag) are gated behind VIRAL_PERCENTILE_ENABLED, which is off, so nothing
//   asserts a ranking we cannot defend yet. Supersedes v120.
// ============================================================================
// ============================================================================
// WorkOutput build v120
// Assumption Map redesigned, and Open Sans now loads for exports.
// - The Assumption Map card leads with the decision itself, then the assumption it
//   rests on, a confidence gauge, and a labelled "reliability by assumption category"
//   bar chart with the current decision's category highlighted and a plain-language
//   caption. The misleading beam-on-pillars metaphor is gone. New socialPosterSvg
//   block kind: reliability. posterContentForShare drives it from the decision title
//   and the per-category reliability; the modal threads both through.
// - Open Sans: loaded as a document stylesheet for the UI, and embedded into each
//   export SVG at runtime (fetched once, base64-inlined) because rasterized SVG cannot
//   see linked fonts. The share button waits for the embed before rasterizing, and the
//   preview re-renders once it is ready. All best-effort; offline falls back to the
//   system sans named alongside 'Open Sans'. Supersedes v119.
// ============================================================================
// ============================================================================
// WorkOutput build v119
// Export branding: the wordmark now renders as "WorkOutput" (true casing) in Open
// Sans rather than uppercased monospace, the footer line links to workoutput.com,
// and the destination URL is shown on the right of every share poster so it is
// reachable even from a flat PNG. The W/O glyph is retired in favor of the wordmark.
// The markdown decision-card export links WorkOutput to workoutput.com, and the
// native-share captions for decision cards carry the URL. Supersedes v118.
// ============================================================================
// ============================================================================
// WorkOutput build v118
// The two per-decision share cards are now visual, and Decision Path is removed.
// - socialPosterSvg gains two block kinds: a split diptych (Before/After, with a
//   raw-question side, a committed side carrying confidence/evidence/next step, and
//   a clarity meter on each) and a pillars block (Assumption Map: a decision beam on
//   assumption-category pillars sized by historical reliability, the current category
//   highlighted, the weakest flagged as the weak link, plus a confidence gauge).
// - posterContentForShare: before_after builds the split from real per-decision data;
//   assumption_map builds the pillars via new deriveAssumptionPillars(profile, category).
//   The template_path (Decision Path) branch is removed.
// - FirstCommitShareModal now receives the profile and threads evidence, options count,
//   and the assumption pillars into the cards.
// - Preview unification: the modal switcher and the shared-link landing now render the
//   actual poster inline via PosterPreview, so the preview always equals the shared
//   image. Decision Path is removed from the card switcher. Supersedes v117.
// ============================================================================
// ============================================================================
// WorkOutput build v117
// More real metrics on the share cards, and two new chart types.
// - socialPosterSvg gains a sparkline block (area + line, for time series) and a stacked
//   split block (clip-rounded segmented bar with legend, for compositions). Existing
//   radar / rings / bars / dots are unchanged.
// - deriveShareViz now also derives: readiness over time (ledger.readinessSeries),
//   outcome mix (held / partial / broke), confidence at commit (high / moderate / limited),
//   and reversibility stance (reversible / irreversible). All real, all degrade to null.
// - Decision Metrics card adds an outcome-mix split and a reversibility split beneath the
//   radar and rings. Decision History card adds a readiness-over-time sparkline. Decision
//   Style card adds a confidence-at-commit split. Supersedes v116.
// ============================================================================
// ============================================================================
// WorkOutput build v116
// Data-visual share cards. The profile share posters now render real charts off the
// profile and ledger, not text lines.
// - socialPosterSvg rewritten with an SVG chart engine (radar, progress rings, labelled
//   bars, dot grids). It accepts an optional `viz` array of chart blocks and stacks them
//   under the title; text `lines` still render (so the blank Decision History card and any
//   other text poster are unchanged).
// - deriveShareViz(profile, metrics) turns the real signals into chart specs:
//   cognitive orientation (assumptionMix), calls-that-held / calibration (outcomes),
//   assumption rigor, evidence and reversibility reads, follow-through and review rate.
//   Every field degrades to neutral so a sparse profile still renders.
// - Decision Style poster: the line plus a cognitive-orientation bar chart and a
//   calls-that-held dot row. Decision History poster: a streak dot grid and committed /
//   reviewed / readiness bars. New Decision Metrics poster: a six-axis radar of the
//   decision shape (Calibration, Rigor, Evidence, Follow-through, Optionality, Review
//   rate) plus readiness / decisions / held rings. A "Share metrics" control sits under
//   the ledger tiles, available once the archetype has formed.
// - posterContentForShare adds the decision_metrics branch and the viz specs; all cards
//   reuse the one ShareImageButton pipeline. Supersedes v115.
// ============================================================================
// ============================================================================
// WorkOutput build v115
// Share consistency, scalability, iOS, and a virality-driven placement pass.
// - Consistency: the first-commit modal's illustrative ledger "Decision Style" card is
//   replaced by the real v114 archetype StyleCard, gated on the archetype being available
//   (3+ decisions). "Decision Style" now means the same thing everywhere. The old
//   ledger-based DecisionStyleCard component was removed.
// - Scalability: one reusable ShareImageButton (built on the flexible Btn) is the single
//   share mechanism across the Decision Card, the Profile style card, and the modal. New
//   shareable cards reuse it with three props (makeBlob, cacheKey, metricType).
// - iOS: ShareImageButton pre-generates the PNG when its inputs change (cacheKey) and
//   calls navigator.share synchronously on tap (shareBlobNow), satisfying the iOS gesture
//   requirement; falls back to download otherwise. The former App-level async image
//   handlers (shareStyle / shareCardImage / shareDecisionCardImage) were removed.
// - Placement (virality): a clear, primary Share sits in the TOP-RIGHT of the result
//   surfaces — the Document view header and the Decision Card view header — where users
//   expect a share affordance and see it without scrolling. It shares the decision-card
//   PNG via the native sheet. Secondary actions (download, copy, link) stay demoted to
//   ghost controls. The Profile shares the Decision Style from a top-right button in its
//   header (shown once the archetype exists at 3+ decisions), replacing the easy-to-miss
//   in-tile button. The first-commit modal keeps a primary full-width Share in its own
//   container. One control (ShareImageButton), one weight (primary), consistent placement.
// - Collapsible intro: the Profile header description collapses/expands like the Home
//   intro (session-cached, persisted to wo:profile:introCollapsed), with a top-right X to
//   collapse and a "+" affordance to reopen.
// - Decision History card: a new shareable card type, shareable from day zero including
//   the blank (0-decision) state. Same pipeline as every other card — posterContentForShare
//   adds a "decision_history" branch, a HistoryCard renders the recipient landing, and the
//   Profile's top-right Share emits it (always available). The Decision Style share returns
//   to its own tile as a secondary ghost. Adding the type touched one poster branch, one
//   landing card, and one share call — the scalable path for any future card.
// - Share reliability: the share action now degrades gracefully and always gives visible
//   feedback. Native file share (mobile) -> download (desktop) -> copy the link/caption,
//   with the button briefly confirming "Shared" / "Image saved" / "Copied". Image
//   generation (cardToPngBlob, svgToPngBlob) is timeout-guarded so a blocked or slow
//   render can never leave the button silent. Fixes the case where sandboxed frames
//   blocked both native share and downloads and the click appeared to do nothing.
// Combines the prior consistency/iOS pass with the placement pass. Supersedes v114.2.
// ============================================================================
// ============================================================================
// WorkOutput build v114.2
// Shareable cards as PNG via the native share sheet. All shareable cards can now be
// shared as an image (Instagram/Stories/Messages on mobile), with a download fallback
// where file-share is unsupported. New: socialPosterSvg (one portrait 1080x1350 poster
// rendering any card from kicker/title/lines/footnote), svgToPngBlob (generic
// rasterizer), shareOrDownloadPng (navigator.share with the PNG file, else download),
// and posterContentForShare (maps each card type to poster content). Wired into three
// surfaces: the Decision Card view gains a Share button (shares its existing landscape
// PNG); the Profile Decision Style card's share now produces a PNG poster and carries
// the recipient-seed link in the share text, preserving the K-factor loop; and the
// first-commit share modal gains "Share as image" (Before/After, Assumption Map,
// Template Path, Decision Style) alongside "Copy link". Carries no private content
// beyond what the card already shows. Known limit: on iOS the async PNG generation can
// break the share gesture and fall back to download; pre-generating the blob is the
// follow-up if native-sheet-on-iOS must be guaranteed. Supersedes v114.1.
// ============================================================================
// ============================================================================
// WorkOutput build v114
// Decision Style replaces Clarity Rank. Major change to the Profile and the share loop.
// v114.1: archetype-first. The Decision Style NAME is now the kind of thinker (cognitive
// orientation: Systemist / Reader / Operator / Navigator), the most stable identity
// signal. Posture (reversibility, evidence, rigor) and outcomes moved into the derivation
// line, where they sharpen over time. Posture/outcome names (Calibrator, Closer,
// Pathfinder, Empiricist, Examiner, Deliberator, Generalist) are fallbacks, used only
// when reasoning focus has not yet emerged.
// The count-based Clarity Rank (Observer..Strategist, earned at commit thresholds) is
// removed. In its place, a named Decision Style archetype derived from the user's own
// decision structure via deriveDecisionStyle(): the name is chosen by the most
// distinctive earned signal (outcome calibration, reversibility stance, evidence
// posture, rigor, or dominant reasoning category), and the derivation line is assembled
// from the real profile reads, so it is always true and sharpens as decisions
// accumulate. Below a 3-decision floor it shows a calibrating state — no faked identity.
// The card is shareable: this reverses the prior decision_style privacy fallback. The
// shared payload carries only the archetype name, derivation line, and decision count —
// all aggregate, never any decision content — preserving the "how you decide, never what
// you decided" invariant. New: deriveDecisionStyle, StyleCard, the Profile Decision
// Style tile with a Share action, the shareStyle handler, and a real CardLandingView
// render for shared style links (legacy styleless links keep a fallback). Pricing fix:
// the false Starter bullet "Share full decisions with others" (a Build-6-deprecated
// capability) is now "Share your decision card". Removed the orphaned RANKS constant.
// The decision/document template gallery and internal share params are unchanged.
// Supersedes v113.4.
// ============================================================================
// ============================================================================
// WorkOutput build v113.4
// Copy only. No logic change. Renamed the user-facing share artifact from "template"
// to "playbook" across the full consumer loop, both sides: the sharer surfaces (the
// two Share buttons in TemplatesView and the mobile tools sheet, the ShareModal header
// and body copy, and the shareFramework "Playbook link copied" notice) and the recipient
// landing surfaces (the shared-decision banner and its "Use this playbook" button, the
// landing Kicker, the h1 fallback, and the shared-doc landing notice). The internal
// ?framework= URL param and the share/fw metric tags are intentionally unchanged, so the
// K-factor data and the landing readers do not fork. The decision/document template
// GALLERY keeps the word "template" (it is a different concept). Three operator/team
// surfaces still say "template" and are left for a separate decision: the Site-metrics
// "Templates shared" label and "By loop" tooltip, and the gated Team feature line. The
// AuthGate bullets (v113.3) already avoid the word. Supersedes v113.3.
// ============================================================================
// ============================================================================
// WorkOutput build v113.3
// Copy only. No logic change. The AuthGate "Share templates without exposing your
// private content" bullet was stale against the share paths: shareFramework carries
// only the template id + decision type (the structure), and shareCard adds structural
// metadata only — neither shares the produced output (deprecated Build 6) or any ledger
// stats. Replaced the single bullet with two that describe the actual loop: sharing how
// a decision was worked (never what was decided), and the recipient starting their own
// private decision from the same starting point. The functional "Share template" button
// and ShareModal labels (TemplatesView, tools sheet, ShareModal header) and the
// "Template link copied" notice are unchanged, pending a separate naming decision.
// Supersedes v113.2.
// ============================================================================
// ============================================================================
// WorkOutput build v113.2
// Cleanup pass on the v113 audit. No behavior change. Two parts.
// 1. Render-churn fix: the App passed a fresh [] literal to useWorkspace every render,
//    which re-keyed its useMemo([memberships]) and [list] effect each render — one
//    redundant store.get(WORKSPACE_KEY) and a new switchWorkspace identity per render.
//    Hoisted to a module const (NO_TEAM_MEMBERSHIPS) for a stable reference. State still
//    settles on the PERSONAL_WORKSPACE ref, so this was never a loop, only waste.
// 2. Dead-code removal: five orphaned declarations with zero live references deleted —
//    SessionModeBar (replaced by inline mode pills v97.0), estimateTokens (removed from
//    the render path v99.6), anyTemplateIdForLabel, EVIDENCE_LEVELS, and
//    scopeEligibleForAggregate (the live ledger path uses metaAggregateEligible).
// Deferred, not addressed here: resolveEffectiveTier (no consumer) and WorkspaceSwitcher
// (not placed) stay for the month-6 Team launch, when server memberships exist to test.
// Retained launch seams untouched: httpSink / setSink / bootSiteAnalytics, plus
// storeSharedDoc and NAV_MAIN (annotated as kept for legacy reads). Supersedes v113.1.
// ============================================================================
// ============================================================================
// WorkOutput build v113.1
// Two undefined-reference fixes from the v113 audit. No behavior change beyond
// the two repaired paths; all v113 seams and the metering invariant are untouched.
// 1. documentDepthForId: defined (was called by maxTokensForMode but never written).
//    Restores templated Draft turns, which previously threw a ReferenceError before
//    the API call and surfaced the raw error to the user. Free-form Draft was
//    unaffected and stays on the "full" default.
// 2. readSiteAnalytics: defined as a wrapper over ACTIVE_SITE_SOURCE.read() (the
//    seam refactor exposed the source object but never created the reader the Site
//    effect calls). The call previously threw and was swallowed by the effect catch,
//    masked by the local stub's null. Restores the one-binding production swap path.
// Known launch-completeness gaps left for the month-6 Team work, not regressions:
//    resolveEffectiveTier has no consumer, and WorkspaceSwitcher is not yet placed.
// Supersedes v113.
// ============================================================================
// ============================================================================
// WorkOutput build v113
// Workspace + metering seams integrated (build-now, launch-later). Personal
// behavior is unchanged from v112: TEAM_ENABLED stays false, the active workspace
// is Personal, the orgId stamp is null, event emission is a no-op, ledger reads
// stay local, and the metering scope resolves to "" so all counter keys are
// byte-identical to v112. Adds, all gated/inert today: workspace context
// (useWorkspace) with a write-through metering scope; an orgId stamp carried into
// decisionState and the index meta at commit; a decision-event emission seam at
// commit and outcome; a workspace-scoped ledger reader (groupMetrics now resolves
// through useWorkspaceLedger, sync useMemo replaced by async state so the launch
// RPC swap needs no consumer change); per-(user,org) metering via meteringScope()
// on the three counter keys; and the EMIT_DECISION_EVENT / READ_ORG_LEDGER /
// RESOLVE_TIER binding seams. Launch is binding swaps plus the flag, no refactor.
// Prior to module split and hosting. Supersedes v112.
//
// WorkOutput build v112
// Attachment size caps on the upload path. Per file (unchanged: native 18MB, text
// 25MB) plus a new per-session NATIVE byte budget (24MB raw, ~32MB encoded, the
// request-body ceiling), enforced in both the Home and Composer uploaders. On a
// block the user sees the file size, the remaining budget, and the limit, with how
// to adjust. Text-extracted files are excluded from the byte budget; only their
// extracted text travels. Supersedes v111.
//
// WorkOutput build v111
// Operator site analytics: admin tier rollups over the Supabase RPC seam, plus
// an audit pass on the v110.5 integration. Fix: raw token usage is now admin-only
// on the client (role === "admin" gate), matching the corrected RPC that gates
// tokenUsageByTier behind is_admin(). Users and subscriptions stay visible to all
// operators (admin/marketing/viewer). Supersedes v110.5.
//
// WorkOutput build v110.4
// Decide clarify: allow a few questions when warranted. Supersedes v110.3.
//
// SYSTEM_PROMPT_CHAT Clarify and VAGUE PROMPTS directives loosened from "1-2" to "a
// few when warranted; one or two is usually enough, more only when genuinely needed",
// with an explicit "do not over-ask" guard. Aligns engine behavior with the Home
// Decide caption. The COMMIT OVERRIDE (one question max on "just do it") is unchanged,
// and the Draft prompt is unaffected.
// ============================================================================
// ============================================================================
// WorkOutput build v110.3
// Home Decide caption wording. Supersedes v110.2.
//
// Decide caption now reads "WorkOutput asks a few clarifying questions, then structures
// the rest." (was "a clarifying question or two"). Copy only.
// ============================================================================
// ============================================================================
// WorkOutput build v110.2
// Document category lucide icons + Home caption copy. Supersedes v110.1.
//
// 1. Document categories now render lucide icons instead of unicode glyphs, removing
//    the emoji-fallback risk (♡/☺ could render as color emoji on some systems): User,
//    Layers, Compass, DollarSign, Megaphone, Users, Target, RotateCcw, BarChart3,
//    Sliders. A new CatGlyph component is the single render path for all category
//    accordion headers: it shows a category's `icon` if present, else its `mark`.
//    Decide types and the Home decide packs keep their glyph marks (no emoji risk).
// 2. Home composer captions name the subject so they read as sentences:
//    "WorkOutput asks a clarifying question or two, then structures the rest." and
//    "WorkOutput clarifies what's needed, then produces the complete document."
// ============================================================================
// ============================================================================
// WorkOutput build v110.1
// Category accordion: no scroll jump on open + topical icons. Supersedes v110.
//
// 1. Opening a category no longer scrolls the page. A preserveScroll() helper captures
//    the scroll container position and restores it after the expansion commits, so the
//    view stays put. Applied to all four category accordions (Templates Decide and
//    Document, Home decide and document). Toggle buttons also get type="button".
// 2. DOC_CATEGORIES glyphs are now topical, not abstract: ♡ Personal, ⬡ Product,
//    ♟ Strategy, $ Fundraising, ↗ Marketing, ☺ Hiring, ◎ Sales, ⟳ Customer Success,
//    % Finance, ⚙ Operations. One change updates both the Document tab and the Home
//    list (shared source). Same accent-tinted glyph style as the Home decide packs.
// ============================================================================
// ============================================================================
// WorkOutput build v110
// Document category consolidation + audit pass. Supersedes v109.
//
// Consolidation:
// - DOC_CATEGORIES is now the single source of truth for document category order,
//   label, glyph, and blurb. The Document tab accordion and the Home "start from a
//   document type" list both consume it; membership comes from each template's
//   `category` field via docItemsForCategory(). The two surfaces can no longer drift.
//   Personal & Career leads both. Verified: all 10 template categories map 1:1, no
//   orphaned or empty categories.
//
// Audit fixes (no behavior change):
// - Removed dead `author` and `you` fields from all 53 STRUCTURES; neither was read
//   after the v105 trending/card cleanup. (Fabricated `uses` was already removed.)
// - Document tab now uses the shared docItemsForCategory() filter, matching Home.
// - Verified: no unused lucide imports, no console/debug statements, all curated-cut
//   and PromoRow helpers referenced. The ~23 SERVER-SIDE markers are intentional
//   pre-launch seams, not debt.
//
// Audit notes (not changed here, flagged for the planned module split):
// - DECIDE_CATEGORIES (by type) lives inline in TemplatesView; single-use, fine as is.
// - PACKS (Home decide starter) is a separate decide-side construct, left untouched.
// - The curated cuts recompute each TemplatesView render; cheap at this catalog size,
//   useMemo only if the view grows.
// ============================================================================
// ============================================================================
// WorkOutput build v109
// Home "start from a document type": Personal & Career first. Supersedes v108.
//
// The Home view's "Or start from a document type" accordion had its own category list
// (separate from TemplatesView) that omitted Personal & Career entirely. Added it as
// the first category, matching Personal & Career leading the Document tab. List/order
// change only; existing categories and their items are unchanged.
// ============================================================================
// ============================================================================
// WorkOutput build v108
// Decide tab: Personal category at the top. Supersedes v107.
//
// Adds a "Personal" category to the Decide "By decision type" accordion, placed first
// and default-open, mirroring Personal & Career leading the Document tab. It collects
// the personal-life and own-career decisions (career moves, offers, relationships,
// health, family, relocation, major purchases) via a new personal:true flag on those
// STRUCTURES. Those decisions are excluded from their decision-type groups so each
// appears once. Broadly applicable, so it leads the browse order; the curated rows are
// unchanged and still lead with the Product wedge.
// ============================================================================
// ============================================================================
// WorkOutput build v107
// Document tab: "By document type" section title. Supersedes v106.
//
// The Document category accordion previously started directly under the "Most used"
// row with no separation. It now sits under a "By document type" heading (shown as
// "All document templates" during search), matching the Decide tab's "By decision
// type" heading. Title only; the category order and contents are unchanged.
// ============================================================================
// ============================================================================
// WorkOutput build v106
// Document category sort: Personal & Career first. Supersedes v105.
//
// The "Personal & Career" document category (resumes, cover letters, promotion cases,
// negotiation and interview prep) moves to the top of the Document category accordion
// and is the default-open category. Rationale: it applies to the widest set of people
// regardless of role, so it leads the browse order. This reorders the category list
// only. The "Most used" and "Trending this week" curated rows are unchanged and still
// lead with the Product wedge, so acquisition prioritization is unaffected; this is a
// browse-order change, not a wedge change.
// ============================================================================
// ============================================================================
// WorkOutput build v105
// Wedge prioritization (Product-led acquisition). Supersedes v104.
//
// Prioritizes five high-intent document templates as the self-serve acquisition
// wedge, ordered for a Product-leaning audience. PRD leads. Changes:
// - featured:true added to five DOCUMENT_TEMPLATES: prd, gtm-strategy, okr-design,
//   job-description, and a new grant-proposal. One flag, two consumers: it surfaces
//   the wedge in-app (the new "Most used" strip) and marks the set for the
//   same-domain template landing pages the SEO engine will generate.
// - Fundraising catalog gap closed: the category was investor-only. Added
//   grant-proposal (featured), structured to the government-grant criteria reviewers
//   score against and covering foundation grants as a lighter case, plus
//   case-for-support for major-gift and campaign asks. Serves university and
//   nonprofit development intent the investor templates did not.
//   Fundraising category label/blurb broadened to "Fundraising & Development".
// - Both Templates tabs now share one structure: "Trending this week" (a deterministic
//   weekly rotation, not a usage metric), "Most used" (the curated Product-audience
//   wedge), then category bubble lists. Decide groups by decision type; Document by
//   category. Fabricated per-template "uses" counts were removed; a telemetry seam is
//   documented for swapping in real counts and trend deltas post-launch. Featured
//   templates remain in their categories below; the rows are promotion, not relocation.
// No model, pricing, limit, governance, or storage logic touched. Decide catalog
// unchanged: the wedge is all Draft, because only Draft outputs circulate and feed
// the document-exposure loop.
// ============================================================================
// ============================================================================
// WorkOutput build v104
// Accessibility release (client-only). Supersedes v103.8.
//
// Implements the full backend-independent accessibility set (P0-P2). No server,
// auth, billing, or storage changes. Behavior and visuals are unchanged for
// existing users except where noted. No dependencies added.
//
// P0 (core loop usable by keyboard / screen reader):
// - prefers-reduced-motion: a media block neutralizes every entrance, slide, fade,
//   pulse, glow, hover transition, and the streaming caret when the OS requests
//   reduced motion. .wo-in is forced visible so reduced-motion users never see
//   invisible content.
// - Live region: a visually-hidden polite/assertive region (A11yLiveRegion) is
//   mounted at the App root and fed by one announcer effect. Errors announce
//   assertively; notices, a "Generating response" status, and the COMPLETED
//   assistant message announce politely. The in-progress streaming bubble is
//   aria-hidden so partial tokens are not read character by character.
// - Dialog semantics: the shared Overlay primitive (used by the mobile tools sheet)
//   now sets role="dialog" + aria-modal, moves focus in on open, traps Tab, closes
//   on Escape, and restores focus to the trigger on close, via a reusable
//   useDialogA11y(onClose) hook.
//
// P1 (keyboard + contrast):
// - The one genuinely interactive non-button element (the related-decisions row in
//   SessionView) is now focusable and operable by Enter/Space with an accessible
//   name, only when it is actually interactive. The other six div onClicks are modal
//   backdrops (Escape-closable now) or stopPropagation guards and are correctly left
//   non-focusable.
// - Paper-theme --meta darkened #67705F -> #5A6353. Measured contrast on the darkest
//   meta surface (--bg) rises from 4.16:1 (fails AA) to 5.05:1 (passes for small
//   text). Ink-theme --meta already passed (5.0:1) and is unchanged. One token fixes
//   every --meta usage at once.
//
// P2 (labels, heading, chart):
// - aria-label added to every composer textarea (home/reply/outcome) and search input
//   (decisions/templates), so each has a name that survives the placeholder.
// - The Session (chat) view gains one visually-hidden <h1> for heading navigation;
//   every other view already had a real <h1>.
// - The readiness AreaChart is wrapped in a <figure> with a spoken from/to/trend
//   <figcaption>, a visually-hidden data table of the actual series, and aria-hidden
//   on the recharts SVG.
//
// New module members: SR_ONLY (early const), A11yLiveRegion, useDialogA11y. No model,
// pricing, limit, or storage logic touched.
//
// Deferred (documented, client-only, not in this cut): apply useDialogA11y to the
// four standalone content modals (Share, FirstCommitShare, ExportConfirm, AuthGate)
// and the drawer (each a two-line edit; the drawer needs a small wrap-in-component
// refactor first); the broad decorative-icon aria-hidden / icon-button label sweep
// (low score impact); the second (locked teaser) chart wrapper.
// ============================================================================
// ============================================================================
// ============================================================================
// WorkOutput build v103.8
// Typography to readable sans, button de-emphasis, card discoverability.
// Supersedes v103.7.
//
// 1. Fonts: the product ran on serif families (Fraunces display, Newsreader body),
//    which read poorly on screen. --display and --serif now resolve to Open Sans, a
//    readable sans-serif; the wordmark (which uses --display) is therefore Open Sans
//    too. --mono (Spline Sans Mono) is kept for labels. The --serif token name is
//    retained to avoid touching every reference; it now holds a sans value. The
//    exported document (buildHTMLDoc) still uses Spectral, appropriate for a printed
//    document; change separately if a sans export is wanted.
// 2. "Lay out the options" was a primary (accent) button and showed from the first
//    clarify turn. It is now a ghost button and is hidden until there has been some
//    exchange (turns >= 3), so it stops being a loud, premature CTA.
// 3. The Decision card was only reachable from the commit-stage side panel / tools
//    sheet, so it was easy to lose after the first-commit modal closed. The committed
//    Document view now has a "Decision card" button, so the card is reachable whenever
//    a committed document is open (including reopened past decisions from the library).
//    The Outcomes review queue remains its own nav item.
// ============================================================================
// ============================================================================
// WorkOutput build v103.7
// Format picker for document recovery + on-screen branding. Supersedes v103.6.
//
// The single "turn this into a document" button looped: it re-ran the same commit,
// the model returned prose again (no { document:true } block for extractDocumentBlock
// to find), and the button reappeared. Root cause of the hedge is usually that the
// model does not know which output format is wanted (it literally asks). Fix: replace
// the button with a format picker (decision memo / options comparison / pros and cons /
// recommendation brief). Choosing one sends a clean, format-named commit with forceDoc,
// which both gives the model the missing input and forces the artifact prompt, so the
// structured document is produced. The picker now shows for any no-document commit
// EXCEPT a short reply containing a question (the model needs specific content like a
// city, which a format cannot answer — the user replies in the composer instead).
//
// Branding: HTML and PDF exports (buildHTMLDoc) and Markdown (buildMarkdown) already
// carry a WorkOutput wordmark header and a "Produced with WorkOutput" footer with a
// link back. Added a matching, restrained footer to the on-screen document view so the
// product mark is consistent in-app — promotes WorkOutput without a heavy watermark.
//
// Still open (model/prompt, deferred): if a format-named commit still returns prose,
// the commit prompt's document-block directive needs strengthening. Separate change.
// ============================================================================
// ============================================================================
// WorkOutput build v103.6
// Commit-flow coherence. Supersedes v103.5.
//
// Two flow fixes from a real report:
// 1. "Move to Commit" was a primary (accent) button, the brightest CTA in the
//    Explore panel, so it read as the obvious next click. But a commit turn often
//    returns a clarifying question rather than a document, so the prominent button
//    over-promised. It is now a ghost (secondary) button.
// 2. The v103.5 "turn this into a document" affordance misfired on those clarifying
//    questions: the model asking "which city?" is NOT a document rendered as prose,
//    and offering a convert-to-document button there created a confusing loop. The
//    retry now appears only for a substantial, non-question prose body that actually
//    looks like a deliverable that failed to parse — short or question-shaped replies
//    (the model asking for required input) no longer trigger it. The stage still
//    drops to Explore so the turn stays answerable in the composer.
//
// Underlying behavior still open (model/prompt, not UI): the commit turn sometimes
// asks what output format the user wants instead of producing the best-fit document.
// Tightening the commit prompt to commit decisively, asking at most one essential
// question, is a separate system-prompt change and is intentionally not in this cut.
// ============================================================================
// ============================================================================
// WorkOutput build v103.5
// In-chat "turn this into a document" recovery. Supersedes v103.4.
//
// When a commit response is written as prose instead of the structured document
// block extractDocumentBlock looks for, docData is null: the text prints in the
// chat, the app never routes to the Document view, and none of the document
// controls (export, share, decision card, expand) are reachable. v103.4 held the
// stage at Explore and showed a notice, but there was no button to act on it, which
// on mobile (stage actions live behind the tools sheet) read as "no buttons." This
// adds an explicit affordance: when a commit yields no document, the chat shows a
// "Turn this into a document" button that re-runs the commit with forceDoc, forcing
// the commit/artifact prompt regardless of turn count so the structured block is
// produced. Clears on the next send. Note: the root cause is the model emitting
// prose over the document block; if commits do this often, the commit prompt's
// document-format directive should be tightened — a separate, larger change.
// ============================================================================
// ============================================================================
// WorkOutput build v103.4
// Commit-without-document dead end. Supersedes v103.3.
//
// stage is derived from currentMode === "Commit", but activeDoc is set only when the
// response carries parseable document JSON. A commit turn whose output had no doc
// (truncated at max_tokens, or malformed/missing document block) still flipped to
// Commit, so the "Decision committed" panel showed over an empty workspace and the
// Decision card opened on "No decision card yet" with no way back. Two fixes:
// 1. Source: when a Commit resolves with no docData and no existing doc, hold the
//    stage at Explore (effectiveMode) and show a clear, retryable notice instead of
//    presenting an empty decision as committed.
// 2. UI safety net: EmptyState now accepts an action, and the Decision card empty
//    state carries a "Back to your decision" button, so that view is never a dead end.
// ============================================================================
// ============================================================================
// WorkOutput build v103.3
// Fix double-render of the final response. Supersedes v103.2.
//
// After a stream finished, sendMessage pushed the final parsed assistant message,
// then ran awaited writes (saveSessionV47, then profile load/save) before the
// finally block cleared the streaming bubble. During those awaits React committed a
// render in which the final message AND the still-live streaming bubble both showed.
// On the rate-limited artifact store those awaits are slow enough to see clearly,
// which read as the response generating twice before settling. The streaming bubble
// is now torn down the instant the final message is pushed, before the save chain;
// finally still clears as a safety net for error and session-switch paths.
// ============================================================================
// ============================================================================
// WorkOutput build v103.2
// Remove "Shared a Template" milestone. Supersedes v103.1.
//
// Template sharing is being retired as a feature, so its profile milestone badge
// (id:"share", earned on c.shares >= 1) is removed from BADGES. The grid is
// map-rendered, so five badges lay out without change. The Share2 icon import is
// retained (still used by other surfaces). NOTE: this removes only the milestone.
// The rest of the template-share surface is still wired (Share template button,
// ShareModalV72 structure path, shareFramework, the ?framework= reader and its
// K-factor metrics). If the feature is fully retired, those go in a later cut.
// ============================================================================
// ============================================================================
// WorkOutput build v103.1
// Share-link clipboard truthfulness. Supersedes v103.
//
// The "Share template" structure link showed "Link copied" unconditionally, even
// when navigator.clipboard.writeText rejected (sandboxed iframe, insecure context,
// or denied permission). shareFramework now returns its real success/failure, the
// modal gates the "Link copied" state on that result, and the failure path surfaces
// the URL for manual copy instead of asserting a copy that did not happen. The
// card-share and card-text clipboard paths were already correct and are unchanged.
// On a normal https deployment the clipboard succeeds and behavior is unchanged.
// ============================================================================
// ============================================================================
// WorkOutput build v103
// Deployment-prep checkpoint. Supersedes v102.3. Final single-file build before
// the source is split into modules for the GitHub repo.
//
// Full audit pass over v102.3 (syntax, scope/TDZ, undefined refs, duplicate
// declarations, Rules of Hooks, secret scan, dead imports, constant single-
// sourcing, template-data integrity, storage-layer runtime safety). No code
// defects found; no logic changed. The self-documented fixes (v100.1 A2-recovery,
// v101.1 charge race, v102 cost-control, v102.1 init-order, v102.2 OVERAGE_PACK,
// v102.3 heal-on-miss) were each verified present and intact.
//
// ONE change, deployment-only:
// - API_ENDPOINT is now resolved from the environment with the keyless artifact
//   endpoint as fallback. In the artifact preview (no env set) behavior is
//   identical to v102.3. On Vercel/GitHub, set the proxy path via env so the same
//   source runs both places with no edit. The proxy injects x-api-key; the client
//   still sends only content-type. See /api/messages and DEPLOYMENT.md in the repo.
//
// Carried forward unchanged and still REQUIRED before any paid/public launch:
// all caps are client-side and spoofable; the TODO(server) seams (auth, server
// counters, IP/device throttling, payment-required overage) must point at a server.
// ============================================================================
// ============================================================================
// WorkOutput build v102.3
// Outcome resilience (heal-on-miss). Supersedes v102.2.
//
// Recording an outcome on a Review-queue item whose session blob is gone AND whose row is
// missing from the persisted index used to dead-end with "could not be found in your
// library" (a storage/state divergence, common in the artifact preview across reloads/
// versions). recordOutcome now receives the queue's own meta row, and patchIndexMeta takes
// an optional seedRow: on a miss it rebuilds the index row from that meta and writes the
// outcome, so the orphaned item repairs itself in place. The blob still cannot be restored,
// so the outcome stays meta-only (recoveredViaMeta) and the degraded-transcript caveat
// still fires. The re-entry guard is unchanged, so a healed item cannot double-count.
// ============================================================================
// ============================================================================
// WorkOutput build v102.2
// Pricing correction. Supersedes v102.1.
//
// Extra-sessions add-on corrected to 5 sessions for $10 (was $5), now sourced from a single
// OVERAGE_PACK constant used by both the pricing page add-on card and the in-session overage
// banner so they cannot drift. Pro credit cap (60) made explicit in the Pro card credit
// note. Add-on intro reworded to avoid implying instant self-serve purchase while billing
// is still pending.
// ============================================================================
// ============================================================================
// WorkOutput build v102.1
// Init-order hotfix. Supersedes v102.
//
// Fixes "Cannot access 'tier' before initialization" at runtime. The v102 expansion block
// (canExtendOutput / expandDocument) was placed above the `tier` useState declaration in the
// App body; canExtendOutput reads `tier` at render time, so it hit the temporal dead zone.
// Moved the block to just after the tier declaration. Verified with a full-file tsc pass:
// zero TS2448/TS2454 (use-before-declaration) across the file.
// ============================================================================
// ============================================================================
// WorkOutput build v102
// Cost-control and abuse-resistance pass. Supersedes v101.2.
//
// Applies the cost-control spec forward onto the v101 line (the spec was drafted as a
// parallel "v99.7" that never landed on this lineage; the existing v99.7 is a different
// changeset). Pricing amounts unchanged. Enterprise unchanged. Team deferred.
//
// - Guest reduced to one lifetime preview session (1 decision / 4 turns / 1 per day),
//   no save, no export, no upload, no advanced intelligence. Exhaustion routes to
//   account creation, not pricing. Guest is product taste only; server-side IP/device
//   throttling is required before public launch (see enforcement-prep block).
// - Free reduced to 3 sessions / month, 6 turns, 1 per day. Markdown export only.
//   Uploads capped to 1 per session. No PDF, no advanced intelligence.
// - Starter set to 20 sessions / month, 12 turns, 3 per day. HTML/TXT/PDF export moved
//   down to Starter. No advanced intelligence.
// - Pro reduced to 30 sessions / month, 16 turns, 5 per day, 60 intelligence credits
//   (was 100). Pro is now serious daily individual use, not effectively unlimited.
// - Intelligence credit costs rebalanced: contradictionScan 1, dependencyMap 4,
//   failureSimulation 4, benchmark 4, decisionStressTest 6, multiPerspectiveReview 8,
//   fullIntelligenceRun 15. All cost UI reads from CREDIT_COSTS, so badges/tables/
//   settings update automatically. Credits still deduct only on persisted success.
// - Daily generation ceilings added (ACTIVE_DAILY_LIMITS seam: getDailyUsage /
//   canStartDailySession / recordDailySession), enforced in guardedSend and
//   startSeededDecision alongside the monthly cap. Reset at local midnight.
// - Overage is now payment-required. The local opt-in flag no longer grants sessions
//   (OVERAGE_PAYMENT_CONFIRMED=false; isOverageEnabled returns false until billing
//   confirms). The banner shows a $1-each "coming soon" disabled state.
// - Output-size tiers added (Brief/Standard/Full/Extended) gated by plan in
//   maxTokensForMode: Free/Guest get Brief, Starter Standard, Pro Full, with an
//   explicit Pro-only "extended" expansion action on the document view. Clarify and
//   Explore turns are not clamped.
// - Model-routing audit comment added at MODELS: FAST for classification/summary/
//   contradiction/metadata, PRIMARY for the main turn, produced artifacts, and
//   advanced intelligence. Routing was already centralized; this makes it auditable.
// - Server-side enforcement seams documented (auth, server counters, IP/device
//   throttling, CAPTCHA, email verification, payment-required overage, rate limits,
//   concurrency cap, daily spend ceiling). All limits remain CLIENT-SIDE and spoofable;
//   none of this is secure until the seams point at a server.
// - Team remains DEFERRED behind TEAM_ENABLED (false) until after single-user beta
//   (month 6). Team policy assumptions are set in TIER_POLICY.team and the credit
//   policy for that launch.
//
// DEVIATION FROM SPEC: section 4 lists "custom templates" as a Pro feature, but custom
// template creation was removed in v101 (buggy / low ROI) at the owner's direction. It
// is intentionally NOT reintroduced here, and Pro copy does not claim it.
// ============================================================================
// ============================================================================
// WorkOutput build v101.2
// Per-turn token efficiency. Supersedes v101.1. No behavior change to model output.
//
// Two changes to the prompt assembly, both targeting prompt-cache hit rate:
//
// 1. System block order (sendMessage). The related-session context block was
//    PREPENDED to the system blocks and marked cacheable. It is volatile —
//    findRelatedSessions can change the attachment set each turn — so putting it
//    at the front of the cache prefix meant any attachment change shifted the
//    whole prefix and busted the cache hit on ~1700 tokens of static prompt
//    behind it, while also spending a cache breakpoint on a block that rarely
//    repeats. Now the static cached prompts lead (stable prefix) and the context
//    block is appended last and uncached. The static prefix stays cached across
//    turns regardless of attachment churn, and one breakpoint is freed.
//
// 2. Artifact definition caching (buildSystemPrompt, both decide and draft paths).
//    The per-template artifact definition (rail, required sections, obligations,
//    ~200-300 tokens) is fixed once a template is selected, so it is stable for
//    the whole decision. It was concatenated into the uncached tail and re-sent at
//    full price every Explore/Commit/Draft turn. It now rides its own cached block,
//    parallel to and mutually exclusive with SYSTEM_PROMPT_ARTIFACT_LIBRARY, so the
//    breakpoint count does not rise. After turn one it costs cache-read price.
//
// The uncached tail now carries only what genuinely varies within a decision:
// domain depth and the per-user profile block. History compaction, the summary
// cache, and the max_tokens ladder are unchanged.
//
// Net cache breakpoints per turn dropped from up to 4 to 3. The model receives the
// identical assembled prompt text; only the cache_control placement and block order
// changed, so output is unaffected.
// ============================================================================
// ============================================================================
// WorkOutput build v101.1
// Single-concern fix. Supersedes v101.
//
// MEDIUM:
// - guardedSend double-bump residual. The v100.0 A5 fix added a synchronous
//   sendInFlightRef check at the top of guardedSend, but that ref is not claimed
//   until sendMessage runs — after guardedSend's own awaits (isOverageEnabled,
//   canCreateDecision). Two rapid fresh sends could both pass the entry check,
//   both bump the decision cap (ACTIVE_LIMITS.bump / bumpGuestUsed), and the
//   second was then rejected by the C3 guard inside sendMessage: two decisions
//   charged against the cap for one delivered send. Fix: a dedicated
//   decisionChargeRef, claimed synchronously at the top of the fresh branch
//   before any await and released in a finally once the bump + sendMessage
//   handoff complete. It serializes the charge decision only; sendInFlightRef
//   still serializes the send itself. Releasing in the finally is race-free:
//   sendMessage claims its own slot synchronously before its first await, so by
//   the time any handoff returns, a follow-up send is already blocked by
//   sendInFlightRef rather than able to re-bump.
//
// No behavior change on the single-send path. The overage onOptIn re-entry is
// unaffected: the original call has returned and released the ref before the
// user can act on the banner.
// ============================================================================
// ============================================================================
// WorkOutput build v101
// Feature removal. Supersedes v100.1.
//
// REMOVED: custom template creation (the v99.2 new_template tab), pulled for
// bug surface and low ROI. Scope of removal:
// - TemplatesView: new_template tab, its state (ntSeed/ntSource/ntQ), the
//   "New template" entry button, and the locked "Create your own" upsell.
//   Header copy and tab bar simplified back to the two-tab (Decide/Document)
//   layout.
// - App onUse handler: "__custom_template_prompt__:" branch removed; handler
//   is now the single catalog-template path.
// - FEATURE_MIN: customStructures gate removed (sole consumer was the
//   TemplatesView button).
// - PricingView: Pro feature line "Save your own templates and share them
//   with others" removed. Enterprise "Shared decision templates across the
//   team" retained — it describes framework sharing, not custom creation.
//
// Intentionally untouched: recordRecentTemplate, selectedTemplate wiring,
// shareFramework, and all catalog template paths. Reinstatement path: revert
// this diff; the v99.2 design is preserved in the v100.1 source.
// ============================================================================
// ============================================================================
// WorkOutput build v100.1
// A2 recovery path. Single-concern release. Supersedes v100.0.
//
// MEDIUM:
// - A2-recovery: recordOutcome no longer merely CONTAINS the blob-missing failure
//   (v100.0) — it recovers from it. The ledger reads outcomes from the index meta
//   (metaResult), not the session blob, so an outcome can be made durable without the
//   blob. Three parts:
//   1. patchIndexMeta(id, patch): writes outcome/review fields straight to the meta
//      row, no blob round-trip. Returns null only if the row is also gone (truly
//      unrecoverable) or the index write fails.
//   2. recordOutcome is now two-tier: try persistDsPatch (blob path); on null, fall
//      back to patchIndexMeta with the outcome stamped recoveredViaMeta. The profile
//      updates exactly once, and a re-entry guard no-ops the profile when an outcome is
//      already recorded (closing the original A2 double-count from a second angle).
//      Recovered outcomes carry an honest notice: saved to the ledger, transcript not
//      restored.
//   3. saveSessionV47 preserve guard: a meta-only recovered outcome would be clobbered
//      by the next blob save (whose decisionState carries no outcome). The guard carries
//      a recoveredViaMeta outcome forward when the incoming save supplies none. This is
//      the only write path permitted to keep a meta field the incoming decisionState
//      lacks, and it sits in the hot path — isolated here for easy revert.
//
// What recovery does NOT restore: the transcript and full decisionState (commit
// signals, dependencies). The ledger figure is the asset; the transcript is replayable.
// The recoveredViaMeta field is inert to every consumer (metaResult reads only status
// and result), so a recovered outcome counts identically to a normal one.
//
// Carried risk, accepted: patchIndexMeta is last-write-wins like every other counter
// here (multi-tab concurrent save can lose the patch); client tier gating spoofable.
// ============================================================================
// ============================================================================
// WorkOutput build v100.0
// Deep-audit fix pass over v99.9. Eight findings (A1-A8). Supersedes v99.9.
//
// HIGH:
// - A1: share-loop create attribution was destroyed for the doc and card loops.
//   clearSessionState nulls seedLoopRef (correct for new/restore), but
//   startOwnFromShare set the "doc" tag BEFORE calling clear, and the card landing
//   set "card" at boot then routed through seedComposer -> clear. Both tags were
//   wiped before the first send, so no create event fired: doc and card K-factor
//   numerators were structurally zero and v99.7's M5 card loop never worked end to
//   end. Only framework survived (its landing skips clear). Fix: a preserveSeedLoop
//   option on the helper; both call sites now set the tag AFTER the clear.
// - A2: recordOutcome corrupted the calibration ledger on the degraded-storage path.
//   persistDsPatch returns null when the session blob is missing (v97.9: index row
//   present, blob lost). recordOutcome ignored the return, updated the profile, and
//   reported success — so the outcome never persisted, the item stayed in the Review
//   queue, and each re-record double-counted into the ledger. Now it bails before
//   the profile write and tells the user to reopen the decision first.
//
// MEDIUM:
// - A3: mount race. The session-restore effect and the share-link effects
//   (?doc/?framework/?card) run concurrently; completion order is storage-latency
//   dependent, so a returning user opening a share link could have either clobber
//   the other. Restore now reads the URL synchronously and yields when a share
//   param is present.
// - A4: the C1 epoch guard checked once (above parseResponse) but more awaits
//   (session save, profile load/save) followed before live-ref and UI mutations.
//   A switch during those awaits merged this turn's profile into the new session's
//   decisionState and snapped the active-row highlight back. The per-session ref
//   merge and setActiveId are now epoch-gated; global state (profileRef, index)
//   still updates unconditionally.
// - A5: guardedSend charged the decision cap (guest bump / ACTIVE_LIMITS.bump)
//   before sendMessage's gates ran. Its own awaits opened a window where two rapid
//   sends both bumped and C3 rejected the second — two decisions charged for one
//   delivered send. guardedSend now checks the same synchronous in-flight ref first.
//
// LOW:
// - A6: the 429/529 backoff timer ignored the abort signal, so Stop during a retry
//   wait completed the wait and surfaced a spurious "API error 429"; retry-after was
//   also uncapped. The wait now races the abort signal and is capped at 30s.
// - A7: pivot detection used substring includes ("pivotal" matched "pivot"),
//   bypassing the v39 word-boundary fix applied to every other signal list. Now uses
//   _hasSignal.
// - A8: comment drift corrected at two sites (TIER_POLICY free-tier line said 5/5
//   for values of 4/8; the deferred-seed effect claimed a save that v97.9 removed).
//
// Carried risk, accepted: client-side tier gating remains spoofable by design
// (beta posture); multi-tab counters remain last-write-wins.
// ============================================================================
// ============================================================================
// WorkOutput build v99.9
// Closes the two residuals carried out of v99.8. Supersedes v99.8.
//
// CRITICAL:
// - C3: concurrent-send admission. The sendMessage loading gate reads React state,
//   which is stale inside the await window before setLoading(true) (the first-turn
//   early index save). Two rapid sends could both pass the gate: duplicate user
//   turn in history, two live streams, shared abortRef. v99.8's ownership guard
//   contained the ref clobber; this closes the door itself. A synchronous
//   sendInFlightRef is checked at the gate, claimed after the last synchronous
//   pre-flight check (race-free: no await can interleave), and released in finally
//   on every exit path. The rejected duplicate returns false, so the composer
//   keeps its attachments (M8 contract).
//
// MEDIUM:
// - M8b: composer attachment release moved from ACCEPTANCE to DELIVERY. v99.7's
//   onAccepted fired once pre-flight gates passed, so an in-flight failure after
//   acceptance (network drop, API 5xx, stream error event) still destroyed the
//   files, and the natural retry resent without them, silently. The callback
//   (renamed onDelivered) now fires only after res.ok and a fully drained stream,
//   i.e. once the attachments have actually reached the model. Failures and Stop
//   leave the composer's files intact for resend. Fires before the C1 epoch check:
//   delivery is true even if the session switched mid-stream.
// ============================================================================
// ============================================================================
// WorkOutput build v99.8
// Targeted hardening pass on the v99.7 C1 mechanism. Supersedes v99.7.
//
// CRITICAL:
// - C2: controller-ref cleanup was not ownership-guarded. All three finally blocks
//   (sendMessage, runIntel, runOverlayAction) nulled their abort ref unconditionally.
//   If a second run had since claimed the ref, the first run's cleanup stripped the
//   LIVE run's controller: Stop stopped working and the C1 session-swap abort could
//   no longer reach that stream. Reachable in sendMessage through the await window
//   before setLoading(true) (the first-turn early index save), where the loading
//   gate reads a stale false and admits a concurrent send. Fixed: each finally
//   releases its ref (and, for advanced runs, the advRunning spinner) only when the
//   ref still points at its own controller. refreshCredits stays unconditional.
//
// DOCUMENTED BOUNDARY (no code change):
// - M8 (v99.7) protects composer attachments against PRE-FLIGHT rejection only.
//   An in-flight failure after acceptance (network error, API 5xx) still clears
//   them, and a retry resends without the files. Accepted for this build; moving
//   the onAccepted release to post-success is the follow-up if it bites.
//
// Carried risk, accepted: client-side tier gating remains spoofable by design
// (beta posture); multi-tab counters remain last-write-wins.
// ============================================================================
// ============================================================================
// WorkOutput build v99.7
// Post-review fix pass. Supersedes v99.6. All changes carry v99.7 inline tags.
//
// CRITICAL:
// - C1: switching sessions while a stream, classifier, or intel run was in flight
//   corrupted BOTH sessions. restoreSession and clearSessionState never aborted
//   abortRef / classifyAbortRef / advAbortRef, so a completing stream pushed the
//   old session's reply into the newly loaded session's UI and history, then saved
//   the mixed state under the OLD session id. Fixed three ways: (1) both functions
//   now abort all three controllers; (2) a sessionEpochRef counter is bumped on
//   every session swap; (3) sendMessage captures the epoch at start and re-checks
//   it after the stream and inside the classify callback before mutating live refs.
//
// HIGH:
// - H2: parseResponse's mode regex matched Clarify|Chat|Explore|Commit but
//   SYSTEM_PROMPT_DRAFT emits "Mode: Draft". Every draft turn fell back to the
//   inferred mode (always Clarify for drafts): stage never advanced, ModeTag lied,
//   and status derivation leaned on hasDoc alone. Draft now parses and maps to
//   Commit (locked-artifact equivalence) for stage/status consistency.
// - H3: countProductiveTurns counted only Explore|Commit turns, so draft sessions
//   (which emit only Clarify|Draft) never accumulated productive turns and the
//   TIER_POLICY turn cap was unenforced for the entire document workflow. Draft
//   turns now count.
//
// MEDIUM:
// - M4: TEMPLATES and DOCUMENT_TEMPLATES both declared id "promotion-case". The
//   shared-namespace lookups resolve Decide first, so the Draft "Promotion Case"
//   received the Decide catalog's Commit-mode output contract inside the Draft
//   prompt. Draft id renamed to "promotion-case-doc"; a dev-time collision warning
//   now guards the namespace.
// - M5: card shares inflated the framework K-factor. The ?card= reader tagged
//   open/create as "fw" while shareCard recorded no share event at all, so card
//   conversions raised the fw numerator with no denominator. Cards now have their
//   own loop ("card" in METRIC_LOOPS): share/open/create all tag card, the sink
//   counts and reports the loop, legacy subtracts it, and both dashboards show it.
//   NOTE: card events recorded before this build remain in the fw/legacy buckets.
// - M6: cap_block instrumentation. recordMetric("cap_block", tier) was dropped by
//   loop validation for starter/pro (absent from METRIC_LOOPS — now added), and
//   the guest cap paths in guardedSend and startSeededDecision recorded nothing
//   before opening AuthGate (now instrumented as cap_block/guest).
// - M7: InfoTip returned early on !body ABOVE its useRef/useState/useEffect calls,
//   a rules-of-hooks violation that crashes when k/text flips validity across
//   renders. Guard relocated below all hooks.
// - M8: the composer cleared its attachments BEFORE calling onSend, so a send
//   rejected pre-flight (loading, turn cap) silently destroyed the user's files.
//   sendMessage now invokes an onAccepted callback after its gates pass and
//   returns false on pre-flight rejection; the composer releases attachment state
//   only on acceptance. guardedSend propagates the result.
//
// POLISH / LOW (P-series):
// - P1: Mode and Reasoning Strength lines are stripped from DISPLAYED message text
//   (rawHistory keeps them; parsing and turn counting are unaffected). ModeTag and
//   the confidence dot already presented both signals.
// - P2: max_tokens truncation is now detected (message_delta stop_reason in the
//   SSE path, stop_reason in the non-stream path) and surfaced as a notice. A
//   Commit cut off mid-document previously failed with no signal.
// - P3: var(--surface) was never defined (3 sites: Settings x2, Draft library).
//   Replaced with var(--panel), the intended token.
// - P4: templatesForClassification's id maps carried pre-v75 ids that exist in no
//   catalog; recommendedTemplates was dead data. Maps rebuilt from live ids.
// - P5: duplicate GLOSSARY "Decisions" key removed (later definition authoritative).
// - P6: _summaryRefreshPending idle sentinel changed 0 -> null; _olderSig can hash
//   to 0, which made such a snapshot permanently unrefreshable.
// - P7: canRunAdvancedTool checks cost===0 before allowance===0, making the
//   documented free-tool path reachable (latent — no cost-0 tool ships today).
// - P8: ProfileView's "How you decide" panel checked profile.summary on an ARRAY
//   and was dead; it now renders the profileDisplay rows.
// - P9: lastReasoningFromDoc read fields the doc parser never sets (always null);
//   helper deleted, call site simplified.
// - P10: sessions evicted past the 50-row index cap now have their wo:session:<id>
//   blobs deleted (best-effort). Blobs previously persisted forever.
// - P11: attachment cap is 18MB for native PDF/image attachments (base64 +33%
//   overshot the API request limit at 25MB); text-extracted files keep 25MB.
//   ".doc" removed from both accept lists — extraction always failed for it.
// - P12: seedComposer parks an in-progress decision as pending (awaited before
//   clearSessionState, mirroring startSeededDecision) instead of orphaning it
//   with no resume affordance.
//
// Carried risk, accepted: client-side tier gating remains spoofable by design
// (beta posture); multi-tab counters remain last-write-wins.
// ============================================================================
// ============================================================================
// ============================================================================
// WorkOutput build v99.6
// Full-audit fix pass. Supersedes v99.5.
//
// CRITICAL:
// - C1: guardedSend collision branch passed { forceSessionId } as a 4th positional
//   argument to sendMessage, which takes (rawText, attachments, opts). The argument
//   was silently discarded, so every save in the turn keyed to the stale closure
//   sessionId and OVERWROTE the colliding decision's blob and index row. Most
//   common trigger: starting a new decision from Home after a committed one.
//   forceSessionId now rides inside opts. The v97.7 protection works as designed.
//
// HIGH:
// - H1: sendMessage's finally block called a blanket setNotice(""), wiping every
//   notice set in the success path before render ("Storage is full", "Could not
//   save this decision", the 3rd-commit milestone). The blanket clear existed only
//   for the 429 retry notice; that notice is now tracked with a flag and cleared
//   selectively. Success-path notices display.
// - H2: onExportTxt read s.body, a field that does not exist on parsed sections
//   (they carry content / items / editable). Every Pro plain-text export emitted
//   "undefined" under each heading. Now reads items for list sections and
//   content (editable fallback) for prose sections.
// - H3: LibraryView deleted decisions on a single tap of the X with no
//   confirmation (blob + index row, no undo). The v99.5 S4 note claimed inline
//   confirm covered LibraryView; it existed only in DraftLibraryView. The
//   confirmDeleteId pattern is now ported to LibraryView. v99.5 S4 changelog
//   claim corrected by this entry.
//
// MEDIUM:
// - M1: startSeededDecision's overage onOptIn only dismissed the banner, dropping
//   the seeded decision the user was starting. It now re-runs the seed; the
//   overage flag is set by the banner before onOptIn fires, so the gate passes.
// - M2: cardToSvg interpolated doc-derived text into SVG unescaped. Any "&" or
//   "<" produced invalid XML, the image load failed, and PNG export errored.
//   trunc() now escapes via escapeHtml.
// - M3: PDF export was window.print(), which printed the entire app shell. The
//   HTML builder is extracted to buildHTMLDoc; printDocumentHTML renders it in a
//   hidden iframe and prints the standalone document. window.print remains only
//   as a last-resort fallback inside printDocumentHTML.
// - M4: restoreSession did not reset firstCommitFiredRef, leaking the first-commit
//   share guard across sessions (suppressed in fresh restores after a commit
//   elsewhere; re-fired in already-committed restores). Now reset on restore:
//   a restored session with an existing document counts as fired.
// - M5: scorecard/card memos read decisionStateRef but keyed only on [messages],
//   going stale on mutations that bypass messages (persistDsPatch scope/outcome
//   patches, the async classify merge). A dsVersion counter is bumped at those
//   mutation points and added to both dep arrays.
//
// LOW / HYGIENE:
// - L1: countProductiveTurns rewritten as a single forward pass (was O(n²):
//   slice().reverse().find + regex per user turn). Identical semantics.
// - L2: signalInfo no longer computes the context token estimate — the Context
//   field left the UI in v99.1; the computation was dead weight per memo.
// - L3: detectOptions dedupes case-insensitively (first-seen casing wins) and
//   normalizes "option a" / "Option A" labels to one form.
// - L5: guest usage count persisted via the store seam (wo:guest:used). Was
//   in-memory only; a refresh reset the guest cap. Still client-side gating.
// - L6: _dl and the card-PNG download attach the anchor to the DOM before
//   click() — unattached anchors are unreliable in some browsers.
//
// NOT CHANGED (acknowledged, deferred to server-side enforcement):
// - L4: credit/decision counters remain read-modify-write; multi-tab undercounts.
//   Client gating is an affordance, not security, per the existing seam stance.
//
// ============================================================================
// ============================================================================
// WorkOutput build v99.5
// Template starting point content fix. Supersedes v99.4.
//
// FIXES:
// - C1: countProductiveTurns() extracted. sendMessage computed the productive-turn
//   count twice in the same function (turn-cap enforcement and CommitOverride
//   inference) using identical logic under different variable names. Both call
//   sites now call the shared helper. Divergence risk eliminated.
// - C2: startOwnFromShare wired to clearSessionState(). It was the last manual
//   12-field reset block after v98.8 extracted the helper. The manually-reset
//   fields now match clearSessionState exactly.
// - C3: setNotice(JSX) replaced with dedicated overageBanner state slot. A React
//   element was being passed to notice (typed string), which bypassed notice
//   string handling. overageBanner is now its own useState(null) slot; the notice
//   bar renders it when present, separate from the string notice path.
// - C4: isOverageEnabled() extracted. guardedSend and startSeededDecision each
//   contained an identical inline try/catch to read wo:overage:enabled. Both now
//   call the shared async helper.
// - B5: guardedSend overage onOptIn callback changed from sendMessage(t,a,o) to
//   guardedSend(t,a,o). The direct sendMessage call bypassed the collision check
//   that guards against overwriting an existing session row on a fresh decision.
// - B3: _rd memoized on [messages]. assessReadiness ran regex scans over full
//   history on every render. Same pattern that motivated detectedOptions memo.
// - B4: scorecard and card memoized on [activeDoc, messages, lastReasoning].
//   buildScorecard calls assessReadiness internally; recomputing on every render
//   was avoidable. v74.1 rationale (stale ref risk) addressed by keeping messages
//   as the dep rather than going back to [activeDoc, lastReasoning].
// - S2: eslint-disable suppression removed from assertCreditGate. The dep array
//   [tier] is correct; the suppression was a leftover from the TDZ-fix move and
//   the lint rule agrees with the array as written.
// - S4: window.confirm() replaced with inline confirmDeleteId state in
//   LibraryView and DraftLibraryView. Blocks the main thread, unstyled, and
//   suppressed in some embedded environments.
// - S6: setTimeout 600ms magic number documented with an explanatory comment.
// - M1: __new_template__ dead branch removed from the onUse handler.
//
// ============================================================================
// ============================================================================
// WorkOutput build v99.3
// Decide and Document tabs: full catalog shown directly. Supersedes v99.2.
//
// CHANGES:
// - Removed the new-user progressive disclosure gate (isNewUser + showAll state).
//   Both Decide and Document tabs now render the full catalog immediately — no
//   "Recommended to start" short panel, no "See all" intermediary step.
// - Decide tab cards now show desc and rail from the TEMPLATES data inline:
//   desc in serif/meta below the name; rail in mono/slate below desc. Cards
//   without a matching TEMPLATES entry render without these fields.
// - isNewUser, showAll, and the setShowAll reset in the tab-switch effect removed
//   as dead code.
//
// ============================================================================
// ============================================================================
// WorkOutput build v99.2
// New template page in decision library. Supersedes v99.1.
//
// CHANGES:
// - TemplatesView: "New template" button (Pro, Decide tab) now switches to an
//   in-page "new_template" tab instead of navigating away to a decision session.
// - New template tab: textarea for the template description + "Build template"
//   button that launches a seeded composer session when submitted.
// - Existing templates can be clicked as a starting point. Clicking a card selects
//   it (highlighted, checkmark) and pre-fills the textarea prompt with the template
//   name as a seed. User stays on the page to edit the description before launching.
//   Clicking the selected card again deselects it.
// - Inline search for the starting-point catalog on the new template tab.
// - onUse handler updated: "__custom_template_prompt__:<text>" prefix carries the
//   fully-composed prompt from the new template tab through to seedComposer.
//   The legacy "__new_template__" path is preserved as a no-op fallback.
// - Back button returns to the Decide tab without losing any state.
//
// ============================================================================
// ============================================================================
// WorkOutput build v99.1
// Pressure-test page UX + v99 regression fixes. Supersedes v99.
//
// UX:
// - AdvancedView: Session signal (Mode, Reasoning, Turns) moved from a standalone
//   Module card below the action buttons to an inline pill row directly under the
//   page description. Reads as decision context before the run, not a result of it.
// - AdvancedView: Context field (token count) removed. Internal implementation
//   detail with no decision-relevant meaning to the user.
//
// REGRESSION FIXES (from v99):
// - R1: setAdvRunning(which) and setNotice("") were dropped from runIntel during
//   the v98.9 assertCreditGate refactor. The spinner never activated for any intel
//   run, the advRunning guard became ineffective for that path (allowing concurrent
//   runs), and the finally block reset from null to null with no visible effect.
//   One line restored before the AbortController creation.
// - R2 (load crash): assertCreditGate useCallback([tier]) was placed 296 lines
//   before the tier useState declaration. JavaScript's temporal dead zone (TDZ)
//   caused "Cannot access 'tier' before initialization" on every load.
//   assertCreditGate moved to after tier and refreshCredits are declared.
//
// CLEANUP (from v99):
// - D: newSession called setError("") and setNotice("") after clearSessionState(),
//   which already clears both. Redundant calls removed.
// - E: signalInfo was recomputed on every render (filter+map+join+estimateTokens
//   over full history). Wrapped in useMemo([messages, currentMode, lastReasoning]).
//
// ============================================================================
// ============================================================================
// WorkOutput build v98.9
// Second audit pass: bug fixes + enhancements. Supersedes v98.8.
//
// BUG FIXES:
// - B1: buildLedgerMetrics tto back-calculation used DEFAULT_REVIEW_HORIZON_DAYS
//   for legacy sessions (those without committedAt). Now accepts horizonDays param
//   and uses the user's actual preference. buildUserMetrics and both useMemo call
//   sites updated to pass reviewHorizonDays.
// - B2: runOverlayAction called detectOptions(rh) directly at click time, re-running
//   four regex passes over full history. Now uses the memoized detectedOptions value
//   (consistent with the v98.8 fix). Both the guard check and the battle params updated.
// - B3: newSession was the fourth copy of the session reset block. Now delegates to
//   clearSessionState() (the helper extracted in v98.8) and handles its additive
//   state (input clear, Home nav) separately.
// - B4/B5: buildLedgerMetrics internal variable `recorded` renamed to
//   `recordedSessions` (session array) to make the type boundary with `results`
//   (string array) unambiguous. Six duplicate credit-notice strings collapsed into
//   the assertCreditGate helper (see E1).
//
// ENHANCEMENTS:
// - E1: assertCreditGate(toolId) helper extracted from runIntel, runOverlayAction,
//   and runContradiction. Single definition of the two credit-notice strings.
//   Wrapped in useCallback([tier]) so identity is stable across renders.
// - E3: Contradiction dedup guard in runContradiction. If an auto-check ran on this
//   commit within the last 60 seconds, the cached result is surfaced for free instead
//   of charging a credit for the same call. Manual re-run after the window still works.
// - E4: LibraryView now shows "(showing your 50 most recent)" when the session index
//   is at its 50-row cap, so users know older blobs exist in storage but are not listed.
// - E6: CardLandingView CTA now fires onStart() before recordMetric(), so the metric
//   is only logged when the navigation actually executes.
// - E8: modelPreflight now caches the last successful probe in sessionStorage (TTL 5 min,
//   keyed on PRIMARY+FAST model strings). Rapid page refreshes skip the two probe calls.
//   Cache is automatically invalidated when model strings change or a fallback switch fires.
//
// ============================================================================
// ============================================================================
// WorkOutput build v98.8
// Code audit fixes. Supersedes v98.7.
//
// CHANGES:
// - Bug B (data integrity): shareCard was calling recordMetric("share","fw"),
//   inflating the framework K-factor with card shares. Removed. Card shares are
//   measured exclusively via share_card_copied (segmented by card type).
// - Bug D (correctness): classifyCommitSignalsModel captured sessionId (the state
//   variable) as cid, which could advance to a new session when forceSessionId was
//   set by guardedSend on a collision. Changed to capture sid (the authoritative
//   turn id). Classifier results now always write to the correct session row.
// - Bug A (logic accuracy): detectOptions scanned full history for binary phrasings
//   ("build or buy", etc.), causing labels from unrelated earlier turns to fire on
//   later decisions. orMatches now scopes to the last 4 messages only.
// - Bug C (maintainability): session reset logic was duplicated across seedComposer,
//   startSeededDecision, and the Home onStart handler (3 copies, ~12 lines each).
//   Extracted to clearSessionState(opts) helper. All three call sites updated.
// - Bug E (correctness): buildReviewQueue back-calculated committedAt for legacy
//   sessions using the hardcoded DEFAULT_REVIEW_HORIZON_DAYS, ignoring the user's
//   actual saved preference. Function now accepts horizonDays param; useMemo call
//   site passes reviewHorizonDays and adds it to the dependency array.
// - Performance A: detectedOptions was recomputed on every render (four regex scans
//   over full joined history). Wrapped in useMemo with [messages] dependency.
// - Dead End A: shareDocument removed (confirmed zero call sites). Full-document
//   sharing was deprecated in Build 6. storeSharedDoc/buildShareUrl("doc") are
//   retained for the ?doc= landing reader.
//
// ============================================================================
// ============================================================================
// WorkOutput build v98.7
// Fix: link copied permanent + export buttons. Supersedes v98.6.
//
// CHANGES:
// - handleStructure: setTimeout revert removed. "Link copied" state is
//   permanent until the modal is closed and reopened.
// - ShareModalV72: hasDoc prop added. Export section gated on hasDoc.
//   When no committed document exists, export chips are replaced with
//   "Commit a decision to unlock export." No silent no-ops.
// - hasDoc={!!activeDoc} wired at call site.
//
// WorkOutput build v98.6
// Fix: syntax error in onExportTxt handler. Supersedes v98.5.
//
// CHANGES:
// - onExportTxt: literal newlines in string concatenation replaced with
//   escaped \\n. Caused "Invalid or unexpected token" on artifact load.
//   Behavior unchanged.
//
// WorkOutput build v98.5
// Share template feedback + Pro export options. Supersedes v98.4.
//
// CHANGES:
// - ShareModalV72: onStructure no longer closes the modal. Button shows
//   inline "Link copied" confirmation (CheckCircle2, green border, updated
//   body copy) for 3 seconds, then resets. Modal stays open so user sees
//   the confirmation before dismissing.
// - ShareModalV72: two new Pro-gated export chips added: Plain text and PDF.
//   Plain text: strips to heading+body per section, downloads as .txt.
//   PDF: triggers window.print(). Both locked behind advancedTools (rank 3).
//   proLocked prop added to ShareModalV72; onExportTxt and onExportPdf wired
//   at call site with tier gate and upgrade path.
// - Export chips now close the modal on action.
//
// WorkOutput build v98.4
// New template button fix. Supersedes v98.3.
//
// CHANGES:
// - TemplatesView Decide tab: "+ New template" button was wired to onShare
//   (opened share modal). Now seeds the composer with a custom template
//   creation prompt and navigates to the session.
// - onUse handler at call site: intercepts "__new_template__" label and
//   seeds "I want to build a custom decision template..." prompt.
//   All other labels route through the existing recordRecentTemplate path
//   unchanged.
//
// ============================================================================
// ============================================================================
// WorkOutput build v98.3
// Pro intelligence credits restored to 100. Supersedes v98.2.
//
// CHANGES:
// - INTELLIGENCE_CREDIT_POLICY pro.monthlyCredits: 50 → 100.
// - Upgrade banner string updated (hardcoded 50 → 100).
// - Pricing feature list string updated (hardcoded 50 → 100).
// - Changelog comment (v97 credit policy summary) updated to match.
//
// RATIONALE:
// Per-user cost of full 100-credit budget is $3–6/month against $40 revenue.
// Delta from restoring to 100 is ~$1.50–3/user/month. Margin holds at median
// use. Retention and conversion value of the full credit allowance outweighs
// the cost increment. Session cap (40) unchanged.
//
// ============================================================================
// ============================================================================
// WorkOutput build v98.2
// Pro tier limits adjusted. Supersedes v98.1.
//
// CHANGES:
// - TIER_POLICY pro.maxDecisionsPerMonth: 50 → 40.
// - INTELLIGENCE_CREDIT_POLICY pro.monthlyCredits: 100 → 50.
// - Upgrade banner string updated (hardcoded 100 → 50).
// - Pricing feature list string updated (hardcoded 100 → 50).
// - Changelog comment (v97 credit policy summary) updated to match.
//
// ============================================================================
// ============================================================================
// WorkOutput build v98.1
// Pre-GitHub hygiene pass. Supersedes v98.0.
//
// CHANGES:
// - GhostLedgerPreview: phantom data constants labeled NOT_BENCHMARK. Header
//   comment updated to "illustrative preview". Ghost label copy corrected —
//   prior text stated "The held-rate and category breakdown are yours, not a
//   generic benchmark." That was false. The values are fixed illustrative
//   constants, not derived from user data or any aggregate benchmark. New copy:
//   "Illustrative preview — these numbers are not your data."
// - Internal system terminology removed from comments: "Signal Layer" replaced
//   with "product framing" or "internal framing" at four call sites. No
//   user-facing strings changed.
//
// ============================================================================
// ============================================================================
// WorkOutput build v98.0
// Code audit and hardening pass. Supersedes v97.13.
//
// CHANGES:
// - buildStreakDays: removed dead first loop (result was always discarded when
//   today had no session). Replaced with single-pass logic using startOffset.
//   Behavior is unchanged; dead code path eliminated.
// - cardFunnel in sharedStorageSink.read(): replaced 24 sequential store.list
//   full-key-scan calls (6 events × 4 card types + total) with one store.list
//   per event (6 parallelized calls), keys counted locally. Per-event try/catch
//   with zero-default fallback added — a storage error on one event no longer
//   corrupts the whole read.
// - spendCredits ordering in runIntel: credits were deducted inside the result
//   branch before saveSessionV47. Now staged as _pendingCreditTool and deducted
//   only after save returns. A save failure no longer charges credits with no
//   persisted record.
// - classifyInput: accepts a signal parameter and respects abort. classifyAbortRef
//   initialized alongside abortRef. Prior pending call aborted before each new
//   send. Fire-and-forget classify calls no longer pile up across rapid sends.
// - safeBase64Encode / safeBase64Decode utilities extracted. All four inline
//   btoa/atob usages (shareFramework, shareCard, framework-link reader,
//   card-link reader) replaced. One bug surface instead of four.
// - AI domain keyword regex: removed redundant outer \b wrapping \bai\b.
// - setSink() guard added around ACTIVE_SINK. Direct mutation at call sites
//   replaced by the setter.
// - saveReviewHorizonDays: clamp Math.max(1, Math.min(30, ...)) added at write
//   boundary to match the validation already present at the read boundary.
//
// v97.13: Added 6 document templates so no category has fewer than 3 (Strategy,
// Sales, Customer Success, and Finance were thin). Catalog is now 57 document
// templates across 10 categories. Pricing copy corrected to count the full
// library (110 templates: 53 decision, 57 document) instead of undercounting.
// v97.12: Extra sessions sold as a pack of 5 for $5.
//
// CHANGES (v97.13):
// - Four public-safe share artifact types: Before/After, Assumption Map,
//   Template Path, and Decision Style. None expose private decision content,
//   user text, document content, uploaded files, or private reasoning by default.
// - FirstCommitShareModal defaults to the Before/After card.
// - Shared card link lands on a focused public page with one CTA, "Try this
//   decision path," which stages an intake prompt into the composer (no auto-send).
// - Share-card funnel metrics added: viewed, type_changed, copied, opened,
//   cta_clicked, shared_path_started. Segmented by card type, kept out of the
//   older framework K-factor. (downloaded is wired to a real download action.)
// - Advanced intelligence credits extended to the expensive overlays
//   (Decision Battle, Challenge this, Perspective). Credits deduct only on a
//   confirmed successful result, never on failure.
// - Session save hardening: the lightweight library row is written even when the
//   heavier session record is rejected by the rate-limited store, the first turn
//   saves immediately, and tapping a row with a missing record reopens it from the
//   library row so a tap never silently fails.
// - Template and start paths stage the intake prompt into the composer for
//   edit-or-send instead of auto-sending, where appropriate.
// - workflowType is persisted to the library row so the Document Archive and the
//   decision recents resolve correctly.
//
// KNOWN PRODUCTION REQUIREMENT (not addressed in this artifact build):
//   ACTIVE_LIMITS and ACTIVE_CREDIT_LIMITS enforce caps and credits client-side.
//   Both must move server-side (Vercel/Supabase) before paid launch so neither can
//   be bypassed by clearing local data. The seams are designed for a drop-in swap.
//
// ============================================================================
// ============================================================================
// WorkOutput build v97.0
// Advanced Intelligence Credits system added. Supersedes v96.4.
//
// CHANGES:
//
// 1. INTELLIGENCE CREDIT POLICY — INTELLIGENCE_CREDIT_POLICY constant added.
//    free: 0 credits/month · starter: 0 credits/month · pro: 100 credits/month
//    enterprise: Infinity (custom pooling deferred).
//    Credits are distinct from sessions. They do not roll over. They reset with
//    the existing rolling 30-day window anchor (wo:limit:anchor) — not a new anchor.
//    Credits are not interchangeable with sessions. Extra sessions are sold as a
//    pack of 5 for $5; credits cannot buy sessions and sessions cannot buy credits.
//
// 2. CREDIT COSTS — CREDIT_COSTS constant maps each advanced tool to its cost:
//    contradictionScan: 1 · dependencyMap: 3 · failureSimulation: 3
//    benchmark: 3 · decisionStressTest: 4 · multiPerspectiveReview: 5
//    fullIntelligenceRun: 10
//
// 3. CREDIT STORE — localCreditLimits added, mirrors localLimits pattern.
//    Shares the existing wo:limit:anchor window. Key: wo:credits:used:{windowIndex}
//    ACTIVE_CREDIT_LIMITS seam added — swap this binding for server-side enforcement.
//    // SERVER-SIDE ENFORCEMENT SEAM: before paid launch, ACTIVE_CREDIT_LIMITS must
//    // move server-side (Vercel/Supabase) so credit counts cannot be spoofed by
//    // clearing localStorage. The contract is count/spend/resetInDays — same as
//    // ACTIVE_LIMITS. No call-site changes required.
//
// 4. CREDIT HELPER FUNCTIONS:
//    getMonthlyCreditAllowance(tier) · getCreditsUsed() · getCreditsRemaining(tier)
//    canRunAdvancedTool(toolId, tier) → { allowed, reason: "ok"|"exhausted"|"tier"|"no_context" }
//    spendCredits(toolId) · creditCostForTool(toolId)
//    Credits are NOT deducted until the tool succeeds. spendCredits() is called
//    inside the success branch of each generate* function, after result persists.
//
// 5. UI — SettingsView: "Advanced intelligence credits" section added under Plan.
//    Shows allowance / used / remaining / reset timing / cost table.
//    PricingView: Pro feats updated with credit line and explanatory copy.
//    AdvancedView: credit cost badge shown beside each tool button.
//    Insufficient-credits state: distinct messages for exhausted vs tier-blocked users.
//    Sidebar/TopBar: "X sessions left · Y credits left" compact meter for paid users.
//
// RULES PRESERVED:
//    - Extra sessions are sold as a pack of 5 for $5. Credits cannot purchase sessions.
//    - Standard Decide and Document sessions do not consume credits.
//    - Existing session caps, turn caps, and overage path are unchanged.
//    - "tokens" language never appears in user-facing copy.
//
// ============================================================================
// WorkOutput build v96.4
// Input/textarea visibility fixed across both themes. Supersedes v96.3.
//
// CHANGES:
//
// 1. INPUT VISIBILITY — two new CSS variables added to both themes:
//    --input-bg: background for text entry fields, distinct from panel/edge.
//    --input-border: border for text entry fields, visibly distinct from bg.
//    --input-focus-border: accent-tinted border on focus.
//
//    Paper mode: --input-bg #FFFFFF (white, clear against warm cream bg)
//                --input-border #A8A59A (substantially darker than --line)
//    Ink mode:   --input-bg #2C2E24 (visibly lighter than --panel #191A12)
//                --input-border #555849 (much more visible than --line #2A2C20)
//
//    Applied to: ComposerV72 textarea, HomeV72 textarea, LibraryView search
//    input, all other bare input/textarea elements with explicit background
//    and border declarations.
//
// 2. TEMPLATE CLICK — behavior confirmed correct (already implemented in
//    startSeededDecision: parks current session if in progress, resets state,
//    navigates to Session with seeded text). No code change required.
//    Note added in comments for clarity.
//
// ============================================================================
// WorkOutput build v96.3
// Three targeted changes. Supersedes v96.2.
//
// 1. "NEED TO WRITE" → "WANT TO WRITE"
//    User-facing copy on the home composer and document template chip seeds.
//    Internal logic strings and comment text unchanged.
//
// 2. CATEGORY SYMBOLS — all `mark:` values replaced with semantically
//    relevant symbols. Prior marks were geometric shapes with no relationship
//    to the category they labeled. Collisions between role packs and document
//    categories also removed.
//    Role packs:  Personal ♡ · Founder ✦ · Product Manager ⬡ · Consultant ⊕ · Operator ⚙
//    Doc cats:    Product & Engineering ⬡ · Strategy & Leadership ✦ · Hiring & People ⊙
//                 Sales ◎ · Customer Success ⟳ · Finance & Operations ⊠ · Operations ⚙
//    Decision cats: same symbol set applied to the decide-tab category rows.
//
// 3. TEMPLATE UTILITY PASS — rails and intakes reviewed across all 53 decision
//    templates. Changes applied where the terminal step was vague, where the
//    intake did not set up next-step output, or where internal language leaked
//    into user-facing desc. Specific changes documented inline.
//
// ============================================================================
// WorkOutput build v96.2
// Free tier limits tightened. Pricing page copy audited and rewritten.
// Supersedes v96.1.
//
// CHANGES:
//
// 1. FREE TIER CAPS — 4 sessions / month (from 5), 8 turns each (from 10).
//    Free is a trial of the method, not a sustainable substitute for paid use.
//    4 sessions per month is enough to understand the product and build intent.
//    8 turns per session is enough to reach a committed decision on most topics.
//
// 2. PRICING PAGE COPY — full audit and rewrite.
//    Problems corrected:
//    - Free tag: "Build the habit" → "Try the method" (accurate, not motivational)
//    - Free feats reordered: ledger/outcome tracking moved to lead; templates line
//      simplified; "+" separator in Library line fixed to "and"; share copy
//      rewritten without the defensive parenthetical.
//    - Starter tag: "More room to work" → "Steady daily use" (names the use case)
//    - Starter feats: added ledger continuity line to name the core upgrade value.
//    - Pro feat line 3: spec-list format replaced with plain benefit language.
//    - Pro feat line 5: "decision insights" clarified to "pattern recognition
//      across your decision history".
//    - Pro feat line 6: rewritten to name the team/reuse value of custom templates.
//    - Enterprise feat line 3: colon format normalized to match other items.
//    - Page subhead: "Start with 2 free" removed — ambiguous on a page showing
//      plan cards. Replaced with accurate Free plan reference.
//    - Annual save badge: "Save 13%" → "Save up to 15%" (Starter saves 15%).
//
// ============================================================================
// WorkOutput build v96.1
// Two corrections over v96.0. Supersedes v96.0.
//
// CHANGES:
//   1. Team tier removed. Deferred pending single-user beta completion and
//      scope definition. TIER_POLICY team entry removed. Team plan card
//      removed from PricingView. Enterprise copy restored to prior state
//      (\"For teams\" tag, full feature list). CTA button logic simplified.
//   2. Overage price corrected: $0.90 → $1.00 per additional session.
//      OverageOptInBanner copy updated. Clean number, easier to communicate.
//
// ============================================================================
// WorkOutput build v96.0
// Six targeted improvements from product evaluation. Supersedes v95.9.
//
// CHANGES:
//
// 1. TIER CAPS — Pro corrected to 50 sessions / 20 turns (from 60 / 25).
//    Worst-case API cost drops from ~$75 to ~$50. Median margin (20 sessions)
//    holds at ~50%. Ceiling is now 1.7 sessions/day — committed daily use,
//    not pathological. Turn cap at 20 is where most legitimate work completes.
//
// 2. STARTER PRICE INCREASE — $23/mo monthly → $27/mo · $20/mo annual → $23/mo.
//    Annual price matches prior monthly price. Worst-case margin improves from
//    ~10% to ~25-30%. Starter converts on capability need, not price sensitivity.
//    The $4 increase does not materially change conversion at this segment.
//    Annual billing tag updated: "Save 15%" (23 vs 27).
//
// 3. STREAK — fixed. Was hardcoded to 7 (literal constant in JSX). Now computed
//    from sessionIndex: count of distinct calendar days with a session updated in
//    the last N consecutive days, walking back from today. buildStreakDays()
//    helper added. The streak bar dots now reflect actual active days.
//    ProfileViewV72 receives streak from userMetrics (added to buildUserMetrics).
//
// 4. ENTERPRISE SELF-SERVE TIER — Team tier added between Pro and Enterprise.
//    $35/seat/mo · $30/seat annual · 5-seat minimum shown on pricing page.
//    Features: everything in Pro + shared templates + team calibration view.
//    "Contact sales" Enterprise remains for >25 seats, SSO, audit log.
//    PricingView plans array updated. TIER_POLICY: team = Pro limits (per seat).
//    FEATURE_MIN: team tier maps to same features as enterprise minus admin/sso.
//
// 5. FIRST COMMIT — ledger onboarding copy strengthened. FirstCommitShareModal
//    now explicitly names the outcome review loop: "In 7 days, WorkOutput will
//    ask whether your call held. That single check starts your track record."
//    Added as a dedicated callout block above the share CTA.
//
// 6. OVERAGE NOTICE — when a Pro or Starter user hits the session cap, the
//    cap-block notice now includes an overage option: $1.00/additional session,
//    opt-in, no tier change required. OverageOptInBanner component added.
//    Overage sessions stored at wo:overage:count and wo:overage:enabled.
//    Overage is NOT enforced client-side (requires server billing integration) —
//    the UI captures intent and sets a flag. Implementation note added.
//
// MARGIN NOTE at v96.0 prices:
//   Starter worst-case (25 × 15 turns): ~$18 API cost vs $27 = ~33% margin.
//   Starter median (12 sessions): ~$9 cost vs $27 = ~67% margin.
//   Pro worst-case (50 × 20 turns): ~$50 API cost vs $40 = still negative at max.
//   Pro median (20 sessions): ~$20 cost vs $40 = ~50% margin.
//   Pro is safe at median. Overage path captures power users above the cap.
//
// ============================================================================
// WorkOutput build v95.9
// Enterprise plan copy rewritten. Supersedes v95.8.
// Removed internal system names (Site Metrics, Growth Loops).
// Rewritten to describe team value: shared templates, team calibration,
// admin controls, SSO, audit log, onboarding and support.
// ============================================================================
// WorkOutput build v95.8
// Pricing page defaults to annual view. Supersedes v95.7.
// CHANGE: PricingView annual state initialised true instead of false.
// ============================================================================
// WorkOutput build v95.7
// Price increase + limit adjustment. Supersedes v95.6.
//
// PRICING:
//   - Starter: annual $20/mo ($240/yr) · monthly $23/mo (+15%).
//   - Pro: annual $35/mo ($420/yr) · monthly $40/mo (+15%).
//   - Annual discount: 13% off monthly (Save 13% badge).
//
// LIMITS (scaled ~15-20% with price increase):
//   - Starter: sessions 20 → 25, turns 12 → 15.
//   - Pro: sessions 50 → 60, turns 20 → 25.
//   - Free and Guest unchanged.
//
// MARGIN NOTE at new prices:
//   Starter worst-case (25 × 15 turns): ~$18 API cost vs $20 = ~10% margin.
//   Pro worst-case (60 × 25 turns): ~$75 API cost vs $35 = still negative at max.
//   Pro median (20 sessions/mo): ~$20 cost vs $35 = ~43% margin.
//   Pro is safe at median use. Prompt caching remains the next cost lever.
//
// ============================================================================
// WorkOutput build v95.6
// Pricing and cap revision. Supersedes v95.5.
//
// PRICING:
//   - Annual discount corrected to 20% across both paid tiers.
//   - Starter: $16/mo · $13/mo annual ($156/yr, 18.75% — nearest whole number to 20%).
//   - Pro: $29/mo · $23/mo annual ($276/yr, 20.7% — nearest whole number to 20%).
//   - Annual badge: "Up to 25% off" → "20% off".
//
// TIER CAPS (TIER_POLICY):
//   - Free: maxTurns 20 → 10. Was too generous for zero-revenue users.
//   - Starter: maxTurns Infinity → 12. Was uncapped, a blank check on API cost.
//   - Pro: maxDecisionsPerMonth Infinity → 50, maxTurns Infinity → 20.
//     50 sessions/mo ≈ 1.7/day — real daily use without abuse headroom.
//     20 turns/session caps the extreme outlier sessions that blow cost.
//   - Enterprise: unchanged (Infinity / Infinity — priced custom).
//
// COPY UPDATED to match new caps throughout:
//   - Settings planDesc: all tiers now show live values from TIER_POLICY.
//     Pro planDesc added (was falling through to the enterprise "Unlimited" string).
//   - Settings upgrade copy: removed "unlimited turns" from Starter upsell;
//     both directions now quote live TIER_POLICY values.
//   - Pricing feat lists: Starter "Unlimited turns" → live cap value.
//     Pro "Unlimited decisions and documents" → live cap value.
//     Both session and turn counts now pull from TIER_POLICY so they
//     stay in sync with the policy object automatically.
//   - Free banner: "Pro removes the limit" → "Upgrade for more sessions and turns."
//   - UpgradeNotice: "unlimited decisions" → accurate copy.
//   - Sidebar Go Pro nudge: updated to match.
//
// MARGIN NOTE:
//   Worst-case Pro user hitting all 50 sessions at 20 turns:
//   ~50 × $1.00/session = $50 cost vs $29 revenue = -72% at absolute max use.
//   Median Pro user (15-20 sessions/mo): ~$15-20 cost = 31-48% margin.
//   Starter worst-case (20 sessions × 12 turns): ~$14 cost vs $16 = ~12% margin.
//   Prompt caching on the system prompt (90% input reduction) is the next lever —
//   would drop per-session cost ~40% and make Pro safe at median use.
//
// ============================================================================
// WorkOutput build v95.5
// Pricing update. Supersedes v95.4.
//
// CHANGES:
//   - Starter: $9/mo → $16/mo · annual $7 → $12/mo (25% discount)
//   - Pro: $24/mo → $29/mo · annual $16 → $23/mo (21% discount)
//   - Annual badge: "Up to 33% off" → "Up to 25% off" (accurate to new rates)
//
// MARGIN NOTE (worst-case, all users hammering Pro):
//   Model costs: Sonnet 4.6 $3/$15 per MTok input/output. Haiku 4.5 $1/$5.
//   Worst-case session (20 turns, Commit outputs, full intelligence run): ~$2.60.
//   Daily power user (20 sessions/mo): ~$52 cost vs $29 revenue = -79% margin.
//   Realistic heavy user (10 sessions/mo): ~$26 cost vs $29 revenue = ~10% margin.
//   Average Pro user (5 sessions/mo, mixed turn depth): ~$6 cost vs $29 = ~79%.
//   Starter is structurally safer: 20-session cap + shorter turns = $3-5/mo cost,
//   ~70% minimum margin. Pro requires prompt caching or a soft session cap to be
//   safe against determined daily users at scale.
//
// ============================================================================
// WorkOutput build v95.4
// Pricing dead-end fix: navigate back to active chat after upgrade. Supersedes v95.3.
//
// CHANGES:
//   - prevView state added to root component. Tracks the view the user was in
//     before navigating to pricing.
//   - goToPricing helper replaces all 17 setView("pricing") call sites. Saves
//     current view to prevView before navigating, ensuring no context is lost.
//   - returnFromPricing helper computes the correct return destination:
//     prevView if set, Session if a chat is active, Home as fallback.
//     Clears prevView on exit.
//   - PricingView receives onBack and hasActiveChat props.
//   - Back button added to pricing page header. Label reads "Back to your chat"
//     when a chat is active, "Back" otherwise.
//   - Plan selection (Choose Starter / Choose Pro) calls onBack immediately
//     after setTier, returning the user to their previous context.
//   - HomeV72 receives onUpgrade prop. Guest and free usage banners now route
//     through goToPricing rather than calling setView("pricing") directly.
//
// ============================================================================
// WorkOutput build v95.3
// Rename "Draft" to "Document" in all user-facing surfaces. Supersedes v95.2.
//
// SCOPE: user-facing strings only. All internal identifiers preserved unchanged:
//   workflowType:"draft", view="Draft", view="DraftLibrary", onDraft, homeTab,
//   tab==="draft", draftCatOpen, filteredDraft, id:"draft", isDraft.
//   Model-facing system prompt strings (Mode: Draft, Draft output) also unchanged.
//
// CHANGES:
//   - Home tab switcher: "Draft" label → "Document"
//   - Home hero body: "Draft turns your context..." → "Document turns..."
//   - Returning user action card: "Draft from a template" → "Document from a template"
//   - Templates view heading and tab bar label: "Draft" → "Document"
//   - Templates view description: "complete draft" → "complete document"
//   - Template card action buttons: "Draft" → "Create"
//   - DraftLibraryView heading: "drafted" → "created"
//   - DraftLibraryView status label: "Drafting" → "In progress"
//     (statusColor updated to match new label string)
//   - DraftLibraryView empty state: "Drafted documents" → "Created documents"
//   - Sidebar Document cluster sublabel: "AI-drafted docs" → "AI-created documents"
//   - Settings planDesc: "decisions or drafts" → "decisions or documents" (all tiers)
//   - Settings planDesc: "Unlimited decisions, drafts..." → "...documents..."
//   - Settings upgrade copy: "decisions and drafts" → "decisions and documents"
//   - Guest usage banner: "decision or draft" / "decisions or drafts" → "...document(s)"
//   - Free usage banner: "decisions or drafts" → "decisions or documents" (both states)
//   - Pricing Free plan: "decisions or drafts / month" → "decisions or documents / month"
//   - Pricing Free plan: "both Decide and Draft" → "both Decide and Document"
//   - Pricing Starter plan: "decisions or drafts / month" → "decisions or documents / month"
//   - Pricing Pro plan: "Unlimited decisions and drafts" → "Unlimited decisions and documents"
//   - Export confirm modal: "current draft" → "current document"
//   - Cap-hit notice (both instances): "decisions or drafts this cycle" → "...documents..."
//   - Auth gate footer: "decisions / month" → "decisions or documents / month"
//
// ============================================================================
// WorkOutput build v95.2
// UX copy audit pass + targeted fixes. Supersedes v95.1.
//
// COPY CHANGES (user-facing strings, no logic):
//    - Hero kicker, body, Decide placeholder, below-input hints.
//    - Right panel: skip button, tool labels, hint text.
//    - Commit panel (both surfaces): plain language.
//    - Soft check banner, Review view body, share modal, export confirm.
//    - Auth gate copy and sign-in link.
//    - Pricing headline, sub, Pro tag, Pro feature description.
//    - Framework landing body, first commit modal.
//
// FUNCTIONAL CHANGES:
// 1. SETTINGS — UPGRADE BUTTON
//    - SettingsView now accepts onUpgrade prop.
//    - Plan section shows upgrade CTA for guest, free, and starter tiers.
//    - Plan description text updated to be accurate per tier (starter shows
//      unlimited turns, not the old "unlimited decisions and turns" catch-all).
//    - type="button" added to all stepper/preset buttons to prevent default behavior.
//    - Call site passes onUpgrade={() => setView("pricing")}.
//
// 2. ANNUAL TOGGLE FIX
//    - type="button" added to toggle button element.
//    - pointerEvents:"none" added to the knob span so clicks are not absorbed
//      by the child element before reaching the button handler.
//    - Monthly label color now responds to annual state (matches Annual label pattern).
//
// 3. PRICING — PLAN COPY AND FEATURE SEGMENTATION
//    - Free: "Decide and Draft · 18 document templates" rewritten to be additive
//      (names template count + both paths). Turn count made explicit ("15 turns").
//      Outcome tracking and calibration ledger added (it is a Free feature).
//      Share copy clarified: "Share decision framework (no private content)".
//    - Starter: tag "Steady usage" → "More room to work". "Full analytics" removed
//      (fullAnalytics is rank 1 / Free — listing it as a Starter feature was
//      inaccurate). HTML export made explicit as the key upgrade from Free.
//      Feats reduced to true differentiators over Free.
//    - Pro: "Custom structures" → "Save and share your own decision templates"
//      (accurate description of what customStructures gates). "Conflict detection
//      across history" → more specific. "Full Profile analytics + insights" split
//      into one clear line.
//    - Enterprise: "+" separators → "and" for consistency with rest of copy.
//
// ============================================================================
// WorkOutput build v95.1
// Copy pass completion: both-paths product descriptions, em-dash removal.
// UX fixes: category chip visibility restoration, search persistence across tabs.
// Supersedes v94 and v95.
//
// 1. HOME HERO REWRITTEN (Product copy)
//    - Hero paragraph described Decide only. Now states two paths from one input,
//      defines each (Decide settles what to do, Draft produces what to deliver),
//      and names the complement explicitly.
//    - Headline: "Think it through before you act." became "Think it through,
//      then write it up." It spans both paths.
//    - Intro kicker broadened in both instances (collapsed and expanded):
//      "Structured decision intelligence" became "Structured decision and
//      document intelligence".
//
// 2. PRICING COPY (Product copy)
//    - Subhead names both paths: "Decide and Draft on every plan."
//    - Free plan feats: pooled cap label, added "Decide and Draft · 18 document
//      templates", and "Decision Library + Decision Profile" became "Decision
//      Library, Document Archive + Profile".
//    - Starter feats: pooled cap label.
//    - Pro feats: "Unlimited decisions" became "Unlimited decisions and drafts".
//
// 3. POSITIONING RECONCILED (internal framing, not UI-rendered)
//    - The competitive comment block previously framed drafting as a competitor
//      trait WorkOutput lacked. Rewritten: both paths stated, ledger kept as the
//      sole differentiator. Competitive-frame summary and positioning sentence
//      updated to match.
//    - POSITIONING_STATEMENT rewritten to span Decide and Draft. Frame held: the
//      paths make the tool useful daily, the ledger makes it compound.
//
// 4. POOLED CAP COPY MADE CONSISTENT (Product copy)
//    - The monthly cap is one pooled counter. Every fresh session, Decide or
//      Draft, bumps it through guardedSend. Five surfaces still read "decisions".
//    - Aligned to "decisions or drafts": sidebar tier line (free and guest), Home
//      guest banner (count and used states), Home free banner (both states), and
//      both cap-block notices in guardedSend and startSeededDecision.
//    - Em dash removed from the two cap-block notices. Ledger upsell tail kept;
//      the ledger is fed by reviewed decision outcomes, not drafts, so that
//      framing stays accurate.
//
// 5. EM DASHES REMOVED FROM PUBLIC-FACING TEXT (Voice)
//    - All displayed copy cleared of em dashes: home, profile, stats, pricing,
//      share and auth modals, ghost-ledger preview, setNotice strings, template
//      descriptions, and the "Investor Update" label. Replaced with commas,
//      colons, periods, or parentheses by context.
//    - Empty-value placeholder glyph changed from em dash to en dash (the "no
//      value" mark in stat tiles, tables, and exports). Not an em dash.
//    - Left as-is on purpose: system prompts, template rail/obligations, and code
//      comments. These are model-facing or developer-only, never displayed, and
//      the model's own output is already governed by the no-em-dash voice.
//
// 6. CATEGORY CHIPS MADE VISIBLE (UX)
//    - On the dark theme the Chip fill matched its container (--edge on --edge)
//      and the border (--line) barely cleared the page, so category pills read as
//      plain text links. Chip now fills with --line (one step lighter than the
//      container) and borders with --meta, so the bubble is unmistakable on both
//      themes. Tap target enlarged (padding 6/12 to 7/13, font 11.5 to 12).
//    - Component-level fix: applies to both home category lists (Decide example
//      packs, Draft document types) and the share-modal export chips.
//    - Kept bubbles over one-per-line menu rows: items are short and scannable,
//      and bubbles stay compact on mobile. Menu rows remain the pattern for the
//      longer, described lists on the Templates page.
//
// 7. SEARCH FIELD PERSISTS ACROSS TAB SWITCHES (UX)
//    - On Templates view, switching from Decide to Draft closed the search field
//      and cleared the query. Changed: search field and query now persist across
//      tab switches within Templates. Only clear when leaving Templates (navigate
//      away) or after selecting a template/document (which navigates anyway).
//    - Tab-change effect no longer clears query (setQ). Still resets accordion
//      state (setShowAll, setDraftCatOpen) as those are UI conveniences.
//
// ============================================================================
//
// ============================================================================
// WorkOutput — build v93
// Three targeted improvements: v91 virality + moat changes carried forward,
// plus sidebar restructure to distinguish Decide and Document workflows.
//
// 3. SIDEBAR WORKFLOW CLARITY — v92 (Navigation)
//    - NAV_MAIN replaced with NAV_DECIDE and NAV_DOCUMENT cluster arrays.
//    - "Workspace" nav label renamed to "Decide". Cluster labels communicate workflow.
//    - SidebarV72: two labeled clusters with dividers replace the flat nav list.
//    - Settings standalone below nav clusters. Recent decisions scoped to decide only.
//    - Cluster and NavItem components added.
//
// 4. SIDEBAR DOCUMENT ENTRY POINTS — v93 (Navigation)
//    - "New document" ghost button added below "New decision" in the sidebar CTA pair.
//      Both workflow entry points always one click from anywhere in the app.
//    - NAV_DOCUMENT expanded to two items:
//        "New Document"     → view="Draft"        (templates / start a new draft)
//        "Document Archive" → view="DraftLibrary" (all saved draft sessions)
//    - DraftLibraryView: new view parallel to LibraryView. Shows all draft sessions
//      (workflowType === "draft"), with title, status (Complete / Drafting / In progress),
//      relative date, template label, "Ready" badge when hasDoc, and delete action.
//      Search shown when archive has >5 entries. Empty state links to Draft templates.
//    - view==="DraftLibrary" wired into the main render switch.
//
// ============================================================================
//
// 1. CALIBRATION CARD THRESHOLD RAISED (Virality)
//    - ShareModalV72: hasLedger threshold raised from recorded>=1 to recorded>=3.
//    - At n=1 or n=2 the held-rate is not statistically meaningful. Surfacing a
//      shareable "track record" at n=1 overstates what the ledger has earned and
//      risks undermining the credibility of the metric with sophisticated users.
//    - Below threshold (n=1, n=2): a ledger-building nudge block replaces the card.
//      Shows a three-dot progress indicator (n/3) and sets the return expectation:
//      "At 3 reviewed outcomes, your calibration card becomes shareable."
//    - At threshold (n>=3): the calibration card renders with actual heldRate, CI
//      band, and SVG download. The metric is earned before it is shared.
//    - ledgerBuilding flag added; ledgerMature flag removed (all >=3 states are
//      treated as mature since the threshold already filters weak signal).
//
// 2. GHOST LEDGER PREVIEW IN FIRST-COMMIT MODAL (Moat / Retention)
//    - GhostLedgerPreview component added. Renders a phantom calibration profile
//      state representing n=10 decisions: headline held-rate (74%), three category
//      bars seeded from the real decision type, decisions/reviewed count.
//    - Visual treatment: dashed border, hatched background, blurred/dimmed rate
//      numeral, low-opacity category bars, "Preview" watermark label. Ghost state
//      is unmistakably not real data.
//    - Injected into FirstCommitShareModal, positioned between the commit card and
//      the return-nudge copy. Animated in with a 120ms delay (opacity + translateY).
//    - Purpose: the ledger is the moat. New users cannot feel a compounding asset
//      that does not yet exist. The ghost preview makes the future state visible
//      at session one — the shape of what they are building, not a generic benchmark.
//    - FirstCommitShareModal copy updated: "Return in 7 days to record whether your
//      assumption held. That single data point starts your calibration." The share
//      CTA moves below the preview rather than above it.
//    - Eye icon added to lucide-react imports (was not previously imported).
//
// ============================================================================
//
// 1. DYNAMIC DRAFT TOKEN SIZING (Token efficiency)
//    - DOCUMENT_TEMPLATES each carry a `depth` field: short | medium | full.
//    - maxTokensForMode reads the selected template's depth for Draft sessions:
//      short -> 3000, medium -> 4500, full -> 6000 (was a flat 6000 for all drafts).
//    - documentDepthForId resolves the depth; free-form drafts (no template)
//      default to full to avoid truncation.
//    - Cuts output budget on inherently short documents (retros, job descriptions,
//      case studies) with no quality loss; long documents (PRDs, memos, proposals)
//      keep the full budget.
//
// 2. THREE-DAY SOFT REVIEW CHECK (Retention / moat)
//    - SOFT_CHECK_DAYS = 3. buildReviewQueue now also returns a `softCheck` set:
//      decisions committed >= 3 days ago, not yet at the full review horizon, with
//      no soft check done and no outcome recorded.
//    - Home shows a low-friction "does this still feel right?" prompt with two
//      answers: "Still feels right" (marks soft check done, positive lean) or
//      "Not sure, review it" (brings the full outcome review forward to now).
//    - recordSoftCheck handler persists ds.softCheck; the index meta carries it.
//    - The soft banner only appears when no full review is already due, to avoid
//      stacking competing prompts. Lowers activation energy on loop closure, the
//      single highest-leverage retention behavior.
//
// ============================================================================
// WorkOutput — build v89
// Seven targeted improvements across virality, UX, monetization, and reliability.
//
// 1. FIRST-COMMIT SHARE SURFACE (Virality)
//    - FirstCommitShare modal fires immediately after the first Commit in a session.
//    - Shares a lightweight "decision structure" snapshot: template used, decision
//      type, top assumption. No personal content.
//    - Activates at n=1 (not gated on ledger n>=2).
//    - firstCommitShareOpen state added. Fires once per session via firstCommitFiredRef.
//    - FirstCommitShareModal: shows the structure card + "Share template" CTA + dismiss.
//
// 2. FRAMEWORK SHARE LANDING STATE (Virality)
//    - ?framework= links now land on a thin orientation screen (FrameworkLandingView)
//      before dropping into Home.
//    - Shows template name, decision type, and a "Try this template" CTA.
//    - Replaces the silent notice-banner-only landing with an invitation.
//    - frameworkLanding state { title, decisionType, fw } drives the view.
//    - "Try this template" seeds the session and clears the landing view.
//
// 3. CALIBRATION CARD AT n=1 (Virality / Retention)
//    - ShareModalV72 calibration card now activates at recorded >= 1 (was >= 2).
//    - At n=1, framing changes: "1 decision tracked. Return in X days to record
//      whether your call held." — sets the return-visit expectation explicitly.
//    - heldRate display suppressed at n=1 (not meaningful); pending label shown instead.
//
// 4. HOME SCREEN ENTRY SIMPLIFICATION (UX)
//    - "Decide from a template" and "Draft from a template" action cards collapsed
//      to a single "Start from a template" card on first visit (sessionIndex.length === 0).
//    - Both cards visible once user has at least one session (complexity earned).
//    - Decision cost at entry reduced for new users.
//
// 5. PROGRESSIVE TEMPLATE DISCLOSURE (UX)
//    - TemplatesView: first-session state shows top 3 recommended templates as chips
//      with a "See all templates" expansion — not the full accordion.
//    - Accordion shown immediately for returning users (sessionIndex.length > 0).
//    - Applies to both Decide and Draft tabs.
//
// 6. MODE INDICATOR IN SESSION HEADER (UX)
//    - SessionModeBar component added: shows Clarify / Explore / Commit pills with
//      the active mode highlighted, mounted above the message thread in SessionView.
//    - Makes the session arc visible without requiring the user to read the response prefix.
//    - currentMode prop threaded into SessionView.
//
// 7. REACT HOOK CORRECTNESS — TOOLS SHEET COMMIT STAGE (Reliability)
//    - Inline useState inside the IIFE render callback in the tools sheet Commit stage
//      removed. This was a hooks-rules violation that could produce unstable renders.
//    - Extracted into a named CommitMoreOptions sub-component with its own state.
//
// ============================================================================
// WorkOutput — build v88
// Fix: Home screen Draft tab now shows document categories, not decision categories.
// Root cause: the "Start from a category" PACKS accordion was rendering
// unconditionally regardless of homeTab. On the Draft tab it showed Personal,
// Founder, Product Manager, etc. — decision role categories — instead of
// document types.
// Fix: PACKS accordion gated on homeTab === "decide". New document category
// accordion shown when homeTab === "draft", with document-type categories:
// Product & Engineering, Strategy & Leadership, Hiring & People,
// Sales & Client-Facing, Finance & Operations, Operations.
// Each category opens to chips that seed a Draft session with the template's
// intake question and selectedTemplate id wired through.
// onDraft prop updated to accept optional opts (for selectedTemplate passthrough).
// ============================================================================
// WorkOutput — build v87
// Fix: Draft tab now correctly shows document categories, not decision categories.
// Root cause: React.useState(initialTab) ignores prop changes after first mount.
// When user navigates between "templates" (decide) and "Draft" views, TemplatesView
// is reused — initialTab prop changed but tab state did not update.
// Fix: useEffect syncs tab state whenever initialTab prop changes.
// Also fixed: TabBtn had duplicate borderBottom key in inline style object
// (border:"none" followed by borderBottom:...) — removed the redundant border:"none".
// ============================================================================
// WorkOutput — build v86
// Draft tab: category accordion replaces flat grid.
// DOCUMENT_TEMPLATES grouped into 7 named categories with blurb and item count.
// Default state: Product & Engineering open. Search still works — shows flat
// results when a query is active, accordion when no query.
// draftCatOpen state added to TemplatesView; resets to Product on tab switch.
// ============================================================================
// WorkOutput — build v85
// Three changes over v84:
//
// 1. DRAFT IN HOME + SIDEBAR
//    - Home input card: Decide / Draft tab switcher. Selects workflow, updates
//      placeholder, hint text, and routes submit to onDraft or onStart.
//    - Home action cards: "Decide from a template" and "Draft from a template"
//      replace the single "Start from a template" card.
//    - Sidebar: "New decision" button split into Decide + Draft. Draft routes
//      to the new "Draft" view (TemplatesView on draft tab).
//    - NAV_MAIN: "Draft" nav item added (FileText icon, routes to Draft view).
//    - TemplatesView: accepts initialTab prop so Draft view opens on draft tab.
//
// 2. EXPORT CONFIRMATION FOR DRAFT SESSIONS
//    - exportConfirm state added to root component.
//    - DocumentView export handlers check workflowType === "draft" and show
//      ExportConfirmModal instead of downloading immediately.
//    - ExportConfirmModal: "Export" or "Keep working" choice. Prevents token
//      spend on an unwanted export mid-clarification.
//    - Share modal export chips unchanged (non-draft sessions unaffected).
//
// 3. DRAFT CLARIFY: REMOVE SINGLE-TURN RESTRICTION
//    - SYSTEM_PROMPT_DRAFT: "one question max" replaced with "ask as many
//      questions as needed across multiple turns until you have what you need."
//    - inferModeFromMessage: hard Commit-after-turn-1 short-circuit removed.
//      Draft sessions now pass currentMode through; the model's own Mode
//      declaration governs when to switch from Clarify to Draft.
//    - All code comments referencing "one clarifying turn" updated.
//
// ============================================================================
// WorkOutput — build v84
// Decide / Draft split. Two distinct workflows sharing one engine.
//
// DECIDE (existing): Clarify → Explore → Commit. Decision templates. Full
//   exploration loop. Ledger-tracked. Unchanged from v83.
//
// DRAFT (new): Clarify (as many turns as needed) → Draft (complete document).
//   Document templates. Completeness-gate model. No exploration loop.
//   workflowType:"draft" on decisionState routes to SYSTEM_PROMPT_DRAFT,
//   bypasses mode inference exploration, always produces 6000-token output.
//
// Engine changes:
//   - emptyDecisionState gains workflowType field
//   - buildSystemPrompt branches on workflowType:"draft" → SYSTEM_PROMPT_DRAFT
//   - inferModeFromMessage short-circuits on workflowType:"draft"
//   - maxTokensForMode always returns 6000 for draft sessions
//   - artifactDefinitionFor combined: checks TEMPLATE_OUTPUT_CONTRACTS then
//     DOCUMENT_OUTPUT_CONTRACTS; frame label adjusts accordingly
//   - startSeededDecision applies workflowType from opts
//
// Catalog:
//   - DOCUMENT_TEMPLATES: 18 document templates across Product/Engineering,
//     Strategy/Leadership, Hiring/People, Sales/Client-Facing, Finance/Operations
//   - DOCUMENT_OUTPUT_CONTRACTS: full completeness contracts for all 18
//   - Old TEMPLATE_OUTPUT_CONTRACTS and TEMPLATES unchanged
//
// UI:
//   - TemplatesView rebuilt with Decide / Draft tabs
//   - Draft tab shows document templates with "Draft" badge and "Draft" button
//   - onDraft handler wires workflowType:"draft" into the session
//   - CATEGORY_TO_DOMAINS unchanged; Draft sessions use no domain depth
//     (document completeness is the constraint, not analytical domain)
//
// ============================================================================
// WorkOutput — build v83
// Expanded template catalog: 32 → 53 templates.
// New templates added across five areas:
//   Hiring & People: Performance Conversation Prep, Promote or Manage Out,
//     Skip-Level Meeting Prep, Reference Decision, Reference Check Debrief,
//     Promotion Case (6 new)
//   Personal: Difficult Conversation Planner, Apology Decision, Offer Negotiation
//     Prep, Should I Leave, Relationship Boundary Decision, Burnout Triage,
//     Career Pivot Assessment, Relocation Decision, Health Decision, Aging Parent
//     Care Decision, Major Purchase Decision (11 new — Major Purchase updated
//     from thin prior version)
//   Management & Leadership: Client Escalation Response, Board Meeting Prep,
//     Investor Update: Bad News, Founder Conflict (4 new)
// All new templates carry full output contracts in TEMPLATE_OUTPUT_CONTRACTS.
// CATEGORY_TO_DOMAINS updated: Management category added.
// STRUCTURES gallery updated to 53 entries with seeded use counts.
// No existing templates modified. No duplicate IDs.
// ============================================================================
// WorkOutput — build v82
// Two changes over v81:
//   Rename — "structure" replaced with "template" across all user-visible strings.
//            Internal variable names (STRUCTURES, shareStructure, etc.) unchanged.
//   Templates — artifactDefinitionFor expanded from a one-line label to a full
//            per-template output contract. Each of the 32 templates now injects:
//            (1) the decision rail (stage sequence the model must follow),
//            (2) required output sections by name (all must appear in Commit output),
//            (3) an analytical obligation the model must satisfy before the output
//            is complete. Zero user friction — all prompt-side via TEMPLATE_OUTPUT_CONTRACTS.
//            Templates without a contract entry degrade gracefully to the prior
//            one-line label. No behavior change for non-template sessions.
// ============================================================================
// WorkOutput — build v81
// Seven improvements over v80:
//   Build 4  — Review nudge fires at 7 days (down from 14). User setting in new
//              Settings view (sidebar nav entry) controls the horizon (1–30 days).
//              Horizon persisted at wo:settings:reviewHorizonDays. Sidebar badge
//              reflects live dueCount against the user's chosen horizon.
//   Build 4b — Free tier raised: 5 decisions / month, 20 turns per decision.
//   Build 6  — Share modal rebuilt: "Share structure" (framework only) is the only
//              sharing option. "Share full decision" removed. The share surface now
//              promotes the calibration card (held-rate + n) as the shareable
//              track-record artifact when ledger has enough signal (n >= 2).
//   Build 7  — Upgrade message anchored to ledger value, not to cap friction.
//              Message fires after a held assumption registers, after the 3rd commit,
//              and after a first outcome review, in addition to cap-block.
//   Positioning — Competitive positioning statement added as a product constant
//              (POSITIONING_STATEMENT). Not rendered in UI; governs product
//              framing.
//   Build 10 — Pending decisions queue promoted from Home-only to a persistent
//              sidebar indicator badge on the "Workspace" nav item when count > 0.
//   Build 11 — Team ledger preview panel added for Enterprise tier. Shows
//              team-level committed count, tracked assumptions, and held rate
//              (counts only, no content) as a read-only aggregate. Gated behind
//              the existing `team` feature flag.
// ============================================================================
// WorkOutput — build v80 (prompt caching: system prompts and static instruction
// prefixes now carry cache_control: { type: "ephemeral" } on all seven secondary
// API call sites. Coverage:
//   1. classifyInput (Haiku)              — system prompt cached
//   2. classifyCommitSignalsModel (Haiku) — system prompt cached
//   3. detectContradiction (Haiku)        — system prompt cached
//   4. generateDependencies (Sonnet)      — instruction prefix cached, context tail uncached
//   5. generateFailureSimulation (Sonnet) — instruction prefix cached, context tail uncached
//   6. generateBenchmark (Sonnet)         — instruction prefix cached, context tail uncached
//   7. generateAllIntelligence (Sonnet)   — instruction prefix cached, context tail uncached
// The main turn was already covered: buildSystemPrompt emits cache_control on all
// cache:true blocks, and systemBlocks maps them correctly. runOverlay already
// caches the digest block. No behavior change — cache hits are transparent.
// Cost impact: ~70-80% reduction on repeat input tokens within 5-minute windows.
// ============================================================================
// WorkOutput — build v78.8 (template-use bug fix: a template now always starts a
// fresh decision, sends its seed exactly once, and lands the user in the new chat)
// ============================================================================
// v78.8 — fix. Using a template while a chat was active double-added the seed
// message and left the composer typable but not submittable. Cause: the deferred
// seed-send effect was guarded on rawHistoryRef.current.length === 0, a ref whose
// mutation does not re-render, so the guard read a stale value and the effect could
// fire twice; the two overlapping sends both held the loading flag, blocking submit.
// Fix: the effect now consumes pendingSeedRef atomically (read, then immediately
// null) so it fires exactly once per armed seed. startSeededDecision also switches
// to the Session view immediately, so a template click lands in the new chat instead
// of stranding the user on the templates page. Behavior is now: a template always
// starts a fresh decision; if one is in progress it is parked pending (with the
// existing cap check) and a new seeded session opens.
// ============================================================================
// WorkOutput — build v78.7 (templates search UX: field opens under the Search
// button; Trending and recommendation rows hide while search is open)
// ============================================================================
// v78.7 — UI. The search field now renders directly beneath the Search button in
// the header control column rather than full-width above the grid. Opening search
// hides the Trending, Recently-used, and Recently-useful rows so the view collapses
// to the search field plus the filtered "All templates" grid. Closing clears the
// query and restores the rows.
// ============================================================================
// WorkOutput — build v78.6 (templates page: Search button added, highlighted, left
// of New Structure)
// ============================================================================
// v78.6 — UI. A Search control is added to the Templates header as the primary
// (highlighted) action, with New Structure demoted to a ghost button. Search toggles
// a field that live-filters the structures by name or decision type. The Search icon
// is added to the lucide-react import (it was not previously imported).
// ============================================================================
// WorkOutput — build v78.5 (template catalog expanded 6 -> 32 to expose the full
// domain depth; CustomerSuccess category mapping added)
// ============================================================================
// v78.5 — content. TEMPLATES grew from 6 to 32 entries, weighted toward Product,
// Sales, Customer Success, AI Governance, Legal, and Operations, so the ten
// DOMAIN_BLOCKS are actually reachable from the gallery. Every template label has a
// 1:1 match in STRUCTURES and every category resolves through CATEGORY_TO_DOMAINS to
// a real domain block (verified). CustomerSuccess was added to CATEGORY_TO_DOMAINS;
// without it the CS templates would have resolved to no domain depth. New gallery
// rows are authored "WorkOutput" with tapering use counts.
// Also in this pass (pre-handoff audit): removed dead code — encodeTemplateShare and
// decodeTemplateShare (superseded by the inline btoa/atob framework-share path),
// estimateHistoryTokens, COMPRESSION_TOKEN_THRESHOLD, and the MenuIcon SVG (replaced
// by the lucide Menu icon). No behavior change from the removals.
// ============================================================================
// WorkOutput — build v78.4 (the Chat mode is renamed "Clarify" through the whole
// stack: enum value, model prompt, metrics keys, and stored data, with a legacy
// read/write migration. Function-shaped identifiers are deliberately kept.)
// ============================================================================
// v78.4 — supersedes the v78.3 presentation-only relabel. The canonical mode value
// is now "Clarify" everywhere it is a value, not just where it is shown:
//   - Model prompt emits and the parser expects "Mode: Clarify". The parser still
//     accepts a legacy "Mode: Chat" and normalizes it to "Clarify", so streamed or
//     stored history written by an older build still reads correctly.
//   - Mode-inference signal variable chatSignals -> clarifySignals; the inference
//     return values and all comparisons use "Clarify".
//   - Metrics keys (modeMix, byMode) are keyed "Clarify"; both read paths fold a
//     legacy "Chat" value into the Clarify bucket, so historical sessions count
//     correctly with no separate backfill.
//   - Session persistence: saveSession normalizes currentMode at the write boundary,
//     so every session migrates to "Clarify" the next time it is saved; loadById
//     also normalizes on read for sessions not yet re-saved. No bulk migration and
//     no schema change.
//   - MODE_LABEL keeps a "Chat" -> "Clarify" alias purely as a defensive lookup for
//     any legacy value that reaches a label render.
// KEPT AS CODE (function-shaped identifiers, per the rename rule): SYSTEM_PROMPT_CHAT
//   (prompt constant), BackToChat (component), and the chatScale / setChatScale /
//   setChatScalePersist useState pair plus its wo:chat:scale storage key. These are
//   font-scaling UI state, unrelated to the mode, and renaming them is churn with no
//   behavioral effect.
// ============================================================================
// WorkOutput — build v78.2 (fix: Intelligence was a navigation dead-end; add an
// explicit return to the chat)
// ============================================================================
// v78.2 — UI fix, no engine change. The Advanced/Intelligence view had no way back to
// the conversation: no nav item routes to the active Session, and the scaffolded
// goSimple() exit was never wired to any control. AdvancedView now takes an onBack prop
// and renders a "Back to chat" control at the top and bottom of the view. onBack resets
// advanced mode and returns to the Session thread. The intel run stays attached to the
// decision (it persists to decision state on run, per v77), so returning loses nothing.
// ============================================================================
// WorkOutput — build v78.1 (chat-page tools: Explore promoted to the primary
// clarify action; Intelligence moved from the sidebar to the tools panel)
// ============================================================================
// v78.1 — UI change, no engine change.
// 1. In the clarify-stage tools panel, "Lay out the options" (Explore) is now the
//    primary highlighted action on top; "Skip the questions, draft now" (Commit) drops
//    to the secondary ghost button below it. The default nudge is now toward exploring
//    options before drafting.
// 2. "Open Intelligence" is added to the clarify stage and removed from the sidebar.
//    Intelligence is reached from the chat-page tools panel (clarify and explore
//    stages), where the decision context it needs already exists. Tradeoff: pro and
//    enterprise users can no longer open Intelligence from outside an active session;
//    it is now session-scoped by design.
// ============================================================================
// WorkOutput — build v78 (code-split + hosting plan consolidated and the v77
// analytics changes threaded through it; plan only, no behavior change)
// ============================================================================
// v78 — documentation only. No code paths change. A single CODE SPLIT + HOSTING PLAN
// section (below the version history, above the imports) replaces the migration intent
// that was scattered across seam comments. It maps the module tree for the split, the
// seam-to-Supabase mapping for hosting, and where each of the four v77 analytics changes
// lives after the split and how it migrates: intervals stay client-side and untouched;
// the bias caveat stays while its real correction becomes a server-side sampled-review
// job; intel snapshots move to a decisions/intel_snapshots store where the validation
// pass can finally join forecast to outcome; the windowing spec becomes the metrics_events
// table plus windowed views. Everything still ships as this one artifact for now.
// ============================================================================
// WorkOutput — build v77 (analytics honesty pass: uncertainty intervals on hold
// rate + recording-bias caveat + intel snapshots persisted and timestamped +
// site-funnel windowing spec)
// ============================================================================
// v77 — four changes over v76. No new surfaces; the existing analytics get more
// honest about what they can and cannot claim.
// 1. UNCERTAINTY ON THE HEADLINE RATE. _heldCI computes a 95% Wilson score interval
//    on the held rate (held=1, partial=0.5), gated at the same 2-outcome floor the
//    engine already uses. buildLedgerMetrics carries heldRateCI and a per-band ci on
//    calibration. The "Calls that held" tile shows the likely range and n; each
//    calibration bar shows its band interval. The point estimate is unchanged. This
//    closes the gap between "does not fabricate" and "honest about uncertainty": a
//    3-outcome rate no longer reads as settled as a 30-outcome one.
// 2. RECORDING-BIAS CAVEAT. One honest line under the headline tiles. Recorded
//    outcomes are not a random sample (people log wins more than losses), so the rate
//    is framed as a logged track record, not a success probability. Protects the most
//    exposed number in the product when a sophisticated reader interrogates it.
// 3. INTEL SNAPSHOTS PERSISTED. runIntel stamps each generated layer with a timestamp
//    and the turn it was generated at, then saves immediately. Previously intel lived
//    only in a ref and was lost if the user ran it and left without sending. You cannot
//    grade a forecast you did not keep; this makes a later intel-vs-outcome validation
//    pass possible. mergeDecisionState passes the new fields through; the full blob
//    already persists decisionState, so no schema migration.
// 4. SITE-FUNNEL WINDOWING SPEC. The httpSink template now carries a precise spec for
//    per-actor identity, time-windowed reads, and cohort attribution. The sandbox
//    K-factor stays a labeled lifetime estimate and internal-only until that lands.
// ============================================================================
// WorkOutput — build v76 (template catalog restored + account-only profile sync +
// start-from-example parks the in-progress decision as pending)
// ============================================================================
// v76 — three changes over v74.1:
// 1. TEMPLATES catalog restored (was an empty-array stub). Six entries aligned to the
//    gallery structures, each carrying category/label/desc/rail/intake. A gallery
//    "Use" now resolves the structure name to a catalog id and stamps
//    decisionState.selectedTemplate, so selectDomains adds domain depth and the
//    ACTIVE ARTIFACT line fires. Unmatched names degrade to decision-type + keyword
//    detection with no crash.
// 2. Manual profile export/import removed (residual dead params, unused refs, and the
//    orphaned profilePortability entitlement). The profile is intended to follow the
//    account and load on login from any device with no manual step; that sync is the
//    deferred server-side swap, not a client feature.
// 3. Starting a decision from a template while a chat is already in progress now PARKS
//    the current decision as pending and opens a fresh one, instead of seeding into
//    the running chat. Parked decisions carry a pending flag in their index meta and
//    surface in a new "Pending decisions" list on Home; reopening one clears the flag.
//    The seeded send is deferred to a post-render effect keyed on the new sessionId
//    because sendMessage persists by the sessionId state, not a ref. A read-only
//    capacity pre-check prevents parking when the new decision would be cap-blocked.
// ============================================================================
// WorkOutput — build v74.1 (post-audit hardening over v74)
// ============================================================================
// v74.1 — full-file audit pass. No feature changes; correctness and cleanup only.
// 1. TEMPLATES was referenced by selectDomains and artifactDefinitionFor but never
//    defined — a reachable ReferenceError on the framework-share and template-share
//    landings (both set selectedTemplate truthy). Defined as an empty-array stub: the
//    crash is gone with no behavior regression. The real catalog still needs restoring
//    to re-enable template-driven domain depth; the stub comment says what it needs.
// 2. The Free pricing card advertised "10 decisions / month" while TIER_POLICY enforces
//    5. The card now reads the policy, so the page and the enforcement agree.
// 3. The scorecard/card memos keyed on [activeDoc, lastReasoning] but read ref state
//    (decisionStateRef / rawHistoryRef) absent from the deps, risking stale output after
//    an async decision-state update. Now computed each render (cheap pure functions).
// 4. The cap_block metric tagged tier === "free" ? "free" : "guest" inside a branch guest
//    can never reach (guest is gated to AuthGate upstream). Collapsed to the honest "free".
// 5. Removed dead code: deriveCard (superseded by buildDecisionCard), detectCommitGates
//    (readiness dots use assessReadiness), CAT_LABELS, PERSPECTIVE_ROLES, and the unused
//    SYSTEM_PROMPT_CORE alias; deduped CAT_LABEL to alias ASSUMPTION_CAT_LABEL.
// ============================================================================
// WorkOutput — build v74 (beta usage policy: 5 decisions/month + 5 turns per
// decision on the logged-in free tier; full analytics minus insights; limits seam)
// ============================================================================
// WorkOutput v74 — usage policy + analytics/insights split (over v73.12)
// Coding-efficiency moves toward the GitHub/Vercel/Supabase production build:
// 1. TIER_POLICY: quantitative caps (maxDecisionsPerMonth, maxTurns) become a single
//    source of truth beside the MODELS config. The scattered hardcoded "2 free"
//    literals in TopBar and Home now read from policy. One object to change.
// 2. LIMITS seam: the decision counter routes through ACTIVE_LIMITS, the same seam
//    pattern as store / ACTIVE_SINK / API_ENDPOINT. The cap is a rolling 30-day window
//    anchored at sign-up or purchase (the first time the user leaves guest). The anchor
//    is stored once; each counter key is the window index since the anchor, so the
//    count resets 30 days after the anchor and every 30 days after, with no cron.
//    Supabase migration is a one-line swap of ACTIVE_LIMITS to a server-side adapter
//    that stores the anchor on the user row. No call-site changes.
// 3. canCreateDecision(tier): one gate, used by guardedSend. Server-side enforcement
//    later swaps the seam, not the gate or its callers.
// 4. Turn cap: 5 user turns per decision on guest/free. The final allowed turn is
//    forced to Commit so a capped decision always yields an artifact (and a clean beta
//    data point) instead of dead-ending. The 6th turn is blocked in guardedSend.
// 5. Decision cap: 5 new decisions per calendar month on free (2 on guest). A blocked
//    create routes to pricing and fires a cap_block funnel event.
// 6. Analytics/insights split: fullAnalytics drops to rank 1 so logged-in free gets
//    the full analytics surface; a new insights feature (rank 2, Pro) gates the
//    interpretive layer (profile blindspot + break-pattern rows, the overconfidence
//    read) and the advanced toolkit (already advancedTools-gated). insight_locked_view
//    fires when a non-entitled tier opens an insight surface.
// Both new events (cap_block, insight_locked_view) route through the existing metrics
// sink and are weighted equally (1:1) into an upgrade-pressure funnel in Site metrics.
// read() keeps them out of the share/open/create K-factor, so that figure stays clean.
// ============================================================================
// WorkOutput — build v73.12 (work/personal: library filter + per-row swap, separate + compare analytics)
// ============================================================================
// WorkOutput v70 — continuity + hardening (over v69)
// 1. Loop A continuity: readLoopMetrics now folds legacy untagged v68 events into
//    the COMBINED totals (read-side, zero writes), so the combined counts stay
//    continuous across the v68->v69 key-scheme change. Per-loop figures stay clean
//    from v69 forward because v68 mixed decision and framework events under one
//    untagged key and cannot be honestly attributed. Legacy bucket shown in Advanced.
// 2. FAST model preflight: modelPreflight now probes FAST too and falls back to the
//    resolved PRIMARY on a model-resolution failure, so classify/summary/contradiction
//    no longer fail silently on a stale FAST string.
// 3. Profile portability: the decision profile follows the account, not the device.
//    It is synced server-side and loaded on login from any device with no manual
//    export or import step. Manual file export/import is deliberately not offered;
//    the compounding asset must be present automatically when the user signs in.
//    (v75: the residual manual export/import params and the profilePortability
//    entitlement were removed; sync is the only portability path.)
// 4. Framework-link privacy: the structure-only link's title no longer reads any
//    document-derived text (decision type or generic label only).
// 5. Export escaping: HTML export fully escapes &, <, >, and quotes (was "<" only).
// 6. Metrics seam: recordMetric/readLoopMetrics now dispatch through a pluggable
//    ACTIVE_SINK (default = shared storage). Migrating to a real analytics backend is
//    a one-line binding change via the httpSink template; no call site changes.
// 7. Persistence seam: all reads/writes route through `store` (default adapter =
//    artifact-host window.storage). Migrating to Supabase is a one-line binding
//    change of ACTIVE_STORE to an adapter with the same get/set/delete/list contract;
//    no edits to profile, session, share, or metrics call sites. Single-file, prep for
//    the Vercel/Supabase handoff. Note for that meeting: the keyless calls to
//    api.anthropic.com only work on the artifact host and will need a server-side
//    proxy holding the API key once off-host.
// 8. API endpoint seam: all 10 Anthropic calls route through API_ENDPOINT (default =
//    the keyless artifact endpoint). Pointing the client at an off-host proxy is then
//    a one-line change; the proxy holds the key and passes the SSE stream through.
// 9. Two metric scopes: USER (My stats, everyone, own data, derived from sessions +
//    profile) and SITE (Site metrics, the growth funnel, admin-gated via the access
//    role seam, read-only marketing/viewer later). Sidebar entries; ?as= previews
//    roles. UI gating is an affordance only — real enforcement is server-side.
// Carried from v69: fence-tolerant document extraction (extractDocumentBlock),
//    loop-tagged metrics, create-on-first-send for both loops.
// ============================================================================
// WorkOutput v73 — pivot to the private decision ledger (the wedge). Two
// load-bearing additions on the existing engine; nothing restructured.
//  A. OUTCOME CAPTURE. Every commit records its load-bearing assumption and enters
//     a Review queue with a "due" horizon. You return later and record whether the
//     assumption HELD, PARTIALLY HELD, or BROKE. That result folds into wo:profile
//     (outcomes + breakByCategory), turning the thin structural profile into a
//     compounding ledger. Trigger flow = a dedicated Review surface with a due signal.
//  B. SCOPE WALL. Each committed decision is classified work vs personal on the
//     existing per-user (shared:false) vs cross-user (shared:true) seam. Fails safe
//     to personal. Low-confidence stays private until the user confirms it is work.
//     Personal never surfaces. Only confirmed/high-confidence WORK is ever eligible
//     to roll up to the deferred aggregate team layer, and only as counts — never a
//     title, content, or row. The wall is the keystone; this build holds it.
//  PROVISIONAL (marketing has not set final form): the Review horizon (14 days) and all
//     new surfaces/flows are deliberately modular so the surface can be restyled without
//     touching the engine. Scope and the load-bearing assumption are now chosen by a
//     bounded model call at commit, with the keyword/first-item heuristic kept as the
//     synchronous, offline-safe floor so the privacy wall never depends on a network call.
//     The team aggregate dashboard, integrations, and the off-host migration remain deferred.
// ============================================================================
// CODE SPLIT + HOSTING PLAN (v78)
// ============================================================================
// Status: PLAN ONLY. Nothing is split in this build. Everything still ships as this
// single artifact. The seams below already make the split mechanical, so this section
// is the canonical map for when it happens, not a change to the current file.
//
// WHY THIS IS SAFE TO DEFER. Integration already runs through four named seams:
// store (persistence), ACTIVE_SINK (metrics), ACTIVE_LIMITS (usage caps), and
// API_ENDPOINT + MODELS (model calls). Every call site routes through one of these.
// The split moves code across files; it does not touch those boundaries. Hosting swaps
// what sits behind them. The two steps are independent and ordered: split first (no
// behavior change), host second (behavior-enabling).
//
// 1. MODULE MAP (what this file becomes under src/).
//    - lib/engine: the real engine, system prompt assembly, mode inference, readiness,
//      signal extraction. Pure or model-calling, no UI.
//    - lib/decision: emptyDecisionState, mergeDecisionState, the scope wall, outcome
//      capture. Pure.
//    - lib/metrics: _mean/_median/_heldRate/_heldCI, buildLedgerMetrics,
//      buildUserMetrics, plus the sink (sharedStorageSink/httpSink/ACTIVE_SINK) and
//      recordMetric/readLoopMetrics. Pure engine + one seam.
//    - lib/intel: generateDependencies/FailureSimulation/Benchmark/AllIntelligence.
//      Model-calling, returns plain data.
//    - lib/profile: deriveProfileReads, recordOutcomeToProfile, formatProfileDisplay.
//    - lib/store, lib/limits, lib/api: the seams, one file each.
//    - ui/views/*, ui/components/*, and the root WorkOutput shell.
//    Pure modules (metrics, decision, profile) move first; they have no dependencies and
//    carry the analytics. UI moves last.
//
// 2. HOSTING TARGET. Front end builds (Vite or Next) and deploys to Vercel. Supabase
//    provides auth, Postgres, RLS, and edge functions. Seam-to-service mapping:
//    - store        -> Supabase rows. Per-user (shared:false) is RLS-scoped to the user.
//                      Shared (shared:true) is the shared-doc + metrics path. This is
//                      also the deferred account-follows-profile sync: profile loads on
//                      login from the user row, no manual export.
//    - ACTIVE_SINK   -> httpSink into a metrics_events table (or an edge function).
//    - ACTIVE_LIMITS -> server-side enforcement on the user row; the rolling window
//                      anchor moves off the client so caps cannot be reset by clearing
//                      storage.
//    - API_ENDPOINT  -> a server proxy / edge function so model keys never reach the
//                      client. MODELS config moves server-side with it.
//
// 3. WHERE THE v77 ANALYTICS CHANGES LIVE AFTER THE SPLIT, AND HOW THEY MIGRATE.
//    a. Held-rate intervals (_heldCI). Pure function, lib/metrics. Zero hosting
//       dependency. Survives the split untouched. If rollups later move to SQL, keep the
//       interval client-side on returned counts so there is one definition, not two.
//    b. Recording-bias caveat. Presentation copy in ui/views/Stats. Client-side, survives
//       the split. The caveat labels the bias; it does not correct it. The correction is a
//       HOSTING item: a scheduled edge function that surfaces due reviews and prompts the
//       user, so outcomes are sampled by the system rather than self-selected, plus a
//       review-requested-vs-completed metric so the bias becomes measurable. Until that
//       ships, the caveat stays and the rate stays framed as a logged record.
//    c. Intel persistence. Today the snapshot (timestamp + turn) merges into decisionState
//       and saves through store. After hosting, the decision record moves to a Supabase
//       decisions table and intel snapshots become a child intel_snapshots table keyed on
//       decision_id with generated_at and generated_at_turn. The VALIDATION PASS then
//       becomes a server view/job that joins intel_snapshots to recorded outcomes and
//       grades each forecast. That join is the path from "kept" to "calibrated"; it cannot
//       run until both the snapshots and the outcomes share a queryable store.
//    d. Site-funnel windowing. Spec already lives in the httpSink template. Under hosting it
//       becomes the metrics_events table (actorId, event, loop, ts) + windowed SQL views
//       (trailing-7d/30d, cohort week) + cohort attribution. K-factor is computed in-view.
//       Stays internal-only until this lands. Do not put the lifetime sandbox figure in
//       front of a buyer.
//
// 4. SEQUENCING.
//    - Now: single artifact. Seams hold. The four changes ship as written.
//    - Split (mechanical): carve the module tree, seams unchanged, no behavior change.
//    - Host (enabling): wire the four seams to Supabase + proxy. This unlocks 3b
//      (bias correction), 3c (intel validation), and 3d (windowed K-factor). 3a needs
//      nothing and is already done.
// ============================================================================
import React, { useState, useRef, useEffect, useMemo } from "react";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { Menu, X, ArrowRight, ArrowLeft, ArrowUp, Sparkles, Share2, Download, Lock, Check, ChevronRight, Plus, Sun, Moon, FileText, LayoutGrid, User, Users, BarChart3, Flame, Trophy, Shield, Crown, Layers, GitBranch, Target, Eye, Library, Compass, PenLine, CheckCircle2, TrendingUp, Sliders, AlertTriangle, Info, RotateCcw, Clock, Search, DollarSign, Megaphone } from "lucide-react";
import { CartesianGrid, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from "recharts";

// ── MODEL CONFIG (single source of truth) ────────────────────────────────────
// v63: every generation path reads from here instead of scattered literals. One
// knob to change, one place to validate. If a model string does not resolve in
// the runtime, modelPreflight surfaces a single clear error on load instead of
// every feature failing silently turn by turn.
// Note: the Anthropic artifact-runtime guidance documents "claude-sonnet-4-20250514"
// as a known-good primary for keyless artifact API calls. The values below preserve
// this build's existing choices. If the runtime rejects PRIMARY, switch it to that
// documented string. If the runtime rejects FAST, set FAST: MODELS.PRIMARY.
// ── COMPETITIVE POSITIONING STATEMENT (Build 7) ─────────────────────────────
// Governs product and external framing. Not rendered in the product UI.
// Use this to anchor product copy and any competitive framing in
// published or external-facing material.
//
// WorkOutput runs two paths from one workspace. Decide structures an unclear call:
// it enforces a process, compares options, and captures the load-bearing assumption
// behind every commit. Draft turns context into a finished document: a brief, memo,
// or plan, structured and ready to send. Both paths share one substrate no competitor
// builds: a calibrated personal track record. After a commit, WorkOutput closes the
// loop, recording whether the assumption held, partially held, or broke.
//
// The output is not a document alone. It is a compounding ledger. After enough
// decisions, you have an evidence-based view of where your judgment is reliable, where
// it overclaims, and which assumption categories consistently break on you. That
// diagnostic is specific to you. It cannot be replicated from a clean blank-slate
// chat session. It grows more valuable with use.
//
// Competitive frame:
//   ChatGPT / Claude / Gemini: generalist generation. No process enforcement,
//     no assumption capture, no outcome tracking. Fast and flexible. Zero ledger.
//   Notion AI / Copilot: document generation inside existing workflows. No
//     decision structure, no assumption capture, no calibration. Convenience layer.
//   Decision frameworks (manual): structured but static. No AI acceleration, no
//     persistence, no compounding signal. Requires disciplined manual follow-through.
//   WorkOutput: two workflows (Decide + Draft) over one compounding ledger.
//     Process enforcement, outcome capture, and calibration. The only tool where
//     using it more makes your next decision better.
//
// Positioning sentence:
//   WorkOutput runs two paths, Decide and Draft, over one ledger that gets
//   smarter about your judgment the more you use it.
//
const POSITIONING_STATEMENT = `WorkOutput is not a better prompt. It runs two paths from one workspace: Decide structures the call you have to make, Draft produces the document you have to send. Both feed one thing no other tool builds: a calibrated record of your judgment. Every committed decision captures a load-bearing assumption. Every reviewed outcome updates the ledger. The paths make the tool useful daily. The ledger makes it compound. No other tool in this category closes that loop.`;

// a11y v104: screen-reader-only style for live regions, hidden labels, and hidden tables.
const SR_ONLY = { position:"absolute", width:1, height:1, padding:0, margin:-1, overflow:"hidden", clip:"rect(0,0,0,0)", whiteSpace:"nowrap", border:0 };

// MODELS is intentionally a mutable object: modelPreflight() may switch PRIMARY or
// FAST at load time if the configured string fails to resolve. All call sites read
// MODELS.PRIMARY / MODELS.FAST at call time (not captured in a closure), so the
// preflight switch is visible immediately. modelPreflight() is called once on mount;
// do not call it from multiple places — a concurrent second call would race on the
// same mutable bindings.
const MODELS = {
  PRIMARY: "claude-sonnet-4-6",       // structured generation: main turn, overlays, intelligence
  FAST: "claude-haiku-4-5-20251001",  // cheap calls: classification, summary, contradiction
};
// ── MODEL ROUTING POLICY (v102 audit) ─────────────────────────────────────────
// Model choice is centralized: every call passes MODELS.FAST or MODELS.PRIMARY, never a
// literal string, so routing is auditable in one place and a model swap is a one-line
// change. The cost discipline:
//   FAST (cheap) — classification (classifyInput), summary compression
//     (scheduleSummaryRefresh), contradiction pre-scan (detectContradictions),
//     commit-signal / metadata extraction (classifyCommitSignalsModel). Title,
//     readiness, and template matching are cheaper still: they run LOCALLY with no API
//     call (sessionTitleFrom, assessReadiness, classifyByKeyword).
//   PRIMARY (reasoning) — the main reasoning turn, the final Commit / full document
//     draft (one streamed call), the advanced intelligence tools (dependencies,
//     failure simulation, benchmark, full run), and the overlays (stress test,
//     perspective). These are the calls worth the reasoning model.
// If you add a new model call, route low-stakes / structured-extraction work to FAST and
// reserve PRIMARY for user-facing reasoning and produced artifacts.

// ── v124: TIER-AWARE MAIN-TURN MODEL ROUTING ─────────────────────────────────
// SERVER-AUTHORITATIVE SEAM. Today this runs client-side, mirroring the metering
// seams (ACTIVE_CREDIT_LIMITS, meteringScope). When the model call moves behind the
// Vercel Function, THIS function moves with it and the server picks the model from
// the tier it reads server-side. The client must never name a model: a client that
// can request PRIMARY on a free tier is requesting the paid product for free.
//
// Two routing profiles only:
//   Paid profile (starter, pro, team, enterprise): PRIMARY (Sonnet) on every turn.
//   Free profile (guest, free): FAST (Haiku) for the working loop (Clarify / Explore),
//     PRIMARY (Sonnet) for the kept artifact (Commit).
//
// Draft note: the Draft workflow detects its produce turn from the lagging session
// mode (inferModeFromMessage returns currentMode for draft), so the FIRST produced
// document cannot be reliably pre-detected at this call site. Because that first
// document is the kept artifact, free/guest Draft routes to PRIMARY throughout rather
// than risk producing it on FAST. The forgone Haiku saving on draft-clarify turns is
// negligible (free Draft is capped at the Brief output ceiling). If a Haiku draft-
// clarify loop is wanted later, gate it on a reliable produce-turn signal first.
const PAID_TIERS = new Set(["starter", "pro", "team", "enterprise"]);
const isPaidTier = (tier) => PAID_TIERS.has(tier);
function modelForTurn(tier, inferredMode, workflowType) {
  if (isPaidTier(tier)) return MODELS.PRIMARY;            // paid: Sonnet throughout
  if (workflowType === "draft") return MODELS.PRIMARY;    // free/guest: protect the produced document
  // free/guest Decide: Sonnet only on the committed artifact, Haiku for the loop.
  if (inferredMode === "Commit" || inferredMode === "CommitOverride") return MODELS.PRIMARY;
  return MODELS.FAST;                                      // Clarify / Explore
}

// Documented known-good model for the keyless artifact runtime. If the configured
// MODELS.PRIMARY does not resolve, preflight switches to this automatically so a
// stale model string can never silently kill every generation path.
const FALLBACK_MODEL = "claude-sonnet-4-20250514";

// ── API ENDPOINT SEAM ────────────────────────────────────────────────────────
// v70.3: every Anthropic call now goes through API_ENDPOINT instead of a hardcoded
// URL. On the artifact host this stays the default keyless endpoint and behavior is
// unchanged. Off-host (Vercel/Supabase) the keyless call returns 401, so the client
// must point at a server-side proxy that injects the API key. Migrating is then a
// one-line change: set API_ENDPOINT to the proxy path (for example "/api/messages").
// Decided target: a Vercel same-origin function (frontend already deploys to Vercel via
// GitHub), not a Supabase Edge Function. The proxy must forward to
// https://api.anthropic.com/v1/messages with the headers
// x-api-key, anthropic-version, and content-type, and must pass the SSE stream
// through unchanged so the streaming reader keeps working. No call site changes.
// v103: resolved from the environment so one source runs both in the artifact
// preview and on Vercel. Order: explicit runtime global -> build-time env var ->
// keyless artifact default. In the artifact preview none of the first two are set,
// so this is exactly the v102.3 value and behavior. On Vercel, set the proxy path
// (for example "/api/messages") via either mechanism; the proxy injects the key.
const API_ENDPOINT =
  (typeof window !== "undefined" && window.__WO_API_ENDPOINT__) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_WO_API_ENDPOINT) ||
  "https://api.anthropic.com/v1/messages";

// Probe a single model with a 1-token call. Separates a model-resolution failure
// (400/404 or a model-related message — the only thing worth falling back on) from
// transient network or rate noise, which should not trigger a switch.
async function probeModel(model) {
  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 1, messages: [{ role: "user", content: "ping" }] })
    });
    if (res.ok) return { ok: true };
    let detail = ""; try { const e = await res.json(); detail = (e && e.error && e.error.message) || ""; } catch {}
    return { ok: false, status: res.status, detail, modelIssue: res.status === 400 || res.status === 404 || /model/i.test(detail) };
  } catch (e) {
    return { ok: false, network: true, detail: (e && e.message) || "" };
  }
}

// One minimal call on load to confirm PRIMARY resolves. On a clear model-resolution
// failure, re-probe the documented fallback and, if it works, switch MODELS.PRIMARY
// in place so every later call uses the working string.
// v70: FAST is now probed too. It drives classify/summary/contradiction. Before v70 a
// stale FAST string failed those silently, feature by feature. We probe it once and, on
// a clear model-resolution failure, fall back to the (now resolved) PRIMARY so the cheap
// calls keep working at higher cost rather than disappearing. Only a model issue triggers
// the switch; transient network or rate noise is left alone so the app does not false-alarm.
// v98.9 (E8): sessionStorage cache. A page refresh within 5 minutes with the same model
// strings skips the two probe calls (~0.5-1s each on slow connections). The cache is keyed
// on PRIMARY+FAST so any model-string change in MODELS invalidates it automatically. On a
// model-resolution failure (the fallback path), the cache is cleared so the next load
// re-probes with the new string after the switch.
const _PREFLIGHT_CACHE_KEY = "wo:preflight";
const _PREFLIGHT_TTL_MS = 5 * 60 * 1000;
async function modelPreflight() {
  // Check sessionStorage cache first — skips probes on rapid page refreshes.
  try {
    const cached = sessionStorage.getItem(_PREFLIGHT_CACHE_KEY);
    if (cached) {
      const { primary, fast, ts } = JSON.parse(cached);
      if ((Date.now() - ts) < _PREFLIGHT_TTL_MS && primary === MODELS.PRIMARY && fast === MODELS.FAST) {
        return { ok: true, switched: false, fastSwitched: false, cached: true };
      }
    }
  } catch (_) {}

  let switched = false;
  const primary = await probeModel(MODELS.PRIMARY);
  if (!primary.ok) {
    if (!primary.modelIssue) return { ok: false, network: primary.network, status: primary.status, detail: primary.detail };
    if (MODELS.PRIMARY !== FALLBACK_MODEL) {
      const fb = await probeModel(FALLBACK_MODEL);
      if (fb.ok) { MODELS.PRIMARY = FALLBACK_MODEL; switched = true; }
      else return { ok: false, modelIssue: true, status: primary.status, detail: primary.detail };
    } else {
      return { ok: false, modelIssue: true, status: primary.status, detail: primary.detail };
    }
  }
  let fastSwitched = false;
  if (MODELS.FAST !== MODELS.PRIMARY) {
    const fast = await probeModel(MODELS.FAST);
    if (!fast.ok && fast.modelIssue) { MODELS.FAST = MODELS.PRIMARY; fastSwitched = true; }
  }
  // Cache successful result so rapid refreshes skip the probes.
  try { sessionStorage.setItem(_PREFLIGHT_CACHE_KEY, JSON.stringify({ primary: MODELS.PRIMARY, fast: MODELS.FAST, ts: Date.now() })); } catch (_) {}
  return { ok: true, switched, to: switched ? MODELS.PRIMARY : undefined, fastSwitched, fastTo: fastSwitched ? MODELS.FAST : undefined };
}

// Locate a balanced top-level {...} in `src` starting at or after `from`,
// respecting strings and escapes. Returns { obj, start, end } where end is
// exclusive and obj is the parsed object (or null if the balanced span did not
// parse as JSON). Returns null only when no opening brace exists or the object
// never closes. Single walker shared by extractJsonObject and the document-block
// extractor below, so there is one definition of "balanced object" in the file.
function balancedObjectAt(src, from = 0) {
  const start = src.indexOf("{", from);
  if (start < 0) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { if (inStr) esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      if (--depth === 0) {
        let obj = null; try { obj = JSON.parse(src.slice(start, i + 1)); } catch {}
        return { obj, start, end: i + 1 };
      }
    }
  }
  return null;
}

// Robust JSON-object extraction from model output. Walks to the first balanced
// top-level {...}, respecting strings and escapes, instead of a greedy regex
// (/\{[\s\S]*\}/) that over-matches on any prose containing a brace and breaks
// on nested structure. Strips code fences first. Returns the parsed object, or
// null if nothing balanced parses. Every structured-call site routes through this.
function extractJsonObject(raw) {
  if (!raw || typeof raw !== "string") return null;
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const src = fenced ? fenced[1] : raw;
  const hit = balancedObjectAt(src, 0);
  return hit ? hit.obj : null;
}

// Document-block extraction for the main turn. Fence-aware and balanced-brace
// based (same walker as extractJsonObject), replacing the brittle
// /```json\n([\s\S]*?)\n```/ match parseResponse used to use. That match required
// a newline immediately after the fence tag and before the close, so it silently
// dropped the document whenever the model omitted the leading newline or trailed
// any character after the close — the single most frequent structured path in the
// app. Returns { doc, text } where text has the document block removed; doc is
// null when no document object is present.
function extractDocumentBlock(raw) {
  if (!raw || typeof raw !== "string") return { doc: null, text: raw || "" };

  // 1) Prefer a fenced block (the prompt asks for ```json fences). Tolerant of
  //    any whitespace after the language tag and before the close.
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    const inner = balancedObjectAt(fence[1], 0);
    if (inner && inner.obj && inner.obj.document) {
      const fStart = fence.index;
      const fEnd = fStart + fence[0].length;
      return { doc: inner.obj, text: (raw.slice(0, fStart) + raw.slice(fEnd)).trim() };
    }
  }

  // 2) No usable fenced document. Scan left-to-right for a bare balanced object
  //    that carries document:true, skipping any earlier brace that does not parse
  //    or is not a document (e.g. a stray "{" in prose). Strip only that object.
  let from = 0;
  while (from < raw.length) {
    const hit = balancedObjectAt(raw, from);
    if (!hit) break;
    if (hit.obj && hit.obj.document) {
      return { doc: hit.obj, text: (raw.slice(0, hit.start) + raw.slice(hit.end)).trim() };
    }
    from = hit.end > from ? hit.end : from + 1;
  }

  return { doc: null, text: raw };
}

// ── PERSISTENCE SEAM ─────────────────────────────────────────────────────────
// v70.2: all persistence now goes through `store` instead of touching
// window.storage directly. window.storage is the artifact host's KV API; it does
// not exist on Vercel/Supabase. Routing every read and write through one binding
// (ACTIVE_STORE) means the migration is a single assignment — point ACTIVE_STORE
// at a Supabase-backed adapter implementing the same four methods — with no edits
// to loadProfile, the session store, the share store, or the metrics sink.
//
// The contract matches the artifact host exactly so the default adapter is a pure
// pass-through and behavior is unchanged:
//   get(key, shared?)            -> { key, value, shared } | null
//   set(key, value, shared?)     -> { key, value, shared } | null   (throws on quota)
//   delete(key, shared?)         -> { key, deleted, shared } | null
//   list(prefix, shared?)        -> { keys, shared } | null
// `shared` is the per-user (false, default) vs cross-user (true) flag. On Supabase
// that maps to row-level-security-scoped rows (false) vs a public-readable table
// (true). set() must surface quota/failure by throwing so saveSessionV47 can detect
// it; the pass-through preserves that by not swallowing. Decided off-host shape:
// hybrid — KV for profile/sessions/index/shared docs (fetched whole by key), and a
// typed metrics_events table for analytics (rollups cannot run over opaque blobs).
//
// Decided auth model for the off-host adapter: anonymous by default, no cross-session
// persistence. So the Supabase adapter is state-dependent — when no user is logged in,
// per-user writes (shared:false) go to an ephemeral/in-memory store and are discarded
// at session end; once logged in they persist to RLS rows keyed by the auth user.
// Shared writes (shared:true: shared docs, metrics) persist in both states, so the
// share growth loop works without an account. The default artifact adapter below is
// unconditional persistence, which is correct for the artifact host (no auth there).
// v73: storage resilience. window.storage is the artifact host's KV API, but if the
// runtime does not inject it (or it throws on every call), persistence silently fails and
// the Decision Library never stores anything. We detect availability once and fall back
// to localStorage (persists across reloads) and then to an in-memory map (persists for the
// session) so decisions are always stored somewhere. window.storage stays primary when present.
function _memStore(){
  const m = new Map(); const kk = (k, s) => (s ? "S:" : "U:") + k;
  return {
    get:    async (k, s=false) => { const key=kk(k,s); return m.has(key) ? { key:k, value:m.get(key), shared:s } : null; },
    set:    async (k, v, s=false) => { m.set(kk(k,s), v); return { key:k, value:v, shared:s }; },
    delete: async (k, s=false) => { m.delete(kk(k,s)); return { key:k, deleted:true, shared:s }; },
    list:   async (p, s=false) => { const pre=(s?"S:":"U:"); const keys=[...m.keys()].filter(x=>x.startsWith(pre)).map(x=>x.slice(pre.length)).filter(x=>!p||x.startsWith(p)); return { keys, prefix:p, shared:s }; },
  };
}
function _localStore(){
  try{ const t="__wo_probe__"; window.localStorage.setItem(t,"1"); window.localStorage.removeItem(t); }catch(_){ return null; }
  const P="wo.ls:"; const kk=(k,s)=>P+(s?"S:":"U:")+k;
  return {
    get:    async (k, s=false) => { const v=window.localStorage.getItem(kk(k,s)); return v==null ? null : { key:k, value:v, shared:s }; },
    set:    async (k, v, s=false) => { window.localStorage.setItem(kk(k,s), v); return { key:k, value:v, shared:s }; },
    delete: async (k, s=false) => { window.localStorage.removeItem(kk(k,s)); return { key:k, deleted:true, shared:s }; },
    list:   async (p, s=false) => { const pre=P+(s?"S:":"U:"); const keys=[]; for(let i=0;i<window.localStorage.length;i++){ const x=window.localStorage.key(i); if(x&&x.startsWith(pre)){ const bare=x.slice(pre.length); if(!p||bare.startsWith(p)) keys.push(bare); } } return { keys, prefix:p, shared:s }; },
  };
}
const _hasWindowStorage = (typeof window !== "undefined") && window.storage && typeof window.storage.get === "function" && typeof window.storage.set === "function";
const artifactStore = _hasWindowStorage ? {
  get:    (key, shared = false) => window.storage.get(key, shared),
  set:    (key, value, shared = false) => window.storage.set(key, value, shared),
  delete: (key, shared = false) => window.storage.delete(key, shared),
  list:   (prefix, shared = false) => window.storage.list(prefix, shared),
} : (_localStore() || _memStore());

// Active persistence adapter. Swap this one binding to migrate every call site.
let ACTIVE_STORE = artifactStore;

// Stable internal API used everywhere below. Method calls forward to ACTIVE_STORE
// so a later swap needs no call-site changes. Errors are NOT swallowed here: callers
// already wrap their own reads/writes (and saveSessionV47 depends on set() throwing
// on quota), so containment stays where it already is.
const store = {
  get:    (key, shared = false) => ACTIVE_STORE.get(key, shared),
  set:    (key, value, shared = false) => ACTIVE_STORE.set(key, value, shared),
  delete: (key, shared = false) => ACTIVE_STORE.delete(key, shared),
  list:   (prefix, shared = false) => ACTIVE_STORE.list(prefix, shared),
};

// ── TIER POLICY (single source of truth for quantitative limits) ─────────────
// v74: limits become policy, not scattered literals. Boolean entitlements still
// live in FEATURE_MIN (rank gating); the quantitative caps live here. One object
// to change, one place to validate. Mirrors the MODELS config pattern.
//   maxDecisionsPerMonth — new decisions a tier may create per rolling 30-day window.
//   maxTurns             — user turns allowed inside one decision. The final
//                          allowed turn is forced to Commit so a capped decision
//                          always yields an artifact, and a clean beta data point,
//                          rather than dead-ending with no output.
//   maxSessionsPerDay    — v102: daily generation ceiling, enforced IN ADDITION to
//                          the monthly cap, to bound worst-case daily API spend.
//                          See localDailyLimits / canStartDailySession below.
// v102 (cost-control pass): caps tightened to bound API exposure while keeping each
// tier useful for its use case. Guest is now a single lifetime preview, not a
// repeat-use anonymous plan. Free is a fair monthly trial. Starter is regular
// individual use. Pro is serious daily individual use, no longer effectively
// unlimited. Enterprise stays uncapped and out of this launch's user-facing copy.
// SERVER-SIDE ENFORCEMENT SEAM: every cap here is still client-side and spoofable by
// clearing storage. Account-bound, server-side counters plus IP/device throttling are
// REQUIRED before paid launch. See the enforcement-prep block near localDailyLimits.
const TIER_POLICY = {
  // v127: guest tier removed. Account creation is now required before any use, so the
  // lowest reachable tier is free. Unauthenticated state is tier === null, which never
  // reaches policyFor in practice (the app is hard-gated by AuthGate until sign-up).
  free:       { maxDecisionsPerMonth: 3,  maxTurns: 6,  maxSessionsPerDay: 1 },
  starter:    { maxDecisionsPerMonth: 10, maxTurns: 10, maxSessionsPerDay: 3 },
  pro:        { maxDecisionsPerMonth: 30, maxTurns: 15, maxSessionsPerDay: 5 },
  enterprise: { maxDecisionsPerMonth: Infinity, maxTurns: Infinity, maxSessionsPerDay: Infinity },
  // v102: Team assumptions set for later. Team is DEFERRED until after single-user
  // beta (targeted month 6) and is not user-facing in this launch. Do not surface or
  // sell Team yet. 30 sessions/seat/month, 16 turns, 3 sessions/seat/day, 40 credits/seat.
  team:       { maxDecisionsPerMonth: 30, maxTurns: 16, maxSessionsPerDay: 3 },
};
const policyFor = (tier) => TIER_POLICY[tier] || TIER_POLICY.free;

// ── INTELLIGENCE CREDIT POLICY ────────────────────────────────────────────────
// Credits are separate from sessions. They are used only by advanced intelligence
// tools. Standard Decide and Document sessions do not consume credits.
// Credits reset monthly with the existing rolling 30-day window anchor.
// Credits do not roll over. v123: Pro includes 40/month (was 60). Free and Starter: 0.
// Team (deferred): 40/seat/month. Enterprise: Infinity (custom/pooled deferred).
// PUBLIC COPY: use "advanced intelligence credits" or "intelligence credits".
// Never expose the word "tokens" in user-facing strings.
const INTELLIGENCE_CREDIT_POLICY = {
  free:       { monthlyCredits: 0 },
  starter:    { monthlyCredits: 0 },
  pro:        { monthlyCredits: 40 },   // v123: 60 → 40
  team:       { monthlyCredits: 40 },   // v102: deferred — per-seat allowance for the month-6 Team launch
  enterprise: { monthlyCredits: Infinity }, // custom/pooled deferred — Infinity is the placeholder
};

// Credit cost per advanced tool. Each value is the number of credits deducted
// when that tool successfully completes a run.
// SERVER-SIDE ENFORCEMENT SEAM: these costs must be enforced server-side before
// paid launch. Client enforcement is an affordance only. Costs live here so both
// the UI display and the local deduction read from one source of truth.
const CREDIT_COSTS = {
  contradictionScan:       1,
  dependencyMap:           4,  // v102: 3 → 4
  failureSimulation:       4,  // v102: 3 → 4
  benchmark:               4,  // v102: 3 → 4
  decisionStressTest:      6,  // v102: 4 → 6
  multiPerspectiveReview:  8,  // v102: 5 → 8
  fullIntelligenceRun:    15,  // v102: 10 → 15
};

// ── CREDIT STORE ──────────────────────────────────────────────────────────────
// Mirrors localLimits exactly. Shares the existing wo:limit:anchor rolling window
// so session resets and credit resets are always in sync. Do not create a separate
// anchor — that path leads to drift between the two counters.
// SERVER-SIDE ENFORCEMENT SEAM: swap ACTIVE_CREDIT_LIMITS to a server-backed adapter
// with the same count/spend/resetInDays contract. No call-site changes required.
const localCreditLimits = {
  WINDOW_MS: 30 * 24 * 60 * 60 * 1000,
  async anchor() {
    // Reuse the same anchor as the session limit so the two counters always
    // reset together. If no anchor exists yet, localLimits.anchor() will create it.
    try { const r = await store.get("wo:limit:anchor"); if (r && r.value) return parseInt(r.value, 10) || Date.now(); } catch (_) {}
    const t = Date.now();
    try { await store.set("wo:limit:anchor", String(t)); } catch (_) {}
    return t;
  },
  async windowIndex() { return Math.floor((Date.now() - (await this.anchor())) / this.WINDOW_MS); },
  async key()         { return "wo:credits:used:" + meteringScope() + (await this.windowIndex()); },
  async count() {
    try { const r = await store.get(await this.key()); return r ? (parseInt(r.value, 10) || 0) : 0; } catch { return 0; }
  },
  async spend(amount) {
    const k = await this.key();
    const n = (await this.count()) + amount;
    try { await store.set(k, String(n)); } catch {}
    return n;
  },
  async resetInDays() {
    const into = (Date.now() - (await this.anchor())) % this.WINDOW_MS;
    return Math.max(1, Math.ceil((this.WINDOW_MS - into) / (24 * 60 * 60 * 1000)));
  },
};
// Swap this one binding to move credit enforcement server-side.
let ACTIVE_CREDIT_LIMITS = localCreditLimits;

// ── DAILY GENERATION CEILING (v102) ───────────────────────────────────────────
// A per-plan daily session cap, enforced IN ADDITION to the monthly cap, to bound
// worst-case daily API spend (and the most direct abuse vector: one account or one
// guest device running many generations in a single day). Same seam shape as
// localLimits / localCreditLimits: count / canStart / record / resetSeconds.
// Reset is by LOCAL CALENDAR DATE (YYYY-MM-DD), so the counter rolls at the user's
// local midnight, which reads as "you can continue tomorrow".
//
// SERVER-SIDE ENFORCEMENT SEAM: this is client-side and spoofable by clearing storage
// or changing the device clock. Before paid launch it MUST move server-side, keyed on
// account id AND IP/device, with the same getDailyUsage / canStartDailySession /
// recordDailySession contract so no call site changes. See the enforcement-prep block.
function _todayKey() {
  // Local date stamp. toLocaleDateString with en-CA yields YYYY-MM-DD reliably.
  try { return new Date().toLocaleDateString("en-CA"); } catch (_) {
    const d = new Date(); return d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate();
  }
}
const localDailyLimits = {
  async key() { return "wo:daily:sessions:" + meteringScope() + _todayKey(); },
  async count() {
    try { const r = await store.get(await this.key()); return r ? (parseInt(r.value, 10) || 0) : 0; } catch { return 0; }
  },
  async record() {
    const k = await this.key();
    const n = (await this.count()) + 1;
    try { await store.set(k, String(n)); } catch {}
    return n;
  },
  resetSeconds() {
    // Seconds until local midnight.
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    return Math.max(1, Math.floor((next.getTime() - now.getTime()) / 1000));
  },
};
// Swap this one binding to move the daily ceiling server-side.
let ACTIVE_DAILY_LIMITS = localDailyLimits;

function maxSessionsPerDay(tier) {
  return policyFor(tier).maxSessionsPerDay ?? Infinity;
}
async function getDailyUsage(tier) {
  const cap = maxSessionsPerDay(tier);
  if (!Number.isFinite(cap)) return { used: 0, cap, remaining: Infinity };
  const used = await ACTIVE_DAILY_LIMITS.count();
  return { used, cap, remaining: Math.max(0, cap - used) };
}
// Returns { allowed, used, cap, remaining }. Read-only — does not record.
async function canStartDailySession(tier) {
  const { used, cap, remaining } = await getDailyUsage(tier);
  if (!Number.isFinite(cap)) return { allowed: true, used, cap, remaining };
  return { allowed: used < cap, used, cap, remaining };
}
// Increment the daily counter. Call once, at the same admission point that bumps the
// monthly counter, so the two stay in lockstep for a delivered fresh session.
async function recordDailySession() {
  return await ACTIVE_DAILY_LIMITS.record();
}

// ── SERVER-SIDE ENFORCEMENT PREP (v102) ───────────────────────────────────────
// Every limit in this build is client-side and is an affordance, not a control. It is
// defeated by clearing storage, changing the device clock, or opening an incognito
// window. The seams above (ACTIVE_LIMITS, ACTIVE_CREDIT_LIMITS, ACTIVE_DAILY_LIMITS,
// API_ENDPOINT) are shaped so the swap to real enforcement needs no call-site changes.
// Before any PAID or PUBLIC launch the following must exist server-side:
//   TODO(server): account auth — every counter keyed on a verified account id.
//   TODO(server): server-side monthly session counter (replaces ACTIVE_LIMITS).
//   TODO(server): server-side credit counter (replaces ACTIVE_CREDIT_LIMITS).
//   TODO(server): server-side daily ceiling (replaces ACTIVE_DAILY_LIMITS), keyed on
//                 account id AND IP/device so a guest cannot reset by clearing storage.
//   TODO(server): guest limits enforced by IP/device fingerprint, not local storage.
//   TODO(server): CAPTCHA / friction after suspicious guest or new-account behavior.
//   TODO(server): email verification before repeated Free use.
//   TODO(server): payment-required overage — no extra session without confirmed payment
//                 (see buyOverage / isOverageEnabled; the local flag is beta-only).
//   TODO(server): rate limits per account and per IP.
//   TODO(server): max concurrent generations per account.
//   TODO(server): daily spend ceiling per account (hard stop on cumulative API cost).
// None of the above is implemented here: this artifact has no auth, billing, or backend
// dependency. These are the explicit gaps the seams are built to fill.

// ── CREDIT HELPER FUNCTIONS ───────────────────────────────────────────────────

function getMonthlyCreditAllowance(tier) {
  return (INTELLIGENCE_CREDIT_POLICY[tier] || INTELLIGENCE_CREDIT_POLICY.free).monthlyCredits;
}

async function getCreditsUsed() {
  return await ACTIVE_CREDIT_LIMITS.count();
}

async function getCreditsRemaining(tier) {
  const allowance = getMonthlyCreditAllowance(tier);
  if (!Number.isFinite(allowance)) return Infinity;
  const used = await getCreditsUsed();
  return Math.max(0, allowance - used);
}

function creditCostForTool(toolId) {
  return CREDIT_COSTS[toolId] || 0;
}

// Returns { allowed: bool, reason: "ok" | "exhausted" | "tier" | "no_context" }
// reason "tier"      — user's plan does not include any credits
// reason "exhausted" — user has credits but not enough remaining for this tool
// reason "ok"        — proceed
async function canRunAdvancedTool(toolId, tier) {
  // v99.7 (P7): cost check first. The allowance===0 gate previously preceded it, so a
  // cost-0 tool was blocked for tiers without credits and the documented "free tool"
  // path was unreachable. No cost-0 tool exists today; the defect was latent only.
  const cost = creditCostForTool(toolId);
  if (cost === 0) return { allowed: true, reason: "ok" }; // free tool, no deduction
  const allowance = getMonthlyCreditAllowance(tier);
  if (allowance === 0) return { allowed: false, reason: "tier" };
  if (!Number.isFinite(allowance)) return { allowed: true, reason: "ok" }; // enterprise / Infinity
  const remaining = await getCreditsRemaining(tier);
  if (remaining < cost) return { allowed: false, reason: "exhausted" };
  return { allowed: true, reason: "ok" };
}

// Deduct credits for a tool. Call ONLY inside the success branch of a generate*
// function, after the result is confirmed and about to be persisted to state.
// Do NOT call before the API call — only on confirmed success.
async function spendCredits(toolId) {
  const cost = creditCostForTool(toolId);
  if (cost > 0) await ACTIVE_CREDIT_LIMITS.spend(cost);
}

// ── SHARED HELPERS ────────────────────────────────────────────────────────────

// C1: single source of truth for the productive-turn count used by both the
// turn-cap enforcement gate and the CommitOverride inference in sendMessage.
// "Productive" means a user turn that followed an assistant Explore, Commit, or
// Draft response. Clarify turns are excluded so early-stage engagement is not
// penalised. v99.7 (H3): Draft added — draft sessions previously emitted only
// Clarify/Draft, so the productive count stayed 0 and TIER_POLICY.maxTurns was
// never enforced for the entire document workflow, despite pricing copy
// promising "X turns per decision" across both workflows.
function countProductiveTurns(rawHistory) {
  if (!rawHistory || rawHistory.length === 0) return 0;
  // v99.6 (L1): single forward pass. The prior reduce ran slice().reverse().find()
  // per user turn (O(n²) with a regex per probe). Track the most recent assistant
  // mode as we walk; each message is examined exactly once.
  let count = 0, lastAssistantProductive = false;
  for (const m of rawHistory) {
    if (m.role === "assistant") {
      lastAssistantProductive = /^Mode:\s*(Explore|Commit|Draft)/im.test(m.content || "");
    } else if (m.role === "user" && lastAssistantProductive) {
      count++;
    }
  }
  return count;
}

// v102: extra-sessions add-on, billed on top of any paid plan. Single source of truth
// for the pack size and price so the pricing page and the in-session overage banner
// cannot drift. Current pack: 5 sessions for $10.
const OVERAGE_PACK = { sessions: 5, priceUSD: 10 };

// C4: single read path for the overage opt-in flag. guardedSend and
// startSeededDecision both need this; one place to change if the key moves.
// v102: overage is now PAYMENT-REQUIRED. A local opt-in flag must NOT grant extra
// sessions on its own — that was a free cap bypass. Until a server confirms payment,
// this returns false so the cap holds. The flag is read only as a beta-debug escape
// hatch, gated behind OVERAGE_PAYMENT_CONFIRMED, which is false in this build because
// there is no billing integration.
// TODO(server): set OVERAGE_PAYMENT_CONFIRMED true only after a server confirms a paid
// charge for the extra session; ideally replace this whole flag with a server check
// that returns remaining paid-overage sessions for the account.
const OVERAGE_PAYMENT_CONFIRMED = false; // no billing integration in this build
async function isOverageEnabled() {
  if (!OVERAGE_PAYMENT_CONFIRMED) return false; // v102: never grant overage without confirmed payment
  try {
    const r = await store.get("wo:overage:enabled");
    return !!(r && r.value === "1");
  } catch(_) {
    return false;
  }
}

// ── LIMITS SEAM ──────────────────────────────────────────────────────────────
// v74: the decision counter routes through ACTIVE_LIMITS, the same seam pattern as
// store / ACTIVE_SINK / API_ENDPOINT. The cap is a rolling 30-day window anchored at
// sign-up or purchase, not a calendar month. The anchor (ms timestamp) is set the
// first time the user leaves the guest tier and is stored once; every counter key is
// the window index since that anchor, so the count resets exactly 30 days after the
// anchor and every 30 days thereafter, with no cron. Migrating to Supabase is a
// one-line swap: set ACTIVE_LIMITS to an adapter with the same count/bump/resetInDays
// contract that stores the anchor on the user row and computes the window server-side.
// No call-site changes. The local counter is spoofable by clearing storage; that is
// acceptable for beta. Real enforcement is the server-side swap, consistent with the
// access-role seam stance that client gating is an affordance, not security.
//   count() -> decisions in the current window   bump() -> new count
//   resetInDays() -> whole days until the window rolls
const localLimits = {
  WINDOW_MS: 30 * 24 * 60 * 60 * 1000,
  async anchor() {
    try { const r = await store.get("wo:limit:anchor"); if (r && r.value) return parseInt(r.value, 10) || Date.now(); } catch (_) {}
    // Lazy fallback: anchor to now if it was never set explicitly at sign-up/purchase.
    const t = Date.now();
    try { await store.set("wo:limit:anchor", String(t)); } catch (_) {}
    return t;
  },
  async windowIndex() { return Math.floor((Date.now() - (await this.anchor())) / this.WINDOW_MS); },
  async key()         { return "wo:limit:decisions:" + meteringScope() + (await this.windowIndex()); },
  async count() {
    try { const r = await store.get(await this.key()); return r ? (parseInt(r.value, 10) || 0) : 0; } catch { return 0; }
  },
  async bump() {
    const k = await this.key();
    const n = (await this.count()) + 1;
    try { await store.set(k, String(n)); } catch {}
    return n;
  },
  async resetInDays() {
    const into = (Date.now() - (await this.anchor())) % this.WINDOW_MS;
    return Math.max(1, Math.ceil((this.WINDOW_MS - into) / (24 * 60 * 60 * 1000)));
  },
};
// Swap this one binding to move the cap server-side.
let ACTIVE_LIMITS = localLimits;

// Set the rolling-window anchor at sign-up or purchase. Only writes if unset, so the
// window always dates from the first time the user left the guest tier.
async function ensureLimitAnchor() {
  try { const r = await store.get("wo:limit:anchor"); if (r && r.value) return; await store.set("wo:limit:anchor", String(Date.now())); } catch (_) {}
}

// Single gate. Returns the decision; it never enforces UI on its own. Server-side
// enforcement later swaps ACTIVE_LIMITS, not this function or its callers.
async function canCreateDecision(tier) {
  const cap = policyFor(tier).maxDecisionsPerMonth;
  if (!Number.isFinite(cap)) return { allowed: true, used: 0, cap, remaining: Infinity };
  const used = await ACTIVE_LIMITS.count();
  return { allowed: used < cap, used, cap, remaining: Math.max(0, cap - used) };
}

// v74: recently used templates (MRU, per device, via the store seam). Recorded on
// explicit template use and surfaced at the top of the Templates page. Keyed by
// template name, which is unique in STRUCTURES. Capped at 6, deduped, most-recent first.
async function recordRecentTemplate(name) {
  if (!name) return;
  try {
    const r = await store.get("wo:recent-templates");
    let list = r ? JSON.parse(r.value) : [];
    if (!Array.isArray(list)) list = [];
    list = [name, ...list.filter(x => x !== name)].slice(0, 6);
    await store.set("wo:recent-templates", JSON.stringify(list));
  } catch (_) {}
}
async function loadRecentTemplates() {
  try {
    const r = await store.get("wo:recent-templates");
    const l = r ? JSON.parse(r.value) : [];
    return Array.isArray(l) ? l : [];
  } catch (_) { return []; }
}

// ===== REAL ENGINE (extracted verbatim from WorkOutput v45) =====
const SYSTEM_PROMPT_CHAT = `You are WorkOutput — a structured decision and document engine.

IDENTITY
WorkOutput helps users think clearly before they act. It clarifies direction, compares meaningful options, exposes assumptions, surfaces tradeoffs, and produces executive-grade outputs. The human decides. WorkOutput never decides for them.

MODE SYSTEM
Every response MUST begin with exactly one of: "Mode: Clarify", "Mode: Explore", or "Mode: Commit"
Missing mode declaration is a structural violation.
All sessions begin in Clarify. Mode drift is prohibited. Implicit Commit is prohibited.

Clarify — Resolve ambiguity. Ask a few short, natural questions when the decision warrants them; one or two is usually enough, more only when genuinely needed to resolve the call. Do not over-ask. Offer upgrade path when warranted. No artifacts. Do not explain why you are asking. Stop once you have what you need.
Explore — Structured comparison. Surface tradeoffs. Identify decision drivers. Reduce possibility space without locking.
Commit — Locked artifact. Final deliverable. No hedging.

MODE SELECTION
Use Clarify when: input is vague, critical information is missing, or the problem is undefined.
Use Explore when: the problem is defined and structured evaluation is warranted.
Use Commit when: all four criteria are confirmed — artifact type, time horizon, constraints, success criteria.
Missing any criterion = drop to Explore without naming the failed gate.

COMMIT OVERRIDE
If the user says "just give me the output", "skip the questions", "go ahead", "just do it", or equivalent:
Do not stay in Clarify. Identify which criteria are missing. Ask only for those — one direct question maximum. Proceed to Commit immediately after. After asking, do not ask again. If a second question forms, stop — proceed with what you have.

ESCALATION DETECTION GOVERNANCE
Escalation requires multi-signal confirmation. Signal classes: Stakes, Irreversibility, Time Horizon, Structural Complexity.
No single keyword triggers escalation. If confidence <85%, hold current mode.

SPARSE INPUT RESPONSE
When minimal detail is provided but a response is required:
- Clear objective (1 sentence)
- 2-3 focus areas
- 2-3 key risks
No projections, metrics, or scaffolding.

FOUNDATION BEFORE FORMAT
Start with the problem, goal, constraints, or key details. Do not ask about format or output destination until substance is defined. Format never changes depth.

VAGUE PROMPTS
Ask a few short questions when warranted; one or two is usually enough. Do not explain why. Do not preview structure. Stop once you have what you need.

NO FABRICATION
Do not introduce variables not provided. Fabricated referent = High Impact violation. Confidence <= Limited.

TONE
Structured but natural. Calm authority. Direct. No hype. No em dashes. Avoid mechanical phrasing. Lead with empathy for personal topics.

UPGRADE PATH SIGNAL
At the end of Clarify and Explore responses, when it would help the user move forward, add one line beginning with "To move to [Explore/Commit]:" followed by what is still needed. Do not add this line if the path is already obvious or after a Commit output. One sentence max. Never on Commit.

NO ADVICE RULE
Frame options, tradeoffs, risks, consequences. Do not use directive language.

LIFE-IMPACT SAFEGUARD
For career, health, finance, relocation, or relationship decisions, append:
"This is analytical guidance, not a substitute for professional or personal judgment."

REASONING STRENGTH
End every response with exactly: Reasoning Strength: High | Moderate | Limited

NO LEAKAGE
Never reference internal file names, version codes, rule names, or system mechanics.`;

// ── DRAFT WORKFLOW SYSTEM PROMPT ─────────────────────────────────────────────
// Used when workflowType === "draft". Replaces the Clarify→Explore→Commit
// decision cycle with a completeness-gate document model.
// Clarify as needed across multiple turns. Then produce the document.
const SYSTEM_PROMPT_DRAFT = `You are WorkOutput — a structured document engine.

IDENTITY
WorkOutput produces professional working documents. Your job is to ask exactly what is needed to produce a complete, usable document, then produce it. You do not explore options or recommend decisions. You structure and write.

MODE SYSTEM
Every response MUST begin with exactly one of: "Mode: Clarify" or "Mode: Draft"
Missing mode declaration is a structural violation.

Clarify — Ask focused questions to resolve unknowns that would materially change the document. Ask only what you genuinely need. Do not explain why you are asking. Stop when you have enough.
Draft — Produce the complete document. All required sections present. No hedging. No placeholders.

MODE SELECTION
Use Clarify when important information is missing — audience, scope, key facts, or context that would change the document. Ask as many questions as needed across multiple turns until you have what you need.
Use Draft when you have enough to write all required sections. When in doubt, draft with stated assumptions rather than asking.

COMPLETENESS GATE
Before producing a Draft output, confirm internally:
- All required sections for this template are present
- No section is satisfied by a single sentence when substance exists
- Placeholders like "[add here]" are not permitted — name what is unknown explicitly

DRAFT OUTPUT FORMAT
Produce the document directly. Use clear headings. Write in the register appropriate for the document type and audience.
Every Draft output ends with a JSON block in triple backtick json fences:
{ "document": true, "title": "...", "type": "...", "sections": [{ "heading": "...", "content": "..." }] }

TONE
Match the document type. Executive documents: precise and direct. Hiring documents: specific and honest. Technical documents: clear and structured. Personal documents: plain and direct.

REASONING STRENGTH
End every response with exactly: Reasoning Strength: High | Moderate | Limited

NO LEAKAGE
Never reference internal file names, version codes, rule names, or system mechanics.`;

// Extended block — appended only for Draft Explore turns (not used in Draft workflow).
const SYSTEM_PROMPT_EXTENDED = `
CONSTITUTIONAL PRINCIPLES
1. Structural integrity is non-negotiable.
2. Explicit assumptions are required in all Explore and Commit outputs.
3. Causal reasoning must be visible — claims without mechanism are not valid.
4. Tradeoffs must be surfaced. Hidden tradeoffs invalidate the output.
5. Confidence must be calibrated to actual uncertainty, not to user preference.
6. Hidden assumptions invalidate structure. Surface them or do not proceed.

DEPTH RULE
Depth scales only with the detail provided and the consequence explicitly declared.

UNIVERSAL OUTPUT STRUCTURE (all Explore and Commit outputs):
## Objective
## Current State
## Proposed Approach
## Assumptions
Categorize each: Structural | Behavioral | Operational | External
Definitions: Structural = about the decision architecture itself (scope, boundaries, what is and is not included). Behavioral = about how people will act (adoption, resistance, incentives). Operational = about execution (process, timeline, resources, implementation). External = about market, environment, or third parties (competitors, regulators, customers).
Flag density: >=7 = Moderate Density | >=12 = High Density
## Risks and Tradeoffs
Each entry: Trigger | Mechanism | Impact
## Success Metrics
## Next Steps
## Quality Gate Validation (Commit only)
## Confidence Level: High | Moderate | Limited

OPTIONAL: "What This Means" — 2-3 line plain-language summary. Additive only.

PROGRESSIVE STRUCTURAL REVELATION
Structure exposure may be delayed. Structure enforcement may never be reduced.

ASSUMPTION ENFORCEMENT
>=1 High Impact: Confidence Limited. >=3 High Impact: Confidence Moderate max. >=12 assumptions: High Confidence prohibited.

SELF-EVALUATION FORMAT
When asked to evaluate or describe itself: Strength / Limitation / Practical Implication. Each 1-3 sentences. Plain performance language only.

DOCUMENT GENERATION SIGNAL
Every Commit output is a locked artifact and MUST end with a JSON block in triple backtick json fences, so the deliverable is machine-parseable. In Explore, include the block only when the user explicitly requests a document output. The block:
{ "document": true, "title": "...", "type": "...", "sections": [{ "heading": "...", "content": "..." }] }`;

// v39: Artifact library extracted from EXTENDED. It is static reference (~250 tokens).
// When a template is selected, dynamic artifact loading (artifactDefinitionFor) covers
// the active type and this full list is omitted. When no template is selected, it is
// sent once as its own cached block. Either way it no longer rides every structured turn
// inside the variable prompt body.
const SYSTEM_PROMPT_ARTIFACT_LIBRARY = `ARTIFACT LIBRARY (produce when requested in Commit mode):
Executive & Decision: Executive Brief, Decision Memo, Board Summary, Option Analysis, Go/No-Go Recommendation
Strategy & Competitive: Strategic Assessment, Competitive Map, Market Entry Analysis, SWOT, Scenario Plan
Finance & Forecasting: Financial Model Summary, Budget Variance, Break-Even Analysis, Sensitivity Analysis, Runway Analysis
Sales & GTM: GTM Plan, Pipeline Review, ICP Definition, Pricing Strategy
Product & Technical: PRD Summary, Technical Risk Review, Build vs Buy Analysis, Feature Prioritization, Pricing Strategy
Operations: Process Audit, Workflow Redesign, Capacity Plan, Vendor Evaluation
AI Governance: AI Readiness Assessment, Governance Framework, Risk & Ethics Review, Operating Model
Hiring & People: Hiring Decision, Offer Construction, Performance Improvement Plan, Organizational Design
Legal & Compliance: Contract Risk Review, Compliance Gap Assessment
Fundraising: Fundraise Readiness, Investment Memo, Term Sheet Analysis
Startup: Founder Decision Log, Co-Founder Alignment
Research: Market Research Summary, Stakeholder Map, User Research Synthesis
Personal Systems: Career Decision Analysis, Negotiation Prep, Performance Review, Major Purchase Decision, Relocation Analysis, Difficult Conversation Prep`;

// ─── DOMAIN DEPTH (Phase 5: individually keyed for dynamic loading) ──────────
// Each domain is a single line. buildSystemPrompt assembles only the relevant
// ones rather than sending all of them on every Explore/Commit call.
const DOMAIN_BLOCKS = {
  Strategy: "Strategy: Moat durability | Switching costs: structural vs behavioral | Substitution risk | Failure modes under execution | Sensitivity drivers",
  Finance: "Finance: Volume vs price vs mix | Break-even and margin sensitivity | Scenario drivers: base/downside/stress | Cash flow timing | Fixed vs variable costs",
  Sales: "Sales & GTM: Conversion rates per stage | Sales cycle by segment | Coverage ratio | Capacity constraints | ICP: firmographic and behavioral criteria",
  Operations: "Operations: Bottleneck identification | Single points of failure | Process drift | Vendor dependency | Capacity headroom",
  CustomerSuccess: "Customer Success: Time-to-value milestones | Expansion triggers | Health scoring | Churn risk triggers | CS escalation path",
  AI: "AI Governance: Hallucination exposure | Bias amplification | Automation overreach | HITL requirements | Reversibility | Exposure: Low/Medium/High | MVG framework | Decision state",
  Hiring: "Hiring & People: Role clarity vs candidate fit | Structured vs unstructured signal | Offer competitiveness | Retention risk | Team composition gaps",
  Legal: "Legal & Compliance: Exposure severity | Likelihood of trigger | Remediation cost | Contractual leverage | Regulatory timeline",
  Fundraising: "Fundraising: Capital efficiency | Valuation anchor | Investor-founder fit | Dilution impact | Runway extension",
  Product: "Product: User vs buyer vs business value | Reversibility of build decisions | Scope creep risk | Adoption friction | Technical debt accumulation",
};

// Map template category -> domain key(s). Drives Dynamic Domain Loading.
const CATEGORY_TO_DOMAINS = {
  Decision: ["Strategy"], Strategy: ["Strategy"], Sales: ["Sales"], Finance: ["Finance"],
  Product: ["Product"], Hiring: ["Hiring"], Operations: ["Operations"], Legal: ["Legal"],
  Fundraising: ["Fundraising"], Startup: ["Strategy","Finance"], AI: ["AI"], Personal: [],
  CustomerSuccess: ["CustomerSuccess"], Management: ["Strategy","Hiring"],
};
// Map decisionType -> domain hints (used when no template is selected).
const DECISIONTYPE_TO_DOMAINS = {
  "Compare Options": ["Strategy"], "Approve or Reject": ["Strategy","Finance"],
  "Prioritize": ["Product","Operations"], "Diagnose": ["Operations"],
  "Plan": ["Strategy"], "Communicate": [], "Negotiate": ["Legal","Finance"],
  "Evaluate Risk": ["AI","Legal"],
};
// Keyword fallback for domain detection when classifier/template are absent.
const DOMAIN_KEYWORDS = {
  Finance: /\b(revenue|margin|cash|burn|budget|cost|pricing|p&l|ebitda|arr|mrr|runway)\b/i,
  Sales: /\b(sales|pipeline|funnel|gtm|quota|lead|conversion|icp|prospect)\b/i,
  Product: /\b(product|feature|build|roadmap|prd|backlog|ship|user|adoption)\b/i,
  Operations: /\b(process|workflow|capacity|vendor|bottleneck|throughput|ops|supply)\b/i,
  Hiring: /\b(hire|candidate|offer|role|headcount|team|recruit|comp|employee)\b/i,
  Legal: /\b(contract|legal|compliance|clause|liabilit|regulat|gdpr|soc 2|terms)\b/i,
  Fundraising: /\b(raise|fundrais|investor|valuation|term sheet|seed|series [a-d]|dilution|cap table)\b/i,
  AI: /(\bai\b|model|ml|llm|automat|algorithm|hallucinat|bias|governance)/i,
  Strategy: /\b(strateg|moat|competit|market entry|positioning|differentiat|scenario)\b/i,
};

// v75: TEMPLATES catalog restored (was a v74.1 empty-array stub after an earlier
// refactor dropped it). Each entry is keyed by a stable string id and carries:
//   category — a CATEGORY_TO_DOMAINS key; drives selectDomains step 1 (domain depth)
//   label    — matches the STRUCTURES gallery name so a gallery "Use" resolves to a
//              template id and sets decisionState.selectedTemplate (see TemplatesView
//              onUse in the render). This is what makes the depth actually fire; the
//              prior build only seeded prompt text and never set a real id.
//   desc     — the one-line ACTIVE ARTIFACT description (artifactDefinitionFor)
//   rail     — ordered stage hint carried in the framework-share payload
//   intake   — first-question hint carried in the framework-share payload
// Catalog is aligned 1:1 to the gallery structures by label. Adding a template is
// a single row here plus a matching gallery name. selectDomains caps the domain union
// at 3, so categories that resolve to one or two domains stay bounded.
// v79: TEMPLATES catalog expanded from 6 to 32 to expose the full domain depth in
// DOMAIN_BLOCKS. Each entry resolves through CATEGORY_TO_DOMAINS to a real domain
// block, so selecting a template injects matching depth into the prompt. Depth is
// weighted toward Product, Sales, Customer Success, AI Governance, Legal, and
// Operations. Every label below has a 1:1 match in STRUCTURES (gallery); adding a
// template is one row here plus one matching STRUCTURES row with the same name.
const TEMPLATES = [
  // ── Strategy ──
  { id:"go-no-go", label:"Go / No-Go Recommendation", category:"Decision",
    desc:"Go/No-Go Recommendation with decision criteria, evidence, and a single recommended call.",
    rail:"Criteria -> Evidence -> Recommendation", intake:"What is the decision and what would make it a Go?" },
  { id:"market-entry", label:"Market Entry Decision", category:"Strategy",
    desc:"Market entry call weighing moat durability, substitution risk, and execution failure modes.",
    rail:"Opportunity -> Moat & risk -> Entry call", intake:"What market are you considering entering, and why now?" },
  { id:"competitive-response", label:"Competitive Response", category:"Strategy",
    desc:"Structured response to a competitor move, separating signal from noise before committing resources.",
    rail:"Threat read -> Options -> Response plan", intake:"What did the competitor do, and what is at risk if you do nothing?" },
  // ── Finance ──
  { id:"budget-reallocation", label:"Budget Reallocation", category:"Finance",
    desc:"Reallocation across lines using margin sensitivity and fixed-vs-variable cost structure.",
    rail:"Current spend -> Marginal value -> Reallocation", intake:"What budget is in play and what are you trying to fund or protect?" },
  { id:"pricing-change-impact", label:"Pricing Change Impact", category:"Finance",
    desc:"Pricing change assessed on volume-price-mix, break-even, and base/downside/stress scenarios.",
    rail:"Change -> Scenario model -> Risk call", intake:"What pricing change are you weighing, and on which segment?" },
  // ── Sales / GTM ──
  { id:"gtm-motion", label:"GTM Motion Choice", category:"Sales",
    desc:"GTM motion choice across conversion economics, sales cycle, and coverage capacity by segment.",
    rail:"Segments -> Motion economics -> Choice", intake:"What are you selling and who is the buyer?" },
  { id:"pricing-model", label:"Pricing Model Decision", category:"Sales",
    desc:"Pricing model decision weighing conversion, ICP fit, and capacity constraints.",
    rail:"Options -> Fit & economics -> Model", intake:"What pricing models are on the table, and for which ICP?" },
  { id:"icp-narrowing", label:"ICP Narrowing", category:"Sales",
    desc:"ICP narrowing on firmographic and behavioral criteria to concentrate pipeline where it converts.",
    rail:"Signals -> Criteria -> Narrowed ICP", intake:"Who are you selling to today, and where does it convert best?" },
  { id:"deal-desk", label:"Deal Desk Approve / Reject", category:"Sales",
    desc:"Deal desk approve/reject on margin, terms exposure, and precedent risk.",
    rail:"Terms -> Exposure -> Approve/Reject", intake:"What is the deal, and which terms are non-standard?" },
  // ── Product ──
  { id:"feature-prioritization", label:"Feature Prioritization", category:"Product",
    desc:"Feature prioritization separating user, buyer, and business value with adoption friction weighted.",
    rail:"Candidates -> Value vs friction -> Rank", intake:"What features are competing for the next cycle?" },
  { id:"build-vs-buy", label:"Build vs Buy Tradeoff", category:"Product",
    desc:"Build vs Buy analysis on total cost of ownership, switching cost, and time-to-value.",
    rail:"TCO -> Switching cost -> Recommendation", intake:"What capability is in question, and what is the time horizon?" },
  { id:"roadmap-tradeoff", label:"Roadmap Tradeoff", category:"Product",
    desc:"Roadmap tradeoff weighing reversibility, scope creep risk, and technical debt accumulation.",
    rail:"Bets -> Reversibility & debt -> Sequence", intake:"What roadmap items are in tension, and over what horizon?" },
  { id:"mvp-scope-cut", label:"MVP Scope Cut", category:"Product",
    desc:"MVP scope cut isolating the smallest build that tests the core adoption assumption.",
    rail:"Full scope -> Core assumption -> Cut line", intake:"What are you building, and what is the one thing it must prove?" },
  { id:"sunset-call", label:"Sunset / Deprecate Call", category:"Product",
    desc:"Sunset/deprecate decision weighing adoption, maintenance load, and migration friction.",
    rail:"Usage -> Cost vs value -> Sunset call", intake:"What feature or product are you considering retiring?" },
  // ── Customer Success ──
  { id:"churn-intervention", label:"Churn-Risk Intervention", category:"CustomerSuccess",
    desc:"Churn-risk intervention from health signals, time-to-value gaps, and escalation triggers.",
    rail:"Risk signals -> Root cause -> Intervention", intake:"Which account is at risk, and what signaled it?" },
  { id:"expansion-play", label:"Expansion Play Prioritization", category:"CustomerSuccess",
    desc:"Expansion play prioritization across expansion triggers and account health scoring.",
    rail:"Accounts -> Trigger readiness -> Rank", intake:"Which accounts are expansion candidates, and on what signal?" },
  { id:"renewal-save", label:"Renewal Save Decision", category:"CustomerSuccess",
    desc:"Renewal save decision weighing concession cost against retained value and precedent.",
    rail:"Risk -> Save options -> Decision", intake:"Which renewal is at risk, and what is the customer asking for?" },
  // ── AI Governance ──
  { id:"ai-risk-assessment", label:"AI Use-Case Risk Assessment", category:"AI",
    desc:"AI use-case risk assessment on hallucination exposure, bias amplification, and reversibility.",
    rail:"Use case -> Exposure -> Risk call", intake:"What is the AI use case and where does its output act?" },
  { id:"hitl-scope", label:"Human-in-the-Loop Scope", category:"AI",
    desc:"Human-in-the-loop scoping that sets review points against automation overreach and exposure.",
    rail:"Automation map -> Exposure -> HITL points", intake:"What is being automated, and where is a wrong output costly?" },
  { id:"model-selection", label:"Model / AI Vendor Selection", category:"AI",
    desc:"Model/vendor selection weighing capability fit, governance exposure, and lock-in risk.",
    rail:"Candidates -> Fit & exposure -> Selection", intake:"What models or AI vendors are you comparing, and for what task?" },
  // ── Legal & Compliance ──
  { id:"contract-risk", label:"Contract Risk Review", category:"Legal",
    desc:"Contract risk review ranking exposure severity, trigger likelihood, and remediation cost.",
    rail:"Clauses -> Exposure -> Risk ranking", intake:"What contract is under review, and what is the deal context?" },
  { id:"compliance-triage", label:"Compliance Gap Triage", category:"Legal",
    desc:"Compliance gap triage prioritizing gaps by exposure severity and regulatory timeline.",
    rail:"Gaps -> Severity & timeline -> Triage", intake:"What compliance regime applies, and where are the suspected gaps?" },
  { id:"terms-negotiation", label:"Vendor Terms Negotiation", category:"Legal",
    desc:"Vendor terms negotiation mapping contractual leverage against exposure and walk-away points.",
    rail:"Positions -> Leverage -> Negotiation plan", intake:"What terms are you negotiating, and what is your leverage?" },
  // ── Operations ──
  { id:"pre-mortem", label:"Pre-Mortem Risk Map", category:"Operations",
    desc:"Pre-mortem that names failure modes, triggers, mechanisms, and containment before commit.",
    rail:"Failure modes -> Triggers -> Containment", intake:"Assume this has failed in 12 months. What broke?" },
  { id:"vendor-matrix", label:"Vendor Selection Matrix", category:"Operations",
    desc:"Weighted vendor selection matrix with criteria, scores, and dependency risk.",
    rail:"Criteria -> Score vendors -> Selection", intake:"What are the candidate vendors and the must-have criteria?" },
  { id:"bottleneck-diagnosis", label:"Process Bottleneck Diagnosis", category:"Operations",
    desc:"Bottleneck diagnosis isolating the binding constraint, single points of failure, and process drift.",
    rail:"Symptoms -> Constraint -> Fix", intake:"What process is underperforming, and where does it back up?" },
  { id:"capacity-planning", label:"Capacity Planning Call", category:"Operations",
    desc:"Capacity planning weighing headroom, demand timing, and vendor dependency against load.",
    rail:"Demand -> Headroom -> Plan", intake:"What capacity decision is due, and against what demand signal?" },
  // ── Fundraising ──
  { id:"seed-readiness", label:"Seed Raise Readiness", category:"Fundraising",
    desc:"Seed-raise readiness against capital efficiency, valuation anchor, and runway extension.",
    rail:"Readiness -> Gaps -> Raise plan", intake:"How much are you raising and what does it need to reach?" },
  { id:"bridge-vs-priced", label:"Bridge vs Priced Round", category:"Fundraising",
    desc:"Bridge vs priced round weighing dilution impact, valuation anchor, and runway extension.",
    rail:"Options -> Dilution & runway -> Choice", intake:"What is the runway situation and what are you weighing?" },
  // ── Hiring & People ──
  { id:"career-compare", label:"Two-Offer Career Compare", category:"Personal",
    desc:"Two-offer comparison across compensation, growth, risk, and fit, with a weighted read.",
    rail:"Criteria -> Score both -> Tradeoff", intake:"What are the two offers and what matters most to you?" },
  { id:"hire-no-hire", label:"Hire / No-Hire Call", category:"Hiring",
    desc:"Hire/no-hire call separating structured from unstructured signal against role clarity and fit.",
    rail:"Signal -> Fit vs gaps -> Decision", intake:"What role is this, and what does the signal on the candidate look like?" },
  { id:"backfill-restructure", label:"Backfill vs Restructure", category:"Hiring",
    desc:"Backfill vs restructure decision weighing team composition, retention risk, and the cost of each path.",
    rail:"Vacancy context -> What the team actually needs -> Options -> Decision -> First action", intake:"What role opened up, what does the team need now, and is the original role still the right one?" },
  { id:"performance-conversation", label:"Performance Conversation Prep", category:"Hiring",
    desc:"Preparation for a direct performance conversation: specific behavior, impact, required change, timeline, consequence.",
    rail:"Behavior -> Impact -> Required change -> Conversation plan", intake:"Who is this conversation with, and what is the performance issue?" },
  { id:"promote-or-manage-out", label:"Promote or Manage Out", category:"Hiring",
    desc:"Assessment of whether an employee should be promoted, developed in role, or managed out, with honest gap analysis.",
    rail:"Current performance -> Gap -> Options -> Decision", intake:"Who are you assessing, and what is triggering the question?" },
  { id:"skip-level-meeting", label:"Skip-Level Meeting Prep", category:"Hiring",
    desc:"Structured prep for a skip-level: what you want to learn, what you should not ask, what the person needs from it, and what you do with what you hear.",
    rail:"What you want to learn -> Questions to ask -> What not to say -> How to follow through", intake:"Who is this skip-level with, what prompted it, and what are you hoping to understand?" },
  { id:"reference-decision", label:"Reference Decision", category:"Hiring",
    desc:"Decision on whether and what to say when giving a reference for someone who left on complicated terms.",
    rail:"What you can say -> What you cannot -> Recommended position", intake:"Who is the reference for, and what is the complication?" },
  { id:"reference-check-debrief", label:"Reference Check Debrief", category:"Hiring",
    desc:"Structured read of a reference call: what was said, what was avoided, what the gaps mean, and whether they change the hire decision.",
    rail:"What was said -> What was avoided -> What the gaps mean -> Hire / pass call", intake:"What role is this for, what did the reference call cover, and what was your read going in?" },
  { id:"promotion-case", label:"Promotion Case", category:"Hiring",
    desc:"Building the case for a promotion: evidence, narrative, anticipated objections, honest gap acknowledgment.",
    rail:"Evidence -> Narrative -> Objections -> Gap acknowledgment", intake:"Who is the promotion for, and what is the current blocker?" },
  // ── Personal ──
  { id:"difficult-conversation", label:"Difficult Conversation Planner", category:"Personal",
    desc:"Structured prep for a high-stakes conversation: what to say, what will derail it, what success looks like.",
    rail:"What needs to be said -> Likely derail -> Success condition -> Opening", intake:"What is the conversation, and what makes it hard?" },
  { id:"apology-decision", label:"Apology Decision", category:"Personal",
    desc:"Whether to apologize, what kind of apology is warranted, and what you can actually deliver.",
    rail:"What happened -> Whose cost -> What they need -> What you can deliver", intake:"What happened, and who was affected?" },
  { id:"offer-negotiation", label:"Offer Negotiation Prep", category:"Personal",
    desc:"Negotiation strategy for a job offer, salary review, or contract: leverage, sequence, walk-away.",
    rail:"Leverage -> Target -> Sequence -> Walk-away", intake:"What are you negotiating, and what is the current offer or situation?" },
  { id:"should-i-leave", label:"Should I Leave", category:"Personal",
    desc:"Structured assessment of whether to leave a job, relationship, city, or situation: what is actually driving it, what would have to change, the cost of leaving, and what the honest next step is.",
    rail:"What is driving it -> What would have to change -> Cost of leaving -> Honest next step", intake:"What are you considering leaving, what prompted the question, and what is stopping you from deciding?" },
  { id:"relationship-boundary", label:"Relationship Boundary Decision", category:"Personal",
    desc:"Whether to set a boundary, what it is, the cost of not setting it, and what the conversation requires.",
    rail:"What needs to change -> Cost of not acting -> Boundary definition -> Required conversation", intake:"What is the situation, and whose behavior needs to change?" },
  { id:"burnout-triage", label:"Burnout Triage", category:"Personal",
    desc:"What is depleting you, what is still working, minimum viable structural change, and honest viability assessment.",
    rail:"What depletes -> What still works -> Minimum change -> Viability call", intake:"What is the situation, and how long has it been building?" },
  { id:"career-pivot", label:"Career Pivot Assessment", category:"Personal",
    desc:"What a career pivot actually requires: skills gap, financial runway, realistic timeline, honest failure mode, and the first concrete step.",
    rail:"From -> To -> Gap -> Runway -> Realistic timeline -> First concrete step", intake:"What are you pivoting from and to, and what is driving it?" },
  { id:"relocation-decision", label:"Relocation Decision", category:"Personal",
    desc:"Relocation decision that surfaces what problem you are actually solving, whether the new place solves it, and what you are giving up.",
    rail:"What problem you are solving -> What the new place provides -> What you are giving up -> Realistic assumptions -> Decision", intake:"Where are you considering moving, what is driving it, and what is your timeline?" },
  { id:"health-decision", label:"Health Decision", category:"Personal",
    desc:"Treatment or care decision: what you know, what you do not know, questions needed before deciding, values.",
    rail:"What I know -> What I do not know -> Questions needed -> Values in this decision", intake:"What is the health decision, and what are the options?" },
  { id:"aging-parent", label:"Aging Parent Care Decision", category:"Personal",
    desc:"Family care decision: what the parent needs, what each person can provide, financial picture, cost of inaction.",
    rail:"Parent needs -> Family capacity -> Financial picture -> Options -> Decision", intake:"What is the situation, and what decision is coming?" },
  { id:"major-purchase", label:"Major Purchase Decision", category:"Personal",
    desc:"Major purchase assessed on real driver, 5-year cost, opportunity cost, and what would change the call.",
    rail:"Real driver -> Full cost -> Opportunity cost -> Decision", intake:"What are you considering buying, and what is the price?" },
  // ── Management & Leadership ──
  { id:"client-escalation", label:"Client Escalation Response", category:"Operations",
    desc:"Client escalation response: what actually happened versus what the client believes happened, what they need from this conversation, and what you can commit to.",
    rail:"What happened -> What they believe -> What they need -> What you can commit -> Next communication", intake:"What is the escalation, how did it get here, and what does the client expect from you?" },
  { id:"board-meeting-prep", label:"Board Meeting Prep", category:"Strategy",
    desc:"Board meeting prep: what the board actually needs versus what you want to present, which problems to name before they do, and what decision you are asking them to make.",
    rail:"What they need -> What you want to present -> Problems to surface first -> Decision required -> Questions you hope they do not ask", intake:"What is the meeting covering, what is the hardest topic, and what do you need from the board?" },
  { id:"investor-update-bad-news", label:"Investor Update: Bad News", category:"Fundraising",
    desc:"Investor update when performance is below plan: what happened, what changed, what you are doing, what you need.",
    rail:"What happened -> What changed -> Response -> What you need from them", intake:"What is the performance gap, and when is the update due?" },
  { id:"founder-conflict", label:"Founder Conflict", category:"Strategy",
    desc:"Co-founder disagreement: actual vs. surface disagreement, what each person needs, what the company needs, what is reversible.",
    rail:"Surface disagreement -> Actual disagreement -> Each person's need -> Company's need -> Reversibility", intake:"What is the disagreement, and how long has it been building?" },
  // ── Negotiate ── (v126.7) labels mirror STRUCTURES names 54-55
  { id:"counteroffer-decision", label:"Counteroffer Decision", category:"Hiring",
    desc:"Whether to counter a valued employee's outside offer, how far to go, and the precedent it sets.",
    rail:"Outside offer -> Real retention value -> Counter or release -> Precedent cost -> Decision", intake:"Who has the outside offer, what is it, and what do you lose if they leave?" },
  { id:"discount-concession", label:"Discount / Concession Decision", category:"Sales",
    desc:"A buyer is pushing on price. Sets your floor, what you trade for any concession, and the walk-away.",
    rail:"Ask on the table -> Your floor -> Trade for the concession -> Walk-away -> Decision", intake:"What is the buyer asking for, and what is this deal worth to you at full price?" },
  // ── Communicate ── (v126.7) labels mirror STRUCTURES names 56-57
  { id:"crisis-comms", label:"Crisis Communication Plan", category:"Operations",
    desc:"Communication plan for an incident or public issue: audience, message, channel, and timing, before it sets its own narrative.",
    rail:"What happened -> Who needs to hear it -> Core message -> Channel & timing -> First statement", intake:"What is the incident, who is affected, and what is already public?" },
  { id:"org-change-comms", label:"Organizational Change Announcement", category:"Management",
    desc:"How to communicate a reorg, policy shift, or unpopular decision: sequence, message, and the objections to address before they spread.",
    rail:"What is changing -> Why -> Announcement sequence -> Likely objections -> What you say first", intake:"What change are you announcing, who does it affect most, and what will they push back on?" },
];
// Resolve a gallery structure name (or a template label) to a catalog id. Returns
// null when no catalog entry matches, so the caller leaves selectedTemplate unset and
// the flow degrades to decision-type + keyword domain detection. No crash either way.
const templateIdForLabel = (label) => { const t = TEMPLATES.find(x => x.label === label); return t ? t.id : null; };

// ── DOCUMENT TEMPLATES (v84) ─────────────────────────────────────────────────
// Draft workflow templates. Each produces a working document, not a decision.
// workflowType: "draft" — engine skips exploration, enforces completeness gate.
// v90: each template carries a `depth` hint (short | medium | full) reflecting the
// document's inherent scope. maxTokensForMode reads it to size the Draft output
// budget instead of always allocating the full 6000. Saves tokens on inherently
// short documents (retros, scorecards) without truncating long ones (PRDs, memos).
const DOCUMENT_TEMPLATES = [
  // ── Product & Engineering ──
  { id:"prd", label:"Product Requirements Document", category:"Product", depth:"full",
    desc:"PRD with problem statement, user/buyer distinction, success metrics, scope, out-of-scope, and open questions.",
    rail:"Problem -> Users & buyers -> Success metrics -> Scope -> Out-of-scope -> Open questions",
    intake:"What are you building, who is it for, and what problem does it solve?" },
  { id:"technical-design", label:"Technical Design Document", category:"Product", depth:"full",
    desc:"Architecture decision document with options evaluated, tradeoffs named, decision made, and risks identified.",
    rail:"Problem -> Options -> Tradeoffs -> Decision -> Risks -> Open questions",
    intake:"What are you building, what options are you weighing, and what are the constraints?" },
  { id:"api-design-review", label:"API Design Review", category:"Product", depth:"medium",
    desc:"API surface review for consistency, extensibility, breaking-change risk, and naming conventions.",
    rail:"Proposed surface -> Consistency check -> Extensibility -> Breaking changes -> Recommendation",
    intake:"What API surface is being reviewed, and what is it replacing or extending?" },
  { id:"incident-post-mortem", label:"Incident Post-Mortem", category:"Operations", depth:"medium",
    desc:"Post-mortem with timeline, root cause, contributing factors, impact, and structural changes required.",
    rail:"What happened -> Root cause -> Contributing factors -> Impact -> What changes",
    intake:"What was the incident, when did it occur, and what was the impact?" },
  { id:"sprint-retro", label:"Sprint / Cycle Retrospective", category:"Operations", depth:"short",
    desc:"Retrospective with what worked, what did not, root cause of the main friction, and one structural change.",
    rail:"What worked -> What did not -> Root cause -> One structural change -> Owner",
    intake:"What cycle are you reviewing, and what was the main friction?" },
  // ── Strategy & Leadership ──
  { id:"strategy-memo", label:"Strategy Memo", category:"Strategy", depth:"medium", featured:true,
    desc:"One-page strategic position with recommendation, evidence, named tradeoffs, and assumptions.",
    rail:"Situation -> Recommendation -> Evidence -> Tradeoffs -> Assumptions -> Next steps",
    intake:"What is the strategic question, and what is your current position on it?" },
  { id:"okr-design", label:"OKR / Goal Design", category:"Strategy", depth:"medium",
    desc:"Objectives and key results with causal logic named: hypotheses to test, not tasks to complete.",
    rail:"Objective -> Why it matters -> Key results -> Causal logic -> What failure looks like",
    intake:"What period are these for, and what is the team or organization trying to change?" },
  { id:"strategy-update-memo", label:"Strategy Update Memo", category:"Strategy", depth:"medium",
    desc:"Updates stakeholders on a strategy already in motion: what is working, what changed, and what you are adjusting.",
    rail:"Original bet -> What is working -> What changed -> What you are adjusting -> What stays fixed",
    intake:"What strategy are you updating people on, and what has changed since you set it?" },
  { id:"market-entry-memo", label:"Market Entry Memo", category:"Strategy", depth:"full",
    desc:"Decision memo for entering a new market or segment: the opportunity, the wedge, the risks, and the commitment required.",
    rail:"Opportunity -> Why now -> Entry wedge -> What it costs -> Risks -> Go or no-go",
    intake:"What market or segment are you considering entering, and what is the wedge you would lead with?" },
  { id:"operating-cadence", label:"Operating Cadence Design", category:"Operations", depth:"medium",
    desc:"Team meeting and decision rhythm: what gets reviewed when, by whom, with what authority.",
    rail:"Decision types -> Meeting structure -> Cadence -> Owners -> What should not be a meeting",
    intake:"What team or function is this for, and what decisions need a regular forum?" },
  // ── Hiring & People ──
  { id:"job-description", label:"Job Description", category:"Hiring", depth:"short",
    desc:"JD with problem the role solves, 90-day success definition, actual requirements vs. preferred, honest tradeoffs.",
    rail:"Problem this role solves -> Success at 90 days -> Required vs preferred -> What the role cannot offer",
    intake:"What role are you hiring for, and what problem does it solve?" },
  { id:"onboarding-plan", label:"Onboarding Plan", category:"Hiring", depth:"medium",
    desc:"30/60/90 onboarding plan with milestones, success signals, and what the new hire learns vs. does vs. decides.",
    rail:"30 days: learn -> 60 days: contribute -> 90 days: own -> Success signals -> Support structure",
    intake:"What role is this for, and what does the person need to be able to do at 90 days?" },
  { id:"performance-review", label:"Performance Review", category:"Hiring", depth:"medium",
    desc:"Structured performance review with evidence, impact, development direction, and honest gap naming.",
    rail:"Evidence of performance -> Impact -> What is working -> What needs to change -> Development direction",
    intake:"Who is this review for, what period does it cover, and what is the context?" },
  { id:"org-design-memo", label:"Organizational Design Memo", category:"Hiring", depth:"full",
    desc:"Proposal for restructuring a team or function: what is breaking, what the new design solves, who is affected.",
    rail:"What is breaking -> Proposed design -> What it solves -> What it creates -> Who is affected -> Decision required",
    intake:"What team or function is being redesigned, and what problem is driving it?" },
  // ── Sales & Client-Facing ──
  { id:"proposal", label:"Proposal / Statement of Work", category:"Sales", depth:"full", featured:true,
    desc:"Client proposal with problem statement, proposed approach, scope, timeline, investment, and success definition.",
    rail:"Problem -> Approach -> Scope -> Out-of-scope -> Timeline -> Investment -> Success definition",
    intake:"What is the client's problem, and what are you proposing?" },
  { id:"qbr", label:"Executive Business Review (QBR)", category:"CustomerSuccess", depth:"medium", featured:true,
    desc:"Quarterly review: what was committed, what was delivered, gaps, next period goals, and client decision required.",
    rail:"Commitments -> Delivered -> Gaps -> Root cause -> Next period -> Decision required from client",
    intake:"Which account is this for, what period are you reviewing, and what is the relationship status?" },
  { id:"renewal-risk-memo", label:"Renewal Risk Memo", category:"CustomerSuccess", depth:"medium",
    desc:"An internal account memo that names renewal risk early: the signals, the root cause, and the save plan.",
    rail:"Account -> Renewal date -> Risk signals -> Root cause -> Save plan -> Owner and next step",
    intake:"Which account is at risk, when does it renew, and what is the first warning sign you noticed?" },
  { id:"customer-onboarding-plan", label:"Customer Onboarding Plan", category:"CustomerSuccess", depth:"medium",
    desc:"A post-sale plan that gets a new customer to first value: milestones, owners, and the signal that they are succeeding.",
    rail:"Customer goal -> First value milestone -> 30/60/90 plan -> Owners -> Success signal -> Risks",
    intake:"Which customer just signed, and what does success look like for them in the first 90 days?" },
  { id:"case-study", label:"Case Study / Win Story", category:"Sales", depth:"short",
    desc:"Customer win document with problem, approach, result, and what made it work, for sales and marketing use.",
    rail:"Customer situation -> Problem -> Approach -> Result -> What made it work -> Replicability",
    intake:"Which customer is this for, and what was the win?" },
  { id:"discovery-call-plan", label:"Discovery Call Plan", category:"Sales", depth:"short",
    desc:"A pre-call plan that names the questions to ask, the signals to listen for, and the next step you want to earn.",
    rail:"Who you are meeting -> What you need to learn -> Questions to ask -> Disqualifiers -> Next step to earn",
    intake:"Who is the call with, and what do you most need to find out before proposing anything?" },
  // ── Finance & Operations ──
  { id:"investment-memo", label:"Investment Memo", category:"Finance", depth:"full",
    desc:"Internal capital allocation memo with situation, proposal, assumptions, risks, and a clear ask.",
    rail:"Situation -> Proposal -> Expected return -> Assumptions -> Risks -> Ask",
    intake:"What investment is being proposed, what is the expected return, and what is the ask?" },
  { id:"budget-proposal", label:"Budget Proposal", category:"Finance", depth:"medium",
    desc:"A budget request tied to outcomes: what the money buys, what it produces, and what gets cut if it is not funded.",
    rail:"What you are requesting -> What it funds -> Expected outcome -> Tradeoffs -> What happens if unfunded",
    intake:"What are you requesting budget for, and what does it produce that the business needs?" },
  { id:"pricing-change-memo", label:"Pricing Change Memo", category:"Finance", depth:"full",
    desc:"A decision memo for a pricing change: the rationale, the modeled impact, the risks, and the rollout.",
    rail:"Current pricing -> Why change -> Proposed pricing -> Modeled impact -> Risks -> Rollout plan",
    intake:"What pricing change are you considering, and what problem is it meant to solve?" },
  { id:"risk-register", label:"Risk Register", category:"Operations", depth:"medium",
    desc:"Structured risk catalog with probability, impact, owner, mitigation status, and review cadence.",
    rail:"Risk identification -> Probability -> Impact -> Owner -> Mitigation -> Status -> Review date",
    intake:"What project, function, or initiative is this risk register for?" },
  { id:"vendor-scorecard", label:"Vendor Evaluation Scorecard", category:"Operations", depth:"medium",
    desc:"Vendor comparison document with criteria defined first, scores per criterion, TCO, and recommendation.",
    rail:"Requirements -> Criteria with weights -> Vendor scores -> TCO -> Recommendation -> Risks",
    intake:"What capability are you sourcing, and which vendors are being evaluated?" },

  // ── Fundraising & Investor Relations ──
  // Highest viral surface: founders share these widely, and each shared doc exposes a
  // new founder to the method. High repeat use across a raise and across portfolio life.
  { id:"grant-proposal", label:"Grant Proposal", category:"Fundraising", depth:"full",
    desc:"Funder-ready proposal for government, foundation, or research grants: documented need, measurable objectives, project design, evaluation plan, budget justification, and sustainability. Structured to the criteria reviewers score against.",
    rail:"Statement of need -> Goals and measurable objectives -> Project design -> Evaluation plan -> Organizational capacity -> Budget justification -> Sustainability",
    intake:"What program needs funding, and are you responding to a government solicitation (NOFO/RFP), a foundation, or a specific grant program? If there is a solicitation, what sections and priorities does it require (and paste its formatting instructions if available: page limit, font, margins, section order)?" },
  { id:"case-for-support", label:"Case for Support", category:"Fundraising", depth:"medium",
    desc:"The donor-facing case behind a major gift for a university or nonprofit: the need, the vision, the impact, and what the gift makes possible. The instrument for major-gift and campaign asks, not a grant proposal.",
    rail:"The need -> Vision -> What the gift enables -> Impact and proof -> The ask",
    intake:"What are you raising for, who is the donor or audience, and what specific gift and recognition are you asking for?" },
  { id:"pitch-narrative", label:"Pitch Deck Narrative", category:"Fundraising", depth:"full",
    desc:"The story arc behind a pitch deck: problem, insight, why now, what you do, and why you win.",
    rail:"Problem -> Insight -> Why now -> What you do -> Why you win -> The ask",
    intake:"What does your company do, who is it for, and what are you raising?" },
  { id:"investor-update", label:"Monthly Investor Update", category:"Fundraising", depth:"medium",
    desc:"Recurring investor update with metrics, wins, lowlights, asks, and what changed since last month.",
    rail:"Headline -> Metrics -> Wins -> Lowlights -> Asks -> What changed",
    intake:"What period is this update for, and what are the two or three things investors most need to know?" },
  { id:"fundraise-strategy", label:"Fundraise Strategy Memo", category:"Fundraising", depth:"full",
    desc:"Internal plan for a raise: amount, milestones it funds, target investors, timeline, and fallback.",
    rail:"Amount and why -> Milestones it funds -> Target investors -> Timeline -> Terms stance -> Fallback",
    intake:"How much are you raising, what does it need to get you to, and when do you want to close?" },
  { id:"one-pager", label:"Company One-Pager", category:"Fundraising", depth:"short",
    desc:"Single-page company summary for investor inboxes: what, who, traction, team, and ask.",
    rail:"What you do -> Market -> Traction -> Team -> The ask",
    intake:"What does the company do, and what is the single most compelling fact about it?" },
  { id:"data-room-summary", label:"Data Room Summary", category:"Fundraising", depth:"medium",
    desc:"Diligence-ready summary of the business: model, metrics, cohorts, risks, and what the data shows.",
    rail:"Business model -> Core metrics -> Cohorts -> Unit economics -> Risks -> What the data shows",
    intake:"What stage is the business at, and what are the metrics a diligent investor will scrutinize first?" },
  { id:"investor-faq", label:"Investor Objection FAQ", category:"Fundraising", depth:"medium",
    desc:"The hard questions investors will ask, with honest, evidence-backed answers prepared in advance.",
    rail:"Likely objections -> The real concern behind each -> Honest answer -> Evidence -> What you concede",
    intake:"What are you raising for, and what is the objection you are most worried about hearing?" },
  { id:"board-deck", label:"Board Meeting Deck Outline", category:"Fundraising", depth:"full",
    desc:"Board deck structure: performance against plan, the hard topics, decisions needed, and discussion asks.",
    rail:"Performance vs plan -> Key metrics -> Hard topics -> Decisions needed -> Discussion asks",
    intake:"What period does this board meeting cover, and what is the hardest thing you need to put in front of them?" },
  { id:"safe-note-rationale", label:"Round Terms Rationale", category:"Fundraising", depth:"medium",
    desc:"Internal memo explaining the terms of a round: valuation logic, dilution, and tradeoffs accepted.",
    rail:"Instrument -> Valuation logic -> Dilution -> Investor rights -> Tradeoffs accepted -> Recommendation",
    intake:"What terms are on the table, and what is the decision you are working through?" },
  { id:"angel-outreach", label:"Investor Outreach Note", category:"Fundraising", depth:"short",
    desc:"A cold or warm investor outreach message with a clear hook, proof, and specific ask.",
    rail:"Hook -> Why them -> Proof point -> The ask -> Easy next step",
    intake:"Who are you reaching out to, and what is the one proof point most likely to earn a meeting?" },
  { id:"use-of-funds", label:"Use of Funds Plan", category:"Fundraising", depth:"medium",
    desc:"Allocation plan for raised capital tied to milestones, with the logic for each major line.",
    rail:"Total raised -> Allocation by area -> Milestones each funds -> Runway -> What you will prove",
    intake:"How much are you raising, and what are the milestones the capital must reach?" },
  { id:"fundraise-retro", label:"Fundraise Retrospective", category:"Fundraising", depth:"short",
    desc:"After-action review of a raise: what worked, what stalled, and what to change next time.",
    rail:"What worked -> What stalled -> Why -> What changed conviction -> What to do differently",
    intake:"What round did you just run, and what was the hardest part of getting it closed?" },

  // ── Marketing & Growth ──
  // Highest frequency and recurrence: these documents are produced constantly and are
  // cross-functional, pulling non-technical users into the product and driving repeat use.
  { id:"launch-brief", label:"Product Launch Brief", category:"Marketing", depth:"full",
    desc:"Go-to-market brief for a launch: audience, message, channels, assets, timeline, and success metric.",
    rail:"What is launching -> Audience -> Core message -> Channels -> Assets -> Timeline -> Success metric",
    intake:"What are you launching, who is it for, and when does it go live?" },
  { id:"positioning-statement", label:"Positioning Statement", category:"Marketing", depth:"medium", featured:true,
    desc:"Positioning doc: target customer, category, key benefit, differentiation, and reasons to believe.",
    rail:"Target customer -> Category -> Key benefit -> Differentiation -> Reasons to believe",
    intake:"What is the product, who is it for, and what is the main alternative people use today?" },
  { id:"messaging-framework", label:"Messaging Framework", category:"Marketing", depth:"medium",
    desc:"Message hierarchy: one core promise, supporting pillars, proof points, and audience variations.",
    rail:"Core promise -> Pillars -> Proof points -> Audience variations -> What we never say",
    intake:"What product or campaign is this for, and what is the single promise it should make?" },
  { id:"content-brief", label:"Content Brief", category:"Marketing", depth:"short",
    desc:"Brief for a piece of content: audience, the one idea, the takeaway, structure, and call to action.",
    rail:"Audience -> The one idea -> Takeaway -> Structure -> Call to action",
    intake:"What are you writing, who is it for, and what should they do after reading it?" },
  { id:"campaign-plan", label:"Campaign Plan", category:"Marketing", depth:"full",
    desc:"Integrated campaign plan: goal, audience, message, channel mix, budget logic, and measurement.",
    rail:"Goal -> Audience -> Message -> Channel mix -> Budget logic -> Measurement -> Risks",
    intake:"What is the campaign trying to achieve, by when, and what is the budget envelope?" },
  { id:"gtm-strategy", label:"Go-To-Market Strategy", category:"Marketing", depth:"full", featured:true,
    desc:"GTM plan: ideal customer, motion, pricing logic, channels, and the first 90 days of execution.",
    rail:"Ideal customer -> Motion -> Pricing logic -> Channels -> First 90 days -> Leading indicators",
    intake:"What are you taking to market, and who is the very first customer you want to win?" },
  { id:"landing-page-copy", label:"Landing Page Copy Brief", category:"Marketing", depth:"short",
    desc:"Structured landing page brief: promise, proof, objections handled, and a single clear action.",
    rail:"Headline promise -> Subhead -> Proof -> Objections handled -> Single action",
    intake:"What does this page sell, who lands on it, and what is the one action you want?" },
  { id:"customer-research-plan", label:"Customer Research Plan", category:"Marketing", depth:"medium",
    desc:"Plan for customer interviews or surveys: the decision it informs, questions, and what would change your mind.",
    rail:"Decision this informs -> Who to talk to -> Questions -> What would change your mind -> Synthesis plan",
    intake:"What decision are you trying to inform, and who do you need to hear from?" },
  { id:"brand-voice-guide", label:"Brand Voice Guide", category:"Marketing", depth:"medium",
    desc:"Voice and tone guide: personality, principles, do and do-not examples, and how voice shifts by context.",
    rail:"Personality -> Principles -> Do examples -> Do-not examples -> Voice by context",
    intake:"What brand is this for, and what are three words that should describe how it sounds?" },
  { id:"seo-content-plan", label:"SEO Content Plan", category:"Marketing", depth:"medium",
    desc:"Search-driven content plan: target topics, intent, priority logic, and what success looks like.",
    rail:"Target topics -> Search intent -> Priority logic -> Content map -> Success metric",
    intake:"What do you want to rank for, and who are you trying to reach when they search it?" },
  { id:"newsletter-strategy", label:"Newsletter Strategy", category:"Marketing", depth:"short",
    desc:"Strategy for a recurring newsletter: audience, promise, cadence, format, and growth loop.",
    rail:"Audience -> Promise -> Cadence -> Format -> Growth loop -> Success metric",
    intake:"Who is the newsletter for, and what is the promise that makes someone subscribe?" },

  // ── Personal & Career ──
  // Broadest top-of-funnel: individuals search for and share these documents, making them
  // the widest acquisition wedge into the product for non-team users.
  { id:"resume", label:"Resume", category:"Career", depth:"medium",
    desc:"Resume built around impact and evidence: what you changed, by how much, and what it proves.",
    rail:"Target role -> Positioning -> Impact bullets with evidence -> Skills -> What to cut",
    intake:"What role are you targeting, and what is the achievement you are proudest of?" },
  { id:"cover-letter", label:"Cover Letter", category:"Career", depth:"short",
    desc:"Cover letter that connects your evidence to their problem, not a summary of your resume.",
    rail:"Their problem -> Why you -> Proof -> Fit -> Close",
    intake:"What role and company is this for, and why do you actually want it?" },
  { id:"self-review", label:"Performance Self-Review", category:"Career", depth:"medium",
    desc:"Self-assessment with evidence of impact, honest growth areas, and where you want to go next.",
    rail:"Period -> Impact with evidence -> What worked -> Growth areas -> Where I want to go next",
    intake:"What period does this cover, and what is the accomplishment you most want recognized?" },
  { id:"promotion-case-doc", label:"Promotion Case", category:"Career", depth:"full", // v99.7 (M4): id de-duplicated — collided with the Decide catalog's "promotion-case", which injected the Commit-mode contract into Draft sessions
    desc:"The written case for a promotion: scope already operating at, evidence, and the gap you have closed.",
    rail:"Current vs target level -> Evidence of operating above -> Impact -> Gap closed -> The ask",
    intake:"What level are you at, what are you arguing for, and what is your strongest piece of evidence?" },
  { id:"salary-negotiation", label:"Salary Negotiation Prep", category:"Career", depth:"medium",
    desc:"Negotiation prep: your number, the evidence behind it, their likely position, and your walk-away.",
    rail:"Target number -> Evidence -> Their likely position -> Concession order -> Walk-away",
    intake:"What is the offer or situation, and what number are you working toward?" },
  { id:"resignation-letter", label:"Resignation Letter", category:"Career", depth:"short",
    desc:"A clean, professional resignation that preserves the relationship and states the transition clearly.",
    rail:"Statement -> Last day -> Transition offer -> Gratitude -> Close",
    intake:"When is your last day, and what tone do you want to leave on?" },
  { id:"linkedin-about", label:"LinkedIn About Section", category:"Career", depth:"short",
    desc:"A LinkedIn summary that leads with what you do for whom, backed by proof, in your own voice.",
    rail:"What you do for whom -> Proof -> What drives you -> What you are looking for",
    intake:"What do you want to be known for, and who do you want to find you?" },
  { id:"career-plan", label:"Career Development Plan", category:"Career", depth:"medium",
    desc:"A personal plan: where you want to be, the gap, the moves that close it, and how you will know.",
    rail:"Where you want to be -> Current gap -> Moves that close it -> Milestones -> Signals of progress",
    intake:"Where do you want to be in two years, and what is the biggest gap between here and there?" },
  { id:"networking-outreach", label:"Networking Outreach Note", category:"Career", depth:"short",
    desc:"A warm outreach message that gives a reason to reply and asks for one specific, easy thing.",
    rail:"Connection -> Why them -> Specific ask -> Easy yes -> Close",
    intake:"Who are you reaching out to, and what is the one thing you actually want from them?" },
  { id:"interview-prep", label:"Interview Prep Brief", category:"Career", depth:"medium",
    desc:"Preparation for a specific interview: their likely questions, your stories, and your questions for them.",
    rail:"Role and stakes -> Likely questions -> Your stories -> Gaps to address -> Your questions for them",
    intake:"What role and round is this interview for, and what are you most worried they will ask?" },
];

// Single source of truth for document category order, label, glyph, and blurb.
// Both the Document tab accordion (TemplatesView) and the Home "start from a document
// type" list consume this; membership comes from each template's `category` field, so
// neither order nor contents can drift between the two surfaces. Personal & Career
// leads (broadest applicability). ids match the DOCUMENT_TEMPLATES `category` value.
const DOC_CATEGORIES = [
  // v125: ordered to the wedge. Segment A topics lead, Segment B mid, Segment C below,
  // cross-cutting and individual topics last but still reachable.
  { id:"Strategy",        label:"Strategy & Leadership",  icon:Compass,    blurb:"Strategy memos, OKRs, operating cadence" },
  { id:"Sales",           label:"Sales & Client-Facing",  icon:Target,     blurb:"Proposals, statements of work, case studies" },
  { id:"Marketing",       label:"Marketing & Growth",     icon:Megaphone,  blurb:"Launch briefs, positioning, messaging, campaign and GTM plans" },
  { id:"CustomerSuccess", label:"Customer Success",       icon:RotateCcw,  blurb:"Executive business reviews, QBRs" },
  { id:"Product",         label:"Product & Engineering",  icon:Layers,     blurb:"PRDs, design docs, post-mortems, retrospectives" },
  { id:"Operations",      label:"Operations",             icon:Sliders,    blurb:"Incident post-mortems, retrospectives, cadence design, risk registers" },
  { id:"Fundraising",     label:"Fundraising & Development", icon:DollarSign, blurb:"Grant proposals, case for support, pitch narratives, investor updates, board decks" },
  { id:"Finance",         label:"Finance & Operations",   icon:BarChart3,  blurb:"Investment memos, risk registers, vendor scorecards" },
  { id:"Hiring",          label:"Hiring & People",        icon:Users,      blurb:"Job descriptions, onboarding plans, performance reviews, org design" },
  { id:"Career",          label:"Personal & Career",      icon:User,       blurb:"Resumes, cover letters, promotion cases, negotiation and interview prep" },
];
const docItemsForCategory = (catId) => DOCUMENT_TEMPLATES.filter(t => t.category === catId);

const documentTemplateIdForLabel = (label) => { const t = DOCUMENT_TEMPLATES.find(x => x.label === label); return t ? t.id : null; };

// v113.1: documentDepthForId resolves a Draft template's depth hint (short | medium
// | full) for maxTokensForMode. Was referenced (L4373) and described in the v90 note
// but never defined, so every templated Draft turn threw a ReferenceError before the
// API call. Unknown id or no template defaults to "full" to avoid truncation, matching
// the free-form Draft default.
const documentDepthForId = (id) => { const t = DOCUMENT_TEMPLATES.find(x => x.id === id); return t ? (t.depth || "full") : "full"; };


// v99.7 (M4): the two catalogs share one id namespace downstream — artifactDefinitionFor,
// templateNameFromId, and stagedIntakeForCard all resolve Decide first. A collision
// silently injects the wrong output contract; the "promotion-case" duplicate did exactly
// that, feeding a Commit-mode contract into the Draft prompt. Warn loudly if it recurs.
(() => { try {
  const _seen = new Set(TEMPLATES.map(t => t.id));
  DOCUMENT_TEMPLATES.forEach(t => { if (_seen.has(t.id)) console.warn("[WorkOutput] duplicate template id across Decide/Draft catalogs:", t.id); });
} catch(_){} })();

// DOCUMENT_TEMPLATE output contracts — same structure as TEMPLATE_OUTPUT_CONTRACTS.
// Document contracts enforce completeness, not correctness.
// The obligation line names what the author is most likely to omit.
const DOCUMENT_OUTPUT_CONTRACTS = {
  "prd": {
    rail: "Name the problem before naming the solution. A PRD that starts with the feature is not a PRD — it is a spec.",
    sections: ["Problem statement (what breaks without this)", "Users and buyers (named separately if different)", "Success metrics (defined before scope, not after)", "Scope: what is included", "Out-of-scope: what is explicitly excluded", "Open questions (unresolved items that could change scope)"],
    obligations: "The out-of-scope section is the one most authors omit. It is not optional. A PRD without an explicit out-of-scope produces scope creep before the first sprint ends.",
  },
  "technical-design": {
    rail: "Present the options you evaluated before presenting the option you chose. A design document that presents only the chosen solution is a rationale, not a design document.",
    sections: ["Problem and constraints", "Options evaluated with tradeoffs per option", "Decision made and rationale", "Architecture or implementation overview", "Open questions and future considerations", "Risks and mitigations"],
    obligations: "Name the option that would have been chosen if the constraints were different. That option belongs in the document. It is the most useful thing for future engineers to know.",
  },
  "api-design-review": {
    rail: "Review consistency before reviewing capability. An API that works but is inconsistent with the rest of the surface creates permanent maintenance debt.",
    sections: ["Proposed API surface summary", "Consistency with existing conventions", "Extensibility: what this design allows and prevents", "Breaking change risk if adopted", "Naming and ergonomics", "Recommendation: approve / approve with changes / reject"],
    obligations: "Name at least one thing the API design prevents that future engineers will want to do. That is the extensibility cost and it belongs in the document.",
  },
  "incident-post-mortem": {
    rail: "Root cause is not the same as proximate cause. Keep asking why until you reach a systemic failure, not a human mistake.",
    sections: ["Incident timeline", "Root cause (systemic, not individual)", "Contributing factors", "Impact: customers, data, revenue, trust", "What changed to resolve it", "Structural changes to prevent recurrence", "What we would do differently"],
    obligations: "The structural changes section is the one that gets written as platitudes. Name the specific change, the owner, and the date by which it will be complete. Vague commitments are not post-mortem outputs.",
  },
  "sprint-retro": {
    rail: "One structural change is worth more than a list of improvements. Teams that commit to one thing and do it build better cadences than teams that list ten and do none.",
    sections: ["What worked well (with specific examples)", "What did not work (with root cause, not just symptoms)", "The main friction point this cycle", "One structural change for next cycle", "Owner of the structural change", "How we will know it worked"],
    obligations: "Name the thing the team will probably not change even though it should. Surface it as the real constraint, even if it is not the one the team will act on this cycle.",
  },
  "strategy-memo": {
    rail: "Recommendation before evidence. Executives who read the evidence before the recommendation read it to confirm what they expect. Give them the recommendation so they can read the evidence to challenge it.",
    sections: ["Situation: what is true now", "Recommendation (stated first)", "Evidence supporting the recommendation", "Tradeoffs: what this approach gives up", "Assumptions: what must be true for this to work", "Next steps with owners"],
    obligations: "Name the assumption that is most likely to be wrong. A strategy memo without a named fragile assumption is not honest. It is optimism dressed as strategy.",
  },
  "okr-design": {
    rail: "Key results are hypotheses, not tasks. If completing the key result does not prove the objective was achieved, the key result is a task disguised as a metric.",
    sections: ["Objective: what changes and why it matters", "Key results (2-4 per objective)", "Causal logic: how achieving the KRs proves the objective", "What failure looks like at mid-period", "What success looks like at end of period", "What is explicitly not in scope"],
    obligations: "Name the key result that is a task disguised as a metric. 'Complete X by Y date' is a task. Replace it with a measurable outcome.",
  },
  "operating-cadence": {
    rail: "Design for the decisions that need to be made, not for the meetings that feel productive.",
    sections: ["Decision types requiring a regular forum", "Meeting structure per decision type", "Cadence and attendees", "Decision authority at each forum", "What should not be a meeting", "How to handle escalations between cadence events"],
    obligations: "Name the meeting that currently exists that this cadence should replace or eliminate. A new cadence without eliminating an old one adds load without clarity.",
  },
  "job-description": {
    rail: "Write the 90-day success definition before writing the requirements. Requirements derived from success look different from requirements derived from job titles.",
    sections: ["Problem this role solves for the organization", "What success looks like at 30, 60, and 90 days", "Required qualifications (genuinely required, not preferred)", "Preferred qualifications (honest about what is nice-to-have)", "What this role cannot offer (honest tradeoffs)", "How decisions are made in this role"],
    obligations: "The 'what this role cannot offer' section is the one most JDs omit. It is the section that filters for the right candidates and builds trust with the ones who stay.",
  },
  "onboarding-plan": {
    rail: "The first 30 days should be learning, not delivering. New hires who are pushed to deliver before they understand the context make decisions that compound incorrectly.",
    sections: ["Days 1-30: what to learn and from whom", "Days 31-60: first contributions and checkpoints", "Days 61-90: what to own independently", "Success signals at each phase", "Who supports them and how", "Open questions the new hire should resolve by day 90"],
    obligations: "Name the thing the new hire will be expected to do that is not written down anywhere. That undocumented expectation belongs in the onboarding plan.",
  },
  "performance-review": {
    rail: "Evidence before assessment. An assessment without specific evidence is an opinion. Specific evidence with an assessment is a review.",
    sections: ["Performance evidence: specific examples with impact", "What is working well", "What needs to change (specific, not general)", "Development direction for the next period", "Support and resources required", "Honest gap: what is not yet being said"],
    obligations: "Name the thing you have been avoiding saying in previous conversations with this person. If it is true and important, it belongs in this review. Saving it for the next one compounds the problem.",
  },
  "org-design-memo": {
    rail: "Name what is breaking before proposing the fix. A restructuring proposal without a named problem is a preference, not a proposal.",
    sections: ["What is breaking in the current design", "Proposed structure", "What the new design solves", "What the new design creates or risks", "Who is affected and how", "Decision required and from whom", "Timeline and communication plan"],
    obligations: "Name the person whose role changes most significantly and whether they have been consulted. A restructuring memo that has not engaged the most-affected person is not ready.",
  },
  "proposal": {
    rail: "Lead with their problem, not your solution. A proposal that opens with what you offer is a brochure. A proposal that opens with what they face is a conversation.",
    sections: ["Client situation and problem (their language, not yours)", "Proposed approach", "Scope: what is included", "Out-of-scope: what is not included", "Timeline and milestones", "Investment", "What success looks like", "What you need from the client to start"],
    obligations: "Name what is out of scope. A proposal without an explicit out-of-scope creates the conditions for every scope dispute that follows.",
  },
  "qbr": {
    rail: "Name the gap before explaining it. Clients who hear about a gap buried in context feel managed. Clients who hear about it directly feel respected.",
    sections: ["Commitments made last period", "What was delivered", "Gaps: what was not delivered and why", "What changes next period as a result", "Goals for next period", "Decision or action required from the client"],
    obligations: "Name the commitment from the client side that was not met and that contributed to any gaps. A QBR that holds only the vendor accountable is not an honest business review.",
  },
  "case-study": {
    rail: "The result is not the story. The moment of change is the story. What was the customer willing to try that they had not tried before?",
    sections: ["Customer situation before", "The problem they could not solve", "What they tried before WorkOutput", "Approach taken", "Result (specific and measurable where possible)", "What made it work", "Quote or voice of customer", "Who this story is for (ideal replication profile)"],
    obligations: "Name what would have to be true for this story to replicate. A case study without a replicability assessment is a testimonial, not a sales tool.",
  },
  "investment-memo": {
    rail: "State the ask before the case. Decision-makers who read the case before the ask shape their read to confirm their prior. Give them the ask first.",
    sections: ["Situation: what is the opportunity or problem", "Proposed investment and ask", "Expected return and timeline", "Assumptions (named and testable)", "Risks and mitigations", "What happens if we do not invest", "Decision required by whom and when"],
    obligations: "Name the assumption that has the highest probability of being wrong. A memo that does not name its weakest assumption is not ready for a decision.",
  },
  "risk-register": {
    rail: "Probability times impact before mitigation. Teams that jump to mitigation without scoring risk allocate effort incorrectly.",
    sections: ["Risk identification and description", "Probability: Low / Medium / High", "Impact: Low / Medium / High", "Risk score (P × I)", "Owner", "Mitigation or acceptance rationale", "Mitigation status", "Review date"],
    obligations: "Name the risk that has no owner. Unowned risks are not risks — they are future incidents.",
  },
  "vendor-scorecard": {
    rail: "Define criteria before evaluating vendors. Criteria defined after evaluation are rationalization.",
    sections: ["Requirement summary", "Evaluation criteria with weights (defined before scoring)", "Vendor scores per criterion", "Total cost of ownership per vendor", "Switching cost and lock-in risk", "Recommendation with rationale", "Conditions or next steps"],
    obligations: "Name the criterion that changed weight during the evaluation. If a criterion's weight shifted after you saw the vendor scores, name it and explain why. That shift is the most important thing in the document.",
  },
};

// Combined artifact definition lookup — checks Decide contracts first, then Draft contracts.
function artifactDefinitionFor(templateId) {
  const t = TEMPLATES.find(x => x.id === templateId) || DOCUMENT_TEMPLATES.find(x => x.id === templateId);
  if (!t) return "";
  const contract = TEMPLATE_OUTPUT_CONTRACTS[templateId] || DOCUMENT_OUTPUT_CONTRACTS[templateId];
  if (!contract) {
    return `\nACTIVE TEMPLATE: ${t.label} — ${t.desc}`;
  }
  const sections = contract.sections.map((s, i) => `  ${i + 1}. ${s}`).join("\n");
  const frameLabel = DOCUMENT_OUTPUT_CONTRACTS[templateId] ? "Draft" : "Commit";
  return `
ACTIVE TEMPLATE: ${t.label}
Document rail: ${contract.rail}
Required output sections (${frameLabel} mode must include all of these):
${sections}
Completeness obligation: ${contract.obligations}
Do not produce output that omits any required section. Do not satisfy a section with a single sentence when substance exists.`;
}

// Decide which domains to load. Returns an array of domain keys (possibly empty).
function selectDomains({decisionState, recentText}) {
  const picked = new Set();
  // 1. From selected template category
  if (decisionState?.selectedTemplate) {
    const t = TEMPLATES.find(x=>x.id===decisionState.selectedTemplate);
    if (t && CATEGORY_TO_DOMAINS[t.category]) CATEGORY_TO_DOMAINS[t.category].forEach(d=>picked.add(d));
  }
  // 2. From decision type
  if (decisionState?.decisionType && DECISIONTYPE_TO_DOMAINS[decisionState.decisionType]) {
    DECISIONTYPE_TO_DOMAINS[decisionState.decisionType].forEach(d=>picked.add(d));
  }
  // 3. Keyword fallback over recent text (only if we still have nothing, or to enrich)
  if (recentText) {
    for (const [domain, rx] of Object.entries(DOMAIN_KEYWORDS)) {
      if (rx.test(recentText)) picked.add(domain);
    }
  }
  // Cap at 3 domains — multi-domain decisions are allowed but bounded.
  return Array.from(picked).slice(0, 3);
}

// v82: artifactDefinitionFor expanded from a one-line label to a full per-template
// output contract. Injects: the active artifact name, the required stage rail,
// the sections the Commit output MUST contain, and the analytical obligations the
// model must satisfy before a commit is complete. No user friction — all prompt-side.
// Cached as part of the variable tail (uncached) because it changes per template.
const TEMPLATE_OUTPUT_CONTRACTS = {
  // ── Strategy & Decision ──────────────────────────────────────────────────
  "go-no-go": {
    rail: "Clarify the decision criteria first. Explore the evidence against each criterion. Commit only when a recommendation is defensible.",
    sections: ["Decision criteria (named and weighted)", "Evidence against each criterion", "Recommendation: Go or No-Go", "Load-bearing assumption", "What would change this call"],
    obligations: "You must name at least one criterion that pushes toward No-Go, even if the overall call is Go. A Go recommendation without a named downside is incomplete.",
  },
  "market-entry": {
    rail: "Map the opportunity, then the moat, then the entry risk. Do not recommend entry until risk is named.",
    sections: ["Market opportunity and timing rationale", "Moat or differentiation claim", "Entry risk and failure modes", "Resource requirement", "Recommendation with conditions"],
    obligations: "Name the single highest-risk assumption. If market size is asserted, require it to be sourced or flagged as estimated.",
  },
  "competitive-response": {
    rail: "Read the competitor move accurately before proposing a response. Do not mirror-image.",
    sections: ["What the competitor actually did (not what it signals)", "What is at stake if no response", "Response options with tradeoffs", "Recommended response and rationale", "Assumption: what must be true for this to work"],
    obligations: "At least one response option must be 'do nothing / wait' with an honest assessment of that choice.",
  },
  "budget-reallocation": {
    rail: "Clarify what is being funded and what is being cut. Quantify both sides before recommending.",
    sections: ["Current allocation and what it buys", "Proposed reallocation", "What the cut loses", "What the gain enables", "Risk of the shift"],
    obligations: "Name the stakeholder most affected by the cut. A reallocation without a named loser is not complete.",
  },
  "pricing-change-impact": {
    rail: "Model the scenario before recommending. Revenue impact and volume sensitivity are required.",
    sections: ["Current pricing baseline", "Proposed change and rationale", "Revenue and volume sensitivity", "Competitive exposure", "Recommendation with go/no-go conditions"],
    obligations: "Surface the elasticity assumption explicitly. If unknown, name it as the critical unknown.",
  },
  // ── Sales & GTM ──────────────────────────────────────────────────────────
  "gtm-motion": {
    rail: "Match motion to the buying behavior of the ICP, not the preference of the sales team.",
    sections: ["ICP buying behavior and sales cycle", "Motion options evaluated", "Economics per motion (CAC, cycle length, coverage)", "Recommended motion", "First milestone that confirms the choice"],
    obligations: "Name the motion that would work best if resources were unconstrained, then the motion that is realistic given current capacity.",
  },
  "pricing-model": {
    rail: "Price-to-value before price-to-cost. Anchor on the buyer's willingness to pay.",
    sections: ["Value delivered to buyer", "Competing models and their economics", "Recommended model with rationale", "Risk of the chosen model", "Metrics that confirm or invalidate the choice"],
    obligations: "Name the customer segment where this model works least well.",
  },
  "icp-narrowing": {
    rail: "Narrow on signal, not on preference. Use conversion and retention data if available.",
    sections: ["Current ICP definition", "Conversion and retention signal by segment", "Proposed narrowed ICP", "What is excluded and why", "Test: what does success look like at 90 days"],
    obligations: "Name the segment the team is emotionally attached to that the data does not support.",
  },
  "deal-desk": {
    rail: "Assess exposure before approving. Non-standard terms must be named and scoped.",
    sections: ["Deal summary and non-standard terms", "Exposure by term", "Approve / Reject / Approve with conditions", "Conditions if applicable", "Precedent risk"],
    obligations: "Every non-standard term must have an explicit approve, reject, or condition. Blanket approvals are not complete.",
  },
  // ── Product ──────────────────────────────────────────────────────────────
  "feature-prioritization": {
    rail: "Score on value and effort before ranking. Clarify the evaluation criteria first.",
    sections: ["Evaluation criteria and weights", "Feature scores against criteria", "Ranked list with rationale", "What is explicitly deferred and why", "Assumption: what must be true for the top item to succeed"],
    obligations: "The item ranked first must have a named risk. If it has no risk, the evaluation criteria are incomplete.",
  },
  "build-vs-buy": {
    rail: "TCO first. Capability fit second. Never recommend build without naming the maintenance cost.",
    sections: ["Capability requirement", "Build option: cost, timeline, risk, TCO", "Buy option: cost, integration, lock-in, TCO", "Recommendation", "What would change this call in 12 months"],
    obligations: "Name the switching cost if the chosen option proves wrong. A build-vs-buy without an exit assessment is incomplete.",
  },
  "roadmap-tradeoff": {
    rail: "Name what is being traded, not just what is being chosen.",
    sections: ["Items in tension", "What each item enables", "What each item costs (effort, debt, opportunity)", "Recommended sequencing with rationale", "What the losing item loses by being delayed"],
    obligations: "Surface any item where the cost of delay compounds (i.e., gets harder to do later). Flag it explicitly.",
  },
  "mvp-scope-cut": {
    rail: "Cut to the core proof. Everything that does not test the central assumption is a candidate for removal.",
    sections: ["Central assumption the MVP must test", "Current scope", "Proposed cuts and rationale", "What the cut MVP can and cannot prove", "Minimum success signal at launch"],
    obligations: "Name one thing currently in scope that should be cut but probably won't be, and why it should be cut anyway.",
  },
  "sunset-call": {
    rail: "Measure cost of maintenance against value delivered. Do not retire on sentiment.",
    sections: ["Current usage and cost to maintain", "Value delivered vs alternatives", "Stakeholder impact of retirement", "Retirement plan or recommendation to keep", "What changes this call"],
    obligations: "Name the stakeholder who will push back hardest and their strongest argument.",
  },
  // ── Customer Success & Sales ──────────────────────────────────────────────
  "churn-intervention": {
    rail: "Diagnose the risk signal before proposing the intervention. The wrong intervention accelerates churn.",
    sections: ["Risk signals and their root cause", "What the customer actually needs", "Intervention options", "Recommended intervention", "Success signal at 30 and 90 days"],
    obligations: "Name the intervention most likely to fail and why.",
  },
  "expansion-play": {
    rail: "Expansion must be earned. Identify trigger readiness before proposing timing.",
    sections: ["Expansion candidates with trigger signals", "Readiness criteria for each", "Ranked priority", "Recommended first motion", "Risk: what blocks the expansion"],
    obligations: "Name the account that looks ready but is actually not, and what needs to change.",
  },
  "renewal-save": {
    rail: "Understand the real objection before proposing the save. Price objections are often relationship or value gaps.",
    sections: ["Renewal risk signal and root cause", "Save options with tradeoffs", "Recommended approach", "Concession boundaries", "Walk-away condition"],
    obligations: "Name the concession that would save the deal but set a bad precedent, and whether to make it.",
  },
  // ── AI & Governance ──────────────────────────────────────────────────────
  "ai-risk-assessment": {
    rail: "Classify exposure before assessing risk. High-exposure use cases require governance before recommendation.",
    sections: ["Use case and output action", "Exposure level: Low / Medium / High", "Risk vectors: reliability, bias, privacy, accountability", "Minimum viable governance", "Recommendation: proceed / proceed with safeguards / pause"],
    obligations: "Name the failure mode that is hardest to detect and most costly if it occurs.",
  },
  "hitl-scope": {
    rail: "Define what the human is actually checking, not just that a human is in the loop.",
    sections: ["Automation scope and decision points", "HITL checkpoints with what is reviewed at each", "Failure modes the HITL catches vs misses", "Governance: who owns each checkpoint", "Metric: what confirms the HITL is working"],
    obligations: "Name at least one failure mode the HITL does not catch. A HITL scope with no blind spots is not honest.",
  },
  "model-selection": {
    rail: "Evaluate fit against the use case, not the benchmark. Benchmarks measure different tasks.",
    sections: ["Use case requirements", "Vendor evaluation against requirements", "TCO and lock-in risk", "Governance and data handling", "Recommendation with conditions"],
    obligations: "Name the vendor most likely to win on a demo that would underperform in production, and why.",
  },
  // ── Legal & Compliance ────────────────────────────────────────────────────
  "contract-risk": {
    rail: "Identify exposure before proposing redlines. Not all risk is worth fighting.",
    sections: ["Non-standard or high-risk clauses", "Exposure severity per clause", "Recommended positions: accept / redline / escalate", "Walk-away conditions", "Assumption: what leverage exists"],
    obligations: "Name the clause where the risk is real but the leverage to redline is low. Acknowledge both.",
  },
  "compliance-triage": {
    rail: "Severity and timeline before remediation. Prioritize by what triggers enforcement first.",
    sections: ["Applicable requirements", "Gap assessment per requirement", "Severity and enforcement timeline", "Remediation priority order", "Owner and first action per critical gap"],
    obligations: "Name the gap where the remediation cost exceeds the likely enforcement cost, and whether it is still worth fixing.",
  },
  "terms-negotiation": {
    rail: "Know your walk-away before you negotiate. Anchoring without a walk-away is theater.",
    sections: ["Terms in play", "Your leverage and their leverage", "Target position per term", "Walk-away position", "Concession sequence"],
    obligations: "Name the term you are most likely to concede and make sure it is a deliberate choice, not an accident.",
  },
  // ── Operations ────────────────────────────────────────────────────────────
  "pre-mortem": {
    rail: "Assume failure. Work backward. Do not slide into optimism.",
    sections: ["Assumed failure: what broke", "Failure modes ranked by probability", "Leading indicators that would have predicted each", "Mitigations for the top 3 modes", "What this reveals about the plan"],
    obligations: "The failure mode ranked first must be one the team has not already planned for. If all modes are already mitigated, the pre-mortem was too easy.",
  },
  "vendor-matrix": {
    rail: "Define criteria before evaluating vendors. Post-hoc criteria selection is rationalization.",
    sections: ["Must-have criteria", "Nice-to-have criteria", "Vendor scores against criteria", "TCO and switching cost", "Recommendation with rationale"],
    obligations: "Name the vendor that wins on price but loses on another criterion that should actually matter more.",
  },
  "bottleneck-diagnosis": {
    rail: "Find the binding constraint before proposing fixes. Fixing a non-binding constraint wastes effort.",
    sections: ["Observed symptoms", "Candidate constraints", "Binding constraint and evidence", "Fix options", "What measuring improvement looks like"],
    obligations: "Name the fix that is tempting but addresses a symptom rather than the constraint.",
  },
  "capacity-planning": {
    rail: "Anchor on the demand signal. Do not plan capacity from historical supply.",
    sections: ["Demand signal and confidence", "Current capacity and headroom", "Options: build, buy, defer", "Recommended plan", "Trigger: what demand signal would change this"],
    obligations: "Name the demand assumption most likely to be wrong and what the capacity decision would look like if it is.",
  },
  // ── Fundraising ────────────────────────────────────────────────────────────
  "seed-readiness": {
    rail: "Assess readiness honestly before optimizing the pitch. Unready companies that raise create worse problems.",
    sections: ["Readiness criteria: traction, team, market, model", "Gaps by criterion", "What closing the gaps requires", "Raise recommendation: ready / ready with conditions / not ready", "If raising: what to optimize for in investor selection"],
    obligations: "Name the criterion where the team will overstate readiness to themselves. That is the gap that matters most.",
  },
  "bridge-vs-priced": {
    rail: "Model the dilution before choosing. Bridges feel cheaper than they are.",
    sections: ["Runway situation", "Bridge option: terms, dilution, timeline", "Priced option: terms, dilution, signals sent", "Recommended path", "What makes this decision wrong in 12 months"],
    obligations: "Name the investor who will push back on the chosen path and their strongest argument.",
  },
  // ── Hiring & People ────────────────────────────────────────────────────────
  "hire-no-hire": {
    rail: "Evaluate against the role requirements, not against the interviewer's impression.",
    sections: ["Role requirements", "Candidate assessment against requirements", "Strength and risk summary", "Hire / No-Hire recommendation", "Assumption: what must be true for this to work in 6 months"],
    obligations: "Name the requirement where the evidence is weakest. A hire decision without a named risk is optimism, not judgment.",
  },
  "backfill-restructure": {
    rail: "Question the role before backfilling it. Backfilling a broken role produces the same problem with a new person.",
    sections: ["Role as originally defined", "What the role actually needs to be", "Backfill option: what it assumes", "Restructure option: what changes", "Recommendation with rationale"],
    obligations: "Name the organizational reason the original role was defined the way it was. That reason may still be valid — or it may be the problem.",
  },
  // ── Hiring & People (new) ────────────────────────────────────────────────
  "performance-conversation": {
    rail: "Name the specific behavior before anything else. Do not let the conversation be about attitude or potential — only observable behavior and documented impact.",
    sections: ["Specific behavior (observable, not interpreted)", "Business or team impact", "Required change: what specifically must be different", "Timeline and measurement", "Consequence if unchanged", "Opening statement for the conversation"],
    obligations: "The required change must be specific enough that both parties could agree on whether it happened. 'Better attitude' is not a required change. Name the observable substitute.",
  },
  "promote-or-manage-out": {
    rail: "Assess against the role that exists and the role that is needed, not the person's likability or tenure.",
    sections: ["Current performance against role requirements", "Growth trajectory assessment", "Gap: what is missing for the next level", "Is the gap closeable in this role and timeframe", "Options: promote / develop in role / manage out", "Recommendation with rationale"],
    obligations: "Name the reason this decision has been deferred. That reason is usually the load-bearing assumption. Surface it.",
  },
  "skip-level-meeting": {
    rail: "Be clear internally about whether you are gathering information or signaling expectations. They are different objectives and require different approaches.",
    sections: ["Primary objective: learn or signal (name one)", "Three questions that serve the objective", "What not to say and why", "What the person most needs from this conversation", "Follow-through commitment"],
    obligations: "Name the thing you are most tempted to say that you should not say. That is usually the thing your own manager has said to you that you are passing down without examination.",
  },
  "reference-decision": {
    rail: "Decide what you can honestly say before deciding whether to give the reference at all.",
    sections: ["What you can say honestly and positively", "What you cannot say or would have to omit", "What the requester actually needs to know", "Recommended position: give fully / give with scope / decline", "If declining: how to decline without damaging the person"],
    obligations: "Name the thing that is true about this person that the reference recipient would want to know but that you are not sure you can say. That gap defines the decision.",
  },
  "reference-check-debrief": {
    rail: "Read what was not said as carefully as what was said. Enthusiasm that stops short of 'I would hire them again' is signal.",
    sections: ["What was said: strengths and specific examples given", "What was avoided, hedged, or answered briefly", "Would rehire: what was said and how it was said", "Risk read: what the reference is protecting against", "Overall signal: strong positive / qualified positive / flag / concern"],
    obligations: "Name the one question that produced the least direct answer. That is where the risk lives.",
  },
  "promotion-case": {
    rail: "Build the case from evidence, not from tenure or likability. The decision-maker will look for the gap — name it before they do.",
    sections: ["Evidence: specific contributions with measurable impact", "Narrative: the pattern the evidence shows", "Anticipated objections", "Honest gap acknowledgment", "Response to the gap", "Ask: what exactly are you requesting and when"],
    obligations: "Name the objection that is most likely to succeed if you do not address it. A promotion case without a named weakness is not credible.",
  },
  // ── Personal (new) ─────────────────────────────────────────────────────
  "difficult-conversation": {
    rail: "Prepare the opening before preparing the argument. Most difficult conversations fail at the first sentence.",
    sections: ["What needs to be said (the core message in one sentence)", "What will most likely derail it and how to recover", "What the other person needs from this conversation", "What success looks like at the end of the conversation", "Opening statement: the first thing you will actually say"],
    obligations: "The opening statement must be something you would actually say out loud, not a polished version. Test it: could you say this sentence without your voice shaking? If not, it is not ready.",
  },
  "apology-decision": {
    rail: "Determine what kind of apology is warranted before determining how to deliver it. A full apology where a partial one is honest is worse than none.",
    sections: ["What actually happened (your honest account)", "Whose cost was it and how significant", "What the other person needs: acknowledgment / explanation / restitution / change", "What you can honestly deliver", "Apology type: full / partial / acknowledgment only / not warranted", "What you will not apologize for and why"],
    obligations: "Name the part of what happened that you are inclined to explain away. That is usually the part the apology most needs to address.",
  },
  "offer-negotiation": {
    rail: "Establish your walk-away before you establish your target. Negotiating without a walk-away produces capitulation.",
    sections: ["Current offer or situation", "Your leverage: what makes you valuable and what alternatives exist", "Target: what you are asking for and why it is justified", "Sequence: what to ask for first and in what order", "Walk-away: what outcome causes you to decline or leave", "Opening ask: the specific words you will use"],
    obligations: "Name the concession you are most likely to make under pressure. Decide in advance whether that concession is acceptable. Deciding in the moment always goes the wrong way.",
  },
  "should-i-leave": {
    rail: "Surface the assumption about what comes next before evaluating whether to leave. Most 'should I leave' decisions are really 'I have already decided' decisions looking for permission.",
    sections: ["What is driving the consideration (be specific)", "What would have to change for staying to work", "Is that change realistic and in whose control", "What leaving actually costs: financial, relational, psychological", "What you are assuming about what comes next", "Honest assessment: is this a decision or a permission-seeking exercise"],
    obligations: "Name the assumption about what comes next that you have not tested. That is the assumption most likely to be wrong and most central to the decision.",
  },
  "relationship-boundary": {
    rail: "Define the boundary precisely before deciding how to set it. Vague boundaries produce vague conversations and no change.",
    sections: ["What specific behavior needs to change", "Cost of not setting the boundary (be honest)", "The boundary: what you will and will not do going forward", "What the conversation needs to accomplish", "What you will do if the boundary is not respected", "Honest assessment: are you willing to enforce it"],
    obligations: "Name whether you are actually willing to enforce this boundary if it is crossed. A boundary you will not enforce is a request. Name it accurately.",
  },
  "burnout-triage": {
    rail: "Distinguish between what depletes and what is merely hard. Hard work is not burnout. Sustained depletion without recovery is.",
    sections: ["What specifically is depleting you (name three things)", "What is still working or energizing", "How long this has been building", "Minimum structural change that would make the situation viable", "Realistic assessment: can this role/situation provide that change", "Decision: address structurally / exit plan / seek support"],
    obligations: "Name whether the minimum structural change is in your control or requires someone else to act. If it requires someone else, name whether that person is likely to act and on what timeline.",
  },
  "career-pivot": {
    rail: "Assess the gap before assessing the aspiration. Most career pivots fail not because the goal is wrong but because the gap was underestimated.",
    sections: ["From: current role and what it provides", "To: target role and what it requires", "Skills and experience gap", "Financial runway required to close the gap", "Realistic timeline with milestones", "Honest failure mode: what most likely causes this not to work"],
    obligations: "Name the thing you are counting on that you do not control. That is the pivot's load-bearing assumption.",
  },
  "relocation-decision": {
    rail: "Name the problem you are solving before evaluating the destination. Most relocation decisions are solving an internal problem with an external move.",
    sections: ["What problem you are solving by moving", "What the current place cannot provide", "What you are assuming the new place will provide", "How realistic those assumptions are", "What you are giving up", "Decision: move / stay with changes / stay as is"],
    obligations: "Name whether the problem you are solving is location-dependent or whether it would follow you. If it would follow you, the relocation does not solve it.",
  },
  "health-decision": {
    rail: "Separate what you know from what you are assuming. In health decisions, assumptions about prognosis and treatment outcomes are often presented as facts.",
    sections: ["What I know from confirmed sources", "What I am assuming or have been told without full understanding", "Questions I need answered before I can decide", "My values in this specific decision", "Options and what each requires from me", "Decision or next step toward a decision"],
    obligations: "Name the question you have not asked because you are afraid of the answer. That question belongs in the decision.",
  },
  "aging-parent": {
    rail: "Name what the parent actually needs before naming what the family can provide. Most of these decisions are made in reverse.",
    sections: ["Parent's current needs: medical, functional, social, emotional", "Parent's stated preferences", "What each family member can realistically provide", "Financial picture: what resources exist and over what timeline", "Options: in-home care / assisted living / family arrangement / combination", "Cost of doing nothing for 6 more months", "Decision and who owns next steps"],
    obligations: "Name the family member whose capacity is being assumed but not confirmed. Have that conversation before the decision is final.",
  },
  "major-purchase": {
    rail: "Name the real driver before evaluating the purchase. Status, anxiety, and optimization are different drivers and require different decisions.",
    sections: ["Real driver of this purchase (not the stated reason)", "Total cost over 5 years including maintenance, financing, opportunity cost", "What you are giving up with this capital", "What specifically changes in your life if you buy this vs. do not", "What would change your mind", "Decision with conditions if applicable"],
    obligations: "Name the stated reason and then name the real reason. If they are the same, the purchase is probably sound. If they differ, evaluate the real reason, not the stated one.",
  },
  // ── Management & Leadership (new) ───────────────────────────────────────
  "client-escalation": {
    rail: "Understand what the client believes happened before responding to what actually happened. They are often different, and the gap is where the repair work lives.",
    sections: ["What actually happened (your account)", "What the client believes happened", "What the client needs from this conversation: acknowledgment / explanation / remedy / reassurance", "What you can commit to and by when", "What you cannot commit to and how to say it", "What the relationship requires to survive this"],
    obligations: "Name the commitment you are tempted to make to end the discomfort that you cannot actually keep. Do not make it.",
  },
  "board-meeting-prep": {
    rail: "Prepare the honest version before preparing the polished version. The board's job is to stress-test your reasoning — give them something to stress-test.",
    sections: ["What the board actually needs from this meeting (vs. what you want to present)", "The hardest topic and how you will introduce it", "Problems you should name before they name them", "Decision or approval you are asking for (be specific)", "What you need from them beyond approval", "Questions you are hoping they do not ask (and your honest answer to each)"],
    obligations: "Name the question you are most hoping the board does not ask. Prepare a direct answer to it. If you cannot answer it directly, that is the meeting's most important topic.",
  },
  "investor-update-bad-news": {
    rail: "Write the version investors actually need before writing the version you want to send. They are almost always different.",
    sections: ["What the plan was", "What actually happened and why (honest account)", "What changed in your understanding of the business", "What you are doing about it", "What you need from investors (be specific)", "What the path forward looks like and what has to be true for it to work"],
    obligations: "Name the thing you are most tempted to soften or omit. Include it. Investors who learn bad news from you trust you more. Investors who discover it themselves do not.",
  },
  "founder-conflict": {
    rail: "Name the actual disagreement before proposing a resolution. Most founder conflicts present as a surface disagreement (strategy, pace, equity) when the actual disagreement is about something harder to name.",
    sections: ["Surface disagreement: what it looks like", "Actual disagreement: what it is really about", "What each person needs (separate from the position)", "What the company needs (separate from what either person wants)", "What is reversible and what is not", "Next conversation: what needs to be said and by whom"],
    obligations: "Name the thing that has not been said directly because it would make the conflict harder to resolve in the short term but is necessary for resolution in the long term. That thing belongs in the next conversation.",
  },
  "career-compare": {
    rail: "Quantify what can be quantified. Name what cannot. Do not let the unquantified factors hide behind the numbers.",
    sections: ["Offer comparison: quantified factors (compensation, equity, benefits, stability)", "Non-quantified factors with explicit weight (growth, culture, mission, flexibility)", "Short-term vs. long-term trajectory for each", "What you are optimizing for in this chapter of your career", "Recommendation", "What you would need to know to change this call"],
    obligations: "Name the factor that is driving the decision emotionally but is hard to justify analytically. Surface it explicitly. A decision that hides its real driver is not a decision — it is a rationalization.",
  },
};

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  MODULE 04 — INFERENCE ENGINE                                                    ║
// ╚══════════════════════════════════════════════════════════════════════════╝
// ─── FIX 1: Context-aware mode inference ─────────────────────────────────────
// Uses conversation depth + prior confirmed mode to weight inference.
// Short sessions (<=2 user turns) bias toward Chat unless signal is strong.
// Established Explore/Commit sessions (>=4 turns) stay there unless Chat signal is explicit.
// FIX 2: Commit override detection.
// v38: Topic-pivot detection. Short messages + explicit reset phrases unlock
// mode regardless of turn count, preventing stale mode-lock on genuine pivots.
const PIVOT_PHRASES = ["let's step back", "lets step back", "actually,", "actually —", "start over", "different question", "new topic", "forget that", "change of direction", "something different", "pivot", "never mind that", "different problem"];

// v39: word-boundary signal match. Substring .includes misfired on embedded
// tokens — "explanation" contains "plan", "proceedings" contains "proceed" —
// which silently escalated Chat turns into Explore/Commit. A wrong escalation
// raises max_tokens (800 -> 3500/6000) and appends the extended prompt, so this
// was a token cost as well as a correctness defect. Phrases match whole-word at
// both ends; spaces inside a phrase match literally.
function _hasSignal(text, phrase) {
  const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("\\b" + esc + "\\b", "i").test(text);
}

function inferModeFromMessage(text, currentMode, userTurnCount, workflowType) {
  // v84: Draft workflow uses SYSTEM_PROMPT_DRAFT — the prompt governs when to clarify
  // vs. produce. We don't force mode here; we pass "Clarify" as the starting signal
  // and let the model's own mode declaration drive the turn-by-turn behavior.
  if (workflowType === "draft") {
    return currentMode || "Clarify";
  }

  const t = text.toLowerCase().trim();

  // FIX 2: Explicit override signals — user wants output now
  const overrideSignals = ["just give me", "skip the questions", "just do it", "go ahead", "just output", "stop asking", "move forward", "proceed", "let's commit", "commit now"];
  if (overrideSignals.some(s => _hasSignal(t, s))) return "CommitOverride";

  const commitSignals = ["produce a", "generate a", "create a", "write a", "draft a", "finalize", "give me a", "i need a", "output a", "make a"];
  const exploreSignals = ["analyze", "analyse", "compare", "evaluate", "assess", "explore", "what are the", "help me think", "walk me through", "what should", "how do i", "strategy", "tradeoff", "options", "risks", "plan", "review", "break down", "map out"];
  const clarifySignals = ["what is", "what does", "can you explain", "define", "clarify", "tell me about"];

  const hasCommit = commitSignals.some(s => _hasSignal(t, s));
  const hasExplore = exploreSignals.some(s => _hasSignal(t, s));
  const hasClarify = clarifySignals.some(s => _hasSignal(t, s));


  // v38: Topic-pivot detection. Unlocks mode-lock when:
  //   a) An explicit reset phrase is present regardless of turn count, or
  //   b) The message is short (<12 words) with no commit/explore signals —
  //      a brief message after a long structured exchange usually signals
  //      a pivot, redirect, or clarifying question, not continued Explore.
  const wordCount = t.split(/\s+/).filter(Boolean).length;
  // v100.0 (A7): use the word-boundary matcher, not substring includes — "pivotal"
  // contained "pivot" and unlocked an established session's mode. The v39 _hasSignal fix
  // was applied to every signal list except this one.
  const hasPivot = PIVOT_PHRASES.some(p => _hasSignal(t, p));
  const isShortPivot = wordCount < 12 && !hasCommit && !hasExplore && userTurnCount >= 4;

  // In an established session, trust session mode unless overridden or pivot detected
  if (userTurnCount >= 4 && currentMode && currentMode !== "Clarify") {
    if (hasPivot || isShortPivot) {
      // Unlock: re-evaluate from signals, default Chat on ambiguity
      if (hasCommit) return "Commit";
      if (hasExplore) return "Explore";
      return "Clarify";
    }
    if (hasCommit) return "Commit";
    if (hasClarify && !hasExplore) return "Clarify";
    return currentMode; // stay in established mode
  }

  // Early session: require stronger signal
  if (hasCommit) return "Commit";
  if (hasExplore) return "Explore";
  if (hasClarify) return "Clarify";
  return currentMode || "Clarify";
}


// ─── UNIFIED CLASSIFICATION PASS (Phase 2) ───────────────────────────────────
// ONE lightweight call returns everything the recommendation layer needs:
// decisionType, contentType, recommendedTemplates (ids), recommendedMode, confidence.
// Per the approved efficiency: decision-type and content-type are NOT two separate
// classifier calls — they are one. History is not sent; only the text to classify.
// Keyword fallback runs if the call fails or returns malformed output.

const DECISION_TYPES = ["Compare Options","Approve or Reject","Prioritize","Diagnose","Plan","Communicate","Negotiate","Evaluate Risk"];
const CONTENT_TYPES = ["Email","Meeting Notes","Transcript","Proposal","Research","Job Description","Contract","Business Plan","Marketing Content","Product Requirements","Financial Content","Freeform"];

// Map decision types and content types to sensible template ids.
function templatesForClassification(decisionType, contentType) {
  // v99.7 (P4): id maps rebuilt against the live TEMPLATES catalog. The previous maps
  // carried pre-v75 ids ("option-analysis", "exec-brief", "strategic", ...) that exist
  // in no catalog — recommendedTemplates was dead data that would have failed silently
  // the moment anything consumed it.
  const byDecision = {
    "Compare Options": ["build-vs-buy","vendor-matrix","career-compare","bridge-vs-priced"],
    "Approve or Reject": ["go-no-go","deal-desk","hire-no-hire","sunset-call"],
    "Prioritize": ["feature-prioritization","roadmap-tradeoff","expansion-play","budget-reallocation"],
    "Diagnose": ["bottleneck-diagnosis","churn-intervention","founder-conflict","pre-mortem"],
    "Plan": ["capacity-planning","market-entry","board-meeting-prep","gtm-motion"],
    "Communicate": ["difficult-conversation","investor-update-bad-news","client-escalation","performance-conversation"],
    "Negotiate": ["offer-negotiation","terms-negotiation","renewal-save","contract-risk"],
    "Evaluate Risk": ["ai-risk-assessment","contract-risk","pre-mortem","pricing-change-impact"],
  };
  const byContent = {
    "Job Description": ["hire-no-hire","backfill-restructure"],
    "Contract": ["contract-risk","terms-negotiation"],
    "Financial Content": ["budget-reallocation","pricing-change-impact","seed-readiness"],
    "Product Requirements": ["feature-prioritization","mvp-scope-cut","roadmap-tradeoff"],
    "Proposal": ["go-no-go","vendor-matrix"],
    "Business Plan": ["market-entry","seed-readiness","go-no-go"],
    "Research": ["market-entry","icp-narrowing"],
  };
  const picks = [];
  (byDecision[decisionType]||[]).forEach(id=>{if(!picks.includes(id))picks.push(id);});
  (byContent[contentType]||[]).forEach(id=>{if(picks.length<4&&!picks.includes(id))picks.push(id);});
  ["go-no-go","build-vs-buy","pre-mortem","career-compare"].forEach(id=>{if(picks.length<4&&!picks.includes(id))picks.push(id);});
  return picks.slice(0,4);
}

// Keyword fallback — used if the classifier call fails.
function classifyByKeyword(text) {
  const t = (text||"").toLowerCase();
  let decisionType = "Plan";
  if (/\b(vs\.?|versus|or |compare|option|alternative|either)\b/.test(t)) decisionType = "Compare Options";
  else if (/\b(should we|should i|approve|go or|green ?light|sign off)\b/.test(t)) decisionType = "Approve or Reject";
  else if (/\b(prioriti|rank|order|sequence|backlog)\b/.test(t)) decisionType = "Prioritize";
  else if (/\b(why|root cause|diagnos|broken|failing|wrong)\b/.test(t)) decisionType = "Diagnose";
  else if (/\b(negotiat|offer|counter|leverage|batna|salary|term sheet)\b/.test(t)) decisionType = "Negotiate";
  else if (/\b(risk|exposure|downside|threat|vulnerab)\b/.test(t)) decisionType = "Evaluate Risk";
  else if (/\b(email|memo|tell|announce|message|communicat)\b/.test(t)) decisionType = "Communicate";
  let contentType = "Freeform";
  if (/\b(dear|hi |hello |regards|sincerely|sent from)\b/.test(t)) contentType = "Email";
  else if (/\b(agenda|action items|attendees|minutes)\b/.test(t)) contentType = "Meeting Notes";
  else if (/\b(responsibilities|requirements|qualifications|we are looking for|job)\b/.test(t)) contentType = "Job Description";
  else if (/\b(whereas|hereby|liabilit|indemnif|governing law|agreement)\b/.test(t)) contentType = "Contract";
  else if (/\b(revenue|ebitda|margin|cash flow|p&l|burn|arr|mrr)\b/.test(t)) contentType = "Financial Content";
  return { decisionType, contentType, recommendedTemplates: templatesForClassification(decisionType, contentType),
    recommendedMode: "Explore", confidence: "Low" };
}

// The unified pass. Returns the same shape whether from model or fallback.
async function classifyInput(text, signal) {
  const snippet = (text||"").slice(0, 2000); // cap — never overload the prompt for classification
  if (snippet.trim().length < 12) return null; // too thin to classify; stay in Clarify mode
  const sys = `You are a classifier for a decision-intelligence tool. Given user input, return ONLY a JSON object, no prose, no fences:
{"decisionType": one of [${DECISION_TYPES.map(d=>'"'+d+'"').join(", ")}],
 "contentType": one of [${CONTENT_TYPES.map(c=>'"'+c+'"').join(", ")}],
 "confidence": "Low" | "Moderate" | "High"}
Pick the single best decisionType (what the user is fundamentally trying to do) and contentType (what kind of material the text is; use "Freeform" if it is not a recognizable document). Confidence reflects how clear the signal is. If the input is vague, use "Low".`;
  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal,
      body: JSON.stringify({ model: MODELS.FAST, max_tokens: 120,
        system: [{ type: "text", text: sys, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: snippet }] })
    });
    const data = await res.json();
    const raw = data.content?.filter(b=>b.type==="text").map(b=>b.text).join("") || "";
    const parsed = extractJsonObject(raw);
    if (!parsed) return classifyByKeyword(text);
    const decisionType = DECISION_TYPES.includes(parsed.decisionType) ? parsed.decisionType : "Plan";
    const contentType = CONTENT_TYPES.includes(parsed.contentType) ? parsed.contentType : "Freeform";
    const confidence = ["Low","Moderate","High"].includes(parsed.confidence) ? parsed.confidence : "Low";
    return { decisionType, contentType, confidence,
      recommendedTemplates: templatesForClassification(decisionType, contentType),
      recommendedMode: confidence === "Low" ? "Clarify" : "Explore" };
  } catch(e) {
    if (e && e.name === "AbortError") return null;
    return classifyByKeyword(text);
  }
}


// ─── DECISION READINESS (Phase 2) ────────────────────────────────────────────
// Six weighted categories (spec Part 7). The hard rule: a numeric % is only
// shown when enough genuine signal exists. Below the floor, we surface a
// qualitative state — never a fake precise number on a thin session.
const READINESS_WEIGHTS = { objectives:0.15, alternatives:0.15, risks:0.15, assumptions:0.15, evidence:0.25, constraints:0.15 };
const READINESS_SIGNAL_FLOOR = 3; // need >=3 categories with real signal before showing a %

// Scan raw history for category signals. Returns per-category 0..1 scores,
// an evidence level, the count of categories with real signal, and (only if
// above the floor) a weighted percentage.
function assessReadiness(rawHistory) {
  const text = rawHistory.map(m=>m.content||"").join(" ").toLowerCase();
  if (!text.trim()) return null;

  const cat = { objectives:0, alternatives:0, risks:0, assumptions:0, evidence:0, constraints:0 };

  // Objectives: goal/objective/outcome language
  if (/\b(objective|goal|aim|trying to|want to|need to|outcome|success looks like)\b/.test(text)) cat.objectives = 1;
  // Alternatives: comparison / option language, or explicit "option a/b"
  const altHits = (text.match(/\b(option|alternative|versus|vs\.?|instead of|either|or we could)\b/g)||[]).length;
  cat.alternatives = altHits >= 2 ? 1 : altHits === 1 ? 0.5 : 0;
  // Risks
  const riskHits = (text.match(/\b(risk|downside|threat|concern|failure|what if|worst case)\b/g)||[]).length;
  cat.risks = riskHits >= 2 ? 1 : riskHits === 1 ? 0.5 : 0;
  // Assumptions
  const aHits = (text.match(/\b(assum|presum|believe|expect|likely|should be|we think)\b/g)||[]).length;
  cat.assumptions = aHits >= 2 ? 1 : aHits === 1 ? 0.5 : 0;
  // Constraints
  if (/\b(budget|deadline|constraint|limit|cap|by [a-z]+ \d|headcount|fixed|cannot|must not)\b/.test(text)) cat.constraints = 1;

  // Evidence — strongest level detected drives both the evidence score and label
  let evidenceLevel = null, evidenceScore = 0;
  if (/\b(validated test|a\/b test|experiment result|pilot result|measured)\b/.test(text)) { evidenceLevel="Validated Test"; evidenceScore=1; }
  else if (/\b(expert|advisor|consultant said|industry benchmark|best practice)\b/.test(text)) { evidenceLevel="Expert Judgment"; evidenceScore=0.85; }
  else if (/\b(market data|external data|third.?party|published|report shows)\b/.test(text)) { evidenceLevel="External Data"; evidenceScore=0.7; }
  else if (/\b(our data|metrics show|analytics|dashboard|we measured|internal data)\b/.test(text)) { evidenceLevel="Internal Data"; evidenceScore=0.55; }
  else if (/\b(i noticed|we observed|seems like|anecdot|i saw|noticed that)\b/.test(text)) { evidenceLevel="Internal Observation"; evidenceScore=0.35; }
  else if (text.length > 200) { evidenceLevel="Anecdotal"; evidenceScore=0.2; }
  cat.evidence = evidenceScore;

  // Count categories with real (non-trivial) signal
  const signalCount = Object.values(cat).filter(v=>v>=0.5).length;

  // Weighted score
  const weighted = Object.entries(READINESS_WEIGHTS).reduce((sum,[k,w])=>sum + (cat[k]*w), 0);
  const pct = Math.round(weighted*100);

  // Strongest / weakest category by weighted contribution
  const labeled = Object.keys(cat).map(k=>({k, score:cat[k]}));
  const strongest = labeled.slice().sort((a,b)=>b.score-a.score)[0];
  const weakest = labeled.slice().sort((a,b)=>a.score-b.score)[0];

  // FAKE-PRECISION FLOOR: only return a % above the signal floor.
  const aboveFloor = signalCount >= READINESS_SIGNAL_FLOOR;
  let qualitative;
  if (signalCount === 0) qualitative = "Early";
  else if (signalCount < READINESS_SIGNAL_FLOOR) qualitative = "Developing";
  else if (pct >= 70) qualitative = "Strong";
  else if (pct >= 45) qualitative = "Moderate";
  else qualitative = "Developing";

  return {
    categories: cat,
    signalCount,
    readinessScore: aboveFloor ? pct : null,   // null below floor — never fake precision
    qualitative,
    evidenceLevel,
    strongest: strongest.score>0 ? strongest.k : null,
    weakest: weakest.k,
  };
}



// Phase 5: selective prompt assembly. Chat = core only. Explore/Commit load
// ONLY the relevant domain blocks + (if a template is active) its artifact def.
// v39: returns ordered system blocks with cache flags plus a combined string for
// estimation, instead of one concatenated prompt. Previously the single
// cache_control wrapped the whole assembled prompt, so any mode or domain shift
// busted the cache for the large static core too. Now the static core, the static
// extended rules, and the (conditionally present) static artifact library are each
// their own cacheable block, stable across turns and sessions. Only the small
// variable tail (domains + active artifact line) is uncached.
// `domains` is precomputed by the caller (selectDomains) and passed in, so it is
// not computed twice per send.
function buildSystemPrompt(inferredMode, decisionState, domains, profile) {
  // v84: Draft workflow uses a separate prompt — completeness-gate model, no exploration loop.
  if (decisionState?.workflowType === "draft") {
    const blocks = [{ text: SYSTEM_PROMPT_DRAFT, cache: true }];
    const hasTemplate = !!decisionState?.selectedTemplate;
    // v101.2 (token-efficiency 2): the document template's artifact definition is fixed
    // for the whole draft, so cache it as its own block rather than re-sending it in the
    // uncached tail every turn (same change as the decide path below).
    if (hasTemplate) {
      const artifactDef = artifactDefinitionFor(decisionState.selectedTemplate);
      if (artifactDef) blocks.push({ text: artifactDef, cache: true });
    }
    const profBlock = profilePromptBlock(profile);
    if (profBlock) blocks.push({ text: profBlock, cache: false });
    return { blocks, text: blocks.map(b => b.text).join(""), isDraft: true };
  }

  const blocks = [{ text: SYSTEM_PROMPT_CHAT, cache: true }];

  // Chat stays lean — Chat core only, no extended block, no domains. (~520 tokens)
  if (!inferredMode || inferredMode === "Clarify") {
    return { blocks, text: SYSTEM_PROMPT_CHAT };
  }

  // Explore/Commit: static extended structural rules (cached).
  blocks.push({ text: SYSTEM_PROMPT_EXTENDED, cache: true });

  // Dynamic artifact loading: when a template is selected, send only its definition
  // in the variable tail and omit the full library (saves ~250 tokens/turn). When no
  // template is selected, include the library as its own cached block.
  const hasTemplate = !!decisionState?.selectedTemplate;
  if (!hasTemplate) {
    blocks.push({ text: SYSTEM_PROMPT_ARTIFACT_LIBRARY, cache: true });
  } else {
    // v101.2 (token-efficiency 2): the per-template artifact definition is fixed the
    // moment a template is selected, so it is stable for the whole decision. It was
    // previously concatenated into the uncached tail and re-sent at full price on every
    // Explore/Commit turn. Send it as its own cached block instead — parallel to
    // SYSTEM_PROMPT_ARTIFACT_LIBRARY and mutually exclusive with it, so the cache
    // breakpoint count does not rise. After the first turn it costs cache-read price.
    const artifactDef = artifactDefinitionFor(decisionState.selectedTemplate);
    if (artifactDef) blocks.push({ text: artifactDef, cache: true });
  }

  // Variable tail — small, volatile, uncached. Holds only what genuinely changes within
  // a decision: domain depth (recentText keyword path can shift it) and the per-user
  // profile block (evolves per commit). The artifact definition moved to a cached block
  // above in v101.2; it is no longer part of the tail.
  const doms = domains || [];
  let tail = "";
  if (doms.length > 0) {
    tail += "\n\nDOMAIN DEPTH (apply silently):\n" + doms.map(d=>DOMAIN_BLOCKS[d]).filter(Boolean).join("\n");
  }
  // v61: per-user calibration. Lives in the uncached tail because it evolves with
  // the user's history. Empty for thin or cold profiles, so no cost when there is
  // no signal. Chat returned earlier above, so this only reaches Explore/Commit.
  const profBlock = profilePromptBlock(profile);
  if (profBlock) tail += profBlock;
  if (tail) blocks.push({ text: tail, cache: false });

  return { blocks, text: blocks.map(b=>b.text).join("") };
}


// v90: Draft output budget scales with the selected document template's depth
// instead of always allocating 6000. short -> 3000, medium -> 4500, full -> 6000.
// Free-form drafts (no template selected) default to full to avoid truncation.
const DRAFT_DEPTH_TOKENS = { short: 3000, medium: 4500, full: 6000 };

// v102: output-size tiers for DOCUMENT and COMMIT outputs, gated by plan to bound the
// cost of the most expensive generations. The ladder:
//   Brief    ~1200 tok — Guest, Free (first and only size for these tiers)
//   Standard ~3000 tok — Starter default, Pro default for shallow templates
//   Full     ~6000 tok — Pro default for deep templates / commits
//   Extended ~8000 tok — Pro only, EXPLICIT action (the expand button), never automatic
// Clarify and Explore turns are NOT clamped here — these tiers govern produced
// artifacts (Commit / Draft), not the exploration loop. Free/Guest get a complete but
// controlled first output (Brief); longer output routes to signup/upgrade in the UI.
const OUTPUT_PLAN_CEILING = { free: 1200, starter: 3000, pro: 6000, team: 6000, enterprise: 8000 };
const OUTPUT_EXTENDED_TOKENS = 8000;
function maxTokensForMode(inferredMode, workflowType, selectedTemplate, tier, opts) {
  // Natural budget the mode would use absent any plan ceiling.
  let base;
  if (workflowType === "draft") {
    const depth = selectedTemplate ? documentDepthForId(selectedTemplate) : "full";
    base = DRAFT_DEPTH_TOKENS[depth] || 6000;
  } else if (inferredMode === "Commit" || inferredMode === "CommitOverride") {
    base = 6000;
  } else if (inferredMode === "Explore") {
    return 3500; // exploration is not a produced artifact — not plan-clamped
  } else {
    return 800;  // Clarify — not plan-clamped
  }
  // This is a produced artifact (Commit or Draft): apply the plan ceiling.
  const ceiling = OUTPUT_PLAN_CEILING[tier] ?? 6000;
  // Extended is Pro-only and only via an explicit expand action (opts.extended).
  if (opts && opts.extended && (tier === "pro" || tier === "enterprise")) {
    return OUTPUT_EXTENDED_TOKENS;
  }
  return Math.min(base, ceiling);
}


// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  MODULE 05 — PROCESSING                                                          ║
// ╚══════════════════════════════════════════════════════════════════════════╝
// ─── OVERLAY ENGINE (Phase 3) ────────────────────────────────────────────────
// ONE mechanism for three features: Decision Battle, Challenge This Decision,

const COMPRESS_AFTER = 6;
const KEEP_RECENT = 2;
// v31: Chat clarification turns are usually disposable once the problem is framed.
// Compress them earlier and more aggressively than structured Explore/Commit turns.
const CHAT_COMPRESS_AFTER = 4;
const CHAT_KEEP_RECENT = 3;

// v39: summary memo. buildMessagesPayload was issuing a Haiku summary call on every
// send once past the threshold — one extra API call per turn in a long session. The
// older window grows by ~1 user turn per send, so a full re-summary each time is
// wasteful: most of the window is unchanged. We now refresh the summary only when the
// older window has grown by >=2 user turns since the last full summary; between
// refreshes we reuse the cached summary and append the few newly-aged messages as
// compact lines. A content signature over the summarized prefix prevents reuse across
// a different session (the cache is module-level and shared).
let _summaryCache = { olderLen: -1, userTurns: -1, sig: 0, text: "" };
const SUMMARY_REFRESH_EVERY = 2; // user turns of growth before a full re-summary
function _olderSig(arr) {
  const head = (arr[0]?.content || "").slice(0, 60);
  const tail = (arr[arr.length - 1]?.content || "").slice(-60);
  const s = head + "|" + tail + "|" + arr.length;
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
  return h;
}

// v42: module-scope so both the synchronous payload build and the async refresh
// scheduler use the identical compaction.
function _compactLine(m) {
  if (m.role === "user") return "USER: " + (m.content || "").slice(0, 200);
  const txt = m.content || "";
  const modeLine = txt.match(/^Mode:\s*\w+/m)?.[0] || "";
  const body = txt.replace(/^Mode:\s*\w+\n?/m, "").replace(/Reasoning Strength:.*$/m, "").trim().slice(0, 250);
  return "ASSISTANT" + (modeLine ? " [" + modeLine + "]" : "") + ": " + body;
}

// v42: high-quality Haiku summary moved OFF the hot path. When a refresh is needed,
// the payload build uses an immediate local summary for the current turn and calls
// this to refresh _summaryCache for the next turn. Best-effort and fire-and-forget:
// no abort signal, no retry, failures leave the cache untouched so the local summary
// keeps serving. A pending guard prevents duplicate in-flight calls for one snapshot.
// v99.7 (P6): idle sentinel is null, not 0 — _olderSig can legitimately hash to 0,
// and the old sentinel made such a snapshot permanently unrefreshable.
let _summaryRefreshPending = null;
function scheduleSummaryRefresh(older, olderUserTurns) {
  const sig = _olderSig(older);
  if (_summaryRefreshPending === sig) return;          // already in flight for this snapshot
  if (_summaryCache.sig === sig && _summaryCache.text) return; // already cached
  _summaryRefreshPending = sig;
  const summaryLines = older.map(_compactLine).join("\n");
  (async () => {
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODELS.FAST, max_tokens: 250,
          messages: [{ role: "user", content: "Summarize in 3-4 sentences: core problem/decision, key constraints, mode progression, conclusions. Plain text only.\n\n" + summaryLines }]
        })
      });
      const data = await res.json();
      const text = data.content?.filter(b => b.type==="text").map(b => b.text).join("") || "";
      if (text) _summaryCache = { olderLen: older.length, userTurns: olderUserTurns, sig, text };
    } catch { /* leave cache as-is; the local summary continues to serve */ }
    finally { if (_summaryRefreshPending === sig) _summaryRefreshPending = null; }
  })();
}

async function buildMessagesPayload(rawHistory, inferredMode) {
  const userTurns = rawHistory.filter(m => m.role === "user").length;
  const isClarify = !inferredMode || inferredMode === "Clarify";
  // v31: Chat compresses earlier (4 turns) keeping the last 3; Explore/Commit
  // keep the original threshold (6 turns, keep 2) to preserve structural fidelity.
  const compressAfter = isClarify ? CHAT_COMPRESS_AFTER : COMPRESS_AFTER;
  const keepRecent = isClarify ? CHAT_KEEP_RECENT : KEEP_RECENT;
  if (userTurns <= compressAfter) return rawHistory;

  let recentCount = 0, splitIdx = rawHistory.length;
  for (let i = rawHistory.length - 1; i >= 0; i--) {
    if (rawHistory[i].role === "user") recentCount++;
    if (recentCount >= keepRecent) { splitIdx = i; break; }
  }

  const older = rawHistory.slice(0, splitIdx);
  const recent = rawHistory.slice(splitIdx);
  const olderUserTurns = older.filter(m => m.role === "user").length;

  // Decide reuse vs refresh. Reuse requires: a cached summary, the cached prefix still
  // matches this conversation (signature), and growth under the refresh window.
  const grewBy = olderUserTurns - _summaryCache.userTurns;
  const prefixMatches = _summaryCache.text !== "" &&
    _summaryCache.olderLen >= 0 && older.length >= _summaryCache.olderLen &&
    _olderSig(older.slice(0, _summaryCache.olderLen)) === _summaryCache.sig;
  const canReuse = prefixMatches && grewBy >= 0 && grewBy < SUMMARY_REFRESH_EVERY;

  let summaryText = "";
  if (canReuse) {
    // Reuse the cached summary plus a compact append of the aged tail. No network.
    const aged = older.slice(_summaryCache.olderLen).map(_compactLine).join("\n");
    summaryText = _summaryCache.text + (aged ? "\n" + aged : "");
  } else {
    // v42: immediate local summary for THIS turn (no blocking call), then refresh the
    // cache asynchronously for the next turn. Trade: the first compressed turn after a
    // prefix change uses a cruder local summary instead of the Haiku one.
    const localLines = older.map(_compactLine).join("\n");
    summaryText = localLines.length > 1600 ? localLines.slice(0, 1600) + "\n…(earlier context condensed)" : localLines;
    scheduleSummaryRefresh(older, olderUserTurns);
  }

  return [
    { role: "user", content: "[PRIOR CONTEXT — " + olderUserTurns + " earlier turns]\n" + summaryText },
    { role: "assistant", content: "Understood. Continuing from that context." },
    ...recent
  ];
}


// ─── v31.1: API fetch with rate-limit (429) and overload backoff ─────────────
// One automatic retry on 429 / 529 / overloaded. Honors retry-after when present,
// otherwise a short fixed backoff. onWait lets the UI show a calm notice. The
// AbortController signal is respected throughout (no retry after user abort).
async function fetchMessagesWithRetry(body, signal, onWait) {
  const MAX_RETRIES = 1;
  const send = () => fetch(API_ENDPOINT, {
    method: "POST", headers: { "Content-Type": "application/json" }, signal,
    body: JSON.stringify(body)
  });
  let res = await send();
  let attempt = 0;
  while ((res.status === 429 || res.status === 529) && attempt < MAX_RETRIES) {
    if (signal && signal.aborted) return res;
    const retryAfter = parseFloat(res.headers.get("retry-after") || "");
    // v100.0 (A6): cap the wait. An uncapped retry-after header could park a send for
    // minutes; 30s is the ceiling.
    const waitMs = Math.min(30000, (isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 3) * 1000);
    if (onWait) { try { onWait(Math.round(waitMs / 1000)); } catch(_){} }
    // v100.0 (A6): make the backoff abort-aware. The old fixed timer ignored Stop, so
    // an aborted send still waited out the full delay, then returned the stale 429 and
    // surfaced a spurious "API error 429" banner. Race the timer against the signal.
    const aborted = await new Promise(resolve => {
      let done = false;
      const t = setTimeout(() => { if(!done){ done = true; cleanup(); resolve(false); } }, waitMs);
      const onAbort = () => { if(!done){ done = true; cleanup(); resolve(true); } };
      function cleanup(){ clearTimeout(t); if(signal) try{ signal.removeEventListener("abort", onAbort); }catch(_){} }
      if (signal) { if (signal.aborted) { onAbort(); } else { try { signal.addEventListener("abort", onAbort, { once:true }); } catch(_){} } }
    });
    if (aborted || (signal && signal.aborted)) return res;
    attempt++;
    res = await send();
  }
  return res;
}


// ─── FIX 8: Document parser with mixed-content numbered list support ──────────
function parseDocumentClientSide(docData) {
  const date = new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const sections = (docData.sections||[]).map(s => {
    const content = s.content || "";
    const heading = s.heading || "";
    const isRisk = /risk|tradeoff/i.test(heading);

    if (isRisk) {
      const lines = content.split("\n").map(l=>l.trim()).filter(Boolean);
      const items = lines.map(line => {
        const parts = line.split("|").map(p=>p.trim());
        if (parts.length===3) return `Trigger: ${parts[0]} · Mechanism: ${parts[1]} · Impact: ${parts[2]}`;
        return line.replace(/^[-•]\s*/,"");
      }).filter(Boolean);
      if (items.length>0) return {heading,content:"",isList:true,items,editable:content};
    }

    // FIX 8: Extract numbered items even when prose precedes them
    const allLines = content.split("\n").map(l=>l.trim());
    const numberedItems = allLines.filter(l=>/^\d+\.\s/.test(l)).map(l=>l.replace(/^\d+\.\s/,""));
    if (numberedItems.length>1) return {heading,content:"",isList:true,items:numberedItems,editable:content};

    const bulletItems = allLines.filter(l=>/^[-•]\s/.test(l)).map(l=>l.replace(/^[-•]\s/,""));
    if (bulletItems.length>1) return {heading,content:"",isList:true,items:bulletItems,editable:content};

    const pipeItems = content.includes("|") && !isRisk ? content.split("|").map(i=>i.trim()).filter(Boolean) : null;
    if (pipeItems&&pipeItems.length>2) return {heading,content:"",isList:true,items:pipeItems,editable:content};

    return {heading,content,isList:false,items:[],editable:content};
  });
  return {title:docData.title||"Document",subtitle:docData.type||"",date,sections};
}

// v126.3: salvage a structured document from a prose commit. Used only as the
// format-picker loop breaker — when a forceDoc retry returns prose with no document
// block, this rebuilds the docData shape extractDocumentBlock would have produced, so
// the normal commit path (parseDocumentClientSide, activeDoc, outcome seam, save) runs
// and the user gets a real deliverable instead of another picker. Splits on markdown
// headings; parseDocumentClientSide then handles list/numbered/bullet extraction inside
// each section. Single "#" is the title; "##"+ and standalone "**bold**" lines are
// section headings; preamble before the first heading becomes an unheaded section.
function proseToDocData(text, fmtHint) {
  const raw = (text || "").trim();
  if (!raw) return null;
  const titleCase = (s) => (s||"").replace(/\b\w/g, c => c.toUpperCase());
  const lines = raw.split("\n");
  const sections = [];
  let title = "";
  let cur = null;
  const flush = () => {
    if (!cur) return;
    cur.content = (cur._buf || []).join("\n").trim();
    delete cur._buf;
    sections.push(cur);
    cur = null;
  };
  for (const line of lines) {
    const l = line.trim();
    const mH1 = l.match(/^#\s+(.+)/);
    const mH2 = l.match(/^#{2,6}\s+(.+)/);
    const mBold = l.match(/^\*\*(.+?)\*\*:?$/);
    if (mH1 && !title && sections.length === 0 && !cur) { title = mH1[1].trim(); continue; }
    if (mH2 || mBold || mH1) {
      flush();
      cur = { heading: (mH2 ? mH2[1] : mBold ? mBold[1] : mH1[1]).trim().replace(/:+$/,""), _buf: [] };
      continue;
    }
    if (!cur) cur = { heading: "", _buf: [] };
    cur._buf.push(line);
  }
  flush();
  const cleaned = sections.filter(s => (s.heading && s.heading.length) || (s.content && s.content.length));
  const finalSections = cleaned.length ? cleaned : [{ heading: "", content: raw }];
  return {
    document: true,
    title: title || (fmtHint ? titleCase(fmtHint) : "Decision"),
    type: fmtHint ? titleCase(fmtHint) : "Decision document",
    sections: finalSections,
  };
}

// ─── MARKDOWN EXPORT ──────────────────────────────────────────────────────────
// v70: full HTML escaping for the exported document. The prior export escaped only
// "<", leaving "&", ">", and quotes raw in model- and paste-derived content, which can
// corrupt the downloaded file (and, when "&" precedes a known entity name, render as an
// unintended entity). Escape ampersand first so the other replacements are not
// double-escaped. Safe in both text and attribute contexts.
function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function buildMarkdown(formatted) {
  const lines = ["# "+formatted.title,"",
    (formatted.subtitle?formatted.subtitle+" · ":"")+(formatted.date||""),
    "","---",""];
  (formatted.sections||[]).forEach(s=>{
    lines.push("## "+s.heading,"");
    if (s.isList&&s.items?.length) s.items.forEach(item=>lines.push("- "+item));
    else lines.push(s.content||"");
    lines.push("");
  });
  const createUrl = (()=>{ try{ return window.location.origin + window.location.pathname; }catch{ return ""; } })();
  lines.push("---", createUrl ? `*Produced with WorkOutput · ${createUrl}*` : "*Produced with WorkOutput*");
  return lines.join("\n");
}

// v126.4: plain-text serialization for "print to chat". The chat renders message
// text as pre-wrapped plain text (no markdown), so this drops the markdown symbols
// and uses uppercase headings and bullets for hierarchy that reads cleanly inline.
function docToChatText(formatted){
  if(!formatted) return "";
  const out = [];
  if(formatted.title) out.push(formatted.title);
  const meta = [formatted.subtitle, formatted.date].filter(Boolean).join(" · ");
  if(meta) out.push(meta);
  out.push("");
  (formatted.sections||[]).forEach(s=>{
    if(s.heading) out.push(s.heading.toUpperCase());
    if(s.isList && s.items && s.items.length) s.items.forEach(it=>out.push("• "+it));
    else if(s.content) out.push(s.content);
    out.push("");
  });
  return out.join("\n").trim();
}

// v126.4: the lowest tier name that entitles a feature, for export-picker labels
// ("HTML · Starter"). Reads the same FEATURE_MIN/TIERS maps has() uses.
function minTierName(feature){
  const need = FEATURE_MIN[feature] || 0;
  const key = Object.keys(TIERS).find(k => TIERS[k].rank === need);
  return key ? TIERS[key].name : "a paid plan";
}

// v99.6 (M3): HTML builder extracted from downloadHTML so the PDF path can print
// the same standalone document instead of window.print() capturing the app shell.
function buildHTMLDoc(formatted) {
  const createUrl = (()=>{ try{ return window.location.origin + window.location.pathname; }catch{ return ""; } })();
  const sections = (formatted.sections||[]).map(s=>{
    const body = s.isList && s.items?.length
      ? `<ul>${s.items.map(item=>`<li><span class="bullet">◦</span><span>${escapeHtml(item)}</span></li>`).join("")}</ul>`
      : `<p>${escapeHtml(s.content||"").replace(/\n/g,"<br>")}</p>`;
    return `<section><h2>${escapeHtml(s.heading)}</h2>${body}</section>`;
  }).join("");
  const html=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(formatted.title||"Decision Document")}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Spectral',Georgia,serif;max-width:740px;margin:0 auto;padding:72px 52px 96px;color:#1a1612;font-size:11.5pt;line-height:1.75;background:#fdf9f4}
  @media print{body{padding:48px 0;background:#fff}@page{margin:1.8cm 2cm}}
  .wo-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:52px;padding-bottom:16px;border-bottom:1px solid #d4c9b0}
  .wo-wordmark{font-family:'IBM Plex Mono',monospace;font-size:9pt;font-weight:500;color:#8b6914;letter-spacing:0.18em}
  .wo-date{font-family:'IBM Plex Mono',monospace;font-size:8.5pt;color:#a8937a;letter-spacing:0.06em}
  .cover{margin-bottom:48px;padding-bottom:32px;border-bottom:2px solid #1a1612}
  h1{font-size:24pt;font-weight:700;color:#0f0e0b;line-height:1.2;margin-bottom:10px}
  .subtitle{font-family:'IBM Plex Mono',monospace;font-size:8.5pt;color:#6b5e44;letter-spacing:0.06em;margin-top:6px}
  section{margin-bottom:32px}
  h2{font-size:9.5pt;font-weight:600;margin-bottom:14px;letter-spacing:0.1em;text-transform:uppercase;padding-left:12px;border-left:3px solid #8b6914;color:#3a2e1a}
  p{margin:8px 0;color:#2a241c;max-width:64ch}
  ul{margin:10px 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:7px}
  li{display:flex;gap:10px;color:#2a241c}
  .bullet{color:#8b6914;flex-shrink:0;margin-top:1px}
  .footer{margin-top:64px;padding-top:14px;border-top:1px solid #d4c9b0;font-family:'IBM Plex Mono',monospace;font-size:8pt;color:#b0a08a;display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap}
  .footer a{color:#8b6914;text-decoration:none}
</style>
</head>
<body>
<div class="wo-header">
  <span class="wo-wordmark">WORKOUTPUT</span>
  <span class="wo-date">${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</span>
</div>
<div class="cover">
  <h1>${escapeHtml(formatted.title||"Decision Document")}</h1>
  ${formatted.subtitle?`<p class="subtitle">${escapeHtml(formatted.subtitle)}</p>`:""}
</div>
${sections}
<div class="footer">
  <span>Produced with <a href="${escapeHtml(createUrl)}">WorkOutput</a> · use this template</span>
  <span>${escapeHtml(formatted.title||"")}</span>
</div>
</body>
</html>`;
  return html;
}
function downloadHTML(formatted) {
  _dl(buildHTMLDoc(formatted),"text/html",(formatted.title||"doc").replace(/[^a-z0-9]/gi,"_")+".html");
}
// v99.6 (M3 fix): PDF export prints the standalone document HTML in a hidden iframe.
// window.print() printed the entire app (sidebar, modals, chrome) because no print
// stylesheet isolated the document view.
function printDocumentHTML(formatted) {
  try {
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open(); doc.write(buildHTMLDoc(formatted)); doc.close();
    const fire = () => {
      try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch(_) {}
      // Remove after the dialog has had time to capture the frame content.
      setTimeout(() => { try { iframe.remove(); } catch(_) {} }, 60000);
    };
    if (doc.readyState === "complete") setTimeout(fire, 150);
    else iframe.onload = () => setTimeout(fire, 150);
  } catch(_) {
    // Fallback: at least produce something rather than nothing.
    try { window.print(); } catch(_2) {}
  }
}
function downloadMarkdown(formatted) { _dl(buildMarkdown(formatted),"text/markdown",(formatted.title||"doc").replace(/[^a-z0-9]/gi,"_")+".md"); }
function _dl(content,type,name){const b=new Blob([content],{type});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=name;a.style.display="none";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(u);} // v99.6 (L6): anchor attached to DOM before click — unattached anchors are unreliable in some browsers (historically Firefox)

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  MODULE 06 — STORAGE & STATE                                                     ║
// ╚══════════════════════════════════════════════════════════════════════════╝
// ─── STORAGE ──────────────────────────────────────────────────────────────────

// ─── DECISION STATE ───────────────────────────────────────────────────────────
// Lightweight per-session coordination layer (spec Part: Decision State Object).
// Purely additive in v10 — most fields are placeholders that later phases fill.
// Must always be reconstructable from session data; never the sole source of truth.
function emptyDecisionState() {
  return {
    workflowType: null,        // "decide" | "draft" — set at session creation from template type
    decisionType: null,        // Compare Options | Approve/Reject | Prioritize | ... (Phase 2)
    contentType: null,         // detected from paste (Phase 2)
    selectedTemplate: null,    // template id if started from one
    recommendedTemplates: [],  // (Phase 2)
    recommendedMode: null,     // (Phase 2)
    currentMode: null,         // mirrors confirmed mode
    readinessScore: null,      // null = not enough signal (Phase 2). Never fake 0.
    readinessCategories: null, // (Phase 2)
    evidenceStrength: null,    // (Phase 2)
    blindSpots: [],            // (Phase 3)
    options: [],               // (Phase 3 — Decision Battle)
    recommendation: null,      // (Phase 3)
    confidence: null,          // mirrors reasoning strength when available
    scorecard: null,           // (Phase 4)
    canvas: null,              // (Phase 4)
    shareVisibility: null,     // (Phase 4)
    benchmarkSignal: null,     // (Phase 4 placeholder — Phase 6 populates)
    // Phase 6 additions (all additive — backward-compatible with prior sessions)
    decisionDependencies: null,   // { upstream:[], downstream:[], blockers:[], generatedDecisions:[] }
    failureScenarios: null,       // [{ title, what, probability, impact, signals:[], mitigation }]
    topFailureDrivers: null,      // [{ title, score }] — top 3 by P×I
    decisionProfile: null,        // org-level profile mirror (authoritative copy in wo:profile)
    decisionNetwork: null,        // { decisionId, dependencies, profileFactors, benchmarkSignals, failureScenarios }
    lastContextAudit: null,       // (Phase 7) { retrieved:[], included:[], method, tokenAdded, ts }
    lastContradictionCheck: null, // (v19/v20) { conflicts:[], ts } — last §8.3 check result
    // v73 ledger additions (additive; persist and reload via the session blob)
    committedAt: null,            // timestamp of the commit this state produced
    loadBearingAssumption: null,  // { text, category } captured at commit, reviewed later
    prediction: null,             // v122: { trigger, resolveBy } — the falsifiable bet sealed at commit
    reviewDueAt: null,            // when the outcome check becomes "due"
    outcome: null,                // { status:"pending"|"recorded", result:"held"|"partial"|"broke"|null, note, recordedAt }
    scope: null,                  // "work" | "personal" — effective scope tag
    scopeConfidence: null,        // "high" | "low"
    scopeConfirmed: false,        // true once the user explicitly sets it
    scopeSuggested: null,         // "work" when a low-confidence guess wants confirmation, else null
  };
}

// Merge helper — keeps decisionState lightweight and avoids scattered logic.
function mergeDecisionState(prev, patch) {
  return { ...(prev || emptyDecisionState()), ...patch };
}

// ===== v73 SCOPE WALL =====
// Classify a committed decision as work vs personal. The keystone rule is fail-safe:
// nothing is classified work unless the signal is unambiguous. A single weak work
// signal stays PERSONAL (private) and only offers a "mark as work" suggestion the
// user must confirm. Personal decisions never surface upward. Only scope==="work"
// with high confidence or explicit confirmation is ever eligible for the deferred
// aggregate team layer, and even then only as counts — never title, content, or row.
// Keyword lists are the synchronous, offline-safe FLOOR. classifyCommitSignalsModel
// upgrades scope at commit; this still runs first so the wall holds if that call fails.
const WORK_SCOPE_RX = /\b(team|teammate|colleague|company|org|department|client|customer|vendor|supplier|hir(e|ing)|headcount|layoff|budget|forecast|roadmap|backlog|sprint|stakeholder|board|revenue|pricing|contract|deal|procurement|market|go.?to.?market|quarter|kpi|okr|ship|launch|deploy|rollout|engineering|sales|marketing|operations|manager|direct report|deadline|milestone|project|partnership|investor|fundrais|runway|churn|onboarding|vendor selection|build vs buy)\b/i;
const PERSONAL_SCOPE_RX = /\b(my (wife|husband|spouse|partner|girlfriend|boyfriend|kid|kids|child|children|son|daughter|family|mom|dad|mother|father|parent|parents|sister|brother|friend|health|doctor|therapist)|marriage|divorce|breakup|wedding|engagement ring|mortgage|where to live|relocat(e|ion) (my family|for personal)|career change|quit my job|leave my job|personal finance|retirement|my savings|my relationship|family member)\b/i;
function classifyScope({ title, text }) {
  const hay = ((title || "") + "  " + (text || "")).slice(0, 6000);
  if (PERSONAL_SCOPE_RX.test(hay)) return { scope: "personal", confidence: "high", suggested: null };
  const workHits = (hay.match(WORK_SCOPE_RX) || []).length;
  if (workHits >= 2) return { scope: "work", confidence: "high", suggested: null };
  if (workHits === 1) return { scope: "personal", confidence: "low", suggested: "work" }; // ambiguous -> private until confirmed
  return { scope: "personal", confidence: "high", suggested: null };
}

// ===== v73 OUTCOME CAPTURE =====
const DEFAULT_REVIEW_HORIZON_DAYS = 7; // Build 4: reduced from 14 to 7 days. User-adjustable via Settings.
const SETTINGS_KEY_HORIZON = "wo:settings:reviewHorizonDays";

// Load the user's saved horizon preference. Returns DEFAULT_REVIEW_HORIZON_DAYS if unset.
async function loadReviewHorizonDays() {
  try {
    const r = await store.get(SETTINGS_KEY_HORIZON);
    if (r && r.value) { const n = parseInt(r.value, 10); if (n >= 1 && n <= 30) return n; }
  } catch (_) {}
  return DEFAULT_REVIEW_HORIZON_DAYS;
}

async function saveReviewHorizonDays(days) {
  const clamped = Math.max(1, Math.min(30, Math.round(days)));
  try { await store.set(SETTINGS_KEY_HORIZON, String(clamped)); } catch (_) {}
}
const OUTCOME_RESULTS = {
  held:    { label: "Held",            color: "var(--positive)" },
  partial: { label: "Partially held",  color: "var(--caution)" },
  broke:   { label: "Did not hold",    color: "var(--critical)" },
};
// Pull a first-pass load-bearing assumption from the document: the first Assumptions
// item, category stripped off. This is the synchronous FLOOR; classifyCommitSignalsModel
// refines it to the assumption that, if wrong, would most change the call.
function extractLoadBearingAssumption(docFormatted) {
  const sections = (docFormatted && docFormatted.sections) || [];
  const a = sections.find(s => /assumption/i.test(s.heading || ""));
  if (!a) return null;
  const items = a.isList ? (a.items || []) : String(a.content || "").split(/\n+/).map(x => x.trim()).filter(Boolean);
  if (!items.length) return null;
  const first = String(items[0]).trim();
  const m = first.match(/\b(structural|behavioral|operational|external)\b/i);
  const text = first.replace(/^\s*(structural|behavioral|operational|external)\s*[:\-–—]?\s*/i, "").trim() || first;
  return { text, category: m ? m[1].toLowerCase() : null };
}
// Initialize the outcome/review state for a fresh commit. Never overwrites a result
// already recorded (re-commits in the same session keep the existing outcome).
function initOutcomeState(prevDs, docFormatted, now, horizonDays) {
  const _horizon = (horizonDays && horizonDays >= 1) ? horizonDays : DEFAULT_REVIEW_HORIZON_DAYS;
  const lba = extractLoadBearingAssumption(docFormatted);
  const already = prevDs && prevDs.outcome && prevDs.outcome.status === "recorded";
  const _resolveBy = (prevDs && prevDs.reviewDueAt) || (now + _horizon * 864e5);
  return {
    committedAt: now,
    loadBearingAssumption: lba,
    // v122: the prediction is the falsifiable bet. trigger is the observable that
    // settles it (model-suggested, user-editable). resolveBy mirrors reviewDueAt so the
    // bet has a date. A bet with no observable and no date does not grade cleanly.
    prediction: (prevDs && prevDs.prediction) || { trigger: null, resolveBy: _resolveBy },
    reviewDueAt: _resolveBy,
    outcome: already ? prevDs.outcome : { status: "pending", result: null, note: "", recordedAt: null },
  };
}
// v90: soft-check window. A lower-friction "does this still feel right?" nudge fires
// at 3 days — before the full outcome-review horizon — and seeds outcome state with a
// single yes/no signal without requiring the full review. Lowers activation energy on
// the highest-value retention behavior (returning to close the loop).
const SOFT_CHECK_DAYS = 3;
// Read the index meta into a Review queue. Due = committed, awaiting outcome, past horizon.
// v98.8: accepts horizonDays so soft-check eligibility uses the user's actual
// preference, not the hardcoded DEFAULT_REVIEW_HORIZON_DAYS. Falls back to the
// default for sessions that predate the committedAt field (legacy back-calc path).
function buildReviewQueue(sessions, horizonDays) {
  const _horizon = (horizonDays && horizonDays >= 1) ? horizonDays : DEFAULT_REVIEW_HORIZON_DAYS;
  const now = Date.now();
  const due = [], upcoming = [], recorded = [], softCheck = [];
  const softMs = SOFT_CHECK_DAYS * 864e5;
  (sessions || []).forEach(s => {
    if (!(s.hasDoc || s.status === "Committed")) return;
    const oc = s.outcome;
    if (oc && oc.status === "recorded") { recorded.push(s); return; }
    const isDue = (s.reviewDueAt && s.reviewDueAt <= now) || !s.reviewDueAt;
    if (isDue) { due.push(s); return; }
    upcoming.push(s);
    // Soft-check eligibility: committed >= 3 days ago, not yet at full horizon,
    // no soft check already done, and an outcome not yet recorded.
    const committedAt = s.committedAt || (s.reviewDueAt ? s.reviewDueAt - _horizon * 864e5 : null);
    if (committedAt && (now - committedAt) >= softMs && !s.softCheck) softCheck.push(s);
  });
  due.sort((a, b) => (a.reviewDueAt || 0) - (b.reviewDueAt || 0));
  upcoming.sort((a, b) => (a.reviewDueAt || 0) - (b.reviewDueAt || 0));
  recorded.sort((a, b) => ((b.outcome && b.outcome.recordedAt) || 0) - ((a.outcome && a.outcome.recordedAt) || 0));
  softCheck.sort((a, b) => (a.committedAt || 0) - (b.committedAt || 0));
  return { due, upcoming, recorded, softCheck, dueCount: due.length, softCount: softCheck.length };
}

// v73: model-side commit classifier. Runs once post-commit (one FAST/Haiku call,
// self-timing out), and UPGRADES the synchronous heuristic. It does two things more
// accurately than keywords/first-item can: (1) classify work vs personal, (2) pick the
// load-bearing assumption that, if wrong, would most change whether the call was right
// (load-bearing AND uncertain), not merely the first one listed. The model only ADVISES.
// The privacy keystone stays deterministic in the caller: a "work" label is honored only
// at high confidence, otherwise it stays personal with a "mark as work" suggestion.
const COMMIT_SIGNAL_TIMEOUT_MS = 8000;
async function classifyCommitSignalsModel(docFormatted, rawText) {
  const sections = (docFormatted && docFormatted.sections) || [];
  const aSec = sections.find(s => /assumption/i.test(s.heading || ""));
  const aText = aSec ? (aSec.isList ? (aSec.items || []).join("\n") : (aSec.content || "")) : "";
  const title = (docFormatted && docFormatted.title) || "";
  if (!title && !aText && (!rawText || rawText.trim().length < 40)) return null;
  const sys = `You analyze one committed decision for a user's private decision ledger. Return ONLY a JSON object, no prose, no fences:
{"scope": "work" | "personal",
 "confidence": "high" | "low",
 "assumption": {"text": "<= 25 words", "category": "structural" | "behavioral" | "operational" | "external"},
 "trigger": "<= 18 words"}
scope: is this a work/professional decision or a personal/life decision? Default to "personal" when ambiguous. Use "work" only when it is clearly professional, and set "confidence":"high" only when unambiguous.
assumption: identify the single load-bearing assumption that, if it turned out wrong, would most change whether this decision was right. Prefer one that is both central and genuinely uncertain over one that is central but certain. Tightly paraphrase it (max 25 words). category is its type.
trigger: name the one observable signal that, by the review date, will settle whether the assumption held. It must be concrete and checkable, not a feeling. State it as the thing to look for (max 18 words).`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), COMMIT_SIGNAL_TIMEOUT_MS);
  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
      body: JSON.stringify({ model: MODELS.FAST, max_tokens: 220,
        system: [{ type: "text", text: sys, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: `TITLE: ${title}\n\nASSUMPTIONS SECTION:\n${aText.slice(0, 1200)}\n\nDECISION CONTEXT:\n${(rawText || "").slice(0, 1800)}` }] })
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
    const parsed = extractJsonObject(raw);
    if (!parsed) return null;
    const scope = (parsed.scope === "work" || parsed.scope === "personal") ? parsed.scope : "personal";
    const confidence = (parsed.confidence === "high" || parsed.confidence === "low") ? parsed.confidence : "low";
    let assumption = null;
    if (parsed.assumption && typeof parsed.assumption === "object" && parsed.assumption.text) {
      const cat = String(parsed.assumption.category || "").toLowerCase();
      assumption = {
        text: String(parsed.assumption.text).slice(0, 240).trim(),
        category: ["structural", "behavioral", "operational", "external"].includes(cat) ? cat : null,
      };
    }
    let trigger = null;
    if (parsed.trigger && typeof parsed.trigger === "string") {
      const t = parsed.trigger.slice(0, 160).trim();
      if (t) trigger = t;
    }
    return { scope, confidence, assumption, trigger };
  } catch { clearTimeout(timer); return null; }
}

// Derive a human-readable session status from available signals.
// Used by Decision Library. Returns neutral states for legacy sessions.
function deriveSessionStatus(session) {
  const ds = session.decisionState;
  const mode = session.currentMode || ds?.currentMode || null;
  const hasDoc = (session.messages || []).some(m => m.docData);
  if (hasDoc) return "Committed";
  if (mode === "Commit") return "Committed";
  if (mode === "Explore") {
    // "Ready to Commit" only when we have real signal it's ready (Phase 2 fills this)
    if (ds?.readinessScore != null && ds.readinessScore >= 70) return "Ready to Commit";
    return "Exploring";
  }
  if (mode === "Clarify") return "Clarify";
  return null; // legacy / unknown — Decision Library shows neutral empty state
}


function parseResponse(raw){
  // v69: document extraction now uses the balanced-brace, fence-tolerant
  // extractDocumentBlock instead of the old /```json\n...\n```/ match, which
  // required exact newline placement and silently dropped the document on any
  // deviation. This is the per-Commit hot path, so the hardening matters most here.
  const { doc:docData, text } = extractDocumentBlock(raw);
  // v99.7 (H2): "Draft" added to the mode grammar. SYSTEM_PROMPT_DRAFT mandates
  // "Mode: Clarify" | "Mode: Draft"; the old regex never matched Draft, so every
  // draft turn fell back to the inferred mode — permanently "Clarify" for the draft
  // workflow. Stage never advanced, status derivation leaned on hasDoc alone, and
  // (H3) draft turns never counted as productive. Draft maps to Commit (locked
  // artifact equivalence) so stage, status, and the turn cap behave consistently.
  const mm=text.match(/^Mode:\s*(Clarify|Chat|Explore|Commit|Draft)/im);
  const rm=text.match(/Reasoning Strength:\s*(High|Moderate|Limited)/i);
  const parsedMode = mm ? (mm[1]==="Chat" ? "Clarify" : mm[1]==="Draft" ? "Commit" : mm[1]) : null;
  // v99.7 (P1): strip the Mode and Reasoning Strength lines from the DISPLAY text.
  // ModeTag and the confidence Dot already present both signals; the raw lines
  // duplicated them inside the message body. rawHistory keeps the unstripped text
  // (mode parsing and countProductiveTurns depend on it); only the rendered copy
  // is cleaned — the same treatment _compactLine already applies to summaries.
  const display = text
    .replace(/^Mode:\s*\w+[ \t]*\r?\n?/im, "")
    .replace(/^\s*Reasoning Strength:\s*(High|Moderate|Limited).*$/im, "")
    .trim();
  return{text:display,mode:parsedMode,reasoningStrength:rm?rm[1]:null,docData};
}


// ===== ADVANCED ENGINE (overlay engine + profile + intelligence generators, verbatim from v45) =====
function detectOptions(rawHistory) {
  const text = rawHistory.map(m=>m.content||"").join(" ");
  const opts = new Set();
  // v99.6 (L3): case-insensitive dedup — "Build" and "build", or "Option A" and
  // "option a", previously survived as separate options. First-seen casing wins.
  const _seen = new Set();
  const addOpt = (c) => { const k = c.toLowerCase(); if(!_seen.has(k)){ _seen.add(k); opts.add(c); } };
  // "A vs B" / "A versus B"
  const vsMatches = text.match(/([A-Z][\w&.\- ]{1,40}?)\s+(?:vs\.?|versus)\s+([A-Z][\w&.\- ]{1,40})/g) || [];
  vsMatches.forEach(m=>{
    const parts = m.split(/\s+(?:vs\.?|versus)\s+/i);
    parts.forEach(p=>{const c=p.trim();if(c.length>1&&c.length<42)addOpt(c);});
  });
  // "build or buy", "launch now or wait" — common binary phrasings.
  // v98.8: scoped to the last 4 turns only (most recent 2 user + 2 assistant messages).
  // The full-history join caused binary labels from unrelated earlier turns to fire on
  // later decisions. Binary phrasings are conversational signals; they decay with context.
  const recentText = rawHistory.slice(-4).map(m=>m.content||"").join(" ");
  const orMatches = recentText.match(/\b(build or buy|buy or build|launch now or (?:wait|delay)|raise (?:now )?or (?:wait|hold)|hire or (?:wait|pass))\b/gi) || [];
  // "Option A", "Option 1" — normalized to "Option X" so casing variants collapse.
  const optionLabels = text.match(/\boption\s+([A-Z0-9])\b/gi) || [];
  const labelSet = new Set(optionLabels.map(o=>"Option "+o.trim().slice(-1).toUpperCase()));
  // Build the result conservatively
  let detected = Array.from(opts).slice(0,4);
  if (detected.length < 2 && labelSet.size >= 2) detected = Array.from(labelSet).slice(0,4);
  if (detected.length < 2 && orMatches.length > 0) {
    // Binary phrasing — split into two readable options
    const m = orMatches[0].toLowerCase();
    if (m.includes("build or buy")||m.includes("buy or build")) detected = ["Build","Buy"];
    else if (m.includes("launch")) detected = ["Launch now","Wait"];
    else if (m.includes("raise")) detected = ["Raise now","Hold"];
    else if (m.includes("hire")) detected = ["Hire","Pass"];
  }
  return detected.length >= 2 ? detected : [];
}

// Build a compact context digest for overlays — keeps token cost low.
// We do NOT send full history; we send a trimmed summary + the last assistant output.
function overlayContextDigest(rawHistory, docFormatted) {
  const lastAssistant = [...rawHistory].reverse().find(m=>m.role==="assistant");
  const userBits = rawHistory.filter(m=>m.role==="user").map(m=>m.content).join(" • ").slice(0, 1200);
  let docBit = "";
  if (docFormatted) {
    docBit = "\n\nCURRENT DECISION DOCUMENT:\n# " + docFormatted.title + "\n" +
      (docFormatted.sections||[]).map(s=>"## "+s.heading+"\n"+(s.isList?(s.items||[]).slice(0,6).map(i=>"- "+i).join("\n"):(s.content||"").slice(0,400))).join("\n");
  }
  const lastBit = lastAssistant ? "\n\nMOST RECENT ANALYSIS:\n" + (lastAssistant.content||"").replace(/^Mode:.*$/m,"").replace(/Reasoning Strength:.*$/m,"").trim().slice(0, 1500) : "";
  return "DECISION CONTEXT (user input):\n" + userBits + lastBit + docBit;
}

// The three overlay kinds and their prompt builders.
// v39: instruction builders no longer embed the digest. runOverlay sends the digest
// as a separate, cache-flagged content block that LEADS the message, so when a user
// runs Battle then Challenge then Perspective on the same decision, the (large) digest
// is a cache read on the second and third runs instead of full-price input each time.
// The instruction varies per kind and follows the cache breakpoint.
const OVERLAY_KINDS = {
  battle: {
    label: "Decision Battle",
    maxTokens: 1400,
    buildInstruction: (params) => `You are running a "Decision Battle" — a head-to-head structured comparison.
Options to compare: ${(params.options||[]).join(" vs ")}.
Using ONLY the decision context provided above, output a JSON object (no prose, no fences):
{"options":[{"name":"...","strengths":["..."],"weaknesses":["..."]}],
 "winner":"option name | Conditional | Insufficient Evidence",
 "winnerRationale":"one sentence",
 "confidence":"Low|Moderate|High",
 "keyTradeoffs":["each tradeoff paired with which option it favors"],
 "keyDrivers":["the factors that decide this"],
 "risks":["top risks of the winner"],
 "evidenceGaps":["what is missing to be sure"]}
Calibrate confidence to evidence quality. If evidence is thin, winner may be "Conditional" or "Insufficient Evidence". Do not fabricate facts.`,
  },
  challenge: {
    label: "Challenge This Decision",
    maxTokens: 1100,
    buildInstruction: (params) => `You are the strongest reasonable critic of the current recommendation. Build the best case AGAINST it.
Using ONLY the decision context provided above, output a JSON object (no prose, no fences):
{"strongestCounterargument":"the most compelling case against the current direction",
 "mostVulnerableAssumption":"the assumption that, if wrong, breaks the decision",
 "highestRiskScenario":"the realistic scenario that would make this a mistake",
 "additionalEvidenceNeeded":["specific evidence that would resolve the doubt"]}
Use only known information. Explicitly mark anything unknown rather than inventing it. Do not fabricate facts.`,
  },
  perspective: {
    label: "Perspective",
    maxTokens: 1100,
    buildInstruction: (params) => `Re-examine the current decision strictly from the perspective of a ${params.role}.
Using ONLY the decision context provided above, output a JSON object (no prose, no fences):
{"role":"${params.role}",
 "priorities":["what this role cares about most here"],
 "objections":["where this role would push back"],
 "additionalRisks":["risks this role would flag that others might miss"],
 "questions":["the questions this role would ask before approving"]}
Stay specific to this role. Do not restate the whole decision. Do not fabricate facts.`,
  },
};

// Single entry point. Returns parsed overlay data or an error marker.
async function runOverlay(kind, digest, params, signal) {
  const spec = OVERLAY_KINDS[kind];
  if (!spec) return { error: "Unknown overlay" };
  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal,
      body: JSON.stringify({ model: MODELS.PRIMARY, max_tokens: spec.maxTokens,
        messages: [{ role: "user", content: [
          { type: "text", text: digest, cache_control: { type: "ephemeral" } },
          { type: "text", text: spec.buildInstruction(params) }
        ] }] })
    });
    if (!res.ok) return { error: "Overlay request failed (" + res.status + ")" };
    const data = await res.json();
    const raw = data.content?.filter(b=>b.type==="text").map(b=>b.text).join("") || "";
    const parsed = extractJsonObject(raw);
    if (!parsed) return { error: "Could not parse overlay output" };
    return { kind, data: parsed };
  } catch (e) {
    if (e.name === "AbortError") return { error: "aborted" };
    return { error: "Overlay error" };
  }
}




const PROFILE_STORAGE_KEY = "wo:profile";
const PROFILE_ALPHA = 0.15; // smoothing factor — small, stable updates only

// v71: structural profile (v2). Replaces the v1 regex preference axes. The profile now
// records HOW the user reasons (assumption category mix, confidence vs evidence
// calibration, rigor) so calibration is corrective (push on blind spots) not conforming.
const EVIDENCE_REQUIREMENT = {
  "Validated Test": "High", "Expert Judgment": "High", "External Data": "High",
  "Internal Data": "Balanced", "Internal Observation": "Low", "Anecdotal": "Low",
};
const ASSUMPTION_CAT_LABEL = {
  structural: "Structural", behavioral: "Behavioral",
  operational: "Operational", external: "External",
};
const PROFILE_AXES_V1 = ["speedVsAccuracy","growthVsRisk","costVsQuality","centralizationVsAutonomy","shortTermVsLongTerm"];

function emptyProfile() {
  return {
    version: 2,
    decisionCount: 0,
    assumptionMix: null,                                 // running mean of category proportions
    __mixCount: 0,
    confidence: { high: 0, moderate: 0, limited: 0 },    // running counts of the band committed at
    evidence: { High: 0, Balanced: 0, Low: 0 },          // running counts of evidence brought
    reversibility: { Reversible: 0, Irreversible: 0 },   // running counts
    rigor: 0,                                            // 0..100 EMA of assumption density
    outcomes: { held: 0, partial: 0, broke: 0 },         // v73: recorded outcome results
    breakByCategory: { structural: 0, behavioral: 0, operational: 0, external: 0 }, // v73: where calls break
    lastUpdated: null,
  };
}

async function loadProfile() {
  try {
    const r = await store.get(PROFILE_STORAGE_KEY);
    if (!r) return emptyProfile();
    return coerceProfile(JSON.parse(r.value)) || emptyProfile(); // migrate v1 / validate v2 on load
  } catch { return emptyProfile(); }
}

async function saveProfile(profile) {
  try { await store.set(PROFILE_STORAGE_KEY, JSON.stringify(profile)); }
  catch {}
}

// v71: validate/normalize an imported or stored profile against the v2 shape, and
// migrate a v1 (legacy axis) profile forward. v1 migration is lossy by necessity (it
// stored no structural data); it preserves the count and lightly carries evidence /
// reversibility, and fabricates no structural signal.
function _clampInt(v, min) { return (typeof v === "number" && isFinite(v)) ? Math.max(min, Math.floor(v)) : min; }
function _clampCounts(obj, keys) {
  const out = {}; keys.forEach(k => { const v = obj && obj[k]; out[k] = (typeof v === "number" && isFinite(v) && v > 0) ? Math.floor(v) : 0; });
  return out;
}
function _sumCounts(o) { return Object.values(o || {}).reduce((s, v) => s + (v || 0), 0); }

function coerceProfile(obj) {
  if (!obj || typeof obj !== "object") return null;
  if (typeof obj.decisionCount !== "number" || !isFinite(obj.decisionCount)) return null;
  if (obj.version === 2) return coerceProfileV2(obj);
  if (PROFILE_AXES_V1.some(k => typeof obj[k] === "number" && isFinite(obj[k]))) return migrateV1ToV2(obj);
  return null;
}

function coerceProfileV2(obj) {
  const out = emptyProfile();
  let signal = false;
  if (obj.assumptionMix && typeof obj.assumptionMix === "object") {
    const keys = ["structural", "behavioral", "operational", "external"];
    const clean = {}; let ok = true;
    keys.forEach(k => { const v = obj.assumptionMix[k]; if (typeof v === "number" && isFinite(v)) clean[k] = Math.max(0, Math.min(1, v)); else ok = false; });
    if (ok) { out.assumptionMix = clean; signal = true; }
  }
  out.__mixCount = _clampInt(obj.__mixCount, 0);
  out.confidence = _clampCounts(obj.confidence, ["high", "moderate", "limited"]);
  out.evidence = _clampCounts(obj.evidence, ["High", "Balanced", "Low"]);
  out.reversibility = _clampCounts(obj.reversibility, ["Reversible", "Irreversible"]);
  out.outcomes = _clampCounts(obj.outcomes, ["held", "partial", "broke"]);
  out.breakByCategory = _clampCounts(obj.breakByCategory, ["structural", "behavioral", "operational", "external"]);
  if (_sumCounts(out.confidence) || _sumCounts(out.evidence) || _sumCounts(out.reversibility) || _sumCounts(out.outcomes)) signal = true;
  if (typeof obj.rigor === "number" && isFinite(obj.rigor)) { out.rigor = Math.max(0, Math.min(100, Math.round(obj.rigor))); signal = true; }
  out.decisionCount = _clampInt(obj.decisionCount, 0);
  if (typeof obj.lastUpdated === "number" && isFinite(obj.lastUpdated)) out.lastUpdated = obj.lastUpdated;
  if (!signal && out.decisionCount === 0) return null;
  return out;
}

function migrateV1ToV2(obj) {
  const out = emptyProfile();
  out.decisionCount = _clampInt(obj.decisionCount, 0);
  const ep = obj.evidencePreference;
  if (ep === "High" || ep === "Balanced" || ep === "Low") out.evidence[ep] = 1;
  const rp = obj.reversibilityPreference;
  if (rp === "Reversible" || rp === "Irreversible") out.reversibility[rp] = 1;
  out.lastUpdated = Date.now();
  return out;
}

// v71: structural derivation. Reads only the model's structured Commit output (section
// headings + the categorized Assumptions section), never raw keyword frequency.
function extractProfileSignals(decisionState, docFormatted, readiness) {
  const out = {};
  const sections = (docFormatted && docFormatted.sections) || [];
  const sectionText = (re) => {
    const s = sections.find(x => re.test(x.heading || ""));
    if (!s) return "";
    return s.isList ? (s.items || []).join("\n") : (s.content || "");
  };

  const aText = sectionText(/assumption/i);
  if (aText) {
    const mix = { structural: 0, behavioral: 0, operational: 0, external: 0 };
    (aText.match(/\b(structural|behavioral|operational|external)\b/gi) || []).forEach(m => { mix[m.toLowerCase()]++; });
    const tot = mix.structural + mix.behavioral + mix.operational + mix.external;
    if (tot > 0) out.assumptionMix = {
      structural: mix.structural / tot, behavioral: mix.behavioral / tot,
      operational: mix.operational / tot, external: mix.external / tot,
    };
  }

  const band = decisionState && decisionState.confidence;
  if (band === "High" || band === "Moderate" || band === "Limited") out.confidenceBand = band;

  const ev = (readiness && readiness.evidenceLevel) || (decisionState && decisionState.evidenceStrength);
  if (ev && EVIDENCE_REQUIREMENT[ev]) out.evidenceRequirement = EVIDENCE_REQUIREMENT[ev];

  const aCount = countDocAssumptions(docFormatted);
  if (aCount > 0) out.rigor = Math.min(100, Math.round((aCount / 12) * 100));

  const rText = (sectionText(/risk|tradeoff/i) + " " + aText).toLowerCase();
  if (/\b(irreversible|one.?way door|permanent|cannot be undone|hard to reverse)\b/.test(rText)) out.reversibility = "Irreversible";
  else if (/\b(reversible|two.?way door|pilot|trial|can revisit|easily undone)\b/.test(rText)) out.reversibility = "Reversible";

  return out;
}

// v71: accumulate one decision's structural signals. Never mutates prev. A stored v1
// profile (no version:2) is reset to the v2 shape here; loadProfile already migrates on
// load, so this is a backstop.
function updateProfile(prev, signals) {
  const base = (prev && typeof prev === "object" && prev.version === 2) ? prev : emptyProfile();
  const next = {
    ...base, version: 2,
    decisionCount: (base.decisionCount || 0) + 1, lastUpdated: Date.now(),
    confidence: { ...base.confidence }, evidence: { ...base.evidence }, reversibility: { ...base.reversibility },
  };

  if (signals.assumptionMix) {
    const seen = base.__mixCount || 0;
    const prevMix = base.assumptionMix || { structural: 0, behavioral: 0, operational: 0, external: 0 };
    const blend = (a, b) => +(((a * seen) + b) / (seen + 1)).toFixed(3);
    next.assumptionMix = {
      structural: blend(prevMix.structural, signals.assumptionMix.structural),
      behavioral: blend(prevMix.behavioral, signals.assumptionMix.behavioral),
      operational: blend(prevMix.operational, signals.assumptionMix.operational),
      external: blend(prevMix.external, signals.assumptionMix.external),
    };
    next.__mixCount = seen + 1;
  }

  if (signals.confidenceBand) { const k = signals.confidenceBand.toLowerCase(); next.confidence[k] = (next.confidence[k] || 0) + 1; }
  if (signals.evidenceRequirement) next.evidence[signals.evidenceRequirement] = (next.evidence[signals.evidenceRequirement] || 0) + 1;
  if (signals.reversibility) next.reversibility[signals.reversibility] = (next.reversibility[signals.reversibility] || 0) + 1;

  if (typeof signals.rigor === "number")
    next.rigor = Math.round((1 - PROFILE_ALPHA) * (base.rigor || 0) + PROFILE_ALPHA * signals.rigor);

  return next;
}

// v73: fold a recorded outcome into the profile. Outcomes are a separate signal from
// commit count (decisionCount is not touched here). result in held|partial|broke;
// category (optional) is the load-bearing assumption's category, used for breakByCategory.
function recordOutcomeToProfile(prev, { result, category }) {
  const base = (prev && typeof prev === "object" && prev.version === 2) ? prev : emptyProfile();
  const r = (result === "held" || result === "partial" || result === "broke") ? result : null;
  if (!r) return base;
  const next = {
    ...base, version: 2, lastUpdated: Date.now(),
    outcomes: { ...(base.outcomes || { held: 0, partial: 0, broke: 0 }) },
    breakByCategory: { ...(base.breakByCategory || { structural: 0, behavioral: 0, operational: 0, external: 0 }) },
  };
  next.outcomes[r] = (next.outcomes[r] || 0) + 1;
  if ((r === "broke" || r === "partial") && category && next.breakByCategory[category] != null)
    next.breakByCategory[category] += 1;
  return next;
}

// Single source of truth for the reads used by both the prompt block and the display.
// Returns null fields below signal so nothing is faked.
function deriveProfileReads(p) {
  if (!p || p.version !== 2 || !p.decisionCount) return null;
  const total = (c) => Object.values(c || {}).reduce((s, v) => s + (v || 0), 0);
  const mode = (c) => { const e = Object.entries(c || {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]); return e.length ? e[0][0] : null; };

  let weakestCategory = null, strongestCategory = null;
  if (p.assumptionMix && (p.__mixCount || 0) >= 2) {
    const e = Object.entries(p.assumptionMix);
    weakestCategory = e.slice().sort((a, b) => a[1] - b[1])[0][0];
    strongestCategory = e.slice().sort((a, b) => b[1] - a[1])[0][0];
  }
  const confidenceMode = total(p.confidence) >= 2 ? mode(p.confidence) : null;
  const evidenceMode = total(p.evidence) >= 2 ? mode(p.evidence) : null;
  const reversibilityMode = total(p.reversibility) >= 2 ? mode(p.reversibility) : null;
  const overconfident = confidenceMode === "high" && evidenceMode === "Low";
  const rigorLow = (p.__mixCount || 0) >= 2 && typeof p.rigor === "number" && p.rigor < 40;
  const oc = p.outcomes || { held: 0, partial: 0, broke: 0 };
  const outcomeTotal = (oc.held || 0) + (oc.partial || 0) + (oc.broke || 0);
  const heldRate = outcomeTotal >= 2 ? Math.round(((oc.held || 0) + 0.5 * (oc.partial || 0)) / outcomeTotal * 100) : null;
  let mostBrokenCategory = null;
  const bc = p.breakByCategory || {};
  const bcTotal = Object.values(bc).reduce((s, v) => s + (v || 0), 0);
  if (bcTotal >= 2) { const e = Object.entries(bc).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]); mostBrokenCategory = e.length ? e[0][0] : null; }
  return { weakestCategory, strongestCategory, confidenceMode, evidenceMode, reversibilityMode, overconfident, rigorLow, rigor: p.rigor, outcomeTotal, heldRate, mostBrokenCategory };
}

// v71: maps the structural profile onto the frozen display contract:
//   Array<{ key, label, value, state: "thin" | "calibrating" | "established" }>
// label/value are retained so existing render code keeps working; key/state are additive.
function formatProfileDisplay(profile, insightsEntitled = true) {
  if (!profile || !profile.decisionCount) return null;
  const n = profile.decisionCount;
  const baseState = n >= 4 ? "established" : n >= 2 ? "calibrating" : "thin";
  const r = deriveProfileReads(profile) || {};
  const hasMix = (profile.__mixCount || 0) >= 2;
  const row = (key, label, value) => ({ key, label, value: value != null ? value : "Not yet calibrated", state: value != null ? baseState : "thin" });
  // v74: the overconfidence read is an interpretive insight. On the free tier the
  // confidence value shows the mode only; the "(ahead of evidence)" call is held
  // for insights-entitled tiers.
  const confidenceVal = r.confidenceMode
    ? r.confidenceMode.charAt(0).toUpperCase() + r.confidenceMode.slice(1) + (insightsEntitled && r.overconfident ? " (ahead of evidence)" : "")
    : null;
  const rigorVal = (hasMix && typeof r.rigor === "number") ? (r.rigor >= 70 ? "High" : r.rigor >= 40 ? "Moderate" : "Developing") : null;
  const rows = [
    row("decisions",     "Decisions learned from", String(n)),
    row("attends",       "Reasoning focus",         r.strongestCategory ? ASSUMPTION_CAT_LABEL[r.strongestCategory] + " assumptions" : null),
    row("blindspot",     "Tends to under-surface",  r.weakestCategory ? ASSUMPTION_CAT_LABEL[r.weakestCategory] + " assumptions" : null),
    row("confidence",    "Commit confidence",       confidenceVal),
    row("evidence",      "Evidence brought",        r.evidenceMode),
    row("rigor",         "Assumption rigor",        rigorVal),
    row("reversibility", "Decision stance",         r.reversibilityMode ? r.reversibilityMode + " decisions" : null),
    row("outcomes",      "Outcomes recorded",       (r.outcomeTotal || 0) > 0 ? String(r.outcomeTotal) : null),
    row("heldrate",      "Calls that held",         r.heldRate != null ? r.heldRate + "%" : null),
    row("breaks",        "Tends to break on",       r.mostBrokenCategory ? ASSUMPTION_CAT_LABEL[r.mostBrokenCategory] + " assumptions" : null),
  ];
  // v74: blindspot and break-pattern are the interpretive insight rows. Counts,
  // confidence mode, evidence, rigor, and held rate are analytics and stay on free.
  const INSIGHT_ROWS = ["blindspot", "breaks"];
  return insightsEntitled ? rows : rows.filter(row => !INSIGHT_ROWS.includes(row.key));
}

// v114: Decision Style — a named archetype derived from the user's own decision
// structure, replacing the count-based Clarity Rank. The name is chosen by the most
// distinctive earned signal; the line is assembled from the real reads, so it is always
// true and sharpens as decisions accumulate. Below a 3-decision floor it returns a
// calibrating state (no faked identity early). Carries no private content: it describes
// how the user decides, never what they decided, so the card is safe to share.
function deriveDecisionStyle(profile) {
  const n = (profile && profile.decisionCount) || 0;
  if (n < 3) return { name: null, line: null, state: "calibrating", n, toFloor: 3 - n };
  const r = deriveProfileReads(profile) || {};
  const state = n >= 6 ? "established" : "emerging";
  // v114.1: archetype first. The NAME is the kind of thinker (cognitive orientation),
  // the most stable, identity-resonant signal. Posture and outcomes live in the line,
  // where they sharpen over time. Posture/outcome names are fallbacks only, used when
  // reasoning focus has not yet emerged (thin assumption-mix signal).
  let name, basis;
  if (r.strongestCategory === "structural") {
    name = "The Systemist"; basis = "decide from how the system is built";
  } else if (r.strongestCategory === "behavioral") {
    name = "The Reader"; basis = "decide from how people and incentives will actually behave";
  } else if (r.strongestCategory === "operational") {
    name = "The Operator"; basis = "decide from execution reality";
  } else if (r.strongestCategory === "external") {
    name = "The Navigator"; basis = "decide from market and outside forces";
  } else if (r.heldRate != null && r.heldRate >= 75 && r.outcomeTotal >= 3) {
    name = "The Calibrator"; basis = "commit calls with a track record of holding up";
  } else if (r.reversibilityMode === "Irreversible") {
    name = "The Closer"; basis = "commit decisively to one-way-door calls";
  } else if (r.reversibilityMode === "Reversible") {
    name = "The Pathfinder"; basis = "favor reversible moves and test before locking";
  } else if (r.evidenceMode === "High" && !r.overconfident) {
    name = "The Empiricist"; basis = "commit on verified evidence";
  } else if (typeof r.rigor === "number" && r.rigor >= 70) {
    name = "The Examiner"; basis = "surface the full assumption set before deciding";
  } else if (r.confidenceMode === "limited") {
    name = "The Deliberator"; basis = "commit carefully, rarely ahead of the evidence";
  } else {
    name = "The Generalist"; basis = "weigh structure, people, execution, and outside forces in balance";
  }
  // Line: orientation (the basis) + how they operate (posture) + how it is going (outcomes).
  let line = "You " + basis + ".";
  const posture = [];
  if (!/reversib|one-way/i.test(basis)) {
    if (r.reversibilityMode === "Irreversible") posture.push("commit decisively to one-way doors");
    else if (r.reversibilityMode === "Reversible") posture.push("favor reversible bets");
  }
  if (!/verified evidence/i.test(basis) && r.evidenceMode === "High" && !r.overconfident) posture.push("hold out for verified evidence");
  if (!/assumption set/i.test(basis) && typeof r.rigor === "number" && r.rigor >= 70) posture.push("surface assumptions thoroughly");
  if (posture.length) line += " You " + posture.slice(0, 2).join(" and ") + ".";
  if (name !== "The Calibrator" && r.heldRate != null && r.heldRate >= 70 && r.outcomeTotal >= 2)
    line += " So far your calls have largely held.";
  return { name, line, state, n };
}

// v122: the calibration credential. A carryable, attestable summary of judgment that
// held up, distinct from the live profile. gradedN and heldRate are the substance;
// firstSealed dates the record; window is the span it covers. The attestation is a
// deterministic client-side fingerprint here. SERVER-SIDE ATTESTATION SEAM: on the
// migrated backend, replace clientAttest with a signed token from Supabase so the
// credential is verifiable rather than self-asserted. Gated at the same 3-outcome floor
// as the Decision Style so nothing claims a track record before one exists.
function clientAttest(parts) {
  // Small, stable, non-cryptographic fingerprint. Verifiability is a server concern.
  const s = parts.filter(x => x != null).join("|");
  let h = 0; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
  return "wo-" + (h >>> 0).toString(36);
}
function deriveCredential(profile, ledger) {
  const r = deriveProfileReads(profile) || {};
  const gradedN = r.outcomeTotal || 0;
  if (gradedN < 3 || r.heldRate == null) {
    return { ready: false, gradedN, toFloor: Math.max(0, 3 - gradedN), heldRate: null };
  }
  const L = ledger || {};
  const firstSealed = L.firstSealed || (profile && profile.firstCommittedAt) || null;
  const lastReviewed = L.lastReviewed || (profile && profile.lastReviewedAt) || null;
  const cred = {
    ready: true,
    gradedN,
    heldRate: r.heldRate,
    firstSealed,
    lastReviewed,
    window: (firstSealed && lastReviewed) ? { from: firstSealed, to: lastReviewed } : null,
  };
  cred.attestation = clientAttest([cred.gradedN, cred.heldRate, cred.firstSealed, cred.lastReviewed]);
  return cred;
}

// v71: corrective calibration. Directs the model where to PUSH BACK (blind spots,
// overconfidence, thin rigor), never where to conform. Still emphasis and scrutiny
// only: it does not override evidence, confidence calibration, or tradeoff surfacing.
// Returns "" when signal is too thin to trust.
function profilePromptBlock(profile) {
  if (!profile || profile.version !== 2 || (profile.decisionCount || 0) < 2) return "";
  const r = deriveProfileReads(profile);
  if (!r) return "";
  const lines = [];
  if (r.weakestCategory)
    lines.push("tends to under-surface " + r.weakestCategory + " assumptions, so probe that category specifically");
  if (r.overconfident)
    lines.push("has a pattern of committing at high confidence on light evidence, so flag any confidence that runs ahead of the evidence");
  else if (r.confidenceMode === "limited")
    lines.push("usually commits at limited confidence, so do not manufacture certainty, but do help close the gap");
  if (r.rigorLow)
    lines.push("typically surfaces few assumptions, so press for the unstated ones rather than accepting a thin set");
  if (r.evidenceMode === "Low")
    lines.push("often proceeds on lighter evidence, so name the unverified explicitly rather than letting it pass");
  if (r.reversibilityMode === "Irreversible")
    lines.push("tends toward one-way-door commitments, so weight reversibility and the cost of being wrong");
  if (r.mostBrokenCategory)
    lines.push("has a track record of " + r.mostBrokenCategory + " assumptions breaking after commit, so scrutinize that category hardest before this call locks");
  if (lines.length === 0) return "";
  return "\n\nDECISION PROFILE (corrective calibration, derived from this user's prior decision structure; n=" + profile.decisionCount + "):\n" +
    "This user " + lines.join("; ") + ".\n" +
    "Use these to direct scrutiny and emphasis only. Do NOT override evidence, confidence calibration, or tradeoff surfacing, and never soften a risk to match a pattern.";
}

// ── FEATURE 1: DECISION DEPENDENCY MAPPING ───────────────────────────────────
// Lazy: called only in Explore/Commit when sufficient context exists.
// Returns parsed dependency object or null on failure.
async function generateDependencies(rawHistory, decisionState, signal) {
  if (!rawHistory || rawHistory.length < 3) return null;
  const userBits = rawHistory.filter(m => m.role === "user").map(m => m.content).join(" • ").slice(0, 1500);
  const lastAssistant = [...rawHistory].reverse().find(m => m.role === "assistant");
  const context = userBits + (lastAssistant ? "\n\nLast analysis:\n" + (lastAssistant.content || "").slice(0, 800) : "");

  // v80: static instruction cached; dynamic context is uncached tail.
  const DEPS_INSTRUCTION = `Analyze this decision context and identify decision dependencies.
Return ONLY a JSON object, no prose, no fences:
{
  "upstream": ["decisions that must be made or already been made before this one"],
  "downstream": ["decisions this one creates or unlocks"],
  "blockers": ["unresolved decisions or uncertainties blocking progress"],
  "generatedDecisions": ["new decisions this choice will require"]
}
Each array: 0-4 items, specific and concrete. If a category is empty, use [].
Do not fabricate. Use only what is visible in the context.`;

  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal,
      body: JSON.stringify({ model: MODELS.PRIMARY, max_tokens: 600,
        messages: [{ role: "user", content: [
          { type: "text", text: DEPS_INSTRUCTION, cache_control: { type: "ephemeral" } },
          { type: "text", text: `\n\nContext:\n${context}` }
        ] }] })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
    const parsed = extractJsonObject(raw);
    if (!parsed) return null;
    return {
      upstream: Array.isArray(parsed.upstream) ? parsed.upstream.slice(0, 4) : [],
      downstream: Array.isArray(parsed.downstream) ? parsed.downstream.slice(0, 4) : [],
      blockers: Array.isArray(parsed.blockers) ? parsed.blockers.slice(0, 4) : [],
      generatedDecisions: Array.isArray(parsed.generatedDecisions) ? parsed.generatedDecisions.slice(0, 4) : [],
    };
  } catch (e) {
    if (e.name === "AbortError") return null;
    return null;
  }
}

// ── FEATURE 3: FAILURE SIMULATION ENGINE ─────────────────────────────────────
// Code-gated from Chat — checked at call site, not just in system prompt.
// Returns array of failure scenarios + top drivers, or null on failure.
async function generateFailureSimulation(rawHistory, docFormatted, signal) {
  const userBits = (rawHistory || []).filter(m => m.role === "user").map(m => m.content).join(" • ").slice(0, 1200);
  const docBit = docFormatted
    ? "\n\nCurrent document:\n" + (docFormatted.sections || []).map(s =>
        "## " + s.heading + "\n" + (s.isList ? (s.items||[]).slice(0,5).join(", ") : (s.content||"").slice(0,300))
      ).join("\n")
    : "";

  // v80: static instruction cached; dynamic context is uncached tail.
  const FAILURE_INSTRUCTION = `Run a structured failure pre-mortem on this decision.
Return ONLY a JSON object, no prose, no fences:
{
  "scenarios": [
    {
      "title": "short failure name",
      "what": "what happens",
      "probability": "Low|Moderate|High",
      "impact": "Low|Moderate|High",
      "signals": ["early warning signal 1", "early warning signal 2"],
      "mitigation": "mitigation approach"
    }
  ]
}
Generate 3-5 realistic failure scenarios. Be specific, not generic. Use only information visible in the context.`;

  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal,
      body: JSON.stringify({ model: MODELS.PRIMARY, max_tokens: 1200,
        messages: [{ role: "user", content: [
          { type: "text", text: FAILURE_INSTRUCTION, cache_control: { type: "ephemeral" } },
          { type: "text", text: `\n\nContext:\n${userBits}${docBit}` }
        ] }] })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
    const parsed = extractJsonObject(raw);
    if (!parsed) return null;
    const scenarios = (parsed.scenarios || []).slice(0, 5);

    // Score by probability × impact and rank top 3
    const pScore = { Low: 1, Moderate: 2, High: 3 };
    const scored = scenarios.map(s => ({
      ...s,
      _score: (pScore[s.probability] || 1) * (pScore[s.impact] || 1),
    })).sort((a, b) => b._score - a._score);

    const topDrivers = scored.slice(0, 3).map(s => ({ title: s.title, score: s._score }));
    return { scenarios: scored, topDrivers };
  } catch (e) {
    if (e.name === "AbortError") return null;
    return null;
  }
}

// ── FEATURE 4: BENCHMARK INTELLIGENCE LAYER ──────────────────────────────────
// AI-synthesized. Confidence is calibrated by signal count (not model self-report).
// Only displayed when calibratedConfidence >= 60.
async function generateBenchmark(rawHistory, decisionState, docFormatted, signal) {
  const userBits = (rawHistory || []).filter(m => m.role === "user").map(m => m.content).join(" • ").slice(0, 1200);
  const docBit = docFormatted
    ? "\n\nDocument: " + (docFormatted.title || "") + "\n" +
      (docFormatted.sections || []).slice(0, 4).map(s =>
        s.heading + ": " + (s.isList ? (s.items||[]).slice(0,3).join(", ") : (s.content||"").slice(0,200))
      ).join("\n")
    : "";

  // v80: static instruction cached; dynamic context is uncached tail.
  const BENCHMARK_INSTRUCTION = `Synthesize benchmark intelligence for this decision from your training knowledge.
Return ONLY a JSON object, no prose, no fences:
{
  "comparableCases": <number 1-20 of comparable decisions you can draw on>,
  "benchmarkSummary": "2-3 sentence synthesis of how comparable decisions typically unfold",
  "commonOutcomes": ["typical outcome 1", "typical outcome 2", "typical outcome 3"],
  "successFactors": ["key factor 1", "key factor 2"],
  "commonMistakes": ["common mistake 1", "common mistake 2"]
}
Only draw on patterns you actually know. If the decision is too novel or specific for meaningful benchmarking, set comparableCases to 0 and acknowledge it in benchmarkSummary.`;

  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal,
      body: JSON.stringify({ model: MODELS.PRIMARY, max_tokens: 600,
        messages: [{ role: "user", content: [
          { type: "text", text: BENCHMARK_INSTRUCTION, cache_control: { type: "ephemeral" } },
          { type: "text", text: `\n\nContext:\n${userBits}${docBit}` }
        ] }] })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
    const parsed = extractJsonObject(raw);
    if (!parsed) return null;

    // Calibrate confidence by signal count, not model self-report.
    // More comparable cases + clearer decision type = higher calibrated confidence.
    const cases = Math.min(Math.max(parseInt(parsed.comparableCases) || 0, 0), 20);
    const hasDecisionType = !!decisionState?.decisionType && decisionState.decisionType !== "Plan";
    const hasTemplate = !!decisionState?.selectedTemplate;
    let calibratedConfidence = Math.round((cases / 20) * 70);
    if (hasDecisionType) calibratedConfidence += 15;
    if (hasTemplate) calibratedConfidence += 15;
    calibratedConfidence = Math.min(calibratedConfidence, 95);

    return {
      comparableCases: cases,
      calibratedConfidence,
      benchmarkSummary: parsed.benchmarkSummary || "",
      commonOutcomes: Array.isArray(parsed.commonOutcomes) ? parsed.commonOutcomes.slice(0, 3) : [],
      successFactors: Array.isArray(parsed.successFactors) ? parsed.successFactors.slice(0, 3) : [],
      commonMistakes: Array.isArray(parsed.commonMistakes) ? parsed.commonMistakes.slice(0, 3) : [],
    };
  } catch (e) {
    if (e.name === "AbortError") return null;
    return null;
  }
}

// ── v31.1: COMBINED INTELLIGENCE — one call returns deps + failure + benchmark ──
// Replaces three separate Sonnet round-trips with one when the user opens the
// full intelligence panel. Each section is parsed and post-processed identically
// to the individual functions (same scoring, same calibration, same shaping), so
// downstream consumers and cards are unchanged. Falls back gracefully per-section.
async function generateAllIntelligence(rawHistory, decisionState, docFormatted, signal) {
  if (!rawHistory || rawHistory.length < 3) return null;
  const userBits = rawHistory.filter(m => m.role === "user").map(m => m.content).join(" • ").slice(0, 1500);
  const lastAssistant = [...rawHistory].reverse().find(m => m.role === "assistant");
  const docBit = docFormatted
    ? "\n\nDocument: " + (docFormatted.title || "") + "\n" +
      (docFormatted.sections || []).slice(0, 4).map(s =>
        s.heading + ": " + (s.isList ? (s.items||[]).slice(0,3).join(", ") : (s.content||"").slice(0,200))
      ).join("\n")
    : "";
  const context = userBits + (lastAssistant ? "\n\nLast analysis:\n" + (lastAssistant.content || "").slice(0, 800) : "") + docBit;

  // v80: static instruction cached; dynamic context is uncached tail.
  const INTEL_INSTRUCTION = `Analyze this decision context and return THREE analyses in one JSON object.
Return ONLY a JSON object, no prose, no fences:
{
  "dependencies": {
    "upstream": ["decisions made/needed before this one"],
    "downstream": ["decisions this one creates or unlocks"],
    "blockers": ["unresolved decisions or uncertainties blocking progress"],
    "generatedDecisions": ["new decisions this choice will require"]
  },
  "failure": {
    "scenarios": [
      { "title": "short failure name", "what": "what happens", "probability": "Low|Moderate|High", "impact": "Low|Moderate|High", "signals": ["early warning 1","early warning 2"], "mitigation": "mitigation approach" }
    ]
  },
  "benchmark": {
    "comparableCases": <number 0-20>,
    "benchmarkSummary": "2-3 sentence synthesis of how comparable decisions unfold",
    "commonOutcomes": ["outcome 1","outcome 2","outcome 3"],
    "successFactors": ["factor 1","factor 2"],
    "commonMistakes": ["mistake 1","mistake 2"]
  }
}
Rules: dependency arrays 0-4 items each. 3-5 failure scenarios, specific not generic. Benchmark only from patterns you actually know; if too novel set comparableCases to 0 and say so. Do not fabricate. Use only what is visible in the context.`;

  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal,
      body: JSON.stringify({ model: MODELS.PRIMARY, max_tokens: 1800,
        messages: [{ role: "user", content: [
          { type: "text", text: INTEL_INSTRUCTION, cache_control: { type: "ephemeral" } },
          { type: "text", text: `\n\nContext:\n${context}` }
        ] }] })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
    const parsed = extractJsonObject(raw);
    if (!parsed) return null;

    // Dependencies — same shaping as generateDependencies
    const d = parsed.dependencies || {};
    const dependencies = {
      upstream: Array.isArray(d.upstream) ? d.upstream.slice(0, 4) : [],
      downstream: Array.isArray(d.downstream) ? d.downstream.slice(0, 4) : [],
      blockers: Array.isArray(d.blockers) ? d.blockers.slice(0, 4) : [],
      generatedDecisions: Array.isArray(d.generatedDecisions) ? d.generatedDecisions.slice(0, 4) : [],
    };

    // Failure — same scoring/ranking as generateFailureSimulation
    const pScore = { Low: 1, Moderate: 2, High: 3 };
    const scenarios = ((parsed.failure && parsed.failure.scenarios) || []).slice(0, 5).map(s => ({
      ...s, _score: (pScore[s.probability] || 1) * (pScore[s.impact] || 1),
    })).sort((a, b) => b._score - a._score);
    const failure = scenarios.length
      ? { scenarios, topDrivers: scenarios.slice(0, 3).map(s => ({ title: s.title, score: s._score })) }
      : null;

    // Benchmark — same calibration as generateBenchmark
    const b = parsed.benchmark || {};
    const cases = Math.min(Math.max(parseInt(b.comparableCases) || 0, 0), 20);
    const hasDecisionType = !!decisionState?.decisionType && decisionState.decisionType !== "Plan";
    const hasTemplate = !!decisionState?.selectedTemplate;
    let calibratedConfidence = Math.round((cases / 20) * 70);
    if (hasDecisionType) calibratedConfidence += 15;
    if (hasTemplate) calibratedConfidence += 15;
    calibratedConfidence = Math.min(calibratedConfidence, 95);
    const benchmark = {
      comparableCases: cases, calibratedConfidence,
      benchmarkSummary: b.benchmarkSummary || "",
      commonOutcomes: Array.isArray(b.commonOutcomes) ? b.commonOutcomes.slice(0, 3) : [],
      successFactors: Array.isArray(b.successFactors) ? b.successFactors.slice(0, 3) : [],
      commonMistakes: Array.isArray(b.commonMistakes) ? b.commonMistakes.slice(0, 3) : [],
    };

    return { dependencies, failure, benchmark };
  } catch (e) {
    if (e.name === "AbortError") return null;
    return null;
  }
}


// ===== SCORECARD + DECISION CARD (verbatim from v45) =====
function bandFromScore(score) {
  if (score == null) return null;
  if (score >= 70) return "Strong";
  if (score >= 45) return "Moderate";
  return "Weak";
}
function riskBand(score) { // higher score = LOWER exposure; invert for label
  if (score == null) return null;
  if (score >= 70) return "Low";
  if (score >= 45) return "Moderate";
  return "High";
}

// Count assumptions surfaced in a committed document (Assumptions section).
function countDocAssumptions(docFormatted) {
  if (!docFormatted) return 0;
  const sec = (docFormatted.sections||[]).find(s=>/assumption/i.test(s.heading||""));
  if (!sec) return 0;
  if (sec.isList) return (sec.items||[]).length;
  return (sec.content||"").split("\n").filter(l=>l.trim()).length;
}

// Build the scorecard. Returns null if there isn't enough to evaluate honestly.
function buildScorecard(decisionState, readiness, docFormatted) {
  const hasDoc = !!docFormatted;
  const r = readiness;
  // Need at least a committed doc OR above-floor readiness to score at all.
  if (!hasDoc && !(r && r.readinessScore != null)) return null;

  // Decision Quality ~ readiness score (the rigor proxy). Qualitative if below floor.
  const dq = r?.readinessScore ?? null;
  // Confidence — from decisionState.confidence (reasoning strength) mapped to score.
  const confMap = { High: 85, Moderate: 60, Limited: 30 };
  const confScore = decisionState?.confidence ? confMap[decisionState.confidence] ?? null : null;
  // Evidence strength — from readiness evidence level.
  const evMap = { "Validated Test":95,"Expert Judgment":80,"External Data":68,"Internal Data":52,"Internal Observation":34,"Anecdotal":18 };
  const evScore = r?.evidenceLevel ? evMap[r.evidenceLevel] ?? null : null;
  // Risk exposure — inverse of risks category coverage (more risk analysis = lower exposure).
  const riskCov = r?.categories?.risks ?? null;
  const riskScore = riskCov != null ? Math.round(riskCov*100) : null;
  // Assumption density — count from doc; band by count.
  const aCount = countDocAssumptions(docFormatted);
  const assumptionBand = aCount === 0 ? null : aCount >= 12 ? "High" : aCount >= 7 ? "Moderate" : "Low";
  // Reversibility — heuristic from doc/readiness text mentions.
  const allText = (docFormatted ? (docFormatted.sections||[]).map(s=>s.content+" "+(s.items||[]).join(" ")).join(" ") : "").toLowerCase();
  let reversibility = null;
  if (/irreversible|cannot be undone|one.?way door|permanent|hard to reverse/.test(allText)) reversibility = "Low";
  else if (/reversible|can revisit|two.?way door|easily undone|pilot|trial/.test(allText)) reversibility = "High";
  else if (hasDoc) reversibility = "Moderate";

  return {
    decisionQuality: { score: dq, band: bandFromScore(dq) },
    confidence: { score: confScore, band: bandFromScore(confScore), label: decisionState?.confidence || null },
    riskExposure: { score: riskScore, band: riskBand(riskScore) },
    assumptionDensity: { count: aCount, band: assumptionBand },
    reversibility: { band: reversibility },
    evidenceStrength: { score: evScore, band: bandFromScore(evScore), level: r?.evidenceLevel || null },
  };
}

// ─── DECISION CANVAS (Phase 4) ───────────────────────────────────────────────
// A concise, screenshot-friendly one-page synthesis built from decisionState +
// the committed document. Structure per spec: Objective, Options, Tradeoffs,
// Risks, Assumptions, Recommendation, Next Actions.

function buildDecisionCard(docFormatted, scorecard, decisionState) {
  if (!docFormatted) return null;
  const sec = name => {
    const s = (docFormatted.sections || []).find(x => new RegExp(name, "i").test(x.heading || ""));
    if (!s) return null;
    return s.isList ? (s.items || []).slice(0, 2).join("; ") : (s.content || "").slice(0, 200);
  };
  return {
    decision: docFormatted.title || "Decision",
    optionsCompared: (decisionState?.options || []).slice(0, 3).join(" vs ") || sec("option|alternative|compar") || "–",
    biggestTradeoff: sec("tradeoff|risk") || "–",
    weakestAssumption: sec("assumption")?.slice(0, 150) || "–",
    evidenceStrength: scorecard?.evidenceStrength?.level || scorecard?.evidenceStrength?.band || "–",
    confidence: scorecard?.confidence?.label || scorecard?.confidence?.band || "–",
    nextStep: sec("next step|next action|recommendation")?.slice(0, 150) || "–",
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  };
}
function decisionCardToMarkdown(card) {
  return [
    `# Decision Card: ${card.decision}`, `_${card.date}_`, "",
    `**Decision:** ${card.decision}`,
    `**Options compared:** ${card.optionsCompared}`,
    `**Biggest tradeoff:** ${card.biggestTradeoff}`,
    `**Weakest assumption:** ${card.weakestAssumption}`,
    `**Evidence strength:** ${card.evidenceStrength}`,
    `**Confidence:** ${card.confidence}`,
    `**Recommended next step:** ${card.nextStep}`,
    "", "---", `*Built with [WorkOutput](https://workoutput.com).*`,
  ].join("\n");
}


// ===== CROSS-SESSION CONTEXT + CONTRADICTION (verbatim from v45, sessionTitle adapted) =====
function extractSessionSummary(state) {
  const ds = state.decisionState || {};
  const msgs = state.messages || [];
  const titleWords = (state.sessionCustomTitle || sessionTitleFrom(msgs) || "")
    .toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter(w => w.length > 3);
  const decisionWords = (ds.decisionType || "").toLowerCase().split(/\s+/).filter(Boolean);
  const lastUser = [...msgs].reverse().find(m => m.role === "user");
  const lastWords = (lastUser?.content || "").toLowerCase()
    .replace(/[^\w\s]/g, " ").split(/\s+/).filter(w => w.length > 4).slice(0, 12);
  const keywords = [...new Set([...titleWords, ...decisionWords, ...lastWords])].slice(0, 15);

  const parts = [];
  if (ds.decisionType) parts.push(`Decision: ${ds.decisionType}`);
  const firstUser = msgs.find(m => m.role === "user");
  if (firstUser) parts.push(firstUser.content.slice(0, 120).replace(/\n/g, " "));
  if (ds.options?.length) parts.push(`Options: ${ds.options.slice(0, 3).join(", ")}`);
  const lastDoc = [...msgs].reverse().find(m => m.role === "assistant" && m.docData);
  if (lastDoc) parts.push(`Output: ${lastDoc.docData?.title || "Document produced"}`);
  else if (state.currentMode === "Commit") parts.push("Status: Committed");
  else if (state.currentMode === "Explore") parts.push("Status: Exploring");

  return {
    summary: parts.join(" · ").slice(0, 300),
    keywords,
    decisionType: ds.decisionType || null,
    contentType: ds.contentType || null,
    selectedTemplate: ds.selectedTemplate || null,
  };
}

// ── RELATED SESSION RETRIEVAL ─────────────────────────────────────────────────
// Metadata + summary only — never loads rawHistory for first-pass match.
// Excludes: active session, private sessions, doNotLearn sessions.
// Returns scored array [{session, score, matchReason, isStale}], top 3 max.
function findRelatedSessions(currentText, currentDecisionState, sessionIndex, activeSessionId, options = {}) {
  const { maxResults = 3, minScore = 18 } = options;
  const now = Date.now();
  const MS_90 = 90 * 24 * 60 * 60 * 1000;
  const MS_180 = 180 * 24 * 60 * 60 * 1000;

  const textLower = (currentText || "").toLowerCase();
  const curType = currentDecisionState?.decisionType;
  const curTemplate = currentDecisionState?.selectedTemplate;
  const curWords = new Set(textLower.replace(/[^\w\s]/g, " ").split(/\s+/).filter(w => w.length > 3));

  const scored = [];
  for (const s of (sessionIndex || [])) {
    if (s.id === activeSessionId) continue;
    if (s.privacy?.toLowerCase() === "private") continue;
    if (s.doNotLearn) continue;

    const age = now - (s.updatedAt || 0);
    if (age > MS_180) continue;

    let score = 0;
    const reasons = [];

    if (curType && s.decisionType && curType === s.decisionType) { score += 30; reasons.push("same decision type"); }
    if (curTemplate && s.template && curTemplate === s.template) { score += 25; reasons.push("same template"); }

    const sessionWords = new Set([...(s.keywords || []),
      ...(s.title || "").toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter(w => w.length > 3)]);
    const overlap = [...curWords].filter(w => sessionWords.has(w)).length;
    if (overlap >= 3) { score += Math.min(overlap * 4, 20); reasons.push(`${overlap} matching keywords`); }
    else if (overlap >= 1) { score += overlap * 2; }

    const sumWords = new Set((s.summary || "").toLowerCase().split(/\s+/).filter(w => w.length > 4));
    const sumOverlap = [...curWords].filter(w => sumWords.has(w)).length;
    if (sumOverlap >= 2) score += Math.min(sumOverlap * 3, 12);

    // v38: Confidence-weighted status scoring. High-readiness and high-confidence
    // committed sessions score higher. Abandoned Explore sessions receive no bonus.
    if (s.status === "Committed") {
      score += 6; reasons.push("committed decision");
      // Extra weight for high-quality commits: strong readiness or high confidence
      if (s.readiness != null && s.readiness >= 70) { score += 8; reasons.push("high readiness"); }
    } else if (s.status === "Ready to Commit") {
      score += 3;
    }
    // Recency bonus unchanged
    if (age < 30 * 24 * 60 * 60 * 1000) score += 5;

    if (score >= minScore) {
      scored.push({
        session: s, score,
        matchReason: reasons.length > 0
          ? "Matched because: " + reasons.join(", ") + "."
          : "Matched by keyword overlap.",
        isStale: age > MS_90,
        ageMs: age,
      });
    }
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, maxResults);
}

// ── CONTEXT INJECTION BUILDER ─────────────────────────────────────────────────
// Request-specific — never enters the core system prompt. Hard cap 1500 tokens.
const CONTEXT_TOKEN_CAP = 1400;

function buildContextBlock(attachedSessions, contextMode) {
  if (!attachedSessions || attachedSessions.length === 0) return "";
  const modeInstruction = {
    "reference_only": "Use only as background awareness. Do not assume these prior sessions apply unless clearly relevant.",
    "reuse_structure": "Reuse prior frameworks, templates, and decision structure where applicable.",
    "compare_against": "Compare the current decision against these prior decisions where relevant.",
    "continue_from": "Treat the most recent prior session as the direct starting point. Current session instructions and facts always override prior context.",
  }[contextMode] || "Use only as background awareness. Do not assume these prior sessions apply unless clearly relevant.";

  let block = `RELATED PRIOR WORKOUTPUT SESSIONS\n${modeInstruction}\nCurrent session instructions, facts, and constraints always override prior context.\n\n`;
  for (let i = 0; i < attachedSessions.length; i++) {
    const { session: s, matchReason, isStale } = attachedSessions[i];
    const staleNote = isStale ? " [Older context — review before applying]" : "";
    let entry = `${i + 1}. ${s.title}${staleNote}\n`;
    if (s.status) entry += `Status: ${s.status}\n`;
    if (s.decisionType) entry += `Decision type: ${s.decisionType}\n`;
    entry += `Context mode: ${contextMode.replace(/_/g, " ")}\n`;
    if (s.summary) entry += `Summary: ${s.summary.slice(0, 250)}\n`;
    entry += `Source: Prior session context, not current-session fact.\n\n`;
    block += entry;
  }
  const maxChars = CONTEXT_TOKEN_CAP * 4;
  if (block.length > maxChars) block = block.slice(0, maxChars) + "\n[Context truncated to stay within length budget]\n";
  return block;
}

// ── CONTRADICTION DETECTION (Spec §8.3) ──────────────────────────────────────
// FIX v19-3: When prior context fed a Commit response, check whether the current
// decision contradicts the prior sessions instead of silently blending them.
// Single bounded Haiku call. Runs only after a context-using Commit response.
// Hard latency budget via AbortController timeout — never blocks the main flow.
const CONTRADICTION_TIMEOUT_MS = 8000;

async function detectContradictions(attachedSessions, currentDecisionDigest) {
  if (!attachedSessions || attachedSessions.length === 0) return null;
  if (!currentDecisionDigest || currentDecisionDigest.trim().length < 40) return null;

  // Build a compact prior-context digest (summaries only — no full history).
  const priorDigest = attachedSessions.map((s, i) =>
    `${i + 1}. ${s.session.title}: ${(s.session.summary || "").slice(0, 220)}`
  ).join("\n");

  const sys = `You compare a CURRENT decision against PRIOR decisions from the same user. Identify only genuine contradictions: where the current decision conflicts with, reverses, or undermines a prior decision, assumption, or commitment. Do not flag mere differences in topic, normal evolution, or unrelated decisions. Return ONLY a JSON object, no prose, no fences:
{"hasContradiction": boolean,
 "conflicts": [{"priorSession": "title", "tension": "one sentence, max 25 words", "severity": "low" | "moderate" | "high"}]}
If there is no real contradiction, return {"hasContradiction": false, "conflicts": []}. Be conservative — only flag clear, material tensions.`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONTRADICTION_TIMEOUT_MS);
  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODELS.FAST, max_tokens: 350,
        system: [{ type: "text", text: sys, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: `PRIOR DECISIONS:\n${priorDigest}\n\nCURRENT DECISION:\n${currentDecisionDigest.slice(0, 1500)}` }]
      })
    });
    clearTimeout(timer);
    if (!res.ok) return null; // rate limit / overload / error — fail silent
    const data = await res.json();
    const raw = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
    const parsed = extractJsonObject(raw);
    if (!parsed) return null;
    if (!parsed.hasContradiction || !Array.isArray(parsed.conflicts) || parsed.conflicts.length === 0) return null;
    // Sanitize and cap.
    const conflicts = parsed.conflicts.slice(0, 4).map(c => ({
      priorSession: String(c.priorSession || "Prior session").slice(0, 80),
      tension: String(c.tension || "").slice(0, 160),
      severity: ["low", "moderate", "high"].includes(c.severity) ? c.severity : "moderate",
    })).filter(c => c.tension);
    return conflicts.length > 0 ? { conflicts, ts: Date.now() } : null;
  } catch {
    clearTimeout(timer);
    return null; // timeout or parse failure — never surface, never block
  }
}


// ── LOOP A METRICS (best-effort, sandbox) ────────────────────────────────────
// K-factor instrumentation for the share-to-collaborator loop. Each event is its
// own shared key so concurrent writes never collide. A single shared counter key
// would lose increments under last-write-wins; one key per event does not.
//
// v69: events are now tagged by loop — "doc" (full decision shared) vs "fw"
// (framework/structure-only shared) — under keys wo:metric:<event>:<loop>:<uniq>.
// Before v69 the framework loop, which the product bets on, recorded a share but
// never a create, so its conversions were invisible and the combined K-factor was
// understated. Creates for both loops now fire at the same lifecycle point (first
// real send of a seeded session), so the two K-factors are directly comparable.
//
// These remain coarse, in-sandbox, lifetime-cumulative signals: counts only rise,
// there is no windowing or per-user scope, and storage.list is rate limited.
// Before this carries real traffic it should move to a real analytics sink. The
// AdvancedView labels the figure as a lifetime sandbox estimate for that reason.
const METRIC_EVENTS = ["share", "open", "create", "cap_block", "insight_locked_view",
  // v97.1: share artifact funnel events
  // v97.10: share_card_downloaded is intentionally NOT included. Image download of the
  // new share cards is deferred: the existing card image exporter is hardwired to the
  // calibration card's fields and could surface private values if reused as-is, and a
  // set of privacy-safe per-card renderers is out of scope for this pass. No user path
  // currently triggers a download, so the event is omitted to avoid dead instrumentation.
  "share_card_viewed", "share_card_type_changed", "share_card_copied",
  "share_card_opened", "share_card_cta_clicked", "shared_path_started"];
// doc/fw are the K-factor share loops. free/guest tag the v74 beta conversion
// funnel (cap_block, insight_locked_view). read() counts these into a separate,
// equally-weighted funnel block; they never enter the share/open/create K-factor.
// v97.1: the four card-type values tag share_card_* events with the artifact type.
// They are recorded as loop metadata so the funnel can segment by card type. They are
// NOT K-factor loops — read() must keep them out of the share/open/create figure.
// v99.7 (M5): "card" added as its own K-factor loop — card opens/creates were tagged
// "fw" while card shares were untagged, inflating the framework K-factor numerator
// with no matching denominator. v99.7 (M6): "starter" and "pro" added so paid-tier
// cap_block events pass validation instead of being silently dropped.
const METRIC_LOOPS = ["doc", "fw", "card", "free", "starter", "pro",
  "before_after", "assumption_map", "decision_style", "template_path"];

// v70.1: metrics now go through a pluggable sink instead of touching storage keys
// directly. recordMetric/readLoopMetrics keep their names, signatures, and behavior;
// the only change is that the implementation lives behind ACTIVE_SINK. Moving to a
// real analytics backend later is a single assignment (ACTIVE_SINK = httpSink(...))
// with no edits to any call site. A sink implements two methods:
//   record(event, loop) -> writes one event           (event/loop already validated)
//   read() -> the loop-metrics object, or null on error
const sharedStorageSink = {
  // Default sandbox sink. One shared key per event so concurrent writes never collide
  // under last-write-wins. Lifetime-cumulative, cross-user, rate-limited: a coarse
  // signal, not a product metric. This is the thing the http sink is meant to replace.
  async record(event, loop) {
    const key = "wo:metric:" + event + ":" + loop + ":" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    await store.set(key, String(Date.now()), true); // shared=true
  },
  async read() {
    const countPrefix = async (prefix) => {
      const r = await store.list(prefix, true);
      return ((r && r.keys) || []).length;
    };
    // For each event, count the loop-tagged keys (v69+) and the event total. Legacy
    // v68 keys were "wo:metric:<event>:<ts>" with no loop segment, so they fall under
    // the event prefix but match neither loop prefix. We surface them as a "legacy"
    // bucket and fold them into the COMBINED totals only — v68 mixed decision and
    // framework shares under the same untagged key, so attributing them to either loop
    // would corrupt that loop's K-factor. Per-loop figures therefore start clean at
    // v69; combined counts stay continuous across the upgrade. Read-side only: no
    // re-keying, so this is idempotent and never touches rate-limited shared storage
    // with writes on load.
    const per = async (event) => {
      // v99.7 (M5): card loop counted alongside doc/fw. legacy must subtract it too,
      // or every card event would be misattributed to the legacy bucket.
      const [total, doc, fw, card] = await Promise.all([
        countPrefix("wo:metric:" + event + ":"),
        countPrefix("wo:metric:" + event + ":doc:"),
        countPrefix("wo:metric:" + event + ":fw:"),
        countPrefix("wo:metric:" + event + ":card:"),
      ]);
      const legacy = Math.max(0, total - doc - fw - card);
      return { total, doc, fw, card, legacy };
    };
    const [share, open, create] = await Promise.all([per("share"), per("open"), per("create")]);
    // v74: the two beta conversion triggers, counted by event prefix across both the
    // free and guest segments. Weighted equally (1:1) into upgradePressure so neither
    // the decision cap nor the insight lock is treated as the primary trigger.
    const [capBlock, insightLock] = await Promise.all([
      countPrefix("wo:metric:cap_block:"),
      countPrefix("wo:metric:insight_locked_view:"),
    ]);
    // v97.1: share artifact funnel. Load all wo:metric:share_card* keys once,
    // then count locally — replaces 24 sequential store.list full-key-scan calls
    // with a single list call per event (6 total, parallelised).
    const cardEvents = ["share_card_viewed","share_card_type_changed","share_card_copied",
      "share_card_opened","share_card_cta_clicked","shared_path_started"];
    const cardTypes = ["before_after","assumption_map","decision_style","template_path"];
    const cardFunnel = {};
    await Promise.all(cardEvents.map(async (ev) => {
      try {
        const prefix = "wo:metric:" + ev + ":";
        const r = await store.list(prefix, true);
        const keys = (r && r.keys) || [];
        const total = keys.length;
        const byType = {};
        cardTypes.forEach(t => {
          const tPrefix = prefix + t + ":";
          byType[t] = keys.filter(k => k.startsWith(tPrefix)).length;
        });
        cardFunnel[ev] = { total, byType };
      } catch(_) {
        cardFunnel[ev] = { total: 0, byType: Object.fromEntries(cardTypes.map(t => [t, 0])) };
      }
    }));
    const k = (made, created) => created > 0 ? +(made / created).toFixed(2) : 0;
    return {
      // combined (includes legacy) — continuous across the v68->v69 key-scheme change
      shareCreated: share.total, shareOpened: open.total, createFromShare: create.total,
      kFactor: k(create.total, share.total),
      // per-loop (v69+ only, clean)
      doc:       { created: share.doc, opened: open.doc, made: create.doc, kFactor: k(create.doc, share.doc) },
      framework: { created: share.fw,  opened: open.fw,  made: create.fw,  kFactor: k(create.fw,  share.fw) },
      // v99.7 (M5): card-share loop, measured symmetrically (share/open/create).
      card:      { created: share.card, opened: open.card, made: create.card, kFactor: k(create.card, share.card) },
      // unattributed legacy carried for transparency
      legacy:    { created: share.legacy, opened: open.legacy, made: create.legacy },
      // v74: equally weighted upgrade-pressure funnel, separate from the K-factor
      funnel:    { capBlock, insightLock, upgradePressure: capBlock + insightLock },
      // v97.1: share artifact funnel, segmented by card type. Separate from K-factor.
      cardFunnel,
    };
  },
};

// Template for a real analytics backend. Not wired in. To activate: set
//   ACTIVE_SINK = httpSink("https://your-endpoint/...")
// and have the endpoint return the same shape sharedStorageSink.read() returns
// (shareCreated/shareOpened/createFromShare/kFactor + doc/framework/legacy). The
// fetch is fire-and-forget on record and tolerant on read, so a sink outage never
// blocks a turn. Provider, auth, windowing, and per-user scope are decisions for
// when this is chosen; the seam is provider-agnostic.
//
// v77 WINDOWING SPEC (the site funnel is not a real funnel until this lands).
// The sandbox sink counts lifetime events in a store shared across all users. A
// K-factor over that store has no cohort, no time window, and no unique-actor
// denominator, so it cannot answer a growth question. It is instrumentation, not
// measurement. The honest fix lives server-side and the read() contract carries it:
//   1. Per-actor identity on every event. record(event, loop) must also stamp an
//      actorId (anonymous device id pre-auth, user id post-auth) so opens and creates
//      dedupe to people, not page hits. Without this the K-factor is inflated by
//      refreshes and multi-tab.
//   2. Time-windowed reads. read({ window }) returns counts for a named window
//      (trailing-7d, trailing-30d, or a cohort week), not lifetime. K-factor is then
//      created-in-window / shares-that-originated-in-window, tied to one cohort.
//   3. Cohort attribution. A create counts toward the share that produced it, by
//      window of the share, so the coefficient reads "new decisions per share for this
//      cohort" rather than a running cumulative ratio.
//   4. The doc/framework/legacy split and the cap_block/insight_locked_view funnel
//      keep their current shape; they gain the same actorId and window fields.
// Until 1-3 ship, SiteView already labels its numbers a lifetime sandbox estimate and
// should stay internal-only. Do not put the current K-factor in front of a buyer.
function httpSink(endpoint, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  return {
    async record(event, loop) {
      await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ event, loop, ts: Date.now() }) });
    },
    async read() {
      const r = await fetch(endpoint, { method: "GET", headers });
      return r.ok ? await r.json() : null;
    },
  };
}

// Active sink. Swap via setSink() — never assign ACTIVE_SINK directly at call sites.
// All metrics calls go through recordMetric/readLoopMetrics, not ACTIVE_SINK directly,
// so this single binding migration-controls every call at once.
let ACTIVE_SINK = sharedStorageSink;
function setSink(sink) { ACTIVE_SINK = sink; }

// Stable public API — unchanged for every call site. Validation and error
// containment live here so individual sinks stay minimal and never throw into a turn.
async function recordMetric(event, loop) {
  if (!METRIC_EVENTS.includes(event) || !METRIC_LOOPS.includes(loop)) return;
  try { await ACTIVE_SINK.record(event, loop); } catch {}
}
async function readLoopMetrics() {
  try { return await ACTIVE_SINK.read(); } catch { return null; }
}

// ── SITE ANALYTICS SOURCE SEAM ───────────────────────────────────────────────
// Operator-only tier rollups (users / subscriptions / token usage by tier).
// Same one-binding swap discipline as ACTIVE_SINK: a local stub on the artifact
// host, the Supabase RPC in production. readSiteAnalytics() is the only call site
// and never throws into a turn. Access is enforced server-side by the RPC's
// can_view_site() check; this client read is an affordance only.

// Artifact-host stub. No backend exists here, so there is nothing to read.
// SiteView renders null as a "server analytics not available on this host" state.
const localSiteAnalytics = { async read() { return null; } };

// Production source. Maps to the Supabase RPC admin_site_analytics() over
// PostgREST. getToken() returns the current user's session JWT; the RPC enforces
// can_view_site() server-side. supabaseUrl is the project rest base, e.g.
// "https://<ref>.supabase.co". anonKey is the public anon key.
function rpcSiteAnalytics({ supabaseUrl, anonKey, getToken }) {
  return {
    async read() {
      const token = (getToken && (await getToken())) || "";
      const res = await fetch(supabaseUrl + "/rest/v1/rpc/admin_site_analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anonKey,
          Authorization: "Bearer " + token,
        },
        body: "{}",
      });
      return res.ok ? await res.json() : null; // 401/403 for non-operators -> null
    },
  };
}

// Swap this one binding to go live. Mirrors setSink(). Default stays local so the
// artifact host renders the connect-the-source empty state instead of calling a
// backend that is not present.
let ACTIVE_SITE_SOURCE = localSiteAnalytics;
function setSiteSource(src) { ACTIVE_SITE_SOURCE = src; }

// Boot wiring. This file is the artifact-host build: it has no mount block and no
// supabase config, and setSink() is likewise never invoked here. Off-host, call
// bootSiteAnalytics({ supabaseUrl, anonKey, getToken }) once at app boot (next to
// where setSink/setStore are wired) to point the seam at the RPC. It is a no-op
// without config, so it is safe to call unconditionally from a shared boot path.
function bootSiteAnalytics(cfg) {
  if (cfg && cfg.supabaseUrl && cfg.anonKey) {
    setSiteSource(rpcSiteAnalytics(cfg));
  }
}
// Production (off-host) boot, once config exists:
//   bootSiteAnalytics({ supabaseUrl: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY, getToken });

// v113.1: the only consumer (Site effect) called readSiteAnalytics(), but the seam
// refactor exposed the source as ACTIVE_SITE_SOURCE.read() and never created this
// wrapper. The call threw a ReferenceError, swallowed by the effect's catch and masked
// by the local stub returning null. This restores the wrapper (mirrors readLoopMetrics
// over ACTIVE_SINK) so the one-binding production swap via bootSiteAnalytics takes effect.
async function readSiteAnalytics() {
  try { return await ACTIVE_SITE_SOURCE.read(); }
  catch { return null; }
}

// Small formatters for the operator numbers (kept local to the analytics view).
const _fmtInt = (n) => (Number(n) || 0).toLocaleString("en-US");
const _fmtTokens = (n) => {
  const v = Number(n) || 0;
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "k";
  return String(v);
};

// ── ACCESS ROLE SEAM ─────────────────────────────────────────────────────────
// Two metric scopes with different access: USER (everyone, own data) and SITE
// (admins now; read-only marketing/viewer roles later). This binding decides which
// scope the client offers. It is NOT security: hiding the Site button does not
// protect site data. Real enforcement is server-side post-auth — RLS plus a
// `user_roles` table (decided over JWT claims, so roles revoke without token reissue),
// with a read-only marketing role that can SELECT the site rollup but not raw events
// or anything writable. Off-host, resolveAccessRole()
// should return the authenticated user's role. On the artifact host there is no
// auth, so it defaults to "admin" for development and accepts an ?as= override for
// previewing the marketing/viewer/user experience.
const ACCESS_ROLES = ["admin", "marketing", "viewer", "user"];
function resolveAccessRole() {
  try { const a = new URLSearchParams(window.location.search).get("as"); if (a && ACCESS_ROLES.includes(a)) return a; } catch {}
  return "admin"; // dev default on the artifact host; replace with the auth role off-host
}
const canViewSite = (r) => r === "admin" || r === "marketing" || r === "viewer";
const canEditSite = (r) => r === "admin"; // marketing/viewer are read-only

// USER-scope summary. Derived entirely from local per-user data (the session index
// meta plus the decision profile), so it works today with no backend. Off-host this
// becomes a per-user rollup row or a SQL view over the user's own sessions, RLS-scoped.
// v73: small stat helpers (no deps).
const _mean = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
const _median = a => { if (!a.length) return 0; const b = [...a].sort((x, y) => x - y); const m = Math.floor(b.length / 2); return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
const _heldRate = arr => { if (!arr.length) return null; const h = arr.filter(r => r === "held").length; const p = arr.filter(r => r === "partial").length; return Math.round((h + 0.5 * p) / arr.length * 100); };
// v77: interval on the held-rate. Wilson score interval at 95%, computed on the
// weighted success count (held = 1, partial = 0.5). Wilson tolerates fractional
// successes and widens correctly at small n, so a 3-outcome hold rate no longer
// reads as settled as a 30-outcome one. The point estimate is unchanged; this only
// exposes the uncertainty already present in the data. Approximation note: the band
// is exact for binary held/broke and approximate when partials are present, because
// the half-weight is a modeling choice, not a measured probability. Returns
// { rate, lo, hi, n } as integer percentages, or null below the same 2-outcome floor
// the rest of the engine uses. Does not fabricate an interval it cannot support.
const _heldCI = arr => {
  const n = arr.length;
  if (n < 2) return null;
  const x = arr.filter(r => r === "held").length + 0.5 * arr.filter(r => r === "partial").length;
  const p = x / n, z = 1.96, z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const half = (z / denom) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
  const clamp01 = v => Math.max(0, Math.min(1, v));
  return { rate: Math.round(p * 100), lo: Math.round(clamp01(center - half) * 100), hi: Math.round(clamp01(center + half) * 100), n };
};
const metaCommitted = s => !!(s && (s.hasDoc || s.status === "Committed"));
const metaResult = s => (s && s.outcome && s.outcome.status === "recorded") ? s.outcome.result : null;
const metaAggregateEligible = s => metaCommitted(s) && s.scope === "work" && (s.scopeConfidence === "high" || s.scopeConfirmed === true);

// v73: the ledger metrics engine. Pure. Computes every metric the stored data can
// honestly support from a list of session metas, with a minimum-N gate on each derived
// figure so nothing is fabricated from one or two data points. Used by both the personal
// panel (all sessions) and the Enterprise group panel (aggregate-eligible work only).
// v98.9: accepts horizonDays so tto back-calculation for legacy sessions (those
// without a committedAt field) uses the user's actual preference rather than the
// hardcoded DEFAULT_REVIEW_HORIZON_DAYS. Falls back to the default when unset.
// Also renames `recorded` (sessions) and `results` (strings) to make the type
// boundary explicit (B5).
function buildLedgerMetrics(decisions, horizonDays) {
  const _horizon = (horizonDays && horizonDays >= 1) ? horizonDays : DEFAULT_REVIEW_HORIZON_DAYS;
  const list = decisions || [];
  const now = Date.now();
  const committedList = list.filter(metaCommitted);
  const committed = committedList.length;
  const recordedSessions = committedList.filter(metaResult); // sessions with a recorded outcome
  const results = recordedSessions.map(metaResult);          // result strings: held|partial|broke
  const held = results.filter(r => r === "held").length;
  const partial = results.filter(r => r === "partial").length;
  const broke = results.filter(r => r === "broke").length;
  const heldRate = recordedSessions.length >= 2 ? _heldRate(results) : null;
  const heldRateCI = recordedSessions.length >= 2 ? _heldCI(results) : null; // v77: uncertainty band on the headline rate
  const pending = committed - recordedSessions.length;
  const dueNow = committedList.filter(s => !metaResult(s) && s.reviewDueAt && s.reviewDueAt <= now).length;
  const followThroughRate = committed >= 3 ? Math.round(recordedSessions.length / committed * 100) : null;

  const tto = recordedSessions.map(s => {
    // v98.9: use _horizon (user preference) instead of hardcoded DEFAULT_REVIEW_HORIZON_DAYS.
    const c = s.committedAt || (s.reviewDueAt ? s.reviewDueAt - _horizon * 864e5 : null);
    const r = s.outcome && s.outcome.recordedAt;
    return (c && r && r >= c) ? (r - c) / 864e5 : null;
  }).filter(x => x != null);
  const timeToOutcomeMedian = tto.length >= 2 ? Math.round(_median(tto)) : null;

  const conf = s => s.commitSignals && s.commitSignals.confidenceBand;
  const rev = s => s.commitSignals && s.commitSignals.reversibility;
  const bands = ["High", "Moderate", "Limited"];
  const calibration = bands.map(b => {
    const inb = recordedSessions.filter(s => conf(s) === b).map(metaResult);
    return { band: b, n: inb.length, heldRate: inb.length >= 2 ? _heldRate(inb) : null, ci: inb.length >= 2 ? _heldCI(inb) : null };
  }).filter(x => x.n > 0);
  const calibrationReady = recordedSessions.filter(s => conf(s)).length >= 3;

  const typeMap = {};
  recordedSessions.forEach(s => { const t = s.decisionType || "Unspecified"; (typeMap[t] = typeMap[t] || []).push(metaResult(s)); });
  const byType = Object.entries(typeMap).map(([type, arr]) => ({ type, n: arr.length, heldRate: arr.length >= 2 ? _heldRate(arr) : null }))
    .filter(x => x.heldRate != null).sort((a, b) => a.heldRate - b.heldRate);

  const irr = recordedSessions.filter(s => rev(s) === "Irreversible").map(metaResult);
  const irrHeldRate = irr.length >= 2 ? _heldRate(irr) : null;
  const revCounts = { Reversible: committedList.filter(s => rev(s) === "Reversible").length, Irreversible: committedList.filter(s => rev(s) === "Irreversible").length };

  const readyVals = committedList.map(s => typeof s.readiness === "number" ? s.readiness : null).filter(x => x != null);
  const readinessAvg = readyVals.length >= 2 ? Math.round(_mean(readyVals)) : null;
  const readinessSeries = committedList.filter(s => typeof s.readiness === "number").sort((a, b) => (a.updatedAt || 0) - (b.updatedAt || 0)).map((s, i) => ({ x: i + 1, v: Math.round(s.readiness) }));

  const mixes = committedList.map(s => s.commitSignals && s.commitSignals.assumptionMix).filter(Boolean);
  const assumptionMix = mixes.length >= 2 ? ["structural", "behavioral", "operational", "external"].reduce((o, k) => { o[k] = Math.round(_mean(mixes.map(m => m[k] || 0)) * 100); return o; }, {}) : null;

  const breakCats = { structural: 0, behavioral: 0, operational: 0, external: 0 }; let breakTagged = 0;
  recordedSessions.forEach(s => { const r = metaResult(s); if (r === "broke" || r === "partial") { const c = s.loadBearingAssumption && s.loadBearingAssumption.category; if (c && breakCats[c] != null) { breakCats[c]++; breakTagged++; } } });
  const breakByCategory = breakTagged >= 2 ? breakCats : null;

  const rigorVals = committedList.map(s => s.commitSignals && s.commitSignals.rigor).filter(x => typeof x === "number");
  const rigorAvg = rigorVals.length >= 2 ? Math.round(_mean(rigorVals)) : null;
  const confCounts = bands.reduce((o, b) => { o[b] = committedList.filter(s => conf(s) === b).length; return o; }, {});
  const evidenceVals = committedList.map(s => s.commitSignals && s.commitSignals.evidenceRequirement).filter(Boolean);

  const scopeCounts = { work: committedList.filter(s => s.scope === "work").length, personal: committedList.filter(s => s.scope && s.scope !== "work").length };
  const typeMix = {}; committedList.forEach(s => { const t = s.decisionType || "Unspecified"; typeMix[t] = (typeMix[t] || 0) + 1; });
  const modeMix = { Clarify: 0, Explore: 0, Commit: 0 }; list.forEach(s => { const mm = (s.mode==="Chat"?"Clarify":s.mode) || "Clarify"; if (modeMix[mm] != null) modeMix[mm]++; });

  // weekly activity over the trailing window (committed decisions per ISO week)
  let activitySeries = [];
  if (committedList.length) {
    const stamps = committedList.map(s => s.updatedAt || 0).filter(Boolean).sort((a, b) => a - b);
    if (stamps.length) {
      const wk = t => Math.floor((t - stamps[0]) / (7 * 864e5));
      const lastWk = wk(stamps[stamps.length - 1]);
      const counts = {}; stamps.forEach(t => { const w = wk(t); counts[w] = (counts[w] || 0) + 1; });
      const startWk = Math.max(0, lastWk - 11);
      for (let w = startWk; w <= lastWk; w++) activitySeries.push({ x: w - startWk + 1, v: counts[w] || 0 });
    }
  }

  return {
    total: list.length, committed, recorded: recordedSessions.length, held, partial, broke, heldRate, heldRateCI,
    pending, dueNow, followThroughRate, timeToOutcomeMedian,
    calibration, calibrationReady, byType, irrHeldRate, revCounts,
    readinessAvg, readinessSeries, assumptionMix, breakByCategory, rigorAvg,
    confCounts, evidenceCount: evidenceVals.length, scopeCounts, typeMix, modeMix, activitySeries,
  };
}

// buildStreakDays: compute the current consecutive-day streak from sessionIndex.
// A day counts if any session has an updatedAt timestamp on that calendar date.
// Walks back from today, stops at the first gap. Returns { days, dots } where
// dots is an array of booleans for the last 7 days (true = active, oldest first).
function buildStreakDays(sessions) {
  const list = sessions || [];
  const day = 864e5;
  const now = Date.now();
  const todayStr = new Date(now).toDateString();
  // Collect unique calendar day strings from session timestamps
  const activeDays = new Set();
  list.forEach(s => {
    if (s && s.updatedAt) {
      try { activeDays.add(new Date(s.updatedAt).toDateString()); } catch(_) {}
    }
  });
  // Single-pass streak: start from today if active, else from yesterday.
  // Today without a session does not break the streak — the user may not have
  // worked yet today. A gap at any prior day stops the count.
  const startOffset = activeDays.has(todayStr) ? 0 : 1;
  let streak = 0;
  for (let i = startOffset; i < 365; i++) {
    if (activeDays.has(new Date(now - i * day).toDateString())) { streak++; } else { break; }
  }
  // Build last-7-days dot array (index 0 = 6 days ago, index 6 = today)
  const dots = [];
  for (let i = 6; i >= 0; i--) {
    dots.push(activeDays.has(new Date(now - i * day).toDateString()));
  }
  return { days: streak, dots };
}

function buildUserMetrics(sessions, profile, horizonDays) {
  const list = sessions || [];
  const byMode = { Clarify: 0, Explore: 0, Commit: 0 };
  let committed = 0;
  list.forEach(s => {
    const m = (s.mode==="Chat"?"Clarify":s.mode) || "Clarify"; if (byMode[m] != null) byMode[m]++;
    if (s.hasDoc || s.status === "Committed") committed++;
  });
  const dc = (profile && profile.decisionCount) || 0;
  const last = list.find(s => s.updatedAt);
  const streak = buildStreakDays(list);
  return {
    decisionsTracked: list.length,
    committed,
    modeBreakdown: byMode,
    profileMaturity: dc >= 2 ? "Active, calibrating your outputs" : dc === 1 ? "Learning, one more decision to apply" : "Not yet built",
    evidencePreference: (deriveProfileReads(profile) || {}).evidenceMode || "Not yet calibrated",
    decisionsLearned: dc,
    lastActive: last ? new Date(last.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "–",
    ledger: buildLedgerMetrics(list, horizonDays),
    streak,
  };
}

// ===== SHARING: shared-storage doc links + decision card image (verbatim from v45) =====
// v60: the share payload now carries the framework behind the decision (templateId +
// decisionType) so a viewer who chooses to structure their own lands mid-flow on the
// same starting point rather than on a cold Home screen. Older payloads omit these
// fields; the create-own path treats them as optional and degrades gracefully.
async function storeSharedDoc(formatted, meta = {}) {
  const id = "doc_" + Date.now() + "_" + Math.random().toString(36).slice(2,8);
  const payload = JSON.stringify({ ...formatted, createdAt: Date.now(), version: "v10",
    templateId: meta.templateId || null, decisionType: meta.decisionType || null });
  try {
    await store.set("wo:shared:" + id, payload, true); // shared=true
    return id;
  } catch { return null; }
}

async function loadSharedDoc(id) {
  try {
    const r = await store.get("wo:shared:" + id, true);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}

// ─── SHARE LINK ENCODE / DECODE ──────────────────────────────────────────────
// Three callers (shareFramework, shareCard, framework-link reader, card-link reader)
// all need the same btoa/atob round-trip. One definition; every site uses it.
function safeBase64Encode(obj) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))); } catch { return null; }
}
function safeBase64Decode(str) {
  try { return JSON.parse(decodeURIComponent(escape(atob(str)))); } catch { return null; }
}

// FIX v20: ShareDocModal and TemplateShareModal were referenced in render but never
// defined — a latent crash on the share-doc and share-template paths. Both built here.
// Small helper: build a shareable URL with a query param, then a copy-link modal shell.
function buildShareUrl(param, value) {
  try {
    const base = window.location.origin + window.location.pathname;
    // v122: referral attribution. Every share URL carries a via marker so inbound
    // traffic from a shared card is attributable. The migrated backend can inject the
    // sharer's public handle on window.__WO_REF__ to turn attribution into a true
    // referral; absent that, the channel marker still lets analytics separate share
    // traffic from organic. REFERRAL ATTRIBUTION SEAM.
    let ref = "share";
    try { if (typeof window !== "undefined" && window.__WO_REF__) ref = String(window.__WO_REF__).slice(0, 64); } catch (_) {}
    return `${base}?${param}=${encodeURIComponent(value)}&via=${encodeURIComponent(ref)}`;
  } catch { return ""; }
}

// v122: public calibration profile. A read-only credential surface reachable at ?u=<handle>.
// PUBLIC PROFILE DATA SEAM: on the migrated backend, Supabase serves the credential for the
// handle and injects it on window.__WO_PUBLIC_PROFILE__ before render. For self-preview
// (the owner viewing their own ?u=me link) the local credential is used. Default privacy
// is private: nothing is published unless the user opts in and a handle is minted server-side.
function getPublicProfileHandle() {
  try {
    const p = new URLSearchParams(window.location.search);
    const u = p.get("u");
    return u ? String(u).slice(0, 64) : null;
  } catch { return null; }
}
function buildPublicProfileUrl(handle) {
  try {
    const base = window.location.origin + window.location.pathname;
    return `${base}?u=${encodeURIComponent(handle)}`;
  } catch { return ""; }
}


function cardToSvg(card) {
  const W = 700, H = 460;
  const bg = "#0a0907", surface = "#0f0d0a", border = "#2e2a1e";
  const gold = "#c8a85a", goldDim = "#7a6030", text = "#c8bfa8";
  const textSub = "#a89878", textDim = "#554e3a", textGhost = "#2e2a1e";

  const fields = [
    { label: "DECISION",            val: card.decision },
    { label: "OPTIONS COMPARED",    val: card.optionsCompared },
    { label: "BIGGEST TRADEOFF",    val: card.biggestTradeoff },
    { label: "WEAKEST ASSUMPTION",  val: card.weakestAssumption },
    { label: "EVIDENCE STRENGTH",   val: card.evidenceStrength },
    { label: "CONFIDENCE",          val: card.confidence },
    { label: "NEXT STEP",           val: card.nextStep },
  ];

  // Truncate long values so they fit single-line, then XML-escape. Card fields are
  // doc-derived text; a raw "&" or "<" produced invalid SVG, the image load failed,
  // and PNG export errored out. (v99.6, M2 fix)
  const trunc = (s, n) => escapeHtml(s && s.length > n ? s.slice(0, n - 1) + "…" : (s || "–"));

  const rowH = 44;
  const startY = 88;
  const labelX = 32, valX = 220, rowW = W - 48;

  const rows = fields.map((f, i) => {
    const y = startY + i * rowH;
    const isLast = i === fields.length - 1;
    const isFirst = i === 0;
    return `
      <rect x="24" y="${y}" width="${rowW}" height="${rowH}" fill="${isFirst ? surface : "none"}"/>
      ${!isLast ? `<line x1="24" y1="${y + rowH}" x2="${W - 24}" y2="${y + rowH}" stroke="${border}" stroke-width="0.5"/>` : ""}
      <text x="${labelX}" y="${y + 27}" font-family="monospace" font-size="9" fill="${goldDim}" letter-spacing="1.2">${f.label}</text>
      <text x="${valX}" y="${y + 27}" font-family="Georgia, serif" font-size="13" fill="${isFirst ? text : textSub}">${trunc(f.val, 52)}</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect x="24" y="20" width="${rowW}" height="52" fill="${surface}" rx="2"/>
  <text x="${labelX}" y="40" font-family="monospace" font-size="9" fill="${goldDim}" letter-spacing="1.5">DECISION CARD</text>
  <text x="${labelX}" y="58" font-family="Georgia, serif" font-size="15" font-weight="bold" fill="${text}">${trunc(card.decision, 60)}</text>
  <text x="${W - 24}" y="58" font-family="monospace" font-size="8" fill="${goldDim}" text-anchor="end">${card.date}</text>
  ${rows.join("")}
  <line x1="24" y1="${H - 32}" x2="${W - 24}" y2="${H - 32}" stroke="${border}" stroke-width="0.5"/>
  <text x="${labelX}" y="${H - 14}" font-family="monospace" font-size="8" fill="${textGhost}" letter-spacing="0.8">Use this playbook in WorkOutput</text>
</svg>`;
}

// v33: shared PNG-blob builder. Renders the card SVG to a 2x canvas and resolves
// a PNG Blob. Used by both exportCardAsPng (download) and the copy-image path.
// Centralizing this lets the copy path pre-generate the blob on modal open, so
// the actual clipboard write can run synchronously inside the user gesture —
// which iOS Safari requires (an async decode between click and write breaks it).
function cardToPngBlob(card) {
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (fn, arg) => { if (done) return; done = true; fn(arg); };
    const timer = setTimeout(() => finish(reject, new Error("card render timeout")), 5000);
    try {
      const svg = cardToSvg(card);
      const W = 700, H = 460;
      const canvas = document.createElement("canvas");
      canvas.width = W * 2; canvas.height = H * 2; // 2x for retina
      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2);
      const img = new Image();
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, W, H);
          URL.revokeObjectURL(url);
          canvas.toBlob(b => { clearTimeout(timer); b ? finish(resolve, b) : finish(reject, new Error("toBlob returned null")); }, "image/png");
        } catch (e) { clearTimeout(timer); finish(reject, e); }
      };
      img.onerror = (e) => { clearTimeout(timer); URL.revokeObjectURL(url); finish(reject, e); };
      img.src = url;
    } catch (e) { clearTimeout(timer); finish(reject, e); }
  });
}

function exportCardAsPng(card) {
  return cardToPngBlob(card).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (card.decision || "decision").replace(/[^a-z0-9]/gi, "_").slice(0, 40) + "_card.png";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

// ── v114.2: SHAREABLE SOCIAL CARDS (PNG + native share) ──────────────────────
// One portrait poster (1080x1350, Instagram-friendly) renders any shareable card from
// { kicker, title, lines, footnote }, rasterized through the same SVG->canvas pipeline
// as the decision card. shareOrDownloadPng prefers the native share sheet (navigator.
// share with the PNG file, so mobile can post straight to Instagram, Stories, Messages)
// and falls back to a file download where file-share is unsupported (most desktops).
function _esc(s){ return escapeHtml(String(s == null ? "" : s)); }
function wrapSvgText(text, maxChars){
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = []; let cur = "";
  for (const w of words){
    if (!cur) cur = w;
    else if ((cur + " " + w).length <= maxChars) cur += " " + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}
// Open Sans for the export wordmark. The share poster is rasterized as an isolated
// SVG-in-<img>, which cannot see document or linked web fonts, so the font has to be
// embedded in the SVG itself. We fetch Open Sans once at runtime, base64-encode it,
// and cache the @font-face. If the fetch fails (offline), the wordmark falls back to
// the system sans-serif named alongside 'Open Sans'.
let _openSansFontCss = "";
let _openSansPromise = null;
function ensureOpenSansEmbedded(){
  if (_openSansFontCss) return Promise.resolve(_openSansFontCss);
  if (_openSansPromise) return _openSansPromise;
  _openSansPromise = (async () => {
    try {
      const css = await (await fetch("https://fonts.googleapis.com/css2?family=Open+Sans:wght@600&display=swap")).text();
      const m = css.match(/url\((https:[^)]+\.woff2)\)/);
      if (!m) return "";
      const buf = await (await fetch(m[1])).arrayBuffer();
      const bytes = new Uint8Array(buf); let bin = "";
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      _openSansFontCss = "@font-face{font-family:'Open Sans';font-weight:600;font-style:normal;src:url(data:font/woff2;base64," + btoa(bin) + ") format('woff2');}";
    } catch (e) { _openSansFontCss = ""; }
    return _openSansFontCss;
  })();
  return _openSansPromise;
}

function socialPosterSvg({ kicker, title, lines, footnote, viz }){
  const W = 1080, H = 1350;
  const bg = "#0a0907", border = "#2e2a1e", gold = "#c8a85a", goldDim = "#7a6030",
        text = "#c8bfa8", textSub = "#a89878", surf = "#0f0d0a";
  const COL = { gold, pos:"#6fc089", cau:"#d6a95c", crit:"#d58c7f", slate:"#88a6be", sub:textSub };
  const pad = 84, cw = W - 2*pad;
  const clamp01 = v => Math.max(0, Math.min(1, Number(v) || 0));
  const parts = [];
  let y = 158;
  if (kicker){ parts.push(`<text x="${pad}" y="${y}" font-family="monospace" font-size="26" letter-spacing="3" fill="${goldDim}">${_esc(String(kicker).toUpperCase())}</text>`); y += 74; }
  wrapSvgText(title, 24).slice(0, 3).forEach(tl => { parts.push(`<text x="${pad}" y="${y}" font-family="Georgia, serif" font-weight="bold" font-size="62" fill="${text}">${_esc(tl)}</text>`); y += 78; });
  y += 18;
  (lines || []).filter(Boolean).forEach(ln => { wrapSvgText(ln, 42).forEach(wl => { parts.push(`<text x="${pad}" y="${y}" font-family="Georgia, serif" font-size="38" fill="${textSub}">${_esc(wl)}</text>`); y += 54; }); y += 18; });

  const ringEl = (cx, cy, r, frac, color, w) => { frac = clamp01(frac); const C = 2*Math.PI*r;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${border}" stroke-width="${w}"/>`
      + (frac > 0 ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-frac)).toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>` : ""); };
  const barEl = (x, yy, w, h, frac, color) => { frac = clamp01(frac); const fw = w*frac;
    return `<rect x="${x}" y="${yy}" width="${w}" height="${h}" rx="${h/2}" fill="${border}"/>`
      + (fw > h ? `<rect x="${x}" y="${yy}" width="${fw.toFixed(1)}" height="${h}" rx="${h/2}" fill="${color}"/>` : (fw > 0 ? `<circle cx="${(x+h/2).toFixed(1)}" cy="${(yy+h/2).toFixed(1)}" r="${h/2}" fill="${color}"/>` : "")); };

  let _clip = 0;
  const block = (b, yy) => {
    if (b.kind === "radar"){
      const axes = (b.axes || []); const n = axes.length || 1; const r = 180; const cx = W/2, cy = yy + r + 26;
      const pt = (i, rad) => [cx + rad*Math.sin(2*Math.PI*i/n), cy - rad*Math.cos(2*Math.PI*i/n)];
      [0.34,0.67,1].forEach(g => { const p = axes.map((_,i)=>pt(i,r*g).map(v=>v.toFixed(1)).join(",")).join(" "); parts.push(`<polygon points="${p}" fill="none" stroke="${border}" stroke-width="2"/>`); });
      for (let i=0;i<n;i++){ const e = pt(i,r); parts.push(`<line x1="${cx}" y1="${cy}" x2="${e[0].toFixed(1)}" y2="${e[1].toFixed(1)}" stroke="${border}" stroke-width="1"/>`); }
      const poly = axes.map((a,i)=>pt(i, r*clamp01(a.value)).map(v=>v.toFixed(1)).join(",")).join(" ");
      parts.push(`<polygon points="${poly}" fill="${gold}" fill-opacity="0.26" stroke="${gold}" stroke-width="3"/>`);
      axes.forEach((a,i)=>{ const e = pt(i, r*clamp01(a.value)); parts.push(`<circle cx="${e[0].toFixed(1)}" cy="${e[1].toFixed(1)}" r="6" fill="${gold}"/>`); });
      axes.forEach((a,i)=>{ const e = pt(i, r+40); const s = Math.sin(2*Math.PI*i/n); const anc = s>0.3?"start":s<-0.3?"end":"middle"; parts.push(`<text x="${e[0].toFixed(1)}" y="${(e[1]+8).toFixed(1)}" font-family="monospace" font-size="22" fill="${textSub}" text-anchor="${anc}">${_esc(a.label)}</text>`); });
      return cy + r + 54;
    }
    if (b.kind === "rings"){
      const items = (b.items || []); const m = items.length || 1; const slot = cw/m;
      items.forEach((it,i)=>{ const cx = pad + slot*i + slot/2; const cy = yy + 78; const frac = it.max ? (Number(it.value)/it.max) : it.frac;
        parts.push(ringEl(cx, cy, 64, frac, COL[it.color]||gold, 15));
        parts.push(`<text x="${cx}" y="${cy+16}" font-family="Georgia, serif" font-weight="bold" font-size="44" fill="${text}" text-anchor="middle">${_esc(String(it.value))}</text>`);
        parts.push(`<text x="${cx}" y="${cy+116}" font-family="monospace" font-size="19" letter-spacing="1.5" fill="${goldDim}" text-anchor="middle">${_esc(String(it.label).toUpperCase())}</text>`); });
      return yy + 214;
    }
    if (b.kind === "bars"){
      let yc = yy;
      if (b.title){ parts.push(`<text x="${pad}" y="${yc}" font-family="monospace" font-size="22" letter-spacing="2" fill="${goldDim}">${_esc(String(b.title).toUpperCase())}</text>`); yc += 40; }
      const barX = pad + 330, barW = (W - pad) - barX - 78;
      (b.items || []).forEach(it => { parts.push(`<text x="${pad}" y="${yc+26}" font-family="Georgia, serif" font-size="28" fill="${text}">${_esc(it.label)}</text>`);
        parts.push(barEl(barX, yc+6, barW, 26, it.frac, COL[it.color]||gold));
        if (it.value != null) parts.push(`<text x="${W-pad}" y="${yc+26}" font-family="monospace" font-size="22" fill="${goldDim}" text-anchor="end">${_esc(String(it.value))}</text>`);
        yc += 58; });
      return yc + 16;
    }
    if (b.kind === "dots"){
      let yc = yy;
      if (b.title){ parts.push(`<text x="${pad}" y="${yc}" font-family="monospace" font-size="22" letter-spacing="2" fill="${goldDim}">${_esc(String(b.title).toUpperCase())}</text>`);
        if (b.note) parts.push(`<text x="${W-pad}" y="${yc}" font-family="monospace" font-size="24" fill="${COL[b.noteColor]||textSub}" text-anchor="end">${_esc(String(b.note))}</text>`); yc += 30; }
      const n = b.n||0, filled = b.filled||0, cols = b.cols||n||1, dot = b.dot||44, gap = b.gap||18;
      for (let i=0;i<n;i++){ const r2 = Math.floor(i/cols), c = i%cols; const x = pad + c*(dot+gap), yy2 = yc + r2*(dot+gap); const on = i < filled;
        parts.push(`<circle cx="${x+dot/2}" cy="${yy2+dot/2}" r="${dot/2}" fill="${on?(COL[b.color]||gold):surf}" stroke="${border}" stroke-width="1"/>`); }
      return yc + Math.ceil(n/cols)*(dot+gap) + 12;
    }
    if (b.kind === "spark"){
      let yc = yy;
      if (b.title){ parts.push(`<text x="${pad}" y="${yc}" font-family="monospace" font-size="22" letter-spacing="2" fill="${goldDim}">${_esc(String(b.title).toUpperCase())}</text>`);
        if (b.note) parts.push(`<text x="${W-pad}" y="${yc}" font-family="monospace" font-size="24" fill="${textSub}" text-anchor="end">${_esc(String(b.note))}</text>`); yc += 30; }
      const pts = (b.points || []).map(Number).filter(v => !isNaN(v));
      const n = pts.length;
      if (n >= 2){
        const h = b.h || 196, x0 = pad, w = cw, y0 = yc;
        const mn = Math.min(...pts), mx = Math.max(...pts), rng = (mx - mn) || 1, mgn = h*0.1;
        const X = i => x0 + w*i/(n-1);
        const Y = v => y0 + mgn + (h - 2*mgn)*(1 - (v - mn)/rng);
        const line = pts.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
        parts.push(`<polygon points="${x0},${(y0+h).toFixed(1)} ${line} ${(x0+w).toFixed(1)},${(y0+h).toFixed(1)}" fill="${gold}" fill-opacity="0.15"/>`);
        parts.push(`<polyline points="${line}" fill="none" stroke="${gold}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`);
        pts.forEach((v,i)=>parts.push(`<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="5" fill="${gold}"/>`));
        return yc + h + 16;
      }
      return yc;
    }
    if (b.kind === "stack"){
      let yc = yy;
      if (b.title){ parts.push(`<text x="${pad}" y="${yc}" font-family="monospace" font-size="22" letter-spacing="2" fill="${goldDim}">${_esc(String(b.title).toUpperCase())}</text>`); yc += 36; }
      const segs = (b.segments || []).filter(s => Number(s.value) > 0);
      const tot = segs.reduce((s,x)=>s + Number(x.value), 0) || 1;
      const h = 30, x0 = pad, w = cw; const id = "cp" + (_clip++);
      parts.push(`<defs><clipPath id="${id}"><rect x="${x0}" y="${yc}" width="${w}" height="${h}" rx="${h/2}"/></clipPath></defs>`);
      parts.push(`<rect x="${x0}" y="${yc}" width="${w}" height="${h}" rx="${h/2}" fill="${border}"/>`);
      let cx = x0; const inner = [];
      segs.forEach(s => { const sw = w*Number(s.value)/tot; inner.push(`<rect x="${cx.toFixed(1)}" y="${yc}" width="${(sw+0.6).toFixed(1)}" height="${h}" fill="${COL[s.color]||gold}"/>`); cx += sw; });
      parts.push(`<g clip-path="url(#${id})">${inner.join("")}</g>`);
      yc += h + 30;
      let lx = x0;
      segs.forEach(s => { parts.push(`<circle cx="${lx+7}" cy="${yc-7}" r="7" fill="${COL[s.color]||gold}"/>`); const t = s.label + " " + s.value; parts.push(`<text x="${lx+24}" y="${yc}" font-family="monospace" font-size="22" fill="${textSub}">${_esc(t)}</text>`); lx += 24 + t.length*13.4 + 30; });
      return yc + 28;
    }
    if (b.kind === "split"){
      const top = yy, bot = H - 150, gp = 84, pwid = (cw - gp)/2, lx = pad, rx = pad + pwid + gp;
      const panel = (x, accent, label) => {
        parts.push(`<rect x="${x}" y="${top}" width="${pwid}" height="${bot-top}" rx="16" fill="${surf}" stroke="${accent?gold:border}" stroke-width="${accent?2:1}"/>`);
        parts.push(`<text x="${x+30}" y="${top+50}" font-family="monospace" font-size="22" letter-spacing="2" fill="${accent?gold:textSub}">${_esc(String(label).toUpperCase())}</text>`);
      };
      const bf = b.before || {}, af = b.after || {};
      panel(lx, false, bf.label || "Before");
      panel(rx, true, af.label || "After");
      let by = top + 90;
      (bf.lines || []).forEach(ln => { wrapSvgText(ln, 17).forEach(w => { parts.push(`<text x="${lx+30}" y="${by}" font-family="Georgia, serif" font-size="26" fill="${textSub}">${_esc(w)}</text>`); by += 37; }); by += 6; });
      let ay = top + 86;
      wrapSvgText(af.decision || "Committed", 15).forEach(w => { parts.push(`<text x="${rx+30}" y="${ay}" font-family="Georgia, serif" font-weight="bold" font-size="30" fill="${text}">${_esc(w)}</text>`); ay += 42; });
      ay += 16;
      (af.chips || []).forEach(c => {
        const vlines = wrapSvgText(String(c.value), 16);
        parts.push(`<text x="${rx+30}" y="${ay}" font-family="monospace" font-size="16" letter-spacing="1" fill="${goldDim}">${_esc(String(c.label).toUpperCase())}</text>`);
        vlines.forEach((w,wi)=>{ parts.push(`<text x="${rx+30}" y="${ay+28+wi*30}" font-family="Georgia, serif" font-size="25" fill="${COL[c.color]||text}">${_esc(w)}</text>`); });
        ay += 28 + Math.max(1, vlines.length)*30 + 18;
      });
      const cm = (x, frac, lab, color) => {
        const cmy = bot - 92, bw = pwid - 60, bh = 18, bx = x + 30, byy = cmy + 16;
        parts.push(`<text x="${x+30}" y="${cmy}" font-family="monospace" font-size="18" letter-spacing="1.5" fill="${goldDim}">CLARITY</text>`);
        parts.push(`<rect x="${bx}" y="${byy}" width="${bw}" height="${bh}" rx="9" fill="${border}"/>`);
        const fw = Math.max(bh, bw*clamp01(frac));
        parts.push(`<rect x="${bx}" y="${byy}" width="${fw.toFixed(1)}" height="${bh}" rx="9" fill="${color}"/>`);
        parts.push(`<text x="${x+pwid-30}" y="${cmy+58}" font-family="monospace" font-size="20" fill="${color}" text-anchor="end">${_esc(lab)}</text>`);
      };
      cm(lx, bf.clarity != null ? bf.clarity : 0.18, bf.clarityLabel || "Low", textSub);
      cm(rx, af.clarity != null ? af.clarity : 0.92, af.clarityLabel || "High", gold);
      const axc = pad + pwid + gp/2, ayc = (top + bot)/2;
      parts.push(`<line x1="${axc-26}" y1="${ayc}" x2="${axc+12}" y2="${ayc}" stroke="${gold}" stroke-width="6"/>`);
      parts.push(`<polygon points="${axc+6},${ayc-16} ${axc+30},${ayc} ${axc+6},${ayc+16}" fill="${gold}"/>`);
      return bot;
    }
    if (b.kind === "pillars"){
      let yc = yy;
      if (b.gauge){
        parts.push(`<text x="${pad}" y="${yc}" font-family="monospace" font-size="20" letter-spacing="1.5" fill="${goldDim}">${_esc(String(b.gaugeTitle || "Confidence in this assumption").toUpperCase())}</text>`);
        const segy = yc + 20, segw = (cw - 2*12)/3, levels = b.gauge.levels || ["Low","Moderate","High"], active = b.gauge.active | 0;
        levels.forEach((l,i)=>{ const sx = pad + i*(segw+12), on = (i===active);
          parts.push(`<rect x="${sx}" y="${segy}" width="${segw.toFixed(1)}" height="16" rx="8" fill="${on?COL.cau:border}"/>`);
          parts.push(`<text x="${sx}" y="${segy+44}" font-family="monospace" font-size="20" fill="${on?text:textSub}">${_esc(l)}</text>`); });
        yc = segy + 66;
      }
      const beamy = yc + 36;
      parts.push(`<rect x="${pad}" y="${beamy}" width="${cw}" height="30" rx="10" fill="${gold}"/>`);
      parts.push(`<text x="${W/2}" y="${beamy+21}" font-family="monospace" font-size="20" fill="#16110a" text-anchor="middle">${_esc(b.beamLabel || "THE DECISION")}</text>`);
      const base = H - 250, ps = (b.pillars || []), n = ps.length || 1, pwid = 120, gp = n>1 ? (cw - n*pwid)/(n-1) : 0, fullh = base - (beamy+30);
      ps.forEach((p,i)=>{ const px = pad + i*(pwid+gp), ph = fullh*clamp01(p.strength), pty = base - ph;
        parts.push(`<rect x="${px}" y="${pty.toFixed(1)}" width="${pwid}" height="${ph.toFixed(1)}" rx="6" fill="${COL[p.color]||gold}"${p.highlight?` stroke="${text}" stroke-width="3"`:""}/>`);
        if (p.weak){ const xm = px + pwid/2;
          parts.push(`<line x1="${xm}" y1="${beamy+30}" x2="${xm}" y2="${pty.toFixed(1)}" stroke="${COL.crit}" stroke-width="4" stroke-dasharray="6 8"/>`);
          parts.push(`<text x="${xm}" y="${(pty-14).toFixed(1)}" font-family="monospace" font-size="18" fill="${COL.crit}" text-anchor="middle">weak link</text>`); }
        parts.push(`<text x="${px+pwid/2}" y="${base+30}" font-family="monospace" font-size="18" fill="${textSub}" text-anchor="middle">${_esc(p.label)}</text>`);
      });
      parts.push(`<line x1="${pad}" y1="${base}" x2="${W-pad}" y2="${base}" stroke="${border}" stroke-width="2"/>`);
      return base + 50;
    }
    if (b.kind === "reliability"){
      let yc = yy;
      if (b.restsOn){
        const art = /^[AEIOU]/i.test(b.restsOn) ? "an " : "a ";
        parts.push(`<text x="${pad}" y="${yc}" font-family="monospace" font-size="20" letter-spacing="1.5" fill="${goldDim}">${_esc(("Rests on " + art + b.restsOn + " assumption").toUpperCase())}</text>`);
        yc += 40;
      }
      if (b.assumptionText){
        wrapSvgText(b.assumptionText, 30).forEach(w => { parts.push(`<text x="${pad}" y="${yc+8}" font-family="Georgia, serif" font-size="32" fill="${text}">${_esc(w)}</text>`); yc += 46; });
        yc += 10;
      }
      if (b.gauge){
        parts.push(`<text x="${pad}" y="${yc+8}" font-family="monospace" font-size="20" letter-spacing="1.5" fill="${goldDim}">CONFIDENCE IN THIS ASSUMPTION</text>`);
        const segy = yc + 28, segw = (cw - 2*12)/3, levels = b.gauge.levels || ["Low","Moderate","High"], active = b.gauge.active | 0;
        levels.forEach((l,i)=>{ const sx = pad + i*(segw+12), on = (i===active);
          parts.push(`<rect x="${sx}" y="${segy}" width="${segw.toFixed(1)}" height="16" rx="8" fill="${on?COL.cau:border}"/>`);
          parts.push(`<text x="${sx}" y="${segy+44}" font-family="monospace" font-size="20" fill="${on?text:textSub}">${_esc(l)}</text>`); });
        yc = segy + 74;
      }
      if (b.bars && b.bars.length){
        parts.push(`<text x="${pad}" y="${yc+8}" font-family="monospace" font-size="20" letter-spacing="1.5" fill="${goldDim}">YOUR RELIABILITY BY ASSUMPTION CATEGORY</text>`); yc += 36;
        if (b.legend){ parts.push(`<text x="${pad}" y="${yc+8}" font-family="Georgia, serif" font-size="23" fill="${textSub}">${_esc(b.legend)}</text>`); yc += 44; }
        const barX = pad + 300, barW = (W - pad) - barX - 150;
        b.bars.forEach(bar => {
          const rowh = bar.current ? 92 : 64;
          if (bar.current) parts.push(`<rect x="${pad-14}" y="${yc-6}" width="${cw+28}" height="${rowh-18}" rx="12" fill="${surf}"/>`);
          parts.push(`<text x="${pad}" y="${yc+30}" font-family="Georgia, serif"${bar.current?' font-weight="bold"':''} font-size="28" fill="${text}">${_esc(bar.label)}</text>`);
          parts.push(barEl(barX, yc+10, barW, 26, bar.frac, COL[bar.color]||gold));
          parts.push(`<text x="${W-pad}" y="${yc+30}" font-family="monospace" font-size="22" fill="${goldDim}" text-anchor="end">${Math.round(clamp01(bar.frac)*100)}%</text>`);
          if (bar.current) parts.push(`<text x="${pad}" y="${yc+62}" font-family="monospace" font-size="18" fill="${COL.crit}">\u2190 this decision rests here</text>`);
          yc += rowh;
        });
      }
      if (b.caption){
        yc += 14;
        wrapSvgText(b.caption, 46).forEach(w => { parts.push(`<text x="${pad}" y="${yc+8}" font-family="Georgia, serif" font-size="27" fill="${textSub}">${_esc(w)}</text>`); yc += 38; });
      }
      return yc;
    }
    if (b.kind === "herostat"){
      let yc = yy;
      parts.push(`<text x="${pad}" y="${yc+108}" font-family="Georgia, serif" font-weight="bold" font-size="132" fill="${gold}">${_esc(String(b.value))}</text>`);
      wrapSvgText(b.label, 20).slice(0,2).forEach((w,i)=> parts.push(`<text x="${pad+270}" y="${yc+58+i*46}" font-family="Georgia, serif" font-size="36" fill="${text}">${_esc(w)}</text>`));
      return yc + 156;
    }
    if (b.kind === "verdict"){
      const cx = W/2; const cy = yy + 200;
      if (b.state === "sealed"){
        const r = 140;
        parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${gold}" stroke-width="7"/>`);
        parts.push(`<circle cx="${cx}" cy="${cy}" r="${r-18}" fill="none" stroke="${goldDim}" stroke-width="2"/>`);
        for (let a=0;a<360;a+=30){ const ax=cx+(r-9)*Math.cos(a*Math.PI/180), ay=cy+(r-9)*Math.sin(a*Math.PI/180); parts.push(`<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="4" fill="${goldDim}"/>`); }
        parts.push(`<text x="${cx}" y="${cy-4}" font-family="Georgia, serif" font-weight="bold" font-size="40" fill="${gold}" text-anchor="middle">SEALED</text>`);
        parts.push(`<text x="${cx}" y="${cy+36}" font-family="monospace" font-size="20" fill="${textSub}" text-anchor="middle">outcome hidden</text>`);
        parts.push(`<text x="${cx}" y="${cy+r+66}" font-family="Georgia, serif" font-size="34" fill="${text}" text-anchor="middle">Revealed in ${_esc(String(b.reveal||"soon"))}. Was I right?</text>`);
        return cy + r + 110;
      }
      const cv = COL[b.color] || gold;
      parts.push(`<rect x="${cx-235}" y="${cy-98}" width="470" height="196" rx="18" fill="none" stroke="${cv}" stroke-width="9"/>`);
      parts.push(`<text x="${cx}" y="${cy+36}" font-family="Georgia, serif" font-weight="bold" font-size="116" fill="${cv}" text-anchor="middle">${_esc(String(b.word))}</text>`);
      if (b.caption){ wrapSvgText(b.caption, 38).forEach((w,i)=> parts.push(`<text x="${cx}" y="${cy+150+i*42}" font-family="Georgia, serif" font-size="32" fill="${text}" text-anchor="middle">${_esc(w)}</text>`)); }
      return cy + 210;
    }
    return yy;
  };
  if (viz && viz.length){ y += 6; viz.forEach(b => { y = block(b, y); }); }

  const footY = H - 96;
  parts.push(`<line x1="${pad}" y1="${footY - 40}" x2="${W - pad}" y2="${footY - 40}" stroke="${border}" stroke-width="1"/>`);
  const wordmarkFont = "'Open Sans','Helvetica Neue',Arial,sans-serif";
  parts.push(`<a href="https://workoutput.com" target="_blank" rel="noopener">`
    + `<text x="${pad}" y="${footY}" font-size="25">`
    +   `<tspan font-family="monospace" letter-spacing="2" fill="${goldDim}">${footnote ? _esc(footnote) + "  \u00b7  " : ""}Built with </tspan>`
    +   `<tspan font-family="${wordmarkFont}" font-weight="600" fill="${gold}">WorkOutput</tspan>`
    +   `<tspan font-family="monospace" letter-spacing="2" fill="${goldDim}">  \u00b7  workoutput.com</tspan>`
    + `</text></a>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + (_openSansFontCss ? `<defs><style>${_openSansFontCss}</style></defs>` : "")
    + `<rect width="${W}" height="${H}" fill="${bg}"/>`
    + `<rect x="20" y="20" width="${W-40}" height="${H-40}" fill="none" stroke="${border}" stroke-width="2" rx="18"/>`
    + parts.join("") + `</svg>`;
}
// Generic SVG -> PNG Blob (the decision card uses cardToPngBlob at a fixed 700x460).
function svgToPngBlob(svg, W, H){
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (fn, arg) => { if (done) return; done = true; fn(arg); };
    const timer = setTimeout(() => finish(reject, new Error("svg render timeout")), 5000);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      img.onload = () => { try { ctx.drawImage(img, 0, 0, W, H); URL.revokeObjectURL(url);
        canvas.toBlob(b => { clearTimeout(timer); b ? finish(resolve, b) : finish(reject, new Error("toBlob null")); }, "image/png"); }
        catch(e){ clearTimeout(timer); finish(reject, e); } };
      img.onerror = (e) => { clearTimeout(timer); URL.revokeObjectURL(url); finish(reject, e); };
      img.src = url;
    } catch (e) { clearTimeout(timer); finish(reject, e); }
  });
}
// Native share sheet (with the PNG file) if available, else download. Never throws.
function downloadPng(blob, filename){
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.style.display = "none";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return "saved";
  } catch (_) { return "failed"; }
}
// Copy share text (caption + recipient link) to the clipboard. The universal fallback:
// works in environments where native share and downloads are blocked (e.g. sandboxed
// preview frames). Returns "copied" or "failed".
function copyShareText(text){
  if (!text) return Promise.resolve("failed");
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText){
      return navigator.clipboard.writeText(text).then(() => "copied").catch(() => legacyCopy(text));
    }
  } catch (_) {}
  return Promise.resolve(legacyCopy(text));
}
function legacyCopy(text){
  try {
    const ta = document.createElement("textarea"); ta.value = text || ""; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand && document.execCommand("copy"); ta.remove();
    return ok ? "copied" : "failed";
  } catch (_) { return "failed"; }
}
// v114.3: synchronous-entry share for a PRE-GENERATED blob. Must be called directly
// inside the click handler with no awaited work before it, so iOS Safari permits the
// share sheet. Falls back to download, then returns a status the caller can act on
// (the button copies the link if file share and download both fail).
function shareBlobNow(blob, filename, text){
  try {
    const file = new File([blob], filename, { type: "image/png" });
    if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })){
      return navigator.share({ files: [file], text: text || "" })
        .then(() => "shared")
        .catch(e => (e && e.name === "AbortError") ? "cancelled" : downloadPng(blob, filename));
    }
  } catch (_) {}
  return Promise.resolve(downloadPng(blob, filename));
}
async function shareOrDownloadPng(blob, filename, text){ return shareBlobNow(blob, filename, text); }
// Derive chart-ready viz specs from the real profile + ledger. Pure, defensive:
// every field degrades to null/neutral so a sparse profile still renders.
function deriveShareViz(profile, metrics){
  const p = profile || {};
  const L = (metrics && metrics.ledger) || {};
  const decisions = ((metrics && metrics.decisionsTracked != null) ? metrics.decisionsTracked : null) ?? p.decisionCount ?? 0;
  const reviewed = L.recorded || 0;
  const readiness = L.readinessAvg != null ? L.readinessAvg : null;
  const follow = L.followThroughRate != null ? L.followThroughRate : null;
  const streakDays = (metrics && metrics.streak && metrics.streak.days) || 0;
  // cognitive orientation from the running category mix
  let orientation = null;
  if (p.assumptionMix){
    const vals = ["structural","operational","external","behavioral"].map(k => ({ k, v: Number(p.assumptionMix[k] || 0) }));
    const max = Math.max(...vals.map(x => x.v), 0.0001);
    vals.sort((a,b) => b.v - a.v);
    orientation = vals.map((x,i) => ({ label: ASSUMPTION_CAT_LABEL[x.k], frac: x.v/max, color: i===0?"gold":"sub", value: Math.round(x.v*100) }));
  }
  // calibration (calls that held)
  const oc = p.outcomes || { held:0, partial:0, broke:0 };
  const ocT = (oc.held||0)+(oc.partial||0)+(oc.broke||0);
  const heldRate = ocT >= 1 ? Math.round(((oc.held||0)+0.5*(oc.partial||0))/ocT*100) : null;
  const heldDots = heldRate != null ? { n:10, filled: Math.round(heldRate/10), note: heldRate+"%" } : null;
  // weighted reads for the radar
  const ev = p.evidence || {}; const evT = (ev.High||0)+(ev.Balanced||0)+(ev.Low||0);
  const evScore = evT ? ((ev.High||0)*1 + (ev.Balanced||0)*0.6 + (ev.Low||0)*0.3)/evT : null;
  const rv = p.reversibility || {}; const rvT = (rv.Reversible||0)+(rv.Irreversible||0);
  const revScore = rvT ? (rv.Reversible||0)/rvT : null;
  const rigor = (typeof p.rigor === "number" && p.rigor > 0) ? p.rigor : null;
  const ax = (label, v) => ({ label, value: v == null ? 0.5 : Math.max(0.08, Math.min(1, v)) });
  const radarAxes = [
    ax("Calibration", heldRate == null ? null : heldRate/100),
    ax("Rigor", rigor == null ? null : rigor/100),
    ax("Evidence", evScore),
    ax("Follow-through", follow == null ? null : follow/100),
    ax("Optionality", revScore),
    ax("Review rate", decisions ? Math.min(1, reviewed/decisions) : null),
  ];
  const rings = [
    { value: readiness != null ? readiness : 0, max:100, label:"Readiness", color:"gold" },
    { value: decisions, max: Math.max(decisions,1), label:"Decisions", color:"pos" },
    { value: heldRate != null ? heldRate : 0, max:100, label:"Held", color:"slate" },
  ];
  // additional real metrics
  const readinessPts = ((metrics && metrics.ledger && metrics.ledger.readinessSeries) || []).map(pp => Number(pp && pp.v)).filter(v => !isNaN(v));
  const outcomeMix = ocT ? [
    { label:"Held", value: oc.held||0, color:"pos" },
    { label:"Partial", value: oc.partial||0, color:"cau" },
    { label:"Broke", value: oc.broke||0, color:"crit" },
  ].filter(s => s.value > 0) : null;
  const cf = p.confidence || {}; const cfT = (cf.high||0)+(cf.moderate||0)+(cf.limited||0);
  const confidenceDist = cfT ? [
    { label:"High", value: cf.high||0, color:"pos" },
    { label:"Moderate", value: cf.moderate||0, color:"cau" },
    { label:"Limited", value: cf.limited||0, color:"slate" },
  ].filter(s => s.value > 0) : null;
  const reversibilityMix = rvT ? [
    { label:"Reversible", value: rv.Reversible||0, color:"pos" },
    { label:"Irreversible", value: rv.Irreversible||0, color:"cau" },
  ].filter(s => s.value > 0) : null;
  return { decisions, reviewed, readiness, follow, streakDays, orientation, heldDots, heldRate, radarAxes, rings,
           readinessPts, outcomeMix, confidenceDist, reversibilityMix };
}
// Map a shareable card type + its data to poster content. Carries no private content
// beyond what the card itself already displays.
// Build the four assumption-category pillars for the Assumption Map card. Pillar
// height encodes historical reliability (categories the user breaks on most are
// shorter), the current decision's load-bearing category is highlighted, and the
// weakest reliable category is flagged as the "weak link". Degrades to neutral,
// unflagged pillars when there is no break history yet.
function deriveAssumptionPillars(profile, currentCategory){
  const cats = ["structural","behavioral","operational","external"];
  const bc = (profile && profile.breakByCategory) || {};
  const breaks = cats.map(c => Math.max(0, Number(bc[c]) || 0));
  const maxB = Math.max(1, ...breaks);
  const anyData = breaks.some(b => b > 0);
  const cur = currentCategory ? String(currentCategory).toLowerCase() : null;
  const pillars = cats.map((c,i) => ({
    label: (typeof ASSUMPTION_CAT_LABEL !== "undefined" && ASSUMPTION_CAT_LABEL[c]) || (c.charAt(0).toUpperCase()+c.slice(1)),
    cat: c,
    strength: anyData ? Math.max(0.30, 1 - 0.72*(breaks[i]/maxB)) : 0.7,
  }));
  let weakIdx = 0; pillars.forEach((p,i)=>{ if (p.strength < pillars[weakIdx].strength) weakIdx = i; });
  pillars.forEach((p,i)=>{
    p.highlight = (cur && p.cat === cur);
    p.weak = anyData && i === weakIdx;
    p.color = p.weak ? "crit" : (p.strength > 0.75 ? "pos" : p.strength > 0.55 ? "gold" : "slate");
  });
  return pillars;
}

// Number of Decision Style archetypes (deriveDecisionStyle). Used for the factual
// "1 of N styles" rarity line. VIRAL_PERCENTILE_ENABLED gates claims that need a real
// population baseline (percentile badges, "uncommon"); it stays off until a cohort
// baseline exists, so the cards never assert a ranking we cannot defend.
const DECISION_STYLE_COUNT = 11;
const VIRAL_PERCENTILE_ENABLED = false;

function posterContentForShare(type, data){
  data = data || {};
  if (type === "decision_style" || type === "style"){
    if (data.name){
      const viz = [];
      const heroVal = (data.heldDots && data.heldDots.note) ? data.heldDots.note : null;
      if (heroVal) viz.push({ kind:"herostat", value:heroVal, label:"of your confident calls held" });
      if (data.orientation && data.orientation.length) viz.push({ kind:"bars", title:"Cognitive orientation", items:data.orientation });
      if (data.confidenceDist && data.confidenceDist.length) viz.push({ kind:"stack", title:"Confidence at commit", segments:data.confidenceDist });
      const rarity = "1 of " + DECISION_STYLE_COUNT + " decision styles" + ((VIRAL_PERCENTILE_ENABLED && data.styleRare) ? " \u00b7 uncommon" : "");
      const lines = [data.line, rarity].filter(Boolean);
      return { kicker:"Decision Style", title:data.name, lines, viz: viz.length?viz:null, footnote: data.n != null ? (data.n + " decisions") : null };
    }
    const L = data.ledgerMetrics || {};
    const ls = []; if (L.recorded != null) ls.push(L.recorded + " reviewed " + (L.recorded === 1 ? "outcome" : "outcomes"));
    return { kicker:"Decision Style", title:"How my judgment holds up", lines: ls, footnote:null };
  }
  if (type === "credential"){
    // v122: the calibration credential card. Leads with the held-rate as the headline
    // number, then the graded count and window as the backing. Carries no decision
    // content, so it is safe to share. Attestation line marks it as a record, not a claim.
    const c = data.credential || data;
    if (!c || !c.ready){
      const need = (c && c.toFloor) || 3;
      return { kicker:"Calibration", title:"Track record forming", lines:[need + " more reviewed " + (need===1?"outcome":"outcomes") + " and your calibration credential is issued."], footnote:null };
    }
    const viz = [{ kind:"herostat", value: c.heldRate + "%", label:"of reviewed calls held" }];
    const lines = [];
    lines.push(c.gradedN + " graded " + (c.gradedN===1?"decision":"decisions"));
    if (c.window && data.windowLabel) lines.push(data.windowLabel);
    const foot = c.attestation ? ("Verified record \u00b7 " + c.attestation) : null;
    return { kicker:"Calibration credential", title:"My judgment, on the record", lines, viz, footnote: foot };
  }
  if (type === "decision_metrics"){
    const viz = [];
    if (data.radarAxes && data.radarAxes.length) viz.push({ kind:"radar", axes:data.radarAxes });
    if (data.rings && data.rings.length) viz.push({ kind:"rings", items:data.rings });
    if (data.outcomeMix && data.outcomeMix.length) viz.push({ kind:"stack", title:"Outcomes recorded", segments:data.outcomeMix });
    return { kicker:"Decision Metrics", title:"The shape of my decisions", viz: viz.length?viz:null, footnote: data.n != null ? (data.n + " decisions") : null };
  }
  if (type === "assumption_map"){
    // Privacy invariant (relocated from the removed AssumptionMapCard, v126.5):
    // the assumption STRUCTURE (category, confidence, reliability) is always safe to
    // show. The literal assumption TEXT is sensitive and is rendered only when the
    // caller explicitly passes data.assumptionText — ShareArtifact gates that on the
    // user's per-card toggle (default off). Do not promote assumptionText to an
    // always-on field, and do not derive a unique fingerprint by combining it with
    // category and confidence beyond what the toggle authorizes.
    const catLabel = data.assumptionCategory ? (String(data.assumptionCategory).charAt(0).toUpperCase() + String(data.assumptionCategory).slice(1)) : null;
    const conf = (data.confidence && data.confidence !== "–") ? data.confidence : null;
    const active = conf === "High" ? 2 : (conf === "Low" || conf === "Limited") ? 0 : 1;
    const bandColor = f => f > 0.75 ? "pos" : f > 0.55 ? "gold" : "crit";
    const rel = data.assumptionReliability || [];
    const bars = rel.map(r => ({ label:r.label, frac:r.strength, color:bandColor(r.strength), current:r.highlight }));
    let caption = null;
    if (catLabel && bars.length){
      const cur = bars.find(x => x.current);
      const minFrac = Math.min(...bars.map(x => x.frac));
      if (cur && cur.frac <= minFrac + 1e-6) caption = catLabel + " is the category your calls break on most.";
      else if (cur) caption = "Your " + catLabel + " assumptions have held " + Math.round(cur.frac*100) + "% of the time.";
    }
    const blk = { kind:"reliability", restsOn: catLabel,
      assumptionText: data.assumptionText || null,
      gauge: conf ? { levels:["Low","Moderate","High"], active } : null,
      bars: bars.length ? bars : null,
      legend: bars.length ? "How often your calls in each category have held" : null,
      caption };
    return { kicker:"Assumption Map", title: data.decisionSummary || data.decisionType || "What this decision rests on", viz:[blk], footnote:null };
  }
  if (type === "called_it"){
    const dec = data.decisionSummary || data.decisionType || "A committed decision";
    const conf = (data.confidence && data.confidence !== "–") ? data.confidence : null;
    const sub = "Committed " + (data.committedLabel || "today") + (conf ? (" \u00b7 " + conf + " confidence") : "");
    // v122: the sealed bet. State the observable that settles the call so the card is a
    // real prediction, not a vague claim. Kept short to fit the poster line.
    const betLine = data.predictionTrigger ? ("Bet: " + String(data.predictionTrigger).slice(0, 90)) : null;
    const outcome = data.outcome;
    if (!outcome || outcome === "pending"){
      return { kicker:"Called it", title: dec, lines:[sub, betLine].filter(Boolean), viz:[{ kind:"verdict", state:"sealed", reveal: data.revealLabel || "soon" }], footnote:null };
    }
    const map = {
      held:    { w:"HELD",    c:"pos",  cap:"The call held. Confidence was warranted." },
      partial: { w:"PARTIAL", c:"cau",  cap:"Partly held. The core call was right." },
      broke:   { w:"BROKE",   c:"crit", cap:"It broke. Logged, learned, recalibrated." },
    };
    const m = map[outcome] || map.held;
    return { kicker:"Called it", title: dec, lines:[sub, betLine].filter(Boolean), viz:[{ kind:"verdict", state:"stamp", word:m.w, color:m.c, caption:m.cap }], footnote:null };
  }
  if (type === "decision_history"){
    const n = data.decisions != null ? data.decisions : 0;
    const reviewed = data.reviewed != null ? data.reviewed : 0;
    const streak = data.streak != null ? data.streak : 0;
    if (!n){
      return { kicker:"Decision History", title:"My decision history starts here", lines:["Every call structured, kept, and reviewed.", "Built with WorkOutput."], footnote:"0 decisions so far" };
    }
    const viz = [];
    if (streak) viz.push({ kind:"dots", title:"Streak", n:Math.min(streak,21), filled:Math.min(streak,21), cols:Math.min(streak,21)||1, color:"gold", note: streak + (streak===1?" day":" days") });
    if (data.readinessPts && data.readinessPts.length >= 2) viz.push({ kind:"spark", title:"Readiness over time", points:data.readinessPts, note: data.readiness != null ? (data.readiness + " now") : null });
    const items = [{ label:"Committed", frac:1, color:"pos", value:n }];
    if (reviewed) items.push({ label:"Reviewed", frac: n?reviewed/n:0, color:"slate", value:reviewed });
    if (data.readiness != null) items.push({ label:"Avg readiness", frac: data.readiness/100, color:"gold", value:data.readiness });
    viz.push({ kind:"bars", title:"By the numbers", items });
    return { kicker:"Decision History", title:"How my decisions add up", viz, footnote: data.readiness != null ? ("Avg readiness " + data.readiness) : null };
  }
  // before_after (default): the unclear-to-committed diptych
  {
    const optionsTxt = data.optionsCount ? (data.optionsCount + " options on the table") : "Competing options, unresolved";
    const conf = (data.confidence && data.confidence !== "–") ? data.confidence : null;
    const ev = (data.evidenceStrength && data.evidenceStrength !== "–") ? data.evidenceStrength : null;
    const next = (data.nextStep && data.nextStep !== "–") ? data.nextStep : (data.reviewLabel || null);
    const cc = v => v === "High" ? "pos" : v === "Moderate" ? "cau" : "slate";
    const chips = [];
    if (conf) chips.push({ label:"Confidence", value:conf, color:cc(conf) });
    if (ev) chips.push({ label:"Evidence", value:ev, color:cc(ev) });
    if (next) chips.push({ label:"Next step", value:next, color:"gold" });
    const split = { kind:"split",
      before: { label:"Before", lines:[ data.decisionType || "An open question", optionsTxt, "Hidden assumptions" ], clarity:0.16, clarityLabel:"Low" },
      after: { label:"After", decision: data.decisionType ? ("Committed: " + data.decisionType) : "A committed next step", chips, clarity:0.92, clarityLabel:"High" } };
    return { kicker:"Before / After", title:"How this call got worked", viz:[split], footnote:null };
  }
}

// ── v29: PUBLIC-SAFE CARD ──────────────────────────────────────────────────────
// Deterministic sanitization helper. Returns a new card object — never mutates source.
// Same 7-field schema as buildDecisionCard so cardToSvg and decisionCardToMarkdown
// work unmodified. Fields not in the public-safe spec return "–" (evidenceStrength,

// ===== EDITORIAL UI + WIRING =====

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  WORKOUTPUT v47 — UI + BACKEND MERGE (Stage 1: core generation loop)         ║
// ╚══════════════════════════════════════════════════════════════════════════╝
// The editorial v46 presentation layer driving the REAL engine extracted verbatim
// from v45 (above this comment): system prompts, mode inference, domain selection,
// prompt assembly + caching, message-payload compression, streaming fetch, response
// parsing, client-side document parsing, and readiness assessment.
//
// WIRED in Stage 1: Home → compose → real streaming Sonnet call → mode declaration
// → live document render → derived decision card. Confidence is driven by the
// model's actual Reasoning Strength, not a demo toggle.
// DEFERRED to later stages (logic exists in v45, not yet wired here): session
// persistence + library, the Advanced intelligence panel (dependencies / failure /
// benchmark / profile / contradiction), the three overlays, full scorecard, sharing.
// Model strings are v45's; validate them against the artifact API runtime.

// ===== SESSION PERSISTENCE (Stage 2) =====
// Storage primitives reused verbatim from v45; save adapted to v47's state shape.
const STORAGE_INDEX_KEY = "wo:index";
function genId(){ return "s_"+Date.now()+"_"+Math.random().toString(36).slice(2,7); }
function sessionTitleFrom(messages){
  const first = (messages||[]).find(m=>m.role==="user");
  const t = first ? (first.text||first.content||"").trim() : "";
  if(!t) return "Untitled decision";
  return t.length>52 ? t.slice(0,52)+"…" : t;
}
async function loadIndex(){ try{ const r=await store.get(STORAGE_INDEX_KEY); return r?JSON.parse(r.value):{activeId:null,sessions:[]}; }catch{ return {activeId:null,sessions:[]}; } }
async function saveIndex(index){ try{ await store.set(STORAGE_INDEX_KEY, JSON.stringify(index)); }catch{} }
async function loadSessionBlob(id){ try{ const r=await store.get("wo:session:"+id); return r?JSON.parse(r.value):null; }catch{ return null; } }
async function deleteSessionBlob(id){
  try{
    await store.delete("wo:session:"+id);
    const index=await loadIndex();
    index.sessions=(index.sessions||[]).filter(s=>s.id!==id);
    if(index.activeId===id) index.activeId=index.sessions[0]?.id||null;
    await saveIndex(index); return index;
  }catch{ return null; }
}
async function saveSessionV47(s){
  try{
    const title = s.title || sessionTitleFrom(s.messages);
    const _mode = (s.currentMode==="Chat"?"Clarify":s.currentMode) || "Clarify";
    const blob = { id:s.id, title, messages:s.messages||[], rawHistory:s.rawHistory||[],
      activeDoc:s.activeDoc||null, currentMode:_mode, lastReasoning:s.lastReasoning||null,
      decisionState:s.decisionState||null, updatedAt:Date.now() };
    // v97.8: write the heavy session blob, but do NOT let a blob-write failure (rate
    // limit, transient reject on the artifact store) prevent the lightweight index meta
    // from being written. The index is what makes the decision appear in the library, so
    // it is the higher priority. A blob that failed to write can be re-saved on the next
    // turn; a missing index row makes the decision invisible.
    let blobOk = true;
    try { await store.set("wo:session:"+s.id, JSON.stringify(blob)); }
    catch(be){
      const bmsg=((be&&(be.message||be.name))||"").toString().toLowerCase();
      if(bmsg.includes("quota")||bmsg.includes("exceeded")) return {__quotaError:true};
      blobOk = false; // transient: continue to the index write anyway
    }
    const index = await loadIndex();
    const summaryData = extractSessionSummary({ decisionState:s.decisionState, messages:s.rawHistory, sessionCustomTitle:title, currentMode:_mode });
    const status = deriveSessionStatus({ currentMode:_mode, messages: s.activeDoc?[{docData:true}]:[], decisionState:s.decisionState });
    const ds = s.decisionState || {};
    const meta = { id:s.id, title, updatedAt:Date.now(), mode:_mode, hasDoc:!!s.activeDoc,
      status, readiness: (s.decisionState && s.decisionState.readinessScore) ?? null, template: (s.decisionState && s.decisionState.selectedTemplate) ?? null,
      workflowType: (ds && ds.workflowType) || "decide", // v97.4: index meta carried workflowType so the Document Archive (filters workflowType==="draft") and decide-only recents can resolve. Was missing, so draft sessions never appeared in their library.
      scope: ds.scope || null, scopeConfidence: ds.scopeConfidence || null, scopeConfirmed: !!ds.scopeConfirmed, scopeSuggested: ds.scopeSuggested || null,
      outcome: ds.outcome || null, reviewDueAt: ds.reviewDueAt || null, loadBearingAssumption: ds.loadBearingAssumption || null,
      prediction: ds.prediction || null, // v122: sealed bet rides into meta so the review queue can show it at grading
      committedAt: ds.committedAt || null, commitSignals: ds.commitSignals || null, softCheck: ds.softCheck || null,
      orgId: ds.orgId || null,
      pending: !!(ds && ds.pending),
      privacy:"Reusable", doNotLearn:false, ...summaryData };
    // v100.1 (A2-recovery): preserve a meta-only recovered outcome. When a session's blob
    // was lost and the outcome was written straight to meta (patchIndexMeta, stamped
    // recoveredViaMeta), the incoming decisionState carries NO outcome — so the meta line
    // above would overwrite the recovered outcome with null on the very next save,
    // undoing the recovery. If the existing row holds a recovered outcome and this save
    // is not itself supplying one, carry the existing outcome (and its review fields)
    // forward. This is the only path that may keep a meta field the incoming ds lacks.
    const ex = (index.sessions||[]).findIndex(x=>x.id===s.id);
    if (ex>=0) {
      const prevMeta = index.sessions[ex];
      if (prevMeta && prevMeta.outcome && prevMeta.outcome.recoveredViaMeta && !meta.outcome) {
        meta.outcome = prevMeta.outcome;
        if (meta.reviewDueAt == null) meta.reviewDueAt = prevMeta.reviewDueAt || null;
        if (meta.loadBearingAssumption == null) meta.loadBearingAssumption = prevMeta.loadBearingAssumption || null;
        if (meta.prediction == null) meta.prediction = prevMeta.prediction || null;
        if (meta.committedAt == null) meta.committedAt = prevMeta.committedAt || null;
      }
      index.sessions[ex]=meta;
    } else index.sessions.unshift(meta);
    index.activeId = s.id;
    if(index.sessions.length>50){
      // v99.7 (P10): prune evicted sessions' blobs. The index capped at 50 rows, but
      // wo:session:<id> blobs lived forever — unbounded growth on the heaviest key
      // class. Best-effort and fire-and-forget; a failed delete leaves one orphan,
      // which is the pre-fix status quo, never a worse state.
      const evicted = index.sessions.slice(50);
      index.sessions = index.sessions.slice(0,50);
      evicted.forEach(m => { try { store.delete("wo:session:"+m.id).catch(()=>{}); } catch(_){} });
    }
    // Index write with one retry — this is the write that makes the decision visible.
    try { await saveIndex(index); }
    catch(_){ try { await saveIndex(index); } catch(_2){ return {__quotaError:true}; } }
    return index;
  }catch(e){
    const msg=((e&&(e.message||e.name))||"").toString().toLowerCase();
    if(msg.includes("quota")||msg.includes("exceeded")) return {__quotaError:true};
    return null;
  }
}

// ===== FILE UPLOAD =====
// Two paths. PDFs and images are sent to the model as native attachments (the API
// reads them directly — no browser PDF parser, no CDN). Word/Excel/text files are
// extracted to text client-side and dropped into the box for review.
function _b64(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>{ const s=String(r.result); res(s.slice(s.indexOf(",")+1)); }; r.onerror=()=>rej(new Error("read failed")); r.readAsDataURL(file); }); }
const _imgType = { ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".gif":"image/gif", ".webp":"image/webp" };
function attachmentKindFor(ext){ if(ext===".pdf") return "document"; if(_imgType[ext]) return "image"; return null; }

// v112: attachment caps. Two ceilings, both quoted to the user on a block so they
// can adjust rather than guess.
//  - Per file (unchanged): native PDF/image 18MB, text-extracted 25MB.
//  - Per session, NATIVE total: native files travel base64-encoded (+~33%) inside
//    the request body, so several of them sum toward the API body limit. This bounds
//    that sum, which is both a cost control and a correctness guard the per-file cap
//    alone does not give. Text files are excluded from this budget: only their
//    extracted text travels, not the raw file, so raw size is not the cost driver.
const ATTACH_FILE_MAX_NATIVE = 18 * 1024 * 1024;
const ATTACH_FILE_MAX_TEXT   = 25 * 1024 * 1024;
const ATTACH_SESSION_NATIVE_MAX = 24 * 1024 * 1024; // raw; ~32MB once encoded, the body ceiling
const _fmtMB = (b) => { const mb = (Number(b) || 0) / 1048576; return (mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10) + "MB"; };
const _attachSessionUsed = (sizes) => (sizes || []).reduce((s, n) => s + (Number(n) || 0), 0);
async function fileToAttachment(file, ext){
  const data = await _b64(file);
  if(ext===".pdf") return { type:"document", source:{ type:"base64", media_type:"application/pdf", data } };
  return { type:"image", source:{ type:"base64", media_type:_imgType[ext]||"image/png", data } };
}
async function extractFileText(file){
  const name=(file.name||"").toLowerCase();
  const ext=name.includes(".")?name.slice(name.lastIndexOf(".")):"";
  const textExt=[".txt",".md",".markdown",".csv",".tsv",".json",".log",".rtf",".html",".htm",".xml"];
  if(textExt.includes(ext)) return await file.text();
  if(ext===".docx"){ const r=await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() }); return (r && r.value) ? r.value : ""; }
  if(ext===".xlsx"||ext===".xls"){ const wb=XLSX.read(await file.arrayBuffer(), { type:"array" }); return wb.SheetNames.map(n=>"# "+n+"\n"+XLSX.utils.sheet_to_csv(wb.Sheets[n])).join("\n\n"); }
  if(ext===".doc") throw new Error("legacy .doc not supported; save as .docx");
  try{ return await file.text(); }catch{ throw new Error("unsupported file type"); }
}

const NARROW = 820;


const TYPE_EXAMPLES = {
  "Career decision": "Example: I have two offers. One pays 20% more, the other has a clearer path to a senior role. I need to choose in a week.",
  "Major purchase": "Example: I'm deciding whether to buy now or wait six months on a purchase I can mostly, but not comfortably, afford.",
  "Relocation": "Example: A promotion requires relocating my family across the country within 60 days. The role is a step up; the move is disruptive.",
  "Negotiation prep": "Example: I'm negotiating a salary offer next week. I want to know my leverage, my walk-away point, and how to anchor.",
  "Difficult conversation": "Example: I need to tell a long-time report their performance is slipping, without losing them or the relationship.",
  "Runway analysis": "Example: We have 14 months of runway. Should we cut burn now or push for growth and raise in nine months?",
  "Founder log": "Example: I want to record the reasoning behind a pivot so I can revisit later whether the call held up.",
  "Go / no-go": "Example: We can ship the new product line in Q3 or hold for more validation. I need a go or no-go with the tradeoffs.",
  "Co-founder alignment": "Example: My co-founder and I disagree on whether to raise or stay lean. I want the real points of tension surfaced.",
  "Fundraise readiness": "Example: We're weighing raising a seed round now versus waiting to hit 500k ARR. Are we ready?",
  "Feature priority": "Example: Three engineers, twelve weeks, eight competing features. I need to decide what ships and what waits.",
  "PRD brief": "Example: I need a tight brief for a new feature. The problem, the user, the scope, and what success looks like.",
  "Build vs buy": "Example: We can build the integration in-house over a quarter or buy a vendor solution now. Which is the better call?",
  "Tech risk": "Example: We're weighing a major refactor against shipping features. I want the risks of each path laid out.",
  "Option analysis": "Example: I have three approaches to the same problem. Compare them on cost, speed, and risk.",
  "Exec brief": "Example: I need a one-page brief for a client executive on whether to enter the European market.",
  "Decision memo": "Example: Draft a memo recommending a vendor, with the options compared and the reasoning visible.",
  "Strategic assessment": "Example: Assess my client's position against two emerging competitors and where they're most exposed.",
  "Competitive map": "Example: Map the competitive landscape for a client launching a new analytics product.",
  "Process audit": "Example: Our onboarding takes three times as long as designed. Find where it's breaking and decide the fix.",
  "Capacity plan": "Example: Demand is up 40% next quarter. I need a capacity plan that does not blow the budget.",
  "Vendor eval": "Example: We're choosing between two vendors for a core system. Evaluate them on cost, risk, and fit.",
  "Org design": "Example: We're restructuring a 30-person team. I need to weigh two reporting structures.",
  "Scenario plan": "Example: I want base, downside, and stress scenarios for next year's operating plan.",
};

const PACKS = [
  // v126: ordered to the wedge. Consultant (Segment A) leads, then Product Manager (B)
  // and Founder (C), with Operator and Personal below but still present.
  { id:"consultant", label:"Consultant Client", mark:"⊕", blurb:"Deliver a defensible recommendation a client can act on.",
    items:["Exec brief","Decision memo","Option analysis","Strategic assessment","Competitive map"],
    sample:"I need a clear market-entry recommendation for a client expanding into Europe." },
  { id:"product", label:"Product Manager", mark:"⬡", blurb:"Roadmap, build-vs-buy, and what ships next.",
    items:["Feature priority","PRD brief","Build vs buy","Tech risk","Option analysis"],
    sample:"Prioritize our Q3 roadmap. Three engineers, twelve weeks, eight competing features." },
  { id:"founder", label:"Founder", mark:"✦", blurb:"High-stakes calls with the whole company downstream.",
    items:["Runway analysis","Founder log","Go / no-go","Co-founder alignment","Fundraise readiness"],
    sample:"Should we raise our seed round now, or push to $500k ARR first? We have 14 months of runway." },
  { id:"operator", label:"Operator", mark:"⚙", blurb:"Diagnose what is breaking and decide the fix.",
    items:["Process audit","Capacity plan","Vendor eval","Org design","Scenario plan"],
    sample:"Our onboarding is breaking at scale. It now takes three times as long as designed." },
  { id:"personal", label:"Personal", mark:"♡", blurb:"Life choices, with empathy and a clear head.",
    items:["Career decision","Major purchase","Relocation","Negotiation prep","Difficult conversation"],
    sample:"I have a job offer in another city. A step up, but I would have to relocate within 60 days." },
];

const modeColor = m => m==="Commit"?"var(--positive)":m==="Explore"?"var(--caution)":"var(--slate)";
const confColor = c => c==="High"?"var(--positive)":c==="Moderate"?"var(--caution)":"var(--critical)";

// ── primitives ────────────────────────────────────────────────────────────────
const Kicker = ({ children, color, style }) => (
  <div style={{ fontFamily:"var(--mono)", fontSize:12, fontWeight:500, letterSpacing:"0.16em",
    textTransform:"uppercase", color:color||"var(--accent)", ...style }}>{children}</div>
);
const Rule = ({ style, color }) => <div style={{ height:1, background:color||"var(--line)", ...style }} />;
function Dot({ color, label }) {
  return <span style={{ display:"inline-flex", alignItems:"center", gap:7 }}>
    <span style={{ width:8, height:8, borderRadius:"50%", background:color }} />
    <span style={{ fontFamily:"var(--mono)", fontSize:11.5, letterSpacing:"0.1em", textTransform:"uppercase", color }}>{label}</span>
  </span>;
}
function PrimaryBtn({ children, onClick, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{ background: disabled?"var(--line)":"var(--accent)",
    color:"#FBF7EC", border:"none", borderRadius:4, padding:"11px 20px", fontFamily:"var(--mono)", fontSize:13,
    fontWeight:500, letterSpacing:"0.05em", cursor:disabled?"default":"pointer", minHeight:44, transition:"background .18s" }}>{children}</button>;
}
function GhostBtn({ children, onClick, accent="var(--ink2)", disabled=false }) {
  return <button onClick={onClick} disabled={disabled} style={{ background:"transparent", color:"var(--ink2)", border:"1px solid var(--line)",
    borderRadius:4, padding:"11px 18px", fontFamily:"var(--mono)", fontSize:13, letterSpacing:"0.05em", cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.45:1,
    minHeight:44, transition:"border-color .18s,color .18s" }}
    onMouseEnter={e=>{ if(disabled) return; e.currentTarget.style.borderColor=accent; e.currentTarget.style.color="var(--ink)";}}
    onMouseLeave={e=>{ if(disabled) return; e.currentTarget.style.borderColor="var(--line)"; e.currentTarget.style.color="var(--ink2)";}}>{children}</button>;
}
// v78.3: brand label only. The mode enum stays Chat/Explore/Commit everywhere in
// logic, storage, the model prompt, and metrics; the user-facing word for the Chat
// mode is "Clarify". One map, applied at every display point.
const MODE_LABEL = { Clarify: "Clarify", Chat: "Clarify", Explore: "Explore", Commit: "Commit" };
const modeLabel = m => MODE_LABEL[m] || m;
function ModeTag({ mode }) {
  if(!mode) return null;
  return <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
    <span style={{ width:7, height:7, borderRadius:"50%", background:modeColor(mode) }} />
    <span style={{ fontFamily:"var(--mono)", fontSize:11.5, letterSpacing:"0.13em", textTransform:"uppercase", color:"var(--ink2)" }}>{modeLabel(mode)}</span>
  </span>;
}

// ── Home (Personal pack open by default) ──────────────────────────────────────

function SessionView({ messages, streaming, streamingText, pad, attached, onOpen, scale, onScale, currentMode, needsDocRetry, onMakeDocument }) {
  const statusColor = (s) => s==="Committed"?"var(--positive)":s==="Ready to Commit"?"var(--caution)":"var(--slate)";
  const sc = scale || 1;
  const fs = (base) => Math.round(base * sc * 10) / 10;
  const rootRef = React.useRef(null);
  const scaleRef = React.useRef(sc); scaleRef.current = sc;
  // v73: pinch-to-zoom (two fingers) and ctrl/cmd+wheel scale the chat font. Listeners are
  // bound once (non-passive so the gesture can be intercepted) and read the live scale via
  // a ref, so a continuous pinch is not interrupted by re-renders.
  React.useEffect(()=>{
    const el = rootRef.current; if(!el || !onScale) return;
    const clamp = v => Math.max(0.5, Math.min(2, Math.round(v*100)/100));
    const dist = t => Math.hypot(t[0].clientX-t[1].clientX, t[0].clientY-t[1].clientY);
    let pinch = null;
    const onTS = e => { if(e.touches.length===2) pinch = { d:dist(e.touches), s:scaleRef.current }; };
    const onTM = e => { if(pinch && e.touches.length===2){ e.preventDefault(); onScale(clamp(pinch.s * (dist(e.touches)/pinch.d))); } };
    const onTE = e => { if(e.touches.length<2) pinch = null; };
    const onWheel = e => { if(e.ctrlKey || e.metaKey){ e.preventDefault(); onScale(clamp(scaleRef.current - e.deltaY*0.0025)); } };
    el.addEventListener("touchstart", onTS, {passive:false});
    el.addEventListener("touchmove", onTM, {passive:false});
    el.addEventListener("touchend", onTE, {passive:false});
    el.addEventListener("wheel", onWheel, {passive:false});
    return ()=>{ el.removeEventListener("touchstart",onTS); el.removeEventListener("touchmove",onTM); el.removeEventListener("touchend",onTE); el.removeEventListener("wheel",onWheel); };
  },[onScale]);
  const step = (d) => onScale && onScale(Math.max(0.5, Math.min(2, Math.round((sc+d)*100)/100)));
  return (
    <div ref={rootRef} style={{ maxWidth:720, margin:"0 auto", padding:`40px ${pad}px 40px` }}>
      <h1 style={SR_ONLY}>Decision conversation</h1>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:20 }}>
        <Kicker>Session</Kicker>
        {onScale && (
          <div style={{ display:"flex", alignItems:"center", gap:4 }} title="Pinch or Ctrl/Cmd+scroll to zoom">
            <button onClick={()=>step(-0.1)} aria-label="Smaller text" className="wo-hover" style={{ width:24, height:24, lineHeight:1, background:"transparent", border:"1px solid var(--line)", borderRadius:6, color:"var(--ink2)", cursor:"pointer", fontFamily:"var(--mono)", fontSize:12 }}>A−</button>
            <span style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--meta)", minWidth:30, textAlign:"center" }}>{Math.round(sc*100)}%</span>
            <button onClick={()=>step(0.1)} aria-label="Larger text" className="wo-hover" style={{ width:24, height:24, lineHeight:1, background:"transparent", border:"1px solid var(--line)", borderRadius:6, color:"var(--ink2)", cursor:"pointer", fontFamily:"var(--mono)", fontSize:13 }}>A+</button>
          </div>
        )}
      </div>
      {/* SessionModeBar removed v97.0 — mode pills already shown below the page title */}
      {attached && attached.length>0 && (
        <div className="wo-in" style={{ marginBottom:26, background:"var(--edge)", border:"1px solid var(--line)", borderLeft:"3px solid var(--accent)", borderRadius:6, padding:"14px 16px" }}>
          <Kicker color="var(--meta)" style={{ marginBottom:10 }}>Related decisions you have made</Kicker>
          {attached.slice(0,3).map((a,i)=>{
            const s=a.session||{};
            return (
              <div key={i}
                onClick={onOpen?()=>onOpen(s.id):undefined}
                role={onOpen?"button":undefined}
                tabIndex={onOpen?0:undefined}
                aria-label={onOpen?("Open decision: "+(s.title||"Untitled decision")):undefined}
                onKeyDown={onOpen?(e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); onOpen(s.id); } }):undefined}
                style={{ display:"flex", gap:10, alignItems:"baseline", padding:"7px 0", borderTop:i>0?"1px solid var(--line-soft)":"none", cursor:onOpen?"pointer":"default" }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:statusColor(s.status), flexShrink:0, transform:"translateY(2px)" }} />
                <span style={{ flex:1, minWidth:0 }}>
                  <span style={{ display:"block", fontFamily:"var(--serif)", fontSize:16, lineHeight:1.4, color:"var(--ink)" }}>{s.title||"Untitled decision"}{a.isStale?" (older)":""}</span>
                  {a.matchReason && <span style={{ display:"block", fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.02em", color:"var(--meta)", marginTop:2 }}>{a.matchReason}</span>}
                </span>
                {s.status && <span style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.06em", color:statusColor(s.status), flexShrink:0 }}>{s.status}</span>}
              </div>
            );
          })}
          <p style={{ fontFamily:"var(--serif)", fontSize:13.5, fontStyle:"italic", color:"var(--meta)", margin:"10px 0 0" }}>These are factored into this session's analysis.</p>
        </div>
      )}
      {messages.map((m,i)=> m.role==="user" ? (
        <div key={i} style={{ margin:"0 0 28px" }}>
          <Kicker color="var(--meta)" style={{ marginBottom:8 }}>You</Kicker>
          <p style={{ fontFamily:"var(--serif)", fontSize:fs(18), lineHeight:1.62, color:"var(--ink)", margin:0 }}>{m.text}</p>
        </div>
      ) : (
        <div key={i} style={{ margin:"0 0 28px", paddingLeft:18, borderLeft:`2px solid ${modeColor(m.mode)}` }}>
          <div style={{ marginBottom:8 }}><ModeTag mode={m.mode} /></div>
          <p style={{ fontFamily:"var(--serif)", fontSize:fs(18), lineHeight:1.62, color:"var(--ink2)", margin:0, whiteSpace:"pre-wrap" }}>{m.text}</p>
        </div>
      ))}
      {needsDocRetry && !streaming && onMakeDocument && (
        <div style={{ margin:"4px 0 28px", paddingLeft:18, borderLeft:"2px solid var(--accent)" }}>
          <p style={{ fontFamily:"var(--serif)", fontSize:fs(16), lineHeight:1.55, color:"var(--ink2)", margin:"0 0 4px" }}>
            What format should the document take?
          </p>
          <p style={{ fontFamily:"var(--serif)", fontSize:fs(13.5), fontStyle:"italic", color:"var(--meta)", margin:"0 0 12px" }}>
            Pick one and it will be produced as a document you can export and share. Or add any missing detail in the message box and send.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {[
              ["Decision memo","decision memo"],
              ["Options comparison","options comparison table"],
              ["Pros and cons","pros and cons summary"],
              ["Recommendation brief","recommendation brief"],
            ].map(([label,fmt])=>(
              <button key={fmt} onClick={()=>onMakeDocument(fmt)} className="wo-hover" style={{ fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.03em", color:"var(--paper)", background:"var(--accent)", border:"1px solid var(--accent)", borderRadius:8, padding:"9px 14px", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:7 }}>
                <FileText size={14} />{label}
              </button>
            ))}
          </div>
        </div>
      )}
      {streaming && (
        <div aria-hidden="true" style={{ paddingLeft:18, borderLeft:"2px solid var(--meta)" }}>
          <p style={{ fontFamily:"var(--serif)", fontSize:fs(18), lineHeight:1.62, color:"var(--ink2)", margin:0, whiteSpace:"pre-wrap" }}>
            {streamingText}
            <span style={{ display:"inline-block", width:fs(8), height:fs(18), marginLeft:2, background:"var(--accent)", verticalAlign:"-3px", animation:"woCaret 1s steps(1) infinite" }} />
          </p>
        </div>
      )}
      {messages.length===0 && !streaming && (
        <p style={{ fontFamily:"var(--serif)", fontSize:17, color:"var(--meta)", fontStyle:"italic" }}>No turns yet. Type a decision below to begin.</p>
      )}
    </div>
  );
}

// ── Document (live) ───────────────────────────────────────────────────────────
function EmptyState({ label, action }) {
  return <div style={{ maxWidth:680, margin:"0 auto", padding:"80px 28px", textAlign:"center" }}>
    <p style={{ fontFamily:"var(--serif)", fontSize:18, color:"var(--meta)", fontStyle:"italic" }}>{label}</p>
    {action ? <div style={{ marginTop:18 }}>{action}</div> : null}
  </div>;
}
function DocumentView({ doc, mode, reasoning, onExport, onShare, onShareFramework, isShared, onStartOwn, contradiction, pad, htmlLocked, scopeState, onSetScope, onReview, onExpand, canExtend, onCard, shareSlot }) {
  if(!doc) return <EmptyState label="No committed document yet. Take a decision to Commit and it will appear here." />;
  const cc = confColor(reasoning);
  const conflicts = (!isShared && contradiction && contradiction.conflicts) ? contradiction.conflicts : [];
  const sevColor = (s) => s==="high"?"var(--critical)":s==="moderate"?"var(--caution)":"var(--slate)";
  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:`36px ${pad}px 120px` }}>
      <article className="wo-in">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
          <Kicker style={{ marginBottom:14 }}>{doc.subtitle || "Decision Document"}</Kicker>
          {!isShared && shareSlot}
        </div>
        <h1 style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:32, lineHeight:1.12, letterSpacing:"-0.01em", color:"var(--ink)", margin:"0 0 16px" }}>{doc.title}</h1>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center", fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.05em", color:"var(--meta)" }}>
          {["WorkOutput", doc.date, modeLabel(mode||"Commit")].map((x,i)=>(<React.Fragment key={i}>{i>0&&<span style={{opacity:.5}}>/</span>}<span>{x}</span></React.Fragment>))}
          {reasoning && <><span style={{opacity:.5}}>/</span><Dot color={cc} label={`${reasoning} confidence`} /></>}
        </div>
        <Rule style={{ margin:"24px 0 26px" }} />
        {!isShared && scopeState && (scopeState.scope || scopeState.outcome) && (
          <div className="wo-in" style={{ marginBottom:26, display:"flex", flexDirection:"column", gap:10 }}>
            <ScopeTag scope={scopeState.scope||"personal"} confidence={scopeState.scopeConfidence} confirmed={scopeState.scopeConfirmed} suggested={scopeState.scopeSuggested} onSet={onSetScope} />
            {scopeState.outcome && scopeState.outcome.status!=="recorded" && (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap", background:"var(--accent-soft)", border:"1px solid var(--accent)", borderRadius:8, padding:"10px 13px" }}>
                <span style={{ fontFamily:"var(--serif)", fontSize:14.5, color:"var(--ink2)" }}>This call is in your Outcomes queue. Come back and record whether it held.</span>
                <button onClick={onReview} className="wo-hover" style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.04em", color:"var(--accent)", background:"transparent", border:"1px solid var(--accent)", borderRadius:6, padding:"6px 11px", cursor:"pointer", flexShrink:0 }}>Open Outcomes</button>
              </div>
            )}
            {scopeState.outcome && scopeState.outcome.status==="recorded" && (
              <div style={{ display:"flex", alignItems:"center", gap:9, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:8, padding:"10px 13px" }}>
                <OutcomeBadge outcome={scopeState.outcome} />
                {scopeState.outcome.note && <span style={{ fontFamily:"var(--serif)", fontSize:14, fontStyle:"italic", color:"var(--meta)" }}>{scopeState.outcome.note}</span>}
              </div>
            )}
          </div>
        )}
        {conflicts.length>0 && (
          <div className="wo-in" style={{ marginBottom:26, background:"#2a1512", border:"1px solid var(--critical)", borderRadius:6, padding:"15px 17px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:10 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"var(--critical)" }} />
              <span style={{ fontFamily:"var(--mono)", fontSize:11.5, fontWeight:500, letterSpacing:"0.12em", textTransform:"uppercase", color:"#E0A89A" }}>Conflicts with your decision history</span>
            </div>
            {conflicts.map((c,i)=>(
              <div key={i} style={{ padding:"8px 0", borderTop:i>0?"1px solid #ffffff14":"none" }}>
                <span style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.04em", color:sevColor(c.severity) }}>{(c.severity||"moderate").toUpperCase()}</span>
                <span style={{ display:"block", fontFamily:"var(--serif)", fontSize:16, lineHeight:1.5, color:"#ECD9D2", marginTop:3 }}>{c.tension}</span>
                {c.priorSession && <span style={{ display:"block", fontFamily:"var(--mono)", fontSize:11, color:"#B58A80", marginTop:3 }}>vs. {c.priorSession}</span>}
              </div>
            ))}
            <p style={{ fontFamily:"var(--serif)", fontSize:13.5, fontStyle:"italic", color:"#B58A80", margin:"10px 0 0" }}>This is a flag, not a verdict. Reversing a past decision can be the right call when the context has changed.</p>
          </div>
        )}
        {isShared && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, flexWrap:"wrap", marginBottom:26, background:"var(--edge)", border:"1px solid var(--line)", borderLeft:"3px solid var(--accent)", borderRadius:6, padding:"14px 16px" }}>
            <span style={{ fontFamily:"var(--serif)", fontSize:15.5, lineHeight:1.5, color:"var(--ink2)" }}>This is a shared, read-only decision. Use this playbook to start your own. Your work stays private.</span>
            <PrimaryBtn onClick={onStartOwn}>Use this playbook</PrimaryBtn>
          </div>
        )}
        {doc.sections.map((s,i)=>(
          <section key={i} style={{ margin:"0 0 26px" }}>
            <h2 style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:18, color:"var(--ink)", margin:"0 0 10px" }}>{s.heading}</h2>
            {s.isList
              ? <ul style={{ margin:0, padding:0, listStyle:"none" }}>{s.items.map((it,j)=>(
                  <li key={j} style={{ display:"flex", gap:12, marginBottom:9 }}>
                    <span style={{ color:"var(--accent)", fontFamily:"var(--display)", fontWeight:600, flexShrink:0 }}>·</span>
                    <span style={{ fontFamily:"var(--serif)", fontSize:17.5, lineHeight:1.6, color:"var(--ink2)" }}>{it}</span>
                  </li>))}</ul>
              : <p style={{ fontFamily:"var(--serif)", fontSize:17.5, lineHeight:1.68, color:"var(--ink2)", margin:0, whiteSpace:"pre-wrap" }}>{s.content}</p>}
          </section>
        ))}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:30, paddingTop:22, borderTop:"1px solid var(--line)" }}>
          {isShared ? (
            <>
              <PrimaryBtn onClick={onStartOwn}>Use this playbook</PrimaryBtn>
              <GhostBtn onClick={onExport}>Export</GhostBtn>
            </>
          ) : (
            <>
              <PrimaryBtn onClick={onShareFramework}>Share the framework</PrimaryBtn>
              <GhostBtn onClick={onShare}>Share this decision</GhostBtn>
              {onCard && <GhostBtn onClick={onCard}>Decision card</GhostBtn>}
              <GhostBtn onClick={onExport}>Export</GhostBtn>
            </>
          )}
        </div>
        {!isShared && (
          <p style={{ fontFamily:"var(--serif)", fontSize:13.5, fontStyle:"italic", color:"var(--meta)", margin:"12px 0 0" }}>
            Sharing the template only sends the decision logic, never your content. Sharing the full decision includes everything.
          </p>
        )}
        {!isShared && onExpand && (
          <div style={{ marginTop:18, paddingTop:16, borderTop:"1px dashed var(--line)" }}>
            <GhostBtn onClick={onExpand} accent="var(--accent)">
              {canExtend ? "Generate extended version" : "Expand into a full version"}
            </GhostBtn>
            <p style={{ fontFamily:"var(--serif)", fontSize:13, color:"var(--meta)", margin:"8px 0 0" }}>
              {canExtend
                ? "Regenerates this output at greater length and depth. This is a deliberate step, not automatic."
                : "Longer, deeper versions are available on a higher plan. This output covers the essentials."}
            </p>
          </div>
        )}
        <div style={{ marginTop:40, paddingTop:14, borderTop:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <span style={{ fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.14em", color:"var(--meta)" }}>
            PRODUCED WITH <span style={{ color:"var(--accent)" }}>WORKOUTPUT</span>
          </span>
          {doc.date && <span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.05em", color:"var(--meta)", opacity:0.7 }}>{doc.date}</span>}
        </div>
      </article>
    </div>
  );
}

// ── Card (derived from live doc) ──────────────────────────────────────────────
function CardView({ card, scorecard, onDownloadPng, onCopyText, pad, onBack }) {
  if(!card) return <EmptyState label="No decision card yet. It is built from a committed document." action={onBack ? <GhostBtn onClick={onBack}><ArrowLeft size={15} />Back to your decision</GhostBtn> : null} />;
  const cc = confColor(card.confidence);
  const rows = [["Options compared",card.optionsCompared],["Biggest tradeoff",card.biggestTradeoff],["Weakest assumption",card.weakestAssumption],["Evidence strength",card.evidenceStrength],["Recommended next step",card.nextStep]];
  const goodHigh = { Strong:"var(--positive)", Moderate:"var(--caution)", Weak:"var(--critical)" };
  const riskLow = { Low:"var(--positive)", Moderate:"var(--caution)", High:"var(--critical)" };
  const revGood = { High:"var(--positive)", Moderate:"var(--slate)", Low:"var(--critical)" };
  const densGood = { Low:"var(--positive)", Moderate:"var(--caution)", High:"var(--critical)" };
  const sc = scorecard;
  const metrics = sc ? [
    { label:"Decision quality", band:sc.decisionQuality.band, score:sc.decisionQuality.score, map:goodHigh },
    { label:"Confidence", band:sc.confidence.band, score:sc.confidence.score, note:sc.confidence.label, map:goodHigh },
    { label:"Evidence strength", band:sc.evidenceStrength.band, score:sc.evidenceStrength.score, note:sc.evidenceStrength.level, map:goodHigh },
    { label:"Risk exposure", band:sc.riskExposure.band, score:sc.riskExposure.score, map:riskLow },
    { label:"Assumption density", band:sc.assumptionDensity.band, note:sc.assumptionDensity.count?`${sc.assumptionDensity.count} surfaced`:null, map:densGood },
    { label:"Reversibility", band:sc.reversibility.band, map:revGood },
  ].filter(m=>m.band) : [];
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:`44px ${pad}px 120px` }}>
      <div className="wo-in" style={{ width:"100%", maxWidth:560 }}>
        {/* v115: share top-right, where it is expected and always visible. */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:16 }}>
          {onBack ? <GhostBtn onClick={onBack}><ArrowLeft size={15} />Back</GhostBtn> : <span />}
          <ShareImageButton
            makeBlob={()=>cardToPngBlob(card)}
            cacheKey={"dc:"+(card.decision||"")+":"+(card.date||"")}
            filename="decision_card.png"
            text="My decision card. Built with WorkOutput. https://workoutput.com"
            metricType="decision"
            label="Share card"
          />
        </div>
        <div style={{ maxWidth:430, margin:"0 auto", background:"var(--edge)", border:"1px solid var(--line)", borderRadius:6, overflow:"hidden", boxShadow:"0 18px 40px -28px #4a3a1a40" }}>
          <div style={{ padding:"18px 20px 16px", borderBottom:"1px solid var(--line-soft)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:10 }}>
              <Kicker>Decision Card</Kicker><span style={{ fontFamily:"var(--mono)", fontSize:11.5, color:"var(--meta)" }}>{card.date}</span>
            </div>
            <p style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:20, lineHeight:1.22, color:"var(--ink)", margin:"10px 0 0" }}>{card.decision}</p>
            <div style={{ marginTop:12 }}><Dot color={cc} label={`${card.confidence} confidence`} /></div>
          </div>
          <div style={{ padding:"4px 20px 8px" }}>
            {rows.map(([k,v],i)=>(
              <div key={i} style={{ padding:"13px 0", borderBottom:i<rows.length-1?"1px solid var(--line-soft)":"none" }}>
                <div style={{ fontFamily:"var(--mono)", fontSize:11.5, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--meta)", marginBottom:5 }}>{k}</div>
                <div style={{ fontFamily:"var(--serif)", fontSize:15.5, lineHeight:1.5, color:"var(--ink)" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ padding:"12px 20px", borderTop:"1px solid var(--line-soft)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"var(--mono)", fontSize:11.5, letterSpacing:"0.08em", color:"var(--meta)" }}>Built with WorkOutput</span>
            <span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:14, color:"var(--accent)" }}>W/O</span>
          </div>
        </div>
        <div style={{ maxWidth:430, margin:"12px auto 0", display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          <GhostBtn onClick={onDownloadPng}><Download size={15} />Download PNG</GhostBtn>
          <GhostBtn onClick={onCopyText}>Copy as text</GhostBtn>
        </div>
        {metrics.length>0 && (
          <div style={{ marginTop:30 }}>
            <Kicker style={{ marginBottom:12 }}>Decision scorecard</Kicker>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:10 }}>
              {metrics.map((m,i)=>(
                <div key={i} style={{ background:"var(--edge)", border:"1px solid var(--line)", borderLeft:`3px solid ${m.map[m.band]||"var(--meta)"}`, borderRadius:"0 6px 6px 0", padding:"11px 13px" }}>
                  <div style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--meta)", marginBottom:5 }}>{m.label}</div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                    <span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:17, color:m.map[m.band]||"var(--ink)" }}>{m.band}</span>
                    {typeof m.score==="number" && <span style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--meta)" }}>{m.score}</span>}
                  </div>
                  {m.note && <div style={{ fontFamily:"var(--serif)", fontSize:13.5, color:"var(--meta)", marginTop:3 }}>{m.note}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sidebar (rail on wide, drawer on narrow) ──────────────────────────────────
// ── Advanced intelligence primitives + view (Stage 3) ─────────────────────────
// ── ANALYTICS GLOSSARY + INFO BUBBLE (shared; labels auto-attach a bubble) ───────
const GLOSSARY = {
  "Readiness":"How complete your decision inputs are across objectives, alternatives, risks, assumptions, evidence, and constraints. Higher means the recommendation rests on more of what matters.",
  "Readiness over time":"Your average decision readiness by month. A rising line means you are bringing more complete inputs before you decide.",
  "Avg readiness":"Your average readiness across decisions. A quick read on how well-formed your inputs usually are.",
  "Session signal":"A live read on the current decision: which stage you are in, confidence so far, how many turns, and how much context has built up.",
  "Reasoning":"The engine's current confidence in a recommendation, from Low to High, based on the evidence and clarity in the thread.",
  "Turns":"How many times you have contributed to this decision. More turns usually means more context to work from.",
  "Context":"Approximate size of the working context for this decision, in tokens. Large contexts are compressed automatically.",
  "Dependencies":"What this decision depends on and what depends on it. Surfaces prerequisites and downstream effects you might miss.",
  "Map dependencies":"What this decision depends on and what depends on it, so you see prerequisites and knock-on effects before committing.",
  "Failure simulation":"A structured pre-mortem. The engine assumes the decision has failed and works backward to the most likely causes.",
  "Run a pre-mortem":"Assume the decision failed, then work backward to the most likely causes so you can defend against them now.",
  "Top drivers":"The factors most likely to cause failure, ranked. Address these first to lower your exposure.",
  "Benchmark":"How this decision compares to typical outcomes for similar decisions. A sanity check, not a verdict.",
  "Comparison signal":"How your options compare with each other and against typical outcomes for similar decisions.",
  "Decision profile":"What WorkOutput has learned about how you decide. It calibrates future outputs to your patterns and evidence preferences.",
  "Cross-session context":"Prior decisions related to this one, pulled in for reference so you are not starting cold.",
  "Cross-session contradiction":"Where this decision conflicts with positions you took in earlier ones. Catches drift before you commit.",
  "Check for conflicts":"Compares this decision against your earlier ones and flags where they contradict each other.",
  "Stress-test by role":"Views the decision through a specific role's eyes, such as a CFO or a customer, to expose blind spots.",
  "Pressure-test (overlays)":"Stress tests that challenge the decision: compare options head to head, or view it through a chosen role.",
  "Objectives":"What you are trying to achieve. The criteria a good outcome must satisfy.",
  "Alternatives":"The options on the table. More real alternatives means a better-tested choice.",
  "Risks":"What could go wrong, and what it would cost if it did.",
  "Assumptions":"What you are taking as true without proof. Unexamined assumptions are the usual source of bad decisions.",
  "Evidence":"What backs your inputs, from anecdote up to validated test. Stronger evidence raises readiness more.",
  "Constraints":"The hard limits: budget, time, policy, capacity. The boundaries a workable choice must fit inside.",
  "Decisions tracked":"Total decisions saved to your library, in progress or committed.",
  // v99.7 (P5): duplicate "Decisions" key removed — the later, library-wide definition
  // below is authoritative; this one was silently overwritten.
  "Committed":"Decisions you have taken all the way to a final output.",
  "Clarify / Explore / Commit":"How your decisions split across the three stages: clarifying, comparing, and committing.",
  "Decisions learned from":"Committed decisions that fed your Decision Profile. Ones you mark do-not-learn are excluded.",
  "Evidence preference":"The kind of evidence you tend to rely on, learned from your history.",
  "Last active":"When you last worked a decision.",
  "Summary":"A private snapshot of your own usage. Visible only to you.",
  "Combined funnel":"The share-to-create funnel across all users: how many shares lead to opens, and opens to new decisions.",
  "By loop":"The same funnel split by share type: full decision links versus template-only framework links.",
  "Shares":"How many share links were created.",
  "Opens":"How many times a shared link was opened.",
  "Creates":"How many recipients started their own decision from a shared link.",
  "K-factor":"Viral coefficient: new decisions started per share. Above 1 means each share more than replaces itself.",
  "Decision loop":"Sharing a full decision. It carries content, so it spreads less but converts warmer.",
  "Framework loop":"Sharing template logic only, never content. It spreads widely because there is no exposure.",
  "Decision Style":"A named description of how you decide, derived from your own committed decisions — not a quiz. The name comes from your most distinctive pattern; the line is built from your real reads and sharpens as you commit more. It describes how you decide, never what you decided, so it is safe to share.",
  "Streak":"Consecutive days you have worked a decision. Streaks reward steady, deliberate practice.",
  "Uses earned":"How many times other people have used structures you shared. The core of your reach.",
  "Templates shared":"How many reusable structures you have published. Structures carry no private content.",
  "Outcomes reviewed":"Committed decisions you came back to and recorded a real outcome for. This is what turns the ledger from a log into calibration.",
  "Follow-through":"The share of your committed decisions you actually returned to review. High follow-through is what makes every other number trustworthy.",
  "Decisions":"Every decision and document in your library, in progress or committed.",
};
const tipFor = (k) => (typeof k === "string" ? GLOSSARY[k.trim()] : null) || null;
function InfoTip({ k, text }){
  // v99.7 (M7): hooks must run unconditionally. The early `return null` previously sat
  // above useRef/useState/useEffect — a rules-of-hooks violation that crashes with
  // "Rendered fewer hooks than expected" if a call site ever flips k/text between
  // valid and invalid across renders. The guard now sits after every hook.
  const body = text || tipFor(k);
  const ref = React.useRef(null);
  const touched = React.useRef(false); // after a tap, ignore the synthetic mouse events
  const [st, setSt] = React.useState({ open:false, above:true, align:"center" });
  const W = 220;
  const show = () => {
    const el = ref.current;
    if(!el || typeof window==="undefined"){ setSt({ open:true, above:true, align:"center" }); return; }
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const cx = r.left + r.width/2;
    // pick a horizontal anchor that keeps the panel on screen, and place above unless tight
    const align = cx < W/2 + 16 ? "left" : cx > vw - W/2 - 16 ? "right" : "center";
    const above = r.top > 170;
    setSt({ open:true, above, align });
  };
  const hide = () => setSt(s => s.open ? { ...s, open:false } : s);
  React.useEffect(()=>{
    if(!st.open) return;
    const onKey = (e) => { if(e.key==="Escape") hide(); };
    const onDown = (e) => { if(ref.current && !ref.current.contains(e.target)) hide(); };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    return ()=>{ window.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown, true); };
  }, [st.open]);
  if(!body) return null; // v99.7 (M7): guard relocated below the hooks
  // Absolute, anchored to the icon: always adjacent and above (immune to transformed
  // ancestors and scrolling, unlike fixed). Horizontal anchor keeps it on screen.
  const hpos = st.align==="left" ? { left:-4 } : st.align==="right" ? { right:-4 } : { left:"50%", transform:"translateX(-50%)" };
  const vpos = st.above ? { bottom:"calc(100% + 8px)" } : { top:"calc(100% + 8px)" };
  return (
    <span ref={ref} style={{ position:"relative", display:"inline-flex", verticalAlign:"middle", marginLeft:6 }}
      onMouseEnter={()=>{ if(!touched.current) show(); }} onMouseLeave={()=>{ if(!touched.current) hide(); }}>
      <span role="button" tabIndex={0} aria-label={(typeof k==="string"?k+": ":"")+body}
        onTouchStart={()=>{ touched.current = true; }}
        onClick={(e)=>{ e.stopPropagation(); e.preventDefault(); st.open ? hide() : show(); }}
        onKeyDown={(e)=>{ if(e.key==="Enter"||e.key===" "){ e.stopPropagation(); e.preventDefault(); st.open ? hide() : show(); } }}
        style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:22, height:22, margin:"-4px -3px", padding:0, color:st.open?"var(--accent)":"var(--meta)", cursor:"pointer", lineHeight:0 }}>
        <Info size={14} />
      </span>
      {st.open && (
        <span role="tooltip" style={{ position:"absolute", zIndex:1000, ...vpos, ...hpos,
          width:W, maxWidth:"calc(100vw - 28px)", background:"var(--paper)", color:"var(--ink2)", border:"1px solid var(--line)", borderRadius:9,
          boxShadow:"0 14px 36px -20px rgba(0,0,0,0.55)", padding:"10px 12px", fontFamily:"var(--serif)", fontSize:13.5, lineHeight:1.5,
          letterSpacing:"normal", textTransform:"none", fontStyle:"normal", fontWeight:400, whiteSpace:"normal" }}>
          {typeof k==="string" && <span style={{ display:"block", fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--accent)", marginBottom:5 }}>{k}</span>}
          {body}
        </span>
      )}
    </span>
  );
}
const Lead = ({ children, color }) => <span style={{ fontFamily:"var(--mono)", fontSize:11.5, letterSpacing:"0.1em", textTransform:"uppercase", color:color||"var(--meta)" }}>{children}{typeof children==="string" && tipFor(children) ? <InfoTip k={children} /> : null}</span>;
const Body2 = ({ children, color, style }) => <p style={{ fontFamily:"var(--serif)", fontSize:16, lineHeight:1.58, color:color||"var(--ink2)", margin:0, ...style }}>{children}</p>;
function ListBlock({ label, items, color }) {
  if(!items || !items.length) return null;
  return <div style={{ marginBottom:12 }}><Lead color={color}>{label}</Lead>{items.map((it,i)=>(<Body2 key={i} style={{ marginTop:5 }}>{it}</Body2>))}</div>;
}
function Module({ kicker, children, span, delay, pro }) {
  return <section className="wo-in" style={{ animationDelay:delay||"0s", gridColumn:span?"1 / -1":"auto", background:"var(--edge)", border:"1px solid var(--line)", borderRadius:7, padding:"18px 20px" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:13 }}>
      <span style={{ display:"inline-flex", alignItems:"center" }}><Kicker>{kicker}</Kicker><InfoTip k={kicker} /></span>
      {pro && <span style={{ fontFamily:"var(--mono)", fontSize:10, fontWeight:500, letterSpacing:"0.14em", color:"var(--accent)", border:"1px solid var(--accent)", borderRadius:20, padding:"2px 8px" }}>PRO</span>}
    </div>{children}</section>;
}
const pImpColor = v => v==="High"?"var(--critical)":v==="Moderate"?"var(--caution)":"var(--positive)";
const hint = (t) => <Body2 style={{ fontStyle:"italic", color:"var(--meta)" }}>{t}</Body2>;

// Small two-column summary row used by the metrics views.
function MetricRow({ label, value, last }) {
  return <div style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"9px 0", borderBottom: last?"none":"1px solid var(--line-soft)" }}>
    <Lead>{label}</Lead>
    <span style={{ fontFamily:"var(--serif)", fontSize:15.5, color:"var(--ink)" }}>{value}</span>
  </div>;
}

// USER scope — every user, own data. Table summary for now.
// v73: shared analytics presentation. Same metric engine drives the personal panel and
// the Enterprise group panel; only the framing and the data source differ.
const _rateColor = v => v == null ? "var(--meta)" : v >= 70 ? "var(--positive)" : v >= 45 ? "var(--caution)" : "var(--critical)";
const CAT_LABEL = ASSUMPTION_CAT_LABEL; // v74.1: was a duplicate literal of ASSUMPTION_CAT_LABEL
function StatTile({ label, value, sub, accent }) {
  return (
    <div style={{ flex: "1 1 130px", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 26, color: accent || "var(--ink)" }}>{value}</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--meta)", marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontFamily: "var(--serif)", fontSize: 12.5, color: "var(--meta)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
function LBar({ label, pct, right, color }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 5 }}>
        <span style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--ink2)" }}>{label}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink)", flexShrink: 0 }}>{right}</span>
      </div>
      <div style={{ height: 6, background: "var(--line)", borderRadius: 6, overflow: "hidden" }}>
        <div style={{ width: `${Math.max(0, Math.min(100, pct || 0))}%`, height: "100%", background: color || "var(--accent)", borderRadius: 6, transition: "width .6s cubic-bezier(.2,.7,.2,1)" }} />
      </div>
    </div>
  );
}
const Insufficient = ({ msg }) => <p style={{ fontFamily: "var(--serif)", fontSize: 13.5, fontStyle: "italic", color: "var(--meta)", margin: "2px 0 0" }}>{msg || "Not enough recorded outcomes yet to show this."}</p>;
function Trend({ series, label, gid }) {
  if (!series || series.length < 2) return <Insufficient msg="Needs at least two committed decisions to plot a trend." />;
  const id = "tg_" + (gid || "x");
  return (
    <div style={{ marginTop: 4 }}>
      {label && <Kicker style={{ color: "var(--meta)", marginBottom: 8 }}>{label}</Kicker>}
      <div style={{ height: 120, marginLeft: -8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
            <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--accent)" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke="var(--line-soft)" vertical={false} />
            <XAxis dataKey="x" tick={{ fontSize: 10, fill: "var(--meta)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--meta)" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
            <Area type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={2} fill={`url(#${id})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
// The full metric body. scopeMode: "personal" | "group".
// The full metric body. scopeMode: "personal" | "group". locked: show only a teaser
// sample (headline tiles on the user's own numbers) plus an unlock card.
function LedgerPanel({ m, scopeMode, locked, onUpgrade }) {
  m = m || buildLedgerMetrics([]);
  if (locked) {
    const proUnlocks = ["Calibration by your stated confidence", "Where your calls break, by category and decision type", "Decision style, stance, and rigor", "Readiness trend over time", "Activity and cadence"];
    return (
      <>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <StatTile label="Committed" value={m.committed} />
          <StatTile label="Outcomes recorded" value={m.recorded} sub={m.pending > 0 ? `${m.pending} awaiting review` : null} />
          <StatTile label="Calls that held" value={m.heldRate != null ? m.heldRate + "%" : "–"} accent={_rateColor(m.heldRate)} />
          <StatTile label="Follow-through" value={m.followThroughRate != null ? m.followThroughRate + "%" : "–"} />
        </div>
        <div style={{ background: "var(--edge)", border: "1px solid var(--line)", borderRadius: 10, padding: "20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <Lock size={15} style={{ color: "var(--accent)" }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: 20, padding: "2px 8px" }}>Pro</span>
          </div>
          <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 20, color: "var(--ink)", margin: "0 0 6px" }}>See the full picture of how you decide</h3>
          <p style={{ fontFamily: "var(--serif)", fontSize: 14.5, lineHeight: 1.55, color: "var(--meta)", margin: "0 0 14px" }}>The summary above is yours on every plan. Pro turns it into a calibrated record of your judgment.</p>
          <div style={{ marginBottom: 16 }}>
            {proUnlocks.map((u, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "6px 0" }}>
                <Check size={15} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 3 }} />
                <span style={{ fontFamily: "var(--serif)", fontSize: 14.5, color: "var(--ink2)" }}>{u}</span>
              </div>
            ))}
          </div>
          <Btn onClick={onUpgrade}>Unlock with Pro</Btn>
        </div>
      </>
    );
  }
  if (!m || m.committed === 0)
    return <EmptyState label={scopeMode === "group" ? "No aggregate-eligible work decisions yet. Work decisions appear here once committed and classified as work." : "No committed decisions yet. Commit a decision and your patterns build here."} />;
  const group = scopeMode === "group";
  const recordRows = [
    { label: "Held", n: m.held, c: "var(--positive)" },
    { label: "Partially held", n: m.partial, c: "var(--caution)" },
    { label: "Did not hold", n: m.broke, c: "var(--critical)" },
  ];
  const topTypes = Object.entries(m.typeMix || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
        <StatTile label={group ? "Contributing decisions" : "Committed"} value={m.committed} />
        <StatTile label="Outcomes recorded" value={m.recorded} sub={m.pending > 0 ? `${m.pending} awaiting review` : null} />
        <StatTile label="Calls that held" value={m.heldRate != null ? m.heldRate + "%" : "–"} accent={_rateColor(m.heldRate)}
          sub={m.heldRateCI ? `${m.heldRateCI.lo}–${m.heldRateCI.hi}% likely range · n=${m.heldRateCI.n}` : null} />
        <StatTile label={group ? "Review rate" : "Follow-through"} value={m.followThroughRate != null ? m.followThroughRate + "%" : "–"} sub={group ? null : (m.dueNow > 0 ? `${m.dueNow} due now` : null)} />
      </div>
      <p style={{ fontFamily: "var(--serif)", fontSize: 12.5, fontStyle: "italic", color: "var(--meta)", margin: "0 0 18px", lineHeight: 1.5 }}>
        Held rate reflects outcomes you chose to record. Recorded outcomes are not a random sample, so read it as your logged track record, not a precise success probability. The range widens when fewer outcomes back it.
      </p>

      <Module kicker="Calibration" delay=".04s">
        <p style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--meta)", margin: "0 0 12px" }}>How often a call held, grouped by the confidence stated at commit. Well-calibrated means higher stated confidence tracks a higher hold rate.</p>
        {m.calibrationReady && m.calibration.length ? m.calibration.map(c => (
          <LBar key={c.band} label={`${c.band} confidence`} pct={c.heldRate != null ? c.heldRate : 0}
            right={c.heldRate != null ? `${c.heldRate}% held · ${c.n}${c.ci ? ` · ${c.ci.lo}–${c.ci.hi}%` : ""}` : `${c.n} recorded, needs 2+`} color={_rateColor(c.heldRate)} />
        )) : <Insufficient msg="Needs 3+ recorded outcomes that carried a stated confidence." />}
      </Module>

      <div style={{ marginTop: 14 }} />
      <Module kicker="Where calls break" delay=".06s">
        {m.breakByCategory ? (() => {
          const tot = Object.values(m.breakByCategory).reduce((s, v) => s + v, 0) || 1;
          return Object.entries(m.breakByCategory).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
            <LBar key={k} label={CAT_LABEL[k] || k} pct={v / tot * 100} right={`${v}`} color="var(--critical)" />
          ));
        })() : <Insufficient msg="Needs 2+ outcomes that partially held or broke, with a tagged assumption." />}
        {m.byType.length > 0 && (
          <div style={{ marginTop: 14, borderTop: "1px solid var(--line-soft)", paddingTop: 12 }}>
            <Kicker style={{ color: "var(--meta)", marginBottom: 10 }}>Hold rate by decision type</Kicker>
            {m.byType.slice(0, 6).map(t => (
              <LBar key={t.type} label={t.type} pct={t.heldRate} right={`${t.heldRate}% · ${t.n}`} color={_rateColor(t.heldRate)} />
            ))}
          </div>
        )}
      </Module>

      <div style={{ marginTop: 14 }} />
      <Module kicker="Outcome record" delay=".08s">
        {m.recorded > 0 ? recordRows.map(r => (
          <LBar key={r.label} label={r.label} pct={m.recorded ? r.n / m.recorded * 100 : 0} right={`${r.n}`} color={r.c} />
        )) : <Insufficient />}
        {m.timeToOutcomeMedian != null && <MetricRow label="Median time to learn" value={`${m.timeToOutcomeMedian} days`} />}
        {!group && <MetricRow label="Awaiting review" value={`${m.pending}${m.dueNow ? ` · ${m.dueNow} due` : ""}`} last />}
      </Module>

      <div style={{ marginTop: 14 }} />
      <Module kicker="Decision style" delay=".1s">
        {m.assumptionMix ? (
          <>
            <Kicker style={{ color: "var(--meta)", marginBottom: 10 }}>Assumption mix</Kicker>
            {["structural", "behavioral", "operational", "external"].map(k => (
              <LBar key={k} label={CAT_LABEL[k]} pct={m.assumptionMix[k]} right={`${m.assumptionMix[k]}%`} color="var(--accent)" />
            ))}
          </>
        ) : <Insufficient msg="Needs 2+ committed decisions to show your assumption mix." />}
        <div style={{ marginTop: 10 }}>
          <MetricRow label="Decision stance" value={`${m.revCounts.Reversible} reversible · ${m.revCounts.Irreversible} one-way`} />
          {m.irrHeldRate != null && <MetricRow label="One-way calls that held" value={`${m.irrHeldRate}%`} />}
          {m.rigorAvg != null && <MetricRow label="Assumption rigor (avg)" value={`${m.rigorAvg} / 100`} />}
          <MetricRow label="Confidence at commit" value={`H ${m.confCounts.High} · M ${m.confCounts.Moderate} · L ${m.confCounts.Limited}`} last />
        </div>
      </Module>

      <div style={{ marginTop: 14 }} />
      <Module kicker="Readiness at commit" delay=".12s">
        {m.readinessAvg != null ? <Meter value={m.readinessAvg} label="Average readiness" /> : <Insufficient msg="Needs 2+ committed decisions carrying a readiness score." />}
        <div style={{ marginTop: 14 }}><Trend series={m.readinessSeries} label="Readiness over time" gid="ready" /></div>
      </Module>

      <div style={{ marginTop: 14 }} />
      <Module kicker="Activity" delay=".14s">
        <Trend series={m.activitySeries} label="Committed per week" gid="act" />
        <div style={{ marginTop: 12 }}>
          <MetricRow label="Clarify / Explore / Commit" value={`${m.modeMix.Clarify} / ${m.modeMix.Explore} / ${m.modeMix.Commit}`} />
          {topTypes.length > 0 && <MetricRow label="Most frequent type" value={`${topTypes[0][0]} (${topTypes[0][1]})`} />}
          {!group && <MetricRow label="Scope split" value={`${m.scopeCounts.work} work · ${m.scopeCounts.personal} personal`} last />}
          {group && <MetricRow label="All decisions here" value="Work-scoped only" last />}
        </div>
      </Module>
    </>
  );
}

// Side-by-side comparison of personal vs work judgment. Headline + key comparative rows.
// Both columns are the user's own data, shown in full; aggregate-only rules apply to the
// separate enterprise Group surface, not here.
function CompareScopesPanel({ personal, work }){
  const P = personal || buildLedgerMetrics([]);
  const W = work || buildLedgerMetrics([]);
  if (P.committed === 0 && W.committed === 0)
    return <EmptyState label="No committed decisions yet. Commit decisions in either scope and the comparison builds here." />;
  const topBreak = m => { if(!m.breakByCategory) return "–"; const e = Object.entries(m.breakByCategory).sort((a,b)=>b[1]-a[1])[0]; return e ? (CAT_LABEL[e[0]]||e[0]) : "–"; };
  const pct = v => v!=null ? v+"%" : "–";
  const rows = [
    ["Committed", P.committed, W.committed],
    ["Outcomes recorded", P.recorded, W.recorded],
    ["Calls that held", pct(P.heldRate), pct(W.heldRate)],
    ["Follow-through", pct(P.followThroughRate), pct(W.followThroughRate)],
    ["Median time to learn", P.timeToOutcomeMedian!=null?P.timeToOutcomeMedian+" days":"–", W.timeToOutcomeMedian!=null?W.timeToOutcomeMedian+" days":"–"],
    ["Most common break", topBreak(P), topBreak(W)],
    ["One-way calls", P.revCounts?P.revCounts.Irreversible:0, W.revCounts?W.revCounts.Irreversible:0],
    ["Assumption rigor (avg)", P.rigorAvg!=null?P.rigorAvg+" / 100":"–", W.rigorAvg!=null?W.rigorAvg+" / 100":"–"],
  ];
  const hdr = { fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.07em", textTransform:"uppercase", color:"var(--meta)", padding:"11px 14px", background:"var(--panel)" };
  const cell = { fontFamily:"var(--serif)", fontSize:14.5, color:"var(--ink2)", padding:"11px 14px", borderTop:"1px solid var(--line-soft)" };
  const num = { ...cell, fontFamily:"var(--mono)", fontSize:13, color:"var(--ink)", textAlign:"right" };
  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto", border:"1px solid var(--line)", borderRadius:11, overflow:"hidden" }}>
        <div style={hdr}>Metric</div>
        <div style={{ ...hdr, textAlign:"right" }}><span style={{ display:"inline-flex", alignItems:"center", gap:4, justifyContent:"flex-end" }}><Lock size={11} />Personal</span></div>
        <div style={{ ...hdr, textAlign:"right" }}><span style={{ display:"inline-flex", alignItems:"center", gap:4, justifyContent:"flex-end" }}><Eye size={11} />Work</span></div>
        {rows.map(r=>(
          <React.Fragment key={r[0]}>
            <div style={cell}>{r[0]}</div>
            <div style={num}>{r[1]}</div>
            <div style={num}>{r[2]}</div>
          </React.Fragment>
        ))}
      </div>
      <p style={{ fontFamily:"var(--serif)", fontSize:13, fontStyle:"italic", color:"var(--meta)", margin:"12px 0 0" }}>Personal decisions stay private to you. Work decisions also contribute aggregate-only signal to group analytics, never their content.</p>
    </>
  );
}

// USER scope — every user, own data, kept separate by work vs personal. Full per-scope
// analytics on Pro; a teaser sample on free and guest.
function StatsView({ metrics, sessions, tier, onUpgrade, pad, reviewHorizonDays }) {
  const all = sessions || [];
  const [scopeView, setScopeView] = React.useState("personal");
  const personalM = React.useMemo(()=> buildLedgerMetrics(all.filter(s=>s.scope!=="work"), reviewHorizonDays), [sessions, reviewHorizonDays]); // eslint-disable-line react-hooks/exhaustive-deps
  const workM = React.useMemo(()=> buildLedgerMetrics(all.filter(s=>s.scope==="work"), reviewHorizonDays), [sessions, reviewHorizonDays]); // eslint-disable-line react-hooks/exhaustive-deps
  const entitled = has(tier, "fullAnalytics");
  if (!metrics && all.length===0) return <EmptyState label="No activity yet. Start a decision and your summary appears here." />;
  const tabs = [["personal","Personal"],["work","Work"],["compare","Compare"]];
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: `36px ${pad}px 120px` }}>
      <div className="wo-in" style={{ marginBottom: 16 }}>
        <Kicker style={{ marginBottom: 10 }}>My patterns</Kicker>
        <h1 style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 26, lineHeight: 1.15, color: "var(--ink)", margin: 0 }}>How you decide, measured</h1>
        <p style={{ fontFamily: "var(--serif)", fontSize: 15.5, lineHeight: 1.55, color: "var(--meta)", margin: "8px 0 0" }}>Work and personal decisions are measured separately. {entitled
          ? "Built from your committed decisions and the outcomes you record. Private to you. Figures appear once there is enough data to be meaningful."
          : "A sample of your record is shown below. Full per-scope analytics (calibration, failure patterns, and trends) is part of Pro."}</p>
      </div>
      <div className="wo-in" style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
        {tabs.map(([k,lab])=>{ const on = scopeView===k; return (
          <button key={k} onClick={()=>setScopeView(k)} className="wo-hover" style={{ fontFamily:"var(--mono)", fontSize:11.5, letterSpacing:"0.03em", color:on?"var(--paper)":"var(--ink2)", background:on?"var(--accent)":"transparent", border:`1px solid ${on?"var(--accent)":"var(--line)"}`, borderRadius:7, padding:"6px 13px", cursor:"pointer" }}>{lab}</button>
        ); })}
      </div>
      {scopeView==="compare"
        ? <div className="wo-in"><CompareScopesPanel personal={personalM} work={workM} /></div>
        : <div className="wo-in"><LedgerPanel m={scopeView==="work"?workM:personalM} scopeMode="personal" locked={!entitled} onUpgrade={onUpgrade} /></div>}
    </div>
  );
}

// ENTERPRISE scope — group aggregate. The privacy wall is the keystone: only counts and
// rates, only from work decisions cleared to aggregate, never a title, content, or row.
// Personal decisions are excluded entirely and never reach this surface.
// Build 11 — Team Ledger Preview (Enterprise).
// Read-only aggregate: counts and rates only. No titles, content, or individual rows.
// Same scope wall as GroupView. Separate surface so the preview is prominently reachable
// from the Team section nav without displacing the existing Group Analytics view.
function TeamLedgerView({ metrics, pad }) {
  const m = metrics || {};
  const committed = m.committed || 0;
  const recorded = m.recorded || 0;
  const heldRate = m.heldRate;
  const heldRateCI = m.heldRateCI;
  const byType = (m.byType || []).slice(0, 5);
  const hasSignal = committed >= 3;
  const Tile = ({ label, value, sub, accent }) => (
    <div style={{ flex: 1, minWidth: 120, background: "var(--edge)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--meta)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 28, color: accent || "var(--ink)", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--meta)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: `36px ${pad || 24}px 120px` }}>
      <div className="wo-in" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <Kicker>Team ledger</Kicker>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--positive)", border: "1px solid var(--positive)", borderRadius: 20, padding: "2px 8px" }}>Enterprise</span>
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 26, lineHeight: 1.15, color: "var(--ink)", margin: "0 0 4px" }}>Team decision track record</h1>
        <p style={{ fontFamily: "var(--serif)", fontSize: 14.5, color: "var(--meta)", margin: 0 }}>Aggregate counts and rates. No individual decisions, titles, or content are visible here.</p>
      </div>
      <div className="wo-in" style={{ marginBottom: 18, display: "flex", gap: 10, alignItems: "flex-start", background: "var(--accent-soft)", border: "1px solid var(--accent)", borderRadius: 8, padding: "12px 14px" }}>
        <Shield size={16} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontFamily: "var(--serif)", fontSize: 13.5, lineHeight: 1.5, color: "var(--ink2)", margin: 0 }}>
          Only confirmed work decisions contribute. Personal decisions are excluded entirely. Counts never carry decision content, titles, or owner identity.
        </p>
      </div>
      {!hasSignal ? (
        <div className="wo-in" style={{ background: "var(--edge)", border: "1px solid var(--line)", borderRadius: 12, padding: "28px 24px", textAlign: "center" }}>
          <Trophy size={28} style={{ color: "var(--meta)", marginBottom: 12 }} />
          <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 18, color: "var(--ink)", marginBottom: 6 }}>Building the ledger</div>
          <p style={{ fontFamily: "var(--serif)", fontSize: 14.5, color: "var(--meta)", margin: "0 auto", maxWidth: 380, lineHeight: 1.5 }}>
            {committed === 0 ? "No confirmed work decisions yet. Commit and confirm scope to start the team ledger." : `${committed} decision${committed!==1?"s":""} committed. ${3 - committed} more needed before aggregate rates appear.`}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <Tile label="Committed" value={committed} />
            <Tile label="Outcomes tracked" value={recorded} sub={recorded < 2 ? "Need 2+ to show rate" : null} />
            <Tile label="Assumptions held" value={heldRate != null ? heldRate + "%" : "–"}
              sub={heldRateCI ? `${heldRateCI.lo}–${heldRateCI.hi}% likely range · n=${heldRateCI.n}` : (recorded >= 2 ? null : "Needs 2+ outcomes")}
              accent={heldRate != null ? (heldRate >= 70 ? "var(--positive)" : heldRate >= 50 ? "var(--caution)" : "var(--critical)") : undefined} />
          </div>
          {byType.length > 0 && (
            <div className="wo-in" style={{ background: "var(--edge)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px", marginBottom: 14 }}>
              <Kicker style={{ marginBottom: 12 }}>Hold rate by decision type</Kicker>
              {byType.map((row, i) => (
                <div key={row.type} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < byType.length - 1 ? 10 : 0 }}>
                  <span style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--ink2)", flex: 1 }}>{row.type}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, letterSpacing: "0.04em", color: "var(--meta)" }}>n={row.n}</span>
                  <span style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 15, color: row.heldRate >= 70 ? "var(--positive)" : row.heldRate >= 50 ? "var(--caution)" : "var(--critical)" }}>{row.heldRate}%</span>
                </div>
              ))}
            </div>
          )}
          <p className="wo-in" style={{ fontFamily: "var(--serif)", fontSize: 12.5, fontStyle: "italic", color: "var(--meta)", margin: "4px 0 0", lineHeight: 1.5 }}>
            In this sandbox, aggregates reflect work decisions from seats connected to this account. Connecting additional seats expands the counts. The scope boundary above is fixed regardless of scale.
          </p>
        </>
      )}
    </div>
  );
}

function GroupView({ metrics, seats, pad }) {
  const m = metrics;
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: `36px ${pad}px 120px` }}>
      <div className="wo-in" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Kicker>Group analytics</Kicker>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--positive)", border: "1px solid var(--positive)", borderRadius: 20, padding: "2px 8px" }}>Enterprise</span>
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 26, lineHeight: 1.15, color: "var(--ink)", margin: "8px 0 0" }}>Decision quality across the group</h1>
      </div>
      <div className="wo-in" style={{ marginBottom: 18, display: "flex", gap: 10, alignItems: "flex-start", background: "var(--accent-soft)", border: "1px solid var(--accent)", borderRadius: 8, padding: "12px 14px" }}>
        <Shield size={16} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontFamily: "var(--serif)", fontSize: 13.5, lineHeight: 1.5, color: "var(--ink2)", margin: 0 }}>
          Aggregate only. Personal decisions are excluded and never visible here. No titles, contents, or individual rows cross this boundary. A decision contributes once it is classified work at high confidence or confirmed by its owner.
        </p>
      </div>
      {(!m || m.committed === 0) ? (
        <div className="wo-in"><LedgerPanel m={m} scopeMode="group" /></div>
      ) : (
        <>
          <div className="wo-in"><LedgerPanel m={m} scopeMode="group" /></div>
          <p className="wo-in" style={{ fontFamily: "var(--serif)", fontSize: 12.5, fontStyle: "italic", color: "var(--meta)", margin: "16px 0 0", lineHeight: 1.5 }}>
            No additional seats are connected in this sandbox, so these aggregates reflect the work decisions on this seat. Connecting more seats expands the same counts and rates. The boundary above does not change with scale.
          </p>
        </>
      )}
    </div>
  );
}

// SITE scope — admins now, read-only marketing/viewer later. Gated by role at the
// call site; this component also shows the active role and a read-only note for
// non-admins. Table summary for now; off-host this reads a windowed rollup.
function SiteView({ metrics, analytics, role, canEdit, pad }) {
  const m = metrics;
  const a = analytics;

  // Growth funnel (unchanged).
  const funnel = m ? [
    ["Shares", String(m.shareCreated)],
    ["Opens", String(m.shareOpened)],
    ["Creates", String(m.createFromShare)],
    ["K-factor", String(m.kFactor)],
  ] : [];
  const loopRow = (name, l) => [name, l ? `share ${l.created} / open ${l.opened} / create ${l.made} · K ${l.kFactor}` : "–"];

  // Tier rollups.
  const usersByTier = (a && a.usersByTier) || [];
  const subsByTier = (a && a.subscriptionsByTier) || [];
  const tokensByTier = (a && a.tokenUsageByTier) || [];
  const totalUsers = usersByTier.reduce((s, r) => s + (Number(r.count) || 0), 0);
  const totalActiveSubs = subsByTier.reduce((s, r) => s + (Number(r.active) || 0), 0);

  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:`36px ${pad}px 120px` }}>
      <div className="wo-in" style={{ marginBottom:18 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <Kicker>Site metrics</Kicker>
          <span style={{ fontFamily:"var(--mono)", fontSize:10, fontWeight:500, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--accent)", border:"1px solid var(--accent)", borderRadius:20, padding:"2px 8px" }}>{role}{canEdit?"":" · read only"}</span>
        </div>
        <h1 style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:26, lineHeight:1.15, color:"var(--ink)", margin:"8px 0 0" }}>Operator analytics</h1>
        <p style={{ fontFamily:"var(--serif)", fontSize:13.5, fontStyle:"italic", color:"var(--meta)", margin:"8px 0 0" }}>Tier rollups are server truth, read through the admin RPC. The growth funnel below is a lifetime sandbox estimate, not yet windowed. Access shown here is a UI affordance; enforcement is server-side.</p>
      </div>

      {/* ── TIER ROLLUPS ──────────────────────────────────────────────────── */}
      {!a ? (
        <EmptyState label="Server analytics are not connected on this host. Wire setSiteSource() to the admin RPC to load tier rollups." />
      ) : (
        <>
          <Module kicker="Users by tier" delay=".05s">
            {usersByTier.length === 0
              ? <MetricRow label="No users recorded" value="–" last />
              : usersByTier.map((r, i) => (
                  <MetricRow key={r.tier} label={r.tier} value={_fmtInt(r.count)} last={i === usersByTier.length - 1} />
                ))}
            {usersByTier.length > 0 && <MetricRow label="Total" value={_fmtInt(totalUsers)} last />}
          </Module>

          <div style={{ marginTop:16 }}>
            <Module kicker="Active subscriptions by tier" delay=".1s">
              {subsByTier.length === 0
                ? <MetricRow label="No subscriptions recorded" value="–" last />
                : subsByTier.map((r, i) => {
                    const extra = [];
                    if (r.trialing) extra.push(`${r.trialing} trial`);
                    if (r.pastDue) extra.push(`${r.pastDue} past due`);
                    if (r.canceled) extra.push(`${r.canceled} canceled`);
                    const value = extra.length ? `${_fmtInt(r.active)} active · ${extra.join(" · ")}` : `${_fmtInt(r.active)} active`;
                    return <MetricRow key={r.tier} label={r.tier} value={value} last={i === subsByTier.length - 1} />;
                  })}
              {subsByTier.length > 0 && <MetricRow label="Total active" value={_fmtInt(totalActiveSubs)} last />}
            </Module>
          </div>

          {/* v111: raw token usage is admin-only. The RPC also gates this behind */}
          {/* is_admin(); this client check is the matching affordance, not the control. */}
          {role === "admin" && (
            <>
              <div style={{ marginTop:16 }}>
                <Module kicker="Token usage by tier · trailing 30d" delay=".15s">
                  {tokensByTier.length === 0
                    ? <MetricRow label="No usage recorded" value="–" last />
                    : tokensByTier.map((r, i) => (
                        <MetricRow
                          key={r.tier}
                          label={r.tier}
                          value={`${_fmtTokens(r.totalTokens30d)} tok · ${_fmtInt(r.requests30d)} req`}
                          last={i === tokensByTier.length - 1}
                        />
                      ))}
                </Module>
              </div>

              {tokensByTier.length > 0 && (
                <div style={{ marginTop:16 }}>
                  <Module kicker="Token usage by tier · lifetime" delay=".2s">
                    {tokensByTier.map((r, i) => (
                      <MetricRow
                        key={r.tier}
                        label={r.tier}
                        value={`in ${_fmtTokens(r.inputTokensLifetime)} / out ${_fmtTokens(r.outputTokensLifetime)}`}
                        last={i === tokensByTier.length - 1}
                      />
                    ))}
                  </Module>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── GROWTH FUNNEL (existing) ──────────────────────────────────────── */}
      <div style={{ marginTop: a ? 28 : 16 }}>
        {!m ? <EmptyState label="No site activity recorded yet." /> : (
          <>
            <Module kicker="Combined funnel" delay=".25s">
              {funnel.map((r,i)=>(<MetricRow key={i} label={r[0]} value={r[1]} last={i===funnel.length-1} />))}
            </Module>
            <div style={{ marginTop:16 }}>
              <Module kicker="By loop" delay=".3s">
                {[loopRow("Decision loop", m.doc), loopRow("Framework loop", m.framework), ...(m.card ? [loopRow("Card loop", m.card)] : []), ...(m.legacy && (m.legacy.created||m.legacy.opened||m.legacy.made) ? [["Legacy (unattributed)", `share ${m.legacy.created} / open ${m.legacy.opened} / create ${m.legacy.made}`]] : [])]
                  .map((r,i,arr)=>(<MetricRow key={i} label={r[0]} value={r[1]} last={i===arr.length-1} />))}
              </Module>
            </div>
            {m.funnel && (
              <div style={{ marginTop:16 }}>
                <Module kicker="Upgrade triggers" delay=".35s">
                  <MetricRow label="Cap blocks" value={String(m.funnel.capBlock)} />
                  <MetricRow label="Insight locks" value={String(m.funnel.insightLock)} />
                  <MetricRow label="Upgrade pressure (equal weight)" value={String(m.funnel.upgradePressure)} last />
                </Module>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AdvancedView({ intel, profile, overlay, running, options, signalInfo, role, setRole, onRunAll, onRunDep, onRunFail, onRunBench, onOverlay, attached, contradiction, onContradiction, narrow, pad, loopMetrics, hasProfile, onBack }) {
  const dep = intel && intel.dependencies;
  const fail = intel && intel.failure;
  const bench = intel && intel.benchmark;
  const showBench = bench && bench.calibratedConfidence >= 60;
  const od = overlay && overlay.data;
  const runLabel = (k, base) => running===k ? "Running…" : base;
  const BackToChat = ({ mt }) => (
    <button onClick={onBack} className="wo-hover" style={{ display:"inline-flex", alignItems:"center", gap:7, marginTop:mt||0, background:"transparent", border:"1px solid var(--line)", borderRadius:6, padding:"8px 13px", cursor:"pointer", fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.04em", color:"var(--ink2)" }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--ink)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--line)"; e.currentTarget.style.color="var(--ink2)"; }}>
      <ArrowLeft size={14} /> Back to Clarify
    </button>
  );
  return (
    <div style={{ maxWidth:880, margin:"0 auto", padding:`36px ${pad}px 120px` }}>
      <div className="wo-in" style={{ marginBottom:18 }}><BackToChat /></div>
      {loopMetrics && (loopMetrics.shareCreated>0 || loopMetrics.shareOpened>0) && (
        <div className="wo-in" style={{ marginBottom:18, background:"var(--edge)", border:"1px solid var(--line)", borderRadius:7, padding:"12px 16px" }}>
          <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"center" }}>
            <Kicker>Loop A</Kicker>
            <span style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--ink2)" }}>Shares {loopMetrics.shareCreated}</span>
            <span style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--ink2)" }}>Opens {loopMetrics.shareOpened}</span>
            <span style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--ink2)" }}>Creates {loopMetrics.createFromShare}</span>
            <span style={{ fontFamily:"var(--mono)", fontSize:12, fontWeight:500, color:"var(--accent)" }}>K {loopMetrics.kFactor}</span>
          </div>
          <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"center", marginTop:8 }}>
            <span style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--meta)" }}>Decision loop · share {loopMetrics.doc.created} / open {loopMetrics.doc.opened} / create {loopMetrics.doc.made} · K {loopMetrics.doc.kFactor}</span>
            <span style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--meta)" }}>Framework loop · share {loopMetrics.framework.created} / open {loopMetrics.framework.opened} / create {loopMetrics.framework.made} · K {loopMetrics.framework.kFactor}</span>
            {loopMetrics.card && (loopMetrics.card.created>0 || loopMetrics.card.opened>0 || loopMetrics.card.made>0) && (
              <span style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--meta)" }}>Card loop · share {loopMetrics.card.created} / open {loopMetrics.card.opened} / create {loopMetrics.card.made} · K {loopMetrics.card.kFactor}</span>
            )}
            {loopMetrics.legacy && (loopMetrics.legacy.created>0 || loopMetrics.legacy.opened>0 || loopMetrics.legacy.made>0) && (
              <span style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--meta)" }}>Legacy (unattributed) · share {loopMetrics.legacy.created} / open {loopMetrics.legacy.opened} / create {loopMetrics.legacy.made}</span>
            )}
          </div>
          <p style={{ fontFamily:"var(--serif)", fontSize:12, fontStyle:"italic", color:"var(--meta)", margin:"8px 0 0" }}>Lifetime sandbox estimate. Counts are cumulative and shared across users, not a windowed product metric. Legacy events predate per-loop tagging and count in the combined totals only.</p>
        </div>
      )}
      <div className="wo-in" style={{ marginBottom:22 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <Kicker>Advanced · Decision Intelligence</Kicker>
          <span style={{ fontFamily:"var(--mono)", fontSize:10, fontWeight:500, letterSpacing:"0.14em", color:"var(--accent)", border:"1px solid var(--accent)", borderRadius:20, padding:"2px 8px" }}>PRO</span>
        </div>
        <h1 style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:28, lineHeight:1.1, color:"var(--ink)", margin:"0 0 8px" }}>Pressure-test the decision</h1>
        <p style={{ fontFamily:"var(--serif)", fontSize:16.5, lineHeight:1.55, color:"var(--meta)", margin:"0 0 14px", maxWidth:560 }}>
          Run the intelligence layer against the live thread and document. Each call is real; results reflect the current decision context.</p>
        <div style={{ display:"flex", gap:"8px 20px", flexWrap:"wrap", alignItems:"center", marginBottom:18 }}>
          <span style={{ display:"flex", alignItems:"center", gap:7 }}><Lead>Mode</Lead><ModeTag mode={signalInfo.mode} /></span>
          <span style={{ display:"flex", alignItems:"center", gap:7 }}><Lead>Reasoning</Lead>{signalInfo.reasoning ? <Dot color={confColor(signalInfo.reasoning)} label={signalInfo.reasoning} /> : <Body2 style={{ fontSize:14 }}>–</Body2>}</span>
          <span style={{ display:"flex", alignItems:"center", gap:7 }}><Lead>Turns</Lead><Body2 style={{ fontSize:14 }}>{signalInfo.turns}</Body2></span>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <PrimaryBtn onClick={onRunAll} disabled={!!running}>{runLabel("all","Run full analysis")}<span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.06em", color:"var(--paper)", opacity:0.75, marginLeft:6 }}>{CREDIT_COSTS.fullIntelligenceRun} credits</span></PrimaryBtn>
          <GhostBtn onClick={onRunDep}>{runLabel("dep","Dependencies")}<span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.06em", color:"var(--meta)", marginLeft:6 }}>{CREDIT_COSTS.dependencyMap} credits</span></GhostBtn>
          <GhostBtn onClick={onRunFail}>{runLabel("fail","Failure simulation")}<span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.06em", color:"var(--meta)", marginLeft:6 }}>{CREDIT_COSTS.failureSimulation} credits</span></GhostBtn>
          <GhostBtn onClick={onRunBench}>{runLabel("bench","Benchmark")}<span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.06em", color:"var(--meta)", marginLeft:6 }}>{CREDIT_COSTS.benchmark} credits</span></GhostBtn>
        </div>
      </div>

      <div style={{ marginTop:16 }}>
        <Module kicker="Pressure-test (overlays)" span delay=".28s">
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginBottom:16 }}>
            <GhostBtn accent="var(--accent)" onClick={()=>onOverlay("battle")}>{runLabel("battle","⚔ Decision Battle")}<span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.06em", color:"var(--meta)", marginLeft:6 }}>{CREDIT_COSTS.decisionStressTest} credits</span></GhostBtn>
            <GhostBtn accent="var(--critical)" onClick={()=>onOverlay("challenge")}>{runLabel("challenge","⚡ Challenge this")}<span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.06em", color:"var(--meta)", marginLeft:6 }}>{CREDIT_COSTS.decisionStressTest} credits</span></GhostBtn>
            <GhostBtn accent="var(--slate)" onClick={()=>onOverlay("perspective")}>{runLabel("perspective","◳ Perspective")}<span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.06em", color:"var(--meta)", marginLeft:6 }}>{CREDIT_COSTS.multiPerspectiveReview} credits</span></GhostBtn>
            <select value={role} onChange={e=>setRole(e.target.value)} style={{ fontFamily:"var(--mono)", fontSize:13, color:"var(--ink2)", background:"var(--edge)", border:"1px solid var(--line)", borderRadius:4, padding:"10px 12px", minHeight:44 }}>
              {["CEO","CFO","Investor","Customer","Operator","Competitor"].map(r=>(<option key={r} value={r}>{r}</option>))}
            </select>
            {options.length<2 && <span style={{ fontFamily:"var(--serif)", fontSize:14, fontStyle:"italic", color:"var(--meta)" }}>Battle needs two or more options in the thread.</span>}
          </div>
          {overlay && overlay.error && hint("Overlay could not be produced. Try again once there is more context.")}
          {od && overlay.kind==="battle" && (
            <div style={{ background:"var(--paper)", border:"1px solid var(--line)", borderRadius:6, padding:"16px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:10, marginBottom:10 }}>
                <span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:17, color:"var(--ink)" }}>Winner: {od.winner}</span>
                {od.confidence && <Dot color={confColor(od.confidence)} label={od.confidence} />}
              </div>
              {od.winnerRationale && <Body2 style={{ marginBottom:12 }}>{od.winnerRationale}</Body2>}
              <div style={{ display:"grid", gridTemplateColumns:narrow?"1fr":"1fr 1fr", gap:14 }}>
                {(od.options||[]).map((o,i)=>(
                  <div key={i}><Lead>{o.name}</Lead><ListBlock label="Strengths" items={o.strengths} color="var(--positive)" /><ListBlock label="Weaknesses" items={o.weaknesses} color="var(--critical)" /></div>
                ))}
              </div>
              <ListBlock label="Key tradeoffs" items={od.keyTradeoffs} color="var(--caution)" />
              <ListBlock label="Evidence gaps" items={od.evidenceGaps} color="var(--meta)" />
            </div>
          )}
          {od && overlay.kind==="challenge" && (
            <div style={{ background:"var(--paper)", border:"1px solid var(--line)", borderRadius:6, padding:"16px 18px" }}>
              <Lead color="var(--critical)">Strongest case against</Lead><Body2 style={{ marginTop:6, marginBottom:14, color:"var(--ink)" }}>{od.strongestCounterargument}</Body2>
              <Lead>Most vulnerable assumption</Lead><Body2 style={{ marginTop:6, marginBottom:14 }}>{od.mostVulnerableAssumption}</Body2>
              <Lead>Highest-risk scenario</Lead><Body2 style={{ marginTop:6, marginBottom:14 }}>{od.highestRiskScenario}</Body2>
              <ListBlock label="Evidence that would resolve it" items={od.additionalEvidenceNeeded} color="var(--slate)" />
            </div>
          )}
          {od && overlay.kind==="perspective" && (
            <div style={{ background:"var(--paper)", border:"1px solid var(--line)", borderRadius:6, padding:"16px 18px" }}>
              <Lead color="var(--accent)">{od.role} perspective</Lead>
              <div style={{ marginTop:10 }}>
                <ListBlock label="Priorities" items={od.priorities} color="var(--positive)" />
                <ListBlock label="Objections" items={od.objections} color="var(--critical)" />
                <ListBlock label="Risks others miss" items={od.additionalRisks} color="var(--caution)" />
                <ListBlock label="Questions before approving" items={od.questions} color="var(--slate)" />
              </div>
            </div>
          )}
        </Module>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: narrow ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))", gap:16, marginTop:16 }}>
        <Module kicker="Dependencies" pro delay=".08s">
          {dep ? (<>
            <ListBlock label="Upstream" items={dep.upstream} color="var(--slate)" />
            <ListBlock label="Downstream" items={dep.downstream} color="var(--positive)" />
            <ListBlock label="Blockers" items={dep.blockers} color="var(--critical)" />
            <ListBlock label="Generated decisions" items={dep.generatedDecisions} color="var(--caution)" />
            {!dep.upstream.length && !dep.downstream.length && !dep.blockers.length && !dep.generatedDecisions.length && hint("No dependencies surfaced from the current context.")}
          </>) : hint("Not run yet. Use Dependencies or Run full analysis.")}
        </Module>

        <Module kicker="Failure simulation" pro delay=".12s">
          {fail ? (<>
            {fail.scenarios.map((s,i)=>(
              <div key={i} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, marginBottom:4 }}>
                  <span style={{ fontFamily:"var(--serif)", fontSize:16, fontWeight:500, color:"var(--ink)" }}>{s.title}</span>
                  <Dot color={pImpColor(s.impact)} label={`${s.probability||"?"} · ${s.impact||"?"}`} />
                </div>
                {s.what && <Body2 style={{ fontSize:15 }}>{s.what}</Body2>}
                {s.mitigation && <Body2 style={{ fontSize:14.5, marginTop:4, color:"var(--meta)" }}>Mitigation: {s.mitigation}</Body2>}
              </div>
            ))}
            {fail.topDrivers && fail.topDrivers.length>0 && (<><Rule color="var(--line-soft)" style={{ margin:"6px 0 10px" }} /><Lead>Top drivers</Lead><Body2 style={{ marginTop:5, fontSize:15 }}>{fail.topDrivers.map(d=>d.title).join(" · ")}</Body2></>)}
          </>) : hint("Not run yet. Use Failure simulation or Run full analysis.")}
        </Module>

        <Module kicker="Benchmark" pro delay=".16s">
          {bench ? (showBench ? (<>
            <Body2 style={{ marginBottom:10, color:"var(--ink)" }}>{bench.benchmarkSummary}</Body2>
            <Body2 style={{ fontSize:14.5, color:"var(--meta)", marginBottom:10 }}>{bench.comparableCases} comparable cases · {bench.calibratedConfidence}% calibrated</Body2>
            <ListBlock label="Common outcomes" items={bench.commonOutcomes} color="var(--slate)" />
            <ListBlock label="Success factors" items={bench.successFactors} color="var(--positive)" />
            <ListBlock label="Common mistakes" items={bench.commonMistakes} color="var(--critical)" />
          </>) : hint(`Calibrated confidence ${bench.calibratedConfidence}%, below the 60% bar to show a benchmark. The decision may be too novel for reliable comparison.`)) : hint("Not run yet. Use Benchmark or Run full analysis.")}
        </Module>

        <Module kicker="Decision profile" pro delay=".2s">
          {profile && profile.length ? (
            profile.map((row,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"7px 0", borderBottom:i<profile.length-1?"1px solid var(--line-soft)":"none" }}>
                <Lead>{row.label}</Lead>
                <span style={{ fontFamily:"var(--serif)", fontSize:15.5, color:"var(--ink)" }}>{row.value}</span>
              </div>
            ))
          ) : hint("No profile yet. It builds as you commit decisions across sessions.")}
        </Module>
      </div>

      <div style={{ marginTop:16 }}>
        <Module kicker="Cross-session context" span delay=".24s" pro>
          {attached && attached.length>0 ? (<>
            {attached.map((a,i)=>(
              <div key={i} style={{ padding:"9px 0", borderBottom:i<attached.length-1?"1px solid var(--line-soft)":"none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:3 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--accent)", flexShrink:0 }} />
                  <span style={{ fontFamily:"var(--serif)", fontSize:16, color:"var(--ink)" }}>{a.session.title}</span>
                  {a.isStale && <span style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--caution)", letterSpacing:"0.08em" }}>OLDER</span>}
                </div>
                <Body2 style={{ fontSize:14, color:"var(--meta)" }}>{a.matchReason}</Body2>
              </div>
            ))}
            <Body2 style={{ fontSize:13.5, color:"var(--meta)", marginTop:10, fontStyle:"italic" }}>Attached as background context on each turn. Current-session facts always override prior context.</Body2>
          </>) : hint("No related prior sessions for this decision yet. As you commit more decisions, matches surface here automatically.")}
        </Module>
      </div>

      <div style={{ marginTop:16 }}>
        <Module kicker="Cross-session contradiction" span delay=".26s" pro>
          <div style={{ marginBottom:14 }}>
            <GhostBtn accent="var(--critical)" onClick={onContradiction}>{running==="contradiction"?"Checking…":"Check for contradictions"}</GhostBtn>
          </div>
          {contradiction && contradiction.conflicts && contradiction.conflicts.length>0 ? (
            contradiction.conflicts.map((c,i)=>(
              <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:i<contradiction.conflicts.length-1?"1px solid var(--line-soft)":"none" }}>
                <span style={{ width:8, height:8, borderRadius:"50%", marginTop:7, flexShrink:0, background: c.severity==="high"?"var(--critical)":c.severity==="moderate"?"var(--caution)":"var(--slate)" }} />
                <div><Body2 style={{ color:"var(--ink)" }}>{c.tension}</Body2><Body2 style={{ fontSize:13.5, color:"var(--meta)", marginTop:3 }}>vs {c.priorSession} · {c.severity}</Body2></div>
              </div>
            ))
          ) : contradiction ? hint("No material contradiction found against the attached prior sessions.") : hint("Checks the current decision against attached prior sessions for genuine conflicts. Needs at least one related session.")}
        </Module>
      </div>

      <div className="wo-in" style={{ marginTop:4, borderTop:"1px solid var(--line-soft)", paddingTop:20, display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
        <BackToChat />
        <span style={{ fontFamily:"var(--serif)", fontSize:13, fontStyle:"italic", color:"var(--meta)" }}>Intelligence results stay attached to this decision when you return.</span>
      </div>
    </div>
  );
}


// ============================================================================
// v72 UI LAYER — new design, IA, tiers, and gaming, wired to the real engine.
// Reuses the kept primitives (Kicker, Rule) and the real data views
// (SessionView, DocumentView, CardView, StatsView, SiteView, AdvancedView).
// ============================================================================

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Spline+Sans+Mono:wght@400;500;600&display=swap');

html, body, #root{ margin:0; padding:0; height:100%; width:100%; }
body{ overflow:hidden; }
.wo, .wo *{ box-sizing:border-box; -webkit-font-smoothing:antialiased; }
@media (max-width:820px){ .wo-grid{ grid-template-columns:1fr !important; } }
.wo{ --display:'Open Sans',system-ui,-apple-system,sans-serif; --serif:'Open Sans',system-ui,-apple-system,sans-serif; --mono:'Spline Sans Mono',ui-monospace,monospace; }
.wo[data-theme="paper"]{
  --bg:#ECE6D9; --paper:#F7F3EA; --edge:#FFFFFF; --panel:#F1ECE0;
  --ink:#1A1C18; --ink2:#42473F; --meta:#5A6353;
  --line:#DCD9CC; --line-soft:#E8E5D8;
  --accent:#247A3C; --accent-soft:#247A3C18; --brand:#2E9E4E;
  --positive:#2F7A45; --caution:#9A6A1C; --critical:#9A382C; --slate:#4E6B82;
  --grain:0.025;
  --input-bg:#FFFFFF; --input-border:#A8A59A; --input-focus-border:#247A3C;
}
.wo[data-theme="ink"]{
  --bg:#0E0F0C; --paper:#15160F; --edge:#1C1D15; --panel:#191A12;
  --ink:#ECEEDF; --ink2:#BEC2AE; --meta:#888E78;
  --line:#2A2C20; --line-soft:#222418;
  --accent:#5CC078; --accent-soft:#5CC07822; --brand:#3FB05E;
  --positive:#6FC089; --caution:#D6A95C; --critical:#D58C7F; --slate:#88A6BE;
  --grain:0.05;
  --input-bg:#2C2E24; --input-border:#555849; --input-focus-border:#5CC078;
}
.wo ::selection{ background:var(--accent-soft); }
.wo *:focus-visible{ outline:none; box-shadow:0 0 0 2px var(--paper),0 0 0 4px var(--accent); border-radius:3px; }
.wo-in{ opacity:0; transform:translateY(8px); animation:woIn .55s cubic-bezier(.2,.7,.2,1) forwards; }
.wo, .wo input, .wo textarea{ direction:ltr; }
.wo input, .wo textarea{ text-align:left; unicode-bidi:plaintext; }
.wo input:focus, .wo textarea:focus{ border-color:var(--input-focus-border) !important; box-shadow:0 0 0 3px var(--accent-soft); }
@keyframes woIn{ to{ opacity:1; transform:none; } }
@keyframes woFade{ from{opacity:0;} to{opacity:1;} }
@keyframes woSlide{ from{transform:translateX(-100%);} to{transform:none;} }
@keyframes woUp{ from{transform:translateY(100%);} to{transform:none;} }
@keyframes woCaret{ 0%,100%{opacity:1;} 50%{opacity:0;} }
@keyframes woPulse{ 0%,100%{opacity:.5;} 50%{opacity:1;} }
@keyframes woGlow{ 0%,100%{box-shadow:0 0 0 0 var(--accent-soft);} 50%{box-shadow:0 0 0 6px transparent;} }
.wo-sc::-webkit-scrollbar{ width:10px; height:10px; }
.wo-sc::-webkit-scrollbar-thumb{ background:var(--line); border-radius:8px; border:3px solid transparent; background-clip:content-box; }
.wo-sc::-webkit-scrollbar-track{ background:transparent; }
.wo-grain{ position:absolute; inset:0; pointer-events:none; opacity:var(--grain); mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
.wo-hover{ transition:border-color .18s, color .18s, background .18s, transform .18s; }
.wo-card-hover:hover{ transform:translateY(-2px); border-color:var(--accent); }

@media (prefers-reduced-motion: reduce){
  .wo *, .wo *::before, .wo *::after{
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
  .wo-in{ opacity:1 !important; transform:none !important; }
}
`;

// ── TIER MODEL ────────────────────────────────────────────────────────────────
const TIERS = {
  free:       { name:"Free",       color:"var(--slate)",    rank:1 },
  starter:    { name:"Starter",    color:"var(--ink2)",     rank:2 },
  pro:        { name:"Pro",        color:"var(--accent)",   rank:3 },
  enterprise: { name:"Enterprise", color:"var(--positive)", rank:4 },
};
const FEATURE_MIN = {
  // rank 1 — Free: core habit loop, Markdown export, capped uploads
  library:1, profile:1, shareStructure:1, exportMd:1, fullAnalytics:1, upload:1,
  // rank 2 — Starter: steady usage, full exports (HTML/TXT/PDF), no intelligence layer
  shareFull:2, exportHtml:2, exportTxt:2, exportPdf:2,
  // rank 3 — Pro: full intelligence + insights
  advancedTools:3, conflictCheck:3, insights:3,
  // rank 4 — Enterprise: team + admin surfaces
  team:4, siteMetrics:4, growthLoops:4,
};
// v102 entitlement mapping (guest=0, free=1, starter=2, pro=3, enterprise=4):
//   Guest  : nothing here — no save/library, no exports, no uploads, no advanced.
//   Free   : library + Markdown export + 1 capped upload/session. No HTML/TXT/PDF,
//            no advanced intelligence.
//   Starter: + HTML/TXT/PDF export, full share. No advanced intelligence.
//   Pro    : + advanced intelligence, insights, conflict detection.
// v102: exportTxt and exportPdf moved from the advancedTools (Pro) gate to rank 2 so
// Starter gets all standard export formats, per the cost-control plan shaping.
// Custom template creation was removed in v101 (buggy / low ROI) and is intentionally
// NOT reintroduced here, so there is no customStructures gate.
const has = (tier, feature) => (TIERS[tier] ? TIERS[tier].rank : 0) >= (FEATURE_MIN[feature] || 0);

// v102: Team is deferred until after single-user beta (targeted month 6). This flag
// keeps every Team surface (nav cluster, Team views) off until it flips, so Team is
// never pushed or sold prematurely. Team policy assumptions live in TIER_POLICY.team
// and INTELLIGENCE_CREDIT_POLICY.team, ready for that launch. Do not enable here.
// TODO(month-6): flip TEAM_ENABLED and add the Team plan card + seat management.
const TEAM_ENABLED = false;

// ============================================================================
// v113 WORKSPACE + METERING SEAMS (build-now, launch-later)
// Gated entirely by TEAM_ENABLED (false). Personal behavior is unchanged: the
// active workspace is Personal, the orgId stamp is null, emission is a no-op,
// ledger reads stay local, and the metering scope is "" so counter keys are
// byte-identical to v112. Launch is binding swaps plus the flag, no refactor.
// ============================================================================

// ── Metering scope (org dimension on the usage counters) ─────────────────────
let _ACTIVE_METERING_SCOPE = "";
function setActiveMeteringScope(workspace) {
  _ACTIVE_METERING_SCOPE = (workspace && workspace.orgId) ? ("org:" + workspace.orgId + ":") : "";
}
function meteringScope() { return _ACTIVE_METERING_SCOPE; }

// ── Workspace identity ────────────────────────────────────────────────────────
const PERSONAL_WORKSPACE = { id: "personal", orgId: null, name: "Personal", role: "owner" };
const WORKSPACE_KEY = "wo:workspace:active";
// v113.2: stable empty-memberships reference. While Team is deferred, the App passed a
// fresh [] literal each render, which changed useWorkspace's useMemo([memberships]) and
// its [list] effect identity every render — a redundant store.get and a new
// switchWorkspace identity per render. A module const fixes the identity. At launch this
// is replaced by the server-fed org_members rows (which then have a stable source ref).
const NO_TEAM_MEMBERSHIPS = [];

function listWorkspaces(memberships) {
  const orgs = (memberships || [])
    .filter(m => m && m.status === "active")
    .map(m => ({ id: "org:" + m.org_id, orgId: m.org_id, name: m.org_name || "Team", role: m.role || "member" }));
  return [PERSONAL_WORKSPACE, ...orgs];
}

function useWorkspace(memberships) {
  const list = React.useMemo(() => listWorkspaces(memberships), [memberships]);
  const [active, setActive] = React.useState(PERSONAL_WORKSPACE);
  const activeRef = React.useRef(PERSONAL_WORKSPACE);
  const _set = (w) => { activeRef.current = w; setActive(w); setActiveMeteringScope(w); };

  React.useEffect(() => {
    let live = true;
    (async () => {
      let id = PERSONAL_WORKSPACE.id;
      try { const r = await store.get(WORKSPACE_KEY); if (r && r.value) id = r.value; } catch (_) {}
      if (!live) return;
      _set(list.find(w => w.id === id) || PERSONAL_WORKSPACE);
    })();
    return () => { live = false; };
  }, [list]);

  const switchWorkspace = React.useCallback(async (id) => {
    const next = list.find(w => w.id === id) || PERSONAL_WORKSPACE;
    _set(next);
    try { await store.set(WORKSPACE_KEY, next.id); } catch (_) {}
  }, [list]);

  return { workspaces: list, activeWorkspace: active, activeWorkspaceRef: activeRef, switchWorkspace };
}

// ── Commit stamp ────────────────────────────────────────────────────────────
function workspaceStampForCommit(activeWorkspace) {
  return { orgId: (activeWorkspace && activeWorkspace.orgId) || null };
}

// ── Decision-event emission seam ──────────────────────────────────────────────
let EMIT_DECISION_EVENT = async (_evt) => null;

function buildDecisionEvent(meta) {
  const ds = meta || {};
  return {
    decisionId: ds.id,
    orgId: ds.orgId || null,
    workScoped: ds.scope === "work" && (ds.scopeConfidence === "high" || ds.scopeConfirmed === true),
    committedAt: ds.committedAt || null,
    reviewHorizonDays: ds.reviewHorizonDays || null,
    reviewDueAt: ds.reviewDueAt || null,
    outcome: ds.outcome || null,
    trackedAssumptions: ds.loadBearingAssumption ? 1 : 0,
  };
}

async function emitDecisionEvent(meta) {
  try { return await EMIT_DECISION_EVENT(buildDecisionEvent(meta)); }
  catch (_) { return null; }
}

// ── Ledger read seam ──────────────────────────────────────────────────────────
let READ_ORG_LEDGER = null;

async function readWorkspaceLedger(workspace, sessions, horizonDays) {
  const orgId = (workspace && workspace.orgId) || null;
  if (orgId && READ_ORG_LEDGER) {
    return await READ_ORG_LEDGER(orgId);
  }
  const scoped = (sessions || []).filter(s =>
    metaAggregateEligible(s) && ((s.orgId || null) === orgId)
  );
  return buildLedgerMetrics(scoped, horizonDays);
}

function useWorkspaceLedger(activeWorkspace, sessions, horizonDays) {
  const [metrics, setMetrics] = React.useState(() => buildLedgerMetrics([], horizonDays));
  React.useEffect(() => {
    let live = true;
    (async () => {
      const m = await readWorkspaceLedger(activeWorkspace, sessions, horizonDays);
      if (live) setMetrics(m);
    })();
    return () => { live = false; };
  }, [activeWorkspace, sessions, horizonDays]);
  return metrics;
}

// ── Effective-tier seam ───────────────────────────────────────────────────────
let RESOLVE_TIER = async (individualTier) => individualTier;
async function resolveEffectiveTier(individualTier, memberships) {
  try { return await RESOLVE_TIER(individualTier, memberships); }
  catch (_) { return individualTier; }
}

// ── Workspace switcher (gated, renders null until TEAM_ENABLED flips) ─────────
function WorkspaceSwitcher({ workspaces, activeWorkspace, onSwitch }) {
  if (!TEAM_ENABLED) return null;
  if (!workspaces || workspaces.length <= 1) return null;
  return (
    <select
      value={activeWorkspace.id}
      onChange={e => onSwitch(e.target.value)}
      aria-label="Workspace"
      style={{ fontFamily: "var(--mono)", fontSize: 12, padding: "6px 8px", borderRadius: 8,
               border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)" }}
    >
      {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
    </select>
  );
}
// ============================================================================
// END v113 SEAMS
// ============================================================================


// ── GAMING / VIRAL DATA (curated surfaces) ──────────────────────────────────────
// v105: fabricated per-template "uses" counts removed. Pre-launch there is no real
// usage, and inventing counts is the same NOT_BENCHMARK fabrication the ledger engine
// refuses elsewhere. Curated surfaces now order by expected demand for the launch
// wedge. v125: that wedge is the consultant / fractional-exec audience (Segment A),
// framed as a recommendation, not a measured trend.
// SERVER-SIDE TELEMETRY SEAM: post-launch, replace PRODUCT_DEMAND ordering with real
// per-template usage counts from the server and surface true counts and trend deltas.
// This curated order is the cold-start stand-in only.
const PRODUCT_DEMAND = [
  // v125: resequenced to lead with the consultant / fractional-exec wedge (Segment A).
  // Top five drive the "Most used" decide row, so they are all Segment A. Segment B
  // (Product) and Segment C (Founder) signatures are retained below, demoted but
  // present, so they stay reachable as secondary topics.
  // Segment A — consultants and fractional execs
  "Go / No-Go Recommendation",
  "Competitive Response",
  "GTM Motion Choice",
  "Pricing Model Decision",
  "Vendor Selection Matrix",
  "Market Entry Decision",
  "Pre-Mortem Risk Map",
  "ICP Narrowing",
  "Board Meeting Prep",
  "Client Escalation Response",
  // Segment B — product managers
  "Feature Prioritization",
  "Roadmap Tradeoff",
  "Build vs Buy Tradeoff",
  "MVP Scope Cut",
  // Segment C — early and solo founders
  "Seed Raise Readiness",
  "Hire / No-Hire Call",
  "Bridge vs Priced Round",
];
const demandRank = (name) => { const i = PRODUCT_DEMAND.indexOf(name); return i === -1 ? 999 : i; };
// Document demand ordering for the same Product-led audience. Used for the Document
// tab's curated rows, parallel to PRODUCT_DEMAND for Decide.
const DOC_DEMAND = [
  // v125: resequenced to the Segment A wedge first, parallel to PRODUCT_DEMAND.
  // Segment A — consultants and fractional execs
  "Strategy Memo",
  "Go-To-Market Strategy",
  "Proposal / Statement of Work",
  "Positioning Statement",
  "Messaging Framework",
  "Case Study / Win Story",
  "Market Entry Memo",
  "Executive Business Review (QBR)",
  // Segment B — product managers
  "Product Requirements Document",
  "Technical Design Document",
  "OKR / Goal Design",
  "Incident Post-Mortem",
  // Segment C — early and solo founders
  "Pitch Deck Narrative",
  "Investment Memo",
  "Monthly Investor Update",
];
const docDemandRank = (label) => { const i = DOC_DEMAND.indexOf(label); return i === -1 ? 999 : i; };

// ── CATALOG TELEMETRY SEAM (v125) ─────────────────────────────────────────────
// Per-category open and per-template use/draft events for the catalog. The cold-start
// curation above (PRODUCT_DEMAND, DOC_DEMAND, featured) is a guess. These events are
// what later replaces it with real demand, and each event is tagged with the wedge
// segment so the GTM test can read true per-segment template pull. Default sink is a
// bounded local buffer plus a no-op, so nothing leaves the client until wired.
// SERVER-SIDE TELEMETRY SEAM: swap ACTIVE_CATALOG_SINK to a server adapter with the
// same emit(evt) contract. No call-site changes required. One binding to move.
const SEGMENT_FOR_DOC_CATEGORY = {
  Strategy: "A", Sales: "A", Marketing: "A", CustomerSuccess: "A",
  Product: "B", Operations: "B",
  Fundraising: "C",
  Finance: "cross", Hiring: "cross", Career: "cross",
};
const localCatalogSink = {
  BUFFER: [],
  MAX: 500,
  emit(evt) {
    try { this.BUFFER.push(evt); if (this.BUFFER.length > this.MAX) this.BUFFER.shift(); } catch (_) {}
  },
};
// Swap this one binding to ship catalog events server-side.
let ACTIVE_CATALOG_SINK = localCatalogSink;
function trackCatalogEvent(kind, payload) {
  try { ACTIVE_CATALOG_SINK.emit({ kind, ...(payload || {}), at: Date.now() }); } catch (_) {}
}
// "Trending this week" is a deterministic weekly rotation over the catalog, not a
// usage metric. It genuinely changes each ISO week so the label is honest pre-launch.
// SERVER-SIDE TELEMETRY SEAM: post-launch, replace this rotation and the "Most used"
// curation with real per-template counts and true week-over-week deltas.
const _weekIdx = () => Math.floor(Date.now() / (7 * 864e5));
const weekRotate = (arr) => (arr && arr.length) ? arr.map((_, i) => arr[(i + _weekIdx()) % arr.length]) : (arr || []);
const STRUCTURES = [
  { id:1,  name:"Go / No-Go Recommendation",        type:"Approve or Reject" },
  { id:2,  name:"Build vs Buy Tradeoff",            type:"Compare Options" },
  { id:3,  name:"Pre-Mortem Risk Map",              type:"Evaluate Risk" },
  { id:4,  name:"Feature Prioritization",           type:"Prioritize" },
  { id:5,  name:"Vendor Selection Matrix",          type:"Compare Options" },
  { id:6,  name:"Two-Offer Career Compare",         type:"Compare Options",   personal:true },
  { id:7,  name:"GTM Motion Choice",                type:"Compare Options" },
  { id:8,  name:"AI Use-Case Risk Assessment",      type:"Evaluate Risk" },
  { id:9,  name:"Pricing Model Decision",           type:"Compare Options" },
  { id:10, name:"Roadmap Tradeoff",                 type:"Prioritize" },
  { id:11, name:"Contract Risk Review",             type:"Evaluate Risk" },
  { id:12, name:"Seed Raise Readiness",             type:"Evaluate Risk" },
  { id:13, name:"Churn-Risk Intervention",          type:"Diagnose" },
  { id:14, name:"Market Entry Decision",            type:"Approve or Reject" },
  { id:15, name:"MVP Scope Cut",                    type:"Prioritize" },
  { id:16, name:"Deal Desk Approve / Reject",       type:"Approve or Reject" },
  { id:17, name:"Human-in-the-Loop Scope",          type:"Plan" },
  { id:18, name:"Process Bottleneck Diagnosis",     type:"Diagnose" },
  { id:19, name:"ICP Narrowing",                    type:"Prioritize" },
  { id:20, name:"Pricing Change Impact",            type:"Evaluate Risk" },
  { id:21, name:"Expansion Play Prioritization",    type:"Prioritize" },
  { id:22, name:"Model / AI Vendor Selection",      type:"Compare Options" },
  { id:23, name:"Compliance Gap Triage",            type:"Diagnose" },
  { id:24, name:"Sunset / Deprecate Call",          type:"Approve or Reject" },
  { id:25, name:"Hire / No-Hire Call",              type:"Approve or Reject" },
  { id:26, name:"Vendor Terms Negotiation",         type:"Negotiate" },
  { id:27, name:"Renewal Save Decision",            type:"Approve or Reject" },
  { id:28, name:"Capacity Planning Call",           type:"Plan" },
  { id:29, name:"Competitive Response",             type:"Plan" },
  { id:30, name:"Budget Reallocation",              type:"Prioritize" },
  { id:31, name:"Bridge vs Priced Round",           type:"Compare Options" },
  { id:32, name:"Backfill vs Restructure",          type:"Compare Options" },
  // New in v83
  { id:33, name:"Difficult Conversation Planner",   type:"Plan",               personal:true },
  { id:34, name:"Should I Leave",                   type:"Evaluate Risk",      personal:true },
  { id:35, name:"Offer Negotiation Prep",           type:"Negotiate",          personal:true },
  { id:36, name:"Performance Conversation Prep",    type:"Plan" },
  { id:37, name:"Burnout Triage",                   type:"Diagnose",           personal:true },
  { id:38, name:"Founder Conflict",                 type:"Diagnose" },
  { id:39, name:"Board Meeting Prep",               type:"Plan" },
  { id:40, name:"Investor Update: Bad News",       type:"Communicate" },
  { id:41, name:"Promote or Manage Out",            type:"Approve or Reject" },
  { id:42, name:"Apology Decision",                 type:"Approve or Reject",  personal:true },
  { id:43, name:"Relationship Boundary Decision",   type:"Plan",               personal:true },
  { id:44, name:"Career Pivot Assessment",          type:"Evaluate Risk",      personal:true },
  { id:45, name:"Client Escalation Response",       type:"Plan" },
  { id:46, name:"Promotion Case",                   type:"Plan",               personal:true },
  { id:47, name:"Skip-Level Meeting Prep",          type:"Plan",               personal:true },
  { id:48, name:"Reference Decision",               type:"Approve or Reject" },
  { id:49, name:"Reference Check Debrief",          type:"Diagnose" },
  { id:50, name:"Health Decision",                  type:"Evaluate Risk",      personal:true },
  { id:51, name:"Aging Parent Care Decision",       type:"Plan",               personal:true },
  { id:52, name:"Relocation Decision",              type:"Evaluate Risk",      personal:true },
  { id:53, name:"Major Purchase Decision",          type:"Evaluate Risk",      personal:true },
  // v126.7: Negotiate and Communicate each held only one non-personal structure, below the
  // 3-per-category floor enforced elsewhere (Personal-flagged negotiation prep routes to the
  // Personal accordion, not Negotiate). Added two high-demand, non-personal structures to each.
  { id:54, name:"Counteroffer Decision",            type:"Negotiate" },
  { id:55, name:"Discount / Concession Decision",   type:"Negotiate" },
  { id:56, name:"Crisis Communication Plan",        type:"Communicate" },
  { id:57, name:"Organizational Change Announcement", type:"Communicate" },
];
// v97.16: milestones are computed from real metrics, not hardcoded. Each badge carries
// an `earned(ctx)` predicate evaluated against live ledger/streak/share data.
const BADGES = [
  { id:"first", label:"First Commit",        icon:CheckCircle2, earned:c => c.committed >= 1 },
  { id:"ten",   label:"10 Decisions",        icon:Layers,       earned:c => c.decisions >= 10 },
  { id:"streak",label:"7-Day Streak",        icon:Flame,        earned:c => c.streakDays >= 7 },
  { id:"review",label:"Reviewed 5 Outcomes", icon:RotateCcw,    earned:c => c.reviewed >= 5 },
  { id:"calib", label:"Calibration Unlocked",icon:Target,       earned:c => c.calibrationReady },
];
const STAGES = [
  { id:"clarify", label:"Clarify", icon:Compass,      blurb:"Clarify what matters." },
  { id:"explore", label:"Explore", icon:GitBranch,    blurb:"Compare options, assumptions, risks, tradeoffs." },
  { id:"commit",  label:"Commit",  icon:CheckCircle2, blurb:"Create the final decision output." },
];

// ── NEW PRIMITIVES (Kicker, Rule reused from kept engine UI) ─────────────────────
function BrandMark({ size=28 }){
  const teeth = [];
  for(let i=0;i<8;i++) teeth.push(<rect key={i} x="44.5" y="2" width="11" height="20" rx="3" fill="var(--brand)" transform={`rotate(${i*45} 50 50)`} />);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" role="img" aria-label="WorkOutput" style={{ flexShrink:0, display:"block" }}>
      {teeth}
      <circle cx="50" cy="50" r="35" fill="var(--brand)" />
      <rect x="29" y="29" width="42" height="42" rx="9" fill="#FFFFFF" />
      <path d="M37 51 L46.5 60.5 L64 39.5" stroke="#15130F" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Btn({ children, onClick, kind="primary", disabled, full, size="md", style }){
  const pad = size==="sm" ? "8px 13px" : "12px 20px";
  const base = { fontFamily:"var(--mono)", fontSize:size==="sm"?12:13, fontWeight:500, letterSpacing:"0.05em",
    borderRadius:5, cursor:disabled?"default":"pointer", minHeight:size==="sm"?34:44, padding:pad,
    width:full?"100%":undefined, display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
    transition:"all .18s", border:"1px solid transparent", ...style };
  const kinds = {
    primary:{ background:disabled?"var(--line)":"var(--accent)", color:"var(--paper)" },
    ghost:{ background:"transparent", color:"var(--ink2)", borderColor:"var(--line)" },
    soft:{ background:"var(--accent-soft)", color:"var(--accent)" },
  };
  return (
    <button onClick={disabled?undefined:onClick} disabled={disabled} style={{ ...base, ...kinds[kind], opacity:disabled?0.5:1 }}
      onMouseEnter={e=>{ if(disabled||kind==="primary") return; e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--ink)"; }}
      onMouseLeave={e=>{ if(disabled||kind==="primary") return; e.currentTarget.style.borderColor="var(--line)"; e.currentTarget.style.color=kind==="soft"?"var(--accent)":"var(--ink2)"; }}>
      {children}
    </button>
  );
}
function Chip({ children, onClick, active, lock }){
  return (
    <button onClick={onClick} className="wo-hover" style={{ fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.04em",
      color:active?"var(--ink)":"var(--ink2)", border:`1px solid ${active?"var(--accent)":"var(--meta)"}`, borderRadius:20,
      padding:"7px 13px", background:active?"var(--accent-soft)":"var(--line)", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6 }}>
      {lock && <Lock size={11} />}{children}
    </button>
  );
}
function Meter({ value, label }){
  const c = value>=75?"var(--positive)":value>=50?"var(--caution)":"var(--critical)";
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
        <span style={{ display:"inline-flex", alignItems:"center" }}><Kicker style={{ color:"var(--meta)" }}>{label||"Readiness"}</Kicker><InfoTip k={label||"Readiness"} /></span>
        <span style={{ fontFamily:"var(--display)", fontSize:20, fontWeight:600, color:c }}>{value||"–"}</span>
      </div>
      <div style={{ height:6, background:"var(--line)", borderRadius:6, overflow:"hidden" }}>
        <div style={{ width:`${value||0}%`, height:"100%", background:c, borderRadius:6, transition:"width .6s cubic-bezier(.2,.7,.2,1)" }} />
      </div>
    </div>
  );
}
function LockTag({ onClick, tier="Pro" }){
  return (
    <button onClick={onClick} style={{ display:"inline-flex", alignItems:"center", gap:5, background:"var(--accent-soft)",
      border:"none", borderRadius:4, padding:"3px 8px", cursor:"pointer", fontFamily:"var(--mono)", fontSize:10,
      letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--accent)", fontWeight:600 }}><Lock size={10} />{tier}</button>
  );
}
function TierPill({ tier, onClick }){
  const t = TIERS[tier];
  return (
    <button onClick={onClick} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"var(--edge)",
      border:"1px solid var(--line)", borderRadius:20, padding:"4px 11px 4px 9px", cursor:"pointer" }}>
      {tier==="pro" && <Crown size={12} style={{ color:t.color }} />}
      {tier==="enterprise" && <Shield size={12} style={{ color:t.color }} />}
      <span style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:t.color, fontWeight:600 }}>{t.name}</span>
    </button>
  );
}
function StatusDotV72({ status }){
  const c = /commit/i.test(status)?"var(--positive)":/risk/i.test(status)?"var(--critical)":"var(--caution)";
  return <span style={{ width:8, height:8, borderRadius:"50%", background:c, flexShrink:0, display:"inline-block" }} />;
}
function UpgradeNotice({ onUpgrade, feature, pad }){
  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:pad||"60px 24px", textAlign:"center" }}>
      <span style={{ width:46, height:46, borderRadius:12, background:"var(--accent-soft)", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}><Crown size={22} style={{ color:"var(--accent)" }} /></span>
      <h2 style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:22, color:"var(--ink)", margin:"0 0 8px" }}>{feature||"This"} is a Pro feature</h2>
      <p style={{ fontFamily:"var(--serif)", fontSize:15.5, color:"var(--meta)", margin:"0 0 18px" }}>Upgrade to unlock the full toolkit, more sessions, and more turns per decision.</p>
      <Btn onClick={onUpgrade}>See plans</Btn>
    </div>
  );
}

// ── OverageOptInBanner — shown when a Starter or Pro user hits the session cap ──
// v102: overage is PAYMENT-REQUIRED and there is no billing integration in this build,
// so the banner shows a clear "payment required / coming soon" state. It NEVER grants
// an extra session from a local flag (see isOverageEnabled / OVERAGE_PAYMENT_CONFIRMED).
// Price is $1 per additional session. When billing lands, wire the action button to a
// real checkout and only then call onOptIn after the server confirms the charge.
// TODO(server): replace the disabled button with a checkout that grants exactly one
// paid session on confirmed payment.
function OverageOptInBanner({ tier, cap, onClose, onOptIn }) {
  if (tier !== "starter" && tier !== "pro") return null;
  return (
    <div style={{ background:"var(--edge)", border:"1px solid var(--line)", borderLeft:"3px solid var(--caution)", borderRadius:8, padding:"14px 16px", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:15, color:"var(--ink)" }}>You have used all {cap} sessions this cycle.</span>
        {onClose && <button onClick={onClose} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:"var(--meta)", display:"flex" }}><X size={14} /></button>}
      </div>
      <p style={{ fontFamily:"var(--serif)", fontSize:14, color:"var(--ink2)", lineHeight:1.5, margin:"0 0 12px" }}>
        Extra sessions come in packs of {OVERAGE_PACK.sessions} for ${OVERAGE_PACK.priceUSD}. Payment is required before they start. Your ledger keeps building either way.
      </p>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
        <Btn size="sm" disabled>Add {OVERAGE_PACK.sessions} sessions (${OVERAGE_PACK.priceUSD}), coming soon</Btn>
        <Btn size="sm" kind="ghost" onClick={onClose}>Not now</Btn>
      </div>
      <p style={{ fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.03em", color:"var(--meta)", margin:"10px 0 0" }}>
        Or upgrade to a higher plan for more included sessions.
      </p>
    </div>
  );
}

// ── STAGE RAIL ──────────────────────────────────────────────────────────────────
function StageRail({ stage, compact }){
  const idx = STAGES.findIndex(s=>s.id===stage);
  return (
    <div style={{ display:"flex", alignItems:"stretch", gap:0, width:"100%" }}>
      {STAGES.map((s,i)=>{
        const active=i===idx, done=i<idx; const Icon=s.icon;
        return (
          <React.Fragment key={s.id}>
            <div style={{ flex:1, minWidth:0, padding:compact?"6px 4px":"4px 6px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:9, minWidth:0 }}>
                <span style={{ width:compact?22:26, height:compact?22:26, borderRadius:"50%", flexShrink:0,
                  border:`1.5px solid ${active||done?"var(--accent)":"var(--line)"}`, background:done?"var(--accent)":active?"var(--accent-soft)":"transparent",
                  color:done?"var(--paper)":active?"var(--accent)":"var(--meta)", display:"flex", alignItems:"center", justifyContent:"center",
                  animation:active?"woGlow 2.4s ease-in-out infinite":"none" }}>
                  {done ? <Check size={13} /> : <Icon size={compact?12:13} />}
                </span>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:compact?13:15, color:active?"var(--ink)":done?"var(--ink2)":"var(--meta)", lineHeight:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.label}</div>
                  {!compact && <div style={{ fontFamily:"var(--serif)", fontSize:12, color:"var(--meta)", marginTop:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.blurb}</div>}
                </div>
              </div>
            </div>
            {i<STAGES.length-1 && <div style={{ width:compact?16:34, alignSelf:"center", height:1.5, background:i<idx?"var(--accent)":"var(--line)", flexShrink:0 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── SIDEBAR ─────────────────────────────────────────────────────────────────────
// v92: NAV split into NAV_DECIDE and NAV_DOCUMENT clusters so the sidebar
// visually communicates the two distinct workflows. "Workspace" renamed to "Decide".
// NAV_MAIN kept as a flat merge for any legacy reads.
const NAV_DECIDE = [
  { id:"Home",      label:"Decide",           icon:GitBranch },
  { id:"library",   label:"Decision Library", icon:Library,   feature:"library" },
  { id:"Review",    label:"Outcomes",         icon:RotateCcw, feature:"library" },
  { id:"templates", label:"Templates",        icon:LayoutGrid },
];
const NAV_DOCUMENT = [
  { id:"Draft",        label:"New Document",      icon:PenLine },
  { id:"DraftLibrary", label:"Document Archive",  icon:Library },
];
const NAV_MAIN = [...NAV_DECIDE, ...NAV_DOCUMENT];
const NAV_PERSONAL = [
  { id:"profile", label:"Decision Profile", icon:User, feature:"profile" },
  { id:"Stats", label:"My Patterns", icon:BarChart3 },
];
const NAV_ADMIN = [
  { id:"Site", label:"Site Metrics", icon:TrendingUp, feature:"siteMetrics" },
];
const NAV_TEAM = [
  { id:"Group", label:"Group Analytics", icon:Layers, feature:"team" },
  { id:"TeamLedger", label:"Team Ledger", icon:Trophy, feature:"team" },
];

// ── SETTINGS VIEW (Build 4) ──────────────────────────────────────────────────
function SettingsView({ reviewHorizonDays, onChangeHorizon, tier, pad, onUpgrade, creditsUsed, resetDays }) {
  const [localHorizon, setLocalHorizon] = React.useState(reviewHorizonDays);
  const [saved, setSaved] = React.useState(false);
  const saveHorizon = async (val) => {
    const n = Math.max(1, Math.min(30, val));
    setLocalHorizon(n);
    await saveReviewHorizonDays(n);
    onChangeHorizon(n);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const showUpgrade = tier === "free" || tier === "starter";
  const planDesc =
    tier === "free"    ? `${TIER_POLICY.free.maxDecisionsPerMonth} decisions or documents / month · ${TIER_POLICY.free.maxTurns} turns per decision · up to ${TIER_POLICY.free.maxSessionsPerDay} per day` :
    tier === "starter" ? `${TIER_POLICY.starter.maxDecisionsPerMonth} decisions or documents / month · ${TIER_POLICY.starter.maxTurns} turns per decision · up to ${TIER_POLICY.starter.maxSessionsPerDay} per day` :
    tier === "pro"     ? `${TIER_POLICY.pro.maxDecisionsPerMonth} decisions or documents / month · ${TIER_POLICY.pro.maxTurns} turns per decision · up to ${TIER_POLICY.pro.maxSessionsPerDay} per day` :
    "Unlimited decisions, documents, and turns";

  // v97: credit display values
  const creditAllowance = getMonthlyCreditAllowance(tier);
  const creditRemaining = Number.isFinite(creditAllowance) ? Math.max(0, creditAllowance - (creditsUsed||0)) : Infinity;
  const showCredits = tier === "pro" || tier === "enterprise";

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: pad ? "22px 16px" : "28px 24px" }}>
      <Kicker style={{ marginBottom: 6 }}>Settings</Kicker>
      <h2 style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 22, color: "var(--ink)", margin: "0 0 22px", letterSpacing: "-0.01em" }}>Your preferences</h2>
      <div className="wo-in" style={{ background: "var(--edge)", border: "1px solid var(--line)", borderRadius: 12, padding: "20px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 15.5, color: "var(--ink)", marginBottom: 4 }}>Outcome review window</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--meta)", lineHeight: 1.5 }}>
              Days after a commit before a decision enters your review queue. Shorter windows build your ledger faster.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <button type="button" onClick={() => saveHorizon(localHorizon - 1)} disabled={localHorizon <= 1}
              style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", cursor: localHorizon <= 1 ? "not-allowed" : "pointer", fontFamily: "var(--mono)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", opacity: localHorizon <= 1 ? 0.35 : 1 }}>−</button>
            <div style={{ textAlign: "center", minWidth: 56 }}>
              <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 26, color: "var(--accent)" }}>{localHorizon}</span>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em", color: "var(--meta)", marginTop: 1 }}>DAYS</div>
            </div>
            <button type="button" onClick={() => saveHorizon(localHorizon + 1)} disabled={localHorizon >= 30}
              style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", cursor: localHorizon >= 30 ? "not-allowed" : "pointer", fontFamily: "var(--mono)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", opacity: localHorizon >= 30 ? 0.35 : 1 }}>+</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {[3, 7, 14, 21, 30].map(d => (
            <button type="button" key={d} onClick={() => saveHorizon(d)}
              style={{ fontFamily: "var(--mono)", fontSize: 11.5, letterSpacing: "0.04em", padding: "5px 12px", borderRadius: 20, border: `1px solid ${localHorizon === d ? "var(--accent)" : "var(--line)"}`, background: localHorizon === d ? "var(--accent-soft)" : "transparent", color: localHorizon === d ? "var(--accent)" : "var(--meta)", cursor: "pointer" }}>
              {d}d
            </button>
          ))}
        </div>
        {saved && <div style={{ marginTop: 10, fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.04em", color: "var(--positive)", display: "flex", alignItems: "center", gap: 5 }}><Check size={12} />Saved</div>}
      </div>

      {/* v97: Advanced intelligence credits section — shown for Pro and Enterprise only */}
      {showCredits && (
        <div className="wo-in" style={{ background: "var(--edge)", border: "1px solid var(--accent)", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 15.5, color: "var(--ink)", marginBottom: 6 }}>Advanced intelligence credits</div>
          <p style={{ fontFamily: "var(--serif)", fontSize: 13.5, color: "var(--meta)", lineHeight: 1.5, margin: "0 0 14px" }}>
            Advanced intelligence credits are used for deeper tools such as failure simulation, dependency mapping, contradiction checks, and full intelligence runs. Standard Decide and Document sessions do not use credits.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Monthly allowance", value: Number.isFinite(creditAllowance) ? String(creditAllowance) : "Custom" },
              { label: "Used this cycle",   value: Number.isFinite(creditAllowance) ? String(creditsUsed||0) : "—" },
              { label: "Remaining",         value: Number.isFinite(creditRemaining) ? String(creditRemaining) : "Unlimited" },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 9, padding: "12px 13px" }}>
                <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 22, color: "var(--accent)", lineHeight: 1 }}>{value}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--meta)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
          {resetDays != null && (
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.04em", color: "var(--meta)", marginBottom: 14 }}>
              Resets in {resetDays} {resetDays === 1 ? "day" : "days"} with your monthly cycle. Credits do not roll over.
            </div>
          )}
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--meta)", marginBottom: 8 }}>Credit costs</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                ["Contradiction scan",       CREDIT_COSTS.contradictionScan],
                ["Dependency map",           CREDIT_COSTS.dependencyMap],
                ["Failure simulation",       CREDIT_COSTS.failureSimulation],
                ["Benchmark",               CREDIT_COSTS.benchmark],
                ["Decision stress test",     CREDIT_COSTS.decisionStressTest],
                ["Multi-perspective review", CREDIT_COSTS.multiPerspectiveReview],
                ["Full intelligence run",    CREDIT_COSTS.fullIntelligenceRun],
              ].map(([name, cost]) => (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "var(--serif)", fontSize: 13.5, color: "var(--ink2)" }}>
                  <span>{name}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--meta)" }}>{cost} {cost === 1 ? "credit" : "credits"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="wo-in" style={{ background: "var(--edge)", border: `1px solid ${showUpgrade ? "var(--line)" : "var(--accent)"}`, borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 15.5, color: "var(--ink)", marginBottom: 8 }}>Your plan</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: showUpgrade ? 14 : 0 }}>
          <TierPill tier={tier} />
          <span style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--meta)" }}>{planDesc}</span>
        </div>
        {showUpgrade && (
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 13.5, color: "var(--meta)", marginBottom: 12, lineHeight: 1.5 }}>
              {tier === "starter"
                ? `Upgrade to Pro for ${TIER_POLICY.pro.maxDecisionsPerMonth} decisions and documents per month, ${TIER_POLICY.pro.maxTurns} turns per session, advanced analysis tools, ${getMonthlyCreditAllowance("pro")} intelligence credits per month, and conflict detection.`
                : `Upgrade to Starter for ${TIER_POLICY.starter.maxDecisionsPerMonth} decisions per month, ${TIER_POLICY.starter.maxTurns} turns per session, and HTML export. Or go straight to Pro for the full toolkit including advanced intelligence tools.`}
            </div>
            {tier === "starter"
              ? <Btn onClick={onUpgrade}><Crown size={14} />Upgrade to Pro</Btn>
              : <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
                  <Btn onClick={onUpgrade}>Upgrade to Starter</Btn>
                  <Btn kind="ghost" onClick={onUpgrade}>See all plans</Btn>
                </div>
            }
          </div>
        )}
      </div>
    </div>
  );
}

// v92: SidebarV72 restructured. Two workflow clusters — Decide and Document —
// replace the flat NAV_MAIN list. The redundant quick-action button pair is removed;
// "New decision" is now a single primary CTA since Decide is already the first nav
// item and the cluster labels communicate the distinction. Recents section is scoped
// to decisions only (decide workflow), since draft sessions have a different lifecycle.
function SidebarV72({ view, setView, tier, dataTheme, setTheme, onUpgrade, onNavigate, mode, enableAdvanced, sessions, onNew, onLoad, dueCount, pendingCount, creditsUsed, monthUsed, resetDays }){
  // Single nav item renderer shared by both clusters
  const NavItem = ({ it }) => {
    const Icon = it.icon;
    const active = view === it.id;
    const locked = it.feature && !has(tier, it.feature);
    const badge = (it.id === "Review" && dueCount > 0) ? dueCount
                : (it.id === "Home"   && pendingCount > 0) ? pendingCount
                : null;
    return (
      <button
        key={it.id}
        onClick={() => { if (locked) { onUpgrade(); } else { setView(it.id); } onNavigate && onNavigate(); }}
        style={{
          width:"100%", display:"flex", alignItems:"center", gap:11,
          padding:"8px 18px",
          background: active ? "var(--accent-soft)" : "transparent",
          border:"none",
          borderLeft:`2px solid ${active ? "var(--accent)" : "transparent"}`,
          cursor:"pointer", textAlign:"left",
          color: active ? "var(--ink)" : "var(--ink2)",
        }}>
        <Icon size={15} style={{ color: active ? "var(--accent)" : "var(--meta)", flexShrink:0 }} />
        <span style={{ fontFamily:"var(--serif)", fontSize:15, flex:1, lineHeight:1.3 }}>{it.label}</span>
        {badge != null && (
          <span style={{ fontFamily:"var(--mono)", fontSize:10, fontWeight:600, color:"var(--paper)", background:"var(--accent)", borderRadius:20, minWidth:17, height:17, padding:"0 4px", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>{badge}</span>
        )}
        {locked && <Lock size={11} style={{ color:"var(--meta)" }} />}
      </button>
    );
  };

  // Cluster: a labeled group of nav items with a top label and optional divider
  const Cluster = ({ label, sublabel, items, borderTop }) => (
    <div style={{ marginBottom:4, paddingTop: borderTop ? 0 : 0 }}>
      {borderTop && <div style={{ height:1, background:"var(--line)", margin:"10px 18px 10px" }} />}
      <div style={{ padding:"0 18px 5px", display:"flex", alignItems:"baseline", gap:7 }}>
        <span style={{ fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--meta)", opacity:0.7 }}>{label}</span>
        {sublabel && <span style={{ fontFamily:"var(--mono)", fontSize:9, color:"var(--meta)", opacity:0.45 }}>{sublabel}</span>}
      </div>
      {items.map(it => <NavItem key={it.id} it={it} />)}
    </div>
  );

  const recents = (sessions || []).filter(s => !s.workflowType || s.workflowType !== "draft").slice(0, 5);
  return (
    <aside className="wo-sc" style={{ width:224, flexShrink:0, background:"var(--panel)", borderRight:"1px solid var(--line)", display:"flex", flexDirection:"column", height:"100%", overflowY:"auto" }}>
      {/* Brand */}
      <div style={{ padding:"20px 18px 14px", display:"flex", alignItems:"center", gap:10 }}>
        <BrandMark size={28} />
        <span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:19, color:"var(--ink)", letterSpacing:"-0.01em" }}>WorkOutput</span>
      </div>

      {/* CTA pair: New decision (primary) + New document (secondary). Both workflows one click from anywhere. */}
      <div style={{ padding:"0 14px 12px", display:"flex", flexDirection:"column", gap:6 }}>
        <Btn full size="sm" onClick={() => { onNew(); setView("Home"); onNavigate && onNavigate(); }}>
          <GitBranch size={13} />New decision
        </Btn>
        <Btn full size="sm" kind="ghost" onClick={() => { setView("Draft"); onNavigate && onNavigate(); }}>
          <FileText size={13} />New document
        </Btn>
      </div>

      <div style={{ height:1, background:"var(--line)", margin:"0 0 10px" }} />

      {/* Decide cluster */}
      <Cluster label="Decide" sublabel="structured decisions" items={NAV_DECIDE} />

      {/* Document cluster */}
      <Cluster label="Document" sublabel="AI-created documents" items={NAV_DOCUMENT} borderTop />

      {/* Personal cluster */}
      <Cluster label="Personal" items={NAV_PERSONAL} borderTop />

      {/* v78.1: Intelligence moved off the sidebar. Reached from clarify-stage tools panel. */}
      {/* v102: Team is DEFERRED until after single-user beta (targeted month 6). The
          cluster stays gated behind TEAM_ENABLED so it cannot surface until the flag
          flips, even for an enterprise account. Do not sell or surface Team before then. */}
      {TEAM_ENABLED && tier === "enterprise" && <Cluster label="Team" items={NAV_TEAM} borderTop />}
      {tier === "enterprise" && <Cluster label="Admin" items={NAV_ADMIN} borderTop />}

      {/* Settings — standalone, bottom of nav */}
      <div style={{ height:1, background:"var(--line)", margin:"6px 18px 8px" }} />
      <NavItem it={{ id:"Settings", label:"Settings", icon:Sliders }} />

      {/* Recent decisions (decide workflow only) */}
      {recents.length > 0 && (
        <div style={{ marginTop:8, marginBottom:16 }}>
          <div style={{ height:1, background:"var(--line)", margin:"0 18px 10px" }} />
          <div style={{ padding:"0 18px 5px" }}>
            <span style={{ fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--meta)", opacity:0.7 }}>Recent decisions</span>
          </div>
          {recents.map(s => (
            <button key={s.id} onClick={() => { onLoad(s.id); onNavigate && onNavigate(); }}
              style={{ width:"100%", textAlign:"left", padding:"6px 18px", background:"transparent", border:"none", cursor:"pointer", color:"var(--ink2)", fontFamily:"var(--serif)", fontSize:13.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {s.title || "Untitled decision"}
            </button>
          ))}
        </div>
      )}

      {/* Footer: upgrade nudge + theme toggle */}
      <div style={{ marginTop:"auto", padding:"16px 18px", borderTop:"1px solid var(--line)" }}>
        {/* v97: compact usage meter for paid users — "X sessions left · Y credits left" */}
        {(tier === "pro" || tier === "starter") && (() => {
          const pol = TIER_POLICY[tier];
          const sessionsLeft = Number.isFinite(pol.maxDecisionsPerMonth) ? Math.max(0, pol.maxDecisionsPerMonth - (monthUsed||0)) : null;
          const creditAllowance = getMonthlyCreditAllowance(tier);
          const creditsLeft = Number.isFinite(creditAllowance) ? Math.max(0, creditAllowance - (creditsUsed||0)) : null;
          const parts = [];
          if (sessionsLeft != null) parts.push(`${sessionsLeft} session${sessionsLeft===1?"":"s"} left`);
          if (creditsLeft != null) parts.push(`${creditsLeft} credit${creditsLeft===1?"":"s"} left`);
          if (!parts.length) return null;
          return (
            <div style={{ fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.04em", color:"var(--meta)", marginBottom:12, lineHeight:1.5 }}>
              {parts.join(" · ")}
            </div>
          );
        })()}
        {tier !== "pro" && tier !== "enterprise" && (
          <button onClick={onUpgrade} className="wo-card-hover" style={{ width:"100%", textAlign:"left", background:"var(--accent-soft)", border:"1px solid var(--accent)", borderRadius:8, padding:"12px 14px", cursor:"pointer", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
              <Crown size={14} style={{ color:"var(--accent)" }} />
              <span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:15, color:"var(--ink)" }}>Go Pro</span>
            </div>
            <span style={{ fontFamily:"var(--serif)", fontSize:13, color:"var(--meta)" }}>More sessions, more turns, and the full advanced toolkit.</span>
          </button>
        )}
        <button onClick={() => setTheme(dataTheme === "paper" ? "ink" : "paper")}
          style={{ display:"flex", alignItems:"center", gap:9, background:"transparent", border:"none", cursor:"pointer", color:"var(--meta)", fontFamily:"var(--mono)", fontSize:12, padding:"4px 0" }}>
          {dataTheme === "paper" ? <Moon size={15} /> : <Sun size={15} />}
          {dataTheme === "paper" ? "Ink theme" : "Paper theme"}
        </button>
      </div>
    </aside>
  );
}

// ── TOP BAR ───────────────────────────────────────────────────────────────────
function TopBar({ view, stage, tier, setView, narrow, onMenu, monthUsed, onUpgrade }){
  const showRail = view==="Home" || view==="Session";
  return (
    <>
      <header style={{ display:"flex", alignItems:"center", gap:14, padding:narrow?"0 12px":"0 20px", height:52, background:"var(--panel)", borderBottom:"1px solid var(--line)", flexShrink:0 }}>
        {narrow && <button onClick={onMenu} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--ink)", padding:6, display:"flex" }}><Menu size={20} /></button>}
        {narrow && <span style={{ display:"flex", alignItems:"center", gap:8 }}><BrandMark size={22} /><span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:17, color:"var(--ink)" }}>WorkOutput</span></span>}
        {!narrow && showRail && <div style={{ flex:1, minWidth:0, maxWidth:560 }}><StageRail stage={stage} compact /></div>}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          {tier==="free" && !narrow && <span style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.04em", color:"var(--meta)" }}>{Math.max(0,TIER_POLICY.free.maxDecisionsPerMonth-(monthUsed||0))} of {TIER_POLICY.free.maxDecisionsPerMonth} left this cycle</span>}
          <TierPill tier={tier} onClick={onUpgrade} />
          {!narrow && <span style={{ width:30, height:30, borderRadius:"50%", background:"var(--accent)", color:"var(--paper)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--display)", fontWeight:600, fontSize:14 }}>E</span>}
        </div>
      </header>
      {narrow && showRail && <div style={{ padding:"9px 14px", background:"var(--panel)", borderBottom:"1px solid var(--line)", flexShrink:0 }}><StageRail stage={stage} compact /></div>}
    </>
  );
}

// ── HOME (real upload + extraction preserved) ────────────────────────────────────
let _introCollapsed = null; // session cache for the Home intro collapse flag (avoids reload flash)
let _profileIntroCollapsed = null; // session cache for the Profile intro collapse flag
// Toggles a category accordion and settles the scroll position after React commits.
// v126.9: behavior now depends on the action.
//   opening === true  -> bring the clicked category header to the top of the scroll
//                        viewport, so the user starts at the top of the newly revealed
//                        list. Single-open accordions collapse the prior category, which
//                        shrinks the content above; pinning the old offset (the previous
//                        behavior) dropped the user toward the bottom. Scrolling to the
//                        header instead is stable regardless of what collapsed above.
//   opening !== true  -> preserve the scrollable ancestor's offset (no jump on close).
// Works whether the scroll container is the document or an inner overflow element: a
// document-level container is treated as having a viewport top of 0.
const preserveScroll = (e, fn, opening) => {
  const btn = e && e.currentTarget;
  let n = btn;
  while (n && n.scrollHeight <= n.clientHeight) n = n.parentElement;
  const sc = n, top = n ? n.scrollTop : 0;
  fn();
  if (!sc) return;
  if (opening && btn) {
    const PAD = 8; // small breathing room above the header
    const settle = () => { try {
      const docLevel = (sc === document.documentElement || sc === document.body || sc === document.scrollingElement);
      const contTop = docLevel ? 0 : sc.getBoundingClientRect().top;
      const delta = btn.getBoundingClientRect().top - contTop;
      sc.scrollTop = sc.scrollTop + delta - PAD;
    } catch (_) {} };
    // Double rAF: first lets React commit the expanded panel, second measures post-layout.
    requestAnimationFrame(() => requestAnimationFrame(settle));
  } else {
    requestAnimationFrame(() => { try { sc.scrollTop = top; } catch (_) {} });
  }
};

// v126.10: view-level error boundary. Until now any throw or React update-depth error
// inside a view (Document, Card, etc.) had no boundary, so it unmounted the whole panel
// with no recovery — the panel read as frozen. This catches the error, logs it with its
// component stack for diagnosis, and renders a recoverable fallback. It resets itself when
// `viewKey` changes, so navigating away from a broken view clears the fallback.
class ViewErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { err:null }; }
  static getDerivedStateFromError(err){ return { err }; }
  componentDidCatch(err, info){
    try { console.error("[WorkOutput] view render error:", err, info && info.componentStack); } catch(_){}
  }
  componentDidUpdate(prev){
    if(prev.viewKey !== this.props.viewKey && this.state.err) this.setState({ err:null });
  }
  render(){
    if(this.state.err){
      if(typeof this.props.fallback === "function") return this.props.fallback(this.state.err, ()=>this.setState({ err:null }));
      return null;
    }
    return this.props.children;
  }
}


// One render path for every category accordion header, so icon vs glyph is decided
// per category in the data, not duplicated across surfaces.
function CatGlyph({ cat }){
  if (cat && cat.icon){
    const I = cat.icon;
    return <span style={{ width:20, flexShrink:0, display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--accent)" }}><I size={16} /></span>;
  }
  return <span style={{ fontFamily:"var(--display)", fontSize:17, color:"var(--accent)", width:20, flexShrink:0 }}>{cat && cat.mark}</span>;
}

function HomeV72({ tier, monthUsed, resetDays, onStart, onDraft, setView, onUpgrade, recent, seedType, pad, onOpen, dueCount, onReview, pending, sessionCount, softCheck, onSoftCheck, seedText }){
  const [open, setOpen] = React.useState(null); // v126.8: all Home categories (role packs + documents) closed on first view to streamline for new users
  const [homeTab, setHomeTab] = React.useState("decide"); // "decide" | "draft"
  const [introCollapsed, setIntroCollapsed] = React.useState(_introCollapsed===true);
  React.useEffect(()=>{ if(_introCollapsed!==null) return; (async()=>{ try{ const r = await store.get("wo:home:introCollapsed"); _introCollapsed = !!(r && r.value==="1"); setIntroCollapsed(_introCollapsed); }catch(_){ _introCollapsed=false; } })(); },[]);
  const toggleIntro = async ()=>{ const next=!introCollapsed; _introCollapsed=next; setIntroCollapsed(next); try{ await store.set("wo:home:introCollapsed", next?"1":"0"); }catch(_){} };
  const [paste, setPaste] = React.useState("");
  const [examplePh, setExamplePh] = React.useState("");
  const [extracting, setExtracting] = React.useState(false);
  const [fileChips, setFileChips] = React.useState([]);
  const [fileError, setFileError] = React.useState("");
  const fileRef = React.useRef(null);
  const taRef = React.useRef(null);
  const attachmentsRef = React.useRef([]);
  const nativeSizesRef = React.useRef([]); // v112: raw bytes of accepted native attachments, for the per-session budget
  // v97.7: when a document type is selected, its template id is staged here so submit()
  // can attach it to the draft. Cleared on manual edits that change intent is not needed;
  // submit consumes it once.
  const pendingDraftTemplateRef = React.useRef(null);
  // v97.7: when the parent stages a template prompt (seedText), load it into the composer
  // for edit-or-send. Keyed on seedText.ts so re-selecting the same template re-stages it.
  React.useEffect(() => {
    if (!seedText || !seedText.text) return;
    if (seedText.workflowType === "draft") { setHomeTab("draft"); pendingDraftTemplateRef.current = seedText.selectedTemplate || null; }
    else { setHomeTab("decide"); }
    setExamplePh("");
    setPaste(seedText.text);
    requestAnimationFrame(()=>{ try{ const el=taRef.current; if(el){ el.focus(); const n=el.value.length; el.setSelectionRange(n,n); } }catch(_){} });
  }, [seedText && seedText.ts]); // eslint-disable-line react-hooks/exhaustive-deps
  const showExample = (it) => {
    const ex = (TYPE_EXAMPLES[it] || ("Describe your " + it + " and what you are weighing.")).replace(/^Example:\s*/i, "").trim();
    setExamplePh("");
    setPaste(ex);
    requestAnimationFrame(()=>{ try{ const el=taRef.current; if(el){ el.focus(); const n=el.value.length; el.setSelectionRange(n,n); } }catch(_){} });
  };
  const onFiles = async (fileList) => {
    // v102: upload entitlement (Free 1/session, Starter+ unlimited). v127: guest removed.
    if (!has(tier, "upload")) {
      setFileError("File uploads are available on a paid plan.");
      return;
    }
    let files = Array.from(fileList||[]); if(!files.length) return;
    if (tier === "free") {
      const remaining = Math.max(0, 1 - fileChips.length);
      if (remaining <= 0) { setFileError("Free includes one upload per session. Upgrade for more."); return; }
      if (files.length > remaining) files = files.slice(0, remaining);
    }
    setExtracting(true); setFileError("");
    for(const f of files){
      const nm=(f.name||"").toLowerCase(); const ext=nm.includes(".")?nm.slice(nm.lastIndexOf(".")):"";
      // v99.7 (P11): native attachments (PDF/images) are base64-encoded (+33%) into the
      // JSON request body, so 25MB on disk overshoots the API request limit. 18MB
      // pre-encoding keeps the encoded payload safely under it. Text-extracted files
      // keep 25MB — only their extracted text travels.
      const _isNative = !!attachmentKindFor(ext);
      const _cap = _isNative ? ATTACH_FILE_MAX_NATIVE : ATTACH_FILE_MAX_TEXT;
      if(f.size > _cap){ setFileError(prev=>(prev?prev+" ":"")+`${f.name} is ${_fmtMB(f.size)}. The limit is ${_fmtMB(_cap)} per ${_isNative?"PDF or image":"text"} file. Attach a smaller file.`); continue; }
      if(_isNative){
        const _remaining = ATTACH_SESSION_NATIVE_MAX - _attachSessionUsed(nativeSizesRef.current);
        if(f.size > _remaining){ setFileError(prev=>(prev?prev+" ":"")+`${f.name} is ${_fmtMB(f.size)} but only ${_fmtMB(Math.max(0,_remaining))} of the ${_fmtMB(ATTACH_SESSION_NATIVE_MAX)} per-session attachment budget is left. Remove an attachment or start your decision, then add it.`); continue; }
      }
      try{
        if(attachmentKindFor(ext)){ attachmentsRef.current=[...attachmentsRef.current, await fileToAttachment(f, ext)]; nativeSizesRef.current=[...nativeSizesRef.current, f.size]; setFileChips(prev=>[...prev, f.name+" (attached for the AI to read)"]); }
        else { const text = await extractFileText(f); if(text && text.trim()){ setPaste(prev=>(prev?prev+"\n\n":"")+"----- "+f.name+" -----\n"+text.trim()); setFileChips(prev=>[...prev, f.name]); } else setFileChips(prev=>[...prev, f.name+" (no text found)"]); }
      }catch(e){ setFileError(prev=>(prev?prev+" ":"")+"Could not read "+f.name+"."); }
    }
    setExtracting(false);
  };
  const removeChip = (i) => setFileChips(prev=>prev.filter((_,j)=>j!==i));
  const submit = () => {
    const typed = paste.trim();
    const example = examplePh ? examplePh.replace(/^Example:\s*/i,"").trim() : "";
    const atts = attachmentsRef.current;
    const chosen = typed || example;
    if(!chosen && atts.length===0) return;
    if (homeTab === "draft") {
      const tid = pendingDraftTemplateRef.current;
      pendingDraftTemplateRef.current = null;
      onDraft(chosen || "I have attached documents. Please read them and draft the document.", atts, tid ? { selectedTemplate: tid } : {});
    } else {
      onStart(chosen || "I have attached documents that describe my decision and its background. Read them and help me structure the decision.", atts);
    }
  };
  const canStart = !!paste.trim() || fileChips.length>0;
  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:pad }}>
      {dueCount>0 && (
        <button onClick={onReview} className="wo-in wo-hover" style={{ width:"100%", marginBottom:16, background:"var(--accent-soft)", border:"1px solid var(--accent)", borderRadius:8, padding:"11px 14px", display:"flex", alignItems:"center", gap:11, cursor:"pointer", textAlign:"left" }}>
          <Clock size={16} style={{ color:"var(--accent)", flexShrink:0 }} />
          <span style={{ flex:1, fontFamily:"var(--serif)", fontSize:14.5, color:"var(--ink)" }}>{dueCount} {dueCount===1?"decision is":"decisions are"} ready for an outcome check. Find out whether your call held.</span>
          <span style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.04em", color:"var(--accent)", flexShrink:0, display:"inline-flex", alignItems:"center", gap:4 }}>Review<ArrowRight size={13} /></span>
        </button>
      )}
      {/* v90: soft check — only when no full review is already due, to avoid stacking prompts */}
      {dueCount===0 && softCheck && softCheck.length>0 && onSoftCheck && (
        <div className="wo-in" style={{ marginBottom:16, background:"var(--edge)", border:"1px solid var(--line)", borderLeft:"3px solid var(--accent)", borderRadius:8, padding:"13px 15px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <Clock size={15} style={{ color:"var(--accent)", flexShrink:0 }} />
            <span style={{ fontFamily:"var(--serif)", fontSize:14.5, color:"var(--ink)", lineHeight:1.4 }}>
              A few days later: does your call on &ldquo;{(softCheck[0].title||"your recent decision")}&rdquo; still feel right?
            </span>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", paddingLeft:23 }}>
            <Btn size="sm" onClick={()=>onSoftCheck(softCheck[0].id, "still_right")}>Still feels right</Btn>
            <Btn size="sm" kind="ghost" onClick={()=>onSoftCheck(softCheck[0].id, "unsure")}>Not sure, review it</Btn>
          </div>
        </div>
      )}
      {pending && pending.length>0 && (
        <div className="wo-in" style={{ marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:9 }}>
            <RotateCcw size={15} style={{ color:"var(--accent)" }} />
            <Kicker style={{ color:"var(--meta)" }}>Pending decisions</Kicker>
          </div>
          <div style={{ border:"1px solid var(--line)", borderRadius:10, overflow:"hidden", background:"var(--edge)" }}>
            {pending.slice(0,5).map((s,i)=>(
              <button key={s.id} onClick={()=>onOpen && onOpen(s.id)} className="wo-hover" style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"transparent", border:"none", borderTop:i>0?"1px solid var(--line-soft)":"none", cursor:"pointer", textAlign:"left" }}>
                <StatusDotV72 status={s.status||s.mode||""} />
                <span style={{ flex:1, minWidth:0, fontFamily:"var(--serif)", fontSize:15.5, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.title}</span>
                <span style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.04em", color:"var(--meta)", flexShrink:0 }}>Resume</span>
                <ChevronRight size={15} style={{ color:"var(--meta)", flexShrink:0 }} />
              </button>
            ))}
          </div>
        </div>
      )}
      {tier==="free" && (
        <div className="wo-in" style={{ marginBottom:16, background:"var(--edge)", border:"1px solid var(--line)", borderLeft:"3px solid var(--accent)", borderRadius:6, padding:"9px 13px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <span style={{ fontFamily:"var(--serif)", fontSize:14, color:"var(--ink2)" }}>{(()=>{ const cap=TIER_POLICY.free.maxDecisionsPerMonth; const left=Math.max(0,cap-(monthUsed||0)); const when=resetDays!=null?` Resets in ${resetDays} ${resetDays===1?"day":"days"}.`:""; return left>0 ? `${left} of ${cap} decisions or documents left this cycle.${when} Upgrade for more sessions and turns.` : `You have used all your free decisions and documents this cycle.${when} Upgrade to keep your track record building.`; })()}</span>
          <Btn kind="ghost" size="sm" onClick={onUpgrade}>Go Pro</Btn>
        </div>
      )}
      {seedType && (
        <div className="wo-in" style={{ marginBottom:18, background:"var(--edge)", border:"1px solid var(--line)", borderLeft:"3px solid var(--accent)", borderRadius:6, padding:"12px 14px" }}>
          <span style={{ fontFamily:"var(--serif)", fontSize:15.5, lineHeight:1.5, color:"var(--ink2)" }}>Starting from the same framework{typeof seedType==="string" && seedType ? ` (${seedType})` : ""} as the decision you viewed. Your work is private and separate from theirs.</span>
        </div>
      )}
      {introCollapsed ? (
        <button onClick={toggleIntro} className="wo-in wo-hover" aria-label="Show intro" style={{ display:"inline-flex", alignItems:"center", gap:7, background:"transparent", border:"none", cursor:"pointer", padding:"0 0 12px", color:"var(--meta)" }}>
          <Kicker style={{ color:"var(--meta)" }}>A track record of judgment, not just opinions</Kicker>
          <span style={{ fontFamily:"var(--mono)", fontSize:15, lineHeight:1, color:"var(--meta)" }}>+</span>
        </button>
      ) : (
        <div className="wo-in" style={{ marginBottom:16, position:"relative" }}>
          <button onClick={toggleIntro} aria-label="Collapse intro" className="wo-hover" style={{ position:"absolute", top:0, right:0, background:"transparent", border:"none", cursor:"pointer", color:"var(--meta)", padding:4, display:"flex", borderRadius:5 }}><X size={15} /></button>
          <Kicker>A track record of judgment, not just opinions</Kicker>
          <h1 style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:24, lineHeight:1.12, letterSpacing:"-0.015em", color:"var(--ink)", margin:"9px 0 6px", paddingRight:24 }}>Prove the calls you make.</h1>
          <p style={{ fontFamily:"var(--serif)", fontSize:14.5, lineHeight:1.5, color:"var(--meta)", margin:0, maxWidth:540 }}>WorkOutput structures the decision and drafts the document from one workspace. It seals each decision as a prediction with a review date, and when the date arrives, you grade whether it held. What builds is a verifiable record of your judgment.</p>
        </div>
      )}

      <div className="wo-in" style={{ marginBottom:20, background:"var(--edge)", border:"1px solid var(--line)", borderRadius:10, padding:"14px" }}>
        {/* Decide / Draft switcher */}
        <div style={{ display:"flex", gap:0, marginBottom:12, borderBottom:"1px solid var(--line)" }}>
          {[{id:"decide",label:"Decide",Icon:GitBranch},{id:"draft",label:"Document",Icon:PenLine}].map(t=>(
            <button key={t.id} onClick={()=>setHomeTab(t.id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px 9px", background:"transparent", border:"none", borderBottom:`2px solid ${homeTab===t.id?"var(--accent)":"transparent"}`, cursor:"pointer", fontFamily:"var(--display)", fontWeight:homeTab===t.id?600:400, fontSize:14, color:homeTab===t.id?"var(--ink)":"var(--meta)", marginBottom:-1 }}>
              <t.Icon size={13} style={{ color:homeTab===t.id?"var(--accent)":"var(--meta)" }} />{t.label}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, marginBottom:9, flexWrap:"wrap" }}>
          <span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:16, color:"var(--ink)" }}>
            {homeTab==="draft" ? "What do you want to write?" : "Type or paste your decision"}
          </span>
          <label htmlFor="wo-home-upload" role="button" className="wo-hover" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"transparent", border:"1px solid var(--line)", borderRadius:7, padding:"6px 11px", fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.03em", color:"var(--ink2)", cursor:"pointer" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--ink)"; }} onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--line)"; e.currentTarget.style.color="var(--ink2)"; }}>
            <ArrowUp size={13} />Upload documents
          </label>
        </div>
        <input id="wo-home-upload" ref={fileRef} type="file" multiple accept=".txt,.md,.csv,.pdf,.docx,.xls,.xlsx,.png,.jpg,.jpeg" onChange={e=>{ onFiles(e.target.files); e.target.value=""; }} style={{ position:"absolute", width:1, height:1, opacity:0, overflow:"hidden" }} />
        <textarea ref={taRef} value={paste} onChange={e=>{ setPaste(e.target.value); if(examplePh) setExamplePh(""); }}
          aria-label={homeTab==="draft" ? "What you want to write" : "Your decision"}
          onDragOver={e=>{ e.preventDefault(); }} onDrop={e=>{ e.preventDefault(); const f=e.dataTransfer && e.dataTransfer.files; if(f && f.length) onFiles(f); }}
          placeholder={examplePh || (homeTab==="draft" ? "Describe what you want to write, who it is for, and any key context. You can also drop files here." : "Describe the decision you're weighing. Paste notes, an email, or whatever you have. Drop files here too.")}
          style={{ width:"100%", resize:"vertical", minHeight:60, background:"var(--input-bg)", border:"1px solid var(--input-border)", borderRadius:8, padding:"11px 13px", fontFamily:"var(--serif)", fontSize:15.5, lineHeight:1.5, color:examplePh && !paste?"var(--meta)":"var(--ink)", outline:"none" }} />
        {(extracting || fileChips.length>0 || fileError) && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:10, alignItems:"center" }}>
            {extracting && <span style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--meta)" }}>Reading documents…</span>}
            {fileChips.map((n,i)=>(
              <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:6, fontFamily:"var(--mono)", fontSize:11.5, color:"var(--ink2)", border:"1px solid var(--line)", borderRadius:20, padding:"4px 6px 4px 11px", background:"var(--edge)", maxWidth:260 }}>
                <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n}</span>
                <button onClick={()=>removeChip(i)} aria-label="Remove" style={{ background:"none", border:"none", cursor:"pointer", color:"var(--meta)", display:"flex", padding:2 }}><X size={12} /></button>
              </span>
            ))}
            {fileError && <span style={{ fontFamily:"var(--serif)", fontSize:13.5, color:"var(--critical)" }}>{fileError}</span>}
          </div>
        )}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10, gap:14 }}>
          <span style={{ flex:1, minWidth:0, maxWidth:330, fontFamily:"var(--serif)", fontSize:12, fontStyle:"italic", lineHeight:1.35, color:"var(--meta)" }}>
            {homeTab==="draft" ? "WorkOutput clarifies what's needed, then produces the complete document." : "WorkOutput asks a few clarifying questions, then structures the rest."}
          </span>
          <Btn onClick={submit} disabled={!canStart} style={{ flexShrink:0 }}>Start <ArrowRight size={15} /></Btn>
        </div>
      </div>

      {/* Start from a category — switches with homeTab */}
      {homeTab === "decide" && (
        <div className="wo-in" style={{ marginBottom:14 }}>
          <Kicker style={{ color:"var(--meta)", marginBottom:9 }}>Start from a category</Kicker>
          <div style={{ border:"1px solid var(--line)", borderRadius:10, overflow:"hidden", background:"var(--edge)" }}>
            {PACKS.map((p,i)=>{
              const isOpen = open===p.id;
              return (
                <div key={p.id} style={{ borderTop:i>0?"1px solid var(--line-soft)":"none" }}>
                  <button type="button" onClick={(e)=>preserveScroll(e, ()=>setOpen(isOpen?null:p.id), !isOpen)} style={{ width:"100%", display:"flex", alignItems:"center", gap:11, padding:"9px 14px", background:isOpen?"var(--accent-soft)":"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
                    <CatGlyph cat={p} />
                    <span style={{ flex:1, minWidth:0 }}>
                      <span style={{ display:"block", fontFamily:"var(--display)", fontWeight:600, fontSize:15, color:"var(--ink)", lineHeight:1.2 }}>{p.label}</span>
                      <span style={{ display:"block", fontFamily:"var(--serif)", fontSize:12.5, color:"var(--meta)", marginTop:1 }}>{p.blurb}</span>
                    </span>
                    <span style={{ fontFamily:"var(--mono)", fontSize:17, color:"var(--meta)", transform:isOpen?"rotate(45deg)":"none", transition:"transform .2s", flexShrink:0 }}>+</span>
                  </button>
                  {isOpen && (
                    <div className="wo-in" style={{ padding:"2px 14px 13px 45px", display:"flex", flexWrap:"wrap", gap:7 }}>
                      {p.items.map(it=>(<Chip key={it} onClick={()=>showExample(it)}>{it}</Chip>))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {homeTab === "draft" && (
        <div className="wo-in" style={{ marginBottom:14 }}>
          <Kicker style={{ color:"var(--meta)", marginBottom:9 }}>Or start from a document type</Kicker>
          <div style={{ border:"1px solid var(--line)", borderRadius:10, overflow:"hidden", background:"var(--edge)" }}>
            {DOC_CATEGORIES.map((cat, i) => {
              const isOpen = open === ("draft-" + cat.id);
              return (
                <div key={cat.id} style={{ borderTop:i>0?"1px solid var(--line-soft)":"none" }}>
                  <button type="button" onClick={(e)=>preserveScroll(e, ()=>setOpen(isOpen ? null : "draft-" + cat.id), !isOpen)}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:11, padding:"9px 14px", background:isOpen?"var(--accent-soft)":"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
                    <CatGlyph cat={cat} />
                    <span style={{ flex:1, minWidth:0 }}>
                      <span style={{ display:"block", fontFamily:"var(--display)", fontWeight:600, fontSize:15, color:"var(--ink)", lineHeight:1.2 }}>{cat.label}</span>
                      <span style={{ display:"block", fontFamily:"var(--serif)", fontSize:12.5, color:"var(--meta)", marginTop:1 }}>{cat.blurb}</span>
                    </span>
                    <span style={{ fontFamily:"var(--mono)", fontSize:17, color:"var(--meta)", transform:isOpen?"rotate(45deg)":"none", transition:"transform .2s", flexShrink:0 }}>+</span>
                  </button>
                  {isOpen && (
                    <div className="wo-in" style={{ padding:"2px 14px 13px 45px", display:"flex", flexWrap:"wrap", gap:7 }}>
                      {docItemsForCategory(cat.id).slice(0,6).map(t => {
                        const label = t.label;
                        // Selecting a document type stages its intake prompt into the
                        // composer for edit-or-send, rather than auto-sending. The user can
                        // edit the prompt or submit as-is; submit runs the normal onDraft path.
                        return (
                          <Chip key={label} onClick={()=>{ const seed = t.intake || ("I want to write a " + label + ". Here is the context: "); setExamplePh(""); setPaste(seed); pendingDraftTemplateRef.current = documentTemplateIdForLabel(label) || null; requestAnimationFrame(()=>{ try{ const el=taRef.current; if(el){ el.focus(); const n=el.value.length; el.setSelectionRange(n,n); } }catch(_){} }); }}>{label}</Chip>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* v89: first-visit users see one consolidated entry card; complexity is earned.
          Returning users (>=1 session) see the full Decide / Draft / Library set. */}
      {(sessionCount > 0) ? (
        <div className="wo-in" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10, marginBottom:20 }}>
          {[{id:"templates",label:"Decide from a template",icon:GitBranch,sub:"Work through a structured decision"},
            {id:"templates-draft",label:"Document from a template",icon:PenLine,sub:"Produce a working document"},
            {id:"library",label:"Open Decision Library",icon:Library,sub:"Pick up where you left off",feature:"library"}].map(a=>{
            const Icon=a.icon; const locked=a.feature && !has(tier,a.feature);
            return (
              <button key={a.id} className="wo-card-hover" onClick={()=>{ if(a.id==="templates") setView("templates"); else if(a.id==="templates-draft"){ setView("Draft"); } else locked?onUpgrade():setView("library"); }} style={{ textAlign:"left", background:"var(--edge)", border:"1px solid var(--line)", borderRadius:9, padding:"12px 13px", cursor:"pointer" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}><Icon size={16} style={{ color:"var(--accent)" }} />{locked && <Lock size={12} style={{ color:"var(--meta)" }} />}</div>
                <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:14.5, color:"var(--ink)", marginTop:9 }}>{a.label}</div>
                <div style={{ fontFamily:"var(--serif)", fontSize:12.5, color:"var(--meta)", marginTop:2 }}>{a.sub}</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="wo-in" style={{ marginBottom:20 }}>
          <button className="wo-card-hover" onClick={()=>setView(homeTab==="draft" ? "Draft" : "templates")} style={{ width:"100%", textAlign:"left", background:"var(--edge)", border:"1px solid var(--line)", borderRadius:9, padding:"14px 15px", cursor:"pointer", display:"flex", alignItems:"center", gap:13 }}>
            <span style={{ width:38, height:38, borderRadius:9, background:"var(--accent-soft)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {homeTab==="draft" ? <PenLine size={18} style={{ color:"var(--accent)" }} /> : <GitBranch size={18} style={{ color:"var(--accent)" }} />}
            </span>
            <span style={{ flex:1, minWidth:0 }}>
              <span style={{ display:"block", fontFamily:"var(--display)", fontWeight:600, fontSize:15, color:"var(--ink)" }}>Start from a template</span>
              <span style={{ display:"block", fontFamily:"var(--serif)", fontSize:13, color:"var(--meta)", marginTop:2 }}>{homeTab==="draft" ? "Browse document templates to produce a working document" : "Browse structured decision templates"}</span>
            </span>
            <ChevronRight size={16} style={{ color:"var(--meta)", flexShrink:0 }} />
          </button>
        </div>
      )}

      {has(tier,"library") && recent && recent.length>0 && (
        <div className="wo-in">
          <Kicker style={{ color:"var(--meta)", marginBottom:10 }}>Recent</Kicker>
          <div style={{ border:"1px solid var(--line)", borderRadius:10, overflow:"hidden", background:"var(--edge)" }}>
            {recent.slice(0,3).map((s,i)=>(
              <button key={s.id} onClick={()=>onOpen ? onOpen(s.id) : setView("library")} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"13px 16px", background:"transparent", border:"none", borderTop:i>0?"1px solid var(--line-soft)":"none", cursor:"pointer", textAlign:"left" }}>
                <StatusDotV72 status={s.status} />
                <span style={{ flex:1, fontFamily:"var(--serif)", fontSize:15.5, color:"var(--ink)" }}>{s.title}</span>
                <ChevronRight size={15} style={{ color:"var(--meta)" }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── RIGHT PANEL (contextual machinery, wired to real intelligence) ────────────────
function RightPanel({ stage, tier, onUpgrade, onCommit, onExplore, onShare, onCard, onAdvanced, runIntel, runOverlay, runContradiction, advRunning, readiness, attached, inline, turns=0 }){
  const Tool = ({ icon:Icon, label, feature, onClick, cost })=>{
    const locked = feature && !has(tier, feature);
    return (
      <button onClick={locked?onUpgrade:onClick} className="wo-hover" style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 13px", background:"var(--edge)", border:"1px solid var(--line)", borderRadius:8, cursor:"pointer", textAlign:"left", marginBottom:8 }}>
        <Icon size={15} style={{ color:locked?"var(--meta)":"var(--accent)", flexShrink:0 }} />
        <span style={{ flex:1, fontFamily:"var(--serif)", fontSize:14.5, color:"var(--ink2)", display:"inline-flex", alignItems:"center" }}>{label}<InfoTip k={label} /></span>
        {!locked && cost ? <span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.04em", color:"var(--meta)", flexShrink:0 }}>{cost} {cost===1?"credit":"credits"}</span> : null}
        {locked && <LockTag onClick={onUpgrade} />}
      </button>
    );
  };
  const body = (
    <>
      {stage==="clarify" && (
        <>
          <div style={{ marginBottom:20 }}>
            <Kicker style={{ color:"var(--meta)", marginBottom:10 }}>Suggested next step</Kicker>
            {turns >= 3 && <Btn full kind="ghost" onClick={onExplore} style={{ marginBottom:8 }}>Lay out the options <ArrowRight size={15} /></Btn>}
            <Btn full kind="ghost" onClick={onCommit} style={{ marginBottom:12 }}>Skip ahead to the output</Btn>
            <p style={{ fontFamily:"var(--serif)", fontSize:13, color:"var(--meta)", fontStyle:"italic", margin:0, lineHeight:1.45 }}>Or keep answering questions in the message box below.</p>
          </div>
          <div style={{ borderTop:"1px solid var(--line-soft)", paddingTop:20 }}>
            <Kicker style={{ color:"var(--meta)", marginBottom:10 }}>Tools</Kicker>
            <Tool icon={Sliders} label="Advanced analysis tools" feature="advancedTools" onClick={onAdvanced} />
          </div>
        </>
      )}
      {stage==="explore" && (
        <>
          <div style={{ marginBottom:14 }}><Meter value={readiness} /></div>
          <p style={{ fontFamily:"var(--serif)", fontSize:13, color:"var(--meta)", fontStyle:"italic", margin:"0 0 16px" }}>To improve: add a cost range, a deadline, and a success metric.</p>
          <Tool icon={GitBranch} label="Map dependencies" feature="advancedTools" onClick={()=>runIntel("dep")} cost={CREDIT_COSTS.dependencyMap} />
          <Tool icon={AlertTriangle} label="Run a pre-mortem" feature="advancedTools" onClick={()=>runIntel("fail")} cost={CREDIT_COSTS.failureSimulation} />
          <Tool icon={Target} label="Compare to similar decisions" feature="advancedTools" onClick={()=>runIntel("bench")} cost={CREDIT_COSTS.benchmark} />
          <Tool icon={Eye} label="Stress-test by role" feature="advancedTools" onClick={()=>runOverlay("perspective")} cost={CREDIT_COSTS.multiPerspectiveReview} />
          <Tool icon={Sliders} label="Advanced analysis tools" feature="advancedTools" onClick={onAdvanced} />
          <Btn full kind="ghost" onClick={onCommit} style={{ marginTop:8 }}>Move to Commit <ArrowRight size={15} /></Btn>
        </>
      )}
      {stage==="commit" && (
        <>
          <div style={{ background:"var(--accent-soft)", borderRadius:10, padding:"14px", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}><CheckCircle2 size={15} style={{ color:"var(--accent)" }} /><span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:15, color:"var(--ink)" }}>Decision committed</span></div>
            <p style={{ fontFamily:"var(--serif)", fontSize:14, color:"var(--ink2)", margin:0 }}>Saved to your library. Your profile updates as you commit decisions.</p>
          </div>
          <Btn full onClick={onShare} style={{ marginBottom:8 }}><Share2 size={15} />Share playbook</Btn>
          <Btn full kind="ghost" onClick={onCard} style={{ marginBottom:8 }}><Download size={15} />Decision card</Btn>
          {attached && attached.length>0 && has(tier,"advancedTools") && (
            <div style={{ background:"var(--edge)", border:"1px solid var(--line)", borderRadius:8, padding:"12px 13px", marginBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}><Layers size={14} style={{ color:"var(--accent)" }} /><span style={{ fontFamily:"var(--serif)", fontSize:14, color:"var(--ink)", fontWeight:500 }}>Used prior context from {attached.length} {attached.length===1?"decision":"decisions"}</span></div>
            </div>
          )}
          <Tool icon={Shield} label="Check for conflicts" feature="conflictCheck" onClick={runContradiction} cost={CREDIT_COSTS.contradictionScan} />
        </>
      )}
    </>
  );
  if(inline) return <div>{body}</div>;
  return (
    <aside className="wo-sc" style={{ width:300, flexShrink:0, background:"var(--panel)", borderLeft:"1px solid var(--line)", padding:"20px 16px", overflowY:"auto", height:"100%" }}>
      <Kicker style={{ marginBottom:14 }}>{stage==="clarify"?"Getting started":stage==="explore"?"Explore tools":"Commit & share"}</Kicker>
      {body}
    </aside>
  );
}

// ── COMPOSER (with attach) ───────────────────────────────────────────────────────
function ComposerV72({ value, onChange, onSend, sending, streaming, onStop, narrow, onAppendText, uploadAllowed=true, uploadCap=Infinity, onUploadBlocked }){
  const fileRef = React.useRef(null);
  const attachmentsRef = React.useRef([]);   // native document/image blocks for the API
  const nativeSizesRef = React.useRef([]);   // v112: raw bytes of accepted native attachments, for the per-session budget
  const [chips, setChips] = React.useState([]);
  const [attCount, setAttCount] = React.useState(0);
  const [reading, setReading] = React.useState(false);
  const onFiles = async (fileList) => {
    // v102: upload entitlement. Guest cannot upload; Free is capped (1 small upload per
    // session). uploadAllowed / uploadCap are derived from the tier at the call site.
    if (!uploadAllowed) { if (onUploadBlocked) onUploadBlocked(); return; }
    let files = Array.from(fileList||[]); if(!files.length) return;
    if (Number.isFinite(uploadCap)) {
      const remaining = Math.max(0, uploadCap - chips.length);
      if (remaining <= 0) { if (onUploadBlocked) onUploadBlocked("cap"); return; }
      if (files.length > remaining) files = files.slice(0, remaining);
    }
    setReading(true);
    for(const f of files){
      const nm=(f.name||"").toLowerCase(); const ext=nm.includes(".")?nm.slice(nm.lastIndexOf(".")):"";
      // v99.7 (P11): same encoded-payload cap as the Home uploader.
      const _isNative = !!attachmentKindFor(ext);
      const _cap = _isNative ? ATTACH_FILE_MAX_NATIVE : ATTACH_FILE_MAX_TEXT;
      if(f.size > _cap){ if(onUploadBlocked) onUploadBlocked("size", `${f.name} is ${_fmtMB(f.size)}. The limit is ${_fmtMB(_cap)} per ${_isNative?"PDF or image":"text"} file. Attach a smaller file.`); continue; }
      if(_isNative){
        const _remaining = ATTACH_SESSION_NATIVE_MAX - _attachSessionUsed(nativeSizesRef.current);
        if(f.size > _remaining){ if(onUploadBlocked) onUploadBlocked("size", `${f.name} is ${_fmtMB(f.size)} but only ${_fmtMB(Math.max(0,_remaining))} of the ${_fmtMB(ATTACH_SESSION_NATIVE_MAX)} per-session attachment budget is left. Send your current message to clear it, or attach a smaller file.`); continue; }
      }
      try{
        if(attachmentKindFor(ext)){ attachmentsRef.current=[...attachmentsRef.current, await fileToAttachment(f, ext)]; nativeSizesRef.current=[...nativeSizesRef.current, f.size]; setAttCount(c=>c+1); setChips(prev=>[...prev, f.name+" (attached for the AI to read)"]); }
        else { const t = await extractFileText(f); if(t && t.trim()){ onAppendText && onAppendText("----- "+f.name+" -----\n"+t.trim()); setChips(prev=>[...prev, f.name]); } else setChips(prev=>[...prev, f.name+" (no text found)"]); }
      }catch(_){ setChips(prev=>[...prev, f.name+" (unreadable)"]); }
    }
    setReading(false);
  };
  const removeChip = (i) => setChips(prev=>prev.filter((_,j)=>j!==i));
  const canSend = (!!value.trim() || attCount>0) && !sending && !reading;
  const doSend = () => {
    if(!canSend) return;
    const atts = attachmentsRef.current.slice();
    // v99.7 (M8) / v99.9 (M8b): attachments are cleared only once the send is
    // DELIVERED (request accepted and stream completed). Pre-flight rejections
    // (turn cap, loading) and in-flight failures (network drop, API 5xx, stream
    // error) both leave the files attached, so a retry resends them. onSend
    // receives an onDelivered callback that sendMessage invokes post-stream.
    onSend(atts, () => { attachmentsRef.current = []; nativeSizesRef.current = []; setAttCount(0); setChips([]); });
  };
  return (
    <div style={{ borderTop:"1px solid var(--line)", background:"var(--panel)", padding:narrow?"10px 12px":"14px 22px", flexShrink:0 }}>
      <div style={{ maxWidth:720, margin:"0 auto" }}>
        {(chips.length>0 || reading) && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:9, alignItems:"center" }}>
            {reading && <span style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--meta)" }}>Reading documents…</span>}
            {chips.map((n,i)=>(<span key={i} style={{ display:"inline-flex", alignItems:"center", gap:6, fontFamily:"var(--mono)", fontSize:11, color:"var(--ink2)", border:"1px solid var(--line)", borderRadius:20, padding:"4px 6px 4px 10px", background:"var(--edge)", maxWidth:240 }}><span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n}</span><button onClick={()=>removeChip(i)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--meta)", display:"flex", padding:1 }}><X size={11} /></button></span>))}
          </div>
        )}
        <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
          <input id="wo-composer-upload" ref={fileRef} type="file" multiple accept=".txt,.md,.csv,.pdf,.docx,.xls,.xlsx,.png,.jpg,.jpeg" onChange={e=>{ onFiles(e.target.files); e.target.value=""; }} style={{ position:"absolute", width:1, height:1, opacity:0, overflow:"hidden" }} />
          <label htmlFor="wo-composer-upload" role="button" aria-label="Attach documents" className="wo-hover" style={{ width:46, height:46, flexShrink:0, background:"transparent", border:"1px solid var(--line)", borderRadius:10, color:"var(--ink2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--ink)"; }} onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--line)"; e.currentTarget.style.color="var(--ink2)"; }}><Plus size={18} /></label>
          <textarea value={value} onChange={e=>onChange(e.target.value)} aria-label="Your reply" placeholder="Reply, add detail, or drop documents..." onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); doSend(); } }}
            onDragOver={e=>{ e.preventDefault(); }} onDrop={e=>{ e.preventDefault(); const f=e.dataTransfer && e.dataTransfer.files; if(f && f.length) onFiles(f); }}
            style={{ flex:1, resize:"none", minHeight:46, maxHeight:140, background:"var(--input-bg)", border:"1px solid var(--input-border)", borderRadius:10, padding:"12px 14px", fontFamily:"var(--serif)", fontSize:16, lineHeight:1.5, color:"var(--ink)", outline:"none" }} />
          {streaming ? <Btn kind="ghost" onClick={onStop} style={{ minWidth:48, padding:"12px" }}><X size={17} /></Btn>
                     : <Btn onClick={doSend} disabled={!canSend} style={{ minWidth:48, padding:"12px" }}><ArrowUp size={17} /></Btn>}
        </div>
      </div>
    </div>
  );
}

// ── DECISION LIBRARY (real session list — scales past the patterns overview) ─────
function LibraryView({ sessions, onOpen, onDelete, onNew, setView, pad, onSetScope }){
  const [q, setQ] = React.useState("");
  const [scopeF, setScopeF] = React.useState("all");
  // v99.6 (H3 fix): inline delete confirmation. The v99.5 S4 note claimed this
  // existed in LibraryView; it was only in DraftLibraryView. One tap on the X was
  // permanently deleting a decision (blob + index row) with no confirm and no undo.
  const [confirmDeleteId, setConfirmDeleteId] = React.useState(null);
  const all = sessions || [];
  const isWork = s => s.scope==="work";
  const counts = { all: all.length, work: all.filter(isWork).length, personal: all.filter(s=>!isWork(s)).length };
  const list = all.filter(s => (scopeF==="all" || (scopeF==="work" ? isWork(s) : !isWork(s))) && (!q || (s.title||"").toLowerCase().includes(q.toLowerCase())));
  const fmt = (ts) => { if(!ts) return ""; const d=Date.now()-ts, day=864e5; if(d<day) return "Today"; if(d<2*day) return "Yesterday"; if(d<7*day) return Math.floor(d/day)+" days ago"; try{ return new Date(ts).toLocaleDateString(undefined,{month:"short",day:"numeric"}); }catch(_){ return ""; } };
  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:pad }}>
      <div className="wo-in" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", gap:12, flexWrap:"wrap", marginBottom:18 }}>
        <div>
          <Kicker style={{ marginBottom:6 }}>Decision Library</Kicker>
          <h1 style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:26, color:"var(--ink)", margin:0 }}>Every decision you have worked through</h1>
          <p style={{ fontFamily:"var(--serif)", fontSize:15, color:"var(--meta)", margin:"6px 0 0" }}>
            {all.length} {all.length===1?"decision":"decisions"} saved. Reopen any to continue where you left off.
            {/* v98.9 (E4): surface the 50-row index cap so users know older sessions exist in
                storage but are not shown. Blobs are not deleted — only the index row is capped. */}
            {all.length >= 50 && <span style={{ marginLeft:6, fontFamily:"var(--mono)", fontSize:11, color:"var(--meta)" }}>(showing your 50 most recent)</span>}
          </p>
        </div>
        <Btn onClick={()=>{ onNew(); setView("Home"); }}><Plus size={15} />New decision</Btn>
      </div>
      {all.length>0 && (
        <div className="wo-in" style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
          {[["all","All"],["work","Work"],["personal","Personal"]].map(([k,lab])=>{
            const on = scopeF===k;
            return (
              <button key={k} onClick={()=>setScopeF(k)} className="wo-hover" style={{ fontFamily:"var(--mono)", fontSize:11.5, letterSpacing:"0.03em", color:on?"var(--paper)":"var(--ink2)", background:on?"var(--accent)":"transparent", border:`1px solid ${on?"var(--accent)":"var(--line)"}`, borderRadius:7, padding:"6px 12px", cursor:"pointer" }}>
                {lab}<span style={{ opacity:0.7, marginLeft:6 }}>{counts[k]}</span>
              </button>
            );
          })}
        </div>
      )}
      {all.length>6 && (
        <div className="wo-in" style={{ marginBottom:14 }}>
          <input value={q} onChange={e=>setQ(e.target.value)} aria-label="Search decisions" placeholder="Search decisions…" style={{ width:"100%", background:"var(--input-bg)", border:"1px solid var(--input-border)", borderRadius:9, padding:"11px 14px", fontFamily:"var(--serif)", fontSize:15.5, color:"var(--ink)", outline:"none" }} />
        </div>
      )}
      {list.length===0 ? (
        <div className="wo-in" style={{ textAlign:"center", padding:"54px 20px", border:"1px dashed var(--line)", borderRadius:12 }}>
          <Library size={26} style={{ color:"var(--meta)", marginBottom:12 }} />
          <p style={{ fontFamily:"var(--serif)", fontSize:16, color:"var(--meta)", margin:"0 0 16px" }}>{all.length===0 ? "No decisions yet. Your committed and in-progress decisions land here." : "No decisions match the current filter."}</p>
          {all.length===0 && <Btn onClick={()=>{ onNew(); setView("Home"); }}>Start your first decision</Btn>}
        </div>
      ) : (
        <div className="wo-in" style={{ border:"1px solid var(--line)", borderRadius:12, overflow:"hidden", background:"var(--edge)" }}>
          {list.map((s,i)=>(
            <div key={s.id} className="wo-hover" style={{ display:"flex", alignItems:"center", gap:13, padding:"14px 16px", borderTop:i>0?"1px solid var(--line-soft)":"none", cursor:"pointer" }}
              onClick={()=>onOpen(s.id)}
              onMouseEnter={e=>{ e.currentTarget.style.background="var(--accent-soft)"; }} onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; }}>
              <StatusDotV72 status={s.status||s.mode||""} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"var(--serif)", fontSize:16, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.title||"Untitled decision"}</div>
                <div style={{ display:"flex", gap:10, marginTop:3, flexWrap:"wrap", alignItems:"center" }}>
                  {s.status && <span style={{ fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.04em", color:"var(--meta)" }}>{s.status}</span>}
                  {s.hasDoc && <span style={{ fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.04em", color:"var(--accent)" }}>Output ready</span>}
                  {(s.hasDoc || s.status==="Committed") && <OutcomeBadge outcome={s.outcome} reviewDueAt={s.reviewDueAt} />}
                  <ScopeTag scope={s.scope||"personal"} compact onToggle={onSetScope ? (next)=>onSetScope(s.id, next) : undefined} />
                  {typeof s.readiness==="number" && <span style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--meta)" }}>Readiness {Math.round(s.readiness)}</span>}
                  <span style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--meta)" }}>{fmt(s.updatedAt)}</span>
                </div>
              </div>
              {confirmDeleteId === s.id ? (
                <div style={{ display:"flex", gap:5, alignItems:"center", flexShrink:0 }} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>{ onDelete(s.id); setConfirmDeleteId(null); }} style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.03em", color:"var(--critical)", background:"transparent", border:"1px solid var(--critical)", borderRadius:5, padding:"3px 8px", cursor:"pointer" }}>Delete</button>
                  <button onClick={()=>setConfirmDeleteId(null)} style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.03em", color:"var(--meta)", background:"transparent", border:"1px solid var(--line)", borderRadius:5, padding:"3px 8px", cursor:"pointer" }}>Cancel</button>
                </div>
              ) : (
                <button aria-label="Delete decision" onClick={e=>{ e.stopPropagation(); setConfirmDeleteId(s.id); }} className="wo-hover" style={{ background:"none", border:"none", cursor:"pointer", color:"var(--meta)", padding:6, display:"flex", flexShrink:0 }}
                  onMouseEnter={e=>{ e.currentTarget.style.color="var(--critical)"; }} onMouseLeave={e=>{ e.currentTarget.style.color="var(--meta)"; }}><X size={15} /></button>
              )}
              <ChevronRight size={16} style={{ color:"var(--meta)", flexShrink:0 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Shared curated row used by both tabs for "Trending this week" and "Most used".
// items: [{ key, label, sub }]. numbered shows a rank index. onPick(label) acts.
function PromoRow({ icon:Icon, title, items, onPick, numbered }){
  if(!items || !items.length) return null;
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}><Icon size={15} style={{ color:"var(--accent)" }} /><Kicker style={{ color:"var(--meta)" }}>{title}</Kicker></div>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        {items.map((it,i)=>(
          <button key={it.key} onClick={()=>onPick(it.label)} className="wo-hover" style={{ textAlign:"left", flex:"1 1 200px", background:"var(--edge)", border:"1px solid var(--line)", borderRadius:9, padding:"11px 13px", cursor:"pointer" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {numbered && <span style={{ fontFamily:"var(--display)", fontWeight:700, fontSize:15, color:i<3?"var(--accent)":"var(--meta)", flexShrink:0 }}>{i+1}</span>}
              <span style={{ flex:1, minWidth:0, fontFamily:"var(--serif)", fontSize:14.5, color:"var(--ink)", lineHeight:1.25 }}>{it.label}</span>
              {numbered && i===0 && <Trophy size={13} style={{ color:"var(--accent)", flexShrink:0 }} />}
            </div>
            <div style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--meta)", marginTop:3, letterSpacing:"0.03em", paddingLeft:numbered?23:0 }}>{it.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── TEMPLATES / STRUCTURES GALLERY ───────────────────────────────────────────────
function TemplatesView({ tier, onUse, onDraft, onShare, onUpgrade, pad, initialTab, sessionCount }){
  const [tab, setTab] = React.useState(initialTab || "decide");
  const [draftCatOpen, setDraftCatOpen] = React.useState(null); // v126.7: closed on first view to streamline for new users
  const [decideCatOpen, setDecideCatOpen] = React.useState(null); // v126.7: closed on first view to streamline for new users
  // Sync tab when initialTab prop changes (e.g. navigating from "templates" to "Draft" view)
  React.useEffect(()=>{ if(initialTab) setTab(initialTab); },[initialTab]);
  // Curated cuts shared by both tabs. v125: "Most used" leads with the Segment A
  // (consultant / fractional-exec) wedge; "Trending this week" rotates weekly. Neither
  // is a usage metric pre-launch.
  const decideRanked = STRUCTURES.slice().sort((a,b)=>demandRank(a.name)-demandRank(b.name));
  const decideMostUsed = decideRanked.slice(0,5).map(s=>({ key:"d"+s.id, label:s.name, sub:s.type }));
  const decideTrending = weekRotate(STRUCTURES.slice()).slice(0,5).map(s=>({ key:"dt"+s.id, label:s.name, sub:s.type }));
  const docRanked = DOCUMENT_TEMPLATES.slice().sort((a,b)=>docDemandRank(a.label)-docDemandRank(b.label));
  const docMostUsed = (DOCUMENT_TEMPLATES.filter(t=>t.featured).length ? DOCUMENT_TEMPLATES.filter(t=>t.featured) : docRanked.slice(0,5)).map(t=>({ key:"m"+t.id, label:t.label, sub:t.category }));
  const docTrending = weekRotate(DOCUMENT_TEMPLATES.slice()).slice(0,5).map(t=>({ key:"tt"+t.id, label:t.label, sub:t.category }));
  // v125: instrumented launch wrappers. Emit a per-template event, then delegate to the
  // existing handler. Used by every Use/Create/Draft control and the curated rows.
  const trackUse = (name) => {
    trackCatalogEvent("template_use", { tab:"decide", name });
    onUse(name);
  };
  const trackDraft = (label) => {
    const cat = (DOCUMENT_TEMPLATES.find(t => t.label === label) || {}).category || null;
    trackCatalogEvent("template_draft", { tab:"document", label, category:cat, segment: SEGMENT_FOR_DOC_CATEGORY[cat] || "cross" });
    onDraft(label);
  };
  const [recent, setRecent] = React.useState([]);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const searchRef = React.useRef(null);
  React.useEffect(()=>{ (async()=>{ try{ setRecent(await loadRecentTemplates()); }catch(_){} })(); },[]);
  React.useEffect(()=>{ if(searchOpen){ try{ searchRef.current?.focus(); }catch(_){} } },[searchOpen]);
  // Persist search across tab switches within Templates
  React.useEffect(()=>{ if(tab==="draft") setDraftCatOpen(null); },[tab]); // v126.7: draft accordion stays closed on tab entry
  const recentStructures = recent.map(n=>STRUCTURES.find(s=>s.name===n)).filter(Boolean);
  const ql = q.trim().toLowerCase();
  const filteredDecide = ql ? STRUCTURES.filter(s => s.name.toLowerCase().includes(ql) || s.type.toLowerCase().includes(ql)) : STRUCTURES;
  const filteredDraft = ql ? DOCUMENT_TEMPLATES.filter(t => t.label.toLowerCase().includes(ql) || t.category.toLowerCase().includes(ql)) : DOCUMENT_TEMPLATES;

  const TabBtn = ({ id, label, icon: Icon }) => (
    <button onClick={()=>setTab(id)} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px 8px", background:"transparent", border:"none", borderBottom:`2px solid ${tab===id?"var(--accent)":"transparent"}`, cursor:"pointer", fontFamily:"var(--display)", fontWeight:tab===id?600:400, fontSize:15, color:tab===id?"var(--ink)":"var(--meta)", transition:"color 0.15s" }}>
      <Icon size={15} style={{ color:tab===id?"var(--accent)":"var(--meta)" }} />{label}
    </button>
  );

  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:pad }}>
      {/* Header */}
      <div style={{ marginBottom:4 }}>
        <Kicker style={{ marginBottom:6 }}>Templates</Kicker>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:12 }}>
          <div>
            <h1 style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:26, color:"var(--ink)", margin:"0 0 4px" }}>
              {tab==="decide" ? "Decide" : "Document"}
            </h1>
            <p style={{ fontFamily:"var(--serif)", fontSize:14.5, color:"var(--meta)", margin:0, maxWidth:520 }}>
              {tab==="decide"
                ? "Work through a decision. Clarify, explore options, commit to a call."
                : "Skip the blank page. Answer a few questions, walk away with a working document."}
            </p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Btn onClick={()=>{ setSearchOpen(o=>{ const next=!o; if(!next) setQ(""); return next; }); }}><Search size={15} />Search</Btn>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", borderBottom:"1px solid var(--line)", marginBottom:22, gap:0 }}>
        <TabBtn id="decide" label="Decide" icon={GitBranch} />
        <TabBtn id="draft" label="Document" icon={PenLine} />
      </div>

      {searchOpen && (
        <input ref={searchRef} value={q} onChange={e=>setQ(e.target.value)} aria-label={tab==="decide" ? "Search decision templates" : "Search document templates"}
          placeholder={tab==="decide" ? "Search decision templates…" : "Search document templates…"}
          style={{ width:"100%", background:"var(--input-bg)", border:"1px solid var(--input-border)", borderRadius:9, padding:"10px 13px", fontFamily:"var(--serif)", fontSize:15, color:"var(--ink)", outline:"none", boxSizing:"border-box", marginBottom:18 }} />
      )}

      {/* ── DECIDE TAB ── */}
      {tab==="decide" && (
        <div>
          {!searchOpen && recentStructures.length>0 && (
            <div style={{ marginBottom:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}><Clock size={15} style={{ color:"var(--accent)" }} /><Kicker style={{ color:"var(--meta)" }}>Recently used</Kicker></div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {recentStructures.map(s=>(
                  <button key={s.id} onClick={()=>trackUse(s.name)} className="wo-hover" style={{ textAlign:"left", flex:"1 1 200px", background:"var(--edge)", border:"1px solid var(--line)", borderRadius:9, padding:"11px 13px", cursor:"pointer" }}>
                    <div style={{ fontFamily:"var(--serif)", fontSize:14.5, color:"var(--ink)", lineHeight:1.25 }}>{s.name}</div>
                    <div style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--meta)", marginTop:3, letterSpacing:"0.03em" }}>{s.type}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {!searchOpen && <PromoRow icon={Flame} title="Trending this week" items={decideTrending} onPick={trackUse} numbered />}
          {!searchOpen && <PromoRow icon={Sparkles} title="Most used" items={decideMostUsed} onPick={trackUse} />}
          <div>
            <Kicker style={{ color:"var(--meta)", marginBottom:10 }}>{ql ? "All decision templates" : "By decision type"}</Kicker>
            {filteredDecide.length===0 ? (
              <p style={{ fontFamily:"var(--serif)", fontSize:14.5, color:"var(--meta)", fontStyle:"italic", margin:"4px 0 0" }}>No templates match &ldquo;{q}&rdquo;.</p>
            ) : ql ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
                {filteredDecide.map(s=>{
                  const tmpl = TEMPLATES.find(x=>x.label===s.name);
                  return (
                  <div key={s.id} className="wo-card-hover" style={{ background:"var(--edge)", border:"1px solid var(--line)", borderRadius:10, padding:"16px", display:"flex", flexDirection:"column" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--slate)" }}>{s.type}</span>
                    </div>
                    <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:17, color:"var(--ink)", margin:"10px 0 5px", lineHeight:1.2 }}>{s.name}</div>
                    {tmpl && <div style={{ fontFamily:"var(--serif)", fontSize:12.5, color:"var(--meta)", marginBottom:5, lineHeight:1.4, flex:1 }}>{tmpl.desc}</div>}
                    {tmpl && tmpl.rail && <div style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--slate)", letterSpacing:"0.03em", marginBottom:11 }}>{tmpl.rail}</div>}
                    <div style={{ display:"flex", gap:8 }}><Btn size="sm" full onClick={()=>trackUse(s.name)}>Use</Btn><Btn size="sm" kind="ghost" onClick={onShare}><Share2 size={13} /></Btn></div>
                  </div>
                  );
                })}
              </div>
            ) : (
              (()=>{
                const DECIDE_CATEGORIES = [
                  // v125: A-heavy decision types first. Note this view groups by decision
                  // type, not ICP, so it is a softer wedge lever than the doc topics above.
                  { id:"Compare Options",   label:"Compare Options",    mark:"◧", blurb:"Build vs buy, vendor, pricing, and GTM choices" },
                  { id:"Evaluate Risk",     label:"Evaluate Risk",      mark:"◆", blurb:"Pre-mortems, risk reviews, and readiness checks" },
                  { id:"Approve or Reject", label:"Approve or Reject",  mark:"●", blurb:"Go / no-go, hire, deal-desk, and sunset calls" },
                  { id:"Prioritize",        label:"Prioritize",         mark:"▲", blurb:"Feature, roadmap, scope, and budget calls" },
                  { id:"Plan",              label:"Plan",               mark:"⬡", blurb:"Capacity, competitive response, and conversations" },
                  { id:"Diagnose",          label:"Diagnose",           mark:"⊙", blurb:"Bottlenecks, churn, and compliance gaps" },
                  { id:"Negotiate",         label:"Negotiate",          mark:"◎", blurb:"Vendor terms and offer negotiation prep" },
                  { id:"Communicate",       label:"Communicate",        mark:"✦", blurb:"Difficult and high-stakes messages" },
                  { id:"Personal",          label:"Personal",           mark:"●", blurb:"Career moves, offers, relationships, health, and major personal calls" },
                ];
                return (
                  <div style={{ border:"1px solid var(--line)", borderRadius:10, overflow:"hidden" }}>
                    {DECIDE_CATEGORIES.map((cat, ci) => {
                      const items = cat.id === "Personal"
                        ? STRUCTURES.filter(s => s.personal)
                        : STRUCTURES.filter(s => s.type === cat.id && !s.personal);
                      if (!items.length) return null;
                      const isOpen = decideCatOpen === cat.id;
                      return (
                        <div key={cat.id} style={{ borderTop: ci>0?"1px solid var(--line-soft)":"none" }}>
                          <button type="button" onClick={(e)=>preserveScroll(e, ()=>{ if(!isOpen) trackCatalogEvent("category_open", { tab:"decide", category:cat.id }); setDecideCatOpen(isOpen ? null : cat.id); }, !isOpen)}
                            style={{ width:"100%", display:"flex", alignItems:"center", gap:11, padding:"11px 16px", background:isOpen?"var(--accent-soft)":"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
                            <CatGlyph cat={cat} />
                            <span style={{ flex:1, minWidth:0 }}>
                              <span style={{ display:"block", fontFamily:"var(--display)", fontWeight:600, fontSize:15, color:"var(--ink)", lineHeight:1.2 }}>{cat.label}</span>
                              <span style={{ display:"block", fontFamily:"var(--serif)", fontSize:12.5, color:"var(--meta)", marginTop:1 }}>{cat.blurb}</span>
                            </span>
                            <span style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--meta)", flexShrink:0, marginRight:4 }}>{items.length}</span>
                            <span style={{ fontFamily:"var(--mono)", fontSize:17, color:"var(--meta)", transform:isOpen?"rotate(45deg)":"none", transition:"transform .2s", flexShrink:0 }}>+</span>
                          </button>
                          {isOpen && (
                            <div style={{ padding:"4px 16px 14px 47px", display:"flex", flexDirection:"column", gap:6 }}>
                              {items.map(s=>{
                                const tmpl = TEMPLATES.find(x=>x.label===s.name);
                                return (
                                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 13px", background:"var(--edge)", border:"1px solid var(--line)", borderRadius:8 }}>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontFamily:"var(--serif)", fontWeight:600, fontSize:14.5, color:"var(--ink)", lineHeight:1.25 }}>{s.name}</div>
                                    {tmpl && <div style={{ fontFamily:"var(--serif)", fontSize:12.5, color:"var(--meta)", marginTop:2, lineHeight:1.35 }}>{tmpl.desc}</div>}
                                  </div>
                                  <Btn size="sm" onClick={()=>trackUse(s.name)} style={{ flexShrink:0 }}>Use</Btn>
                                </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* ── DRAFT TAB ── */}
      {tab==="draft" && (
        <div>
          {!ql && <PromoRow icon={Flame} title="Trending this week" items={docTrending} onPick={trackDraft} numbered />}
          {!ql && <PromoRow icon={Sparkles} title="Most used" items={docMostUsed} onPick={trackDraft} />}
          <div>
            <Kicker style={{ color:"var(--meta)", marginBottom:10 }}>{ql ? "All document templates" : "By document type"}</Kicker>
          {filteredDraft.length===0 ? (
            <p style={{ fontFamily:"var(--serif)", fontSize:14.5, color:"var(--meta)", fontStyle:"italic", margin:"4px 0 0" }}>No templates match &ldquo;{q}&rdquo;.</p>
          ) : ql ? (
            // Search results: flat grid
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
              {filteredDraft.map(t=>(
                <div key={t.id} className="wo-card-hover" style={{ background:"var(--edge)", border:"1px solid var(--line)", borderRadius:10, padding:"16px", display:"flex", flexDirection:"column" }}>
                  <span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--slate)", marginBottom:8, display:"block" }}>{t.category}</span>
                  <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:16, color:"var(--ink)", marginBottom:6, lineHeight:1.2, flex:1 }}>{t.label}</div>
                  <div style={{ fontFamily:"var(--serif)", fontSize:13, color:"var(--meta)", marginBottom:13, lineHeight:1.4 }}>{t.desc}</div>
                  <Btn size="sm" full onClick={()=>trackDraft(t.label)}>Create</Btn>
                </div>
              ))}
            </div>
          ) : (
            // Default: category accordion
            (()=>{
              const DRAFT_CATEGORIES = DOC_CATEGORIES;
              return (
                <div style={{ border:"1px solid var(--line)", borderRadius:10, overflow:"hidden" }}>
                  {DRAFT_CATEGORIES.map((cat, ci) => {
                    const items = docItemsForCategory(cat.id);
                    if (!items.length) return null;
                    const isOpen = draftCatOpen === cat.id;
                    return (
                      <div key={cat.id} style={{ borderTop: ci>0?"1px solid var(--line-soft)":"none" }}>
                        <button type="button" onClick={(e)=>preserveScroll(e, ()=>{ if(!isOpen) trackCatalogEvent("category_open", { tab:"document", category:cat.id, segment: SEGMENT_FOR_DOC_CATEGORY[cat.id] || "cross" }); setDraftCatOpen(isOpen ? null : cat.id); }, !isOpen)}
                          style={{ width:"100%", display:"flex", alignItems:"center", gap:11, padding:"11px 16px", background:isOpen?"var(--accent-soft)":"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
                          <CatGlyph cat={cat} />
                          <span style={{ flex:1, minWidth:0 }}>
                            <span style={{ display:"block", fontFamily:"var(--display)", fontWeight:600, fontSize:15, color:"var(--ink)", lineHeight:1.2 }}>{cat.label}</span>
                            <span style={{ display:"block", fontFamily:"var(--serif)", fontSize:12.5, color:"var(--meta)", marginTop:1 }}>{cat.blurb}</span>
                          </span>
                          <span style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--meta)", flexShrink:0, marginRight:4 }}>{items.length}</span>
                          <span style={{ fontFamily:"var(--mono)", fontSize:17, color:"var(--meta)", transform:isOpen?"rotate(45deg)":"none", transition:"transform .2s", flexShrink:0 }}>+</span>
                        </button>
                        {isOpen && (
                          <div style={{ padding:"4px 16px 14px 47px", display:"flex", flexDirection:"column", gap:6 }}>
                            {items.map(t=>(
                              <div key={t.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 13px", background:"var(--edge)", border:"1px solid var(--line)", borderRadius:8 }}>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ fontFamily:"var(--serif)", fontWeight:600, fontSize:14.5, color:"var(--ink)", lineHeight:1.25 }}>{t.label}</div>
                                  <div style={{ fontFamily:"var(--serif)", fontSize:12.5, color:"var(--meta)", marginTop:2, lineHeight:1.35 }}>{t.desc}</div>
                                </div>
                                <Btn size="sm" onClick={()=>trackDraft(t.label)} style={{ flexShrink:0 }}>Draft</Btn>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── DECISION PROFILE (gaming) — reads real profileDisplay + userMetrics ──────────
// ── v73: SCOPE TAG + OUTCOME REVIEW SURFACE ──────────────────────────────────────
// PROVISIONAL surfaces. Functionally complete, deliberately plain, modular so the
// final form can be set by marketing without touching the engine.
function _relDate(ts){ if(!ts) return ""; const d=Date.now()-ts, day=864e5; if(d<0){ const a=Math.ceil(-d/day); return a<=1?"tomorrow":`in ${a} days`; } if(d<day) return "today"; if(d<2*day) return "yesterday"; if(d<7*day) return Math.floor(d/day)+" days ago"; try{ return new Date(ts).toLocaleDateString(undefined,{month:"short",day:"numeric"}); }catch(_){ return ""; } }

function ScopeTag({ scope, confidence, confirmed, suggested, onSet, compact, onToggle }){
  const isWork = scope==="work";
  const Icon = isWork ? Eye : Lock;
  const label = isWork ? "Work" : "Personal";
  const note = isWork ? "contributes aggregate signal only" : "private, never surfaced";
  if(compact){
    if(onToggle){
      return (
        <button onClick={(e)=>{ e.stopPropagation(); onToggle(isWork?"personal":"work"); }} className="wo-hover" title="Swap work / personal"
          style={{ display:"inline-flex", alignItems:"center", gap:5, fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.03em", color:isWork?"var(--slate)":"var(--meta)", background:"transparent", border:"1px solid var(--line)", borderRadius:20, padding:"2px 9px", cursor:"pointer" }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--accent)"; }} onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--line)"; }}>
          <Icon size={11} />{label}
        </button>
      );
    }
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.03em", color:isWork?"var(--slate)":"var(--meta)" }}>
        <Icon size={11} />{label}
      </span>
    );
  }
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", background:"var(--panel)", border:"1px solid var(--line)", borderRadius:8, padding:"9px 12px" }}>
      <span style={{ display:"inline-flex", alignItems:"center", gap:7, fontFamily:"var(--mono)", fontSize:11.5, letterSpacing:"0.04em", color:isWork?"var(--slate)":"var(--ink2)" }}>
        <Icon size={13} style={{ color:isWork?"var(--slate)":"var(--meta)" }} />{label}
      </span>
      <span style={{ fontFamily:"var(--serif)", fontSize:13, fontStyle:"italic", color:"var(--meta)", flex:1, minWidth:120 }}>{note}.{!confirmed && confidence==="low" ? " Low-confidence guess." : ""}</span>
      {onSet && (
        <button onClick={()=>onSet(isWork?"personal":"work")} className="wo-hover" style={{ fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.04em", color:"var(--ink2)", background:"transparent", border:"1px solid var(--line)", borderRadius:6, padding:"5px 9px", cursor:"pointer" }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--ink)"; }} onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--line)"; e.currentTarget.style.color="var(--ink2)"; }}>
          {isWork ? "Make personal" : "Mark as work"}
        </button>
      )}
    </div>
  );
}

function OutcomeBadge({ outcome, reviewDueAt }){
  if(outcome && outcome.status==="recorded" && outcome.result){
    const r = OUTCOME_RESULTS[outcome.result] || OUTCOME_RESULTS.held;
    return <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.03em", color:r.color }}><CheckCircle2 size={11} />{r.label}</span>;
  }
  const due = reviewDueAt && reviewDueAt<=Date.now();
  return <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.03em", color:due?"var(--caution)":"var(--meta)" }}><Clock size={11} />{due?"Review due":"Review "+_relDate(reviewDueAt)}</span>;
}

function ReviewCard({ s, onRecord, onOpen }){
  const [result, setResult] = React.useState(null);
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const lba = s.loadBearingAssumption;
  const save = async ()=>{ if(!result||saving) return; setSaving(true); try{ await onRecord(s.id, result, note.trim(), s); }finally{ setSaving(false); } };
  return (
    <div className="wo-in" style={{ background:"var(--edge)", border:"1px solid var(--line)", borderRadius:11, padding:"16px 17px", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
        <button onClick={()=>onOpen && onOpen(s.id)} style={{ background:"none", border:"none", padding:0, cursor:onOpen?"pointer":"default", textAlign:"left", fontFamily:"var(--display)", fontWeight:600, fontSize:17, color:"var(--ink)", lineHeight:1.25 }}>{s.title||"Untitled decision"}</button>
        <span style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--meta)", flexShrink:0 }}>committed {_relDate(s.committedAt||s.reviewDueAt-DEFAULT_REVIEW_HORIZON_DAYS*864e5)}</span>
      </div>
      {lba && lba.text ? (
        <div style={{ margin:"11px 0 13px", borderLeft:"2px solid var(--accent)", paddingLeft:12 }}>
          <div style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--meta)", marginBottom:4 }}>The assumption it rested on{lba.category?" · "+lba.category:""}</div>
          <div style={{ fontFamily:"var(--serif)", fontSize:16, lineHeight:1.5, color:"var(--ink2)" }}>{lba.text}</div>
        </div>
      ) : (
        <div style={{ margin:"11px 0 13px", fontFamily:"var(--serif)", fontSize:14.5, fontStyle:"italic", color:"var(--meta)" }}>No load-bearing assumption was captured. Record how the call turned out.</div>
      )}
      {s.prediction && s.prediction.trigger ? (
        <div style={{ margin:"0 0 13px", borderLeft:"2px solid var(--meta)", paddingLeft:12 }}>
          <div style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--meta)", marginBottom:4 }}>What you said would settle it{s.prediction.resolveBy ? " · by " + _relDate(s.prediction.resolveBy) : ""}</div>
          <div style={{ fontFamily:"var(--serif)", fontSize:15, lineHeight:1.5, color:"var(--ink2)" }}>{s.prediction.trigger}</div>
        </div>
      ) : null}
      <div style={{ fontFamily:"var(--serif)", fontSize:14.5, color:"var(--ink2)", marginBottom:8 }}>Did it hold?</div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:result?12:0 }}>
        {Object.entries(OUTCOME_RESULTS).map(([k,v])=>{
          const on = result===k;
          return (
            <button key={k} onClick={()=>setResult(k)} className="wo-hover" style={{ fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.03em", color:on?"var(--paper)":v.color, background:on?v.color:"transparent", border:`1px solid ${v.color}`, borderRadius:7, padding:"8px 13px", cursor:"pointer" }}>{v.label}</button>
          );
        })}
      </div>
      {result && (
        <div className="wo-in">
          <textarea value={note} onChange={e=>setNote(e.target.value)} aria-label="What happened (optional)" placeholder="What actually happened? (optional)" rows={2}
            style={{ width:"100%", background:"var(--input-bg)", border:"1px solid var(--input-border)", borderRadius:8, padding:"10px 12px", fontFamily:"var(--serif)", fontSize:14.5, color:"var(--ink)", outline:"none", resize:"vertical", marginBottom:10 }} />
          <div style={{ display:"flex", gap:8 }}>
            <Btn size="sm" onClick={save} disabled={saving}>{saving?"Saving…":"Record outcome"}</Btn>
            <Btn size="sm" kind="ghost" onClick={()=>{ setResult(null); setNote(""); }}>Cancel</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DraftLibraryView — archive of all draft document sessions ────────────────
// Parallel to LibraryView (decisions). Shows draft sessions only (workflowType === "draft").
// Filters by document template category. Links back to the Draft templates view to start new.
// v92: new view, wired to view==="DraftLibrary" in the main render switch.
function DraftLibraryView({ sessions, onOpen, onDelete, onDraft, setView, pad }) {
  const [q, setQ] = React.useState("");
  // S4: inline confirmation state replaces window.confirm() which blocks the main
  // thread and is suppressed in some embedded environments.
  const [confirmDeleteId, setConfirmDeleteId] = React.useState(null);
  const all = (sessions || []).filter(s => s.workflowType === "draft");
  const list = all.filter(s => !q || (s.title || "").toLowerCase().includes(q.toLowerCase()));

  const fmt = (ts) => {
    if (!ts) return "";
    const d = Date.now() - ts, day = 864e5;
    if (d < day) return "Today";
    if (d < 2 * day) return "Yesterday";
    if (d < 7 * day) return Math.floor(d / day) + " days ago";
    try { return new Date(ts).toLocaleDateString(undefined, { month:"short", day:"numeric" }); } catch (_) { return ""; }
  };

  const statusLabel = (s) => {
    if (s.status === "Committed" || s.hasDoc) return "Complete";
    if (s.status === "Clarify" || s.status === "Clarifying") return "In progress";
    return s.status || "In progress";
  };

  const statusColor = (s) => {
    const st = statusLabel(s);
    if (st === "Complete") return "var(--positive)";
    if (st === "In progress") return "var(--accent)";
    return "var(--meta)";
  };

  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:pad }}>
      {/* Header */}
      <div className="wo-in" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", gap:12, flexWrap:"wrap", marginBottom:18 }}>
        <div>
          <Kicker style={{ marginBottom:6 }}>Document Archive</Kicker>
          <h1 style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:26, color:"var(--ink)", margin:0 }}>
            Every document you have created
          </h1>
          <p style={{ fontFamily:"var(--serif)", fontSize:15, color:"var(--meta)", margin:"6px 0 0" }}>
            {all.length} {all.length === 1 ? "document" : "documents"} saved. Reopen any to continue or export.
          </p>
        </div>
        <Btn onClick={() => setView("Draft")}>
          <FileText size={15} />New document
        </Btn>
      </div>

      {/* Search — shown when list is long enough */}
      {all.length > 5 && (
        <div className="wo-in" style={{ marginBottom:14 }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search documents…"
            style={{ width:"100%", background:"var(--input-bg)", border:"1px solid var(--input-border)", borderRadius:9, padding:"11px 14px", fontFamily:"var(--serif)", fontSize:15.5, color:"var(--ink)", outline:"none", boxSizing:"border-box" }}
          />
        </div>
      )}

      {/* List */}
      {list.length === 0 ? (
        <div className="wo-in" style={{ textAlign:"center", padding:"54px 20px", border:"1px dashed var(--line)", borderRadius:12 }}>
          <FileText size={26} style={{ color:"var(--meta)", marginBottom:12 }} />
          <p style={{ fontFamily:"var(--serif)", fontSize:16, color:"var(--meta)", margin:"0 0 16px" }}>
            {all.length === 0
              ? "No documents yet. Created documents land here once you start one."
              : "No documents match your search."}
          </p>
          {all.length === 0 && (
            <Btn onClick={() => setView("Draft")}>Start your first document</Btn>
          )}
        </div>
      ) : (
        <div className="wo-in" style={{ border:"1px solid var(--line)", borderRadius:12, overflow:"hidden", background:"var(--edge)" }}>
          {list.map((s, i) => (
            <div
              key={s.id}
              className="wo-hover"
              style={{ display:"flex", alignItems:"center", gap:13, padding:"14px 16px", borderTop: i > 0 ? "1px solid var(--line-soft)" : "none", cursor:"pointer" }}
              onClick={() => onOpen(s.id)}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-soft)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              {/* Document type icon */}
              <div style={{ width:32, height:32, borderRadius:8, background:"var(--panel)", border:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <FileText size={15} style={{ color:"var(--accent)" }} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"var(--serif)", fontSize:16, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {s.title || "Untitled document"}
                </div>
                <div style={{ display:"flex", gap:10, marginTop:3, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{ fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.04em", color: statusColor(s) }}>
                    {statusLabel(s)}
                  </span>
                  {s.updatedAt && (
                    <span style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--meta)" }}>
                      {fmt(s.updatedAt)}
                    </span>
                  )}
                  {s.selectedTemplate && (
                    <span style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--meta)", opacity:0.7 }}>
                      {s.selectedTemplate}
                    </span>
                  )}
                </div>
              </div>
              {/* Export indicator */}
              {s.hasDoc && (
                <span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--accent)", background:"var(--accent-soft)", border:"1px solid var(--accent)", borderRadius:5, padding:"3px 7px", flexShrink:0 }}>
                  Ready
                </span>
              )}
              {/* Delete — inline confirm replaces window.confirm (S4) */}
              {confirmDeleteId === s.id ? (
                <div style={{ display:"flex", gap:5, alignItems:"center", flexShrink:0 }} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>{ onDelete(s.id); setConfirmDeleteId(null); }} style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.03em", color:"var(--critical)", background:"transparent", border:"1px solid var(--critical)", borderRadius:5, padding:"3px 8px", cursor:"pointer" }}>Delete</button>
                  <button onClick={()=>setConfirmDeleteId(null)} style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.03em", color:"var(--meta)", background:"transparent", border:"1px solid var(--line)", borderRadius:5, padding:"3px 8px", cursor:"pointer" }}>Cancel</button>
                </div>
              ) : (
                <button
                  onClick={e => { e.stopPropagation(); setConfirmDeleteId(s.id); }}
                  className="wo-hover"
                  style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--meta)", padding:"4px 6px", borderRadius:5, flexShrink:0, opacity:0.5 }}
                  title="Delete document">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewView({ queue, outcomeStats, onRecord, onOpen, onNew, setView, pad }){
  const q = queue || { due:[], upcoming:[], recorded:[], dueCount:0 };
  const empty = q.due.length===0 && q.upcoming.length===0 && q.recorded.length===0;
  return (
    <div style={{ maxWidth:740, margin:"0 auto", padding:pad }}>
      <div className="wo-in" style={{ marginBottom:18 }}>
        <Kicker style={{ marginBottom:6 }}>Outcomes</Kicker>
        <h1 style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:26, color:"var(--ink)", margin:0 }}>Did your assumptions hold?</h1>
        <p style={{ fontFamily:"var(--serif)", fontSize:15, color:"var(--meta)", margin:"6px 0 0", maxWidth:560 }}>A decision is not done when you commit it. It is done when you find out whether the call held. Recording outcomes is how your profile gets calibrated over time.</p>
      </div>

      {q.due.length>0 && (
        <div className="wo-in" style={{ marginBottom:22 }}>
          <Kicker color="var(--caution)" style={{ marginBottom:10 }}>Due now · {q.due.length}</Kicker>
          {q.due.map(s=><ReviewCard key={s.id} s={s} onRecord={onRecord} onOpen={onOpen} />)}
        </div>
      )}

      {(outcomeStats && outcomeStats.outcomeTotal>0) && (
        <div className="wo-in" style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:18 }}>
          <div style={{ flex:"1 1 150px", background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:24, color:"var(--ink)" }}>{outcomeStats.outcomeTotal}</div>
            <div style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--meta)", marginTop:2 }}>Outcomes recorded</div>
          </div>
          {outcomeStats.heldRate!=null && (
            <div style={{ flex:"1 1 150px", background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:24, color:"var(--ink)" }}>{outcomeStats.heldRate}%</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--meta)", marginTop:2 }}>Calls that held</div>
            </div>
          )}
          {outcomeStats.mostBrokenCategory && (
            <div style={{ flex:"1 1 180px", background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:17, color:"var(--ink)", textTransform:"capitalize" }}>{outcomeStats.mostBrokenCategory}</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--meta)", marginTop:2 }}>Where calls break most</div>
            </div>
          )}
        </div>
      )}

      {empty ? (
        <div className="wo-in" style={{ textAlign:"center", padding:"54px 20px", border:"1px dashed var(--line)", borderRadius:12 }}>
          <RotateCcw size={26} style={{ color:"var(--meta)", marginBottom:12 }} />
          <p style={{ fontFamily:"var(--serif)", fontSize:16, color:"var(--meta)", margin:"0 0 16px" }}>No committed decisions yet. Once you commit a decision, it lands here for an outcome check.</p>
          <Btn onClick={()=>{ onNew(); setView("Home"); }}>Start a decision</Btn>
        </div>
      ) : (
        <>
          {q.upcoming.length>0 && (
            <div className="wo-in" style={{ marginBottom:22 }}>
              <Kicker color="var(--meta)" style={{ marginBottom:10 }}>Upcoming</Kicker>
              <div style={{ border:"1px solid var(--line)", borderRadius:11, overflow:"hidden", background:"var(--edge)" }}>
                {q.upcoming.map((s,i)=>(
                  <button key={s.id} onClick={()=>onOpen && onOpen(s.id)} className="wo-hover" style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"13px 15px", borderTop:i>0?"1px solid var(--line-soft)":"none", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}
                    onMouseEnter={e=>{ e.currentTarget.style.background="var(--accent-soft)"; }} onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"var(--serif)", fontSize:15.5, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.title||"Untitled decision"}</div>
                      <div style={{ marginTop:3 }}><OutcomeBadge outcome={s.outcome} reviewDueAt={s.reviewDueAt} /></div>
                    </div>
                    <ChevronRight size={16} style={{ color:"var(--meta)", flexShrink:0 }} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {q.recorded.length>0 && (
            <div className="wo-in">
              <Kicker color="var(--meta)" style={{ marginBottom:10 }}>Recorded</Kicker>
              <div style={{ border:"1px solid var(--line)", borderRadius:11, overflow:"hidden", background:"var(--edge)" }}>
                {q.recorded.map((s,i)=>(
                  <button key={s.id} onClick={()=>onOpen && onOpen(s.id)} className="wo-hover" style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"13px 15px", borderTop:i>0?"1px solid var(--line-soft)":"none", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}
                    onMouseEnter={e=>{ e.currentTarget.style.background="var(--accent-soft)"; }} onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"var(--serif)", fontSize:15.5, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.title||"Untitled decision"}</div>
                      <div style={{ display:"flex", gap:10, marginTop:3, flexWrap:"wrap" }}><OutcomeBadge outcome={s.outcome} /><ScopeTag scope={s.scope||"personal"} compact /></div>
                    </div>
                    <ChevronRight size={16} style={{ color:"var(--meta)", flexShrink:0 }} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── PROFILE ─────────────────────────────────────────────────────────────────────
function ProfileViewV72({ tier, profile, metrics, onUpgrade, pad, hasProfile, style, openLoops, credential }){
  // v114: Clarity Rank (a count-based level) replaced by Decision Style, a named
  // archetype derived from the user's own decision structure. `style` is computed by the
  // App from the raw profile via deriveDecisionStyle and passed in.
  const tracked = (metrics && metrics.decisionsTracked != null ? metrics.decisionsTracked : null) ?? (profile && profile.decisionCount) ?? 0;
  const committed = (metrics && (metrics.committed != null ? metrics.committed : metrics.decisionsTracked)) ?? (profile && profile.decisionCount) ?? 0; // used by Milestones fallback
  const streak = (metrics && metrics.streak) || { days: 0, dots: [false,false,false,false,false,false,false] };
  const decisions = tracked;
  const _style = style || { name: null, line: null, state: "calibrating", n: 0, toFloor: 3 };
  const [pIntroCollapsed, setPIntroCollapsed] = React.useState(_profileIntroCollapsed===true);
  React.useEffect(()=>{ if(_profileIntroCollapsed!==null) return; (async()=>{ try{ const r = await store.get("wo:profile:introCollapsed"); _profileIntroCollapsed = !!(r && r.value==="1"); setPIntroCollapsed(_profileIntroCollapsed); }catch(_){ _profileIntroCollapsed=false; } })(); },[]);
  const togglePIntro = async ()=>{ const next=!pIntroCollapsed; _profileIntroCollapsed=next; setPIntroCollapsed(next); try{ await store.set("wo:profile:introCollapsed", next?"1":"0"); }catch(_){} };
  const _ledger = (metrics && metrics.ledger) || {};
  const _vz = deriveShareViz(profile, metrics);
  const _history = { decisions: decisions, reviewed: (_ledger.recorded || 0), streak: (streak.days || 0), readiness: (_ledger.readinessAvg != null ? _ledger.readinessAvg : null), readinessPts: _vz.readinessPts };
  // Decision History is shareable from day zero, including blank (0 decisions).
  const historyShare = <ShareImageButton size="sm"
    makeBlob={()=>svgToPngBlob(socialPosterSvg(posterContentForShare("decision_history", _history)), 1080, 1350)}
    cacheKey={"hist:"+_history.decisions+":"+_history.reviewed+":"+_history.streak+":"+(_history.readiness==null?"-":_history.readiness)}
    filename="decision_history.png"
    text={(() => { const p={ v:1, card:"decision_history", n:_history.decisions, rv:_history.reviewed, sk:_history.streak, title:"Decision History" }; const e=safeBase64Encode(p); const u=e?buildShareUrl("card",e):""; return "My decision history on WorkOutput." + (u?" "+u:""); })()}
    metricType="decision_history"
    label="Share"
  />;
  const styleShare = _style.name ? <ShareImageButton size="sm" kind="ghost"
    makeBlob={()=>svgToPngBlob(socialPosterSvg(posterContentForShare("style", { ..._style, orientation:_vz.orientation, heldDots:_vz.heldDots, confidenceDist:_vz.confidenceDist, reversibilityMix:_vz.reversibilityMix })), 1080, 1350)}
    cacheKey={"style:"+_style.name+":"+_style.n+":"+(_vz.heldRate==null?"-":_vz.heldRate)}
    filename="decision_style.png"
    text={(() => { const p={ v:1, card:"decision_style", sn:_style.name, sl:_style.line, n:_style.n, title:_style.name }; const e=safeBase64Encode(p); const u=e?buildShareUrl("card",e):""; return _style.name + " — my decision style on WorkOutput." + (u?" "+u:""); })()}
    metricType="decision_style"
    label="Share style"
  /> : null;
  // v122: calibration credential share — issued at the 3-outcome floor.
  const _cred = credential || { ready:false };
  const credShare = _cred.ready ? <ShareImageButton size="sm" kind="ghost"
    makeBlob={()=>svgToPngBlob(socialPosterSvg(posterContentForShare("credential", { credential:_cred })), 1080, 1350)}
    cacheKey={"cred:"+_cred.gradedN+":"+_cred.heldRate+":"+(_cred.attestation||"-")}
    filename="calibration_credential.png"
    text={(() => { const u = (typeof buildPublicProfileUrl==="function") ? buildPublicProfileUrl("me") : ""; return _cred.heldRate + "% of my reviewed calls held, across " + _cred.gradedN + " graded decisions on WorkOutput." + (u?" "+u:""); })()}
    metricType="credential"
    label="Share credential"
  /> : null;
  // v122: open-loops debt. A committed call past its review date with no recorded
  // outcome is an open loop. It is stated factually and it limits the authority of the
  // profile until closed, because a track record with ungraded bets is incomplete.
  const _openLoops = (typeof openLoops === "number" && openLoops > 0) ? openLoops : 0;
  const _authorityLimited = _openLoops > 0;
  const metricsShare = _style.name ? <ShareImageButton size="sm" kind="ghost"
    makeBlob={()=>svgToPngBlob(socialPosterSvg(posterContentForShare("decision_metrics", { radarAxes:_vz.radarAxes, rings:_vz.rings, outcomeMix:_vz.outcomeMix, reversibilityMix:_vz.reversibilityMix, n:_vz.decisions })), 1080, 1350)}
    cacheKey={"metrics:"+_vz.decisions+":"+(_vz.heldRate==null?"-":_vz.heldRate)+":"+(_vz.readiness==null?"-":_vz.readiness)}
    filename="decision_metrics.png"
    text="My decision metrics on WorkOutput."
    metricType="decision_metrics"
    label="Share metrics"
  /> : null;
  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:pad }}>
      {/* v115: top-right Share is the Decision History card — available from day zero,
          including blank (0 decisions). The intro mirrors the home page's collapse. */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:6 }}>
        <Kicker>Decision Profile</Kicker>
        {historyShare}
      </div>
      {pIntroCollapsed ? (
        <button onClick={togglePIntro} className="wo-hover" aria-label="Show intro" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"transparent", border:"none", cursor:"pointer", padding:0, margin:"0 0 22px", textAlign:"left" }}>
          <span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:26, color:"var(--ink)" }}>How you decide, compounding over time</span>
          <span style={{ fontFamily:"var(--mono)", fontSize:16, lineHeight:1, color:"var(--meta)" }}>+</span>
        </button>
      ) : (
        <div style={{ position:"relative", marginBottom:22, paddingRight:24 }}>
          <button onClick={togglePIntro} aria-label="Collapse intro" className="wo-hover" style={{ position:"absolute", top:0, right:0, background:"transparent", border:"none", cursor:"pointer", color:"var(--meta)", padding:4, display:"flex", borderRadius:5 }}><X size={15} /></button>
          <h1 style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:26, color:"var(--ink)", margin:"0 0 4px" }}>How you decide, compounding over time</h1>
          <p style={{ fontFamily:"var(--serif)", fontSize:15, color:"var(--meta)", margin:0 }}>This is your asset. It calibrates every future decision to the way you actually think.</p>
        </div>
      )}
      {_authorityLimited && (
        <div style={{ display:"flex", alignItems:"center", gap:12, background:"var(--edge)", border:"1px solid var(--caution, var(--line))", borderRadius:12, padding:"12px 16px", marginBottom:14 }}>
          <span style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:18, color:"var(--caution, var(--accent))", lineHeight:1 }}>{_openLoops}</span>
          <span style={{ fontFamily:"var(--serif)", fontSize:13.5, color:"var(--ink2)", lineHeight:1.4 }}>
            {_openLoops===1 ? "1 call is past its review date and ungraded. " : _openLoops + " calls are past their review date and ungraded. "}
            Profile authority is limited until they are closed. A track record with open bets is incomplete.
          </span>
        </div>
      )}
      <div className="wo-in" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14, marginBottom:14 }}>
        {_cred.ready && (
          <div style={{ background:"var(--edge)", border:"1px solid var(--accent)", borderRadius:12, padding:"18px", gridColumn:"1 / -1", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
            <div style={{ minWidth:200 }}>
              <div style={{ display:"flex", alignItems:"center", marginBottom:8 }}><Kicker style={{ color:"var(--meta)" }}>Calibration credential</Kicker></div>
              <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
                <span style={{ fontFamily:"var(--display)", fontWeight:700, fontSize:40, color:"var(--accent)", lineHeight:1 }}>{_cred.heldRate}%</span>
                <span style={{ fontFamily:"var(--serif)", fontSize:14, color:"var(--ink2)" }}>of reviewed calls held</span>
              </div>
              <div style={{ fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.04em", textTransform:"uppercase", color:"var(--meta)", marginTop:8 }}>{_cred.gradedN} graded {_cred.gradedN===1?"decision":"decisions"}{_cred.attestation ? " · " + _cred.attestation : ""}</div>
            </div>
            {credShare}
          </div>
        )}
        <div style={{ background:"var(--edge)", border:"1px solid var(--line)", borderRadius:12, padding:"18px", opacity: _authorityLimited ? 0.55 : 1 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}><span style={{ display:"inline-flex", alignItems:"center" }}><Kicker style={{ color:"var(--meta)" }}>Decision Style</Kicker><InfoTip k="Decision Style" /></span><Compass size={16} style={{ color:"var(--accent)" }} /></div>
          {_style.name ? (
            <>
              <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:26, color:"var(--ink)", lineHeight:1.05 }}>{_style.name}</div>
              <div style={{ fontFamily:"var(--serif)", fontSize:13.5, color:"var(--ink2)", margin:"7px 0 6px", lineHeight:1.45 }}>{_style.line}</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.05em", textTransform:"uppercase", color:"var(--meta)", marginBottom:12 }}>{_style.state === "established" ? "Established" : "Emerging"} · {_style.n} {_style.n===1?"decision":"decisions"} · sharpens with each one</div>
              {styleShare}
            </>
          ) : (
            <>
              <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:26, color:"var(--ink)", lineHeight:1.05 }}>Calibrating</div>
              <div style={{ fontFamily:"var(--serif)", fontSize:13.5, color:"var(--meta)", margin:"7px 0 6px", lineHeight:1.45 }}>{_style.toFloor ? `${_style.toFloor} more committed ${_style.toFloor===1?"decision":"decisions"} and your decision style emerges.` : "Commit a few decisions and your decision style emerges."}</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.05em", textTransform:"uppercase", color:"var(--meta)" }}>Style forms at 3 decisions</div>
            </>
          )}
        </div>
        <div style={{ background:"var(--edge)", border:"1px solid var(--line)", borderRadius:12, padding:"18px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}><span style={{ display:"inline-flex", alignItems:"center" }}><Kicker style={{ color:"var(--meta)" }}>Streak</Kicker><InfoTip k="Streak" /></span><Flame size={16} style={{ color:"var(--accent)" }} /></div>
          <div><div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:40, color:"var(--ink)", lineHeight:1 }}>{streak.days}</div><div style={{ fontFamily:"var(--serif)", fontSize:14, color:"var(--meta)" }}>{streak.days === 1 ? "day deciding deliberately" : "days deciding deliberately"}</div></div>
          <div style={{ display:"flex", gap:5 }}>{streak.dots.map((active,i)=><span key={i} style={{ flex:1, height:6, borderRadius:4, background:active?"var(--accent)":"var(--line)" }} />)}</div>
        </div>
      </div>
      <div className="wo-in" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:14, marginBottom:14 }}>
        {(() => {
          const L = (metrics && metrics.ledger) || {};
          const dash = "—";
          const tiles = [
            // Real: number of decisions tracked in the library.
            { k:"Decisions", v:String(decisions) },
            // Real: committed decisions whose outcome you later reviewed.
            { k:"Outcomes reviewed", v:String(L.recorded || 0) },
            // Real: average readiness across committed decisions (needs >=2 to be meaningful).
            { k:"Avg readiness", v: L.readinessAvg != null ? String(L.readinessAvg) : dash },
            // Real: share of committed decisions you came back to review (needs >=3).
            { k:"Follow-through", v: L.followThroughRate != null ? L.followThroughRate + "%" : dash },
          ];
          return tiles.map(({k,v})=>(
            <div key={k} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:24, color:"var(--ink)" }}>{v}</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--meta)", marginTop:2, display:"flex", alignItems:"center" }}>{k}<InfoTip k={k} /></div>
            </div>
          ));
        })()}
      </div>
      {metricsShare && <div className="wo-in" style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>{metricsShare}</div>}
      <div className="wo-in" style={{ background:"var(--edge)", border:"1px solid var(--line)", borderRadius:12, padding:"18px", marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}><span style={{ display:"inline-flex", alignItems:"center" }}><Kicker style={{ color:"var(--meta)" }}>Readiness over time</Kicker><InfoTip k="Readiness over time" /></span>{!has(tier,"fullAnalytics") && <LockTag onClick={onUpgrade} />}</div>
        {(() => {
          const series = ((metrics && metrics.ledger && metrics.ledger.readinessSeries) || []);
          const ready = has(tier, "fullAnalytics");
          if (series.length < 2) {
            // Honest empty state: not enough committed decisions with a readiness score yet.
            return (
              <div style={{ height:150, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", border:"1px dashed var(--line)", borderRadius:10 }}>
                <TrendingUp size={22} style={{ color:"var(--meta)", marginBottom:10 }} />
                <p style={{ fontFamily:"var(--serif)", fontSize:14, color:"var(--meta)", margin:0, maxWidth:320, lineHeight:1.5 }}>
                  Commit a few more decisions and this will chart how your readiness is trending. It needs at least two committed decisions to begin.
                </p>
              </div>
            );
          }
          // Real series. Domain padded around the actual min/max so the line is readable.
          const vals = series.map(p => p.v);
          const lo = Math.max(0, Math.floor((Math.min(...vals) - 5) / 5) * 5);
          const hi = Math.min(100, Math.ceil((Math.max(...vals) + 5) / 5) * 5);
          // a11y v104: spoken summary + hidden data table; chart SVG hidden from AT.
          const _f = series[0], _l = series[series.length-1];
          const _dir = _l.v > _f.v ? "rising" : _l.v < _f.v ? "declining" : "flat";
          const _chartSummary = `Readiness over time, from ${_f.v} in ${_f.x} to ${_l.v} in ${_l.x}. Trend ${_dir}.`;
          return (
            <figure style={{ margin:0, height:150, filter:ready?"none":"blur(4px)", opacity:ready?1:0.6 }}>
              <figcaption style={SR_ONLY}>{_chartSummary}</figcaption>
              <div aria-hidden="true" style={{ height:"100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top:6, right:6, left:-22, bottom:0 }}>
                    <defs><linearGradient id="g72" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35}/><stop offset="100%" stopColor="var(--accent)" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid stroke="var(--line)" vertical={false} />
                    <XAxis dataKey="x" tick={{ fontFamily:"var(--mono)", fontSize:10, fill:"var(--meta)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontFamily:"var(--mono)", fontSize:10, fill:"var(--meta)" }} axisLine={false} tickLine={false} domain={[lo,hi]} />
                    <Area type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={2} fill="url(#g72)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <table style={SR_ONLY}>
                <caption>Readiness over time</caption>
                <thead><tr><th scope="col">Period</th><th scope="col">Readiness</th></tr></thead>
                <tbody>{series.map((p,i)=>(<tr key={i}><td>{p.x}</td><td>{p.v}</td></tr>))}</tbody>
              </table>
            </figure>
          );
        })()}
      </div>
      {/* v99.7 (P8): `profile` here is profileDisplay — an ARRAY of calibration rows —
          so the old profile.summary check was never truthy and this panel was dead.
          It now renders the rows, same presentation as the Advanced view's profile module. */}
      {profile && profile.length > 0 && (
        <div className="wo-in" style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"18px", marginBottom:14 }}>
          <Kicker style={{ color:"var(--meta)", marginBottom:10 }}>How you decide</Kicker>
          {profile.map((row,i)=>(
            <div key={row.key||i} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"7px 0", borderBottom:i<profile.length-1?"1px solid var(--line-soft)":"none" }}>
              <Lead>{row.label}</Lead>
              <span style={{ fontFamily:"var(--serif)", fontSize:15.5, color:row.state==="thin"?"var(--meta)":"var(--ink)" }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}
      <div className="wo-in" style={{ marginBottom:14 }}>
        <Kicker style={{ color:"var(--meta)", marginBottom:10 }}>Milestones</Kicker>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:12 }}>
          {(() => {
            const L = (metrics && metrics.ledger) || {};
            const ctx = {
              committed: (L.committed != null ? L.committed : committed) || 0,
              decisions: decisions || 0,
              reviewed: L.recorded || 0,
              calibrationReady: !!L.calibrationReady,
              streakDays: (streak && streak.days) || 0,
              shares: (metrics && metrics.shareCount) || 0,
            };
            return BADGES.map(b=>{ const Icon=b.icon; const got = !!(b.earned && b.earned(ctx)); return (
              <div key={b.id} style={{ display:"flex", alignItems:"center", gap:11, background:"var(--edge)", border:"1px solid var(--line)", borderRadius:10, padding:"12px 14px", opacity:got?1:0.5 }}>
                <span style={{ width:32, height:32, borderRadius:8, background:got?"var(--accent-soft)":"var(--line-soft)", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon size={16} style={{ color:got?"var(--accent)":"var(--meta)" }} /></span>
                <span style={{ fontFamily:"var(--serif)", fontSize:14, color:"var(--ink2)", lineHeight:1.2 }}>{b.label}</span>
              </div>
            ); });
          })()}
        </div>
      </div>
    </div>
  );
}

// ── PRICING ─────────────────────────────────────────────────────────────────────
function PricingView({ tier, setTier, pad, onBack, hasActiveChat }){
  const [annual, setAnnual] = React.useState(true);
  const plans = [
    {
      id:"free", name:"Free", monthlyPrice:0, tag:"Three complete sessions each month to test the method and start your decision record.",
      feats:[
        "Outcome tracking and calibration ledger",
        `${TIER_POLICY.free.maxDecisionsPerMonth} decisions or documents per month`,
        `${TIER_POLICY.free.maxTurns} turns per decision`,
        "112 templates: 53 for decisions, 59 for documents",
        "Decision Library, Document Archive, and Profile",
        "Share your decision framework, your content stays private",
        "Markdown export",
      ]
    },
    {
      id:"starter", name:"Starter", monthlyPrice:20, annualPrice:17, tag:"Enough room for regular weekly decisions and documents, with saving, exporting, and review history.",
      feats:[
        `${TIER_POLICY.starter.maxDecisionsPerMonth} decisions or documents per month`,
        `${TIER_POLICY.starter.maxTurns} turns per decision`,
        "Your ledger keeps building without monthly interruption",
        "HTML, PDF, and plain-text export",
        "Share your decision card",
      ]
    },
    {
      id:"pro", name:"Pro", monthlyPrice:50, annualPrice:40, tag:"Daily-level WorkOutput use, deeper analysis, and advanced intelligence credits.", featured:true,
      feats:[
        `${TIER_POLICY.pro.maxDecisionsPerMonth} decisions or documents per month`,
        `${TIER_POLICY.pro.maxTurns} turns per decision`,
        `${getMonthlyCreditAllowance("pro")} advanced intelligence credits per month`,
        "Advanced analysis: failure simulation, dependency mapping, benchmarking, and contradiction checks",
        "Full Profile analytics and pattern recognition across your decision history",
        "Extended document and decision output",
        "All export formats",
      ],
      creditNote: `Standard sessions are included. Advanced intelligence tools draw on your ${getMonthlyCreditAllowance("pro")} monthly credits, which do not roll over.`
    },
    {
      id:"enterprise", name:"Enterprise", tag:"For teams",
      feats:[
        "Everything in Pro, for every seat",
        "Shared decision templates across the team",
        "Team-level calibration across judgment patterns",
        "Admin controls: roles, permissions, and seat management",
        "SSO and audit log",
        "Onboarding and dedicated support",
      ]
    },
  ];
  const displayPrice = (p) => {
    if(p.id === "enterprise") return "Custom";
    if(p.monthlyPrice === 0) return "$0";
    const price = annual && p.annualPrice ? p.annualPrice : p.monthlyPrice;
    return `$${price}`;
  };
  const priceSub = (p) => {
    if(p.id === "enterprise" || p.monthlyPrice === 0) return null;
    if(annual && p.annualPrice) return `/ mo · billed $${p.annualPrice * 12} / yr`;
    return "/ mo";
  };
  const saving = (p) => {
    if(!annual || !p.annualPrice || !p.monthlyPrice) return null;
    const saved = Math.round(((p.monthlyPrice - p.annualPrice) / p.monthlyPrice) * 100);
    return saved > 0 ? `Save ${saved}%` : null;
  };
  return (
    <div style={{ maxWidth:980, margin:"0 auto", padding:pad }}>
      {onBack && (
        <div style={{ marginBottom:20 }}>
          <button type="button" onClick={onBack} style={{ display:"inline-flex", alignItems:"center", gap:7, background:"transparent", border:"none", cursor:"pointer", color:"var(--meta)", fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.04em", padding:0 }}
            onMouseEnter={e=>{ e.currentTarget.style.color="var(--ink)"; }} onMouseLeave={e=>{ e.currentTarget.style.color="var(--meta)"; }}>
            <ArrowLeft size={14} />{hasActiveChat ? "Back to your chat" : "Back"}
          </button>
        </div>
      )}
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <Kicker style={{ marginBottom:8 }}>Plans</Kicker>
        <h1 style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:30, color:"var(--ink)", margin:0 }}>Start free. Grow into the full toolkit.</h1>
        <p style={{ fontFamily:"var(--serif)", fontSize:16, color:"var(--meta)", margin:"8px 0 0" }}>Every plan includes both decisions and documents. Free includes the calibration ledger, no card required.</p>
        {/* Annual toggle */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginTop:18, background:"var(--edge)", border:"1px solid var(--line)", borderRadius:30, padding:"5px 6px 5px 14px" }}>
          <span style={{ fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.04em", color:annual?"var(--ink2)":"var(--ink)" }}>Monthly</span>
          <button type="button" onClick={()=>setAnnual(a=>!a)} style={{ position:"relative", width:38, height:22, borderRadius:11, border:"none", cursor:"pointer", background:annual?"var(--accent)":"var(--line)", transition:"background .2s", flexShrink:0 }}>
            <span style={{ position:"absolute", top:3, left:annual?18:3, width:16, height:16, borderRadius:"50%", background:"var(--paper)", transition:"left .2s", pointerEvents:"none" }} />
          </button>
          <span style={{ fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.04em", color:annual?"var(--ink)":"var(--ink2)" }}>Annual</span>
          {annual && <span style={{ fontFamily:"var(--mono)", fontSize:10, fontWeight:600, letterSpacing:"0.08em", color:"var(--accent)", background:"var(--accent-soft)", borderRadius:12, padding:"2px 8px" }}>Save up to 15%</span>}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14 }}>
        {plans.map(p=>{
          const current = tier===p.id;
          const save = saving(p);
          return (
            <div key={p.id} style={{ background:"var(--edge)", border:`1.5px solid ${p.featured?"var(--accent)":"var(--line)"}`, borderRadius:14, padding:"22px", position:"relative", boxShadow:p.featured?"0 20px 50px -34px rgba(36,122,60,0.45)":"none", display:"flex", flexDirection:"column" }}>
              {p.featured && <span style={{ position:"absolute", top:-11, left:22, background:"var(--accent)", color:"var(--paper)", fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", padding:"3px 10px", borderRadius:12 }}>Most popular</span>}
              <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:20, color:"var(--ink)" }}>{p.name}</div>
              <div style={{ fontFamily:"var(--serif)", fontSize:13.5, color:"var(--meta)", marginBottom:12 }}>{p.tag}</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4 }}>
                <span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:34, color:"var(--ink)" }}>{displayPrice(p)}</span>
                {priceSub(p) && <span style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--meta)", lineHeight:1.3 }}>{priceSub(p)}</span>}
              </div>
              {save && <div style={{ marginBottom:12 }}><span style={{ fontFamily:"var(--mono)", fontSize:10, fontWeight:600, color:"var(--accent)", background:"var(--accent-soft)", borderRadius:10, padding:"2px 7px", letterSpacing:"0.06em" }}>{save}</span></div>}
              <div style={{ flex:1, marginBottom:16 }}>
                {p.feats.map((f,i)=>(<div key={i} style={{ display:"flex", gap:8, marginBottom:7 }}><Check size={14} style={{ color:"var(--positive)", marginTop:3, flexShrink:0 }} /><span style={{ fontFamily:"var(--serif)", fontSize:14, color:"var(--ink2)", lineHeight:1.45 }}>{f}</span></div>))}
                {p.creditNote && (
                  <div style={{ marginTop:10, padding:"9px 12px", background:"var(--panel)", border:"1px solid var(--line)", borderRadius:8 }}>
                    <p style={{ fontFamily:"var(--serif)", fontSize:13, color:"var(--meta)", margin:0, lineHeight:1.5 }}>{p.creditNote}</p>
                  </div>
                )}
              </div>
              <Btn full kind={current?"ghost":p.featured?"primary":"ghost"} disabled={current} onClick={()=>{ if(p.id!=="enterprise"){ setTier(p.id); if(onBack) onBack(); } }}>
                {current ? "Current plan" : p.id==="enterprise" ? "Contact sales" : `Choose ${p.name}`}
              </Btn>
            </div>
          );
        })}
      </div>

      {/* v97.11: Add-ons — billed on top of any paid plan. Extra sessions live here so
          they are not conflated with what a plan includes. The credits add-on will join
          this card later; the list structure is ready for it. */}
      <div style={{ marginTop:18 }}>
        <div className="wo-in" style={{ maxWidth:520, margin:"0 auto", background:"var(--edge)", border:"1px solid var(--line)", borderRadius:14, padding:"18px 20px" }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, marginBottom:4 }}>
            <span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:17, color:"var(--ink)" }}>Add-ons</span>
            <span style={{ fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--meta)" }}>Optional, on any paid plan</span>
          </div>
          <p style={{ fontFamily:"var(--serif)", fontSize:13.5, color:"var(--meta)", margin:"0 0 14px", lineHeight:1.5 }}>
            Pay only for what you use beyond your plan. Available on any paid plan.
          </p>
          <div style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 0", borderTop:"1px solid var(--line-soft)" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:15, color:"var(--ink)", marginBottom:2 }}>Extra sessions</div>
              <p style={{ fontFamily:"var(--serif)", fontSize:13, color:"var(--meta)", margin:0, lineHeight:1.45 }}>
                Need more decisions or documents than your plan includes in a cycle? Add a pack of {OVERAGE_PACK.sessions} and keep going without changing plans.
              </p>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontFamily:"var(--display)", fontWeight:700, fontSize:20, color:"var(--accent)", lineHeight:1 }}>${OVERAGE_PACK.priceUSD}</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.04em", color:"var(--meta)", marginTop:3 }}>{OVERAGE_PACK.sessions} sessions</div>
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontFamily:"var(--serif)", fontSize:13, color:"var(--meta)", textAlign:"center", margin:"20px 0 0", fontStyle:"italic" }}>Annual billing locks your price for 12 months. Cancel anytime before renewal.</p>
    </div>
  );
}

// ── OVERLAYS ────────────────────────────────────────────────────────────────────
// a11y v104: visually-hidden live regions. `polite` carries status and the final
// response; `assertive` carries errors. Fed from a single effect in the App.
function A11yLiveRegion({ polite, assertive }){
  return (
    <>
      <div aria-live="polite" aria-atomic="true" style={SR_ONLY}>{polite || ""}</div>
      <div aria-live="assertive" aria-atomic="true" role="alert" style={SR_ONLY}>{assertive || ""}</div>
    </>
  );
}

// a11y v104: dialog focus management. Returns a ref for the dialog panel. Stores the
// trigger, moves focus in, traps Tab, closes on Escape, restores focus on unmount.
function useDialogA11y(onClose){
  const ref = React.useRef(null);
  React.useEffect(() => {
    const node = ref.current;
    const prev = (typeof document !== "undefined") ? document.activeElement : null;
    const SEL = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const items = () => node ? Array.from(node.querySelectorAll(SEL)).filter(el => el.offsetParent !== null) : [];
    const firstEl = items()[0];
    if (firstEl) { firstEl.focus(); }
    else if (node) { node.setAttribute("tabindex", "-1"); node.focus(); }
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose && onClose(); return; }
      if (e.key !== "Tab") { return; }
      const list = items();
      if (list.length === 0) { e.preventDefault(); return; }
      const a = list[0], b = list[list.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
    };
    node && node.addEventListener("keydown", onKey);
    return () => {
      node && node.removeEventListener("keydown", onKey);
      if (prev && typeof prev.focus === "function") { try { prev.focus(); } catch (_) {} }
    };
  }, [onClose]);
  return ref;
}

function Overlay({ children, onClose, narrow, label }){
  const dialogRef = useDialogA11y(onClose);
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(20,16,10,0.55)", display:"flex", alignItems:narrow?"flex-end":"center", justifyContent:"center", animation:"woFade .2s ease forwards", padding:narrow?0:20 }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={label || "Dialog"} onClick={e=>e.stopPropagation()} style={{ width:narrow?"100%":440, maxWidth:"100%", background:"var(--paper)", borderRadius:narrow?"16px 16px 0 0":14, border:"1px solid var(--line)", overflow:"hidden", animation:narrow?"woUp .26s cubic-bezier(.2,.7,.2,1) forwards":"woIn .26s forwards" }}>{children}</div>
    </div>
  );
}
// Build 6: Share modal rebuilt. "Share full decision" removed — only structure
// sharing is supported. Calibration card share added when ledger has real signal (n>=3).
// v91: threshold raised from recorded>=1 to recorded>=3. At n=1 or n=2, the held-rate
// is not meaningful and sharing a single-decision "track record" overstates what the
// ledger has earned. The card becomes shareable only once the user has enough signal
// for the calibration to be worth showing. Below that threshold, a review-nudge block
// replaces the card — it sets the return expectation without surfacing a weak metric.
function ShareModalV72({ onClose, onStructure, onPrintChat, onExportHTML, onExportMD, onExportTxt, onExportPdf, narrow, htmlLocked, proLocked, hasDoc, ledgerMetrics }){
  const hasLedger = ledgerMetrics && ledgerMetrics.recorded >= 3;
  // Below threshold: show a return-nudge so users understand what they are building toward.
  const ledgerBuilding = ledgerMetrics && ledgerMetrics.recorded >= 1 && ledgerMetrics.recorded < 3;
  const [linkCopied, setLinkCopied] = React.useState(false);
  const handleStructure = async () => {
    const ok = await onStructure();
    setLinkCopied(ok === true);
  };
  const Card = ({ icon:Icon, title, body, primary, tag, onClick })=>(
    <button onClick={onClick} className="wo-card-hover" style={{ textAlign:"left", width:"100%", background:primary?"var(--accent-soft)":"var(--edge)", border:`1.5px solid ${primary?"var(--accent)":"var(--line)"}`, borderRadius:12, padding:"18px", cursor:"pointer", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:7 }}>
        <Icon size={17} style={{ color:"var(--accent)" }} />
        <span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:17, color:"var(--ink)" }}>{title}</span>
        {tag && <span style={{ marginLeft:"auto", fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--accent)" }}>{tag}</span>}
      </div>
      <p style={{ fontFamily:"var(--serif)", fontSize:14.5, color:"var(--meta)", margin:0, lineHeight:1.45 }}>{body}</p>
    </button>
  );
  return (
    <Overlay onClose={onClose} narrow={narrow}>
      <div style={{ padding:"22px 22px 18px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <Kicker>Share</Kicker>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--meta)" }}><X size={18} /></button>
        </div>
        <button onClick={handleStructure} className="wo-card-hover" style={{ textAlign:"left", width:"100%", background:"var(--accent-soft)", border:`1.5px solid ${linkCopied ? "var(--positive)" : "var(--accent)"}`, borderRadius:12, padding:"18px", cursor:"pointer", marginBottom:12, transition:"border-color 0.2s" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:7 }}>
            {linkCopied ? <CheckCircle2 size={17} style={{ color:"var(--positive)" }} /> : <Share2 size={17} style={{ color:"var(--accent)" }} />}
            <span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:17, color:"var(--ink)" }}>Share playbook</span>
            <span style={{ marginLeft:"auto", fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:"0.08em", textTransform:"uppercase", color: linkCopied ? "var(--positive)" : "var(--accent)" }}>{linkCopied ? "Link copied" : "Recommended"}</span>
          </div>
          <p style={{ fontFamily:"var(--serif)", fontSize:14.5, color:"var(--meta)", margin:0, lineHeight:1.45 }}>{linkCopied ? "Link is in your clipboard. Whoever opens it starts a blank, private decision from the same starting point." : "Shares the playbook, not your content. Best for teams and reusable thinking. Your private work stays private."}</p>
        </button>
        {/* v91: ledger-building nudge — shown at n=1 or n=2, before the track record is shareable.
            Sets the return expectation without surfacing a weak or misleading held-rate. */}
        {ledgerBuilding && (
          <div style={{ background:"var(--edge)", border:"1px solid var(--line)", borderRadius:12, padding:"14px 18px", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:6 }}>
              <Clock size={15} style={{ color:"var(--accent)" }} />
              <span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:15, color:"var(--ink)" }}>Your track record is building</span>
              <span style={{ marginLeft:"auto", fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--meta)" }}>{ledgerMetrics.recorded}/3</span>
            </div>
            <p style={{ fontFamily:"var(--serif)", fontSize:13.5, color:"var(--meta)", margin:"0 0 8px", lineHeight:1.5 }}>
              At 3 reviewed outcomes, your calibration card becomes shareable: a percentage showing how often your key assumptions turned out to be right.
            </p>
            <div style={{ display:"flex", gap:5, alignItems:"center" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:28, height:5, borderRadius:3, background: i < ledgerMetrics.recorded ? "var(--accent)" : "var(--line)", transition:"background 0.3s" }} />
              ))}
              <span style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--meta)", marginLeft:6 }}>{3 - ledgerMetrics.recorded} more to unlock</span>
            </div>
          </div>
        )}
        {/* v91: calibration card — only shown at recorded>=3, when the held-rate is meaningful */}
        {hasLedger && (
          <div className="wo-in" style={{ background:"var(--edge)", border:"1px solid var(--line)", borderRadius:12, padding:"16px 18px", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:6 }}>
              <Trophy size={16} style={{ color:"var(--accent)" }} />
              <span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:15.5, color:"var(--ink)" }}>Your track record</span>
              <span style={{ marginLeft:"auto", fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--meta)" }}>Ledger signal</span>
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:6 }}>
              <span style={{ fontFamily:"var(--display)", fontWeight:700, fontSize:32, color:"var(--accent)" }}>{ledgerMetrics.heldRate}%</span>
              <span style={{ fontFamily:"var(--serif)", fontSize:14, color:"var(--meta)" }}>of load-bearing assumptions held · {ledgerMetrics.recorded} decisions tracked</span>
            </div>
            {ledgerMetrics.heldRateCI && (
              <p style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--meta)", margin:"0 0 8px" }}>
                {ledgerMetrics.heldRateCI.lo}–{ledgerMetrics.heldRateCI.hi}% likely range
              </p>
            )}
            <p style={{ fontFamily:"var(--serif)", fontSize:13.5, color:"var(--meta)", margin:"0 0 10px", lineHeight:1.45 }}>
              Export as a shareable image. Shows calibration only, no decision content.
            </p>
            <Btn size="sm" kind="ghost" onClick={() => {
              const W=600,H=200,bg="#0a0907",surface="#0f0d0a",gold="#c8a85a",goldDim="#7a6030",textCol="#c8bfa8",metaCol="#554e3a";
              const hr = ledgerMetrics.heldRate;
              const n = ledgerMetrics.recorded;
              const ci = ledgerMetrics.heldRateCI;
              const ciStr = ci ? ` · ${ci.lo}–${ci.hi}% range` : "";
              const svgStr=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${bg}"/><rect x="20" y="18" width="${W-40}" height="${H-36}" fill="${surface}" rx="8"/><text x="40" y="52" font-family="monospace" font-size="9" fill="${goldDim}" letter-spacing="2">DECISION TRACK RECORD · WORKOUTPUT</text><text x="40" y="105" font-family="Georgia,serif" font-size="58" font-weight="bold" fill="${gold}">${hr}%</text><text x="40" y="132" font-family="Georgia,serif" font-size="15" fill="${textCol}">of load-bearing assumptions held</text><text x="40" y="155" font-family="monospace" font-size="11" fill="${metaCol}">${n} decisions committed and reviewed${ciStr}</text></svg>`;
              const blob=new Blob([svgStr],{type:"image/svg+xml;charset=utf-8"});
              const url=URL.createObjectURL(blob);
              const a=document.createElement("a"); a.href=url; a.download="workoutput-track-record.svg"; a.click();
              setTimeout(()=>URL.revokeObjectURL(url),2000);
              onClose();
            }}>Download calibration card</Btn>
          </div>
        )}
        <Rule style={{ margin:"6px 0 14px" }} />
        <Kicker style={{ color:"var(--meta)", marginBottom:10 }}>Export</Kicker>
        {hasDoc ? (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Chip onClick={onPrintChat}>Print to chat</Chip>
            <Chip onClick={onExportMD}>Markdown</Chip>
            <Chip onClick={onExportHTML} lock={htmlLocked}>HTML{htmlLocked?" · Starter":""}</Chip>
            <Chip onClick={onExportTxt} lock={proLocked}>Plain text{proLocked?" · Starter":""}</Chip>
            <Chip onClick={onExportPdf} lock={proLocked}>PDF{proLocked?" · Starter":""}</Chip>
          </div>
        ) : (
          <p style={{ fontFamily:"var(--serif)", fontSize:13.5, color:"var(--meta)", margin:0, lineHeight:1.45 }}>Commit a decision to unlock export.</p>
        )}
      </div>
    </Overlay>
  );
}
// v126.4: export format picker. The single Export action opens this instead of
// downloading straight away — the user is asked for a format first. "Print to chat"
// renders the document into the conversation and creates no file, so it is offered
// to every tier. File formats download a copy; each is gated by subscription tier
// (Markdown on Free, HTML/TXT/PDF on Starter and up) and shows the required plan when
// locked. Selecting a locked format routes to the upgrade path via the parent handler.
function ExportFormatModal({ tier, hasDoc, onSelect, onClose, narrow }) {
  const fileFormats = [
    { id:"md",   label:"Markdown",   feature:"exportMd"   },
    { id:"html", label:"HTML",       feature:"exportHtml" },
    { id:"txt",  label:"Plain text", feature:"exportTxt"  },
    { id:"pdf",  label:"PDF",        feature:"exportPdf"  },
  ];
  return (
    <Overlay onClose={onClose} narrow={narrow}>
      <div style={{ padding:"24px 22px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <Kicker>Export format</Kicker>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--meta)" }}><X size={18} /></button>
        </div>
        {hasDoc ? (
          <>
            <p style={{ fontFamily:"var(--serif)", fontSize:14.5, color:"var(--ink2)", lineHeight:1.5, margin:"0 0 18px" }}>
              Choose how to output the current document. Print to chat keeps it in the conversation. File formats download a copy and depend on your plan.
            </p>
            <Kicker style={{ color:"var(--meta)", marginBottom:8 }}>In the chat</Kicker>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18 }}>
              <Chip onClick={()=>onSelect("print")}>Print to chat</Chip>
            </div>
            <Kicker style={{ color:"var(--meta)", marginBottom:8 }}>Download a file</Kicker>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {fileFormats.map(f=>{
                const ok = has(tier, f.feature);
                return <Chip key={f.id} onClick={()=>onSelect(f.id)} lock={!ok}>{f.label}{ok?"":" · "+minTierName(f.feature)}</Chip>;
              })}
            </div>
          </>
        ) : (
          <p style={{ fontFamily:"var(--serif)", fontSize:13.5, color:"var(--meta)", margin:0, lineHeight:1.45 }}>Commit a decision first, then export.</p>
        )}
      </div>
    </Overlay>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Public-safe, screenshot-ready share cards. Four types, all built from safe
// metadata only. No card exposes decision title, user text, recommendation,
// private reasoning, or document content by default. The only optional private
// field is the literal assumption text, gated behind an explicit toggle (default
// off) on the Assumption Map card — and even then, only the text, never its
// category or confidence (those are inference vectors and stay structural).
//
// All cards render in both Paper and Ink themes via CSS variables. Copy is short,
// hierarchy is large, branding is subtle. No "tokens" language, no em dashes.
// ════════════════════════════════════════════════════════════════════════════

const SHARE_CARD_TYPES = [
  { id: "before_after",   label: "Before / After" },
  { id: "assumption_map", label: "Assumption Map" },
  { id: "called_it",      label: "Called It" },
  { id: "decision_style", label: "Decision Style" }, // shown only when ledger.recorded >= 3
];

// Resolve a human-readable template name from an id, or null.
function templateNameFromId(id) {
  if (!id) return null;
  const t = (TEMPLATES || []).find(x => x.id === id);
  if (t) return t.label;
  const d = (typeof DOCUMENT_TEMPLATES !== "undefined" ? DOCUMENT_TEMPLATES : []).find(x => x.id === id);
  return d ? d.label : null;
}

// v97.10: resolve the intake prompt a shared card should stage into the composer.
// Order: (1) the referenced template's own intake prompt, if the id resolves;
// (2) a safe generic prompt built from decision type and workflow, when no template.
// Never includes private content — decisionType is public metadata only.
function stagedIntakeForCard(payload) {
  const wt = (payload && payload.wt) || "decide";
  const tid = payload && payload.t;
  if (tid) {
    const t = (TEMPLATES || []).find(x => x.id === tid)
           || (typeof DOCUMENT_TEMPLATES !== "undefined" ? DOCUMENT_TEMPLATES : []).find(x => x.id === tid);
    if (t && t.intake) return { text: t.intake, workflowType: wt, selectedTemplate: tid };
  }
  const subject = (payload && payload.d) ? payload.d : (wt === "draft" ? "this document" : "this decision");
  const text = wt === "draft"
    ? `I need to create a document for ${subject}. Help me clarify the audience, purpose, required sections, and finished output.`
    : `I need to make a decision about ${subject}. Help me clarify the options, assumptions, risks, and next step.`;
  return { text, workflowType: wt, selectedTemplate: tid || null };
}

// Subtle brand footer shared by every card.
function CardBrandFooter() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:14, paddingTop:12, borderTop:"1px solid var(--line)" }}>
      <BrandMark size={14} />
      <span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--meta)" }}>WorkOutput</span>
      <span style={{ marginLeft:"auto", fontFamily:"var(--serif)", fontSize:11.5, fontStyle:"italic", color:"var(--meta)" }}>Private details are hidden by default.</span>
    </div>
  );
}

// v126.5: BeforeAfterCard, AssumptionMapCard, and TemplatePathCard were removed.
// They were live-DOM share cards superseded by the SVG poster pipeline
// (ShareArtifact -> PosterPreview -> socialPosterSvg(posterContentForShare(...))),
// which is the only share path that can rasterize to PNG for download and native
// share. before_after and assumption_map are reproduced in posterContentForShare;
// template_path was retired as a card type (absent from SHARE_CARD_TYPES). The
// assumption-map privacy rule now lives on the assumption_map branch in
// posterContentForShare. CardBrandFooter is retained — still used by HistoryCard
// and StyleCard below.

// v114: Decision Style card — the shareable identity artifact. Renders the user's
// archetype name + derivation line. Carries no private decision content.
function HistoryCard({ n, reviewed, streak }) {
  const blank = !n;
  return (
    <div style={{ background:"var(--edge)", border:"1px solid var(--line)", borderRadius:14, padding:"20px 22px" }}>
      <div style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--meta)", marginBottom:8 }}>Decision History</div>
      <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:24, color:"var(--ink)", letterSpacing:"-0.01em", marginBottom:6 }}>{blank ? "A decision history starts here" : "How their decisions add up"}</div>
      {blank ? (
        <div style={{ fontFamily:"var(--serif)", fontSize:14.5, lineHeight:1.5, color:"var(--ink2)" }}>Every call structured, kept, and reviewed.</div>
      ) : (
        <div style={{ display:"flex", gap:22, marginTop:12, flexWrap:"wrap" }}>
          {[["Decisions", String(n)], ["Reviewed", String(reviewed||0)], ["Streak", String(streak||0)+"d"]].map(([k,v],i)=>(
            <div key={i}>
              <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:24, color:"var(--ink)", lineHeight:1 }}>{v}</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.05em", textTransform:"uppercase", color:"var(--meta)", marginTop:4 }}>{k}</div>
            </div>
          ))}
        </div>
      )}
      <CardBrandFooter />
    </div>
  );
}

function StyleCard({ name, line, n }) {
  return (
    <div style={{ background:"var(--edge)", border:"1px solid var(--line)", borderRadius:14, padding:"20px 22px" }}>
      <div style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--meta)", marginBottom:8 }}>Decision Style</div>
      <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:24, color:"var(--ink)", letterSpacing:"-0.01em", marginBottom:6 }}>{name || "Calibrating"}</div>
      {line && <div style={{ fontFamily:"var(--serif)", fontSize:14.5, lineHeight:1.5, color:"var(--ink2)" }}>{line}</div>}
      {n != null && <div style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--meta)", marginTop:10 }}>Derived from {n} {n===1?"decision":"decisions"}</div>}
      <CardBrandFooter />
    </div>
  );
}

// v114.3: one reusable share control for every shareable card. Pre-generates the PNG
// when its inputs change (cacheKey), so the click can call the native share sheet
// synchronously — the iOS gesture requirement. Records its own share metric. This is the
// single share mechanism across the Decision Card, the Profile style card, and the
// first-commit modal, so new shareable cards reuse it without bespoke wiring.
function ShareImageButton({ makeBlob, cacheKey, filename, text, label = "Share", metricType, kind = "primary", full, size = "md", style }) {
  const blobRef = React.useRef(null);
  const fnRef = React.useRef(makeBlob); fnRef.current = makeBlob;
  const [flash, setFlash] = React.useState(null);
  const flashTimer = React.useRef(null);
  React.useEffect(() => {
    let live = true; blobRef.current = null;
    ensureOpenSansEmbedded().then(() => fnRef.current && fnRef.current()).then(b => { if (live && b) blobRef.current = b; }).catch(()=>{});
    return () => { live = false; };
  }, [cacheKey]);
  React.useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);
  const showFlash = (res) => {
    const msg = res === "shared" ? "Shared" : res === "saved" ? "Image saved" : res === "copied" ? "Copied" : res === "cancelled" ? null : "Couldn't share";
    if (!msg) return;
    setFlash(msg);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 1800);
  };
  const record = () => { if (metricType) { try { recordMetric("share_card_copied", metricType); recordMetric("share", "card"); } catch(_){} } };
  // Always resolve to a visible outcome: native share -> download -> copy link.
  const settle = (res) => {
    if (res === "failed") { copyShareText(text).then(showFlash); return; }
    showFlash(res);
  };
  const onClick = () => {
    record();
    const blob = blobRef.current;
    if (blob) { Promise.resolve(shareBlobNow(blob, filename, text)).then(settle).catch(() => copyShareText(text).then(showFlash)); return; }
    ensureOpenSansEmbedded().then(() => fnRef.current && fnRef.current())
      .then(b => b ? Promise.resolve(shareBlobNow(b, filename, text)).then(settle) : copyShareText(text).then(showFlash))
      .catch(() => copyShareText(text).then(showFlash));
  };
  return <Btn kind={kind} full={full} size={size} style={style} onClick={onClick}><Share2 size={15} />{flash || label}</Btn>;
}

// PosterPreview — renders the canonical share poster (the exact artifact that gets
// shared) inline as an image, so the in-app preview always matches the output.
function PosterPreview({ type, data }){
  const [fontReady, setFontReady] = React.useState(!!_openSansFontCss);
  React.useEffect(() => { let live = true; ensureOpenSansEmbedded().then(() => { if (live) setFontReady(true); }); return () => { live = false; }; }, []);
  const src = React.useMemo(() => {
    try {
      const svg = socialPosterSvg(posterContentForShare(type, data || {}));
      return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    } catch (e) { return null; }
  }, [type, JSON.stringify(data || {}), fontReady]);
  if (!src) return null;
  return (
    <div style={{ borderRadius:14, overflow:"hidden", border:"1px solid var(--line)", background:"#0a0907" }}>
      <img src={src} alt="Share card preview" style={{ display:"block", width:"100%", height:"auto" }} />
    </div>
  );
}

// ── ShareArtifact — the switcher + active card. Stateless on type ─────────────
// activeType is controlled by the parent so the parent owns instrumentation.
// Switcher state is NOT persisted between commits by design.
function ShareArtifact({ activeType, onTypeChange, cardProps, showDecisionStyle, styleData, includeAssumptionText, onToggleAssumptionText, hasAssumptionText }) {
  const types = SHARE_CARD_TYPES.filter(t => t.id !== "decision_style" || showDecisionStyle);
  return (
    <div>
      {/* Switcher */}
      <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
        {types.map(t => {
          const active = t.id === activeType;
          return (
            <button key={t.id} onClick={()=>onTypeChange(t.id)}
              style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.03em", padding:"6px 11px", borderRadius:20,
                border:`1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                background: active ? "var(--accent-soft)" : "transparent",
                color: active ? "var(--accent)" : "var(--meta)", cursor:"pointer" }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Active card — the canonical poster (preview == shared artifact) */}
      {(() => {
        const data = activeType === "decision_style"
          ? (styleData || {})
          : { ...cardProps, assumptionText: (activeType === "assumption_map" && includeAssumptionText) ? cardProps.assumptionText : null };
        return <PosterPreview type={activeType} data={data} />;
      })()}

      {/* Assumption text toggle — only on the Assumption Map card, default off */}
      {activeType === "assumption_map" && hasAssumptionText && (
        <div style={{ marginTop:12 }}>
          <button onClick={onToggleAssumptionText}
            style={{ display:"flex", alignItems:"center", gap:8, background:"transparent", border:"none", cursor:"pointer", padding:0 }}>
            <span style={{ width:34, height:20, borderRadius:11, background: includeAssumptionText ? "var(--accent)" : "var(--line)", position:"relative", transition:"background .2s", flexShrink:0 }}>
              <span style={{ position:"absolute", top:3, left: includeAssumptionText ? 17 : 3, width:14, height:14, borderRadius:"50%", background:"var(--paper)", transition:"left .2s" }} />
            </span>
            <span style={{ fontFamily:"var(--serif)", fontSize:13, color:"var(--ink2)" }}>Include assumption text</span>
            <span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.04em", color:"var(--meta)" }}>{includeAssumptionText ? "ON" : "OFF"}</span>
          </button>
          <p style={{ fontFamily:"var(--serif)", fontSize:12, color:"var(--meta)", margin:"6px 0 0 42px", lineHeight:1.45 }}>
            Off by default. Leave this off for work, personal, or sensitive decisions.
          </p>
          {includeAssumptionText && (
            <p style={{ fontFamily:"var(--serif)", fontSize:12, color:"var(--critical)", margin:"6px 0 0 42px", lineHeight:1.45 }}>
              Assumption text will be visible to anyone with the link.
            </p>
          )}
        </div>
      )}
    </div>
  );
}


// ── GhostLedgerPreview — illustrative preview of the calibration profile ──────
// Renders a ghost/preview state showing the shape of what the ledger becomes.
// v91: injected into FirstCommitShareModal; v97.1 framed as "what this becomes".
//
// NOT_BENCHMARK: all values below (ghostRate, ghostCategories) are illustrative
// only. They are NOT derived from user data, aggregate user data, or any product
// benchmark. They exist solely to show the UI shape. Never present these numbers
// in any external context as representative of real user outcomes.
function GhostLedgerPreview({ decisionType }) {
  // Illustrative display values — not real data, not a benchmark.
  // Category label is seeded from the current decision type for visual relevance;
  // the numbers are fixed illustrative values, not calculated from anything.
  const primaryCategory = decisionType || "Strategy";
  const ghostCategories = [
    { label: primaryCategory, held: 8, total: 10, rate: 80 },
    { label: "People",         held: 5, total: 7,  rate: 71 },
    { label: "Operations",     held: 3, total: 5,  rate: 60 },
  ];
  const ghostRate = 74; // illustrative — not a benchmark
  const ghostN = 10;    // illustrative — not a benchmark

  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  const barW = (pct) => `${pct}%`;

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(8px)",
      transition: "opacity 0.45s ease, transform 0.45s ease",
      background: "var(--edge)",
      border: "1px dashed var(--line)",
      borderRadius: 12,
      padding: "16px 18px",
      marginBottom: 16,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ghost watermark */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: "repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(255,255,255,0.015) 10px, rgba(255,255,255,0.015) 20px)",
        pointerEvents: "none", borderRadius: 12,
      }} />

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <Eye size={14} style={{ color:"var(--meta)", opacity:0.7 }} />
        <span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--meta)", opacity:0.8 }}>
          Preview: your ledger at 10 decisions
        </span>
      </div>

      {/* Ghost headline rate */}
      <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:10 }}>
        <span style={{ fontFamily:"var(--display)", fontWeight:700, fontSize:36, color:"var(--accent)", opacity:0.45, filter:"blur(0.5px)" }}>
          {ghostRate}%
        </span>
        <div>
          <div style={{ fontFamily:"var(--serif)", fontSize:13, color:"var(--meta)", lineHeight:1.3 }}>of load-bearing assumptions held</div>
          <div style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--meta)", opacity:0.6 }}>{ghostN} decisions committed · {ghostN} reviewed</div>
        </div>
      </div>

      {/* Ghost category bars */}
      <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:10 }}>
        {ghostCategories.map((cat, i) => (
          <div key={i}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--meta)", opacity:0.7 }}>{cat.label}</span>
              <span style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--meta)", opacity:0.5 }}>{cat.rate}% · {cat.total}</span>
            </div>
            <div style={{ height:4, borderRadius:2, background:"var(--line)", overflow:"hidden" }}>
              <div style={{
                height:"100%", width: barW(cat.rate),
                background: cat.rate >= 75 ? "var(--positive)" : cat.rate >= 55 ? "var(--caution)" : "var(--critical)",
                borderRadius:2, opacity: 0.4,
                transition: `width 0.7s ease ${i * 0.12}s`,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Ghost label */}
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--accent)", opacity:0.4 }} />
        <span style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--meta)", opacity:0.65, lineHeight:1.4 }}>
          Illustrative preview — these numbers are not your data. Your actual held-rate and category breakdown build from your reviewed decisions.
        </span>
      </div>
    </div>
  );
}

// ── FirstCommitShareModal — fires after the very first Commit in a session ────
// v97.1: rebuilt around the share artifact system. Before/After is the default
// card. The ghost ledger preview moves below the share card as the "what this
// becomes over time" preview. An artifact switcher lets the user pick a card type.
// Decision Style appears only at >=3 reviewed outcomes. No private content shows
// by default; assumption text is gated behind an explicit toggle on the map card.
function FirstCommitShareModal({ onClose, onShare, style, doc, decisionState, narrow, ledgerMetrics, reviewHorizonDays, profile }) {
  const ds = decisionState || {};
  const decisionType = ds.decisionType || null;
  const templateName = templateNameFromId(ds.selectedTemplate);
  const assumptionCategory = (ds.loadBearingAssumption && ds.loadBearingAssumption.category) || null;
  const assumptionText = (ds.loadBearingAssumption && ds.loadBearingAssumption.text) || null;
  const confidence = ds.confidence || null; // v99.7 (P9): lastReasoningFromDoc removed — it read fields the doc parser never sets, so it was always null
  const evidenceStrength = ds.evidenceStrength || null;
  const optionsCount = (ds.options || []).length || null;
  const decisionSummary = (doc && doc.title) || decisionType || null;
  const assumptionReliability = deriveAssumptionPillars(profile, assumptionCategory);
  const outcomeResult = (ds.outcome && ds.outcome.result) || null;
  const reviewLabel = ds.reviewDueAt
    ? _relDate(ds.reviewDueAt)
    : (reviewHorizonDays ? `in ${reviewHorizonDays} days` : null);
  const showDecisionStyle = !!(style && style.name); // v114.3: the real archetype, available at 3+ decisions

  // Card switcher state — intentionally NOT persisted between commits.
  const [activeType, setActiveType] = React.useState("before_after");
  const [includeAssumptionText, setIncludeAssumptionText] = React.useState(false);

  // v97.1: instrument the initial view once on mount.
  React.useEffect(() => {
    recordMetric("share_card_viewed", "before_after");
  }, []);

  const changeType = (t) => {
    setActiveType(t);
    recordMetric("share_card_type_changed", t);
    recordMetric("share_card_viewed", t);
  };

  const cardProps = {
    decisionType, templateName, assumptionCategory, confidence, reviewLabel,
    assumptionText, ledgerMetrics, workflowType: ds.workflowType,
    evidenceStrength, optionsCount, assumptionReliability, decisionSummary,
    outcome: outcomeResult, committedLabel: "today", revealLabel: reviewLabel,
    predictionTrigger: (ds.prediction && ds.prediction.trigger) || null, // v122: the sealed bet on the card
  };

  return (
    <Overlay onClose={onClose} narrow={narrow}>
      <div style={{ padding:"24px 22px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <Kicker>Decision committed</Kicker>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--meta)" }}><X size={18} /></button>
        </div>

        {/* Share artifact — Before/After is default. Switcher above the card. */}
        <ShareArtifact
          activeType={activeType}
          onTypeChange={changeType}
          cardProps={cardProps}
          showDecisionStyle={showDecisionStyle}
          styleData={style}
          includeAssumptionText={includeAssumptionText}
          onToggleAssumptionText={()=>setIncludeAssumptionText(v=>!v)}
          hasAssumptionText={!!assumptionText}
        />

        {/* Share actions — primary Share leads, secondary below (consistent placement). */}
        <div style={{ marginTop:16, marginBottom:18 }}>
          <ShareImageButton full
            makeBlob={()=>{
              const data = activeType === "decision_style"
                ? style
                : { ...cardProps, assumptionText: (activeType==="assumption_map" && includeAssumptionText) ? cardProps.assumptionText : null };
              return svgToPngBlob(socialPosterSvg(posterContentForShare(activeType, data)), 1080, 1350);
            }}
            cacheKey={"modal:"+activeType+":"+(includeAssumptionText?"1":"0")+":"+((style&&style.name)||"")}
            filename={(activeType||"decision")+"_card.png"}
            text="My decision card. Built with WorkOutput. https://workoutput.com"
            metricType={activeType}
            label="Share as image"
          />
          <div style={{ display:"flex", gap:10, marginTop:10, flexWrap:"wrap" }}>
            <Btn kind="ghost" onClick={()=>{ onShare(activeType, activeType==="assumption_map" && includeAssumptionText); onClose(); }}>Copy link</Btn>
            <Btn kind="ghost" onClick={onClose}>Done</Btn>
          </div>
        </div>

        {/* v91: Ghost Ledger Preview — now framed as "what this becomes over time" */}
        <div style={{ marginBottom:6 }}>
          <Kicker style={{ color:"var(--meta)", marginBottom:10 }}>What this becomes over time</Kicker>
          <GhostLedgerPreview decisionType={decisionType} />
        </div>

        {/* v96: Ledger onboarding callout — names the outcome review loop explicitly */}
        <div style={{ background:"var(--edge)", border:"1px solid var(--line)", borderLeft:"3px solid var(--accent)", borderRadius:8, padding:"12px 14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
            <Clock size={14} style={{ color:"var(--accent)", flexShrink:0 }} />
            <span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:14, color:"var(--ink)" }}>Your first decision is in your ledger.</span>
          </div>
          <p style={{ fontFamily:"var(--serif)", fontSize:13.5, color:"var(--ink2)", lineHeight:1.5, margin:0 }}>
            In {reviewHorizonDays || 7} days, WorkOutput will ask whether your call held. That single check starts your track record, a compounding record of how your judgment holds under real conditions.
          </p>
        </div>
      </div>
    </Overlay>
  );
}

// ── FrameworkLandingView — shown when arriving via a ?framework= share link ───
// Replaces the silent notice-banner landing with an explicit invitation screen.
function FrameworkLandingView({ landing, onStart, pad }) {
  const { title, decisionType } = landing;
  return (
    <div style={{ maxWidth:560, margin:"0 auto", padding:pad }}>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ width:48, height:48, borderRadius:12, background:"var(--accent-soft)", border:"1px solid var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
          <Share2 size={22} style={{ color:"var(--accent)" }} />
        </div>
        <Kicker style={{ marginBottom:8 }}>Shared playbook</Kicker>
        <h1 style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:26, lineHeight:1.15, color:"var(--ink)", margin:"0 0 10px" }}>
          {title || decisionType || "Decision playbook"}
        </h1>
        {decisionType && title && decisionType !== title && (
          <p style={{ fontFamily:"var(--serif)", fontSize:15, color:"var(--meta)", margin:0 }}>{decisionType}</p>
        )}
      </div>
      <div className="wo-in" style={{ background:"var(--edge)", border:"1px solid var(--line)", borderRadius:12, padding:"18px 20px", marginBottom:20 }}>
        <p style={{ fontFamily:"var(--serif)", fontSize:15.5, lineHeight:1.55, color:"var(--ink2)", margin:0 }}>
          Someone shared a decision framework with you. You'll start with the same structure. Your work is private and completely separate from theirs.
        </p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <Btn full onClick={onStart}><GitBranch size={15} />Start your own decision</Btn>
        <p style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.04em", color:"var(--meta)", textAlign:"center", margin:0 }}>No account required to start</p>
      </div>
    </div>
  );
}

// ── CardLandingView — public-safe landing for a ?card= share link ─────────────
// v97.1: shows the shared artifact card, one short paragraph explaining the method,
// and a single primary CTA. Clicking the CTA seeds a session with the associated
// template (or a generic intake if none) and fires shared_path_started.
function CardLandingView({ payload, onStart, pad }) {
  const cardType = (payload && payload.card) || "before_after";
  const templateName = templateNameFromId(payload && payload.t);
  const cardProps = {
    decisionType: (payload && payload.d) || null,
    templateName,
    assumptionCategory: (payload && payload.ac) || null,
    confidence: (payload && payload.cf) || null,
    reviewLabel: null,
    assumptionText: (payload && payload.at) || null,
    ledgerMetrics: null,
    workflowType: (payload && payload.wt) || null,
  };
  // Decision Style is account-specific. A shared link never carries another person's
  // style profile and we never infer the recipient's, so when a link references
  // decision_style we show an explicit, privacy-safe fallback notice and then a useful
  // artifact (Template Path if a template is known, otherwise Before/After).
  const isDecisionStyle = cardType === "decision_style";
  const isHistory = cardType === "decision_history";
  const hasStylePayload = isDecisionStyle && !!(payload && payload.sn); // v114: a real shared style
  const renderType = (isDecisionStyle || isHistory) ? "before_after" : cardType;
  // Note: the recipient opening this public landing is counted once by share_card_opened
  // in the ?card= decode path. We do NOT record share_card_viewed here — "viewed" means
  // the current user viewed their own share modal, a distinct event from a public open.
  return (
    <div style={{ maxWidth:560, margin:"0 auto", padding:pad }}>
      <div style={{ textAlign:"center", marginBottom:22 }}>
        <Kicker style={{ marginBottom:8 }}>{hasStylePayload ? "Shared decision style" : isHistory ? "Shared decision history" : "Shared decision path"}</Kicker>
        <h1 style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:26, lineHeight:1.15, color:"var(--ink)", margin:0 }}>
          {hasStylePayload ? "See how they decide" : isHistory ? "See how their decisions compound" : "See how this decision was worked"}
        </h1>
      </div>

      {/* v114: real shared decision-style card (name + derivation, no private content). */}
      {hasStylePayload ? (
        <div style={{ marginBottom:18 }}>
          <StyleCard name={payload.sn} line={payload.sl || null} n={payload.n != null ? payload.n : null} />
        </div>
      ) : isHistory ? (
        <div style={{ marginBottom:18 }}>
          <HistoryCard n={(payload && payload.n) || 0} reviewed={(payload && payload.rv) || 0} streak={(payload && payload.sk) || 0} />
        </div>
      ) : (
        <>
          {/* Decision Style fallback notice — only for legacy style links with no payload */}
          {isDecisionStyle && (
            <div style={{ background:"var(--edge)", border:"1px dashed var(--line)", borderRadius:12, padding:"16px 18px", marginBottom:14 }}>
              <p style={{ fontFamily:"var(--serif)", fontSize:14.5, lineHeight:1.5, color:"var(--ink2)", margin:0 }}>
                This style card has no shared detail. Try this decision path to build your own profile.
              </p>
            </div>
          )}
          {/* The shared artifact card — canonical poster */}
          <div style={{ marginBottom:18 }}>
            <PosterPreview type={renderType} data={cardProps} />
          </div>
        </>
      )}

      {/* One short paragraph explaining the method */}
      <div className="wo-in" style={{ background:"var(--edge)", border:"1px solid var(--line)", borderRadius:12, padding:"16px 18px", marginBottom:20 }}>
        <p style={{ fontFamily:"var(--serif)", fontSize:15, lineHeight:1.55, color:"var(--ink2)", margin:0 }}>
          WorkOutput turns an unclear call into a committed next step. It structures the decision, names the assumption it rests on, and schedules a review so you learn whether your judgment held. Your work stays private and separate from theirs.
        </p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <Btn full onClick={()=>{ onStart(); recordMetric("share_card_cta_clicked", renderType); }}><GitBranch size={15} />Try this decision path</Btn>
        <p style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.04em", color:"var(--meta)", textAlign:"center", margin:0 }}>No account required to start</p>
      </div>
    </div>
  );
}

function AuthGate({ onClose, setTier, narrow, mandatory }){
  const benefits = [
    "Your decisions stay saved, pick up any session from any device",
    "Your decision profile builds with every decision you finish",
    "Share how you worked a decision, never what you decided",
    "Whoever you share with starts a private decision from the same starting point",
  ];
  // v127: mandatory mode is the boot gate. There is no anonymous/guest usage, so the
  // overlay cannot be dismissed (no backdrop close, no Esc close) and the copy is
  // onboarding, not a spent-session notice. setTier("free") clears the gate by moving
  // the app out of the unauthenticated (tier === null) state.
  const dismiss = mandatory ? () => {} : onClose;
  return (
    <Overlay onClose={dismiss} narrow={narrow}>
      <div style={{ padding:"26px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <span style={{ width:40, height:40, borderRadius:10, background:"var(--accent-soft)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Sparkles size={20} style={{ color:"var(--accent)" }} /></span>
          <div>
            <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:18, color:"var(--ink)", lineHeight:1.2 }}>{mandatory ? "Create your free account to begin" : "You have used your free guided session"}</div>
            <div style={{ fontFamily:"var(--serif)", fontSize:13.5, color:"var(--meta)", marginTop:2 }}>{mandatory ? "An account is required to use WorkOutput. No card needed." : "Create a free account to save, export, or continue."}</div>
          </div>
        </div>
        <div style={{ background:"var(--edge)", border:"1px solid var(--line)", borderRadius:10, padding:"12px 14px", marginBottom:18 }}>
          {benefits.map((b,i)=>(
            <div key={i} style={{ display:"flex", gap:9, marginBottom:i<benefits.length-1?9:0 }}>
              <Check size={14} style={{ color:"var(--positive)", marginTop:3, flexShrink:0 }} />
              <span style={{ fontFamily:"var(--serif)", fontSize:14, color:"var(--ink2)", lineHeight:1.45 }}>{b}</span>
            </div>
          ))}
        </div>
        <Btn full onClick={()=>{ setTier("free"); onClose && onClose(); }} style={{ marginBottom:10 }}>
          Create a free account, no card needed
        </Btn>
        <button onClick={()=>{ setTier("free"); onClose && onClose(); }} style={{ width:"100%", background:"transparent", border:"none", cursor:"pointer", fontFamily:"var(--serif)", fontSize:14.5, color:"var(--meta)", padding:"8px 0", textDecoration:"underline", textUnderlineOffset:3 }}>
          Sign in to an existing account
        </button>
        <p style={{ fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.03em", color:"var(--meta)", textAlign:"center", margin:"12px 0 0", lineHeight:1.5 }}>
          Free accounts get {TIER_POLICY.free.maxDecisionsPerMonth} decisions or documents / month. Upgrade anytime for more.
        </p>
      </div>
    </Overlay>
  );
}
// ── CommitMoreOptions — extracted from tools-sheet Commit stage ───────────────
// Previously this was an IIFE with useState inside a render callback — a hooks-rules
// violation. Extracted as a named component so hooks are called unconditionally.
function CommitMoreOptions({ onContradiction, attached, tier, setToolsSheet, setView }) {
  const [moreOpen, setMoreOpen] = React.useState(false);
  return (
    <>
      <button onClick={()=>setMoreOpen(o=>!o)} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"8px 0", fontFamily:"var(--mono)", fontSize:11.5, letterSpacing:"0.04em", color:"var(--meta)" }}>
        {moreOpen ? "Less" : "More options"} <span style={{ fontSize:14, lineHeight:1 }}>{moreOpen ? "−" : "+"}</span>
      </button>
      {moreOpen && (
        <div style={{ marginTop:6 }}>
          <Btn full kind="ghost" onClick={()=>{ setToolsSheet(false); onContradiction(); }} style={{ marginBottom:9 }}><Shield size={15} />Check for conflicts</Btn>
          {attached && attached.length>0 && has(tier,"advancedTools") && (
            <div style={{ background:"var(--edge)", border:"1px solid var(--line)", borderRadius:8, padding:"10px 12px", marginBottom:9 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}><Layers size={14} style={{ color:"var(--accent)" }} /><span style={{ fontFamily:"var(--serif)", fontSize:13.5, color:"var(--ink2)" }}>Used prior context from {attached.length} {attached.length===1?"decision":"decisions"}</span></div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function TabBar({ view, setView, tier, onUpgrade }){
  const tabs = [
    { id:"Home", label:"Work", icon:PenLine },
    { id:"templates", label:"Templates", icon:LayoutGrid },
    { id:"profile", label:"Profile", icon:User, feature:"profile" },
    { id:"pricing", label:"Plans", icon:Crown },
  ];
  return (
    <nav style={{ display:"flex", borderTop:"1px solid var(--line)", background:"var(--panel)", flexShrink:0 }}>
      {tabs.map(t=>{ const Icon=t.icon; const active=view===t.id; const locked=t.feature && !has(tier,t.feature);
        return (<button key={t.id} onClick={()=>locked?onUpgrade():setView(t.id)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", padding:"9px 0 11px", display:"flex", flexDirection:"column", alignItems:"center", gap:3, color:active?"var(--accent)":"var(--meta)" }}><Icon size={19} /><span style={{ fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:"0.04em" }}>{t.label}</span></button>);
      })}
    </nav>
  );
}


// v122: read-only public calibration profile. Rendered by the route guard in the App
// when ?u=<handle> is present, in place of the full app. Self-contained: it does not
// touch app state. Data comes from window.__WO_PUBLIC_PROFILE__ (Supabase-injected on the
// migrated backend) or, for the owner's own ?u=me self-preview, from the local credential.
function PublicProfileView({ handle }){
  const [cred, setCred] = React.useState(undefined); // undefined = loading, null = none
  React.useEffect(() => {
    let live = true;
    (async () => {
      try {
        if (typeof window !== "undefined" && window.__WO_PUBLIC_PROFILE__) {
          if (live) setCred(window.__WO_PUBLIC_PROFILE__);
          return;
        }
        if (handle === "me") {
          const p = await loadProfile();
          const c = deriveCredential(p, {});
          if (live) setCred(c && c.ready ? c : null);
          return;
        }
        if (live) setCred(null); // unknown handle, no server data injected
      } catch { if (live) setCred(null); }
    })();
    return () => { live = false; };
  }, [handle]);
  const wrap = (inner) => (
    <div style={{ minHeight:"100vh", width:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg, #0f0f10)", color:"var(--ink, #f4f1ea)", fontFamily:"var(--serif, Georgia, serif)", padding:24 }}>
      <style>{STYLE}</style>
      <div style={{ maxWidth:440, width:"100%", background:"var(--edge)", border:"1px solid var(--line)", borderRadius:16, padding:28, textAlign:"center" }}>
        {inner}
        <a href={(typeof window!=="undefined" ? (window.location.origin + window.location.pathname) : "/")} style={{ display:"inline-block", marginTop:22, fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.04em", color:"var(--accent)", textDecoration:"none" }}>Build your own record at workoutput.com</a>
      </div>
    </div>
  );
  if (cred === undefined) return wrap(<div style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--meta)" }}>Loading record…</div>);
  if (!cred || !cred.ready) return wrap(
    <>
      <div style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--meta)", marginBottom:10 }}>Calibration record</div>
      <div style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:22, color:"var(--ink)" }}>No public record here yet</div>
      <p style={{ fontFamily:"var(--serif)", fontSize:14, color:"var(--meta)", marginTop:8 }}>This profile is private or its track record has not been issued.</p>
    </>
  );
  return wrap(
    <>
      <div style={{ fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--meta)", marginBottom:14 }}>Calibration credential</div>
      <div style={{ fontFamily:"var(--display)", fontWeight:700, fontSize:64, lineHeight:1, color:"var(--accent)" }}>{cred.heldRate}%</div>
      <div style={{ fontFamily:"var(--serif)", fontSize:15, color:"var(--ink2)", marginTop:8 }}>of reviewed calls held</div>
      <div style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--meta)", marginTop:16 }}>{cred.gradedN} graded {cred.gradedN===1?"decision":"decisions"}</div>
      {cred.attestation ? <div style={{ fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.04em", color:"var(--meta)", marginTop:6 }}>Verified record · {cred.attestation}</div> : null}
    </>
  );
}

// ── useModalStack — single mutually-exclusive overlay slot (v126.5) ────────────
// Replaces the prior set of independent boolean modal flags (shareOpen, exportPicker,
// toolsSheet, authGate, firstCommitShareOpen) with one activeModal cell. Only one
// overlay can be open at a time, which removes the "two overlays stacked" failure
// class. closeIf(name) closes only when that overlay is the active one, so a stale
// setX(false) cannot dismiss a different overlay. Banner-style surfaces that are meant
// to coexist (e.g. overageBanner) are intentionally NOT routed through this hook.
function useModalStack() {
  const [active, setActive] = React.useState(null);
  const open = React.useCallback((name) => setActive(name), []);
  const close = React.useCallback(() => setActive(null), []);
  const closeIf = React.useCallback((name) => setActive((cur) => (cur === name ? null : cur)), []);
  const is = React.useCallback((name) => active === name, [active]);
  return { active, open, close, closeIf, is };
}

// ── useEntitlements — tier + client-side metering counters (v126.5) ────────────
// Lifts the tier and the four usage counters (guest, monthly decisions, intelligence
// credits, daily sessions) out of the root component, together with the load effects
// and refreshers that own them. Every returned name matches its previous in-component
// name, so call sites elsewhere (refreshCredits, bumpGuestUsed, setMonthUsed, setTier,
// refreshDailyUsed, ...) are unchanged. This is the same client-side, affordance-not-
// security gating documented by the TODO(server) markers; moving it server-side is a
// later step and this hook is the seam where that swap lands.
function useEntitlements() {
  // The Vercel deployment is protected by the outer password gate. Once a visitor
  // passes that gate, they can view the app surface without Supabase account sign-in.
  const [tier, setTier] = React.useState("free");

  // v74: decisions created this calendar month by the logged-in free tier. Loaded
  // from the limits seam on mount and after each create. setMonthUsed is exposed so
  // the create flow can set the post-create count directly.
  const [monthUsed, setMonthUsed] = React.useState(0);
  const [resetDays, setResetDays] = React.useState(null);
  React.useEffect(() => { (async () => { try { setMonthUsed(await ACTIVE_LIMITS.count()); setResetDays(await ACTIVE_LIMITS.resetInDays()); } catch (_) {} })(); }, []);
  // v97: refresh the reset window once the user is authenticated (any real tier).
  React.useEffect(() => { if (tier) { (async () => { try { await ensureLimitAnchor(); setResetDays(await ACTIVE_LIMITS.resetInDays()); } catch (_) {} })(); } }, [tier]);

  // v97: intelligence credit state — loaded on mount and after each tool run.
  const [creditsUsed, setCreditsUsed] = React.useState(0);
  const refreshCredits = React.useCallback(async () => { try { setCreditsUsed(await ACTIVE_CREDIT_LIMITS.count()); } catch (_) {} }, []);
  React.useEffect(() => { refreshCredits(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // v102: daily session usage — loaded on mount and after each admitted session.
  const [dailyUsed, setDailyUsed] = React.useState(0);
  const refreshDailyUsed = React.useCallback(async () => { try { setDailyUsed(await ACTIVE_DAILY_LIMITS.count()); } catch (_) {} }, []);
  React.useEffect(() => { refreshDailyUsed(); }, [refreshDailyUsed]);

  return { tier, setTier, monthUsed, setMonthUsed, resetDays, setResetDays, creditsUsed, refreshCredits, dailyUsed, refreshDailyUsed };
}

export default function WorkOutputV48(){
  // v122: public profile route guard. When the URL carries ?u=<handle>, render the
  // read-only credential surface instead of the app. Isolated: returns before any app
  // state is used, so it cannot affect the normal render path.
  const _publicHandle = (typeof getPublicProfileHandle === "function") ? getPublicProfileHandle() : null;
  if (_publicHandle) return <PublicProfileView handle={_publicHandle} />;
  const [view, setView] = React.useState("Home");
  const [prevView, setPrevView] = React.useState(null);
  const [theme, setTheme] = React.useState("dark");
  const [reviewHorizonDays, setReviewHorizonDays] = React.useState(DEFAULT_REVIEW_HORIZON_DAYS);
  const [narrow, setNarrow] = React.useState(typeof window!=="undefined" ? window.innerWidth < NARROW : false);
  const [drawer, setDrawer] = React.useState(false);

  const [input, setInput] = React.useState("");
  const mainScrollRef = React.useRef(null);
  const [messages, setMessages] = React.useState([]);     // {role,text,mode,reasoning}
  const [currentMode, setCurrentMode] = React.useState("Clarify");
  const [loading, setLoading] = React.useState(false);
  const [streaming, setStreaming] = React.useState(false);
  const [streamingText, setStreamingText] = React.useState("");
  const [activeDoc, setActiveDoc] = React.useState(null);
  const [lastReasoning, setLastReasoning] = React.useState(null);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  // a11y v104: live-region state + last-announced guard.
  const [a11yPolite, setA11yPolite] = React.useState("");
  const [a11yAssertive, setA11yAssertive] = React.useState("");
  const lastAnnouncedRef = React.useRef("");

  // session persistence
  const [sessionId, setSessionId] = React.useState(()=>genId());
  // v73: open every page at the top. The chat (Session) manages its own scroll, so it is
  // excluded; all other views reset to the top on entry. useLayoutEffect avoids a flash.
  React.useLayoutEffect(()=>{ if(view!=="Session"){ const el=mainScrollRef.current; if(el) el.scrollTop=0; } },[view, activeDoc, sessionId]);
  const [sessionIndex, setSessionIndex] = React.useState([]);
  const [chatScale, setChatScale] = React.useState(0.8); // chat font scale; default 80%, pinch/buttons range 50-200%
  const setChatScalePersist = (v) => { setChatScale(v); store.set("wo:chat:scale", String(v)).catch(()=>{}); };
  React.useEffect(()=>{ (async()=>{ try{ const r = await store.get("wo:chat:scale"); const n = r && parseFloat(r.value); if(n && n>=0.5 && n<=2) setChatScale(n); }catch(_){} })(); },[]);
  const [activeId, setActiveId] = React.useState(null);

  const messagesRef = React.useRef([]);                   // source of truth for the thread
  const rawHistoryRef = React.useRef([]);                 // {role,content}
  const decisionStateRef = React.useRef(emptyDecisionState());
  // v99.6 (M5): version counter for decisionStateRef mutations that bypass `messages`
  // (persistDsPatch on the active session, the fire-and-forget classify merge). Memos
  // that read decisionStateRef include this in their deps so scope toggles, outcome
  // patches, and classifier writebacks invalidate them instead of going stale.
  const [dsVersion, setDsVersion] = React.useState(0);
  const bumpDsVersion = React.useCallback(() => setDsVersion(v => v + 1), []);
  const streamingRef = React.useRef("");
  const abortRef = React.useRef(null);
  // v99.7 (C1): epoch counter for session identity. Bumped by restoreSession and
  // clearSessionState (which also abort all in-flight controllers). Async work
  // captures the epoch at start and re-checks it before mutating the live refs
  // (messagesRef / rawHistoryRef / decisionStateRef), so a stream or classifier
  // that resolves after a session switch can never write into the wrong session.
  const sessionEpochRef = React.useRef(0);
  // Abort controller for fire-and-forget classifyInput calls. Cancelled before each
  // new send so stale calls never write over the new turn's state.
  const classifyAbortRef = React.useRef(null);
  // v99.9 (C3): synchronous admission guard for sendMessage. The loading STATE is
  // stale inside the await window before setLoading(true) (the first-turn early
  // index save), so two rapid sends could both pass the gate, duplicate the user
  // turn, and share abortRef. A ref flips synchronously: set after the sync
  // pre-flight gates, cleared in finally. One send in flight, ever.
  const sendInFlightRef = React.useRef(false);
  // v101.1: synchronous admission guard for guardedSend's decision-charge path. The
  // A5 fix added a sendInFlightRef check at the top of guardedSend, but that ref is
  // not claimed until sendMessage runs — after guardedSend's own awaits
  // (isOverageEnabled, canCreateDecision). Two rapid fresh sends could both pass the
  // entry check, both bump the cap, and the second was then rejected by C3 inside
  // sendMessage: two decisions charged for one delivered send. This ref is claimed
  // synchronously at the top of the fresh branch, before any await, and released once
  // the bump and the sendMessage handoff are done. It serializes the charge decision
  // only; sendInFlightRef still serializes the send itself.
  const decisionChargeRef = React.useRef(false);

  // advanced intelligence
  const [mode, setMode] = React.useState("simple");
  const [intel, setIntel] = React.useState(null);
  const [profileRaw, setProfileRaw] = React.useState(null);
  const profileRef = React.useRef(null); // v61: latest profile for the send hot path (avoids stale closure)
  const [overlay, setOverlay] = React.useState(null);
  const [advRunning, setAdvRunning] = React.useState(null);
  const [role, setRole] = React.useState("Investor");
  // v70.4: permission role for the two metric scopes (distinct from the perspective
  // `role` above). Defaults to admin on the artifact host; ?as=marketing|viewer|user
  // previews other access. Not security — see the ACCESS ROLE SEAM note.
  const [accessRole] = React.useState(resolveAccessRole);
  const advAbortRef = React.useRef(null);
  const [attached, setAttached] = React.useState([]);
  const [contradiction, setContradiction] = React.useState(null);
  const attachedRef = React.useRef([]);

  // v60: Loop A — shared-view conversion
  const [sharedMeta, setSharedMeta] = React.useState(null);   // { templateId, decisionType, subtitle } when viewing a shared doc
  const [seedType, setSeedType] = React.useState(null);       // contextual label carried into a create-own session
  // v97.7: template prompt staged for the Home composer (edit-or-send, never auto-send).
  // { text, ts } — ts changes each time so HomeV72 reloads it even for the same text.
  const [homeSeed, setHomeSeed] = React.useState(null);
  const [loopMetrics, setLoopMetrics] = React.useState(null); // { shareCreated, shareOpened, createFromShare, kFactor, doc, framework }
  // v110.5: operator tier rollups, loaded lazily when an enterprise admin opens Site.
  const [siteAnalytics, setSiteAnalytics] = React.useState(null); // { usersByTier, subscriptionsByTier, tokenUsageByTier, generatedAt }
  // v69: which loop seeded the current session ("doc" | "fw" | null), pending a
  // create event on the first real send. Cleared on new/restore so a later send
  // never misattributes a create to an unrelated session.
  const seedLoopRef = React.useRef(null);
  // v76: a decision seeded from an example/template while a chat is already in progress
  // parks the current decision (pending) and opens a fresh one. The seeded send is
  // deferred to a post-render effect keyed on the new sessionId, because sendMessage
  // persists by the sessionId state (not a ref); sending in the same tick as the reset
  // would save the new decision under the parked id.
  const pendingSeedRef = React.useRef(null);

  const setBoth = (arr) => { messagesRef.current = arr; setMessages(arr); };
  const pushMsg = (m) => setBoth([...messagesRef.current, m]);

  const restoreSession = (s) => {
    // v99.7 (C1): kill all in-flight async work before swapping the live refs.
    // Without this, a stream completing after a mid-flight session switch pushed the
    // old session's assistant reply into the newly loaded session's UI and history,
    // then saved that mixed state under the old session id — corrupting both.
    sessionEpochRef.current++;
    try{ abortRef.current?.abort(); }catch(_){}
    try{ classifyAbortRef.current?.abort(); }catch(_){}
    try{ advAbortRef.current?.abort(); }catch(_){}
    messagesRef.current = s.messages || []; setMessages(messagesRef.current);
    rawHistoryRef.current = s.rawHistory || [];
    decisionStateRef.current = s.decisionState || emptyDecisionState();
    setSessionId(s.id); setActiveId(s.id);
    setActiveDoc(s.activeDoc || null); setCurrentMode((s.currentMode==="Chat"?"Clarify":s.currentMode) || "Clarify"); setLastReasoning(s.lastReasoning || null);
    setError(""); setNotice("");
    setIntel(null); setOverlay(null); setAttached([]); attachedRef.current=[]; setContradiction(null);
    seedLoopRef.current = null;
    // v99.6 (M4 fix): the first-commit guard is per-session state. Without this
    // reset it leaked across restores — suppressing the share surface in a fresh
    // restored session, or re-firing it in an already-committed one. A restored
    // session that already has a document is treated as having fired.
    firstCommitFiredRef.current = !!s.activeDoc;
    setView(s.activeDoc ? "Document" : ((s.messages && s.messages.length) ? "Session" : "Home"));
  };
  const newSession = () => {
    // v98.9: delegate to clearSessionState (extracted helper). Additive state
    // that newSession also needs (input clear, Home nav) is applied after.
    // v99: removed redundant setError/setNotice — clearSessionState already clears both.
    clearSessionState();
    setSessionId(genId()); setActiveId(null);
    setInput(""); setView("Home");
  };
  const loadById = async (id) => {
    let s = await loadSessionBlob(id);
    if(!s){
      // v97.9: the index row exists but the full session blob is missing — this happens
      // when the heavy blob write was rejected by the rate-limited artifact store while
      // the lightweight index write succeeded (the resilience path in saveSessionV47).
      // Rather than silently doing nothing on tap, reconstruct a minimal session from the
      // index meta so the decision still opens. The user lands on its first turn and can
      // continue; a successful turn re-saves the full blob.
      const meta = (sessionIndex || []).find(x => x && x.id === id);
      if(!meta){ setNotice("That decision could not be opened. It may not have finished saving."); return; }
      const firstUserText = meta.summary || meta.title || "";
      s = {
        id,
        title: meta.title || "Untitled decision",
        messages: firstUserText ? [{ role:"user", text: firstUserText }] : [],
        rawHistory: firstUserText ? [{ role:"user", content: firstUserText }] : [],
        activeDoc: null,
        currentMode: meta.mode || "Clarify",
        lastReasoning: null,
        decisionState: {
          ...emptyDecisionState(),
          selectedTemplate: meta.template || null,
          workflowType: meta.workflowType || "decide",
          scope: meta.scope || null,
          outcome: meta.outcome || null,
          reviewDueAt: meta.reviewDueAt || null,
          loadBearingAssumption: meta.loadBearingAssumption || null,
          committedAt: meta.committedAt || null,
          pending: !!meta.pending,
        },
      };
      setNotice("Reopened from your library. The earlier turns could not be fully restored, but you can continue this decision.");
    }
    restoreSession(s);
    // v76: reopening a parked decision clears its pending flag so it leaves the
    // Pending decisions list. The index refresh happens inside persistDsPatch.
    if(s.decisionState && s.decisionState.pending){
      decisionStateRef.current = mergeDecisionState(decisionStateRef.current, { pending:false });
      try{ await persistDsPatch(id, { pending:false }); }catch(_){}
    }
  };
  const deleteById = async (id) => {
    const idx = await deleteSessionBlob(id);
    if(idx){ setSessionIndex(idx.sessions||[]); if(id===sessionId) newSession(); else if(id===activeId) setActiveId(idx.activeId||null); }
  };
  // v100.1 (A2-recovery): write outcome/review fields straight to the index meta row,
  // bypassing the session blob. The ledger (buildReviewQueue, buildLedgerMetrics) reads
  // outcomes from index meta via metaResult — NOT from the blob — so a meta-only write is
  // fully visible to every dashboard. This is the fallback when persistDsPatch fails
  // because the blob is gone (v97.9 degraded path). Shallow-merge only; no blob touched.
  // Returns the patched meta row, or null if the index has no row for this id AND no
  // seedRow is supplied to rebuild it (the genuinely unrecoverable state), or the index
  // write fails.
  // v102 (heal-on-miss): seedRow lets a caller repair a storage/state divergence. When
  // the persisted index has lost the row but the caller still holds its meta (e.g. the
  // Review queue item, which lives in in-memory sessionIndex), pass it as seedRow and the
  // row is re-inserted with the patch applied, so the orphaned item repairs itself instead
  // of erroring. The blob is still gone, so any outcome written this way stays meta-only.
  const patchIndexMeta = async (id, metaPatch, seedRow = null) => {
    try {
      const index = await loadIndex();
      const i = (index.sessions || []).findIndex(s => s && s.id === id);
      if (i < 0) {
        if (!seedRow) return null; // no row to patch and nothing to rebuild from
        // Rebuild the row from the caller's meta and apply the patch.
        const rebuilt = { ...seedRow, id, ...metaPatch, updatedAt: Date.now() };
        index.sessions = [rebuilt, ...(index.sessions || [])];
        try { await saveIndex(index); }
        catch(_){ try { await saveIndex(index); } catch(_2){ return null; } }
        setSessionIndex(index.sessions);
        if (id === sessionId) { decisionStateRef.current = mergeDecisionState(decisionStateRef.current, metaPatch); bumpDsVersion(); }
        return rebuilt;
      }
      index.sessions[i] = { ...index.sessions[i], ...metaPatch, updatedAt: Date.now() };
      try { await saveIndex(index); }
      catch(_){ try { await saveIndex(index); } catch(_2){ return null; } } // one retry, same posture as saveSessionV47's index write
      setSessionIndex(index.sessions);
      if (id === sessionId) { decisionStateRef.current = mergeDecisionState(decisionStateRef.current, metaPatch); bumpDsVersion(); }
      return index.sessions[i];
    } catch(_){ return null; }
  };
  // v73: patch a session's decisionState (any session, active or not), re-save, and
  // refresh the index. Used by outcome capture and scope tagging.
  const persistDsPatch = async (id, patch) => {
    const blob = await loadSessionBlob(id);
    if(!blob) return null;
    const nextDs = { ...(blob.decisionState||{}), ...patch };
    const idx = await saveSessionV47({ id, messages:blob.messages, rawHistory:blob.rawHistory, activeDoc:blob.activeDoc, currentMode:blob.currentMode, lastReasoning:blob.lastReasoning, decisionState:nextDs });
    if(idx && idx.sessions) setSessionIndex(idx.sessions);
    if(id===sessionId){ decisionStateRef.current = mergeDecisionState(decisionStateRef.current, patch); bumpDsVersion(); }
    return nextDs;
  };
  const recordOutcome = async (id, result, note, queueMeta = null) => {
    try {
      const blob = await loadSessionBlob(id);
      // v100.1 (A2-recovery): re-entry guard. If an outcome is ALREADY recorded for this
      // id (in the blob or, blob-missing, in the index meta), do not update the profile
      // again — that was the original A2 double-count. Re-recording is treated as a no-op
      // acknowledgement, not a second ledger event.
      // v102 (heal-on-miss): fall back to the queue's own meta row when the row is not in
      // in-memory sessionIndex either, so the guard still sees a prior recording.
      const _metaRow = (sessionIndex || []).find(s => s && s.id === id) || queueMeta || null;
      const _alreadyRecorded =
        (blob && blob.decisionState && blob.decisionState.outcome && blob.decisionState.outcome.status === "recorded") ||
        (!blob && _metaRow && _metaRow.outcome && _metaRow.outcome.status === "recorded");
      // category drives the profile attribution. Prefer the blob; fall back to the meta
      // row's loadBearingAssumption (saveSessionV47 carries it into meta), so the meta-only
      // path still attributes the break category correctly.
      const category =
        (blob && blob.decisionState && blob.decisionState.loadBearingAssumption && blob.decisionState.loadBearingAssumption.category) ||
        (_metaRow && _metaRow.loadBearingAssumption && _metaRow.loadBearingAssumption.category) || null;
      const outcome = { status:"recorded", result, note: note||"", recordedAt: Date.now() };
      // v100.0 (A2): persistDsPatch returns null when the session blob is missing (the
      // v97.9 degraded path: index row present, blob lost). It used to update the profile
      // anyway, so the outcome never persisted, the item stayed in the Review queue, and
      // every re-record double-counted — corrupting the one number the product is built on.
      // v100.1 (A2-recovery): two-tier write. Try the blob path first; if it fails, write
      // the outcome straight to the index meta (which is what the ledger actually reads),
      // stamped recoveredViaMeta so a later blob save does not clobber it (see saveSessionV47).
      let _persisted = await persistDsPatch(id, { outcome });
      let _recovered = false;
      if (!_persisted) {
        // v102 (heal-on-miss): pass the queue's meta row as a seed. If storage and state
        // have drifted so the persisted index has lost this row, patchIndexMeta rebuilds it
        // from queueMeta and writes the outcome, repairing the orphaned item in place.
        const metaRow = await patchIndexMeta(id, { outcome: { ...outcome, recoveredViaMeta: true } }, queueMeta);
        if (!metaRow) { setNotice("Could not save that outcome. This decision could not be found in your library. It may not have finished saving when it was created."); return; }
        _persisted = true; _recovered = true;
      }
      // v100.1 (A2-recovery): the outcome is now in the ledger by one path or the other.
      // Update the profile exactly once, and only if this is the FIRST recording for the id.
      try { const _b = await loadSessionBlob(id); if (_b) emitDecisionEvent({ id, ...((_b.decisionState)||{}), outcome }); } catch(_){}
      if (_alreadyRecorded) {
        const r0 = OUTCOME_RESULTS[result];
        setNotice(`Outcome updated${r0?`: ${r0.label.toLowerCase()}`:""}.` + (_recovered ? " The full transcript could not be restored, but the outcome is saved to your ledger." : ""));
        return;
      }
      const base = await loadProfile();
      const np = recordOutcomeToProfile(base, { result, category });
      await saveProfile(np); profileRef.current = np; setProfileRaw(np);
      const r = OUTCOME_RESULTS[result];
      // Build 7: ledger milestone — first recorded outcome surfaces ledger value message
      const prevRecorded = (base.outcomes ? (base.outcomes.held||0)+(base.outcomes.partial||0)+(base.outcomes.broke||0) : 0);
      const newRecorded = (np.outcomes ? (np.outcomes.held||0)+(np.outcomes.partial||0)+(np.outcomes.broke||0) : 0);
      const isFirst = prevRecorded === 0 && newRecorded === 1;
      const isHeld = result === "held";
      // v122: credential floor crossing. At the 3rd reviewed outcome the calibration
      // credential is issued and the Decision Style is established. The user is maximally
      // invested at exactly this moment, so surface the upgrade here rather than only at
      // a cap hit. Paid tiers skip it.
      const _crossedCredentialFloor = prevRecorded < 3 && newRecorded >= 3;
      const _isPaid = (tier === "starter" || tier === "pro" || tier === "team" || tier === "enterprise");
      if (_crossedCredentialFloor && !_isPaid) {
        setNotice("Your calibration credential is live: three calls graded, track record on the record. Pro keeps it compounding and unlocks the deeper analysis that sharpens it.");
        try { emitDecisionEvent({ id, kind: "credential_issued", gradedN: newRecorded }); } catch (_) {}
      } else if (isFirst && isHeld) {
        setNotice("First assumption tracked as held. Your decision ledger is building. Pro keeps it compounding without limits.");
      } else if (isFirst) {
        setNotice("First outcome recorded. Your ledger is live. Every commit now calibrates your track record.");
      } else {
        setNotice(`Outcome recorded${r?`: ${r.label.toLowerCase()}`:""}. Your profile learned from it.`);
      }
      // v100.1 (A2-recovery): append the degraded-state caveat to whichever notice fired,
      // so a recovered outcome never claims a clean full-history save.
      if (_recovered) setNotice(n => (typeof n === "string" ? n : "") + " (The full transcript for this decision could not be restored.)");
    } catch(_){ setNotice("Could not record that outcome. Try again."); }
  };
  // v90: soft check — a low-friction 3-day "does this still feel right?" signal.
  // "still_right" marks the soft check done (positive lean) and leaves the full
  // outcome review for the horizon date. "unsure" marks it done and brings the full
  // review forward to now so the user can record a real outcome immediately.
  const recordSoftCheck = async (id, answer) => {
    try {
      const patch = { softCheck: { answer, at: Date.now() } };
      if (answer === "unsure") patch.reviewDueAt = Date.now(); // surface for full review now
      await persistDsPatch(id, patch);
      if (answer === "unsure") {
        setNotice("Moved up for a full review. Record whether the call held when you are ready.");
        setView("Review");
      } else {
        setNotice("Noted. We will check back in for the full outcome review at the usual point.");
      }
    } catch(_){ setNotice("Could not save that. Try again."); }
  };
  const setDecisionScope = async (id, scope) => {
    try { await persistDsPatch(id, { scope, scopeConfirmed:true, scopeConfidence:"high", scopeSuggested:null }); }
    catch(_){}
  };
  const enableAdvanced = () => { setMode("advanced"); setView("Advanced"); };
  const goSimple = () => { setMode("simple"); if(view==="Advanced") setView(activeDoc?"Document":"Session"); };

  const runIntel = async (which) => {
    if(advRunning) return;
    const rh = rawHistoryRef.current;
    if(!rh || rh.length < 1){ setNotice("Start a decision first, then run intelligence."); return; }

    // v97: credit gate — check before running, deduct only on success.
    // Map the run type to its credit tool ID.
    const _toolId = which==="all" ? "fullIntelligenceRun"
                  : which==="dep" ? "dependencyMap"
                  : which==="fail"? "failureSimulation"
                  : which==="bench"? "benchmark"
                  : null;
    if (_toolId) {
      if (!await assertCreditGate(_toolId)) return;
    }
    // v99: restore setAdvRunning — dropped in v98.9 during the assertCreditGate
    // refactor. Without it the spinner never activates, the advRunning guard at the top
    // of all three paths stops working for runIntel, and concurrent runs become possible.
    setAdvRunning(which); setNotice("");
    const c = new AbortController(); advAbortRef.current = c;
    // v77: intel is AI-generated, one-shot, and non-deterministic. Stamp it with the
    // turn count and timestamp it was generated against, and persist immediately so the
    // snapshot survives even if the user runs intel and leaves without sending. This is
    // the only thing that makes a later intel-vs-outcome validation pass possible: you
    // cannot grade a forecast you did not keep.
    const atTurn = rh.filter(m => m.role === "user").length;
    const stamp = () => ({ intelGeneratedAt: Date.now(), intelGeneratedAtTurn: atTurn });
    let didGenerate = false;
    let _pendingCreditTool = null; // deducted only after save confirms
    try {
      if(which==="all"){ const r = await generateAllIntelligence(rh, decisionStateRef.current, activeDoc, c.signal); if(r){ setIntel(p=>({ ...(p||{}), ...r })); decisionStateRef.current = mergeDecisionState(decisionStateRef.current, { decisionDependencies:r.dependencies||null, failureScenarios:(r.failure&&r.failure.scenarios)||null, topFailureDrivers:(r.failure&&r.failure.topDrivers)||null, benchmarkSignal:r.benchmark||null, ...stamp() }); didGenerate = true; _pendingCreditTool = "fullIntelligenceRun"; } else setNotice("Need a few turns of context before a full analysis."); }
      else if(which==="dep"){ const r = await generateDependencies(rh, decisionStateRef.current, c.signal); if(r){ setIntel(p=>({ ...(p||{}), dependencies:r })); decisionStateRef.current = mergeDecisionState(decisionStateRef.current, { decisionDependencies:r, ...stamp() }); didGenerate = true; _pendingCreditTool = "dependencyMap"; } }
      else if(which==="fail"){ const r = await generateFailureSimulation(rh, activeDoc, c.signal); if(r){ setIntel(p=>({ ...(p||{}), failure:r })); decisionStateRef.current = mergeDecisionState(decisionStateRef.current, { failureScenarios:r.scenarios||null, topFailureDrivers:r.topDrivers||null, ...stamp() }); didGenerate = true; _pendingCreditTool = "failureSimulation"; } }
      else if(which==="bench"){ const r = await generateBenchmark(rh, decisionStateRef.current, activeDoc, c.signal); if(r){ setIntel(p=>({ ...(p||{}), benchmark:r })); decisionStateRef.current = mergeDecisionState(decisionStateRef.current, { benchmarkSignal:r, ...stamp() }); didGenerate = true; _pendingCreditTool = "benchmark"; } }
      if(didGenerate){
        const idx = await saveSessionV47({ id:sessionId, messages:messagesRef.current, rawHistory:rawHistoryRef.current,
          activeDoc, currentMode, lastReasoning, decisionState:decisionStateRef.current });
        if(idx && !idx.__quotaError && idx.sessions){ setSessionIndex(idx.sessions); setActiveId(sessionId); }
        // Deduct credits only after save confirms — never on generation alone.
        if(_pendingCreditTool) await spendCredits(_pendingCreditTool);
      }
    } catch(_){} finally { if(advAbortRef.current===c){ setAdvRunning(null); advAbortRef.current=null; } refreshCredits(); } // v99.8 (C2): ownership-guarded cleanup — see sendMessage finally
  };
  const runOverlayAction = async (kind) => {
    if(advRunning) return;
    const rh = rawHistoryRef.current;
    if(!rh || rh.length < 1){ setNotice("Start a decision first, then run an overlay."); return; }
    if(kind==="battle" && detectedOptions.length < 2){ setNotice("Decision Battle needs at least two comparable options in the thread."); return; }

    // v97.5: overlays are expensive Sonnet calls and must consume credits like the
    // other advanced tools. They were previously ungated, so the pressure-test page
    // ran them for free. Map each overlay to its credit cost:
    //   battle / challenge -> decisionStressTest (6)
    //   perspective        -> multiPerspectiveReview (8)
    const _toolId = (kind==="battle" || kind==="challenge") ? "decisionStressTest"
                  : kind==="perspective" ? "multiPerspectiveReview"
                  : null;
    if (_toolId) {
      if (!await assertCreditGate(_toolId)) return;
    }

    setAdvRunning(kind); setNotice(""); setOverlay(null);
    const c = new AbortController(); advAbortRef.current = c;
    try {
      const digest = overlayContextDigest(rh, activeDoc);
      const params = kind==="battle" ? { options: detectedOptions } : kind==="perspective" ? { role } : {};
      if(kind==="battle") decisionStateRef.current = mergeDecisionState(decisionStateRef.current, { options: params.options });
      const result = await runOverlay(kind, digest, params, c.signal);
      setOverlay(result);
      // v97.5: deduct credits only on a confirmed successful result, never on failure.
      if(_toolId && result && !result.error) await spendCredits(_toolId);
    } catch(_){} finally { if(advAbortRef.current===c){ setAdvRunning(null); advAbortRef.current=null; } refreshCredits(); } // v99.8 (C2): ownership-guarded cleanup — see sendMessage finally
  };
  const runContradiction = async () => {
    if(advRunning) return;
    if(!attachedRef.current || attachedRef.current.length===0){ setNotice("No related prior sessions attached to check against."); return; }

    // v97: credit gate for contradiction scan.
    // v98.9 (E3): dedup guard — if the system already ran an auto-contradiction check on
    // this commit within the last 60 seconds, surface the cached result for free instead
    // of charging a credit for the same call. The manual path still runs if the user wants
    // a fresh check after the window, but a user who opens Advanced immediately post-commit
    // does not pay for work already done this turn.
    const _lastCheck = decisionStateRef.current && decisionStateRef.current.lastContradictionCheck;
    const _recentCheck = _lastCheck && (Date.now() - (_lastCheck.ts || 0)) < 60_000;
    if (_recentCheck) {
      setContradiction(_lastCheck);
      setNotice("Showing the contradiction check from this commit. Run again for a fresh check.");
      return;
    }

    if (!await assertCreditGate("contradictionScan")) return;

    setAdvRunning("contradiction"); setNotice(""); setContradiction(null);
    try {
      const r = await detectContradictions(attachedRef.current, overlayContextDigest(rawHistoryRef.current, activeDoc));
      setContradiction(r || { conflicts: [], ts: Date.now() });
      if(r){
        decisionStateRef.current = mergeDecisionState(decisionStateRef.current, { lastContradictionCheck: r });
        // v97: deduct credits only after successful result is confirmed and persisted.
        await spendCredits("contradictionScan");
      }
    } catch(_){} finally { setAdvRunning(null); refreshCredits(); }
  };
  // v98.8: shareDocument removed. Confirmed zero call sites — full-document sharing
  // was deprecated when the share modal was rebuilt in Build 6. The framework share
  // (shareFramework) and the card share (shareCard) are the only active paths.
  // storeSharedDoc / buildShareUrl("doc") remain in place for the ?doc= landing reader.
  // Framework share — the privacy-safe loop. Carries only the reusable starting
  // point (template + decision type), never the private decision content. The
  // recipient lands mid-flow on the same structure with a blank, private session.
  // This is the loop most people will actually use, because sharing "the way I
  // worked the problem" carries no exposure while sharing the decision itself does.
  const shareFramework = async () => {
    const ds = decisionStateRef.current || {};
    // v70: the framework link's title is restricted to the decision type or a generic
    // label. It no longer reads activeDoc.subtitle, closing the one path by which any
    // document-derived text could ride a link advertised as structure-only.
    const payload = { t: ds.selectedTemplate || null, d: ds.decisionType || null,
      title: ds.decisionType || "decision framework" };
    const encoded = safeBase64Encode(payload);
    if(!encoded){ setNotice("Could not build a framework link."); return false; }
    recordMetric("share", "fw");
    const url = buildShareUrl("framework", encoded);
    try{ await navigator.clipboard.writeText(url); setNotice("Playbook link copied. It carries the decision logic only, never your content. Whoever opens it starts a blank, private decision from the same starting point."); return true; }
    catch{ setNotice("Clipboard blocked in this view. Copy this link manually: "+url); return false; }
  };
  // v114: share the Decision Style card. Carries only the archetype name, derivation
  // line, and decision count — all aggregate, no decision content. Reuses the ?card=
  // decision_style seam; the landing renders the style and invites a blank private start.
  // v114.2: share the Decision Style as a PNG poster via the native share sheet (so it
  // can post to Instagram/Stories), with the recipient-seed link carried in the share
  // text so the K-factor loop survives. Falls back to a download on desktop.
  // v114.3: image sharing is now handled by the reusable ShareImageButton component at
  // each card surface (pre-generates the PNG so the native share fires in the iOS
  // gesture). The former App-level shareStyle/shareCardImage/shareDecisionCardImage
  // handlers were removed; the link share (shareCard) below remains for "Copy link".
  // v97.1: share a public-safe artifact card. Encodes card type plus safe metadata
  // into a single ?card= param that branches the existing landing view. No private
  // content is ever encoded. The literal assumption text is included only when the
  // caller passes includeAssumptionText=true (the explicit toggle on the map card),
  // and even then only the text, never paired with its category in the payload.
  const shareCard = async (cardType, includeAssumptionText = false) => {
    const ds = decisionStateRef.current || {};
    const lba = ds.loadBearingAssumption || null;
    const payload = {
      v: 1,
      card: cardType || "before_after",
      t: ds.selectedTemplate || null,        // template id (reused by the landing seed)
      d: ds.decisionType || null,            // decision type
      wt: ds.workflowType || null,           // workflow type, drives the stage path
      ac: (lba && lba.category) || null,     // assumption category (structural metadata)
      cf: ds.confidence || null,             // confidence band, if known
      title: ds.decisionType || "decision path",
    };
    // Assumption text is opt-in only, and travels alone (no category alongside it).
    if (includeAssumptionText && lba && lba.text) payload.at = String(lba.text).slice(0, 180);
    const encoded = safeBase64Encode(payload);
    if(!encoded){ setNotice("Could not build a share link."); return; }
    const url = buildShareUrl("card", encoded);
    // Record metrics only after the link is successfully copied, so a failed copy does
    // not log a share. One click on "Share this card" yields exactly one share_card_copied.
    try {
      await navigator.clipboard.writeText(url);
      // v98.8: removed erroneous recordMetric("share","fw") here. Card shares are a
      // distinct loop from the framework K-factor and must not inflate it. The card
      // funnel is measured exclusively via share_card_copied (segmented by card type).
      recordMetric("share_card_copied", cardType);  // card-type-segmented funnel event
      // v99.7 (M5): card shares now record into their OWN K-factor loop. Previously the
      // ?card= reader tagged opens and creates as "fw" while shares went untagged, so
      // card conversions inflated the framework K-factor. share/open/create all tag
      // "card" now; the fw loop is clean again.
      recordMetric("share", "card");
      setNotice("Share link copied. It shows the structure of your decision, never your private content.");
    } catch {
      // Copy failed: surface the link so the user can copy manually. No metric recorded.
      setNotice(url);
    }
  };
  // session, seeded with the same framework so they land mid-flow, not on a cold
  // screen. The share param is stripped from the URL so a refresh does not drop
  // them back into the read-only view.
  const startOwnFromShare = () => {
    // v69: the create event now fires on the first real send of this seeded
    // session, not on this click, so it counts an actual decision started rather
    // than an intent. seedLoopRef carries the loop type until that send.
    const meta = sharedMeta;
    // C2: delegate to clearSessionState (was the last manual 12-field reset block
    // after v98.8 extracted the helper). Seeds template and decisionType from meta.
    clearSessionState();
    // v100.0 (A1): set the loop AFTER the clear, not before — clear would have wiped it.
    seedLoopRef.current = "doc";
    if (meta && meta.templateId) decisionStateRef.current = mergeDecisionState(decisionStateRef.current, { selectedTemplate: meta.templateId });
    if (meta && meta.decisionType) decisionStateRef.current = mergeDecisionState(decisionStateRef.current, { decisionType: meta.decisionType });
    setSessionId(genId()); setActiveId(null);
    setSeedType(meta ? (meta.subtitle || meta.decisionType || "") : null);
    setSharedMeta(null);
    try{ const u=new URL(window.location.href); u.searchParams.delete("doc"); u.searchParams.delete("decision"); window.history.replaceState({}, "", u.toString()); }catch(_){}
    setView("Home");
  };
  const downloadCardPng = () => { if(card) exportCardAsPng(card).catch(()=>setNotice("Could not export the card image.")); };
  const copyCardText = async () => { if(!card) return; try{ await navigator.clipboard.writeText(decisionCardToMarkdown(card)); setNotice("Card copied as text."); }catch{ setNotice("Could not copy to clipboard."); } };
  // v126.4: unified export. The format picker calls this. "print" renders the document
  // into the chat (no file, any tier); file formats download and are gated by tier,
  // with locked formats routing to the upgrade path. Replaces the per-button handlers.
  const runExport = (fmt) => {
    if(!activeDoc){ setExportPicker(false); setNotice("Commit a decision first, then export."); return; }
    if(fmt==="print"){
      pushMsg({ role:"assistant", text: docToChatText(activeDoc), mode:"Document" });
      setExportPicker(false); setView("Session");
      return;
    }
    if(fmt==="md"){
      if(!has(tier,"exportMd")){ setExportPicker(false); setNotice("Create a free account to export your decisions."); setAuthGate(true); return; }
      downloadMarkdown(activeDoc); setExportPicker(false); return;
    }
    if(fmt==="html"){
      if(!has(tier,"exportHtml")){ setExportPicker(false); setNotice("HTML export is available on Starter and Pro. Markdown is available on Free."); goToPricing(); return; }
      downloadHTML(activeDoc); setExportPicker(false); return;
    }
    if(fmt==="txt"){
      if(!has(tier,"exportTxt")){ setExportPicker(false); setNotice("Plain text export is available on Starter and Pro."); goToPricing(); return; }
      _dl(activeDoc.sections ? activeDoc.sections.map(s=>s.heading+"\n"+(s.isList ? (s.items||[]).join("\n") : (s.content || s.editable || ""))).join("\n\n") : "", "text/plain", (activeDoc.title||"doc").replace(/[^a-z0-9]/gi,"_")+".txt"); setExportPicker(false); return;
    }
    if(fmt==="pdf"){
      if(!has(tier,"exportPdf")){ setExportPicker(false); setNotice("PDF export is available on Starter and Pro."); goToPricing(); return; }
      printDocumentHTML(activeDoc); setExportPicker(false); return;
    }
  };

  // a11y v104: single source for the live regions. Errors are assertive; notices,
  // streaming status, and the final assistant message are polite. Tokens are not announced.
  React.useEffect(()=>{ setA11yAssertive(error || ""); }, [error]);
  React.useEffect(()=>{
    if (error) { return; }
    if (notice) { setA11yPolite(notice); return; }
    if (streaming) { setA11yPolite("Generating response."); return; }
    const last = messages[messages.length - 1];
    if (last && last.role === "assistant" && last.text && last.text !== lastAnnouncedRef.current) {
      lastAnnouncedRef.current = last.text;
      const clean = last.text.replace(/Reasoning Strength:.*$/is, "").replace(/^Mode:\s*\w+/im, "").trim();
      setA11yPolite("Response ready. " + clean.slice(0, 300));
    }
  }, [error, notice, streaming, messages]);
  React.useEffect(()=>{ const onR=()=>setNarrow(window.innerWidth<NARROW); window.addEventListener("resize",onR); return ()=>window.removeEventListener("resize",onR); },[]);
  React.useEffect(()=>{ if(!narrow) setDrawer(false); },[narrow]);

  // Navigate to pricing while remembering where the user came from.
  // On return, go back to that view — or to Session if a chat is active.
  const goToPricing = React.useCallback(()=>{
    setPrevView(view);
    setView("pricing");
  },[view]);
  const returnFromPricing = React.useCallback(()=>{
    const dest = prevView && prevView !== "pricing" ? prevView
               : messagesRef.current.length > 0 ? "Session"
               : "Home";
    setPrevView(null);
    setView(dest);
  },[prevView]);
  React.useEffect(()=>{ (async()=>{
    const index = await loadIndex(); setSessionIndex(index.sessions||[]);
    // v100.0 (A3): do not auto-restore the last session when the URL carries a share
    // param. The restore effect and the ?doc/?framework/?card effects run concurrently
    // at mount; completion order is storage-latency dependent, so a returning user
    // opening a share link could have the landing clobbered by the restore or vice
    // versa. The param is read synchronously here (URL is available immediately) and
    // the share effects own that path; restore yields to them.
    let _hasShareParam = false;
    try { const p = new URLSearchParams(window.location.search); _hasShareParam = !!(p.get("doc") || p.get("decision") || p.get("framework") || p.get("card")); } catch(_){}
    if(!_hasShareParam && index.activeId){ const s = await loadSessionBlob(index.activeId); if(s) restoreSession(s); }
  })(); },[]);
  React.useEffect(()=>{ (async()=>{ try{ const p = await loadProfile(); profileRef.current = p; setProfileRaw(p); }catch(_){} })(); },[]);
  React.useEffect(()=>{ (async()=>{ const p = await modelPreflight();
    if(p && p.ok){
      const notes = [];
      if(p.switched) notes.push(`primary model auto-switched to ${p.to}`);
      if(p.fastSwitched) notes.push(`fast model fell back to ${p.fastTo}`);
      if(notes.length) setNotice(notes.join("; ") + "; the configured model string did not resolve in this runtime.");
    }
    else if(p && !p.ok && p.modelIssue){ setError(`Model "${MODELS.PRIMARY}" did not resolve and the fallback failed. Update the MODELS config at the top of the file.`); }
  })(); },[]);
  // Build 4: load user's review horizon preference on mount.
  React.useEffect(()=>{ (async()=>{ const h = await loadReviewHorizonDays(); setReviewHorizonDays(h); })(); },[]);
  React.useEffect(()=>{ (async()=>{ try{
    const params = new URLSearchParams(window.location.search);
    const id = params.get("decision") || params.get("doc");
    if(id){ const shared = await loadSharedDoc(id); if(shared){
      setActiveDoc(shared);
      setSharedMeta({ templateId: shared.templateId || null, decisionType: shared.decisionType || null, subtitle: shared.subtitle || shared.type || null });
      setView("Document");
      setNotice("Viewing a shared decision (read-only). You can use this playbook to start your own.");
      recordMetric("open", "doc");
    } }
  }catch(_){} })(); },[]);
  // Framework link: decode the structure-only payload, seed a fresh private session
  // on the same starting point, strip the param, and land on FrameworkLandingView.
  // v89: replaced silent notice-banner landing with an explicit invitation screen.
  React.useEffect(()=>{ (async()=>{ try{
    const params = new URLSearchParams(window.location.search);
    const fw = params.get("framework");
    if(fw){
      let payload=null;
      payload = safeBase64Decode(fw);
      if(payload){
        const seed = emptyDecisionState();
        if(payload.t) seed.selectedTemplate = payload.t;
        if(payload.d) seed.decisionType = payload.d;
        decisionStateRef.current = seed;
        setSeedType(payload.title || payload.d || "");
        seedLoopRef.current = "fw";
        recordMetric("open", "fw");
        // v89: show landing view instead of dropping directly into Home
        setFrameworkLanding({ title: payload.title || null, decisionType: payload.d || null, fw });
        setView("FrameworkLanding");
      }
      try{ const u=new URL(window.location.href); u.searchParams.delete("framework"); window.history.replaceState({}, "", u.toString()); }catch(_){}
    }
  }catch(_){} })(); },[]);
  // v97.1: card share link. Decode the public-safe card payload, seed a fresh private
  // session on the same starting point, strip the param, land on CardLandingView.
  // One param branches by card type — preserves backward compatibility with
  // ?framework= links, which still work via the effect above.
  React.useEffect(()=>{ (async()=>{ try{
    const params = new URLSearchParams(window.location.search);
    const cd = params.get("card");
    if(cd){
      let payload=null;
      payload = safeBase64Decode(cd);
      if(payload){
        const seed = emptyDecisionState();
        if(payload.t) seed.selectedTemplate = payload.t;
        if(payload.d) seed.decisionType = payload.d;
        if(payload.wt) seed.workflowType = payload.wt;
        decisionStateRef.current = seed;
        setSeedType(payload.title || payload.d || "");
        // v99.7 (M5): card links seed the "card" loop, not "fw" — see METRIC_LOOPS note.
        seedLoopRef.current = "card";
        recordMetric("open", "card");
        recordMetric("share_card_opened", payload.card || "before_after");
        setCardLanding(payload);
        setView("CardLanding");
      }
      try{ const u=new URL(window.location.href); u.searchParams.delete("card"); window.history.replaceState({}, "", u.toString()); }catch(_){}
    }
  }catch(_){} })(); },[]);

  // v72: tier + gaming/viral state (additive; engine state above is unchanged)
  // v126.5: tier and the four metering counters now live in useEntitlements(). The
  // returned names are unchanged, so the rest of the component reads them as before.
  const { tier, setTier, monthUsed, setMonthUsed, resetDays, creditsUsed, refreshCredits, dailyUsed, refreshDailyUsed } = useEntitlements();

  // v102: second-step expansion. The first Commit/Document output is complete but
  // size-controlled by plan. Expanding to an extended version is an EXPLICIT action,
  // never automatic. Pro regenerates at the extended budget; lower tiers route to the
  // appropriate next step (Guest to signup, Free/Starter to upgrade). Extended is an
  // explicit opt-in rather than a credit charge; the spec allows either.
  // NOTE: must be declared AFTER `tier` above — canExtendOutput reads tier at render
  // time, so placing it earlier triggered "Cannot access 'tier' before initialization".
  const canExtendOutput = (tier === "pro" || tier === "enterprise");
  const expandDocument = () => {
    if (canExtendOutput) {
      sendMessage("Expand the committed output into a full, extended version. Keep the same structure and conclusions, but deepen each section with more detail, evidence, and specifics.", [], { direct:true, extended:true });
    } else {
      setNotice("Extended versions are a Pro feature. Your current output covers the essentials.");
      goToPricing();
    }
  };
  // v120: Open Sans for the in-app UI (linked stylesheet) and for share exports
  // (embedded into the SVG via ensureOpenSansEmbedded, since rasterized SVG cannot
  // see linked fonts). Both are best-effort and degrade to the system sans.
  React.useEffect(() => {
    try {
      if (typeof document !== "undefined" && !document.getElementById("wo-opensans")) {
        const l = document.createElement("link");
        l.id = "wo-opensans"; l.rel = "stylesheet";
        l.href = "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap";
        document.head.appendChild(l);
      }
    } catch (_) {}
    ensureOpenSansEmbedded();
  }, []);
  // v98.9: single credit-gate assertion used by runIntel, runOverlayAction, and
  // runContradiction. Returns true when the tool may proceed, false when blocked.
  // Fires the correct notice and is the only place the two notice strings are defined.
  // v99 fix: moved here (after tier declaration) to avoid TDZ — useCallback([tier])
  // was previously defined 296 lines before tier's useState, crashing on load.
  const assertCreditGate = React.useCallback(async (toolId) => {
    if (!toolId) return true; // no credit cost — always allowed
    const check = await canRunAdvancedTool(toolId, tier);
    if (!check.allowed) {
      setNotice(check.reason === "tier"
        ? "Advanced intelligence tools are available on Pro. Upgrade to access them."
        : "You do not have enough advanced intelligence credits for this tool. Credits reset with your monthly cycle.");
    }
    return check.allowed;
  }, [tier]);
  // v74: beta funnel signal. When a tier without insights opens an insight surface
  // (profile, advanced toolkit), record one locked-view impression. This and
  // cap_block are the two conversion events the 5/5 cap is meant to generate.
  // Placed after `tier` is declared so the dependency array is not in the TDZ.
  React.useEffect(()=>{
    if((view==="profile" || view==="Advanced") && !has(tier,"insights")){
      recordMetric("insight_locked_view", tier);
    }
  },[view, tier]);
  // v126.5: the five mutually-exclusive overlays are consolidated into one
  // activeModal cell (useModalStack). Only one can be open at a time, which removes
  // the prior "two overlays stacked" failure class. The bindings below are a thin
  // adoption layer so existing call sites keep working unchanged; the per-call-site
  // rename to modal.open/close is deferred to the module split.
  const modal = useModalStack();
  const shareOpen = modal.is("share");
  const setShareOpen = (v) => v ? modal.open("share") : modal.closeIf("share");
  const exportPicker = modal.is("exportPicker"); // v126.4: export format picker open
  const setExportPicker = (v) => v ? modal.open("exportPicker") : modal.closeIf("exportPicker");
  const toolsSheet = modal.is("tools");
  const setToolsSheet = (v) => v ? modal.open("tools") : modal.closeIf("tools");
  const authGate = modal.is("authGate");
  const setAuthGate = (v) => v ? modal.open("authGate") : modal.closeIf("authGate");
  // v89: first-commit share surface — fires once per session on the first Commit
  const firstCommitShareOpen = modal.is("firstCommit");
  const setFirstCommitShareOpen = (v) => v ? modal.open("firstCommit") : modal.closeIf("firstCommit");
  // C3: dedicated state slot for the OverageOptInBanner. This is a NOTICE-BAR banner,
  // not a modal overlay — it can coexist with the string notice path and with an open
  // modal, so it stays a standalone cell and out of the modal stack.
  const [overageBanner, setOverageBanner] = React.useState(null); // { tier, cap, onOptIn } | null
  // v103.5: true when a commit turn produced prose but no parseable document, so the
  // chat can offer an explicit "turn this into a document" retry. Cleared at send start.
  const [needsDocRetry, setNeedsDocRetry] = React.useState(false);
  const firstCommitFiredRef = React.useRef(false);
  // v89: framework landing — shown when arriving via ?framework= link
  const [frameworkLanding, setFrameworkLanding] = React.useState(null); // { title, decisionType, fw }
  // v97.1: card landing — shown when arriving via ?card= share link
  const [cardLanding, setCardLanding] = React.useState(null); // decoded card payload
  // v97.16: loopMetrics was declared but never populated, so share-derived figures were
  // always missing. Load it when a view that displays share/profile analytics opens.
  React.useEffect(()=>{ if(view!=="Advanced" && view!=="Site" && view!=="profile") return;
    (async()=>{ try{ const m = await readLoopMetrics(); if(m) setLoopMetrics(m); }catch(_){} })();
  },[view]);
  // v110.5: site analytics load. Separate from the loopMetrics effect so it cannot
  // alter that path. Fires only when an operator opens Site; non-operators (and any
  // non-enterprise tier) never trigger the call. On the artifact host the local
  // source returns null and SiteView shows the connect-the-source state.
  React.useEffect(()=>{
    if (view !== "Site") return;
    if (!(tier === "enterprise" && canViewSite(accessRole))) return;
    (async () => {
      try { const a = await readSiteAnalytics(); if (a) setSiteAnalytics(a); } catch (_) {}
    })();
  }, [view, tier, accessRole]);
  const pad = narrow ? 18 : 28;
  // B4: memoized on [activeDoc, messages, lastReasoning]. buildScorecard calls
  // assessReadiness internally (regex scan over full history). Recomputing every
  // render was unnecessary. messages is the dep proxy for rawHistoryRef changes,
  // consistent with the detectedOptions and _rd memos above.
  const scorecard = React.useMemo(() =>
    activeDoc ? buildScorecard({ ...decisionStateRef.current, confidence: decisionStateRef.current.confidence || lastReasoning }, assessReadiness(rawHistoryRef.current), activeDoc) : null,
  [activeDoc, messages, lastReasoning, dsVersion]); // eslint-disable-line react-hooks/exhaustive-deps
  const card = React.useMemo(() =>
    activeDoc ? buildDecisionCard(activeDoc, scorecard, { ...decisionStateRef.current, confidence:lastReasoning }) : null,
  [activeDoc, scorecard, lastReasoning, dsVersion]); // eslint-disable-line react-hooks/exhaustive-deps
  // v99 (E): memoized on [messages, currentMode, lastReasoning]. signalInfo previously
  // ran filter+map+join+estimateTokens over full history on every render. messages stays
  // in sync with rawHistoryRef so turn count and context stay current.
  const signalInfo = React.useMemo(() => ({
    mode: currentMode,
    reasoning: lastReasoning,
    turns: rawHistoryRef.current.filter(m=>m.role==="user").length,
    // v99.6 (L2): `context` (estimateTokens over full joined history) removed — the
    // Context field left the UI in v99.1; the computation was dead weight per memo.
  }), [messages, currentMode, lastReasoning]); // eslint-disable-line react-hooks/exhaustive-deps
  // v98.8: memoized on messages. detectOptions scans the full history with four regex
  // passes; recomputing on every render was unnecessary. messages updates in sync with
  // rawHistoryRef so this captures all new turns without needing ref access.
  const detectedOptions = React.useMemo(()=> detectOptions(rawHistoryRef.current), [messages]); // eslint-disable-line react-hooks/exhaustive-deps
  const profileDisplay = formatProfileDisplay(profileRaw, has(tier, "insights"));
  const decisionStyle = deriveDecisionStyle(profileRaw); // v114: named archetype for the Profile + shareable card
  const userMetrics = React.useMemo(()=> buildUserMetrics(sessionIndex, profileRaw, reviewHorizonDays), [sessionIndex, profileRaw, reviewHorizonDays]);
  const reviewQueue = React.useMemo(()=> buildReviewQueue(sessionIndex, reviewHorizonDays), [sessionIndex, reviewHorizonDays]);
  const _teamMemberships = NO_TEAM_MEMBERSHIPS; // v113.2: stable ref (was a fresh [] each render). Launch feeds active org_members rows from the server session.
  const { workspaces: _workspaces, activeWorkspace, activeWorkspaceRef, switchWorkspace: _switchWorkspace } = useWorkspace(_teamMemberships);
  const groupMetrics = useWorkspaceLedger(activeWorkspace, sessionIndex, reviewHorizonDays);
  const dueCount = reviewQueue.dueCount;
  const softCheckQueue = reviewQueue.softCheck || [];
  const ledgerMetrics = userMetrics.ledger; // Build 6: passed to ShareModal for calibration card
  const decisionCredential = deriveCredential(profileRaw, ledgerMetrics); // v122: carryable calibration credential
  const pendingSessions = React.useMemo(()=> (sessionIndex||[]).filter(s=>s && s.pending), [sessionIndex]);
  const outcomeStats = React.useMemo(()=> deriveProfileReads(profileRaw) || {}, [profileRaw]);

  const stop = () => { try{ abortRef.current?.abort(); }catch(_){} };

  const sendMessage = async (rawText, attachments=[], opts={}) => {
    const text = (rawText!=null ? rawText : input).trim();
    if(!text || loading || sendInFlightRef.current) return false; // v99.9 (C3): ref closes the stale-state window
    // v99.7 (C1): capture the session epoch at send start. Any await that resolves
    // after restoreSession/clearSessionState bumped it must not touch the live refs.
    const epoch = sessionEpochRef.current;
    // v97.7: guardedSend may mint a fresh id for a new decision and pass it here so all
    // saves in this turn key to the new row rather than the stale closure sessionId.
    const sid = (opts && opts.forceSessionId) || sessionId;
    // v79: turn cap — Clarify turns excluded. Only Explore/Commit turns count.
    // Penalising early-stage clarification discourages engagement before the user
    // has produced anything. The cap fires once the session reaches structured work.
    // The final allowed productive turn is forced to CommitOverride below so the
    // decision always yields an artifact rather than dead-ending.
    {
      const _pol = policyFor(tier);
      if(Number.isFinite(_pol.maxTurns)){
        // C1: use shared helper — was previously duplicated below for CommitOverride inference.
        const _productiveTurns = countProductiveTurns(rawHistoryRef.current || []);
        if(_productiveTurns >= _pol.maxTurns){
          setNotice(`This decision has reached the ${_pol.maxTurns}-turn limit on your plan. Start a new decision, or upgrade to keep your ledger compounding without interruption.`);
          return false; // v99.7 (M8): pre-flight rejection — composer keeps its attachments
        }
      }
    }
    // v99.9 (C3): all pre-flight gates above are synchronous; claiming the slot here
    // is race-free. Every path past this line exits through finally, which releases it.
    sendInFlightRef.current = true;
    setError(""); setNotice(""); setSeedType(null); setContradiction(null); setNeedsDocRetry(false);
    const isFirstTurn = (rawHistoryRef.current || []).length === 0;
    const newRaw = [...rawHistoryRef.current, { role:"user", content:text }];
    rawHistoryRef.current = newRaw;
    pushMsg({ role:"user", text });
    setInput(""); setView("Session");
    // v99.9 (M8b): the composer's attachment release moved from acceptance to DELIVERY
    // (after the stream completes) — see the onDelivered call below. Releasing here
    // meant an in-flight failure (network drop, API 5xx, stream error) destroyed the
    // files after acceptance, and the natural retry resent without them, silently.
    // The input text clears here regardless: it is preserved in history either way.
    // v97.2/v97.8: persist the session to the index the moment its FIRST user turn is
    // sent, before the model responds, so an in-progress decision shows in the library
    // immediately. Gated to the first turn only — later turns are covered by the
    // post-stream save below, and saving on every turn doubled write pressure on the
    // rate-limited artifact store, which could cause writes to silently reject.
    if (isFirstTurn) {
      try {
        const earlyIdx = await saveSessionV47({ id:sid, messages:messagesRef.current, rawHistory:rawHistoryRef.current,
          activeDoc, currentMode, lastReasoning, decisionState:decisionStateRef.current });
        if(earlyIdx && !earlyIdx.__quotaError && earlyIdx.sessions){ setSessionIndex(earlyIdx.sessions); setActiveId(sid); }
      } catch(_){}
    }
    // v69: a session seeded from a shared decision ("doc") or a shared framework
    // ("fw") records its create here, on the first real send, so both loops count
    // conversions at the same lifecycle point and their K-factors are comparable.
    if(seedLoopRef.current){ recordMetric("create", seedLoopRef.current); seedLoopRef.current = null; }
    if(!decisionStateRef.current.decisionType){
      // Cancel any pending classify call from a prior turn before launching a new one.
      if(classifyAbortRef.current){ try{ classifyAbortRef.current.abort(); }catch(_){} }
      const _cc = new AbortController(); classifyAbortRef.current = _cc;
      // v99.7 (C1): epoch-guarded — a classify result landing after a session switch
      // must not merge into the new session's decisionState.
      classifyInput(text, _cc.signal).then(c=>{ if(c && sessionEpochRef.current === epoch){ decisionStateRef.current = mergeDecisionState(decisionStateRef.current, { decisionType:c.decisionType, contentType:c.contentType, recommendedTemplates:c.recommendedTemplates, recommendedMode:c.recommendedMode }); bumpDsVersion(); } }).catch(()=>{});
    }
    setLoading(true); setStreaming(true); setStreamingText(""); streamingRef.current="";
    const controller = new AbortController(); abortRef.current = controller;
    // v99.6 (H1 fix): the finally block used a blanket setNotice("") to clear the
    // 429 retry notice, which also wiped every notice set in the success path
    // ("Storage is full", "Could not save", the 3rd-commit milestone) before the
    // user could see it. Track the retry notice explicitly and clear only that.
    let _retryNoticeShown = false;
    // v99.7 (P2): max_tokens truncation flag — see the message_delta handler below.
    let _truncated = false;
    try {
      const userTurns = newRaw.filter(m=>m.role==="user").length;
      let inferredMode = inferModeFromMessage(text, currentMode, userTurns, decisionStateRef.current?.workflowType);
      // Direct path from Home: the user asked to skip straight to a draft. Treat as a
      // commit override — the engine will ask only for any missing criterion, once,
      // then produce the artifact rather than opening in clarifying Chat.
      if(opts && opts.direct && userTurns <= 1) inferredMode = "CommitOverride";
      // v102: an explicit "expand to extended" action (Pro) must produce a full artifact,
      // not an exploration turn, so its larger token budget is actually used.
      if(opts && opts.extended) inferredMode = "CommitOverride";
      // v103.5: an explicit "turn this into a document" retry forces the commit/artifact
      // prompt so the structured document block is produced, even mid-conversation.
      if(opts && opts.forceDoc) inferredMode = "CommitOverride";
      // v79: force CommitOverride on the final allowed productive turn (Explore/Commit only).
      // Clarify turns are excluded from the cap, so this check mirrors the gate above.
      const _maxTurns = policyFor(tier).maxTurns;
      if(Number.isFinite(_maxTurns)){
        // C1: use shared helper — was previously a duplicate reduce block.
        if(countProductiveTurns(newRaw) >= _maxTurns) inferredMode = "CommitOverride";
      }
      const attachedNow = findRelatedSessions(text, decisionStateRef.current, sessionIndex, sessionId);
      attachedRef.current = attachedNow; setAttached(attachedNow);
      const contextBlock = buildContextBlock(attachedNow, "reference_only");
      const domains = selectDomains({ decisionState: decisionStateRef.current, recentText: text });
      const { blocks } = buildSystemPrompt(inferredMode, decisionStateRef.current, domains, profileRef.current);
      // v101.2 (token-efficiency 1): the static prompt blocks (CHAT/EXTENDED/artifact)
      // are the stable cache prefix. The related-session context block is volatile —
      // findRelatedSessions can change the attachment set turn to turn. Prepending it
      // (the prior order) put a volatile block at the FRONT of the prefix, so any
      // attachment change shifted the whole prefix and busted the cache hit on ~1700
      // tokens of static prompt behind it, and it spent a cache breakpoint on a block
      // that rarely repeats. Now: static cached blocks first (stable prefix), context
      // block appended LAST and uncached. The static prefix stays cached across turns
      // regardless of attachment churn, and a breakpoint is freed.
      const systemBlocks = [
        ...blocks.map(b => b.cache ? { type:"text", text:b.text, cache_control:{ type:"ephemeral" } } : { type:"text", text:b.text }),
        ...(contextBlock ? [{ type:"text", text:contextBlock }] : []),
      ];
      const payload = await buildMessagesPayload(newRaw, inferredMode);
      if(attachments && attachments.length){
        const li = payload.length-1;
        if(li>=0 && payload[li].role==="user" && typeof payload[li].content==="string"){
          payload[li] = { role:"user", content:[ { type:"text", text: payload[li].content }, ...attachments ] };
        }
      }
      const maxTok = maxTokensForMode(inferredMode, decisionStateRef.current?.workflowType, decisionStateRef.current?.selectedTemplate, tier, opts);
      const res = await fetchMessagesWithRetry(
        { model: modelForTurn(tier, inferredMode, decisionStateRef.current?.workflowType), max_tokens:maxTok, system:systemBlocks, messages:payload, stream:true },
        controller.signal,
        (secs)=> { _retryNoticeShown = true; setNotice(`Sending too fast. Retrying in ${secs}s…`); }
      );
      if(_retryNoticeShown){ _retryNoticeShown = false; setNotice(""); }
      if(!res.ok){ const e=await res.json().catch(()=>({})); throw new Error((e&&e.error&&e.error.message) || `API error ${res.status}.`); }
      let raw="";
      if(res.body && typeof res.body.getReader==="function"){
        const reader=res.body.getReader(); const dec=new TextDecoder(); let buf=""; const FLUSH=70; let last=0;
        for(;;){
          const { done, value } = await reader.read(); if(done) break;
          buf+=dec.decode(value,{stream:true}); let nl;
          while((nl=buf.indexOf("\n"))>=0){
            const line=buf.slice(0,nl).trim(); buf=buf.slice(nl+1);
            if(!line || !line.startsWith("data:")) continue;
            const body=line.slice(5).trim(); if(!body || body==="[DONE]") continue;
            let evt; try{ evt=JSON.parse(body); }catch{ continue; }
            if(evt.type==="content_block_delta" && evt.delta && evt.delta.type==="text_delta"){
              raw+=evt.delta.text; streamingRef.current=raw;
              const now=Date.now(); if(now-last>=FLUSH){ last=now; setStreamingText(raw); }
            } else if(evt.type==="message_delta" && evt.delta && evt.delta.stop_reason==="max_tokens"){
              // v99.7 (P2): truncation was previously invisible — a Commit cut off at
              // max_tokens lost its document JSON and produced no doc with no signal.
              _truncated = true;
            } else if(evt.type==="error"){ throw new Error((evt.error&&evt.error.message)||"Stream interrupted. Try again."); }
          }
        }
      } else {
        const d=await res.json(); raw=(d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
        if(d && d.stop_reason==="max_tokens") _truncated = true; // v99.7 (P2)
      }
      // v99.9 (M8b): the request was fully delivered (res.ok and the stream drained
      // without throwing) — the attachments reached the model. Release the composer's
      // copies now. Any throw above (abort, network, stream error) skips this, so the
      // composer keeps the files and a retry resends them. Runs before the epoch check:
      // delivery is true even if the session switched mid-stream.
      try { if (opts && typeof opts.onDelivered === "function") opts.onDelivered(); } catch(_){}
      // v99.7 (C1): the session may have switched while the stream was in flight.
      // The abort in restoreSession/clearSessionState throws AbortError in most paths,
      // but guard regardless: bail before mutating refs that belong to another session.
      if (sessionEpochRef.current !== epoch) return true;
      let { text:parsed, mode, reasoningStrength, docData } = parseResponse(raw);
      const finalMode = mode || inferredMode;
      const _wasForceDoc = !!(opts && opts.forceDoc);
      // v103.4: a commit turn that produced no document is not a committed decision.
      // stage is derived from currentMode === "Commit", but activeDoc is only set when
      // docData parses. Flipping to Commit without a doc showed the "Decision committed"
      // panel over an empty workspace and offered a Decision card that dead-ended on
      // "No decision card yet". When a Commit resolves with no docData and no existing
      // doc, hold the stage at Explore so the commit stays retryable, and tell the user.
      let committedWithoutDoc = (finalMode === "Commit" && !docData && !activeDoc);
      // v103.7: a short question reply is the model asking for content it needs (e.g.
      // "which city?"), which a format cannot answer — the user should reply in the
      // composer, not pick a format.
      const _p = (parsed||"").trim();
      const _needsContentAnswer = _p.length < 700 && /\?/.test(_p);
      // v126.3 / v126.6: close the format-picker loop AND make the natural commit
      // self-healing. proseToDocData salvages a no-document commit into a structured
      // document client-side. v126.6 runs this on BOTH the natural commit and the
      // forceDoc retry (previously forceDoc-only), so a Commit that returns long-form
      // prose with no JSON block still completes with a real artifact and the type
      // picker is not shown. The Commit prompt now mandates the block (v126.6, DOCUMENT
      // GENERATION SIGNAL); this is the deterministic backstop for the rare turn that
      // omits it. A short-question reply (_needsContentAnswer) is the model asking for
      // content a format cannot answer, so it skips the salvage and the user replies in
      // the composer.
      let _salvaged = false;
      if (committedWithoutDoc && !_needsContentAnswer) {
        const sv = proseToDocData(parsed, opts && opts.forceDocFormat);
        if (sv && sv.sections && sv.sections.length) { docData = sv; committedWithoutDoc = false; _salvaged = true; }
      }
      const effectiveMode = committedWithoutDoc ? "Explore" : finalMode;
      setCurrentMode(effectiveMode);
      // Show the picker only on a natural no-document commit. Never on a forceDoc turn
      // (that retry is what the picker triggers; reshowing it is the loop), and never on
      // a short-question reply. forceDoc failures are handled by the salvage above.
      setNeedsDocRetry(committedWithoutDoc && !_needsContentAnswer && !_wasForceDoc);
      const _msgText = _salvaged ? "Committed. Your document is ready in the Document tab." : parsed;
      pushMsg({ role:"assistant", text:_msgText, mode:finalMode, reasoning:reasoningStrength });
      // v103.3: tear the streaming bubble down the instant the final parsed message is
      // in the list, BEFORE the awaited save/profile writes below. Previously this lived
      // only in finally(), which runs after those awaits — so for the duration of the
      // rate-limited store write the final message and the still-live streaming bubble
      // both rendered (the visible "double generate"). finally() still clears as a
      // safety net for the error/epoch-mismatch paths where this line is not reached.
      setStreaming(false); setStreamingText(""); streamingRef.current="";
      rawHistoryRef.current = [...newRaw, { role:"assistant", content:raw }];
      setLastReasoning(reasoningStrength||null);
      // v103.4: a commit that yielded no document takes precedence over the generic
      // truncation note, and is phrased as a retryable action.
      if(committedWithoutDoc){
        setNotice(_truncated
          ? "The decision was cut off before the document finished. Ask it to continue or narrow the request, then commit again."
          : "That commit did not produce a document. Add any missing detail and commit again.");
      } else if(_truncated){
        setNotice("The response reached its length limit and may be incomplete. Ask it to continue, or narrow the request.");
      }
      const readiness = assessReadiness(rawHistoryRef.current);
      const committedOpts = detectOptions(rawHistoryRef.current);
      decisionStateRef.current = mergeDecisionState(decisionStateRef.current, {
        currentMode: effectiveMode,
        confidence: reasoningStrength || decisionStateRef.current.confidence,
        readinessScore: readiness ? readiness.readinessScore : decisionStateRef.current.readinessScore,
        readinessCategories: readiness ? readiness.categories : decisionStateRef.current.readinessCategories,
        evidenceStrength: readiness ? readiness.evidenceLevel : decisionStateRef.current.evidenceStrength,
        options: committedOpts.length>=2 ? committedOpts : decisionStateRef.current.options,
      });
      const newDoc = docData ? parseDocumentClientSide(docData) : activeDoc;
      if(docData){ setActiveDoc(newDoc); setView("Document"); }
      // v89: first-commit share surface — fires once per session
      if(docData && !firstCommitFiredRef.current){
        firstCommitFiredRef.current = true;
        // S6: 600ms delay lets Document view finish its initial render pass before the
        // modal opens, so the modal does not flash on top of a blank view. One frame
        // (~16ms) would also work here, but 600ms provides a deliberate moment for the
        // user to see the committed document before the share prompt appears.
        setTimeout(() => setFirstCommitShareOpen(true), 600);
      }
      // v73: at commit, classify scope (fail-safe to personal) and open the outcome
      // review loop. Done before save so the index meta carries both.
      if(docData){
        const now = Date.now();
        const oc = initOutcomeState(decisionStateRef.current, newDoc, now, reviewHorizonDays);
        const patch = { committedAt: oc.committedAt, loadBearingAssumption: oc.loadBearingAssumption, prediction: oc.prediction, reviewDueAt: oc.reviewDueAt, outcome: oc.outcome };
        Object.assign(patch, workspaceStampForCommit(activeWorkspaceRef.current));
        patch.commitSignals = extractProfileSignals(decisionStateRef.current, newDoc, readiness);
        if(!decisionStateRef.current.scopeConfirmed){
          const sc = classifyScope({ title: (newDoc && newDoc.title) || sessionTitleFrom(messagesRef.current), text: rawHistoryRef.current.map(m=>m.content).join("  ") });
          patch.scope = sc.scope; patch.scopeConfidence = sc.confidence; patch.scopeSuggested = sc.suggested;
        }
        decisionStateRef.current = mergeDecisionState(decisionStateRef.current, patch);
      }
      // persist the completed turn
      const idx = await saveSessionV47({ id:sid, messages:messagesRef.current, rawHistory:rawHistoryRef.current,
        activeDoc:newDoc, currentMode:finalMode, lastReasoning:reasoningStrength, decisionState:decisionStateRef.current });
      if(idx && idx.__quotaError) setNotice("Storage is full. Recent work may not be saved.");
      // v100.0 (A4): the session index is global state and is always safe to refresh,
      // but snapping the active-row highlight back to THIS turn's sid is wrong if the
      // user has since switched sessions — gate it on the epoch.
      else if(idx){ setSessionIndex(idx.sessions||[]); if(sessionEpochRef.current===epoch) setActiveId(sid); }
      else setNotice("Could not save this decision to your library. Your changes may not persist.");
      if(docData){ emitDecisionEvent({ id: sid, ...decisionStateRef.current }); }
      if(docData){ try{
        const base = await loadProfile();
        const next = updateProfile(base, decisionStateRef.current.commitSignals || extractProfileSignals(decisionStateRef.current, newDoc, readiness));
        await saveProfile(next); profileRef.current = next; setProfileRaw(next);
        // v100.0 (A4): the C1 epoch check above the parse is a single gate, but more
        // awaits (save, profile) follow it. A session switch during those awaits must
        // not merge this turn's profile into the new session's live decisionState.
        // profileRef/profileRaw are global (correct to update regardless); only the
        // per-session ref merge is epoch-gated.
        if (sessionEpochRef.current === epoch) decisionStateRef.current = mergeDecisionState(decisionStateRef.current, { decisionProfile: next });
        // Build 7: 3rd commit milestone — ledger is starting to have signal
        const prevCount = base.decisionCount || 0;
        const newCount = next.decisionCount || 0;
        if (prevCount < 3 && newCount >= 3) {
          setNotice("3 decisions committed. Your ledger is live. Review your first outcome when the 7-day window closes. That's where the calibration starts.");
        }
      }catch(_){} }
      // v73: model-side upgrade of scope + load-bearing assumption. Fire-and-forget,
      // one bounded Haiku call. The synchronous keyword/first-item heuristic above is the
      // floor and already holds; this refines it when it returns. Privacy keystone is
      // deterministic here: a "work" label is applied only at high confidence, else the
      // decision stays personal with a "mark as work" suggestion. Any failure leaves the
      // heuristic in place. Never blocks the turn.
      if(docData){
        // v98.8: capture sid (the authoritative id for this turn, which may differ from
        // the sessionId state variable when forceSessionId was set by guardedSend on a
        // collision). Using sessionId here could write classifier results to a different
        // session row if the user triggered a new decision mid-flight.
        const cid = sid;
        classifyCommitSignalsModel(newDoc, rawHistoryRef.current.map(m=>m.content).join("  "))
          .then(async (sig)=>{
            if(!sig) return;
            const cur = await loadSessionBlob(cid); if(!cur) return;
            const curDs = cur.decisionState || {};
            const p = {};
            if(sig.assumption && sig.assumption.text) p.loadBearingAssumption = sig.assumption;
            // v122: fold the model-suggested observable into the prediction without
            // disturbing the resolveBy date already set at commit. Only fills an empty
            // trigger; never overwrites one the user has edited.
            if(sig.trigger){
              const curPred = curDs.prediction || null;
              if(!curPred || !curPred.trigger){
                p.prediction = { trigger: sig.trigger, resolveBy: (curPred && curPred.resolveBy) || curDs.reviewDueAt || null };
              }
            }
            if(!curDs.scopeConfirmed && sig.scope){
              if(sig.scope==="work" && sig.confidence==="high"){ p.scope="work"; p.scopeConfidence="high"; p.scopeSuggested=null; }
              else if(sig.scope==="work"){ p.scope="personal"; p.scopeConfidence="low"; p.scopeSuggested="work"; }
              else { p.scope="personal"; p.scopeConfidence=sig.confidence; p.scopeSuggested=null; }
            }
            if(Object.keys(p).length) await persistDsPatch(cid, p);
          })
          .catch(()=>{});
      }
      // v62: standing decision history. When a Commit lands and related prior sessions
      // were attached, automatically check for genuine conflicts with past decisions and
      // surface them on the document. Previously this ran only behind a manual button in
      // Advanced. Fire-and-forget so it never blocks the turn; bounded to one Haiku call,
      // only on commits, only when related work exists. Self-times out at 8s internally.
      if(docData && attachedNow && attachedNow.length){
        detectContradictions(attachedNow, overlayContextDigest(rawHistoryRef.current, newDoc))
          .then(r=>{ if(r && r.conflicts && r.conflicts.length){ setContradiction(r); decisionStateRef.current = mergeDecisionState(decisionStateRef.current, { lastContradictionCheck: r }); } })
          .catch(()=>{});
      }
    } catch(err){
      if(err && err.name!=="AbortError") setError((err && err.message) || "Something went wrong. Try again.");
    } finally {
      setLoading(false); setStreaming(false); setStreamingText(""); streamingRef.current="";
      // Clear only a still-visible retry notice (request threw mid-retry).
      // Success-path notices (save failures, milestones) must survive this block.
      if(_retryNoticeShown) setNotice("");
      // v99.8 (C2): release the controller ref only if this send still owns it. A second
      // send can enter through the pre-setLoading(true) await window (the first-turn
      // early index save) before this one's finally runs; an unconditional null here
      // would strip the live send's controller, breaking Stop and the C1 session-swap
      // abort for that stream. Same ownership pattern as the advanced-tool runners.
      if(abortRef.current===controller) abortRef.current=null;
      sendInFlightRef.current = false; // v99.9 (C3): release the admission slot
    }
    return true; // v99.7 (M8): the send was accepted and attempted (success or error)
  };

  // v72: derived shell + guarded send (guest gate on the first send of a fresh decision)
  const dataTheme = (theme === "light" || theme === "paper") ? "paper" : "ink";
  const stage = currentMode === "Commit" ? "commit" : currentMode === "Explore" ? "explore" : "clarify";
  const padX = narrow ? "16px 14px 44px" : "24px 26px 48px";
  // B3: memoized on [messages]. assessReadiness runs regex scans over full history;
  // recomputing on every render was unnecessary. Same pattern as detectedOptions.
  // messages stays in sync with rawHistoryRef so the value captures all new turns.
  const _rd = React.useMemo(() => {
    try { const r = assessReadiness(rawHistoryRef.current); return r && typeof r.readinessScore === "number" ? Math.round(r.readinessScore) : 0; } catch (_) { return 0; }
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps
  const recent = (sessionIndex || []).map(s => ({ id: s.id, title: s.title || "Untitled decision", status: s.status || "Exploring" }));
  const guardedSend = async (t, a, o) => {
    // v100.0 (A5): mirror sendMessage's synchronous admission guard BEFORE charging the
    // decision cap. guardedSend's own awaits (isOverageEnabled, canCreateDecision) open a
    // window where two rapid sends both pass, both bump the counter, and C3 then rejects
    // the second inside sendMessage — charging two decisions for one delivered send.
    // Checking here makes the bump and the send share one admission decision.
    // v101.1: the A5 entry check was necessary but not sufficient — sendInFlightRef is
    // not set until sendMessage runs, so the two awaits below still let a second rapid
    // send pass and bump again. decisionChargeRef closes that window: it is claimed
    // synchronously here and released only after the bump + handoff complete.
    if (loading || sendInFlightRef.current || decisionChargeRef.current) return false;
    const fresh = (rawHistoryRef.current || []).length === 0;
    const pol = policyFor(tier);
    // Turn cap is enforced inside sendMessage (single chokepoint). guardedSend owns
    // the decision-creation cap on the first send of a fresh decision.
    if (fresh) {
      // v101.1: claim the charge slot synchronously, before the first await. A second
      // guardedSend entering during the awaits below sees this set and bails at the
      // gate above, so the cap is bumped at most once per delivered fresh send.
      decisionChargeRef.current = true;
      try {
        // v102: daily generation ceiling — enforced for every plan IN ADDITION to the
        // monthly cap, to bound worst-case daily API spend. Checked before the monthly
        // gate so a day-blocked session never consumes the monthly allowance. Read-only
        // here; the daily counter is recorded once admission actually succeeds below.
        const daily = await canStartDailySession(tier);
        if (!daily.allowed) {
          recordMetric("cap_block", tier);
          if (tier === "pro") {
            setNotice("You've reached today's included session limit. Extra sessions require paid overage.");
          } else {
            setNotice("You've reached today's session limit for this plan. You can continue tomorrow or upgrade for more room.");
          }
          return false;
        }
        if (Number.isFinite(pol.maxDecisionsPerMonth)) {
          // C4: use shared isOverageEnabled() helper — was an inline try/catch duplicated here and in startSeededDecision.
          // v102: isOverageEnabled is now payment-gated and returns false until billing
          // confirms a charge, so the cap holds and no extra session is granted locally.
          const overageEnabled = await isOverageEnabled();
          const chk = await canCreateDecision(tier);
          if (!chk.allowed && !overageEnabled) {
            recordMetric("cap_block", tier);
            if (tier === "starter" || tier === "pro") {
              // C3: set dedicated overageBanner state instead of passing JSX to setNotice (type mismatch).
              setOverageBanner({
                tier,
                cap: chk.cap,
                onOptIn: () => { setOverageBanner(null); guardedSend(t, a, o); },
              });
            } else {
              setNotice(`You have used all ${chk.cap} sessions this cycle. Upgrade to keep your ledger compounding. Every committed decision builds your track record.`);
              goToPricing();
            }
            return false; // v99.7 (M8): pre-flight rejection
          }
          const n = await ACTIVE_LIMITS.bump();
          setMonthUsed(n);
          await recordDailySession(); // v102: count the admitted session against today
          refreshDailyUsed();
        }
        // pro and enterprise are uncapped: no gate.
        // v97.7: a fresh decision must get its own session id and library row. If the
        // current sessionId already has a saved entry in the index (e.g. the user came
        // from a committed decision without clicking "New decision", or the mount restored
        // a prior session into this id), reusing it would overwrite that decision instead
        // of creating a new one. Mint a fresh id and pass it explicitly to sendMessage so
        // the new decision is saved under its own row immediately.
        const collides = (sessionIndex || []).some(s => s && s.id === sessionId);
        if (collides) {
          const fid = genId();
          setActiveId(fid); setSessionId(fid);
          // v99.6 (C1 fix): forceSessionId must ride INSIDE opts — sendMessage takes
          // (rawText, attachments, opts). The previous 4th positional argument was
          // silently discarded, so every save in the turn keyed to the stale closure
          // sessionId and overwrote the colliding decision's blob and index row.
          return sendMessage(t, a, { ...(o || {}), forceSessionId: fid });
        }
      } finally {
        // v101.1: release the charge slot once the bump + handoff are done. This guards
        // the bump decision only; the send itself is serialized by sendInFlightRef inside
        // sendMessage. Releasing here (rather than after the send resolves) is correct:
        // sendMessage has already claimed its own slot synchronously by the time any of
        // the return statements above hand off, so a follow-up send cannot double-bump.
        decisionChargeRef.current = false;
      }
    }
    return sendMessage(t, a, o);
  };

  // v97.7: stage a template prompt into the Home composer for edit-or-send. Unlike
  // startSeededDecision (which auto-sends), this resets to a fresh session, applies the
  // template/workflow to decisionState, pre-fills the composer with the prompt, and lands
  // the user on Home so they can edit the text or send it as-is. Nothing is sent or saved
  // until the user submits — at which point the normal guardedSend -> sendMessage path
  // (with its index save) runs, so the decision lands in the library on submit.

  // v98.8: extracted from seedComposer and startSeededDecision, which previously duplicated
  // this 12-line block. Any future change to reset behavior now has one location.
  const clearSessionState = React.useCallback((opts = {}) => {
    // v99.7 (C1): same kill-switch as restoreSession — a new or seeded session must
    // never receive writes from streams or classifiers started under the previous one.
    sessionEpochRef.current++;
    try{ abortRef.current?.abort(); }catch(_){}
    try{ classifyAbortRef.current?.abort(); }catch(_){}
    try{ advAbortRef.current?.abort(); }catch(_){}
    setBoth([]); rawHistoryRef.current = []; decisionStateRef.current = emptyDecisionState();
    setActiveDoc(null); setCurrentMode("Clarify"); setLastReasoning(null);
    setError(""); setNotice(""); setIntel(null); setOverlay(null);
    setAttached([]); attachedRef.current = []; setContradiction(null);
    setSharedMeta(null); setSeedType(null);
    // v100.0 (A1): preserve the share-loop tag when the caller is mid-seed. The v98.8
    // helper extraction added an unconditional seedLoopRef reset here, which silently
    // wiped the "doc"/"card" tag that startOwnFromShare and the card landing set just
    // before calling clear — so the first send recorded no create event and the doc and
    // card K-factor numerators were structurally zero (v99.7 M5 never worked end to end).
    // Framework survived only because its landing never routes through clear.
    if (!opts.preserveSeedLoop) seedLoopRef.current = null;
    firstCommitFiredRef.current = false;
    if (opts.selectedTemplate || opts.workflowType) {
      decisionStateRef.current = mergeDecisionState(decisionStateRef.current, {
        ...(opts.selectedTemplate ? { selectedTemplate: opts.selectedTemplate } : {}),
        ...(opts.workflowType    ? { workflowType: opts.workflowType }          : {}),
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const seedComposer = async (seedText, opts = {}) => {
    // v99.7 (P12): align with startSeededDecision — a decision in progress when the
    // user selects a template is parked as pending so it keeps its resume affordance.
    // The patch is AWAITED before the refs are cleared, so it merges into the old
    // session's state, never the fresh one (the ordering startSeededDecision uses).
    if ((rawHistoryRef.current || []).length > 0) {
      try { await persistDsPatch(sessionId, { pending: true }); } catch(_){}
    }
    clearSessionState(opts);
    setActiveId(null); setSessionId(genId());
    setHomeSeed({ text: seedText, ts: Date.now(), workflowType: opts.workflowType || "decide", selectedTemplate: opts.selectedTemplate || null });
    setView("Home");
  };


  const startSeededDecision = async (seedText, atts = [], opts = {}) => {
    const inProgress = (rawHistoryRef.current || []).length > 0;
    if (inProgress) {
      const pol = policyFor(tier);
      // v102: daily ceiling pre-check, so a day-blocked user is rejected BEFORE the
      // current session is parked as pending. guardedSend re-checks authoritatively.
      const _daily = await canStartDailySession(tier);
      if (!_daily.allowed) {
        recordMetric("cap_block", tier);
        setNotice(tier === "pro"
          ? "You've reached today's included session limit. Extra sessions require paid overage."
          : "You've reached today's session limit for this plan. You can continue tomorrow or upgrade for more room.");
        return;
      }
      if (Number.isFinite(pol.maxDecisionsPerMonth)) {
        const chk = await canCreateDecision(tier);
        if (!chk.allowed) {
          // C4: use shared isOverageEnabled() helper.
          // v102: payment-gated, returns false until billing confirms — cap holds.
          const overageEnabled = await isOverageEnabled();
          if (!overageEnabled) {
            recordMetric("cap_block", tier);
            if (tier === "starter" || tier === "pro") {
              setOverageBanner({
                tier,
                cap: chk.cap,
                onOptIn: () => { setOverageBanner(null); startSeededDecision(seedText, atts, opts); },
              });
            } else {
              setNotice(`You have used all ${chk.cap} sessions this cycle. Upgrade to keep your ledger compounding. Every committed decision builds your track record.`);
              goToPricing();
            }
            return;
          }
        }
      }
      try { await persistDsPatch(sessionId, { pending: true }); } catch (_) {}
    }
    // v98.8: delegate to clearSessionState (extracted helper). Behavior unchanged.
    clearSessionState(opts);
    // v97.9: the redundant synchronous save here was removed. The first-turn early save
    // inside sendMessage now persists this session, so a single submit no longer fires
    // six storage writes (which was tripping the artifact store's rate limit and causing
    // blob writes to silently fail). Generate the id, defer the send, let sendMessage save.
    const newId = genId();
    pendingSeedRef.current = { text: seedText, atts: atts || [] };
    setActiveId(newId); setSessionId(newId);
    setView("Session");
  };

  // Fire the deferred seeded send once the fresh sessionId has rendered, so the new
  // decision sends under its own id. v100.0 (A8): the prior claim that "the session is
  // already persisted (above)" was stale — v97.9 removed that synchronous save. The
  // first-turn early save inside sendMessage now persists it; if this send is blocked by
  // a pre-flight guard before that save runs, no library row exists yet, which is correct
  // (a rejected send should not create a row).
  React.useEffect(() => {
    const seed = pendingSeedRef.current;
    if (!seed) return;
    pendingSeedRef.current = null;
    guardedSend(seed.text, seed.atts, {});
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // v127: account-first gate. With the guest tier removed, an unauthenticated user
  // (tier === null) gets the mandatory AuthGate as the entire app. Nothing behind it
  // renders, so no null-tier code path runs, and the gate cannot be dismissed until
  // setTier("free") moves the user to a real tier. Themed wrapper so font/theme vars
  // resolve for the overlay.
  if (!tier) {
    return (
      <div className="wo" dir="ltr" data-theme={dataTheme} style={{ height:"100vh", width:"100%", background:"var(--bg)", color:"var(--ink)", fontFamily:"var(--serif)" }}>
        <style>{STYLE}</style>
        <AuthGate mandatory setTier={setTier} narrow={narrow} />
      </div>
    );
  }

  return (
    <div className="wo" dir="ltr" data-theme={dataTheme} style={{ height:"100vh", width:"100%", direction:"ltr", display:"flex", flexDirection:narrow?"column":"row", background:"var(--bg)", color:"var(--ink)", fontFamily:"var(--serif)", overflow:"hidden" }}>
      <style>{STYLE}</style>
      <A11yLiveRegion polite={a11yPolite} assertive={a11yAssertive} />
      {!narrow && <SidebarV72 view={view} setView={setView} tier={tier} dataTheme={dataTheme} setTheme={setTheme} onUpgrade={goToPricing} mode={mode} enableAdvanced={enableAdvanced} sessions={sessionIndex} onNew={newSession} onLoad={loadById} dueCount={dueCount} pendingCount={pendingSessions.length} creditsUsed={creditsUsed} monthUsed={monthUsed} resetDays={resetDays} />}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        <TopBar view={view} stage={stage} tier={tier} setView={setView} narrow={narrow} onMenu={()=>setDrawer(true)} monthUsed={monthUsed} onUpgrade={goToPricing} />
        {(error || notice || overageBanner) && (
          <div style={{ padding:"9px 18px", background:error?"var(--critical)":"var(--accent-soft)", borderBottom:"1px solid var(--line)", flexShrink:0, display:"flex", alignItems:"center", gap:12 }}>
            {overageBanner ? (
              // C3: OverageOptInBanner rendered through its own state slot, not as JSX-in-notice.
              <div style={{ flex:1, minWidth:0 }}>
                <OverageOptInBanner
                  tier={overageBanner.tier}
                  cap={overageBanner.cap}
                  onClose={() => setOverageBanner(null)}
                  onOptIn={overageBanner.onOptIn}
                />
              </div>
            ) : (
              <span style={{ flex:1, minWidth:0, fontFamily:"var(--serif)", fontSize:14, color:error?"#fff":"var(--ink)" }}>{error || notice}</span>
            )}
            <button onClick={()=>{ setError(""); setNotice(""); setOverageBanner(null); }} aria-label="Dismiss" className="wo-hover" style={{ flexShrink:0, background:"transparent", border:"none", cursor:"pointer", color:error?"#fff":"var(--ink2)", display:"flex", alignItems:"center", padding:2, borderRadius:5 }}><X size={16} /></button>
          </div>
        )}
        <div style={{ flex:1, display:"flex", overflow:"hidden", minWidth:0 }}>
          <div ref={mainScrollRef} className="wo-sc" style={{ flex:1, minWidth:0, overflowY:"auto", overflowX:"hidden", background:"var(--bg)" }}>
            <div className="wo-sc" style={{ position:"relative", background:"var(--paper)", minHeight:"100%", margin:narrow?8:12, borderRadius:10, border:"1px solid var(--line)" }}>
              <div className="wo-grain" style={{ borderRadius:12 }} />
              <div style={{ position:"relative" }}>
                <ViewErrorBoundary viewKey={view} fallback={(err, reset)=>(
                  <div style={{ maxWidth:560, margin:"0 auto", padding:`60px ${pad}px` }}>
                    <Kicker style={{ marginBottom:12 }}>Something went wrong</Kicker>
                    <p style={{ fontFamily:"var(--serif)", fontSize:16, lineHeight:1.6, color:"var(--ink2)", margin:"0 0 18px" }}>This view hit an error and could not finish rendering. Your committed decision is saved. Go back to it or reload.</p>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                      <PrimaryBtn onClick={()=>{ reset(); setView(activeDoc ? "Document" : "Session"); }}>Back to your decision</PrimaryBtn>
                      <GhostBtn onClick={()=>{ try{ location.reload(); }catch(_){} }}>Reload</GhostBtn>
                    </div>
                  </div>
                )}>
                {view==="Home" && <HomeV72 tier={tier} monthUsed={monthUsed} resetDays={resetDays} onStart={(text, atts)=>{
                    // v97.7: a submission from Home is always a NEW decision. If the current
                    // session already has history (e.g. a prior committed decision that was
                    // never cleared), reset to a fresh session first so the new decision gets
                    // its own library row instead of appending as another turn of the old one.
                    // After clearing refs, guardedSend sees a fresh decision: it applies the
                    // creation cap and mints a fresh id via its collision check.
                    // v98.8: delegate to clearSessionState (extracted helper).
                    if ((rawHistoryRef.current || []).length > 0) {
                      clearSessionState();
                      setActiveId(null); setSessionId(genId());
                    }
                    guardedSend(text, atts);
                  }} onDraft={(text, atts, opts)=>startSeededDecision(text, atts||[], { workflowType:"draft", ...(opts||{}) })} setView={setView} onUpgrade={goToPricing} recent={recent} seedType={seedType} pad={padX} onOpen={loadById} dueCount={dueCount} onReview={()=>setView("Review")} pending={pendingSessions} sessionCount={(sessionIndex||[]).length} softCheck={softCheckQueue} onSoftCheck={recordSoftCheck} seedText={homeSeed} />}
                {view==="FrameworkLanding" && frameworkLanding && <FrameworkLandingView landing={frameworkLanding} pad={padX} onStart={()=>{ setFrameworkLanding(null); setView("Home"); }} />}
                {view==="CardLanding" && cardLanding && <CardLandingView payload={cardLanding} pad={padX} onStart={()=>{
                    recordMetric("shared_path_started", cardLanding.card || "before_after");
                    const intake = stagedIntakeForCard(cardLanding);
                    setCardLanding(null);
                    // Stage the prompt into the Home composer for edit-or-send (no auto-send),
                    // preserving the shared template/workflow so starting still uses them.
                    // v100.0 (A1): the boot effect set seedLoopRef="card"; preserve it through
                    // the clear so the first send records a card create (K-factor numerator).
                    seedLoopRef.current = "card";
                    seedComposer(intake.text, { selectedTemplate: intake.selectedTemplate || undefined, workflowType: intake.workflowType, preserveSeedLoop: true });
                  }} />}
                {view==="Session" && <SessionView messages={messages} streaming={streaming} streamingText={streamingText} pad={pad} attached={attached} onOpen={loadById} scale={chatScale} onScale={setChatScalePersist} currentMode={currentMode} needsDocRetry={needsDocRetry} onMakeDocument={(fmt)=>sendMessage(`Produce this decision now as a ${fmt}.`, [], { direct:true, forceDoc:true, forceDocFormat:fmt })} />}
                {view==="Document" && <DocumentView doc={activeDoc} mode={currentMode} reasoning={lastReasoning} pad={pad} isShared={!!sharedMeta} onStartOwn={startOwnFromShare} contradiction={contradiction} htmlLocked={!has(tier,"exportHtml")}
                  shareSlot={card ? <ShareImageButton size="sm" makeBlob={()=>cardToPngBlob(card)} cacheKey={"dc:"+(card.decision||"")+":"+(card.date||"")} filename="decision_card.png" text="My decision card. Built with WorkOutput. https://workoutput.com" metricType="decision" label="Share" /> : null}
                  onExport={()=>{ if(!activeDoc){ setNotice("Commit a decision first, then export."); return; } setExportPicker(true); }}
                  onShare={()=>setShareOpen(true)} onShareFramework={shareFramework} scopeState={decisionStateRef.current} onSetScope={(sc)=>setDecisionScope(sessionId, sc)} onReview={()=>setView("Review")} onExpand={expandDocument} canExtend={canExtendOutput} onCard={()=>setView("Card")} />}
                {view==="Card" && <CardView card={card} scorecard={scorecard} onDownloadPng={downloadCardPng} onCopyText={copyCardText} pad={pad} onBack={()=>setView(activeDoc ? "Document" : "Session")} />}
                {view==="Advanced" && (has(tier,"advancedTools")
                  ? <AdvancedView intel={intel} profile={profileRaw} overlay={overlay} running={advRunning} options={detectedOptions} signalInfo={signalInfo} role={role} setRole={setRole} onRunAll={()=>runIntel("all")} onRunDep={()=>runIntel("dep")} onRunFail={()=>runIntel("fail")} onRunBench={()=>runIntel("bench")} onOverlay={runOverlayAction} attached={attached} contradiction={contradiction} onContradiction={runContradiction} narrow={narrow} pad={pad} loopMetrics={loopMetrics} hasProfile={!!(profileRaw && profileRaw.decisionCount)} onBack={()=>{ setMode("simple"); setView("Session"); }} />
                  : <UpgradeNotice onUpgrade={goToPricing} feature="The advanced toolkit" pad={padX} />)}
                {view==="Stats" && <StatsView metrics={userMetrics} sessions={sessionIndex} tier={tier} onUpgrade={goToPricing} pad={pad} reviewHorizonDays={reviewHorizonDays} />}
                {view==="Group" && TEAM_ENABLED && has(tier,"team") && <GroupView metrics={groupMetrics} pad={pad} />}
                {view==="library" && <LibraryView sessions={sessionIndex} onOpen={loadById} onDelete={deleteById} onNew={newSession} setView={setView} pad={padX} onSetScope={setDecisionScope} />}
                {view==="DraftLibrary" && <DraftLibraryView sessions={sessionIndex} onOpen={loadById} onDelete={deleteById} onDraft={()=>setView("Draft")} setView={setView} pad={padX} />}
                {view==="Review" && <ReviewView queue={reviewQueue} outcomeStats={outcomeStats} onRecord={recordOutcome} onOpen={loadById} onNew={newSession} setView={setView} pad={padX} />}
                {view==="profile" && <ProfileViewV72 tier={tier} profile={profileDisplay} metrics={{ ...userMetrics, shareCount: (loopMetrics && loopMetrics.shareCreated) || 0 }} onUpgrade={goToPricing} pad={padX} hasProfile={!!(profileRaw && profileRaw.decisionCount)} style={decisionStyle} openLoops={dueCount} credential={decisionCredential} />}
                {(view==="templates" || view==="Draft") && <TemplatesView tier={tier} initialTab={view==="Draft" ? "draft" : "decide"} sessionCount={(sessionIndex||[]).length}
                  onUse={(label)=>{
                    recordRecentTemplate(label);
                    const tid=templateIdForLabel(label);
                    seedComposer('I want to work through this using the "'+label+'" template. Here is my situation: ', tid?{ selectedTemplate: tid, workflowType:"decide" }:{ workflowType:"decide" });
                  }}
                  onDraft={(label)=>{ const tid=documentTemplateIdForLabel(label); seedComposer('I want to draft a "'+label+'". Here is the context: ', tid?{ selectedTemplate: tid, workflowType:"draft" }:{ workflowType:"draft" }); }}
                  onShare={()=>setShareOpen(true)} onUpgrade={goToPricing} pad={padX} />}
                {view==="pricing" && <PricingView tier={tier} setTier={setTier} pad={padX} onBack={returnFromPricing} hasActiveChat={messages.length>0} />}
                {view==="Settings" && <SettingsView reviewHorizonDays={reviewHorizonDays} onChangeHorizon={setReviewHorizonDays} tier={tier} pad={padX} onUpgrade={goToPricing} creditsUsed={creditsUsed} resetDays={resetDays} />}
                {view==="TeamLedger" && TEAM_ENABLED && has(tier,"team") && <TeamLedgerView metrics={groupMetrics} pad={padX} />}
                {view==="Site" && ((tier==="enterprise" && canViewSite(accessRole))
                  ? <SiteView metrics={loopMetrics} analytics={siteAnalytics} role={accessRole} canEdit={canEditSite(accessRole)} pad={pad} />
                  : <UpgradeNotice onUpgrade={goToPricing} feature="Site Metrics" pad={padX} />)}
                </ViewErrorBoundary>
              </div>
            </div>
          </div>
          {!narrow && view==="Session" && messages.length>0 && (
            <RightPanel turns={messages.length} stage={stage} tier={tier} onUpgrade={goToPricing} onCommit={()=>sendMessage("Please produce the committed decision output now.", [], { direct:true })} onExplore={()=>sendMessage("Lay out the options and tradeoffs for this decision so far.", [], {})} onShare={()=>setShareOpen(true)} onCard={()=>setView("Card")} onAdvanced={enableAdvanced} runIntel={runIntel} runOverlay={runOverlayAction} runContradiction={runContradiction} advRunning={advRunning} readiness={_rd} attached={attached} />
          )}
        </div>
        {view==="Session" && <ComposerV72 value={input} onChange={setInput} onSend={(atts, onDelivered)=>sendMessage((input.trim() || ((atts && atts.length) ? "Please read the attached documents and continue from where we are." : "")), atts||[], { onDelivered })} sending={loading} streaming={streaming} onStop={stop} narrow={narrow} onAppendText={(t)=>setInput(v=>v?(v+"\n\n"+t):t)}
          uploadAllowed={has(tier,"upload")} uploadCap={tier==="free"?1:Infinity}
          onUploadBlocked={(reason, detail)=>{ if(!has(tier,"upload")){ setNotice("File uploads are available on a paid plan."); } else if(reason==="cap"){ setNotice("Free includes one upload per session. Upgrade for more."); } else if(reason==="size"){ setNotice(detail); } }} />}
        {narrow && view==="Session" && messages.length>0 && (
          <button onClick={()=>setToolsSheet(true)} aria-label="Tools" style={{ position:"fixed", right:16, bottom:132, zIndex:60, width:50, height:50, borderRadius:"50%", background:"var(--accent)", color:"var(--paper)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 12px 30px -12px rgba(0,0,0,0.5)" }}><Sliders size={20} /></button>
        )}
        {narrow && <TabBar view={view} setView={setView} tier={tier} onUpgrade={goToPricing} />}
      </div>
      {narrow && drawer && (
        <div onClick={()=>setDrawer(false)} style={{ position:"fixed", inset:0, zIndex:120, background:"rgba(20,16,10,0.5)", animation:"woFade .2s ease forwards" }}>
          <div onClick={e=>e.stopPropagation()} style={{ width:262, height:"100%", animation:"woSlide .26s cubic-bezier(.2,.7,.2,1) forwards" }}>
            <SidebarV72 view={view} setView={setView} tier={tier} dataTheme={dataTheme} setTheme={setTheme} onUpgrade={goToPricing} mode={mode} enableAdvanced={enableAdvanced} sessions={sessionIndex} onNew={newSession} onLoad={loadById} onNavigate={()=>setDrawer(false)} dueCount={dueCount} pendingCount={pendingSessions.length} creditsUsed={creditsUsed} monthUsed={monthUsed} resetDays={resetDays} />
          </div>
        </div>
      )}
      {narrow && toolsSheet && (
        <Overlay onClose={()=>setToolsSheet(false)} narrow>
          <div style={{ padding:"20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <Kicker>{stage==="commit" ? "Decision committed" : stage==="explore" ? "Explore tools" : "Getting started"}</Kicker>
              <button onClick={()=>setToolsSheet(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--meta)" }}><X size={18} /></button>
            </div>
            {stage==="commit" ? (
              // Commit stage — two primary actions + CommitMoreOptions (lifted hook)
              <>
                <div style={{ background:"var(--accent-soft)", border:"1px solid var(--accent)", borderRadius:9, padding:"12px 14px", marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}><CheckCircle2 size={15} style={{ color:"var(--accent)" }} /><span style={{ fontFamily:"var(--display)", fontWeight:600, fontSize:15, color:"var(--ink)" }}>Decision committed</span></div>
                  <p style={{ fontFamily:"var(--serif)", fontSize:13.5, color:"var(--ink2)", margin:0, lineHeight:1.45 }}>Saved to your library. Your profile updates as you commit decisions.</p>
                </div>
                <Btn full onClick={()=>{ setToolsSheet(false); setShareOpen(true); }} style={{ marginBottom:9 }}><Share2 size={15} />Share playbook</Btn>
                <Btn full kind="ghost" onClick={()=>{ setToolsSheet(false); setView("Card"); }} style={{ marginBottom:9 }}><Download size={15} />Decision card</Btn>
                <CommitMoreOptions
                  onContradiction={runContradiction}
                  attached={attached}
                  tier={tier}
                  setToolsSheet={setToolsSheet}
                  setView={setView}
                />
              </>
            ) : (
              // Clarify + Explore stages — full RightPanel inline
              <RightPanel inline turns={messages.length} stage={stage} tier={tier}
                onUpgrade={()=>{ setToolsSheet(false); goToPricing(); }}
                onCommit={()=>{ setToolsSheet(false); sendMessage("Please produce the committed decision output now.", [], { direct:true }); }}
                onExplore={()=>{ setToolsSheet(false); sendMessage("Lay out the options and tradeoffs for this decision so far.", [], {}); }}
                onShare={()=>{ setToolsSheet(false); setShareOpen(true); }}
                onCard={()=>{ setToolsSheet(false); setView("Card"); }}
                onAdvanced={()=>{ setToolsSheet(false); enableAdvanced(); }}
                runIntel={runIntel} runOverlay={runOverlayAction} runContradiction={runContradiction}
                advRunning={advRunning} readiness={_rd} attached={attached} />
            )}
          </div>
        </Overlay>
      )}
      {shareOpen && <ShareModalV72 onClose={()=>setShareOpen(false)} onStructure={()=>shareFramework()} onPrintChat={()=>{ runExport("print"); setShareOpen(false); }} htmlLocked={!has(tier,"exportHtml")} proLocked={!has(tier,"exportPdf")} hasDoc={!!activeDoc} onExportHTML={()=>{ if(has(tier,"exportHtml")){ activeDoc && downloadHTML(activeDoc); setShareOpen(false); } else { setShareOpen(false); setNotice("HTML export is available on Starter and Pro. Markdown is available on Free."); goToPricing(); } }} onExportMD={()=>{ if(has(tier,"exportMd")){ activeDoc&&downloadMarkdown(activeDoc); setShareOpen(false); } else { setShareOpen(false); setNotice("Create a free account to export your decisions."); setAuthGate(true); } }} onExportTxt={()=>{ if(has(tier,"exportTxt")){ activeDoc && _dl(activeDoc.sections ? activeDoc.sections.map(s=>s.heading+"\n"+(s.isList ? (s.items||[]).join("\n") : (s.content || s.editable || ""))).join("\n\n") : "", "text/plain", (activeDoc.title||"doc").replace(/[^a-z0-9]/gi,"_")+".txt"); setShareOpen(false); } else { setShareOpen(false); setNotice("Plain text export is available on Starter and Pro."); goToPricing(); } }} onExportPdf={()=>{ if(has(tier,"exportPdf")){ activeDoc && printDocumentHTML(activeDoc); setShareOpen(false); } else { setShareOpen(false); setNotice("PDF export is available on Starter and Pro."); goToPricing(); } }} narrow={narrow} ledgerMetrics={ledgerMetrics} />}
      {firstCommitShareOpen && <FirstCommitShareModal onClose={()=>setFirstCommitShareOpen(false)} onShare={(cardType, includeText)=>{ shareCard(cardType, !!includeText); }} style={decisionStyle} doc={activeDoc} decisionState={decisionStateRef.current} narrow={narrow} ledgerMetrics={ledgerMetrics} reviewHorizonDays={reviewHorizonDays} profile={profileRaw} />}
      {exportPicker && <ExportFormatModal tier={tier} hasDoc={!!activeDoc} narrow={narrow}
        onClose={()=>setExportPicker(false)}
        onSelect={(fmt)=>runExport(fmt)} />}
      {authGate && <AuthGate onClose={()=>setAuthGate(false)} setTier={setTier} narrow={narrow} />}
    </div>
  );
}
