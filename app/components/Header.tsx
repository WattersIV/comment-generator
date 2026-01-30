'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet';
import { useState } from 'react';

export default function Header() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/comments', label: 'Comments' }
	];

	return (
		<header className="w-full h-16 py-4 bg-white/60 backdrop-blur-sm border-b">
			<div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-full">
				<Link href="/">
					<h1 className="text-lg md:text-xl font-bold text-slate-800">Comment Generator</h1>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex gap-3">
					{navLinks.map((link) => (
						<Link key={link.href} href={link.href}>
							<Button variant={pathname === link.href ? 'default' : 'ghost'} size="sm">
								{link.label}
							</Button>
						</Link>
					))}
				</nav>

				{/* Mobile Navigation */}
				<Sheet open={open} onOpenChange={setOpen}>
					<SheetTrigger asChild className="md:hidden">
						<Button variant="ghost" size="sm" aria-label="Open menu">
							<MenuIcon className="h-5 w-5" />
						</Button>
					</SheetTrigger>
					<SheetContent side="right" className="w-64">
						<SheetHeader>
							<SheetTitle>Navigation</SheetTitle>
						</SheetHeader>
						<nav className="flex flex-col gap-2 mt-6">
							{navLinks.map((link) => (
								<Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
									<Button
										variant={pathname === link.href ? 'default' : 'ghost'}
										className="w-full justify-start"
									>
										{link.label}
									</Button>
								</Link>
							))}
						</nav>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}

function MenuIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<line x1="4" x2="20" y1="12" y2="12" />
			<line x1="4" x2="20" y1="6" y2="6" />
			<line x1="4" x2="20" y1="18" y2="18" />
		</svg>
	);
}
