# Address Book — Software Engineering Assignment Blog

> Fill in the bracketed parts, drop in screenshots, and record real PSP times before you publish. Don't leave it to the last minute — the blog needs review time.

## 1. Info

| Item | Content |
|------|---------|
| Course for This Assignment | Software Engineering (FZU–MU) |
| Team Name | 【team name】 |
| Assignment Requirements | A web address book: polished UI (10), favorite contacts (25), multiple contact methods (10), Excel import/export (25), optional cloud deployment (+15). Deliverables are the code on GitHub plus this blog. |
| Objectives of This Assignment | Practice the XP workflow and git collaboration, and take a small frontend app from design to a running, deployed result |
| Other References | SheetJS documentation, MDN Web Docs |

## 2. Table of Contents

- [1. Info](#1-info)
- [3. Project Link](#3-project-link)
- [4. Commits and Contributions](#4-commits-and-contributions)
- [5. Implementation](#5-implementation)
- [6. Screenshots](#6-screenshots)
- [7. Demo Video](#7-demo-video)
- [8. Division of Work](#8-division-of-work)
- [9. Contribution](#9-contribution)
- [10. Problems and Solutions](#10-problems-and-solutions)
- [11. PSP Tables](#11-psp-tables)

## 3. Project Link

- Repo: https://github.com/zhangjt123/address-book
- Live: https://zhangjt123.github.io/address-book/

## 4. Commits and Contributions

【commit history screenshot】

| Member | Commits | Notes |
|--------|---------|-------|
| 【A】 | 【n】 | 【modules they worked on】 |
| 【B】 | 【m】 | 【modules they worked on】 |

## 5. Implementation

We went with a pure frontend approach because it covers every requirement without needing a backend. HTML/CSS handle the UI, vanilla JS handles the logic, `localStorage` keeps the data, and SheetJS does the Excel work. The code is split into five small modules so each feature lives in its own file.

Each contact is stored as:

```js
{
  id: "…",
  name: "…",
  isBookmark: false,
  methods: [ { type: "电话", value: "138…" }, … ]
}
```

Using a `methods` array instead of fixed phone/email fields is what makes multiple contact methods work — a person can have as many entries as they need, each with its own type and value.

**Bookmarking.** The star on each card toggles `isBookmark` and saves right away. The "All / Favorites" tabs are just a filter on that flag.

**Excel export.** We flatten the contacts into rows: first column is the name, second is the favorite flag, and the rest are contact method types collected dynamically. One person per row, one type per column, multiple values joined with `、`. Then `XLSX.writeFile` triggers the download.

**Excel import.** The file is read with `FileReader`, parsed with `XLSX.read`, and turned into a two-dimensional array. The header row decides the meaning of each column: `姓名` for name, an optional `收藏` for the flag, and everything else becomes a method type. Cells holding several values get split and appended.

## 6. Screenshots

- Main list view
- Favorites filter
- Add/edit modal with multiple methods
- Exported Excel file / import result

【insert a screenshot under each, with a one-line caption】

## 7. Demo Video

【upload the recording and paste the link here, with a short note on what it shows】

## 8. Division of Work

| Member | Work |
|--------|------|
| 【A】 | 【e.g. UI + favorites + blog】 |
| 【B】 | 【e.g. multi-method + Excel + deploy】 |

## 9. Contribution

| Member | Share |
|--------|-------|
| 【A】 | 【50】% |
| 【B】 | 【50】% |

## 10. Problems and Solutions

- **Merge conflicts when two people touch the same file.** We agreed on branch and commit conventions (`feat:`, `fix:`) and kept to separate module files, which cut the conflicts down a lot.
- **Fitting multiple values into "one column per type".** Export joins same-type values with `、`, import splits them back, so a round trip loses nothing.
- **localStorage edge cases.** Every read is wrapped in a try-catch so corrupted data falls back to an empty list instead of crashing the page.

【add anything else you actually ran into】

## 11. PSP Tables

### 【A】

| Phase | Estimated (min) | Actual (min) |
|-------|-----------------|--------------|
| Planning | | |
| Requirements | | |
| Design | | |
| Coding | | |
| Testing | | |
| Blog | | |
| Total | | |

### 【B】

| Phase | Estimated (min) | Actual (min) |
|-------|-----------------|--------------|
| Planning | | |
| Requirements | | |
| Design | | |
| Coding | | |
| Testing | | |
| Blog | | |
| Total | | |
