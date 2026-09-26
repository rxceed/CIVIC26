import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TableItem, TestType } from './DashboardTable'

interface AdminDashboardTableProps {
  title: string;
  type: TestType;
  data: TableItem[];
  compact?: boolean;
  hideSeeAll?: boolean;
  onToggleStatus?: (id: string, newIsOpen: boolean) => Promise<void> | void;
}

const parseIndonesianDate = (dateStr: string) => {
  return new Date(dateStr).getTime()
}

const formatIndonesianDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${day} ${month} ${year}\n${hours}:${minutes}`
}

export const AdminDashboardTable = ({ 
  title, 
  type, 
  data, 
  compact = false, 
  hideSeeAll = false,
  onToggleStatus
}: AdminDashboardTableProps) => {
  const navigate = useNavigate()
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Sort by date newest to oldest
  const sortedData = [...data].sort((a, b) => {
    return parseIndonesianDate(b.start) - parseIndonesianDate(a.start)
  })

  const handleToggle = async (id: string, currentIsOpen: boolean) => {
    if (!onToggleStatus) return
    setTogglingId(id)
    try {
      await onToggleStatus(id, !currentIsOpen)
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="bg-light border-2 border-primary rounded-3xl p-5 md:p-6 shadow-md flex flex-col min-h-0 h-full">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h3 className="text-3xl md:text-4xl font-slant text-dark">{title}</h3>
        {!hideSeeAll && (
          <button
            onClick={() => navigate(`/admin/${type}`)}
            className="font-oxanium text-xs md:text-sm font-bold text-primary border-2 border-primary rounded-xl px-4 py-1.5 md:px-5 md:py-2 hover:bg-primary hover:text-light transition-all shadow-sm cursor-pointer"
          >
            Lihat Semua
          </button>
        )}
      </div>

      <div className="overflow-y-auto overflow-x-hidden flex-grow rounded-lg">
        <table className="w-full table-fixed text-left font-oxanium text-sm md:text-base border-collapse text-black">
          <thead className="sticky top-0 bg-light z-10">
            <tr className="text-dark text-xs md:text-sm">
              <th className="pb-3 px-2 md:px-3 font-normal w-[26%]">{title}</th>
              <th className="pb-3 px-2 md:px-3 font-normal text-center w-[18%]">Status</th>
              <th className="pb-3 px-2 md:px-3 font-normal text-center w-[20%]">Waktu Mulai</th>
              {!compact && <th className="pb-3 px-2 md:px-3 font-normal text-center w-[20%]">Waktu Berakhir</th>}
              <th className="pb-3 px-2 md:px-3 font-normal text-right w-[16%]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, i) => (
              <tr key={item.id} className={`border-t border-primary/20 ${i % 2 === 0 ? 'bg-primary/5' : 'bg-transparent'}`}>
                <td className="py-3 px-2 md:px-3 truncate font-medium">{item.name}</td>
                <td className="py-3 px-2 md:px-3 text-center">
                  {item.isOpen ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-success/15 text-success border border-success/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                      Dibuka
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-200 text-neutral-600 border border-neutral-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                      Ditutup
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 md:px-3 text-center whitespace-pre-line leading-tight text-xs md:text-sm">{formatIndonesianDate(item.start)}</td>
                {!compact && <td className="py-3 px-2 md:px-3 text-center whitespace-pre-line leading-tight text-xs md:text-sm">{formatIndonesianDate(item.end)}</td>}
                <td className="py-3 px-2 md:px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onToggleStatus && (
                      <button
                        onClick={() => handleToggle(item.id, !!item.isOpen)}
                        disabled={togglingId === item.id}
                        className={`font-oxanium text-xs font-bold border-2 rounded-xl px-2.5 py-1 transition-all shadow-sm cursor-pointer whitespace-nowrap disabled:opacity-50 ${
                          item.isOpen
                            ? 'text-danger border-danger hover:bg-danger hover:text-white'
                            : 'text-success border-success hover:bg-success hover:text-white'
                        }`}
                      >
                        {togglingId === item.id ? '...' : item.isOpen ? 'Tutup' : 'Mulai'}
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/admin/edit-test/${item.id}`)}
                      className="font-oxanium text-xs font-bold text-primary border-2 border-primary rounded-xl px-2.5 py-1 hover:bg-primary hover:text-light transition-all shadow-sm cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
