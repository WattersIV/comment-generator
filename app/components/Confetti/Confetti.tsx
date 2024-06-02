import { ConfettiSwitch } from '@/contexts/ConfettiContext'
import { useContext } from 'react'
import ReactConfetti from 'react-confetti'
export default function Confetti() {
  const { confetti, setConfetti } = useContext(ConfettiSwitch)
  if (confetti) {
    setTimeout(() => {
      setConfetti(false)
    }, 2000)
  }
  return (
    confetti && <ReactConfetti />
  )
}