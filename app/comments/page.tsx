import DynamicSubjectForm from '@/components/DynamicSubjectForm/DynamicSubjectForm';
import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

type CommentVersion = {
	version_name: string;
	id: string;
};

type SupabaseResponse = {
	version_name: string;
	id: string;
};

export default async function Page() {
	const supabase = await createClient();
	const id = await getIdFromSession(supabase);

	if (!id) {
		redirect('/login');
	}

	const { data, error } = await supabase.from('comment_versions').select('*').eq('user_id', id);
	if (error) {
		redirect('/error');
	}

	const commentVersions: CommentVersion[] = (data as SupabaseResponse[]).map((version) => ({
		version_name: version.version_name,
		id: version.id
	}));

	return (
		<div className="h-full overflow-hidden">
			<DynamicSubjectForm commentVersions={commentVersions} />
		</div>
	);
}

async function getIdFromSession(supabase: SupabaseClient): Promise<string | null> {
	// Use getUser(), not getSession(): on the server getSession() reads the cookie
	// without revalidating and can return a stale/null session, whereas getUser()
	// validates against the auth server (the token is already refreshed by middleware).
	const { data, error } = await supabase.auth.getUser();
	if (error) return null;
	return data.user?.id ?? null;
}
