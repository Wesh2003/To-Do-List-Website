# Little List

A lightweight to-do list that runs in the browser. Tasks are saved in that browser's local storage; no account, server, or build step is required.

## Run on your computer

Open `index.html` in a browser. For a local web server, run this command from the project folder:

```powershell
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## Deploy to GitHub Pages

1. Push these files to a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Choose the branch containing the site and the `/ (root)` folder, then save.

GitHub Pages will publish the static site. No build configuration is needed.
