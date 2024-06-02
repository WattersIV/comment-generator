export const subjects = ['math', 'language', 'science'] as const;
export type Subject = typeof subjects[number];
export const mathSections = ['counting', 'measurement'] as const;
export const languageSections = ['reading', 'writing'] as const;
export const scienceSections = ['biology', 'chemistry'] as const;
export const levels = ['4', '3', '2', '1', 'incomplete'] as const;
export type Level = typeof levels[number];
export type Sections = typeof mathSections | typeof languageSections| typeof scienceSections;
export const sectionMapping = {
  math: mathSections,
  language: languageSections,
  science: scienceSections,
} as const

