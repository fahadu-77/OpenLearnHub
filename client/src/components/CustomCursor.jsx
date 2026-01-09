import { useEffect } from 'react';

export const CustomCursor = () => {
    useEffect(() => {
        const cursor = { x: 0, y: 0 };
        const dot = { x: 0, y: 0 };
        const ring = { x: 0, y: 0 };

        const updateCursor = (e) => {
            cursor.x = e.clientX;
            cursor.y = e.clientY;
        };

        const animateCursor = () => {
            // Smooth follow for dot
            dot.x += (cursor.x - dot.x) * 0.3;
            dot.y += (cursor.y - dot.y) * 0.3;

            // Slower follow for ring
            ring.x += (cursor.x - ring.x) * 0.15;
            ring.y += (cursor.y - ring.y) * 0.15;

            const dotElement = document.querySelector('.cursor-dot');
            const ringElement = document.querySelector('.cursor-ring');

            if (dotElement) {
                dotElement.style.transform = `translate(${dot.x - 4}px, ${dot.y - 4}px)`;
            }

            if (ringElement) {
                ringElement.style.transform = `translate(${ring.x - 16}px, ${ring.y - 16}px)`;
            }

            requestAnimationFrame(animateCursor);
        };

        window.addEventListener('mousemove', updateCursor);
        animateCursor();

        return () => {
            window.removeEventListener('mousemove', updateCursor);
        };
    }, []);

    return (
        <>
            <div className="cursor-dot fixed top-0 left-0 w-2 h-2 bg-black rounded-full pointer-events-none z-[9999] mix-blend-difference" />
            <div className="cursor-ring fixed top-0 left-0 w-8 h-8 border-2 border-black/30 rounded-full pointer-events-none z-[9998]" />
        </>
    );
};
