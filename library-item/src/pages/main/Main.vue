<template>
  <div>
    <div class="account">
      <div class="account-left">
        <span>
          当前账户:
          <span class="el-icon-s-custom"></span>
          {{ name }}
        </span>
      </div>
      <div class="account-right">
        <span @click="quit">切换账户</span>
      </div>
    </div>

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
        <div class="search_library_books_show">
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
        <div class="show_borrow_books">
          <el-table :data="borrow_books" :border="true" style="width: 100%">
            <el-table-column prop="Book_ID" label="书编号" width="100"></el-table-column>
            <el-table-column prop="library_name" label="所属图书馆" width="100"></el-table-column>
            <el-table-column prop="Out_time" label="借出时间"></el-table-column>
            <el-table-column prop="Dead_time" label="应还时间"></el-table-column>
            <el-table-column prop="Book_name" label="书名" width="100"></el-table-column>
            <el-table-column prop="Book_type" label="书类型" width="100"></el-table-column>
            <el-table-column prop="Book_author" label="作者" width="100"></el-table-column>
            <el-table-column prop="Book_publisher" label="出版社" width="100"></el-table-column>
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
      <el-tab-pane label="定时任务补偿" name="four">定时任务补偿</el-tab-pane>
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
      details: {}
    };
  },
  methods: {
    handleClick(tab, event) {
      if (tab.name == "borrow") {
        this.getBorrowBooks();
      }
      if (tab.name == "details") {
        this.getDetails();
      }
    },
    getBooks() {
      let params = {
        province: this.ruleForm.location
      }
      this.apiMethodsGet("/api/getBooks", params).then(res => {
        this.library_books_result = res.data;
      });
    },
    getDetails() {
      let params = {
        name: this.name
      };
      this.apiMethodsGet("/api/getUsersDetails", params).then(res => {
        this.details = res.data[0];
      });
    },
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
    resetForm(formName) {
      this.$refs[formName].resetFields();
      if (formName == "ruleForm") {
        this.library_books_result = [];
      }
    },
    quit() {
      this.$router.push({
        name: "Login"
      });
    },
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
          console.log(res);
          this.getBooks();
        });
      } else {
        alert("请先登陆再借书");
      }
    },
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
      });
    },
    returnBooks(book) {
      if (this.name) {
        let params = {
          bookId: book.Book_ID,
          bookName: book.Book_name,
          bookType: book.Book_type,
          bookAuthor: book.Book_author,
          bookPublisher: book.Book_publisher,
          library: book.library_name
        };
        this.apiMethodsGet("api/returnBooks", params).then(res => {
          console.log(res);
          this.getBorrowBooks();
        });
      } else {
        alert("请先登陆再还书");
      }
    },
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
    apiMethodsGet(str, params) {
      return this.$http.get(str, {
        params
      });
    }
  },
  mounted() {
    this.name = this.$route.params.name;
  }
};
</script>

<style scoped>
.account {
  height: 50px;
  font-size: 30px;
  border: 1px solid rgba(88, 159, 248, 0.6);
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.account-right span {
  cursor: pointer;
}
</style>
