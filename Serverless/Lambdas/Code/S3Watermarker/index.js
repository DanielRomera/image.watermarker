var gm=require('gm').subClass({ imageMagick: true });
var fs=require("fs")
var https = require("https")
var AWS=require("aws-sdk")
var s3 = new AWS.S3();


exports.handler = (event, context, callback) => {
    
    if(event.Records && event.Records[0] && event.Records[0].Sns)
        src_filename = event.Records[0].Sns.Message
    else if(event.Records && event.Records[0] && event.Records[0].s3.object.key)
        src_filename = event.Records[0].s3.object.key.split(process.env["masters_prefix"])[1]
    
    console.log(src_filename)
    
    try
    {
        file=fs.createWriteStream("/tmp/logo.png")
        var request = https.get(process.env["watermark"], function(response) {
            response.pipe(file);
    
            file.on("finish", function()
            {
    
                var params = {
              		Bucket: process.env["Bucket"],
              		Key: process.env["masters_prefix"]+src_filename,
            	};
            	
            	
            	s3.getObject(params, function(err,data)
            	{
            	    if(err)
            	        callback(err)
            	    else
            	    {
                	    gm(data.Body)
                        .gravity('SouthEast')
                        .draw(['image over 0,0 0,0 "/tmp/logo.png"'])
                        .toBuffer(function(err, buffer){
                            if(err)
                                callback(err)
                            data = {
                  		        Bucket: process.env["Bucket"],
                  		        Key: process.env["watermarked_prefix"]+src_filename,
                    			Body: buffer,
                    			ContentType: "image/jpeg"
                            }
                            s3.putObject(data,function(err,d){
                                if(err)
                                    callback(err)
                                else
                                    callback(null,{result: 1})
                            })
                            
                        })
            	    }
            	}
            	);
    
                
            }
            )
        });    
    
    }
    catch(e)
    {
        callback(e)
    }
    
};