import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminHeader } from '../components/AdminHeader'
import { userApi, type User } from '../api/user.api'

export const AdminListAkun = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userApi.getUsers()
        if (res.success) {
          setUsers(res.data.filter((u) => !u.isAdmin))
        }
      } catch (error) {
        console.error('Failed to fetch users', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [])

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-r from-white via-white via-[70%] to-danger/30 p-4 pt-20 sm:pt-24 md:pt-28 md:p-6 relative flex flex-col font-oxanium pb-20">
      <AdminHeader />

      <div className="flex-grow flex flex-col items-center w-full max-w-5xl mx-auto pt-4 sm:pt-8">
        <div className="w-full flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 animate-in slide-in-from-left duration-500">
          <button 
            onClick={() => navigate('/admin/master')}
            className="p-2 bg-white rounded-full shadow-md text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer border-2 border-primary/20 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="font-slant text-2xl sm:text-3xl md:text-4xl text-dark uppercase">DETAIL AKUN PESERTA</h1>
        </div>

        <div className="bg-white w-full rounded-3xl shadow-xl p-4 sm:p-6 md:p-10 border-2 border-primary/20 animate-in fade-in zoom-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {isLoading ? (
              <div className="col-span-full py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : users.map((acc) => (
              <div key={acc.id} className="bg-neutral-50 rounded-2xl p-6 border-2 border-neutral-200 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col h-full group">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                
                <h3 className="font-bold text-xl text-dark mb-1">@{acc.username}</h3>
                <p className="text-sm text-neutral-500 font-bold mb-4 flex-grow">{acc.name || <span className="text-neutral-400 italic">Tanpa Nama</span>}</p>
                
                <div className="flex items-center justify-end mt-auto pt-4 border-t-2 border-neutral-200">
                  
                  <button 
                    onClick={() => navigate(`/admin/detail-akun/${acc.id}`)}
                    className="text-sm font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Lihat History
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!isLoading && users.length === 0 && (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-neutral-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-dark mb-2">Belum ada Akun Peserta</h3>
              <p className="text-neutral-500">Silakan tambahkan akun peserta melalui menu Buat Akun Peserta.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
