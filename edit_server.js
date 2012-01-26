var editor = 'mcvim';
var editorArgs = ['-f'];
var http = require("http");
http.createServer(function(req, res) {
  if (req.method != "POST") {
    res.writeHead(500, {'Content-type': 'text/plain'});
    res.end('Expecting a POST request');
  } else {
    // read POST data
    var data = '';
    req.on('data', function(chunk) {
      data += chunk;
      console.log("catching chunks", chunk);
    });

    req.on('end', function() {
      // create temporary file and writeStream
      var fs = require('fs');
      var tmp_file_name = "/tmp/chrome-text-" + new Date().toISOString();
      fs.writeFile(tmp_file_name, data, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("wrote data", data);
          var spawn = require("child_process").spawn;
          //var ed = spawn(editor, editorArgs.push(tmp_file_name));
          var ed = spawn('mvim', ['-f', tmp_file_name]);
          ed.on('exit', function(code) {
            console.log("editor closed");
            if (code == 0) {
              fs.readFile(tmp_file_name, function(err, data) {
                if(err) {
                  console.error("Could not open file: %s", err);
                  process.exit(1);
                }
                res.writeHead(200, {'Content-type': 'text/plain'});
                res.end(data);
              });
            }
          });
        }
      });
    });
  }
}).listen(1337, "127.0.0.1");
console.log("Server running at http://127.0.0.1:1337/");
