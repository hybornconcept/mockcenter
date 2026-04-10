import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const res = await fetch('/api/users/me');
	
	let user = null;
	if (res.ok) {
		const json = await res.json();
		user = json.data;
	}

    const isVerified = user?.emailVerified === 'true' || user?.emailVerified === true;
    if (isVerified) {
        throw redirect(302, '/dashboard');
    }

	return {
		user,
		email: user?.email || url.searchParams.get('email') || ''
	};
};
