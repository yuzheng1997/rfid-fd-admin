<template>
  <div class="region-cascader">
    <el-cascader
      ref="cascader"
      v-model="selectedValues"
      :props="cascaderProps"
      :placeholder="placeholder"
      :style="customStyle"
      clearable
      filterable
      @change="handleChange"
      @expand-change="handleExpandChange"
    />
  </div>
</template>

<script>
import { getCountries, getStates, getCities } from '@/api/common/region'

export default {
  name: 'RegionCascader',
  props: {
    // v-model binding
    value: {
      type: Array,
      default: () => []
    },
    // Placeholder text
    placeholder: {
      type: String,
      default: '请选择国家/省/市'
    },
    // Custom style
    customStyle: {
      type: String,
      default: 'width: 100%'
    },
    // Whether to return full path labels
    returnLabels: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedValues: this.value || [],
      cascaderProps: {
        lazy: true,
        lazyLoad: this.lazyLoad,
        value: 'value',
        label: 'label',
        children: 'children',
        checkStrictly: false,
        emitPath: true
      }
    }
  },
  watch: {
    value(newVal) {
      this.selectedValues = newVal || []
    }
  },
  methods: {
    async lazyLoad(node, resolve) {
      const { level } = node
      const { data } = node

      try {
        let items = []

        // Level 0: Load countries
        if (level === 0) {
          const res = await getCountries()
          items = Array.isArray(res) ? res : (res && res.data) || []
          // Level 1: Load states/provinces for selected country
        } else if (level === 1) {
          const countryId = data.value
          const res = await getStates(countryId)
          items = Array.isArray(res) ? res : (res && res.data) || []
          // Level 2: Load cities for selected state/province
        } else if (level === 2) {
          const stateId = data.value
          const res = await getCities(stateId)
          items = Array.isArray(res) ? res : (res && res.data) || []
        }

        // Transform data for cascader
        const nodes = items.map(item => ({
          ...item,
          leaf: level >= 2 // No children after city level
        }))

        resolve(nodes)
      } catch (error) {
        console.error('Failed to load region data:', error)
        this.$message.error('加载地区数据失败')
        resolve([])
      }
    },

    handleChange(value) {
      this.$emit('input', value)
      this.$emit('change', value)

      // If returnLabels is true, also emit labels
      if (this.returnLabels && value && value.length > 0) {
        const cascader = this.$refs.cascader
        const nodes = cascader && cascader.getCheckedNodes ? cascader.getCheckedNodes() : []
        if (nodes && nodes.length > 0) {
          const node = nodes[0]
          const pathLabels = node.pathLabels || []
          const path = node.path || []
          this.$emit('change-detail', {
            values: value,
            labels: pathLabels,
            country: { value: path[0], label: pathLabels[0] },
            state: { value: path[1], label: pathLabels[1] },
            city: { value: path[2], label: pathLabels[2] }
          })
        }
      }
    },

    handleExpandChange(value) {
      this.$emit('expand-change', value)
    },

    // Public method to get selected details
    getSelectedDetails() {
      const cascader = this.$refs.cascader
      const nodes = cascader && cascader.getCheckedNodes ? cascader.getCheckedNodes() : []
      if (nodes && nodes.length > 0) {
        const node = nodes[0]
        const pathLabels = node.pathLabels || []
        const path = node.path || []
        return {
          values: this.selectedValues,
          labels: pathLabels,
          country: { value: path[0], label: pathLabels[0] },
          state: { value: path[1], label: pathLabels[1] },
          city: { value: path[2], label: pathLabels[2] }
        }
      }
      return null
    }
  }
}
</script>

<style scoped>
.region-cascader {
  display: inline-block;
}
</style>
