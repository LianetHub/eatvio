import { createDatepicker } from './datepicker.js';

const CHART_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';

const COLORS = {
	blue: '#2f80ed',
	blueAlt: '#0d6efd',
	ink: '#323f4b',
	inkSoft: '#7b8794',
	line: '#e6e6e6',
	prot: '#2f80ed',
	fat: '#f2994a',
	carb: '#0d6efd',
	kcal: '#323f4b',
	sat: '#019a3e',
	mood: '#eb555c',
	waist: '#2f80ed',
	chest: '#9b51e0',
	hips: '#f2994a',
};

function loadChartJs() {
	if (window.Chart) return Promise.resolve(window.Chart);
	return new Promise((resolve, reject) => {
		const existing = document.querySelector(`script[src="${CHART_CDN}"]`);
		if (existing) {
			existing.addEventListener('load', () => resolve(window.Chart));
			existing.addEventListener('error', reject);
			return;
		}
		const script = document.createElement('script');
		script.src = CHART_CDN;
		script.async = true;
		script.onload = () => resolve(window.Chart);
		script.onerror = reject;
		document.head.appendChild(script);
	});
}

function createBuilders(Chart) {
	const wDates = ['20.04', '05.05', '20.05', '04.06', '19.06', '04.07', '18.07'];
	const weight = [94, 96, 95, 92, 93, 92, 91];
	const HEIGHT = 1.76;
	const bmi = weight.map((w) => +(w / (HEIGHT * HEIGHT)).toFixed(1));
	const waist = [104, 103, 101, 99, 98, 96, 95];
	const chest = [112, 111, 110, 109, 108, 108, 107];
	const hips = [110, 109, 108, 107, 106, 105, 104];

	const days = ['05.07', '06.07', '07.07', '08.07', '09.07', '10.07', '11.07', '12.07', '13.07', '14.07', '15.07', '16.07', '17.07', '18.07'];
	const kcal = [2610, 2540, 2480, 2350, 2420, 2280, 2190, 2240, 2100, 2050, 1980, 2040, 1930, 1880];
	const prot = [108, 112, 115, 118, 116, 121, 124, 120, 126, 125, 128, 124, 130, 129];
	const fat = [98, 95, 92, 90, 93, 86, 82, 84, 79, 77, 74, 76, 71, 69];
	const carb = [318, 305, 296, 272, 280, 258, 242, 250, 228, 219, 205, 214, 196, 188];

	const WAKE = 6.5;
	const SLEEP = 22.5;
	let showSleep = true;

	const meals = [
		{ x: 7, p: 110, f: 120, c: 190 },
		{ x: 10, p: 35, f: 45, c: 100 },
		{ x: 13, p: 180, f: 170, c: 300 },
		{ x: 16, p: 40, f: 70, c: 140 },
		{ x: 19, p: 150, f: 140, c: 260 },
		{ x: 21.5, p: 45, f: 160, c: 275 },
	];
	const mk = (k) => meals.map((m) => ({ x: m.x, y: m[k] }));
	const hours = [6.5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 21.5, 22, 22.5];
	const sat = [2, 6.5, 6, 5, 6.8, 6, 4.5, 8, 7.5, 6.5, 7, 6, 4.5, 8, 7, 5.5, 9.3, 9, 8.5];
	const mood = [5, 7, 7, 6.5, 7, 6.5, 5.5, 7.5, 7, 6.5, 6.8, 6, 5, 7.2, 6.8, 5.8, 6.5, 5.5, 5];
	const line = (a) => hours.map((h, i) => ({ x: h, y: a[i] }));

	const grad = (ctx, a = '.18') => {
		const g = ctx.createLinearGradient(0, 0, 0, 320);
		g.addColorStop(0, `rgba(47,128,237,${a})`);
		g.addColorStop(1, 'rgba(47,128,237,0)');
		return g;
	};

	const tooltip = {
		backgroundColor: COLORS.ink,
		padding: 12,
		cornerRadius: 8,
		titleFont: { weight: '700' },
	};

	Chart.defaults.font.family = 'inherit';
	Chart.defaults.color = COLORS.inkSoft;
	Chart.defaults.borderColor = COLORS.line;

	const charts = {};
	const el = (id) => document.getElementById(id);

	const builders = {
		weight: () =>
			new Chart(el('chWeight'), {
				type: 'line',
				data: {
					labels: wDates,
					datasets: [
						{
							label: 'Вес, кг',
							data: weight,
							borderColor: COLORS.blue,
							backgroundColor: (c) => grad(c.chart.ctx),
							fill: true,
							tension: 0.45,
							borderWidth: 2.5,
							pointRadius: 4,
							pointBackgroundColor: '#fff',
							pointBorderColor: COLORS.blue,
							pointBorderWidth: 2,
						},
					],
				},
				options: {
					maintainAspectRatio: false,
					plugins: { legend: { display: false }, tooltip },
					scales: {
						x: { grid: { display: false } },
						y: {
							suggestedMin: 89,
							suggestedMax: 97,
							grid: { color: COLORS.line },
							border: { display: false },
							ticks: { callback: (v) => v + ' кг' },
						},
					},
				},
			}),

		bmi: () =>
			new Chart(el('chBmi'), {
				type: 'line',
				data: {
					labels: wDates,
					datasets: [
						{
							label: 'ИМТ',
							data: bmi,
							borderColor: COLORS.blue,
							backgroundColor: (c) => grad(c.chart.ctx, '.12'),
							fill: true,
							tension: 0.45,
							borderWidth: 2.5,
							pointRadius: 4,
							pointBackgroundColor: '#fff',
							pointBorderColor: COLORS.blue,
							pointBorderWidth: 2,
						},
					],
				},
				options: {
					maintainAspectRatio: false,
					plugins: { legend: { display: false }, tooltip },
					scales: {
						x: { grid: { display: false } },
						y: {
							min: 24,
							max: 33,
							grid: { color: COLORS.line },
							border: { display: false },
						},
					},
				},
				plugins: [
					{
						id: 'bmiZones',
						beforeDatasetsDraw(ch) {
							const {
								ctx,
								chartArea: a,
								scales: { y },
							} = ch;
							const band = (y1, y2, c) => {
								ctx.fillStyle = c;
								const p1 = y.getPixelForValue(Math.min(y2, y.max));
								const p2 = y.getPixelForValue(Math.max(y1, y.min));
								ctx.fillRect(a.left, p1, a.right - a.left, p2 - p1);
							};
							band(18.5, 25, 'rgba(1,154,62,.08)');
							band(25, 30, 'rgba(242,153,74,.1)');
							band(30, 40, 'rgba(235,85,92,.08)');
						},
					},
				],
			}),

		measure: () =>
			new Chart(el('chMeasure'), {
				type: 'line',
				data: {
					labels: wDates,
					datasets: [
						{
							label: 'Талия, см',
							data: waist,
							borderColor: COLORS.waist,
							tension: 0.4,
							borderWidth: 2.5,
							pointRadius: 3,
							pointBackgroundColor: '#fff',
							pointBorderWidth: 2,
						},
						{
							label: 'Грудь, см',
							data: chest,
							borderColor: COLORS.chest,
							tension: 0.4,
							borderWidth: 2.5,
							pointRadius: 3,
							pointBackgroundColor: '#fff',
							pointBorderWidth: 2,
						},
						{
							label: 'Бёдра, см',
							data: hips,
							borderColor: COLORS.hips,
							tension: 0.4,
							borderWidth: 2.5,
							pointRadius: 3,
							pointBackgroundColor: '#fff',
							pointBorderWidth: 2,
						},
					],
				},
				options: {
					maintainAspectRatio: false,
					interaction: { mode: 'index', intersect: false },
					plugins: { legend: { display: false }, tooltip },
					scales: {
						x: { grid: { display: false } },
						y: {
							grid: { color: COLORS.line },
							border: { display: false },
							ticks: { callback: (v) => v + ' см' },
						},
					},
				},
			}),

		daily: () =>
			new Chart(el('chDaily'), {
				type: 'line',
				data: {
					labels: days,
					datasets: [
						{
							label: 'Калории, ккал',
							data: kcal,
							yAxisID: 'y',
							borderColor: COLORS.kcal,
							backgroundColor: (c) => grad(c.chart.ctx),
							fill: true,
							tension: 0.4,
							borderWidth: 2.5,
							pointRadius: 3,
							pointBackgroundColor: '#fff',
							pointBorderWidth: 2,
						},
						{
							label: 'Белки, г',
							data: prot,
							yAxisID: 'y2',
							borderColor: COLORS.prot,
							tension: 0.4,
							borderWidth: 2,
							pointRadius: 0,
						},
						{
							label: 'Жиры, г',
							data: fat,
							yAxisID: 'y2',
							borderColor: COLORS.fat,
							tension: 0.4,
							borderWidth: 2,
							pointRadius: 0,
						},
						{
							label: 'Углеводы, г',
							data: carb,
							yAxisID: 'y2',
							borderColor: COLORS.carb,
							tension: 0.4,
							borderWidth: 2,
							pointRadius: 0,
						},
					],
				},
				options: {
					maintainAspectRatio: false,
					interaction: { mode: 'index', intersect: false },
					plugins: { legend: { display: false }, tooltip },
					scales: {
						x: {
							grid: { display: false },
							ticks: { maxRotation: 0, font: { size: 11 } },
						},
						y: {
							position: 'left',
							title: { display: true, text: 'ккал' },
							grid: { color: COLORS.line },
							border: { display: false },
						},
						y2: {
							position: 'right',
							title: { display: true, text: 'граммы' },
							grid: { display: false },
							border: { display: false },
						},
					},
				},
			}),

		intra: () =>
			new Chart(el('chIntra'), {
				data: {
					datasets: [
						{
							type: 'bar',
							label: 'Белки, ккал',
							data: mk('p'),
							backgroundColor: COLORS.prot,
							stack: 'm',
							yAxisID: 'y',
							barThickness: 26,
						},
						{
							type: 'bar',
							label: 'Жиры, ккал',
							data: mk('f'),
							backgroundColor: COLORS.fat,
							stack: 'm',
							yAxisID: 'y',
							barThickness: 26,
						},
						{
							type: 'bar',
							label: 'Углеводы, ккал',
							data: mk('c'),
							backgroundColor: COLORS.carb,
							stack: 'm',
							yAxisID: 'y',
							barThickness: 26,
							borderRadius: { topLeft: 8, topRight: 8 },
						},
						{
							type: 'line',
							label: 'Сытость',
							data: line(sat),
							yAxisID: 'y2',
							borderColor: COLORS.sat,
							borderWidth: 2.5,
							tension: 0.4,
							pointRadius: 0,
						},
						{
							type: 'line',
							label: 'Настроение',
							data: line(mood),
							yAxisID: 'y2',
							borderColor: COLORS.mood,
							borderWidth: 2.5,
							tension: 0.4,
							pointRadius: 0,
						},
					],
				},
				options: {
					maintainAspectRatio: false,
					interaction: { mode: 'nearest', intersect: false },
					layout: { padding: { top: 22 } },
					plugins: {
						legend: { display: false },
						tooltip: {
							...tooltip,
							callbacks: {
								title: (it) =>
									'Время: ' +
									String(Math.floor(it[0].parsed.x)).padStart(2, '0') +
									':' +
									(it[0].parsed.x % 1 ? '30' : '00'),
							},
						},
					},
					scales: {
						x: {
							type: 'linear',
							min: 5,
							max: 24,
							grid: { display: false },
							ticks: {
								stepSize: 2,
								callback: (v) => String(v).padStart(2, '0') + ':00',
								font: { size: 11 },
							},
						},
						y: {
							position: 'left',
							stacked: true,
							title: { display: true, text: 'ккал за приём' },
							grid: { color: COLORS.line },
							border: { display: false },
						},
						y2: {
							position: 'right',
							min: 0,
							max: 10,
							title: { display: true, text: 'шкала 0–10' },
							grid: { display: false },
							border: { display: false },
						},
					},
				},
				plugins: [
					{
						id: 'sleepZones',
						beforeDatasetsDraw(ch) {
							if (!showSleep) return;
							const {
								ctx,
								chartArea: a,
								scales: { x },
							} = ch;
							ctx.save();
							ctx.fillStyle = 'rgba(123,135,148,.1)';
							ctx.fillRect(a.left, a.top, x.getPixelForValue(WAKE) - a.left, a.bottom - a.top);
							ctx.fillRect(
								x.getPixelForValue(SLEEP),
								a.top,
								a.right - x.getPixelForValue(SLEEP),
								a.bottom - a.top
							);
							const vl = (v, c, l) => {
								const px = x.getPixelForValue(v);
								ctx.strokeStyle = c;
								ctx.setLineDash([6, 5]);
								ctx.lineWidth = 2;
								ctx.beginPath();
								ctx.moveTo(px, a.top);
								ctx.lineTo(px, a.bottom);
								ctx.stroke();
								ctx.setLineDash([]);
								ctx.fillStyle = c;
								ctx.font = '600 11px Mulish, sans-serif';
								ctx.textAlign = 'center';
								ctx.fillText(l, px, a.top - 6);
							};
							vl(WAKE, COLORS.fat, '06:30');
							vl(SLEEP, COLORS.inkSoft, '22:30');
							ctx.restore();
						},
					},
				],
			}),
	};

	function getChart(name) {
		if (!charts[name]) {
			charts[name] = builders[name]();
		}
		return charts[name];
	}

	return {
		getChart,
		setShowSleep: (v) => {
			showSleep = v;
		},
		getShowSleep: () => showSleep,
		charts,
	};
}

let chartApi = null;
let chartsReady = false;

async function ensureCharts() {
	if (chartsReady) return chartApi;
	const Chart = await loadChartJs();
	chartApi = createBuilders(Chart);
	chartsReady = true;
	return chartApi;
}

export const diaryAnalytics = () => {

};

document.addEventListener('alpine:init', () => {
	Alpine.data('diaryAnalytics', () => {
		const today = startOfDay(new Date());
		const monthNames = [
			'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
			'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
		];

		return {
			open: false,
			panel: 'weight',
			showSleep: true,
			intraDate: today,
			_intraPicker: null,
			_syncingIntraPicker: false,
			periods: {
				weight: '3М',
				bmi: '3М',
				measure: '3М',
				daily: '2Н',
			},
			series: {
				measure: [true, true, true],
				daily: [true, true, true, true],
				intra: [true, true, true, true, true],
			},

			get intraDateIso() {
				return toIsoDate(this.intraDate);
			},

			get isIntraToday() {
				return toIsoDate(this.intraDate) === toIsoDate(today);
			},

			get intraDateLabel() {
				if (this.isIntraToday) return 'Сегодня';
				const d = this.intraDate;
				const yesterday = new Date(today);
				yesterday.setDate(yesterday.getDate() - 1);
				if (toIsoDate(d) === toIsoDate(yesterday)) return 'Вчера';
				const label = `${d.getDate()} ${monthNames[d.getMonth()]}`;
				return d.getFullYear() === today.getFullYear()
					? label
					: `${label} ${d.getFullYear()}`;
			},

			ensureIntraPicker() {
				if (this._intraPicker || !this.$refs.intraDateInput) return;
				const el = this.$refs.intraDateInput;
				this._intraPicker = createDatepicker(el, {
					maxDate: today,
					autohide: true,
				});
				this._intraPicker.setDate(this.intraDate);
				el.addEventListener('changeDate', (e) => {
					if (this._syncingIntraPicker) return;
					const date = e.detail?.date;
					if (!date) return;
					const clamped = startOfDay(date);
					if (clamped.getTime() > today.getTime()) return;
					this.intraDate = clamped;
				});
			},

			syncIntraPicker() {
				if (!this._intraPicker) return;
				this._syncingIntraPicker = true;
				this._intraPicker.setDate(this.intraDate);
				this._syncingIntraPicker = false;
			},

			openIntraCalendar() {
				this.ensureIntraPicker();
				if (!this._intraPicker) return;
				this.syncIntraPicker();
				this._intraPicker.show();
			},

			shiftIntraDate(delta) {
				const next = new Date(this.intraDate);
				next.setDate(next.getDate() + delta);
				const clamped = startOfDay(next);
				if (clamped.getTime() > today.getTime()) return;
				this.intraDate = clamped;
				this.syncIntraPicker();
			},

			destroy() {
				if (this._intraPicker) {
					this._intraPicker.destroy();
					this._intraPicker = null;
				}
			},

			async toggle() {
				this.open = !this.open;
				if (this.open) {
					await this.$nextTick();
					const api = await ensureCharts();
					api.getChart(this.panel).resize();
				}
			},

			async setPanel(name) {
				this.panel = name;
				await this.$nextTick();
				const api = await ensureCharts();
				api.getChart(name).resize();
				if (name === 'intra') this.ensureIntraPicker();
			},

			async toggleSeries(chartName, idx) {
				this.series[chartName][idx] = !this.series[chartName][idx];
				const api = await ensureCharts();
				const ch = api.getChart(chartName);
				ch.setDatasetVisibility(idx, this.series[chartName][idx]);
				ch.update();
			},

			async toggleSleep() {
				this.showSleep = !this.showSleep;
				const api = await ensureCharts();
				api.setShowSleep(this.showSleep);
				if (api.charts.intra) api.charts.intra.update();
			},
		};
	});
});

function startOfDay(date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

function toIsoDate(date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}
