const headers = require('./headers');
const errorHandle = (res) => {
  res.writeHead(400, headers);
  res.write(JSON.stringify({
    "status": "false",
    "message": "無此網址或 id 錯誤"
  }))
  res.end();
}

module.exports = errorHandle;