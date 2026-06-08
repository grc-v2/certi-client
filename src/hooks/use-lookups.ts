import { useQuery } from '@tanstack/react-query'
import { lookupsApi, type LookupsResponse, type LookupItem } from '@/lib/api/lookups'

export const LOOKUP_LOCALES: Record<string, string> = {
  // Common statuses
  'ACTIVE': 'Hoạt động',
  'INACTIVE': 'Ẩn',
  'PENDING': 'Chờ duyệt',
  'COMPLETED': 'Đã hoàn thành',
  'FAILED': 'Thất bại',
  'DELETED': 'Đã xóa',
  'ARCHIVED': 'Lưu trữ',
  'IN_REVIEW': 'Chờ duyệt',
  'SCHEDULED': 'Lên lịch',

  // Certification levels & difficulty levels
  'BEGINNER': 'Beginner',
  'INTERMEDIATE': 'Intermediate',
  'ADVANCED': 'Advanced',
  'EXPERT': 'Expert',

  'FOUNDATIONAL': 'Cơ bản',
  'ASSOCIATE': 'Thành viên',
  'PROFESSIONAL': 'Chuyên nghiệp',
  'SPECIALTY': 'Chuyên biệt',

  // Exam Types
  'PRACTICE': 'Luyện tập',
  'MOCK': 'Thi thử',
  'FINAL': 'Thi thật',
  'DIAGNOSTIC': 'Đánh giá năng lực',
  'TOPIC_WISE': 'Theo chủ đề',

  // Exam Statuses
  'DRAFT': 'Nháp',

  // Question Types
  'SINGLE_CHOICE': 'Một đáp án',
  'MULTIPLE_CHOICE': 'Nhiều đáp án',
  'TRUE_FALSE': 'Đúng/Sai',

  // Question difficulties
  'EASY': 'Dễ',
  'MEDIUM': 'Trung bình',
  'HARD': 'Khó',

  // Question statuses
  'REVIEW': 'Chờ duyệt',
  'PUBLISHED': 'Đã đăng',
  'DEPRECATED': 'Không dùng',
  'REPORTED': 'Bị báo cáo',

  // Session modes
  'EXAM': 'Thi thật',

  // Session statuses
  'IN_PROGRESS': 'Đang làm',
  'TIMED_OUT': 'Hết giờ',
  'ABANDONED': 'Bỏ qua',

  // Result statuses
  'PASSED': 'Đỗ',
}

export function useLookups(includeInactive = false) {
  const query = useQuery({
    queryKey: ['lookups', includeInactive],
    queryFn: () => lookupsApi.getLookups(includeInactive),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours in memory caching
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  const getOptions = (path: string): LookupItem[] => {
    if (!query.data) return []
    const [group, key] = path.split('.')
    if (!group || !key) return []

    const dataGroup = query.data[group as keyof LookupsResponse]
    if (!dataGroup) return []

    return (dataGroup[key as keyof typeof dataGroup] as LookupItem[]) || []
  }

  const getLabel = (path: string, value: string | number): string => {
    const valStr = String(value)
    if (!valStr) return ''

    const options = getOptions(path)
    const item = options.find(opt => opt.value === valStr)

    // Translate if it matches local locales, otherwise use backend label, otherwise fallback to value
    if (LOOKUP_LOCALES[valStr]) {
      return LOOKUP_LOCALES[valStr]
    }

    if (item) {
      return item.label
    }

    return valStr
  }

  return {
    ...query,
    getOptions,
    getLabel,
    constants: query.data?.constants,
    catalogs: query.data?.catalogs,
  }
}
