AWS = require("aws-sdk")
Q = require("q")
s3 = new AWS.S3()
sns = new AWS.SNS();
s3_utilities = require("s3_utilities")

exports.info = (event, context, callback) => {
	console.log(event)
    switch(event.directory)
    {
        case 0:
            prefix = process.env["masters_prefix"]
            break;
        case 1:
            prefix = process.env["watermarked_prefix"]
            break;
        default:
            throw "Invalid folder";
    }

	s3u = new s3_utilities({bucket: process.env["bucket"], prefix: prefix})
	
	s3u.objects_walk({count: 0, size: 0}, get_data, callback)
    	
    function get_data(previous_result, s3_data, cb)
    {
        result = previous_result
        
        for(i=0;i<s3_data.Contents.length;i++)
        {
            extension = s3_data.Contents[i].Key.split('.').pop().toUpperCase()
            
            if(extension=="JPEG" || extension=="JPG")
            {
                result.size += s3_data.Contents[i].Size
                result.count ++
            }
        }
        
        cb(null,result)        
    }
}

exports.empty = (event, context, callback) => {

	s3u = new s3_utilities({bucket: process.env["bucket"], prefix: process.env["watermarked_prefix"]})
	
	s3u.objects_walk([], get_data, callback)
    	
    function get_data(previous_result, s3_data, cb)
    {
        result = []
        
        for(i=0;i<s3_data.Contents.length;i++)
            result.push({Key: s3_data.Contents[i].Key})

        if(result.length)
        {
            params = {
                Bucket: process.env["bucket"],
                Delete: {
                    Objects: result
                }
            }
            
            s3.deleteObjects(params,function(err,data)
            {
                if(!err)
                    cb(null,{result: 1})            
                else
                    cb(err)            
            }
            )
        }
        else
            cb(null, {result:1})
    }
}


exports.start = (event, context, callback) => {

	s3u = new s3_utilities({bucket: process.env["bucket"], prefix: process.env["masters_prefix"]})
	
	Q.npost(s3u, "objects_walk",[[], prepare_messages])
	.then(send_messages)
	.then(finish)
	.catch(error_handler)
	.done()
	
	function error_handler(err)
	{
	    callback(err)
	}
	
	function send_messages(data)
	{
        return Q.all(data)
	}
    	
    function finish(data)
    {
        callback(null, {result:1})
    }
    
    function prepare_messages(previous_result, s3_data, cb)
    {
        result = previous_result

        for(i=0;i<s3_data.Contents.length;i++)
        {
            extension = s3_data.Contents[i].Key.split('.').pop().toUpperCase()
            
            if(extension=="JPEG" || extension=="JPG")
            {
                var params = {
                  Message: s3_data.Contents[i].Key.split(process.env["masters_prefix"])[1],
                  Subject: 'New watermarking',
                  TopicArn: process.env["sns_waterwarking_sns_arn"]
                };                
                
                result.push(Q.npost(sns,"publish",[params]))
            }            
        }
        cb(null, result)
    }
}