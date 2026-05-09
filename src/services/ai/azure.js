// ============================================
// NagarVoice — Azure OpenAI Vision Service
// Uses a vision-capable Azure OpenAI deployment
// ============================================

const DEFAULT_API_VERSION = '2024-02-15-preview';

function getAzureConfig() {
  return {
    apiKey:
      localStorage.getItem('nagarvoice_azure_openai_key') ||
      import.meta.env.VITE_AZURE_OPENAI_API_KEY ||
      '',
    endpoint:
      localStorage.getItem('nagarvoice_azure_openai_endpoint') ||
      import.meta.env.VITE_AZURE_OPENAI_ENDPOINT ||
      '',
    deployment:
      localStorage.getItem('nagarvoice_azure_openai_deployment') ||
      import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT ||
      '',
    apiVersion:
      localStorage.getItem('nagarvoice_azure_openai_api_version') ||
      import.meta.env.VITE_AZURE_OPENAI_API_VERSION ||
      DEFAULT_API_VERSION,
  };
}

export function setAzureOpenAIConfig({ apiKey, endpoint, deployment, apiVersion }) {
  if (apiKey !== undefined) localStorage.setItem('nagarvoice_azure_openai_key', apiKey);
  if (endpoint !== undefined) localStorage.setItem('nagarvoice_azure_openai_endpoint', endpoint);
  if (deployment !== undefined) localStorage.setItem('nagarvoice_azure_openai_deployment', deployment);
  if (apiVersion !== undefined) localStorage.setItem('nagarvoice_azure_openai_api_version', apiVersion);
}

export function hasAzureOpenAIConfig() {
  const { apiKey, endpoint, deployment } = getAzureConfig();
  return !!(apiKey && endpoint && deployment);
}

function buildVisionUrl(endpoint, deployment, apiVersion) {
  const normalizedEndpoint = endpoint.replace(/\/$/, '');
  return `${normalizedEndpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
}

async function parseJsonFromText(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return fallback;
  }
}

export async function azureCategorize(description = '', imageDataUrl = null) {
  const { apiKey, endpoint, deployment, apiVersion } = getAzureConfig();

  if (!apiKey) throw new Error('Azure OpenAI API key not configured.');
  if (!endpoint) throw new Error('Azure OpenAI endpoint not configured.');
  if (!deployment) throw new Error('Azure OpenAI deployment not configured.');

  const systemPrompt = `You are an AI that categorizes civic issues in Bangalore (BBMP jurisdiction).
Analyze the image and/or description below and classify the civic issue.

RESPOND WITH ONLY VALID JSON - no markdown, no explanation:
{
  "category": "one of: pothole, garbage, streetlight, waterLeak, sewage, encroachment, roadDamage, treeFall, illegalDumping, electricalHazard, drainage, noise, other",
  "subcategory": "specific sub-type",
  "priority": "one of: low, medium, high, critical",
  "suggestedTitle": "short clear title under 60 chars",
  "suggestedDescription": "2-3 sentence official description"
}`;

  const userContent = [
    {
      type: 'text',
      text: `User description: ${description || 'No description provided'}\n\nLook at the image and categorize the civic issue shown.`,
    },
  ];

  if (imageDataUrl && imageDataUrl.startsWith('data:image/')) {
    userContent.unshift({
      type: 'image_url',
      image_url: {
        url: imageDataUrl,
      },
    });
  }

  const response = await fetch(buildVisionUrl(endpoint, deployment, apiVersion), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.1,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Azure OpenAI API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  const text = Array.isArray(content)
    ? content.map(part => (typeof part === 'string' ? part : part?.text || '')).join('')
    : String(content);

  return parseJsonFromText(text, {
    category: 'other',
    subcategory: 'general',
    priority: 'medium',
    suggestedTitle: 'Civic Issue Report',
    suggestedDescription: description,
  });
}

export async function azureChat(messages, systemPrompt = '') {
  const { apiKey, endpoint, deployment, apiVersion } = getAzureConfig();

  if (!apiKey) throw new Error('Azure OpenAI API key not configured.');
  if (!endpoint) throw new Error('Azure OpenAI endpoint not configured.');
  if (!deployment) throw new Error('Azure OpenAI deployment not configured.');

  const response = await fetch(buildVisionUrl(endpoint, deployment, apiVersion), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      messages: systemPrompt 
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages,
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Azure OpenAI API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  return String(content);
}