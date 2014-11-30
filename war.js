Cards = new Mongo.Collection("cards");
Rounds = new Mongo.Collection("rounds");

var cardValues = [14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
var cardSuits = ["Hearts", "Diamond", "Spades", "Clubs"];
var cardName = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"]

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

			for (i=0; i<cardValues.length; i++) {
				for (j=0; j<cardSuits.length; j++) {
          var player = 'player'+((j % 2) + 1);
					Cards.insert({name: cardName[i], value: cardValues[i], suit: cardSuits[j], owner: player});
				}
			}
    }
  });

  Template.showcards.events({
    "click .play-card": function () {
      if (!Rounds.findOne())  {
				if (Meteor.user().username === 'player1') {
				  Rounds.insert({player1: this._id, player2: null});
			  } else {
				  alert('It is not your turn to play.  Please wait patiently :)');
				}
			} else if (Rounds.find({}, {sort: {_id: -1}}).fetch()[0].player1 !== null && Rounds.find({}, {sort: {_id: -1}}).fetch()[0].player2 === null) {
				if (Meteor.user().username === 'player2') {
				  Rounds.update(Rounds.find({}, {sort: {_id: -1}}).fetch()[0]._id, { $set: { player2: this._id} });
					
					var thisround = Rounds.find({}, {sort: {_id: -1}}).fetch()[0]
					var p1cardnum = thisround.player1;
					var p2cardnum = thisround.player2;
					var p1card = Cards.find({_id: p1cardnum}).fetch()[0];
					var p2card = Cards.find({_id: p2cardnum}).fetch()[0];

					if (p1card.value === p2card.value) {
						alert('Tie')
							if ((Math.floor(Math.random() * 6) + 1) % 2 === 0) {
								Cards.update(p1cardnum, { $set: { owner: 'player1'} });
								Cards.update(p2cardnum, { $set: { owner: 'player1'} });
								Rounds.update(thisround._id, { $set: { winner: 'player1'} });
					    } else {
								Cards.update(p1cardnum, { $set: { owner: 'player2'} });
								Cards.update(p2cardnum, { $set: { owner: 'player2'} });
								Rounds.update(thisround._id, { $set: { winner: 'player2'} });
							}
					}
					else if (p1card.value > p2card.value) {
						alert('Player 1 Won That Round!');
				    Cards.update(p1cardnum, { $set: { owner: 'player1'} });
				    Cards.update(p2cardnum, { $set: { owner: 'player1'} });
						Rounds.update(thisround._id, { $set: { winner: 'player1'} });
					} else {
						alert('Player 2 Won That Round!');
				    Cards.update(p1cardnum, { $set: { owner: 'player2'} });
				    Cards.update(p2cardnum, { $set: { owner: 'player2'} });
						Rounds.update(thisround._id, { $set: { winner: 'player2'} });
					}
			  } else {
				  alert('It is not your turn to play.  Please wait patiently :)');
				}
			} else if (Rounds.find({}, {sort: {_id: -1}}).fetch()[0].player1 !== null && Rounds.find({}, {sort: {_id: -1}}).fetch()[0].player2 !== null) {
				if (Meteor.user().username === 'player1') {
				  Rounds.insert({player1: this._id, player2: null});
			  } else {
				  alert('It is not your turn to play.  Please wait patiently :)');
				}
			}
    }
	});

	Template.showcards.helpers({
    isOwner: function () {
      return this.owner === Meteor.user().username;
     }
	});

	Template.showresults.helpers({
    countyou: function () {
			var youUser = Meteor.user().username;
			var count = Cards.find({owner: youUser}).count();
			return count;
		},
		lastwinner: function() {
      return Rounds.find({}, {sort: {_id: -1}}).fetch()[0].winner;
		},
	  p1card: function() {
			var thisround = Rounds.find({}, {sort: {_id: -1}}).fetch()[0]
			var p1cardnum = thisround.player1;
			var p1card = Cards.find({_id: p1cardnum}).fetch()[0];
			if (thisround.player1 !== null && thisround.player2 !== null) {
				return p1card.name + " of " + p1card.suit;
	    }
		},
	  p2card: function() {
			var thisround = Rounds.find({}, {sort: {_id: -1}}).fetch()[0]
			var p2cardnum = thisround.player2;
			var p2card = Cards.find({_id: p2cardnum}).fetch()[0];
			if (thisround.player1 !== null && thisround.player2 !== null) {
				return p2card.name + " of " + p2card.suit;
	    }
		}
	});

	Template.playerturn.helpers({
    pt: function () {
			if (!Rounds.findOne()) {
        return 'player1';
			} else if (Rounds.find({}, {sort: {_id: -1}}).fetch()[0].player1 === null) {	
				return 'player1';
			} else if (Rounds.find({}, {sort: {_id: -1}}).fetch()[0].player1 !== null && Rounds.find({}, {sort: {_id: -1}}).fetch()[0].player2 === null) {
				return 'player2';
			} else if (Rounds.find({}, {sort: {_id: -1}}).fetch()[0].player1 !== null && Rounds.find({}, {sort: {_id: -1}}).fetch()[0].player2 !== null) {
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
