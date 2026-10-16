import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { quizApi } from '../api/quiz.api'
import type { Quiz } from '../api/quiz.api'
import type { TestType } from '../components/DashboardTable'

export const PreTutorial = () => {
  const { type, id } = useParams<{ type: string; id: string }>()
  const navigate = useNavigate()
  const examType = type as TestType
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        if (!id) return
        const res = await quizApi.getQuizById(id)
        if (res.success) {
          setQuiz(res.data)
        }
      } catch (error) {
        console.error('Failed to fetch quiz', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuiz()
  }, [id])

  const [isChecked, setIsChecked] = useState(false)

  if (isLoading) {
    return <div className="p-8 text-center font-oxanium">Loading...</div>
  }

  if (!quiz) {
    return <div className="p-8 text-center font-oxanium">Exam not found.</div>
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-3 sm:p-6 py-6 sm:py-8 font-oxanium text-dark">
      <div className="bg-light w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Header Section */}
        <div className="bg-primary p-5 sm:p-8 text-light">
          <h1 className="font-slant text-2xl sm:text-3xl mb-1 sm:mb-2">TATA TERTIB CBT</h1>
          <p className="opacity-90 font-medium text-xs sm:text-sm md:text-base">Mohon baca peraturan berikut dengan teliti sebelum memulai ujian.</p>
        </div>

        {/* Content Section */}
        <div className="p-5 sm:p-8 md:p-10 flex flex-col gap-6 sm:gap-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* DOs */}
            <div>
              <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Yang Harus Dilakukan
              </h3>
              <ul className="space-y-3 text-neutral-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span> Pastikan koneksi internet stabil.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span> Siapkan alat tulis untuk coretan jika diperlukan.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span> Perhatikan sisa waktu yang tersedia di pojok kanan atas.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span> Jawab semua soal sebelum waktu habis.
                </li>
              </ul>
            </div>

            {/* DONTs */}
            <div>
              <h3 className="font-bold text-lg text-danger mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Larangan Keras
              </h3>
              <ul className="space-y-3 text-neutral-600">
                <li className="flex items-start gap-2">
                  <span className="text-danger mt-1">•</span> Dilarang menggunakan kalkulator.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger mt-1">•</span> Dilarang meminta bantuan orang lain.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger mt-1">•</span> Dilarang merekam atau memotret layar ujian.
                </li>
              </ul>
            </div>
          </div>

          {/* Tracking Warning */}
          <div className="bg-danger/10 border-2 border-danger rounded-xl p-5 flex gap-4">
            <div className="shrink-0 text-danger mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-danger text-lg mb-1">Peringatan Sistem</h4>
              <p className="text-danger-700 text-sm md:text-base leading-relaxed">
                Sistem CBT dilengkapi dengan fitur pelacakan aktivitas. <b>Meninggalkan halaman ujian, membuka tab baru, atau meminimalkan browser akan dicatat oleh sistem sebagai pelanggaran.</b> Segala bentuk kecurangan dapat membatalkan hasil ujian.
              </p>
            </div>
          </div>

          {/* Agreement & Action */}
          <div className="mt-4 border-t border-neutral-200 pt-8">
            <label className="flex items-center gap-3 cursor-pointer group mb-6 w-fit">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-6 h-6 border-2 border-neutral-300 rounded-md checked:bg-primary checked:border-primary transition-all cursor-pointer"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="font-medium text-neutral-700 group-hover:text-dark transition-colors select-none">
                Saya mengerti dan menyetujui seluruh tata tertib ujian di atas.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 font-bold text-dark bg-white border-2 border-neutral-200 py-3 rounded-xl hover:bg-neutral-100 transition-all cursor-pointer"
              >
                Kembali
              </button>
              <button
                onClick={() => navigate(`/tutorial/${examType}/${id}`)}
                disabled={!isChecked}
                className="flex-[2] font-bold text-light bg-primary border-2 border-primary py-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:bg-neutral-400 disabled:border-neutral-400 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
              >
                Mulai Tutorial CBT
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
