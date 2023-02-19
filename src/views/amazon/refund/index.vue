<template>
  <div class="app-container" style="margin-left: 50px">
    <el-descriptions class="margin-top" title="申请退款" :column="6" size="">
      <el-descriptions-item label="用户名称">{{
        user.userName
      }}</el-descriptions-item>
      <el-descriptions-item label="用戶昵称">{{
        user.nickName
      }}</el-descriptions-item>
    </el-descriptions>
    <el-descriptions class="margin-top" :column="6" size="">
      <el-descriptions-item label="手机号码">{{
        user.phonenumber
      }}</el-descriptions-item>
      <el-descriptions-item label="账户余额"
        >{{ user.balance }}&nbsp;元 <el-button type="text" @click="fresh()" style="padding:1px 20px">刷新余额</el-button></el-descriptions-item>
    </el-descriptions>
    <el-table v-loading="loading" :data="recordList" style="margin-top:20px;">
      <!-- <el-table-column label="用户ID" align="center" prop="userId" /> -->
      <el-table-column label="用户名称" align="center" prop="userName" />
      <el-table-column label="记录类型" align="center" prop="recordType">
        <template slot-scope="scope">
          <span v-if="scope.row.recordType == '0'">充值记录</span>
          <span v-if="scope.row.recordType == '1'">消费记录</span>
          <span v-if="scope.row.recordType == '2'">退款记录</span>
        </template>
      </el-table-column>
      <el-table-column label="消费金额(元)" align="center" prop="money" />
      <!-- <el-table-column label="退款金额(元)" align="center" prop="backMoney" /> -->
      <el-table-column label="记录时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{
            parseTime(scope.row.createTime, "{y}-{m}-{d} {h}:{i}:{s}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-refresh-right"
            @click="refund(scope.row)"
          >申请退款</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>
<script>
import { getUserProfile } from "@/api/system/user";
import { listRecord } from "@/api/system/record";
import { refund } from "@/api/amazon/wxpay";
import { stringify } from "querystring";
export default {
  name: "refund",
  components: {},
  data() {
    return {
      //登录人信息
      user: {},
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 费用明细表格数据
      recordList: [],
      // 弹出层标题
      title: "",
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        userName: null,
        recordType: '0',
      },
    };
  },
  created() {
    this.fresh()
  },
  methods: {
    fresh() { 
      this.getUser()
      this.getList()
    },
    refund(row) { 
      if (parseInt(this.user.balance)<1) { 
        this.$modal.msgError("余额不足，无法退款");
        return false;
      }
      this.$confirm('余额不足时，仅部分退款，确定申请退款吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        refund(row.recordId).then((respnse) => { 
          console.log(respnse)
        })
      }).catch(() => {});
    },
    getUser() {
      getUserProfile().then((response) => {
        this.user = response.data;
      });
    },
    getList() {
      this.loading = true;
      listRecord(this.queryParams).then((response) => {
        this.recordList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
  },
};
</script>