# Address Book

A web address book for the Software Engineering (FZU–MU) extreme programming assignment. Open `index.html` and it runs.

## Features

- Contact CRUD, plus keyword search across names and contact details
- Favorite/bookmark contacts, with an "All / Favorites" filter tab
- Multiple contact methods per person (phone, email, WeChat, address, …)
- Excel import/export

## Tech

- HTML + CSS, handwritten
- Vanilla JS, split into small IIFE modules
- `localStorage` for persistence
- [SheetJS](https://sheetjs.com/) (CDN) for Excel

## Structure

```
address-book/
├── index.html
├── css/style.css
└── js/
    ├── storage.js    localStorage CRUD
    ├── contact.js    contact model + multi-method handling
    ├── bookmark.js   favorites
    ├── excel.js      import/export
    └── app.js        rendering and event wiring
```

## Run

Open `index.html` in a browser, or serve it locally:

```bash
python -m http.server 8080
```

Excel import/export loads SheetJS from a CDN, so it needs network access on first use. Contacts are kept in the browser's `localStorage`.

## Excel format

The first column must be `姓名` (name). An optional `收藏` column takes `是`/`否` for the favorite flag. Every other column header is treated as a contact method type. Multiple values in one cell can be separated by `、`, `;`, `,`, or a newline.

## Deploy

It's all static files, so GitHub Pages, Vercel, Netlify, or a plain Nginx server all work.

## License

MIT
