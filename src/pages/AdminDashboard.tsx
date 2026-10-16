import { useState, useEffect } from 'react'
import { AdminHeader } from '../components/AdminHeader'
import { DigitBox } from '../components/DigitBox'
import { AdminDashboardTable } from '../components/AdminDashboardTable'
import { quizApi } from '../api/quiz.api'
import type { TableItem } from '../components/DashboardTable'

export const AdminDashboard = () => {
  const [time, setTime] = useState(new Date())
  const [tryOuts, setTryOuts] = useState<TableItem[]>([])
  const [tests, setTests] = useState<TableItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await quizApi.getQuizzes()
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
          setTryOuts(items.filter(i => i.type === 'TRYOUT'))
          setTests(items.filter(i => i.type === 'TEST'))
        }
      } catch (error) {
        console.error('Failed to fetch quizzes for admin', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuizzes()

    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleToggleStatus = async (id: string, newIsOpen: boolean) => {
    try {
      const res = await quizApi.updateQuiz(id, { isOpen: newIsOpen })
      if (res.success) {
        setTryOuts(prev => prev.map(item => item.id === id ? { ...item, isOpen: newIsOpen } : item))
        setTests(prev => prev.map(item => item.id === id ? { ...item, isOpen: newIsOpen } : item))
      } else {
        alert('Gagal mengubah status ujian.')
      }
    } catch (error) {
      console.error('Failed to toggle quiz status', error)
      alert('Gagal mengubah status ujian.')
    }
  }

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
    <div className="min-h-screen w-full overflow-y-auto lg:h-screen lg:overflow-hidden bg-gradient-to-r from-white via-white via-[30%] to-primary-100 p-4 pt-20 sm:pt-24 md:pt-28 md:p-6 relative flex flex-col">
      <AdminHeader />

      {/* Dashboard Content Grid */}
      <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col gap-4 md:gap-6 min-h-0">

        {/* Top Section (Greeting & Clock) - 30% height */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:flex-[3] min-h-0">
          {/* Greeting Card */}
          <div className="bg-light border-2 border-primary rounded-3xl p-5 sm:p-6 md:p-8 shadow-md flex flex-col justify-center w-full lg:w-1/2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-slant text-dark">Halo, Admin!</h2>
            <p className="font-oxanium text-neutral-600 text-sm sm:text-base md:text-lg leading-relaxed">
              Selamat datang di Panel Manajemen. Kamu bisa mengawasi atau mengedit Try Out dan Test yang tersedia.
            </p>
          </div>

          {/* Live Clock Section */}
          <div className="flex flex-col justify-center pr-0 sm:pr-4 md:pr-8 py-2 md:py-0 w-full lg:w-1/2 min-h-0">
            <p className="font-oxanium text-dark text-lg sm:text-xl md:text-2xl mb-2 lg:mb-4 shrink-0">{formatDate(time)}</p>
            <div className="flex items-center gap-1 md:gap-3 flex-1 min-h-0 max-h-16 md:max-h-20">
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

        {/* Bottom Section (Tables) - 70% height */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:flex-[7] min-h-0">
          <div className="w-full lg:w-1/2 flex flex-col min-h-[320px] lg:min-h-0">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center bg-light border-2 border-primary rounded-3xl min-h-[300px]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <AdminDashboardTable title="Try Out" type="tryout" data={tryOuts} onToggleStatus={handleToggleStatus} />
            )}
          </div>
          <div className="w-full lg:w-1/2 flex flex-col min-h-[320px] lg:min-h-0">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center bg-light border-2 border-primary rounded-3xl min-h-[300px]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <AdminDashboardTable title="Test" type="test" data={tests} onToggleStatus={handleToggleStatus} />
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
