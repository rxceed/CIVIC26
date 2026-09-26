import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminHeader } from '../components/AdminHeader'
import { quizApi } from '../api/quiz.api'

const msToHhMm = (ms?: number | null): string => {
  if (!ms || ms <= 0) return '02:00'
  const totalMinutes = Math.floor(ms / (60 * 1000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const hhMmToMs = (hhMm: string): number => {
  if (!hhMm) return 2 * 60 * 60 * 1000
  const [hoursStr, minutesStr] = hhMm.split(':')
  const hours = parseInt(hoursStr || '0', 10)
  const minutes = parseInt(minutesStr || '0', 10)
  return (hours * 60 + minutes) * 60 * 1000
}

export const AdminEditTestDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [name, setName] = useState('')
  const [type, setType] = useState<'TEST' | 'TRYOUT'>('TEST')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('02:00')
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  
  // Date states
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchTest = async () => {
      if (!id) return;
      try {
        const res = await quizApi.getQuizById(id)
        if (res.success) {
          const test = res.data
          setName(test.name)
          setType(test.type as 'TEST' | 'TRYOUT')
          setDescription(test.description || '')
          setDuration(msToHhMm(test.quizTimeLimitMs))
          setShuffleQuestions(test.shuffleQuestions)
          setIsOpen(test.isOpen ?? false)
          
          if (test.openTime) {
            const openD = new Date(test.openTime)
            setStartDate(openD.toISOString().split('T')[0])
            setStartTime(openD.toTimeString().slice(0, 5))
          }
          if (test.closeTime) {
            const closeD = new Date(test.closeTime)
            setEndDate(closeD.toISOString().split('T')[0])
            setEndTime(closeD.toTimeString().slice(0, 5))
          }
        }
      } catch (error) {
        console.error('Failed to fetch test details', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTest()
  }, [id])

  const handleToggleStatus = async () => {
    if (!id) return
    setIsTogglingStatus(true)
    try {
      const nextIsOpen = !isOpen
      const res = await quizApi.updateQuiz(id, { isOpen: nextIsOpen })
      if (res.success) {
        setIsOpen(nextIsOpen)
      } else {
        alert('Gagal mengubah status ujian.')
      }
    } catch (err) {
      console.error('Failed to toggle quiz status', err)
      alert('Gagal mengubah status ujian.')
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setIsSubmitting(true)
    try {
      const openTime = new Date(`${startDate}T${startTime}:00`).toISOString()
      const closeTime = new Date(`${endDate}T${endTime}:00`).toISOString()

      const quizTimeLimitMs = hhMmToMs(duration)

      const res = await quizApi.updateQuiz(id, {
        name,
        type,
        description,
        openTime,
        closeTime,
        shuffleQuestions,
        isOpen,
        quizTimeLimitMs,
      })

      if (res.success) {
        navigate('/admin/edit-test')
      }
    } catch (error) {
      console.error('Failed to update test', error)
      alert('Gagal menyimpan perubahan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-r from-white via-white via-[70%] to-danger/30 p-4 pt-20 md:p-6 md:pt-24 relative flex flex-col font-oxanium pb-20">
      <AdminHeader />

      <div className="flex-grow flex flex-col items-center w-full max-w-5xl mx-auto pt-8">
        <div className="w-full flex items-center gap-4 mb-8 animate-in slide-in-from-left duration-500">
          <button 
            onClick={() => navigate('/admin/master')}
            className="p-2 bg-white rounded-full shadow-md text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer border-2 border-primary/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="font-slant text-4xl text-dark uppercase">EDIT TEST / TRY OUT</h1>
        </div>

        {isLoading ? (
          <div className="w-full py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          
          {/* Status Ujian Card */}
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border-2 border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in zoom-in duration-500">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-dark">Status Ujian:</h2>
                {isOpen ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success/15 text-success border border-success/30">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    Dibuka (Sedang Berlangsung)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-200 text-neutral-600 border border-neutral-300">
                    <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
                    Ditutup
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500">
                {isOpen 
                  ? 'Ujian saat ini terbuka untuk peserta. Kamu dapat menutupnya secara manual kapan saja.'
                  : 'Ujian saat ini ditutup dan tidak dapat diakses peserta. Kamu dapat memulainya secara manual.'}
              </p>
            </div>

            <button
              type="button"
              disabled={isTogglingStatus}
              onClick={handleToggleStatus}
              className={`px-6 py-3 rounded-xl font-bold text-sm border-2 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 shrink-0 ${
                isOpen
                  ? 'bg-danger text-white border-danger hover:bg-danger/80'
                  : 'bg-success text-white border-success hover:bg-success/80'
              }`}
            >
              {isTogglingStatus ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isOpen ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Tutup Ujian
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Mulai / Buka Ujian
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border-2 border-primary/20 animate-in fade-in zoom-in duration-500">
            <h2 className="text-2xl font-bold text-dark mb-6 border-b-2 border-neutral-100 pb-4">Informasi Dasar</h2>
            
            <div className="space-y-6">
              
              {/* Type Toggle */}
              <div>
                <label className="block text-sm font-bold text-dark mb-2">Jenis Ujian</label>
                <div className="flex p-1 bg-neutral-100 rounded-xl border-2 border-neutral-200 w-full md:w-fit">
                  <button
                    type="button"
                    onClick={() => setType('TEST')}
                    className={`flex-1 md:flex-none md:w-32 py-2 px-4 rounded-lg font-bold text-sm transition-all ${type === 'TEST' ? 'bg-white text-primary shadow-sm border-2 border-primary/20' : 'text-neutral-500 hover:bg-neutral-200 border-2 border-transparent'}`}
                  >
                    Test
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('TRYOUT')}
                    className={`flex-1 md:flex-none md:w-32 py-2 px-4 rounded-lg font-bold text-sm transition-all ${type === 'TRYOUT' ? 'bg-white text-primary shadow-sm border-2 border-primary/20' : 'text-neutral-500 hover:bg-neutral-200 border-2 border-transparent'}`}
                  >
                    Try Out
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-dark mb-1">Nama {type === 'TEST' ? 'Test' : 'Try Out'}</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`Misal: ${type === 'TEST' ? 'Test SKD CPNS 2026 Gelombang 1' : 'Try Out Akbar Nasional 2026'}`}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark"
                  required
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-dark mb-1">Deskripsi</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat mengenai ujian ini..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark min-h-[100px] resize-y"
                  required
                />
              </div>

              {/* Duration Field */}
              <div>
                <label className="block text-sm font-bold text-dark mb-1">Durasi Pengerjaan (hh:mm)</label>
                <input 
                  type="time" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full md:w-48 px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark font-bold"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">Format jam:menit (Default 02:00 = 2 jam)</p>
              </div>

              {/* Acak Soal Toggle */}
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border-2 border-neutral-100">
                <div>
                  <h3 className="text-sm font-bold text-dark">Acak Urutan Soal</h3>
                  <p className="text-xs text-neutral-500 mt-1">Jika diaktifkan, urutan soal akan diacak untuk setiap peserta.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    value="" 
                    className="sr-only peer"
                    checked={shuffleQuestions}
                    onChange={() => setShuffleQuestions(!shuffleQuestions)}
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border-2 border-primary/20 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-dark mb-6 border-b-2 border-neutral-100 pb-4">Waktu Pelaksanaan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Start Time */}
              <div className="space-y-4">
                <h3 className="font-bold text-primary flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Waktu Mulai
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Tanggal</label>
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Jam</label>
                    <input 
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* End Time */}
              <div className="space-y-4">
                <h3 className="font-bold text-danger flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Waktu Selesai
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Tanggal</label>
                    <input 
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Jam</label>
                    <input 
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark"
                      required
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="sticky bottom-6 pt-4 z-10">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-bold text-light py-4 rounded-xl border-2 transition-all shadow-xl cursor-pointer text-lg tracking-wide ${isSubmitting ? 'bg-neutral-300 border-neutral-300 cursor-not-allowed' : 'bg-primary border-primary hover:bg-primary/90'}`}
            >
              {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}
