//--------------------------------------------------------------------------//
//                                                                          //
//                    J S - I O B I O - C O M M O N                         //
//                                                                          //
//                                                                          //
// Permission is hereby granted, free of charge, to any person obtaining    //
// a copy of this software and associated documentation files (the          //
// "Software"), to deal in the Software without restriction, including      //
// without limitation the rights to use, copy, modify, merge, publish,      //
// distribute, sublicense, and/or sell copies of the Software, and to       //
// permit persons to whom the Software is furnished to do so, subject to    //
// the following conditions:                                                //
//                                                                          //
// The above copyright notice and this permission notice shall be           //
// included in all copies or substantial portions of the Software.          //
//                                                                          //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,          //
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF       //
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND                    //
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE   //
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION   //
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION    //
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.          //
//                                                                          //
//                                                                          //
// Author: Jon Anthony (2015)                                               //
//                                                                          //
//--------------------------------------------------------------------------//
//


// Yes, this is 'crazy', but checkout
// https://gist.github.com/jed/982883
//
// Returns a random v4 UUID of the form
// xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx, where each x is replaced with
// a random hexadecimal digit from 0 to f, and y is replaced with a
// random hexadecimal digit from 8 to b.
function makeuid (a) {
  return a ?
    (a^Math.random()*16>>a/4).toString(16) :
    ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,makeuid)
}


function backstream (service, uid, cbfn) {
  console.log("Backstream: ", service, uid);
  var bsclient = BinaryClient(service);
  var callThis = this;
  bsclient.on(
    'open',
    function(){
      console.log(">>> BS - Connection!");
      var stream = bsclient.createStream(
        {event: 'setID',
         connectionID: uid});
      stream.end();
      stream.destroy();
    });
  bsclient.on(
    'stream',
    function(stream,opts){
      cbfn.call(callThis, stream, opts, bsclient)
    });
}

function doService (service, url, cbfn) {
  console.log("doService: ", service);
  var srvclient = BinaryClient(service);
  var callThis = this;

  srvclient.on(
    'open',
    function(){
      console.log(">>> Srv - Connection!", url)
      var stream = srvclient.createStream(
        {event:'run',
         params: {url: url}});

      stream.on('data', function(data) {
        //console.log("!!! Got Data");
        if (data == undefined) return;
        cbfn.call(callThis, data);
      });

      stream.on('uerror', function(data) {
        console.log("**** Got Error", data);
        console.log("     *** " + data.info.type + ": " +
                    data.info.info.id + ", " + data.info.info.msg);
        if (data.type == 'alert') {
          alert(e.info);
        };
      });

      stream.on('end', function() {
        stream.destroy();
        //srvclient.close();
        cbfn.call(callThis, undefined);
      });
    });
}
