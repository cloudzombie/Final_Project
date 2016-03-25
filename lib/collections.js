//collection for new groups
Groups = new Mongo.Collection("groups");

//collection for new customers to be added to groups
Unsorted = new Mongo.Collection('unsorted');

//collection for products
Products = new Mongo.Collection('products');

//collection for messages received
MessagesRec = new Mongo.Collection('messagesrec');

//collection for messages sent
MessagesSent = new Mongo.Collection('messagessent');