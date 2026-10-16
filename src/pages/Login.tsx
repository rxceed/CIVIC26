import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { authApi } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'

export const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setIsError(false)

    try {
      const response = await authApi.login(username, password)
      if (response.success && response.data) {
        login(response.data.token, response.data.user)
        if (response.data.user.isAdmin) {
          navigate('/admin-dashboard')
        } else {
          navigate('/dashboard')
        }
      } else {
        setIsError(true)
      }
    } catch (error) {
      console.error('Login failed', error)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-primary-100 flex flex-col items-center justify-center relative p-4 pt-20 sm:p-6 sm:pt-24 pb-8">
      <Header />

      {/* Login Card */}
      <div className="w-full max-w-lg bg-light border border-primary rounded-2xl p-5 sm:p-8 md:p-10 my-auto shadow-xl">
        <h2 className="text-3xl sm:text-4xl md:text-[42px] font-slant text-dark mb-1 sm:mb-2">Selamat Datang!</h2>
        <p className="font-oxanium text-neutral-600 text-sm sm:text-lg md:text-xl mb-6 sm:mb-8">Tolong masukkan informasi akunmu</p>

        <form onSubmit={handleLogin} className="flex flex-col">
          {/* Username Field */}
          <div className="mb-5">
            <label className={`block font-oxanium text-xs md:text-sm mb-1 ml-1 ${isError ? 'text-danger' : 'text-primary'}`}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (isError) setIsError(false)
              }}
              placeholder="dummyusername"
              className={`w-full font-oxanium text-dark px-4 py-3 rounded-lg border focus:outline-none transition-colors placeholder:text-neutral-400 ${isError
                ? 'border-danger focus:ring-1 focus:ring-danger/50 focus:border-danger'
                : 'border-primary focus:ring-1 focus:ring-primary/50 focus:border-primary'
                }`}
            />
          </div>

          {/* Password Field */}
          <div className="mb-2">
            <label className={`block font-oxanium text-xs md:text-sm mb-1 ml-1 ${isError ? 'text-danger' : 'text-primary'}`}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (isError) setIsError(false)
              }}
              placeholder="********"
              className={`w-full font-oxanium text-dark px-4 py-3 rounded-lg border focus:outline-none transition-colors placeholder:text-neutral-400 tracking-widest ${isError
                ? 'border-danger focus:ring-1 focus:ring-danger/50 focus:border-danger'
                : 'border-primary focus:ring-1 focus:ring-primary/50 focus:border-primary'
                }`}
            />
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end mb-6">
            <a href="#" className="font-oxanium text-[10px] md:text-xs text-primary-300 hover:text-primary transition-colors underline-offset-4 hover:underline">
              Lupa Password
            </a>
          </div>

          {/* Error Message */}
          <div className="h-6 mb-2">
            {isError && (
              <p className="font-oxanium text-danger text-[10px] md:text-xs font-bold transition-opacity">
                Username atau password salah!
              </p>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-600 text-light font-oxanium text-lg py-3 rounded-xl transition-all duration-300 border border-primary-600 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-[54px]"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="font-oxanium text-[10px] text-dark font-bold">
            © 2026 CESC 2026. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
