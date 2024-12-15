<template>
  <div class="app-container">

    <div class="filter-container">
      <!-- 选品负责人筛选 -->
      <el-select
        v-model="filters.productManager"
        placeholder="选品负责人"
        clearable
        class="filter-item"
        style="width: 130px; margin-right: 10px;"
        @change="handleFilter"
      >
        <el-option
          label="全部"
          value=""
        />
        <el-option
          v-for="item in productManagerOptions"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>

      <!-- 选品判断筛选 -->
      <el-select
        v-model="filters.selectionStatus"
        placeholder="选品判断"
        clearable
        class="filter-item"
        style="width: 130px; margin-right: 10px;"
        @change="handleFilter"
      >
        <el-option
          label="全部"
          value=""
        />
        <el-option
          v-for="(value, key) in selectionStatusMap"
          :key="key"
          :label="value.text"
          :value="Number(key)"
        />
      </el-select>

      <el-button class="filter-item" type="primary" icon="el-icon-document-add" @click="handleCreate">
        {{ $t('table.import') }}
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
    >
      <el-table-column label="序号" width="120" align="center" fixed>
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
          <el-button
            type="text"
            icon="el-icon-edit"
            class="edit-icon"
            @click="startEdit(scope.row)"
            :class="{ 'editing': scope.row.editing }"
          />
        </template>
      </el-table-column>

      <el-table-column label="选品负责人" min-width="100" fixed>
        <template slot-scope="scope">
          <el-input
            v-if="scope.row.editing"
            v-model="scope.row.productManager"
            size="small"
          />
          <span v-else>{{ scope.row.productManager }}</span>
        </template>
      </el-table-column>

      <el-table-column 
        label="首次录入时间" 
        min-width="170" 
        fixed
        sortable="custom"
        prop="createTime"
      >
        <template slot-scope="scope">
          {{ formatDate(scope.row.createTime, true) }}
        </template>
      </el-table-column>

      <el-table-column 
        label="数据更新时间" 
        min-width="170" 
        fixed
        sortable="custom"
        prop="updateTime"
      >
        <template slot-scope="scope">
          {{ formatDate(scope.row.updateTime, true) }}
        </template>
      </el-table-column>

      <el-table-column 
        label="更新销量" 
        min-width="120" 
        fixed
        sortable="custom"
        prop="salesVolume"
      >
        <template slot-scope="scope">
          {{ scope.row.salesVolume }}
        </template>
      </el-table-column>

      <el-table-column label="选品判断" min-width="140" fixed>
        <template slot-scope="scope">
          <el-select
            v-if="scope.row.editing"
            v-model="scope.row.selectionStatus"
            size="small"
          >
            <el-option
              v-for="(value, key) in selectionStatusMap"
              :key="key"
              :label="value.text"
              :value="Number(key)"
            />
          </el-select>
          <el-tag v-else :type="getSelectionStatusType(scope.row.selectionStatus)">
            {{ getSelectionStatusText(scope.row.selectionStatus) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="备注" min-width="150" fixed>
        <template slot-scope="scope">
          <el-input
            v-if="scope.row.editing"
            v-model="scope.row.remarks"
            type="textarea"
            size="small"
          />
          <span v-else>{{ scope.row.remarks }}</span>
        </template>
      </el-table-column>

      <el-table-column label="商品信息" min-width="350">
        <template slot-scope="scope">
          {{ scope.row.productName }}
        </template>
      </el-table-column>

      <el-table-column prop="category" label="类目" width="300" />

      <el-table-column label="kalodata链接" min-width="120">
        <template slot-scope="scope">
          <a :href="scope.row.kalodataUrl" target="_blank" class="link-style">跳转链接</a>
        </template>
      </el-table-column>

      <el-table-column label="价格" width="70" align="right">
        <template slot-scope="scope">
          {{ scope.row.price }}
        </template>
      </el-table-column>

      <el-table-column 
        label="上架时间" 
        width="120" 
        align="center"
        sortable="custom"
        prop="listingDate"
      >
        <template slot-scope="scope">
          {{ formatDate(scope.row.listingDate) }}
        </template>
      </el-table-column>

      <el-table-column 
        prop="salesVolume" 
        label="销量" 
        width="80" 
        align="right"
        sortable="custom"
      />

      <el-table-column 
        label="平均销售价" 
        width="130" 
        align="right"
        sortable="custom"
        prop="averagePrice"
      >
        <template slot-scope="scope">
          {{ scope.row.averagePrice }}
        </template>
      </el-table-column>
      <el-table-column prop="influencerCount" label="达人数量" width="80" align="right" />

      <el-table-column label="达人出单率" width="100" align="right">
        <template slot-scope="scope">
          {{ scope.row.influencerOrderRate && scope.row.influencerOrderRate !== '-' ? scope.row.influencerOrderRate + '%' : '' }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加上传文件的对话框 -->
    <el-dialog title="上传Excel" :visible.sync="uploadDialogVisible" width="30%">
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :http-request="handleUpload"
        :before-upload="beforeUpload"
        accept=".xlsx, .xls"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只能上传 excel 文件</div>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script>
import { getProductList, importProducts, updateProduct } from '@/api/product'
import { parseTime } from '@/utils'
import waves from '@/directive/waves' // waves directive

export default {
  name: 'ProductTable',
  directives: { waves },
  data() {
    return {
      list: null,
      listLoading: true,
      downloadLoading: false,
      uploadDialogVisible: false, // 控制上传对话框的显示
      tableId: null, // 存储tableId
      selectionStatusMap: {
        0: { text: '尚未处理', type: 'info' },
        1: { text: '入选待拍', type: 'success' },
        2: { text: '备选高优先', type: 'warning' },
        3: { text: '备选低优先', type: '' },
        4: { text: '放弃', type: 'danger' },
        5: { text: '其他A', type: 'info' },
        6: { text: '其他B', type: 'info' }
      },
      originalList: [], // 保存原始数据用于重置排序
      filters: {
        productManager: '',
        selectionStatus: ''
      },
      productManagerOptions: [], // 将从数据中提取
      filteredList: [], // 用于存储筛选后的数据
      currentEditingRow: null, // 当前正在编辑的行
    }
  },
  created() {
    // 获取tableId并保存
    const pathParts = this.$route.path.split('/')
    this.tableId = pathParts[pathParts.length - 1]
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      try {
        const pathParts = this.$route.path.split('/')
        const tableId = pathParts[pathParts.length - 1]
        const response = await getProductList(tableId)
        this.list = response.data
        this.originalList = [...response.data]
        this.filteredList = [...response.data]
        
        // 提取所有不重复的选品负责人
        this.productManagerOptions = [...new Set(
          this.list
            .map(item => item.productManager)
            .filter(item => item) // 过滤掉空值
        )]
      } catch (error) {
        console.error('获取产品列表失败:', error)
      } finally {
        this.listLoading = false
      }
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['商品信息', '类目', 'KaloData链接', '价格', '上架时间', '销量', '平均销售价', '佣金比例', '成交金额', '直播成交金额', '视频成交金额', '商城成交金额', '达人数量', '达人出单率']
        const filterVal = ['productName', 'category', 'kalodataUrl', 'price', 'listingDate', 'salesVolume', 'averagePrice', 'commissionRate', 'totalAmount', 'liveTransactionAmount', 'videoTransactionAmount', 'mallTransactionAmount', 'influencerCount', 'influencerOrderRate']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '商品数据',
          autoWidth: true
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'listingDate') {
          return this.formatDate(v[j])
        }
        if (j === 'commissionRate' || j === 'influencerOrderRate') {
          return v[j] && v[j] !== '-' ? v[j] : ''
        }
        return v[j]
      }))
    },
    handleCreate() {
      this.uploadDialogVisible = true
    },
    // 上传前的验证
    beforeUpload(file) {
      const isExcel = /\.(xlsx|xls)$/.test(file.name.toLowerCase())
      if (!isExcel) {
        this.$message.error('只能上传 Excel 文件!')
        return false
      }
      return true
    },
    // 处理文件上传
    async handleUpload({ file }) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tableId', this.tableId)

      try {
        const response = await importProducts(formData)
        
        if (response.code === 200) {
          this.$message.success('上传成功')
          this.uploadDialogVisible = false
          this.fetchData() // 刷新数据
        } else {
          this.$message.error(response.message || '上传失败')
        }
      } catch (error) {
        console.error('上传失败:', error)
        this.$message.error('上传失败，请重试')
      }
    },
    // 添加 handleFilter 方法
    handleFilter() {
      this.filteredList = this.originalList.filter(item => {
        const matchProductManager = !this.filters.productManager || 
          item.productManager === this.filters.productManager
        
        const matchSelectionStatus = this.filters.selectionStatus === '' || 
          item.selectionStatus === this.filters.selectionStatus

        return matchProductManager && matchSelectionStatus
      })
      
      this.list = this.filteredList
    },
    // 修改时间格式化方法
    formatDate(date, showTime = false) {
      if (!date) return ''
      // 直接使用原始时间字符串，让浏览器自动处理时区
      const localDate = new Date(date)
      return parseTime(localDate, showTime ? '{y}-{m}-{d} {h}:{i}:{s}' : '{y}-{m}-{d}')
    },
    getSelectionStatusText(status) {
      return this.selectionStatusMap[status]?.text || status
    },
    getSelectionStatusType(status) {
      return this.selectionStatusMap[status]?.type || ''
    },
    handleSortChange({ prop, order }) {
      if (!order) {
        this.list = [...this.originalList] // 重置为原始数据
        return
      }

      this.list.sort((a, b) => {
        let valueA, valueB

        // 处理日期类型
        if (['createTime', 'updateTime', 'listingDate'].includes(prop)) {
          valueA = new Date(a[prop] || 0).getTime()
          valueB = new Date(b[prop] || 0).getTime()
        }
        // 处理数字类型
        else if (['salesVolume', 'averagePrice'].includes(prop)) {
          valueA = parseFloat(a[prop] || 0)
          valueB = parseFloat(b[prop] || 0)
        }
        // 其他类型
        else {
          valueA = a[prop]
          valueB = b[prop]
        }

        // 升序
        if (order === 'ascending') {
          return valueA > valueB ? 1 : -1
        }
        // 降序
        return valueA < valueB ? 1 : -1
      })
    },
    // 开始编辑
    startEdit(row) {
      // 如果有正在编辑的行，先保存它
      if (this.currentEditingRow && this.currentEditingRow !== row) {
        this.handleEdit(this.currentEditingRow)
      }
      
      // 保存原始数据，用于取消编辑
      row.originalData = {
        productManager: row.productManager,
        selectionStatus: row.selectionStatus,
        remarks: row.remarks
      }
      this.$set(row, 'editing', true)
      this.currentEditingRow = row
    },

    // 处理行点击
    handleRowClick(row) {
      if (this.currentEditingRow && this.currentEditingRow !== row) {
        this.handleEdit(this.currentEditingRow)
      }
    },

    // 处理编辑
    async handleEdit(row) {
      try {
        const response = await updateProduct(row.id, {
          productManager: row.productManager,
          selectionStatus: row.selectionStatus,
          remarks: row.remarks
        })

        if (response.code === 200) {
          this.$message.success('更新成功')
          this.$set(row, 'editing', false)
          this.currentEditingRow = null
        } else {
          // 恢复原始数据
          Object.assign(row, row.originalData)
          this.$message.error(response.message || '更新失败')
        }
      } catch (error) {
        // 恢复原始数据
        Object.assign(row, row.originalData)
        console.error('更新失败:', error)
        this.$message.error('更新失败，请重试')
      }
    }
  }
}
</script>

<style scoped>
.el-row {
  font-size: 13px;
}
.upload-demo {
  text-align: center;
}
.link-style {
  color: #409EFF;
  text-decoration: none;
}
.link-style:hover {
  color: #66b1ff;
  text-decoration: underline;
}
.el-tag {
  margin-right: 10px;
}
.edit-icon {
  margin-left: 8px;
  font-size: 14px;
  color: #909399;
}
.edit-icon:hover {
  color: #409EFF;
}
.edit-icon.editing {
  color: #409EFF;
}
.editable-cell {
  cursor: default;
  display: inline;
  min-height: auto;
  padding: 0;
}
.editable-cell:hover {
  background-color: transparent;
}
.editable-cell:empty::before {
  content: none;
}
.filter-container {
  padding-bottom: 10px;
  display: flex;
  align-items: center;
}
.filter-item {
  display: inline-block;
  vertical-align: middle;
}
</style>
