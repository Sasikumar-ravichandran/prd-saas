import api from './api';

export const attendanceService = {
	getDaily: async (date) => {
		const response = await api.get('/attendance', { params: { date } });
		return response.data;
	},
	saveBulk: async (date, attendanceData) => {
		const response = await api.post('/attendance', { date, attendanceData });
		return response.data;
	},
	getMonthly: async (month, year) => {
		const response = await api.get('/attendance/monthly', { params: { month, year } });
		return response.data; // Should return an array of all attendance records for that month
	},
	saveMonthlyBulk: async (records) => {
		// records is a flat array of { userId, date, status, notes }
		const response = await api.post('/attendance/monthly-bulk', { records });
		return response.data;
	}
};