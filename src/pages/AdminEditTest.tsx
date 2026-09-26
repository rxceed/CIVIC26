import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AdminHeader } from '../components/AdminHeader'
import { quizApi } from '../api/quiz.api'
import type { Quiz } from '../api/quiz.api'

export const AdminEditTest = () => {
  const navigate = useNavigate()

  const [tests, setTests] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await quizApi.getQuizzes()
        if (res.success) {
          // Filter out PAKET
          setTests(res.data.filter(q => q.type !== 'PAKET'))
        }
      } catch (error) {
        console.error('Failed to fetch tests', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuizzes()
  }, [])

  const handleToggleOpen = async (testId: string, newIsOpen: boolean) => {
    setTogglingId(testId)
    try {
      const res = await quizApi.updateQuiz(testId, { isOpen: newIsOpen })
      if (res.success) {
        setTests(prev => prev.map(t => t.id === testId ? { ...t, isOpen: newIsOpen } : t))
      } else {
        alert('Gagal mengubah status ujian.')
      }
    } catch (error) {
      console.error('Failed to toggle test status', error)
      alert('Gagal mengubah status ujian.')
    } finally {
      setTogglingId(null)
    }
  }

  const formatIndonesianDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day} ${month} ${year} - ${hours}:${minutes}`
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

        <div className="bg-white w-full rounded-3xl shadow-xl p-6 md:p-10 border-2 border-primary/20 animate-in fade-in zoom-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : tests.map((test) => (
              <div key={test.id} className="bg-neutral-50 rounded-2xl p-6 border-2 border-neutral-200 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col h-full group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  {/* Status Indicator */}
                  {test.isOpen ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success/15 text-success border border-success/30">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                      Dibuka
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-200 text-neutral-600 border border-neutral-300">
                      <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
                      Ditutup
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-xl text-dark mb-1">{test.name}</h3>
                
                <div className="flex flex-col gap-1 mb-4 flex-grow text-xs font-bold text-neutral-500">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mulai: {formatIndonesianDate(test.openTime)}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-danger">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-danger">Selesai: {formatIndonesianDate(test.closeTime)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-neutral-200 gap-2">
                  <span className={`text-xs font-bold py-1 px-3 rounded-full bg-neutral-200 text-neutral-500`}>
                    {test.type}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleOpen(test.id, !test.isOpen)}
                      disabled={togglingId === test.id}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 ${
                        test.isOpen
                          ? 'border-danger text-danger hover:bg-danger hover:text-white'
                          : 'border-success text-success hover:bg-success hover:text-white'
                      }`}
                    >
                      {togglingId === test.id ? '...' : test.isOpen ? 'Tutup' : 'Mulai'}
                    </button>

                    <button 
                      onClick={() => navigate(`/admin/edit-test/${test.id}`)}
                      className="text-xs font-bold text-primary hover:text-white hover:bg-primary border-2 border-primary px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Edit
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isLoading && tests.length === 0 && (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-neutral-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-dark mb-2">Belum ada Test / Try Out</h3>
              <p className="text-neutral-500">Silakan tambahkan ujian baru melalui menu Tambah Test / Try Out.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
