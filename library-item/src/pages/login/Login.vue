<template>
  <div class="login-page">
    <el-card class="box-card" shadow="hover">
      <h1>地区图书管理系统</h1>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px">
        <el-form-item label="账号" prop="name">
          <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="ruleForm.password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="success" plain @click="submitForm('ruleForm')">登陆</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
          <el-button type="primary" @click="goRegister">注册账号</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      ruleForm: {
        name: "",
        password: ""
      },
      rules: {
        name: [
          { required: true, message: "请输入账号", trigger: "blur" },
          { min: 1, max: 20, message: "长度在1到20个字符之间", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 20, message: "长度在6到20个字符之间", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$http
            .post("/api/login", {
              params: {
                name: this.ruleForm.name,
                password: this.ruleForm.password
              }
            })
            .then(response => {
              let result = response.data;
              this.check(result);
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    check(result) {
      if (result) {
        this.$router.push({
          name: "Main",
          params: {
            name: this.ruleForm.name
          }
        });
      } else {
        alert("密码或者账号不正确");
      }
    },
    goRegister() {
      this.$router.push({
        name: "Register"
      });
    }
  }
};
</script>

<style scoped>

.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:  linear-gradient(to right, #ffdde1, #ee9ca7);
}

.box-card {
  width: 480px;
  text-align: center;
}
</style>
