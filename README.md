# VStube - YouTube in VS Code

![ChatGPT Image Jun 23, 2025, 04_34_28 PM](https://github.com/user-attachments/assets/265cf6fc-143e-4234-8c8c-39d0de152d5f)


Watch and search YouTube videos directly inside Visual Studio Code!  
No more switching tabs—code and watch side-by-side.

---

## ✨ Features

- **YouTube Sidebar & Explorer Panel**: Browse, search, and play YouTube videos right inside VS Code.
- **Trending Videos**: See what's hot on YouTube as soon as you open the extension.
- **Search**: Find any video, just like on YouTube.
- **Pixel-Perfect UI**: Looks and feels like the real YouTube.
- **Dark Theme**: Seamlessly matches VS Code's dark mode.
- **Responsive**: Works great in the sidebar or explorer.
- **One-Time Setup**: Enter your YouTube Data API key once—never again.

---

## 🚀 How to use ?

### 1. **Install the Extension**
- Search for `YouTube in VS Code` in the Extensions Marketplace and install.

### 2. **Get a YouTube Data API Key**
- Go to [Google Cloud Console](https://console.cloud.google.com/apis/library/youtube.googleapis.com).
- Create a project (if you don't have one).
- Enable the **YouTube Data API v3**.
- Go to **APIs & Services > Credentials**.
- Click **Create Credentials** → **API key**.
- Copy your API key.

### 3. **Enter Your API Key in VS Code**
- Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
- Type `YouTube: Open YouTube` or click the YouTube icon in the sidebar.
- When prompted, paste your API key, or go to:
  - `Settings` → search for `YouTube in VS Code` → paste your API key in **YouTube Data API Key**.

### 4. **Start Watching!**
- Trending videos load automatically.
- Use the search bar to find any video.
- Click a video to play it in the sidebar while you code.

---
## 🤝 How to Contribute ?

- Clone the rpo
`https://github.com/teja-pola/VStube.git`
- Install node_modules
`npm install`
- Compile the code
`npm run compile`
- Follow the above how to use steps to test and create a pull request.
---

## 🛠️ Settings

| Setting                   | Description                |
|---------------------------|----------------------------|
| `youtubeInVSCode.apiKey`  | Your YouTube Data API key. |

---

## 🧑‍💻 User Flow

1. **Install** the extension.
2. **Enter your API key** (one time).
3. **Browse, search, and play** YouTube videos in the sidebar or explorer.
4. **No more tab switching!** Your API key is saved for future use.

---

## ❓ FAQ

**Q: Is my API key safe?**  
A: Yes! Your key is stored in your local VS Code settings and never shared.

**Q: Can I change my API key later?**  
A: Yes! Just update it in the extension settings.

**Q: Why do I need an API key?**  
A: YouTube requires an API key for search and trending video access.

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes.

---

## 📣 Feedback & Issues

Found a bug or have a feature request?  
Open an issue on [GitHub](https://github.com/yourusername/your-repo) or use the VS Code Q&A.

---

## © 2025 VStube
