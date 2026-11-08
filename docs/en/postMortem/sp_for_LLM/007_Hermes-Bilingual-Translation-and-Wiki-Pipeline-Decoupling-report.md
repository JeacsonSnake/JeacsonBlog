---
title: 007-Handing the blog translation over to an automated pipeline —— the inventory, the detection layer, and a checker that kept saying "nothing's wrong"
date: 2026-11-08
icon: "diagram-next"
category: Technical Investigation
tag:
  - AI Agent
  - Hermes Agent
  - VuePress
  - 翻译管线
  - Cron Job
  - GitHub Actions
  - Wiki
  - Lint
  - 幂等与状态机
---

> This document is a full retrospective of the work from 2026-11-05 15:03 to 2026-11-06 21:21 (about 30 hours, two back-to-back sessions): turning "translate the whole Chinese blog into English" from a one-off grind into a cron that runs itself every day, then splitting "reading the blog" out of the old RSS briefing job into a detection layer of its own, and finally, while testing that layer, doing a pass of coverage cleanup on the wiki knowledge base along the way.
>
> The three threads look like three separate jobs, but they are three faces of one question: **once a pipeline starts writing things unattended, what the user needs is not necessarily "the smartest model", but a state you can adjudicate, a gate you can re-run, and a detector that does not fail silently.**
>
> ---
> Most of the content was put together by Hermes Agent from the sessions; I only did the factual checking and edits, so the names and pronouns shift around a bit [for example, "I / the user" mean the same person under different narrative logic / point of view (the author themselves / Hermes Agent)]. You can also have an AGENT read and chew over it first, then read it. I cannot promise there is no logical inconsistency in this article, so please keep that in mind (bows)
>
> ---
> **Sessions involved**:
>
> | Session | Model | Session time (CST) | Messages | Role |
> |------|----------|----------|--------|------|
> | Session A | deepseek-flash | 11-05 15:03 → 11-06 11:14 | 815 | full-site English translation: inventory, sample pages, batch translation, build fixes, automation and hand-over |
> | Session B | deepseek-flash | 11-06 11:29 → 11-06 21:21 | 1220 | decoupling the detection layer, link-syntax migration, wiki coverage cleanup, and three lint untruths |
>
> **Original session source**: Hermes Agent
>
> **Subject keywords**: full translation, glossary, anchor slugify, build gate, sha256 state manifest, detection layer, consumer, cursor, idempotence, lint, stem collision, page splitting

## Contents

- [Background and problem definition](#background-and-problem-definition): two requirements, the target topology, and the objects in play
- [Phase 1: sizing up the English translation workload](#phase-1-sizing-up-the-english-translation-workload): the page inventory, and the real work beyond translating
- [Phase 2: three rounds of sample pages and a frozen set of conventions](#phase-2-three-rounds-of-sample-pages-and-a-frozen-set-of-conventions): nine sample pages and three sign-offs
- [Phase 3: batch translation and build-level failures](#phase-3-batch-translation-and-build-level-failures): three ways it crashed after every check was green
- [Phase 4: delivery, and the silent failure of automation](#phase-4-delivery-and-the-silent-failure-of-automation): three PRs, one cron, and one bug that was always idle
- [Phase 5: decoupling the detection layer](#phase-5-decoupling-the-detection-layer): one detector, two consumers, four jobs
- [Phase 6: link syntax and knowledge-base coverage](#phase-6-link-syntax-and-knowledge-base-coverage): dead text and gaps
- [Phase 7: three checks that lied, and splitting one page](#phase-7-three-checks-that-lied-and-splitting-one-page): the files the lint script could not see
- [Phase 8: the argument over the standard, and the wrap-up](#phase-8-the-argument-over-the-standard-and-the-wrap-up): when the spec and the code disagree
- [Deep technical analysis](#deep-technical-analysis): invariants, silent failures, the edges of the gate, and visibility
- [Conclusions and follow-up suggestions](#conclusions-and-follow-up-suggestions): key conclusions and leftover debt
- [Appendix: index of key objects](#appendix-index-of-key-objects): PRs, commits, jobs, scripts, metrics

---

## Background and problem definition

My blog `blog.jeacsonsnake.com` (the very one you are reading right now) is a VuePress site. The Chinese tree under `docs/` has sections for wiki (a Karpathy-style LLM Wiki), learningNote (study material on ROS2, Vue, computer networks, computer organisation, TypeScript, JS and the like), postMortem (deployment write-ups, troubleshooting notes, long-form LLM-based Q&A/report pieces) and so on. I did split the site into Chinese and English trees, but for several years the English side produced no actual content — only a blurb pointing readers at the Chinese pages. The only English content that had been retrofitted was the AI daily briefing archive that started in October (88 issues, maintained every day by the existing bilingual archive cron); everything else was Chinese.

::: note
For the AI daily briefing archive, see [the earlier article: 006-getting the AI daily briefing auto-archive pipeline to work end to end —— the merge-base invariant, doubled branch protection, and the many potholes of GitHub App bypass](./006_Hermes-Briefing-Archive-Auto-Merge-Topology-report.md)
:::

So I wanted to fill the English side in, that is, to translate the existing articles:

> **User:** I need every article on my blog (except the reposted ones) translated into English. Help me estimate the concrete workload under the current workflow, including the total number of articles and so on.

Of course, if "translating" were a thing done just this once, it would pile up again, so Hermes Agent wrote down this judgement during the assessment phase:

> As long as "write the zh page and write the en one along with it" is not baked into the content workflow, the backlog will just build up again after these 167 pages are cleared.

In other words, what these two days were aiming at was: "after translating the existing blog, there also has to be an automated pipeline that runs itself every day":

> **User:** Now I need you to bake the above into a cronjob. What I want from the job: when wiki-ingest sees a relevant update, and the updated post is under the paths we defined, translate it and push it under the "/en/" path. When a particular term comes up, translate it with reference to the glossary; when the term is not in the glossary, or when the glossary entry's description overlaps only with low confidence with what the term actually means here, translate it and record it in the glossary for maintenance. Please assess and come up with a plan.

By the next morning I had realised that if every job with a similar run time had to sync the information once on its own, that would really be a waste of resources. So I pushed the requirement one step further:

> **User, to Session A:** I would actually rather suggest looking at whether one monitor can trigger two jobs — one doing wiki-ingest, the other doing translation. Not (that) they need to travel in one PR; I am just saying this kind of trigger is more in line with engineering intuition. Give it an assessment?
>
> **After Session A's information was organised, the User summarised it to Session B:** I need you to decouple how the blog is read, so that wiki-ingest and en-translate can both react when the blog changes. Reading used to go through RSS; now I would like RSS to still apply, with different rules for different parts, for wiki-ingest and for translation.

In other words, I want **the same** "the blog changed" signal to feed **two** downstreams whose rules are not the same.

### Target topology (final shape)

```txt
06:35  RSS News Scan (1a35ce6480fe)       news briefing only → discord + feishu (runs every day, no gate)
06:45  Wiki Mirror Sync (88f4438fe179)    only syncs the ~/.hermes/wiki/ mirror, silent, zero output on success
06:50  Wiki Ingest Sync (60c0fa9fb699)    monitor gate → fetch source → write wiki → lint script gate → push → ack
07:25  EN Translation Sync (a28fbd4255a2) monitor gate → translate → structural check → push → advance state

                 ┌──────────────────────────────────────────┐
                 │           blog-change-detector           │             the single read layer
                 │        tree(gh api) + rss(sqlite)        │
                 └───────────────────────┬──────────────────┘
                             ┌───────────┴───────────┐
                  consumer=wiki                 consumer=en
                  docs/wiki/**                  docs/en/**                two execution jobs / consumers
                  wiki-ingest-<date>-x          wiki-ingest-<date>-en
                  → PR ① (waits for User merge) → PR ② (waits for User merge)
                             └───────────┬───────────┘
                       master push → Build_and_Deploy → the site              the same deployment path
```

### A few design points that "look simplifiable, but cannot be touched"

| Design point | Reasoning |
|---|---|
| Use "one detector + two consumers" rather than "one monitor triggering two jobs" | Hermes cron jobs are time-driven; a cronjob acting as a monitor cannot start another job, so all it can do is hold the gate. The payoff is not in saving a schedule but in one consistent detection standard |
| The two consumers each keep their own cursor | wiki uses a `path→blob` ledger and only advances on `ack`; en uses the sha256 in `state.json` and only advances after a successful push. A shared cursor would make the two pipelines swallow each other's progress |
| wiki merges RSS + tree, en's main source is git | RSS can only announce "there is a new post"; it cannot see edits and does not carry the body; one `gh api` call on the git tree shows new/modified/deleted. On the other hand, when gh or the proxy is down git goes blind, while RSS does not depend on them |
| Make mirror sync its own job | ingest is gated by its monitor, and on a day with no articles it simply never wakes up; yet `~/.hermes/wiki/` is also the query cache for "have I written about X before", and hanging it off ingest alone would let it go stale |
| Detect with a sha256 manifest, not `git diff old..new` | the clone is `--depth 1`, the previous SHA is not in the object store, and a range diff simply fails |
| One push, one commit | the repo's `docs.yml` takes the PR title from `git log -1 --format=%s` and the body from `%b`; multiple commits trigger a warning, and the body only reflects HEAD |
| A failed check means 0 commits and state does not advance | the build does not run on the branch (`Build_and_Deploy` only runs on master) and a PR gets no CI green light; the local gate is the only thing that holds |

::: info Thinking about RSS
The earlier reason for defining RSS as the blog-change detector was that you can tell a new post went out without reading git, which suits people who subscribe. But it did not account for this: because my blog is a website, editing an existing text in place is far easier than it is for a print magazine. With a physical magazine, if an article contains an error you have to wait for the next issue and raise the correction in a new article, which carries a delay; my blog's structure lets me change the original article in place, so "the original was edited but the wiki never read the change" is a real possibility. Which of the two — reading git directly or reading RSS — is actually better, and whether "read blog posts over RSS" needs reworking to avoid the case above, is still open to debate.
:::

### The objects in play

| Property | Value |
|---|---|
| Repo | `JeacsonSnake/JeacsonBlog` (public), VuePress site `blog.jeacsonsnake.com` |
| Chinese tree → English tree | `docs/**` → `docs/en/**` (**the tree structure is unchanged apart from the extra `en/` level, and Chinese filenames are not renamed either**) |
| Push credential | SSH deploy key (pushes branches); the upstream Action `Create_LLM_Relate_Pr` opens the PR (author `github-actions[bot]`) |
| Local API identity | Hermes Agent `Hermes-cRl1` fine-grained PAT (**read-only**: `gh pr create` reports `Resource not accessible`) |
| State file | one for wiki, one for en |
| Rules file | `rules.json` (changing rules does not mean changing code) |
| Machine constraints | 1.9 GB RAM / 2 cores, a whole-site `docs:build` is guaranteed to OOM |

---

## Phase 1: sizing up the English translation workload

The inventory is based on a real scan of master `3ea10bb` (11-05 11:15), not an estimate:

```txt
docs/ holds 260 md files in total
  ├─ 2 explicitly reposted (isOriginal: false + source:)      → excluded
  ├─ 91 already have English (88 AI briefings + about + 2 READMEs) → not redone
  └─ 167 pages to translate
```

| Section | Pages to translate | Chinese characters | ≈ English words | Code blocks | Image references |
|---|---|---|---|---|---|
| learningNote/Ros2_Note | 44 | 56,662 | ≈35,100 | 397 | 83 |
| postMortem | 27 | 55,998 | ≈34,700 | 236 | 36 |
| wiki | 47 | 26,935 | ≈16,700 | 43 | 0 |
| learningNote/vueNote | 14 | 17,205 | ≈10,700 | 131 | 4 |
| learningNote/Computer_Network | 11 | 14,328 | ≈8,900 | 2 | 35 |
| learningNote/Principles_of_Computer_Composition | 2 | 4,800 | ≈3,000 | 1 | 6 |
| learningNote/TypeScriptNote | 6 | 4,699 | ≈2,900 | 65 | 0 |
| complain_diary | 6 | 4,157 | ≈2,600 | 0 | 0 |
| learningNote/JSNote | 7 | 2,401 | ≈1,500 | 36 | 0 |
| the rest (coding_skill, automatic control theory) | 3 | 470 | ≈290 | 0 | 4 |
| **Total** | **167** | **187,655** | **≈116k words** | **911** | **168** |

Of those, 17 are index/README pages under 80 characters; the real body text is 150 pages.

After clearing out some of the articles that did not need translating, the total came down to:

```txt
114 pages / 156,563 characters / ≈97k English words / 868 code blocks / 168 image references
```

(115 pages actually landed in the end; the delta is explained in Phase 3.)

::: tip What actually drives the schedule is not the translation

Beyond translating, here is what really affected the timeline:

| Item | Scale | Why it is a nuisance |
|---|---|---|
| Code blocks | 911 blocks | They have to survive byte-for-byte, and only the comments and outer explanation can be translated — the easiest place to make a mistake, and the place that most needs checking |
| Images | 168 references / 144 assets / 72.5 MB | Either copy the asset directories (repo weight doubles), or point back into the Chinese directories (ugly paths), or move everything to `public/` (111 Chinese pages would need editing, and later references get awkward too) |
| Internal links | 275 relative links, 152 of them `.html` | An en page that copies them verbatim drags the reader back to the Chinese page |
| Navigation gap | 2 TS files | `enSidebar.ts` / `enNavbar.ts` have **no postMortem navigation**; making those pages show up means editing config first — a code change, not a translation |
| frontmatter | 167 files | Only `title` is translated; `icon/date/category/article/feed` are left alone (even when they contain Chinese) |
| Glossary | 150–250 entries at the start | It cannot be settled before browsing the source, because the same term turns up in three different renderings |
| PR splitting | 3 | 167 files cannot possibly go into one PR |

Schedule: at "8–12k characters per batch, 5–6 subagents in parallel" that is 19 batches, 1.5–3 hours on the machine side. And if everything is to be looked at closely, the real time sink is acceptance — assume 2–3 days for sampled acceptance, while a page-by-page review needs 3–4 weeks (116k words ≈ a 350-page technical book; a professional translator at 2,500 words/day needs about 46 person-days).

:::

---

## Phase 2: three rounds of sample pages and a frozen set of conventions

In this phase I had Hermes Agent produce nine sample pages in three rounds. The method here is worth spelling out: **the sample is not the easiest page you can find; each round picks the hardest shapes the previous round did not cover.** Nine samples in three rounds, each round with a fresh set of "hard cases".

### Round 1: the three hardest shapes

| Sample | Source | Why it was picked |
|---|---|---|
| 01 | [source one](../../learningNote/Ros2_Note/co_me_2/2025_04_13.md) (790 characters) | densest terminology + 12 images + 3 admonitions + cross-page links + personal verbal tics |
| 02 | [source two](../deploy/005_leancloud_migrate_neon_relate.md) (751 characters) | a long step-by-step piece + code blocks in 4 different languages + in-page anchors |
| 03 | [source three](../../learningNote/Computer_Network/什么是SMTP.md) (1,510 characters) | pure exposition, no code, cites a textbook — the hardest test of translating so it "reads like a human wrote it" |

The self-check was not by eye: for all three, the code-block count, image paths, heading levels and frontmatter keys were compared against the Chinese version; the diff on 02 showed that only comments, docstrings and Chinese inside `print()` had moved, with zero change in logic.

Three decisions were put on the table: whether Chinese inside code blocks gets translated, how images are handled, and how terms are translated in specific contexts. The user's answer nailed the conventions down:

> **User:** the term node table is rendered as node graph, where that term comes from translating the Plugins → Introspection → Node Graph tab inside rqt_graph; copy the images into the corresponding folder under docs/en/, and apart from the extra en/ the file tree structure does not change much; Chinese inside code blocks gets translated. Translate comments + strings that get printed for a human to read; identifiers, commands, paths and config keys are left alone.

The same round added four long-term rules:

 1. when citing a Chinese textbook/paper **that has an English original, use the original** (e.g. `'Computer Networking: A Top-Down Approach' (James F. Kurose and Keith W. Ross, Seventh Edition, 2017)`);
 2. the glossary is an incrementally maintainable `.csv`;
 3. no "de-colloquialising"; keep the existing verbal tics;
 4. add a hint container with a translation statement at the end of every page.

::: info About the hint container for the translation statement
After the format was unified, the final confirmed shape is:

> This article was translated by `Hermes Agent`; the original text can be found at [here]({{original_Chinese_blog_file_relative_location}}). The translation is for reference only.
> Translation time: {{YYYY-MM-DD}}

:::

### Round 2: three new hard cases

| Sample | Source | New situation covered |
|---|---|---|
| 04 | `Ros2_Note/coor_trans/2026_01_28.md` (676 characters) | switch to the English original title when citing official docs; a `gif` image; a Chinese fence info string |
| 05 | `postMortem/tiny_tips/2026_09_08.md` (768 characters) | 7 screenshots, links with full-width brackets inside a table, a purely narrative troubleshooting piece |
| 06 | the middle part of the Vue3 data-reactivity series under `vueNote/VUE3/` (2,613 characters) | Chinese anchors jumping across pages, an API spelling error in the original, English source and Chinese translation appearing one after the other |

This round produced the first "deliberately failing" page: sample 06's original has an ES6 comment block in English immediately followed by "which translates into Chinese as:" and a Chinese translation block; the en version keeps the English block and turns the Chinese block into one English sentence of paraphrase, because otherwise the same content appears twice and reads as duplication. The price is that the code-block count goes 34 → 32, which makes `translation_check.py` complain — deliberately, not a defect.

**The anchor rule was upgraded from "calibrated by measurement" to "aligned with the source"**: first the `id=` attributes on the live page's HTML were scraped and compared, 12/12 hits; later `@mdit-vue/shared` was installed and its `slugify` run over **1,255 headings** across the site, with **0 mismatches** against the checker's implementation. The rule was then fixed:

```txt
space / . / ? / ' / full-width punctuation → -
em dash — kept          ## X — Y  →  x-—-y
consecutive -     collapsed
heading starting with a digit gets a _ prefix   1.Reflect → _1-reflect
```

> **Lesson 1**: the translation spec is not a question of "is it written well", it is a question of **decidability**. Once the anchor rule can be run through the official slugify with 0 differences, 108 pages can be batched without manual spot checks; conversely, any spec that rests on "I think this looks right" has to be redone page by page after batching.

### Round 3: three more extreme structures

| Sample | Source | New situation covered |
|---|---|---|
| 07 | `postMortem/sp_for_LLM/000_prompt-…Markdown-Converter.md` | an md code block nested inside a four-backtick fence |
| 08 | the Day Five note under `learningNote/TypeScriptNote/` | code blocks indented inside a list |
| 09 | `learningNote/Principles_of_Computer_Composition/README.md` | dense math `$…$` / `~subscript~` / `^superscript^`, generated with the line-number mapping script `build_ja_zu.py` so the token bytes cannot move |

Round 3's user decisions: the two anchors in the Chinese pages that were **already broken** are not fixed in passing (no touching Chinese pages on the sly), the META prompt input handed to the LLM may be translated, and `---` in titles becomes an em dash.

### The frozen conventions after three rounds

| Item | Final call |
|---|---|
| File tree | same path and same name under `docs/en/` (Chinese filenames preserved), which makes relative links work automatically |
| frontmatter | only `title` is translated; **Chinese tag values stay in the original**; all other keys as-is |
| Code blocks | translate comments / docstrings / printed strings meant for humans / the fence info string; identifiers, commands, paths, config keys and logic stay put |
| Images | copied into the matching directory under `docs/en/` |
| Glossary | a `.csv` with the columns `term_zh,term_en,scope,status,note,source_page,updated`, `status` being `locked`/`draft`, **maintained on this machine only, never committed to the blog repo** |
| Closing container | written per the definition above |
| Register | no de-colloquialising; memes and verbal tics preserved |

---

## Phase 3: batch translation and build-level failures

Execution plan: 105 pages cut into 11 batches by directory (8–13k Chinese characters each), up to 10 subagents in parallel, with the remaining batch filled in afterwards. Every page goes through `translation_check.py` once it is translated: frontmatter keys, YAML parseability, heading count, fence count, image existence, math structure, residual Chinese, link targets, anchors, container path.

The result was **115 / 115 pages green on the structural check** (learningNote 88 + postMortem 27; 115 = 117 candidate pages site-wide minus 2 old pages that were English to begin with). And then —

### Three classes that still crashed after everything was green

| Crash | Symptom | Why the structural check could not see it | Fix |
|---|---|---|---|
| YAML colon | `:` in 23 English titles was not quoted, and `js-yaml` died on the spot | the checker only verified "the keys are all there", not "the value parses as YAML" | quote the whole value: `title: "ROS2-006-…: Action"` |
| Vue took it for an unclosed tag | three ASCII placeholders — `Array<type>`, `"<type>variable"`, `"<workspace>-<package name>"` — broke the compile | the source site writes the placeholder with Chinese full-width brackets instead, so this had never been exposed; at the `.md` level it is perfectly legal | write `Array\<type>`; and a new rule: any `<[a-z][a-z0-9 _-]*>` in prose (outside code blocks and inline code) is an error |
| Lost math macro | `compute_and_simutation.md` lost `\it` (`\text{where c}` → should be `\text{where {\it c}}`) | the old "math tokens byte-identical" rule would have caught it, but it also judged prose inside `\text{…}` as an error, so it had been relaxed | the criterion became "same count of math spans + same set of LaTeX commands", with prose inside `\text{}` allowed to be translated |

The sentence in `en/learningNote/README.md` saying "all notes exist only in Chinese" was no longer true, so it was fixed in passing and turned into a translated index page.

### Three false judgements produced by a hard-coded checker

- the prose inside `\text{…}` must be translated, but the old rule demanded byte-identical math tokens → changed to structural equivalence;
- the container-path regex could not match a page whose filename contains a space (the watcheffect note under `vueNote/VUE3/`) → relaxed;
- `${VAR}` was being taken for a math token → stripped before comparison.

### The boundary of build verification

```txt
whole-site build → killed by the OOM in the vite stage. The box the HERMES Agent runs on has only 1.9 GB of RAM, and a 6 GB Node heap cannot save you (shrugs)
then, while running vuepress build, pagePatterns was temporarily limited to en/** → 292 pages / 285 html, passed
pagePatterns was restored afterwards
```

> **Lesson 2**: `✓ 115/115` only proves "the structure lines up", not "it compiles". All three crash points this time sat in the seam where the `.md` is legal but the rendering layer does not accept it. **So the gate needs two layers: the structural layer (a script) and the rendering layer (the build); on this machine the rendering layer can only be backstopped by the repo CI after the merge.**
---

## Phase 4: delivery, and the silent failure of automation

Once all of the above was done, Hermes submitted the PRs in three batches:

### Three PRs, one permission wall

| Batch | Content | Branch / commit | Size |
|---|---|---|---|
| ① | Ros2_Note 44 pages + English navigation (`enSidebar.ts` / `enNavbar.ts`) | `translation/en-learningNote-ros2` / `23da6b5` | 44 pages + 2 ts |
| ② | the rest of learningNote, 44 pages + `learningNote/README.md` | `translation/en-learningNote-rest` / `5d493e5` | 91 files / +7,670 |
| ③ | postMortem 27 pages + an out-of-bounds link fix under `en/about` | `translation/en-postMortem` / `af5749d` | 64 files / +7,287 |

Every PR was clicked by hand by the user on GitHub: Hermes Agent's fine-grained token has **read** permission only, `gh pr create` reports `Resource not accessible by personal API token`, and `docs.yml` as configured at the time only opened PRs automatically for `wiki-ingest-*`.

### The user changed the sentence in two places, and the first silent bug showed up

After the merge the user asked for the pipeline above to be baked into a cronjob. While checking, Hermes Agent caught three broken links that appeared after the user edited the link in the statement container — all of them left behind by **batch find-and-replace**:

| File | Symptom |
|---|---|
| `postMortem/README.md` | the `)` ended up after the full stop → the link target became `…README.md. The translation is for reference only` |
| `Ros2_Note/coor_trans/2026_01_29.md` | the `)` was simply gone |
| `learningNote/Computer_Network/README.md` | `at[here]` was missing a space and rendered as "athere" |

"**Batch replacement is a known way of breaking things**" therefore went into the skill as a rule: after any edit, rerun the full check — `translation_check.py` was subsequently changed to match the whole sentence (backticks, `[here]`, and the path followed immediately by `).`), and to URL-decode the path before testing whether it exists.

### The design of EN Translation Sync

```txt
monitor (~/.hermes/scripts/en-sync-monitor.py)
  → calls en-sync.py status (git fetch + sha256 comparison against state.json)
  → if the output is unchanged = idle → the agent is not woken at all, zero tokens, zero messages
  → if something changed = inject the inventory into the prompt
      → translate → en-sync.py finish
          → translation_check.py gate
          → single commit pushed to wiki-ingest-<date>-en
          → only on success advance state.json

exit 0 = success / 3 = structural check failed (0 commits, state not advanced) / 4 = push failed (state not advanced)
```

The first real run was `no_change (agent run suppressed)` and the user got no output, so Hermes Agent went to look, and **dug up a bug that would keep it mute forever**:

```txt
en-sync.py status only did git fetch, and fetch only updates FETCH_HEAD,
the working tree stayed at 9ff79f4; the hash was computed against yesterday's tree → always reported idle

HEAD before: 9ff79f4     ← master was already at 2bf8127
HEAD after : 2bf8127     ← changed to reset --hard FETCH_HEAD + clean -qfd docs/en after the fetch
```

This class of failure is the worst kind: **no error, no alert, just quietly doing nothing.** It was also here that the user raised the idea of "one monitor triggering two jobs", and the better part of the next day went into landing it — plus catching a second bug from the same family in the process:

```txt
sync_tree() used git rev-parse FETCH_HEAD without --verify
on a failed fetch it printed the literal string "FETCH_HEAD" to stdout
→ which was passed to git reset --hard as a legal SHA
→ an "unknown revision" traceback, and the whole EN run died on the spot

fix: --verify --quiet + a double check against the SHA regex; a failed fetch degrades
     to the current worktree, emitting one WARN git fetch failed (...) line
```

---

## Phase 5: decoupling the detection layer

### Why "one monitor triggering two jobs" is not possible

Hermes cron is **time-driven**; a monitor's only duty is "if the output is byte-identical to last time, do not wake the agent". It has no ability to start another job. So the shape that can actually be built is:

> **one detector + two consumers.**

The payoff is not one schedule fewer, it is: ① one consistent detection standard; ② pulling ingest out of the briefing job — because before this, ingest hung off steps 6/7 of Blogwatcher, and whenever any data source ahead of it (Weibo, Trending, Nature) failed and aborted the run, that day's ingest went missing with it.

### The old differences between the two detection paths

| | Blogwatcher (06:35) | EN Translation (07:25) |
|---|---|---|
| Criterion | `blogwatcher-scan.sh articles --blog JeacsonBlog` then `grep -E` to filter `/postMortem/` and `/learningNote/` | the sha256 manifest of files on master |
| Semantics | only "newly published" (RSS entries) | new + modified both count |
| Window | 24h + an unread pool that is **emptied every round** | no window, idempotent |
| Failure mode | a delayed source or an emptied pool → miss one issue and it is permanently missed | miss one and it is still there next round |

### The detector as landed

`blog-change-detector.py` (about 590 lines), with the subcommands `status` / `seed` / `ack` / `verify`:

| Dimension | Values |
|---|---|
| source | `tree` (`gh api repos/…/git/trees/master?recursive=1`, about 1.5 s a call, does not pull 78 MB) or `rss` |
| consumer | `wiki` / `en` / `all` |
| kind | `new` / `modified` / `deleted` / `missing_en` / `rss_only` |
| output | `--json` / `--report` / `--act-only` (list only the actionable items) / `--kinds` (whitelist) |
| rules | `rules.json`, **changing the rules does not mean changing the code** |

Where the two consumers' rules differ:

| | wiki-ingest | en-translate |
|---|---|---|
| Scope | `postMortem/` `learningNote/` `complain_diary/` | `learningNote/` `postMortem/` (no complain_diary) |
| Data source | RSS + git tree **merged** | git (sha256) + RSS **side-check** |
| Triggering kinds | only `new`; edits and deletions are advisory | `new` / `modified` / `missing_en`; deletions only get reported |
| Cursor | its own blob ledger, advanced only on `ack` | `en-sync.py`'s `state.json`, advanced only after a successful push |
| Role of RSS | supplies the publication time; still yields "newly published" when gh is down | backstops exactly one silent failure: a fetch that quietly failed, leaving the worktree on an old commit while reporting idle |

`verify` finally ran **16/16**, covering: the merge, path exclusion, idle after seed, blob changed → edit, vanished from the tree → deletion, only new is actionable, ack taking effect, the three shapes of URL→path, and the two `''` sentinel cases. Several real injections were also done: change 1 blob + add 2 new pages + add 1 `docs/wiki/` page → 2 to handle / 1 advisory, with `docs/wiki/` correctly ignored; on the en side a temporary Chinese page was actually dropped in → `[new] … 25 characters`, and after deleting it the run went back to idle with the clone left clean.

### The output contract of the monitor

```txt
idle                      → do not wake the agent
<path>\t<kind>\t…         → inject into the prompt
ERROR <reason>            → an explicit failure, never disguised as idle
```

Three guards: `cursor-not-seeded` (the cursor file is missing), `suspicious-volume` (the cursor has been emptied down to a few entries — so that one mistaken ingest cannot flood the prompt), and `MAX_ITEMS=30` (a volume ceiling). A single source failing only emits `WARN` and continues (rc=0); only both sources down gives `rc=3`.

### Wiring: four jobs and one timeline

| job | Change | Evidence |
|---|---|---|
| `1a35ce6480fe` **RSS News Scan** (formerly Blogwatcher) | dropped Step 0 (mirror sync), dropped Step 6 (cross-check), dropped the "Wiki update discipline" section; Step 1 fixed as `proxy-latency-check 5`; added a "briefing structure (fixed)" section; skills changed from `vuepress-wiki-integration + llm-wiki` (76 KB) to `rss-feed-monitoring + agent-reach-weibo-fetch` (44 KB) | prompt 8,143 → 5,694 → **4,644** characters; of the three names `fetch-wiki-mirror` / `blog-change-detector` / `wiki-ingest.sh`, not one is left |
| `88f4438fe179` **Wiki Mirror Sync** (new) | silent wrapper `wiki-mirror-quiet.sh` (zero output on success, the full log plus exit 1 on failure), and `timeout 180` also keeps it from colliding with 06:50 | `hermes cron run` measured `succeeded`, `stdout_bytes=0` |
| `60c0fa9fb699` **Wiki Ingest Sync** (new) | standalone ingest: detector → `blog-article.py` → write `~/.hermes/wiki/` → manifest → `wiki-ingest.sh` → `ack` **after a successful push**; step 4 inserts the lint script as a hard gate | a dry run gives `Status: no_change`, `monitor_last_output = idle`, `next_run 2026-11-07 06:50` |
| `a28fbd4255a2` **EN Translation Sync** | monitor swapped for `blog-en-monitor.py` (multi-source RSS side-check + `WARN` surfaced), the prompt only changed on the inventory-format line | `monitor_state` hash unchanged (old and new both output `idle`, so no spurious wake) |

Two details from that are worth writing down:

- **The body has to come through the contents API**: `raw.githubusercontent` intermittently returns HTTP 000 for CJK filenames; `gh api … | base64 -d` counts as pipe-to-interpreter, which in an unattended cron sits in `pending_approval`. Hence `blog-article.py` (79 lines).
- **The lint gate really does block a push**: a temporary mirror was built holding a single `[[../concepts/Does-Not-Exist.md]]`, and `wiki-lint.sh` returned `rc=1` with `broken_link` and `missing_from_index` among the criticals; on the real mirror it is `rc=0`, 40 pages, empty criticals, and everyday ingest is not blocked.

> **Lesson 3**: the failure mode of an unattended pipeline is not "it reports an error", it is "nothing happened". Three potholes from the same family were caught this time: `fetch` only touching `FETCH_HEAD`, `rev-parse` without `--verify` returning a literal, and a monitor that does not wake the agent when its output is unchanged. **What they have in common is that every exit code is 0.** The only criterion is "did the state actually advance", and every monitor must have an output that appears only on failure (`ERROR`/`WARN`) — it cannot have `idle` as its only silence.

---

## Phase 6: link syntax and knowledge-base coverage

After the detection layer was wired in, testing it turned up some problems on the wiki side along the way. So the next two pieces of work are both on the wiki side, and neither is "writing new content".

### One: 202 links you cannot click

The state of things: 38 pages under `~/.hermes/wiki/` hold **202** `[[…]]` occurrences in a home-made hybrid syntax, for example:

```txt
[[./sources/JavaScript.md]] — notes on the JavaScript language core and the Web API
```

Three measured pieces of evidence say it buys nothing on this site:

| Check | Result |
|---|---|
| The deployed page's HTML | still 3 `[[../concepts/…md]]` as **plain text**, and zero `<a>` pointing at sources |
| An ordinary md link on another page of the same site | rendered by VuePress as `<a class="route-link" href="…html">`, **clickable as normal** |
| Whether `~/.hermes/wiki/` is an Obsidian vault | no, there is no `.obsidian/`, so not even backlink/graph payoffs are available |

So what renders is **ordinary md links**, and what does not render is exactly `[[ ]]`; the label also sits outside the brackets, so it is not even Obsidian's `[[path|alias]]`. On the agent side the two forms are perfectly equivalent (both are deterministic, greppable paths, and the lint script parses both), so swapping them costs no capability; the only price is that the lint script only scans `[[ ]]` when counting orphans and dead links, so `wiki-lint.sh` needs changing too.

::: info Why it was written this way
When I defined that `wiki` in the first place, I hoped it would later plug into an `Obsidian vault`, so the template used that format. Later I realised I had never had the habit of using an `Obsidian vault` at all, only the habit of writing a blog… so the format was never carried any further, and it can be regarded as a leftover from the so-called "founding period"…
:::

| Result | Count |
|---|---|
| `[[path]] — label` turned into `[label]` pointing at `path.md` | 199 (145 using the text after the dash, 1 written with the "alias" form, 53 switched to the target page's `title:`) |
| Links pointing at a page that was never created → downgraded to plain text | 4 (`defineProperty`, data reactivity, custom message interfaces, reliable data transfer) |
| `[[…]]` inside backticks in `log.md` kept | 3 (they are error quotes from back then, not links) |

Here, **the migration order is the invariant**: change the lint regex first → then change the 202 occurrences → change the template last. Do it the other way round and there is a stretch in between where "the dead-link check is silently dead".

PR **#77** (38 files / +206 −198) handles the content, PR **#78** (`AGENTS.md` / +16 −8) handles the source — **the template was the root cause of the deviation**: `related:` demonstrated `- "[[../concepts/xxx]]"`, and the index template demonstrated `[[./sources/X.js]] — …`. At the same time lint gained a `legacy_wikilink` warning: anybody writing `[[…]]` again gets reported. That rule had only ever been written in the docs with nobody checking it, which is precisely why it kept coming back.

### Two: an audit of "did we actually lose data"

After the merge the user wanted to confirm those 4 links that had been flattened to text, and from there worried that "wiki data was lost in the founding period", so a full-site walk was done.

**Conclusion: no original data was lost.** 22 topics have no page, but all the raw notes are still in the repo; two of them are tucked away in a directory `README.md` (computer organisation 8.7 KB, automatic control theory 3.4 KB), so a glance at the file-name list misjudges them as missing. The real problem is that **the wiki only ever built the 26 pages listed in `index.md`**; `sources/*.md` describes 22 topics with no matching pages, and across the TypeScript / computer organisation / control theory domains there is not a single concept page. So in fact **they were never built in the first place…**

| Stage | Content | Scale |
|---|---|---|
| **A** (4 pages) | turn the 4 plain-text items back into clickable links: reliable data transfer / `defineProperty` / data reactivity / custom message interfaces | PR **#79** · 12 files / +531 −5 |
| **B** (references only) | 57 `related:` entries changed from `docs/wiki/…` to in-page relative paths + 2 path-level corrections + 3 places where `../../../postMortem/` climbed one level too many | PR **#80** · 22 files / +69 −62 |
| **C** (18 pages) | computer networks 7, JavaScript 2, Vue 3, ROS2 1, TypeScript 3, computer organisation 1, control theory 1 | PR **#81** · 32 files / +2,060 −6 |

Stage C also corrected two distortions in the audit list itself — which is more worth recording than the 18 extra pages:

- `sources/JavaScript.md` had labelled a short note on "simple memory" as memoization-related, but Hermes Agent confirmed the actual content is scattered code-related jottings on var/let, strict mode and eval, and **there are no memoization notes in the repo at all**;
- `sources/TypeScript.md` says "interfaces and generics / advanced types / decorators / comprehensive application", while the actual content is "compiler options / webpack+Babel / OOP part one / OOP part two" — **decorators and advanced types are not among the records**.

In other words: **the audit list itself lies too**, because it inherits whatever was misread at ingest time. For any "fill in the gaps" task, the first step, taken at the same moment as reading the audit list, should be to go back to the raw material and check the list once.

---

## Phase 7: three checks that lied, and splitting one page

### bug

After the repairs above, the user found three lint bugs reported by `wiki-lint.sh`, whose common trait is: **they are not plain "errors", but in a certain sense "non-reports".**

#### bug 1: `index.md` is not counted as an inbound link, so two of the orphans are fake

The orphan count only walks `pages` (concepts / entities / sources), and `index.md` is not in that set. So even though `sources/Computer_Composition.md` and `sources/Control_Theory.md` are plainly listed under Sources on the home page, they sat in the orphan list the whole time.

The fix: count `index.md`'s outbound links towards `inbound` as well (still skipping inline code and self-links). In passing, PR **#82** adds one line each to `Machine numbers and IEEE-754` and `S-Z transform table` — a "knowledge source → source overview page" pointer — so the two pages link to each other.

#### bug 2: a bracket inside the label, and the whole link disappears

A label of the form `[function formal parameters and actual parameters [supplement]](…)` breaks the link parsing in Markdown, and the consequence is that the entry is judged `missing_from_index` (which looks like "not in the index" but is really "the link was never recognised at all").

The fix: change the label text and the count goes to zero.

#### bug 3: `stem` used as the key, so five entity pages were never checked

This is the most serious one. The lint collected pages like this:

```python
for sub in ("entities", "concepts", "sources", "queries", "comparisons"):
    for f in sorted((WIKI / sub).iterdir()):
        if f.suffix == ".md":
            pages[f.stem] = f      # the key is "JavaScript"
```

`entities/JavaScript.md` and `sources/JavaScript.md` both have the stem `JavaScript` and **write into the same key one after the other**; in the loop order entities comes first and sources third, so `sources/X.md` always writes last and always wins, while `entities/X.md` simply vanishes from `pages`. This site happens to have five such same-name domains — JavaScript, Vue, ROS2, TypeScript, Computer_Network — so part of the content of all five vanished into the void…

The consequence is not "a slightly lower count": those five files **take part in no check at all**:

| Check | Consequence |
|---|---|
| Dead links | a bad link inside an entity page is never reported |
| `missing_from_index` | it is not in the index and that is not reported either |
| frontmatter / page size / stale date | never checked |
| Inbound-link count | the pages it links out to get no inbound credit and may be falsely reported as orphans |
| `total_pages` | reported 64, actual 69 |

**The hardest evidence**: those 4 dead links at migration time sat in `entities/Computer_Network.md`, `entities/JavaScript.md`, `entities/ROS2.md` and `entities/Vue.md` respectively — all four inside entity pages that had been swallowed. So lint went on happily reporting "critical 0" for months.

The fix was three separate things:

1. key `pages` by relative path;
2. build a separate `stem -> [paths]` map purely for link resolution (links were always resolved by filename);
3. stop silently picking one of a same-name pair, and emit a `stem_collision` info instead.

After the fix the numbers get worse, which is correct:

| Metric | Before | After |
|---|---|---|
| `total_pages` | 64 (under-reporting by 5) | **69** (entities 9 / concepts 51 / sources 9) |
| `partial_frontmatter` | 23 | **28** |
| `stale` | 26 | **29** |
| `critical` | 0 | 0 |

The extra 5 partials and 3 stales are all those five entity pages — they are not newly appeared problems, they are **being seen for the first time**.

### Page splitting: by semantic seam, not by line count

In what `wiki-lint.sh` returned, the user noticed a few files flagged `oversized_page`. A few of the larger triggers come up here:

First example: `concepts/Mihomo-Proxy-GSLB-Drift-Subscription-Auto-Update.md` at 247 lines tripped `oversized_page` (>200 lines, warning level), so it needed splitting. For that file, though, the split is not a crude cut down the middle:

| Page | Before | After | How it was cut |
|---|---|---|---|
| `Mihomo-Proxy-GSLB-Drift-Subscription-Auto-Update.md` | 247 lines | 132 lines | keeps the core conclusion, root cause, option selection, the three-layer architecture, the URLTest group, cron, pitfalls, verification, experience |
| `Mihomo-IP-Pool-Drift-Diagnosis.md` (new) | — | 173 lines | takes the five-step quick check + the full evidence for Steps 1-4 + the bootstrap-failure interlude + the 5 pitfalls |

Second example: `AI-Daily-Briefing-Brotli-Fix-Investigation` 182 lines → 78 lines plus a new page `Brotli-Stream-Truncation-Root-Cause` at 129 lines (the five layers stacked, the second-by-second timeline, the guard source in `brotlicffi._decompress()`, the `Content-Encoding` comparison across four providers).

And the other two pages originally listed as "worth splitting" were **re-judged as no split** after reading them in full:

- `LeanCloud-to-Neon-Migration` at 181 lines: the bulk comes from a ~65-line conversion script that has to be inline, and moving it away would make the reader jump between two pages. Its disease is "a long code block", not "process and conclusion mixed together".
- `Ubuntu-gdm3-Disk-Full-Troubleshooting` at 140 lines: the 8 emergency steps and the 7 steps of the root fix are meant to be read in one go; cutting them apart is tearing an operations manual in half.

> **Lesson 4**: page length is a **signal**, not a criterion. The real criterion is "is there a seam here: after the cut, do both pages stand on their own". Getting it wrong costs you link inflation — wiki goes from 63 pages to 85+, half of them fragments cut by hand, which makes retrieval harder rather than easier.
---

## Phase 8: the argument over the standard, and the wrap-up

The last step was filling in frontmatter for 28 pages. Once that was done, Hermes Agent noticed that the project's `AGENTS.md` and the lint rules disagreed:

```txt
AGENTS.md lines 197, 201: sources and created are optional
wiki-lint.sh            : fm_required = {title, created, updated, type, tags, sources}  all six required
```

At first Hermes Agent's judgement was that "the checker is stricter than the project spec": 15 of the 28 pages (7 entities + 8 source aggregation pages) were not really a problem; and the `sources` of an aggregation page cannot be force-filled — `sources` means "which notes this page was distilled from", and one ROS2 directory holds 131 notes, so cobbling together a list could only be fabrication. So Hermes changed lint to "the six basics, plus `sources` only required for `type: concept`", and only filled in `sources` for the 4 concept pages, `created` for all 28, and `updated` for 5 (skipping the two commits for the link migration and the `related:` reshuffle — they touched every file on the site, and using them as a date would stamp today's seal on every page).

The user's clarification turned the causality around:

> **User:** treating all six as required was only defined afterwards; during the founding period (April to May this year, that is) that much had not been considered, and it was only really put in place later. This change is actually fine as it stands: posts added later need to follow it, and the earlier ones stay as they are.

In other words: **the checker is not too strict; the docs are old and the code is right.** So Hermes Agent wrapped up by changing two pieces of local documentation and leaving the code alone:

- `SKILL.md`: from "lint is stricter than the repo spec and should be made to fall back to the spec" to "the six-item standard was defined later; those two lines in `AGENTS.md` are lagging documentation, do not change lint to humour them", and it spells out three things: new pages must have all six; old pages are not back-edited; `source`/`entity` aggregation pages are exempt from `sources`.
- the title of that section in the blog post changed from "lint is stricter than the repo's own spec" to "the standard was set later and the docs did not follow", and the lesson from "trust the spec first" to "first ask which side is later".

One trace to declare: the record already merged into `log.md` still says "the drift in standards where lint is stricter than the schema", and per the "stop changing things" instruction it was not re-edited. The wording is imprecise, but it is already in history.

---

## Deep technical analysis

### 1. The four invariants of the detection layer

```txt
① a single reader, many consumers: the detector only "lists the paths that changed + kind", it never writes
② each keeps its own cursor: whoever's write succeeded advances its own cursor, and only then
③ act and advisory are separated: for wiki only new is actionable, modified/deleted are advisory; en's deleted is report-only
④ failure does not advance: a non-zero exit → no ack, no state advance → the same page is retried next round
```

Item ④ is the foundation the whole design stands on. Its opposite is called "acking early" — which loses articles permanently: **better to report the same thing twice than to silently drop a page**. This one went into the job prompt as a hard rule, not just into the docs.

### 2. Three silent failures and how to tell

| Symptom | Root cause | Criterion | Fix |
|---|---|---|---|
| forever `idle` | `git fetch` only updates `FETCH_HEAD`, the worktree does not move | print HEAD before/after and see whether it follows master | after the fetch, `reset --hard FETCH_HEAD` + `clean -qfd docs/en` |
| `unknown revision: FETCH_HEAD` | `rev-parse` without `--verify` puts the literal on stdout when it fails | point the remote at a path that does not exist and see whether it tracebacks | `--verify --quiet` + a SHA regex double check + a degrading `WARN` |
| the monitor is always quiet | the output is byte-identical to last time → no wake | manufacture one change by hand and see whether an inventory comes out | `ERROR`/`WARN` must be part of the output contract |

### 3. What the gate can stop, and what it cannot

```txt
can deterministically stop:
  YAML parse failure / frontmatter keys not matching / heading and fence counts off /
  missing images / dead links / anchors / the container sentence /
  unclosed angle brackets newly introduced by the translation ("the original had no <tag>")

cannot stop:
  theme component misuse, odd syntax at the Vite rendering layer
```

So the branch will never have a green CI light (`Build_and_Deploy` only runs on master), and the real verification is the master build after you merge. That is also why "a failed check means 0 commits": **the gate may let something through, but it must never wave through something it did not verify.**

### 4. Anchors: why they must line up with `slugify`

Heading anchors are the only constraint in translation that **spans both trees** — a `#fragment` in an en page has to be computed from that en page's own headings. Calibrating by measurement (scraping 12 live `id=` values) solves individual cases, but batching requires an algorithm. Running `@mdit-vue/shared` over 1,255 headings across the site with 0 differences from the home-grown implementation means anchors stop being "a manual spot-check item".

### 5. Link resolution: why "being visible" matters more than "being written correctly"

VuePress only renders standard md links as `route-link`; `[[…]]` is plain text. But what actually dragged this problem out for months was not rendering, it was **visibility**:

- lint's orphan / dead-link counting only scans `[[ ]]` → if lint is not changed after the migration, the dead-link check silently dies;
- lint's page table is keyed by stem → same-name files overwrite each other, and the five that got overwritten are exactly the five core domains;
- the template demonstrates the wrong syntax → every ingest writes the old format back.

Stack the three together and you get "the checker has been saying nothing is wrong". **Rules, checker and template must come from the same source; change only one and the other two pull it back.**

### 6. The criterion for splitting a page

```txt
criteria that do not hold: line count, character count, code-block count
criterion that does hold: after cutting along this seam, can both pages answer a question on their own
counter-examples: a migration script that has to be inline (moving it means jumping between pages),
                  an runbook's emergency steps and root fix (meant to be read in one go)
```

### 7. How far the environment pushed the design

| Constraint | Consequence |
|---|---|
| 1.9 GB RAM / 2 cores | a whole-site `docs:build` always OOMs; build verification can only temporarily limit `pagePatterns` to `en/**`, then restore it |
| shallow clone (`--depth 1`, about 78 MB) | `diff old..new` is impossible, only a sha256 manifest works; the edges of `git rev-parse` have to be guarded by hand |
| read-only token | `gh pr create` is unavailable and every PR depends on the upstream Action; so the branch name must fall inside the legal `wiki-ingest-*` regex |
| one push, one commit | you cannot "push a version, then add commits"; you can only assemble and push once |

---

## Conclusions and follow-up suggestions

### Key conclusions

1. **The hard part of a translated blog is not translation, it is decidability.** The glossary, the anchor algorithm, "compare only inside code blocks", whole-sentence matching of the container — once these four things can be judged by a script, 115 pages can run in parallel; only the parts that cannot be judged (register, memes) are left for sampled acceptance.

2. **`✓ everything passed` has to say what it passed.** In the version where the structural check was all green, three classes of crash were still hiding: YAML colons, `Array<type>`, and a lost `\it`. All of them sat in the seam where "the md is legal but the rendering layer disagrees". The gate needs two layers, and it has to say plainly where the second one runs.

3. **The dominant failure mode of an unattended pipeline is "nothing happened".** All three same-family bugs this time (`FETCH_HEAD`, the `rev-parse` literal, an unchanged monitor output) had an exit code of 0. So a monitor must have an output that appears only when something is wrong, and "did the state advance" is the only criterion.

4. **One detector + two consumers is the ceiling for this cron model.** What it buys is not one less schedule but one consistent standard and fault isolation: the briefing can break while ingest still runs, and a translation failure does not touch ingest.

5. **The checker lies too, and lies more thoroughly.** `critical 0` only means something when you know for certain that it can see every page. Stem overwriting, index not counting as inbound, a bracket inside a label — the common trait of the three bugs is "no report", and the stem one meant the pages of five core domains were never checked, while the four dead links happened to live in exactly those pages.

6. **When the spec conflicts, first ask which side is later.** `AGENTS.md` says "optional", lint says "required"; the correct answer is not to make the code fall back to the document but to admit the document lags.

### Leftovers and optional hardening (not implemented)

1. **38 `cross_folder` cases**: cross-directory links from wiki pages back to the blog originals can only be spot-checked by hand; lint counts them but does not verify them.
2. **34 `stale` pages**: the count went up after `updated` was backfilled — they were always old, this is just the first time there was a value to compute from.
3. **5 `stem_collision` entries**: currently info, saying "link resolution by filename is ambiguous"; if a same-name cross-directory link ever points at the wrong page, it needs upgrading to a warning.
4. **`translation_check.py` and `en-sync.py` each implement the rules themselves**: the container sentence, anchors and image paths are written out twice, and changing a standard means changing two places. This is the most drift-prone spot right now.
5. **The `hermes update` class of deadlock that depends on port 7890** (see the proxy diagnosis page: [007-troubleshooting a complete proxy failure on the Hermes Agent server](../deploy/007_Troubleshooting_complete_failure_of_Tencent_Cloud_server_proxies.md)): when the proxy group points at a broken node every HTTPS tool dies together, so all three jobs now put `proxy-latency-check 5` first — but that only picks the best latency, it cannot guarantee availability.

---

## Appendix: index of key objects

| Type | Object | Note |
|---|---|---|
| PR | #72 | translation ① Ros2_Note 44 pages + English navigation (`23da6b5`) |
| PR | #73 | translation ② the rest of learningNote, 44 pages (`5d493e5`, 91 files / +7,670) |
| PR | #74 | translation ③ postMortem 27 pages + about link fix (`af5749d`, 64 files / +7,287) |
| PR | #75 | container broken-link fix (`bdb7dfd`, 3 lines) |
| PR | #77 | link-syntax migration 202 → 199 occurrences (38 files / +206 −198, `bbf0c81`) |
| PR | #78 | `AGENTS.md` template switched to relative paths (+16 −8) |
| PR | #79 | stage A: restore 4 concepts that had been flattened to text (12 files / +531 −5, `8e3badb`) |
| PR | #80 | stage B: unify `related:` paths (22 files / +69 −62, based on master `231651d`) |
| PR | #81 | stage C: 18 missing topics (32 files / +2,060 −6, `fa98cfa`, merged as `5b8c57d`) |
| PR | #82 | orphans to zero (3 files / +9, `34f13d1`, merged as `bd58d23`) |
| PR | #83 | split the mihomo page (4 files / +225 −156, `93caed5`) |
| PR | #84 | split the AI Daily page (4 files / +185 −150, `2acd154`, merged as `f3575b0`) |
| PR | #85 | frontmatter for 28 pages (29 files / +53 −8, `b6f7704`, merged as `b1d616c`) |
| job | `RSS News Scan` | every day 06:35, deliver `discord,feishu`, no gate |
| job | `Wiki Mirror Sync` | every day 06:45, silent (zero output on success) |
| job | `Wiki Ingest Sync` | every day 06:50, monitor `blog-wiki-monitor.py` |
| job | `EN Translation Sync` | every day 07:25, monitor `blog-en-monitor.py` |
| script | `blog-change-detector.py` | the single read layer: `status` / `seed` / `ack` / `verify` |
| script | `blog-wiki-monitor.py` | the wiki gate: `idle` / inventory / `ERROR`, `MAX_ITEMS=30` |
| script | `blog-en-monitor.py` | the en gate: `KINDS=new,modified,missing_en,deleted`, surfaces `WARN` |
| script | `blog-article.py` | fetches the body of CJK paths through the contents API (avoiding raw's HTTP 000 and the pipe approval) |
| script | `en-sync.py` | `bootstrap` / `status` / `finish`; sha256 detection; exit 0/3/4 |
| script | `translation_check.py` | the structural gate: frontmatter / fences / images / maths / residual Chinese / container / anchors / angle brackets |
| script | `wiki-lint.sh` | `inbound` counts index, `link_targets()` handles both syntaxes, `legacy_wikilink`, relative paths as keys |
| data | `glossary.csv` | 162 rows, `locked`/`draft`, **on this machine only** |
| data | `state.json` | the en side's sha256 baseline for 115 pages (`master_sha 9ff79f4`) |
| data | `cursors/wiki.json` | the wiki side's 123 `path→blob` baselines |
| branch | `wiki-ingest-<date>-en` | falls inside `docs.yml`'s legal suffix, opens a PR automatically, does not trigger auto-merge |
| metric | translation | 115 pages / 156,563 characters → ≈97k English words / 868 code blocks / 168 images |
| metric | build | the en subtree 292 pages / 285 html; a whole-site build OOMs (1.9 GB machine) |
| metric | wiki | pages 45 → **69** (entities 9 / concepts 51 / sources 9); critical 0; orphan 6 → 0; partial 24 → 0; oversized 0; `stem_collision` 5 |

::: important
This article was translated by `Hermes Agent`; the original text can be found at [here](../../../postMortem/sp_for_LLM/007_Hermes-Bilingual-Translation-and-Wiki-Pipeline-Decoupling-report.md). The translation is for reference only.
Translation time: 2026-11-09
:::
