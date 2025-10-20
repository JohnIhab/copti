import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { getAllBibleBooks, getBookChapters, getChapterVersesWithText, BibleBook } from '../services/bibleBooksService';
import { Helmet } from 'react-helmet';

const ReadBible: React.FC = () => {
    const [books, setBooks] = useState<BibleBook[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<BibleBook[]>([]);
    const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
    const [chapters, setChapters] = useState<number[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [verses, setVerses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTestament, setSelectedTestament] = useState<string>('');
    const [highlightedVerses, setHighlightedVerses] = useState<string[]>([]);
    // Toggle highlight for a verse by id
    const handleVerseClick = (verseId: string) => {
        setHighlightedVerses(prev =>
            prev.includes(verseId)
                ? prev.filter(id => id !== verseId)
                : [...prev, verseId]
        );
    };

    // Music player state and refs
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Pause music if user leaves page
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    // GSAP refs
    const containerRef = useRef<HTMLDivElement>(null);
    const booksRef = useRef<HTMLDivElement>(null);
    const chaptersRef = useRef<HTMLDivElement>(null);
    const versesRef = useRef<HTMLOListElement>(null);

    const oldTestamentBooks = [
        "التكوين", "الخروج", "اللاويين", "العدد", "التثنية", "يشوع", "القضاة", "راعوث",
        "صموئيل الأول", "صموئيل الثاني", "الملوك الأول", "الملوك الثاني", "أخبار الأيام الأول", "أخبار الأيام الثاني",
        "عزرا", "نحميا", "أستير", "أيوب", "المزامير", "الأمثال", "الجامعة", "نشيد الأنشاد",
        "إشعياء", "إرميا", "مراثي إرميا", "حزقيال", "دانيال", "هوشع", "يوئيل", "عاموس", "عوبديا",
        "يونان", "ميخا", "ناحوم", "حبقوق", "صفنيا", "حجي", "زكريا", "ملاخي"
    ];

    const newTestamentBooks = [
        "متى", "مرقس", "لوقا", "يوحنا", "أعمال الرسل",
        "رومية", "كورنثوس الأولى", "كورنثوس الثانية", "غلاطية", "أفسس", "فيلبي", "كولوسي",
        "تسالونيكي الأولى", "تسالونيكي الثانية", "تيموثاوس الأولى", "تيموثاوس الثانية", "تيطس",
        "فليمون", "عبرانيين", "يعقوب", "بطرس الأولى", "بطرس الثانية", "يوحنا الأولى",
        "يوحنا الثانية", "يوحنا الثالثة", "يهوذا", "رؤيا يوحنا"
    ];

    useEffect(() => {
        setLoading(true);
        getAllBibleBooks()
            .then(setBooks)
            .catch(() => setError('فشل تحميل قائمة الأسفار'))
            .finally(() => setLoading(false));
    }, []);

    // Animate main container on mount
    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(
                containerRef.current,
                { y: 60, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
            );
        }
    }, []);

    // Animate books dropdown
    useEffect(() => {
        if (booksRef.current && selectedTestament) {
            gsap.fromTo(
                booksRef.current,
                { x: 40, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }
            );
        }
    }, [selectedTestament]);

    // Animate chapters dropdown
    useEffect(() => {
        if (chaptersRef.current && selectedBook) {
            gsap.fromTo(
                chaptersRef.current,
                { x: -40, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }
            );
        }
    }, [selectedBook]);

    // Animate verses list
    useEffect(() => {
        if (versesRef.current && verses.length > 0) {
            gsap.fromTo(
                versesRef.current.children,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power2.out' }
            );
        }
    }, [verses]);

    // 🔹 عند تغيير العهد
    const handleTestamentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const testament = e.target.value;
        setSelectedTestament(testament);
        setSelectedBook(null);
        setSelectedChapter(null);
        setVerses([]);

        if (testament === 'old') {
            setFilteredBooks(
                books.filter(b =>
                    oldTestamentBooks.some(name => b.name.includes(name) || b.nameLong?.includes(name))
                )
            );
        } else if (testament === 'new') {
            setFilteredBooks(
                books.filter(b =>
                    newTestamentBooks.some(name => b.name.includes(name) || b.nameLong?.includes(name))
                )
            );
        } else {
            setFilteredBooks([]);
        }
    };

    const handleBookChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const bookId = e.target.value;
        const book = filteredBooks.find(b => b.id === bookId) || null;
        setSelectedBook(book);
        setSelectedChapter(null);
        setVerses([]);
        if (book) {
            setLoading(true);
            try {
                const chaps = await getBookChapters(book.id);
                setChapters(chaps);
            } catch {
                setError('فشل تحميل الإصحاحات');
            } finally {
                setLoading(false);
            }
        } else {
            setChapters([]);
        }
    };

    const handleChapterChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const chapterNum = Number(value);
        if (!value || isNaN(chapterNum)) {
            setSelectedChapter(null);
            setVerses([]);
            return;
        }
        setSelectedChapter(chapterNum);
        setVerses([]);
        if (selectedBook && chapterNum) {
            setLoading(true);
            try {
                const v = await getChapterVersesWithText(selectedBook.id, chapterNum);
                setVerses(v);
            } catch {
                setError('فشل تحميل الأعداد');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <Helmet>
                <title>اقرأ الكتاب المقدس - كنيسة الأنبا رويس بكفر فرج</title>
                <meta name="description" content="تعرف على دور وتميز كنيسة الأنبا رويس في المجتمع، بما في ذلك الكورالات، الجوائز، مدارس الأحد، وتاريخ الكنيسة القديم والجديد." />
                <meta name="keywords" content="كنيسة الأنبا رويس, دور الكنيسة, تميز الكنيسة, كورالات, جوائز الكنيسة, مدارس الأحد, تاريخ الكنيسة" />
                <meta name="author" content="كنيسة الأنيا رويس بكفر فرج" />
            </Helmet>
            <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100 py-8 mt-20">
                <div ref={containerRef} className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 border border-indigo-100">
                    {/* Music play button and audio */}
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={handlePlayPause}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold shadow hover:bg-indigo-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                            title={isPlaying ? 'إيقاف الموسيقى' : 'تشغيل موسيقى هادئة للقراءة'}
                        >
                            {isPlaying ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="6" y="6" width="4" height="12" rx="1" /><rect x="14" y="6" width="4" height="12" rx="1" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><polygon points="6,4 20,12 6,20" /></svg>
                            )}
                            {isPlaying ? 'إيقاف الموسيقى' : 'تشغيل موسيقى هادئة'}
                        </button>
                        {/* Calm music audio (royalty-free, e.g. from pixabay or similar) */}
                        <audio
                            ref={audioRef}
                            src="/audio/Sonder(chosic.com).mp3"
                            loop
                            onEnded={() => setIsPlaying(false)}
                            onPause={() => setIsPlaying(false)}
                            onPlay={() => setIsPlaying(true)}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8 tracking-tight drop-shadow-sm">
                        اقرأ الكتاب المقدس
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-center font-semibold border border-red-200 animate-pulse">
                            {error}
                        </div>
                    )}

                    {/* اختيار العهد */}
                    <div className="mb-6">
                        <label className="block text-right text-lg font-medium text-indigo-800 mb-2">اختر العهد:</label>
                        <select
                            value={selectedTestament}
                            onChange={handleTestamentChange}
                            className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900 shadow-sm transition"
                        >
                            <option value="">-- اختر العهد --</option>
                            <option value="old">العهد القديم</option>
                            <option value="new">العهد الجديد</option>
                        </select>
                    </div>

                    {/* اختيار السفر */}
                    {selectedTestament && (
                        <div ref={booksRef} className="mb-6">
                            <label className="block text-right text-lg font-medium text-indigo-800 mb-2">اختر السفر:</label>
                            <select
                                value={selectedBook?.id || ''}
                                onChange={handleBookChange}
                                className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900 shadow-sm transition"
                            >
                                <option value="">-- اختر السفر --</option>
                                {filteredBooks.map(book => (
                                    <option key={book.id} value={book.id}>
                                        {book.nameLong || book.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* اختيار الإصحاح */}
                    {selectedBook && (
                        <div ref={chaptersRef} className="mb-6">
                            <label className="block text-right text-lg font-medium text-indigo-800 mb-2">اختر الإصحاح:</label>
                            <select
                                value={selectedChapter || ''}
                                onChange={handleChapterChange}
                                className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900 shadow-sm transition"
                            >
                                <option value="">-- اختر الإصحاح --</option>
                                {chapters
                                    .filter(chap => typeof chap === 'number' && !isNaN(chap))
                                    .map(chap => (
                                        <option key={chap} value={chap}>{chap}</option>
                                    ))}
                            </select>
                        </div>
                    )}

                    {/* التحميل */}
                    {loading && (
                        <div className="flex justify-center items-center my-8">
                            <svg className="animate-spin h-6 w-6 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                            <span className="text-indigo-700 font-semibold">جاري التحميل...</span>
                        </div>
                    )}

                    {/* عرض الأعداد */}
                    {verses.length > 0 && (
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl p-6 mt-8 shadow-inner border border-indigo-100">
                            <h3 className="text-xl font-bold text-indigo-800 mb-4 text-right">الأعداد:</h3>
                            <ol ref={versesRef} className="rtl text-right space-y-4">
                                {verses.map((verse) => {
                                    let reference = verse.reference;
                                    if (typeof reference !== 'string' || reference.includes('NaN')) reference = null;
                                    const isHighlighted = highlightedVerses.includes(verse.id);
                                    return (
                                        <li
                                            key={verse.id}
                                            className={`bg-white rounded-lg shadow p-4 border border-indigo-50 hover:bg-indigo-50 transition flex flex-col gap-1 cursor-pointer ${isHighlighted ? 'bg-yellow-200' : ''}`}
                                            onClick={() => handleVerseClick(verse.id)}
                                            title={isHighlighted ? 'إزالة التمييز' : 'تمييز العدد'}
                                        >
                                            <span className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: verse.content }} />
                                            {reference && (
                                                <span className="text-xs text-indigo-500 font-semibold">({reference})</span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ol>
                            <div className="mt-2 text-xs text-gray-500 text-right">انقر على العدد لتمييزه أو إزالة التمييز</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ReadBible;
