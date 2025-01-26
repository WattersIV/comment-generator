'use client';

import { useContext, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TextContent } from '@/contexts/TextContext';
import { handleUseGPT } from '@/utils/handleUseGPT';
import { ConfettiSwitch } from '@/contexts/ConfettiContext';
import { DropdownMenuCheckboxes } from '../ui/checkbox-dropdown';

export default function CommentBox({ activeTab }: { activeTab: string }) {
	const { text, setText } = useContext(TextContent);
	const { setConfetti } = useContext(ConfettiSwitch);
	const [isLoading, setIsLoading] = useState(false);
	const [isLearningSkills, setIsLearningSkills] = useState(false);
	const handleCopyText = () => {
		navigator.clipboard.writeText(text);
	};

	function createItems() {
		return ['Learning Skills', 'Subjects'].map((item) => ({
			label: item,
			checked:
				(isLearningSkills && item === 'Learning Skills') ||
				(!isLearningSkills && item === 'Subjects'),
			onCheckedChange: () => setIsLearningSkills((prev) => !prev)
		}));
	}

	return (
		<div className="grid gap-2 h-full" style={{ gridTemplateRows: '5fr 1fr' }}>
			<div className="flex flex-col items-start gap-6 w-full flex-1">
				<Textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="Your text will be inserted here..."
					className="w-full rounded-md border border-gray-300 p-4 text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50 dark:focus:border-primary dark:focus:ring-primary"
				/>
				<p>Character Count: {text.length}</p>
			</div>
			<div className="flex content-between">
				<Button
					variant="outline"
					className="flex items-center gap-2 rounded-md px-4 py-2 text-base font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 w-fit m-auto"
					onClick={handleCopyText}
				>
					<CopyIcon className="h-5 w-5" />
					Copy Text
				</Button>
				<DropdownMenuCheckboxes items={createItems()} title={'Select Comment Type'} />
				<Button
					variant="default"
					className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-base font-medium text-gray-50 transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300 w-fit m-auto"
					onClick={() =>
						handleUseGPT(
							text,
							setText,
							() => setConfetti(true),
							setIsLoading,
							isLearningSkills ? 'learning skills' : 'subjects'
						)
					}
				>
					{isLoading ? <XIcon className="h-5 w-5 animate-spin" /> : <BotIcon className="h-5 w-5" />}
					Use GPT
				</Button>
			</div>
		</div>
	);
}

function CopyIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
			<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
		</svg>
	);
}

function BotIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M12 8V4H8" />
			<rect width="16" height="12" x="4" y="8" rx="2" />
			<path d="M2 14h2" />
			<path d="M20 14h2" />
			<path d="M15 13v2" />
			<path d="M9 13v2" />
		</svg>
	);
}

function XIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	);
}
