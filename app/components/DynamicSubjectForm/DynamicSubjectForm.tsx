'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	PlusCircle,
	Trash2,
	ChevronDown,
	ChevronRight,
	Save,
	FolderOpen,
	FileText,
	Layers,
	BookOpen
} from 'lucide-react';
import { postComments } from '@/comments/actions';
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

type EditingItem =
	| { type: 'version' }
	| { type: 'subject' }
	| { type: 'section'; index: number }
	| { type: 'level'; sectionIndex: number; levelIndex: number }
	| null;

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
	const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
	const [editingItem, setEditingItem] = useState<EditingItem>(null);
	const [isSaving, setIsSaving] = useState(false);

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
					setExpandedSections(new Set(results.map((_, i) => i)));
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
		const newIndex = sections.length;
		setSections([...sections, { name: '', children: [{ name: '', comment: '' }] }]);
		setExpandedSections((prev) => new Set([...prev, newIndex]));
		setEditingItem({ type: 'section', index: newIndex });
	};

	const removeSection = useCallback((index: number, name: string) => {
		setSections((prev) => {
			const newSections = [...prev];
			newSections.splice(index, 1);
			return newSections;
		});
		setExpandedSections((prev) => {
			const newSet = new Set<number>();
			prev.forEach((i) => {
				if (i < index) newSet.add(i);
				else if (i > index) newSet.add(i - 1);
			});
			return newSet;
		});
		setEditingItem(null);

		const fetchedSection = fetchedSections.current.find((section) => section.section_name === name);
		if (fetchedSection) {
			fetch(`/api/comments?type=sections&id=${fetchedSection.id}`, {
				method: 'DELETE'
			}).catch((error) => {
				console.error('Error:', error);
			});
		}
	}, []);

	const addLevel = (sectionIndex: number) => {
		const newSections = [...sections];
		const newLevelIndex = newSections[sectionIndex].children.length;
		newSections[sectionIndex].children.push({ name: '', comment: '' });
		setSections(newSections);
		setEditingItem({ type: 'level', sectionIndex, levelIndex: newLevelIndex });
	};

	const removeLevel = useCallback((sectionIndex: number, levelIndex: number, name: string) => {
		setSections((prev) => {
			const newSections = [...prev];
			newSections[sectionIndex].children.splice(levelIndex, 1);
			return newSections;
		});
		setEditingItem(null);

		const fetchedLevel = fetchedSections.current[sectionIndex]?.children.find(
			(level) => level.name === name
		);
		if (fetchedLevel) {
			fetch(`/api/comments?type=levels&id=${fetchedLevel.id}`, {
				method: 'DELETE'
			}).catch((error) => {
				console.error('Error:', error);
			});
		}
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);

		const formattedSections = sections.reduce(
			(acc, section) => {
				const levels = section.children.reduce(
					(levelAcc, level) => {
						levelAcc[level.name] = level.comment;
						return levelAcc;
					},
					{} as Record<string, string>
				);
				acc[section.name] = levels;
				return acc;
			},
			{} as Record<string, Record<string, string>>
		);

		const formattedData = {
			commentVersion,
			subjectName,
			sections: formattedSections
		};
		await postComments(formattedData);
		setIsSaving(false);
	};

	const toggleSection = (index: number) => {
		setExpandedSections((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(index)) {
				newSet.delete(index);
			} else {
				newSet.add(index);
			}
			return newSet;
		});
	};

	const handleVersionSelect = (versionName: string) => {
		setCommentVersion(versionName);
		const version = commentVersions.find((v) => v.version_name === versionName);
		if (version) {
			commentVersionData.current = version;
		}
		setSubjectName('');
		setSections([{ name: '', children: [{ name: '', comment: '' }] }]);
		setEditingItem({ type: 'subject' });
	};

	const handleSubjectSelect = (subjectNameValue: string) => {
		setSubjectName(subjectNameValue);
		setEditingItem(null);
	};

	const updateSectionName = (index: number, name: string) => {
		const newSections = [...sections];
		newSections[index].name = name;
		setSections(newSections);
	};

	const updateLevelName = (sectionIndex: number, levelIndex: number, name: string) => {
		const newSections = [...sections];
		newSections[sectionIndex].children[levelIndex].name = name;
		setSections(newSections);
	};

	const updateLevelComment = (sectionIndex: number, levelIndex: number, comment: string) => {
		const newSections = [...sections];
		newSections[sectionIndex].children[levelIndex].comment = comment;
		setSections(newSections);
	};

	const isFormValid =
		commentVersion &&
		subjectName &&
		sections.every(
			(s) => s.name && s.children.every((l) => l.name && l.comment)
		);

	return (
		<div className="h-full flex flex-col">
			{/* Sticky Header */}
			<div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
				<h1 className="text-xl font-semibold">Comment Manager</h1>
				<Button
					onClick={handleSubmit}
					disabled={!isFormValid || isSaving}
					className="gap-2"
				>
					<Save className="h-4 w-4" />
					{isSaving ? 'Saving...' : 'Save Changes'}
				</Button>
			</div>

			<div className="flex-1 flex overflow-hidden">
				{/* Sidebar Navigation */}
				<div className="w-72 border-r bg-muted/30 overflow-y-auto">
					<div className="p-4 space-y-4">
						{/* Version Selector */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<FolderOpen className="h-4 w-4" />
								Version
							</label>
							{commentVersions.length > 0 ? (
								<Select value={commentVersion} onValueChange={handleVersionSelect}>
									<SelectTrigger>
										<SelectValue placeholder="Select or type new..." />
									</SelectTrigger>
									<SelectContent>
										{commentVersions.map((v) => (
											<SelectItem key={v.id} value={v.version_name}>
												{v.version_name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							) : null}
							<Input
								placeholder="New version name"
								value={commentVersion}
								onChange={(e) => {
									setCommentVersion(e.target.value);
									setSubjectName('');
									setFetchedSubjects([]);
								}}
								className="text-sm"
							/>
						</div>

						{/* Subject Selector */}
						{commentVersion && (
							<div className="space-y-2">
								<label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
									<BookOpen className="h-4 w-4" />
									Subject
								</label>
								{fetchedSubjects.length > 0 ? (
									<Select value={subjectName} onValueChange={handleSubjectSelect}>
										<SelectTrigger>
											<SelectValue placeholder="Select or type new..." />
										</SelectTrigger>
										<SelectContent>
											{fetchedSubjects.map((s) => (
												<SelectItem key={s.id} value={s.subject_name}>
													{s.subject_name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								) : null}
								<Input
									placeholder="New subject name"
									value={subjectName}
									onChange={(e) => setSubjectName(e.target.value)}
									className="text-sm"
								/>
							</div>
						)}

						{/* Sections Tree */}
						{subjectName && (
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
										<Layers className="h-4 w-4" />
										Sections
									</label>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={addSection}
										className="h-7 px-2 text-xs"
									>
										<PlusCircle className="h-3 w-3 mr-1" />
										Add
									</Button>
								</div>

								<div className="space-y-1">
									{sections.map((section, sectionIndex) => (
										<div key={sectionIndex} className="rounded-md overflow-hidden">
											<div
												className={`w-full flex items-center gap-1 px-2 py-1.5 text-sm hover:bg-muted rounded-md transition-colors ${
													editingItem?.type === 'section' &&
													editingItem.index === sectionIndex
														? 'bg-muted'
														: ''
												}`}
											>
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														toggleSection(sectionIndex);
													}}
													className="p-0.5 hover:bg-background rounded"
												>
													{expandedSections.has(sectionIndex) ? (
														<ChevronDown className="h-4 w-4 text-muted-foreground" />
													) : (
														<ChevronRight className="h-4 w-4 text-muted-foreground" />
													)}
												</button>
												<button
													type="button"
													onClick={() =>
														setEditingItem({ type: 'section', index: sectionIndex })
													}
													className="truncate flex-1 text-left flex items-center gap-1.5"
												>
													<Layers className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
													{section.name || 'Unnamed Section'}
												</button>
												<span className="text-xs text-muted-foreground">
													{section.children.length}
												</span>
											</div>

											{expandedSections.has(sectionIndex) && (
												<div className="ml-6 space-y-0.5 mt-1">
													{section.children.map((level, levelIndex) => (
														<button
															key={levelIndex}
															type="button"
															onClick={() =>
																setEditingItem({
																	type: 'level',
																	sectionIndex,
																	levelIndex
																})
															}
															className={`w-full flex items-center gap-2 px-2 py-1 text-sm text-left hover:bg-muted rounded-md transition-colors ${
																editingItem?.type === 'level' &&
																editingItem.sectionIndex === sectionIndex &&
																editingItem.levelIndex === levelIndex
																	? 'bg-muted'
																	: ''
															}`}
														>
															<FileText className="h-3 w-3 text-muted-foreground" />
															<span className="truncate">
																{level.name || 'Unnamed Level'}
															</span>
														</button>
													))}
													<button
														type="button"
														onClick={() => addLevel(sectionIndex)}
														className="w-full flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
													>
														<PlusCircle className="h-3 w-3" />
														Add Level
													</button>
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Main Content Area */}
				<div className="flex-1 overflow-y-auto p-6">
					{!commentVersion && (
						<div className="h-full flex items-center justify-center text-muted-foreground">
							<div className="text-center space-y-2">
								<FolderOpen className="h-12 w-12 mx-auto opacity-50" />
								<p>Select or create a version to get started</p>
							</div>
						</div>
					)}

					{commentVersion && !subjectName && (
						<div className="h-full flex items-center justify-center text-muted-foreground">
							<div className="text-center space-y-2">
								<BookOpen className="h-12 w-12 mx-auto opacity-50" />
								<p>Select or create a subject</p>
							</div>
						</div>
					)}

					{commentVersion && subjectName && !editingItem && (
						<div className="h-full flex items-center justify-center text-muted-foreground">
							<div className="text-center space-y-2">
								<FileText className="h-12 w-12 mx-auto opacity-50" />
								<p>Select a section or level from the sidebar to edit</p>
							</div>
						</div>
					)}

					{/* Section Editor */}
					{editingItem?.type === 'section' && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Edit Section</span>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										onClick={() =>
											removeSection(editingItem.index, sections[editingItem.index]?.name)
										}
									>
										<Trash2 className="h-4 w-4 mr-2" />
										Delete Section
									</Button>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<label className="text-sm font-medium">Section Name</label>
									<Input
										placeholder="e.g., Number Sense, Reading Comprehension"
										value={sections[editingItem.index]?.name || ''}
										onChange={(e) => updateSectionName(editingItem.index, e.target.value)}
										autoFocus
									/>
								</div>

								<div className="pt-4 border-t">
									<div className="flex items-center justify-between mb-3">
										<h4 className="text-sm font-medium">
											Levels ({sections[editingItem.index]?.children.length || 0})
										</h4>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => addLevel(editingItem.index)}
										>
											<PlusCircle className="h-4 w-4 mr-2" />
											Add Level
										</Button>
									</div>

									<div className="space-y-3">
										{sections[editingItem.index]?.children.map((level, levelIndex) => (
											<div
												key={levelIndex}
												className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
												onClick={() =>
													setEditingItem({
														type: 'level',
														sectionIndex: editingItem.index,
														levelIndex
													})
												}
											>
												<FileText className="h-4 w-4 text-muted-foreground" />
												<span className="flex-1 text-sm">
													{level.name || 'Unnamed Level'}
												</span>
												<span className="text-xs text-muted-foreground">
													{level.comment.length} chars
												</span>
											</div>
										))}
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Level Editor */}
					{editingItem?.type === 'level' && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<div className="space-y-1">
										<span>Edit Level</span>
										<p className="text-sm font-normal text-muted-foreground">
											{sections[editingItem.sectionIndex]?.name || 'Unnamed Section'}
										</p>
									</div>
									<div className="flex gap-2">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() =>
												setEditingItem({ type: 'section', index: editingItem.sectionIndex })
											}
										>
											Back to Section
										</Button>
										<Button
											type="button"
											variant="destructive"
											size="sm"
											onClick={() =>
												removeLevel(
													editingItem.sectionIndex,
													editingItem.levelIndex,
													sections[editingItem.sectionIndex]?.children[editingItem.levelIndex]
														?.name
												)
											}
										>
											<Trash2 className="h-4 w-4 mr-2" />
											Delete
										</Button>
									</div>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<label className="text-sm font-medium">Level Name</label>
									<Input
										placeholder="e.g., Progressing Well, Meeting Expectations"
										value={
											sections[editingItem.sectionIndex]?.children[editingItem.levelIndex]
												?.name || ''
										}
										onChange={(e) =>
											updateLevelName(
												editingItem.sectionIndex,
												editingItem.levelIndex,
												e.target.value
											)
										}
										autoFocus
									/>
								</div>

								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<label className="text-sm font-medium">Comment</label>
										<span className="text-xs text-muted-foreground">
											{sections[editingItem.sectionIndex]?.children[editingItem.levelIndex]
												?.comment.length || 0}{' '}
											characters
										</span>
									</div>
									<Textarea
										placeholder="Enter the comment for this proficiency level..."
										value={
											sections[editingItem.sectionIndex]?.children[editingItem.levelIndex]
												?.comment || ''
										}
										onChange={(e) =>
											updateLevelComment(
												editingItem.sectionIndex,
												editingItem.levelIndex,
												e.target.value
											)
										}
										className="min-h-[200px] resize-y"
									/>
									<p className="text-xs text-muted-foreground">
										Use *N* for name, *P* for pronoun, *H* for his/her, *R* for he/she
									</p>
								</div>

								{/* Quick navigation to adjacent levels */}
								<div className="pt-4 border-t flex justify-between">
									<Button
										type="button"
										variant="ghost"
										size="sm"
										disabled={editingItem.levelIndex === 0}
										onClick={() =>
											setEditingItem({
												type: 'level',
												sectionIndex: editingItem.sectionIndex,
												levelIndex: editingItem.levelIndex - 1
											})
										}
									>
										Previous Level
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										disabled={
											editingItem.levelIndex >=
											sections[editingItem.sectionIndex]?.children.length - 1
										}
										onClick={() =>
											setEditingItem({
												type: 'level',
												sectionIndex: editingItem.sectionIndex,
												levelIndex: editingItem.levelIndex + 1
											})
										}
									>
										Next Level
									</Button>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
