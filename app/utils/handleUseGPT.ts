export async function handleUseGPT(text: string, setText: React.Dispatch<React.SetStateAction<string>>, startConfetti: () => void, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>) {
  try {
    setIsLoading(true);
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({text}),
    });
    setText(await response.text());
    console.log('Confetti time!');
    startConfetti();
    setIsLoading(false);
  } catch (error) {
    console.error(error);
  }
}