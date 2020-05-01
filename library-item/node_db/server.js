var express = require('express'); //调用模板
var app = express(); //不污染本来，用变量来表示
const moment = require('moment');
var queryString = require('querystring');
var util = require('util');
var bodyParser = require('body-parser'); //调用模板
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
})); //lines6-9用bodyParser处理post数据
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
  let start_time = moment().format();
  //改为2分测试 已测试
  let dead_time = moment().add(30, 'days').format();
  let time = [start_time, dead_time];
  let state = 'normal';
  mysql_connec_borrow(res, params, time, state);
})

function mysql_connec_borrow(res, params, time, state) {
  const addSql = "insert into borrow_books(`user_name`, `Book_ID`, `Out_time`, `library_name`, `Book_name`, `Book_type`, `Book_author`, `Book_publisher`, `Dead_time`, `state`) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const addParams = [params[0].name, params[1].bookId, time[0], params[2].library, params[3].bookName, params[4].bookType, params[5].bookAuthor, params[6].bookPublisher, time[1], state];
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
  let balance = params[6].balance;
  const searchSql = `select 1 from payment_record where book_id = "${params[0].bookId}"`;
  const searchPaySql = `select pay from payment_record where book_id = "${params[0].bookId}"`;
  const searchMoneySql = `select money from payment_record where book_id = "${params[0].bookId}"`;
  const updateUsersSql = `update users set balance = "${params[6].balance}" where name = "${params[7].name}"`;
  const addSql = "insert into book(`Book_ID`, `Book_name`, `Book_type`, `Book_author`, `Book_publisher`, `library_name`) values(?, ?, ?, ?, ?, ?)";
  const addParams = [params[0].bookId, params[1].bookName, params[2].bookType, params[3].bookAuthor, params[4].bookPublisher, params[5].library];
  const deleteSql = `delete from borrow_books where Book_ID = "${params[0].bookId}"`;
  connection.query(searchSql, function (err, result1) {
    if (err) {
      console.log('[SELECT1 ERROR] - ', err.message);
      return;
    } else { //检测是否存在记录
      if (result1.length) {
        connection.query(searchPaySql, function(err, result2) {
          if (err) {
            console.log('[SELECT2 ERROR] - ', err.message);
            return;
          } else { // 检测是否还未支付
            //未支付
            if(result2[0].pay == 0) {
              connection.query(searchMoneySql, function(err, result3) {
                if (err) {
                  console.log('[SELECT3 ERROR] - ', err.message);
                  return;
                } else {// 扣除余额
                  balance -= result3[0].money;
                  if(balance < 0) {
                    res.send('connec');
                  } else {// 更新欠款表
                    connection.query(updateUsersSql, function (err, result4) {
                      if (err) {
                        console.log('[SELECT ERROR] - ', err.message);
                        return;
                      } 
                    })
                    connection.query(addSql, addParams, function (err, result) {
                      //还书至书库
                      if (err) {
                        console.log("[insert error]-", err.message);
                        return;
                      } else {
                        res.end('return success');
                        connection.query(deleteSql, function (err, result) {
                          if (err) {
                            console.log("[insert error]-", err.message);
                            return;
                          }
                        })
                        return;
                      }
                    })
                  }
                }
              })
            }
          }
        })
      } else {
        //无记录
        connection.query(addSql, addParams, function (err, result) {
          //还书至书库
          if (err) {
            console.log("[insert error]-", err.message);
            return;
          } else {
            res.end('return success');
            connection.query(deleteSql, function (err, result) {
              if (err) {
                console.log("[insert error]-", err.message);
                return;
              }
            })
            return;
          }
        })
      }
    }
  })
}

//获取用户详情
app.get('/api/getUsersDetails', function(req, res) {
  let params = handleParams(req.url);
  mysql_connec_showUsersDetail(req, res, params);
})

function mysql_connec_showUsersDetail(req, res, params) {
  const searchSql = `select * from users where name = "${params[0].name}"`;
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

//更改逾期的图书的状态
app.get('/api/changeState', function(req, res) {
  let params = handleParams(req.url);
  mysql_connec_changeState(res, params);
  mysql_connec_payment(res, params);
})

function mysql_connec_changeState(res, params) {
  const updateSql = `update borrow_books set state = "overdue" where user_name = "${params[0].name}" and Book_ID = "${params[1].book_id}"`;
  connection.query(updateSql, function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    } 
  })
}

function mysql_connec_payment(res, params) {
  let seconds = params[2].seconds;
  let days = Math.ceil(seconds / 86400);
  let pay = days * 5;
  const insertSql = "insert into payment_record(`name`, `money`, `pay`, `book_id`) values(?, ?, ?, ?)";
  const searchSql = `select 1 from payment_record where name = "${params[0].name}"`;
  const updateSql =  `update payment_record set money = "${pay}" where name = "${params[0].name}"`;
  const addParams = [params[0].name, pay, 0, params[1].book_id];
  connection.query(searchSql, function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    } else {
      if(result.length) {
        connection.query(updateSql, function (err, result) {
          if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
          } 
        })
        res.end('false insert but updated');
      } else {
        connection.query(insertSql, addParams, function (err, result) {
          if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
          } else {
            res.end('true insert');
          }
        })
      }
    }
  })
}

var server = app.listen(8888, function () { //监听端口
  console.log("访问地址为 localhost:8888")
})
