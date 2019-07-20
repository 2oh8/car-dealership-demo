module.exports = {
    init(){
      if (!process.env.REDIRECTOR_PORT) {
        console.log(`No redirector port specified, http to https redirection disabled.`);
        return;
      }
  
      var redirector = require(`http`);
      var redirectPort = process.env.REDIRECTOR_PORT;
      redirector.createServer(onRedirect).listen(redirectPort, function () {
        console.log(`Redirector running on port: ${redirectPort}`);
      });
  
      function onRedirect(req, res) {
        console.log(`INCOMING REQUEST on port ${redirectPort}: ${req.url}`);
        var host = req.headers.host;
        if (host.indexOf(`:`) > 1) {
          host = req.headers.host.substring(0, host.indexOf(`:`));
        }
        var redirectUrl = `https://${host}${req.url}`;
        console.log(`Redirect to ${redirectUrl}`);
        res.writeHead(301, { Location: redirectUrl });
        res.end();
      }
    }
  };