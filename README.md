# JLM Contracting — AI Receptionist (Riley)

AI-powered virtual receptionist for JLM Contracting Ltd., built on Claude.

## Deploy to Netlify (5 minutes)

### Option A — Netlify Drop (Fastest, no account needed for testing)

1. Build the project locally:
   ```bash
   npm install
   npm run build
   ```
2. Drag the `dist/` folder to **https://app.netlify.com/drop**
3. Set the environment variable (see step below)

---

### Option B — GitHub + Netlify (Recommended for production)

**Step 1: Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit — JLM AI Receptionist"
git remote add origin https://github.com/YOUR_USERNAME/jlm-receptionist.git
git push -u origin main
```

**Step 2: Connect to Netlify**
1. Go to **https://app.netlify.com** → "Add new site" → "Import an existing project"
2. Connect your GitHub repo
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

**Step 3: Add your Anthropic API key**
1. In Netlify dashboard → **Site configuration** → **Environment variables**
2. Add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (your key from https://console.anthropic.com)
3. Click **Save**, then **Deploy site**

---

### Option C — Netlify CLI

```bash
npm install -g netlify-cli
npm install
netlify login
netlify init       # follow prompts to create/link site
netlify env:set ANTHROPIC_API_KEY sk-ant-YOUR_KEY_HERE
netlify deploy --build --prod
```

---

## Local Development

```bash
npm install
npm install -g netlify-cli    # for function emulation
netlify dev                   # runs on http://localhost:8888
```

Set `ANTHROPIC_API_KEY` in a `.env` file at the project root:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

---

## Project Structure

```
jlm-receptionist/
├── netlify/
│   └── functions/
│       └── chat.js          ← Serverless proxy (keeps API key secret)
├── src/
│   ├── main.jsx             ← React entry point
│   └── App.jsx              ← Full receptionist UI
├── index.html
├── netlify.toml             ← Build + function config
├── package.json
└── vite.config.js
```

## How it works

- The React frontend calls `/.netlify/functions/chat` (never the Anthropic API directly)
- The Netlify function injects the `ANTHROPIC_API_KEY` server-side and proxies to Anthropic
- Your API key is never exposed to the browser

## Security notes

- Never commit `.env` to git — add it to `.gitignore`
- Rotate your API key if you suspect it was exposed
- Consider adding rate limiting to the Netlify function for production use
