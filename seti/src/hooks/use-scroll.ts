import { useState, useEffect } from 'react';

export function useScroll() {
	const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		let lastScrollY = window.scrollY;

		const updateScrollDirection = () => {
			const currentScrollY = window.scrollY;
			const direction = currentScrollY > lastScrollY ? 'down' : 'up';
			if (direction !== scrollDirection &&
				(Math.abs(currentScrollY - lastScrollY) > 10)) {
				setScrollDirection(direction);
			}
			setScrollY(currentScrollY);
			lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
		};

		const onScroll = () => {
			window.requestAnimationFrame(updateScrollDirection);
		};

		window.addEventListener('scroll', onScroll);

		return () => window.removeEventListener('scroll', onScroll);
	}, [scrollDirection]);

	return { scrollDirection, scrollY };
}