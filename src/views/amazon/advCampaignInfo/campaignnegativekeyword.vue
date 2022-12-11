<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="94px"
    >
      <el-form-item label="状态" prop="state">
        <el-select
          v-model="queryParams.state"
          placeholder="请选择状态"
          clearable
          size="small"
          style="width: 90px"
        >
          <el-option
            v-for="item in stateList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="否定关键词">
        <el-input
          v-model="queryParams.keywordText"
          placeholder="请输入否定关键词"
          clearable
          size="small"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          @click="batchUpdateState"
          >批量修改状态</el-button
        >
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          @click="batchAddKeyword"
          >批量新增</el-button
        >
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="tableList"
      @selection-change="changeCheckBoxValue"
    >
      <el-table-column type="selection" width="65"> </el-table-column>
      <el-table-column
        label="否定关键词"
        align="center"
        prop="keywordText"
        width="370"
      />
      <el-table-column
        label="匹配方式"
        align="center"
        prop="matchType"
        :formatter="formatMatchType"
        width="100"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="state"
        :formatter="formatState"
      />
      <el-table-column label="创建时间" align="center" prop="creationDate">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.creationDate) }}</span>
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

    <!-- 修改关键词状态 -->
    <el-dialog
      title="修改否定搜索词状态"
      :visible.sync="batchState"
      width="350px"
      append-to-body
    >
      <el-form
        :model="stateForm"
        ref="stateForm"
        label-width="70px"
        class="demo-ruleForm"
        style="padding-left: 30px"
      >
        <el-form-item label="状态" prop="state">
          <el-select
            v-model="stateForm.state"
            placeholder="请选择状态"
            clearable
            size="small"
            style="width: 140px; padding-bottom: 10px"
          >
            <el-option
              v-for="item in deleteList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormState()">确定</el-button>
        <el-button @click="batchState = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 添加关键词 -->
    <el-dialog
      title="添加广告活动关键词"
      :visible.sync="batchAddKey"
      width="900px"
      append-to-body
    >
      <el-form
        :model="addKeyForm"
        ref="addKeyForm"
        label-width="70px"
        class="demo-ruleForm"
      >
        <el-form-item label="匹配方式" prop="matchTypeBox">
          <el-checkbox
            v-model="negativeExact"
            value="1"
            label="精准否定"
            style="margin-top: 7px"
          ></el-checkbox>
          <el-checkbox
            v-model="negativePhrase"
            value="2"
            label="否定短语"
          ></el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-input
            type="textarea"
            :rows="15"
            resize="none"
            size="mini"
            style="width: 340px"
            placeholder="请输入关键词列表。如果是多个，使用换行符隔开"
            v-model="textarea"
          >
          </el-input>

          <el-table
            :data="addKeywordList"
            style="width: 440px; float: right"
            border
            max-height="327"
            height="327"
          >
            <el-table-column
              label="关键词"
              align="center"
              prop="keywordText"
              width="170"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="匹配类型"
              align="center"
              prop="matchTypeText"
              width="80"
            />
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  @click="deleteKeyword(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item>
          <el-button
            type="success"
            style="margin-left: 208px"
            @click="rightAddKeyword"
            >添加关键词 ⟹</el-button
          >
          <el-button
            type="success"
            style="margin-left: 347px"
            @click="rightDeleteKeyword"
            >一键删除</el-button
          >
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormAddKey()">确定</el-button>
        <el-button @click="batchAddKey = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  campaignnegativeKeywordList,
  updateCampaignNegativeKeywordList,
  addCampaignNegativeKeywordList,
} from "@/api/amazon/campaignsinfo";

export default {
  name: "negativeKeyword",
  data() {
    return {
      stateList: [
        { value: "1", label: "已启用" },
        { value: "2", label: "已暂停" },
        { value: "3", label: "已存档" },
      ],
      deleteList: [{ value: "1", label: "删除" }],
      matchTypeList: [
        { value: "1", label: "否定精准" },
        { value: "2", label: "否定短语" },
      ],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 字典表格数据
      tableList: [],
      addKeywordList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        state: "1",
        campaignId: undefined,
        keywordText:undefined,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined,
      },
      checkBoxData: [],
      batchState: false,
      batchAddKey: false,
      negativePhrase: false,
      negativeExact: false,
      textarea: null,
      // 表单参数
      stateForm: {
        state: undefined,
      },
      addKeyForm: undefined,
    };
  },
  created() {
    let cam = this.$route.params.campaignId.split(",");
    this.queryParams.campaignId = cam[0];
    this.queryParams.startDate = cam[1];
    this.queryParams.endDate = cam[2];
    this.queryParams.dateTime = [cam[1], cam[2]];
    //this.initTime();
    this.getList();
  },
  methods: {
    formatState(row, column, cellValue, index) {
      for (let i = 0; i < this.stateList.length; i++) {
        if (cellValue == this.stateList[i].value) {
          return this.stateList[i].label;
        }
      }
      return "";
    },
    formatMatchType(row, column, cellValue, index) {
      for (let i = 0; i < this.matchTypeList.length; i++) {
        if (cellValue == this.matchTypeList[i].value) {
          return this.matchTypeList[i].label;
        }
      }
      return "";
    },

    changeCheckBoxValue(val) {
      this.checkBoxData = [];
      val.forEach((column, index) => {
        let batchKeywordParam = {
          keywordId: column.keywordId,
          state: column.state,
        };
        this.checkBoxData.push(batchKeywordParam);
      });
    },
    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      campaignnegativeKeywordList(this.queryParams).then((response) => {
        this.tableList = response.list;
        this.total = response.total;
        this.loading = false;
      });
    },
    initTime() {
      const now = new Date();
      const day7 = new Date(now.getTime() - 8 * 3600 * 1000 * 24);
      const yesteday = new Date(now.getTime() - 3600 * 1000 * 24);
      let time1 = this.parseTime(day7, "{y}-{m}-{d}");
      let time2 = this.parseTime(yesteday, "{y}-{m}-{d}");
      this.queryParams.dateTime = [time1, time2];
      this.queryParams.startDate = this.queryParams.dateTime[0];
      this.queryParams.endDate = this.queryParams.dateTime[1];
      this.getTime();
    },
    getTime() {
      if (
        this.queryParams.dateTime != undefined &&
        this.queryParams.dateTime != null
      ) {
        this.queryParams.startDate = this.queryParams.dateTime[0];
        this.queryParams.endDate = this.queryParams.dateTime[1];
      } else {
        this.queryParams.startDate = null;
        this.queryParams.endDate = null;
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.handleQuery();
    },

    batchAddKeyword() {
      //打开批量添加关键词弹窗
      this.batchAddKey = true;
      this.addKeywordList = null;
      this.textarea = null;
      this.negativeExact = null;
      this.negativePhrase = null;
    },
    rightAddKeyword() {
      //向右添加关键词
      if (this.textarea != null) {
        let split = this.textarea.split(/\n/);
        let addKeywordListTo = [];
        split.forEach((column, index) => {
          if (this.negativeExact && column != "") {
            let batchKeywordParam = {
              keywordText: column,
              matchType: "negativeExact",
              matchTypeText: "否定精准",
              campaignId: this.queryParams.campaignId,
            };
            addKeywordListTo.push(batchKeywordParam);
          }
          if (this.negativePhrase && column != "") {
            let batchKeywordParam = {
              keywordText: column,
              matchType: "negativePhrase",
              matchTypeText: "否定短语",
              campaignId: this.queryParams.campaignId,
            };
            addKeywordListTo.push(batchKeywordParam);
          }
          this.addKeywordList = addKeywordListTo;
        });
      }
    },
    deleteKeyword(row) {
      //删除关键词
      let addKeywordListTo = this.addKeywordList;
      let index = addKeywordListTo.findIndex(function (item) {
        return item.id === row.id;
      });
      addKeywordListTo.splice(index, 1);
      this.addKeywordList = addKeywordListTo;
    },
    rightDeleteKeyword() {
      //一键删除
      this.addKeywordList = [];
    },
    batchUpdateState() {
      if (this.checkBoxData.length <= 0) {
        this.$message.warning("请勾选列表里的关键词");
      } else {
        //打开弹窗
        this.stateForm.state = this.stateList[0].value;
        this.batchState = true;
      }
    },

    submitFormState() {
      this.checkBoxData.forEach((column, index) => {
        column.state = this.stateForm.state;
      });
      updateCampaignNegativeKeywordList(this.checkBoxData).then((response) => {
        if (response.code === 200) {
          if (response.data != null && response.data != "") {
            this.$message.error("批量修改状态成功部分失败：" + response.data);
          } else {
            this.$message.success("批量修改状态成功");
          }
          this.batchState = false;
          this.getList();
        }
      });
    },
    submitFormAddKey() {
      if (
        this.addKeywordList === null ||
        this.addKeywordList.length <= 0
      ) {
        this.$message.warning("没有需要添加的关键字");
        return;
      }
      addCampaignNegativeKeywordList(this.addKeywordList).then((response) => {
        if (response.code === 200) {
          if (response.data != null && response.data != "") {
            this.$message.error("批量添加关键词部分失败：" + response.data);
          } else {
            this.$message.success("批量添加关键词成功");
          }
          this.batchAddKey = false;
          this.getList();
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-form-item--medium {
  line-height: 20px !important;
}
::v-deep .el-form-item__content {
  line-height: 20px !important;
}
::v-deep .el-textarea__inner {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif !important;
  font-size: 14px;
  height: 327px !important;
}
</style>
