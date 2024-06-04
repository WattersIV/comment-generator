import { CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import SubmitButton from "../SubmitButton/SubmitButton";
import { handleSubmit } from "@/utils/submitForm";
import { mathSections } from "@/constants/subjects";
import DropDownOption from "../DropDownOption/DropDownOption";
import { useContext } from "react"
import { TextContent } from "@/contexts/TextContext"

export default function MathForm() {
  const {setText} = useContext(TextContent);
  return (
    <form onSubmit={(e) => handleSubmit(e, 'math', setText)}>
      <TabsContent value="math">
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {mathSections.map(([section, levels]) => {
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
  );
}