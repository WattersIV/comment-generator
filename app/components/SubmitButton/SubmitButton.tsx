import {CardFooter } from "@/components/ui/card"

import { Button } from "@/components/ui/button"

export default function SubmitButton() {
  return (
    <CardFooter className="flex justify-center">
    <Button type="submit" className="px-8 py-2 text-lg">
      Do it up 🚀
    </Button>
  </CardFooter>
  )
}