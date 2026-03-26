<template>
  <el-card class="box-card" shadow="never">
    <div slot="header" class="clearfix">
      <span style="font-weight: bold;">最近关键操作记录</span>
    </div>
    <div class="log-list">
      <div v-for="(item, index) in list" :key="index" class="log-item">
        <div class="log-time">{{ item.time }}</div>
        <div class="log-content">
          <span class="log-operator">{{ item.operator }}</span>
          <span class="log-action">{{ item.action }}</span>
          <span class="log-target">{{ item.target }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      list: [
        { time: '2026-03-23 15:45:12', operator: '管理员', action: '执行了出库操作', target: '气瓶: GP-2026-0005' },
        { time: '2026-03-23 14:30:45', operator: '加气站A', action: '提交了加气记录', target: '数量: 25次' },
        { time: '2026-03-23 11:20:10', operator: '巡检员', action: '标记了故障气瓶', target: 'GP-2026-0004' },
        { time: '2026-03-23 09:15:33', operator: '系统自动', action: '生成了年检提醒', target: '3个气瓶' },
        { time: '2026-03-22 17:50:22', operator: '分销商B', action: '完成了配送确认', target: '订单: DO-9988' }
      ]
    }
  }
}
</script>

<style scoped>
.log-list {
  padding: 10px 0;
}
.log-item {
  margin-bottom: 15px;
  border-left: 2px solid #e6ebf5;
  padding-left: 15px;
  position: relative;
}
.log-item::after {
  content: '';
  position: absolute;
  left: -5px;
  top: 5px;
  width: 8px;
  height: 8px;
  background: #409eff;
  border-radius: 50%;
}
.log-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}
.log-content {
  font-size: 14px;
}
.log-operator {
  color: #409eff;
  margin-right: 5px;
}
.log-action {
  color: #606266;
  margin-right: 5px;
}
.log-target {
  color: #303133;
  font-weight: bold;
}
</style>
