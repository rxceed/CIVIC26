import { useNavigate, useLocation } from 'react-router-dom'
import { Header } from '../components/Header'
import { useState, useEffect } from 'react'
import { DashboardTable } from '../components/DashboardTable'
import type { TableItem, TestStatus, TestType } from '../components/DashboardTable'
import { quizApi } from '../api/quiz.api'
import { submissionApi } from '../api/submission.api'

export const Selection = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const examType: TestType = pathname.includes('tryout') ? 'tryout' : 'test'

  const [tableData, setTableData] = useState<TableItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const isTryOut = examType === 'tryout'
  const title = isTryOut ? 'Try Out' : 'Test'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryType = isTryOut ? 'TRYOUT' : 'TEST'
        const [quizRes, subRes] = await Promise.all([
          quizApi.getQuizzes(queryType),
          submissionApi.getMySubmissions(),
        ])

        if (quizRes.success && subRes.success) {
          const quizzes = quizRes.data
          const submissions = subRes.data

          const items: TableItem[] = quizzes.map((quiz) => {
            const sub = submissions.find((s) => s.quizId === quiz.id)
            let status: TestStatus = 'Belum Dikerjakan'
            
            const now = new Date()
            const openDate = new Date(quiz.openTime)
            
            if (now < openDate) {
              status = 'Belum Dimulai'
            } else if (sub) {
              if (sub.isSubmitted) {
                status = 'Sudah Dikerjakan'
              } else {
                status = 'Sedang Dikerjakan'
              }
            }

            return {
              id: quiz.id,
              name: quiz.name,
              start: quiz.openTime,
              end: quiz.closeTime,
              status,
              totalQuestions: quiz.totalQuestions,
            }
          })

          setTableData(items)
        }
      } catch (error) {
        console.error(`Failed to fetch ${title} data`, error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isTryOut, title])

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-r from-white via-white via-[70%] to-danger/30 p-3 pt-20 sm:p-4 sm:pt-24 md:p-6 md:pt-24 relative flex flex-col pb-6">
      <Header showProfile />

      <div className="w-full max-w-5xl mx-auto flex-grow flex flex-col gap-4 min-h-0">

        {/* Page heading & back button */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 sm:gap-2 font-oxanium text-xs sm:text-sm text-dark hover:text-primary transition-colors cursor-pointer shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Kembali
          </button>
          <h1 className="font-slant text-2xl sm:text-3xl md:text-4xl text-dark truncate">Daftar {title}</h1>
        </div>

        {/* Full table */}
        <div className="flex-grow min-h-[350px]">
          {isLoading ? (
            <div className="h-full min-h-[250px] flex items-center justify-center bg-light border-2 border-primary rounded-2xl sm:rounded-3xl">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <DashboardTable title={title} type={examType} data={tableData} hideSeeAll={true} />
          )}
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
