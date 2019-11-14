var express=require('express');
var app=express();
var bodyParser = require("body-parser");
var nodemailer = require('nodemailer');
var gpio=require('onoff').Gpio;
var dhtsensor=require('node-dht-sensor');

var red= new gpio(27, 'out');
var yellow= new gpio(17, 'out');
var green= new gpio(4, 'out');
var buzz= new gpio(22, 'out');
var value=0
var high_temp=100000;
var mod_temp=100000;
var flag=0;
var interval;


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'email',
    pass: 'password'
  }
});

var mailOptions = {
  from: 'email',
  to: 'password',
  subject: 'Message from Temperature Alarm',
  text: ''
};


function func(){
	var dhtresult= dhtsensor.read(22,18);
	return dhtresult.temperature.toFixed(2);
};	


function callback(){
	if(func()>=high_temp){
	//	console.log(high_temp);
		buzz.writeSync(1);
	//	console.log(mod_temp);
		red.writeSync(1);
		green.writeSync(0);
		yellow.writeSync(0);
		mailOptions.text="RED ALERT!!! MAXIMUM TEMPERATURE LIMIT EXCEEDED";
		transporter.sendMail(mailOptions);
	}else if(func()<high_temp && func()>=mod_temp){
	//	console.log(high_temp);
		buzz.writeSync(1);
		yellow.writeSync(1);
		green.writeSync(0);
		red.writeSync(0);
	//	console.log(mod_temp);
		mailOptions.text="ALERT!!! MODERATE TEMPERATURE LIMIT EXCEEDED";
		transporter.sendMail(mailOptions);	
	}
	else if(func()<mod_temp){
	//	console.log(high_temp);		
		green.writeSync(1);
		buzz.writeSync(0);
		yellow.writeSync(0);
		red.writeSync(0);
	//	console.log(mod_temp);
		
	}
};
   




app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));

app.get('/',(req,res)=>{
	res.render("index.ejs");
});

app.post('/',(req,res)=>{
	high_temp=req.body.high_temp;
	mod_temp=req.body.mod_temp;
	interval =setInterval(callback,5000);
	res.redirect("/");
	
	
});

app.get('/startalarm',(req,res)=>{
	res.render("new.ejs");
});

app.get('/resetalarm',(req, res)=>{
	clearInterval(interval);
	green.writeSync(0);
	buzz.writeSync(0);
	yellow.writeSync(0);
	red.writeSync(0);
	res.redirect("/");
	
});

app.get('/temp',(req,res)=>{
	dhtsensor.read(22,18,(err,temp1,humid1)=>{
		if(err){
			console.log(err);
		}else{
			temp=temp1.toFixed(2);
			res.render("temp.ejs",{temp:temp})
		}
	});
});



app.get('/ledon/:id',(req, res)=>{
	color=req.params.id;
	if(color=="red"){		
		red.writeSync(1);
	}
	else if(color=="yellow"){		
		yellow.writeSync(1);
	}
	else if(color=="green"){		
		green.writeSync(1);
	}
	
	res.redirect("/");
});

app.get('/ledoff/:id',(req, res)=>{
	color=req.params.id;
	if(color=="red"){		
		red.writeSync(0);
	}
	else if(color=="yellow"){		
		yellow.writeSync(0);
	}
	else if(color=="green"){		
		green.writeSync(0);
	}
	res.redirect("/");
});

app.get('/buzz/buzzon',(req,res)=>{
	buzz.writeSync(1);
	res.redirect("/");
});

app.get('/buzz/buzzoff',(req,res)=>{
	buzz.writeSync(0);
	res.redirect("/");
});


app.listen(3000);




