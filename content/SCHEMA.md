# Content pack format

One JSON file per textbook chapter: `content/chapters/chN.json`.
All learner-facing explanations and translations are in **Spanish (Mexican)**.

## Conventions

- **Stress marks**: put a combining acute accent (U+0301) right after the stressed vowel on every
  Russian word of 2+ syllables: `сосе́д`, `краси́вый`. Never on monosyllables. Write `ё` always
  (it is inherently stressed, no extra mark). The app strips accents for grading.
- **IDs**: lowercase, stable, prefixed by lesson: `1.3-v-metro`, `1.3-g-gender`, `1.3-x-04`.
- **Adaptation**: textbook/workbook exercises may be reused, but lightly adapt them (change names,
  swap some details, reorder). Reading texts should be retold/condensed in your own words at the
  same level, keeping characters and plot. Do not copy long passages verbatim.
- **Level**: only use grammar/vocab introduced up to that lesson (earlier chapters are fine).
  Anything beyond goes to `sneakIns`.

## Top level

```jsonc
{
  "chapter": 3,
  "title": "…",                 // as in the book, Russian
  "titleEs": "…",
  "source": { "textbookPages": "48-73", "workbookPages": "44-67" },  // book page numbers
  "lessons": [ Lesson ],
  "sneakIns": [ VocabItem ]     // 5–15 thematically related extra words NOT in the book, with "sneak": true
}
```

## Lesson

```jsonc
{
  "id": "3.4",
  "title": "Новые сосе́ди",
  "titleEs": "Los vecinos nuevos",
  "summaryEs": "Qué se aprende en esta lección (1–2 frases).",
  "story": {                    // optional: recurring characters/setting the lesson is built around
    "settingEs": "…",
    "characters": [{ "name": "…", "descriptionEs": "…" }]
  },
  "grammar": [ GrammarPoint ],
  "vocab": [ VocabItem ],
  "phrases": [ { "ru": "…", "es": "…", "noteEs": "uso/contexto (opcional)" } ],
  "sentences": [ { "ru": "…", "es": "…", "tags": ["vocab or grammar ids"] } ],   // 15–40 natural example sentences, mostly original, for generated exercises
  "readings": [ Reading ],
  "exercises": [ Exercise ]     // 20–50 hand-made exercises (adapted from book + original)
}
```

## GrammarPoint

```jsonc
{
  "id": "3.4-g-adj-endings",
  "title": "Adjetivos: terminaciones en nominativo",
  "explanationEs": "Explicación breve y clara (markdown permitido).",
  "tables": [ { "caption": "…", "headers": ["…"], "rows": [["…"]] } ],
  "examples": [ { "ru": "…", "es": "…" } ],
  "drill": {                    // optional: machine-drillable form patterns
    "kind": "adj-agreement" | "noun-gender" | "verb-conj" | "case" | "plural" | "possessive" | "other",
    "items": [ { "base": "но́вый", "forms": { "m": "но́вый", "f": "но́вая", "n": "но́вое", "pl": "но́вые" } } ]
  }
}
```

## VocabItem

```jsonc
{
  "id": "3.4-v-shumnyj",
  "ru": "шу́мный",
  "es": "ruidoso",
  "pos": "noun|verb|adj|adv|pron|num|prep|conj|particle|phrase|interj",
  "gender": "m|f|n|pl",         // nouns only
  "plural": "…",                // nouns, when taught
  "forms": { "m": "…", "f": "…", "n": "…", "pl": "…" },   // adjectives / possessives
  "conj": {                     // verbs
    "type": "e|i|irregular",
    "present": { "я": "…", "ты": "…", "он": "…", "мы": "…", "вы": "…", "они́": "…" }
  },
  "antonyms": ["ти́хий"],
  "synonyms": [],
  "topic": "colores|familia|casa|…",   // short Spanish tag
  "fromSlovar": true,           // appears in the workbook's Словарь
  "sneak": false
}
```

## Reading

```jsonc
{
  "id": "3.4-r-1",
  "title": "…",
  "textRu": "Retold text, A1 level, with stress marks.",
  "textEs": "Traducción.",
  "questions": [ { "q": "… (ru)", "qEs": "…", "choices": ["…"], "answer": 0 } ]
}
```

## Exercise

Common fields: `id`, `type`, `instructionEs`, `explanationEs` (shown after answering), `es` (Spanish
translation of the exercise's Russian text with the correct answer filled in — shown after a correct
answer; for `match`/`sort` list the meanings, e.g. "шу́мный = ruidoso · ти́хий = tranquilo"), `tags`
(vocab/grammar ids), `origin`: `"textbook p.62 ex.5"` | `"workbook p.60 ex.3"` | `"original"`.

| type | specific fields |
|---|---|
| `fill_choice` | `sentence` (use `___` for the gap), `choices` [string], `answer` (index) |
| `fill_typed` | `sentence` with `___`, `answers` [accepted strings], `hint` (optional, e.g. base form) |
| `antonym` / `synonym` | `word`, `choices` [string] (optional – if absent it is typed), `answers` [string] |
| `conjugate` | `verb`, `pronouns` [string], `answers` [string] (same order) |
| `word_order` | `words` [string] (shuffled by app), `answer` (full sentence), `es` |
| `translate` | `direction`: `"es-ru"` \| `"ru-es"`, `prompt`, `answers` [accepted strings] |
| `match` | `pairs` [[left, right]] (4–6 pairs) |
| `sort` | `categories` [string], `items` [{ `text`, `category` }] (e.g. он/она́/оно́/они́) |
| `error_spot` | `sentence`, `wrongWord` (index in split-by-space), `correction` |
| `transform` | `prompt` (e.g. singular sentence), `instructionEs` (e.g. "Pon en plural"), `answers` |
| `dialogue` | `lines` [{ `speaker`, `ru` }] with one line containing `___`, `choices`, `answer` |

## Listening (`content/extra/listening-chN.json`)

Original audio pieces for the listening section, merged into lessons like any extra pack:

```jsonc
{
  "id": "listening-ch3",
  "lessons": [{
    "id": "3.4",
    "listening": [{
      "id": "3.4-l-1",                       // stable, never renamed
      "title": "Una queja al vecino",         // Spanish
      "kind": "dialogue" | "story",
      "lines": [                              // each line is voiced separately; gender picks the voice
        { "speaker": "Ма́ша", "gender": "f", "ru": "Здра́вствуйте! Я ва́ша сосе́дка." },
        { "speaker": "Сосе́д", "gender": "m", "ru": "Приве́т! Как дела́?" }
      ],                                      // stories: one narrator, same speaker/gender on every line
      "cast": [                               // who appears; drives the character drawings
        { "name": "Ма́ша", "gender": "f", "age": "young", "skin": "light", "hair": "brown",
          "hairStyle": "ponytail", "glasses": false, "beard": false, "top": "blue" }
      ],                                      // name must match `speaker` in lines (stories: the narrator)
      // age: child | young | adult | old · skin: light | medium | dark
      // hair: black | brown | blond | red | gray | none · hairStyle: short | long | bun | curly | ponytail | bald
      // top (clothing colour): blue | red | green | ochre | gray | teal
      "es": "Full Spanish translation, one line per Russian line.",
      "questions": [                          // 3–4 comprehension questions, answerable only by listening
        { "q": "¿Qué le molesta a Masha?", "choices": ["La música fuerte", "El perro", "El coche"], "answer": 0 }
      ]
    }]
  }]
}
```
