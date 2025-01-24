import DynamicSubjectForm from '@/components/DynamicSubjectForm/DynamicSubjectForm';
import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export default async function Page() {
	const supabase = await createClient();
	const id = await getIdFromSession(supabase);

	if (!id) {
		redirect('/login');
	}

	const { data, error } = await supabase.from('comment_versions').select('*').eq('user_id', id);
	if (error) {
		console.error('Error getting comment versions', error);
		redirect('/error');
	}
	// send array of comment versions to DynamicSubjectForm but only with the version_name and id
	const commentVersions = data.map((version) => ({
		version_name: version.version_name,
		id: version.id
	}));

	return <DynamicSubjectForm commentVersions={commentVersions} />;
}

async function getIdFromSession(supabase: SupabaseClient<any, 'public', any>) {
	const user = await supabase.auth.getSession();
	return user.data.session.user.id ? user.data.session.user.id : null;
}
