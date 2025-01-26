'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import { postComments } from '@/comments/actions';
import { DropdownMenuCheckboxes } from '../ui/checkbox-dropdown';
import { createClient } from '@/utils/supabase/client';

interface Level {
	name: string;
	comment: string;
}

interface FetchedLevel extends Level {
	id: string;
}

interface Section {
	name: string;
	children: Level[];
}

interface FetchedSectionData {
	section_name: string;
	id: string;
	children: FetchedLevel[];
}

export default function DynamicSubjectForm({
	commentVersions
}: {
	commentVersions: { version_name: string; id: string }[];
}) {
	const [commentVersion, setCommentVersion] = useState('');
	const commentVersionData = useRef<{ version_name: string; id: string }>();
	const [subjectName, setSubjectName] = useState('');
	const [fetchedSubjects, setFetchedSubjects] = useState<{ subject_name: string; id: string }[]>(
		[]
	);
	const [sections, setSections] = useState<Section[]>([
		{ name: '', children: [{ name: '', comment: '' }] }
	]);
	const fetchedSections = useRef<FetchedSectionData[]>([]);

	useEffect(() => {
		if (!commentVersion) return;

		const supabase = createClient();

		supabase
			.from('subjects')
			.select('subject_name, id')
			.eq('version_id', commentVersionData.current?.id)
			.then(({ data, error }) => {
				if (error) {
					console.error('Error getting subjects', error);
					return;
				}
				const formattedData = data.map((subject) => ({
					subject_name: subject.subject_name,
					id: subject.id
				}));
				setFetchedSubjects(formattedData);
			});
	}, [commentVersion]);

	useEffect(() => {
		if (!subjectName) return;
		const supabase = createClient();
		// Wow this sucks
		supabase
			.from('sections')
			.select('section_name, id')
			.eq('subject_id', fetchedSubjects.find((subject) => subject.subject_name === subjectName)?.id)
			.then(({ data, error }) => {
				if (error) {
					console.error('Error getting sections', error);
					return;
				}
				const formattedSectionsData = data.map((section) => ({
					section_name: section.section_name,
					id: section.id
				}));

				Promise.all(
					formattedSectionsData.map((section) =>
						supabase
							.from('levels')
							.select('level_name, comment, id')
							.eq('section_id', section.id)
							.then(({ data, error }) => {
								if (error) {
									console.error('Error getting levels', error);
									return { name: section.section_name, children: [] };
								}
								const formattedLevelsData = data.map((level) => ({
									name: level.level_name,
									comment: level.comment,
									id: level.id
								}));

								return {
									name: section.section_name,
									children: formattedLevelsData
								};
							})
					)
				).then((results) => {
					setSections(results);
					fetchedSections.current = formattedSectionsData.map((section, index) => ({
						section_name: section.section_name,
						id: section.id,
						children: results[index].children.map((child) => ({
							...child,
							id: child.id
						}))
					}));
				});
			});
	}, [fetchedSubjects, subjectName]);

	const addSection = () => {
		setSections([...sections, { name: '', children: [{ name: '', comment: '' }] }]);
	};

	const removeSection = (index: number, name: string) => {
		const newSections = [...sections];
		newSections.splice(index, 1);
		setSections(newSections);
		console.log('passed name', name, fetchedSections.current);
		const fetchedSection = fetchedSections.current.find((section) => section.section_name === name);
		console.log(fetchedSection);
		if (fetchedSection) {
			const id = fetchedSection.id;
			fetch(`/api/comments?type=sections&id=${id}`, {
				method: 'DELETE'
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error('Failed to delete section');
					}
					console.log('Section deleted successfully');
				})
				.catch((error) => {
					console.error('Error:', error);
				});
		}
	};

	const addLevel = (sectionIndex: number) => {
		const newSections = [...sections];
		newSections[sectionIndex].children.push({ name: '', comment: '' });
		setSections(newSections);
	};

	const removeLevel = (sectionIndex: number, levelIndex: number, name: string) => {
		const newSections = [...sections];
		newSections[sectionIndex].children.splice(levelIndex, 1);
		setSections(newSections);
		const fetchedLevel = fetchedSections.current[sectionIndex].children.find(
			(level) => level.name === name
		);
		if (fetchedLevel) {
			const id = fetchedLevel.id;
			fetch(`/api/comments?type=levels&id=${id}`, {
				method: 'DELETE'
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error('Failed to delete level');
					}
					console.log('Level deleted successfully');
				})
				.catch((error) => {
					console.error('Error:', error);
				});
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const formattedSections = sections.reduce((acc, section) => {
			const levels = section.children.reduce((levelAcc, level) => {
				levelAcc[level.name] = level.comment;
				return levelAcc;
			}, {} as Record<string, string>);
			acc[section.name] = levels;
			return acc;
		}, {} as Record<string, Record<string, string>>);

		const formattedData = {
			commentVersion,
			subjectName,
			sections: formattedSections
		};
		postComments(formattedData);
	};

	const dropdownItems = commentVersions.map((version) => ({
		label: version.version_name,
		checked: false,
		onCheckedChange: (checked: boolean) => {
			if (checked) {
				setCommentVersion(version.version_name);
				commentVersionData.current = version;
			}
		}
	}));

	function formatCheckboxItems(items: string[]) {
		return items.map((item) => ({
			label: item,
			checked: false,
			onCheckedChange: (checked: boolean) => {
				if (checked) {
					setSubjectName(item);
				}
			}
		}));
	}

	return (
		<form className="space-y-6 max-w-2xl mx-auto p-6" onSubmit={handleSubmit}>
			<div>
				<Input
					placeholder="Comment Version"
					name="commentVersion"
					value={commentVersion}
					onChange={(e) => setCommentVersion(e.target.value)}
					required
				/>
			</div>
			{dropdownItems.length > 0 && (
				<DropdownMenuCheckboxes items={dropdownItems} title="Previous Versions" />
			)}
			<div>
				<Input
					placeholder="Subject Name"
					name="subjectName"
					value={subjectName}
					onChange={(e) => setSubjectName(e.target.value)}
					required
				/>
			</div>
			{fetchedSubjects.length > 0 && (
				<DropdownMenuCheckboxes
					items={formatCheckboxItems(fetchedSubjects.map((subject) => subject.subject_name))}
					title="Previous Subjects"
				/>
			)}
			{sections.map((section, sectionIndex) => (
				<Card key={sectionIndex}>
					<CardHeader>
						<CardTitle className="flex justify-between items-center">
							<Input
								placeholder="Section Name"
								value={section.name}
								name="sectionName"
								onChange={(e) => {
									const newSections = [...sections];
									newSections[sectionIndex].name = e.target.value;
									setSections(newSections);
								}}
								required
							/>
							<Button
								type="button"
								variant="destructive"
								size="icon"
								onClick={() => removeSection(sectionIndex, section.name)}
								className="ml-6"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{section.children.map((level, levelIndex) => (
							<div key={levelIndex} className="grid grid-cols-[1fr,2fr,auto] gap-2">
								<Input
									placeholder="Level Name"
									name="levelName"
									value={level.name}
									onChange={(e) => {
										const newSections = [...sections];
										newSections[sectionIndex].children[levelIndex].name = e.target.value;
										setSections(newSections);
									}}
									required
								/>
								<Textarea
									placeholder="Level Comment"
									name="levelComment"
									value={level.comment}
									onChange={(e) => {
										const newSections = [...sections];
										newSections[sectionIndex].children[levelIndex].comment = e.target.value;
										setSections(newSections);
									}}
									required
								/>
								<Button
									type="button"
									variant="destructive"
									size="icon"
									onClick={() => removeLevel(sectionIndex, levelIndex, level.name)}
									className="ml-6"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						))}
						<Button
							type="button"
							variant="outline"
							onClick={() => addLevel(sectionIndex)}
							className="w-full"
						>
							<PlusCircle className="h-4 w-4 mr-2" /> Add Level
						</Button>
					</CardContent>
				</Card>
			))}

			<Button type="button" onClick={addSection} className="w-full">
				<PlusCircle className="h-4 w-4 mr-2" /> Add Section
			</Button>

			<Button type="submit" className="w-full">
				Submit
			</Button>
		</form>
	);
}
