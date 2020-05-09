<template>
  <div class="Main-page">
    <div class="Main-account">
      <div class="Main-account-left">
        <span>
          当前账户:
          <span class="el-icon-s-custom"></span>
          {{ name }}
        </span>
      </div>
      <div class="Main-account-right">
        <span @click="quit">切换账户</span>
      </div>
    </div>
    <div class="border"></div>

    <el-tabs type="border-card" v-model="activeNames" @tab-click="handleClick">
      <el-tab-pane label="搜索图书馆藏书" name="search">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px">
          <el-form-item label="图书馆缩写" prop="location">
            <el-input v-model="ruleForm.location"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('ruleForm')">搜索</el-button>
            <el-button @click="resetForm('ruleForm')">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="Main-search_library_books_show">
          <el-table :data="library_books_result" :border="true" style="width: 100%">
            <el-table-column prop="Book_ID" label="编号" width="180"></el-table-column>
            <el-table-column prop="Book_name" label="书名" width="180"></el-table-column>
            <el-table-column prop="Book_type" label="书类型" width="180"></el-table-column>
            <el-table-column prop="Book_author" label="作者" width="180"></el-table-column>
            <el-table-column prop="Book_publisher" label="出版社"></el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
              <template slot-scope="scope">
                <el-button @click="borrow(scope.row)" type="text" size="small">借书</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="已借书目" name="borrow">
        <div class="Main-show_borrow_books">
          <el-table
            :data="borrow_books"
            :border="true"
            style="width: 100%"
            :row-class-name="booksTableRowClassName"
          >
            <el-table-column prop="Book_ID" label="书编号" width="100"></el-table-column>
            <el-table-column prop="library_name" label="所属图书馆" width="100"></el-table-column>
            <el-table-column prop="Out_time" label="借出时间"></el-table-column>
            <el-table-column prop="Dead_time" label="应还时间"></el-table-column>
            <el-table-column prop="Book_name" label="书名" width="100"></el-table-column>
            <el-table-column prop="Book_type" label="书类型" width="100"></el-table-column>
            <el-table-column prop="Book_author" label="作者" width="100"></el-table-column>
            <el-table-column prop="Book_publisher" label="出版社" width="100"></el-table-column>
            <el-table-column prop="state" label="当前状态" width="100"></el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
              <template slot-scope="scope">
                <el-button @click="returnBooks(scope.row)" type="text" size="small">还书</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="账户详情" name="details">
        <div class="details_name">
          <span>账户名:</span>
          <span>{{ details.name }}</span>
        </div>
        <div class="details_balance">
          <span>余额:</span>
          <span>{{ details.balance }}</span>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: "Main",
  data() {
    return {
      activeNames: "search",
      ruleForm: {
        location: ""
      },
      rules: {
        location: [
          { required: true, message: "请输入名称", trigger: "blur" },
          { min: 1, max: 10, message: "长度在1到10个字符之间", trigger: "blur" }
        ]
      },
      library_books_result: [],
      borrow_books: [],
      name: "",
      details: {},
      firstNotifyOverdue: 1,//第一次进系统时给值为1 用来设置只提醒一次
    };
  },
  methods: {
    //tabs切换调用函数
    handleClick(tab, event) {
      if (tab.name == "borrow") {
        this.getBorrowBooks();
      }
      if (tab.name == "details") {
        this.getDetails();
      }
    },
    //调取图书馆藏书接口
    getBooks() {
      let params = {
        province: this.ruleForm.location
      };
      this.apiMethodsGet("/api/getBooks", params).then(res => {
        this.library_books_result = res.data;
      });
    },
    //调取用户详情接口
    getDetails() {
      let params = {
        name: this.name
      };
      this.apiMethodsGet("/api/getUsersDetails", params).then(res => {
        this.details = res.data[0];
      });
    },
    //校验是否输入正确
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.getBooks();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    //重置图书馆缩写
    resetForm(formName) {
      this.$refs[formName].resetFields();
      if (formName == "ruleForm") {
        this.library_books_result = [];
      }
    },
    //切换账号是退出至登陆界面
    quit() {
      this.$router.push({
        name: "Login"
      });
    },
    //借书接口
    borrow(book) {
      if (this.name) {
        let params = {
          name: this.name,
          bookId: book.Book_ID,
          library: book.library_name,
          bookName: book.Book_name,
          bookType: book.Book_type,
          bookAuthor: book.Book_author,
          bookPublisher: book.Book_publisher
        };
        this.apiMethodsGet("/api/borrowBooks", params).then(res => {
          // console.log(res);
          if (res.status == 200) {
            this.$notify({
              title: "成功",
              message: "借书成功",
              type: "success"
            });
          } else {
            this.$notify({
              title: "警告",
              message: "后台服务出错 联系管理员",
              type: "warning"
            });
          }
          this.getBooks();
        });
      } else {
        alert("请先登陆再借书");
      }
    },
    //调取借书表 并展示
    getBorrowBooks() {
      let params = {
        name: this.name
      };
      this.apiMethodsGet("/api/getBorrowBooks", params).then(res => {
        this.borrow_books = res.data;
        let len = this.borrow_books.length;
        this.borrow_books.forEach(item => {
          item.Out_time = this.formatUTC(item.Out_time);
          item.Dead_time = this.formatUTC(item.Dead_time);
        });
        if(this.firstNotifyOverdue > 0) {
          this.$notify.info({
            title: "消息",
            message: this.name + " 若逾期未还书 将缴纳5元/天的逾期费用!请注意"
          });
          this.firstNotifyOverdue = 0;
        }
      });
    },
    //调取还书接口
    returnBooks(book) {
      if (this.name) {
        let params = {
          bookId: book.Book_ID,
          bookName: book.Book_name,
          bookType: book.Book_type,
          bookAuthor: book.Book_author,
          bookPublisher: book.Book_publisher,
          library: book.library_name,
          balance: this.details.balance,
          name: this.name
        };
        this.apiMethodsGet("api/returnBooks", params).then(res => {
          console.log(res.data);
          if (res.status == 200) {
            this.$notify({
              title: "成功",
              message: "还书成功",
              type: "success"
            });
            if (res.data == "connec") {
              this.$notify.info({
                title: "消息",
                message: "余额不足 请联系管理员"
              });
            }
          } else {
            this.$notify({
              title: "警告",
              message: "后台服务出错 联系管理员",
              type: "warning"
            });
          }
          this.getDetails();
          this.getBorrowBooks();
        });
      } else {
        alert("请先登陆再还书");
      }
    },
    //检验是否逾期
    checkTime(timeArray) {
      //timeArray: [{name, time}]
      let nowTime = this.$moment().format();
      let timeDiff = [];
      // console.log(timeArray);
      timeArray.forEach(item => {
        let ele = {
          name: item.name,
          book_id: item.book_id,
          seconds: this.$moment(item.Dead_time).diff(nowTime, "seconds")
        };
        timeDiff.push(ele);
      });
      // console.log(timeDiff);
      timeDiff.forEach(item => {
        if (item.seconds < 0) {
          let params = {
            name: item.name,
            book_id: item.book_id,
            seconds: -item.seconds
          };
          let pay = Math.ceil(params.seconds / 86400) * 5;
          this.apiMethodsGet("/api/changeState", params).then(res => {
            this.$notify({
              title: "通知",
              message: this.name + ` 请尽快缴纳欠款${pay}并还书!`,
              type: "warning"
            });
          });
        }
      });
    },
    //调取还书时间
    getBorrowBooksTime() {
      let params = {
        name: this.name
      };
      this.apiMethodsGet("/api/getBorrowBooks", params).then(res => {
        let endTime = [];
        res.data.forEach(item => {
          let ele = {
            name: item.user_name,
            Dead_time: item.Dead_time,
            book_id: item.Book_ID
          };
          endTime.push(ele);
        });
        this.checkTime(endTime);
      });
    },
    //api封装方法
    apiMethodsGet(str, params) {
      return this.$http.get(str, {
        params
      });
    },
    //时间格式化函数
    formatUTC(utc_datetime) {
      // 转为正常的时间格式 年-月-日 时:分:秒
      var T_pos = utc_datetime.indexOf("T");
      var Z_pos = utc_datetime.indexOf("Z");
      var year_month_day = utc_datetime.substr(0, T_pos);
      var hour_minute_second = utc_datetime.substr(
        T_pos + 1,
        Z_pos - T_pos - 1
      );
      var new_datetime = year_month_day + " " + hour_minute_second; // 2017-03-31 08:02:06

      // 处理成为时间戳
      timestamp = new Date(Date.parse(new_datetime));
      timestamp = timestamp.getTime();
      timestamp = timestamp / 1000;

      // 增加8个小时，北京时间比utc时间多八个时区
      var timestamp = timestamp + 8 * 60 * 60;

      // 时间戳转为时间
      var beijing_datetime = new Date(parseInt(timestamp) * 1000)
        .toLocaleString()
        .replace(/年|月/g, "-")
        .replace(/日/g, " ");
      return beijing_datetime;
    },
    //是否逾期的表格样式表示
    booksTableRowClassName({ row, rowIndex }) {
      if (row.state == "normal") {
        return "Main-normal";
      } else if (row.state == "overdue") {
        return "Main-overdue";
      }
      return "";
    },
    //登陆时提示欢迎消息
    welcome() {
      this.$notify({
        title: "成功",
        message: this.name + " 欢迎登陆系统",
        type: "success"
      });
    }
  },
  mounted() {
    this.name = this.$route.params.name;
    let params = {
      name: this.name
    };
    this.firstNotifyOverdue = 1;
    this.getDetails();
    this.welcome();
    this.getBorrowBooksTime();
  }
};
</script>

<style>
.Main-page {
  margin: 12px;
  padding: 12px;
}

.border {
  height: 3px;
  background: linear-gradient(70deg, #0ebeff, #ffdd40, #ae63e4, #47cf73);
}

.Main-account {
  height: 50px;
  font-size: 30px;
  border: 1px solid rgba(88, 159, 248, 0.6);
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.Main-account-right span {
  cursor: pointer;
}

.el-table .Main-overdue {
  background: oldlace;
}

.el-table .Main-normal {
  background: #f0f9eb;
}
</style>
