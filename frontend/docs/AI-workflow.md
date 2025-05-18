# 🧠 AI-Workflow (Hybride – Lokaal + GPT-4o)

Deze gids beschrijft een optionele maar veilige en krachtige AI-ontwikkelworkflow die 100% lokaal werkt, tenzij expliciet gekozen voor GPT‑4o. Perfect afgestemd op systemen zoals RooCode, Ollama en de Continue-extensie.

---

## 🔧 Setup-overzicht

| Component       | Tool / Model           |
|----------------|------------------------|
| IDE            | RooCode of VS Code     |
| Autocomplete   | Continue + DeepSeekCoder |
| AI-chat lokaal | Continue + Llama3      |
| Cloud fallback | GPT-4o (RooCode ChatGPT extensie) |

---

## 📁 `.continueignore` (veilig werken)

Plaats dit bestand in de root van je project om gevoelige bestanden uit te sluiten van AI-analyse:

```
.env
keys/*
*.pem
*.key
node_modules/
dist/
.vscode/
package-lock.json
```

---

## ⚙️ `~/.continue/config.json`

```json
{
  "models": {
    "chat-local": {
      "provider": "ollama",
      "apiBase": "http://127.0.0.1:11434",
      "model": "llama3.1:latest",
      "default": true
    },
    "code-local": {
      "provider": "ollama",
      "apiBase": "http://127.0.0.1:11434",
      "model": "deepset-coder:6.7b",
      "temperature": 0.1
    }
  },
  "llm.defaultModel": "code-local",
  "llm.defaultChatModel": "chat-local",
  "telemetry.disabled": true
}
```

## 🛡️ AI-gebruik per taak

| Taak | Tool |
|------|------|
| Code genereren/completion | DeepSeekCoder |
| Architectuurvragen, prompts | Llama3 lokaal |
| GPT-4 brainstorm (zonder code) | GPT-4o cloud |
| Testgeneratie/refactoring | Continue |

## 🧪 Ollama performance settings

```powershell
setx OLLAMA_HOST 127.0.0.1
setx OLLAMA_MAX_CONTEXT_SIZE 4096
setx OLLAMA_NUM_THREAD 12
```

## ✅ Samenvatting

- Geen verplichting: dit is een optionele maar aanbevolen workflow.
- Alles draait lokaal tenzij jij bewust GPT‑4o inschakelt.
- Je behoudt volledige controle over je code, tokens en data.