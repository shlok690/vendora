import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/RouteConstants';

export const Navbar: React.FC = () => {
	return (
		<nav style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: 12 }}>
			<Link to={ROUTES.LANDING} style={{ textDecoration: 'none', padding: '8px 14px', borderRadius: 8, background: '#2563eb', color: '#fff' }}>
				Main Page
			</Link>
		</nav>
	);
};
