import { createClient } from '@/utils/supabase/server';

import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { searchParams } = new URL(req.url);
	const id = searchParams.get('id');
	const type = searchParams.get('type');

	if (!['comment_versions', 'subjects', 'sections', 'levels'].includes(type as string)) {
		return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
		return;
	}

	const { error } = await supabase
		.from(type as string)
		.delete()
		.eq('id', id);

	if (error) {
		console.error(`Error deleting ${type}`, error);
		return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
		return;
	}

	return NextResponse.json({ success: true }, { status: 200 });
}
