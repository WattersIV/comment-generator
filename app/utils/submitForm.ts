import { CommentBank, commentBank } from "@/constants/commentBank";
import { Level, Sections, Subject, languageSections, mathSections, scienceSections } from "@/constants/subjects";

export function handleSubmit(event: React.FormEvent<HTMLFormElement>, subject: Subject, setText: React.Dispatch<React.SetStateAction<string>>) {
  event.preventDefault()
  const formData = new FormData(event.currentTarget)
  const data = Object.fromEntries(formData)

  switch (subject) {
    case 'math':
      const math = new MathStrategy()
      math.getData(data as { [K in typeof mathSections[number]]: Level })
      setText(math.createComment())
      break
    case 'language':
      const language = new LanguageStrategy()
      language.getData(data as { [K in typeof languageSections[number]]: Level })
      setText(language.createComment())
      break
    case 'science':
      const science = new ScienceStrategy()
      science.getData(data as { [K in typeof scienceSections[number]]: Level })
      setText(science.createComment())
      break
  }
   
}

class Handler {
  public subject: Subject;
  public sections: Sections;
  public data: Map<Sections[number], Level> = new Map();
  private commentBank: CommentBank;
  constructor(subject: Subject, sections: Sections) {
    this.subject = subject;
    this.sections = sections;
    this.commentBank = commentBank;
  }
  createComment() {
    let comment = '';
    console.log(this.data);
    for (const [key, value] of this.data.entries()) {
      if (value) {
        const sectionComment = this.commentBank[this.subject][key][value] + ' ';
        comment += sectionComment;
      }
    }

    comment = comment.trim();
    return comment;
  }
}

class MathStrategy extends Handler {
  constructor() {
    super('math', mathSections);
  }
  getData(data: { [K in typeof mathSections[number]]: Level }) {
    // Dont iterate over the data object, just iterate over the sections for guaranteed order
    mathSections.forEach(section => {
      this.data.set(section, data[section]);
    });
  }
}

class ScienceStrategy extends Handler {
  constructor() {
    super('science', scienceSections);
  }
  getData(data: { [K in typeof scienceSections[number]]: Level }) {
    // Dont iterate over the data object, just iterate over the sections for guaranteed order
    scienceSections.forEach(section => {
      this.data.set(section, data[section]);
    });
  }
}

class LanguageStrategy extends Handler {
  constructor() {
    super('language', languageSections);
  }
  getData(data: { [K in typeof languageSections[number]]: Level }) {
    // Dont iterate over the data object, just iterate over the sections for guaranteed order
    languageSections.forEach(section => {
      this.data.set(section, data[section]);
    });
  }
}