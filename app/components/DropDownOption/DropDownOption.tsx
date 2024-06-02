import { Sections } from "@/constants/subjects";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function DropDownOption({ section, title}: { section: Sections[number], title: string }) {
  return (
    <div key={section}>
    <Label className="font-semibold">{title}</Label>
    <div className="grid grid-cols-2 gap-2">
      <Select name={section}>
        <SelectTrigger id={`${section}-level`}>
          <SelectValue placeholder="Select level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="4">Level 4 🌟</SelectItem>
          <SelectItem value="3">Level 3 ✔️</SelectItem>
          <SelectItem value="2">Level 2 😕</SelectItem>
          <SelectItem value="1">Level 1 😢</SelectItem>
          <SelectItem value="incomplete">Incomplete 👺</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title} skills</p>
    </div>
  </div>
  )
}