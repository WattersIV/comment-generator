import { createContext } from "react";

export const ConfettiSwitch = createContext<TextContentProps>({ confetti: false, setConfetti: () => {} });
interface TextContentProps {
  confetti: boolean;
  setConfetti: React.Dispatch<React.SetStateAction<boolean>>;
}
