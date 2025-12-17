<script setup lang="ts">
import { TimeframeType } from '@/types/dashboard/EnquiryTrends'
import { computed, ref, onMounted } from 'vue'
import { ApexOptions } from 'apexcharts'
import EnquiryTrendsService from '@/services/dashboard/EnquiryTrendsService'
import { useTheme } from 'vuetify'

interface TrendData {
  period: string
  count: number
}

const enquiryTrendsService = new EnquiryTrendsService()

const timeframe = ref<TimeframeType>('month')
const selectedYear = ref<number>(new Date().getFullYear())
const availableYears = ref<number[]>([2022, 2023, 2024, 2025])
const isLoading = ref(false)
const trendData = ref<TrendData[]>([])

// Timeframe options for dropdown
const timeframeOptions = [
  { title: 'Daily', value: 'day' },
  { title: 'Monthly', value: 'month' },
  { title: 'Yearly', value: 'year' },
]

const theme = useTheme()

const chartOptions = computed<ApexOptions>(() => {
  const isDark = theme.global.current.value.dark
  const textColor = isDark ? '#E7E3FC' : '#4B465C'
  const gridColor = isDark ? '#3A3541' : '#f1f1f1'

  return {
    chart: {
      type: 'line',
      height: 350,
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
      background: 'transparent',
    },
    theme: {
      mode: isDark ? 'dark' : 'light',
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    colors: ['#7367F0'],
    dataLabels: {
      enabled: true,
    },
    xaxis: {
      categories: trendData.value.map(item => {
        if (timeframe.value === 'month') {
          const date = new Date(item.period + '-01')
          
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        } else if (timeframe.value === 'day') {
          const date = new Date(item.period)
          
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
        
        return item.period
      }),
      title: {
        text: timeframe.value === 'day' ? 'Date' : timeframe.value === 'month' ? 'Month' : 'Year',
        style: {
          color: textColor,
        },
      },
      labels: {
        style: {
          colors: textColor,
        },
      },
    },
    yaxis: {
      title: {
        text: 'Number of Enquiries',
        style: {
          color: textColor,
        },
      },
      labels: {
        formatter: (value: number) => Math.floor(value).toString(),
        style: {
          colors: textColor,
        },
      },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: (value: number) => `${value} enquiries`,
      },
    },
    grid: {
      borderColor: gridColor,
    },
    legend: {
      labels: {
        colors: textColor,
      },
    },
  }
})

const series = computed(() => [
  {
    name: 'Enquiries',
    data: trendData.value.map(item => item.count),
  },
])

async function getData() {
  isLoading.value = true

  try {
    const response = await enquiryTrendsService.getTrends(
      timeframe.value,
      selectedYear.value,
    )

    trendData.value = response.enquiry_trends.map(item => ({
      period: item[timeframe.value] || '',
      count: item.count,
    }))

  } catch (error) {
    showError(error)
    trendData.value = []
  } finally {
    isLoading.value = false
  }
}

watch([timeframe, selectedYear], () => {
  getData()
})

onMounted(() => {
  getData()
})
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>Enquiry trends</span>
    </VCardTitle>

    <VCardText>
      <VRow class="mb-4">
        <VCol
          cols="12"
          md="6"
        >
          <VSelect
            v-model="timeframe"
            :items="timeframeOptions"
            item-title="title"
            item-value="value"
            label="View by"
            density="compact"
            variant="outlined"
          />
        </VCol>

        <VCol
          v-if="timeframe === 'day' || timeframe === 'month'"
          cols="12"
          md="6"
        >
          <VSelect
            v-model="selectedYear"
            :items="availableYears"
            label="Select year"
            density="compact"
            variant="outlined"
          />
        </VCol>
      </VRow>

      <div
        v-if="isLoading"
        class="text-center py-8"
      >
        <VProgressCircular
          indeterminate
          color="primary"
        />
      </div>

      <VueApexCharts
        v-else-if="trendData.length > 0"
        type="line"
        height="350"
        :options="chartOptions"
        :series="series"
      />

      <div
        v-else
        class="text-center py-8"
      >
        <p class="text-medium-emphasis">
          No data available for the selected period
        </p>
      </div>
    </VCardText>
  </VCard>
</template>