import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { AppThemeProvider, useAppTheme } from '@/providers/theme-provider'
import { QueryProvider } from '@/providers/query-provider'
import { Toaster } from 'sonner'

// Layouts
import ClientLayout from '@/layouts/ClientLayout'
import AuthLayout from '@/layouts/AuthLayout'
import AdminLayout from '@/layouts/AdminLayout'
import ExamLayout from '@/layouts/ExamLayout'

// Auth
import SessionGuard from '@/components/auth/SessionGuard'

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage'
import OAuthCallbackPage from '@/pages/auth/OAuthCallbackPage'

// Client Pages
import DashboardPage from '@/pages/client/DashboardPage'
import CertificationsPage from '@/pages/client/CertificationsPage'
import CertificationDetailPage from '@/pages/client/CertificationDetailPage'
import CoursesPage from '@/pages/client/CoursesPage'
import CourseDetailPage from '@/pages/client/CourseDetailPage'
import CourseLearningPage from '@/pages/client/CourseLearningPage'
import ResultDetailPage from '@/pages/client/ResultDetailPage'
import ExamHistoryPage from '@/pages/client/ExamHistoryPage'
import CommunityPage from '@/pages/client/CommunityPage'
import PostDetailPage from '@/pages/client/PostDetailPage'
import BookmarksPage from '@/pages/client/BookmarksPage'
import NotificationsPage from '@/pages/client/NotificationsPage'
import ProfilePage from '@/pages/client/ProfilePage'
import TagDetailPage from '@/pages/client/TagDetailPage'

// Exam Pages
import ExamPage from '@/pages/exam/ExamPage'

// Practice Pages
import PracticeLandingPage from '@/pages/practice/PracticeLandingPage'
import PracticeFreePage from '@/pages/practice/PracticeFreePage'
import PracticeExamSimPage from '@/pages/practice/PracticeExamSimPage'
import PracticeFlashcardPage from '@/pages/practice/PracticeFlashcardPage'
import PracticeWeaknessPage from '@/pages/practice/PracticeWeaknessPage'

// Admin Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminCertificationsPage from '@/pages/admin/AdminCertificationsPage'
import AdminCertificationDetailPage from '@/pages/admin/AdminCertificationDetailPage'
import AdminCoursesPage from '@/pages/admin/AdminCoursesPage'
import AdminQuestionsPage from '@/pages/admin/AdminQuestionsPage'
import AdminPostsPage from '@/pages/admin/AdminPostsPage'
import AdminNotificationsPage from '@/pages/admin/AdminNotificationsPage'
import AdminAuditPage from '@/pages/admin/AdminAuditPage'

function AppRoutes() {
  const { resolvedTheme } = useAppTheme()

  return (
    <ConfigProvider
      theme={{
        algorithm: resolvedTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#0A66C2',
          colorSuccess: '#22C55E',
          colorInfo: '#3B82F6',
          colorWarning: '#F59E0B',
          colorError: '#EF4444',
          fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          borderRadius: 12,
        },
        components: {
          Button: {
            controlHeight: 40,
            borderRadius: 8,
          },
          Input: {
            controlHeight: 40,
            borderRadius: 8,
          },
          Menu: {
            borderRadius: 8,
          },
        },
      }}
    >
      <BrowserRouter>
        <SessionGuard />
        <Routes>
          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          </Route>

          {/* Client Protected Routes */}
          <Route element={<ClientLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/certifications" element={<CertificationsPage />} />
            <Route path="/certifications/:slug" element={<CertificationDetailPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/certifications/results/:sessionId" element={<ResultDetailPage />} />
            <Route path="/certifications/exam-history" element={<ExamHistoryPage />} />
            <Route path="/practice" element={<PracticeLandingPage />} />
            <Route path="/practice/free" element={<PracticeFreePage />} />
            <Route path="/practice/exam" element={<PracticeExamSimPage />} />
            <Route path="/practice/exam-sim" element={<PracticeExamSimPage />} />
            <Route path="/practice/flashcard" element={<PracticeFlashcardPage />} />
            <Route path="/practice/weakness" element={<PracticeWeaknessPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/:slug" element={<PostDetailPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/tags/:slug" element={<CommunityPage />} />
          </Route>

          {/* Exam Protected Routes */}
          <Route element={<ExamLayout />}>
            <Route path="/exam/:sessionId" element={<ExamPage />} />
          </Route>

          {/* Standalone Client Routes */}
          <Route path="/courses/:id/learn/:lessonId" element={<CourseLearningPage />} />

          {/* Admin Protected Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/certifications" element={<AdminCertificationsPage />} />
            <Route path="/admin/certifications/:id" element={<AdminCertificationDetailPage />} />
            <Route path="/admin/certifications/:id/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/questions" element={<AdminQuestionsPage />} />
            <Route path="/admin/posts" element={<AdminPostsPage />} />
            <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
            <Route path="/admin/audit" element={<AdminAuditPage />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default function App() {
  return (
    <AppThemeProvider>
      <QueryProvider>
        <AppRoutes />
        <Toaster richColors position="top-right" />
      </QueryProvider>
    </AppThemeProvider>
  )
}
