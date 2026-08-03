// components/item-card/item-card.js
Component({
  properties: {
    item: { type: Object, value: {} },
    showProgress: { type: Boolean, value: true },
  },
  methods: {
    onTap() {
      this.triggerEvent('select', { item: this.data.item });
    },
  },
});
