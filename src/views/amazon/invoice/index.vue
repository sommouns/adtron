<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="90px"
    >
      <el-form-item label="购买方名称" prop="gmfMc">
        <el-input
          v-model="queryParams.gmfMc"
          placeholder="请输入购买方名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="地址、电话" prop="gmfDzdh">
        <el-input
          v-model="queryParams.gmfDzdh"
          placeholder="请输入购买方地址、电话"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="银行账号" prop="gmfYhzh">
        <el-input
          v-model="queryParams.gmfYhzh"
          placeholder="请输入购买方银行账号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发票代码" prop="fpDm">
        <el-input
          v-model="queryParams.fpDm"
          placeholder="请输入发票代码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发票号码" prop="fpHm">
        <el-input
          v-model="queryParams.fpHm"
          placeholder="请输入发票号码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="时间">
        <el-date-picker
          @change="getTime"
          v-model="queryParams.dateTime"
          type="daterange"
          align="right"
          size="mini"
          unlink-panels
          value-format="yyyy-MM-dd"
          format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:response:add']"
          >开票</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="responseList">
      <el-table-column label="购买方名称" align="center" prop="gmfMc" />
      <el-table-column label="购买方地址、电话" align="center" prop="gmfDzdh" />
      <el-table-column label="购买方银行账号" align="center" prop="gmfYhzh" />
      <el-table-column
        label="购买方纳税人识别号"
        align="center"
        prop="gmfNsrsbh"
      />
      <el-table-column label="类型" align="center" prop="type">
        <template slot-scope="scope">
          <span v-if="scope.row.redPdfUrl == null">已开票</span>
          <span v-if="scope.row.redPdfUrl != null">已作废</span>
        </template>
      </el-table-column>
      <el-table-column label="发票请求流水号" align="center" prop="fpqqlsh" />
      <el-table-column label="税控设备编号" align="center" prop="jqbh" />
      <el-table-column label="发票代码" align="center" prop="fpDm" />
      <el-table-column label="发票号码" align="center" prop="fpHm" />
      <el-table-column label="价税合计" align="center" prop="jshj" />
      <el-table-column label="合计不含税金额" align="center" prop="hjbhsje" />
      <el-table-column label="合计税额" align="center" prop="hjse" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="发票地址"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            target="_blank"
            type="text"
             @click="downloadPdf(scope.row.pdfUrl)"
            >发票下载</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            v-show="scope.row.redPdfUrl == null"
            @click="cancelResponse(scope.row)"
            v-hasPermi="['invoice:response:create:red']"
            >作废</el-button
          >
          <el-button
            size="mini"
            target="_blank"
            type="text"
            v-show="scope.row.redPdfUrl != null"
            @click="downloadPdf(scope.row.redPdfUrl)"
            >作废发票下载</el-button
          >
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

    <!-- 添加或修改发票开具返回结果对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="企业名称" prop="gmfMc">
          <el-autocomplete
            popper-class="my-autocomplete"
            v-model="form.gmfMc"
            :fetch-suggestions="querySearch"
            placeholder="请输入企业名称"
            style="width: 440px"
            @select="handleSelect">
            <template slot-scope="{item}">
              <div class="name">{{ item.gmfMc }}</div>
            </template>
          </el-autocomplete>

        </el-form-item>
        <el-form-item label="企业地址" prop="gmfDz">
          <el-input v-model="form.gmfDz" placeholder="请输入企业地址" />
        </el-form-item>
        <el-form-item label="企业电话" prop="gmfDh">
          <el-input v-model="form.gmfDh" placeholder="请输入企业电话" />
        </el-form-item>
        <el-form-item label="企业开户行" prop="gmfYhdz">
          <el-input
            v-model="form.gmfYhdz"
            placeholder="请输入企业开户行"
          />
        </el-form-item>
        <el-form-item label="企业银行账户" prop="gmfYhzh">
          <el-input v-model="form.gmfYhzh" placeholder="请输入企业银行账户" />
        </el-form-item>
        <el-form-item label="纳税人识别号" prop="gmfNsrsbh">
          <el-input
            v-model="form.gmfNsrsbh"
            placeholder="请输入购买方纳税人识别号"
          />
        </el-form-item>

        <el-form-item label="税率(%)" prop="rate">
          <el-input-number v-model="form.rate" placeholder="请输入税率" />
        </el-form-item>
        <el-form-item label="开票金额" prop="jshj">
          <el-input v-model="form.jshj" placeholder="请输入开票金额" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addResponse,
  listResponse,
  cancelResponse,
  queryListByGmfMc
} from "@/api/amazon/invoice";

export default {
  name: "invoice",
  data() {
    return {
      typeList: [
        {
          value: 0,
          label: "蓝票",
        },
        {
          value: 1,
          label: "红票",
        },
      ],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "昨天",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              end.setTime(end.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
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
      // 发票开具返回结果表格数据
      responseList: [],
      gmList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        billId: null,
        gmfMc: null,
        gmfDzdh: null,
        gmfYhzh: null,
        gmfNsrsbh: null,
        ddh: null,
        type: null,
        fpqqlsh: null,
        jqbh: null,
        fpDm: null,
        fpHm: null,
        hjbhsje: null,
        hjse: null,
        kprq: null,
        fpMw: null,
        jym: null,
        ewm: null,
        pdfUrl: null,
      },
      redType: false,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        gmfMc: [
          { required: true, message: "购买方名称不能为空", trigger: "blur" },
        ],
        gmfNsrsbh: [
          {
            required: true,
            message: "购买方纳税人识别号不能为空",
            trigger: "blur",
          },
        ],
        jshj: [
          { required: true, message: "价税合计不能为空", trigger: "blur" },
        ],
        rate: [{ required: true, message: "税率不能为空", trigger: "blur" }],

        type: [{ required: true, message: "类型不能为空", trigger: "blur" }],

        fpdm: [
          {
            required: this.redType,
            message: "红票发票代码不能为空",
            trigger: "blur",
          },
        ],

        fphm: [
          {
            required: this.redType,
            message: "红票发票号码不能为空",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询发票开具返回结果列表 */
    getList() {
      this.loading = true;
      listResponse(this.queryParams).then((response) => {
        this.responseList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        billId: null,
        gmfMc: null,
        gmfDzdh: null,
        gmfYhzh: null,
        gmfYhdz: null,
        gmfNsrsbh: null,
        gmfDh:null,
        gmfDz:null,
        ddh: null,
        type: null,
        fpqqlsh: null,
        jqbh: null,
        fpDm: null,
        fpHm: null,
        jshj: null,
        hjbhsje: null,
        rate: null,
        hjse: null,
        kprq: null,
        fpMw: null,
        jym: null,
        ewm: null,
        pdfUrl: null,
        updateTime: null,
        createTime: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加发票";
    },
    getTime() {
      if (
        this.queryParams.dateTime != undefined &&
        this.queryParams.dateTime != null
      ) {
        this.queryParams.startDate = this.queryParams.dateTime[0] + " 00:00:00";
        this.queryParams.endDate = this.queryParams.dateTime[1] + " 23:59:59";
      } else {
        this.queryParams.startDate = null;
        this.queryParams.endDate = null;
      }
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateResponse(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addResponse(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    typechange() {
      this.redType = true;
      this.rules = {
        gmfMc: [
          { required: true, message: "购买方名称不能为空", trigger: "blur" },
        ],
        gmfNsrsbh: [
          {
            required: true,
            message: "购买方纳税人识别号不能为空",
            trigger: "blur",
          },
        ],
        jshj: [
          { required: true, message: "价税合计不能为空", trigger: "blur" },
        ],
        rate: [{ required: true, message: "税率不能为空", trigger: "blur" }],

        type: [{ required: true, message: "类型不能为空", trigger: "blur" }],

        fpDm: [
          {
            required: this.redType,
            message: "红票发票代码不能为空",
            trigger: "blur",
          },
        ],

        fpHm: [
          {
            required: this.redType,
            message: "红票发票号码不能为空",
            trigger: "blur",
          },
        ],
      };
    },
    cancelResponse(row) {
      cancelResponse(row.id).then((response) => {
        this.$modal.msgSuccess("作废成功");
        this.getList();
      });
    },
    querySearch(queryString, cb){
      if (this.form.id == null) {
        let param = {
          gmfMc:queryString
        }
        queryListByGmfMc(param).then((response) => {
          this.gmList = response.data;
          var restaurants = this.gmList;
          cb(restaurants);
        });
      }
    },
    handleSelect(item){
      this.form.gmfMc = item.gmfMc;
      this.form.gmfDz = item.gmfDz;
      this.form.gmfDh = item.gmfDh;
      this.form.gmfYhdz = item.gmfYhdz;
      this.form.gmfYhzh = item.gmfYhzh;
      this.form.gmfNsrsbh = item.gmfNsrsbh;
    },
    downloadPdf(url) {
      window.open(url, "_blank")
    },
  },
};
</script>
