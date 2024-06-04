import { Sections } from "@/constants/subjects";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from "@/components/ui/select";
import { SelectLabel } from "@radix-ui/react-select";

export default function DropDownOption({ section, title, levels }: { section: Sections[number], title: string, levels: [string, string, number][] }) {
  return (
    <div key={section}>
      <Label className="font-semibold">{title}</Label>
      <div className="grid grid-cols-2 gap-2">
        <Select name={section}>
          <SelectTrigger id={`${section}-level`}>
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            {levels.map(([level, label, subsections]) => {
              return (
                <SelectGroup key={level}>
                  <SelectLabel>{label}</SelectLabel>
                  {Array.from({ length: subsections }, (_, i) => {
                    const itemName = subsections > 1 ? `${label} ${i + 1}` : `${label}`;
                    return (
                      <SelectItem key={i} value={`${level}-${i + 1}`}>{itemName}</SelectItem>
                    )
                  })}
                </SelectGroup>
              )
            })}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title} skills</p>
      </div>
    </div>
  )
}