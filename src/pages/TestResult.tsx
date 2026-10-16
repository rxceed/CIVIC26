import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'

export const TestResult = () => {
  const navigate = useNavigate()
  // We no longer fetch or display the score to participants per the latest requirement.
  return (
    <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-br from-white to-primary/10 flex flex-col font-oxanium text-dark p-4 pt-20 sm:p-6 sm:pt-24 pb-8">
      <Header showProfile />

      <div className="flex-grow flex items-center justify-center my-auto">
        <div className="bg-white max-w-lg w-full rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-10 md:p-14 flex flex-col items-center text-center border-2 border-primary/20 animate-in fade-in zoom-in duration-500">
          
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-success/10 text-success rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 sm:w-12 sm:h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="font-slant text-3xl sm:text-4xl text-dark mb-2 sm:mb-4">UJIAN SELESAI</h1>
          
          <p className="text-neutral-500 text-sm sm:text-base mb-6 leading-relaxed">
            Terima kasih telah berpartisipasi. Jawaban kamu telah berhasil disimpan di dalam sistem kami.
          </p>

          <div className="mb-8 w-full" />
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full font-bold text-light bg-primary py-3.5 rounded-xl border-2 border-primary hover:bg-primary/90 transition-all shadow-md cursor-pointer"
          >
            Kembali ke Dashboard
          </button>

        </div>
      </div>
    </div>
  )
}
