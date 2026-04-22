import api from '@/services/api';

const reportService = {
  async fetchReports(page = 1) {
    try {
      const response = await api.get(`/reports?page=${page}`);
      return response.data.reports;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  // Add other methods like createReport, updateReport, deleteReport as needed
};

export default reportService;