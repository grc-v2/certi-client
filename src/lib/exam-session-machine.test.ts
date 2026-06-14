import { describe, it, expect } from 'vitest'
import type { QuestionResponse, StartSessionResponse, ExamInitState } from '@/lib/api/exam-sessions'
import {
  examSessionReducer,
  initialExamSessionState,
  answeredCount,
  progress,
  currentQuestion,
  isPractice,
  type ExamSessionState,
} from './exam-session-machine'

const singleQ: QuestionResponse = {
  id: 1, type: 'SINGLE_CHOICE', content: 'q1', difficulty: 'EASY', points: 1, timeLimitSeconds: 60, domainId: 1,
  options: [{ id: 10, content: 'a', orderIndex: 0 }, { id: 11, content: 'b', orderIndex: 1 }],
}
const multiQ: QuestionResponse = {
  id: 2, type: 'MULTIPLE_CHOICE', content: 'q2', difficulty: 'MEDIUM', points: 1, timeLimitSeconds: 60, domainId: 1,
  options: [{ id: 20, content: 'a', orderIndex: 0 }, { id: 21, content: 'b', orderIndex: 1 }, { id: 22, content: 'c', orderIndex: 2 }],
}

function session(overrides: Partial<StartSessionResponse> = {}): StartSessionResponse {
  return {
    id: 99, examId: 1, examTitle: 'T', certificationId: 1, certificationName: 'AWS',
    mode: 'EXAM', status: 'IN_PROGRESS', startTime: '2026-06-14T00:00:00Z', deadline: null,
    durationMinutes: 30, passingScore: 70, totalQuestions: 2, currentQuestionIndex: 0,
    questions: [singleQ, multiQ], ...overrides,
  }
}

const emptyInit: ExamInitState = { answers: {}, flagged: {}, timeLeftSeconds: 1800 }

/** A state with a timed session already loaded. */
function loaded(overrides: Partial<StartSessionResponse> = {}, init: ExamInitState = emptyInit): ExamSessionState {
  return examSessionReducer(initialExamSessionState, {
    type: 'SESSION_LOADED', session: session(overrides), init, now: 1000,
  })
}

describe('SESSION_LOADED', () => {
  it('loads the session and derives a timer when a duration is present', () => {
    const s = loaded()
    expect(s.session?.id).toBe(99)
    expect(s.hasDuration).toBe(true)
    expect(s.timeLeft).toBe(1800)
    expect(s.isPaused).toBe(false)
    expect(s.currentQuestionStartedAt).toBe(1000)
  })

  it('seeds answers and flags from the init payload', () => {
    const s = loaded({}, { answers: { 1: [10] }, flagged: { 2: true }, timeLeftSeconds: 100 })
    expect(s.answers).toEqual({ 1: [10] })
    expect(s.flagged).toEqual({ 2: true })
  })

  it('has no timer and zero timeLeft when there is no duration', () => {
    const s = loaded({ durationMinutes: 0 })
    expect(s.hasDuration).toBe(false)
    expect(s.timeLeft).toBe(0)
  })

  it('starts paused when the server says the session is PAUSED', () => {
    expect(loaded({ status: 'PAUSED' }).isPaused).toBe(true)
  })
})

describe('SELECT_OPTION — single choice', () => {
  it('sets the single selected option', () => {
    const s = examSessionReducer(loaded(), { type: 'SELECT_OPTION', questionId: 1, optionId: 10, isMulti: false })
    expect(s.answers).toEqual({ 1: [10] })
  })

  it('replaces the previous single answer', () => {
    let s = examSessionReducer(loaded(), { type: 'SELECT_OPTION', questionId: 1, optionId: 10, isMulti: false })
    s = examSessionReducer(s, { type: 'SELECT_OPTION', questionId: 1, optionId: 11, isMulti: false })
    expect(s.answers).toEqual({ 1: [11] })
  })

  it('is a no-op when re-selecting the same single option', () => {
    const before = examSessionReducer(loaded(), { type: 'SELECT_OPTION', questionId: 1, optionId: 10, isMulti: false })
    const after = examSessionReducer(before, { type: 'SELECT_OPTION', questionId: 1, optionId: 10, isMulti: false })
    expect(after).toBe(before)
  })
})

describe('SELECT_OPTION — multiple choice', () => {
  it('accumulates and toggles options off', () => {
    let s = examSessionReducer(loaded(), { type: 'SELECT_OPTION', questionId: 2, optionId: 20, isMulti: true })
    s = examSessionReducer(s, { type: 'SELECT_OPTION', questionId: 2, optionId: 21, isMulti: true })
    expect(s.answers).toEqual({ 2: [20, 21] })
    s = examSessionReducer(s, { type: 'SELECT_OPTION', questionId: 2, optionId: 20, isMulti: true })
    expect(s.answers).toEqual({ 2: [21] })
  })

  it('drops the question key when the last option is toggled off', () => {
    let s = examSessionReducer(loaded(), { type: 'SELECT_OPTION', questionId: 2, optionId: 20, isMulti: true })
    s = examSessionReducer(s, { type: 'SELECT_OPTION', questionId: 2, optionId: 20, isMulti: true })
    expect(s.answers).toEqual({})
  })
})

describe('guards while paused', () => {
  it('ignores SELECT_OPTION and TOGGLE_FLAG when paused', () => {
    const paused = examSessionReducer(loaded(), { type: 'PAUSE' })
    expect(examSessionReducer(paused, { type: 'SELECT_OPTION', questionId: 1, optionId: 10, isMulti: false })).toBe(paused)
    expect(examSessionReducer(paused, { type: 'TOGGLE_FLAG', questionId: 1 })).toBe(paused)
  })
})

describe('TOGGLE_FLAG', () => {
  it('toggles a flag on and off', () => {
    let s = examSessionReducer(loaded(), { type: 'TOGGLE_FLAG', questionId: 1 })
    expect(s.flagged[1]).toBe(true)
    s = examSessionReducer(s, { type: 'TOGGLE_FLAG', questionId: 1 })
    expect(s.flagged[1]).toBe(false)
  })
})

describe('RECEIVE_FEEDBACK', () => {
  it('stores the server feedback for a question', () => {
    const fb = { questionId: 1, answered: true, isCorrect: true, correctOptionIds: [10], explanation: 'x', referenceLinks: null }
    const s = examSessionReducer(loaded(), { type: 'RECEIVE_FEEDBACK', questionId: 1, feedback: fb })
    expect(s.feedback[1]).toEqual(fb)
  })
})

describe('GO_TO', () => {
  it('moves to an index and resets the per-question clock', () => {
    const s = examSessionReducer(loaded(), { type: 'GO_TO', index: 1, now: 5000 })
    expect(s.currentIndex).toBe(1)
    expect(s.currentQuestionStartedAt).toBe(5000)
  })
})

describe('TICK', () => {
  it('derives remaining time from the deadline and flags time-up at zero', () => {
    const base = loaded({ deadline: new Date(10_000).toISOString() })
    const ticked = examSessionReducer(base, { type: 'TICK', now: 5000 })
    expect(ticked.timeLeft).toBe(5)
    expect(ticked.isTimeUp).toBe(false)

    const expired = examSessionReducer(ticked, { type: 'TICK', now: 10_000 })
    expect(expired.timeLeft).toBe(0)
    expect(expired.isTimeUp).toBe(true)
  })

  it('is a no-op when paused, untimed, or already at zero', () => {
    const paused = examSessionReducer(loaded(), { type: 'PAUSE' })
    expect(examSessionReducer(paused, { type: 'TICK', now: 5000 })).toBe(paused)

    const untimed = loaded({ durationMinutes: 0 })
    expect(examSessionReducer(untimed, { type: 'TICK', now: 5000 })).toBe(untimed)
  })
})

describe('PAUSE / RESUME', () => {
  it('pauses and resumes, resetting the clock on resume', () => {
    const paused = examSessionReducer(loaded(), { type: 'PAUSE' })
    expect(paused.isPaused).toBe(true)
    const resumed = examSessionReducer(paused, { type: 'RESUME', now: 7000 })
    expect(resumed.isPaused).toBe(false)
    expect(resumed.currentQuestionStartedAt).toBe(7000)
  })
})

describe('selectors', () => {
  it('computes answered count and progress', () => {
    const s = examSessionReducer(loaded(), { type: 'SELECT_OPTION', questionId: 1, optionId: 10, isMulti: false })
    expect(answeredCount(s)).toBe(1)
    expect(progress(s)).toBe(50)
  })

  it('exposes the current question and practice flag', () => {
    expect(currentQuestion(loaded())?.id).toBe(1)
    expect(isPractice(loaded())).toBe(false)
    expect(isPractice(loaded({ mode: 'PRACTICE' }))).toBe(true)
  })
})
