const pixarFilms = 'https://www.pixar.com/feature-films';
const insideOut = 'https://www.pixar.com/inside-out';
const insideOut2 = 'https://www.pixar.com/inside-out-2';
const soul = 'https://www.pixar.com/soul';
const whoStress = 'https://tdr.who.int/home/our-work/global-engagement/9789240003927';
const nhsBreathing = 'https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/';
const nhsSadness = 'https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/low-mood-sadness-depression/';
const nhsAnxiety = 'https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/anxiety-fear-panic/';

export const emotionSuggestions = {
  anger: {
    intro: 'If anger is the word the model picked up, these are a few gentle ways to pause, understand what may be underneath, or simply take a break.',
    items: [
      { type: 'Movie', title: 'Inside Out 2', description: 'A story about new, sometimes overwhelming emotions arriving all at once.', url: insideOut2 },
      { type: 'Article', title: 'Meditation for anger', description: 'A plain-language look at anger, what it can signal, and ways to pause.', url: 'https://www.headspace.com/meditation/anger' },
      { type: 'Blog', title: 'Is it anger, or something else?', description: 'A short reflection on what might sit underneath an angry moment.', url: 'https://www.headspace.com/content/meditation/is-it-anger-or-something-else/12092' },
      { type: 'YouTube', title: '11-minute walking meditation for anger and stress', description: 'A guided walk from Headspace; skip it if movement or meditation does not feel right today.', url: 'https://www.youtube.com/watch?v=xOUt2IsQHKM' },
    ],
  },
  sadness: {
    intro: 'If sadness came through in the text, you might prefer something comforting, a small practical idea, or a little company in a story.',
    items: [
      { type: 'Movie', title: 'Inside Out', description: 'A warm animated story that gives sadness an important place in Riley’s life.', url: insideOut },
      { type: 'Article', title: 'Low mood and sadness', description: 'Gentle, practical ideas and information about finding support.', url: nhsSadness },
      { type: 'Article', title: 'Doing What Matters in Times of Stress', description: 'A WHO guide with simple grounding and self-help exercises.', url: whoStress },
      { type: 'YouTube', title: '10-minute meditation for working with sadness', description: 'A guided Headspace practice. You can leave at any time if it is not helpful.', url: 'https://www.youtube.com/watch?v=US2-73u6oQM' },
    ],
  },
  fear: {
    intro: 'If fear or worry showed up in the estimate, here are options focused on feeling grounded and making sense of anxious moments.',
    items: [
      { type: 'Movie', title: 'Inside Out 2', description: 'An animated story featuring Anxiety and other changing feelings.', url: insideOut2 },
      { type: 'Article', title: 'Anxiety, fear and panic', description: 'NHS information about anxious feelings and support options.', url: nhsAnxiety },
      { type: 'Practice', title: 'A breathing exercise for stress', description: 'A simple NHS breathing practice you can try at your own pace.', url: nhsBreathing },
      { type: 'YouTube', title: 'A short breathing practice for stress', description: 'A brief Headspace guided practice for a pause in a busy moment.', url: 'https://www.youtube.com/watch?v=y7u5-YBgmQ4' },
    ],
  },
  disgust: {
    intro: 'If disgust was the closest text estimate, you may want a thoughtful story or a grounding resource. The label is only a guess about the words.',
    items: [
      { type: 'Movie', title: 'Inside Out', description: 'An animated story where Disgust is one of several feelings working together.', url: insideOut },
      { type: 'Article', title: 'Doing What Matters in Times of Stress', description: 'A WHO guide with grounding practices for difficult moments.', url: whoStress },
      { type: 'Practice', title: 'A breathing exercise for stress', description: 'A short NHS practice; breathing exercises are optional, not a requirement.', url: nhsBreathing },
      { type: 'YouTube', title: 'A short breathing practice for stress', description: 'A guided pause from Headspace if a video feels useful right now.', url: 'https://www.youtube.com/watch?v=y7u5-YBgmQ4' },
    ],
  },
  joy: {
    intro: 'If joy showed up in your writing, you might like to stay with that moment, enjoy a story, or notice what made it meaningful.',
    items: [
      { type: 'Movie', title: 'Soul', description: 'An animated reflection on purpose, everyday moments, and being present.', url: soul },
      { type: 'Movie', title: 'Inside Out', description: 'A story about the many feelings that shape a life, including joy.', url: insideOut },
      { type: 'Article', title: 'Happiness meditation', description: 'A short Headspace read on making room for positive feelings.', url: 'https://www.headspace.com/meditation/happiness' },
      { type: 'YouTube', title: 'A 4-minute gratitude wind-down', description: 'A brief Headspace reflection on a small moment that brought joy.', url: 'https://www.youtube.com/watch?v=LWjE6N8XVCQ' },
    ],
  },
  surprise: {
    intro: 'If surprise was the closest estimate, these picks explore change, uncertainty, and finding your footing when something unexpected happens.',
    items: [
      { type: 'Movie', title: 'Inside Out 2', description: 'A story about change and the arrival of unfamiliar feelings.', url: insideOut2 },
      { type: 'Movie', title: 'Elemental', description: 'An animated story about difference, connection, and unexpected change.', url: pixarFilms },
      { type: 'Article', title: 'Doing What Matters in Times of Stress', description: 'WHO grounding ideas for moments that feel uncertain.', url: whoStress },
      { type: 'YouTube', title: '4 minutes to stay calm when you’re triggered', description: 'A brief Headspace practice for reconnecting with yourself during a strong emotion.', url: 'https://www.youtube.com/watch?v=Wl8Iz8kkTTQ' },
    ],
  },
  neutral: {
    intro: 'A neutral estimate can simply mean the text sounded even-toned to the model. These are gentle options for reflection or a quiet reset.',
    items: [
      { type: 'Movie', title: 'Soul', description: 'An animated reflection on ordinary moments and what gives them meaning.', url: soul },
      { type: 'Article', title: 'Doing What Matters in Times of Stress', description: 'A practical WHO guide to grounding and reconnecting with what matters.', url: whoStress },
      { type: 'Practice', title: 'A breathing exercise for stress', description: 'A simple NHS practice to try if a quiet pause sounds good.', url: nhsBreathing },
      { type: 'YouTube', title: 'A short breathing practice for stress', description: 'A gentle Headspace pause if you want a moment to settle or reset.', url: 'https://www.youtube.com/watch?v=y7u5-YBgmQ4' },
    ],
  },
};
