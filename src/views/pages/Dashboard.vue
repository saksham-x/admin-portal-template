<script setup lang="ts">
import CardStatisticsWithImages from '../components/cards/CardStatisticsWithImages.vue'
import DashboardService from '@/services/dashboard/DashboardService'
import type { DashboardStats } from '@/types/dashboard/DashboardStats'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import EnquiryTrendsChart from '../components/dashboard/EnquiryTrendsChart.vue'
import DisapprovedStudents from '../../assets/avatars/Invalid-01.png'
import TotalStudents from '../../assets/avatars/Total Student.png'
import ClassroomCOunt from '../../assets/avatars/Classroom Count.png'
import CoursesCount from '../../assets/avatars/Courses.png'
import PendingQuiz from '../../assets/avatars/Pending Quiz.png'
import PendingStudents from '../../assets/avatars/Pending Students.png'
import Programs from '../../assets/avatars/Programs.png'

const router = useRouter()
const isLoading = ref(false)
const stats = ref<DashboardStats | null>(null)
const statisticsData = ref<any[]>([])

const dashboardService = new DashboardService()
const nf = new Intl.NumberFormat()


const STAT_CONFIG = [
  {
    key: 'total_students',
    label: 'Total Students',
    image: TotalStudents,
    icon: 'ri-team-line',
    getValue: (data: DashboardStats) => data.student_stats?.total_students ?? 0,
    route: '/students',
  },
  {
    key: 'admission_total',
    label: 'Admission Forms',
    image: PendingQuiz,

    icon: 'ri-file-list-3-line',
    getValue: (data: DashboardStats) => data.admissionFormData?.count ?? 0,
    route: '/admission-form',
  },
  {
    key: 'admission_pending',
    label: 'Pending Admission',
    image: PendingStudents,

    icon: 'ri-time-line',
    getValue: (data: DashboardStats) => data.admissionFormData?.pending ?? 0,
    route: '/admission-form',
  },

  // {
  //   key: 'admission_approved',
  //   label: 'Approved Admission',
  //   image: '/assets/avatars/Invalid-01.png',

  //   icon: 'ri-checkbox-circle-line',
  //   getValue: (data: DashboardStats) => data.admissionFormData?.approved ?? 0,
  //   route: '/admission-form',
  // },
  {
    key: 'admission_disapproved',
    label: 'Rejected students',
    image: DisapprovedStudents,

    icon: 'ri-close-circle-line',
    getValue: (data: DashboardStats) => data.admissionFormData?.disapproved ?? 0,
    route: '/admission-form',
  },
  {
    key: 'classrooms',
    label: 'Classrooms',
    image: ClassroomCOunt,

    icon: 'ri-presentation-line',
    getValue: (data: DashboardStats) => data.classroom_counts ?? 0,
    route: '/classroom',
  },
  {
    key: 'quiz_total',
    label: 'Total Quizzes',
    image: CoursesCount,

    icon: 'ri-clipboard-line',
    getValue: (data: DashboardStats) => data.quiz_stats?.total_quizzes ?? 0,
    route: '/quiz',
  },


  {
    key: 'courses',
    label: 'Courses',
    image: PendingQuiz,

    icon: 'ri-book-2-line',
    getValue: (data: DashboardStats) => data.course_counts ?? 0,
    route: null,
  },
  {
    key: 'programs',
    label: 'Programs',
    image: Programs,

    icon: 'ri-school-line',
    getValue: (data: DashboardStats) => data.program_counts ?? 0,
    route: '/program',
  },
]


async function getStatistics() {
  try {
    isLoading.value = true

    const res: any = await dashboardService.stats()
    const payload = 'data' in res ? (res.data?.data ?? res.data) : res

    stats.value = payload as DashboardStats

    statisticsData.value = STAT_CONFIG.map(cfg => ({
      key: cfg.key,
      title: cfg.label,
      stats: nf.format(Number(cfg.getValue(stats.value!))),
      icon: cfg.icon,
      image: cfg.image,
      route: cfg.route,
    }))

  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function refreshDashboard() {
  getStatistics()
}

function handleCardClick(route: string | null) {
  if (route) {
    router.push(route)
  }
}

onMounted(getStatistics)
</script>

<template>
  <section class="pa-3">
    <!-- Refresh Button -->
    <div class="d-flex justify-end mb-4">
      <VBtn
        color="primary"
        variant="elevated"
        :loading="isLoading"
        @click="refreshDashboard"
      >
        <VIcon
          start
          icon="ri-refresh-line"
        /> Refresh
      </VBtn>
    </div>

    <!-- Loading Skeletons -->
    <VRow
      v-if="isLoading"
      class="match-height"
    >
      <VCol
        v-for="i in 12"
        :key="i"
        cols="12"
        sm="6"
        md="3"
        class="pt-8 pt-sm-3"
      >
        <VSheet
          class="pa-6"
          rounded="lg"
          elevation="1"
        >
          <VSkeletonLoader type="image, text" />
        </VSheet>
      </VCol>
    </VRow>

    <VRow
      v-else
      class="match-height"
    >
      <VCol
        v-for="item in statisticsData"
        :key="item.key"
        cols="12"
        sm="6"
        md="3"
        class="pt-8 pt-sm-3"
      >
        <div
          :class="{ 'cursor-pointer': item.route }"
          @click="handleCardClick(item.route)"
        >
          <CardStatisticsWithImages
            :title="item.title"
            :stats="item.stats"
            :image="item.image"
          />
        </div>
      </VCol>
    </VRow>

    <VRow class="mt-6">
      <VCol>
        <EnquiryTrendsChart />
      </VCol>
    </VRow>
  </section>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  transition: all 0.2s ease-in-out;
}
</style>