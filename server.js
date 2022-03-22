const http = require('http');
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const post = require('./models/posts')

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
.connect(DB)
.then(() => console.log('資料庫連接成功'));

const requestListener = async(req, res)=>{
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  }
  let body = "";
    req.on('data', chunk=>{
        body+=chunk;
    });

  if(req.url == "/posts" && req.method == "GET"){
    const posts = await post.find();
    res.writeHead(200,headers);
    res.write(JSON.stringify({
        "status": "success",
        posts
    }));
    res.end();
  }else if(req.url=="/posts" && req.method == "POST"){
    req.on('end', async()=>{
        try{
            const data = JSON.parse(body);
            if(data.title !== undefined){
                const newPost = await post.create(
                    {
                      "title": data.title
                    }
                );
                res.writeHead(200, headers);
                res.write(JSON.stringify({
                    "status": "success",
                    "data": await post.find(),
                }));
                res.end();
                
            }else{
                res.writeHead(400, headers);
                res.write(JSON.stringify({
                    "status": "false",
                    "message": "欄位未填寫正確，或無此 post ID",
                }));
                res.end();
            }
        }catch(error){
            res.writeHead(400, headers);
            res.write(JSON.stringify({
                "status": "false",
                "message": error,
            }));
            res.end();
        }
    })
  }else if(req.url=="/posts" && req.method == "DELETE"){
    const posts = await post.deleteMany({});
    res.writeHead(200,headers);
    res.write(JSON.stringify({
        "status": "success",
        posts:[]
    }));
    res.end();
  }else if(req.url.startsWith("/posts/") && req.method=="DELETE"){
    const id = req.url.split('/').pop();
    await post.findByIdAndDelete(id);
    res.writeHead(200,headers);
    res.write(JSON.stringify({
        "status": "success",
        "data": await post.find(),
    }));
    res.end();
  }else if(req.url.startsWith("/posts/") && req.method=="PATCH"){
    req.on('end' ,async()=>{
        try{
            const data = JSON.parse(body);
            const id = req.url.split('/').pop();
            if(data.title !== undefined){
                const editTitle = {
                    title: data.title,
                };
                const editPost = await post.findByIdAndUpdate(id, editTitle);
                res.writeHead(200, headers);
                res.write(JSON.stringify({
                    "status": "success",
                    "data": editPost,
                }));
                res.end();
                
            }else{
                res.writeHead(400, headers);
                res.write(JSON.stringify({
                    "status": "false",
                    "message": "欄位未填寫正確，或無此 post ID",
                }));
                res.end();
            }
        }catch(error){
            res.writeHead(400, headers);
            res.write(JSON.stringify({
                "status": "false",
                "message": error,
            }));
            res.end();
        }
    })
  }else if(req.method == "OPTIONS"){
    res.writeHead(200, headers);
    res.end();
  }else{
    res.writeHead(404, headers);
    res.write(JSON.stringify({
        "status": "false",
        "message": "無此網站路由"
    }));
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 8080);