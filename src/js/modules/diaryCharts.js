export const number = (value) => {
    const abs = Math.abs(value);
    const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
    return Number(value).toLocaleString('ru-RU', { maximumFractionDigits: digits });
};

export const isoDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
};

const parseDate = (iso) => new Date(`${iso}T12:00:00`);

const dayOffset = (iso, offset) => {
    const date = parseDate(iso);
    date.setDate(date.getDate() + offset);
    return isoDate(date);
};

export const minutes = (time) => {
    const [hours, mins] = time.split(':').map(Number);
    return hours * 60 + mins;
};

export function calorieScale(hb, goal, eaten) {
    const scale = Math.max(hb, goal);
    const fraction = Math.min(hb, goal) / scale;
    const angle = Math.PI * (1 + Math.min(fraction, 0.99));

    const point = (radius) => [
        100 + radius * Math.cos(angle),
        100 + radius * Math.sin(angle),
    ];

    const [x1, y1] = point(46);
    const [x2, y2] = point(54);

    return {
        scale,
        progress: Math.min(1, eaten / scale),
        over: eaten > goal,
        tick: {
            fraction,
            label: goal <= hb ? 'Цель' : 'Расчётная норма',
            value: Math.min(hb, goal),
            x1,
            y1,
            x2,
            y2,
        },
    };
}

export function sleepRanges(wake, bed) {
    const wakeHour = minutes(wake) / 60;
    const bedHour = minutes(bed) / 60;

    if (wakeHour <= bedHour) {
        return [[0, wakeHour], [bedHour, 24]];
    }

    return [[bedHour, wakeHour]];
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const averageMl = (rows) => {
    if (!rows.length) return 0;
    const sum = rows.reduce((total, row) => total + row.ml, 0);
    return Math.round(sum / rows.length);
};

const formatDayLabel = (iso) => {
    return parseDate(iso).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
    });
};

export function waterPeriod({
    date,
    today = date,
    complete = false,
    history = {},
    sum = 0,
    goal = 2000,
    period = 'week',
    from,
    to,
}) {
    let start;
    let end = date;

    if (period === 'week') {
        start = dayOffset(date, -6);
    } else if (period === 'month') {
        start = dayOffset(date, -29);
    } else if (period === '6m') {
        const sixMonthsAgo = parseDate(date);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        start = dayOffset(isoDate(sixMonthsAgo), 1);
    } else {
        start = DATE_RE.test(from || '') ? from : dayOffset(date, -20);
        end = DATE_RE.test(to || '') ? to : date;
        if (start > end) {
            [start, end] = [end, start];
        }
    }

    const limit = date < today ? date : today;
    end = end > limit ? limit : end;
    start = start > end ? end : start;

    const minDate = dayOffset(limit, -400);
    start = start < minDate ? minDate : start;
    end = end < minDate ? minDate : end;

    const days = [];
    for (let cursor = start; cursor <= end; cursor = dayOffset(cursor, 1)) {
        days.push({
            date: cursor,
            ml: cursor === date ? sum : history[cursor] ?? null,
        });
    }

    const excludeToday = !complete && date === today;
    const isExcluded = (row) => excludeToday && row.date === today;
    const filled = days.filter((row) => row.ml !== null && !isExcluded(row));

    const byWeek = days.length > 45;
    let points = days.map((row) => ({
        ...row,
        label: formatDayLabel(row.date),
        current: row.date === date,
    }));

    if (byWeek) {
        points = [];
        const weekStarts = [];

        for (let index = days.length - 7; index > -7; index -= 7) {
            weekStarts.unshift(Math.max(0, index));
        }

        for (let i = 0; i < weekStarts.length; i++) {
            const chunk = days.slice(weekStarts[i], weekStarts[i + 1] ?? days.length);
            const valid = chunk.filter((row) => row.ml !== null && !isExcluded(row));

            points.push({
                date: chunk[0].date,
                ml: valid.length ? averageMl(valid) : null,
                label: formatDayLabel(chunk[0].date),
                current: chunk.some((row) => row.date === date),
            });
        }
    }

    const best = filled.reduce((current, row) => {
        if (!current || row.ml > current.ml) return row;
        return current;
    }, null);

    return {
        days,
        points,
        byWeek,
        average: averageMl(filled),
        count: filled.length,
        hits: filled.filter((row) => row.ml >= goal).length,
        missing: days.filter((row) => row.ml === null).length,
        best,
        excludeToday,
    };
}

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

const MEAL_KEYS = {
    p: 'mealP',
    f: 'mealF',
    c: 'mealC',
};

let chartLoadPromise = null;

function loadChartJs() {
    if (window.Chart) {
        return Promise.resolve(window.Chart);
    }

    if (chartLoadPromise) {
        return chartLoadPromise;
    }

    chartLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = CHART_CDN;
        script.async = true;
        script.dataset.diaryChart = 'true';

        const fail = () => {
            clearTimeout(timer);
            script.remove();
            reject(new Error('Не удалось загрузить графики. Проверьте соединение и попробуйте ещё раз.'));
        };

        const timer = setTimeout(fail, 15000);

        script.onload = () => {
            clearTimeout(timer);
            if (window.Chart) {
                resolve(window.Chart);
            } else {
                fail();
            }
        };

        script.onerror = fail;
        document.head.appendChild(script);
    }).catch((error) => {
        chartLoadPromise = null;
        throw error;
    });

    return chartLoadPromise;
}

function createBuilders(Chart, getDay) {
    const analytics = getDay().analytics;
    const {
        wDates,
        weight,
        waist,
        chest,
        hips,
        days,
        kcal,
        prot,
        fat,
        carb,
        hours,
        sat,
        mood,
    } = analytics;
    const bmi = analytics.bmi;

    let wakeHour = minutes(getDay().wake) / 60;
    let bedHour = minutes(getDay().bed) / 60;
    let showSleep = true;

    const mealPoints = (key) => {
        const data = getDay();
        if (data.empty) return [];

        const values = data.analytics[MEAL_KEYS[key]];
        return data.analytics.mealHours.map((time, index) => ({
            x: minutes(time) / 60,
            y: values[index],
        }));
    };

    const moodLine = (values) => {
        if (getDay().empty) return [];
        return hours.map((hour, index) => ({ x: hour, y: values[index] }));
    };

    let waterGoalMl = getDay().waterGoal;
    let waterIntakes = getDay().water.map((item) => ({
        h: minutes(item.time) / 60,
        ml: item.ml,
    }));

    const waterCumulative = () => {
        let total = 0;
        const points = [{ x: 0, y: 0 }];

        waterIntakes.forEach((item) => {
            total += item.ml;
            points.push({ x: item.h, y: total });
        });

        const day = getDay();
        const now = new Date();
        const lastIntake = waterIntakes.at(-1)?.h || 0;
        const end = day.date === day.today && !day.complete
            ? Math.max(now.getHours() + now.getMinutes() / 60, lastIntake)
            : 24;

        points.push({ x: end, y: total });
        return points;
    };

    const waterGoalLine = () => [
        { x: 0, y: waterGoalMl },
        { x: 24, y: waterGoalMl },
    ];

    const sliceWater = (period, from, to) => {
        const day = getDay();
        return waterPeriod({
            date: day.date,
            today: day.today,
            complete: day.complete,
            history: day.history,
            sum: day.waterStats.sum,
            goal: day.waterGoal,
            period,
            from,
            to,
        }).points;
    };

    const waterMarkers = (rows) => ({
        data: rows.map((row) => (row.ml === null || row.ml === 0 ? 0 : null)),
        pointStyle: rows.map((row) => (row.ml === null ? 'crossRot' : 'circle')),
        pointBorderColor: rows.map((row) => (row.ml === null ? COLORS.inkSoft : COLORS.blue)),
        missing: rows.map((row) => row.ml === null),
    });

    const periodBarColor = (row) => {
        if (row.current) return COLORS.blue;
        if (row.ml >= waterGoalMl) return '#8cbcf5';
        return '#d2e4fb';
    };

    const grad = (ctx, alpha = '.18') => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 320);
        gradient.addColorStop(0, `rgba(47,128,237,${alpha})`);
        gradient.addColorStop(1, 'rgba(47,128,237,0)');
        return gradient;
    };

    const tooltip = {
        backgroundColor: COLORS.ink,
        padding: 12,
        cornerRadius: 8,
        titleFont: { weight: '700' },
    };

    Chart.defaults.animation = false;
    Chart.defaults.font.family = 'Mulish, sans-serif';
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
                            const { ctx, chartArea: area, scales: { y } } = ch;

                            const band = (from, to, color) => {
                                ctx.fillStyle = color;
                                const top = y.getPixelForValue(Math.min(to, y.max));
                                const bottom = y.getPixelForValue(Math.max(from, y.min));
                                ctx.fillRect(area.left, top, area.right - area.left, bottom - top);
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
                            data: mealPoints('p'),
                            backgroundColor: COLORS.prot,
                            stack: 'm',
                            yAxisID: 'y',
                            barThickness: 26,
                        },
                        {
                            type: 'bar',
                            label: 'Жиры, ккал',
                            data: mealPoints('f'),
                            backgroundColor: COLORS.fat,
                            stack: 'm',
                            yAxisID: 'y',
                            barThickness: 26,
                        },
                        {
                            type: 'bar',
                            label: 'Углеводы, ккал',
                            data: mealPoints('c'),
                            backgroundColor: COLORS.carb,
                            stack: 'm',
                            yAxisID: 'y',
                            barThickness: 26,
                            borderRadius: { topLeft: 8, topRight: 8 },
                        },
                        {
                            type: 'line',
                            label: 'Сытость',
                            data: moodLine(sat),
                            yAxisID: 'y2',
                            borderColor: COLORS.sat,
                            borderWidth: 2.5,
                            tension: 0.4,
                            pointRadius: 0,
                        },
                        {
                            type: 'line',
                            label: 'Настроение',
                            data: moodLine(mood),
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
                                title: (items) => {
                                    const hour = items[0].parsed.x;
                                    const hh = String(Math.floor(hour)).padStart(2, '0');
                                    const mm = hour % 1 ? '30' : '00';
                                    return 'Время: ' + hh + ':' + mm;
                                },
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

                            const { ctx, chartArea: area, scales: { x } } = ch;
                            ctx.save();
                            ctx.fillStyle = 'rgba(123,135,148,.1)';

                            sleepRanges(getDay().wake, getDay().bed).forEach(([from, to]) => {
                                const left = Math.max(area.left, x.getPixelForValue(from));
                                const right = Math.min(area.right, x.getPixelForValue(to));
                                if (right > left) {
                                    ctx.fillRect(left, area.top, right - left, area.bottom - area.top);
                                }
                            });

                            const drawMarker = (value, color, label) => {
                                const px = x.getPixelForValue(value);
                                ctx.strokeStyle = color;
                                ctx.setLineDash([6, 5]);
                                ctx.lineWidth = 2;
                                ctx.beginPath();
                                ctx.moveTo(px, area.top);
                                ctx.lineTo(px, area.bottom);
                                ctx.stroke();
                                ctx.setLineDash([]);
                                ctx.fillStyle = color;
                                ctx.font = '600 11px Mulish, sans-serif';
                                ctx.textAlign = 'center';
                                ctx.fillText(label, px, area.top - 6);
                            };

                            drawMarker(wakeHour, COLORS.fat, getDay().wake);
                            drawMarker(bedHour, COLORS.inkSoft, getDay().bed);
                            ctx.restore();
                        },
                    },
                ],
            }),

        water: () => {
            const dayChart = new Chart(el('chWaterDay'), {
                type: 'bar',
                data: {
                    datasets: [
                        {
                            type: 'bar',
                            label: 'приём воды, мл',
                            data: waterIntakes.map((item) => ({ x: item.h, y: item.ml })),
                            backgroundColor: COLORS.blue,
                            barThickness: 12,
                            borderRadius: 3,
                            order: 2,
                        },
                        {
                            type: 'line',
                            label: 'накоплено за день',
                            data: waterCumulative(),
                            borderColor: COLORS.blue,
                            backgroundColor: 'rgba(47, 128, 237, 0.16)',
                            fill: true,
                            stepped: true,
                            pointRadius: 0,
                            borderWidth: 2,
                            order: 1,
                        },
                        {
                            type: 'line',
                            label: 'цель',
                            data: waterGoalLine(),
                            borderColor: COLORS.fat,
                            borderDash: [6, 4],
                            pointRadius: 0,
                            borderWidth: 2,
                            order: 0,
                        },
                    ],
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip },
                    scales: {
                        x: {
                            type: 'linear',
                            min: 0,
                            max: 24,
                            ticks: {
                                stepSize: 3,
                                callback: (value) => `${String(value).padStart(2, '0')}:00`,
                            },
                            grid: { display: false },
                        },
                        y: {
                            min: 0,
                            suggestedMax: Math.max(2200, waterGoalMl + 200),
                            grid: { color: COLORS.line },
                            border: { display: false },
                            ticks: { callback: (value) => `${value}` },
                        },
                    },
                },
                plugins: [
                    {
                        id: 'waterSleep',
                        beforeDatasetsDraw(ch) {
                            const { ctx, chartArea: area, scales: { x } } = ch;
                            if (!area) return;

                            ctx.save();
                            ctx.fillStyle = '#f6faff';
                            sleepRanges(getDay().wake, getDay().bed).forEach(([from, to]) => {
                                const left = x.getPixelForValue(from);
                                const right = x.getPixelForValue(to);
                                ctx.fillRect(left, area.top, right - left, area.bottom - area.top);
                            });
                            ctx.restore();
                        },
                    },
                ],
            });

            const weekRows = sliceWater('week');
            charts.waterPeriod = new Chart(el('chWaterPeriod'), {
                type: 'bar',
                data: {
                    labels: weekRows.map((row) => row.label),
                    datasets: [
                        {
                            label: 'мл за день',
                            data: weekRows.map((row) => row.ml),
                            backgroundColor: COLORS.blue,
                            borderRadius: 3,
                            maxBarThickness: 18,
                        },
                        {
                            type: 'line',
                            label: 'цель',
                            data: weekRows.map(() => waterGoalMl),
                            borderColor: COLORS.fat,
                            borderDash: [6, 4],
                            pointRadius: 0,
                            borderWidth: 2,
                        },
                        {
                            type: 'line',
                            label: 'Состояние записей',
                            ...waterMarkers(weekRows),
                            showLine: false,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            pointBorderWidth: 1.5,
                            pointBackgroundColor: '#fff',
                            order: -1,
                            clip: false,
                        },
                    ],
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            ...tooltip,
                            callbacks: {
                                label: (context) => {
                                    if (context.datasetIndex === 2) {
                                        return context.dataset.missing[context.dataIndex]
                                            ? 'Нет данных'
                                            : '0 мл';
                                    }
                                    return `${context.dataset.label}: ${context.formattedValue}`;
                                },
                            },
                        },
                    },
                    scales: {
                        x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
                        y: {
                            min: 0,
                            suggestedMax: Math.max(2600, waterGoalMl + 400),
                            grid: { color: COLORS.line },
                            border: { display: false },
                        },
                    },
                },
            });

            return dayChart;
        },
    };

    function getChart(name) {
        if (!charts[name]) {
            charts[name] = builders[name]();
        }
        return charts[name];
    }

    return {
        getChart,
        charts,

        syncDiary() {
            const day = getDay();
            wakeHour = minutes(day.wake) / 60;
            bedHour = minutes(day.bed) / 60;
            waterIntakes = day.water.map((item) => ({
                h: minutes(item.time) / 60,
                ml: item.ml,
            }));

            this.setWaterGoal(day.waterGoal);

            if (charts.water) {
                charts.water.data.datasets[0].data = waterIntakes.map((item) => ({
                    x: item.h,
                    y: item.ml,
                }));
                charts.water.data.datasets[1].data = waterCumulative();
                charts.water.update('none');
            }

            if (charts.intra) {
                ['p', 'f', 'c'].forEach((key, index) => {
                    charts.intra.data.datasets[index].data = mealPoints(key);
                });
                charts.intra.data.datasets[3].data = moodLine(sat);
                charts.intra.data.datasets[4].data = moodLine(mood);
                charts.intra.update('none');
            }
        },

        setShowSleep(value) {
            showSleep = value;
        },

        getShowSleep() {
            return showSleep;
        },

        setWaterGoal(ml) {
            waterGoalMl = ml;

            if (charts.water) {
                charts.water.data.datasets[2].data = waterGoalLine();
                charts.water.options.scales.y.suggestedMax = Math.max(2200, ml + 200);
                charts.water.update('none');
            }

            if (charts.waterPeriod) {
                const count = charts.waterPeriod.data.labels.length;
                charts.waterPeriod.data.datasets[1].data = Array(count).fill(ml);
                charts.waterPeriod.options.scales.y.suggestedMax = Math.max(2600, ml + 400);
                charts.waterPeriod.update('none');
            }
        },

        setWaterPeriod(period, from, to) {
            if (!charts.waterPeriod) {
                getChart('water');
            }

            const rows = sliceWater(period, from, to);
            charts.waterPeriod.data.labels = rows.map((row) => row.label);
            charts.waterPeriod.data.datasets[0].data = rows.map((row) => row.ml);
            charts.waterPeriod.data.datasets[0].backgroundColor = rows.map(periodBarColor);
            charts.waterPeriod.data.datasets[1].data = rows.map(() => waterGoalMl);
            Object.assign(charts.waterPeriod.data.datasets[2], waterMarkers(rows));
            charts.waterPeriod.update('none');
        },
    };
}

let chartApi = null;
let chartsPromise = null;

async function ensureCharts(getDay) {
    if (chartApi) return chartApi;

    if (!chartsPromise) {
        chartsPromise = loadChartJs()
            .then((Chart) => {
                chartApi = createBuilders(Chart, getDay);
                return chartApi;
            })
            .catch((error) => {
                chartsPromise = null;
                throw error;
            });
    }

    return chartsPromise;
}

function readChartData(root, id) {
    if (root.dataset.diaryEmpty === 'true') return [];

    const script = root.querySelector(`script[type="application/json"]#${id}Values`);
    return script ? JSON.parse(script.textContent) : [];
}

function readWater(root) {
    return [...root.querySelectorAll('[data-water-time]')]
        .map((row) => ({
            time: row.dataset.waterTime,
            ml: Number(row.dataset.ml),
            row,
        }))
        .sort((a, b) => a.time.localeCompare(b.time));
}

function pluck(rows, key) {
    return rows.map((row) => row[key]);
}

function readDiary(root) {
    const weight = readChartData(root, 'chWeight');
    const bmi = readChartData(root, 'chBmi');
    const measure = readChartData(root, 'chMeasure');
    const daily = readChartData(root, 'chDaily');
    const intra = readChartData(root, 'chIntra');
    const mood = readChartData(root, 'chMood');
    const water = readWater(root);
    const empty = root.dataset.diaryEmpty === 'true';
    const dateNode = root.querySelector('.diary__info-date');
    const waterGoalNode = root.querySelector('[data-water-goal]');

    return {
        empty,
        date: dateNode?.getAttribute('datetime') || isoDate(new Date()),
        today: isoDate(new Date()),
        complete: root.dataset.diaryReadonly === 'true',
        wake: root.querySelector('[data-sleep-wake]')?.dataset.sleepWake || '00:00',
        bed: root.querySelector('[data-sleep-bed]')?.dataset.sleepBed || '00:00',
        water,
        waterStats: {
            sum: water.reduce((total, row) => total + row.ml, 0),
        },
        waterGoal: Number(waterGoalNode?.dataset.waterGoal),
        history: empty
            ? {}
            : Object.fromEntries(
                readChartData(root, 'chWaterPeriod').map(({ date, ml }) => [date, ml])
            ),
        analytics: {
            wDates: pluck(weight, 'date'),
            weight: pluck(weight, 'weight'),
            bmi: pluck(bmi, 'bmi'),
            waist: pluck(measure, 'waist'),
            chest: pluck(measure, 'chest'),
            hips: pluck(measure, 'hips'),
            days: pluck(daily, 'date'),
            kcal: pluck(daily, 'calories'),
            prot: pluck(daily, 'protein'),
            fat: pluck(daily, 'fat'),
            carb: pluck(daily, 'carb'),
            hours: pluck(mood, 'hour'),
            sat: pluck(mood, 'satiety'),
            mood: pluck(mood, 'mood'),
            mealHours: pluck(intra, 'time'),
            mealP: pluck(intra, 'proteinKcal'),
            mealF: pluck(intra, 'fatKcal'),
            mealC: pluck(intra, 'carbKcal'),
        },
    };
}

function send(root, name, detail) {
    root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
}

function updateWaterPeriod(root, api) {
    const data = readDiary(root);
    const controls = root.querySelector('[data-water-goal]');
    if (!controls) return;

    const { period: range, from, to } = controls.dataset;

    if (api?.charts.waterPeriod) {
        api.setWaterPeriod(range, from, to);
    }

    const summary = waterPeriod({
        date: data.date,
        today: data.today,
        complete: data.complete,
        history: data.history,
        sum: data.waterStats.sum,
        goal: data.waterGoal,
        period: range,
        from,
        to,
    });

    send(root, 'diary:period', {
        periodAverage: summary.average,
        periodCount: summary.count,
        periodHits: summary.hits,
        periodMissing: summary.missing,
        periodBest: summary.best
            ? 'Максимум: ' + summary.best.ml + ' мл · ' + summary.best.date
            : '',
        weekly: summary.byWeek,
    });
}

function drawTimeline(root) {
    const holder = root.querySelector('[data-water-markers]');
    if (!holder) return;

    holder.replaceChildren();

    const data = readDiary(root);
    const maxMl = Math.max(200, ...data.water.map((entry) => entry.ml));

    sleepRanges(data.wake, data.bed).forEach(([from, to]) => {
        const shade = document.createElement('div');
        shade.className = 'diary__water-sleep';
        shade.style.left = (from / 24) * 100 + '%';
        shade.style.width = ((to - from) / 24) * 100 + '%';
        holder.append(shade);
    });

    let lastLabeled = -999;

    data.water.forEach((entry) => {
        const marker = document.createElement('button');
        const label = document.createElement('b');
        const bar = document.createElement('i');
        const minute = minutes(entry.time);

        marker.type = 'button';
        marker.className = 'diary__water-mark';
        marker.style.left = (minute / 1440) * 100 + '%';
        marker.title = entry.time + ' · ' + entry.ml + ' мл';
        marker.setAttribute('aria-label', marker.title);
        marker.disabled = root.dataset.diaryReadonly === 'true';

        label.textContent = entry.ml;
        label.style.visibility = minute - lastLabeled < 50 ? 'hidden' : 'visible';
        if (minute - lastLabeled >= 50) {
            lastLabeled = minute;
        }

        bar.style.height = 6 + (entry.ml / maxMl) * 16 + 'px';
        marker.append(label, bar);
        marker.addEventListener('click', () => entry.row.querySelector('button').click());
        holder.append(marker);
    });
}

function drawCalories(root) {
    const graph = root.querySelector('[data-kcal-chart]');
    if (!graph) return;

    const goal = Number(graph.dataset.kcalGoal);
    const norm = Number(graph.dataset.norm);
    const keys = ['calories', 'protein', 'fat', 'carb'];
    const totals = keys.map((key) => Number(graph.dataset[key]));
    const norms = [
        goal,
        Math.round((goal * 0.2) / 4),
        Math.round((goal * 0.3) / 9),
        Math.round((goal * 0.5) / 4),
    ];
    const scale = calorieScale(norm, goal, totals[0]);
    const selectors = [
        '.graph__kcal-value',
        '.graph__third-second',
        '.graph__second-second',
        '.graph__first-second',
    ];

    selectors.forEach((selector, index) => {
        const circle = graph.querySelector(selector);
        if (!circle) return;

        const progress = index
            ? Math.min(1, totals[index] / norms[index])
            : scale.progress;

        circle.style.strokeDasharray = Math.PI * 50 * progress + ' ' + Math.PI * 100;
        circle.style.strokeDashoffset = '0';
        circle.style.transformBox = 'fill-box';
        circle.style.transformOrigin = 'center';
        circle.style.transform = 'rotate(180deg)';
        circle.style.stroke = totals[index] > norms[index] ? '#c82222' : '#2f80ed';
    });

    const tick = graph.querySelector('.graph__kcal-tick');
    if (!tick) return;

    for (const key of ['x1', 'y1', 'x2', 'y2']) {
        tick.querySelector('line').setAttribute(key, scale.tick[key]);
    }

    tick.querySelector('title').textContent =
        scale.tick.label + ': ' + scale.tick.value + ' ккал';

    const label = tick.querySelector('text');
    const atEnd = scale.tick.fraction > 0.92;
    const labelX = atEnd ? 150 : scale.tick.x2;
    const nearestX = Math.max(labelX - 24, Math.min(100, labelX));

    label.setAttribute('x', labelX);
    label.setAttribute(
        'y',
        atEnd ? 108 : 100 - Math.sqrt(58 ** 2 - (nearestX - 100) ** 2) - 2
    );
}

function diaryRoot(event) {
    return event.target.closest('[data-diary-page]');
}

if (typeof document !== 'undefined') {
    document.addEventListener('diary:chart', async (event) => {
        const root = diaryRoot(event);
        if (!root) return;

        send(root, 'diary:chart-error', { message: '' });

        try {
            const api = await ensureCharts(() => readDiary(root));
            const detail = event.detail;

            api.syncDiary();

            const chart = api.getChart(detail.panel);

            if (detail.index !== undefined) {
                chart.setDatasetVisibility(detail.index, detail.visible);
            }

            if (detail.sleep !== undefined) {
                api.setShowSleep(detail.sleep);
            }

            chart.resize();
            chart.update('none');

            if (detail.panel === 'water') {
                api.charts.waterPeriod.resize();
                updateWaterPeriod(root, api);
            }
        } catch (error) {
            send(root, 'diary:chart-error', {
                message: error.message || 'Не удалось показать графики',
            });
        }
    });

    ['diary:water', 'diary:sleep', 'diary:water-goal'].forEach((name) => {
        document.addEventListener(name, (event) => {
            const root = diaryRoot(event);
            if (!root) return;

            drawTimeline(root);
            if (chartApi) chartApi.syncDiary();
            updateWaterPeriod(root, chartApi);
        });
    });

    document.addEventListener('diary:kcal', (event) => {
        const root = diaryRoot(event);
        if (root) drawCalories(root);
    });
}
