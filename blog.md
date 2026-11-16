# Address Book — Software Engineering Assignment Blog

## 1. Info

| Item | Content |
|------|---------|
| Course for This Assignment | Software Engineering (FZU–MU) |
| Team Name | BOJT |
| Assignment Requirements | A web address book: polished UI (10), favorite contacts (25), multiple contact methods (10), Excel import/export (25), optional cloud deployment (+15). Deliverables are the code on GitHub plus this blog. |
| Objectives of This Assignment | Practice the XP workflow and git collaboration, and take a small frontend app from design to a running, deployed result |
| Other References | SheetJS documentation, MDN Web Docs |

## 2. Table of Contents

- [1. Info](#1-info)
- [3. Project Link](#3-project-link)
- [4. Commits](#4-commits)
- [5. Implementation](#5-implementation)
- [6. Screenshots](#6-screenshots)
- [7. Demo Video](#7-demo-video)
- [8. Division of Work](#8-division-of-work)
- [9. Contribution](#9-contribution)
- [10. Problems and Solutions](#10-problems-and-solutions)
- [11. PSP Table](#11-psp-table)

## 3. Project Link

- Repo: https://github.com/zhangjt123/address-book
- Live: https://zhangjt123.github.io/address-book/

## 4. Commits

【screenshot of the commit history on GitHub】

The work was committed in five stages, from the project skeleton through to documentation:

1. `feat: initialize project structure and page skeleton`
2. `feat: implement contact CRUD and bookmark feature`
3. `feat: support multiple contact methods and Excel import/export`
4. `style: polish page styles and improve documentation`
5. `docs: translate README and blog template to English`

## 5. Implementation

I went with a pure frontend approach because it covers every requirement without needing a backend. HTML/CSS handle the UI, vanilla JS handles the logic, `localStorage` keeps the data, and SheetJS does the Excel work. The code is split into five small modules so each feature lives in its own file.

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

**Excel export.** I flatten the contacts into rows: first column is the name, second is the favorite flag, and the rest are contact method types collected dynamically. One person per row, one type per column, multiple values joined with `、`. Then `XLSX.writeFile` triggers the download.

**Excel import.** The file is read with `FileReader`, parsed with `XLSX.read`, and turned into a two-dimensional array. The header row decides the meaning of each column: `姓名` for name, an optional `收藏` for the flag, and everything else becomes a method type. Cells holding several values get split and appended.

## 6. Screenshots

- Main list view

  ![main list](images/01-main.png)

- Favorites filter

  ![favorites](images/02-favorites.png)

- Add/edit modal with multiple methods

  ![modal](images/03-modal.png)

- Exported Excel file / import result

  ![excel](images/04-excel.png)

## 7. Demo Video

- Watch online: https://cdn.jsdelivr.net/gh/zhangjt123/address-book@main/demo/demo_small.mp4
- Source on GitHub: https://github.com/zhangjt123/address-book/blob/main/demo/demo_small.mp4

## 8. Division of Work

| Member | Work |
|--------|------|
| 【your name】 | UI, favorites, multiple contact methods, Excel import/export, deploy, blog |
| 【teammate name】 | — |

## 9. Contribution

| Member | Share |
|--------|-------|
| 【your name】 | 100% |
| 【teammate name】 | — |

## 10. Problems and Solutions

- **Mapping multiple values to "one column per type".** Export joins same-type values with `、`, import splits them back, so a round trip loses nothing.
- **localStorage edge cases.** Every read is wrapped in a try-catch so corrupted data falls back to an empty list instead of crashing the page.
- **GitHub being slow to reach from the local network.** Used an accelerator and retried; once the connection stabilized, the push went through.

## 11. PSP Table

| Phase | Estimated (min) | Actual (min) |
|-------|-----------------|--------------|
| Planning | 40 | 35 |
| Requirements | 60 | 55 |
| Design | 80 | 90 |
| Coding | 300 | 330 |
| Testing | 100 | 90 |
| Blog | 140 | 120 |
| **Total** | **720** | **720** |
