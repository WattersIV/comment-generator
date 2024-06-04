export const subjectLevels = ['4', '3', '2', '1', 'incomplete'] as const;
export const learningSkillLevels = ['E', 'G', 'S', 'N'] as const;
export const standardSubjectLevels: [string, string][] = [
  ['4', 'Level 4 🌟'],
  ['3', 'Level 3 ✔️'],
  ['2', 'Level 2 😕'],
  ['1', 'Level 1 😢'],
  ['incomplete', 'Incomplete 👺'],
];
export const standardLearningSkillLevels: [string, string][] = [
  ['E', 'E 🌟'],
  ['G', 'G ✔️'],
  ['S', 'S 😕'],
  ['N', 'N 😢'],
];
export const subjects = ['math', 'language', 'science', 'learning skills'] as const;
export type Subject = typeof subjects[number];
export const mathSections = [['SEL', createLevels(standardSubjectLevels)], ['Operations', createLevels(standardSubjectLevels)], ['Spatial', createLevels(standardSubjectLevels)], ['Algebra', createLevels(standardSubjectLevels)]] as const;
export const languageSections = [['Transferable Skills', createLevels(standardSubjectLevels)], ['Opinion', createLevels(standardSubjectLevels)], ['Research + Reporting', createLevels(standardSubjectLevels)], ['Reading', createLevels(standardSubjectLevels)], ['Writing', createLevels(standardSubjectLevels)], ['Comprehension + Critical Thinking', createLevels(standardSubjectLevels)], ['Next Steps', createLevels(standardSubjectLevels)]] as const;
export const scienceSections = [['SEL', createLevels(standardSubjectLevels)], ['Conservation of Energy', createLevels(standardSubjectLevels)], ['Structures/Mechanisms', createLevels(standardSubjectLevels)], ['Matter and Energy', createLevels(standardSubjectLevels)], ['Next Step', createLevels(standardSubjectLevels)]] as const;
export const learningSkillSections = [['Responsibility', createLevels(standardLearningSkillLevels, [1,2,1,5])], ['Organization', createLevels(standardLearningSkillLevels)]] as const;


function createLevels(standardLevels: [string, string][], levels?: number[]): [string, string, number][]{
  return standardLevels.map(([value, label], index) => {
    return [
      value,
      label,
      levels?.[index] ?? 1
    ]
  })
}1


export type Level = typeof subjectLevels[number];
export type Sections = typeof mathSections[number][0] | typeof languageSections[number][0] | typeof scienceSections[number][0] | typeof learningSkillSections[number][0];
export const sectionMapping = {
  math: mathSections,
  language: languageSections,
  science: scienceSections,
  'learning skills': learningSkillSections
} as const

