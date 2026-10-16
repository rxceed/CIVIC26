import Logo from '../assets/fonts/Logo.svg'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  showProfile?: boolean;
}

export const Header = ({ showProfile = false }: HeaderProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 flex items-center gap-2 sm:gap-3 bg-primary border-2 border-primary-700 rounded-xl px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-md z-30">
        <img src={Logo} alt="CIVIC EXPO Logo" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
        <h1 className="text-danger font-slant text-lg sm:text-2xl md:text-3xl tracking-wide">CESC 2026</h1>
      </div>

      {showProfile && user && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 flex items-center gap-2 sm:gap-4 md:gap-6 bg-white/80 backdrop-blur px-2.5 py-1 sm:px-4 sm:py-2 rounded-xl shadow-sm border border-neutral-200 z-30">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="font-oxanium font-bold text-dark text-sm">{user.name || user.username}</span>
            <span className="font-oxanium text-xs text-neutral-500">Peserta</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm">
            {(user.name || user.username).charAt(0).toUpperCase()}
          </div>
          
          <button 
            onClick={handleLogout}
            className="text-danger hover:text-danger/80 transition-colors cursor-pointer ml-1 sm:ml-2"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}
