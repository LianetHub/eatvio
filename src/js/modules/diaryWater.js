document.addEventListener('alpine:init', () => {
    window.Alpine.data('diaryWater', (goal) => ({
        open: false,
        ml: '',
        time: '',
        timeEdited: false,
        error: '',
        total: 0,
        count: 0,
        goal: Number(goal),

        init() {
            this.useCurrentTime();
            this.$nextTick(() => {
                if (this.empty) {
                    this.$refs.entries.replaceChildren();
                }
                this.sync();
            });
        },

        useCurrentTime() {
            this.time = new Date().toTimeString().slice(0, 5);
            this.timeEdited = false;
        },

        timeToMinutes(time) {
            return Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
        },

        sync() {
            const rows = [...this.$refs.entries.querySelectorAll('[data-water-time]')]
                .sort((a, b) => a.dataset.waterTime.localeCompare(b.dataset.waterTime));

            rows.forEach((row) => this.$refs.entries.append(row));

            this.total = rows.reduce((sum, row) => sum + Number(row.dataset.ml), 0);
            this.count = rows.length;

            let gap = 0;
            rows.forEach((row, index) => {
                if (!index) return;
                const diff = this.timeToMinutes(row.dataset.waterTime)
                    - this.timeToMinutes(rows[index - 1].dataset.waterTime);
                gap = Math.max(gap, diff);
            });

            this.$dispatch('diary:water', {
                total: this.total,
                count: this.count,
                average: this.count ? Math.round(this.total / this.count) : 0,
                gap,
                last: rows.at(-1)?.dataset.waterTime || '—',
            });
        },

        add(value) {
            if (!this.editable) return;

            const amount = Number(value);
            if (!Number.isFinite(amount) || amount < 1 || amount > 3000) {
                this.error = 'Введите объём от 1 до 3 000 мл';
                return;
            }

            if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(this.time)) {
                this.error = 'Укажите время от 00:00 до 23:59';
                return;
            }

            let row = [...this.$refs.entries.children]
                .find((item) => item.dataset.waterTime === this.time);

            if (!row) {
                row = this.$refs.entry.content.firstElementChild.cloneNode(true);
                row.dataset.waterTime = this.time;
                row.dataset.ml = 0;
                this.$refs.entries.append(row);
            }

            row.dataset.ml = Number(row.dataset.ml) + Math.round(amount);
            row.querySelector('b').textContent = this.time;
            row.querySelector('[data-volume]').textContent = row.dataset.ml + ' мл';
            row.querySelector('button').setAttribute('aria-label', 'Удалить воду в ' + this.time);

            this.$refs.entries.querySelectorAll('.is-new').forEach((entry) => {
                entry.classList.remove('is-new');
            });
            row.classList.add('is-new');

            this.error = '';
            this.ml = '';
            this.open = true;
            this.sync();
        },

        remove(event) {
            if (!this.editable) return;

            const row = event.target.closest('button')?.closest('[data-water-time]');
            if (!row || !this.$refs.entries.contains(row)) return;

            row.remove();
            this.sync();
        },
    }));
});
