Cards = new Mongo.Collection("cards");
Rounds = new Mongo.Collection("rounds");

if (Meteor.isClient) {
  Template.body.helpers({
    cards: function () {
      return Cards.find();
    } 
  });

  Template.newgame.events({
    'click button': function () {
			Meteor.call('removeAllCards');
      Meteor.call('removeAllRounds');

			cardValues = ["14Ace", "02Two", "03Three", "04Four", "05Five", "06Six", "07Seven", "08Eight", "09Nine", "10Ten", "11Jack", "12Queen", "13King"];
			cardSuits = ["Hearts", "Diamond", "Spades", "Clubs"];

			for (i=0; i<cardValues.length; i++) {
				for (j=0; j<cardSuits.length; j++) {
          var player = 'player'+((j % 2) + 1);
					Cards.insert({value: cardValues[i], suit: cardSuits[j], owner: player});
				}
			}
    }
  });

  Template.showcards.events({
    "click .play-card": function () {
			alert('hit');
      if (!Rounds.findOne()) {
  	    alert('this is the first round of the game!');	
				Rounds.insert({player1: this.value, player2: null});
			} else if (Rounds.findOne().player1 !== null && Rounds.findOne().player2 === null) {
				alert('pop!');
				Rounds.update(Rounds.findOne()._id, { $set: { player2: this.value} });
			} else if () {
        alert(Rounds.find().limit(1).sort({$natural:-1})[0].player1 !== null && Rounds.find().limit(1).sort({$natural:-1})[0].player2 !== null
        alert('player 2 just went, yo!');
				Rounds.insert({player1: this.value, player2: null});
			} else {
				alert(Rounds.find().limit(1).sort({$natural:-1})[0].player1 !== null);
			}
    }
	});

	Template.showcards.helpers({
    isOwner: function () {
      return this.owner === Meteor.user().username;
     }
	});

	Template.playerturn.helpers({
    pt: function () {
			if (!Rounds.findOne()) {
        return 'player1';
			} else if (Rounds.findOne().player1 === null) {	
				return 'player1';
			} else if (Rounds.findOne().player1 !== null && Rounds.findOne().player2 === null) {
				return 'player2';
			} else if (Rounds.findOne().player1 !== null && Rounds.findOne().player2 !== null) {
				return 'player1';
			}
     }
	});

	Accounts.ui.config({
  	passwordSignupFields: "USERNAME_ONLY"
	});
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    return Meteor.methods({
      removeAllCards: function() {
        return Cards.remove({});
      },
      removeAllRounds: function() {
        return Rounds.remove({});
      }
    });
  });
}
