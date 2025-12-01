export default function BlogSection() {
    const blogs = [
        { id: 1, title: 'Lorem Ipsum Amet Ipi', subtitle: 'Lorem ipsum ipi', image: '/src/assets/blog1.jpeg' },
        { id: 2, title: 'Lorem Ipsum Amet Ipi', subtitle: 'Lorem ipsum ipi', image: '/src/assets/blog2.jpeg' },
        { id: 3, title: 'Lorem Ipsum Amet Ipi', subtitle: 'Lorem ipsum ipi', image: '/src/assets/blog3.jpeg' },
        { id: 4, title: 'Lorem Ipsum Amet Ipi', subtitle: 'Lorem ipsum ipi', image: '/src/assets/blog4.jpeg' },
    ]

    return (
        <section className="bg-slate-50 py-12 sm:py-16 px-4 sm:px-8 lg:px-20" id="blog">
            <div className="max-w-[1200px] mx-auto">
                <div className="text-center mb-8">
                    <p className="text-sm font-normal text-slate-700 m-0 mb-1">Roaming Tales</p>
                    <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 m-0">
                        Latest Travel Blog
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                    {blogs.map((item) => (
                        <article
                            key={item.id}
                            className="relative rounded-2xl overflow-hidden h-64 sm:h-72 group"
                        >
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${item.image})` }}
                            />
                            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="m-0 mb-1 text-xs text-slate-200">{item.subtitle}</p>
                                <h3 className="m-0 mb-2 text-sm sm:text-base font-semibold text-white line-clamp-2">
                                    {item.title}
                                </h3>
                                {item.id === 1 && (
                                    <button className="mt-2 px-4 py-1.5 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-colors">
                                        Read More
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>

                <div className="flex justify-between items-center mt-8">
                    <div className="flex gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                    </div>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-300 cursor-pointer">
                            ←
                        </button>
                        <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark cursor-pointer">
                            →
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
