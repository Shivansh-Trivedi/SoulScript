const FIRST_PERSON_SELF_HARM_CUES = [
  /\bi\s+(?:(?:want|wanna|wish|plan|intend|might|may|could|can|will|am going to|have been thinking about|keep thinking about|think about|thought about)\s+(?:to\s+)?(?:hurt(?:ing)?|harm(?:ing)?|kill(?:ing)?)\s+myself|(?:have|had)\s+thoughts?\s+of\s+(?:hurting|harming)\s+myself)\b/i,
  /\bi\s+(?:am thinking about|have thought about|thought of|feel like|am considering)\s+(?:(?:i\s+)?(?:might|may|could|can)\s+)?(?:hurting|harming|killing)\s+myself\b/i,
  /\bi\s+(?:(?:want|wish|plan|intend|might|may|could|can|will|would|am going to|have been thinking about|keep thinking about)\s+(?:to\s+)?(?:die|end\s+my\s+life)|wish\s+i\s+could\s+die|wish\s+i\s+(?:were|was)\s+dead)\b/i,
  /\bi\s+(?:want|wanna|wish|plan|intend|might|may|could|can|will|am going to|have been thinking about|keep thinking about)\s+(?:to\s+)?self[- ]harm\b/i,
  /\bi\s+(?:(?:am|feel|felt)\s+(?:really\s+)?suicidal|have\s+(?:been\s+having\s+)?suicidal\s+thoughts?)\b/i,
  /\bi\s+(?:do not|don't|cannot|can't)\s+(?:want\s+)?to\s+(?:live|be alive|exist)\b/i,
];

export function hasSensitiveEmotionSignal(emotionSignals = []) {
  return emotionSignals.some((emotion) => ['sadness', 'disgust'].includes(String(emotion || '').toLowerCase()));
}

export function shouldOfferSupport(content, prediction, currentEmotionSignals = []) {
  const label = String(prediction?.top_label || prediction?.label || '').toLowerCase();
  const sensitiveEstimate = ['sadness', 'disgust'].includes(label) || hasSensitiveEmotionSignal(currentEmotionSignals);
  if (prediction?.stale === true || !sensitiveEstimate) return false;
  const text = String(content || '').replace(/[’‘]/g, "'").replace(/\bi'm\b/gi, 'i am').replace(/\bi've\b/gi, 'i have');
  return FIRST_PERSON_SELF_HARM_CUES.some((pattern) => pattern.test(text));
}
