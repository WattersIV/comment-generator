'use client';

import { use, useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MathForm from './components/subjects/Math';
import LanguageForm from './components/subjects/Language';
import ScienceForm from './components/subjects/Science';
import CommentBox from './components/CommentBox/CommentBox';
import { TextContent } from './contexts/TextContext';
import dynamic from 'next/dynamic';
import { ConfettiSwitch } from './contexts/ConfettiContext';
import LearningSkills from './components/subjects/LearningSkills';
import { createClient } from './utils/supabase/client';
import { DropdownMenuCheckboxes } from './components/ui/checkbox-dropdown';
import SubjectForm from './components/subjects/SubjectForm';
const Confetti = dynamic(() => import('@/components/Confetti/Confetti'), { ssr: false });

export default function Page() {
	const [text, setText] = useState('');
	const [confetti, setConfetti] = useState(false);
	const [activeTab, setActiveTab] = useState('');
	const [commentVersions, setCommentVersions] = useState([]);
	const [selectedCommentVersion, setSelectedCommentVersion] = useState(null);
	const [subjects, setSubjects] = useState([]);
	const [sections, setSections] = useState([]);
	const supabase = createClient();

	useEffect(() => {
		async function fetchCommentVersions() {
			const userID = await getIdFromSession(supabase);
			const { data, error } = await supabase
				.from('comment_versions')
				.select('id, version_name')
				.eq('user_id', userID);
			if (error) {
				console.error('Error getting comment versions', error);
				return;
			}
			setCommentVersions(data);
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

			setSubjects(data);
		}

		fetchSubjects();
	}, [selectedCommentVersion]);

	useEffect(() => {
		if (!activeTab) return;
		async function fetchSectionsAndLevels() {
			try {
				const { data: sectionsData, error: sectionsError } = await supabase
					.from('sections')
					.select('section_name, id')
					.eq('subject_id', subjects.find((subject) => subject.subject_name === activeTab)?.id);

				if (sectionsError) {
					console.error('Error getting sections', sectionsError);
					return;
				}

				const formattedSectionsData = sectionsData.map((section) => ({
					section_name: section.section_name,
					id: section.id
				}));

				const results = await Promise.all(
					formattedSectionsData.map(async (section) => {
						const { data: levelsData, error: levelsError } = await supabase
							.from('levels')
							.select('level_name, comment')
							.eq('section_id', section.id);

						if (levelsError) {
							console.error('Error getting levels', levelsError);
							return { name: section.section_name, children: [] };
						}

						const formattedLevelsData = levelsData.map((level) => ({
							name: level.level_name,
							comment: level.comment
						}));

						return { name: section.section_name, children: formattedLevelsData };
					})
				);
				setSections(results);
			} catch (error) {
				console.error('Error fetching sections and levels', error);
			}
		}
		fetchSectionsAndLevels();
	}, [activeTab]);

	function formatCommentVersions(commentVersions) {
		return commentVersions.map((version) => ({
			label: version.version_name,
			checked: false,
			onCheckedChange: () =>
				setSelectedCommentVersion({ id: version.id, name: version.version_name })
		}));
	}

	// const subjectForm =
	// 	activeTab === 'math' ? (
	// 		<MathForm />
	// 	) : activeTab === 'language' ? (
	// 		<LanguageForm />
	// 	) : activeTab === 'science' ? (
	// 		<ScienceForm />
	// 	) : (
	// 		<LearningSkills />
	// 	);
	return (
		<TextContent.Provider value={{ text, setText }}>
			<ConfettiSwitch.Provider value={{ confetti, setConfetti }}>
				<div className="md:grid md:h-screen gap-4 md:grid-cols-[1fr_3fr] flex flex-col">
					<div className="col-span-1">
						<Card className="w-full ">
							<CardHeader>
								<CardTitle>Comment Generator</CardTitle>
								<DropdownMenuCheckboxes
									items={formatCommentVersions(commentVersions)}
									title={selectedCommentVersion?.name || 'Select Comment Version'}
								/>
								<CardDescription />
							</CardHeader>
							<Tabs value={activeTab} onValueChange={setActiveTab} className="border-b">
								<TabsList className="flex">
									{subjects.map((subject) => (
										<TabsTrigger key={subject.id} value={subject.subject_name}>
											{subject.subject_name}
										</TabsTrigger>
									))}
								</TabsList>
								<SubjectForm sections={sections} subject={activeTab} />
							</Tabs>
						</Card>
					</div>
					<div className="col-span-1">
						<CommentBox activeTab={activeTab} />
					</div>
				</div>
				<Confetti />
			</ConfettiSwitch.Provider>
		</TextContent.Provider>
	);
}

async function getIdFromSession(supabase) {
	const user = await supabase.auth.getSession();
	return user.data.session.user.id ? user.data.session.user.id : null;
}
