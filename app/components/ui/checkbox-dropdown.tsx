'use client';

import * as React from 'react';
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

type Checked = DropdownMenuCheckboxItemProps['checked'];

interface DropdownMenuCheckboxesProps {
	items: {
		label: string;
		checked: Checked;
		disabled?: boolean;
		onCheckedChange: (checked: Checked) => void;
	}[];
	title: string;
}

export function DropdownMenuCheckboxes({ items, title }: DropdownMenuCheckboxesProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">{title}</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuLabel>Comment Versions</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{items.map((item, index) => (
					<DropdownMenuCheckboxItem
						key={index}
						checked={item.checked}
						onCheckedChange={item.onCheckedChange}
						disabled={item.disabled}
					>
						{item.label}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
