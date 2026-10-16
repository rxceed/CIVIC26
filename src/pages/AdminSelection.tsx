import { useNavigate, useLocation } from 'react-router-dom'
import { AdminHeader } from '../components/AdminHeader'
import { useState, useEffect } from 'react'
import { AdminDashboardTable } from '../components/AdminDashboardTable'
import { quizApi } from '../api/quiz.api'
import type { TableItem, TestType } from '../components/DashboardTable'

export const AdminSelection = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const examType: TestType = pathname.includes('tryout') ? 'tryout' : 'test'

  const [tableData, setTableData] = useState<TableItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const isTryOut = examType === 'tryout'
  const title = isTryOut ? 'Try Out' : 'Test'

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const queryType = isTryOut ? 'TRYOUT' : 'TEST'
        const res = await quizApi.getQuizzes(queryType)
        if (res.success) {
          const items: TableItem[] = res.data.map((q) => ({
            id: q.id,
            name: q.name,
            start: q.openTime,
            end: q.closeTime,
            status: 'Belum Dimulai', // Dummy status for admin table
            type: q.type,
            isOpen: q.isOpen,
          }))
          setTableData(items)
        }
      } catch (error) {
        console.error('Failed to fetch quizzes for admin selection', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuizzes()
  }, [isTryOut])

  const handleToggleStatus = async (id: string, newIsOpen: boolean) => {
    try {
      const res = await quizApi.updateQuiz(id, { isOpen: newIsOpen })
      if (res.success) {
        setTableData(prev => prev.map(item => item.id === id ? { ...item, isOpen: newIsOpen } : item))
      } else {
        alert('Gagal mengubah status ujian.')
      }
    } catch (error) {
      console.error('Failed to toggle quiz status', error)
      alert('Gagal mengubah status ujian.')
    }
  }

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-r from-white via-white via-[70%] to-danger/30 p-4 pt-20 sm:pt-24 md:pt-28 md:p-6 relative flex flex-col">
      <AdminHeader />

      <div className="w-full max-w-5xl mx-auto flex-grow flex flex-col gap-4 min-h-0">

        {/* Page heading & back button */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="flex items-center gap-1.5 sm:gap-2 font-oxanium text-xs sm:text-sm text-dark hover:text-primary transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Kembali
          </button>
          <h1 className="font-slant text-2xl sm:text-3xl md:text-4xl text-dark">Daftar {title} (Admin)</h1>
        </div>

        {/* Full table */}
        <div className="flex-grow min-h-[400px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center bg-light border-2 border-primary rounded-3xl min-h-[300px]">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <AdminDashboardTable title={title} type={examType} data={tableData} hideSeeAll={true} onToggleStatus={handleToggleStatus} />
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="shrink-0 mt-4 text-center w-full">
        <p className="font-oxanium text-[10px] md:text-xs text-dark font-bold">
          Ac2026 CIVIC. All rights reserved.
        </p>
      </div>
    </div>
  )
}
