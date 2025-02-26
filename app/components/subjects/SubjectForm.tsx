import { CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import SubmitButton from '../SubmitButton/SubmitButton';
import { useContext, useEffect, useState } from 'react';
import { TextContent } from '@/contexts/TextContext';
import DropDownOption from '@/components/DropDownOption/DropDownOption';
type Sections = {
	name: string;
	children: {
		name: string;
		comment: string;
	}[];
}[];

export default function SubjectForm({
	sections,
	subject
}: {
	sections: Sections;
	subject: string;
}) {
	const { text, setText } = useContext(TextContent);
	const [subjectComments, setSubjectComments] = useState(
		sections.reduce((acc, section) => {
			acc[section.name] = '';
			return acc;
		}, {} as { [key: string]: string })
	);

	useEffect(() => {
		let comment = Object.values(subjectComments)
			.map((comment) => {
				return comment;
			})
			.join(' ');
		comment += ' SW';
		setText(comment);
	}, [subjectComments]);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				const formData = new FormData(e.currentTarget);
				const data = Object.fromEntries(formData.entries()) as { [k: string]: string };
				const comment = createSubjectComment(data, subjectComments);
				setSubjectComments(comment);
			}}
			id="learning-skills-form"
		>
			<TabsContent value={subject}>
				<CardContent className="space-y-6">
					<div className="grid gap-4">
						{sections.map((section) => (
							<DropDownOption
								key={section.name}
								section={section.name}
								title={section.name}
								levels={section.children}
							/>
						))}
					</div>
				</CardContent>
			</TabsContent>
			<SubmitButton />
		</form>
	);
}

function createSubjectComment(
	data: { [k: string]: string },
	subjectComments: { [key: string]: string }
) {
	let comment = { ...subjectComments };
	for (const [key, value] of Object.entries(data)) {
		if (value && value !== 'null') {
			const [level, commentValue] = value.split('|');
			comment[key] = commentValue.trim();
		}
	}
	return comment;
}
