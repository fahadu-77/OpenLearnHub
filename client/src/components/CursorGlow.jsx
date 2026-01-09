import { useEffect, useState } from 'react';

export const CursorGlow = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', updateMousePosition);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
        };
    }, []);

    return (
        <>
            {/* Outer powder layer - most diffuse */}
            <div
                className="pointer-events-none fixed inset-0 z-30"
                style={{
                    background: `radial-gradient(800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.25), transparent 70%)`,
                    filter: 'blur(100px)',
                }}
            />

            {/* Middle glow layer */}
            <div
                className="pointer-events-none fixed inset-0 z-30"
                style={{
                    background: `radial-gradient(500px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.35), transparent 60%)`,
                    filter: 'blur(60px)',
                }}
            />

            {/* Inner bright core */}
            <div
                className="pointer-events-none fixed inset-0 z-30"
                style={{
                    background: `radial-gradient(300px at ${mousePosition.x}px ${mousePosition.y}px, rgba(96, 165, 250, 0.5), transparent 50%)`,
                    filter: 'blur(40px)',
                }}
            />
        </>
    );
};
