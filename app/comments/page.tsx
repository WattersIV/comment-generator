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
	const user = await supabase.auth.getSession();
	return user.data.session?.user?.id ?? null;
}
