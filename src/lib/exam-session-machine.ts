import type {
  StartSessionResponse,
  QuestionResponse,
  AnswerFeedbackResponse,
  ExamInitState,
} from '@/lib/api/exam-sessions'

/**
 * Pure state machine for taking an exam session — the frontend mirror of the backend
 * `UserExamSession` aggregate. All transitions are pure functions of state + action; time is
 * injected via `now` so the timer is testable without faking timers. React wiring (effects,
 * API calls) lives in `useExamSession`; this module imports nothing from React.
 */

export interface ExamSessionState {
  session: StartSessionResponse | null
  currentIndex: number
  answers: Record<number, number[]>
  flagged: Record<number, boolean>
  feedback: Record<number, AnswerFeedbackResponse>
  hasDuration: boolean
  timeLeft: number
  isPaused: boolean
  isTimeUp: boolean
  /** Epoch ms when the current question was first shown — for per-question time spent. */
  currentQuestionStartedAt: number
}

export type ExamSessionAction =
  | { type: 'SESSION_LOADED'; session: StartSessionResponse; init: ExamInitState; now: number }
  | { type: 'SELECT_OPTION'; questionId: number; optionId: number; isMulti: boolean }
  | { type: 'TOGGLE_FLAG'; questionId: number }
  | { type: 'RECEIVE_FEEDBACK'; questionId: number; feedback: AnswerFeedbackResponse }
  | { type: 'GO_TO'; index: number; now: number }
  | { type: 'TICK'; now: number }
  | { type: 'PAUSE' }
  | { type: 'RESUME'; now: number }

export const initialExamSessionState: ExamSessionState = {
  session: null,
  currentIndex: 0,
  answers: {},
  flagged: {},
  feedback: {},
  hasDuration: false,
  timeLeft: 0,
  isPaused: false,
  isTimeUp: false,
  currentQuestionStartedAt: 0,
}

export function examSessionReducer(state: ExamSessionState, action: ExamSessionAction): ExamSessionState {
  switch (action.type) {
    case 'SESSION_LOADED': {
      const { session, init, now } = action
      const hasDuration = !!session.durationMinutes && session.durationMinutes > 0
      return {
        ...state,
        session,
        hasDuration,
        answers: Object.keys(init.answers).length ? init.answers : state.answers,
        flagged: Object.keys(init.flagged).length ? init.flagged : state.flagged,
        timeLeft: hasDuration ? init.timeLeftSeconds : 0,
        isPaused: session.status === 'PAUSED',
        currentQuestionStartedAt: now,
      }
    }

    case 'SELECT_OPTION': {
      if (state.isPaused) return state
      const { questionId, optionId, isMulti } = action
      const current = state.answers[questionId] ?? []

      let next: number[]
      if (isMulti) {
        next = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId]
      } else {
        if (current[0] === optionId) return state
        next = [optionId]
      }

      const answers = { ...state.answers }
      if (next.length === 0) delete answers[questionId]
      else answers[questionId] = next
      return { ...state, answers }
    }

    case 'TOGGLE_FLAG': {
      if (state.isPaused) return state
      return {
        ...state,
        flagged: { ...state.flagged, [action.questionId]: !state.flagged[action.questionId] },
      }
    }

    case 'RECEIVE_FEEDBACK':
      return {
        ...state,
        feedback: { ...state.feedback, [action.questionId]: action.feedback },
      }

    case 'GO_TO':
      return { ...state, currentIndex: action.index, currentQuestionStartedAt: action.now }

    case 'TICK': {
      if (!state.hasDuration || state.isPaused || state.timeLeft <= 0) return state
      const deadline = state.session?.deadline ? new Date(state.session.deadline).getTime() : null
      const next = deadline != null
        ? Math.max(0, Math.floor((deadline - action.now) / 1000))
        : Math.max(0, state.timeLeft - 1)
      return { ...state, timeLeft: next, isTimeUp: next <= 0 ? true : state.isTimeUp }
    }

    case 'PAUSE':
      return { ...state, isPaused: true }

    case 'RESUME':
      return { ...state, isPaused: false, currentQuestionStartedAt: action.now }

    default:
      return state
  }
}

// ── Selectors (pure) ───────────────────────────────────────────────────────────

export const answeredCount = (s: ExamSessionState) => Object.keys(s.answers).length

export const totalQuestions = (s: ExamSessionState) => s.session?.questions.length ?? 0

export const progress = (s: ExamSessionState) => {
  const total = totalQuestions(s)
  return total > 0 ? (answeredCount(s) / total) * 100 : 0
}

export const currentQuestion = (s: ExamSessionState): QuestionResponse | undefined =>
  s.session?.questions[s.currentIndex]

export const isPractice = (s: ExamSessionState) => s.session?.mode === 'PRACTICE'

export const isMultiChoice = (q: QuestionResponse) => q.type === 'MULTIPLE_CHOICE'
