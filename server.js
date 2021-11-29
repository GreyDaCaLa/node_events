// Complete Events Exercise

const {createServer} = require('http');
const {appendFile} = require('fs');
const path = require('path');
const {EventEmitter} = require('events');



let NewsLetter = new EventEmitter();



const server = createServer((request,response)=>{
    const {url,method} = request;
    let chunks = [];

    request.on("error",(error)=>{
        console.log(error);
        response.statusCode=400;
        response.setHeader("Content-Type","application/json");
        response.write(JSON.stringify({msg: "invalid request"}));
        response.end();

    })

    response.on("error",(error)=>{
        console.log(error);
        response.statusCode=500;
        response.setHeader("Content-Type","application/json");
        response.write(JSON.stringify({msg: "Server error"}));
        response.end();
    } )

    request.on("data",(chunk)=>{
            chunks.push(chunk);
        })
        request.on("end",()=>{
            
                
            if(url == "/newsletter_signup"){
                if(method == 'POST'){
                    const body = JSON.parse(Buffer.concat(chunks).toString());

                    const newContact = `${body.name}, ${body.email}\n`;

                    NewsLetter.emit("signup",newContact,response);

                    response.setHeader("Content-Type","application/json");
                    response.write(JSON.stringify({msg: "Successfully signed up to newsletter"}))
                    response.end();

                        
                }else{
                    response.statusCode=404;
                    response.setHeader("Content-Type","application/json");
                    response.write(JSON.stringify({msg: "Not a valid method endpoint"}));
                    response.end();
                }
            }else{
                response.statusCode=404;
                response.setHeader("Content-Type","application/json");
                response.write(JSON.stringify({msg: "Not a valid endpoint"}));
                response.end();
            }

        })

})


server.listen(3000, ()=> console.log("Server Listening..."))

NewsLetter.on("signup", (newContact, response)=>{
    appendFile(path.join(__dirname,"/newsletter.csv"), newContact, (error)=>{
        if(error){
            console.log(error);
            NewsLetter.emit("error",error, response);
            return;
        }
        console.log("the file was updated successfully!");
    });
});


NewsLetter.on("error",(error,response)=>{
    console.log(error);
    response.statusCode=500;
    response.setHeader("Content-Type","application/json");
    response.write(JSON.stringify({msg: "error adding new contact to newsletter"}));
    response.end();
})