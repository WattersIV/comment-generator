'use server';
import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

type SubjectFormData = {
	commentVersion: string;
	subjectName: string;
	sections: Record<string, Record<string, string>>;
};

export async function postComments(formData: SubjectFormData) {
	const supabase = await createClient();

	const commentVersionID = await insertCommentVersion(formData, supabase);
	if (!commentVersionID) {
		return;
	}

	const subjectID = await insertSubject(formData, commentVersionID, supabase);
	if (!subjectID) {
		return;
	}

	const sectionData = await insertSections(formData, subjectID, supabase);
	if (!sectionData) {
		return;
	}

	const levelData = await insertLevels(formData, sectionData, supabase);
	return levelData;
}

async function insertCommentVersion(
	formData: SubjectFormData,
	supabase: SupabaseClient<any, 'public', any>
) {
	const versionName = formData.commentVersion;
	const { data, error } = await supabase
		.from('comment_versions')
		.select('id')
		.eq('version_name', versionName)
		.single();

	if (error && error.code !== 'PGRST116') {
		console.error('Error checking Comment Version', error);
		return null;
	}

	if (data) {
		return data.id;
	}

	const { data: insertData, error: insertError } = await supabase
		.from('comment_versions')
		.insert([{ version_name: versionName }])
		.select('id')
		.single();

	if (insertError) {
		console.error('Error inserting Comment Version', insertError);
		return null;
	}

	return insertData.id;
}

async function insertSubject(
	formData: SubjectFormData,
	commentVersionID: string,
	supabase: SupabaseClient<any, 'public', any>
) {
	const subjectName = formData.subjectName;
	const { data, error } = await supabase
		.from('subjects')
		.select('id')
		.eq('subject_name', subjectName)
		.eq('version_id', commentVersionID)
		.single();

	if (error && error.code !== 'PGRST116') {
		console.error('Error checking Subject', error);
		return null;
	}

	if (data) {
		return data.id;
	}

	const { data: insertData, error: insertError } = await supabase
		.from('subjects')
		.insert([{ subject_name: subjectName, version_id: commentVersionID }])
		.select('id')
		.single();

	if (insertError) {
		console.error('Error inserting Subject', insertError);
		return null;
	}

	return insertData.id;
}

type SectionReturnData = { id: string; section_name: string }[];

async function insertSections(
	formData: SubjectFormData,
	subjectID: string,
	supabase: SupabaseClient<any, 'public', any>
) {
	const sections = Object.keys(formData.sections);
	let output: SectionReturnData = [];

	for (const sectionName of sections) {
		const { data, error } = await supabase
			.from('sections')
			.select('id, section_name')
			.eq('section_name', sectionName)
			.eq('subject_id', subjectID)
			.single();

		if (error && error.code !== 'PGRST116') {
			console.error('Error checking Section', error);
			return null;
		}

		if (data) {
			output.push(data);
			continue;
		}

		const { data: insertData, error: insertError } = await supabase
			.from('sections')
			.insert({ subject_id: subjectID, section_name: sectionName })
			.select('id, section_name')
			.single();

		if (insertError) {
			console.error('Error inserting Section', insertError);
			return null;
		}

		output.push(insertData);
	}

	return output as SectionReturnData;
}

async function insertLevels(
	formData: SubjectFormData,
	sectionData: SectionReturnData,
	supabase: SupabaseClient<any, 'public', any>
) {
	for (const section of sectionData) {
		const levels = formData.sections[section.section_name];
		for (const [name, comment] of Object.entries(levels)) {
			const { data, error } = await supabase
				.from('levels')
				.select('id')
				.eq('section_id', section.id)
				.eq('level_name', name)
				.single();

			if (error && error.code !== 'PGRST116') {
				console.error('Error checking Level', error);
				return null;
			}

			if (data) {
				// Update the existing level if needed
				const { error: updateError } = await supabase
					.from('levels')
					.update({ comment })
					.eq('id', data.id);

				if (updateError) {
					console.error('Error updating Level', updateError);
					return null;
				}
				continue;
			}

			const { error: insertError } = await supabase
				.from('levels')
				.insert({ section_id: section.id, level_name: name, comment });

			if (insertError) {
				console.error('Error inserting Level', insertError);
				return null;
			}
		}
	}

	return true;
}
