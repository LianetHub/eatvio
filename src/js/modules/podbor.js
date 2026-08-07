function parseJsonRef(el) {
	if (!el) return null;
	try {
		return JSON.parse(el.textContent);
	} catch (e) {
		console.error("Podbor: failed to parse JSON data from HTML", e);
		return null;
	}
}

document.addEventListener("alpine:init", () => {
	Alpine.data("podbor", () => ({
		screen: "entry",
		step: 1,
		debug: false,
		consultants: {},
		plans: [],
		goalLabels: {},
		near: {},
		onlineWeight: {},
		onlineLabels: {},
		budgetMin: 300,
		budgetMax: 40000,
		budgetStep: 100,
		answers: {
			goal: null,
			dur: "any",
			contact: "any",
			diet: "any",
			budget: 6000,
			med: "any",
			gender: "any",
			exp: "any",
		},
		queue: [],
		shown: 0,
		relaxed: [],

		get budgetPct() {
			const span = this.budgetMax - this.budgetMin;
			if (span <= 0) return 0;
			return Math.min(100, Math.max(0, ((this.answers.budget - this.budgetMin) / span) * 100));
		},

		get visibleItems() {
			return this.queue.slice(0, this.shown);
		},

		get paramTags() {
			const a = this.answers;
			return [
				this.goalLabels[a.goal] || "Цель не выбрана",
				a.dur !== "any" ? `${a.dur} дней` : null,
				a.contact === "daily" ? "связь каждый день" : a.contact === "24_7" ? "мессенджер 24/7" : null,
				a.diet === "yes" ? "персональная диета" : a.diet === "no" ? "без персональной диеты" : null,
				`до ${(+a.budget).toLocaleString("ru-RU")} ₽`,
				a.med === "yes" ? "мед. образование" : null,
			].filter(Boolean);
		},

		init() {
			const consultants = parseJsonRef(this.$refs.consultantsJson);
			const plans = parseJsonRef(this.$refs.plansJson);
			const meta = parseJsonRef(this.$refs.metaJson) || {};

			if (consultants) this.consultants = consultants;
			if (Array.isArray(plans)) this.plans = plans;

			this.goalLabels = meta.goalLabels || {};
			this.near = meta.near || {};
			this.onlineWeight = meta.onlineWeight || {};
			this.onlineLabels = meta.onlineLabels || {};

			if (meta.budget) {
				this.budgetMin = meta.budget.min ?? 300;
				this.budgetMax = meta.budget.max ?? 40000;
				this.budgetStep = meta.budget.step ?? 100;
				this.answers.budget = meta.budget.default ?? 6000;
			}
		},

		consultant(plan) {
			return this.consultants[plan.c] || {};
		},

		onlineLabel(key) {
			return this.onlineLabels[key] || "";
		},

		go(name) {
			this.screen = name;
			window.scrollTo({ top: 0, behavior: "smooth" });
		},

		openWizard() {
			this.go("wizard");
		},

		back() {
			if (this.step === 1) {
				this.go("entry");
				return;
			}
			this.step -= 1;
		},

		next(skip) {
			if (this.step === 1 && !this.answers.goal && !skip) {
				alert("Выберите цель — это единственный обязательный шаг");
				return;
			}
			if (this.step < 3) {
				this.step += 1;
				return;
			}
			this.runSearch();
		},

		editParams() {
			this.step = 1;
			this.go("wizard");
		},

		showMore() {
			this.shown = Math.min(this.shown + 4, this.queue.length);
		},

		hardFilter(p, budget, ignore) {
			const c = this.consultants[p.c];
			if (!c || p.isService) return false;
			if (!ignore.includes("budget") && p.price > budget) return false;
			if (!ignore.includes("dur") && this.answers.dur !== "any" && p.days !== +this.answers.dur) return false;
			if (!ignore.includes("contact") && this.answers.contact !== "any" && p.contact !== this.answers.contact) return false;
			if (this.answers.diet === "yes" && !p.diet) return false;
			if (this.answers.diet === "no" && p.diet) return false;
			if (!ignore.includes("med") && this.answers.med === "yes" && !c.med) return false;
			if (this.answers.gender !== "any" && c.gender !== this.answers.gender) return false;
			if (this.answers.exp === "6m" && c.monthsOnPlatform < 6) return false;
			return true;
		},

		score(p) {
			const c = this.consultants[p.c];
			const ratings = Object.values(this.consultants).map((x) => x.rating);
			const maxRating = Math.max(...ratings, 0);
			const R = maxRating > 0 ? Math.log(1 + c.rating) / Math.log(1 + maxRating) : 0;
			const Online = this.onlineWeight[c.online] ?? 0;
			const Resp = 1 - Math.min(c.respMin / 240, 1);
			const m = 5;
			const avgDone = 0.78;
			const Quality = (p.done + m * avgDone) / (p.paid + m);
			const Goal = p.goals.includes(this.answers.goal)
				? 1
				: (this.near[this.answers.goal] || []).some((g) => p.goals.includes(g))
					? 0.6
					: 0.3;
			const Price =
				p.price <= this.answers.budget * (2 / 3) ? 1 : p.price <= this.answers.budget ? 0.5 : 0;
			const total = 100 * (0.3 * R + 0.2 * Online + 0.15 * Resp + 0.15 * Quality + 0.1 * Goal + 0.1 * Price);
			return {
				total: +total.toFixed(1),
				R: +R.toFixed(2),
				Online,
				Resp: +Resp.toFixed(2),
				Quality: +Quality.toFixed(2),
				Goal,
				Price,
			};
		},

		buildQueue() {
			this.relaxed = [];
			let ignore = [];
			let pool = this.plans.filter((p) => this.hardFilter(p, this.answers.budget, ignore));
			const relaxSteps = [
				["budget", "бюджет"],
				["dur", "длительность"],
				["contact", "формат связи"],
				["med", "медобразование"],
			];
			let budget = this.answers.budget;
			for (const [key, label] of relaxSteps) {
				if (pool.length >= 3) break;
				ignore = [...ignore, key];
				if (key === "budget") budget = this.budgetMax;
				const bigger = this.plans.filter((p) => this.hardFilter(p, budget, ignore));
				if (bigger.length > pool.length) {
					pool = bigger;
					this.relaxed.push(label);
				}
			}

			const scored = pool.map((p) => ({ p, s: this.score(p) })).sort((a, b) => b.s.total - a.s.total);
			const out = [];
			const used = {};
			const isNewbie = (x) => x.p.done < 3;

			while (scored.length) {
				const batch = [];
				const pool2 = [...scored];
				while (batch.length < 4 && pool2.length) {
					let idx = pool2.findIndex(
						(x) =>
							(used[x.p.c] || 0) < Math.floor(out.length / 4) + 1 && !batch.some((b) => b.p.c === x.p.c)
					);
					if (idx === -1) idx = pool2.findIndex((x) => !batch.some((b) => b.p.c === x.p.c));
					if (idx === -1) break;
					if (batch.length === 3) {
						const nIdx = pool2.findIndex((x) => isNewbie(x) && !batch.some((b) => b.p.c === x.p.c));
						if (nIdx > -1) idx = nIdx;
					}
					const [item] = pool2.splice(idx, 1);
					item.slot = batch.length === 3 && isNewbie(item) ? "newcomer" : "ranked";
					batch.push(item);
					used[item.p.c] = (used[item.p.c] || 0) + 1;
					const gi = scored.indexOf(item);
					if (gi > -1) scored.splice(gi, 1);
				}
				if (!batch.length) break;
				out.push(...batch);
			}
			return out;
		},

		whyFor(item) {
			const p = item.p;
			const c = this.consultant(p);
			const why = [];
			if (p.goals.includes(this.answers.goal)) why.push(this.goalLabels[this.answers.goal]);
			if (this.answers.dur !== "any" && p.days === +this.answers.dur) {
				why.push(`${p.days} дней — как вы просили`);
			}
			if (p.contactLabel && p.contactLabel !== "—") why.push(p.contactLabel);
			if (this.answers.diet === "yes" && p.diet) why.push("Есть персональная диета");
			if (this.answers.diet === "no" && !p.diet) why.push("Без персональной диеты");
			if (c.online === "online") why.push("Консультант сейчас онлайн");
			else if (c.online === "hour") why.push("Был в сети час назад");
			if (p.done >= 5) why.push(`${p.done} человек прошли план`);
			if (c.med && this.answers.med === "yes") why.push("Медицинское образование");
			return why;
		},

		runSearch() {
			this.queue = this.buildQueue();
			this.shown = Math.min(4, this.queue.length);
			this.go("results");
		},
	}));
});
