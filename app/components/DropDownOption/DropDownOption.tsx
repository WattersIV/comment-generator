import { Sections } from "@/constants/subjects";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function DropDownOption({ section, title, levels }: { section: Sections[number], title: string, levels: [string, string, number][] }) {
  function onValueChange(value: string) {
    const form = document.getElementById('learning-skills-form') as HTMLFormElement;
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    form.requestSubmit(button);
  }
  return (
    <div key={section}>
      <Label className="font-semibold">{title}</Label>
      <div className="grid grid-cols-2 gap-2">
        <Select name={section} onValueChange={onValueChange}>
          <SelectTrigger id={`${section}-level`}>
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key='null' value="null">Null</SelectItem>
            {levels.map(([level, label, subsections]) => {
              return (
              <>
                {Array.from({ length: subsections }, (_, i) => {
                const itemName = subsections > 1 ? `${label} ${i + 1}` : `${label}`;
                return (
                  <SelectItem key={i} value={`${level}-${i + 1}`}>{itemName}</SelectItem>
                )
                })}
              </>
              )
            })}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title} skills</p>
      </div>
    </div>
  )
}