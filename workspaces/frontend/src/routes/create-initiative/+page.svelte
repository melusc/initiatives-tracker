<!--
Copyright (C) 2024  Luca Schnellmann

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
	import CreateForm from '../../components/create-form/create-form.svelte';
</script>

<CreateForm
	title="Create initiative"
	inputs={[
		{
			name: 'shortName',
			label: 'Short name',
			type: 'text',
			minlength: 4,
		},
		{
			name: 'fullName',
			label: 'Full name',
			type: 'text',
			minlength: 4,
		},
		{
			name: 'deadline',
			label: 'Deadline',
			type: 'date',
			minlength: 0,
		},
		{
			name: 'website',
			label: 'Website',
			type: 'url',
			minlength: 10,
		},

		{
			name: 'pdf',
			label: 'PDF URL',
			type: 'file',
			minlength: 10,
		},
		{
			name: 'image',
			label: 'Image URL',
			type: 'file',
			minlength: 10,
		},
	]}
/>
