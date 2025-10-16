import { useMemo, useState, useEffect } from 'react'
import { saveSecondaryServiceData, getSecondaryServiceData, updateSecondaryServiceData } from '../../services/secondaryService'

function getFridaysOfMonth(year: number, month: number) {
    const dates: Date[] = []
    const d = new Date(year, month, 1)
    while (d.getMonth() === month) {
        if (d.getDay() === 5) dates.push(new Date(d))
        d.setDate(d.getDate() + 1)
    }
    return dates
}

type Row = { id: number; name: string; attendance: boolean[] }

export default function SecondaryService() {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const fridays = useMemo(() => getFridaysOfMonth(year, month), [year, month])

    const CATEGORIES = ['بنين', 'بنات']
    const GRADES = ['الصف الاول الثانوي', 'الصف الثانى الثانوي', 'الصف الثالث الثانوي']
    const WHO_SERVE = ['خدام البنين', 'خدام البنات']

    const [selectedCategory, setSelectedCategory] = useState(0)
    const [selectedGradeIdx, setSelectedGradeIdx] = useState(0)
    const [rowsByCategory, setRowsByCategory] = useState<Record<string, Row[]>>(() => {
        const init: Record<string, Row[]> = {}
        for (let c = 0; c < CATEGORIES.length; c++) for (let g = 0; g < GRADES.length; g++) init[`${c}_${g}`] = []
        return init
    })
    const [whoRowsByCategory, setWhoRowsByCategory] = useState<Record<number, Row[]>>(() => {
        const init: Record<number, Row[]> = {}
        for (let i = 0; i < WHO_SERVE.length; i++) init[i] = []
        return init
    })

    const [input, setInput] = useState('')
    const [bulk, setBulk] = useState('')
    const [whoInput, setWhoInput] = useState('')
    const [whoBulk, setWhoBulk] = useState('')
    const [error, setError] = useState('')
    const [docId, setDocId] = useState<string | null>(null)

    function keyFor(c: number, g: number) { return `${c}_${g}` }

    function addName(name: string, category = selectedCategory, grade = selectedGradeIdx) {
        const k = keyFor(category, grade)
        setRowsByCategory(prev => {
            const list = prev[k] || []
            const id = list.length > 0 ? list[list.length - 1].id + 1 : 1
            return { ...prev, [k]: [...list, { id, name, attendance: fridays.map(() => false) }] }
        })
    }

    function handleAdd() { const t = input.trim(); if (!t) { setError('الرجاء إدخال اسم صالح'); return } addName(t); setInput(''); setError('') }
    function handleBulkImport() { const lines = bulk.split(/\r?\n/).map(l => l.trim()).filter(Boolean); if (lines.length === 0) { setError('لا توجد أسماء للاستيراد'); return } lines.forEach(l => addName(l, selectedCategory, selectedGradeIdx)); setBulk(''); setError('') }

    function addNameToWho(name: string, who = selectedCategory) { setWhoRowsByCategory(prev => { const list = prev[who] || []; const id = list.length > 0 ? list[list.length - 1].id + 1 : 1; return { ...prev, [who]: [...list, { id, name, attendance: fridays.map(() => false) }] } }) }
    function handleWhoAdd() { const t = whoInput.trim(); if (!t) { setError('الرجاء إدخال اسم صالح'); return } addNameToWho(t, selectedCategory); setWhoInput(''); setError('') }
    function handleWhoBulkImport() { const lines = whoBulk.split(/\r?\n/).map(l => l.trim()).filter(Boolean); if (lines.length === 0) { setError('لا توجد أسماء للاستيراد'); return } lines.forEach(l => addNameToWho(l, selectedCategory)); setWhoBulk(''); setError('') }

    const [selected, setSelected] = useState<Record<string, boolean>>({})
    const [selectedWho, setSelectedWho] = useState<Record<string, boolean>>({})

    const currentKey = keyFor(selectedCategory, selectedGradeIdx)
    const currentRows = rowsByCategory[currentKey] || []
    const whoCurrentRows = whoRowsByCategory[selectedCategory] || []

    async function handleSave() {
        const data: any[] = []
        Object.keys(rowsByCategory).forEach(k => {
            const [c, g] = k.split('_').map(n => Number(n))
            const list = rowsByCategory[k] || []
            list.forEach(r => data.push(['grade', c, g, r.id, r.name, ...r.attendance]))
        })
        Object.keys(whoRowsByCategory).forEach(k => {
            const cat = Number(k)
            const list = whoRowsByCategory[cat] || []
            list.forEach(r => data.push(['who', cat, r.id, r.name, ...r.attendance]))
        })
        try {
            if (docId) { await updateSecondaryServiceData(docId, data); setError('تم التحديث بنجاح') }
            else { const res = await saveSecondaryServiceData(data); setDocId((res as any).id); setError('تم الحفظ بنجاح') }
        } catch (e: any) { setError('خطأ عند الحفظ: ' + (e.message || e.toString())) }
        setTimeout(() => setError(''), 3000)
    }

    async function handleLoad() {
        try {
            const doc = await getSecondaryServiceData()
            if (!doc) { setError('لا توجد بيانات محفوظة'); return }
            setDocId(doc.id)
            const rawData = doc.data as any[]
            const newMap: Record<string, Row[]> = {}
            for (let c = 0; c < CATEGORIES.length; c++) for (let g = 0; g < GRADES.length; g++) newMap[keyFor(c, g)] = []
            const newWho: Record<number, Row[]> = {}
            for (let i = 0; i < WHO_SERVE.length; i++) newWho[i] = []

            rawData.forEach((obj: any) => {
                const values = Object.keys(obj).sort().map((k: string) => obj[k])
                const t0 = values[0]
                if (t0 === 'grade') {
                    const cat = Number(values[1])
                    const gidx = Number(values[2])
                    const id = values[3]
                    const name = values[4]
                    const attendance = values.slice(5).map((v: any) => Boolean(v))
                    const normalized = fridays.map((_, i) => attendance[i] ?? false)
                    const k = keyFor(cat, gidx)
                    if (k in newMap) newMap[k].push({ id: typeof id === 'number' ? id : newMap[k].length + 1, name: String(name || ''), attendance: normalized })
                } else if (t0 === 'who') {
                    const cat = Number(values[1])
                    const id = values[2]
                    const name = values[3]
                    const attendance = values.slice(4).map((v: any) => Boolean(v))
                    const normalized = fridays.map((_, i) => attendance[i] ?? false)
                    if (cat in newWho) newWho[cat].push({ id: typeof id === 'number' ? id : newWho[cat].length + 1, name: String(name || ''), attendance: normalized })
                }
            })
            setRowsByCategory(newMap)
            setWhoRowsByCategory(newWho)
            setError('تم التحميل')
            setTimeout(() => setError(''), 2000)
        } catch (e: any) { setError('خطأ عند التحميل: ' + (e.message || e.toString())) }
    }

    useEffect(() => { setSelectedCategory(0); setSelectedGradeIdx(0); handleLoad(); }, [])

    function toggleSelect(key: string) { setSelected(s => ({ ...s, [key]: !s[key] })) }
    function toggleSelectWho(key: string) { setSelectedWho(s => ({ ...s, [key]: !s[key] })) }

    function toggleAttend(category: number, gradeIdx: number, rowId: number, colIdx: number) {
        const k = keyFor(category, gradeIdx)
        setRowsByCategory(prev => { const list = prev[k] || []; const updated = list.map(r => r.id === rowId ? { ...r, attendance: r.attendance.map((a, i) => i === colIdx ? !a : a) } : r); return { ...prev, [k]: updated } })
    }

    function toggleAttendWho(category: number, rowId: number, colIdx: number) { setWhoRowsByCategory(prev => { const list = prev[category] || []; const updated = list.map(r => r.id === rowId ? { ...r, attendance: r.attendance.map((a, i) => i === colIdx ? !a : a) } : r); return { ...prev, [category]: updated } }) }

    async function handleDeleteSelected() {
        const keysToDelete = Object.keys(selected).filter(k => selected[k])
        if (keysToDelete.length === 0) { setError('لا يوجد عناصر محددة للحذف'); return }
        if (!confirm('هل أنت متأكد من حذف العناصر المحددة؟')) return
        setRowsByCategory(prev => { const out = { ...prev }; keysToDelete.forEach(fullKey => { const [c, g, idStr] = fullKey.split('_'); if (!idStr) return; const id = Number(idStr); const k = `${c}_${g}`; out[k] = (out[k] || []).filter(r => r.id !== id); }); return out })
        setSelected({})
        await handleSave()
    }

    async function handleDeleteAll() { if (!confirm('هل أنت متأكد من حذف جميع الأسماء؟')) return; setRowsByCategory(prev => ({ ...prev, [currentKey]: [] })); setSelected({}); await handleSave() }

    return (
        <div className="p-4">
            <div className="bg-white shadow rounded p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">غياب خدمة ثانوي - جدول أيام الجمعة</h2>
                    <div className="flex items-center gap-3">
                        {docId ? <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">مخزن</span> : <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">لم يتم الحفظ</span>}
                        <button onClick={handleSave} className="bg-blue-600 text-white px-3 py-1 rounded shadow">حفظ</button>
                    </div>
                </div>

                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="block mb-1">اختر الفئة</label>
                        <select value={selectedCategory} onChange={e => setSelectedCategory(Number(e.target.value))} className="border rounded px-2 py-1">
                            {CATEGORIES.map((c, i) => <option key={i} value={i}>{c}</option>)}
                        </select>
                        <div className="mt-2">
                            <label className="block mb-1">اختر الصف</label>
                            <select value={selectedGradeIdx} onChange={e => setSelectedGradeIdx(Number(e.target.value))} className="border rounded px-2 py-1">
                                {GRADES.map((g, i) => <option key={i} value={i}>{g}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex gap-2 mb-2">
                            <input dir="auto" value={input} onChange={e => setInput(e.target.value)} placeholder="أدخل اسم ثم اضغط إضافة" className="border rounded px-3 py-2 flex-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                            <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">إضافة</button>
                        </div>
                        <textarea value={bulk} onChange={e => setBulk(e.target.value)} placeholder="لصق أسماء (سطر لكل اسم) ثم اضغط استيراد" className="w-full h-24 border rounded p-2" />
                        <div className="mt-2 flex gap-2">
                            <button onClick={handleBulkImport} className="bg-indigo-600 text-white px-3 py-1 rounded shadow hover:bg-indigo-700">استيراد</button>
                            <button onClick={() => { setBulk(''); setError('') }} className="px-3 py-1 border rounded">مسح</button>
                        </div>

                        <div className="mt-4 p-3 border rounded bg-gray-50">
                            <h4 className="font-medium mb-2">خدام - تحكم مستقل</h4>
                            <div className="flex gap-2 mb-2">
                                <input dir="auto" value={whoInput} onChange={e => setWhoInput(e.target.value)} placeholder="أدخل اسم خادم ثم اضغط إضافة" className="border rounded px-3 py-2 flex-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                                <button onClick={handleWhoAdd} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">إضافة خادم</button>
                            </div>
                            <textarea value={whoBulk} onChange={e => setWhoBulk(e.target.value)} placeholder="لصق أسماء خدام (سطر لكل اسم) ثم اضغط استيراد" className="w-full h-20 border rounded p-2 mb-2" />
                            <div className="flex gap-2">
                                <button onClick={handleWhoBulkImport} className="bg-indigo-600 text-white px-3 py-1 rounded shadow hover:bg-indigo-700">استيراد خدام</button>
                                <button onClick={() => { setWhoBulk(''); setError('') }} className="px-3 py-1 border rounded">مسح</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                        <div>الأيام في الشهر (أيام الجمعة):</div>
                    </div>
                </div>

                <div className="mb-3 flex gap-2">
                    <button onClick={handleDeleteSelected} className="bg-red-600 text-white px-3 py-1 rounded shadow hover:bg-red-700">حذف المحدد</button>
                    <button onClick={handleDeleteAll} className="bg-red-800 text-white px-3 py-1 rounded shadow hover:bg-red-900">حذف الكل</button>
                </div>

                {error && <div className="text-red-600 mb-2">{error}</div>}

                {/* Mobile: stacked cards for students */}
                <div className="sm:hidden space-y-4">
                    {currentRows.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">لا يوجد أسماء بعد</div>
                    ) : (
                        currentRows.map((r, idx) => (
                            <div key={r.id} className="bg-white rounded-lg p-4 shadow border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-lg">{idx + 1}</span>
                                        <span className="ml-2 text-gray-800">{r.name}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={!!selected[`${currentKey}_${r.id}`]}
                                        onChange={() => toggleSelect(`${currentKey}_${r.id}`)}
                                    />
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {r.attendance.map((att, i) => (
                                        <button
                                            key={i}
                                            onClick={() => toggleAttend(selectedCategory, selectedGradeIdx, r.id, i)}
                                            className={`w-8 h-8 rounded ${att ? 'bg-green-600' : 'bg-white'} border shadow-sm hover:scale-105 transition-transform`}
                                            aria-pressed={att}
                                            title={fridays[i].toLocaleDateString('ar-EG')}
                                        >
                                            {fridays[i].toLocaleDateString('ar-EG').slice(0, 5)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {/* Desktop/table for sm and up */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full border table-fixed" dir="rtl">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-2 py-2">م</th>
                                <th className="border px-2 py-2 sticky left-0 bg-gray-100 z-20">م</th>
                                <th className="border px-2 py-2 sticky left-12 bg-gray-100 z-20">الاسم</th>
                                {fridays.map((d, i) => (
                                    <th key={i} className="border px-2 py-2 align-bottom" style={{ height: 120 }}>
                                        <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap' }} className="text-sm">{d.toLocaleDateString('ar-EG')}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentRows.length === 0 ? (
                                <tr><td className="border px-3 py-2 text-center" colSpan={3 + fridays.length}>لا يوجد أسماء بعد</td></tr>
                            ) : (
                                currentRows.map((r, idx) => (
                                    <tr key={r.id} className={`transition-colors hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="border px-2 py-2 text-center"><input type="checkbox" checked={!!selected[`${currentKey}_${r.id}`]} onChange={() => toggleSelect(`${currentKey}_${r.id}`)} /></td>
                                        <td className="border px-2 py-2 text-center sticky left-0 bg-white z-10">{idx + 1}</td>
                                        <td className="border px-2 py-2 sticky left-12 bg-white z-10">{r.name}</td>
                                        {r.attendance.map((att, i) => (
                                            <td key={i} className="border px-2 py-2 text-center"><button onClick={() => toggleAttend(selectedCategory, selectedGradeIdx, r.id, i)} className={`w-6 h-6 inline-block rounded ${att ? 'bg-green-600' : 'bg-white'} border shadow-sm hover:scale-105 transition-transform`} aria-pressed={att} /></td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-2">{CATEGORIES[selectedCategory]} - خدام</h3>
                    <div className="mb-3">
                        <button onClick={() => { const keys = Object.keys(selectedWho).filter(k => selectedWho[k]); if (keys.length === 0) { setError('لا يوجد خدام محددين للحذف'); return } setWhoRowsByCategory(prev => { const out = { ...prev }; keys.forEach(full => { const [cat, idStr] = full.split('_'); const id = Number(idStr); out[Number(cat)] = (out[Number(cat)] || []).filter(r => r.id !== id) }); return out }); setSelectedWho({}) }} className="bg-red-600 text-white px-3 py-1 rounded">حذف المحدد - خدام</button>
                        <button onClick={() => { setWhoRowsByCategory(prev => ({ ...prev, [selectedCategory]: [] })); setSelectedWho({}) }} className="bg-red-800 text-white px-3 py-1 rounded mr-2">حذف الكل - خدام</button>
                    </div>

                    {/* Mobile: stacked cards for servants */}
                    <div className="sm:hidden space-y-4">
                        {(whoCurrentRows || []).length === 0 ? (
                            <div className="text-center py-8 text-gray-500">لا يوجد أسماء بعد</div>
                        ) : (
                            whoCurrentRows.map((r, idx) => (
                                <div key={r.id} className="bg-white rounded-lg p-4 shadow border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-bold text-lg">{idx + 1}</span>
                                            <span className="ml-2 text-gray-800">{r.name}</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={!!selectedWho[`${selectedCategory}_${r.id}`]}
                                            onChange={() => toggleSelectWho(`${selectedCategory}_${r.id}`)}
                                        />
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {r.attendance.map((att, i) => (
                                            <button
                                                key={i}
                                                onClick={() => toggleAttendWho(selectedCategory, r.id, i)}
                                                className={`w-8 h-8 rounded ${att ? 'bg-green-600' : 'bg-white'} border shadow-sm hover:scale-105 transition-transform`}
                                                aria-pressed={att}
                                                title={fridays[i].toLocaleDateString('ar-EG')}
                                            >
                                                {fridays[i].toLocaleDateString('ar-EG').slice(0, 5)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {/* Desktop/table for sm and up */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="min-w-full border table-fixed" dir="rtl">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-2 py-2">م</th>
                                    <th className="border px-2 py-2 sticky left-0 bg-gray-100 z-20">م</th>
                                    <th className="border px-2 py-2 sticky left-12 bg-gray-100 z-20">الاسم</th>
                                    {fridays.map((d, i) => (
                                        <th key={i} className="border px-2 py-2 align-bottom" style={{ height: 120 }}>
                                            <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap' }} className="text-sm">{d.toLocaleDateString('ar-EG')}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(whoCurrentRows || []).length === 0 ? (
                                    <tr><td className="border px-3 py-2 text-center" colSpan={3 + fridays.length}>لا يوجد أسماء بعد</td></tr>
                                ) : (
                                    whoCurrentRows.map((r, idx) => (
                                        <tr key={r.id} className={`transition-colors hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            <td className="border px-2 py-2 text-center"><input type="checkbox" checked={!!selectedWho[`${selectedCategory}_${r.id}`]} onChange={() => toggleSelectWho(`${selectedCategory}_${r.id}`)} /></td>
                                            <td className="border px-2 py-2 text-center sticky left-0 bg-white z-10">{idx + 1}</td>
                                            <td className="border px-2 py-2 sticky left-12 bg-white z-10">{r.name}</td>
                                            {r.attendance.map((att, i) => (
                                                <td key={i} className="border px-2 py-2 text-center"><button onClick={() => toggleAttendWho(selectedCategory, r.id, i)} className={`w-6 h-6 inline-block rounded ${att ? 'bg-green-600' : 'bg-white'} border shadow-sm hover:scale-105 transition-transform`} aria-pressed={att} /></td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
