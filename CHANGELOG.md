# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

---

## [Unreleased]

---

## [0.7.0] — 2026-06-26

### Changed
- **Project renamed from vBRIEF to xBRIEF** — all filenames, directory names, imports,
  class names, and documentation updated throughout the codebase.
- **Version alignment** — Python (`libxbrief`), TypeScript (`libxbrief-ts`), and the
  xBRIEF spec format are now all versioned at `0.7` / `0.7.0`.
- Python library version bumped `0.2.0` → `0.7.0`.
- TypeScript library version bumped `0.1.0` → `0.7.0`.
- xBRIEF spec format version bumped `0.5`/`0.6` → `0.7` in schemas, builder, validator,
  examples, and test fixtures.
- GitHub repository renamed `deftai/vBRIEF` → `deftai/xBRIEF`.

### Added
- `schemas/xbrief-core-0.7.schema.json` — versioned JSON Schema for xBRIEF v0.7 documents.

---

## [0.2.0] — 2026-04-02

### Added
- **Builder API** (`libxbrief/builder.py`) — `PlanBuilder`, `ItemBuilder`, `quick_todo()`,
  and `from_items()` for programmatic document construction.
- **`PlanItem` factory class methods** — `pending`, `running`, `completed`, `blocked`,
  `cancelled`, `draft` on `PlanItem`.
- **xBRIEF v0.6 schema** (`schemas/xbrief-core-0.6.schema.json`) — adds `items` as the
  preferred nested field, retains `subItems` as a deprecated alias, and extends the
  status enum with `failed`.
- **TypeScript library** (`libxbrief-ts`) — idiomatic TypeScript port covering models,
  builder, validation, IO, and DAG support with full Vitest test coverage.
- Taskfile targets: `ts:build`, `ts:test`, `ts:lint`, `ts:typecheck`, `ts:coverage`,
  `ts:install`, `python:test`, `python:coverage`.

### Fixed
- `fix(schema)`: expanded `XBriefReference.type` to accept any `x-xbrief/*` pattern
  rather than a fixed enum.

---

## [0.1.0] — 2026-02-03

### Added
- Initial Python implementation (`libxbrief`) with core models (`XBriefDocument`, `Plan`,
  `PlanItem`), JSON/TRON serialization, validation, DAG support, and IO utilities.
- xBRIEF v0.5 JSON Schema (`schemas/xbrief-core.schema.json`).
- Example documents covering plans, Gantt charts, DAGs, and retrospectives.
- `docs/` with specification, guide, migration reference, and TRON encoding docs.
- Taskfile with `test`, `lint`, `fmt`, and `validate` targets.

---

[Unreleased]: https://github.com/deftai/xBRIEF/compare/HEAD...HEAD
[0.7.0]: https://github.com/deftai/xBRIEF/compare/v0.1.0...HEAD
[0.2.0]: https://github.com/deftai/xBRIEF/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/deftai/xBRIEF/releases/tag/v0.1.0
