'use client';

import { useEffect, useState, useCallback } from 'react';
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
	BookOpen,
	GripVertical
} from 'lucide-react';
import { postComments } from '@/comments/actions';
import { createClient } from '@/utils/supabase/client';

interface Level {
	// Present once the level has been saved; absent for unsaved new levels.
	id?: string;
	name: string;
	comment: string;
}

interface Section {
	id?: string;
	name: string;
	children: Level[];
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
	// Local mirror of the versions list so a rename reflects in the dropdown
	// without a reload.
	const [versions, setVersions] = useState(commentVersions);
	// Id of the saved version/subject currently being edited (null when none is
	// selected), and whether the user is creating a new one. Tracked separately
	// from the name so renaming updates the row in place instead of looking it up
	// (and failing to find it) by name.
	const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
	const [creatingVersion, setCreatingVersion] = useState(false);
	const [subjectName, setSubjectName] = useState('');
	const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
	const [creatingSubject, setCreatingSubject] = useState(false);
	const [fetchedSubjects, setFetchedSubjects] = useState<{ subject_name: string; id: string }[]>(
		[]
	);
	const [sections, setSections] = useState<Section[]>([
		{ name: '', children: [{ name: '', comment: '' }] }
	]);
	const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
	const [editingItem, setEditingItem] = useState<EditingItem>(null);
	const [isSaving, setIsSaving] = useState(false);
	// Drag-and-drop reorder state. `null` means nothing is being dragged / hovered.
	const [dragSection, setDragSection] = useState<number | null>(null);
	const [dragOverSection, setDragOverSection] = useState<number | null>(null);
	const [dragLevel, setDragLevel] = useState<{ sectionIndex: number; levelIndex: number } | null>(
		null
	);
	const [dragOverLevel, setDragOverLevel] = useState<{
		sectionIndex: number;
		levelIndex: number;
	} | null>(null);

	useEffect(() => {
		if (!selectedVersionId) return;

		const supabase = createClient();

		supabase
			.from('subjects')
			.select('subject_name, id')
			.eq('version_id', selectedVersionId)
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
	}, [selectedVersionId]);

	useEffect(() => {
		if (!selectedSubjectId) return;
		const supabase = createClient();

		supabase
			.from('sections')
			.select('section_name, id')
			.eq('subject_id', selectedSubjectId)
			.order('sort_order', { ascending: true })
			.order('id', { ascending: true })
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
							.order('sort_order', { ascending: true })
							.order('id', { ascending: true })
							.then(({ data, error }) => {
								if (error) {
									console.error('Error getting levels', error);
									return { id: section.id, name: section.section_name, children: [] };
								}
								const formattedLevelsData = data.map((level) => ({
									id: level.id,
									name: level.level_name,
									comment: level.comment
								}));

								return {
									id: section.id,
									name: section.section_name,
									children: formattedLevelsData
								};
							})
					)
				).then((results) => {
					setSections(results);
					setExpandedSections(new Set(results.map((_, i) => i)));
				});
			});
	}, [selectedSubjectId]);

	const addSection = () => {
		const newIndex = sections.length;
		setSections([...sections, { name: '', children: [{ name: '', comment: '' }] }]);
		setExpandedSections((prev) => new Set([...prev, newIndex]));
		setEditingItem({ type: 'section', index: newIndex });
	};

	const removeSection = useCallback((index: number, id?: string) => {
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

		if (id) {
			fetch(`/api/comments?type=sections&id=${id}`, {
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

	const removeLevel = useCallback((sectionIndex: number, levelIndex: number, id?: string) => {
		setSections((prev) => {
			const newSections = [...prev];
			newSections[sectionIndex].children.splice(levelIndex, 1);
			return newSections;
		});
		setEditingItem(null);

		if (id) {
			fetch(`/api/comments?type=levels&id=${id}`, {
				method: 'DELETE'
			}).catch((error) => {
				console.error('Error:', error);
			});
		}
	}, []);

	// Given a move of an item from `from` to `to`, return where the item
	// currently at `index` ends up. Used to keep index-based state (expanded
	// sections, the active editing item) pointing at the right rows after a reorder.
	const remapIndex = (index: number, from: number, to: number) => {
		if (index === from) return to;
		if (from < to) return index > from && index <= to ? index - 1 : index;
		return index >= to && index < from ? index + 1 : index;
	};

	const moveSection = (from: number, to: number) => {
		if (from === to) return;
		setSections((prev) => {
			const next = [...prev];
			const [moved] = next.splice(from, 1);
			next.splice(to, 0, moved);
			return next;
		});
		setExpandedSections((prev) => {
			const next = new Set<number>();
			prev.forEach((i) => next.add(remapIndex(i, from, to)));
			return next;
		});
		setEditingItem((prev) => {
			if (!prev) return prev;
			if (prev.type === 'section') return { ...prev, index: remapIndex(prev.index, from, to) };
			if (prev.type === 'level')
				return { ...prev, sectionIndex: remapIndex(prev.sectionIndex, from, to) };
			return prev;
		});
	};

	const moveLevel = (sectionIndex: number, from: number, to: number) => {
		if (from === to) return;
		setSections((prev) => {
			const next = [...prev];
			const children = [...next[sectionIndex].children];
			const [moved] = children.splice(from, 1);
			children.splice(to, 0, moved);
			next[sectionIndex] = { ...next[sectionIndex], children };
			return next;
		});
		setEditingItem((prev) => {
			if (prev?.type === 'level' && prev.sectionIndex === sectionIndex)
				return { ...prev, levelIndex: remapIndex(prev.levelIndex, from, to) };
			return prev;
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);

		// Send arrays carrying ids + explicit order so the server updates rows in
		// place (renames don't duplicate) and persists drag-and-drop order.
		const payloadSections = sections.map((section, sectionIndex) => ({
			id: section.id ?? null,
			name: section.name,
			sortOrder: sectionIndex,
			levels: section.children.map((level, levelIndex) => ({
				id: level.id ?? null,
				name: level.name,
				comment: level.comment,
				sortOrder: levelIndex
			}))
		}));

		const formattedData = {
			commentVersion,
			versionId: selectedVersionId,
			subjectName,
			subjectId: selectedSubjectId,
			sections: payloadSections
		};
		const result = await postComments(formattedData);
		setIsSaving(false);
		if (!result) return;

		// Adopt the saved ids so subsequent edits/renames update in place rather
		// than creating duplicates, and reflect renames in the dropdowns without
		// a reload.
		setSelectedVersionId(result.versionId);
		setSelectedSubjectId(result.subjectId);
		setCreatingVersion(false);
		setCreatingSubject(false);
		setSections((prev) =>
			prev.map((section, sectionIndex) => ({
				...section,
				id: result.sections[sectionIndex]?.id ?? section.id,
				children: section.children.map((level, levelIndex) => ({
					...level,
					id: result.sections[sectionIndex]?.levels[levelIndex]?.id ?? level.id
				}))
			}))
		);
		setVersions((prev) =>
			prev.some((v) => v.id === result.versionId)
				? prev.map((v) => (v.id === result.versionId ? { ...v, version_name: commentVersion } : v))
				: [...prev, { id: result.versionId, version_name: commentVersion }]
		);
		setFetchedSubjects((prev) =>
			prev.some((s) => s.id === result.subjectId)
				? prev.map((s) => (s.id === result.subjectId ? { ...s, subject_name: subjectName } : s))
				: [...prev, { id: result.subjectId, subject_name: subjectName }]
		);
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

	const blankSections = () => [{ name: '', children: [{ name: '', comment: '' }] }];

	const handleVersionSelect = (versionName: string) => {
		const version = versions.find((v) => v.version_name === versionName);
		setCommentVersion(versionName);
		setSelectedVersionId(version?.id ?? null);
		setCreatingVersion(false);
		setSubjectName('');
		setSelectedSubjectId(null);
		setCreatingSubject(false);
		setSections(blankSections());
		setEditingItem({ type: 'subject' });
	};

	const handleSubjectSelect = (subjectNameValue: string) => {
		setSubjectName(subjectNameValue);
		setSelectedSubjectId(
			fetchedSubjects.find((subject) => subject.subject_name === subjectNameValue)?.id ?? null
		);
		setCreatingSubject(false);
		setEditingItem(null);
	};

	// Enter "create" mode: clear the current selection so the empty name field is
	// for a brand-new record rather than renaming the selected one.
	const startNewVersion = () => {
		setCreatingVersion(true);
		setCommentVersion('');
		setSelectedVersionId(null);
		setSubjectName('');
		setSelectedSubjectId(null);
		setCreatingSubject(false);
		setFetchedSubjects([]);
		setSections(blankSections());
		setEditingItem(null);
	};

	const cancelNewVersion = () => {
		startNewVersion();
		setCreatingVersion(false);
	};

	const startNewSubject = () => {
		setCreatingSubject(true);
		setSubjectName('');
		setSelectedSubjectId(null);
		setSections(blankSections());
		setEditingItem({ type: 'subject' });
	};

	const cancelNewSubject = () => {
		startNewSubject();
		setCreatingSubject(false);
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
		sections.every((s) => s.name && s.children.every((l) => l.name && l.comment));

	return (
		<div className="h-full flex flex-col">
			{/* Sticky Header */}
			<div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
				<h1 className="text-xl font-semibold">Comment Manager</h1>
				<Button onClick={handleSubmit} disabled={!isFormValid || isSaving} className="gap-2">
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
							<div className="flex items-center justify-between">
								<label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
									<FolderOpen className="h-4 w-4" />
									Version
								</label>
								{versions.length > 0 &&
									(creatingVersion ? (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={cancelNewVersion}
											className="h-7 px-2 text-xs"
										>
											Cancel
										</Button>
									) : (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={startNewVersion}
											className="h-7 px-2 text-xs"
										>
											<PlusCircle className="h-3 w-3 mr-1" />
											New
										</Button>
									))}
							</div>
							{versions.length > 0 && !creatingVersion && (
								<Select value={commentVersion} onValueChange={handleVersionSelect}>
									<SelectTrigger>
										<SelectValue placeholder="Select a version..." />
									</SelectTrigger>
									<SelectContent>
										{versions.map((v) => (
											<SelectItem key={v.id} value={v.version_name}>
												{v.version_name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
							{(creatingVersion || selectedVersionId !== null || versions.length === 0) && (
								<Input
									placeholder="Version name"
									value={commentVersion}
									onChange={(e) => setCommentVersion(e.target.value)}
									className="text-sm"
									autoFocus={creatingVersion}
								/>
							)}
						</div>

						{/* Subject Selector */}
						{commentVersion && (
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
										<BookOpen className="h-4 w-4" />
										Subject
									</label>
									{fetchedSubjects.length > 0 &&
										(creatingSubject ? (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={cancelNewSubject}
												className="h-7 px-2 text-xs"
											>
												Cancel
											</Button>
										) : (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={startNewSubject}
												className="h-7 px-2 text-xs"
											>
												<PlusCircle className="h-3 w-3 mr-1" />
												New
											</Button>
										))}
								</div>
								{fetchedSubjects.length > 0 && !creatingSubject && (
									<Select value={subjectName} onValueChange={handleSubjectSelect}>
										<SelectTrigger>
											<SelectValue placeholder="Select a subject..." />
										</SelectTrigger>
										<SelectContent>
											{fetchedSubjects.map((s) => (
												<SelectItem key={s.id} value={s.subject_name}>
													{s.subject_name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
								{(creatingSubject ||
									selectedSubjectId !== null ||
									fetchedSubjects.length === 0) && (
									<Input
										placeholder="Subject name"
										value={subjectName}
										onChange={(e) => setSubjectName(e.target.value)}
										className="text-sm"
										autoFocus={creatingSubject}
									/>
								)}
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
												draggable
												onDragStart={(e) => {
													setDragSection(sectionIndex);
													e.dataTransfer.effectAllowed = 'move';
												}}
												onDragOver={(e) => {
													if (dragSection === null) return;
													e.preventDefault();
													e.dataTransfer.dropEffect = 'move';
													setDragOverSection(sectionIndex);
												}}
												onDrop={(e) => {
													if (dragSection === null) return;
													e.preventDefault();
													moveSection(dragSection, sectionIndex);
													setDragSection(null);
													setDragOverSection(null);
												}}
												onDragEnd={() => {
													setDragSection(null);
													setDragOverSection(null);
												}}
												className={`w-full flex items-center gap-1 px-2 py-1.5 text-sm hover:bg-muted rounded-md transition-colors ${
													editingItem?.type === 'section' && editingItem.index === sectionIndex
														? 'bg-muted'
														: ''
												} ${dragSection === sectionIndex ? 'opacity-40' : ''} ${
													dragOverSection === sectionIndex && dragSection !== sectionIndex
														? 'border-t-2 border-primary'
														: ''
												}`}
											>
												<GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0 cursor-grab active:cursor-grabbing" />
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
													onClick={() => setEditingItem({ type: 'section', index: sectionIndex })}
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
															draggable
															onDragStart={(e) => {
																e.stopPropagation();
																setDragLevel({ sectionIndex, levelIndex });
																e.dataTransfer.effectAllowed = 'move';
															}}
															onDragOver={(e) => {
																if (!dragLevel || dragLevel.sectionIndex !== sectionIndex) return;
																e.preventDefault();
																e.dataTransfer.dropEffect = 'move';
																setDragOverLevel({ sectionIndex, levelIndex });
															}}
															onDrop={(e) => {
																if (!dragLevel || dragLevel.sectionIndex !== sectionIndex) return;
																e.preventDefault();
																e.stopPropagation();
																moveLevel(sectionIndex, dragLevel.levelIndex, levelIndex);
																setDragLevel(null);
																setDragOverLevel(null);
															}}
															onDragEnd={() => {
																setDragLevel(null);
																setDragOverLevel(null);
															}}
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
															} ${
																dragLevel?.sectionIndex === sectionIndex &&
																dragLevel?.levelIndex === levelIndex
																	? 'opacity-40'
																	: ''
															} ${
																dragOverLevel?.sectionIndex === sectionIndex &&
																dragOverLevel?.levelIndex === levelIndex &&
																dragLevel?.levelIndex !== levelIndex
																	? 'border-t-2 border-primary'
																	: ''
															}`}
														>
															<GripVertical className="h-3 w-3 text-muted-foreground/40 flex-shrink-0 cursor-grab active:cursor-grabbing" />
															<FileText className="h-3 w-3 text-muted-foreground" />
															<span className="truncate">{level.name || 'Unnamed Level'}</span>
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
											removeSection(editingItem.index, sections[editingItem.index]?.id)
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
												<span className="flex-1 text-sm">{level.name || 'Unnamed Level'}</span>
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
													sections[editingItem.sectionIndex]?.children[editingItem.levelIndex]?.id
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
											sections[editingItem.sectionIndex]?.children[editingItem.levelIndex]?.name ||
											''
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
											{sections[editingItem.sectionIndex]?.children[editingItem.levelIndex]?.comment
												.length || 0}{' '}
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
										Use *N* for name, *P* for he/she, *H* for him/her, *R* for his/her
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
