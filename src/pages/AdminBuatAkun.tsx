import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminHeader } from '../components/AdminHeader'
import { userApi } from '../api/user.api'

export const AdminBuatAkun = () => {
  const navigate = useNavigate()
  
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await userApi.createUser({ username, name, password })
      if (res.success) {
        alert('Akun berhasil dibuat!')
        navigate('/admin/list-akun')
      }
    } catch (error) {
      console.error('Failed to create account', error)
      alert('Gagal membuat akun.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <h1 className="font-slant text-2xl sm:text-3xl md:text-4xl text-dark uppercase">BUAT AKUN PESERTA</h1>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          
          <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 md:p-10 border-2 border-primary/20 animate-in fade-in zoom-in duration-500">
            <h2 className="text-xl sm:text-2xl font-bold text-dark mb-4 sm:mb-6 border-b-2 border-neutral-100 pb-3 sm:pb-4">Data Peserta</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-dark mb-1">Username <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Misal: budi_santoso"
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-dark mb-1">Nama Lengkap <span className="text-neutral-400 font-normal">(Opsional)</span></label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Budi Santoso"
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-dark mb-1">Password <span className="text-danger">*</span></label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-primary transition-colors focus:outline-none"
                    title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-6 pt-4">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto font-bold text-light bg-primary px-8 py-3.5 rounded-xl border-2 border-primary hover:bg-primary/90 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN AKUN'}
              </button>
          </div>

        </form>
      </div>
    </div>
  )
}
