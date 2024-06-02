import { createContext } from "react";

export const TextContent = createContext<TextContentProps>({ text: '', setText: () => {} });
interface TextContentProps {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
}
