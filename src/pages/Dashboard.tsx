import { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { DigitBox } from '../components/DigitBox'
import { DashboardTable } from '../components/DashboardTable'
import type { TableItem, TestStatus } from '../components/DashboardTable'
import { quizApi } from '../api/quiz.api'
import { submissionApi } from '../api/submission.api'

export const Dashboard = () => {
  const [time, setTime] = useState(new Date())
  const [tryOuts, setTryOuts] = useState<TableItem[]>([])
  const [tests, setTests] = useState<TableItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, subRes] = await Promise.all([
          quizApi.getQuizzes(),
          submissionApi.getMySubmissions(),
        ])

        if (quizRes.success && subRes.success) {
          const quizzes = quizRes.data
          const submissions = subRes.data

          const tableItems: TableItem[] = quizzes.map((quiz) => {
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
              type: quiz.type,
            }
          })

          setTryOuts(tableItems.filter((t) => t.type === 'TRYOUT'))
          setTests(tableItems.filter((t) => t.type === 'TEST'))
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return { hours, minutes, seconds }
  }

  const formatDate = (date: Date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const { hours, minutes, seconds } = formatTime(time)

  return (
    <div className="min-h-screen w-full lg:h-screen lg:overflow-hidden overflow-y-auto bg-gradient-to-r from-white via-white via-[30%] to-primary-100 p-3 pt-20 sm:p-4 sm:pt-24 md:p-6 md:pt-24 relative flex flex-col pb-8 lg:pb-4">
      <Header showProfile />

      {/* Dashboard Content Grid */}
      <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col gap-4 md:gap-6 min-h-0">

        {/* Top Section (Greeting & Clock) */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:flex-[3] min-h-0">
          {/* Greeting Card */}
          <div className="bg-light border-2 border-primary rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-md flex flex-col justify-center w-full lg:w-1/2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-slant text-dark">Halo, Peserta!</h2>
            <p className="font-oxanium text-neutral-600 text-sm sm:text-base md:text-lg leading-relaxed mt-1 sm:mt-2">
              Kamu masih punya {tryOuts.filter(t => t.status !== 'Sudah Dikerjakan').length} Try Out dan {tests.filter(t => t.status !== 'Sudah Dikerjakan').length} Test yang belum diselesaikan. Jangan sampai kelewatan ya~
            </p>
          </div>

          {/* Live Clock Section */}
          <div className="flex flex-col justify-center pr-0 lg:pr-8 py-2 md:py-0 w-full lg:w-1/2 min-h-0">
            <p className="font-oxanium text-dark text-base sm:text-xl md:text-2xl mb-2 lg:mb-4 shrink-0">{formatDate(time)}</p>
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-1 min-h-0 h-12 sm:h-16 md:h-20">
              <DigitBox digit={hours[0]} />
              <DigitBox digit={hours[1]} />
              <span className="text-primary font-bold text-2xl sm:text-3xl md:text-5xl mx-0.5 sm:mx-1 md:mx-2 flex items-center h-full pb-1">:</span>
              <DigitBox digit={minutes[0]} />
              <DigitBox digit={minutes[1]} />
              <span className="text-primary font-bold text-2xl sm:text-3xl md:text-5xl mx-0.5 sm:mx-1 md:mx-2 flex items-center h-full pb-1">:</span>
              <DigitBox digit={seconds[0]} />
              <DigitBox digit={seconds[1]} />
            </div>
          </div>
        </div>

        {/* Bottom Section (Tables) */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:flex-[7] min-h-0">
          <div className="w-full lg:w-1/2 flex flex-col min-h-[320px] lg:min-h-0">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center bg-light border-2 border-primary rounded-2xl sm:rounded-3xl min-h-[250px]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <DashboardTable title="Try Out" type="tryout" data={tryOuts} />
            )}
          </div>
          <div className="w-full lg:w-1/2 flex flex-col min-h-[320px] lg:min-h-0">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center bg-light border-2 border-primary rounded-2xl sm:rounded-3xl min-h-[250px]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <DashboardTable title="Test" type="test" data={tests} />
            )}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="shrink-0 mt-4 text-center w-full">
        <p className="font-oxanium text-[10px] md:text-xs text-dark font-bold">
          © 2026 CESC 2026. All rights reserved.
        </p>
      </div>
    </div>
  )
}
