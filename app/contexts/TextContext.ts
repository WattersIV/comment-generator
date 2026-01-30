import { createContext } from "react";

interface TextContentProps {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  isUserEdited: boolean;
  setIsUserEdited: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TextContent = createContext<TextContentProps>({
  text: '',
  setText: () => {},
  isUserEdited: false,
  setIsUserEdited: () => {},
});
