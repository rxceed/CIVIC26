import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminHeader } from '../components/AdminHeader'
import { storageApi } from '../api/storage.api'
import { quizApi } from '../api/quiz.api'
import { questionApi } from '../api/question.api'

interface Choice {
  id: string;
  text: string;
  image: string | null;
  fileUrl?: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  imageRef: string | null;
  imageUrl: string | null;
  scoreWeight: number | string;
  penaltyWeight: number | string;
  unansweredWeight: number | string;
  acakPilihan: boolean;
  choices: Choice[];
  isNew?: boolean;
}

export const AdminEditPaketSoalDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [paketName, setPaketName] = useState('')
  const [paketDescription, setPaketDescription] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [questions, setQuestions] = useState<Question[]>([])
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([])

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const quizRes = await quizApi.getQuizById(id)
        if (quizRes.success) {
          setPaketName(quizRes.data.name)
          setPaketDescription(quizRes.data.description || '')
        }

        const qRes = await questionApi.getQuestionsByQuizId(id)
        if (qRes.success && qRes.data.length > 0) {
          const mappedQuestions = qRes.data.map(q => {
            const allChoices = [
              { id: crypto.randomUUID(), text: q.options.a.text, image: q.options.a.image ?? null, isCorrect: q.answer === 'a' },
              { id: crypto.randomUUID(), text: q.options.b.text, image: q.options.b.image ?? null, isCorrect: q.answer === 'b' },
              { id: crypto.randomUUID(), text: q.options.c.text, image: q.options.c.image ?? null, isCorrect: q.answer === 'c' },
              { id: crypto.randomUUID(), text: q.options.d.text, image: q.options.d.image ?? null, isCorrect: q.answer === 'd' },
              { id: crypto.randomUUID(), text: q.options.e.text, image: q.options.e.image ?? null, isCorrect: q.answer === 'e' }
            ]
            let choices = allChoices.filter(c => c.text || c.image)
            if (choices.length < 2) {
              while (choices.length < 2) {
                choices.push({ id: crypto.randomUUID(), text: '', image: null, isCorrect: false })
              }
            }
            return {
              id: q.id,
              text: q.question,
              imageRef: q.imageRef,
              imageUrl: null, // we don't have presigned URL yet, maybe render differently if needed
              scoreWeight: q.scoreWeight ?? 10,
              penaltyWeight: q.penaltyWeight ?? 0,
              unansweredWeight: q.unansweredWeight ?? 0,
              acakPilihan: q.shuffleChoices,
              choices,
              isNew: false
            }
          })
          setQuestions(mappedQuestions)
          
          // Fetch presigned URLs for existing images
          const loadUrl = async (prefix: string) => {
            try {
              const list = await storageApi.listObjects(prefix)
              if (list.success && list.data.length > 0) {
                const key = list.data[0].key
                const urlRes = await storageApi.getPresignedUrl(key)
                if (urlRes.success) return urlRes.data.url
              }
            } catch (e) {
              console.error('Failed to load url for prefix', prefix, e)
            }
            return null
          }

          mappedQuestions.forEach(q => {
            if (q.imageRef) {
              loadUrl(`questions/${q.imageRef}`).then(url => {
                if (url) {
                  setQuestions(prev => prev.map(pq => pq.id === q.id ? { ...pq, imageUrl: url } : pq))
                }
              })
            }
            q.choices.forEach(c => {
              if (c.image) {
                loadUrl(`choices/${c.image}`).then(url => {
                  if (url) {
                    setQuestions(prev => prev.map(pq => pq.id === q.id ? {
                      ...pq,
                      choices: pq.choices.map(pc => pc.id === c.id ? { ...pc, fileUrl: url } : pc)
                    } : pq))
                  }
                })
              }
            })
          })
        }
      } catch (error) {
        console.error('Failed to load paket details', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        text: '',
        imageRef: null,
        imageUrl: null,
        scoreWeight: 10,
        penaltyWeight: 0,
        unansweredWeight: 0,
        acakPilihan: false,
        isNew: true,
        choices: [
          { id: crypto.randomUUID(), text: '', image: null, isCorrect: false },
          { id: crypto.randomUUID(), text: '', image: null, isCorrect: false },
        ]
      }
    ])
  }

  const handleRemoveQuestion = (qId: string) => {
    const qToRemove = questions.find(q => q.id === qId)
    if (qToRemove && !qToRemove.isNew) {
      setDeletedQuestionIds([...deletedQuestionIds, qId])
    }
    setQuestions(questions.filter(q => q.id !== qId))
  }

  const handleQuestionTextChange = (qId: string, text: string) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, text } : q))
  }

  const handleQuestionScoreChange = (qId: string, value: string) => {
    if (value === '' || value === '-' || /^-?\d*(\.\d*)?$/.test(value)) {
      setQuestions(questions.map(q => {
        if (q.id === qId) {
          return { ...q, scoreWeight: value }
        }
        return q
      }))
    }
  }

  const handleQuestionPenaltyChange = (qId: string, value: string) => {
    if (value === '' || value === '-' || /^-?\d*(\.\d*)?$/.test(value)) {
      setQuestions(questions.map(q => {
        if (q.id === qId) {
          return { ...q, penaltyWeight: value }
        }
        return q
      }))
    }
  }

  const handleQuestionUnansweredChange = (qId: string, value: string) => {
    if (value === '' || value === '-' || /^-?\d*(\.\d*)?$/.test(value)) {
      setQuestions(questions.map(q => {
        if (q.id === qId) {
          return { ...q, unansweredWeight: value }
        }
        return q
      }))
    }
  }

  const handleWeightBlur = (qId: string, field: 'scoreWeight' | 'penaltyWeight' | 'unansweredWeight', defaultVal: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const val = q[field]
        if (val === '' || val === '-' || isNaN(Number(val))) {
          return { ...q, [field]: defaultVal }
        }
        return { ...q, [field]: Number(val) }
      }
      return q
    }))
  }

  const parseWeight = (val: number | string, defaultVal: number): number => {
    if (val === '' || val === '-' || isNaN(Number(val))) return defaultVal
    return Number(val)
  }

  const handleQuestionImageUpload = async (qId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const ext = file.name.split('.').pop()
      const imageRefId = crypto.randomUUID()
      try {
        const key = `questions/${imageRefId}.${ext}`
        const res = await storageApi.uploadFile(key, file)
        if (res.success) {
          const imageUrl = URL.createObjectURL(file)
          setQuestions(questions.map(q => {
            if (q.id === qId) {
              return { ...q, imageUrl, imageRef: imageRefId }
            }
            return q
          }))
        }
      } catch (err) {
        console.error('Failed to upload question image', err)
      }
    }
    e.target.value = ''
  }

  const handleRemoveQuestionImage = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return { ...q, imageUrl: null, imageRef: null }
      }
      return q
    }))
  }

  const handleChoiceImageUpload = async (qId: string, cId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const ext = file.name.split('.').pop()
      const imageRefId = crypto.randomUUID()
      try {
        const key = `choices/${imageRefId}.${ext}`
        const res = await storageApi.uploadFile(key, file)
        if (res.success) {
          const fileUrl = URL.createObjectURL(file)
          setQuestions(questions.map(q => {
            if (q.id === qId) {
              return {
                ...q,
                choices: q.choices.map(c => c.id === cId ? { ...c, image: imageRefId, fileUrl } : c)
              }
            }
            return q
          }))
        }
      } catch (err) {
        console.error('Failed to upload choice image', err)
      }
    }
    e.target.value = ''
  }

  const handleRemoveChoiceImage = (qId: string, cId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          choices: q.choices.map(c => c.id === cId ? { ...c, image: null, fileUrl: undefined } : c)
        }
      }
      return q
    }))
  }

  const handleToggleAcakPilihan = (qId: string) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, acakPilihan: !q.acakPilihan } : q))
  }

  const handleAddChoice = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.choices.length < 5) {
        return {
          ...q,
          choices: [...q.choices, { id: crypto.randomUUID(), text: '', image: null, isCorrect: false }]
        }
      }
      return q
    }))
  }

  const handleRemoveChoice = (qId: string, cId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.choices.length > 2) {
        return {
          ...q,
          choices: q.choices.filter(c => c.id !== cId)
        }
      }
      return q
    }))
  }

  const handleChoiceTextChange = (qId: string, cId: string, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          choices: q.choices.map(c => c.id === cId ? { ...c, text } : c)
        }
      }
      return q
    }))
  }

  const handleSetCorrectChoice = (qId: string, cId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          choices: q.choices.map(c => ({
            ...c,
            isCorrect: c.id === cId
          }))
        }
      }
      return q
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    // Validate that every question has a correct choice selected
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].choices.some(c => c.isCorrect)) {
        alert(`Soal No. ${i + 1} belum memiliki jawaban benar! Silakan pilih salah satu opsi sebagai jawaban benar.`)
        return
      }
    }

    setIsSubmitting(true)
    try {
      // 1. Update the Quiz (PAKET)
      const quizRes = await quizApi.updateQuiz(id, {
        name: paketName,
        description: paketDescription,
        totalQuestions: questions.length,
      })

      if (!quizRes.success) throw new Error('Gagal update paket soal')

      // 2. Map and update/create questions
      for (const q of questions) {
        const correctIndex = q.choices.findIndex(c => c.isCorrect)
        const answerChar = ['a', 'b', 'c', 'd', 'e'][correctIndex]

        const options = {
          a: { text: q.choices[0]?.text || '', image: q.choices[0]?.image || null },
          b: { text: q.choices[1]?.text || '', image: q.choices[1]?.image || null },
          c: { text: q.choices[2]?.text || '', image: q.choices[2]?.image || null },
          d: { text: q.choices[3]?.text || '', image: q.choices[3]?.image || null },
          e: { text: q.choices[4]?.text || '', image: q.choices[4]?.image || null }
        }

        if (q.isNew) {
          await questionApi.createQuestion({
            quizId: id,
            question: q.text,
            imageRef: q.imageRef,
            options: options,
            answer: answerChar,
            scoreWeight: parseWeight(q.scoreWeight, 10),
            penaltyWeight: parseWeight(q.penaltyWeight, 0),
            unansweredWeight: parseWeight(q.unansweredWeight, 0),
            shuffleChoices: q.acakPilihan
          })
        } else {
          await questionApi.updateQuestion(q.id, {
            question: q.text,
            imageRef: q.imageRef,
            options: options,
            answer: answerChar,
            scoreWeight: parseWeight(q.scoreWeight, 10),
            penaltyWeight: parseWeight(q.penaltyWeight, 0),
            unansweredWeight: parseWeight(q.unansweredWeight, 0),
            shuffleChoices: q.acakPilihan
          })
        }
      }

      // 3. Delete removed questions
      for (const deletedId of deletedQuestionIds) {
        await questionApi.deleteQuestion(deletedId)
      }

      navigate('/admin/edit-paket-soal')
    } catch (error) {
      console.error('Failed to update question bank', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalScore = questions.reduce((acc, q) => {
    const n = Number(q.scoreWeight)
    return acc + (isNaN(n) ? 0 : n)
  }, 0)

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-r from-white via-white via-[70%] to-danger/30 p-4 pt-20 md:p-6 md:pt-24 relative flex flex-col font-oxanium pb-20">
      <AdminHeader />

      <div className="flex-grow flex flex-col items-center w-full max-w-5xl mx-auto pt-8">
        <div className="w-full flex items-center justify-between mb-8 animate-in slide-in-from-left duration-500">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/edit-paket-soal')}
              className="p-2 bg-white rounded-full shadow-md text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer border-2 border-primary/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <h1 className="font-slant text-4xl text-dark">EDIT PAKET SOAL</h1>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border-2 border-primary/20 shadow-sm flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-500">Total Bobot:</span>
            <span className="text-xl font-bold text-primary">{totalScore}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="w-full py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-6">

            {/* Paket Detail Section */}
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border-2 border-primary/20 animate-in fade-in zoom-in duration-500">
              <h2 className="text-2xl font-bold text-dark mb-6 border-b-2 border-neutral-100 pb-4">Detail Paket Soal</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-dark mb-1">Nama Paket Soal</label>
                  <input
                    type="text"
                    value={paketName}
                    onChange={(e) => setPaketName(e.target.value)}
                    placeholder="Misal: Paket Soal TWK CPNS 2026"
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-dark mb-1">Deskripsi</label>
                  <textarea
                    value={paketDescription}
                    onChange={(e) => setPaketDescription(e.target.value)}
                    placeholder="Deskripsi singkat mengenai paket soal ini..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark min-h-[100px] resize-y"
                    required
                  />
                </div>
              </div>
            </div>



            {/* Questions Section */}
            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div key={q.id} className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border-2 border-primary/20 relative animate-in slide-in-from-bottom-4 duration-500">

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b-2 border-neutral-100 pb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold text-dark">Soal {qIndex + 1}</h3>

                      <div className="flex items-center gap-3 bg-neutral-50 px-3 py-1.5 rounded-lg border-2 border-neutral-200 flex-wrap">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-primary">Bobot Nilai</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={q.scoreWeight}
                            onChange={(e) => handleQuestionScoreChange(q.id, e.target.value)}
                            onBlur={() => handleWeightBlur(q.id, 'scoreWeight', 10)}
                            onFocus={(e) => e.target.select()}
                            className="w-16 bg-white text-dark font-bold focus:outline-none text-center border rounded-md"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-danger">Bobot Penalti</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={q.penaltyWeight}
                            onChange={(e) => handleQuestionPenaltyChange(q.id, e.target.value)}
                            onBlur={() => handleWeightBlur(q.id, 'penaltyWeight', 0)}
                            onFocus={(e) => e.target.select()}
                            className="w-16 bg-white text-dark font-bold focus:outline-none text-center border rounded-md"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-neutral-600">Bobot Tidak Dijawab</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={q.unansweredWeight}
                            onChange={(e) => handleQuestionUnansweredChange(q.id, e.target.value)}
                            onBlur={() => handleWeightBlur(q.id, 'unansweredWeight', 0)}
                            onFocus={(e) => e.target.select()}
                            className="w-16 bg-white text-dark font-bold focus:outline-none text-center border rounded-md"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex items-center gap-3 bg-neutral-50 px-3 py-1.5 rounded-lg border-2 border-neutral-100">
                        <label className="text-xs font-bold text-neutral-600 cursor-pointer" htmlFor={`acak-pilihan-${q.id}`}>
                          Acak Pilihan Ganda
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id={`acak-pilihan-${q.id}`}
                            className="sr-only peer"
                            checked={q.acakPilihan}
                            onChange={() => handleToggleAcakPilihan(q.id)}
                          />
                          <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="p-2 text-neutral-400 hover:text-danger hover:bg-danger/10 rounded-full transition-colors"
                        title="Hapus Soal"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-dark mb-1">Pertanyaan</label>
                      <textarea
                        value={q.text}
                        onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                        placeholder="Tuliskan pertanyaan disini..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark min-h-[80px]"
                        required
                      />
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {(q.imageUrl || q.imageRef) && (
                        <div className="mb-4 relative inline-block group">
                          {q.imageUrl ? (
                            <img src={q.imageUrl} alt="Soal" className="max-h-48 rounded-lg border-2 border-neutral-200" />
                          ) : (
                            <div className="w-full h-32 px-8 flex items-center justify-center bg-neutral-100 text-neutral-500 font-bold rounded-lg border-2 border-neutral-200">
                              [Gambar Soal Sudah Terunggah]
                            </div>
                          )}
                          <div className="absolute inset-0 bg-dark/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg backdrop-blur-sm">
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestionImage(q.id)}
                              className="bg-danger text-white p-2 rounded-full hover:bg-danger/80 transition-colors shadow-lg cursor-pointer"
                              title="Hapus Gambar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      {!q.imageUrl && !q.imageRef && (
                        <label className="inline-flex flex-col items-center justify-center h-32 px-6 border-2 border-dashed border-primary/50 rounded-xl text-sm font-bold text-primary hover:bg-primary/5 transition-colors cursor-pointer w-fit bg-white">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mb-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                          Tambah Gambar
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleQuestionImageUpload(q.id, e)}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-dark mb-1">Pilihan Jawaban</label>

                    {q.choices.map((c, cIndex) => (
                      <div key={c.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all ${c.isCorrect ? 'border-primary bg-primary/5' : 'border-neutral-200'}`}>
                        <div className="mt-2.5">
                          <label className="relative flex cursor-pointer items-center rounded-full p-1" htmlFor={`checkbox-${c.id}`}>
                            <input
                              type="checkbox"
                              className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-neutral-300 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-primary before:opacity-0 before:transition-opacity checked:border-primary checked:bg-primary checked:before:bg-primary hover:before:opacity-10"
                              id={`checkbox-${c.id}`}
                              checked={c.isCorrect}
                              onChange={() => handleSetCorrectChoice(q.id, c.id)}
                            />
                            <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                              </svg>
                            </div>
                          </label>
                        </div>

                        <div className="flex-grow flex flex-col gap-2">
                          <input
                            type="text"
                            value={c.text}
                            onChange={(e) => handleChoiceTextChange(q.id, c.id, e.target.value)}
                            placeholder={`Pilihan ${String.fromCharCode(65 + cIndex)}`}
                            className="w-full px-3 py-2 rounded-lg border-2 border-neutral-100 focus:border-primary focus:outline-none focus:bg-white bg-neutral-50 transition-all text-dark"
                            required
                          />

                          {c.fileUrl || c.image ? (
                          <div className="relative inline-block group">
                            {c.fileUrl ? (
                              <img src={c.fileUrl} alt="Pilihan" className="h-16 w-16 object-cover rounded-lg border border-neutral-200" />
                            ) : c.image?.startsWith('blob:') ? (
                              <img src={c.image} alt="Pilihan" className="h-16 w-16 object-cover rounded-lg border border-neutral-200" />
                            ) : (
                              <div className="h-16 w-16 flex items-center justify-center bg-neutral-100 text-[10px] text-center text-neutral-500 font-bold rounded-lg border border-neutral-200">
                                [Gambar]
                              </div>
                            )}
                            <div className="absolute inset-0 bg-dark/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg backdrop-blur-sm">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveChoiceImage(q.id, c.id)}
                                  className="bg-danger text-white p-1.5 rounded-full hover:bg-danger/80 transition-colors shadow-lg cursor-pointer"
                                  title="Hapus Gambar Pilihan"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ) : (
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-dashed border-primary/40 rounded-lg text-xs font-bold text-primary hover:bg-primary/5 transition-colors cursor-pointer w-fit bg-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            Gambar
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleChoiceImageUpload(q.id, c.id, e)}
                            />
                          </label>
                          )}

                          {c.isCorrect && (
                            <span className="text-xs font-bold text-primary mt-1 inline-block">Benar (Kunci Jawaban)</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveChoice(q.id, c.id)}
                          disabled={q.choices.length <= 2}
                          className={`p-2 rounded-lg transition-colors mt-1 ${q.choices.length <= 2 ? 'text-neutral-300 bg-neutral-50 cursor-not-allowed' : 'text-danger hover:bg-danger/10'}`}
                          title="Hapus Pilihan"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    ))}

                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => handleAddChoice(q.id)}
                      disabled={q.choices.length >= 5}
                      className={`text-sm font-bold flex items-center gap-1 transition-colors px-3 py-2 rounded-lg border-2 ${q.choices.length >= 5 ? 'text-neutral-400 border-neutral-200 bg-neutral-50 cursor-not-allowed' : 'text-primary border-primary/30 bg-primary/5 hover:bg-primary/10'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Tambah Pilihan
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Add Question Button */}
            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full py-4 border-2 border-dashed border-primary text-primary font-bold rounded-2xl hover:bg-primary/5 transition-all flex items-center justify-center gap-2 cursor-pointer bg-white/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              TAMBAH SOAL BARU
            </button>

            {/* Submit Button */}
            <div className="sticky bottom-6 z-10 pt-4 flex gap-4 bg-gradient-to-t from-white via-white to-transparent pb-2">
              <button
                type="button"
                onClick={() => navigate('/admin/master')}
                className="px-6 py-4 font-bold text-neutral-500 bg-white border-2 border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors shadow-lg cursor-pointer"
              >
                BATAL
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-grow font-bold text-light bg-primary py-4 rounded-xl shadow-xl hover:bg-primary/90 transition-colors text-lg cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    MENYIMPAN...
                  </>
                ) : (
                  'SIMPAN PERUBAHAN'
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  )
}
