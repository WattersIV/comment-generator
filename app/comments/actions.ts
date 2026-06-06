'use server';
import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

type LevelInput = { id?: string | null; name: string; comment: string; sortOrder: number };
type SectionInput = { id?: string | null; name: string; sortOrder: number; levels: LevelInput[] };
type SubjectFormData = {
	commentVersion: string;
	// Ids of the existing rows being edited, when updating/renaming in place.
	// Absent/null means create (or find an existing row by name) instead.
	versionId?: string | null;
	subjectName: string;
	subjectId?: string | null;
	sections: SectionInput[];
};

// Ids of every row touched by a save, in the same order they were submitted,
// so the client can adopt them and keep editing/renaming in place afterwards.
type SaveResult = {
	versionId: string;
	subjectId: string;
	sections: { id: string; levels: { id: string }[] }[];
};

export async function postComments(formData: SubjectFormData): Promise<SaveResult | null> {
	const supabase = await createClient();

	const versionId = await upsertVersion(formData, supabase);
	if (!versionId) {
		return null;
	}

	const subjectId = await upsertSubject(formData, versionId, supabase);
	if (!subjectId) {
		return null;
	}

	const sections = await upsertSectionsAndLevels(formData, subjectId, supabase);
	if (!sections) {
		return null;
	}

	return { versionId, subjectId, sections };
}

async function upsertVersion(
	formData: SubjectFormData,
	supabase: SupabaseClient<any, 'public', any>
) {
	const versionName = formData.commentVersion;

	if (formData.versionId) {
		const { data, error } = await supabase
			.from('comment_versions')
			.update({ version_name: versionName })
			.eq('id', formData.versionId)
			.select('id')
			.single();

		if (error) {
			console.error('Error updating Comment Version', error);
			return null;
		}

		return data.id as string;
	}

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
		return data.id as string;
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

	return insertData.id as string;
}

async function upsertSubject(
	formData: SubjectFormData,
	versionId: string,
	supabase: SupabaseClient<any, 'public', any>
) {
	const subjectName = formData.subjectName;

	// Editing an existing subject: update the row in place by id so a rename
	// changes the name rather than creating a duplicate row.
	if (formData.subjectId) {
		const { data, error } = await supabase
			.from('subjects')
			.update({ subject_name: subjectName })
			.eq('id', formData.subjectId)
			.select('id')
			.single();

		if (error) {
			console.error('Error updating Subject', error);
			return null;
		}

		return data.id as string;
	}

	const { data, error } = await supabase
		.from('subjects')
		.select('id')
		.eq('subject_name', subjectName)
		.eq('version_id', versionId)
		.single();

	if (error && error.code !== 'PGRST116') {
		console.error('Error checking Subject', error);
		return null;
	}

	if (data) {
		return data.id as string;
	}

	const { data: insertData, error: insertError } = await supabase
		.from('subjects')
		.insert([{ subject_name: subjectName, version_id: versionId }])
		.select('id')
		.single();

	if (insertError) {
		console.error('Error inserting Subject', insertError);
		return null;
	}

	return insertData.id as string;
}

async function upsertSectionsAndLevels(
	formData: SubjectFormData,
	subjectId: string,
	supabase: SupabaseClient<any, 'public', any>
): Promise<SaveResult['sections'] | null> {
	const result: SaveResult['sections'] = [];

	for (const section of formData.sections) {
		const sectionId = await upsertSection(section, subjectId, supabase);
		if (!sectionId) {
			return null;
		}

		const levels: { id: string }[] = [];
		for (const level of section.levels) {
			const levelId = await upsertLevel(level, sectionId, supabase);
			if (!levelId) {
				return null;
			}
			levels.push({ id: levelId });
		}

		result.push({ id: sectionId, levels });
	}

	return result;
}

async function upsertSection(
	section: SectionInput,
	subjectId: string,
	supabase: SupabaseClient<any, 'public', any>
) {
	// Editing an existing section: update name + order in place by id.
	if (section.id) {
		const { error } = await supabase
			.from('sections')
			.update({ section_name: section.name, sort_order: section.sortOrder })
			.eq('id', section.id);

		if (error) {
			console.error('Error updating Section', error);
			return null;
		}

		return section.id;
	}

	const { data, error } = await supabase
		.from('sections')
		.select('id')
		.eq('section_name', section.name)
		.eq('subject_id', subjectId)
		.single();

	if (error && error.code !== 'PGRST116') {
		console.error('Error checking Section', error);
		return null;
	}

	if (data) {
		const { error: updateError } = await supabase
			.from('sections')
			.update({ sort_order: section.sortOrder })
			.eq('id', data.id);

		if (updateError) {
			console.error('Error updating Section order', updateError);
			return null;
		}

		return data.id as string;
	}

	const { data: insertData, error: insertError } = await supabase
		.from('sections')
		.insert({ subject_id: subjectId, section_name: section.name, sort_order: section.sortOrder })
		.select('id')
		.single();

	if (insertError) {
		console.error('Error inserting Section', insertError);
		return null;
	}

	return insertData.id as string;
}

async function upsertLevel(
	level: LevelInput,
	sectionId: string,
	supabase: SupabaseClient<any, 'public', any>
) {
	// Editing an existing level: update name + comment + order in place by id.
	if (level.id) {
		const { error } = await supabase
			.from('levels')
			.update({ level_name: level.name, comment: level.comment, sort_order: level.sortOrder })
			.eq('id', level.id);

		if (error) {
			console.error('Error updating Level', error);
			return null;
		}

		return level.id;
	}

	const { data, error } = await supabase
		.from('levels')
		.select('id')
		.eq('section_id', sectionId)
		.eq('level_name', level.name)
		.single();

	if (error && error.code !== 'PGRST116') {
		console.error('Error checking Level', error);
		return null;
	}

	if (data) {
		const { error: updateError } = await supabase
			.from('levels')
			.update({ comment: level.comment, sort_order: level.sortOrder })
			.eq('id', data.id);

		if (updateError) {
			console.error('Error updating Level', updateError);
			return null;
		}

		return data.id as string;
	}

	const { data: insertData, error: insertError } = await supabase
		.from('levels')
		.insert({
			section_id: sectionId,
			level_name: level.name,
			comment: level.comment,
			sort_order: level.sortOrder
		})
		.select('id')
		.single();

	if (insertError) {
		console.error('Error inserting Level', insertError);
		return null;
	}

	return insertData.id as string;
}
