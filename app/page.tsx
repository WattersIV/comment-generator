'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { TextContent } from './contexts/TextContext';
import dynamic from 'next/dynamic';
import { ConfettiSwitch } from './contexts/ConfettiContext';
import { createClient } from './utils/supabase/client';
import { handleUseGPT } from './utils/handleUseGPT';
import { toast } from 'sonner';
import {
	Copy,
	Sparkles,
	Loader2,
	FolderOpen,
	BookOpen,
	Layers,
	FileText,
	ChevronRight,
	Check
} from 'lucide-react';

const Confetti = dynamic(() => import('@/components/Confetti/Confetti'), { ssr: false });

interface CommentVersion {
	id: string;
	version_name: string;
}

interface Subject {
	id: string;
	subject_name: string;
}

interface Section {
	name: string;
	children: {
		name: string;
		comment: string;
	}[];
}

export default function Page() {
	const [text, setText] = useState('');
	const [confetti, setConfetti] = useState(false);
	const [activeTab, setActiveTab] = useState('');
	const [isUserEdited, setIsUserEdited] = useState(false);
	const [commentVersions, setCommentVersions] = useState<CommentVersion[]>([]);
	const [selectedCommentVersion, setSelectedCommentVersion] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [sections, setSections] = useState<Section[]>([]);
	const [selectedLevels, setSelectedLevels] = useState<
		Record<string, { levelName: string; comment: string }>
	>({});
	const [isLoading, setIsLoading] = useState(false);
	const [isLearningSkills, setIsLearningSkills] = useState(false);
	const [copiedRecently, setCopiedRecently] = useState(false);

	const supabase = createClient();

	useEffect(() => {
		async function fetchCommentVersions() {
			const userID = await getIdFromSession(supabase);
			if (!userID) return;
			const { data, error } = await supabase
				.from('comment_versions')
				.select('id, version_name')
				.eq('user_id', userID);
			if (error) {
				console.error('Error getting comment versions', error);
				return;
			}
			setCommentVersions(data || []);
		}

		fetchCommentVersions();
	}, []);

	useEffect(() => {
		if (!selectedCommentVersion) return;
		async function fetchSubjects() {
			const { data, error } = await supabase
				.from('subjects')
				.select('subject_name, id')
				.eq('version_id', selectedCommentVersion.id);

			if (error) {
				console.error('Error getting subjects', error);
				return;
			}

			setSubjects(data || []);
			setActiveTab('');
			setSections([]);
			setSelectedLevels({});
		}

		fetchSubjects();
	}, [selectedCommentVersion]);

	useEffect(() => {
		setIsUserEdited(false);
	}, [activeTab]);

	useEffect(() => {
		if (!activeTab || subjects.length === 0) return;
		async function fetchSectionsAndLevels() {
			try {
				const subjectId = subjects.find((subject) => subject.subject_name === activeTab)?.id;
				if (!subjectId) return;

				const { data: sectionsData, error: sectionsError } = await supabase
					.from('sections')
					.select('section_name, id')
					.eq('subject_id', subjectId);

				if (sectionsError) {
					console.error('Error getting sections', sectionsError);
					return;
				}

				const results = await Promise.all(
					(sectionsData || []).map(async (section) => {
						const { data: levelsData, error: levelsError } = await supabase
							.from('levels')
							.select('level_name, comment')
							.eq('section_id', section.id);

						if (levelsError) {
							console.error('Error getting levels', levelsError);
							return { name: section.section_name, children: [] };
						}

						return {
							name: section.section_name,
							children: (levelsData || []).map((level) => ({
								name: level.level_name,
								comment: level.comment
							}))
						};
					})
				);
				setSections(results);
				setSelectedLevels({});
			} catch (error) {
				console.error('Error fetching sections and levels', error);
			}
		}
		fetchSectionsAndLevels();
	}, [activeTab, subjects]);

	useEffect(() => {
		if (isUserEdited) return;
		buildComment();
	}, [selectedLevels, isUserEdited]);

	const buildComment = () => {
		const comments = Object.values(selectedLevels)
			.map((l) => l.comment)
			.filter((c) => c);
		if (comments.length === 0) {
			setText('');
			return;
		}
		const comment = comments.join(' ') + ' (SW)';
		setText(comment);
	};

	const handleLevelChange = (sectionName: string, value: string) => {
		if (value === 'none') {
			setSelectedLevels((prev) => {
				const updated = { ...prev };
				delete updated[sectionName];
				return updated;
			});
		} else {
			const [levelName, commentValue] = value.split('|');
			setSelectedLevels((prev) => ({
				...prev,
				[sectionName]: { levelName, comment: commentValue?.trim() || '' }
			}));
		}
	};

	const handleCopyText = () => {
		navigator.clipboard.writeText(text);
		toast.success('Copied to clipboard!');
		setCopiedRecently(true);
		setTimeout(() => setCopiedRecently(false), 2000);
	};

	const handleRebuild = () => {
		setIsUserEdited(false);
		buildComment();
	};

	const handleVersionSelect = (versionId: string) => {
		const version = commentVersions.find((v) => v.id === versionId);
		if (version) {
			setSelectedCommentVersion({ id: version.id, name: version.version_name });
		}
	};

	const handleSubjectSelect = (subjectName: string) => {
		setActiveTab(subjectName);
	};

	return (
		<TextContent.Provider value={{ text, setText, isUserEdited, setIsUserEdited }}>
			<ConfettiSwitch.Provider value={{ confetti, setConfetti }}>
				<div className="h-full flex flex-col">
					{/* Sticky Header */}
					<div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<h1 className="text-xl font-semibold">Comment Generator</h1>
							<div className="flex flex-wrap items-center gap-2">
								<Select
									value={isLearningSkills ? 'learning-skills' : 'subjects'}
									onValueChange={(v) => setIsLearningSkills(v === 'learning-skills')}
								>
									<SelectTrigger className="w-[150px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="subjects">Subjects</SelectItem>
										<SelectItem value="learning-skills">Learning Skills</SelectItem>
									</SelectContent>
								</Select>
								<Button
									variant="outline"
									onClick={handleCopyText}
									disabled={!text}
									className="gap-2"
								>
									{copiedRecently ? (
										<Check className="h-4 w-4" />
									) : (
										<Copy className="h-4 w-4" />
									)}
									<span className="hidden sm:inline">Copy</span>
								</Button>
								<Button
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
									className="gap-2"
								>
									{isLoading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Sparkles className="h-4 w-4" />
									)}
									<span className="hidden sm:inline">Use GPT</span>
								</Button>
							</div>
						</div>
					</div>

					<div className="flex-1 flex flex-col md:flex-row overflow-hidden">
						{/* Sidebar */}
						<div className="w-full md:w-80 border-b md:border-b-0 md:border-r bg-muted/30 overflow-y-auto flex-shrink-0">
							<div className="p-4 space-y-4">
								{/* Version Selector */}
								<div className="space-y-2">
									<label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
										<FolderOpen className="h-4 w-4" />
										Comment Version
									</label>
									<Select
										value={selectedCommentVersion?.id || ''}
										onValueChange={handleVersionSelect}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select a version..." />
										</SelectTrigger>
										<SelectContent>
											{commentVersions.map((v) => (
												<SelectItem key={v.id} value={v.id}>
													{v.version_name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{commentVersions.length === 0 && (
										<p className="text-xs text-muted-foreground">
											No versions found. Create one in the Comments page.
										</p>
									)}
								</div>

								{/* Subject Selector */}
								{selectedCommentVersion && (
									<div className="space-y-2">
										<label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
											<BookOpen className="h-4 w-4" />
											Subject
										</label>
										{subjects.length > 0 ? (
											<div className="space-y-1">
												{subjects.map((subject) => (
													<button
														key={subject.id}
														type="button"
														onClick={() => handleSubjectSelect(subject.subject_name)}
														className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-md transition-colors ${
															activeTab === subject.subject_name
																? 'bg-primary text-primary-foreground'
																: 'hover:bg-muted'
														}`}
													>
														<Layers className="h-4 w-4" />
														{subject.subject_name}
														{activeTab === subject.subject_name && (
															<ChevronRight className="h-4 w-4 ml-auto" />
														)}
													</button>
												))}
											</div>
										) : (
											<p className="text-xs text-muted-foreground">
												No subjects found for this version.
											</p>
										)}
									</div>
								)}

								{/* Section Selectors */}
								{activeTab && sections.length > 0 && (
									<div className="space-y-3 pt-2 border-t">
										<label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
											<FileText className="h-4 w-4" />
											Proficiency Levels
										</label>
										{sections.map((section) => (
											<div key={section.name} className="space-y-1.5">
												<label className="text-xs font-medium">{section.name}</label>
												<Select
													value={
														selectedLevels[section.name]
															? `${selectedLevels[section.name].levelName}|${selectedLevels[section.name].comment}`
															: ''
													}
													onValueChange={(value) => handleLevelChange(section.name, value)}
												>
													<SelectTrigger className="text-sm">
														<SelectValue placeholder="Select level..." />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="none">None</SelectItem>
														{section.children
															.filter((level) => level.comment)
															.map((level) => (
																<SelectItem
																	key={level.name}
																	value={`${level.name}|${level.comment}`}
																>
																	{level.name}
																</SelectItem>
															))}
													</SelectContent>
												</Select>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Main Content Area */}
						<div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6">
							{!selectedCommentVersion && (
								<div className="flex-1 flex items-center justify-center text-muted-foreground">
									<div className="text-center space-y-2">
										<FolderOpen className="h-12 w-12 mx-auto opacity-50" />
										<p>Select a comment version to get started</p>
									</div>
								</div>
							)}

							{selectedCommentVersion && !activeTab && (
								<div className="flex-1 flex items-center justify-center text-muted-foreground">
									<div className="text-center space-y-2">
										<BookOpen className="h-12 w-12 mx-auto opacity-50" />
										<p>Select a subject from the sidebar</p>
									</div>
								</div>
							)}

							{selectedCommentVersion && activeTab && (
								<div className="flex-1 flex flex-col gap-4">
									<Card className="flex-1 flex flex-col">
										<CardHeader className="pb-3">
											<div className="flex items-center justify-between">
												<CardTitle className="text-lg">{activeTab}</CardTitle>
												<div className="flex items-center gap-2">
													{isUserEdited && (
														<Button
															variant="ghost"
															size="sm"
															onClick={handleRebuild}
															className="text-xs"
														>
															Rebuild from Selections
														</Button>
													)}
													<span className="text-sm text-muted-foreground">
														{text.length} characters
													</span>
												</div>
											</div>
										</CardHeader>
										<CardContent className="flex-1 flex flex-col">
											{text ? (
												<Textarea
													value={text}
													onChange={(e) => {
														setText(e.target.value);
														setIsUserEdited(true);
													}}
													placeholder="Your comment will appear here..."
													className="flex-1 min-h-[200px] resize-none text-base"
												/>
											) : (
												<div className="flex-1 min-h-[200px] rounded-md border border-dashed flex items-center justify-center bg-muted/30">
													<p className="text-muted-foreground text-center max-w-sm px-4">
														Select proficiency levels from the sidebar to build your
														comment.
													</p>
												</div>
											)}
										</CardContent>
									</Card>

									{/* Quick info */}
									<div className="text-xs text-muted-foreground text-center">
										Use *N* for name, *P* for pronoun, *H* for his/her, *R* for he/she
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
				<Confetti />
			</ConfettiSwitch.Provider>
		</TextContent.Provider>
	);
}

async function getIdFromSession(supabase: any) {
	const user = await supabase.auth.getSession();
	return user.data.session?.user?.id ?? null;
}
