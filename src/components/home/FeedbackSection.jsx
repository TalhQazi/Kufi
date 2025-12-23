import { useState, useRef, useEffect } from 'react';

export default function FeedbackSection() {
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftState, setScrollLeftState] = useState(0);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeftState(scrollRef.current.scrollLeft);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        scrollRef.current.scrollLeft = scrollLeftState - walk;
    };

    const feedbackItems = [
        {
            id: 1,
            avatar: '/assets/feedback-A.jpeg',
            name: 'Lisa',
            nameLabel: 'LISA',
            text: '" Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor "'
        },
        {
            id: 2,
            avatar: '/assets/feedback-B.jpeg',
            name: 'Mr. John Doe',
            nameLabel: 'MR. JOHN DOE',
            text: '" Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor "'
        },
        {
            id: 3,
            avatar: '/assets/feedback-C.jpeg',
            name: 'Mr. John Doe',
            nameLabel: 'MR. JOHN DOE',
            text: '" Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor "'
        },
        {
            id: 4,
            avatar: '/assets/feedback-A.jpeg',
            name: 'Sarah Jenkins',
            nameLabel: 'SARAH JENKINS',
            text: '" Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor "'
        },
        {
            id: 5,
            avatar: '/assets/feedback-B.jpeg',
            name: 'Michael Chen',
            nameLabel: 'MICHAEL CHEN',
            text: '" Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor "'
        }
    ];

    // Triple the items for infinite loop logic
    const loopedItems = [...feedbackItems, ...feedbackItems, ...feedbackItems];

    // Handle Infinite Scroll Loop Positioning
    useEffect(() => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const singleSectionWidth = container.scrollWidth / 3;
            // Shift to the middle section and add a slight offset to center the first card on the picture
            const offset = 50; // Fine-tune this based on desired overlap
            container.scrollLeft = singleSectionWidth - offset;
        }
    }, []);

    const handleScroll = () => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const singleSectionWidth = container.scrollWidth / 3;

            if (container.scrollLeft <= 0) {
                // Jump to the start of the second section
                container.scrollLeft = singleSectionWidth;
            } else if (container.scrollLeft >= singleSectionWidth * 2) {
                // Jump back to the start of the second section
                container.scrollLeft = singleSectionWidth;
            }
        }
    };

    return (
        <section className="bg-white py-24 px-4 sm:px-8 lg:px-20 relative overflow-hidden">
            {/* Background Organic Blob */}
            <div className="absolute right-[-5%] bottom-[-5%] w-[60%] h-[80%] pointer-events-none z-0">
                <svg
                    viewBox="0 0 800 600"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full opacity-[0.8]"
                    preserveAspectRatio="xMaxYMax meet"
                >
                    <path
                        d="M740 400C740 510.457 650.457 600 540 600C429.543 600 200 600 100 500C0 400 0 300 100 200C200 100 300 0 450 0C600 0 740 289.543 740 400Z"
                        fill="#D3C7B9"
                    />
                </svg>
            </div>

            <div className="max-w-[1400px] mx-auto relative z-10">
                {/* Header Section */}
                <div className="mb-16 relative flex flex-col md:flex-row justify-between items-start md:items-center px-4">
                    <div className="relative">
                        <p className="text-[#9BB098] text-xs font-bold uppercase tracking-[0.3em] mb-3">WHAT THEY SAYS</p>
                        <h2 className="text-4xl lg:text-5xl font-bold text-[#353935] m-0">
                            Best Feedback From Clients
                        </h2>

                        <div className="hidden lg:block absolute -top-4 left-[60%] opacity-20 transform translate-x-12">
                            <div className="grid grid-cols-6 gap-2">
                                {[...Array(24)].map((_, i) => (
                                    <div key={i} className="w-1 h-1 rounded-full bg-slate-400"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 md:mt-0">
                        <div className="px-5 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center">
                            <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">STEP 04</span>
                        </div>
                    </div>
                </div>

                {/* Feedback Content with Constant Picture */}
                <div className="flex flex-col lg:flex-row items-end lg:items-end gap-0">

                    {/* Constant Image - Stays static on the left */}
                    <div className="flex-shrink-0 relative z-0">
                        <div className="w-full sm:min-w-[450px] sm:w-[500px] aspect-[4/3] rounded-[32px] overflow-hidden shadow-lg">
                            <img
                                src="/assets/feedback.jpeg"
                                alt="Featured feedback"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Scrollable Comments - Overlaps the static image */}
                    <div
                        ref={scrollRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onScroll={handleScroll}
                        className="flex flex-row items-end gap-12 overflow-x-auto pb-12 pt-8 hide-scrollbar cursor-grab active:cursor-grabbing select-none w-full mt-[-80px] lg:mt-0 lg:ml-[-420px] relative z-20 px-4 sm:px-10 lg:pl-[400px] snap-x snap-mandatory scroll-smooth"
                    >
                        {loopedItems.map((item, index) => (
                            <div key={`${item.id}-${index}`} className="flex-shrink-0 snap-center">
                                <div className="w-[300px] sm:w-[320px] lg:w-[350px] h-full bg-white rounded-[32px] p-6 shadow-xl border border-white flex flex-col justify-between transition-transform duration-300 hover:scale-[1.02]">
                                    <div>
                                        <div className="flex gap-1 mb-4 text-[#FFB21E]">
                                            {[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                                        </div>
                                        <p className="text-slate-500 text-xs sm:text-sm italic font-medium leading-relaxed mb-6">
                                            {item.text}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={item.avatar}
                                            alt={item.name}
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-[16px] object-cover"
                                        />
                                        <div>
                                            <h4 className="m-0 text-xs font-bold text-slate-800">{item.name}</h4>
                                            <p className="m-0 text-[9px] text-[#A8B9A6] font-bold uppercase tracking-widest leading-none mt-1">{item.nameLabel}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
