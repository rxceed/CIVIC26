import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { quizApi } from '../api/quiz.api'
import type { Quiz } from '../api/quiz.api'
import type { TestType } from '../components/DashboardTable'

export const PreTest = () => {
  const { type, id } = useParams<{ type: string; id: string }>()
  const navigate = useNavigate()
  const examType = type as TestType
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timerLabel, setTimerLabel] = useState('Sisa Waktu')
  const [timeLeft, setTimeLeft] = useState('')
  const [isTestOpen, setIsTestOpen] = useState(false)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        if (!id) return
        const res = await quizApi.getQuizById(id)
        if (res.success) {
          setQuiz(res.data)
        }
      } catch (error) {
        console.error('Failed to fetch quiz details', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuiz()
  }, [id])

  useEffect(() => {
    if (!quiz) return
    const tick = () => {
      const now = new Date().getTime()
      const openDate = new Date(quiz.openTime).getTime()
      const closeDate = new Date(quiz.closeTime).getTime()

      let diff = 0
      let isOpen = false
      if (now < openDate) {
        setTimerLabel('Sisa Waktu Mulai Ujian')
        diff = openDate - now
      } else if (now < closeDate) {
        setTimerLabel('Sisa Waktu Pengerjaan Ujian')
        diff = closeDate - now
        isOpen = true
      } else {
        setTimerLabel('Waktu Habis')
        setTimeLeft('00:00:00')
        setIsTestOpen(false)
        return
      }

      const effectiveIsOpen = quiz.isOpen !== undefined ? quiz.isOpen : isOpen
      setIsTestOpen(effectiveIsOpen)

      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [quiz])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center font-oxanium text-dark">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="h-screen flex items-center justify-center font-oxanium text-dark">
        <p>Ujian tidak ditemukan.</p>
      </div>
    )
  }

  const title = quiz.type === 'TRYOUT' ? 'Try Out' : 'Test'
  
  const formatIndonesianDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}\n${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const openMs = new Date(quiz.openTime).getTime()
  const closeMs = new Date(quiz.closeTime).getTime()
  const windowDurationMs = closeMs - openMs
  const limitMs = quiz.quizTimeLimitMs && quiz.quizTimeLimitMs > 0 ? quiz.quizTimeLimitMs : 2 * 60 * 60 * 1000
  const effectiveMs = windowDurationMs > 0 ? Math.min(limitMs, windowDurationMs) : limitMs
  const durationMinutes = Math.round(effectiveMs / 60000)

  return (
    <div className="min-h-screen w-full lg:h-screen lg:overflow-hidden overflow-y-auto bg-gradient-to-r from-white via-white via-[70%] to-danger/30 p-3 pt-20 sm:p-4 sm:pt-24 md:p-6 md:pt-24 relative flex flex-col pb-6">
      <Header showProfile />

      <div className="w-full max-w-5xl mx-auto flex-grow flex flex-col gap-4 min-h-0">

        {/* Back button & title */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={() => navigate(`/${examType}`)}
            className="flex items-center gap-1.5 sm:gap-2 font-oxanium text-xs sm:text-sm text-dark hover:text-primary transition-colors cursor-pointer shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Kembali
          </button>
          <h1 className="font-slant text-2xl sm:text-3xl md:text-4xl text-dark truncate">{quiz.name}</h1>
        </div>

        {/* Main two-column card area */}
        <div className="flex-grow flex flex-col lg:flex-row gap-4 md:gap-6 min-h-0">

          {/* Left: Info */}
          <div className="bg-light border-2 border-primary rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-md flex flex-col w-full lg:w-1/2 overflow-y-auto justify-center">
            <h2 className="font-slant text-xl sm:text-2xl md:text-3xl text-dark mb-4 sm:mb-6 text-center">Informasi Ujian</h2>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-primary/5 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <p className="font-oxanium text-xs text-neutral-400 mb-1">Jenis</p>
                <p className="font-oxanium font-bold text-dark text-base sm:text-lg">{title}</p>
              </div>
              <div className="bg-primary/5 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <p className="font-oxanium text-xs text-neutral-400 mb-1">Total Soal</p>
                <p className="font-oxanium font-bold text-dark text-base sm:text-lg">{quiz.totalQuestions ?? '-'} soal</p>
              </div>
              <div className="bg-primary/5 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <p className="font-oxanium text-xs text-neutral-400 mb-1">Durasi</p>
                <p className="font-oxanium font-bold text-dark text-base sm:text-lg">{durationMinutes > 0 ? durationMinutes : '-'} menit</p>
              </div>
              <div className="bg-primary/5 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <p className="font-oxanium text-xs text-neutral-400 mb-1">Waktu Mulai</p>
                <p className="font-oxanium font-bold text-dark text-xs sm:text-sm">{formatIndonesianDate(quiz.openTime).replace('\n', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Right: Countdown & CTA */}
          <div className="bg-light border-2 border-primary rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-md flex flex-col items-center justify-center w-full lg:w-1/2 gap-4 sm:gap-6">
            <div className="text-center">
              <p className="font-oxanium text-neutral-400 text-xs sm:text-sm mb-1 sm:mb-2">{timerLabel}</p>
              <p className="font-slant text-4xl sm:text-5xl md:text-6xl text-danger tracking-widest">
                {timeLeft || '--:--:--'}
              </p>
            </div>

            <div className="w-full border-t border-primary/20 pt-6 flex flex-col gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full font-oxanium text-base font-bold text-dark py-3 rounded-xl border-2 border-primary hover:bg-primary/10 transition-all cursor-pointer"
              >
                Kembali ke Dashboard
              </button>
              <button
                onClick={() => navigate(`/test-session/${examType}/${id}`)}
                disabled={!isTestOpen}
                className={`w-full font-oxanium text-base font-bold py-3 rounded-xl border-2 transition-all shadow-md cursor-pointer ${
                  isTestOpen 
                    ? 'text-light bg-danger border-danger hover:bg-danger/80' 
                    : 'text-neutral-400 bg-neutral-200 border-neutral-300 cursor-not-allowed'
                }`}
              >
                Mulai Ujian
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 mt-4 text-center w-full">
        <p className="font-oxanium text-[10px] md:text-xs text-dark font-bold">
          ©2026 CIVIC. All rights reserved.
        </p>
      </div>
    </div>
  )
}
