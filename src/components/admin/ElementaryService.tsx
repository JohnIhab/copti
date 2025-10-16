import { useMemo, useState, useEffect } from 'react'
import { saveElementaryServiceData, getElementaryServiceData, updateElementaryServiceData } from '../../services/elementaryService'

function getFridaysOfMonth(year: number, month: number) {
    const dates: Date[] = []
    const d = new Date(year, month, 1)
    while (d.getMonth() === month) {
        if (d.getDay() === 5) dates.push(new Date(d))
        d.setDate(d.getDate() + 1)
    }
    return dates
}

type Row = {
    id: number
    name: string
    attendance: boolean[] // one item per friday
}

export default function ElementaryService() {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    const fridays = useMemo(() => getFridaysOfMonth(year, month), [year, month])

    // per-grade rows are stored in rowsByGrade
    // Maintain rows per grade (0..5)
    const GRADES = [
        'الصف الاول الابتدائي',
        'الصف الثاني الابتدائي',
        'الصف الثالث الابتدائي',
        'الصف الرابع الابتدائي',
        'الصف الخامس الابتدائي',
        'الصف السادس الابتدائي بنين',
        'الصف السادس الابتدائي بنات',
    ]
    const WHO_SERVE = [
        'خدام الصف الاول الابتدائي',
        'خدام الصف الثاني الابتدائي',
        'خدام الصف الثالث الابتدائي',
        'خدام الصف الرابع الابتدائي',
        'خدام الصف الخامس الابتدائي',
        'خدام الصف السادس الابتدائي بنين',
        'خدام الصف السادس الابتدائي بنات',
    ]
    const [selectedGrade, setSelectedGrade] = useState<number>(0)
    const [selectedWho, setSelectedWho] = useState<Record<string, boolean>>({})
    const [whoSearch, setWhoSearch] = useState('')
    const [rowsByGrade, setRowsByGrade] = useState<Record<number, Row[]>>(() => {
        const init: Record<number, Row[]> = {}
        for (let i = 0; i < GRADES.length; i++) init[i] = []
        return init
    })
    const [whoRowsByGroup, setWhoRowsByGroup] = useState<Record<number, Row[]>>(() => {
        const init: Record<number, Row[]> = {}
        for (let i = 0; i < WHO_SERVE.length; i++) init[i] = []
        return init
    })
    const [input, setInput] = useState('')
    const [bulk, setBulk] = useState('')
    const [error, setError] = useState('')
    const [whoInput, setWhoInput] = useState('')
    const [whoBulk, setWhoBulk] = useState('')

    function addName(name: string, grade = selectedGrade) {
        setRowsByGrade(prev => {
            const list = prev[grade] || []
            const id = list.length > 0 ? list[list.length - 1].id + 1 : 1
            const newRow: Row = { id, name, attendance: fridays.map(() => false) }
            return { ...prev, [grade]: [...list, newRow] }
        })
    }

    function handleAdd() {
        const trimmed = input.trim()
        if (!trimmed) {
            setError('الرجاء إدخال اسم صالح')
            return
        }
        addName(trimmed)
        setInput('')
        setError('')
    }

    function handleBulkImport() {
        const lines = bulk.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
        if (lines.length === 0) {
            setError('لا توجد أسماء للاستيراد')
            return
        }
        lines.forEach(l => addName(l, selectedGrade))
        setBulk('')
        setError('')
    }

    function addNameToWho(name: string, who = selectedGrade) {
        setWhoRowsByGroup(prev => {
            const list = prev[who] || []
            const id = list.length > 0 ? list[list.length - 1].id + 1 : 1
            const newRow: Row = { id, name, attendance: fridays.map(() => false) }
            return { ...prev, [who]: [...list, newRow] }
        })
    }

    function handleWhoAdd() {
        const trimmed = whoInput.trim()
        if (!trimmed) {
            setError('الرجاء إدخال اسم صالح')
            return
        }
        addNameToWho(trimmed)
        setWhoInput('')
        setError('')
    }

    function handleWhoBulkImport() {
        const lines = whoBulk.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
        if (lines.length === 0) {
            setError('لا توجد أسماء للاستيراد')
            return
        }
        lines.forEach(l => addNameToWho(l, selectedGrade))
        setWhoBulk('')
        setError('')
    }

    const [docId, setDocId] = useState<string | null>(null)
    const [selected, setSelected] = useState<Record<string, boolean>>({})
    const currentRows = rowsByGrade[selectedGrade] || []
    const [search, setSearch] = useState('')
    const filteredRows = currentRows.filter(r => r.name.includes(search) || r.name.includes(search.trim()))
    const allSelected = currentRows.length > 0 && currentRows.every(r => !!selected[`${selectedGrade}_${r.id}`])

    function toggleSelect(id: number) {
        const key = `${selectedGrade}_${id}`
        setSelected(s => ({ ...s, [key]: !s[key] }))
    }

    function toggleSelectWho(id: number) {
        const key = `${selectedGrade}_${id}`
        setSelectedWho(s => ({ ...s, [key]: !s[key] }))
    }

    function toggleSelectAll() {
        if (allSelected) {
            // clear only keys for this grade
            setSelected(s => {
                const out: Record<string, boolean> = {}
                Object.keys(s).forEach(k => { if (!k.startsWith(selectedGrade + '_')) out[k] = s[k] })
                return out
            })
        } else {
            const map: Record<string, boolean> = {}
            currentRows.forEach(r => map[`${selectedGrade}_${r.id}`] = true)
            setSelected(s => ({ ...s, ...map }))
        }
    }

    // who table select-all
    const whoCurrentRows = whoRowsByGroup[selectedGrade] || []
    const whoFilteredRows = whoCurrentRows.filter(r => r.name.includes(whoSearch) || r.name.includes(whoSearch.trim()))
    const whoAllSelected = whoCurrentRows.length > 0 && whoCurrentRows.every(r => !!selectedWho[`${selectedGrade}_${r.id}`])

    function toggleSelectAllWho() {
        if (whoAllSelected) {
            setSelectedWho(s => {
                const out: Record<string, boolean> = {}
                Object.keys(s).forEach(k => { if (!k.startsWith(selectedGrade + '_')) out[k] = s[k] })
                return out
            })
        } else {
            const map: Record<string, boolean> = {}
            whoCurrentRows.forEach(r => map[`${selectedGrade}_${r.id}`] = true)
            setSelectedWho(s => ({ ...s, ...map }))
        }
    }

    async function handleSave() {
        // Save both grades and who groups as 2D arrays so the firestore helper can convert them.
        // Each saved row: [type, group, id, name, ...attendance] where type is 'grade' or 'who'.
        const data: any[] = []
        Object.keys(rowsByGrade).forEach(gKey => {
            const grade = Number(gKey)
            const list = rowsByGrade[grade] || []
            list.forEach(r => data.push(['grade', grade, r.id, r.name, ...r.attendance]))
        })
        Object.keys(whoRowsByGroup).forEach(gKey => {
            const group = Number(gKey)
            const list = whoRowsByGroup[group] || []
            list.forEach(r => data.push(['who', group, r.id, r.name, ...r.attendance]))
        })
        try {
            if (docId) {
                await updateElementaryServiceData(docId, data)
                setError('تم التحديث بنجاح')
            } else {
                const res = await saveElementaryServiceData(data)
                // res is a DocumentReference; its id is used
                setDocId((res as any).id)
                setError('تم الحفظ بنجاح')
            }
        } catch (e: any) {
            setError('خطأ عند الحفظ: ' + (e.message || e.toString()))
        }
        setTimeout(() => setError(''), 3000)
    }

    async function handleLoad() {
        try {
            const doc = await getElementaryServiceData()
            if (!doc) {
                setError('لا توجد بيانات محفوظة')
                return
            }
            setDocId(doc.id)
            const rawData = doc.data as any[]
            // Reset rowsByGrade and whoRowsByGroup
            const newMap: Record<number, Row[]> = {}
            const newWho: Record<number, Row[]> = {}
            for (let i = 0; i < GRADES.length; i++) newMap[i] = []
            for (let i = 0; i < WHO_SERVE.length; i++) newWho[i] = []
            rawData.forEach((obj: any) => {
                // obj is stored row object with columns like col0, col1, ...
                const values = Object.keys(obj).sort().map((k: string) => obj[k])
                // values[0] might be 'grade' or 'who' or a numeric grade (legacy)
                const t0 = values[0]
                if (t0 === 'grade' || t0 === 'who') {
                    const type = String(t0)
                    const group = Number(values[1])
                    const id = values[2]
                    const name = values[3]
                    const attendance = values.slice(4).map((v: any) => Boolean(v))
                    const normalized = fridays.map((_, i) => attendance[i] ?? false)
                    if (type === 'grade' && !Number.isNaN(group) && group >= 0 && group < GRADES.length) {
                        newMap[group].push({ id: typeof id === 'number' ? id : newMap[group].length + 1, name: String(name || ''), attendance: normalized })
                    } else if (type === 'who' && !Number.isNaN(group) && group >= 0 && group < WHO_SERVE.length) {
                        newWho[group].push({ id: typeof id === 'number' ? id : newWho[group].length + 1, name: String(name || ''), attendance: normalized })
                    }
                } else {
                    // legacy format where values[0] is numeric grade
                    const grade = Number(values[0])
                    const id = values[1]
                    const name = values[2]
                    const attendance = values.slice(3).map((v: any) => Boolean(v))
                    const normalized = fridays.map((_, i) => attendance[i] ?? false)
                    if (!Number.isNaN(grade) && grade >= 0 && grade < GRADES.length) {
                        newMap[grade].push({ id: typeof id === 'number' ? id : newMap[grade].length + 1, name: String(name || ''), attendance: normalized })
                    }
                }
            })
            setRowsByGrade(newMap)
            setWhoRowsByGroup(newWho)
            setError('تم التحميل')
            setTimeout(() => setError(''), 2000)
        } catch (e: any) {
            setError('خطأ عند التحميل: ' + (e.message || e.toString()))
        }
    }

    // Ensure default grade is selected and load data on mount
    useEffect(() => {
        setSelectedGrade(0)
        handleLoad()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function toggleAttend(rowId: number, colIdx: number) {
        setRowsByGrade(prev => {
            const list = prev[selectedGrade] || []
            const updated = list.map(r => r.id === rowId ? { ...r, attendance: r.attendance.map((a, i) => i === colIdx ? !a : a) } : r)
            return { ...prev, [selectedGrade]: updated }
        })
    }

    async function handleDeleteSelected() {
        const keysToDelete = Object.keys(selected).filter(k => k.startsWith(selectedGrade + '_') && selected[k])
        const idsToDelete = keysToDelete.map(k => Number(k.split('_')[1]))
        if (idsToDelete.length === 0) {
            setError('لا يوجد عناصر محددة للحذف')
            return
        }
        if (!confirm('هل أنت متأكد من حذف العناصر المحددة؟')) return
        setRowsByGrade(prev => {
            const list = prev[selectedGrade] || []
            const remaining = list.filter(r => !idsToDelete.includes(r.id))
            return { ...prev, [selectedGrade]: remaining }
        })
        // clear selected keys for this grade
        setSelected(s => {
            const out: Record<string, boolean> = {}
            Object.keys(s).forEach(k => { if (!k.startsWith(selectedGrade + '_')) out[k] = s[k] })
            return out
        })
        // persist change
        await handleSave()
    }

    async function handleDeleteAll() {
        if (!confirm('هل أنت متأكد من حذف جميع الأسماء؟')) return
        setRowsByGrade(prev => ({ ...prev, [selectedGrade]: [] }))
        // clear selected keys for this grade
        setSelected(s => {
            const out: Record<string, boolean> = {}
            Object.keys(s).forEach(k => { if (!k.startsWith(selectedGrade + '_')) out[k] = s[k] })
            return out
        })
        await handleSave()
    }

    return (
        <div className="p-4">
            <div className="bg-white shadow rounded p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">غياب خدمة ابتدائي - جدول أيام الجمعة</h2>
                    <div className="flex items-center gap-3">
                        {docId ? <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">مخزن</span> : <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">لم يتم الحفظ</span>}
                        <button onClick={handleSave} className="bg-blue-600 text-white px-3 py-1 rounded shadow">حفظ</button>
                    </div>
                </div>

                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="block mb-1">اختر الصف</label>
                        <select
                            value={selectedGrade}
                            onChange={e => setSelectedGrade(Number(e.target.value))}
                            className="border rounded px-2 py-1"
                        >
                            {GRADES.map((g, i) => (
                                <option key={i} value={i}>{g}</option>
                            ))}
                        </select>
                        {/* Showing matching خدام group below by default */}
                    </div>


                    <div>
                        <div className="flex gap-2 mb-2">
                            <input
                                dir="auto"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="أدخل اسم ثم اضغط إضافة"
                                className="border rounded px-3 py-2 flex-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                            <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">إضافة</button>
                        </div>
                        <textarea
                            value={bulk}
                            onChange={e => setBulk(e.target.value)}
                            placeholder="لصق أسماء (سطر لكل اسم) ثم اضغط استيراد"
                            className="w-full h-24 border rounded p-2"
                        />
                        <div className="mt-2 flex gap-2">
                            <button onClick={handleBulkImport} className="bg-indigo-600 text-white px-3 py-1 rounded shadow hover:bg-indigo-700">استيراد</button>
                            <button onClick={() => { setBulk(''); setError('') }} className="px-3 py-1 border rounded">مسح</button>
                        </div>

                        <div className="mt-4 p-3 border rounded bg-gray-50">
                            <h4 className="font-medium mb-2">خدام - تحكم مستقل</h4>
                            <div className="flex gap-2 mb-2">
                                <input
                                    dir="auto"
                                    value={whoInput}
                                    onChange={e => setWhoInput(e.target.value)}
                                    placeholder="أدخل اسم خادم ثم اضغط إضافة"
                                    className="border rounded px-3 py-2 flex-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                                <button onClick={handleWhoAdd} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">إضافة خادم</button>
                            </div>
                            <textarea
                                value={whoBulk}
                                onChange={e => setWhoBulk(e.target.value)}
                                placeholder="لصق أسماء خدام (سطر لكل اسم) ثم اضغط استيراد"
                                className="w-full h-20 border rounded p-2 mb-2"
                            />
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
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="ml-auto border px-2 py-1 rounded" />
                </div>

                {error && <div className="text-red-600 mb-2">{error}</div>}

                {/* Mobile: stacked cards for students */}
                <div className="sm:hidden space-y-4">
                    {filteredRows.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">لا يوجد أسماء بعد</div>
                    ) : (
                        filteredRows.map((r, idx) => (
                            <div key={r.id} className="bg-white rounded-lg p-4 shadow border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-lg">{idx + 1}</span>
                                        <span className="ml-2 text-gray-800">{r.name}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={!!selected[`${selectedGrade}_${r.id}`]}
                                        onChange={() => toggleSelect(r.id)}
                                    />
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {r.attendance.map((att, i) => (
                                        <button
                                            key={i}
                                            onClick={() => toggleAttend(r.id, i)}
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
                                <th className="border px-2 py-2">
                                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                                </th>
                                <th className="border px-2 py-2 sticky left-0 bg-gray-100 z-20">م</th>
                                <th className="border px-2 py-2 sticky left-12 bg-gray-100 z-20">الاسم</th>
                                {fridays.map((d, i) => (
                                    <th key={i} className="border px-2 py-2 align-bottom" style={{ height: 120 }}>
                                        <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap' }} className="text-sm">
                                            {d.toLocaleDateString('ar-EG')}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td className="border px-3 py-2 text-center" colSpan={3 + fridays.length}>لا يوجد أسماء بعد</td>
                                </tr>
                            ) : (
                                filteredRows.map((r, idx) => {
                                    // Use visible index (idx) for numbering
                                    const visibleIndex = idx
                                    return (
                                        <tr key={r.id} className={`transition-colors hover:bg-gray-50 ${visibleIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            <td className="border px-2 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={!!selected[`${selectedGrade}_${r.id}`]}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        toggleSelect(r.id);
                                                    }}
                                                />

                                            </td>
                                            <td className="border px-2 py-2 text-center sticky left-0 bg-white z-10">{visibleIndex + 1}</td>
                                            <td className="border px-2 py-2 sticky left-12 bg-white z-10">{r.name}</td>
                                            {r.attendance.map((att, i) => (
                                                <td key={i} className="border px-2 py-2 text-center">
                                                    <button
                                                        onClick={() => toggleAttend(r.id, i)}
                                                        className={`w-6 h-6 inline-block rounded ${att ? 'bg-green-600' : 'bg-white'} border shadow-sm hover:scale-105 transition-transform`}
                                                        aria-pressed={att}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {/* WHO_SERVE table */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-2">{GRADES[selectedGrade]} و {WHO_SERVE[selectedGrade]}</h3>
                    <div className="mb-3 flex gap-2">
                        <div className="text-sm self-center">قائمة الخدام للمجموعة المختارة</div>
                        <input value={whoSearch} onChange={e => setWhoSearch(e.target.value)} placeholder="بحث في الخدام..." className="ml-auto border px-2 py-1 rounded" />
                    </div>
                    <div className="mb-3">
                        <button onClick={() => { /* delete selected who */
                            const keysToDelete = Object.keys(selectedWho).filter(k => k.startsWith(selectedGrade + '_') && selectedWho[k])
                            const idsToDelete = keysToDelete.map(k => Number(k.split('_')[1]))
                            setWhoRowsByGroup(prev => {
                                const list = prev[selectedGrade] || []
                                const remaining = list.filter(r => !idsToDelete.includes(r.id))
                                return { ...prev, [selectedGrade]: remaining }
                            })
                            setSelectedWho(s => {
                                const out: Record<string, boolean> = {}
                                Object.keys(s).forEach(k => { if (!k.startsWith(selectedGrade + '_')) out[k] = s[k] })
                                return out
                            })
                        }} className="bg-red-600 text-white px-3 py-1 rounded">حذف المحدد - خدام</button>
                        <button onClick={() => { setWhoRowsByGroup(prev => ({ ...prev, [selectedGrade]: [] })); setSelectedWho({}) }} className="bg-red-800 text-white px-3 py-1 rounded mr-2 ">حذف الكل - خدام</button>
                    </div>
                    {/* Mobile: stacked cards for servants */}
                    <div className="sm:hidden space-y-4">
                        {whoFilteredRows.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">لا يوجد أسماء بعد</div>
                        ) : (
                            whoFilteredRows.map((r, idx) => (
                                <div key={r.id} className="bg-white rounded-lg p-4 shadow border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-bold text-lg">{idx + 1}</span>
                                            <span className="ml-2 text-gray-800">{r.name}</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={!!selectedWho[`${selectedGrade}_${r.id}`]}
                                            onChange={() => toggleSelectWho(r.id)}
                                        />
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {r.attendance.map((att, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setWhoRowsByGroup(prev => {
                                                        const list = prev[selectedGrade] || []
                                                        const updated = list.map(rr => rr.id === r.id ? { ...rr, attendance: rr.attendance.map((a, ii) => ii === i ? !a : a) } : rr)
                                                        return { ...prev, [selectedGrade]: updated }
                                                    })
                                                }}
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
                                    <th className="border px-2 py-2"><input type="checkbox" checked={whoAllSelected} onChange={toggleSelectAllWho} /></th>
                                    <th className="border px-2 py-2 sticky left-0 bg-gray-100 z-20">م</th>
                                    <th className="border px-2 py-2 sticky left-12 bg-gray-100 z-20">الاسم</th>
                                    {fridays.map((d, i) => (
                                        <th key={i} className="border px-2 py-2 align-bottom" style={{ height: 120 }}>
                                            <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap' }} className="text-sm">
                                                {d.toLocaleDateString('ar-EG')}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {whoFilteredRows.length === 0 ? (
                                    <tr><td className="border px-3 py-2 text-center" colSpan={3 + fridays.length}>لا يوجد أسماء بعد</td></tr>
                                ) : (
                                    whoFilteredRows.map((r, idx) => (
                                        <tr key={r.id} className={`transition-colors hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            <td className="border px-2 py-2 text-center">
                                                <input type="checkbox" checked={!!selectedWho[`${selectedGrade}_${r.id}`]} onChange={() => toggleSelectWho(r.id)} />
                                            </td>
                                            <td className="border px-2 py-2 text-center sticky left-0 bg-white z-10">{idx + 1}</td>
                                            <td className="border px-2 py-2 sticky left-12 bg-white z-10">{r.name}</td>
                                            {r.attendance.map((att, i) => (
                                                <td key={i} className="border px-2 py-2 text-center">
                                                    <button onClick={() => {
                                                        // toggle attendance for who row
                                                        setWhoRowsByGroup(prev => {
                                                            const list = prev[selectedGrade] || []
                                                            const updated = list.map(rr => rr.id === r.id ? { ...rr, attendance: rr.attendance.map((a, ii) => ii === i ? !a : a) } : rr)
                                                            return { ...prev, [selectedGrade]: updated }
                                                        })
                                                    }} className={`w-6 h-6 inline-block rounded ${att ? 'bg-green-600' : 'bg-white'} border shadow-sm hover:scale-105 transition-transform`} aria-pressed={att} />
                                                </td>
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
