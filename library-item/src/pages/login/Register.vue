<template>
  <div class="register-page">
    <el-card class="box-card" shadow="hover">
      <h1>地区图书管理系统</h1>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px">
        <el-form-item label="账号" prop="name">
          <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="ruleForm.password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="rePassword">
          <el-input type="password" v-model="ruleForm.rePassword"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="success" plain @click="goLogin">返回登陆</el-button>
          <el-button type="primary" @click="submitForm('ruleForm')">注册</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Register",
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        if (this.ruleForm.rePassword !== "") {
          this.$refs.ruleForm.validateField("rePassword");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.ruleForm.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      ruleForm: {
        name: "",
        password: "",
        rePassword: ""
      },
      rules: {
        name: [
          { required: true, message: "请输入账号", trigger: "blur" },
          { min: 1, max: 20, message: "长度在1到20个字符之间", trigger: "blur" }
        ],
        password: [{ validator: validatePass, trigger: "blur" },{ required: true, message: "请输入密码", trigger: "blur" }],
        rePassword: [{ validator: validatePass2, trigger: "blur" },{ required: true, message: "请再次输入密码", trigger: "blur" }]
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$http
            .post("/api/register", {
              params: {
                name: this.ruleForm.name,
                password: this.ruleForm.password
              }
            })
            .then(response => {
              let result = response.data;
              if(!result) {
                alert("改用户名已存在 请重新输入");
                this.resetForm('ruleForm');
              } else {
                alert("注册成功 点击跳转至登陆页面");
                this.goLogin();
              }
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
    goLogin() {
      this.$router.push({
        name: "Login"
      });
    }
  }
};
</script>

<style scoped>
.register-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, #a7bfe8, #6190e8);
}

.box-card {
  width: 480px;
  text-align: center;
}
</style>
