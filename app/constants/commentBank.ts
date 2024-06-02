import { Subject, sectionMapping } from "./subjects";

export type CommentBank = {
  [K in Subject]: {
    [L in typeof sectionMapping[K][number]]: {
      4: string;
      3: string;
      2: string;
      1: string;
      incomplete: string;
    };
  };
}
export const commentBank = {
  math: {
    counting: {
      1: 'Bad job! Level 1 counter!',
      2: 'Good job! Level 2 counter!',
      3: 'Great job! Level 3 counter!',
      4: 'Awesome job! Level 4 counter!',
      incomplete: '',
    },
    measurement: {
      1: 'Bad job! Level 1 measurer!',
      2: 'Good job! Level 2 measurer!',
      3: 'Great job! Level 3 measurer!',
      4: 'Awesome job! Level 4 measurer!',
      incomplete: '',
    },
  },
  language: {
    reading: {
      1: 'Bad job! Level 1 reader!',
      2: 'Good job! Level 2 reader!',
      3: 'Great job! Level 3 reader!',
      4: 'Awesome job! Level 4 reader!',
      incomplete: '',
    },
    writing: {
      1: 'Bad job! Level 1 writer!',
      2: 'Good job! Level 2 writer!',
      3: 'Great job! Level 3 writer!',
      4: 'Awesome job! Level 4 writer!',
      incomplete: '',
    },
  },
  science: {
    biology: {
      1: 'Bad job! Level 1 biologist!',
      2: 'Good job! Level 2 biologist!',
      3: 'Great job! Level 3 biologist!',
      4: 'Awesome job! Level 4 biologist!',
      incomplete: '',
    },
    chemistry: {
      1: 'Bad job! Level 1 chemist!',
      2: 'Good job! Level 2 chemist!',
      3: 'Great job! Level 3 chemist!',
      4: 'Awesome job! Level 4 chemist!',
      incomplete: '',
    },
  },
  } as const;