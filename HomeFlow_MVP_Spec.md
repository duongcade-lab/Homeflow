# HomeFlow — MVP Product Specification

**Purpose:** Beauty Can Code live demo · **Status:** Spec only (no implementation yet)
**Reference:** `HomeFlow_Beauty_Can_Code_Family4.pptx` · **UI language:** Vietnamese

---

## 1. Product Essence

> **HomeFlow makes invisible family work visible, shared and balanced.**

- **Core idea:** A "family operating system" (hệ điều hành gia đình) — one place to plan, share and track family life, capturing both the work of *doing* and the work of *remembering & coordinating*.
- **Key differentiator:** **Planning Owner ≠ Task Owner**
  - **Planning Owner** = the person who *remembers, plans, prepares, coordinates or reminds* (mental load).
  - **Task Owner** = the person who *executes* the task.
  - HomeFlow records both — so the invisible mental load is finally seen, counted and shareable.
- **Tagline:** *Share the load. Enjoy the moments.*

---

## 2. Pitch Deck Analysis (key takeaways feeding the MVP)

| Deck slide | Message | MVP implication |
|---|---|---|
| 1. Home | "Việc không tên" (unnamed tasks) made visible; Family Load per member (Mẹ 35% / Bố 30% / Bạn lớn 20% / Bạn nhỏ 15%) | Home = Today view + Family Load bars |
| 2. Problem | Work chain: Nhớ → Lên kế hoạch → Chuẩn bị → Nhắc → Theo dõi → Hoàn thành; one person shouldn't remember everything | Show the chain implicitly via Planning Owner labels |
| 3. Solution | 5 pillars: Family Planner, Shared Tasks, Mental Load, Family Balance, Kids' Missions; **Task Owner ≠ Planning Owner** example (Bố đưa con đi khám / Mẹ nhớ, tìm nơi khám, đặt lịch, chuẩn bị giấy tờ) | Dual-owner task card is the hero moment |
| 4. AI | Brain dump → hiểu việc, tạo task, đặt deadline, gợi ý owner, nhắc việc; Smart Rebalance; Weekly Family Brief | Brain Dump screen + AI parse + Rebalance + Brief |
| 5. Impact | Before: "Mẹ nhớ mọi thứ" → After: Visible / Shared / Balanced / Connected | Closing screen mirrors this arc |

**Demo anchor example (from deck, reused as the seed brain dump):**
> "Thứ 7 Bin học tiếng Anh lúc 9h, bố đưa con đi. Chủ nhật sinh nhật bà nên thứ 6 nhớ mua quà."

---

## 3. MVP Scope

**In scope (demo-critical):**
- Home / Today screen with per-member Family Load
- Brain Dump (Tell HomeFlow) — free-text Vietnamese input + example chips
- AI parse → tasks & events with owners and deadlines
- Task/Event card showing **Planning Owner vs Task Owner**
- Family Balance view (workload distribution)
- Smart Rebalance suggestion
- Weekly Family Brief
- Seed data: one realistic Vietnamese family (Mẹ, Bố, Bạn lớn "Bin", Bạn nhỏ)

**Out of scope (post-MVP / optional):**
- Real accounts & multi-user auth, push/SMS/email notifications
- Calendar/Google/Apple integrations, recurring-rule engine
- Mobile apps, offline sync, payments, real backend infra
- Kids' Missions gamification, reward points
- True NLU backend — demo uses a deterministic parser over supported patterns (see §7)
- Full i18n — Vietnamese only

---

## 4. Key Screens (in demo order)

1. **Home / Hôm nay** — today's tasks grouped by status; Family Load bars per member; entry point "Tell HomeFlow".
2. **Brain Dump / Tell HomeFlow** — one big input box, example chips (e.g. the seed sentence), submit.
3. **AI Parse Result** — shows the understood items: events vs tasks, each with owner + deadline; editable before confirming.
4. **Task / Event Detail** — the hero card: **Planning Owner** (🧠) vs **Task Owner** (✅) side by side.
5. **Family Balance / Cân bằng gia đình** — workload distribution across members, before/after rebalance.
6. **Smart Rebalance** — detects imbalance, proposes shifting an owner (e.g. "Gợi ý: Bố nhận mua quà sinh nhật bà").
7. **Weekly Family Brief / Bản tin tuần** — summary: việc đã xong, việc còn lại, điều cần nhớ tuần tới.

Closing state mirrors the Impact slide: *"Từ 'Mẹ nhớ mọi thứ' đến 'Cả nhà cùng chia sẻ'"*.

---

## 5. Demo Journey (script)

1. **Home** — show today's load; Mẹ is overloaded (high planning load). Tap **"Tell HomeFlow"**.
2. **Brain Dump** — type/pick the seed sentence (or a variant).
3. **AI understands** — spinner → parsed items appear.
4. **Creates tasks/events** — confirmed list, e.g.:
   - 📅 *Thứ 7, 9:00 — Bin học tiếng Anh* (Task Owner: Bố — đưa con đi; Planning Owner: Mẹ — nhớ lịch, chuẩn bị)
   - ✅ *Thứ 6 — Mua quà sinh nhật bà* (Task Owner: Bố; Planning Owner: Mẹ)
   - 🎂 *Chủ nhật — Sinh nhật bà* (Cả nhà)
5. **Planning vs Task Owner** — open one card; highlight the difference explicitly.
6. **Family Balance** — Mẹ's load jumps further; imbalance highlighted.
7. **Smart Rebalance** — tap suggestion; Bố picks up "Mua quà"; bars re-animate, Mẹ's load drops.
8. **Weekly Family Brief** — auto-generated summary closes the loop.

Target: ~5 minutes, zero manual data entry beyond the one sentence.

---

## 6. Essential vs Optional

**Essential (must ship for the demo):**
- Home/Today + Family Load
- Brain Dump + deterministic AI parse (supports the seed sentence + 2–3 variants)
- Dual-owner task card
- Family Balance + Smart Rebalance (with visible before/after)
- Weekly Family Brief
- Seed family data + editable parse results (safety net if AI "misunderstands")

**Optional / nice-to-have (skip if time is tight):**
- Month calendar view, Kids' Missions, notifications UI mock, task completion animation, multi-family switching, edit/delete flows, dark mode.

---

## 7. Concept Gaps & Inconsistencies (found in the deck)

1. **Group ownership ("Cả nhà")** — deck assigns birthday prep to "Cả nhà" but the dual-owner model assumes individuals. → Rule: "Cả nhà" is a valid Task Owner meaning *shared execution*; Planning Owner stays a single person.
2. **Who is Planning Owner by default?** — not stated. → Rule: the person who *mentions/remembers* the item is the default Planning Owner; the AI suggests the Task Owner; both editable.
3. **Reminder day vs event day** — "thứ 6 nhớ mua quà" (reminder/deadline) vs "chủ nhật sinh nhật bà" (event). The data model must keep them separate or the parse looks wrong.
4. **Family Load formula** — 35/30/20/15 appears unexplained. → Demo rule: load = Σ(planning-weight × planning tasks + execution-weight × task tasks), with planning weighted higher (e.g. 2×) so Mẹ's mental load is visible. Document it in-app ("Cách tính" tooltip) for credibility.
5. **Rebalance trigger & action** — undefined. → Rule: trigger when a member's load exceeds the average by ≥15%; action = suggest reassigning *one task owner* (never planning owner, to respect the differentiator) + rationale text.
6. **Terminology drift** — "Family Load" (slide 1) vs "Family Balance" (slides 3–4). → Unify: metric = **Gánh nặng gia đình** (Family Load), screen = **Cân bằng gia đình** (Family Balance).
7. **Mental Load pillar** — named in the deck but absent from the demo journey. → Keep it implicit: it *is* the Planning Owner label. Do not build a separate screen.
8. **AI robustness** — arbitrary Vietnamese input will fail. → Constrain: parse a small grammar (day-of-week, time, "nhớ", "đưa", "sinh nhật"); unknown input falls back to a friendly message + manual form. Never crash mid-demo.

---

## 8. Data Model Sketch (for the next step)

```
Member    { id, name, avatar, color }
Item      { id, kind: task|event, title, date, deadline?, status,
            planningOwnerId, taskOwnerIds[] (may include "ca_nha"),
            category, sourceSentence }
FamilyLoad{ memberId, loadScore }          // derived, weighted
RebalanceSuggestion { fromMember, toMember, itemId, reason }
Brief     { weekStart, done[], pending[], reminders[] }  // derived
```

Seed family: Mẹ (Lan), Bố (Minh), Bạn lớn (Bin), Bạn nhỏ (Su).

---

## 9. Demo Success Criteria

- Runs start-to-finish in ≤5 minutes with one typed sentence.
- Every screen is Vietnamese; dual-owner concept visible on ≥1 card.
- Rebalance visibly lowers Mẹ's load (before/after bars).
- Weekly Brief is generated from the demo's own data (not hardcoded text).
- No crashes on the supported inputs; graceful fallback otherwise.