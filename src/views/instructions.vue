<template>
  <div class="card">
    <h3>1、重要提醒</h3>
    <div class="tip">
      <p>广告只能解决引流问题，没有办法解决卖的不好的问题</p>
      <p>如果广告能解决所有问题，那我们比姐夫都有钱了</p>
      <p><img style="width: 250px; height: 180px;" src="@/assets/images/wx.png" /></p>
      <p>目前只支持<font class="font-red">北美3个站点</font>SP广告活动的智能否词（包括新广告）和智能调价（不包括新广告），智能调价的广告活动需运行<font class="font-red">30天以上</font>，广告结构需要客户自己搭建</p>
      <p><font class="font-red">只支持单ASIN</font>的广告活动，一个广告活动包含多ASIN的结构因为不好确定调整标准所以不支持</p>
      <p>设置自动调价的时候Acos不要设置的和原来偏差过大，否则会影响出单</p>
      <p>通过我们独有的优化算法，一般可以降低<font class="font-red">5～10%</font>的无效花费，但如果不同步调整预算，广告计划一般会把节省的费用再花出去，长期优化后同样的预算广告销量会增长<font class="font-red">5～10%</font>，建议至少使用<font class="font-red">30天以上</font>效果会更明显</p>
      <p>调价和否词往往会占据运营日常工作<font class="font-red">50%以上</font>的时间，通过我们的<font class="font-red">系统智能调价和智能否词</font>，运营可以节约大量时间，有更多的精力做好其他的运营工作，从而提高整体的产出</p>
    </div>
    <h3>2、新增店铺账号</h3>
    <div class="tip">
      <p>首先要增加店铺账号:</p>
      <p>点击菜单店铺管理 =&gt; 店铺账号 =&gt; 新增，店铺名称可以自己设置，卖家ID在亚马逊卖家后台的设置 =&gt; 账户信息 =&gt; 卖家记号查询</p>
    </div>
    <h3>
      3、广告授权
    </h3>
    <div class="tip">
      <p>添加店铺账号后，要先做店铺授权和广告授权才能同步数据。同一店铺不同站点只需授权一次</p>
      <p style="color:red;">做店铺授权和广告授权时务必须在日常登陆亚马逊店铺的网络环境下操作，避免造成关联</p>
      <p><font class="font-red">授权后通过官方API访问数据不会造成关联</font>，目前所有的第三方SAAS平台都是通过这种方式访问亚马逊店铺数据，无须担心</p>
    </div>
    <h3>
      4、账户管理
    </h3>
    <div class="tip">
      <p>通过登录页面注册账户为主账户，主账户可在店铺管理中新增多个店铺</p>
      <p>本系统账户分为三级结构分别为：主账户、运营主管、普通运营人员，普通运营人员可通过设置“运营ASIN”，以达到让运营人员只看到所配置ASIN的数据的功能</p>
      <p></p>
    </div>
    <h3>
      5、设置自动调价
    </h3>
    <div class="tip">
      <p>店铺及广告数据同步后，首先通过【店铺ASIN】功能设置是否参与自动调价</p>
      <p>其次点击ASIN,设置ASIN下哪些活动参与调价，并设置广告活动的预期ACOS（默认为近30天平均） </p>
      <p>开启自动调价功能的ASIN，会自动开启智能否词。同一个ASIN下所有的广告活动，不管有没有设置自动调价都会进行智能否词</p>
      <p><font class="font-red">设置后24小时内生效</font></p>
    </div>
    <h3>6、促销日期</h3>
    <div class="tip">
      <p>促销会导致数据波动较大，为了使智能算法在调价及否词时更准确，建议维护促销日期，我们会根据促销日期对数据进行特殊处理</p>
    </div>
    <h3>7、资金账户</h3>
    <div class="tip">
      <p>资金账户主要用于账户充值、资金明细及店铺账单。</p>
      <p>店铺账单以店铺为单位收取月使用费，店铺增加时间少于一个月，根据使用时间计算费用（一个月按30天计算）</p>
    </div>
   <h3>8、安全性</h3>
    <div class="tip">
      <p>我们是<font class="font-red">亚马逊广告认证合作伙伴</font>，通过官方的API获取客户数据，无安全隐患</p>
      <p>亚马逊官方也会定期对合作伙伴做审核，包括安全方面的审核</p>
      <p>我们的数据都是存放在<font class="font-red">亚马逊云</font>，并做加密处理，保证数据的安全性</p>
    </div>
    <h3>9、用户反馈</h3>
    <div class="tip">
      <p>软件使用过程中，若有意见及建议，可通过此功能反馈给我们</p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'instructions',
  methods: {}
}
</script>

<style lang="scss" scoped>
.card{
  margin: 50px;
}

.font-red{
  color: red;
}
.tip {
  padding: 8px 16px;
  background-color: #ecf8ff;
  border-radius: 4px;
  border-left: 5px solid #50bfff;
  margin: 20px 0;
}
p{
  font-size: 14px;
  color: #5e6d82;
  line-height: 1.5em;
}
h2{
  font-size: 28px;
  font-weight: 400;
  color: #1f2f3d;
}
h3{
  font-size: 22px;
  font-weight: 400;
  color: #1f2f3d;
}
</style>
