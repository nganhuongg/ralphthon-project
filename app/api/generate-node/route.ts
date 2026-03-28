import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import type { TuViChart, PathNode, PathId, GriefEntry } from '@/lib/tuvi/types';

type RequestBody = {
  pathId: PathId;
  depth: number;
  chart: TuViChart;
  previousNodes: PathNode[];
  griefContext?: GriefEntry[];
};

const ARCHETYPE_LABEL: Record<PathId, string> = {
  duty: 'Duty',
  desire: 'Desire',
  transformation: 'Transformation',
};

const ARCHETYPE_FRAMING: Record<PathId, string> = {
  duty: 'This path honors obligation, commitment, and the weight of what others need from you.',
  desire: 'This path follows what you truly want — the self beneath the roles you have played.',
  transformation:
    'This path dissolves the known self. What you become cannot be planned — only entered.',
};

export async function POST(req: Request): Promise<Response> {
  let body: Partial<RequestBody>;

  try {
    body = (await req.json()) as Partial<RequestBody>;
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const { pathId, depth, chart, previousNodes = [], griefContext = [] } = body;

  if (!pathId || depth === undefined || depth === null || !chart) {
    return new Response('Bad Request', { status: 400 });
  }

  const systemPrompt = buildSystemPrompt({ pathId, chart, griefContext });
  const userPrompt = buildUserPrompt({ depth, previousNodes });

  const result = await streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    maxOutputTokens: 200,
    temperature: 0.85,
  });

  return result.toTextStreamResponse();
}

function buildSystemPrompt({
  pathId,
  chart,
  griefContext,
}: {
  pathId: PathId;
  chart: TuViChart;
  griefContext: GriefEntry[];
}): string {
  const { profile, input } = chart;

  let prompt = `You are a life path oracle — tender, grounded, not mystical. You generate short, precise predictions that feel earned and human, not florid.

The person's psychological profile (derived from their Tử Vi birth chart):
- Dominant theme: ${profile.dominantTheme}
- Relational pattern: ${profile.relationalPattern}
- Ambition structure: ${profile.ambitionStructure}
- Risk star: ${profile.riskStarName ?? 'none identified'} in ${profile.riskStarPalace ?? 'unknown'} palace

Their life decision: "${input.decision}"

You are generating for the ${ARCHETYPE_LABEL[pathId]} path.
${ARCHETYPE_FRAMING[pathId]}

Instructions:
- Write exactly 2–4 sentences in first-person future tense ("You will...")
- Ground predictions in the profile's psychological language, not generic advice
- Tone: tender, honest, grounded. Not mystical, not therapeutic, not gamified.
- Do not use metaphors involving stars, skies, or destinies
- Do not use bullet points or lists — prose only`;

  if (griefContext.length > 0) {
    const griefModifier = griefContext
      .map(
        (g) =>
          `The person has let go of the ${g.pathId} path — releasing "${g.answers.lettingGo}" and now knowing "${g.answers.nowKnow}". Let this subtly inflect this remaining prediction.`
      )
      .join('\n');

    prompt += `\n\n${griefModifier}`;
  }

  return prompt;
}

function buildUserPrompt({
  depth,
  previousNodes,
}: {
  depth: number;
  previousNodes: PathNode[];
}): string {
  const previousText =
    previousNodes.length > 0
      ? `Previously on this path:\n${previousNodes.map((n, i) => `Node ${i + 1}: ${n.content}`).join('\n\n')}\n\n`
      : '';

  return `${previousText}Generate node ${depth} of 5 for this path.`;
}
