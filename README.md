# this_code_is_made_by_copilot_to_work_on_a_chormebook
# ChromebookNotes

ChromebookNotes is a lightweight Progressive Web App for taking notes on Chromebooks. It runs entirely in the browser, works offline, and can be installed to the shelf.

## Features

- Create, edit, delete notes
- Offline support via service worker
- Persistent storage using IndexedDB
- Installable as a PWA on Chrome OS
- Simple markdown-lite preview

## Run locally

1. Clone the repo:
   git clone https://github.com/your-username/chromebook-notes.git
2. Serve the folder with a static server. Example using Python:
   python3 -m http.server 8000
3. Open `http://localhost:8000` in Chrome on your Chromebook.
4. Use the browser menu to Install the app or click the Install button when shown.

## Deploy to GitHub Pages

1. Push the repo to GitHub.
2. In repository Settings enable GitHub Pages from the main branch root.
3. Visit the published URL and install the PWA.

## Notes

- Data is stored locally in the browser. Back up by exporting notes manually if needed.
- Works offline after first load.

## License

MIT
