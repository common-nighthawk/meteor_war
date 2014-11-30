Cards = new Mongo.Collection("cards");
Rounds = new Mongo.Collection("rounds");

var cardValues = [14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
var cardSuits = ["Hearts", "Diamond", "Spades", "Clubs"];
var cardNames = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"]

if (Meteor.isClient) {
  function getRound () {
		return Rounds.find({}, {sort: {createdAt: -1}}).fetch()[0];
	}
	function isPlayer1Turn () {
    if (Rounds.find({}).count() === 0) {
			return true
		} else if (getRound().player1 !== null && getRound().player2 !== null) {
			console.log(getRound());
			return true
		} else {
			return false
		}
	}
	
  Template.body.helpers({
    cards: function () {
      return Cards.find();
    } 
  });

  Template.newgame.events({
    'click button': function () {
			Meteor.call('removeAllCards');
      Meteor.call('removeAllRounds');
			Meteor.call('dealCards', cardValues, cardSuits, cardNames);
    }
  });

  Template.showcards.events({
    "click .play-card": function () {
      if (isPlayer1Turn())  {
				if (Meteor.user().username === 'player1') {
				  Rounds.insert({player1: this._id, player2: null, createdAt: new Date()});
			  } else {
					Meteor.call('wrongTurnAlert');
				}
			} else {
				if (Meteor.user().username === 'player2') {
				  Rounds.update(getRound()._id, { $set: { player2: this._id} });
					
					var p1cardnum = getRound().player1;
					var p2cardnum = getRound().player2;
					var p1card = Cards.find({_id: p1cardnum}).fetch()[0];
					var p2card = Cards.find({_id: p2cardnum}).fetch()[0];

					if (p1card.value === p2card.value) {
						if ((Math.floor(Math.random() * 6) + 1) % 2 === 0) {
							Meteor.call("updateWithWin", 'player1', getRound()._id, p1cardnum, p2cardnum);
						} else {
							Meteor.call("updateWithWin", 'player2', getRound()._id, p1cardnum, p2cardnum);
						}
					}
					else if (p1card.value > p2card.value) {
						Meteor.call("updateWithWin", 'player1', getRound()._id, p1cardnum, p2cardnum);
					} else {
						Meteor.call("updateWithWin", 'player2', getRound()._id, p1cardnum, p2cardnum);
					}
			  } else {
					Meteor.call('wrongTurnAlert');
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
    cardCount: function () {
			return Cards.find({owner: Meteor.user().username}).count();
		},
		lastwinner: function() {
      return getRound().winner;
		},
	  p1card: function() {
			var p1card = Cards.find({_id: getRound().player1}).fetch()[0];
			if (isPlayer1Turn()) {
				return p1card.name + " of " + p1card.suit;
	    }
		},
	  p2card: function() {
			var p2card = Cards.find({_id: getRound().player2}).fetch()[0];
			if (isPlayer1Turn()) {
				return p2card.name + " of " + p2card.suit;
	    }
		}
	});

	Template.playerturn.helpers({
    playerTurn: function () {
		 if (isPlayer1Turn()) {
			 return 'Player 1'
		 } else {
			 return 'Player 2'
     }
		}
	});

	Accounts.ui.config({
  	passwordSignupFields: "USERNAME_ONLY"
	});
}


Meteor.methods({ 
  updateWithWin: function (winnerName, roundID, p1CardID, p2CardID) { 
		Cards.update(p1CardID, { $set: { owner: winnerName} });
		Cards.update(p2CardID, { $set: { owner: winnerName} });
		Rounds.update(roundID, { $set: { winner: winnerName} });
	},
	dealCards: function (cardValues, cardSuits, cardNames) {
		for (i=0; i<cardValues.length; i++) {
			for (j=0; j<cardSuits.length; j++) {
				var player = 'player'+((j % 2) + 1);
				Cards.insert({name: cardNames[i], value: cardValues[i], suit: cardSuits[j], owner: player});
			}
		}
	},
	wrongTurnAlert: function () {
		alert('It is not your turn to play.  Please wait patiently :)');
	}
});



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
