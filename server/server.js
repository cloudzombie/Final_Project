var Twilio = Meteor.npmRequire('twilio');
twilio = Twilio("ACfa2a1eda04556b7fdc62a22dc4eeca1c", "39acc944d5cac04f42114d49ffa635b6");
// Specify which collections are sent to the client
Meteor.publish("groups", function () {
    return Groups.find({
        owner: this.userId
    });
});
Meteor.publish('unsorted', function () {
    return Unsorted.find();
});
Meteor.publish('products', function () {
    return Products.find();
});
Meteor.publish('messagesrec', function () {
    return MessagesRec.find();
});
Meteor.publish('messagessent', function () {
    return MessagesSent.find();
});


Meteor.methods({
    deleteProduct: function (id) {
        Products.remove({
            _id: id,
        })
    },
    saveSentMsg: function (message) {
        MessagesSent.insert({
            message: message,
            time: new Date(),
        });
    },

    saveRecMsg: function (response, phone, time) {
        MessagesRec.insert({
            response: response,
            number: phone,
            time: time,
        });
    },

    addProduct: function (desc, name, price, type, vend, qty) {
        Products.insert({
            type: type,
            name: name,
            description: desc,
            price: price,
            vendor: vend,
            quantity: qty,
            createdAt: new Date(),
        });
    },

    addCustomer: function (name, number, email, city, zip) {
        Unsorted.insert({
            name: name,
            number: number,
            email: email,
            city: city,
            zip: zip,
            createdAt: new Date(),
            checked: false,
        });
    },

    addGroup: function (name) {
        Groups.insert({
            name: name,
            createdAt: new Date(),
            owner: Meteor.userId(),
            checked: false,
            numbers: []
        });
    },
    addNumber: function (groupId, number) {
        Groups.update({
            _id: groupId
        }, {
            $addToSet: {
                numbers: {
                    "number": number,
                    "checked": true
                }
            }
        });
    },
    removeCustomer: function (number) {
        Unsorted.remove({
            number: number
        });

    },
    deleteGroup: function (groupId) {
        Groups.remove({
            _id: groupId
        });
    },
    deleteNumber: function (groupId, number) {
        Groups.update({
            _id: groupId
        }, {
            $pull: {
                numbers: {
                    "number": number
                }
            }
        });
    },
    toggleGroup: function (groupId, toggle) {
        Groups.update({
            _id: groupId
        }, {
            $set: {
                checked: toggle
            }
        });
        // Find every number that differs from Group's "checked" boolean
        var numbers =
            Groups.find({
                numbers: {
                    $elemMatch: {
                        "checked": !toggle
                    }
                }
            });
        // Set all numbers to match Group's "checked" boolean
        numbers.forEach(function (setter) {
            for (var index in setter.numbers) {
                Groups.update({
                    _id: groupId,
                    "numbers.number": setter.numbers[index].number
                }, {
                    $set: {
                        "numbers.$.checked": toggle
                    }
                });
            }
        });
    },
    toggleNumber: function (groupId, number, toggle) {
        Groups.update({
            _id: groupId,
            "numbers.number": number
        }, {
            $set: {
                "numbers.$.checked": toggle
            }
        });
    },
    sendMessage: function (outgoingMessage) {
        var phonebook = [];
        // Find all checked numbers across all groups
        var recipients =
            Groups.find({
                numbers: {
                    $elemMatch: {
                        "checked": true
                    }
                }
            });
        // Add each number from our query to our phonebook
        recipients.forEach(function (recipient) {
            for (var index in recipient.numbers) {
                phonebook.push(recipient.numbers[index].number);
            }
        });
        // Place all numbers in a Set so no number is texted more than once
        var uniquePhoneBook = new Set(phonebook);
        // Use Twilio REST API to text each number in the unique phonebook
        uniquePhoneBook.forEach(function (number) {
            HTTP.call(
                "POST",
                'https://api.twilio.com/2010-04-01/Accounts/ACfa2a1eda04556b7fdc62a22dc4eeca1c/SMS/Messages.json', {
                    params: {
                        From: '5622739750', // Your Twilio number. Use environment variable
                        To: number,
                        Body: outgoingMessage
                    },
                    // Set your credentials as environment variables 
                    // so that they are not loaded on the client
                    auth: 'ACfa2a1eda04556b7fdc62a22dc4eeca1c' + ':' +
                        ' 39acc944d5cac04f42114d49ffa635b6'
                },
                // Print error or success to console
                function (error) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('SMS sent successfully.');
                    }
                }
            );
        });
    }
});