# WordSmart — Myanmar English Word Learning System

## How It Works (Fully Automatic)

```
You insert 5 words into Supabase
        ↓
Supabase DB trigger fires instantly
        ↓
Quiz auto-generated for that date
        ↓
/0302 is live for students — zero extra steps
```

---

## Routes

| Path | Who | Description |
|------|-----|-------------|
| `/` | Admin | Publish 5 words, manage students |
| `/parent` | Parents | Login to view child's scores & progress |
| `/0301` | Students | Quiz for March 1st (MMDD format) |

---

## Deploy to Netlify

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial WordSmart"
git remote add origin https://github.com/YOUR_USERNAME/wordsmart.git
git push -u origin main
```

### 2. Connect Netlify
1. [netlify.com](https://netlify.com) → Add new site → Import from Git
2. Select your repo — build settings auto-detected from `netlify.toml`

### 3. Set environment variables in Netlify dashboard
Site Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://uuupodunabkcuupdadgq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Done — auto-deploys on every git push

---

## Daily Word Automation

### Via Admin UI
Go to `/` → pick date → enter 5 words → Publish. Quiz is live instantly.

### Via Supabase API (AI script / cron job)
```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/rest/v1/daily_words' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"word_date":"2026-03-03","english":"Persistent","myanmar":"စွဲမြဲသော"},
    {"word_date":"2026-03-03","english":"Gracious","myanmar":"ကျေးဇူးသိတတ်သော"},
    {"word_date":"2026-03-03","english":"Vigilant","myanmar":"သတိရှိသော"},
    {"word_date":"2026-03-03","english":"Serene","myanmar":"တည်ငြိမ်သော"},
    {"word_date":"2026-03-03","english":"Candid","myanmar":"ဖွင့်လှစ်သော"}
  ]'
# /0303 quiz is auto-created by the DB trigger within milliseconds
```

---

## Local Development
```bash
npm install
cp .env.example .env.local
npm run dev
```
