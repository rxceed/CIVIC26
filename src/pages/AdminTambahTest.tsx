import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminHeader } from '../components/AdminHeader'
import { quizApi } from '../api/quiz.api'
import type { Quiz } from '../api/quiz.api'

export const AdminTambahTest = () => {
  const navigate = useNavigate()
  
  const [name, setName] = useState('')
  const [type, setType] = useState<'TEST' | 'TRYOUT'>('TEST')
  const [description, setDescription] = useState('')
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  
  // Date states
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  
  // Paket Soal Selection states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPaketId, setSelectedPaketId] = useState<string | null>(null)
  
  const [paketList, setPaketList] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchPakets = async () => {
      try {
        const res = await quizApi.getQuizzes('PAKET')
        if (res.success) {
          setPaketList(res.data)
        }
      } catch (error) {
        console.error('Failed to fetch paket soal', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPakets()
  }, [])

  const filteredPaketSoal = paketList.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPaketId) return

    setIsSubmitting(true)
    try {
      const openTime = new Date(`${startDate}T${startTime}:00`).toISOString()
      const closeTime = new Date(`${endDate}T${endTime}:00`).toISOString()

      // The selected paket tells us the total questions
      const selectedPaket = paketList.find(p => p.id === selectedPaketId)
      const totalQuestions = selectedPaket?.totalQuestions || 0

      const res = await quizApi.createQuiz({
        name,
        type,
        description,
        openTime,
        closeTime,
        totalQuestions,
        sourcePaketId: selectedPaketId,
        shuffleQuestions,
      })

      if (res.success) {
        navigate('/admin-dashboard')
      }
    } catch (error) {
      console.error('Failed to create test', error)
      alert('Gagal membuat test.')
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
          <h1 className="font-slant text-4xl text-dark uppercase">TAMBAH TEST / TRY OUT</h1>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          
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

          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border-2 border-primary/20 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-dark mb-6 border-b-2 border-neutral-100 pb-4">Pilih Paket Soal</h2>
            
            <div className="space-y-6">
              
              {/* Search Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-neutral-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau deskripsi paket soal..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark"
                />
              </div>

              {/* List of Paket Soal */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                  <div className="col-span-full py-8 flex justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredPaketSoal.map((paket) => (
                  <div 
                    key={paket.id}
                    onClick={() => setSelectedPaketId(paket.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col ${selectedPaketId === paket.id ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-primary/40 hover:bg-neutral-50'}`}
                  >
                    {selectedPaketId === paket.id && (
                      <div className="absolute top-4 right-4 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    <h4 className="font-bold text-dark mb-1 pr-8">{paket.name}</h4>
                    <p className="text-xs text-neutral-500 mb-3 flex-grow">{paket.description || 'Tidak ada deskripsi.'}</p>
                    <span className="text-xs font-bold text-primary bg-primary/10 py-1 px-3 rounded-lg w-fit">
                      {paket.totalQuestions} Soal
                    </span>
                  </div>
                ))}

                {!isLoading && filteredPaketSoal.length === 0 && (
                  <div className="col-span-full py-8 text-center text-neutral-500">
                    Tidak ditemukan paket soal yang cocok dengan pencarian.
                  </div>
                )}
              </div>
              
              {!selectedPaketId && (
                <p className="text-sm font-bold text-danger">Anda wajib memilih satu paket soal.</p>
              )}
            </div>
          </div>

          <div className="sticky bottom-6 pt-4 z-10">
            <button 
              type="submit"
              disabled={!selectedPaketId || isSubmitting}
              className={`w-full font-bold text-light py-4 rounded-xl border-2 transition-all shadow-xl cursor-pointer text-lg tracking-wide ${(!selectedPaketId || isSubmitting) ? 'bg-neutral-300 border-neutral-300 cursor-not-allowed' : 'bg-primary border-primary hover:bg-primary/90'}`}
            >
              {isSubmitting ? 'MENYIMPAN...' : `TAMBAHKAN ${type === 'TEST' ? 'TEST' : 'TRY OUT'}`}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
