import { CardContent } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import SubmitButton from "../SubmitButton/SubmitButton"
import {learningSkillSections } from "@/constants/subjects"
import DropDownOption from "../DropDownOption/DropDownOption"
import { handleSubmit } from "@/utils/submitForm"
import { useContext, useRef } from "react"
import { TextContent } from "@/contexts/TextContext"


export default function LearningSkills() {
  const {setText} = useContext(TextContent);
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form onSubmit={(e) => handleSubmit(e, 'learning skills', setText)} ref={formRef} id='learning-skills-form'>
      <TabsContent value="learning skills">
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {learningSkillSections.map(([section, levels]) => {
              const title = section.charAt(0).toUpperCase() + section.slice(1);
              return (
                <DropDownOption key={section} section={section} title={title} levels={levels} />
              )
            })}
          </div>
        </CardContent>
      </TabsContent>
      <SubmitButton />
    </form>
  )
}