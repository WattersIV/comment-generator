import { toast } from 'sonner';

export async function handleUseGPT(
	text: string,
	setText: React.Dispatch<React.SetStateAction<string>>,
	startConfetti: () => void,
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
	activeTab: string
) {
	try {
		setIsLoading(true);
		const response = await fetch('/api/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ text, activeTab })
		});

		if (!response.ok) {
			throw new Error('Failed to refine comment');
		}

		setText(await response.text());
		toast.success('Comment refined with AI!');
		startConfetti();
	} catch (error) {
		console.error(error);
		toast.error('Failed to refine comment. Please try again.');
	} finally {
		setIsLoading(false);
	}
}
