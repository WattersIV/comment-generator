export const subjects = ['math', 'language', 'science'] as const;
export type Subject = typeof subjects[number];
export const mathSections = ['SEL', 'Operations', 'Spatial', 'Algebra' ] as const;
export const languageSections = ['Transferable Skills', 'Opinion', 'Research + Reporting', 'Reading', 'Writing', 'Comprehension + Critical Thinking', 'Next Steps'] as const;
export const scienceSections = ['SEL', 'Conservation of Energy', 'Structures/Mechanisms', 'Matter and Energy', 'Next Step'] as const;
export const levels = ['4', '3', '2', '1', 'incomplete'] as const;
export type Level = typeof levels[number];
export type Sections = typeof mathSections | typeof languageSections| typeof scienceSections;
export const sectionMapping = {
  math: mathSections,
  language: languageSections,
  science: scienceSections,
} as const

