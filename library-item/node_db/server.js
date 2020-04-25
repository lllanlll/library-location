var express = require('express'); //调用模板
var app = express(); //不污染本来，用变量来表示
const moment = require('moment');
var queryString = require('querystring');
var util = require('util');
var bodyParser = require('body-parser'); //调用模板
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
})); //6-9用bodyParser处理post数据
var mysql = require("mysql");
var connection = mysql.createConnection({ //配置参数，然后添加你的数据库里面的表
  host: 'localhost',
  user: 'root',
  password: 'Cjljh05.16',
  database: 'library'
})
connection.connect(); //连接

//若是提示跨域 可解开注释尝试 使用cors跨域
// app.all('*', function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
//     res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

//     if (req.method == 'OPTIONS') {
//         res.send(200);
//     } else {
//         next();
//     }
// });

//处理get参数 返回[{key: 'value'}]形式
const handleParams = (url) => {
  let result = [];
  let params = url.split('?')[1].split('&');
  params.forEach(item => {
    var obj = {};
    var value = item.split("=")[1];
    var key = item.split("=")[0];
    obj[key] = value;
    result.push(obj);
  })
  return result;
}

//处理返回前端的数据库RowDataPacket数据
const handleRowData = (result) => {
  var string = JSON.stringify(result);
  var data = JSON.parse(string)
  return data;
}


// 首页
app.get('/', function (req, res) { //get请求
  res.send('Hello World');
})
// 配置静态文件
app.get('/index.html', function (req, res) {
  res.sendFile(__dirname + '' + '/index.html'); //提供静态文件
})

// ajax接口插入数据
// app.post('/insert_book', urlencodedParser, function (req, res) { //post处理方法
//     let json = JSON.stringify(req.body);
//     let result = JSON.parse(json);
//     let params = result['params[]'];
//     mysql_connec_insert(params);
//     res.end();
// })


//登陆功能
app.post('/api/login', function (req, res) {
  let params = JSON.parse(JSON.stringify(req.body)).params;
  mysql_connec_login(req, res, params);
})

function mysql_connec_login(req, res, params) {
  var sql = `select password from users where name = '${params.name}'`;
  connection.query(sql, function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    } else {
      if (result[0].password == params.password) {
        res.send('true');
      } else {
        res.send('false');
      }
      res.end();
      return;
    }
  })
}

//注册功能
app.post("/api/register", function (req, res) {
  let params = JSON.parse(JSON.stringify(req.body)).params;
  mysql_connec_insert(res, params);
})

function mysql_connec_insert(res, params) {
  //查询是否存在
  const searchSql = `select 1 from users where name = "${params.name}" `;
  connection.query(searchSql, function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    } else {
      if (result.length) {
        res.end('false');
      } else {
        //不存在则插入 并返回true
        const addSql = "insert into users(`name`,`password`) values(?,?)"; //存放数据库语言的，这里是添加
        const addParams = [params.name, params.password];
        connection.query(addSql, addParams, function (err, result) {
          if (err) {
            console.log("[insert error]-", err.message);
            return;
          }
          res.end('true');
          return;
        })
      }
    }
  })
}

//查询图书馆藏书
app.get('/api/getBooks', function (req, res) {
  let params = handleParams(req.url);
  // let params = 'sc1'
  mysql_connec_search(req, res, params);
})

function mysql_connec_search(req, res, params) {
  var sql = `select * from book where library_name = '${params[0]['province']}'`;
  connection.query(sql, function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    } else {
      console.log(result);
      let data = handleRowData(result);
      res.send(data);
      res.end();
      return;
    }
  })
}

//借书
app.get('/api/borrowBooks', function (req, res) {
  let params = handleParams(req.url);
  // let params = 'sc1'
  let time = moment().format();
  //   console.log(params, time)
  mysql_connec_borrow(req, res, params, time);
})

function mysql_connec_borrow(req, res, params, time) {
  const addSql = "insert into borrow_books(`user_name`, `Book_ID`, `Out_time`, `library_name`, `Book_name`, `Book_type`, `Book_author`, `Book_publisher`) values(?, ?, ?, ?, ?, ?, ?, ?)";
  const addParams = [params[0].name, params[1].bookId, time, params[2].library, params[3].bookName, params[4].bookType, params[5].bookAuthor, params[6].bookPublisher];
  const deleteSql = `delete from book where Book_ID = "${params[1].bookId}"`;
  //在borrow_book中添加记录
  connection.query(addSql, addParams, function (err, result) {
    if (err) {
      console.log("[insert error]-", err.message);
      return;
    }
    res.end('insert success');
    connection.query(deleteSql, function (err, result) {
      if (err) {
        console.log("[insert error]-", err.message);
        return;
      }
    })
    return;
  })
}

//查看所借书籍
app.get('/api/getBorrowBooks', function (req, res) {
  let params = handleParams(req.url);
  mysql_connec_showBorrowBooks(req, res, params);
})

function mysql_connec_showBorrowBooks(req, res, params) {
  const searchSql = `select * from borrow_books where user_name = "${params[0].name}"`;
  connection.query(searchSql, function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    } else {
      res.send(handleRowData(result));
      res.end();
      return;
    }
  })
}

//还书
app.get('/api/returnBooks', function (req, res) {
  let params = handleParams(req.url);
  mysql_connec_return(req, res, params);
})

function mysql_connec_return(req, res, params) {
  // console.log(params);
  const addSql = "insert into book(`Book_ID`, `Book_name`, `Book_type`, `Book_author`, `Book_publisher`, `library_name`) values(?, ?, ?, ?, ?, ?)";
  const addParams = [params[0].bookId, params[1].bookName, params[2].bookType, params[3].bookAuthor, params[4].bookPublisher, params[5].library];
  const deleteSql = `delete from borrow_books where Book_ID = "${params[0].bookId}"`;
  connection.query(addSql, addParams, function (err, result) {
    if (err) {
      console.log("[insert error]-", err.message);
      return;
    }
    res.end('return success');
    connection.query(deleteSql, function (err, result) {
      if (err) {
        console.log("[insert error]-", err.message);
        return;
      }
    })
    return;
  })
}


var server = app.listen(8888, function () { //监听端口
  console.log("访问地址为 localhost:8888")
})
