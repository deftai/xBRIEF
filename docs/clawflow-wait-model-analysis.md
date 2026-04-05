# ClawFlow Wait Model Analysis: Tasks as Wait Handles

**Question:** Can most or all of the `setWaiting` typed-reason requirement be resolved by using specific tasks for approval, callback, and upstream waits, rather than extending `setWaiting` itself?

**Answer:** Yes — and this is the cleaner model. Each wait category maps onto the existing task model without requiring any changes to `setWaiting`.

---

## Background

The vBRIEF Workflow Profile defines four categories of wait state for a running workflow:

| Category | Description |
|---|---|
| **task** | Waiting for a ClawFlow task to finish executing |
| **approval** | A human decision gate — no task exists yet |
| **callback** | Waiting for an inbound external event (webhook, payment confirmation, etc.) |
| **upstream** | A merge node waiting for multiple parallel branches to converge |

An earlier draft of this analysis proposed extending `setWaiting` to carry a typed reason struct so the runtime could distinguish these cases. That turned out to be unnecessary.

---

## How each category maps to the existing model

### Task waits — already handled

`setWaiting(taskId)` already persists waiting state linked to a task ID. The authoring layer calls `runTaskInFlow`, gets a task ID back, and calls `setWaiting(taskId)`. When the task completes, the flow resumes. No changes needed.

### Approval waits — handled via placeholder task

The authoring layer creates a placeholder task via `runTaskInFlow` to represent the approval gate. It then calls `setWaiting(approvalTaskId)`. When the human submits their decision, an external caller marks the task complete, and the flow resumes.

`setWaiting` needs no changes. The task *is* the semantic handle for the approval.

### Callback waits — handled via placeholder task

Same pattern as approvals. The authoring layer creates a placeholder task representing "waiting for external event X", calls `setWaiting(callbackTaskId)`. When the inbound event fires (webhook, message, etc.), the callback handler marks the task complete.

`setWaiting` needs no changes.

### Upstream / merge waits — no `setWaiting` call needed

A merge node waits for multiple parallel branches to converge before executing. The authoring layer already controls execution order — it simply does not call `runTaskInFlow` for the merge node until all prerequisite tasks have completed. The "wait" is implicit in the compiler's control flow, not a runtime state that ClawFlow needs to track.

No `setWaiting` call is needed for this category at all.

---

## Summary

```
wait kind      setWaiting needed?   how resolved
-----------    ------------------   ------------------------------------------
task           yes                  existing behavior, no change
approval       yes                  placeholder task + setWaiting(taskId)
callback       yes                  placeholder task + setWaiting(taskId)
upstream       no                   authoring layer controls execution ordering
```

`setWaiting` needs no extension. The existing mechanism handles all four categories when approval and callback waits are modelled as placeholder tasks.

---

## The one remaining question: external task completion

For approval and callback waits to work via placeholder tasks, those tasks must be completable by an external caller — not just by ClawFlow's internal execution pipeline.

**If ClawFlow tasks already support external completion** (i.e. a task can be created in a pending state and resolved via an API call from an outside handler), this entire analysis costs zero ClawFlow changes.

**If they do not**, a lightweight external-completion hook is needed at the task layer — something like a `completeTask(taskId, result)` method callable by a webhook handler or approval callback. This is a smaller and more naturally reusable addition than extending `setWaiting`, and it is useful on its own merits beyond the vBRIEF use case.

---

## Impact on the surgical changes list

This analysis reduces the originally identified `setWaiting` typed-reason change to a conditional:

| Change | Status |
|---|---|
| Typed wait reasons in `setWaiting` | **Dropped** — not needed; task model covers all cases |
| External task completion hook | **Conditional** — only needed if not already supported |
| `cancel` encapsulation on `BoundFlowRuntime` | **Required** |
| Child-flow linkage for sub-workflows | **Required** |

See [clawflow-vbrief-execution-opportunity.md](clawflow-vbrief-execution-opportunity.md) for the full context.
