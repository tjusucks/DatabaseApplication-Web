import { ref, onMounted, onUnmounted } from 'vue'
import * as rideTrafficApi from '@/api/rideTraffic'

/**
 * Composable for real-time ride traffic data updates
 * @param {number} rideId - Optional ride ID for specific ride data
 * @param {number} interval - Update interval in milliseconds (default: 500ms)
 */
export function useRealTimeRideTraffic(rideId = null, interval = 500) {
  // Reactive data
  const data = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastUpdate = ref(null)

  // For single ride detail
  const rideData = ref({})

  // Timer reference
  let updateTimer = null

  // Fetch all real-time ride traffic data
  const fetchAllRealTimeData = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await rideTrafficApi.getAllRealTimeRideTraffic()
      data.value = response || []
      lastUpdate.value = new Date()
    } catch (err) {
      console.error('Failed to fetch real-time ride traffic data:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Fetch specific ride real-time data
  const fetchRideRealTimeData = async () => {
    if (!rideId) return

    try {
      loading.value = true
      error.value = null
      const response = await rideTrafficApi.getRealTimeRideTraffic(rideId)
      rideData.value = response || {}
      lastUpdate.value = new Date()
    } catch (err) {
      console.error('Failed to fetch real-time ride data:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Start real-time updates
  const startRealTimeUpdates = () => {
    // Clear any existing timer
    if (updateTimer) {
      clearInterval(updateTimer)
    }

    // Set up recurring updates
    updateTimer = setInterval(() => {
      if (rideId) {
        fetchRideRealTimeData()
      } else {
        fetchAllRealTimeData()
      }
    }, interval)
  }

  // Stop real-time updates
  const stopRealTimeUpdates = () => {
    if (updateTimer) {
      clearInterval(updateTimer)
      updateTimer = null
    }
  }

  // Initialize data and start updates
  const init = async () => {
    // Initial data fetch
    if (rideId) {
      await fetchRideRealTimeData()
    } else {
      await fetchAllRealTimeData()
    }

    // Start real-time updates
    startRealTimeUpdates()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopRealTimeUpdates()
  })

  return {
    // Data
    data,
    rideData,
    loading,
    error,
    lastUpdate,

    // Methods
    init,
    fetchAllRealTimeData,
    fetchRideRealTimeData,
    startRealTimeUpdates,
    stopRealTimeUpdates,
  }
}
