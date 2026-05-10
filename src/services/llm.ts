// src/services/llm.ts

export interface NarrativeInput {
  useCaseTitle: string
  useCaseDescription: string
  predictionMarkets: { label: string; probability: number }[]
  tradfiPrices: { label: string; price: number; changePct: number }[]
  divergences: { label: string; tradfiPrice: number; solanaPrice: number; divergencePct: number; solanaLabel: string }[]
  solCorrelations?: { vsNasdaq: number | null; vsYield: number | null }
}

async function callGemini(prompt: string, model: string): Promise<string> {
  const GEMINI_KEY = process.env.GEMINI_KEY ?? ''

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.4,
          thinkingConfig: { thinkingBudget: 0 }
        }
      }),
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini ${model} error ${response.status}: ${err}`)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

async function callWithFallback(prompt: string): Promise<string> {
  const models = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
  ]

  for (let i = 0; i < models.length; i++) {
    try {
      console.log(`Trying model: ${models[i]}`)
      return await callGemini(prompt, models[i])
    } catch (err) {
      console.warn(`Model ${models[i]} failed:`, err)
      if (i < models.length - 1) {
        await new Promise(r => setTimeout(r, (i + 1) * 1000))
      }
    }
  }
  throw new Error('All Gemini models failed')
}

export async function generateNarrative(input: NarrativeInput): Promise<string> {
  try {
    const prompt = buildPrompt(input)
    const text = await callWithFallback(prompt)
    console.log('Narrative generated, length:', text.length)
    return text
  } catch (error) {
    console.error('Error generating narrative:', error)
    return ''
  }
}

function buildPrompt(input: NarrativeInput): string {
  const predMarkets = input.predictionMarkets
    .map(m => `${m.label}: ${(m.probability * 100).toFixed(1)}%`)
    .join('\n')

  const tradfi = input.tradfiPrices
    .map(t => `${t.label}: ${t.price.toLocaleString()} (${t.changePct > 0 ? '+' : ''}${t.changePct.toFixed(2)}% today)`)
    .join('\n')

  const divergences = input.divergences
    .map(d => `${d.label} (${d.solanaLabel}): TradFi ${d.tradfiPrice.toLocaleString()} vs Solana ${d.solanaPrice.toLocaleString()} — ${d.divergencePct > 0 ? '+' : ''}${d.divergencePct.toFixed(2)}% ${d.divergencePct < 0 ? 'discount' : 'premium'} on Solana`)
    .join('\n')

  const solContext = input.solCorrelations
    ? `SOL vs Nasdaq 30-day correlation: ${input.solCorrelations.vsNasdaq?.toFixed(2) ?? 'n/a'}. SOL vs 10Y yield correlation: ${input.solCorrelations.vsYield?.toFixed(2) ?? 'n/a'}.`
    : ''

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })

  return `You are the voice of CLEANYTICS — a Solana-native macro intelligence terminal that connects traditional finance, prediction markets, and on-chain data. Your daily briefing is listened to by finance professionals and crypto traders. You are sharp, direct, and authoritative — like a Bloomberg squawk desk that actually understands Solana.

Today is ${today}.

STRICT AUDIO FORMAT RULES:
- No greeting. Open immediately with the most important number or signal.
- Write for the ear. Short, punchy sentences. Natural spoken rhythm.
- Spell out all numbers: "ninety-seven percent" not "97%", "four point four" not "4.4%"
- Never use symbols: no percent signs, no dollar signs, no arrows, no plus or minus signs, no em-dashes, no asterisks, no markdown
- Never start a sentence with "This"
- Never say "we see", "significant", "notable", "interesting", "good morning", "hello"
- No hedging. No filler. Every sentence earns its place.
- Plain text only. No headers, no bullet points, no formatting of any kind.

CONTEXT: The Warsh Effect
On January 30th 2026, Trump nominated Kevin Warsh as Fed Chair. Gold fell eleven percent. Silver collapsed thirty-seven percent — its worst day since March 1980. TradFi closed for the weekend. On Solana, XAG silver perps on Pacifica never stopped trading. CLEANYTICS exists because of moments like this — when on-chain markets price macro events before TradFi reopens.

USE CASE: ${input.useCaseTitle}
BACKGROUND: ${input.useCaseDescription}

PREDICTION MARKETS — June FOMC:
${predMarkets}

TRADFI PRICE ACTION today:
${tradfi}

SOLANA CROSS-MARKET GAPS (where Solana diverges from TradFi right now):
${divergences}

${solContext}

Write exactly four paragraphs separated by single blank lines. No headers, no labels, just the paragraphs.

Paragraph 1 — THE SIGNAL (2 sentences):
Open with the single most striking prediction market number — make it land without any greeting.
One sentence on what this conviction level means for the June FOMC and the Warsh era.

Paragraph 2 — TRADFI READ (3 sentences):
What gold and yields together are saying about real rate expectations under Warsh.
What equities are pricing — are they believing the rate hold or running ahead of themselves.
The single most important thing a smart analyst would flag in today's TradFi data.

Paragraph 3 — THE SOLANA EDGE (3 sentences):
Where Solana is diverging from TradFi right now — name the specific asset, the gap size, and direction.
What that gap tells us — is on-chain more bullish or bearish than TradFi, and why it matters before the FOMC.
What the SOL macro beta correlation is signaling about whether crypto is amplifying or ignoring the macro narrative.

Paragraph 4 — WHAT TO WATCH (2 sentences):
The single most important asset or indicator to watch before the June FOMC — be specific, name it.
One forward-looking sentence that gives the listener something to think about.

Write as if speaking directly to one trader who has thirty seconds before their next meeting. Make every word count.`
}
