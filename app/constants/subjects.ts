import { commentBank } from "./commentBank";

export const subjectLevels = ['4', '3', '2', '1', 'incomplete'] as const;
export const learningSkillLevels = ['E', 'G', 'S', 'N'] as const;
export const standardSubjectLevels: [string, string][] = [
  ['4', 'Level 4 🌟'],
  ['3', 'Level 3 ✔️'],
  ['2', 'Level 2 😕'],
  ['1', 'Level 1 😢'],
  ['incomplete', 'Incomplete 👺'],
];
export const learningSkillsLabelMaps = new Map(  
  [['E-1', 'E 🌟'],
  ['G-1', 'G ✔️'],
  ['S-1', 'S 😕'],
  ['N-1', 'N 😢'],
  ['N-2', 'N- 😖']]);

const nextStepsSkillLevels: [string, string][] = [
  ['1', 'Active Learner/ Helper'],
  ['2', 'Extra-Curriculars'],
  ['3', 'Leader- Help Others'],
  ['4', 'Leader- Community Involvement'],
  ['5', 'Other Subject Interets'],
]
export const subjects = ['math', 'language', 'science', 'learning skills'] as const;
export type Subject = typeof subjects[number];
export const mathSections = [['SEL', createLevels(standardSubjectLevels)], ['Operations', createLevels(standardSubjectLevels)], ['Spatial', createLevels(standardSubjectLevels)], ['Algebra', createLevels(standardSubjectLevels, [2,1,1,1])]] as const;
export const languageSections = [['Transferable Skills', createLevels(standardSubjectLevels)], ['Opinion', createLevels(standardSubjectLevels)], ['Research + Reporting', createLevels(standardSubjectLevels)], ['Reading', createLevels(standardSubjectLevels)], ['Writing', createLevels(standardSubjectLevels)], ['Comprehension + Critical Thinking', createLevels(standardSubjectLevels)], ['Next Steps', createLevels(standardSubjectLevels)]] as const;
export const scienceSections = [['SEL', createLevels(standardSubjectLevels)], ['Conservation of Energy', createLevels(standardSubjectLevels)], ['Structures/Mechanisms', createLevels(standardSubjectLevels)], ['Matter and Energy', createLevels(standardSubjectLevels)], ['Next Step', createLevels(standardSubjectLevels)]] as const;
export const learningSkillSections = getLearningSkillSections();

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



function getLearningSkillSections(){
  const keys = Object.keys(commentBank['learning skills']);
  return keys.map(key => {
    let gradeData = [];
    const sectionData = [key, gradeData];
    for (const gradeKey in commentBank['learning skills'][key]) {
      if (key === 'Language' || key === 'MATHEMATICS (NUMBER SENSE)') {
        gradeData.push([gradeKey.slice(0, gradeKey.length - 2), gradeKey.slice(0, gradeKey.length - 2), 1])
        continue;
      }
      gradeData.push([gradeKey[0], learningSkillsLabelMaps.get(gradeKey), 1])
    }
    return sectionData;
  })
}