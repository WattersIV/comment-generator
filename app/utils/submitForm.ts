import { CommentBank, commentBank } from "@/constants/commentBank";
import { Sections, Subject, languageSections, learningSkillSections, mathSections, scienceSections } from "@/constants/subjects";

export function handleSubmit(event: React.FormEvent<HTMLFormElement>, subject: Subject, setText: React.Dispatch<React.SetStateAction<string>>) {
  event.preventDefault()
  console.log('handling submit')
  const formData = new FormData(event.currentTarget)
  const data = Object.fromEntries(formData)

  switch (subject) {
    case 'math':
      const math = new MathStrategy()
      math.getData(data as Record<string, string>)
      setText(math.createComment())
      break
    case 'language':
      const language = new LanguageStrategy()
      language.getData(data as Record<string, string>)
      setText(language.createComment())
      break
    case 'science':
      const science = new ScienceStrategy()
      science.getData(data as Record<string, string>)
      setText(science.createComment())
      break
    case 'learning skills':
      const openingText = `In keeping with our Board's Spiritual theme, "We are called to open doors, build bridges, and nourish new beginnings," the school's learning skills focus for this reporting period has been to highlight and strengthen responsibility and organization with a board-wide focus on the Global Competency of critical thinking.`;
      const learningSkills = new LearningSkillStrategy()
      learningSkills.getData(data as Record<string, string>)
      setText(`${openingText} \n\n ${learningSkills.createComment()}`)
      break
  }
   
}

class Handler {
  public subject: Subject;
  public sections: Sections[];
  public data: Map<Sections[number], string> = new Map();
  private commentBank: CommentBank;
  constructor(subject: Subject, sections: Sections[]) {
    this.subject = subject;
    this.sections = sections;
    this.commentBank = commentBank;
  }
  createComment() {
    let comment = '';
    for (const [key, value] of this.data.entries()) {
      if (value && value !== 'null') {
        const sectionComment = this.commentBank[this.subject][key][value] + ' ';
        comment += sectionComment;
      }
    }

    comment = comment.trim();
    comment += ' SW';
    return comment;
  }
}

class MathStrategy extends Handler {
  constructor() {
    super('math', Array.from(mathSections, ([section]) => section));
  }
  getData(data: Record<string, string>) {
    // Dont iterate over the data object, just iterate over the sections for guaranteed order
    mathSections.forEach(section => {
      this.data.set(section[0], data[section[0]]);
    });
  }
}

class ScienceStrategy extends Handler {
  constructor() {
    super('science', Array.from(scienceSections, ([section]) => section));
  }
  getData(data: Record<string, string>) {
    // Dont iterate over the data object, just iterate over the sections for guaranteed order
    scienceSections.forEach(section => {
      this.data.set(section[0], data[section[0]]);
    });
  }
}

class LanguageStrategy extends Handler {
  constructor() {
    super('language', Array.from(languageSections, ([section]) => section));
  }
  getData(data: Record<string, string>) {
    // Dont iterate over the data object, just iterate over the sections for guaranteed order
    languageSections.forEach(section => {
      this.data.set(section[0], data[section[0]]);
    });
  }
}

class LearningSkillStrategy extends Handler {
  constructor() {
    super('learning skills', Array.from(learningSkillSections, ([section]) => section));
  }
  getData(data: Record<string, string>) {
    // Dont iterate over the data object, just iterate over the sections for guaranteed order
    learningSkillSections.forEach(section => {
      this.data.set(section[0], data[section[0]]);
    });
  }
}