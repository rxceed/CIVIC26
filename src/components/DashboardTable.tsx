import { useNavigate } from 'react-router-dom'

export type TestStatus = 'Belum Dimulai' | 'Belum Dikerjakan' | 'Sedang Dikerjakan' | 'Sudah Dikerjakan'
export type TestType = 'tryout' | 'test'

export interface TableItem {
  id: string;
  name: string;
  start: string;
  end: string;
  status: TestStatus;
  totalQuestions?: number;
  duration?: number; // minutes
  type?: string;
  isOpen?: boolean;
}

interface StatusBadgeProps {
  status: TestStatus;
  itemId: string;
  type: TestType;
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

export const StatusBadge = ({ status, itemId, type }: StatusBadgeProps) => {
  const navigate = useNavigate()

  if (status === 'Belum Dimulai') {
    return <span className="font-oxanium text-neutral-400 text-sm">Belum Dimulai</span>
  }
  if (status === 'Sudah Dikerjakan') {
    return (
      <span className="inline-flex items-center gap-1.5 font-oxanium text-success text-sm font-bold">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
        </svg>
        Selesai
      </span>
    )
  }
  if (status === 'Sedang Dikerjakan') {
    return (
      <button
        onClick={() => navigate(`/pre-tutorial/${type}/${itemId}`)}
        className="font-oxanium text-xs font-bold text-warning border-2 border-warning rounded-xl w-24 h-8 inline-flex items-center justify-center hover:bg-warning hover:text-light transition-all shadow-sm cursor-pointer"
      >
        Lanjutkan
      </button>
    )
  }
  // Belum Dikerjakan
  return (
    <button
      onClick={() => navigate(`/pre-tutorial/${type}/${itemId}`)}
      className="font-oxanium text-xs font-bold text-danger border-2 border-danger rounded-xl w-24 h-8 inline-flex items-center justify-center hover:bg-danger hover:text-light transition-all shadow-sm cursor-pointer"
    >
      Kerjakan
    </button>
  )
}

interface DashboardTableProps {
  title: string;
  type: TestType;
  data: TableItem[];
  compact?: boolean;
  hideSeeAll?: boolean;
}

export const DashboardTable = ({ title, type, data, compact = false, hideSeeAll = false }: DashboardTableProps) => {
  const navigate = useNavigate()

  // Sort by date newest to oldest
  const sortedData = [...data].sort((a, b) => {
    return new Date(b.start).getTime() - new Date(a.start).getTime()
  })

  return (
    <div className="bg-light border-2 border-primary rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-md flex flex-col min-h-0 h-full">
      <div className="flex justify-between items-center mb-3 sm:mb-4 shrink-0 gap-2">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-slant text-dark truncate">{title}</h3>
        {!hideSeeAll && (
          <button
            onClick={() => navigate(`/${type}`)}
            className="font-oxanium text-xs md:text-sm font-bold text-primary border-2 border-primary rounded-xl px-3 py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 hover:bg-primary hover:text-light transition-all shadow-sm cursor-pointer shrink-0"
          >
            Selengkapnya
          </button>
        )}
      </div>

      <div className="overflow-y-auto overflow-x-auto flex-grow rounded-lg border border-primary/10">
        <table className="w-full min-w-[500px] text-left font-oxanium text-xs sm:text-sm md:text-base border-collapse text-black">
          <thead className="sticky top-0 bg-light z-10">
            <tr className="text-dark">
              <th className="pb-3 px-2 md:px-3 font-semibold">{title}</th>
              <th className="pb-3 px-2 md:px-3 font-semibold text-center">Waktu Mulai</th>
              {!compact && <th className="pb-3 px-2 md:px-3 font-semibold text-center">Waktu Berakhir</th>}
              <th className="pb-3 px-2 md:px-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, i) => (
              <tr key={item.id} className={`border-t border-primary/20 ${i % 2 === 0 ? 'bg-primary/5' : 'bg-transparent'}`}>
                <td className="py-3 px-2 md:px-3 truncate">{item.name}</td>
                <td className="py-3 px-2 md:px-3 text-center whitespace-pre-line leading-tight">{formatIndonesianDate(item.start)}</td>
                {!compact && <td className="py-3 px-2 md:px-3 text-center whitespace-pre-line leading-tight">{formatIndonesianDate(item.end)}</td>}
                <td className="py-3 px-2 md:px-3 text-right">
                  <StatusBadge status={item.status} itemId={item.id} type={type} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
