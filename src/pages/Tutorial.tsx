import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const tutorialQuestions = [
  {
    id: 1,
    text: "Selamat datang di Tutorial! Ini adalah contoh tampilan soal. Untuk menjawab, pilih salah satu opsi di bawah ini. Coba klik opsi A.",
    options: ['Ini opsi A (Klik aku)', 'Ini opsi B', 'Ini opsi C', 'Ini opsi D', 'Ini opsi E'],
  },
  {
    id: 2,
    text: "Di sisi kanan, kamu bisa melihat navigasi soal. Nomor soal yang sudah dijawab akan berwarna biru.",
    options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D', 'Pilihan E'],
  },
  {
    id: 3,
    text: "Kamu juga bisa melompat ke soal mana pun dengan mengeklik nomor di panel kanan atau tombol navigasi di bawah. Jika sudah paham, pilih salah satu opsi dan klik 'Selesaikan Tutorial'.",
    options: ['Saya Paham', 'Jelas', 'Sangat Jelas', 'Mengerti', 'Siap Ujian'],
  }
]

export const Tutorial = () => {
  const { type, id } = useParams<{ type: string; id: string }>()
  const navigate = useNavigate()

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isNavOpen, setIsNavOpen] = useState(false)

  const total = tutorialQuestions.length
  const q = tutorialQuestions[currentIdx]

  const handleSelect = (optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }))
  }

  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === total

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col font-oxanium text-dark relative">

      {/* Header Bar */}
      <div className="h-16 shrink-0 border-b border-primary/20 flex items-center justify-between px-3 sm:px-6 bg-light shadow-sm z-10 gap-2">
        <h1 className="font-slant text-lg sm:text-2xl text-primary truncate">TUTORIAL UJIAN</h1>
        
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={() => setIsNavOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-primary/40 text-primary text-xs font-bold hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <span>{currentIdx + 1}/{total}</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <span className="text-xs sm:text-sm text-neutral-400 hidden sm:inline">Sisa Waktu</span>
            <span className="font-slant text-lg sm:text-2xl text-dark">--:--:--</span>
          </div>
        </div>
      </div>

      {/* Main Test Layout */}
      <div className="flex-grow flex min-h-0 relative overflow-hidden">

        {/* Center: Question Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-primary/5 transition-all duration-500">
          <div className="flex-grow p-4 sm:p-6 md:p-12 overflow-y-auto">

            {/* Tutorial Banner */}
            <div className="mb-4 sm:mb-6 bg-warning/20 border-2 border-warning text-warning-800 p-3 sm:p-4 rounded-xl flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5 text-warning">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              <div>
                <h3 className="font-bold mb-0.5 sm:mb-1">Ini hanya Tutorial</h3>
                <p className="opacity-90">Jawabanmu di sini tidak akan disimpan atau dinilai. Ikuti petunjuk di setiap soal untuk berlatih menggunakan sistem CBT ini.</p>
              </div>
            </div>

            <div className="mb-6 sm:mb-8">
              <span className="inline-block bg-primary text-light font-bold text-xs sm:text-sm px-3 py-1 rounded-lg mb-3 sm:mb-4">
                Soal No. {currentIdx + 1}
              </span>
              <p className="text-base sm:text-lg md:text-xl leading-relaxed font-medium">
                {q.text}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:gap-3">
              {q.options.map((opt, i) => {
                const isSelected = answers[currentIdx] === i
                const letter = String.fromCharCode(65 + i)

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${isSelected
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-primary/50 hover:bg-primary/5'
                      }`}
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border-2 font-bold text-xs sm:text-sm ${isSelected
                      ? 'bg-primary border-primary text-white'
                      : 'border-neutral-300 text-neutral-500'
                      }`}>
                      {letter}
                    </div>
                    <span className="text-sm sm:text-base">{opt}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bottom Bar: Navigation */}
          <div className="shrink-0 bg-white border-t border-primary/20 p-3 sm:p-4 md:px-8 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] gap-2">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-dark border-2 border-neutral-200 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer text-xs sm:text-sm w-auto sm:w-[140px]"
            >
              Kembali
            </button>

            <button
              onClick={() => navigate(`/pre-test/${type}/${id}`)}
              className={`lg:hidden px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold border-2 transition-all cursor-pointer text-xs sm:text-sm ${allAnswered
                ? 'bg-danger border-danger text-light hover:bg-danger/80'
                : 'bg-white border-danger text-danger hover:bg-danger/10'
                }`}
            >
              Selesaikan
            </button>

            <button
              onClick={() => setCurrentIdx(prev => Math.min(total - 1, prev + 1))}
              disabled={currentIdx === total - 1}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-light bg-primary border-2 border-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer text-xs sm:text-sm w-auto sm:w-[140px]"
            >
              Selanjutnya
            </button>
          </div>
        </div>

        {/* Right Side: Navigation Grid (25%) */}
        <div className="w-80 shrink-0 border-l border-primary/20 bg-light flex flex-col hidden lg:flex transition-all duration-500">

          <div className="p-6 shrink-0 border-b border-primary/10">
            <h3 className="font-bold text-lg mb-2">Navigasi Soal</h3>
            <div className="flex gap-4 text-xs text-neutral-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-primary rounded-sm" /> Dijawab
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 border border-neutral-300 rounded-sm" /> Belum
              </div>
            </div>
          </div>

          <div className="flex-grow p-6 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {tutorialQuestions.map((_, i) => {
                const isAnswered = answers[i] !== undefined
                const isCurrent = currentIdx === i

                let style = "bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-50"
                if (isAnswered) {
                  style = "bg-primary border-primary text-white"
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`aspect-square rounded-lg border flex items-center justify-center font-bold text-sm transition-all cursor-pointer relative ${style} ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-6 shrink-0 border-t border-primary/20 bg-white">
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-neutral-500">Terjawab</span>
              <span className="font-bold"><span className="text-primary">{answeredCount}</span> / {total}</span>
            </div>

            <button
              onClick={() => navigate(`/pre-test/${type}/${id}`)}
              className={`w-full py-3 rounded-xl font-bold border-2 transition-all cursor-pointer shadow-sm ${allAnswered
                ? 'bg-danger border-danger text-light hover:bg-danger/80'
                : 'bg-white border-danger text-danger hover:bg-danger/10'
                }`}
            >
              Selesaikan Tutorial
            </button>
            {!allAnswered && (
              <p className="text-[10px] text-center text-neutral-400 mt-2">
                Jawab semua soal tutorial untuk melanjutkan.
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Question Navigation Drawer */}
      {isNavOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-dark/40 backdrop-blur-sm p-0 sm:p-4 lg:hidden">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-200">
              <h3 className="font-bold text-lg text-dark">Navigasi Soal Tutorial</h3>
              <button
                onClick={() => setIsNavOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-4 text-xs text-neutral-500 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-primary rounded-sm" /> Dijawab ({answeredCount})
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 border border-neutral-300 rounded-sm" /> Belum ({total - answeredCount})
              </div>
            </div>

            <div className="overflow-y-auto flex-grow my-2">
              <div className="grid grid-cols-5 gap-2">
                {tutorialQuestions.map((_, i) => {
                  const isAnswered = answers[i] !== undefined
                  const isCurrent = currentIdx === i

                  let style = "bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-50"
                  if (isAnswered) {
                    style = "bg-primary border-primary text-white"
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentIdx(i)
                        setIsNavOpen(false)
                      }}
                      className={`aspect-square rounded-lg border flex items-center justify-center font-bold text-sm transition-all cursor-pointer ${style} ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-neutral-200">
              <button
                onClick={() => {
                  setIsNavOpen(false)
                  navigate(`/pre-test/${type}/${id}`)
                }}
                className={`w-full py-3 rounded-xl font-bold border-2 transition-all cursor-pointer text-sm shadow-sm ${allAnswered
                  ? 'bg-danger border-danger text-light hover:bg-danger/80'
                  : 'bg-white border-danger text-danger hover:bg-danger/10'
                  }`}
              >
                Selesaikan Tutorial
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
