<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
    <el-form-item label="状态" prop="state">
        <el-select
          v-model="queryParams.state"
          placeholder="请选择状态"
          clearable
          size="small"
          style="width: 140px"
        >
          <el-option
            v-for="item in stateList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button type="success" icon="el-icon-plus" size="mini" @click="addTime">新增</el-button>
        <el-button type="success" icon="el-icon-plus" size="mini" @click="deleteTime">批量删除</el-button>

        <span style="padding-left: 20px;padding-right: 10px;">分时调价状态：{{timePriceState===undefined?"已暂停":timePriceState===1?"已开启":"已暂停"}}</span>
        <el-button type="success" size="mini" @click="updatePriceState">{{timePriceState===undefined?"开启":timePriceState===1?"暂停":"开启"}}</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableList" @selection-change="changeCheckBoxValue">
      <el-table-column
        type="selection"
        width="65">
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="startTime" width="180"/>
      <el-table-column label="开始时间" align="center" prop="endTime" width="180"/>
      <el-table-column label="状态" align="center" prop="state" :formatter="formatState" width="180"/>
      <el-table-column label="预算" align="center" prop="dailyBudget" width="180"/>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="updateCampaign(scope.row)"
          >修改</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增分时调价 -->
    <el-dialog
      :title="popName"
      :visible.sync="batchPrice"
      width="650px"
      append-to-body
    >
      <el-form
        :model="priceForm"
        ref="priceForm"
        label-width="86px"
        class="demo-ruleForm"
        style="padding-left: 30px"
        :rules="rules"
      >
        <el-form-item label="时间范围" prop="effectTimeStart">
          <template>
            <el-time-picker
              is-range
              v-model="priceForm.effectTimeStart"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="选择时间范围">
            </el-time-picker>
          </template>
          <el-tooltip type="primary" content="设置分时调价，需要把24小时都是设置满，否则会按照上次生效的预算为准" placement="top" style="padding-left: 10px;">
            <i class="el-icon-question"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="状态" prop="dailyBudget">
          <el-select
            v-model="priceForm.state"
            placeholder="请选择状态"
            clearable
            size="small"
            style="width: 150px;"
          >
            <el-option
              v-for="item in stateList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预算" prop="dailyBudget">
          <el-input
            oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"
            v-model="priceForm.dailyBudget"
            style="width: 150px;"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm()"
        >确定</el-button
        >
        <el-button @click="batchPrice = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 修改活动预算 -->
    <el-dialog
      title="活动预算"
      :visible.sync="activityBudget"
      width="350px"
      append-to-body
    >
      <el-form
        ref="priceForm"
        label-width="70px"
        class="demo-ruleForm"
        style="padding-left: 30px"
      >
        <el-form-item label="预算" prop="rate">
          <el-input
            oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"
            v-model="oldDailyBudget"
            style="width: 150px;padding-right: 10px"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormOldBudget()"
        >确定</el-button
        >
        <el-button @click="activityBudget = false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { campaignTimePriceList,addCampaignTimePrice,deleteCampaignTimePrice,updatePriceState,queryCampaignTimeState } from "@/api/amazon/campaignsinfo";
export default {
  name: "campaignTimeUpdatePrice",
  data() {
    return {
      stateList:[
        {value:'1',label:'开启'},
        {value:"2",label:'关闭'}
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
      // 字典表格数据
      tableList: [],
      batchPrice:false,
      activityBudget:false,
      popName:undefined,
      campaignTimePriceId:undefined,
      checkBoxData: [],
      timePriceState:undefined,
      oldDailyBudget:undefined,
      // 表单参数
      priceForm: {
        effectTimeStart: undefined,
        dailyBudget: undefined,
        state:undefined
      },
      // 查询参数
      queryParams: {
        campaignId:undefined,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined
      },
      // 表单校验
      rules: {
        effectTimeStart: [
          { required: true, message: "开始时间与结束时间不能为空", trigger: "blur" }
        ],
        state: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ],
        dailyBudget: [
          { required: true, message: "预算不能为空", trigger: "blur" }
        ]
      }
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
    this.getCampaignTimeState();
  },
  methods: {
    formatState(row, column, cellValue, index){
      for(let i=0; i<this.stateList.length;i++){
        if(cellValue == this.stateList[i].value){
          return this.stateList[i].label;
        }
      }
      return '';
    },
    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      campaignTimePriceList(this.queryParams).then(response => {
          this.tableList = response.data;
          this.loading = false;
        }
      );
    },
    getCampaignTimeState(){
      queryCampaignTimeState(this.queryParams).then(response => {
          this.timePriceState = response.data.timePriceState;
          this.oldDailyBudget = response.data.dailyBudget;
        }
      );
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
      this.getTime()
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
    addTime(){
      //打开新增弹窗
      this.popName = "新增分时调价";
      this.priceForm.effectTimeStart = [new Date(2022, 9, 30, 0, 0,0), new Date(2022, 9, 30, 0, 59,59)];
      this.priceForm.dailyBudget=null;
      this.campaignTimePriceId = undefined;
      this.priceForm.state = this.stateList[0].value;
      this.batchPrice = true;
    },
    deleteTime(){
      if (this.checkBoxData.length<=0){
        this.$message.warning('请勾选列表里的数据');
      }else{
        deleteCampaignTimePrice(this.checkBoxData).then(response => {
          if (response.code === 200){
            this.$modal.msgSuccess("删除成功");
            this.getList();
          }
        });
      }
    },
    updatePriceState(){
      let numberTo = this.timePriceState===undefined?1:this.timePriceState===1?2:1;
      if (numberTo===1){
        //开启
        let updateCampaignTimePriceParam = {
          campaignId:this.queryParams.campaignId,
          timePriceState:numberTo
        }
        updatePriceState(updateCampaignTimePriceParam).then(response => {
          if (response.code === 200){
            if (numberTo===1){
              this.$modal.msgSuccess("开启成功");
            }else{
              this.$modal.msgSuccess("暂停成功");
            }
            this.getCampaignTimeState();
          }
        });
      }else{
        //暂停
        this.activityBudget=true;
      }
    },
    /** 新增分时竞价确定 */
    submitForm() {
      this.$refs["priceForm"].validate(valid => {
        if (valid) {
          let startTime = this.priceForm.effectTimeStart[0].getHours()+":"
                         +this.priceForm.effectTimeStart[0].getMinutes()+":"
                         +this.priceForm.effectTimeStart[0].getSeconds();
          let endTime = this.priceForm.effectTimeStart[1].getHours()+":"
                        +this.priceForm.effectTimeStart[1].getMinutes()+":"
                        +this.priceForm.effectTimeStart[1].getSeconds();
          let addCampaignTimePriceParam = {
            campaignId:this.queryParams.campaignId,
            startTime:startTime,
            endTime:endTime,
            dailyBudget:this.priceForm.dailyBudget,
            state:this.priceForm.state,
            id:this.campaignTimePriceId
          }
          addCampaignTimePrice(addCampaignTimePriceParam).then(response => {
            if (response.code === 200){
              this.$modal.msgSuccess("新增成功");
              this.batchPrice = false;
              this.getList();
            }
          });
        }
      });
    },
    /** 关闭分时调价确定 */
    submitFormOldBudget(){
      let updateCampaignTimePriceParam = {
        campaignId:this.queryParams.campaignId,
        timePriceState:this.timePriceState===undefined?1:this.timePriceState===1?2:1,
        dailyBudget:this.oldDailyBudget
      }
      updatePriceState(updateCampaignTimePriceParam).then(response => {
        if (response.code === 200){
          let numberTo = this.timePriceState===undefined?1:this.timePriceState===1?2:1;
          if (numberTo===1){
            this.$modal.msgSuccess("开启成功");
          }else{
            this.$modal.msgSuccess("暂停成功");
          }
          this.activityBudget=false;
          this.getCampaignTimeState();
        }
      });
    },
    updateCampaign(row){
      this.popName = "修改分时调价";
      this.priceForm.effectTimeStart = [new Date(2022, 9, 30, row.startTime.slice(0,2), row.startTime.slice(3,5),row.startTime.slice(6,8)), new Date(2022, 9, 30, row.endTime.slice(0,2), row.endTime.slice(3,5),row.endTime.slice(6,8))];

      this.priceForm.dailyBudget = row.dailyBudget;
      this.priceForm.state = this.stateList[row.state-1].value;
      this.campaignTimePriceId = row.id;
      this.batchPrice = true;
    },
    changeCheckBoxValue(val) {
      this.checkBoxData = [];
      val.forEach((column, index) => {
        let batchKeywordParam = {
          id:column.id,
          campaignId:column.campaignId
        };
        this.checkBoxData.push(batchKeywordParam);
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.handleQuery();
    }
  }
};
</script>
