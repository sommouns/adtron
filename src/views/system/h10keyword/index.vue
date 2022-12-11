<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="120px">
      <el-form-item label="KeywordCount" prop="kwCount">
        <el-input
          v-model="queryParams.kwCount"
          placeholder="Return Keyword Count"
          clearable
          size="small"
        />
      </el-form-item>
      <el-form-item label="adGroupId" prop="adGroupId">
          <el-input
            v-model="queryParams.adGroupId"
            placeholder="adGroupId"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
    <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-upload2"
          size="mini"
          @click="handleImport"
          v-hasPermi="['system:h10keyword:import']"
        >导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:h10keyword:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleAllDelete"
          v-hasPermi="['system:h10keyword:remove']"
        >清空</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="h10keywordList" >
      <el-table-column label="Keyword Phrase" width="180" align="center" prop="keywordPhrase" />
      <el-table-column label="Cerebro IQ Score" align="center" prop="cerebroIqScore" />
      <el-table-column label="Search Volume" align="center" prop="searchVolume" />
      <el-table-column label="Search Volume Trend" align="center" prop="searchVolumeTrend" />
      <el-table-column label="Sponsored ASINs" align="center" prop="sponsoredAsins" />
      <el-table-column label="Competing Products" align="center" prop="competingProducts" />
      <el-table-column label="CPR" align="center" prop="cpr" />
      <el-table-column label="Title Density" align="center" prop="titleDensity" />
      <el-table-column label="Amazon Recommended" align="center" prop="amazonRecommended" />
      <el-table-column label="Sponsored" align="center" prop="sponsored" />
      <el-table-column label="Organic" align="center" prop="organic" />
      <el-table-column label="Amazon Rec. Rank" align="center" prop="amazonRecRank" />
      <el-table-column label="Sponsored Rank" align="center" prop="sponsoredRank" />
      <el-table-column label="Organic Rank" align="center" prop="organicRank" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:h10keyword:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!--导入对话框-->
    <el-dialog
      title="H10关键词导入"
      :visible.sync="upload.open"
      width="400px"
      append-to-body
    >
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <span>仅允许导入xls、xlsx格式文件。</span>
          <!-- <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link> -->
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listH10keyword,delAllH10keyword, delH10keyword } from "@/api/system/h10keyword";
import { getToken } from "@/utils/auth";
export default {
  name: "H10keyword",
  data() {
    return {
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
      // H10关键词筛选库表格数据
      h10keywordList: [],
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/h10keyword/import",
      },
      matchType:[],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        kwCount:null,
        adGroupId:null,
        keywordPhrase: null,
        cerebroIqScoreMin: null,
        cerebroIqScoreMax: null,
        searchVolumeMin: null,
        sponsoredAsinsMin: null,
        competingProductsMin: null,
        cprMin: null,
        titleDensityMin: null,
        searchVolumeMax: null,
        sponsoredAsinsMax: null,
        competingProductsMax: null,
        cprMax: null,
        titleDensityMax: null,
        amazonRecommended: null,
        sponsored: null,
        organic: null,
        amazonRecRankMin: null,
        sponsoredRankMin: null,
        organicRankMin: null,
        amazonRecRankMax: null,
        sponsoredRankMax: null,
        organicRankMax: null,
        wordCountMin:null,
        wordCountMax:null,
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询H10关键词筛选库列表 */
    getList() {
      this.loading = true;
      this.queryParams.organic = null;
      this.queryParams.sponsored = null;
      this.queryParams.amazonRecommended = null;
      this.matchType.forEach((item,index,array)=>{
          if(item=='1'){
            this.queryParams.organic = 1;
          }
          if(item=='2'){
            this.queryParams.sponsored = 1;
          }
          if(item=='3'){
            this.queryParams.amazonRecommended = 1;
          }
       });
      if(this.queryParams.kwCount != null && this.queryParams.kwCount.length>0){
        this.queryParams.pageSize = this.queryParams.kwCount;
      }else{
        this.queryParams.pageSize = 10;
      }
      listH10keyword(this.queryParams).then(response => {
        this.h10keywordList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.matchType = null;
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        keywordPhrase: null,
        cerebroIqScoreMin: null,
        cerebroIqScoreMax: null,
        searchVolumeMin: null,
        sponsoredAsinsMin: null,
        competingProductsMin: null,
        cprMin: null,
        titleDensityMin: null,
        searchVolumeMax: null,
        sponsoredAsinsMax: null,
        competingProductsMax: null,
        cprMax: null,
        titleDensityMax: null,
        amazonRecommended: null,
        sponsored: null,
        organic: null,
        amazonRecRankMin: null,
        sponsoredRankMin: null,
        organicRankMin: null,
        amazonRecRankMax: null,
        sponsoredRankMax: null,
        organicRankMax: null,
        wordCountMin:null,
        wordCountMax:null,
      }
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 清空按钮操作 */
    handleAllDelete() {
      this.$modal.confirm('是否确认清数据？').then(function() {
        return delAllH10keyword();
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("清空成功");
      }).catch(() => {});
    },
     /** 删除按钮操作 */
    handleDelete(row) {
       delH10keyword(row.id).then(function(){
         this.getList();
         this.$modal.notifySuccess("删除成功");
       });
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.open = true;
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(
        "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" +
          response.msg +
          "</div>",
        "导入结果",
        { dangerouslyUseHTMLString: true }
      );
      this.getList();
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/h10keyword/export', {
        ...this.queryParams
      }, `h10keyword_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
