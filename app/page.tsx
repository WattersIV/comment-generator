"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MathForm from "./components/subjects/Math"
import LanguageForm from "./components/subjects/Language"
import ScienceForm from "./components/subjects/Science"
import CommentBox from "./components/CommentBox/CommentBox"
import { TextContent } from "./contexts/TextContext"
import dynamic from "next/dynamic"
import { ConfettiSwitch } from "./contexts/ConfettiContext"
const Confetti = dynamic(() => import('@/components/Confetti/Confetti'), { ssr: false })



export default function Page() {
  const [text, setText] = useState('');
  const [confetti, setConfetti] = useState(false)
  const [activeTab, setActiveTab] = useState("math")
  const subjectForm = activeTab === "math" ? <MathForm /> : activeTab === "language" ? <LanguageForm /> : <ScienceForm />
  return (
    <TextContent.Provider value={{ text, setText }}>
      <ConfettiSwitch.Provider value={{ confetti, setConfetti }}>
        <div className="grid grid-cols-2 h-screen gap-4" style={{ gridTemplateColumns: '1fr 3fr' }}>
          <div className="col-span-1">
            <Card className="w-full ">
              <CardHeader>
                <CardTitle>Comment Generator</CardTitle>
                <CardDescription />
              </CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="border-b">
                <TabsList className="flex">
                  <TabsTrigger value="math">Math</TabsTrigger>
                  <TabsTrigger value="language">Language</TabsTrigger>
                  <TabsTrigger value="science">Science</TabsTrigger>
                </TabsList>
                {subjectForm}
              </Tabs>
            </Card>
          </div>
          <div className="col-span-1">
            <CommentBox />
          </div>
        </div>
        <Confetti />
      </ConfettiSwitch.Provider>
    </TextContent.Provider>
  )
}