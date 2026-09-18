import React, { useEffect, useState, useRef } from 'react';
import SectionWrapper from "../../hoc/SectionWrapper.tsx";

interface StatProps {
    value: number;
    label: string;
    suffix?: string;
    duration?: number;
}

const StatCounter: React.FC<StatProps> = ({ value, label, suffix = '+', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef<number>(0);
    const animationFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const progress = timestamp - startTimeRef.current;

            const percentage = Math.min(progress / duration, 1);
            const easedPercentage = easeOutQuad(percentage);

            countRef.current = Math.floor(easedPercentage * value);
            setCount(countRef.current);

            if (percentage < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        // Easing function for smoother animation
        const easeOutQuad = (t: number): number => t * (2 - t);

        // Start the animation
        animationFrameRef.current = requestAnimationFrame(animate);

        // Cleanup function
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [value, duration]);

    // Format the value for display with commas for thousands
    const formattedCount = count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return (
        <div className="flex flex-col items-center text-center">
            <div className="text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
                {formattedCount}{suffix}
            </div>
            <div className="text-white text-sm md:text-base lg:text-lg">
                {label}
            </div>
        </div>
    );
};

const StatsDisplayBar: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const statsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => {
            if (statsRef.current) {
                observer.unobserve(statsRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={statsRef}
            className="w-full bg-orange-500 py-8 md:py-12 px-4 md:px-6 rounded-2xl mt-30 transition-opacity duration-1000 ease-in mb-30"
            style={{ opacity: isVisible ? 1 : 0 }}
        >
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4">
                    {isVisible && (
                        <>
                            <StatCounter value={10} label="Registered Riders" />
                            <StatCounter value={20} label="Orders Delivered" />
                            <StatCounter value={5} label="Restaurants Partnered" />
                            <StatCounter value={50} label="Food items" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};


const StatsDisplay = SectionWrapper(StatsDisplayBar);

export default StatsDisplay;
