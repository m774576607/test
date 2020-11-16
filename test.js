var express = require('express')
var mysql = require('mysql')
var util = require('util')
var fs = require("fs")
const { resolve } = require('path')
const e = require('express')
var app = express()
var buf = new Buffer.alloc(1024)
var option = {}
var connection = null
var str = ''
var resObj = []
const domain = require('domain');
const d = domain.create();
d.on('error', (e) => {
  console.log('连接数据库失败,请检查vpn连接状态后重试')
});


app.get('/query', function (req, response) {
  var queryJson = req.query

  if (!queryJson) {
    str = '请输入查询参数!';
    response.send(str);
    return;
  }
  if (typeof queryJson.num === 'undefined' || queryJson.num === null && queryJson.num === '') {
    str = '单号为必填项!'
    response.send(str);
    return;
  }
  var queryNum = util.inspect(queryJson.num)
  console.log('查询参数:', req.query)
  connectToSql()
  connection.query("SELECT * FROM tt_data_backup WHERE LOCATE(" + queryNum + ",BACKUP_TEXT) OR LOCATE(" + queryNum + ",BACKUP_TEXT_CONVERT)", function (err, res, fields) {
    if (err) {
      str = err
      console.log(err)
    }
    str = util.inspect(res)
    // res.forEach(x => str + util.inspect(x))
    if (typeof str !== 'undefined' && str != 'undefined') {
      console.log('查询结果:' + str)
    } else {
      console.log('查询失败,请检查vpn连接状态后重试')
    }
    response.setHeader("Access-control-allow-origin", "*")
    if (!!res) {
      res.forEach(x => resObj.push(x.RowDataPacket))
    }
    response.send(res)
  })
})
var server = app.listen(3456, function () {
  fs.readFile('option.txt', function (err, data) {
    if (err) {
      if (!option) {
        console.log('配置文件读取失败,请配置后重新打开!')
        throw err
      }
      console.log('连接失败,请检查vpn连接状态后重试')
    }
    option = Object.assign({}, JSON.parse(data.toString()))
    console.log('配置信息载入成功:' + util.inspect(option))
  })
  // console.log('连接至数据库')
  var host = server.address().address
  var port = server.address().port
  console.log("服务建立成功,访问地址为: http://%s:%s", host, port)

})
function connectToSql() {
  d.run(() => {
    connection = mysql.createConnection(option)
    connection.connect()
  })
}
