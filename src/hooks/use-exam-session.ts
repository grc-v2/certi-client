import { useCallback, useEffect, useReducer, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  examSessionsApi,
  normaliseResumeSession,
  EXAM_SESSION_KEY,
  EXAM_INIT_KEY,
} from '@/lib/api/exam-sessions'
import {
  examSessionReducer,
  initialExamSessionState,
  isMultiChoice,
} from '@/lib/exam-session-machine'
import {
  useSubmitAnswer,
  useCompleteSession,
  useTimeoutSession,
  usePauseSession,
  useResumePlay,
} from '@/hooks/queries/exam-sessions'

type ApiError = { response?: { status?: number } }

/**
 * Drives the exam-session state machine: loads/resumes the session, runs the countdown,
 * composes the session-scoped mutation hooks, and exposes a small action interface.
 * All pure transitions live in `exam-session-machine`; this hook owns the React effects,
 * the API wiring, and the imperative per-question/pause timing.
 */
export function useExamSession(sessionId: string | undefined) {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(examSessionReducer, initialExamSessionState)
  const lastTickRef = useRef<number>(Date.now())
  const sid = sessionId ?? ''

  // ── Load / resume session (server is the source of truth for mode + deadline) ──
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    examSessionsApi.resumeSession(Number(sessionId))
      .then(resume => {
        if (cancelled) return
        const { session, init } = normaliseResumeSession(resume)
        dispatch({ type: 'SESSION_LOADED', session, init, now: Date.now() })
        sessionStorage.removeItem(EXAM_INIT_KEY(sessionId))
      })
      .catch((err: ApiError) => {
        if (cancelled) return
        // 401 is handled centrally by SessionGuard — don't race the session-expired flow.
        if (err?.response?.status === 401) return
        toast.error('Không tìm thấy phiên thi. Vui lòng bắt đầu lại.')
        navigate('/certifications', { replace: true })
      })
    return () => { cancelled = true }
  }, [sessionId, navigate])

  // ── Mutations ──────────────────────────────────────────────────────────────────
  const submitAnswer = useSubmitAnswer(sid, {
    onSuccess: (data) => dispatch({ type: 'RECEIVE_FEEDBACK', questionId: data.questionId, feedback: data }),
    onError: (error) => {
      const status = (error as ApiError).response?.status
      if (status === 400) toast.error('Dữ liệu không hợp lệ')
      else if (status === 403) toast.error('Không có quyền thực hiện')
      else if (status === 404) toast.error('Không tìm thấy câu hỏi')
      else toast.error('Không thể lưu câu trả lời')
    },
  })

  const completeSession = useCompleteSession(sid, {
    onSuccess: (result) => {
      sessionStorage.removeItem(EXAM_SESSION_KEY(sid))
      toast.success('Nộp bài thành công!')
      navigate(`/certifications/results/${result.resultId}`)
    },
    onError: (error) => {
      const status = (error as ApiError).response?.status
      if (status === 400) toast.error('Phiên thi không hợp lệ hoặc đã kết thúc')
      else if (status === 403) toast.error('Không có quyền nộp bài')
      else toast.error('Không thể nộp bài. Vui lòng thử lại.')
    },
  })

  const timeoutSession = useTimeoutSession(sid, {
    onSuccess: (result) => {
      sessionStorage.removeItem(EXAM_SESSION_KEY(sid))
      navigate(`/certifications/results/${result.resultId}`)
    },
    onError: () => toast.error('Không thể kết thúc phiên thi do hết giờ. Vui lòng thử lại.'),
  })

  const pauseSession = usePauseSession(sid, {
    onSuccess: () => { dispatch({ type: 'PAUSE' }); toast.success('Đã tạm dừng phiên luyện tập') },
    onError: (error) => {
      if ((error as ApiError).response?.status === 400) toast.error('Chỉ có thể tạm dừng phiên luyện tập đang hoạt động')
      else toast.error('Không thể tạm dừng phiên')
    },
  })

  const resumePlay = useResumePlay(sid, {
    onSuccess: () => {
      dispatch({ type: 'RESUME', now: Date.now() })
      lastTickRef.current = Date.now()
      toast.success('Tiếp tục phiên luyện tập')
    },
    onError: () => toast.error('Không thể tiếp tục phiên'),
  })

  // ── Countdown — dispatch TICK; the reducer re-derives from the server deadline ──
  useEffect(() => {
    if (!state.hasDuration || state.timeLeft <= 0 || state.isPaused) return
    const interval = setInterval(() => {
      lastTickRef.current = Date.now()
      dispatch({ type: 'TICK', now: Date.now() })
    }, 1000)
    return () => clearInterval(interval)
  }, [state.hasDuration, state.timeLeft, state.isPaused])

  // ── Auto-submit when the timer expires (5s grace for the user to read the modal) ─
  const timeoutMutate = timeoutSession.mutate
  useEffect(() => {
    if (!state.isTimeUp) return
    const t = setTimeout(() => timeoutMutate(), 5000)
    return () => clearTimeout(t)
  }, [state.isTimeUp, timeoutMutate])

  // ── Actions ──────────────────────────────────────────────────────────────────
  const submit = useCallback((questionId: number, optionIds: number[]) => {
    const timeSpentSeconds = Math.round((Date.now() - state.currentQuestionStartedAt) / 1000)
    submitAnswer.mutate({
      questionId,
      selectedOptionIds: optionIds,
      timeSpentSeconds,
      isFlagged: !!state.flagged[questionId],
    })
  }, [state.currentQuestionStartedAt, state.flagged, submitAnswer])

  const selectAnswer = useCallback((questionId: number, optionId: number) => {
    if (!state.session || state.isPaused) return
    const question = state.session.questions.find(q => q.id === questionId)
    if (!question) return
    if (isMultiChoice(question)) {
      dispatch({ type: 'SELECT_OPTION', questionId, optionId, isMulti: true })
    } else {
      const current = state.answers[questionId] ?? []
      if (current[0] === optionId) return
      dispatch({ type: 'SELECT_OPTION', questionId, optionId, isMulti: false })
      submit(questionId, [optionId])
    }
  }, [state.session, state.isPaused, state.answers, submit])

  const confirmMulti = useCallback((questionId: number) => {
    if (state.isPaused) return
    const optionIds = state.answers[questionId]
    if (!optionIds?.length) return
    submit(questionId, optionIds)
  }, [state.answers, state.isPaused, submit])

  const toggleFlag = useCallback((questionId: number) => {
    if (state.isPaused) return
    dispatch({ type: 'TOGGLE_FLAG', questionId })
  }, [state.isPaused])

  const goTo = useCallback((index: number) => {
    dispatch({ type: 'GO_TO', index, now: Date.now() })
  }, [])

  const pause = useCallback(() => {
    const elapsed = Math.max(0, Math.round((Date.now() - lastTickRef.current) / 1000))
    pauseSession.mutate({ timeSpentSeconds: elapsed })
  }, [pauseSession])

  const resume = useCallback(() => { resumePlay.mutate() }, [resumePlay])
  const complete = useCallback(() => { completeSession.mutate() }, [completeSession])
  const submitTimeout = useCallback(() => { timeoutMutate() }, [timeoutMutate])

  return {
    state,
    selectAnswer,
    confirmMulti,
    toggleFlag,
    goTo,
    pause,
    resume,
    complete,
    submitTimeout,
    isSubmitting: submitAnswer.isPending,
    isCompleting: completeSession.isPending,
    isPausing: pauseSession.isPending,
    isResuming: resumePlay.isPending,
    isTimingOut: timeoutSession.isPending,
  }
}
