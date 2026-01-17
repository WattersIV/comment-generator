'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Header() {
	const pathname = usePathname();

	return (
		<header className="w-full h-16 py-4 bg-white/60 backdrop-blur-sm border-b">
			<div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-full">
				<Link href="/">
					<h1 className="text-xl font-bold text-slate-800">Comment Generator</h1>
				</Link>

				<nav className="flex gap-3">
					<Link href="/">
						<Button variant={pathname === '/' ? 'default' : 'ghost'} size="sm">
							Home
						</Button>
					</Link>
					<Link href="/comments">
						<Button variant={pathname === '/comments' ? 'default' : 'ghost'} size="sm">
							Comments
						</Button>
					</Link>
				</nav>
			</div>
		</header>
	);
}
