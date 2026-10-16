import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminHeader } from '../components/AdminHeader'
import { quizApi, type Quiz } from '../api/quiz.api'

export const AdminEditPaketSoal = () => {
  const navigate = useNavigate()
  const [pakets, setPakets] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPakets = async () => {
      try {
        const res = await quizApi.getQuizzes()
        if (res.success) {
          setPakets(res.data.filter(q => q.type === 'PAKET'))
        }
      } catch (error) {
        console.error('Failed to fetch pakets', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPakets()
  }, [])

  const handleDeletePaket = async (id: string, name: string) => {
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus paket soal "${name}"? Tindakan ini tidak dapat dibatalkan.`)
    if (!confirmed) return

    setDeletingId(id)
    try {
      const res = await quizApi.deleteQuiz(id)
      if (res.success) {
        setPakets(prev => prev.filter(p => p.id !== id))
      } else {
        alert(res.message || 'Gagal menghapus paket soal.')
      }
    } catch (error) {
      console.error('Failed to delete paket soal', error)
      alert('Gagal menghapus paket soal. Terjadi kesalahan pada server.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-r from-white via-white via-[70%] to-danger/30 p-3 pt-24 sm:p-4 sm:pt-24 md:p-6 md:pt-28 relative flex flex-col font-oxanium pb-16 sm:pb-20">
      <AdminHeader />

      <div className="flex-grow flex flex-col items-center w-full max-w-5xl mx-auto pt-4 sm:pt-6">
        <div className="w-full flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 animate-in slide-in-from-left duration-500">
          <button 
            onClick={() => navigate('/admin/master')}
            className="p-2 bg-white rounded-full shadow-md text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer border-2 border-primary/20 shrink-0"
            title="Kembali ke Menu Master"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="font-slant text-2xl sm:text-3xl md:text-4xl text-dark truncate">EDIT PAKET SOAL</h1>
        </div>

        <div className="bg-white w-full rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border-2 border-primary/20 animate-in fade-in zoom-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {isLoading ? (
              <div className="col-span-full py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : pakets.map((paket) => (
              <div key={paket.id} className="bg-neutral-50 rounded-2xl p-4 sm:p-5 border-2 border-neutral-200 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col h-full group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                
                <h3 className="font-bold text-lg sm:text-xl text-dark mb-1.5 break-words line-clamp-2">{paket.name}</h3>
                <p className="text-neutral-500 text-xs sm:text-sm mb-4 flex-grow break-words line-clamp-3">{paket.description || 'Tidak ada deskripsi'}</p>
                
                <div className="flex items-center justify-between mt-auto pt-3 sm:pt-4 border-t-2 border-neutral-200 gap-2">
                  <span className="text-xs font-bold text-neutral-500 bg-neutral-200/80 py-1 px-2.5 sm:px-3 rounded-full shrink-0">
                    {paket.totalQuestions} Soal
                  </span>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => handleDeletePaket(paket.id, paket.name)}
                      disabled={deletingId === paket.id}
                      className="text-xs font-bold text-danger hover:text-white hover:bg-danger border-2 border-danger/30 hover:border-danger px-2.5 sm:px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Hapus Paket Soal"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                      {deletingId === paket.id ? '...' : 'Hapus'}
                    </button>

                    <button 
                      onClick={() => navigate(`/admin/edit-paket-soal/${paket.id}`)}
                      className="text-xs font-bold text-primary hover:text-white hover:bg-primary border-2 border-primary px-2.5 sm:px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      title="Edit Paket Soal"
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

          {!isLoading && pakets.length === 0 && (
            <div className="w-full py-8 sm:py-12 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-dark mb-1">Belum ada Paket Soal</h3>
              <p className="text-neutral-500 text-xs sm:text-sm">Silakan buat paket soal baru terlebih dahulu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
