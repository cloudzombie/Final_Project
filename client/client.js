// Specify which collections from the server the client subscribes to
Meteor.subscribe("groups");
Meteor.subscribe('unsorted');
Meteor.subscribe('products');
Meteor.subscribe('messagesrec');
Meteor.subscribe('messagessent');
//twilio number (562) 273-9750

Template.admin.helpers({
    groups: function () {
        // Find all groups and list the newest groups first
        return Groups.find({}, {
            sort: {
                createdAt: -1
            }
        });
    },
    unsorted: function () {
        // Find all unsorted customers and list the newest ones first
        return Unsorted.find({}, {
            sort: {
                createdAt: -1
            }
        });
    },

    products: function () {
        // Find all products and list the newest ones first
        return Products.find({}, {
            sort: {
                createdAt: -1
            }
        });
    },

    messagesrec: function () {
        // Find all received messages and list the newest ones first
        return MessagesRec.find({}, {
            sort: {
                time: -1
            }
        });
    },
    messagessent: function () {
        // Find all sent messages and list the newest ones first
        return MessagesSent.find({}, {
            sort: {
                time: -1
            }
        });
    },

});

Template.messagewizard.helpers({
    products: function () {
        // Find all products and list the newest ones first
        return Products.find({}, {
            sort: {
                createdAt: -1
            }
        });
    }
});

Template.messagewizard.events({
    //collects information entered into the offer wizard and creates a sample message
    "submit .new-wiz": function (event) {
        var prodSelect = event.target.productSelect.value;
        var offerLocation = event.target.location.value;
        var offerDiscount = event.target.discount.value;
        var offerEnds = event.target.offerend.value;
        var msgtxt = "New Offer! " + prodSelect + " " + offerDiscount + " only at " + offerLocation + " . Offer ends " + offerEnds;
        event.target.message.value = msgtxt;
        console.log(msgtxt);
        return false;
    }
});

Template.productform.events({
    //colelcts entered into product form
    "submit .new-product": function (event) {
        var newProdName = event.target.prodname.value;
        var newProdVend = event.target.prodvend.value;
        var newProdDesc = event.target.proddesc.value;
        var newProdPrice = event.target.prodprice.value;
        var newProdQty = event.target.quantSel.value;
        var newProdType = event.target.prodtype.value;

        //check to ensure all fields were entered
        if (newProdDesc !== '' && newProdName !== '' && newProdPrice !== '' && newProdVend !== '' && newProdType !== '') {
            //creates new product if all fields valid
            Meteor.call('addProduct', newProdDesc, newProdName, newProdPrice, newProdType, newProdVend, newProdQty);
        }

        //resets field values to be blank after submission
        event.target.prodname.value = '';
        event.target.prodvend.value = '';
        event.target.proddesc.value = '';
        event.target.prodprice.value = '';
        event.target.prodtype.value = '';
        event.target.prodqty.value = '';
        return false;

    }

});


Template.admin.events({
    "submit .new-group": function (event) {
        // Grab group name from text field
        var newGroup = event.target.group.value;
        // Check that text field is not blank before adding group
        if (newGroup !== '') {
            Meteor.call("addGroup", newGroup);
        }
        // Clear the text field for next entry
        event.target.group.value = "";
        // Prevent default form submit
        return false;
    },
    "submit .new-number": function (event) {
        // Grab phone number from text field
        var newNumber = event.target.number.value;
        // Check that text field is not blank before adding number
        if (newNumber !== '') {
            Meteor.call("addNumber", this._id, newNumber);
        }
        // Clear the text field for next entry
        event.target.number.value = "";
        // Prevent default form submit
        return false;
    },
    "submit .new-text": function (event) {
        // Grab text message from text field
        var newMessage = event.target.message.value;
        console.log(newMessage);
        // Check that message field is not blank before sending texts
        if (newMessage !== '') {
            Meteor.call("sendMessage", newMessage);
            Meteor.call("saveSentMsg", newMessage);
        }
        // Clear the text field
        event.target.message.value = "";
        alert('Your message is being sent!');
        // Prevent default form submit
        return false;
    },
    "click .delete-product": function () {
        // Remove a group from our collection
        Meteor.call("deleteProduct", this._id);
    },
    "click .delete-customer": function () {
        // Remove a group from our collection
        Meteor.call("removeCustomer", this.number);
    }
});

Template.group.events({
    "click .toggle-group": function () {
        // Set the checked property to the opposite of its current value
        Meteor.call("toggleGroup", this._id, !this.checked);
    },
    "click .toggle-number": function () {
        // Get the number's group data
        var data = Template.instance().data;
        // Set the checked property to the opposite of its current value
        Meteor.call("toggleNumber", data._id, this.number, !this.checked);
    },
    "click .delete-group": function () {
        // Remove a group from our collection
        Meteor.call("deleteGroup", this._id);
    },
    "click .delete-number": function () {
        // Get the number's group data
        var group = Template.instance().data;
        // Remove a number from a particular group
        Meteor.call("deleteNumber", group._id, this.number);
    }
});

Template.newCustomer.events({
    //grabs field inputs from new customer form
    'submit .new-customer': function (event) {
        var name = event.target.custName.value;
        var number = event.target.custNumber.value;
        var email = event.target.custEmail.value;
        if (name !== '' && number !== '' && email !== '') {
            //adds new customer via hard entry
            Meteor.call('addCustomer', name, number, email);
        }
        //sets fields to blanka fter submission
        event.target.custName.value = '';
        event.target.custNumber.value = '';
        event.target.custEmail.value = '';
        return false;
    }
});

Template.ageVer.events({
    //sets ageverification in browser local storage
    'change.setver input': function () {

        Session.set('verified', 'true');
        console.log(Session.get('verified'));
        Router.go('/home');
        return false;

    }
});

Template.home.events({
    //grabs customer information from front page
    'submit .capturecust': function () {
        var numberTyped = event.target.custnumber.value;
        //regex to ensure number is captured regardless of input format
        var number = numberTyped.replace(/-|\.|\(|\)|\s/g, '');
        if (number !== '' && number.length == 10) {
            console.log(number);
            //add customer to unsorted collection
            Meteor.call('addCustomer', 'change', number, 'change@chnage.com', 'change', 'change');
            //send confirmation message
            Meteor.call('sendMessage', 'Welcome to the MMJ Boulder mailing list! Text OUT to leave at anytime.');
        } else {
            //error message
            event.target.custnumber.value = '';
            event.target.errmsg.placeholder = 'Error: please enter a 10 digit phone number';
            event.target.errmsg.size = '70';
            event.target.errmsg.type = '';
            return false;
        }
        //success message
        event.target.custnumber.value = '';
        event.target.errmsg.placeholder = 'You\'ve been subscribed!';
        event.target.errmsg.size = '20';
        event.target.errmsg.type = '';
        return false;

    }
});