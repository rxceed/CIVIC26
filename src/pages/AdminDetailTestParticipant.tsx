import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminHeader } from '../components/AdminHeader'
import { quizApi } from '../api/quiz.api'
import { submissionApi, type Submission } from '../api/submission.api'
import { userApi, type User } from '../api/user.api'
import type { Quiz } from '../api/quiz.api'

export const AdminDetailTestParticipant = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  
  const [testInfo, setTestInfo] = useState<Quiz | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      try {
        const [quizRes, subRes, userRes] = await Promise.all([
          quizApi.getQuizById(id),
          submissionApi.getSubmissionsByQuizId(id),
          userApi.getUsers(),
        ])
        if (quizRes.success) setTestInfo(quizRes.data)
        if (subRes.success) setSubmissions(subRes.data)
        if (userRes.success) setUsers(userRes.data)
      } catch (error) {
        console.error('Failed to fetch participant data', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Helper to format dates for the table
  const formatTimeOnly = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const handleExportExcel = () => {
    if (submissions.length === 0) {
      alert('Tidak ada data peserta untuk di-export.')
      return
    }

    const exportData = submissions.map((sub) => {
      const user = users.find((u) => u.id === sub.userId)
      const name = user ? user.name : 'Unknown User'
      
      const formatSafeTime = (dateStr: string | null) => {
        if (!dateStr) return '-'
        return formatTimeOnly(dateStr)
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

      const leaveCount = sub.infractions?.length || 0
      const score = sub.isSubmitted && sub.score !== null ? Math.round(sub.score) : 'Proses'

      return {
        'Nama Peserta': name,
        'Waktu Mulai': formatSafeTime(sub.startTime),
        'Waktu Selesai': formatSafeTime(sub.finishTime || sub.submissionTime),
        'Durasi': durationStr,
        'Keluar Halaman': `${leaveCount} kali`,
        'Skor Akhir': score,
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Peserta')
    
    const fileName = testInfo ? `Data_Peserta_${testInfo.name.replace(/\s+/g, '_')}.xlsx` : 'Data_Peserta.xlsx'
    XLSX.writeFile(workbook, fileName)
  }


  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-r from-white via-white via-[70%] to-danger/30 p-4 pt-20 sm:pt-24 md:pt-28 md:p-6 relative flex flex-col font-oxanium pb-20">
      <AdminHeader />

      <div className="flex-grow flex flex-col items-center w-full max-w-5xl mx-auto pt-4 sm:pt-8">
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 animate-in slide-in-from-left duration-500">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/admin/detail-test')}
              className="p-2 bg-white rounded-full shadow-md text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer border-2 border-primary/20 shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h1 className="font-slant text-2xl sm:text-3xl md:text-4xl text-dark uppercase">{testInfo ? testInfo.name : 'DETAIL PESERTA UJIAN'}</h1>
              {testInfo && (
                <p className="text-neutral-500 font-bold text-xs sm:text-sm mt-1">Data Peserta</p>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleExportExcel}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#21A366] text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-md border-2 border-[#107C41] hover:bg-[#107C41] transition-colors cursor-pointer text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Export to Excel
          </button>
        </div>

        <div className="bg-white w-full rounded-3xl shadow-xl p-4 sm:p-6 md:p-10 border-2 border-primary/20 animate-in fade-in zoom-in duration-500">
          
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[650px] text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-200">
                  <th className="py-4 px-4 font-bold text-neutral-500 text-sm uppercase">Nama Peserta</th>
                  <th className="py-4 px-4 font-bold text-neutral-500 text-sm uppercase">Waktu Mulai</th>
                  <th className="py-4 px-4 font-bold text-neutral-500 text-sm uppercase">Waktu Selesai</th>
                  <th className="py-4 px-4 font-bold text-neutral-500 text-sm uppercase">Durasi</th>
                  <th className="py-4 px-4 font-bold text-neutral-500 text-sm uppercase whitespace-nowrap">Keluar Halaman</th>
                  <th className="py-4 px-4 font-bold text-neutral-500 text-sm uppercase text-center">Skor Akhir</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : submissions.map((sub) => {
                  const user = users.find(u => u.id === sub.userId)
                  const name = user ? user.name : 'Unknown User'
                  const leaveCount = sub.infractions?.length || 0
                  
                  // Safe date formatting
                  const formatSafeTime = (dateStr: string | null) => {
                    if (!dateStr) return '-'
                    return formatTimeOnly(dateStr)
                  }
                  
                  // Calculate duration in minutes if both start and finish exist
                  let durationStr = '-'
                  if (sub.startTime && sub.finishTime) {
                    const start = new Date(sub.startTime).getTime()
                    const finish = new Date(sub.finishTime).getTime()
                    const diffMins = Math.round((finish - start) / 60000)
                    durationStr = `${diffMins} mnt`
                  } else if (sub.startTime && sub.submissionTime) {
                    // fallback to submissionTime if finishTime is not strictly set but submitted
                    const start = new Date(sub.startTime).getTime()
                    const finish = new Date(sub.submissionTime).getTime()
                    const diffMins = Math.round((finish - start) / 60000)
                    durationStr = `${diffMins} mnt`
                  }

                  return (
                    <tr key={sub.id} className="border-b-2 border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="py-4 px-4 font-bold text-dark">{name}</td>
                      <td className="py-4 px-4 font-bold text-primary">{formatSafeTime(sub.startTime)}</td>
                      <td className="py-4 px-4 font-bold text-danger">{formatSafeTime(sub.finishTime || sub.submissionTime)}</td>
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-dark mb-2">Belum ada Peserta</h3>
              <p className="text-neutral-500">Belum ada peserta yang mengambil ujian ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
