Router.route('/sms', function () {

    console.log('so far so good...');
    var textResp = this.request.body.Body;
    var userPhone = this.request.body.From.substr(2);
    var city = this.request.body.FromCity;
    var zip = this.request.body.FromZip;
    var time = new Date();
    console.log(userPhone, textResp, city, zip, time);
    Meteor.call('addCustomer', 'change', userPhone, 'change@change.com', city, zip);
    Meteor.call('saveRecMsg', textResp, userPhone, time);
    var demo = textResp.toLowerCase();
    if (demo == 'oscar' || demo == 'oscar ' || demo == ' oscar' || demo == ' oscar ') {
        xml = "<Response><Sms>Great meeting you! Add me on linkedin: https://www.linkedin.com/in/oscarxpena | email: oscarxpena@gmail.com </Sms></Response>"
    } else if (demo == 'out') {
        xml = "<Response><Sms>You have been removed from our texting list.</Sms></Response>"
        Meteor.call('removeCustomer', userPhone);
    } else {
        xml = "<Response><Sms>Oops, no response for that! Try texting 'Oscar' instead. </Sms></Response>";
    }
    this.response.writeHead(200, {
        'Content-Type': 'text/xml'
    });
    return this.response.end(xml);

}, {
    where: 'server'
});

Router.route('/', function () {
    if (Session.get('verified') == 'true') {

        this.render('/home');
    } else {
        this.render('ageVer');
    }
});

Router.route('/home', function () {
    this.render('home');
});

Router.route('/admin', function () {
    if (Meteor.userId() == 'rKr5TzrnSTMqNswzK') {
        this.render('admin');
        return false;
    } else {
        Router.go('/home');
    }
});

Router.route('/zibzubza', function () {
    this.render('zibzubza');
});

Router.route('/textme', function () {
    this.render('textme');
});