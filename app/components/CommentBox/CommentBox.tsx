'use client';

import { useContext, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TextContent } from '@/contexts/TextContext';
import { handleUseGPT } from '@/utils/handleUseGPT';
import { ConfettiSwitch } from '@/contexts/ConfettiContext';
import { DropdownMenuCheckboxes } from '../ui/checkbox-dropdown';
import { toast } from 'sonner';

export default function CommentBox({ activeTab }: { activeTab: string }) {
	const { text, setText, setIsUserEdited } = useContext(TextContent);
	const { setConfetti } = useContext(ConfettiSwitch);
	const [isLoading, setIsLoading] = useState(false);
	const [isLearningSkills, setIsLearningSkills] = useState(false);

	const handleCopyText = () => {
		navigator.clipboard.writeText(text);
		toast.success('Copied to clipboard!');
	};

	function createItems() {
		return ['Learning Skills', 'Subjects'].map((item) => ({
			label: item,
			checked:
				(isLearningSkills && item === 'Learning Skills') ||
				(!isLearningSkills && item === 'Subjects'),
			onCheckedChange: (checked: any) => {
				if (!checked) return;
				setIsLearningSkills(!isLearningSkills);
			}
		}));
	}

	return (
		<div className="grid gap-3 h-full" style={{ gridTemplateRows: '1fr auto' }}>
			<div className="flex flex-col items-start gap-4 w-full flex-1">
				{text ? (
					<Textarea
						value={text}
						onChange={(e) => {
							setText(e.target.value);
							setIsUserEdited(true);
						}}
						placeholder="Your text will be inserted here..."
						className="w-full rounded-md border border-input p-4 text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:bg-gray-800 dark:text-gray-50 dark:focus:border-primary dark:focus:ring-primary min-h-[200px] md:min-h-[400px] max-h-[70vh]"
					/>
				) : (
					<div className="w-full rounded-md border border-input p-8 min-h-[200px] md:min-h-[400px] flex items-center justify-center bg-muted/30">
						<p className="text-muted-foreground text-center max-w-md">
							Select a subject tab, then choose proficiency levels to build your comment.
						</p>
					</div>
				)}
				<p className="text-sm text-muted-foreground">Character Count: {text.length}</p>
			</div>
			<div className="flex flex-wrap items-center justify-center gap-3 py-2">
				<Button
					variant="outline"
					className="flex items-center gap-2 rounded-md px-4 py-2 text-base font-medium transition-colors hover:bg-muted"
					onClick={handleCopyText}
					disabled={!text}
				>
					<CopyIcon className="h-5 w-5" />
					Copy Text
				</Button>
				<DropdownMenuCheckboxes items={createItems()} title={isLearningSkills ? 'Learning Skills' : 'Subjects'} />
				<Button
					variant="default"
					className="flex items-center gap-2 rounded-md px-4 py-2 text-base font-medium"
					onClick={() =>
						handleUseGPT(
							text,
							setText,
							() => setConfetti(true),
							setIsLoading,
							isLearningSkills ? 'learning skills' : 'subjects'
						)
					}
					disabled={!text || isLoading}
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
