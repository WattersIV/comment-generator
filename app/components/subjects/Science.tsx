import { CardContent } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import SubmitButton from "../SubmitButton/SubmitButton"
import { scienceSections } from "@/constants/subjects"
import DropDownOption from "../DropDownOption/DropDownOption"
import { handleSubmit } from "@/utils/submitForm"
import { useContext } from "react"
import { TextContent } from "@/contexts/TextContext"

export default function ScienceForm() {
  const {setText} = useContext(TextContent);
  return (
    <form onSubmit={(e) => handleSubmit(e, 'science', setText)}>
      <TabsContent value="science">
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {scienceSections.map((section) => {
              const title = section.charAt(0).toUpperCase() + section.slice(1);
              return (
                <DropDownOption key={section} section={section} title={title} />
              )
            })}
          </div>
        </CardContent>
      </TabsContent>
      <SubmitButton />
    </form>
  )
}