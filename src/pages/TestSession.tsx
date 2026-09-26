import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { TestType } from '../components/DashboardTable'
import { cbtApi } from '../api/cbt.api'
import type { CBTSession } from '../api/cbt.api'
import { storageApi } from '../api/storage.api'
import { quizApi, type Quiz } from '../api/quiz.api'

// Seeded PRNG (mulberry32)
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0
  }
  return hash
}

// Helpers for persistent image cache per quiz
const getImageCacheKey = (quizId: string) => `cbt_images_${quizId}`

const loadStoredImageCache = (quizId: string): Record<string, string> => {
  try {
    const raw = localStorage.getItem(getImageCacheKey(quizId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const saveStoredImageCache = (quizId: string, cache: Record<string, string>) => {
  try {
    localStorage.setItem(getImageCacheKey(quizId), JSON.stringify(cache))
  } catch (e) {
    console.error('Failed to save image cache to localStorage', e)
  }
}

export const TestSession = () => {
  const { type, id } = useParams<{ type: string; id: string }>()
  const navigate = useNavigate()
  const examType = type as TestType

  const [session, setSession] = useState<CBTSession | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [displayQuestions, setDisplayQuestions] = useState<any[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  
  const [timeLeft, setTimeLeft] = useState('--:--:--')
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [questionImageUrl, setQuestionImageUrl] = useState<string | null>(null)
  const [questionImageFailed, setQuestionImageFailed] = useState(false)
  
  const [optionImages, setOptionImages] = useState<Record<string, string>>({})
  
  // Track last save time to debounce autosave
  const autosaveTimeout = useRef<any>(null)
  const isSubmittingRef = useRef(false)
  const answersRef = useRef<Record<string, string>>({})
  const imageCacheRef = useRef<Record<string, string>>({})

  // Keep answersRef in sync with state for access in timer tick
  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  // Load image cache from localStorage into ref on mount
  useEffect(() => {
    if (id) {
      imageCacheRef.current = loadStoredImageCache(id)
    }
  }, [id])

  // Helper to fetch and cache an image URL
  const fetchImageUrl = async (storagePrefix: string, cacheKey: string): Promise<string | null> => {
    // 1. Check in-memory ref cache
    if (imageCacheRef.current[cacheKey]) {
      const cached = imageCacheRef.current[cacheKey]
      if (cached === '__FAILED__') return null
      return cached
    }

    // 2. Fetch presigned URL from storage API
    try {
      const listRes = await storageApi.listObjects(storagePrefix)
      if (listRes.success && listRes.data && listRes.data.length > 0) {
        const presignRes = await storageApi.getPresignedUrl(listRes.data[0].key)
        if (presignRes.success && presignRes.data?.url) {
          const url = presignRes.data.url
          imageCacheRef.current[cacheKey] = url
          if (id) {
            saveStoredImageCache(id, imageCacheRef.current)
          }
          // Preload into browser cache
          const img = new Image()
          img.src = url
          return url
        }
      }
    } catch (err) {
      console.error(`Failed to fetch image for ${storagePrefix}`, err)
    }

    // Mark as failed in memory to prevent repeatedly polling failing images
    imageCacheRef.current[cacheKey] = '__FAILED__'
    return null
  }

  // Background preloader for all question and choice images
  const prefetchImages = (qList: any[]) => {

    qList.forEach(q => {
      if (q.imageRef) {
        const cacheKey = `q_${q.imageRef}`
        if (!imageCacheRef.current[cacheKey]) {
          fetchImageUrl(`questions/${q.imageRef}`, cacheKey)
        }
      }

      const options = q.displayOptions || [
        { opt: q.options?.a },
        { opt: q.options?.b },
        { opt: q.options?.c },
        { opt: q.options?.d },
        { opt: q.options?.e }
      ]

      options.forEach((optObj: any) => {
        if (optObj?.opt?.image) {
          const cacheKey = `c_${optObj.opt.image}`
          if (!imageCacheRef.current[cacheKey]) {
            fetchImageUrl(`choices/${optObj.opt.image}`, cacheKey)
          }
        }
      })
    })
  }

  useEffect(() => {
    const initSession = async () => {
      if (!id) return
      try {
        const sessionCacheKey = `cbt_session_${id}`
        const answersCacheKey = `cbt_answers_${id}`

        // 1. Check if session, questions, seed, and quiz are cached locally
        const cachedRaw = localStorage.getItem(sessionCacheKey)
        let fetchedSession: CBTSession | null = null
        let fetchedQuestions: any[] = []
        let fetchedQuiz: Quiz | null = null

        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw)
            if (cached.session && Array.isArray(cached.questions) && cached.questions.length > 0) {
              fetchedSession = cached.session
              fetchedQuestions = cached.questions
              fetchedQuiz = cached.quiz || null
            }
          } catch (e) {
            console.error('Failed to parse cached session', e)
          }
        }

        // 2. Only hit DB once if not cached
        if (!fetchedSession || fetchedQuestions.length === 0) {
          const res = await cbtApi.startSession(id)
          if (res.success && res.data) {
            fetchedSession = res.data.session
            fetchedQuestions = res.data.questions

            const returnedTimeLimitMs = res.data.quizTimeLimitMs ?? res.data.session?.quizTimeLimitMs
            if (returnedTimeLimitMs && fetchedSession) {
              fetchedSession.quizTimeLimitMs = returnedTimeLimitMs
            }

            // Fetch quiz details once for openTime and closeTime
            try {
              const quizRes = await quizApi.getQuizById(fetchedSession.quizId)
              if (quizRes.success) {
                fetchedQuiz = quizRes.data
                if (returnedTimeLimitMs && (!fetchedQuiz.quizTimeLimitMs || fetchedQuiz.quizTimeLimitMs <= 0)) {
                  fetchedQuiz.quizTimeLimitMs = returnedTimeLimitMs
                }
              }
            } catch (err) {
              console.error('Failed to fetch quiz details', err)
            }

            // Cache session, questions, seed, and quiz to localStorage
            localStorage.setItem(sessionCacheKey, JSON.stringify({
              session: fetchedSession,
              questions: fetchedQuestions,
              shuffleSeed: fetchedSession.shuffleSeed,
              quiz: fetchedQuiz
            }))
          }
        }

        if (fetchedSession && fetchedQuestions.length > 0) {
          setSession(fetchedSession)
          if (fetchedQuiz) setQuiz(fetchedQuiz)

          // Load answers: prioritize localStorage cached answers, fallback to fetchedSession.answers
          const cachedAnswersRaw = localStorage.getItem(answersCacheKey)
          if (cachedAnswersRaw) {
            try {
              const parsedAnswers = JSON.parse(cachedAnswersRaw)
              setAnswers(parsedAnswers)
              answersRef.current = parsedAnswers
            } catch (e) {
              console.error('Failed to parse cached answers', e)
            }
          } else if (fetchedSession.answers && fetchedSession.answers.length > 0) {
            const initialAnswers: Record<string, string> = {}
            fetchedSession.answers.forEach((ans: any) => {
              initialAnswers[ans.id] = ans.answer
            })
            setAnswers(initialAnswers)
            answersRef.current = initialAnswers
            localStorage.setItem(answersCacheKey, JSON.stringify(initialAnswers))
          }

          // Deterministic shuffle logic using cached shuffleSeed
          let mappedQ: any[] = []
          if (fetchedSession.shuffleSeed) {
            const seed = fetchedSession.shuffleSeed
            const prng = mulberry32(hashString(seed))
            
            let shufQ = [...fetchedQuestions]
            for (let i = shufQ.length - 1; i > 0; i--) {
              const j = Math.floor(prng() * (i + 1))
              const temp = shufQ[i]
              shufQ[i] = shufQ[j]
              shufQ[j] = temp
            }

            mappedQ = shufQ.map((q) => {
              const allOpts = [
                { key: 'a', opt: q.options.a },
                { key: 'b', opt: q.options.b },
                { key: 'c', opt: q.options.c },
                { key: 'd', opt: q.options.d },
                { key: 'e', opt: q.options.e }
              ]
              
              // Filter out empty options BEFORE shuffling
              const validOpts = allOpts.filter(o => o.opt && (o.opt.text || o.opt.image))

              if (q.shuffleChoices) {
                const rng = mulberry32(hashString(seed + q.id))
                for (let j = validOpts.length - 1; j > 0; j--) {
                  const k = Math.floor(rng() * (j + 1));
                  [validOpts[j], validOpts[k]] = [validOpts[k], validOpts[j]];
                }
              }
              return { ...q, displayOptions: validOpts }
            })
            setDisplayQuestions(mappedQ)
          } else {
            mappedQ = fetchedQuestions.map(q => ({
              ...q, 
              displayOptions: [
                { key: 'a', opt: q.options.a },
                { key: 'b', opt: q.options.b },
                { key: 'c', opt: q.options.c },
                { key: 'd', opt: q.options.d },
                { key: 'e', opt: q.options.e }
              ].filter(o => o.opt && (o.opt.text || o.opt.image))
            }))
            setDisplayQuestions(mappedQ)
          }

          // Start background prefetching of all question & choice images
          prefetchImages(mappedQ)
        }
      } catch (error) {
        console.error('Failed to start session', error)
      } finally {
        setIsLoading(false)
      }
    }
    initSession()
  }, [id])

  // Timer logic: duration handling with quizTimeLimitMs and closeTime prioritization
  useEffect(() => {
    if (!session || isSubmitting) return

    const defaultLimitMs = 2 * 60 * 60 * 1000 // default exactly 2 hours (02:00)
    const sessionLimitMs = session.quizTimeLimitMs
    const quizObjLimitMs = quiz?.quizTimeLimitMs
    const timeLimitMs = (sessionLimitMs && sessionLimitMs > 0)
      ? sessionLimitMs
      : (quizObjLimitMs && quizObjLimitMs > 0)
        ? quizObjLimitMs
        : defaultLimitMs

    // Compare quiz time limit and difference between quiz open and close time (whichever smaller dictates quiz duration)
    let sessionDurationMs = timeLimitMs
    let closeTimeMs: number | null = null

    if (quiz?.openTime && quiz?.closeTime) {
      const openMs = new Date(quiz.openTime).getTime()
      const closeMs = new Date(quiz.closeTime).getTime()
      closeTimeMs = closeMs
      const windowDurationMs = closeMs - openMs
      if (windowDurationMs > 0) {
        sessionDurationMs = Math.min(timeLimitMs, windowDurationMs)
      }
    } else if (quiz?.closeTime) {
      closeTimeMs = new Date(quiz.closeTime).getTime()
    }

    // Session deadline based on start time + calculated session duration
    const startTimeMs = session.startTime ? new Date(session.startTime).getTime() : Date.now()
    let deadlineMs = startTimeMs + sessionDurationMs

    // If the quiz close time is due, prioritize it (auto-submitting even if there's duration left)
    if (closeTimeMs !== null) {
      deadlineMs = Math.min(deadlineMs, closeTimeMs)
    }

    const tick = () => {
      const now = Date.now()

      // Prioritize quiz close time: if close time is due, auto-submit immediately
      if (closeTimeMs !== null && now >= closeTimeMs) {
        setTimeLeft('00:00:00')
        handleFinalSubmit()
        return
      }

      let diff = deadlineMs - now
      
      if (diff <= 0) {
        diff = 0
        setTimeLeft('00:00:00')
        handleFinalSubmit() // Auto-submit when duration ends
        return
      }

      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [session, quiz, isSubmitting])

  // Anti-cheat visibility listener
  useEffect(() => {
    if (!session || isSubmitting) return
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cbtApi.recordInfraction(session.id, new Date().toISOString()).catch(console.error)
        alert("Peringatan: Terdeteksi perpindahan tab atau jendela! Pelanggaran dicatat.")
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [session, isSubmitting])

  useEffect(() => {
    setQuestionImageUrl(null)
    setQuestionImageFailed(false)
    setOptionImages({})
    
    const loadQImages = async () => {
      const q = displayQuestions[currentIdx]
      if (!q) return

      // Load question image with cache check
      if (q.imageRef) {
        const cacheKey = `q_${q.imageRef}`
        if (imageCacheRef.current[cacheKey] && imageCacheRef.current[cacheKey] !== '__FAILED__') {
          setQuestionImageUrl(imageCacheRef.current[cacheKey])
        } else if (imageCacheRef.current[cacheKey] === '__FAILED__') {
          setQuestionImageFailed(true)
        } else {
          const url = await fetchImageUrl(`questions/${q.imageRef}`, cacheKey)
          if (url) {
            setQuestionImageUrl(url)
          } else {
            setQuestionImageFailed(true)
          }
        }
      }

      // Load option images with cache check
      if (q.displayOptions) {
        const newOptImages: Record<string, string> = {}
        const uncachedOptions: any[] = []

        q.displayOptions.forEach((optObj: any) => {
          if (optObj.opt?.image) {
            const cacheKey = `c_${optObj.opt.image}`
            if (imageCacheRef.current[cacheKey] && imageCacheRef.current[cacheKey] !== '__FAILED__') {
              newOptImages[optObj.key] = imageCacheRef.current[cacheKey]
            } else if (imageCacheRef.current[cacheKey] !== '__FAILED__') {
              uncachedOptions.push(optObj)
            }
          }
        })

        if (Object.keys(newOptImages).length > 0) {
          setOptionImages(prev => ({ ...prev, ...newOptImages }))
        }

        if (uncachedOptions.length > 0) {
          await Promise.all(uncachedOptions.map(async (optObj: any) => {
            const cacheKey = `c_${optObj.opt.image}`
            const url = await fetchImageUrl(`choices/${optObj.opt.image}`, cacheKey)
            if (url) {
              setOptionImages(prev => ({ ...prev, [optObj.key]: url }))
            }
          }))
        }
      }
    }
    
    if (displayQuestions.length > 0) loadQImages()
  }, [currentIdx, displayQuestions])

  const handleSelect = (qId: string, answerKey: string) => {
    setAnswers(prev => {
      const next = { ...prev, [qId]: answerKey }
      answersRef.current = next

      if (id) {
        try {
          localStorage.setItem(`cbt_answers_${id}`, JSON.stringify(next))
        } catch (e) {
          console.error('Failed to save answers to localStorage', e)
        }
      }

      // Debounced Autosave
      if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current)
      autosaveTimeout.current = setTimeout(() => {
        if (session) {
          const payload = Object.entries(next).map(([qid, answer]) => ({ id: qid, answer }))
          cbtApi.autosave(session.id, payload).catch(console.error)
        }
      }, 1000)

      return next
    })
  }

  const handleClearAnswer = (qId: string) => {
    setAnswers(prev => {
      const next = { ...prev }
      delete next[qId]
      answersRef.current = next

      if (id) {
        try {
          localStorage.setItem(`cbt_answers_${id}`, JSON.stringify(next))
        } catch (e) {
          console.error('Failed to save answers to localStorage', e)
        }
      }

      // Debounced Autosave
      if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current)
      autosaveTimeout.current = setTimeout(() => {
        if (session) {
          const payload = Object.entries(next).map(([qid, answer]) => ({ id: qid, answer }))
          cbtApi.autosave(session.id, payload).catch(console.error)
        }
      }, 1000)

      return next
    })
  }

  const handleFinalSubmit = async () => {
    if (!session || isSubmittingRef.current) return
    isSubmittingRef.current = true
    setIsSubmitting(true)
    setIsSubmitModalOpen(false)
    
    if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current)

    const payload = Object.entries(answersRef.current).map(([qid, answer]) => ({ id: qid, answer }))
    try {
      const res = await cbtApi.submit(session.id, payload)
      if (res.success) {
        if (id) {
          localStorage.removeItem(`cbt_session_${id}`)
          localStorage.removeItem(`cbt_answers_${id}`)
          localStorage.removeItem(getImageCacheKey(id))
        }
        navigate(`/thank-you/${examType}/${id}`)
      } else {
        alert("Gagal mengirim jawaban. Silakan coba lagi.")
        isSubmittingRef.current = false
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error(error)
      alert("Gagal mengirim jawaban. Silakan coba lagi.")
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div className="h-screen flex items-center justify-center font-oxanium text-dark"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
  if (!session || displayQuestions.length === 0) return <div className="p-8 text-center font-oxanium text-dark">Gagal memuat sesi ujian.</div>

  const total = displayQuestions.length
  const q = displayQuestions[currentIdx]
  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === total

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col font-oxanium text-dark relative">
      
      {/* Header Bar */}
      <div className="h-16 shrink-0 border-b border-primary/20 flex items-center justify-between px-6 bg-light shadow-sm z-10">
        <h1 className="font-slant text-2xl text-primary">CBT SESSION</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-400 hidden sm:inline">Sisa Waktu</span>
          <span className={`font-slant text-2xl ${timeLeft.startsWith('00:0') ? 'text-danger animate-pulse' : 'text-dark'}`}>
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Main Test Layout */}
      <div className="flex-grow flex min-h-0 relative overflow-hidden">
        
        {/* Center: Question Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-primary/5 transition-all duration-500">
          <div className="flex-grow p-6 md:p-12 overflow-y-auto">
            
            <div className="mb-8 flex justify-between items-start">
              <span className="inline-block bg-primary text-light font-bold text-sm px-3 py-1 rounded-lg mb-4">
                Soal No. {currentIdx + 1}
              </span>
              <button
                className="text-neutral-400 hover:text-danger text-sm font-bold transition-colors cursor-pointer"
                onClick={() => handleClearAnswer(q.id)}
              >
                Hapus Jawaban
              </button>
            </div>

            {q.imageRef && (
              <div className="mb-6 rounded-xl overflow-hidden border-2 border-neutral-200 bg-neutral-50 flex items-center justify-center min-h-[200px]">
                {questionImageUrl ? (
                  <img src={questionImageUrl} alt="Question Reference" className="w-full h-auto max-h-[400px] object-contain bg-white" />
                ) : questionImageFailed ? (
                  <div className="flex flex-col items-center gap-2 text-neutral-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <span className="font-bold text-sm">Gambar Tidak Ditemukan</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-neutral-400">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-bold text-sm">Memuat Gambar...</span>
                  </div>
                )}
              </div>
            )}

            <p className="text-lg md:text-xl leading-relaxed font-medium mb-8 whitespace-pre-wrap">
              {q.question}
            </p>

            <div className="flex flex-col gap-3">
              {q.displayOptions.map((optObj: any, i: number) => {
                const optText = optObj.opt.text
                const optImgUrl = optionImages[optObj.key]
                
                const isSelected = answers[q.id] === optObj.key
                const letter = String.fromCharCode(65 + i)

                return (
                  <button
                    key={optObj.key}
                    onClick={() => handleSelect(q.id, optObj.key)}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                      isSelected 
                        ? 'border-primary bg-primary/10 shadow-sm' 
                        : 'border-neutral-200 bg-white hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 font-bold mt-0.5 ${
                      isSelected 
                        ? 'bg-primary border-primary text-white' 
                        : 'border-neutral-300 text-neutral-500'
                    }`}>
                      {letter}
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      {optText && <span className="text-base font-medium">{optText}</span>}
                      {optObj.opt.image && (
                        <div className="w-full max-w-[200px] h-32 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden">
                          {optImgUrl ? (
                            <img src={optImgUrl} alt="Option" className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bottom Bar: Navigation */}
          <div className="shrink-0 bg-white border-t border-primary/20 p-4 md:px-8 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-6 py-2.5 rounded-xl font-bold text-dark border-2 border-neutral-200 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer w-[140px]"
            >
              Kembali
            </button>
            
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="lg:hidden px-6 py-2.5 rounded-xl font-bold text-light bg-danger border-2 border-danger hover:bg-danger/80 transition-all cursor-pointer"
            >
              Selesai
            </button>

            <button
              onClick={() => setCurrentIdx(prev => Math.min(total - 1, prev + 1))}
              disabled={currentIdx === total - 1}
              className="px-6 py-2.5 rounded-xl font-bold text-light bg-primary border-2 border-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer w-[140px]"
            >
              Selanjutnya
            </button>
          </div>
        </div>

        {/* Right Side: Navigation Grid (25%) */}
        <div className="w-80 shrink-0 border-l border-primary/20 bg-light flex flex-col hidden lg:flex transition-all duration-500">
          
          <div className="p-6 shrink-0 border-b border-primary/10">
            <h3 className="font-bold text-lg mb-2">Navigasi Soal</h3>
            <div className="flex gap-4 text-xs text-neutral-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-primary rounded-sm" /> Dijawab
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 border border-neutral-300 rounded-sm" /> Belum
              </div>
            </div>
          </div>

          <div className="flex-grow p-6 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {displayQuestions.map((qItem, i) => {
                const isAnswered = !!answers[qItem.id]
                const isCurrent = currentIdx === i

                let style = "bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-50"
                if (isAnswered) {
                  style = "bg-primary border-primary text-white"
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`aspect-square rounded-lg border flex items-center justify-center font-bold text-sm transition-all cursor-pointer relative ${style} ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-6 shrink-0 border-t border-primary/20 bg-white">
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-neutral-500">Terjawab</span>
              <span className="font-bold"><span className="text-primary">{answeredCount}</span> / {total}</span>
            </div>
            
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className={`w-full py-3 rounded-xl font-bold border-2 transition-all cursor-pointer shadow-sm ${
                allAnswered 
                  ? 'bg-danger border-danger text-light hover:bg-danger/80' 
                  : 'bg-white border-danger text-danger hover:bg-danger/10'
              }`}
            >
              Selesaikan Ujian
            </button>
          </div>
        </div>

      </div>

      {/* Submit Modal Overlay */}
      {isSubmitModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-dark/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-slant text-2xl text-dark mb-2">Akhiri Ujian?</h3>
            <p className="font-oxanium text-neutral-500 mb-8">
              {allAnswered 
                ? 'Semua soal telah dijawab. Apakah kamu yakin ingin menyelesaikan ujian ini sekarang?' 
                : `Masih ada ${total - answeredCount} soal yang belum dijawab. Yakin ingin mengakhiri ujian?`}
            </p>
            
            <div className="flex w-full gap-3">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold text-dark border-2 border-neutral-200 hover:bg-neutral-100 transition-all cursor-pointer"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl font-bold text-light bg-danger border-2 border-danger hover:bg-danger/80 transition-all cursor-pointer flex items-center justify-center"
              >
                {isSubmitting ? 'Loading...' : 'Ya, Selesai'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
