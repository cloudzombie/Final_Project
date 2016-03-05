Router.route('/sms', function () {

    console.log('so far so good...');
    var textResp = this.request.body.Body;
    var userPhone = this.request.body.From.substr(2);
    var city = this.request.body.FromCity;
    var zip = this.request.body.FromZip;
    var time = new Date();
    console.log(userPhone, textResp, city, zip, time);
    Meteor.call('addCustomer', 'replace', userPhone, 'replace@blank.com', city, zip);
    xml = "<Response><Sms>Welcome to The House! Text STOP to opt out at anytime.</Sms></Response>";
    this.response.writeHead(200, {
        'Content-Type': 'text/xml'
    });
    return this.response.end(xml);

}, {
    where: 'server'
});

Router.route('/admin', function () {
    this.render('admin');
});

Router.route('/home', function () {
    this.render('home');
});

Router.route('/', function () {
    this.render('enter');
});