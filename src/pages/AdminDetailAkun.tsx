import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminHeader } from '../components/AdminHeader'
import { userApi, type User } from '../api/user.api'
import { submissionApi, type Submission } from '../api/submission.api'
import { quizApi, type Quiz } from '../api/quiz.api'
import { questionApi, type Question } from '../api/question.api'

export const AdminDetailAkun = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [selectedHistoryDetail, setSelectedHistoryDetail] = useState<any | null>(null)
  
  const [account, setAccount] = useState<User | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [selectedQuizQuestions, setSelectedQuizQuestions] = useState<Question[]>([])
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false)

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedHistoryDetail) {
        setSelectedQuizQuestions([])
        return
      }
      setIsLoadingAnswers(true)
      try {
        const res = await questionApi.getQuestionsByQuizId(selectedHistoryDetail.quizId)
        if (res.success) {
          setSelectedQuizQuestions(res.data)
        }
      } catch (error) {
        console.error('Failed to fetch questions', error)
      } finally {
        setIsLoadingAnswers(false)
      }
    }
    fetchQuestions()
  }, [selectedHistoryDetail])

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      try {
        const [userRes, subRes, quizRes] = await Promise.all([
          userApi.getUsers(),
          submissionApi.getSubmissionsByUserId(id),
          quizApi.getQuizzes()
        ])
        if (userRes.success) {
          const user = userRes.data.find(u => u.id === id) || null
          setAccount(user)
        }
        if (subRes.success) setSubmissions(subRes.data)
        if (quizRes.success) setQuizzes(quizRes.data)
      } catch (error) {
        console.error('Failed to fetch data', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Helper to format dates for the table
  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const HH = String(d.getHours()).padStart(2, '0')
    const MM = String(d.getMinutes()).padStart(2, '0')
    return `${dd}/${mm}/${yyyy} ${HH}:${MM}`
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-r from-white via-white via-[70%] to-danger/30 p-4 pt-20 sm:pt-24 md:pt-28 md:p-6 relative flex flex-col font-oxanium pb-20">
      <AdminHeader />

      <div className="flex-grow flex flex-col items-center w-full max-w-5xl mx-auto pt-4 sm:pt-8">
        <div className="w-full flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 animate-in slide-in-from-left duration-500">
          <button 
            onClick={() => navigate('/admin/list-akun')}
            className="p-2 bg-white rounded-full shadow-md text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer border-2 border-primary/20 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className="font-slant text-2xl sm:text-3xl md:text-4xl text-dark uppercase">
              {account ? `@${account.username}` : 'DETAIL HISTORY AKUN'}
            </h1>
            {account && (
              <p className="text-neutral-500 font-bold text-xs sm:text-sm mt-1">{account.name || 'Tanpa Nama'}</p>
            )}
          </div>
        </div>

        <div className="bg-white w-full rounded-3xl shadow-xl p-4 sm:p-6 md:p-10 border-2 border-primary/20 animate-in fade-in zoom-in duration-500">
          
          <h2 className="text-xl sm:text-2xl font-bold text-dark mb-4 sm:mb-6 border-b-2 border-neutral-100 pb-3 sm:pb-4">History Ujian</h2>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-200">
                  <th className="py-4 px-4 font-bold text-neutral-500 text-sm uppercase">Nama Test / Try Out</th>
                  <th className="py-4 px-4 font-bold text-neutral-500 text-sm uppercase">Waktu Mulai</th>
                  <th className="py-4 px-4 font-bold text-neutral-500 text-sm uppercase">Waktu Selesai</th>
                  <th className="py-4 px-4 font-bold text-neutral-500 text-sm uppercase">Durasi</th>
                  <th className="py-4 px-4 font-bold text-neutral-500 text-sm uppercase whitespace-nowrap">Keluar Halaman</th>
                  <th className="py-4 px-4 font-bold text-neutral-500 text-sm uppercase text-center">Skor Akhir</th>
                  <th className="py-4 px-4 font-bold text-neutral-500 text-sm uppercase text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : submissions.map((sub) => {
                  const quiz = quizzes.find(q => q.id === sub.quizId)
                  const testName = quiz ? quiz.name : 'Unknown Quiz'
                  const leaveCount = sub.infractions?.length || 0

                  const formatSafeTime = (dateStr: string | null) => {
                    if (!dateStr) return '-'
                    return formatDateTime(dateStr)
                  }

                  let durationStr = '-'
                  if (sub.startTime && sub.finishTime) {
                    const start = new Date(sub.startTime).getTime()
                    const finish = new Date(sub.finishTime).getTime()
                    const diffMins = Math.round((finish - start) / 60000)
                    durationStr = `${diffMins} mnt`
                  } else if (sub.startTime && sub.submissionTime) {
                    const start = new Date(sub.startTime).getTime()
                    const finish = new Date(sub.submissionTime).getTime()
                    const diffMins = Math.round((finish - start) / 60000)
                    durationStr = `${diffMins} mnt`
                  }

                  return (
                    <tr key={sub.id} className="border-b-2 border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="py-4 px-4 font-bold text-dark">{testName}</td>
                      <td className="py-4 px-4 font-bold text-primary text-sm max-w-[150px]">{formatSafeTime(sub.startTime)}</td>
                      <td className="py-4 px-4 font-bold text-danger text-sm max-w-[150px]">{formatSafeTime(sub.finishTime || sub.submissionTime)}</td>
                      <td className="py-4 px-4 font-bold text-neutral-600">{durationStr}</td>
                      <td className="py-4 px-4">
                        <span className={`font-bold px-3 py-1 rounded-full text-xs ${leaveCount > 0 ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
                          {leaveCount} kali
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {sub.isSubmitted && sub.score !== null ? (
                          <span className="font-bold text-lg text-dark">{Math.round(sub.score)}</span>
                        ) : (
                          <span className="font-bold text-xs text-warning bg-warning/10 px-3 py-1 rounded-full">Proses</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button 
                          onClick={() => setSelectedHistoryDetail({ ...sub, testName, leaveCount })}
                          className="bg-primary/10 text-primary hover:bg-primary hover:text-white p-2 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center group"
                          title="Lihat Detail"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {!isLoading && submissions.length === 0 && (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-neutral-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-dark mb-2">Belum ada History</h3>
              <p className="text-neutral-500">Akun ini belum pernah mengerjakan ujian apapun.</p>
            </div>
          )}

          {!account && !isLoading && (
            <div className="w-full py-12 text-center text-danger font-bold">
              Akun tidak ditemukan.
            </div>
          )}
        </div>
      </div>

      {/* Answer Detail Modal */}
      {selectedHistoryDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-dark/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
            
            <div className="p-4 sm:p-6 border-b-2 border-neutral-100 flex justify-between items-center bg-neutral-50">
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-dark">Detail Jawaban</h3>
                <p className="text-xs font-bold text-neutral-500 mt-0.5 sm:mt-1">{selectedHistoryDetail.testName}</p>
              </div>
              <button 
                onClick={() => setSelectedHistoryDetail(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-200 text-neutral-600 hover:bg-danger hover:text-white transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-grow bg-white">
              {isLoadingAnswers ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedQuizQuestions.length > 0 ? selectedQuizQuestions.map((q, idx) => {
                    const ansRecord = selectedHistoryDetail.answers?.find((a: any) => a.id === q.id)
                    const picked = ansRecord ? ansRecord.answer.toUpperCase() : '-'
                    
                    return (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-xl border-2 border-neutral-100 hover:border-primary/30 transition-colors">
                        <span className="font-bold text-sm text-neutral-600">Soal {idx + 1}</span>
                        <span className={`font-bold text-lg w-8 h-8 flex items-center justify-center rounded-lg ${picked === '-' ? 'bg-neutral-100 text-neutral-400' : 'bg-primary/10 text-primary'}`}>
                          {picked}
                        </span>
                      </div>
                    )
                  }) : (
                    <div className="text-center text-neutral-500 py-4 font-bold text-sm">
                      Tidak ada soal untuk ujian ini.
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t-2 border-neutral-100 bg-neutral-50 text-center">
              <p className="text-xs font-bold text-neutral-400">Menampilkan rekaman jawaban terakhir peserta.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
