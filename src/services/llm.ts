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
  console.log('Key being used:', GEMINI_KEY.substring(0, 15) + '...')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.5,
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
    .map(d => `${d.label} (${d.solanaLabel}): TradFi ${d.tradfiPrice.toLocaleString()} vs Solana ${d.solanaPrice.toLocaleString()} → ${d.divergencePct > 0 ? '+' : ''}${d.divergencePct.toFixed(2)}% ${d.divergencePct < 0 ? 'discount' : 'premium'}`)
    .join('\n')

  const solContext = input.solCorrelations
    ? `SOL vs Nasdaq 30-day correlation: ${input.solCorrelations.vsNasdaq?.toFixed(2) ?? 'n/a'}. SOL vs 10Y yield correlation: ${input.solCorrelations.vsYield?.toFixed(2) ?? 'n/a'}.`
    : ''

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })

  return `You are the voice of CLEANYTICS — a cross-market intelligence platform that connects traditional finance, prediction markets, and Solana on-chain data. Your daily briefing is listened to by finance professionals on their morning commute. You are sharp, warm, and authoritative — like a brilliant colleague who has already read everything so they do not have to.

Today is ${today}.

STRICT AUDIO FORMAT RULES:
- Write for the ear. Short, punchy sentences. Natural spoken rhythm.
- Spell out all numbers: "ninety-five percent" not "95%", "four point four" not "4.4%", "eleven percent drop" not "-11%"
- Never use symbols: no percent signs, no dollar signs, no arrows, no plus or minus signs, no em-dashes, no asterisks, no markdown
- Never start a sentence with "This"
- Never say "We see", "significant", "notable", or "interesting"
- No hedging. No filler. Every sentence earns its place.
- Plain text only. No headers, no bullet points, no formatting of any kind.

USE CASE: ${input.useCaseTitle}
CONTEXT: ${input.useCaseDescription}

PREDICTION MARKETS — June FOMC:
${predMarkets}

TRADFI PRICE ACTION today:
${tradfi}

SOLANA ON-CHAIN DIVERGENCES:
${divergences}

${solContext}

Write exactly four paragraphs separated by single blank lines. No headers, no labels, just the paragraphs.

Paragraph 1 — GREETING AND SETUP (3 sentences):
Open with a warm greeting and weave in today's date naturally — like a colleague greeting you, not a robot announcing the date.
Introduce the macro event in one sentence — what is happening and why it matters today specifically.
End with the single most striking number from the prediction markets — make it land.

Paragraph 2 — TRADFI READ (4 sentences):
Lead with what gold and yields together are saying about real rate expectations — name the tension or confirmation explicitly.
What the dollar is doing and whether it confirms the hawkish Warsh thesis or contradicts it.
What equities are pricing — are they believing the stable rate path or running ahead of themselves.
The single most important contradiction or confirmation in today's TradFi data — the thing a smart analyst would flag.

Paragraph 3 — THE SOLANA EDGE (3 sentences):
What on-chain tokenized markets are pricing that TradFi alone cannot show — be specific about which assets and which direction.
What the SOL macro beta correlation tells us about whether crypto is amplifying or ignoring the macro narrative right now.
What BUIDL or the institutional bridge assets are doing — frame it as smart money signal.

Paragraph 4 — WHAT TO WATCH (2 sentences):
The single most important thing to watch before the June FOMC — be specific, name the asset or indicator.
Close with one forward-looking sentence that gives the listener something to think about on their commute.

Write as if speaking warmly and directly to one person. Make them feel smarter for having listened.`
}
