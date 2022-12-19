<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="国家" prop="country">
        <el-select
          v-model="queryParams.country"
          placeholder="请选择国家/地区"
          size="small"
          style="width: 240px"
        >
          <el-option label="美国" value="US" key="0"> </el-option>
          <el-option label="德国" value="DE" key="1"> </el-option>
          <el-option label="日本" value="JP" key="2"> </el-option>
          <el-option label="加拿大" value="CA" key="3"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="ASIN" prop="asin">
        <el-input
          v-model="queryParams.asin"
          placeholder="请输入ASIN,多个以英文逗号隔开"
          clearable
          size="small"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="关键词" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          placeholder="请输入关键词"
          clearable
          size="small"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="排序字段" prop="sortBy">
        <el-select
          v-model="queryParams.sortBy"
          placeholder="请选择排序字段"
          size="small"
          style="width: 240px"
        >
          <el-option label="自然排名" value="lastRank" key="0"> </el-option>
          <el-option label="广告排名" value="adLastRank" key="1"> </el-option>
          <el-option label="关键词抓取时间" value="updateTime" key="2">
          </el-option>
          <el-option label="搜索排名" value="searchesRank" key="3"> </el-option>
          <el-option label="月搜索量" value="estSearchesNum" key="4">
          </el-option>
          <el-option label="竞品排名" value="saleNum" key="5"> </el-option>
          <el-option label="竞争度" value="demandRatio" key="6"> </el-option>
          <el-option label="广告竞品数" value="adAsinNum" key="7"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="排序方式" prop="desc">
        <el-select
          v-model="queryParams.desc"
          placeholder="请选择排序方式"
          size="small"
          style="width: 240px"
        >
          <el-option label="降序" value="true" key="0"> </el-option>
          <el-option label="升序" value="false" key="1"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="统计词频" prop="needWF">
        <el-select
          v-model="queryParams.needWF"
          placeholder="请选择统计词频"
          size="small"
          style="width: 240px"
        >
          <el-option label="需要统计" value="true" key="0"> </el-option>
          <el-option label="无需统计" value="false" key="1"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="筛选条件" prop="conditions">
        <el-select
          v-model="queryParams.conditions"
          placeholder="请选择筛选条件"
          size="small"
          style="width: 240px"
        >
          <el-option label="全部" value="" key="0"> </el-option>
          <el-option label="SP广告词" value="isSpAd" key="0"> </el-option>
          <el-option label="品牌广告词" value="isBrandAd" key="1"> </el-option>
          <el-option label="视频广告词" value="isVedioAd" key="2"> </el-option>
          <el-option label="AC推荐词" value="isAC" key="3"> </el-option>
          <el-option label="er推荐词" value="isER" key="4"> </el-option>
          <el-option label="tr推荐词" value="isTr" key="5"> </el-option>
          <el-option label="主要流量词" value="isMainKw" key="6"> </el-option>
          <el-option label="精准流量词" value="isAccurateKw" key="7">
          </el-option>
          <el-option label="精准大词" value="isAccurateAboveKw" key="8">
          </el-option>
          <el-option label="精准长尾词" value="isAccurateTailKw" key="9">
          </el-option>
          <el-option label="出单词" value="isPurchaseKw" key="10"> </el-option>
          <el-option label="转化优质词" value="isQualityKw" key="11">
          </el-option>
          <el-option label="转化平稳词" value="isStableKw" key="12">
          </el-option>
          <el-option label="转化流失词" value="isLossKw" key="13"> </el-option>
          <el-option label="无效曝光词" value="isInvalidKw" key="14">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >查询</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:sif:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="sifList">
      <el-table-column
        fixed
        label="keyword"
        align="center"
        prop="keyword"
        width="120"
      />
      <el-table-column
        fixed
        label="updateTime"
        align="center"
        prop="updateTime"
        width="120"
      />
      <el-table-column
        label="exposureType"
        align="center"
        prop="exposureType"
        width="120"
      />
      <el-table-column
        label="lastRank"
        align="center"
        prop="lastRank"
        width="120"
      />
      <el-table-column
        label="lastRankStr"
        align="center"
        prop="lastRankStr"
        width="120"
      />
      <el-table-column
        label="rankTime"
        align="center"
        prop="rankTime"
        width="120"
      />
      <el-table-column
        label="adLastRank"
        align="center"
        prop="adLastRank"
        width="120"
      />
      <el-table-column
        label="adLastRankStr"
        align="center"
        prop="adLastRankStr"
        width="120"
      />
      <el-table-column
        label="adRankTime"
        align="center"
        prop="adRankTime"
        width="120"
      />
      <el-table-column
        label="adAsinNum"
        align="center"
        prop="adAsinNum"
        width="120"
      />
      <el-table-column
        label="estSearchesNum"
        align="center"
        prop="estSearchesNum"
        width="120"
      />
      <el-table-column
        label="saleNum"
        align="center"
        prop="saleNum"
        width="120"
      />
      <el-table-column
        label="searchesRank"
        align="center"
        prop="searchesRank"
        width="120"
      />
      <el-table-column
        label="demandRatio"
        align="center"
        prop="demandRatio"
        width="120"
      />
      <el-table-column
        label="ratioScore"
        align="center"
        prop="ratioScore"
        width="120"
      />
      <el-table-column
        label="kwCharacters"
        align="center"
        prop="kwCharacters"
        width="120"
      />
      <el-table-column
        label="conversionCharacters"
        align="center"
        prop="conversionCharacters"
        width="120"
      />
      <el-table-column
        label="isMonitor"
        align="center"
        prop="isMonitor"
        width="120"
      />
      <el-table-column
        label="hscore"
        align="center"
        prop="hscore"
        width="120"
      />
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
import { listSif } from "@/api/system/sif";

export default {
  name: "Record",
  data() {
    return {
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 费用明细表格数据
      sifList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        asin: null,
        keyword: null,
        country: "US",
        needWF: "true",
        sortBy: null,
        desc: "true",
        conditions: [],
      },
    };
  },
  methods: {
    /** 查询费用明细列表 */
    getList() {
      if (this.queryParams.asin == null || this.queryParams.asin.length < 1) {
        this.$modal.msgError("请输入ASIN");
        return false;
      }
      this.loading = true;
      listSif(this.queryParams).then((response) => {
        this.sifList = response.data.keywords;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "sif/export",
        {
          ...this.queryParams,
        },
        this.queryParams.asin + `关键词查询_${new Date().getTime()}.xlsx`
      );
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
  },
};
</script>
