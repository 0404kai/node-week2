const http = require('http');
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const post = require('./models/posts')
const headers = require('./headers');
const errorHandle = require('./errorHandle');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
.connect(DB)
.then(() => console.log('資料庫連接成功'));

const requestListener = async(req, res)=>{
  let body = "";
    req.on('data', chunk=>{
        body+=chunk;
    });

  if(req.url == "/posts" && req.method == "GET"){
    const posts = await post.find();
    res.writeHead(200, headers);
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
              errorHandle(res);
            }
        }catch(error){
          errorHandle(res);
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
              errorHandle(res);
            }
        }catch{
          errorHandle(res);
        }
    })
  }else if(req.method == "OPTIONS"){
    res.writeHead(200, headers);
    res.end();
  }else{
    errorHandle(res);
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 8080);